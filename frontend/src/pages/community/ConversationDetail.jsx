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

  const fetch = () => api.get(`/community/conversations/${id}/`).then(res => setConversation(res.data)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); const i = setInterval(fetch, 10000); return () => clearInterval(i); }, [id]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation?.messages]);

  const handleSend = async (e) => {
    e.preventDefault(); if (!newMessage.trim()) return; setSending(true);
    try { await api.post(`/community/conversations/${id}/messages/`, { content: newMessage }); setNewMessage(''); fetch(); }
    catch {} finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191c1e]"></div></div>;
  if (!conversation) return <div className="text-center py-24 text-[#76777d]">Conversation not found</div>;

  const others = conversation.participants.filter(p => p.id !== user?.id);
  const primary = others[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-[0_24px_40px_rgba(25,28,30,0.04)] px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#e6e8ea] rounded-full flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#45464d]">{(primary?.first_name?.[0] || '?').toUpperCase()}</span>
        </div>
        <div>
          <h2 className="font-headline font-bold">{others.map(p => `${p.first_name} ${p.last_name}`.trim()).join(', ')}</h2>
          <p className="text-[10px] text-[#76777d] uppercase tracking-widest">{conversation.participants.length} participants</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-[#f2f4f6] border-x border-[#e6e8ea] overflow-y-auto px-6 py-6 space-y-4">
        {conversation.messages.map(msg => {
          const isMe = msg.sender === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div className="w-7 h-7 bg-[#e6e8ea] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#45464d]">{(msg.sender_name?.[0] || '?').toUpperCase()}</span>
                </div>
              )}
              <div className="max-w-[70%]">
                {!isMe && <p className="text-[10px] text-[#76777d] font-bold ml-1 mb-1">{msg.sender_name}</p>}
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.is_flagged ? 'bg-[#ffdad6] text-[#93000a]' :
                  isMe ? 'bg-[#191c1e] text-white rounded-br-md' : 'bg-white text-[#191c1e] rounded-bl-md shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <p className={`text-[10px] mt-1 mx-1 ${isMe ? 'text-right' : ''} text-[#76777d]`}>
                  {msg.is_flagged && <span className="text-[#ba1a1a] mr-1">Flagged</span>}
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white rounded-b-xl shadow-[0_-4px_40px_rgba(25,28,30,0.04)] p-4 flex items-center gap-3">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#f2f4f6] border-none rounded-full px-5 py-3 text-sm focus:ring-1 focus:ring-[#191c1e]" />
        <button type="submit" disabled={sending || !newMessage.trim()}
          className="bg-[#191c1e] text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30 flex items-center gap-1.5">
          Send <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
}
