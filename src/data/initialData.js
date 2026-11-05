// Initial seed data for GrocerEase Admin & POS
// Tailored for modern grocery & supermarket retail (FMCG, Staples, Dairy, Snacks, Spices, Household)

export const INITIAL_PRODUCTS = [
  {
    id: "PROD-101",
    barcode: "8901030382894",
    name: "Tata Salt Vacuum Evaporated 1kg",
    category: "Staples & Spices",
    costPrice: 22,
    sellingPrice: 28,
    stock: 45,
    unit: "Pouch",
    gstRate: 0, // 0% on basic salt
    minThreshold: 15,
    supplier: "Tata Consumer Direct",
    batch: "TS-2026-B1",
    expiryDate: "2027-08-15"
  },
  {
    id: "PROD-102",
    barcode: "8901725181222",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    category: "Oils & Ghee",
    costPrice: 125,
    sellingPrice: 148,
    stock: 18,
    unit: "Pouch",
    gstRate: 5,
    minThreshold: 15,
    supplier: "Adani Wilmar Dist.",
    batch: "AW-8821",
    expiryDate: "2026-12-10"
  },
  {
    id: "PROD-103",
    barcode: "8901499008107",
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    category: "Staples & Spices",
    costPrice: 210,
    sellingPrice: 245,
    stock: 12, // Warning yellow (<15)
    unit: "Bag",
    gstRate: 5,
    minThreshold: 15,
    supplier: "ITC Wholesale Hub",
    batch: "ITC-9912",
    expiryDate: "2026-11-20"
  },
  {
    id: "PROD-104",
    barcode: "8901262010046",
    name: "Amul Taaza Homogenised Toned Milk 1L",
    category: "Dairy & Breakfast",
    costPrice: 62,
    sellingPrice: 72,
    stock: 4, // Critical red (<5)
    unit: "Tetra",
    gstRate: 5,
    minThreshold: 15,
    supplier: "Gujarat Co-op Milk Mktg",
    batch: "AML-0442",
    expiryDate: "2026-06-30"
  },
  {
    id: "PROD-105",
    barcode: "8901058852331",
    name: "Maggi 2-Minute Instant Noodles 280g (Pack of 4)",
    category: "Snacks & Packaged",
    costPrice: 48,
    sellingPrice: 58,
    stock: 35,
    unit: "Pack",
    gstRate: 12,
    minThreshold: 15,
    supplier: "Nestle India Dist.",
    batch: "NST-3390",
    expiryDate: "2026-10-14"
  },
  {
    id: "PROD-106",
    barcode: "8901030825025",
    name: "Surf Excel Easy Wash Detergent Powder 1kg",
    category: "Household & Cleaning",
    costPrice: 120,
    sellingPrice: 145,
    stock: 8, // Warning yellow (<15)
    unit: "Pouch",
    gstRate: 18,
    minThreshold: 15,
    supplier: "HUL Supply Chain",
    batch: "HUL-7104",
    expiryDate: "2028-02-28"
  },
  {
    id: "PROD-107",
    barcode: "8901764012211",
    name: "Parle-G Gold Glucose Biscuits 1kg",
    category: "Snacks & Packaged",
    costPrice: 85,
    sellingPrice: 105,
    stock: 28,
    unit: "Pack",
    gstRate: 5,
    minThreshold: 15,
    supplier: "Parle Products Agency",
    batch: "PG-5512",
    expiryDate: "2026-12-01"
  },
  {
    id: "PROD-108",
    barcode: "8901063012898",
    name: "Taj Mahal Premium Tea 500g",
    category: "Beverages",
    costPrice: 285,
    sellingPrice: 340,
    stock: 3, // Critical red (<5)
    unit: "Box",
    gstRate: 5,
    minThreshold: 15,
    supplier: "Brooke Bond Depo",
    batch: "BB-1092",
    expiryDate: "2027-04-18"
  },
  {
    id: "PROD-109",
    barcode: "8901526201014",
    name: "Dettol Original Liquid Handwash Refill 675ml",
    category: "Personal & Hygiene",
    costPrice: 88,
    sellingPrice: 109,
    stock: 22,
    unit: "Pouch",
    gstRate: 18,
    minThreshold: 15,
    supplier: "Reckitt Benckiser",
    batch: "RB-4411",
    expiryDate: "2027-09-01"
  },
  {
    id: "PROD-110",
    barcode: "8902579100124",
    name: "Haldiram's Nagpur Bhujia Sev 400g",
    category: "Snacks & Packaged",
    costPrice: 95,
    sellingPrice: 120,
    stock: 2, // Critical red (<5)
    unit: "Pouch",
    gstRate: 12,
    minThreshold: 15,
    supplier: "Haldiram FMCG Dist.",
    batch: "HLD-8820",
    expiryDate: "2026-09-15"
  },
  {
    id: "PROD-111",
    barcode: "8901030010995",
    name: "Colgate Strong Teeth Dental Cream 200g",
    category: "Personal & Hygiene",
    costPrice: 92,
    sellingPrice: 115,
    stock: 26,
    unit: "Tube",
    gstRate: 18,
    minThreshold: 15,
    supplier: "Colgate Palmolive",
    batch: "CP-3901",
    expiryDate: "2027-11-30"
  },
  {
    id: "PROD-112",
    barcode: "8906001050011",
    name: "Catch Royal Jeera (Cumin Seeds) 200g",
    category: "Staples & Spices",
    costPrice: 95,
    sellingPrice: 125,
    stock: 14, // Warning yellow (<15)
    unit: "Box",
    gstRate: 5,
    minThreshold: 15,
    supplier: "DS Group",
    batch: "DS-5011",
    expiryDate: "2027-01-20"
  },
  {
    id: "PROD-113",
    barcode: "8901058000404",
    name: "Nescafe Classic Instant Coffee Jar 50g",
    category: "Beverages",
    costPrice: 165,
    sellingPrice: 195,
    stock: 19,
    unit: "Jar",
    gstRate: 18,
    minThreshold: 15,
    supplier: "Nestle India Dist.",
    batch: "NC-8802",
    expiryDate: "2027-05-15"
  },
  {
    id: "PROD-114",
    barcode: "8901207010018",
    name: "Everest Turmeric Powder (Haldi) 500g",
    category: "Staples & Spices",
    costPrice: 110,
    sellingPrice: 135,
    stock: 31,
    unit: "Box",
    gstRate: 5,
    minThreshold: 15,
    supplier: "S. Narendra & Co.",
    batch: "EVR-2910",
    expiryDate: "2027-03-31"
  },
  {
    id: "PROD-115",
    barcode: "8901491101837",
    name: "Sunfeast Dark Fantasy Choco Fills 300g",
    category: "Snacks & Packaged",
    costPrice: 105,
    sellingPrice: 130,
    stock: 11, // Warning yellow
    unit: "Box",
    gstRate: 18,
    minThreshold: 15,
    supplier: "ITC Wholesale Hub",
    batch: "ITC-7714",
    expiryDate: "2026-11-10"
  }
];

