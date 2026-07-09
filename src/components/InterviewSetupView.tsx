import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, RefreshCw, Cpu, Brain, CheckSquare, Square, User as UserIcon, BookOpen, GraduationCap, Calendar, Mail, FileText, ChevronRight, X } from 'lucide-react';
import { InterviewType, Difficulty, User } from '../types';

interface InterviewSetupViewProps {
  user: User;
  onGenerateInterview: (config: {
    company: string;
    jobRole: string;
    department: string;
    experience: string;
    difficulty: Difficulty;
    interviewType: InterviewType;
    questionCount: number;
    skills: string[];
    candidateDetails?: {
      fullName: string;
      registerNumber: string;
      collegeName: string;
      department: string;
      year: string;
      email: string;
      domain: string;
      experienceLevel: string;
    };
  }) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

const SUPPORTED_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Adobe', 'Oracle', 
  'IBM', 'Cisco', 'Intel', 'Salesforce', 'Zoho', 'Freshworks', 'TCS', 'Infosys', 
  'Wipro', 'Cognizant', 'Capgemini', 'Accenture', 'Deloitte', 'EY', 'PwC', 'KPMG', 
  'HCL', 'Tech Mahindra', 'L&T'
];

const JOB_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Engineer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Specialist', 'Product Manager', 'Cloud Architect',
  'Systems Administrator', 'Cybersecurity Analyst', 'Database Engineer', 'QA Engineer'
];

const SKILLS_PRESETS = [
  'Algorithms', 'Data Structures', 'React', 'TypeScript', 'Node.js', 'Python', 'Java',
  'SQL', 'System Design', 'Docker', 'Kubernetes', 'REST APIs', 'Cloud Computing',
  'Object Oriented Programming', 'Microservices', 'Communication', 'Conflict Resolution',
  'Agile Methodologies', 'Leadership', 'Emotional Intelligence'
];

const DEPARTMENTS = [
  'Core Platforms', 'Frontend Guild', 'Enterprise Cloud', 'Artificial Intelligence',
  'Data Engineering', 'Security & Compliance', 'Product Design', 'Technical Operations'
];

