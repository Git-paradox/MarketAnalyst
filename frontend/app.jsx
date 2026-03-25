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

function DifferentiationGraph({ matrix }) {
   if (!matrix || matrix.length === 0) return null;
   const MAX_HEIGHT = 160; 
   return (
      <div className="flex items-end justify-around space-x-4 h-[250px] mt-8 bg-neutral-900/40 border border-neutral-800 p-6 rounded-2xl w-full relative">
         <div className="absolute top-5 left-6 text-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center">
            Strategic Differentiation Level <InfoTooltip text="Calculated unique variance between your product's positioning and the competitor's market data." />
         </div>
         {matrix.map((comp, idx) => {
             const diff = 100 - Math.round(comp.similarity || 0);
             return (
                 <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end mt-8">
                     <div className="text-lime-400 font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 text-sm bg-black px-2 py-1 rounded border border-lime-900 whitespace-nowrap">{diff}% Unique</div>
                     <div className="w-full max-w-[60px] bg-gradient-to-t from-neutral-800 to-lime-500 rounded-t-sm transition-all shadow-[0_0_15px_rgba(132,204,22,0.1)] group-hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]" style={{ height: `${(diff / 100) * MAX_HEIGHT}px` }}></div>
                     <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate w-full text-center border-t border-neutral-800 pt-3">{comp.name}</div>
                 </div>
             );
         })}
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
        <Route path="/" element={<MarketingPage user={user} />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/capabilities" element={<CapabilitiesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        <Route path="/auth" element={
            user ? <Navigate to="/analyze" replace /> : <AuthPage setUser={setUser} />
        } />
        
        <Route path="/analyze" element={
            !user ? <Navigate to="/auth" replace /> : <AnalysisPage setAnalysisData={setAnalysisData} setChatMessages={setChatMessages} user={user} handleLogout={handleLogout} />
        } />
        
        <Route path="/dashboard/*" element={
            !user ? <Navigate to="/auth" replace /> : <DashboardLayout data={analysisData} chatMessages={chatMessages} setChatMessages={setChatMessages} setAnalysisData={setAnalysisData} user={user} handleLogout={handleLogout} />
        } />
      </Routes>
    </HashRouter>
  );
}

// --- COMMON NAVBAR ---
function Navbar({ user }) {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center font-black text-black text-xl">S</div>
            <span className="text-xl font-bold tracking-tighter text-white">SnapTracker</span>
        </button>
        <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-6 text-sm font-semibold text-neutral-400">
                <button onClick={() => navigate('/intelligence')} className="hover:text-lime-500 transition-colors">Intelligence</button>
                <button onClick={() => navigate('/capabilities')} className="hover:text-lime-500 transition-colors">Capabilities</button>
                <button onClick={() => navigate('/pricing')} className="hover:text-lime-500 transition-colors">Pricing</button>
            </div>
            {user ? (
                <button onClick={() => navigate('/analyze')} className="bg-lime-500 text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-lime-400 transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)]">Enter Console</button>
            ) : (
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/auth')} className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Login</button>
                    <button onClick={() => navigate('/auth')} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-lime-500 transition-all">Get Started</button>
                </div>
            )}
        </div>
    </nav>
  );
}

