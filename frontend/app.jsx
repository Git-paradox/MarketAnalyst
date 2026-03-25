const { useState, useEffect, useRef } = React;
const { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } = ReactRouterDOM;

const icons = {
  strength: '💪',
  weakness: '⚠️',
  opportunity: '🎯',
  threat: '🚨',
  other: '📄'
};

const impactColors = {
  high: 'bg-red-900/50 text-red-400 border-red-800',
  medium: 'bg-orange-900/50 text-orange-400 border-orange-800',
  low: 'bg-green-900/50 text-green-400 border-green-800',
};

// UI Helpers
const InfoTooltip = ({ text }) => (
  <div className="relative group inline-flex ml-2 cursor-help align-middle">
    <div className="w-3.5 h-3.5 rounded-full border border-neutral-500 text-neutral-500 text-[8px] flex items-center justify-center font-bold font-sans hover:border-lime-500 hover:text-lime-500 transition-colors">i</div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-neutral-800 text-[10px] leading-relaxed text-neutral-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center shadow-xl border border-neutral-700 font-normal normal-case tracking-normal">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
    </div>
  </div>
);

function SimilarityGraph({ matrix }) {
   if (!matrix || matrix.length === 0) return null;
   const MAX_HEIGHT = 160; 
   return (
      <div className="flex items-end justify-around space-x-4 h-[250px] mt-8 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl w-full relative">
         <div className="absolute top-5 left-6 text-xs font-bold text-neutral-500 uppercase tracking-widest">Vector Similarity Analysis</div>
         {matrix.map((comp, idx) => (
             <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end mt-8">
                 <div className="text-lime-400 font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 text-sm bg-black px-2 py-1 rounded border border-lime-900">{comp.similarity}%</div>
                 <div className="w-full max-w-[60px] bg-gradient-to-t from-lime-900/30 to-lime-500 rounded-t-sm transition-all shadow-[0_0_15px_rgba(132,204,22,0.1)] group-hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]" style={{ height: `${(comp.similarity / 100) * MAX_HEIGHT}px` }}></div>
                 <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate w-full text-center border-t border-neutral-800 pt-3">{comp.name}</div>
             </div>
         ))}
      </div>
   );
}

// --- TOP LEVEL APP ---
function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('snaptracker_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('snaptracker_user');
    setUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={
            user ? <Navigate to="/" replace /> : <AuthPage setUser={setUser} />
        } />
        
        <Route path="/" element={
            !user ? <Navigate to="/auth" replace /> : <LandingPage setAnalysisData={setAnalysisData} setChatMessages={setChatMessages} user={user} handleLogout={handleLogout} />
        } />
        
        <Route path="/dashboard/*" element={
            !user ? <Navigate to="/auth" replace /> : <DashboardLayout data={analysisData} chatMessages={chatMessages} setChatMessages={setChatMessages} setAnalysisData={setAnalysisData} user={user} handleLogout={handleLogout} />
        } />
      </Routes>
    </HashRouter>
  );
}

// --- AUTH PAGE ---
function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Authentication failed');
      
      localStorage.setItem('snaptracker_user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-black border border-lime-500/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(132,204,22,0.1)]">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 mb-2">SnapTracker</h1>
            <p className="text-neutral-400 font-medium tracking-wide">Enter the Intelligence Matrix</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-500 rounded-lg text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-lime-500 mb-2">Email Address</label>
                <input type="email" required className="w-full bg-black border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-lime-500 shadow-inner" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>
            <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-lime-500 mb-2">Password</label>
                <input type="password" required className="w-full bg-black border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-lime-500 shadow-inner" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-lime-500 text-black font-extrabold tracking-widest uppercase py-3 rounded-xl hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(132,204,22,0.2)] disabled:opacity-50 mt-4">
                {loading ? 'Authenticating...' : (isLogin ? 'Initialize Session' : 'Create Account')}
            </button>
        </form>
        
        <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-neutral-500 hover:text-lime-500 text-sm font-semibold transition-colors">
                {isLogin ? "Need an account? Register →" : "Have an account? Login →"}
            </button>
        </div>
      </div>
    </div>
  );
}

