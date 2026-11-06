import React, { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Download,
  EyeOff,
  GraduationCap,
  GripVertical,
  LayoutGrid,
  MapPin,
  Mic,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { LocationConfig, ShitaOpinion } from '../types/dashboard';
import { useLanguage } from './LanguageControl';

export const TUTORIAL_STORAGE_KEY = 'orah_tutorial_seen_v1';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  shita: ShitaOpinion;
  onChangeShita: (shita: ShitaOpinion) => void;
  location: LocationConfig;
  onOpenLocationPicker: () => void;
  onOpenGallery: () => void;
  onOpenVoiceSearch: () => void;
  onToggleEditGrid?: () => void;
}

interface StepCopy {
  badge: string;
  hebrewTitle: string;
  title: string;
  subtitle: string;
  bullets: {
    title: string;
    desc: string;
  }[];
  tip: string;
}

const TUTORIAL_TRANSLATIONS: Record<
  'en' | 'fr' | 'es' | 'ru',
  {
    modalHeader: string;
    stepOf: string;
    skipTour: string;
    prev: string;
    next: string;
    finish: string;
    dontShowAgain: string;
    chooseShitaLabel: string;
    currentLocationLabel: string;
    changeLocationBtn: string;
    tryVoiceBtn: string;
    customizeWidgetsBtn: string;
    editGridBtn: string;
    steps: StepCopy[];
  }
