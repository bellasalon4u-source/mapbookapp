'use client';

import { useMemo, useState } from 'react';

type MapProfileCardItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  price?: number | string;
  priceFrom?: number | string;
  online?: boolean;
  availableNow?: boolean;
  description?: string;
  image?: string;
  avatar?: string;
  images?: string[];
  tags?: string[];
};

type MapProfileCardProps = {
  item: MapProfileCardItem;
  onClose: () => void;
};

function formatCategory(item: MapProfileCardItem) {
  const value = item.subcategory || item.category || 'Beauty';
  if (!value) return 'Beauty';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MapProfileCard({ item, onClose }: MapProfileCardProps) {
  const gallery = useMemo(() => {
    if (item.images && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    if (item.avatar) return [item.avatar];

    return [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    ];
  }, [item.images, item.image, item.avatar]);

  const [activeIndex, setActiveIndex] = useState(0);

  const displayName = item.name || item.title || 'Specialist';
  const displayCategory = formatCategory(item);
  const displayCity = item.city || 'London';
  const displayRating = item.rating ?? 4.9;
  const displayPrice = item.priceFrom ?? item.price ?? 45;
  const isOnline = item.online ?? item.availableNow ?? true;
  const tags =
    item.tags && item.tags.length > 0 ? item.tags : ['💵 Наличные', '💳 Карта'];

  return (
    <div
      className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.16)] border border-neutral-200"
      style={{
        width: '100%',
        maxWidth: 420,
        maxHeight: '72vh',
        overflowY: 'auto',
      }}
    >
      <div className="relative">
        <img
          src={gallery[activeIndex]}
          alt={displayName}
          className="h-[170px] w-full object-cover"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[26px] leading-none text-neutral-700 shadow-md"
        >
          ×
        </button>

        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {gallery.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-7 bg-white' : 'w-2.5 bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2">
          <h3 className="text-[24px] font-extrabold leading-tight text-neutral-900">
            {displayName}
          </h3>
          <p className="mt-1 text-[14px] font-medium text-neutral-500">
            {displayCategory} • {displayCity}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-pink-50 px-3 py-2 text-[13px] font-bold text-pink-600">
            ★ {displayRating}
          </span>

          {isOnline && (
            <span className="rounded-full bg-green-50 px-3 py-2 text-[13px] font-bold text-green-700">
              Доступен сейчас
            </span>
          )}

          <span className="rounded-full bg-stone-100 px-3 py-2 text-[13px] font-bold text-neutral-800">
            От £{displayPrice}
          </span>
        </div>

        <p className="mb-4 text-[15px] leading-7 text-neutral-700">
          {item.description ||
            'Luxury beauty services with premium quality and a personalised experience.'}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 px-4 py-2 text-[13px] font-semibold text-neutral-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-[20px] border border-neutral-300 px-4 py-4 text-[15px] font-bold text-neutral-800"
          >
            ♡ Сохранить
          </button>

          <button
            type="button"
            className="rounded-[20px] bg-[#3b281d] px-4 py-4 text-[15px] font-bold text-white"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}
