import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/catalog/wishlist/').then(res => setItems(res.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Wishlist</h1>
      <p className="text-sm text-[#45464d] mb-10">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">favorite</span>
          <p className="font-headline font-bold text-lg">Your wishlist is empty</p>
          <p className="text-sm text-[#76777d] mt-1 mb-6">Save items you love for later</p>
          <Link to="/catalog" className="bg-[#191c1e] text-white px-8 py-3 rounded-md font-bold text-sm uppercase tracking-widest">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </main>
  );
}
