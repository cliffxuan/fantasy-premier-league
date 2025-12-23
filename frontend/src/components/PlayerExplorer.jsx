import React, { useState, useEffect, useMemo } from 'react';
import GameweekRangeSlider from './GameweekRangeSlider';
import PlayerPopover from './PlayerPopover';
import ComparisonChart from './ComparisonChart';
import { getPlayerSummary } from '../api';

const PlayerExplorer = () => {
	const [players, setPlayers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [currentGw, setCurrentGw] = useState(38);
	const [filters, setFilters] = useState({
		minGw: 1,
		maxGw: 38,
		venue: ['home', 'away'], // Default all selected
		search: '',
		position: [1, 2, 3, 4], // Default to all explicit positions
		team: 'all'
	});

	const [selectedPlayers, setSelectedPlayers] = useState([]); // List of IDs
	const [showComparison, setShowComparison] = useState(false);
	const [sortConfig, setSortConfig] = useState({ key: 'points_in_range', direction: 'desc' });

	// Comparison Data
	const [comparisonData, setComparisonData] = useState({}); // { pid: history[] }
	const [loadingComparison, setLoadingComparison] = useState(false);

	// Fetch Current Gameweek on Mount
	useEffect(() => {
		const fetchGw = async () => {
			try {
				const res = await fetch('/api/gameweek/current');
				if (res.ok) {
					const data = await res.json();
					const gw = data.gameweek || 38;
					setCurrentGw(gw);
					setFilters(prev => ({ ...prev, maxGw: gw }));
				}
			} catch (e) {
				console.error("Failed to fetch current GW", e);
			}
		};
		fetchGw();
	}, []);

	// Fetch Players when filters (range/venue) change
	useEffect(() => {
		const fetchPlayers = async () => {
			setLoading(true);
			try {
				const venueParam = filters.venue.length === 2 ? 'both' : (filters.venue[0] || 'both');
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

		if (filters.team !== 'all') {
			result = result.filter(p => p.team_code === parseInt(filters.team));
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
					</div>

					<div className="space-y-4">
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
								<th className="p-3 cursor-pointer hover:text-ds-text" onClick={() => handleSort('team_short')}>Team</th>
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
												{player.web_name}
												{/* Hover info could go here or use PlayerPopover separately */}
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
