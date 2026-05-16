import { useState } from "react";
import { login } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LogIn } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      dispatch(loginSuccess({
        user: res.data,
        token: res.data.token
      }));
      toast.success(`Welcome back, ${res.data.username}`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LogIn size={32} />
          </div>
          <h1 style={{ fontWeight: 900 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to your store account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-dark" style={{ justifyContent: 'center', padding: '1rem' }}>Login Now</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
