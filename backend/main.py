import os
from typing import List
from loguru import logger

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .analysis_service import AnalysisService
from .form_service import FormService
from .fpl_service import FPLService
from .models import AnalysisRequest, AnalysisResponse, Fixture, Team

app = FastAPI(title="FPL Alpha API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def global_exception_handler(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.exception(f"Unhandled Exception: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(e)},
        )


analysis_service = AnalysisService()
form_service = FormService()


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_team(request: AnalysisRequest):
    return await analysis_service.analyze_team(request)


@app.get("/api/analysis/form", tags=["Analysis"])
async def get_form_analysis():
    return await form_service.get_form_analysis_data()


@app.get("/api/team/{team_id}/squad", tags=["FPL Team"])
async def get_squad(
    team_id: int, gw: int | None = None, authorization: str = Header(None)
):
    print(
        f"DEBUG: Endpoint get_squad called with team_id={team_id}, gw={gw}, auth={bool(authorization)}"
    )
    service = FPLService()
    try:
        data = await service.get_enriched_squad(team_id, gw, authorization)
        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Squad not found: {str(e)}")


@app.get("/api/teams", response_model=List[Team], tags=["FPL Data"])
async def get_teams():
    service = FPLService()
    data = await service.get_teams()
    return data


@app.get("/api/club/{club_id}/squad", tags=["FPL Team"])
async def get_club_squad(club_id: int, gw: int | None = None):
    service = FPLService()
    data = await service.get_club_squad(club_id, gw)
    return data


@app.get("/api/club/{club_id}/summary", tags=["FPL Team"])
async def get_club_summary(club_id: int):
    service = FPLService()
    data = await service.get_club_summary(club_id)
    return data


@app.get("/api/team/{team_id}/my-team", tags=["FPL Team"])
async def get_my_team(team_id: int, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    service = FPLService()
    data = await service.get_my_team(team_id, authorization)
    return data


@app.get("/api/league-table", tags=["FPL Data"])
async def get_league_table(min_gw: int = 1, max_gw: int = 38):
    service = FPLService()
    data = await service.get_league_table(min_gw, max_gw)
    return data


@app.get("/api/player/{player_id}/summary", tags=["FPL Data"])
async def get_player_summary(player_id: int):
    service = FPLService()
    data = await service.get_player_summary(player_id)
    return data


@app.get("/api/players/aggregated", tags=["FPL Data"])
async def get_aggregated_players(
    min_gw: int = 1, max_gw: int = 38, venue: str = "both"
):
    service = FPLService()
    # Validate venue
    if venue not in ["both", "home", "away"]:
        raise HTTPException(status_code=400, detail="Invalid venue parameter")

    # Adjust max_gw if it exceeds current?
    # Service handles it gracefully by catching exceptions on future GWs, but we can clamp it.
    # Let service handle it.

    data = await service.get_aggregated_player_stats(min_gw, max_gw, venue)
    return data


@app.get("/api/dream-team/{gw}", tags=["FPL Data"])
async def get_dream_team(gw: int):
    service = FPLService()
    data = await service.get_dream_team(gw)
    return data


@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "ok"}


@app.get("/api/analysis/top-managers", tags=["Analysis"])
async def get_top_managers_analysis(gw: int | None = None, count: int = 1000):
    service = FPLService()
    data = await service.get_top_managers_ownership(gw, count)
    return data


@app.get("/api/optimization/solve", tags=["Solver"])
async def solve_optimization(
    budget: float = 100.0,
    min_gw: int | None = None,
    max_gw: int | None = None,
    exclude_bench: bool = False,
    exclude_unavailable: bool = False,
    use_ml: bool = False,
):
    service = FPLService()
    predictions = None
    if use_ml:
        # Predict for the target gameweek
        # If min_gw is not set, use next GW?
        target_gw = min_gw
        if not target_gw:
            target_gw = await service.get_next_gameweek_id()

        # Lazy load ML Service to avoid startup delay if not used
        from .ml_service import MLService

        ml_service = MLService()
        predictions = await ml_service.predict_next_gw(target_gw)

    data = await service.get_optimized_team(
        budget,
        min_gw,
        max_gw,
        exclude_bench,
        exclude_unavailable,
        predictions=predictions,
    )
    return data


@app.get("/api/optimization/fixtures", tags=["Solver"])
async def get_fixture_analysis(gw: int | None = None):
    service = FPLService()
    data = await service.get_advanced_fixtures(gw)
    return data


@app.get("/api/fixtures", response_model=List[Fixture], tags=["FPL Data"])
async def get_fixtures(event: int | None = None):
    service = FPLService()
    if event:
        data = await service.get_live_fixtures(event)
    else:
        data = await service.get_fixtures()
    return data


@app.get("/api/history/h2h/{team_h_id}/{team_a_id}", tags=["History"])
async def get_h2h_history(team_h_id: int, team_a_id: int):
    # Lazy import to avoid circular dependencies if any
    from .history_service import HistoryService

    service = HistoryService()
    data = await service.get_h2h_history(team_h_id, team_a_id)
    return data


@app.get("/api/polymarket", tags=["Polymarket"])
async def get_polymarket_data():
    service = FPLService()
    data = await service.get_polymarket_data()
    return data


@app.get("/api/gameweek/current", tags=["FPL Data"])
async def get_current_gameweek():
    service = FPLService()
    status = await service.get_gameweek_status()
    return {"gameweek": status["id"], "status": status}


# Serve static files


# Mount static files if the directory exists (it will in production)
frontend_dist = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "frontend", "dist"
)
if os.path.exists(frontend_dist):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(frontend_dist, "assets")),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # API routes are already handled above.
        # If it's a file that exists in dist, serve it.
        # Otherwise, serve index.html for client-side routing.

        # Check if file exists in dist
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html
        return FileResponse(os.path.join(frontend_dist, "index.html"))
