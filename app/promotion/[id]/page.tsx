'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllMasters } from '../../../services/masters';
import {
  getPromotionById,
  incrementPromotionViews,
} from '../../../services/promotionsStore';

function normalizeText(value: string) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function findPromotionMaster(promo: any, masters: any[]) {
  const normalizedCategory = String(promo.categoryId || '').toLowerCase().trim();
  const normalizedTitle = normalizeText(promo.title);
  const titleWords = normalizedTitle.split(' ').filter((word) => word.length > 2);

  const exactByMasterId = masters.find(
    (master: any) => String(master.id) === String(promo.masterId)
  );

  if (exactByMasterId) return exactByMasterId;

  const sameCategory = masters.filter(
    (master: any) => String(master.category || '').toLowerCase().trim() === normalizedCategory
  );

  const best = sameCategory
    .map((master: any) => {
      const haystack = normalizeText(
        [
          master.name || '',
          master.title || '',
          master.subcategory || '',
          master.description || '',
        ].join(' ')
      );

      let score = 0;

      if (haystack.includes(normalizedTitle)) score += 100;

      titleWords.forEach((word) => {
        if (haystack.includes(word)) score += 20;
      });

      return { master, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (best && best.score > 0) return best.master;

  return sameCategory[0] || null;
}

export default function PromotionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = String(params?.id || '');

  const promotion = useMemo(() => getPromotionById(promotionId), [promotionId]);
  const masters = useMemo(() => getAllMasters(), []);
  const matchedMaster = useMemo(() => {
    if (!promotion) return null;
    return findPromotionMaster(promotion, masters);
  }, [promotion, masters]);

  useEffect(() => {
    if (!promotionId) return;
    incrementPromotionViews(promotionId, 1);
  }, [promotionId]);

  if (!promotion) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f3eb',
          fontFamily: 'Arial, sans-serif',
          padding: '24px 16px 120px',
        }}
      >
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              border: 'none',
              background: '#fff',
              borderRadius: 999,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            }}
          >
            ← Back
          </button>

          <div
            style={{
              marginTop: 18,
              background: '#fff',
              borderRadius: 28,
              padding: 24,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#1f2430',
                lineHeight: 1.2,
              }}
            >
              Promotion not found
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 15,
                color: '#6b7280',
                fontWeight: 700,
              }}
            >
              This advertisement does not exist or has already been removed.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          padding: '16px 14px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              border: 'none',
              background: '#fff',
              borderRadius: 999,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            }}
          >
            ← Back
          </button>

          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: '#ff4f93',
              background: '#fff',
              borderRadius: 999,
              padding: '10px 14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            }}
          >
            Sponsored
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 30,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={promotion.image}
              alt={promotion.title}
              style={{
                width: '100%',
                height: 320,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: '#ffffff',
                color: '#ff4f93',
                borderRadius: 999,
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 900,
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              }}
            >
              Sponsored
            </div>
          </div>

          <div style={{ padding: '20px 18px 22px' }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#1f2430',
              }}
            >
              {promotion.title}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 17,
                fontWeight: 800,
                color: '#6b7280',
                lineHeight: 1.35,
              }}
            >
              {promotion.subtitle || 'Special offer near you'}
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div
                style={{
                  background: '#fff7fb',
                  border: '1px solid #ffd2e8',
                  color: '#ff4f93',
                  borderRadius: 999,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Views: {promotion.views}
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e6eaf0',
                  color: '#334155',
                  borderRadius: 999,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Category: {promotion.categoryId}
              </div>
            </div>

            {matchedMaster ? (
              <div
                style={{
                  marginTop: 20,
                  background: '#f9fafb',
                  border: '1px solid #ece7df',
                  borderRadius: 20,
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <img
                  src={matchedMaster.avatar}
                  alt={matchedMaster.name || matchedMaster.title || 'Master'}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#1f2430',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {matchedMaster.name || matchedMaster.title || 'Master'}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#6b7280',
                    }}
                  >
                    {matchedMaster.subcategory || matchedMaster.category || 'Service'}
                  </div>
                </div>
              </div>
            ) : null}

            <div
              style={{
                marginTop: 22,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button
                onClick={() => {
                  if (matchedMaster) {
                    router.push(`/master/${matchedMaster.id}`);
                    return;
                  }
                  router.back();
                }}
                style={{
                  height: 50,
                  borderRadius: 16,
                  border: '1px solid #e6ded2',
                  background: '#fff',
                  color: '#223145',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                Open profile
              </button>

              <button
                onClick={() => {
                  if (matchedMaster) {
                    router.push(`/booking/${matchedMaster.id}`);
                    return;
                  }
                  router.back();
                }}
                style={{
                  height: 50,
                  border: 'none',
                  borderRadius: 16,
                  background: '#ff4f93',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px rgba(255,79,147,0.28)',
                }}
              >
                Book now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
