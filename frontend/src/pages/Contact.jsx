import { useState } from 'react';
import { useToast } from '../store/ToastContext';

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast?.success("Message sent! We'll respond within 24 hours.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-16 py-16">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-4">Get In Touch</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-6">Contact Us</h1>
          <p className="text-[#45464d] mb-10">Questions about resources, community, or an order? We're here to help.</p>
          <div className="space-y-8">
            {[
              { icon: 'email', title: 'Email', detail: 'support@upstreamliteracy.com', sub: 'We respond within 24 hours' },
              { icon: 'phone', title: 'Phone', detail: '(800) 555-0142', sub: 'Mon-Fri 9AM-5PM EST' },
              { icon: 'location_on', title: 'Address', detail: '123 Education Way, Suite 400', sub: 'Cambridge, MA 02142' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#191c1e]">{item.icon}</span>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-sm text-[#45464d]">{item.detail}</p>
                  <p className="text-xs text-[#76777d]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] space-y-5">
          {['name', 'email'].map(f => (
            <div key={f} className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">{f}</label>
              <input type={f === 'email' ? 'email' : 'text'} required value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
            </div>
          ))}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Subject</label>
            <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all">
              <option value="">Select topic...</option>
              <option>Order Support</option><option>Product Questions</option><option>Institutional Licensing</option><option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Message</label>
            <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5}
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
          </div>
          <button type="submit" className="w-full py-4 bg-[#191c1e] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all">Send Message</button>
        </form>
      </div>
    </main>
  );
}
