'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';
import {
  getReferralState,
  subscribeToReferralStore,
  type ReferralState,
} from '../../services/referralStore';
import { getWalletState, subscribeToWalletStore, type WalletState } from '../../services/walletStore';

const inviteTexts = {
  EN: {
    title: 'Invite friends',
    heroTitle: 'Invite a friend — get a free booking',
    heroText:
      'For every friend who pays their first £5 unlock, you get 1 free booking.',
    permanent: 'This works permanently',
    invited: 'Invited',
    paid: 'Paid',
    freeBookings: 'Free bookings',
    yourLink: 'Your link',
    linkText:
      'Share your link with friends. They get a £5 first booking bonus, and you get a free booking when they pay.',
    share: 'Share link',
    copy: 'Copy',
    howItWorks: 'How it works',
    step1: 'Invite a friend',
    step1Text: 'Send your referral link any way you like.',
    step2: 'Friend registers and pays',
    step2Text: 'When your friend pays their first £5 unlock, it counts.',
    step3: 'You get a free booking',
    step3Text: 'We credit you with 1 free booking for your next unlock.',
    invitedFriends: 'Invited friends',
    bonuses: 'Your bonuses',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Referral bonuses',
    totalAvailable: 'Total available',
    copied: 'Link copied',
    registered: 'Registered',
    paidStatus: 'Paid',
    rewardEarned: 'Reward earned',
    pendingPayment: 'Waiting for payment',
  },
  ES: {
    title: 'Invitar amigos',
    heroTitle: 'Invita a un amigo — consigue una reserva gratis',
    heroText:
      'Por cada amigo que pague su primer unlock de £5, recibes 1 reserva gratis.',
    permanent: 'Funciona siempre',
    invited: 'Invitados',
    paid: 'Pagaron',
    freeBookings: 'Reservas gratis',
    yourLink: 'Tu enlace',
    linkText:
      'Comparte tu enlace con amigos. Ellos reciben un bono de £5 y tú una reserva gratis cuando paguen.',
    share: 'Compartir enlace',
    copy: 'Copiar',
    howItWorks: 'Cómo funciona',
    step1: 'Invita a un amigo',
    step1Text: 'Envía tu enlace como prefieras.',
    step2: 'El amigo se registra y paga',
    step2Text: 'Cuando tu amigo paga su primer unlock de £5, cuenta.',
    step3: 'Recibes una reserva gratis',
    step3Text: 'Te acreditamos 1 reserva gratis para tu próximo unlock.',
    invitedFriends: 'Amigos invitados',
    bonuses: 'Tus bonos',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Bonos por referidos',
    totalAvailable: 'Total disponible',
    copied: 'Enlace copiado',
    registered: 'Registrado',
    paidStatus: 'Pagado',
    rewardEarned: 'Recompensa recibida',
    pendingPayment: 'Esperando pago',
  },
  RU: {
    title: 'Пригласить друзей',
    heroTitle: 'Пригласите друга — получите бесплатное бронирование',
    heroText:
      'За каждого друга, который оплатит свой первый £5 unlock, вы получите 1 бесплатное бронирование.',
    permanent: 'Это работает постоянно',
    invited: 'Приглашено',
    paid: 'Оплатили',
    freeBookings: 'Бесплатных бронирований',
    yourLink: 'Ваша ссылка',
    linkText:
      'Отправьте ссылку друзьям. Они получат бонус £5 на первое бронирование, а вы — бесплатное бронирование, когда они оплатят.',
    share: 'Поделиться ссылкой',
    copy: 'Скопировать',
    howItWorks: 'Как это работает',
    step1: 'Пригласите друга',
    step1Text: 'Отправьте свою ссылку любым удобным способом.',
    step2: 'Друг регистрируется и оплачивает',
    step2Text: 'Когда друг оплачивает свой первый £5 unlock, это засчитывается.',
    step3: 'Вы получаете бесплатное бронирование',
    step3Text: 'Мы начисляем вам 1 бесплатное бронирование на следующий unlock.',
    invitedFriends: 'Приглашённые друзья',
    bonuses: 'Ваши бонусы',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Реферальные бонусы',
    totalAvailable: 'Всего доступно',
    copied: 'Ссылка скопирована',
    registered: 'Зарегистрировался',
    paidStatus: 'Оплатил',
    rewardEarned: 'Зачтено',
    pendingPayment: 'Ожидает оплату',
  },
  CZ: {
    title: 'Pozvat přátele',
    heroTitle: 'Pozvěte přítele — získejte rezervaci zdarma',
    heroText:
      'Za každého přítele, který zaplatí svůj první £5 unlock, získáte 1 rezervaci zdarma.',
    permanent: 'Funguje to trvale',
    invited: 'Pozváno',
    paid: 'Zaplatili',
    freeBookings: 'Rezervací zdarma',
    yourLink: 'Váš odkaz',
    linkText:
      'Pošlete odkaz přátelům. Oni dostanou bonus £5 a vy rezervaci zdarma, když zaplatí.',
    share: 'Sdílet odkaz',
    copy: 'Kopírovat',
    howItWorks: 'Jak to funguje',
    step1: 'Pozvěte přítele',
    step1Text: 'Pošlete svůj odkaz jakýmkoliv způsobem.',
    step2: 'Přítel se zaregistruje a zaplatí',
    step2Text: 'Když přítel zaplatí svůj první £5 unlock, započítá se to.',
    step3: 'Získáte rezervaci zdarma',
    step3Text: 'Připíšeme vám 1 rezervaci zdarma na další unlock.',
    invitedFriends: 'Pozvaní přátelé',
    bonuses: 'Vaše bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Doporučovací bonusy',
    totalAvailable: 'Celkem dostupné',
    copied: 'Odkaz zkopírován',
    registered: 'Registrován',
    paidStatus: 'Zaplatil',
    rewardEarned: 'Započítáno',
    pendingPayment: 'Čeká na platbu',
  },
  DE: {
    title: 'Freunde einladen',
    heroTitle: 'Lade einen Freund ein — erhalte eine kostenlose Buchung',
    heroText:
      'Für jeden Freund, der seinen ersten £5 Unlock bezahlt, erhältst du 1 kostenlose Buchung.',
    permanent: 'Das funktioniert dauerhaft',
    invited: 'Eingeladen',
    paid: 'Bezahlt',
    freeBookings: 'Kostenlose Buchungen',
    yourLink: 'Dein Link',
    linkText:
      'Teile deinen Link mit Freunden. Sie erhalten £5 Bonus, und du eine kostenlose Buchung, wenn sie zahlen.',
    share: 'Link teilen',
    copy: 'Kopieren',
    howItWorks: 'So funktioniert es',
    step1: 'Freund einladen',
    step1Text: 'Sende deinen Link auf beliebigem Weg.',
    step2: 'Freund registriert sich und zahlt',
    step2Text: 'Wenn dein Freund seinen ersten £5 Unlock zahlt, zählt es.',
    step3: 'Du erhältst eine kostenlose Buchung',
    step3Text: 'Wir schreiben dir 1 kostenlose Buchung für deinen nächsten Unlock gut.',
    invitedFriends: 'Eingeladene Freunde',
    bonuses: 'Deine Boni',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Empfehlungsboni',
    totalAvailable: 'Insgesamt verfügbar',
    copied: 'Link kopiert',
    registered: 'Registriert',
    paidStatus: 'Bezahlt',
    rewardEarned: 'Gutgeschrieben',
    pendingPayment: 'Wartet auf Zahlung',
  },
  PL: {
    title: 'Zaproś znajomych',
    heroTitle: 'Zaproś znajomego — otrzymaj darmową rezerwację',
    heroText:
      'Za każdego znajomego, który opłaci swój pierwszy unlock £5, otrzymasz 1 darmową rezerwację.',
    permanent: 'To działa cały czas',
    invited: 'Zaproszono',
    paid: 'Zapłacili',
    freeBookings: 'Darmowych rezerwacji',
    yourLink: 'Twój link',
    linkText:
      'Udostępnij link znajomym. Oni dostaną bonus £5, a Ty darmową rezerwację, gdy zapłacą.',
    share: 'Udostępnij link',
    copy: 'Kopiuj',
    howItWorks: 'Jak to działa',
    step1: 'Zaproś znajomego',
    step1Text: 'Wyślij link w dowolny sposób.',
    step2: 'Znajomy rejestruje się i płaci',
    step2Text: 'Gdy znajomy opłaci swój pierwszy unlock £5, zostanie to zaliczone.',
    step3: 'Otrzymujesz darmową rezerwację',
    step3Text: 'Przyznamy Ci 1 darmową rezerwację na kolejny unlock.',
    invitedFriends: 'Zaproszeni znajomi',
    bonuses: 'Twoje bonusy',
    welcomeBonus: 'Welcome Bonus',
    referralBonuses: 'Bonusy poleceń',
    totalAvailable: 'Łącznie dostępne',
    copied: 'Skopiowano link',
    registered: 'Zarejestrowano',
    paidStatus: 'Zapłacił',
    rewardEarned: 'Zaliczone',
    pendingPayment: 'Oczekuje na płatność',
  },
} as const;

