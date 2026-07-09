import React, { useState } from 'react';
import { UserPlus, Sparkles, AlertCircle, RefreshCw, Key, Mail, User } from 'lucide-react';

interface RegisterViewProps {
  onRegister: (data: {
    email: string;
    password: string;
    name: string;
    college?: string;
    department?: string;
    experienceLevel?: string;
  }) => Promise<void>;
  onNavigateToLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function RegisterView({ onRegister, onNavigateToLogin, isLoading, error }: RegisterViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    await onRegister({
      email,
      password,
      name,
      college,
      department,
      experienceLevel
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative backdrop blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full"></div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative shadow-2xl shadow-slate-950/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto">
            <span className="font-sans font-bold text-xl text-white">M</span>
          </div>
          <h2 className="font-sans font-bold text-2xl tracking-tight text-white">Join MockAI</h2>
          <p className="font-sans text-xs text-slate-400">Initialize your cloud mock portfolio and practice benchmark tests</p>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3.5 flex gap-2.5 text-rose-300 text-xs text-left">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registration Failed</p>
              <p className="mt-0.5 text-rose-400/90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">Your Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="alex@mockai.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">Set Password</label>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Exp Level */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-300"
              >
                <option value="entry">Entry-Level / Student</option>
                <option value="junior">Junior Developer (1-3 yrs)</option>
                <option value="mid">Mid-Level Engineer (3-5 yrs)</option>
                <option value="senior">Senior Engineer / Architect</option>
              </select>
            </div>

            {/* College */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">College / Institution (Optional)</label>
              <input
                type="text"
                placeholder="Stanford University"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-slate-300">Department / Stream (Optional)</label>
              <input
                type="text"
                placeholder="Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
            <span>{isLoading ? 'Creating Sandbox Profile...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center font-sans text-xs text-slate-500">
          <span>Already registered? </span>
          <button 
            onClick={onNavigateToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
