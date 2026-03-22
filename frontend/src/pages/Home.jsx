import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useToast } from '../store/ToastContext';

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#e6e8ea] rounded-lg aspect-[3/4] mb-4" />
      <div className="h-4 bg-[#e6e8ea] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#e6e8ea] rounded w-1/2" />
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subEmail, setSubEmail] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/catalog/products/').then(res => {
      const all = res.data.results || [];
      setFeatured(all.slice(0, 4));
      setBestsellers(all.filter(p => p.is_bestseller).slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
    api.get('/catalog/categories/').then(res => {
      setCategories((res.data.results || res.data || []).slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 pt-16 pb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-4">Evidence-Based Literacy</p>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-[#191c1e] leading-[1.05]">
              Resources That<br />Transform Reading
            </h1>
            <p className="text-[#45464d] leading-relaxed mt-6 max-w-md">
              Curated resources, professional development, and a community of literacy leaders — all grounded in the science of reading.
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/catalog" className="bg-gradient-to-r from-[#191c1e] to-[#002113] text-white px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] shadow-lg">
                Shop Resources
              </Link>
              <Link to="/community" className="bg-[#f2f4f6] text-[#191c1e] px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#e6e8ea] transition-all">
                Join Community
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {featured.slice(0, 2).map(p => (
              <Link key={p.id} to={`/catalog/${p.slug}`} className="aspect-[3/4] bg-[#f2f4f6] rounded-lg overflow-hidden group">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 pb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Browse</p>
              <h2 className="font-headline text-3xl font-extrabold tracking-tighter">Shop by Category</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalog?category=${cat.slug}`}
                className="group p-6 bg-[#f2f4f6] rounded-lg hover:bg-[#e6e8ea] transition-all">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-2">{cat.name}</h3>
                <p className="text-xs text-[#45464d] line-clamp-2">{cat.description}</p>
                <p className="text-[10px] text-[#76777d] mt-3 uppercase tracking-widest">{cat.product_count} products</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">New Arrivals</p>
            <h2 className="font-headline text-3xl font-extrabold tracking-tighter">Featured Resources</h2>
          </div>
          <Link to="/catalog" className="text-[11px] font-bold uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] transition-colors">
            Explore All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 pb-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-2">Trending</p>
              <h2 className="font-headline text-3xl font-extrabold tracking-tighter">Bestsellers</h2>
            </div>
            <Link to="/catalog?bestseller=true" className="text-[11px] font-bold uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i + 4} />)}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="bg-[#f2f4f6] py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-headline text-3xl font-extrabold tracking-tighter mb-3">Stay in the Loop</h2>
          <p className="text-sm text-[#45464d] mb-8">
            Join 5,000+ literacy leaders receiving weekly insights and early access to new resources.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); if (subEmail) { toast?.success('Welcome aboard! Check your inbox.'); setSubEmail(''); } }}
            className="flex gap-2 max-w-md mx-auto">
            <input type="email" required value={subEmail} onChange={e => setSubEmail(e.target.value)}
              placeholder="ENTER EMAIL" className="flex-1 bg-[#e6e8ea] border-none rounded-md px-4 py-3 text-[11px] uppercase tracking-widest focus:ring-1 focus:ring-[#191c1e]" />
            <button type="submit" className="bg-[#191c1e] text-white px-8 py-3 text-[11px] font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
