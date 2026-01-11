from typing import Any, Dict, List, Optional

from pydantic import BaseModel


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
    full_name: str
    strength: int


class Fixture(BaseModel):
    id: int
    code: int
    event: Optional[int] = None
    team_h: int
    team_a: int
    team_h_score: Optional[int] = None
    team_a_score: Optional[int] = None
    finished: bool = False
    kickoff_time: str | None
    minutes: int = 0
    started: bool = False
    finished_provisional: bool = False
    team_h_difficulty: int
    team_a_difficulty: int

    # Enriched
    team_h_name: Optional[str] = None
    team_a_name: Optional[str] = None
    team_h_short: Optional[str] = None
    team_a_short: Optional[str] = None
    team_h_code: Optional[int] = None
    team_a_code: Optional[int] = None

    def is_home_for(self, team_id: int) -> bool:
        """Returns True if the given team_id is playing at home in this fixture."""
        return self.team_h == team_id

    def get_opponent_id(self, team_id: int) -> Optional[int]:
        """Returns the team_id of the opponent for the given team_id."""
        if self.team_h == team_id:
            return self.team_a
        elif self.team_a == team_id:
            return self.team_h
        return None

    def get_difficulty_for(self, team_id: int) -> int:
        """Returns the difficulty rating for the given team_id."""
        if self.team_h == team_id:
            return self.team_h_difficulty
        elif self.team_a == team_id:
            return self.team_a_difficulty
        return 0


class AnalysisResponse(BaseModel):
    immediate_action: Optional[str] = None
    transfer_plan: Optional[Dict[str, str]] = None
    captaincy: Optional[str] = None
    future_watch: Optional[str] = None
    squad: List[Dict[str, Any]]  # Could be refined to List[Player] eventually
    raw_analysis: Optional[str] = None
    generated_prompt: Optional[str] = None
