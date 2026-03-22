import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../store/AuthContext';

export default function ConversationList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/community/conversations/').then(res => {
      setConversations(res.data.results || res.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">{conversations.length} conversations</p>
        </div>
        <Link to="/community/matches" className="bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-800 transition">
          New Conversation
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <p className="text-gray-700 font-medium">No conversations yet</p>
          <Link to="/community/matches" className="text-indigo-700 text-sm font-medium hover:underline mt-2 inline-block">
            Find matches to start a conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const others = conv.participants.filter(p => p.id !== user?.id);
            const primaryOther = others[0];
            const otherNames = others.map(p => `${p.first_name} ${p.last_name}`.trim() || 'Unknown').join(', ');
            return (
              <Link key={conv.id} to={`/community/messages/${conv.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600">
                      {(primaryOther?.first_name?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{otherNames}</p>
                    {conv.last_message && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message.content}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
