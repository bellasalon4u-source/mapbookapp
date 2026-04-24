'use client';

import { useMemo, useState } from 'react';
import { categories } from '../services/categories';
import type { AppLanguage } from '../services/i18n';

type TopCategoriesBarProps = {
  activeCategory: string;
  activeSubcategory?: string;
  language: AppLanguage;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory?: (subcategory: string) => void;
  onClearSubcategory?: () => void;
};

function getCategoryLabel(category: any, language: AppLanguage) {
  const map: Record<string, Partial<Record<AppLanguage, string>>> = {
    more: { EN: 'More', ES: 'Más', RU: 'Ещё', UA: 'Ще', CZ: 'Více', DE: 'Mehr', IT: 'Altro', FR: 'Plus', AR: 'المزيد', PL: 'Więcej' },
    beauty: { EN: 'Beauty', ES: 'Belleza', RU: 'Красота', UA: 'Краса', CZ: 'Krása', DE: 'Beauty', IT: 'Beauty', FR: 'Beauté', AR: 'الجمال', PL: 'Uroda' },
    barber: { EN: 'Barber', ES: 'Barbero', RU: 'Барбер', UA: 'Барбер', CZ: 'Barber', DE: 'Barber', IT: 'Barber', FR: 'Barbier', AR: 'حلاقة', PL: 'Barber' },
    wellness: { EN: 'Wellness', ES: 'Bienestar', RU: 'Велнес', UA: 'Велнес', CZ: 'Wellness', DE: 'Wellness', IT: 'Benessere', FR: 'Bien-être', AR: 'عافية', PL: 'Wellness' },
    home: { EN: 'Home', ES: 'Hogar', RU: 'Дом', UA: 'Дім', CZ: 'Domov', DE: 'Zuhause', IT: 'Casa', FR: 'Maison', AR: 'المنزل', PL: 'Dom' },
    repairs: { EN: 'Repairs', ES: 'Reparaciones', RU: 'Ремонт', UA: 'Ремонт', CZ: 'Opravy', DE: 'Reparaturen', IT: 'Riparazioni', FR: 'Réparations', AR: 'إصلاحات', PL: 'Naprawy' },
    tech: { EN: 'Tech', ES: 'Tecnología', RU: 'Техника', UA: 'Техніка', CZ: 'Technika', DE: 'Technik', IT: 'Tech', FR: 'Tech', AR: 'تقنية', PL: 'Technika' },
    pets: { EN: 'Pets', ES: 'Mascotas', RU: 'Питомцы', UA: 'Тварини', CZ: 'Mazlíčci', DE: 'Haustiere', IT: 'Animali', FR: 'Animaux', AR: 'حيوانات', PL: 'Zwierzęta' },
    fashion: { EN: 'Fashion', ES: 'Moda', RU: 'Мода', UA: 'Мода', CZ: 'Móda', DE: 'Mode', IT: 'Moda', FR: 'Mode', AR: 'موضة', PL: 'Moda' },
    auto: { EN: 'Auto', ES: 'Auto', RU: 'Авто', UA: 'Авто', CZ: 'Auto', DE: 'Auto', IT: 'Auto', FR: 'Auto', AR: 'سيارات', PL: 'Auto' },
    moving: { EN: 'Moving', ES: 'Mudanza', RU: 'Переезд', UA: 'Переїзд', CZ: 'Stěhování', DE: 'Umzug', IT: 'Trasloco', FR: 'Déménagement', AR: 'نقل', PL: 'Przeprowadzka' },
    fitness: { EN: 'Fitness', ES: 'Fitness', RU: 'Фитнес', UA: 'Фітнес', CZ: 'Fitness', DE: 'Fitness', IT: 'Fitness', FR: 'Fitness', AR: 'لياقة', PL: 'Fitness' },
    education: { EN: 'Education', ES: 'Educación', RU: 'Обучение', UA: 'Освіта', CZ: 'Vzdělání', DE: 'Bildung', IT: 'Formazione', FR: 'Éducation', AR: 'تعليم', PL: 'Edukacja' },
    events: { EN: 'Events', ES: 'Eventos', RU: 'События', UA: 'Події', CZ: 'Události', DE: 'Events', IT: 'Eventi', FR: 'Événements', AR: 'فعاليات', PL: 'Wydarzenia' },
    activities: { EN: 'Activities', ES: 'Actividades', RU: 'Активности', UA: 'Активності', CZ: 'Aktivity', DE: 'Aktivitäten', IT: 'Attività', FR: 'Activités', AR: 'أنشطة', PL: 'Aktywności' },
    creative: { EN: 'Creative', ES: 'Creativo', RU: 'Креатив', UA: 'Креатив', CZ: 'Kreativa', DE: 'Kreativ', IT: 'Creativo', FR: 'Créatif', AR: 'إبداعي', PL: 'Kreatywne' },
  };

  return (
    map[String(category.id || '').toLowerCase()]?.[language] ||
    category.shortLabel ||
    category.label ||
    String(category.id || '')
  );
}

