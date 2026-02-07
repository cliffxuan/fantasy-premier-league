import asyncio
import logging
import os

import joblib
import numpy as np
import polars as pl
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from .fpl_service import FPLService

logger = logging.getLogger("ml_service")
logger.setLevel(logging.INFO)

DATA_DIR = "data"
MODEL_FILE = os.path.join(DATA_DIR, "fpl_points_model.pkl")
TRAINING_DATA_FILE = os.path.join(DATA_DIR, "training_data.csv")


class MLService:
    def __init__(self):
        self.fpl_service = FPLService()
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_FILE):
            try:
                self.model = joblib.load(MODEL_FILE)
                logger.info("Loaded FPL ML Model.")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
        else:
            logger.warning("No ML model found. Training required.")

    async def collect_training_data(self) -> pl.DataFrame:
        """
        Fetches historical data for all players to build a training dataset.
        This is an expensive operation (requests per player).
        """
        logger.info("Starting data collection...")
        os.makedirs(DATA_DIR, exist_ok=True)

        bootstrap = await self.fpl_service.get_bootstrap_static()
        elements = bootstrap["elements"]
        teams = {t["id"]: t for t in bootstrap["teams"]}

        candidates = [p for p in elements if p["total_points"] > 0 or p["minutes"] > 0]

        logger.info(f"Fetching history for {len(candidates)} players...")

        all_rows = []

        # Chunk requests to be nice to API but faster
        chunk_size = 50
        sem = asyncio.Semaphore(20)

        async def fetch_history(pid):
            async with sem:
                try:
                    return await self.fpl_service.get_player_summary(pid)
                except Exception as e:
                    logger.error(f"Failed to fetch summary for {pid}: {e}")
                    return None

        chunks = [candidates[i : i + chunk_size] for i in range(0, len(candidates), chunk_size)]

        for chunk in chunks:
            tasks = [fetch_history(p["id"]) for p in chunk]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for player, result in zip(chunk, results):
                if isinstance(result, BaseException) or result is None:
                    if isinstance(result, BaseException):
                        logger.error(f"Error fetching {player['web_name']}: {result}")
                    continue

                history = result.get("history", [])

                if not history:
                    continue

                # Process history into features using Polars
                # Create initial DataFrame from list of dicts
                try:
                    df_hist = pl.DataFrame(history)
                except Exception as e:
                    logger.warning(f"Failed to create DataFrame for {player['web_name']}: {e}")
                    continue

                if df_hist.is_empty():
                    continue

                # Sort by round
                df_hist = df_hist.sort("round")

                # Create features
                # 1. Previous Points (Lag 1, 2, 3)
                df_hist = df_hist.with_columns(
                    [
                        pl.col("total_points").shift(1).alias("points_lag_1"),
                        pl.col("total_points").shift(2).alias("points_lag_2"),
                        pl.col("total_points").shift(3).alias("points_lag_3"),
                        # 2. Moving Average (Form) - last 3 games
                        pl.col("total_points").rolling_mean(window_size=3).shift(1).alias("ma_3"),
                        # 3. Minutes played lag
                        pl.col("minutes").shift(1).alias("minutes_lag_1"),
                        pl.col("minutes").rolling_mean(window_size=3).shift(1).alias("minutes_mean_3"),
                        # 4. Cleanup/Rename for features
                        pl.col("value").alias("cost"),
                        (pl.col("was_home").cast(pl.Int8)).alias("is_home"),
                        pl.col("ict_index").cast(pl.Float64),
                    ]
                )

                # Drop rows with nulls in critical lag features (first few rows)
                df_hist = df_hist.filter(pl.col("points_lag_1").is_not_null())

                # Select only relevant columns and add player metadata
                # Note: Polars can't easily iterate rows for "appending" safely to a massive list in tight
                # loop efficiently if strictly typed,
                # but we can add constant columns and then convert to dicts or concatenate dataframes.
                # Adding constant columns is efficient.

                df_hist = df_hist.with_columns(
                    [
                        pl.lit(player["id"]).alias("element_id"),
                        pl.lit(player["web_name"]).alias("web_name"),
                        pl.lit(player["element_type"]).alias("position"),
                        pl.lit(teams[player["team"]]["code"]).alias("team_code"),
                        pl.lit(float(player["form"])).alias("player_form_static"),
                    ]
                )

                # Renaming for consistency with training format
                # We need: element_id, web_name, position, team_code, round, cost, difficulty, is_home...
                # Current columns include: round, cost, difficulty, is_home, points_lag_1 ...

                # Rename the lag columns to feature names
                df_hist = df_hist.rename(
                    {
                        "minutes_lag_1": "minutes_last_match",
                        "minutes_mean_3": "minutes_avg_3",
                        "points_lag_1": "points_last_match",
                        "ma_3": "points_avg_3",
                        "player_form_static": "form",
                        "total_points": "target_points",
                    }
                )

                # Convert to dicts to append to all_rows, or collect dataframes
                # Collecting dataframes is faster in Polars
                all_rows.append(df_hist)

            # Rate limit
            await asyncio.sleep(0.2)

        if not all_rows:
            return pl.DataFrame()

        # Concatenate all player histories
        final_df = pl.concat(all_rows, how="diagonal_relaxed")

        # Select final columns to ensure clean schema
        cols = [
            "element_id",
            "web_name",
            "position",
            "team_code",
            "round",
            "cost",
            "difficulty",
            "is_home",
            "minutes_last_match",
            "minutes_avg_3",
            "points_last_match",
            "points_avg_3",
            "form",
            "ict_index",
            "target_points",
        ]

        # Verify cols exist (some might be missing if concat was loose)
        existing_cols = [c for c in cols if c in final_df.columns]
        final_df = final_df.select(existing_cols)

        if not final_df.is_empty():
            final_df.write_csv(TRAINING_DATA_FILE)
            logger.info(f"Saved {len(final_df)} training examples to {TRAINING_DATA_FILE}")

        return final_df

    def _train_model_sync(self, df: pl.DataFrame | None = None):
        """Synchronous model training — call via asyncio.to_thread."""
        if df is None:
            if os.path.exists(TRAINING_DATA_FILE):
                try:
                    df = pl.read_csv(TRAINING_DATA_FILE)
                except Exception:
                    logger.error("Failed to read training data.")
                    return
            else:
                logger.error("No training data found.")
                return

        logger.info("Training Model...")

        feature_cols = [
            "position",
            "cost",
            "difficulty",
            "is_home",
            "minutes_last_match",
            "minutes_avg_3",
            "points_last_match",
            "points_avg_3",
            "ict_index",
        ]
        target_col = "target_points"

        missing = [c for c in feature_cols + [target_col] if c not in df.columns]
        if missing:
            logger.error(f"Missing columns in training data: {missing}")
            return

        df = df.drop_nulls(subset=feature_cols + [target_col])

        X = df.select(feature_cols).to_numpy().astype(np.float64)
        y = df.select(target_col).to_numpy().ravel().astype(np.float64)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        pipeline = Pipeline(
            [
                ("imputer", SimpleImputer(strategy="mean")),
                ("scaler", StandardScaler()),
                (
                    "regressor",
                    RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
                ),
            ]
        )

        pipeline.fit(X_train, y_train)

        score = pipeline.score(X_test, y_test)
        logger.info(f"Model trained. R^2 Score: {score:.4f}")

        os.makedirs(DATA_DIR, exist_ok=True)
        joblib.dump(pipeline, MODEL_FILE)

        self.model = pipeline
        return score

    async def train_model(self, df: pl.DataFrame | None = None):
        """Train model off the event loop so it doesn't block."""
        return await asyncio.to_thread(self._train_model_sync, df)

    async def predict_next_gw(self, gw: int) -> dict[int, float]:
        """
        Predicts points for all players for the specified (upcoming) GW.
        Returns a dict: {player_id: predicted_points}
        """
        if not self.model:
            logger.warning("Model not loaded. Attempting to train if data exists...")
            if os.path.exists(TRAINING_DATA_FILE):
                await self.train_model()
            else:
                logger.warning("No training data available. Skipping prediction.")
                return {}

        if not self.model:
            return {}

        bootstrap = await self.fpl_service.get_bootstrap_static()
        elements = bootstrap["elements"]

        current_gw_id = await self.fpl_service.get_current_gameweek()

        # Fetch last 3 GWs data
        start_gw = max(1, current_gw_id - 3)
        end_gw = current_gw_id

        history_tasks = []
        for g in range(start_gw, end_gw + 1):
            history_tasks.append(self.fpl_service.get_event_live(g))

        gw_results = await asyncio.gather(*history_tasks, return_exceptions=True)

        player_stats = {}  # pid -> { 'last_pts': ..., 'last_mins': ..., 'pts_history': [], 'mins_history': [] }

        for g_data in gw_results:
            if isinstance(g_data, dict) and "elements" in g_data:
                for el in g_data["elements"]:
                    pid = el["id"]
                    stats = el["stats"]
                    if pid not in player_stats:
                        player_stats[pid] = {"points": [], "minutes": []}
                    player_stats[pid]["points"].append(stats["total_points"])
                    player_stats[pid]["minutes"].append(stats["minutes"])

        # Fetch Fixtures
        fixtures = await self.fpl_service.get_fixtures()
        next_fixtures = [f for f in fixtures if f.event == gw]

        player_fixture = {}  # pid -> {difficulty, is_home}

        for f in next_fixtures:
            h = f.team_h_difficulty
            a = f.team_a_difficulty

            if f.team_h not in player_fixture:
                player_fixture[f.team_h] = []
            player_fixture[f.team_h].append({"diff": h, "home": 1})

            if f.team_a not in player_fixture:
                player_fixture[f.team_a] = []
            player_fixture[f.team_a].append({"diff": a, "home": 0})

        # Build Inference DataFrame
        rows = []
        for p in elements:
            pid = p["id"]
            team_id = p["team"]

            fix_info = player_fixture.get(team_id, [{"diff": 3, "home": 0}])

            p_stats = player_stats.get(pid, {"points": [0], "minutes": [0]})
            pts_hist = p_stats["points"]
            min_hist = p_stats["minutes"]

            if not pts_hist:
                pts_hist = [0]
            if not min_hist:
                min_hist = [0]

            points_last = pts_hist[-1]
            points_avg = sum(pts_hist) / len(pts_hist)
            minutes_last = min_hist[-1]
            minutes_avg = sum(min_hist) / len(min_hist)

            for fix in fix_info:
                row = {
                    "player_id": pid,
                    "position": p["element_type"],
                    "cost": p["now_cost"],
                    "difficulty": fix["diff"],
                    "is_home": fix["home"],
                    "minutes_last_match": minutes_last,
                    "minutes_avg_3": minutes_avg,
                    "points_last_match": points_last,
                    "points_avg_3": points_avg,
                    "ict_index": float(p["ict_index"]) if p["ict_index"] else 0.0,
                }
                rows.append(row)

        if not rows:
            return {}

        # Use Polars for inference structure to be consistent, but mapping list of dicts to Polars is easy
        df_inf = pl.DataFrame(rows)

        feature_cols = [
            "position",
            "cost",
            "difficulty",
            "is_home",
            "minutes_last_match",
            "minutes_avg_3",
            "points_last_match",
            "points_avg_3",
            "ict_index",
        ]

        X_pred = df_inf.select(feature_cols).to_numpy().astype(np.float64)

        # Predict
        preds = self.model.predict(X_pred)

        # Map back to ID
        prediction_map = {}
        # We can iterate the rows again or just zip
        # using rows list is safest as it matches index order of df creation
        for idx, pred in enumerate(preds):
            pid = rows[idx]["player_id"]
            prediction_map[pid] = prediction_map.get(pid, 0.0) + pred

        return prediction_map
