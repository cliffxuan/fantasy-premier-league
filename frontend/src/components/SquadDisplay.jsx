import React, { useState } from 'react';
import { ArrowUpCircle, Zap, RefreshCw, Shield, List, Layout, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import PlayerPopover from './PlayerPopover';
import { getPlayerImage, handlePlayerImageError } from '../utils';

const Chip = ({ name, label, status, event }) => {
	const getIcon = (name) => {
		switch (name) {
			case 'bboost': return <ArrowUpCircle size={20} />;
			case '3xc': return <Zap size={20} />;
			case 'wildcard': return <RefreshCw size={20} />;
			case 'freehit': return <Shield size={20} />;
			default: return null;
		}
	};

	let containerClass = "flex flex-col items-center justify-center p-2 rounded-lg border w-full transition-colors";
	let textClass = "text-xs mt-1 font-bold";
	let subTextClass = "text-[10px] mt-0.5";

	if (status === 'active') {
		containerClass += " bg-ds-primary/20 text-ds-primary border-ds-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]";
	} else if (status === 'played') {
		containerClass += " bg-ds-card/50 text-ds-text-muted border-ds-border";
	} else {
		containerClass += " bg-ds-card text-ds-text border-ds-border hover:border-ds-primary/50";
	}

	return (
		<div className={containerClass}>
			{getIcon(name)}
			<span className={textClass}>{label}</span>
			<span className={subTextClass}>
				{status === 'active' ? 'Active' : status === 'played' ? `Played GW${event}` : 'Available'}
			</span>
		</div>
	);
};

const ListView = ({ squad }) => {
	const starters = squad.slice(0, 11);
	const bench = squad.slice(11);

	const getPositionName = (type) => {
		switch (type) {
			case 1: return "Goalkeepers";
			case 2: return "Defenders";
			case 3: return "Midfielders";
			case 4: return "Forwards";
			default: return "Unknown";
		}
	};

	const renderPlayerRow = (player) => (
		<div key={player.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_2fr] items-center py-3 border-b border-ds-border hover:bg-ds-card-hover transition-colors font-mono text-sm">
			{/* Player Info */}
			<div className="flex items-center gap-3">
				<div className="relative w-8 h-10">
					<img
						src={getPlayerImage(player.code)}
						alt={player.name}
						className="w-full h-full object-cover rounded-full"
						onError={(e) => handlePlayerImageError(e, player)}
					/>
					{player.status !== 'a' && (
						<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold border border-ds-bg
                            ${player.status === 'd' ? 'bg-ds-warning text-black' :
								player.status === 'i' ? 'bg-ds-danger text-white' :
									player.status === 'u' ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'}`}
						>
							!
						</div>
					)}
				</div>
				<div className="flex flex-col">
					<div className="font-bold text-sm flex items-center gap-2">
						{player.name}
						{player.is_captain && <span className="bg-black text-white text-[10px] px-1 rounded-full border border-white/20">C</span>}
						{player.is_vice_captain && <span className="bg-gray-700 text-white text-[10px] px-1 rounded-full border border-white/20">V</span>}
					</div>
					<div className="text-xs text-ds-text-muted flex gap-2 font-sans">
						<span>{player.team_short} {player.position === 1 ? 'GKP' : player.position === 2 ? 'DEF' : player.position === 3 ? 'MID' : 'FWD'}</span>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="text-center text-sm">{player.form}</div>
			<div className="text-center text-sm">{(player.event_points !== 0 || player.minutes > 0 || player.match_finished) ? player.event_points : ''}</div>
			<div className="text-center text-sm font-bold">{player.total_points}</div>

			{/* Fixture */}
			<div className="text-right text-sm pr-2">
				<span className={`px-2 py-1 rounded text-xs font-bold ${player.fixture_difficulty <= 2 ? 'bg-ds-accent/20 text-ds-accent' :
					player.fixture_difficulty === 3 ? 'bg-gray-500/20 text-gray-400' :
						player.fixture_difficulty === 4 ? 'bg-ds-warning/20 text-ds-warning' :
							'bg-ds-danger/20 text-ds-danger'
					}`}>
					{player.fixture}
				</span>
			</div>
		</div>
	);

	const renderSection = (title, players) => (
		<div className="mb-6">
			<h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
			{players.map(renderPlayerRow)}
		</div>
	);

	return (
		<div className="bg-ds-card rounded-xl p-6 border border-ds-border shadow-sm">
			<div className="grid grid-cols-[3fr_1fr_1fr_1fr_2fr] text-xs text-ds-text-muted uppercase font-bold mb-4 px-2 tracking-wider">
				<div>Player</div>
				<div className="text-center">Form</div>
				<div className="text-center">GW</div>
				<div className="text-center">Pts</div>
				<div className="text-right pr-2">Fix</div>
			</div>

			{renderSection("Goalkeepers", starters.filter(p => p.position === 1))}
			{renderSection("Defenders", starters.filter(p => p.position === 2))}
			{renderSection("Midfielders", starters.filter(p => p.position === 3))}
			{renderSection("Forwards", starters.filter(p => p.position === 4))}

			<div className="mt-8 pt-6 border-t border-ds-border">
				{renderSection("Substitutes", bench)}
			</div>
		</div>
	);
};

const SquadDisplay = ({ squad, chips, gameweek, transfers, onGwChange, loading, currentGw, onTabSwitch, history }) => {
	const [viewMode, setViewMode] = useState('pitch'); // 'pitch' or 'list'

	const handlePrev = () => {
		if (gameweek > 1 && onGwChange) onGwChange(gameweek - 1);
	};

	const handleNext = () => {
		if (gameweek < 38 && onGwChange) onGwChange(gameweek + 1);
	};

	const getGwPoints = () => {
		if (!history) return 0;
		const entry = history.find(h => h.event === gameweek);
		return entry ? entry.points : 0;
	};

	if (!squad || squad.length === 0) return null;

	// Separate starters (first 11) and bench (rest)
	const starters = squad.slice(0, 11);
	const bench = squad.slice(11);

	// Group starters by position
	const gkp = starters.filter(p => p.position === 1);
	const def = starters.filter(p => p.position === 2);
	const mid = starters.filter(p => p.position === 3);
	const fwd = starters.filter(p => p.position === 4);

	const PlayerCard = ({ player, isBench = false }) => (
		<PlayerPopover player={player}>
			<div className={`relative flex flex-col items-center justify-center w-[64px] md:w-[90px] ${isBench ? 'opacity-90' : ''}`}>
				<div className="relative mb-1 transition-transform hover:scale-110 cursor-pointer">
					{/* Player Photo */}
					<img
						src={getPlayerImage(player.code)}
						alt={player.name}
						className="w-[45px] h-[56px] md:w-[60px] md:h-[75px] object-cover drop-shadow-lg"
						onError={(e) => handlePlayerImageError(e, player)}
					/>

					{/* Form/Points Badge */}
					{gameweek <= (currentGw || 38) ? (
						(player.event_points !== 0 || player.minutes > 0 || player.match_finished) && (
							<div className="absolute -top-1 -left-2 bg-ds-primary text-white text-[9px] md:text-[10px] font-bold w-5 h-4 md:w-6 md:h-5 flex items-center justify-center rounded-full border border-white">
								{player.event_points}
							</div>
						)
					) : (
						<div className={`absolute -top-1 -left-2 text-[9px] md:text-[10px] font-bold w-5 h-4 md:w-6 md:h-5 flex items-center justify-center rounded-full border border-white
							${parseFloat(player.form) >= 6.0 ? 'bg-ds-accent text-black' :
								parseFloat(player.form) >= 3.0 ? 'bg-gray-600 text-white' :
									'bg-ds-card text-ds-text-muted'}`}>
							{player.form}
						</div>
					)}

					{/* Captain/Vice-Captain Badges */}
					{player.is_captain && (
						<div className="absolute -top-1 -right-2 bg-black text-white text-[8px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border border-white">
							C
						</div>
					)}
					{player.is_vice_captain && (
						<div className="absolute -top-1 -right-2 bg-gray-700 text-white text-[8px] md:text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border border-white">
							V
						</div>
					)}

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
					<div className="text-[10px] md:text-xs font-bold truncate px-1 font-sans">{player.name}</div>
					<div className="flex justify-center items-center gap-1 mt-0.5">
						<span className={`text-[9px] px-1 rounded font-bold ${player.fixture_difficulty <= 2 ? 'bg-ds-accent/20 text-ds-accent' :
							player.fixture_difficulty === 3 ? 'bg-gray-500/20 text-gray-400' :
								player.fixture_difficulty === 4 ? 'bg-ds-warning/20 text-ds-warning' :
									'bg-ds-danger/20 text-ds-danger'
							}`}>
							{player.fixture}
						</span>
					</div>
				</div>
			</div>
		</PlayerPopover>
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Header with Navigation and Toggle */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-ds-card p-4 rounded-xl border border-ds-border">
				<div className="flex items-center gap-4">
					<button
						onClick={handlePrev}
						disabled={gameweek <= 1 || loading}
						className="p-2 rounded-full hover:bg-ds-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronLeft size={24} />
					</button>
					<div className="flex flex-col items-center min-w-[200px]">
						<h2 className="text-2xl font-bold text-center">
							Gameweek {gameweek}
						</h2>
						{onTabSwitch && gameweek <= (currentGw || 38) && (
							<button
								onClick={onTabSwitch}
								className="text-xs text-ds-primary hover:text-ds-primary-hover hover:underline mt-1 font-mono uppercase tracking-wide"
							>
								View Team of the Week
							</button>
						)}
					</div>
					<button
						onClick={handleNext}
						disabled={gameweek >= 38 || loading}
						className="p-2 rounded-full hover:bg-ds-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
					>
						<ChevronRight size={24} />
					</button>
				</div>

				<div className="flex items-center gap-8">
					<div className="text-center">
						<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Total Points</div>
						<div className="text-3xl font-bold text-ds-primary">{getGwPoints()}</div>
					</div>

					<div className="h-10 w-px bg-ds-border hidden md:block"></div>

					<div className="flex bg-ds-bg rounded-lg p-1 border border-ds-border">
						<button
							onClick={() => setViewMode('pitch')}
							className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'pitch' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							<Layout size={16} />
							<span className="hidden md:inline">Pitch</span>
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
						>
							<List size={16} />
							<span className="hidden md:inline">List</span>
						</button>
					</div>
				</div>
			</div>

			{/* Loading Overlay */}
			{loading && (
				<div className="text-center p-4 text-ds-text-muted animate-pulse font-mono">
					Loading squad...
				</div>
			)}

			{!loading && (
				<>
					{/* Chips Row */}
					{chips && chips.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{chips.map(chip => <Chip key={chip.name} {...chip} />)}
						</div>
					)}

					{/* Transfers Section */}
					{transfers && transfers.length > 0 && (
						<div className="bg-ds-card p-4 rounded-xl border border-ds-border">
							<h3 className="text-sm font-bold text-ds-text-muted uppercase mb-3 flex items-center gap-2">
								<ArrowRightLeft size={16} />
								Transfers
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{transfers.map((t, i) => (
									<div key={i} className="flex items-center justify-between bg-ds-bg/50 p-2 rounded border border-ds-border text-sm font-mono">
										<div className="flex items-center gap-2">
											<span className="text-ds-danger font-bold text-xs">OUT</span>
											<span>{t.element_out_name}</span>
										</div>
										<ArrowRightLeft size={12} className="text-ds-text-muted" />
										<div className="flex items-center gap-2">
											<span className="text-ds-accent font-bold text-xs">IN</span>
											<span>{t.element_in_name}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}

			{!loading && (viewMode === 'pitch' ? (
				<>
					<div className="bg-ds-card rounded-xl p-2 md:p-8 relative border border-ds-border min-h-[500px] md:min-h-[600px] flex flex-col justify-between overflow-hidden">
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

						<div className="flex justify-center gap-1 md:gap-4 z-10">
							{gkp.map((p, i) => <PlayerCard key={`gkp-${i}`} player={p} />)}
						</div>
						<div className="flex justify-center gap-1 md:gap-4 z-10">
							{def.map((p, i) => <PlayerCard key={`def-${i}`} player={p} />)}
						</div>
						<div className="flex justify-center gap-1 md:gap-4 z-10">
							{mid.map((p, i) => <PlayerCard key={`mid-${i}`} player={p} />)}
						</div>
						<div className="flex justify-center gap-1 md:gap-4 z-10">
							{fwd.map((p, i) => <PlayerCard key={`fwd-${i}`} player={p} />)}
						</div>
					</div>

					<div className="bg-ds-card p-4 rounded-xl border border-ds-border mt-6">
						<h3 className="text-gray-400 text-base mb-4 font-normal">Bench</h3>
						<div className="flex justify-center gap-2 md:gap-4 flex-wrap">
							{bench.map((p, i) => <PlayerCard key={`bench-${i}`} player={p} isBench={true} />)}
						</div>
					</div>
				</>
			) : (
				<ListView squad={squad} />
			))}
		</div>
	);
};

export default SquadDisplay;
