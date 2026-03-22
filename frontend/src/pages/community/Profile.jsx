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
  const [form, setForm] = useState({ title: '', years_in_role: '', challenge_description: '', is_public: true, problem_statement_ids: [], district_id: null });

  useEffect(() => {
    Promise.all([api.get('/community/problem-statements/'), api.get('/community/profile/').catch(() => null)])
      .then(([psRes, profileRes]) => {
        setProblemStatements(psRes.data);
        if (profileRes?.data?.id) {
          setIsNew(false);
          const p = profileRes.data;
          setForm({ title: p.title || '', years_in_role: p.years_in_role || '', challenge_description: p.challenge_description || '', is_public: p.is_public, problem_statement_ids: p.problem_statements.map(ps => ps.id), district_id: p.district?.id || null });
          if (p.district) setSelectedDistrict(p.district);
        }
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (districtSearch.length < 2) { setDistrictResults([]); return; }
    const t = setTimeout(() => { api.get(`/community/districts/search/?q=${encodeURIComponent(districtSearch)}`).then(res => setDistrictResults(res.data.results || res.data || [])); }, 300);
    return () => clearTimeout(t);
  }, [districtSearch]);

  const toggleProblem = (id) => setForm(f => ({ ...f, problem_statement_ids: f.problem_statement_ids.includes(id) ? f.problem_statement_ids.filter(x => x !== id) : [...f.problem_statement_ids, id] }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { if (isNew) await api.post('/community/profile/', form); else await api.put('/community/profile/', form); navigate('/community'); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-16 py-12">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-2">Setup</p>
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-2">{isNew ? 'Join' : 'Edit'} Community Profile</h1>
      <p className="text-sm text-[#45464d] mb-10">Connect with peers facing similar literacy challenges.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* District */}
        <section className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg">Your District</h2>
            <span className="text-[11px] uppercase tracking-widest text-[#76777d]">Step 01</span>
          </div>
          {selectedDistrict ? (
            <div className="bg-[#f2f4f6] rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-headline font-bold">{selectedDistrict.name}, {selectedDistrict.state}</p>
                  <p className="text-sm text-[#45464d]">{selectedDistrict.locale_display || selectedDistrict.locale}</p>
                  <div className="flex gap-8 mt-4">
                    {[['Enrollment', selectedDistrict.enrollment?.toLocaleString()], ['FRL%', `${selectedDistrict.frl_percentage}%`], ['EL%', `${selectedDistrict.el_percentage}%`]].map(([l, v]) => (
                      <div key={l}><p className="text-[10px] font-bold uppercase tracking-widest text-[#76777d]">{l}</p><p className="text-xl font-headline font-extrabold">{v}</p></div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => { setSelectedDistrict(null); setForm(f => ({ ...f, district_id: null })); }}
                  className="text-[11px] uppercase tracking-widest text-[#497cff] hover:underline font-bold">Change</button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input type="text" placeholder="Search your school district..." value={districtSearch} onChange={e => setDistrictSearch(e.target.value)}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
              {districtResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                  {districtResults.map(d => (
                    <button key={d.id} type="button" onClick={() => { setSelectedDistrict(d); setForm(f => ({ ...f, district_id: d.id })); setDistrictSearch(''); setDistrictResults([]); }}
                      className="block w-full text-left px-4 py-3 hover:bg-[#f2f4f6] text-sm border-b border-[#f2f4f6] last:border-0">
                      <span className="font-bold">{d.name}</span>, {d.state} <span className="text-[#76777d] text-xs ml-1">{d.locale_display || d.locale}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* About */}
        <section className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg">About You</h2>
            <span className="text-[11px] uppercase tracking-widest text-[#76777d]">Step 02</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Title / Role</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Literacy Coach"
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Years in Role</label>
              <select value={form.years_in_role} onChange={e => setForm(f => ({ ...f, years_in_role: e.target.value }))}
                className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all">
                <option value="">Select...</option>
                <option value="1">&lt; 1 year</option><option value="2">1-3 years</option><option value="5">3-5 years</option><option value="8">5-10 years</option><option value="15">10+ years</option>
              </select>
            </div>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg">Focus Areas</h2>
            <span className="text-[11px] uppercase tracking-widest text-[#76777d]">Step 03</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {problemStatements.map(ps => (
              <button key={ps.id} type="button" onClick={() => toggleProblem(ps.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${form.problem_statement_ids.includes(ps.id) ? 'border-[#191c1e] bg-[#f2f4f6]' : 'border-transparent bg-[#f2f4f6] hover:bg-[#e6e8ea]'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form.problem_statement_ids.includes(ps.id) ? 'border-[#191c1e] bg-[#191c1e]' : 'border-[#c6c6cd]'}`}>
                    {form.problem_statement_ids.includes(ps.id) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </div>
                  <p className="text-sm font-bold">{ps.title}</p>
                </div>
                <p className="text-xs text-[#45464d] ml-6 line-clamp-2">{ps.description}</p>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#515f74] ml-1 block">Describe Your Challenges</label>
            <textarea value={form.challenge_description} onChange={e => setForm(f => ({ ...f, challenge_description: e.target.value }))} rows={4}
              placeholder="What specific challenges is your team facing?"
              className="w-full bg-[#e6e8ea] border-none rounded-lg p-4 text-sm focus:ring-0 focus:bg-white transition-all" />
          </div>
        </section>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-10 h-5 rounded-full transition ${form.is_public ? 'bg-[#191c1e]' : 'bg-[#c6c6cd]'}`}
              onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_public ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium">Public Profile</span>
          </label>
          <button type="submit" disabled={saving}
            className="bg-gradient-to-r from-[#191c1e] to-[#002113] text-white px-10 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </main>
  );
}
