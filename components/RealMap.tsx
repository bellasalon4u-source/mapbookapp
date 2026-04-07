'use client';

import { useEffect, useMemo, useState } from 'react';
import L, { type DivIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type MasterItem = {
  id: string | number;
  name?: string;
  title?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  price?: string | number;
  availableNow?: boolean;
  availableToday?: boolean;
  lat?: number;
  lng?: number;
  avatar?: string;
  gallery?: string[];
  description?: string;
  paymentMethods?: string[] | string;
};

type RealMapProps = {
  masters?: MasterItem[];
};

const DEFAULT_MASTERS: MasterItem[] = [
  {
    id: 1,
    name: 'Alex Hair Master',
    category: 'Hair',
    subcategory: 'Extensions',
    city: 'London',
    rating: 5,
    price: '£80',
    availableNow: true,
    lat: 51.5074,
    lng: -0.1278,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
    ],
    description:
      'Luxury hair extensions, keratin bonds, tape-ins and nano ring services in London.',
    paymentMethods: ['Cash', 'Card'],
  },
  {
    id: 2,
    name: 'Nails by Sofia',
    category: 'Nails',
    subcategory: 'Manicure',
    city: 'London',
    rating: 4.9,
    price: '£35',
    availableNow: false,
    lat: 51.5155,
    lng: -0.091,
    avatar: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1200&auto=format&fit=crop',
    ],
    description:
      'Clean luxury manicure, BIAB, gel polish and elegant nail sets.',
    paymentMethods: ['Card'],
  },
  {
    id: 3,
    name: 'Glow Skin Studio',
    category: 'Beauty',
    subcategory: 'Facial',
    city: 'London',
    rating: 4.8,
    price: '£55',
    availableNow: true,
    lat: 51.5033,
    lng: -0.1195,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop',
    ],
    description:
      'Facials, skin glow treatments and premium beauty care with a soft luxury touch.',
    paymentMethods: ['Cash', 'Card'],
  },
];

function createPinIcon(image?: string, isActive?: boolean, availableNow?: boolean): DivIcon {
  const borderColor = isActive ? '#ff4fa3' : '#ffffff';
  const glowColor = availableNow ? '#33c65c' : '#d1d5db';

  return L.divIcon({
    className: '',
    html: `
      <div style="position: relative; width: 58px; height: 58px;">
        <div style="
          width: 58px;
          height: 58px;
          border-radius: 9999px;
          overflow: hidden;
          border: 4px solid ${borderColor};
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
          background: #f3f4f6;
        ">
          <img
            src="${image || 'https://via.placeholder.com/200x200.png?text=Pro'}"
            style="width:100%;height:100%;object-fit:cover;"
          />
        </div>

        <div style="
          position:absolute;
          right:-2px;
          bottom:2px;
          width:18px;
          height:18px;
          border-radius:9999px;
          background:${glowColor};
          border:4px solid #ffffff;
        "></div>

        <div style="
          position:absolute;
          left:50%;
          bottom:-10px;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:14px solid ${isActive ? '#ff4fa3' : '#e879b6'};
        "></div>
      </div>
    `,
    iconSize: [58, 72],
    iconAnchor: [29, 62],
    popupAnchor: [0, -58],
  });
}

function FlyToSelected({ selected }: { selected: MasterItem | null }) {
  const map = useMap();

  useEffect(() => {
    if (
      selected &&
      typeof selected.lat === 'number' &&
      typeof selected.lng === 'number'
    ) {
      map.flyTo([selected.lat, selected.lng], 13, {
        duration: 0.8,
      });
    }
  }, [selected, map]);

  return null;
}

