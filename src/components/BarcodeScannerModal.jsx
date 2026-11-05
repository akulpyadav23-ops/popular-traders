import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ScanBarcode, X, Search, Check, Zap, ShoppingCart } from 'lucide-react';

export const BarcodeScannerModal = ({ isOpen, onClose }) => {
  const { products, addToCart, showToast } = useStore();
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  const handleScanCode = (code) => {
    const found = products.find(p => p.barcode === code);
    if (found) {
      const added = addToCart(found, 1);
      if (added) {
        showToast(`Scanned: ${found.name} (₹${found.sellingPrice})`, 'success');
        onClose();
      }
    } else {
      showToast(`No product mapped to barcode: ${code}`, 'error');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanCode(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Barcode Scanner Terminal</h3>
              <p className="text-xs text-slate-400">Simulate optical laser scanning or enter EAN-13</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optical Scanning Laser Simulation */}
        <div className="p-6 bg-slate-950 text-white text-center relative overflow-hidden">
          <div className="relative w-48 h-32 mx-auto border-2 border-dashed border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center bg-slate-900/60 p-3">
            {/* Red Scanning Laser Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
            <ScanBarcode className="w-16 h-16 text-emerald-400 opacity-60 mb-1" />
            <span className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase">Target Barcode</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Hardware USB barcode readers also work automatically in POS screen!
          </p>
        </div>

        {/* Manual Barcode Input */}
        <form onSubmit={handleManualSubmit} className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter barcode (e.g. 8901030382894)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full pl-3 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Scan</span>
          </button>
        </form>

        {/* 1-Click Scan Quick Buttons */}
        <div className="p-5 max-h-60 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            One-Click Scan Hot-List:
          </div>
          <div className="space-y-2">
            {products.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => handleScanCode(item.barcode)}
                className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between cursor-pointer transition group"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                    {item.name}
                  </div>
                  <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                    <span>{item.barcode}</span>
                    <span className="text-slate-400">•</span>
                    <span>Stock: {item.stock}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">₹{item.sellingPrice}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold group-hover:underline flex items-center justify-end gap-1">
                    <ShoppingCart className="w-3 h-3" /> Tap to Scan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
