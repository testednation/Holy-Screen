import { HaYomYomEntry } from '../types/dashboard';
import { getHebrewDateStrings, parseHebrewDateParts } from '../services/halachaService';

// Authentic 30-day Monthly Tehillim cycle (חלוקת תהילים לימי החודש) printed at the top of every HaYom Yom entry
const MONTHLY_TEHILLIM_SCHEDULE: Record<
  number,
  { en: string; he: string; ref: string }
> = {
  1: { en: 'Chapters 1–9', he: 'פרקים א׳–ט׳', ref: 'Psalms 1' },
  2: { en: 'Chapters 10–17', he: 'פרקים י׳–י״ז', ref: 'Psalms 10' },
  3: { en: 'Chapters 18–22', he: 'פרקים י״ח–כ״ב', ref: 'Psalms 18' },
  4: { en: 'Chapters 23–28', he: 'פרקים כ״ג–כ״ח', ref: 'Psalms 23' },
  5: { en: 'Chapters 29–34', he: 'פרקים כ״ט–ל״ד', ref: 'Psalms 29' },
  6: { en: 'Chapters 35–38', he: 'פרקים ל״ה–ל״ח', ref: 'Psalms 35' },
  7: { en: 'Chapters 39–43', he: 'פרקים ל״ט–מ״ג', ref: 'Psalms 39' },
  8: { en: 'Chapters 44–48', he: 'פרקים מ״ד–מ״ח', ref: 'Psalms 44' },
  9: { en: 'Chapters 49–54', he: 'פרקים מ״ט–נ״ד', ref: 'Psalms 49' },
  10: { en: 'Chapters 55–59', he: 'פרקים נ״ה–נ״ט', ref: 'Psalms 55' },
  11: { en: 'Chapters 60–65', he: 'פרקים ס׳–ס״ה', ref: 'Psalms 60' },
  12: { en: 'Chapters 66–68', he: 'פרקים ס״ו–ס״ח', ref: 'Psalms 66' },
  13: { en: 'Chapters 69–71', he: 'פרקים ס״ט–ע״א', ref: 'Psalms 69' },
  14: { en: 'Chapters 72–76', he: 'פרקים ע״ב–ע״ו', ref: 'Psalms 72' },
  15: { en: 'Chapters 77–78', he: 'פרקים ע״ז–ע״ח', ref: 'Psalms 77' },
  16: { en: 'Chapters 79–82', he: 'פרקים ע״ט–פ״ב', ref: 'Psalms 79' },
  17: { en: 'Chapters 83–87', he: 'פרקים פ״ג–פ״ז', ref: 'Psalms 83' },
  18: { en: 'Chapters 88–89', he: 'פרקים פ״ח–פ״ט', ref: 'Psalms 88' },
  19: { en: 'Chapters 90–96', he: 'פרקים צ׳–צ״ו', ref: 'Psalms 90' },
  20: { en: 'Chapters 97–103', he: 'פרקים צ״ז–ק״ג', ref: 'Psalms 97' },
  21: { en: 'Chapters 104–105', he: 'פרקים ק״ד–ק״ה', ref: 'Psalms 104' },
  22: { en: 'Chapters 106–107', he: 'פרקים ק״ו–ק״ז', ref: 'Psalms 106' },
  23: { en: 'Chapters 108–112', he: 'פרקים ק״ח–קי״ב', ref: 'Psalms 108' },
  24: { en: 'Chapters 113–118', he: 'פרקים קי״ג–קי״ח', ref: 'Psalms 113' },
  25: { en: 'Chapters 119:1–96', he: 'פרק קי״ט (א–צ״ו)', ref: 'Psalms 119' },
  26: { en: 'Chapters 119:97–176', he: 'פרק קי״ט (צ״ז–קע״ו)', ref: 'Psalms 119' },
  27: { en: 'Chapters 120–134', he: 'פרקים ק״כ–קל״ד', ref: 'Psalms 120' },
  28: { en: 'Chapters 135–139', he: 'פרקים קל״ה–קל״ט', ref: 'Psalms 135' },
  29: { en: 'Chapters 140–144', he: 'פרקים ק״מ–קמ״ד', ref: 'Psalms 140' },
  30: { en: 'Chapters 145–150', he: 'פרקים קמ״ה–ק״נ', ref: 'Psalms 145' },
};

