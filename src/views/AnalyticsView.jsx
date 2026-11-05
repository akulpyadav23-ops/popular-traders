import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users2,
  AlertTriangle,
  Receipt,
  Printer,
  Calendar,
  FileSpreadsheet,
  PieChart,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';

export const AnalyticsView = () => {
  const { sales, products, attendance, staff, setActiveReceipt } = useStore();
  const { t } = useLanguage();

  const [dateFilter, setDateFilter] = useState('ALL');

  // KPI Calculations
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalBills = sales.length;
  
  // Calculate approximate profit across recorded sales
  const estimatedProfit = sales.reduce((sum, s) => {
    const saleCost = s.items?.reduce((cSum, item) => cSum + (item.costPrice * item.qty), 0) || (s.grandTotal * 0.8);
    return sum + (s.grandTotal - saleCost);
  }, 0);

  const activeStaffCount = attendance.filter(a => a.checkInTime && !a.checkOutTime).length;
  const criticalStockCount = products.filter(p => p.stock < 5).length;

  // Payment Breakdown
  const paymentDistribution = sales.reduce((acc, s) => {
    acc[s.paymentMode] = (acc[s.paymentMode] || 0) + s.grandTotal;
    return acc;
  }, {});

  const paymentModes = [
    { mode: 'UPI', icon: <QrCode className="w-3.5 h-3.5 text-blue-500" />, color: 'bg-blue-500' },
    { mode: 'Cash', icon: <Banknote className="w-3.5 h-3.5 text-emerald-500" />, color: 'bg-emerald-500' },
    { mode: 'Card', icon: <CreditCard className="w-3.5 h-3.5 text-indigo-500" />, color: 'bg-indigo-500' },
    { mode: 'Udhar', icon: <BookOpen className="w-3.5 h-3.5 text-amber-500" />, color: 'bg-amber-500' }
  ];

  // Top Selling Items by Quantity
  const productSalesMap = {};
  sales.forEach(sale => {
    sale.items?.forEach(item => {
      productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.qty;
    });
  });

  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleExportSales = () => {
    const data = sales.map(s => ({
      InvoiceNumber: s.id,
      Timestamp: formatDateTime(s.timestamp),
      Cashier: s.cashierName,
      Customer: s.customerName,
      PaymentMode: s.paymentMode,
      ItemCount: s.items?.reduce((sum, i) => sum + i.qty, 0) || 0,
      Subtotal: s.subtotal,
      Discount: s.discount,
      Taxes: s.taxTotal,
      GrandTotal: s.grandTotal
    }));
    exportToCSV(data, `GrocerEase_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>{t('analyticsTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('analyticsDesc')}
          </p>
        </div>

        <button
          onClick={handleExportSales}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>{t('exportSales')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('grossSales')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Across {totalBills} {t('acrossReceipts')}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('grossProfit')}</div>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            {formatCurrency(estimatedProfit)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {totalSalesRevenue > 0 ? ((estimatedProfit / totalSalesRevenue) * 100).toFixed(1) : 0}% {t('netMargin')}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('activeStaff')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {activeStaffCount} <span className="text-sm font-semibold text-slate-500">/ {staff.length} staff</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{t('clockedIn')}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">{t('criticalStock')}</div>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {criticalStockCount} <span className="text-xs font-semibold text-rose-500">items (&lt;5 units)</span>
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">{t('immediateReorder')}</div>
        </div>
      </div>

      {/* Visual Analytics Grid: Payment Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Payment Channels Breakdown */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>{t('paymentChannels')}</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">{t('total')}: {formatCurrency(totalSalesRevenue)}</span>
          </div>

          <div className="space-y-3 pt-2">
            {paymentModes.map((p) => {
              const amount = paymentDistribution[p.mode] || 0;
              const percent = totalSalesRevenue > 0 ? Math.round((amount / totalSalesRevenue) * 100) : 0;

              const modeLabel =
                p.mode === 'Cash' ? t('cash') :
                p.mode === 'UPI' ? t('upiQr') :
                p.mode === 'Card' ? t('card') :
                p.mode === 'Udhar' ? t('udhar') :
                p.mode;

              return (
                <div key={p.mode} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      {p.icon}
                      <span>{modeLabel}</span>
                    </div>
                    <div className="font-mono">
                      <span className="font-bold text-slate-900">₹{amount.toFixed(2)}</span>
                      <span className="text-slate-400 ml-1.5">({percent}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Fast-Moving SKUs */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t('topFastMoving')}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600">{t('leaderboard')}</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {topProducts.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">{t('noSalesLogged')}</div>
            ) : (
              topProducts.map(([name, units], idx) => {
                const maxUnits = topProducts[0][1] || 1;
                const percent = Math.round((units / maxUnits) * 100);

                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[240px]">
                        {idx + 1}. {name}
                      </span>
                      <span className="font-bold text-emerald-700">{units} {t('soldUnits')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Transaction History & Receipt Re-print */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">{t('recentInvoices')}</h3>
          </div>
          <div className="text-xs text-slate-500">
            {t('totalTransactions').replace('{count}', sales.length)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('invoice')}</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">{t('cashier')}</th>
                <th className="py-3 px-4">{t('customer')}</th>
                <th className="py-3 px-4 text-center">{t('paymentMode')}</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">{t('grandTotal')}</th>
                <th className="py-3 px-4 text-center">{t('receipt')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{sale.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {formatDateTime(sale.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{sale.cashierName}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium truncate max-w-[140px]">
                    {sale.customerName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                      {sale.paymentMode === 'Cash' ? t('cash') :
                       sale.paymentMode === 'UPI' ? t('upiQr') :
                       sale.paymentMode === 'Card' ? t('card') :
                       sale.paymentMode === 'Udhar' ? t('udhar') :
                       sale.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {sale.items?.reduce((s, i) => s + i.qty, 0) || 1}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    ₹{sale.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setActiveReceipt(sale)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>{t('printReceipt')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
