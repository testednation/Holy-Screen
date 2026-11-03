import {
  BuiltinWidgetType,
  DailyTehillimData,
  HaYomYomEntry,
  WeatherData,
  ZmanimData,
} from '../types/dashboard';

export type AppLanguage = 'en' | 'fr' | 'es' | 'ru';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  shortCode: string;
  locale: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    shortCode: 'EN',
    locale: 'en-US',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    shortCode: 'FR',
    locale: 'fr-FR',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    shortCode: 'ES',
    locale: 'es-ES',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Русский',
    shortCode: 'RU',
    locale: 'ru-RU',
  },
];

export interface UIStrings {
  navHomescreen: string;
  navInfographic: string;
  navZmanimSky: string;
  navParshaLimud: string;
  navShabbatChesed: string;
  customizeWidgets: string;
  workspaceHeroTitle: string;
  today: string;
  previousDay: string;
  nextDay: string;
  returnToToday: string;
  exitInfographic: string;
  infographicView: string;
  finishEditingGrid: string;
  editGridLayout: string;
  daylightMode: string;
  nightfallMode: string;
  downloadOfflineApp: string;
  offlineAppReady: string;
  sunriseCardTitle: string;
  latestShemaLabel: string;
  sunsetCardTitle: string;
  shaahZmanitLabel: string;
  shabbatCardPrefix: string;
  havdalahLabel: string;
  atmosphericConditions: string;
  highTempLabel: string;
  lowTempLabel: string;
  loadingLabel: string;
  noWidgetsTitle: string;
  noWidgetsSubtitle: string;
  openWidgetGallery: string;
  dragToReorder: string;
  footerSummary: string;
  footerAddConfigureWidgets: string;
  activeLabel: string;
  jumpToDateTitle: string;
  selectOrTypeDate: string;
  quickHorizonJumps: string;
  upcomingErevShabbat: string;
  upcomingShabbatKodesh: string;
  nextRoshChodesh: string;
  plus7Days: string;
  minus7Days: string;
  plus30Days: string;
  selectHorizonCoords: string;
  searchAnyCityPlaceholder: string;
  detectingGps: string;
  useBrowserGps: string;
  searchResultsLabel: string;
  curatedCommunitiesLabel: string;
  languageLabel: string;
  openInSefariaReader: string;
  featuredVerse: string;
  readChapter: string;
  todaysChapters: string;
  recitedLabel: string;
  saveToKavanot: string;
  savedToKavanot: string;
  dailyAvodahLabel: string;
  dailyTehillimLabel: string;
  dailyTanyaLabel: string;
  chassidicDailyAlmanac: string;
  monthlyTehillimCycle: string;
  dayLabel: string;
}

