from backend.models import Fixture


def _make_fixture(**overrides) -> Fixture:
    defaults = {
        "id": 1,
        "code": 100,
        "event": 1,
        "team_h": 10,
        "team_a": 20,
        "team_h_score": 2,
        "team_a_score": 1,
        "finished": True,
        "kickoff_time": "2025-08-16T14:00:00Z",
        "minutes": 90,
        "started": True,
        "finished_provisional": True,
        "team_h_difficulty": 3,
        "team_a_difficulty": 4,
    }
    defaults.update(overrides)
    return Fixture(**defaults)


class TestFixtureIsHomeFor:
    def test_home_team_returns_true(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.is_home_for(10) is True

    def test_away_team_returns_false(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.is_home_for(20) is False

    def test_unrelated_team_returns_false(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.is_home_for(99) is False


class TestFixtureGetOpponentId:
    def test_home_team_gets_away_opponent(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.get_opponent_id(10) == 20

    def test_away_team_gets_home_opponent(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.get_opponent_id(20) == 10

    def test_unrelated_team_returns_none(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.get_opponent_id(99) is None


class TestFixtureGetDifficultyFor:
    def test_home_team_gets_home_difficulty(self):
        f = _make_fixture(team_h=10, team_a=20, team_h_difficulty=3, team_a_difficulty=5)
        assert f.get_difficulty_for(10) == 3

    def test_away_team_gets_away_difficulty(self):
        f = _make_fixture(team_h=10, team_a=20, team_h_difficulty=3, team_a_difficulty=5)
        assert f.get_difficulty_for(20) == 5

    def test_unrelated_team_returns_zero(self):
        f = _make_fixture(team_h=10, team_a=20)
        assert f.get_difficulty_for(99) == 0
