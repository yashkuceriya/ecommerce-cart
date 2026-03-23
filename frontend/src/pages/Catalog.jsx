import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    ordering: searchParams.get('ordering') || '',
    bestseller: searchParams.get('bestseller') || '',
  });

  useEffect(() => {
    api.get('/catalog/categories/').then(res => setCategories(res.data.results || res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', page);
    api.get(`/catalog/products/?${params}`).then(res => {
      setProducts(res.data.results || []);
      setTotalCount(res.data.count || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / 20));
    }).catch(() => {}).finally(() => setLoading(false));
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) newParams.set(k, v); });
    if (page > 1) newParams.set('page', page);
    setSearchParams(newParams, { replace: true });
  }, [filters, page]);

  const updateFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 px-6 md:px-8 py-12">
        <div className="sticky top-28 space-y-10">
          <div>
            <h2 className="font-headline font-bold text-lg mb-6">The Collection</h2>
            <nav className="flex flex-col gap-1">
              <button onClick={() => updateFilter('category', '')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-xs tracking-wide text-left ${!filters.category ? 'bg-[#f2f4f6] text-[#002113] font-bold' : 'text-[#44474e] hover:bg-[#f2f4f6]'}`}>
                All Resources
              </button>
              {categories.map(c => (
                <button key={c.id} onClick={() => updateFilter('category', c.slug)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-xs tracking-wide text-left ${filters.category === c.slug ? 'bg-[#f2f4f6] text-[#002113] font-bold' : 'text-[#44474e] hover:bg-[#f2f4f6]'}`}>
                  {c.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h3 className="font-headline font-bold text-sm tracking-widest uppercase text-[#76777d]">Refine</h3>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-[#45464d] mb-2 block">Search</label>
              <input type="text" placeholder="Find resources..." value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-[#45464d] mb-2 block">Sort By</label>
              <select value={filters.ordering} onChange={e => updateFilter('ordering', e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]">
                <option value="">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-times_purchased">Most Popular</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Min $" value={filters.min_price} onChange={e => updateFilter('min_price', e.target.value)}
                className="w-1/2 bg-[#e6e8ea] border-none rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]" />
              <input type="number" placeholder="Max $" value={filters.max_price} onChange={e => updateFilter('max_price', e.target.value)}
                className="w-1/2 bg-[#e6e8ea] border-none rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]" />
            </div>
            {Object.values(filters).some(v => v) && (
              <button onClick={() => { setFilters({ category: '', search: '', min_price: '', max_price: '', ordering: '', bestseller: '' }); setPage(1); }}
                className="text-[11px] uppercase tracking-widest text-[#76777d] hover:text-[#191c1e] transition-colors">
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="flex-grow px-6 md:px-8 py-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-[#191c1e]">
              {filters.bestseller ? 'BESTSELLERS' : filters.category ? categories.find(c => c.slug === filters.category)?.name?.toUpperCase() || 'CATALOG' : 'ALL RESOURCES'}
            </h1>
            <p className="text-[#515f74] mt-2 text-sm">{totalCount} curated literacy resources.</p>
          </div>
          {/* Mobile sort */}
          <div className="lg:hidden">
            <select value={filters.ordering} onChange={e => updateFilter('ordering', e.target.value)}
              className="bg-[#e6e8ea] border-none rounded-lg px-3 py-2 text-xs">
              <option value="">Newest</option>
              <option value="price">Price: Low</option>
              <option value="-price">Price: High</option>
              <option value="-times_purchased">Popular</option>
            </select>
          </div>
        </div>

        {/* Mobile search */}
        <div className="lg:hidden mb-6">
          <input type="text" placeholder="Search..." value={filters.search} onChange={e => updateFilter('search', e.target.value)}
            className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-3 text-sm" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#e6e8ea] rounded-lg aspect-[3/4] mb-4" />
                <div className="h-4 bg-[#e6e8ea] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#e6e8ea] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
            {totalPages > 1 && (
              <div className="mt-24 flex items-center justify-center gap-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-colors ${page === i + 1 ? 'bg-[#191c1e] text-white' : 'hover:bg-[#eceef0]'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c6c6cd] hover:bg-[#eceef0] transition-colors disabled:opacity-30">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">search_off</span>
            <p className="text-lg font-headline font-bold">No products found</p>
            <p className="text-sm text-[#76777d] mt-1">Try adjusting your filters</p>
          </div>
        )}
      </section>
    </div>
  );
}
