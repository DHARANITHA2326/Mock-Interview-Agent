import React, { useState } from 'react';
import { User, Sparkles, UserCheck, ShieldAlert, BadgeCheck, GraduationCap, Building2, Flame } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileViewProps {
  user: UserType;
  onUpdateProfile: (data: Partial<UserType>) => Promise<void>;
  onChangePassword: (current: string, next: string) => Promise<void>;
}

export default function ProfileView({ user, onUpdateProfile, onChangePassword }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [college, setCollege] = useState(user.college || '');
  const [department, setDepartment] = useState(user.department || '');
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || 'entry');
  const [skills, setSkills] = useState(user.skills.join(', '));
  const [targetCompanies, setTargetCompanies] = useState(user.targetCompanies.join(', '));
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      const targetArr = targetCompanies.split(',').map(c => c.trim()).filter(Boolean);

      await onUpdateProfile({
        name,
        college,
        department,
        experienceLevel,
        skills: skillsArr,
        targetCompanies: targetArr
      });
      alert('Profile updated successfully!');
    } catch {
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassError('Both password fields are required.');
      return;
    }
    setChangingPassword(true);
    setPassError(null);
    setPassSuccess(false);

    try {
      await onChangePassword(currentPassword, newPassword);
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassError(err?.response?.data?.error || 'Password update failed. Verify current credentials.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* LEFT COLUMN: User Summary Metrics Badge card */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-sans font-bold text-xl text-indigo-300 mx-auto">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-sans font-bold text-base text-slate-200">{user.name}</h3>
            <p className="font-mono text-[10px] text-slate-500 uppercase mt-0.5 leading-none">{user.role}</p>
          </div>

          <div className="flex justify-center gap-3 font-mono text-[10px]">
            <span className="text-amber-400 font-bold bg-amber-950/20 px-2 py-1 rounded">⚡ {user.xp} XP</span>
            <span className="text-indigo-400 font-bold bg-indigo-950/20 px-2 py-1 rounded">🔥 {user.streak} Days</span>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <h4 className="font-sans font-bold text-xs text-slate-200 text-left">Unlocked Badges</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map(b => (
                <span 
                  key={b} 
                  className="bg-indigo-950/40 border border-indigo-900/30 px-2.5 py-1 rounded text-[10px] text-indigo-300 font-sans font-semibold flex items-center gap-1"
                >
                  <BadgeCheck size={12} className="text-indigo-400" />
                  <span>{b}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT TWO COLUMNS: Editable Form Details & Password */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile Settings */}
        <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="font-sans font-bold text-sm text-slate-200 flex items-center gap-2">
              <UserCheck size={16} className="text-indigo-400" />
              <span>Personal Details</span>
            </h3>
            <p className="font-sans text-xs text-slate-500">Edit your credentials, education benchmarks, and target industries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              >
                <option value="entry">Entry (0-1 year)</option>
                <option value="junior">Junior (1-3 years)</option>
                <option value="mid">Mid-Level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Department / Domain</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Skills Matrix (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, SQL, Python..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Target Corporations (comma separated)</label>
              <input
                type="text"
                value={targetCompanies}
                onChange={(e) => setTargetCompanies(e.target.value)}
                placeholder="Google, Microsoft, Meta..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all font-sans cursor-pointer"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="font-sans font-bold text-sm text-slate-200 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" />
              <span>Change Security Credentials</span>
            </h3>
            <p className="font-sans text-xs text-slate-500">Update account password hash metrics</p>
          </div>

          {passSuccess && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-3 rounded-lg text-xs font-sans">
              Credentials updated successfully!
            </div>
          )}

          {passError && (
            <div className="bg-rose-950/20 border border-rose-900/30 text-rose-400 p-3 rounded-lg text-xs font-sans">
              {passError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 font-sans"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all font-sans cursor-pointer"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
