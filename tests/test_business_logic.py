from backend.fpl_service import FPLService, calculate_match_result


class TestCalculateMatchResult:
    def test_home_win(self):
        assert calculate_match_result(3, 1, is_home=True) == "W"

    def test_home_loss(self):
        assert calculate_match_result(0, 2, is_home=True) == "L"

    def test_home_draw(self):
        assert calculate_match_result(1, 1, is_home=True) == "D"

    def test_away_win(self):
        assert calculate_match_result(0, 1, is_home=False) == "W"

    def test_away_loss(self):
        assert calculate_match_result(3, 0, is_home=False) == "L"

    def test_away_draw(self):
        assert calculate_match_result(2, 2, is_home=False) == "D"

    def test_zero_zero_home(self):
        assert calculate_match_result(0, 0, is_home=True) == "D"

    def test_zero_zero_away(self):
        assert calculate_match_result(0, 0, is_home=False) == "D"


class TestCalculateChipStatus:
    def setup_method(self):
        self.service = FPLService()

    def test_all_chips_available_when_none_used(self):
        history = {"chips": [], "current": []}
        result = self.service.calculate_chip_status(gw=5, history=history)
        assert len(result) == 4
        for chip in result:
            assert chip["status"] == "available"
            assert chip["events"] == []

    def test_chip_names(self):
        history = {"chips": [], "current": []}
        result = self.service.calculate_chip_status(gw=5, history=history)
        names = [c["name"] for c in result]
        assert names == ["bboost", "3xc", "wildcard", "freehit"]

    def test_chip_labels(self):
        history = {"chips": [], "current": []}
        result = self.service.calculate_chip_status(gw=5, history=history)
        labels = [c["label"] for c in result]
        assert labels == ["Bench Boost", "Triple Captain", "Wildcard", "Free Hit"]

    def test_used_chip_shows_played(self):
        history = {"chips": [{"name": "bboost", "event": 3}], "current": []}
        result = self.service.calculate_chip_status(gw=5, history=history)
        bb = next(c for c in result if c["name"] == "bboost")
        assert bb["status"] == "played"
        assert bb["events"] == [3]

    def test_active_chip(self):
        history = {"chips": [], "current": []}
        picks = {"active_chip": "3xc"}
        result = self.service.calculate_chip_status(gw=5, history=history, picks=picks)
        tc = next(c for c in result if c["name"] == "3xc")
        assert tc["status"] == "active"

    def test_chip_resets_after_gw20(self):
        # Chip used in first half (GW 5), should be available again in second half (GW 25)
        history = {"chips": [{"name": "wildcard", "event": 5}], "current": []}
        result = self.service.calculate_chip_status(gw=25, history=history)
        wc = next(c for c in result if c["name"] == "wildcard")
        assert wc["status"] == "available"

    def test_chip_used_in_second_half_shows_played(self):
        history = {"chips": [{"name": "wildcard", "event": 22}], "current": []}
        result = self.service.calculate_chip_status(gw=25, history=history)
        wc = next(c for c in result if c["name"] == "wildcard")
        assert wc["status"] == "played"

    def test_authenticated_chips_data(self):
        history = {"chips": [], "current": []}
        my_team_data = {
            "chips": [
                {
                    "name": "bboost",
                    "status_for_entry": "available",
                    "played_by_entry": [],
                },
                {
                    "name": "3xc",
                    "status_for_entry": "played",
                    "played_by_entry": [10],
                },
                {
                    "name": "wildcard",
                    "status_for_entry": "available",
                    "played_by_entry": [],
                },
                {
                    "name": "freehit",
                    "status_for_entry": "available",
                    "played_by_entry": [],
                },
            ]
        }
        result = self.service.calculate_chip_status(gw=12, history=history, my_team_data=my_team_data)
        tc = next(c for c in result if c["name"] == "3xc")
        assert tc["status"] == "played"
        assert tc["events"] == [10]


class TestCalculateFreeTransfers:
    def setup_method(self):
        self.service = FPLService()

    def test_after_gw1_has_1_ft(self):
        history = {"current": [{"event": 1, "event_transfers": 0}], "chips": []}
        result = self.service.calculate_free_transfers(history, transfers=[], next_gw=2)
        # GW1: ft=1 (continue skips +1). Available for GW2 = 1
        assert result == 1

    def test_transfers_deducted(self):
        history = {
            "current": [
                {"event": 1, "event_transfers": 0},
                {"event": 2, "event_transfers": 1},
            ],
            "chips": [],
        }
        result = self.service.calculate_free_transfers(history, transfers=[], next_gw=3)
        # GW1: ft=1. GW2: ft=max(0,1-1)=0, +1=1. Available for GW3 = 1
        assert result == 1

    def test_wildcard_doesnt_consume_ft(self):
        history = {
            "current": [
                {"event": 1, "event_transfers": 0},
                {"event": 2, "event_transfers": 5},
            ],
            "chips": [{"event": 2, "name": "wildcard"}],
        }
        result = self.service.calculate_free_transfers(history, transfers=[], next_gw=3)
        # GW1: ft=1. GW2: wildcard, so no deduction: ft=1+1=2
        assert result == 2

    def test_ft_capped_at_5(self):
        history = {
            "current": [
                {"event": 1, "event_transfers": 0},
                {"event": 2, "event_transfers": 0},
                {"event": 3, "event_transfers": 0},
                {"event": 4, "event_transfers": 0},
                {"event": 5, "event_transfers": 0},
                {"event": 6, "event_transfers": 0},
            ],
            "chips": [],
        }
        result = self.service.calculate_free_transfers(history, transfers=[], next_gw=7)
        assert result == 5

    def test_pending_transfers_deducted(self):
        history = {
            "current": [
                {"event": 1, "event_transfers": 0},
                {"event": 2, "event_transfers": 0},
            ],
            "chips": [],
        }
        transfers = [{"event": 3}, {"event": 3}]
        result = self.service.calculate_free_transfers(history, transfers=transfers, next_gw=3)
        # GW1: ft=1. GW2: ft=max(0,1-0)=1, +1=2. Deduct 2 pending = 0
        assert result == 0

    def test_afcon_topup_gw15(self):
        current = [{"event": i, "event_transfers": 0} for i in range(1, 16)]
        history = {"current": current, "chips": []}
        result = self.service.calculate_free_transfers(history, transfers=[], next_gw=16)
        # At GW15 (AFCON_TOPUP_GW), ft gets set to MAX_FREE_TRANSFERS=5, then +1 capped at 5
        assert result == 5
