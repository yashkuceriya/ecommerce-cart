import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import { ToastProvider } from './store/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderLookup from './pages/OrderLookup';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import CommunityDashboard from './pages/community/Dashboard';
import CommunityProfile from './pages/community/Profile';
import Matching from './pages/community/Matching';
import Directory from './pages/community/Directory';
import ConversationList from './pages/community/ConversationList';
import ConversationDetail from './pages/community/ConversationDetail';
import Moderation from './pages/admin/Moderation';
import { lazy, Suspense } from 'react';
const Analytics = lazy(() => import('./pages/admin/Analytics'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'Upstream Literacy — Evidence-Based Literacy Resources',
      '/catalog': 'Resource Catalog | Upstream Literacy',
      '/cart': 'Shopping Cart | Upstream Literacy',
      '/checkout': 'Secure Checkout | Upstream Literacy',
      '/login': 'Sign In | Upstream Literacy',
      '/register': 'Create Account | Upstream Literacy',
      '/account': 'My Account | Upstream Literacy',
      '/account/orders': 'Order History | Upstream Literacy',
      '/order-lookup': 'Track Order | Upstream Literacy',
      '/about': 'About Us | Upstream Literacy',
      '/contact': 'Contact Us | Upstream Literacy',
      '/wishlist': 'My Wishlist | Upstream Literacy',
      '/community': 'Community Dashboard | Upstream Literacy',
      '/community/profile': 'Community Profile | Upstream Literacy',
      '/community/matches': 'Your Matches | Upstream Literacy',
      '/community/directory': 'Member Directory | Upstream Literacy',
      '/community/messages': 'Messages | Upstream Literacy',
      '/admin/moderation': 'Moderation | Upstream Literacy',
    };
    document.title = titles[pathname] || 'Upstream Literacy';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <ScrollToTop />
              <PageTitle />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders/:orderNumber" element={<OrderConfirmation />} />
                  <Route path="/order-lookup" element={<OrderLookup />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/account/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />
                  <Route path="/community/profile" element={<ProtectedRoute><CommunityProfile /></ProtectedRoute>} />
                  <Route path="/community/matches" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
                  <Route path="/community/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
                  <Route path="/community/messages" element={<ProtectedRoute><ConversationList /></ProtectedRoute>} />
                  <Route path="/community/messages/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
                  <Route path="/admin/moderation" element={<ProtectedRoute adminOnly><Moderation /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>}><Analytics /></Suspense></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
