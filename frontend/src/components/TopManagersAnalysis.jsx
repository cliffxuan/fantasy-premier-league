import React, { useState, useEffect } from 'react';
import PlayerPopover from './PlayerPopover';

const TopManagersAnalysis = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [managerCount, setManagerCount] = useState(1000);
	const [positionFilter, setPositionFilter] = useState('ALL'); // ALL, GKP, DEF, MID, FWD

	// Initial load and subsequent updates
	// Define fetch logic
	const fetchData = async () => {
		setLoading(true); // Reset loading state on refetch
		try {
			const response = await fetch(`/api/analysis/top-managers?count=${managerCount}`);
			if (!response.ok) {
				throw new Error('Failed to fetch Top Managers analysis');
			}
			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Initial load only
	// Initial load removed - triggered by button only

	const handleCountChange = (e) => {
		setManagerCount(Number(e.target.value));
	};

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
						<span className="text-ds-primary">🧠</span> Top Managers Analysis
						{data && <span className="text-xs font-mono font-normal bg-ds-surface px-2 py-1 rounded text-ds-text-muted">GW{data.gameweek}</span>}
					</h2>
					<p className="text-sm text-ds-text-muted mt-1">
						{data ? `Ownership stats from ${data.sample_size} top-performing managers.` : 'Analyze ownership stats from top-performing managers.'}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<label htmlFor="position-filter" className="text-sm font-medium text-ds-text-muted">Pos:</label>
					<select
						id="position-filter"
						value={positionFilter}
						onChange={(e) => setPositionFilter(e.target.value)}
						className="bg-ds-bg border border-ds-border text-ds-text text-sm rounded-lg focus:ring-ds-primary focus:border-ds-primary block w-24 p-2.5 font-mono"
					>
						<option value="ALL">All</option>
						<option value="GKP">GKP</option>
						<option value="DEF">DEF</option>
						<option value="MID">MID</option>
						<option value="FWD">FWD</option>
					</select>

					<label htmlFor="manager-count" className="text-sm font-medium text-ds-text-muted ml-2">Top:</label>
					<select
						id="manager-count"
						value={managerCount}
						onChange={handleCountChange}
						disabled={loading}
						className="bg-ds-bg border border-ds-border text-ds-text text-sm rounded-lg focus:ring-ds-primary focus:border-ds-primary block w-32 p-2.5 font-mono"
					>
						{[5, 10, 25, 50, 100, 200, 500, 750, 1000].map((v) => (
							<option key={v} value={v}>{v}</option>
						))}
					</select>

					<button
						onClick={fetchData}
						disabled={loading}
						className="ml-2 bg-ds-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-ds-primary-hover active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100"
					>
						{loading ? '...' : 'Analyze'}
					</button>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="py-12 flex flex-col items-center justify-center text-center">
					<div className="w-12 h-12 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mb-4"></div>
					<h3 className="text-xl font-bold text-ds-text mb-2">Analyzing Top {managerCount} Teams</h3>
					<p className="text-ds-text-muted max-w-md">
						Fetching and processing {managerCount} squads to determine the "Elite Template". This may take 20-30 seconds to avoid API rate limits.
					</p>
				</div>
			)}

			{/* Error State */}
			{!loading && error && (
				<div className="py-8 text-center border border-ds-danger/30 rounded-lg bg-ds-danger/5">
					<p className="text-ds-danger font-mono mb-2">Error loading analysis</p>
					<p className="text-sm text-ds-text-muted">{error}</p>
				</div>
			)}

			{/* Empty State */}
			{!loading && !error && !data && (
				<div className="py-12 text-center text-ds-text-muted">
					<p>Select a sample size and click "Analyze" to see key ownership stats.</p>
				</div>
			)}

			{/* Main Table */}
			{!loading && !error && data && (
				<>
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
								{data.players
									.filter(player => {
										if (positionFilter === 'ALL') return true;
										const typeMap = { 'GKP': 1, 'DEF': 2, 'MID': 3, 'FWD': 4 };
										return player.element_type === typeMap[positionFilter];
									})
									.slice(0, 50)
									.map((player, index) => {
										const isDiff = player.ownership_top_1000 > 10 && player.ownership_top_1000 > (player.global_ownership * 2);

										return (
											<tr key={player.id} className={`border-b border-ds-border hover:bg-ds-card-hover transition-colors last:border-none ${getRowStyle(player.ownership_top_1000)}`}>
												<td className="px-3 py-3 text-ds-text-muted font-bold">{index + 1}</td>
												<td className="px-3 py-3 font-sans font-medium text-ds-text">
													<PlayerPopover player={{
														id: player.id,
														code: player.code,
														name: player.web_name,
														full_name: player.full_name,
														team: player.team_short,
														position: player.element_type,
														total_points: player.total_points,
														cost: player.cost,
														// Approximations as we don't have user-specific purchase data
														purchase_price: player.cost,
														selling_price: player.cost,
														news: player.news
													}}>
														<div className="flex flex-col cursor-pointer hover:text-ds-primary transition-colors">
															<span>{player.web_name}</span>
															{player.captain_top_1000 > 5 && (
																<span className="text-[10px] text-ds-primary uppercase tracking-wider">
																	© {player.captain_top_1000}% Cap
																</span>
															)}
														</div>
													</PlayerPopover>
												</td>
												<td className="px-3 py-2 text-center text-ds-text-muted">
													<div className="flex flex-col items-center justify-center gap-1">
														<img
															src={`https://resources.premierleague.com/premierleague/badges/70/t${player.team_code}.png`}
															alt={player.team_short}
															className="w-5 h-5 object-contain"
															onError={(e) => { e.target.style.display = 'none'; }}
														/>
														<span className="text-[10px]">{player.team_short}</span>
													</div>
												</td>
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
						Showing top 50 {positionFilter !== 'ALL' ? positionFilter : ''} players sorted by ownership among the Top {data.sample_size}.
					</div>
				</>
			)}
		</div>
	);
};

export default TopManagersAnalysis;
