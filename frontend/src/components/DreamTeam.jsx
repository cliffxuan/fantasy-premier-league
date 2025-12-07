import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDreamTeam } from '../api';
import PlayerPopover from './PlayerPopover';
import { getPlayerImage, handlePlayerImageError } from '../utils';

const DreamTeam = ({ currentGw, gw, onGwChange, onTabSwitch }) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await getDreamTeam(gw);
				setData(result);
			} catch (error) {
				console.error("Failed to fetch dream team", error);
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
		if (gw < (currentGw || 38) && onGwChange) onGwChange(gw + 1);
	};

	if (!data && loading) return <div className="text-center p-8 text-ds-text-muted">Loading Dream Team...</div>;
	if (!data) return null;

	const { squad, top_player, total_points } = data;

	// Group by position
	const gkp = squad.filter(p => p.position === 1);
	const def = squad.filter(p => p.position === 2);
	const mid = squad.filter(p => p.position === 3);
	const fwd = squad.filter(p => p.position === 4);

	const PlayerCard = ({ player }) => (
		<PlayerPopover player={player}>
			<div className="relative flex flex-col items-center justify-center w-[90px]">
				<div className="relative mb-1 transition-transform hover:scale-110 cursor-pointer">
					{/* Player Photo */}
					<img
						src={getPlayerImage(player.code)}
						alt={player.name}
						className="w-[60px] h-[75px] object-cover drop-shadow-lg"
						onError={(e) => handlePlayerImageError(e, player)}
					/>

					{/* Points Badge (Top Left) */}
					<div className="absolute -top-1 -left-2 bg-ds-primary text-white text-[12px] font-bold w-7 h-6 flex items-center justify-center rounded-full border border-white shadow-sm">
						{player.event_points}
					</div>

					{/* Status Indicator */}
					{player.status !== 'a' && (
						<div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-white
                            ${player.status === 'd' ? 'bg-yellow-500 text-black' :
								player.status === 'i' ? 'bg-red-500 text-white' :
									player.status === 'u' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'}`}
						>
							!
						</div>
					)}
				</div>

				<div className="bg-ds-card/90 text-ds-text text-center rounded w-full py-1 px-0.5 border border-ds-border backdrop-blur-sm shadow-sm mt-1">
					<div className="text-xs font-bold truncate px-1 font-sans">{player.name}</div>
					<div className="flex justify-center items-center gap-1 mt-0.5">
						<span className="text-[9px] text-ds-text-muted font-bold px-1">
							{player.fixture}
						</span>
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
						<h2 className="text-2xl font-bold text-center">
							Gameweek {gw}
						</h2>
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
						disabled={gw >= (currentGw || 38)}
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
			<div className="bg-ds-card rounded-xl p-8 relative border border-ds-border min-h-[600px] flex flex-col justify-between overflow-hidden">
				{/* Pitch Pattern Overlay */}
				<div className="absolute inset-0 opacity-5 pointer-events-none"
					style={{
						backgroundImage: `linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)`,
						backgroundSize: '100px 100px'
					}}>
				</div>
				{/* Center Circle */}
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/5 rounded-full pointer-events-none"></div>
				{/* Halfway Line */}
				<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 pointer-events-none"></div>

				<div className="flex justify-center gap-4 z-10">
					{gkp.map((p, i) => <PlayerCard key={`gkp-${i}`} player={p} />)}
				</div>
				<div className="flex justify-center gap-4 z-10">
					{def.map((p, i) => <PlayerCard key={`def-${i}`} player={p} />)}
				</div>
				<div className="flex justify-center gap-4 z-10">
					{mid.map((p, i) => <PlayerCard key={`mid-${i}`} player={p} />)}
				</div>
				<div className="flex justify-center gap-4 z-10">
					{fwd.map((p, i) => <PlayerCard key={`fwd-${i}`} player={p} />)}
				</div>
			</div>
		</div>
	);
};

export default DreamTeam;
