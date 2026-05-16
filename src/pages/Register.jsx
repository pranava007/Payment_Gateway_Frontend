import { useState } from "react";
import { register } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "user" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#000', color: '#fff', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontWeight: 900 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Start your premium experience</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input className="input" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input className="input" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input className="input" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input type="radio" name="role" value="user" checked={formData.role === "user"} onChange={e => setFormData({...formData, role: e.target.value})} /> Customer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <input type="radio" name="role" value="admin" checked={formData.role === "admin"} onChange={e => setFormData({...formData, role: e.target.value})} /> Merchant
            </label>
          </div>

          <button className="btn btn-dark" style={{ justifyContent: 'center', padding: '1rem' }}>Create Account</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
