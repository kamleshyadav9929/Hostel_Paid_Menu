# Hostel Paid Menu Management App

A minimal, secure web application for managing a hostel's paid menu system. Built with React (Vite), Tailwind CSS v4, Express.js, and Supabase.

## Features

**For Students:**
- View available daily menu
- Order food items with specific quantities
- Dashboard tracking today's orders
- View complete order history
- Check total mess bill and payment status

**For Admins:**
- Manage menu items (Add, Edit pricing, Toggle availability)
- View all student orders
- Update student payment records
- View student list and balance tracking

## Tech Stack

- **Frontend**: React 19, Vite, React Router 7, Tailwind CSS v4
- **Backend**: Node.js, Express.js 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT, bcrypt hashing
- **Security**: Supabase Row Level Security (RLS)

## Setup Instructions

### 1. Database Setup
1. Create a Supabase project.
2. Open the SQL Editor and run the contents of `supabase_schema.sql` at the root of this project.
   - This creates tables (`users`, `menu_items`, `orders`, `payments`), enables RLS, and inserts demo users/menu items.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder containing:
```env
SUPABASE_URL=your_projecturl
SUPABASE_ANON_KEY=your_anonkey
JWT_SECRET=super_secret_jwt_key
PORT=5000
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials

The SQL script creates the following default users:

**Admin:**
- Roll Number: `admin1`
- Password: `admin123`

**Student:**
- Roll Number: `2023123`
- Password: `student123`
