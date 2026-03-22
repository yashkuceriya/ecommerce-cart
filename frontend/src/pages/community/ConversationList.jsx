import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../store/AuthContext';

export default function ConversationList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { api.get('/community/conversations/').then(res => setConversations(res.data.results || res.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-16 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#76777d] mb-2">Community</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter">Messages</h1>
        </div>
        <Link to="/community/matches" className="bg-[#191c1e] text-white px-5 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">New</Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)]">
          <span className="material-symbols-outlined text-[#c6c6cd] text-5xl mb-4 block">forum</span>
          <p className="font-headline font-bold text-lg">No conversations yet</p>
          <Link to="/community/matches" className="text-[#497cff] text-sm hover:underline mt-2 inline-block">Find matches to start</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => {
            const others = conv.participants.filter(p => p.id !== user?.id);
            const primary = others[0];
            const names = others.map(p => `${p.first_name} ${p.last_name}`.trim()).join(', ');
            return (
              <Link key={conv.id} to={`/community/messages/${conv.id}`}
                className="block bg-white rounded-xl p-5 shadow-[0_24px_40px_rgba(25,28,30,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e6e8ea] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#45464d]">{(primary?.first_name?.[0] || '?').toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-sm">{names}</p>
                    {conv.last_message && <p className="text-xs text-[#76777d] truncate mt-0.5">{conv.last_message.content}</p>}
                  </div>
                  <span className="text-[10px] text-[#76777d] shrink-0">{new Date(conv.updated_at).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
