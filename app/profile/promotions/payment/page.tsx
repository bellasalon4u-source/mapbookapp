'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedLanguage, type AppLanguage } from '../../../../services/i18n';
import { addPromotion } from '../../../../services/promotionsStore';
import { getAllMasters } from '../../../../services/masters';
import { formatDisplayPrice } from '../../../../services/currencyDisplay';

type AppLang = 'RU' | 'EN' | 'ES';

type PromoPhoto = {
  id: string;
  src: string;
  zoom: number;
  rotate: number;
  offsetX: number;
  offsetY: number;
};

type PromotionDraft = {
  title: string;
  description: string;
  discountEnabled: boolean;
  discountPercent: string;
  categoryId: string;
  radiusKm: number;
  durationDays: number;
  price: number;
  photos: PromoPhoto[];
  createdAt: string;
  language?: AppLanguage;
};

const PROMO_LANGUAGES: AppLanguage[] = ['EN', 'ES', 'RU', 'CZ', 'DE', 'PL'];

function normalizeLanguage(value: string): AppLang {
  if (value === 'RU' || value === 'EN' || value === 'ES') return value;
  return 'EN';
}

function makeId(prefix = 'promo') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getPhotoTransform(photo: PromoPhoto) {
  return `translate(${photo.offsetX}px, ${photo.offsetY}px) scale(${photo.zoom}) rotate(${photo.rotate}deg)`;
}

function localizeTextForStorage(text: string, sourceLanguage: AppLanguage) {
  const clean = text.trim();
  const localized: Partial<Record<AppLanguage, string>> = {};

  for (const lang of PROMO_LANGUAGES) {
    localized[lang] = clean;
  }

  localized[sourceLanguage] = clean;

  return localized;
}

function getLabels(language: AppLang) {
  if (language === 'RU') {
    return {
      title: 'Оплата рекламы',
      subtitle: 'Выберите удобный способ оплаты перед публикацией',
      summary: 'Сводка рекламы',
      paymentMethod: 'Способ оплаты',
      card: 'Банковская карта',
      crypto: 'Криптовалюта',
      wallet: 'Внутренний баланс',
      total: 'К оплате',
      publish: 'Оплатить и запустить',
      processing: 'Обрабатываем оплату...',
      back: 'Назад',
      close: 'Закрыть',
      noDraft: 'Черновик рекламы не найден',
      returnToCreate: 'Вернуться к созданию',
      paidSecurely: 'Безопасная публикация после оплаты',
      adTitle: 'Реклама',
      views: 'Просмотры',
      bookings: 'Брони',
      radius: 'Радиус',
      activeAfterPay: 'Активируется только после успешной оплаты',
      cryptoInfo: 'Поддерживаются BTC, ETH, USDT, USDC',
      walletInfo: 'Списание произойдет с внутреннего баланса приложения',
      cardInfo: 'Visa, Mastercard, Apple Pay, Google Pay',
      promoStatus: 'Статус',
      waitingPayment: 'Ожидает оплаты',
      sponsored: 'Sponsored',
      publishSuccess: 'Реклама оплачена и запущена',
      duration: 'Длительность',
      daysShort: 'дн.',
      specialOffer: 'Специальное предложение',
    };
  }

  if (language === 'ES') {
    return {
      title: 'Pago del anuncio',
      subtitle: 'Elige el método de pago antes de publicar',
      summary: 'Resumen del anuncio',
      paymentMethod: 'Método de pago',
      card: 'Tarjeta bancaria',
      crypto: 'Cripto',
      wallet: 'Saldo interno',
      total: 'Total a pagar',
      publish: 'Pagar y publicar',
      processing: 'Procesando pago...',
      back: 'Atrás',
      close: 'Cerrar',
      noDraft: 'No se encontró el borrador del anuncio',
      returnToCreate: 'Volver a crear',
      paidSecurely: 'Publicación segura después del pago',
      adTitle: 'Anuncio',
      views: 'Vistas',
      bookings: 'Reservas',
      radius: 'Radio',
      activeAfterPay: 'Se activará solo después del pago exitoso',
      cryptoInfo: 'Compatible con BTC, ETH, USDT, USDC',
      walletInfo: 'El cargo se hará desde el saldo interno de la app',
      cardInfo: 'Visa, Mastercard, Apple Pay, Google Pay',
      promoStatus: 'Estado',
      waitingPayment: 'Esperando pago',
      sponsored: 'Sponsored',
      publishSuccess: 'El anuncio fue pagado y publicado',
      duration: 'Duración',
      daysShort: 'días',
      specialOffer: 'Oferta especial',
    };
  }

  return {
    title: 'Promotion payment',
    subtitle: 'Choose a payment method before publishing',
    summary: 'Promotion summary',
    paymentMethod: 'Payment method',
    card: 'Bank card',
    crypto: 'Crypto',
    wallet: 'App balance',
    total: 'Total to pay',
    publish: 'Pay and publish',
    processing: 'Processing payment...',
    back: 'Back',
    close: 'Close',
    noDraft: 'Promotion draft was not found',
    returnToCreate: 'Return to creation',
    paidSecurely: 'Secure publishing after payment',
    adTitle: 'Promotion',
    views: 'Views',
    bookings: 'Bookings',
    radius: 'Radius',
    activeAfterPay: 'It will activate only after successful payment',
    cryptoInfo: 'Supported: BTC, ETH, USDT, USDC',
    walletInfo: 'The amount will be charged from the in-app balance',
    cardInfo: 'Visa, Mastercard, Apple Pay, Google Pay',
    promoStatus: 'Status',
    waitingPayment: 'Waiting for payment',
    sponsored: 'Sponsored',
    publishSuccess: 'Promotion was paid and published',
    duration: 'Duration',
    daysShort: 'days',
    specialOffer: 'Special offer',
  };
}

