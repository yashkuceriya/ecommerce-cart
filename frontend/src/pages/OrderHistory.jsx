import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_STYLES = {
  pending: 'bg-[#fef3c7] text-[#92400e]', confirmed: 'bg-[#d5e3fd] text-[#0d1c2f]',
  processing: 'bg-[#dbe1ff] text-[#00174b]', shipped: 'bg-[#e0e3e5] text-[#191c1e]',
  delivered: 'bg-[#6ffbbe] text-[#002113]', cancelled: 'bg-[#ffdad6] text-[#93000a]',
  refunded: 'bg-[#e6e8ea] text-[#45464d]',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/orders/').then(res => setOrders(res.data.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-16 py-12">
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">receipt_long</span>
          <p className="font-headline font-bold text-lg">No orders yet</p>
          <Link to="/catalog" className="text-[#497cff] text-sm hover:underline mt-2 inline-block">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.order_number}`}
              className="block bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] p-6 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-headline font-bold">#{order.order_number}</p>
                  <p className="text-xs text-[#76777d] mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[order.status] || 'bg-[#e6e8ea]'}`}>{order.status}</span>
                  <p className="font-headline font-bold text-lg mt-1">${order.total}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
