import React from 'react';
import { useStore } from '../context/StoreContext';
import { Printer, X, Check, Download, ShoppingBag, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const ThermalReceiptModal = () => {
  const { activeReceipt, setActiveReceipt } = useStore();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalSavings = (activeReceipt.discount || 0) + 
    (activeReceipt.items?.reduce((sum, item) => sum + (item.lineDiscount || 0), 0) || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Dialog Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">80mm Thermal Receipt Generator</h3>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview Body (Styled as realistic 80mm thermal paper) */}
        <div className="p-6 bg-slate-100 flex justify-center max-h-[70vh] overflow-y-auto">
          
          <div
            id="thermal-receipt-printable"
            className="w-[76mm] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-md border border-slate-300 rounded-sm"
            style={{ fontFamily: '"JetBrains Mono", Courier, monospace' }}
          >
            {/* Header */}
            <div className="text-center space-y-1 mb-3">
              <div className="text-sm font-bold tracking-wider uppercase">GROCEREASE MARKET</div>
              <div className="text-[10px] text-gray-700">POPULAR TRADERS PVT LTD</div>
              <div className="text-[9px] text-gray-600">Shop No. 4-6, Central Market Road, Sector 12</div>
              <div className="text-[9px] text-gray-600">GSTIN: 27AABCP1234F1Z8 | FSSAI: 11524021000492</div>
              <div className="text-[9px] text-gray-600">Phone: +91 98765 43210</div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Bill Meta */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{activeReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{formatDateTime(activeReceipt.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{activeReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-semibold truncate max-w-[140px]">{activeReceipt.customerName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Item Table Header */}
            <div className="grid grid-cols-12 font-bold text-[9px] mb-1 uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amt</span>
            </div>
            <div className="border-b border-gray-300 mb-1.5"></div>

            {/* Items List */}
            <div className="space-y-1.5 mb-2">
              {activeReceipt.items?.map((item, idx) => (
                <div key={idx} className="text-[10px]">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="grid grid-cols-12 text-gray-700 text-[9px]">
                    <span className="col-span-6 text-gray-500">
                      GST {item.gstRate}% {item.lineDiscount > 0 ? `(-₹${item.lineDiscount})` : ''}
                    </span>
                    <span className="col-span-2 text-center">{item.qty}</span>
                    <span className="col-span-2 text-right">₹{item.price}</span>
                    <span className="col-span-2 text-right font-semibold text-black">
                      ₹{item.total || (item.price * item.qty - (item.lineDiscount || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Bill Summary */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal ({activeReceipt.items?.reduce((s, i) => s + i.qty, 0)} items):</span>
                <span>₹{activeReceipt.subtotal?.toFixed(2)}</span>
              </div>

              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Bill Discount:</span>
                  <span>-₹{activeReceipt.discount?.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 text-[9px]">
                <span>Taxes (GST Inclusive):</span>
                <span>₹{activeReceipt.taxTotal?.toFixed(2)}</span>
              </div>

              <div className="border-t border-b border-double border-gray-800 py-1 flex justify-between text-[13px] font-bold">
                <span>GRAND TOTAL:</span>
                <span>₹{activeReceipt.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            {/* Savings Callout */}
            {totalSavings > 0 && (
              <div className="my-2 py-1 px-2 border border-gray-500 text-center font-bold text-[9px] uppercase tracking-wide">
                *** YOU SAVED ₹{totalSavings.toFixed(2)} ON THIS BILL ***
              </div>
            )}

            {/* Payment Details */}
            <div className="my-2 bg-gray-50 p-1.5 rounded border border-gray-200 text-[9px] space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span>PAYMENT MODE:</span>
                <span className="uppercase text-emerald-800 font-bold">{activeReceipt.paymentMode}</span>
              </div>
              {activeReceipt.paymentMode === 'Cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>₹{activeReceipt.paidAmount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Returned:</span>
                    <span>₹{activeReceipt.changeAmount?.toFixed(2)}</span>
                  </div>
                </>
              )}
              {activeReceipt.paymentMode === 'Udhar' && (
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Khata Credit Added:</span>
                  <span>₹{activeReceipt.grandTotal?.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Barcode Simulation */}
            <div className="text-center my-3">
              <div className="inline-block tracking-widest text-[16px] font-mono leading-none select-none">
                ||||| | |||| ||| |||||| | ||||| ||||
              </div>
              <div className="text-[8px] text-gray-600 tracking-wider mt-0.5">{activeReceipt.id}</div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[8px] text-gray-600 space-y-0.5 pt-1">
              <div>* Terms & Conditions apply *</div>
              <div>Exchange within 48 hours with original bill</div>
              <div>Milk & Perishables once sold cannot be returned</div>
              <div className="font-bold text-gray-800 pt-1">THANK YOU! VISIT AGAIN!</div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for 80mm ESC/POS Thermal Printers</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReceipt(null)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Done
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt (80mm)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
