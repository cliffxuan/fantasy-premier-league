import React, { useState, useEffect } from 'react';
import { RefreshCw, Flame, TrendingDown, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { getPositionName } from './utils';

const FormAnalysis = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchAnalysis = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/analysis/form');
			if (!response.ok) {
				throw new Error('Failed to fetch form analysis');
			}
			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAnalysis();
	}, []);

	const getSustainabilityColor = (score) => {
		if (score >= 70) return 'bg-green-500';
		if (score >= 40) return 'bg-yellow-500';
		return 'bg-red-500';
	};

	const getSustainabilityTextColor = (score) => {
		if (score >= 70) return 'text-green-500';
		if (score >= 40) return 'text-yellow-500';
		return 'text-red-500';
	};

	const getClassificationIcon = (classification) => {
		if (classification.includes('Sustainable')) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
		if (classification.includes('Regression')) return <TrendingDown className="w-4 h-4 text-red-500" />;
		return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
	};

	const getClassificationStyles = (classification) => {
		if (classification.includes('Sustainable')) return 'bg-green-500/10 text-green-500 border-green-500/20';
		if (classification.includes('Regression')) return 'bg-red-500/10 text-red-500 border-red-500/20';
		return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
	};

	return (
		<div className="max-w-[1200px] mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-ds-text flex items-center gap-2">
						Form Analysis <span className="text-ds-primary">Lab</span>
					</h1>
				</div>
				<button
					onClick={fetchAnalysis}
					disabled={loading}
					className="p-2 rounded-full hover:bg-ds-surface text-ds-primary/80 hover:text-ds-primary transition-all disabled:opacity-50"
				>
					<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
				</button>
			</div>

			<div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
				<Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
				<p className="text-sm text-blue-100/90 leading-relaxed">
					Analysis based on <span className="font-semibold text-blue-300">"The Dynamics of Transience"</span> model.
					Identifies if player form is sustainable (supported by xG) or lucky variance. Streaks typically last 8-12
					games before regression.
				</p>
			</div>

			{loading && data.length === 0 && (
				<div className="text-center py-20">
					<div className="w-8 h-8 border-4 border-ds-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-ds-text-muted animate-pulse">Analyzing Player Data...</p>
				</div>
			)}

			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center">
					{error}
				</div>
			)}

			{!loading && !error && data.length === 0 && (
				<div className="bg-ds-card border border-ds-border p-8 rounded-xl text-center text-ds-text-muted">
					No significant form streaks detected.
				</div>
			)}

			{!loading && !error && data.length > 0 && (
				<>
					{/* Mobile Card View */}
					<div className="md:hidden flex flex-col gap-3">
						{data.map((player) => (
							<div
								key={player.id}
								className="bg-ds-card border border-ds-border rounded-xl p-4 shadow-sm relative overflow-hidden group"
							>
								{/* Header */}
								<div className="flex justify-between items-start mb-4">
									<div className="flex gap-3">
										<div className="flex flex-col">
											<span className="font-bold text-ds-text text-base">{player.web_name}</span>
											<span className="text-[10px] uppercase text-ds-text-muted font-mono mt-0.5">
												{getPositionName(player.position)}
												<span className="opacity-50 mx-1.5">•</span>
												GW{player.last_match_gw}
											</span>
										</div>
									</div>
									<div
										className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${player.streak_games > 5 ? 'bg-ds-primary/10 text-ds-primary border border-ds-primary/20' : 'bg-ds-surface text-ds-text-muted border border-ds-border'}`}
									>
										<Flame className={`w-3.5 h-3.5 ${player.streak_games > 5 ? 'fill-ds-primary' : ''}`} />
										{player.streak_games}
									</div>
								</div>

								{/* Metrics Grid */}
								<div className="grid grid-cols-2 gap-3 mb-4">
									<div className="bg-ds-surface/50 p-2.5 rounded-lg border border-ds-border/50">
										<div className="text-[10px] uppercase text-ds-text-muted mb-1 font-semibold">Perform / Exp</div>
										<div className="font-mono text-sm flex items-baseline gap-1">
											<span className="text-ds-text font-bold">{player.goals}</span>
											<span className="text-ds-text-muted text-xs">goals</span>
											<span className="text-ds-text-muted opacity-40">/</span>
											<span className="text-ds-text font-bold">{player.expected_goals}</span>
											<span className="text-ds-text-muted text-xs">xG</span>
										</div>
									</div>
									<div className="bg-ds-surface/50 p-2.5 rounded-lg border border-ds-border/50">
										<div className="text-[10px] uppercase text-ds-text-muted mb-1 font-semibold">xG Delta</div>
										<div
											className={`font-mono font-bold text-sm ${player.xg_delta > 0 ? 'text-green-400' : 'text-red-400'}`}
										>
											{player.xg_delta > 0 ? '+' : ''}
											{player.xg_delta}
										</div>
									</div>
								</div>

								{/* Sustainability Section */}
								<div className="mb-4">
									<div className="flex justify-between text-[10px] uppercase mb-2 tracking-wider">
										<span className="text-ds-text-muted font-semibold">Sustainability Score</span>
										<span className={`font-mono font-bold ${getSustainabilityTextColor(player.sustainability_score)}`}>
											{player.sustainability_score}%
										</span>
									</div>
									<div className="h-2 bg-ds-surface rounded-full overflow-hidden w-full">
										<div
											className={`h-full rounded-full ${getSustainabilityColor(player.sustainability_score)}`}
											style={{ width: `${player.sustainability_score}%` }}
										/>
									</div>
								</div>

								{/* Footer: Verdict & Prediction */}
								<div className="flex items-center justify-between pt-3 border-t border-ds-border/50">
									<div
										className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getClassificationStyles(player.classification)}`}
									>
										{getClassificationIcon(player.classification)}
										{player.classification}
									</div>
									<div className="text-[10px] font-mono text-ds-text-muted">
										Ends: <span className="text-ds-text">GW{player.predicted_end_gw}</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Desktop Table View */}
					<div className="hidden md:block bg-ds-card border border-ds-border rounded-xl overflow-hidden shadow-sm">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-ds-surface/50 text-xs uppercase tracking-wider text-ds-text-muted font-mono border-b border-ds-border">
										<th className="px-3 py-3 font-semibold">Player</th>
										<th className="px-3 py-3 font-semibold text-center">Streak</th>
										<th className="px-3 py-3 font-semibold text-center">Goals / xG</th>
										<th className="px-3 py-3 font-semibold text-center">Delta</th>
										<th className="px-3 py-3 font-semibold">Sustainability</th>
										<th className="px-3 py-3 font-semibold">Verdict</th>
										<th className="px-3 py-3 font-semibold text-right">Predicted End</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-ds-border/50">
									{data.map((player) => (
										<tr key={player.id} className="hover:bg-ds-surface/30 transition-colors group">
											<td className="px-3 py-2">
												<div className="flex flex-col">
													<span className="font-bold text-ds-text">{player.web_name}</span>
													<span className="text-[10px] uppercase text-ds-text-muted font-mono">
														{getPositionName(player.position)}
														{' • '}
														GW{player.last_match_gw}
													</span>
												</div>
											</td>
											<td className="px-3 py-2 text-center">
												<div
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${player.streak_games > 5 ? 'bg-ds-primary/10 text-ds-primary border border-ds-primary/20' : 'bg-ds-surface text-ds-text-muted border border-ds-border'}`}
												>
													<Flame className={`w-3.5 h-3.5 ${player.streak_games > 5 ? 'fill-ds-primary' : ''}`} />
													{player.streak_games}
												</div>
											</td>
											<td className="px-3 py-2 text-center font-mono text-sm text-ds-text-muted">
												<span className="text-ds-text font-bold">{player.goals}</span>
												<span className="opacity-50 mx-1">/</span>
												<span>{player.expected_goals}</span>
											</td>
											<td className="px-3 py-2 text-center">
												<span
													className={`font-mono font-bold text-sm ${player.xg_delta > 0 ? 'text-green-400' : 'text-red-400'}`}
												>
													{player.xg_delta > 0 ? '+' : ''}
													{player.xg_delta}
												</span>
											</td>
											<td className="px-3 py-2">
												<div className="flex items-center gap-3">
													<div className="flex-1 h-2 bg-ds-surface rounded-full overflow-hidden w-24">
														<div
															className={`h-full rounded-full ${getSustainabilityColor(player.sustainability_score)}`}
															style={{ width: `${player.sustainability_score}%` }}
														/>
													</div>
													<span
														className={`text-xs font-bold font-mono w-8 ${getSustainabilityTextColor(player.sustainability_score)}`}
													>
														{player.sustainability_score}%
													</span>
												</div>
											</td>
											<td className="px-3 py-2">
												<div className="group relative inline-block">
													<div
														className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getClassificationStyles(player.classification)}`}
													>
														{getClassificationIcon(player.classification)}
														{player.classification}
													</div>
													{/* Tooltip */}
													<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ds-card border border-ds-border rounded shadow-xl text-xs text-ds-text-muted opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
														{player.reasons.join(', ')}
														<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ds-card border-b border-r border-ds-border rotate-45"></div>
													</div>
												</div>
											</td>
											<td className="px-3 py-2 text-right">
												<span className="font-mono text-sm text-ds-text-muted">{player.predicted_end_gw}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default FormAnalysis;
