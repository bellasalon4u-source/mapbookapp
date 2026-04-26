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
  messages: ChatMessage[];
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
      seenAt: '2026-04-25T09:01:00.000Z',
      status: 'seen',
    },
  ],
};

const demoThreads: ChatThread[] = [
  olamepSupportThread,
  {
    id: 'bella-keratin-studio',
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
        seenAt: '2026-03-17T21:22:00.000Z',
        status: 'seen',
      },
      {
        id: 'm5',
        sender: 'provider',
        text: 'Please come 5 minutes earlier if possible.',
        sentAt: '2026-03-17T21:21:00.000Z',
        deliveredAt: '2026-03-17T21:21:10.000Z',
        seenAt: '2026-03-17T21:22:00.000Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'mila-wellness',
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
  if (!Array.isArray(value)) return false;

  return value.every((thread) => {
    return (
      thread &&
      typeof thread === 'object' &&
      typeof (thread as ChatThread).id === 'string' &&
      typeof (thread as ChatThread).providerName === 'string' &&
      Array.isArray((thread as ChatThread).messages)
    );
  });
}

function calculateThreadUnreadCount(thread: ChatThread) {
  return thread.messages.filter((message) => {
    return message.sender === 'provider' && message.status !== 'seen';
  }).length;
}

function normalizeThread(thread: ChatThread): ChatThread {
  const messages = Array.isArray(thread.messages) ? thread.messages : [];

  const normalizedMessages = messages.map((message) => {
    const safeStatus: ChatMessageStatus =
      message.status === 'sent' || message.status === 'delivered' || message.status === 'seen'
        ? message.status
        : message.seenAt
        ? 'seen'
        : 'delivered';

    return {
      ...message,
      status: safeStatus,
    };
  });

  const normalizedThread: ChatThread = {
    ...thread,
    providerAvatar: thread.providerAvatar || '',
    category: thread.category || 'Service',
    unreadCount: 0,
    messages: normalizedMessages,
  };

  return {
    ...normalizedThread,
    unreadCount: calculateThreadUnreadCount(normalizedThread),
  };
}

function normalizeThreads(threads: ChatThread[]) {
  return threads.map(normalizeThread);
}

function ensureSystemThreads(threads: ChatThread[]) {
  const normalizedThreads = normalizeThreads(threads);
  const hasOlamepSupport = normalizedThreads.some(
    (thread) => thread.id === olamepSupportThread.id
  );

  if (hasOlamepSupport) {
    return normalizedThreads.map((thread) => {
      if (thread.id !== olamepSupportThread.id) return thread;

      const fixedThread: ChatThread = {
        ...thread,
        providerName: 'Olamep Support',
        providerAvatar: '',
        category: 'Olamep Internal',
        online: true,
        lastSeenText: 'Online',
      };

      return {
        ...fixedThread,
        unreadCount: calculateThreadUnreadCount(fixedThread),
      };
    });
  }

  return [normalizeThread(olamepSupportThread), ...normalizedThreads];
}

function writeThreadsToStorage(threads: ChatThread[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function getChatThreads(): ChatThread[] {
  if (!canUseStorage()) {
    return cloneThreads(normalizeThreads(demoThreads));
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initialThreads = normalizeThreads(demoThreads);
    writeThreadsToStorage(initialThreads);
    return cloneThreads(initialThreads);
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isValidChatThreads(parsed)) {
      const initialThreads = normalizeThreads(demoThreads);
      writeThreadsToStorage(initialThreads);
      return cloneThreads(initialThreads);
    }

    const withSystemThreads = ensureSystemThreads(parsed);
    writeThreadsToStorage(withSystemThreads);

    return cloneThreads(withSystemThreads);
  } catch {
    const initialThreads = normalizeThreads(demoThreads);
    writeThreadsToStorage(initialThreads);
    return cloneThreads(initialThreads);
  }
}

export function saveChatThreads(threads: ChatThread[]) {
  if (!canUseStorage()) return;

  const withSystemThreads = ensureSystemThreads(threads);
  writeThreadsToStorage(withSystemThreads);
}

export function getChatThreadById(id: string): ChatThread | null {
  const threads = getChatThreads();
  return threads.find((thread) => thread.id === id) ?? null;
}

export function getUnreadMessagesCount(): number {
  return getChatThreads().reduce((sum, thread) => {
    return sum + calculateThreadUnreadCount(thread);
  }, 0);
}

export function markThreadAsRead(id: string) {
  const threads = getChatThreads();
  const now = new Date().toISOString();

  const updated = threads.map((thread) => {
    if (thread.id !== id) return thread;

    const updatedMessages = thread.messages.map((message) => {
      if (message.sender === 'provider' && message.status !== 'seen') {
        return {
          ...message,
          status: 'seen' as ChatMessageStatus,
          seenAt: now,
        };
      }

      return message;
    });

    return {
      ...thread,
      unreadCount: 0,
      messages: updatedMessages,
    };
  });

  saveChatThreads(updated);
  notifyChatStoreChanged();
}

export function markAllThreadsAsRead() {
  const threads = getChatThreads();
  const now = new Date().toISOString();

  const updated = threads.map((thread) => {
    const updatedMessages = thread.messages.map((message) => {
      if (message.sender === 'provider' && message.status !== 'seen') {
        return {
          ...message,
          status: 'seen' as ChatMessageStatus,
          seenAt: now,
        };
      }

      return message;
    });

    return {
      ...thread,
      unreadCount: 0,
      messages: updatedMessages,
    };
  });

  saveChatThreads(updated);
  notifyChatStoreChanged();
}

export function sendChatMessage(threadId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const threads = getChatThreads();
  const now = new Date();
  const delivered = new Date(now.getTime() + 10 * 1000);

  const updated = threads.map((thread) => {
    if (thread.id !== threadId) return thread;

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
      unreadCount: calculateThreadUnreadCount(thread),
    };
  });

  saveChatThreads(updated);
  notifyChatStoreChanged();
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
