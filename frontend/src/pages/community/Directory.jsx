import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', locale: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.state) params.set('state', filters.state);
    if (filters.locale) params.set('locale', filters.locale);
    if (filters.search) params.set('search', filters.search);

    api.get(`/community/directory/?${params}`).then(res => {
      setMembers(res.data.results || res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const startConversation = async (userId) => {
    try {
      const { data } = await api.post('/community/conversations/create/', { user_id: userId });
      navigate(`/community/messages/${data.id}`);
    } catch {
      alert('Failed to start conversation');
    }
  };

  const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Member Directory</h1>
      <p className="text-sm text-gray-500 mb-8">Browse the full community of literacy leaders</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <input type="text" placeholder="Search by name..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]" />
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.locale} onChange={e => setFilters(f => ({ ...f, locale: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="">All Locales</option>
          {['city_large','city_midsize','city_small','suburban_large','suburban_midsize','suburban_small','town_fringe','town_distant','town_remote','rural_fringe','rural_distant','rural_remote'].map(l => (
            <option key={l} value={l}>{l.replace('_', ': ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-1" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No members found matching your filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-indigo-600">
                    {(member.user.first_name?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{member.user.first_name} {member.user.last_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{member.title}</p>
                </div>
              </div>
              {member.district && (
                <p className="text-xs text-gray-400 mb-2">
                  {member.district.name}, {member.district.state}
                </p>
              )}
              {member.user.district_locale && (
                <span className="inline-block bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded mb-2">
                  {member.user.district_locale}
                </span>
              )}
              {member.problem_statements.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {member.problem_statements.slice(0, 2).map(ps => (
                    <span key={ps.id} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded">{ps.title}</span>
                  ))}
                  {member.problem_statements.length > 2 && (
                    <span className="text-[11px] text-gray-400">+{member.problem_statements.length - 2}</span>
                  )}
                </div>
              )}
              <button onClick={() => startConversation(member.user.id)}
                className="mt-3 text-xs text-indigo-700 font-medium hover:underline">Message</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
