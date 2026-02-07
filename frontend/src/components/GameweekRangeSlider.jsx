import React from 'react';

const GameweekRangeSlider = ({ start, end, min = 1, max = 38, onChange }) => {
	// Use refs only for stable calculations if needed, but for controlled, props are source of truth.
	// We don't need internal state.

	const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

	const minPercent = getPercent(start);
	const maxPercent = getPercent(end);

	return (
		<div className="flex flex-col gap-4 p-4 bg-ds-surface rounded-lg border border-ds-border">
			<div className="flex justify-between items-center mb-2">
				<span className="text-xs font-bold text-ds-text-muted uppercase">GW Range</span>
				<div className="flex gap-1 items-center">
					<span className="text-xs font-mono text-ds-text bg-ds-bg px-2 py-0.5 rounded border border-ds-border">
						{start}
					</span>
					<span className="text-ds-text-muted text-xs">-</span>
					<span className="text-xs font-mono text-ds-text bg-ds-bg px-2 py-0.5 rounded border border-ds-border">
						{end}
					</span>
				</div>
			</div>

			<div className="relative w-full h-2 rounded-full bg-ds-border mt-2">
				<div
					className="absolute h-2 rounded-full bg-ds-primary z-10"
					style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
				/>
				{/* Left Thumb Input */}
				<input
					type="range"
					min={min}
					max={max}
					value={start}
					onChange={(event) => {
						const value = Math.min(Number(event.target.value), end);
						onChange({ start: value, end });
					}}
					className="thumb thumb--left absolute z-20 w-full h-0 outline-none -top-[5px]"
					style={{
						zIndex: start > max - 10 ? 50 : 20,
						pointerEvents: 'none',
					}}
				/>
				{/* Right Thumb Input */}
				<input
					type="range"
					min={min}
					max={max}
					value={end}
					onChange={(event) => {
						const value = Math.max(Number(event.target.value), start);
						onChange({ start, end: value });
					}}
					className="thumb thumb--right absolute z-20 w-full h-0 outline-none -top-[5px]"
					style={{
						zIndex: 30,
						pointerEvents: 'none',
					}}
				/>
			</div>

			<style>{`
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          background-color: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: auto; /* ENABLE POINTER EVENTS FOR THUMB */
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .thumb::-moz-range-thumb {
          background-color: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          height: 18px;
          width: 18px;
          margin-top: 4px;
          pointer-events: auto; /* ENABLE POINTER EVENTS FOR THUMB */
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input[type=range]::-webkit-slider-runnable-track {
            -webkit-appearance: none;
            box-shadow: none;
            border: none;
            background: transparent;
        }
      `}</style>
		</div>
	);
};

export default GameweekRangeSlider;