export default function InterviewSetupView({ user, onGenerateInterview, isGenerating, error }: InterviewSetupViewProps) {
  const [company, setCompany] = useState('Google');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [department, setDepartment] = useState('Core Platforms');
  const [experience, setExperience] = useState('1-3 years (Junior Developer)');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [interviewType, setInterviewType] = useState<InterviewType>(InterviewType.TECHNICAL);
  const [questionCount, setQuestionCount] = useState(3);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Algorithms', 'React']);

  // Candidate details overlay state
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [fullName, setFullName] = useState(user.name || '');
  const [registerNumber, setRegisterNumber] = useState(user.registerNumber || '');
  const [collegeName, setCollegeName] = useState(user.college || '');
  const [candDepartment, setCandDepartment] = useState(user.department || '');
  const [year, setYear] = useState(user.year || '3rd Year');
  const [email, setEmail] = useState(user.email || '');

  // Custom loader messages sequence
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const loaderMessages = [
    'Deploying isolated AI Sandbox environment...',
    'Analyzing target company hiring rubrics...',
    'Synthesizing skill matrices and structural requirements...',
    'Invoking Google Gemini LLM to construct adaptive challenges...',
    'Reviewing question uniqueness to prevent repetition...',
    'Hardening evaluation test cases and correct answer guides...'
  ];

  useState(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loaderMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleOpenVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill to custom-tailor your interview questions.');
      return;
    }
    setShowCandidateModal(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !registerNumber.trim() || !collegeName.trim() || !candDepartment.trim() || !email.trim()) {
      alert('Please fill in all mandatory Candidate Details fields.');
      return;
    }
    
    setShowCandidateModal(false);
    await onGenerateInterview({
      company,
      jobRole,
      department,
      experience,
      difficulty,
      interviewType,
      questionCount,
      skills: selectedSkills,
      candidateDetails: {
        fullName,
        registerNumber,
        collegeName,
        department: candDepartment,
        year,
        email,
        domain: jobRole,
        experienceLevel: experience
      }
    });
  };

  return (
    <div id="interview-setup-view-container" className="max-w-4xl mx-auto space-y-6">
      {/* Page Title header */}
      <div className="space-y-1.5 text-left">
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
          <Brain size={12} />
          <span>Adaptive Interview Playground</span>
        </div>
        <h2 className="font-sans font-bold text-2xl tracking-tight text-white">
          Configure Your Mock Session
        </h2>
        <p className="font-sans text-xs text-slate-400">
          Target standard corporate benchmarks, behavioral STAR methods, or full coding workspace runtimes.
        </p>
      </div>

      {isGenerating ? (
        /* SKELETON LOADER SCREEN */
        <div id="setup-generating-loader" className="bg-slate-900 border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 flex items-center justify-center border border-indigo-500/30">
            <RefreshCw className="text-indigo-400 animate-spin" size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-lg text-slate-200">Assembling Interview Engine</h4>
            <p className="font-mono text-xs text-indigo-400 font-semibold">{loaderMessages[loadingMessageIdx]}</p>
          </div>
          <p className="font-sans text-[11px] text-slate-500 max-w-sm">
            Gemini creates highly contextual, adaptive, and difficulty-based questions. No generic repeating sets.
          </p>
        </div>
      ) : (
        /* CONFIGURATION FORM */
        <form onSubmit={handleOpenVerification} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-left relative">
          {error && (
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 flex gap-3 text-rose-300 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <div>
                <p className="font-semibold">Setup Engine Failed</p>
                <p className="mt-0.5 text-rose-400">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Target Company Selection */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Target Enterprise / Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
              >
                {SUPPORTED_COMPANIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 2. Job Role Selection */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Target Job Title / Role</label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
              >
                {JOB_ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* 3. Department */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Department / Guild</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 4. Experience Level */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
              >
                <option value="0-1 year (Intern / Associate)">0-1 year (Intern / Associate)</option>
                <option value="1-3 years (Junior Developer)">1-3 years (Junior Developer)</option>
                <option value="3-5 years (Mid-Level Engineer)">3-5 years (Mid-Level Engineer)</option>
                <option value="5+ years (Senior Architect / Staff)">5+ years (Senior Architect / Staff)</option>
              </select>
            </div>

            {/* 5. Interview Style / Type */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Interview Module Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
              >
                <option value={InterviewType.TECHNICAL}>Technical Q&A</option>
                <option value={InterviewType.HR}>General HR / Fit</option>
                <option value={InterviewType.BEHAVIORAL}>Behavioral (STAR Method)</option>
                <option value={InterviewType.MANAGERIAL}>Managerial / Leadership</option>
                <option value={InterviewType.CODING}>Coding Algorithmic Workspace</option>
                <option value={InterviewType.MIXED}>Mixed Assessment</option>
              </select>
            </div>

            {/* 6. Difficulty & Questions count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-sans font-semibold text-xs text-slate-300">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
                >
                  <option value={Difficulty.EASY}>Easy</option>
                  <option value={Difficulty.MEDIUM}>Medium</option>
                  <option value={Difficulty.HARD}>Hard</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-sans font-semibold text-xs text-slate-300">Questions Volume</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 transition-all font-sans"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
          </div>

          {/* 7. Skill Matrix Preset Selectors */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="font-sans font-semibold text-xs text-slate-300">Custom Target Skills Matrix</label>
              <p className="font-sans text-[11px] text-slate-500">Pick the core topics and tech stacks you want the AI questions to focus on</p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-850">
              {SKILLS_PRESETS.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Trigger Banner */}
          <div className="border-t border-slate-850 pt-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans">
              <Sparkles size={14} className="text-amber-400" />
              <span>Tailored benchmark: <strong>{company} {jobRole}</strong></span>
            </div>
            
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer font-sans"
            >
              <ChevronRight size={14} />
              <span>Continue to Candidate Details</span>
            </button>
          </div>
        </form>
      )}

      {/* MANDATORY CANDIDATE DETAILS VERIFICATION MODAL OVERLAY */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-850 flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-wider uppercase font-mono">
                <UserIcon size={14} />
                <span>Candidate Profile Verification</span>
              </div>
              <button 
                onClick={() => setShowCandidateModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFinalSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-slate-200">Mandatory Verification</h4>
                <p className="font-sans text-[11px] text-slate-400">
                  Please verify your credentials. These fields will update your student profile and rank standings.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <UserIcon size={10} />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Candidate full legal name"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                  />
                </div>

                {/* Register Number & Email */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <FileText size={10} />
                      <span>Register Number *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={registerNumber}
                      onChange={(e) => setRegisterNumber(e.target.value)}
                      placeholder="e.g. 21CS042"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Mail size={10} />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* College Name */}
                <div className="space-y-1">
                  <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                    <GraduationCap size={10} />
                    <span>College Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Engineering College or University"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                  />
                </div>

                {/* Department & Year */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <BookOpen size={10} />
                      <span>Department *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={candDepartment}
                      onChange={(e) => setCandDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-sans font-bold text-[10px] text-slate-400 uppercase flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Year of Study *</span>
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 transition-all font-sans"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Target Domain and Experience Level Displays (Read-Only context matching what was setup) */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-950/40 border border-slate-850 p-2.5 rounded-lg text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block font-sans">Interview Domain:</span>
                    <span className="font-sans font-bold text-slate-300">{jobRole}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block font-sans">Experience Level:</span>
                    <span className="font-sans font-bold text-slate-300 truncate block">{experience}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-850 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Cpu size={12} />
                  <span>Deploy & Launch Interview</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
