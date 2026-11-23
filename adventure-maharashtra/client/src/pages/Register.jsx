import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Begin Your Journey
          </h1>
          <p className="text-xs text-content-secondary">
            Join thousands of travelers exploring adventure destinations across Maharashtra.
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Prachi Lohkare"
                  className="w-full bg-[#080F1D] text-white pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. prachi@example.com"
                  className="w-full bg-[#080F1D] text-white pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 1234567891"
                  className="w-full bg-[#080F1D] text-white pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 chars"
                    className="w-full bg-[#080F1D] text-white pl-10 pr-3 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-content-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full bg-[#080F1D] text-white pl-10 pr-3 py-2.5 rounded-xl border border-border-subtle text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="pt-2 text-center text-[11px] text-content-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure password hashing & encrypted session tokens</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-content-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-cyan hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}