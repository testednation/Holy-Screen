import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Globe, Check } from 'lucide-react';
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
  { code: 'en', label: 'English', nativeLabel: 'English', shortCode: 'EN', locale: 'en-US' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', shortCode: 'FR', locale: 'fr-FR' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', shortCode: 'ES', locale: 'es-ES' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', shortCode: 'RU', locale: 'ru-RU' },
];

export const UI_TRANSLATIONS = {
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
    heroSubtitle: 'Daily Luach, Halachic Horizon & Study Sanctuary',
    daylight: 'Daylight',
    nightfall: 'Nightfall',
    sunriseNetz: 'Sunrise (Netz HaChama)',
    latestShema: 'Latest Shema',
    sunsetShkiah: 'Sunset (Shkiah)',
    shaahZmanit: 'Sha’ah Zmanit',
    shabbatCandles: 'Shabbat Candles',
    havdalah: 'Havdalah',
    loading: 'Loading...',
    high: 'High',
    low: 'Low',
    allWidgets: 'All Widgets',
    shabbatChesed: 'Shabbat & Chesed',
    widgetDailyTehillim: 'Daily Tehillim · תהילים יומי',
    openInSefaria: 'Open in Sefaria',
    widgetHaYomYom: 'HaYom Yom · לוח היום יום',
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
    heroSubtitle: 'Louah Quotidien, Horizon Halakhique & Sanctuaire d’Étude',
    daylight: 'Jour',
    nightfall: 'Nuit',
    sunriseNetz: 'Lever du soleil (Nets HaHama)',
    latestShema: 'Fin du Chéma',
    sunsetShkiah: 'Coucher du soleil (Chkia)',
    shaahZmanit: 'Cha’a Zmanit',
    shabbatCandles: 'Bougies de Chabbat',
    havdalah: 'Havdala',
    loading: 'Chargement...',
    high: 'Max',
    low: 'Min',
    allWidgets: 'Tous les widgets',
    shabbatChesed: 'Chabbat & Tsédaka',
    widgetDailyTehillim: 'Téhilim du Jour · תהילים יומי',
    openInSefaria: 'Ouvrir dans Sefaria',
    widgetHaYomYom: 'HaYom Yom · לוח היום יום',
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
    heroSubtitle: 'Luaj Diario, Horizonte Halájico y Santuario de Estudio',
    daylight: 'Día',
    nightfall: 'Noche',
    sunriseNetz: 'Amanecer (Netz HaJamá)',
    latestShema: 'Límite Shemá',
    sunsetShkiah: 'Puesta del Sol (Shkiá)',
    shaahZmanit: 'Sha’á Zmanit',
    shabbatCandles: 'Velas de Shabat',
    havdalah: 'Havdalá',
    loading: 'Cargando...',
    high: 'Máx',
    low: 'Mín',
    allWidgets: 'Todos los widgets',
    shabbatChesed: 'Shabat y Tzedaká',
    widgetDailyTehillim: 'Tehilim Diario · תהילים יומי',
    openInSefaria: 'Abrir en Sefaria',
    widgetHaYomYom: 'HaYom Yom · לוח היום יום',
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
    heroSubtitle: 'Ежедневный Луах, Галахический Горизонт и Дом Учения',
    daylight: 'День',
    nightfall: 'Ночь',
    sunriseNetz: 'Восход (Нец Ха-Хама)',
    latestShema: 'Конец Шма',
    sunsetShkiah: 'Закат (Шкиа)',
    shaahZmanit: 'Шаа Зманит',
    shabbatCandles: 'Свечи Шаббата',
    havdalah: 'Авдала',
    loading: 'Загрузка...',
    high: 'Макс',
    low: 'Мин',
    allWidgets: 'Все виджеты',
    shabbatChesed: 'Шаббат и Цдака',
    widgetDailyTehillim: 'Теилим на День · תהילים יומי',
    openInSefaria: 'Открыть в Sefaria',
    widgetHaYomYom: 'Айом Йом · לוח היום יום',
  },
};

export type UIStrings = typeof UI_TRANSLATIONS.en;

const WIDGET_TITLE_TRANSLATIONS: Record<
  AppLanguage,
  Partial<Record<BuiltinWidgetType, string>>
