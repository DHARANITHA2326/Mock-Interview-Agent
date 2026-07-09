import { useState, useEffect } from 'react';
import { Menu, X, Terminal, Cpu } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InterviewSetupView from './components/InterviewSetupView';
import InterviewActiveView from './components/InterviewActiveView';
import FeedbackReportView from './components/FeedbackReportView';
import ResumeAnalyzerView from './components/ResumeAnalyzerView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AdminPanelView from './components/AdminPanelView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';

import { 
  User, 
  Interview, 
  Question, 
  Answer, 
  ResumeAnalysis, 
  LeaderboardEntry, 
  SystemNotification,
  Difficulty,
  InterviewType
} from './types';

export default function App() {
  // Navigation & Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sub-metrics States
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<Interview[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [resumeHistory, setResumeHistory] = useState<ResumeAnalysis[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  // Active Sandbox States
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [selectedReportInterview, setSelectedReportInterview] = useState<Interview | null>(null);
  const [isSettingUpInterview, setIsSettingUpInterview] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Initialize Auth status on launch
  useEffect(() => {
    const savedToken = localStorage.getItem('mockai_auth_token');
    const savedUser = localStorage.getItem('mockai_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setAuthLoading(false);
  }, []);

  // Poll profile metrics when token updates
  useEffect(() => {
    if (token) {
      fetchUserAnalytics();
      fetchHistory();
      fetchNotifications();
      fetchLeaderboard();
      fetchResumeHistory();
      fetchSettings();
      if (user?.role === 'admin') {
        fetchAdminData();
      }
    }
  }, [token, currentView]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || localStorage.getItem('mockai_auth_token')}`
  });

  // ==========================================
  // CORE API WORKFLOWS
  // ==========================================

  const fetchUserAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to load user metrics trend.', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/interviews/history', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to retrieve history.', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to load alerts.', e);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Failed to load ranks.', e);
    }
  };

  const fetchResumeHistory = async () => {
    try {
      const res = await fetch('/api/resume/history', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setResumeHistory(data);
      }
    } catch (e) {
      console.error('Failed to load resume audits.', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed to load user settings.', e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: getHeaders() }),
        fetch('/api/admin/users', { headers: getHeaders() })
      ]);
      if (statsRes.ok && usersRes.ok) {
        setAdminStats(await statsRes.json());
        setAdminUsers(await usersRes.json());
      }
    } catch (e) {
      console.error('Failed to retrieve admin parameters.', e);
    }
  };

  // ==========================================
  // AUTH ROUTINES
  // ==========================================

  const handleLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login verification failed.');
        return;
      }
      
      localStorage.setItem('mockai_auth_token', data.token);
      localStorage.setItem('mockai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('dashboard');
    } catch (e) {
      setAuthError('Connection failed. Verify server is online.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (regData: any) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }

      localStorage.setItem('mockai_auth_token', data.token);
      localStorage.setItem('mockai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setCurrentView('dashboard');
    } catch (e) {
      setAuthError('Connection failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mockai_auth_token');
    localStorage.removeItem('mockai_user');
    setToken(null);
    setUser(null);
    setCurrentView('dashboard');
  };

  // ==========================================
  // ACTION DISPATCHERS
  // ==========================================

  const handleGenerateInterview = async (config: {
    company: string;
    jobRole: string;
    department: string;
    experience: string;
    difficulty: Difficulty;
    interviewType: InterviewType;
    questionCount: number;
    skills: string[];
  }) => {
    setIsSettingUpInterview(true);
    setInterviewError(null);
    try {
      const res = await fetch('/api/interviews/setup', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (!res.ok) {
        setInterviewError(data.error || 'Synthesis error.');
        return;
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('mockai_user', JSON.stringify(data.user));
      }
      setActiveInterview(data.interview);
      setActiveQuestions(data.questions);
      setCurrentView('interview-active');
    } catch (e) {
      setInterviewError('Synthesis connection failed.');
    } finally {
      setIsSettingUpInterview(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string, answerText: string, codeSolution?: string) => {
    const res = await fetch(`/api/interviews/${activeInterview?.id}/submit-answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionId, answerText, codeSolution })
    });
    if (!res.ok) {
      throw new Error('Failed to process submission.');
    }
    return await res.json();
  };

  const handleFinishInterview = async (metrics?: any) => {
    if (!activeInterview) return;
    try {
      const res = await fetch(`/api/interviews/${activeInterview.id}/finish`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ behavioralMetrics: metrics })
      });
      if (res.ok) {
        const completedSession = await res.json();
        // Refresh local user state with earned XP/streak
        const userRes = await fetch('/api/auth/me', { headers: getHeaders() });
        if (userRes.ok) {
          const freshUser = await userRes.json();
          localStorage.setItem('mockai_user', JSON.stringify(freshUser));
          setUser(freshUser);
        }

        setSelectedReportInterview(completedSession);
        setActiveInterview(null);
        setActiveQuestions([]);
        setCurrentView('report');
      }
    } catch (e) {
      alert('Compilation of final report failed.');
    }
  };

  const handleAnalyzeResume = async (text: string, fileName: string) => {
    setIsAnalyzingResume(true);
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text, fileName })
      });
      if (!res.ok) {
        throw new Error('ATS Parsing failed.');
      }
      
      const analysis = await res.json();
      // update history
      setResumeHistory(prev => [analysis, ...prev]);
      
      // reload profile xp
      const userRes = await fetch('/api/auth/me', { headers: getHeaders() });
      if (userRes.ok) {
        const freshUser = await userRes.json();
        localStorage.setItem('mockai_user', JSON.stringify(freshUser));
        setUser(freshUser);
      }

      return analysis;
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleDeleteResumeHistory = async (id: string) => {
    // local state bypass for ease
    setResumeHistory(prev => prev.filter(r => r.id !== id));
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST', headers: getHeaders() });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleUpdateProfile = async (profileData: Partial<User>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error();
    const freshUser = await res.json();
    localStorage.setItem('mockai_user', JSON.stringify(freshUser));
    setUser(freshUser);
  };

  const handleChangePassword = async (current: string, next: string) => {
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword: current, newPassword: next })
    });
    if (!res.ok) {
      const data = await res.json();
      throw data;
    }
  };

  const handleSaveSettings = async (settingsData: any) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error();
  };

  const handleDeleteUserAdmin = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) {
      setAdminUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // ==========================================
  // VIEW SWITCH RENDER ROUTER
  // ==========================================

  const renderCurrentView = () => {
    if (!user) {
      if (currentView === 'register') {
        return (
          <RegisterView 
            onRegister={handleRegister} 
            onNavigateToLogin={() => setCurrentView('login')} 
            isLoading={authLoading} 
            error={authError} 
          />
        );
      }
      return (
        <LoginView 
          onLogin={handleLogin} 
          onNavigateToRegister={() => setCurrentView('register')} 
          isLoading={authLoading} 
          error={authError} 
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            user={user} 
            analytics={analytics} 
            history={history} 
            onNavigate={setCurrentView}
            onSelectInterviewForReport={(item) => {
              setSelectedReportInterview(item);
              setCurrentView('report');
            }}
          />
        );
      case 'interviews':
      case 'interview-setup':
        return (
          <InterviewSetupView 
            user={user!}
            onGenerateInterview={handleGenerateInterview} 
            isGenerating={isSettingUpInterview} 
            error={interviewError} 
          />
        );
      case 'interview-active':
        if (!activeInterview) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <InterviewActiveView 
            interview={activeInterview} 
            questions={activeQuestions} 
            onFinishInterview={handleFinishInterview} 
            onSubmitAnswer={handleSubmitAnswer}
            settings={settings}
          />
        );
      case 'report':
        if (!selectedReportInterview) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <FeedbackReportView 
            interview={selectedReportInterview} 
            onBack={() => {
              setSelectedReportInterview(null);
              setCurrentView('dashboard');
            }} 
          />
        );
      case 'resume':
        return (
          <ResumeAnalyzerView 
            onAnalyze={handleAnalyzeResume} 
            isAnalyzing={isAnalyzingResume} 
            history={resumeHistory}
            onDeleteHistory={handleDeleteResumeHistory}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardView 
            entries={leaderboard} 
            currentUserId={user.id} 
            onRefresh={fetchLeaderboard}
          />
        );
      case 'profile':
        return (
          <ProfileView 
            user={user} 
            onUpdateProfile={handleUpdateProfile} 
            onChangePassword={handleChangePassword} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            initialSettings={settings || {
              theme: 'dark',
              emailNotifications: true,
              pushNotifications: true,
              language: 'English',
              voiceName: 'Zephyr',
              aiSpeed: 1.0,
              privacyProfile: 'public',
              speechTone: 'professional',
              cameraPreference: '',
              microphonePreference: ''
            }} 
            onSaveSettings={async (updated) => {
              await handleSaveSettings(updated);
              setSettings(updated);
            }} 
          />
        );
      case 'admin':
        return (
          <AdminPanelView 
            adminStats={adminStats} 
            usersList={adminUsers} 
            onDeleteUser={handleDeleteUserAdmin} 
          />
        );
      default:
        return <div className="text-center py-10 text-slate-400">View not constructed yet</div>;
    }
  };

  // If Auth loading, show clean loader
  if (authLoading && !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Cpu className="text-indigo-400 animate-spin mb-4" size={32} />
        <h4 className="font-mono text-xs text-indigo-400">LOADING AI ENVIRONMENT...</h4>
      </div>
    );
  }

  // Pure login wrapper or dashboard layout rendering
  if (!user) {
    return renderCurrentView();
  }

  const isInterviewScreenActive = currentView === 'interview-active';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Dynamic Header Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main split dashboard and sidebar layout */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Render Sidebar only if not in active interview sandbox to provide absolute focusing */}
        {!isInterviewScreenActive && (
          <Sidebar 
            currentView={currentView} 
            onNavigate={(view) => {
              setCurrentView(view);
              setMobileMenuOpen(false);
            }} 
            user={user} 
            onLogout={handleLogout} 
          />
        )}

        {/* Responsive Mobile Drawer toggles (displayed if sidebar is hidden) */}
        {!isInterviewScreenActive && (
          <div className="lg:hidden absolute bottom-4 right-4 z-40">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 z-30 bg-slate-950/95 flex flex-col p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white font-sans">Navigation Drawer</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-2 text-left font-sans text-sm">
              <button onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Dashboard</button>
              <button onClick={() => { setCurrentView('interview-setup'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Mock Interviews</button>
              <button onClick={() => { setCurrentView('resume'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Resume Analyzer</button>
              <button onClick={() => { setCurrentView('leaderboard'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Leaderboard</button>
              <button onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Profile</button>
              <button onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false); }} className="p-2.5 text-slate-300 hover:bg-slate-900 rounded-lg">Settings</button>
              {user.role === 'admin' && (
                <button onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }} className="p-2.5 text-rose-400 hover:bg-slate-900 rounded-lg">Admin Controller</button>
              )}
            </nav>
            <div className="border-t border-slate-800 pt-4 mt-auto">
              <button onClick={handleLogout} className="w-full py-2.5 bg-rose-950/20 text-rose-400 text-center rounded-lg text-xs font-semibold">Sign Out</button>
            </div>
          </div>
        )}

        {/* Primary View Container viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 select-none">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
