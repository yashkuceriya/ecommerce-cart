import { useState, useEffect } from 'react';
import api from '../../api/client';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChart({ data, labelKey, valueKey, color = 'bg-indigo-600' }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-32 truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className={`${color} h-full rounded-full transition-all`}
              style={{ width: `${(d[valueKey] / max) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-700 w-16 text-right">
            {typeof d[valueKey] === 'number' && d[valueKey] % 1 !== 0 ? `$${d[valueKey].toFixed(0)}` : d[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/analytics/dashboard/').then(res => setData(res.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Unable to load analytics. Admin access required.</div>;

  const { overview, conversion_funnel, top_products, status_breakdown, daily_revenue, category_revenue } = data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Business intelligence and conversion metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`$${overview.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} sub="All time" />
        <StatCard label="Monthly Revenue" value={`$${overview.monthly_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} sub="Last 30 days" />
        <StatCard label="Total Orders" value={overview.total_orders} sub={`${overview.monthly_orders} this month`} />
        <StatCard label="Avg Order Value" value={`$${overview.avg_order_value.toFixed(2)}`} sub={`${overview.total_customers} customers`} />
      </div>

      {/* Conversion Funnel */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {[
              { label: 'Registered Users', value: conversion_funnel.registered_users, pct: 100 },
              { label: 'Made a Purchase', value: conversion_funnel.users_with_orders, pct: conversion_funnel.conversion_rate },
              { label: 'Total Orders', value: conversion_funnel.total_orders, pct: null },
            ].map((step, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{step.label}</span>
                  <span className="font-medium">{step.value}{step.pct !== null ? ` (${step.pct}%)` : ''}</span>
                </div>
                {step.pct !== null && (
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${step.pct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-2">
            {Object.entries(status_breakdown).map(([st, count]) => (
              <div key={st} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{st}</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Category Revenue */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Products</h2>
          {top_products.length > 0 ? (
            <BarChart data={top_products} labelKey="product_name" valueKey="total_sold" />
          ) : (
            <p className="text-sm text-gray-400">No order data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue by Category</h2>
          {category_revenue.length > 0 ? (
            <BarChart data={category_revenue} labelKey="category" valueKey="revenue" color="bg-emerald-600" />
          ) : (
            <p className="text-sm text-gray-400">No order data yet</p>
          )}
        </div>
      </div>

      {/* Daily Revenue */}
      {daily_revenue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h2>
          <div className="flex items-end gap-1 h-32">
            {daily_revenue.map((d, i) => {
              const max = Math.max(...daily_revenue.map(x => parseFloat(x.revenue)), 1);
              const height = (parseFloat(d.revenue) / max) * 100;
              return (
                <div key={i} className="flex-1 group relative">
                  <div className="bg-indigo-600 rounded-t hover:bg-indigo-500 transition"
                    style={{ height: `${Math.max(height, 2)}%` }} />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    {d.date}: ${parseFloat(d.revenue).toFixed(2)} ({d.orders} orders)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Products" value={overview.total_products} />
        <StatCard label="Reviews" value={overview.total_reviews} />
        <StatCard label="Customers" value={overview.total_customers} />
        <StatCard label="Conversion" value={`${conversion_funnel.conversion_rate}%`} />
      </div>
    </div>
  );
}
