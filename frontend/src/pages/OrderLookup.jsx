import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function OrderLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setOrder(null);
    try { const { data } = await api.post('/orders/lookup/', { order_number: orderNumber, email }); setOrder(data); }
    catch (err) { setError(err.response?.data?.error || 'Order not found.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-headline text-3xl font-extrabold tracking-tighter mb-2">Track Your Order</h1>
      <p className="text-sm text-[#45464d] mb-10">Enter your order number and email.</p>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-6">
        {error && <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Order Number</label>
          <input type="text" required placeholder="UL-20260322-XXXX" value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
            className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-4 bg-[#191c1e] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
          {loading ? 'Looking up...' : 'Find Order'}
        </button>
      </form>
      {order && (
        <div className="mt-8 bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#009668]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <div><p className="font-headline font-bold">#{order.order_number}</p><p className="text-xs text-[#76777d]">{new Date(order.created_at).toLocaleDateString()}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><span className="text-[#76777d]">Status:</span> <span className="font-medium capitalize">{order.status}</span></div>
            <div><span className="text-[#76777d]">Total:</span> <span className="font-headline font-bold">${order.total}</span></div>
          </div>
          <div className="space-y-2 text-sm border-t border-[#c6c6cd]/10 pt-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between"><span>{item.product_name} x{item.quantity}</span><span className="font-medium">${item.subtotal}</span></div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
