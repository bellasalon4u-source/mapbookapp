'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
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

type MessagesText = {
  title: string;
  subtitle: string;
  allCaughtUp: string;
  unreadSingle: string;
  unreadPlural: string;
  searchPlaceholder: string;
  noChats: string;
  noChatsHint: string;
  activeChats: string;
  unread: string;
  support: string;
  bookingChat: string;
  online: string;
  offline: string;
  read: string;
  newMessage: string;
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

const messagesTexts: Record<AppLanguage, MessagesText> = {
  EN: {
    title: 'Messages',
    subtitle: 'Chats with specialists, bookings and Olamep support',
    allCaughtUp: 'All caught up',
    unreadSingle: 'unread message',
    unreadPlural: 'unread messages',
    searchPlaceholder: 'Search chats, bookings, services...',
    noChats: 'No chats yet',
    noChatsHint: 'When you start messaging specialists, your chats will appear here.',
    activeChats: 'Active chats',
    unread: 'Unread',
    support: 'Support',
    bookingChat: 'Booking chat',
    online: 'Online',
    offline: 'Offline',
    read: 'Read',
    newMessage: 'New',
  },
  ES: {
    title: 'Mensajes',
    subtitle: 'Chats con especialistas, reservas y soporte Olamep',
    allCaughtUp: 'Todo al día',
    unreadSingle: 'mensaje no leído',
    unreadPlural: 'mensajes no leídos',
    searchPlaceholder: 'Buscar chats, reservas, servicios...',
    noChats: 'Aún no hay chats',
    noChatsHint: 'Cuando empieces a escribir a especialistas, tus chats aparecerán aquí.',
    activeChats: 'Chats activos',
    unread: 'No leídos',
    support: 'Soporte',
    bookingChat: 'Chat de reserva',
    online: 'En línea',
    offline: 'Desconectado',
    read: 'Leído',
    newMessage: 'Nuevo',
  },
  RU: {
    title: 'Сообщения',
    subtitle: 'Чаты со специалистами, бронированиями и поддержкой Olamep',
    allCaughtUp: 'Все сообщения прочитаны',
    unreadSingle: 'непрочитанное сообщение',
    unreadPlural: 'непрочитанных сообщений',
    searchPlaceholder: 'Поиск: чаты, брони, услуги...',
    noChats: 'Чатов пока нет',
    noChatsHint: 'Когда вы начнёте писать специалистам, ваши чаты появятся здесь.',
    activeChats: 'Активные чаты',
    unread: 'Новые',
    support: 'Поддержка',
    bookingChat: 'Чат по брони',
    online: 'Онлайн',
    offline: 'Не в сети',
    read: 'Прочитано',
    newMessage: 'Новое',
  },
  UA: {
    title: 'Повідомлення',
    subtitle: 'Чати зі спеціалістами, бронюваннями та підтримкою Olamep',
    allCaughtUp: 'Усі повідомлення прочитані',
    unreadSingle: 'непрочитане повідомлення',
    unreadPlural: 'непрочитаних повідомлень',
    searchPlaceholder: 'Пошук: чати, броні, послуги...',
    noChats: 'Чатів поки немає',
    noChatsHint: 'Коли ви почнете писати спеціалістам, ваші чати з’являться тут.',
    activeChats: 'Активні чати',
    unread: 'Нові',
    support: 'Підтримка',
    bookingChat: 'Чат бронювання',
    online: 'Онлайн',
    offline: 'Не в мережі',
    read: 'Прочитано',
    newMessage: 'Нове',
  },
  CZ: {
    title: 'Zprávy',
    subtitle: 'Chaty se specialisty, rezervacemi a podporou Olamep',
    allCaughtUp: 'Vše je přečteno',
    unreadSingle: 'nepřečtená zpráva',
    unreadPlural: 'nepřečtených zpráv',
    searchPlaceholder: 'Hledat chaty, rezervace, služby...',
    noChats: 'Zatím žádné chaty',
    noChatsHint: 'Jakmile začnete psát specialistům, vaše chaty se zobrazí zde.',
    activeChats: 'Aktivní chaty',
    unread: 'Nepřečtené',
    support: 'Podpora',
    bookingChat: 'Chat rezervace',
    online: 'Online',
    offline: 'Offline',
    read: 'Přečteno',
    newMessage: 'Nové',
  },
  DE: {
    title: 'Nachrichten',
    subtitle: 'Chats mit Spezialisten, Buchungen und Olamep Support',
    allCaughtUp: 'Alles gelesen',
    unreadSingle: 'ungelesene Nachricht',
    unreadPlural: 'ungelesene Nachrichten',
    searchPlaceholder: 'Chats, Buchungen, Services suchen...',
    noChats: 'Noch keine Chats',
    noChatsHint: 'Sobald du Fachleuten schreibst, erscheinen deine Chats hier.',
    activeChats: 'Aktive Chats',
    unread: 'Ungelesen',
    support: 'Support',
    bookingChat: 'Buchungschat',
    online: 'Online',
    offline: 'Offline',
    read: 'Gelesen',
    newMessage: 'Neu',
  },
  IT: {
    title: 'Messaggi',
    subtitle: 'Chat con specialisti, prenotazioni e supporto Olamep',
    allCaughtUp: 'Tutto letto',
    unreadSingle: 'messaggio non letto',
    unreadPlural: 'messaggi non letti',
    searchPlaceholder: 'Cerca chat, prenotazioni, servizi...',
    noChats: 'Ancora nessuna chat',
    noChatsHint: 'Quando inizierai a scrivere agli specialisti, le chat appariranno qui.',
    activeChats: 'Chat attive',
    unread: 'Non letti',
    support: 'Supporto',
    bookingChat: 'Chat prenotazione',
    online: 'Online',
    offline: 'Offline',
    read: 'Letto',
    newMessage: 'Nuovo',
  },
  FR: {
    title: 'Messages',
    subtitle: 'Chats avec spécialistes, réservations et support Olamep',
    allCaughtUp: 'Tout est lu',
    unreadSingle: 'message non lu',
    unreadPlural: 'messages non lus',
    searchPlaceholder: 'Rechercher chats, réservations, services...',
    noChats: 'Aucun chat pour le moment',
    noChatsHint: 'Quand vous commencerez à écrire aux spécialistes, vos chats apparaîtront ici.',
    activeChats: 'Chats actifs',
    unread: 'Non lus',
    support: 'Support',
    bookingChat: 'Chat réservation',
    online: 'En ligne',
    offline: 'Hors ligne',
    read: 'Lu',
    newMessage: 'Nouveau',
  },
  PL: {
    title: 'Wiadomości',
    subtitle: 'Czaty ze specjalistami, rezerwacjami i wsparciem Olamep',
    allCaughtUp: 'Wszystko przeczytane',
    unreadSingle: 'nieprzeczytana wiadomość',
    unreadPlural: 'nieprzeczytanych wiadomości',
    searchPlaceholder: 'Szukaj czatów, rezerwacji, usług...',
    noChats: 'Brak czatów',
    noChatsHint: 'Gdy zaczniesz pisać do specjalistów, Twoje czaty pojawią się tutaj.',
    activeChats: 'Aktywne czaty',
    unread: 'Nieprzeczytane',
    support: 'Wsparcie',
    bookingChat: 'Czat rezerwacji',
    online: 'Online',
    offline: 'Offline',
    read: 'Przeczytano',
    newMessage: 'Nowe',
  },
  AR: {
    title: 'الرسائل',
    subtitle: 'دردشات مع المختصين والحجوزات ودعم Olamep',
    allCaughtUp: 'كل الرسائل مقروءة',
    unreadSingle: 'رسالة غير مقروءة',
    unreadPlural: 'رسائل غير مقروءة',
    searchPlaceholder: 'ابحث في الدردشات والحجوزات والخدمات...',
    noChats: 'لا توجد دردشات بعد',
    noChatsHint: 'عندما تبدأ بمراسلة المختصين، ستظهر دردشاتك هنا.',
    activeChats: 'الدردشات النشطة',
    unread: 'غير مقروء',
    support: 'الدعم',
    bookingChat: 'دردشة الحجز',
    online: 'متصل',
    offline: 'غير متصل',
    read: 'مقروء',
    newMessage: 'جديد',
  },
};

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

function isBookingThread(thread: ChatThread) {
  const id = String(thread.id || '').toLowerCase();
  const category = String(thread.category || '').toLowerCase();

  return (
    id.includes('booking') ||
    category.includes('booking') ||
    category.includes('брон') ||
    category.includes('reservation')
  );
}

function getLastMessage(thread: ChatThread) {
  return thread.messages[thread.messages.length - 1] || null;
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

function getUnreadText(language: AppLanguage, text: MessagesText, unreadTotal: number) {
  if (unreadTotal <= 0) return text.allCaughtUp;

  if (language === 'RU' || language === 'UA' || language === 'PL') {
    return `${unreadTotal} ${text.unreadPlural}`;
  }

  return `${unreadTotal} ${unreadTotal === 1 ? text.unreadSingle : text.unreadPlural}`;
}

function OlamepLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <div
        style={{
          width: 34,
          height: 42,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 8px 18px rgba(14,115,216,0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 17,
            height: 17,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 29,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function OlamepAppIcon({ size = 58 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        border: `2px solid ${BRAND.border}`,
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

function OlamepSupportAvatar({ online, size = 82 }: { online?: boolean; size?: number }) {
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

      <div
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: Math.round(size * 0.36),
          height: Math.round(size * 0.36),
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
          width: Math.round(size * 0.27),
          height: Math.round(size * 0.27),
          borderRadius: 999,
          background: online ? BRAND.green : '#c7c7c7',
          border: '3px solid #ffffff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function ThreadAvatar({ thread }: { thread: ChatThread }) {
  const internal = isOlamepInternalThread(thread);

  if (internal) {
    return <OlamepSupportAvatar online={thread.online} />;
  }

  return (
    <div style={{ position: 'relative', width: 82, height: 82, flexShrink: 0 }}>
      <img
        src={thread.providerAvatar}
        alt={thread.providerName}
        style={{
          width: 82,
          height: 82,
          borderRadius: 22,
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
          width: 22,
          height: 22,
          borderRadius: 999,
          background: thread.online ? BRAND.green : '#c7c7c7',
          border: '3px solid #ffffff',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function MessagesPageContent() {
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

    window.addEventListener('focus', load);
    window.addEventListener('pageshow', load);
    window.addEventListener('storage', load);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', load);
      window.removeEventListener('pageshow', load);
      window.removeEventListener('storage', load);
    };
  }, []);

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

  const text = messagesTexts[language] || messagesTexts.EN;

  const unreadTotal = useMemo(() => {
    try {
      return getUnreadMessagesCount();
    } catch {
      return 0;
    }
  }, [threads]);

  const unreadText = useMemo(() => {
    return getUnreadText(language, text, unreadTotal);
  }, [language, text, unreadTotal]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();

    const sorted = [...threads].sort((a, b) => {
      const aLast = getLastMessage(a);
      const bLast = getLastMessage(b);

      const aTime = new Date(aLast?.sentAt || 0).getTime() || 0;
      const bTime = new Date(bLast?.sentAt || 0).getTime() || 0;

      if (a.unreadCount !== b.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }

      return bTime - aTime;
    });

    if (!q) return sorted;

    return sorted.filter((thread) => {
      const lastMessage = getLastMessage(thread);

      return (
        thread.providerName.toLowerCase().includes(q) ||
        thread.category.toLowerCase().includes(q) ||
        String(lastMessage?.text || '').toLowerCase().includes(q)
      );
    });
  }, [threads, search]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 130,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 140px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
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
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <OlamepLogo />
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section style={{ marginTop: 16 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: '-1.2px',
              color: BRAND.navy,
            }}
          >
            {text.title}
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.subtitle}
          </p>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 28,
            border: `2px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <SummaryCard
              title={text.activeChats}
              value={threads.length}
              bg="#fff0da"
              color={BRAND.navy}
              accent="#8b7355"
            />

            <SummaryCard
              title={text.unread}
              value={unreadTotal}
              bg={unreadTotal > 0 ? '#ffe0e8' : '#dcffe8'}
              color={unreadTotal > 0 ? BRAND.red : BRAND.green}
              accent={unreadTotal > 0 ? BRAND.red : BRAND.green}
            />
          </div>

          <div
            style={{
              marginTop: 11,
              height: 48,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 13px',
            }}
          >
            <span style={{ fontSize: 18, color: '#9ca3af' }}>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text.searchPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                fontWeight: 800,
                color: BRAND.navy,
                minWidth: 0,
              }}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: 14,
            borderRadius: 24,
            border: `2px solid ${BRAND.border}`,
            background: unreadTotal > 0 ? '#fff1bf' : '#dcffe8',
            padding: '12px 14px',
            display: 'grid',
            gridTemplateColumns: '42px 1fr',
            gap: 11,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: `2px solid ${BRAND.border}`,
              background: unreadTotal > 0 ? BRAND.red : BRAND.green,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: unreadTotal > 0 ? 24 : 18,
              fontWeight: 900,
            }}
          >
            {unreadTotal > 0 ? '!' : '✓'}
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.25,
              fontWeight: 900,
              color: unreadTotal > 0 ? '#9a6100' : '#008f3a',
            }}
          >
            {unreadText}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          {filteredThreads.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                border: `2px solid ${BRAND.border}`,
                borderRadius: 28,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <OlamepAppIcon size={64} />
              </div>

              <div
                style={{
                  fontSize: 21,
                  fontWeight: 900,
                  color: BRAND.navy,
                  marginBottom: 10,
                }}
              >
                {text.noChats}
              </div>

              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: BRAND.muted,
                  fontWeight: 800,
                }}
              >
                {text.noChatsHint}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filteredThreads.map((thread) => {
                const lastMessage = getLastMessage(thread);
                const internal = isOlamepInternalThread(thread);
                const booking = isBookingThread(thread);
                const hasUnread = thread.unreadCount > 0;

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => router.push(`/messages/${encodeURIComponent(thread.id)}`)}
                    style={{
                      width: '100%',
                      border: `2px solid ${BRAND.border}`,
                      background: hasUnread ? '#fffefa' : '#ffffff',
                      borderRadius: 28,
                      padding: 14,
                      display: 'grid',
                      gridTemplateColumns: '82px minmax(0, 1fr) 46px',
                      gap: 12,
                      alignItems: 'center',
                      textAlign: 'left',
                      cursor: 'pointer',
                      boxShadow: hasUnread
                        ? '0 10px 24px rgba(255,36,86,0.10)'
                        : '0 8px 20px rgba(7,27,70,0.06)',
                    }}
                  >
                    <ThreadAvatar thread={thread} />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          flexWrap: 'wrap',
                          marginBottom: 7,
                        }}
                      >
                        {internal ? (
                          <span
                            style={{
                              minHeight: 26,
                              padding: '0 9px',
                              borderRadius: 999,
                              border: `2px solid ${BRAND.border}`,
                              background: '#fff1bf',
                              color: '#b87500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: 10.5,
                              fontWeight: 900,
                            }}
                          >
                            {text.support}
                          </span>
                        ) : null}

                        {booking ? (
                          <span
                            style={{
                              minHeight: 26,
                              padding: '0 9px',
                              borderRadius: 999,
                              border: `2px solid ${BRAND.border}`,
                              background: '#dcecff',
                              color: BRAND.blue,
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: 10.5,
                              fontWeight: 900,
                            }}
                          >
                            {text.bookingChat}
                          </span>
                        ) : null}

                        <span
                          style={{
                            minHeight: 26,
                            padding: '0 9px',
                            borderRadius: 999,
                            background: thread.online ? '#dcffe8' : '#f3f4f6',
                            color: thread.online ? '#008f3a' : '#7b8590',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: 10.5,
                            fontWeight: 900,
                          }}
                        >
                          {thread.online ? text.online : thread.lastSeenText || text.offline}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 19,
                          fontWeight: 900,
                          color: BRAND.navy,
                          lineHeight: 1.15,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {thread.providerName}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          fontWeight: hasUnread ? 900 : 800,
                          color: hasUnread ? '#2f3440' : BRAND.muted,
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {lastMessage?.text || ''}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontWeight: 900,
                          color: BRAND.blue,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {thread.category}
                      </div>
                    </div>

                    <div
                      style={{
                        alignSelf: 'stretch',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: BRAND.muted,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getLastMessageTime(lastMessage)}
                      </div>

                      {hasUnread ? (
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 999,
                            background: BRAND.red,
                            border: `2px solid ${BRAND.border}`,
                            color: '#ffffff',
                            fontSize: 24,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                          }}
                        >
                          !
                        </div>
                      ) : (
                        <div
                          style={{
                            minWidth: 38,
                            minHeight: 38,
                            borderRadius: 999,
                            color: BRAND.green,
                            fontSize: 21,
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                          }}
                        >
                          ✓✓
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

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.navy,
            fontFamily: 'Arial, sans-serif',
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          Messages...
        </main>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
