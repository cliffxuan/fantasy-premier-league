import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { analyzeTeam, getSquad } from './api';
import AnalysisResult from './components/AnalysisResult';
import SquadDisplay from './components/SquadDisplay';

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
    <div className="min-h-screen flex flex-col bg-fpl-purple text-white font-sans">
      <div className="bg-gradient-to-b from-fpl-card to-fpl-purple py-16 px-8 flex flex-col items-center text-center border-b border-white/10">
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-br from-fpl-green to-fpl-cyan bg-clip-text text-transparent tracking-tighter">
          FPL Assistant
        </h1>
        <p className="text-xl font-normal mb-10 text-gray-300">
          Enter your Team ID to get started.
        </p>

        <div className="flex w-full max-w-[500px] bg-white/10 border border-white/20 rounded-2xl p-2 backdrop-blur-md focus-within:border-fpl-green transition-colors">
          <input
            id="teamId"
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Team ID (e.g. 9026267)"
            className="flex-1 bg-transparent border-none p-4 text-xl outline-none text-white font-semibold placeholder-white/40"
            onKeyDown={(e) => e.key === 'Enter' && handleGoClick()}
          />
          <button
            type="button"
            className="bg-gradient-to-r from-fpl-green to-fpl-cyan text-fpl-purple font-extrabold px-10 py-0 rounded-xl text-xl hover:opacity-90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGoClick}
            disabled={loading}
          >
            {loading ? '...' : 'GO'}
          </button>
        </div>
        {error && !isTeamLoaded && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <main className="w-full max-w-[1200px] mx-auto p-8 box-border">
        {isTeamLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
            <div className="flex flex-col gap-8">
              {squad && <SquadDisplay squad={squad} chips={chips} />}
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-fpl-card p-6 rounded-2xl border border-white/10">
                <h3 className="mt-0 mb-6 text-fpl-green font-bold text-xl">Analysis Controls</h3>
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
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900 text-white text-base focus:outline-none focus:border-fpl-green transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="freeTransfers" className="text-sm font-semibold text-gray-400">Free Transfers</label>
                    <input
                      id="freeTransfers"
                      type="number"
                      min="1"
                      max="5"
                      value={freeTransfers}
                      onChange={(e) => setFreeTransfers(e.target.value)}
                      required
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900 text-white text-base focus:outline-none focus:border-fpl-green transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-white cursor-pointer">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transfersRolled}
                        onChange={(e) => setTransfersRolled(e.target.checked)}
                        className="w-5 h-5 accent-fpl-green"
                      />
                      Transfers Rolled?
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="w-full p-4 rounded-lg border-none bg-gradient-to-r from-fpl-green to-fpl-cyan text-white font-bold text-lg cursor-pointer hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Analyzing...' : 'Analyze Team'}
                  </button>
                </form>
              </div>

              {error && isTeamLoaded && (
                <div className="bg-red-500/10 border border-fpl-red text-fpl-red p-4 rounded-lg text-center">
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
