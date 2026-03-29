import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMasterById } from '../../../services/masters';

type Props = {
  params: {
    id: string;
  };
};

export default function MasterPage({ params }: Props) {
  const master = getMasterById(params.id);

  if (!master) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fcf8f2] pb-28">
      <div className="mx-auto max-w-md">
        <div className="relative">
          <img
            src={master.avatar}
            alt={master.name}
            className="h-80 w-full object-cover"
          />

          <div className="absolute left-4 top-4">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl text-[#241c16]"
            >
              ←
            </Link>
          </div>

          <div className="absolute right-4 top-4 flex gap-2">
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-[#241c16]">
              ♡
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-[#241c16]">
              ↗
            </button>
          </div>

          <div className="absolute bottom-4 right-4 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white shadow-lg">
            Book now
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1712]">
                {master.name}
              </h1>
              <p className="mt-1 text-sm text-[#786d61]">
                {master.title} • {master.city}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f1e8da] px-3 py-2 text-sm font-bold text-[#463b31]">
              {master.rating} ★
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            {master.availableNow ? (
              <div className="rounded-full bg-[#edf7ee] px-4 py-2 text-sm font-semibold text-[#256b43]">
                ● Available now
              </div>
            ) : (
              <div className="rounded-full bg-[#f3ece2] px-4 py-2 text-sm font-semibold text-[#6d6257]">
                Offline now
              </div>
            )}

            <div className="rounded-full bg-[#2f241c] px-4 py-2 text-sm font-bold text-white">
              from £{master.priceFrom}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#5e554c]">
            {master.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 pt-5">
          <div className="rounded-3xl bg-[#2f241c] p-4 text-white">
            <p className="text-xs text-[#d9cdbd]">Reviews</p>
            <p className="mt-2 text-3xl font-bold">{master.reviewCount}</p>
          </div>

          <div className="rounded-3xl bg-[#f2e9dc] p-4 text-[#241d17]">
            <p className="text-xs text-[#6e5f51]">Starting price</p>
            <p className="mt-2 text-3xl font-bold">£{master.priceFrom}</p>
          </div>
        </div>

        <section className="px-4 pt-6">
          <h2 className="mb-3 text-2xl font-bold text-[#1d1712]">Gallery</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {master.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${master.name} ${index + 1}`}
                className="h-24 w-24 flex-none rounded-2xl object-cover"
              />
            ))}
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="mb-3 text-2xl font-bold text-[#1d1712]">Services</h2>
          <div className="space-y-3">
            {master.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-3xl border border-[#efe4d7] bg-white p-4"
              >
                <div>
                  <h3 className="text-base font-bold text-[#201914]">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#807467]">
                    {service.duration}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-[#201914]">
                    from £{service.priceFrom}
                  </p>
                  <p className="mt-1 text-lg text-[#807467]">›</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pt-6">
          <h2 className="mb-3 text-2xl font-bold text-[#1d1712]">Reviews</h2>
          <div className="space-y-3">
            {master.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-3xl border border-[#efe4d7] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-[#201914]">{review.author}</p>
                  <p className="text-sm font-semibold text-[#6a5e53]">
                    {review.rating} ★
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5f564d]">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#efe5d8] bg-[#fffdf9]">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold text-[#7d7267]">
              Secure booking fee
            </p>
            <p className="mt-1 text-2xl font-bold text-[#1f1813]">£5</p>
          </div>

          <Link
            href={`/booking/${master.id}`}
            className="rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white"
          >
            Choose date & time
          </Link>
        </div>
      </div>
    </main>
  );
}
