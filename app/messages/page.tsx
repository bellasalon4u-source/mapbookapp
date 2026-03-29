import Link from 'next/link';

const chats = [
  {
    id: '1',
    name: 'Bella Keratin Studio',
    lastMessage: 'Hi, I can confirm your appointment for Tuesday at 10:30.',
    time: '2 min ago',
    unread: 2,
    online: true,
    avatar:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Mila Wellness',
    lastMessage: 'Thank you. Please arrive 5 minutes before your session.',
    time: '1 h ago',
    unread: 0,
    online: false,
    avatar:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Nadia Beauty',
    lastMessage: 'I have one more slot tomorrow if you want.',
    time: 'Yesterday',
    unread: 0,
    online: true,
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1712]">Messages</h1>
            <p className="mt-1 text-sm text-[#7a7065]">
              Chat with masters about your bookings
            </p>
          </div>

          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </Link>
        </div>

        <div className="mt-5">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none"
          />
        </div>

        <div className="mt-6 space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="rounded-3xl border border-[#efe4d7] bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  {chat.online && (
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-[#1fc16b]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="truncate text-base font-bold text-[#1d1712]">
                      {chat.name}
                    </h2>
                    <span className="whitespace-nowrap text-xs text-[#7
