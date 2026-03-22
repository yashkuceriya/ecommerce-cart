import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Cart() {
  const { cart, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [recommendations, setRecommendations] = useState([]);

  const saveForLater = async (item) => {
    try {
      await api.post('/catalog/wishlist/', { product_id: item.product.id });
      await removeItem(item.id);
      toast?.success(`"${item.product.name}" saved to wishlist`);
    } catch { toast?.error('Failed to save item'); }
  };

  useEffect(() => {
    if (cart.items.length > 0) {
      const slug = cart.items[0].product.slug;
      api.get(`/catalog/products/${slug}/recommendations/`).then(res => {
        const cartIds = cart.items.map(i => i.product.id);
        setRecommendations((res.data || []).filter(p => !cartIds.includes(p.id)).slice(0, 4));
      }).catch(() => {});
    }
  }, [cart.items.length]);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-24 text-center">
        <span className="material-symbols-outlined text-[#c6c6cd] text-6xl mb-6 block">shopping_cart</span>
        <h1 className="font-headline text-3xl font-extrabold tracking-tighter mb-2">Your Selection is Empty</h1>
        <p className="text-[#45464d] mb-8">Browse our curated collection to find what you need.</p>
        <Link to="/catalog" className="bg-gradient-to-r from-[#191c1e] to-[#002113] text-white px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest">
          Explore Collection
        </Link>
      </div>
    );
  }

  const subtotal = parseFloat(cart.total);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 pt-12 pb-24">
      <div className="mb-12">
        <Link to="/catalog" className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#57657b] hover:opacity-70 transition-opacity">
          <span className="material-symbols-outlined text-sm">arrow_back</span>Continue Browsing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <div className="flex justify-between items-end mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter">Your Selection</h1>
            <span className="text-[#57657b] font-medium">{cart.item_count} Item{cart.item_count !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-12">
            {cart.items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-8 items-start group">
                <Link to={`/catalog/${item.product.slug}`} className="w-full sm:w-48 aspect-[3/4] bg-[#eceef0] overflow-hidden rounded-lg shrink-0">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#c6c6cd] text-4xl">menu_book</span>
                    </div>
                  )}
                </Link>
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/catalog/${item.product.slug}`} className="text-xl font-headline font-bold tracking-tight hover:text-[#497cff] transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-[#45464d] text-sm tracking-wide opacity-60 mt-0.5">{item.product.category_name || 'Resource'} &middot; {item.product.sku}</p>
                    </div>
                    <p className="text-xl font-headline font-bold">${item.subtotal}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center bg-[#f2f4f6] rounded-full px-4 py-2 gap-6">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="material-symbols-outlined text-sm text-[#45464d] hover:text-[#191c1e] transition-colors">remove</button>
                      <span className="font-medium text-sm w-4 text-center">{String(item.quantity).padStart(2, '0')}</span>
                      <button onClick={() => updateQuantity(item.id, Math.min(99, item.quantity + 1))}
                        className="material-symbols-outlined text-sm text-[#45464d] hover:text-[#191c1e] transition-colors">add</button>
                    </div>
                    <div className="flex items-center gap-4">
                      {user && (
                        <button onClick={() => saveForLater(item)}
                          className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#45464d] opacity-60 hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-base">favorite</span>Save
                        </button>
                      )}
                      <button onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#ba1a1a] opacity-60 hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-base">delete</span>Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
          <div className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
            <h2 className="font-headline text-lg font-bold tracking-tight mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm"><span className="text-[#57657b]">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#57657b]">Shipping</span><span className="font-medium text-[#009668]">Free</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#57657b]">Estimated Tax</span><span className="font-medium">${tax.toFixed(2)}</span></div>
            </div>
            <div className="pt-6 border-t border-[#c6c6cd]/20 mb-10">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-headline font-extrabold">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout"
              className="w-full block text-center bg-gradient-to-br from-[#191c1e] to-[#00174b] text-white py-5 rounded-lg font-bold tracking-tight hover:opacity-90 active:scale-[0.98] transition-all">
              Proceed to Checkout
            </Link>

            {/* Trust */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-[#f2f4f6]">
                <span className="material-symbols-outlined text-xl mb-2">encrypted</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-[#f2f4f6]">
                <span className="material-symbols-outlined text-xl mb-2">local_shipping</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-[#57657b] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              Est. delivery: <strong>{new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(Date.now() + 8 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-32">
          <h2 className="font-headline text-2xl font-extrabold tracking-tighter mb-10">Complete The Look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {recommendations.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </main>
  );
}
