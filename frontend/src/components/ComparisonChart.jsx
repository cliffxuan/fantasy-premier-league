import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ComparisonChart = ({ data, players, filters, playerColors }) => {
	const [viewMode, setViewMode] = useState('weekly'); // 'weekly' | 'cumulative'

	// Define colors for up to 5 players
	const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

	const chartData = useMemo(() => {
		if (!data || data.length === 0) return [];

		const minGw = filters?.minGw || 1;
		const maxGw = filters?.maxGw || 38;
		const venue = filters?.venue || 'both';

		// Pre-index player history by round for O(1) lookups
		const indexedData = {};
		const allGws = new Set();
		for (const [pid, pHistory] of Object.entries(data)) {
			const byRound = new Map();
			for (const h of pHistory) {
				byRound.set(h.round, h);
				allGws.add(h.round);
			}
			indexedData[pid] = byRound;
		}

		const gws = Array.from(allGws)
			.filter((gw) => gw >= minGw && gw <= maxGw)
			.sort((a, b) => a - b);

		const cumulative = {};
		players.forEach((p) => (cumulative[p.id] = 0));

		const result = [];
		gws.forEach((gw) => {
			const point = { gw };
			players.forEach((p) => {
				const gwData = indexedData[p.id]?.get(gw);

				let weekPoints = 0;
				let isValidVenue = true;

				if (gwData) {
					if (venue === 'home' && !gwData.was_home) isValidVenue = false;
					if (venue === 'away' && gwData.was_home) isValidVenue = false;

					if (isValidVenue) {
						weekPoints = gwData.total_points;
					}
				} else {
					isValidVenue = false;
				}

				if (viewMode === 'weekly') {
					point[p.id] = isValidVenue ? weekPoints : null;
				} else {
					if (isValidVenue) {
						cumulative[p.id] += weekPoints;
					}
					point[p.id] = cumulative[p.id];
				}
			});
			result.push(point);
		});

		return result;
	}, [data, players, viewMode, filters]);

	if (!data || Object.keys(data).length === 0) return null;

	return (
		<div className="bg-ds-surface rounded-xl border border-ds-border p-4">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-sm font-bold text-ds-text uppercase tracking-wider">Points Projection</h3>
				<div className="flex bg-ds-bg rounded-lg p-1 border border-ds-border">
					<button
						onClick={() => setViewMode('weekly')}
						className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'weekly' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
					>
						Weekly
					</button>
					<button
						onClick={() => setViewMode('cumulative')}
						className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'cumulative' ? 'bg-ds-primary text-white shadow-sm' : 'text-ds-text-muted hover:text-ds-text'}`}
					>
						Cumulative
					</button>
				</div>
			</div>

			<div className="w-full h-[300px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
						<XAxis dataKey="gw" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
						<YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
						<Tooltip
							contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
							itemStyle={{ fontSize: '12px' }}
							labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
							formatter={(value, name) => {
								if (!players) return [value, name];
								// Name is key (id), map to player name
								const valStr = name != null ? name.toString() : '';
								const p = players.find((x) => x && x.id != null && x.id.toString() === valStr);
								return [value, p ? p.web_name : name];
							}}
							labelFormatter={(label) => `Gameweek ${label}`}
						/>
						<Legend
							formatter={(value) => {
								if (!players) return value;
								const valStr = value != null ? value.toString() : '';
								const p = players.find((x) => x && x.id != null && x.id.toString() === valStr);
								return p ? p.web_name : value;
							}}
							wrapperStyle={{ paddingTop: '10px' }}
						/>
						{players.map((p) => {
							// Use a deterministic color based on ID to ensure consistency
							// Simple hash: ID % colors.length
							// const colorIndex = p.id % colors.length;
							// Better: use color assigned by parent
							const color = playerColors[p.id] || colors[0];
							return (
								<Line
									key={p.id}
									name={p.web_name}
									type="monotone"
									dataKey={p.id}
									stroke={color}
									strokeWidth={2}
									dot={{ r: 3, fill: color }}
									activeDot={{ r: 5 }}
									animationDuration={500}
									connectNulls
								/>
							);
						})}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default ComparisonChart;
