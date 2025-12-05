import React, { useState, useEffect, useRef } from 'react';
import { getPlayerSummary } from '../api';
import { getPlayerImage, handlePlayerImageError } from '../utils';

const PlayerPopover = ({ player, children }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, transform: '-translate-x-1/2 -translate-y-full' });
	const triggerRef = useRef(null);
	const popoverRef = useRef(null);

	const handleMouseEnter = async () => {
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
		setIsVisible(false);
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
			{isVisible && (
				<div
					ref={popoverRef}
					className={`fixed z-50 w-80 bg-ds-card border border-ds-border rounded-xl shadow-2xl p-4 text-ds-text transform pointer-events-none ${position.transform}`}
					style={{ top: position.top, left: position.left }}
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
									{summary.history.slice(-5).reverse().map((fixture) => (
										<div key={fixture.id} className="flex flex-col items-center bg-ds-bg/50 rounded p-1 border border-ds-border">
											<span className="text-[10px] font-mono text-ds-text-muted">GW{fixture.round}</span>
											<span className={`text-sm font-bold ${fixture.total_points >= 6 ? 'text-ds-accent' : fixture.total_points >= 3 ? 'text-ds-text' : 'text-ds-text-muted'}`}>
												{fixture.total_points}
											</span>
											<span className="text-[9px] text-ds-text-muted/70">{fixture.opponent_short_name} ({fixture.was_home ? 'H' : 'A'})</span>
										</div>
									))}
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
				</div>
			)}
		</div>
	);
};

export default PlayerPopover;
