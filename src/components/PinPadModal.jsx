import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { X, KeyRound, Clock, UserCheck, AlertCircle, Sparkles } from 'lucide-react';

export const PinPadModal = ({ isOpen, onClose, mode = 'ATTENDANCE' }) => {
  const { staff, loginWithPin, clockIn, clockOut, showToast } = useStore();
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [selectedAction, setSelectedAction] = useState('CHECK_IN'); // CHECK_IN or CHECK_OUT or LOGIN

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = (overridePin) => {
    const enteredPin = overridePin || pin;
    if (enteredPin.length !== 4) {
      showToast('Please enter a 4-digit PIN', 'error');
      return;
    }

    const matchedStaff = staff.find(s => s.pin === enteredPin);
    if (!matchedStaff) {
      showToast('Invalid PIN. Please try again.', 'error');
      setPin('');
      return;
    }

    if (mode === 'LOGIN' || selectedAction === 'LOGIN') {
      loginWithPin(enteredPin);
      onClose();
      setPin('');
      return;
    }

    if (selectedAction === 'CHECK_IN') {
      clockIn(matchedStaff.id);
    } else {
      clockOut(matchedStaff.id);
    }

    setPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'LOGIN' ? t('staffPinLogin') : t('shiftPunchTerminal')}
              </h3>
              <p className="text-xs text-slate-400">{t('enterPin')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle if in Attendance Mode */}
        {mode === 'ATTENDANCE' && (
          <div className="p-3 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedAction('CHECK_IN')}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedAction === 'CHECK_IN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('shiftCheckin')}</span>
            </button>
            <button
              onClick={() => setSelectedAction('CHECK_OUT')}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedAction === 'CHECK_OUT'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('shiftCheckout')}</span>
            </button>
          </div>
        )}

        {/* PIN Display Dots */}
        <div className="p-6 text-center bg-slate-50 border-b border-slate-200">
          <div className="flex justify-center gap-4 my-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-emerald-600 scale-125 ring-4 ring-emerald-100'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-mono h-4">
            {pin ? '• '.repeat(pin.length) : 'Enter 4 digits'}
          </div>
        </div>

        {/* Numeric Keypad */}
        <div className="p-5 bg-white">
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl shadow-sm transition-all flex items-center justify-center border border-slate-200/80"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-600 active:scale-95 text-slate-600 font-semibold text-xs transition-all flex items-center justify-center border border-slate-200/80"
            >
              {t('clear')}
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl shadow-sm transition-all flex items-center justify-center border border-slate-200/80"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 active:scale-95 text-slate-600 font-semibold text-xs transition-all flex items-center justify-center border border-slate-200/80"
            >
              ⌫ DEL
            </button>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={pin.length !== 4}
            className={`w-full mt-4 py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${
              pin.length === 4
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-emerald-600/25 scale-[1.01]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {t('confirmPunch')}
          </button>
        </div>

        {/* Demo Fast-PIN Quick Buttons for Instant Testing */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('quickTestPins')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {staff.slice(0, 4).map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setPin(s.pin);
                  handleSubmit(s.pin);
                }}
                className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left truncate transition"
              >
                <div className="font-semibold text-slate-800 truncate">{s.name}</div>
                <div className="text-[10px] text-slate-500">{s.role} (PIN: {s.pin})</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
