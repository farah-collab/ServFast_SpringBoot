import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { authApi } from '../api/auth';
import { messagesApi } from '../api/messages';
import type { Message, Conversation } from '../types/api';
import { useTheme } from '../context/ThemeContext';

interface LocationState {
  providerName?: string;
  providerPhoto?: string;
  serviceTitle?: string;
}

export default function MessagingPage() {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { darkMode: dm } = useTheme();
  const currentUser = authApi.getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const normalizeName = (raw?: string, fallback?: string) => {
    if (!raw) return fallback || 'Unknown User';
    const name = raw.trim().replace(/\s+/g, ' ');
    const lower = name.toLowerCase();
    if (!name || lower === 'null null' || lower === 'undefined undefined' || lower === 'null' || lower === 'undefined') {
      return fallback || 'Unknown User';
    }
    return name;
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(
    partnerId ? parseInt(partnerId) : null
  );
  const [activePartnerName, setActivePartnerName] = useState(state?.providerName || '');
  const [activePartnerPhoto, setActivePartnerPhoto] = useState(state?.providerPhoto || '');
  const [serviceContextTitle, setServiceContextTitle] = useState(state?.serviceTitle || '');

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    loadConversations();
  }, []);

  useEffect(() => {
    if (activePartnerId) loadMessages(activePartnerId);
  }, [activePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Polling: refresh BOTH messages AND conversations (for unread badge updates)
  useEffect(() => {
    if (!activePartnerId) return;
    const interval = setInterval(async () => {
      await loadMessages(activePartnerId);
      await loadConversations(activePartnerId); // pass active to reset its badge
    }, 5000);
    return () => clearInterval(interval);
  }, [activePartnerId]);

  const loadConversations = async (currentActiveId?: number) => {
    try {
      const convs = await messagesApi.getConversations();

      // ✅ Reset unread badge locally for the currently open conversation
      const activeId = currentActiveId ?? activePartnerId;
      const normalized = convs.map(c =>
        c.participantId === activeId ? { ...c, unreadCount: 0 } : c
      );

      setConversations(normalized);

      if (partnerId && !activePartnerId) {
        const pid = parseInt(partnerId);
        setActivePartnerId(pid);
        const conv = normalized.find(c => c.participantId === pid);
        if (conv) {
          setActivePartnerName(normalizeName(conv.participantName, `User ${pid}`));
          if (conv.participantPhoto) setActivePartnerPhoto(conv.participantPhoto);
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  };

  const loadMessages = async (pid: number) => {
    setLoading(true);
    try {
      const msgs = await messagesApi.getConversation(pid);
      setMessages(msgs);
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setActivePartnerId(conv.participantId);
    setActivePartnerName(normalizeName(conv.participantName, `User ${conv.participantId}`));
    if (conv.participantPhoto) setActivePartnerPhoto(conv.participantPhoto);
    setServiceContextTitle('');

    // ✅ Reset unread badge immediately on click (optimistic update)
    setConversations(prev =>
      prev.map(c => c.participantId === conv.participantId ? { ...c, unreadCount: 0 } : c)
    );

    navigate(`/messages/${conv.participantId}`, { replace: true });
  };

  const sendMessage = async () => {
    if (!content.trim() || !activePartnerId || sending) return;
    setSending(true);
    try {
      const msg = await messagesApi.send(activePartnerId, content.trim());
      setMessages(prev => [...prev, msg]);
      setContent('');
      // ✅ Refresh conversations to update lastMessage + sort order
      await loadConversations(activePartnerId);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const bg = dm ? 'bg-gray-900' : 'bg-gray-50';
  const card = dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const convHover = dm ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const convActive = dm ? 'bg-gray-700' : 'bg-red-50';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString();
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className={`rounded-2xl border overflow-hidden flex ${card}`} style={{ height: 'calc(100vh - 140px)' }}>

          {/* Left: Conversation list */}
          <div className={`w-72 flex-shrink-0 border-r flex flex-col ${dm ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`px-4 py-4 border-b ${dm ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-base font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>No conversations yet.</p>
                </div>
              ) : conversations.map(conv => {
                const displayName = normalizeName(conv.participantName, `User ${conv.participantId}`);
                return (
                <button
                  key={conv.participantId}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-none cursor-pointer ${
                    activePartnerId === conv.participantId ? convActive : convHover
                  } ${dm ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {conv.participantPhoto
                      ? <img src={conv.participantPhoto} alt="" className="w-full h-full object-cover" />
                      : displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-semibold truncate ${dm ? 'text-white' : 'text-gray-900'}`}>
                        {displayName}
                      </span>
                      {/* ✅ Badge unread — s'efface après ouverture */}
                      {conv.unreadCount > 0 && (
                        <span className="text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          {/* Right: Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activePartnerId ? (
              <>
                {/* Chat header */}
                <div className={`px-5 py-4 border-b flex items-center justify-between ${dm ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                      {activePartnerPhoto ? (
                        <img src={activePartnerPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        normalizeName(activePartnerName, activePartnerId ? `User ${activePartnerId}` : 'Unknown').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className={`block font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>
                        {normalizeName(activePartnerName, activePartnerId ? `User ${activePartnerId}` : 'Unknown')}
                      </span>
                      {serviceContextTitle && (
                        <span className={`block text-xs font-medium ${dm ? 'text-red-400' : 'text-red-700'}`}>
                          About: {serviceContextTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                  {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Start the conversation!</p>
                    </div>
                  ) : (() => {
                    let lastDate = '';
                    return messages.map(m => {
                      const isMine = m.senderId === currentUser?.id;
                      const msgDate = formatDate(m.sentAt);
                      const showDate = msgDate !== lastDate;
                      lastDate = msgDate;
                      return (
                        <div key={m.id}>
                          {showDate && (
                            <div className="flex justify-center my-3">
                              <span className={`text-xs px-3 py-1 rounded-full ${dm ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {msgDate}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                              isMine
                                ? 'bg-red-700 text-white rounded-br-sm'
                                : dm ? 'bg-gray-700 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}>
                              <p>{m.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-red-200' : dm ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatTime(m.sentAt)}
                                {isMine && <span className="ml-1">{m.isRead ? ' ✓✓' : ' ✓'}</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`px-5 py-4 border-t ${dm ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message... (Enter to send)"
                      rows={1}
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        dm ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                      style={{ maxHeight: '120px' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!content.trim() || sending}
                      className="w-11 h-11 bg-red-700 text-white rounded-xl flex items-center justify-center hover:bg-red-800 transition disabled:opacity-50 border-none cursor-pointer flex-shrink-0"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}