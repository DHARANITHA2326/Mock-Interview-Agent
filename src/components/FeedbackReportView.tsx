import { 
  CheckCircle, 
  XCircle, 
  Award, 
  BookOpen, 
  Youtube, 
  MapPin, 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Share2, 
  Download,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Interview } from '../types';

interface FeedbackReportViewProps {
  interview: Interview;
  onBack: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FeedbackReportView({ interview, onBack }: FeedbackReportViewProps) {
  const report = interview.feedbackReport;

  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle size={32} className="text-amber-400 mx-auto" />
        <h4 className="font-sans font-bold text-lg text-slate-200">Analysis Pending</h4>
        <p className="font-sans text-xs text-slate-400 max-w-md mx-auto">
          We are compiling your evaluations. This report is pending AI synthesis. Please wait or complete the mock session.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
        >
          Return to History
        </button>
      </div>
    );
  }

  // Competency data for radar representation
  const radarData = [
    { subject: 'Technical', score: report.technicalScore },
    { subject: 'Communication', score: report.communicationScore },
    { subject: 'Grammar', score: report.grammarScore },
    { subject: 'Logic', score: report.problemSolvingScore },
    { subject: 'Behavioral', score: report.behaviorScore },
  ];

  const handleDownloadPDF = () => {
    alert('Preparing professional PDF report for download... Saved as MockAI_' + interview.company + '_Assessment.pdf');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Shareable report link copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Top action header: Back control and quick share actions */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Share2 size={13} />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* 1. Header scorecard details */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-600/5 blur-3xl rounded-full"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase">
              Assessment Summary
            </div>
            <h2 className="font-sans font-bold text-2xl text-white tracking-tight">
              Mock Assessment: {interview.company}
            </h2>
            <p className="font-sans text-xs text-slate-400">
              Role: <strong className="text-slate-300">{interview.jobRole}</strong> ({interview.department}) • Difficulty: <strong className="text-slate-300 capitalize">{interview.difficulty}</strong>
            </p>
          </div>

          {/* Large overall score gauge widget */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-850 px-5 py-4 rounded-2xl">
            <div className="relative w-16 h-16 rounded-full border-4 border-indigo-500/20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full rotate-45"></div>
              <span className="font-mono font-bold text-xl text-indigo-400">{report.overallScore}%</span>
            </div>
            <div>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">HIRING PROBABILITY</p>
              <h4 className="font-sans text-lg font-bold text-slate-200 tracking-tight">{report.hiringProbabilityScore}%</h4>
              <p className="font-sans text-[10px] text-slate-400">Estimated offer probability</p>
            </div>
          </div>
        </div>

        {/* AI summary text section */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1 text-xs text-indigo-400 font-sans font-bold">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AI Executive Evaluation Summary</span>
          </div>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">
            {report.aiSummary}
          </p>
        </div>
      </div>

      {/* 2. Vector breakdowns and Radar chart grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core competency meters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-5 shadow-lg">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="font-sans font-bold text-sm text-slate-200">Core Evaluation Vectors</h3>
            <p className="font-sans text-xs text-slate-500">Fine-tuned marks from speech, grammar, and solution accuracy</p>
          </div>

          <div className="space-y-4">
            {/* Meter 1 */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Technical Accuracy & Syntax</span>
                <span className="font-mono font-bold text-indigo-400">{report.technicalScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${report.technicalScore}%` }}></div>
              </div>
            </div>

            {/* Meter 2 */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Communication Structure & Context</span>
                <span className="font-mono font-bold text-purple-400">{report.communicationScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${report.communicationScore}%` }}></div>
              </div>
            </div>

            {/* Meter 3 */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Grammar & Phrasings</span>
                <span className="font-mono font-bold text-pink-400">{report.grammarScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: `${report.grammarScore}%` }}></div>
              </div>
            </div>

            {/* Meter 4 */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Tone & Confidence Delivery</span>
                <span className="font-mono font-bold text-rose-400">{report.confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${report.confidenceScore}%` }}></div>
              </div>
            </div>

            {/* Meter 5 */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-slate-300">Algorithmic & Problem Solving</span>
                <span className="font-mono font-bold text-emerald-400">{report.problemSolvingScore}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-850 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${report.problemSolvingScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Competency profile radar visualization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-lg flex flex-col justify-between">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="font-sans font-bold text-sm text-slate-200">Competency Map</h3>
            <p className="font-sans text-xs text-slate-500">Radar representation of relative evaluation indexes</p>
          </div>

          <div className="h-56 flex items-center justify-center my-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={9} />
                <Radar name="Evaluation" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11, borderRadius: 6 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Strengths and weaknesses lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <CheckCircle size={16} className="text-emerald-400" />
            <h3 className="font-sans font-bold text-sm text-slate-200">Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2.5 font-sans text-xs text-slate-400">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-emerald-400 shrink-0 font-bold font-mono">✦</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <XCircle size={16} className="text-rose-400" />
            <h3 className="font-sans font-bold text-sm text-slate-200">Identified Gaps / Weaknesses</h3>
          </div>
          <ul className="space-y-2.5 font-sans text-xs text-slate-400">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-rose-400 shrink-0 font-bold font-mono">⚠️</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Actionable recommendations & personalized Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action roadmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <Compass size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-sm text-slate-200">Personalized Career Learning Path</h3>
          </div>

          <div className="space-y-3 pl-2">
            {report.roadmap.map((step, idx) => (
              <div key={idx} className="flex gap-4 font-sans text-xs relative pb-2 border-l border-slate-800 last:border-none pl-4">
                {/* Node bullet */}
                <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 shadow"></div>
                <div>
                  <h5 className="font-bold text-slate-200 uppercase font-mono text-[10px] tracking-wider text-indigo-400">Phase {idx + 1}</h5>
                  <p className="text-slate-400 leading-relaxed mt-0.5">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Resources guides */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
            <BookOpen size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-sm text-slate-200">Practice Resources</h3>
          </div>

          <div className="space-y-3.5 font-sans text-xs">
            {/* Course Resource */}
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen size={12} className="text-indigo-400" />
                <span>Recommended Courses</span>
              </p>
              {report.recommendedCourses.map((c, i) => (
                <p key={i} className="text-slate-400 pl-4.5 text-[11px] leading-relaxed border-l border-slate-800">{c}</p>
              ))}
            </div>

            {/* Video Resource */}
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Youtube size={12} className="text-rose-400" />
                <span>YouTube Mock Guides</span>
              </p>
              {report.recommendedYouTubeVideos.map((v, i) => (
                <p key={i} className="text-slate-400 pl-4.5 text-[11px] leading-relaxed border-l border-slate-800">{v}</p>
              ))}
            </div>

            {/* Practice Problems */}
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-400" />
                <span>Target Practice Problems</span>
              </p>
              {report.recommendedPracticeProblems.map((p, i) => (
                <p key={i} className="text-slate-400 pl-4.5 text-[11px] leading-relaxed border-l border-slate-800">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