export default function RealMap({ masters = [] }: RealMapProps) {
  const data = useMemo(() => {
    const source = masters.length ? masters : DEFAULT_MASTERS;

    return source.filter(
      (item) =>
        typeof item.lat === 'number' &&
        typeof item.lng === 'number'
    );
  }, [masters]);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMaster, setSelectedMaster] = useState<MasterItem | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((item) => item.category).filter(Boolean))
    ) as string[];

    return ['All', ...unique];
  }, [data]);

  const filteredMasters = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((master) => {
      const matchesCategory =
        activeCategory === 'All' || master.category === activeCategory;

      const text = [
        master.name,
        master.title,
        master.category,
        master.subcategory,
        master.city,
        master.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !q || text.includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [data, search, activeCategory]);

  useEffect(() => {
    if (!selectedMaster && filteredMasters.length > 0) {
      setSelectedMaster(filteredMasters[0]);
    }
  }, [filteredMasters, selectedMaster]);

  useEffect(() => {
    if (!selectedMaster) return;

    const stillExists = filteredMasters.some(
      (item) => String(item.id) === String(selectedMaster.id)
    );

    if (!stillExists) {
      setSelectedMaster(filteredMasters[0] || null);
      setActiveSlide(0);
    }
  }, [filteredMasters, selectedMaster]);

  const currentGallery = selectedMaster?.gallery?.length
    ? selectedMaster.gallery
    : selectedMaster?.avatar
    ? [selectedMaster.avatar]
    : [];

  const mapCenter: [number, number] =
    selectedMaster && typeof selectedMaster.lat === 'number' && typeof selectedMaster.lng === 'number'
      ? [selectedMaster.lat, selectedMaster.lng]
      : filteredMasters.length > 0 &&
        typeof filteredMasters[0].lat === 'number' &&
        typeof filteredMasters[0].lng === 'number'
      ? [filteredMasters[0].lat as number, filteredMasters[0].lng as number]
      : [51.5074, -0.1278];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f5f1e8]">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={11}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToSelected selected={selectedMaster} />

          {filteredMasters.map((master) => {
            if (
              typeof master.lat !== 'number' ||
              typeof master.lng !== 'number'
            ) {
              return null;
            }

            const isActive =
              selectedMaster && String(selectedMaster.id) === String(master.id);

            return (
              <Marker
                key={master.id}
                position={[master.lat, master.lng]}
                icon={createPinIcon(master.avatar, isActive, master.availableNow)}
                eventHandlers={{
                  click: () => {
                    setSelectedMaster(master);
                    setActiveSlide(0);
                  },
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      <div className="absolute inset-x-0 top-0 z-[1000] p-4">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-[#f5f1e8]/95 p-3 backdrop-blur">
          <div className="mb-3">
            <div className="flex items-center gap-3 rounded-[26px] bg-white px-4 py-4 shadow-sm">
              <span className="text-[24px]">🔎</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search masters, services, city"
                className="w-full border-none bg-transparent text-[18px] outline-none"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="text-[28px] leading-none text-gray-400"
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>

          <div className="mb-3 flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => {
              const count =
                category === 'All'
                  ? data.length
                  : data.filter((item) => item.category === category).length;

              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex shrink-0 items-center gap-3 rounded-full border px-5 py-4 text-[18px] font-semibold shadow-sm ${
                    active
                      ? 'border-pink-400 bg-white text-black'
                      : 'border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  <span>❤️</span>
                  <span>{category}</span>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-full border border-gray-200 px-2 text-[18px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] bg-white/70 p-3">
            <div className="mb-2 text-[18px] font-bold text-gray-600">
              Professionals
            </div>

            {filteredMasters.length === 0 ? (
              <div className="rounded-[22px] bg-white p-4 text-[17px] text-gray-500">
                Nothing found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMasters.map((master) => {
                  const active =
                    selectedMaster &&
                    String(selectedMaster.id) === String(master.id);

                  return (
                    <button
                      key={master.id}
                      onClick={() => {
                        setSelectedMaster(master);
                        setActiveSlide(0);
                      }}
                      className={`block w-full rounded-[22px] px-4 py-4 text-left ${
                        active ? 'bg-pink-50' : 'bg-white'
                      }`}
                    >
                      <div className="text-[20px] font-bold text-gray-900">
                        {master.name || master.title || 'Professional'}
                      </div>
                      <div className="text-[16px] text-gray-500">
                        {master.category || 'Beauty'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <div className="rounded-full bg-[#e7f5df] px-6 py-4 text-[18px] font-semibold text-[#2f9e44]">
              {filteredMasters.filter((item) => item.availableNow).length} pros available now
            </div>
          </div>
        </div>
      </div>

      {selectedMaster ? (
        <div className="absolute inset-x-0 bottom-0 z-[1100] mx-auto w-full max-w-3xl p-4">
          <div className="overflow-hidden rounded-[34px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
            <div className="relative">
              <img
                src={currentGallery[activeSlide] || selectedMaster.avatar}
                alt={selectedMaster.name || 'Master'}
                className="h-[240px] w-full object-cover"
              />

              <button
                onClick={() => setSelectedMaster(null)}
                className="absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[38px] leading-none text-gray-700 shadow"
              >
                ×
              </button>

              {currentGallery.length > 1 ? (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                  {currentGallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`h-4 rounded-full ${
                        activeSlide === index ? 'w-14 bg-white' : 'w-4 bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="p-6">
              <h2 className="mb-1 text-[28px] font-extrabold text-gray-900">
                {selectedMaster.name || selectedMaster.title || 'Professional'}
              </h2>

              <div className="mb-5 text-[18px] text-gray-500">
                {selectedMaster.category || 'Beauty'} • {selectedMaster.city || 'London'}
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                <div className="rounded-full bg-pink-50 px-5 py-3 text-[18px] font-bold text-pink-600">
                  ★ {selectedMaster.rating || 5}
                </div>

                <div className="rounded-full bg-green-50 px-5 py-3 text-[18px] font-bold text-green-700">
                  {selectedMaster.availableNow ? 'Доступен сейчас' : 'Не сейчас'}
                </div>

                <div className="rounded-full bg-gray-100 px-5 py-3 text-[18px] font-bold text-gray-700">
                  From {selectedMaster.price || '£45'}
                </div>
              </div>

              <p className="mb-6 text-[18px] leading-8 text-gray-700">
                {selectedMaster.description || 'Premium beauty services in your area.'}
              </p>

              <div className="mb-8 flex flex-wrap gap-3">
                {Array.isArray(selectedMaster.paymentMethods)
                  ? selectedMaster.paymentMethods.map((method) => (
                      <div
                        key={method}
                        className="rounded-full border border-gray-200 px-5 py-3 text-[18px] font-semibold text-gray-700"
                      >
                        {method === 'Cash' ? '💵 Cash' : method === 'Card' ? '💳 Card' : method}
                      </div>
                    ))
                  : selectedMaster.paymentMethods
                  ? (
                    <div className="rounded-full border border-gray-200 px-5 py-3 text-[18px] font-semibold text-gray-700">
                      {selectedMaster.paymentMethods}
                    </div>
                    )
                  : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="rounded-[24px] border border-gray-200 px-6 py-5 text-[18px] font-bold text-gray-800">
                  ♡ Save
                </button>

                <button className="rounded-[24px] bg-[#4b2e1f] px-6 py-5 text-[18px] font-bold text-white">
                  Book now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
