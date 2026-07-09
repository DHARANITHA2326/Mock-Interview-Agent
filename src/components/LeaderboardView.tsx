import React, { useState } from 'react';
import { Award, Search, Plus, Edit2, Trash2, X, Check, Info, Video, CheckCircle, TrendingUp, Monitor } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onRefresh?: () => void;
}

export default function LeaderboardView({ entries, currentUserId, onRefresh }: LeaderboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overall' | 'technical' | 'communication' | 'confidence' | 'eyeContact'>('overall');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCollege, setFormCollege] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formTotalInterviews, setFormTotalInterviews] = useState(1);
  const [formAverageScore, setFormAverageScore] = useState(80);
  const [formHighestScore, setFormHighestScore] = useState(85);
  const [formTechnicalScore, setFormTechnicalScore] = useState(80);
  const [formCommunicationScore, setFormCommunicationScore] = useState(80);
  const [formConfidenceScore, setFormConfidenceScore] = useState(80);
  const [formEyeContactScore, setFormEyeContactScore] = useState(90);
  const [formImprovementPercentage, setFormImprovementPercentage] = useState(5);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Sort dynamically based on active category tab
  const processedEntries = [...entries]
    .filter(entry => entry.userName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (activeTab === 'technical') return (b.technicalScore || 0) - (a.technicalScore || 0) || b.averageScore - a.averageScore;
      if (activeTab === 'communication') return (b.communicationScore || 0) - (a.communicationScore || 0) || b.averageScore - a.averageScore;
      if (activeTab === 'confidence') return (b.confidenceScore || 0) - (a.confidenceScore || 0) || b.averageScore - a.averageScore;
      if (activeTab === 'eyeContact') return (b.eyeContactScore || 0) - (a.eyeContactScore || 0) || b.averageScore - a.averageScore;
      return b.averageScore - a.averageScore || b.highestScore - a.highestScore;
    })
    .map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('mockai_auth_token')}`
  });

  const openAddModal = () => {
    setModalMode('add');
    setEditingUserId(null);
    setFormName('');
    setFormCollege('');
    setFormDept('');
    setFormTotalInterviews(2);
    setFormAverageScore(78);
    setFormHighestScore(84);
    setFormTechnicalScore(76);
    setFormCommunicationScore(80);
    setFormConfidenceScore(78);
    setFormEyeContactScore(88);
    setFormImprovementPercentage(6);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry: any) => {
    setModalMode('edit');
    setEditingUserId(entry.userId);
    setFormName(entry.userName);
    setFormCollege(entry.college || '');
    setFormDept(entry.department || '');
    setFormTotalInterviews(entry.totalInterviews || 1);
    setFormAverageScore(entry.averageScore || 0);
    setFormHighestScore(entry.highestScore || entry.averageScore || 0);
    setFormTechnicalScore(entry.technicalScore || entry.averageScore || 0);
    setFormCommunicationScore(entry.communicationScore || entry.averageScore || 0);
    setFormConfidenceScore(entry.confidenceScore || entry.averageScore || 0);
    setFormEyeContactScore(entry.eyeContactScore || 90);
    setFormImprovementPercentage(entry.improvementPercentage || 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Candidate Name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = modalMode === 'add' ? '/api/leaderboard/add' : '/api/leaderboard/update';
      const body = {
        userId: editingUserId,
        userName: formName,
        college: formCollege,
        department: formDept,
        totalInterviews: Number(formTotalInterviews),
        averageScore: Number(formAverageScore),
        highestScore: Number(formHighestScore),
        technicalScore: Number(formTechnicalScore),
        communicationScore: Number(formCommunicationScore),
        confidenceScore: Number(formConfidenceScore),
        eyeContactScore: Number(formEyeContactScore),
        improvementPercentage: Number(formImprovementPercentage)
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to complete operation');
      }

      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this candidate from the leaderboard?')) return;

    try {
      const res = await fetch(`/api/leaderboard/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete candidate');
      }

      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete candidate');
    }
  };

  // Stats Card data
  const highestPlatformScore = entries.length > 0 ? Math.max(...entries.map(e => e.highestScore || e.averageScore || 0)) : 94;
  const averagePlatformScore = entries.length > 0 ? Math.round(entries.reduce((sum, e) => sum + (e.averageScore || 0), 0) / entries.length) : 78;
  const totalCompletedInterviews = entries.reduce((sum, e) => sum + (e.totalInterviews || 0), 0);
  const activeCandidatesCount = entries.length;

  return (
    <div id="leaderboard_view_container" className="space-y-6 text-left">
      {/* Title header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
            <Award size={12} />
            <span>AI proctored ranking standings</span>
          </div>
          <h2 className="font-sans font-bold text-xl tracking-tight text-white">
            Interview Performance Leaderboard
          </h2>
          <p className="font-sans text-xs text-slate-400">
            Compare average score breakdown, eye contact behavior proctoring metrics, and growth indicators across active candidates.
          </p>
        </div>

        <div>
          <button
            id="btn_add_candidate"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all cursor-pointer hover:shadow-indigo-500/10"
          >
            <Plus size={14} />
            <span>Add Candidate Entry</span>
          </button>
        </div>
      </div>

      {/* Dynamic Bento Platform Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Top Achievement</span>
          <h3 className="text-xl font-bold font-mono text-amber-400">{highestPlatformScore}% Score</h3>
          <p className="text-[10px] text-slate-400">Highest interview evaluation rating</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Platform Mean</span>
          <h3 className="text-xl font-bold font-mono text-indigo-400">{averagePlatformScore}% Score</h3>
          <p className="text-[10px] text-slate-400">Average score of evaluated members</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Proctored Audits</span>
          <h3 className="text-xl font-bold font-mono text-emerald-400">{totalCompletedInterviews || 18} Sessions</h3>
          <p className="text-[10px] text-slate-400">Cumulative mock exams finalized</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Qualified Candidates</span>
          <h3 className="text-xl font-bold font-mono text-purple-400">{activeCandidatesCount} Members</h3>
          <p className="text-[10px] text-slate-400">Actively mapped within database registry</p>
        </div>
      </div>

      {/* Podium Top 3 display evaluated by overall performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank 2 (Silver) */}
        {processedEntries[1] && (
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 md:order-1 relative overflow-hidden">
            <div className="absolute top-2 right-2 font-mono font-bold text-slate-500 text-3xl opacity-20">2nd</div>
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-sans font-bold text-slate-300 shadow shadow-slate-500/10">
              {processedEntries[1].userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-slate-200">{processedEntries[1].userName}</h4>
              <p className="font-sans text-[10px] text-slate-500">{processedEntries[1].college || 'Associate Software Engineer'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-center font-mono text-[9px] bg-slate-950/40 p-2 rounded-lg border border-slate-850">
              <div>
                <span className="text-slate-500 block">Overall</span>
                <span className="text-indigo-400 font-bold">{processedEntries[1].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Technical</span>
                <span className="text-sky-400 font-bold">{processedEntries[1].technicalScore || processedEntries[1].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Eye Contact</span>
                <span className="text-emerald-400 font-bold">{processedEntries[1].eyeContactScore || 90}%</span>
              </div>
            </div>
            {/* Quick Action Overlays */}
            <div className="flex items-center gap-1.5 pt-1">
              <button 
                onClick={() => openEditModal(processedEntries[1])} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded hover:text-white transition-colors cursor-pointer"
                title="Edit Candidate Stats"
              >
                <Edit2 size={12} />
              </button>
              {processedEntries[1].userId !== currentUserId && (
                <button 
                  onClick={() => handleDeleteEntry(processedEntries[1].userId)} 
                  className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded transition-colors cursor-pointer"
                  title="Remove Candidate"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rank 1 (Gold) */}
        {processedEntries[0] && (
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-amber-950/15 border-2 border-amber-800/40 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 md:order-2 md:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-2 right-2 font-mono font-bold text-amber-500 text-4xl opacity-25">1st</div>
            <div className="w-14 h-14 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center font-sans font-bold text-amber-400 shadow shadow-amber-500/20">
              {processedEntries[0].userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-200 flex items-center gap-1 justify-center">
                <span>{processedEntries[0].userName}</span>
                <span>👑</span>
              </h4>
              <p className="font-sans text-[10px] text-slate-400">{processedEntries[0].college || 'Lead Systems Candidate'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-center font-mono text-[9px] bg-slate-950/40 p-2 rounded-lg border border-slate-850">
              <div>
                <span className="text-slate-500 block">Overall</span>
                <span className="text-amber-400 font-bold">{processedEntries[0].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Technical</span>
                <span className="text-sky-400 font-bold">{processedEntries[0].technicalScore || processedEntries[0].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Eye Contact</span>
                <span className="text-emerald-400 font-bold">{processedEntries[0].eyeContactScore || 90}%</span>
              </div>
            </div>
            {/* Quick Action Overlays */}
            <div className="flex items-center gap-1.5 pt-1">
              <button 
                onClick={() => openEditModal(processedEntries[0])} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded hover:text-white transition-colors cursor-pointer"
                title="Edit Candidate Stats"
              >
                <Edit2 size={12} />
              </button>
              {processedEntries[0].userId !== currentUserId && (
                <button 
                  onClick={() => handleDeleteEntry(processedEntries[0].userId)} 
                  className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded transition-colors cursor-pointer"
                  title="Remove Candidate"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {processedEntries[2] && (
          <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-amber-900/10 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 md:order-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 font-mono font-bold text-amber-700 text-3xl opacity-20">3rd</div>
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-sans font-bold text-amber-600 shadow shadow-amber-900/10">
              {processedEntries[2].userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-slate-200">{processedEntries[2].userName}</h4>
              <p className="font-sans text-[10px] text-slate-500">{processedEntries[2].college || 'Consultant Specialist'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full text-center font-mono text-[9px] bg-slate-950/40 p-2 rounded-lg border border-slate-850">
              <div>
                <span className="text-slate-500 block">Overall</span>
                <span className="text-indigo-400 font-bold">{processedEntries[2].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Technical</span>
                <span className="text-sky-400 font-bold">{processedEntries[2].technicalScore || processedEntries[2].averageScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">Eye Contact</span>
                <span className="text-emerald-400 font-bold">{processedEntries[2].eyeContactScore || 90}%</span>
              </div>
            </div>
            {/* Quick Action Overlays */}
            <div className="flex items-center gap-1.5 pt-1">
              <button 
                onClick={() => openEditModal(processedEntries[2])} 
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded hover:text-white transition-colors cursor-pointer"
                title="Edit Candidate Stats"
              >
                <Edit2 size={12} />
              </button>
              {processedEntries[2].userId !== currentUserId && (
                <button 
                  onClick={() => handleDeleteEntry(processedEntries[2].userId)} 
                  className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded transition-colors cursor-pointer"
                  title="Remove Candidate"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories using Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-2 gap-4">
        <div className="flex border-b border-transparent scrollbar-none overflow-x-auto gap-2">
          {[
            { id: 'overall', label: '1. Overall Ranking' },
            { id: 'technical', label: '2. Technical Ranking' },
            { id: 'communication', label: '3. Communication Ranking' },
            { id: 'confidence', label: '4. Confidence Ranking' },
            { id: 'eyeContact', label: '5. Eye Contact Ranking' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 text-xs font-sans font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-450 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Filter candidates by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 font-sans"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs min-w-[1000px]">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <th className="px-4 py-3 w-16 text-center">Rank</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3 text-center">Total Completed</th>
                <th className="px-4 py-3 text-center">Avg Overall Score</th>
                <th className="px-4 py-3 text-center">Highest Score</th>
                <th className="px-4 py-3 text-center">Technical</th>
                <th className="px-4 py-3 text-center">Communication</th>
                <th className="px-4 py-3 text-center">Confidence</th>
                <th className="px-4 py-3 text-center">Eye Contact</th>
                <th className="px-4 py-3 text-center">Improvement</th>
                <th className="px-4 py-3 text-center">Last Interviewed</th>
                <th className="px-4 py-3 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {processedEntries.map((item) => {
                const isCurrent = item.userId === currentUserId;
                return (
                  <tr 
                    key={item.userId}
                    className={`transition-all ${
                      isCurrent 
                        ? 'bg-indigo-950/15 border-l-4 border-l-indigo-500 font-semibold text-indigo-100' 
                        : 'text-slate-300 hover:bg-slate-950/20'
                    }`}
                  >
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-400">
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0">
                          {item.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{item.userName}</p>
                          {isCurrent && <span className="text-[9px] text-indigo-400 font-mono tracking-widest font-bold uppercase block leading-none mt-0.5">YOU</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold">
                      {item.totalInterviews || 1}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-indigo-400">
                      {item.averageScore}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-250">
                      {item.highestScore || item.averageScore || 80}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {item.technicalScore || item.averageScore || 75}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {item.communicationScore || item.averageScore || 78}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">
                      {item.confidenceScore || item.averageScore || 80}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <Video size={10} className="text-emerald-500 shrink-0" />
                      <span>{item.eyeContactScore || 90}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      <span className={item.improvementPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.improvementPercentage >= 0 ? '+' : ''}{item.improvementPercentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-500 text-[10px]">
                      {item.lastInterviewDate ? new Date(item.lastInterviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : 'Pending'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded hover:text-white transition-colors cursor-pointer"
                          title="Edit Candidate"
                        >
                          <Edit2 size={11} />
                        </button>
                        {item.userId !== currentUserId && (
                          <button
                            onClick={() => handleDeleteEntry(item.userId)}
                            className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded transition-colors cursor-pointer"
                            title="Remove Candidate"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {processedEntries.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-500 font-sans italic">
                    No matching candidate scores logged in overall standing directories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Candidates Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-sans font-bold text-base text-white flex items-center gap-2">
                <Award className="text-indigo-400" size={18} />
                <span>{modalMode === 'add' ? 'Add Candidate Audit Standing' : 'Edit Candidate Performance Scores'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="bg-rose-950/30 border border-rose-900/40 text-rose-400 text-xs px-3.5 py-2 rounded-lg mb-4 font-sans flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Candidate Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Richard Hendricks"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Industry Domain / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. React Frontend Architect"
                    value={formCollege}
                    onChange={(e) => setFormCollege(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Total Completed</label>
                  <input
                    type="number"
                    min="1"
                    value={formTotalInterviews}
                    onChange={(e) => setFormTotalInterviews(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Average Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formAverageScore}
                    onChange={(e) => setFormAverageScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Highest Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formHighestScore}
                    onChange={(e) => setFormHighestScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Technical</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formTechnicalScore}
                    onChange={(e) => setFormTechnicalScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-slate-200 font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Communication</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formCommunicationScore}
                    onChange={(e) => setFormCommunicationScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-slate-200 font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Confidence</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formConfidenceScore}
                    onChange={(e) => setFormConfidenceScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-slate-200 font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Eye Contact</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formEyeContactScore}
                    onChange={(e) => setFormEyeContactScore(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-slate-200 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Growth improvement %</label>
                <input
                  type="number"
                  min="-100"
                  max="500"
                  placeholder="e.g. 15 for +15% improvement"
                  value={formImprovementPercentage}
                  onChange={(e) => setFormImprovementPercentage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-200 font-sans"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold font-sans text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold font-sans px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Check size={14} />
                  )}
                  <span>{modalMode === 'add' ? 'Create Candidate Record' : 'Save Statistics'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
