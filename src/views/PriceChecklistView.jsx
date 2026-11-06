import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  BadgePercent,
  Search,
  Edit3,
  Check,
  X,
  History,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowUpDown,
  Lock
} from 'lucide-react';
import { formatCurrency, calculateMarginPercent, getStockStatus } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';

export const PriceChecklistView = () => {
  const { products, updateProductPrice, priceAuditLogs, currentUser, showToast } = useStore();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('PRICE_BOOK'); // PRICE_BOOK or AUDIT_LOGS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  
  // Inline Price Editing State
  const [editingProductId, setEditingProductId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [updateReason, setUpdateReason] = useState('Wholesale price revision');

  const isAdmin = currentUser.role === 'Admin';
  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.barcode.includes(query) ||
      product.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredAuditLogs = priceAuditLogs.filter(log => {
    const q = auditSearchQuery.toLowerCase().trim();
    return (
      !q ||
      log.productName.toLowerCase().includes(q) ||
      log.changedBy.toLowerCase().includes(q) ||
      (log.reason && log.reason.toLowerCase().includes(q))
    );
  });

  const startEditing = (product) => {
    if (!isAdmin) {
      showToast('Price modification is restricted to Administrators', 'warning');
      return;
    }
    setEditingProductId(product.id);
    setTempPrice(product.sellingPrice.toString());
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setTempPrice('');
  };

  const savePrice = (productId) => {
    const val = Number(tempPrice);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }
    updateProductPrice(productId, val, updateReason);
    setEditingProductId(null);
  };

  const handleExportCSV = () => {
    const data = products.map(p => ({
      Barcode: p.barcode,
      Name: p.name,
      Category: p.category,
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      MarginPercent: `${calculateMarginPercent(p.sellingPrice, p.costPrice)}%`,
      Stock: p.stock,
      Batch: p.batch || '—'
    }));
    exportToCSV(data, `PopularTraders_PriceBook_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-[#7b977e]" />
            <span>{t('priceChecklistTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('priceChecklistDesc2')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('readOnly')} ({currentUser?.role})</span>
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#7b977e]" />
            <span>{t('exportPriceBook')}</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('PRICE_BOOK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'PRICE_BOOK'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('masterPriceBook')} ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'AUDIT_LOGS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('auditTrail')} ({priceAuditLogs.length})</span>
            </button>
          </div>

          {activeTab === 'PRICE_BOOK' && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchPriceBook')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'AUDIT_LOGS' && (
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchAuditLog')}
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Master Price Table */}
        {activeTab === 'PRICE_BOOK' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('itemCode')}</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4 text-center">{t('thresholdStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('costPrice')}</th>
                  <th className="py-3 px-4 text-right">{t('sellingPrice')}</th>
                  <th className="py-3 px-4 text-center">{t('margin')}</th>
                  <th className="py-3 px-4 text-center">{t('marginHealth')}</th>
                  <th className="py-3 px-4 text-center">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isEditing = editingProductId === p.id;
                  const currentMargin = Number(calculateMarginPercent(p.sellingPrice, p.costPrice));
                  
                  // Projected margin if editing
                  const projectedMargin = isEditing
                    ? Number(calculateMarginPercent(tempPrice, p.costPrice))
                    : currentMargin;

                  // Margin Health Indicator
                  let badge = {
                    label: t('high'),
                    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  };
                  if (projectedMargin < 10) {
                    badge = {
                      label: t('low'),
                      cls: 'bg-red-100 text-red-800 border-red-200'
                    };
                  } else if (projectedMargin < 20) {
                    badge = {
                      label: t('fair'),
                      cls: 'bg-amber-100 text-amber-800 border-amber-200'
                    };
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.barcode}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.category}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStockStatus(p.stock).color}`}>
                          {p.stock} units ({getStockStatus(p.stock).label})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-500">
                        ₹{p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price Cell with Inline Editing */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-slate-400 text-xs">₹</span>
                            <input
                              type="number"
                              step="0.5"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border-2 border-emerald-500 rounded-lg text-right font-bold text-xs focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="font-extrabold text-sm text-slate-900">
                            ₹{p.sellingPrice.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-xs text-slate-800">
                          {projectedMargin.toFixed(2)}%
                        </span>
                      </td>

                      {/* Margin Health Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => savePrice(p.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                              title={t('save')}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                              title={t('cancel')}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(p)}
                            disabled={!isAdmin}
                            className={`p-1.5 rounded-lg transition flex items-center justify-center mx-auto ${
                              isAdmin
                                ? 'hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                            title={isAdmin ? t('edit') : 'Admin Only'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Log Table */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('auditId')}</th>
                  <th className="py-3 px-4">{t('timestamp')}</th>
                  <th className="py-3 px-4">{t('itemCode')}</th>
                  <th className="py-3 px-4 text-right">{t('oldPrice')}</th>
                  <th className="py-3 px-4 text-right">{t('newPrice')}</th>
                  <th className="py-3 px-4 text-center">{t('marginShift')}</th>
                  <th className="py-3 px-4">{t('authorizedBy')}</th>
                  <th className="py-3 px-4">{t('auditReason')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 text-[11px]">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.productName}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-medium">
                      ₹{log.oldPrice}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      ₹{log.newPrice}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      <span className="text-slate-400">{log.oldMargin}</span> →{' '}
                      <span className="text-emerald-700">{log.newMargin}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{log.changedBy}</td>
                    <td className="py-3 px-4 text-slate-600 italic">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
