import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDreamTeam } from '../api';
import PlayerPopover from './PlayerPopover';
import PitchView from './PitchView';
import { getPlayerImage, handlePlayerImageError } from '../utils';
import useCurrentGameweek from '../hooks/useCurrentGameweek';
import { getStatusBadgeClass } from './utils';

const DreamTeam = ({ currentGw, gw, onGwChange, onTabSwitch, isActive }) => {
	const { gameweek: fetchedGw, status: fetchedStatus } = useCurrentGameweek();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);

	// Only update GW if it's missing AND this tab is active
	useEffect(() => {
		if (fetchedGw && !gw && onGwChange && isActive) {
			onGwChange(fetchedGw);
		}
	}, [fetchedGw, gw, onGwChange, isActive]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getDreamTeam(gw);
				setData(result);
			} catch (error) {
				console.error('Failed to fetch dream team', error);
			} finally {
				setLoading(false);
			}
		};
		if (gw) fetchData();
	}, [gw]);

	const handlePrev = () => {
		if (gw > 1 && onGwChange) onGwChange(gw - 1);
	};

	const handleNext = () => {
		const maxGw = currentGw || fetchedStatus?.id || 38;
		if (gw < maxGw && onGwChange) onGwChange(gw + 1);
	};

	if (!data && loading) return <div className="text-center p-8 text-ds-text-muted">Loading Dream Team...</div>;
	if (!data) {
		const currentStatus = fetchedStatus || {};

		// Determine the latest "Safe" Gameweek (one that should have data)
		// Start with either the fetched current ID or the prop passed down
		let safeGw = currentStatus.id || currentGw || 1;

		// If we know for sure that the current one isn't finalized, go back one
		if (currentStatus.id && !currentStatus.data_checked) {
			safeGw = Math.max(1, currentStatus.id - 1);
		}

		// Calculate redirection target:
		// 1. If we are in the future (gw > safeGw), jump straight to safeGw.
		// 2. If we are AT safeGw or earlier (but still no data/error), just go back one step.
		const targetGw = gw > safeGw ? safeGw : Math.max(1, gw - 1);

		return (
			<div className="flex flex-col items-center justify-center p-12 gap-6 border border-ds-border rounded-xl bg-ds-card animate-in fade-in zoom-in-95 duration-300">
				<div className="text-center space-y-2">
					<h3 className="text-xl font-bold text-ds-text">Gameweek {gw} Unavailable</h3>
					<p className="text-ds-text-muted max-w-xs mx-auto">
						The Dream Team for this gameweek hasn't been finalized yet.
					</p>
				</div>
				<button
					onClick={() => onGwChange && onGwChange(targetGw)}
					className="flex items-center gap-2 bg-ds-primary text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-ds-primary-hover hover:scale-105 active:scale-95 transition-all"
				>
					<ChevronLeft size={18} />
					View Gameweek {targetGw}
				</button>
			</div>
		);
	}

	const { squad, top_player, total_points } = data;

	const PlayerCard = ({ player }) => (
		<PlayerPopover player={player}>
			<div className="relative flex flex-col items-center justify-center w-[70px] md:w-[90px]">
				<div className="relative mb-1 transition-transform hover:scale-110 cursor-pointer">
					{/* Player Photo */}
					<img
						src={getPlayerImage(player.code)}
						alt={player.name}
						loading="lazy"
						className="w-[45px] h-[60px] md:w-[60px] md:h-[75px] object-cover drop-shadow-lg"
						onError={(e) => handlePlayerImageError(e, player)}
					/>

					{/* Points Badge (Top Left) */}
					<div className="absolute -top-1 -left-2 bg-ds-primary text-white text-[10px] md:text-[12px] font-bold w-5 h-5 md:w-7 md:h-6 flex items-center justify-center rounded-full border border-white shadow-sm">
						{player.event_points}
					</div>

					{/* Status Indicator */}
					{player.status !== 'a' && (
						<div
							className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-white
                            ${getStatusBadgeClass(player.status)}`}
						>
							!
						</div>
					)}
				</div>

				<div className="bg-ds-card/90 text-ds-text text-center rounded w-full py-1 px-0.5 border border-ds-border backdrop-blur-sm shadow-sm mt-1">
					<div className="text-xs font-bold truncate px-1 font-sans">{player.name}</div>
					<div className="flex justify-center items-center gap-1 mt-0.5">
						<span className="text-[9px] text-ds-text-muted font-bold px-1">{player.fixture}</span>
					</div>
				</div>
			</div>
		</PlayerPopover>
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-ds-card p-4 rounded-xl border border-ds-border">
				<div className="flex items-center gap-4">
					<button
						onClick={handlePrev}
						disabled={gw <= 1}
						className="p-2 rounded-full hover:bg-ds-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronLeft size={24} />
					</button>
					<div className="flex flex-col items-center min-w-[200px]">
						<h2 className="text-2xl font-bold text-center">Gameweek {gw}</h2>
						{onTabSwitch && (
							<button
								onClick={onTabSwitch}
								className="text-xs text-ds-primary hover:text-ds-primary-hover hover:underline mt-1 font-mono uppercase tracking-wide"
							>
								View My Squad
							</button>
						)}
					</div>
					<button
						onClick={handleNext}
						disabled={gw >= (currentGw || fetchedStatus?.id || 38)}
						className="p-2 rounded-full hover:bg-ds-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronRight size={24} />
					</button>
				</div>

				<div className="flex gap-8">
					<div className="text-center">
						<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Total Points</div>
						<div className="text-3xl font-bold text-ds-primary">{total_points}</div>
					</div>
					{top_player && (
						<div className="text-center">
							<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Player of the Week</div>
							<div className="flex items-center gap-2">
								<img
									src={getPlayerImage(top_player.code, '40x40')}
									alt={top_player.name}
									loading="lazy"
									className="w-8 h-8 rounded-full object-cover border border-ds-border"
									onError={(e) => handlePlayerImageError(e, top_player, '40x40')}
								/>
								<div className="text-left">
									<div className="text-sm font-bold leading-tight">{top_player.name}</div>
									<div className="text-xs text-ds-text-muted">{top_player.points}pts</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Pitch View */}
			<PitchView players={squad} renderCard={(player) => <PlayerCard player={player} />} />
		</div>
	);
};

export default DreamTeam;
