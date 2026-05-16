import axios from "axios";
import { store } from "../redux/store";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Attach token
API.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


// AUTH
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// PRODUCTS
export const getProducts = () => API.get("/products");
export const createProduct = (data) => API.post("/products", data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const initiateCheckout = (data) => API.post("/checkout", data);
export const getOrders = () => API.get("/orders");
export const getMyOrders = (email) => API.get(`/orders/user/${email}`);
export const verifyPayment = (data) => API.post("/verify", data);

export default API;