// --- MARKETING PAGE ---
function MarketingPage({ user }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-lime-500/30 overflow-x-hidden">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-4 py-1.5 rounded-full mb-8 animate-fade-in shadow-xl">
                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">v2.4 Competitive Engine Live</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                MARKET INTELLIGENCE <br/> <span className="text-lime-500">REDEFINED.</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                Autonomous competitive reconnaissance. We scrape, analyze, and track your market rivals in real-time so you don't have to.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button onClick={() => navigate('/auth')} className="w-full sm:w-auto px-10 py-5 bg-lime-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(132,204,22,0.3)] uppercase tracking-wider">Start Free Recon</button>
            </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { title: "Real-time Scraping", desc: "Our agents crawl competitor sites directly to bypass cached data and extract live features.", icon: "⚡" },
                    { title: "Sentiment Synthesis", desc: "Automated analysis of G2, Capterra, and Trustpilot reviews to find their hidden weaknesses.", icon: "🧠" },
                    { title: "Financial Forensics", desc: "Estimated revenue, user base, and market saturation levels for every brand you track.", icon: "📊" },
                    { title: "Historical Diffing", desc: "Monitor every word they change. We notify you the second they update their pricing or tech.", icon: "👁️" }
                ].map((feat, i) => (
                    <div key={i} className="p-8 bg-black border border-neutral-900 rounded-3xl hover:border-lime-500/50 transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:scale-125 transition-transform">{feat.icon}</div>
                        <div className="text-3xl mb-6">{feat.icon}</div>
                        <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Why Section */}
      <section id="about" className="py-24 px-6 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">WHY SNAPTRACKER?</h2>
                <div className="space-y-8">
                    <div className="flex items-start space-x-6">
                        <div className="bg-lime-900/20 p-3 rounded-xl border border-lime-900/50 text-lime-500 font-bold">01</div>
                        <div>
                            <h4 className="font-bold text-xl mb-2 italic">Ditch the Manual Spreadsheet</h4>
                            <p className="text-neutral-500">Stop wasting 20 hours a week checking URLs manually. Our AI builds your comparison matrix in 60 seconds.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-6">
                        <div className="bg-lime-900/20 p-3 rounded-xl border border-lime-900/50 text-lime-500 font-bold">02</div>
                        <div>
                            <h4 className="font-bold text-xl mb-2 italic">Ruthless Strategic Edge</h4>
                            <p className="text-neutral-500">We don't just summarize; we find the "Gaps". Learn exactly why their sales are dropping and why yours should rise.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-neutral-900 rounded-[40px] p-8 aspect-square border border-neutral-800 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lime-500/5 to-transparent"></div>
                {/* Visual Placeholder for a complex vector-style map */}
                <div className="h-full w-full flex items-center justify-center">
                    <div className="relative">
                        <div className="w-64 h-64 border-2 border-lime-500/20 rounded-full flex items-center justify-center animate-spin-slow">
                            <div className="w-4 h-4 bg-lime-500 rounded-full shadow-[0_0_20px_rgba(132,204,22,0.8)]"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-4xl font-black text-white">SNAP</div>
                            <div className="text-xs font-bold text-neutral-500 tracking-[0.4em] uppercase">Intelligence</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-lime-500 text-black relative z-10 overflow-hidden">
         <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
         <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.8] tracking-tighter">STOP GUESSING. <br/> START DOMINATING.</h2>
         <button onClick={() => navigate('/auth')} className="bg-black text-white px-12 py-6 rounded-3xl text-xl font-black hover:scale-105 transition-all shadow-2xl uppercase tracking-widest">Deploy SnapTracker Agent</button>
      </section>

      <footer className="py-12 px-6 border-t border-neutral-900 text-center">
        <p className="text-neutral-600 font-bold tracking-widest text-xs uppercase">© 2026 SnapTracker Intelligence Platform. All rights reserved.</p>
      </footer>
    </div>
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

// --- INTELLIGENCE PAGE ---
function IntelligencePage({ user }) {
    const navigate = useNavigate();
    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-lime-500/30 overflow-x-hidden pt-32 pb-24 px-6">
            <Navbar user={user} />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9]">MISSION CONTROL <br/><span className="text-lime-500">INTELLIGENCE</span></h1>
                <p className="text-xl text-neutral-400 mb-12 italic leading-relaxed">Our proprietary Llama-3.3 Powered Recon Engine bypasses traditional static data to fetch live, raw website telemetry.</p>
                <div className="space-y-12">
                    <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-lime-400 uppercase tracking-widest">01. Autonomous Brand Discovery</h2>
                        <p className="text-neutral-400">Supply natural language brand names. Our engine resolves specific URLs, clones the Document Object Model (DOM), and synthesizes it into actionable competitor metrics instantaneously.</p>
                    </div>
                    <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-lime-400 uppercase tracking-widest">02. Vector Correlation</h2>
                        <p className="text-neutral-400">We analyze the semantic distance between your product pitch and every competitor's landing page. This yields a mathematically precise "Differentiation Index" to reveal your unique market edge.</p>
                    </div>
                    <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-lime-400 uppercase tracking-widest">03. Sales Correlation Engine</h2>
                        <p className="text-neutral-400">Input your internal sales trends and our AI cross-references them with competitor launch cycles. We explain exactly which rival feature killed your conversion rate last quarter.</p>
                    </div>
                    <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl">
                        <h2 className="text-2xl font-bold mb-4 text-lime-400 uppercase tracking-widest">04. Reputation Data Pulse</h2>
                        <p className="text-neutral-400">SnapTracker doesn't just look at websites. We ingest verified customer sentiment from G2, Capterra, and Trustpilot to identify the exact friction points your competitors' users are complaining about.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- CAPABILITIES PAGE ---
