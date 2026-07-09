import { 
  Play, 
  FileText, 
  Award, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { User, Interview } from '../types';

interface DashboardViewProps {
  user: User;
  analytics: {
    performanceTrend: any[];
    scoreBreakdown: any[];
    companyShares: any[];
    resumeScoreTrend: any[];
    summaryStats: {
      totalInterviews: number;
      avgScore: number;
      resumeAnalysesCount: number;
      xpEarned: number;
    };
  } | null;
  history: Interview[];
  onNavigate: (view: string) => void;
  onSelectInterviewForReport: (interview: Interview) => void;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#e11d48'];

export default function DashboardView({ 
  user, 
  analytics, 
  history, 
  onNavigate,
  onSelectInterviewForReport 
}: DashboardViewProps) {
  
  const stats = analytics?.summaryStats || {
    totalInterviews: 0,
    avgScore: 0,
    resumeAnalysesCount: 0,
    xpEarned: 100
  };

  const trendData = analytics?.performanceTrend || [];
  const radarData = analytics?.scoreBreakdown || [];
  const sharesData = analytics?.companyShares || [];

  // Completed mocks list
  const completes = history.filter(i => i.status === 'completed').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Header welcome banner */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl shadow-slate-950/20">
        {/* Glow backdrop */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
              <Sparkles size={12} />
              <span>AI-Powered Career Co-Pilot</span>
            </div>
            <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-white">
              Welcome back, {user.name}!
            </h2>
            <p className="font-sans text-xs md:text-sm text-slate-400 leading-relaxed">
              Your overall average interview score stands at <strong className="text-indigo-300">{stats.avgScore}%</strong>. You are matching skills for <strong className="text-slate-300">{user.targetCompanies.join(', ') || 'top technology firms'}</strong>. Take a custom assessment today to boost your score and readiness level.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('interview-setup')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer font-sans"
            >
              <Play size={14} className="fill-white" />
              <span>Start Mock Interview</span>
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-3 rounded-xl transition-all border border-slate-700 cursor-pointer font-sans"
            >
              <FileText size={14} />
              <span>ATS Resume Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top aggregates grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core aggregate 1 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/30 flex items-center justify-center text-indigo-400">
            <Play size={20} className="fill-indigo-400/20" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">TOTAL INTERVIEWS</p>
            <h3 className="font-sans text-2xl font-bold text-white tracking-tight mt-0.5">{stats.totalInterviews}</h3>
            <p className="font-sans text-[11px] text-slate-400 mt-0.5">Sessions logged</p>
          </div>
        </div>

        {/* Core aggregate 2 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800/30 flex items-center justify-center text-purple-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">AVERAGE SCORE</p>
            <h3 className="font-sans text-2xl font-bold text-white tracking-tight mt-0.5">{stats.avgScore}%</h3>
            <p className="font-sans text-[11px] text-slate-400 mt-0.5">Performance rate</p>
          </div>
        </div>

        {/* Core aggregate 3 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-950 border border-pink-800/30 flex items-center justify-center text-pink-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">RESUME ANALYSES</p>
            <h3 className="font-sans text-2xl font-bold text-white tracking-tight mt-0.5">{stats.resumeAnalysesCount}</h3>
            <p className="font-sans text-[11px] text-slate-400 mt-0.5">ATS checks run</p>
          </div>
        </div>

        {/* Core aggregate 4 */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800/30 flex items-center justify-center text-amber-400">
            <Flame size={20} className="fill-amber-400/10" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">INTERVIEW STREAK</p>
            <h3 className="font-sans text-2xl font-bold text-white tracking-tight mt-0.5">{user.streak} Days</h3>
            <p className="font-sans text-[11px] text-slate-400 mt-0.5">Consecutive logins</p>
          </div>
        </div>
      </div>

      {/* 3. Performance Trend Charts & radar distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-200">Mock Interview Performance Trend</h4>
              <p className="font-sans text-xs text-slate-500">Track your overall score progression across historical mocks</p>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-950/20 px-2 py-1 rounded text-xs text-indigo-400 border border-indigo-900/30">
              <TrendingUp size={12} />
              <span className="font-mono font-bold">Active Growth</span>
            </div>
          </div>

          <div className="h-64">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No mock data recorded. Complete your first mock to populate trend analytics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 12, borderRadius: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    activeDot={{ r: 8 }} 
                    dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Radar score breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div>
            <h4 className="font-sans font-bold text-sm text-slate-200">AI Competency Vector</h4>
            <p className="font-sans text-xs text-slate-500">Analysis of average evaluations across 5 structural domains</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {radarData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No evaluation vector mapped.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={9} />
                  <Radar name="Alex Rivera" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11, borderRadius: 6 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mocks list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-sm text-slate-200">Recent Interview Performance Reports</h4>
            <button 
              onClick={() => onNavigate('interviews')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 font-sans cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {completes.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 font-sans">
              No recent interview sessions logged. Start an interview to see your detailed score summaries here.
            </div>
          ) : (
            <div className="space-y-3">
              {completes.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 hover:border-slate-700/80 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 font-sans font-bold text-sm">
                      {item.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-sans font-semibold text-xs text-slate-200">{item.company}</h5>
                      <p className="font-sans text-[11px] text-slate-400 mt-0.5">{item.jobRole} • <span className="capitalize">{item.interviewType}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-indigo-400">{item.score}%</p>
                      <p className="font-mono text-[9px] text-slate-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectInterviewForReport(item)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold transition-all font-sans cursor-pointer"
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI smart recommendations card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/60 flex items-center justify-center text-indigo-400 border border-indigo-900/30">
              <Sparkles size={14} />
            </div>
            <h4 className="font-sans font-bold text-sm text-slate-200">Recommended Next Mock</h4>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300">Technical Mixed Mock</span>
                <span className="text-[10px] bg-indigo-950/50 border border-indigo-900/20 px-1.5 py-0.5 rounded text-indigo-400 font-bold">Google Pref</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Based on your average React framework performance, a medium difficulty mixed algorithmic + JavaScript design interview with Google parameters is recommended to practice state-scheduling trade-offs.
              </p>
              <button
                onClick={() => onNavigate('interview-setup')}
                className="w-full mt-1.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-semibold text-center border border-indigo-900/30 transition-all cursor-pointer"
              >
                Launch Mock Setup
              </button>
            </div>

            <div className="flex gap-2 items-center text-[11px] text-slate-500 px-1">
              <Clock size={12} />
              <span>Recommended preparation time: 45 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
