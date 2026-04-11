'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getReferralState,
  subscribeToReferralStore,
} from '../../services/referralStore';
import BottomNav from '../../../components/common/BottomNav';

const inviteTexts = {
  EN: {
    title: 'Invite friends',
    heroTitle: 'Invite a friend — get a free booking',
    heroText:
      'For every friend who pays their first £5 unlock, you receive 1 free booking reward.',
    activeForever: 'Works continuously',
    invited: 'Invited',
    invitedSub: 'People joined by your link',
    paid: 'Paid',
    paidSub: 'Friends who completed first unlock',
    freeBookings: 'Free bookings',
    freeBookingsSub: 'Available referral rewards',
    yourLink: 'Your link',
    yourLinkText:
      'Send the link to your friends. They get a £5 bonus for the first booking, and you get a free booking once they pay.',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share link',
    invitedFriends: 'Invited friends',
    paidStatus: 'Paid',
    countedStatus: 'Counted',
    waitingStatus: 'Waiting for payment',
    bonuses: 'Your bonuses',
    welcomeBonus: 'Welcome bonus',
    referralBonus: 'Referral rewards',
    totalAvailable: 'Total available',
    linkReady: 'Referral link is ready to share',
  },
  ES: {
    title: 'Invitar amigos',
    heroTitle: 'Invita a un amigo — consigue una reserva gratis',
    heroText:
      'Por cada amigo que pague su primer unlock de £5, recibes 1 recompensa de reserva gratis.',
    activeForever: 'Funciona siempre',
    invited: 'Invitados',
    invitedSub: 'Personas que entraron por tu enlace',
    paid: 'Pagaron',
    paidSub: 'Amigos que completaron el primer unlock',
    freeBookings: 'Reservas gratis',
    freeBookingsSub: 'Recompensas disponibles',
    yourLink: 'Tu enlace',
    yourLinkText:
      'Envía el enlace a tus amigos. Ellos reciben un bono de £5 en la primera reserva y tú obtienes una reserva gratis cuando paguen.',
    copy: 'Copiar',
    copied: 'Copiado',
    share: 'Compartir enlace',
    invitedFriends: 'Amigos invitados',
    paidStatus: 'Pagó',
    countedStatus: 'Contado',
    waitingStatus: 'Esperando pago',
    bonuses: 'Tus bonos',
    welcomeBonus: 'Bono de bienvenida',
    referralBonus: 'Bonos por referidos',
    totalAvailable: 'Total disponible',
    linkReady: 'El enlace de invitación está listo para compartir',
  },
  RU: {
    title: 'Пригласить друзей',
    heroTitle: 'Пригласите друга — получите бесплатное бронирование',
    heroText:
      'За каждого друга, который оплатит свой первый £5 unlock, вы получите 1 бесплатное бронирование.',
    activeForever: 'Это работает постоянно',
    invited: 'Приглашено',
    invitedSub: 'Людей пришло по вашей ссылке',
    paid: 'Оплатили',
    paidSub: 'Друзья с первым оплаченным unlock',
    freeBookings: 'Бесплатные бронирования',
    freeBookingsSub: 'Доступные награды по рефералам',
    yourLink: 'Ваша ссылка',
    yourLinkText:
      'Отправьте ссылку друзьям. Они получат бонус £5 на первое бронирование, а вы — бесплатное бронирование, когда они оплатят.',
    copy: 'Скопировать',
    copied: 'Скопировано',
    share: 'Поделиться ссылкой',
    invitedFriends: 'Приглашённые друзья',
    paidStatus: 'Оплатил',
    countedStatus: 'Зачтено',
    waitingStatus: 'Ожидает оплату',
    bonuses: 'Ваши бонусы',
    welcomeBonus: 'Welcome Bonus',
    referralBonus: 'Реферальные бонусы',
    totalAvailable: 'Всего доступно',
    linkReady: 'Реферальная ссылка готова к отправке',
  },
  CZ: {
    title: 'Pozvat přátele',
    heroTitle: 'Pozvěte přítele — získejte rezervaci zdarma',
    heroText:
      'Za každého přítele, který zaplatí svůj první £5 unlock, získáte 1 rezervaci zdarma.',
    activeForever: 'Funguje neustále',
    invited: 'Pozváno',
    invitedSub: 'Lidé, kteří přišli přes váš odkaz',
    paid: 'Zaplatili',
    paidSub: 'Přátelé s prvním zaplaceným unlockem',
    freeBookings: 'Rezervace zdarma',
    freeBookingsSub: 'Dostupné referral odměny',
    yourLink: 'Váš odkaz',
    yourLinkText:
      'Pošlete odkaz přátelům. Oni získají bonus £5 na první rezervaci a vy získáte rezervaci zdarma, když zaplatí.',
    copy: 'Kopírovat',
    copied: 'Zkopírováno',
    share: 'Sdílet odkaz',
    invitedFriends: 'Pozvaní přátelé',
    paidStatus: 'Zaplatil',
    countedStatus: 'Započteno',
    waitingStatus: 'Čeká na platbu',
    bonuses: 'Vaše bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBonus: 'Bonusy za doporučení',
    totalAvailable: 'Celkem dostupné',
    linkReady: 'Referral odkaz je připraven ke sdílení',
  },
  DE: {
    title: 'Freunde einladen',
    heroTitle: 'Freund einladen — kostenlose Buchung erhalten',
    heroText:
      'Für jeden Freund, der seinen ersten £5 Unlock bezahlt, erhältst du 1 kostenlose Buchung.',
    activeForever: 'Funktioniert dauerhaft',
    invited: 'Eingeladen',
    invitedSub: 'Personen über deinen Link',
    paid: 'Bezahlt',
    paidSub: 'Freunde mit erstem bezahlten Unlock',
    freeBookings: 'Kostenlose Buchungen',
    freeBookingsSub: 'Verfügbare Empfehlungsprämien',
    yourLink: 'Dein Link',
    yourLinkText:
      'Sende den Link an deine Freunde. Sie erhalten £5 Bonus für die erste Buchung und du bekommst eine kostenlose Buchung, sobald sie zahlen.',
    copy: 'Kopieren',
    copied: 'Kopiert',
    share: 'Link teilen',
    invitedFriends: 'Eingeladene Freunde',
    paidStatus: 'Bezahlt',
    countedStatus: 'Angerechnet',
    waitingStatus: 'Wartet auf Zahlung',
    bonuses: 'Deine Boni',
    welcomeBonus: 'Welcome Bonus',
    referralBonus: 'Empfehlungsboni',
    totalAvailable: 'Insgesamt verfügbar',
    linkReady: 'Einladungslink ist bereit zum Teilen',
  },
  PL: {
    title: 'Zaproś znajomych',
    heroTitle: 'Zaproś znajomego — odbierz darmową rezerwację',
    heroText:
      'Za każdego znajomego, który opłaci swój pierwszy £5 unlock, otrzymasz 1 darmową rezerwację.',
    activeForever: 'Działa cały czas',
    invited: 'Zaproszono',
    invitedSub: 'Osoby, które weszły przez twój link',
    paid: 'Zapłacili',
    paidSub: 'Znajomi z pierwszym opłaconym unlockiem',
    freeBookings: 'Darmowe rezerwacje',
    freeBookingsSub: 'Dostępne nagrody z poleceń',
    yourLink: 'Twój link',
    yourLinkText:
      'Wyślij link znajomym. Otrzymają bonus £5 na pierwszą rezerwację, a Ty dostaniesz darmową rezerwację, gdy zapłacą.',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    share: 'Udostępnij link',
    invitedFriends: 'Zaproszeni znajomi',
    paidStatus: 'Zapłacił',
    countedStatus: 'Zaliczone',
    waitingStatus: 'Oczekuje płatności',
    bonuses: 'Twoje bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBonus: 'Bonusy poleceń',
    totalAvailable: 'Łącznie dostępne',
    linkReady: 'Link polecający jest gotowy do udostępnienia',
  },
} as const;

