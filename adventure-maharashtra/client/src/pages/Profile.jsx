import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ShieldCheck, CheckCircle2, AlertCircle, LogOut, Key } from 'lucide-react';
import { updateProfile, changeUserPassword } from '../services/api';

export default function Profile() {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [passError, setPassError] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    setProfileError(null);

    try {
      const res = await updateProfile({ name, phone });
      if (res && res.success) {
        setUser(res.user);
        setProfileMsg('Contact information updated successfully.');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    setPassError(null);

    if (newPassword !== newPasswordConfirm) {
      setPassError('New passwords do not match.');
      setPassLoading(false);
      return;
    }

    try {
      const res = await changeUserPassword({
        currentPassword,
        newPassword,
        newPasswordConfirm
      });
      if (res && res.success) {
        setPassMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      }
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Account Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Account & Security Settings
          </h1>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Profile Info Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="font-bold text-white text-base">Personal Details</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              {user?.role}
            </span>
          </div>

          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                Email Address (Permanent)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#080F1D]/50 text-content-muted border border-border-subtle/50 rounded-xl px-3.5 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-brand-cyan text-slate-950 hover:bg-sky-400 transition-colors"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-5">
          <div className="pb-3 border-b border-border-subtle">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-amber" />
              <span>Change Password</span>
            </h3>
          </div>

          {passMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passMsg}</span>
            </div>
          )}

          {passError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Verify existing password"
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
            >
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}