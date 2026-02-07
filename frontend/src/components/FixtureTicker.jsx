import React, { useState, useEffect } from 'react';

const FixtureTicker = () => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mode, setMode] = useState('attack'); // 'attack' or 'defense'

	// Initial load
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const response = await fetch(`/api/optimization/fixtures`);
				if (!response.ok) {
					throw new Error('Failed to fetch fixture analysis');
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

	// Custom color map for 1-5 scale
	const getFDRColor = (score) => {
		if (score <= 2.2) return 'bg-green-500 text-white'; // Easy
		if (score <= 2.8) return 'bg-green-600/80 text-white'; // Good
		if (score <= 3.2) return 'bg-gray-500 text-white'; // Average
		if (score <= 4.0) return 'bg-red-500/90 text-white'; // Hard
		return 'bg-red-700 text-white'; // Very Hard
	};

	const sortedData = data
		? [...data].sort((a, b) => {
				if (mode === 'attack') return a.avg_difficulty_attack - b.avg_difficulty_attack;
				if (mode === 'defense') return a.avg_difficulty_defend - b.avg_difficulty_defend;
				if (mode === 'market') return a.avg_difficulty_market - b.avg_difficulty_market;
				return 0;
			})
		: [];

	if (loading)
		return (
			<div className="bg-ds-card rounded-xl p-8 md:p-12 border border-ds-border shadow-sm flex flex-col items-center justify-center text-center">
				<div className="w-8 h-8 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mb-4"></div>
				<p className="text-ds-text-muted text-sm">Analyzing Strength of Schedule...</p>
			</div>
		);

	if (error) return null;

	return (
		<div className="bg-ds-card rounded-xl border border-ds-border shadow-sm overflow-hidden animate-in fade-in duration-500">
			<div className="p-4 border-b border-ds-border flex justify-between items-center bg-ds-surface/50">
				<div>
					<h2 className="text-lg font-bold text-ds-text flex items-center gap-2">
						<span className="text-ds-primary">🗓️</span> Fixture Ticker (Next 5)
					</h2>
					<p className="text-xs text-ds-text-muted">
						{mode === 'market'
							? 'Real-time difficulty based on betting market odds.'
							: `Dynamic difficulty based on opponent ${mode === 'attack' ? 'defense' : 'attack'} strength.`}
					</p>
				</div>

				<div className="flex bg-ds-bg rounded-lg p-1 border border-ds-border text-xs font-bold gap-1">
					<button
						onClick={() => setMode('attack')}
						className={`px-3 py-1 rounded-md transition-all ${mode === 'attack' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
					>
						Attack
					</button>
					<button
						onClick={() => setMode('defense')}
						className={`px-3 py-1 rounded-md transition-all ${mode === 'defense' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
					>
						Defense
					</button>
					<button
						onClick={() => setMode('market')}
						className={`px-3 py-1 rounded-md transition-all ${mode === 'market' ? 'bg-emerald-600 text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
					>
						Market <sup>β</sup>
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-xs md:text-sm text-left text-ds-text font-mono">
					<thead className="bg-ds-surface text-ds-text-muted border-b border-ds-border uppercase text-[10px]">
						<tr>
							<th className="px-3 py-2 w-16">Rank</th>
							<th className="px-3 py-2 w-24">Team</th>
							{sortedData[0]?.next_5.map((f, i) => (
								<th key={i} className="px-1 py-2 text-center w-12 text-ds-text/50">
									GW{f.gameweek}
								</th>
							))}
							<th className="px-3 py-2 text-right">FDR</th>
						</tr>
					</thead>
					<tbody>
						{sortedData.slice(0, 20).map((team, index) => (
							<tr
								key={team.team_id}
								className="border-b border-ds-border hover:bg-ds-card-hover/50 transition-colors last:border-none"
							>
								<td className="px-3 py-2 font-bold text-ds-text-muted">#{index + 1}</td>
								<td className="px-3 py-2">
									<div className="flex items-center gap-2">
										<img
											src={`https://resources.premierleague.com/premierleague/badges/70/t${team.team_code}.png`}
											alt={team.team_short}
											className="w-6 h-6 object-contain"
											onError={(e) => {
												e.target.style.display = 'none';
											}}
										/>
										<span className="font-bold">{team.team_short}</span>
									</div>
								</td>
								{team.next_5.map((f, i) => {
									let difficulty;
									if (mode === 'market') difficulty = f.fdr_market;
									else if (mode === 'attack') difficulty = f.fdr_attack;
									else difficulty = f.fdr_defend;

									// Fallback for market if data missing (usually 3.0 from backend default, but good to handle)
									if (difficulty === undefined) difficulty = 3.0;

									return (
										<td key={i} className="p-1">
											<div
												className={`w-full h-8 flex flex-col items-center justify-center rounded text-[10px] leading-tight ${getFDRColor(difficulty)} relative group cursor-help`}
											>
												<span className="font-bold">{f.opponent}</span>
												<div className="flex items-center gap-0.5 transform scale-75 opacity-90">
													<span>{f.is_home ? 'H' : 'A'}</span>
													{mode !== 'market' && <span className="font-extrabold ml-1">{difficulty}</span>}
												</div>
												{/* Tooltip for Win % in Market Mode */}
												{mode === 'market' && f.win_prob !== null && f.win_prob !== undefined && (
													<div className="absolute bottom-full mb-1 hidden group-hover:block bg-black/90 text-white text-[9px] p-1 rounded whitespace-nowrap z-10">
														Win: {(f.win_prob * 100).toFixed(0)}%
														<span className="opacity-50 ml-1">
															{f.source_type === 'market' && '(Mkt)'}
															{f.source_type === 'calc' && '(Est)'}
															{f.source_type === 'result' && '(Res)'}
														</span>
													</div>
												)}
											</div>
										</td>
									);
								})}
								<td className="px-3 py-2 text-right font-bold text-ds-text">
									{mode === 'market'
										? team.avg_difficulty_market?.toFixed(2)
										: mode === 'attack'
											? team.avg_difficulty_attack.toFixed(2)
											: team.avg_difficulty_defend.toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default FixtureTicker;
