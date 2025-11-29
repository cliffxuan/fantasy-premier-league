from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import AnalysisRequest, AnalysisResponse
from .analysis_service import AnalysisService


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


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_team(request: AnalysisRequest):
    try:
        return await analysis_service.analyze_team(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/team/{team_id}/squad")
async def get_squad(team_id: int):
    from .fpl_service import FPLService

    service = FPLService()
    try:
        data = await service.get_enriched_squad(team_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Squad not found: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
