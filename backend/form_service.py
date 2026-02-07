import asyncio
from typing import Any

import httpx
from loguru import logger

from .fpl_service import FPLService

LUCK_RATIO_THRESHOLD = 2.0
UNDERPERFORM_RATIO_THRESHOLD = 0.8


class FormService:
    def __init__(self):
        self.fpl_service = FPLService()

    async def get_form_analysis_data(self) -> list[dict[str, Any]]:
        """
        Analyzes all players to find those in 'good form' and classifies the sustainability of that form.
        """
        bootstrap = await self.fpl_service.get_bootstrap_static()
        elements = bootstrap["elements"]
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # Filter for "In Form" players
        # Criteria: 'form' > 3.0 (FPL metric) OR Total Points > 50 (top performers)
        # We want to catch mid-tier players too, so let's stick to the 'form' attribute mostly.
        # FPL 'form' is points per match over last 30 days.

        candidates = [
            p
            for p in elements
            if float(p["form"]) > 3.5 or (float(p["event_points"]) >= 8)  # High form or recent haul
        ]

        logger.info(f"Analyzing form for {len(candidates)} candidates")

        results = []

        # We need historical data for these players to calculate streak duration and xG delta
        # Use a semaphore to limit concurrent requests
        sem = asyncio.Semaphore(10)

        async def analyze_player(player):
            async with sem:
                try:
                    summary = await self.fpl_service.get_player_summary(player["id"])
                    history = summary.get("history", [])

                    if not history:
                        return None

                    # Reverse history to look from most recent backwards
                    history_rev = sorted(history, key=lambda x: x["round"], reverse=True)

                    # 1. Calculate Streak Duration
                    streak_games = 0
                    streak_points = 0
                    streak_xg = 0.0
                    streak_goals = 0
                    streak_assists = 0

                    # Define a "return" as > 2 points (goal, assist, saves, spread, clean sheet w/ 60 mins)
                    # Or just general "good performance".
                    # The paper defines form as a deviation from baseline.
                    # Let's count consecutive games with > 2 points OR specific high value returns.
                    # Simple metric: Consecutive games with >= 3 points? Or just "Active Streak" window.

                    # Let's count the window where they have been "performing".
                    # We can iterate backwards until we hit a "dry patch".
                    # Dry patch = 2 consecutive blanks (<= 2 points).

                    blanks_tolerance = 1
                    blanks_seen = 0

                    match_data_in_window = []

                    for match in history_rev:
                        pts = match["total_points"]
                        is_blank = pts <= 2

                        if is_blank:
                            blanks_seen += 1
                            if blanks_seen > blanks_tolerance:
                                break
                        streak_games += 1
                        streak_points += pts
                        streak_xg += float(match.get("expected_goals", 0))
                        streak_goals += match["goals_scored"]
                        streak_assists += match["assists"]
                        match_data_in_window.append(match)

                    if streak_games < 3:
                        # Not really a streak worth analyzing yet
                        return None

                    # 2. Sustainability Metrics
                    # xG Delta
                    xg_delta = streak_goals - streak_xg

                    # Classification
                    # "Sustainable": High xG involved (even if delta is 0). Means they are getting chances.
                    # "Lucky/variance": High Delta (Goals >> xG).
                    # "System Fit": Moderate Delta, High Assists/Involvement? (Not easily measurable without xA)

                    classification = "Sustainable"
                    sustainability_score = 75  # 0-100
                    reason = []

                    # Luck Factor
                    if streak_goals > 0 and streak_xg > 0:
                        ratio = streak_goals / streak_xg
                        if ratio > LUCK_RATIO_THRESHOLD:
                            classification = "Lucky / Overperforming"
                            sustainability_score -= 30
                            reason.append(f"Overperforming xG by {ratio:.1f}x")
                        elif ratio < UNDERPERFORM_RATIO_THRESHOLD:
                            classification = "Underperforming (Due)"
                            sustainability_score += 10
                            reason.append("Underperforming xG (Good signs)")

                    # Streak Length Risk (Regression to Mean)
                    if streak_games >= 8:
                        sustainability_score -= 15
                        reason.append("Streak entering extended phase (>8 games)")
                    elif streak_games >= 12:
                        classification = "Regression Imminent"
                        sustainability_score -= 30
                        reason.append("Historic max duration reached (>12 games)")

                    # Fixture Horizon (Next 3)
                    # We need the team's upcoming fixtures
                    # We assume get_player_summary might give fixtures, or we check global fixtures
                    # Optimization: We handle fixtures outside this loop or pass them in?
                    # FPLService.get_utils is not efficient.
                    # Let's assign an arbitrary difficulty check later or now.
                    # We can assume average difficulty for now or fetch.
                    # Let's skip detailed fixture difficulty per player inside this loop for speed,
                    # do it in the aggregation if needed, or pass the fixtures dict.

                    predicted_end_gw = "Unknown"
                    if streak_games < 5:
                        predicted_end_gw = "Uncertain"
                    elif streak_games >= 10:
                        predicted_end_gw = f"GW{match_data_in_window[0]['round'] + 1}"  # Next game

                    # Final Object
                    return {
                        "id": player["id"],
                        "code": player["code"],
                        "web_name": player["web_name"],
                        "photo": player["photo"],
                        "team_code": teams[player["team"]]["code"],
                        "team_short": teams[player["team"]]["short_name"],
                        "position": player["element_type"],
                        "streak_games": streak_games,
                        "streak_points": streak_points,
                        "xg_delta": round(xg_delta, 2),
                        "goals": streak_goals,
                        "expected_goals": round(streak_xg, 2),
                        "classification": classification,
                        "sustainability_score": max(0, min(100, sustainability_score)),
                        "reasons": reason,
                        "last_match_gw": history_rev[0]["round"],
                        "predicted_end_gw": predicted_end_gw,
                    }

                except (httpx.HTTPStatusError, httpx.RequestError) as e:
                    logger.error(f"Error analyzing form for {player['web_name']}: {e}")
                    return None
                except (KeyError, ValueError) as e:
                    logger.warning(f"Data error analyzing form for {player['web_name']}: {e}")
                    return None

        # Execute
        tasks = [analyze_player(p) for p in candidates]
        results = await asyncio.gather(*tasks)

        # Filter Nones
        results = [r for r in results if r is not None]

        # Sort by Sustainability? Or Heat?
        results.sort(key=lambda x: x["sustainability_score"], reverse=True)

        return results
