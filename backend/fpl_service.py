import time
from typing import Any, Dict

import httpx

FPL_BASE_URL = "https://fantasy.premierleague.com/api"


class FPLService:
    # Class-level cache to persist across request instances
    _cache: Dict[str, Any] = {}
    _last_updated: Dict[str, float] = {}
    CACHE_TTL = 300  # 5 minutes

    async def get_bootstrap_static(self) -> Dict[str, Any]:
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

    async def get_transfers(self, team_id: int) -> list:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/entry/{team_id}/transfers/")
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
            history = {"chips": [], "current": []}

        try:
            picks = await self.get_entry_picks(team_id, gw)
        except Exception:
            return {"squad": [], "chips": []}

        try:
            transfers = await self.get_transfers(team_id)
        except Exception:
            transfers = []

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
                    opp_name = opponent["name"] if opponent else "UNK"
                    home_away = "(H)" if fixture_info["is_home"] else "(A)"
                    fixture_str = f"{opp_name} {home_away}"
                    difficulty = fixture_info["difficulty"]

                # Calculate prices
                current_price = player["now_cost"]
                purchase_price = None
                selling_price = None

                # 1. Try to find purchase price from transfers (latest transfer in)
                if transfers:
                    player_transfers = [
                        t for t in transfers if t["element_in"] == player["id"]
                    ]
                    if player_transfers:
                        player_transfers.sort(key=lambda x: x["time"], reverse=True)
                        purchase_price = player_transfers[0]["element_in_cost"]

                # 2. If not found in transfers, check if they were in the initial squad (GW1)
                # We can infer the purchase price from the player's cost at GW1 if they were in the team then.
                # However, without fetching GW1 picks, we can't be 100% sure.
                # But we can check the player's history to find their cost at GW1.
                if not purchase_price:
                    # We need to check if the player has been in the team since the start.
                    # Since we don't have full history of every GW picks here easily without many requests,
                    # we can try to fetch the player's summary and look at their history.
                    # The history shows the price at each GW.
                    # If we assume they have been in the team since GW1 (because no transfer in record found),
                    # then their purchase price is their price at GW1.

                    # NOTE: This is an optimization. Ideally we should check if they were actually in the team at GW1.
                    # But if they are in the current squad and have NO transfer in record, they MUST be from GW1 (or a wildcard/freehit that wiped history? unlikely for 'transfers' endpoint).
                    # Actually, 'transfers' endpoint covers all transfers.
                    # So if no transfer IN, they are original squad.

                    # We need to get the player's price at GW1.
                    # We can get this from element-summary, but that requires an extra call per player which is slow.
                    # Alternatively, we can use the 'history' from get_player_summary if we had it.
                    # But we don't want to call get_player_summary for every player in the loop.

                    # Optimization: Use the 'cost_change_start' from bootstrap-static to calculate original price.
                    # current_price = original_price + cost_change_start
                    # So original_price = current_price - cost_change_start

                    purchase_price = current_price - player["cost_change_start"]

                if purchase_price:
                    if current_price > purchase_price:
                        profit = (current_price - purchase_price) // 2
                        selling_price = purchase_price + profit
                    else:
                        selling_price = current_price

                squad.append(
                    {
                        "id": player["id"],
                        "name": player["web_name"],
                        "full_name": f"{player['first_name']} {player['second_name']}",
                        "position": player["element_type"],
                        "team": team["name"] if team else "Unknown",
                        "team_short": team["short_name"] if team else "UNK",
                        "team_code": team["code"] if team else 0,
                        "cost": current_price / 10,
                        "purchase_price": purchase_price / 10
                        if purchase_price
                        else None,
                        "selling_price": selling_price / 10 if selling_price else None,
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

        # Update history with live points from picks for the current gameweek
        current_history = history.get("current", [])
        if picks and "entry_history" in picks:
            live_history = picks["entry_history"]
            # Check if we have an entry for this GW in history
            found = False
            for i, h in enumerate(current_history):
                if h["event"] == gw:
                    # Update with live data
                    current_history[i] = live_history
                    found = True
                    break

            if not found:
                # Append live data if not present (e.g. very start of GW)
                current_history.append(live_history)

        return {
            "squad": squad,
            "chips": chips_status,
            "history": current_history,
        }

    async def get_fixtures(self) -> list:
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

    async def get_league_table(self) -> list:
        bootstrap = await self.get_bootstrap_static()
        fixtures = await self.get_fixtures()

        # Initialize table with team details
        teams = {}
        for team in bootstrap["teams"]:
            teams[team["id"]] = {
                "id": team["id"],
                "name": team["name"],
                "short_name": team["short_name"],
                "code": team["code"],
                "played": 0,
                "won": 0,
                "drawn": 0,
                "lost": 0,
                "points": 0,
                "goals_for": 0,
                "goals_against": 0,
                "goal_difference": 0,
                "form": [],  # List to store last 5 results
            }

        # Process fixtures
        # Sort fixtures by kickoff time to help with form calculation later if needed
        fixtures.sort(key=lambda x: x["kickoff_time"] if x["kickoff_time"] else "")

        for f in fixtures:
            if not f["finished"] and not f["finished_provisional"]:
                continue

            h_id = f["team_h"]
            a_id = f["team_a"]
            h_score = f["team_h_score"]
            a_score = f["team_a_score"]

            if h_id not in teams or a_id not in teams:
                continue

            # Update Played
            teams[h_id]["played"] += 1
            teams[a_id]["played"] += 1

            # Update Goals
            teams[h_id]["goals_for"] += h_score
            teams[h_id]["goals_against"] += a_score
            teams[a_id]["goals_for"] += a_score
            teams[a_id]["goals_against"] += h_score

            # Update Result
            if h_score > a_score:
                teams[h_id]["won"] += 1
                teams[h_id]["points"] += 3
                teams[a_id]["lost"] += 1
                teams[h_id]["form"].append("W")
                teams[a_id]["form"].append("L")
            elif a_score > h_score:
                teams[a_id]["won"] += 1
                teams[a_id]["points"] += 3
                teams[h_id]["lost"] += 1
                teams[a_id]["form"].append("W")
                teams[h_id]["form"].append("L")
            else:
                teams[h_id]["drawn"] += 1
                teams[h_id]["points"] += 1
                teams[a_id]["drawn"] += 1
                teams[a_id]["points"] += 1
                teams[h_id]["form"].append("D")
                teams[a_id]["form"].append("D")

        # Convert to list and calculate derived stats
        table = []
        for team_id, stats in teams.items():
            stats["goal_difference"] = stats["goals_for"] - stats["goals_against"]
            # Format form (last 5)
            recent_form = stats["form"][-5:]
            stats["form"] = "".join(recent_form)
            table.append(stats)

        # Sort: Points DESC, GD DESC, GF DESC
        table.sort(
            key=lambda x: (x["points"], x["goal_difference"], x["goals_for"]),
            reverse=True,
        )

        # Assign positions
        for i, team in enumerate(table):
            team["position"] = i + 1

        return table

    async def get_player_summary(self, player_id: int) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/element-summary/{player_id}/")
            response.raise_for_status()
            data = response.json()

            # Enrich history
            for fixture in data.get("history", []):
                opp_id = fixture["opponent_team"]
                fixture["opponent_short_name"] = (
                    teams[opp_id]["short_name"] if opp_id in teams else "UNK"
                )

            # Enrich fixtures
            for fixture in data.get("fixtures", []):
                h_id = fixture["team_h"]
                a_id = fixture["team_a"]
                fixture["team_h_short"] = (
                    teams[h_id]["short_name"] if h_id in teams else "UNK"
                )
                fixture["team_a_short"] = (
                    teams[a_id]["short_name"] if a_id in teams else "UNK"
                )

            return data
