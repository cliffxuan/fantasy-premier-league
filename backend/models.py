from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class KnowledgeGapInput(BaseModel):
    money_in_bank: float
    free_transfers: int
    transfers_rolled: bool = False


class AnalysisRequest(BaseModel):
    team_id: int
    gameweek: Optional[int] = None
    knowledge_gap: KnowledgeGapInput
    auth_token: Optional[str] = None


class AnalysisResponse(BaseModel):
    immediate_action: str
    transfer_plan: Dict[str, str]
    captaincy: str
    future_watch: str
    squad: List[Dict[str, Any]]
    raw_analysis: Optional[str] = None
