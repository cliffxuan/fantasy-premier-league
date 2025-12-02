from typing import Any, Dict

import httpx

FPL_BASE_URL = "https://fantasy.premierleague.com/api"


class FPLService:
    # Class-level cache to persist across request instances
    _cache: Dict[str, Any] = {}
    _last_updated: Dict[str, float] = {}
    CACHE_TTL = 300  # 5 minutes

    async def get_bootstrap_static(self) -> Dict[str, Any]:
        import time

        now = time.time()
        if (
            "bootstrap" in self._cache
            and (now - self._last_updated.get("bootstrap", 0)) < self.CACHE_TTL
        ):
            return self._cache["bootstrap"]

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/bootstrap-static/")
            response.raise_for_status()
            data = response.json()

            self._cache["bootstrap"] = data
            self._last_updated["bootstrap"] = now
            return data

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

    async def get_my_team(self, team_id: int, auth_token: str) -> Dict[str, Any]:
        headers = {
            "x-api-authorization": auth_token,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        # The token provided in fetch.sh is a Bearer token, but the header key is 'x-api-authorization'.
        # The curl command uses: -H 'x-api-authorization: Bearer ...'
        # So we should pass the full string "Bearer <token>" as the auth_token argument, or prepend it here.
        # Let's assume the user passes the full header value or we prepend it if missing.

        if not auth_token.startswith("Bearer "):
            auth_token = f"Bearer {auth_token}"

        headers["x-api-authorization"] = auth_token

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FPL_BASE_URL}/my-team/{team_id}/", headers=headers
            )
            response.raise_for_status()
            return response.json()

    async def get_enriched_squad(self, team_id: int) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        # We want the squad for the 'current' active view, but for 'Fix' we want the NEXT fixture.
        # Usually 'Pick Team' shows the squad you have for the *next* deadline.
        # But get_entry_picks(gw) gets the picks for that specific GW.
        # If we want to show the "Pick Team" view, we should technically fetch the picks for the *next* GW if they exist (transfers made),
        # but usually we view the *current* squad state.
        # Let's stick to 'current' GW for picks, but show 'next' GW for fixtures.

        gw = await self.get_current_gameweek()
        next_gw = await self.get_next_gameweek_id()

        try:
            history = await self.get_entry_history(team_id)
        except Exception:
            history = {"chips": []}

        try:
            picks = await self.get_entry_picks(team_id, gw)
        except Exception:
            return {"squad": [], "chips": []}

        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # Fetch fixtures for next GW to show in 'Fix' column
        fixtures = await self.get_fixtures()
        team_next_fixture = {}
        for f in fixtures:
            if f["event"] == next_gw:
                # Home team
                team_next_fixture[f["team_h"]] = {
                    "opponent_id": f["team_a"],
                    "is_home": True,
                    "difficulty": f["team_h_difficulty"],
                }
                # Away team
                team_next_fixture[f["team_a"]] = {
                    "opponent_id": f["team_h"],
                    "is_home": False,
                    "difficulty": f["team_a_difficulty"],
                }

        squad = []
        for pick in picks["picks"]:
            player = elements.get(pick["element"])
            if player:
                team = teams.get(player["team"])

                # Resolve Fixture
                fixture_info = team_next_fixture.get(player["team"])
                fixture_str = "-"
                difficulty = 3
                if fixture_info:
                    opponent = teams.get(fixture_info["opponent_id"])
                    opp_name = opponent["short_name"] if opponent else "UNK"
                    home_away = "(H)" if fixture_info["is_home"] else "(A)"
                    fixture_str = f"{opp_name} {home_away}"
                    difficulty = fixture_info["difficulty"]

                squad.append(
                    {
                        "id": player["id"],
                        "name": player["web_name"],
                        "full_name": f"{player['first_name']} {player['second_name']}",
                        "position": player["element_type"],
                        "team": team["name"] if team else "Unknown",
                        "team_short": team["short_name"] if team else "UNK",
                        "team_code": team["code"] if team else 0,
                        "cost": player["now_cost"] / 10,
                        "status": player["status"],
                        "news": player["news"],
                        "is_captain": pick["is_captain"],
                        "is_vice_captain": pick["is_vice_captain"],
                        "form": player["form"],
                        "event_points": player["event_points"],
                        "total_points": player["total_points"],
                        "fixture": fixture_str,
                        "fixture_difficulty": difficulty,
                        "chance_of_playing": player["chance_of_playing_next_round"],
                        "code": player["code"],
                    }
                )

        # Process Chips
        chip_labels = {
            "bboost": "Bench Boost",
            "3xc": "Triple Captain",
            "wildcard": "Wildcard",
            "freehit": "Free Hit",
        }

        used_chips = {c["name"]: c["event"] for c in history.get("chips", [])}
        active_chip = picks.get("active_chip")

        chips_status = []
        target_chips = ["bboost", "3xc", "wildcard", "freehit"]

        for name in target_chips:
            label = chip_labels.get(name, name)
            status = "available"
            event = None

            if name == active_chip:
                status = "active"
            elif name in used_chips:
                status = "played"
                event = used_chips[name]

            chips_status.append(
                {"name": name, "label": label, "status": status, "event": event}
            )

        return {"squad": squad, "chips": chips_status}

    async def get_fixtures(self) -> list:
        import time

        now = time.time()
        if (
            "fixtures" in self._cache
            and (now - self._last_updated.get("fixtures", 0)) < self.CACHE_TTL
        ):
            return self._cache["fixtures"]

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/fixtures/")
            response.raise_for_status()
            data = response.json()

            self._cache["fixtures"] = data
            self._last_updated["fixtures"] = now
            return data

    async def get_current_gameweek(self) -> int:
        data = await self.get_bootstrap_static()
        for event in data["events"]:
            if event["is_current"]:
                return event["id"]
        # If no current event, find the next one and subtract 1?
        # Or just return the next one if season hasn't started?
        for event in data["events"]:
            if event["is_next"]:
                return max(1, event["id"] - 1)
        return 38

    async def get_next_gameweek_id(self) -> int:
        data = await self.get_bootstrap_static()
        for event in data["events"]:
            if event["is_next"]:
                return event["id"]
        return 38
