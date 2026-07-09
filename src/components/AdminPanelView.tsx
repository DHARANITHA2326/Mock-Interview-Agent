import { useState } from 'react';
import { 
  Users, 
  Trash2, 
  ShieldAlert, 
  Search, 
  TrendingUp, 
  Cpu, 
  CheckCircle, 
  Activity,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { User, Role } from '../types';

interface AdminPanelViewProps {
  adminStats: {
    totalUsers: number;
    totalInterviews: number;
    completedInterviews: number;
    totalResumesParsed: number;
    systemAverageScore: number;
    interviewTypes: any[];
    registrationsTrend: any[];
  } | null;
  usersList: User[];
  onDeleteUser: (id: string) => Promise<void>;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#e11d48'];

export default function AdminPanelView({ adminStats, usersList, onDeleteUser }: AdminPanelViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bannedUsers, setBannedUsers] = useState<Record<string, boolean>>({});

  const stats = adminStats || {
    totalUsers: usersList.length,
    totalInterviews: 12,
    completedInterviews: 8,
    totalResumesParsed: 4,
    systemAverageScore: 82,
    interviewTypes: [{ name: 'Technical', value: 5 }],
    registrationsTrend: [{ date: 'Mon', count: 12 }]
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBan = (userId: string) => {
    setBannedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you absolutely sure you want to permanently delete this user account and all their historical analytics? This is irreversible.')) {
      await onDeleteUser(userId);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
          <ShieldAlert size={12} />
          <span>System Administration Dashboard</span>
        </div>
        <h2 className="font-sans font-bold text-xl tracking-tight text-white">
          Platform Controller
        </h2>
        <p className="font-sans text-xs text-slate-400">
          Review system-wide performance indexes, registered cohorts, and moderate active directory profiles.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
            <Users size={18} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">TOTAL REGISTERED</p>
            <h3 className="font-sans text-xl font-bold text-slate-200 tracking-tight mt-0.5">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-purple-950/40 border border-purple-900/30 flex items-center justify-center text-purple-400">
            <Activity size={18} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">SESSIONS COMPLETED</p>
            <h3 className="font-sans text-xl font-bold text-slate-200 tracking-tight mt-0.5">{stats.completedInterviews} / {stats.totalInterviews}</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-pink-950/40 border border-pink-800/30 flex items-center justify-center text-pink-400">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">RESUMES PROCESSED</p>
            <h3 className="font-sans text-xl font-bold text-slate-200 tracking-tight mt-0.5">{stats.totalResumesParsed}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-950/40 border border-amber-900/30 flex items-center justify-center text-amber-400">
            <Award size={18} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">GLOBAL AVG SCORE</p>
            <h3 className="font-sans text-xl font-bold text-slate-200 tracking-tight mt-0.5">{stats.systemAverageScore}%</h3>
          </div>
        </div>
      </div>

      {/* Visual Analytics graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 space-y-3">
          <div>
            <h4 className="font-sans font-bold text-xs text-slate-200">User Registrations Velocity</h4>
            <p className="font-sans text-[11px] text-slate-500">Monitor daily new developer registrations</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.registrationsTrend}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11, borderRadius: 6 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorRegs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Share Pie chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-bold text-xs text-slate-200">Assessment Types Distribution</h4>
            <p className="font-sans text-[11px] text-slate-500">Breakdown of custom assessments initiated</p>
          </div>
          <div className="h-44 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.interviewTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.interviewTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 11, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center font-sans text-[10px] text-slate-400">
            {stats.interviewTypes.map((item, idx) => (
              <span key={item.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{item.name}: {item.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Moderate User list directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h4 className="font-sans font-bold text-sm text-slate-200">Registered Student Directory</h4>
            <p className="font-sans text-xs text-slate-500">Moderate accounts, examine streaks, or delete inactive entities</p>
          </div>

          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-9.5 pr-3 py-2 text-xs text-slate-200 font-sans"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-850 rounded-lg">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-400 font-semibold">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">College & Specialty</th>
                <th className="px-4 py-2.5">Streak & XP</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-slate-300">
              {filteredUsers.map(user => {
                const isBanned = bannedUsers[user.id] || false;
                return (
                  <tr key={user.id} className={`hover:bg-slate-950/20 ${isBanned ? 'opacity-40 bg-rose-950/5' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-slate-200">{user.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <p>{user.college || 'Platform Guest'}</p>
                      <p className="text-[10px] text-slate-500">{user.department || 'Unassigned'}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <p className="text-amber-400">⚡ {user.xp} XP</p>
                      <p className="text-[10px] text-slate-500">{user.streak} Days Streak</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] uppercase text-indigo-400 font-bold">{user.role}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role !== Role.ADMIN && (
                          <>
                            <button
                              onClick={() => handleToggleBan(user.id)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all border cursor-pointer ${
                                isBanned 
                                  ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                                  : 'bg-rose-950/20 border-rose-900/30 text-rose-400'
                              }`}
                            >
                              {isBanned ? 'Unrestrict' : 'Restrict'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 bg-slate-950 hover:bg-rose-950/25 border border-slate-850 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">No matching user records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
