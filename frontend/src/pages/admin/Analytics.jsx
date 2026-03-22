import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api/client';

const COLORS = ['#191c1e', '#009668', '#497cff', '#76777d', '#ba1a1a', '#005236'];

function Stat({ label, value, sub, highlight }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-[0_24px_40px_rgba(25,28,30,0.04)] ${highlight ? 'border-l-4 border-[#009668]' : ''}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#76777d]">{label}</p>
      <p className="font-headline text-2xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-[10px] text-[#76777d] mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#191c1e] text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="font-bold">{label}</p>
      {payload.map((p, i) => <p key={i}>{p.name}: {typeof p.value === 'number' && p.name.includes('evenue') ? `$${p.value.toFixed(2)}` : p.value}</p>)}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/analytics/dashboard/').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;
  if (!data) return <div className="text-center py-24 text-[#76777d]">Admin access required.</div>;

  const { overview, conversion_funnel, top_products, status_breakdown, daily_revenue, category_revenue } = data;

  const statusData = Object.entries(status_breakdown).map(([name, value]) => ({ name, value }));
  const funnelData = [
    { stage: 'Registered', count: conversion_funnel.registered_users },
    { stage: 'Purchased', count: conversion_funnel.users_with_orders },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Admin</p>
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">Analytics Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat label="Total Revenue" value={`$${overview.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="All time" highlight />
        <Stat label="Monthly Revenue" value={`$${overview.monthly_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Last 30 days" />
        <Stat label="Total Orders" value={overview.total_orders} sub={`${overview.monthly_orders} this month`} />
        <Stat label="Avg Order Value" value={`$${overview.avg_order_value.toFixed(2)}`} sub={`${overview.total_customers} customers`} />
      </div>

      {/* Revenue Chart + Funnel */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Revenue Trend</h2>
          {daily_revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={daily_revenue.map(d => ({ ...d, revenue: parseFloat(d.revenue) }))}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#191c1e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#191c1e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} stroke="#c6c6cd" />
                <YAxis tick={{ fontSize: 10 }} stroke="#c6c6cd" tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#191c1e" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-[#76777d] text-sm">No revenue data yet. Complete some orders to see trends.</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Order Status</h2>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] uppercase tracking-widest text-[#45464d] capitalize">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[#76777d] text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Top Products + Category */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Top Products by Units Sold</h2>
          {top_products.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top_products.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#c6c6cd" />
                <YAxis type="category" dataKey="product_name" width={120} tick={{ fontSize: 10 }} stroke="#c6c6cd" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_sold" name="Units Sold" fill="#191c1e" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[#76777d]">No sales data yet</p>}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <h2 className="font-headline font-bold text-lg mb-6">Revenue by Category</h2>
          {category_revenue.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={category_revenue.map(c => ({ ...c, revenue: parseFloat(c.revenue) }))} cx="50%" cy="50%" outerRadius={90} dataKey="revenue" nameKey="category" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {category_revenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {category_revenue.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] uppercase tracking-widest text-[#45464d]">{c.category}: ${parseFloat(c.revenue).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-[#76777d]">No data</p>}
        </div>
      </div>

      {/* Conversion Funnel Bar */}
      <div className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
        <h2 className="font-headline font-bold text-lg mb-2">Conversion Funnel</h2>
        <p className="text-sm text-[#76777d] mb-6">{conversion_funnel.conversion_rate}% of registered users have made a purchase</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={funnelData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#c6c6cd" />
            <YAxis type="category" dataKey="stage" width={80} tick={{ fontSize: 11, fontWeight: 700 }} stroke="#c6c6cd" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]} barSize={24}>
              {funnelData.map((_, i) => <Cell key={i} fill={i === 0 ? '#191c1e' : '#009668'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <Stat label="Products" value={overview.total_products} />
        <Stat label="Reviews" value={overview.total_reviews} />
        <Stat label="Customers" value={overview.total_customers} />
        <Stat label="Conversion" value={`${conversion_funnel.conversion_rate}%`} />
      </div>
    </main>
  );
}
