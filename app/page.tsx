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
