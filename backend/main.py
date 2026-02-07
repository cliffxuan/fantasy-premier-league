import os

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger
from pydantic import BaseModel

from .analysis_service import AnalysisService
from .form_service import FormService
from .fpl_service import FPLService
from .models import AnalysisRequest, AnalysisResponse, Fixture, Team


class AuthCallbackRequest(BaseModel):
    code: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


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
        logger.exception(f"Unhandled Exception: {e!s}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(e)},
        )


fpl_service = FPLService()
analysis_service = AnalysisService()
form_service = FormService()


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_team(request: AnalysisRequest):
    return await analysis_service.analyze_team(request)


@app.get("/api/analysis/form", tags=["Analysis"])
async def get_form_analysis():
    return await form_service.get_form_analysis_data()


@app.get("/api/auth/url", tags=["Auth"])
async def get_auth_url():
    """Returns the PingOne OAuth URL. Open in browser, log in, then copy the
    ?code= parameter from the redirect URL and POST it to /api/auth/callback."""
    return {"url": fpl_service.get_authorize_url()}


@app.post("/api/auth/callback", tags=["Auth"])
async def auth_callback(request: AuthCallbackRequest):
    """Exchanges a PingOne authorization code for an access token."""
    tokens = await fpl_service.exchange_code(request.code)
    if not tokens:
        raise HTTPException(status_code=401, detail="Token exchange failed. Code may be expired.")
    return {
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "expires_in": tokens.get("expires_in"),
    }


@app.post("/api/auth/refresh", tags=["Auth"])
async def auth_refresh(request: RefreshTokenRequest):
    """Uses a refresh token to get a new access token (refresh tokens last ~30 days)."""
    tokens = await fpl_service.refresh_access_token(request.refresh_token)
    if not tokens:
        raise HTTPException(status_code=401, detail="Token refresh failed. Re-login required.")
    return {
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "expires_in": tokens.get("expires_in"),
    }


@app.get("/api/auth/me", tags=["Auth"])
async def get_me(authorization: str = Header(None)):
    """Returns the logged-in user's FPL profile (entry ID, name, etc.)."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    try:
        return await fpl_service.get_me(authorization)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to fetch user profile: {e}")


@app.get("/api/team/{team_id}/squad", tags=["FPL Team"])
async def get_squad(team_id: int, gw: int | None = None, authorization: str = Header(None)):
    logger.debug(f"Endpoint get_squad called with team_id={team_id}, gw={gw}, auth={bool(authorization)}")
    try:
        data = await fpl_service.get_enriched_squad(team_id, gw, authorization)
        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Squad not found: {e!s}")


@app.get("/api/teams", response_model=list[Team], tags=["FPL Data"])
async def get_teams():
    data = await fpl_service.get_teams()
    return data


@app.get("/api/club/{club_id}/squad", tags=["FPL Team"])
async def get_club_squad(club_id: int, gw: int | None = None):
    data = await fpl_service.get_club_squad(club_id, gw)
    return data


@app.get("/api/club/{club_id}/summary", tags=["FPL Team"])
async def get_club_summary(club_id: int):
    data = await fpl_service.get_club_summary(club_id)
    return data


@app.get("/api/team/{team_id}/my-team", tags=["FPL Team"])
async def get_my_team(team_id: int, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    data = await fpl_service.get_my_team(team_id, authorization)
    return data


@app.get("/api/league-table", tags=["FPL Data"])
async def get_league_table(
    min_gw: int = Query(1, ge=1, le=38),
    max_gw: int = Query(38, ge=1, le=38),
):
    data = await fpl_service.get_league_table(min_gw, max_gw)
    return data


@app.get("/api/player/{player_id}/summary", tags=["FPL Data"])
async def get_player_summary(player_id: int, opponent_id: int | None = None):
    data = await fpl_service.get_player_summary(player_id, opponent_id)
    return data


@app.get("/api/players/aggregated", tags=["FPL Data"])
async def get_aggregated_players(
    min_gw: int = Query(1, ge=1, le=38),
    max_gw: int = Query(38, ge=1, le=38),
    venue: str = Query("both", pattern="^(both|home|away)$"),
):
    data = await fpl_service.get_aggregated_player_stats(min_gw, max_gw, venue)
    return data


@app.get("/api/dream-team/{gw}", tags=["FPL Data"])
async def get_dream_team(gw: int):
    data = await fpl_service.get_dream_team(gw)
    return data


@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "ok"}


@app.get("/api/analysis/top-managers", tags=["Analysis"])
async def get_top_managers_analysis(
    gw: int | None = Query(None, ge=1, le=38),
    count: int = Query(1000, ge=5, le=2000),
):
    data = await fpl_service.get_top_managers_ownership(gw, count)
    return data


@app.get("/api/optimization/solve", tags=["Solver"])
async def solve_optimization(
    budget: float = Query(100.0, ge=50.0, le=200.0),
    min_gw: int | None = Query(None, ge=1, le=38),
    max_gw: int | None = Query(None, ge=1, le=38),
    exclude_bench: bool = False,
    exclude_unavailable: bool = False,
    use_ml: bool = False,
):
    predictions = None
    if use_ml:
        target_gw = min_gw
        if not target_gw:
            target_gw = await fpl_service.get_next_gameweek_id()

        from .ml_service import MLService

        ml_service = MLService()
        predictions = await ml_service.predict_next_gw(target_gw)

    data = await fpl_service.get_optimized_team(
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
    data = await fpl_service.get_advanced_fixtures(gw)
    return data


@app.get("/api/fixtures", response_model=list[Fixture], tags=["FPL Data"])
async def get_fixtures(event: int | None = None):
    if event:
        data = await fpl_service.get_live_fixtures(event)
    else:
        data = await fpl_service.get_fixtures()
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
    data = await fpl_service.get_polymarket_data()
    return data


@app.get("/api/gameweek/current", tags=["FPL Data"])
async def get_current_gameweek():
    status = await fpl_service.get_gameweek_status()
    return {"gameweek": status["id"], "status": status}


# Serve static files


# Mount static files if the directory exists (it will in production)
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
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

        # Sanitize path to prevent directory traversal
        file_path = os.path.normpath(os.path.join(frontend_dist, full_path))
        if not file_path.startswith(frontend_dist):
            return JSONResponse({"error": "Forbidden"}, status_code=403)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # Fallback to index.html
        return FileResponse(os.path.join(frontend_dist, "index.html"))
