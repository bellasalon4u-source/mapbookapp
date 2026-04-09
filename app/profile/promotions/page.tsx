'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addPromotion,
  getPromotions,
  subscribeToPromotionsStore,
  updatePromotion,
  type PromotionItem,
} from '../../../services/promotionsStore';
import { getAllMasters } from '../../../services/masters';
import { categories } from '../../../services/categories';

const radiusOptions = [1, 3, 5, 10, 15, 25];
const durationOptions = [1, 3, 7, 14];

function formatMoney(value: number) {
  return `£${value.toFixed(0)}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeLeft(endAt: string) {
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function calcPromotionPrice(radiusKm: number, days: number) {
  const base = 6;
  const radiusPart = radiusKm * 1.6;
  const durationPart = days * 3.5;
  return Math.round(base + radiusPart + durationPart);
}

function makeId() {
  return `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function PromotionsPage() {
  const router = useRouter();
  const masters = getAllMasters();

  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [title, setTitle] = useState('Keratin Hair Extensions');
  const [subtitle, setSubtitle] = useState('20% off this week');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
  );
  const [categoryId, setCategoryId] = useState('beauty');
  const [radiusKm, setRadiusKm] = useState(5);
  const [durationDays, setDurationDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = () => setPromotions(getPromotions());
    load();
    return subscribeToPromotionsStore(load);
  }, []);

  const activePromotions = useMemo(() => {
    const now = Date.now();
    return promotions.filter((item) => {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();
      return item.status === 'active' && now >= start && now <= end;
    });
  }, [promotions]);

  const archivedPromotions = useMemo(() => {
    const now = Date.now();
    return promotions.filter((item) => {
      const end = new Date(item.endAt).getTime();
      return item.status !== 'active' || end < now;
    });
  }, [promotions]);

  const totalViews = useMemo(() => {
    return promotions.reduce((sum, item) => sum + item.views, 0);
  }, [promotions]);

  const totalSpent = useMemo(() => {
    return promotions.reduce((sum, item) => {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      return sum + calcPromotionPrice(item.radiusKm, days);
    }, 0);
  }, [promotions]);

  const price = calcPromotionPrice(radiusKm, durationDays);
  const featuredMaster = masters[0];

  const handleLaunchPromotion = () => {
    if (!title.trim()) return;
    if (!image.trim()) return;

    setIsSubmitting(true);

    const now = new Date();
    const end = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    addPromotion({
      id: makeId(),
      masterId: String(featuredMaster?.id || 'master-1'),
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: image.trim(),
      categoryId,
      centerLat: Number(featuredMaster?.lat || 51.5074),
      centerLng: Number(featuredMaster?.lng || -0.1278),
      radiusKm,
      startAt: now.toISOString(),
      endAt: end.toISOString(),
      createdAt: now.toISOString(),
      status: 'active',
      views: 0,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setTitle('New client offer');
      setSubtitle('Book today and save');
      setRadiusKm(5);
      setDurationDays(3);
    }, 300);
  };

  const handlePausePromotion = (promotionId: string) => {
    updatePromotion(promotionId, { status: 'paused' });
  };

  const handleResumePromotion = (promotionId: string) => {
    updatePromotion(promotionId, { status: 'active' });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        padding: '16px 14px 34px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: '1px solid #e7dfd2',
              background: '#fff',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>My Promotions</div>
            <div style={{ fontSize: 13, color: '#737b86', fontWeight: 700 }}>
              Create, launch and manage your ads
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>Active ads</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900, color: '#ff3b30' }}>
              {activePromotions.length}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>Total views</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900, color: '#ff3b30' }}>
              {totalViews}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>Spent</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900, color: '#ff3b30' }}>
              {formatMoney(totalSpent)}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>Bookings from ads</div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900, color: '#2ea44f' }}>
              0
            </div>
          </div>
        </div>

        {activePromotions.length > 0 ? (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Active promotion</div>

            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                style={{
                  background: '#fff',
                  borderRadius: 28,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  marginBottom: 14,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={promo.image}
                    alt={promo.title}
                    style={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      background: '#fff',
                      color: '#ff4f93',
                      borderRadius: 999,
                      padding: '9px 16px',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    Sponsored
                  </div>
                </div>

                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>{promo.title}</div>

                  <div style={{ marginTop: 8, fontSize: 15, color: '#6f7782', fontWeight: 700 }}>
                    {promo.subtitle || 'Special offer'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        background: '#fff5f5',
                        border: '1px solid #f4d4d2',
                        color: '#ff3b30',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      Active
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        background: '#fff5f5',
                        border: '1px solid #f4d4d2',
                        color: '#ff3b30',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      {formatMoney(
                        calcPromotionPrice(
                          promo.radiusKm,
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date(promo.endAt).getTime() - new Date(promo.startAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                        )
                      )}
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        background: '#fff5f5',
                        border: '1px solid #f4d4d2',
                        color: '#ff3b30',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      {formatTimeLeft(promo.endAt)}
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 999,
                        background: '#f8f9fb',
                        border: '1px solid #e5e7eb',
                        color: '#1f2430',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      Views: {promo.views}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <button
                      onClick={() => router.push(`/promotion/${promo.id}`)}
                      style={{
                        height: 48,
                        borderRadius: 16,
                        border: '1px solid #e7dfd2',
                        background: '#fff',
                        color: '#1f2430',
                        fontSize: 16,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handlePausePromotion(promo.id)}
                      style={{
                        height: 48,
                        border: 'none',
                        borderRadius: 16,
                        background: '#ffd84d',
                        color: '#533f00',
                        fontSize: 16,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      Pause
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>New promotion</div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Photo URL</div>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                width: '100%',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#f3f4f6',
                border: '1px solid #ece7df',
              }}
            >
              <img
                src={image}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Subtitle</div>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Category</div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 14,
                  border: '1px solid #e7dfd2',
                  padding: '0 14px',
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                }}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Radius</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {radiusOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setRadiusKm(item)}
                    style={{
                      border: radiusKm === item ? '2px solid #ff3b30' : '1px solid #e7dfd2',
                      background: '#fff',
                      color: radiusKm === item ? '#ff3b30' : '#1f2430',
                      borderRadius: 999,
                      padding: '10px 14px',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {item} km
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6f7782', marginBottom: 8 }}>Days</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {durationOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDurationDays(item)}
                    style={{
                      border: durationDays === item ? '2px solid #ff3b30' : '1px solid #e7dfd2',
                      background: '#fff',
                      color: durationDays === item ? '#ff3b30' : '#1f2430',
                      borderRadius: 999,
                      padding: '10px 14px',
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {item} day{item > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #f3d7d4',
                borderRadius: 20,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#7b848f', fontWeight: 800 }}>Estimated price</div>
              <div style={{ marginTop: 6, fontSize: 30, fontWeight: 900, color: '#ff3b30' }}>
                {formatMoney(price)}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#6f7782', fontWeight: 700 }}>
                Radius {radiusKm} km • {durationDays} day{durationDays > 1 ? 's' : ''}
              </div>
            </div>

            <button
              onClick={handleLaunchPromotion}
              disabled={isSubmitting}
              style={{
                height: 54,
                border: 'none',
                borderRadius: 18,
                background: '#2ea44f',
                color: '#fff',
                fontSize: 18,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(46,164,79,0.24)',
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? 'Launching...' : 'Launch promotion'}
            </button>
          </div>
        </div>

        {archivedPromotions.length > 0 ? (
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>Previous promotions</div>

            <div style={{ display: 'grid', gap: 12 }}>
              {archivedPromotions.map((promo) => (
                <div
                  key={promo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 22,
                    padding: 14,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={promo.image}
                    alt={promo.title}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 18,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.15 }}>{promo.title}</div>

                    <div style={{ marginTop: 6, fontSize: 13, color: '#6f7782', fontWeight: 700 }}>
                      {promo.subtitle || 'Special offer'}
                    </div>

                    <div style={{ marginTop: 8, fontSize: 13, color: '#6f7782', fontWeight: 700 }}>
                      {formatDateLabel(promo.startAt)} → {formatDateLabel(promo.endAt)}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          padding: '7px 10px',
                          borderRadius: 999,
                          background: '#f8f9fb',
                          border: '1px solid #e5e7eb',
                          fontSize: 12,
                          fontWeight: 900,
                          color: '#1f2430',
                        }}
                      >
                        Views: {promo.views}
                      </span>

                      <button
                        onClick={() => handleResumePromotion(promo.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 999,
                          border: 'none',
                          background: '#2ea44f',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        Relaunch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
