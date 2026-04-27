'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type PriceTextShape = {
  title: string;
  subtitle: string;
  addService: string;
  edit: string;
  active: string;
  draft: string;
  popular: string;
  priceList: string;
  services: string;
  packages: string;
  discounts: string;
  duration: string;
  deposit: string;
  from: string;
  comingSoon: string;
  comingSoonHint: string;
};

type PriceItem = {
  id: string;
  title: string;
  category: string;
  price: string;
  duration: string;
  deposit: string;
  status: 'active' | 'draft';
  badge?: 'popular';
  icon: string;
  bg: string;
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

const priceTexts: Record<AppLanguage, PriceTextShape> = {
  EN: {
    title: 'Price list',
    subtitle: 'Manage your services, prices, deposits and packages',
    addService: 'Add service',
    edit: 'Edit',
    active: 'Active',
    draft: 'Draft',
    popular: 'Popular',
    priceList: 'Price list',
    services: 'Services',
    packages: 'Packages',
    discounts: 'Discounts',
    duration: 'Duration',
    deposit: 'Deposit',
    from: 'from',
    comingSoon: 'Smart pricing coming soon',
    comingSoonHint: 'Olamep will help suggest prices based on category, area and demand.',
  },
  RU: {
    title: 'Прайс-лист',
    subtitle: 'Управляйте услугами, ценами, депозитами и пакетами',
    addService: 'Добавить услугу',
    edit: 'Изменить',
    active: 'Активно',
    draft: 'Черновик',
    popular: 'Популярно',
    priceList: 'Прайс-лист',
    services: 'Услуги',
    packages: 'Пакеты',
    discounts: 'Скидки',
    duration: 'Время',
    deposit: 'Депозит',
    from: 'от',
    comingSoon: 'Умные цены скоро',
    comingSoonHint: 'Olamep будет подсказывать цены по категории, району и спросу.',
  },
  UA: {
    title: 'Прайс-лист',
    subtitle: 'Керуйте послугами, цінами, депозитами та пакетами',
    addService: 'Додати послугу',
    edit: 'Змінити',
    active: 'Активно',
    draft: 'Чернетка',
    popular: 'Популярно',
    priceList: 'Прайс-лист',
    services: 'Послуги',
    packages: 'Пакети',
    discounts: 'Знижки',
    duration: 'Час',
    deposit: 'Депозит',
    from: 'від',
    comingSoon: 'Розумні ціни скоро',
    comingSoonHint: 'Olamep буде підказувати ціни за категорією, районом і попитом.',
  },
  ES: {
    title: 'Lista de precios',
    subtitle: 'Gestiona servicios, precios, depósitos y paquetes',
    addService: 'Añadir servicio',
    edit: 'Editar',
    active: 'Activo',
    draft: 'Borrador',
    popular: 'Popular',
    priceList: 'Lista de precios',
    services: 'Servicios',
    packages: 'Paquetes',
    discounts: 'Descuentos',
    duration: 'Duración',
    deposit: 'Depósito',
    from: 'desde',
    comingSoon: 'Precios inteligentes pronto',
    comingSoonHint: 'Olamep sugerirá precios según categoría, zona y demanda.',
  },
  CZ: {
    title: 'Ceník',
    subtitle: 'Spravujte služby, ceny, zálohy a balíčky',
    addService: 'Přidat službu',
    edit: 'Upravit',
    active: 'Aktivní',
    draft: 'Koncept',
    popular: 'Populární',
    priceList: 'Ceník',
    services: 'Služby',
    packages: 'Balíčky',
    discounts: 'Slevy',
    duration: 'Délka',
    deposit: 'Záloha',
    from: 'od',
    comingSoon: 'Chytré ceny již brzy',
    comingSoonHint: 'Olamep bude navrhovat ceny podle kategorie, oblasti a poptávky.',
  },
  DE: {
    title: 'Preisliste',
    subtitle: 'Services, Preise, Anzahlungen und Pakete verwalten',
    addService: 'Service hinzufügen',
    edit: 'Bearbeiten',
    active: 'Aktiv',
    draft: 'Entwurf',
    popular: 'Beliebt',
    priceList: 'Preisliste',
    services: 'Services',
    packages: 'Pakete',
    discounts: 'Rabatte',
    duration: 'Dauer',
    deposit: 'Anzahlung',
    from: 'ab',
    comingSoon: 'Smarte Preise bald',
    comingSoonHint: 'Olamep schlägt Preise nach Kategorie, Gebiet und Nachfrage vor.',
  },
  IT: {
    title: 'Listino prezzi',
    subtitle: 'Gestisci servizi, prezzi, depositi e pacchetti',
    addService: 'Aggiungi servizio',
    edit: 'Modifica',
    active: 'Attivo',
    draft: 'Bozza',
    popular: 'Popolare',
    priceList: 'Listino prezzi',
    services: 'Servizi',
    packages: 'Pacchetti',
    discounts: 'Sconti',
    duration: 'Durata',
    deposit: 'Deposito',
    from: 'da',
    comingSoon: 'Prezzi smart presto',
    comingSoonHint: 'Olamep suggerirà prezzi per categoria, zona e domanda.',
  },
  FR: {
    title: 'Liste de prix',
    subtitle: 'Gérez services, prix, dépôts et forfaits',
    addService: 'Ajouter service',
    edit: 'Modifier',
    active: 'Actif',
    draft: 'Brouillon',
    popular: 'Populaire',
    priceList: 'Liste de prix',
    services: 'Services',
    packages: 'Forfaits',
    discounts: 'Réductions',
    duration: 'Durée',
    deposit: 'Dépôt',
    from: 'dès',
    comingSoon: 'Prix intelligents bientôt',
    comingSoonHint: 'Olamep suggérera des prix selon catégorie, zone et demande.',
  },
  PL: {
    title: 'Cennik',
    subtitle: 'Zarządzaj usługami, cenami, depozytami i pakietami',
    addService: 'Dodaj usługę',
    edit: 'Edytuj',
    active: 'Aktywne',
    draft: 'Szkic',
    popular: 'Popularne',
    priceList: 'Cennik',
    services: 'Usługi',
    packages: 'Pakiety',
    discounts: 'Zniżki',
    duration: 'Czas',
    deposit: 'Depozyt',
    from: 'od',
    comingSoon: 'Inteligentne ceny wkrótce',
    comingSoonHint: 'Olamep zasugeruje ceny według kategorii, obszaru i popytu.',
  },
  AR: {
    title: 'قائمة الأسعار',
    subtitle: 'إدارة الخدمات والأسعار والعربون والباقات',
    addService: 'إضافة خدمة',
    edit: 'تعديل',
    active: 'نشط',
    draft: 'مسودة',
    popular: 'شائع',
    priceList: 'قائمة الأسعار',
    services: 'الخدمات',
    packages: 'الباقات',
    discounts: 'الخصومات',
    duration: 'المدة',
    deposit: 'العربون',
    from: 'من',
    comingSoon: 'تسعير ذكي قريباً',
    comingSoonHint: 'سيقوم Olamep باقتراح الأسعار حسب الفئة والمنطقة والطلب.',
  },
};

function getText(language: AppLanguage) {
  return priceTexts[language] || priceTexts.EN;
}

function SmallIcon({ icon, bg }: { icon: string; bg: string }) {
  return (
    <span
      style={{
        width: 58,
        height: 58,
        borderRadius: 18,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        flexShrink: 0,
      }}
    >
      {icon}
    </span>
  );
}

export default function PriceListPage() {
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

  const priceItems: PriceItem[] = [
    {
      id: 'hair',
      title: 'Hair extensions',
      category: 'Beauty',
      price: '£120',
      duration: '2h 30m',
      deposit: '£25',
      status: 'active',
      badge: 'popular',
      icon: '💇‍♀️',
      bg: BRAND.softPink,
    },
    {
      id: 'massage',
      title: 'Relax massage',
      category: 'Wellness',
      price: '£65',
      duration: '1h',
      deposit: '£10',
      status: 'active',
      icon: '💆‍♀️',
      bg: BRAND.softGreen,
    },
    {
      id: 'makeup',
      title: 'Evening makeup',
      category: 'Beauty',
      price: '£80',
      duration: '1h 20m',
      deposit: '£15',
      status: 'draft',
      icon: '💄',
      bg: BRAND.softOrange,
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
                fontSize: 31,
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
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 9,
            }}
          >
            {[
              { label: text.services, value: '3', bg: '#ffffff' },
              { label: text.packages, value: '2', bg: BRAND.yellow },
              { label: text.discounts, value: '1', bg: BRAND.softPink },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  minHeight: 84,
                  borderRadius: 20,
                  border: `2.5px solid ${BRAND.border}`,
                  background: item.bg,
                  padding: 10,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: BRAND.navy,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: BRAND.muted,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push('/add')}
            style={{
              marginTop: 12,
              width: '100%',
              minHeight: 58,
              borderRadius: 19,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
            }}
          >
            ＋ {text.addService}
          </button>
        </section>

        <section style={{ marginTop: 22 }}>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: 25,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-0.7px',
            }}
          >
            {text.priceList}
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
            {priceItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push('/add')}
                style={{
                  width: '100%',
                  minHeight: 116,
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
                <SmallIcon icon={item.icon} bg={item.bg} />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 17,
                        lineHeight: 1.1,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {item.title}
                    </div>

                    {item.badge === 'popular' ? (
                      <span
                        style={{
                          minHeight: 23,
                          padding: '0 8px',
                          borderRadius: 999,
                          border: `2px solid ${BRAND.border}`,
                          background: BRAND.yellow,
                          color: BRAND.navy,
                          fontSize: 10.5,
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {text.popular}
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 12.5,
                      lineHeight: 1.2,
                      fontWeight: 800,
                      color: BRAND.muted,
                    }}
                  >
                    {item.category} · {text.duration}: {item.duration}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      display: 'flex',
                      gap: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        minHeight: 25,
                        padding: '0 9px',
                        borderRadius: 999,
                        background: item.status === 'active' ? BRAND.softGreen : BRAND.softOrange,
                        color: item.status === 'active' ? '#11883d' : '#b47b00',
                        border: `2px solid ${BRAND.border}`,
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {item.status === 'active' ? text.active : text.draft}
                    </span>

                    <span
                      style={{
                        minHeight: 25,
                        padding: '0 9px',
                        borderRadius: 999,
                        background: BRAND.softBlue,
                        color: BRAND.navy,
                        border: `2px solid ${BRAND.border}`,
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {text.deposit}: {item.deposit}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: 900,
                      color: BRAND.navy,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.price}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 900,
                      color: BRAND.blue,
                    }}
                  >
                    {text.edit}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softViolet,
            padding: 15,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: BRAND.navy }}>
            ✨ {text.comingSoon}
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
            {text.comingSoonHint}
          </p>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
