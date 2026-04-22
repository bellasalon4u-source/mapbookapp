'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/common/BottomNav';
import {
  getAppRegionSettings,
  updateAppRegionSettings,
  type AppCurrency,
} from '../../../services/appRegionStore';
import { getSavedLanguage, type AppLanguage } from '../../../services/i18n';

type PageTextShape = {
  title: string;
  subtitle: string;
  britishPound: string;
  euro: string;
  usDollar: string;
  polishZloty: string;
  czechKoruna: string;
  ukrainianHryvnia: string;
  uaeDirham: string;
  chineseYuan: string;
  swedishKrona: string;
  danishKrone: string;
};

const pageTexts: Record<AppLanguage, PageTextShape> = {
  EN: {
    title: 'Currency',
    subtitle: 'Choose app currency',
    britishPound: 'British Pound',
    euro: 'Euro',
    usDollar: 'US Dollar',
    polishZloty: 'Polish Zloty',
    czechKoruna: 'Czech Koruna',
    ukrainianHryvnia: 'Ukrainian Hryvnia',
    uaeDirham: 'UAE Dirham',
    chineseYuan: 'Chinese Yuan',
    swedishKrona: 'Swedish Krona',
    danishKrone: 'Danish Krone',
  },
  ES: {
    title: 'Moneda',
    subtitle: 'Elige la moneda de la aplicación',
    britishPound: 'Libra esterlina',
    euro: 'Euro',
    usDollar: 'Dólar estadounidense',
    polishZloty: 'Zloty polaco',
    czechKoruna: 'Corona checa',
    ukrainianHryvnia: 'Grivna ucraniana',
    uaeDirham: 'Dirham de EAU',
    chineseYuan: 'Yuan chino',
    swedishKrona: 'Corona sueca',
    danishKrone: 'Corona danesa',
  },
  RU: {
    title: 'Валюта',
    subtitle: 'Выберите валюту приложения',
    britishPound: 'Британский фунт',
    euro: 'Евро',
    usDollar: 'Доллар США',
    polishZloty: 'Польский злотый',
    czechKoruna: 'Чешская крона',
    ukrainianHryvnia: 'Украинская гривна',
    uaeDirham: 'Дирхам ОАЭ',
    chineseYuan: 'Китайский юань',
    swedishKrona: 'Шведская крона',
    danishKrone: 'Датская крона',
  },
  UA: {
    title: 'Валюта',
    subtitle: 'Оберіть валюту застосунку',
    britishPound: 'Британський фунт',
    euro: 'Євро',
    usDollar: 'Долар США',
    polishZloty: 'Польський злотий',
    czechKoruna: 'Чеська крона',
    ukrainianHryvnia: 'Українська гривня',
    uaeDirham: 'Дирхам ОАЕ',
    chineseYuan: 'Китайський юань',
    swedishKrona: 'Шведська крона',
    danishKrone: 'Данська крона',
  },
  CZ: {
    title: 'Měna',
    subtitle: 'Vyberte měnu aplikace',
    britishPound: 'Britská libra',
    euro: 'Euro',
    usDollar: 'Americký dolar',
    polishZloty: 'Polský zlotý',
    czechKoruna: 'Česká koruna',
    ukrainianHryvnia: 'Ukrajinská hřivna',
    uaeDirham: 'Dirham SAE',
    chineseYuan: 'Čínský jüan',
    swedishKrona: 'Švédská koruna',
    danishKrone: 'Dánská koruna',
  },
  DE: {
    title: 'Währung',
    subtitle: 'Wähle die App-Währung',
    britishPound: 'Britisches Pfund',
    euro: 'Euro',
    usDollar: 'US-Dollar',
    polishZloty: 'Polnischer Zloty',
    czechKoruna: 'Tschechische Krone',
    ukrainianHryvnia: 'Ukrainische Hrywnja',
    uaeDirham: 'VAE-Dirham',
    chineseYuan: 'Chinesischer Yuan',
    swedishKrona: 'Schwedische Krone',
    danishKrone: 'Dänische Krone',
  },
  IT: {
    title: 'Valuta',
    subtitle: 'Scegli la valuta dell’app',
    britishPound: 'Sterlina britannica',
    euro: 'Euro',
    usDollar: 'Dollaro USA',
    polishZloty: 'Zloty polacco',
    czechKoruna: 'Corona ceca',
    ukrainianHryvnia: 'Grivnia ucraina',
    uaeDirham: 'Dirham EAU',
    chineseYuan: 'Yuan cinese',
    swedishKrona: 'Corona svedese',
    danishKrone: 'Corona danese',
  },
  FR: {
    title: 'Devise',
    subtitle: 'Choisissez la devise de l’application',
    britishPound: 'Livre sterling',
    euro: 'Euro',
    usDollar: 'Dollar américain',
    polishZloty: 'Zloty polonais',
    czechKoruna: 'Couronne tchèque',
    ukrainianHryvnia: 'Hryvnia ukrainienne',
    uaeDirham: 'Dirham EAU',
    chineseYuan: 'Yuan chinois',
    swedishKrona: 'Couronne suédoise',
    danishKrone: 'Couronne danoise',
  },
  AR: {
    title: 'العملة',
    subtitle: 'اختر عملة التطبيق',
    britishPound: 'الجنيه البريطاني',
    euro: 'اليورو',
    usDollar: 'الدولار الأمريكي',
    polishZloty: 'الزلوتي البولندي',
    czechKoruna: 'الكرونة التشيكية',
    ukrainianHryvnia: 'الهريفنيا الأوكرانية',
    uaeDirham: 'الدرهم الإماراتي',
    chineseYuan: 'اليوان الصيني',
    swedishKrona: 'الكرونة السويدية',
    danishKrone: 'الكرونة الدنماركية',
  },
  PL: {
    title: 'Waluta',
    subtitle: 'Wybierz walutę aplikacji',
    britishPound: 'Funt brytyjski',
    euro: 'Euro',
    usDollar: 'Dolar amerykański',
    polishZloty: 'Złoty polski',
    czechKoruna: 'Korona czeska',
    ukrainianHryvnia: 'Hrywna ukraińska',
    uaeDirham: 'Dirham ZEA',
    chineseYuan: 'Juan chiński',
    swedishKrona: 'Korona szwedzka',
    danishKrone: 'Korona duńska',
  },
};

type CurrencyOption = {
  value: AppCurrency;
  symbol: string;
  title: string;
  subtitle: string;
};

function getCurrencyOptions(text: PageTextShape): CurrencyOption[] {
  return [
    { value: 'GBP', symbol: '£', title: 'GBP', subtitle: text.britishPound },
    { value: 'EUR', symbol: '€', title: 'EUR', subtitle: text.euro },
    { value: 'USD', symbol: '$', title: 'USD', subtitle: text.usDollar },
    { value: 'PLN', symbol: 'zł', title: 'PLN', subtitle: text.polishZloty },
    { value: 'CZK', symbol: 'Kč', title: 'CZK', subtitle: text.czechKoruna },
    { value: 'UAH', symbol: '₴', title: 'UAH', subtitle: text.ukrainianHryvnia },
    { value: 'AED', symbol: 'AED', title: 'AED', subtitle: text.uaeDirham },
    { value: 'CNY', symbol: 'CN¥', title: 'C
