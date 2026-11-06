import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Users2,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  FileCheck,
  Plus,
  Shield,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export const StaffAttendanceView = ({ onOpenPinPad }) => {
  const {
    staff,
    attendance,
    leaves,
    clockIn,
    clockOut,
    submitLeaveRequest,
    updateLeaveStatus,
    currentUser,
    showToast
  } = useStore();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('ATTENDANCE'); // ATTENDANCE, DIRECTORY, LEAVES
  
  // Apply Leave Modal State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveStaffId, setLeaveStaffId] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const isAdmin = currentUser?.role === 'Admin';
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveStaffId || !leaveStartDate || !leaveReason) return;
    submitLeaveRequest({
      staffId: leaveStaffId,
      startDate: leaveStartDate,
      endDate: leaveEndDate || leaveStartDate,
      days: 1,
      reason: leaveReason
    });
    setLeaveModalOpen(false);
    setLeaveStaffId('');
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-emerald-600" />
            <span>{t('staffTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('staffDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPinPad}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <KeyRound className="w-4 h-4" />
            <span>{t('openPinKiosk')}</span>
          </button>

          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{t('applyLeave')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 flex gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ATTENDANCE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('dailyAttendance')}
          </button>

          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'DIRECTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t('staffDirectory')} ({staff.length})
          </button>

          <button
            onClick={() => setActiveTab('LEAVES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'LEAVES'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{t('leaveManagement')}</span>
            {pendingLeaves > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingLeaves}
              </span>
            )}
          </button>
        </div>

        {/* 1. Daily Attendance Log */}
        {activeTab === 'ATTENDANCE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('staffMember')}</th>
                  <th className="py-3 px-4">{t('role')}</th>
                  <th className="py-3 px-4">{t('shiftDate')}</th>
                  <th className="py-3 px-4">{t('checkIn')}</th>
                  <th className="py-3 px-4">{t('checkOut')}</th>
                  <th className="py-3 px-4 text-center">{t('hoursWorked')}</th>
                  <th className="py-3 px-4 text-center">{t('status')}</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((rec) => {
                  let statusCls = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  if (rec.status === 'On Leave') statusCls = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (rec.status === 'Absent') statusCls = 'bg-red-100 text-red-800 border-red-200';

                  const statusLabel =
                    rec.status === 'Present' ? t('present')
                    : rec.status === 'Absent' ? t('absent')
                    : rec.status === 'On Leave' ? t('on')
                    : rec.status === 'Half-day' ? t('halfDay')
                    : rec.status;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.staffName}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{rec.role}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{rec.date}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {rec.checkInTime || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {rec.checkOutTime || (rec.checkInTime ? 'Active On Shift' : '—')}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {rec.hoursWorked ? `${rec.hoursWorked} ${t('hr')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCls}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!rec.checkOutTime && rec.checkInTime ? (
                          <button
                            onClick={() => clockOut(rec.staffId)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition"
                          >
                            {t('clockOut')}
                          </button>
                        ) : !rec.checkInTime ? (
                          <button
                            onClick={() => clockIn(rec.staffId)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition"
                          >
                            {t('clockIn')}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">{t('shiftCompleted')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Staff Directory & Wages */}
        {activeTab === 'DIRECTORY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('staffMember')}</th>
                  <th className="py-3 px-4">{t('role')}</th>
                  <th className="py-3 px-4">{t('contactPhone')}</th>
                  <th className="py-3 px-4 text-center">{t('securityPin')}</th>
                  <th className="py-3 px-4 text-right">{t('compensation')}</th>
                  <th className="py-3 px-4 text-center">{t('employment')}</th>
                  <th className="py-3 px-4">{t('joiningDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.id}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{s.role}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <div>{s.phone}</div>
                      <div className="text-[10px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      {isAdmin ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{s.pin}</span>
                      ) : (
                        '••••'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {isAdmin ? (
                        s.wageType === 'Hourly' ? (
                          `₹${s.wageAmount} ${t('perHour')}`
                        ) : (
                          formatCurrency(s.wageAmount) + ` ${t('perMonth')}`
                        )
                      ) : (
                        <span className="text-slate-400 font-normal italic">{t('confidential')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{s.joiningDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Leave Management */}
        {activeTab === 'LEAVES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('staffMember')}</th>
                  <th className="py-3 px-4">{t('dateRange')}</th>
                  <th className="py-3 px-4 text-center">{t('days')}</th>
                  <th className="py-3 px-4">{t('reason')}</th>
                  <th className="py-3 px-4 text-center">{t('status')}</th>
                  <th className="py-3 px-4 text-center">{t('adminDecision')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{l.staffName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {l.startDate} to {l.endDate}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{l.days} {t('dayCount')}</td>
                    <td className="py-3 px-4 text-slate-700">{l.reason}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {l.status === 'Approved' ? t('approved')
                          : l.status === 'Rejected' ? t('rejected')
                          : t('pending')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        l.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => updateLeaveStatus(l.id, 'Approved')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> {t('approve')}
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(l.id, 'Rejected')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> {t('reject')}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">{t('decisionFinalized')}</span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400">{t('adminApprovalReq')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Apply Leave Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{t('applyLeaveTitle')}</h3>
              </div>
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('leaveStaffMember')}</label>
                <select
                  required
                  value={leaveStaffId}
                  onChange={(e) => setLeaveStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="">{t('selectStaffMember')}</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('startDate')}</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('endDate')}</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('leaveReason')}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={t('leaveReasonPlaceholder')}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('submitApplication')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