export const UI_TRANSLATIONS: Record<AppLanguage, UIStrings> = {
  en: {
    navHomescreen: 'Homescreen',
    navInfographic: 'Infographic View',
    navZmanimSky: 'Zmanim & Sky',
    navParshaLimud: 'Parsha & Limud',
    navShabbatChesed: 'Shabbat & Chesed',
    customizeWidgets: 'Customize Widgets',
    workspaceHeroTitle: 'Daily Luach, Halachic Horizon & Study Sanctuary',
    today: 'Today',
    previousDay: 'Previous Day',
    nextDay: 'Next Day',
    returnToToday: 'Today',
    exitInfographic: 'Exit Infographic',
    infographicView: 'Infographic View',
    finishEditingGrid: 'Finish Editing Grid',
    editGridLayout: 'Edit Grid Layout',
    daylightMode: 'Daylight',
    nightfallMode: 'Nightfall',
    downloadOfflineApp: 'Download Offline App',
    offlineAppReady: 'Offline App Ready',
    sunriseCardTitle: 'Sunrise (Netz HaChama)',
    latestShemaLabel: 'Latest Shema',
    sunsetCardTitle: 'Sunset (Shkiah)',
    shaahZmanitLabel: 'Sha’ah Zmanit',
    shabbatCardPrefix: 'Shabbat',
    havdalahLabel: 'Havdalah',
    atmosphericConditions: 'Atmospheric Conditions',
    highTempLabel: 'High',
    lowTempLabel: 'Low',
    loadingLabel: 'Loading...',
    noWidgetsTitle: 'No Widgets Active in This View',
    noWidgetsSubtitle:
      'Open the Widget Gallery to enable Zmanim, Weather, Parsha, Daily Limud, or create your own custom homescreen widget.',
    openWidgetGallery: 'Open Widget Gallery',
    dragToReorder: 'Drag to Reorder',
    footerSummary:
      'Orah Personal Luach & Homescreen · Astronomical Zmanim, Sefaria Study & Open-Meteo Forecast',
    footerAddConfigureWidgets: '+ Add or Configure Widgets',
    activeLabel: 'active',
    jumpToDateTitle: 'Jump to Date · Retrospective & Future Luach',
    selectOrTypeDate: 'Select or Type Any Gregorian Date',
    quickHorizonJumps: 'Quick Horizon & Planning Jumps',
    upcomingErevShabbat: 'Upcoming Erev Shabbat',
    upcomingShabbatKodesh: 'Upcoming Shabbat Kodesh',
    nextRoshChodesh: 'Next Rosh Chodesh (א׳)',
    plus7Days: '+7 Days (Next Week)',
    minus7Days: '-7 Days (1 Week Ago)',
    plus30Days: '+30 Days (Next Month)',
    selectHorizonCoords: 'Select Halachic Horizon & Coordinates',
    searchAnyCityPlaceholder: 'Search any city worldwide...',
    detectingGps: 'Detecting GPS Coordinates...',
    useBrowserGps: 'Use Browser GPS Coordinates',
    searchResultsLabel: 'Search Results',
    curatedCommunitiesLabel: 'Curated Communities',
    languageLabel: 'Language',
    openInSefariaReader: 'Open in Sefaria Reader',
    featuredVerse: 'Featured Verse',
    readChapter: 'Read Chapter',
    todaysChapters: 'Today’s Chapters',
    recitedLabel: 'recited',
    saveToKavanot: 'Save to Kavanot',
    savedToKavanot: 'Saved to Kavanot',
    dailyAvodahLabel: 'Daily Avodah',
    dailyTehillimLabel: 'תהילים יומי · Daily Tehillim',
    dailyTanyaLabel: 'תניא יומי · Daily Tanya',
    chassidicDailyAlmanac: 'לוח היום יום · Chassidic Daily Almanac',
    monthlyTehillimCycle: 'תהילים יומי · Monthly Tehillim Cycle',
    dayLabel: 'Day',
  },
  fr: {
    navHomescreen: 'Accueil',
    navInfographic: 'Vue Infographique',
    navZmanimSky: 'Zmanim & Ciel',
    navParshaLimud: 'Paracha & Étude',
    navShabbatChesed: 'Chabbat & Tsédaka',
    customizeWidgets: 'Personnaliser',
    workspaceHeroTitle: 'Louah Quotidien, Horizon Halakhique & Sanctuaire d’Étude',
    today: 'Aujourd’hui',
    previousDay: 'Jour précédent',
    nextDay: 'Jour suivant',
    returnToToday: 'Aujourd’hui',
    exitInfographic: 'Quitter l’Infographie',
    infographicView: 'Vue Infographique',
    finishEditingGrid: 'Terminer la disposition',
    editGridLayout: 'Modifier la grille',
    daylightMode: 'Jour',
    nightfallMode: 'Nuit',
    downloadOfflineApp: 'App Hors-Ligne',
    offlineAppReady: 'App Hors-Ligne Prête',
    sunriseCardTitle: 'Lever du soleil (Nets HaHama)',
    latestShemaLabel: 'Fin du Chéma',
    sunsetCardTitle: 'Coucher du soleil (Chkia)',
    shaahZmanitLabel: 'Cha’a Zmanit',
    shabbatCardPrefix: 'Chabbat',
    havdalahLabel: 'Havdala',
    atmosphericConditions: 'Conditions Atmosphériques',
    highTempLabel: 'Max',
    lowTempLabel: 'Min',
    loadingLabel: 'Chargement...',
    noWidgetsTitle: 'Aucun widget actif dans cette vue',
    noWidgetsSubtitle:
      'Ouvrez la galerie de widgets pour activer les Zmanim, la Météo, la Paracha, le Limoud quotidien ou créer votre propre widget.',
    openWidgetGallery: 'Ouvrir la galerie de widgets',
    dragToReorder: 'Glisser pour réorganiser',
    footerSummary:
      'Orah Louah Personnel · Zmanim Astronomiques, Étude Sefaria & Prévisions Open-Meteo',
    footerAddConfigureWidgets: '+ Ajouter ou configurer des widgets',
    activeLabel: 'actifs',
    jumpToDateTitle: 'Aller à une date · Louah passé et futur',
    selectOrTypeDate: 'Sélectionnez une date grégorienne',
    quickHorizonJumps: 'Accès rapides du calendrier',
    upcomingErevShabbat: 'Prochain Érev Chabbat',
    upcomingShabbatKodesh: 'Prochain Chabbat Kodech',
    nextRoshChodesh: 'Prochain Roch Hodech (א׳)',
    plus7Days: '+7 Jours (Semaine prochaine)',
    minus7Days: '-7 Jours (Semaine dernière)',
    plus30Days: '+30 Jours (Mois prochain)',
    selectHorizonCoords: 'Choisir l’horizon halakhique et les coordonnées',
    searchAnyCityPlaceholder: 'Rechercher une ville dans le monde...',
    detectingGps: 'Détection GPS en cours...',
    useBrowserGps: 'Utiliser ma position GPS actuelle',
    searchResultsLabel: 'Résultats de recherche',
    curatedCommunitiesLabel: 'Communautés principales',
    languageLabel: 'Langue',
    openInSefariaReader: 'Ouvrir dans Sefaria',
    featuredVerse: 'Verset du jour',
    readChapter: 'Lire le chapitre',
    todaysChapters: 'Chapitres du jour',
    recitedLabel: 'récités',
    saveToKavanot: 'Enregistrer (Kavanot)',
    savedToKavanot: 'Enregistré dans Kavanot',
    dailyAvodahLabel: 'Avoda du jour',
    dailyTehillimLabel: 'תהילים יומי · Téhilim du jour',
    dailyTanyaLabel: 'תניא יומי · Tanya du jour',
    chassidicDailyAlmanac: 'לוח היום יום · Almanach Hassidique Quotidien',
    monthlyTehillimCycle: 'תהילים יומי · Cycle Mensuel des Téhilim',
    dayLabel: 'Jour',
  },
  es: {
    navHomescreen: 'Inicio',
    navInfographic: 'Vista Infográfica',
    navZmanimSky: 'Zmanim y Cielo',
    navParshaLimud: 'Parashá y Estudio',
    navShabbatChesed: 'Shabat y Tzedaká',
    customizeWidgets: 'Personalizar Widgets',
    workspaceHeroTitle: 'Luaj Diario, Horizonte Halájico y Santuario de Estudio',
    today: 'Hoy',
    previousDay: 'Día anterior',
    nextDay: 'Día siguiente',
    returnToToday: 'Hoy',
    exitInfographic: 'Salir de Infografía',
    infographicView: 'Vista Infográfica',
    finishEditingGrid: 'Finalizar cuadrícula',
    editGridLayout: 'Editar cuadrícula',
    daylightMode: 'Día',
    nightfallMode: 'Noche',
    downloadOfflineApp: 'Descargar App Offline',
    offlineAppReady: 'App Offline Lista',
    sunriseCardTitle: 'Amanecer (Netz HaJamá)',
    latestShemaLabel: 'Límite Shemá',
    sunsetCardTitle: 'Puesta del sol (Shkiá)',
    shaahZmanitLabel: 'Sha’á Zmanit',
    shabbatCardPrefix: 'Shabat',
    havdalahLabel: 'Havdalá',
    atmosphericConditions: 'Condiciones Atmosféricas',
    highTempLabel: 'Máx',
    lowTempLabel: 'Mín',
    loadingLabel: 'Cargando...',
    noWidgetsTitle: 'No hay widgets activos en esta vista',
    noWidgetsSubtitle:
      'Abra la Galería de Widgets para activar Zmanim, Clima, Parashá, Limud diario o crear su propio widget personalizado.',
    openWidgetGallery: 'Abrir Galería de Widgets',
    dragToReorder: 'Arrastrar para reordenar',
    footerSummary:
      'Orah Luaj Personal · Zmanim Astronómicos, Estudio Sefaria y Pronóstico Open-Meteo',
    footerAddConfigureWidgets: '+ Añadir o configurar widgets',
    activeLabel: 'activos',
    jumpToDateTitle: 'Ir a Fecha · Luaj Pasado y Futuro',
    selectOrTypeDate: 'Seleccione cualquier fecha gregoriana',
    quickHorizonJumps: 'Saltos rápidos de planificación',
    upcomingErevShabbat: 'Próximo Erev Shabat',
    upcomingShabbatKodesh: 'Próximo Shabat Kodesh',
    nextRoshChodesh: 'Próximo Rosh Jodesh (א׳)',
    plus7Days: '+7 Días (Próxima semana)',
    minus7Days: '-7 Días (Hace 1 semana)',
    plus30Days: '+30 Días (Próximo mes)',
    selectHorizonCoords: 'Seleccionar Horizonte Halájico y Coordenadas',
    searchAnyCityPlaceholder: 'Buscar cualquier ciudad del mundo...',
    detectingGps: 'Detectando coordenadas GPS...',
    useBrowserGps: 'Usar coordenadas GPS del navegador',
    searchResultsLabel: 'Resultados de búsqueda',
    curatedCommunitiesLabel: 'Comunidades destacadas',
    languageLabel: 'Idioma',
    openInSefariaReader: 'Abrir en Lector Sefaria',
    featuredVerse: 'Versículo destacado',
    readChapter: 'Leer capítulo',
    todaysChapters: 'Capítulos de hoy',
    recitedLabel: 'recitados',
    saveToKavanot: 'Guardar en Kavanot',
    savedToKavanot: 'Guardado en Kavanot',
    dailyAvodahLabel: 'Avodá diaria',
    dailyTehillimLabel: 'תהילים יומי · Tehilim Diario',
    dailyTanyaLabel: 'תניא יומי · Tania Diario',
    chassidicDailyAlmanac: 'לוח היום יום · Almanaque Jasídico Diario',
    monthlyTehillimCycle: 'תהילים יומי · Ciclo Mensual de Tehilim',
    dayLabel: 'Día',
  },
  ru: {
    navHomescreen: 'Главная',
    navInfographic: 'Инфографика',
    navZmanimSky: 'Зманим и Небо',
    navParshaLimud: 'Парша и Учёба',
    navShabbatChesed: 'Шаббат и Цдака',
    customizeWidgets: 'Настроить виджеты',
    workspaceHeroTitle: 'Ежедневный Луах, Галахический Горизонт и Дом Учения',
    today: 'Сегодня',
    previousDay: 'Предыдущий день',
    nextDay: 'Следующий день',
    returnToToday: 'Сегодня',
    exitInfographic: 'Закрыть инфографику',
    infographicView: 'Инфографика',
    finishEditingGrid: 'Готово',
    editGridLayout: 'Изменить сетку',
    daylightMode: 'День',
    nightfallMode: 'Ночь',
    downloadOfflineApp: 'Скачать офлайн-приложение',
    offlineAppReady: 'Офлайн-режим готов',
    sunriseCardTitle: 'Восход (Нец а-Хама)',
    latestShemaLabel: 'Конец чтения Шма',
    sunsetCardTitle: 'Закат (Шкия)',
    shaahZmanitLabel: 'Шаа Зманит',
    shabbatCardPrefix: 'Шаббат',
    havdalahLabel: 'Авдала',
    atmosphericConditions: 'Погодные условия',
    highTempLabel: 'Макс',
    lowTempLabel: 'Мин',
    loadingLabel: 'Загрузка...',
    noWidgetsTitle: 'В этом разделе нет активных виджетов',
    noWidgetsSubtitle:
      'Откройте галерею виджетов, чтобы включить Зманим, Погоду, Недельную главу, ежедневные уроки или создать свой виджет.',
    openWidgetGallery: 'Открыть галерею виджетов',
    dragToReorder: 'Перетащите для изменения порядка',
    footerSummary:
      'Orah Персональный Луах · Астрономические Зманим, Тексты Sefaria и Прогноз Open-Meteo',
    footerAddConfigureWidgets: '+ Добавить или настроить виджеты',
    activeLabel: 'активно',
    jumpToDateTitle: 'Переход к дате · Прошлый и будущий Луах',
    selectOrTypeDate: 'Выберите григорианскую дату',
    quickHorizonJumps: 'Быстрые переходы по датам',
    upcomingErevShabbat: 'Ближайший Эрев Шаббат',
    upcomingShabbatKodesh: 'Ближайший Шаббат Кодеш',
    nextRoshChodesh: 'Следующий Рош Ходеш (א׳)',
    plus7Days: '+7 дней (След. неделя)',
    minus7Days: '-7 дней (Неделю назад)',
    plus30Days: '+30 дней (След. месяц)',
    selectHorizonCoords: 'Выбрать галахический горизонт и координаты',
    searchAnyCityPlaceholder: 'Поиск любого города мира...',
    detectingGps: 'Определение GPS-координат...',
    useBrowserGps: 'Использовать текущие GPS-координаты',
    searchResultsLabel: 'Результаты поиска',
    curatedCommunitiesLabel: 'Избранные общины',
    languageLabel: 'Язык',
    openInSefariaReader: 'Открыть в Sefaria Reader',
    featuredVerse: 'Стих дня',
    readChapter: 'Читать главу',
    todaysChapters: 'Главы на сегодня',
    recitedLabel: 'прочитано',
    saveToKavanot: 'Сохранить в Каванот',
    savedToKavanot: 'Сохранено в Каванот',
    dailyAvodahLabel: 'Авода дня',
    dailyTehillimLabel: 'תהילים יומי · Теилим на день',
    dailyTanyaLabel: 'תניא יומי · Тания на день',
    chassidicDailyAlmanac: 'לוח היום יום · Хасидский календарь «Айом Йом»',
    monthlyTehillimCycle: 'תהילים יומי · Месячный цикл Теилим',
    dayLabel: 'День',
  },
};