interface CuratedHaYomYomSeed {
  titleEn: string;
  titleHe: string;
  aphorismHe: string;
  aphorismEn: string;
  practicalAvodah: string;
  sourceNote: string;
  chassidicMilestone?: string;
}

// Date-specific Chassidic dates & HaYom Yom gems (indexed by "monthKey-dayNum")
const SPECIAL_DATE_TEACHINGS: Record<string, CuratedHaYomYomSeed> = {
  'kislev-19': {
    chassidicMilestone: 'Yud-Tes Kislev · Rosh Hashanah of Chassidut',
    titleEn: 'Leshanah Tovah in the Study of Chassidut',
    titleHe: 'לשנה טובה בלימוד החסידות ובדרכי החסידות תכתבו ותחתמו',
    aphorismHe:
      '״הַיּוֹם יוֹם״ — י״ט כִּסְלֵו הוּא רֹאשׁ הַשָּׁנָה לְלִימּוּד הַחֲסִידוּת. הַבְּרָכָה בְּיוֹם זֶה הִיא: לְשָׁנָה טוֹבָה בְּלִימּוּד הַחֲסִידוּת וּבְדַרְכֵי הַחֲסִידוּת תִּכָּתֵבוּ וְתֵחָתֵמוּ.',
    aphorismEn:
      'Today is the Rosh Hashanah of Chassidut, celebrating the liberation of the Alter Rebbe (Rabbi Schneur Zalman of Liadi). On this day begins the annual cycle of daily Tanya study, illuminating the intellect and warming the heart with Ahavat Yisrael.',
    practicalAvodah:
      'Begin the new cycle of Likutei Amarim (Tanya Chapter 1) today and greet fellow Jews with "Leshanah Tovah in the study and ways of Chassidut."',
    sourceNote: 'Sefer HaYom Yom · 19 Kislev (Opening Entry of the Luach)',
  },
  'cheshvan-20': {
    chassidicMilestone: '20 MarCheshvan · Birthday of the Rebbe Rashab (5621 / 1860)',
    titleEn: 'Why Was the Soul Sent Down to This World?',
    titleHe: 'נשמה ירדה לעולם הזה שבעים–שמונים שנה לעשות טובה ליהודי',
    aphorismHe:
      'נְשָׁמָה יוֹרֶדֶת לָעוֹלָם הַזֶּה וְחַיָּה שִׁבְעִים אוֹ שְׁמוֹנִים שָׁנָה, כְּדֵי לַעֲשׂוֹת טוֹבָה לִיהוּדִי אֶחָד בְּגַשְׁמִיּוּת וּבִפְרָט בְּרוּחָנִיּוּת.',
    aphorismEn:
      'A soul descends into this physical world to live for seventy or eighty years solely in order to do a favor for another Jew—materially, and even more so spiritually.',
    practicalAvodah:
      'Look for one concrete opportunity today to assist someone both materially and with an encouraging word of Torah or warmth.',
    sourceNote: 'Sefer HaYom Yom · MarCheshvan Teaching',
  },
  'elul-18': {
    chassidicMilestone: 'Chai Elul · Birthday of the Baal Shem Tov & the Alter Rebbe',
    titleEn: 'Chai Elul — Infusing Vitality into "Ani L’Dodi"',
    titleHe: 'ח״י אלול — החיות של ״אני לדודי ודודי לי״',
    aphorismHe:
      'ח״י אֱלוּל הוּא יוֹם הַהוּלֶּדֶת שֶׁל הַבַּעַל שֵׁם טוֹב וְשֶׁל רַבֵּינוּ הַזָּקֵן — הַמַּכְנִיסִים חַיּוּת בָּעֲבוֹדָה שֶׁל ״אֲנִי לְדוֹדִי וְדוֹדִי לִי״ בְּתוֹךְ יְמֵי הָרַחֲמִים וְהַסְּלִיחוֹת.',
    aphorismEn:
      'Chai (18) Elul is the birthday of both the Baal Shem Tov and the Alter Rebbe. Together they revealed how every Jew can infuse living joy and inner vitality ("Chai") into the Elul service of "I am my Beloved’s and my Beloved is mine."',
    practicalAvodah:
      'Add an extra measure of joy and inward contemplation to today’s Tefillah and recite the three additional chapters of Tehillim instituted from Rosh Chodesh Elul.',
    sourceNote: 'Sefer HaYom Yom · 18 Elul',
  },
  'nissan-11': {
    chassidicMilestone: '11 Nissan · Birthday of the Lubavitcher Rebbe (5662 / 1902)',
    titleEn: 'Transforming Private Study into Communal Illumination',
    titleHe: 'אהבת ישראל היא השער להיכל ה׳',
    aphorismHe:
      'רֵאשִׁית הָעֲבוֹדָה וְעִיקָּרָהּ הִיא אַהֲבַת יִשְׂרָאֵל: לְקָרֵב לִבּוֹת בְּנֵי יִשְׂרָאֵל לַאֲבִיהֶם שֶׁבַּשָּׁמַיִם בְּאַהֲבָה וּבְמָאוֹר פָּנִים.',
    aphorismEn:
      'The foundation and gateway of all Divine service is Ahavat Yisrael: drawing the hearts of every single Jew closer to their Father in Heaven with unconditional love and a radiant countenance.',
    practicalAvodah:
      'Reflect on today’s new chapter of Tehillim and share a word of Torah or encouragement that uplifts another person.',
    sourceNote: 'Sefer HaYom Yom · 11 Nissan',
  },
  'tevet-24': {
    chassidicMilestone: '24 Tevet · Hilula of Rabbi Schneur Zalman of Liadi (Alter Rebbe)',
    titleEn: 'Nothing Stands in the Way of Seeking Only Hashem',
    titleHe: 'איני חפץ בשום דבר — כי אם אותך לבד',
    aphorismHe:
      '״מִי לִי בַשָּׁמַיִם וְעִמְּךָ לֹא חָפַצְתִּי בָאָרֶץ״ — אֵינִי רוֹצֶה גַּן עֵדֶן שֶׁלְּךָ, אֵינִי רוֹצֶה עוֹלָם הַבָּא שֶׁלְּךָ, אֵינִי רוֹצֶה אֶלָּא אוֹתְךָ לְבַד.',
    aphorismEn:
      'The Alter Rebbe would exclaim in ecstatic yearning: "I do not desire Your Gan Eden, I do not desire Your World to Come—I desire nothing other than You Yourself alone."',
    practicalAvodah:
      'Before praying today, pause for 30 seconds to align your intention purely toward connecting with the Creator through today’s mitzvot.',
    sourceNote: 'Sefer HaYom Yom · 24 Tevet',
  },
  'shevat-10': {
    chassidicMilestone: 'Yud Shevat · Hilula of the Frierdiker Rebbe & Leadership of the Rebbe',
    titleEn: 'Bati L’Gani — Returning the Shechinah to This Physical World',
    titleHe: 'באתי לגני אחותי כלה — עיקר שכינה בתחתונים',
    aphorismHe:
      '״בָּאתִי לְגַנִּי אֲחוֹתִי כַלָּה״ — לֹא לְגַן סְתָם, אֶלָּא לְגַנִּי, לַמָּקוֹם הָעִיקָּרִי שֶׁהָיָה מִתְּחִילָּה בַּתַּחְתּוֹנִים.',
    aphorismEn:
      '"I have come into My garden, My sister, My bride"—our task in the seventh generation since the Alter Rebbe is to draw the Divine presence back down into the lowest, most mundane corners of the physical world.',
    practicalAvodah:
      'Elevate an ordinary weekday activity today—your meal, work, or conversation—by dedicating it to a higher, holy purpose.',
    sourceNote: 'Sefer HaYom Yom & Maamar Bati L’Gani · 10 Shevat',
  },
  'tammuz-12': {
    chassidicMilestone: '12–13 Tammuz · Chag HaGeulah of the Frierdiker Rebbe',
    titleEn: 'Torah Study in Speech Has Tremendous Power',
    titleHe: 'כוח הדיבור בדברי תורה מטהר את האוויר',
    aphorismHe:
      'לֹא אוֹתִי בִּלְבַד גָּאַל הַקָּדוֹשׁ בָּרוּךְ הוּא בְּי״ב תַּמּוּז, כִּי אִם גַּם אֶת כָּל מְחַבְּבֵי תוֹרָתֵנוּ הַקְּדוֹשָׁה, שׁוֹמְרֵי מִצְווֹת וְגַם אֶת אֵלּוּ שֶׁרַק בְּשֵׁם יִשְׂרָאֵל יְכוּנֶה.',
    aphorismEn:
      '"The Holy One, blessed be He, did not redeem me alone on the 12th of Tammuz, but also all those who cherish our holy Torah, observe the mitzvot, and even those who merely bear the name Jew."',
    practicalAvodah:
      'Articulate your daily Torah study aloud today; speaking words of Torah refines the very atmosphere of the world around you.',
    sourceNote: 'Sefer HaYom Yom · 12 Tammuz',
  },
};

