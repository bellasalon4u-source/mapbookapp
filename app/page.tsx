import Link from 'next/link';
import { getAllMasters } from '@/services/masters';
import { categories } from '@/lib/data';
import BottomNav from '@/components/common/BottomNav';

export default function HomePage() {
  const masters = getAllMasters();

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
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
          <Link
            href="/favorites"
            className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-[#2f241c]"
          >
            ♥
          </Link>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className="whitespace-nowrap rounded-full border border-[#efe4d7] bg-white px-4 py-2 text-sm font-semibold text-[#4e463d]"
            >
              {category}
            </button>
          ))}
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1d1712]">Map view</h2>
            <button className="rounded-full border border-[#efe4d7] bg-white px-4 py-2 text-sm font-semibold text-[#4e463d]">
              Filters
            </button>
          </div>

          <div className="relative h-[360px] overflow-hidden rounded-[32px] border border-[#e8dccb] bg-[#eadfce]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f6eee3_0%,#eadfce_45%,#e2d4c0_100%)]" />

            <div className="absolute left-[8%] top-[16%] h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute right-[12%] top-[28%] h-20 w-20 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-[18%] left-[20%] h-28 w-28 rounded-full bg-white/20 blur-2xl" />

            <div className="absolute left-6 top-8 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-bold text-white shadow-lg">
              £45 · 4.9
            </div>

            <div className="absolute right-8 top-20 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2f241c] shadow-lg">
              £65 · 4.8
            </div>

            <div className="absolute left-16 bottom-24 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
              Book now
            </div>

            <div className="absolute right-10 bottom-12 rounded-full bg-[#2f241c] px-4 py-2 text-sm font-bold text-white shadow-lg">
              £55 · 4.7
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-[28px] border border-[#efe4d7] bg-white/95 p-4 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1d1712]">
                    Bella Keratin Studio
                  </h3>
                  <p className="mt-1 text-sm text-[#7a7065]">
                    Hair Extensions Specialist • London
                  </p>
                </div>

                <div className="rounded-xl bg-[#edf7ee] px-3 py-2 text-xs font-bold text-[#256b43]">
                  ● Available now
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#2f241c]">from £45</p>

                <Link
                  href="/
