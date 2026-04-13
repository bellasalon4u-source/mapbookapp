'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getSavedLanguage,
  saveLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../../services/i18n';
import {
  getAppRegionSettings,
  updateAppRegionSettings,
  type AppCurrency,
  type SearchLocationMode,
} from '../../../services/appRegionStore';
import {
  getUserProfile,
  subscribeToUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../../services/userProfileStore';

type StoredLocation = {
  source: 'current' | 'custom';
  label: string;
  lat: number | null;
  lng: number | null;
};

type PageTextShape = {
  title: string;
  subtitle: string;
  save: string;
  languageSection: string;
  regionSection: string;
  currencySection: string;
  locationSection: string;
  useCurrentLocation: string;
  currentLocationHint: string;
  useRegionLocation: string;
  regionLocationHint: string;
  locationLoading: string;
  locationSuccess: string;
  locationError: string;
  saved: string;
  selected: string;
  languageApp: string;
  overview: string;
  livePreview: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
  londonEurope: string;
  madridEurope: string;
  pragueEurope: string;
  berlinEurope: string;
  warsawEurope: string;
  kyivEurope: string;
  newYorkNA: string;
  dubaiME: string;
  romeEurope: string;
  parisEurope: string;
};

type RegionOption = {
  value: string;
  label: string;
  subtitle: string;
  flag: string;
  lat: number;
  lng: number;
  currency: AppCurrency;
};

type CurrencyOption = {
  value: AppCurrency;
  symbol: string;
  title: string;
  subtitle: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Language & region',
    subtitle: 'App language, country, currency and location mode',
    save: 'Save',
    languageSection: 'Languages available in app',
    regionSection: 'Countries / regions',
    currencySection: 'Currency',
    locationSection: 'Location',
    useCurrentLocation: 'Use current location',
    currentLocationHint: 'Use your device GPS for search and map results',
    useRegionLocation: 'Use selected region',
    regionLocationHint: 'Search near the selected country or region center',
    locationLoading: 'Getting current location...',
    locationSuccess: 'Current location selected',
    locationError: 'Unable to get current location',
    saved: 'Settings saved',
    selected: 'Selected',
    languageApp: 'App language',
    overview: 'Current setup',
    livePreview: 'Live preview',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
    londonEurope: 'London · Europe',
    madridEurope: 'Madrid · Europe',
    pragueEurope: 'Prague · Europe',
    berlinEurope: 'Berlin · Europe',
    warsawEurope: 'Warsaw · Europe',
    kyivEurope: 'Kyiv · Europe',
    newYorkNA: 'New York · North America',
    dubaiME: 'Dubai · Middle East',
    rom
