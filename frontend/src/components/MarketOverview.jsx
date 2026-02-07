import React, { useState, useEffect } from 'react';
import { getFixtures, getPolymarketData } from '../api';
import { ArrowUpRight, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { getTeamBadgeUrl, PROBABILITY_COLORS } from '../utils';
import TeamPopover from './TeamPopover';
import HistoryModal from './HistoryModal';
import useCurrentGameweek from '../hooks/useCurrentGameweek';

const MarketOverview = () => {
	const { gameweek: hookGw, loading: gwLoading } = useCurrentGameweek();
	const [fixtures, setFixtures] = useState([]);
	const [markets, setMarkets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [gw, setGw] = useState(null);
	const [currentGw, setCurrentGw] = useState(null);
	const [sortBy, setSortBy] = useState('time'); // 'time' or 'odds'
	const [h2hStatsFilter, setH2hStatsFilter] = useState('all'); // 'all' or 'venue'

	const fetchData = async (targetGw) => {
		setLoading(true);
		try {
			// Fetch Fixtures & Market Data in parallel
			const [fixturesData, marketData] = await Promise.all([getFixtures(targetGw), getPolymarketData()]);

			setFixtures(fixturesData);
			// Only set markets if we have them, otherwise keep existing or empty
			if (marketData) setMarkets(marketData);
		} catch (e) {
			console.error('Failed to fetch data', e);
		} finally {
			setLoading(false);
		}
	};

	// Initialize once the shared hook resolves the current gameweek
	useEffect(() => {
		if (gwLoading || !hookGw) return;

		const init = async () => {
			const nowGw = hookGw;

			// Check if current gameweek is finished
			let targetGw = nowGw;
			try {
				const currentFixtures = await getFixtures(nowGw);
				const allFinished =
					currentFixtures.length > 0 && currentFixtures.every((f) => f.finished || f.finished_provisional);

				if (allFinished && nowGw < 38) {
					targetGw = nowGw + 1;
				}
			} catch (err) {
				console.warn('Failed to check fixture status', err);
			}

			setGw(targetGw);
			setCurrentGw(nowGw); // Keep track of actual current GW

			// Fetch Initial Data
			await fetchData(targetGw);
		};

		init();
	}, [hookGw, gwLoading]);

	// Poll every 60s only for current view
	useEffect(() => {
		if (!gw) return;
		const interval = setInterval(() => {
			fetchData(gw);
		}, 60000);
		return () => clearInterval(interval);
	}, [gw]);

	// Effect to refetch when GW changes (manual navigation)
	useEffect(() => {
		if (gw) {
			const refresh = async () => {
				setLoading(true);
				try {
					const fixturesData = await getFixtures(gw);
					setFixtures(fixturesData);
				} catch (e) {
					console.error('Failed to refresh fixtures', e);
				} finally {
					setLoading(false);
				}
			};
			refresh();
		}
	}, [gw]);

	const handlePrevGw = () => setGw((prev) => Math.max(1, prev - 1));
	const handleNextGw = () => setGw((prev) => Math.min(38, prev + 1));

	// Merge & Sort
	const mergedFixtures = fixtures
		.map((f) => {
			const market = markets.find((m) => {
				if (!m.home_team || !m.away_team) return false;
				return m.home_team.code === f.team_h_code && m.away_team.code === f.team_a_code;
			});
			return { ...f, market };
		})
		.sort((a, b) => {
			if (sortBy === 'odds') {
				// Sort by "certainty" (max probability of any outcome)
				const maxProbA = a.market ? Math.max(...a.market.outcomes.slice(0, 3).map((o) => o.price)) : 0;
				const maxProbB = b.market ? Math.max(...b.market.outcomes.slice(0, 3).map((o) => o.price)) : 0;
				return maxProbB - maxProbA; // Descending
			}
			// Default: Time
			return new Date(a.kickoff_time) - new Date(b.kickoff_time);
		});

	const TeamBadge = ({ code }) => (
		<img
			src={getTeamBadgeUrl(code)}
			alt="Badge"
			className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm"
			onError={(e) => (e.target.style.display = 'none')}
		/>
	);

	// History Modal State
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [selectedTeams, setSelectedTeams] = useState({ home: null, away: null });

	// Lazy load HistoryModal? Or just import at top.
	// I need to add the import statement at the top of the file as well.
	// This tool call only replaces a block. I should probably use multi_replace or do it in two steps.
	// Let's assume I'll add the import in a separate call or use multi_replace.
	// I will use multi_replace to do both safely.

	const handleOpenHistory = async (teamH, teamA) => {
		setSelectedTeams({ home: teamH, away: teamA });
		setShowHistoryModal(true);
		setHistoryLoading(true);
		setHistoryData([]);

		try {
			const res = await fetch(`/api/history/h2h/${teamH.id}/${teamA.id}`);
			if (res.ok) {
				const data = await res.json();
				setHistoryData(data);
			}
		} catch (e) {
			console.error('Failed to fetch history', e);
		} finally {
			setHistoryLoading(false);
		}
	};

	const MarketCard = ({ f }) => {
		const isLive = f.started && !f.finished_provisional;
		const market = f.market;

		return (
			<div
				className={`bg-ds-card border ${isLive ? 'border-ds-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-ds-border'} rounded-xl overflow-hidden hover:border-ds-primary/50 transition-all group`}
			>
				{/* Header: Time & Status */}
				<div className="bg-ds-surface/50 px-4 py-2 flex justify-between items-center text-xs font-mono border-b border-ds-border/50">
					<div className="flex items-center gap-2">
						{isLive ? (
							<span className="text-green-400 font-bold flex items-center gap-1.5">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
								</span>
								LIVE • {f.minutes}'
							</span>
						) : (
							<span className="text-ds-text-muted">
								{new Date(f.kickoff_time).toLocaleDateString([], { weekday: 'short', day: 'numeric' })} •{' '}
								{new Date(f.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						{/* H2H Button */}
						<button
							onClick={() =>
								handleOpenHistory({ id: f.team_h, name: f.team_h_name }, { id: f.team_a, name: f.team_a_name })
							}
							className="flex items-center gap-1 text-ds-text-muted hover:text-ds-primary transition-colors cursor-pointer"
						>
							<span className="hidden sm:inline">H2H</span>
							<span className="sm:hidden">H2H</span>
						</button>

						{market && (
							<a
								href={`https://polymarket.com/event/${market.slug}`}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
							>
								<span className="hidden sm:inline">Polymarket</span>
								<ArrowUpRight size={12} />
							</a>
						)}
					</div>
				</div>

				<div className="p-4 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
					{/* Left Column: Match & Stats */}
					<div className="flex flex-col gap-2 min-w-0">
						{/* Match Score/Vs */}
						<div className="flex items-center justify-between gap-4">
							{/* Home */}
							<TeamPopover
								team={{ id: f.team_h, code: f.team_h_code, name: f.team_h_name, short_name: f.team_h_short }}
								className="flex-1 min-w-0"
							>
								<div className="flex items-center gap-3 justify-end w-full cursor-pointer hover:opacity-80 transition-opacity">
									<span className="font-bold text-lg hidden sm:block text-right">{f.team_h_name}</span>
									<span className="font-bold text-lg sm:hidden text-right">{f.team_h_short}</span>
									<TeamBadge code={f.team_h_code} />
								</div>
							</TeamPopover>

							{/* Middle Score */}
							<div className="flex flex-col items-center min-w-[60px]">
								{f.started ? (
									<div className="text-3xl font-bold font-mono tracking-tighter">
										{f.team_h_score}-{f.team_a_score}
									</div>
								) : (
									<div className="text-ds-text-muted text-sm font-bold bg-ds-surface px-2 py-1 rounded">VS</div>
								)}
							</div>

							{/* Away */}
							<TeamPopover
								team={{ id: f.team_a, code: f.team_a_code, name: f.team_a_name, short_name: f.team_a_short }}
								className="flex-1 min-w-0"
							>
								<div className="flex items-center gap-3 justify-start w-full cursor-pointer hover:opacity-80 transition-opacity">
									<TeamBadge code={f.team_a_code} />
									<span className="font-bold text-lg hidden sm:block text-left">{f.team_a_name}</span>
									<span className="font-bold text-lg sm:hidden text-left">{f.team_a_short}</span>
								</div>
							</TeamPopover>
						</div>

						{/* H2H Stats Bar */}
						{(() => {
							const stats = h2hStatsFilter === 'venue' ? f.history_stats_venue : f.history_stats;
							if (!stats) return null;

							return (
								<div className="px-2">
									<div className="flex justify-between text-[10px] font-bold text-ds-text-muted uppercase tracking-wider mb-1">
										<span className="text-green-500">{stats.team_h_win}%</span>
										<span>H2H ({stats.total})</span>
										<span className="text-red-500">{stats.team_a_win}%</span>
									</div>
									<div
										className="h-1.5 w-full bg-ds-bg rounded-full overflow-hidden flex opacity-80 hover:opacity-100 transition-opacity"
										title={`H2H History: Home ${stats.team_h_win}%, Draw ${stats.draw}%, Away ${stats.team_a_win}%`}
									>
										<div className="h-full bg-green-500" style={{ width: `${stats.team_h_win}%` }} />
										<div className="h-full bg-gray-500/50" style={{ width: `${stats.draw}%` }} />
										<div className="h-full bg-red-500" style={{ width: `${stats.team_a_win}%` }} />
									</div>
								</div>
							);
						})()}
					</div>

					{/* Right: Odds Buttons */}
					<div className="flex items-center justify-center md:justify-end gap-2">
						{market ? (
							<>
								{market.outcomes.slice(0, 3).map((outcome, idx) => {
									const prob = Math.round(outcome.price * 100);
									const label = outcome.label === 'Draw' ? 'Draw' : idx === 0 ? f.team_h_short : f.team_a_short;

									// Dynamic coloring based on probability
									let styles = PROBABILITY_COLORS.LOW;
									if (prob > 60) styles = PROBABILITY_COLORS.HIGH;
									else if (prob > 40) styles = PROBABILITY_COLORS.MEDIUM;

									return (
										<div
											key={idx}
											className={`flex flex-col items-center justify-center w-20 h-14 rounded-lg border ${styles.bg} ${styles.text} ${styles.border} transition-all`}
										>
											<span
												className={`text-[10px] uppercase font-bold opacity-70 truncate w-full text-center px-1 ${styles.label}`}
											>
												{label}
											</span>
											<span className="text-lg font-bold font-mono">{prob}%</span>
										</div>
									);
								})}
							</>
						) : (
							<div className="text-xs text-ds-text-muted italic flex items-center justify-center h-14 w-full bg-ds-surface/30 rounded-lg border border-ds-border/30 border-dashed">
								Market data unavailable
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	if (loading && !fixtures.length)
		return (
			<div className="text-center p-20">
				<div className="w-8 h-8 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-ds-text-muted animate-pulse">Loading Market Data...</p>
			</div>
		);

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
			<HistoryModal
				isOpen={showHistoryModal}
				onClose={() => setShowHistoryModal(false)}
				history={historyData}
				teamH={selectedTeams.home}
				teamA={selectedTeams.away}
			/>

			<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
				<h2 className="text-2xl font-bold flex items-center gap-3">
					<span className="text-3xl">🏟️</span>
					<span>
						Match <span className="text-ds-primary">Center</span>
					</span>
				</h2>

				<div className="flex items-center gap-3">
					{/* H2H Filter Toggle */}
					<div className="flex p-0.5 bg-ds-surface rounded-lg border border-ds-border">
						<button
							onClick={() => setH2hStatsFilter('all')}
							className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${h2hStatsFilter === 'all' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							All Matches
						</button>
						<button
							onClick={() => setH2hStatsFilter('venue')}
							className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${h2hStatsFilter === 'venue' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							Same Venue
						</button>
					</div>

					<button
						onClick={() => setSortBy((prev) => (prev === 'time' ? 'odds' : 'time'))}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ds-surface border border-ds-border hover:border-ds-primary/50 transition-colors text-xs font-bold text-ds-text"
					>
						<ArrowUpDown size={14} />
						<span>{sortBy === 'time' ? 'By Time' : 'By Odds'}</span>
					</button>

					<div className="flex items-center gap-0 bg-ds-surface rounded-full border border-ds-border p-1">
						<button
							onClick={handlePrevGw}
							className="p-1 rounded-full hover:bg-ds-bg text-ds-text-muted hover:text-ds-text transition-colors"
						>
							<ChevronLeft size={18} />
						</button>
						<span className="px-3 min-w-[100px] text-center text-sm font-bold text-ds-text font-mono">
							Gameweek {gw}
						</span>
						<button
							onClick={handleNextGw}
							className="p-1 rounded-full hover:bg-ds-bg text-ds-text-muted hover:text-ds-text transition-colors"
						>
							<ChevronRight size={18} />
						</button>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				{mergedFixtures.length > 0 ? (
					mergedFixtures.map((f) => <MarketCard key={f.id} f={f} />)
				) : (
					<div className="text-center py-20 bg-ds-card rounded-xl border border-ds-border">
						<p className="text-ds-text-muted">No fixtures found for this Gameweek.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MarketOverview;