// --- LANDING PAGE ---
function LandingPage({ setAnalysisData, setChatMessages, user, handleLogout }) {
  const [productInfo, setProductInfo] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [salesTrend, setSalesTrend] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const analyzeCompetitor = async (e) => {
    e.preventDefault();
    if (!productInfo || !competitorUrl) return;
    
    setLoading(true);
    setError(null);

    try {
      const payload = { 
        product_info: productInfo, 
        competitor_names: competitorUrl, 
        sales_trend: salesTrend,
        user_id: user ? user.id : null 
      };
      const response = await fetch(`/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      let data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to analyze competitor.');
      
      setAnalysisData(data);
      setChatMessages([{ role: 'assistant', content: `Analysis complete. I've cross-referenced customer reviews for ${competitorUrl} with your product information. Ask me anything else about this comparison!` }]);
      navigate('/dashboard/overview');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-black text-gray-200">
      
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <span className="text-lime-500 font-medium text-sm">Agent: {user.email}</span>
        <button onClick={() => navigate('/dashboard/history')} className="text-neutral-500 hover:text-white text-sm font-bold uppercase underline decoration-neutral-800">History</button>
        <button onClick={handleLogout} className="text-neutral-500 hover:text-red-500 text-sm font-bold uppercase">Logout</button>
      </div>

      <div className="text-center max-w-4xl mx-auto mb-10 animate-slide-down">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 text-white drop-shadow-xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">SnapTracker</span>
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium">
          Dominate Your Market with AI Intelligence. <br/> Enter your product pitch and a competitor's URL.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto bg-black rounded-2xl p-8 border border-lime-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(132,204,22,0.05)]">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-lime-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 pointer-events-none"></div>
        
        <form onSubmit={analyzeCompetitor} className="flex flex-col gap-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold tracking-widest text-lime-500 mb-2 uppercase">Your Product Information</label>
            <textarea
              required rows="4"
              className="w-full bg-black border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-lime-500 shadow-inner"
              placeholder="e.g. We are a fast, scalable CRM built for startups..." value={productInfo} onChange={(e) => setProductInfo(e.target.value)} disabled={loading}
            ></textarea>
          </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold tracking-wider text-neutral-400 uppercase">Target Competitors</label>
              <input
                type="text"
                placeholder="e.g. Salesforce, Hubspot, Pipedrive"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-lime-500 rounded-xl px-5 py-4 text-white placeholder-neutral-600 outline-none transition-all focus:shadow-[0_0_15px_rgba(132,204,22,0.3)] font-medium"
                required
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold tracking-wider text-neutral-400 uppercase">Recent Sales Trend <span className="text-neutral-600 font-normal normal-case">(Optional)</span></label>
              <textarea
                placeholder="e.g. Our sales dropped by 15% this quarter..."
                value={salesTrend}
                onChange={(e) => setSalesTrend(e.target.value)}
                className="w-full h-24 bg-neutral-900 border-2 border-neutral-800 focus:border-lime-500 rounded-xl px-5 py-4 text-white placeholder-neutral-600 outline-none transition-all focus:shadow-[0_0_15px_rgba(132,204,22,0.3)] font-medium resize-none"
              />
            </div>
          <button
            type="submit" disabled={loading}
            className="mt-4 w-full bg-lime-500 hover:bg-lime-400 text-black font-extrabold tracking-widest py-4 px-8 rounded-xl transition duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)] uppercase disabled:opacity-50"
          >
            {loading ? 'Processing Intel...' : 'Analyze Competitor'}
          </button>
        </form>
      </div>

      {error && <div className="mt-6 text-red-500 bg-red-900/20 border border-red-500 p-4 rounded-xl max-w-xl text-center w-full">{error}</div>}
    </div>
  );
}

// --- DASHBOARD LAYOUT ---
function DashboardLayout({ data, chatMessages, setChatMessages, user, handleLogout, setAnalysisData }) {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const isHistory = location.pathname.includes('/dashboard/history');
    if (!data && !isHistory) {
        navigate('/', { replace: true });
    }
  }, [data, location.pathname, navigate]);

  const loadHistoricalAnalysis = (historicalData) => {
      setAnalysisData(historicalData.result);
      navigate('/dashboard/overview');
  };

  const tabs = [
    { name: 'Overview', path: '/dashboard/overview' },
    { name: 'Compare', path: '/dashboard/compare' },
    { name: 'Market Alerts', path: '/dashboard/alerts' },
    { name: 'AI Chat', path: '/dashboard/chat' },
    { name: 'Tracking History', path: '/dashboard/history'}
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-black selection:bg-lime-500/30 font-sans">
      
      <div className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-neutral-900 flex flex-col shrink-0 relative z-20">
        <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 drop-shadow-lg">
            SnapTracker
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto font-semibold tracking-wide">
          {tabs.map(tab => {
            const isActive = location.pathname.includes(tab.path);
            return (
              <Link key={tab.path} to={tab.path}
                className={`block px-4 py-4 rounded-xl transition-all duration-200 ${isActive ? 'bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.3)]' : 'text-neutral-500 hover:bg-neutral-900 hover:text-lime-500'}`}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-neutral-900 flex flex-col space-y-3">
          <button onClick={() => navigate('/')} className="w-full text-center text-xs font-bold tracking-widest uppercase text-lime-500 hover:text-white transition-colors bg-lime-900/20 py-3 rounded-xl border border-lime-900/50">
            + New Analysis
          </button>
          <button onClick={handleLogout} className="w-full text-center text-xs font-bold tracking-widest uppercase text-neutral-600 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative p-4 md:p-10 scroll-smooth bg-black">
        <div className="max-w-5xl mx-auto animate-fade-in relative z-10 h-full">
          <Routes>
            <Route path="overview" element={data ? <OverviewTab result={data} /> : <div/>} />
            <Route path="compare" element={data ? <CompareTab result={data} /> : <div/>} />
            <Route path="alerts" element={data ? <AlertsTab result={data} /> : <div/>} />
            <Route path="chat" element={data ? <ChatTab messages={chatMessages} setMessages={setChatMessages} /> : <div/>} />
            <Route path="history" element={<HistoryTab user={user} loadAnalysis={loadHistoricalAnalysis} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// --- HISTORY TAB ---
function HistoryTab({ user, loadAnalysis }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetch(`/api/history/${user.id}`).then(r => r.json()).then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, [user.id]);

    return (
        <div className="space-y-8 pb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">Tracking History</h2>
            <div className="grid grid-cols-1 gap-4">
                {loading ? <div className="text-lime-500 font-bold animate-pulse">Loading intel archives...</div> : 
                 history.length === 0 ? <div className="p-6 bg-black border border-neutral-800 rounded-xl text-neutral-500">No previous comparisons tracked.</div> :
                 history.map(item => {
                     const isExpanded = expandedId === item.id;
                     const text = item.product_info || "";
                     const needsExpansion = text.length > 80;
                     return (
                         <div key={item.id} className="bg-black border border-neutral-800 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 sm:items-center justify-between group hover:border-lime-500 transition-colors">
                             <div className="flex-1 min-w-0 pr-4">
                                 <h4 className="font-bold text-white text-lg">{item.brand_names || "Legacy Matrix"}</h4>
                                 <div className="text-sm text-neutral-400 mt-1">
                                     <span className={isExpanded ? "" : "line-clamp-1"}>Vs. {text}</span>
                                     {needsExpansion && (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : item.id); }} 
                                            className="text-lime-500 hover:text-white text-xs mt-2 font-bold tracking-widest uppercase transition-colors block"
                                         >
                                             {isExpanded ? "Show Less" : "Read More"}
                                         </button>
                                     )}
                                 </div>
                                 <p className="text-xs text-neutral-500 mt-3">{new Date(item.timestamp).toLocaleString()}</p>
                             </div>
                             <button onClick={() => loadAnalysis(item)} className="whitespace-nowrap shrink-0 bg-lime-900/20 text-lime-500 border border-lime-900/50 px-5 py-3 rounded-lg font-bold tracking-widest uppercase text-xs hover:bg-lime-500 hover:text-black transition-colors self-start sm:self-center">
                                 View intel
                             </button>
                         </div>
                     );
                 })
                }
            </div>
        </div>
    )
}

// --- OVERVIEW TAB ---
function OverviewTab({ result }) {
  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-3xl font-extrabold text-white">Analysis Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 rounded-2xl p-8 bg-black border border-lime-500/50 shadow-[0_0_30px_rgba(132,204,22,0.1)] relative overflow-hidden group">
            <div className="flex items-center space-x-3 mb-5">
              <h2 className="text-xl font-extrabold tracking-widest text-lime-400 uppercase">Competitive Intelligence</h2>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed text-white font-medium relative z-10">{result.insight || "No insights generated."}</p>
        </div>

        <div className="bg-black rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Metrics</h3>
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-medium text-sm">Target Similarity <InfoTooltip text="How closely your product aligns with the targeted competitor base mathematically."/></span>
                <span className="text-3xl font-bold text-lime-400">{result.similarity}%</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2"><div className="bg-lime-500 h-2 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.5)]" style={{ width: `${result.similarity || 0}%` }}></div></div>
            </div>
            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-medium text-sm">AI Confidence <InfoTooltip text="The LLM's internal confidence parameter regarding the objective accuracy of this entire matrix."/></span>
                <span className="text-3xl font-bold text-lime-400">{result.confidence}%</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2"><div className="bg-lime-500 h-2 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.5)]" style={{ width: `${result.confidence || 0}%` }}></div></div>
            </div>
            {result.sources_decided && result.sources_decided.map(s => <span key={s} className="inline-block mt-4 mr-2 px-2 py-1 text-xs font-bold bg-neutral-900 text-lime-500 border border-lime-900 rounded">{s}</span>)}
        </div>

        <div className="bg-black rounded-2xl p-6 border border-neutral-800 flex flex-col justify-center gap-8">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Classification</h3>
            <div>
              <span className="text-xs text-neutral-500 block mb-2 font-semibold uppercase tracking-wider">Insight Type</span>
              <span className="inline-flex px-4 py-3 rounded-xl bg-neutral-900 text-lime-400 border border-neutral-800 w-full font-bold justify-center">{result.change_type}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-500 block mb-2 font-semibold uppercase tracking-wider">Strategic Impact</span>
              <span className={`inline-flex px-4 py-3 rounded-xl justify-center w-full font-black uppercase border ${impactColors[result.impact] || impactColors.high}`}>{result.impact}</span>
            </div>
        </div>
      </div>

      <SimilarityGraph matrix={result.matrix} />

      {/* Competitor Matrix Details */}
      {result.matrix && result.matrix.length > 0 && (
          <div className="bg-black rounded-2xl p-6 border border-neutral-800 mt-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Competitive Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {result.matrix.map((comp, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl transition-all hover:border-lime-500/50">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-white truncate max-w-[70%]">{comp.name}</h4>
                            <span className="bg-black text-lime-400 text-xs font-bold px-2 py-1 rounded-md border border-neutral-800">{comp.similarity}% Vector</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest flex items-center mb-1">Their Strategy (Strength)</span>
                                <p className="text-sm text-neutral-300">{comp.strength}</p>
                            </div>
                            <div className="p-3 bg-lime-950/20 border border-lime-900/30 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-lime-500 tracking-widest flex items-center mb-1">Their Vulnerability (Weakness)</span>
                                <p className="text-sm text-neutral-300">{comp.weakness}</p>
                            </div>
                        </div>
                    </div>
                 ))}
              </div>
          </div>
      )}
    </div>
  );
}

