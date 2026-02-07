import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, X, FileText, Code, Check, Key } from 'lucide-react';
import { analyzeTeam, getSquad, getMe } from './api';
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
import ClubViewer from './components/ClubViewer';
import FormAnalysis from './components/FormAnalysis';
import PlayerExplorer from './components/PlayerExplorer';
import AuthModal from './components/AuthModal';
import TeamInput from './components/TeamInput';

const TABS = [
  { id: 'squad', label: 'My Squad' },
  { id: 'matches', label: 'Match Center' },
  { id: 'form', label: 'Form Lab' },
  { id: 'solver', label: 'AI Solver' },
  { id: 'analysis', label: 'Rank Analysis' },
  { id: 'dream_team', label: 'Team of the Week' },
  { id: 'club_viewer', label: 'Club Viewer' },
  { id: 'players', label: 'Player Explorer' }
];

function Dashboard() {
  const { teamId: paramTeamId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [teamId, setTeamId] = useState(paramTeamId || sessionStorage.getItem('fpl_team_id') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [squad, setSquad] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [chips, setChips] = useState([]);
  const [history, setHistory] = useState([]);
  const [entry, setEntry] = useState(null);
  const [calculatedFreeTransfers, setCalculatedFreeTransfers] = useState(1);
  const [transferDetails, setTransferDetails] = useState(null);
  const [isTeamLoaded, setIsTeamLoaded] = useState(false);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const activeTab = searchParams.get('tab') || 'matches';
  const gwParam = searchParams.get('gw');
  const viewGw = gwParam ? parseInt(gwParam) : null;

  const [squadLoading, setSquadLoading] = useState(false);

  const [authToken, setAuthToken] = useState(sessionStorage.getItem('fpl_auth_token') || '');



  // Tab refs for auto-scrolling
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      tabRefs.current[activeTab].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);



  useEffect(() => {
    if (authToken) {
      sessionStorage.setItem('fpl_auth_token', authToken);
    } else {
      sessionStorage.removeItem('fpl_auth_token');
    }
  }, [authToken]);

  // Persist Team ID similarly
  useEffect(() => {
    if (teamId) {
      sessionStorage.setItem('fpl_team_id', teamId);
    } else {
      sessionStorage.removeItem('fpl_team_id');
    }
  }, [teamId]);

  const [isPrivate, setIsPrivate] = useState(false);

  // Fetch squad when URL param changes
  useEffect(() => {
    if (paramTeamId) {
      setTeamId(paramTeamId);
      // Pass authToken to fetchSquad. 
      // Note: authToken might not be updated in closure if this effect runs before authToken state update?
      // Actually fetchSquad reads authToken from state if we define it inside Dashboard.
      // But fetchSquad is defined below. It accesses `authToken` variable from scope.
      fetchSquad(paramTeamId, gwParam);
    } else {
      // If no teamId in URL, reset data
      if (!paramTeamId) {
        setTeamId(sessionStorage.getItem('fpl_team_id') || '');
        setSquad(null);
        setChips([]);
        setHistory([]);
        setEntry(null);
        setCalculatedFreeTransfers(1);
        setIsTeamLoaded(false);
        setResult(null);
        setIsPrivate(false);
      }
    }
  }, [paramTeamId, gwParam, authToken]); // Added authToken to dependency

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
      setIsPrivate(false);
    }

    try {
      const squadData = await getSquad(id, gw, authToken);
      if (squadData && (squadData.squad || squadData.picks)) { // Modified check
        setSquad(squadData.squad || squadData.picks); // Handle if backend returns picks as root or similar? No, backend returns structured format.
        // Backend returns: { "squad": [...], "chips": ... }
        // get_enriched_squad always returns this structure.

        setTransfers(squadData.transfers || []);
        setChips(squadData.chips || []);
        setHistory(squadData.history || []);
        setEntry(squadData.entry || null);
        setCalculatedFreeTransfers(squadData.free_transfers !== undefined ? squadData.free_transfers : 1);
        setTransferDetails(squadData.transfer_details || null);
        setIsPrivate(squadData.is_private || false);

        const resolvedGw = squadData.gameweek || squadData.entry?.current_event;

        if (!gw && resolvedGw) {
          const currentTab = searchParams.get('tab') || 'matches';
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
      newP.set('tab', tab);
      if (['analysis', 'solver', 'matches', 'standings', 'form'].includes(tab)) {
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
      let bank = '0.5';
      if (transferDetails && transferDetails.bank !== undefined) {
        bank = (transferDetails.bank / 10).toFixed(1);
      } else if (entry) {
        bank = (entry.last_deadline_bank / 10).toFixed(1);
      }
      const data = await analyzeTeam(teamId, bank, calculatedFreeTransfers, false, authToken);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let bank = '0.5';
      if (transferDetails && transferDetails.bank !== undefined) {
        bank = (transferDetails.bank / 10).toFixed(1);
      } else if (entry) {
        bank = (entry.last_deadline_bank / 10).toFixed(1);
      }
      const data = await analyzeTeam(teamId, bank, calculatedFreeTransfers, false, authToken, true);
      if (data.generated_prompt) {
        setGeneratedPrompt(data.generated_prompt);
        setShowPromptModal(true);
      } else {
        setError("Failed to generate prompt.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className="min-h-screen flex flex-col bg-ds-bg text-ds-text font-sans selection:bg-ds-primary selection:text-white"
    >
      {/* Sticky Header & Tabs Container */}
      <div className="sticky top-0 z-50 bg-ds-bg/95 backdrop-blur-md border-b border-ds-border transition-all duration-300">

        {/* Header Section */}
        <div className="w-full max-w-[1400px] mx-auto py-3 px-3 md:py-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold tracking-tight text-ds-text leading-tight">
              FPL <span className="text-ds-primary">Alpha</span>
            </h1>
            <p className="text-[10px] md:text-xs text-ds-text-muted font-mono tracking-wide uppercase">
              Data Science & AI Powered Insights
            </p>
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-xs font-bold text-ds-text-muted hover:text-ds-primary transition-colors border border-ds-border rounded-full px-3 py-1.5 hover:border-ds-primary/50 bg-ds-surface/50 group"
          >
            <Code size={14} className="group-hover:scale-110 transition-transform" />
            API Docs
          </a>

        </div>

        {/* Tab Navigation (Desktop Only) */}
        <div className="hidden md:block w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-2">
          <nav
            ref={tabsContainerRef}
            className="flex overflow-x-auto gap-6 custom-scrollbar -mb-[1px]"
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                ref={el => tabRefs.current[tab.id] = el}
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


      </div>

      {/* Main Content */}
      <main
        className="w-full max-w-[1400px] mx-auto p-4 md:p-8 box-border flex-1 pb-24 md:pb-8"

      >
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
                  <div className="flex flex-col gap-3 justify-center w-full max-w-[400px] items-center">
                    <TeamInput
                      centered={true}
                      teamId={teamId}
                      setTeamId={setTeamId}
                      handleGoClick={handleGoClick}
                      loading={loading}
                    />
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-ds-surface border border-ds-border hover:border-ds-primary/50 text-ds-text font-bold rounded-md px-6 py-3 text-sm hover:bg-ds-surface/80 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Key size={16} className="text-ds-primary group-hover:scale-110 transition-transform" />
                      <span>Sign in with FPL</span>
                    </button>
                  </div>
                  <p className="text-ds-text-muted max-w-md mx-auto mt-4 text-sm">
                    Enter your Team ID to unlock detailed analysis, point history, and AI insights.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Input for switching teams */}
                  <div className="flex justify-end border-b border-ds-border pb-4">
                    <TeamInput
                      teamId={teamId}
                      setTeamId={setTeamId}
                      handleGoClick={handleGoClick}
                      loading={loading}
                    />
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="ml-3 p-2 bg-ds-surface border border-ds-border rounded-md text-ds-text-muted hover:text-ds-primary hover:border-ds-primary/50 transition-all group"
                      title="Update Auth Token"
                    >
                      <Key size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <TeamHeader entry={entry} freeTransfers={calculatedFreeTransfers} isPrivate={isPrivate} transferDetails={transferDetails} />
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
                isActive={activeTab === 'dream_team'}
              />
            </div>

            <div style={{ display: activeTab === 'club_viewer' ? 'block' : 'none' }}>
              <ClubViewer />
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

            <div style={{ display: activeTab === 'matches' ? 'block' : 'none' }}>
              <MarketOverview />
            </div>

            <div style={{ display: activeTab === 'form' ? 'block' : 'none' }}>
              <FormAnalysis />
            </div>

            <div style={{ display: activeTab === 'players' ? 'block' : 'none' }}>
              <PlayerExplorer />
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="flex flex-col gap-6 sticky top-32">

            {/* Team Analysis Promo - Call To Action */}
            {!isTeamLoaded && activeTab !== 'squad' && (
              <div className="bg-ds-card p-6 rounded-xl border border-ds-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] relative overflow-hidden group hover:border-ds-primary/40 transition-all">
                {/* Decorative Background */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-ds-primary/10 rounded-full blur-3xl group-hover:bg-ds-primary/20 transition-all"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🚀</span>
                    <h3 className="text-lg font-bold text-ds-text">Unlock AI Insights</h3>
                  </div>
                  <p className="text-xs text-ds-text-muted mb-4 leading-relaxed">
                    Enter your Team ID to access live points tracking, transfer recommendations, and future planning tools.
                  </p>
                  <div className="scale-95 origin-left w-[105%]">
                    <TeamInput
                      teamId={teamId}
                      setTeamId={setTeamId}
                      handleGoClick={handleGoClick}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Squad Specific Tools (Conditional) */}
            {activeTab === 'squad' && isTeamLoaded && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                <PointsHistoryChart history={history} />

                <div className="bg-ds-card p-6 rounded-xl border border-ds-border shadow-sm">
                  <h3 className="text-lg font-bold text-ds-text mb-2">Run Analysis</h3>
                  <p className="text-sm text-ds-text-muted mb-6 leading-relaxed">
                    Generate AI-powered insights for your current team selection.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <button type="submit" disabled={loading} className="w-full p-3 rounded-md border-none bg-ds-primary text-white font-bold text-sm uppercase tracking-wider cursor-pointer hover:bg-ds-primary-hover active:scale-95 transition-all disabled:opacity-50 font-mono shadow-lg relative overflow-hidden flex items-center justify-center gap-2 group">
                      {loading ? 'PROCESSING...' : (
                        <>
                          <span>RUN ANALYSIS</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePrompt}
                      disabled={loading}
                      className="w-full p-2.5 rounded-md border border-ds-border bg-ds-surface text-ds-text text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-ds-card-hover hover:border-ds-primary/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      <FileText size={14} className="group-hover:text-ds-primary transition-colors" />
                      Generate Prompt
                    </button>
                  </form>
                </div>

                {error && (
                  <div className="bg-ds-danger/10 border border-ds-danger text-ds-danger p-4 rounded-lg text-center font-mono text-sm">
                    {error}
                  </div>
                )}

                <AnalysisResult
                  data={result}
                  onShowPrompt={() => {
                    if (result?.generated_prompt) {
                      setGeneratedPrompt(result.generated_prompt);
                      setShowPromptModal(true);
                    }
                  }}
                />
              </div>
            )}

            {/* Persistent League Table */}
            <LeagueTable />

          </div>

        </div>
      </main>

      {/* Bottom Tab Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ds-bg/95 backdrop-blur-md border-t border-ds-border transition-all duration-300">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8">
          <nav
            className="flex overflow-x-auto gap-6 custom-scrollbar -mb-[1px]"
          >
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 font-bold text-sm md:text-base whitespace-nowrap transition-all border-t-4 ${activeTab === tab.id
                  ? 'text-ds-primary border-ds-primary pt-[14px]'
                  : 'text-ds-text-muted border-transparent hover:text-ds-text hover:border-ds-border'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-ds-card w-full max-w-3xl rounded-xl border border-ds-border shadow-2xl flex flex-col max-h-[85vh] min-h-[500px] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-ds-border bg-ds-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ds-primary/10 rounded-lg text-ds-primary">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ds-text">Analysis Prompt</h3>
                  <p className="text-xs text-ds-text-muted">Generated context for LLM Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-2 hover:bg-ds-surface rounded-full text-ds-text-muted hover:text-ds-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-auto p-6 bg-ds-surface/50">
                <textarea
                  className="w-full h-full font-mono text-xs leading-relaxed text-ds-text bg-ds-bg p-4 rounded-lg border border-ds-border focus:border-ds-primary focus:ring-1 focus:ring-ds-primary outline-none resize-none"
                  readOnly
                  value={generatedPrompt}
                />
              </div>
            </div>

            <div className="p-6 border-t border-ds-border bg-ds-card/50 flex justify-end gap-3">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-2 text-sm font-bold text-ds-text-muted hover:text-ds-text transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all shadow-lg ${copySuccess
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25'
                  : 'bg-ds-primary text-white hover:bg-ds-primary-hover hover:shadow-ds-primary/25 active:scale-95'
                  }`}
              >
                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentToken={authToken}
        onAuthenticated={async (newToken) => {
          setAuthToken(newToken);
          // Try to fetch me to get team ID
          if (newToken) {
            try {
              const me = await getMe(newToken);
              if (me && me.player && me.player.entry) {
                setTeamId(me.player.entry.toString());
                // Optionally auto-fetch squad here if desired, 
                // but existing useEffect on teamId will trigger fetchSquad anyway?
                // Wait, useEffect triggers on paramTeamId change OR if teamId changes?
                // The useEffect [teamId] only saves to sessionStorage.
                // The useEffect [paramTeamId, gwParam, authToken] handles fetching.

                // If we are on home page (no paramTeamId), we should manually trigger fetch or navigate
                if (!paramTeamId) {
                  navigate(`/${me.player.entry}?tab=squad`);
                }
              }
            } catch (e) {
              console.error("Failed to fetch user details", e);
            }
          }
        }}
      />
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
