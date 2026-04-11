'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const inviteTexts = {
  EN: {
    title: 'Invite friends',
    subtitle: 'Share MapBook and earn bonuses',
    heroTitle: 'Invite and get rewards',
    heroSub: 'Invite friends to MapBook and receive bonuses when they join and book.',
    yourCode: 'Your referral code',
    copy: 'Copy',
    copied: 'Copied',
    inviteLink: 'Invite link',
    rewards: 'Rewards',
    reward1: 'Get a bonus for each new joined user',
    reward2: 'Get booking bonus after first completed booking',
    reward3: 'Track referrals and reward history in one place',
    stats: 'Your stats',
    invited: 'Invited',
    joined: 'Joined',
    earned: 'Earned',
    history: 'Referral history',
    empty: 'No referrals yet',
    emptySub: 'Share your code with friends and your referral activity will appear here.',
    share: 'Share code',
    statusJoined: 'Joined',
    statusBooked: 'Booked',
    statusPending: 'Pending',
  },
  ES: {
    title: 'Invitar amigos',
    subtitle: 'Comparte MapBook y gana bonos',
    heroTitle: 'Invita y recibe recompensas',
    heroSub: 'Invita amigos a MapBook y recibe bonos cuando se unan y reserven.',
    yourCode: 'Tu código de referido',
    copy: 'Copiar',
    copied: 'Copiado',
    inviteLink: 'Enlace de invitación',
    rewards: 'Recompensas',
    reward1: 'Recibe un bono por cada nuevo usuario que se una',
    reward2: 'Recibe bono de reserva después de la primera reserva completada',
    reward3: 'Sigue referidos e historial de recompensas en un solo lugar',
    stats: 'Tus estadísticas',
    invited: 'Invitados',
    joined: 'Unidos',
    earned: 'Ganado',
    history: 'Historial de referidos',
    empty: 'Aún no hay referidos',
    emptySub: 'Comparte tu código con amigos y tu actividad aparecerá aquí.',
    share: 'Compartir código',
    statusJoined: 'Unido',
    statusBooked: 'Reservó',
    statusPending: 'Pendiente',
  },
  RU: {
    title: 'Пригласить друзей',
    subtitle: 'Делитесь MapBook и получайте бонусы',
    heroTitle: 'Приглашайте и получайте награды',
    heroSub: 'Приглашайте друзей в MapBook и получайте бонусы, когда они регистрируются и бронируют.',
    yourCode: 'Ваш реферальный код',
    copy: 'Копировать',
    copied: 'Скопировано',
    inviteLink: 'Ссылка-приглашение',
    rewards: 'Награды',
    reward1: 'Получайте бонус за каждого нового присоединившегося пользователя',
    reward2: 'Получайте бонус после первого завершённого бронирования',
    reward3: 'Отслеживайте рефералов и историю наград в одном месте',
    stats: 'Ваша статистика',
    invited: 'Приглашено',
    joined: 'Присоединились',
    earned: 'Заработано',
    history: 'История рефералов',
    empty: 'Пока нет рефералов',
    emptySub: 'Поделитесь кодом с друзьями, и здесь появится ваша активность.',
    share: 'Поделиться кодом',
    statusJoined: 'Присоединился',
    statusBooked: 'Забронировал',
    statusPending: 'Ожидает',
  },
  CZ: {
    title: 'Pozvat přátele',
    subtitle: 'Sdílejte MapBook a získejte bonusy',
    heroTitle: 'Pozvěte a získejte odměny',
    heroSub: 'Pozvěte přátele do MapBook a získejte bonusy, když se připojí a rezervují.',
    yourCode: 'Váš referral kód',
    copy: 'Kopírovat',
    copied: 'Zkopírováno',
    inviteLink: 'Referral odkaz',
    rewards: 'Odměny',
    reward1: 'Získejte bonus za každého nového uživatele',
    reward2: 'Získejte bonus po první dokončené rezervaci',
    reward3: 'Sledujte referraly a historii odměn na jednom místě',
    stats: 'Vaše statistiky',
    invited: 'Pozváno',
    joined: 'Připojeno',
    earned: 'Získáno',
    history: 'Historie referralů',
    empty: 'Zatím žádné referraly',
    emptySub: 'Sdílejte svůj kód s přáteli a aktivita se zobrazí zde.',
    share: 'Sdílet kód',
    statusJoined: 'Připojeno',
    statusBooked: 'Rezervováno',
    statusPending: 'Čeká',
  },
  DE: {
    title: 'Freunde einladen',
    subtitle: 'Teile MapBook und erhalte Boni',
    heroTitle: 'Einladen und Belohnungen erhalten',
    heroSub: 'Lade Freunde zu MapBook ein und erhalte Boni, wenn sie beitreten und buchen.',
    yourCode: 'Dein Empfehlungscode',
    copy: 'Kopieren',
    copied: 'Kopiert',
    inviteLink: 'Einladungslink',
    rewards: 'Belohnungen',
    reward1: 'Erhalte einen Bonus für jeden neuen Nutzer',
    reward2: 'Erhalte einen Buchungsbonus nach der ersten abgeschlossenen Buchung',
    reward3: 'Verfolge Empfehlungen und Bonusverlauf an einem Ort',
    stats: 'Deine Statistik',
    invited: 'Eingeladen',
    joined: 'Beigetreten',
    earned: 'Verdient',
    history: 'Empfehlungsverlauf',
    empty: 'Noch keine Empfehlungen',
    emptySub: 'Teile deinen Code mit Freunden und deine Aktivität erscheint hier.',
    share: 'Code teilen',
    statusJoined: 'Beigetreten',
    statusBooked: 'Gebucht',
    statusPending: 'Ausstehend',
  },
  PL: {
    title: 'Zaproś znajomych',
    subtitle: 'Udostępniaj MapBook i zdobywaj bonusy',
    heroTitle: 'Zaproś i odbieraj nagrody',
    heroSub: 'Zaproś znajomych do MapBook i odbieraj bonusy, gdy dołączą i zarezerwują.',
    yourCode: 'Twój kod polecający',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    inviteLink: 'Link polecający',
    rewards: 'Nagrody',
    reward1: 'Otrzymuj bonus za każdego nowego użytkownika',
    reward2: 'Otrzymuj bonus po pierwszej zakończonej rezerwacji',
    reward3: 'Śledź polecenia i historię nagród w jednym miejscu',
    stats: 'Twoje statystyki',
    invited: 'Zaproszono',
    joined: 'Dołączyli',
    earned: 'Zyskano',
    history: 'Historia poleceń',
    empty: 'Brak poleceń',
    emptySub: 'Udostępnij kod znajomym, a aktywność pojawi się tutaj.',
    share: 'Udostępnij kod',
    statusJoined: 'Dołączył',
    statusBooked: 'Zarezerwował',
    statusPending: 'Oczekuje',
  },
} as const;

