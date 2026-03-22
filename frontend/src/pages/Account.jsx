import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import api from '../api/client';

export default function Account() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '', phone: user?.phone || '', organization: user?.organization || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwError, setPwError] = useState('');
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => { e.preventDefault(); await updateProfile(form); toast?.success('Profile updated'); };
  const handlePw = async (e) => {
    e.preventDefault(); setPwError('');
    try { await api.post('/auth/change-password/', pwForm); toast?.success('Password changed'); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); }
    catch (err) { setPwError(err.response?.data?.error || 'Failed'); }
  };

  const Field = ({ label, ...props }) => (
    <div className="space-y-2">
      <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">{label}</label>
      <input {...props} className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-16 py-12">
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">My Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-6 mb-8">
        <h2 className="font-headline font-bold text-lg">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" value={form.first_name} onChange={e => update('first_name', e.target.value)} />
          <Field label="Last Name" value={form.last_name} onChange={e => update('last_name', e.target.value)} />
        </div>
        <Field label="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
        <Field label="Phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
        <Field label="Organization" value={form.organization} onChange={e => update('organization', e.target.value)} />
        <button type="submit" className="bg-[#191c1e] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all">Save Changes</button>
      </form>
      <form onSubmit={handlePw} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-6 mb-8">
        <h2 className="font-headline font-bold text-lg">Change Password</h2>
        {pwError && <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm">{pwError}</div>}
        <Field label="Current Password" type="password" required value={pwForm.current_password} onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="New Password" type="password" required minLength={8} value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
          <Field label="Confirm" type="password" required value={pwForm.confirm_password} onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))} />
        </div>
        <button type="submit" className="bg-[#45464d] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all">Update Password</button>
      </form>
      <div className="flex flex-wrap gap-3">
        {[
          ['/account/orders', 'Order History'],
          ['/wishlist', 'Wishlist'],
          ...(user?.role === 'community_member' ? [['/community', 'Community']] : []),
        ].map(([to, label]) => (
          <Link key={to} to={to} className="bg-[#f2f4f6] text-[#191c1e] px-5 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-[#e6e8ea] transition-all">{label}</Link>
        ))}
      </div>
    </main>
  );
}
