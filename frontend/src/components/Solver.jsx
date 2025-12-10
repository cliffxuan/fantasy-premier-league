import React, { useState, useEffect } from 'react';
import PlayerPopover from './PlayerPopover';

const Solver = () => {
	const [budget, setBudget] = useState(100.0);
	const [minGw, setMinGw] = useState(1);
	const [maxGw, setMaxGw] = useState(null);
	const [sliderMax, setSliderMax] = useState(38);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCurrentGw = async () => {
			try {
				const response = await fetch('/api/gameweek/current');
				if (response.ok) {
					const data = await response.json();
					console.log('Current GW Data:', data);
					const status = data.status;

					let safeMax = 38;
					if (status) {
						// If GW has started (deadline passed), use it. otherwise use previous.
						safeMax = status.started ? status.id : Math.max(1, status.id - 1);
					} else if (data.gameweek) {
						// Fallback if status object is missing (stale backend)
						safeMax = data.gameweek;
					}

					setSliderMax(safeMax);
					setMaxGw(safeMax);
				} else {
					console.error('API Error:', response.status);
					setSliderMax(38);
					setMaxGw(38); // Fallback on error
				}
			} catch (err) {
				console.error('Failed to fetch current gameweek:', err);
				setSliderMax(38);
				setMaxGw(38); // Fallback on exception
			}
		};
		fetchCurrentGw();
	}, []);

	const handleSolve = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch(`/api/optimization/solve?budget=${budget}&min_gw=${minGw}&max_gw=${maxGw}`);
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
				<div className="flex flex-col gap-3 w-full max-w-sm">
					<div className="flex justify-between items-end">
						<label className="text-xs uppercase font-bold text-ds-text-muted">Gameweek Range</label>
						{!maxGw ? (
							<span className="text-[10px] text-ds-primary animate-pulse">Loading...</span>
						) : (
							<span className="text-sm font-mono font-bold text-ds-primary">
								GW {minGw} - GW {maxGw}
							</span>
						)}
					</div>

					<div className="relative h-6 w-full flex items-center">
						<div className="absolute w-full h-1.5 bg-ds-card-hover rounded-full"></div>
						{maxGw && (
							<>
								<div
									className="absolute h-1.5 bg-ds-primary rounded-full z-10"
									style={{
										left: `${((minGw - 1) / Math.max(1, sliderMax - 1)) * 100}%`,
										right: `${100 - ((maxGw - 1) / Math.max(1, sliderMax - 1)) * 100}%`
									}}
								></div>
								<input
									type="range"
									min="1"
									max={sliderMax}
									value={minGw}
									onChange={(e) => {
										const val = Math.min(parseInt(e.target.value), maxGw);
										setMinGw(Math.max(1, val));
									}}
									className="absolute w-full h-full opacity-0 cursor-pointer z-30 pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
									style={{
										// This is tricky with single slider logic, standard double slider needs pointer events manipulation
										// Let's use the standard overlapping method
										pointerEvents: 'none',
										appearance: 'none',
										background: 'transparent',
										zIndex: minGw > (sliderMax * 0.8) ? 50 : 30 // Bring to front if overlapping near end
									}}
								/>
								<input
									type="range"
									min="1"
									max={sliderMax}
									value={maxGw}
									onChange={(e) => {
										const val = Math.max(parseInt(e.target.value), minGw);
										setMaxGw(val);
									}}
									className="absolute w-full h-full opacity-0 cursor-pointer z-40 pointer-events-auto"
									style={{
										pointerEvents: 'none',
										appearance: 'none',
										background: 'transparent',
									}}
								/>

								{/* Custom Thumbs (Visual Only - mapped to positions) */}
								{/* Basic CSS thumb styling via style block in component for cleaner robust rendering provided we can't easily use arbitrary group variants for slider thumbs across browsers */}
								<style>{`
									input[type=range]::-webkit-slider-thumb {
										pointer-events: auto;
										appearance: none;
										width: 16px;
										height: 16px;
										border-radius: 50%;
										background: white;
										border: 2px solid #3b82f6;
										cursor: pointer;
										margin-top: -6px; /* center vertically if track is custom */
										box-shadow: 0 1px 3px rgba(0,0,0,0.3);
									}
									input[type=range]::-moz-range-thumb {
										pointer-events: auto;
										width: 16px;
										height: 16px;
										border-radius: 50%;
										background: white;
										border: 2px solid #3b82f6;
										cursor: pointer;
										box-shadow: 0 1px 3px rgba(0,0,0,0.3);
										transform: translateY(2px);
									}
								`}</style>

								{/* Re-render inputs with correct classes for the style tag to target? 
								    Actually the style tag targets all input[type=range] inside the component scope if scoped, but here it's global.
									To avoid affecting other sliders, let's use a specific class name.
								*/}
							</>
						)}
						{/* Active Inputs */}
						{maxGw && (
							<>
								<input
									type="range"
									min="1"
									max={sliderMax}
									value={minGw}
									onChange={(e) => {
										const val = Math.min(Number(e.target.value), maxGw);
										setMinGw(val);
									}}
									className="absolute w-full h-2 bg-transparent appearance-none top-1/2 -translate-y-1/2 pointer-events-none z-20 slider-thumb-custom"
								/>
								<input
									type="range"
									min="1"
									max={sliderMax}
									value={maxGw}
									onChange={(e) => {
										const val = Math.max(Number(e.target.value), minGw);
										setMaxGw(val);
									}}
									className="absolute w-full h-2 bg-transparent appearance-none top-1/2 -translate-y-1/2 pointer-events-none z-30 slider-thumb-custom"
								/>
							</>
						)}
					</div>
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
							<div className="text-xs text-ds-text-muted uppercase">Total Points {result.gameweek_range ? `(GW ${result.gameweek_range})` : ''}</div>
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
										<td className="px-3 py-2 font-bold hover:text-ds-primary cursor-pointer transition-colors">
											<PlayerPopover player={{
												id: p.id,
												code: p.code,
												name: p.name,
												full_name: p.full_name,
												team: p.team_short,
												position: p.position,
												total_points: p.points,
												cost: p.cost,
												purchase_price: p.cost,
												selling_price: p.cost
											}}>
												{p.name}
											</PlayerPopover>
										</td>
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
