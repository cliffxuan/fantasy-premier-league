import React, { useMemo } from 'react';

/**
 * Shared pitch background and position grouping layout.
 *
 * @param {Object} props
 * @param {Array} props.players - Array of player objects (must have .position field)
 * @param {Function} props.renderCard - Render function: (player, index) => JSX
 * @param {string} [props.className] - Additional classes for the pitch container
 */
const PitchView = ({ players, renderCard, className = '' }) => {
	const { gkp, def, mid, fwd } = useMemo(
		() => ({
			gkp: players.filter((p) => p.position === 1),
			def: players.filter((p) => p.position === 2),
			mid: players.filter((p) => p.position === 3),
			fwd: players.filter((p) => p.position === 4),
		}),
		[players],
	);

	return (
		<div
			className={`bg-ds-card rounded-xl p-2 md:p-8 relative border border-ds-border min-h-[500px] md:min-h-[600px] flex flex-col justify-between overflow-hidden ${className}`}
		>
			{/* Pitch Pattern Overlay */}
			<div
				className="absolute inset-0 opacity-5 pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)`,
					backgroundSize: '100px 100px',
				}}
			></div>
			{/* Center Circle */}
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/5 rounded-full pointer-events-none"></div>
			{/* Halfway Line */}
			<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 pointer-events-none"></div>

			<div className="flex justify-center gap-1 md:gap-4 z-10">
				{gkp.map((p, i) => (
					<React.Fragment key={p.id || `gkp-${i}`}>{renderCard(p, i)}</React.Fragment>
				))}
			</div>
			<div className="flex justify-center gap-1 md:gap-4 z-10">
				{def.map((p, i) => (
					<React.Fragment key={p.id || `def-${i}`}>{renderCard(p, i)}</React.Fragment>
				))}
			</div>
			<div className="flex justify-center gap-1 md:gap-4 z-10">
				{mid.map((p, i) => (
					<React.Fragment key={p.id || `mid-${i}`}>{renderCard(p, i)}</React.Fragment>
				))}
			</div>
			<div className="flex justify-center gap-1 md:gap-4 z-10">
				{fwd.map((p, i) => (
					<React.Fragment key={p.id || `fwd-${i}`}>{renderCard(p, i)}</React.Fragment>
				))}
			</div>
		</div>
	);
};

export default PitchView;
