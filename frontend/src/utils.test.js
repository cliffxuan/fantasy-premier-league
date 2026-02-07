import { describe, it, expect } from 'vitest';
import { getPlayerImage, getTeamBadgeUrl, PROBABILITY_COLORS } from './utils';

describe('getPlayerImage', () => {
	it('returns correct URL with default size', () => {
		const url = getPlayerImage(12345);
		expect(url).toBe('https://resources.premierleague.com/premierleague25/photos/players/110x140/12345.png');
	});

	it('returns correct URL with custom size', () => {
		const url = getPlayerImage(12345, '250x250');
		expect(url).toBe('https://resources.premierleague.com/premierleague25/photos/players/250x250/12345.png');
	});
});

describe('getTeamBadgeUrl', () => {
	it('returns correct URL with default size', () => {
		const url = getTeamBadgeUrl(3);
		expect(url).toBe('https://resources.premierleague.com/premierleague/badges/50/t3.png');
	});

	it('returns correct URL with custom size', () => {
		const url = getTeamBadgeUrl(3, '100');
		expect(url).toBe('https://resources.premierleague.com/premierleague/badges/100/t3.png');
	});

	it('returns null for falsy code', () => {
		expect(getTeamBadgeUrl(null)).toBeNull();
		expect(getTeamBadgeUrl(undefined)).toBeNull();
		expect(getTeamBadgeUrl(0)).toBeNull();
	});
});

describe('PROBABILITY_COLORS', () => {
	it('has HIGH, MEDIUM, and LOW keys', () => {
		expect(PROBABILITY_COLORS).toHaveProperty('HIGH');
		expect(PROBABILITY_COLORS).toHaveProperty('MEDIUM');
		expect(PROBABILITY_COLORS).toHaveProperty('LOW');
	});

	it('each color has bg, text, border, label', () => {
		for (const level of Object.values(PROBABILITY_COLORS)) {
			expect(level).toHaveProperty('bg');
			expect(level).toHaveProperty('text');
			expect(level).toHaveProperty('border');
			expect(level).toHaveProperty('label');
		}
	});
});
