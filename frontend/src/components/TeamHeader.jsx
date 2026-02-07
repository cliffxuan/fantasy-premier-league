import React from 'react';

const TeamHeader = ({ entry, freeTransfers, isPrivate, transferDetails }) => {
	if (!entry || !entry.name) return null;

	const {
		name,
		player_first_name,
		player_last_name,
		last_deadline_value,
		last_deadline_bank,
		summary_overall_points,
		summary_overall_rank,
		club_badge_src,
	} = entry;

	let teamValue = last_deadline_value;
	if (transferDetails && transferDetails.value !== undefined) {
		teamValue = transferDetails.value;
	}
	const value = (teamValue / 10).toFixed(1);

	let bankValue = last_deadline_bank;
	if (transferDetails && transferDetails.bank !== undefined) {
		bankValue = transferDetails.bank;
	}
	const bank = (bankValue / 10).toFixed(1);

	return (
		<div className="bg-ds-card rounded-xl p-6 border border-ds-border shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
			{/* Private Data Indicator */}
			{isPrivate && (
				<div className="absolute top-0 right-0 bg-ds-primary/10 text-ds-primary text-[10px] font-bold px-3 py-1 rounded-bl-lg border-b border-l border-ds-primary/20 flex items-center gap-1">
					<span>🔒</span> AUTHENTICATED
				</div>
			)}

			<div className="flex items-center gap-4">
				{club_badge_src && (
					<div className="w-16 h-16 bg-ds-bg rounded-full flex items-center justify-center border border-ds-border p-2">
						<img src={club_badge_src} alt="Club Badge" className="w-full h-full object-contain" />
					</div>
				)}
				<div className="text-center md:text-left">
					<h2 className="text-2xl font-bold text-ds-text flex items-center gap-2">{name}</h2>
					<p className="text-ds-text-muted font-mono text-sm">
						{player_first_name} {player_last_name}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full md:w-auto mt-4 md:mt-0">
				<div className="bg-ds-bg p-3 rounded-lg border border-ds-border text-center">
					<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Points</div>
					<div className="text-xl font-bold text-ds-primary">{summary_overall_points}</div>
				</div>
				<div className="bg-ds-bg p-3 rounded-lg border border-ds-border text-center">
					<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Rank</div>
					<div className="text-xl font-bold text-ds-text">{summary_overall_rank?.toLocaleString()}</div>
				</div>
				<div className="bg-ds-bg p-3 rounded-lg border border-ds-border text-center">
					<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Value</div>
					<div className="text-xl font-bold text-ds-text">£{value}m</div>
				</div>
				<div className="bg-ds-bg p-3 rounded-lg border border-ds-border text-center">
					<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Bank</div>
					<div className="text-xl font-bold text-ds-text">£{bank}m</div>
				</div>
				<div className="bg-ds-bg p-3 rounded-lg border border-ds-border text-center">
					<div className="text-xs text-ds-text-muted uppercase tracking-wider mb-1">Free Transfer</div>
					<div className="text-xl font-bold text-ds-text">{freeTransfers}</div>
				</div>
			</div>
		</div>
	);
};

export default TeamHeader;
