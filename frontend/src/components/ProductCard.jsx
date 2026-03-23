import { Link } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useToast } from '../store/ToastContext';

function StarRating({ rating, count }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-[#191c1e]' : 'text-[#c6c6cd]'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-[#76777d]">({count})</span>
    </div>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id);
    } catch (err) {
      toast?.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  return (
    <Link to={`/catalog/${product.slug}`} className="group cursor-pointer block">
      <div className="relative aspect-[3/4] bg-[#f2f4f6] rounded-lg overflow-hidden mb-4 transition-all duration-500 group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)]">
        {product.image ? (
          <img loading="lazy" decoding="async" width="400" height="533" src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#c6c6cd] text-5xl">menu_book</span>
          </div>
        )}
        {product.is_bestseller && (
          <div className="absolute top-4 left-4">
            <span className="bg-[#6ffbbe] text-[#002113] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">Bestseller</span>
          </div>
        )}
        {!product.is_bestseller && product.is_low_stock && product.in_stock && (
          <div className="absolute top-4 left-4">
            <span className="bg-[#6ffbbe] text-[#002113] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">Low Stock</span>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute top-4 left-4">
            <span className="bg-[#191c1e] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">Sold Out</span>
          </div>
        )}
        {product.compare_at_price && (
          <div className="absolute top-4 right-4">
            <span className="bg-[#191c1e] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">Sale</span>
          </div>
        )}
        {product.in_stock && (
          <button onClick={handleAdd}
            className="absolute bottom-4 right-4 bg-[#191c1e] text-white w-10 h-10 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-[#002113] active:scale-95 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex justify-between items-start gap-3 mt-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-headline font-bold text-sm group-hover:text-[#497cff] transition-colors leading-tight">{product.name}</h3>
          <p className="text-[10px] text-[#76777d] mt-1">{product.category_name || 'Resource'}</p>
          <StarRating rating={product.avg_rating} count={product.review_count} />
          {product.times_purchased > 50 && (
            <p className="text-[10px] text-[#76777d] mt-1">{product.times_purchased.toLocaleString()}+ purchased</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-headline font-bold text-lg">${product.price}</p>
          {product.compare_at_price && (
            <p className="text-xs text-[#76777d] line-through">${product.compare_at_price}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export { StarRating };
