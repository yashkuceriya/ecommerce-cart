import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div>
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-20">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-4">Our Mission</p>
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter max-w-2xl leading-[1.05]">Upstream Literacy</h1>
        <p className="text-lg text-[#45464d] mt-6 max-w-2xl leading-relaxed">
          We believe every child deserves access to evidence-based literacy instruction delivered by well-supported educators. We bridge the gap between research and classroom practice.
        </p>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-16 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: '5,000+', label: 'Literacy leaders served' },
            { num: '30+', label: 'States reached' },
            { num: '500+', label: 'Districts connected' },
          ].map(s => (
            <div key={s.label} className="bg-[#f2f4f6] rounded-xl p-8 text-center">
              <p className="font-headline text-4xl font-extrabold tracking-tighter">{s.num}</p>
              <p className="text-sm text-[#45464d] mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-16 pb-20">
        <h2 className="font-headline text-3xl font-extrabold tracking-tighter mb-10">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Curated Resources', desc: 'Every product is vetted by literacy experts and aligned with the science of reading.' },
            { title: 'Community Matching', desc: 'AI-powered matching connects you with district leaders facing similar challenges.' },
            { title: 'Professional Growth', desc: 'Coaching toolkits to PD courses — we support your development at every stage.' },
          ].map(item => (
            <div key={item.title} className="space-y-3">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest">{item.title}</h3>
              <p className="text-sm text-[#45464d] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f2f4f6] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-headline text-3xl font-extrabold tracking-tighter mb-4">Ready to get started?</h2>
          <div className="flex gap-3 justify-center mt-8">
            <Link to="/catalog" className="bg-[#191c1e] text-white px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all">Shop Resources</Link>
            <Link to="/register" className="bg-white text-[#191c1e] px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#e6e8ea] transition-all">Create Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
