'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type LegalTextShape = {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSub: string;
  terms: string;
  termsSub: string;
  privacy: string;
  privacySub: string;
  cookies: string;
  cookiesSub: string;
  refunds: string;
  refundsSub: string;
  community: string;
  communitySub: string;
  payments: string;
  paymentsSub: string;
  deleteInfo: string;
  deleteInfoSub: string;
  support: string;
  supportSub: string;
  sectionTitle: string;
  note: string;
  protected: string;
  launchReady: string;
  open: string;
  comingNext: string;
};

type LegalItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'neutral';
};

const BRAND = {
  navy: '#071b46',
  blue: '#0e73d8',
  green: '#24c45a',
  yellow: '#ffd629',
  pink: '#ff4f9a',
  softBlue: '#dcecff',
  softGreen: '#dcffe8',
  softPink: '#ffe9f2',
  softViolet: '#f2edff',
  softOrange: '#fff0da',
  bg: '#ffffff',
  border: '#050505',
  muted: '#6c7686',
};

const legalTexts: Record<AppLanguage, LegalTextShape> = {
  EN: {
    title: 'Legal information',
    subtitle: 'Policies, rules, payments and account rights',
    heroTitle: 'Platform rules and legal documents',
    heroSub:
      'Everything important about privacy, payments, refunds, account rights and safe use of Olamep.',
    terms: 'Terms & Conditions',
    termsSub: 'Rules for using Olamep platform',
    privacy: 'Privacy Policy',
    privacySub: 'How we collect, store and use data',
    cookies: 'Cookie Policy',
    cookiesSub: 'How cookies and tracking tools are used',
    refunds: 'Refunds & Cancellation',
    refundsSub: 'Booking cancellations, payment holds and refunds',
    community: 'Community Guidelines',
    communitySub: 'Safe use of the platform and user conduct',
    payments: 'Payment Terms',
    paymentsSub: 'Cards, wallet, holds, unlocks and payouts',
    deleteInfo: 'Account Deletion',
    deleteInfoSub: 'What happens when your account is removed',
    support: 'Support & Complaints',
    supportSub: 'How to contact support and resolve issues',
    sectionTitle: 'Legal sections',
    note: 'These pages should later be replaced with final legally reviewed texts before public launch.',
    protected: 'Protected by Olamep',
    launchReady: 'Pre-launch legal structure',
    open: 'Open',
    comingNext: 'Coming next',
  },
  RU: {
    title: 'Юридическая информация',
    subtitle: 'Политики, правила, платежи и права аккаунта',
    heroTitle: 'Правила платформы и юридические документы',
    heroSub:
      'Всё важное о конфиденциальности, платежах, возвратах, правах аккаунта и безопасном использовании Olamep.',
    terms: 'Условия использования',
    termsSub: 'Правила использования платформы Olamep',
    privacy: 'Политика конфиденциальности',
    privacySub: 'Как мы собираем, храним и используем данные',
    cookies: 'Политика cookies',
    cookiesSub: 'Как используются cookies и инструменты отслеживания',
    refunds: 'Возвраты и отмены',
    refundsSub: 'Отмены бронирований, hold-платежи и возвраты',
    community: 'Правила сообщества',
    communitySub: 'Безопасное использование платформы и поведение пользователей',
    payments: 'Платёжные условия',
    paymentsSub: 'Карты, баланс, hold, unlock и выплаты',
    deleteInfo: 'Удаление аккаунта',
    deleteInfoSub: 'Что происходит после удаления аккаунта',
    support: 'Поддержка и жалобы',
    supportSub: 'Как связаться с поддержкой и решить спорные вопросы',
    sectionTitle: 'Юридические разделы',
    note: 'Позже эти страницы нужно заменить на финальные юридически проверенные тексты перед публичным запуском.',
    protected: 'Защищено Olamep',
    launchReady: 'Pre-launch юридическая структура',
    open: 'Открыть',
    comingNext: 'Скоро',
  },
  UA: {
    title: 'Юридична інформація',
    subtitle: 'Політики, правила, платежі та права акаунта',
    heroTitle: 'Правила платформи та юридичні документи',
    heroSub:
      'Усе важливе про конфіденційність, платежі, повернення, права акаунта і безпечне використання Olamep.',
    terms: 'Умови використання',
    termsSub: 'Правила використання платформи Olamep',
    privacy: 'Політика конфіденційності',
    privacySub: 'Як ми збираємо, зберігаємо і використовуємо дані',
    cookies: 'Політика cookies',
    cookiesSub: 'Як використовуються cookies та інструменти відстеження',
    refunds: 'Повернення та скасування',
    refundsSub: 'Скасування бронювань, hold-платежі та повернення',
    community: 'Правила спільноти',
    communitySub: 'Безпечне використання платформи і поведінка користувачів',
    payments: 'Платіжні умови',
    paymentsSub: 'Картки, баланс, hold, unlock і виплати',
    deleteInfo: 'Видалення акаунта',
    deleteInfoSub: 'Що відбувається після видалення акаунта',
    support: 'Підтримка та скарги',
    supportSub: 'Як зв’язатися з підтримкою і вирішити спірні питання',
    sectionTitle: 'Юридичні розділи',
    note: 'Пізніше ці сторінки потрібно замінити на фінальні юридично перевірені тексти перед публічним запуском.',
    protected: 'Захищено Olamep',
    launchReady: 'Pre-launch юридична структура',
    open: 'Відкрити',
    comingNext: 'Скоро',
  },
  ES: {
    title: 'Información legal',
    subtitle: 'Políticas, reglas, pagos y derechos de cuenta',
    heroTitle: 'Reglas de la plataforma y documentos legales',
    heroSub:
      'Todo lo importante sobre privacidad, pagos, reembolsos, derechos de cuenta y uso seguro de Olamep.',
    terms: 'Términos y condiciones',
    termsSub: 'Reglas para usar la plataforma Olamep',
    privacy: 'Política de privacidad',
    privacySub: 'Cómo recopilamos, guardamos y usamos datos',
    cookies: 'Política de cookies',
    cookiesSub: 'Cómo se usan cookies y herramientas de seguimiento',
    refunds: 'Reembolsos y cancelaciones',
    refundsSub: 'Cancelaciones, bloqueos de pago y reembolsos',
    community: 'Normas de la comunidad',
    communitySub: 'Uso seguro de la plataforma y conducta del usuario',
    payments: 'Términos de pago',
    paymentsSub: 'Tarjetas, saldo, bloqueos, unlocks y pagos',
    deleteInfo: 'Eliminación de cuenta',
    deleteInfoSub: 'Qué ocurre cuando se elimina tu cuenta',
    support: 'Soporte y reclamaciones',
    supportSub: 'Cómo contactar soporte y resolver problemas',
    sectionTitle: 'Secciones legales',
    note: 'Estas páginas deberán sustituirse después por textos legales finales revisados antes del lanzamiento público.',
    protected: 'Protegido por Olamep',
    launchReady: 'Estructura legal pre-lanzamiento',
    open: 'Abrir',
    comingNext: 'Próximamente',
  },
  CZ: {
    title: 'Právní informace',
    subtitle: 'Zásady, pravidla, platby a práva účtu',
    heroTitle: 'Pravidla platformy a právní dokumenty',
    heroSub:
      'Vše důležité o soukromí, platbách, refundech, právech účtu a bezpečném používání Olamep.',
    terms: 'Obchodní podmínky',
    termsSub: 'Pravidla používání platformy Olamep',
    privacy: 'Zásady ochrany osobních údajů',
    privacySub: 'Jak sbíráme, ukládáme a používáme data',
    cookies: 'Zásady cookies',
    cookiesSub: 'Jak používáme cookies a sledovací nástroje',
    refunds: 'Vrácení peněz a storna',
    refundsSub: 'Zrušení rezervací, blokace plateb a vrácení peněz',
    community: 'Pravidla komunity',
    communitySub: 'Bezpečné používání platformy a chování uživatelů',
    payments: 'Platební podmínky',
    paymentsSub: 'Karty, zůstatek, hold, unlock a výplaty',
    deleteInfo: 'Smazání účtu',
    deleteInfoSub: 'Co se stane po odstranění účtu',
    support: 'Podpora a stížnosti',
    supportSub: 'Jak kontaktovat podporu a řešit problémy',
    sectionTitle: 'Právní sekce',
    note: 'Tyto stránky je později potřeba nahradit finálními právně zkontrolovanými texty před veřejným spuštěním.',
    protected: 'Chráněno Olamep',
    launchReady: 'Právní struktura před spuštěním',
    open: 'Otevřít',
    comingNext: 'Brzy',
  },
  DE: {
    title: 'Rechtliche Informationen',
    subtitle: 'Richtlinien, Regeln, Zahlungen und Kontorechte',
    heroTitle: 'Plattformregeln und rechtliche Dokumente',
    heroSub:
      'Alles Wichtige zu Datenschutz, Zahlungen, Rückerstattungen, Kontorechten und sicherer Nutzung von Olamep.',
    terms: 'AGB',
    termsSub: 'Regeln für die Nutzung der Olamep-Plattform',
    privacy: 'Datenschutzerklärung',
    privacySub: 'Wie wir Daten erfassen, speichern und nutzen',
    cookies: 'Cookie-Richtlinie',
    cookiesSub: 'Wie Cookies und Tracking-Tools verwendet werden',
    refunds: 'Rückerstattung und Stornierung',
    refundsSub: 'Buchungsstornos, Zahlungssperren und Rückerstattungen',
    community: 'Community-Richtlinien',
    communitySub: 'Sichere Nutzung der Plattform und Nutzerverhalten',
    payments: 'Zahlungsbedingungen',
    paymentsSub: 'Karten, Guthaben, Holds, Unlocks und Auszahlungen',
    deleteInfo: 'Kontolöschung',
    deleteInfoSub: 'Was passiert bei Löschung deines Kontos',
    support: 'Support und Beschwerden',
    supportSub: 'Wie du den Support kontaktierst und Probleme klärst',
    sectionTitle: 'Rechtliche Bereiche',
    note: 'Diese Seiten sollten später vor dem öffentlichen Launch durch final juristisch geprüfte Texte ersetzt werden.',
    protected: 'Durch Olamep geschützt',
    launchReady: 'Pre-Launch Rechtsstruktur',
    open: 'Öffnen',
    comingNext: 'Bald',
  },
  IT: {
    title: 'Informazioni legali',
    subtitle: 'Policy, regole, pagamenti e diritti account',
    heroTitle: 'Regole piattaforma e documenti legali',
    heroSub:
      'Tutto ciò che conta su privacy, pagamenti, rimborsi, diritti account e uso sicuro di Olamep.',
    terms: 'Termini e condizioni',
    termsSub: 'Regole per usare la piattaforma Olamep',
    privacy: 'Privacy Policy',
    privacySub: 'Come raccogliamo, salviamo e usiamo i dati',
    cookies: 'Cookie Policy',
    cookiesSub: 'Come vengono usati cookie e strumenti di tracking',
    refunds: 'Rimborsi e cancellazioni',
    refundsSub: 'Cancellazioni, blocchi pagamento e rimborsi',
    community: 'Linee guida community',
    communitySub: 'Uso sicuro della piattaforma e condotta utenti',
    payments: 'Termini di pagamento',
    paymentsSub: 'Carte, wallet, hold, unlock e pagamenti',
    deleteInfo: 'Eliminazione account',
    deleteInfoSub: 'Cosa succede quando l’account viene rimosso',
    support: 'Supporto e reclami',
    supportSub: 'Come contattare supporto e risolvere problemi',
    sectionTitle: 'Sezioni legali',
    note: 'Queste pagine dovranno essere sostituite con testi legali finali prima del lancio pubblico.',
    protected: 'Protetto da Olamep',
    launchReady: 'Struttura legale pre-lancio',
    open: 'Apri',
    comingNext: 'Presto',
  },
  FR: {
    title: 'Informations légales',
    subtitle: 'Politiques, règles, paiements et droits du compte',
    heroTitle: 'Règles de plateforme et documents légaux',
    heroSub:
      'Tout ce qui est important sur confidentialité, paiements, remboursements, droits du compte et usage sécurisé de Olamep.',
    terms: 'Conditions générales',
    termsSub: 'Règles d’utilisation de la plateforme Olamep',
    privacy: 'Politique de confidentialité',
    privacySub: 'Comment nous collectons, stockons et utilisons les données',
    cookies: 'Politique cookies',
    cookiesSub: 'Comment les cookies et outils de suivi sont utilisés',
    refunds: 'Remboursements et annulations',
    refundsSub: 'Annulations, blocages de paiement et remboursements',
    community: 'Règles communautaires',
    communitySub: 'Usage sécurisé de la plateforme et conduite utilisateur',
    payments: 'Conditions de paiement',
    paymentsSub: 'Cartes, wallet, blocages, unlocks et paiements',
    deleteInfo: 'Suppression du compte',
    deleteInfoSub: 'Ce qui se passe quand votre compte est supprimé',
    support: 'Support et réclamations',
    supportSub: 'Comment contacter le support et résoudre les problèmes',
    sectionTitle: 'Sections légales',
    note: 'Ces pages devront être remplacées par des textes légaux finaux avant le lancement public.',
    protected: 'Protégé par Olamep',
    launchReady: 'Structure légale pré-lancement',
    open: 'Ouvrir',
    comingNext: 'Bientôt',
  },
  PL: {
    title: 'Informacje prawne',
    subtitle: 'Polityki, zasady, płatności i prawa konta',
    heroTitle: 'Zasady platformy i dokumenty prawne',
    heroSub:
      'Wszystko, co ważne o prywatności, płatnościach, zwrotach, prawach konta i bezpiecznym korzystaniu z Olamep.',
    terms: 'Regulamin',
    termsSub: 'Zasady korzystania z platformy Olamep',
    privacy: 'Polityka prywatności',
    privacySub: 'Jak zbieramy, przechowujemy i używamy danych',
    cookies: 'Polityka cookies',
    cookiesSub: 'Jak używane są cookies i narzędzia śledzące',
    refunds: 'Zwroty i anulowanie',
    refundsSub: 'Anulowanie rezerwacji, blokady płatności i zwroty',
    community: 'Zasady społeczności',
    communitySub: 'Bezpieczne korzystanie z platformy i zachowanie użytkowników',
    payments: 'Warunki płatności',
    paymentsSub: 'Karty, saldo, hold, unlock i wypłaty',
    deleteInfo: 'Usunięcie konta',
    deleteInfoSub: 'Co dzieje się po usunięciu konta',
    support: 'Wsparcie i skargi',
    supportSub: 'Jak kontaktować się z pomocą i rozwiązywać problemy',
    sectionTitle: 'Sekcje prawne',
    note: 'Te strony powinny zostać później zastąpione finalnymi tekstami prawnymi przed publicznym uruchomieniem.',
    protected: 'Chronione przez Olamep',
    launchReady: 'Struktura prawna przed startem',
    open: 'Otwórz',
    comingNext: 'Wkrótce',
  },
  AR: {
    title: 'المعلومات القانونية',
    subtitle: 'السياسات والقواعد والمدفوعات وحقوق الحساب',
    heroTitle: 'قواعد المنصة والوثائق القانونية',
    heroSub:
      'كل ما يهم حول الخصوصية والمدفوعات والاسترداد وحقوق الحساب والاستخدام الآمن لـ Olamep.',
    terms: 'الشروط والأحكام',
    termsSub: 'قواعد استخدام منصة Olamep',
    privacy: 'سياسة الخصوصية',
    privacySub: 'كيف نجمع ونخزن ونستخدم البيانات',
    cookies: 'سياسة ملفات cookies',
    cookiesSub: 'كيف نستخدم cookies وأدوات التتبع',
    refunds: 'الاسترداد والإلغاء',
    refundsSub: 'إلغاء الحجوزات وحجز المدفوعات والاسترداد',
    community: 'إرشادات المجتمع',
    communitySub: 'الاستخدام الآمن للمنصة وسلوك المستخدمين',
    payments: 'شروط الدفع',
    paymentsSub: 'البطاقات والمحفظة والحجز والمدفوعات',
    deleteInfo: 'حذف الحساب',
    deleteInfoSub: 'ماذا يحدث عند حذف حسابك',
    support: 'الدعم والشكاوى',
    supportSub: 'كيفية التواصل مع الدعم وحل المشاكل',
    sectionTitle: 'الأقسام القانونية',
    note: 'يجب لاحقاً استبدال هذه الصفحات بنصوص قانونية نهائية قبل الإطلاق العام.',
    protected: 'محمي بواسطة Olamep',
    launchReady: 'هيكل قانوني قبل الإطلاق',
    open: 'فتح',
    comingNext: 'قريباً',
  },
};

