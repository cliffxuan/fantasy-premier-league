import ast
import asyncio
import io
from typing import Any

import httpx
import polars as pl
from loguru import logger

from .fpl_service import FPLService

REPO_BASE_URL = "https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data"
SEASONS = ["2019-20", "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"]


class HistoryService:
    _cache: dict[str, Any] = {}
    _cache_lock = asyncio.Lock()

    def __init__(self):
        self.fpl_service = FPLService()

    async def get_h2h_history(self, team_h_id: int, team_a_id: int) -> list[dict[str, Any]]:
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
                    ((pl.col("team_h") == s_home_id) & (pl.col("team_a") == s_away_id))
                    | ((pl.col("team_h") == s_away_id) & (pl.col("team_a") == s_home_id))
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
                        score_h = int(row["team_h_score"]) if row["team_h_score"] is not None else 0
                        score_a = int(row["team_a_score"]) if row["team_a_score"] is not None else 0
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

                    # Parse Stats for Scorers and Assists if available
                    scorers_h = []
                    scorers_a = []
                    assists_h = []
                    assists_a = []

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

                                elif stat.get("identifier") == "assists":
                                    # Process Home Assists ('h')
                                    for item in stat.get("h", []):
                                        pid = item["element"]
                                        val = item["value"]
                                        pname = player_map.get(pid, f"#{pid}")
                                        entry = pname
                                        if val > 1:
                                            entry += f" ({val})"
                                        assists_h.append(entry)

                                    # Process Away Assists ('a')
                                    for item in stat.get("a", []):
                                        pid = item["element"]
                                        val = item["value"]
                                        pname = player_map.get(pid, f"#{pid}")
                                        entry = pname
                                        if val > 1:
                                            entry += f" ({val})"
                                        assists_a.append(entry)

                        except Exception:
                            # Parse error, ignore stats
                            pass

                    # Assign scorers and assists based on match data (always consistent with home_team/away_team)
                    match_entry["scorers_home"] = scorers_h
                    match_entry["scorers_away"] = scorers_a
                    match_entry["assists_home"] = assists_h
                    match_entry["assists_away"] = assists_a

                    history.append(match_entry)

            except Exception as e:
                logger.error(f"Error processing fixtures for {season}: {e}")
                continue

        # Sort by date descending
        history.sort(key=lambda x: x["date"], reverse=True)
        return history

    async def get_player_history_vs_team(self, player_name: str, opponent_name: str) -> list[dict[str, Any]]:
        """
        Get historical points for a player against a specific opponent across all seasons.
        """
        await self._ensure_history_data()
        history = []

        for season in SEASONS:
            season_data = self._cache.get(season)
            if not season_data:
                continue

            df_teams = season_data["teams"]
            df_gws = season_data.get("gws")

            if df_gws is None:
                continue

            try:
                # 1. Find opponent team ID in this season
                opp_rows = df_teams.filter(pl.col("name") == opponent_name)
                if opp_rows.height == 0:
                    continue
                opponent_id = opp_rows[0, "id"]

                # 2. Filter GWs for player and opponent
                # Normalize names for comparison (simple case insensitive check)

                # We need to handle name formatting.
                # merged_gw.csv has "name" column like "Erling Haaland"
                # Input player_name should match this.

                player_rows = df_gws.filter((pl.col("name") == player_name) & (pl.col("opponent_team") == opponent_id))

                if player_rows.height == 0:
                    # Try partial match or fuzzy match if exact match fails?
                    # For now, stick to exact match.
                    # Maybe try checking if last name is in the name?
                    # But "Gabriel" matches multiple.
                    continue

                for row in player_rows.iter_rows(named=True):
                    history.append(
                        {
                            "season": season,
                            "date": row["kickoff_time"],
                            "gameweek": row["GW"],
                            "points": row["total_points"],
                            "fixture": row["fixture"],
                            "minutes": row["minutes"],
                            "goals_scored": row["goals_scored"],
                            "assists": row["assists"],
                            "bonus": row["bonus"],
                            "bps": row["bps"],
                            "saves": row["saves"],
                            "was_home": str(row["was_home"]).lower() == "true",
                            "opponent_name": opponent_name,
                        }
                    )

            except Exception as e:
                logger.warning(f"Error getting player history in {season}: {e}")
                continue

        # Sort by date descending
        history.sort(key=lambda x: x.get("date", ""), reverse=True)
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

    async def _fetch_season_data(self, season: str) -> dict[str, Any] | None:
        logger.info(f"Fetching historical data for {season}")
        try:
            async with httpx.AsyncClient() as client:
                teams_url = f"{REPO_BASE_URL}/{season}/teams.csv"
                fixtures_url = f"{REPO_BASE_URL}/{season}/fixtures.csv"
                players_url = f"{REPO_BASE_URL}/{season}/players_raw.csv"
                gws_url = f"{REPO_BASE_URL}/{season}/gws/merged_gw.csv"

                t_resp, f_resp, p_resp, g_resp = await asyncio.gather(
                    client.get(teams_url),
                    client.get(fixtures_url),
                    client.get(players_url),
                    client.get(gws_url),
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

                gws_df = None
                if g_resp.status_code == 200:
                    try:
                        gws_df = pl.read_csv(
                            io.BytesIO(g_resp.content),
                            infer_schema_length=10000,
                            null_values=[""],
                            ignore_errors=True,
                        )
                    except Exception as e:
                        logger.warning(f"Failed to parse GWs for {season}: {e}")
                else:
                    logger.warning(f"Failed to fetch GWs for {season}: {g_resp.status_code}")

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
                    "gws": gws_df,
                }
        except Exception as e:
            logger.error(f"Error fetching {season}: {e}")
            return None
