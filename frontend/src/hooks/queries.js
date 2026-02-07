import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import {
	getCurrentGameweek,
	getTeams,
	getFixtures,
	getPolymarketData,
	getDreamTeam,
	getSquad,
	getClubSquad,
	getClubSummary,
	getPlayerSummary,
	getFormAnalysis,
	getTopManagers,
	solveOptimization,
	getLeagueTable,
	getAggregatedPlayers,
	getH2hHistory,
	analyzeTeam,
	exchangeCode,
	getFixtureAnalysis,
} from '../api';

export const useCurrentGameweek = () =>
	useQuery({
		queryKey: queryKeys.currentGameweek,
		queryFn: getCurrentGameweek,
		staleTime: 10 * 60 * 1000,
	});

export const useTeams = () =>
	useQuery({
		queryKey: queryKeys.teams,
		queryFn: getTeams,
		staleTime: 30 * 60 * 1000,
	});

export const useFixtures = (gw, { poll = false } = {}) =>
	useQuery({
		queryKey: queryKeys.fixtures(gw),
		queryFn: () => getFixtures(gw),
		enabled: gw != null,
		refetchInterval: poll ? 60 * 1000 : false,
	});

export const usePolymarketData = () =>
	useQuery({
		queryKey: queryKeys.polymarket,
		queryFn: getPolymarketData,
	});

export const useDreamTeam = (gw) =>
	useQuery({
		queryKey: queryKeys.dreamTeam(gw),
		queryFn: () => getDreamTeam(gw),
		enabled: gw != null,
	});

export const useSquad = (teamId, gw, authToken) =>
	useQuery({
		queryKey: queryKeys.squad(teamId, gw, authToken),
		queryFn: () => getSquad(teamId, gw, authToken),
		enabled: !!teamId,
	});

export const useClubSquad = (clubId, gw) =>
	useQuery({
		queryKey: queryKeys.clubSquad(clubId, gw),
		queryFn: () => getClubSquad(clubId, gw),
		enabled: clubId != null,
	});

export const useClubSummary = (clubId, { enabled = true } = {}) =>
	useQuery({
		queryKey: queryKeys.clubSummary(clubId),
		queryFn: () => getClubSummary(clubId),
		enabled: enabled && clubId != null,
	});

export const usePlayerSummary = (id, oppId, { enabled = true } = {}) =>
	useQuery({
		queryKey: queryKeys.playerSummary(id, oppId),
		queryFn: () => getPlayerSummary(id, oppId),
		enabled: enabled && id != null,
	});

export const useFormAnalysis = () =>
	useQuery({
		queryKey: queryKeys.formAnalysis,
		queryFn: getFormAnalysis,
	});

export const useTopManagers = (count) =>
	useQuery({
		queryKey: queryKeys.topManagers(count),
		queryFn: () => getTopManagers(count),
		enabled: false,
	});

export const useSolver = () =>
	useMutation({
		mutationFn: solveOptimization,
	});

export const useLeagueTable = (minGw, maxGw) =>
	useQuery({
		queryKey: queryKeys.leagueTable(minGw, maxGw),
		queryFn: () => getLeagueTable(minGw, maxGw),
		enabled: minGw != null && maxGw != null,
		placeholderData: keepPreviousData,
	});

export const useAggregatedPlayers = (minGw, maxGw, venue) =>
	useQuery({
		queryKey: queryKeys.aggregatedPlayers(minGw, maxGw, venue),
		queryFn: () => getAggregatedPlayers(minGw, maxGw, venue),
		enabled: minGw != null && maxGw != null,
		placeholderData: keepPreviousData,
	});

export const useH2hHistory = (homeId, awayId, { enabled = true } = {}) =>
	useQuery({
		queryKey: queryKeys.h2hHistory(homeId, awayId),
		queryFn: () => getH2hHistory(homeId, awayId),
		enabled: enabled && homeId != null && awayId != null,
	});

export const useAnalyzeTeam = () =>
	useMutation({
		mutationFn: ({ teamId, bank, freeTransfers, transfersRolled, authToken, returnPrompt }) =>
			analyzeTeam(teamId, bank, freeTransfers, transfersRolled, authToken, returnPrompt),
	});

export const useExchangeCode = () =>
	useMutation({
		mutationFn: exchangeCode,
	});

export const useFixtureAnalysis = () =>
	useQuery({
		queryKey: queryKeys.fixtureAnalysis,
		queryFn: getFixtureAnalysis,
	});