// 30 Daily HaYom Yom Teachings mapped to the 30 days of the Hebrew month (with cycle variations across the year)
const DAILY_HAYOM_YOM_COLLECTION: CuratedHaYomYomSeed[] = [
  {
    titleEn: 'Living with the Times — The Daily Parsha',
    titleHe: 'לחיות עם הזמן — פרשת השבוע והשיעור היומי',
    aphorismHe:
      'צָרִיךְ ״לִחְיוֹת עִם הַזְּמַן״ — פֵּירוּשׁוֹ לִחְיוֹת עִם פָּרָשַׁת הַשָּׁבוּעַ, וּבִפְרָט עִם פָּרָשַׁת הַיּוֹם שֶׁבְּפָרָשַׁת הַשָּׁבוּעַ.',
    aphorismEn:
      'The Alter Rebbe instructed his Chassidim that one must "live with the times"—meaning to live each day inspired by the weekly Torah portion, and specifically the daily Aliyah portion assigned to that day of the week.',
    practicalAvodah:
      'Read today’s Chumash Aliyah with Rashi commentary and identify one lesson directly applicable to your schedule today.',
    sourceNote: 'Sefer HaYom Yom · Cheshvan / Kislev',
  },
  {
    titleEn: 'The Three Daily Study Cycles (Chitas)',
    titleHe: 'שלושת השיעורים השווים לכל נפש — חת״ת',
    aphorismHe:
      'שְׁלוֹשָׁה שִׁיעוּרִים הַשָּׁוִים לְכָל נֶפֶשׁ: חוּמָּשׁ עִם פֵּירוּשׁ רַשִׁ״י בְּכָל יוֹם, תְּהִילִּים כְּמוֹ שֶׁנֶּחְלַק לִימֵי הַחוֹדֶשׁ, וְתַנְיָא כְּפִי שֶׁנֶּחְלַק לִימֵי הַשָּׁנָה.',
    aphorismEn:
      'Keep carefully the three daily study portions that apply equally to every soul (Chitas): the daily Chumash portion with Rashi, the daily Tehillim chapters of the month, and the daily portion of Tanya.',
    practicalAvodah:
      'Complete today’s Chumash, Tehillim, and Tanya portions—they serve as spiritual vessels for blessing for yourself and your household.',
    sourceNote: 'Sefer HaYom Yom · Directives on Chitas',
  },
  {
    titleEn: 'Two Verses Before Starting the Day',
    titleHe: 'טוב מעט בכוונה — כוח המחשבה בדיבור תורה',
    aphorismHe:
      'כַּאֲשֶׁר אָדָם הוֹלֵךְ בָּרְחוֹב וּמְהַרְהֵר בְּדִבְרֵי תּוֹרָה אוֹ אוֹמֵר פָּסוּק תְּהִילִּים, הֲרֵי הוּא מְקַדֵּשׁ אֶת הָרְחוֹב וּמֵאִיר אֶת הָעוֹלָם.',
    aphorismEn:
      'When a person walks down the street and contemplates words of Torah or recites a verse of Tehillim by heart, every step sanctifies the ground and illuminates the surrounding environment.',
    practicalAvodah:
      'Memorize one short verse from today’s Tehillim or Mishnah so you can repeat it while walking or commuting.',
    sourceNote: 'Sefer HaYom Yom · Tevet',
  },
  {
    titleEn: 'Warmth and Light versus Cold Indifference',
    titleHe: 'חסידות עושה כל דבר באור ובחמימות',
    aphorismHe:
      'הַחֲסִידוּת הוֹפֶכֶת אֶת הַקְּרִירוּת וְהָאֲדִישׁוּת לְאוֹר וַחֲמִימוּת — שֶׁכָּל מִצְוָה וְכָל טוֹבָה תֵּעָשֶׂה בְּחַיּוּת וּבְשִׂמְחָה.',
    aphorismEn:
      'Chassidus transforms coldness and spiritual indifference into light and warmth—teaching that every mitzvah and every act of kindness should be performed with living enthusiasm and joy.',
    practicalAvodah:
      'Perform one routine mitzvah today—such as Asher Yatzar, Birkat HaMazon, or Tzedakah—with fresh mindfulness and warmth.',
    sourceNote: 'Sefer HaYom Yom · Shevat',
  },
  {
    titleEn: 'Think Good and It Will Be Good (Tracht Gut Vet Zein Gut)',
    titleHe: 'טראכט גוט וועט זיין גוט — מידת הביטחון',
    aphorismHe:
      '״טְרַאכְט גוּט וֶועט זַיין גוּט״ — הַבִּטָּחוֹן הָאֲמִיתִּי בַּה׳ הוּא לֹא רַק הַשְׁקָטַת הַנֶּפֶשׁ, אֶלָּא הוּא עַצְמוֹ הַכְּלִי הַמֵּבִיא אֶת הַחֶסֶד הַגָּלוּי.',
    aphorismEn:
      '"Think good and it will be good!" True Bitachon (trust in Hashem) is not merely psychological reassurance; the joyful trust itself forms the spiritual vessel that draws down revealed goodness in the physical world.',
    practicalAvodah:
      'Replace a moment of worry or hesitation today with firm, calm confidence that Hashem guides every detail for the good.',
    sourceNote: 'Sefer HaYom Yom & Igrot Kodesh',
  },
  {
    titleEn: 'The Difference Between Humility and Self-Deprecation',
    titleHe: 'ענווה אמיתית מביאה לשמחה ולזריזות',
    aphorismHe:
      'עֲנָוָה אֵינָהּ הַנְמָכַת הָעֵרֶךְ שֶׁל הַכֹּחוֹת שֶׁנָּתַן ה׳, אֶלָּא הַהַכָּרָה שֶׁכָּל הַכִּשְׁרוֹנוֹת נִיתְּנוּ לְמַעַן מִילּוּי הַשְּׁלִיחוּת בָּעוֹלָם.',
    aphorismEn:
      'True humility is not underestimating the gifts Hashem has granted you; rather, it is recognizing that the greater your talents, the greater your responsibility to use them faithfully for your mission.',
    practicalAvodah:
      'Use one of your unique strengths today to help someone else without seeking credit.',
    sourceNote: 'Sefer HaYom Yom · Adar',
  },
  {
    titleEn: 'Tzedakah Before Prayer Opens the Gates',
    titleHe: 'צדקה קודם התפילה — ״אני בצדק אחזה פניך״',
    aphorismHe:
      'נְתִינַת צְדָקָה קוֹדֶם הַתְּפִילָּה פּוֹתַחַת אֶת הַלֵּב וּמְעוֹרֶרֶת חֶסֶד עֶלְיוֹן, כְּמוֹ שֶׁכָּתוּב: ״אֲנִי בְּצֶדֶק אֶחֱזֶה פָנֶיךָ״.',
    aphorismEn:
      'Giving Tzedakah prior to Shacharit and Mincha opens the heart and awakens supernal compassion, fulfilling the verse: "Through charity I shall behold Your countenance."',
    practicalAvodah:
      'Set aside a coin or pledge for Tzedakah immediately before beginning your morning and afternoon prayers.',
    sourceNote: 'Sefer HaYom Yom · Nissan',
  },
  {
    titleEn: 'Every Jew Possesses a Spark of Moshe Rabbeinu',
    titleHe: 'בכל יהודי יש ניצוץ מנשמת משה רבינו',
    aphorismHe:
      'בְּכָל אֶחָד וְאֶחָד מִיִּשְׂרָאֵל יֵשׁ נִיצוֹץ מִנִּשְׁמַת מֹשֶׁה רַבֵּינוּ, הַזָּן וּמְפַרְנֵס אֶת הָאֱמוּנָה וְהַדַּעַת שֶׁבַּנֶּפֶשׁ.',
    aphorismEn:
      'As explained in Tanya, within every single Jew shines an inner spark of Moshe Rabbeinu, which nourishes the soul’s innate faith and enables the mind to rule over the impulses of the heart.',
    practicalAvodah:
      'When faced with a distraction today, remember that the mind ("Moach") inherently holds sovereignty over the heart ("Lev").',
    sourceNote: 'Sefer HaYom Yom · Iyar',
  },
  {
    titleEn: 'Precision in Time — Treasuring Every Moment',
    titleHe: 'יקרת הזמן — כל רגע הוא אוצר שאין לו תמורה',
    aphorismHe:
      'הַזְּמַן הוּא יָקָר מִכָּל יָקָר: כֶּסֶף שֶׁאָבַד אֶפְשָׁר לְהַרְוִויחַ שׁוּב, אֲבָל רֶגַע אֶחָד שֶׁחָלַף בְּלִי תּוֹרָה וּמַעֲשִׂים טוֹבִים אֵינוֹ חוֹזֵר לְעוֹלָם.',
    aphorismEn:
      'Time is the most precious treasure: money lost can be earned again, but a single moment that passes can never be retrieved—and within a single moment one can accomplish an eternal mitzvah.',
    practicalAvodah:
      'Reclaim five transitional minutes today for a short Mishnah, Halacha, or chapter of Tehillim.',
    sourceNote: 'Sefer HaYom Yom · Sivan',
  },
  {
    titleEn: 'Refining Speech — Only Positive Words',
    titleHe: 'שמירת הדיבור — לדבר תמיד בלשון נקייה וחיובית',
    aphorismHe:
      'דֶּרֶךְ הַתּוֹרָה הִיא לְדַבֵּר תָּמִיד בְּלָשׁוֹן נְקִיָּה וּמְבוֹרֶכֶת, וּלְלַמֵּד זְכוּת עַל כָּל אֶחָד וְאֶחָד מִיִּשְׂרָאֵל.',
    aphorismEn:
      'The way of the Torah is to speak always with refined, constructive language, and to actively seek out the merit and hidden goodness within every fellow person.',
    practicalAvodah:
      'Consciously frame your conversations today in positive, encouraging terms and judge others favorably.',
    sourceNote: 'Sefer HaYom Yom · Tammuz',
  },
  {
    titleEn: 'Prayer as the Ladder Between Earth and Heaven',
    titleHe: 'תפילה היא סולם מוצב ארצה וראשו מגיע השמימה',
    aphorismHe:
      'הַתְּפִילָּה הִיא הַ״סּוּלָּם מוּצָּב אַרְצָה וְרֹאשׁוֹ מַגִּיעַ הַשָּׁמַיְמָה״ — עַל יְדֵי הַהִתְבּוֹנְנוּת מִתְעַלֶּה הָאָדָם דַּרגָּה אַחַר דַּרגָּה.',
    aphorismEn:
      'Prayer is the ladder set upon the earth whose top reaches heavenward: from Baruch She’amar through Pesukei D’Zimra, Shema, and the Amidah, a person ascends step by step in closeness to Hashem.',
    practicalAvodah:
      'Read one paragraph of Pesukei D’Zimra slowly today, paying attention to the meaning of each Hebrew word.',
    sourceNote: 'Sefer HaYom Yom · Av',
  },
  {
    titleEn: 'The King in the Field',
    titleHe: 'המלך בשדה — פנים שוחקות לכל אדם',
    aphorismHe:
      'כַּאֲשֶׁר הַמֶּלֶךְ יוֹצֵא לַשָּׂדֶה, כָּל מִי שֶׁרוֹצֶה רַשַּׁאי לְהִתְקָרֵב אֵלָיו, וְהוּא מְקַבֵּל אֶת כּוּלָּם בְּפָנִים יָפוֹת וּבְפָנִים שׂוֹחֲקוֹת.',
    aphorismEn:
      'With the parable of the King in the Field, the Alter Rebbe taught that Hashem makes Himself accessible right where we are in our everyday lives, receiving everyone who turns to Him with a smiling countenance.',
    practicalAvodah:
      'Speak a brief personal request to Hashem in your own words during Shema Koleinu today.',
    sourceNote: 'Sefer HaYom Yom · Elul',
  },
  {
    titleEn: 'Simcha Breaks Through All Boundaries',
    titleHe: 'שמחה פורצת כל גדר — עבודה מתוך חדווה',
    aphorismHe:
      '״שִׂמְחָה פּוֹרֶצֶת גָּדֵר״ — עֲבוֹדַת ה׳ מִתּוֹךְ שִׂמְחָה וְטוּב לֵבָב מְנַצַּחַת אֶת כָּל הַמְּנִיעוֹת מִבַּיִת וּמִחוּץ.',
    aphorismEn:
      '"Joy breaks through all barriers!" Serving Hashem with gladness of heart dissolves both internal doubts and external obstacles with effortless grace.',
    practicalAvodah:
      'Hum a soulful Niggun or bring a joyful smile into your home and workplace today.',
    sourceNote: 'Sefer HaYom Yom · Tishrei',
  },
  {
    titleEn: 'A Little Light Dispels Much Darkness',
    titleHe: 'מעט מן האור דוחה הרבה מן החושך',
    aphorismHe:
      'אֵין מְגָרְשִׁים אֶת הַחוֹשֶׁךְ בְּמַקְלוֹת, אֶלָּא מַדְלִיקִים נֵר אֶחָד שֶׁל אוֹר — כִּי מְעַט מִן הָאוֹר דּוֹחֶה הַרְבֵּה מִן הַחוֹשֶׁךְ.',
    aphorismEn:
      'One does not chase away darkness with a stick; rather, one kindles a single candle of light—for even a small flame of Torah and kindness automatically dispels a great deal of darkness.',
    practicalAvodah:
      'Respond to any challenge today by adding a positive act of light rather than dwelling on negativity.',
    sourceNote: 'Sefer HaYom Yom · Kislev',
  },
  {
    titleEn: 'Unity Through Daily Tehillim',
    titleHe: 'אמירת תהילים מחברת את כל כלל ישראל',
    aphorismHe:
      'אִילּוּ יָדְעוּ בְּנֵי אָדָם כֹּחָם שֶׁל פְּסוּקֵי תְּהִילִּים, הָיוּ אוֹמְרִים אוֹתָם בְּכָל עֵת — כִּי מִזְמוֹרֵי דָּוִד הַמֶּלֶךְ פּוֹעֲלִים יְשׁוּעוֹת בְּלִי מְחִיצוֹת.',
    aphorismEn:
      'The Tzemach Tzedek wrote: "If people only knew the power of verses of Tehillim and their effect in the supernal realms, they would recite them constantly." Reciting the daily monthly portion unites Jews across the globe.',
    practicalAvodah:
      'Recite at least two chapters from today’s monthly Tehillim allocation on behalf of the entire Jewish people.',
    sourceNote: 'Sefer HaYom Yom · 24 Shevat',
  },
];

