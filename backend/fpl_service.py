import httpx
from typing import Dict, Any

FPL_BASE_URL = "https://fantasy.premierleague.com/api"


class FPLService:
    async def get_bootstrap_static(self) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/bootstrap-static/")
            response.raise_for_status()
            return response.json()

    async def get_entry_history(self, team_id: int) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/entry/{team_id}/history/")
            response.raise_for_status()
            return response.json()

    async def get_entry_picks(self, team_id: int, gw: int) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FPL_BASE_URL}/entry/{team_id}/event/{gw}/picks/"
            )
            response.raise_for_status()
            return response.json()

    async def get_enriched_squad(self, team_id: int) -> list:
        bootstrap = await self.get_bootstrap_static()
        gw = await self.get_current_gameweek()

        try:
            picks = await self.get_entry_picks(team_id, gw)
        except Exception:
            # Fallback if current GW picks not available (e.g. pre-season or error)
            # Try previous GW? Or just return empty.
            # For now, let's propagate error or return empty list
            return []

        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        squad = []
        for pick in picks["picks"]:
            player = elements.get(pick["element"])
            if player:
                team = teams.get(player["team"])
                squad.append(
                    {
                        "name": player["web_name"],
                        "position": player["element_type"],
                        "team": team["name"] if team else "Unknown",
                        "team_code": team["code"] if team else 0,
                        "cost": player["now_cost"] / 10,
                        "status": player["status"],
                        "news": player["news"],
                        "is_captain": pick["is_captain"],
                        "is_vice_captain": pick["is_vice_captain"],
                    }
                )
        return squad

    async def get_fixtures(self) -> list:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/fixtures/")
            response.raise_for_status()
            return response.json()

    async def get_current_gameweek(self) -> int:
        data = await self.get_bootstrap_static()
        for event in data["events"]:
            if event["is_current"]:
                return event["id"]
        # If no current event, find the next one
        for event in data["events"]:
            if event["is_next"]:
                return event["id"] - 1 if event["id"] > 1 else 1
        return 1
