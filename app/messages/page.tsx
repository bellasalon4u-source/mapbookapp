'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getChatThreads,
  getUnreadMessagesCount,
  subscribeToChatStore,
  type ChatThread,
} from '../../services/chatStore';

export default function MessagesPage() {
  const router = useRouter();

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

  const unreadTotal = useMemo(
    () => getUnreadMessagesCount(),
    [threads]
  );

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;

    return threads.filter((thread) => {
      const lastMessage = thread.messages[thread.messages.length - 1];
      return (
        thread.providerName.toLowerCase().includes(q) ||
        thread.category.toLowerCase().includes(q) ||
        lastMessage?.text?.toLowerCase().includes(q)
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
        paddingBottom: 88,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header style={{ padding: '18px 16px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr auto',
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
                Messages
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: '#7a8490',
                  fontWeight: 700,
                }}
              >
                {unreadTotal > 0
                  ? `${unreadTotal} unread message${unreadTotal > 1 ? 's' : ''}`
                  : 'All caught up'}
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
              placeholder="Search chats..."
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
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
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

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(245,243,239,0.98)',
          borderTop: '1px solid #e3ddd5',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            alignItems: 'center',
            padding: '10px 8px 12px',
          }}
        >
          <button
            onClick={() => router.push('/')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>⌂</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Home</span>
          </button>

          <button
            onClick={() => router.push('/messages')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#1f5d99',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>✉</span>

              {unreadTotal > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#e53935',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(229,57,53,0.35)',
                    border: '2px solid #f5f3ef',
                  }}
                >
                  {unreadTotal > 9 ? '9+' : unreadTotal}
                </span>
              )}
            </div>

            <span style={{ fontSize: 12, fontWeight: 800 }}>Messages</span>
          </button>

          <button
            onClick={() => router.push('/bookings')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>▤</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Bookings</span>
          </button>

          <button
            onClick={() => router.push('/profile')}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              color: '#6e7b8a',
            }}
          >
            <span style={{ fontSize: 31, lineHeight: 1, fontWeight: 700 }}>◉</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>Profile</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