function getSubcategoryLabel(value: string, language: AppLanguage) {
  const dict: Record<string, Partial<Record<AppLanguage, string>>> = {
    Hair: { RU: 'Волосы', UA: 'Волосся', ES: 'Cabello', CZ: 'Vlasy', DE: 'Haare', IT: 'Capelli', FR: 'Cheveux', AR: 'الشعر', PL: 'Włosy' },
    'Brows & Lashes': { RU: 'Брови и ресницы', UA: 'Брови та вії', ES: 'Cejas y pestañas', CZ: 'Obočí a řasy', DE: 'Augenbrauen & Wimpern', IT: 'Sopracciglia e ciglia', FR: 'Sourcils et cils', AR: 'الحواجب والرموش', PL: 'Brwi i rzęsy' },
    Nails: { RU: 'Ногти', UA: 'Нігті', ES: 'Uñas', CZ: 'Nehty', DE: 'Nägel', IT: 'Unghie', FR: 'Ongles', AR: 'الأظافر', PL: 'Paznokcie' },
    Makeup: { RU: 'Макияж', UA: 'Макіяж', ES: 'Maquillaje', CZ: 'Make-up', DE: 'Make-up', IT: 'Make-up', FR: 'Maquillage', AR: 'مكياج', PL: 'Makijaż' },
    Skincare: { RU: 'Уход за кожей', UA: 'Догляд за шкірою', ES: 'Cuidado de la piel', CZ: 'Péče o pleť', DE: 'Hautpflege', IT: 'Cura della pelle', FR: 'Soin de la peau', AR: 'العناية بالبشرة', PL: 'Pielęgnacja skóry' },
    Aesthetics: { RU: 'Эстетика', UA: 'Естетика', ES: 'Estética', CZ: 'Estetika', DE: 'Ästhetik', IT: 'Estetica', FR: 'Esthétique', AR: 'التجميل', PL: 'Estetyka' },

    Haircut: { RU: 'Стрижка', UA: 'Стрижка', ES: 'Corte de pelo', CZ: 'Střih', DE: 'Haarschnitt', IT: 'Taglio', FR: 'Coupe', AR: 'قص الشعر', PL: 'Strzyżenie' },
    'Beard Trim': { RU: 'Подравнивание бороды', UA: 'Підрівнювання бороди', ES: 'Recorte de barba', CZ: 'Úprava vousů', DE: 'Bart trimmen', IT: 'Regolazione barba', FR: 'Taille de barbe', AR: 'تهذيب اللحية', PL: 'Przycinanie brody' },
    Shave: { RU: 'Бритьё', UA: 'Гоління', ES: 'Afeitado', CZ: 'Holení', DE: 'Rasur', IT: 'Rasatura', FR: 'Rasage', AR: 'حلاقة', PL: 'Golenie' },
    Fade: { RU: 'Фейд', UA: 'Фейд', ES: 'Fade', CZ: 'Fade', DE: 'Fade', IT: 'Fade', FR: 'Fade', AR: 'فيد', PL: 'Fade' },
    'Kids Haircut': { RU: 'Детская стрижка', UA: 'Дитяча стрижка', ES: 'Corte infantil', CZ: 'Dětský střih', DE: 'Kinderhaarschnitt', IT: 'Taglio bambino', FR: 'Coupe enfant', AR: 'قص أطفال', PL: 'Strzyżenie dziecięce' },
    Styling: { RU: 'Укладка', UA: 'Укладка', ES: 'Peinado', CZ: 'Styling', DE: 'Styling', IT: 'Styling', FR: 'Coiffage', AR: 'تصفيف', PL: 'Stylizacja' },

    Massage: { RU: 'Массаж', UA: 'Масаж', ES: 'Masaje', CZ: 'Masáž', DE: 'Massage', IT: 'Massaggio', FR: 'Massage', AR: 'مساج', PL: 'Masaż' },
    Spa: { RU: 'Спа', UA: 'Спа', ES: 'Spa', CZ: 'Spa', DE: 'Spa', IT: 'Spa', FR: 'Spa', AR: 'سبا', PL: 'Spa' },
    Relaxation: { RU: 'Релакс', UA: 'Релакс', ES: 'Relajación', CZ: 'Relaxace', DE: 'Entspannung', IT: 'Relax', FR: 'Relaxation', AR: 'استرخاء', PL: 'Relaks' },
    Recovery: { RU: 'Восстановление', UA: 'Відновлення', ES: 'Recuperación', CZ: 'Regenerace', DE: 'Erholung', IT: 'Recupero', FR: 'Récupération', AR: 'تعافٍ', PL: 'Regeneracja' },
    'Holistic Care': { RU: 'Холистический уход', UA: 'Холістичний догляд', ES: 'Cuidado holístico', CZ: 'Holistická péče', DE: 'Ganzheitliche Pflege', IT: 'Cura olistica', FR: 'Soin holistique', AR: 'رعاية شمولية', PL: 'Opieka holistyczna' },
    'Therapy Support': { RU: 'Терапевтическая помощь', UA: 'Терапевтична підтримка', ES: 'Apoyo terapéutico', CZ: 'Terapeutická podpora', DE: 'Therapie-Unterstützung', IT: 'Supporto terapeutico', FR: 'Soutien thérapeutique', AR: 'دعم علاجي', PL: 'Wsparcie terapeutyczne' },

    Cleaning: { RU: 'Уборка', UA: 'Прибирання', ES: 'Limpieza', CZ: 'Úklid', DE: 'Reinigung', IT: 'Pulizia', FR: 'Nettoyage', AR: 'تنظيف', PL: 'Sprzątanie' },
    'Deep Cleaning': { RU: 'Глубокая уборка', UA: 'Глибоке прибирання', ES: 'Limpieza profunda', CZ: 'Hloubkové čištění', DE: 'Tiefenreinigung', IT: 'Pulizia profonda', FR: 'Nettoyage en profondeur', AR: 'تنظيف عميق', PL: 'Dogłębne czyszczenie' },
    'Garden Help': { RU: 'Помощь в саду', UA: 'Допомога в саду', ES: 'Ayuda en jardín', CZ: 'Pomoc na zahradě', DE: 'Gartenhilfe', IT: 'Aiuto in giardino', FR: 'Aide au jardin', AR: 'مساعدة في الحديقة', PL: 'Pomoc w ogrodzie' },
    Handyman: { RU: 'Мастер на час', UA: 'Майстер на годину', ES: 'Manitas', CZ: 'Hodinový manžel', DE: 'Handwerker', IT: 'Tuttofare', FR: 'Bricoleur', AR: 'عامل صيانة', PL: 'Złota rączka' },
    'Furniture Assembly': { RU: 'Сборка мебели', UA: 'Збірка меблів', ES: 'Montaje de muebles', CZ: 'Montáž nábytku', DE: 'Möbelmontage', IT: 'Montaggio mobili', FR: 'Montage de meubles', AR: 'تركيب الأثاث', PL: 'Montaż mebli' },
    'Home Help': { RU: 'Помощь по дому', UA: 'Допомога по дому', ES: 'Ayuda en casa', CZ: 'Pomoc v domácnosti', DE: 'Haushaltshilfe', IT: 'Aiuto domestico', FR: 'Aide à domicile', AR: 'مساعدة منزلية', PL: 'Pomoc domowa' },
    'Home Repairs': { RU: 'Домашний ремонт', UA: 'Домашній ремонт', ES: 'Reparaciones del hogar', CZ: 'Opravy doma', DE: 'Hausreparaturen', IT: 'Riparazioni domestiche', FR: 'Réparations à domicile', AR: 'إصلاحات منزلية', PL: 'Naprawy domowe' },
    'Appliance Repair': { RU: 'Ремонт техники', UA: 'Ремонт техніки', ES: 'Reparación de electrodomésticos', CZ: 'Oprava spotřebičů', DE: 'Gerätereparatur', IT: 'Riparazione elettrodomestici', FR: 'Réparation d’appareils', AR: 'إصلاح الأجهزة', PL: 'Naprawa sprzętu' },
    'Furniture Repair': { RU: 'Ремонт мебели', UA: 'Ремонт меблів', ES: 'Reparación de muebles', CZ: 'Oprava nábytku', DE: 'Möbelreparatur', IT: 'Riparazione mobili', FR: 'Réparation de meubles', AR: 'إصلاح الأثاث', PL: 'Naprawa mebli' },
    'Shoe Repair': { RU: 'Ремонт обуви', UA: 'Ремонт взуття', ES: 'Reparación de zapatos', CZ: 'Oprava bot', DE: 'Schuhreparatur', IT: 'Riparazione scarpe', FR: 'Réparation de chaussures', AR: 'إصلاح الأحذية', PL: 'Naprawa butów' },
    'Clothing Repair': { RU: 'Ремонт одежды', UA: 'Ремонт одягу', ES: 'Reparación de ropa', CZ: 'Oprava oblečení', DE: 'Kleiderreparatur', IT: 'Riparazione vestiti', FR: 'Réparation de vêtements', AR: 'إصلاح الملابس', PL: 'Naprawa odzieży' },
    'Watch Repair': { RU: 'Ремонт часов', UA: 'Ремонт годинників', ES: 'Reparación de relojes', CZ: 'Oprava hodinek', DE: 'Uhrenreparatur', IT: 'Riparazione orologi', FR: 'Réparation de montres', AR: 'إصلاح الساعات', PL: 'Naprawa zegarków' },

    'Phone Repair': { RU: 'Ремонт телефона', UA: 'Ремонт телефону', ES: 'Reparación de teléfono', CZ: 'Oprava telefonu', DE: 'Handyreparatur', IT: 'Riparazione telefono', FR: 'Réparation téléphone', AR: 'إصلاح الهاتف', PL: 'Naprawa telefonu' },
    'Computer Repair': { RU: 'Ремонт компьютера', UA: 'Ремонт комп’ютера', ES: 'Reparación de ordenador', CZ: 'Oprava počítače', DE: 'Computerreparatur', IT: 'Riparazione computer', FR: 'Réparation ordinateur', AR: 'إصلاح الكمبيوتر', PL: 'Naprawa komputera' },
    'Laptop Repair': { RU: 'Ремонт ноутбука', UA: 'Ремонт ноутбука', ES: 'Reparación de portátil', CZ: 'Oprava notebooku', DE: 'Laptopreparatur', IT: 'Riparazione laptop', FR: 'Réparation portable', AR: 'إصلاح اللابتوب', PL: 'Naprawa laptopa' },
    'Tablet Repair': { RU: 'Ремонт планшета', UA: 'Ремонт планшета', ES: 'Reparación de tablet', CZ: 'Oprava tabletu', DE: 'Tablet-Reparatur', IT: 'Riparazione tablet', FR: 'Réparation tablette', AR: 'إصلاح التابلت', PL: 'Naprawa tabletu' },
    'TV Setup': { RU: 'Настройка ТВ', UA: 'Налаштування ТВ', ES: 'Configuración TV', CZ: 'Nastavení TV', DE: 'TV-Einrichtung', IT: 'Configurazione TV', FR: 'Configuration TV', AR: 'إعداد التلفاز', PL: 'Konfiguracja TV' },
    'Smart Device Help': { RU: 'Помощь с умными устройствами', UA: 'Допомога з розумними пристроями', ES: 'Ayuda con dispositivos inteligentes', CZ: 'Pomoc s chytrými zařízeními', DE: 'Hilfe mit Smart-Geräten', IT: 'Aiuto dispositivi smart', FR: 'Aide appareils connectés', AR: 'مساعدة الأجهزة الذكية', PL: 'Pomoc ze smart urządzeniami' },

    Tailoring: { RU: 'Пошив', UA: 'Пошиття', ES: 'Sastrería', CZ: 'Krejčovství', DE: 'Schneiderei', IT: 'Sartoria', FR: 'Couture', AR: 'خياطة', PL: 'Krawiectwo' },
    Alterations: { RU: 'Переделка', UA: 'Переробка', ES: 'Arreglos', CZ: 'Úpravy', DE: 'Änderungen', IT: 'Modifiche', FR: 'Retouches', AR: 'تعديلات', PL: 'Przeróbki' },
    'Custom Sewing': { RU: 'Индивидуальный пошив', UA: 'Індивідуальне пошиття', ES: 'Costura a medida', CZ: 'Zakázkové šití', DE: 'Maßschneiderei', IT: 'Cucito su misura', FR: 'Couture sur mesure', AR: 'خياطة مخصصة', PL: 'Szycie na miarę' },
    'Shoe Care': { RU: 'Уход за обувью', UA: 'Догляд за взуттям', ES: 'Cuidado del calzado', CZ: 'Péče o obuv', DE: 'Schuhpflege', IT: 'Cura scarpe', FR: 'Entretien des chaussures', AR: 'العناية بالأحذية', PL: 'Pielęgnacja butów' },
    'Bag Repair': { RU: 'Ремонт сумок', UA: 'Ремонт сумок', ES: 'Reparación de bolsos', CZ: 'Oprava tašek', DE: 'Taschenreparatur', IT: 'Riparazione borse', FR: 'Réparation sacs', AR: 'إصلاح الحقائب', PL: 'Naprawa toreb' },

    Grooming: { RU: 'Груминг', UA: 'Грумінг', ES: 'Peluquería', CZ: 'Grooming', DE: 'Grooming', IT: 'Toelettatura', FR: 'Toilettage', AR: 'تنظيف الحيوانات', PL: 'Grooming' },
    'Dog Walking': { RU: 'Выгул собак', UA: 'Вигул собак', ES: 'Paseo de perros', CZ: 'Venčení psů', DE: 'Gassi-Service', IT: 'Passeggiata cani', FR: 'Promenade de chiens', AR: 'تمشية الكلاب', PL: 'Wyprowadzanie psów' },
    'Pet Sitting': { RU: 'Передержка питомцев', UA: 'Перетримка тварин', ES: 'Cuidado de mascotas', CZ: 'Hlídání mazlíčků', DE: 'Tiersitting', IT: 'Pet sitting', FR: 'Garde d’animaux', AR: 'رعاية الحيوانات', PL: 'Opieka nad zwierzętami' },
    'Pet Taxi': { RU: 'Такси для питомцев', UA: 'Таксі для тварин', ES: 'Taxi para mascotas', CZ: 'Taxi pro mazlíčky', DE: 'Tier-Taxi', IT: 'Taxi per animali', FR: 'Taxi animaux', AR: 'تاكسي الحيوانات', PL: 'Taxi dla zwierząt' },
    'Pet Delivery': { RU: 'Доставка для питомцев', UA: 'Доставка для тварин', ES: 'Entrega para mascotas', CZ: 'Doručení pro mazlíčky', DE: 'Lieferung für Tiere', IT: 'Consegna per animali', FR: 'Livraison animaux', AR: 'توصيل للحيوانات', PL: 'Dostawa dla zwierząt' },
    Training: { RU: 'Дрессировка', UA: 'Тренування', ES: 'Entrenamiento', CZ: 'Trénink', DE: 'Training', IT: 'Allenamento', FR: 'Entraînement', AR: 'تدريب', PL: 'Trening' },
    'Home Visits': { RU: 'Выезд на дом', UA: 'Візит додому', ES: 'Visitas a domicilio', CZ: 'Návštěvy doma', DE: 'Hausbesuche', IT: 'Visite a domicilio', FR: 'Visites à domicile', AR: 'زيارات منزلية', PL: 'Wizyty domowe' },
    'Accessories & Gifts': { RU: 'Аксессуары и подарки', UA: 'Аксесуари та подарунки', ES: 'Accesorios y regalos', CZ: 'Doplňky a dárky', DE: 'Accessoires & Geschenke', IT: 'Accessori e regali', FR: 'Accessoires et cadeaux', AR: 'إكسسوارات وهدايا', PL: 'Akcesoria i prezenty' },

    'Car Wash': { RU: 'Мойка авто', UA: 'Мийка авто', ES: 'Lavado de coche', CZ: 'Mytí auta', DE: 'Autowäsche', IT: 'Lavaggio auto', FR: 'Lavage auto', AR: 'غسيل السيارة', PL: 'Mycie auta' },
    Detailing: { RU: 'Детейлинг', UA: 'Детейлінг', ES: 'Detailing', CZ: 'Detailing', DE: 'Detailing', IT: 'Detailing', FR: 'Detailing', AR: 'تلميع', PL: 'Detailing' },
    'Tyre Help': { RU: 'Помощь с шинами', UA: 'Допомога з шинами', ES: 'Ayuda con neumáticos', CZ: 'Pomoc s pneumatikami', DE: 'Reifenhilfe', IT: 'Aiuto pneumatici', FR: 'Aide pneus', AR: 'مساعدة الإطارات', PL: 'Pomoc z oponami' },
    'Battery Help': { RU: 'Помощь с аккумулятором', UA: 'Допомога з акумулятором', ES: 'Ayuda con batería', CZ: 'Pomoc s baterií', DE: 'Batteriehilfe', IT: 'Aiuto batteria', FR: 'Aide batterie', AR: 'مساعدة البطارية', PL: 'Pomoc z akumulatorem' },
    Diagnostics: { RU: 'Диагностика', UA: 'Діагностика', ES: 'Diagnóstico', CZ: 'Diagnostika', DE: 'Diagnose', IT: 'Diagnostica', FR: 'Diagnostic', AR: 'تشخيص', PL: 'Diagnostyka' },
    'Driver Service': { RU: 'Услуги водителя', UA: 'Послуги водія', ES: 'Servicio de conductor', CZ: 'Řidičské služby', DE: 'Fahrerservice', IT: 'Servizio autista', FR: 'Service chauffeur', AR: 'خدمة السائق', PL: 'Usługa kierowcy' },

    'Small Moves': { RU: 'Небольшие переезды', UA: 'Невеликі переїзди', ES: 'Pequeñas mudanzas', CZ: 'Malé stěhování', DE: 'Kleine Umzüge', IT: 'Piccoli traslochi', FR: 'Petits déménagements', AR: 'نقلات صغيرة', PL: 'Małe przeprowadzki' },
    'Van Help': { RU: 'Помощь с фургоном', UA: 'Допомога з фургоном', ES: 'Ayuda con furgoneta', CZ: 'Pomoc s dodávkou', DE: 'Transporter-Hilfe', IT: 'Aiuto furgone', FR: 'Aide fourgon', AR: 'مساعدة الشاحنة', PL: 'Pomoc z vanem' },
    'Furniture Delivery': { RU: 'Доставка мебели', UA: 'Доставка меблів', ES: 'Entrega de muebles', CZ: 'Doručení nábytku', DE: 'Möbellieferung', IT: 'Consegna mobili', FR: 'Livraison meubles', AR: 'توصيل الأثاث', PL: 'Dostawa mebli' },
    Courier: { RU: 'Курьер', UA: 'Курʼєр', ES: 'Mensajería', CZ: 'Kurýr', DE: 'Kurier', IT: 'Corriere', FR: 'Coursier', AR: 'توصيل', PL: 'Kurier' },
    'Same-Day Delivery': { RU: 'Доставка в тот же день', UA: 'Доставка в той самий день', ES: 'Entrega el mismo día', CZ: 'Doručení ve stejný den', DE: 'Lieferung am selben Tag', IT: 'Consegna in giornata', FR: 'Livraison le jour même', AR: 'توصيل بنفس اليوم', PL: 'Dostawa tego samego dnia' },
    'Heavy Transport': { RU: 'Тяжёлые перевозки', UA: 'Важкі перевезення', ES: 'Transporte pesado', CZ: 'Těžká doprava', DE: 'Schwertransport', IT: 'Trasporto pesante', FR: 'Transport lourd', AR: 'نقل ثقيل', PL: 'Transport ciężki' },

    'Personal Training': { RU: 'Персональные тренировки', UA: 'Персональні тренування', ES: 'Entrenamiento personal', CZ: 'Osobní trénink', DE: 'Personal Training', IT: 'Allenamento personale', FR: 'Coaching personnel', AR: 'تدريب شخصي', PL: 'Trening personalny' },
    Yoga: { RU: 'Йога', UA: 'Йога', ES: 'Yoga', CZ: 'Jóga', DE: 'Yoga', IT: 'Yoga', FR: 'Yoga', AR: 'يوغا', PL: 'Joga' },
    Pilates: { RU: 'Пилатес', UA: 'Пілатес', ES: 'Pilates', CZ: 'Pilates', DE: 'Pilates', IT: 'Pilates', FR: 'Pilates', AR: 'بيلاتس', PL: 'Pilates' },
    Stretching: { RU: 'Растяжка', UA: 'Розтяжка', ES: 'Estiramientos', CZ: 'Protahování', DE: 'Stretching', IT: 'Stretching', FR: 'Étirements', AR: 'تمدد', PL: 'Stretching' },

    Languages: { RU: 'Языки', UA: 'Мови', ES: 'Idiomas', CZ: 'Jazyky', DE: 'Sprachen', IT: 'Lingue', FR: 'Langues', AR: 'لغات', PL: 'Języki' },
    Tutoring: { RU: 'Репетиторство', UA: 'Репетиторство', ES: 'Tutoría', CZ: 'Doučování', DE: 'Nachhilfe', IT: 'Tutoraggio', FR: 'Tutorat', AR: 'دروس خصوصية', PL: 'Korepetycje' },
    'Music Lessons': { RU: 'Уроки музыки', UA: 'Уроки музики', ES: 'Clases de música', CZ: 'Hudební lekce', DE: 'Musikunterricht', IT: 'Lezioni di musica', FR: 'Cours de musique', AR: 'دروس موسيقى', PL: 'Lekcje muzyki' },
    'Kids Learning': { RU: 'Обучение детей', UA: 'Навчання дітей', ES: 'Aprendizaje infantil', CZ: 'Dětské vzdělávání', DE: 'Kinderlernen', IT: 'Apprendimento bambini', FR: 'Apprentissage enfants', AR: 'تعليم الأطفال', PL: 'Nauka dzieci' },
    'Exam Prep': { RU: 'Подготовка к экзаменам', UA: 'Підготовка до іспитів', ES: 'Preparación de exámenes', CZ: 'Příprava na zkoušky', DE: 'Prüfungsvorbereitung', IT: 'Preparazione esami', FR: 'Préparation examens', AR: 'تحضير للامتحانات', PL: 'Przygotowanie do egzaminów' },
    'Skill Coaching': { RU: 'Развитие навыков', UA: 'Розвиток навичок', ES: 'Coaching de habilidades', CZ: 'Koučink dovedností', DE: 'Kompetenz-Coaching', IT: 'Coaching competenze', FR: 'Coaching compétences', AR: 'تدريب مهارات', PL: 'Coaching umiejętności' },

    Photography: { RU: 'Фотография', UA: 'Фотографія', ES: 'Fotografía', CZ: 'Fotografie', DE: 'Fotografie', IT: 'Fotografia', FR: 'Photographie', AR: 'تصوير', PL: 'Fotografia' },
    Videography: { RU: 'Видеосъёмка', UA: 'Відеозйомка', ES: 'Videografía', CZ: 'Videografie', DE: 'Videografie', IT: 'Videografia', FR: 'Vidéographie', AR: 'تصوير فيديو', PL: 'Wideografia' },
    Decor: { RU: 'Декор', UA: 'Декор', ES: 'Decoración', CZ: 'Dekorace', DE: 'Dekor', IT: 'Decor', FR: 'Décor', AR: 'ديكور', PL: 'Dekoracje' },
    'DJ & Music': { RU: 'DJ и музыка', UA: 'DJ та музика', ES: 'DJ y música', CZ: 'DJ a hudba', DE: 'DJ & Musik', IT: 'DJ e musica', FR: 'DJ et musique', AR: 'دي جي وموسيقى', PL: 'DJ i muzyka' },
    'Event Makeup': { RU: 'Макияж на событие', UA: 'Макіяж на подію', ES: 'Maquillaje para eventos', CZ: 'Make-up na akce', DE: 'Event-Make-up', IT: 'Make-up eventi', FR: 'Maquillage événement', AR: 'مكياج للمناسبات', PL: 'Makijaż eventowy' },
    'Catering Help': { RU: 'Помощь с кейтерингом', UA: 'Допомога з кейтерингом', ES: 'Ayuda de catering', CZ: 'Pomoc s cateringem', DE: 'Catering-Hilfe', IT: 'Aiuto catering', FR: 'Aide traiteur', AR: 'مساعدة الضيافة', PL: 'Pomoc cateringowa' },

    Tours: { RU: 'Туры', UA: 'Тури', ES: 'Tours', CZ: 'Prohlídky', DE: 'Touren', IT: 'Tour', FR: 'Tours', AR: 'جولات', PL: 'Wycieczki' },
    Workshops: { RU: 'Мастер-классы', UA: 'Майстер-класи', ES: 'Talleres', CZ: 'Workshopy', DE: 'Workshops', IT: 'Workshop', FR: 'Ateliers', AR: 'ورش عمل', PL: 'Warsztaty' },
    'Kids Activities': { RU: 'Детские активности', UA: 'Дитячі активності', ES: 'Actividades para niños', CZ: 'Dětské aktivity', DE: 'Kinderaktivitäten', IT: 'Attività per bambini', FR: 'Activités enfants', AR: 'أنشطة للأطفال', PL: 'Aktywności dla dzieci' },
    'Art Classes': { RU: 'Уроки искусства', UA: 'Уроки мистецтва', ES: 'Clases de arte', CZ: 'Kurzy umění', DE: 'Kunstkurse', IT: 'Lezioni d’arte', FR: 'Cours d’art', AR: 'دروس فن', PL: 'Lekcje sztuki' },
    'Dance Classes': { RU: 'Танцевальные занятия', UA: 'Танцювальні заняття', ES: 'Clases de baile', CZ: 'Taneční lekce', DE: 'Tanzkurse', IT: 'Lezioni di danza', FR: 'Cours de danse', AR: 'دروس رقص', PL: 'Lekcje tańca' },

    'Graphic Design': { RU: 'Графический дизайн', UA: 'Графічний дизайн', ES: 'Diseño gráfico', CZ: 'Grafický design', DE: 'Grafikdesign', IT: 'Graphic design', FR: 'Design graphique', AR: 'تصميم جرافيك', PL: 'Projektowanie graficzne' },
    'Content Creation': { RU: 'Создание контента', UA: 'Створення контенту', ES: 'Creación de contenido', CZ: 'Tvorba obsahu', DE: 'Content-Erstellung', IT: 'Creazione contenuti', FR: 'Création de contenu', AR: 'إنشاء محتوى', PL: 'Tworzenie treści' },
    'Photo Editing': { RU: 'Обработка фото', UA: 'Обробка фото', ES: 'Edición de fotos', CZ: 'Úprava fotografií', DE: 'Fotobearbeitung', IT: 'Editing foto', FR: 'Retouche photo', AR: 'تحرير الصور', PL: 'Edycja zdjęć' },
    'Video Editing': { RU: 'Монтаж видео', UA: 'Монтаж відео', ES: 'Edición de video', CZ: 'Úprava videa', DE: 'Videobearbeitung', IT: 'Editing video', FR: 'Montage vidéo', AR: 'تحرير الفيديو', PL: 'Montaż wideo' },
    Branding: { RU: 'Брендинг', UA: 'Брендинг', ES: 'Branding', CZ: 'Branding', DE: 'Branding', IT: 'Branding', FR: 'Branding', AR: 'هوية العلامة', PL: 'Branding' },
    'Social Media Help': { RU: 'Помощь с соцсетями', UA: 'Допомога з соцмережами', ES: 'Ayuda redes sociales', CZ: 'Pomoc se sociálními sítěmi', DE: 'Hilfe mit Social Media', IT: 'Aiuto social media', FR: 'Aide réseaux sociaux', AR: 'مساعدة السوشيال ميديا', PL: 'Pomoc z social media' },

    Other: { RU: 'Другое', UA: 'Інше', ES: 'Otro', CZ: 'Jiné', DE: 'Andere', IT: 'Altro', FR: 'Autre', AR: 'أخرى', PL: 'Inne' },
  };

  return dict[value]?.[language] || value;
}

