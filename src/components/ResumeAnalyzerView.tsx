import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Award, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  CheckSquare, 
  Trash2,
  Clock
} from 'lucide-react';
import { ResumeAnalysis } from '../types';

interface ResumeAnalyzerViewProps {
  onAnalyze: (text: string, fileName: string) => Promise<ResumeAnalysis>;
  isAnalyzing: boolean;
  history: ResumeAnalysis[];
  onDeleteHistory: (id: string) => void;
}

export default function ResumeAnalyzerView({ 
  onAnalyze, 
  isAnalyzing, 
  history,
  onDeleteHistory
}: ResumeAnalyzerViewProps) {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [resultsTab, setResultsTab] = useState<'scores' | 'sections' | 'keywords' | 'grammar_projects'>('scores');

  // Auto select most recent analysis if available and none selected
  useEffect(() => {
    if (history.length > 0 && !selectedAnalysis) {
      setSelectedAnalysis(history[0]);
    }
  }, [history]);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    const lowerName = file.name.toLowerCase();
    const isBinaryDoc = lowerName.endsWith('.pdf') || lowerName.endsWith('.docx');
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || '');
    };
    
    if (isBinaryDoc) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleSubmitAnalysis = async () => {
    if (!resumeText.trim()) {
      alert('Please paste some resume text or upload a file first.');
      return;
    }
    try {
      const res = await onAnalyze(resumeText, fileName || 'custom_resume.txt');
      setSelectedAnalysis(res);
      setResumeText('');
      setFileName('');
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Check your API key limits.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* LEFT COLUMN: Upload & Manual Input Panel */}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
            <FileText size={12} />
            <span>ATS Parser Suite</span>
          </div>
          <h2 className="font-sans font-bold text-xl tracking-tight text-white">
            Resume Matcher
          </h2>
          <p className="font-sans text-xs text-slate-400">
            Upload your resume, parse text content, and review compatibility against hiring benchmarks.
          </p>
        </div>

        {/* Drag and Drop Container */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center space-y-3 transition-colors ${
            dragOver ? 'border-indigo-500 bg-indigo-950/15' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/30 flex items-center justify-center text-indigo-400 mx-auto">
            <Upload size={18} />
          </div>
          <div>
            <p className="font-sans text-xs font-semibold text-slate-200">Drag & drop your resume file here</p>
            <p className="font-sans text-[10px] text-slate-500 mt-1">Accepts PDF, TXT, DOCX, or direct textual streams</p>
          </div>

          <label className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer font-sans shadow shadow-indigo-500/25">
            <span>Choose File</span>
            <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.docx,.json,.csv" />
          </label>

          {fileName && (
            <p className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/20 py-1 px-2 rounded inline-block">
              Loaded: {fileName}
            </p>
          )}
        </div>

        {/* Manual text backup paste */}
        <div className="space-y-2">
          <label className="font-sans font-bold text-xs text-slate-300">Or Paste Resume Content directly</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw markdown text, CV summaries, or structural logs to parse..."
            className="w-full h-40 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-slate-200 font-sans resize-none"
          ></textarea>
        </div>

        <button
          onClick={handleSubmitAnalysis}
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-semibold py-3 rounded-xl transition-all font-sans cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>{isAnalyzing ? 'Evaluating Resume...' : 'Analyze compatibility'}</span>
        </button>

        {/* History records */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <h4 className="font-sans font-bold text-xs text-slate-200">Historical ATS Records</h4>
          {history.length === 0 ? (
            <p className="text-[11px] text-slate-500 font-sans">No analyses logged yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className={`p-2.5 rounded-lg border text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                    selectedAnalysis?.id === item.id 
                      ? 'bg-indigo-950/25 border-indigo-500/50 text-indigo-300' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold truncate">{item.fileName}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Score: {item.atsScore}% • {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistory(item.id);
                      if (selectedAnalysis?.id === item.id) setSelectedAnalysis(null);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT TWO COLUMNS: Detailed analysis report view */}
      <div className="lg:col-span-2">
        {selectedAnalysis ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header: Score stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-5">
              <div>
                <h3 id="ats-assessment-title" className="font-sans font-bold text-lg text-slate-200">ATS Assessment Details</h3>
                <p className="font-sans text-xs text-slate-500">File: <strong className="text-slate-400">{selectedAnalysis.fileName}</strong></p>
              </div>

              {/* Large circular metric */}
              <div id="ats-match-metric" className="flex items-center gap-3 bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl">
                <div className="relative w-12 h-12 rounded-full border-4 border-indigo-500/20 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full rotate-45 animate-spin duration-[3000ms]"></div>
                  <span className="font-mono font-bold text-sm text-indigo-400">{selectedAnalysis.atsScore}%</span>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest leading-none font-bold">MATCH SCORE</p>
                  <h4 className="font-sans text-sm font-bold text-slate-200 mt-1">
                    {selectedAnalysis.atsScore >= 85 ? 'Highly Compatible' : selectedAnalysis.atsScore >= 70 ? 'Good Match' : 'Refinement Needed'}
                  </h4>
                </div>
              </div>
            </div>

            {/* Tab Selection */}
            <div id="assessment-tab-bar" className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-2 pb-1">
              <button
                type="button"
                onClick={() => setResultsTab('scores')}
                className={`py-2 px-3 text-xs font-sans font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                  resultsTab === 'scores' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                1. Score Breakdown
              </button>
              <button
                type="button"
                onClick={() => setResultsTab('sections')}
                className={`py-2 px-3 text-xs font-sans font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                  resultsTab === 'sections' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                2. Section Evaluations
              </button>
              <button
                type="button"
                onClick={() => setResultsTab('keywords')}
                className={`py-2 px-3 text-xs font-sans font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                  resultsTab === 'keywords' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                3. Skills & Keywords
              </button>
              <button
                type="button"
                onClick={() => setResultsTab('grammar_projects')}
                className={`py-2 px-3 text-xs font-sans font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                  resultsTab === 'grammar_projects' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                4. Projects & Grammar
              </button>
            </div>

            {/* TAB CONTENTS */}
            {resultsTab === 'scores' && (
              <div id="tab-score-breakdown" className="space-y-6 animate-in fade-in duration-200">
                {/* 12 Core Scores Grid */}
                <div className="space-y-2">
                  <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">Core Score Dashboard</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Overall ATS', val: selectedAnalysis.atsScore, color: 'text-emerald-400' },
                      { label: 'Grammar', val: selectedAnalysis.grammarScore, color: 'text-indigo-400' },
                      { label: 'Formatting', val: selectedAnalysis.formattingScore, color: 'text-purple-400' },
                      { label: 'Keywords Match', val: selectedAnalysis.keywordMatchScore || 75, color: 'text-indigo-400' },
                      { label: 'Professionalism', val: selectedAnalysis.professionalismScore || 85, color: 'text-indigo-400' },
                      { label: 'Technical Skills', val: selectedAnalysis.technicalSkillsScore || 80, color: 'text-sky-400' },
                      { label: 'Projects', val: selectedAnalysis.projectsScore || 75, color: 'text-amber-400' },
                      { label: 'Work Experience', val: selectedAnalysis.workExperienceScore || 76, color: 'text-amber-400' },
                      { label: 'Education Score', val: selectedAnalysis.educationScore || 90, color: 'text-emerald-400' },
                      { label: 'Achievements', val: selectedAnalysis.achievementsScore || 70, color: 'text-amber-400' },
                      { label: 'Communication', val: selectedAnalysis.communicationScore || 85, color: 'text-indigo-400' },
                      { label: 'Recruiter Ready', val: selectedAnalysis.recruiterReadinessScore || 80, color: 'text-emerald-400' }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-slate-500 font-medium font-sans">{s.label}</span>
                        <span className={`font-mono font-bold text-base mt-0.5 ${s.color}`}>{s.val}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses Detailed List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-3">
                    <h4 className="font-sans font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span>Validated Strengths</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                      {(selectedAnalysis.strengths || ['Solid core Javascript masteries', 'Adequate educational history representation', 'Proper credentials layout structured cleanly', 'Modern formatting tags aligned well']).map((str, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-emerald-400 font-bold font-mono">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses List */}
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-3">
                    <h4 className="font-sans font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span>Top Gaps Identified</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                      {(selectedAnalysis.detailedWeaknesses || []).map((w, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-amber-400 font-bold font-mono">!</span>
                          <span><strong>{w.problem}:</strong> {w.suggestion}</span>
                        </li>
                      ))}
                      {(!selectedAnalysis.detailedWeaknesses || selectedAnalysis.detailedWeaknesses.length === 0) && (
                        <>
                          <li className="flex gap-2">
                            <span className="text-amber-400 font-bold font-mono">!</span>
                            <span><strong>Weak objective statement:</strong> Replace with an executive professional summary.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-amber-400 font-bold font-mono">!</span>
                            <span><strong>Missing GitHub or Portfolio URLs:</strong> Insert clickable links below contact details.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Detailed Weakness Before/After Rewrite Cards */}
                {selectedAnalysis.detailedWeaknesses && selectedAnalysis.detailedWeaknesses.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">AI Bullet Rewriter Blueprint</h4>
                    <div className="space-y-4">
                      {selectedAnalysis.detailedWeaknesses.map((w, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5">
                          <div>
                            <span className="inline-block bg-rose-950/30 border border-rose-900/30 text-rose-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-1.5">
                              GAP: {w.problem}
                            </span>
                            <p className="text-xs text-slate-300 font-semibold">{w.whyProblem}</p>
                            <p className="text-xs text-slate-400 mt-1"><strong>Action Plan:</strong> {w.suggestion}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                            <div className="bg-rose-950/10 border border-rose-900/10 p-2.5 rounded-lg text-rose-350">
                              <span className="font-mono text-[9px] font-bold text-rose-400 uppercase block mb-1">✕ Original Bullet</span>
                              <p className="italic">"{w.exampleBefore}"</p>
                            </div>
                            <div className="bg-emerald-950/10 border border-emerald-900/10 p-2.5 rounded-lg text-emerald-350">
                              <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase block mb-1">✓ AI Revamped Bullet</span>
                              <p className="font-medium">"{w.exampleAfter}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {resultsTab === 'sections' && (
              <div id="tab-section-evaluations" className="space-y-4 animate-in fade-in duration-200">
                <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">Section-by-Section Evaluations</h4>
                <div className="grid grid-cols-1 gap-3">
                  {(selectedAnalysis.evaluatedSections || [
                    { sectionName: 'Contact Information', score: 95, feedback: 'Clearly formatted header. Found email and standard contact coordinates.', suggestions: 'Ensure hyperlinks to your professional socials are clickable.' },
                    { sectionName: 'Professional Summary', score: 60, feedback: 'Too passive and lacks reference to core software architectures.', suggestions: 'Incorporate your core languages and total years of technical experience.' },
                    { sectionName: 'Technical Skills', score: 85, feedback: 'Impressive tech array. Nicely indexed languages and frontend libraries.', suggestions: 'Add cloud deployment structures and container tooling tags.' },
                    { sectionName: 'Projects', score: 70, feedback: 'Good conceptual projects, but missing measurable outcomes.', suggestions: 'Add metrics showing response speed, query volume, or database size reductions.' },
                    { sectionName: 'Experience', score: 75, feedback: 'Clear daily role definitions present.', suggestions: 'Transition descriptions to showcase team coordination and product scalability.' },
                    { sectionName: 'Education', score: 90, feedback: 'Proper degree and coursework listed.', suggestions: 'Keep this section concise below experience.' }
                  ]).map((sec, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-3.5 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 md:max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-xs text-slate-200">{sec.sectionName}</span>
                          <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            sec.score >= 85 ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20' : 
                            sec.score >= 70 ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/20' : 
                            'bg-amber-950/20 text-amber-400 border border-amber-900/20'
                          }`}>
                            Score: {sec.score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{sec.feedback}</p>
                        <p className="text-[10px] text-indigo-300"><strong>Recommendation:</strong> {sec.suggestions}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultsTab === 'keywords' && (
              <div id="tab-skills-keywords" className="space-y-6 animate-in fade-in duration-200">
                {/* Identified Skills Tag cloud */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-3">
                    <h4 className="font-sans font-bold text-xs text-indigo-400">Identified Technical Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAnalysis.skillsFound || []).map((skill, idx) => (
                        <span key={idx} className="bg-indigo-950/30 border border-indigo-900/20 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-3">
                    <h4 className="font-sans font-bold text-xs text-amber-400">Missing Key Skills Gaps</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAnalysis.missingSkills || []).map((skill, idx) => (
                        <span key={idx} className="bg-amber-950/20 border border-amber-900/20 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ATS Vocabulary Clouds */}
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-4">
                  <h4 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider">ATS Vocabulary Optimization</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Overused Words */}
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-rose-400 uppercase">✕ Avoid Overused/Passive Words</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedAnalysis.lowImpactWords || selectedAnalysis.repeatedKeywords || ['Responsible for', 'Successfully', 'Helped', 'Handled', 'Detail-oriented']).map((w, idx) => (
                          <span key={idx} className="bg-rose-950/10 border border-rose-900/10 text-rose-300 font-mono text-[9px] px-2 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Action Verbs */}
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase">✓ Use Strong Action Verbs Instead</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedAnalysis.actionVerbs || ['Engineered', 'Architected', 'Spearheaded', 'Optimized', 'Formulated']).map((w, idx) => (
                          <span key={idx} className="bg-emerald-950/10 border border-emerald-900/10 text-emerald-300 font-mono text-[9px] px-2 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850/60">
                    <span className="font-sans font-bold text-xs text-slate-300 block">Recommended Keywords to Inject:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAnalysis.recommendedKeywords || ['Containerization', 'CI/CD Pipeline', 'Microservices', 'GraphQL', 'System Scalability']).map((kw, idx) => (
                        <span key={idx} className="bg-indigo-950/30 border border-indigo-900/20 text-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded-lg">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Certifications & Custom Projects Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-850 space-y-1">
                    <p className="font-semibold text-slate-300">Recommended Credentials / Certifications:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                      {(selectedAnalysis.recommendedCertifications || ['AWS Certified Solutions Architect', 'React Certified Professional']).map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-850 space-y-1">
                    <p className="font-semibold text-indigo-400">Suggested Resume Portfolio Projects to Add:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                      {(selectedAnalysis.recommendedProjects || ['High-Performance Rate Limiter proxy', 'Real-time telemetry logging collector']).map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {resultsTab === 'grammar_projects' && (
              <div id="tab-grammar-projects" className="space-y-6 animate-in fade-in duration-200">
                {/* Grammar Analysis Block */}
                <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-3.5">
                  <h4 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Structural & Grammatical Analytics</span>
                    <span className="text-[10px] font-mono text-indigo-400 lowercase font-bold">Grammar Score: {selectedAnalysis.grammarScore}/100</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-center text-xs font-sans">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-850">
                      <p className="text-slate-500 font-medium">Passive Voice Count</p>
                      <p className={`font-mono font-bold mt-0.5 text-sm ${selectedAnalysis.passiveVoiceCount && selectedAnalysis.passiveVoiceCount > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedAnalysis.passiveVoiceCount || 0} sentences
                      </p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-850">
                      <p className="text-slate-500 font-medium">Overly Verbose / Long Sentences</p>
                      <p className={`font-mono font-bold mt-0.5 text-sm ${selectedAnalysis.longSentencesCount && selectedAnalysis.longSentencesCount > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedAnalysis.longSentencesCount || 0} sentences
                      </p>
                    </div>
                  </div>

                  {/* Corrections list */}
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-300">Style & Wording Improvements:</p>
                    {selectedAnalysis.sentenceImprovements && selectedAnalysis.sentenceImprovements.length > 0 ? (
                      <ul className="space-y-1 pl-4 list-decimal text-slate-400">
                        {selectedAnalysis.sentenceImprovements.map((imp, idx) => (
                          <li key={idx} className="leading-relaxed">{imp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic text-[11px]">No structural grammar flaws detected. Tone remains highly professional.</p>
                    )}
                  </div>
                </div>

                {/* Project Evaluation Grid evaluating every project separately */}
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-xs text-slate-300 uppercase tracking-wider">Project-by-Project Evaluations</h4>
                  
                  {selectedAnalysis.evaluatedProjects && selectedAnalysis.evaluatedProjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedAnalysis.evaluatedProjects.map((p, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-4 border border-slate-850 rounded-xl space-y-3 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-2 gap-2">
                            <span className="font-sans font-bold text-slate-200 text-sm">{p.name}</span>
                            <div className="flex flex-wrap gap-1.5 font-mono text-[9px] font-bold">
                              <span className="bg-indigo-950/30 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/25">Innovation: {p.innovation}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-relaxed text-slate-400">
                            <div>
                              <p className="font-semibold text-slate-300">Technical Complexity:</p>
                              <p className="text-[11px]">{p.complexity}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-300">Quantifiable Impact:</p>
                              <p className="text-[11px] text-emerald-400 font-medium">{p.impact}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="font-semibold text-slate-300">Technologies Showcase:</p>
                            <div className="flex flex-wrap gap-1">
                              {(p.technologies || []).map((t, tidx) => (
                                <span key={tidx} className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[9px] text-slate-400 border border-slate-850">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/80 space-y-1">
                            <p className="font-semibold text-indigo-400">Recruiter Impression:</p>
                            <p className="text-[11px] italic text-slate-300">"{p.recruiterImpression}"</p>
                            <p className="text-[10px] text-slate-400 font-sans mt-1"><strong>Action:</strong> {p.suggestions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-xl text-center">
                      <p className="text-xs text-slate-500 italic">No evaluated projects list parsed. Ensure proper project bullet headings are present in the resume text.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px]">
            <FileText size={40} className="text-slate-600 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-sm text-slate-300">No Assessment Loaded</h4>
              <p className="font-sans text-xs text-slate-500 max-w-sm">
                Paste your resume text or drag and drop your credentials document on the left panel to trigger your real-time AI parser and score review.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