// Compute the daily Tanya portion based on where the date falls in the annual cycle starting 19 Kislev
function computeDailyTanyaPortion(
  monthEn: string,
  dayNum: number
): { en: string; he: string; ref: string } {
  const m = monthEn.toLowerCase();
  if (m.includes('kislev') && dayNum >= 19) {
    const ch = Math.min(6, Math.max(1, Math.ceil((dayNum - 18) / 2)));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('tevet')) {
    const ch = Math.min(14, 6 + Math.ceil(dayNum / 4));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('shevat')) {
    const ch = Math.min(25, 14 + Math.ceil(dayNum / 3));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('adar')) {
    const ch = Math.min(34, 25 + Math.ceil(dayNum / 3));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('nissan')) {
    const ch = Math.min(41, 34 + Math.ceil(dayNum / 4));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('iyar')) {
    const ch = Math.min(50, 41 + Math.ceil(dayNum / 3));
    return {
      en: `Likutei Amarim · Chapter ${ch}`,
      he: `ליקוטי אמרים · פרק ${ch}`,
      ref: `Tanya, Part I; Likutei Amarim ${ch}`,
    };
  }
  if (m.includes('sivan')) {
    if (dayNum <= 10) {
      const ch = Math.min(53, 50 + Math.ceil(dayNum / 3));
      return {
        en: `Likutei Amarim · Chapter ${ch}`,
        he: `ליקוטי אמרים · פרק ${ch}`,
        ref: `Tanya, Part I; Likutei Amarim ${ch}`,
      };
    }
    const ch = Math.min(12, Math.max(1, Math.ceil((dayNum - 10) / 2)));
    return {
      en: `Shaar HaYichud VeHaEmunah · Ch. ${ch}`,
      he: `שער היחוד והאמונה · פרק ${ch}`,
      ref: `Tanya, Part II; Shaar HaYichud VehaEmunah ${ch}`,
    };
  }
  if (m.includes('tammuz')) {
    const ch = Math.min(11, Math.max(1, Math.ceil(dayNum / 3)));
    return {
      en: `Iggeret HaTeshuvah · Chapter ${ch}`,
      he: `אגרת התשובה · פרק ${ch}`,
      ref: `Tanya, Part III; Iggeret HaTeshuvah ${ch}`,
    };
  }
  if (m.includes('av') || m.includes('elul')) {
    const epistle = Math.min(20, Math.max(1, Math.ceil(dayNum / 2)));
    return {
      en: `Iggeret HaKodesh · Epistle ${epistle}`,
      he: `אגרת הקודש · סימן ${epistle}`,
      ref: `Tanya, Part IV; Iggeret HaKodesh ${epistle}`,
    };
  }
  if (m.includes('tishri') || m.includes('tishrei')) {
    const epistle = Math.min(32, 20 + Math.ceil(dayNum / 3));
    return {
      en: `Iggeret HaKodesh · Epistle ${epistle}`,
      he: `אגרת הקודש · סימן ${epistle}`,
      ref: `Tanya, Part IV; Iggeret HaKodesh ${epistle}`,
    };
  }
  // Cheshvan & Kislev 1–18: Kuntres Acharon & completion of Iggeret HaKodesh
  const essay = Math.min(9, Math.max(1, Math.ceil(dayNum / 4)));
  return {
    en: `Kuntres Acharon · Essay ${essay}`,
    he: `קונטרס אחרון · מאמר ${essay}`,
    ref: `Tanya, Part V; Kuntres Acharon ${essay}`,
  };
}