function getText(language: AppLanguage) {
  return legalTexts[language] || legalTexts.EN;
}

function accentStyles(accent: LegalItem['accent']) {
  if (accent === 'pink') return { background: BRAND.softPink, color: BRAND.pink };
  if (accent === 'green') return { background: BRAND.softGreen, color: '#11883d' };
  if (accent === 'blue') return { background: BRAND.softBlue, color: BRAND.blue };
  if (accent === 'violet') return { background: BRAND.softViolet, color: '#7254df' };
  if (accent === 'orange') return { background: BRAND.softOrange, color: '#b47b00' };
  return { background: '#f2f4f7', color: BRAND.muted };
}

export default function LegalPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());

  useEffect(() => {
    const syncLanguage = () => setLanguage(getSavedLanguage());
    syncLanguage();

    const unsubLanguage = subscribeToLanguageChange(setLanguage);
    window.addEventListener('focus', syncLanguage);

    return () => {
      unsubLanguage();
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(() => getText(language), [language]);

  const items: LegalItem[] = [
    { id: 'terms', title: text.terms, subtitle: text.termsSub, icon: '📄', accent: 'blue' },
    { id: 'privacy', title: text.privacy, subtitle: text.privacySub, icon: '🔒', accent: 'green' },
    { id: 'cookies', title: text.cookies, subtitle: text.cookiesSub, icon: '🍪', accent: 'orange' },
    { id: 'refunds', title: text.refunds, subtitle: text.refundsSub, icon: '💳', accent: 'pink' },
    {
      id: 'community',
      title: text.community,
      subtitle: text.communitySub,
      icon: '🛡️',
      accent: 'violet',
    },
    { id: 'payments', title: text.payments, subtitle: text.paymentsSub, icon: '🏦', accent: 'green' },
    {
      id: 'delete',
      title: text.deleteInfo,
      subtitle: text.deleteInfoSub,
      icon: '🗑️',
      accent: 'neutral',
    },
    { id: 'support', title: text.support, subtitle: text.supportSub, icon: '✉️', accent: 'blue' },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        paddingBottom: 136,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', padding: '18px 14px 142px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '54px 1fr 54px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 27,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 29,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-0.8px',
              }}
            >
              {text.title}
            </h1>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: 13,
                lineHeight: 1.2,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            aria-label="Close"
            style={{
              width: 54,
              height: 54,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 24,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </header>

        <section
          style={{
            marginTop: 20,
            borderRadius: 30,
            border: `3px solid ${BRAND.border}`,
            background:
              'linear-gradient(135deg, #ffffff 0%, #dcecff 38%, #dcffe8 72%, #fff0da 100%)',
            padding: 15,
            boxShadow: '0 12px 28px rgba(7,27,70,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '62px minmax(0, 1fr)',
              gap: 13,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 20,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softViolet,
                color: '#7254df',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 31,
              }}
            >
              ⚖️
            </div>

            <div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: BRAND.navy,
                }}
              >
                {text.heroTitle}
              </div>

              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.heroSub}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <div
              style={{
                minHeight: 60,
                borderRadius: 19,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softGreen,
                padding: 11,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: '#11883d' }}>
                🛡️ {text.protected}
              </div>
            </div>

            <div
              style={{
                minHeight: 60,
                borderRadius: 19,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 11,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: BRAND.blue }}>
                📘 {text.launchReady}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 22 }}>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: 25,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-0.7px',
              color: BRAND.navy,
            }}
          >
            {text.sectionTitle}
          </h2>

          <div
            style={{
              borderRadius: 26,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
            }}
          >
            {items.map((item, index) => {
              const accent = accentStyles(item.accent);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => alert(`${item.title} — ${text.comingNext}`)}
                  style={{
                    width: '100%',
                    minHeight: 88,
                    display: 'grid',
                    gridTemplateColumns: '58px minmax(0, 1fr) auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px',
                    border: 'none',
                    borderTop: index === 0 ? 'none' : `2px solid ${BRAND.border}`,
                    background: '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      border: `2.5px solid ${BRAND.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 27,
                      background: accent.background,
                      color: accent.color,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.1,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {item.title}
                    </div>

                    <p
                      style={{
                        margin: '5px 0 0',
                        fontSize: 13,
                        lineHeight: 1.3,
                        color: BRAND.muted,
                        fontWeight: 800,
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  <span
                    style={{
                      minHeight: 34,
                      padding: '0 12px',
                      borderRadius: 999,
                      background: BRAND.softBlue,
                      color: BRAND.blue,
                      fontSize: 12,
                      fontWeight: 900,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {text.open}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softOrange,
            padding: 15,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: BRAND.navy,
            }}
          >
            ⚠️ {text.launchReady}
          </div>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {text.note}
          </p>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
