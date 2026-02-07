import React from 'react';
import { X, Calendar } from 'lucide-react';

const HistoryModal = ({ isOpen, onClose, history, teamH, teamA }) => {
	const [filterType, setFilterType] = React.useState('all'); // 'all' or 'venue'

	const filteredHistory = React.useMemo(() => {
		if (!history) return [];
		if (filterType === 'all') return history;

		// "Same Venue" means:
		// match.match_is_home should be true (since we are viewing from teamH perspective)
		return history.filter((match) => match.match_is_home === true);
	}, [history, filterType]);

	// Calculate Stats based on filtered history for dynamic context
	const stats = React.useMemo(() => {
		if (!filteredHistory || filteredHistory.length === 0) return null;

		let teamHWins = 0;
		let draws = 0;
		let teamAWins = 0;

		filteredHistory.forEach((match) => {
			const homeWon = match.score_home > match.score_away;
			const awayWon = match.score_away > match.score_home;

			// If Team H (from props) was Home
			if (match.match_is_home) {
				if (homeWon) teamHWins++;
				else if (awayWon) teamAWins++;
				else draws++;
			} else {
				// Team H was Away
				if (awayWon) teamHWins++;
				else if (homeWon) teamAWins++;
				else draws++;
			}
		});

		const total = filteredHistory.length;
		if (total === 0) return null;

		return {
			teamH: Math.round((teamHWins / total) * 100),
			draw: Math.round((draws / total) * 100),
			teamA: Math.round((teamAWins / total) * 100),
			total,
		};
	}, [filteredHistory]);

	React.useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="bg-ds-card w-full max-w-2xl rounded-xl border border-ds-border shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex flex-col gap-4 p-6 border-b border-ds-border bg-ds-surface/50 rounded-t-xl">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="text-xl font-bold text-ds-text flex items-center gap-2">
								<span>⚔️</span> Head-to-Head History
							</h3>
							<div className="text-sm text-ds-text-muted mt-1">
								{teamH?.name} vs {teamA?.name}
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 hover:bg-ds-surface rounded-full text-ds-text-muted hover:text-ds-text transition-colors"
						>
							<X size={20} />
						</button>
					</div>

					{/* Filter Toggles */}
					<div className="flex p-1 bg-ds-surface rounded-lg border border-ds-border w-fit">
						<button
							onClick={() => setFilterType('all')}
							className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'all' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							All Matches
						</button>
						<button
							onClick={() => setFilterType('venue')}
							className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === 'venue' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							Same Venue
						</button>
					</div>

					{/* Stats Bar */}
					{stats && (
						<div className="w-full bg-ds-surface/50 border border-ds-border rounded-lg p-3 flex flex-col gap-2">
							<div className="flex justify-between text-xs font-bold text-ds-text-muted uppercase tracking-wider">
								<span className="text-green-500">
									{teamH?.name} {stats.teamH}%
								</span>
								<span className="text-gray-400">Draw {stats.draw}%</span>
								<span className="text-red-500">
									{teamA?.name} {stats.teamA}%
								</span>
							</div>
							<div className="h-2.5 w-full bg-ds-bg rounded-full overflow-hidden flex">
								<div className="h-full bg-green-500 transition-all" style={{ width: `${stats.teamH}%` }} />
								<div className="h-full bg-gray-500/50 transition-all" style={{ width: `${stats.draw}%` }} />
								<div className="h-full bg-red-500 transition-all" style={{ width: `${stats.teamA}%` }} />
							</div>
							<div className="text-[10px] text-center text-ds-text-muted italic">
								Based on last {stats.total} meetings
							</div>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-ds-border scrollbar-track-transparent">
					{filteredHistory.length > 0 ? (
						<div className="space-y-3">
							{filteredHistory.map((match, idx) => {
								// Determine result for teamH (context)
								let colorClass = 'bg-ds-surface text-ds-text border-ds-border';

								if (match.score_home === match.score_away) {
									colorClass = 'bg-gray-500/10 text-ds-text-muted border-gray-500/20';
								} else {
									const homeWon = match.score_home > match.score_away;
									const isWin = (match.match_is_home && homeWon) || (!match.match_is_home && !homeWon);

									if (isWin) {
										colorClass = 'bg-green-500/10 text-green-500 border-green-500/20';
									} else {
										colorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
									}
								}

								return (
									<div
										key={idx}
										className="bg-ds-bg border border-ds-border p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-ds-primary/30 transition-colors"
									>
										{/* Date & Competition */}
										<div className="flex flex-col items-center sm:items-start min-w-[100px]">
											<span className="text-xs font-bold text-ds-text-muted uppercase tracking-wider bg-ds-surface px-2 py-0.5 rounded-full mb-1">
												{match.season} • GW{match.gameweek}
											</span>
											<div className="flex items-center gap-1.5 text-xs text-ds-text-muted">
												<Calendar size={12} />
												<span>{new Date(match.date).toLocaleDateString()}</span>
											</div>
										</div>

										{/* Scoreline */}
										<div className="flex-1 flex items-center justify-center gap-4 w-full">
											<div
												className={`text-sm font-bold ${match.score_home > match.score_away ? 'text-ds-text' : 'text-ds-text-muted'} text-right flex-1 flex flex-col items-end`}
											>
												<span>{match.home_team}</span>
												{match.scorers_home && match.scorers_home.length > 0 && (
													<div className="flex flex-col items-end mt-1 space-y-0.5">
														{match.scorers_home.map((scorer, i) => (
															<span
																key={i}
																className="text-[10px] bg-ds-surface px-1.5 py-0.5 rounded text-ds-text-muted font-normal whitespace-nowrap"
															>
																⚽ {scorer}
															</span>
														))}
													</div>
												)}
												{match.assists_home && match.assists_home.length > 0 && (
													<div className="flex flex-col items-end mt-1 space-y-0.5">
														{match.assists_home.map((assist, i) => (
															<span
																key={i}
																className="text-[10px] bg-ds-surface px-1.5 py-0.5 rounded text-ds-text-muted font-normal whitespace-nowrap"
															>
																👟 {assist}
															</span>
														))}
													</div>
												)}
											</div>

											<div
												className={`border px-3 py-1.5 rounded-md font-mono font-bold text-lg min-w-[60px] text-center shadow-sm transition-colors ${colorClass}`}
											>
												{match.score_home} - {match.score_away}
											</div>

											<div
												className={`text-sm font-bold ${match.score_away > match.score_home ? 'text-ds-text' : 'text-ds-text-muted'} text-left flex-1 flex flex-col items-start`}
											>
												<span>{match.away_team}</span>
												{match.scorers_away && match.scorers_away.length > 0 && (
													<div className="flex flex-col items-start mt-1 space-y-0.5">
														{match.scorers_away.map((scorer, i) => (
															<span
																key={i}
																className="text-[10px] bg-ds-surface px-1.5 py-0.5 rounded text-ds-text-muted font-normal whitespace-nowrap"
															>
																⚽ {scorer}
															</span>
														))}
													</div>
												)}
												{match.assists_away && match.assists_away.length > 0 && (
													<div className="flex flex-col items-start mt-1 space-y-0.5">
														{match.assists_away.map((assist, i) => (
															<span
																key={i}
																className="text-[10px] bg-ds-surface px-1.5 py-0.5 rounded text-ds-text-muted font-normal whitespace-nowrap"
															>
																👟 {assist}
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 text-ds-text-muted">
							<p>No matches found matching the filter.</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-ds-border bg-ds-surface/50 rounded-b-xl flex justify-end">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-bold bg-ds-surface hover:bg-ds-surface-hover border border-ds-border rounded-md transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default HistoryModal;