// --- ALERTS TAB ---
function AlertsTab({ result }) {
  const diffs = result?.diff_metrics;
  const shifts = result?.historical_shifts || [];

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-3xl font-extrabold text-white">Market Alerts & Shifts</h2>
      
      {!diffs && (
        <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">First Track Record Established</h3>
            <p className="text-neutral-400 max-w-lg mx-auto">We have successfully taken a mathematical snapshot of this competitor. Track them again in the future to see exactly what features, pricing, and words they change on their website.</p>
        </div>
      )}

      {diffs && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black rounded-2xl p-6 border border-neutral-800 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Page Volatility <InfoTooltip text="Total percentage of the competitor's raw frontend syntax that has changed since the last fetch." /></h3>
            <div className="text-5xl font-extrabold text-lime-400">{diffs.volatility}%</div>
            <p className="text-xs mt-2 text-neutral-400">Percentage of words altered since last snapshot</p>
        </div>
        <div className="bg-black rounded-2xl p-6 border border-lime-900/30">
            <h3 className="text-xs font-bold text-lime-500 uppercase tracking-widest mb-4">Content Insertions <InfoTooltip text="Exact metric of purely net-new language added to their HTML body text." /></h3>
            <div className="text-5xl font-extrabold text-lime-400">+{diffs.words_added}</div>
            <p className="text-xs mt-2 text-lime-600/50">New words pushed to production</p>
        </div>
        <div className="bg-black rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Content Deletions <InfoTooltip text="Exact metric of legacy language deleted from their landing pages." /></h3>
            <div className="text-5xl font-extrabold text-neutral-400">-{diffs.words_removed}</div>
            <p className="text-xs mt-2 text-neutral-600">Words completely removed</p>
        </div>
      </div>
      )}

      {shifts.length > 0 && (
          <div className="bg-black rounded-2xl p-6 border border-neutral-800 mt-8">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Artificial Intelligence Detected Shifts</h3>
            <div className="space-y-4">
            {shifts.map((shift, idx) => (
                <div key={idx} className="bg-neutral-900 p-5 rounded-xl border-l-4 border-lime-500 text-neutral-200 font-medium leading-relaxed shadow-inner">
                    {shift}
                </div>
            ))}
            </div>
          </div>
      )}
    </div>
  );
}

