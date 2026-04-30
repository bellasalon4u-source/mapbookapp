'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

function isUserRegistered() {
  if (typeof window === 'undefined') return false;

  const possibleKeys = [
    'olamepUserRegistered',
    'mapbookUserRegistered',
    'olamep_registered',
    'mapbook_registered',
    'olamep_auth_user',
    'mapbook_auth_user',
    'currentUser',
    'user',
  ];

  return possibleKeys.some((key) => {
    const value = window.localStorage.getItem(key);
    if (!value) return false;

    const normalized = value.toLowerCase().trim();

    return (
      normalized === 'yes' ||
      normalized === 'true' ||
      normalized === '1' ||
      normalized.includes('email') ||
      normalized.includes('phone') ||
      normalized.includes('name')
    );
  });
}

export default function NewDealProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isUserRegistered()) {
      router.replace(`/auth?next=${encodeURIComponent('/profile/deals/new')}`);
      return;
    }

    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
