import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import GameweekRangeSlider from './GameweekRangeSlider';
import PlayerPopover from './PlayerPopover';
import ComparisonChart from './ComparisonChart';
import { getPlayerSummary, getTeams } from '../api';

const PlayerExplorer = () => {
	const [players, setPlayers] = useState([]);
	const [teams, setTeams] = useState([]);
	const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentGw, setCurrentGw] = useState(38);
	const [filters, setFilters] = useState({
		minGw: 1,
		maxGw: 38,
		venue: [], // Default none selected (implies all/both in logic usually)
		search: '',
		position: [], // Default none selected (implies all)
		team: [] // Empty means all
	});
	const [teamInput, setTeamInput] = useState('');
	const inputRef = useRef(null);

	const [selectedPlayers, setSelectedPlayers] = useState([]); // List of IDs
	const [showComparison, setShowComparison] = useState(false);
	const [sortConfig, setSortConfig] = useState({ key: 'points_in_range', direction: 'desc' });

	// Comparison Data
	const [comparisonData, setComparisonData] = useState({}); // { pid: history[] }
	const [loadingComparison, setLoadingComparison] = useState(false);

	// Fetch Initial Data (GW and Teams)
	useEffect(() => {
		const init = async () => {
			try {
				// Fetch GW
				const gwRes = await fetch('/api/gameweek/current');
				if (gwRes.ok) {
					const data = await gwRes.json();
					const gw = data.gameweek || 38;
					setCurrentGw(gw);
					setFilters(prev => ({ ...prev, maxGw: gw }));
				}

				// Fetch Teams
				const teamsData = await getTeams();
				setTeams(teamsData);
			} catch (e) {
				console.error("Failed to fetch initial data", e);
			}
		};
		init();
	}, []);

	// Fetch Players when filters (range/venue) change
	useEffect(() => {
		const fetchPlayers = async () => {
			setLoading(true);
			try {
				const venueParam = (filters.venue.length === 0 || filters.venue.length === 2) ? 'both' : filters.venue[0];
				const query = new URLSearchParams({
					min_gw: filters.minGw,
					max_gw: filters.maxGw,
					venue: venueParam
				});

				const res = await fetch(`/api/players/aggregated?${query.toString()}`);
				if (!res.ok) throw new Error("Failed to fetch player stats");

				const data = await res.json();
				setPlayers(data);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};

		// Debounce slightly to avoid rapid calls from slider
		const timeout = setTimeout(fetchPlayers, 500);
		return () => clearTimeout(timeout);
	}, [filters.minGw, filters.maxGw, filters.venue]);

	// Fetch Comparison Details when selection changes
	useEffect(() => {
		if (selectedPlayers.length > 0) {
			const fetchDetails = async () => {
				setLoadingComparison(true);
				const data = {};

				// Identify missing data to fetch
				const missing = selectedPlayers.filter(pid => !comparisonData[pid]);

				if (missing.length > 0) {
					try {
						const results = await Promise.all(
							missing.map(pid => getPlayerSummary(pid).catch(e => null))
						);

						results.forEach((res, index) => {
							if (res && res.history) {
								data[missing[index]] = res.history;
							}
						});

						setComparisonData(prev => ({ ...prev, ...data }));
					} catch (e) {
						console.error("Failed to fetch comparison details", e);
					}
				}
				setLoadingComparison(false);
			};

			fetchDetails();
		}
	}, [selectedPlayers]); // Data is fetched automatically when players are selected

	// Derived / Client-side filtered list
	const filteredPlayers = useMemo(() => {
		let result = [...players];

		if (filters.search) {
			const term = filters.search.toLowerCase();
			result = result.filter(p =>
				p.web_name.toLowerCase().includes(term) ||
				p.full_name.toLowerCase().includes(term)
			);
		}

		if (Array.isArray(filters.position) ? filters.position.length > 0 : filters.position !== 'all') {
			if (Array.isArray(filters.position)) {
				result = result.filter(p => filters.position.includes(p.element_type));
			} else {
				result = result.filter(p => p.element_type === parseInt(filters.position));
			}
		}

		if (filters.team.length > 0) {
			result = result.filter(p => filters.team.includes(p.team_code));
		}

		// Sort
		if (sortConfig.key) {
			result.sort((a, b) => {
				let aVal = a[sortConfig.key];
				let bVal = b[sortConfig.key];

				if (typeof aVal === 'string') aVal = aVal.toLowerCase();
				if (typeof bVal === 'string') bVal = bVal.toLowerCase();

				if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [players, filters.search, filters.position, filters.team, sortConfig]);

	const handleSort = (key) => {
		setSortConfig(prev => ({
			key,
			direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
		}));
	};

	const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
	const [playerColors, setPlayerColors] = useState({});

	const handleSelect = (id) => {
		setSelectedPlayers(prev => {
			if (prev.includes(id)) {
				// Begin removal
				const newSelection = prev.filter(p => p !== id);

				// Free up color
				const newColors = { ...playerColors };
				delete newColors[id];
				setPlayerColors(newColors);

				return newSelection;
			}
			if (prev.length >= 5) return prev; // Max 5

			// Allocation
			const assignedColors = Object.values(playerColors);
			const availableColor = colors.find(c => !assignedColors.includes(c)) || colors[0];

			setPlayerColors(c => ({ ...c, [id]: availableColor }));

			return [...prev, id];
		});
	};

	// Helper mappings
	const positionMap = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
	const statusColorMap = {
		'a': 'bg-green-500',
		'd': 'bg-yellow-500',
		'i': 'bg-red-500',
		's': 'bg-red-600',
		'u': 'bg-gray-500',
		'n': 'bg-gray-400'
	};

	const selectedPlayersObjects = players.filter(p => selectedPlayers.includes(p.id));

	return (
		<div className="space-y-6">
			{/* Filter Section (Top) */}
			<div className="w-full bg-ds-card rounded-xl border border-ds-border p-4 shadow-sm">
				<h2 className="text-lg font-bold text-ds-text mb-4">Filters</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

					{/* Search */}
					<div>
						<label className="text-xs text-ds-text-muted font-bold uppercase mb-1 block">Player Search</label>
						<input
							type="text"
							placeholder="Name..."
							value={filters.search}
							onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
							className="w-full bg-ds-bg border border-ds-border rounded p-2 text-ds-text focus:border-ds-primary outline-none"
						/>
					</div>

					{/* Team Selector (Multi-select) */}
					<div className="relative h-fit group">
						<label className="text-xs text-ds-text-muted font-bold uppercase mb-1 block">Club</label>
						<div
							className={`w-full bg-ds-bg border border-ds-border rounded p-1.5 flex flex-wrap items-center gap-1.5 min-h-[38px] transition-colors ${isTeamDropdownOpen ? 'border-ds-primary ring-1 ring-ds-primary' : 'hover:border-ds-primary'}`}
							onClick={() => {
								if (!isTeamDropdownOpen) setIsTeamDropdownOpen(true);
								// document.getElementById('club-search-input')?.focus();
								setTimeout(() => inputRef.current?.focus(), 0);
							}}
						>
							{filters.team.map(teamCode => {
								const t = teams.find(x => x.code === teamCode);
								if (!t) return null;
								const logoUrl = `https://resources.premierleague.com/premierleague/badges/70/t${t.code}.png`;
								return (
									<span key={teamCode} className="bg-ds-primary/20 text-ds-primary border border-ds-primary/30 rounded px-1.5 py-0.5 text-xs flex items-center gap-1.5 animate-in zoom-in-90 duration-100">
										<img src={logoUrl} alt={t.short_name} className="w-4 h-4 object-contain" />
										<span className="font-bold">{t.short_name}</span>
										<button
											onClick={(e) => {
												e.stopPropagation();
												setFilters(prev => ({
													...prev,
													team: prev.team.filter(c => c !== teamCode)
												}));
											}}
											className="hover:text-ds-text focus:outline-none flex items-center"
										>
											<span className="leading-none text-[10px] font-bold">×</span>
										</button>
									</span>
								);
							})}
							<input
								ref={inputRef}
								id="club-search-input"
								type="text"
								value={teamInput}
								onChange={(e) => {
									setTeamInput(e.target.value);
									if (!isTeamDropdownOpen) setIsTeamDropdownOpen(true);
								}}
								onFocus={() => setIsTeamDropdownOpen(true)}
								placeholder={filters.team.length === 0 ? "Select Clubs..." : ""}
								className="bg-transparent border-none outline-none text-sm text-ds-text flex-1 min-w-[60px] placeholder:text-ds-text-muted/50"
							/>
							<div className="flex items-center gap-1 ml-auto pr-1">
								{filters.team.length > 0 && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											setFilters(prev => ({ ...prev, team: [] }));
											setTeamInput('');
										}}
										className="text-ds-text-muted hover:text-ds-text transition-colors p-0.5"
									>
										<span className="text-xs font-bold leading-none">×</span>
									</button>
								)}
								<div
									className="cursor-pointer p-0.5"
									onClick={(e) => {
										e.stopPropagation();
										if (isTeamDropdownOpen) {
											setIsTeamDropdownOpen(false);
										} else {
											setIsTeamDropdownOpen(true);
											setTimeout(() => inputRef.current?.focus(), 50);
										}
									}}
								>
									<ChevronDown size={14} className={`text-ds-text-muted transform transition-transform pointer-events-none ${isTeamDropdownOpen ? 'rotate-180' : ''}`} />
								</div>
							</div>
						</div>

						{isTeamDropdownOpen && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setIsTeamDropdownOpen(false)}
								/>
								<div className="absolute top-full left-0 mt-0 bg-ds-card border border-ds-border rounded-lg shadow-xl z-20 max-h-[300px] flex flex-col min-w-full w-80 overflow-hidden">
									<div className="overflow-y-auto custom-scrollbar p-1">
										{teams.filter(t => t.name.toLowerCase().includes(teamInput.toLowerCase())).map(t => {
											const isSelected = filters.team.includes(t.code);
											const logoUrl = `https://resources.premierleague.com/premierleague/badges/70/t${t.code}.png`;
											return (
												<div
													key={t.id}
													onClick={(e) => {
														e.stopPropagation();
														setTeamInput(''); // Clear input on selection
														setFilters(prev => {
															const current = prev.team;
															return {
																...prev,
																team: isSelected
																	? current.filter(c => c !== t.code)
																	: [...current, t.code]
															};
														});
													}}
													className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors text-sm ${isSelected ? 'bg-ds-primary/10 text-ds-text font-medium' : 'text-ds-text-muted hover:bg-ds-surface hover:text-ds-text'
														}`}
												>
													<div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'bg-ds-primary border-ds-primary' : 'border-ds-border'
														}`}>
														{isSelected && <Check size={10} className="text-white" />}
													</div>
													<img src={logoUrl} alt={t.short_name} className="w-5 h-5 object-contain" />
													<span className="truncate flex-1">{t.name}</span>
													<span className="text-xs text-ds-text-muted/50 font-mono">{t.short_name}</span>
												</div>
											);
										})}
										{teams.filter(t => t.name.toLowerCase().includes(teamInput.toLowerCase())).length === 0 && (
											<div className="p-3 text-center text-xs text-ds-text-muted">
												No clubs found.
											</div>
										)}
									</div>
								</div>
							</>
						)}
					</div>

					{/* Gameweek Slider */}
					<div>
						<GameweekRangeSlider
							start={filters.minGw}
							end={filters.maxGw}
							min={1}
							max={currentGw}
							onChange={({ start, end }) => setFilters(prev => ({ ...prev, minGw: start, maxGw: end }))}
						/>
					</div>

					{/* Venue & Position Group */}
					<div className="space-y-4">
						{/* Venue */}
						<div>
							<label className="text-xs text-ds-text-muted font-bold uppercase mb-2 block">Venue</label>
							<div className="flex flex-wrap gap-2">
								{['home', 'away'].map(v => (
									<button
										key={v}
										onClick={() => {
											setFilters(prev => {
												const current = Array.isArray(prev.venue) ? prev.venue : [];
												return {
													...prev,
													venue: current.includes(v)
														? current.filter(x => x !== v)
														: [...current, v]
												};
											});
										}}
										className={`px-3 py-1 rounded border text-sm transition-all capitalize ${filters.venue.includes(v)
											? 'bg-ds-primary border-ds-primary text-white'
											: 'bg-transparent border-ds-border text-ds-text-muted hover:border-ds-text'
											}`}
									>
										{v}
									</button>
								))}
							</div>
						</div>

						{/* Position */}
						<div>
							<label className="text-xs text-ds-text-muted font-bold uppercase mb-2 block">Position</label>
							<div className="flex flex-wrap gap-2">
								{[1, 2, 3, 4].map(p => (
									<button
										key={p}
										onClick={() => {
											if (p === 'all') {
												setFilters(prev => ({ ...prev, position: [] }));
											} else {
												setFilters(prev => {
													const current = Array.isArray(prev.position) ? prev.position : [];
													return {
														...prev,
														position: current.includes(p)
															? current.filter(x => x !== p)
															: [...current, p]
													};
												});
											}
										}}
										className={`px-3 py-1 rounded border text-sm transition-all ${(p === 'all' && (!filters.position || filters.position.length === 0 || filters.position === 'all')) ||
											(Array.isArray(filters.position) && filters.position.includes(p))
											? 'bg-ds-primary border-ds-primary text-white'
											: 'bg-transparent border-ds-border text-ds-text-muted hover:border-ds-text'
											}`}
									>
										{p === 'all' ? 'All' : positionMap[p]}
									</button>
								))}
							</div>
						</div>
					</div>

				</div>

				{/* Active Selection Summary (Inside Filters or below?) */}
				{selectedPlayers.length > 0 && (
					<div className="mt-4 pt-4 border-t border-ds-border">
						<div className="flex flex-wrap items-center gap-4">
							<span className="text-sm font-bold text-ds-text">Selected ({selectedPlayers.length}/5):</span>
							<div className="flex flex-wrap gap-2">
								{selectedPlayers.map(pid => {
									const p = players.find(x => x.id === pid);
									if (!p) return null;
									// Find color
									const color = playerColors[pid] || '#fff';
									return (
										<div key={pid} className="flex items-center gap-2 bg-ds-surface px-3 py-1 rounded-full border border-ds-border text-xs text-ds-text" style={{ borderColor: color }}>
											<div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
											<span>{p.web_name}</span>
											<button onClick={() => handleSelect(pid)} className="hover:text-red-400 ml-1">×</button>
										</div>
									)
								})}
							</div>
							<button onClick={() => setSelectedPlayers([])} className="text-xs text-red-400 hover:text-red-300 underline ml-auto">Clear All</button>
						</div>
					</div>
				)}
			</div>

			{/* Right Column: Results Table */}
			<div className="flex-1 bg-ds-card rounded-xl border border-ds-border shadow-sm overflow-hidden flex flex-col">
				<div className="p-4 border-b border-ds-border flex justify-between items-center bg-ds-surface/50">
					<h2 className="text-lg font-bold text-ds-text">
						Players <span className="text-ds-text-muted text-sm font-normal">({filteredPlayers.length})</span>
					</h2>
					<div className="text-xs text-ds-text-muted">
						Displaying aggregated stats for GW {filters.minGw}-{filters.maxGw} ({filters.venue})
					</div>
				</div>

				<div className="overflow-auto h-[800px]">
					<table className="w-full text-left border-collapse relative">
						<thead className="bg-ds-surface text-ds-text-muted text-xs uppercase sticky top-0 z-10 font-bold shadow-sm">
							<tr>
								<th className="p-3 w-10 text-center">
									<span className="sr-only">Select</span>
								</th>
								<th className="p-3 cursor-pointer hover:text-ds-text" onClick={() => handleSort('web_name')}>Player</th>
								<th className="p-3 cursor-pointer hover:text-ds-text" onClick={() => handleSort('element_type')}>Pos</th>
								<th className="p-3 cursor-pointer hover:text-ds-text" onClick={() => handleSort('team_short')}>Club</th>
								<th className="p-3 cursor-pointer hover:text-ds-text text-right" onClick={() => handleSort('now_cost')}>Price</th>
								<th className="p-3 cursor-pointer hover:text-ds-primary text-right text-ds-primary" onClick={() => handleSort('points_in_range')}>
									Pts (Range) {sortConfig.key === 'points_in_range' && (sortConfig.direction === 'desc' ? '▼' : '▲')}
								</th>
								<th className="p-3 cursor-pointer hover:text-ds-text text-right" onClick={() => handleSort('total_points')}>Total</th>
								<th className="p-3 text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-ds-border text-sm text-ds-text">
							{loading ? (
								<tr>
									<td colSpan="8" className="p-8 text-center text-ds-text-muted">
										<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ds-primary mb-2"></div>
										<p>Aggregating stats...</p>
									</td>
								</tr>
							) : (
								filteredPlayers.slice(0, 100).map(player => (
									<tr key={player.id} className={`hover:bg-ds-surface/50 transition-colors ${selectedPlayers.includes(player.id) ? 'bg-ds-primary/10' : ''}`}>
										<td className="p-3 text-center">
											<input
												type="checkbox"
												checked={selectedPlayers.includes(player.id)}
												onChange={() => handleSelect(player.id)}
												className="w-4 h-4 rounded border-ds-border text-ds-primary focus:ring-ds-primary cursor-pointer"
											/>
										</td>
										<td className="p-3 font-medium">
											<div className="group relative">
												<PlayerPopover
													player={{
														...player,
														name: player.web_name,
														full_name: player.full_name,
														team: player.team_short || player.team_name, // Fallback
														position: player.element_type,
														cost: player.now_cost,
														// Ensure code is present for image
													}}
												>
													<span className="cursor-help decoration-ds-text-muted/50 underline-offset-2 hover:underline hover:text-ds-primary transition-colors">
														{player.web_name}
													</span>
												</PlayerPopover>
											</div>
										</td>
										<td className="p-3 text-xs text-ds-text-muted">{positionMap[player.element_type]}</td>
										<td className="p-3 text-xs text-ds-text-muted">{player.team_short}</td>
										<td className="p-3 text-right font-mono">£{player.now_cost}m</td>
										<td className="p-3 text-right font-bold text-ds-primary">{player.points_in_range}</td>
										<td className="p-3 text-right text-ds-text-muted">{player.total_points}</td>
										<td className="p-3 text-center">
											<div className={`w-2 h-2 rounded-full mx-auto ${statusColorMap[player.status] || 'bg-green-500'}`} title={player.news || "Available"}></div>
										</td>
									</tr>
								))
							)}
							{!loading && filteredPlayers.length === 0 && (
								<tr>
									<td colSpan="8" className="p-8 text-center text-ds-text-muted">
										No players found matching filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
					{!loading && filteredPlayers.length > 100 && (
						<div className="p-2 text-center text-xs text-ds-text-muted border-t border-ds-border">
							Showing top 100 results. Refine filters to see more.
						</div>
					)}
				</div>
			</div>

			{/* Bottom: Inline Comparison Chart (if selected) */}
			{selectedPlayers.length > 0 && !loadingComparison && (
				<div className="animate-in fade-in slide-in-from-top-4 duration-500 w-full mb-8">
					<ComparisonChart data={comparisonData} players={selectedPlayersObjects} filters={filters} playerColors={playerColors} />
				</div>
			)
			}
		</div >
	);
};

export default PlayerExplorer;
