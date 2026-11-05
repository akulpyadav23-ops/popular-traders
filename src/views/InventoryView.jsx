import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  PackageCheck,
  History,
  FileSpreadsheet,
  X,
  CheckCircle2,
  FileEdit,
  FilePlus2
} from 'lucide-react';
import { formatCurrency, getStockStatus } from '../utils/formatters';
import { exportToCSV } from '../utils/exportCsv';

export const InventoryView = () => {
  const { products, stockLogs, stockIn, stockOut, addManualStockLog, currentUser } = useStore();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState('CATALOG'); // CATALOG or LOGS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreshold, setFilterThreshold] = useState('ALL'); // ALL, CRITICAL (<5), WARNING (<15), HEALTHY (>=15)

  // Log Search & Filter State
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFilterType, setLogFilterType] = useState('ALL'); // ALL, STOCK_IN, STOCK_OUT

  // Stock In Modal
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [inProductId, setInProductId] = useState('');
  const [inQty, setInQty] = useState('');
  const [inBatch, setInBatch] = useState('');
  const [inSupplier, setInSupplier] = useState('');
  const [inCost, setInCost] = useState('');
  const [inNotes, setInNotes] = useState('');

  // Stock Out Modal
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [outProductId, setOutProductId] = useState('');
  const [outQty, setOutQty] = useState('');
  const [outReason, setOutReason] = useState('Damage / Transit Leakage');
  const [outNotes, setOutNotes] = useState('');

  // Manual Direct Entry to Log Modal
  const [manualLogModalOpen, setManualLogModalOpen] = useState(false);
  const [manLogType, setManLogType] = useState('STOCK_IN');
  const [manLogName, setManLogName] = useState('');
  const [manLogQty, setManLogQty] = useState('1');
  const [manLogBatch, setManLogBatch] = useState('');
  const [manLogSupplier, setManLogSupplier] = useState('');
  const [manLogReason, setManLogReason] = useState('Manual Stock Adjustment');
  const [manLogNotes, setManLogNotes] = useState('');

  // Inventory Valuation Calculations
  const totalSkus = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
  const unrealizedProfit = totalRetailValuation - totalCostValuation;

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.barcode.includes(query) ||
      product.category.toLowerCase().includes(query);

    let matchesThreshold = true;
    if (filterThreshold === 'CRITICAL') matchesThreshold = product.stock < 5;
    else if (filterThreshold === 'WARNING') matchesThreshold = product.stock >= 5 && product.stock < 15;
    else if (filterThreshold === 'HEALTHY') matchesThreshold = product.stock >= 15;

    return matchesSearch && matchesThreshold;
  });

  // Filtered logs list
  const filteredLogs = stockLogs.filter(log => {
    const q = logSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.productName.toLowerCase().includes(q) ||
      (log.batch && log.batch.toLowerCase().includes(q)) ||
      (log.supplier && log.supplier.toLowerCase().includes(q)) ||
      (log.reason && log.reason.toLowerCase().includes(q)) ||
      (log.notes && log.notes.toLowerCase().includes(q)) ||
      (log.recordedBy && log.recordedBy.toLowerCase().includes(q));

    const matchesType = logFilterType === 'ALL' || log.type === logFilterType;
    return matchesSearch && matchesType;
  });

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (!inProductId || !inQty) return;
    stockIn({
      productId: inProductId,
      qty: inQty,
      batch: inBatch,
      supplier: inSupplier,
      unitCost: inCost,
      notes: inNotes
    });
    setStockInModalOpen(false);
    setInProductId('');
    setInQty('');
    setInBatch('');
    setInSupplier('');
    setInCost('');
    setInNotes('');
  };

  const handleStockOutSubmit = (e) => {
    e.preventDefault();
    if (!outProductId || !outQty) return;
    stockOut({
      productId: outProductId,
      qty: outQty,
      reason: outReason,
      notes: outNotes
    });
    setStockOutModalOpen(false);
    setOutProductId('');
    setOutQty('');
    setOutNotes('');
  };

  const handleManualLogSubmit = (e) => {
    e.preventDefault();
    if (!manLogName.trim() || !manLogQty) return;

    addManualStockLog({
      type: manLogType,
      productName: manLogName.trim(),
      qty: Number(manLogQty) || 1,
      batch: manLogBatch || 'MANUAL',
      supplier: manLogSupplier || 'Direct Adjustment',
      reason: manLogReason,
      notes: manLogNotes
    });

    setManualLogModalOpen(false);
    setManLogName('');
    setManLogQty('1');
    setManLogBatch('');
    setManLogSupplier('');
    setManLogNotes('');
  };

  const handleExportInventory = () => {
    const dataToExport = products.map(p => ({
      Barcode: p.barcode,
      Name: p.name,
      Category: p.category,
      Unit: p.unit,
      Stock: p.stock,
      CostPrice: p.costPrice,
      SellingPrice: p.sellingPrice,
      Batch: p.batch || '—',
      ExpiryDate: p.expiryDate || '—',
      TotalWholesaleValue: p.stock * p.costPrice,
      TotalRetailValue: p.stock * p.sellingPrice
    }));
    exportToCSV(dataToExport, `GrocerEase_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>{t('stockTrackerTitle')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('stockTrackerDesc2')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStockInModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('stockInPurchase')}</span>
          </button>

          <button
            onClick={() => setStockOutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{t('stockOutLoss')}</span>
          </button>

          <button
            onClick={handleExportInventory}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Inventory Total Valuation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('totalSkusUnits')}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalSkus}</span>
            <span className="text-xs font-semibold text-slate-500">({totalUnits} units)</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">{t('liveSynced')}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('wholesaleValue')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatCurrency(totalCostValuation)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{t('atCostPrice')}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('retailPotential')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatCurrency(totalRetailValuation)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{t('atSellingPrice')}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">{t('potentialProfit')}</div>
          <div className="mt-1 text-2xl font-black text-emerald-700">
            {formatCurrency(unrealizedProfit)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {totalRetailValuation > 0 ? ((unrealizedProfit / totalRetailValuation) * 100).toFixed(1) : 0}% {t('potentialMargin')}
          </div>
        </div>
      </div>

      {/* Sub Tabs: Catalog vs In/Out Audit Logs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('CATALOG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeSubTab === 'CATALOG'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('masterStockLevels')}
            </button>
            <button
              onClick={() => setActiveSubTab('LOGS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'LOGS'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('movementLogs')} ({stockLogs.length})</span>
            </button>
          </div>

          {/* Catalog Search & Filter */}
          {activeSubTab === 'CATALOG' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchCatalog')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">{t('allStockLevels')}</option>
                <option value="CRITICAL">{t('critical')}</option>
                <option value="WARNING">{t('warning')}</option>
                <option value="HEALTHY">{t('healthy')}</option>
              </select>
            </div>
          )}

          {/* Movement Logs Search & Filter & Manual Entry */}
          {activeSubTab === 'LOGS' && (
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchLog')}
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={logFilterType}
                onChange={(e) => setLogFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">{t('allTypes')}</option>
                <option value="STOCK_IN">{t('stockInType')}</option>
                <option value="STOCK_OUT">{t('stockOutType')}</option>
              </select>

              <button
                onClick={() => setManualLogModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>{t('enterLogEntry')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Master Stock Table */}
        {activeSubTab === 'CATALOG' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('itemCode')}</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4 text-center">{t('currentStock')}</th>
                  <th className="py-3 px-4 text-center">{t('thresholdStatus')}</th>
                  <th className="py-3 px-4 text-right">{t('costPrice')}</th>
                  <th className="py-3 px-4 text-right">{t('sellingPrice')}</th>
                  <th className="py-3 px-4 text-right">{t('totalValuation')}</th>
                  <th className="py-3 px-4">{t('batchExpiry')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const stockStatus = getStockStatus(p.stock);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.category}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900">{p.stock}</span>
                        <span className="text-[10px] text-slate-500 ml-1">{p.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stockStatus.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.badgeColor}`}></span>
                          <span>{stockStatus.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        ₹{p.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">
                        {formatCurrency(p.stock * p.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <div>{p.batch || '—'}</div>
                        <div className="text-[9px] text-slate-400">Exp: {p.expiryDate || '—'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* In/Out Movement Logs Table */}
        {activeSubTab === 'LOGS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('type')}</th>
                  <th className="py-3 px-4">{t('timestamp')}</th>
                  <th className="py-3 px-4">{t('productName')}</th>
                  <th className="py-3 px-4 text-center">{t('quantityCol')}</th>
                  <th className="py-3 px-4">{t('batchSupplier')}</th>
                  <th className="py-3 px-4">{t('reasonNotes')}</th>
                  <th className="py-3 px-4">{t('recordedBy')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {t('noLogsMatch')}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isIn = log.type === 'STOCK_IN';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isIn ? t('stockIn') : t('stockOut')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.productName}</td>
                        <td className="py-3 px-4 text-center font-bold text-sm">
                          <span className={isIn ? 'text-emerald-700' : 'text-rose-700'}>
                            {isIn ? `+${log.qty}` : `-${log.qty}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-mono text-[10px] text-slate-500">{log.batch || '—'}</div>
                          <div className="text-[11px] font-medium">{log.supplier || '—'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {log.reason ? <span className="font-semibold text-rose-600">{log.reason}: </span> : null}
                          <span>{log.notes || '—'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{log.recordedBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Manual Direct Entry to Log Modal */}
      {manualLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{t('manualLogTitle')}</h3>
              </div>
              <button
                onClick={() => setManualLogModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualLogSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('movementType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManLogType('STOCK_IN')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      manLogType === 'STOCK_IN'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {t('stockInAdd')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManLogType('STOCK_OUT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      manLogType === 'STOCK_OUT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {t('stockOutDeduct')}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('productItemName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  value={manLogName}
                  onChange={(e) => setManLogName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('quantityCol')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manLogQty}
                    onChange={(e) => setManLogQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('batchTag')}</label>
                  <input
                    type="text"
                    placeholder="e.g. MAN-BATCH-01"
                    value={manLogBatch}
                    onChange={(e) => setManLogBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('reasonPurpose')}</label>
                <input
                  type="text"
                  placeholder="e.g. Physical inventory count correction, emergency local purchase"
                  value={manLogReason}
                  onChange={(e) => setManLogReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('additionalNotes')}</label>
                <input
                  type="text"
                  placeholder="e.g. Verified by Store Manager"
                  value={manLogNotes}
                  onChange={(e) => setManLogNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('saveLogEntry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Modal Dialog */}
      {stockInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">{t('recordStockIn')}</h3>
              </div>
              <button
                onClick={() => setStockInModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('selectProduct')}</label>
                <select
                  required
                  value={inProductId}
                  onChange={(e) => {
                    setInProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) {
                      setInCost(prod.costPrice.toString());
                      setInSupplier(prod.supplier || '');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="">{t('chooseItem')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('qtyReceived')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={inQty}
                    onChange={(e) => setInQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('unitCost')}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit cost"
                    value={inCost}
                    onChange={(e) => setInCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('batchLot')}</label>
                  <input
                    type="text"
                    placeholder="e.g. TS-2026-B3"
                    value={inBatch}
                    onChange={(e) => setInBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('supplierDistributor')}</label>
                  <input
                    type="text"
                    placeholder="e.g. ITC Wholesale"
                    value={inSupplier}
                    onChange={(e) => setInSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('notesInvoice')}</label>
                <input
                  type="text"
                  placeholder="e.g. PO-8921 received in good condition"
                  value={inNotes}
                  onChange={(e) => setInNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockInModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('addToInventory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Out (Loss/Damage) Modal Dialog */}
      {stockOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5" />
                <h3 className="font-bold text-base">{t('recordStockOut')}</h3>
              </div>
              <button
                onClick={() => setStockOutModalOpen(false)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('selectProduct')}</label>
                <select
                  required
                  value={outProductId}
                  onChange={(e) => setOutProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="">{t('chooseToDeduct')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Available: {p.stock} units)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('qtyDeducted')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2"
                    value={outQty}
                    onChange={(e) => setOutQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('writeoffReason')}</label>
                  <select
                    value={outReason}
                    onChange={(e) => setOutReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="Damage / Transit Leakage">{t('damage')}</option>
                    <option value="Product Expiry">{t('expiry')}</option>
                    <option value="Theft / Inventory Shrinkage">{t('shrinkage')}</option>
                    <option value="Internal Store Consumption">{t('storeConsumption')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('managerNote')}</label>
                <input
                  type="text"
                  placeholder="e.g. Outer pouch torn, unsellable condition"
                  value={outNotes}
                  onChange={(e) => setOutNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockOutModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('confirmWriteoff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
