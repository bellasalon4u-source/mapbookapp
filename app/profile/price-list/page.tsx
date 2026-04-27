'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';

type PriceStatus = 'active' | 'draft';

type PriceRow = {
  id: string;
  service: string;
  priceFrom: string;
  priceTo: string;
  duration: string;
  deposit: string;
  status: PriceStatus;
};

type PriceTextShape = {
  title: string;
  subtitle: string;
  tableTitle: string;
  addRow: string;
  save: string;
  rowNumber: string;
  service: string;
  priceFrom: string;
  priceTo: string;
  duration: string;
  deposit: string;
  status: string;
  active: string;
  draft: string;
  delete: string;
  uploadPhoto: string;
  comingSoon: string;
  photoHint: string;
  summaryServices: string;
  summaryActive: string;
  summaryDrafts: string;
  saved: string;
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
    subtitle: 'Create your services table for clients',
    tableTitle: 'My price table',
    addRow: 'Add row',
    save: 'Save price list',
    rowNumber: '№',
    service: 'Service',
    priceFrom: 'Price from',
    priceTo: 'Price to',
    duration: 'Time',
    deposit: 'Deposit',
    status: 'Status',
    active: 'Active',
    draft: 'Draft',
    delete: 'Delete',
    uploadPhoto: 'Upload price photo',
    comingSoon: 'Coming soon',
    photoHint: 'Later Olamep will convert a photo of your price list into this table automatically.',
    summaryServices: 'Services',
    summaryActive: 'Active',
    summaryDrafts: 'Drafts',
    saved: 'Saved',
  },
  RU: {
    title: 'Прайс-лист',
    subtitle: 'Создайте таблицу услуг для клиентов',
    tableTitle: 'Моя таблица цен',
    addRow: 'Добавить строку',
    save: 'Сохранить прайс',
    rowNumber: '№',
    service: 'Услуга',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    duration: 'Время',
    deposit: 'Депозит',
    status: 'Статус',
    active: 'Активно',
    draft: 'Черновик',
    delete: 'Удалить',
    uploadPhoto: 'Загрузить фото прайса',
    comingSoon: 'Скоро',
    photoHint: 'Позже Olamep сможет превращать фото вашего прайса в такую таблицу автоматически.',
    summaryServices: 'Услуги',
    summaryActive: 'Активно',
    summaryDrafts: 'Черновики',
    saved: 'Сохранено',
  },
  UA: {
    title: 'Прайс-лист',
    subtitle: 'Створіть таблицю послуг для клієнтів',
    tableTitle: 'Моя таблиця цін',
    addRow: 'Додати рядок',
    save: 'Зберегти прайс',
    rowNumber: '№',
    service: 'Послуга',
    priceFrom: 'Ціна від',
    priceTo: 'Ціна до',
    duration: 'Час',
    deposit: 'Депозит',
    status: 'Статус',
    active: 'Активно',
    draft: 'Чернетка',
    delete: 'Видалити',
    uploadPhoto: 'Завантажити фото прайса',
    comingSoon: 'Скоро',
    photoHint: 'Пізніше Olamep зможе автоматично перетворювати фото прайса в таку таблицю.',
    summaryServices: 'Послуги',
    summaryActive: 'Активно',
    summaryDrafts: 'Чернетки',
    saved: 'Збережено',
  },
  ES: {
    title: 'Lista de precios',
    subtitle: 'Crea tu tabla de servicios para clientes',
    tableTitle: 'Mi tabla de precios',
    addRow: 'Añadir fila',
    save: 'Guardar lista',
    rowNumber: '№',
    service: 'Servicio',
    priceFrom: 'Precio desde',
    priceTo: 'Precio hasta',
    duration: 'Tiempo',
    deposit: 'Depósito',
    status: 'Estado',
    active: 'Activo',
    draft: 'Borrador',
    delete: 'Eliminar',
    uploadPhoto: 'Subir foto del precio',
    comingSoon: 'Próximamente',
    photoHint: 'Más tarde Olamep convertirá una foto de tu lista en esta tabla automáticamente.',
    summaryServices: 'Servicios',
    summaryActive: 'Activos',
    summaryDrafts: 'Borradores',
    saved: 'Guardado',
  },
  CZ: {
    title: 'Ceník',
    subtitle: 'Vytvořte tabulku služeb pro klienty',
    tableTitle: 'Moje tabulka cen',
    addRow: 'Přidat řádek',
    save: 'Uložit ceník',
    rowNumber: '№',
    service: 'Služba',
    priceFrom: 'Cena od',
    priceTo: 'Cena do',
    duration: 'Čas',
    deposit: 'Záloha',
    status: 'Stav',
    active: 'Aktivní',
    draft: 'Koncept',
    delete: 'Smazat',
    uploadPhoto: 'Nahrát foto ceníku',
    comingSoon: 'Brzy',
    photoHint: 'Později Olamep automaticky převede fotku ceníku do této tabulky.',
    summaryServices: 'Služby',
    summaryActive: 'Aktivní',
    summaryDrafts: 'Koncepty',
    saved: 'Uloženo',
  },
  DE: {
    title: 'Preisliste',
    subtitle: 'Erstelle deine Servicetabelle für Kunden',
    tableTitle: 'Meine Preistabelle',
    addRow: 'Zeile hinzufügen',
    save: 'Preisliste speichern',
    rowNumber: '№',
    service: 'Service',
    priceFrom: 'Preis ab',
    priceTo: 'Preis bis',
    duration: 'Zeit',
    deposit: 'Anzahlung',
    status: 'Status',
    active: 'Aktiv',
    draft: 'Entwurf',
    delete: 'Löschen',
    uploadPhoto: 'Preisfoto hochladen',
    comingSoon: 'Bald',
    photoHint: 'Später wandelt Olamep ein Foto deiner Preisliste automatisch in diese Tabelle um.',
    summaryServices: 'Services',
    summaryActive: 'Aktiv',
    summaryDrafts: 'Entwürfe',
    saved: 'Gespeichert',
  },
  IT: {
    title: 'Listino prezzi',
    subtitle: 'Crea la tabella dei servizi per i clienti',
    tableTitle: 'La mia tabella prezzi',
    addRow: 'Aggiungi riga',
    save: 'Salva listino',
    rowNumber: '№',
    service: 'Servizio',
    priceFrom: 'Prezzo da',
    priceTo: 'Prezzo a',
    duration: 'Tempo',
    deposit: 'Deposito',
    status: 'Stato',
    active: 'Attivo',
    draft: 'Bozza',
    delete: 'Elimina',
    uploadPhoto: 'Carica foto listino',
    comingSoon: 'Presto',
    photoHint: 'Più tardi Olamep convertirà una foto del listino in questa tabella automaticamente.',
    summaryServices: 'Servizi',
    summaryActive: 'Attivi',
    summaryDrafts: 'Bozze',
    saved: 'Salvato',
  },
  FR: {
    title: 'Liste de prix',
    subtitle: 'Créez votre tableau de services pour les clients',
    tableTitle: 'Mon tableau de prix',
    addRow: 'Ajouter ligne',
    save: 'Enregistrer',
    rowNumber: '№',
    service: 'Service',
    priceFrom: 'Prix dès',
    priceTo: 'Prix max',
    duration: 'Temps',
    deposit: 'Dépôt',
    status: 'Statut',
    active: 'Actif',
    draft: 'Brouillon',
    delete: 'Supprimer',
    uploadPhoto: 'Télécharger photo',
    comingSoon: 'Bientôt',
    photoHint: 'Plus tard Olamep transformera automatiquement une photo de votre liste en tableau.',
    summaryServices: 'Services',
    summaryActive: 'Actifs',
    summaryDrafts: 'Brouillons',
    saved: 'Enregistré',
  },
  PL: {
    title: 'Cennik',
    subtitle: 'Utwórz tabelę usług dla klientów',
    tableTitle: 'Moja tabela cen',
    addRow: 'Dodaj wiersz',
    save: 'Zapisz cennik',
    rowNumber: '№',
    service: 'Usługa',
    priceFrom: 'Cena od',
    priceTo: 'Cena do',
    duration: 'Czas',
    deposit: 'Depozyt',
    status: 'Status',
    active: 'Aktywne',
    draft: 'Szkic',
    delete: 'Usuń',
    uploadPhoto: 'Wgraj zdjęcie cennika',
    comingSoon: 'Wkrótce',
    photoHint: 'Później Olamep automatycznie zamieni zdjęcie cennika w taką tabelę.',
    summaryServices: 'Usługi',
    summaryActive: 'Aktywne',
    summaryDrafts: 'Szkice',
    saved: 'Zapisano',
  },
  AR: {
    title: 'قائمة الأسعار',
    subtitle: 'أنشئ جدول خدماتك للعملاء',
    tableTitle: 'جدول أسعاري',
    addRow: 'إضافة صف',
    save: 'حفظ القائمة',
    rowNumber: '№',
    service: 'الخدمة',
    priceFrom: 'السعر من',
    priceTo: 'السعر إلى',
    duration: 'الوقت',
    deposit: 'العربون',
    status: 'الحالة',
    active: 'نشط',
    draft: 'مسودة',
    delete: 'حذف',
    uploadPhoto: 'رفع صورة السعر',
    comingSoon: 'قريباً',
    photoHint: 'لاحقاً سيحوّل Olamep صورة قائمة الأسعار إلى هذا الجدول تلقائياً.',
    summaryServices: 'الخدمات',
    summaryActive: 'نشط',
    summaryDrafts: 'مسودات',
    saved: 'تم الحفظ',
  },
};

