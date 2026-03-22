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
    Promise.all([
      api.get('/moderation/dashboard/'),
      api.get('/moderation/flagged/'),
      api.get('/moderation/conversations/'),
    ]).then(([statsRes, flaggedRes, convsRes]) => {
      setStats(statsRes.data);
      setFlagged(flaggedRes.data);
      setConversations(convsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRemove = async (msgId) => {
    await api.post(`/moderation/remove/${msgId}/`, { reason: 'Removed by moderator' });
    fetchData();
  };

  const handleJoin = async (convId) => {
    await api.post(`/moderation/join/${convId}/`);
    navigate(`/community/messages/${convId}`);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderation Dashboard</h1>

      {stats && (
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: '👥' },
            { label: 'Conversations', value: stats.total_conversations, icon: '💬' },
            { label: 'Messages', value: stats.total_messages, icon: '📨' },
            { label: 'Flagged', value: stats.flagged_messages, icon: '🚩', highlight: true },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border p-5 ${s.highlight && s.value > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Flagged Messages ({flagged.length})</h2>
          {flagged.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">No flagged messages</div>
          ) : (
            <div className="space-y-3">
              {flagged.map(msg => (
                <div key={msg.id} className="bg-white rounded-xl border-l-4 border-red-500 border-r border-t border-b border-r-gray-100 border-t-gray-100 border-b-gray-100 p-4">
                  <p className="text-xs font-medium text-gray-900">{msg.sender_name}</p>
                  <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                  <button onClick={() => handleRemove(msg.id)}
                    className="mt-2 text-[11px] bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition">
                    Remove Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-4">Recent Conversations</h2>
          {conversations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            <div className="space-y-3">
              {conversations.map(conv => (
                <div key={conv.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.participants.map(p => `${p.first_name} ${p.last_name}`.trim()).join(', ')}
                    </p>
                    {conv.last_message && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message.content}</p>
                    )}
                  </div>
                  <button onClick={() => handleJoin(conv.id)}
                    className="text-[11px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition whitespace-nowrap ml-3">
                    Join Conversation
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
