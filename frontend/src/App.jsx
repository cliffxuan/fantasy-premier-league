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
import MarketOverview from './components/MarketOverview';

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

  const activeTab = searchParams.get('tab') || 'market';
  const gwParam = searchParams.get('gw');
  const viewGw = gwParam ? parseInt(gwParam) : null;

  const [squadLoading, setSquadLoading] = useState(false);

  // Fetch squad when URL param changes
  useEffect(() => {
    if (paramTeamId) {
      setTeamId(paramTeamId);
      fetchSquad(paramTeamId, gwParam);
    } else {
      // If no teamId in URL, reset data
      if (!paramTeamId) {
        setTeamId('');
        setSquad(null);
        setChips([]);
        setHistory([]);
        setEntry(null);
        setCalculatedFreeTransfers(1);
        setIsTeamLoaded(false);
        setResult(null);
      }
    }
  }, [paramTeamId, gwParam]);

  const fetchSquad = async (id, gw) => {
    if (!isTeamLoaded) {
      setLoading(true);
    } else {
      setSquadLoading(true);
    }
    setError(null);
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

        if (!gw && resolvedGw) {
          const currentTab = searchParams.get('tab') || 'market';
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
        setError('Failed to fetch team. Please verify the Team ID.');
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
      // When searching, switch to squad tab to show the result
      navigate(`/${teamId}?tab=squad`);
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
      if (['analysis', 'solver', 'market', 'standings'].includes(tab)) {
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
      const bank = entry ? (entry.last_deadline_bank / 10).toFixed(1) : '0.5';
      const data = await analyzeTeam(teamId, bank, calculatedFreeTransfers, false);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const TeamInput = ({ centered = false }) => (
    <div className={`flex w-full ${centered ? 'max-w-[400px]' : 'max-w-xs'} items-center gap-2 transition-all`}>
      <div className="relative group flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-muted font-mono opacity-50 group-focus-within:opacity-100 transition-opacity">$</span>
        <input
          id="teamId"
          type="text"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder={centered ? "Enter FPL Team ID" : "Team ID"}
          className={`bg-ds-surface border border-ds-border rounded-md px-4 pl-8 text-sm outline-none focus:border-ds-primary focus:ring-1 focus:ring-ds-primary transition-all w-full placeholder-ds-text-muted/50 font-mono ${centered ? 'py-3 text-lg' : 'py-2'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleGoClick()}
        />
      </div>
      <button
        type="button"
        className={`bg-ds-primary text-white font-bold rounded-md hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wider ${centered ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-xs'}`}
        onClick={handleGoClick}
        disabled={loading}
      >
        {loading ? '...' : 'GO'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-ds-bg text-ds-text font-sans selection:bg-ds-primary selection:text-white">
      {/* Header Section */}
      <div className="border-b border-ds-border bg-ds-card/50 backdrop-blur-sm py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 transition-all duration-300">
        <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <h1 className="text-2xl font-bold tracking-tight text-ds-text leading-tight">
            FPL <span className="text-ds-primary">Alpha</span>
          </h1>
          <p className="text-[10px] md:text-xs text-ds-text-muted font-mono tracking-wide uppercase">
            Data Science & AI Powered Insights
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-6">
        <nav className="flex overflow-x-auto pb-2 gap-6 border-b border-ds-border custom-scrollbar">
          {[
            { id: 'market', label: 'Match Center' },
            { id: 'dream_team', label: 'Team of the Week' },
            { id: 'analysis', label: 'Rank Analysis' },
            { id: 'solver', label: 'AI Solver' },
            { id: 'squad', label: 'My Squad' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 px-1 font-bold text-sm md:text-base whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                ? 'text-ds-primary border-ds-primary'
                : 'text-ds-text-muted border-transparent hover:text-ds-text hover:border-ds-border'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-[1400px] mx-auto p-4 md:p-8 box-border flex-1">
        {error && !isTeamLoaded && activeTab === 'squad' && (
          <div className="mb-6 bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg font-mono text-sm max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8 items-start">
          {/* LEFT COLUMN: Main Content */}
          <div className="flex flex-col gap-8 min-w-0">

            {/* Squad Tab */}
            <div style={{ display: activeTab === 'squad' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
              {!isTeamLoaded ? (
                <div className="text-center py-20 flex flex-col items-center justify-center opacity-60">
                  <div className="w-16 h-16 rounded-full bg-ds-card border border-ds-border flex items-center justify-center mb-6 shadow-xl">
                    <span className="text-3xl">⚽️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-ds-text mb-6">My Squad</h2>
                  <div className="flex justify-center w-full">
                    <TeamInput centered={true} />
                  </div>
                  <p className="text-ds-text-muted max-w-md mx-auto mt-4 text-sm">
                    Enter your Team ID to unlock detailed analysis, point history, and AI insights.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Input for switching teams */}
                  <div className="flex justify-end border-b border-ds-border pb-4">
                    <TeamInput />
                  </div>

                  <TeamHeader entry={entry} freeTransfers={calculatedFreeTransfers} />
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
              )}
            </div>

            <div style={{ display: activeTab === 'dream_team' ? 'block' : 'none' }}>
              <DreamTeam
                currentGw={entry?.current_event}
                gw={viewGw}
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
              <MarketOverview />
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="flex flex-col gap-6 sticky top-24">

            {/* Squad Specific Tools (Conditional) */}
            {activeTab === 'squad' && isTeamLoaded && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                <PointsHistoryChart history={history} />

                <div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
                  <h3 className="text-lg font-bold text-ds-text mb-2">Run Analysis</h3>
                  <p className="text-sm text-ds-text-muted mb-6 leading-relaxed">
                    Generate AI-powered insights for your current team selection.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <button type="submit" disabled={loading} className="w-full p-3 rounded-md border-none bg-ds-primary text-white font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 font-mono shadow-lg relative overflow-hidden">
                      {loading ? 'PROCESSING...' : 'RUN ANALYSIS'}
                    </button>
                  </form>
                </div>

                {error && (
                  <div className="bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg text-center font-mono text-sm">
                    {error}
                  </div>
                )}

                <AnalysisResult data={result} />
              </div>
            )}

            {/* Persistent League Table */}
            <LeagueTable />

          </div>

        </div>
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
