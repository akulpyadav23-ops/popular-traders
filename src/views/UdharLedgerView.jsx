import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  BookOpenCheck,
  Search,
  Plus,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';
import { useLanguage } from '../context/LanguageContext';

export const UdharLedgerView = () => {
  const { customers, addCustomer, settleCustomerCredit, showToast } = useStore();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Settle Payment Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMode, setRepayMode] = useState('Cash');
  const [repayNotes, setRepayNotes] = useState('');

  // Add Customer Modal
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState('5000');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    c.phone.includes(searchQuery.trim())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
  const customersWithDebt = customers.filter(c => c.outstandingBalance > 0).length;

  const handleOpenSettle = (customer) => {
    setSelectedCust(customer);
    setRepayAmount(customer.outstandingBalance.toString());
    setSettleModalOpen(true);
  };

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCust || !repayAmount) return;
    settleCustomerCredit(selectedCust.id, repayAmount, repayMode, repayNotes);
    setSettleModalOpen(false);
    setSelectedCust(null);
    setRepayAmount('');
  };

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      creditLimit: Number(newCustLimit) || 5000
    });
    setAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleExportCSV = () => {
    const data = customers.map(c => ({
      ID: c.id,
      Name: c.name,
      Phone: c.phone,
      CreditLimit: c.creditLimit,
      OutstandingBalance: c.outstandingBalance,
      LastPaymentDate: c.lastPaymentDate || '—'
    }));
    exportToCSV(data, `GrocerEase_UdharLedger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-600" />
            <span>{t('udharTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('udharDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddCustomerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCreditCustomer')}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('exportKhata')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('totalReceivables')}</div>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{t('pendingCollection')}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('creditCapacity')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatCurrency(totalLimit)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {totalLimit > 0 ? ((totalOutstanding / totalLimit) * 100).toFixed(1) : 0}% {t('creditUtilized')}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('activeCredits')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {customersWithDebt} <span className="text-sm font-semibold text-slate-500">/ {customers.length} {t('totalCustomers')}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">{t('neighborhoodAccounts')}</div>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchCustomer')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('customerName')}</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">{t('creditLimitCol')}</th>
                <th className="py-3 px-4 text-right">{t('currentUdhar')}</th>
                <th className="py-3 px-4">{t('utilization')}</th>
                <th className="py-3 px-4">{t('lastPayment')}</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const percent = Math.min(100, Math.round((c.outstandingBalance / c.creditLimit) * 100));
                const isOverLimit = c.outstandingBalance > c.creditLimit;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      ₹{c.creditLimit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                      ₹{c.outstandingBalance.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-28 space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent > 85 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">{percent}% used</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {c.lastPaymentDate || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.outstandingBalance > 0 ? (
                        <button
                          onClick={() => handleOpenSettle(c)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition"
                        >
                          {t('settleRepayment')}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">{t('allCleared')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Settle Repayment Modal */}
      {settleModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{t('settleTitle')}</h3>
                <p className="text-xs text-emerald-200">{selectedCust.name}</p>
              </div>
              <button
                onClick={() => setSettleModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600">{t('currentOutstandingLabel')}</span>
                <span className="text-base font-extrabold text-rose-600">
                  ₹{selectedCust.outstandingBalance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('repaymentAmount')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedCust.outstandingBalance}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('paymentMethod')}</label>
                <select
                  value={repayMode}
                  onChange={(e) => setRepayMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="Cash">{t('cashAtCounter')}</option>
                  <option value="UPI">{t('upiGpay')}</option>
                  <option value="Bank Transfer">{t('bankTransfer')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('receiptNotes')}</label>
                <input
                  type="text"
                  placeholder="e.g. Paid weekly dues in cash"
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('creditToKhata')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">{t('addCustomerTitle')}</h3>
              <button
                onClick={() => setAddCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('customerFullName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satish Kulkarni (Flat 201)"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('mobilePhone')}</label>
                <input
                  type="text"
                  placeholder="e.g. 98199 88776"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('approvedCreditLimit')}</label>
                <input
                  type="number"
                  step="500"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('saveCustomer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
