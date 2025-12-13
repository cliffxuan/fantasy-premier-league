import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { analyzeTeam, getSquad } from './api';
import AnalysisResult from './components/AnalysisResult';
import SquadDisplay from './components/SquadDisplay';

import PointsHistoryChart from './components/PointsHistoryChart';
import TeamHeader from './components/TeamHeader';
import LeagueTable from './components/LeagueTable';
import DreamTeam from './components/DreamTeam';
import TopManagersAnalysis from './components/TopManagersAnalysis';
import Solver from './components/Solver';
import FixtureTicker from './components/FixtureTicker';
import PolymarketWidget from './components/PolymarketWidget';

function Dashboard() {
  const { teamId: paramTeamId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [teamId, setTeamId] = useState(paramTeamId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [squad, setSquad] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [chips, setChips] = useState([]);
  const [history, setHistory] = useState([]);
  const [entry, setEntry] = useState(null);
  const [calculatedFreeTransfers, setCalculatedFreeTransfers] = useState(1);
  const [isTeamLoaded, setIsTeamLoaded] = useState(false);

  const activeTab = searchParams.get('tab') || 'squad';
  const gwParam = searchParams.get('gw');
  const viewGw = gwParam ? parseInt(gwParam) : null;

  const [squadLoading, setSquadLoading] = useState(false);

  // Fetch squad when URL param changes
  useEffect(() => {
    if (paramTeamId) {
      setTeamId(paramTeamId);
      // If we already have loaded the team and only GW changed, we might want to do a lighter fetch?
      // For simplicity/robustness, we reuse fetchSquad but maybe we can optimize
      fetchSquad(paramTeamId, gwParam);
    } else {
      setTeamId('');
      setSquad(null);
      setChips([]);
      setHistory([]);
      setEntry(null);
      setCalculatedFreeTransfers(1);
      setIsTeamLoaded(false);
      setResult(null);
    }
  }, [paramTeamId, gwParam]);

  const fetchSquad = async (id, gw) => {
    // Only set global loading if we are doing a full first load
    if (!isTeamLoaded) {
      setLoading(true);
    } else {
      setSquadLoading(true);
    }
    setError(null);
    // Don't wipe squad immediately to avoid flicker if just changing GW, unless it's a new team
    if (!isTeamLoaded) {
      setSquad(null);
      setResult(null);
    }

    try {
      const squadData = await getSquad(id, gw);
      if (squadData && squadData.squad) {
        setSquad(squadData.squad);
        setTransfers(squadData.transfers || []);
        setChips(squadData.chips || []);
        setHistory(squadData.history || []);
        setEntry(squadData.entry || null);
        setCalculatedFreeTransfers(squadData.free_transfers !== undefined ? squadData.free_transfers : 1);

        const resolvedGw = squadData.gameweek || squadData.entry?.current_event;

        // If no GW in URL, set it
        if (!gw && resolvedGw) {
          const currentTab = searchParams.get('tab') || 'squad';
          if (['squad', 'dream_team'].includes(currentTab)) {
            setSearchParams(prev => {
              const newP = new URLSearchParams(prev);
              newP.set('gw', resolvedGw);
              return newP;
            }, { replace: true });
          }
        }

        setIsTeamLoaded(true);
      } else {
        setError('Failed to fetch team. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch team. Please try again.');
    } finally {
      setLoading(false);
      setSquadLoading(false);
    }
  };

  const handleGoClick = () => {
    if (teamId) {
      navigate(`/${teamId}`);
    }
  };

  const handleGwChange = (newGw) => {
    setSearchParams(prev => {
      const newP = new URLSearchParams(prev);
      newP.set('gw', newGw);
      return newP;
    });
  };

  const handleTabChange = (tab) => {
    setSearchParams(prev => {
      const newP = new URLSearchParams(prev);
      newP.set('tab', tab);
      if (['analysis', 'solver'].includes(tab)) {
        newP.delete('gw');
      }
      return newP;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use money from entry if available, otherwise default to 0.5
      const bank = entry ? (entry.last_deadline_bank / 10).toFixed(1) : '0.5';
      // Use calculated free transfers
      const data = await analyzeTeam(teamId, bank, calculatedFreeTransfers, false);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ds-bg text-ds-text font-sans selection:bg-ds-primary selection:text-white">
      <div className="border-b border-ds-border bg-ds-card/50 backdrop-blur-sm py-8 px-4 md:py-12 md:px-8 flex flex-col items-center text-center">
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

      <main className="w-full max-w-[1200px] mx-auto p-4 md:p-8 box-border">
        {isTeamLoaded && (
          <>
            <TeamHeader entry={entry} freeTransfers={calculatedFreeTransfers} />

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-ds-border">
              <button
                className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'squad' ? 'text-ds-primary border-ds-primary' : 'text-ds-text-muted border-transparent hover:text-ds-text'}`}
                onClick={() => handleTabChange('squad')}
              >
                My Squad
              </button>
              <button
                className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'dream_team' ? 'text-ds-primary border-ds-primary' : 'text-ds-text-muted border-transparent hover:text-ds-text'}`}
                onClick={() => handleTabChange('dream_team')}
              >
                Team of the Week
              </button>
              <button
                className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'analysis' ? 'text-ds-primary border-ds-primary' : 'text-ds-text-muted border-transparent hover:text-ds-text'}`}
                onClick={() => handleTabChange('analysis')}
              >
                Rank Analysis
              </button>
              <button
                className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'solver' ? 'text-ds-primary border-ds-primary' : 'text-ds-text-muted border-transparent hover:text-ds-text'}`}
                onClick={() => handleTabChange('solver')}
              >
                AI Solver
              </button>
              <button
                className={`pb-4 px-2 font-bold text-lg transition-colors border-b-2 ${activeTab === 'market' ? 'text-ds-primary border-ds-primary' : 'text-ds-text-muted border-transparent hover:text-ds-text'}`}
                onClick={() => handleTabChange('market')}
              >
                Market Insights
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
              <div className="flex flex-col gap-8">
                <div style={{ display: activeTab === 'squad' ? 'block' : 'none' }}>
                  {squad && (
                    <SquadDisplay
                      squad={squad}
                      chips={chips}
                      gameweek={viewGw || entry?.current_event}
                      transfers={transfers}
                      onGwChange={handleGwChange}
                      onTabSwitch={() => handleTabChange('dream_team')}
                      loading={squadLoading}
                      currentGw={entry?.current_event}
                      history={history}
                    />
                  )}
                </div>
                <div style={{ display: activeTab === 'dream_team' ? 'block' : 'none' }}>
                  <DreamTeam
                    currentGw={entry?.current_event}
                    gw={viewGw || entry?.current_event}
                    onGwChange={handleGwChange}
                    onTabSwitch={() => handleTabChange('squad')}
                  />
                </div>
                <div style={{ display: activeTab === 'analysis' ? 'block' : 'none' }}>
                  <TopManagersAnalysis />
                </div>
                <div style={{ display: activeTab === 'solver' ? 'block' : 'none' }}>
                  <div className="space-y-8">
                    <Solver />
                    <FixtureTicker />
                  </div>
                </div>
                <div style={{ display: activeTab === 'market' ? 'block' : 'none' }}>
                  <PolymarketWidget />
                </div>
                <LeagueTable />
              </div>

              <div className="flex flex-col gap-6">
                <PointsHistoryChart history={history} />
                <div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          </>
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
