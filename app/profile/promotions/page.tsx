'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type PromotionStatus = 'active' | 'draft' | 'paid' | 'pending';

type PromotionItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  radius: string;
  budget: string;
  validUntil: string;
  views: string;
  clicks: string;
  status: PromotionStatus;
  icon: string;
  bg: string;
};

type PromotionsTextShape = {
  title: string;
  subtitle: string;
  activeAds: string;
  totalPromos: string;
  pendingReview: string;
  myCampaigns: string;
  active: string;
  draft: string;
  paid: string;
  pending: string;
  views: string;
  clicks: string;
  radius: string;
  budget: string;
  validUntil: string;
  category: string;
  open: string;
  edit: string;
  empty: string;
  emptySub: string;
  smartBoost: string;
  smartBoostHint: string;
  addInfoTitle: string;
  addInfoHint: string;
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

const promotionsTexts: Record<AppLanguage, PromotionsTextShape> = {
  EN: {
    title: 'Promotions',
    subtitle: 'Manage your ads, deals and local visibility',
    activeAds: 'Active ads',
    totalPromos: 'Total promos',
    pendingReview: 'Pending',
    myCampaigns: 'My campaigns',
    active: 'Active',
    draft: 'Draft',
    paid: 'Paid',
    pending: 'Pending',
    views: 'Views',
    clicks: 'Clicks',
    radius: 'Radius',
    budget: 'Budget',
    validUntil: 'Valid until',
    category: 'Category',
    open: 'Open',
    edit: 'Edit',
    empty: 'No promotions yet',
    emptySub: 'Create your first ad from the Add button to appear higher on the map.',
    smartBoost: 'Smart local boost',
    smartBoostHint: 'Promote your service by category, location radius and selected days.',
    addInfoTitle: 'New ad is created from the Add button',
    addInfoHint: 'Tap Add → Ad to launch a new promotion for your service.',
  },
  RU: {
    title: 'Промоакции',
    subtitle: 'Управляйте рекламой, скидками и видимостью на карте',
    activeAds: 'Активные',
    totalPromos: 'Всего промо',
    pendingReview: 'На проверке',
    myCampaigns: 'Мои кампании',
    active: 'Активно',
    draft: 'Черновик',
    paid: 'Оплачено',
    pending: 'Ожидает',
    views: 'Показы',
    clicks: 'Клики',
    radius: 'Радиус',
    budget: 'Бюджет',
    validUntil: 'До',
    category: 'Категория',
    open: 'Открыть',
    edit: 'Изменить',
    empty: 'Промоакций пока нет',
    emptySub: 'Создайте первую рекламу через кнопку Add, чтобы показываться выше на карте.',
    smartBoost: 'Умное продвижение рядом',
    smartBoostHint: 'Продвигайте услугу по категории, радиусу и выбранным дням.',
    addInfoTitle: 'Новая реклама создаётся через кнопку Add',
    addInfoHint: 'Нажмите Add → Реклама, чтобы запустить продвижение услуги.',
  },
  UA: {
    title: 'Промоакції',
    subtitle: 'Керуйте рекламою, знижками та видимістю на карті',
    activeAds: 'Активні',
    totalPromos: 'Усього промо',
    pendingReview: 'На перевірці',
    myCampaigns: 'Мої кампанії',
    active: 'Активно',
    draft: 'Чернетка',
    paid: 'Оплачено',
    pending: 'Очікує',
    views: 'Покази',
    clicks: 'Кліки',
    radius: 'Радіус',
    budget: 'Бюджет',
    validUntil: 'До',
    category: 'Категорія',
    open: 'Відкрити',
    edit: 'Змінити',
    empty: 'Промоакцій поки немає',
    emptySub: 'Створіть першу рекламу через кнопку Add, щоб показуватися вище на карті.',
    smartBoost: 'Розумне локальне просування',
    smartBoostHint: 'Просувайте послугу за категорією, радіусом і вибраними днями.',
    addInfoTitle: 'Нова реклама створюється через кнопку Add',
    addInfoHint: 'Натисніть Add → Реклама, щоб запустити просування послуги.',
  },
  ES: {
    title: 'Promociones',
    subtitle: 'Gestiona anuncios, ofertas y visibilidad local',
    activeAds: 'Anuncios activos',
    totalPromos: 'Total promos',
    pendingReview: 'Pendientes',
    myCampaigns: 'Mis campañas',
    active: 'Activa',
    draft: 'Borrador',
    paid: 'Pagada',
    pending: 'Pendiente',
    views: 'Vistas',
    clicks: 'Clics',
    radius: 'Radio',
    budget: 'Presupuesto',
    validUntil: 'Válido hasta',
    category: 'Categoría',
    open: 'Abrir',
    edit: 'Editar',
    empty: 'Aún no hay promociones',
    emptySub: 'Crea tu primer anuncio desde el botón Add para aparecer más alto en el mapa.',
    smartBoost: 'Impulso local inteligente',
    smartBoostHint: 'Promociona tu servicio por categoría, radio y días seleccionados.',
    addInfoTitle: 'El nuevo anuncio se crea desde Add',
    addInfoHint: 'Toca Add → Ad para lanzar una nueva promoción.',
  },
  CZ: {
    title: 'Promo akce',
    subtitle: 'Spravujte reklamy, slevy a viditelnost na mapě',
    activeAds: 'Aktivní reklamy',
    totalPromos: 'Celkem promo',
    pendingReview: 'Čeká',
    myCampaigns: 'Moje kampaně',
    active: 'Aktivní',
    draft: 'Koncept',
    paid: 'Zaplaceno',
    pending: 'Čeká',
    views: 'Zobrazení',
    clicks: 'Kliknutí',
    radius: 'Rádius',
    budget: 'Rozpočet',
    validUntil: 'Platí do',
    category: 'Kategorie',
    open: 'Otevřít',
    edit: 'Upravit',
    empty: 'Zatím žádné promo akce',
    emptySub: 'Vytvořte první reklamu tlačítkem Add a zobrazujte se výše na mapě.',
    smartBoost: 'Chytré lokální zvýraznění',
    smartBoostHint: 'Propagujte službu podle kategorie, rádiusu a vybraných dnů.',
    addInfoTitle: 'Nová reklama se vytváří přes tlačítko Add',
    addInfoHint: 'Klepněte na Add → Reklama pro spuštění propagace služby.',
  },
  DE: {
    title: 'Aktionen',
    subtitle: 'Verwalte Anzeigen, Deals und lokale Sichtbarkeit',
    activeAds: 'Aktive Anzeigen',
    totalPromos: 'Aktionen gesamt',
    pendingReview: 'Ausstehend',
    myCampaigns: 'Meine Kampagnen',
    active: 'Aktiv',
    draft: 'Entwurf',
    paid: 'Bezahlt',
    pending: 'Ausstehend',
    views: 'Aufrufe',
    clicks: 'Klicks',
    radius: 'Radius',
    budget: 'Budget',
    validUntil: 'Gültig bis',
    category: 'Kategorie',
    open: 'Öffnen',
    edit: 'Bearbeiten',
    empty: 'Noch keine Aktionen',
    emptySub: 'Erstelle deine erste Anzeige über Add, um höher auf der Karte zu erscheinen.',
    smartBoost: 'Smarte lokale Sichtbarkeit',
    smartBoostHint: 'Bewirb deinen Service nach Kategorie, Radius und ausgewählten Tagen.',
    addInfoTitle: 'Neue Anzeigen werden über Add erstellt',
    addInfoHint: 'Tippe Add → Ad, um eine neue Promotion zu starten.',
  },
  IT: {
    title: 'Promozioni',
    subtitle: 'Gestisci annunci, offerte e visibilità locale',
    activeAds: 'Annunci attivi',
    totalPromos: 'Totale promo',
    pendingReview: 'In attesa',
    myCampaigns: 'Le mie campagne',
    active: 'Attiva',
    draft: 'Bozza',
    paid: 'Pagata',
    pending: 'In attesa',
    views: 'Viste',
    clicks: 'Click',
    radius: 'Raggio',
    budget: 'Budget',
    validUntil: 'Valida fino',
    category: 'Categoria',
    open: 'Apri',
    edit: 'Modifica',
    empty: 'Nessuna promozione',
    emptySub: 'Crea il primo annuncio dal pulsante Add per apparire più in alto sulla mappa.',
    smartBoost: 'Boost locale smart',
    smartBoostHint: 'Promuovi il servizio per categoria, raggio e giorni selezionati.',
    addInfoTitle: 'Il nuovo annuncio si crea da Add',
    addInfoHint: 'Tocca Add → Ad per lanciare una nuova promozione.',
  },
  FR: {
    title: 'Promotions',
    subtitle: 'Gérez pubs, offres et visibilité locale',
    activeAds: 'Pubs actives',
    totalPromos: 'Total promos',
    pendingReview: 'En attente',
    myCampaigns: 'Mes campagnes',
    active: 'Active',
    draft: 'Brouillon',
    paid: 'Payée',
    pending: 'En attente',
    views: 'Vues',
    clicks: 'Clics',
    radius: 'Rayon',
    budget: 'Budget',
    validUntil: 'Valide jusqu’au',
    category: 'Catégorie',
    open: 'Ouvrir',
    edit: 'Modifier',
    empty: 'Aucune promotion',
    emptySub: 'Créez votre première pub depuis le bouton Add pour apparaître plus haut sur la carte.',
    smartBoost: 'Boost local intelligent',
    smartBoostHint: 'Promouvez votre service par catégorie, rayon et jours sélectionnés.',
    addInfoTitle: 'La nouvelle pub se crée depuis Add',
    addInfoHint: 'Touchez Add → Ad pour lancer une nouvelle promotion.',
  },
  PL: {
    title: 'Promocje',
    subtitle: 'Zarządzaj reklamami, ofertami i widocznością',
    activeAds: 'Aktywne reklamy',
    totalPromos: 'Łącznie promo',
    pendingReview: 'Oczekuje',
    myCampaigns: 'Moje kampanie',
    active: 'Aktywna',
    draft: 'Szkic',
    paid: 'Opłacona',
    pending: 'Oczekuje',
    views: 'Wyświetlenia',
    clicks: 'Kliknięcia',
    radius: 'Zasięg',
    budget: 'Budżet',
    validUntil: 'Ważne do',
    category: 'Kategoria',
    open: 'Otwórz',
    edit: 'Edytuj',
    empty: 'Brak promocji',
    emptySub: 'Utwórz pierwszą reklamę przez Add, aby pojawiać się wyżej na mapie.',
    smartBoost: 'Smart lokalny boost',
    smartBoostHint: 'Promuj usługę według kategorii, zasięgu i wybranych dni.',
    addInfoTitle: 'Nową reklamę tworzy się przez Add',
    addInfoHint: 'Kliknij Add → Reklama, aby uruchomić promocję usługi.',
  },
  AR: {
    title: 'العروض',
    subtitle: 'إدارة الإعلانات والعروض والظهور المحلي',
    activeAds: 'إعلانات نشطة',
    totalPromos: 'إجمالي العروض',
    pendingReview: 'قيد المراجعة',
    myCampaigns: 'حملاتي',
    active: 'نشط',
    draft: 'مسودة',
    paid: 'مدفوع',
    pending: 'معلّق',
    views: 'مشاهدات',
    clicks: 'نقرات',
    radius: 'النطاق',
    budget: 'الميزانية',
    validUntil: 'صالح حتى',
    category: 'الفئة',
    open: 'فتح',
    edit: 'تعديل',
    empty: 'لا توجد عروض بعد',
    emptySub: 'أنشئ أول إعلان من زر Add لتظهر أعلى على الخريطة.',
    smartBoost: 'تعزيز محلي ذكي',
    smartBoostHint: 'روّج خدمتك حسب الفئة والنطاق والأيام المختارة.',
    addInfoTitle: 'يتم إنشاء إعلان جديد من زر Add',
    addInfoHint: 'اضغط Add → إعلان لبدء ترويج جديد لخدمتك.',
  },
};

function getText(language: AppLanguage) {
  return promotionsTexts[language] || promotionsTexts.EN;
}

function getStatusStyle(status: PromotionStatus) {
  if (status === 'active') {
    return { bg: BRAND.softGreen, color: '#11883d' };
  }

  if (status === 'paid') {
    return { bg: BRAND.softBlue, color: BRAND.blue };
  }

  if (status === 'pending') {
    return { bg: BRAND.softOrange, color: '#b47b00' };
  }

  return { bg: '#f2f4f7', color: BRAND.muted };
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

export default function PromotionsPage() {
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

  const promoItems: PromotionItem[] = [
    {
      id: 'promo-1',
      title: 'Map boost: Hair extensions',
      description: 'Shown higher in local beauty searches around your area.',
      category: 'Beauty',
      radius: '10 km',
      budget: '£12',
      validUntil: '30 Apr 2026',
      views: '1.2k',
      clicks: '84',
      status: 'active',
      icon: '📍',
      bg: BRAND.softBlue,
    },
    {
      id: 'promo-2',
      title: 'Spring beauty offer',
      description: 'Discount campaign for new clients this month.',
      category: 'Beauty',
      radius: '50 km',
      budget: '£24',
      validUntil: '05 May 2026',
      views: '690',
      clicks: '41',
      status: 'paid',
      icon: '🎁',
      bg: BRAND.softPink,
    },
    {
      id: 'promo-3',
      title: 'Massage weekend deal',
      description: 'Draft campaign for wellness category.',
      category: 'Wellness',
      radius: '10 km',
      budget: '£8',
      validUntil: 'Draft',
      views: '0',
      clicks: '0',
      status: 'draft',
      icon: '💆',
      bg: BRAND.softGreen,
    },
  ];

  const activeCount = promoItems.filter((item) => item.status === 'active').length;
  const pendingCount = promoItems.filter((item) => item.status === 'pending').length;

  const getStatusLabel = (status: PromotionStatus) => {
    if (status === 'active') return text.active;
    if (status === 'paid') return text.paid;
    if (status === 'pending') return text.pending;
    return text.draft;
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
              { label: text.activeAds, value: activeCount, bg: BRAND.softGreen },
              { label: text.totalPromos, value: promoItems.length, bg: '#ffffff' },
              { label: text.pendingReview, value: pendingCount, bg: BRAND.softOrange },
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

          <div
            style={{
              marginTop: 12,
              borderRadius: 20,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: '13px 14px',
              boxShadow: '0 5px 0 rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.25,
                fontWeight: 900,
                color: BRAND.navy,
              }}
            >
              ＋ {text.addInfoTitle}
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 13,
                lineHeight: 1.3,
                fontWeight: 800,
                color: BRAND.muted,
              }}
            >
              {text.addInfoHint}
            </div>
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
            🚀 {text.smartBoost}
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
            {text.smartBoostHint}
          </p>
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
            {text.myCampaigns}
          </h2>

          {promoItems.length === 0 ? (
            <div
              style={{
                borderRadius: 26,
                border: `2.5px solid ${BRAND.border}`,
                background: '#ffffff',
                padding: 22,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 38 }}>📣</div>
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>{text.empty}</div>
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
                {text.emptySub}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {promoItems.map((item) => {
                const statusStyle = getStatusStyle(item.status);

                return (
                  <article
                    key={item.id}
                    style={{
                      borderRadius: 26,
                      border: `2.5px solid ${BRAND.border}`,
                      background: '#ffffff',
                      padding: 13,
                      boxShadow: '0 8px 20px rgba(7,27,70,0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '58px minmax(0, 1fr) auto',
                        gap: 12,
                        alignItems: 'start',
                      }}
                    >
                      <SmallIcon icon={item.icon} bg={item.bg} />

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 18,
                            lineHeight: 1.1,
                            fontWeight: 900,
                            color: BRAND.navy,
                          }}
                        >
                          {item.title}
                        </div>

                        <p
                          style={{
                            margin: '6px 0 0',
                            fontSize: 13,
                            lineHeight: 1.3,
                            fontWeight: 800,
                            color: BRAND.muted,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>

                      <span
                        style={{
                          minHeight: 28,
                          padding: '0 9px',
                          borderRadius: 999,
                          border: `2px solid ${BRAND.border}`,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontSize: 11,
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 13,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                      }}
                    >
                      {[
                        { label: text.category, value: item.category },
                        { label: text.radius, value: item.radius },
                        { label: text.budget, value: item.budget },
                        { label: text.validUntil, value: item.validUntil },
                        { label: text.views, value: item.views },
                        { label: text.clicks, value: item.clicks },
                      ].map((meta) => (
                        <div
                          key={`${item.id}-${meta.label}`}
                          style={{
                            minHeight: 54,
                            borderRadius: 16,
                            border: `2px solid ${BRAND.border}`,
                            background: '#ffffff',
                            padding: '8px 10px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              lineHeight: 1,
                              fontWeight: 900,
                              color: BRAND.muted,
                            }}
                          >
                            {meta.label}
                          </div>

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 14,
                              lineHeight: 1.05,
                              fontWeight: 900,
                              color: BRAND.navy,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {meta.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 9,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => router.push('/profile/promotions/new')}
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
                        onClick={() => router.push('/profile/promotions/new')}
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
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
