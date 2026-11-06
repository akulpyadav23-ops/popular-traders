import React from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const ThermalReceiptModal = () => {
  const { activeReceipt, setActiveReceipt } = useStore();
  const { t } = useLanguage();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalSavings = (activeReceipt.discount || 0) + 
    (activeReceipt.items?.reduce((sum, item) => sum + (item.lineDiscount || 0), 0) || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Dialog Container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#7b977e]" />
            <h3 className="font-bold text-base">{t('receiptTitle')}</h3>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview Body (Styled as realistic 80mm thermal paper, Strictly Non-GST) */}
        <div className="p-6 bg-slate-100 flex justify-center max-h-[70vh] overflow-y-auto">
          
          <div
            id="thermal-receipt-printable"
            className="w-[76mm] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-md border border-slate-300 rounded-sm"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            {/* Store Header - Strictly NO GSTIN */}
            <div className="text-center space-y-1 mb-2">
              <div className="text-base font-black tracking-wider uppercase">POPULAR TRADERS</div>
              <div className="text-[10px] font-bold text-gray-800">GROCERY & WHOLESALE MERCHANTS</div>
              <div className="text-[9px] text-gray-600">Shop #104, Main Market Road, Bangalore</div>
              <div className="text-[9px] text-gray-600">Phone: +91 98765 43210</div>
              <div className="text-[8px] font-bold tracking-wider text-gray-500 uppercase mt-1">
                *** RETAIL CASH MEMO (NON-GST) ***
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Bill Meta */}
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{activeReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formatDateTime(activeReceipt.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{activeReceipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-bold">{activeReceipt.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span>PAY MODE:</span>
                <span className="font-bold uppercase">{activeReceipt.paymentMode}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Itemized Table - Strictly NO GST */}
            <table className="w-full text-left text-[10px] mb-2">
              <thead>
                <tr className="border-b border-dashed border-gray-400">
                  <th className="py-1">ITEM</th>
                  <th className="py-1 text-center">QTY</th>
                  <th className="py-1 text-right">RATE</th>
                  <th className="py-1 text-right">AMT</th>
                </tr>
              </thead>
              <tbody>
                {activeReceipt.items?.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-1 pr-1">
                      <div className="font-medium truncate max-w-[120px]">{item.name}</div>
                      {item.lineDiscount > 0 && (
                        <div className="text-[8px] text-gray-500">Disc: -₹{item.lineDiscount}</div>
                      )}
                    </td>
                    <td className="py-1 text-center">{item.qty}</td>
                    <td className="py-1 text-right">₹{item.price}</td>
                    <td className="py-1 text-right font-semibold">
                      ₹{(item.price * item.qty - (item.lineDiscount || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Totals & Net Payable - Strictly NO GST SPLITS */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="font-semibold">₹{activeReceipt.subtotal?.toFixed(2)}</span>
              </div>

              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>BILL DISCOUNT:</span>
                  <span>-₹{activeReceipt.discount?.toFixed(2)}</span>
                </div>
              )}

              <div className="border-b border-black my-1"></div>

              <div className="flex justify-between text-xs font-black">
                <span>TOTAL PAYABLE:</span>
                <span>₹{activeReceipt.grandTotal?.toFixed(2)}</span>
              </div>

              <div className="border-b border-black my-1"></div>

              {activeReceipt.paymentMode === 'Cash' && activeReceipt.paidAmount && (
                <div className="space-y-0.5 text-[9px] text-gray-700 pt-0.5">
                  <div className="flex justify-between">
                    <span>CASH TENDERED:</span>
                    <span>₹{Number(activeReceipt.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>CHANGE RETURN:</span>
                    <span>₹{(activeReceipt.changeAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {totalSavings > 0 && (
                <div className="text-center font-bold text-[9px] text-gray-800 pt-1">
                  *** TOTAL SAVINGS: ₹{totalSavings.toFixed(2)} ***
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 my-2"></div>

            {/* Footer Notice */}
            <div className="text-center text-[8px] text-gray-600 space-y-0.5 pt-1">
              <div>Goods once sold cannot be returned</div>
              <div>Exchange within 48 hours with this original bill</div>
              <div className="font-bold text-gray-900 pt-1">THANK YOU! VISIT POPULAR TRADERS AGAIN!</div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7b977e]" />
            <span>{t('printReady')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReceipt(null)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              {t('done')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-[#7b977e] hover:bg-[#67806a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#7b977e]/20 transition active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printReceipt80')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
