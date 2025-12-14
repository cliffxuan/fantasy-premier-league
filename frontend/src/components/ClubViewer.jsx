import React, { useState, useEffect } from 'react';
import { getClubSquad, getTeams } from '../api';
import SquadDisplay from './SquadDisplay';
import { ChevronDown } from 'lucide-react';

const ClubViewer = () => {
	const [teams, setTeams] = useState([]);
	const [selectedClub, setSelectedClub] = useState(null);
	const [gameweek, setGameweek] = useState(null);
	const [squadData, setSquadData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [currentGw, setCurrentGw] = useState(null);

	useEffect(() => {
		const fetchTeams = async () => {
			const data = await getTeams();
			setTeams(data);
		};
		fetchTeams();
	}, []);

	const handleFetch = async (clubId, gw) => {
		if (!clubId) return;
		setLoading(true);
		setError(null);
		try {
			const data = await getClubSquad(clubId, gw);
			if (data && data.squad) {
				setSquadData(data);
				if (data.gameweek) {
					setGameweek(data.gameweek);
					// Only set currentGw if it's the first load (to allow navigation properly)
					// If backend returns the requested GW, use that as current context for the display?
					// Actually SquadDisplay needs 'currentGw' to know what is "Live" vs "Past".
					// Pass current_event from bootstrap as currentGw roughly, but we don't have it here directly unless we fetch it.
					// But our backend's 'gameweek' return is the requested one. 
					// Let's assume for now currentGw is the one initially loaded.
					if (!currentGw) setCurrentGw(data.gameweek);
				}
			} else {
				setError('Failed to fetch club data.');
				setSquadData(null);
			}
		} catch (err) {
			setError(err.message || 'Failed to fetch club data.');
			setSquadData(null);
		} finally {
			setLoading(false);
		}
	};

	const handleClubChange = (e) => {
		const clubId = parseInt(e.target.value);
		setSelectedClub(clubId);
		handleFetch(clubId, gameweek);
	};

	const handleGwChange = (newGw) => {
		setGameweek(newGw);
		handleFetch(selectedClub, newGw);
	};

	return (
		<div className="flex flex-col gap-6 animate-in fade-in duration-300">
			{/* Search / Controls Section */}
			<div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
				<div className="flex flex-col md:flex-row gap-4 items-end">
					<div className="flex-1 w-full relative group">
						<label className="block text-xs text-ds-text-muted mb-2 uppercase tracking-wide font-bold">
							Select Club
						</label>

						{/* Custom Dropdown Trigger */}
						<div
							className="w-full bg-ds-surface border border-ds-border rounded-md px-4 py-2 text-sm flex items-center justify-between cursor-pointer focus:border-ds-primary focus:ring-1 focus:ring-ds-primary transition-all hover:bg-ds-surface-hover"
							onClick={() => {
								const dropdown = document.getElementById('club-dropdown');
								const isHidden = dropdown.classList.contains('hidden');
								if (isHidden) {
									dropdown.classList.remove('hidden');
									document.getElementById('club-search-input')?.focus();
								} else {
									dropdown.classList.add('hidden');
								}
							}}
						>
							<div className="flex items-center gap-2">
								{selectedClub ? (
									<>
										<img
											src={`https://resources.premierleague.com/premierleague/badges/50/t${teams.find(t => t.id === selectedClub)?.code}.png`}
											alt="Badge"
											className="w-6 h-6 object-contain"
										/>
										<span className="font-bold">{teams.find(t => t.id === selectedClub)?.name}</span>
									</>
								) : (
									<span className="text-ds-text-muted">Select a Premier League Club...</span>
								)}
							</div>
							<ChevronDown size={16} className="text-ds-text-muted" />
						</div>

						{/* Custom Dropdown Menu */}
						<div id="club-dropdown" className="hidden absolute top-full left-0 right-0 mt-2 bg-ds-card border border-ds-border rounded-xl shadow-xl z-50 max-h-[400px] overflow-hidden flex flex-col">
							{/* Search Input */}
							<div className="p-2 border-b border-ds-border sticky top-0 bg-ds-card z-10">
								<input
									id="club-search-input"
									type="text"
									className="w-full bg-ds-bg border border-ds-border rounded px-3 py-2 text-sm outline-none focus:border-ds-primary transition-all"
									placeholder="Search club..."
									onClick={(e) => e.stopPropagation()}
									onChange={(e) => {
										const term = e.target.value.toLowerCase();
										const items = document.querySelectorAll('.club-item');
										items.forEach(item => {
											const name = item.getAttribute('data-name').toLowerCase();
											if (name.includes(term)) {
												item.classList.remove('hidden');
											} else {
												item.classList.add('hidden');
											}
										});
									}}
								/>
							</div>

							<div className="overflow-y-auto custom-scrollbar flex-1">
								{teams.map(team => (
									<div
										key={team.id}
										data-name={team.name}
										className="club-item flex items-center gap-3 px-4 py-3 hover:bg-ds-bg cursor-pointer transition-colors border-b border-ds-border/50 last:border-none"
										onClick={() => {
											setSelectedClub(team.id);
											handleFetch(team.id, gameweek);
											document.getElementById('club-dropdown').classList.add('hidden');
											// Reset search
											const input = document.getElementById('club-search-input');
											if (input) input.value = '';
											document.querySelectorAll('.club-item').forEach(i => i.classList.remove('hidden'));
										}}
									>
										<img
											src={`https://resources.premierleague.com/premierleague/badges/50/t${team.code}.png`}
											alt={team.name}
											className="w-8 h-8 object-contain"
										/>
										<span className="font-bold text-sm">{team.name}</span>
									</div>
								))}
							</div>
						</div>

						{/* Overlay to close on click outside */}
						<div
							className="fixed inset-0 z-40 hidden"
							id="dropdown-overlay"
							onClick={(e) => {
								if (!e.target.closest('#club-dropdown') && !e.target.closest('.group')) {
									document.getElementById('club-dropdown').classList.add('hidden');
								}
							}}
						></div>

					</div>


				</div>
			</div>

			{error && (
				<div className="bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg font-mono text-sm text-center">
					{error}
				</div>
			)}

			{!squadData && !loading && !error && (
				<div className="text-center py-20 flex flex-col items-center justify-center opacity-40">
					<div className="w-16 h-16 rounded-full bg-ds-card border border-ds-border flex items-center justify-center mb-6">
						<span className="text-3xl">🛡️</span>
					</div>
					<h2 className="text-xl font-bold text-ds-text mb-2">Club Viewer</h2>
					<p className="text-ds-text-muted max-w-xs mx-auto text-sm">
						Select a Premier League club to view their full squad and performance.
					</p>
				</div>
			)}

			{squadData && (
				<div className="flex flex-col gap-6">
					<div className="bg-ds-card p-6 rounded-xl border border-ds-border flex items-center justify-between">
						<div className="flex items-center gap-4">
							{/* Club Badge - we can try to guess it or use standard logos based on code */}
							<h2 className="text-2xl font-bold">{squadData.team?.name}</h2>
						</div>
						<div className="bg-ds-bg px-4 py-2 rounded-lg border border-ds-border">
							<span className="text-xs text-ds-text-muted uppercase font-bold mr-2">Players</span>
							<span className="font-mono font-bold text-ds-primary">{squadData.squad.length}</span>
						</div>
					</div>


					<SquadDisplay
						squad={squadData.squad}
						chips={[]}
						gameweek={gameweek}
						transfers={[]}
						onGwChange={handleGwChange}
						loading={loading}
						currentGw={currentGw}
						history={[{
							event: gameweek,
							points: squadData.squad.slice(0, 11).reduce((acc, p) => acc + (p.event_points || 0), 0)
						}]}
					/>
				</div>
			)}
		</div>
	);
};

export default ClubViewer;
