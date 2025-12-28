import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getClubSummary } from '../api';
import { getPlayerImage, handlePlayerImageError } from '../utils';

const TeamPopover = ({ team, children }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, transform: '-translate-x-1/2 -translate-y-full' });
	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const timerRef = useRef(null);

	const handleMouseEnter = () => {
		// Clear any closing timer
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		setIsVisible(true);
		updatePosition();

		if (!summary && !loading) {
			setLoading(true);
			fetchData();
		}
	};

	const fetchData = async () => {
		try {
			const data = await getClubSummary(team.id);
			setSummary(data);
		} catch (error) {
			console.error("Failed to fetch team summary", error);
		} finally {
			setLoading(false);
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
			const isMobile = window.innerWidth < 768;

			if (isMobile) {
				setPosition({
					top: rect.top - 10,
					left: window.innerWidth / 2,
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
			className="relative inline-block"
			ref={triggerRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			{children}
			{isVisible && createPortal(
				<div
					ref={popoverRef}
					className={`fixed z-[100] w-80 bg-ds-card border border-ds-border rounded-xl shadow-2xl p-4 text-ds-text ${position.transform}`}
					style={{ top: position.top, left: position.left }}
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
					{/* Header */}
					<div className="flex items-center gap-3 mb-4 border-b border-ds-border pb-3">
						<div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-full border border-ds-border">
							<img
								src={`https://resources.premierleague.com/premierleague/badges/50/t${team.code}.png`}
								alt={team.name}
								className="w-full h-full object-contain"
							/>
						</div>
						<div>
							<h3 className="font-bold text-lg leading-tight">{team.name}</h3>
							<div className="text-xs text-ds-text-muted font-mono">{team.short_name}</div>
						</div>
						<div className="ml-auto text-right">
							<div className={`text-xl font-bold ${team.position <= 4 ? 'text-ds-primary' : team.position >= 18 ? 'text-ds-danger' : 'text-ds-text'}`}>#{team.position}</div>
							<div className="text-[10px] text-ds-text-muted uppercase">Pos</div>
						</div>
					</div>

					{loading ? (
						<div className="py-4 text-center text-ds-text-muted text-sm font-mono animate-pulse">Loading stats...</div>
					) : summary ? (
						<div className="space-y-4">
							{/* Form - Reuse from prop if not in summary, but summary might not have form so stick to prop */}
							{/* Recent Results */}
							<div>
								<h4 className="text-xs font-bold text-ds-text-muted uppercase mb-2">Recent Results</h4>
								<div className="flex gap-1">
									{summary.recent_results && summary.recent_results.length > 0 ? (
										summary.recent_results.slice(0, 5).map((fixture) => (
											<div key={fixture.id} className="flex flex-col items-center flex-1 bg-ds-bg/50 rounded p-1 border border-ds-border min-w-[32px]">
												<span className={`text-[10px] font-bold ${fixture.result === 'W' ? 'text-ds-accent' : fixture.result === 'L' ? 'text-ds-danger' : 'text-ds-text-muted'}`}>
													{fixture.result}
												</span>
												<span className="text-[9px] font-mono text-ds-text leading-tight">{fixture.score}</span>
												<span className="text-[8px] text-ds-text-muted/70 truncate w-full text-center mt-0.5" title={`${fixture.opponent_name} (${fixture.is_home ? 'H' : 'A'})`}>
													{fixture.opponent_short} <span className="text-[8px] text-ds-text-muted/50 font-mono">({fixture.is_home ? 'H' : 'A'})</span>
												</span>
											</div>
										))
									) : (
										<div className="text-center text-ds-text-muted text-xs w-full">No recent results</div>
									)}
								</div>
							</div>

							{/* Next Fixtures */}
							<div>
								<h4 className="text-xs font-bold text-ds-text-muted uppercase mb-2">Upcoming Fixtures</h4>
								<div className="flex gap-1">
									{summary.upcoming_fixtures && summary.upcoming_fixtures.length > 0 ? (
										summary.upcoming_fixtures.map((fixture) => (
											<div
												key={fixture.id}
												className={`flex flex-col items-center justify-center flex-1 rounded p-1 border border-ds-border min-w-[32px] ${fixture.difficulty <= 2 ? 'bg-ds-accent text-white' :
													fixture.difficulty === 3 ? 'bg-gray-400 text-white' :
														fixture.difficulty === 4 ? 'bg-ds-warning text-white' :
															'bg-ds-danger text-white'
													}`}
											>
												<span className="text-[10px] font-bold truncate w-full text-center leading-tight" title={`${fixture.opponent_name} (${fixture.is_home ? 'H' : 'A'})`}>
													{fixture.opponent_short}
												</span>
												<div className="flex items-center gap-1 mt-0.5">
													<span className="text-[8px] opacity-90 font-mono">{fixture.is_home ? 'H' : 'A'}</span>
													<span className="text-[9px] font-extrabold opacity-100">{fixture.difficulty}</span>
												</div>
											</div>
										))
									) : (
										<div className="text-center text-ds-text-muted text-xs w-full">No upcoming fixtures</div>
									)}
								</div>
							</div>

							{/* Key Players */}
							<div>
								<h4 className="text-xs font-bold text-ds-text-muted uppercase mb-2">Key Players</h4>
								<div className="grid grid-cols-1 gap-1">
									{summary.top_players && summary.top_players.slice(0, 3).map((player) => (
										<div key={player.id} className="flex items-center gap-2 p-1 rounded hover:bg-ds-card-hover transition-colors">
											<div className="w-8 h-8 rounded-full overflow-hidden bg-ds-bg border border-ds-border">
												<img
													src={`https://resources.premierleague.com/premierleague25/photos/players/110x140/${player.photo.replace('.png', '').replace('.jpg', '')}.png`}
													alt={player.web_name}
													className="w-full h-full object-cover"
													onError={(e) => { e.target.src = 'https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png' }}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-xs font-bold truncate">{player.web_name}</div>
												<div className="text-[10px] text-ds-text-muted">{player.element_type === 1 ? 'GKP' : player.element_type === 2 ? 'DEF' : player.element_type === 3 ? 'MID' : 'FWD'} • £{player.cost}m</div>
											</div>
											<div className="text-xs font-bold text-ds-primary">{player.total_points} pts</div>
										</div>
									))}
								</div>
							</div>
						</div>
					) : (
						<div className="text-center text-ds-text-muted text-xs">No data available</div>
					)}
				</div>,
				document.body
			)
			}
		</div >
	);
};

export default TeamPopover;
