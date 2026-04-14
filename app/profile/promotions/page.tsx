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
    back: 'Back',
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
    back: 'Atrás',
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
    back: 'Назад',
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
    back: 'Zpět',
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
    back: 'Zurück',
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
    back: 'Wstecz',
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
  if (status === 'active') {
    return {
      bg: '#dff2e3',
      color: '#1d7a38',
      border: '#8bc59b',
    };
  }

  if (status === 'used') {
    return {
      bg: '#e6efff',
      color: '#2559b7',
      border: '#97b3e8',
    };
  }

  return {
    bg: '#f4efe8',
    color: '#6d6258',
    border: '#cfc3b2',
  };
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
        background: '#f7f4ee',
        color: '#17130f',
        paddingBottom: 110,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '20px 16px 110px' }}>
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
            aria-label={text.back}
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: '2px solid #111111',
              background: '#fff',
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
                lineHeight: 1.1,
              }}
            >
              {text.title}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7b7268',
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {text.subtitle}
            </div>
          </div>

          <div />
        </div>

        <section style={{ marginTop: 18 }}>
          <div
            style={{
              background: '#fff',
              border: '2px solid #111111',
              borderRadius: 30,
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  border: '2px solid #111111',
                  background: '#fff1f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                🎉
              </div>

              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.2,
                  }}
                >
                  {text.heroTitle}
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
                  {text.heroSub}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 42,
                padding: '0 16px',
                borderRadius: 999,
                border: '2px solid #8bc59b',
                background: '#dff2e3',
                color: '#1d7a38',
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {text.availableNow}: {activeCount}
            </div>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          {promoItems.length === 0 ? (
            <div
              style={{
                background: '#fff',
                border: '2px solid #111111',
                borderRadius: 30,
                padding: 24,
                textAlign: 'center',
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
            <div style={{ display: 'grid', gap: 16 }}>
              {promoItems.map((item) => {
                const statusStyle = getStatusStyle(item.status);

                return (
                  <article
                    key={item.id}
                    style={{
                      background: '#fff',
                      border: '2px solid #111111',
                      borderRadius: 30,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: '#17130f',
                            lineHeight: 1.2,
                          }}
                        >
                          {text[item.titleKey]}
                        </div>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 15,
                            lineHeight: 1.45,
                            color: '#6f7882',
                            fontWeight: 700,
                          }}
                        >
                          {item.description}
                        </div>
                      </div>

                      <div
                        style={{
                          flexShrink: 0,
                          minHeight: 46,
                          padding: '0 14px',
                          borderRadius: 18,
                          border: '2px solid #111111',
                          background: '#fff1f7',
                          color: '#ff4fa0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
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
                          border: `2px solid ${statusStyle.border}`,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </div>

                      <div
                        style={{
                          borderRadius: 999,
                          padding: '8px 12px',
                          border: '2px solid #97b3e8',
                          background: '#e6efff',
                          color: '#2559b7',
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
                          border: '2px solid #cfc3b2',
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
                          marginTop: 16,
                          minHeight: 56,
                          borderRadius: 22,
                          border: '2px solid #111111',
                          background: '#2f241c',
                          color: '#fff',
                          padding: '0 18px',
                          fontSize: 15,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {text.applyToBooking}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
