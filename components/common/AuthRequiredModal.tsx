'use client';

import { useRouter } from 'next/navigation';

const BRAND = {
  navy: '#071b46',
  green: '#24c45a',
  blue: '#0e73d8',
  pink: '#ff4f9a',
  border: '#050505',
  muted: '#6c7686',
  softBlue: '#dcecff',
  softOrange: '#fff0da',
};

type AuthRequiredModalProps = {
  open: boolean;
  returnTo?: string;
  title?: string;
  message?: string;
  onClose: () => void;
};

function OlamepMiniLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <img
        src="/ui/logo/app-icon.svg"
        alt="Olamep"
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 16px rgba(7,27,70,0.12))',
        }}
      />

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}
      >
        Olamep
      </div>
    </div>
  );
}

export default function AuthRequiredModal({
  open,
  returnTo = '/',
  title = 'Создайте аккаунт Olamep',
  message = 'Чтобы сохранять избранное, писать мастерам, бронировать услуги, добавлять объявления и пользоваться платежами, нужно войти или создать аккаунт.',
  onClose,
}: AuthRequiredModalProps) {
  const router = useRouter();

  if (!open) return null;

  const openAuth = () => {
    router.push(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: 'rgba(0,0,0,0.36)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 10px',
        boxSizing: 'border-box',
      }}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 430,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          border: `3px solid ${BRAND.border}`,
          borderBottom: 'none',
          background: '#ffffff',
          padding: '18px 16px calc(20px + env(safe-area-inset-bottom))',
          boxSizing: 'border-box',
          boxShadow: '0 -14px 34px rgba(0,0,0,0.24)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 46px',
            alignItems: 'start',
            gap: 10,
          }}
        >
          <OlamepMiniLogo />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 46,
              height: 46,
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
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background:
              'linear-gradient(135deg, #eef4ff 0%, #ffffff 48%, #fff1f4 100%)',
            padding: 15,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.softBlue,
              display: 'grid',
              placeItems: 'center',
              fontSize: 31,
              boxShadow: '0 6px 0 rgba(0,0,0,0.06)',
            }}
          >
            🔐
          </div>

          <h2
            style={{
              margin: '14px 0 0',
              fontSize: 30,
              lineHeight: 1,
              fontWeight: 900,
              color: BRAND.navy,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.42,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            {message}
          </p>
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={openAuth}
            style={{
              width: '100%',
              minHeight: 56,
              borderRadius: 19,
              border: `2.5px solid ${BRAND.border}`,
              background: BRAND.green,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 6px 0 rgba(0,0,0,0.12)',
            }}
          >
            Войти или создать аккаунт
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              minHeight: 52,
              borderRadius: 18,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            Позже
          </button>
        </div>

        <div
          style={{
            marginTop: 13,
            borderRadius: 18,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softOrange,
            padding: 11,
            fontSize: 12,
            lineHeight: 1.35,
            fontWeight: 800,
            color: BRAND.navy,
          }}
        >
          Смотреть приложение можно без регистрации. Аккаунт нужен только для действий:
          лайки, сообщения, бронь, объявления, реклама, кошелёк и платежи.
        </div>
      </section>
    </div>
  );
}
