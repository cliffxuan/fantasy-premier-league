import React, { useState, useEffect } from 'react';
import { getFixtures, getPolymarketData } from '../api';
import { ArrowUpRight, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const MarketOverview = () => {
	const [fixtures, setFixtures] = useState([]);
	const [markets, setMarkets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [gw, setGw] = useState(null);
	const [currentGw, setCurrentGw] = useState(null);
	const [sortBy, setSortBy] = useState('time'); // 'time' or 'odds'

	useEffect(() => {
		const init = async () => {
			try {
				// 1. Get current gameweek and data
				const gwRes = await fetch('/api/gameweek/current');
				const gwData = await gwRes.json();
				const nowGw = gwData.gameweek;

				// Check if current gameweek is finished
				// We need to fetch fixtures for current week to check status
				let targetGw = nowGw;
				try {
					const currentFixtures = await getFixtures(nowGw);
					const allFinished = currentFixtures.length > 0 && currentFixtures.every(f => f.finished || f.finished_provisional);

					if (allFinished && nowGw < 38) {
						targetGw = nowGw + 1;
					}
				} catch (err) {
					console.warn("Failed to check fixture status", err);
				}

				setGw(targetGw);
				setCurrentGw(nowGw); // Keep track of actual current GW

				// Fetch Initial Data
				await fetchData(targetGw);
			} catch (e) {
				console.error("Failed to init market overview", e);
			}
		};

		const fetchData = async (targetGw) => {
			setLoading(true);
			try {
				// Fetch Fixtures & Market Data in parallel
				// Note: Polymarket data is usually for "upcoming" or "all", so we fetch once and filter?
				// Or just re-fetch to be safe. Since getPolymarketData doesn't take GW arg, it returns all available.
				const [fixturesData, marketData] = await Promise.all([
					getFixtures(targetGw),
					getPolymarketData()
				]);

				setFixtures(fixturesData);
				// Only set markets if we have them, otherwise keep existing or empty
				if (marketData) setMarkets(marketData);
			} catch (e) {
				console.error("Failed to fetch data", e);
			} finally {
				setLoading(false);
			}
		};

		init();

		// Poll every 60s only for current view
		const interval = setInterval(() => {
			if (gw) fetchData(gw);
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	// Effect to refetch when GW changes (manual navigation)
	useEffect(() => {
		if (gw) {
			const refresh = async () => {
				setLoading(true);
				try {
					const fixturesData = await getFixtures(gw);
					setFixtures(fixturesData);
				} catch (e) {
					console.error("Failed to refresh fixtures", e)
				} finally {
					setLoading(false);
				}
			}
			refresh();
		}
	}, [gw]);


	const handlePrevGw = () => setGw(prev => Math.max(1, prev - 1));
	const handleNextGw = () => setGw(prev => Math.min(38, prev + 1));

	// Merge & Sort
	const mergedFixtures = fixtures.map(f => {
		const market = markets.find(m => {
			if (!m.home_team || !m.away_team) return false;
			return m.home_team.code === f.team_h_code && m.away_team.code === f.team_a_code;
		});
		return { ...f, market };
	}).sort((a, b) => {
		if (sortBy === 'odds') {
			// Sort by "certainty" (max probability of any outcome)
			const maxProbA = a.market ? Math.max(...a.market.outcomes.slice(0, 3).map(o => o.price)) : 0;
			const maxProbB = b.market ? Math.max(...b.market.outcomes.slice(0, 3).map(o => o.price)) : 0;
			return maxProbB - maxProbA; // Descending
		}
		// Default: Time
		return new Date(a.kickoff_time) - new Date(b.kickoff_time);
	});

	const TeamBadge = ({ code }) => (
		<img
			src={`https://resources.premierleague.com/premierleague/badges/50/t${code}.png`}
			alt="Badge"
			className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm"
			onError={(e) => e.target.style.display = 'none'}
		/>
	);

	const MarketCard = ({ f }) => {
		const isLive = f.started && !f.finished_provisional;
		const market = f.market;

		return (
			<div className={`bg-ds-card border ${isLive ? 'border-ds-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-ds-border'} rounded-xl overflow-hidden hover:border-ds-primary/50 transition-all group`}>

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
								{new Date(f.kickoff_time).toLocaleDateString([], { weekday: 'short', day: 'numeric' })} • {new Date(f.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						)}
					</div>
					{market && (
						<a href={`https://polymarket.com/event/${market.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
							<span className="hidden sm:inline">Polymarket</span>
							<ArrowUpRight size={12} />
						</a>
					)}
				</div>

				<div className="p-4 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">

					{/* Left: Match Score/Vs */}
					<div className="flex items-center justify-between gap-4">
						{/* Home */}
						<div className="flex items-center gap-3 flex-1 justify-end">
							<span className="font-bold text-lg hidden sm:block text-right">{f.team_h_name}</span>
							<span className="font-bold text-lg sm:hidden text-right">{f.team_h_short}</span>
							<TeamBadge code={f.team_h_code} />
						</div>

						{/* Middle Score */}
						<div className="flex flex-col items-center min-w-[60px]">
							{f.started ? (
								<div className="text-3xl font-bold font-mono tracking-tighter">
									{f.team_h_score}-{f.team_a_score}
								</div>
							) : (
								<div className="text-ds-text-muted text-sm font-bold bg-ds-surface px-2 py-1 rounded">
									VS
								</div>
							)}
						</div>

						{/* Away */}
						<div className="flex items-center gap-3 flex-1 justify-start">
							<TeamBadge code={f.team_a_code} />
							<span className="font-bold text-lg hidden sm:block text-left">{f.team_a_name}</span>
							<span className="font-bold text-lg sm:hidden text-left">{f.team_a_short}</span>
						</div>
					</div>

					{/* Right: Odds Buttons */}
					<div className="flex items-center justify-center md:justify-end gap-2">
						{market ? (
							<>
								{market.outcomes.slice(0, 3).map((outcome, idx) => {
									const prob = Math.round(outcome.price * 100);
									const label = outcome.label === 'Draw' ? 'Draw' : (idx === 0 ? f.team_h_short : f.team_a_short);

									// Dynamic coloring based on probability
									let colorClass = "bg-ds-surface text-ds-text-muted border-ds-border";
									if (prob > 60) colorClass = "bg-green-500/10 text-green-400 border-green-500/30";
									else if (prob > 40) colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/30";

									return (
										<div key={idx} className={`flex flex-col items-center justify-center w-20 h-14 rounded-lg border ${colorClass} transition-all`}>
											<span className="text-[10px] uppercase font-bold opacity-70 truncate w-full text-center px-1">{label}</span>
											<span className="text-lg font-bold font-mono">{prob}%</span>
										</div>
									)
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

	if (loading && !fixtures.length) return (
		<div className="text-center p-20">
			<div className="w-8 h-8 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p className="text-ds-text-muted animate-pulse">Loading Market Data...</p>
		</div>
	);

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
				<h2 className="text-2xl font-bold flex items-center gap-3">
					<span className="text-3xl">🏟️</span>
					<span>Match <span className="text-ds-primary">Center</span></span>
				</h2>

				<div className="flex items-center gap-3">
					<button
						onClick={() => setSortBy(prev => prev === 'time' ? 'odds' : 'time')}
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
					mergedFixtures.map(f => <MarketCard key={f.id} f={f} />)
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
