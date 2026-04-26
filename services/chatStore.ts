export type ChatMessageStatus = 'sent' | 'delivered' | 'seen';

export type ChatMessage = {
  id: string;
  sender: 'me' | 'provider';
  text: string;
  sentAt: string;
  deliveredAt?: string;
  seenAt?: string;
  status: ChatMessageStatus;
};

export type ChatThread = {
  id: string;
  providerName: string;
  providerAvatar: string;
  category: string;
  online?: boolean;
  lastSeenText?: string;
  unreadCount: number;
  masterId?: string;
  providerId?: string;
  bookingId?: string;
  messages: ChatMessage[];
};

export type CreateChatThreadInput = {
  masterId?: string | number;
  providerId?: string | number;
  bookingId?: string | number;
  providerName: string;
  providerAvatar?: string;
  category?: string;
  online?: boolean;
  initialMessage?: string;
};

const STORAGE_KEY = 'mapbook_chat_threads_v1';

const olamepSupportThread: ChatThread = {
  id: 'olamep-support',
  providerName: 'Olamep Support',
  providerAvatar: '',
  category: 'Olamep Internal',
  online: true,
  lastSeenText: 'Online',
  unreadCount: 0,
  messages: [
    {
      id: 'olamep-m1',
      sender: 'provider',
      text: 'Welcome to Olamep. If you need help with bookings, services, ads or payments, our support team is here.',
      sentAt: '2026-04-25T09:00:00.000Z',
      deliveredAt: '2026-04-25T09:00:05.000Z',
      seenAt: '2026-04-25T09:10:00.000Z',
      status: 'seen',
    },
  ],
};

const demoThreads: ChatThread[] = [
  olamepSupportThread,
  {
    id: 'bella-keratin-studio',
    masterId: 'bella-keratin-studio',
    providerId: 'bella-keratin-studio',
    providerName: 'Bella Keratin Studio',
    providerAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    category: 'Beauty',
    online: true,
    lastSeenText: 'Online',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'provider',
        text: 'Hi, I can confirm your appointment for Tuesday at 10:30.',
        sentAt: '2026-03-17T17:42:00.000Z',
        deliveredAt: '2026-03-17T17:42:15.000Z',
        seenAt: '2026-03-17T17:49:00.000Z',
        status: 'seen',
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Perfect, thank you!',
        sentAt: '2026-03-17T17:49:00.000Z',
        deliveredAt: '2026-03-17T17:49:20.000Z',
        seenAt: '2026-03-17T17:50:30.000Z',
        status: 'seen',
      },
      {
        id: 'm3',
        sender: 'me',
        text: 'See you tomorrow at 10:30',
        sentAt: '2026-03-17T21:14:00.000Z',
        deliveredAt: '2026-03-17T21:14:20.000Z',
        seenAt: '2026-03-17T21:18:00.000Z',
        status: 'seen',
      },
      {
        id: 'm4',
        sender: 'provider',
        text: 'Great, see you tomorrow ✨',
        sentAt: '2026-03-17T21:20:00.000Z',
        deliveredAt: '2026-03-17T21:20:20.000Z',
        seenAt: '2026-03-17T21:24:00.000Z',
        status: 'seen',
      },
      {
        id: 'm5',
        sender: 'provider',
        text: 'Please come 5 minutes earlier if possible.',
        sentAt: '2026-03-17T21:21:00.000Z',
        deliveredAt: '2026-03-17T21:21:10.000Z',
        seenAt: '2026-03-17T21:25:00.000Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'mila-wellness',
    masterId: 'mila-wellness',
    providerId: 'mila-wellness',
    providerName: 'Mila Wellness',
    providerAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    category: 'Wellness',
    online: false,
    lastSeenText: 'Last seen 1 hour ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'provider',
        text: 'Thank you. Please arrive 5 minutes before your session.',
        sentAt: '2026-03-17T18:10:00.000Z',
        deliveredAt: '2026-03-17T18:10:05.000Z',
        seenAt: '2026-03-17T18:15:00.000Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'nadia-beauty',
    masterId: 'nadia-beauty',
    providerId: 'nadia-beauty',
    providerName: 'Nadia Beauty',
    providerAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    category: 'Beauty',
    online: true,
    lastSeenText: 'Online',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'provider',
        text: 'I have one more slot tomorrow if you want.',
        sentAt: '2026-03-16T13:00:00.000Z',
        deliveredAt: '2026-03-16T13:00:10.000Z',
        seenAt: '2026-03-16T13:05:00.000Z',
        status: 'seen',
      },
    ],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneThreads(threads: ChatThread[]) {
  return JSON.parse(JSON.stringify(threads)) as ChatThread[];
}

