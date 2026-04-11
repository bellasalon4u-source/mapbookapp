'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addListing } from '../../services/listingsStore';
import {
  getSavedLanguage,
  subscribeToLanguageChange,
  type AppLanguage,
} from '../../services/i18n';

const categoriesByLanguage: Record<
  AppLanguage,
  {
    value: string;
    label: string;
    icon: string;
  }[]
> = {
  EN: [
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Home', icon: '🏠' },
    { value: 'Repairs', label: 'Repairs', icon: '🛠️' },
    { value: 'Tech', label: 'Tech', icon: '📱' },
    { value: 'Pets', label: 'Pets', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Moving', icon: '📦' },
    { value: 'Activities', label: 'Activities', icon: '🎯' },
    { value: 'Events', label: 'Events', icon: '🎉' },
    { value: 'Creative', label: 'Creative', icon: '🎨' },
  ],
  RU: [
    { value: 'Beauty', label: 'Красота', icon: '💄' },
    { value: 'Wellness', label: 'Велнес', icon: '🧘' },
    { value: 'Home', label: 'Дом', icon: '🏠' },
    { value: 'Repairs', label: 'Ремонт', icon: '🛠️' },
    { value: 'Tech', label: 'Техника', icon: '📱' },
    { value: 'Pets', label: 'Питомцы', icon: '🐾' },
    { value: 'Auto', label: 'Авто', icon: '🚗' },
    { value: 'Moving', label: 'Переезд', icon: '📦' },
    { value: 'Activities', label: 'Активности', icon: '🎯' },
    { value: 'Events', label: 'События', icon: '🎉' },
    { value: 'Creative', label: 'Креатив', icon: '🎨' },
  ],
  ES: [
    { value: 'Beauty', label: 'Belleza', icon: '💄' },
    { value: 'Wellness', label: 'Bienestar', icon: '🧘' },
    { value: 'Home', label: 'Hogar', icon: '🏠' },
    { value: 'Repairs', label: 'Reparaciones', icon: '🛠️' },
    { value: 'Tech', label: 'Tecnología', icon: '📱' },
    { value: 'Pets', label: 'Mascotas', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Mudanza', icon: '📦' },
    { value: 'Activities', label: 'Actividades', icon: '🎯' },
    { value: 'Events', label: 'Eventos', icon: '🎉' },
    { value: 'Creative', label: 'Creativo', icon: '🎨' },
  ],
  CZ: [
    { value: 'Beauty', label: 'Krása', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Domov', icon: '🏠' },
    { value: 'Repairs', label: 'Opravy', icon: '🛠️' },
    { value: 'Tech', label: 'Technika', icon: '📱' },
    { value: 'Pets', label: 'Mazlíčci', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Stěhování', icon: '📦' },
    { value: 'Activities', label: 'Aktivity', icon: '🎯' },
    { value: 'Events', label: 'Události', icon: '🎉' },
    { value: 'Creative', label: 'Kreativa', icon: '🎨' },
  ],
  DE: [
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Zuhause', icon: '🏠' },
    { value: 'Repairs', label: 'Reparaturen', icon: '🛠️' },
    { value: 'Tech', label: 'Technik', icon: '📱' },
    { value: 'Pets', label: 'Haustiere', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Umzug', icon: '📦' },
    { value: 'Activities', label: 'Aktivitäten', icon: '🎯' },
    { value: 'Events', label: 'Events', icon: '🎉' },
    { value: 'Creative', label: 'Kreativ', icon: '🎨' },
  ],
  PL: [
    { value: 'Beauty', label: 'Uroda', icon: '💄' },
    { value: 'Wellness', label: 'Wellness', icon: '🧘' },
    { value: 'Home', label: 'Dom', icon: '🏠' },
    { value: 'Repairs', label: 'Naprawy', icon: '🛠️' },
    { value: 'Tech', label: 'Technika', icon: '📱' },
    { value: 'Pets', label: 'Zwierzęta', icon: '🐾' },
    { value: 'Auto', label: 'Auto', icon: '🚗' },
    { value: 'Moving', label: 'Przeprowadzka', icon: '📦' },
    { value: 'Activities', label: 'Aktywności', icon: '🎯' },
    { value: 'Events', label: 'Wydarzenia', icon: '🎉' },
    { value: 'Creative', label: 'Kreatywne', icon: '🎨' },
  ],
};

const subcategoriesByCategory: Record<
  string,
  Record<AppLanguage, { value: string; label: string }[]>
> = {
  Beauty: {
    EN: [
      { value: 'Hair', label: 'Hair' },
      { value: 'Nails', label: 'Nails' },
      { value: 'Brows', label: 'Brows' },
      { value: 'Lashes', label: 'Lashes' },
      { value: 'Makeup', label: 'Makeup' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    RU: [
      { value: 'Hair', label: 'Волосы' },
      { value: 'Nails', label: 'Ногти' },
      { value: 'Brows', label: 'Брови' },
      { value: 'Lashes', label: 'Ресницы' },
      { value: 'Makeup', label: 'Макияж' },
      { value: 'Keratin', label: 'Кератин' },
    ],
    ES: [
      { value: 'Hair', label: 'Cabello' },
      { value: 'Nails', label: 'Uñas' },
      { value: 'Brows', label: 'Cejas' },
      { value: 'Lashes', label: 'Pestañas' },
      { value: 'Makeup', label: 'Maquillaje' },
      { value: 'Keratin', label: 'Keratina' },
    ],
    CZ: [
      { value: 'Hair', label: 'Vlasy' },
      { value: 'Nails', label: 'Nehty' },
      { value: 'Brows', label: 'Obočí' },
      { value: 'Lashes', label: 'Řasy' },
      { value: 'Makeup', label: 'Make-up' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    DE: [
      { value: 'Hair', label: 'Haare' },
      { value: 'Nails', label: 'Nägel' },
      { value: 'Brows', label: 'Augenbrauen' },
      { value: 'Lashes', label: 'Wimpern' },
      { value: 'Makeup', label: 'Make-up' },
      { value: 'Keratin', label: 'Keratin' },
    ],
    PL: [
      { value: 'Hair', label: 'Włosy' },
      { value: 'Nails', label: 'Paznokcie' },
      { value: 'Brows', label: 'Brwi' },
      { value: 'Lashes', label: 'Rzęsy' },
      { value: 'Makeup', label: 'Makijaż' },
      { value: 'Keratin', label: 'Keratyna' },
    ],
  },
  Wellness: {
    EN: [
      { value: 'Massage', label: 'Massage' },
      { value: 'Spa', label: 'Spa' },
      { value: 'Therapy', label: 'Therapy' },
      { value: 'Recovery', label: 'Recovery' },
      { value: 'Yoga', label: 'Yoga' },
    ],
    RU: [
      { value: 'Massage', label: 'Массаж' },
      { value: 'Spa', label: 'Спа' },
      { value: 'Therapy', label: 'Терапия' },
      { value: 'Recovery', label: 'Восстановление' },
      { value: 'Yoga', label: 'Йога' },
    ],
    ES: [
      { value: 'Massage', label: 'Masaje' },
      { value: 'Spa', label: 'Spa' },
      { value: 'Therapy', label: 'Terapia' },
      { value: 'Recovery', label: 'Recuperación' },
      { value: 'Yoga', label: 'Yoga' },
    ],
    CZ: [
      { value: 'Massage', label: 'Masáž' },
      { value: 'Spa', label: 'Spa' },
      { value: 'Therapy', label: 'Terapie' },
      { value: 'Recovery', label: 'Regenerace' },
      { value: 'Yoga', label: 'Jóga' },
    ],
    DE: [
      { value: 'Massage', label: 'Massage' },
      { value: 'Spa', label: 'Spa' },
      { value: 'Therapy', label: 'Therapie' },
      { value: 'Recovery', label: 'Erholung' },
      { value: 'Yoga', label: 'Yoga' },
    ],
    PL: [
      { value: 'Massage', label: 'Masaż' },
      { value: 'Spa', label: 'Spa' },
      { value: 'Therapy', label: 'Terapia' },
      { value: 'Recovery', label: 'Regeneracja' },
      { value: 'Yoga', label: 'Joga' },
    ],
  },
  Home: {
    EN: [
      { value: 'Cleaning', label: 'Cleaning' },
      { value: 'Handyman', label: 'Handyman' },
      { value: 'Plumbing', label: 'Plumbing' },
      { value: 'Electrical', label: 'Electrical' },
      { value: 'Furniture assembly', label: 'Furniture assembly' },
    ],
    RU: [
      { value: 'Cleaning', label: 'Уборка' },
      { value: 'Handyman', label: 'Мастер на час' },
      { value: 'Plumbing', label: 'Сантехника' },
      { value: 'Electrical', label: 'Электрика' },
      { value: 'Furniture assembly', label: 'Сборка мебели' },
    ],
    ES: [
      { value: 'Cleaning', label: 'Limpieza' },
      { value: 'Handyman', label: 'Manitas' },
      { value: 'Plumbing', label: 'Fontanería' },
      { value: 'Electrical', label: 'Electricidad' },
      { value: 'Furniture assembly', label: 'Montaje de muebles' },
    ],
    CZ: [
      { value: 'Cleaning', label: 'Úklid' },
      { value: 'Handyman', label: 'Hodinový manžel' },
      { value: 'Plumbing', label: 'Instalatérství' },
      { value: 'Electrical', label: 'Elektroinstalace' },
      { value: 'Furniture assembly', label: 'Montáž nábytku' },
    ],
    DE: [
      { value: 'Cleaning', label: 'Reinigung' },
      { value: 'Handyman', label: 'Handwerker' },
      { value: 'Plumbing', label: 'Sanitär' },
      { value: 'Electrical', label: 'Elektrik' },
      { value: 'Furniture assembly', label: 'Möbelmontage' },
    ],
    PL: [
      { value: 'Cleaning', label: 'Sprzątanie' },
      { value: 'Handyman', label: 'Złota rączka' },
      { value: 'Plumbing', label: 'Hydraulika' },
      { value: 'Electrical', label: 'Elektryka' },
      { value: 'Furniture assembly', label: 'Montaż mebli' },
    ],
  },
  Repairs: {
    EN: [
      { value: 'Appliance repair', label: 'Appliance repair' },
      { value: 'Phone repair', label: 'Phone repair' },
      { value: 'Laptop repair', label: 'Laptop repair' },
      { value: 'TV repair', label: 'TV repair' },
      { value: 'Shoe repair', label: 'Shoe repair' },
    ],
    RU: [
      { value: 'Appliance repair', label: 'Ремонт техники' },
      { value: 'Phone repair', label: 'Ремонт телефона' },
      { value: 'Laptop repair', label: 'Ремонт ноутбука' },
      { value: 'TV repair', label: 'Ремонт ТВ' },
      { value: 'Shoe repair', label: 'Ремонт обуви' },
    ],
    ES: [
      { value: 'Appliance repair', label: 'Reparación de electrodomésticos' },
      { value: 'Phone repair', label: 'Reparación de teléfono' },
      { value: 'Laptop repair', label: 'Reparación de portátil' },
      { value: 'TV repair', label: 'Reparación de TV' },
      { value: 'Shoe repair', label: 'Reparación de calzado' },
    ],
    CZ: [
      { value: 'Appliance repair', label: 'Oprava spotřebičů' },
      { value: 'Phone repair', label: 'Oprava telefonu' },
      { value: 'Laptop repair', label: 'Oprava notebooku' },
      { value: 'TV repair', label: 'Oprava TV' },
      { value: 'Shoe repair', label: 'Oprava obuvi' },
    ],
    DE: [
      { value: 'Appliance repair', label: 'Gerätereparatur' },
      { value: 'Phone repair', label: 'Handyreparatur' },
      { value: 'Laptop repair', label: 'Laptop-Reparatur' },
      { value: 'TV repair', label: 'TV-Reparatur' },
      { value: 'Shoe repair', label: 'Schuhreparatur' },
    ],
    PL: [
      { value: 'Appliance repair', label: 'Naprawa sprzętu' },
      { value: 'Phone repair', label: 'Naprawa telefonu' },
      { value: 'Laptop repair', label: 'Naprawa laptopa' },
      { value: 'TV repair', label: 'Naprawa TV' },
      { value: 'Shoe repair', label: 'Naprawa obuwia' },
    ],
  },
  Tech: {
    EN: [
      { value: 'Phone', label: 'Phone' },
      { value: 'Laptop', label: 'Laptop' },
      { value: 'Tablet', label: 'Tablet' },
      { value: 'Computer help', label: 'Computer help' },
      { value: 'Setup', label: 'Setup' },
    ],
    RU: [
      { value: 'Phone', label: 'Телефон' },
      { value: 'Laptop', label: 'Ноутбук' },
      { value: 'Tablet', label: 'Планшет' },
      { value: 'Computer help', label: 'Помощь с компьютером' },
      { value: 'Setup', label: 'Настройка' },
    ],
    ES: [
      { value: 'Phone', label: 'Teléfono' },
      { value: 'Laptop', label: 'Portátil' },
      { value: 'Tablet', label: 'Tablet' },
      { value: 'Computer help', label: 'Ayuda con ordenador' },
      { value: 'Setup', label: 'Configuración' },
    ],
    CZ: [
      { value: 'Phone', label: 'Telefon' },
      { value: 'Laptop', label: 'Notebook' },
      { value: 'Tablet', label: 'Tablet' },
      { value: 'Computer help', label: 'Pomoc s počítačem' },
      { value: 'Setup', label: 'Nastavení' },
    ],
    DE: [
      { value: 'Phone', label: 'Telefon' },
      { value: 'Laptop', label: 'Laptop' },
      { value: 'Tablet', label: 'Tablet' },
      { value: 'Computer help', label: 'Computerhilfe' },
      { value: 'Setup', label: 'Einrichtung' },
    ],
    PL: [
      { value: 'Phone', label: 'Telefon' },
      { value: 'Laptop', label: 'Laptop' },
      { value: 'Tablet', label: 'Tablet' },
      { value: 'Computer help', label: 'Pomoc komputerowa' },
      { value: 'Setup', label: 'Konfiguracja' },
    ],
  },
  Pets: {
    EN: [
      { value: 'Grooming', label: 'Grooming' },
      { value: 'Dog walking', label: 'Dog walking' },
      { value: 'Pet sitting', label: 'Pet sitting' },
      { value: 'Pet taxi', label: 'Pet taxi' },
      { value: 'Training', label: 'Training' },
    ],
    RU: [
      { value: 'Grooming', label: 'Груминг' },
      { value: 'Dog walking', label: 'Выгул собак' },
      { value: 'Pet sitting', label: 'Передержка' },
      { value: 'Pet taxi', label: 'Пет-такси' },
      { value: 'Training', label: 'Дрессировка' },
    ],
    ES: [
      { value: 'Grooming', label: 'Peluquería' },
      { value: 'Dog walking', label: 'Paseo de perros' },
      { value: 'Pet sitting', label: 'Cuidado de mascotas' },
      { value: 'Pet taxi', label: 'Taxi para mascotas' },
      { value: 'Training', label: 'Entrenamiento' },
    ],
    CZ: [
      { value: 'Grooming', label: 'Grooming' },
      { value: 'Dog walking', label: 'Venčení psů' },
      { value: 'Pet sitting', label: 'Hlídání mazlíčků' },
      { value: 'Pet taxi', label: 'Pet taxi' },
      { value: 'Training', label: 'Trénink' },
    ],
    DE: [
      { value: 'Grooming', label: 'Grooming' },
      { value: 'Dog walking', label: 'Hundespaziergang' },
      { value: 'Pet sitting', label: 'Tiersitting' },
      { value: 'Pet taxi', label: 'Tier-Taxi' },
      { value: 'Training', label: 'Training' },
    ],
    PL: [
      { value: 'Grooming', label: 'Grooming' },
      { value: 'Dog walking', label: 'Wyprowadzanie psów' },
      { value: 'Pet sitting', label: 'Opieka nad zwierzętami' },
      { value: 'Pet taxi', label: 'Taxi dla zwierząt' },
      { value: 'Training', label: 'Trening' },
    ],
  },
  Auto: {
    EN: [
      { value: 'Car wash', label: 'Car wash' },
      { value: 'Detailing', label: 'Detailing' },
      { value: 'Diagnostics', label: 'Diagnostics' },
      { value: 'Tire service', label: 'Tire service' },
    ],
    RU: [
      { value: 'Car wash', label: 'Мойка авто' },
      { value: 'Detailing', label: 'Детейлинг' },
      { value: 'Diagnostics', label: 'Диагностика' },
      { value: 'Tire service', label: 'Шиномонтаж' },
    ],
    ES: [
      { value: 'Car wash', label: 'Lavado de coche' },
      { value: 'Detailing', label: 'Detailing' },
      { value: 'Diagnostics', label: 'Diagnóstico' },
      { value: 'Tire service', label: 'Servicio de neumáticos' },
    ],
    CZ: [
      { value: 'Car wash', label: 'Mytí auta' },
      { value: 'Detailing', label: 'Detailing' },
      { value: 'Diagnostics', label: 'Diagnostika' },
      { value: 'Tire service', label: 'Pneuservis' },
    ],
    DE: [
      { value: 'Car wash', label: 'Autowäsche' },
      { value: 'Detailing', label: 'Detailing' },
      { value: 'Diagnostics', label: 'Diagnose' },
      { value: 'Tire service', label: 'Reifenservice' },
    ],
    PL: [
      { value: 'Car wash', label: 'Myjnia' },
      { value: 'Detailing', label: 'Detailing' },
      { value: 'Diagnostics', label: 'Diagnostyka' },
      { value: 'Tire service', label: 'Serwis opon' },
    ],
  },
  Moving: {
    EN: [
      { value: 'Delivery', label: 'Delivery' },
      { value: 'Moving help', label: 'Moving help' },
      { value: 'Furniture transport', label: 'Furniture transport' },
      { value: 'Courier', label: 'Courier' },
    ],
    RU: [
      { value: 'Delivery', label: 'Доставка' },
      { value: 'Moving help', label: 'Помощь с переездом' },
      { value: 'Furniture transport', label: 'Перевозка мебели' },
      { value: 'Courier', label: 'Курьер' },
    ],
    ES: [
      { value: 'Delivery', label: 'Entrega' },
      { value: 'Moving help', label: 'Ayuda con mudanza' },
      { value: 'Furniture transport', label: 'Transporte de muebles' },
      { value: 'Courier', label: 'Mensajero' },
    ],
    CZ: [
      { value: 'Delivery', label: 'Doručení' },
      { value: 'Moving help', label: 'Pomoc se stěhováním' },
      { value: 'Furniture transport', label: 'Převoz nábytku' },
      { value: 'Courier', label: 'Kurýr' },
    ],
    DE: [
      { value: 'Delivery', label: 'Lieferung' },
      { value: 'Moving help', label: 'Umzugshilfe' },
      { value: 'Furniture transport', label: 'Möbeltransport' },
      { value: 'Courier', label: 'Kurier' },
    ],
    PL: [
      { value: 'Delivery', label: 'Dostawa' },
      { value: 'Moving help', label: 'Pomoc przy przeprowadzce' },
      { value: 'Furniture transport', label: 'Transport mebli' },
      { value: 'Courier', label: 'Kurier' },
    ],
  },
  Activities: {
    EN: [
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Dance', label: 'Dance' },
      { value: 'Tutor', label: 'Tutor' },
      { value: 'Kids activities', label: 'Kids activities' },
    ],
    RU: [
      { value: 'Fitness', label: 'Фитнес' },
      { value: 'Dance', label: 'Танцы' },
      { value: 'Tutor', label: 'Репетитор' },
      { value: 'Kids activities', label: 'Детские активности' },
    ],
    ES: [
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Dance', label: 'Baile' },
      { value: 'Tutor', label: 'Tutor' },
      { value: 'Kids activities', label: 'Actividades para niños' },
    ],
    CZ: [
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Dance', label: 'Tanec' },
      { value: 'Tutor', label: 'Lektor' },
      { value: 'Kids activities', label: 'Dětské aktivity' },
    ],
    DE: [
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Dance', label: 'Tanz' },
      { value: 'Tutor', label: 'Tutor' },
      { value: 'Kids activities', label: 'Kinderaktivitäten' },
    ],
    PL: [
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Dance', label: 'Taniec' },
      { value: 'Tutor', label: 'Korepetytor' },
      { value: 'Kids activities', label: 'Aktywności dla dzieci' },
    ],
  },
  Events: {
    EN: [
      { value: 'Decorator', label: 'Decorator' },
      { value: 'Host', label: 'Host' },
      { value: 'Photographer', label: 'Photographer' },
      { value: 'Makeup for events', label: 'Makeup for events' },
    ],
    RU: [
      { value: 'Decorator', label: 'Декоратор' },
      { value: 'Host', label: 'Ведущий' },
      { value: 'Photographer', label: 'Фотограф' },
      { value: 'Makeup for events', label: 'Макияж для мероприятий' },
    ],
    ES: [
      { value: 'Decorator', label: 'Decorador' },
      { value: 'Host', label: 'Anfitrión' },
      { value: 'Photographer', label: 'Fotógrafo' },
      { value: 'Makeup for events', label: 'Maquillaje para eventos' },
    ],
    CZ: [
      { value: 'Decorator', label: 'Dekoratér' },
      { value: 'Host', label: 'Moderátor' },
      { value: 'Photographer', label: 'Fotograf' },
      { value: 'Makeup for events', label: 'Make-up na akce' },
    ],
    DE: [
      { value: 'Decorator', label: 'Dekorateur' },
      { value: 'Host', label: 'Moderator' },
      { value: 'Photographer', label: 'Fotograf' },
      { value: 'Makeup for events', label: 'Make-up für Events' },
    ],
    PL: [
      { value: 'Decorator', label: 'Dekorator' },
      { value: 'Host', label: 'Prowadzący' },
      { value: 'Photographer', label: 'Fotograf' },
      { value: 'Makeup for events', label: 'Makijaż na wydarzenia' },
    ],
  },
  Creative: {
    EN: [
      { value: 'Design', label: 'Design' },
      { value: 'Photo', label: 'Photo' },
      { value: 'Video', label: 'Video' },
      { value: 'Editing', label: 'Editing' },
      { value: 'Content creation', label: 'Content creation' },
    ],
    RU: [
      { value: 'Design', label: 'Дизайн' },
      { value: 'Photo', label: 'Фото' },
      { value: 'Video', label: 'Видео' },
      { value: 'Editing', label: 'Монтаж' },
      { value: 'Content creation', label: 'Создание контента' },
    ],
    ES: [
      { value: 'Design', label: 'Diseño' },
      { value: 'Photo', label: 'Foto' },
      { value: 'Video', label: 'Vídeo' },
      { value: 'Editing', label: 'Edición' },
      { value: 'Content creation', label: 'Creación de contenido' },
    ],
    CZ: [
      { value: 'Design', label: 'Design' },
      { value: 'Photo', label: 'Foto' },
      { value: 'Video', label: 'Video' },
      { value: 'Editing', label: 'Editace' },
      { value: 'Content creation', label: 'Tvorba obsahu' },
    ],
    DE: [
      { value: 'Design', label: 'Design' },
      { value: 'Photo', label: 'Foto' },
      { value: 'Video', label: 'Video' },
      { value: 'Editing', label: 'Bearbeitung' },
      { value: 'Content creation', label: 'Content-Erstellung' },
    ],
    PL: [
      { value: 'Design', label: 'Design' },
      { value: 'Photo', label: 'Zdjęcia' },
      { value: 'Video', label: 'Wideo' },
      { value: 'Editing', label: 'Edycja' },
      { value: 'Content creation', label: 'Tworzenie treści' },
    ],
  },
};

const pageTexts: Record<
  AppLanguage,
  {
    title: string;
    subtitle: string;
    photosSection: string;
    photosHint: string;
    uploadPhotos: string;
    tapMainPhotoHint: string;
    mainPhoto: string;
    deletePhoto: string;
    requiredFieldsHint: string;
    serviceTitle: string;
    serviceTitlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    category: string;
    subcategory: string;
    price: string;
    pricePlaceholder: string;
    location: string;
    locationPlaceholder: string;
    hours: string;
    hoursPlaceholder: string;
    availableToday: string;
    availableTodayHint: string;
    atClient: string;
    atMyPlace: string;
    online: string;
    paymentMethods: string;
    paymentMethodsHint: string;
    cash: string;
    card: string;
    wallet: string;
    contact: string;
    contactHint: string;
    phone: string;
    whatsapp: string;
    businessWhatsapp: string;
    telegram: string;
    viber: string;
    instagram: string;
    website: string;
    email: string;
    publishService: string;
    pleaseEnterServiceTitle: string;
    pleaseEnterPrice: string;
    servicePublishedSuccessfully: string;
  }
> = {
  EN: {
    title: 'Add your service',
    subtitle: 'Create a strong listing for clients nearby',
    photosSection: 'Photos',
    photosHint: 'Add great photos to get more views',
    uploadPhotos: 'Upload photos',
    tapMainPhotoHint: 'Tap any photo to make it main',
    mainPhoto: 'Main',
    deletePhoto: 'Delete photo',
    requiredFieldsHint: '* Required fields',
    serviceTitle: 'Service title',
    serviceTitlePlaceholder: 'Enter service title',
    description: 'Description',
    descriptionPlaceholder: 'Describe your service...',
    category: 'Category',
    subcategory: 'Subcategory',
    price: 'Price',
    pricePlaceholder: 'Enter price',
    location: 'Location / area',
    locationPlaceholder: 'Select location / area',
    hours: 'Working hours',
    hoursPlaceholder: 'Select hours',
    availableToday: 'Available today',
    availableTodayHint: 'This affects the map pin status',
    atClient: 'At client',
    atMyPlace: 'At my place',
    online: 'Online',
    paymentMethods: 'Payment methods',
    paymentMethodsHint: 'How can clients pay?',
    cash: 'Cash',
    card: 'Card',
    wallet: 'E-money',
    contact: 'Contacts',
    contactHint: 'Add every contact channel separately',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'Email',
    publishService: 'Publish service',
    pleaseEnterServiceTitle: 'Please enter service title',
    pleaseEnterPrice: 'Please enter price',
    servicePublishedSuccessfully: 'Service published successfully',
  },
  RU: {
    title: 'Добавить услугу',
    subtitle: 'Создайте сильное объявление для клиентов рядом',
    photosSection: 'Фото',
    photosHint: 'Добавьте хорошие фото, чтобы получить больше просмотров',
    uploadPhotos: 'Загрузить фото',
    tapMainPhotoHint: 'Нажмите на фото, чтобы сделать его главным',
    mainPhoto: 'Главное',
    deletePhoto: 'Удалить фото',
    requiredFieldsHint: '* Обязательные поля',
    serviceTitle: 'Название услуги',
    serviceTitlePlaceholder: 'Введите название услуги',
    description: 'Описание',
    descriptionPlaceholder: 'Опишите вашу услугу...',
    category: 'Категория',
    subcategory: 'Подкатегория',
    price: 'Цена',
    pricePlaceholder: 'Введите цену',
    location: 'Локация / район',
    locationPlaceholder: 'Выберите локацию / район',
    hours: 'Часы работы',
    hoursPlaceholder: 'Выберите часы',
    availableToday: 'Доступно сегодня',
    availableTodayHint: 'Это влияет на статус пина на карте',
    atClient: 'У клиента',
    atMyPlace: 'У меня',
    online: 'Онлайн',
    paymentMethods: 'Способы оплаты',
    paymentMethodsHint: 'Как клиенты могут оплатить?',
    cash: 'Наличные',
    card: 'Карта',
    wallet: 'Электронные деньги',
    contact: 'Контакты',
    contactHint: 'Добавьте каждый канал связи отдельно',
    phone: 'Телефон',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Сайт',
    email: 'Email',
    publishService: 'Опубликовать услугу',
    pleaseEnterServiceTitle: 'Введите название услуги',
    pleaseEnterPrice: 'Введите цену',
    servicePublishedSuccessfully: 'Услуга успешно опубликована',
  },
  ES: {
    title: 'Añadir tu servicio',
    subtitle: 'Crea un anuncio fuerte para clientes cercanos',
    photosSection: 'Fotos',
    photosHint: 'Añade buenas fotos para conseguir más visitas',
    uploadPhotos: 'Subir fotos',
    tapMainPhotoHint: 'Toca una foto para ponerla como principal',
    mainPhoto: 'Principal',
    deletePhoto: 'Eliminar foto',
    requiredFieldsHint: '* Campos obligatorios',
    serviceTitle: 'Título del servicio',
    serviceTitlePlaceholder: 'Introduce el título del servicio',
    description: 'Descripción',
    descriptionPlaceholder: 'Describe tu servicio...',
    category: 'Categoría',
    subcategory: 'Subcategoría',
    price: 'Precio',
    pricePlaceholder: 'Introduce el precio',
    location: 'Ubicación / zona',
    locationPlaceholder: 'Selecciona ubicación / zona',
    hours: 'Horario',
    hoursPlaceholder: 'Selecciona horario',
    availableToday: 'Disponible hoy',
    availableTodayHint: 'Esto afecta el estado del pin en el mapa',
    atClient: 'A domicilio',
    atMyPlace: 'En mi lugar',
    online: 'Online',
    paymentMethods: 'Métodos de pago',
    paymentMethodsHint: '¿Cómo pueden pagar los clientes?',
    cash: 'Efectivo',
    card: 'Tarjeta',
    wallet: 'Dinero electrónico',
    contact: 'Contactos',
    contactHint: 'Añade cada canal de contacto por separado',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'WhatsApp Business',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Sitio web',
    email: 'Email',
    publishService: 'Publicar servicio',
    pleaseEnterServiceTitle: 'Introduce el título del servicio',
    pleaseEnterPrice: 'Introduce el precio',
    servicePublishedSuccessfully: 'Servicio publicado con éxito',
  },
  CZ: {
    title: 'Přidat službu',
    subtitle: 'Vytvořte silnou nabídku pro klienty v okolí',
    photosSection: 'Fotky',
    photosHint: 'Přidejte kvalitní fotky pro více zobrazení',
    uploadPhotos: 'Nahrát fotky',
    tapMainPhotoHint: 'Klepněte na fotku pro nastavení hlavní',
    mainPhoto: 'Hlavní',
    deletePhoto: 'Smazat fotku',
    requiredFieldsHint: '* Povinná pole',
    serviceTitle: 'Název služby',
    serviceTitlePlaceholder: 'Zadejte název služby',
    description: 'Popis',
    descriptionPlaceholder: 'Popište svou službu...',
    category: 'Kategorie',
    subcategory: 'Podkategorie',
    price: 'Cena',
    pricePlaceholder: 'Zadejte cenu',
    location: 'Lokalita / oblast',
    locationPlaceholder: 'Vyberte lokalitu / oblast',
    hours: 'Pracovní doba',
    hoursPlaceholder: 'Vyberte hodiny',
    availableToday: 'Dostupné dnes',
    availableTodayHint: 'To ovlivňuje stav pinu na mapě',
    atClient: 'U klienta',
    atMyPlace: 'U mě',
    online: 'Online',
    paymentMethods: 'Způsoby platby',
    paymentMethodsHint: 'Jak mohou klienti zaplatit?',
    cash: 'Hotovost',
    card: 'Karta',
    wallet: 'Elektronické peníze',
    contact: 'Kontakty',
    contactHint: 'Přidejte každý kontakt zvlášť',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Web',
    email: 'Email',
    publishService: 'Publikovat službu',
    pleaseEnterServiceTitle: 'Zadejte název služby',
    pleaseEnterPrice: 'Zadejte cenu',
    servicePublishedSuccessfully: 'Služba byla úspěšně publikována',
  },
  DE: {
    title: 'Dienstleistung hinzufügen',
    subtitle: 'Erstelle ein starkes Angebot für Kunden in der Nähe',
    photosSection: 'Fotos',
    photosHint: 'Füge gute Fotos hinzu, um mehr Aufrufe zu erhalten',
    uploadPhotos: 'Fotos hochladen',
    tapMainPhotoHint: 'Tippe auf ein Foto, um es als Hauptfoto festzulegen',
    mainPhoto: 'Hauptfoto',
    deletePhoto: 'Foto löschen',
    requiredFieldsHint: '* Pflichtfelder',
    serviceTitle: 'Titel der Dienstleistung',
    serviceTitlePlaceholder: 'Titel der Dienstleistung eingeben',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Beschreibe deine Dienstleistung...',
    category: 'Kategorie',
    subcategory: 'Unterkategorie',
    price: 'Preis',
    pricePlaceholder: 'Preis eingeben',
    location: 'Standort / Bereich',
    locationPlaceholder: 'Standort / Bereich wählen',
    hours: 'Arbeitszeiten',
    hoursPlaceholder: 'Zeiten wählen',
    availableToday: 'Heute verfügbar',
    availableTodayHint: 'Das beeinflusst den Status des Kartenpins',
    atClient: 'Beim Kunden',
    atMyPlace: 'Bei mir',
    online: 'Online',
    paymentMethods: 'Zahlungsmethoden',
    paymentMethodsHint: 'Wie können Kunden bezahlen?',
    cash: 'Bar',
    card: 'Karte',
    wallet: 'E-Geld',
    contact: 'Kontakte',
    contactHint: 'Jeden Kontaktkanal separat hinzufügen',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Website',
    email: 'E-Mail',
    publishService: 'Dienstleistung veröffentlichen',
    pleaseEnterServiceTitle: 'Bitte Titel der Dienstleistung eingeben',
    pleaseEnterPrice: 'Bitte Preis eingeben',
    servicePublishedSuccessfully: 'Dienstleistung erfolgreich veröffentlicht',
  },
  PL: {
    title: 'Dodaj usługę',
    subtitle: 'Stwórz mocne ogłoszenie dla klientów w pobliżu',
    photosSection: 'Zdjęcia',
    photosHint: 'Dodaj dobre zdjęcia, aby zdobyć więcej wyświetleń',
    uploadPhotos: 'Prześlij zdjęcia',
    tapMainPhotoHint: 'Dotknij zdjęcia, aby ustawić je jako główne',
    mainPhoto: 'Główne',
    deletePhoto: 'Usuń zdjęcie',
    requiredFieldsHint: '* Pola obowiązkowe',
    serviceTitle: 'Nazwa usługi',
    serviceTitlePlaceholder: 'Wpisz nazwę usługi',
    description: 'Opis',
    descriptionPlaceholder: 'Opisz swoją usługę...',
    category: 'Kategoria',
    subcategory: 'Podkategoria',
    price: 'Cena',
    pricePlaceholder: 'Wpisz cenę',
    location: 'Lokalizacja / obszar',
    locationPlaceholder: 'Wybierz lokalizację / obszar',
    hours: 'Godziny pracy',
    hoursPlaceholder: 'Wybierz godziny',
    availableToday: 'Dostępne dziś',
    availableTodayHint: 'Wpływa to na status pinezki na mapie',
    atClient: 'U klienta',
    atMyPlace: 'U mnie',
    online: 'Online',
    paymentMethods: 'Metody płatności',
    paymentMethodsHint: 'Jak klienci mogą zapłacić?',
    cash: 'Gotówka',
    card: 'Karta',
    wallet: 'Pieniądz elektroniczny',
    contact: 'Kontakty',
    contactHint: 'Dodaj każdy kanał kontaktu osobno',
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    businessWhatsapp: 'Business WhatsApp',
    telegram: 'Telegram',
    viber: 'Viber',
    instagram: 'Instagram',
    website: 'Strona internetowa',
    email: 'Email',
    publishService: 'Opublikuj usługę',
    pleaseEnterServiceTitle: 'Wpisz nazwę usługi',
    pleaseEnterPrice: 'Wpisz cenę',
    servicePublishedSuccessfully: 'Usługa została opublikowana',
  },
};

type ServicePhotoItem = {
  id: string;
  file: File;
  preview: string;
};

function SectionCard({
  title,
  children,
  required,
}: {
  title: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 28,
        padding: 18,
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
        border: '1px solid #ebe4da',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 19,
            fontWeight: 900,
            color: '#1f2430',
          }}
        >
          {title}
        </div>

        {required ? (
          <span
            style={{
              color: '#ff4d4f',
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            *
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 16,
        fontWeight: 800,
        marginBottom: 8,
        color: '#1f2430',
      }}
    >
      <span>{children}</span>
      {required ? (
        <span
          style={{
            color: '#ff4d4f',
            fontSize: 16,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          *
        </span>
      ) : null}
    </label>
  );
}

function ContactInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'text',
  type = 'text',
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #e7e0d6',
        borderRadius: 18,
        background: '#fff',
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: '#f7f5f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#1f2430',
          }}
        >
          {label}
        </div>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{
          width: '100%',
          border: '1px solid #ece5da',
          borderRadius: 14,
          padding: '14px 12px',
          fontSize: 16,
          outline: 'none',
          boxSizing: 'border-box',
          background: '#fcfbf9',
          color: '#1f2430',
        }}
      />
    </div>
  );
}

export default function AddServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [language, setLanguage] = useState<AppLanguage>(getSavedLanguage());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [subcategory, setSubcategory] = useState('Hair');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [availableToday, setAvailableToday] = useState(true);

  const [atClient, setAtClient] = useState(true);
  const [atMyPlace, setAtMyPlace] = useState(false);
  const [online, setOnline] = useState(false);

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [wallet, setWallet] = useState(false);

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessWhatsapp, setBusinessWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [viber, setViber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  const [photos, setPhotos] = useState<ServicePhotoItem[]>([]);

  useEffect(() => {
    setLanguage(getSavedLanguage());

    const unsubLanguage = subscribeToLanguageChange((nextLanguage) => {
      setLanguage(nextLanguage);
    });

    return () => {
      unsubLanguage();
    };
  }, []);

  useEffect(() => {
    return () => {
      photos.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, [photos]);

  const text = pageTexts[language] || pageTexts.EN;
  const categories = categoriesByLanguage[language] || categoriesByLanguage.EN;

  const subcategories = useMemo(() => {
    const map = subcategoriesByCategory[category];
    if (!map) return [] as { value: string; label: string }[];
    return map[language] || map.EN || [];
  }, [category, language]);

  useEffect(() => {
    if (!subcategories.length) {
      setSubcategory('');
      return;
    }

    const exists = subcategories.some((item) => item.value === subcategory);
    if (!exists) {
      setSubcategory(subcategories[0].value);
    }
  }, [subcategory, subcategories]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const nextSubs =
      subcategoriesByCategory[value]?.[language] ||
      subcategoriesByCategory[value]?.EN ||
      [];
    setSubcategory(nextSubs[0]?.value || '');
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;

    const imageFiles = nextFiles.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const mapped = imageFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...mapped].slice(0, 8));
    event.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const found = prev.find((item) => item.id === photoId);
      if (found) {
        URL.revokeObjectURL(found.preview);
      }
      return prev.filter((item) => item.id !== photoId);
    });
  };

  const handleSetMainPhoto = (photoId: string) => {
    setPhotos((prev) => {
      const index = prev.findIndex((item) => item.id === photoId);
      if (index <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert(text.pleaseEnterServiceTitle);
      return;
    }

    if (!price.trim()) {
      alert(text.pleaseEnterPrice);
      return;
    }

    const serviceModes = [
      atClient ? 'at_client' : null,
      atMyPlace ? 'at_my_place' : null,
      online ? 'online' : null,
    ].filter(Boolean) as ('at_client' | 'at_my_place' | 'online')[];

    const paymentMethods = [
      cash ? 'cash' : null,
      card ? 'card' : null,
      wallet ? 'wallet' : null,
    ].filter(Boolean) as ('cash' | 'card' | 'wallet')[];

    addListing({
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory,
      price: price.trim(),
      location: location.trim(),
      hours: hours.trim(),
      availableToday,
      serviceModes,
      paymentMethods,
      contact: {
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegram: telegram.trim(),
        businessWhatsapp: businessWhatsapp.trim(),
        viber: viber.trim(),
        instagram: instagram.trim(),
        website: website.trim(),
        email: email.trim(),
      } as any,
      photos: photos.map((item) => item.preview),
    });

    alert(text.servicePublishedSuccessfully);
    router.push('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f5f1',
        fontFamily: 'Arial, sans-serif',
        color: '#1f2430',
        paddingBottom: 124,
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(247,245,241,0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e6dfd5',
            padding: '16px 16px 14px',
            display: 'grid',
            gridTemplateColumns: '52px 1fr',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              border: '1px solid #e5ddd1',
              background: '#fff',
              fontSize: 28,
              color: '#1f2430',
              lineHeight: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
            }}
          >
            ✕
          </button>

          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#1f2430',
                lineHeight: 1.15,
              }}
            >
              {text.title}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: '#7a8490',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.subtitle}
            </div>
          </div>
        </header>

        <section style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #ebe4da',
              boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
              padding: 16,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              style={{ display: 'none' }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: '#1f2430',
                  }}
                >
                  {text.photosSection}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: '#7a8490',
                    fontWeight: 700,
                    lineHeight: 1.35,
                  }}
                >
                  {text.photosHint}
                </div>
              </div>

              <div
                style={{
                  color: '#7a8490',
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {text.requiredFieldsHint}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenFilePicker}
              style={{
                width: '100%',
                border: '1px dashed #cad8cb',
                background: '#fcfffc',
                borderRadius: 22,
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  border: '2px solid #4ea560',
                  color: '#4ea560',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: '#f4fbf5',
                }}
              >
                +
              </div>

              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#2d7b3c',
                  }}
                >
                  {text.uploadPhotos}
                </div>
              </div>
            </button>

            {photos.length > 0 ? (
              <>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    color: '#7a8490',
                    fontWeight: 700,
                  }}
                >
                  {text.tapMainPhotoHint}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                  }}
                >
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      style={{
                        position: 'relative',
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: index === 0 ? '3px solid #2d7b3c' : '1px solid #e7e0d6',
                        background: '#f8f8f8',
                        aspectRatio: '1 / 1',
                        boxShadow: index === 0 ? '0 8px 18px rgba(45,123,60,0.14)' : 'none',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        style={{
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          width: '100%',
                          height: '100%',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={photo.preview}
                          alt={`service-${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </button>

                      {index === 0 ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: 8,
                            bottom: 8,
                            background: 'rgba(45,123,60,0.92)',
                            color: '#fff',
                            borderRadius: 999,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {text.mainPhoto}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        aria-label={text.deletePhoto}
                        onClick={() => handleRemovePhoto(photo.id)}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          border: 'none',
                          background: 'rgba(255,255,255,0.96)',
                          color: '#1f2430',
                          fontSize: 20,
                          fontWeight: 900,
                          lineHeight: 1,
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.serviceTitle} required>
            <FieldLabel required>{text.serviceTitle}</FieldLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={text.serviceTitlePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel required>{text.description}</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.descriptionPlaceholder}
              rows={5}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.category} required>
            <FieldLabel required>{text.category}</FieldLabel>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                background: '#fff',
              }}
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>

            <FieldLabel required>{text.subcategory}</FieldLabel>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                background: '#fff',
              }}
            >
              {subcategories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.price} required>
            <FieldLabel required>{text.price}</FieldLabel>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={text.pricePlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel required>{text.location}</FieldLabel>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={text.locationPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                marginBottom: 18,
                boxSizing: 'border-box',
              }}
            />

            <FieldLabel required>{text.hours}</FieldLabel>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder={text.hoursPlaceholder}
              style={{
                width: '100%',
                border: '1px solid #e7e0d6',
                borderRadius: 16,
                padding: '16px 14px',
                fontSize: 17,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.availableToday}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#7a8490',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {text.availableTodayHint}
              </div>

              <button
                type="button"
                onClick={() => setAvailableToday((v) => !v)}
                style={{
                  width: 64,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: availableToday ? '#4f91f1' : '#d6dbe2',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: availableToday ? 32 : 4,
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  }}
                />
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setAtClient((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: atClient ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atClient ? '#5aa764' : '#faf8f4',
                  color: atClient ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.atClient}
              </button>

              <button
                type="button"
                onClick={() => setAtMyPlace((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: atMyPlace ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: atMyPlace ? '#5aa764' : '#faf8f4',
                  color: atMyPlace ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.atMyPlace}
              </button>

              <button
                type="button"
                onClick={() => setOnline((v) => !v)}
                style={{
                  borderRadius: 16,
                  border: online ? '2px solid #5aa764' : '1px solid #ddd8cf',
                  background: online ? '#5aa764' : '#faf8f4',
                  color: online ? '#fff' : '#1f2430',
                  padding: '14px 10px',
                  fontSize: 15,
                  fontWeight: 800,
                }}
              >
                {text.online}
              </button>
            </div>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.paymentMethods}>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
              }}
            >
              {text.paymentMethodsHint}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCash((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: cash ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: cash ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>💵</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.cash}</span>
                <span style={{ fontSize: 18 }}>{cash ? '☑' : '☐'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCard((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: card ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: card ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>💳</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.card}</span>
                <span style={{ fontSize: 18 }}>{card ? '☑' : '☐'}</span>
              </button>

              <button
                type="button"
                onClick={() => setWallet((v) => !v)}
                style={{
                  borderRadius: 18,
                  border: wallet ? '2px solid #4f91f1' : '1px solid #ddd8cf',
                  background: wallet ? '#eef5ff' : '#fff',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#1f2430',
                }}
              >
                <span style={{ fontSize: 24 }}>👛</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{text.wallet}</span>
                <span style={{ fontSize: 18 }}>{wallet ? '☑' : '☐'}</span>
              </button>
            </div>
          </SectionCard>
        </section>

        <section style={{ padding: '16px 16px 0' }}>
          <SectionCard title={text.contact}>
            <div
              style={{
                fontSize: 14,
                color: '#7a8490',
                marginBottom: 16,
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {text.contactHint}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <ContactInput
                icon="📞"
                label={text.phone}
                value={phone}
                onChange={setPhone}
                placeholder={text.phone}
                inputMode="tel"
              />

              <ContactInput
                icon="🟢"
                label={text.whatsapp}
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder={text.whatsapp}
                inputMode="tel"
              />

              <ContactInput
                icon="💼"
                label={text.businessWhatsapp}
                value={businessWhatsapp}
                onChange={setBusinessWhatsapp}
                placeholder={text.businessWhatsapp}
                inputMode="tel"
              />

              <ContactInput
                icon="✈️"
                label={text.telegram}
                value={telegram}
                onChange={setTelegram}
                placeholder={text.telegram}
              />

              <ContactInput
                icon="🟣"
                label={text.viber}
                value={viber}
                onChange={setViber}
                placeholder={text.viber}
                inputMode="tel"
              />

              <ContactInput
                icon="📸"
                label={text.instagram}
                value={instagram}
                onChange={setInstagram}
                placeholder={text.instagram}
              />

              <ContactInput
                icon="🌐"
                label={text.website}
                value={website}
                onChange={setWebsite}
                placeholder={text.website}
                inputMode="url"
              />

              <ContactInput
                icon="✉️"
                label={text.email}
                value={email}
                onChange={setEmail}
                placeholder={text.email}
                inputMode="email"
                type="email"
              />
            </div>
          </SectionCard>
        </section>
      </div>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(247,245,241,0.98)',
          borderTop: '1px solid #e6dfd5',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <button
            type="button"
            onClick={handlePublish}
            style={{
              width: '100%',
              border: 'none',
              background: 'linear-gradient(180deg, #279ca2 0%, #1f8b91 100%)',
              color: '#fff',
              borderRadius: 20,
              padding: '18px 18px',
              fontSize: 18,
              fontWeight: 900,
              boxShadow: '0 10px 24px rgba(31,139,145,0.24)',
            }}
          >
            {text.publishService}
          </button>
        </div>
      </div>
    </main>
  );
}
