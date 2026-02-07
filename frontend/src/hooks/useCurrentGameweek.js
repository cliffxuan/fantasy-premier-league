import { useState, useEffect } from 'react';

export default function useCurrentGameweek() {
  const [gameweek, setGameweek] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGW = async () => {
      try {
        const response = await fetch('/api/gameweek/current');
        if (response.ok) {
          const data = await response.json();
          setGameweek(data.gameweek);
          setStatus(data.status || null);
        }
      } catch (error) {
        console.error('Failed to fetch gameweek:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGW();
  }, []);

  return { gameweek, status, loading };
}
