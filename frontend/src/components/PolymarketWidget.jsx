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

	return (
		<div className="bg-ds-card rounded-xl border border-ds-border p-6 shadow-sm overflow-hidden">
			<h3 className="text-xl font-bold text-ds-text mb-4 flex items-center gap-2">
				<span className="text-blue-500">◆</span> Market Insights
			</h3>
			<div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
				{markets.map((market) => {
					const matchTime = new Date(market.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
					const volumeStr = `$${(market.volume / 1000).toFixed(1)}k Vol.`;

					return (
						<a
							key={market.id}
							href={`https://polymarket.com/event/${market.slug}`}
							target="_blank"
							rel="noopener noreferrer"
							className="block bg-ds-bg/30 hover:bg-ds-bg/50 border border-ds-border hover:border-ds-primary/30 transition-all rounded-lg p-3 group"
						>
							{/* Header: Time & Vol */}
							<div className="flex items-center gap-3 text-[10px] text-ds-text-muted mb-2 font-mono uppercase tracking-wide">
								<span>{matchTime}</span>
								<span>{volumeStr}</span>
							</div>

							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								{/* Teams */}
								<div className="flex items-center gap-3 min-w-0">
									{market.image ? (
										<img src={market.image} alt="" className="w-8 h-8 rounded-full object-cover border border-ds-border bg-ds-bg" />
									) : (
										<div className="w-8 h-8 rounded-full bg-ds-card border border-ds-border flex items-center justify-center text-xs font-bold text-ds-text-muted">EPL</div>
									)}
									<h4 className="text-sm font-semibold text-ds-text truncate group-hover:text-blue-400 transition-colors">
										{market.question}
									</h4>
								</div>

								{/* Outcomes Row */}
								<div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
									{market.outcomes.slice(0, 3).map((outcome, idx) => {
										const isDraw = outcome.label === "Draw";
										// Polymarket styles: Teams have color (blue/red or generic primary), Draw is gray.
										// We use primary for teams, slate for draw.
										const baseBg = isDraw ? "bg-slate-700/50 hover:bg-slate-700" : "bg-blue-600/20 hover:bg-blue-600/30";
										const textColor = isDraw ? "text-slate-300" : "text-blue-400";
										const borderColor = isDraw ? "border-slate-600" : "border-blue-500/30";

										// Shorten labels for button logic if needed, but grid usually fits them or we just show price highlighted
										// Polymarket shows: [TeamShort Price] e.g. [CHE 58¢]
										// We can try to emulate compact label: first 3 chars uppercase?
										let ticker = outcome.label.slice(0, 3).toUpperCase();
										if (isDraw) ticker = "DRAW";

										return (
											<div key={idx} className={`flex-1 sm:flex-none flex flex-col items-center justify-center py-1.5 px-3 rounded text-center border ${baseBg} ${borderColor} transition-colors min-w-[70px]`}>
												<span className={`text-[9px] font-bold tracking-wider ${isDraw ? 'text-slate-400' : 'text-blue-300/80'}`}>
													{ticker}
												</span>
												<span className={`text-sm font-bold font-mono ${textColor}`}>
													{Math.round(outcome.price * 100)}¢
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
			<div className="mt-4 text-center">
				<a href="https://polymarket.com/sport/soccer" target="_blank" rel="noopener noreferrer" className="text-xs text-ds-text-muted hover:text-ds-primary transition-colors">
					View all Premier League Markets →
				</a>
			</div>
		</div>
	);
};


export default PolymarketWidget;

