const API_BASE_URL = '/api';

export const analyzeTeam = async (teamId, moneyInBank, freeTransfers, transfersRolled, authToken = null, returnPrompt = false) => {
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
			auth_token: authToken,
			return_prompt: returnPrompt,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.detail || 'Analysis failed');
	}

	return response.json();
};

export const getTeams = async () => {
	const response = await fetch(`${API_BASE_URL}/teams`);
	if (!response.ok) return [];
	return response.json();
};

export const getClubSquad = async (clubId, gw = null) => {
	let url = `${API_BASE_URL}/club/${clubId}/squad`;
	if (gw !== null && gw !== undefined) {
		url += `?gw=${gw}`;
	}
	const response = await fetch(url);
	if (!response.ok) return null;
	return response.json();
};

export const getClubSummary = async (clubId) => {
	const response = await fetch(`${API_BASE_URL}/club/${clubId}/summary`);
	if (!response.ok) return null;
	return response.json();
};

export const getAuthUrl = async () => {
	const response = await fetch(`${API_BASE_URL}/auth/url`);
	if (!response.ok) throw new Error('Failed to get auth URL');
	return response.json();
};

export const exchangeCode = async (code) => {
	const response = await fetch(`${API_BASE_URL}/auth/callback`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ code }),
	});
	if (!response.ok) throw new Error('Failed to exchange code');
	return response.json();
};

export const getMe = async (token) => {
	const response = await fetch(`${API_BASE_URL}/auth/me`, {
		headers: {
			'Authorization': `Bearer ${token}`
		}
	});
	if (!response.ok) throw new Error('Failed to get user details');
	return response.json();
};

export const getSquad = async (teamId, gw = null, authToken = null) => {
	let url = `${API_BASE_URL}/team/${teamId}/squad`;
	if (gw !== null && gw !== undefined) {
		url += `?gw=${gw}`;
	}
	const headers = {};
	if (authToken) {
		headers['Authorization'] = authToken;
	}

	const response = await fetch(url, { headers });
	if (!response.ok) {
		// It's okay if squad is not found immediately (e.g. invalid ID), just return null
		return null;
	}
	return response.json();
};

export const getPlayerSummary = async (playerId, opponentId = null) => {
	let url = `${API_BASE_URL}/player/${playerId}/summary`;
	if (opponentId) {
		url += `?opponent_id=${opponentId}`;
	}
	const response = await fetch(url);
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

export const getPolymarketData = async () => {
	try {
		const response = await fetch(`${API_BASE_URL}/polymarket`);
		if (!response.ok) {
			return [];
		}
		return response.json();
	} catch (e) {
		console.error("Failed to fetch Polymarket data:", e);
		return [];
	}
};

export const getFixtures = async (gw = null) => {
	let url = `${API_BASE_URL}/fixtures`;
	if (gw) {
		url += `?event=${gw}`;
	}
	const response = await fetch(url);
	if (!response.ok) {
		return [];
	}
	return response.json();
};

