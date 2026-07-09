import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Award, 
  Settings, 
  User, 
  Shield, 
  Flame, 
  Calendar,
  LogOut
} from 'lucide-react';
import { User as UserType, Role } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, user, onLogout }: SidebarProps) {
  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', name: 'Mock Interviews', icon: Briefcase },
    { id: 'resume', name: 'Resume Analyzer', icon: FileText },
    { id: 'leaderboard', name: 'Leaderboard', icon: Award },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside id="sidebar-nav" className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-slate-950 px-4 py-6 justify-between h-[calc(100vh-73px)] shrink-0 select-none">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-widest px-3 mb-2">
            Workspace
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'interviews' && currentView === 'interview-setup');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/50 to-purple-950/30 text-indigo-300 border border-indigo-900/40 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Roles Based Admin Panel */}
        {user.role === Role.ADMIN && (
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-rose-500 font-bold uppercase tracking-widest px-3 mb-2">
              System Admin
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium transition-all duration-150 ${
                currentView === 'admin'
                  ? 'bg-rose-950/20 text-rose-300 border border-rose-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Shield size={16} className={currentView === 'admin' ? 'text-rose-400' : 'text-slate-500'} />
              <span>Admin Control</span>
            </button>
          </div>
        )}

        {/* Practice Streaks & Metrics panel */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider font-bold">STREAK STATUS</span>
            <div className="flex items-center gap-1 bg-amber-950/30 px-2 py-0.5 rounded text-[10px] text-amber-400 font-bold border border-amber-900/30">
              <Flame size={12} className="fill-amber-400" />
              <span>{user.streak} Days</span>
            </div>
          </div>
          <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
            Practice every day to maintain your streak and unlock rare double-XP reward badges.
          </p>
        </div>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-sans font-medium text-rose-400 hover:bg-rose-950/25 hover:text-rose-300 transition-all border border-transparent"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
