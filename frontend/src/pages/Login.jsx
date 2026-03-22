import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(username, password); toast?.success('Welcome back!'); navigate(from, { replace: true }); }
    catch (err) {
      const s = err.response?.status;
      setError(s === 401 ? 'Incorrect username or password.' : s === 429 ? 'Too many attempts. Please wait.' : 'Unable to sign in.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 bg-[#f7f9fb]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-headline text-2xl font-extrabold tracking-tighter">UPSTREAM</span>
          <p className="text-sm text-[#45464d] mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-6">
          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm">
              <p>{error}</p>
              <Link to="/contact" className="text-[#93000a] underline text-xs mt-1 inline-block">Need help?</Link>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-[#f7f9fb] transition-all outline outline-2 outline-transparent focus:outline-[#c6c6cd]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-[#f7f9fb] transition-all outline outline-2 outline-transparent focus:outline-[#c6c6cd]/20" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#191c1e] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-xs text-[#76777d]">
            No account? <Link to="/register" className="text-[#497cff] font-medium hover:underline">Create one</Link>
          </p>
        </form>
        <p className="text-center text-xs text-[#76777d] mt-4">
          <Link to="/order-lookup" className="hover:underline">Track an order without signing in</Link>
        </p>
      </div>
    </div>
  );
}
