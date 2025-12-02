import os

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .analysis_service import AnalysisService
from .fpl_service import FPLService
from .models import AnalysisRequest, AnalysisResponse

app = FastAPI(title="FPL Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analysis_service = AnalysisService()


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_team(request: AnalysisRequest):
    try:
        return await analysis_service.analyze_team(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/team/{team_id}/squad")
async def get_squad(team_id: int):
    service = FPLService()
    try:
        data = await service.get_enriched_squad(team_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Squad not found: {str(e)}")


@app.get("/api/team/{team_id}/my-team")
async def get_my_team(team_id: int, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    service = FPLService()
    try:
        data = await service.get_my_team(team_id, authorization)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch my team: {str(e)}"
        )


@app.get("/api/league-table")
async def get_league_table():
    service = FPLService()
    try:
        data = await service.get_league_table()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch league table: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


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
