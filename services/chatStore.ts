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

const demoThreads: ChatThread[] = [
  {
    id: 'bella-keratin-studio',
    providerName: 'Bella Keratin Studio',
    providerAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    category: 'Beauty',
    online: true,
    lastSeenText: 'Online',
    unreadCount: 2,
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
        status: 'delivered',
      },
      {
        id: 'm5',
        sender: 'provider',
        text: 'Please come 5 minutes earlier if possible.',
        sentAt: '2026-03-17T21:21:00.000Z',
        deliveredAt: '2026-03-17T21:21:10.000Z',
        status: 'delivered',
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
    const parsed = JSON.parse(raw) as ChatThread[];
    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoThreads));
    return cloneThreads(demoThreads);
  }
}

export function saveChatThreads(threads: ChatThread[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function getChatThreadById(id: string): ChatThread | null {
  const threads = getChatThreads();
  return threads.find((thread) => thread.id === id) ?? null;
}

export function getUnreadMessagesCount(): number {
  return getChatThreads().reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
}

export function markThreadAsRead(id: string) {
  const threads = getChatThreads();
  const updated = threads.map((thread) => {
    if (thread.id !== id) return thread;
    return {
      ...thread,
      unreadCount: 0,
      messages: thread.messages.map((message) => {
        if (message.sender === 'provider' && message.status !== 'seen') {
          return {
            ...message,
            status: 'seen' as ChatMessageStatus,
            seenAt: new Date().toISOString(),
          };
        }
        return message;
      }),
    };
  });

  saveChatThreads(updated);
  notifyChatStoreChanged();
}

export function sendChatMessage(threadId: string, text: string) {
  const threads = getChatThreads();
  const now = new Date();
  const delivered = new Date(now.getTime() + 10 * 1000);

  const updated = threads.map((thread) => {
    if (thread.id !== threadId) return thread;

    const newMessage: ChatMessage = {
      id: `msg_${now.getTime()}`,
      sender: 'me',
      text,
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
  notifyChatStoreChanged();
}

export function subscribeToChatStore(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };

  const onCustom = () => callback();

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
