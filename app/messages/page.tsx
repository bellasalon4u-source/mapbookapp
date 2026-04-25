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

function isOlamepInternalThread(thread: ChatThread) {
  const name = thread.providerName.toLowerCase();
  const category = thread.category.toLowerCase();

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

function OlamepAppIcon({ size = 58 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        border: '2px solid #111111',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <img
        src="/ui/logo/icon.png"
        alt="Olamep"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

function OlamepSupportAvatar({ online }: { online?: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 82,
        height: 82,
        borderRadius: 999,
        border: '2px solid #111111',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 34C15 23.5 22.4 16 32 16C41.6 16 49 23.5 49 34"
          stroke="#111111"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M18 34V44"
          stroke="#111111"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M46 34V44"
          stroke="#111111"
          strokeWidth="8"
          strokeLinecap="round"
        />
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
        <path
          d="M49 43C49 49 45 52 39 52"
          stroke="#111111"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="38" cy="52" r="4" fill="#111111" />
      </svg>

      <div
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: 30,
          height: 30,
          borderRadius: 999,
          border: '2px solid #ffffff',
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
        }}
      >
        <img
          src="/ui/logo/icon.png"
          alt="Olamep"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      <span
        style={{
          position: 'absolute',
          right: -1,
          bottom: -1,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: online ? '#31b84d' : '#c7c7c7',
          border: '3px solid #ffffff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

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
              <OlamepAppIcon size={58} />

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
                <OlamepAppIcon size={64} />
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
                const isInternal = isOlamepInternalThread(thread);

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
                    {isInternal ? (
                      <OlamepSupportAvatar online={thread.online} />
                    ) : (
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
                    )}

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
