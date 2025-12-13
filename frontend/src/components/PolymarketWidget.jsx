import React, { useEffect, useState } from 'react';
import { getPolymarketData } from '../api';

const PolymarketWidget = () => {
	const [markets, setMarkets] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getPolymarketData();
				setMarkets(data);
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

	const getBadgeUrl = (code) => {
		if (!code) return null;
		return `https://resources.premierleague.com/premierleague/badges/70/t${code}.png`;
	};

	return (
		<div className="bg-ds-card rounded-xl border border-ds-border p-6 shadow-sm overflow-hidden">
			<h3 className="text-xl font-bold text-ds-text mb-4 flex items-center gap-2">
				<span className="text-blue-500">◆</span> Market Insights
			</h3>
			<div className="flex flex-col gap-2">
				{markets.map((market) => {
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
									{market.gameweek && <span className="text-blue-400 font-bold mt-1">GW {market.gameweek}</span>}
								</div>

								{/* Center: Teams */}
								<div className="flex-1 flex items-center justify-center gap-4 min-w-0">
									{/* Home Team */}
									<div className="flex items-center gap-2 justify-end flex-1">
										<span className="text-sm font-bold text-ds-text hidden sm:block">{market.home_team?.short_name || "HOME"}</span>
										{market.home_team?.code ? (
											<img src={getBadgeUrl(market.home_team.code)} alt={market.home_team.short_name} className="w-8 h-8 object-contain" />
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
											<img src={getBadgeUrl(market.away_team.code)} alt={market.away_team.short_name} className="w-8 h-8 object-contain" />
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

										let styles = {
											bg: "bg-slate-700/10 hover:bg-slate-700/20",
											text: "text-slate-500",
											border: "border-slate-700/30",
											label: "text-slate-600"
										};

										if (prob >= 0.6) {
											styles = {
												bg: "bg-emerald-500/20 hover:bg-emerald-500/30",
												text: "text-emerald-400",
												border: "border-emerald-500/50",
												label: "text-emerald-400/60"
											};
										} else if (prob >= 0.4) {
											styles = {
												bg: "bg-blue-500/20 hover:bg-blue-500/30",
												text: "text-blue-400",
												border: "border-blue-500/50",
												label: "text-blue-400/60"
											};
										} else if (prob >= 0.25) {
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
