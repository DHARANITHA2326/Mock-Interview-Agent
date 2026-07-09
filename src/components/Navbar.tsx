import { Bell, User, LogOut, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User as UserType, SystemNotification, Role } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  notifications: SystemNotification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({ user, onLogout, onNavigate, notifications, onMarkNotificationRead }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <span className="font-sans font-bold text-lg text-white">M</span>
        </div>
        <div>
          <h1 className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            MockAI
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none">
            Interview Engine
          </p>
        </div>
      </div>

      {/* Right section controls */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            {/* XP and Level indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-sans text-xs">
              <span className="text-amber-400 font-bold font-mono">⚡ {user.xp} XP</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Level {Math.floor(user.xp / 1000) + 1}</span>
            </div>

            {/* Notification bell dropdown */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-[10px] font-mono font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div id="notifications-panel" className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-slate-200 font-sans">Recent Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-indigo-400 font-mono">{unreadCount} unread</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-sans">No notifications yet</div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((not) => (
                        <div
                          key={not.id}
                          className={`p-3 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            not.read ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/30' : 'bg-indigo-950/20 text-slate-200 border-l-2 border-indigo-500 hover:bg-indigo-950/40'
                          }`}
                          onClick={() => {
                            if (!not.read) onMarkNotificationRead(not.id);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold font-sans">{not.title}</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(not.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-sans text-[11px] leading-relaxed text-slate-400">{not.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile dropdown menu */}
            <div className="relative">
              <button
                id="navbar-profile-btn"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-md bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-sans font-bold text-indigo-300">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="font-sans text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                  <p className="font-mono text-[9px] text-slate-500 leading-none mt-0.5 capitalize">{user.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div id="profile-dropdown" className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {user.role === Role.ADMIN && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-sans text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <Shield size={14} className="text-indigo-400" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-sans text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-sans text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
