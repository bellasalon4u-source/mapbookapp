'use client';

import { useState } from 'react';

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

export default function MapProfileCard({ item, onClose }: MapProfileCardProps) {
  const gallery =
    item.images && item.images.length > 0
      ? item.images
      : [item.image || item.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80'];

  const [activeIndex, setActiveIndex] = useState(0);

  const displayName = item.name || item.title || 'Specialist';
  const displayCategory = item.category || item.subcategory || 'Beauty';
  const displayCity = item.city || 'London';
  const displayRating = item.rating ?? 4.9;
  const displayPrice = item.priceFrom ?? item.price ?? 45;
  const isOnline = item.online ?? item.availableNow ?? true;

  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-neutral-200">
      <div className="relative">
        <img
          src={gallery[activeIndex]}
          alt={displayName}
          className="h-[230px] w-full object-cover"
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[28px] leading-none text-neutral-700 shadow-md"
          aria-label="Close"
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
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-6 bg-white' : 'w-2.5 bg-white/60'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-[28px] font-bold leading-tight text-neutral-900">
            {displayName}
          </h3>
          <p className="mt-1 text-[15px] text-neutral-500">
            {displayCategory} • {displayCity}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-sm font-semibold text-pink-600">
            ★ {displayRating}
          </span>

          {isOnline && (
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
              Доступен сейчас
            </span>
          )}

          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-neutral-800">
            От £{displayPrice}
          </span>
        </div>

        <p className="mb-4 text-[15px] leading-6 text-neutral-700">
          {item.description ||
            'Luxury beauty services with premium quality, careful detail and a personalised experience.'}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {(item.tags && item.tags.length > 0
            ? item.tags
            : ['💵 Наличные', '💳 Карта']
          ).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-[22px] border border-neutral-300 px-4 py-4 text-base font-semibold text-neutral-800"
          >
            ♡ Сохранить
          </button>

          <button
            type="button"
            className="rounded-[22px] bg-[#3b281d] px-4 py-4 text-base font-semibold text-white"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}
