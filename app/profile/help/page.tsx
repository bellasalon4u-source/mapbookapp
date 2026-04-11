'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const helpTexts = {
  EN: {
    title: 'Help Centre',
    subtitle: 'Support, answers and useful guides',
    heroTitle: 'We are here to help',
    heroSub: 'Find answers, open guides and contact support in one place',
    searchPlaceholder: 'Search questions',
    popular: 'Popular questions',
    question1: 'How does booking work?',
    question2: 'Why is the exact address hidden?',
    question3: 'How does the £5 unlock work?',
    question4: 'How do refunds work?',
    question5: 'How does invite friends work?',
    contact: 'Contact support',
    contactSub: 'Write to support if you need help',
    articles: 'Help articles',
    articlesSub: 'Instructions and useful guides',
    fastReply: 'We reply quickly',
    fastReplySub: 'Average reply time — about 2 hours',
    faq: 'FAQ',
    open: 'Open',
    secure: 'Safe support',
    secureSub: 'Your requests are handled securely',
    found: 'Found',
    results: 'results',
    noResults: 'No questions found',
    noResultsSub: 'Try another keyword or contact support directly',
    supportCard: 'Support access',
    supportCardSub: 'Fast help for bookings, payments and account issues',
    browseGuides: 'Browse guides',
    browseGuidesSub: 'Open instructions for bookings, refunds and safety',
  },
  ES: {
    title: 'Centro de ayuda',
    subtitle: 'Soporte, respuestas y guías útiles',
    heroTitle: 'Estamos aquí para ayudarte',
    heroSub: 'Encuentra respuestas, abre guías y contacta soporte en un solo lugar',
    searchPlaceholder: 'Buscar preguntas',
    popular: 'Preguntas populares',
    question1: '¿Cómo funciona la reserva?',
    question2: '¿Por qué la dirección exacta está oculta?',
    question3: '¿Cómo funciona el unlock de £5?',
    question4: '¿Cómo funcionan los reembolsos?',
    question5: '¿Cómo funciona invitar amigos?',
    contact: 'Contactar soporte',
    contactSub: 'Escribe al soporte si necesitas ayuda',
    articles: 'Artículos de ayuda',
    articlesSub: 'Instrucciones y guías útiles',
    fastReply: 'Respondemos rápido',
    fastReplySub: 'Tiempo medio de respuesta — alrededor de 2 horas',
    faq: 'FAQ',
    open: 'Abrir',
    secure: 'Soporte seguro',
    secureSub: 'Tus solicitudes se gestionan de forma segura',
    found: 'Encontrado',
    results: 'resultados',
    noResults: 'No se encontraron preguntas',
    noResultsSub: 'Prueba otra palabra o contacta soporte directamente',
    supportCard: 'Acceso a soporte',
    supportCardSub: 'Ayuda rápida para reservas, pagos y cuenta',
    browseGuides: 'Explorar guías',
    browseGuidesSub: 'Abre instrucciones sobre reservas, reembolsos y seguridad',
  },
  RU: {
    title: 'Центр помощи',
    subtitle: 'Поддержка, ответы и полезные инструкции',
    heroTitle: 'Мы рядом, если нужна помощь',
    heroSub: 'Найдите ответы, откройте гайды и свяжитесь с поддержкой в одном месте',
    searchPlaceholder: 'Поиск по вопросам',
    popular: 'Популярные вопросы',
    question1: 'Как работает бронирование?',
    question2: 'Почему точный адрес скрыт?',
    question3: 'Как работает £5 unlock?',
    question4: 'Как работают возвраты?',
    question5: 'Как работает приглашение друзей?',
    contact: 'Связаться с поддержкой',
    contactSub: 'Напишите в поддержку, если нужна помощь',
    articles: 'Справочные статьи',
    articlesSub: 'Инструкции и полезные гайды',
    fastReply: 'Мы отвечаем быстро',
    fastReplySub: 'Среднее время ответа — около 2 часов',
    faq: 'FAQ',
    open: 'Открыть',
    secure: 'Безопасная поддержка',
    secureSub: 'Ваши обращения обрабатываются безопасно',
    found: 'Найдено',
    results: 'результатов',
    noResults: 'Вопросы не найдены',
    noResultsSub: 'Попробуйте другое слово или сразу напишите в поддержку',
    supportCard: 'Доступ к поддержке',
    supportCardSub: 'Быстрая помощь по бронированиям, оплатам и аккаунту',
    browseGuides: 'Открыть гайды',
    browseGuidesSub: 'Инструкции по бронированиям, возвратам и безопасности',
  },
  CZ: {
    title: 'Centrum pomoci',
    subtitle: 'Podpora, odpovědi a užitečné návody',
    heroTitle: 'Jsme tu, abychom pomohli',
    heroSub: 'Najděte odpovědi, otevřete návody a kontaktujte podporu na jednom místě',
    searchPlaceholder: 'Hledat otázky',
    popular: 'Populární otázky',
    question1: 'Jak funguje rezervace?',
    question2: 'Proč je přesná adresa skrytá?',
    question3: 'Jak funguje £5 unlock?',
    question4: 'Jak fungují refundy?',
    question5: 'Jak funguje pozvání přátel?',
    contact: 'Kontaktovat podporu',
    contactSub: 'Napište podpoře, pokud potřebujete pomoc',
    articles: 'Nápověda',
    articlesSub: 'Pokyny a užitečné návody',
    fastReply: 'Odpovídáme rychle',
    fastReplySub: 'Průměrná doba odpovědi — asi 2 hodiny',
    faq: 'FAQ',
    open: 'Otevřít',
    secure: 'Bezpečná podpora',
    secureSub: 'Vaše požadavky jsou řešeny bezpečně',
    found: 'Nalezeno',
    results: 'výsledků',
    noResults: 'Žádné otázky nenalezeny',
    noResultsSub: 'Zkuste jiné slovo nebo kontaktujte podporu',
    supportCard: 'Přístup k podpoře',
    supportCardSub: 'Rychlá pomoc s rezervacemi, platbami a účtem',
    browseGuides: 'Otevřít návody',
    browseGuidesSub: 'Pokyny k rezervacím, refundům a bezpečnosti',
  },
  DE: {
    title: 'Hilfezentrum',
    subtitle: 'Support, Antworten und nützliche Guides',
    heroTitle: 'Wir sind da, um zu helfen',
    heroSub: 'Finde Antworten, öffne Guides und kontaktiere den Support an einem Ort',
    searchPlaceholder: 'Fragen suchen',
    popular: 'Beliebte Fragen',
    question1: 'Wie funktioniert die Buchung?',
    question2: 'Warum ist die genaue Adresse verborgen?',
    question3: 'Wie funktioniert der £5 Unlock?',
    question4: 'Wie funktionieren Rückerstattungen?',
    question5: 'Wie funktioniert Freunde einladen?',
    contact: 'Support kontaktieren',
    contactSub: 'Schreibe dem Support, wenn du Hilfe brauchst',
    articles: 'Hilfecenter',
    articlesSub: 'Anleitungen und nützliche Guides',
    fastReply: 'Wir antworten schnell',
    fastReplySub: 'Durchschnittliche Antwortzeit — etwa 2 Stunden',
    faq: 'FAQ',
    open: 'Öffnen',
    secure: 'Sicherer Support',
    secureSub: 'Deine Anfragen werden sicher bearbeitet',
    found: 'Gefunden',
    results: 'Ergebnisse',
    noResults: 'Keine Fragen gefunden',
    noResultsSub: 'Versuche ein anderes Wort oder kontaktiere direkt den Support',
    supportCard: 'Support-Zugang',
    supportCardSub: 'Schnelle Hilfe bei Buchungen, Zahlungen und Konto',
    browseGuides: 'Guides öffnen',
    browseGuidesSub: 'Anleitungen zu Buchungen, Rückerstattungen und Sicherheit',
  },
  PL: {
    title: 'Centrum pomocy',
    subtitle: 'Wsparcie, odpowiedzi i przydatne poradniki',
    heroTitle: 'Jesteśmy tutaj, aby pomóc',
    heroSub: 'Znajdź odpowiedzi, otwórz poradniki i skontaktuj się ze wsparciem w jednym miejscu',
    searchPlaceholder: 'Szukaj pytań',
    popular: 'Popularne pytania',
    question1: 'Jak działa rezerwacja?',
    question2: 'Dlaczego dokładny adres jest ukryty?',
    question3: 'Jak działa unlock £5?',
    question4: 'Jak działają zwroty?',
    question5: 'Jak działa zapraszanie znajomych?',
    contact: 'Skontaktuj się z pomocą',
    contactSub: 'Napisz do wsparcia, jeśli potrzebujesz pomocy',
    articles: 'Centrum artykułów',
    articlesSub: 'Instrukcje i przydatne poradniki',
    fastReply: 'Odpowiadamy szybko',
    fastReplySub: 'Średni czas odpowiedzi — około 2 godziny',
    faq: 'FAQ',
    open: 'Otwórz',
    secure: 'Bezpieczne wsparcie',
    secureSub: 'Twoje zgłoszenia są obsługiwane bezpiecznie',
    found: 'Znaleziono',
    results: 'wyników',
    noResults: 'Nie znaleziono pytań',
    noResultsSub: 'Spróbuj innego słowa lub napisz do wsparcia',
    supportCard: 'Dostęp do wsparcia',
    supportCardSub: 'Szybka pomoc w sprawie rezerwacji, płatności i konta',
    browseGuides: 'Otwórz poradniki',
    browseGuidesSub: 'Instrukcje dotyczące rezerwacji, zwrotów i bezpieczeństwa',
  },
} as const;

