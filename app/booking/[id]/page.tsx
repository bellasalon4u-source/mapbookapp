import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMasterById } from '@/services/masters';

type Props = {
  params: {
    id: string;
  };
};

const dates = ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30'];
const times = ['09:00', '10:30', '12:00', '14:00', '16:30', '18:00'];

export default function BookingPage({ params }: Props) {
  const master = getMasterById(params.id);

  if (!master) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fcf8f2] pb-28">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/master/${master.id}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-[#1d1712]">Book appointment</h1>
            <p className="text-sm text-[#7a7065]">{master.name}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[#efe4d7] bg-white p-4">
          <div className="flex items-center gap-3">
            <img
              src={master.avatar}
              alt={master.name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#1d1712]">{master.name}</h2>
              <p className="text-sm text-[#7a7065]">
                {master.title} • {master.city}
              </p>
            </div>
            <div className="rounded-xl bg-[#f2e9dc] px-3 py-2 text-sm font-bold text-[#463b31]">
              {master.rating} ★
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-xl font-bold text-[#1d1712]">Choose date</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {dates.map((date, index) => (
              <button
                key={date}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  index === 0
                    ? 'bg-[#2f241c] text-white'
                    : 'bg-white text-[#4e463d] border border-[#efe4d7]'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xl font-bold text-[#1d1712]">Choose time</h2>
          <div className="grid grid-cols-3 gap-3">
            {times.map((time, index) => (
              <button
                key={time}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                  index === 1
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-[#4e463d] border border-[#efe4d7]'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xl font-bold text-[#1d1712]">Your details</h2>

          <div className="space-y-3 rounded-3xl border border-[#efe4d7] bg-white p-4">
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-2xl border border-[#eadfce] px-4 py-3 outline-none"
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-2xl border border-[#eadfce] px-4 py-3 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-[#eadfce] px-4 py-3 outline-none"
            />

            <p className="text-xs leading-5 text-[#7a7065]">
              If the user is already authorized, these details will be filled automatically later.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#efe4d7] bg-white p-4">
          <h2 className="text-xl font-bold text-[#1d1712]">Booking summary</h2>

          <div className="mt-4 space-y-3 text-sm text-[#5f564d]">
            <div className="flex items-center justify-between">
              <span>Service</span>
              <span className="font-semibold text-[#1d1712]">
                {master.services[0]?.title}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Date</span>
              <span className="font-semibold text-[#1d1712]">{dates[0]}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Time</span>
              <span className="font-semibold text-[#1d1712]">{times[1]}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Secure booking fee</span>
              <span className="font-semibold text-[#1d1712]">£5</span>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#efe5d8] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold text-[#7d7267]">To confirm</p>
            <p className="mt-1 text-2xl font-bold text-[#1f1813]">£5</p>
          </div>

          <button className="rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white">
            Confirm booking
          </button>
        </div>
      </div>
    </main>
  );
}
