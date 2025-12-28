import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPlayerSummary } from '../api';
import { getPlayerImage, handlePlayerImageError } from '../utils';

const PlayerPopover = ({ player, children }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, transform: '-translate-x-1/2 -translate-y-full' });
	const [activeFixtureId, setActiveFixtureId] = useState(null);
	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const timerRef = useRef(null);

	const handleMouseEnter = async () => {
		// Clear any closing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		setIsVisible(true);
		updatePosition();

		if (!summary && !loading) {
			setLoading(true);
			try {
				const data = await getPlayerSummary(player.id);
				setSummary(data);
			} catch (error) {
				console.error("Failed to fetch player summary", error);
			} finally {
				setLoading(false);
			}
		}
	};

	const handleMouseLeave = () => {
		// Add delay to check if moving to popover
		timerRef.current = setTimeout(() => {
			setIsVisible(false);
		}, 100);
	};

	const updatePosition = () => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			const isMobile = window.innerWidth < 768; // Mobile breakpoint

			if (isMobile) {
				setPosition({
					top: rect.top - 10,
					left: window.innerWidth / 2, // Center of screen
					transform: '-translate-x-1/2 -translate-y-full'
				});
			} else {
				setPosition({
					top: rect.top - 10,
					left: rect.left + (rect.width / 2),
					transform: '-translate-x-1/2 -translate-y-full'
				});
			}
		}
	};

	const handleClick = () => {
		if (window.innerWidth < 768) {
			if (isVisible) {
				setIsVisible(false);
			} else {
				handleMouseEnter();
			}
		}
	};

	return (
		<div
			className="relative"
			ref={triggerRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			{children}
			{isVisible && createPortal(
				<div
					ref={popoverRef}
					className={`fixed z-[100] w-80 bg-ds-card border border-ds-border rounded-xl shadow-2xl p-4 text-ds-text transform ${position.transform}`}
					style={{ top: position.top, left: position.left }}
					onClick={(e) => e.stopPropagation()}
					onMouseEnter={() => {
						if (timerRef.current) {
							clearTimeout(timerRef.current);
							timerRef.current = null;
						}
					}}
					onMouseLeave={() => {
						setIsVisible(false);
					}}
				>
					<div className="flex items-center gap-3 mb-3 border-b border-ds-border pb-3">
						<div className="w-12 h-12 rounded-full overflow-hidden bg-ds-bg border border-ds-border">
							<img
								src={getPlayerImage(player.code)}
								alt={player.name}
								className="w-full h-full object-cover"
								onError={(e) => handlePlayerImageError(e, player)}
							/>
						</div>
						<div>
							<h3 className="font-bold text-lg leading-tight">{player.full_name}</h3>
							<div className="text-xs text-ds-text-muted font-mono">{player.team} • {player.position === 1 ? 'GKP' : player.position === 2 ? 'DEF' : player.position === 3 ? 'MID' : 'FWD'}</div>
						</div>
						<div className="ml-auto text-right">
							<div className="text-xl font-bold text-ds-primary">{player.total_points}</div>
							<div className="text-[10px] text-ds-text-muted uppercase">Pts</div>
						</div>
					</div>

					{loading ? (
						<div className="py-4 text-center text-ds-text-muted text-sm font-mono animate-pulse">Loading stats...</div>
					) : summary ? (
						<div className="space-y-4">
							{/* News */}
							{player.news && (
								<div className="bg-ds-warning/10 border border-ds-warning/20 rounded p-2 text-xs text-ds-warning">
									<span className="font-bold">News:</span> {player.news}
								</div>
							)}

							{/* Recent Form */}
							<div>
								<h4 className="text-xs font-bold text-ds-text-muted uppercase mb-2">Recent Form</h4>
								<div className="grid grid-cols-5 gap-1">
									{summary.history.slice(-5).reverse().map((fixture) => {
										const isHome = fixture.was_home;
										const teamScore = isHome ? fixture.team_h_score : fixture.team_a_score;
										const oppScore = isHome ? fixture.team_a_score : fixture.team_h_score;
										let resultChar = 'D';
										let resultColor = 'text-gray-400';
										if (teamScore > oppScore) { resultChar = 'W'; resultColor = 'text-green-500'; }
										else if (teamScore < oppScore) { resultChar = 'L'; resultColor = 'text-red-500'; }

										const isActive = activeFixtureId === fixture.id;

										return (
											<div
												key={fixture.id}
												onClick={(e) => {
													e.stopPropagation();
													setActiveFixtureId(isActive ? null : fixture.id);
												}}
												className="group relative flex flex-col items-center bg-ds-bg/50 rounded p-1 border border-ds-border hover:bg-ds-surface transition-colors cursor-help"
											>
												<span className="text-[10px] font-mono text-ds-text-muted">GW{fixture.round}</span>
												<span className={`text-sm font-bold ${fixture.total_points >= 6 ? 'text-ds-accent' : fixture.total_points >= 3 ? 'text-ds-text' : 'text-ds-text-muted'}`}>
													{fixture.total_points}
												</span>
												<span className="text-[9px] text-ds-text-muted/70">{fixture.opponent_short_name} ({fixture.was_home ? 'H' : 'A'})</span>

												{/* Tooltip */}
												<div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-ds-card border border-ds-border shadow-xl rounded-lg p-3 z-50 ${isActive ? 'block' : 'hidden md:group-hover:block'} pointer-events-none`}>
													<div className="text-xs font-bold text-ds-text border-b border-ds-border pb-1 mb-2 whitespace-nowrap flex justify-between">
														<span>vs {fixture.opponent_short_name} ({fixture.was_home ? 'H' : 'A'})</span>
														<span className={resultColor}>{resultChar} {teamScore}-{oppScore}</span>
													</div>
													<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ds-text-muted">
														<div className="flex justify-between"><span>Points:</span> <span className="text-ds-primary font-bold">{fixture.total_points}</span></div>
														<div className="flex justify-between"><span>Mins:</span> <span>{fixture.minutes}</span></div>
														{fixture.goals_scored > 0 && <div className="flex justify-between"><span className="text-green-400">Goals:</span> <span className="font-bold text-ds-text">{fixture.goals_scored}</span></div>}
														{fixture.assists > 0 && <div className="flex justify-between"><span className="text-blue-400">Assists:</span> <span className="font-bold text-ds-text">{fixture.assists}</span></div>}
														{fixture.bonus > 0 && <div className="flex justify-between"><span className="text-yellow-400">Bonus:</span> <span className="font-bold text-ds-text">{fixture.bonus}</span></div>}
														{fixture.saves > 0 && <div className="flex justify-between"><span className="text-orange-400">Saves:</span> <span className="font-bold text-ds-text">{fixture.saves}</span></div>}
														<div className="flex justify-between"><span>BPS:</span> <span>{fixture.bps}</span></div>
														{fixture.expected_goals && <div className="flex justify-between"><span>xG:</span> <span>{fixture.expected_goals}</span></div>}
														{fixture.expected_assists && <div className="flex justify-between"><span>xA:</span> <span>{fixture.expected_assists}</span></div>}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Next Fixtures */}
							<div>
								<h4 className="text-xs font-bold text-ds-text-muted uppercase mb-2">Next Fixtures</h4>
								<div className="space-y-1">
									{summary.fixtures.slice(0, 3).map((fixture) => (
										<div key={fixture.id} className="flex justify-between items-center text-xs bg-ds-bg/30 p-1.5 rounded border border-ds-border/50">
											<span className="font-mono text-ds-text-muted">GW{fixture.event}</span>
											<span className="font-bold">
												{fixture.is_home ? '(H)' : '(A)'} vs {fixture.is_home ? fixture.team_a_short : fixture.team_h_short}
											</span>
											<span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${fixture.difficulty <= 2 ? 'bg-ds-accent/20 text-ds-accent' :
												fixture.difficulty === 3 ? 'bg-gray-500/20 text-gray-400' :
													fixture.difficulty === 4 ? 'bg-ds-warning/20 text-ds-warning' :
														'bg-ds-danger/20 text-ds-danger'
												}`}>
												Diff {fixture.difficulty}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					) : (
						<div className="text-center text-ds-text-muted text-xs">No data available</div>
					)}

					{/* Prices */}
					<div className="mt-4 pt-3 border-t border-ds-border grid grid-cols-3 gap-2 text-center">
						<div className="flex flex-col">
							<span className="text-[9px] text-ds-text-muted uppercase font-bold">Purchase</span>
							<span className="text-xs font-mono">{player.purchase_price ? `£${player.purchase_price}m` : 'N/A'}</span>
						</div>
						<div className="flex flex-col">
							<span className="text-[9px] text-ds-text-muted uppercase font-bold">Current</span>
							<span className="text-xs font-mono font-bold text-ds-primary">£{player.cost}m</span>
						</div>
						<div className="flex flex-col">
							<span className="text-[9px] text-ds-text-muted uppercase font-bold">Sell</span>
							<span className="text-xs font-mono">{player.selling_price ? `£${player.selling_price}m` : 'N/A'}</span>
						</div>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
};

export default PlayerPopover;
