'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type HelpTextShape = {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  popular: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  contact: string;
  contactSub: string;
  articles: string;
  articlesSub: string;
  fastReply: string;
  fastReplySub: string;
  faq: string;
  open: string;
  secure: string;
  secureSub: string;
  found: string;
  results: string;
  noResults: string;
  noResultsSub: string;
  supportCard: string;
  supportCardSub: string;
  browseGuides: string;
  browseGuidesSub: string;
  bookingsHelp: string;
  paymentsHelp: string;
  safetyHelp: string;
  reportProblem: string;
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

const helpTexts: Record<AppLanguage, HelpTextShape> = {
  EN: {
    title: 'Help Centre',
    subtitle: 'Support, answers and useful guides',
    heroTitle: 'We are here to help',
    heroSub: 'Find answers, open guides and contact support in one place.',
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
    secureSub: 'Your requests are handled securely inside Olamep.',
    found: 'Found',
    results: 'results',
    noResults: 'No questions found',
    noResultsSub: 'Try another keyword or contact support directly',
    supportCard: 'Support access',
    supportCardSub: 'Fast help for bookings, payments and account issues',
    browseGuides: 'Browse guides',
    browseGuidesSub: 'Open instructions for bookings, refunds and safety',
    bookingsHelp: 'Bookings help',
    paymentsHelp: 'Payments help',
    safetyHelp: 'Safety help',
    reportProblem: 'Report problem',
  },
  RU: {
    title: 'Центр помощи',
    subtitle: 'Поддержка, ответы и полезные инструкции',
    heroTitle: 'Мы рядом, если нужна помощь',
    heroSub: 'Найдите ответы, откройте гайды и свяжитесь с поддержкой в одном месте.',
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
    secureSub: 'Ваши обращения обрабатываются безопасно внутри Olamep.',
    found: 'Найдено',
    results: 'результатов',
    noResults: 'Вопросы не найдены',
    noResultsSub: 'Попробуйте другое слово или сразу напишите в поддержку',
    supportCard: 'Доступ к поддержке',
    supportCardSub: 'Быстрая помощь по бронированиям, оплатам и аккаунту',
    browseGuides: 'Открыть гайды',
    browseGuidesSub: 'Инструкции по бронированиям, возвратам и безопасности',
    bookingsHelp: 'Помощь с бронями',
    paymentsHelp: 'Помощь с оплатой',
    safetyHelp: 'Безопасность',
    reportProblem: 'Сообщить о проблеме',
  },
  UA: {
    title: 'Центр допомоги',
    subtitle: 'Підтримка, відповіді та корисні інструкції',
    heroTitle: 'Ми поруч, якщо потрібна допомога',
    heroSub: 'Знайдіть відповіді, відкрийте гайди і зв’яжіться з підтримкою в одному місці.',
    searchPlaceholder: 'Пошук питань',
    popular: 'Популярні питання',
    question1: 'Як працює бронювання?',
    question2: 'Чому точна адреса прихована?',
    question3: 'Як працює £5 unlock?',
    question4: 'Як працюють повернення?',
    question5: 'Як працює запрошення друзів?',
    contact: 'Зв’язатися з підтримкою',
    contactSub: 'Напишіть у підтримку, якщо потрібна допомога',
    articles: 'Довідкові статті',
    articlesSub: 'Інструкції та корисні гайди',
    fastReply: 'Ми відповідаємо швидко',
    fastReplySub: 'Середній час відповіді — близько 2 годин',
    faq: 'FAQ',
    open: 'Відкрити',
    secure: 'Безпечна підтримка',
    secureSub: 'Ваші звернення обробляються безпечно всередині Olamep.',
    found: 'Знайдено',
    results: 'результатів',
    noResults: 'Питання не знайдено',
    noResultsSub: 'Спробуйте інше слово або напишіть у підтримку',
    supportCard: 'Доступ до підтримки',
    supportCardSub: 'Швидка допомога з бронюваннями, оплатами та акаунтом',
    browseGuides: 'Відкрити гайди',
    browseGuidesSub: 'Інструкції з бронювань, повернень і безпеки',
    bookingsHelp: 'Допомога з бронями',
    paymentsHelp: 'Допомога з оплатою',
    safetyHelp: 'Безпека',
    reportProblem: 'Повідомити про проблему',
  },
  ES: {
    title: 'Centro de ayuda',
    subtitle: 'Soporte, respuestas y guías útiles',
    heroTitle: 'Estamos aquí para ayudarte',
    heroSub: 'Encuentra respuestas, abre guías y contacta soporte en un solo lugar.',
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
    secureSub: 'Tus solicitudes se gestionan de forma segura dentro de Olamep.',
    found: 'Encontrado',
    results: 'resultados',
    noResults: 'No se encontraron preguntas',
    noResultsSub: 'Prueba otra palabra o contacta soporte directamente',
    supportCard: 'Acceso a soporte',
    supportCardSub: 'Ayuda rápida para reservas, pagos y cuenta',
    browseGuides: 'Explorar guías',
    browseGuidesSub: 'Abre instrucciones sobre reservas, reembolsos y seguridad',
    bookingsHelp: 'Ayuda reservas',
    paymentsHelp: 'Ayuda pagos',
    safetyHelp: 'Seguridad',
    reportProblem: 'Reportar problema',
  },
  CZ: {
    title: 'Centrum pomoci',
    subtitle: 'Podpora, odpovědi a užitečné návody',
    heroTitle: 'Jsme tu, abychom pomohli',
    heroSub: 'Najděte odpovědi, otevřete návody a kontaktujte podporu na jednom místě.',
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
    secureSub: 'Vaše požadavky jsou řešeny bezpečně v Olamep.',
    found: 'Nalezeno',
    results: 'výsledků',
    noResults: 'Žádné otázky nenalezeny',
    noResultsSub: 'Zkuste jiné slovo nebo kontaktujte podporu',
    supportCard: 'Přístup k podpoře',
    supportCardSub: 'Rychlá pomoc s rezervacemi, platbami a účtem',
    browseGuides: 'Otevřít návody',
    browseGuidesSub: 'Pokyny k rezervacím, refundům a bezpečnosti',
    bookingsHelp: 'Pomoc rezervace',
    paymentsHelp: 'Pomoc platby',
    safetyHelp: 'Bezpečnost',
    reportProblem: 'Nahlásit problém',
  },
  DE: {
    title: 'Hilfezentrum',
    subtitle: 'Support, Antworten und nützliche Guides',
    heroTitle: 'Wir sind da, um zu helfen',
    heroSub: 'Finde Antworten, öffne Guides und kontaktiere den Support an einem Ort.',
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
    secureSub: 'Deine Anfragen werden sicher in Olamep bearbeitet.',
    found: 'Gefunden',
    results: 'Ergebnisse',
    noResults: 'Keine Fragen gefunden',
    noResultsSub: 'Versuche ein anderes Wort oder kontaktiere direkt den Support',
    supportCard: 'Support-Zugang',
    supportCardSub: 'Schnelle Hilfe bei Buchungen, Zahlungen und Konto',
    browseGuides: 'Guides öffnen',
    browseGuidesSub: 'Anleitungen zu Buchungen, Rückerstattungen und Sicherheit',
    bookingsHelp: 'Buchungshilfe',
    paymentsHelp: 'Zahlungshilfe',
    safetyHelp: 'Sicherheit',
    reportProblem: 'Problem melden',
  },
  IT: {
    title: 'Centro assistenza',
    subtitle: 'Supporto, risposte e guide utili',
    heroTitle: 'Siamo qui per aiutarti',
    heroSub: 'Trova risposte, apri guide e contatta il supporto in un posto.',
    searchPlaceholder: 'Cerca domande',
    popular: 'Domande popolari',
    question1: 'Come funziona la prenotazione?',
    question2: 'Perché l’indirizzo esatto è nascosto?',
    question3: 'Come funziona lo sblocco da £5?',
    question4: 'Come funzionano i rimborsi?',
    question5: 'Come funziona invita amici?',
    contact: 'Contatta supporto',
    contactSub: 'Scrivi al supporto se hai bisogno di aiuto',
    articles: 'Articoli di aiuto',
    articlesSub: 'Istruzioni e guide utili',
    fastReply: 'Rispondiamo velocemente',
    fastReplySub: 'Tempo medio di risposta — circa 2 ore',
    faq: 'FAQ',
    open: 'Apri',
    secure: 'Supporto sicuro',
    secureSub: 'Le richieste sono gestite in sicurezza dentro Olamep.',
    found: 'Trovati',
    results: 'risultati',
    noResults: 'Nessuna domanda trovata',
    noResultsSub: 'Prova un’altra parola o contatta il supporto',
    supportCard: 'Accesso supporto',
    supportCardSub: 'Aiuto rapido per prenotazioni, pagamenti e account',
    browseGuides: 'Apri guide',
    browseGuidesSub: 'Istruzioni su prenotazioni, rimborsi e sicurezza',
    bookingsHelp: 'Aiuto prenotazioni',
    paymentsHelp: 'Aiuto pagamenti',
    safetyHelp: 'Sicurezza',
    reportProblem: 'Segnala problema',
  },
  FR: {
    title: 'Centre d’aide',
    subtitle: 'Support, réponses et guides utiles',
    heroTitle: 'Nous sommes là pour aider',
    heroSub: 'Trouvez des réponses, ouvrez des guides et contactez le support au même endroit.',
    searchPlaceholder: 'Rechercher questions',
    popular: 'Questions populaires',
    question1: 'Comment fonctionne la réservation ?',
    question2: 'Pourquoi l’adresse exacte est cachée ?',
    question3: 'Comment fonctionne le unlock £5 ?',
    question4: 'Comment fonctionnent les remboursements ?',
    question5: 'Comment inviter des amis ?',
    contact: 'Contacter support',
    contactSub: 'Écrivez au support si vous avez besoin d’aide',
    articles: 'Articles d’aide',
    articlesSub: 'Instructions et guides utiles',
    fastReply: 'Nous répondons vite',
    fastReplySub: 'Temps moyen de réponse — environ 2 heures',
    faq: 'FAQ',
    open: 'Ouvrir',
    secure: 'Support sécurisé',
    secureSub: 'Vos demandes sont traitées en sécurité dans Olamep.',
    found: 'Trouvé',
    results: 'résultats',
    noResults: 'Aucune question trouvée',
    noResultsSub: 'Essayez un autre mot ou contactez le support',
    supportCard: 'Accès support',
    supportCardSub: 'Aide rapide pour réservations, paiements et compte',
    browseGuides: 'Ouvrir guides',
    browseGuidesSub: 'Instructions pour réservations, remboursements et sécurité',
    bookingsHelp: 'Aide réservations',
    paymentsHelp: 'Aide paiements',
    safetyHelp: 'Sécurité',
    reportProblem: 'Signaler problème',
  },
  PL: {
    title: 'Centrum pomocy',
    subtitle: 'Wsparcie, odpowiedzi i przydatne poradniki',
    heroTitle: 'Jesteśmy tutaj, aby pomóc',
    heroSub: 'Znajdź odpowiedzi, otwórz poradniki i skontaktuj się ze wsparciem w jednym miejscu.',
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
    secureSub: 'Twoje zgłoszenia są obsługiwane bezpiecznie w Olamep.',
    found: 'Znaleziono',
    results: 'wyników',
    noResults: 'Nie znaleziono pytań',
    noResultsSub: 'Spróbuj innego słowa lub napisz do wsparcia',
    supportCard: 'Dostęp do wsparcia',
    supportCardSub: 'Szybka pomoc w sprawie rezerwacji, płatności i konta',
    browseGuides: 'Otwórz poradniki',
    browseGuidesSub: 'Instrukcje dotyczące rezerwacji, zwrotów i bezpieczeństwa',
    bookingsHelp: 'Pomoc rezerwacje',
    paymentsHelp: 'Pomoc płatności',
    safetyHelp: 'Bezpieczeństwo',
    reportProblem: 'Zgłoś problem',
  },
  AR: {
    title: 'مركز المساعدة',
    subtitle: 'الدعم والإجابات والأدلة المفيدة',
    heroTitle: 'نحن هنا للمساعدة',
    heroSub: 'ابحث عن الإجابات وافتح الأدلة وتواصل مع الدعم في مكان واحد.',
    searchPlaceholder: 'ابحث عن الأسئلة',
    popular: 'أسئلة شائعة',
    question1: 'كيف يعمل الحجز؟',
    question2: 'لماذا العنوان الدقيق مخفي؟',
    question3: 'كيف يعمل فتح £5؟',
    question4: 'كيف تعمل المبالغ المستردة؟',
    question5: 'كيف تعمل دعوة الأصدقاء؟',
    contact: 'تواصل مع الدعم',
    contactSub: 'اكتب للدعم إذا كنت بحاجة للمساعدة',
    articles: 'مقالات المساعدة',
    articlesSub: 'تعليمات وأدلة مفيدة',
    fastReply: 'نرد بسرعة',
    fastReplySub: 'متوسط وقت الرد — حوالي ساعتين',
    faq: 'FAQ',
    open: 'فتح',
    secure: 'دعم آمن',
    secureSub: 'تتم معالجة طلباتك بأمان داخل Olamep.',
    found: 'تم العثور',
    results: 'نتائج',
    noResults: 'لم يتم العثور على أسئلة',
    noResultsSub: 'جرب كلمة أخرى أو تواصل مع الدعم مباشرة',
    supportCard: 'الوصول للدعم',
    supportCardSub: 'مساعدة سريعة للحجوزات والمدفوعات والحساب',
    browseGuides: 'فتح الأدلة',
    browseGuidesSub: 'تعليمات للحجوزات والاسترداد والأمان',
    bookingsHelp: 'مساعدة الحجوزات',
    paymentsHelp: 'مساعدة المدفوعات',
    safetyHelp: 'الأمان',
    reportProblem: 'الإبلاغ عن مشكلة',
  },
};

