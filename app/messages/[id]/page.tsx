'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  formatChatDayLabel,
  formatChatTime,
  getChatThreadById,
  markThreadAsRead,
  sendChatMessage,
  subscribeToChatStore,
  type ChatMessage,
  type ChatThread,
} from '../../../services/chatStore';

type ChatText = {
  notFound: string;
  online: string;
  offline: string;
  placeholder: string;
  send: string;
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  red: '#ff2456',
  yellow: '#ffd629',
  cream: '#fffefa',
  bg: '#ffffff',
  soft: '#f8fbff',
  border: '#111111',
  muted: '#657080',
};

const chatTexts: Record<AppLanguage, ChatText> = {
  EN: {
    notFound: 'Chat not found',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Write a message...',
    send: 'Send',
  },
  ES: {
    notFound: 'Chat no encontrado',
    online: 'En línea',
    offline: 'Desconectado',
    placeholder: 'Escribe un mensaje...',
    send: 'Enviar',
  },
  RU: {
    notFound: 'Чат не найден',
    online: 'Онлайн',
    offline: 'Не в сети',
    placeholder: 'Напишите сообщение...',
    send: 'Отправить',
  },
  UA: {
    notFound: 'Чат не знайдено',
    online: 'Онлайн',
    offline: 'Не в мережі',
    placeholder: 'Напишіть повідомлення...',
    send: 'Надіслати',
  },
  CZ: {
    notFound: 'Chat nenalezen',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Napište zprávu...',
    send: 'Odeslat',
  },
  DE: {
    notFound: 'Chat nicht gefunden',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Nachricht schreiben...',
    send: 'Senden',
  },
  IT: {
    notFound: 'Chat non trovata',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Scrivi un messaggio...',
    send: 'Invia',
  },
  FR: {
    notFound: 'Chat introuvable',
    online: 'En ligne',
    offline: 'Hors ligne',
    placeholder: 'Écrivez un message...',
    send: 'Envoyer',
  },
  PL: {
    notFound: 'Czat nie znaleziony',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Napisz wiadomość...',
    send: 'Wyślij',
  },
  AR: {
    notFound: 'الدردشة غير موجودة',
    online: 'متصل',
    offline: 'غير متصل',
    placeholder: 'اكتب رسالة...',
    send: 'إرسال',
  },
};

function isOlamepInternalChat(chat: ChatThread) {
  const name = chat.providerName.toLowerCase();
  const category = chat.category.toLowerCase();

  return (
    name.includes('olamep') ||
    name.includes('support') ||
    name.includes('manager') ||
    name.includes('admin') ||
    category.includes('olamep') ||
    category.includes('support') ||
    category.includes('internal')
  );
}

function getMessageStatusMeta(message: ChatMessage) {
  if (message.sender !== 'me') return null;

  if (message.status === 'seen') {
    return {
      icon: '✓✓',
      color: BRAND.blue,
    };
  }

  if (message.status === 'delivered') {
    return {
      icon: '✓✓',
      color: '#8f98a3',
    };
  }

  return {
    icon: '✓',
    color: BRAND.red,
  };
}

function groupMessagesByDay(messages: ChatMessage[]) {
  const groups: Array<{ label: string; items: ChatMessage[] }> = [];

  messages.forEach((message) => {
    const label = formatChatDayLabel(message.sentAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(message);
      return;
    }

    groups.push({
      label,
      items: [message],
    });
  });

  return groups;
}

function OlamepLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div
        style={{
          width: 30,
          height: 37,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 7,
            width: 15,
            height: 15,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 23,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-0.8px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function OlamepSupportAvatar({ online, size = 58 }: { online?: boolean; size?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 64 64" fill="none">
        <path
          d="M15 34C15 23.5 22.4 16 32 16C41.6 16 49 23.5 49 34"
          stroke="#111111"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M18 34V44" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
        <path d="M46 34V44" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M24 34C24 29.6 27.6 26 32 26C36.4 26 40 29.6 40 34V39C40 43.4 36.4 47 32 47C27.6 47 24 43.4 24 39V34Z"
          fill="#111111"
        />
        <circle cx="29" cy="35" r="2.2" fill="#ffffff" />
        <circle cx="35" cy="35" r="2.2" fill="#ffffff" />
        <path
          d="M27.5 41C29 43 31 44 32.8 44C34.6 44 36.3 43.1 37.5 41"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path d="M49 43C49 49 45 52 39 52" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
        <circle cx="38" cy="52" r="4" fill="#111111" />
      </svg>

      <span
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: Math.round(size * 0.28),
          height: Math.round(size * 0.28),
          borderRadius: 999,
          background: online ? BRAND.green : '#c7c7c7',
          border: '3px solid #ffffff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function ChatAvatar({ chat }: { chat: ChatThread }) {
  if (isOlamepInternalChat(chat)) {
    return <OlamepSupportAvatar online={chat.online} size={58} />;
  }

  return (
    <div style={{ position: 'relative', width: 58, height: 58, flexShrink: 0 }}>
      <img
        src={chat.providerAvatar}
        alt={chat.providerName}
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          objectFit: 'cover',
          display: 'block',
          border: `2px solid ${BRAND.border}`,
        }}
      />

      <span
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 17,
          height: 17,
          borderRadius: 999,
          background: chat.online ? BRAND.green : '#c7c7c7',
          border: '3px solid #ffffff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const threadId = decodeURIComponent(String(params.id || ''));

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [chat, setChat] = useState<ChatThread | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('pageshow', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      unsubLanguage();
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('pageshow', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  useEffect(() => {
    const loadChat = () => {
      setChat(getChatThreadById(threadId));
    };

    loadChat();

    const unsubscribe = subscribeToChatStore(loadChat);

    window.addEventListener('focus', loadChat);
    window.addEventListener('pageshow', loadChat);
    window.addEventListener('storage', loadChat);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', loadChat);
      window.removeEventListener('pageshow', loadChat);
      window.removeEventListener('storage', loadChat);
    };
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    markThreadAsRead(threadId);
  }, [threadId]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);

    return () => window.clearTimeout(id);
  }, [chat?.messages]);

  const text = chatTexts[language] || chatTexts.EN;

  const groupedMessages = useMemo(() => {
    return groupMessagesByDay(chat?.messages || []);
  }, [chat?.messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !threadId) return;

    sendChatMessage(threadId, trimmed);
    setInput('');
  };

  if (!chat) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: BRAND.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          color: BRAND.navy,
          fontFamily: 'Arial, sans-serif',
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        {text.notFound}
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          width: '100%',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: BRAND.bg,
            padding: '14px 14px 10px',
            borderBottom: '1px solid #eef0f4',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 48px',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 25,
                lineHeight: 1,
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              ←
            </button>

            <div
              style={{
                background: '#ffffff',
                border: `2px solid ${BRAND.border}`,
                borderRadius: 24,
                padding: '8px 10px',
                display: 'grid',
                gridTemplateColumns: '58px minmax(0, 1fr)',
                gap: 10,
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              <ChatAvatar chat={chat} />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: BRAND.navy,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.15,
                  }}
                >
                  {chat.providerName}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: 900,
                    color: chat.online ? BRAND.green : BRAND.muted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {chat.online ? text.online : chat.lastSeenText || text.offline}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/messages')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                color: BRAND.navy,
                fontSize: 24,
                lineHeight: 1,
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <OlamepLogo />
          </div>
        </header>

        <section
          style={{
            flex: 1,
            padding: '12px 14px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
          }}
        >
          {groupedMessages.map((group) => (
            <div
              key={group.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  alignSelf: 'center',
                  border: `2px solid ${BRAND.border}`,
                  background: '#fff0da',
                  color: BRAND.navy,
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {group.label}
              </div>

              {group.items.map((message) => {
                const fromMe = message.sender === 'me';
                const statusMeta = getMessageStatusMeta(message);

                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      justifyContent: fromMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '82%',
                        background: fromMe ? '#dcecff' : '#ffffff',
                        color: BRAND.navy,
                        border: `2px solid ${BRAND.border}`,
                        borderRadius: fromMe ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                        padding: '12px 14px 10px',
                        boxShadow: '0 8px 18px rgba(7,27,70,0.06)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15.5,
                          lineHeight: 1.45,
                          fontWeight: 800,
                          wordBreak: 'break-word',
                        }}
                      >
                        {message.text}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {statusMeta ? (
                          <span
                            style={{
                              minWidth: 18,
                              textAlign: 'center',
                              fontSize: 12,
                              fontWeight: 900,
                              color: statusMeta.color,
                              lineHeight: 1,
                            }}
                          >
                            {statusMeta.icon}
                          </span>
                        ) : null}

                        <span
                          style={{
                            fontSize: 11.5,
                            color: BRAND.muted,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          {formatChatTime(message.sentAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </section>

        <footer
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
            background: BRAND.bg,
            padding: '10px 14px calc(12px + env(safe-area-inset-bottom))',
            borderTop: '1px solid #eef0f4',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder={text.placeholder}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 20,
                border: `2px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: '0 15px',
                fontSize: 15,
                fontWeight: 800,
                outline: 'none',
                boxSizing: 'border-box',
                color: BRAND.navy,
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              style={{
                height: 56,
                minWidth: 88,
                border: `2px solid ${BRAND.border}`,
                borderRadius: 20,
                background: BRAND.green,
                color: '#ffffff',
                padding: '0 16px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.send}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
