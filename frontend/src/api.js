const API_BASE_URL = '/api';

export const analyzeTeam = async (
	teamId,
	moneyInBank,
	freeTransfers,
	transfersRolled,
	authToken = null,
	returnPrompt = false,
) => {
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
	if (!response.ok) throw new Error('Failed to fetch teams');
	return response.json();
};

export const getClubSquad = async (clubId, gw = null) => {
	let url = `${API_BASE_URL}/club/${clubId}/squad`;
	if (gw !== null && gw !== undefined) {
		url += `?gw=${gw}`;
	}
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch club squad');
	return response.json();
};

export const getClubSummary = async (clubId) => {
	const response = await fetch(`${API_BASE_URL}/club/${clubId}/summary`);
	if (!response.ok) throw new Error('Failed to fetch club summary');
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
			Authorization: `Bearer ${token}`,
		},
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
	if (!response.ok) throw new Error('Failed to fetch squad');
	return response.json();
};

export const getPlayerSummary = async (playerId, opponentId = null) => {
	let url = `${API_BASE_URL}/player/${playerId}/summary`;
	if (opponentId) {
		url += `?opponent_id=${opponentId}`;
	}
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch player summary');
	return response.json();
};

export const getDreamTeam = async (gw) => {
	const response = await fetch(`${API_BASE_URL}/dream-team/${gw}`);
	if (!response.ok) throw new Error('Failed to fetch dream team');
	return response.json();
};

export const getPolymarketData = async () => {
	const response = await fetch(`${API_BASE_URL}/polymarket`);
	if (!response.ok) throw new Error('Failed to fetch Polymarket data');
	return response.json();
};

export const getFixtures = async (gw = null) => {
	let url = `${API_BASE_URL}/fixtures`;
	if (gw) {
		url += `?event=${gw}`;
	}
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch fixtures');
	return response.json();
};

export const getCurrentGameweek = async () => {
	const response = await fetch(`${API_BASE_URL}/gameweek/current`);
	if (!response.ok) throw new Error('Failed to fetch current gameweek');
	return response.json();
};

export const getFormAnalysis = async () => {
	const response = await fetch(`${API_BASE_URL}/analysis/form`);
	if (!response.ok) throw new Error('Failed to fetch form analysis');
	const players = await response.json();

	// Enrich with code/team_short from aggregated players if missing
	if (players.length > 0 && !players[0].code) {
		try {
			const aggResponse = await fetch(`${API_BASE_URL}/players/aggregated?min_gw=1&max_gw=38&venue=both`);
			if (aggResponse.ok) {
				const aggPlayers = await aggResponse.json();
				const lookup = Object.fromEntries(aggPlayers.map((p) => [p.id, p]));
				return players.map((p) => ({
					...p,
					code: lookup[p.id]?.code ?? 0,
					team_short: lookup[p.id]?.team_short ?? '',
				}));
			}
		} catch {
			// If enrichment fails, return as-is
		}
	}
	return players;
};

export const getTopManagers = async (count) => {
	const response = await fetch(`${API_BASE_URL}/analysis/top-managers?count=${count}`);
	if (!response.ok) throw new Error('Failed to fetch top managers analysis');
	return response.json();
};

export const solveOptimization = async ({ budget, minGw, maxGw, excludeBench, excludeUnavailable, useMl }) => {
	const response = await fetch(
		`${API_BASE_URL}/optimization/solve?budget=${budget}&min_gw=${minGw}&max_gw=${maxGw}&exclude_bench=${excludeBench}&exclude_unavailable=${excludeUnavailable}&use_ml=${useMl}`,
	);
	if (!response.ok) {
		const err = await response.json();
		throw new Error(err.detail || 'Solver failed');
	}
	return response.json();
};

export const getLeagueTable = async (minGw, maxGw) => {
	const response = await fetch(`${API_BASE_URL}/league-table?min_gw=${minGw}&max_gw=${maxGw}`);
	if (!response.ok) throw new Error('Failed to fetch league table');
	return response.json();
};

export const getAggregatedPlayers = async (minGw, maxGw, venue) => {
	const query = new URLSearchParams({ min_gw: minGw, max_gw: maxGw, venue });
	const response = await fetch(`${API_BASE_URL}/players/aggregated?${query.toString()}`);
	if (!response.ok) throw new Error('Failed to fetch player stats');
	return response.json();
};

export const getH2hHistory = async (homeId, awayId) => {
	const response = await fetch(`${API_BASE_URL}/history/h2h/${homeId}/${awayId}`);
	if (!response.ok) throw new Error('Failed to fetch H2H history');
	return response.json();
};

export const getFixtureAnalysis = async () => {
	const response = await fetch(`${API_BASE_URL}/optimization/fixtures`);
	if (!response.ok) throw new Error('Failed to fetch fixture analysis');
	return response.json();
};