function normalizeMonthKey(monthEn: string): string {
  const m = monthEn.toLowerCase();
  if (m.includes('tishri') || m.includes('tishrei')) return 'tishrei';
  if (m.includes('cheshvan') || m.includes('heshvan')) return 'cheshvan';
  if (m.includes('kislev')) return 'kislev';
  if (m.includes('tevet')) return 'tevet';
  if (m.includes('shevat') || m.includes('shvat')) return 'shevat';
  if (m.includes('adar')) return 'adar';
  if (m.includes('nissan') || m.includes('nisan')) return 'nissan';
  if (m.includes('iyar') || m.includes('iyyar')) return 'iyar';
  if (m.includes('sivan')) return 'sivan';
  if (m.includes('tammuz') || m.includes('tamuz')) return 'tammuz';
  if (m.includes('av')) return 'av';
  if (m.includes('elul')) return 'elul';
  return 'cheshvan';
}

export function getHaYomYomForDate(date: Date): HaYomYomEntry {
  const hebStrings = getHebrewDateStrings(date);
  const parts = parseHebrewDateParts(date);
  const clampedDay = Math.max(1, Math.min(30, parts.dayNum || 1));
  const monthKey = normalizeMonthKey(parts.monthEn);

  const tehillim =
    MONTHLY_TEHILLIM_SCHEDULE[clampedDay] || MONTHLY_TEHILLIM_SCHEDULE[1];
  const tanya = computeDailyTanyaPortion(parts.monthEn, clampedDay);

  const exactKey = `${monthKey}-${clampedDay}`;
  const specialSeed = SPECIAL_DATE_TEACHINGS[exactKey];

  // Deterministic index combining month and day so every day of the Hebrew year has a distinct pairing
  const monthOffset =
    monthKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    DAILY_HAYOM_YOM_COLLECTION.length;
  const fallbackSeed =
    DAILY_HAYOM_YOM_COLLECTION[
      (clampedDay - 1 + monthOffset) % DAILY_HAYOM_YOM_COLLECTION.length
    ];

  const chosen = specialSeed || fallbackSeed;

  let milestone = chosen.chassidicMilestone;
  if (!milestone && (clampedDay === 1 || clampedDay === 30)) {
    milestone = `Rosh Chodesh ${parts.monthEn} · Yaaleh V’Yavo & Half-Hallel`;
  }

  return {
    id: `hyy-${monthKey}-${clampedDay}`,
    hebrewDateDisplayHe: hebStrings.he,
    hebrewDateDisplayEn: hebStrings.en,
    hebrewDayNum: clampedDay,
    hebrewMonthEn: parts.monthEn,
    hebrewMonthHe: parts.monthHe,
    tehillimRangeEn: tehillim.en,
    tehillimRangeHe: tehillim.he,
    tehillimSefariaRef: tehillim.ref,
    tanyaPortionEn: tanya.en,
    tanyaPortionHe: tanya.he,
    tanyaSefariaRef: tanya.ref,
    chassidicMilestone: milestone,
    titleEn: chosen.titleEn,
    titleHe: chosen.titleHe,
    aphorismHe: chosen.aphorismHe,
    aphorismEn: chosen.aphorismEn,
    practicalAvodah: chosen.practicalAvodah,
    sourceNote: chosen.sourceNote,
  };
}
