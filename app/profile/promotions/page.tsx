'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const promotionsTexts = {
  EN: {
    title: 'Promotions',
    subtitle: 'Bonuses, offers and saved perks',
    heroTitle: 'Your bonuses and offers',
    heroSub: 'Track active discounts, welcome bonuses and saved promotional rewards.',
    active: 'Active offers',
    used: 'Used',
    expired: 'Expired',
    availableNow: 'Available now',
    validUntil: 'Valid until',
    applyToBooking: 'Apply to booking',
    savedAmount: 'You save',
    empty: 'No promotions yet',
    emptySub: 'When promotions appear in your account, they will be shown here.',
    statusActive: 'Active',
    statusUsed: 'Used',
    statusExpired: 'Expired',
    welcomeBonus: 'Welcome bonus',
    referralBonus: 'Referral reward',
    seasonalOffer: 'Seasonal offer',
  },
  ES: {
    title: 'Promociones',
    subtitle: 'Bonos, ofertas y ventajas guardadas',
    heroTitle: 'Tus bonos y ofertas',
    heroSub: 'Sigue descuentos activos, bonos de bienvenida y recompensas promocionales.',
    active: 'Ofertas activas',
    used: 'Usadas',
    expired: 'Expiradas',
    availableNow: 'Disponible ahora',
    validUntil: 'Válido hasta',
    applyToBooking: 'Aplicar a la reserva',
    savedAmount: 'Ahorras',
    empty: 'Aún no hay promociones',
    emptySub: 'Cuando aparezcan promociones en tu cuenta, se mostrarán aquí.',
    statusActive: 'Activa',
    statusUsed: 'Usada',
    statusExpired: 'Expirada',
    welcomeBonus: 'Bono de bienvenida',
    referralBonus: 'Recompensa por referido',
    seasonalOffer: 'Oferta de temporada',
  },
  RU: {
    title: 'Промоакции',
    subtitle: 'Бонусы, предложения и сохранённые выгоды',
    heroTitle: 'Ваши бонусы и предложения',
    heroSub: 'Следите за активными скидками, welcome bonus и сохранёнными промо-наградами.',
    active: 'Активные',
    used: 'Использованы',
    expired: 'Истекли',
    availableNow: 'Доступно сейчас',
    validUntil: 'Действует до',
    applyToBooking: 'Применить к бронированию',
    savedAmount: 'Вы экономите',
    empty: 'Пока нет промоакций',
    emptySub: 'Когда в аккаунте появятся промоакции, они отобразятся здесь.',
    statusActive: 'Активно',
    statusUsed: 'Использовано',
    statusExpired: 'Истекло',
    welcomeBonus: 'Welcome bonus',
    referralBonus: 'Реферальный бонус',
    seasonalOffer: 'Сезонное предложение',
  },
  CZ: {
    title: 'Promo akce',
    subtitle: 'Bonusy, nabídky a uložené výhody',
    heroTitle: 'Vaše bonusy a nabídky',
    heroSub: 'Sledujte aktivní slevy, welcome bonus a uložené promo odměny.',
    active: 'Aktivní',
    used: 'Použité',
    expired: 'Expirované',
    availableNow: 'Dostupné nyní',
    validUntil: 'Platí do',
    applyToBooking: 'Použít na rezervaci',
    savedAmount: 'Ušetříte',
    empty: 'Zatím žádné promo akce',
    emptySub: 'Jakmile se ve vašem účtu objeví promo akce, zobrazí se zde.',
    statusActive: 'Aktivní',
    statusUsed: 'Použité',
    statusExpired: 'Expirace',
    welcomeBonus: 'Welcome bonus',
    referralBonus: 'Referral bonus',
    seasonalOffer: 'Sezónní nabídka',
  },
  DE: {
    title: 'Aktionen',
    subtitle: 'Boni, Angebote und gespeicherte Vorteile',
    heroTitle: 'Deine Boni und Angebote',
    heroSub: 'Verfolge aktive Rabatte, Welcome-Boni und gespeicherte Promo-Vorteile.',
    active: 'Aktive Angebote',
    used: 'Verwendet',
    expired: 'Abgelaufen',
    availableNow: 'Jetzt verfügbar',
    validUntil: 'Gültig bis',
    applyToBooking: 'Für Buchung verwenden',
    savedAmount: 'Du sparst',
    empty: 'Noch keine Aktionen',
    emptySub: 'Sobald Aktionen in deinem Konto erscheinen, werden sie hier angezeigt.',
    statusActive: 'Aktiv',
    statusUsed: 'Verwendet',
    statusExpired: 'Abgelaufen',
    welcomeBonus: 'Welcome-Bonus',
    referralBonus: 'Empfehlungsbonus',
    seasonalOffer: 'Saisonales Angebot',
  },
  PL: {
    title: 'Promocje',
    subtitle: 'Bonusy, oferty i zapisane korzyści',
    heroTitle: 'Twoje bonusy i oferty',
    heroSub: 'Śledź aktywne zniżki, welcome bonus i zapisane nagrody promocyjne.',
    active: 'Aktywne',
    used: 'Wykorzystane',
    expired: 'Wygasłe',
    availableNow: 'Dostępne teraz',
    validUntil: 'Ważne do',
    applyToBooking: 'Zastosuj do rezerwacji',
    savedAmount: 'Oszczędzasz',
    empty: 'Brak promocji',
    emptySub: 'Gdy promocje pojawią się na Twoim koncie, zobaczysz je tutaj.',
    statusActive: 'Aktywna',
    statusUsed: 'Wykorzystana',
    statusExpired: 'Wygasła',
    welcomeBonus: 'Welcome bonus',
    referralBonus: 'Bonus polecający',
    seasonalOffer: 'Oferta sezonowa',
  },
} as const;

