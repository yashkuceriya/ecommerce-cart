import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#f2f4f6] w-full py-20 px-6 md:px-16 mt-20 pt-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1440px] mx-auto">
        <div className="md:col-span-4">
          <div className="font-headline font-black text-xl text-[#191c1e] mb-6">UPSTREAM</div>
          <p className="text-[11px] uppercase tracking-widest text-[#44474e] max-w-xs leading-loose">
            Evidence-based literacy resources and a professional community for education leaders. Redefining how districts adopt the science of reading.
          </p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#191c1e]">Shop</h5>
          <ul className="space-y-2">
            {[
              ['/catalog', 'All Resources'],
              ['/catalog?bestseller=true', 'Bestsellers'],
              ['/catalog?category=curriculum-materials', 'Curriculum'],
              ['/catalog?category=assessment-tools', 'Assessment'],
            ].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-[#44474e] text-[11px] uppercase tracking-widest hover:underline decoration-[#009668] underline-offset-4 transition-opacity hover:opacity-80">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#191c1e]">Support</h5>
          <ul className="space-y-2">
            {[
              ['/order-lookup', 'Track Order'],
              ['/contact', 'Contact'],
              ['/about', 'About Us'],
            ].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-[#44474e] text-[11px] uppercase tracking-widest hover:underline decoration-[#009668] underline-offset-4 transition-opacity hover:opacity-80">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4 space-y-4">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-[#191c1e]">Newsletter</h5>
          <form onSubmit={e => e.preventDefault()} className="flex gap-2">
            <input type="email" placeholder="ENTER EMAIL" className="bg-[#e6e8ea] border-none rounded-md px-4 py-2.5 w-full text-[11px] focus:ring-1 focus:ring-[#191c1e]" />
            <button className="bg-[#191c1e] text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity">Join</button>
          </form>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-[#c6c6cd]/20 flex flex-col md:flex-row justify-between gap-4">
        <p className="text-[11px] uppercase tracking-widest text-[#44474e]">&copy; {new Date().getFullYear()} Upstream Literacy, Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/about" className="text-[#44474e] text-[11px] uppercase tracking-widest hover:underline decoration-[#009668] underline-offset-4">Terms</Link>
          <Link to="/about" className="text-[#44474e] text-[11px] uppercase tracking-widest hover:underline decoration-[#009668] underline-offset-4">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