function getQuestionAccent(index: number) {
  const accents = [
    { bg: '#eef4ff', color: '#2f7cf6', icon: '📅' },
    { bg: '#fff5e8', color: '#d68612', icon: '📍' },
    { bg: '#fff1f7', color: '#ff4fa0', icon: '💳' },
    { bg: '#eef9f1', color: '#2fa35a', icon: '↩️' },
    { bg: '#f3efff', color: '#7a5af8', icon: '🎁' },
  ];

  return accents[index % accents.length];
}

export default function HelpPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [search, setSearch] = useState('');

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
    () => helpTexts[language as keyof typeof helpTexts] || helpTexts.EN,
    [language]
  );

  const questions = [
    text.question1,
    text.question2,
    text.question3,
    text.question4,
    text.question5,
  ];

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter((question) => question.toLowerCase().includes(q));
  }, [questions, search]);

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
              💬
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
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 18,
                background: '#fff1f7',
                color: '#ff4fa0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              🔎
            </div>

            <div style={{ flex: 1 }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={text.searchPlaceholder}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 20,
                  border: '1px solid #efe4d7',
                  background: '#fff',
                  padding: '0 16px',
                  fontSize: 15,
                  color: '#17130f',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              padding: '10px 14px',
              background: '#eef9f1',
              color: '#2fa35a',
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            <span>🛡️</span>
            <span>{text.secure}</span>
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
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#17130f',
              }}
            >
              {text.popular}
            </div>

            <div
              style={{
                borderRadius: 999,
                padding: '8px 12px',
                background: '#f4efe8',
                color: '#6d6258',
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {text.found}: {filteredQuestions.length} {text.results}
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div
              style={{
                borderRadius: 24,
                background: '#fcfaf6',
                border: '1px solid #f1e8dc',
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 12px',
                  borderRadius: 18,
                  background: '#f4efe8',
                  color: '#6d6258',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                ?
              </div>

              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.noResults}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.noResultsSub}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredQuestions.map((question, index) => {
                const accent = getQuestionAccent(index);

                return (
                  <button
                    key={question}
                    type="button"
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '44px 1fr auto',
                      gap: 14,
                      alignItems: 'center',
                      border: '1px solid #f1e8dc',
                      borderRadius: 24,
                      background: '#fff',
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 16,
                        background: accent.bg,
                        color: accent.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      {accent.icon}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.45,
                        fontWeight: 900,
                        color: '#17130f',
                      }}
                    >
                      {question}
                    </div>

                    <span
                      style={{
                        fontSize: 18,
                        color: '#938475',
                        fontWeight: 900,
                      }}
                    >
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gap: 12,
          }}
        >
          <button
            type="button"
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 30,
              background: '#fff',
              padding: 18,
              textAlign: 'left',
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: '#eef4ff',
                  color: '#2f7cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ✉️
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.contact}
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
                  {text.contactSub}
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
            </div>
          </button>

          <button
            type="button"
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 30,
              background: '#fff',
              padding: 18,
              textAlign: 'left',
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: '#fff5e8',
                  color: '#d68612',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                📚
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.articles}
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
                  {text.articlesSub}
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
            </div>
          </button>

          <div
            style={{
              border: '1px solid #dcefdc',
              borderRadius: 30,
              background: 'linear-gradient(180deg, #f3fbf3 0%, #eef9f1 100%)',
              padding: 18,
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.04)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: '#e3f5e6',
                  color: '#2fa35a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ⚡
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.fastReply}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#56705e',
                    fontWeight: 700,
                  }}
                >
                  {text.fastReplySub}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 10,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  background: '#fff',
                  padding: '12px 14px',
                  fontSize: 13,
                  color: '#2fa35a',
                  fontWeight: 900,
                }}
              >
                {text.secure}
              </div>

              <div
                style={{
                  borderRadius: 18,
                  background: '#fff',
                  padding: '12px 14px',
                  fontSize: 13,
                  color: '#56705e',
                  fontWeight: 700,
                  lineHeight: 1.45,
                }}
              >
                {text.secureSub}
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 30,
              background: '#fff',
              padding: 18,
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: '#f3efff',
                  color: '#7a5af8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                🧭
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.supportCard}
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
                  {text.supportCardSub}
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
            </div>
          </div>

          <div
            style={{
              border: '1px solid #efe4d7',
              borderRadius: 30,
              background: '#fff',
              padding: 18,
              boxShadow: '0 12px 28px rgba(44, 23, 10, 0.05)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '46px 1fr auto',
                gap: 14,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: '#fff1f7',
                  color: '#ff4fa0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                📘
              </div>

              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#17130f',
                  }}
                >
                  {text.browseGuides}
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
                  {text.browseGuidesSub}
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
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
