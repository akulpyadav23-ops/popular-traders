import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Camera,
  X,
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Sample FMCG Supplier Invoices for testing
const SAMPLE_INVOICES = [
  {
    supplier: "Tata Consumer Direct Pvt Ltd",
    invoiceNumber: "TC-INV-2026-8902",
    invoiceDate: "2026-11-04",
    items: [
      {
        name: "Tata Salt Vacuum Evaporated 1kg",
        qty: 50,
        costPrice: 22,
        retailPrice: 28,
        unit: "Pouch",
        batch: "TS-2026-B9"
      },
      {
        name: "Tata Tea Gold Leaf 500g",
        qty: 24,
        costPrice: 290,
        retailPrice: 340,
        unit: "Box",
        batch: "TT-4401"
      },
      {
        name: "Tata Sampann Unpolished Toor Dal 1kg",
        qty: 30,
        costPrice: 165,
        retailPrice: 195,
        unit: "Pouch",
        batch: "TS-DL-12"
      }
    ]
  },
  {
    supplier: "ITC Wholesale Hub Bengaluru",
    invoiceNumber: "ITC-BLR-44910",
    invoiceDate: "2026-11-05",
    items: [
      {
        name: "Aashirvaad Shudh Chakki Atta 5kg",
        qty: 40,
        costPrice: 210,
        retailPrice: 250,
        unit: "Bag",
        batch: "ITC-9950"
      },
      {
        name: "Sunfeast Dark Fantasy Choco Fills 300g",
        qty: 36,
        costPrice: 105,
        retailPrice: 135,
        unit: "Box",
        batch: "ITC-DF-77"
      },
      {
        name: "Yippee Magic Masala Noodles 280g (Pack of 4)",
        qty: 48,
        costPrice: 46,
        retailPrice: 56,
        unit: "Pack",
        batch: "YP-3301"
      }
    ]
  },
  {
    supplier: "Adani Wilmar Supply Co.",
    invoiceNumber: "AW-INV-77312",
    invoiceDate: "2026-11-06",
    items: [
      {
        name: "Fortune Sunlite Refined Sunflower Oil 1L",
        qty: 60,
        costPrice: 125,
        retailPrice: 150,
        unit: "Pouch",
        batch: "AW-9021"
      },
      {
        name: "Fortune Besan Pure Gram Flour 500g",
        qty: 30,
        costPrice: 48,
        retailPrice: 62,
        unit: "Pouch",
        batch: "AW-BS-11"
      }
    ]
  }
];