const WIDGET_TITLE_TRANSLATIONS: Record<
  AppLanguage,
  Partial<Record<BuiltinWidgetType, string>>
> = {
  en: {},
  fr: {
    zmanim: 'Zmanim Halakhiques & Horizon Solaire',
    mini_calendar: 'Mini Calendrier · Louah Mensuel Hébraïque',
    upcoming_holidays: 'Prochaines Fêtes · Compte à Rebours',
    hayom_yom: 'HaYom Yom · לוח היום יום',
    daily_tehillim: 'Téhilim du Jour · תהילים יומי',
    daf_yomi: 'Daf Yomi & Suivi du Traité',
    daily_thought: 'Pensée du Jour · Michna & Paracha',
    prayer_direction: 'Direction de la Prière · Boussole Mizrah',
    daily_minyan: 'Minyan Quotidien · Horaires de Synagogue',
    weather: 'Météo Locale & Clarté du Ciel',
    parsha: 'Paracha de la Semaine & Chnayim Mikra',
    limud: 'Limoud Quotidien & Programme d’Étude',
    shabbat_prep: 'Préparatifs de Érev Chabbat',
    tzedakah: 'Registre de Maasser & Tsédaka',
    notes: 'Kavanot & Noms pour Réfoua Chéléma',
    world_clocks: 'Horloges Halakhiques Mondiales',
  },
  es: {
    zmanim: 'Zmanim Halájicos y Horizonte Solar',
    mini_calendar: 'Mini Calendario · Luaj Mensual Hebreo',
    upcoming_holidays: 'Próximas Festividades · Cuenta Regresiva',
    hayom_yom: 'HaYom Yom · לוח היום יום',
    daily_tehillim: 'Tehilim Diario · תהילים יומי',
    daf_yomi: 'Daf Yomi y Progreso del Tratado',
    daily_thought: 'Pensamiento Diario · Mishná y Parashá',
    prayer_direction: 'Dirección de Rezo · Brújula Mizraj',
    daily_minyan: 'Minián Diario · Horarios de Sinagoga',
    weather: 'Clima Local y Claridad del Cielo',
    parsha: 'Parashá Semanal y Shnayim Mikrá',
    limud: 'Limud Diario y Ciclos de Estudio',
    shabbat_prep: 'Lista de Preparación para Erev Shabat',
    tzedakah: 'Calculadora de Maaser y Tzedaká',
    notes: 'Kavanot y Nombres de Refuá Shelemá',
    world_clocks: 'Relojes Halájicos Mundiales',
  },
  ru: {
    zmanim: 'Галахические Зманим и Солнечный Горизонт',
    mini_calendar: 'Мини-Календарь · Еврейский Месяц',
    upcoming_holidays: 'Ближайшие Праздники · Обратный Отсчёт',
    hayom_yom: 'Айом Йом · לוח היום יום',
    daily_tehillim: 'Теилим на День · תהילים יומי',
    daf_yomi: 'Даф Йоми и Прогресс Трактата',
    daily_thought: 'Мысль Дня · Мишна и Недельная Глава',
    prayer_direction: 'Направление Молитвы · Компас Мизрах',
    daily_minyan: 'Ежедневный Миньян · Расписание Синагоги',
    weather: 'Погода и Видимость Звёзд',
    parsha: 'Недельная Глава и Шнаим Микра',
    limud: 'Ежедневные Уроки (Хитас, Рамбам, Мишна)',
    shabbat_prep: 'Подготовка к Эрев Шаббат',
    tzedakah: 'Учёт Маасера и Цдаки',
    notes: 'Каванот и Имена для Молитвы',
    world_clocks: 'Мировые Галахические Часы',
  },
};

