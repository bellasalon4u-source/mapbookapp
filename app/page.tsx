import Link from 'next/link';
import { getAllMasters } from '@/services/masters';
import { categories } from '@/lib/data';

export default function HomePage() {
  const masters = getAllMasters();

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-[#1d1712]">MapBook</h1>
        <p className="mt-2 text-sm text-[#7a7065]">
          Find beauty and wellness services near you
        </p>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Search services, masters, area..."
            className="flex-1 rounded-2xl border border-[#eadfce] bg-white px-4 py-3 outline-none"
          />
          <button className="rounded-2xl bg-[#2f241c] px-4 py-3 text-white">
            🎤
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4e463d] border border-[#efe4d7]"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {masters.map((master) => (
            <Link
              key={master.id}
              href={`/master/${master.id}`}
              className="block overflow-hidden rounded-3xl border border-[#efe4d7] bg-white"
            >
              <img
                src={master.avatar}
                alt={master.name}
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1d1712]">
                      {master.name}
                    </h2>
                    <p className="text-sm text-[#7a7065]">
                      {master.title} • {master.city}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f2e9dc] px-3 py-2 text-sm font-bold text-[#463b31]">
                    {master.rating} ★
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="rounded-full bg-[#2f241c] px-3 py-2 text-sm font-bold text-white">
                    from £{master.priceFrom}
                  </div>

                  {master.availableNow && (
                    <div className="rounded-full bg-[#edf7ee] px-3 py-2 text-sm font-semibold text-[#256b43]">
                      ● Available now
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
