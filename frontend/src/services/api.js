import axios from "axios";

// In dev, Vite proxy handles /api → localhost:5000
// In production, set VITE_API_URL to your backend URL
const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────────────
export const login = (roll_number, password) =>
  api.post("/api/login", { roll_number, password });

export const register = (name, roll_number, password, room_number, role) =>
  api.post("/api/register", { name, roll_number, password, room_number, role });

// ─── Student ────────────────────────────────────────────────
export const getMyOrders = () => api.get("/api/my-orders");

export const getMyBill = () => api.get("/api/my-bill");

// ─── Admin ──────────────────────────────────────────────────
export const getMenu = () => api.get("/api/menu");

export const placeOrder = (student_roll, item_id, quantity) =>
  api.post("/api/order", { student_roll, item_id, quantity });
export const addMenuItem = (item_name, price) =>
  api.post("/api/menu/add", { item_name, price });

export const updateMenuItem = (id, updates) =>
  api.put("/api/menu/update", { id, ...updates });

export const getAllOrders = () => api.get("/api/orders");

export const updatePayment = (student_roll, month, amount, paid, status) =>
  api.put("/api/payment/update", { student_roll, month, amount, paid, status });

export const getStudents = (month) =>
  api.get("/api/students", { params: month ? { month } : {} });

export const addStudent = (name, roll_number, password, room_number) =>
  api.post("/api/students/add", { name, roll_number, password, room_number });

// Admin can also fetch all menu items (including unavailable)
export const getMenuAdmin = () => api.get("/api/menu");

export default api;
