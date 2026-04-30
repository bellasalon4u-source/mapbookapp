'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const OWNER_EMAIL = 'olamepcom@gmail.com';
const OWNER_CODE = 'OLAMEP-OWNER-2026';

const BRAND = {
  navy: '#071b46',
  green: '#24c45a',
  blue: '#0e73d8',
  yellow: '#ffd629',
  red: '#ff2456',
  pink: '#ff4f9a',
  border: '#050505',
  muted: '#6c7686',
  bg: '#ffffff',
  softGreen: '#dcffe8',
  softBlue: '#dcecff',
  softOrange: '#fff0da',
  softPink: '#ffe9f2',
};

function readNumberFromStorage(key: string, field: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const value = parsed?.[field];

    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function getStoredProfileEmail() {
  if (typeof window === 'undefined') return OWNER_EMAIL;

  try {
    const raw = window.localStorage.getItem('mapbook_user_profile');
    if (!raw) return OWNER_EMAIL;

    const parsed = JSON.parse(raw);
    return typeof parsed?.email === 'string' && parsed.email.trim()
      ? parsed.email.trim()
      : OWNER_EMAIL;
  } catch {
    return OWNER_EMAIL;
  }
}

function AdminLogo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 48,
          borderRadius: '50% 50% 58% 58%',
          background:
            'conic-gradient(from 210deg, #0e73d8 0deg, #24c45a 92deg, #ffd629 160deg, #ff4b72 230deg, #0e73d8 360deg)',
          position: 'relative',
          boxShadow: '0 10px 22px rgba(14,115,216,0.22)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: '#ffffff',
          }}
        />
      </div>

      <div
        style={{
          fontSize: 31,
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

function MetricCard({
  title,
  value,
  hint,
  icon,
  bg,
}: {
  title: string;
  value: string;
  hint: string;
  icon: string;
  bg: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background: bg,
        padding: 15,
        minHeight: 128,
        boxShadow: '0 8px 18px rgba(7,27,70,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 900,
          color: BRAND.muted,
        }}
      >
        <span style={{ fontSize: 24 }}>{icon}</span>
        {title}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 900,
          color: BRAND.navy,
          letterSpacing: '-0.8px',
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 12,
          lineHeight: 1.35,
          fontWeight: 800,
          color: BRAND.muted,
        }}
      >
        {hint}
      </div>
    </div>
  );
}