function CapabilitiesPage({ user }) {
    const navigate = useNavigate();
    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-lime-500/30 pt-32 pb-24 px-6 text-center">
            <Navbar user={user} />
            <div className="max-w-5xl mx-auto">
                <h1 className="text-6xl font-black mb-16 tracking-tighter uppercase">Platform <span className="text-lime-500">Capabilities</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-3xl text-left">
                        <h3 className="text-2xl font-bold mb-4">Real-time Scraping</h3>
                        <p className="text-neutral-400">Bypass caches. SnapTracker performs live, multi-threaded scrapes of every competitor simultaneously.</p>
                    </div>
                    <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-3xl text-left">
                        <h3 className="text-2xl font-bold mb-4">Historical Diffing</h3>
                        <p className="text-neutral-400">Monitor word-level changes. We detect even the slightest messaging pivots on competitor landing pages.</p>
                    </div>
                    <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-3xl text-left">
                        <h3 className="text-2xl font-bold mb-4">Financial Metadata</h3>
                        <p className="text-neutral-400">Estimated revenue and user base counts for every tracked competitor, delivered instantly.</p>
                    </div>
                    <div className="p-10 bg-neutral-900 border border-neutral-800 rounded-3xl text-left">
                        <h3 className="text-2xl font-bold mb-4">Review Synthesis</h3>
                        <p className="text-neutral-400">Direct integration with sentiment data from G2 and Capterra to highlight competitor weaknesses.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PRICING PAGE ---
function PricingPage({ user }) {
    const navigate = useNavigate();
    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-lime-500/30 pt-32 pb-24 px-6">
            <Navbar user={user} />
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-6xl font-black mb-16 tracking-tighter uppercase">Transparent <span className="text-lime-500">Pricing</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-10 bg-black border border-neutral-800 rounded-[40px] flex flex-col items-center">
                        <h3 className="text-xl font-bold text-neutral-500 uppercase tracking-widest mb-4">Starter</h3>
                        <div className="text-4xl font-black mb-8">$0<span className="text-sm font-normal text-neutral-500">/mo</span></div>
                        <ul className="text-sm text-neutral-400 space-y-4 mb-10 flex-1">
                            <li>3 Analyses / month</li>
                            <li>Basic Multi-Matrix</li>
                            <li>Public Intel Sources</li>
                        </ul>
                        <button onClick={() => navigate('/auth')} className="w-full py-4 bg-neutral-900 rounded-2xl font-bold hover:bg-neutral-800 transition-all">Join Free</button>
                    </div>
                    <div className="p-10 bg-lime-500 text-black border-4 border-lime-400 rounded-[40px] flex flex-col items-center shadow-[0_0_50px_rgba(132,204,22,0.2)]">
                        <h3 className="text-xl font-extrabold uppercase tracking-widest mb-4 text-lime-900">Pro</h3>
                        <div className="text-4xl font-black mb-8 tracking-tighter">$49<span className="text-sm font-bold opacity-50">/mo</span></div>
                        <ul className="text-sm font-bold space-y-4 mb-10 flex-1">
                            <li>Unlimited Matrix Runs</li>
                            <li>Sales Trend Correlation</li>
                            <li>G2/Capterra Reputation</li>
                            <li>Priority Recon Support</li>
                        </ul>
                        <button onClick={() => navigate('/auth')} className="w-full py-4 bg-black text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Deploy Pro Agent</button>
                    </div>
                    <div className="p-10 bg-black border border-neutral-800 rounded-[40px] flex flex-col items-center">
                        <h3 className="text-xl font-bold text-neutral-500 uppercase tracking-widest mb-4">Enterprise</h3>
                        <div className="text-4xl font-black mb-8 tracking-tighter">Custom</div>
                        <ul className="text-sm text-neutral-400 space-y-4 mb-10 flex-1">
                            <li>Custom Scraping Proxies</li>
                            <li>Internal CRM Sync</li>
                            <li>Dedicated Intelligence Agent</li>
                        </ul>
                        <button className="w-full py-4 bg-neutral-900 rounded-2xl font-bold hover:bg-neutral-800 transition-all">Contact Sales</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- ANALYSIS PAGE (FORMERLY LANDING PAGE) ---
function AnalysisPage({ setAnalysisData, setChatMessages, user, handleLogout }) {
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
          Dominate Your Market with AI Intelligence. <br/> Enter your product pitch and target competitor names.
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
            <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-medium relative z-10">{result.insight || "No insights generated."}</p>
        </div>

        <div className="bg-black rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">Metrics</h3>
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-medium text-sm">Target Similarity <InfoTooltip text="How closely your product aligns with the targeted competitor base mathematically."/></span>
                <span className="text-3xl font-bold text-lime-400">{Math.round(result.similarity)}%</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2"><div className="bg-lime-500 h-2 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.5)]" style={{ width: `${result.similarity || 0}%` }}></div></div>
            </div>
            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-medium text-sm">AI Confidence <InfoTooltip text="The LLM's internal confidence parameter regarding the objective accuracy of this entire matrix."/></span>
                <span className="text-3xl font-bold text-lime-400">{Math.round(result.confidence)}%</span>
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

      <DifferentiationGraph matrix={result.matrix} />

      {/* Competitor Matrix Details */}
      {result.matrix && result.matrix.length > 0 && (
          <div className="bg-black rounded-2xl p-6 border border-neutral-800 mt-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Competitive Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.matrix.map((comp, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl transition-all hover:border-lime-500/50 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-extrabold text-white truncate max-w-[65%]">{comp.name}</h4>
                            <span className="bg-black text-lime-400 text-[10px] font-bold px-2 py-1 rounded-md border border-neutral-800 uppercase tracking-tighter shrink-0">{Math.round(comp.similarity)}% Vector</span>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-black border border-neutral-800 rounded-lg">
                                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest block mb-1">Est. Revenue</span>
                                    <p className="text-xs font-bold text-white italic">{comp.revenue || "Private"}</p>
                                </div>
                                <div className="p-2 bg-black border border-neutral-800 rounded-lg">
                                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest block mb-1">User Base</span>
                                    <p className="text-xs font-bold text-white italic">{comp.user_base || "Unknown"}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest flex items-center mb-1">Their Strategy (Strength)</span>
                                <p className="text-xs text-neutral-400 leading-relaxed font-medium">{comp.strength}</p>
                            </div>
                            <div className="p-3 bg-lime-950/20 border border-lime-900/30 rounded-lg">
                                <span className="text-[10px] uppercase font-bold text-lime-500 tracking-widest flex items-center mb-1">Their Vulnerability (Weakness)</span>
                                <p className="text-xs text-neutral-400 leading-relaxed font-medium">{comp.weakness}</p>
                            </div>

                            {comp.review_summary && (
                                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg border-l-2 border-l-lime-500">
                                    <span className="text-[10px] uppercase font-bold text-white tracking-widest flex items-center mb-2">
                                        Market Sentiment (Reviews)
                                    </span>
                                    <p className="text-[11px] text-neutral-400 leading-tight italic">"{comp.review_summary}"</p>
                                </div>
                            )}
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
