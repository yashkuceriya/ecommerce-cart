import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function Moderation() {
  const [stats, setStats] = useState(null);
  const [flagged, setFlagged] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = () => {
    Promise.all([api.get('/moderation/dashboard/'), api.get('/moderation/flagged/'), api.get('/moderation/conversations/')])
      .then(([s, f, c]) => { setStats(s.data); setFlagged(f.data); setConversations(c.data); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleRemove = async (id) => { await api.post(`/moderation/remove/${id}/`, { reason: 'Removed by moderator' }); fetchData(); };
  const handleJoin = async (id) => { await api.post(`/moderation/join/${id}/`); navigate(`/community/messages/${id}`); };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Admin</p>
      <h1 className="font-headline text-4xl font-extrabold tracking-tighter mb-10">Moderation</h1>

      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {[['Users', stats.total_users], ['Conversations', stats.total_conversations], ['Messages', stats.total_messages], ['Flagged', stats.flagged_messages]].map(([l, v]) => (
            <div key={l} className={`bg-white rounded-xl p-6 shadow-[0_24px_40px_rgba(25,28,30,0.04)] ${l === 'Flagged' && v > 0 ? 'border-l-4 border-[#ba1a1a]' : ''}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#76777d]">{l}</p>
              <p className="font-headline text-3xl font-extrabold mt-1">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        <section>
          <h2 className="font-headline font-bold text-lg mb-6">Flagged Messages ({flagged.length})</h2>
          {flagged.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-[0_24px_40px_rgba(25,28,30,0.04)]"><span className="material-symbols-outlined text-[#c6c6cd] text-4xl mb-2 block">verified</span><p className="text-sm text-[#76777d]">All clear</p></div>
          ) : (
            <div className="space-y-4">
              {flagged.map(msg => (
                <div key={msg.id} className="bg-white rounded-xl p-5 border-l-4 border-[#ba1a1a] shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
                  <p className="text-sm font-bold">{msg.sender_name}</p>
                  <p className="text-sm text-[#45464d] mt-1">{msg.content}</p>
                  <p className="text-[10px] text-[#76777d] mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                  <button onClick={() => handleRemove(msg.id)} className="mt-3 bg-[#ffdad6] text-[#93000a] px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all">Remove</button>
                </div>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="font-headline font-bold text-lg mb-6">Recent Conversations</h2>
          {conversations.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-[0_24px_40px_rgba(25,28,30,0.04)]"><p className="text-sm text-[#76777d]">No conversations</p></div>
          ) : (
            <div className="space-y-4">
              {conversations.map(conv => (
                <div key={conv.id} className="bg-white rounded-xl p-5 shadow-[0_24px_40px_rgba(25,28,30,0.04)] flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{conv.participants.map(p => `${p.first_name} ${p.last_name}`.trim()).join(', ')}</p>
                    {conv.last_message && <p className="text-xs text-[#76777d] truncate mt-0.5">{conv.last_message.content}</p>}
                  </div>
                  <button onClick={() => handleJoin(conv.id)} className="bg-[#f2f4f6] text-[#191c1e] px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#e6e8ea] transition-all ml-3">Join</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
