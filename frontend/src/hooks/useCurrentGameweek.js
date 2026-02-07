import { useCurrentGameweek as useCurrentGameweekQuery } from './queries';

export default function useCurrentGameweek() {
	const { data, isLoading } = useCurrentGameweekQuery();
	return {
		gameweek: data?.gameweek ?? null,
		status: data?.status ?? null,
		loading: isLoading,
	};
}
