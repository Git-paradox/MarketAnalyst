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

// --- TOP LEVEL APP ---
function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage setAnalysisData={setAnalysisData} setChatMessages={setChatMessages} />} />
        <Route path="/dashboard/*" element={<DashboardLayout data={analysisData} chatMessages={chatMessages} setChatMessages={setChatMessages} />} />
      </Routes>
    </HashRouter>
  );
}

// --- LANDING PAGE ---
function LandingPage({ setAnalysisData, setChatMessages }) {
  const [productInfo, setProductInfo] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const analyzeCompetitor = async (e) => {
    e.preventDefault();
    if (!productInfo || !competitorUrl) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_info: productInfo, competitor_url: competitorUrl })
      });
      
      let data;
      try { data = await response.json(); } catch (e) { throw new Error('Invalid JSON response from server.'); }
      
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to analyze competitor.');
      
      setAnalysisData(data);
      setChatMessages([
        { role: 'assistant', content: `Analysis complete. I've cross-referenced customer reviews for ${competitorUrl} with your product information. Ask me anything else about this comparison!` }
      ]);
      navigate('/dashboard/overview');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-gray-200">
      <div className="text-center max-w-4xl mx-auto mb-10 animate-slide-down">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 text-white drop-shadow-xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600">MarkAnalystAI</span>
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto font-medium">
          Dominate Your Market with AI Intelligence. <br/> Enter your product pitch and a competitor's URL to instantly scrape and compare against thousands of simulated G2/Capterra reviews.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto bg-neutral-900 rounded-2xl p-8 card-shadow mb-8 animate-slide-down border border-lime-500/20 relative overflow-hidden" style={{animationDelay: '0.1s'}}>
        {/* Acid green flair */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-lime-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-lime-400 rounded-full mix-blend-multiply filter blur-[80px] opacity-10 pointer-events-none"></div>
        
        <form onSubmit={analyzeCompetitor} className="flex flex-col gap-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold tracking-wide text-neutral-300 mb-2 uppercase">Your Product Information</label>
            <textarea
              required
              rows="4"
              className="w-full bg-black border border-neutral-700 rounded-xl py-3 px-4 text-neutral-200 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder-neutral-600 shadow-inner"
              placeholder="e.g. We are a fast, scalable CRM built for startups. We feature AI-driven follow ups..."
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold tracking-wide text-neutral-300 mb-2 uppercase">Competitor URL</label>
            <input
              type="url"
              required
              className="w-full bg-black border border-neutral-700 rounded-xl py-4 px-4 text-neutral-200 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all placeholder-neutral-600 shadow-inner"
              placeholder="https://competitor.com"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-lime-500 hover:bg-lime-400 text-black font-extrabold tracking-widest py-4 px-8 rounded-xl transition duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:transform-none flex items-center justify-center shadow-lg shadow-lime-500/20 uppercase"
          >
            {loading ? (
              <span className="flex items-center">
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Intel...
              </span>
            ) : 'Analyze Competitor'}
          </button>
        </form>
      </div>

      {error && (
        <div className="w-full max-w-3xl mx-auto bg-red-900/30 border border-red-800 text-red-400 px-6 py-4 rounded-xl mb-8 animate-fade-in flex items-start shadow-lg">
          <span className="text-3xl mr-3">⚠️</span>
          <div>
            <h3 className="font-bold text-lg text-red-300">Analysis Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- DASHBOARD LAYOUT ---
function DashboardLayout({ data, chatMessages, setChatMessages }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!data) {
      navigate('/', { replace: true });
    }
  }, [data, navigate]);

  if (!data) return null;

  // Redirect /dashboard to /dashboard/overview
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
     return <Navigate to="/dashboard/overview" replace />;
  }

  const tabs = [
    { name: '🔥 Overview', path: '/dashboard/overview' },
    { name: '⚔️ Compare', path: '/dashboard/compare' },
    { name: '💬 AI Chat', path: '/dashboard/chat' }
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-black selection:bg-lime-500/30 font-sans">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col shrink-0 relative z-20">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-lime-600 drop-shadow-lg">
            MarkAnalystAI
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden flex md:flex-col gap-2 md:gap-0 font-semibold tracking-wide">
          {tabs.map(tab => {
            const isActive = location.pathname.includes(tab.path);
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className={`flex-1 md:flex-none px-4 py-4 rounded-xl transition-all duration-200 ${isActive ? 'bg-lime-500 text-black shadow-[0_0_15px_rgba(132,204,22,0.3)]' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-neutral-800 hidden md:block">
          <button onClick={() => navigate('/')} className="w-full text-center text-sm font-semibold tracking-wider uppercase text-neutral-500 hover:text-white transition-colors py-2">
            ← New Analysis
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative p-4 md:p-10 scroll-smooth">
        <div className="max-w-5xl mx-auto animate-fade-in relative z-10 h-full">
          <Routes>
            <Route path="overview" element={<OverviewTab result={data} />} />
            <Route path="compare" element={<CompareTab result={data} />} />
            <Route path="chat" element={<ChatTab messages={chatMessages} setMessages={setChatMessages} />} />
          </Routes>
        </div>
      </div>
      
    </div>
  );
}

// --- TAB COMPONENTS ---

function OverviewTab({ result }) {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center space-x-3 mb-2">
        <h2 className="text-3xl font-extrabold text-white">Analysis Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core AI Insight */}
        <div className="md:col-span-2 rounded-2xl p-8 insight-gradient card-shadow relative overflow-hidden group hover:shadow-[0_0_40px_rgba(132,204,22,0.15)] transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500 pointer-events-none text-lime-500">
            <span className="text-8xl">✦</span>
            </div>
            <div className="flex items-center space-x-3 mb-5">
            <span className="text-lime-500 text-3xl">🔥</span>
            <h2 className="text-xl font-extrabold tracking-widest text-lime-400 uppercase">Competitive Intelligence</h2>
            </div>
            <p className="text-xl md:text-2xl leading-relaxed text-neutral-200 font-medium relative z-10">
            {result.insight || "No significant insights generated."}
            </p>
        </div>

        {/* Metrics Board */}
        <div className="bg-neutral-900 rounded-2xl p-6 card-shadow border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Metrics & Sources</h3>
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-medium text-sm">Similarity to Competitor</span>
                <span className="text-3xl font-bold text-lime-400">{result.similarity}%</span>
                </div>
                <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-neutral-800">
                <div className="bg-lime-500 h-2 rounded-full progress-bar-fill shadow-[0_0_10px_rgba(132,204,22,0.5)]" style={{ width: `${result.similarity || 0}%` }}></div>
                </div>
            </div>
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-neutral-400 font-medium text-sm">AI Confidence</span>
                    <div className="group relative flex items-center justify-center cursor-help">
                    <svg className="w-4 h-4 text-neutral-500 hover:text-lime-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-black border border-lime-500/50 rounded-lg text-xs leading-relaxed text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-2xl text-center">
                        Confidence level based on competitor documentation and verified review data.
                    </div>
                    </div>
                </div>
                <span className="text-3xl font-bold text-lime-400">{result.confidence}%</span>
                </div>
                <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-neutral-800">
                <div className="bg-lime-500 h-2 rounded-full progress-bar-fill shadow-[0_0_10px_rgba(132,204,22,0.5)]" style={{ width: `${result.confidence || 0}%` }}></div>
                </div>
            </div>

            {result.sources_decided && result.sources_decided.length > 0 && (
                <div className="mt-8 p-4 bg-black border border-neutral-800 rounded-xl">
                <span className="text-xs text-neutral-500 block mb-3 font-bold uppercase tracking-widest">Knowledge Sources Mined</span>
                <div className="flex flex-wrap gap-2">
                    {result.sources_decided.map((src, i) => (
                        <span key={i} className="px-2 py-1.5 text-xs font-semibold bg-neutral-900 shadow-inner text-lime-400 border border-lime-500/20 rounded">
                        {src}
                        </span>
                    ))}
                </div>
                </div>
            )}
        </div>

        {/* Classification */}
        <div className="bg-neutral-900 rounded-2xl p-6 card-shadow border border-neutral-800 flex flex-col justify-center gap-8">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Classification</h3>
            <div>
            <span className="text-xs text-neutral-500 block mb-3 font-semibold uppercase tracking-wider">Insight Type</span>
            <span className="inline-flex items-center px-4 py-3 rounded-xl text-md font-bold bg-black text-lime-400 border border-lime-500/20 shadow-inner w-full justify-center">
                <span className="mr-3 text-2xl">{icons[result.change_type] || '🎯'}</span> 
                {result.change_type ? result.change_type.charAt(0).toUpperCase() + result.change_type.slice(1) : 'Opportunity'}
            </span>
            </div>
            
            <div>
            <span className="text-xs text-neutral-500 block mb-3 font-semibold uppercase tracking-wider">Strategic Impact</span>
            <span className={`inline-flex items-center px-4 py-3 rounded-xl text-md justify-center w-full font-black tracking-widest uppercase border shadow-inner ${impactColors[result.impact] || impactColors.high}`}>
                {result.impact ? result.impact : 'HIGH'}
            </span>
            </div>
        </div>

      </div>
    </div>
  );
}

function CompareTab({ result }) {
  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-3xl font-extrabold text-white mb-2">Strategy & Comparison</h2>

      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 card-shadow border border-neutral-800">
        <div className="flex items-center space-x-3 mb-8">
            <span className="text-neutral-400 text-3xl">⚔️</span>
            <h3 className="text-2xl font-bold text-white">Direct Comparison</h3>
        </div>
        
        {result.changes && result.changes.length > 0 ? (
            <div className="space-y-6">
            {result.changes.map((change, idx) => (
                <div key={idx} className="bg-black rounded-2xl p-6 border border-neutral-800/80 hover:border-lime-500/30 transition-colors shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                {change.from && (
                    <div className="flex flex-col space-y-3 p-4 bg-neutral-900/40 rounded-xl border border-neutral-800">
                    <span className="select-none inline-flex items-center justify-center w-max px-3 h-7 rounded bg-red-900/20 text-red-500 font-extrabold tracking-widest text-xs border border-red-900/50">COMPETITOR</span>
                    <p className="text-neutral-400 text-sm md:text-base leading-relaxed">{change.from}</p>
                    </div>
                )}
                <div className="flex flex-col space-y-3 p-4 bg-lime-900/10 rounded-xl border border-lime-900/20">
                    <span className="select-none inline-flex items-center justify-center w-max px-3 h-7 rounded bg-lime-900/20 text-lime-500 font-extrabold tracking-widest text-xs border border-lime-900/50">YOUR PRODUCT</span>
                    <p className="text-neutral-100 font-medium text-sm md:text-base leading-relaxed">{change.to}</p>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-16 text-neutral-500 bg-black rounded-xl border border-dashed border-neutral-800">
            <p className="text-lg">No specific direct comparison points generated.</p>
            </div>
        )}
      </div>

      {/* Improvements */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 card-shadow border border-neutral-800">
            <div className="flex items-center space-x-3 mb-8">
            <span className="text-lime-500 text-3xl">💡</span>
            <h3 className="text-2xl font-bold text-white">Actionable Next Steps</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
            {result.improvements.map((idea, idx) => (
                <div key={idx} className="flex items-start space-x-4 bg-black rounded-xl p-6 border border-neutral-800 hover:border-lime-500/20 transition-all shadow-md group">
                <span className="text-lime-500 mt-1 text-xl group-hover:scale-125 transition-transform duration-300">✦</span>
                <p className="text-neutral-200 text-base md:text-lg font-medium leading-relaxed">{idea}</p>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}

function ChatTab({ messages, setMessages }) {
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef(null);

  // SCROLL BUG FIX: Scroll only occurs inside this container!
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const newMessages = [...messages, { role: 'user', content: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Chat failed');
      
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="h-[85vh] flex flex-col pt-2 pb-6">
        <h2 className="text-3xl font-extrabold text-white mb-6">AI Strategy Chat</h2>
        <div className="bg-neutral-900 flex-1 rounded-2xl flex flex-col card-shadow border border-lime-500/30 overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-black px-6 py-4 border-b border-neutral-800 flex items-center justify-between z-10 shadow-sm">
                <h3 className="font-bold text-white tracking-widest uppercase flex items-center space-x-3">
                <span className="w-2.5 h-2.5 bg-lime-500 rounded-full animate-pulse shadow-[0_0_10px_#84cc16]"></span>
                <span>MarkAnalystAI Assistant</span>
                </h3>
            </div>
            
            {/* Scrollable Chat History Container (FIXED SCROLL) */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050505] scroll-smooth">
                {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed ${msg.role === 'user' ? 'bg-lime-500 text-black font-semibold rounded-br-sm shadow-[0_0_15px_rgba(132,204,22,0.15)]' : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-bl-sm shadow-md'}`}>
                    {msg.content}
                    </div>
                </div>
                ))}
                {chatLoading && (
                <div className="flex justify-start">
                    <div className="bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-2xl rounded-bl-sm px-6 py-4 flex items-center space-x-2">
                    <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                    </div>
                </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={sendChatMessage} className="p-4 bg-black border-t border-neutral-800 flex items-center space-x-3 z-10">
                <input
                type="text"
                className="flex-1 bg-neutral-900 border border-neutral-700 text-white font-medium rounded-xl py-4 px-5 focus:outline-none focus:border-lime-500 placeholder-neutral-500 transition-colors shadow-inner"
                placeholder="Ask follow-up questions about customer reviews or feature comparisons..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                autoFocus
                />
                <button
                type="submit"
                disabled={chatLoading}
                className="bg-lime-500 hover:bg-lime-400 text-black font-bold p-4 rounded-xl transition-all disabled:opacity-50 transform hover:scale-[1.03] active:scale-95 shadow-[0_0_15px_rgba(132,204,22,0.2)]"
                >
                <svg className="w-6 h-6 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
