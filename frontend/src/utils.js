export const getPlayerImage = (code, size = '110x140') =>
	`https://resources.premierleague.com/premierleague25/photos/players/${size}/${code}.png`;

export const handlePlayerImageError = (e, player, size = '110x140') => {
	const currentSrc = e.target.src;
	if (currentSrc.includes('premierleague/photos')) {
		// Try premierleague with 'p'
		e.target.src = `https://resources.premierleague.com/premierleague/photos/players/${size}/p${player.code}.png`;
	} else {
		// Fallback to shirt (if it was some other url)
		e.target.src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-66.png`;
	}
};

export const getTeamBadgeUrl = (code, size = '50') => {
	if (!code) return null;
	return `https://resources.premierleague.com/premierleague/badges/${size}/t${code}.png`;
};

export const PROBABILITY_COLORS = {
	HIGH: {
		bg: 'bg-green-500/10',
		text: 'text-green-400',
		border: 'border-green-500/30',
		label: 'text-green-400/60',
	},
	MEDIUM: {
		bg: 'bg-blue-500/10',
		text: 'text-blue-400',
		border: 'border-blue-500/30',
		label: 'text-blue-400/60',
	},
	LOW: {
		bg: 'bg-ds-surface',
		text: 'text-ds-text-muted',
		border: 'border-ds-border',
		label: 'text-ds-text-muted/60',
	},
};
