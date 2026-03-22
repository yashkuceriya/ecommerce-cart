import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function CommunityProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [problemStatements, setProblemStatements] = useState([]);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtResults, setDistrictResults] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [form, setForm] = useState({
    title: '',
    years_in_role: '',
    challenge_description: '',
    is_public: true,
    problem_statement_ids: [],
    district_id: null,
  });

  useEffect(() => {
    Promise.all([
      api.get('/community/problem-statements/'),
      api.get('/community/profile/').catch(() => null),
    ]).then(([psRes, profileRes]) => {
      setProblemStatements(psRes.data);
      if (profileRes?.data?.id) {
        setIsNew(false);
        const p = profileRes.data;
        setForm({
          title: p.title || '',
          years_in_role: p.years_in_role || '',
          challenge_description: p.challenge_description || '',
          is_public: p.is_public,
          problem_statement_ids: p.problem_statements.map(ps => ps.id),
          district_id: p.district?.id || null,
        });
        if (p.district) setSelectedDistrict(p.district);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (districtSearch.length < 2) { setDistrictResults([]); return; }
    const timeout = setTimeout(() => {
      api.get(`/community/districts/search/?q=${encodeURIComponent(districtSearch)}`).then(res => {
        setDistrictResults(res.data.results || res.data || []);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [districtSearch]);

  const toggleProblem = (id) => {
    setForm(f => ({
      ...f,
      problem_statement_ids: f.problem_statement_ids.includes(id)
        ? f.problem_statement_ids.filter(x => x !== id)
        : [...f.problem_statement_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/community/profile/', form);
      } else {
        await api.put('/community/profile/', form);
      }
      navigate('/community');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-1">Setup Your Profile</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Join the Community</h1>
      <p className="text-sm text-gray-500 mb-8">Help us tailor your experience and connect you with peers facing similar challenges in the literacy landscape.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* District */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your District</h2>
            <span className="text-xs text-gray-400 font-medium">Step 01</span>
          </div>
          {selectedDistrict ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-indigo-900">{selectedDistrict.name}</p>
                  <p className="text-sm text-indigo-600">{selectedDistrict.state} &middot; {selectedDistrict.locale_display || selectedDistrict.locale}</p>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Enrollment</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDistrict.enrollment?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">FRL%</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDistrict.frl_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">EL%</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDistrict.el_percentage}%</p>
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 bg-indigo-200 rounded-xl hidden sm:flex items-center justify-center shrink-0">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
                  </svg>
                </div>
              </div>
              <button type="button" onClick={() => { setSelectedDistrict(null); setForm(f => ({ ...f, district_id: null })); }}
                className="text-xs text-indigo-600 hover:underline font-medium ml-2">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input type="text" placeholder="Search your school district..." value={districtSearch}
                onChange={e => setDistrictSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              {districtResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {districtResults.map(d => (
                    <button key={d.id} type="button"
                      onClick={() => { setSelectedDistrict(d); setForm(f => ({ ...f, district_id: d.id })); setDistrictSearch(''); setDistrictResults([]); }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-900">{d.name}</span>
                      <span className="text-gray-500">, {d.state}</span>
                      <span className="text-xs text-gray-400 ml-2">{d.locale_display || d.locale}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* About You */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">About You</h2>
            <span className="text-xs text-gray-400 font-medium">Step 02</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Title / Role</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Literacy Coach" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Years in Role</label>
              <select value={form.years_in_role} onChange={e => setForm(f => ({ ...f, years_in_role: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="">Select...</option>
                <option value="1">Less than 1 year</option>
                <option value="2">1-3 years</option>
                <option value="5">3-5 years</option>
                <option value="8">5-10 years</option>
                <option value="15">10+ years</option>
              </select>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Focus Areas</h2>
            <span className="text-xs text-gray-400 font-medium">Step 03</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-sm">
              <div className={`relative w-10 h-5 rounded-full transition cursor-pointer ${form.is_public ? 'bg-indigo-600' : 'bg-gray-300'}`}
                onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_public ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-gray-700 font-medium">Public Profile</span>
            </label>
            <p className="text-xs text-gray-400">Your profile lets teachers find & match with you.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {problemStatements.map(ps => (
              <button key={ps.id} type="button" onClick={() => toggleProblem(ps.id)}
                className={`text-left p-4 rounded-xl border-2 transition ${
                  form.problem_statement_ids.includes(ps.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    form.problem_statement_ids.includes(ps.id)
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300'
                  }`}>
                    {form.problem_statement_ids.includes(ps.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{ps.title}</p>
                </div>
                <p className="text-xs text-gray-500 ml-6 line-clamp-2">{ps.description}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Describe Your Current Challenges
            </label>
            <textarea value={form.challenge_description} onChange={e => setForm(f => ({ ...f, challenge_description: e.target.value }))}
              rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Tell us more about the specific challenges your team is facing..." />
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-800 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
