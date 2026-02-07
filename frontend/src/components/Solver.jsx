import React, { useState, useMemo } from 'react';
import PlayerPopover from './PlayerPopover';
import GameweekRangeSlider from './GameweekRangeSlider';
import useCurrentGameweek from '../hooks/useCurrentGameweek';
import { getPositionName } from './utils';
import { useSolver } from '../hooks/queries';

const Solver = () => {
	const { gameweek: currentGw, status: gwStatus, loading: gwLoading } = useCurrentGameweek();
	const [budget, setBudget] = useState(100.0);
	const [minGw, setMinGw] = useState(1);
	const [maxGw, setMaxGw] = useState(null);
	const [sliderMax, setSliderMax] = useState(38);
	const [excludeBench, setExcludeBench] = useState(false);
	const [excludeUnavailable, setExcludeUnavailable] = useState(false);
	const [useAI, setUseAI] = useState(false);

	const { mutate, data: result, isPending: loading, error, reset } = useSolver();

	const safeMax = useMemo(() => {
		if (gwLoading) return null;
		if (gwStatus) return gwStatus.started ? gwStatus.id : Math.max(1, gwStatus.id - 1);
		if (currentGw) return currentGw;
		return 38;
	}, [currentGw, gwStatus, gwLoading]);

	const [prevSafeMax, setPrevSafeMax] = useState(safeMax);
	if (safeMax !== null && safeMax !== prevSafeMax) {
		setPrevSafeMax(safeMax);
		setSliderMax(safeMax);
		setMaxGw(safeMax);
	}

	const handleSolve = (e) => {
		e.preventDefault();
		reset();
		mutate({
			budget,
			minGw,
			maxGw,
			excludeBench,
			excludeUnavailable,
			useMl: useAI,
		});
	};

	return (
		<div className="bg-ds-card rounded-xl p-4 md:p-6 border border-ds-border shadow-sm space-y-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold text-ds-text flex items-center gap-2">
					<span className="text-ds-primary">🤖</span> Linear Optimization Solver
				</h2>
				<p className="text-sm text-ds-text-muted">Mathematically optimal squad based on total season points.</p>
			</div>

			<form
				onSubmit={handleSolve}
				className="flex flex-wrap items-end gap-4 bg-ds-bg p-4 rounded-lg border border-ds-border"
			>
				<div className="flex flex-col gap-1 w-full sm:flex-1 min-w-[150px] max-w-xs">
					<label htmlFor="budget" className="text-xs uppercase font-bold text-ds-text-muted">
						Budget (£m)
					</label>
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
				<div className="flex flex-col gap-2 w-full sm:flex-1 min-w-[200px] max-w-xs">
					<label className="flex items-center gap-2 cursor-pointer mt-6">
						<input
							type="checkbox"
							checked={excludeBench}
							onChange={(e) => setExcludeBench(e.target.checked)}
							className="w-4 h-4 rounded border-ds-border bg-ds-surface text-ds-primary focus:ring-ds-primary"
						/>
						<span className="text-sm text-ds-text">Exclude Bench Points</span>
					</label>
					<span className="text-[10px] text-ds-text-muted leading-tight ml-6">
						Optimize for Starting XI only (Free Hit style). Bench will be fodder.
					</span>
				</div>
				<div className="flex flex-col gap-2 w-full sm:flex-1 min-w-[200px] max-w-xs">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={excludeUnavailable}
							onChange={(e) => setExcludeUnavailable(e.target.checked)}
							className="w-4 h-4 rounded border-ds-border bg-ds-surface text-ds-primary focus:ring-ds-primary"
						/>
						<span className="text-sm text-ds-text">Exclude Unavailable</span>
					</label>
					<span className="text-[10px] text-ds-text-muted leading-tight ml-6">
						Exclude injured (0%), suspended, or unavailable players.
					</span>
				</div>
				<div className="flex flex-col gap-2 w-full sm:flex-1 min-w-[200px] max-w-xs">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={useAI}
							onChange={(e) => setUseAI(e.target.checked)}
							className="w-4 h-4 rounded border-ds-border bg-ds-surface text-purple-500 focus:ring-purple-500"
						/>
						<span className="text-sm text-ds-text font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
							Use AI Prediction 🤖
						</span>
					</label>
					<span className="text-[10px] text-ds-text-muted leading-tight ml-6">
						Optimize using Machine Learning projected points for the next game.
					</span>
				</div>
				<div className="flex flex-col gap-3 w-full sm:flex-1 min-w-[280px] max-w-sm">
					{!maxGw ? (
						<span className="text-[10px] text-ds-primary animate-pulse">Loading Gameweeks...</span>
					) : (
						<GameweekRangeSlider
							start={minGw}
							end={maxGw}
							min={1}
							max={sliderMax}
							onChange={({ start, end }) => {
								setMinGw(start);
								setMaxGw(end);
							}}
						/>
					)}
				</div>
				<button
					type="submit"
					disabled={loading}
					className="bg-ds-primary text-white font-bold px-6 py-2 rounded shadow-lg hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 h-[42px] w-full sm:w-auto"
				>
					{loading ? 'SOLVING...' : 'OPTIMIZE'}
				</button>
			</form>

			{error && (
				<div className="bg-ds-danger/10 text-ds-danger p-4 rounded border border-ds-danger font-mono text-sm">
					Error: {error.message}
				</div>
			)}

			{result && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="bg-ds-surface p-3 rounded border border-ds-border text-center">
							<div className="text-xs text-ds-text-muted uppercase">
								Total Points {result.gameweek_range ? `(GW ${result.gameweek_range})` : ''}
							</div>
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
									<tr
										key={p.id}
										className={`border-b border-ds-border hover:bg-ds-card-hover transition-colors ${p.is_starter === false ? 'opacity-60 bg-ds-surface/50' : ''}`}
									>
										<td className="px-3 py-2 text-ds-text-muted">{getPositionName(p.position)}</td>
										<td className="px-3 py-2 font-bold hover:text-ds-primary cursor-pointer transition-colors">
											<PlayerPopover
												player={{
													id: p.id,
													code: p.code,
													name: p.name,
													full_name: p.full_name,
													team: p.team_short,
													position: p.position,
													total_points: p.points,
													cost: p.cost,
													purchase_price: p.cost,
													selling_price: p.cost,
													news: p.news,
												}}
											>
												{p.name}
											</PlayerPopover>
										</td>
										<td className="px-3 py-2 text-ds-text-muted">
											<div className="flex items-center gap-2">
												<img
													src={`https://resources.premierleague.com/premierleague/badges/70/t${p.team_code}.png`}
													alt={p.team_short}
													loading="lazy"
													className="w-5 h-5 object-contain"
													onError={(e) => {
														e.target.style.display = 'none';
													}}
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