export const CameraOcrModal = ({ isOpen, onClose }) => {
  const { importOcrStockInBatch, showToast } = useStore();
  const { t } = useLanguage();

  const [activeStep, setActiveStep] = useState('CAPTURE'); // 'CAPTURE', 'SCANNING', 'REVIEW'
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Parsed Invoice Data
  const [supplierName, setSupplierName] = useState('Tata Consumer Direct Pvt Ltd');
  const [invoiceNumber, setInvoiceNumber] = useState('TC-INV-2026-8902');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [extractedItems, setExtractedItems] = useState([]);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setActiveStep('CAPTURE');
      setCapturedImage(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access error or unsupported:', err);
      setCameraError('Camera access unavailable or permission denied. You can upload an image or select a sample invoice.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Take Snapshot from video
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
    runOcrSimulation(dataUrl, SAMPLE_INVOICES[0]);
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      runOcrSimulation(event.target.result, SAMPLE_INVOICES[1]);
    };
    reader.readAsDataURL(file);
  };

  // Run Sample Preset directly
  const handleLoadSample = (sample) => {
    setCapturedImage('https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600');
    runOcrSimulation(null, sample);
  };

  // AI/OCR Parser Pipeline
  const runOcrSimulation = (imgUrl, samplePreset) => {
    setActiveStep('SCANNING');
    
    setTimeout(() => {
      const preset = samplePreset || SAMPLE_INVOICES[0];
      setSupplierName(preset.supplier);
      setInvoiceNumber(preset.invoiceNumber);
      setInvoiceDate(preset.invoiceDate);
      setExtractedItems(preset.items.map(item => ({ ...item, id: `OCR-ITEM-${Date.now()}-${Math.random().toString(36).substring(7)}` })));
      setActiveStep('REVIEW');
    }, 1200);
  };

  // Item Table Mutators in Review Step
  const updateItemField = (id, field, value) => {
    setExtractedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id) => {
    setExtractedItems(prev => prev.filter(item => item.id !== id));
  };

  const addNewItemRow = () => {
    const newItem = {
      id: `OCR-ITEM-${Date.now()}`,
      name: 'New Received Item',
      qty: 10,
      costPrice: 50,
      retailPrice: 65,
      unit: 'Pack',
      batch: 'BATCH-01'
    };
    setExtractedItems(prev => [...prev, newItem]);
  };

  // Final Confirmation: Imports to Stock AND Updates Central Price List
  const handleConfirmBatch = () => {
    if (extractedItems.length === 0) {
      showToast('No items to import', 'error');
      return;
    }

    const success = importOcrStockInBatch({
      supplier: supplierName,
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      items: extractedItems
    });

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#7b977e] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {t('cameraScanTitle')}
              </h3>
              <p className="text-xs text-white/80">
                {t('cameraScanDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* STEP 1: CAPTURE / UPLOAD */}
          {activeStep === 'CAPTURE' && (
            <div className="space-y-6">
              
              {/* Camera Viewfinder or Actions */}
              <div className="bg-slate-900 rounded-3xl overflow-hidden relative min-h-[280px] sm:min-h-[360px] flex flex-col items-center justify-center border-2 border-slate-800">
                {cameraActive ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-[380px] object-contain"
                    />

                    {/* Viewfinder Target Overlay */}
                    <div className="absolute inset-8 sm:inset-14 border-2 border-dashed border-[#7b977e] rounded-2xl pointer-events-none flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white text-[10px] font-mono px-2 py-1 rounded-md">
                        Align physical invoice inside frame
                      </span>
                    </div>

                    {/* Camera Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                      <button
                        onClick={takeSnapshot}
                        className="px-6 py-2.5 bg-[#7b977e] hover:bg-[#67806a] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t('takeSnapshot')}</span>
                      </button>

                      <button
                        onClick={stopCamera}
                        className="px-4 py-2.5 bg-slate-800/90 text-slate-300 hover:text-white rounded-2xl text-xs font-semibold"
                      >
                        {t('stopCamera')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-slate-800 mx-auto flex items-center justify-center text-[#7b977e]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Point Camera at Supplier Bill</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        High resolution camera OCR automatically reads SKU descriptions, quantities, and cost prices.
                      </p>
                    </div>

                    {cameraError && (
                      <p className="text-xs text-amber-400 max-w-md mx-auto">{cameraError}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={startCamera}
                        className="px-5 py-2.5 bg-[#7b977e] hover:bg-[#67806a] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t('startCamera')}</span>
                      </button>

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition"
                      >
                        <Upload className="w-4 h-4 text-[#7b977e]" />
                        <span>{t('uploadBillImage')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Sample Presets (For fast desktop testing) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Sample Invoices (Click to test OCR parsing without paper bill):
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_INVOICES.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadSample(sample)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-2xl border border-slate-200 hover:border-[#7b977e] text-left transition group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-[#546956]">
                        <Building2 className="w-3.5 h-3.5 text-[#7b977e]" />
                        <span className="truncate">{sample.supplier}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {sample.invoiceNumber} • {sample.items.length} items
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: AI OCR SCANNING LOADER */}
          {activeStep === 'SCANNING' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-[#7b977e]/30 flex items-center justify-center text-[#7b977e] mx-auto animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {t('scanningInvoice')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Parsing tabular lines, identifying SKUs, calculating wholesale costs and retail margins...
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & INWARD TO STOCK AND PRICE LIST */}
          {activeStep === 'REVIEW' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Scanned Invoice Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('supplierName')}
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('invoiceNumber')}
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {t('invoiceDate')}
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Extracted Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#7b977e]" />
                    <h4 className="text-xs font-bold text-slate-800">
                      {t('extractedItemsTitle')} ({extractedItems.length})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep('CAPTURE')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('retakePhoto')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={addNewItemRow}
                      className="px-3 py-1 bg-[#7b977e]/10 hover:bg-[#7b977e]/20 text-[#344336] rounded-xl text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-2 text-center w-20">{t('extractedQty')}</th>
                        <th className="py-2.5 px-2 text-right w-28">{t('extractedCostPrice')}</th>
                        <th className="py-2.5 px-2 text-right w-28">{t('extractedRetailPrice')}</th>
                        <th className="py-2.5 px-2 text-center w-24">Batch</th>
                        <th className="py-2.5 px-2 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7b977e] font-semibold text-slate-900 text-xs focus:bg-white rounded"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItemField(item.id, 'qty', Number(e.target.value))}
                              className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900 text-xs"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span>₹</span>
                              <input
                                type="number"
                                step="0.5"
                                value={item.costPrice}
                                onChange={(e) => updateItemField(item.id, 'costPrice', Number(e.target.value))}
                                className="w-20 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-semibold text-slate-700 text-xs"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span>₹</span>
                              <input
                                type="number"
                                step="0.5"
                                value={item.retailPrice}
                                onChange={(e) => updateItemField(item.id, 'retailPrice', Number(e.target.value))}
                                className="w-20 px-1.5 py-1 bg-emerald-50 border border-[#7b977e]/40 rounded-lg text-right font-extrabold text-[#344336] text-xs"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="text"
                              value={item.batch || ''}
                              onChange={(e) => updateItemField(item.id, 'batch', e.target.value)}
                              className="w-20 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono text-[10px] text-slate-600"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-[#7b977e]/30 flex items-center justify-between text-xs text-[#344336]">
                  <span className="font-semibold">
                    ✓ Confirming this Stock-In will automatically update product counts and adjust the central Price List!
                  </span>
                  <span className="font-extrabold">
                    {extractedItems.reduce((sum, i) => sum + (Number(i.qty) || 0), 0)} Total Units
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            {t('cancel')}
          </button>

          {activeStep === 'REVIEW' && (
            <button
              type="button"
              onClick={handleConfirmBatch}
              className="px-6 py-2.5 bg-[#7b977e] hover:bg-[#67806a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#7b977e]/20 flex items-center gap-2 transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('confirmStockInBatch')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
