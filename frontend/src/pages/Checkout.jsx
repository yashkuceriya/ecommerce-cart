import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useToast } from '../store/ToastContext';
import api from '../api/client';

const steps = ['Contact', 'Shipping', 'Payment', 'Review'];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [form, setForm] = useState({
    email: user?.email || '', shipping_name: user ? `${user.first_name} ${user.last_name}` : '',
    shipping_address: '', shipping_city: '', shipping_state: '', shipping_zip: '',
    billing_same_as_shipping: true, payment_method: 'credit_card',
    purchase_order_number: '', organization_name: user?.organization || '',
    tax_exempt: false, notes: '',
  });

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const subtotal = parseFloat(cart.total);
  let discount = 0;
  if (coupon) { discount = coupon.discount_type === 'percentage' ? subtotal * (parseFloat(coupon.discount_value) / 100) : parseFloat(coupon.discount_value); discount = Math.min(discount, subtotal); }
  const afterDiscount = subtotal - discount;
  const tax = form.tax_exempt ? 0 : afterDiscount * 0.08;
  const total = afterDiscount + tax;

  const applyCoupon = async () => {
    setCouponError('');
    try {
      const { data } = await api.post('/catalog/coupon/validate/', { code: couponCode.trim().toUpperCase() });
      if (parseFloat(data.min_purchase) > subtotal) { setCouponError(`Minimum $${data.min_purchase} required.`); return; }
      setCoupon(data); toast?.success('Coupon applied!');
    } catch (err) { setCouponError(err.response?.data?.error || 'Invalid coupon.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = { ...form }; if (coupon) payload.coupon_code = coupon.code;
      const { data } = await api.post('/checkout/', payload);
      await fetchCart(); toast?.success('Order placed!');
      navigate(`/orders/${data.order_number}`);
    } catch (err) { setError(err.response?.data?.error || 'Checkout failed.'); } finally { setLoading(false); }
  };

  if (cart.items.length === 0) return <div className="max-w-[1440px] mx-auto px-16 py-24 text-center text-[#76777d]">Your cart is empty.</div>;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 min-h-screen">
      {/* Stepper */}
      <div className="mb-20 max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#e6e8ea] -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-[#191c1e] to-[#002113] -translate-y-1/2 z-0" />
          {steps.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                'bg-[#191c1e] text-white'
              }`}>{i + 1}</div>
              <span className={`text-[11px] uppercase tracking-widest font-bold text-[#191c1e]`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-7 space-y-12">
          {error && <div className="bg-[#ffdad6] text-[#93000a] p-4 rounded-lg text-sm">{error}</div>}

          {/* Contact */}
          <section className="space-y-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-headline font-extrabold tracking-tighter">Contact Information</h2>
              {!user && <a href="/login" className="text-sm text-[#497cff] hover:underline">Log in for faster checkout</a>}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Email Address</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                placeholder="educator@school.edu"
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all outline outline-2 outline-transparent focus:outline-[#c6c6cd]/20" />
            </div>
          </section>

          {/* Shipping */}
          <section className="space-y-8">
            <h2 className="text-3xl font-headline font-extrabold tracking-tighter">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Full Name</label>
                <input type="text" required value={form.shipping_name} onChange={e => update('shipping_name', e.target.value)}
                  className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all outline outline-2 outline-transparent focus:outline-[#c6c6cd]/20" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Address</label>
                <input type="text" required value={form.shipping_address} onChange={e => update('shipping_address', e.target.value)}
                  placeholder="Street name and number"
                  className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all outline outline-2 outline-transparent focus:outline-[#c6c6cd]/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">City</label>
                <input type="text" required value={form.shipping_city} onChange={e => update('shipping_city', e.target.value)}
                  className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">State</label>
                  <input type="text" required value={form.shipping_state} onChange={e => update('shipping_state', e.target.value)}
                    placeholder="NY" className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">ZIP</label>
                  <input type="text" required value={form.shipping_zip} onChange={e => update('shipping_zip', e.target.value)}
                    className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 focus:ring-0 focus:bg-white transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="space-y-8">
            <h2 className="text-3xl font-headline font-extrabold tracking-tighter">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { val: 'credit_card', icon: 'credit_card', label: 'Credit or Debit Card', sub: 'Visa, Mastercard, AMEX' },
                { val: 'paypal', icon: 'account_balance_wallet', label: 'PayPal', sub: 'Pay with your PayPal account' },
                { val: 'purchase_order', icon: 'description', label: 'Purchase Order', sub: 'Institutional B2B ordering' },
              ].map(m => (
                <button key={m.val} type="button" onClick={() => update('payment_method', m.val)}
                  className={`p-6 rounded-xl flex items-start gap-4 cursor-pointer relative overflow-hidden transition-all text-left ${
                    form.payment_method === m.val ? 'border-2 border-[#191c1e] bg-white' : 'border-2 border-transparent bg-[#f2f4f6] hover:bg-[#e6e8ea]'
                  }`}>
                  {form.payment_method === m.val && <div className="absolute top-0 left-0 w-1 h-full bg-[#191c1e]" />}
                  <span className={`material-symbols-outlined ${form.payment_method === m.val ? 'text-[#191c1e]' : 'text-[#515f74]'}`}>{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold">{m.label}</p>
                    <p className="text-xs text-[#45464d]">{m.sub}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${form.payment_method === m.val ? 'border-[#191c1e] bg-[#191c1e]' : 'border-[#c6c6cd]'}`}>
                    {form.payment_method === m.val && <div className="w-full h-full rounded-full border-2 border-white" />}
                  </div>
                </button>
              ))}
            </div>

            {form.payment_method === 'credit_card' && (
              <div className="p-8 rounded-2xl bg-[#f2f4f6] space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border-none rounded-lg p-4 focus:ring-0 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Expiry Date</label>
                    <input type="text" placeholder="MM / YY" className="w-full bg-white border-none rounded-lg p-4 focus:ring-0 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">CVV</label>
                    <input type="password" placeholder="***" className="w-full bg-white border-none rounded-lg p-4 focus:ring-0 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {form.payment_method === 'paypal' && (
              <div className="p-6 rounded-xl bg-[#d5e3fd] text-[#0d1c2f] text-sm">You will be redirected to PayPal to complete payment.</div>
            )}

            {form.payment_method === 'purchase_order' && (
              <div className="p-8 rounded-2xl bg-[#f2f4f6] space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">PO Number</label>
                  <input type="text" value={form.purchase_order_number} onChange={e => update('purchase_order_number', e.target.value)}
                    className="w-full bg-white border-none rounded-lg p-4 focus:ring-0 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Organization</label>
                  <input type="text" value={form.organization_name} onChange={e => update('organization_name', e.target.value)}
                    className="w-full bg-white border-none rounded-lg p-4 focus:ring-0 transition-all" />
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={form.tax_exempt} onChange={e => update('tax_exempt', e.target.checked)}
                    className="w-5 h-5 rounded border-[#c6c6cd] text-[#191c1e] focus:ring-0" />
                  <span className="text-sm text-[#45464d]">Tax exempt organization</span>
                </label>
              </div>
            )}
          </section>

          <div className="pt-8">
            <button type="submit" disabled={loading}
              className="w-full py-5 rounded-lg bg-gradient-to-r from-[#191c1e] to-[#002113] text-white font-headline font-extrabold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50">
              {loading ? 'Processing...' : 'Place Order'}
              {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 p-10 rounded-3xl bg-[#f2f4f6] border border-[#c6c6cd]/10 space-y-10">
            <h3 className="font-headline text-xl font-bold">Order Summary</h3>
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-[#e0e3e5] overflow-hidden shrink-0">
                    {item.product.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-headline font-bold text-sm">{item.product.name}</p>
                    <p className="text-xs text-[#45464d] mb-1">Qty: {item.quantity}</p>
                    <p className="font-bold mt-auto">${item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div>
              {coupon ? (
                <div className="flex items-center justify-between bg-[#6ffbbe] p-3 rounded-lg text-sm">
                  <span className="text-[#002113] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>{coupon.code}
                  </span>
                  <button type="button" onClick={() => setCoupon(null)} className="text-xs text-[#002113] hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder="PROMO CODE" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border-none rounded-lg px-4 py-3 text-[11px] uppercase tracking-widest focus:ring-1 focus:ring-[#191c1e]" />
                  <button type="button" onClick={applyCoupon}
                    className="bg-[#191c1e] text-white px-5 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest">Apply</button>
                </div>
              )}
              {couponError && <p className="text-xs text-[#ba1a1a] mt-1">{couponError}</p>}
            </div>

            <div className="space-y-4 pt-10 border-t border-[#c6c6cd]/20">
              <div className="flex justify-between text-sm"><span className="text-[#45464d]">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-[#009668]">Discount</span><span className="font-medium text-[#009668]">-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-[#45464d]">Shipping</span><span className="font-medium text-[#009668]">Free</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#45464d]">Tax</span><span className="font-medium">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-headline font-black pt-4">
                <span>TOTAL</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-6 bg-[#6ffbbe] rounded-xl flex items-center gap-4">
              <span className="material-symbols-outlined text-[#002113]">eco</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#002113]">Educator Discount</p>
                <p className="text-xs text-[#005236]">Use code WELCOME10 for 10% off.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
