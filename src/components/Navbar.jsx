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
  Languages
} from 'lucide-react';

export const Navbar = ({ onOpenPinPad, onToggleMobileSidebar }) => {
  const { currentUser, staff, switchUser, resetDatabase, products } = useStore();
  const { lang, toggleLanguage, t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lowStockCount = products.filter(p => p.stock < 5).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  {lang === 'kn' ? 'ಗ್ರೋಸರ್' : 'Grocer'}<span className="text-emerald-600">{lang === 'kn' ? 'ಈಸ್' : 'Ease'}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  {t('appTagline')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{t('outletLabel')}</div>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Alerts */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>

          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{lowStockCount} {lowStockCount > 1 ? t('lowStockAlerts') : t('lowStockAlert')}</span>
            </div>
          )}
        </div>

        {/* Right: Language Toggle + PIN Punch + User */}
        <div className="flex items-center gap-2.5">

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            <button
              onClick={() => toggleLanguage('en')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Switch to English"
            >
              <span>EN</span>
            </button>
            <button
              onClick={() => toggleLanguage('kn')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                lang === 'kn'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Switch to Kannada / ಕನ್ನಡ"
            >
              <span>ಕ</span>
            </button>
          </div>

          {/* Shift PIN Punch Terminal */}
          <button
            onClick={onOpenPinPad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t('shiftPinPunch')}</span>
          </button>

          {/* User Account / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition border border-slate-200"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold ${
                currentUser.role === 'Admin' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {currentUser.role === 'Admin' ? 'A' : 'C'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="leading-tight font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('activeProfile')}</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{currentUser.name}</div>
                  <div className="text-xs text-emerald-600 font-semibold">{currentUser.role} • PIN: {currentUser.pin}</div>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('switchRole')}
                </div>

                <div className="space-y-1 px-1">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { switchUser(s.id); setUserDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        currentUser.id === s.id
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{s.role}</div>
                      </div>
                      {currentUser.id === s.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
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
