import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };

  useEffect(() => {
    if (!user) return;
    const f = () => api.get('/community/unread-count/').then(r => setUnreadCount(r.data.unread_count || 0)).catch(() => {});
    f(); const i = setInterval(f, 30000); return () => clearInterval(i);
  }, [user]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      api.get(`/catalog/search-suggestions/?q=${encodeURIComponent(searchQuery)}`).then(r => setSuggestions(r.data || [])).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); }
  };

  return (
    <header className="sticky top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 max-w-[1440px] mx-auto font-headline tracking-tight">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-[#0F172A]">UPSTREAM</Link>
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/catalog" className="text-[#44474e] hover:text-[#0F172A] transition-colors text-sm">Catalog</Link>
            {user && (
              <Link to="/community" className="relative text-[#44474e] hover:text-[#0F172A] transition-colors text-sm">
                Community
                {unreadCount > 0 && <span className="absolute -top-1.5 -right-3 w-2 h-2 bg-[#009668] rounded-full" />}
              </Link>
            )}
            <Link to="/about" className="text-[#44474e] hover:text-[#0F172A] transition-colors text-sm">About</Link>
            {user && ['moderator', 'admin'].includes(user.role) && (
              <>
                <Link to="/admin/moderation" className="text-[#44474e] hover:text-[#0F172A] transition-colors text-sm">Moderation</Link>
                <Link to="/admin/analytics" className="text-[#44474e] hover:text-[#0F172A] transition-colors text-sm">Analytics</Link>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[#e6e8ea] rounded-full px-4 py-2">
                <span className="material-symbols-outlined text-[#76777d] text-sm mr-2">search</span>
                <input autoFocus type="text" placeholder="Search resources..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-48" />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl overflow-hidden z-50">
                    {suggestions.map(s => (
                      <button key={s.slug} onClick={() => { navigate(`/catalog/${s.slug}`); setSearchOpen(false); setSearchQuery(''); setSuggestions([]); }}
                        className="block w-full text-left px-4 py-3 hover:bg-[#f2f4f6] text-sm">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-[#76777d] ml-2">${s.price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-all active:scale-95">
                <svg className="w-5 h-5 text-[#45464d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </button>
            )}
          </div>

          {user && (
            <Link to="/wishlist" className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-all active:scale-95">
              <svg className="w-5 h-5 text-[#45464d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
            </Link>
          )}

          <Link to="/cart" className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-all active:scale-95 relative">
            <svg className="w-5 h-5 text-[#45464d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.514m5.98-.514h9.002m0 0a3 3 0 015.98.514m-5.98-.514L7.5 14.25m11.002 0l1.006-3.77A1.125 1.125 0 0018.42 9H7.5m0 0L6.106 5.272" /></svg>
            {cart.item_count > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#009668] rounded-full" />}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-all active:scale-95">
                <svg className="w-5 h-5 text-[#45464d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-20 py-2 text-sm">
                    <div className="px-4 py-3 border-b border-[#f2f4f6]">
                      <p className="font-headline font-bold">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-[#76777d] truncate">{user.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-[#f2f4f6] transition-colors">Account</Link>
                    <Link to="/account/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-[#f2f4f6] transition-colors">Orders</Link>
                    <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-[#f2f4f6] transition-colors">Wishlist</Link>
                    {['community_member', 'admin'].includes(user.role) && (
                      <Link to="/community" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 hover:bg-[#f2f4f6] transition-colors">Community</Link>
                    )}
                    <hr className="my-1 border-[#f2f4f6]" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 hover:bg-[#f2f4f6] text-[#ba1a1a] transition-colors">Sign Out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/login" className="text-[#44474e] hover:text-[#0F172A] transition-colors">Sign In</Link>
              <Link to="/register" className="bg-[#191c1e] text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all">Register</Link>
            </div>
          )}

          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'} />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden px-6 pb-4 space-y-1 text-sm font-headline">
          <form onSubmit={(e) => { e.preventDefault(); if(searchQuery.trim()) { navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`); setMenuOpen(false); } }} className="mb-3">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-3 text-sm" />
          </form>
          <Link to="/catalog" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Catalog</Link>
          {user && <Link to="/community" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Community</Link>}
          <Link to="/cart" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Cart ({cart.item_count})</Link>
          <Link to="/order-lookup" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Track Order</Link>
          {user ? (
            <>
              <Link to="/account" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Account</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-[#ba1a1a]">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block py-2 text-[#44474e]" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
