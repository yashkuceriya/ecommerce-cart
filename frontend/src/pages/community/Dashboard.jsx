import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import api from '../../api/client';

export default function CommunityDashboard() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    api.get('/community/profile/').then(() => setHasProfile(true)).catch(() => setHasProfile(false));
    api.get('/community/directory/').then(res => setRecentMembers((res.data.results || res.data || []).slice(0, 5))).catch(() => {});
  }, []);

  const cards = [
    { to: '/community/profile', icon: 'person', title: 'My Profile', desc: 'Update your credentials, district info, and literacy challenges.' },
    { to: '/community/matches', icon: 'group', title: 'Find Matches', desc: 'Connect with leaders facing similar challenges in similar districts.' },
    { to: '/community/messages', icon: 'chat', title: 'Messages', desc: 'Private conversations with your literacy network.' },
    { to: '/community/directory', icon: 'groups', title: 'Directory', desc: 'Browse the full community of educators and leaders.' },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <div className="mb-12">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#009668] mb-2">Community</p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tighter">Welcome back, {user?.first_name || user?.username}</h1>
        <p className="text-[#45464d] mt-2">Your literacy leadership dashboard.</p>
      </div>

      {hasProfile === false && (
        <div className="bg-[#6ffbbe] rounded-xl p-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#002113] text-2xl">person_add</span>
            <div>
              <p className="font-headline font-bold text-[#002113]">Complete Your Profile</p>
              <p className="text-sm text-[#005236]">Help other literacy leaders find and match with you.</p>
            </div>
          </div>
          <Link to="/community/profile" className="bg-[#002113] text-white px-6 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">Start Now</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {cards.map(item => (
          <Link key={item.to} to={item.to} className="group bg-white rounded-xl p-8 shadow-[0_24px_40px_rgba(25,28,30,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] transition-all">
            <span className="material-symbols-outlined text-2xl text-[#191c1e] mb-4 block">{item.icon}</span>
            <h3 className="font-headline font-bold text-lg mb-1">{item.title}</h3>
            <p className="text-sm text-[#45464d]">{item.desc}</p>
          </Link>
        ))}
      </div>

      {recentMembers.length > 0 && (
        <section>
          <h2 className="font-headline text-2xl font-extrabold tracking-tighter mb-6">Community Members</h2>
          <div className="space-y-3">
            {recentMembers.map(m => (
              <div key={m.id} className="bg-white rounded-xl p-5 shadow-[0_24px_40px_rgba(25,28,30,0.04)] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#e6e8ea] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#45464d]">{(m.user.first_name?.[0] || '?').toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm">{m.user.first_name} {m.user.last_name}</p>
                  <p className="text-xs text-[#76777d]">{m.title}{m.district ? ` · ${m.district.name}, ${m.district.state}` : ''}</p>
                </div>
                {m.problem_statements?.slice(0, 2).map(ps => (
                  <span key={ps.id} className="hidden sm:inline px-3 py-1 bg-[#f2f4f6] text-[#45464d] text-[10px] font-bold rounded-full uppercase tracking-widest">{ps.title}</span>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