function isValidChatThreads(value: unknown): value is ChatThread[] {
  return Array.isArray(value);
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яёіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeId(value: string | number | undefined | null) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function makeThreadId(input: CreateChatThreadInput) {
  const masterId = normalizeId(input.masterId);
  const providerId = normalizeId(input.providerId);
  const bookingId = normalizeId(input.bookingId);

  if (bookingId) return `booking-${slugify(bookingId)}`;
  if (masterId) return `master-${slugify(masterId)}`;
  if (providerId) return `provider-${slugify(providerId)}`;

  return `provider-${slugify(input.providerName || 'chat')}`;
}

function normalizeThread(thread: ChatThread): ChatThread {
  const unreadCount = Number(thread.unreadCount || 0);

  return {
    ...thread,
    id: String(thread.id || slugify(thread.providerName || 'chat')),
    providerName: thread.providerName || 'Provider',
    providerAvatar: thread.providerAvatar || '',
    category: thread.category || 'Service',
    unreadCount: Number.isFinite(unreadCount) && unreadCount > 0 ? unreadCount : 0,
    messages: Array.isArray(thread.messages) ? thread.messages : [],
  };
}

function ensureSystemThreads(threads: ChatThread[]) {
  const normalized = threads.map(normalizeThread);
  const hasOlamepSupport = normalized.some((thread) => thread.id === olamepSupportThread.id);

  if (hasOlamepSupport) {
    return normalized.map((thread) => {
      if (thread.id !== olamepSupportThread.id) return thread;

      return {
        ...thread,
        providerName: 'Olamep Support',
        providerAvatar: '',
        category: 'Olamep Internal',
        online: true,
        lastSeenText: 'Online',
        unreadCount: Number(thread.unreadCount || 0),
      };
    });
  }

  return [olamepSupportThread, ...normalized];
}

function writeThreadsToStorage(threads: ChatThread[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function getChatThreads(): ChatThread[] {
  if (!canUseStorage()) {
    return cloneThreads(demoThreads);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoThreads));
    return cloneThreads(demoThreads);
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isValidChatThreads(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoThreads));
      return cloneThreads(demoThreads);
    }

    const withSystemThreads = ensureSystemThreads(parsed);

    if (JSON.stringify(withSystemThreads) !== JSON.stringify(parsed)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withSystemThreads));
    }

    return cloneThreads(withSystemThreads);
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoThreads));
    return cloneThreads(demoThreads);
  }
}

export function saveChatThreads(threads: ChatThread[]) {
  if (!canUseStorage()) return;

  const withSystemThreads = ensureSystemThreads(threads);
  writeThreadsToStorage(withSystemThreads);
  notifyChatStoreChanged();
}

export function resetDemoChatThreads() {
  if (!canUseStorage()) return;

  writeThreadsToStorage(demoThreads);
  notifyChatStoreChanged();
}

export function getChatThreadById(id: string): ChatThread | null {
  const safeId = normalizeId(id);
  if (!safeId) return null;

  const threads = getChatThreads();
  return threads.find((thread) => thread.id === safeId) ?? null;
}

export function getChatThreadByMasterId(masterId: string | number): ChatThread | null {
  const safeMasterId = normalizeId(masterId);
  if (!safeMasterId) return null;

  const threads = getChatThreads();

  return (
    threads.find((thread) => String(thread.masterId || '') === safeMasterId) ??
    threads.find((thread) => String(thread.providerId || '') === safeMasterId) ??
    threads.find((thread) => thread.id === safeMasterId) ??
    threads.find((thread) => thread.id === `master-${slugify(safeMasterId)}`) ??
    null
  );
}

export function getChatThreadByBookingId(bookingId: string | number): ChatThread | null {
  const safeBookingId = normalizeId(bookingId);
  if (!safeBookingId) return null;

  const threads = getChatThreads();

  return (
    threads.find((thread) => String(thread.bookingId || '') === safeBookingId) ??
    threads.find((thread) => thread.id === `booking-${slugify(safeBookingId)}`) ??
    null
  );
}

