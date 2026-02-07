// Shared utility functions for FPL components
// Extracted from duplicated logic across SquadDisplay, DreamTeam, PlayerPopover,
// TeamPopover, PlayerExplorer, FormAnalysis, Solver, TopManagersAnalysis, ClubViewer

// Position type to name mapping (used in SquadDisplay, DreamTeam, PlayerPopover, TeamPopover, PlayerExplorer)
export function getPositionName(elementType) {
	const positions = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };
	return positions[elementType] || 'Unknown';
}

// FDR difficulty color (used in ClubViewer, SquadDisplay, and elsewhere)
export function getFdrColor(difficulty) {
	switch (difficulty) {
		case 1:
			return '#00ff87';
		case 2:
			return '#01fc7a';
		case 3:
			return '#e7e7e7';
		case 4:
			return '#ff1751';
		case 5:
			return '#861d46';
		default:
			return '#e7e7e7';
	}
}

// Status badge color
export function getStatusColor(status) {
	switch (status) {
		case 'a':
			return null; // available, no badge needed
		case 'd':
			return '#FFD700'; // doubtful
		case 'i':
			return '#ff4444'; // injured
		case 's':
			return '#ff4444'; // suspended
		case 'u':
			return '#ff4444'; // unavailable
		default:
			return null;
	}
}

// FDR difficulty to Tailwind CSS classes for inline badge styling
// Used by SquadDisplay, PlayerPopover for fixture difficulty badges
export function getFdrBadgeClass(difficulty) {
	if (difficulty <= 2) return 'bg-ds-accent/20 text-ds-accent';
	if (difficulty === 3) return 'bg-gray-500/20 text-gray-400';
	if (difficulty === 4) return 'bg-ds-warning/20 text-ds-warning';
	return 'bg-ds-danger/20 text-ds-danger';
}

// FDR difficulty to Tailwind CSS classes for popover fixture cards
// Used by TeamPopover for upcoming fixture difficulty badges
export function getFdrCardClass(difficulty) {
	if (difficulty <= 2) return 'bg-ds-accent text-white';
	if (difficulty === 3) return 'bg-gray-400 text-white';
	if (difficulty === 4) return 'bg-ds-warning text-white';
	return 'bg-ds-danger text-white';
}

// FDR difficulty to Tailwind CSS classes for ClubViewer fixture table
export function getFdrTableClass(difficulty) {
	switch (difficulty) {
		case 1:
			return 'bg-[#375523] text-white border-[#375523]';
		case 2:
			return 'bg-[#01fc7a] text-black border-[#01fc7a]';
		case 3:
			return 'bg-[#e7e7e7] text-black border-[#e7e7e7]';
		case 4:
			return 'bg-[#ff1751] text-white border-[#ff1751]';
		case 5:
			return 'bg-[#80072d] text-white border-[#80072d]';
		default:
			return 'bg-ds-surface border-ds-border text-ds-text-muted';
	}
}

// Status to Tailwind CSS classes for status indicator badges
// Used by SquadDisplay, DreamTeam for player status indicators
export function getStatusBadgeClass(status) {
	switch (status) {
		case 'd':
			return 'bg-yellow-500 text-black';
		case 'i':
			return 'bg-red-500 text-white';
		case 'u':
			return 'bg-orange-500 text-white';
		default:
			return 'bg-gray-500 text-white';
	}
}