> = {
  en: {
    modalHeader: 'Orah Sanctuary · Interactive Welcome Guide',
    stepOf: 'Step',
    skipTour: 'Skip tutorial',
    prev: 'Back',
    next: 'Next Step',
    finish: 'Enter Sanctuary',
    dontShowAgain: 'Saved automatically — shown only on your first visit',
    chooseShitaLabel: 'Select your preferred Halachic Opinion (Shita):',
    currentLocationLabel: 'Active Horizon Coordinates:',
    changeLocationBtn: 'Change City / GPS',
    tryVoiceBtn: 'Preview Voice Search',
    customizeWidgetsBtn: 'Explore Widget Gallery',
    editGridBtn: 'Try Edit Grid Mode',
    steps: [
      {
        badge: 'Welcome · ברוכים הבאים',
        hebrewTitle: 'לוח אורה האישי שלך',
        title: 'Your Personal Halachic Luach & Study Sanctuary',
        subtitle:
          'Orah brings together precision astronomical Zmanim, daily Torah cycles, and bilingual study tools in one calm, customizable workspace.',
        bullets: [
          {
            title: 'Global Horizon & GPS Precision',
            desc: 'Calculate sunrise, sunset, and halachic hours for any city worldwide or your live GPS coordinates.',
          },
          {
            title: 'Multiple Halachic Opinions (Shitot)',
            desc: 'Switch effortlessly between the Vilna Gaon (GRA), Magen Avraham (MGA), and Baal HaTanya.',
          },
          {
            title: 'Hebrew & Gregorian Time-Travel',
            desc: 'Jump to any past or future date, Rosh Chodesh, or upcoming Shabbat to plan ahead.',
          },
        ],
        tip: 'You can customize your Halachic opinion right below before starting.',
      },
      {
        badge: 'Halachic Time · זמני היום',
        hebrewTitle: 'זמני היום והתראות קרבה',
        title: 'Solar Progression & 15-Minute Proximity Alerts',
        subtitle:
          'Never miss an upcoming halachic deadline with real-time visual horizon tracking and gentle audio/visual reminders.',
        bullets: [
          {
            title: 'Dynamic Day Progression Bar',
            desc: 'The Halachic Zmanim widget displays a live sunrise-to-sunset progress bar showing exactly how much daylight has elapsed.',
          },
          {
            title: '15-Minute Proximity Alerts',
            desc: 'Receive a visual notification banner and subtle acoustic chime 15 minutes before Plag HaMincha, Shkiah, or Latest Shema.',
          },
          {
            title: 'Proportional Shaah Zmanit',
            desc: 'View exact seasonal halachic hour durations alongside live countdowns to the next threshold.',
          },
        ],
        tip: 'Click the bell icon in the top bar anytime to test or configure your Zmanim alerts.',
      },
      {
        badge: 'Daily Torah · לימוד יומי',
        hebrewTitle: 'חיינו, רמב״ם ומעקב שיעורים',
        title: 'Chayenu Study Cycles & Daily Shiurim Tracker',
        subtitle:
          'Stay anchored in your daily learning with dedicated widgets for Chitas, Rambam, Daf Yomi, and personal class tracking.',
        bullets: [
          {
            title: 'Shiurim Tracker with Daily Progress',
            desc: 'Check off Gemara, Chumash, Halacha, Tanya, or custom classes with a live completion percentage, total minutes, and streak counter.',
          },
          {
            title: 'Chayenu & Daily Cycles',
            desc: 'Follow daily Chumash with Rashi, Tehillim by the Hebrew day of the month, Tanya, HaYom Yom, Rambam, and Geulah insights.',
          },
          {
            title: 'Shabbat Preparation & Tzedakah',
            desc: 'Track Erev Shabbat checklists, candle-lighting times, Maaser ledgers, and personal Tefillah names.',
          },
        ],
        tip: 'Add your own custom classes and Maggid Shiur details directly inside the Shiurim Tracker widget.',
      },
      {
        badge: 'Sefaria Reader · ספריא וקול',
        hebrewTitle: 'קורא ספריא דו־לשוני וחיפוש קולי',
        title: 'Integrated Sefaria Reader & Voice Search',
        subtitle:
          'Open any Torah citation directly inside Orah without leaving your dashboard.',
        bullets: [
          {
            title: 'Side-by-Side Hebrew & English Texts',
            desc: 'Click any "Open in Sefaria" or "Learn" button on a widget to read full vocalized Hebrew and English translation.',
          },
          {
            title: 'Hands-Free Voice Search',
            desc: 'Speak a Masechet, Parsha, or chapter (e.g., "Berakhot 2a" or "Tehillim 23") to jump straight to the text.',
          },
          {
            title: 'Font Sizing & Display Modes',
            desc: 'Toggle between Hebrew-only, Bilingual side-by-side, or English-only views with adjustable typography.',
          },
        ],
        tip: 'Use the "Sefaria Voice Search" microphone button in the header for instant lookup.',
      },
      {
        badge: 'Personalize · התאמה אישית',
        hebrewTitle: 'התאמת הלוח: הזזה, הסרה והוספת ווידג׳טים',
        title: 'Move, Remove & Arrange Widgets as Wanted',
        subtitle:
          'Tailor your sanctuary layout to your daily rhythm — reorder cards, hide unwanted tools, or add widgets as wanted.',
        bullets: [
          {
            title: 'Move & Reorder Widgets Fluidly',
            desc: 'Click "Edit Grid" in the top bar to drag and drop widgets, or use the ◄ and ► reorder buttons on any card to shift its position with smooth animated transitions.',
          },
          {
            title: 'Remove or Hide Widgets as Wanted',
            desc: 'Click the eye icon on any card during Edit Grid mode to remove it from your active view. You can also hide or unhide widgets anytime from the Widget Gallery (+).',
          },
          {
            title: 'Adjust Card Widths (1, 2, or 3 Columns)',
            desc: 'Expand widgets across 1 column (compact), 2 columns (standard), or 3 columns (panoramic) to emphasize the texts and tools you use most.',
          },
          {
            title: 'Export, Import & Offline Luach',
            desc: 'Backup your customized widget order and personal preferences as a JSON file in Settings, or download an offline pocket Luach to view anytime without internet.',
          },
        ],
        tip: 'Click "Try Edit Grid Mode" below to start rearranging or hiding widgets right now.',
      },
    ],
  },
  fr: {
    modalHeader: 'Sanctuaire Orah · Guide de Bienvenue',
    stepOf: 'Étape',
    skipTour: 'Passer le guide',
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Commencer',
    dontShowAgain: 'Enregistré automatiquement — affiché uniquement lors de votre première visite',
    chooseShitaLabel: 'Choisissez votre opinion halakhique (Shita) :',
    currentLocationLabel: 'Coordonnées actuelles :',
    changeLocationBtn: 'Changer de ville / GPS',
    tryVoiceBtn: 'Tester la recherche vocale',
    customizeWidgetsBtn: 'Galerie de widgets',
    editGridBtn: 'Modifier la grille',
    steps: [
      {
        badge: 'Bienvenue · ברוכים הבאים',
        hebrewTitle: 'לוח אורה האישי שלך',
        title: 'Votre Luach Halakhique & Sanctuaire d’Étude',
        subtitle:
          'Orah réunit les Zmanim astronomiques de précision, les cycles d’étude quotidiens et les textes bilingues dans un espace apaisant.',
        bullets: [
          {
            title: 'Précision GPS & Villes Mondiales',
            desc: 'Calculez le lever, le coucher du soleil et les heures halakhiques pour n’importe quelle ville ou via GPS.',
          },
          {
            title: 'Opinions Halakhiques (GRA, MGA, Baal HaTanya)',
            desc: 'Basculez instantanément entre le Gaon de Vilna, le Magen Avraham et l’Admour HaZaken.',
          },
          {
            title: 'Navigation Temporelle Hébraïque',
            desc: 'Consultez n’importe quelle date passée ou future, Roch Hodech ou Chabbat à venir.',
          },
        ],
        tip: 'Vous pouvez sélectionner votre Shita préférée ci-dessous.',
      },
      {
        badge: 'Zmanim · זמני היום',
        hebrewTitle: 'זמני היום והתראות קרבה',
        title: 'Progression Solaire & Alertes 15 Minutes Avant',
        subtitle:
          'Suivez la progression du jour en temps réel et recevez une alerte douce avant les horaires halakhiques clés.',
        bullets: [
          {
            title: 'Barre de Progression du Jour',
            desc: 'Visualisez en direct la proportion de journée écoulée entre le lever (Netz) et le coucher du soleil (Shkiah).',
          },
          {
            title: 'Alertes de Proximité (15 min)',
            desc: 'Notification visuelle et carillon subtil 15 minutes avant Plag HaMincha, Shkiah ou la fin du Chema.',
          },
          {
            title: 'Chaah Zmanit Proportionnelle',
            desc: 'Consultez la durée exacte des heures saisonnières et le compte à rebours en direct.',
          },
        ],
        tip: 'Cliquez sur l’icône de cloche en haut pour configurer ou tester vos alertes.',
      },
      {
        badge: 'Étude Quotidienne · לימוד יומי',
        hebrewTitle: 'חיינו, רמב״ם ומעקב שיעורים',
        title: 'Cycles Chayenu & Suivi des Chiourim',
        subtitle:
          'Suivez vos études quotidiennes avec des widgets dédiés pour le Hitas, le Rambam, le Daf Yomi et vos cours personnels.',
        bullets: [
          {
            title: 'Suivi des Chiourim Quotidien',
            desc: 'Cochez vos cours de Guemara, Houmach, Halakha ou Tania avec indicateur de progression et série de jours.',
          },
          {
            title: 'Chayenu, Tehillim & HaYom Yom',
            desc: 'Accédez chaque jour aux sections de Houmach avec Rachi, Tehillim du jour, Tania et Rambam.',
          },
          {
            title: 'Préparation de Chabbat & Tsédaka',
            desc: 'Liste de vérification Erev Chabbat, registre de Maasser et noms de Tefillah.',
          },
        ],
        tip: 'Ajoutez vos propres cours personnalisés directement dans le widget Suivi des Chiourim.',
      },
      {
        badge: 'Lecteur Sefaria · ספריא וקול',
        hebrewTitle: 'קורא ספריא דו־לשוני וחיפוש קולי',
        title: 'Lecteur Bilingue Sefaria & Recherche Vocale',
        subtitle:
          'Ouvrez n’importe quelle référence de Torah directement dans Orah sans quitter votre tableau de bord.',
        bullets: [
          {
            title: 'Texte Hébreu & Traduction Côte à Côte',
            desc: 'Cliquez sur « Étudier » ou « Ouvrir dans Sefaria » pour lire les textes complets.',
          },
          {
            title: 'Recherche Vocale Mains Libres',
            desc: 'Prononcez le nom d’un traité ou d’un chapitre (ex. « Berakhot 2a ») pour l’ouvrir instantanément.',
          },
          {
            title: 'Confort de Lecture',
            desc: 'Ajustez la taille de police et choisissez entre l’affichage hébreu, bilingue ou traduit.',
          },
        ],
        tip: 'Utilisez le bouton microphone dans l’en-tête pour lancer une recherche vocale.',
      },
      {
        badge: 'Personnalisation · התאמה אישית',
        hebrewTitle: 'סידור הלוח, גיבוי ואפליקציה לאופליין',
        title: 'Grille Bento, Sauvegarde JSON & Mode Hors-Ligne',
        subtitle:
          'Organisez vos widgets selon votre rythme et sauvegardez vos préférences.',
        bullets: [
          {
            title: 'Réorganisation Fluide de la Grille',
            desc: 'Glissez-déposez vos widgets, modifiez leur largeur ou filtrez par vue Zmanim, Torah ou Infographie.',
          },
          {
            title: 'Export / Import de Configuration',
            desc: 'Téléchargez vos réglages en fichier JSON depuis le menu Paramètres pour les restaurer à tout moment.',
          },
          {
            title: 'Application Hors-Ligne',
            desc: 'Installez l’application ou téléchargez un calendrier de poche hors-ligne.',
          },
        ],
        tip: 'Vous pouvez rouvrir ce guide à tout moment via le bouton « Guide » en haut de page.',
      },
    ],
  },
  es: {
    modalHeader: 'Santuario Orah · Guía de Bienvenida',
    stepOf: 'Paso',
    skipTour: 'Omitir guía',
    prev: 'Anterior',
    next: 'Siguiente',
    finish: 'Comenzar',
    dontShowAgain: 'Guardado automáticamente — se muestra solo en tu primera visita',
    chooseShitaLabel: 'Selecciona tu opinión halájica preferida (Shitá):',
    currentLocationLabel: 'Coordenadas activas:',
    changeLocationBtn: 'Cambiar ciudad / GPS',
    tryVoiceBtn: 'Probar búsqueda por voz',
    customizeWidgetsBtn: 'Galería de widgets',
    editGridBtn: 'Probar modo de edición',
    steps: [
      {
        badge: 'Bienvenida · ברוכים הבאים',
        hebrewTitle: 'לוח אורה האישי שלך',
        title: 'Tu Luaj Halájico Personal y Santuario de Estudio',
        subtitle:
          'Orah reúne Zmanim astronómicos precisos, ciclos diarios de Torá y herramientas de estudio bilingües en un espacio sereno.',
        bullets: [
          {
            title: 'Horizonte Global y Precisión GPS',
            desc: 'Calcula el amanecer, la puesta del sol y las horas halájicas para cualquier ciudad del mundo o mediante GPS.',
          },
          {
            title: 'Opiniones Halájicas (GRA, MGA, Baal HaTanya)',
            desc: 'Cambia fácilmente entre el Gaón de Vilna, Maguén Avraham y el Alter Rebe.',
          },
          {
            title: 'Calendario Hebreo y Gregoriano',
            desc: 'Viaja a cualquier fecha pasada o futura, Rosh Jodesh o próximo Shabat.',
          },
        ],
        tip: 'Puedes elegir tu opinión halájica preferida aquí abajo antes de comenzar.',
      },
      {
        badge: 'Zmanim · זמני היום',
        hebrewTitle: 'זמני היום והתראות קרבה',
        title: 'Progreso Solar y Alertas de 15 Minutos',
        subtitle:
          'No pierdas ningún horario halájico con seguimiento visual del día y recordatorios suaves.',
        bullets: [
          {
            title: 'Barra Dinámica de Progreso del Día',
            desc: 'El widget de Zmanim muestra visualmente cuánto tiempo de luz diurna ha transcurrido entre el amanecer y el atardecer.',
          },
          {
            title: 'Alertas de Proximidad (15 min)',
            desc: 'Notificación visual y tono suave 15 minutos antes de Plag HaMinjá, Shkiá o el límite del Shemá.',
          },
          {
            title: 'Shaá Zmanit Proporcional',
            desc: 'Consulta la duración exacta de las horas estacionales y cuentas regresivas en vivo.',
          },
        ],
        tip: 'Haz clic en el icono de campana superior para probar o ajustar tus alertas.',
      },
      {
        badge: 'Estudio Diario · לימוד יומי',
        hebrewTitle: 'חיינו, רמב״ם ומעקב שיעורים',
        title: 'Ciclos de Chayenu y Registro de Shiurim',
        subtitle:
          'Mantén la constancia en tu estudio diario con widgets para Jitas, Rambam, Daf Yomi y seguimiento de clases.',
        bullets: [
          {
            title: 'Registro Diario de Shiurim',
            desc: 'Marca tus clases completadas de Guemará, Jumash, Halajá o Tania con barra de progreso diario y racha.',
          },
          {
            title: 'Chayenu, Tehilim y HaYom Yom',
            desc: 'Sigue las porciones diarias de Jumash con Rashi, Tehilim del día, Tania, Rambam y Gueulá.',
          },
          {
            title: 'Preparación de Shabat y Tzedaká',
            desc: 'Lista de Erev Shabat, horarios de encendido de velas y registro de Maaser.',
          },
        ],
        tip: 'Agrega tus propias clases personalizadas directamente en el widget de Shiurim Tracker.',
      },
      {
        badge: 'Lector Sefaria · ספריא וקול',
        hebrewTitle: 'קורא ספריא דו־לשוני וחיפוש קולי',
        title: 'Lector Bilingüe Sefaria y Búsqueda por Voz',
        subtitle:
          'Abre cualquier texto de la Torá directamente dentro de Orah sin salir de tu panel.',
        bullets: [
          {
            title: 'Textos en Hebreo e Inglés Lado a Lado',
            desc: 'Haz clic en «Aprender» o «Abrir en Sefaria» en cualquier tarjeta para estudiar el texto completo.',
          },
          {
            title: 'Búsqueda por Voz Manos Libres',
            desc: 'Di el nombre de un tratado o capítulo (ej. «Berakhot 2a» o «Tehillim 23») para abrirlo al instante.',
          },
          {
            title: 'Tipografía Ajustable',
            desc: 'Alterna entre vista en hebreo, bilingüe o traducción con control de tamaño de letra.',
          },
        ],
        tip: 'Usa el botón del micrófono en la barra superior para buscar con tu voz.',
      },
      {
        badge: 'Personalización · התאמה אישית',
        hebrewTitle: 'התאמת הלוח: הזזה, הסרה והוספת ווידג׳טים',
        title: 'Mover, Ocultar y Organizar Widgets a tu gusto',
        subtitle:
          'Adapta el santuario a tu ritmo diario — reordena las tarjetas, oculta herramientas que no uses y añade nuevos widgets.',
        bullets: [
          {
            title: 'Mover y Reordenar Widgets',
            desc: 'Haz clic en «Editar cuadrícula» para arrastrar las tarjetas o usa los botones ◄ y ► en la esquina de cada widget para mover su posición con animaciones fluidas.',
          },
          {
            title: 'Eliminar u Ocultar Widgets',
            desc: 'Haz clic en el icono del ojo en cualquier tarjeta durante el modo de edición para ocultarla. Puedes reactivarlas cuando quieras desde la Galería (+).',
          },
          {
            title: 'Cambiar el Ancho (1, 2 o 3 columnas)',
            desc: 'Amplía las tarjetas a 1 columna (compacta), 2 columnas (ancha) o 3 columnas (completa) según la prioridad de tu estudio.',
          },
          {
            title: 'Respaldo JSON y Luaj Sin Conexión',
            desc: 'Descarga tu diseño y preferencias en formato JSON desde Ajustes, o descarga un Luaj portátil autónomo para estudiar sin conexión a internet.',
          },
        ],
        tip: 'Haz clic en «Probar modo de edición» para empezar a mover u ocultar widgets.',
      },
    ],
  },
  ru: {
    modalHeader: 'Святилище Ора · Приветственный гид',
    stepOf: 'Шаг',
    skipTour: 'Пропустить обзор',
    prev: 'Назад',
    next: 'Далее',
    finish: 'Начать работу',
    dontShowAgain: 'Сохранено автоматически — показывается только при первом посещении',
    chooseShitaLabel: 'Выберите галахическое мнение (Шита):',
    currentLocationLabel: 'Текущие координаты:',
    changeLocationBtn: 'Сменить город / GPS',
    tryVoiceBtn: 'Голосовой поиск',
    customizeWidgetsBtn: 'Галерея виджетов',
    editGridBtn: 'Режим редактирования',
    steps: [
      {
        badge: 'Добро пожаловать · ברוכים הבאים',
        hebrewTitle: 'לוח אורה האישי שלך',
        title: 'Ваш персональный галахический календарь и учебное пространство',
        subtitle:
          'Orah объединяет точные астрономические Зманим, ежедневные циклы изучения Торы и двуязычные тексты в удобной панели.',
        bullets: [
          {
            title: 'Мировые координаты и точность GPS',
            desc: 'Расчет восхода, заката и галахических часов для любого города мира или по вашим GPS-координатам.',
          },
          {
            title: 'Галахические мнения (Агра, Маген Авраам, Бааль а-Танья)',
            desc: 'Мгновенное переключение между расчетами Виленского Гаона, Маген Авраама и Алтер Ребе.',
          },
          {
            title: 'Еврейский и григорианский календарь',
            desc: 'Переходите к любой прошлой или будущей дате, Рош Ходеш или ближайшему Шаббату.',
          },
        ],
        tip: 'Вы можете сразу выбрать предпочтительную Шиту ниже.',
      },
      {
        badge: 'Зманим · זמני היום',
        hebrewTitle: 'זמני היום והתראות קרבה',
        title: 'Прогресс светового дня и уведомления за 15 минут',
        subtitle:
          'Следите за течением дня в реальном времени и получайте мягкие напоминания перед важными галахическими временами.',
        bullets: [
          {
            title: 'Динамическая шкала прогресса дня',
            desc: 'Виджет Зманим наглядно показывает, какая часть светового дня от восхода до заката уже прошла.',
          },
          {
            title: 'Уведомления за 15 минут',
            desc: 'Визуальный баннер и мягкий звуковой сигнал за 15 минут до Плаг а-Минха, Шкии или конца времени Шма.',
          },
          {
            title: 'Пропорциональный Шаа Зманит',
            desc: 'Точная продолжительность галахического часа и обратный отсчет до следующего рубежа.',
          },
        ],
        tip: 'Нажмите на значок колокольчика в верхней панели, чтобы настроить или проверить оповещения.',
      },
      {
        badge: 'Ежедневное учение · לימוד יומי',
        hebrewTitle: 'חיינו, רמב״ם ומעקב שיעורים',
        title: 'Циклы Хайену и Трекер ежедневных уроков (Шиурим)',
        subtitle:
          'Поддерживайте постоянство в учебе с виджетами Хитас, Рамбам, Даф Йоми и трекером личных занятий.',
        bullets: [
          {
            title: 'Трекер Шиурим с индикатором прогресса',
            desc: 'Отмечайте выполнение уроков Гемары, Хумаша, Галахи и Таньи с подсчетом процентов, минут и дней подряд.',
          },
          {
            title: 'Хайену, Теилим и а-Йом Йом',
            desc: 'Ежедневные отрывки Хумаша с Раши, главы Теилим по дням месяца, Танья, Рамбам и темы Геулы.',
          },
          {
            title: 'Подготовка к Шаббату и Цдака',
            desc: 'Чек-лист Эрев Шаббат, время зажигания свечей, учет Маасера и имена для молитвы.',
          },
        ],
        tip: 'Добавляйте собственные уроки прямо внутри виджета Shiurim Tracker.',
      },
      {
        badge: 'Чтение Sefaria · ספריא וקול',
        hebrewTitle: 'קורא ספריא דו־לשוני וחיפוש קולי',
        title: 'Встроенный чтец Sefaria и голосовой поиск',
        subtitle:
          'Открывайте любой первоисточник прямо внутри Orah, не покидая рабочую панель.',
        bullets: [
          {
            title: 'Параллельный текст на иврите и английском',
            desc: 'Нажмите «Учить» или «Открыть в Sefaria» на любом виджете для чтения полного текста.',
          },
          {
            title: 'Голосовой поиск трактатов и глав',
            desc: 'Произнесите название трактата или главы (например, «Berakhot 2a» или «Tehillim 23») для мгновенного перехода.',
          },
          {
            title: 'Настройка шрифта и отображения',
            desc: 'Переключайтесь между режимами «Только иврит», «Двуязычный» или «Перевод».',
          },
        ],
        tip: 'Используйте кнопку с микрофоном в шапке сайта для быстрого голосового поиска.',
      },
      {
        badge: 'Персонализация · התאמה אישית',
        hebrewTitle: 'התאמת הלוח: הזזה, הסרה והוספת ווידג׳טים',
        title: 'Перемещение, скрытие и настройка виджетов',
        subtitle:
          'Организуйте рабочее пространство по своему вкусу — меняйте порядок карточек, скрывайте ненужные инструменты и добавляйте новые.',
        bullets: [
          {
            title: 'Перемещение и изменение порядка виджетов',
            desc: 'Нажмите «Режим редактирования», чтобы перетаскивать виджеты мышью, или используйте стрелки ◄ и ► для плавного перемещения карточек.',
          },
          {
            title: 'Удаление и скрытие виджетов',
            desc: 'Нажмите на значок глаза на карточке в режиме редактирования, чтобы скрыть ее. Скрытые виджеты всегда можно вернуть в «Галерее виджетов» (+).',
          },
          {
            title: 'Изменение ширины (1, 2 или 3 колонки)',
            desc: 'Переключайте ширину карточек между 1, 2 или 3 колонками, чтобы выделить наиболее важные тексты и таймеры.',
          },
          {
            title: 'Резервная копия JSON и автономный календарь',
            desc: 'Сохраняйте расположение виджетов и личные настройки в файл JSON через настройки или скачивайте автономный календарь для работы без интернета.',
          },
        ],
        tip: 'Нажмите «Режим редактирования» ниже, чтобы попробовать перемещение и скрытие виджетов.',
      },
    ],
  },
};

