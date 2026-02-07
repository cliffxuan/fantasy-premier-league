import asyncio
import time
from collections import Counter
from typing import Any, Dict, List

import httpx
import pulp
from loguru import logger
from pydantic import ValidationError

from .models import Fixture, Team
from .team_details import NAME_TO_FULL_NAME, TEAM_MAPPINGS


FPL_BASE_URL = "https://fantasy.premierleague.com/api"

# PingOne OAuth configuration (FPL migrated from cookie-based to PingOne SSO)
PINGONE_AUTH_URL = "https://account.premierleague.com"
PINGONE_CLIENT_ID = "1f243d70-a140-4035-8c41-341f5af5aa12"
PINGONE_REDIRECT_URI = "https://www.premierleague.com/robots.txt"
PINGONE_SCOPE = "openid profile offline_access p1:update:user p1:read:device p1:reset:userPassword"


class FPLService:
    # Class-level cache to persist across request instances
    _cache: Dict[str, Any] = {}
    _last_updated: Dict[str, float] = {}
    _cache_lock = asyncio.Lock()
    CACHE_TTL = 300  # 5 minutes

    @staticmethod
    def get_authorize_url() -> str:
        """Returns the PingOne OAuth authorize URL for FPL login.

        The user opens this URL in their browser, logs in, and gets redirected
        to a static page with ?code=XXX in the URL. They then pass the code
        to the /api/auth/callback endpoint to exchange it for an access token.
        """
        from urllib.parse import urlencode

        params = urlencode(
            {
                "response_type": "code",
                "client_id": PINGONE_CLIENT_ID,
                "redirect_uri": PINGONE_REDIRECT_URI,
                "scope": PINGONE_SCOPE,
            }
        )
        return f"{PINGONE_AUTH_URL}/as/authorize?{params}"

    async def exchange_code(self, code: str) -> Dict[str, Any]:
        """Exchanges a PingOne authorization code for access/refresh tokens."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PINGONE_AUTH_URL}/as/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": PINGONE_REDIRECT_URI,
                    "client_id": PINGONE_CLIENT_ID,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if response.status_code != 200:
                error = response.json()
                logger.error(f"Token exchange failed: {error}")
                return None

            return response.json()

    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Uses a refresh token to get a new access token."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PINGONE_AUTH_URL}/as/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": PINGONE_CLIENT_ID,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if response.status_code != 200:
                error = response.json()
                logger.error(f"Token refresh failed: {error}")
                return None

            return response.json()

    async def get_bootstrap_static(self) -> Dict[str, Any]:
        async with self._cache_lock:
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

                # Populate full_name from overrides
                for team in data.get("teams", []):
                    team["full_name"] = NAME_TO_FULL_NAME.get(
                        team["name"], team["name"]
                    )

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
        self, team_id: int, gw: int | None = None, auth_token: str | None = None
    ) -> Dict[str, Any]:
        print(
            f"DEBUG: get_enriched_squad called for team {team_id} with gw={gw} auth={bool(auth_token)}"
        )
        bootstrap = await self.get_bootstrap_static()

        # Determine Gameweek
        gw_status = await self.get_gameweek_status()
        # Default view is what get_gameweek_status says (active or next if finished)
        default_gw = gw_status["id"]

        # But we also need the strict 'current' gameweek for data fetching logic
        current_gw = await self.get_current_gameweek()

        if gw is None:
            gw = default_gw
        else:
            gw = int(gw)

        print(f"DEBUG: Using gw={gw} (current_gw={current_gw})")

        target_fixture_gw = gw
        if gw > current_gw:
            target_fixture_gw = gw

        try:
            entry = await self.get_entry(team_id)
            if "favourite_team" in entry and entry["favourite_team"]:
                fav_team_id = entry["favourite_team"]
                # bootstrap already fetched
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

        picks_gw = gw
        if gw > current_gw:
            picks_gw = current_gw

        picks = None
        my_team_data = None

        if auth_token:
            try:
                my_team_data = await self.get_my_team(team_id, auth_token)
                picks = my_team_data
                # If using auth token, we are likely looking at the most up to date team (possibly next GW)
                # But we keep gw as requested or default current
            except Exception as e:
                print(f"DEBUG: Failed to fetch my team with token: {e}")
                # Fallback to public picks if auth fails? Or just fail?
                # Let's fallback for now, or just leave picks as None to be handled below

        if not picks:
            try:
                picks = await self.get_entry_picks(team_id, picks_gw)
            except Exception:
                # If basic fetch fails too, return empty
                return {"squad": [], "chips": [], "entry": entry}

        logger.info(f"gw={gw} picks_count={len(picks.get('picks', []))}")
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
            if f.event == target_fixture_gw:
                # Home team
                team_next_fixture[f.team_h] = {
                    "opponent_id": f.team_a,
                    "is_home": True,
                    "difficulty": f.team_h_difficulty,
                    "started": f.started,
                    "finished": f.finished,
                    "kickoff_time": f.kickoff_time,
                }
                # Away team
                team_next_fixture[f.team_a] = {
                    "opponent_id": f.team_h,
                    "is_home": False,
                    "difficulty": f.team_a_difficulty,
                    "started": f.started,
                    "finished": f.finished,
                    "kickoff_time": f.kickoff_time,
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
                opponent_id = None
                if fixture_info:
                    opponent = teams.get(fixture_info["opponent_id"])
                    opp_name = opponent["name"] if opponent else "UNK"
                    home_away = "(H)" if fixture_info["is_home"] else "(A)"
                    fixture_str = f"{opp_name} {home_away}"
                    difficulty = fixture_info["difficulty"]
                    opponent_id = fixture_info["opponent_id"]

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
                        "opponent_id": opponent_id,
                    }
                )

        # Process Chips
        chips_status = self.calculate_chip_status(gw, history, picks, my_team_data)

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

        if my_team_data and "transfers" in my_team_data:
            transfer_details = my_team_data["transfers"]
            # Use official free transfer limit if available
            # Logic: limit is the max transfers available for this team at the start of the window/state.
            # 'made' is the number of transfers made.
            # So remaining is limit - made.
            # 'cost' is handled by FPL (points deduction).
            # If cost > 0, free transfers should be 0.
            # But strictly: max(0, limit - made) covers it.
            if "limit" in transfer_details:
                limit = transfer_details["limit"]
                made = transfer_details.get("made", 0)
                free_transfers = max(0, limit - made)
        else:
            transfer_details = None

        return {
            "squad": squad,
            "chips": chips_status,
            "history": current_history,
            "entry": entry,
            "free_transfers": free_transfers,
            "transfers": gw_transfers,
            "transfer_details": transfer_details,
            "gameweek": gw,
            "is_private": bool(my_team_data),
        }

    def calculate_chip_status(
        self,
        gw: int,
        history: Dict[str, Any],
        picks: Dict[str, Any] = None,
        my_team_data: Dict[str, Any] = None,
    ) -> List[Dict[str, Any]]:
        chip_labels = {
            "bboost": "Bench Boost",
            "3xc": "Triple Captain",
            "wildcard": "Wildcard",
            "freehit": "Free Hit",
        }
        target_chips = ["bboost", "3xc", "wildcard", "freehit"]
        chips_status = []

        if my_team_data and "chips" in my_team_data:
            # Use authenticated chips data
            my_chips = {c["name"]: c for c in my_team_data["chips"]}

            for name in target_chips:
                label = chip_labels.get(name, name)
                status = "available"
                events = []

                if name in my_chips:
                    c_data = my_chips[name]
                    status = c_data.get("status_for_entry", "available")

                    if "played_by_entry" in c_data and c_data["played_by_entry"]:
                        events = c_data["played_by_entry"]

                    # Convert to ints if needed, though they might be ints already
                    events = [int(e) for e in events]

                chips_status.append(
                    {
                        "name": name,
                        "label": label,
                        "status": status,
                        "events": events,
                    }
                )
        else:
            # Fallback to public history
            used_chips_map = {}
            for c in history.get("chips", []):
                cname = c["name"]
                if cname not in used_chips_map:
                    used_chips_map[cname] = []
                used_chips_map[cname].append(c["event"])

            # Sort events
            for cname in used_chips_map:
                used_chips_map[cname].sort()

            active_chip = picks.get("active_chip") if picks else None

            for name in target_chips:
                label = chip_labels.get(name, name)
                status = "available"
                start_gw_period_2 = 20  # Reset at GW20

                used_events = used_chips_map.get(name, [])

                if name == active_chip:
                    status = "active"
                else:
                    if gw < start_gw_period_2:
                        # First Half
                        if len(used_events) > 0:
                            status = "played"
                        else:
                            status = "available"
                    else:
                        # Second Half (GW >= 20)
                        post_reset_usage = [
                            e for e in used_events if e >= start_gw_period_2
                        ]

                        if len(post_reset_usage) > 0:
                            status = "played"
                        else:
                            status = "available"

                chips_status.append(
                    {
                        "name": name,
                        "label": label,
                        "status": status,
                        "events": used_events,
                    }
                )

        return chips_status

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

            # Special rule for 2025/26 season: 5 free transfers top-up after GW15 (AFCON)
            if event == 15:
                ft = 5

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

    async def get_fixtures(self) -> List[Fixture]:
        async with self._cache_lock:
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

                # Parse into models
                fixtures = []
                for f in data:
                    try:
                        fixtures.append(Fixture(**f))
                    except ValidationError:
                        logger.warning(f"Failed parsing fixture: {f}")

                self._cache["fixtures"] = fixtures
                self._last_updated["fixtures"] = now
                return fixtures

    async def get_live_fixtures(self, gw: int) -> List[Fixture]:
        bootstrap = await self.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # Import HistoryService here to avoid circular dependencies
        from .history_service import HistoryService

        history_service = HistoryService()
        await history_service._ensure_history_data()

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{FPL_BASE_URL}/fixtures/", params={"event": gw}
            )
            response.raise_for_status()
            data = response.json()

            # Convert to Models
            fixtures = [Fixture(**f) for f in data]

        # Enrich with team names and H2H Stats
        for f in fixtures:
            h_team = teams.get(f.team_h)
            a_team = teams.get(f.team_a)
            f.team_h_name = h_team["name"] if h_team else "Unknown"
            f.team_h_short = h_team["short_name"] if h_team else "UNK"
            f.team_a_name = a_team["name"] if a_team else "Unknown"
            f.team_a_short = a_team["short_name"] if a_team else "UNK"
            f.team_h_code = h_team["code"] if h_team else 0
            f.team_a_code = a_team["code"] if a_team else 0

            # Calculate H2H Stats
            try:
                history = await history_service.get_h2h_history(f.team_h, f.team_a)
                total = len(history)
                if total > 0:
                    team_h_wins = 0
                    team_a_wins = 0
                    draws = 0

                    for match in history:
                        home_won = match["score_home"] > match["score_away"]
                        away_won = match["score_away"] > match["score_home"]

                        # Perspective check: history has 'home_team' name not ID easily accessible unless we parse
                        # But get_h2h_history returns standard structure where 'score_home' corresponds to 'home_team'
                        # We stored 'match_is_home' relative to REQUESTED team_h.
                        # Wait, get_h2h_history(t1, t2) returns list.
                        # In HistoryService:
                        # history.append({ ..., "match_is_home": is_home_perspective, ... })
                        # is_home_perspective = (h_id == s_home_id) where s_home_id is first arg to get_h2h_history

                        # So if match["match_is_home"] is True, then t1 was Home.
                        # If False, t1 was Away.

                        if match["match_is_home"]:
                            if home_won:
                                team_h_wins += 1
                            elif away_won:
                                team_a_wins += 1
                            else:
                                draws += 1
                        else:
                            if away_won:
                                team_h_wins += 1
                            elif home_won:
                                team_a_wins += 1
                            else:
                                draws += 1

                    f.history_stats = {
                        "team_h_win": round((team_h_wins / total) * 100),
                        "draw": round((draws / total) * 100),
                        "team_a_win": round((team_a_wins / total) * 100),
                        "total": total,
                    }

                    # Venue Specific Stats
                    venue_matches = [m for m in history if m["match_is_home"]]
                    venue_total = len(venue_matches)

                    if venue_total > 0:
                        v_h_wins = 0
                        v_a_wins = 0
                        v_draws = 0

                        for match in venue_matches:
                            # For these matches, match_is_home is ALWAYS True
                            home_won = match["score_home"] > match["score_away"]
                            away_won = match["score_away"] > match["score_home"]

                            if home_won:
                                v_h_wins += 1
                            elif away_won:
                                v_a_wins += 1
                            else:
                                v_draws += 1

                        f.history_stats_venue = {
                            "team_h_win": round((v_h_wins / venue_total) * 100),
                            "draw": round((v_draws / venue_total) * 100),
                            "team_a_win": round((v_a_wins / venue_total) * 100),
                            "total": venue_total,
                        }
            except Exception as e:
                print(
                    f"DEBUG: Failed to calc stats for {f.team_h_name} vs {f.team_a_name}: {e}"
                )

        return fixtures

    async def get_pulse_lineup(self, pulse_match_id: int) -> Dict[str, Any]:
        url = f"https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v3/matches/{pulse_match_id}/lineups"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"DEBUG: Failed to fetch pulse lineup for {pulse_match_id}: {e}")
        return {}

    async def get_teams(self) -> List[Team]:
        bootstrap = await self.get_bootstrap_static()
        return [Team(**t) for t in bootstrap["teams"]]

    async def get_club_squad(
        self, club_id: int, gw: int | None = None
    ) -> Dict[str, Any]:
        print(f"DEBUG: get_club_squad called for club {club_id} with gw={gw}")
        bootstrap = await self.get_bootstrap_static()
        current_gw = await self.get_current_gameweek()
        if gw is None:
            gw = current_gw
        else:
            gw = int(gw)

        teams_map = {t["id"]: t for t in bootstrap["teams"]}
        club_team = teams_map.get(club_id)
        club_code = club_team["code"] if club_team else None

        # Get all players for this club
        club_players = [e for e in bootstrap["elements"] if e["team"] == club_id]

        if not club_players:
            return {"squad": [], "team": teams_map.get(club_id, {}), "gameweek": gw}

        try:
            live_data = await self.get_event_live(gw)
            live_elements = {e["id"]: e["stats"] for e in live_data["elements"]}
        except Exception:
            live_elements = {}

        # Fetch fixtures for this GW
        fixtures = await self.get_fixtures()
        # Filter for club fixtures in this GW
        club_fixtures = [
            f
            for f in fixtures
            if f.event == gw and (f.team_h == club_id or f.team_a == club_id)
        ]

        # Attempt to get Official Lineup from Pulse API
        starting_xi_codes = []
        subs_codes = []
        matchday_codes = set()

        # Use simple logic: Take the first fixture found for this club in this GW
        # (Handles DGW by just taking the first one found - could be improved to merge or select active)
        if club_fixtures and club_code:
            match = club_fixtures[0]
            # pulse_id might not be in the model if I didn't add 'code'.
            # My Fixture model has 'id', 'event', 'team_h'... does it have 'code'?
            # Check models.py. Fixture: id, event, team_h, team_a, team_h_score, team_a_score, finished, kickoff_time.
            # It IS MISSING 'code' (which is the pulse id).
            # I must update Fixture model first or access raw if I kept it?
            # I replaced the cache with objects. I lost 'code'.
            # CRITICAL: I need to add 'code' to Fixture model.

            # Reverting strategy: I need to add 'code' to Fixture model in models.py BEFORE updating usage, or I lose data.
            pulse_id = match.code
            if pulse_id:
                lineup_data = await self.get_pulse_lineup(pulse_id)
                if lineup_data:
                    # Determine if we are home or away match for lineup parsing
                    # match["team_h"] is FPL ID. club_id is FPL ID.
                    is_home_model = match.team_h == club_id

                    # Pulse data separates by home_team / away_team objects
                    # But we should verify Team ID matches just in case.
                    # Pulse Team ID == FPL Team Code.

                    target_team_data = None
                    if is_home_model:
                        target_team_data = lineup_data.get("home_team")
                    else:
                        target_team_data = lineup_data.get("away_team")

                    # Double check matches club_code if possible, but trust home/away logic
                    if target_team_data:
                        # Extract Matchday Squad
                        players_list = target_team_data.get("players", [])
                        for p in players_list:
                            try:
                                matchday_codes.add(int(p.get("id")))
                            except ValueError:
                                pass

                        # Extract Lineup (Nested Arrays)
                        # "lineup": [["GK_ID"], ["DEF...], ...]
                        lineup_groups = target_team_data.get("formation", {}).get(
                            "lineup", []
                        )
                        for group in lineup_groups:
                            for player_id_str in group:
                                try:
                                    starting_xi_codes.append(int(player_id_str))
                                except ValueError:
                                    pass

                        # Extract Subs (Simple List)
                        # "subs": ["ID", ...]
                        subs_list = target_team_data.get("formation", {}).get(
                            "subs", []
                        )
                        for player_id_str in subs_list:
                            try:
                                subs_codes.append(int(player_id_str))
                            except ValueError:
                                pass

        fixture_strs = []
        max_difficulty = 0
        started = False
        finished = False
        primary_opponent_id = None

        for i, f in enumerate(club_fixtures):
            is_home = f.team_h == club_id
            opponent_id = f.team_a if is_home else f.team_h
            if i == 0:
                primary_opponent_id = opponent_id
            opp_short = teams_map.get(opponent_id, {}).get("short_name", "UNK")
            char = "(H)" if is_home else "(A)"
            fixture_strs.append(f"{opp_short} {char}")
            diff = f.team_h_difficulty if is_home else f.team_a_difficulty
            if diff > max_difficulty:
                max_difficulty = diff

            if f.started:
                started = True
            if f.finished:
                finished = True

        fixture_str = ", ".join(fixture_strs) if fixture_strs else "No Fixture"
        if not fixture_strs:
            max_difficulty = 0

        squad = []
        for player in club_players:
            # Filter by Matchday Squad if available
            if matchday_codes and player["code"] not in matchday_codes:
                continue

            stats = live_elements.get(player["id"], {})
            event_points = stats.get("total_points", 0)
            minutes = stats.get("minutes", 0)

            # Determine Rank for Sorting
            # 0 = Starter (In ordered list)
            # 1 = Sub
            # 2 = Everyone else

            p_code = player["code"]
            sort_rank = 2
            lineup_index = 999

            if p_code in starting_xi_codes:
                sort_rank = 0
                lineup_index = starting_xi_codes.index(p_code)
            elif p_code in subs_codes:
                sort_rank = 1
                lineup_index = subs_codes.index(p_code)

            squad.append(
                {
                    "id": player["id"],
                    "name": player["web_name"],
                    "full_name": f"{player['first_name']} {player['second_name']}",
                    "position": player["element_type"],
                    "team": teams_map.get(club_id, {}).get("name", "Unknown"),
                    "team_short": teams_map.get(club_id, {}).get("short_name", "UNK"),
                    "team_code": teams_map.get(club_id, {}).get("code", 0),
                    "cost": player["now_cost"] / 10,
                    "status": player["status"],
                    "news": player["news"],
                    "form": player["form"],
                    "event_points": event_points,
                    "minutes": minutes,
                    "total_points": player["total_points"],
                    "fixture": fixture_str,
                    "fixture_difficulty": max_difficulty,
                    "match_started": started,
                    "match_finished": finished,
                    "chance_of_playing": player["chance_of_playing_next_round"],
                    "code": player["code"],
                    "is_captain": False,
                    "is_vice_captain": False,
                    "purchase_price": player["now_cost"] / 10,
                    "selling_price": player["now_cost"] / 10,
                    "opponent_id": primary_opponent_id,
                    # Internal sort helpers
                    "_sort_rank": sort_rank,
                    "_lineup_index": lineup_index,
                }
            )

        # Sorting Logic
        if starting_xi_codes:
            # If we have official lineup data, sort by:
            # 1. Rank (Starter, Sub, Reserve)
            # 2. Lineup Index (Order in the formation/sub list)
            squad.sort(key=lambda x: (x["_sort_rank"], x["_lineup_index"]))
        else:
            # Fallback: Minutes played in GW -> Total Points
            squad.sort(key=lambda x: (x["minutes"], x["total_points"]), reverse=True)

        # Cleanup internal keys
        for p in squad:
            p.pop("_sort_rank", None)
            p.pop("_lineup_index", None)

        # Process all fixtures for the club (Season Schedule)
        club_schedule = []
        all_fixtures = await self.get_fixtures()
        relevant_fixtures = [
            f for f in all_fixtures if f.team_h == club_id or f.team_a == club_id
        ]
        # Sort by event/kickoff
        relevant_fixtures.sort(key=lambda x: x.event or 999)

        for f in relevant_fixtures:
            is_home = f.is_home_for(club_id)
            opponent_id = f.get_opponent_id(club_id)
            opp_team = teams_map.get(opponent_id, {})

            # Calculate result if finished
            result = None
            score = None
            if f.finished:
                h_score = f.team_h_score
                a_score = f.team_a_score
                score = f"{h_score}-{a_score}"

                if h_score is not None and a_score is not None:
                    if is_home:
                        if h_score > a_score:
                            result = "W"
                        elif h_score < a_score:
                            result = "L"
                        else:
                            result = "D"
                    else:
                        if a_score > h_score:
                            result = "W"
                        elif a_score < h_score:
                            result = "L"
                        else:
                            result = "D"

            club_schedule.append(
                {
                    "event": f.event,
                    "opponent_name": opp_team.get("name", "Unknown"),
                    "opponent_short": opp_team.get("short_name", "UNK"),
                    "opponent_code": opp_team.get("code"),
                    "is_home": is_home,
                    "difficulty": f.get_difficulty_for(club_id),
                    "finished": f.finished,
                    "score": score,
                    "result": result,
                    "kickoff_time": f.kickoff_time,
                }
            )

        return {
            "squad": squad,
            "team": teams_map.get(club_id, {}),
            "gameweek": gw,
            "fixtures": club_schedule,
        }

    async def get_club_summary(self, club_id: int) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        teams_map = {t["id"]: t for t in bootstrap["teams"]}
        team = teams_map.get(club_id)
        if not team:
            return {}

        # Get top 5 players
        club_players = [p for p in bootstrap["elements"] if p["team"] == club_id]
        club_players.sort(key=lambda x: x["total_points"], reverse=True)
        top_players = club_players[:5]

        # Simple format for top players
        top_players_data = []
        for p in top_players:
            top_players_data.append(
                {
                    "id": p["id"],
                    "web_name": p["web_name"],
                    "total_points": p["total_points"],
                    "element_type": p["element_type"],
                    "cost": p["now_cost"] / 10,
                    "photo": p["photo"].replace(
                        ".jpg", ".png"
                    ),  # Ensure .png for consistent URL usage if needed, though usually .png is ID based
                }
            )

        # Get next 3 fixtures
        fixtures = await self.get_fixtures()

        # Find next fixtures & recent results
        upcoming = []
        recent = []

        # Sort by event
        fixtures.sort(key=lambda x: x.event or 999)

        # Separate fixtures into past and future
        # Note: fixtures are sorted by event ascending (1, 2, 3...)

        # 1. Collect all club fixtures
        club_fixtures = [
            f for f in fixtures if f.team_h == club_id or f.team_a == club_id
        ]

        # 2. Upcoming (first 3 that are not finished)
        future_fixtures = [
            f for f in club_fixtures if not f.finished and not f.finished_provisional
        ][:5]

        # 3. Recent (last 3 that ARE finished or provisionally finished)
        past_fixtures = [
            f
            for f in club_fixtures
            if (f.finished or f.finished_provisional)
            and f.team_h_score is not None
            and f.team_a_score is not None
        ]
        past_fixtures.sort(key=lambda x: x.event or 0, reverse=True)  # Sort desc
        recent_fixtures = past_fixtures

        for f in future_fixtures:
            is_home = f.is_home_for(club_id)
            opponent_id = f.get_opponent_id(club_id)
            opp_team = teams_map.get(opponent_id, {})
            upcoming.append(
                {
                    "id": f.id,
                    "event": f.event,
                    "opponent_name": opp_team.get("name", "Unknown"),
                    "opponent_short": opp_team.get("short_name", "UNK"),
                    "is_home": is_home,
                    "difficulty": f.get_difficulty_for(club_id),
                    "kickoff_time": f.kickoff_time,
                }
            )

        for f in recent_fixtures:
            is_home = f.is_home_for(club_id)
            opponent_id = f.get_opponent_id(club_id)
            opp_team = teams_map.get(opponent_id, {})

            h_score = f.team_h_score
            a_score = f.team_a_score
            score = f"{h_score}-{a_score}"

            result = "D"
            if is_home:
                if h_score > a_score:
                    result = "W"
                elif h_score < a_score:
                    result = "L"
            else:
                if a_score > h_score:
                    result = "W"
                elif a_score < h_score:
                    result = "L"

            recent.append(
                {
                    "id": f.id,
                    "event": f.event,
                    "opponent_name": opp_team.get("name", "Unknown"),
                    "opponent_short": opp_team.get("short_name", "UNK"),
                    "is_home": is_home,
                    "score": score,
                    "result": result,
                    "difficulty": f.get_difficulty_for(club_id),
                    "kickoff_time": f.kickoff_time,
                }
            )

        return {
            "team": team,
            "top_players": top_players_data,
            "upcoming_fixtures": upcoming,
            "recent_results": recent,
        }

    async def get_current_gameweek(self) -> int:
        data = await self.get_bootstrap_static()
        for event in data["events"]:
            if event["is_current"]:
                return event["id"]
        # Fallback if no current (e.g. pre-season)
        for event in data["events"]:
            if event["is_next"]:
                return max(1, event["id"] - 1)
        return 38

    async def get_gameweek_status(self) -> Dict[str, Any]:
        data = await self.get_bootstrap_static()
        now = time.time()

        # 1. Try to find current event
        current_event = None
        for event in data["events"]:
            if event["is_current"]:
                current_event = event
                break

        # 2. If current event exists and is finished, we want to return the NEXT event instead
        # FPL "is_current" stays True until the next gw update, which might be days after it finished.
        if current_event:
            if current_event["finished"]:
                # Find the next event
                for event in data["events"]:
                    if event["is_next"]:
                        deadline = event.get("deadline_time_epoch", 0)
                        started = now > deadline
                        return {
                            "id": event["id"],
                            "finished": event["finished"],
                            "data_checked": event["data_checked"],
                            "started": started,
                        }

            # If not finished, or no next event found (e.g. end of season), return current
            deadline = current_event.get("deadline_time_epoch", 0)
            started = now > deadline
            return {
                "id": current_event["id"],
                "finished": current_event["finished"],
                "data_checked": current_event["data_checked"],
                "started": started,
            }

        # 3. Fallback if no current (e.g. pre-season)
        for event in data["events"]:
            if event["is_next"]:
                prev_id = max(1, event["id"] - 1)
                return {
                    "id": prev_id,
                    "finished": True,  # Assume prev is finished
                    "data_checked": True,
                    "started": True,
                }
        return {"id": 38, "finished": True, "data_checked": True, "started": True}

    async def get_next_gameweek_id(self) -> int:
        data = await self.get_bootstrap_static()
        for event in data["events"]:
            if event["is_next"]:
                return event["id"]
        return 38

    async def get_league_table(self, min_gw: int = 1, max_gw: int = 38) -> list:
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
        fixtures.sort(key=lambda x: x.kickoff_time if x.kickoff_time else "")

        for f in fixtures:
            if not f.finished and not f.finished_provisional:
                continue

            # Filtering by Gameweek Range
            if f.event is None:
                continue

            if not (min_gw <= f.event <= max_gw):
                continue

            h_id = f.team_h
            a_id = f.team_a
            h_score = f.team_h_score
            a_score = f.team_a_score

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

    async def get_player_summary(
        self, player_id: int, opponent_id: int | None = None
    ) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}
        elements = {p["id"]: p for p in bootstrap["elements"]}

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

            # Get History vs Opponent (Next or Specific)
            try:
                target_opponent_id = None

                if opponent_id:
                    target_opponent_id = opponent_id
                elif data.get("fixtures") and len(data["fixtures"]) > 0:
                    next_fixture = data["fixtures"][0]
                    player = elements.get(player_id)
                    if player:
                        my_team_id = player["team"]
                        if next_fixture["team_h"] == my_team_id:
                            target_opponent_id = next_fixture["team_a"]
                        else:
                            target_opponent_id = next_fixture["team_h"]

                if target_opponent_id:
                    opponent = teams.get(target_opponent_id)
                    player = elements.get(player_id)

                    if opponent and player:
                        opponent_name = opponent["name"]
                        player_full_name = (
                            f"{player['first_name']} {player['second_name']}"
                        )

                        from .history_service import HistoryService

                        history_service = HistoryService()

                        vs_history = await history_service.get_player_history_vs_team(
                            player_full_name, opponent_name
                        )
                        data["history_vs_opponent"] = vs_history
                        data["next_opponent_name"] = opponent_name
            except Exception as e:
                print(f"DEBUG: Failed to fetch history vs opponent: {e}")

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
        gw_fixtures = [f for f in fixtures if f.event == gw]

        # Map team ID to fixture info
        team_fixture = {}
        for f in gw_fixtures:
            # Home team
            team_fixture[f.team_h] = {
                "opponent_id": f.team_a,
                "is_home": True,
                "score": f"{f.team_h_score}-{f.team_a_score}" if f.finished else None,
            }
            # Away team
            team_fixture[f.team_a] = {
                "opponent_id": f.team_h,
                "is_home": False,
                "score": f"{f.team_a_score}-{f.team_h_score}" if f.finished else None,
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
            opponent_id = None
            if fixture_info:
                opponent = teams.get(fixture_info["opponent_id"])
                opp_short = opponent["short_name"] if opponent else "UNK"
                home_away = "(H)" if fixture_info["is_home"] else "(A)"
                fixture_str = f"{opp_short} {home_away}"
                opponent_id = fixture_info["opponent_id"]

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
                    "news": player["news"],
                    "is_captain": False,
                    "is_vice_captain": False,
                    "fixture_difficulty": 3,  # Default, not really needed for dream team
                    "opponent_id": opponent_id,
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
                    "code": player["code"],
                    "news": player["news"],
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

    async def get_aggregated_player_stats(
        self, min_gw: int, max_gw: int, venue: str = "both"
    ) -> list[dict]:
        """
        Aggregates player stats (points) over a range of gameweeks, optionally filtering by venue.
        venue: 'both', 'home', 'away'
        """
        # 1. Fetch base data
        bootstrap = await self.get_bootstrap_static()
        elements = {p["id"]: p for p in bootstrap["elements"]}
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # 2. Fetch fixtures for the season (cached) to determine H/A status
        all_fixtures = await self.get_fixtures()
        # Index fixtures by (gw, team_id) -> is_home?
        # Actually, a fixture has team_h and team_a.
        # We need a quick lookup: map[gw][team_id] -> 'home' or 'away'
        venue_map = {}  # {gw: {team_id: 'home'|'away'}}
        for fix in all_fixtures:
            event = fix.event
            if event is None:
                continue
            if event not in venue_map:
                venue_map[event] = {}
            venue_map[event][fix.team_h] = "home"
            venue_map[event][fix.team_a] = "away"

        # Helper map for fixtures to support DGWs and precise points attribution
        fixture_lookup = {f.id: f for f in all_fixtures}

        # 3. Fetch live data for each GW in range in parallel
        tasks = []
        # If range is invalid, default to current GW only? Or return empty?
        # Assuming caller safeguards.
        # Check against available GWs

        # Check if ranges are reasonable
        if min_gw < 1:
            min_gw = 1
        if max_gw < min_gw:
            max_gw = min_gw

        for gw in range(min_gw, max_gw + 1):
            tasks.append(self.get_event_live(gw))

        gw_results = await asyncio.gather(*tasks, return_exceptions=True)

        player_stats = {}  # pid -> {total_points: 0, games: 0, etc}

        for i, result in enumerate(gw_results):
            gw = min_gw + i
            if isinstance(result, Exception):
                # GW might not have happened yet or API error
                continue

            # result is the live data struct: { elements: [ {id, stats: {total_points, ...}, explain: []}, ... ] }
            live_elements = result.get("elements", [])

            for el in live_elements:
                pid = el["id"]
                points = el["stats"].get("total_points", 0)

                # Check venue filter
                player = elements.get(pid)
                if not player:
                    continue

                team_id = player["team"]

                # If filter is 'both', we take the total points for this GW directly (easiest)
                # UNLESS we want to support 'home' or 'away'
                # If venue != 'both', we must inspect 'explain' to separate points from Home vs Away games in this GW (DGW support)

                points_to_add = 0
                matches_to_add = 0

                if venue == "both":
                    points_to_add = points
                    # matches logic
                    explains = el.get("explain", [])
                    for expl in explains:
                        mins = next(
                            (
                                s["value"]
                                for s in expl.get("stats", [])
                                if s["identifier"] == "minutes"
                            ),
                            0,
                        )
                        if mins > 0:
                            matches_to_add += 1
                else:
                    # Filter by venue
                    explains = el.get("explain", [])
                    for expl in explains:
                        fixture_id = expl["fixture"]
                        fix_info = fixture_lookup.get(fixture_id)
                        if not fix_info:
                            continue

                        is_home = fix_info.is_home_for(team_id)

                        target_venue = venue.lower()
                        should_include = False

                        if target_venue == "home" and is_home:
                            should_include = True
                        elif target_venue == "away" and not is_home:
                            should_include = True

                        if should_include:
                            fix_points = sum(s["points"] for s in expl.get("stats", []))
                            points_to_add += fix_points
                            mins = next(
                                (
                                    s["value"]
                                    for s in expl.get("stats", [])
                                    if s["identifier"] == "minutes"
                                ),
                                0,
                            )
                            if mins > 0:
                                matches_to_add += 1

                if points_to_add == 0 and venue != "both":
                    # If we filtered out all points, do we still count it?
                    # Yes, but value is 0.
                    pass

                if pid not in player_stats:
                    player_stats[pid] = {
                        "id": pid,
                        "points_in_range": 0,
                        "matches_in_range": 0,
                    }

                player_stats[pid]["points_in_range"] += points_to_add
                player_stats[pid]["matches_in_range"] += matches_to_add

        # Format result
        results = []

        # We iterate over ALL elements to ensure full list is returned (even those with 0 points)
        # Or do we only return those with points?
        # User usually wants to see the table of all players often.
        # But if we return 700 players, it's fine.

        for pid, p in elements.items():
            stats = player_stats.get(pid, {"points_in_range": 0})

            # Simple derived stats

            # Avoid sending huge data if not needed? frontend truncates usually.

            summary = {
                "id": pid,
                "web_name": p["web_name"],
                "full_name": f"{p['first_name']} {p['second_name']}",
                "team_code": teams[p["team"]]["code"] if p["team"] in teams else 0,
                "team_short": teams[p["team"]]["short_name"]
                if p["team"] in teams
                else "UNK",
                "element_type": p["element_type"],  # Position
                "now_cost": p["now_cost"] / 10.0,
                "total_points": p["total_points"],  # Season total
                "points_in_range": stats["points_in_range"],
                "news": p["news"],
                "status": p["status"],
                "photo": p["photo"].replace(".jpg", ""),
                "code": p["code"],
                "chance_of_playing_next_round": p["chance_of_playing_next_round"],
                "matches_in_range": stats.get("matches_in_range", 0),
                "points_per_game": round(
                    stats.get("points_in_range", 0) / stats.get("matches_in_range", 1),
                    1,
                )
                if stats.get("matches_in_range", 0) > 0
                else 0.0,
            }
            results.append(summary)

        # Sort by points in range desc
        results.sort(key=lambda x: x["points_in_range"], reverse=True)
        return results

    async def get_polymarket_data(self) -> list:
        # Cache check
        cache_key = "polymarket_premier_league_v10"  # Bump version
        now = time.time()
        # Cache for 10 minutes
        if (
            cache_key in self._cache
            and (now - self._last_updated.get(cache_key, 0)) < 600
        ):
            return self._cache[cache_key]

        url = "https://gamma-api.polymarket.com/events"
        params = {
            "tag_id": "306",
            "active": "true",
            "closed": "false",
            "limit": 100,
            "order": "volume",
            "ascending": "false",
        }
        # Use the static mapping imported from team_details
        # No need to build it dynamically

        # Fetch Gameweek Deadlines
        try:
            static_data = await self.get_bootstrap_static()
            events = static_data.get("events", [])
            events = [e for e in events if e.get("deadline_time")]
            events.sort(key=lambda x: x["deadline_time"])
        except Exception:
            events = []

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                markets = []
                for item in data:
                    title = item.get("title") or item.get("question") or ""

                    # Filter for match events
                    if " vs " not in title.lower() and " vs. " not in title.lower():
                        continue

                    # Filter out "More Markets"
                    if " - More" in title or "More Markets" in title:
                        continue

                    # Parse Home/Away names from title
                    separator = " vs " if " vs " in title else " vs. "
                    try:
                        home_raw, away_raw = title.split(separator)

                        # Helper to normalize/clean strings for lookup
                        def normalize(n):
                            return n.strip().lower()

                        # Try to find in mapping
                        h_key = normalize(home_raw)
                        a_key = normalize(away_raw)

                        home_fpl = TEAM_MAPPINGS.get(h_key)
                        away_fpl = TEAM_MAPPINGS.get(a_key)

                        # If not found, try simple cleaning (removing FC/AFC)
                        if not home_fpl:
                            clean = (
                                home_raw.replace(" FC", "")
                                .replace(" AFC", "")
                                .strip()
                                .lower()
                            )
                            home_fpl = TEAM_MAPPINGS.get(clean)

                        if not away_fpl:
                            clean = (
                                away_raw.replace(" FC", "")
                                .replace(" AFC", "")
                                .strip()
                                .lower()
                            )
                            away_fpl = TEAM_MAPPINGS.get(clean)

                        # Display Names (use mapped name if available, else raw)
                        home_clean = home_fpl["name"] if home_fpl else home_raw.strip()
                        away_clean = away_fpl["name"] if away_fpl else away_raw.strip()

                        # Keep full names for matching loop below
                        home_name = home_raw.strip()
                        away_name = away_raw.strip()

                    except ValueError:
                        continue

                    # Calculate Gameweek
                    gameweek = None
                    match_date = item.get("endDate")
                    if events and match_date:
                        # Find the last deadline that is BEFORE the match date
                        for e in events:
                            if e["deadline_time"] < match_date:
                                gameweek = e["id"]
                            else:
                                # Since events are sorted by deadline, once we hit a deadline > match_date,
                                # the previous one was the correct gameweek.
                                break

                    home_data = {
                        "name": home_clean,
                        "short_name": home_fpl["short_name"]
                        if home_fpl
                        else home_clean[:3].upper(),
                        "code": home_fpl["code"] if home_fpl else None,
                    }
                    away_data = {
                        "name": away_clean,
                        "short_name": away_fpl["short_name"]
                        if away_fpl
                        else away_clean[:3].upper(),
                        "code": away_fpl["code"] if away_fpl else None,
                    }

                    event_markets = item.get("markets", [])
                    home_price = 0.0
                    away_price = 0.0
                    draw_price = 0.0

                    # Logic to find the specific markets
                    for market in event_markets:
                        question = market.get("question", "")
                        m_outcomes = market.get("outcomes", [])
                        if isinstance(m_outcomes, str):
                            import json

                            m_outcomes = json.loads(m_outcomes)

                        m_prices = market.get("outcomePrices", [])
                        if isinstance(m_prices, str):
                            import json

                            m_prices = json.loads(m_prices)

                        yes_price = 0.0
                        if m_outcomes and "Yes" in m_outcomes and m_prices:
                            try:
                                yes_index = m_outcomes.index("Yes")
                                yes_price = float(m_prices[yes_index])
                            except (ValueError, IndexError):
                                pass

                        # Match logic
                        if " draw" in question.lower() or "draw " in question.lower():
                            draw_price = yes_price
                        elif home_name in question:
                            home_price = yes_price
                        elif away_name in question:
                            away_price = yes_price

                    # Strict check: Must have at least Home and Away prices (Draw sometimes missing in rare formats, but for EPL 1x2 it should be there)
                    # Let's say we need at least 2 non-zero prices to correspond to a valid market match
                    valid_prices = sum(
                        [1 for p in [home_price, draw_price, away_price] if p > 0]
                    )
                    if valid_prices < 2:
                        continue

                    # Structure outcomes specifically as Home, Draw, Away
                    # Use Clean Names for display
                    market_outcomes = [
                        {"label": home_clean, "price": home_price},
                        {"label": "Draw", "price": draw_price},
                        {"label": away_clean, "price": away_price},
                    ]

                    # Construct clean title
                    # clean_title = f"{home_clean} vs {away_clean}"

                    markets.append(
                        {
                            "id": item.get("id"),
                            "question": item.get("title")
                            or item.get("question")
                            or f"{home_clean} vs {away_clean}",
                            "slug": item.get("slug"),
                            "outcomes": market_outcomes,
                            "volume": float(item.get("volume"))
                            if item.get("volume")
                            else 0.0,
                            "endDate": item.get("endDate"),
                            "image": item.get("image") or item.get("icon"),
                            "group": item.get("group"),
                            "home_team": home_data,
                            "away_team": away_data,
                            "gameweek": gameweek,
                        }
                    )
                # Sort by Date ascending (soonest first)
                markets.sort(key=lambda x: x["endDate"])

                # Cache top 50 to cover multiple gameweeks if available
                final_list = markets[:50]
                self._cache[cache_key] = final_list
                self._last_updated[cache_key] = now
                return final_list
            except Exception as e:
                logger.error(f"Failed to fetch Polymarket data: {e}")
                return []

    async def get_optimized_team(
        self,
        budget: float = 100.0,
        min_gw: int | None = None,
        max_gw: int | None = None,
        exclude_bench: bool = False,
        exclude_unavailable: bool = False,
        predictions: Dict[int, float] | None = None,
    ) -> Dict[str, Any]:
        bootstrap = await self.get_bootstrap_static()
        elements = bootstrap["elements"]
        current_gw = await self.get_current_gameweek()

        # Default range
        if min_gw is None:
            min_gw = 1
        if max_gw is None:
            max_gw = current_gw

        # Determine if we need to fetch history (partial range)
        # If requesting full history (1 to current), use bootstrap total_points (FAST)
        # Otherwise, need detailed history (SLOW)
        use_history = False
        if min_gw > 1 or max_gw < current_gw:
            use_history = True

        logger.info(
            f"Optimization: Budget={budget}, GW {min_gw}-{max_gw}, Use History={use_history}, Exclude Bench={exclude_bench}, Exclude Unavailable={exclude_unavailable}, Use Predictions={bool(predictions)}"
        )

        players = []

        # Filter candidates first to reduce requests if using history
        # If exclude_bench is On, we MUST include valid fodder (low cost, potentially 0 points).
        # To avoid fetching history for everyone, we can assume players with 0 total points have 0 window points.
        candidates = elements
        if not exclude_bench:
            # Standard optimization: skip players with 0 total points
            candidates = [p for p in elements if p["total_points"] > 0]

        # Apply Availability Filter
        if exclude_unavailable:
            # Filter out players who cannot play.
            # Criteria: status is NOT 'a' (available) or chance_of_playing_next_round is 0.
            # 'd' (doubtful) usually has chance of 75/50/25.
            # 'i' (injured), 's' (suspended), 'u' (unavailable), 'n' (loan) usually chance is 0.

            # We want to be strict if the user asks for it.
            # Exclude if chance is explicitly 0, or status is in [i, s, u, n]

            filtered_candidates = []
            for p in candidates:
                chance = p.get("chance_of_playing_next_round")
                status = p.get("status")

                # If chance is known and 0, definitely exclude
                if chance is not None and chance == 0:
                    continue

                # If status is permanently unavailable types
                if status in ["u", "i", "s", "n"]:
                    # Double check chance? Sometimes status is 'i' but chance is 75 (returning)?
                    # Usually chance overrides status. If chance is None (100) but status is 'i', it's weird.
                    # Let's trust chance if it exists.
                    if chance is None:
                        # If chance is None, it implies 100%. But if status is 'i', maybe they just got injured and chance hasn't updated?
                        # Safest to exclude if status implies definitely out. 'i' might be short term.
                        # 's' (suspended) is definite.
                        # 'u' (unavailable) is definite.
                        # 'n' (loan) is definite.
                        if status in ["s", "u", "n"]:
                            continue
                        # If 'i', and chance is None, maybe recent injury? Let's check news?
                        # Simpler: If user says exclude unavailable, they probably mean red flags.

                # If chance is strictly less than 100? User said "cannot play".
                # A 75% chance player CAN play.
                # So we only exclude 0% chance players or definitely suspended.

                # Let's use a simpler robust logic:
                # Exclude if chance == 0
                # OR status == 's' (Suspended)
                # OR status == 'u' (Unavailable)
                # OR status == 'n' (Loan)

                if chance == 0:
                    continue
                if status == "s" or status == "u" or status == "n":
                    continue

                filtered_candidates.append(p)
            candidates = filtered_candidates

        player_period_points = {}  # pid -> adjusted points

        if predictions:
            # Use provided predictions
            player_period_points = predictions
        elif use_history:
            # Batch fetch histories
            # We need to fetch element-summary for each candidate
            sem = asyncio.Semaphore(20)  # Concurrency limit

            async def fetch_player_points(client, pid):
                async with sem:
                    try:
                        resp = await client.get(
                            f"{FPL_BASE_URL}/element-summary/{pid}/"
                        )
                        resp.raise_for_status()
                        data = resp.json()
                        history = data.get("history", [])
                        # Sum points in range
                        pts = sum(
                            h["total_points"]
                            for h in history
                            if min_gw <= h["round"] <= max_gw
                        )
                        return pid, pts
                    except Exception as e:
                        logger.error(f"Failed to fetch history for {pid}: {e}")
                        return pid, 0

            async with httpx.AsyncClient() as client:
                # Optimized task creation: Only fetch history if player has total_points > 0.
                # If total_points is 0 (fodder), their window points must be 0.
                tasks = []
                for p in candidates:
                    if p["total_points"] > 0:
                        tasks.append(fetch_player_points(client, p["id"]))
                    else:
                        # Implicitly 0 points, no need to fetch
                        pass

                results = await asyncio.gather(*tasks)
                for pid, pts in results:
                    player_period_points[pid] = pts
        else:
            # Use total_points from bootstrap
            for p in candidates:
                player_period_points[p["id"]] = p["total_points"]

        # Prepare for Solver
        for p in candidates:
            # Use calculated points
            points = player_period_points.get(p["id"], 0)

            # Skip players with 0 points in the period to reduce problem size
            # BUT if exclude_bench is True, we need them for fodder.
            # AND if explicit predictions are used, we might trust 0?
            if not exclude_bench and points <= 0:
                continue

            players.append(
                {
                    "id": p["id"],
                    "name": p["web_name"],
                    "full_name": f"{p['first_name']} {p['second_name']}",
                    "position": p["element_type"],  # 1:GKP, 2:DEF, 3:MID, 4:FWD
                    "team": p["team"],
                    "cost": p["now_cost"] / 10.0,
                    "points": points,
                    "form": float(p["form"]),
                    "status": p["status"],
                    "news": p["news"],
                    "code": p["code"],
                }
            )

        # Problem Definition
        prob = pulp.LpProblem("FPL_Team_Optimization", pulp.LpMaximize)

        # Decision Variables
        # x[i] = 1 if player i is selected, 0 otherwise
        player_vars = pulp.LpVariable.dicts(
            "Player", [p["id"] for p in players], cat="Binary"
        )

        # Objective Function
        if exclude_bench:
            # If excluding bench points, we verify optimization based on Starting XI only.
            # We need additional variables for "Starter".
            starter_vars = pulp.LpVariable.dicts(
                "Starter", [p["id"] for p in players], cat="Binary"
            )

            # Link Starter to Squad: if starter, must be in squad
            for p in players:
                prob += starter_vars[p["id"]] <= player_vars[p["id"]]

            # 11 Starters
            prob += (
                pulp.lpSum([starter_vars[p["id"]] for p in players]) == 11,
                "Starter Count",
            )

            # Formation Constraints (Starters)
            # 1 GK
            prob += (
                pulp.lpSum(
                    [starter_vars[p["id"]] for p in players if p["position"] == 1]
                )
                == 1,
                "Starter GKP",
            )
            # Min 3 DEF
            prob += (
                pulp.lpSum(
                    [starter_vars[p["id"]] for p in players if p["position"] == 2]
                )
                >= 3,
                "Starter Min DEF",
            )
            # Min 1 FWD
            prob += (
                pulp.lpSum(
                    [starter_vars[p["id"]] for p in players if p["position"] == 4]
                )
                >= 1,
                "Starter Min FWD",
            )

            # Objective: Maximize Starter Points - 0.001 * Total Cost (to prefer cheaper bench/squad)
            prob += (
                pulp.lpSum([p["points"] * starter_vars[p["id"]] for p in players])
                - 0.001
                * pulp.lpSum([p["cost"] * player_vars[p["id"]] for p in players]),
                "Total Points",
            )

        else:
            # Objective Function: Maximize Total Points (All 15)
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
                is_starter = True
                if exclude_bench:
                    is_starter = pulp.value(starter_vars[p["id"]]) == 1

                selected_players.append(
                    {
                        **p,
                        "team_short": t_info["short_name"] if t_info else "UNK",
                        "team_code": t_info["code"] if t_info else 0,
                        "full_team_name": t_info["name"] if t_info else "Unknown",
                        "is_starter": is_starter,
                    }
                )
                total_cost += p["cost"]
                if not exclude_bench or is_starter:
                    total_points += p["points"]

        # Sort by Starter status (desc), then Position, then Points
        selected_players.sort(
            key=lambda x: (
                -1 if x.get("is_starter", True) else 1,
                x["position"],
                -x["points"],
            )
        )

        status = pulp.LpStatus[prob.status]

        return {
            "squad": selected_players,
            "total_points": total_points,
            "total_cost": round(total_cost, 1),
            "status": status,
            "budget_used": round(total_cost, 1),
            "gameweek_range": f"{min_gw}-{max_gw}",
        }

    async def get_advanced_fixtures(self, gw: int | None = None) -> list:
        # If gw is None, user likely wants fixtures for upcoming GWs
        # Let's say we return the next 38 - current GW fixtures
        if gw:
            start_gw = gw
        else:
            status = await self.get_gameweek_status()
            if status.get("finished"):
                start_gw = status["id"] + 1
            else:
                start_gw = status["id"]

        fixtures = await self.get_fixtures()
        bootstrap = await self.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap["teams"]}

        # Fetch Polymarket Odds
        try:
            polymarket_data = await self.get_polymarket_data()
            # Index by (gameweek, home_team_code, away_team_code) for fast lookup
            # Polymarket data has 'home_team.code' and 'away_team.code' which match FPL codes.
            market_lookup = {}
            for param in polymarket_data:
                # Check for keys safely
                if (
                    param.get("gameweek")
                    and "home_team" in param
                    and "away_team" in param
                    and param["home_team"].get("code")
                    and param["away_team"].get("code")
                ):
                    key = (
                        param["gameweek"],
                        param["home_team"]["code"],
                        param["away_team"]["code"],
                    )
                    market_lookup[key] = param
        except Exception as e:
            logger.error(f"Failed to fetch polymarket data for fixtures: {e}")
            polymarket_data = []
            market_lookup = {}

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

        # Filter futures - allow finished if it's within our target range (to align grid)
        future_fixtures = [
            f for f in fixtures if f.event is not None and f.event >= start_gw
        ]

        # Group by team
        team_fixtures = {t_id: [] for t_id in teams}

        for f in future_fixtures:
            # Home Team Perspective
            # Difficulty = Opponent Defense Strength (if we are attacking) vs Our Attack?
            # Actually, standard FDR is "How hard is it to win/get points?".
            # For attackers: Opponent Defense Strength.
            # For defenders: Opponent Attack Strength.

            h_team = teams[f.team_h]
            a_team = teams[f.team_a]

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

            # Market FDR Calculation
            # 1. Finished Games: Use actual Result.
            # 2. Future Games: Use Market Odds.
            # 3. Fallback: Use Stats.

            is_finished = f.finished_provisional or f.finished

            h_win_prob = 0.0
            a_win_prob = 0.0
            source_type = "calc"  # Default

            if is_finished:
                # Use actual result
                h_score = f.team_h_score or 0
                a_score = f.team_a_score or 0
                source_type = "result"

                if h_score > a_score:
                    h_win_prob = 1.0
                    a_win_prob = 0.0
                elif a_score > h_score:
                    h_win_prob = 0.0
                    a_win_prob = 1.0
                else:
                    # Draw - neither won
                    h_win_prob = 0.0
                    a_win_prob = 0.0

            elif f.started:
                # Game started but not finished (Live)
                # Could use live scores? For now fallback to stats or pre-game odds if cached.
                # But since we clear cache/don't have history, let's use stats as safe fallback.
                source_type = "calc"

            else:
                # Future Game - Try Market
                market_key = (f.event, h_team["code"], a_team["code"])
                market_event = market_lookup.get(market_key)

                if market_event:
                    outcomes = market_event.get("outcomes", [])
                    if len(outcomes) >= 3:
                        h_win_prob = outcomes[0]["price"]
                        a_win_prob = outcomes[2]["price"]
                        source_type = "market"

            # Fallback to Statistical Model if Market Data Missing or Invalid
            # We must have valid probabilities for BOTH sides to use the market data.
            # If we only parsed one side (e.g. Draw + Home but Failed Away), we shouldn't trust it.
            # Also if probability is suspiciously low (< 5%), it's likely a junk market or mapping error.
            # BUT if it's a result (source_type == "result"), 0.0 is valid (loss), so skip specific fallback check.
            should_fallback = False
            if source_type != "result":
                if h_win_prob < 0.05 or a_win_prob < 0.05:
                    should_fallback = True

            if should_fallback:
                # Statistical Win Probs Strategy
                # Using Team Strength (Overall)
                # Home Advantage approx +40 strength points?
                # Formula: WinProb = 0.5 + (StrengthDiff / 800)
                # StrengthDiff = (Home + Adv) - Away

                # Get Strengths (default 1000 if missing)
                h_str = h_team.get("strength_overall_home", 1000)
                a_str = a_team.get("strength_overall_away", 1000)

                # Home Advantage Weight
                home_adv = 40

                diff = (h_str + home_adv) - a_str

                # Calculate Home Win Prob
                raw_h_prob = 0.5 + (diff / 800.0)
                h_win_prob = max(0.05, min(0.95, raw_h_prob))  # Clamp

                # Calculate Away Win Prob (Inverse perspective)
                # Away Diff = Away - (Home + Adv) = -Diff
                # raw_a_prob = 0.5 + (-diff / 800.0)
                a_win_prob = max(0.05, min(0.95, 1.0 - h_win_prob))

                source_type = "calc"

            # Assume draw is residual? Or just use raw win probs for FDR?
            # For FDR we just need "How likely are WE to win".
            # If I am Home, my win prob is h_win_prob.
            # If I am Away, my win prob is a_win_prob.

            # Calculate FDR from Win Prob
            # Higher Win Prob = Lower Difficulty (Easier)
            # 1.0 prob -> 1.0 difficulty
            # 0.0 prob -> 5.0 difficulty
            # Formula: FDR = 1 + 4 * (1 - win_prob)

            home_market_fdr = 1 + 4 * (1 - h_win_prob)
            away_market_fdr = 1 + 4 * (1 - a_win_prob)

            team_fixtures[f.team_h].append(
                {
                    "gameweek": f.event,
                    "opponent": a_team["short_name"],
                    "opponent_id": f.team_a,
                    "is_home": True,
                    "fdr_official": f.team_h_difficulty,
                    "fdr_attack": round(map_strength(h_diff_attack), 2),
                    "fdr_defend": round(map_strength(h_diff_defend), 2),
                    "fdr_market": round(home_market_fdr, 2),
                    "win_prob": round(h_win_prob, 2),
                    "source_type": source_type,
                    "kickoff": f.kickoff_time,
                }
            )

            team_fixtures[f.team_a].append(
                {
                    "gameweek": f.event,
                    "opponent": h_team["short_name"],
                    "opponent_id": f.team_h,
                    "is_home": False,
                    "fdr_official": f.team_a_difficulty,
                    "fdr_attack": round(map_strength(a_diff_attack), 2),
                    "fdr_defend": round(map_strength(a_diff_defend), 2),
                    "fdr_market": round(away_market_fdr, 2),
                    "win_prob": round(a_win_prob, 2),
                    "source_type": source_type,
                    "kickoff": f.kickoff_time,
                }
            )

        # 3. Analyze "Tickers" (Next 5 GWs)
        ticker_data = []
        for t_id, fixs in team_fixtures.items():
            # Align fixtures to the global start_gw range
            aligned_next_5 = []

            # Create a lookup map for existing fixtures
            # Handle Double Gameweeks by keeping list
            fix_map = {}
            for f in fixs:
                gw = f["gameweek"]
                if gw not in fix_map:
                    fix_map[gw] = []
                fix_map[gw].append(f)

            # Iterate through the grid from start_gw to start_gw + 4
            for i in range(5):
                target_gw = start_gw + i
                gw_fixtures = fix_map.get(target_gw, [])

                if not gw_fixtures:
                    # BLANK / No Fixture
                    aligned_next_5.append(
                        {
                            "gameweek": target_gw,
                            "opponent": "-",
                            "opponent_id": None,
                            "is_home": None,
                            "fdr_official": 3,  # Neutral
                            "fdr_attack": 3,
                            "fdr_defend": 3,
                            "fdr_market": 3,
                            "win_prob": 0,
                            "source_type": "none",
                        }
                    )
                else:
                    # If multiple fixtures (DGW), we need to decide how to show them.
                    # Current UI supports one block.
                    # Complex strategy: Combine them visually?
                    # Simple strategy: Take the first one, but maybe indicate DGW?
                    # Better: If we can update frontend, great. If not, maybe concatenate Text?
                    # "AVL(H) + MCI(A)"

                    if len(gw_fixtures) == 1:
                        aligned_next_5.append(gw_fixtures[0])
                    else:
                        # Double Gameweek Logic
                        # Combine FDR (average?)
                        # Combine Opponent Name
                        f1 = gw_fixtures[0]
                        f2 = gw_fixtures[1]  # Assume max 2 for simplicity

                        fdr_market_avg = (f1["fdr_market"] + f2["fdr_market"]) / 2

                        combined = f1.copy()
                        combined["opponent"] = f"{f1['opponent']}, {f2['opponent']}"
                        combined["fdr_market"] = round(fdr_market_avg, 2)
                        combined["is_double"] = True  # Flag if needed
                        aligned_next_5.append(combined)

            if not aligned_next_5:
                continue

            avg_diff_off = sum(f["fdr_official"] for f in aligned_next_5) / 5
            avg_diff_att = sum(f["fdr_attack"] for f in aligned_next_5) / 5
            avg_diff_def = sum(f["fdr_defend"] for f in aligned_next_5) / 5
            avg_diff_mkt = sum(f["fdr_market"] for f in aligned_next_5) / 5

            ticker_data.append(
                {
                    "team_id": t_id,
                    "team_name": teams[t_id]["name"],
                    "team_short": teams[t_id]["short_name"],
                    "team_code": teams[t_id]["code"],
                    "next_5": aligned_next_5,
                    "avg_difficulty_official": round(avg_diff_off, 2),
                    "avg_difficulty_attack": round(
                        avg_diff_att, 2
                    ),  # Lower is better (easier opponent defense)
                    "avg_difficulty_defend": round(
                        avg_diff_def, 2
                    ),  # Lower is better (weaker opponent attack)
                    "avg_difficulty_market": round(avg_diff_mkt, 2),
                }
            )

        # Sort by best attacking fixtures (lowest difficulty)
        ticker_data.sort(key=lambda x: x["avg_difficulty_attack"])

        return ticker_data
