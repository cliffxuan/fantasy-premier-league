import React, { useState } from 'react';

const Solver = () => {
	const [budget, setBudget] = useState(100.0);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSolve = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch(`/api/optimization/solve?budget=${budget}`);
			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.detail || 'Solver failed');
			}
			const data = await response.json();
			setResult(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-ds-card rounded-xl p-4 md:p-6 border border-ds-border shadow-sm space-y-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold text-ds-text flex items-center gap-2">
					<span className="text-ds-primary">🤖</span> Linear Optimization Solver
				</h2>
				<p className="text-sm text-ds-text-muted">
					Mathematically optimal squad based on total season points.
				</p>
			</div>

			<form onSubmit={handleSolve} className="flex items-end gap-4 bg-ds-bg p-4 rounded-lg border border-ds-border">
				<div className="flex flex-col gap-1 w-full max-w-xs">
					<label htmlFor="budget" className="text-xs uppercase font-bold text-ds-text-muted">Budget (£m)</label>
					<input
						type="number"
						id="budget"
						step="0.1"
						min="80"
						max="200"
						value={budget}
						onChange={(e) => setBudget(e.target.value)}
						className="bg-ds-surface border border-ds-border text-ds-text p-2 rounded focus:border-ds-primary outline-none font-mono"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="bg-ds-primary text-white font-bold px-6 py-2 rounded shadow-lg hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 h-[42px]"
				>
					{loading ? 'SOLVING...' : 'OPTIMIZE'}
				</button>
			</form>

			{error && (
				<div className="bg-ds-danger/10 text-ds-danger p-4 rounded border border-ds-danger font-mono text-sm">
					Error: {error}
				</div>
			)}

			{result && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-ds-surface p-3 rounded border border-ds-border text-center">
							<div className="text-xs text-ds-text-muted uppercase">Total Points</div>
							<div className="text-2xl font-bold text-ds-primary">{result.total_points}</div>
						</div>
						<div className="bg-ds-surface p-3 rounded border border-ds-border text-center">
							<div className="text-xs text-ds-text-muted uppercase">Cost</div>
							<div className="text-2xl font-bold text-ds-text">£{result.total_cost}m</div>
						</div>
						<div className="bg-ds-surface p-3 rounded border border-ds-border text-center">
							<div className="text-xs text-ds-text-muted uppercase">Status</div>
							<div className="text-2xl font-bold text-green-500">{result.status}</div>
						</div>
						<div className="bg-ds-surface p-3 rounded border border-ds-border text-center">
							<div className="text-xs text-ds-text-muted uppercase">Constraint</div>
							<div className="text-2xl font-bold text-ds-text">15 Players</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left text-ds-text font-mono">
							<thead className="text-xs text-ds-text-muted uppercase bg-ds-card-hover/50 border-b border-ds-border">
								<tr>
									<th className="px-3 py-2">Pos</th>
									<th className="px-3 py-2">Player</th>
									<th className="px-3 py-2">Team</th>
									<th className="px-3 py-2 text-right">Cost</th>
									<th className="px-3 py-2 text-right text-ds-primary">Points</th>
								</tr>
							</thead>
							<tbody>
								{result.squad.map((p) => (
									<tr key={p.id} className="border-b border-ds-border hover:bg-ds-card-hover transition-colors">
										<td className="px-3 py-2 text-ds-text-muted">
											{['GKP', 'DEF', 'MID', 'FWD'][p.position - 1]}
										</td>
										<td className="px-3 py-2 font-bold">{p.name}</td>
										<td className="px-3 py-2 text-ds-text-muted">
											<div className="flex items-center gap-2">
												<img
													src={`https://resources.premierleague.com/premierleague/badges/70/t${p.team_code}.png`}
													alt={p.team_short}
													className="w-5 h-5 object-contain"
													onError={(e) => { e.target.style.display = 'none'; }}
												/>
												<span>{p.team_short}</span>
											</div>
										</td>
										<td className="px-3 py-2 text-right">£{p.cost}m</td>
										<td className="px-3 py-2 text-right font-bold text-ds-primary">{p.points}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default Solver;
