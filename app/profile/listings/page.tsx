'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type ListingStatus = 'active' | 'draft' | 'paused';

type ListingItem = {
  id: string;
  title: string;
  category: string;
  price: string;
  location: string;
  status: ListingStatus;
  image: string;
  views: number;
  bookings: number;
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

const texts = {
  EN: {
    title: 'My services',
    subtitle: 'Manage your offers, prices and visibility',
    active: 'Active',
    draft: 'Draft',
    paused: 'Paused',
    create: 'Add service',
    open: 'Open',
    edit: 'Edit',
    views: 'Views',
    bookings: 'Bookings',
    category: 'Category',
    price: 'Price',
    location: 'Location',
    overview: 'Services overview',
    overviewSub: 'Your active offers are visible on the map and in search.',
    total: 'Total',
    activeServices: 'Active',
    drafts: 'Drafts',
    emptyTitle: 'No services yet',
    emptySub: 'Add your first service so clients can find and book you.',
    boost: 'Boost service',
  },
  RU: {
    title: 'Мои услуги',
    subtitle: 'Управляйте услугами, ценами и видимостью',
    active: 'Активно',
    draft: 'Черновик',
    paused: 'На паузе',
    create: 'Добавить услугу',
    open: 'Открыть',
    edit: 'Изменить',
    views: 'Просмотры',
    bookings: 'Брони',
    category: 'Категория',
    price: 'Цена',
    location: 'Локация',
    overview: 'Обзор услуг',
    overviewSub: 'Активные услуги видны на карте и в поиске.',
    total: 'Всего',
    activeServices: 'Активные',
    drafts: 'Черновики',
    emptyTitle: 'Пока нет услуг',
    emptySub: 'Добавьте первую услугу, чтобы клиенты могли вас найти и забронировать.',
    boost: 'Продвинуть услугу',
  },
  UA: {
    title: 'Мої послуги',
    subtitle: 'Керуйте послугами, цінами та видимістю',
    active: 'Активно',
    draft: 'Чернетка',
    paused: 'На паузі',
    create: 'Додати послугу',
    open: 'Відкрити',
    edit: 'Змінити',
    views: 'Перегляди',
    bookings: 'Броні',
    category: 'Категорія',
    price: 'Ціна',
    location: 'Локація',
    overview: 'Огляд послуг',
    overviewSub: 'Активні послуги видно на карті та в пошуку.',
    total: 'Усього',
    activeServices: 'Активні',
    drafts: 'Чернетки',
    emptyTitle: 'Поки немає послуг',
    emptySub: 'Додайте першу послугу, щоб клієнти могли вас знайти.',
    boost: 'Просунути послугу',
  },
  ES: {
    title: 'Mis servicios',
    subtitle: 'Gestiona tus ofertas, precios y visibilidad',
    active: 'Activo',
    draft: 'Borrador',
    paused: 'Pausado',
    create: 'Añadir servicio',
    open: 'Abrir',
    edit: 'Editar',
    views: 'Vistas',
    bookings: 'Reservas',
    category: 'Categoría',
    price: 'Precio',
    location: 'Ubicación',
    overview: 'Resumen de servicios',
    overviewSub: 'Tus servicios activos aparecen en el mapa y búsqueda.',
    total: 'Total',
    activeServices: 'Activos',
    drafts: 'Borradores',
    emptyTitle: 'Aún no hay servicios',
    emptySub: 'Añade tu primer servicio para que los clientes te encuentren.',
    boost: 'Promocionar servicio',
  },
  CZ: {
    title: 'Moje služby',
    subtitle: 'Spravujte nabídky, ceny a viditelnost',
    active: 'Aktivní',
    draft: 'Koncept',
    paused: 'Pozastaveno',
    create: 'Přidat službu',
    open: 'Otevřít',
    edit: 'Upravit',
    views: 'Zobrazení',
    bookings: 'Rezervace',
    category: 'Kategorie',
    price: 'Cena',
    location: 'Lokalita',
    overview: 'Přehled služeb',
    overviewSub: 'Aktivní služby jsou vidět na mapě a ve vyhledávání.',
    total: 'Celkem',
    activeServices: 'Aktivní',
    drafts: 'Koncepty',
    emptyTitle: 'Zatím žádné služby',
    emptySub: 'Přidejte první službu, aby vás klienti našli.',
    boost: 'Propagovat službu',
  },
  DE: {
    title: 'Meine Services',
    subtitle: 'Verwalte Angebote, Preise und Sichtbarkeit',
    active: 'Aktiv',
    draft: 'Entwurf',
    paused: 'Pausiert',
    create: 'Service hinzufügen',
    open: 'Öffnen',
    edit: 'Bearbeiten',
    views: 'Aufrufe',
    bookings: 'Buchungen',
    category: 'Kategorie',
    price: 'Preis',
    location: 'Standort',
    overview: 'Service-Übersicht',
    overviewSub: 'Aktive Services sind auf Karte und Suche sichtbar.',
    total: 'Gesamt',
    activeServices: 'Aktiv',
    drafts: 'Entwürfe',
    emptyTitle: 'Noch keine Services',
    emptySub: 'Füge deinen ersten Service hinzu, damit Kunden dich finden.',
    boost: 'Service bewerben',
  },
  IT: {
    title: 'I miei servizi',
    subtitle: 'Gestisci offerte, prezzi e visibilità',
    active: 'Attivo',
    draft: 'Bozza',
    paused: 'In pausa',
    create: 'Aggiungi servizio',
    open: 'Apri',
    edit: 'Modifica',
    views: 'Visualizzazioni',
    bookings: 'Prenotazioni',
    category: 'Categoria',
    price: 'Prezzo',
    location: 'Posizione',
    overview: 'Panoramica servizi',
    overviewSub: 'I servizi attivi sono visibili su mappa e ricerca.',
    total: 'Totale',
    activeServices: 'Attivi',
    drafts: 'Bozze',
    emptyTitle: 'Nessun servizio',
    emptySub: 'Aggiungi il primo servizio per farti trovare dai clienti.',
    boost: 'Promuovi servizio',
  },
  FR: {
    title: 'Mes services',
    subtitle: 'Gérez vos offres, prix et visibilité',
    active: 'Actif',
    draft: 'Brouillon',
    paused: 'En pause',
    create: 'Ajouter service',
    open: 'Ouvrir',
    edit: 'Modifier',
    views: 'Vues',
    bookings: 'Réservations',
    category: 'Catégorie',
    price: 'Prix',
    location: 'Localisation',
    overview: 'Aperçu services',
    overviewSub: 'Vos services actifs sont visibles sur la carte et recherche.',
    total: 'Total',
    activeServices: 'Actifs',
    drafts: 'Brouillons',
    emptyTitle: 'Aucun service',
    emptySub: 'Ajoutez votre premier service pour être trouvé.',
    boost: 'Promouvoir service',
  },
  PL: {
    title: 'Moje usługi',
    subtitle: 'Zarządzaj ofertami, cenami i widocznością',
    active: 'Aktywne',
    draft: 'Szkic',
    paused: 'Pauza',
    create: 'Dodaj usługę',
    open: 'Otwórz',
    edit: 'Edytuj',
    views: 'Wyświetlenia',
    bookings: 'Rezerwacje',
    category: 'Kategoria',
    price: 'Cena',
    location: 'Lokalizacja',
    overview: 'Przegląd usług',
    overviewSub: 'Aktywne usługi są widoczne na mapie i w wyszukiwarce.',
    total: 'Łącznie',
    activeServices: 'Aktywne',
    drafts: 'Szkice',
    emptyTitle: 'Brak usług',
    emptySub: 'Dodaj pierwszą usługę, aby klienci mogli cię znaleźć.',
    boost: 'Promuj usługę',
  },
  AR: {
    title: 'خدماتي',
    subtitle: 'إدارة العروض والأسعار والظهور',
    active: 'نشط',
    draft: 'مسودة',
    paused: 'متوقف',
    create: 'إضافة خدمة',
    open: 'فتح',
    edit: 'تعديل',
    views: 'مشاهدات',
    bookings: 'حجوزات',
    category: 'الفئة',
    price: 'السعر',
    location: 'الموقع',
    overview: 'نظرة عامة',
    overviewSub: 'الخدمات النشطة تظهر على الخريطة والبحث.',
    total: 'الإجمالي',
    activeServices: 'نشط',
    drafts: 'مسودات',
    emptyTitle: 'لا توجد خدمات بعد',
    emptySub: 'أضف أول خدمة حتى يتمكن العملاء من العثور عليك.',
    boost: 'ترويج الخدمة',
  },
};

function getText(language: AppLanguage) {
  return texts[language] || texts.EN;
}

const demoListings: ListingItem[] = [
  {
    id: '1',
    title: 'Hair extensions',
    category: 'Beauty',
    price: 'from £80',
    location: 'London · E17',
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
    views: 128,
    bookings: 12,
  },
  {
    id: '2',
    title: 'Keratin bonds',
    category: 'Hair',
    price: '£120–£250',
    location: 'London',
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop',
    views: 74,
    bookings: 6,
  },
  {
    id: '3',
    title: 'Tape-in extensions',
    category: 'Hair',
    price: 'from £95',
    location: 'London',
    status: 'draft',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=600&auto=format&fit=crop',
    views: 0,
    bookings: 0,
  },
];

function statusStyle(status: ListingStatus) {
  if (status === 'active') return { bg: BRAND.softGreen, color: '#11883d' };
  if (status === 'draft') return { bg: BRAND.softOrange, color: '#b47b00' };
  return { bg: '#f2f4f7', color: BRAND.muted };
}

export default function ProfileListingsPage() {
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

  const activeCount = demoListings.filter((item) => item.status === 'active').length;
  const draftCount = demoListings.filter((item) => item.status === 'draft').length;

  const getStatusLabel = (status: ListingStatus) => {
    if (status === 'active') return text.active;
    if (status === 'draft') return text.draft;
    return text.paused;
  };

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
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 9,
            }}
          >
            <StatBox value={demoListings.length} label={text.total} />
            <StatBox value={activeCount} label={text.activeServices} />
            <StatBox value={draftCount} label={text.drafts} />
          </div>

          <button
            type="button"
            onClick={() => router.push('/add')}
            style={{
              marginTop: 13,
              width: '100%',
              minHeight: 58,
              borderRadius: 20,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.14)',
            }}
          >
            ＋ {text.create}
          </button>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 24,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softViolet,
            padding: 15,
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.navy }}>
            🚀 {text.overview}
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
            {text.overviewSub}
          </p>
        </section>

        <section style={{ marginTop: 20, display: 'grid', gap: 14 }}>
          {demoListings.length === 0 ? (
            <div
              style={{
                borderRadius: 26,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44 }}>💼</div>
              <div style={{ marginTop: 10, fontSize: 20, fontWeight: 900 }}>
                {text.emptyTitle}
              </div>
              <p
                style={{
                  margin: '8px auto 0',
                  maxWidth: 280,
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 800,
                  color: BRAND.muted,
                }}
              >
                {text.emptySub}
              </p>
            </div>
          ) : (
            demoListings.map((item) => {
              const status = statusStyle(item.status);

              return (
                <article
                  key={item.id}
                  style={{
                    borderRadius: 28,
                    border: `2.5px solid ${BRAND.border}`,
                    background: '#ffffff',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 154,
                        objectFit: 'cover',
                        display: 'block',
                        borderBottom: `2.5px solid ${BRAND.border}`,
                      }}
                    />

                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        minHeight: 34,
                        padding: '0 12px',
                        borderRadius: 999,
                        border: `2px solid ${BRAND.border}`,
                        background: status.bg,
                        color: status.color,
                        fontSize: 12,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 22,
                            lineHeight: 1.05,
                            fontWeight: 900,
                            color: BRAND.navy,
                          }}
                        >
                          {item.title}
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
                          {item.category} · {item.location}
                        </p>
                      </div>

                      <div
                        style={{
                          minHeight: 42,
                          padding: '0 12px',
                          borderRadius: 16,
                          border: `2px solid ${BRAND.border}`,
                          background: BRAND.softOrange,
                          color: BRAND.navy,
                          fontSize: 14,
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.price}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 13,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 9,
                      }}
                    >
                      <MiniInfo label={text.views} value={item.views} />
                      <MiniInfo label={text.bookings} value={item.bookings} />
                    </div>

                    <div
                      style={{
                        marginTop: 13,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 9,
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          minHeight: 48,
                          borderRadius: 17,
                          border: `2.5px solid ${BRAND.border}`,
                          background: BRAND.navy,
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {text.edit}
                      </button>

                      <button
                        type="button"
                        style={{
                          minHeight: 48,
                          borderRadius: 17,
                          border: `2.5px solid ${BRAND.border}`,
                          background: BRAND.yellow,
                          color: BRAND.navy,
                          fontSize: 14,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {text.open}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push('/profile/promotions/new')}
                      style={{
                        marginTop: 10,
                        width: '100%',
                        minHeight: 48,
                        borderRadius: 17,
                        border: `2.5px solid ${BRAND.border}`,
                        background: BRAND.softBlue,
                        color: BRAND.blue,
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      🚀 {text.boost}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        minHeight: 92,
        borderRadius: 22,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 11,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 900,
          color: BRAND.navy,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 12,
          lineHeight: 1.15,
          fontWeight: 900,
          color: BRAND.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 10,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.navy }}>{value}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 900,
          color: BRAND.muted,
        }}
      >
        {label}
      </div>
    </div>
  );
}