export function localizeWidgetTitle(
  type: BuiltinWidgetType,
  defaultTitle: string,
  lang: AppLanguage
): string {
  if (lang === 'en') return defaultTitle;
  return WIDGET_TITLE_TRANSLATIONS[lang]?.[type] || defaultTitle;
}

const ZMAN_LOCALIZATION: Record<
  Exclude<AppLanguage, 'en'>,
  Record<string, { title: string; description: string; note: string }>
> = {
  fr: {
    alot: {
      title: 'Alot HaChahar (Aube)',
      description: 'Aube halakhique · Début des mitsvot de la journée',
      note: 'Abaissement solaire de 16,1° sous l’horizon est (ou 72 min)',
    },
    misheyakir: {
      title: 'Michéyakir (Talit & Téfiline)',
      description: 'Heure la plus tôt pour le Talit et les Téfiline',
      note: 'Abaissement solaire de 11,5° sous l’horizon est',
    },
    sunrise: {
      title: 'Nets HaHama (Lever du soleil)',
      description: 'Lever du soleil halakhique · Heure idéale pour la Amida (Vassikin)',
      note: 'Apparition du bord supérieur du soleil à l’horizon',
    },
    shema_mga: {
      title: 'Fin du Chéma (Maguen Avraham)',
      description: 'Heure limite du Chéma selon le Maguen Avraham',
      note: '3 heures proportionnelles depuis l’aube (Alot) jusqu’à la nuit',
    },
    shema_gra: {
      title: 'Fin du Chéma (GRA / Baal HaTanya)',
      description: 'Heure limite du Chéma selon le Gaon de Vilna et l’Admour HaZaken',
      note: '3 heures proportionnelles du lever (Nets) au coucher (Chkia)',
    },
    tefillah: {
      title: 'Fin de la Téfila (Chaharit)',
      description: 'Heure limite pour la Amida du matin',
      note: '4 heures proportionnelles après le début du jour',
    },
    chatzot: {
      title: 'Hatsot HaYom (Midi solaire)',
      description: 'Midi halakhique · Zénith solaire',
      note: 'Milieu exact entre le lever et le coucher du soleil (6 heures)',
    },
    mincha_gedolah: {
      title: 'Minha Guédola',
      description: 'Heure la plus tôt pour la prière de Minha',
      note: '6,5 heures proportionnelles (30 min après Hatsot)',
    },
    mincha_ketanah: {
      title: 'Minha Kétana',
      description: 'Heure privilégiée de l’après-midi pour Minha',
      note: '9,5 heures proportionnelles (2,5 h avant le coucher)',
    },
    plag: {
      title: 'Plag HaMinha',
      description: 'Transition · Allumage anticipé des bougies de Chabbat & Arvit',
      note: '10,75 heures proportionnelles (1,25 h avant le coucher)',
    },
    sunset: {
      title: 'Chkia (Coucher du soleil)',
      description: 'Coucher halakhique · Début du crépuscule (Bein HaChémachot)',
      note: 'Heure limite pour Minha et les mitsvot du jour',
    },
    tzeit: {
      title: 'Tseit HaKokhavim (Sortie des étoiles)',
      description: 'Tombée de la nuit · Arvit, Chéma et Décompte de l’Omer',
      note: 'Abaissement solaire de 8,5° (3 étoiles moyennes)',
    },
    rabbeinu_tam: {
      title: 'Tseit Rabbénou Tam',
      description: 'Sortie des étoiles selon Rabbénou Tam (Fin de Chabbat)',
      note: '72 minutes fixes après le coucher du soleil (Chkia)',
    },
    chatzot_night: {
      title: 'Hatsot HaLayla (Minuit halakhique)',
      description: 'Minuit solaire · Tikoun Hatsot & heure idéale de fin de l’Afikomane',
      note: '12 heures exactement après Hatsot HaYom',
    },
  },
  es: {
    alot: {
      title: 'Alot HaShajar (Alba)',
      description: 'Alba halájica · Inicio de las obligaciones diurnas',
      note: 'Depresión solar de 16.1° bajo el horizonte oriental (o 72 min)',
    },
    misheyakir: {
      title: 'Misheyakir (Talit y Tefilín)',
      description: 'Hora más temprana para Talit y Tefilín',
      note: 'Depresión solar de 11.5° bajo el horizonte',
    },
    sunrise: {
      title: 'Netz HaJamá (Amanecer)',
      description: 'Amanecer halájico · Hora ideal para la Amidá (Vasikín)',
      note: 'Borde superior del sol visible en el horizonte',
    },
    shema_mga: {
      title: 'Fin de Shemá (Maguén Avraham)',
      description: 'Hora límite del Shemá según Maguén Avraham',
      note: '3 horas proporcionales desde el alba hasta la noche',
    },
    shema_gra: {
      title: 'Fin de Shemá (GRA / Baal HaTania)',
      description: 'Hora límite del Shemá según el Gaón de Vilna y el Alter Rebe',
      note: '3 horas proporcionales desde el amanecer hasta la puesta del sol',
    },
    tefillah: {
      title: 'Fin de Tefilá (Shajarit)',
      description: 'Hora límite para la Amidá matutina',
      note: '4 horas proporcionales del día halájico',
    },
    chatzot: {
      title: 'Jatzot HaYom (Mediodía solar)',
      description: 'Mediodía halájico · Cenit solar',
      note: 'Punto medio exacto entre el amanecer y la puesta del sol',
    },
    mincha_gedolah: {
      title: 'Minjá Guedolá',
      description: 'Hora más temprana para rezar Minjá por la tarde',
      note: '6.5 horas proporcionales del día (mín. 30 min tras Jatzot)',
    },
    mincha_ketanah: {
      title: 'Minjá Ketaná',
      description: 'Ventana preferida de la tarde para Minjá',
      note: '9.5 horas proporcionales (2.5 h antes de la puesta del sol)',
    },
    plag: {
      title: 'Plag HaMinjá',
      description: 'Transición · Encendido temprano de velas de Shabat y Maariv',
      note: '10.75 horas proporcionales (1.25 h antes de la puesta del sol)',
    },
    sunset: {
      title: 'Shkiá (Puesta del sol)',
      description: 'Puesta del sol halájica · Inicio de Bein HaShemashot',
      note: 'Hora límite para Minjá y las mitzvot del día',
    },
    tzeit: {
      title: 'Tzeit HaKojavim (Salida de las estrellas)',
      description: 'Anochecer · Maariv, Shemá y Cuenta del Omer',
      note: 'Depresión solar de 8.5° (aparición de tres estrellas medianas)',
    },
    rabbeinu_tam: {
      title: 'Tzeit Rabeinu Tam',
      description: 'Anochecer según Rabeinu Tam',
      note: '72 minutos después de la puesta del sol (Shkiá)',
    },
    chatzot_night: {
      title: 'Jatzot HaLaila (Medianoche halájica)',
      description: 'Medianoche solar · Tikún Jatzot',
      note: '12 horas después del mediodía halájico (Jatzot HaYom)',
    },
  },
  ru: {
    alot: {
      title: 'Алот а-Шахар (Рассвет)',
      description: 'Галахический рассвет · Начало дневных заповедей',
      note: 'Солнце на 16,1° ниже горизонта (или 72 мин до восхода)',
    },
    misheyakir: {
      title: 'Мишеякир (Талит и Тфилин)',
      description: 'Самое раннее время для облачения в Талит и Тфилин',
      note: 'Солнце на 11,5° ниже восточного горизонта',
    },
    sunrise: {
      title: 'Нец а-Хама (Восход солнца)',
      description: 'Галахический восход · Время молитвы Ватикин',
      note: 'Появление верхнего края солнечного диска над горизонтом',
    },
    shema_mga: {
      title: 'Конец времени Шма (Маген Авраам)',
      description: 'Последнее время чтения Шма по мнению Маген Авраама',
      note: '3 пропорциональных часа от рассвета (Алот) до выхода звёзд',
    },
    shema_gra: {
      title: 'Конец времени Шма (Агра / Бааль а-Тания)',
      description: 'Последнее время чтения Шма по мнению Виленского Гаона и Алтер Ребе',
      note: '3 пропорциональных часа от восхода (Нец) до заката (Шкия)',
    },
    tefillah: {
      title: 'Конец времени Тфилы (Шахарит)',
      description: 'Последнее время чтения утренней Амиды',
      note: '4 пропорциональных часа от начала галахического дня',
    },
    chatzot: {
      title: 'Хацот а-Йом (Полдень)',
      description: 'Галахический полдень · Зенит солнца',
      note: 'Точная середина между восходом и закатом (6 часов)',
    },
    mincha_gedolah: {
      title: 'Минха Гдола',
      description: 'Самое раннее время дневной молитвы Минха',
      note: '6,5 пропорциональных часов (минимум 30 мин после полудня)',
    },
    mincha_ketanah: {
      title: 'Минха Ктана',
      description: 'Предпочтительное время послеполуденной молитвы Минха',
      note: '9,5 пропорциональных часов (за 2,5 часа до заката)',
    },
    plag: {
      title: 'Плаг а-Минха',
      description: 'Раннее зажигание субботних свечей и молитва Маарив',
      note: '10,75 пропорциональных часов (за 1,25 часа до заката)',
    },
    sunset: {
      title: 'Шкия (Закат солнца)',
      description: 'Галахический закат · Начало сумерек (Бейн а-Шмашот)',
      note: 'Завершение времени молитвы Минха и дневных заповедей',
    },
    tzeit: {
      title: 'Цет а-Кохавим (Выход звёзд)',
      description: 'Наступление ночи · Маарив, Шма и Сфират а-Омер',
      note: 'Погружение солнца на 8,5° (появление трёх средних звёзд)',
    },
    rabbeinu_tam: {
      title: 'Цет Рабейну Там',
      description: 'Выход звёзд по мнению Рабейну Тама',
      note: '72 минуты после галахического заката (Шкия)',
    },
    chatzot_night: {
      title: 'Хацот а-Лайла (Полночь)',
      description: 'Галахическая полночь · Тикун Хацот',
      note: 'Ровно через 12 часов после солнечного полудня',
    },
  },
};

