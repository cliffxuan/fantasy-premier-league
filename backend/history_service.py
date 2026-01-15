import asyncio
import io
import ast
from typing import Any, Dict, List, Optional

import httpx
import polars as pl
from loguru import logger

from .fpl_service import FPLService

REPO_BASE_URL = (
    "https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data"
)
SEASONS = ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"]


class HistoryService:
    _cache: Dict[str, Any] = {}
    _cache_lock = asyncio.Lock()

    def __init__(self):
        self.fpl_service = FPLService()

    async def get_h2h_history(
        self, team_h_id: int, team_a_id: int
    ) -> List[Dict[str, Any]]:
        # 1. Get current team details to find their names
        bootstrap = await self.fpl_service.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}

        home_team = teams.get(team_h_id)
        away_team = teams.get(team_a_id)

        if not home_team or not away_team:
            return []

        home_name = home_team["name"]
        away_name = away_team["name"]

        # 2. Fetch data for all seasons (cached)
        await self._ensure_history_data()

        history = []

        # 3. Search through seasons
        for season in SEASONS:
            season_data = self._cache.get(season)
            if not season_data:
                continue

            df_teams = season_data["teams"]
            df_fixtures = season_data["fixtures"]

            # Find team IDs in this season using Polars
            # We filter for the name
            try:
                # Assuming 'name' column exists and is string
                h_rows = df_teams.filter(pl.col("name") == home_name)
                a_rows = df_teams.filter(pl.col("name") == away_name)

                if h_rows.height == 0 or a_rows.height == 0:
                    continue

                s_home_id = h_rows[0, "id"]
                s_away_id = a_rows[0, "id"]
            except Exception as e:
                logger.warning(f"Error finding teams in {season}: {e}")
                continue

            # Filter fixtures
            # We want matches where (team_h == s_home_id AND team_a == s_away_id) OR vice versa
            try:
                # Ensure ID columns are int for comparison, assuming they loaded as int or we cast
                # CSV reading might infer them as int, but let's be safe if they are strings
                # The _fetch_season_data now returns Polars DF with infer_schema=True by default?
                # Or we cast.

                # Check dtypes if needed, but assuming standard inference work for "id", "team_h", "team_a"

                # Filter condition:
                # (team_h == s_home_id & team_a == s_away_id) | (team_h == s_away_id & team_a == s_home_id)
                # AND finished == True (converting string "True" or boolean)

                # Handle 'finished' column which might be boolean or string "True"/"False"
                # In CSV it is often string "True"

                # Check data types if needed.
                # Let's perform casting to be safe or just use flexible filter

                matches = df_fixtures.filter(
                    (
                        (
                            (pl.col("team_h") == s_home_id)
                            & (pl.col("team_a") == s_away_id)
                        )
                        | (
                            (pl.col("team_h") == s_away_id)
                            & (pl.col("team_a") == s_home_id)
                        )
                    )
                )

                if matches.height == 0:
                    continue

                # Iterate rows
                for row in matches.iter_rows(named=True):
                    # Check finished status
                    is_finished = str(row.get("finished", "")).lower() == "true"
                    if not is_finished:
                        continue

                    h_id = row["team_h"]
                    # a_id = row["team_a"]

                    is_home_perspective = h_id == s_home_id

                    try:
                        score_h = (
                            int(row["team_h_score"])
                            if row["team_h_score"] is not None
                            else 0
                        )
                        score_a = (
                            int(row["team_a_score"])
                            if row["team_a_score"] is not None
                            else 0
                        )
                    except ValueError:
                        score_h = 0
                        score_a = 0

                    match_entry = {
                        "season": season,
                        "date": row["kickoff_time"],
                        "gameweek": row["event"],
                        "home_team": home_name if is_home_perspective else away_name,
                        "away_team": away_name if is_home_perspective else home_name,
                        "score_home": score_h,
                        "score_away": score_a,
                        "home_team_id": int(row["team_h"]),
                        "away_team_id": int(row["team_a"]),
                        "match_is_home": is_home_perspective,
                    }

                    # Parse Stats for Scorers if available
                    scorers_h = []
                    scorers_a = []

                    raw_stats = row.get("stats")
                    player_map = season_data.get("players", {})

                    if raw_stats and isinstance(raw_stats, str) and len(raw_stats) > 2:
                        try:
                            # It uses single quotes, use ast.literal_eval safe parsing
                            stats_list = ast.literal_eval(raw_stats)

                            # Find goals_scored identifier
                            for stat in stats_list:
                                if stat.get("identifier") == "goals_scored":
                                    # Process Home Scorers ('h')
                                    for item in stat.get("h", []):
                                        pid = item["element"]
                                        val = item["value"]
                                        pname = player_map.get(pid, f"#{pid}")
                                        # Only add name, multiply by value if > 1? Or separate entries?
                                        # Standard notation: "Name (2)" if 2 goals.
                                        entry = pname
                                        if val > 1:
                                            entry += f" ({val})"
                                        scorers_h.append(entry)

                                    # Process Away Scorers ('a')
                                    for item in stat.get("a", []):
                                        pid = item["element"]
                                        val = item["value"]
                                        pname = player_map.get(pid, f"#{pid}")
                                        entry = pname
                                        if val > 1:
                                            entry += f" ({val})"
                                        scorers_a.append(entry)
                        except Exception:
                            # Parse error, ignore stats
                            pass

                    # Assign scorers based on perspective
                    # scorers_h is actual HOME team scorers
                    # scorers_a is actual AWAY team scorers

                    # If match_is_home (User's teamH is Home):
                    #   display_home = scorers_h
                    #   display_away = scorers_a
                    # Else (User's teamH is Away):
                    #   display_home = scorers_a (since away matches show "Away Team" as first/home_team column in object? No, check object keys)

                    # Object keys: "home_team" (name), "away_team" (name).
                    # "home_team" field in match_entry is: home_name if is_home else away_name.
                    # This means "home_team" in json IS THE USER'S TEAM (team H).

                    # Logic:
                    # If is_home_perspective:
                    #   match_entry["home_team"] = real_home (User Team)
                    #   match_entry["scorers_home"] = real_home_scorers
                    # Else:
                    #   match_entry["home_team"] = real_away (User Team)
                    #   match_entry["scorers_home"] = real_away_scorers

                    # Wait, let's keep it consistent with "home_team" / "away_team" names.
                    # If match_entry["home_team"] holds the NAME of the team on the left side (perspective team),
                    # then match_entry["scorers_home"] should hold the scorers for THAT team.

                    match_entry["scorers_home"] = scorers_h
                    match_entry["scorers_away"] = scorers_a

                    history.append(match_entry)

            except Exception as e:
                logger.error(f"Error processing fixtures for {season}: {e}")
                continue

        # Sort by date descending
        history.sort(key=lambda x: x["date"], reverse=True)
        return history

    async def _ensure_history_data(self):
        async with self._cache_lock:
            if all(s in self._cache for s in SEASONS):
                return

            tasks = []
            for season in SEASONS:
                if season not in self._cache:
                    tasks.append(self._fetch_season_data(season))

            if tasks:
                results = await asyncio.gather(*tasks)
                for res in results:
                    if res:
                        self._cache[res["season"]] = res

    async def _fetch_season_data(self, season: str) -> Optional[Dict[str, Any]]:
        logger.info(f"Fetching historical data for {season}")
        try:
            async with httpx.AsyncClient() as client:
                teams_url = f"{REPO_BASE_URL}/{season}/teams.csv"
                fixtures_url = f"{REPO_BASE_URL}/{season}/fixtures.csv"
                players_url = f"{REPO_BASE_URL}/{season}/players_raw.csv"

                t_resp, f_resp, p_resp = await asyncio.gather(
                    client.get(teams_url),
                    client.get(fixtures_url),
                    client.get(players_url),
                )

                if t_resp.status_code != 200 or f_resp.status_code != 200:
                    logger.error(f"Failed to fetch data for {season} (Teams/Fixtures)")
                    return None

                # Parse CSVs with Polars
                teams_df = pl.read_csv(
                    io.BytesIO(t_resp.content),
                    infer_schema_length=10000,
                    null_values=[""],
                )
                fixtures_df = pl.read_csv(
                    io.BytesIO(f_resp.content),
                    infer_schema_length=10000,
                    null_values=[""],
                    ignore_errors=True,
                )

                # Players mapping: ID -> Web Name
                player_map = {}
                if p_resp.status_code == 200:
                    try:
                        players_df = pl.read_csv(
                            io.BytesIO(p_resp.content),
                            columns=["id", "web_name"],
                            infer_schema_length=10000,
                            null_values=[""],
                        )
                        for row in players_df.iter_rows(named=True):
                            player_map[row["id"]] = row["web_name"]
                    except Exception as e:
                        logger.warning(f"Failed to parse players for {season}: {e}")

                return {
                    "season": season,
                    "teams": teams_df,
                    "fixtures": fixtures_df,
                    "players": player_map,
                }
        except Exception as e:
            logger.error(f"Error fetching {season}: {e}")
            return None
