import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { analyzeTeam, getSquad } from './api';
import AnalysisResult from './components/AnalysisResult';
import SquadDisplay from './components/SquadDisplay';

import LeagueTable from './components/LeagueTable';

function Dashboard() {
  const { teamId: paramTeamId } = useParams();
  const navigate = useNavigate();

  const [teamId, setTeamId] = useState(paramTeamId || '');
  const [moneyInBank, setMoneyInBank] = useState('0.5');
  const [freeTransfers, setFreeTransfers] = useState('1');
  const [transfersRolled, setTransfersRolled] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [squad, setSquad] = useState(null);
  const [chips, setChips] = useState([]);
  const [isTeamLoaded, setIsTeamLoaded] = useState(false);

  // Fetch squad when URL param changes
  useEffect(() => {
    if (paramTeamId) {
      setTeamId(paramTeamId);
      fetchSquad(paramTeamId);
    } else {
      setTeamId('');
      setSquad(null);
      setChips([]);
      setIsTeamLoaded(false);
      setResult(null);
    }
  }, [paramTeamId]);

  const fetchSquad = async (id) => {
    setLoading(true);
    setError(null);
    setSquad(null);
    setChips([]);
    setIsTeamLoaded(false);
    setResult(null);

    try {
      const squadData = await getSquad(id);
      if (squadData && squadData.squad) {
        setSquad(squadData.squad);
        setChips(squadData.chips || []);
        setIsTeamLoaded(true);
      } else {
        setError('Failed to fetch team. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoClick = () => {
    if (teamId) {
      navigate(`/${teamId}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeTeam(teamId, moneyInBank, freeTransfers, transfersRolled);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ds-bg text-ds-text font-sans selection:bg-ds-primary selection:text-white">
      <div className="border-b border-ds-border bg-ds-card/50 backdrop-blur-sm py-12 px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-ds-text">
          <span className="text-ds-primary">FPL</span> Assistant
        </h1>
        <p className="text-lg font-mono text-ds-text-muted mb-8">
          Data-driven insights for your Fantasy Premier League team.
        </p>

        <div className="flex w-full max-w-[600px] bg-ds-bg border border-ds-border rounded-lg p-1 focus-within:border-ds-primary focus-within:ring-1 focus-within:ring-ds-primary transition-all shadow-lg">
          <span className="flex items-center pl-4 text-ds-text-muted font-mono select-none">$</span>
          <input
            id="teamId"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="enter_team_id"
            className="flex-1 bg-transparent border-none p-3 text-lg outline-none text-ds-text font-mono placeholder-ds-text-muted/50"
            onKeyDown={(e) => e.key === 'Enter' && handleGoClick()}
          />
          <button
            type="button"
            className="bg-ds-primary text-white font-bold px-6 py-2 rounded-md hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-wider"
            onClick={handleGoClick}
            disabled={loading}
          >
            {loading ? 'LOADING...' : 'ANALYZE'}
          </button>
        </div>
        {error && !isTeamLoaded && (
          <div className="mt-6 bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg font-mono text-sm">
            {error}
          </div>
        )}
      </div>

      <main className="w-full max-w-[1200px] mx-auto p-8 box-border">
        {isTeamLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
            <div className="flex flex-col gap-8">
              {squad && <SquadDisplay squad={squad} chips={chips} />}
              <LeagueTable />
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
                <h3 className="mt-0 mb-6 text-ds-text font-bold text-lg flex items-center gap-2">
                  <span className="w-1 h-6 bg-ds-primary rounded-full"></span>
                  Parameters
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="moneyInBank" className="text-sm font-semibold text-gray-400">Money In Bank (£)</label>
                    <input
                      id="moneyInBank"
                      type="number"
                      step="0.1"
                      value={moneyInBank}
                      onChange={(e) => setMoneyInBank(e.target.value)}
                      required
                      className="p-3 rounded-md border border-ds-border bg-ds-bg text-ds-text text-base focus:outline-none focus:border-ds-primary font-mono transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="freeTransfers" className="text-sm font-semibold text-ds-text-muted">Free Transfers</label>
                    <input
                      id="freeTransfers"
                      type="number"
                      min="1"
                      max="5"
                      value={freeTransfers}
                      onChange={(e) => setFreeTransfers(e.target.value)}
                      required
                      className="p-3 rounded-md border border-ds-border bg-ds-bg text-ds-text text-base focus:outline-none focus:border-ds-primary font-mono transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-white cursor-pointer">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transfersRolled}
                        onChange={(e) => setTransfersRolled(e.target.checked)}
                        className="w-5 h-5 accent-ds-primary rounded border-ds-border bg-ds-bg"
                      />
                      Transfers Rolled?
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="w-full p-3 rounded-md border-none bg-ds-primary text-white font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono">
                    {loading ? 'PROCESSING...' : 'RUN ANALYSIS'}
                  </button>
                </form>
              </div>

              {error && isTeamLoaded && (
                <div className="bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg text-center font-mono text-sm">
                  {error}
                </div>
              )}
              <AnalysisResult data={result} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/:teamId" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