// --- COMPARE TAB ---
function CompareTab({ result }) {
  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-3xl font-extrabold text-white mb-8">Deep Strategy & Comparison</h2>

      {result.sales_reasoning && (
          <div className="bg-lime-950/20 rounded-2xl p-8 border border-lime-900/40 shadow-[0_0_30px_rgba(132,204,22,0.05)]">
              <h3 className="text-xl font-bold text-lime-400 mb-4 uppercase tracking-wider">
                  AI Sales Correlation Engine
              </h3>
              <p className="text-lime-50 text-lg leading-relaxed font-medium">{result.sales_reasoning}</p>
          </div>
      )}

      <div className="space-y-6">
        {result.changes.map((change, idx) => (
           <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 xl:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-center transition-all hover:border-neutral-600">
              <div className="flex-1 w-full bg-black/40 p-5 rounded-xl border border-neutral-800/50">
                 <span className="text-xs uppercase font-extrabold text-neutral-500 tracking-widest block mb-3">Competitor Approach</span>
                 <p className="text-sm text-neutral-300 leading-relaxed">{change.from}</p>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center text-neutral-600">
                 <svg className="w-8 h-8 opacity-50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Pivot</span>
              </div>
              <div className="flex-1 w-full bg-lime-900/10 p-5 rounded-xl border border-lime-900/30">
                 <span className="text-xs uppercase font-extrabold text-lime-500 tracking-widest block mb-3">Your Strategic Edge</span>
                 <p className="text-sm text-white font-medium leading-relaxed">{change.to}</p>
              </div>
           </div>
        ))}
      </div>

      {result.improvements && result.improvements.length > 0 && (
         <div className="pt-4 space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 tracking-wider uppercase">Strategic Improvements</h3>
            {result.improvements.map((idea, idx) => (
               <div key={idx} className="flex bg-neutral-900 rounded-xl p-6 border border-neutral-800 hover:border-lime-500/30 transition-colors shadow-[0_0_15px_rgba(132,204,22,0.05)]">
                   <div className="w-2 h-2 rounded-full bg-lime-500 mr-4 mt-2 shrink-0"></div>
                   <p className="text-neutral-200 text-base leading-relaxed font-medium">{idea}</p>
               </div>
            ))}
         </div>
      )}
    </div>
  );
}

