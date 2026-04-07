'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

const helpTexts = {
  EN: {
    title: 'Help Centre',
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
  },
  ES: {
    title: 'Centro de ayuda',
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
  },
  RU: {
    title: 'Центр помощи',
    searchPlaceholder: 'Поиск по вопросам',
    popular: 'Популярные вопросы',
    question1: 'Как работает бронирование?',
    question2: 'Почему точный адрес скрыт?',
    question3: 'Как работает £5 unlock?',
    question4: 'Как работают возвраты?',
    question5: 'Как работает приглашение друзей?',
    contact: 'Связаться с нами',
    contactSub: 'Напишите в поддержку, если нужна помощь',
    articles: 'Справочный центр',
    articlesSub: 'Инструкции и полезные гайды',
    fastReply: 'Мы отвечаем быстро',
    fastReplySub: 'Среднее время ответа — около 2 часов',
  },
  CZ: {
    title: 'Centrum pomoci',
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
  },
  DE: {
    title: 'Hilfezentrum',
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
  },
  PL: {
    title: 'Centrum pomocy',
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
  },
} as const;

export default function HelpPage() {
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

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <input
            placeholder={text.searchPlaceholder}
            className="w-full rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-sm text-[#1d1712] outline-none"
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
          <div className="text-base font-extrabold text-[#1d1712]">{text.popular}</div>

          <div className="mt-4 space-y-3">
            {questions.map((question) => (
              <button
                key={question}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-[#efe4d7] bg-[#fffdf9] px-4 py-3 text-left"
              >
                <span className="text-sm font-bold text-[#1d1712]">{question}</span>
                <span className="text-base text-[#8c7d70]">›</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
            <div className="text-base font-extrabold text-[#1d1712]">{text.contact}</div>
            <div className="mt-2 text-sm leading-6 text-[#6f6458]">{text.contactSub}</div>
          </div>

          <div className="rounded-[28px] border border-[#efe4d7] bg-white p-4 shadow-sm">
            <div className="text-base font-extrabold text-[#1d1712]">{text.articles}</div>
            <div className="mt-2 text-sm leading-6 text-[#6f6458]">{text.articlesSub}</div>
          </div>

          <div className="rounded-[28px] border border-[#dcefdc] bg-[#f3fbf3] p-4 shadow-sm">
            <div className="text-base font-extrabold text-[#1d1712]">{text.fastReply}</div>
            <div className="mt-2 text-sm leading-6 text-[#56705e]">{text.fastReplySub}</div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