const initialRows: PriceRow[] = [
  {
    id: 'row-1',
    service: 'Hair extensions',
    priceFrom: '120',
    priceTo: '250',
    duration: '2h 30m',
    deposit: '25',
    status: 'active',
  },
  {
    id: 'row-2',
    service: 'Relax massage',
    priceFrom: '65',
    priceTo: '90',
    duration: '1h',
    deposit: '10',
    status: 'active',
  },
  {
    id: 'row-3',
    service: 'Evening makeup',
    priceFrom: '80',
    priceTo: '140',
    duration: '1h 20m',
    deposit: '15',
    status: 'draft',
  },
];

function getText(language: AppLanguage) {
  return priceTexts[language] || priceTexts.EN;
}

function FieldInput({
  value,
  placeholder,
  onChange,
  type = 'text',
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: '100%',
        minHeight: 44,
        borderRadius: 15,
        border: `2px solid ${BRAND.border}`,
        background: '#ffffff',
        color: BRAND.navy,
        fontSize: 14,
        fontWeight: 900,
        padding: '0 10px',
        boxSizing: 'border-box',
        outline: 'none',
      }}
    />
  );
}

export default function PriceListPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [rows, setRows] = useState<PriceRow[]>(initialRows);
  const [saved, setSaved] = useState(false);

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

  const activeCount = rows.filter((row) => row.status === 'active').length;
  const draftCount = rows.filter((row) => row.status === 'draft').length;

  const updateRow = (id: string, patch: Partial<PriceRow>) => {
    setSaved(false);
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setSaved(false);
    setRows((currentRows) => [
      ...currentRows,
      {
        id: `row-${Date.now()}`,
        service: '',
        priceFrom: '',
        priceTo: '',
        duration: '',
        deposit: '',
        status: 'draft',
      },
    ]);
  };

  const deleteRow = (id: string) => {
    setSaved(false);
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const saveRows = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
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
              { label: text.summaryServices, value: rows.length, bg: '#ffffff' },
              { label: text.summaryActive, value: activeCount, bg: BRAND.softGreen },
              { label: text.summaryDrafts, value: draftCount, bg: BRAND.softOrange },
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
            onClick={addRow}
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
            ＋ {text.addRow}
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
            {text.tableTitle}
          </h2>

          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((row, index) => (
              <div
                key={row.id}
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
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      border: `2.5px solid ${BRAND.border}`,
                      background: BRAND.yellow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 900,
                      color: BRAND.navy,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: BRAND.muted,
                      }}
                    >
                      {text.rowNumber} {index + 1}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 17,
                        fontWeight: 900,
                        color: BRAND.navy,
                      }}
                    >
                      {row.service || text.service}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    style={{
                      minHeight: 36,
                      padding: '0 11px',
                      borderRadius: 999,
                      border: `2px solid ${BRAND.border}`,
                      background: BRAND.softPink,
                      color: BRAND.pink,
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    {text.delete}
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                      {text.service}
                    </span>
                    <FieldInput
                      value={row.service}
                      placeholder={text.service}
                      onChange={(value) => updateRow(row.id, { service: value })}
                    />
                  </label>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                        {text.priceFrom}
                      </span>
                      <FieldInput
                        value={row.priceFrom}
                        placeholder="0"
                        type="number"
                        onChange={(value) => updateRow(row.id, { priceFrom: value })}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                        {text.priceTo}
                      </span>
                      <FieldInput
                        value={row.priceTo}
                        placeholder="0"
                        type="number"
                        onChange={(value) => updateRow(row.id, { priceTo: value })}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                        {text.duration}
                      </span>
                      <FieldInput
                        value={row.duration}
                        placeholder="1h"
                        onChange={(value) => updateRow(row.id, { duration: value })}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: BRAND.navy }}>
                        {text.deposit}
                      </span>
                      <FieldInput
                        value={row.deposit}
                        placeholder="0"
                        type="number"
                        onChange={(value) => updateRow(row.id, { deposit: value })}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { status: 'active' })}
                      style={{
                        minHeight: 44,
                        borderRadius: 15,
                        border: `2.5px solid ${BRAND.border}`,
                        background: row.status === 'active' ? BRAND.green : BRAND.softGreen,
                        color: row.status === 'active' ? '#ffffff' : '#11883d',
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.active}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { status: 'draft' })}
                      style={{
                        minHeight: 44,
                        borderRadius: 15,
                        border: `2.5px solid ${BRAND.border}`,
                        background: row.status === 'draft' ? BRAND.yellow : BRAND.softOrange,
                        color: BRAND.navy,
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      {text.draft}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={saveRows}
            style={{
              marginTop: 14,
              width: '100%',
              minHeight: 58,
              borderRadius: 20,
              border: `3px solid ${BRAND.border}`,
              background: saved ? BRAND.yellow : BRAND.navy,
              color: saved ? BRAND.navy : '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: `0 5px 0 ${BRAND.border}`,
            }}
          >
            {saved ? `✓ ${text.saved}` : text.save}
          </button>
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
            📷 {text.uploadPhoto} — {text.comingSoon}
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
            {text.photoHint}
          </p>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
