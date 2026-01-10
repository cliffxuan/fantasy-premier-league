import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { getPolymarketData } from '../api';
import { getTeamBadgeUrl, PROBABILITY_COLORS } from '../utils';

const PolymarketWidget = () => {
	const [markets, setMarkets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedGw, setSelectedGw] = useState(null);
	const [sortBy, setSortBy] = useState('date');

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getPolymarketData();
				setMarkets(data);

				// Set default GW to the earliest one found in the data
				const gws = Array.from(new Set(data.map(m => m.gameweek).filter(Boolean))).sort((a, b) => a - b);
				if (gws.length > 0) {
					setSelectedGw(gws[0]);
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="bg-ds-card rounded-xl border border-ds-border p-6 shadow-sm animate-pulse">
				<div className="h-6 bg-ds-border rounded w-1/3 mb-4"></div>
				<div className="space-y-3">
					<div className="h-20 bg-ds-bg rounded-lg"></div>
					<div className="h-20 bg-ds-bg rounded-lg"></div>
					<div className="h-20 bg-ds-bg rounded-lg"></div>
				</div>
			</div>
		);
	}

	if (!markets || markets.length === 0) {
		return null; // Don't show if no data
	}



	const availableGws = Array.from(new Set(markets.map(m => m.gameweek).filter(Boolean))).sort((a, b) => a - b);
	const hasGameweekData = availableGws.length > 0;

	const displayedMarkets = hasGameweekData && selectedGw
		? markets.filter(m => m.gameweek === selectedGw)
		: markets;

	const sortedMarkets = [...displayedMarkets].sort((a, b) => {
		if (sortBy === 'odds') {
			const maxA = Math.max(...a.outcomes.slice(0, 3).map(o => o.price || 0));
			const maxB = Math.max(...b.outcomes.slice(0, 3).map(o => o.price || 0));
			return maxB - maxA;
		}
		return new Date(a.endDate) - new Date(b.endDate);
	});

	const handlePrev = () => {
		if (!selectedGw) return;
		const idx = availableGws.indexOf(selectedGw);
		if (idx > 0) setSelectedGw(availableGws[idx - 1]);
	};

	const handleNext = () => {
		if (!selectedGw) return;
		const idx = availableGws.indexOf(selectedGw);
		if (idx < availableGws.length - 1) setSelectedGw(availableGws[idx + 1]);
	};

	return (
		<div className="bg-ds-card rounded-xl border border-ds-border p-6 shadow-sm overflow-hidden">
			<div className="flex flex-row items-center justify-between mb-4">
				<h3 className="text-xl font-bold text-ds-text flex items-center gap-2">
					<span className="text-blue-500">◆</span> Market Insights
				</h3>

				<div className="flex items-center gap-3">
					<button
						onClick={() => setSortBy(prev => prev === 'date' ? 'odds' : 'date')}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ds-bg/50 border border-ds-border hover:border-ds-primary/30 transition-colors text-xs font-medium text-ds-text-muted hover:text-ds-text"
					>
						<ArrowUpDown size={14} />
						<span>{sortBy === 'date' ? 'By Date' : 'By Odds'}</span>
					</button>

					{hasGameweekData && (
						<div className="flex items-center gap-3 bg-ds-bg/50 rounded-full px-3 py-1.5 border border-ds-border transition-colors hover:border-ds-primary/30">
							<button
								onClick={handlePrev}
								disabled={availableGws.indexOf(selectedGw) <= 0}
								className="p-1 rounded-full hover:bg-ds-card hover:text-ds-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:cursor-not-allowed transition-colors"
							>
								<ChevronLeft size={18} />
							</button>
							<span className="text-sm font-bold text-center text-ds-text min-w-[100px]">
								Gameweek {selectedGw}
							</span>
							<button
								onClick={handleNext}
								disabled={availableGws.indexOf(selectedGw) >= availableGws.length - 1}
								className="p-1 rounded-full hover:bg-ds-card hover:text-ds-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:cursor-not-allowed transition-colors"
							>
								<ChevronRight size={18} />
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				{sortedMarkets.map((market) => {
					const dateObj = new Date(market.endDate);
					const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
					const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

					return (
						<a
							key={market.id}
							href={`https://polymarket.com/event/${market.slug}`}
							target="_blank"
							rel="noopener noreferrer"
							className="block bg-ds-bg/30 hover:bg-ds-bg/50 border border-ds-border hover:border-ds-primary/30 transition-all rounded-lg p-3 group"
						>
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								{/* Left: Date & Time */}
								<div className="flex flex-col items-center md:items-start text-[10px] text-ds-text-muted font-mono w-20 shrink-0">
									<span className="font-bold text-ds-text">{dateStr}</span>
									<span>{timeStr}</span>
									{/* GW Badge removed from here as it's now in header filter */}
								</div>

								{/* Center: Teams */}
								<div className="flex-1 flex items-center justify-center gap-4 min-w-0">
									{/* Home Team */}
									<div className="flex items-center gap-2 justify-end flex-1">
										<span className="text-sm font-bold text-ds-text hidden sm:block">{market.home_team?.short_name || "HOME"}</span>
										{market.home_team?.code ? (
											<img src={getTeamBadgeUrl(market.home_team.code, 70)} alt={market.home_team.short_name} className="w-8 h-8 object-contain" />
										) : (
											<div className="w-8 h-8 rounded-full bg-ds-card border border-ds-border flex items-center justify-center text-[10px] font-bold text-ds-text-muted">
												{market.home_team?.short_name?.[0] || "?"}
											</div>
										)}
									</div>

									<span className="text-xs text-ds-text-muted font-mono opacity-50">VS</span>

									{/* Away Team */}
									<div className="flex items-center gap-2 justify-start flex-1">
										{market.away_team?.code ? (
											<img src={getTeamBadgeUrl(market.away_team.code, 70)} alt={market.away_team.short_name} className="w-8 h-8 object-contain" />
										) : (
											<div className="w-8 h-8 rounded-full bg-ds-card border border-ds-border flex items-center justify-center text-[10px] font-bold text-ds-text-muted">
												{market.away_team?.short_name?.[0] || "?"}
											</div>
										)}
										<span className="text-sm font-bold text-ds-text hidden sm:block">{market.away_team?.short_name || "AWAY"}</span>
									</div>
								</div>

								{/* Right: Odds */}
								<div className="flex items-center gap-1">
									{market.outcomes.slice(0, 3).map((outcome, idx) => {
										const isDraw = outcome.label === "Draw";
										const prob = outcome.price;

										let styles = PROBABILITY_COLORS.LOW;

										if (prob >= 0.6) {
											styles = PROBABILITY_COLORS.HIGH;
										} else if (prob >= 0.4) {
											styles = PROBABILITY_COLORS.MEDIUM;
										} else if (prob >= 0.25) {
											// Keep LOW for now or define a specific "Low but relevant" if needed.
											// The original code had a specific gray style for > 25%.
											// Let's map it to LOW which is our gray default, or customized if needed.
											// Re-using LOW for consistency with MarketOverview
											styles = {
												bg: "bg-slate-500/20 hover:bg-slate-500/30",
												text: "text-slate-300",
												border: "border-slate-500/40",
												label: "text-slate-400/60"
											};
										}

										return (
											<div key={idx} className={`w-14 h-10 flex flex-col items-center justify-center rounded border ${styles.bg} ${styles.border} transition-colors`}>
												<span className={`text-[9px] uppercase tracking-wider mb-0.5 ${styles.label}`}>
													{isDraw ? "Draw" : (idx === 0 ? "1" : "2")}
												</span>
												<span className={`text-sm font-bold font-mono ${styles.text}`}>
													{Math.round(prob * 100)}%
												</span>
											</div>
										);
									})}
								</div>
							</div>
						</a>
					);
				})}
			</div>
			<div className="mt-6 text-center">
				<a href="https://polymarket.com/sports/epl/games" target="_blank" rel="noopener noreferrer" className="text-xs text-ds-text-muted hover:text-ds-primary transition-colors">
					View all Premier League Markets on Polymarket →
				</a>
			</div>
		</div>
	);
};

export default PolymarketWidget;
