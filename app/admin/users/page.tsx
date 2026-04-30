'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  softViolet: '#f2edff',
  softGrey: '#f3f5f8',
};

type AdminUserStatus = 'active' | 'pending' | 'blocked';
type AdminUserRole = 'master' | 'client' | 'owner';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  city: string;
  balance: number;
  bookings: number;
  reports: number;
  verified: boolean;
  avatar: string;
};

const demoUsers: AdminUser[] = [
  {
    id: 'owner_1',
    name: 'Olamep Owner',
    email: 'olamepcom@gmail.com',
    phone: '+44 7700 000000',
    role: 'owner',
    status: 'active',
    city: 'London',
    balance: 240,
    bookings: 0,
    reports: 0,
    verified: true,
    avatar: '👑',
  },
  {
    id: 'master_1',
    name: 'Anna Hair Studio',
    email: 'anna@olamep.com',
    phone: '+44 7700 111111',
    role: 'master',
    status: 'active',
    city: 'London',
    balance: 180,
    bookings: 18,
    reports: 0,
    verified: true,
    avatar: '💇‍♀️',
  },
  {
    id: 'master_2',
    name: 'Mila Massage',
    email: 'mila@olamep.com',
    phone: '+44 7700 222222',
    role: 'master',
    status: 'pending',
    city: 'Manchester',
    balance: 75,
    bookings: 7,
    reports: 1,
    verified: false,
    avatar: '💆‍♀️',
  },
  {
    id: 'client_1',
    name: 'Sophie Williams',
    email: 'sophie@email.com',
    phone: '+44 7700 333333',
    role: 'client',
    status: 'active',
    city: 'London',
    balance: 35,
    bookings: 5,
    reports: 0,
    verified: true,
    avatar: '👩',
  },
  {
    id: 'client_2',
    name: 'Daniel Carter',
    email: 'daniel@email.com',
    phone: '+44 7700 444444',
    role: 'client',
    status: 'blocked',
    city: 'Birmingham',
    balance: 0,
    bookings: 2,
    reports: 3,
    verified: false,
    avatar: '👨',
  },
];

