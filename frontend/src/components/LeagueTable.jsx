import React, { useState, useEffect } from 'react';

const LeagueTable = () => {
	const [table, setTable] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTable = async () => {
			try {
				const response = await fetch('/api/league-table');
				if (!response.ok) {
					throw new Error('Failed to fetch league table');
				}
				const data = await response.json();
				setTable(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTable();
	}, []);

	if (loading) return <div className="text-ds-text-muted text-center p-4 font-mono">Loading table...</div>;
	if (error) return <div className="text-ds-danger text-center p-4 font-mono">{error}</div>;
	if (!table || table.length === 0) return null;

	return (
		<div className="bg-ds-card rounded-xl p-4 md:p-6 border border-ds-border shadow-sm">
			<h2 className="text-xl font-bold mb-4 text-ds-text flex items-center gap-2">
				<span className="text-ds-primary">🏆</span> Premier League Table
			</h2>
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left text-ds-text font-mono">
					<thead className="text-xs text-ds-text-muted uppercase bg-ds-card-hover/50 border-b border-ds-border">
						<tr>
							<th className="px-1 py-2 md:px-4 md:py-3 rounded-tl-lg">Pos</th>
							<th className="px-1 py-2 md:px-4 md:py-3">Team</th>
							<th className="px-1 py-2 md:px-4 md:py-3 text-center">P</th>
							<th className="px-1 py-2 md:px-4 md:py-3 text-center">W</th>
							<th className="px-1 py-2 md:px-4 md:py-3 text-center">D</th>
							<th className="px-1 py-2 md:px-4 md:py-3 text-center">L</th>
							<th className="px-1 py-2 md:px-4 md:py-3 text-center font-bold text-ds-primary">Pts</th>
						</tr>
					</thead>
					<tbody>
						{table.map((team) => (
							<tr key={team.id} className="border-b border-ds-border hover:bg-ds-card-hover transition-colors last:border-none">
								<td className="px-1 py-2 md:px-4 md:py-3 font-bold">{team.position}</td>
								<td className="px-1 py-2 md:px-4 md:py-3 flex items-center gap-2">
									<img
										src={`https://resources.premierleague.com/premierleague/badges/25/t${team.code}.png`}
										alt={team.short_name}
										className="w-6 h-6 object-contain"
										onError={(e) => { e.target.style.display = 'none' }}
									/>
									<span className="hidden sm:inline font-sans">{team.name}</span>
									<span className="sm:hidden font-sans">{team.short_name}</span>
								</td>
								<td className="px-1 py-2 md:px-4 md:py-3 text-center text-ds-text-muted">{team.played}</td>
								<td className="px-1 py-2 md:px-4 md:py-3 text-center text-ds-text-muted">{team.won}</td>
								<td className="px-1 py-2 md:px-4 md:py-3 text-center text-ds-text-muted">{team.drawn}</td>
								<td className="px-1 py-2 md:px-4 md:py-3 text-center text-ds-text-muted">{team.lost}</td>
								<td className="px-1 py-2 md:px-4 md:py-3 text-center font-bold text-ds-primary">{team.points}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default LeagueTable;