export function getOrCreateChatThread(input: CreateChatThreadInput): ChatThread {
  const threads = getChatThreads();

  const masterId = normalizeId(input.masterId);
  const providerId = normalizeId(input.providerId);
  const bookingId = normalizeId(input.bookingId);

  const existing =
    (bookingId ? getChatThreadByBookingId(bookingId) : null) ??
    (masterId ? getChatThreadByMasterId(masterId) : null) ??
    (providerId ? getChatThreadByMasterId(providerId) : null);

  if (existing) {
    const updatedThreads = threads.map((thread) => {
      if (thread.id !== existing.id) return thread;

      return {
        ...thread,
        masterId: thread.masterId || masterId || providerId || undefined,
        providerId: thread.providerId || providerId || masterId || undefined,
        bookingId: thread.bookingId || bookingId || undefined,
        providerName: input.providerName || thread.providerName,
        providerAvatar: input.providerAvatar ?? thread.providerAvatar,
        category: input.category || thread.category,
        online: input.online ?? thread.online,
      };
    });

    saveChatThreads(updatedThreads);

    return (
      updatedThreads.find((thread) => thread.id === existing.id) ??
      existing
    );
  }

  const now = new Date().toISOString();

  const newThread: ChatThread = {
    id: makeThreadId(input),
    masterId: masterId || providerId || undefined,
    providerId: providerId || masterId || undefined,
    bookingId: bookingId || undefined,
    providerName: input.providerName || 'Provider',
    providerAvatar: input.providerAvatar || '',
    category: input.category || 'Service',
    online: input.online ?? true,
    lastSeenText: input.online === false ? 'Offline' : 'Online',
    unreadCount: 0,
    messages: input.initialMessage
      ? [
          {
            id: `system_${Date.now()}`,
            sender: 'me',
            text: input.initialMessage,
            sentAt: now,
            deliveredAt: now,
            status: 'delivered',
          },
        ]
      : [],
  };

  saveChatThreads([newThread, ...threads]);

  return cloneThreads([newThread])[0];
}

export function getOrCreateChatThreadId(input: CreateChatThreadInput): string {
  return getOrCreateChatThread(input).id;
}

export function getUnreadMessagesCount(): number {
  return getChatThreads().reduce((sum, thread) => {
    const unread = Number(thread.unreadCount || 0);
    return sum + (Number.isFinite(unread) && unread > 0 ? unread : 0);
  }, 0);
}

export function markThreadAsRead(id: string) {
  const safeId = normalizeId(id);
  if (!safeId) return;

  const threads = getChatThreads();
  const now = new Date().toISOString();

  const updated = threads.map((thread) => {
    if (thread.id !== safeId) return thread;

    return {
      ...thread,
      unreadCount: 0,
      messages: thread.messages.map((message) => {
        if (message.sender === 'provider' && message.status !== 'seen') {
          return {
            ...message,
            status: 'seen' as ChatMessageStatus,
            seenAt: now,
          };
        }

        return message;
      }),
    };
  });

  saveChatThreads(updated);
}

export function markAllThreadsAsRead() {
  const threads = getChatThreads();
  const now = new Date().toISOString();

  const updated = threads.map((thread) => ({
    ...thread,
    unreadCount: 0,
    messages: thread.messages.map((message) => {
      if (message.sender === 'provider' && message.status !== 'seen') {
        return {
          ...message,
          status: 'seen' as ChatMessageStatus,
          seenAt: now,
        };
      }

      return message;
    }),
  }));

  saveChatThreads(updated);
}

export function sendChatMessage(threadId: string, text: string) {
  const safeThreadId = normalizeId(threadId);
  const trimmed = text.trim();

  if (!safeThreadId || !trimmed) return;

  const threads = getChatThreads();
  const now = new Date();
  const delivered = new Date(now.getTime() + 10 * 1000);

  const updated = threads.map((thread) => {
    if (thread.id !== safeThreadId) return thread;

    const newMessage: ChatMessage = {
      id: `msg_${now.getTime()}`,
      sender: 'me',
      text: trimmed,
      sentAt: now.toISOString(),
      deliveredAt: delivered.toISOString(),
      status: 'delivered',
    };

    return {
      ...thread,
      messages: [...thread.messages, newMessage],
    };
  });

  saveChatThreads(updated);
}

export function addProviderMessage(threadId: string, text: string) {
  const safeThreadId = normalizeId(threadId);
  const trimmed = text.trim();

  if (!safeThreadId || !trimmed) return;

  const threads = getChatThreads();
  const now = new Date();
  const delivered = new Date(now.getTime() + 5 * 1000);

  const updated = threads.map((thread) => {
    if (thread.id !== safeThreadId) return thread;

    const newMessage: ChatMessage = {
      id: `provider_${now.getTime()}`,
      sender: 'provider',
      text: trimmed,
      sentAt: now.toISOString(),
      deliveredAt: delivered.toISOString(),
      status: 'delivered',
    };

    return {
      ...thread,
      unreadCount: Number(thread.unreadCount || 0) + 1,
      messages: [...thread.messages, newMessage],
    };
  });

  saveChatThreads(updated);
}

export function subscribeToChatStore(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const onCustom = () => {
    callback();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener('mapbook-chat-store-changed', onCustom);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('mapbook-chat-store-changed', onCustom);
  };
}

export function notifyChatStoreChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('mapbook-chat-store-changed'));
}

export function formatChatTime(iso: string) {
  const date = new Date(iso);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatChatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();

  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameAsYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (sameDay) return 'Today';
  if (sameAsYesterday) return 'Yesterday';

  return date.toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