type PromotionItem = {
  id: string;
  titleKey: 'welcomeBonus' | 'referralBonus' | 'seasonalOffer';
  description: string;
  status: 'active' | 'used' | 'expired';
  discountLabel: string;
  savedAmount: string;
  validUntil: string;
};

const promoItems: PromotionItem[] = [
  {
    id: '1',
    titleKey: 'welcomeBonus',
    description: '£5 off your first booking',
    status: 'active',
    discountLabel: '£5 OFF',
    savedAmount: '£5',
    validUntil: '30 Apr 2026',
  },
  {
    id: '2',
    titleKey: 'referralBonus',
    description: 'Reward from invited friend',
    status: 'used',
    discountLabel: 'FREE BOOKING',
    savedAmount: '£10',
    validUntil: 'Used',
  },
  {
    id: '3',
    titleKey: 'seasonalOffer',
    description: 'Spring beauty campaign',
    status: 'expired',
    discountLabel: '-20%',
    savedAmount: '£8',
    validUntil: '10 Apr 2026',
  },
];

function getStatusStyle(status: PromotionItem['status']) {
  if (status === 'active') return { background: '#eef9f1', color: '#2fa35a' };
  if (status === 'used') return { background: '#eef4ff', color: '#2f7cf6' };
  return { background: '#f4efe8', color: '#6d6258' };
}

export default function PromotionsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>('EN');

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    syncLanguage();
    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(
    () => promotionsTexts[language as keyof typeof promotionsTexts] || promotionsTexts.EN,
    [language]
  );

  const getStatusLabel = (status: PromotionItem['status']) => {
    if (status === 'active') return text.statusActive;
    if (status === 'used') return text.statusUsed;
    return text.statusExpired;
  };

  const activeCount = promoItems.filter((item) => item.status === 'active').length;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fbf7ef',
        padding: '20px 16px 110px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '1px solid #efe4d7',
              background: '#fff',
              fontSize: 26,
              boxShadow: '0 10px 22px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#17130f' }}>
              {text.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 32,
            border: '1px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr auto',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                background: '#fff1f7',
                color: '#ff4fa0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              🎉
            </div>

            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                {text.heroTitle}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.heroSub}
              </div>
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '10px 14px',
                background: '#eef9f1',
                color: '#2fa35a',
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {text.availableNow}: {activeCount}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          {promoItems.length === 0 ? (
            <div
              style={{
                borderRadius: 30,
                border: '1px solid #efe4d7',
                background: '#fff',
                padding: 24,
                textAlign: 'center',
                boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>{text.empty}</div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.emptySub}
              </div>
            </div>
          ) : (
            promoItems.map((item) => {
              const statusStyle = getStatusStyle(item.status);

              return (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 30,
                    border: '1px solid #efe4d7',
                    background: '#fff',
                    padding: 16,
                    boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                        {text[item.titleKey]}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: '#7b7268',
                          fontWeight: 700,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 18,
                        background: '#fff1f7',
                        color: '#ff4fa0',
                        padding: '10px 12px',
                        fontSize: 13,
                        fontWeight: 900,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.discountLabel}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 900,
                        ...statusStyle,
                      }}
                    >
                      {getStatusLabel(item.status)}
                    </div>

                    <div
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        background: '#eef4ff',
                        color: '#2f7cf6',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.savedAmount}: {item.savedAmount}
                    </div>

                    <div
                      style={{
                        borderRadius: 999,
                        padding: '8px 12px',
                        background: '#f4efe8',
                        color: '#6d6258',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {text.validUntil}: {item.validUntil}
                    </div>
                  </div>

                  {item.status === 'active' ? (
                    <button
                      type="button"
                      style={{
                        marginTop: 14,
                        border: 'none',
                        borderRadius: 20,
                        background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
                        color: '#fff',
                        minHeight: 52,
                        padding: '0 18px',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 14px 28px rgba(31,23,18,0.20)',
                      }}
                    >
                      {text.applyToBooking}
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
