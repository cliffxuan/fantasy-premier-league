import React, { useState } from 'react';
import { ArrowUpCircle, Zap, RefreshCw, Shield, List, Layout } from 'lucide-react';

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
		containerClass += " bg-fpl-green text-fpl-purple border-fpl-green shadow-[0_0_10px_rgba(0,255,135,0.4)]";
	} else if (status === 'played') {
		containerClass += " bg-white/5 text-gray-500 border-white/5";
	} else {
		containerClass += " bg-fpl-card text-white border-white/20 hover:border-fpl-green/50";
	}

	return (
		<div className={containerClass}>
			{getIcon(name)}
			<span className={textClass}>{label}</span>
			<span className={subTextClass}>
				{status === 'active' ? 'Active' : status === 'played' ? `Played GW${event}` : 'Play'}
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
		<div key={player.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_2fr] items-center py-3 border-b border-white/10 hover:bg-white/5 transition-colors">
			{/* Player Info */}
			<div className="flex items-center gap-3">
				<div className="relative w-8 h-10">
					<img
						src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
						alt={player.name}
						className="w-full h-full object-cover rounded-full"
						onError={(e) => { e.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-66.png` }}
					/>
					{player.status !== 'a' && (
						<div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold border border-white
                            ${player.status === 'd' ? 'bg-yellow-500 text-black' :
								player.status === 'i' ? 'bg-red-500 text-white' :
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
					<div className="text-xs text-gray-400 flex gap-2">
						<span>{player.team_short} {player.position === 1 ? 'GKP' : player.position === 2 ? 'DEF' : player.position === 3 ? 'MID' : 'FWD'}</span>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="text-center text-sm">{player.form}</div>
			<div className="text-center text-sm">{player.event_points}</div>
			<div className="text-center text-sm font-bold">{player.total_points}</div>

			{/* Fixture */}
			<div className="text-right text-sm pr-2">
				<span className={`px-2 py-1 rounded text-xs font-semibold ${player.fixture_difficulty <= 2 ? 'bg-fpl-green text-fpl-purple' :
					player.fixture_difficulty === 3 ? 'bg-gray-500 text-white' :
						player.fixture_difficulty === 4 ? 'bg-orange-500 text-white' :
							'bg-red-600 text-white'
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
		<div className="bg-fpl-card rounded-2xl p-6 border border-white/10">
			<div className="grid grid-cols-[3fr_1fr_1fr_1fr_2fr] text-xs text-gray-400 uppercase font-bold mb-4 px-2">
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

			<div className="mt-8 pt-6 border-t border-white/10">
				{renderSection("Substitutes", bench)}
			</div>
		</div>
	);
};

const SquadDisplay = ({ squad, chips }) => {
	const [viewMode, setViewMode] = useState('pitch'); // 'pitch' or 'list'

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
		<div className={`relative flex flex-col items-center justify-center w-[90px] ${isBench ? 'opacity-90' : ''}`}>
			<div className="relative mb-1 transition-transform hover:scale-110 cursor-pointer">
				{/* Player Photo */}
				<img
					src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`}
					alt={player.name}
					className="w-[60px] h-[75px] object-cover drop-shadow-lg"
					onError={(e) => { e.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-66.png` }}
				/>

				{/* Captain/Vice-Captain Badges */}
				{player.is_captain && (
					<div className="absolute -top-1 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
						C
					</div>
				)}
				{player.is_vice_captain && (
					<div className="absolute -top-1 -right-2 bg-gray-700 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
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

			<div className="bg-fpl-purple/90 text-white text-center rounded w-full py-1 px-0.5 border border-white/20 backdrop-blur-sm">
				<div className="text-xs font-bold truncate px-1">{player.name}</div>
				<div className="text-[10px] text-gray-300 flex justify-center gap-1">
					<span>{player.team}</span>
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col gap-6">
			{/* Header with Toggle */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">Pick Team</h2>
				<div className="flex bg-fpl-card rounded-lg p-1 border border-white/10">
					<button
						onClick={() => setViewMode('pitch')}
						className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'pitch' ? 'bg-fpl-purple text-fpl-green shadow-lg' : 'text-gray-400 hover:text-white'}`}
					>
						<Layout size={16} />
						Pitch View
					</button>
					<button
						onClick={() => setViewMode('list')}
						className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-fpl-purple text-fpl-green shadow-lg' : 'text-gray-400 hover:text-white'}`}
					>
						<List size={16} />
						List View
					</button>
				</div>
			</div>

			{/* Chips Row */}
			{chips && chips.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{chips.map(chip => <Chip key={chip.name} {...chip} />)}
				</div>
			)}

			{viewMode === 'pitch' ? (
				<>
					<div className="bg-fpl-green rounded-2xl p-8 relative border-4 border-white/20 min-h-[600px] flex flex-col justify-between overflow-hidden">
						{/* Pitch Pattern Overlay */}
						<div className="absolute inset-0 opacity-10 pointer-events-none"
							style={{
								backgroundImage: `linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)`,
								backgroundSize: '50px 50px'
							}}>
						</div>

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

					<div className="bg-fpl-card p-4 rounded-2xl border border-white/10">
						<h3 className="text-gray-400 text-base mb-4 font-normal">Bench</h3>
						<div className="flex justify-center gap-4 flex-wrap">
							{bench.map((p, i) => <PlayerCard key={`bench-${i}`} player={p} isBench={true} />)}
						</div>
					</div>
				</>
			) : (
				<ListView squad={squad} />
			)}
		</div>
	);
};

export default SquadDisplay;