export function localizeZmanimData(
  zmanim: ZmanimData,
  lang: AppLanguage
): ZmanimData {
  if (lang === 'en') return zmanim;
  const map = ZMAN_LOCALIZATION[lang];
  return {
    ...zmanim,
    items: zmanim.items.map((item) => {
      const loc = map[item.id];
      if (!loc) return item;
      return {
        ...item,
        titleEn: loc.title,
        description: loc.description,
        halachicNote: loc.note,
      };
    }),
  };
}

const WEATHER_CONDITION_TRANSLATIONS: Record<
  Exclude<AppLanguage, 'en'>,
  Record<string, string>
> = {
  fr: {
    'Clear Sky': 'Ciel dégagé',
    'Mainly Clear': 'Principalement dégagé',
    'Partly Cloudy': 'Partiellement nuageux',
    Overcast: 'Couvert',
    'Foggy Mist': 'Brouillard',
    'Light Drizzle': 'Bruine légère',
    'Moderate Rain': 'Pluie modérée',
    'Heavy Rain': 'Forte pluie',
    'Snow Showers': 'Averses de neige',
    Thunderstorm: 'Orage',
  },
  es: {
    'Clear Sky': 'Cielo despejado',
    'Mainly Clear': 'Mayormente despejado',
    'Partly Cloudy': 'Parcialmente nublado',
    Overcast: 'Nublado',
    'Foggy Mist': 'Niebla',
    'Light Drizzle': 'Llovizna ligera',
    'Moderate Rain': 'Lluvia moderada',
    'Heavy Rain': 'Lluvia intensa',
    'Snow Showers': 'Nevadas',
    Thunderstorm: 'Tormenta eléctrica',
  },
  ru: {
    'Clear Sky': 'Ясное небо',
    'Mainly Clear': 'Малооблачно',
    'Partly Cloudy': 'Переменная облачность',
    Overcast: 'Пасмурно',
    'Foggy Mist': 'Туман',
    'Light Drizzle': 'Лёгкая морось',
    'Moderate Rain': 'Умеренный дождь',
    'Heavy Rain': 'Сильный дождь',
    'Snow Showers': 'Снегопад',
    Thunderstorm: 'Гроза',
  },
};

