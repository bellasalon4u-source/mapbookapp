'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getPromotionById,
  incrementPromotionViews,
  type PromotionItem,
} from '../../../services/promotionsStore';
import { getAllMasters } from '../../../services/masters';
import { categories } from '../../../services/categories';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import { formatDisplayPrice } from '../../../services/currencyDisplay';

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 28,
        padding: 22,
        border: '1px solid #efe7db',
        boxShadow: '0 2px 10px rgba(44, 26, 12, 0.04)',
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: '#1f1f1f',
          margin: 0,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function getTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      back: 'Назад',
      notFound: 'Реклама не найдена',
      notFoundSub: 'Это предложение недоступно или больше не существует.',
      sponsored: 'Sponsored',
      specialOffer: 'Специальное предложение',
      views: 'Просмотры',
      category: 'Категория',
      save: 'Экономия',
      professional: 'Специалист',
      openProfile: 'Профиль',
      share: 'Поделиться',
      bookNow: 'Забронировать',
      aboutOffer: 'Об этом предложении',
      included: 'Что входит',
      pricing: 'Стоимость',
      oldPrice: 'Старая цена',
      now: 'Сейчас',
      youSave: 'Вы экономите',
      validUntil: 'Действует до',
      location: 'Локация',
      area: 'Район',
      address: 'Адрес',
      distance: 'Расстояние',
      copied: 'Ссылка скопирована',
      beauty: 'Красота',
    };
  }

  if (language === 'ES') {
    return {
      back: 'Atrás',
      notFound: 'Anuncio no encontrado',
      notFoundSub: 'Esta promoción no está disponible o ya no existe.',
      sponsored: 'Sponsored',
      specialOffer: 'Oferta especial',
      views: 'Vistas',
      category: 'Categoría',
      save: 'Ahorro',
      professional: 'Profesional',
      openProfile: 'Abrir perfil',
      share: 'Compartir',
      bookNow: 'Reservar',
      aboutOffer: 'Sobre esta oferta',
      included: 'Qué incluye',
      pricing: 'Precio',
      oldPrice: 'Precio anterior',
      now: 'Ahora',
      youSave: 'Ahorras',
      validUntil: 'Válido hasta',
      location: 'Ubicación',
      area: 'Zona',
      address: 'Dirección',
      distance: 'Distancia',
      copied: 'Enlace copiado',
      beauty: 'Belleza',
    };
  }

  if (language === 'CZ') {
    return {
      back: 'Zpět',
      notFound: 'Reklama nenalezena',
      notFoundSub: 'Tato nabídka není dostupná nebo již neexistuje.',
      sponsored: 'Sponsored',
      specialOffer: 'Speciální nabídka',
      views: 'Zobrazení',
      category: 'Kategorie',
      save: 'Úspora',
      professional: 'Profesionál',
      openProfile: 'Otevřít profil',
      share: 'Sdílet',
      bookNow: 'Rezervovat',
      aboutOffer: 'O této nabídce',
      included: 'Co je zahrnuto',
      pricing: 'Cena',
      oldPrice: 'Původní cena',
      now: 'Nyní',
      youSave: 'Ušetříte',
      validUntil: 'Platí do',
      location: 'Lokalita',
      area: 'Oblast',
      address: 'Adresa',
      distance: 'Vzdálenost',
      copied: 'Odkaz zkopírován',
      beauty: 'Krása',
    };
  }

  if (language === 'DE') {
    return {
      back: 'Zurück',
      notFound: 'Anzeige nicht gefunden',
      notFoundSub: 'Dieses Angebot ist nicht verfügbar oder existiert nicht mehr.',
      sponsored: 'Sponsored',
      specialOffer: 'Sonderangebot',
      views: 'Aufrufe',
      category: 'Kategorie',
      save: 'Ersparnis',
      professional: 'Profi',
      openProfile: 'Profil öffnen',
      share: 'Teilen',
      bookNow: 'Jetzt buchen',
      aboutOffer: 'Über dieses Angebot',
      included: 'Inklusive',
      pricing: 'Preis',
      oldPrice: 'Alter Preis',
      now: 'Jetzt',
      youSave: 'Sie sparen',
      validUntil: 'Gültig bis',
      location: 'Standort',
      area: 'Bereich',
      address: 'Adresse',
      distance: 'Entfernung',
      copied: 'Link kopiert',
      beauty: 'Beauty',
    };
  }

  if (language === 'PL') {
    return {
      back: 'Wstecz',
      notFound: 'Reklama nie znaleziona',
      notFoundSub: 'Ta oferta jest niedostępna lub już nie istnieje.',
      sponsored: 'Sponsored',
      specialOffer: 'Oferta specjalna',
      views: 'Wyświetlenia',
      category: 'Kategoria',
      save: 'Oszczędzasz',
      professional: 'Specjalista',
      openProfile: 'Otwórz profil',
      share: 'Udostępnij',
      bookNow: 'Zarezerwuj',
      aboutOffer: 'O tej ofercie',
      included: 'Co zawiera',
      pricing: 'Cena',
      oldPrice: 'Stara cena',
      now: 'Teraz',
      youSave: 'Oszczędzasz',
      validUntil: 'Ważne do',
      location: 'Lokalizacja',
      area: 'Obszar',
      address: 'Adres',
      distance: 'Odległość',
      copied: 'Link skopiowany',
      beauty: 'Uroda',
    };
  }

  return {
    back: 'Back',
    notFound: 'Promotion not found',
    notFoundSub: 'This promotion is unavailable or no longer exists.',
    sponsored: 'Sponsored',
    specialOffer: 'Special offer',
    views: 'Views',
    category: 'Category',
    save: 'Save',
    professional: 'Professional',
    openProfile: 'Open profile',
    share: 'Share',
    bookNow: 'Book now',
    aboutOffer: 'About this offer',
    included: 'What’s included',
    pricing: 'Pricing',
    oldPrice: 'Old price',
    now: 'Now',
    youSave: 'You save',
    validUntil: 'Valid until',
    location: 'Location',
    area: 'Area',
    address: 'Address',
    distance: 'Distance',
    copied: 'Link copied',
    beauty: 'Beauty',
  };
}

function parsePriceNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getCategoryLabel(
  promotion: PromotionItem | null,
  fallback: string
) {
  if (!promotion) return fallback;
  return (
    categories.find((item) => item.id === promotion.categoryId)?.label ||
    promotion.categoryId ||
    fallback
  );
}

export default function PromotionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = String(params?.id || '');

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [promotion, setPromotion] = useState<PromotionItem | null>(null);

  const text = getTexts(language);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    if (!promotionId) return;

    const item = getPromotionById(promotionId, language);
    setPromotion(item);

    if (item) {
      incrementPromotionViews(item.id, 1);
      const refreshed = getPromotionById(item.id, language);
      setPromotion(refreshed);
    }
  }, [promotionId, language]);

  const master = useMemo(() => {
    if (!promotion) return null;
    const masters = getAllMasters();
    return masters.find((item) => String(item.id) === String(promotion.masterId)) || null;
  }, [promotion]);

  const categoryLabel = useMemo(() => {
    return getCategoryLabel(promotion, text.beauty);
  }, [promotion, text.beauty]);

  const oldPriceValue = useMemo(() => parsePriceNumber(promotion?.oldPrice), [promotion?.oldPrice]);
  const newPriceValue = useMemo(() => parsePriceNumber(promotion?.newPrice), [promotion?.newPrice]);

  const saveAmount = useMemo(() => {
    if (oldPriceValue === null || newPriceValue === null) return 0;
    return Math.max(0, oldPriceValue - newPriceValue);
  }, [oldPriceValue, newPriceValue]);

  const handleShare = async () => {
    try {
      if (!promotion) return;

      if (navigator.share) {
        await navigator.share({
          title: promotion.title,
          text: `${promotion.title} — ${promotion.subtitle || ''}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(text.copied);
      }
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  const handleOpenProfile = () => {
    if (!promotion) return;
    router.push(`/master/${promotion.masterId}`);
  };

  const handleBookNow = () => {
    if (!promotion) return;
    router.push(`/booking/${promotion.masterId}`);
  };

  if (!promotion) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f3eb',
          padding: '24px 16px 120px',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            style={{
              border: 'none',
              background: '#ffffff',
              color: '#222222',
              borderRadius: 999,
              padding: '18px 24px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(44, 26, 12, 0.05)',
            }}
          >
            ← {text.back}
          </button>

          <div
            style={{
              marginTop: 18,
              background: '#ffffff',
              borderRadius: 28,
              padding: 24,
              border: '1px solid #efe7db',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#20202a',
                marginBottom: 10,
              }}
            >
              {text.notFound}
            </div>
            <div
              style={{
                fontSize: 18,
                color: '#6b7280',
                lineHeight: 1.6,
              }}
            >
              {text.notFoundSub}
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
        padding: '24px 16px 120px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              border: 'none',
              background: '#ffffff',
              color: '#222222',
              borderRadius: 999,
              padding: '18px 24px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(44, 26, 12, 0.05)',
            }}
          >
            ← {text.back}
          </button>

          <div
            style={{
              background: '#ffffff',
              color: '#ff4fa0',
              borderRadius: 999,
              padding: '16px 22px',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(44, 26, 12, 0.05)',
            }}
          >
            {text.sponsored}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 34,
            overflow: 'hidden',
            border: '1px solid #efe7db',
            boxShadow: '0 6px 18px rgba(44, 26, 12, 0.06)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={promotion.image}
              alt={promotion.title}
              style={{
                width: '100%',
                height: 360,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                background: '#ffffff',
                color: '#ff4fa0',
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              {text.sponsored}
            </div>
          </div>

          <div style={{ padding: 26 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 36,
                lineHeight: 1.05,
                fontWeight: 900,
                color: '#20202a',
              }}
            >
              {promotion.title}
            </h1>

            <p
              style={{
                marginTop: 12,
                marginBottom: 18,
                fontSize: 22,
                lineHeight: 1.3,
                color: '#6b7280',
                fontWeight: 700,
              }}
            >
              {promotion.subtitle || text.specialOffer}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  background: '#fff5fa',
                  color: '#ff4fa0',
                  border: '1px solid #f8d7e8',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {text.views}: {promotion.views}
              </div>

              <div
                style={{
                  background: '#f8f7f4',
                  color: '#48505e',
                  border: '1px solid #e9e4db',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {text.category}: {categoryLabel}
              </div>

              {saveAmount > 0 ? (
                <div
                  style={{
                    background: '#f1fbf4',
                    color: '#228b50',
                    border: '1px solid #d9efdf',
                    borderRadius: 999,
                    padding: '12px 18px',
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {text.save} {formatDisplayPrice(saveAmount)}
                </div>
              ) : null}
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #efe7db',
                borderRadius: 28,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <img
                src={
                  String(master?.avatar || '').trim() ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
                }
                alt={String(master?.name || promotion.title)}
                style={{
                  width: 76,
                  height: 76,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#20202a',
                    marginBottom: 4,
                  }}
                >
                  {String(master?.name || text.professional)}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    color: '#6b7280',
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {String(master?.subcategory || master?.category || categoryLabel)}
                </div>

                <div
                  style={{
                    fontSize: 16,
                    color: '#8b7355',
                    fontWeight: 700,
                  }}
                >
                  ★ {typeof master?.rating === 'number' ? master.rating : 4.9}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 14,
              }}
            >
              <button
                onClick={handleOpenProfile}
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: '1px solid #e7dfd3',
                  background: '#ffffff',
                  color: '#243041',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {text.openProfile}
              </button>

              <button
                onClick={handleShare}
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: '1px solid #e7dfd3',
                  background: '#ffffff',
                  color: '#243041',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {text.share}
              </button>

              <button
                onClick={handleBookNow}
                style={{
                  minHeight: 64,
                  borderRadius: 22,
                  border: 'none',
                  background: '#ff4fa0',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(255, 79, 160, 0.25)',
                }}
              >
                {text.bookNow}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 18,
          }}
        >
          {!!promotion.description && (
            <SectionCard title={text.aboutOffer}>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: '#4b5563',
                  fontWeight: 500,
                }}
              >
                {promotion.description}
              </p>
            </SectionCard>
          )}

          {!!promotion.included?.length && (
            <SectionCard title={text.included}>
              <div style={{ display: 'grid', gap: 12 }}>
                {promotion.included.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 18,
                      color: '#374151',
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#f1fbf4',
                        color: '#228b50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {(promotion.oldPrice || promotion.newPrice || promotion.validUntil) && (
            <SectionCard title={text.pricing}>
              <div style={{ display: 'grid', gap: 14 }}>
                {!!promotion.oldPrice && oldPriceValue !== null && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 18,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>{text.oldPrice}</span>
                    <span
                      style={{
                        color: '#9ca3af',
                        fontWeight: 700,
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatDisplayPrice(oldPriceValue)}
                    </span>
                  </div>
                )}

                {!!promotion.newPrice && newPriceValue !== null && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 22,
                    }}
                  >
                    <span style={{ color: '#20202a', fontWeight: 800 }}>{text.now}</span>
                    <span style={{ color: '#ff4fa0', fontWeight: 900 }}>
                      {formatDisplayPrice(newPriceValue)}
                    </span>
                  </div>
                )}

                {saveAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 18,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>{text.youSave}</span>
                    <span style={{ color: '#228b50', fontWeight: 800 }}>
                      {formatDisplayPrice(saveAmount)}
                    </span>
                  </div>
                )}

                {!!promotion.validUntil && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      fontSize: 18,
                    }}
                  >
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>{text.validUntil}</span>
                    <span style={{ color: '#20202a', fontWeight: 800 }}>
                      {promotion.validUntil}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {(promotion.area || promotion.address || promotion.distance) && (
            <SectionCard title={text.location}>
              <div style={{ display: 'grid', gap: 12 }}>
                {!!promotion.area && (
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#9ca3af',
                        fontWeight: 700,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.area}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: '#20202a',
                        fontWeight: 800,
                      }}
                    >
                      {promotion.area}
                    </div>
                  </div>
                )}

                {!!promotion.address && (
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#9ca3af',
                        fontWeight: 700,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.address}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: '#20202a',
                        fontWeight: 700,
                      }}
                    >
                      {promotion.address}
                    </div>
                  </div>
                )}

                {!!promotion.distance && (
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#9ca3af',
                        fontWeight: 700,
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {text.distance}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: '#20202a',
                        fontWeight: 700,
                      }}
                    >
                      {promotion.distance}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </main>
  );
}
