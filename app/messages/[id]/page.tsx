'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type MessageItem = {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
  isRead?: boolean;
  isDelivered?: boolean;
  isAlert?: boolean;
};

type ChatItem = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  category?: string;
  messages: MessageItem[];
};

const chatTexts = {
  EN: {
    notFound: 'Chat not found',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Write a message...',
    send: 'Send',
    back: 'Back',
  },
  ES: {
    notFound: 'Chat no encontrado',
    online: 'En línea',
    offline: 'Desconectado',
    placeholder: 'Escribe un mensaje...',
    send: 'Enviar',
    back: 'Volver',
  },
  RU: {
    notFound: 'Чат не найден',
    online: 'Онлайн',
    offline: 'Не в сети',
    placeholder: 'Напишите сообщение...',
    send: 'Отправить',
    back: 'Назад',
  },
  CZ: {
    notFound: 'Chat nenalezen',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Napište zprávu...',
    send: 'Odeslat',
    back: 'Zpět',
  },
  DE: {
    notFound: 'Chat nicht gefunden',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Nachricht schreiben...',
    send: 'Senden',
    back: 'Zurück',
  },
  PL: {
    notFound: 'Czat nie znaleziony',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Napisz wiadomość...',
    send: 'Wyślij',
    back: 'Wróć',
  },
  UA: {
    notFound: 'Чат не знайдено',
    online: 'Онлайн',
    offline: 'Не в мережі',
    placeholder: 'Напишіть повідомлення...',
    send: 'Надіслати',
    back: 'Назад',
  },
  IT: {
    notFound: 'Chat non trovata',
    online: 'Online',
    offline: 'Offline',
    placeholder: 'Scrivi un messaggio...',
    send: 'Invia',
    back: 'Indietro',
  },
  FR: {
    notFound: 'Chat introuvable',
    online: 'En ligne',
    offline: 'Hors ligne',
    placeholder: 'Écrivez un message...',
    send: 'Envoyer',
    back: 'Retour',
  },
  AR: {
    notFound: 'الدردشة غير موجودة',
    online: 'متصل',
    offline: 'غير متصل',
    placeholder: 'اكتب رسالة...',
    send: 'إرسال',
    back: 'رجوع',
  },
} satisfies Record<
  AppLanguage,
  {
    notFound: string;
    online: string;
    offline: string;
    placeholder: string;
    send: string;
    back: string;
  }
>;

const mockChats: ChatItem[] = [
  {
    id: 'bella-keratin-studio',
    name: 'Bella Keratin Studio',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    online: true,
    category: 'Hair Extensions',
    messages: [
      {
        id: '1',
        text: 'Hi! Your booking is confirmed.',
        fromMe: false,
        time: '10:12',
      },
      {
        id: '2',
        text: 'Perfect, thank you.',
        fromMe: true,
        time: '10:13',
        isRead: true,
        isDelivered: true,
      },
      {
        id: '3',
        text: 'Please come 5 minutes earlier if possible.',
        fromMe: false,
        time: '10:15',
        isAlert: true,
      },
    ],
  },
  {
    id: 'mila-wellness',
    name: 'Mila Wellness',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    online: false,
    category: 'Massage',
    messages: [
      {
        id: '1',
        text: 'Hello! We still have one free slot today.',
        fromMe: false,
        time: '09:20',
      },
      {
        id: '2',
        text: 'What time is available?',
        fromMe: true,
        time: '09:21',
        isDelivered: true,
      },
    ],
  },
  {
    id: 'nadia-beauty',
    name: 'Nadia Beauty',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    online: true,
    category: 'Brows',
    messages: [
      {
        id: '1',
        text: 'I have one more slot tomorrow if you want.',
        fromMe: false,
        time: '13:00',
      },
    ],
  },
];

function getStatusMeta(message: MessageItem) {
  if (message.fromMe) {
    if (message.isRead) {
      return {
        icon: '✓✓',
        color: '#2f8cff',
      };
    }

    if (message.isDelivered) {
      return {
        icon: '✓✓',
        color: '#8f98a3',
      };
    }

    return {
      icon: '✓',
      color: '#e53935',
    };
  }

  if (message.isAlert) {
    return {
      icon: '!',
      color: '#e53935',
    };
  }

  return null;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  const text = chatTexts[language] || chatTexts.EN;

  const chat = useMemo(() => {
    return mockChats.find((item) => item.id === String(params.id));
  }, [params.id]);

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    }
  }, [chat]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 80);

    return () => window.clearTimeout(id);
  }, [messages]);

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
          fontFamily: 'Arial, sans-serif',
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

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        text: trimmed,
        fromMe: true,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isDelivered: true,
      },
    ]);

    setInput('');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        fontFamily: 'Arial, sans-serif',
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
                  src={chat.avatar}
                  alt={chat.name}
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
                  {chat.name}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    fontWeight: 900,
                    color: chat.online ? '#2fbb52' : '#8b95a1',
                  }}
                >
                  {chat.online ? text.online : text.offline}
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
          {messages.map((message) => {
            const statusMeta = getStatusMeta(message);

            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.fromMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    background: message.fromMe ? '#eaf3ff' : '#ffffff',
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
                      {message.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

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
