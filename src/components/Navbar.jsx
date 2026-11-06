import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Store,
  Clock,
  KeyRound,
  ChevronDown,
  Menu,
  CheckCircle2,
  RotateCcw,
  Languages,
  User,
  Shield,
  Briefcase
} from 'lucide-react';

export const Navbar = ({ onOpenPinPad, onToggleMobileSidebar, onOpenProfileDrawer }) => {
  const { currentUser, staff, switchUser, resetDatabase, products, isAdmin } = useStore();
  const { lang, setLanguage, t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockCount = products.filter(p => p.stock < 5).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* Left: Profile Drawer Trigger Avatar & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* User Profile Avatar Trigger (Top-Left) */}
          <button
            onClick={onOpenProfileDrawer}
            className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-2xl bg-slate-100 hover:bg-[#e7ede8] border border-slate-200 transition group cursor-pointer"
            title="Open Staff Profile & Drawer"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                alt={currentUser?.name || "User"}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#7b977e]/30 group-hover:ring-[#7b977e] transition"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                isAdmin ? 'bg-indigo-600' : 'bg-[#7b977e]'
              }`} />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 group-hover:text-[#546956] leading-tight truncate max-w-[110px]">
                {currentUser?.name || 'Staff User'}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {currentUser?.role || 'Worker'}
              </div>
            </div>
          </button>

          {/* Store Brand */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7b977e] to-[#546956] flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
                  POPULAR <span className="text-[#7b977e]">TRADERS</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-[#344336] px-1.5 py-0.2 rounded border border-[#7b977e]/30 hidden sm:inline">
                  {isAdmin ? 'ADMIN' : 'WORKER'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden md:block">
                {t('outletLabel')}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Low Stock Notice */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>

          {lowStockCount > 0 && isAdmin && (
            <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{lowStockCount} {t('lowStockAlert')}</span>
            </div>
          )}
        </div>

        {/* Right: Language Toggle & PIN Kiosk & Profile Switcher */}
        <div className="flex items-center gap-2">

          {/* Tri-Lingual Toggle (EN / ಕನ್ನಡ / हिन्दी) */}
          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            {[
              { code: 'en', label: 'EN' },
              { code: 'kn', label: 'ಕ' },
              { code: 'hi', label: 'हि' }
            ].map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  lang === l.code
                    ? 'bg-white text-[#546956] shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={`Switch language to ${l.label}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Quick PIN Punch Terminal */}
          <button
            onClick={onOpenPinPad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#e7ede8] text-[#344336] text-xs font-bold transition border border-[#7b977e]/30 shadow-xs"
            title={t('shiftPinPunch')}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#7b977e]" />
            <span className="hidden sm:inline">{t('shiftPinPunch')}</span>
          </button>

          {/* Switch Demo Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 flex items-center gap-1.5"
              title={t('switchRole')}
            >
              <span className="text-[11px] hidden sm:inline">Role Switch</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('activeProfile')}</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{currentUser?.name}</div>
                  <div className="text-[10px] text-[#546956] font-semibold">{currentUser?.role} • {currentUser?.phone}</div>
                </div>

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('switchRole')}
                </div>

                <div className="space-y-1 px-1">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { switchUser(s.id); setUserDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        currentUser?.id === s.id
                          ? 'bg-emerald-50 text-[#344336] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{s.role} • {s.phone}</div>
                      </div>
                      {currentUser?.id === s.id && <CheckCircle2 className="w-4 h-4 text-[#7b977e]" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                  <button
                    onClick={() => { setUserDropdownOpen(false); resetDatabase(); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('resetDefaults')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