// --- CHAT TAB ---
function ChatTab({ messages, setMessages }) {
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, chatLoading]);

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const newMessages = [...messages, { role: 'user', content: chatInput }];
    setMessages(newMessages); setChatInput(''); setChatLoading(true);

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newMessages }) });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response || "Error processing" }]);
    } finally { setChatLoading(false); }
  };

  return (
    <div className="h-[85vh] flex flex-col pt-2 pb-6">
        <h2 className="text-3xl font-extrabold text-white mb-6">AI Strategy Chat</h2>
        <div className="bg-black flex-1 rounded-2xl flex flex-col border border-neutral-800 overflow-hidden relative">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center shadow-sm">
                <span className="w-2.5 h-2.5 bg-lime-500 rounded-full animate-pulse mr-3"></span>
                <span className="font-bold text-white tracking-widest uppercase">SnapTracker Assistant</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-black scroll-smooth">
                {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-lime-500 text-black font-semibold rounded-br-sm' : 'bg-neutral-900 text-white border border-neutral-800 rounded-bl-sm'}`}>
                    {msg.content}
                    </div>
                </div>
                ))}
            </div>
            <form onSubmit={sendChatMessage} className="p-4 bg-neutral-900 border-t border-neutral-800 flex">
                <input type="text" className="flex-1 bg-black border border-neutral-700 text-white rounded-xl py-4 px-5 focus:outline-none focus:border-lime-500 mr-3" placeholder="Ask follow-up questions..." value={chatInput} onChange={e => setChatInput(e.target.value)} disabled={chatLoading} />
                <button type="submit" disabled={chatLoading} className="bg-lime-500 text-black font-bold p-4 rounded-xl px-6">Send</button>
            </form>
        </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
