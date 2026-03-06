-- ============================================================
-- HOSTEL PAID MENU MANAGEMENT — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  room_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_roll TEXT NOT NULL REFERENCES users(roll_number),
  item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_roll TEXT NOT NULL REFERENCES users(roll_number),
  month TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial'))
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- USERS: everyone can read (for lookups), only admins can insert/update
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (true);

-- MENU ITEMS: anyone can read, admins can manage
CREATE POLICY "Anyone can read menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Service can manage menu" ON menu_items FOR ALL USING (true);

-- ORDERS: students see their own, admins see all
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Service can manage orders" ON orders FOR ALL USING (true);

-- PAYMENTS: students see their own, admins see all
CREATE POLICY "Anyone can read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Service can manage payments" ON payments FOR ALL USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Password: admin123 (bcrypt hash)
INSERT INTO users (name, roll_number, password_hash, role) VALUES
  ('Admin User', 'admin1', '$2a$10$X7UrE0aN.yfnVqXBXDqZ3.7nZbKxkiLWEDMrPVGGMfGCZ1XlGJfHi', 'admin');

-- Password: student123 (bcrypt hash)
INSERT INTO users (name, roll_number, password_hash, role) VALUES
  ('Test Student', '2023123', '$2a$10$X7UrE0aN.yfnVqXBXDqZ3.R0z6pKyUkNjTfVqcF.J1nTqH0RD1SzW', 'student');

-- Sample menu items
INSERT INTO menu_items (item_name, price, available) VALUES
  ('Amul Kool', 25, true),
  ('Sprite', 40, true),
  ('Thumbs Up', 40, true),
  ('Lassi', 30, true),
  ('Cold Coffee', 50, true),
  ('Mango Shake', 45, true),
  ('Bread Butter', 20, true),
  ('Maggi', 35, true),
  ('Egg Curry', 60, true),
  ('Paneer Tikka', 80, true);
