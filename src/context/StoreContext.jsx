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
    const item = localStorage.getItem(`grocerease_${key}`);
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
    const savedUser = loadFromStorage('currentUser', null);
    if (savedUser) return savedUser;
    return INITIAL_STAFF[0]; // Default to Admin (Anand Sharma)
  });

  // Core Data States
  const [products, setProducts] = useState(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [attendance, setAttendance] = useState(() => loadFromStorage('attendance', INITIAL_ATTENDANCE));
  const [leaves, setLeaves] = useState(() => loadFromStorage('leaves', INITIAL_LEAVES));
  const [customers, setCustomers] = useState(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [sales, setSales] = useState(() => loadFromStorage('sales', INITIAL_SALES));
  const [priceAuditLogs, setPriceAuditLogs] = useState(() => loadFromStorage('price_audit_logs', INITIAL_PRICE_AUDIT_LOGS));
  const [stockLogs, setStockLogs] = useState(() => loadFromStorage('stock_logs', INITIAL_STOCK_LOGS));

  // Active POS Cart State
  const [cart, setCart] = useState(() => loadFromStorage('active_cart', []));
  const [billDiscount, setBillDiscount] = useState(0); // in Rupees

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Persist states to LocalStorage
  useEffect(() => {
    localStorage.setItem('grocerease_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('grocerease_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('grocerease_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('grocerease_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('grocerease_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('grocerease_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('grocerease_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('grocerease_price_audit_logs', JSON.stringify(priceAuditLogs));
  }, [priceAuditLogs]);

  useEffect(() => {
    localStorage.setItem('grocerease_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('grocerease_active_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auth & RBAC Actions
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

  // Cart Management
  const addToCart = (product, qty = 1) => {
    // Check stock availability
    const availableStock = product.isCustom ? 9999 : (product.stock || 0);
    if (!product.isCustom && availableStock <= 0) {
      showToast(`${product.name} is completely out of stock!`, 'error');
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
        gstRate: product.gstRate !== undefined ? product.gstRate : 5,
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

  // Cart Calculation Helpers
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty - (item.lineDiscount || 0)), 0);
  
  // Tax calculation (inclusive or standard GST breakdown)
  const cartTaxBreakdown = cart.reduce((breakdown, item) => {
    const itemTotal = item.price * item.qty - (item.lineDiscount || 0);
    const rate = item.gstRate || 0;
    // Calculate tax component: tax = total * rate / (100 + rate) for inclusive retail
    const taxAmt = rate > 0 ? (itemTotal * rate) / (100 + rate) : 0;
    breakdown[rate] = (breakdown[rate] || 0) + taxAmt;
    return breakdown;
  }, {});

  const cartTaxTotal = Object.values(cartTaxBreakdown).reduce((a, b) => a + b, 0);
  const cartGrandTotal = Math.max(0, Math.round(cartSubtotal - billDiscount));

  // Complete Sale & POS Checkout
  const completeSale = ({ paymentMode, customerId, customerName, paidAmount }) => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add products before checkout.', 'error');
      return null;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTotal = cartGrandTotal;
    const tendered = Number(paidAmount) || finalTotal;
    const change = Math.max(0, tendered - finalTotal);

    // 1. Deduct Stock from Products
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const soldItem = cart.find(c => c.id === prod.id);
        if (soldItem) {
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

    // 3. Create Sale Record
    const newSale = {
      id: invoiceNumber,
      timestamp: new Date().toISOString(),
      cashierName: currentUser.name,
      cashierRole: currentUser.role,
      customerName: assignedCustomerName,
      customerId: customerId || null,
      paymentMode: paymentMode, // Cash, UPI, Card, Udhar
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        costPrice: i.costPrice,
        qty: i.qty,
        lineDiscount: i.lineDiscount,
        gstRate: i.gstRate,
        total: i.price * i.qty - (i.lineDiscount || 0)
      })),
      subtotal: cartSubtotal,
      discount: billDiscount,
      taxTotal: Number(cartTaxTotal.toFixed(2)),
      taxBreakdown: cartTaxBreakdown,
      grandTotal: finalTotal,
      paidAmount: tendered,
      changeAmount: change
    };

    setSales(prev => [newSale, ...prev]);
    clearCart();
    setActiveReceipt(newSale);
    showToast(`Sale recorded successfully! Invoice ${invoiceNumber}`, 'success');
    return newSale;
  };

  // Price Checklist & Admin Price Update
  const updateProductPrice = (productId, newSellingPrice, reason = 'Market price adjustment') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const oldPrice = product.sellingPrice;
    const newPrice = Number(newSellingPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Please enter a valid selling price greater than 0', 'error');
      return;
    }

    // Recalculate margins
    const oldMargin = calculateMarginPercent(oldPrice, product.costPrice);
    const newMargin = calculateMarginPercent(newPrice, product.costPrice);

    // Update product
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, sellingPrice: newPrice } : p))
    );

    // Create Audit Log
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
      changedBy: `${currentUser.name} (${currentUser.role})`,
      reason: reason || 'Manual Admin Revision'
    };

    setPriceAuditLogs(prev => [newAuditLog, ...prev]);
    showToast(`Updated price for ${product.name} to ₹${newPrice}`, 'success');
  };

  // Inventory Tracker: Stock In
  const stockIn = ({ productId, qty, batch, supplier, unitCost, notes }) => {
    const quantity = Number(qty);
    if (isNaN(quantity) || quantity <= 0) {
      showToast('Invalid quantity entered', 'error');
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock + quantity,
              batch: batch || p.batch,
              supplier: supplier || p.supplier,
              costPrice: unitCost ? Number(unitCost) : p.costPrice
            }
          : p
      )
    );

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
      unitCost: unitCost || prod.costPrice,
      notes: notes || 'Stock replenishment',
      recordedBy: currentUser.name
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Successfully added ${quantity} units of ${prod.name}`, 'success');
  };

  // Inventory Tracker: Stock Out (Loss, Expiry, Damage)
  const stockOut = ({ productId, qty, reason, notes }) => {
    const quantity = Number(qty);
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (quantity > prod.stock) {
      showToast(`Cannot write off ${quantity} units. Current stock is only ${prod.stock}.`, 'error');
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
      reason: reason || 'Damage / Expiry',
      notes: notes || 'Audited write-off',
      recordedBy: currentUser.name
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Audited removal of ${quantity} units of ${prod.name}`, 'warning');
  };

  // Manual search entry into stock movement log
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
      notes: notes || 'Direct manual search entry to log',
      recordedBy: currentUser.name
    };

    setStockLogs(prev => [newLog, ...prev]);
    showToast(`Logged manual entry: ${productName} (${type === 'STOCK_IN' ? '+' : '-'}${quantity})`, 'success');
  };

  // Staff Attendance: Clock In & Clock Out
  const clockIn = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendance(prev => {
      const existing = prev.find(a => a.staffId === staffId && a.date === todayStr);
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
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendance(prev => {
      const record = prev.find(a => a.staffId === staffId && a.date === todayStr);
      if (!record) {
        showToast(`No check-in record found for ${staffMember.name} today`, 'error');
        return prev;
      }
      if (record.checkOutTime) {
        showToast(`${staffMember.name} already clocked out today at ${record.checkOutTime}`, 'info');
        return prev;
      }

      // Calculate approximate hours worked (default 8 if quick demo)
      const hours = record.hoursWorked > 0 ? record.hoursWorked : 7.5;

      showToast(`Clocked out: ${staffMember.name} at ${nowTimeStr}`, 'info');
      return prev.map(a =>
        a.id === record.id
          ? { ...a, checkOutTime: nowTimeStr, hoursWorked: hours }
          : a
      );
    });
  };

  // Leave Management
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
    showToast(`Leave application submitted for ${member.name}`, 'success');
  };

  const updateLeaveStatus = (leaveId, status) => {
    setLeaves(prev =>
      prev.map(l => (l.id === leaveId ? { ...l, status } : l))
    );
    showToast(`Leave request ${status.toLowerCase()}`, 'info');
  };

  // Customer Udhar Payment Settlement
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

    showToast(`Recorded repayment of ₹${payAmt} for customer!`, 'success');
  };

  // Add new customer
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

  // Reset database back to default seed data
  const resetDatabase = () => {
    if (window.confirm('Reset all GrocerEase data back to factory demo defaults?')) {
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
      showToast('Database reset to default demo dataset!', 'info');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        // Auth & Staff
        staff,
        currentUser,
        switchUser,
        loginWithPin,
        
        // Products & Pricing
        products,
        updateProductPrice,
        priceAuditLogs,

        // Inventory & Stocks
        stockLogs,
        stockIn,
        stockOut,
        addManualStockLog,

        // Cart & POS
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
        cartTaxBreakdown,
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