function getText(language: AppLanguage) {
  return helpTexts[language] || helpTexts.EN;
}

function getQuestionAccent(index: number) {
  const accents = [
    { bg: BRAND.softBlue, color: BRAND.blue, icon: '📅' },
    { bg: BRAND.softOrange, color: '#b47b00', icon: '📍' },
    { bg: BRAND.softPink, color: BRAND.pink, icon: '💳' },
    { bg: BRAND.softGreen, color: '#11883d', icon: '↩️' },
    { bg: BRAND.softViolet, color: '#7254df', icon: '🎁' },
  ];

  return accents[index % accents.length];
}

export default function HelpPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [search, setSearch] = useState('');

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

  const quickCards = [
    {
      id: 'support',
      title: text.contact,
      subtitle: text.contactSub,
      icon: '✉️',
      bg: BRAND.softBlue,
      color: BRAND.blue,
    },
    {
      id: 'articles',
      title: text.articles,
      subtitle: text.articlesSub,
      icon: '📚',
      bg: BRAND.softOrange,
      color: '#b47b00',
    },
    {
      id: 'bookings',
      title: text.bookingsHelp,
      subtitle: text.browseGuidesSub,
      icon: '📅',
      bg: BRAND.softGreen,
      color: '#11883d',
    },
    {
      id: 'payments',
      title: text.paymentsHelp,
      subtitle: text.supportCardSub,
      icon: '💳',
      bg: BRAND.softPink,
      color: BRAND.pink,
    },
    {
      id: 'safety',
      title: text.safetyHelp,
      subtitle: text.secureSub,
      icon: '🛡️',
      bg: BRAND.softViolet,
      color: '#7254df',
    },
    {
      id: 'report',
      title: text.reportProblem,
      subtitle: text.supportCardSub,
      icon: '⚠️',
      bg: BRAND.softOrange,
      color: '#b47b00',
    },
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
                fontSize: 30,
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
                background: BRAND.softPink,
                color: BRAND.pink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 31,
              }}
            >
              💬
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
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#ffffff',
              border: `2.5px solid ${BRAND.border}`,
              borderRadius: 20,
              padding: '12px 13px',
            }}
          >
            <span style={{ fontSize: 24, lineHeight: 1 }}>🔎</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={text.searchPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 15,
                fontWeight: 900,
                color: BRAND.navy,
                minWidth: 0,
              }}
            />
          </div>

          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 9,
            }}
          >
            <div
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softGreen,
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: '#11883d' }}>
                🛡️ {text.secure}
              </div>
            </div>

            <div
              style={{
                minHeight: 58,
                borderRadius: 18,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: BRAND.blue }}>
                ⚡ {text.fastReply}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 25,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-0.7px',
                color: BRAND.navy,
              }}
            >
              {text.popular}
            </h2>

            <span
              style={{
                minHeight: 34,
                padding: '0 10px',
                borderRadius: 999,
                background: '#f2f4f7',
                color: BRAND.muted,
                border: `2px solid ${BRAND.border}`,
                fontSize: 11,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {text.found}: {filteredQuestions.length}
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div
              style={{
                borderRadius: 26,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 38 }}>?</div>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>{text.noResults}</div>
              <p
                style={{
                  margin: '7px auto 0',
                  maxWidth: 260,
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.noResultsSub}
              </p>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 26,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
              }}
            >
              {filteredQuestions.map((question, index) => {
                const accent = getQuestionAccent(index);

                return (
                  <button
                    key={question}
                    type="button"
                    style={{
                      width: '100%',
                      minHeight: 82,
                      display: 'grid',
                      gridTemplateColumns: '58px minmax(0, 1fr) auto',
                      gap: 12,
                      alignItems: 'center',
                      border: 'none',
                      borderTop: index === 0 ? 'none' : `2px solid ${BRAND.border}`,
                      background: '#ffffff',
                      padding: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 18,
                        background: accent.bg,
                        color: accent.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 27,
                        border: `2.5px solid ${BRAND.border}`,
                      }}
                    >
                      {accent.icon}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.25,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {question}
                    </div>

                    <span
                      style={{
                        fontSize: 28,
                        color: BRAND.border,
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          )}
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
            {text.supportCard}
          </h2>

          <div style={{ display: 'grid', gap: 10 }}>
            {quickCards.map((item) => (
              <button
                key={item.id}
                type="button"
                style={{
                  width: '100%',
                  minHeight: 86,
                  display: 'grid',
                  gridTemplateColumns: '58px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: 13,
                  textAlign: 'left',
                  border: `2.5px solid ${BRAND.border}`,
                  borderRadius: 24,
                  background: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 27,
                    border: `2.5px solid ${BRAND.border}`,
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
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softGreen,
            padding: 15,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>
            ⚡ {text.fastReply}
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
            {text.fastReplySub}
          </p>

          <div
            style={{
              marginTop: 10,
              borderRadius: 18,
              border: `2px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 12,
              fontSize: 13,
              lineHeight: 1.35,
              fontWeight: 900,
              color: '#11883d',
            }}
          >
            🛡️ {text.secureSub}
          </div>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
