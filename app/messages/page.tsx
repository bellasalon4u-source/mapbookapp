'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  formatChatDayLabel,
  formatChatTime,
  getChatThreadById,
  markThreadAsRead,
  sendChatMessage,
  subscribeToChatStore,
  type ChatThread,
} from '../../../services/chatStore';

export default function ChatThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = String(params?.id || '');

  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const load = () => {
      const current = getChatThreadById(threadId);
      setThread(current);
    };

    load();
    markThreadAsRead(threadId);
    load();

    const unsubscribe = subscribeToChatStore(() => {
      load();
    });

    return unsubscribe;
  }, [threadId]);

  const groupedMessages = useMemo(() => {
    if (!thread) return [];

    const groups: Array<{
      dayLabel: string;
      items: typeof thread.messages;
    }> = [];

    thread.messages.forEach((message) => {
      const dayLabel = formatChatDayLabel(message.sentAt);
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.dayLabel !== dayLabel) {
        groups.push({
          dayLabel,
          items: [message],
        });
      } else {
        lastGroup.items.push(message);
      }
    });

    return groups;
  }, [thread]);

  if (!thread) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f5f3ef',
          fontFamily: 'Arial, sans-serif',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            onClick={() => router.push('/messages')}
            style={{
              border: 'none',
              background: '#fff',
              width: 52,
              height: 52,
              borderRadius: 999,
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            ←
          </button>

          <div
            style={{
              marginTop: 20,
              background: '#fff',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            Chat not found
          </div>
        </div>
      </main>
    );
  }

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;

    sendChatMessage(thread.id, text);
    setMessageText('');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f3ef',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 96,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'rgba(245,243,239,0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e5ddd2',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr 52px',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push('/messages')}
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
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#6d7887',
                  fontWeight: 700,
                }}
              >
                <span>{thread.category}</span>
                <span>•</span>
                <span style={{ color: thread.online ? '#2f9c47' : '#7b848f' }}>
                  {thread.online ? 'Online' : thread.lastSeenText || 'Offline'}
                </span>
              </div>
            </div>

            <button
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
              ⓘ
            </button>
          </div>
        </header>

        <section style={{ padding: '16px 14px 0' }}>
          {groupedMessages.map((group) => (
            <div key={group.dayLabel} style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: '#7f8791',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.72)',
                    padding: '6px 12px',
                    borderRadius: 999,
                  }}
                >
                  {group.dayLabel}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {group.items.map((message, index) => {
                  const isMine = message.sender === 'me';
                  const isLastInGroup = index === group.items.length - 1;

                  return (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '78%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            background: isMine ? '#e9f2f1' : '#ffffff',
                            color: '#2b3138',
                            borderRadius: 18,
                            padding: '14px 14px 12px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                            border: isMine ? '1px solid #d9e8e6' : '1px solid #ece4d9',
                            fontSize: 16,
                            lineHeight: 1.4,
                          }}
                        >
                          {message.text}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            color: '#7d8792',
                            fontWeight: 700,
                          }}
                        >
                          <span>{formatChatTime(message.sentAt)}</span>

                          {isMine && (
                            <span
                              style={{
                                color:
                                  message.status === 'seen'
                                    ? '#41a3bf'
                                    : '#93a0ab',
                                letterSpacing: '-1px',
                                fontSize: 13,
                              }}
                            >
                              {message.status === 'sent'
                                ? '✓'
                                : message.status === 'delivered'
                                ? '✓✓'
                                : '✓✓'}
                            </span>
                          )}

                          {isMine && message.status === 'seen' && message.seenAt && (
                            <span>Seen {formatChatTime(message.seenAt)}</span>
                          )}
                        </div>

                        {isMine && message.status === 'seen' && isLastInGroup && (
                          <div
                            style={{
                              marginTop: 6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <img
                              src={thread.providerAvatar}
                              alt={thread.providerName}
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 999,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                color: '#7d8792',
                                fontWeight: 700,
                              }}
                            >
                              Read by {thread.providerName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(245,243,239,0.98)',
          borderTop: '1px solid #e4ddd3',
          backdropFilter: 'blur(12px)',
          padding: '12px 12px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write a message here"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: '#eaf0ef',
                borderRadius: 16,
                padding: '16px 16px',
                fontSize: 16,
                color: '#2b3138',
              }}
            />

            <button
              onClick={handleSend}
              style={{
                border: 'none',
                background: messageText.trim() ? '#2f8f43' : '#cfd8d6',
                color: '#fff',
                borderRadius: 14,
                padding: '14px 18px',
                fontSize: 16,
                fontWeight: 800,
                minWidth: 76,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
