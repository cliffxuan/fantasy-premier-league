import { describe, it, expect } from 'vitest';
import { getPositionName, getFdrColor, getStatusColor, getFdrBadgeClass, getFdrCardClass } from './utils';

describe('getPositionName', () => {
	it('maps element types to position abbreviations', () => {
		expect(getPositionName(1)).toBe('GKP');
		expect(getPositionName(2)).toBe('DEF');
		expect(getPositionName(3)).toBe('MID');
		expect(getPositionName(4)).toBe('FWD');
	});

	it('returns Unknown for invalid type', () => {
		expect(getPositionName(0)).toBe('Unknown');
		expect(getPositionName(99)).toBe('Unknown');
	});
});

describe('getFdrColor', () => {
	it('returns green for easy fixtures', () => {
		expect(getFdrColor(1)).toBe('#00ff87');
		expect(getFdrColor(2)).toBe('#01fc7a');
	});

	it('returns neutral for medium fixtures', () => {
		expect(getFdrColor(3)).toBe('#e7e7e7');
	});

	it('returns red for hard fixtures', () => {
		expect(getFdrColor(4)).toBe('#ff1751');
		expect(getFdrColor(5)).toBe('#861d46');
	});

	it('returns default for unknown difficulty', () => {
		expect(getFdrColor(0)).toBe('#e7e7e7');
		expect(getFdrColor(99)).toBe('#e7e7e7');
	});
});

describe('getStatusColor', () => {
	it('returns null for available players', () => {
		expect(getStatusColor('a')).toBeNull();
	});

	it('returns yellow for doubtful', () => {
		expect(getStatusColor('d')).toBe('#FFD700');
	});

	it('returns red for injured/suspended/unavailable', () => {
		expect(getStatusColor('i')).toBe('#ff4444');
		expect(getStatusColor('s')).toBe('#ff4444');
		expect(getStatusColor('u')).toBe('#ff4444');
	});

	it('returns null for unknown status', () => {
		expect(getStatusColor('x')).toBeNull();
	});
});

describe('getFdrBadgeClass', () => {
	it('returns accent class for easy fixtures', () => {
		expect(getFdrBadgeClass(1)).toContain('ds-accent');
		expect(getFdrBadgeClass(2)).toContain('ds-accent');
	});

	it('returns gray class for medium fixtures', () => {
		expect(getFdrBadgeClass(3)).toContain('gray');
	});

	it('returns warning class for hard fixtures', () => {
		expect(getFdrBadgeClass(4)).toContain('ds-warning');
	});

	it('returns danger class for very hard fixtures', () => {
		expect(getFdrBadgeClass(5)).toContain('ds-danger');
	});
});

describe('getFdrCardClass', () => {
	it('returns accent for easy', () => {
		expect(getFdrCardClass(1)).toContain('ds-accent');
	});

	it('returns gray for medium', () => {
		expect(getFdrCardClass(3)).toContain('gray');
	});

	it('returns danger for very hard', () => {
		expect(getFdrCardClass(5)).toContain('ds-danger');
	});
});
