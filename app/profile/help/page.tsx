'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const helpTexts = {
  EN: {
    title: 'Help Centre',
    subtitle: 'Support, answers and useful guides',
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
  },
  ES: {
    title: 'Centro de ayuda',
    subtitle: 'Soporte, respuestas y guías útiles',
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
    fastReplySub: 'Tiempo medio de respuesta — около 2 horas',
    faq: 'FAQ',
    open: 'Abrir',
    secure: 'Soporte seguro',
    secureSub: 'Tus solicitudes se gestionan de forma segura',
  },
  RU: {
    title: 'Центр помощи',
    subtitle: 'Поддержка, ответы и полезные инструкции',
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
  },
  CZ: {
    title: 'Centrum pomoci',
    subtitle: 'Podpora, odpovědi a užitečné návody',
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
  },
  DE: {
    title: 'Hilfezentrum',
    subtitle: 'Support, Antworten und nützliche Guides',
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
  },
  PL: {
    title: 'Centrum pomocy',
    subtitle: 'Wsparcie, odpowiedzi i przydatne poradniki',
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
              }}
            >
              🔎
            </div>

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#17130f',
                }}
              >
                {text.faq}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 13,
                  color: '#7b7268',
                  fontWeight: 700,
                }}
              >
                {text.popular}
              </div>
            </div>
          </div>

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
            }}
          />
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
            {text.popular}
          </div>

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
                marginTop: 8,
                fontSize: 13,
                lineHeight: 1.45,
                color: '#56705e',
                fontWeight: 700,
              }}
            >
              {text.secureSub}
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
