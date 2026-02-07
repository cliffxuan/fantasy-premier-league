from unittest.mock import AsyncMock, patch

import pytest


@pytest.fixture
def mock_fpl_service():
    with patch("backend.main.fpl_service") as mock:
        yield mock


async def test_get_teams(client, mock_fpl_service):
    mock_fpl_service.get_teams = AsyncMock(
        return_value=[
            {
                "id": 1,
                "code": 3,
                "name": "Arsenal",
                "short_name": "ARS",
                "full_name": "Arsenal",
                "strength": 5,
            }
        ]
    )
    response = await client.get("/api/teams")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Arsenal"


async def test_get_fixtures(client, mock_fpl_service):
    mock_fpl_service.get_fixtures = AsyncMock(
        return_value=[
            {
                "id": 1,
                "code": 100,
                "event": 1,
                "team_h": 1,
                "team_a": 2,
                "team_h_score": None,
                "team_a_score": None,
                "finished": False,
                "kickoff_time": "2025-08-16T14:00:00Z",
                "minutes": 0,
                "started": False,
                "finished_provisional": False,
                "team_h_difficulty": 3,
                "team_a_difficulty": 4,
            }
        ]
    )
    response = await client.get("/api/fixtures")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


async def test_auth_me_requires_header(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


async def test_get_current_gameweek(client, mock_fpl_service):
    mock_fpl_service.get_gameweek_status = AsyncMock(return_value={"id": 10, "name": "Gameweek 10"})
    response = await client.get("/api/gameweek/current")
    assert response.status_code == 200
    data = response.json()
    assert data["gameweek"] == 10
