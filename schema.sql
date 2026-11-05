-- ========================================================
-- GrocerEase Admin & POS - PostgreSQL Production Schema
-- ========================================================

-- 1. Staff & Authentication
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('Admin', 'Cashier', 'Inventory Lead', 'Store Associate')),
    pin VARCHAR(8) NOT NULL,
    phone VARCHAR(32),
    email VARCHAR(120),
    wage_type VARCHAR(16) DEFAULT 'Monthly',
    wage_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(16) DEFAULT 'Active',
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Staff Attendance Logs
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(32) PRIMARY KEY,
    staff_id VARCHAR(32) REFERENCES staff(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    check_in_time VARCHAR(16),
    check_out_time VARCHAR(16),
    hours_worked NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Half-day', 'On Leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staff Leave Requests
CREATE TABLE IF NOT EXISTS leaves (
    id VARCHAR(32) PRIMARY KEY,
    staff_id VARCHAR(32) REFERENCES staff(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    applied_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Catalog & Inventory
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY,
    barcode VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(32) DEFAULT 'Unit',
    gst_rate NUMERIC(5, 2) DEFAULT 5.0,
    min_threshold INT DEFAULT 15,
    supplier VARCHAR(120),
    batch VARCHAR(64),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dynamic Price Audit Trail
CREATE TABLE IF NOT EXISTS price_audit_logs (
    id VARCHAR(32) PRIMARY KEY,
    product_id VARCHAR(32) REFERENCES products(id) ON DELETE CASCADE,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    old_margin VARCHAR(16),
    new_margin VARCHAR(16),
    changed_by VARCHAR(120) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Stock Movement Logs (In & Out Audits)
CREATE TABLE IF NOT EXISTS stock_movement_logs (
    id VARCHAR(32) PRIMARY KEY,
    type VARCHAR(16) NOT NULL CHECK (type IN ('STOCK_IN', 'STOCK_OUT')),
    product_id VARCHAR(32) REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    batch VARCHAR(64),
    supplier VARCHAR(120),
    unit_cost NUMERIC(10, 2),
    reason VARCHAR(120),
    notes TEXT,
    recorded_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Customers & Udhar / Credit Ledger
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(32),
    credit_limit NUMERIC(10, 2) DEFAULT 5000.00,
    outstanding_balance NUMERIC(10, 2) DEFAULT 0.00,
    last_payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. POS Sales & Invoices
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(32) PRIMARY KEY, -- e.g. INV-2026-1001
    cashier_id VARCHAR(32) REFERENCES staff(id),
    customer_id VARCHAR(32) REFERENCES customers(id),
    customer_name VARCHAR(120) DEFAULT 'Walk-in Customer',
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Udhar')),
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    tax_total NUMERIC(10, 2) NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) NOT NULL,
    change_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Sale Line Items
CREATE TABLE IF NOT EXISTS sale_items (
    id BIGSERIAL PRIMARY KEY,
    sale_id VARCHAR(32) REFERENCES sales(id) ON DELETE CASCADE,
    product_id VARCHAR(32) REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    line_discount NUMERIC(10, 2) DEFAULT 0.00,
    gst_rate NUMERIC(5, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL
);
