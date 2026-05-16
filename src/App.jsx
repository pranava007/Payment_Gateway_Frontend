import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/slices/authSlice";
import { fetchProducts, addProduct, removeProduct } from "./redux/slices/productSlice";
import { fetchOrders } from "./redux/slices/orderSlice";
import { initiateCheckout, verifyPayment } from "./services/api";

import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  RefreshCw, 
  X, 
  CreditCard, 
  Package,
  ShieldCheck,
  ShieldAlert,
  Zap,
  LogOut,
  User as UserIcon,
  History,
  TrendingUp,
  Layout
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Main Store Component
const Store = ({ user, onLogout }) => {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);
  const { items: orders, loading: ordersLoading } = useSelector((state) => state.orders);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState("store"); // 'store' or 'orders'

  // Form States
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", image: "" });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders({ role: user?.role, email: user?.email }));
  }, [user, dispatch]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await dispatch(addProduct(newProduct)).unwrap();
      toast.success("Product added successfully");
      setShowAddModal(false);
      setNewProduct({ name: "", price: "", description: "", image: "" });
    } catch (err) {
      toast.error(err || "Failed to add product");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await dispatch(removeProduct(id)).unwrap();
      toast.success("Product deleted");
    } catch (err) {
      toast.error(err || "Failed to delete");
    }
  };

  const handlePurchase = async (product) => {
    setIsProcessing(true);
    try {
      const res = await initiateCheckout({
        productId: product._id,
        customerName: user.username,
        email: user.email
      });

      const { checkoutUrl } = res.data;

      if (checkoutUrl) {
        toast.loading("Redirecting to secure checkout...");
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1000);
      } else {
        toast.error("Failed to get checkout URL");
      }

    } catch (err) {
      toast.error("Payment initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container animate-fade">
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900 }}>PREMIUM STORE</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Welcome, {user?.username || 'Guest'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: '1.25rem', border: '1px solid #eee' }}>
            <button 
              onClick={() => setView("store")}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: view === 'store' ? '#000' : 'transparent', color: view === 'store' ? '#fff' : '#666', fontWeight: 700, cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Layout size={16} /> Catalog
            </button>
            <button 
              onClick={() => setView("orders")}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: view === 'orders' ? '#000' : 'transparent', color: view === 'orders' ? '#fff' : '#666', fontWeight: 700, cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <History size={16} /> Orders
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid #eee' }}>
            <UserIcon size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user?.role?.toUpperCase()}</span>
          </div>
          {user?.role === 'admin' && view === 'store' && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-dark">
              <Plus size={20} /> Add Product
            </button>
          )}
          <button onClick={onLogout} className="btn" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {view === 'store' ? (
        /* PRODUCT GRID */
        productsLoading ? (
          <div style={{ textAlign: 'center', padding: '10rem' }}>
            <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '10rem', background: '#fff', borderRadius: '3rem', border: '2px dashed #eee' }}>
            <Package size={64} color="#ddd" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: '#aaa' }}>No products yet.</h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {products.map(product => (
              <div key={product._id} className="card">
                <div style={{ height: '300px', background: '#f0f0f0', position: 'relative' }}>
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(product._id)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.8)', border: 'none', padding: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} color="red" />
                    </button>
                  )}
                </div>
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 900, fontSize: '1.5rem' }}>{product.name}</h3>
                    <span style={{ background: '#000', color: '#fff', fontSize: '0.6rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 900 }}>PRO</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem', height: '3rem', overflow: 'hidden' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.6rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Price</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 900 }}>₹{product.price}</p>
                    </div>
                    {user?.role !== 'admin' && (
                      <button 
                        onClick={() => handlePurchase(product)}
                        className="btn btn-primary"
                      >
                        <ShoppingCart size={18} /> Buy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ORDERS VIEW */
        ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '10rem' }}>
            <RefreshCw className="animate-spin" size={48} color="var(--primary)" />
          </div>
        ) : (
          <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '2rem', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={30} color="#16a34a" />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Total {user?.role === 'admin' ? 'Revenue' : 'Spending'}</p>
                <h4 style={{ fontSize: '2rem', fontWeight: 900 }}>₹{totalRevenue.toLocaleString()}</h4>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '2rem', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', background: '#f5f3ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={30} color="#7c3aed" />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Orders</p>
                <h4 style={{ fontSize: '2rem', fontWeight: 900 }}>{orders.length}</h4>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '2rem', border: '1px solid #eee', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>{user?.role === 'admin' ? 'Customer' : 'Email'}</th>
                  <th style={{ textAlign: 'right', padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '1.5rem 2rem', fontSize: '0.7rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '5rem', textAlign: 'center', color: '#ccc' }}>No orders found.</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                      <td style={{ padding: '1.5rem 2rem', fontMono: 'true', fontSize: '0.75rem', color: '#999' }}>#{order._id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: '1.5rem 2rem', fontWeight: 700 }}>{order.productName}</td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.role === 'admin' ? order.customerName : order.email}</p>
                          {user?.role === 'admin' && <p style={{ fontSize: '0.7rem', color: '#aaa' }}>{order.email}</p>}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: 900 }}>₹{order.amount.toLocaleString()}</td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <span style={{ 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '0.75rem', 
                          fontSize: '0.65rem', 
                          fontWeight: 900, 
                          background: order.status === 'paid' ? '#f0fdf4' : '#fff7ed', 
                          color: order.status === 'paid' ? '#16a34a' : '#ea580c', 
                          textTransform: 'uppercase' 
                        }}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
    )}

      {/* MODALS (ADD & CHECKOUT) SAME AS BEFORE... */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#fff', padding: '3rem', borderRadius: '3rem', width: '100%', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 900 }}>New Product</h2>
              <X cursor="pointer" onClick={() => setShowAddModal(false)} />
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input required className="input" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input required type="number" className="input" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <textarea required className="input" placeholder="Description" rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              <input className="input" placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <button disabled={isProcessing} className="btn btn-dark" style={{ justifyContent: 'center', padding: '1.25rem' }}>
                {isProcessing ? "Adding..." : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Payment Status Page (Return from Gateways)
const PaymentStatus = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const syncStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/check-status/${orderId}`);
        if (response.data.status === 'paid') {
          setSuccess(true);
        }
      } catch (err) {
        console.error("Sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    syncStatus();
  }, [orderId]);

  if (loading) return <div className="container" style={{ padding: '10rem', textAlign: 'center' }}>Checking payment status...</div>;

  return (
    <div className="container" style={{ textAlign: 'center', padding: '10rem' }}>
      <div style={{ background: '#fff', padding: '4rem', borderRadius: '3rem', border: '1px solid #eee', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ width: '80px', height: '80px', background: success ? '#f0fdf4' : '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          {success ? <ShieldCheck size={40} color="#16a34a" /> : <ShieldAlert size={40} color="#ef4444" />}
        </div>
        <h1 style={{ fontWeight: 900, marginBottom: '1rem' }}>{success ? "Payment Successful!" : "Payment Pending"}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {success ? "Your order has been processed. You can now close this window or return to the store." : "We haven't received confirmation yet. If you paid, please wait or check back later."}
        </p>
        <button onClick={() => window.location.href = "/"} className="btn btn-dark" style={{ width: '100%' }}>
          Return to Store
        </button>
      </div>
    </div>
  );
};

// APP WRAPPER WITH ROUTING
function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };


  return (
    <Router>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/" element={user ? <Store user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
