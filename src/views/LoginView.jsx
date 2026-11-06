import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Store,
  Shield,
  Briefcase,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Languages
} from 'lucide-react';

export const LoginView = () => {
  const { loginWithPhonePassword, showToast } = useStore();
  const { lang, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('Admin'); // 'Admin' or 'Worker'
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab switch handler: pre-fill credentials for quick evaluation
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'Admin') {
      setPhoneNumber('9876543210');
      setPassword('admin123');
    } else {
      setPhoneNumber('9811122334');
      setPassword('worker123');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithPhonePassword(phoneNumber, password, activeTab);
      if (!result.success) {
        setErrorMsg(result.message || t('invalidCredentials'));
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#e7ede8]/40 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      
      {/* Top Language Bar */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xs p-1 rounded-2xl border border-slate-200 shadow-xs">
          <Languages className="w-3.5 h-3.5 text-[#7b977e] ml-2" />
          {[
            { code: 'en', label: 'English' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
            { code: 'hi', label: 'हिन्दी' }
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                lang === l.code
                  ? 'bg-[#7b977e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-b from-[#7b977e] to-[#67806a] text-white p-7 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center text-white mb-3 shadow-md border border-white/30">
            <Store className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black tracking-tight">{t('loginTitle')}</h1>
          <p className="text-xs text-white/90 mt-1 font-medium">{t('loginSubtitle')}</p>
        </div>

        {/* Tab Selector: Admin Login vs Worker Login */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-1.5">
          <button
            type="button"
            onClick={() => handleTabSwitch('Admin')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'Admin'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'Admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{t('adminLoginTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('Worker')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'Worker'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeTab === 'Worker' ? 'text-[#7b977e]' : 'text-slate-400'}`} />
            <span>{t('workerLoginTab')}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Access Scope Info Pill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeTab === 'Admin' ? 'bg-indigo-600' : 'bg-[#7b977e]'}`} />
            <span>
              {activeTab === 'Admin'
                ? 'Full Control: Inventory OCR, Pricing Master, Staff Wages, Analytics'
                : 'Restricted: Price List, Attendance Kiosk, Non-GST POS, Customer Ledger'}
            </span>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('phoneLabel')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder={t('phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7b977e]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7b977e]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#7b977e] hover:bg-[#67806a] text-white font-bold rounded-2xl text-xs shadow-md shadow-[#7b977e]/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying...' : t('loginBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Shortcuts */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              {t('quickDemoCredentials')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('Admin');
                  setPhoneNumber('9876543210');
                  setPassword('admin123');
                  setErrorMsg('');
                }}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-[10px] font-bold border border-indigo-200 text-left transition"
              >
                <div className="flex items-center gap-1 text-indigo-700">
                  <Shield className="w-3 h-3" />
                  <span>Admin Demo</span>
                </div>
                <div className="font-mono text-slate-500 mt-0.5">9876543210 / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('Worker');
                  setPhoneNumber('9811122334');
                  setPassword('worker123');
                  setErrorMsg('');
                }}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-[10px] font-bold border border-emerald-200 text-left transition"
              >
                <div className="flex items-center gap-1 text-[#546956]">
                  <Briefcase className="w-3 h-3" />
                  <span>Worker Demo</span>
                </div>
                <div className="font-mono text-slate-500 mt-0.5">9811122334 / worker123</div>
              </button>
            </div>
          </div>

        </form>

      </div>

      <div className="mt-4 text-[11px] text-slate-500 font-medium">
        POPULAR TRADERS • Point of Sale & Enterprise Management System
      </div>

    </div>
  );
};
