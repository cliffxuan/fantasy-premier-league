import React, { useState, useEffect } from 'react';

const Top1000Analysis = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/api/analysis/top-1000');
				if (!response.ok) {
					throw new Error('Failed to fetch Top 1000 analysis');
				}
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return (
		<div className="bg-ds-card rounded-xl p-8 md:p-12 border border-ds-border shadow-sm flex flex-col items-center justify-center text-center">
			<div className="w-12 h-12 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mb-4"></div>
			<h3 className="text-xl font-bold text-ds-text mb-2">Analyzing Top 1000 Teams</h3>
			<p className="text-ds-text-muted max-w-md">
				Fetching and processing 1000 squads to determine the "Elite Template". This may take 20-30 seconds to avoid API rate limits.
			</p>
		</div>
	);

	if (error) return (
		<div className="bg-ds-card rounded-xl p-4 md:p-6 border border-ds-danger/30 shadow-sm text-center">
			<p className="text-ds-danger font-mono mb-2">Error loading analysis</p>
			<p className="text-sm text-ds-text-muted">{error}</p>
		</div>
	);

	if (!data) return null;

	const { players, sample_size, gameweek } = data;

	// Helper to determine row styling based on ownership
	const getRowStyle = (ownership) => {
		if (ownership >= 80) return 'bg-ds-primary/10'; // Super Template
		if (ownership >= 50) return 'bg-ds-primary/5';  // Template
		return '';
	};

	return (
		<div className="bg-ds-card rounded-xl p-4 md:p-6 border border-ds-border shadow-sm space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-bold text-ds-text flex items-center gap-2">
						<span className="text-ds-primary">🧠</span> Top 1000 Analysis
						<span className="text-xs font-mono font-normal bg-ds-surface px-2 py-1 rounded text-ds-text-muted">GW{gameweek}</span>
					</h2>
					<p className="text-sm text-ds-text-muted mt-1">
						Ownership stats from {sample_size} top-performing managers.
					</p>
				</div>
			</div>

			{/* Main Table */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left text-ds-text font-mono">
					<thead className="text-xs text-ds-text-muted uppercase bg-ds-card-hover/50 border-b border-ds-border">
						<tr>
							<th className="px-3 py-3 rounded-tl-lg">Rank</th>
							<th className="px-3 py-3">Player</th>
							<th className="px-3 py-3 text-center">Team</th>
							<th className="px-3 py-3 text-center">Pos</th>
							<th className="px-3 py-3 text-right">Cost</th>
							<th className="px-3 py-3 text-right text-ds-primary font-bold">Top 1k%</th>
							<th className="px-3 py-3 text-right text-ds-text-muted">Global%</th>
							<th className="px-3 py-3 text-right">Diff</th>
							<th className="px-3 py-3 text-right">Pts</th>
						</tr>
					</thead>
					<tbody>
						{players.slice(0, 50).map((player, index) => {
							const isDiff = player.ownership_top_1000 > 10 && player.ownership_top_1000 > (player.global_ownership * 2);

							return (
								<tr key={player.id} className={`border-b border-ds-border hover:bg-ds-card-hover transition-colors last:border-none ${getRowStyle(player.ownership_top_1000)}`}>
									<td className="px-3 py-3 text-ds-text-muted font-bold">{index + 1}</td>
									<td className="px-3 py-3 font-sans font-medium text-ds-text flex flex-col">
										<span>{player.web_name}</span>
										{player.captain_top_1000 > 5 && (
											<span className="text-[10px] text-ds-primary uppercase tracking-wider">
												© {player.captain_top_1000}% Cap
											</span>
										)}
									</td>
									<td className="px-3 py-3 text-center text-ds-text-muted">{player.team_short}</td>
									<td className="px-3 py-3 text-center text-ds-text-muted">
										{['GKP', 'DEF', 'MID', 'FWD'][player.element_type - 1]}
									</td>
									<td className="px-3 py-3 text-right text-ds-text-muted">£{player.cost}m</td>
									<td className="px-3 py-3 text-right font-bold text-ds-primary text-base">
										{player.ownership_top_1000}%
									</td>
									<td className="px-3 py-3 text-right text-ds-text-muted">
										{player.global_ownership}%
									</td>
									<td className={`px-3 py-3 text-right font-bold ${isDiff ? 'text-green-400' : 'text-ds-text-muted'}`}>
										{player.rank_diff > 0 ? '+' : ''}{player.rank_diff}%
									</td>
									<td className="px-3 py-3 text-right text-ds-text-muted">{player.total_points}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="text-center text-xs text-ds-text-muted italic">
				Showing top 50 players sorted by ownership among the Top 1000.
			</div>
		</div>
	);
};

export default Top1000Analysis;
