'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPromotions,
  subscribeToPromotionsStore,
  updatePromotion,
  type PromotionItem,
  type PromotionStatus,
} from '../../../services/promotionsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

function formatMoney(value: number) {
  return `£${value.toFixed(0)}`;
}

function calcPromotionPrice(radiusKm: number, days: number) {
  const base = 6;
  const radiusPart = radiusKm * 1.6;
  const durationPart = days * 3.5;
  return Math.round(base + radiusPart + durationPart);
}

function getPromotionDays(item: PromotionItem) {
  const start = new Date(item.startAt).getTime();
  const end = new Date(item.endAt).getTime();
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function getTimeLeftLabel(endAt: string, language: AppLanguage) {
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    if (language === 'RU') return 'Истекла';
    if (language === 'ES') return 'Finalizada';
    if (language === 'CZ') return 'Ukončeno';
    if (language === 'DE') return 'Beendet';
    if (language === 'PL') return 'Zakończono';
    return 'Ended';
  }

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / 60 / 24);
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

  if (language === 'RU') return `${days}д ${hours}ч осталось`;
  if (language === 'ES') return `quedan ${days}d ${hours}h`;
  if (language === 'CZ') return `zbývá ${days}d ${hours}h`;
  if (language === 'DE') return `${days}T ${hours}Std übrig`;
  if (language === 'PL') return `zostało ${days}d ${hours}h`;
  return `${days}d ${hours}h left`;
}

function isPromotionActiveNow(item: PromotionItem) {
  const now = Date.now();
  const start = new Date(item.startAt).getTime();
  const end = new Date(item.endAt).getTime();
  return item.status === 'active' && now >= start && now <= end;
}