const STEP_ICONS = [Compass, Bell, GraduationCap, Mic, LayoutGrid];

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  shita,
  onChangeShita,
  location,
  onOpenLocationPicker,
  onOpenGallery,
  onOpenVoiceSearch,
  onToggleEditGrid,
}) => {
  const { lang } = useLanguage();
  const [stepIndex, setStepIndex] = useState<number>(0);

  const copy = TUTORIAL_TRANSLATIONS[lang] || TUTORIAL_TRANSLATIONS.en;
  const steps = copy.steps;
  const currentStep = steps[stepIndex] || steps[0];
  const StepIcon = STEP_ICONS[stepIndex] || Sparkles;

  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, steps.length]);

  if (!isOpen) return null;

  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orah-tutorial-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#F6F3EC] dark:bg-[#14161F] border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Accent Progress Strip */}
        <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800">
          <div
            className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-white/60 dark:bg-stone-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-800/70 flex items-center justify-center text-amber-800 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                {copy.modalHeader}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                {copy.stepOf} {stepIndex + 1} / {steps.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
            >
              {copy.skipTour}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close tutorial"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Hero Step Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                <StepIcon className="w-3.5 h-3.5" />
                <span>{currentStep.badge}</span>
              </div>
              <h2
                id="orah-tutorial-title"
                className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 dark:text-stone-100 tracking-tight"
              >
                {currentStep.title}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>
            <div
              dir="rtl"
              className="shrink-0 px-3.5 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 text-right"
            >
              <span className="text-sm font-serif font-semibold text-amber-900 dark:text-amber-300 block">
                {currentStep.hebrewTitle}
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400/70">
                אורה · לוח הלכתי ולימוד יומי
              </span>
            </div>
          </div>

          {/* 3 Feature Highlight Cards */}
          <div className="grid grid-cols-1 gap-3">
            {currentStep.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/90 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 mt-0.5 text-xs font-mono font-semibold">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {bullet.title}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {bullet.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Quick-Setup / Live Preview Box per Step */}
          {stepIndex === 0 && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {copy.chooseShitaLabel}
                </span>
                <div className="inline-flex rounded-lg bg-white dark:bg-stone-900 p-0.5 border border-stone-200 dark:border-stone-800">
                  {(
                    [
                      { id: 'GRA', label: 'GRA · הגר״א' },
                      { id: 'MGA', label: 'MGA · מג״א' },
                      { id: 'BAAL_HATANYA', label: 'Baal HaTanya · אדמו״ר הזקן' },
                    ] as { id: ShitaOpinion; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeShita(opt.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        shita === opt.id
                          ? 'bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 font-semibold'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>{copy.currentLocationLabel}</span>
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {location.name}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLocationPicker();
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-amber-800 dark:text-amber-300 hover:border-amber-500 transition-colors"
                >
                  {copy.changeLocationBtn}
                </button>
              </div>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Daylight Horizon Progress Preview</span>
                </span>
                <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  Netz → Chatzot → Plag → Shkiah
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>Visual & audio chime 15m before Plag HaMincha & Shkiah</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Shiurim Tracker · מעקב שיעורים יומי
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Gemara · Chumash + Rashi · Halacha · Tanya · Custom Classes
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-semibold">
                100% Daily Goal
              </span>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-stone-700 dark:text-stone-300">
                <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>
                  Try saying <strong>&ldquo;Berakhot 2a&rdquo;</strong> or{' '}
                  <strong>&ldquo;Tehillim 20&rdquo;</strong> in Sefaria Reader
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVoiceSearch();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 text-xs font-medium hover:bg-amber-800 dark:hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{copy.tryVoiceBtn}</span>
              </button>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-3">
              {/* Interactive Demo Card illustrating moving, resizing, and removing widgets */}
              <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700/60 shadow-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-amber-400/50 dark:border-amber-600/40 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    <GripVertical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Halachic Zmanim · זמני היום</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {/* Step reorder arrows demonstration */}
                    <div className="flex items-center rounded border border-amber-400/40 bg-stone-50 dark:bg-stone-800 px-1 py-0.5 text-stone-600 dark:text-stone-300">
                      <span className="font-mono text-[10px] font-semibold px-0.5">◄</span>
                      <span className="text-[10px] text-stone-400 mx-0.5">|</span>
                      <span className="font-mono text-[10px] font-semibold px-0.5">►</span>
                      <span className="ml-1 text-[10px] text-stone-500">Move</span>
                    </div>
                    {/* Span selector demonstration */}
                    <div className="flex items-center rounded border border-amber-400/40 bg-stone-50 dark:bg-stone-800 p-0.5 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 rounded font-semibold">2col</span>
                      <span className="px-1 text-stone-500">3col</span>
                    </div>
                    {/* Remove demonstration */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[10px] font-medium">
                      <EyeOff className="w-3 h-3" />
                      <span>Remove</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                  <span>💡 Drag anywhere by the grip handle, adjust widths, or click the eye icon to remove.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onToggleEditGrid) {
                      onToggleEditGrid();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 text-xs font-semibold hover:bg-amber-800 dark:hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{copy.editGridBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGallery();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200 hover:border-amber-500 transition-colors shrink-0"
                >
                  {copy.customizeWidgetsBtn}
                </button>
              </div>
            </div>
          )}

          {stepIndex !== 4 && (
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>{currentStep.tip}</span>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step Dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStepIndex(idx)}
                aria-label={`Go to tutorial step ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-6 bg-amber-700 dark:bg-amber-400'
                    : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] text-stone-400 dark:text-stone-500 hidden md:inline">
              {copy.dontShowAgain}
            </span>
          </div>

          {/* Prev / Next / Finish Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((prev) => prev - 1)}
                className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{copy.prev}</span>
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setStepIndex((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 text-xs font-semibold hover:bg-amber-800 dark:hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{copy.next}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950 text-xs font-semibold hover:bg-emerald-800 dark:hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{copy.finish}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
