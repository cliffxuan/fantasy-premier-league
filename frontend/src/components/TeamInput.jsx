import React from 'react';

const TeamInput = ({ centered = false, teamId, setTeamId, handleGoClick, loading }) => (
	<div className={`flex w-full ${centered ? 'max-w-[400px]' : 'max-w-xs'} items-center gap-2 transition-all`}>
		<div className="relative group flex-1">
			<span className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-muted font-mono opacity-50 group-focus-within:opacity-100 transition-opacity">
				$
			</span>
			<input
				id="teamId"
				type="text"
				value={teamId}
				onChange={(e) => setTeamId(e.target.value)}
				placeholder={centered ? 'Enter FPL Team ID' : 'Team ID'}
				className={`bg-ds-surface border border-ds-border rounded-md px-4 pl-8 text-sm outline-none focus:border-ds-primary focus:ring-1 focus:ring-ds-primary transition-all w-full placeholder-ds-text-muted/50 font-mono ${centered ? 'py-3 text-lg' : 'py-2'}`}
				onKeyDown={(e) => e.key === 'Enter' && handleGoClick()}
			/>
		</div>
		<button
			type="button"
			className={`bg-ds-primary text-white font-bold rounded-md hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider ${centered ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'}`}
			onClick={handleGoClick}
			disabled={loading}
		>
			{loading ? '...' : 'GO'}
		</button>
	</div>
);

export default TeamInput;
