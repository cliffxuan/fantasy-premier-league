import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PointsHistoryChart = ({ history }) => {
	const [viewMode, setViewMode] = React.useState('weekly'); // 'weekly' or 'cumulative'

	if (!history || history.length === 0) return null;

	return (
		<div className="bg-ds-card rounded-xl p-6 border border-ds-border shadow-sm h-[350px]">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-bold text-ds-text flex items-center gap-2">
					<span className="text-ds-primary">📈</span> Points History
				</h3>
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
			<div className="w-full h-[250px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={history}>
						<CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
						<XAxis
							dataKey="event"
							stroke="#666"
							tick={{ fill: '#888', fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							label={{ value: 'GW', position: 'insideBottomRight', offset: -5, fill: '#666', fontSize: 10 }}
						/>
						<YAxis
							stroke="#666"
							tick={{ fill: '#888', fontSize: 12 }}
							tickLine={false}
							axisLine={false}
						/>
						<Tooltip
							contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
							itemStyle={{ color: '#f8fafc' }}
							labelStyle={{ color: '#94a3b8' }}
							formatter={(value) => [`${value} pts`, viewMode === 'weekly' ? 'Points' : 'Total Points']}
							labelFormatter={(label) => `Gameweek ${label}`}
						/>
						<Line
							type="monotone"
							dataKey={viewMode === 'weekly' ? "points" : "total_points"}
							stroke="#3b82f6"
							strokeWidth={2}
							dot={{ r: 3, fill: '#3b82f6' }}
							activeDot={{ r: 5, fill: '#60a5fa' }}
							animationDuration={500}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default PointsHistoryChart;
