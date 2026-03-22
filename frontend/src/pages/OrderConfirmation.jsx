import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderNumber}/`).then(res => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;
  if (!order) return <div className="text-center py-24 text-[#76777d]">Order not found</div>;

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-16 py-16">
      <div className="text-center mb-12">
        <span className="material-symbols-outlined text-[#009668] text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h1 className="font-headline text-4xl font-extrabold tracking-tighter">Order Confirmed</h1>
        <p className="text-[#45464d] mt-2">#{order.order_number}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-[#6ffbbe] text-[#002113] text-sm px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-sm">email</span>
          Confirmation sent to {order.email}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] overflow-hidden">
        <div className="grid sm:grid-cols-2 gap-8 p-8">
          {[
            ['Status', <span className="capitalize">{order.status}</span>],
            ['Payment', <span className="capitalize">{order.payment_method.replace('_', ' ')} &middot; {order.payment_status}</span>],
            ['Ship To', <><p>{order.shipping_name}</p><p className="text-[#45464d]">{order.shipping_address}</p><p className="text-[#45464d]">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p></>],
            ['Date', new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
          ].map(([label, value], i) => (
            <div key={i}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#76777d] mb-2">{label}</p>
              <div className="font-medium text-sm">{value}</div>
            </div>
          ))}
        </div>
        <hr className="border-[#c6c6cd]/10" />
        <div className="p-8 space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.product_name} <span className="text-[#76777d]">x{item.quantity}</span></span>
              <span className="font-medium">${item.subtotal}</span>
            </div>
          ))}
        </div>
        <hr className="border-[#c6c6cd]/10" />
        <div className="p-8 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[#45464d]">Subtotal</span><span>${order.subtotal}</span></div>
          {parseFloat(order.discount) > 0 && <div className="flex justify-between text-[#009668]"><span>Discount</span><span>-${order.discount}</span></div>}
          <div className="flex justify-between"><span className="text-[#45464d]">Tax</span><span>${order.tax}</span></div>
          <div className="flex justify-between font-headline font-black text-xl pt-4 border-t border-[#c6c6cd]/10"><span>TOTAL</span><span>${order.total}</span></div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="bg-[#f2f4f6] rounded-xl p-6 mt-6 flex items-center gap-4">
        <span className="material-symbols-outlined text-[#191c1e] text-2xl">local_shipping</span>
        <div>
          <p className="font-bold text-sm">Estimated Delivery</p>
          <p className="text-sm text-[#45464d]">
            {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} – {new Date(Date.now() + 8 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {!user && (
        <div className="bg-[#fef3c7] rounded-xl p-5 mt-4 text-center text-sm">
          <p className="font-medium text-[#92400e]">Save your order number <strong>{order.order_number}</strong></p>
          <Link to="/order-lookup" className="text-[#92400e] text-xs underline mt-1 inline-block">Track your order</Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center mt-10">
        <Link to="/catalog" className="bg-[#191c1e] text-white px-8 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all">Continue Shopping</Link>
        <button onClick={() => window.print()} className="bg-[#f2f4f6] text-[#191c1e] px-8 py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#e6e8ea] transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">print</span>Print
        </button>
      </div>
    </main>
  );
}