function getSheetTexts(language: AppLanguage) {
  if (language === 'RU') {
    return {
      title: 'Все категории',
      subtitle: 'Выберите категорию',
      subTitle: 'Подкатегории',
      allInCategory: 'Все в категории',
      back: 'Назад',
    };
  }

  if (language === 'UA') {
    return {
      title: 'Усі категорії',
      subtitle: 'Оберіть категорію',
      subTitle: 'Підкатегорії',
      allInCategory: 'Усе в категорії',
      back: 'Назад',
    };
  }

  if (language === 'ES') {
    return {
      title: 'Todas las categorías',
      subtitle: 'Elige una categoría',
      subTitle: 'Subcategorías',
      allInCategory: 'Todo en la categoría',
      back: 'Atrás',
    };
  }

  if (language === 'CZ') {
    return {
      title: 'Všechny kategorie',
      subtitle: 'Vyberte kategorii',
      subTitle: 'Podkategorie',
      allInCategory: 'Vše v kategorii',
      back: 'Zpět',
    };
  }

  if (language === 'DE') {
    return {
      title: 'Alle Kategorien',
      subtitle: 'Kategorie wählen',
      subTitle: 'Unterkategorien',
      allInCategory: 'Alles in Kategorie',
      back: 'Zurück',
    };
  }

  if (language === 'PL') {
    return {
      title: 'Wszystkie kategorie',
      subtitle: 'Wybierz kategorię',
      subTitle: 'Podkategorie',
      allInCategory: 'Wszystko w kategorii',
      back: 'Wstecz',
    };
  }

  return {
    title: 'All categories',
    subtitle: 'Choose category',
    subTitle: 'Subcategories',
    allInCategory: 'All in category',
    back: 'Back',
  };
}

