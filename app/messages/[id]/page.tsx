'use client';

import { useEffect, useMemo, useState } from 'react';
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
};

type ChatItem = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
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
    messages: [
      { id: '1', text: 'Hi! Your booking is confirmed.', fromMe: false, time: '10:12' },
      { id: '2', text: 'Perfect, thank you.', fromMe: true, time: '10:13' },
      { id: '3', text: 'Please come 5 minutes earlier if possible.', fromMe: false, time: '10:15' },
    ],
  },
  {
    id: 'mila-wellness',
    name: 'Mila Wellness',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    online: false,
    messages: [
      { id: '1', text: 'Hello! We still have one free slot today.', fromMe: false, time: '09:20' },
      { id: '2', text: 'What time is available?', fromMe: true, time: '09:21' },
    ],
  },
  {
    id: 'nadia-beauty',
    name: 'Nadia Beauty',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    online: true,
    messages: [
      { id: '1', text: 'I have one more slot tomorrow if you want.', fromMe: false, time: '13:00' },
    ],
  },
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
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

  if (!chat) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f5f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Arial, sans-serif',
          color: '#1f2430',
          fontSize: 18,
          fontWeight: 800,
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
      },
    ]);
    setInput('');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f5f1',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ maxWidth: 430, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'rgba(247,245,241,0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e6dfd5',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '52px 1fr 52px',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: '1px solid #e5ddd1',
              background: '#fff',
              fontSize: 24,
              color: '#1f2430',
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            ←
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
            }}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#1f2430',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {chat.name}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  color: chat.online ? '#2d9b47' : '#7a8490',
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
              width: 52,
              height: 52,
              borderRadius: 999,
              border: '1px solid #e5ddd1',
              background: '#fff',
              fontSize: 22,
              color: '#1f2430',
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            ⌂
          </button>
        </header>

        <section
          style={{
            flex: 1,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                alignSelf: message.fromMe ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: message.fromMe ? '#2f8cff' : '#fff',
                color: message.fromMe ? '#fff' : '#1f2430',
                border: message.fromMe ? 'none' : '1px solid #e7e0d6',
                borderRadius: 22,
                padding: '12px 14px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.45,
                  fontWeight: 700,
                  wordBreak: 'break-word',
                }}
              >
                {message.text}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  opacity: 0.72,
                  textAlign: 'right',
                  fontWeight: 700,
                }}
              >
                {message.time}
              </div>
            </div>
          ))}
        </section>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'rgba(247,245,241,0.96)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid #e6dfd5',
            padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
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
                height: 54,
                borderRadius: 18,
                border: '1px solid #e7e0d6',
                background: '#fff',
                padding: '0 16px',
                fontSize: 16,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              style={{
                height: 54,
                border: 'none',
                borderRadius: 18,
                background: '#2f8cff',
                color: '#fff',
                padding: '0 18px',
                fontSize: 15,
                fontWeight: 900,
                boxShadow: '0 8px 18px rgba(47,140,255,0.22)',
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