type InviteItem = {
  id: string;
  name: string;
  status: 'joined' | 'booked' | 'pending';
  reward: number;
};

const inviteHistory: InviteItem[] = [
  { id: '1', name: 'Anna', status: 'booked', reward: 10 },
  { id: '2', name: 'Sofia', status: 'joined', reward: 5 },
  { id: '3', name: 'Mila', status: 'pending', reward: 0 },
];

function statusStyle(status: InviteItem['status']) {
  if (status === 'booked') return { background: '#eef9f1', color: '#2fa35a' };
  if (status === 'joined') return { background: '#eef4ff', color: '#2f7cf6' };
  return { background: '#fff5e8', color: '#d68612' };
}

export default function InvitePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    syncLanguage();
    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(
    () => inviteTexts[language as keyof typeof inviteTexts] || inviteTexts.EN,
    [language]
  );

  const referralCode = 'MAP-ALEX-2026';
  const inviteLink = `https://mapbook.app/invite/${referralCode}`;

  const statusLabel = (status: InviteItem['status']) => {
    if (status === 'booked') return text.statusBooked;
    if (status === 'joined') return text.statusJoined;
    return text.statusPending;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

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
              gridTemplateColumns: '56px 1fr',
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
              🎁
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
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 24,
              background: '#fff',
              border: '1px solid #f1e8dc',
              padding: 16,
            }}
          >
            <div style={{ fontSize: 13, color: '#8b8277', fontWeight: 800 }}>
              {text.yourCode}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 26,
                fontWeight: 900,
                color: '#17130f',
                letterSpacing: 1,
              }}
            >
              {referralCode}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                marginTop: 12,
                border: 'none',
                borderRadius: 18,
                background: '#2f241c',
                color: '#fff',
                minHeight: 48,
                padding: '0 18px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {copied ? text.copied : text.copy}
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 20,
              background: '#eef4ff',
              padding: '12px 14px',
              fontSize: 13,
              color: '#2f5dc4',
              fontWeight: 800,
              lineHeight: 1.45,
              wordBreak: 'break-all',
            }}
          >
            {text.inviteLink}: {inviteLink}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 16,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.rewards}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {[text.reward1, text.reward2, text.reward3].map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: 20,
                  background: '#fcfaf6',
                  border: '1px solid #f1e8dc',
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#6d6258',
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 16,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.stats}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.invited}
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: '#17130f' }}>
                12
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.joined}
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: '#17130f' }}>
                8
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                background: '#fff',
                border: '1px solid #f1e8dc',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#8b8277', fontWeight: 800 }}>
                {text.earned}
              </div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 900, color: '#17130f' }}>
                £15
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 30,
            border: '1px solid #efe4d7',
            background: '#fff',
            padding: 16,
            boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#17130f',
              marginBottom: 12,
            }}
          >
            {text.history}
          </div>

          {inviteHistory.length === 0 ? (
            <div
              style={{
                borderRadius: 24,
                background: '#fcfaf6',
                border: '1px solid #f1e8dc',
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 900, color: '#17130f' }}>{text.empty}</div>
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
            <div style={{ display: 'grid', gap: 12 }}>
              {inviteHistory.map((item) => {
                const badge = statusStyle(item.status);

                return (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 24,
                      border: '1px solid #f1e8dc',
                      background: '#fff',
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#17130f' }}>
                          {item.name}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            display: 'inline-flex',
                            borderRadius: 999,
                            padding: '8px 12px',
                            fontSize: 12,
                            fontWeight: 900,
                            ...badge,
                          }}
                        >
                          {statusLabel(item.status)}
                        </div>
                      </div>

                      <div style={{ fontSize: 18, fontWeight: 900, color: '#17130f' }}>
                        £{item.reward}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          style={{
            marginTop: 18,
            width: '100%',
            border: 'none',
            borderRadius: 24,
            background: 'linear-gradient(180deg, #2b221c 0%, #1f1712 100%)',
            color: '#fff',
            minHeight: 56,
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 14px 28px rgba(31,23,18,0.20)',
          }}
        >
          {text.share}
        </button>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
