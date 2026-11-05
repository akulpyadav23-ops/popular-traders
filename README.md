# GrocerEase Admin & POS
> **Modern Grocery Store Management System**  
> Tailored for Supermarkets, Neighborhood Kiranas, and Retail Outlets.

---

## 🌟 Executive Summary & Features

GrocerEase is an end-to-end grocery administration, stock management, staff attendance, dynamic pricing checklist, and POS billing web application designed according to the production specifications.

### 1. Point of Sale (POS) Billing
- **Fast Product Grid & Optical Barcode Scanner Simulation:** Instant search, category filters, and simulated laser scan terminal or hardware USB scanner support.
- **Multi-Payment Engine:**
  - **Cash:** Tendered amount with instant change return calculator and quick denomination buttons (₹100, ₹200, ₹500, ₹2000).
  - **UPI:** Dynamic simulated QR code for PhonePe / GPay / Paytm with reference ID tracking.
  - **Card:** Card POS terminal swipe simulation with card digits and auth code.
  - **Udhar (Store Credit):** Neighborhood customer khata ledger integration with automatic debit and credit limits.
- **Taxes & Discounts:** Configurable GST brackets (0%, 5%, 12%, 18%), line discounts, and bill-level coupons.
- **80mm Thermal Receipt Generator:** ESC/POS standard thermal paper layout (`@media print` supported) with store header, itemized breakdown, savings banner, and barcode footer.

### 2. Stock Tracker (In & Out) & Inventory Valuation
- **Real-Time Visual Thresholds:**
  - 🔴 **Critical Low Stock:** `< 5 units` (Red badge)
  - 🟡 **Warning Reorder:** `< 15 units` (Yellow badge)
  - 🟢 **Healthy Stock:** `≥ 15 units` (Green badge)
- **Stock-In Restock Form:** Batch number, supplier, wholesale cost price, and quantity logging.
- **Stock-Out Write-Off Form:** Audited damage, breakage, transit leakage, or expiry deductions.
- **Valuation Analytics:** Total SKU count, units in stock, wholesale asset value, retail sales potential, and unrealized profit.

### 3. Dynamic Price Checklist & Margin Engine
- **Master Price Book Table:** Instant search, category filtering, and barcode mapping.
- **Admin Inline Quick Price Editor:** 1-click price update with live gross margin % calculation:
  $$\text{Margin } (\%) = \left(\frac{\text{Selling Price} - \text{Cost Price}}{\text{Selling Price}}\right) \times 100$$
- **Audit Trail Log:** Detailed history of all price shifts (Old Price, New Price, Margin Shift, Timestamp, Authorized Admin).
- **1-Click CSV Export:** Master price catalog export.

### 4. Staff Attendance & Shift Tracker
- **PIN-Based Touch Kiosk:** 4-digit PIN numeric keypad for fast shift check-in and check-out.
- **Daily Attendance Log:** Real-time log with hours worked counter and status badges (*Present*, *Half-day*, *Absent*, *On Leave*).
- **Staff Directory & Wages:** Confidential role-based wage view (Admin only).
- **Leave Management:** Staff leave submission form with Admin approval and rejection controls.

### 5. Authentication & Role-Based Access Control (RBAC)
- **Admin (Anand Sharma):** Full access to master pricing, wholesale cost margins, staff wages, leave approvals, inventory write-offs, and analytics.
- **Cashier (Ramesh Verma / Pooja Patel):** Streamlined POS billing, fast stock lookup, shift PIN check-in/out. Pricing modifications and executive analytics are locked.
- **Quick Switcher:** Convenient dropdown in header for role switching and testing.

### 6. Customer Udhar (Credit) Ledger
- Customer directory with credit limits, current outstanding balances, and utilization bars.
- 1-click settlement recording when customers pay back via Cash or UPI.

### 7. Executive Analytics
- Real-time KPI summary cards (Gross Sales, Net Profit, Active Staff, Low Stock Alerts).
- Payment channel distribution charts (UPI vs Cash vs Card vs Udhar).
- Fast-moving SKUs leaderboard.
- Transaction history with instant 80mm receipt re-printing.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)

### Development Server
```bash
# Start Vite development server
npm run dev
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Demo Profiles & PINs

| Staff Name | Role | PIN | Permissions |
| :--- | :--- | :--- | :--- |
| **Anand Sharma** | Admin | `1234` | Full access (Master pricing, staff wages, analytics, write-offs) |
| **Ramesh Verma** | Cashier | `2233` | POS billing, stock lookup, shift punch |
| **Pooja Patel** | Cashier | `4455` | POS billing, stock lookup, shift punch |
| **Sunil Yadav** | Inventory Lead | `7788` | Stock-in, stock-out logs, inventory auditing |
| **Kavita Rao** | Store Associate | `9900` | Floor stock checks, shift punch |

---

## 🗄️ Database Architecture
- **LocalDB / LocalStorage:** Zero configuration required; persists changes across reloads.
- **PostgreSQL Schema:** A full PostgreSQL DDL script is provided in `schema.sql` for enterprise backend deployments.