export const INITIAL_STAFF = [
  {
    id: "STF-01",
    name: "Anand Sharma",
    role: "Admin",
    pin: "1234",
    phone: "+91 98765 43210",
    email: "anand.admin@grocerease.com",
    wageType: "Monthly",
    wageAmount: 45000,
    status: "Active",
    joiningDate: "2023-01-15"
  },
  {
    id: "STF-02",
    name: "Ramesh Verma",
    role: "Cashier",
    pin: "2233",
    phone: "+91 98111 22334",
    email: "ramesh.v@grocerease.com",
    wageType: "Monthly",
    wageAmount: 18500,
    status: "Active",
    joiningDate: "2024-03-01"
  },
  {
    id: "STF-03",
    name: "Pooja Patel",
    role: "Cashier",
    pin: "4455",
    phone: "+91 98222 55667",
    email: "pooja.p@grocerease.com",
    wageType: "Monthly",
    wageAmount: 19000,
    status: "Active",
    joiningDate: "2024-06-15"
  },
  {
    id: "STF-04",
    name: "Sunil Yadav",
    role: "Inventory Lead",
    pin: "7788",
    phone: "+91 98333 77889",
    email: "sunil.y@grocerease.com",
    wageType: "Monthly",
    wageAmount: 22000,
    status: "Active",
    joiningDate: "2023-08-10"
  },
  {
    id: "STF-05",
    name: "Kavita Rao",
    role: "Store Associate",
    pin: "9900",
    phone: "+91 98444 88990",
    email: "kavita.r@grocerease.com",
    wageType: "Hourly",
    wageAmount: 110, // per hour
    status: "Active",
    joiningDate: "2025-01-05"
  }
];

