from typing import Any

from pydantic import BaseModel


class KnowledgeGapInput(BaseModel):
    money_in_bank: float
    free_transfers: int
    transfers_rolled: bool = False


class AnalysisRequest(BaseModel):
    team_id: int
    gameweek: int | None = None
    knowledge_gap: KnowledgeGapInput
    auth_token: str | None = None
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
    news: str | None = None
    status: str | None = None

    # Computed/Enriched fields
    team_name: str | None = None
    position_name: str | None = None


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
    event: int | None = None
    team_h: int
    team_a: int
    team_h_score: int | None = None
    team_a_score: int | None = None
    finished: bool = False
    kickoff_time: str | None
    minutes: int = 0
    started: bool = False
    finished_provisional: bool = False
    team_h_difficulty: int
    team_a_difficulty: int

    # Enriched
    team_h_name: str | None = None
    team_a_name: str | None = None
    team_h_short: str | None = None
    team_a_short: str | None = None
    team_h_code: int | None = None
    team_a_code: int | None = None

    # H2H Stats
    history_stats: dict[str, float] | None = None
    history_stats_venue: dict[str, float] | None = None

    def is_home_for(self, team_id: int) -> bool:
        """Returns True if the given team_id is playing at home in this fixture."""
        return self.team_h == team_id

    def get_opponent_id(self, team_id: int) -> int | None:
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
    immediate_action: str | None = None
    transfer_plan: dict[str, str] | None = None
    captaincy: str | None = None
    future_watch: str | None = None
    squad: list[dict[str, Any]]  # Could be refined to List[Player] eventually
    raw_analysis: str | None = None
    generated_prompt: str | None = None
