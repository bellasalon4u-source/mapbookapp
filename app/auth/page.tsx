'use client';

import { Suspense, useMemo, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createAccount, loginWithEmail } from '../../services/authStore';

const BRAND = {
  navy: '#071b46',
  green: '#24c45a',
  blue: '#0e73d8',
  red: '#ff2456',
  border: '#050505',
  muted: '#6c7686',
  softOrange: '#fff0da',
  softPink: '#ffe9f2',
};

type AuthMode = 'create' | 'login';

function OlamepLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/ui/logo/app-icon.svg"
        alt="Olamep"
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 16px rgba(7,27,70,0.12))',
        }}
      />

      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-1.2px',
          lineHeight: 1,
        }}
      >
        Olamep
      </div>
    </div>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = useMemo(() => {
    return searchParams.get('returnTo') || '/';
  }, [searchParams]);

  const [mode, setMode] = useState<AuthMode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');

  const isCreateMode = mode === 'create';

  const submit = () => {
    const result = isCreateMode
      ? createAccount({
          email,
          password,
          fullName,
          acceptedTerms,
          marketingConsent,
        })
      : loginWithEmail({
          email,
          password,
        });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    router.push(returnTo);
  };

  const continueWithGoogle = () => {
    const result = createAccount({
      email: 'google-user@olamep.com',
      password: 'google123',
      fullName: 'Google user',
      acceptedTerms: true,
      marketingConsent: false,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(returnTo);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #eef4ff 0%, #ffffff 42%, #fff1f4 100%)',
        color: BRAND.navy,
        fontFamily: 'Arial, sans-serif',
        padding: '18px 14px 40px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 25,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ←
          </button>

          <OlamepLogo />
        </header>

        <section style={{ marginTop: 26 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.4px',
              color: BRAND.navy,
            }}
          >
            {isCreateMode ? 'Создайте аккаунт' : 'Войти в аккаунт'}
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            Один аккаунт для поиска услуг, бронирования, сообщений, добавления
            объявлений, рекламы и платежей.
          </p>
        </section>

        <section
          style={{
            marginTop: 20,
            borderRadius: 30,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 15,
            boxShadow: '0 12px 28px rgba(7,27,70,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setError('');
              }}
              style={{
                minHeight: 46,
                borderRadius: 16,
                border: `2px solid ${BRAND.border}`,
                background: isCreateMode ? BRAND.green : '#ffffff',
                color: isCreateMode ? '#ffffff' : BRAND.navy,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Регистрация
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              style={{
                minHeight: 46,
                borderRadius: 16,
                border: `2px solid ${BRAND.border}`,
                background: !isCreateMode ? BRAND.blue : '#ffffff',
                color: !isCreateMode ? '#ffffff' : BRAND.navy,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Вход
            </button>
          </div>

          <button
            type="button"
            onClick={continueWithGoogle}
            style={{
              width: '100%',
              minHeight: 54,
              borderRadius: 18,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 5px 0 rgba(0,0,0,0.05)',
            }}
          >
            <span style={{ fontSize: 22 }}>G</span>
            Продолжить с Google
          </button>

          <div
            style={{
              margin: '14px 0',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 10,
              color: BRAND.muted,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            <span style={{ height: 2, background: '#e6e9ee' }} />
            or
            <span style={{ height: 2, background: '#e6e9ee' }} />
          </div>

          {isCreateMode ? (
            <label style={labelStyle}>
              Имя
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Alex"
                style={inputStyle}
              />
            </label>
          ) : null}

          <label style={{ ...labelStyle, marginTop: isCreateMode ? 12 : 0 }}>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              autoCapitalize="none"
              inputMode="email"
              style={inputStyle}
            />
          </label>

          <label style={{ ...labelStyle, marginTop: 12 }}>
            Пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              type="password"
              style={inputStyle}
            />
          </label>

          {isCreateMode ? (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  style={{ width: 20, height: 20, accentColor: BRAND.green }}
                />
                <span>
                  Я принимаю{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/profile/legal')}
                    style={linkButtonStyle}
                  >
                    Terms & Conditions
                  </button>{' '}
                  и{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/profile/legal')}
                    style={linkButtonStyle}
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              <label style={{ ...checkboxStyle, color: BRAND.muted }}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(event) => setMarketingConsent(event.target.checked)}
                  style={{ width: 20, height: 20, accentColor: BRAND.blue }}
                />
                <span>Хочу получать новости, предложения и обновления Olamep.</span>
              </label>
            </div>
          ) : null}

          {error ? (
            <div
              style={{
                marginTop: 13,
                borderRadius: 16,
                border: `2px solid ${BRAND.border}`,
                background: BRAND.softPink,
                color: BRAND.red,
                padding: 11,
                fontSize: 13,
                fontWeight: 900,
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={isCreateMode && !acceptedTerms}
            style={{
              marginTop: 15,
              width: '100%',
              minHeight: 56,
              borderRadius: 19,
              border: `2.5px solid ${BRAND.border}`,
              background: isCreateMode && !acceptedTerms ? '#d8dce2' : BRAND.green,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 900,
              cursor: isCreateMode && !acceptedTerms ? 'not-allowed' : 'pointer',
              boxShadow:
                isCreateMode && !acceptedTerms
                  ? 'none'
                  : '0 6px 0 rgba(0,0,0,0.12)',
            }}
          >
            {isCreateMode ? 'Создать аккаунт' : 'Войти'}
          </button>
        </section>

        <section
          style={{
            marginTop: 16,
            borderRadius: 22,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softOrange,
            padding: 13,
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 800,
            color: BRAND.navy,
          }}
        >
          Без регистрации можно смотреть приложение. Для лайков, сообщений,
          бронирований, объявлений, рекламы и платежей нужен аккаунт.
        </section>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthLoading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'Arial, sans-serif',
        color: BRAND.navy,
        fontSize: 22,
        fontWeight: 900,
      }}
    >
      Olamep
    </main>
  );
}

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: 7,
  fontSize: 12,
  fontWeight: 900,
  color: BRAND.muted,
};

const checkboxStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '24px 1fr',
  gap: 9,
  alignItems: 'start',
  fontSize: 12,
  lineHeight: 1.35,
  fontWeight: 800,
  color: BRAND.navy,
};

const inputStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 18,
  border: `2.5px solid ${BRAND.border}`,
  padding: '0 14px',
  fontSize: 15,
  fontWeight: 900,
  color: BRAND.navy,
  outline: 'none',
  background: '#ffffff',
};

const linkButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: BRAND.blue,
  fontSize: 12,
  fontWeight: 900,
  padding: 0,
  textDecoration: 'underline
