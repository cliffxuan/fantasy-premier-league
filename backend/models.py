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


class Player(BaseModel):
    id: int
    web_name: str
    element_type: int
    team: int
    now_cost: int
    total_points: int
    form: str
    points_per_game: str
    selected_by_percent: str
    news: Optional[str] = None
    status: Optional[str] = None

    # Computed/Enriched fields
    team_name: Optional[str] = None
    position_name: Optional[str] = None


class Team(BaseModel):
    id: int
    code: int
    name: str
    short_name: str
    strength: int


class Fixture(BaseModel):
    id: int
    event: Optional[int]
    team_h: int
    team_a: int
    team_h_score: Optional[int]
    team_a_score: Optional[int]
    finished: bool
    kickoff_time: str

    # Enriched
    team_h_name: Optional[str] = None
    team_a_name: Optional[str] = None


class AnalysisResponse(BaseModel):
    immediate_action: Optional[str] = None
    transfer_plan: Optional[Dict[str, str]] = None
    captaincy: Optional[str] = None
    future_watch: Optional[str] = None
    squad: List[Dict[str, Any]]  # Could be refined to List[Player] eventually
    raw_analysis: Optional[str] = None
    generated_prompt: Optional[str] = None
