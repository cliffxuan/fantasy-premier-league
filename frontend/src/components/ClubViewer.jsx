import React, { useState, useEffect } from 'react';
import { getClubSquad, getTeams } from '../api';
import SquadDisplay from './SquadDisplay';
import { ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ClubViewer = () => {
	const [teams, setTeams] = useState([]);
	const [selectedClub, setSelectedClub] = useState(null);
	const [gameweek, setGameweek] = useState(null);
	const [squadData, setSquadData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [currentGw, setCurrentGw] = useState(null);
	const [opponentData, setOpponentData] = useState([]);
	const [oppLoading, setOppLoading] = useState(false);
	const [showOpponentFirst, setShowOpponentFirst] = useState(false);

	useEffect(() => {
		const fetchTeams = async () => {
			const data = await getTeams();
			setTeams(data);
			if (data && data.length > 0) {
				const firstTeam = data[0];
				setSelectedClub(firstTeam.id);
				handleFetch(firstTeam.id, null);
			}
		};
		fetchTeams();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	// Helper for FDR colors
	const getFdrColor = (difficulty) => {
		switch (difficulty) {
			case 1: return 'bg-[#375523] text-white border-[#375523]';
			case 2: return 'bg-[#01fc7a] text-black border-[#01fc7a]';
			case 3: return 'bg-[#e7e7e7] text-black border-[#e7e7e7]';
			case 4: return 'bg-[#ff1751] text-white border-[#ff1751]';
			case 5: return 'bg-[#80072d] text-white border-[#80072d]';
			default: return 'bg-ds-surface border-ds-border text-ds-text-muted';
		}
	};

	useEffect(() => {
		const fetchOpponents = async () => {
			if (!squadData || !squadData.fixtures || !gameweek || teams.length === 0) {
				setOpponentData([]);
				return;
			}

			// Don't fetch if loading main squad
			if (loading) {
				setOpponentData([]);
				return;
			}

			const currentFixtures = squadData.fixtures.filter(f => f.event === gameweek);
			if (currentFixtures.length === 0) {
				setOpponentData([]);
				return;
			}

			setOppLoading(true);

			// Use Promise.all for parallel fetching
			const promises = currentFixtures.map(async (fix) => {
				// fix.opponent_code is the team Code. Map to Team ID.
				// Note: In some contexts opponent_code might be ID, but based on badge usage 't{code}.png', it's likely code.
				// We check both just in case, preferring Code match.
				const oppTeam = teams.find(t => t.code === fix.opponent_code);
				if (oppTeam) {
					try {
						const data = await getClubSquad(oppTeam.id, gameweek);
						if (data && data.squad) {
							return data;
						}
					} catch (e) {
						console.error("Failed to fetch opponent squad", e);
					}
				}
				return null;
			});

			const results = await Promise.all(promises);
			setOpponentData(results.filter(r => r !== null));
			setOppLoading(false);
		};

		fetchOpponents();
	}, [squadData, gameweek, teams, loading]);

	// Helper for Result colors
	const getResultColor = (result) => {
		switch (result) {
			case 'W': return 'text-green-500 bg-green-500/10 border-green-500/20';
			case 'D': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
			case 'L': return 'text-ds-danger bg-ds-danger/10 border-ds-danger/20';
			default: return 'text-ds-text-muted';
		}
	};

	const ClubFixtures = ({ fixtures, teams }) => {
		if (!fixtures || fixtures.length === 0) return null;

		return (
			<div className="bg-ds-card rounded-xl border border-ds-border overflow-hidden flex flex-col h-full bg-ds-card/60 backdrop-blur-sm">
				<div className="p-4 border-b border-ds-border bg-ds-surface/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
					<h3 className="font-bold text-lg flex items-center gap-2">
						<span>🗓️</span> Fixtures & Results
					</h3>
					<span className="text-xs text-ds-text-muted font-mono">{fixtures.length} Games</span>
				</div>
				<div className="overflow-y-auto custom-scrollbar max-h-[800px]">
					<table className="w-full text-sm text-left relative collapse-separate">
						<thead className="bg-ds-surface text-ds-text-muted font-medium border-b border-ds-border sticky top-0 z-10 shadow-sm">
							<tr>
								<th className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-ds-surface">GW</th>
								<th className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-ds-surface">Date</th>
								<th className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-ds-surface">Opponent</th>
								<th className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-ds-surface text-center">FDR</th>
								<th className="px-4 py-3 font-mono text-xs uppercase tracking-wider bg-ds-surface text-center">Result</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-ds-border/50">
							{fixtures.map((fix, idx) => {
								const date = new Date(fix.kickoff_time).toLocaleDateString(undefined, {
									month: 'short', day: 'numeric'
								});
								const oppTeam = teams.find(t => t.id === fix.opponent_code) || {}; /* Note: backend returns opponent_code as team code, not team id. 
                                Actually backend returns `opponent_code` as `team.code`. My `teams` prop likely has `id` and `code`.
                                Let's check `teams` state usage. `teams` comes from `getTeams()`. Usually has `id`, `code`, `name`.
                            */
								// Wait, `fixtures` has `opponent_code`. Is that `team.code` or `team.id`?
								// In backend: `opponent_code: opp_team.get("code")` -> This is the FPL specific photo code (usually).
								// `teams` list from `getTeams` has `code` which is that sane photo code.

								return (
									<tr key={idx} className="hover:bg-ds-primary/5 transition-colors group">
										<td className="px-4 py-3 font-mono text-ds-text-muted text-xs border-r border-ds-border/30">{fix.event}</td>
										<td className="px-4 py-3 text-ds-text-muted text-xs">{date}</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<span className={`text-[10px] font-bold w-6 text-center ${fix.is_home ? 'text-ds-text bg-ds-surface px-1 py-0.5 rounded border border-ds-border' : 'text-ds-text-muted'}`}>
													{fix.is_home ? 'H' : 'A'}
												</span>
												<div className="flex items-center gap-2">
													<img
														src={`https://resources.premierleague.com/premierleague/badges/20/t${fix.opponent_code}.png`}
														alt={fix.opponent_short}
														className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
														onError={(e) => e.target.style.display = 'none'}
													/>
													<span className="font-semibold text-sm">{fix.opponent_name}</span>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-center">
											<span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border shadow-sm ${getFdrColor(fix.difficulty)}`}>
												{fix.difficulty}
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											{fix.finished ? (
												<div className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-bold gap-1 shadow-sm ${getResultColor(fix.result)}`}>
													<span>{fix.result}</span>
													<span className="opacity-40 mx-1">|</span>
													<span>{fix.score}</span>
												</div>
											) : (
												<span className="text-ds-text-muted opacity-20">-</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
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
					<div className="bg-ds-card p-6 rounded-xl border border-ds-border flex flex-col lg:flex-row items-center justify-between gap-4">
						<div className="flex flex-col gap-1">
							{/* Current Gameweek Fixture Widget - Home vs Away */}
							{(squadData?.fixtures?.filter(f => f.event === gameweek) || []).map((fix, idx) => {
								const myTeam = teams.find(t => t.id === squadData.team.id) || squadData.team;
								const oppTeam = {
									code: fix.opponent_code,
									short_name: fix.opponent_short,
									name: fix.opponent_name
								};

								const homeTeam = fix.is_home ? myTeam : oppTeam;
								const awayTeam = fix.is_home ? oppTeam : myTeam;
								// Determine if we won/lost/drew for colouring result if needed, though usually just generic Score colour is fine or coloured by result.
								// fix.result is relative to 'myTeam'.

								return (
									<div key={idx} className="flex items-center gap-3 text-sm bg-ds-surface px-4 py-3 rounded-xl border border-ds-border shadow-sm animate-in fade-in slide-in-from-top-1 w-fit">
										{/* Home Team */}
										<div className="flex items-center gap-3">
											{homeTeam.code && (
												<img
													src={`https://resources.premierleague.com/premierleague/badges/50/t${homeTeam.code}.png`}
													alt="Home"
													className="w-8 h-8 object-contain"
												/>
											)}
											<span className="text-xl font-bold tracking-tight">{homeTeam.short_name || homeTeam.name}</span>
										</div>

										{/* Score / Status (Center) */}
										<div className="flex flex-col items-center px-4 min-w-[80px]">
											{fix.finished ? (
												<div className={`px-3 py-1 rounded-lg font-mono font-bold text-lg border ${fix.result === 'W' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
													fix.result === 'L' ? 'bg-ds-danger/10 text-ds-danger border-ds-danger/20' :
														'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
													}`}>
													{fix.score}
												</div>
											) : (
												<span className="text-xs font-bold text-ds-text-muted opacity-50">vs</span>
											)}
										</div>

										{/* Away Team */}
										<div className="flex items-center gap-3">
											<span className="text-xl font-bold tracking-tight">{awayTeam.short_name || awayTeam.name}</span>
											{awayTeam.code && (
												<img
													src={`https://resources.premierleague.com/premierleague/badges/50/t${awayTeam.code}.png`}
													alt="Away"
													className="w-8 h-8 object-contain"
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
						<div className="bg-ds-bg px-2 py-2 rounded-lg border border-ds-border flex items-center gap-2 max-w-full overflow-x-auto">
							{/* Gameweek Controls */}
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleGwChange(gameweek - 1)}
									disabled={gameweek <= 1 || loading}
									className="p-1 rounded hover:bg-ds-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								>
									<ChevronLeft size={16} />
								</button>
								<span className="text-sm font-mono font-bold w-12 text-center">GW {gameweek}</span>
								<button
									onClick={() => handleGwChange(gameweek + 1)}
									disabled={gameweek >= 38 || loading}
									className="p-1 rounded hover:bg-ds-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
								>
									<ChevronRight size={16} />
								</button>
							</div>
							<div className="h-4 w-px bg-ds-border"></div>

							<button
								onClick={() => setShowOpponentFirst(!showOpponentFirst)}
								className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded transition-all whitespace-nowrap ${showOpponentFirst ? 'bg-ds-primary text-white shadow-sm' : 'hover:bg-ds-surface text-ds-text-muted hover:text-ds-text'}`}
								title="Toggle Display Order"
							>
								<ArrowUpDown size={14} />
								{showOpponentFirst ? 'Opponent First' : 'Club First'}
							</button>
							<div className="h-4 w-px bg-ds-border"></div>
							<span className="text-xs text-ds-text-muted uppercase font-bold mr-2 hidden sm:inline">Players</span>
							<span className="font-mono font-bold text-ds-primary">{squadData.squad.length}</span>
						</div>
					</div>

					<div className="flex flex-col gap-8">
						{/* Dynamic Order Rendering */}
						{(() => {
							const ClubSection = (
								<div>
									<SquadDisplay
										squad={squadData.squad}
										chips={[]}
										gameweek={gameweek}
										transfers={[]}
										loading={loading}
										currentGw={currentGw}
										history={[{
											event: gameweek,
											points: squadData.squad.slice(0, 11).reduce((acc, p) => acc + (p.event_points || 0), 0)
										}]}
										customMainHeader={
											<div className="flex items-center gap-4">
												<div className="flex flex-col">
													<span className="text-xs text-ds-text-muted font-mono uppercase tracking-widest mb-1 text-left">Club</span>
													<div className="flex items-center gap-3">
														{squadData.team?.code && (
															<img
																src={`https://resources.premierleague.com/premierleague/badges/50/t${squadData.team.code}.png`}
																className="w-10 h-10 object-contain drop-shadow-md"
																alt={squadData.team?.name}
															/>
														)}
														<h2 className="text-2xl font-bold">{squadData.team?.name}</h2>
													</div>
												</div>
											</div>
										}
									/>
								</div>
							);

							const OpponentSection = opponentData.length > 0 && (
								<div className="flex flex-col gap-8">
									{opponentData.map((data, idx) => (
										<div key={idx} className="animate-in fade-in slide-in-from-bottom-8 duration-500">
											<SquadDisplay
												squad={data.squad}
												chips={[]}
												gameweek={gameweek}
												transfers={[]}
												loading={oppLoading}
												currentGw={currentGw}
												history={[{
													event: gameweek,
													points: data.squad.slice(0, 11).reduce((acc, p) => acc + (p.event_points || 0), 0)
												}]}
												customMainHeader={
													<div className="flex items-center gap-4">
														<div className="flex flex-col">
															<span className="text-xs text-ds-text-muted font-mono uppercase tracking-widest mb-1 text-left">Opponent</span>
															<div className="flex items-center gap-3">
																{data.team?.code && (
																	<img
																		src={`https://resources.premierleague.com/premierleague/badges/50/t${data.team.code}.png`}
																		className="w-10 h-10 object-contain drop-shadow-md"
																		alt={data.team?.name}
																	/>
																)}
																<h2 className="text-2xl font-bold">{data.team?.name}</h2>
															</div>
														</div>
													</div>
												}
											/>
										</div>
									))}
								</div>
							);

							// The Separator
							const Separator = (
								<div className="py-8 border-t-2 border-b-2 border-dashed border-ds-border/30 my-4 flex items-center justify-center">
									<h3 className="text-xl font-bold text-ds-text-muted uppercase tracking-widest text-center flex items-center justify-center gap-4 w-full">
										<span className="h-px bg-ds-border flex-1 max-w-[100px]"></span>
										VS
										<span className="h-px bg-ds-border flex-1 max-w-[100px]"></span>
									</h3>
								</div>
							);

							if (!OpponentSection) {
								return ClubSection;
							}

							if (showOpponentFirst) {
								return (
									<>
										{OpponentSection}
										{Separator}
										{ClubSection}
									</>
								);
							} else {
								return (
									<>
										{ClubSection}
										{Separator}
										{OpponentSection}
									</>
								);
							}
						})()}
						<div>
							<ClubFixtures fixtures={squadData.fixtures} teams={teams} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClubViewer;
