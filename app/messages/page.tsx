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
    noChats: 'No chats yet',
    noChatsHint: 'When you start messaging professionals, your chats will appear here.',
  },
  ES: {
    title: 'Mensajes',
    allCaughtUp: 'Todo al día',
    unreadSingle: 'mensaje no leído',
    unreadPlural: 'mensajes no leídos',
    searchPlaceholder: 'Buscar chats...',
    noChats: 'Aún no hay chats',
    noChatsHint: 'Cuando empieces a escribir a profesionales, tus chats aparecerán aquí.',
  },
  RU: {
    title: 'Сообщения',
    allCaughtUp: 'Все сообщения прочитаны',
    unreadSingle: 'непрочитанное сообщение',
    unreadPlural: 'непрочитанных сообщений',
    searchPlaceholder: 'Поиск чатов...',
    noChats: 'Чатов пока нет',
    noChatsHint: 'Когда вы начнёте писать специалистам, ваши чаты появятся здесь.',
  },
  CZ: {
    title: 'Zprávy',
    allCaughtUp: 'Vše je přečteno',
    unreadSingle: 'nepřečtená zpráva',
    unreadPlural: 'nepřečtených zpráv',
    searchPlaceholder: 'Hledat chaty...',
    noChats: 'Zatím žádné chaty',
    noChatsHint: 'Jakmile začnete psát profesionálům, vaše chaty se zobrazí zde.',
  },
  DE: {
    title: 'Nachrichten',
    allCaughtUp: 'Alles gelesen',
    unreadSingle: 'ungelesene Nachricht',
    unreadPlural: 'ungelesene Nachrichten',
    searchPlaceholder: 'Chats suchen...',
    noChats: 'Noch keine Chats',
    noChatsHint: 'Sobald du Fachleuten schreibst, erscheinen deine Chats hier.',
  },
  PL: {
    title: 'Wiadomości',
    allCaughtUp: 'Wszystko przeczytane',
    unreadSingle: 'nieprzeczytana wiadomość',
    unreadPlural: 'nieprzeczytanych wiadomości',
    searchPlaceholder: 'Szukaj czatów...',
    noChats: 'Brak czatów',
    noChatsHint: 'Gdy zaczniesz pisać do specjalistów, Twoje czaty pojawią się tutaj.',
  },
} as const;

function getReadStatusIcon(unreadCount: number) {
  if (unreadCount > 0) {
    return {
      bg: '#ef3e36',
      color: '#ffffff',
      text: '!',
      border: '#111111',
    };
  }

  return {
    bg: 'transparent',
    color: '#2f9e44',
    text: '✓✓',
    border: 'transparent',
  };
}

function getLastMessageTime(lastMessage: any) {
  if (!lastMessage) return '';

  if (lastMessage.sentAt) {
    const date = new Date(lastMessage.sentAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return lastMessage.time || '';
}

function OlamepLogoIcon() {
  return (
    <div
      aria-label="Olamep logo"
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        border: '2.5px solid #111111',
        background:
          'linear-gradient(145deg, #ffffff 0%, #fff7ee 45%, #eef9ff 100%)',
        boxShadow: '0 8px 0 rgba(17,17,17,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          opacity: 0.45,
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 34,
          height: 42,
          background: 'linear-gradient(180deg, #ff4f6d 0%, #246bff 100%)',
          border: '2.5px solid #111111',
          borderRadius: '18px 18px 20px 20px',
          transform: 'rotate(0deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 0 rgba(17,17,17,0.12)',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: '#ffffff',
            border: '2px solid #111111',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            width: 16,
            height: 16,
            background: '#246bff',
            borderRight: '2.5px solid #111111',
            borderBottom: '2.5px solid #111111',
            transform: 'translateX(-50%) rotate(45deg)',
            borderRadius: 3,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 6,
          right: 6,
          height: 13,
          borderRadius: 999,
          background: '#ffffff',
          border: '1.5px solid #111111',
          color: '#111111',
          fontSize: 7,
          fontWeight: 1000,
          letterSpacing: -0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        Olamep
      </div>
    </div>
  );
}

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
        String(lastMessage?.text || '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [threads, search]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        color: '#17130f',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
        <header>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '54px 1fr',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                border: '2px solid #111111',
                background: '#ffffff',
                fontSize: 26,
                fontWeight: 900,
                color: '#17130f',
                cursor: 'pointer',
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
              <OlamepLogoIcon />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#1b2537',
                    lineHeight: 1.1,
                  }}
                >
                  {text.title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    color: '#6f7782',
                    fontWeight: 800,
                  }}
                >
                  {unreadText}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#ffffff',
              border: '2px solid #111111',
              borderRadius: 22,
              padding: '14px 16px',
            }}
          >
            <span
              style={{
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              🔎
            </span>

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
                color: '#2c3440',
              }}
            />
          </div>
        </header>

        <section style={{ marginTop: 18 }}>
          {filteredThreads.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #111111',
                borderRadius: 28,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <OlamepLogoIcon />
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#1b2537',
                  marginBottom: 10,
                }}
              >
                {text.noChats}
              </div>

              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: '#6d7682',
                  fontWeight: 700,
                }}
              >
                {text.noChatsHint}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {filteredThreads.map((thread) => {
                const lastMessage = thread.messages[thread.messages.length - 1];
                const statusIcon = getReadStatusIcon(thread.unreadCount);

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => router.push(`/messages/${thread.id}`)}
                    style={{
                      width: '100%',
                      border: '2px solid #111111',
                      background: '#ffffff',
                      borderRadius: 28,
                      padding: 16,
                      display: 'grid',
                      gridTemplateColumns: '82px 1fr auto',
                      gap: 14,
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={thread.providerAvatar}
                        alt={thread.providerName}
                        style={{
                          width: 82,
                          height: 82,
                          borderRadius: 22,
                          objectFit: 'cover',
                          display: 'block',
                          border: '2px solid #111111',
                        }}
                      />

                      {thread.online ? (
                        <span
                          style={{
                            position: 'absolute',
                            right: -2,
                            bottom: -2,
                            width: 22,
                            height: 22,
                            borderRadius: 999,
                            background: '#31b84d',
                            border: '3px solid #ffffff',
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : null}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: '#1b2537',
                          lineHeight: 1.2,
                        }}
                      >
                        {thread.providerName}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 15,
                          color: '#5e6875',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {lastMessage?.text || ''}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        alignSelf: 'stretch',
                        minWidth: 52,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          color: '#6f7782',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getLastMessageTime(lastMessage)}
                      </div>

                      {thread.unreadCount > 0 ? (
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 999,
                            background: statusIcon.bg,
                            border: `2px solid ${statusIcon.border}`,
                            color: statusIcon.color,
                            fontSize: 24,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                          }}
                        >
                          {statusIcon.text}
                        </div>
                      ) : (
                        <div
                          style={{
                            color: statusIcon.color,
                            fontSize: 26,
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          {statusIcon.text}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav active="messages" />
    </main>
  );
}