export function localizeWeatherData(
  weather: WeatherData | null,
  lang: AppLanguage
): WeatherData | null {
  if (!weather || lang === 'en') return weather;
  const translatedCondition =
    WEATHER_CONDITION_TRANSLATIONS[lang]?.[weather.conditionText] ||
    weather.conditionText;
  return {
    ...weather,
    conditionText: translatedCondition,
  };
}

export function localizeHaYomYomEntry(
  entry: HaYomYomEntry,
  lang: AppLanguage
): HaYomYomEntry {
  if (lang === 'en') return entry;
  const tehillimRangeEn = entry.tehillimRangeEn
    .replace(
      'Chapters',
      lang === 'fr' ? 'Chapitres' : lang === 'es' ? 'Capítulos' : 'Главы'
    )
    .replace(
      'Chapter',
      lang === 'fr' ? 'Chapitre' : lang === 'es' ? 'Capítulo' : 'Глава'
    );
  const tanyaPortionEn = entry.tanyaPortionEn
    .replace(
      'Chapter',
      lang === 'fr' ? 'Chapitre' : lang === 'es' ? 'Capítulo' : 'Глава'
    )
    .replace(
      'Epistle',
      lang === 'fr' ? 'Épître' : lang === 'es' ? 'Epístola' : 'Послание'
    )
    .replace(
      'Essay',
      lang === 'fr' ? 'Essai' : lang === 'es' ? 'Ensayo' : 'Статья'
    );

  return {
    ...entry,
    tehillimRangeEn,
    tanyaPortionEn,
  };
}

export function localizeDailyTehillimData(
  data: DailyTehillimData,
  lang: AppLanguage
): DailyTehillimData {
  if (lang === 'en') return data;

  const chWordPlural =
    lang === 'fr' ? 'Chapitres' : lang === 'es' ? 'Capítulos' : 'Главы';
  const chWordSingular =
    lang === 'fr' ? 'Chapitre' : lang === 'es' ? 'Capítulo' : 'Глава';
  const bookWord =
    lang === 'fr' ? 'Livre' : lang === 'es' ? 'Libro' : 'Книга';

  const rangeLabelEn = data.rangeLabelEn
    .replace('Chapters', chWordPlural)
    .replace('Chapter', chWordSingular);

  const seferTitleEn = data.seferTitleEn
    .replace('Book', bookWord)
    .replace('Ch.', lang === 'ru' ? 'Гл.' : 'Cap.');

  const chapters = data.chapters.map((ch) => ({
    ...ch,
    labelEn: ch.labelEn
      .replace('Chapter', chWordSingular)
      .replace('Ch.', lang === 'ru' ? 'Гл.' : 'Cap.'),
  }));

  return {
    ...data,
    rangeLabelEn,
    seferTitleEn,
    chapters,
  };
}
