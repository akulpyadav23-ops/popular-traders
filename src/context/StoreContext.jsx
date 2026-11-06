import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_PRICE_AUDIT_LOGS,
  INITIAL_STOCK_LOGS
} from '../data/initialData';
import { calculateMarginPercent } from '../utils/formatters';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Safe local storage reader helper
const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(`populartraders_${key}`) || localStorage.getItem(`grocerease_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
};

export const StoreProvider = ({ children }) => {
  // Store / Auth State
  const [staff, setStaff] = useState(() => loadFromStorage('staff', INITIAL_STAFF));
  const [currentUser, setCurrentUser] = useState(() => {
    return loadFromStorage('currentUser', INITIAL_STAFF[0]); // Defaults to Anand Sharma (Admin)
  });

  // Core Data States
  const [products, setProducts] = useState(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [attendance, setAttendance] = useState(() => loadFromStorage('attendance', INITIAL_ATTENDANCE));
  const [leaves, setLeaves] = useState(() => loadFromStorage('leaves', INITIAL_LEAVES));
  const [customers, setCustomers] = useState(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [sales, setSales] = useState(() => loadFromStorage('sales', INITIAL_SALES));
  const [priceAuditLogs, setPriceAuditLogs] = useState(() => loadFromStorage('price_audit_logs', INITIAL_PRICE_AUDIT_LOGS));
  const [stockLogs, setStockLogs] = useState(() => loadFromStorage('stock_logs', INITIAL_STOCK_LOGS));

  // Active POS Cart State (Non-GST)
  const [cart, setCart] = useState(() => loadFromStorage('active_cart', []));
  const [billDiscount, setBillDiscount] = useState(0); // in Rupees

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Persist states to LocalStorage
  useEffect(() => {
    localStorage.setItem('populartraders_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('populartraders_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('populartraders_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('populartraders_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('populartraders_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('populartraders_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('populartraders_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('populartraders_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('populartraders_price_audit_logs', JSON.stringify(priceAuditLogs));
  }, [priceAuditLogs]);

  useEffect(() => {
    localStorage.setItem('populartraders_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('populartraders_active_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Helper to clean phone numbers for comparison
  const normalizePhone = (p) => {
    if (!p) return '';
    return p.toString().replace(/\D/g, '').slice(-10);
  };

  // Phone + Password Authentication (Admin & Worker login)
  const loginWithPhonePassword = (phoneNumber, password, expectedRole = null) => {
    const cleanInputPhone = normalizePhone(phoneNumber);
    if (!cleanInputPhone || !password) {
      return { success: false, message: 'Please enter phone number and password' };
    }

    const matched = staff.find(s => {
      const staffPhone = normalizePhone(s.phone);
      const phoneMatches = staffPhone === cleanInputPhone;
      const passMatches = (s.password && s.password === password) || (s.pin && s.pin === password);
      return phoneMatches && passMatches;
    });

    if (!matched) {
      return { success: false, message: 'Invalid phone number or password. Check demo credentials.' };
    }

    if (expectedRole && matched.role.toLowerCase() !== expectedRole.toLowerCase()) {
      return {
        success: false,
        message: `This account is registered as ${matched.role}. Please log in under the ${matched.role} tab.`
      };
    }

    setCurrentUser(matched);
    showToast(`Welcome back, ${matched.name}! Signed in as ${matched.role}`, 'success');
    return { success: true, user: matched };
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    showToast('Signed out of POPULAR TRADERS portal', 'info');
  };

  const switchUser = (staffId) => {
    const selected = staff.find(s => s.id === staffId);
    if (selected) {
      setCurrentUser(selected);
      showToast(`Switched account to ${selected.name} (${selected.role})`, 'info');
    }
  };

  const loginWithPin = (pin) => {
    const matched = staff.find(s => s.pin === pin);
    if (matched) {
      setCurrentUser(matched);
      showToast(`Welcome back, ${matched.name}!`, 'success');
      return { success: true, user: matched };
    }
    return { success: false, message: 'Invalid 4-digit PIN' };
  };

  // Cart Management (Strictly Non-GST)
  const addToCart = (product, qty = 1) => {
    const availableStock = product.isCustom ? 9999 : (product.stock || 0);
    if (!product.isCustom && availableStock <= 0) {
      showToast(`${product.name} is out of stock!`, 'error');
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (!product.isCustom && existing.qty + qty > availableStock) {
          showToast(`Cannot add more. Only ${availableStock} units in stock.`, 'warning');
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.sellingPrice,
        costPrice: product.costPrice || (product.sellingPrice * 0.8),
        barcode: product.barcode || `MAN-${Date.now().toString().slice(-4)}`,
        unit: product.unit || 'Unit',
        qty: qty,
        lineDiscount: 0,
        isCustom: !!product.isCustom
      }];
    });

    showToast(`Added ${product.name} to bill`, 'success');
    return true;
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && newQty > product.stock) {
      showToast(`Only ${product.stock} units available in inventory`, 'warning');
      return;
    }

    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, qty: newQty } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const setLineDiscount = (productId, discountVal) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, lineDiscount: Math.max(0, Number(discountVal) || 0) } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setBillDiscount(0);
  };

  // Cart Calculations (Strictly NO GST)
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty - (item.lineDiscount || 0)), 0);
  const cartGrandTotal = Math.max(0, Math.round(cartSubtotal - billDiscount));

  // Complete Sale & POS Checkout (Strictly Non-GST)
  const completeSale = ({ paymentMode, customerId, customerName, paidAmount }) => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add products before checkout.', 'error');
      return null;
    }

    const invoiceNumber = `PT-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTotal = cartGrandTotal;
    const tendered = Number(paidAmount) || finalTotal;
    const change = Math.max(0, tendered - finalTotal);

    // 1. Deduct Stock from Products
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const soldItem = cart.find(c => c.id === prod.id);
        if (soldItem && !soldItem.isCustom) {
          const newStock = Math.max(0, prod.stock - soldItem.qty);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    // 2. Handle Udhar (Customer Credit)
    let assignedCustomerName = customerName || 'Walk-in Customer';
    if (paymentMode === 'Udhar' && customerId) {
      setCustomers(prevCustomers =>
        prevCustomers.map(cust => {
          if (cust.id === customerId) {
            assignedCustomerName = cust.name;
            return {
              ...cust,
              outstandingBalance: cust.outstandingBalance + finalTotal,
              lastTransactionDate: new Date().toISOString()
            };
          }
          return cust;
        })
      );
    }

    // 3. Create Non-GST Sale Record
    const newSale = {
      id: invoiceNumber,
      timestamp: new Date().toISOString(),
      cashierName: currentUser ? currentUser.name : 'Store Cashier',
      cashierRole: currentUser ? currentUser.role : 'Worker',
      customerName: assignedCustomerName,
      customerId: customerId || null,
      paymentMode: paymentMode, // Cash, UPI, Card, Udhar
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        costPrice: i.costPrice,
        qty: i.qty,
        unit: i.unit,
        lineDiscount: i.lineDiscount,
        total: i.price * i.qty - (i.lineDiscount || 0)
      })),
      subtotal: cartSubtotal,
      discount: billDiscount,
      grandTotal: finalTotal,
      paidAmount: tendered,
      changeAmount: change
    };

    setSales(prev => [newSale, ...prev]);
    clearCart();
    setActiveReceipt(newSale);
    showToast(`Bill generated: ${invoiceNumber}`, 'success');
    return newSale;
  };

  // Price Checklist: Update Product Price
  const updateProductPrice = (productId, newSellingPrice, reason = 'Market price revision') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const oldPrice = product.sellingPrice;
    const newPrice = Number(newSellingPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid selling price greater than 0', 'error');
      return;
    }

    const oldMargin = calculateMarginPercent(oldPrice, product.costPrice);
    const newMargin = calculateMarginPercent(newPrice, product.costPrice);

    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, sellingPrice: newPrice } : p))
    );

    const newAuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      productId: product.id,
      productName: product.name,
      oldPrice: oldPrice,
      newPrice: newPrice,
      costPrice: product.costPrice,
      oldMargin: `${oldMargin}%`,
      newMargin: `${newMargin}%`,
      changedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
      reason: reason || 'Price Update'
    };

    setPriceAuditLogs(prev => [newAuditLog, ...prev]);
    showToast(`Updated price for ${product.name} to ₹${newPrice}`, 'success');
  };

  // Inventory: Stock In
  const stockIn = ({ productId, qty, batch, supplier, unitCost, retailPrice, notes }) => {
    const quantity = Number(qty);
    if (isNaN(quantity) || quantity <= 0) {
      showToast('Invalid quantity entered', 'error');
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newCost = unitCost ? Number(unitCost) : prod.costPrice;
    const newSelling = retailPrice ? Number(retailPrice) : prod.sellingPrice;

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock + quantity,
              batch: batch || p.batch,
              supplier: supplier || p.supplier,
              costPrice: newCost,
              sellingPrice: newSelling
            }
          : p
      )
    );

    // If retail price was updated with Stock In, log it to Price Audit Log
    if (retailPrice && Number(retailPrice) !== prod.sellingPrice) {
      const newAuditLog = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        productId: prod.id,
        productName: prod.name,
        oldPrice: prod.sellingPrice,
        newPrice: Number(retailPrice),
        costPrice: newCost,
        oldMargin: `${calculateMarginPercent(prod.sellingPrice, prod.costPrice)}%`,
        newMargin: `${calculateMarginPercent(Number(retailPrice), newCost)}%`,
        changedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Admin',
        reason: `Auto-updated on Stock-In from ${supplier || 'Supplier'}`
      };
      setPriceAuditLogs(prev => [newAuditLog, ...prev]);
    }

    const newLog = {
      id: `STK-IN-${Date.now().toString().slice(-4)}`,
      type: 'STOCK_IN',
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      productId: prod.id,
      productName: prod.name,
      qty: quantity,
      batch: batch || prod.batch,
      supplier: supplier || prod.supplier,
      unitCost: newCost,
      notes: notes || 'Stock replenishment',
      recordedBy: currentUser ? currentUser.name : 'Admin'
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Added ${quantity} units of ${prod.name}`, 'success');
  };

  // Inventory: Stock Out (Damage, Expiry, Loss)
  const stockOut = ({ productId, qty, reason, notes }) => {
    const quantity = Number(qty);
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (quantity > prod.stock) {
      showToast(`Cannot deduct ${quantity} units. Only ${prod.stock} in stock.`, 'error');
      return;
    }

    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      )
    );

    const newLog = {
      id: `STK-OUT-${Date.now().toString().slice(-4)}`,
      type: 'STOCK_OUT',
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      productId: prod.id,
      productName: prod.name,
      qty: quantity,
      batch: prod.batch,
      reason: reason || 'Damage / Transit Leakage',
      notes: notes || 'Stock out adjustment',
      recordedBy: currentUser ? currentUser.name : 'Admin'
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Deducted ${quantity} units of ${prod.name}`, 'warning');
  };

  // Intelligent OCR Batch Import into Stock & Dynamic Price List
  const importOcrStockInBatch = ({ supplier, invoiceNumber, invoiceDate, items }) => {
    if (!items || items.length === 0) {
      showToast('No parsed invoice line items to import', 'error');
      return false;
    }

    const timestampStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newLogs = [];
    const newAuditLogs = [];
    let updatedProductsCount = 0;
    let newProductsCount = 0;

    setProducts(prevProducts => {
      let currentProducts = [...prevProducts];

      items.forEach((item, index) => {
        const qty = Number(item.qty) || 1;
        const costPrice = Number(item.costPrice) || 0;
        const retailPrice = Number(item.retailPrice) || (costPrice > 0 ? Math.round(costPrice * 1.2) : 50);
        const itemName = item.name.trim();

        // Check if product exists in catalog (by name or barcode match)
        const existingIdx = currentProducts.findIndex(p =>
          p.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(p.name.toLowerCase()) ||
          (item.barcode && p.barcode === item.barcode)
        );

        if (existingIdx !== -1) {
          const existing = currentProducts[existingIdx];
          const oldSelling = existing.sellingPrice;

          currentProducts[existingIdx] = {
            ...existing,
            stock: existing.stock + qty,
            costPrice: costPrice > 0 ? costPrice : existing.costPrice,
            sellingPrice: retailPrice > 0 ? retailPrice : existing.sellingPrice,
            batch: item.batch || `OCR-${invoiceNumber || Date.now().toString().slice(-4)}`,
            supplier: supplier || existing.supplier
          };

          updatedProductsCount++;

          // If retail price updated, create price audit log
          if (retailPrice > 0 && retailPrice !== oldSelling) {
            newAuditLogs.push({
              id: `AUD-${Date.now().toString().slice(-4)}-${index}`,
              timestamp: timestampStr,
              productId: existing.id,
              productName: existing.name,
              oldPrice: oldSelling,
              newPrice: retailPrice,
              costPrice: costPrice,
              oldMargin: `${calculateMarginPercent(oldSelling, existing.costPrice)}%`,
              newMargin: `${calculateMarginPercent(retailPrice, costPrice)}%`,
              changedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'OCR Auto-Scan',
              reason: `OCR Bill Inward: Inv #${invoiceNumber || 'N/A'} from ${supplier || 'Supplier'}`
            });
          }

          newLogs.push({
            id: `STK-OCR-${Date.now().toString().slice(-4)}-${index}`,
            type: 'STOCK_IN',
            timestamp: timestampStr,
            productId: existing.id,
            productName: existing.name,
            qty: qty,
            batch: item.batch || `OCR-${invoiceNumber || 'AUTO'}`,
            supplier: supplier || 'OCR Scanned Supplier',
            unitCost: costPrice,
            notes: `Auto-parsed from invoice #${invoiceNumber || '—'}`,
            recordedBy: currentUser ? currentUser.name : 'OCR Scan'
          });
        } else {
          // Add as new catalog product!
          const newProdId = `PROD-${Date.now().toString().slice(-4)}${index}`;
          const newProduct = {
            id: newProdId,
            barcode: item.barcode || `890${Date.now().toString().slice(-10)}`,
            name: itemName,
            category: item.category || 'Grocery & FMCG',
            costPrice: costPrice,
            sellingPrice: retailPrice,
            stock: qty,
            unit: item.unit || 'Pack',
            minThreshold: 10,
            supplier: supplier || 'Scanned Distributor',
            batch: item.batch || `OCR-${invoiceNumber || 'NEW'}`,
            expiryDate: item.expiryDate || '2027-12-31'
          };

          currentProducts.push(newProduct);
          newProductsCount++;

          newLogs.push({
            id: `STK-OCR-${Date.now().toString().slice(-4)}-${index}`,
            type: 'STOCK_IN',
            timestamp: timestampStr,
            productId: newProdId,
            productName: itemName,
            qty: qty,
            batch: newProduct.batch,
            supplier: supplier || 'OCR Scanned Supplier',
            unitCost: costPrice,
            notes: `New SKU auto-created from invoice #${invoiceNumber || '—'}`,
            recordedBy: currentUser ? currentUser.name : 'OCR Scan'
          });
        }
      });

      return currentProducts;
    });

    if (newLogs.length > 0) {
      setStockLogs(prev => [...newLogs, ...prev]);
    }
    if (newAuditLogs.length > 0) {
      setPriceAuditLogs(prev => [...newAuditLogs, ...prev]);
    }

    showToast(
      `OCR Bill Inward Complete! Updated ${updatedProductsCount} items, created ${newProductsCount} new SKUs.`,
      'success'
    );
    return true;
  };

  // Manual stock log
  const addManualStockLog = ({ type, productName, qty, reason, notes, batch, supplier, unitCost }) => {
    const quantity = Number(qty) || 1;
    const newLog = {
      id: `STK-MAN-${Date.now().toString().slice(-4)}`,
      type: type || 'STOCK_IN',
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      productId: 'MANUAL',
      productName: productName,
      qty: quantity,
      batch: batch || 'MAN-LOG',
      supplier: supplier || 'Store Operation',
      unitCost: Number(unitCost) || 0,
      reason: reason || 'Manual Log Entry',
      notes: notes || 'Direct manual entry',
      recordedBy: currentUser ? currentUser.name : 'Store Staff'
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Logged: ${productName} (${type === 'STOCK_IN' ? '+' : '-'}${quantity})`, 'success');
  };

  // Staff Attendance: Clock In & Out
  const clockIn = (staffId) => {
    const targetId = staffId || (currentUser ? currentUser.id : null);
    const staffMember = staff.find(s => s.id === targetId);
    if (!staffMember) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendance(prev => {
      const existing = prev.find(a => a.staffId === staffMember.id && a.date === todayStr);
      if (existing) {
        showToast(`${staffMember.name} already clocked in today at ${existing.checkInTime}`, 'info');
        return prev;
      }

      const newRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        staffId: staffMember.id,
        staffName: staffMember.name,
        role: staffMember.role,
        date: todayStr,
        checkInTime: nowTimeStr,
        checkOutTime: null,
        status: 'Present',
        hoursWorked: 0
      };

      showToast(`Clocked in: ${staffMember.name} at ${nowTimeStr}`, 'success');
      return [newRecord, ...prev];
    });
  };

  const clockOut = (staffId) => {
    const targetId = staffId || (currentUser ? currentUser.id : null);
    const staffMember = staff.find(s => s.id === targetId);
    if (!staffMember) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendance(prev => {
      const record = prev.find(a => a.staffId === staffMember.id && a.date === todayStr);
      if (!record) {
        showToast(`No check-in record found for ${staffMember.name} today`, 'error');
        return prev;
      }
      if (record.checkOutTime) {
        showToast(`${staffMember.name} already clocked out today at ${record.checkOutTime}`, 'info');
        return prev;
      }

      showToast(`Clocked out: ${staffMember.name} at ${nowTimeStr}`, 'info');
      return prev.map(a =>
        a.id === record.id
          ? { ...a, checkOutTime: nowTimeStr, hoursWorked: 8.0 }
          : a
      );
    });
  };

  // Leaves
  const submitLeaveRequest = ({ staffId, startDate, endDate, days, reason }) => {
    const member = staff.find(s => s.id === staffId);
    if (!member) return;

    const newLeave = {
      id: `LEV-${Date.now().toString().slice(-4)}`,
      staffId: member.id,
      staffName: member.name,
      role: member.role,
      startDate,
      endDate,
      days: Number(days) || 1,
      reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    setLeaves(prev => [newLeave, ...prev]);
    showToast(`Leave request submitted for ${member.name}`, 'success');
  };

  const updateLeaveStatus = (leaveId, status) => {
    setLeaves(prev =>
      prev.map(l => (l.id === leaveId ? { ...l, status } : l))
    );
    showToast(`Leave request ${status.toLowerCase()}`, 'info');
  };

  // Customer Udhar Settlement
  const settleCustomerCredit = (customerId, amount, paymentMode = 'Cash', notes = '') => {
    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      showToast('Please enter a valid repayment amount', 'error');
      return;
    }

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newBal = Math.max(0, c.outstandingBalance - payAmt);
          return {
            ...c,
            outstandingBalance: newBal,
            lastPaymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );

    showToast(`Collected ₹${payAmt} repayment!`, 'success');
  };

  const addCustomer = ({ name, phone, creditLimit }) => {
    const newCust = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name,
      phone: phone || '—',
      creditLimit: Number(creditLimit) || 5000,
      outstandingBalance: 0,
      lastPaymentDate: 'New'
    };
    setCustomers(prev => [newCust, ...prev]);
    showToast(`Added customer ${name}`, 'success');
  };

  // Update staff member wage/details
  const updateStaffDetails = (staffId, updatedFields) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId ? { ...s, ...updatedFields } : s))
    );
    if (currentUser && currentUser.id === staffId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
    showToast('Staff record updated successfully', 'success');
  };

  // Factory reset
  const resetDatabase = () => {
    if (window.confirm('Reset all POPULAR TRADERS data back to initial seed defaults?')) {
      localStorage.clear();
      setProducts(INITIAL_PRODUCTS);
      setStaff(INITIAL_STAFF);
      setCurrentUser(INITIAL_STAFF[0]);
      setAttendance(INITIAL_ATTENDANCE);
      setLeaves(INITIAL_LEAVES);
      setCustomers(INITIAL_CUSTOMERS);
      setSales(INITIAL_SALES);
      setPriceAuditLogs(INITIAL_PRICE_AUDIT_LOGS);
      setStockLogs(INITIAL_STOCK_LOGS);
      setCart([]);
      setBillDiscount(0);
      showToast('Database reset to defaults!', 'info');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        // Auth & Staff
        staff,
        currentUser,
        loginWithPhonePassword,
        logout,
        switchUser,
        loginWithPin,
        updateStaffDetails,
        isAdmin: currentUser?.role === 'Admin',
        isWorker: currentUser?.role === 'Worker',

        // Products & Pricing
        products,
        updateProductPrice,
        priceAuditLogs,

        // Inventory & Stocks (with OCR Inward)
        stockLogs,
        stockIn,
        stockOut,
        addManualStockLog,
        importOcrStockInBatch,

        // Cart & POS (Strictly Non-GST)
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        setLineDiscount,
        billDiscount,
        setBillDiscount,
        clearCart,
        cartSubtotal,
        cartGrandTotal,
        completeSale,
        sales,

        // Staff Attendance & Leaves
        attendance,
        leaves,
        clockIn,
        clockOut,
        submitLeaveRequest,
        updateLeaveStatus,

        // Customer Ledger / Udhar
        customers,
        addCustomer,
        settleCustomerCredit,

        // Modals & Receipts
        activeReceipt,
        setActiveReceipt,

        // Toasts & System
        toast,
        showToast,
        resetDatabase
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
