const API_BASE_URL = '/api';

export const analyzeTeam = async (teamId, moneyInBank, freeTransfers, transfersRolled) => {
	const response = await fetch(`${API_BASE_URL}/analyze`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			team_id: teamId,
			knowledge_gap: {
				money_in_bank: parseFloat(moneyInBank),
				free_transfers: parseInt(freeTransfers),
				transfers_rolled: transfersRolled,
			},
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.detail || 'Analysis failed');
	}

	return response.json();
};

export const getSquad = async (teamId) => {
	const response = await fetch(`${API_BASE_URL}/team/${teamId}/squad`);
	if (!response.ok) {
		// It's okay if squad is not found immediately (e.g. invalid ID), just return null
		return null;
	}
	return response.json();
};

export const getPlayerSummary = async (playerId) => {
	const response = await fetch(`${API_BASE_URL}/player/${playerId}/summary`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};
export const getDreamTeam = async (gw) => {
	const response = await fetch(`${API_BASE_URL}/dream-team/${gw}`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};
