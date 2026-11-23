import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Compass, Search, Sparkles, ShieldCheck, User, 
  Heart, LogOut, Ticket, LayoutDashboard, ChevronDown, Building2,
  QrCode, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, favoriteParkIds } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Parks', path: '/parks' },
    { name: 'Activities', path: '/activities' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Offers', path: '/offers' },
    { name: 'About', path: '/about' }
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050914]/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-0.5 shadow-glow-cyan flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#080F1D] rounded-[10px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-brand-cyan group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ADVENTURE <span className="text-brand-cyan">MH</span>
              </span>
              <span className="block text-[9px] tracking-widest uppercase font-semibold text-brand-amber">
                One Platform. Every Adventure.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20'
                      : 'text-content-secondary hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/parks')}
              className="p-2 text-content-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Search Parks"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/favorites"
                  className="p-2 text-content-secondary hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors relative"
                  title="Saved Favorites"
                >
                  <Heart className="w-5 h-5" />
                  {favoriteParkIds.size > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {favoriteParkIds.size}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle text-xs font-semibold text-white transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan font-bold flex items-center justify-center text-[11px]">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl border border-border-subtle p-2 shadow-2xl space-y-1 text-xs"
                      >
                        <div className="px-3 py-2 border-b border-border-subtle">
                          <p className="font-bold text-white truncate">{user?.name}</p>
                          <p className="text-[10px] text-content-muted truncate">{user?.email}</p>
                          <span className="inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold bg-brand-cyan/20 text-brand-cyan">
                            {user?.role}
                          </span>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-cyan" />
                          <span>Dashboard</span>
                        </Link>

                        {(user?.role === 'PARK_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                          <>
                            <Link
                              to="/partner/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-brand-cyan hover:bg-brand-cyan/10 font-bold border border-brand-cyan/20"
                            >
                              <Building2 className="w-4 h-4 text-brand-cyan" />
                              <span>Partner Portal</span>
                            </Link>
                            <Link
                              to="/partner/scanner"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                            >
                              <QrCode className="w-4 h-4 text-emerald-400" />
                              <span>Turnstile Gate Scanner</span>
                            </Link>
                            <Link
                              to="/partner/analytics"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                            >
                              <BarChart3 className="w-4 h-4 text-purple-400" />
                              <span>Business Analytics</span>
                            </Link>
                          </>
                        )}

                        <Link
                          to="/my-bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                        >
                          <Ticket className="w-4 h-4 text-brand-amber" />
                          <span>My Bookings & Passes</span>
                        </Link>

                        <Link
                          to="/favorites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                        >
                          <Heart className="w-4 h-4 text-rose-400" />
                          <span>Saved Favorites</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5"
                        >
                          <User className="w-4 h-4 text-brand-blue" />
                          <span>Profile & Security</span>
                        </Link>

                        <div className="pt-1 border-t border-border-subtle">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-left font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-content-secondary hover:text-white rounded-lg hover:bg-white/5 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border-subtle bg-[#080F1D]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3"
          >
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-base font-medium flex items-center justify-between ${
                      isActive
                        ? 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20'
                        : 'text-content-secondary hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <span>{link.name}</span>
                </NavLink>
              ))}

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-base font-medium text-brand-cyan hover:bg-white/5 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard ({user?.name})</span>
                  </Link>

                  {(user?.role === 'PARK_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <>
                      <Link
                        to="/partner/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-base font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>Partner Operations Portal</span>
                      </Link>
                      <Link
                        to="/partner/scanner"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-base font-medium text-emerald-400 hover:bg-white/5 flex items-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Turnstile Gate Scanner</span>
                      </Link>
                      <Link
                        to="/partner/analytics"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-2.5 rounded-lg text-base font-medium text-purple-400 hover:bg-white/5 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Business Analytics</span>
                      </Link>
                    </>
                  )}
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Ticket className="w-4 h-4 text-brand-amber" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>Favorites ({favoriteParkIds.size})</span>
                  </Link>
                </>
              )}
            </nav>

            <div className="pt-3 border-t border-border-subtle flex flex-col gap-2.5">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20"
                >
                  Log Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-white border border-white/10"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}