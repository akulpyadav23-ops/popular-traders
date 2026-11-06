import React from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  User,
  Shield,
  Phone,
  MapPin,
  CalendarCheck2,
  DollarSign,
  Languages,
  LogOut,
  Sparkles,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const ProfileDrawer = ({ isOpen, onClose }) => {
  const { currentUser, logout, isWorker, isAdmin } = useStore();
  const { lang, setLanguage, t } = useLanguage();

  if (!isOpen || !currentUser) return null;

  // Attendance calculation for worker
  const presentDays = currentUser.monthlyAttendanceDays || 24;
  const totalDays = currentUser.totalWorkingDays || 26;
  const attendancePercent = Math.min(100, Math.round((presentDays / totalDays) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-r border-slate-200 animate-in slide-in-from-left duration-300">
          
          {/* Drawer Header */}
          <div className="bg-[#7b977e] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  {t('profileDrawerTitle')}
                </h3>
                <span className="text-[11px] text-white/80">
                  POPULAR TRADERS • Outlet #104
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Profile Hero Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#7b977e]/30 shadow-sm"
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  currentUser.role === 'Admin' ? 'bg-indigo-600' : 'bg-[#7b977e]'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-slate-900 truncate">
                    {currentUser.name}
                  </h4>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentUser.role === 'Admin'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-[#7b977e]/20 text-[#344336] border border-[#7b977e]/40'
                  }`}>
                    {currentUser.role === 'Admin' ? t('adminFullTag') : t('workerRestrictedTag')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {currentUser.title || currentUser.role}
                </p>
              </div>
            </div>

            {/* Contact & Residential Details */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Contact & Station Details
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3 text-xs shadow-xs">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#7b977e] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-400 text-[10px] block">{t('phoneContact')} (User ID)</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {currentUser.displayPhone || currentUser.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2.5 border-t border-slate-100">
                  <MapPin className="w-4 h-4 text-[#7b977e] mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-400 text-[10px] block">{t('residentialAddress')}</span>
                    <span className="text-slate-700 font-medium leading-relaxed">
                      {currentUser.address || 'Central Store Quarters, Sector 12, Bangalore'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* If Worker: Monthly Attendance Progress Bar & Base Salary */}
            {isWorker && (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>{t('monthlyAttendanceStats')}</span>
                  <span className="text-[#7b977e] font-extrabold">{attendancePercent}%</span>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-[#7b977e]/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <CalendarCheck2 className="w-4 h-4 text-[#7b977e]" />
                      <span>{t('daysPresent')}</span>
                    </span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {presentDays} / {totalDays} {t('dayCount')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#7b977e] h-2.5 rounded-full transition-all duration-500 ease-out shadow-xs"
                      style={{ width: `${attendancePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                    <span>Target: 24+ days</span>
                    <span className="text-emerald-700 font-bold">Good Performance ★</span>
                  </div>
                </div>

                {/* Base Monthly Salary Details */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                      {t('baseSalaryTitle')}
                    </span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">
                      {formatCurrency(currentUser.baseMonthlySalary || currentUser.wageAmount || 18500)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disbursed monthly via Direct Bank Transfer
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#7b977e] flex items-center justify-center font-bold">
                    ₹
                  </div>
                </div>
              </div>
            )}

            {/* Multilingual Switcher Dropdown */}
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                {t('languageSwitcherTitle')}
              </div>

              <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English', sub: 'EN' },
                    { code: 'kn', label: 'ಕನ್ನಡ', sub: 'KN' },
                    { code: 'hi', label: 'हिन्दी', sub: 'HI' }
                  ].map(item => (
                    <button
                      key={item.code}
                      onClick={() => setLanguage(item.code)}
                      className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        lang === item.code
                          ? 'bg-[#7b977e] text-white border-[#7b977e] font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className={`text-[10px] ${lang === item.code ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Drawer Footer with Secure Logout */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98 shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logoutBtn')}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
