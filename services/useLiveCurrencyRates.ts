'use client';

import { useEffect, useState } from 'react';
import { refreshLiveCurrencyRates } from './currencyDisplay';

export function useLiveCurrencyRates() {
  const [currencyRefreshVersion, setCurrencyRefreshVersion] = useState(0);

  useEffect(() => {
    let mounted = true;

    refreshLiveCurrencyRates().finally(() => {
      if (!mounted) return;
      setCurrencyRefreshVersion((prev) => prev + 1);
    });

    const handleFocus = () => {
      refreshLiveCurrencyRates().finally(() => {
        if (!mounted) return;
        setCurrencyRefreshVersion((prev) => prev + 1);
      });
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return currencyRefreshVersion;
}
