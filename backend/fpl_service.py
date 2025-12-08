import asyncio
import time
from collections import Counter
from typing import Any, Dict

import httpx
import pulp
from loguru import logger

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

    async def get_entry(self, team_id: int) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/entry/{team_id}/")
            response.raise_for_status()
            return response.json()

    async def get_event_live(self, gw: int) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/event/{gw}/live/")
            response.raise_for_status()
            return response.json()

    async def get_enriched_squad(
        self, team_id: int, gw: int | None = None
    ) -> Dict[str, Any]:
        print(f"DEBUG: get_enriched_squad called for team {team_id} with gw={gw}")
        bootstrap = await self.get_bootstrap_static()

        current_gw = await self.get_current_gameweek()
        if gw is None:
            gw = current_gw
        else:
            gw = int(gw)

        print(f"DEBUG: Using gw={gw} (current_gw={current_gw})")

        # For fixtures, we usually want to see the fixtures for the *next* deadline relative to the squad we are viewing.
        # If we are viewing a past GW, we probably want to see the fixtures/results for THAT GW.
        # If we are viewing the current/active GW, we want to see the upcoming fixtures.
        # Let's assume if gw < current_gw, we show the results/fixtures for that GW.
        # If gw == current_gw, we show the upcoming fixtures (or current live ones).

        target_fixture_gw = gw
        if gw > current_gw:
            # Viewing a future team? (e.g. transfers made for next week)
            target_fixture_gw = gw

        try:
            entry = await self.get_entry(team_id)
            # Enrich entry with favourite team details for badge
            if "favourite_team" in entry and entry["favourite_team"]:
                fav_team_id = entry["favourite_team"]
                bootstrap = await self.get_bootstrap_static()
                teams = {t["id"]: t for t in bootstrap["teams"]}
                if fav_team_id in teams:
                    entry["favourite_team_code"] = teams[fav_team_id]["code"]
                    entry["favourite_team_name"] = teams[fav_team_id]["name"]
        except Exception:
            entry = {}

        try:
            history = await self.get_entry_history(team_id)
        except Exception:
            history = {"chips": [], "current": []}

        # Determine which GW to fetch picks from
        # If querying for a future GW, we use the current GW's squad as a base
        picks_gw = gw
        if gw > current_gw:
            picks_gw = current_gw

        try:
            picks = await self.get_entry_picks(team_id, picks_gw)
        except Exception:
            # Fallback for future weeks if exact fetch fails?
            # If we are already pointing to current_gw, then maybe the team doesn't exist yet.
            return {"squad": [], "chips": [], "entry": entry}

        logger.info(f"gw={gw} picks={picks}")
        try:
            all_transfers = await self.get_transfers(team_id)
        except Exception:
            all_transfers = []

        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # Filter transfers for this specific GW and enrich them
        gw_transfers = []
        for t in all_transfers:
            if t["event"] == gw:
                p_in = elements.get(t["element_in"])
                p_out = elements.get(t["element_out"])
                gw_transfers.append(
                    {
                        "time": t["time"],
                        "element_in": t["element_in"],
                        "element_in_name": p_in["web_name"] if p_in else "Unknown",
                        "element_in_cost": t["element_in_cost"],
                        "element_out": t["element_out"],
                        "element_out_name": p_out["web_name"] if p_out else "Unknown",
                        "element_out_cost": t["element_out_cost"],
                    }
                )

        # Fetch fixtures for next GW to show in 'Fix' column
        fixtures = await self.get_fixtures()
        team_next_fixture = {}
        for f in fixtures:
            if f["event"] == target_fixture_gw:
                # Home team
                team_next_fixture[f["team_h"]] = {
                    "opponent_id": f["team_a"],
                    "is_home": True,
                    "difficulty": f["team_h_difficulty"],
                    "started": f.get("started", False),
                    "finished": f.get("finished", False),
                    "kickoff_time": f["kickoff_time"],
                }
                # Away team
                team_next_fixture[f["team_a"]] = {
                    "opponent_id": f["team_h"],
                    "is_home": False,
                    "difficulty": f["team_a_difficulty"],
                    "started": f.get("started", False),
                    "finished": f.get("finished", False),
                    "kickoff_time": f["kickoff_time"],
                }

        # Fetch live data for points
        try:
            live_data = await self.get_event_live(gw)
            live_elements = {e["id"]: e["stats"] for e in live_data["elements"]}
            print(
                f"DEBUG: Fetched live data for GW{gw}, {len(live_elements)} elements found."
            )
        except Exception as e:
            print(f"DEBUG: Failed to fetch live data for GW{gw}: {e}")
            live_elements = {}

        squad = []
        print(f"DEBUG: Processing {len(picks['picks'])} picks for GW{gw}")
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

                # Get points for this GW
                event_points = player["event_points"]  # Default to current
                minutes = 0
                if live_elements and player["id"] in live_elements:
                    event_points = live_elements[player["id"]]["total_points"]
                    minutes = live_elements[player["id"]]["minutes"]

                # Calculate prices
                current_price = player["now_cost"]
                purchase_price = None
                selling_price = None

                # 1. Try to find purchase price from transfers (latest transfer in)
                if all_transfers:
                    player_transfers = [
                        t for t in all_transfers if t["element_in"] == player["id"]
                    ]
                    if player_transfers:
                        player_transfers.sort(key=lambda x: x["time"], reverse=True)
                        purchase_price = player_transfers[0]["element_in_cost"]

                # 2. If not found in transfers, check if they were in the initial squad (GW1)
                # We can infer the purchase price from the player's cost at GW1 if they were in the team then.
                # However, without fetching GW1 picks, we can't be 100% sure.
                # But we can check the player's history to find their cost at GW1.
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

                if not purchase_price:
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
                        "event_points": event_points,
                        "minutes": minutes,
                        "match_started": fixture_info["started"]
                        if fixture_info
                        else False,
                        "match_finished": fixture_info["finished"]
                        if fixture_info
                        else False,
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

        # Calculate Free Transfers
        # We need next_gw for this calculation. If we are viewing a past GW, this calculation might be for THAT GW.
        # But calculate_free_transfers logic seems to be about "available for NEXT deadline".
        # If we are viewing history, maybe we want to know how many FTs they had at that time?
        # For now, let's just use the current next_gw logic, or maybe pass the viewed gw + 1?
        next_gw_for_calc = gw + 1
        free_transfers = self.calculate_free_transfers(
            history, all_transfers, next_gw_for_calc
        )

        return {
            "squad": squad,
            "chips": chips_status,
            "history": current_history,
            "entry": entry,
            "free_transfers": free_transfers,
            "transfers": gw_transfers,
            "gameweek": gw,
        }

    def calculate_free_transfers(
        self, history: Dict[str, Any], transfers: list, next_gw: int
    ) -> int:
        # Algorithm to calculate available free transfers
        # 1. Start with 0 (before GW1)
        # 2. Iterate through history
        # 3. Apply rules: +1 per week, max 5. Deduct used.
        # 4. Handle chips (WC/FH don't consume FTs, and don't reset saved FTs in 24/25)

        ft = 0
        current_history = history.get("current", [])
        chips = history.get("chips", [])

        # Map chips to events for easy lookup
        chips_played = {c["event"]: c["name"] for c in chips}

        # Sort history by event just in case
        current_history.sort(key=lambda x: x["event"])

        for h in current_history:
            event = h["event"]

            if event == 1:
                # GW1: You start with 1 FT for the *next* round (GW2).
                # Transfers made for GW1 were unlimited.
                ft = 1
                continue

            # Check if WC or FH was active in this GW
            chip = chips_played.get(event)
            is_free_round = chip in ["wildcard", "freehit"]

            if not is_free_round:
                used = h["event_transfers"]
                ft = max(0, ft - used)

            # You get +1 for the next round, capped at 5
            ft = min(5, ft + 1)

        # Now deduct transfers already made for the upcoming gameweek (next_gw)
        # These transfers are in the 'transfers' list but not yet in 'history' (if next_gw is future)
        # Or if next_gw is current but not finished?
        # 'transfers' endpoint lists all transfers.

        transfers_next_gw = 0
        if transfers:
            for t in transfers:
                if t["event"] == next_gw:
                    transfers_next_gw += 1

        ft = max(0, ft - transfers_next_gw)

        return ft

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

    async def get_dream_team(self, gw: int) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{FPL_BASE_URL}/dream-team/{gw}/")
            response.raise_for_status()
            data = response.json()

        # Fetch fixtures for this GW
        fixtures = await self.get_fixtures()
        gw_fixtures = [f for f in fixtures if f["event"] == gw]

        # Map team ID to fixture info
        team_fixture = {}
        for f in gw_fixtures:
            # Home team
            team_fixture[f["team_h"]] = {
                "opponent_id": f["team_a"],
                "is_home": True,
                "score": f"{f['team_h_score']}-{f['team_a_score']}"
                if f["finished"]
                else None,
            }
            # Away team
            team_fixture[f["team_a"]] = {
                "opponent_id": f["team_h"],
                "is_home": False,
                "score": f"{f['team_a_score']}-{f['team_h_score']}"
                if f["finished"]
                else None,
            }

        squad = []
        total_points = 0

        for item in data["team"]:
            player_id = item["element"]
            player = elements.get(player_id)
            if not player:
                continue

            team_id = player["team"]
            team = teams.get(team_id)

            # Resolve Fixture
            fixture_info = team_fixture.get(team_id)
            fixture_str = "-"
            if fixture_info:
                opponent = teams.get(fixture_info["opponent_id"])
                opp_short = opponent["short_name"] if opponent else "UNK"
                home_away = "(H)" if fixture_info["is_home"] else "(A)"
                fixture_str = f"{opp_short} {home_away}"

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
                    "purchase_price": player["now_cost"] / 10,
                    "selling_price": player["now_cost"] / 10,
                    "points": item["points"],
                    "total_points": player["total_points"],  # Season total
                    "event_points": item["points"],  # GW points
                    "form": player["form"],
                    "fixture": fixture_str,
                    "code": player["code"],
                    "status": player["status"],
                    "is_captain": False,
                    "is_vice_captain": False,
                    "fixture_difficulty": 3,  # Default, not really needed for dream team
                }
            )
            total_points += item["points"]

        # Enrich top player
        top_player_data = None
        if "top_player" in data and data["top_player"]["id"]:
            tp = elements.get(data["top_player"]["id"])
            if tp:
                top_player_data = {
                    "name": tp["web_name"],
                    "points": data["top_player"]["points"],
                    "code": tp["code"],
                    "team_code": teams[tp["team"]]["code"]
                    if tp["team"] in teams
                    else 0,
                }

        return {
            "squad": squad,
            "top_player": top_player_data,
            "total_points": total_points,
            "gameweek": gw,
        }

    async def get_top_managers_ownership(
        self, gw: int | None = None, count: int = 1000
    ) -> Dict[str, Any]:
        if gw is None:
            gw = await self.get_current_gameweek()

        # Cap count at 1000 for now to prevent abuse/timeouts
        count = min(max(count, 5), 2000)

        # Cache check
        cache_key = f"top_{count}_ownership_{gw}"
        now = time.time()
        # Cache for 1 hour
        if (
            cache_key in self._cache
            and (now - self._last_updated.get(cache_key, 0)) < 3600
        ):
            return self._cache[cache_key]

        # 1. Raw Cache Check
        # We store the raw picks data in a special cache key: "top_managers_raw_{gw}"
        # This allows us to serve any "count" that is <= the cached amount without re-fetching.

        raw_cache_key = f"top_managers_raw_{gw}"
        raw_cached = self._cache.get(raw_cache_key)

        picks_data = []  # List of {'picks': [], 'active_chip': str}

        # If we have enough data in cache, use it
        if raw_cached and len(raw_cached) >= count:
            logger.info(f"Using raw cache for Top {count} (cached {len(raw_cached)})")
            picks_data = raw_cached[:count]
        else:
            # Need to fetch data
            # If we have some data, we could potentially just fetch the delta.
            # But simpler to just fetch all if what we have is insufficient,
            # OR we can append. Let's append to be efficient.

            # If we need more than we have, fetch the difference or all if no cache
            # Actually, to keep it robust and simple:
            # If we need more data than cached, let's just fetch everything to ensure we have the *latest* rank order
            # (Ranks change as games update).
            # But typically this is for static analysis.
            # Let's just fetch what we need.

            # Fetch Top Manager Team IDs from Overall League (ID 314)
            num_pages = (count + 49) // 50
            top_teams = []
            league_id = 314

            # Helper to fetch a page of standings
            async def fetch_standings_page(client, page):
                try:
                    resp = await client.get(
                        f"{FPL_BASE_URL}/leagues-classic/{league_id}/standings/",
                        params={"page_new_entries": 1, "page_standings": page},
                    )
                    resp.raise_for_status()
                    return resp.json()
                except Exception as e:
                    logger.error(f"Failed to fetch standings page {page}: {e}")
                    return None

            async with httpx.AsyncClient() as client:
                tasks = [
                    fetch_standings_page(client, page)
                    for page in range(1, num_pages + 1)
                ]
                results = await asyncio.gather(*tasks)

                for res in results:
                    if res and "standings" in res and "results" in res["standings"]:
                        top_teams.extend(res["standings"]["results"])

            # Slice to exact count
            top_teams = top_teams[:count]
            team_ids = [t["entry"] for t in top_teams]
            logger.info(f"Fetched {len(team_ids)} top team IDs")

            # 2. Fetch Picks for all teams (that we don't have or just fetch all for simplicity/correctness)
            # Since ranks shuffle, "Top 50" now might be different teams than "Top 50" an hour ago.
            # So mixing cached 50 with new 50 might duplicate or miss.
            # Decision: reliable approach -> if requesting more than cache, fetch ALL requested and overwrite cache.

            picks_data = []

            chunk_size = 50

            async with httpx.AsyncClient() as client:
                for i in range(0, len(team_ids), chunk_size):
                    chunk = team_ids[i : i + chunk_size]
                    tasks = []
                    for tid in chunk:
                        tasks.append(
                            client.get(f"{FPL_BASE_URL}/entry/{tid}/event/{gw}/picks/")
                        )

                    responses = await asyncio.gather(*tasks, return_exceptions=True)

                    # Process chunk results IN ORDER
                    for resp in responses:
                        if isinstance(resp, httpx.Response) and resp.status_code == 200:
                            data = resp.json()
                            picks_data.append(
                                {
                                    "picks": data.get("picks", []),
                                    "active_chip": data.get("active_chip"),
                                }
                            )
                        else:
                            # If failed, add empty to maintain count correct?
                            # Or just skip. If we skip, the count won't match.
                            # Let's add empty placeholder to be safe
                            picks_data.append({"picks": [], "active_chip": None})

                    # Small sleep to be nice
                    await asyncio.sleep(0.5)

            # Update Raw Cache if this is the largest set we've seen
            if not raw_cached or len(picks_data) > len(raw_cached):
                self._cache[raw_cache_key] = picks_data
                self._last_updated[raw_cache_key] = now

        # 3. Process Picks Data (Aggregation)
        # Now we have `picks_data` (list of dicts) of size `count` (or close to it)

        player_counts = Counter()
        captain_counts = Counter()
        chip_counts = Counter()

        for entry in picks_data:
            active_chip = entry.get("active_chip")
            if active_chip:
                chip_counts[active_chip] += 1

            for p in entry.get("picks", []):
                player_counts[p["element"]] += 1
                if p["is_captain"]:
                    captain_counts[p["element"]] += 1

        # 4. Enrich with Player Data

        # 3. Enrich with Player Data
        bootstrap = await self.get_bootstrap_static()
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        enriched_players = []
        # 4. Enrich with Player Data
        bootstrap = await self.get_bootstrap_static()
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        enriched_players = []
        # Use actual count of data we have
        count = len(picks_data)
        if count == 0:
            count = 1  # avoid div by zero

        for pid, p_count in player_counts.most_common():
            player = elements.get(pid)
            if not player:
                continue

            team = teams.get(player["team"])
            ownership = (p_count / count) * 100
            cap_ownership = (captain_counts[pid] / count) * 100

            enriched_players.append(
                {
                    "id": pid,
                    "web_name": player["web_name"],
                    "full_name": f"{player['first_name']} {player['second_name']}",
                    "team_short": team["short_name"] if team else "UNK",
                    "team_code": team["code"] if team else 0,
                    "element_type": player[
                        "element_type"
                    ],  # 1=GKP, 2=DEF, 3=MID, 4=FWD
                    "cost": player["now_cost"] / 10,
                    "total_points": player["total_points"],
                    "ownership_top_1000": round(ownership, 1),
                    "captain_top_1000": round(cap_ownership, 1),
                    "global_ownership": float(player["selected_by_percent"]),
                    "rank_diff": round(
                        ownership - float(player["selected_by_percent"]), 1
                    ),
                }
            )

        result = {
            "players": enriched_players,  # Already sorted by ownership due to most_common()
            "chips": dict(chip_counts),
            "sample_size": count,
            "gameweek": gw,
        }

        # Cache the processed result for this specific count too, if we want?
        # The prompt asked for optimizing fetching. We did that via raw_cache.
        # But we still calculate the result every time. That is fine as it's fast.
        # But we should respect the original function cache logic if we want to be super efficient?
        # Actually, let's update the specific count cache so next time identical request is instant.

        self._cache[cache_key] = result
        self._last_updated[cache_key] = now

        return result

    async def get_optimized_team(self, budget: float = 100.0) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        elements = bootstrap["elements"]

        # Prepare data for solver
        # Filter out unavailable players? (status != 'a')
        # Let's keep it simple: Optimize for total_points (historical data)
        # In a real predictor, we would use projected points.

        players = []
        for p in elements:
            # Skip players with 0 points to reduce problem size
            if p["total_points"] == 0:
                continue

            players.append(
                {
                    "id": p["id"],
                    "name": p["web_name"],
                    "position": p["element_type"],  # 1:GKP, 2:DEF, 3:MID, 4:FWD
                    "team": p["team"],
                    "cost": p["now_cost"] / 10.0,
                    "points": p["total_points"],
                    "form": float(p["form"]),
                    "status": p["status"],
                }
            )

        # Problem Definition
        prob = pulp.LpProblem("FPL_Team_Optimization", pulp.LpMaximize)

        # Decision Variables
        # x[i] = 1 if player i is selected, 0 otherwise
        player_vars = pulp.LpVariable.dicts(
            "Player", [p["id"] for p in players], cat="Binary"
        )

        # Objective Function: Maximize Total Points
        prob += (
            pulp.lpSum([p["points"] * player_vars[p["id"]] for p in players]),
            "Total Points",
        )

        # Constraints

        # 1. Budget Constraint
        prob += (
            pulp.lpSum([p["cost"] * player_vars[p["id"]] for p in players]) <= budget,
            "Budget",
        )

        # 2. Squad Size (Exactly 15 players)
        prob += pulp.lpSum([player_vars[p["id"]] for p in players]) == 15, "Squad Size"

        # 3. Position Constraints
        # GKP: 2
        prob += (
            pulp.lpSum([player_vars[p["id"]] for p in players if p["position"] == 1])
            == 2,
            "GKP Count",
        )
        # DEF: 5
        prob += (
            pulp.lpSum([player_vars[p["id"]] for p in players if p["position"] == 2])
            == 5,
            "DEF Count",
        )
        # MID: 5
        prob += (
            pulp.lpSum([player_vars[p["id"]] for p in players if p["position"] == 3])
            == 5,
            "MID Count",
        )
        # FWD: 3
        prob += (
            pulp.lpSum([player_vars[p["id"]] for p in players if p["position"] == 4])
            == 3,
            "FWD Count",
        )

        # 4. Max Players per Team (3)
        teams = set(p["team"] for p in players)
        for t in teams:
            prob += (
                pulp.lpSum([player_vars[p["id"]] for p in players if p["team"] == t])
                <= 3,
                f"Max Players Team {t}",
            )

        # Solve
        # Suppress output
        prob.solve(pulp.PULP_CBC_CMD(msg=False))

        # Extract Results
        selected_players = []
        total_cost = 0
        total_points = 0

        team_map = {t["id"]: t for t in bootstrap["teams"]}

        for p in players:
            if pulp.value(player_vars[p["id"]]) == 1:
                t_info = team_map.get(p["team"])
                selected_players.append(
                    {
                        **p,
                        "team_short": t_info["short_name"] if t_info else "UNK",
                        "team_code": t_info["code"] if t_info else 0,
                        "full_team_name": t_info["name"] if t_info else "Unknown",
                    }
                )
                total_cost += p["cost"]
                total_points += p["points"]

        # Sort by position then points
        selected_players.sort(key=lambda x: (x["position"], -x["points"]))

        status = pulp.LpStatus[prob.status]

        return {
            "squad": selected_players,
            "total_points": total_points,
            "total_cost": round(total_cost, 1),
            "status": status,
            "budget_used": round(total_cost, 1),
        }

    async def get_advanced_fixtures(self, gw: int | None = None) -> list:
        # If gw is None, user likely wants fixtures for upcoming GWs
        # Let's say we return the next 38 - current GW fixtures
        current_gw = await self.get_current_gameweek()
        start_gw = gw if gw else current_gw

        fixtures = await self.get_fixtures()
        bootstrap = await self.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # 1. Calculate Team Strength Metrics
        # Official FDR is static. We want dynamic based on actual performance.
        # Strength = Base Strength + Form Modifier

        # Simple Model:
        # Attack Strength = Goals For / Games Played
        # Defense Weakness = Goals Conceded / Games Played

        team_stats = {}
        for t in bootstrap["teams"]:
            # Populate team stats for advanced modeling later
            # Currently using official strength, but we can enrich here
            team_stats[t["id"]] = {
                "name": t["name"],
                "short_name": t["short_name"],
                "attack": t[
                    "strength_attack_home"
                ],  # Simplified, use official for now as baseline
                "defence": t["strength_defence_home"],
                "overall": t["strength_overall_home"],
                "form": t["form"],
            }

        # 2. Process Fixtures
        # We want to identify "Good Run" for teams.
        # Calculates a custom difficulty score for each fixture.

        enriched_fixtures = []

        # Filter futures
        future_fixtures = [
            f
            for f in fixtures
            if not f["finished"] and f["event"] is not None and f["event"] >= start_gw
        ]

        # Group by team
        team_fixtures = {t_id: [] for t_id in teams}

        for f in future_fixtures:
            # Home Team Perspective
            # Difficulty = Opponent Defense Strength (if we are attacking) vs Our Attack?
            # Actually, standard FDR is "How hard is it to win/get points?".
            # For attackers: Opponent Defense Strength.
            # For defenders: Opponent Attack Strength.

            h_team = teams[f["team_h"]]
            a_team = teams[f["team_a"]]

            # Difficulty for Home Team (to Attack)
            # Opponent is Away Team
            h_diff_attack = a_team["strength_defence_away"]
            # Difficulty for Home Team (to Defend)
            h_diff_defend = a_team["strength_attack_away"]

            # Difficulty for Away Team (to Attack)
            a_diff_attack = h_team["strength_defence_home"]
            # Difficulty for Away Team (to Defend)
            a_diff_defend = h_team["strength_attack_home"]

            # Custom Rating (1-5 scale re-mapped from strength ~1000-1350)
            # 1350 is Hard (Man City), 1000 is Easy (Promoted)
            # Map 1000->1, 1350->5
            def map_strength(s):
                return max(1, min(5, (s - 950) / 80))

            team_fixtures[f["team_h"]].append(
                {
                    "gameweek": f["event"],
                    "opponent": a_team["short_name"],
                    "opponent_id": f["team_a"],
                    "is_home": True,
                    "fdr_official": f["team_h_difficulty"],
                    "fdr_attack": round(map_strength(h_diff_attack), 2),
                    "fdr_defend": round(map_strength(h_diff_defend), 2),
                    "kickoff": f["kickoff_time"],
                }
            )

            team_fixtures[f["team_a"]].append(
                {
                    "gameweek": f["event"],
                    "opponent": h_team["short_name"],
                    "opponent_id": f["team_h"],
                    "is_home": False,
                    "fdr_official": f["team_a_difficulty"],
                    "fdr_attack": round(map_strength(a_diff_attack), 2),
                    "fdr_defend": round(map_strength(a_diff_defend), 2),
                    "kickoff": f["kickoff_time"],
                }
            )

        # 3. Analyze "Tickers" (Next 5 GWs)
        ticker_data = []
        for t_id, fixs in team_fixtures.items():
            # Get next 5
            next_5 = sorted(fixs, key=lambda x: x["gameweek"])[:5]
            if not next_5:
                continue

            avg_diff_off = sum(f["fdr_official"] for f in next_5) / len(next_5)
            avg_diff_att = sum(f["fdr_attack"] for f in next_5) / len(next_5)
            avg_diff_def = sum(f["fdr_defend"] for f in next_5) / len(next_5)

            ticker_data.append(
                {
                    "team_id": t_id,
                    "team_name": teams[t_id]["name"],
                    "team_short": teams[t_id]["short_name"],
                    "team_code": teams[t_id]["code"],
                    "next_5": next_5,
                    "avg_difficulty_official": round(avg_diff_off, 2),
                    "avg_difficulty_attack": round(
                        avg_diff_att, 2
                    ),  # Lower is better (easier opponent defense)
                    "avg_difficulty_defend": round(
                        avg_diff_def, 2
                    ),  # Lower is better (weaker opponent attack)
                }
            )

        # Sort by best attacking fixtures (lowest difficulty)
        ticker_data.sort(key=lambda x: x["avg_difficulty_attack"])

        return ticker_data
