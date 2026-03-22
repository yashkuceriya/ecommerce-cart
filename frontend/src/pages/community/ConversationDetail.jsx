import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../store/AuthContext';

export default function ConversationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

  const fetchConversation = () => {
    api.get(`/community/conversations/${id}/`).then(res => setConversation(res.data))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await api.post(`/community/conversations/${id}/messages/`, { content: newMessage });
      setNewMessage('');
      fetchConversation();
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div></div>;
  if (!conversation) return <div className="text-center py-20 text-gray-500">Conversation not found</div>;

  const others = conversation.participants.filter(p => p.id !== user?.id);
  const primaryOther = others[0];
  const headerName = others.map(p => `${p.first_name} ${p.last_name}`.trim()).join(', ');

  return (
    <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-gray-100 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-indigo-600">
            {(primaryOther?.first_name?.[0] || '?').toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{headerName || 'Conversation'}</h2>
          <p className="text-xs text-gray-400">{conversation.participants.length} participants</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 border-x border-gray-100 overflow-y-auto px-6 py-4 space-y-4">
        {conversation.messages.map(msg => {
          const isMe = msg.sender === user?.id;
          return (
            <div key={msg.id}>
              {/* Timestamp divider - show for first message or time gaps */}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMe && (
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mb-1">
                    <span className="text-xs font-bold text-indigo-600">
                      {(msg.sender_name?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.is_flagged ? '' : ''}`}>
                  {!isMe && (
                    <p className="text-[11px] text-gray-500 font-medium mb-1 ml-1">{msg.sender_name}</p>
                  )}
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.is_flagged
                      ? 'bg-red-50 border border-red-200 text-gray-800'
                      : isMe
                        ? 'bg-indigo-700 text-white rounded-br-md'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 mx-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {msg.is_flagged && <span className="text-red-500 mr-1">Flagged</span>}
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white rounded-b-xl border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-gray-500">
            {(user?.first_name?.[0] || '?').toUpperCase()}
          </span>
        </div>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
          placeholder="Post a message to your network..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        <button type="submit" disabled={sending || !newMessage.trim()}
          className="bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-800 transition disabled:opacity-50 flex items-center gap-1.5">
          Send
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
