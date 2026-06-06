import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesApi } from '../api/messages';
import type { Conversation, Message } from '../types/api';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const STORAGE_URL = 'http://localhost:8081';

function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${STORAGE_URL}${normalized}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Send: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M13.5 1.5L6.5 8.5M13.5 1.5L9 13.5l-2.5-5-5-2.5 12-4.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  User: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13c0-2.761 2.462-5 5.5-5s5.5 2.239 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Check: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  CheckDouble: () => (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
      <path d="M1 5.5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5l2.5 2.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.5 3l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Image: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1.5" y="1.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="5" r="1" fill="currentColor" />
      <path d="M1.5 10l3.5-3.5 2.5 2.5 2-2 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Empty: () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M16 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="21" r="1.5" fill="currentColor" />
      <circle cx="28" cy="21" r="1.5" fill="currentColor" />
    </svg>
  ),
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, photo, size = 36 }: { name?: string; photo?: string | null; size?: number }) {
  const imgUrl = getImageUrl(photo ?? null);
  // Affiche les initiales à partir du nom complet (ex: "Farah Farah" → "FF")
  const initials = (name ?? '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center text-white font-bold"
        style={{ background: 'linear-gradient(135deg, #C0001B, #8B0013)', fontSize: size * 0.38 }}
      >
        {imgUrl
          ? <img src={imgUrl} alt={name} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          : initials}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSidebarTime(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "À l'instant";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatMsgTime(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Affiche le nom reçu du backend (participantName / senderName / receiverName).
 * Le backend Spring Boot construit déjà "firstName + lastName" côté serveur.
 * On fait juste un fallback minimal si la valeur est vide.
 */
function displayName(raw: string | null | undefined, fallbackId?: number | null): string {
  const trimmed = (raw ?? '').trim();
  if (trimmed) return trimmed;
  return fallbackId ? `Utilisateur ${fallbackId}` : 'Utilisateur';
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function MessagingPage() {
  const { partnerId: partnerIdParam } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();
  const { user: currentUser } = useUser();

  const currentUserId = currentUser?.id ? Number(currentUser.id) : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(
    partnerIdParam ? parseInt(partnerIdParam) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // La conversation active — participantName vient directement du backend
  const activeConv = conversations.find(c => c.participantId === activePartnerId);

  // ── 1. Chargement des conversations ───────────────────────────
  const loadConversations = useCallback(async (currentActiveId?: number | null) => {
    try {
      const convs = await messagesApi.getConversations();
      const activeId = currentActiveId ?? activePartnerId;
      const normalized = convs.map(c =>
        c.participantId === activeId ? { ...c, unreadCount: 0 } : c
      );
      setConversations(normalized);
    } catch (e) {
      console.error('[Messaging] Erreur chargement conversations:', e);
    }
  }, [activePartnerId]);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    loadConversations().finally(() => setLoadingConvs(false));
  }, []);

  // ── 2. Chargement des messages selon le partenaire ────────────
  const loadMessages = useCallback(async (pid: number) => {
    setLoadingMsgs(true);
    try {
      const msgs = await messagesApi.getConversation(pid);
      setMessages(msgs);
      setConversations(prev =>
        prev.map(c => c.participantId === pid ? { ...c, unreadCount: 0 } : c)
      );
    } catch (e) {
      console.error('[Messaging] Erreur chargement messages:', e);
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (activePartnerId) loadMessages(activePartnerId);
  }, [activePartnerId]);

  // ── 3. URL param → activePartnerId ────────────────────────────
  useEffect(() => {
    if (!partnerIdParam) return;
    const pid = parseInt(partnerIdParam);
    if (!isNaN(pid)) setActivePartnerId(pid);
  }, [partnerIdParam]);

  // ── 4. Polling toutes les 5s ──────────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      await loadConversations(activePartnerId);
      if (activePartnerId) await loadMessages(activePartnerId);
    }, 5_000);
    return () => clearInterval(id);
  }, [activePartnerId, loadConversations, loadMessages]);

  // ── 5. Scroll vers le bas ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── 6. Sélectionner une conversation ──────────────────────────
  const selectConv = (conv: Conversation) => {
    setActivePartnerId(conv.participantId);
    setInput('');
    setConversations(prev =>
      prev.map(c => c.participantId === conv.participantId ? { ...c, unreadCount: 0 } : c)
    );
    navigate(`/messages/${conv.participantId}`, { replace: true });
  };

  // ── 7. Envoi d'un message ─────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || !activePartnerId || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    // Message optimiste
    const tempId = Date.now() * -1;
    const tempMsg: Message = {
      id: tempId,
      senderId: currentUserId as number,
      senderName: currentUser
        ? `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim()
        : 'Moi',
      receiverId: activePartnerId,
      receiverName: displayName(activeConv?.participantName, activePartnerId),
      content: text,
      isRead: false,
      sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const saved = await messagesApi.send(activePartnerId, text);
      setMessages(prev => prev.map(m => m.id === tempId ? saved : m));
      await loadConversations(activePartnerId);
    } catch (e) {
      console.error('[Messaging] Erreur envoi:', e);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, activePartnerId, sending, currentUserId, currentUser, activeConv, loadConversations]);

  const filteredConvs = conversations.filter(c =>
    displayName(c.participantName).toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder aux messages.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition border-none cursor-pointer"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // ─── Thème ────────────────────────────────────────────────────
  const sidebarBg   = dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const chatBg      = dm ? 'bg-gray-900' : 'bg-white';
  const headerBg    = dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const inputAreaBg = dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const textPrimary = dm ? 'text-gray-100' : 'text-gray-900';
  const textMuted   = dm ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={`flex flex-col min-h-screen w-full transition-colors duration-300 ${dm ? 'bg-gray-950' : 'bg-white'}`}
    >
      <Navbar />      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* ══ SIDEBAR ══ */}
        <aside
          className={`flex flex-col border-r transition-colors duration-300 ${sidebarBg}`}
          style={{ width: 300, minWidth: 300 }}
        >
          <div className="px-5 pt-5 pb-3">
            <h2
              className={`text-base font-extrabold mb-4 ${textPrimary}`}
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Messages
            </h2>
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-colors focus-within:border-red-300 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <span className={textMuted}><Icons.Search /></span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className={`flex-1 bg-transparent text-xs placeholder-gray-400 focus:outline-none ${dm ? 'text-gray-200' : 'text-gray-600'}`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 gap-3 ${textMuted}`}>
                <Icons.Empty />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs text-center px-6">Contactez un prestataire depuis une page service</p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const isActive = conv.participantId === activePartnerId;
                // ✅ participantName vient directement du backend Spring Boot
                const name = displayName(conv.participantName, conv.participantId);
                const time = formatSidebarTime(conv.lastMessageAt);
                const unread = conv.unreadCount ?? 0;

                return (
                  <button
                    key={conv.participantId}
                    onClick={() => selectConv(conv)}
                    className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all border-l-[3px] cursor-pointer border-none ${
                      isActive
                        ? dm ? 'bg-red-900/30 border-l-red-500' : 'bg-red-50 border-l-red-700'
                        : dm ? 'border-l-transparent hover:bg-gray-800' : 'border-l-transparent hover:bg-gray-50'
                    }`}
                  >
                    <Avatar name={name} photo={conv.participantPhoto} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        {/* ✅ Nom affiché tel que reçu du backend */}
                        <span className={`text-xs font-semibold truncate ${isActive ? 'text-red-600' : dm ? 'text-gray-200' : 'text-gray-800'}`}>
                          {name}
                        </span>
                        <span className={`text-[10px] flex-shrink-0 ml-2 ${textMuted}`}>{time}</span>
                      </div>
                      <p className={`text-[11px] truncate leading-relaxed ${textMuted}`}>
                        {conv.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="flex-shrink-0 bg-red-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center mt-1">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ══ ZONE CHAT ══ */}
        {!activePartnerId ? (
          <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${dm ? 'bg-gray-950 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${dm ? 'bg-gray-800' : 'bg-gray-100'}`}>💬</div>
            <p className={`text-base font-semibold ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
              Sélectionnez une conversation
            </p>
            <p className={`text-sm ${textMuted}`}>
              ou contactez un prestataire depuis une page service
            </p>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${chatBg}`}>

            {/* ── En-tête conversation ── */}
            <div className={`flex items-center justify-between px-8 py-4 border-b shadow-sm ${headerBg}`}>
              {activeConv ? (
                <div className="flex items-center gap-4">
                  <Avatar
                    name={displayName(activeConv.participantName, activeConv.participantId)}
                    photo={activeConv.participantPhoto}
                    size={44}
                  />
                  <div>
                    {/* ✅ Nom de la conversation depuis ConversationDTO.participantName */}
                    <p className={`font-bold text-sm leading-tight ${textPrimary}`}>
                      {displayName(activeConv.participantName, activeConv.participantId)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
                  <div className="w-32 h-3.5 bg-gray-100 rounded animate-pulse" />
                </div>
              )}
              {activeConv && (
                <button
                  onClick={() => navigate(`/profile/${activeConv.participantId}`)}
                  className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-2 rounded-xl transition-all cursor-pointer bg-transparent ${
                    dm
                      ? 'text-gray-400 border-gray-700 hover:text-red-400 hover:border-red-700'
                      : 'text-gray-500 border-gray-200 hover:text-red-700 hover:border-red-300'
                  }`}
                >
                  <Icons.User /> Voir le profil <Icons.ChevronRight />
                </button>
              )}
            </div>

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-8 py-6 space-y-1"
              style={{ background: dm ? '#0f172a' : '#fafafa' }}
            >
              {loadingMsgs ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full gap-3 py-16 ${textMuted}`}>
                  <span className="text-4xl">👋</span>
                  <p className="text-sm font-medium">Début de la conversation</p>
                  <p className="text-xs">Envoyez un message pour commencer</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  // ✅ senderId est un number (aligné avec MessageResponseDTO)
                  const isMe = msg.senderId === currentUserId;
                  const prevMsg = i > 0 ? messages[i - 1] : null;
                  const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
                  const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                  const isLastInGroup  = !nextMsg || nextMsg.senderId !== msg.senderId;
                  const marginTop = isFirstInGroup && i > 0 ? 'mt-4' : 'mt-0.5';

                  const bubbleRadius = isMe
                    ? isFirstInGroup && isLastInGroup ? 'rounded-2xl'
                      : isFirstInGroup ? 'rounded-2xl rounded-br-md'
                      : isLastInGroup  ? 'rounded-2xl rounded-tr-md'
                      : 'rounded-xl rounded-r-md'
                    : isFirstInGroup && isLastInGroup ? 'rounded-2xl'
                      : isFirstInGroup ? 'rounded-2xl rounded-bl-md'
                      : isLastInGroup  ? 'rounded-2xl rounded-tl-md'
                      : 'rounded-xl rounded-l-md';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${marginTop}`}
                    >
                      {/* Avatar de l'interlocuteur — affiché seulement sur le dernier msg du groupe */}
                      {!isMe && (
                        <div className="w-7 flex-shrink-0 self-end mb-0.5">
                          {isLastInGroup ? (
                            <Avatar
                              name={displayName(activeConv?.participantName, activeConv?.participantId)}
                              photo={activeConv?.participantPhoto}
                              size={28}
                            />
                          ) : (
                            <div className="w-7" />
                          )}
                        </div>
                      )}

                      <div className={`flex flex-col gap-0.5 max-w-sm ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Bulle de message */}
                        <div className={`px-4 py-2.5 text-sm leading-relaxed break-words ${bubbleRadius} ${
                          isMe
                            ? 'bg-red-700 text-white shadow-sm'
                            : dm
                              ? 'bg-gray-700 text-gray-100 border border-gray-600 shadow-sm'
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                        }`}>
                          {msg.content}
                        </div>

                        {/* Heure + statut lu/non-lu */}
                        {isLastInGroup && (
                          <div className={`flex items-center gap-1 text-[10px] text-gray-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {formatMsgTime(msg.sentAt)}
                            {isMe && (
                              <span className={msg.isRead ? 'text-emerald-500' : 'text-gray-300'}>
                                {msg.isRead ? <Icons.CheckDouble /> : <Icons.Check />}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Zone de saisie ── */}
            <div className={`px-8 py-5 border-t ${inputAreaBg}`}>
              <div className="flex items-end gap-3">
                <div className={`flex-1 border rounded-2xl px-4 py-3 focus-within:border-red-300 transition-all ${
                  dm ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200 focus-within:bg-white'
                }`}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Écrivez votre message..."
                    rows={1}
                    className={`w-full bg-transparent text-sm placeholder-gray-400 focus:outline-none resize-none leading-relaxed ${dm ? 'text-gray-100' : 'text-gray-700'}`}
                    style={{ maxHeight: 120 }}
                  />
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${dm ? 'border-gray-700' : 'border-gray-100'}`}>
                    <button className="w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer border-none bg-transparent">
                      <Icons.Image />
                    </button>
                    <span className="text-[10px] text-gray-400 select-none">
                      Entrée pour envoyer · Maj+Entrée nouvelle ligne
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 bg-red-700 text-white rounded-xl flex items-center justify-center hover:bg-red-800 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0 mb-0.5 border-none"
                >
                  {sending
                    ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <Icons.Send />}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}