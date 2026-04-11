'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';
import {
  getChatThreads,
  getUnreadMessagesCount,
  subscribeToChatStore,
  type ChatThread,
} from '../../services/chatStore';

const messagesTexts = {
  EN: {
    title: 'Messages',
    allCaughtUp: 'All caught up',
    unreadSingle: 'unread message',
    unreadPlural: 'unread messages',
    searchPlaceholder: 'Search chats...',
  },
  ES: {
    title: 'Mensajes',
    allCaughtUp: 'Todo al día',
    unreadSingle: 'mensaje no leído',
    unreadPlural: 'mensajes no leídos',
    searchPlaceholder: 'Buscar chats...',
  },
  RU: {
    title: 'Сообщения',
    allCaughtUp: 'Все сообщения прочитаны',
    unreadSingle: 'непрочитанное сообщение',
    unreadPlural: 'непрочитанных сообщений',
    searchPlaceholder: 'Поиск чатов...',
  },
  CZ: {
    title: 'Zprávy',
    allCaughtUp: 'Vše je přečteno',
    unreadSingle: 'nepřečtená zpráva',
    unreadPlural: 'nepřečtených zpráv',
    searchPlaceholder: 'Hledat chaty...',
  },
  DE: {
    title: 'Nachrichten',
    allCaughtUp: 'Alles gelesen',
    unreadSingle: 'ungelesene Nachricht',
    unreadPlural: 'ungelesene Nachrichten',
    searchPlaceholder: 'Chats suchen...',
  },
  PL: {
    title: 'Wiadomości',
    allCaughtUp: 'Wszystko przeczytane',
    unreadSingle: 'nieprzeczytana wiadomość',
    unreadPlural: 'nieprzeczytanych wiadomości',
    searchPlaceholder: 'Szukaj czatów...',
  },
} as const;

export default function MessagesPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = () => {
      setThreads(getChatThreads());
    };

    load();
    const unsubscribe = subscribeToChatStore(load);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  const text = messagesTexts[language as keyof typeof messagesTexts] || messagesTexts.EN;

  const unreadTotal = useMemo(() => {
    return getUnreadMessagesCount();
  }, [threads]);

  const unreadText = useMemo(() => {
    if (unreadTotal <= 0) {
      return text.allCaughtUp;
    }

    if (language === 'EN') {
      return `${unreadTotal} ${unreadTotal === 1 ? text.unreadSingle : text.unreadPlural}`;
    }

    if (language === 'ES') {
      return `${unreadTotal} ${unreadTotal === 1 ? text.unreadSingle : text.unreadPlural}`;
    }

    if (language === 'RU') {
      return `${unreadTotal} ${text.unreadPlural}`;
    }

    if (language === 'CZ') {
      return `${unreadTotal} ${unreadTotal === 1 ? text.unreadSingle : text.unreadPlural}`;
    }

    if (language === 'DE') {
      return `${unreadTotal} ${unreadTotal === 1 ? text.unreadSingle : text.unreadPlural}`;
    }

    if (language === 'PL') {
      return `${unreadTotal} ${text.unreadPlural}`;
    }

    return `${unreadTotal} ${text.unreadPlural}`;
  }, [language, text, unreadTotal]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;

    return threads.filter((thread) => {
      const lastMessage = thread.messages[thread.messages.length - 1];
      return (
        thread.providerName.toLowerCase().includes(q) ||
        thread.category.toLowerCase().includes(q) ||
        (lastMessage?.text || '').toLowerCase().includes(q)
      );
    });
  }, [threads, search]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 104,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push('/')}
              style={{
                border: 'none',
                background: '#fff',
                width: 52,
                height: 52,
                borderRadius: 999,
                fontSize: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
              }}
            >
              ←
            </button>

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#253140',
                  lineHeight: 1.2,
                }}
              >
                {text.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: '#7a8490',
                  fontWeight: 700,
                }}
              >
                {unreadText}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              background: '#fff',
              borderRadius: 18,
              border: '1px solid #ece7df',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20, color: '#98a2ad' }}>🔎</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text.searchPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 16,
                color: '#2b3138',
              }}
            />
          </div>
        </header>

        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {filteredThreads.map((thread) => {
              const lastMessage = thread.messages[thread.messages.length - 1];

              return (
                <button
                  key={thread.id}
                  onClick={() => router.push(`/messages/${thread.id}`)}
                  style={{
                    border: '1px solid #ece4d9',
                    background: '#fff',
                    borderRadius: 24,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '74px 1fr auto',
                    gap: 14,
                    alignItems: 'start',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={thread.providerAvatar}
                      alt={thread.providerName}
                      style={{
                        width: 74,
                        height: 74,
                        borderRadius: 18,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {thread.online && (
                      <span
                        style={{
                          position: 'absolute',
                          right: -2,
                          bottom: -2,
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: '#2fbb52',
                          border: '3px solid #fff',
                        }}
                      />
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#253140',
                        lineHeight: 1.2,
                      }}
                    >
                      {thread.providerName}
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 15,
                        color: '#5d6875',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2 as any,
                        WebkitBoxOrient: 'vertical' as any,
                        overflow: 'hidden',
                      }}
                    >
                      {lastMessage?.text}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        color: '#7d8792',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lastMessage
                        ? new Date(lastMessage.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </div>

                    {thread.unreadCount > 0 && (
                      <div
                        style={{
                          minWidth: 30,
                          height: 30,
                          borderRadius: 999,
                          background: '#e53935',
                          color: '#fff',
                          fontSize: 15,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 8px',
                          boxShadow: '0 6px 14px rgba(229,57,53,0.24)',
                        }}
                      >
                        {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
