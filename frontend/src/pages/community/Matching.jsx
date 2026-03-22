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
      .catch(err => {
        if (err.response?.status === 400) navigate('/community/profile');
      }).finally(() => setLoading(false));
  }, [navigate]);

  const startConversation = async (userId) => {
    try {
      const { data } = await api.post('/community/conversations/create/', { user_id: userId });
      navigate(`/community/messages/${data.id}`);
    } catch {
      alert('Failed to start conversation');
    }
  };

  // Client-side filtering
  const filtered = matches.filter(m => {
    if (searchQuery) {
      const name = `${m.profile.user.first_name} ${m.profile.user.last_name}`.toLowerCase();
      if (!name.includes(searchQuery.toLowerCase())) return false;
    }
    if (localeFilter && m.profile.district?.locale !== localeFilter) return false;
    if (minScore > 0 && m.score < minScore / 100) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar — now functional */}
      <aside className="hidden lg:block w-56 bg-[#1a1150] text-white p-6 shrink-0">
        <p className="text-xs font-semibold tracking-widest text-indigo-300 uppercase mb-1">Filters</p>
        <p className="text-[11px] text-indigo-400 mb-6">Refine your matches</p>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2 block">Search</label>
            <input type="text" placeholder="Search by name..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2 block">Locale</label>
            <select value={localeFilter} onChange={e => setLocaleFilter(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="">All Locales</option>
              {['city_large','city_midsize','city_small','suburban_large','suburban_midsize','suburban_small','town_fringe','town_distant','town_remote','rural_fringe','rural_distant','rural_remote'].map(l => (
                <option key={l} value={l}>{l.replace('_', ': ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2 block">Min Score: {minScore}%</label>
            <input type="range" min="0" max="100" step="5" value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-500" />
          </div>

          {(searchQuery || localeFilter || minScore > 0) && (
            <button onClick={() => { setSearchQuery(''); setLocaleFilter(''); setMinScore(0); }}
              className="w-full text-xs text-indigo-300 hover:text-white py-2 border border-white/10 rounded-lg transition">
              Clear Filters
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 px-6 py-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Matches</h1>
          <p className="text-sm text-gray-500 mb-8">
            {filtered.length} leader{filtered.length !== 1 ? 's' : ''} facing similar challenges
            {filtered.length !== matches.length && ` (${matches.length} total)`}
          </p>

          {/* Mobile filters */}
          <div className="lg:hidden flex flex-wrap gap-2 mb-6">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm flex-1 min-w-[120px]" />
            <select value={localeFilter} onChange={e => setLocaleFilter(e.target.value)} className="border rounded-xl px-3 py-2 text-sm">
              <option value="">All Locales</option>
              <option value="city_large">City: Large</option>
              <option value="suburban_large">Suburban: Large</option>
              <option value="rural_fringe">Rural: Fringe</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-gray-700 font-medium">No matches found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((match, i) => {
                const pct = Math.round(match.score * 100);
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-indigo-600">
                          {(match.profile.user.first_name?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {match.profile.user.first_name} {match.profile.user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                              {match.profile.title}
                              {match.profile.district && (
                                <>
                                  <span className="text-gray-300">&middot;</span>
                                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-medium">
                                    {match.profile.district.locale_display || match.profile.district.locale}
                                  </span>
                                </>
                              )}
                            </p>
                            {match.profile.district && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {match.profile.district.name}, {match.profile.district.state}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-3xl font-bold text-indigo-700">{pct}%</span>
                            <span className="text-xs text-gray-400 block">match</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3 flex-wrap">
                          <span className="bg-indigo-50 text-indigo-700 text-[11px] px-2.5 py-1 rounded-lg font-medium">
                            Problems: {Math.round(match.problem_score * 100)}%
                          </span>
                          {match.semantic_score !== null && (
                            <span className="bg-purple-50 text-purple-700 text-[11px] px-2.5 py-1 rounded-lg font-medium">
                              Semantic: {Math.round(match.semantic_score * 100)}%
                            </span>
                          )}
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-lg font-medium">
                            Demographics: {Math.round(match.demographic_score * 100)}%
                          </span>
                        </div>

                        {match.profile.problem_statements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {match.profile.problem_statements.map(ps => (
                              <span key={ps.id} className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded">{ps.title}</span>
                            ))}
                          </div>
                        )}

                        <button onClick={() => startConversation(match.profile.user.id)}
                          className="mt-4 w-full bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-800 transition flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                          </svg>
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
