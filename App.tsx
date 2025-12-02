import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { 
  LayoutDashboard, Globe, Zap, Leaf, Wind, Sun, 
  TrendingUp, Activity, FileText, Settings, Database 
} from 'lucide-react';
import { DataService } from './data/mockData';
import { GeminiService } from './services/geminiService';
import { Region } from './types';
import { InsightBubble } from './components/InsightBubble';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [activeRegion, setActiveRegion] = useState<Region>('World');
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
  const [fullStory, setFullStory] = useState<string | null>(null);
  
  // Specific Insight States
  const [mixInsight, setMixInsight] = useState<string | null>(null);
  const [mixLoading, setMixLoading] = useState(false);
  
  const [transitionInsight, setTransitionInsight] = useState<string | null>(null);
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Data
  const regions = DataService.getAvailableRegions();
  const stackData = DataService.getStackPlotData(activeRegion);
  const detailedMixData = DataService.getDetailedMixData(activeRegion);
  const latestStats = DataService.getLatestStats(activeRegion);

  useEffect(() => {
    checkApiKey();
    // Reset insights when region changes
    setMixInsight(null);
    setTransitionInsight(null);
    setFullStory(null);
  }, [activeRegion]);

  const checkApiKey = async () => {
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      setApiKeyAvailable(true);
    } else {
      setApiKeyAvailable(false);
    }
  };

  const handleApiKeySelect = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      checkApiKey();
    }
  };

  const generateMixInsight = async () => {
    setMixLoading(true);
    const insight = await GeminiService.analyzeChartData(
      "Energy Mix Evolution (Solar/Wind vs Coal/Gas)",
      detailedMixData,
      activeRegion
    );
    setMixInsight(insight);
    setMixLoading(false);
  };

  const generateTransitionInsight = async () => {
    setTransitionLoading(true);
    const insight = await GeminiService.analyzeChartData(
      "Transition Progress: Fossil Fuels vs Clean Energy share over time",
      stackData,
      activeRegion
    );
    setTransitionInsight(insight);
    setTransitionLoading(false);
  };

  const generateFullStory = async () => {
    setStoryLoading(true);
    const story = await GeminiService.generateFullStory(activeRegion, latestStats);
    setFullStory(story);
    setStoryLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-emerald-500 to-blue-500 p-2 rounded-lg">
                <Database size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                EcoPulse <span className="text-slate-500 font-normal">Data Stories</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {!apiKeyAvailable && (
                <button 
                  onClick={handleApiKeySelect}
                  className="text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md transition-colors animate-pulse"
                >
                  Connect API Key
                </button>
              )}
              <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeRegion === r 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KpiCard 
            label="Renewable Share" 
            value={`${latestStats.renewablesShare.toFixed(1)}%`} 
            subtext="of total generation"
            icon={<Leaf className="text-emerald-400" size={20} />}
            trend="up"
          />
           <KpiCard 
            label="CO2 Emissions" 
            value={`${(latestStats.co2 / 1000).toFixed(2)} Gt`} 
            subtext="Annual estimate"
            icon={<Globe className="text-rose-400" size={20} />}
            trend={latestStats.co2 > 25000 ? "down" : "flat"} // Simplified trend logic
          />
          <KpiCard 
            label="Clean Energy" 
            value={`${latestStats.totalRenewables.toLocaleString()} TWh`} 
            subtext="Solar, Wind, Hydro"
            icon={<Zap className="text-blue-400" size={20} />}
            trend="up"
          />
           <KpiCard 
            label="Fossil Fuels" 
            value={`${latestStats.totalFossil.toLocaleString()} TWh`} 
            subtext="Coal, Gas, Oil"
            icon={<Activity className="text-slate-400" size={20} />}
            trend="down"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Chart 1: The Transition (Area) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-400"/>
                    The Energy Transition
                  </h3>
                  <p className="text-slate-400 text-sm">Comparison of clean vs. fossil fuel sources over time.</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stackData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFossil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="Fossil Fuels (Coal, Oil, Gas)" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fill="url(#colorFossil)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Clean Energy (Solar, Wind, Hydro)" 
                      stackId="1" 
                      stroke="#10b981" 
                      fill="url(#colorClean)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <InsightBubble 
                insight={transitionInsight} 
                isLoading={transitionLoading} 
                onGenerate={generateTransitionInsight}
                hasKey={apiKeyAvailable}
              />
            </div>

            {/* Chart 2: Technology Race (Line) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
               <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <Wind size={18} className="text-cyan-400"/>
                    Technology Race
                  </h3>
                  <p className="text-slate-400 text-sm">Detailed breakdown of key energy sources.</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detailedMixData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Solar" stroke="#fbbf24" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Wind" stroke="#22d3ee" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="Coal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="Gas" stroke="#f87171" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <InsightBubble 
                insight={mixInsight} 
                isLoading={mixLoading} 
                onGenerate={generateMixInsight}
                hasKey={apiKeyAvailable}
              />
            </div>

          </div>

          {/* Right Column: Story Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 sticky top-24 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-500/10 p-2 rounded-lg">
                  <FileText className="text-indigo-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white">The Narrative</h2>
              </div>

              {!apiKeyAvailable ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-700 rounded-lg">
                    <p className="text-slate-400 mb-4">Connect your API key to generate a comprehensive data story for {activeRegion}.</p>
                    <button 
                        onClick={handleApiKeySelect}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Authenticate
                    </button>
                </div>
              ) : !fullStory && !storyLoading ? (
                 <div className="text-center py-12 px-4">
                    <p className="text-slate-400 mb-6">Generate a complete data journalism piece summarizing the trends in {activeRegion}.</p>
                    <button 
                      onClick={generateFullStory}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} />
                      Generate Story
                    </button>
                 </div>
              ) : storyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="relative">
                     <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm animate-pulse">Analyzing 24 years of data points...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{fullStory || ''}</ReactMarkdown>
                  <button 
                    onClick={() => setFullStory(null)}
                    className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline"
                  >
                    Clear Story
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// KPI Card Helper Component
const KpiCard = ({ label, value, subtext, icon, trend }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-slate-500 flex items-center gap-1">
      {trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
      {trend === 'down' && <TrendingUp size={12} className="text-rose-500 rotate-180" />}
      {subtext}
    </div>
  </div>
);

// Icon component for the "Generate" buttons
const Sparkles = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