function getCategoryVisual(category: any): { type: 'image' | 'emoji'; value: string } | null {
  const id = String(category?.id || '').toLowerCase();

  const localImageMap: Record<string, string> = {
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

  if (localImageMap[id]) {
    return { type: 'image', value: localImageMap[id] };
  }

  if (typeof category?.icon === 'string' && category.icon.trim()) {
    return { type: 'emoji', value: category.icon };
  }

  return null;
}

function getLanguageAccent(language: AppLanguage) {
  switch (language) {
    case 'RU':
      return { border: '#0039a6', glow: 'rgba(0,57,166,0.15)' };
    case 'CZ':
      return { border: '#d7141a', glow: 'rgba(215,20,26,0.15)' };
    case 'DE':
      return { border: '#ffce00', glow: 'rgba(255,206,0,0.17)' };
    case 'PL':
      return { border: '#dc143c', glow: 'rgba(220,20,60,0.15)' };
    case 'UA':
      return { border: '#0057b7', glow: 'rgba(0,87,183,0.15)' };
    case 'ES':
      return { border: '#c60b1e', glow: 'rgba(198,11,30,0.15)' };
    case 'FR':
      return { border: '#0055a4', glow: 'rgba(0,85,164,0.15)' };
    case 'IT':
      return { border: '#009246', glow: 'rgba(0,146,70,0.15)' };
    case 'AR':
      return { border: '#007a3d', glow: 'rgba(0,122,61,0.15)' };
    default:
      return { border: '#c8102e', glow: 'rgba(200,16,46,0.15)' };
  }
}

export default function TopCategoriesBar({
  activeCategory,
  activeSubcategory,
  language,
  onSelectCategory,
  onSelectSubcategory,
  onClearSubcategory,
}: TopCategoriesBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSheetCategoryId, setSelectedSheetCategoryId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((item: any) => String(item.id).toLowerCase() !== 'more');
  }, []);

  const visibleCategories = useMemo(() => {
    return [{ id: 'more', label: 'More', shortLabel: 'More' }, ...filteredCategories.slice(0, 7)];
  }, [filteredCategories]);

  const selectedSheetCategory = useMemo(() => {
    if (!selectedSheetCategoryId) return null;
    return filteredCategories.find((item: any) => String(item.id) === selectedSheetCategoryId) || null;
  }, [filteredCategories, selectedSheetCategoryId]);

  const accent = getLanguageAccent(language);
  const sheetText = getSheetTexts(language);

  const closeSheet = () => {
    setSelectedSheetCategoryId(null);
    setSheetOpen(false);
  };

  const selectCategoryOnly = (categoryId: string) => {
    onSelectCategory(categoryId);
    onClearSubcategory?.();
    closeSheet();
  };

  const selectSubcategory = (categoryId: string, subcategory: string) => {
    onSelectCategory(categoryId);
    onSelectSubcategory?.(subcategory);
    closeSheet();
  };

  return (
    <>
      <div style={{ padding: '0 12px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '0 1px 2px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {visibleCategories.map((category: any) => {
            const categoryId = String(category.id);
            const isMore = categoryId === 'more';
            const isActive = !isMore && activeCategory === categoryId;
            const label = getCategoryLabel(category, language);
            const visual = getCategoryVisual(category);

            return (
              <button
                key={categoryId}
                type="button"
                onClick={() => {
                  if (isMore) {
                    setSelectedSheetCategoryId(null);
                    setSheetOpen(true);
                    return;
                  }

                  onSelectCategory(categoryId);
                  onClearSubcategory?.();
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  minWidth: 74,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 22,
                    border: isActive ? `1.8px solid ${accent.border}` : '1.2px solid #cfc8be',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive
                      ? `0 0 0 4px ${accent.glow}, 0 2px 8px rgba(0,0,0,0.03)`
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    overflow: 'hidden',
                  }}
                >
                  {visual?.type === 'image' ? (
                    <img
                      src={visual.value}
                      alt={label}
                      style={{
                        width: '76%',
                        height: '76%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : visual?.type === 'emoji' ? (
                    <span style={{ fontSize: 38, lineHeight: 1 }}>{visual.value}</span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '0 8px',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: isActive ? 900 : 700,
                    color: '#1f2937',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sheetOpen ? (
        <div
          onClick={closeSheet}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            background: 'rgba(17,17,17,0.38)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 12px calc(18px + env(safe-area-inset-bottom))',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 430,
              maxHeight: '78vh',
              background: '#fffefa',
              border: '2px solid #111111',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                padding: '18px 18px 14px',
                borderBottom: '1.5px solid #eee7dc',
                display: 'grid',
                gridTemplateColumns: '1fr 42px',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 900,
                    color: '#17130f',
                    lineHeight: 1.1,
                  }}
                >
                  {selectedSheetCategory
                    ? getCategoryLabel(selectedSheetCategory, language)
                    : sheetText.title}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#756b61',
                  }}
                >
                  {selectedSheetCategory ? sheetText.subTitle : sheetText.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  border: '1.6px solid #111111',
                  background: '#ffffff',
                  color: '#17130f',
                  fontSize: 22,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {!selectedSheetCategory ? (
              <div
                style={{
                  padding: 14,
                  overflowY: 'auto',
                  maxHeight: 'calc(78vh - 92px)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredCategories.map((category: any) => {
                    const categoryId = String(category.id);
                    const label = getCategoryLabel(category, language);
                    const visual = getCategoryVisual(category);
                    const isActive = activeCategory === categoryId;

                    return (
                      <button
                        key={categoryId}
                        type="button"
                        onClick={() => setSelectedSheetCategoryId(categoryId)}
                        style={{
                          width: '100%',
                          minHeight: 70,
                          borderRadius: 20,
                          border: isActive ? `2px solid ${accent.border}` : '1.5px solid #111111',
                          background: isActive ? accent.glow : '#ffffff',
                          padding: '10px 12px',
                          display: 'grid',
                          gridTemplateColumns: '54px 1fr auto',
                          alignItems: 'center',
                          gap: 12,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 17,
                            border: '1.2px solid #d8d2c8',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {visual?.type === 'image' ? (
                            <img
                              src={visual.value}
                              alt={label}
                              style={{
                                width: '76%',
                                height: '76%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : visual?.type === 'emoji' ? (
                            <span style={{ fontSize: 30 }}>{visual.value}</span>
                          ) : (
                            <span style={{ fontSize: 22 }}>□</span>
                          )}
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: '#17130f',
                            }}
                          >
                            {label}
                          </div>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#756b61',
                            }}
                          >
                            {Array.isArray(category.subcategories)
                              ? `${category.subcategories.length} ${sheetText.subTitle.toLowerCase()}`
                              : sheetText.subTitle}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: '#17130f',
                          }}
                        >
                          ›
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 14,
                  overflowY: 'auto',
                  maxHeight: 'calc(78vh - 92px)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedSheetCategoryId(null)}
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 18,
                    border: '1.5px solid #111111',
                    background: '#ffffff',
                    color: '#17130f',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                    marginBottom: 12,
                  }}
                >
                  ← {sheetText.back}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => selectCategoryOnly(String(selectedSheetCategory.id))}
                    style={{
                      width: '100%',
                      minHeight: 58,
                      borderRadius: 18,
                      border:
                        !activeSubcategory && activeCategory === String(selectedSheetCategory.id)
                          ? `2px solid ${accent.border}`
                          : '1.5px solid #111111',
                      background:
                        !activeSubcategory && activeCategory === String(selectedSheetCategory.id)
                          ? accent.glow
                          : '#ffffff',
                      color: '#17130f',
                      fontSize: 17,
                      fontWeight: 900,
                      textAlign: 'left',
                      padding: '0 16px',
                      cursor: 'pointer',
                    }}
                  >
                    {sheetText.allInCategory}
                  </button>

                  {(selectedSheetCategory.subcategories || []).map((subcategory: string) => {
                    const isActiveSub =
                      activeCategory === String(selectedSheetCategory.id) &&
                      activeSubcategory === subcategory;

                    return (
                      <button
                        key={`${selectedSheetCategory.id}-${subcategory}`}
                        type="button"
                        onClick={() => selectSubcategory(String(selectedSheetCategory.id), subcategory)}
                        style={{
                          width: '100%',
                          minHeight: 58,
                          borderRadius: 18,
                          border: isActiveSub
                            ? `2px solid ${accent.border}`
                            : '1.5px solid #d8d2c8',
                          background: isActiveSub ? accent.glow : '#ffffff',
                          color: '#17130f',
                          fontSize: 16,
                          fontWeight: 900,
                          textAlign: 'left',
                          padding: '0 16px',
                          cursor: 'pointer',
                        }}
                      >
                        {getSubcategoryLabel(subcategory, language)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
