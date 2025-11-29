import os
import json
from openai import AsyncOpenAI
from .fpl_service import FPLService
from .models import AnalysisRequest, AnalysisResponse


class AnalysisService:
    def __init__(self):
        self.fpl_service = FPLService()
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def analyze_team(self, request: AnalysisRequest) -> AnalysisResponse:
        # 1. Fetch Data
        bootstrap = await self.fpl_service.get_bootstrap_static()

        gw = request.gameweek
        if not gw:
            gw = await self.fpl_service.get_current_gameweek()

        history = await self.fpl_service.get_entry_history(request.team_id)
        picks = await self.fpl_service.get_entry_picks(request.team_id, gw)
        fixtures = await self.fpl_service.get_fixtures()

        # 2. Prepare Context for AI
        # Simplify data to reduce token usage
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        current_squad = []
        for pick in picks["picks"]:
            player = elements.get(pick["element"])
            if player:
                team = teams.get(player["team"])
                current_squad.append(
                    {
                        "name": player["web_name"],
                        "position": player["element_type"],
                        "team": team["name"] if team else "Unknown",
                        "cost": player["now_cost"] / 10,
                        "status": player["status"],
                        "news": player["news"],
                        "is_captain": pick["is_captain"],
                        "is_vice_captain": pick["is_vice_captain"],
                    }
                )

        # Filter fixtures for next 3 GWs
        upcoming_fixtures = [
            f
            for f in fixtures
            if f["event"] and f["event"] >= gw and f["event"] <= gw + 3
        ]

        context = {
            "gameweek": gw,
            "money_in_bank": request.knowledge_gap.money_in_bank,
            "free_transfers": request.knowledge_gap.free_transfers,
            "transfers_rolled": request.knowledge_gap.transfers_rolled,
            "squad": current_squad,
            "chips_used": history.get("chips", []),
            "upcoming_fixtures_sample": upcoming_fixtures[:10],  # Limit size
        }

        # 3. Prompt OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            # Mock response for demo purposes
            print("No OpenAI API Key found. Returning mock response.")
            return AnalysisResponse(
                immediate_action="🚨 Deadline in 24 hours! Check your vice-captain.",
                transfer_plan={
                    "Option A (Conservative)": "Save your free transfer. Squad looks good.",
                    "Option B (Aggressive)": "No hits recommended this week.",
                },
                captaincy="Haaland (vs SHU) - High expected points.",
                future_watch="Monitor Saka's injury status for next week.",
                squad=[
                    {
                        "name": "Raya",
                        "position": 1,
                        "team": "Arsenal",
                        "cost": 5.0,
                        "status": "a",
                        "news": "",
                        "is_captain": False,
                        "is_vice_captain": False,
                    },
                    {
                        "name": "Gabriel",
                        "position": 2,
                        "team": "Arsenal",
                        "cost": 6.0,
                        "status": "a",
                        "news": "",
                        "is_captain": False,
                        "is_vice_captain": False,
                    },
                    {
                        "name": "Haaland",
                        "position": 4,
                        "team": "Man City",
                        "cost": 14.0,
                        "status": "a",
                        "news": "",
                        "is_captain": True,
                        "is_vice_captain": False,
                    },
                ],
                raw_analysis="Mock analysis due to missing API key.",
            )

        prompt = f"""
        You are an expert Fantasy Premier League assistant. Analyze the following team state and provide advice.
        
        Context:
        {json.dumps(context, indent=2)}
        
        Follow this strict logic:
        1. Status Check: Identify deadline status.
        2. Structural Audit: Identify "Budget Rot" or "Dead Funds".
        3. Fixture Forecasting: Look 3 GWs ahead.
        4. Chip Strategy: Check available chips.

        Output strictly in JSON format with these keys:
        - "immediate_action": string
        - "transfer_plan": object with "conservative" and "aggressive" keys (strings)
        - "captaincy": string
        - "future_watch": string
        """

        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful FPL assistant returning JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        result = json.loads(content)

        return AnalysisResponse(
            immediate_action=result.get(
                "immediate_action", "No immediate action detected."
            ),
            transfer_plan={
                "Option A (Conservative)": result.get("transfer_plan", {}).get(
                    "conservative", "Hold"
                ),
                "Option B (Aggressive)": result.get("transfer_plan", {}).get(
                    "aggressive", "No hits recommended"
                ),
            },
            captaincy=result.get("captaincy", "Check fixtures"),
            future_watch=result.get("future_watch", "Monitor injuries"),
            squad=current_squad,
            raw_analysis=content,
        )
