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
    return_prompt: bool = False


class AnalysisResponse(BaseModel):
    immediate_action: Optional[str] = None
    transfer_plan: Optional[Dict[str, str]] = None
    captaincy: Optional[str] = None
    future_watch: Optional[str] = None
    squad: List[Dict[str, Any]]
    raw_analysis: Optional[str] = None
    generated_prompt: Optional[str] = None
