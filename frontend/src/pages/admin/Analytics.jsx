import { useState, useEffect } from 'react';
import api from '../../api/client';

function Stat({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#76777d]">{label}</p>
      <p className="font-headline text-2xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-[10px] text-[#76777d] mt-0.5">{sub}</p>}
    </div>
  );
}

function Bar({ data, labelKey, valueKey }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-[#45464d] w-36 truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-[#f2f4f6] rounded-full h-4 overflow-hidden">
            <div className="bg-[#191c1e] h-full rounded-full transition-all" style={{ width: `${(d[valueKey] / max) * 100}%` }} />
          </div>
          <span className="text-xs font-bold w-16 text-right">{typeof d[valueKey] === 'number' && d[valueKey] % 1 !== 0 ? `$${d[valueKey].toFixed(0)}` : d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/orders/analytics/dashboard/').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;
  if (!data) return <div className="text-center py-24 text-[#76777d]">Admin access required.</div>;

  const { overview, conversion_funnel, top_products, status_breakdown, daily_revenue, category_revenue } = data;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Admin</p>
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat label="Total Revenue" value={`$${overview.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="All time" />
        <Stat label="Monthly Revenue" value={`$${overview.monthly_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Last 30 days" />
        <Stat label="Orders" value={overview.total_orders} sub={`${overview.monthly_orders} this month`} />
        <Stat label="Avg Order" value={`$${overview.avg_order_value.toFixed(2)}`} sub={`${overview.total_customers} customers`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Conversion Funnel</h2>
          {[
            ['Registered', conversion_funnel.registered_users, 100],
            ['Purchased', conversion_funnel.users_with_orders, conversion_funnel.conversion_rate],
          ].map(([label, val, pct]) => (
            <div key={label} className="mb-4">
              <div className="flex justify-between text-sm mb-1"><span className="text-[#45464d]">{label}</span><span className="font-bold">{val} ({pct}%)</span></div>
              <div className="bg-[#f2f4f6] rounded-full h-3 overflow-hidden"><div className="bg-[#191c1e] h-full rounded-full" style={{ width: `${pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Order Status</h2>
          {Object.entries(status_breakdown).map(([st, count]) => (
            <div key={st} className="flex justify-between items-center py-2 border-b border-[#f2f4f6] last:border-0">
              <span className="text-sm text-[#45464d] capitalize">{st}</span>
              <span className="px-3 py-1 bg-[#f2f4f6] text-[#191c1e] text-[10px] font-bold rounded-full uppercase tracking-widest">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Top Products</h2>
          {top_products.length > 0 ? <Bar data={top_products} labelKey="product_name" valueKey="total_sold" /> : <p className="text-sm text-[#76777d]">No data</p>}
        </div>
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Revenue by Category</h2>
          {category_revenue.length > 0 ? <Bar data={category_revenue} labelKey="category" valueKey="revenue" /> : <p className="text-sm text-[#76777d]">No data</p>}
        </div>
      </div>

      {daily_revenue.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Daily Revenue (30 Days)</h2>
          <div className="flex items-end gap-1 h-32">
            {daily_revenue.map((d, i) => {
              const max = Math.max(...daily_revenue.map(x => parseFloat(x.revenue)), 1);
              return (
                <div key={i} className="flex-1 group relative">
                  <div className="bg-[#191c1e] rounded-t hover:bg-[#002113] transition" style={{ height: `${Math.max((parseFloat(d.revenue) / max) * 100, 2)}%` }} />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#191c1e] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    ${parseFloat(d.revenue).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
