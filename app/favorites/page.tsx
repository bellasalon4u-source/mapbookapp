import Link from 'next/link';
import { getAllMasters } from '../../services/masters';
import BottomNav from '../../components/common/BottomNav';

export default function FavoritesPage() {
  const masters = getAllMasters();

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1712]">Liked pins</h1>
            <p className="mt-1 text-sm text-[#7a7065]">
              Saved masters and services you want to revisit
            </p>
          </div>

          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {masters.map((master) => (
            <Link
              key={master.id}
              href={`/master/${master.id}`}
              className="block overflow-hidden rounded-3xl border border-[#efe4d7] bg-white"
            >
              <div className="relative">
                <img
                  src={master.avatar}
                  alt={master.name}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-2 text-sm font-bold text-red-600 shadow">
                  ♥
                </div>
              </div>

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

                  {master.availableNow ? (
                    <div className="rounded-full bg-[#edf7ee] px-3 py-2 text-sm font-semibold text-[#256b43]">
                      ● Available now
                    </div>
                  ) : (
                    <div className="rounded-full bg-[#f3ece2] px-3 py-2 text-sm font-semibold text-[#6d6257]">
                      Offline
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