function getLabels(language: AppLanguage) {
  if (language === 'RU') {
    return {
      pageTitle: 'Мои рекламы',
      pageSubtitle: 'Создавайте, запускайте и управляйте рекламой',
      activeAds: 'Активные',
      totalViews: 'Просмотры',
      bookings: 'Брони',
      radius: 'Радиус',
      createPromotion: 'Создать рекламу',
      createPromotionSubtitle: 'Запустить новую рекламу',
      yourAds: 'Ваши объявления',
      active: 'Активна',
      inactive: 'Неактивна',
      sponsored: 'Sponsored',
      views: 'Просмотры',
      bookingsSmall: 'Брони',
      radiusSmall: 'Радиус',
      reactivate: 'Активировать повторно',
      deactivate: 'Деактивировать',
      noAds: 'У вас пока нет рекламных объявлений',
      noAdsHint: 'Создайте первую рекламу и запустите её после оплаты',
      totalSpent: 'Потрачено',
      noRefund: 'Деньги за рекламу не возвращаются',
      statusActiveIcon: '✓',
      statusInactiveIcon: '✕',
    };
  }

  if (language === 'ES') {
    return {
      pageTitle: 'Mis anuncios',
      pageSubtitle: 'Crea, lanza y gestiona tu publicidad',
      activeAds: 'Activos',
      totalViews: 'Vistas',
      bookings: 'Reservas',
      radius: 'Radio',
      createPromotion: 'Crear anuncio',
      createPromotionSubtitle: 'Lanzar un nuevo anuncio',
      yourAds: 'Tus anuncios',
      active: 'Activa',
      inactive: 'Inactiva',
      sponsored: 'Sponsored',
      views: 'Vistas',
      bookingsSmall: 'Reservas',
      radiusSmall: 'Radio',
      reactivate: 'Activar de nuevo',
      deactivate: 'Desactivar',
      noAds: 'Todavía no tienes anuncios',
      noAdsHint: 'Crea tu primer anuncio y lánzalo después del pago',
      totalSpent: 'Gastado',
      noRefund: 'El dinero del anuncio no se reembolsa',
      statusActiveIcon: '✓',
      statusInactiveIcon: '✕',
    };
  }

  if (language === 'CZ') {
    return {
      pageTitle: 'Moje reklamy',
      pageSubtitle: 'Vytvářejte, spouštějte a spravujte svou reklamu',
      activeAds: 'Aktivní',
      totalViews: 'Zobrazení',
      bookings: 'Rezervace',
      radius: 'Rádius',
      createPromotion: 'Vytvořit reklamu',
      createPromotionSubtitle: 'Spustit novou reklamu',
      yourAds: 'Vaše reklamy',
      active: 'Aktivní',
      inactive: 'Neaktivní',
      sponsored: 'Sponsored',
      views: 'Zobrazení',
      bookingsSmall: 'Rezervace',
      radiusSmall: 'Rádius',
      reactivate: 'Znovu aktivovat',
      deactivate: 'Deaktivovat',
      noAds: 'Zatím nemáte žádné reklamy',
      noAdsHint: 'Vytvořte svou první reklamu a spusťte ji po platbě',
      totalSpent: 'Utraceno',
      noRefund: 'Peníze za reklamu se nevracejí',
      statusActiveIcon: '✓',
      statusInactiveIcon: '✕',
    };
  }

  if (language === 'DE') {
    return {
      pageTitle: 'Meine Werbung',
      pageSubtitle: 'Erstellen, starten und verwalten Sie Ihre Werbung',
      activeAds: 'Aktiv',
      totalViews: 'Aufrufe',
      bookings: 'Buchungen',
      radius: 'Radius',
      createPromotion: 'Werbung erstellen',
      createPromotionSubtitle: 'Neue Werbung starten',
      yourAds: 'Ihre Anzeigen',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      sponsored: 'Sponsored',
      views: 'Aufrufe',
      bookingsSmall: 'Buchungen',
      radiusSmall: 'Radius',
      reactivate: 'Erneut aktivieren',
      deactivate: 'Deaktivieren',
      noAds: 'Sie haben noch keine Werbeanzeigen',
      noAdsHint: 'Erstellen Sie Ihre erste Werbung und starten Sie sie nach der Zahlung',
      totalSpent: 'Ausgegeben',
      noRefund: 'Werbekosten werden nicht erstattet',
      statusActiveIcon: '✓',
      statusInactiveIcon: '✕',
    };
  }

  if (language === 'PL') {
    return {
      pageTitle: 'Moje reklamy',
      pageSubtitle: 'Twórz, uruchamiaj i zarządzaj reklamami',
      activeAds: 'Aktywne',
      totalViews: 'Wyświetlenia',
      bookings: 'Rezerwacje',
      radius: 'Promień',
      createPromotion: 'Dodaj reklamę',
      createPromotionSubtitle: 'Uruchom nową reklamę',
      yourAds: 'Twoje reklamy',
      active: 'Aktywna',
      inactive: 'Nieaktywna',
      sponsored: 'Sponsored',
      views: 'Wyświetlenia',
      bookingsSmall: 'Rezerwacje',
      radiusSmall: 'Promień',
      reactivate: 'Aktywuj ponownie',
      deactivate: 'Dezaktywuj',
      noAds: 'Nie masz jeszcze żadnych reklam',
      noAdsHint: 'Utwórz swoją pierwszą reklamę i uruchom ją po płatności',
      totalSpent: 'Wydano',
      noRefund: 'Pieniądze za reklamę nie podlegają zwrotowi',
      statusActiveIcon: '✓',
      statusInactiveIcon: '✕',
    };
  }

  return {
    pageTitle: 'My Promotions',
    pageSubtitle: 'Create, launch and manage your ads',
    activeAds: 'Active',
    totalViews: 'Views',
    bookings: 'Bookings',
    radius: 'Radius',
    createPromotion: 'Create promotion',
    createPromotionSubtitle: 'Launch a new promotion',
    yourAds: 'Your ads',
    active: 'Active',
    inactive: 'Inactive',
    sponsored: 'Sponsored',
    views: 'Views',
    bookingsSmall: 'Bookings',
    radiusSmall: 'Radius',
    reactivate: 'Reactivate',
    deactivate: 'Deactivate',
    noAds: 'You do not have any promotions yet',
    noAdsHint: 'Create your first promotion and launch it after payment',
    totalSpent: 'Spent',
    noRefund: 'Promotion payments are non-refundable',
    statusActiveIcon: '✓',
    statusInactiveIcon: '✕',
  };
}

