import Link from 'next/link';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1712]">Profile</h1>
            <p className="mt-1 text-sm text-[#7a7065]">
              Manage your account, bookings and preferences
            </p>
          </div>

          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </Link>
        </div>

        <div className="mt-6 rounded-[32px] border border-[#efe4d7] bg-white p-5">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop"
              alt="Profile"
              className="h-20 w-20 rounded-3xl object-cover"
            />

            <div>
              <h2 className="text-xl font-bold text-[#1d1712]">Alex Carter</h2>
              <p className="mt-1 text-sm text-[#7a7065]">alex@email.com</p>
              <p className="mt-1 text-sm text-[#7a7065]">+44 7700 123456</p>
            </div>
          </div>

          <button className="mt-5 w-full rounded-2xl bg-[#2f241c] px-4 py-4 text-sm font-bold text-white">
            Edit profile
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-[#2f241c] p-4 text-white">
            <p className="text-xs text-[#d9cdbd]">Upcoming bookings</p>
            <p className="mt-2 text-3xl font-bold">3</p>
          </div>

          <div className="rounded-3xl bg-[#f2e9dc] p-4 text-[#241d17]">
            <p className="text-xs text-[#6e5f51]">Saved masters</p>
            <p className="mt-2 text-3xl font-bold">8</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/messages"
            className="block rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-sm font-bold text-[#1d1712]"
          >
            Messages
          </Link>

          <Link
            href="/booking-success"
            className="block rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-sm font-bold text-[#1d1712]"
          >
            My latest booking
          </Link>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            Payment methods
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            Notifications
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-[#1d1712]">
            Language & region
          </button>

          <button className="w-full rounded-3xl border border-[#efe4d7] bg-white px-5 py-4 text-left text-sm font-bold text-red-600">
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