> = {
  en: {},
  fr: {
    zmanim: 'Zmanim Halakhiques & Horizon Solaire',
    mini_calendar: 'Mini Calendrier · Louah Mensuel Hébraïque',
    upcoming_holidays: 'Prochaines Fêtes · Compte à Rebours',
    chayenu_daily: 'Chayenu Étude Quotidienne · חיינו',
    rambam_daily: 'Rambam Quotidien (Michné Torah)',
    geulah_moshiach: 'Guéoula & Machia’h · Inyanéi Guéoula',
    shiurim_tracker: 'Suivi des Chiourim · מעקב שיעורים',
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
    chayenu_daily: 'Chayenu Estudio Diario · חיינו',
    rambam_daily: 'Rambam Diario (Mishné Torá)',
    geulah_moshiach: 'Gueulá y Mashíaj · Temas de Redención',
    shiurim_tracker: 'Registro de Shiurim · מעקב שיעורים',
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
    chayenu_daily: 'Хаейну Ежедневная Учёба · חיינו',
    rambam_daily: 'Ежедневный Рамбам (Мишне Тора)',
    geulah_moshiach: 'Геула и Мошиах · Вопросы Освобождения',
    shiurim_tracker: 'Учёт Уроков (Шиурим) · מעקב שיעורים',
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
      description: 'Aube halakhique · Début des mitsvot du jour',
      note: 'Abaissement solaire de 16,1° sous l’horizon est',
    },
    misheyakir: {
      title: 'Michéyakir (Talit & Téfiline)',
      description: 'Heure la plus tôt pour le Talit et les Téfiline',
      note: 'Abaissement solaire de 11,5° sous l’horizon est',
    },
    sunrise: {
      title: 'Nets HaHama (Lever du soleil)',
      description: 'Lever du soleil halakhique · Amida de Vassikin',
      note: 'Apparition du soleil à l’horizon',
    },
    shema_mga: {
      title: 'Fin du Chéma (Maguen Avraham)',
      description: 'Heure limite du Chéma selon le Maguen Avraham',
      note: '3 heures proportionnelles depuis l’aube (Alot)',
    },
    shema_gra: {
      title: 'Fin du Chéma (GRA / Baal HaTanya)',
      description: 'Heure limite du Chéma selon le Gaon de Vilna et l’Admour HaZaken',
      note: '3 heures proportionnelles du lever au coucher du soleil',
    },
    tefillah: {
      title: 'Fin de la Téfila (Chaharit)',
      description: 'Heure limite pour la Amida du matin',
      note: '4 heures proportionnelles après le début du jour',
    },
    chatzot: {
      title: 'Hatsot HaYom (Midi solaire)',
      description: 'Midi halakhique · Zénith solaire',
      note: 'Milieu exact entre le lever et le coucher du soleil',
    },
    mincha_gedolah: {
      title: 'Minha Guédola',
      description: 'Heure la plus tôt pour la prière de Minha',
      note: '6,5 heures proportionnelles (30 min après Hatsot)',
    },
    mincha_ketanah: {
      title: 'Minha Kétana',
      description: 'Heure privilégiée de l’après-midi pour Minha',
      note: '9,5 heures proportionnelles',
    },
    plag: {
      title: 'Plag HaMinha',
      description: 'Allumage anticipé des bougies de Chabbat & Arvit',
      note: '10,75 heures proportionnelles (1,25 h avant le coucher)',
    },
    sunset: {
      title: 'Chkia (Coucher du soleil)',
      description: 'Coucher halakhique · Début de Bein HaChémachot',
      note: 'Heure limite pour Minha et les mitsvot du jour',
    },
    tzeit: {
      title: 'Tseit HaKokhavim (Sortie des étoiles)',
      description: 'Tombée de la nuit · Arvit, Chéma & Décompte de l’Omer',
      note: 'Abaissement solaire de 8,5° (3 étoiles moyennes)',
    },
    rabbeinu_tam: {
      title: 'Tseit Rabbénou Tam',
      description: 'Sortie des étoiles selon Rabbénou Tam',
      note: '72 minutes fixes après le coucher du soleil',
    },
  },
  es: {
    alot: {
      title: 'Alot HaShajar (Alba)',
      description: 'Alba halájica · Inicio de las obligaciones diurnas',
      note: 'Depresión solar de 16.1° bajo el horizonte oriental',
    },
    misheyakir: {
      title: 'Misheyakir (Talit y Tefilín)',
      description: 'Hora más temprana para Talit y Tefilín',
      note: 'Depresión solar de 11.5° bajo el horizonte',
    },
    sunrise: {
      title: 'Netz HaJamá (Amanecer)',
      description: 'Amanecer halájico · Hora ideal para la Amidá (Vasikín)',
      note: 'Aparición del sol en el horizonte',
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
      note: '6.5 horas proporcionales del día',
    },
    mincha_ketanah: {
      title: 'Minjá Ketaná',
      description: 'Ventana preferida de la tarde para Minjá',
      note: '9.5 horas proporcionales',
    },
    plag: {
      title: 'Plag HaMinjá',
      description: 'Encendido temprano de velas de Shabat y Maariv',
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
      note: 'Depresión solar de 8.5° (tres estrellas medianas)',
    },
    rabbeinu_tam: {
      title: 'Tzeit Rabeinu Tam',
      description: 'Anochecer según Rabeinu Tam',
      note: '72 minutos después de la puesta del sol',
    },
  },
  ru: {
    alot: {
      title: 'Алот а-Шахар (Рассвет)',
      description: 'Галахический рассвет · Начало дневных заповедей',
      note: 'Солнце на 16,1° ниже восточного горизонта',
    },
    misheyakir: {
      title: 'Мишеякир (Талит и Тфилин)',
      description: 'Самое раннее время для Талита и Тфилина',
      note: 'Солнце на 11,5° ниже горизонта',
    },
    sunrise: {
      title: 'Нец а-Хама (Восход солнца)',
      description: 'Галахический восход · Молитва Ватикин',
      note: 'Появление верхнего края солнца над горизонтом',
    },
    shema_mga: {
      title: 'Конец времени Шма (Маген Авраам)',
      description: 'Последнее время чтения Шма по Маген Аврааму',
      note: '3 пропорциональных часа от рассвета до выхода звёзд',
    },
    shema_gra: {
      title: 'Конец времени Шма (Агра / Бааль а-Тания)',
      description: 'Последнее время чтения Шма по Виленскому Гаону и Алтер Ребе',
      note: '3 пропорциональных часа от восхода до заката',
    },
    tefillah: {
      title: 'Конец времени Тфилы (Шахарит)',
      description: 'Последнее время утренней молитвы Амида',
      note: '4 пропорциональных часа от начала дня',
    },
    chatzot: {
      title: 'Хацот а-Йом (Полдень)',
      description: 'Галахический полдень · Зенит солнца',
      note: 'Точная середина между восходом и закатом',
    },
    mincha_gedolah: {
      title: 'Минха Гдола',
      description: 'Самое раннее время дневной молитвы Минха',
      note: '6,5 пропорциональных часов',
    },
    mincha_ketanah: {
      title: 'Минха Ктана',
      description: 'Предпочтительное время молитвы Минха',
      note: '9,5 пропорциональных часов',
    },
    plag: {
      title: 'Плаг а-Минха',
      description: 'Раннее принятие Шаббата и молитва Маарив',
      note: '10,75 пропорциональных часов (за 1,25 ч до заката)',
    },
    sunset: {
      title: 'Шкия (Закат солнца)',
      description: 'Галахический закат · Начало сумерек',
      note: 'Завершение времени молитвы Минха и дневных заповедей',
    },
    tzeit: {
      title: 'Цет а-Кохавим (Выход звёзд)',
      description: 'Наступление ночи · Маарив, Шма и Сфират а-Омер',
      note: 'Солнце на 8,5° ниже горизонта (три средние звезды)',
    },
    rabbeinu_tam: {
      title: 'Цет Рабейну Там',
      description: 'Выход звёзд по мнению Рабейну Тама',
      note: '72 минуты после заката солнца',
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

  return {
    ...data,
    rangeLabelEn: data.rangeLabelEn
      .replace('Chapters', chWordPlural)
      .replace('Chapter', chWordSingular),
    seferTitleEn: data.seferTitleEn
      .replace('Book', bookWord)
      .replace('Ch.', lang === 'ru' ? 'Гл.' : 'Cap.'),
    chapters: data.chapters.map((ch) => ({
      ...ch,
      labelEn: ch.labelEn
        .replace('Chapter', chWordSingular)
        .replace('Ch.', lang === 'ru' ? 'Гл.' : 'Cap.'),
    })),
  };
}

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (next: AppLanguage) => void;
  locale: string;
  currentOption: LanguageOption;
  t: UIStrings;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  locale: 'en-US',
  currentOption: LANGUAGE_OPTIONS[0],
  t: UI_TRANSLATIONS.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('orah_lang') as AppLanguage | null;
      if (saved && ['en', 'fr', 'es', 'ru'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLang = (next: AppLanguage) => {
    setLangState(next);
    try {
      localStorage.setItem('orah_lang', next);
    } catch {
      // ignore
    }
  };

  const currentOption = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((opt) => opt.code === lang) || LANGUAGE_OPTIONS[0],
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      locale: currentOption.locale,
      currentOption,
      t: UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en,
    }),
    [lang, currentOption]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, currentOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-600/60 transition-colors whitespace-nowrap shrink-0"
        title="Switch Language (English, Français, Español, Русский)"
        aria-label="Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span>{currentOption.nativeLabel}</span>
        <span className="text-[10px] font-mono text-stone-400">
          ({currentOption.shortCode})
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-40 w-48 p-1.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Language · שפה
          </div>
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = opt.code === lang;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLang(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  active
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {opt.shortCode}
                  </span>
                  <span>{opt.nativeLabel}</span>
                </div>
                {active && (
                  <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