export const INITIAL_ATTENDANCE = [
  {
    id: "ATT-101",
    staffId: "STF-01",
    staffName: "Anand Sharma",
    role: "Admin",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "08:30 AM",
    checkOutTime: null,
    status: "Present",
    hoursWorked: 6.5
  },
  {
    id: "ATT-102",
    staffId: "STF-02",
    staffName: "Ramesh Verma",
    role: "Cashier",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "08:50 AM",
    checkOutTime: null,
    status: "Present",
    hoursWorked: 6.1
  },
  {
    id: "ATT-103",
    staffId: "STF-03",
    staffName: "Pooja Patel",
    role: "Cashier",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "09:05 AM",
    checkOutTime: null,
    status: "Present",
    hoursWorked: 5.8
  },
  {
    id: "ATT-104",
    staffId: "STF-04",
    staffName: "Sunil Yadav",
    role: "Inventory Lead",
    date: new Date().toISOString().split("T")[0],
    checkInTime: "09:15 AM",
    checkOutTime: null,
    status: "Present",
    hoursWorked: 5.6
  },
  {
    id: "ATT-105",
    staffId: "STF-05",
    staffName: "Kavita Rao",
    role: "Store Associate",
    date: new Date().toISOString().split("T")[0],
    checkInTime: null,
    checkOutTime: null,
    status: "On Leave",
    hoursWorked: 0
  }
];

export const INITIAL_LEAVES = [
  {
    id: "LEV-01",
    staffId: "STF-05",
    staffName: "Kavita Rao",
    role: "Store Associate",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    days: 2,
    reason: "Family medical emergency",
    status: "Approved",
    appliedOn: "2026-10-26"
  },
  {
    id: "LEV-02",
    staffId: "STF-02",
    staffName: "Ramesh Verma",
    role: "Cashier",
    startDate: "2026-11-02",
    endDate: "2026-11-03",
    days: 2,
    reason: "Festival travel to hometown",
    status: "Pending",
    appliedOn: "2026-10-25"
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-01",
    name: "Mahesh Gupta (Flat 402)",
    phone: "98700 11223",
    creditLimit: 5000,
    outstandingBalance: 1450,
    lastPaymentDate: "2026-10-20"
  },
  {
    id: "CUST-02",
    name: "Dr. Sunita Deshmukh",
    phone: "98210 33445",
    creditLimit: 10000,
    outstandingBalance: 3200,
    lastPaymentDate: "2026-10-18"
  },
  {
    id: "CUST-03",
    name: "Rajeshwar Tiwari (Shop 3)",
    phone: "99880 44556",
    creditLimit: 8000,
    outstandingBalance: 820,
    lastPaymentDate: "2026-10-24"
  },
  {
    id: "CUST-04",
    name: "Priya Nair",
    phone: "98190 77889",
    creditLimit: 3000,
    outstandingBalance: 0,
    lastPaymentDate: "2026-10-22"
  }
];

