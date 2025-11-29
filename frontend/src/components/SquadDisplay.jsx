import React from 'react';

const SquadDisplay = ({ squad }) => {
	if (!squad || squad.length === 0) return null;

	// Separate starters (first 11) and bench (rest)
	// Note: This assumes the API returns players in order (1-11 starters, 12-15 bench)
	// A more robust way would be to check the 'position' field if it mapped to pitch position,
	if (!squad || squad.length === 0) return null;

	const starters = squad.slice(0, 11);
	const bench = squad.slice(11);

	const gkp = starters.filter(p => p.position === 1);
	const def = starters.filter(p => p.position === 2);
	const mid = starters.filter(p => p.position === 3);
	const fwd = starters.filter(p => p.position === 4);

	const PlayerCard = ({ player, isBench = false }) => (
		<div className={`relative flex flex-col items-center gap-1 transition-transform hover:scale-110 ${isBench ? 'bg-white/5 p-2 rounded-lg w-[100px]' : 'w-[90px]'}`}>
			<div className="w-[50px] h-[66px] mb-1 drop-shadow-lg">
				<img
					src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-66.png`}
					alt={player.team}
					onError={(e) => { e.target.onerror = null; e.target.src = "https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_0-66.png" }}
					className="w-full h-full object-contain"
				/>
			</div>
			<div className={`text-center w-full ${!isBench ? 'bg-black/70 px-2 py-1 rounded' : ''}`}>
				<div className="text-xs font-bold text-white truncate">{player.name}</div>
				<div className="flex justify-center gap-1 text-[0.65rem] text-gray-300">
					<span>{player.team}</span>
					<span className="text-fpl-green font-semibold">£{player.cost}</span>
				</div>
				{player.status !== 'a' && (
					<div className={`text-[0.6rem] px-1 rounded mt-0.5 inline-block ${player.status === 'd' ? 'bg-fpl-yellow text-black' :
						player.status === 'i' || player.status === 's' ? 'bg-fpl-red text-white' :
							'bg-fpl-yellow text-black'
						}`}>
						{player.status.toUpperCase()}
					</div>
				)}
			</div>
			{player.is_captain && (
				<div className="absolute top-0 right-0 bg-fpl-green text-black font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md">
					C
				</div>
			)}
			{player.is_vice_captain && (
				<div className="absolute top-0 right-0 bg-gray-300 text-black font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md border border-gray-400">
					V
				</div>
			)}
		</div>
	);

	return (
		<div className="flex flex-col gap-8">
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
		</div>
	);
};

export default SquadDisplay;
