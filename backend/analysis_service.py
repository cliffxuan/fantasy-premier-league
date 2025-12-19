import asyncio
import datetime
import json
import logging
import os
import traceback
from typing import Any, Dict, List

import dspy

from .fpl_service import FPLService
from .models import AnalysisRequest, AnalysisResponse

# --- DSPy Signatures ---


class FPLTeamAnalysis(dspy.Signature):
    """
    Analyze a Fantasy Premier League team state and provide strategic advice.
    Synthesize insights from:
    1. The user's specific team context (squad, budget).
    2. Market Intelligence (what top managers are doing).
    3. Performance Data (recent Dream Team high flyers).
    4. AI Solver (optimal path recommendations).

    Goal: output a concrete plan to improve rank.
    """

    team_context = dspy.InputField(
        desc="User's current squad, budget, chips, and next 3 fixtures."
    )
    market_insights = dspy.InputField(
        desc="Top 50 managers' ownership stats and key differentials."
    )
    dream_team_stats = dspy.InputField(
        desc="Best performing players from the previous gameweek."
    )
    solver_recommendation = dspy.InputField(
        desc="Theoretically optimal squad for the upcoming gameweek."
    )

    immediate_action = dspy.OutputField(
        desc="Urgent action needed (e.g., injuries, deadlines)."
    )
    transfer_conservative = dspy.OutputField(
        desc="A low-risk transfer move aligning with template/solver."
    )
    transfer_aggressive = dspy.OutputField(
        desc="A high-risk/high-reward differential move."
    )
    captaincy_choice = dspy.OutputField(
        desc="Best captaincy option with reasoning vs Solver/Market."
    )
    future_watch_list = dspy.OutputField(desc="Players or trends to monitor.")


# --- Service ---