function getStatusStyles(status: string) {
  if (status === 'paid') {
    return {
      background: '#eef9f1',
      color: '#2fa35a',
    };
  }

  if (status === 'counted') {
    return {
      background: '#eef4ff',
      color: '#2f7cf6',
    };
  }

  return {
    background: '#fff5e8',
    color: '#d68612',
  };
}

function getStatCardStyles(type: 'pink' | 'blue' | 'green') {
  if (type === 'pink') {
    return {
      background: 'linear-gradient(180deg, #fff1f7 0%, #ffe8f2 100%)',
      color: '#ff4fa0',
      shadow: '0 10px 24px rgba(255,79,160,0.10)',
    };
  }

  if (type === 'blue') {
    return {
      background: 'linear-gradient(180deg, #eef4ff 0%, #e7f0ff 100%)',
      color: '#2f7cf6',
      shadow: '0 10px 24px rgba(47,124,246,0.10)',
    };
  }

  return {
    background: 'linear-gradient(180deg, #eef9f1 0%, #e6f7eb 100%)',
    color: '#2fa35a',
    shadow: '0 10px 24px rgba(47,163,90,0.10)',
  };
}

export default function InviteFriendsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [copied, setCopied] = useState(false);
  const [referralState, setReferralState] = useState(getReferralState());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncReferral = () => {
      setReferralState(getReferralState());
    };

    syncLanguage();
    syncReferral();

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    const unsubReferral = subscribeToReferralStore(syncReferral);

    return () => {
      unsubLanguage();
      unsubReferral();
    };
  }, []);

  const text = inviteTexts[language as keyof typeof inviteTexts] || inviteTexts.EN;

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/invite/${referralState.referralCode || 'mapbook'}`
      : `https://mapbook.app/invite/${referralState.referralCode || 'mapbook'}`;

  const referralBonusAmount = useMemo(() => {
    return Number((referralState.completedReferralsCount || 0) * 5);
  }, [referralState.completedReferralsCount]);

  const totalAvailable = useMemo(() => {
    return Number((referralState.welcomeBonus || 0) + referralBonusAmount);
  }, [referralBonusAmount, referralState.welcomeBonus]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MapBook Invite',
          text: shareLink,
          url: shareLink,
        });
        return;
      }

      await handleCopy();
    } catch (error) {
      console.error(error);
    }
  };

  const invitedCard = getStatCardStyles('pink');
  const paidCard = getStatCardStyles('blue');
  const freeCard = getStatCardStyles('green');

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
            marginBottom: 18,
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

          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#17130f',
              textAlign: 'center',
            }}
          >
            {text.title}
          </div>

          <div />
        </div>

        <div
          style={{
            borderRadius: 32,
            border: '1px solid #f0e3d7',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff8f8 100%)',
            padding: 20,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              background: '#fff1f7',
              color: '#ff4fa0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              marginBottom: 16,
            }}
          >
            🎁
          </div>

          <div
            style={{
              fontSize: 28,
              lineHeight: 1.14,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.heroTitle}
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 16,
              lineHeight: 1.7,
              color: '#756b62',
              fontWeight: 700,
            }}
          >
            {text.heroText}
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              background: '#eef9f1',
              color: '#2fa35a',
              padding: '11px 14px',
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <span>⚡</span>
            <span>{text.activeForever}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          <div
            style={{
              borderRadius: 28,
              padding: 16,
              background: invitedCard.background,
              color: invitedCard.color,
              boxShadow: invitedCard.shadow,
            }}
          >
            <div style={{ fontSize: 22 }}>👥</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.25,
                fontWeight: 900,
                minHeight: 30,
              }}
            >
              {text.invited}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                lineHeight: 1.3,
                fontWeight: 800,
                opacity: 0.85,
                minHeight: 28,
              }}
            >
              {text.invitedSub}
            </div>
            <div style={{ marginTop: 12, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {referralState.invitedCount || 0}
            </div>
          </div>

          <div
            style={{
              borderRadius: 28,
              padding: 16,
              background: paidCard.background,
              color: paidCard.color,
              boxShadow: paidCard.shadow,
            }}
          >
            <div style={{ fontSize: 22 }}>💳</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.25,
                fontWeight: 900,
                minHeight: 30,
              }}
            >
              {text.paid}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                lineHeight: 1.3,
                fontWeight: 800,
                opacity: 0.85,
                minHeight: 28,
              }}
            >
              {text.paidSub}
            </div>
            <div style={{ marginTop: 12, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {referralState.completedReferralsCount || 0}
            </div>
          </div>

          <div
            style={{
              borderRadius: 28,
              padding: 16,
              background: freeCard.background,
              color: freeCard.color,
              boxShadow: freeCard.shadow,
            }}
          >
            <div style={{ fontSize: 22 }}>🎟️</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.25,
                fontWeight: 900,
                minHeight: 30,
              }}
            >
              {text.freeBookings}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                lineHeight: 1.3,
                fontWeight: 800,
                opacity: 0.85,
                minHeight: 28,
              }}
            >
              {text.freeBookingsSub}
            </div>
            <div style={{ marginTop: 12, fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
              {referralState.freeBookingsAvailable || 0}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
            }}
          >
            {text.yourLink}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.7,
              color: '#756b62',
              fontWeight: 700,
            }}
          >
            {text.yourLinkText}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              background: '#eef9f1',
              padding: '12px 14px',
              fontSize: 13,
              color: '#2fa35a',
              fontWeight: 900,
            }}
          >
            {text.linkReady}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 24,
              background: '#fcfaf6',
              border: '1px solid #efe4d7',
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 16,
                fontWeight: 800,
                color: '#17130f',
                padding: '0 4px',
              }}
            >
              {shareLink}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                minWidth: 118,
                height: 52,
                borderRadius: 18,
                border: '1px solid #f1d9e6',
                background: copied ? '#eef9f1' : '#fff1f7',
                color: copied ? '#2fa35a' : '#ff4fa0',
                fontSize: 15,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {copied ? text.copied : text.copy}
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            style={{
              marginTop: 12,
              width: '100%',
              height: 56,
              border: 'none',
              borderRadius: 20,
              background: 'linear-gradient(180deg, #ff62aa 0%, #ff4fa0 100%)',
              color: '#fff',
              fontSize: 17,
              fontWeight: 900,
              boxShadow: '0 12px 24px rgba(255,79,160,0.20)',
              cursor: 'pointer',
            }}
          >
            {text.share}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 20,
            fontWeight: 900,
            color: '#17130f',
          }}
        >
          {text.invitedFriends}
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {referralState.invitedFriends.map((friend) => {
            const statusText =
              friend.status === 'paid'
                ? text.paidStatus
                : friend.status === 'counted'
                  ? text.countedStatus
                  : text.waitingStatus;

            const statusStyles = getStatusStyles(friend.status);

            return (
              <div
                key={friend.id}
                style={{
                  borderRadius: 28,
                  background: '#fff',
                  border: '1px solid #efe4d7',
                  padding: 16,
                  boxShadow: '0 10px 24px rgba(44, 23, 10, 0.04)',
                  display: 'grid',
                  gridTemplateColumns: '74px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 22,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#17130f',
                    }}
                  >
                    {friend.name}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: '#8a7f74',
                      fontWeight: 700,
                    }}
                  >
                    {friend.date}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 999,
                    padding: '11px 14px',
                    fontSize: 13,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                    ...statusStyles,
                  }}
                >
                  {statusText}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 18,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 14,
            }}
          >
            {text.bonuses}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 12,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                background: '#fff5e8',
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                  {text.welcomeBonus}
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#d68612' }}>
                £{Number(referralState.welcomeBonus || 0).toFixed(2)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: '#fff1f7',
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                  {text.referralBonus}
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#ff4fa0' }}>
                £{referralBonusAmount.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                borderRadius: 24,
                background: 'linear-gradient(180deg, #eef9f1 0%, #e7f7ed 100%)',
                padding: '18px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#17130f' }}>
                  {text.totalAvailable}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#2fa35a' }}>
                £{totalAvailable.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
