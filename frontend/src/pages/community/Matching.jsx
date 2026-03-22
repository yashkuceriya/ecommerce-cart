import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function Matching() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [minScore, setMinScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/community/matches/').then(res => setMatches(res.data))
      .catch(err => { if (err.response?.status === 400) navigate('/community/profile'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const startConversation = async (userId) => {
    try { const { data } = await api.post('/community/conversations/create/', { user_id: userId }); navigate(`/community/messages/${data.id}`); }
    catch { alert('Failed to start conversation'); }
  };

  const filtered = matches.filter(m => {
    if (searchQuery && !`${m.profile.user.first_name} ${m.profile.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (localeFilter && m.profile.district?.locale !== localeFilter) return false;
    if (minScore > 0 && m.score < minScore / 100) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 px-8 py-12 shrink-0">
        <div className="sticky top-28 space-y-10">
          <div>
            <h2 className="font-headline font-bold text-lg mb-6">Refine Matches</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] block">Search</label>
                <input type="text" placeholder="By name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] block">Locale</label>
                <select value={localeFilter} onChange={e => setLocaleFilter(e.target.value)}
                  className="w-full bg-[#e6e8ea] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#191c1e]">
                  <option value="">All</option>
                  {['city_large','city_midsize','city_small','suburban_large','suburban_midsize','suburban_small','town_fringe','town_distant','town_remote','rural_fringe','rural_distant','rural_remote'].map(l => (
                    <option key={l} value={l}>{l.replace('_', ': ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#515f74] block">Min Score: {minScore}%</label>
                <input type="range" min="0" max="100" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                  className="w-full accent-[#191c1e]" />
              </div>
              {(searchQuery || localeFilter || minScore > 0) && (
                <button onClick={() => { setSearchQuery(''); setLocaleFilter(''); setMinScore(0); }}
                  className="text-[11px] uppercase tracking-widest text-[#76777d] hover:text-[#191c1e] transition-colors">Clear Filters</button>
              )}
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-grow px-6 md:px-8 py-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-2">AI-Powered</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">Your Matches</h1>
          <p className="text-[#45464d] mb-10">{filtered.length} leader{filtered.length !== 1 ? 's' : ''} facing similar challenges</p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
              <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">group</span>
              <p className="font-headline font-bold text-lg">No matches found</p>
              <p className="text-sm text-[#76777d] mt-1">Try adjusting filters or wait for more members.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((match, i) => {
                const pct = Math.round(match.score * 100);
                return (
                  <div key={i} className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-[#e6e8ea] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xl font-headline font-extrabold text-[#45464d]">{(match.profile.user.first_name?.[0] || '?').toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-headline font-bold text-lg">{match.profile.user.first_name} {match.profile.user.last_name}</h3>
                            <p className="text-sm text-[#45464d]">{match.profile.title}</p>
                            {match.profile.district && (
                              <p className="text-xs text-[#76777d] mt-0.5">{match.profile.district.name}, {match.profile.district.state} · {match.profile.district.locale_display || match.profile.district.locale}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="font-headline text-3xl font-extrabold">{pct}%</span>
                            <p className="text-[10px] uppercase tracking-widest text-[#76777d]">match</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <span className="px-3 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">Problems {Math.round(match.problem_score * 100)}%</span>
                          {match.semantic_score !== null && <span className="px-3 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">Semantic {Math.round(match.semantic_score * 100)}%</span>}
                          <span className="px-3 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">Demo {Math.round(match.demographic_score * 100)}%</span>
                        </div>
                        {match.profile.problem_statements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {match.profile.problem_statements.map(ps => (
                              <span key={ps.id} className="px-2.5 py-0.5 bg-[#6ffbbe] text-[#002113] text-[10px] font-bold rounded-full uppercase tracking-widest">{ps.title}</span>
                            ))}
                          </div>
                        )}
                        <button onClick={() => startConversation(match.profile.user.id)}
                          className="mt-6 w-full bg-gradient-to-r from-[#191c1e] to-[#002113] text-white py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">send</span>Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
