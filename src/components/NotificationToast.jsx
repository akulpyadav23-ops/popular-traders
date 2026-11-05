import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const bgColors = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
    error: 'bg-white border-red-200 text-slate-800 shadow-red-500/10',
    warning: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
    info: 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${bgColors[toast.type] || bgColors.info}`}>
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium pr-2">{toast.message}</span>
      </div>
    </div>
  );
};
