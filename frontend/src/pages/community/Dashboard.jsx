import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import api from '../../api/client';

export default function CommunityDashboard() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);

  useEffect(() => {
    api.get('/community/profile/').then(() => setHasProfile(true))
      .catch(() => setHasProfile(false));
    api.get('/community/directory/').then(res => {
      setRecentMembers((res.data.results || res.data || []).slice(0, 5));
    }).catch(() => {});
  }, []);

  const cards = [
    {
      to: '/community/profile', title: 'My Profile',
      desc: 'Update your credentials, bio, and educational impact milestones to showcase your experience.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      ),
    },
    {
      to: '/community/matches', title: 'Find Matches',
      desc: 'Connect with mentors and collaborators who share your vision for literacy advancement.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      to: '/community/messages', title: 'Messages',
      desc: 'Engage in private conversations with your literacy network and coordinate community events.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      to: '/community/directory', title: 'Member Directory',
      desc: 'Browse the full ecosystem of educators, leaders, and advocates within the community.',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-[#4338ca] via-[#3730a3] to-[#1e1b4b] text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || user?.username}!</h1>
          <p className="text-indigo-200 text-sm max-w-lg">
            Continue your journey in advancing global literacy. Your community impact dashboard is updated and ready.
          </p>
          <Link to="/community/matches" className="inline-block mt-4 bg-white text-indigo-900 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition">
            View Recent Activity
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile CTA */}
        {hasProfile === false && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Complete Your Profile</p>
                <p className="text-xs text-gray-500">Add your expertise and location to help other literacy leaders find and match with you.</p>
              </div>
            </div>
            <Link to="/community/profile" className="bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-800 transition whitespace-nowrap">
              Start Now
            </Link>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {cards.map(item => (
            <Link key={item.to} to={item.to}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Community Members */}
        {recentMembers.length > 0 && (
          <section>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Community Members</h2>
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {(member.user.first_name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.user.first_name} {member.user.last_name}</p>
                    <p className="text-xs text-gray-500">{member.title}{member.district ? ` · ${member.district.name}, ${member.district.state}` : ''}</p>
                  </div>
                  {member.problem_statements?.slice(0, 2).map(ps => (
                    <span key={ps.id} className="hidden sm:inline bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded">{ps.title}</span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
