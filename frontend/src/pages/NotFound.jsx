import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-8xl font-headline font-extrabold text-[#e6e8ea] mb-4">404</p>
        <h1 className="text-2xl font-headline font-extrabold tracking-tighter mb-2">Page not found</h1>
        <p className="text-sm text-[#45464d] mb-8">The page you're looking for doesn't exist.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="bg-[#191c1e] text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all">Home</Link>
          <Link to="/catalog" className="bg-[#f2f4f6] text-[#191c1e] px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-[#e6e8ea] transition-all">Catalog</Link>
        </div>
      </div>
    </div>
  );
}
