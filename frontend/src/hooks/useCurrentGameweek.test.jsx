import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useCurrentGameweek from './useCurrentGameweek';

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useCurrentGameweek', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('starts with loading=true and null gameweek', () => {
		vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
		const { result } = renderHook(() => useCurrentGameweek(), { wrapper: createWrapper() });
		expect(result.current.loading).toBe(true);
		expect(result.current.gameweek).toBeNull();
	});

	it('fetches and sets gameweek on success', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ gameweek: 15, status: { id: 15, name: 'Gameweek 15' } }),
		});

		const { result } = renderHook(() => useCurrentGameweek(), { wrapper: createWrapper() });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.gameweek).toBe(15);
		expect(result.current.status).toEqual({ id: 15, name: 'Gameweek 15' });
	});

	it('handles fetch failure gracefully', async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
		vi.spyOn(console, 'error').mockImplementation(() => {});

		const { result } = renderHook(() => useCurrentGameweek(), { wrapper: createWrapper() });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.gameweek).toBeNull();
	});

	it('handles non-ok response', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false });

		const { result } = renderHook(() => useCurrentGameweek(), { wrapper: createWrapper() });

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.gameweek).toBeNull();
	});
});
