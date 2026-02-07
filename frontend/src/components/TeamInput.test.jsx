import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamInput from './TeamInput';

describe('TeamInput', () => {
	const defaultProps = {
		teamId: '',
		setTeamId: vi.fn(),
		handleGoClick: vi.fn(),
		loading: false,
	};

	it('renders input and button', () => {
		render(<TeamInput {...defaultProps} />);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
	});

	it('displays current teamId value', () => {
		render(<TeamInput {...defaultProps} teamId="12345" />);
		expect(screen.getByRole('textbox')).toHaveValue('12345');
	});

	it('calls setTeamId on input change', () => {
		const setTeamId = vi.fn();
		render(<TeamInput {...defaultProps} setTeamId={setTeamId} />);
		fireEvent.change(screen.getByRole('textbox'), { target: { value: '99' } });
		expect(setTeamId).toHaveBeenCalledWith('99');
	});

	it('calls handleGoClick on Enter key', () => {
		const handleGoClick = vi.fn();
		render(<TeamInput {...defaultProps} handleGoClick={handleGoClick} />);
		fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
		expect(handleGoClick).toHaveBeenCalled();
	});

	it('calls handleGoClick on button click', () => {
		const handleGoClick = vi.fn();
		render(<TeamInput {...defaultProps} handleGoClick={handleGoClick} />);
		fireEvent.click(screen.getByRole('button', { name: /go/i }));
		expect(handleGoClick).toHaveBeenCalled();
	});

	it('disables button when loading', () => {
		render(<TeamInput {...defaultProps} loading={true} />);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	it('shows ... when loading', () => {
		render(<TeamInput {...defaultProps} loading={true} />);
		expect(screen.getByRole('button')).toHaveTextContent('...');
	});

	it('shows GO when not loading', () => {
		render(<TeamInput {...defaultProps} loading={false} />);
		expect(screen.getByRole('button')).toHaveTextContent('GO');
	});
});
