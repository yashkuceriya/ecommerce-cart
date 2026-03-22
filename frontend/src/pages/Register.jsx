import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await register(form); toast?.success(`Welcome, ${form.first_name}!`); navigate(form.role === 'community_member' ? '/community' : '/catalog'); }
    catch (err) { const d = err.response?.data; setError(d ? Object.values(d).flat().join(' ') : 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-[#f7f9fb]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="font-headline text-2xl font-extrabold tracking-tighter">UPSTREAM</span>
          <p className="text-sm text-[#45464d] mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-5">
          {error && <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">First Name</label>
              <input type="text" required value={form.first_name} onChange={e => update('first_name', e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-3.5 text-sm focus:ring-0 focus:bg-[#f7f9fb] transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Last Name</label>
              <input type="text" required value={form.last_name} onChange={e => update('last_name', e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-3.5 text-sm focus:ring-0 focus:bg-[#f7f9fb] transition-all" />
            </div>
          </div>
          {['username', 'email'].map(f => (
            <div key={f} className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">{f}</label>
              <input type={f === 'email' ? 'email' : 'text'} required value={form[f]} onChange={e => update(f, e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-3.5 text-sm focus:ring-0 focus:bg-[#f7f9fb] transition-all" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {['password', 'password2'].map(f => (
              <div key={f} className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">{f === 'password2' ? 'Confirm' : 'Password'}</label>
                <input type="password" required minLength={8} value={form[f]} onChange={e => update(f, e.target.value)}
                  className="w-full bg-[#e6e8ea] border-none rounded-lg p-3.5 text-sm focus:ring-0 focus:bg-[#f7f9fb] transition-all" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">I want to</label>
            <select value={form.role} onChange={e => update('role', e.target.value)}
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-3.5 text-sm focus:ring-0 focus:bg-[#f7f9fb] transition-all">
              <option value="customer">Shop for resources</option>
              <option value="community_member">Join the literacy community</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-[#191c1e] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-center text-xs text-[#76777d]">
            Have an account? <Link to="/login" className="text-[#497cff] font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