export const INITIAL_SALES = [
  {
    id: "INV-2026-1001",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    cashierName: "Ramesh Verma",
    customerName: "Walk-in Customer",
    paymentMode: "UPI",
    items: [
      { id: "PROD-101", name: "Tata Salt 1kg", qty: 2, price: 28, costPrice: 22, gstRate: 0, total: 56 },
      { id: "PROD-105", name: "Maggi Noodles 280g (Pack of 4)", qty: 2, price: 58, costPrice: 48, gstRate: 12, total: 116 }
    ],
    subtotal: 172,
    taxTotal: 12.43,
    discount: 0,
    grandTotal: 172,
    paidAmount: 172,
    changeAmount: 0
  },
  {
    id: "INV-2026-1002",
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    cashierName: "Pooja Patel",
    customerName: "Mahesh Gupta (Flat 402)",
    paymentMode: "Udhar",
    items: [
      { id: "PROD-102", name: "Fortune Sunlite Refined Oil 1L", qty: 2, price: 148, costPrice: 125, gstRate: 5, total: 296 },
      { id: "PROD-103", name: "Aashirvaad Shudh Chakki Atta 5kg", qty: 1, price: 245, costPrice: 210, gstRate: 5, total: 245 },
      { id: "PROD-107", name: "Parle-G Gold Biscuits 1kg", qty: 1, price: 105, costPrice: 85, gstRate: 5, total: 105 }
    ],
    subtotal: 646,
    taxTotal: 30.76,
    discount: 20,
    grandTotal: 626,
    paidAmount: 0,
    changeAmount: 0
  },
  {
    id: "INV-2026-1003",
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    cashierName: "Ramesh Verma",
    customerName: "Walk-in Customer",
    paymentMode: "Cash",
    items: [
      { id: "PROD-106", name: "Surf Excel Detergent Powder 1kg", qty: 1, price: 145, costPrice: 120, gstRate: 18, total: 145 },
      { id: "PROD-109", name: "Dettol Handwash Refill 675ml", qty: 1, price: 109, costPrice: 88, gstRate: 18, total: 109 },
      { id: "PROD-111", name: "Colgate Dental Cream 200g", qty: 1, price: 115, costPrice: 92, gstRate: 18, total: 115 }
    ],
    subtotal: 369,
    taxTotal: 56.29,
    discount: 15,
    grandTotal: 354,
    paidAmount: 500,
    changeAmount: 146
  }
];

export const INITIAL_PRICE_AUDIT_LOGS = [
  {
    id: "AUD-01",
    timestamp: "2026-10-25 11:30 AM",
    productId: "PROD-102",
    productName: "Fortune Sunlite Refined Sunflower Oil 1L",
    oldPrice: 142,
    newPrice: 148,
    costPrice: 125,
    oldMargin: "11.97%",
    newMargin: "15.54%",
    changedBy: "Anand Sharma (Admin)",
    reason: "Wholesale market hike adjustment"
  },
  {
    id: "AUD-02",
    timestamp: "2026-10-24 04:15 PM",
    productId: "PROD-108",
    productName: "Taj Mahal Premium Tea 500g",
    oldPrice: 325,
    newPrice: 340,
    costPrice: 285,
    oldMargin: "12.31%",
    newMargin: "16.18%",
    changedBy: "Anand Sharma (Admin)",
    reason: "New MRP batch rollout"
  }
];

export const INITIAL_STOCK_LOGS = [
  {
    id: "STK-IN-01",
    type: "STOCK_IN",
    timestamp: "2026-10-26 10:00 AM",
    productId: "PROD-101",
    productName: "Tata Salt 1kg",
    qty: 50,
    batch: "TS-2026-B1",
    supplier: "Tata Consumer Direct",
    unitCost: 22,
    notes: "Regular scheduled weekly replenishment",
    recordedBy: "Sunil Yadav"
  },
  {
    id: "STK-OUT-01",
    type: "STOCK_OUT",
    timestamp: "2026-10-26 03:40 PM",
    productId: "PROD-104",
    productName: "Amul Taaza Homogenised Milk 1L",
    qty: 2,
    batch: "AML-0442",
    reason: "Pouch leakage during transit",
    notes: "Damage verified by store manager",
    recordedBy: "Sunil Yadav"
  }
];
