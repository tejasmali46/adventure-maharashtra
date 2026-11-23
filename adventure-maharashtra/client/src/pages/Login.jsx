import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for development & grading
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-0.5 mx-auto flex items-center justify-center shadow-glow-cyan">
            <div className="w-full h-full bg-[#080F1D] rounded-[14px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-brand-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-content-secondary">
            Sign in to access your digital tickets, manage bookings, and explore Maharashtra.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. explorer@example.com"
                  className="w-full bg-[#080F1D] text-white pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#080F1D] text-white pl-10 pr-10 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Signing In...' : 'SIGN IN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-border-subtle space-y-2">
            <span className="text-[11px] font-bold text-brand-amber uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Demo Quick-Fill Accounts:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('aarav@example.com', 'Password@123')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/5 transition-colors"
              >
                <strong className="block text-white">Customer</strong>
                <span className="text-content-muted">aarav@example.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@adventuremaharashtra.in', 'Admin@12345')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/5 transition-colors"
              >
                <strong className="block text-brand-cyan">Super Admin</strong>
                <span className="text-content-muted">admin@adventure...</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('owner.imagicaa@adventuremaharashtra.in', 'Password@123')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/5 transition-colors"
              >
                <strong className="block text-emerald-400">Park Admin</strong>
                <span className="text-content-muted">owner.imagicaa@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('gate.staff@adventuremaharashtra.in', 'Password@123')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left border border-white/5 transition-colors"
              >
                <strong className="block text-purple-400">Entry Staff</strong>
                <span className="text-content-muted">gate.staff@...</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-content-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-cyan hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}