export default function PromotionsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);

  const labels = getLabels(language);

  useEffect(() => {
    const load = () => {
      setPromotions(getPromotions(getSavedLanguage()));
    };

    load();
    return subscribeToPromotionsStore(load);
  }, []);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
      setPromotions(getPromotions(nextLanguage));
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    setPromotions(getPromotions(language));
  }, [language]);

  const activePromotions = useMemo(() => {
    return promotions.filter((item) => isPromotionActiveNow(item));
  }, [promotions]);

  const sortedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => {
      const aActive = isPromotionActiveNow(a) ? 1 : 0;
      const bActive = isPromotionActiveNow(b) ? 1 : 0;

      if (aActive !== bActive) return bActive - aActive;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [promotions]);

  const totalViews = useMemo(() => {
    return promotions.reduce((sum, item) => sum + (item.views || 0), 0);
  }, [promotions]);

  const totalSpent = useMemo(() => {
    return promotions.reduce((sum, item) => {
      return sum + calcPromotionPrice(item.radiusKm, getPromotionDays(item));
    }, 0);
  }, [promotions]);

  const totalBookings = 0;

  const radiusSummary = useMemo(() => {
    if (!promotions.length) return '0 km';
    const maxRadius = Math.max(...promotions.map((item) => item.radiusKm || 0));
    return `${maxRadius} km`;
  }, [promotions]);

  const handleDeactivate = (promotionId: string) => {
    const confirmed = window.confirm(labels.noRefund);
    if (!confirmed) return;

    updatePromotion(promotionId, {
      status: 'paused' as PromotionStatus,
    });
  };

  const handleReactivate = (item: PromotionItem) => {
    if (isPromotionActiveNow(item)) return;

    const now = new Date();
    const end = new Date(now.getTime() + getPromotionDays(item) * 24 * 60 * 60 * 1000);

    updatePromotion(item.id, {
      status: 'active',
      startAt: now.toISOString(),
      endAt: end.toISOString(),
      createdAt: now.toISOString(),
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f3eb',
        fontFamily: 'Arial, sans-serif',
        color: '#171b2e',
        padding: '18px 14px 40px',
      }}
    >
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr 64px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: '1px solid #e8e1d7',
              background: '#ffffff',
              fontSize: 28,
              color: '#23263a',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            }}
          >
            ←
          </button>

          <div>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#202335',
              }}
            >
              {labels.pageTitle}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.45,
                color: '#7b8390',
                fontWeight: 700,
              }}
            >
              {labels.pageSubtitle}
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: '1px solid #e8e1d7',
              background: '#ffffff',
              fontSize: 30,
              color: '#23263a',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 12,
              border: '1px solid #ece4d8',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 6, color: '#1ea84a' }}>✓</div>
            <div style={{ fontSize: 12, color: '#7b8390', fontWeight: 800 }}>{labels.activeAds}</div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 900, color: '#1ea84a' }}>
              {activePromotions.length}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 12,
              border: '1px solid #ece4d8',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 6, color: '#2f63d8' }}>👁</div>
            <div style={{ fontSize: 12, color: '#7b8390', fontWeight: 800 }}>{labels.totalViews}</div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 900, color: '#2f63d8' }}>
              {totalViews}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 12,
              border: '1px solid #ece4d8',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 6, color: '#1ea84a' }}>📅</div>
            <div style={{ fontSize: 12, color: '#7b8390', fontWeight: 800 }}>{labels.bookings}</div>
            <div style={{ marginTop: 6, fontSize: 26, fontWeight: 900, color: '#1ea84a' }}>
              {totalBookings}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 12,
              border: '1px solid #ece4d8',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 6, color: '#ff4a43' }}>📍</div>
            <div style={{ fontSize: 12, color: '#7b8390', fontWeight: 800 }}>{labels.radius}</div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: '#ff4a43' }}>
              {radiusSummary}
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/profile/promotions/new')}
          style={{
            width: '100%',
            minHeight: 94,
            border: 'none',
            borderRadius: 28,
            background: '#ff1f1f',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 14px 30px rgba(255,31,31,0.22)',
            display: 'grid',
            gridTemplateColumns: '64px 1fr 28px',
            alignItems: 'center',
            gap: 12,
            padding: '0 20px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            +
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>
              {labels.createPromotion}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, opacity: 0.96 }}>
              {labels.createPromotionSubtitle}
            </div>
          </div>

          <div style={{ fontSize: 32, fontWeight: 900 }}>›</div>
        </button>

        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#202335',
            marginBottom: 12,
          }}
        >
          {labels.yourAds}
        </div>

        {sortedPromotions.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 22,
              border: '1px solid #ece4d8',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: '#202335' }}>{labels.noAds}</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#7b8390', fontWeight: 700 }}>
              {labels.noAdsHint}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {sortedPromotions.map((promo) => {
              const isActive = isPromotionActiveNow(promo);
              const days = getPromotionDays(promo);
              const timeLeft = getTimeLeftLabel(promo.endAt, language);

              return (
                <div
                  key={promo.id}
                  style={{
                    background: '#fff',
                    borderRadius: 28,
                    overflow: 'hidden',
                    border: '1px solid #ece4d8',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ padding: 14, paddingBottom: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          minHeight: 42,
                          padding: '0 16px',
                          borderRadius: 999,
                          background: isActive ? '#1ea84a' : '#ff3b30',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>
                          {isActive ? labels.statusActiveIcon : labels.statusInactiveIcon}
                        </span>
                        {isActive ? labels.active : labels.inactive}
                      </div>

                      <div
                        style={{
                          minHeight: 42,
                          padding: '0 16px',
                          borderRadius: 999,
                          background: '#eff9f0',
                          color: '#1ea84a',
                          border: '1px solid #d7eddc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        ⏱ {timeLeft}
                      </div>

                      <div
                        style={{
                          minHeight: 42,
                          padding: '0 16px',
                          borderRadius: 999,
                          background: '#fff',
                          color: '#ff4f93',
                          border: '1px solid #f2d9e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 14,
                          marginLeft: 'auto',
                        }}
                      >
                        {labels.sponsored}
                      </div>
                    </div>
                  </div>

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

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 30,
                        lineHeight: 1.05,
                        fontWeight: 900,
                        color: '#202335',
                      }}
                    >
                      {promo.title}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 16,
                        lineHeight: 1.4,
                        color: '#727b88',
                        fontWeight: 700,
                      }}
                    >
                      {promo.subtitle}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 10,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 18,
                          border: '1px solid #ece4d8',
                          background: '#fff',
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: '#7b8390',
                            fontWeight: 800,
                          }}
                        >
                          {labels.views}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 24,
                            fontWeight: 900,
                            color: '#2f63d8',
                          }}
                        >
                          {promo.views || 0}
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 18,
                          border: '1px solid #ece4d8',
                          background: '#fff',
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: '#7b8390',
                            fontWeight: 800,
                          }}
                        >
                          {labels.bookingsSmall}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 24,
                            fontWeight: 900,
                            color: '#1ea84a',
                          }}
                        >
                          0
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 18,
                          border: '1px solid #ece4d8',
                          background: '#fff',
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            color: '#7b8390',
                            fontWeight: 800,
                          }}
                        >
                          {labels.radiusSmall}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 24,
                            fontWeight: 900,
                            color: '#ff4a43',
                          }}
                        >
                          {promo.radiusKm} km
                        </div>
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
                        onClick={() => handleDeactivate(promo.id)}
                        disabled={!isActive}
                        style={{
                          height: 54,
                          borderRadius: 18,
                          border: isActive ? '1px solid #ffd5d2' : '1px solid #e5e7eb',
                          background: isActive ? '#fff4f4' : '#f3f4f6',
                          color: isActive ? '#ff3b30' : '#a6adba',
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: isActive ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {labels.deactivate}
                      </button>

                      <button
                        onClick={() => handleReactivate(promo)}
                        disabled={isActive}
                        style={{
                          height: 54,
                          borderRadius: 18,
                          border: 'none',
                          background: isActive ? '#eef1f5' : '#1ea84a',
                          color: isActive ? '#a6adba' : '#fff',
                          fontSize: 16,
                          fontWeight: 900,
                          cursor: isActive ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {labels.reactivate}
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: '#8b92a0',
                        fontWeight: 700,
                      }}
                    >
                      {labels.totalSpent}: {formatMoney(calcPromotionPrice(promo.radiusKm, days))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
