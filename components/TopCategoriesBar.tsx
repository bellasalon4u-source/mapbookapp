'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '../services/categories';
import { t, type AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  onClearSubcategory: () => void;
};

const horizontalOrder = [
  'beauty',
  'barber',
  'wellness',
  'home',
  'repairs',
  'tech',
  'pets',
  'fashion',
  'auto',
  'moving',
  'fitness',
  'education',
  'events',
  'activities',
  'creative',
];

const iconSrcMap: Record<string, string> = {
  more: '/ui/categories/more.png',
  beauty: '/ui/categories/beauty.png',
  barber: '/ui/categories/barber.png',
  wellness: '/ui/categories/wellness.png',
  home: '/ui/categories/home.png',
  repairs: '/ui/categories/repairs.png',
  tech: '/ui/categories/tech.png',
  pets: '/ui/categories/pets.png',
  fashion: '/ui/categories/fashion.png',
  auto: '/ui/categories/auto.png',
  moving: '/ui/categories/moving.png',
  fitness: '/ui/categories/fitness.png',
  education: '/ui/categories/education.png',
  events: '/ui/categories/events.png',
  activities: '/ui/categories/activities.png',
  creative: '/ui/categories/creative.png',
};

const colorMap: Record<string, string> = {
  beauty: '#ff4f93',
  barber: '#2d98ff',
  wellness: '#32c957',
  home: '#ff9f1a',
  repairs: '#f4b400',
  tech: '#9b5cff',
  pets: '#28c7d9',
  fashion: '#43d94d',
  auto: '#43d94d',
  moving: '#43d94d',
  fitness: '#43d94d',
  education: '#7d52ff',
  events: '#43d94d',
  activities: '#43d94d',
  creative: '#43d94d',
  more: '#173552',
};

function translateCategoryLabel(categoryId: string, language: AppLanguage, fallback?: string) {
  const map: Record<string, Record<AppLanguage, string>> = {
    beauty: {
      EN: 'Beauty',
      ES: 'Belleza',
      RU: 'Красота',
      UA: 'Краса',
      CZ: 'Krása',
      DE: 'Beauty',
      IT: 'Beauty',
      FR: 'Beauté',
      AR: 'الجمال',
      PL: 'Uroda',
    },
    barber: {
      EN: 'Barber',
      ES: 'Barbero',
      RU: 'Барбер',
      UA: 'Барбер',
      CZ: 'Barber',
      DE: 'Barber',
      IT: 'Barber',
      FR: 'Barbier',
      AR: 'حلاقة',
      PL: 'Barber',
    },
    wellness: {
      EN: 'Wellness',
      ES: 'Bienestar',
      RU: 'Велнес',
      UA: 'Велнес',
      CZ: 'Wellness',
      DE: 'Wellness',
      IT: 'Benessere',
      FR: 'Bien-être',
      AR: 'عافية',
      PL: 'Wellness',
    },
    home: {
      EN: 'Home',
      ES: 'Hogar',
      RU: 'Дом',
      UA: 'Дім',
      CZ: 'Domov',
      DE: 'Zuhause',
      IT: 'Casa',
      FR: 'Maison',
      AR: 'المنزل',
      PL: 'Dom',
    },
    repairs: {
      EN: 'Repairs',
      ES: 'Reparaciones',
      RU: 'Ремонт',
      UA: 'Ремонт',
      CZ: 'Opravy',
      DE: 'Reparaturen',
      IT: 'Riparazioni',
      FR: 'Réparations',
      AR: 'إصلاحات',
      PL: 'Naprawy',
    },
    tech: {
      EN: 'Tech',
      ES: 'Tecnología',
      RU: 'Техника',
      UA: 'Техніка',
      CZ: 'Techn