function formatMoney(value: number) {
  return `£${value.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function AdminLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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

function statusLabel(status: AdminUserStatus) {
  if (status === 'active') return 'Активен';
  if (status === 'pending') return 'На проверке';
  return 'Заблокирован';
}

function roleLabel(role: AdminUserRole) {
  if (role === 'owner') return 'Владелец';
  if (role === 'master') return 'Мастер';
  return 'Клиент';
}

function statusBg(status: AdminUserStatus) {
  if (status === 'active') return BRAND.softGreen;
  if (status === 'pending') return BRAND.softOrange;
  return BRAND.softPink;
}

function statusColor(status: AdminUserStatus) {
  if (status === 'active') return '#008f3a';
  if (status === 'pending') return '#a66a00';
  return BRAND.red;
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
        padding: 13,
        minHeight: 116,
        boxShadow: '0 8px 18px rgba(7,27,70,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 13,
          fontWeight: 900,
          color: BRAND.muted,
        }}
      >
        <span style={{ fontSize: 23, lineHeight: 1 }}>{icon}</span>
        {title}
      </div>

      <div
        style={{
          marginTop: 11,
          fontSize: 28,
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
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.3,
          fontWeight: 800,
          color: BRAND.muted,
        }}
      >
        {hint}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 999,
        border: `2px solid ${BRAND.border}`,
        background: active ? BRAND.navy : '#ffffff',
        color: active ? '#ffffff' : BRAND.navy,
        padding: '0 13px',
        fontSize: 13,
        fontWeight: 900,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function UserCard({
  user,
  onChangeStatus,
}: {
  user: AdminUser;
  onChangeStatus: (id: string, status: AdminUserStatus) => void;
}) {
  return (
    <article
      style={{
        borderRadius: 24,
        border: `2.5px solid ${BRAND.border}`,
        background: '#ffffff',
        padding: 13,
        boxShadow: '0 8px 18px rgba(7,27,70,0.05)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '58px minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            border: `2.5px solid ${BRAND.border}`,
            background: BRAND.softBlue,
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
            boxShadow: '0 5px 0 rgba(0,0,0,0.06)',
          }}
        >
          {user.avatar}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: BRAND.navy,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name}
            </div>

            {user.verified ? (
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  border: `2px solid ${BRAND.border}`,
                  background: BRAND.blue,
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 12.5,
              fontWeight: 800,
              color: BRAND.muted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.email}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              fontWeight: 800,
              color: BRAND.muted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.phone} · {user.city}
          </div>
        </div>

        <div
          style={{
            minHeight: 32,
            borderRadius: 999,
            border: `2px solid ${statusColor(user.status)}`,
            background: statusBg(user.status),
            color: statusColor(user.status),
            padding: '0 9px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel(user.status)}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softGrey,
            padding: 9,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, color: BRAND.muted }}>Роль</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900, color: BRAND.navy }}>
            {roleLabel(user.role)}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: `2px solid ${BRAND.border}`,
            background: BRAND.softGreen,
            padding: 9,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, color: BRAND.muted }}>Баланс</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900, color: BRAND.navy }}>
            {formatMoney(user.balance)}
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: `2px solid ${BRAND.border}`,
            background: user.reports > 0 ? BRAND.softPink : BRAND.softBlue,
            padding: 9,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, color: BRAND.muted }}>Жалобы</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 900,
              color: user.reports > 0 ? BRAND.red : BRAND.navy,
            }}
          >
            {user.reports}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 11,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => onChangeStatus(user.id, 'active')}
          disabled={user.status === 'active'}
          style={{
            minHeight: 38,
            borderRadius: 14,
            border: `2px solid ${BRAND.border}`,
            background: user.status === 'active' ? BRAND.softGreen : '#ffffff',
            color: '#008f3a',
            fontSize: 12,
            fontWeight: 900,
            cursor: user.status === 'active' ? 'default' : 'pointer',
          }}
        >
          Активировать
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus(user.id, 'pending')}
          disabled={user.status === 'pending'}
          style={{
            minHeight: 38,
            borderRadius: 14,
            border: `2px solid ${BRAND.border}`,
            background: user.status === 'pending' ? BRAND.softOrange : '#ffffff',
            color: '#a66a00',
            fontSize: 12,
            fontWeight: 900,
            cursor: user.status === 'pending' ? 'default' : 'pointer',
          }}
        >
          Проверка
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus(user.id, 'blocked')}
          disabled={user.status === 'blocked'}
          style={{
            minHeight: 38,
            borderRadius: 14,
            border: `2px solid ${BRAND.border}`,
            background: user.status === 'blocked' ? BRAND.softPink : '#ffffff',
            color: BRAND.red,
            fontSize: 12,
            fontWeight: 900,
            cursor: user.status === 'blocked' ? 'default' : 'pointer',
          }}
        >
          Блок
        </button>
      </div>
    </article>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>(demoUsers);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminUserStatus>('all');

  const stats = useMemo(() => {
    return {
      total: users.length,
      masters: users.filter((user) => user.role === 'master').length,
      clients: users.filter((user) => user.role === 'client').length,
      pending: users.filter((user) => user.status === 'pending').length,
      blocked: users.filter((user) => user.status === 'blocked').length,
      reports: users.reduce((sum, user) => sum + user.reports, 0),
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.phone.toLowerCase().includes(normalizedQuery) ||
        user.city.toLowerCase().includes(normalizedQuery);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  const changeStatus = (id: string, status: AdminUserStatus) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status } : user))
    );
  };

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
            onClick={() => router.push('/admin')}
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
            onClick={() => router.push('/')}
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
            ×
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
            Пользователи
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
            Клиенты, мастера, владелец, статусы, жалобы и проверка аккаунтов.
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
            title="Всего"
            value={String(stats.total)}
            hint="Все аккаунты"
            icon="👥"
            bg={BRAND.softBlue}
          />

          <MetricCard
            title="Мастера"
            value={String(stats.masters)}
            hint="Исполнители услуг"
            icon="💼"
            bg={BRAND.softGreen}
          />

          <MetricCard
            title="На проверке"
            value={String(stats.pending)}
            hint="Нужна модерация"
            icon="🛡️"
            bg={BRAND.softOrange}
          />

          <MetricCard
            title="Жалобы"
            value={String(stats.reports)}
            hint="Сигналы от пользователей"
            icon="🚨"
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
            Поиск и фильтры
          </h2>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя, email, телефон или город"
            style={{
              marginTop: 13,
              width: '100%',
              minHeight: 52,
              boxSizing: 'border-box',
              borderRadius: 18,
              border: `2.5px solid ${BRAND.border}`,
              background: '#ffffff',
              color: BRAND.navy,
              padding: '0 14px',
              fontSize: 14,
              fontWeight: 900,
              outline: 'none',
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            <FilterButton
              active={roleFilter === 'all'}
              label="Все роли"
              onClick={() => setRoleFilter('all')}
            />
            <FilterButton
              active={roleFilter === 'owner'}
              label="Владелец"
              onClick={() => setRoleFilter('owner')}
            />
            <FilterButton
              active={roleFilter === 'master'}
              label="Мастера"
              onClick={() => setRoleFilter('master')}
            />
            <FilterButton
              active={roleFilter === 'client'}
              label="Клиенты"
              onClick={() => setRoleFilter('client')}
            />
          </div>

          <div
            style={{
              marginTop: 8,
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            <FilterButton
              active={statusFilter === 'all'}
              label="Все статусы"
              onClick={() => setStatusFilter('all')}
            />
            <FilterButton
              active={statusFilter === 'active'}
              label="Активные"
              onClick={() => setStatusFilter('active')}
            />
            <FilterButton
              active={statusFilter === 'pending'}
              label="На проверке"
              onClick={() => setStatusFilter('pending')}
            />
            <FilterButton
              active={statusFilter === 'blocked'}
              label="Заблокированные"
              onClick={() => setStatusFilter('blocked')}
            />
          </div>
        </section>

        <section
          style={{
            marginTop: 18,
            display: 'grid',
            gap: 12,
          }}
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} onChangeStatus={changeStatus} />
            ))
          ) : (
            <div
              style={{
                borderRadius: 24,
                border: `2.5px solid ${BRAND.border}`,
                background: BRAND.softBlue,
                padding: 16,
                fontSize: 14,
                lineHeight: 1.4,
                fontWeight: 800,
                color: BRAND.navy,
              }}
            >
              Пользователи не найдены. Попробуй изменить поиск или фильтры.
            </div>
          )}
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
          Важно: сейчас это демо-управление пользователями на front-end. В реальной
          версии статусы, блокировки и роли должны сохраняться в базе данных и
          проверяться на backend.
        </section>
      </div>
    </main>
  );
}
