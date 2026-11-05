// Currency and Date Formatters for GrocerEase

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num || 0);
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
};

export const calculateMarginPercent = (sellingPrice, costPrice) => {
  const sp = Number(sellingPrice) || 0;
  const cp = Number(costPrice) || 0;
  if (sp <= 0) return 0;
  return (((sp - cp) / sp) * 100).toFixed(2);
};

export const getStockStatus = (stock, minThreshold = 15) => {
  if (stock < 5) {
    return {
      status: 'Critical',
      color: 'bg-red-100 text-red-700 border-red-300',
      badgeColor: 'bg-red-500',
      textColor: 'text-red-600',
      label: 'Low Stock (<5)'
    };
  }
  if (stock < minThreshold) {
    return {
      status: 'Warning',
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      badgeColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      label: 'Reorder (<15)'
    };
  }
  return {
    status: 'Healthy',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    badgeColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    label: 'In Stock'
  };
};
