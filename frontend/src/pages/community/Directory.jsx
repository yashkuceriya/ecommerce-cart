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
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/community/directory/?${params}`).then(res => setMembers(res.data.results || res.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const startConversation = async (userId) => {
    try { const { data } = await api.post('/community/conversations/create/', { user_id: userId }); navigate(`/community/messages/${data.id}`); } catch {}
  };

  const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Community</p>
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">Member Directory</h1>

      <div className="flex flex-wrap gap-3 mb-10">
        <input type="text" placeholder="Search by name..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm min-w-[200px] focus:ring-1 focus:ring-[#191c1e]" />
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}
          className="bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]">
          <option value="">All States</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.locale} onChange={e => setFilters(f => ({ ...f, locale: e.target.value }))}
          className="bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]">
          <option value="">All Locales</option>
          {['city_large','city_midsize','city_small','suburban_large','suburban_midsize','suburban_small','town_fringe','town_distant','town_remote','rural_fringe','rural_distant','rural_remote'].map(l => (
            <option key={l} value={l}>{l.replace('_', ': ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse bg-[#e6e8ea] rounded-xl h-40" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20"><span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">person_search</span><p className="font-headline font-bold">No members found</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-6 shadow-[0_24px_40px_rgba(25,28,30,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#e6e8ea] rounded-full flex items-center justify-center"><span className="text-sm font-bold text-[#45464d]">{(m.user.first_name?.[0] || '?').toUpperCase()}</span></div>
                <div className="min-w-0"><h3 className="font-headline font-bold text-sm">{m.user.first_name} {m.user.last_name}</h3><p className="text-xs text-[#76777d] truncate">{m.title}</p></div>
              </div>
              {m.district && <p className="text-xs text-[#76777d] mb-2">{m.district.name}, {m.district.state}</p>}
              {m.problem_statements.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.problem_statements.slice(0, 2).map(ps => <span key={ps.id} className="px-2 py-0.5 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">{ps.title}</span>)}
                  {m.problem_statements.length > 2 && <span className="text-[10px] text-[#76777d]">+{m.problem_statements.length - 2}</span>}
                </div>
              )}
              <button onClick={() => startConversation(m.user.id)} className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#497cff] hover:underline">Message</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