export default function PromotionPaymentPage() {
  const router = useRouter();
  const masters = getAllMasters();

  const [language, setLanguage] = useState<AppLang>(normalizeLanguage(getSavedLanguage()));
  const [draft, setDraft] = useState<PromotionDraft | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'wallet'>('card');
  const [isPaying, setIsPaying] = useState(false);

  const labels = getLabels(language);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(normalizeLanguage(getSavedLanguage()));
    };

    syncLanguage();

    window.addEventListener('focus', syncLanguage);
    window.addEventListener('storage', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('promotionDraft');

    if (!raw) {
      setDraft(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PromotionDraft;
      setDraft(parsed);
    } catch {
      setDraft(null);
    }
  }, []);

  const mainPhoto = useMemo(() => {
    return draft?.photos?.[0] || null;
  }, [draft]);

  const previewDiscountText = useMemo(() => {
    if (!draft?.discountEnabled) return '';
    if (!draft.discountPercent?.trim()) return '';
    return `-${draft.discountPercent.trim()}%`;
  }, [draft]);

  const handlePayAndPublish = () => {
    if (!draft || !mainPhoto) return;

    setIsPaying(true);

    const featuredMaster = masters[0];
    const now = new Date();
    const end = new Date(now.getTime() + draft.durationDays * 24 * 60 * 60 * 1000);
    const sourceLanguage: AppLanguage = draft.language || getSavedLanguage();

    setTimeout(() => {
      addPromotion({
        id: makeId(),
        masterId: String(featuredMaster?.id || 'master-1'),
        title: localizeTextForStorage(draft.title, sourceLanguage),
        subtitle: localizeTextForStorage(
          draft.description.trim() || draft.title.trim(),
          sourceLanguage
        ),
        image: mainPhoto.src,
        categoryId: draft.categoryId,
        centerLat: Number(featuredMaster?.lat || 51.5074),
        centerLng: Number(featuredMaster?.lng || -0.1278),
        radiusKm: draft.radiusKm,
        startAt: now.toISOString(),
        endAt: end.toISOString(),
        createdAt: now.toISOString(),
        status: 'active',
        views: 0,
        description: localizeTextForStorage(draft.description, sourceLanguage),
        oldPrice: '',
        newPrice: '',
        validUntil: localizeTextForStorage(end.toLocaleDateString(), sourceLanguage),
        area: localizeTextForStorage(String(featuredMaster?.city || 'London'), sourceLanguage),
        address: localizeTextForStorage(
          String(featuredMaster?.city || 'London'),
          sourceLanguage
        ),
        distance: localizeTextForStorage(`${draft.radiusKm} km`, sourceLanguage),
      });

      localStorage.removeItem('promotionDraft');
      window.alert(labels.publishSuccess);
      router.push('/profile/promotions');
    }, 900);
  };

  if (!draft || !mainPhoto) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f7f3eb',
          padding: '18px 14px 40px',
          fontFamily: 'Arial, sans-serif',
          color: '#171b2e',
        }}
      >
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 28,
              padding: 24,
              border: '1px solid #eee5da',
              boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
              {labels.noDraft}
            </div>

            <button
              onClick={() => router.push('/profile/promotions/new')}
              style={{
                marginTop: 8,
                height: 54,
                padding: '0 20px',
                borderRadius: 16,
                border: 'none',
                background: '#1faf46',
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {labels.returnToCreate}
            </button>
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
        padding: '18px 14px 40px',
        fontFamily: 'Arial, sans-serif',
        color: '#171b2e',
      }}
    >
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e5ded2',
              background: '#fff',
              fontSize: 28,
              color: '#1b2033',
              cursor: 'pointer',
            }}
            title={labels.back}
          >
            ‹
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{labels.title}</div>
            <div style={{ fontSize: 13, color: '#727b88', fontWeight: 700, marginTop: 4 }}>
              {labels.subtitle}
            </div>
          </div>

          <button
            onClick={() => router.push('/profile/promotions')}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #e5ded2',
              background: '#fff',
              fontSize: 28,
              color: '#1b2033',
              cursor: 'pointer',
            }}
            title={labels.close}
          >
            ×
          </button>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
            border: '1px solid #f0e8dc',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>{labels.summary}</div>

          <div
            style={{
              borderRadius: 22,
              overflow: 'hidden',
              border: '1px solid #eee5da',
              background: '#fff',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 0, height: 170, background: '#f3f4f6' }}>
                <div style={{ flex: draft.photos.length === 1 ? 1 : 1.3, overflow: 'hidden' }}>
                  <img
                    src={draft.photos[0].src}
                    alt="Main"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transform: getPhotoTransform(draft.photos[0]),
                    }}
                  />
                </div>

                {draft.photos.length > 1 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'grid',
                      gridTemplateRows: draft.photos.length >= 4 ? '1fr 1fr' : '1fr',
                      gap: 0,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                      {draft.photos[1] ? (
                        <img
                          src={draft.photos[1].src}
                          alt="Extra"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transform: getPhotoTransform(draft.photos[1]),
                          }}
                        />
                      ) : (
                        <div />
                      )}

                      {draft.photos[2] ? (
                        <img
                          src={draft.photos[2].src}
                          alt="Extra"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transform: getPhotoTransform(draft.photos[2]),
                          }}
                        />
                      ) : (
                        <div />
                      )}
                    </div>

                    {draft.photos[3] ? (
                      <img
                        src={draft.photos[3].src}
                        alt="Extra"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transform: getPhotoTransform(draft.photos[3]),
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: '#fff',
                  color: '#ff4f93',
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {labels.sponsored}
              </div>
            </div>

            <div style={{ padding: 14 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, lineHeight: 1.05, fontWeight: 900 }}>
                    {draft.title}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      lineHeight: 1.35,
                      color: '#727b88',
                      fontWeight: 700,
                    }}
                  >
                    {draft.description || labels.specialOffer}
                  </div>
                </div>

                {previewDiscountText ? (
                  <div
                    style={{
                      minWidth: 58,
                      height: 36,
                      borderRadius: 999,
                      background: '#fff2f7',
                      color: '#ff4f93',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 14,
                      padding: '0 10px',
                    }}
                  >
                    {previewDiscountText}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    border: '1px solid #e8e2d7',
                    borderRadius: 16,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                    {labels.views}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, color: '#2f63d8', fontWeight: 900 }}>
                    0
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid #e8e2d7',
                    borderRadius: 16,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                    {labels.bookings}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, color: '#1ea84a', fontWeight: 900 }}>
                    0
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid #e8e2d7',
                    borderRadius: 16,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#7a8290', fontWeight: 800 }}>
                    {labels.radius}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, color: '#ff4a43', fontWeight: 900 }}>
                    {draft.radiusKm} km
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 999,
                    background: '#fff7e8',
                    color: '#9a6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {labels.promoStatus}: {labels.waitingPayment}
                </div>

                <div
                  style={{
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 999,
                    background: '#eff9f0',
                    color: '#1ea84a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {labels.duration}: {draft.durationDays} {labels.daysShort}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
            border: '1px solid #f0e8dc',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
            {labels.paymentMethod}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <button
              onClick={() => setPaymentMethod('card')}
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: paymentMethod === 'card' ? '2px solid #ff4a43' : '1px solid #e4ddd1',
                background: '#fff',
                padding: '0 16px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900 }}>{labels.card}</div>
              <div style={{ fontSize: 13, color: '#727b88', fontWeight: 700, marginTop: 4 }}>
                {labels.cardInfo}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('crypto')}
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: paymentMethod === 'crypto' ? '2px solid #ff4a43' : '1px solid #e4ddd1',
                background: '#fff',
                padding: '0 16px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900 }}>{labels.crypto}</div>
              <div style={{ fontSize: 13, color: '#727b88', fontWeight: 700, marginTop: 4 }}>
                {labels.cryptoInfo}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('wallet')}
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: paymentMethod === 'wallet' ? '2px solid #ff4a43' : '1px solid #e4ddd1',
                background: '#fff',
                padding: '0 16px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 900 }}>{labels.wallet}</div>
              <div style={{ fontSize: 13, color: '#727b88', fontWeight: 700, marginTop: 4 }}>
                {labels.walletInfo}
              </div>
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              background: '#f8fafc',
              border: '1px solid #e8edf3',
              borderRadius: 18,
              padding: 14,
              fontSize: 14,
              color: '#596272',
              fontWeight: 700,
            }}
          >
            {labels.activeAfterPay}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 28,
            padding: 16,
            boxShadow: '0 10px 28px rgba(0,0,0,0.06)',
            border: '1px solid #f0e8dc',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900 }}>{labels.total}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#ff4a43' }}>
              {formatDisplayPrice(draft.price)}
            </div>
          </div>

          <div
            style={{
              marginBottom: 14,
              fontSize: 13,
              color: '#727b88',
              fontWeight: 700,
            }}
          >
            {labels.paidSecurely}
          </div>

          <button
            onClick={handlePayAndPublish}
            disabled={isPaying}
            style={{
              width: '100%',
              height: 58,
              border: 'none',
              borderRadius: 18,
              background: '#1faf46',
              color: '#fff',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 10px 22px rgba(31,175,70,0.22)',
              opacity: isPaying ? 0.8 : 1,
            }}
          >
            {isPaying ? labels.processing : `${labels.publish} · ${formatDisplayPrice(draft.price)}`}
          </button>
        </div>
      </div>
    </main>
  );
}
