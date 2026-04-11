'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const legalTexts = {
  EN: {
    title: 'Legal information',
    subtitle: 'Policies, rules, payments and account rights',
    heroTitle: 'Platform rules and legal documents',
    heroSub:
      'Everything important about privacy, payments, refunds, account rights and safe use of MapBook.',
    terms: 'Terms & Conditions',
    termsSub: 'Rules for using MapBook platform',
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
    protected: 'Protected by MapBook',
    launchReady: 'Pre-launch legal structure',
    open: 'Open',
  },
  ES: {
    title: 'Información legal',
    subtitle: 'Políticas, reglas, pagos y derechos de cuenta',
    heroTitle: 'Reglas de la plataforma y documentos legales',
    heroSub:
      'Todo lo importante sobre privacidad, pagos, reembolsos, derechos de cuenta y uso seguro de MapBook.',
    terms: 'Términos y condiciones',
    termsSub: 'Reglas para usar la plataforma MapBook',
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
    protected: 'Protegido por MapBook',
    launchReady: 'Estructura legal pre-lanzamiento',
    open: 'Abrir',
  },
  RU: {
    title: 'Юридическая информация',
    subtitle: 'Политики, правила, платежи и права аккаунта',
    heroTitle: 'Правила платформы и юридические документы',
    heroSub:
      'Всё важное о конфиденциальности, платежах, возвратах, правах аккаунта и безопасном использовании MapBook.',
    terms: 'Условия использования',
    termsSub: 'Правила использования платформы MapBook',
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
    protected: 'Защищено MapBook',
    launchReady: 'Pre-launch юридическая структура',
    open: 'Открыть',
  },
  CZ: {
    title: 'Právní informace',
    subtitle: 'Zásady, pravidla, platby a práva účtu',
    heroTitle: 'Pravidla platformy a právní dokumenty',
    heroSub:
      'Vše důležité o soukromí, platbách, refundech, právech účtu a bezpečném používání MapBook.',
    terms: 'Obchodní podmínky',
    termsSub: 'Pravidla používání platformy MapBook',
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
    protected: 'Chráněno MapBook',
    launchReady: 'Právní struktura před spuštěním',
    open: 'Otevřít',
  },
  DE: {
    title: 'Rechtliche Informationen',
    subtitle: 'Richtlinien, Regeln, Zahlungen und Kontorechte',
    heroTitle: 'Plattformregeln und rechtliche Dokumente',
    heroSub:
      'Alles Wichtige zu Datenschutz, Zahlungen, Rückerstattungen, Kontorechten und sicherer Nutzung von MapBook.',
    terms: 'AGB',
    termsSub: 'Regeln für die Nutzung der MapBook-Plattform',
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
    protected: 'Durch MapBook geschützt',
    launchReady: 'Pre-Launch Rechtsstruktur',
    open: 'Öffnen',
  },
  PL: {
    title: 'Informacje prawne',
    subtitle: 'Polityki, zasady, płatności i prawa konta',
    heroTitle: 'Zasady platformy i dokumenty prawne',
    heroSub:
      'Wszystko, co ważne o prywatności, płatnościach, zwrotach, prawach konta i bezpiecznym korzystaniu z MapBook.',
    terms: 'Regulamin',
    termsSub: 'Zasady korzystania z platformy MapBook',
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
    protected: 'Chronione przez MapBook',
    launchReady: 'Struktura prawna przed startem',
    open: 'Otwórz',
  },
} as const;

type LegalItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: 'pink' | 'green' | 'blue' | 'violet' | 'orange' | 'neutral';
};

function accentStyles(accent: LegalItem['accent']) {
  if (accent === 'pink') return { background: '#fff1f7', color: '#ff4fa0' };
  if (accent === 'green') return { background: '#eef9f1', color: '#2fa35a' };
  if (accent === 'blue') return { background: '#eef4ff', color: '#2f7cf6' };
  if (accent === 'violet') return { background: '#f3efff', color: '#7a5af8' };
  if (accent === 'orange') return { background: '#fff5e8', color: '#d68612' };
  return { background: '#f4efe8', color: '#6d6258' };
}

export default function LegalPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>('EN');

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    syncLanguage();
    window.addEventListener('focus', syncLanguage);

    return () => {
      window.removeEventListener('focus', syncLanguage);
    };
  }, []);

  const text = useMemo(
    () => legalTexts[language as keyof typeof legalTexts] || legalTexts.EN,
    [language]
  );

  const items: LegalItem[] = [
    {
      id: 'terms',
      title: text.terms,
      subtitle: text.termsSub,
      icon: '📄',
      accent: 'blue',
    },
    {
      id: 'privacy',
      title: text.privacy,
      subtitle: text.privacySub,
      icon: '🔒',
      accent: 'green',
    },
    {
      id: 'cookies',
      title: text.cookies,
      subtitle: text.cookiesSub,
      icon: '🍪',
      accent: 'orange',
    },
    {
      id: 'refunds',
      title: text.refunds,
      subtitle: text.refundsSub,
      icon: '💳',
      accent: 'pink',
    },
    {
      id: 'community',
      title: text.community,
      subtitle: text.communitySub,
      icon: '🛡️',
      accent: 'violet',
    },
    {
      id: 'payments',
      title: text.payments,
      subtitle: text.paymentsSub,
      icon: '🏦',
      accent: 'green',
    },
    {
      id: 'delete',
      title: text.deleteInfo,
      subtitle: text.deleteInfoSub,
      icon: '🗑️',
      accent: 'neutral',
    },
    {
      id: 'support',
      title: text.support,
      subtitle: text.supportSub,
      icon: '✉️',
      accent: 'blue',
    },
  ];

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
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#17130f',
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
              marginBottom: 14,
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
              ⚖️
            </div>

            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
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
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div
              style={{
                borderRadius: 999,
                padding: '10px 14px',
                background: '#eef9f1',
                color: '#2fa35a',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              🛡️ {text.protected}
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '10px 14px',
                background: '#eef4ff',
                color: '#2f7cf6',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              📘 {text.launchReady}
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
            {text.sectionTitle}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((item) => {
              const accent = accentStyles(item.accent);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => alert(`${item.title} — coming next`)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '14px 16px',
                    textAlign: 'left',
                    border: '1px solid #f1e8dc',
                    borderRadius: 24,
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      ...accent,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        lineHeight: 1.45,
                        color: '#7b7268',
                        fontWeight: 700,
                      }}
                    >
                      {item.subtitle}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 18,
                      color: '#938475',
                      fontWeight: 900,
                    }}
                  >
                    {text.open}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 24,
            background: '#fff8f2',
            border: '1px solid #f1e3d3',
            padding: 16,
            fontSize: 13,
            lineHeight: 1.6,
            color: '#8a6f52',
            fontWeight: 700,
          }}
        >
          {text.note}
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
