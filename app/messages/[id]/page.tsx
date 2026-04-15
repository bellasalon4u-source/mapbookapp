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

const chatTexts = {
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
  PL: {
    notFound: 'Czat nie znaleziony',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Napisz wiadomość...',
    send: 'Wyślij',
  },
  UA: {
    notFound: 'Чат не знайдено',
    online: 'Онлайн',
    offline: 'Не в мережі',
    placeholder: 'Напишіть повідомлення...',
    send: 'Надіслати',
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
  AR: {
    notFound: 'الدردشة غير موجودة',
    online: 'متصل',
    offline: 'غير متصل',
    placeholder: 'اكتب رسالة...',
    send: 'إرسال',
  },
} satisfies Record<
  AppLanguage,
  {
    notFound: string;
    online: string;
    offline: string;
    placeholder: string;
    send: string;
  }
>;

function getStatusMeta(message: ChatMessage) {
  if (message.sender !== 'me') return null;

  if (message.status === 'seen') {
    return {
      icon: '✓✓',
      color: '#2f8cff',
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
    color: '#ef3e36',
  };
}

function groupMessagesByDay(messages: ChatMessage[]) {
  const groups: { label: string; items: ChatMessage[] }[] = [];

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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const threadId = String(params.id || '');

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [chat, setChat] = useState<ChatThread | null>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    const loadChat = () => {
      setChat(getChatThreadById(threadId));
    };

    loadChat();

    const unsubscribe = subscribeToChatStore(loadChat);

    return () => {
      unsubscribe();
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

  if (!chat) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f4ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          color: '#1f2430',
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        {text.notFound}
      </main>
    );
  }

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    sendChatMessage(threadId, trimmed);
    setInput('');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        color: '#1f2430',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: '#f7f4ee',
            padding: '16px 16px 12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr 54px',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 24,
                color: '#1f2430',
                lineHeight: 1,
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              ←
            </button>

            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 26,
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: '56px 1fr',
                gap: 12,
                alignItems: 'center',
                minWidth: 0,
              }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={chat.providerAvatar}
                  alt={chat.providerName}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    objectFit: 'cover',
                    display: 'block',
                    border: '2px solid #111111',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: -2,
                    bottom: -2,
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: chat.online ? '#2fbb52' : '#c7c7c7',
                    border: '2px solid #ffffff',
                  }}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: '#1f2430',
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
                    fontSize: 13,
                    fontWeight: 900,
                    color: chat.online ? '#2fbb52' : '#8b95a1',
                  }}
                >
                  {chat.online ? text.online : chat.lastSeenText || text.offline}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#fff',
                fontSize: 22,
                color: '#1f2430',
                lineHeight: 1,
                cursor: 'pointer',
                fontWeight: 900,
              }}
            >
              ⌂
            </button>
          </div>
        </header>

        <section
          style={{
            flex: 1,
            padding: '8px 16px 16px',
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
                  border: '2px solid #111111',
                  background: '#fff4e7',
                  color: '#17130f',
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
                const statusMeta = getStatusMeta(message);
                const fromMe = message.sender === 'me';

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
                        background: fromMe ? '#eaf3ff' : '#ffffff',
                        color: '#1f2430',
                        border: '2px solid #111111',
                        borderRadius: 24,
                        padding: '12px 14px 10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
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
                            fontSize: 12,
                            color: '#7b8590',
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

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#f7f4ee',
            padding: '10px 16px calc(12px + env(safe-area-inset-bottom))',
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={text.placeholder}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 20,
                border: '2px solid #111111',
                background: '#fff',
                padding: '0 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1f2430',
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              style={{
                height: 56,
                minWidth: 96,
                border: '2px solid #111111',
                borderRadius: 20,
                background: '#45c63d',
                color: '#fff',
                padding: '0 18px',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {text.send}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
