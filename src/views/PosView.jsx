import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Receipt,
  FilePlus2,
  CornerDownLeft
} from 'lucide-react';
import { formatCurrency, getStockStatus } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export const PosView = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    setLineDiscount,
    billDiscount,
    setBillDiscount,
    clearCart,
    cartSubtotal,
    cartTaxTotal,
    cartGrandTotal,
    completeSale,
    customers,
    showToast
  } = useStore();

  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash'); // Cash, UPI, Card, Udhar
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [upiRefId, setUpiRefId] = useState('');
  const [cardDigits, setCardDigits] = useState('4242');

  // Manual Custom Item Entry Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualTax, setManualTax] = useState('5');

  const searchInputRef = useRef(null);

  // Categories list extracted from products
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products by category and search
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

  // Manual Search Entry Submit:
  // When pressing Enter in the search input, automatically log the top matching item to the bill!
  const handleManualSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (filteredProducts.length > 0) {
      const topMatch = filteredProducts[0];
      const added = addToCart(topMatch, 1);
      if (added) {
        showToast(`Logged to bill: ${topMatch.name}`, 'success');
        setSearchQuery('');
      }
    } else {
      // If no exact match, open manual item entry pre-filled with the query!
      setManualName(searchQuery.trim());
      setManualModalOpen(true);
      setSearchQuery('');
    }
  };

  // Add custom manual item directly to the bill/log
  const handleAddManualCustomItem = (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPrice) return;

    const customProduct = {
      id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: manualName.trim(),
      sellingPrice: Number(manualPrice),
      costPrice: Number(manualPrice) * 0.8,
      stock: 9999,
      unit: 'Custom',
      gstRate: Number(manualTax) || 0,
      isCustom: true
    };

    addToCart(customProduct, Number(manualQty) || 1);
    setManualModalOpen(false);
    setManualName('');
    setManualPrice('');
    setManualQty('1');
    showToast(`Added manual item to bill log: ${customProduct.name}`, 'success');
  };

  // Open checkout and default tendered amount to grand total
  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add products to bill first.', 'error');
      return;
    }
    setTenderedAmount(cartGrandTotal.toString());
    setCheckoutModalOpen(true);
  };

  const handleConfirmSale = () => {
    let customerName = 'Walk-in Customer';
    if (paymentMode === 'Udhar') {
      if (!selectedCustomerId) {
        showToast('Please select a customer for Udhar / Store Credit.', 'error');
        return;
      }
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) {
        if (cust.outstandingBalance + cartGrandTotal > cust.creditLimit) {
          showToast(`Warning: Credit exceeds limit of ₹${cust.creditLimit}`, 'warning');
        }
        customerName = cust.name;
      }
    }

    const sale = completeSale({
      paymentMode,
      customerId: selectedCustomerId || null,
      customerName,
      paidAmount: Number(tenderedAmount) || cartGrandTotal
    });

    if (sale) {
      setCheckoutModalOpen(false);
      setTenderedAmount('');
      setSelectedCustomerId('');
    }
  };

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);
  const changeDue = Math.max(0, (Number(tenderedAmount) || 0) - cartGrandTotal);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      
      {/* Left Area: Product Catalog Grid & Manual Search Entry */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 lg:border-r border-slate-200">
        
        {/* Top Manual Search Entry Bar */}
        <div className="space-y-3 mb-4">
          <form onSubmit={handleManualSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('typeToLog')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-2 top-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                title="Enter to log item"
              >
                <span>{t('logBtn')}</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>
            
            {/* Direct Manual Entry Button */}
            <button
              type="button"
              onClick={() => {
                setManualName(searchQuery);
                setManualModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
              title="Enter custom loose / non-catalog item"
            >
              <FilePlus2 className="w-4 h-4 text-emerald-400" />
              <span>{t('manualItem')}</span>
            </button>
          </form>

          {/* Category Chips Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 p-6 text-center">
              <Search className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">{t('noProductFound')} "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {t('billEmptyDesc')}
              </p>
              <button
                onClick={() => {
                  setManualName(searchQuery);
                  setManualModalOpen(true);
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addAsManual')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product.stock);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product, 1)}
                    className={`bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between group relative select-none ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-slate-200'
                        : 'hover:shadow-md hover:border-emerald-300 border-slate-200 cursor-pointer active:scale-98'
                    }`}
                  >
                    {/* Stock Alert Badge */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono font-medium text-slate-400 truncate">
                        {product.id}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${stockInfo.color}`}>
                        {product.stock} {product.unit}
                      </span>
                    </div>

                    {/* Product Name */}
                    <div className="mb-2">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{product.category}</p>
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                      <div>
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{product.sellingPrice}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          GST {product.gstRate}%
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shadow-xs"
                        title="Click to log to bill"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Area: Active Bill & Sales Log */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 border-slate-200 flex flex-col h-full shadow-lg lg:shadow-none">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">{t('activeBill')}</h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.qty, 0)} {t('items')}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearBill')}</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingCart className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">{t('billEmpty')}</p>
              <p className="text-xs text-slate-400 text-center max-w-[200px] mt-1">
                {t('billEmptyDesc')}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                      {item.isCustom && (
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                          {t('manualBadge')}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ₹{item.price} each • GST {item.gstRate}%
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-1">
                    <button
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="text-slate-500 hover:text-slate-800 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="text-slate-500 hover:text-slate-800 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Item Total */}
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900">
                      ₹{(item.price * item.qty - (item.lineDiscount || 0)).toFixed(2)}
                    </div>
                    {item.lineDiscount > 0 && (
                      <div className="text-[9px] text-emerald-600 font-medium">
                        -₹{item.lineDiscount} off
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Calculations & Bill Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
          
          {/* Bill-Level Discount & Summary */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-slate-800">₹{cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span>{t('billDiscount')}</span>
              </span>
              <input
                type="number"
                min="0"
                value={billDiscount || ''}
                placeholder="0"
                onChange={(e) => setBillDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>{t('taxInclusive')}</span>
              <span>₹{cartTaxTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {t('totalDue')}
              </span>
              <span className="text-2xl font-black text-emerald-950">
                ₹{cartGrandTotal.toFixed(2)}
              </span>
            </div>
            <Receipt className="w-8 h-8 text-emerald-600/40" />
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleOpenCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-emerald-600/25 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{t('proceedPayment')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Manual Custom Item Entry Modal Dialog */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{t('manualEntryTitle')}</h3>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualCustomItem} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('itemDescription')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('itemDescPlaceholder')}
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('pricePerUnit')}</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    min="1"
                    placeholder="Rate"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('quantity')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('gstRate')}</label>
                <select
                  value={manualTax}
                  onChange={(e) => setManualTax(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="0">{t('gst0')}</option>
                  <option value="5">{t('gst5')}</option>
                  <option value="12">{t('gst12')}</option>
                  <option value="18">{t('gst18')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {t('addToBill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Payment Modal Dialog */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{t('selectPayment')}</h3>
                <p className="text-xs text-slate-400">{t('totalPayable')} ₹{cartGrandTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 p-3 bg-slate-100 gap-1.5 border-b border-slate-200">
              {[
                { id: 'Cash', icon: <Banknote className="w-4 h-4" />, label: t('cash') },
                { id: 'UPI', icon: <QrCode className="w-4 h-4" />, label: t('upiQr') },
                { id: 'Card', icon: <CreditCard className="w-4 h-4" />, label: t('card') },
                { id: 'Udhar', icon: <BookOpen className="w-4 h-4" />, label: t('udhar') }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPaymentMode(tab.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                    paymentMode === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Specific Content */}
            <div className="p-6 space-y-4">
              
              {/* Cash Payment Mode */}
              {paymentMode === 'Cash' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('cashTendered')}
                    </label>
                    <input
                      type="number"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[cartGrandTotal, 100, 200, 500, 2000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTenderedAmount(amt.toString())}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 transition"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculation */}
                  <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">{t('changeReturn')}</span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      ₹{changeDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* UPI QR Payment Mode */}
              {paymentMode === 'UPI' && (
                <div className="text-center space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
                    <div className="w-40 h-40 bg-white p-2 border-2 border-slate-800 rounded-xl flex flex-col items-center justify-center relative shadow-xs">
                      <QrCode className="w-28 h-28 text-slate-900" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          UPI
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 mt-2">
                      Scan via PhonePe / GPay / Paytm
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 text-left">
                      {t('upiRef')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 429188201948"
                      value={upiRefId}
                      onChange={(e) => setUpiRefId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Card Payment Mode */}
              {paymentMode === 'Card' && (
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-md">
                    <div className="flex justify-between items-center mb-6">
                      <CreditCard className="w-6 h-6 text-emerald-400" />
                      <span className="text-xs font-bold tracking-widest text-emerald-400">POS TERMINAL</span>
                    </div>
                    <div className="font-mono text-lg tracking-widest mb-2">•••• •••• •••• {cardDigits}</div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>CUSTOMER CARD</span>
                      <span>₹{cartGrandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('lastFourCard')}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cardDigits}
                      onChange={(e) => setCardDigits(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Udhar (Store Credit) Payment Mode */}
              {paymentMode === 'Udhar' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span>{t('udhar')} / Customer Khata Ledger</span>
                    </div>
                    <span>Amount will be debited to customer's running credit account.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('selectCustomer')}
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">{t('chooseCustomer')}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({t('currentUdhar')}: ₹{c.outstandingBalance})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCustomerObj && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('creditLimit')}</span>
                        <span className="font-bold text-slate-800">₹{selectedCustomerObj.creditLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t('currentOutstanding')}</span>
                        <span className="font-bold text-amber-700">₹{selectedCustomerObj.outstandingBalance}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                        <span>{t('newBalanceAfter')}</span>
                        <span className="text-red-600">
                          ₹{selectedCustomerObj.outstandingBalance + cartGrandTotal}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {t('cancel')}
              </button>

              <button
                onClick={handleConfirmSale}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('confirmReceipt')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