function AdminButton({
  title,
  hint,
  icon,
  onClick,
}: {
  title: string;
  hint: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 78,
        borderRadius: 22,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 13,
        display: 'grid',
        gridTemplateColumns: '50px minmax(0, 1fr) 22px',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 7px 18px rgba(7,27,70,0.05)',
      }}
    >
      <span
        style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          border: `2px solid ${BRAND.border}`,
          background: BRAND.softBlue,
          display: 'grid',
          placeItems: 'center',
          fontSize: 25,
        }}
      >
        {icon}
      </span>

      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 16,
            fontWeight: 900,
            color: BRAND.navy,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>

        <span
          style={{
            display: 'block',
            marginTop: 4,
            fontSize: 12,
            fontWeight: 800,
            color: BRAND.muted,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hint}
        </span>
      </span>

      <span
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: BRAND.border,
          lineHeight: 1,
        }}
      >
        ›
      </span>
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const availableBalance = readNumberFromStorage(
      'mapbook_wallet_state',
      'availableBalance',
      24
    );
    const pendingBalance = readNumberFromStorage(
      'mapbook_wallet_state',
      'pendingBalance',
      10
    );

    return {
      ownerEmail: getStoredProfileEmail(),
      availableBalance,
      pendingBalance,
      platformRevenue: Math.max(0, availableBalance * 0.12),
      totalGross: availableBalance + pendingBalance,
    };
  }, [isUnlocked]);

  const login = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (normalizedEmail !== OWNER_EMAIL || normalizedCode !== OWNER_CODE) {
      setError('Wrong owner email or access code.');
      return;
    }

    setError('');
    setIsUnlocked(true);
  };

  if (!isUnlocked) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: BRAND.bg,
          color: BRAND.navy,
          fontFamily: 'Arial, sans-serif',
          padding: '22px 14px',
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
              onClick={() => router.push('/')}
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

            <AdminLogo />
          </header>

          <section style={{ marginTop: 28 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '-1.4px',
              }}
            >
              Owner Admin
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
              Private access for Olamep owner. Manage platform money, users,
              services and system settings.
            </p>
          </section>

          <section
            style={{
              marginTop: 22,
              borderRadius: 30,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              padding: 16,
              boxShadow: '0 12px 28px rgba(7,27,70,0.08)',
            }}
          >
            <label
              style={{
                display: 'grid',
                gap: 7,
                fontSize: 12,
                fontWeight: 900,
                color: BRAND.muted,
              }}
            >
              Owner email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="olamepcom@gmail.com"
                autoCapitalize="none"
                style={{
                  minHeight: 54,
                  borderRadius: 18,
                  border: `2.5px solid ${BRAND.border}`,
                  padding: '0 14px',
                  fontSize: 15,
                  fontWeight: 900,
                  color: BRAND.navy,
                  outline: 'none',
                }}
              />
            </label>

            <label
              style={{
                marginTop: 13,
                display: 'grid',
                gap: 7,
                fontSize: 12,
                fontWeight: 900,
                color: BRAND.muted,
              }}
            >
              Access code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="OLAMEP-OWNER-2026"
                autoCapitalize="characters"
                style={{
                  minHeight: 54,
                  borderRadius: 18,
                  border: `2.5px solid ${BRAND.border}`,
                  padding: '0 14px',
                  fontSize: 15,
                  fontWeight: 900,
                  color: BRAND.navy,
                  outline: 'none',
                }}
              />
            </label>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  border: `2px solid ${BRAND.border}`,
                  background: '#ffe9f2',
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
              onClick={login}
              style={{
                marginTop: 15,
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
              Open admin panel
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
            Important: this is a front-end owner prototype. For real money and
            real users we must connect secure backend auth, database roles and
            Stripe/Supabase permissions.
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.bg,
        color: BRAND.navy,
        fontFamily: 'Arial, sans-serif',
        padding: '18px 14px 120px',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 48px',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
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

          <div style={{ textAlign: 'center' }}>
            <AdminLogo />
          </div>

          <button
            type="button"
            onClick={() => setIsUnlocked(false)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              fontSize: 22,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            🔒
          </button>
        </header>

        <section style={{ marginTop: 20 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: '-1.4px',
            }}
          >
            Admin panel
          </h1>

          <p
            style={{
              margin: '9px 0 0',
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 800,
              color: BRAND.muted,
            }}
          >
            Owner access: {OWNER_EMAIL}
          </p>
        </section>

        <section
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <MetricCard
            title="Available"
            value={`£${stats.availableBalance.toFixed(2)}`}
            hint="Money visible in site wallet"
            icon="💼"
            bg={BRAND.softOrange}
          />

          <MetricCard
            title="Pending"
            value={`£${stats.pendingBalance.toFixed(2)}`}
            hint="Payments waiting to clear"
            icon="⏳"
            bg={BRAND.softBlue}
          />

          <MetricCard
            title="Gross"
            value={`£${stats.totalGross.toFixed(2)}`}
            hint="Available + pending"
            icon="📊"
            bg={BRAND.softGreen}
          />

          <MetricCard
            title="Platform"
            value={`£${stats.platformRevenue.toFixed(2)}`}
            hint="Estimated platform revenue"
            icon="👑"
            bg={BRAND.softPink}
          />
        </section>

        <section
          style={{
            marginTop: 18,
            borderRadius: 26,
            border: `2.5px solid ${BRAND.border}`,
            background: '#ffffff',
            padding: 14,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 23,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            Owner tools
          </h2>

          <div
            style={{
              marginTop: 13,
              display: 'grid',
              gap: 10,
            }}
          >
            <AdminButton
              title="Open wallet"
              hint="Check balance and transaction history"
              icon="💰"
              onClick={() => router.push('/profile/wallet')}
            />

            <AdminButton
              title="Manage services"
              hint="Open all listings and service offers"
              icon="💼"
              onClick={() => router.push('/profile/listings')}
            />

            <AdminButton
              title="Promotions"
              hint="Ads, offers and paid visibility"
              icon="📣"
              onClick={() => router.push('/profile/promotions')}
            />

            <AdminButton
              title="Payments"
              hint="Cards, QR payments and methods"
              icon="💳"
              onClick={() => router.push('/profile/payments')}
            />

            <AdminButton
              title="Return to app"
              hint="Go back to public home page"
              icon="🏠"
              onClick={() => router.push('/')}
            />
          </div>
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
          Next security step: hide owner access behind real authentication, admin
          role, backend checks and server-side payment permissions.
        </section>
      </div>
    </main>
  );
}