export default function InviteFriendsPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [referral, setReferral] = useState<ReferralState>(getReferralState());
  const [wallet, setWallet] = useState<WalletState>(getWalletState());

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    const syncReferral = () => {
      setReferral(getReferralState());
    };

    const syncWallet = () => {
      setWallet(getWalletState());
    };

    syncLanguage();
    syncReferral();
    syncWallet();

    window.addEventListener('focus', syncLanguage);
    const unsubReferral = subscribeToReferralStore(syncReferral);
    const unsubWallet = subscribeToWalletStore(syncWallet);

    return () => {
      window.removeEventListener('focus', syncLanguage);
      unsubReferral();
      unsubWallet();
    };
  }, []);

  const text = useMemo(
    () => inviteTexts[language as keyof typeof inviteTexts] || inviteTexts.EN,
    [language]
  );

  const totalAvailable = wallet.welcomeBonus + wallet.referralCredits;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referral.referralLink);
      alert(text.copied);
    } catch {
      alert(text.copied);
    }
  };

  const getStatusLabel = (status: ReferralState['friends'][number]['status']) => {
    if (status === 'registered') return text.registered;
    if (status === 'paid') return text.paidStatus;
    if (status === 'reward_earned') return text.rewardEarned;
    return text.pendingPayment;
  };

  const getStatusStyle = (status: ReferralState['friends'][number]['status']) => {
    if (status === 'reward_earned' || status === 'paid') {
      return 'bg-[#e8f5ea] text-[#2d8a55]';
    }

    if (status === 'pending_payment') {
      return 'bg-[#fff1df] text-[#c67610]';
    }

    return 'bg-[#f2ede7] text-[#5c5046]';
  };

  return (
    <main className="min-h-screen bg-[#fcf8f2] px-4 py-6 pb-24">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-[#241c16] shadow-sm"
          >
            ←
          </button>

          <h1 className="text-xl font-bold text-[#1d1712]">{text.title}</h1>

          <div className="h-11 w-11" />
        </div>

        <div className="mt-6 rounded-[30px] border border-[#efe4d7] bg-white p-5 shadow-sm">
          <div className="text-2xl font-extrabold leading-tight text-[#1d1712]">
            {text.heroTitle}
          </div>
          <p className="mt-3 text-sm leading-6 text-[#6f6458]">{text.heroText}</p>

          <div className="mt-4 inline-flex items-center rounded-full bg-[#edf7ed] px-3 py-2 text-xs font-bold text-[#2d8a55]">
            {text.permanent}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-[24px] bg-[#2f241c] p-4 text-center text-white shadow-sm">
            <div className="text-xs text-[#d9cdbd]">{text.invited}</div>
            <div className="mt-2 text-3xl font-extrabold">{referral.invitedCount}</div>
          </div>

          <div className="rounded-[24px] bg-[#2f241c] p-4 text-center text-white shadow-sm">
            <div className="text-xs text-[#d9cdbd]">{text.paid}</div>
            <div className="mt-2 text-3xl font-extrabold">{referral.paidCount}</div>
          </div>

          <div className="rounded-[24px] bg-[#2f241c] p-4 text-center text-white shadow-sm">
            <div className="text-xs text-[#d9cdbd]">{text.freeBookings}</div>
            <div className="mt-2 text-3xl font-extrabold">
              {referral.freeBookingsAvailable}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-sm font-extrabold text-[#1d1712]">{text.yourLink}</div>
          <p className="mt-2 text-sm leading-6 text-[#6f6458]">{text.linkText}</p>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3">
            <div className="min-w-0 flex-1 truncate text-sm text-[#1d1712]">
              {referral.referralLink}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-[#efe4d7] bg-white px-3 py-2 text-xs font-bold text-[#2f241c]"
            >
              {text.copy}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 w-full rounded-2xl bg-[#2f241c] px-4 py-4 text-sm font-bold text-white"
          >
            {text.share}
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.howItWorks}</div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-[#1d1712]">1. {text.step1}</div>
              <div className="mt-1 text-sm leading-6 text-[#6f6458]">{text.step1Text}</div>
            </div>

            <div>
              <div className="text-sm font-bold text-[#1d1712]">2. {text.step2}</div>
              <div className="mt-1 text-sm leading-6 text-[#6f6458]">{text.step2Text}</div>
            </div>

            <div>
              <div className="text-sm font-bold text-[#1d1712]">3. {text.step3}</div>
              <div className="mt-1 text-sm leading-6 text-[#6f6458]">{text.step3Text}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-extrabold text-[#1d1712]">{text.invitedFriends}</h2>

          <div className="mt-4 space-y-4">
            {referral.friends.map((friend) => (
              <div
                key={friend.id}
                className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      friend.avatar ||
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={friend.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-[#1d1712]">
                          {friend.name}
                        </div>
                        <div className="mt-1 text-xs text-[#8a7d70]">
                          {new Date(friend.joinedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(friend.status)}`}
                      >
                        {getStatusLabel(friend.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.bonuses}</div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6ef] px-4 py-3">
              <div>
                <div className="text-sm font-bold text-[#1d1712]">{text.welcomeBonus}</div>
              </div>
              <div className="text-sm font-extrabold text-[#1d1712]">
                £{wallet.welcomeBonus.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6ef] px-4 py-3">
              <div>
                <div className="text-sm font-bold text-[#1d1712]">{text.referralBonuses}</div>
              </div>
              <div className="text-sm font-extrabold text-[#1d1712]">
                £{wallet.referralCredits.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f2ede7] px-4 py-3">
              <div className="text-sm font-extrabold text-[#1d1712]">{text.totalAvailable}</div>
              <div className="text-base font-extrabold text-[#1d1712]">
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