class AnalysisService:
    def __init__(self):
        self.fpl_service = FPLService()

        # Configure DSPy with OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                lm = dspy.LM("openai/gpt-4o", api_key=api_key)
                dspy.settings.configure(lm=lm)
                self.predictor = dspy.ChainOfThought(FPLTeamAnalysis)
                self.has_api_key = True
            except Exception as e:
                logging.error(f"Failed to initialize DSPy: {e}")
                self.has_api_key = False
        else:
            self.has_api_key = False
            logging.warning("No OPENAI_API_KEY found. Analysis will return mock data.")

    async def analyze_team(self, request: AnalysisRequest) -> AnalysisResponse:
        # 1. Fetch User Data
        gw = request.gameweek
        if not gw:
            gw = await self.fpl_service.get_current_gameweek()

        history = await self.fpl_service.get_entry_history(request.team_id)

        picks = None
        # Try to use authenticated data if available
        if request.auth_token:
            try:
                my_team_data = await self.fpl_service.get_my_team(
                    request.team_id, request.auth_token
                )
                picks = my_team_data
                # If we have private data, it's usually for the *next* deadline or current live state.
                # The structure is slightly different but get_my_team follows picks structure roughly?
                # Actually get_my_team returns { "picks": [...], "chips": [...] }
            except Exception as e:
                logging.warning(f"Failed to fetch private team data: {e}")

        if not picks:
            picks = await self.fpl_service.get_entry_picks(request.team_id, gw)

        bootstrap = await self.fpl_service.get_bootstrap_static()
        fixtures = await self.fpl_service.get_fixtures()

        # 2. Enrich User Squad
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        current_squad = []
        for pick in picks["picks"]:
            player = elements.get(pick["element"])
            if player:
                team = teams.get(player["team"])
                # Feature Engineering
                cost = player["now_cost"] / 10
                total_points = player["total_points"]
                value_season = round(total_points / cost, 2) if cost > 0 else 0.0
                form = float(player["form"])

                current_squad.append(
                    {
                        "name": player["web_name"],
                        "position": player["element_type"],
                        "team": team["short_name"] if team else "UNK",
                        "cost": cost,
                        "status": player["status"],
                        "news": player["news"],
                        "is_captain": pick["is_captain"],
                        "is_vice_captain": pick["is_vice_captain"],
                        "points": total_points,
                        "form": form,
                        "value": value_season,
                        "selected_by": f"{player['selected_by_percent']}%",
                    }
                )

        # Filter next 3 GW fixtures
        upcoming_fixtures = []
        for f in fixtures:
            if f["event"] and gw <= f["event"] <= gw + 2:
                h_team = teams.get(f["team_h"])
                a_team = teams.get(f["team_a"])
                upcoming_fixtures.append(
                    {
                        "event": f["event"],
                        "match": f"{h_team['short_name']} vs {a_team['short_name']}",
                        "difficulty_h": f["team_h_difficulty"],
                        "difficulty_a": f["team_a_difficulty"],
                    }
                )

        # Chips used
        chips_used = [c["name"] for c in history.get("chips", [])]
        # If we have private data, simple chips structure might be different or we might want to check 'active' chips
        # But for 'chips_used' history is still the source of truth for past chips.

        team_context = {
            "gameweek": gw,
            "bank": request.knowledge_gap.money_in_bank,
            "free_transfers": request.knowledge_gap.free_transfers,
            "squad": current_squad,
            "chips_used": chips_used,
            "upcoming_fixtures": upcoming_fixtures,
        }

        # 3. Parallel Fetch of Advanced Data (Market, Dream Team, Solver)
        # Use previous GW for stats/market (since current/next is hidden/unplayed)
        reference_gw = max(1, gw - 1)

        task_top = self.fpl_service.get_top_managers_ownership(
            gw=reference_gw, count=50
        )
        task_dream = self.fpl_service.get_dream_team(gw=reference_gw)

        # Solver for NEXT GW (forward looking)
        # Use a generic decent budget (100.0) just to see who the AI likes essentially
        task_solver = self.fpl_service.get_optimized_team(
            budget=100.0,
            min_gw=gw,
            max_gw=gw,
            exclude_bench=True,  # Focus on starting XI for recommendation
        )

        results = await asyncio.gather(
            task_top, task_dream, task_solver, return_exceptions=True
        )

        # Process Top Managers
        top_data = results[0]
        market_summary = "Market data unavailable."
        if isinstance(top_data, dict) and "players" in top_data:
            # Extract top 10 owned players by top 50 managers
            top_owned = top_data["players"][:10]
            market_summary = {
                "top_10_template_players": [
                    f"{p['web_name']} ({p['ownership_top_1000']}%)" for p in top_owned
                ],
                "sample_size": top_data.get("sample_size"),
            }

        # Process Dream Team
        dream_data = results[1]
        dream_summary = "Dream team data unavailable."
        if isinstance(dream_data, dict) and "squad" in dream_data:
            # Top 3 highest scorers
            sorted_dream = sorted(
                dream_data["squad"], key=lambda x: x["event_points"], reverse=True
            )
            dream_summary = {
                "gameweek": dream_data.get("gameweek"),
                "top_performers": [
                    f"{p['name']} ({p['event_points']} pts)" for p in sorted_dream[:5]
                ],
            }

        # Process Solver
        solver_data = results[2]
        solver_summary = "Solver data unavailable."
        if isinstance(solver_data, dict) and "squad" in solver_data:
            solver_summary = {
                "optimal_xi": [p["name"] for p in solver_data["squad"]],
                "projected_points": solver_data.get("total_points"),
            }

        context_payload = {
            "team_context": json.dumps(team_context),
            "market_insights": json.dumps(market_summary),
            "dream_team_stats": json.dumps(dream_summary),
            "solver_recommendation": json.dumps(solver_summary),
        }

        # Logging for Data Science
        self._log_interaction(request.team_id, gw, context_payload)

        # 4. DSPy Prediction
        if not self.has_api_key:
            return self._get_mock_response(current_squad)

        try:
            # Run the CoT pipeline
            pred = self.predictor(**context_payload)

            return AnalysisResponse(
                immediate_action=pred.immediate_action,
                transfer_plan={
                    "Option A (Conservative)": pred.transfer_conservative,
                    "Option B (Aggressive)": pred.transfer_aggressive,
                },
                captaincy=pred.captaincy_choice,
                future_watch=pred.future_watch_list,
                squad=current_squad,
                raw_analysis=f"Reasoning:\n{pred.reasoning}",
            )

        except Exception as e:
            logging.error(f"DSPy Analysis failed: {e}")

            traceback.print_exc()
            return AnalysisResponse(
                immediate_action="Error during analysis.",
                transfer_plan={"Error": "Could not generate plan."},
                captaincy="Check manual fixtures.",
                future_watch="N/A",
                squad=current_squad,
                raw_analysis=str(e),
            )

    def _get_mock_response(self, squad: List[Dict[str, Any]]) -> AnalysisResponse:
        return AnalysisResponse(
            immediate_action="🚨 Missing API Key. Enable OpenAI for AI insights.",
            transfer_plan={
                "Conservative": "Save transfer.",
                "Aggressive": "No recommendation (Mock).",
            },
            captaincy="Haaland (Mock Recommendation)",
            future_watch="Monitor injuries.",
            squad=squad,
            raw_analysis="This is a mock response because the OPENAI_API_KEY environment variable is not set.",
        )

    def _log_interaction(self, team_id: int, gw: int, context: Dict[str, Any]):
        os.makedirs("logs", exist_ok=True)

        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "team_id": team_id,
            "gameweek": gw,
            "context_keys": list(context.keys()),
        }

        logger = logging.getLogger("fpl_analysis_data")
        logger.setLevel(logging.INFO)
        if not logger.handlers:
            fh = logging.FileHandler("logs/analysis_dataset.jsonl")
            fh.setFormatter(logging.Formatter("%(message)s"))
            logger.addHandler(fh)

        logger.info(json.dumps(log_entry))
