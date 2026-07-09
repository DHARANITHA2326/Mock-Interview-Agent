import React, { useState } from 'react';
import { LogIn, Sparkles, AlertCircle, RefreshCw, Key, Mail } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onNavigateToRegister: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function LoginView({ onLogin, onNavigateToRegister, isLoading, error }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email, password);
  };

  const fillCredentials = (type: 'user' | 'admin' | 'user_com' | 'admin_com') => {
    if (type === 'admin') {
      setEmail('admin@mockai.edu');
      setPassword('admin_secure_pass_2026');
    } else if (type === 'user') {
      setEmail('alex.rivera@mockai.edu');
      setPassword('alex_practice_pass_123');
    } else if (type === 'admin_com') {
      setEmail('admin@mockai.com');
      setPassword('admin123');
    } else if (type === 'user_com') {
      setEmail('user@mockai.com');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative backdrop blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative shadow-2xl shadow-slate-950/50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto">
            <span className="font-sans font-bold text-xl text-white">M</span>
          </div>
          <h2 className="font-sans font-bold text-2xl tracking-tight text-white">Welcome to MockAI</h2>
          <p className="font-sans text-xs text-slate-400">Sign in to initialize your AI Adaptive Interview sandbox</p>
        </div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3.5 flex gap-2.5 text-rose-300 text-xs text-left">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Failed</p>
              <p className="mt-0.5 text-rose-400/90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="font-sans font-semibold text-xs text-slate-300">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="developer@mockai.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-200 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-sans font-semibold text-xs text-slate-300">Account Password</label>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9.5 pr-3 py-2.5 text-xs text-slate-200 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-semibold py-3 rounded-xl transition-all font-sans cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <LogIn size={14} />}
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick credential filler for testing and reviewers */}
        <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl space-y-2.5 text-left">
          <p className="font-sans text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fast-Pass Credential Simulator</p>
          <div className="space-y-2">
            <div>
              <p className="font-mono text-[9px] text-indigo-500 font-bold uppercase mb-1">Standard Accounts (.edu)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fillCredentials('user')}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-indigo-400 font-semibold font-sans cursor-pointer text-center"
                >
                  👩‍💻 Student Alex
                </button>
                <button
                  onClick={() => fillCredentials('admin')}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-rose-400 font-semibold font-sans cursor-pointer text-center"
                >
                  🛡️ Admin Board
                </button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] text-indigo-500 font-bold uppercase mb-1">Legacy Accounts (.com)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fillCredentials('user_com')}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-indigo-400 font-semibold font-sans cursor-pointer text-center"
                >
                  💻 Berkeley Alex
                </button>
                <button
                  onClick={() => fillCredentials('admin_com')}
                  className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-rose-400 font-semibold font-sans cursor-pointer text-center"
                >
                  👑 Standard Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center font-sans text-xs text-slate-500">
          <span>New developer? </span>
          <button 
            onClick={onNavigateToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            Register Profile
          </button>
        </div>
      </div>
    </div>
  );
}
