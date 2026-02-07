import React from 'react';
import useCurrentGameweek from '../hooks/useCurrentGameweek';
import { useFixtures } from '../hooks/queries';

const LiveFixtures = () => {
	const { gameweek: gw } = useCurrentGameweek();
	const { data: fixtures = [], isLoading: loading } = useFixtures(gw, { poll: true });

	if (loading) return <div className="text-center p-4 text-ds-text-muted animate-pulse">Loading Live Scores...</div>;

	// Sort all fixtures chronologically
	const sortedFixtures = [...fixtures].sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));

	// Helper for badge
	const TeamBadge = ({ code }) => (
		<img
			src={`https://resources.premierleague.com/premierleague/badges/50/t${code}.png`}
			alt="Badge"
			loading="lazy"
			className="w-6 h-6 md:w-8 md:h-8 object-contain"
			onError={(e) => (e.target.style.display = 'none')}
		/>
	);

	const FixtureRow = ({ f }) => {
		const isLive = f.started && !f.finished_provisional;
		return (
			<div
				className={`flex items-center justify-between p-3 md:p-4 rounded-lg transform transition-all hover:scale-[1.01] ${isLive ? 'bg-ds-card border-l-4 border-l-green-500 border-y border-r border-ds-border shadow-md' : 'bg-ds-card/50 border border-ds-border'}`}
			>
				<div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
					<span className="font-bold text-sm md:text-base text-right leading-tight">{f.team_h_name}</span>
					<TeamBadge code={f.team_h_code} />
				</div>

				<div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px] px-2">
					{f.started ? (
						<div className="flex flex-col items-center">
							<div
								className={`flex items-center gap-1 font-mono text-xl md:text-2xl font-bold ${isLive ? 'text-white' : 'text-ds-text-muted'}`}
							>
								<span>{f.team_h_score}</span>
								<span className="text-ds-text-muted/50">-</span>
								<span>{f.team_a_score}</span>
							</div>
							{isLive && <span className="text-[10px] text-green-400 font-bold animate-pulse mt-1">{f.minutes}'</span>}
							{f.finished_provisional && <span className="text-[10px] text-ds-text-muted font-bold mt-1">FT</span>}
						</div>
					) : (
						<div className="flex flex-col items-center">
							<div className="text-xs md:text-sm font-mono bg-ds-surface px-2 py-1 rounded text-ds-text-muted border border-ds-border">
								{new Date(f.kickoff_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 md:gap-4 flex-1 justify-start">
					<TeamBadge code={f.team_a_code} />
					<span className="font-bold text-sm md:text-base text-left leading-tight">{f.team_a_name}</span>
				</div>
			</div>
		);
	};

	return (
		<div className="bg-ds-card/30 rounded-xl p-4 md:p-6 border border-ds-border/50">
			<h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-ds-text">
				<span className="text-green-500 text-2xl animate-pulse">●</span>
				<span>Gameweek {gw}</span>
				<span className="text-xs font-normal text-ds-text-muted bg-ds-surface px-2 py-1 rounded-full border border-ds-border/50">
					LIVE
				</span>
			</h3>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
				{sortedFixtures.map((f) => (
					<FixtureRow key={f.id} f={f} />
				))}
			</div>

			{fixtures.length === 0 && (
				<div className="text-ds-text-muted text-center py-8">No specific fixtures found for this Gameweek.</div>
			)}
		</div>
	);
};

export default LiveFixtures;
