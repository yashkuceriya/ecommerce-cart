import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import ProductCard, { StarRating } from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/catalog/products/${slug}/`).then(res => {
      setProduct(res.data);
      api.get(`/catalog/products/${slug}/recommendations/`).then(r => setRelated(r.data || [])).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    try {
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to add');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
        <div className="grid md:grid-cols-12 gap-20 animate-pulse">
          <div className="md:col-span-7"><div className="bg-[#e6e8ea] rounded-lg aspect-[4/5]" /></div>
          <div className="md:col-span-5 space-y-4 pt-8">
            <div className="h-10 bg-[#e6e8ea] rounded w-3/4" />
            <div className="h-6 bg-[#e6e8ea] rounded w-1/3" />
            <div className="h-4 bg-[#e6e8ea] rounded w-full mt-8" />
            <div className="h-4 bg-[#e6e8ea] rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="text-center py-24 text-[#76777d]">Product not found</div>;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-12 text-[#57657b] text-xs uppercase tracking-widest">
        <Link to="/catalog" className="hover:text-[#191c1e] transition-colors">Catalog</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        {product.category_name && (
          <>
            <span>{product.category_name}</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </>
        )}
        <span className="text-[#191c1e] font-bold">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-start">
        {/* Image Grid (Bento Style) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <div className="col-span-2 overflow-hidden rounded-lg bg-[#f2f4f6] aspect-[4/5] relative group">
            {product.image ? (
              <img src={product.image} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c6c6cd] text-6xl">menu_book</span>
              </div>
            )}
            {product.is_bestseller && (
              <div className="absolute top-6 left-6">
                <span className="bg-[#6ffbbe] text-[#002113] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Bestseller</span>
              </div>
            )}
            {product.is_low_stock && product.in_stock && !product.is_bestseller && (
              <div className="absolute top-6 left-6">
                <span className="bg-[#6ffbbe] text-[#002113] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 0 ? (
            product.images.slice(0, 2).map(img => (
              <div key={img.id} className="overflow-hidden rounded-lg bg-[#f2f4f6] aspect-square">
                <img src={img.image} alt={img.alt_text} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <>
              <div className="overflow-hidden rounded-lg bg-[#f2f4f6] aspect-square flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c6c6cd] text-4xl">auto_stories</span>
              </div>
              <div className="overflow-hidden rounded-lg bg-[#f2f4f6] aspect-square flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c6c6cd] text-4xl">school</span>
              </div>
            </>
          )}
        </div>

        {/* Product Details — Sticky */}
        <div className="md:col-span-5 sticky top-32">
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-[#191c1e] mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="font-headline text-2xl text-[#45464d] font-light">${product.price}</p>
                {product.compare_at_price && (
                  <>
                    <p className="text-lg text-[#c6c6cd] line-through">${product.compare_at_price}</p>
                    <span className="bg-[#6ffbbe] text-[#002113] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Save ${(product.compare_at_price - product.price).toFixed(0)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#009668]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-medium text-[#009668]">
                  {product.in_stock ? `In Stock — ${product.stock_quantity} available` : 'Out of Stock'}
                </span>
              </div>
              {product.avg_rating && <StarRating rating={product.avg_rating} count={product.review_count} />}
              {product.times_purchased > 0 && (
                <p className="text-xs text-[#76777d]">{product.times_purchased.toLocaleString()} educators purchased this</p>
              )}
              <p className="text-[#45464d] leading-relaxed text-sm">{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#45464d] mb-3">Quantity</label>
                <div className="flex items-center bg-[#e6e8ea] rounded-md h-12 w-32 px-4 justify-between">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="material-symbols-outlined text-[#45464d] text-sm">remove</button>
                  <span className="font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(99, q + 1))} className="material-symbols-outlined text-[#45464d] text-sm">add</button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4 pt-4">
              <button onClick={handleAdd} disabled={!product.in_stock}
                className={`w-full h-14 rounded-md font-bold text-sm uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  added ? 'bg-[#009668] text-white' :
                  product.in_stock
                    ? 'bg-gradient-to-r from-[#191c1e] to-[#002113] text-white hover:opacity-90'
                    : 'bg-[#e6e8ea] text-[#76777d] cursor-not-allowed'
                }`}>
                {added ? (
                  <><span className="material-symbols-outlined text-lg">check</span>Added to Cart</>
                ) : (
                  <>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</>
                )}
              </button>
              <div className="flex gap-3">
                <button onClick={async () => { if (!product.in_stock) return; try { await addToCart(product.id, quantity); navigate('/checkout'); } catch {} }}
                  disabled={!product.in_stock}
                  className="flex-1 h-14 bg-[#f2f4f6] text-[#191c1e] font-bold text-sm uppercase tracking-widest rounded-md hover:bg-[#e6e8ea] transition-all disabled:opacity-40">
                  Buy Now
                </button>
                {user && (
                  <button onClick={async () => {
                    try {
                      if (wishlisted) { await api.delete('/catalog/wishlist/', { data: { product_id: product.id } }); setWishlisted(false); toast?.info('Removed from wishlist'); }
                      else { await api.post('/catalog/wishlist/', { product_id: product.id }); setWishlisted(true); toast?.success('Saved to wishlist'); }
                    } catch {}
                  }}
                    className={`h-14 w-14 rounded-md flex items-center justify-center transition-all ${wishlisted ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'}`}>
                    <span className="material-symbols-outlined" style={wishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                  </button>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#c6c6cd]/20">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Category</h4>
                <p className="text-xs text-[#45464d]">{product.category_name || 'Resource'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">SKU</h4>
                <p className="text-xs text-[#45464d]">{product.sku}</p>
              </div>
              {product.tags && (
                <div className="col-span-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-[#eceef0] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-32 max-w-3xl">
          <h2 className="font-headline text-3xl font-extrabold tracking-tighter mb-6">What Educators Say</h2>
          <div className="flex items-center gap-3 mb-10">
            <StarRating rating={product.avg_rating} count={product.review_count} />
            <span className="text-sm text-[#45464d]">{product.avg_rating} out of 5 &middot; {product.review_count} reviews</span>
          </div>
          <div className="space-y-8">
            {product.reviews.slice(0, 6).map(review => (
              <div key={review.id} className="border-b border-[#c6c6cd]/10 pb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#eceef0] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#45464d]">{(review.user_name?.[0] || '?').toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.user_name}</p>
                      {review.verified_purchase && (
                        <span className="text-[10px] text-[#009668] font-medium uppercase tracking-widest">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#76777d]">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex mb-2">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-[#191c1e]' : 'text-[#c6c6cd]'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-bold text-sm mb-1">{review.title}</p>
                <p className="text-sm text-[#45464d] leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {related.length > 0 && (
        <section className="mt-40">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline text-3xl font-extrabold tracking-tighter">Customers Also Bought</h2>
            <Link to="/catalog" className="text-xs font-bold uppercase tracking-widest text-[#45464d] hover:text-[#191c1e] transition-colors">Explore All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </main>
  );
}
