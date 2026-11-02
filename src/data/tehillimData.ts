import {
  DailyTehillimData,
  DailyTehillimChapterItem,
} from '../types/dashboard';
import {
  getHebrewDateStrings,
  parseHebrewDateParts,
} from '../services/halachaService';

const HEBREW_DAYS_GEMATRIA: Record<number, string> = {
  1: 'א׳',
  2: 'ב׳',
  3: 'ג׳',
  4: 'ד׳',
  5: 'ה׳',
  6: 'ו׳',
  7: 'ז׳',
  8: 'ח׳',
  9: 'ט׳',
  10: 'י׳',
  11: 'י״א',
  12: 'י״ב',
  13: 'י״ג',
  14: 'י״ד',
  15: 'ט״ו',
  16: 'ט״ז',
  17: 'י״ז',
  18: 'י״ח',
  19: 'י״ט',
  20: 'כ׳',
  21: 'כ״א',
  22: 'כ״ב',
  23: 'כ״ג',
  24: 'כ״ד',
  25: 'כ״ה',
  26: 'כ״ו',
  27: 'כ״ז',
  28: 'כ״ח',
  29: 'כ״ט',
  30: 'ל׳',
};

export function numberToHebrewGematria(num: number): string {
  if (num <= 0) return String(num);
  if (num <= 30 && HEBREW_DAYS_GEMATRIA[num]) return HEBREW_DAYS_GEMATRIA[num];

  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

  const h = Math.floor(num / 100);
  const rem = num % 100;
  let letters = hundreds[h] || '';

  if (rem === 15) {
    letters += 'טו';
  } else if (rem === 16) {
    letters += 'טז';
  } else {
    const t = Math.floor(rem / 10);
    const o = rem % 10;
    letters += (tens[t] || '') + (ones[o] || '');
  }

  if (letters.length === 1) {
    return `${letters}׳`;
  }
  return `${letters.slice(0, -1)}״${letters.slice(-1)}`;
}

interface DayTehillimSpec {
  startCh: number;
  endCh: number;
  rangeLabelEn: string;
  rangeLabelHe: string;
  primarySefariaRef: string;
  featuredPasukHe: string;
  featuredPasukEn: string;
  featuredPasukRef: string;
  themeSummary: string;
  customChapters?: DailyTehillimChapterItem[];
}

const TEHILLIM_30_DAY_CYCLE: Record<number, DayTehillimSpec> = {
  1: {
    startCh: 1,
    endCh: 9,
    rangeLabelEn: 'Chapters 1–9',
    rangeLabelHe: 'פרקים א׳–ט׳',
    primarySefariaRef: 'Psalms 1',
    featuredPasukHe:
      'וְהָיָה כְּעֵץ שָׁתוּל עַל־פַּלְגֵי מָיִם אֲשֶׁר פִּרְיוֹ יִתֵּן בְּעִתּוֹ וְעָלֵהוּ לֹא־יִבּוֹל וְכֹל אֲשֶׁר־יַעֲשֶׂה יַצְלִיחַ׃',
    featuredPasukEn:
      'He is like a tree planted beside streams of water, which yields its fruit in season, whose foliage never fades, and whatever he produces thrives.',
    featuredPasukRef: 'Psalms 1:3',
    themeSummary:
      'Rooting one’s life in Torah wisdom, trust amid adversity, and the majesty of Creation.',
  },
  2: {
    startCh: 10,
    endCh: 17,
    rangeLabelEn: 'Chapters 10–17',
    rangeLabelHe: 'פרקים י׳–י״ז',
    primarySefariaRef: 'Psalms 16',
    featuredPasukHe: 'שִׁוִּיתִי ה׳ לְנֶגְדִּי תָמִיד כִּי מִימִינִי בַּל־אֶמּוֹט׃',
    featuredPasukEn:
      'I have set Hashem before me always; because He is at my right hand, I shall never be shaken.',
    featuredPasukRef: 'Psalms 16:8',
    themeSummary:
      'Walking in integrity, constant awareness of the Divine presence, and refuge in Hashem.',
  },
  3: {
    startCh: 18,
    endCh: 22,
    rangeLabelEn: 'Chapters 18–22',
    rangeLabelHe: 'פרקים י״ח–כ״ב',
    primarySefariaRef: 'Psalms 19',
    featuredPasukHe:
      'תּוֹרַת ה׳ תְּמִימָה מְשִׁיבַת נָפֶשׁ עֵדוּת ה׳ נֶאֱמָנָה מַחְכִּימַת פֶּתִי׃',
    featuredPasukEn:
      'The Torah of Hashem is perfect, restoring the soul; the testimony of Hashem is trustworthy, making wise the simple.',
    featuredPasukRef: 'Psalms 19:8',
    themeSummary:
      'The heavens declaring Divine glory, the soul-restoring light of Torah, and salvation in times of distress (Ya’ancha).',
  },
  4: {
    startCh: 23,
    endCh: 28,
    rangeLabelEn: 'Chapters 23–28',
    rangeLabelHe: 'פרקים כ״ג–כ״ח',
    primarySefariaRef: 'Psalms 23',
    featuredPasukHe: 'מִזְמוֹר לְדָוִד ה׳ רֹעִי לֹא אֶחְסָר׃',
    featuredPasukEn: 'A Psalm of David: Hashem is my shepherd; I shall not lack.',
    featuredPasukRef: 'Psalms 23:1',
    themeSummary:
      'Serene trust in the Divine Shepherd, ascending the mountain of Hashem, and yearning to dwell in His sanctuary (Achat Sha’alti).',
  },
  5: {
    startCh: 29,
    endCh: 34,
    rangeLabelEn: 'Chapters 29–34',
    rangeLabelHe: 'פרקים כ״ט–ל״ד',
    primarySefariaRef: 'Psalms 29',
    featuredPasukHe: 'ה׳ עֹז לְעַמּוֹ יִתֵּן ה׳ יְבָרֵךְ אֶת־עַמּוֹ בַשָּׁלוֹם׃',
    featuredPasukEn:
      'Hashem will give strength to His people; Hashem will bless His people with peace.',
    featuredPasukRef: 'Psalms 29:11',
    themeSummary:
      'The seven voices of Hashem, dedicating the house, guarding one’s speech, and blessing the nation with peace.',
  },
  6: {
    startCh: 35,
    endCh: 38,
    rangeLabelEn: 'Chapters 35–38',
    rangeLabelHe: 'פרקים ל״ה–ל״ח',
    primarySefariaRef: 'Psalms 36',
    featuredPasukHe: 'כִּי־עִמְּךָ מְקוֹר חַיִּים בְּאוֹרְךָ נִרְאֶה־אוֹר׃',
    featuredPasukEn:
      'For with You is the fountain of life; by Your light do we see light.',
    featuredPasukRef: 'Psalms 36:10',
    themeSummary:
      'Turning away from evil, doing good, and drawing illumination from the supernal Fountain of Life.',
  },
  7: {
    startCh: 39,
    endCh: 43,
    rangeLabelEn: 'Chapters 39–43',
    rangeLabelHe: 'פרקים ל״ט–מ״ג',
    primarySefariaRef: 'Psalms 42',
    featuredPasukHe:
      'כְּאַיָּל תַּעֲרֹג עַל־אֲפִיקֵי־מָיִם כֵּן נַפְשִׁי תַעֲרֹג אֵלֶיךָ אֱלֹהִים׃',
    featuredPasukEn:
      'Like a hind yearning for streams of water, so does my soul yearn for You, O God.',
    featuredPasukRef: 'Psalms 42:2',
    themeSummary:
      'Completion of Book I and opening of Book II: the soul’s deep thirst for spiritual connection and hope.',
  },
  8: {
    startCh: 44,
    endCh: 48,
    rangeLabelEn: 'Chapters 44–48',
    rangeLabelHe: 'פרקים מ״ד–מ״ח',
    primarySefariaRef: 'Psalms 46',
    featuredPasukHe: 'ה׳ צְבָאוֹת עִמָּנוּ מִשְׂגָּב־לָנוּ אֱלֹהֵי יַעֲקֹב סֶלָה׃',
    featuredPasukEn:
      'Hashem of Hosts is with us; the God of Jacob is ourhaven and fortress, Selah.',
    featuredPasukRef: 'Psalms 46:8',
    themeSummary:
      'Songs of the Sons of Korach celebrating Jerusalem and unwavering covenantal faithfulness.',
  },
  9: {
    startCh: 49,
    endCh: 54,
    rangeLabelEn: 'Chapters 49–54',
    rangeLabelHe: 'פרקים מ״ט–נ״ד',
    primarySefariaRef: 'Psalms 51',
    featuredPasukHe:
      'לֵב טָהוֹר בְּרָא־לִי אֱלֹהִים וְרוּחַ נָכוֹן חַדֵּשׁ בְּקִרְבִּי׃',
    featuredPasukEn:
      'Create in me a pure heart, O God, and renew a steadfast spirit within me.',
    featuredPasukRef: 'Psalms 51:12',
    themeSummary:
      'Eternal spiritual wealth over transient materialism, and the transformative power of heartfelt Teshuvah.',
  },
  10: {
    startCh: 55,
    endCh: 59,
    rangeLabelEn: 'Chapters 55–59',
    rangeLabelHe: 'פרקים נ״ה–נ״ט',
    primarySefariaRef: 'Psalms 55',
    featuredPasukHe:
      'הַשְׁלֵךְ עַל־ה׳ יְהָבְךָ וְהוּא יְכַלְכְּלֶךָ לֹא־יִתֵּן לְעוֹלָם מוֹט לַצַּדִּיק׃',
    featuredPasukEn:
      'Cast your burden upon Hashem and He will sustain you; He will never let the righteous falter.',
    featuredPasukRef: 'Psalms 55:23',
    themeSummary:
      'Placing every burden upon Hashem, awakening the dawn with gratitude, and sheltered refuge.',
  },
  11: {
    startCh: 60,
    endCh: 65,
    rangeLabelEn: 'Chapters 60–65',
    rangeLabelHe: 'פרקים ס׳–ס״ה',
    primarySefariaRef: 'Psalms 63',
    featuredPasukHe:
      'אֱלֹהִים אֵלִי אַתָּה אֲשַׁחֲרֶךָּ צָמְאָה לְךָ נַפְשִׁי כָּמַהּ לְךָ בְשָׂרִי בְּאֶרֶץ־צִיָּה וְעָיֵף בְּלִי־מָיִם׃',
    featuredPasukEn:
      'O God, You are my God; I seek You at dawn; my soul thirsts for You, my flesh longs for You in a parched and weary land without water.',
    featuredPasukRef: 'Psalms 63:2',
    themeSummary:
      'Seeking Hashem in the Judean wilderness, silent trust, and nature singing with joy.',
  },
  12: {
    startCh: 66,
    endCh: 68,
    rangeLabelEn: 'Chapters 66–68',
    rangeLabelHe: 'פרקים ס״ו–ס״ח',
    primarySefariaRef: 'Psalms 67',
    featuredPasukHe: 'אֱלֹהִים יְחָנֵּנוּ וִיבָרְכֵנוּ יָאֵר פָּנָיו אִתָּנוּ סֶלָה׃',
    featuredPasukEn:
      'May God be gracious to us and bless us; may He cause His countenance to shine among us, Selah.',
    featuredPasukRef: 'Psalms 67:2',
    themeSummary:
      'The Menorah Psalm (LaMenatzeach BiNeginot) and thanksgiving for miraculous deliverance.',
  },
  13: {
    startCh: 69,
    endCh: 71,
    rangeLabelEn: 'Chapters 69–71',
    rangeLabelHe: 'פרקים ס״ט–ע״א',
    primarySefariaRef: 'Psalms 69',
    featuredPasukHe:
      'וַאֲנִי תְפִלָּתִי־לְךָ ה׳ עֵת רָצוֹן אֱלֹהִים בְּרָב־חַסְדֶּךָ עֲנֵנִי בֶּאֱמֶת יִשְׁעֶךָ׃',
    featuredPasukEn:
      'As for me, may my prayer to You, Hashem, be at an auspicious time (Et Ratzon); O God, in Your abundant kindness, answer me with the truth of Your salvation.',
    featuredPasukRef: 'Psalms 69:14',
    themeSummary:
      'Praying at an auspicious time of favor (Et Ratzon) and lifelong reliance on Hashem from youth to old age.',
  },
  14: {
    startCh: 72,
    endCh: 76,
    rangeLabelEn: 'Chapters 72–76',
    rangeLabelHe: 'פרקים ע״ב–ע״ו',
    primarySefariaRef: 'Psalms 73',
    featuredPasukHe:
      'וַאֲנִי קִרְבַת אֱלֹהִים לִי־טוֹב שַׁתִּי בּאדֹנָי ה׳ מַחְסִי לְסַפֵּר כָּל־מַלְאֲכוֹתֶיךָ׃',
    featuredPasukEn:
      'As for me, nearness to God is my good; I have made the Lord Hashem my refuge, that I may recount all Your works.',
    featuredPasukRef: 'Psalms 73:28',
    themeSummary:
      'King David’s blessing for Solomon, concluding Book II, and Asaph’s realization that closeness to Hashem is the ultimate good.',
  },
  15: {
    startCh: 77,
    endCh: 78,
    rangeLabelEn: 'Chapters 77–78',
    rangeLabelHe: 'פרקים ע״ז–ע״ח',
    primarySefariaRef: 'Psalms 78',
    featuredPasukHe:
      'וְהוּא רַחוּם יְכַפֵּר עָוֹן וְלֹא־יַשְׁחִית וְהִרְבָּה לְהָשִׁיב אַפּוֹ וְלֹא־יָעִיר כָּל־חֲמָתוֹ׃',
    featuredPasukEn:
      'Yet He, being merciful, forgives iniquity and does not destroy; time and again He turns away His wrath and does not awaken all His anger.',
    featuredPasukRef: 'Psalms 78:38',
    themeSummary:
      'Transmitting the chain of Jewish memory from generation to generation and recalling Divine compassion in the desert.',
  },
  16: {
    startCh: 79,
    endCh: 82,
    rangeLabelEn: 'Chapters 79–82',
    rangeLabelHe: 'פרקים ע״ט–פ״ב',
    primarySefariaRef: 'Psalms 81',
    featuredPasukHe:
      'אָנֹכִי ה׳ אֱלֹהֶיךָ הַמַּעַלְךָ מֵאֶרֶץ מִצְרָיִם הַרְחֶב־פִּיךָ וַאֲמַלְאֵהוּ׃',
    featuredPasukEn:
      'I am Hashem your God, who brought you up out of the land of Egypt; open your mouth wide, and I will fill it.',
    featuredPasukRef: 'Psalms 81:11',
    themeSummary:
      'Prayers for the Shepherd of Israel, the joyous song of Rosh Chodesh, and pursuing justice for the vulnerable.',
  },
  17: {
    startCh: 83,
    endCh: 87,
    rangeLabelEn: 'Chapters 83–87',
    rangeLabelHe: 'פרקים פ״ג–פ״ז',
    primarySefariaRef: 'Psalms 84',
    featuredPasukHe:
      'כִּי שֶׁמֶשׁ וּמָגֵן ה׳ אֱלֹהִים חֵן וְכָבוֹד יִתֵּן ה׳ לֹא יִמְנַע־טוֹב לַהֹלְכִים בְּתָמִים׃',
    featuredPasukEn:
      'For Hashem God is a sun and a shield; Hashem bestows grace and glory, and withholds no good from those who walk whole-heartedly.',
    featuredPasukRef: 'Psalms 84:12',
    themeSummary:
      'Love for the courts of Hashem, truth sprouting from the earth while righteousness looks down from heaven, and Zion as the spiritual birthplace.',
  },
  18: {
    startCh: 88,
    endCh: 89,
    rangeLabelEn: 'Chapters 88–89',
    rangeLabelHe: 'פרקים פ״ח–פ״ט',
    primarySefariaRef: 'Psalms 89',
    featuredPasukHe: 'אָמַרְתִּי עוֹלָם חֶסֶד יִבָּנֶה שָׁמַיִם תָּכִין אֱמוּנָתְךָ בָהֶם׃',
    featuredPasukEn:
      'I have said: "The world is built on kindness (Olam Chesed Yibaneh); in the very heavens You establish Your faithfulness."',
    featuredPasukRef: 'Psalms 89:3',
    themeSummary:
      'Concluding Book III with Ethan the Ezrahite’s proclamation that the universe is built upon Chesed and the eternal Davidic covenant.',
  },
  19: {
    startCh: 90,
    endCh: 96,
    rangeLabelEn: 'Chapters 90–96',
    rangeLabelHe: 'פרקים צ׳–צ״ו',
    primarySefariaRef: 'Psalms 90',
    featuredPasukHe:
      'וִיהִי נֹעַם אֲדֹנָי אֱלֹהֵינוּ עָלֵינוּ וּמַעֲשֵׂה יָדֵינוּ כּוֹנְנָה עָלֵינוּ וּמַעֲשֵׂה יָדֵינוּ כּוֹנְנֵהוּ׃',
    featuredPasukEn:
      'May the pleasantness of the Lord our God be upon us; establish the work of our hands for us—indeed, establish the work of our hands.',
    featuredPasukRef: 'Psalms 90:17',
    themeSummary:
      'Opening Book IV with the Prayer of Moshe Rabbeinu, Yoshev BeSeter Elyon (Ch. 91), the Song for the Shabbat Day (Ch. 92), and Kabbalat Shabbat hymns.',
  },
  20: {
    startCh: 97,
    endCh: 103,
    rangeLabelEn: 'Chapters 97–103',
    rangeLabelHe: 'פרקים צ״ז–ק״ג',
    primarySefariaRef: 'Psalms 100',
    featuredPasukHe: 'עִבְדוּ אֶת־ה׳ בְּשִׂמְחָה בֹּאוּ לְפָנָיו בִּרְנָנָה׃',
    featuredPasukEn:
      'Serve Hashem with joy; come before His presence with singing!',
    featuredPasukRef: 'Psalms 100:2',
    themeSummary:
      'Light sown for the righteous, Mizmor LeTodah (serving Hashem with joy), and Borchi Nafshi.',
  },
  21: {
    startCh: 104,
    endCh: 105,
    rangeLabelEn: 'Chapters 104–105',
    rangeLabelHe: 'פרקים ק״ד–ק״ה',
    primarySefariaRef: 'Psalms 104',
    featuredPasukHe:
      'מָה־רַבּוּ מַעֲשֶׂיךָ ה׳ כֻּלָּם בְּחָכְמָה עָשִׂיתָ מָלְאָה הָאָרֶץ קִנְיָנֶךָ׃',
    featuredPasukEn:
      'How manifold are Your works, O Hashem! In wisdom You have made them all; the earth is full of Your creations.',
    featuredPasukRef: 'Psalms 104:24',
    themeSummary:
      'The Rosh Chodesh hymn of Creation (Borchi Nafshi) and recounting the wonders of the Patriarchs.',
  },
  22: {
    startCh: 106,
    endCh: 107,
    rangeLabelEn: 'Chapters 106–107',
    rangeLabelHe: 'פרקים ק״ו–ק״ז',
    primarySefariaRef: 'Psalms 107',
    featuredPasukHe: 'הוֹדוּ לַה׳ כִּי־טוֹב כִּי לְעוֹלָם חַסְדּוֹ׃',
    featuredPasukEn:
      'Give thanks to Hashem, for He is good, for His kindness endures forever.',
    featuredPasukRef: 'Psalms 107:1',
    themeSummary:
      'Concluding Book IV and opening Book V with the chapter of Birkat HaGomel (thanksgiving for four who must offer gratitude).',
  },
  23: {
    startCh: 108,
    endCh: 112,
    rangeLabelEn: 'Chapters 108–112',
    rangeLabelHe: 'פרקים ק״ח–קי״ב',
    primarySefariaRef: 'Psalms 111',
    featuredPasukHe:
      'רֵאשִׁית חָכְמָה יִרְאַת ה׳ שֵׂכֶל טוֹב לְכָל־עֹשֵׂיהֶם תְּהִלָּתוֹ עֹמֶדֶת לָעַד׃',
    featuredPasukEn:
      'The beginning of wisdom is the awe of Hashem; good understanding belongs to all who practice them; His praise endures forever.',
    featuredPasukRef: 'Psalms 111:10',
    themeSummary:
      'Awakening the dawn with harp and lyre, alphabetical acrostics of Divine praise, and the generosity of the righteous.',
  },
  24: {
    startCh: 113,
    endCh: 118,
    rangeLabelEn: 'Chapters 113–118 (Hallel)',
    rangeLabelHe: 'פרקים קי״ג–קי״ח (הלל)',
    primarySefariaRef: 'Psalms 118',
    featuredPasukHe: 'זֶה־הַיּוֹם עָשָׂה ה׳ נָגִילָה וְנִשְׂמְחָה בוֹ׃',
    featuredPasukEn:
      'This is the day that Hashem has made; let us exult and rejoice on it!',
    featuredPasukRef: 'Psalms 118:24',
    themeSummary:
      'The complete festival Hallel (Chapters 113–118), celebrating the Exodus, Divine providence, and joyous redemption.',
  },
  25: {
    startCh: 119,
    endCh: 119,
    rangeLabelEn: 'Chapter 119:1–96 (א–ל)',
    rangeLabelHe: 'פרק קי״ט (אותיות א׳–ל׳)',
    primarySefariaRef: 'Psalms 119:1-96',
    featuredPasukHe: 'גַּל־עֵינַי וְאַבִּיטָה נִפְלָאוֹת מִתּוֹרָתֶךָ׃',
    featuredPasukEn:
      'Uncover my eyes, that I may behold wondrous things out of Your Torah.',
    featuredPasukRef: 'Psalms 119:18',
    themeSummary:
      'Part I of the great eight-fold Aleph-Bet acrostic (Tamidya, Aleph through Lamed) extolling love for every mitzvah of the Torah.',
    customChapters: [
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:1–32 (א–ד)',
        labelHe: 'קי״ט: א׳–ד׳',
        sefariaRef: 'Psalms 119:1-32',
        subtitleEn: 'Aleph, Bet, Gimel, Dalet',
      },
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:33–64 (ה–ח)',
        labelHe: 'קי״ט: ה׳–ח׳',
        sefariaRef: 'Psalms 119:33-64',
        subtitleEn: 'Hei, Vav, Zayin, Chet',
      },
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:65–96 (ט–ל)',
        labelHe: 'קי״ט: ט׳–ל׳',
        sefariaRef: 'Psalms 119:65-96',
        subtitleEn: 'Tet, Yud, Kaf, Lamed',
      },
    ],
  },
  26: {
    startCh: 119,
    endCh: 119,
    rangeLabelEn: 'Chapter 119:97–176 (מ–ת)',
    rangeLabelHe: 'פרק קי״ט (אותיות מ׳–ת׳)',
    primarySefariaRef: 'Psalms 119:97-176',
    featuredPasukHe: 'נֵר־לְרַגְלִי דְבָרֶךָ וְאוֹר לִנְתִיבָתִי׃',
    featuredPasukEn:
      'Your word is a lamp unto my feet, and a light unto my path.',
    featuredPasukRef: 'Psalms 119:105',
    themeSummary:
      'Part II of Chapter 119 (Mem through Tav): Torah as a lamp for every step and abundant peace for those who love it.',
    customChapters: [
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:97–128 (מ–ע)',
        labelHe: 'קי״ט: מ׳–ע׳',
        sefariaRef: 'Psalms 119:97-128',
        subtitleEn: 'Mem, Nun, Samech, Ayin',
      },
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:129–152 (פ–ר)',
        labelHe: 'קי״ט: פ׳–ר׳',
        sefariaRef: 'Psalms 119:129-152',
        subtitleEn: 'Pei, Tzadi, Kuf, Reish',
      },
      {
        chapterNum: 119,
        labelEn: 'Ch. 119:153–176 (ש–ת)',
        labelHe: 'קי״ט: ש׳–ת׳',
        sefariaRef: 'Psalms 119:153-176',
        subtitleEn: 'Shin, Tav',
      },
    ],
  },
  27: {
    startCh: 120,
    endCh: 134,
    rangeLabelEn: 'Chapters 120–134 (Shirei HaMa’alot)',
    rangeLabelHe: 'פרקים ק״כ–קל״ד (שירי המעלות)',
    primarySefariaRef: 'Psalms 121',
    featuredPasukHe:
      'שִׁיר לַמַּעֲלוֹת אֶשָּׂא עֵינַי אֶל־הֶהָרִים מֵאַיִן יָבֹא עֶזְרִי׃ עֶזְרִי מֵעִם ה׳ עֹשֵׂה שָׁמַיִם וָאָרֶץ׃',
    featuredPasukEn:
      'A Song of Ascents: I lift my eyes to the mountains—from where will my help come? My help comes from Hashem, Maker of heaven and earth.',
    featuredPasukRef: 'Psalms 121:1-2',
    themeSummary:
      'The fifteen Songs of Ascents (Shirei HaMa’alot) sung by the Levites on the fifteen steps of the Beit HaMikdash.',
  },
  28: {
    startCh: 135,
    endCh: 139,
    rangeLabelEn: 'Chapters 135–139',
    rangeLabelHe: 'פרקים קל״ה–קל״ט',
    primarySefariaRef: 'Psalms 136',
    featuredPasukHe:
      'אִם־אֶשְׁכָּחֵךְ יְרוּשָׁלָ͏ִם תִּשְׁכַּח יְמִינִי׃ תִּדְבַּק־לְשׁוֹנִי לְחִכִּי אִם־לֹא אֶזְכְּרֵכִי אִם־לֹא אַעֲלֶה אֶת־יְרוּשָׁלַ͏ִם עַל רֹאשׁ שִׂמְחָתִי׃',
    featuredPasukEn:
      'If I forget you, O Jerusalem, let my right hand forget its skill... if I do not elevate Jerusalem above my highest joy.',
    featuredPasukRef: 'Psalms 137:5-6',
    themeSummary:
      'Hallel HaGadol (Ch. 136), eternal devotion to Jerusalem, and God’s all-encompassing knowledge of every human thought (Ch. 139).',
  },
  29: {
    startCh: 140,
    endCh: 144,
    rangeLabelEn: 'Chapters 140–144',
    rangeLabelHe: 'פרקים ק״מ–קמ״ד',
    primarySefariaRef: 'Psalms 143',
    featuredPasukHe:
      'הַשְׁמִיעֵנִי בַבֹּקֶר חַסְדֶּךָ כִּי־בְךָ בָטָחְתִּי הוֹדִיעֵנִי דֶּרֶךְ־זוּ אֵלֵךְ כִּי־אֵלֶיךָ נָשָׂאתִי נַפְשִׁי׃',
    featuredPasukEn:
      'Let me hear Your kindness in the morning, for in You I trust; make known to me the path I should walk, for to You I lift my soul.',
    featuredPasukRef: 'Psalms 143:8',
    themeSummary:
      'Prayers offered like evening incense (Ketoret) and seeking Divine guidance at the break of dawn.',
  },
  30: {
    startCh: 145,
    endCh: 150,
    rangeLabelEn: 'Chapters 145–150 (Pesukei D’Zimra Finale)',
    rangeLabelHe: 'פרקים קמ״ה–ק״נ',
    primarySefariaRef: 'Psalms 145',
    featuredPasukHe: 'פּוֹתֵחַ אֶת־יָדֶךָ וּמַשְׂבִּיעַ לְכָל־חַי רָצוֹן׃',
    featuredPasukEn:
      'You open Your hand and satisfy the desire of every living thing.',
    featuredPasukRef: 'Psalms 145:16',
    themeSummary:
      'Completing the entire Book of Tehillim with Ashrei (Ch. 145) and the five Halleluyah hymns culminating in "Kol HaNeshamah Tehallel Kah."',
  },
};

function getSeferInfoForDay(dayNum: number): {
  seferNum: 1 | 2 | 3 | 4 | 5;
  seferTitleEn: string;
  seferTitleHe: string;
} {
  if (dayNum <= 6) {
    return {
      seferNum: 1,
      seferTitleEn: 'Book I (Ch. 1–41 · Parallels Bereishit)',
      seferTitleHe: 'ספר ראשון (כנגד ספר בראשית)',
    };
  }
  if (dayNum <= 13) {
    return {
      seferNum: 2,
      seferTitleEn: 'Book II (Ch. 42–72 · Parallels Shemot)',
      seferTitleHe: 'ספר שני (כנגד ספר שמות)',
    };
  }
  if (dayNum <= 18) {
    return {
      seferNum: 3,
      seferTitleEn: 'Book III (Ch. 73–89 · Parallels Vayikra)',
      seferTitleHe: 'ספר שלישי (כנגד ספר ויקרא)',
    };
  }
  if (dayNum <= 21) {
    return {
      seferNum: 4,
      seferTitleEn: 'Book IV (Ch. 90–106 · Parallels Bamidbar)',
      seferTitleHe: 'ספר רביעי (כנגד ספר במדבר)',
    };
  }
  return {
    seferNum: 5,
    seferTitleEn: 'Book V (Ch. 107–150 · Parallels Devarim)',
    seferTitleHe: 'ספר חמישי (כנגד ספר דברים)',
  };
}

export function getDailyTehillimForDate(date: Date): DailyTehillimData {
  const hebStrings = getHebrewDateStrings(date);
  const parts = parseHebrewDateParts(date);
  const clampedDay = Math.max(1, Math.min(30, parts.dayNum || 1));

  // Check if today is the 29th of a 29-day (Chaser) Hebrew month; if tomorrow is Day 1 of the next month, combine Day 29 + Day 30
  let is29DayCombinedMonthEnd = false;
  if (clampedDay === 29) {
    const tomorrow = new Date(date.getTime() + 86400000);
    const tomorrowParts = parseHebrewDateParts(tomorrow);
    if (tomorrowParts.dayNum === 1) {
      is29DayCombinedMonthEnd = true;
    }
  }

  const spec = TEHILLIM_30_DAY_CYCLE[clampedDay] || TEHILLIM_30_DAY_CYCLE[1];
  const seferInfo = getSeferInfoForDay(clampedDay);

  let chapters: DailyTehillimChapterItem[] = [];
  if (spec.customChapters) {
    chapters = spec.customChapters;
  } else {
    const effectiveEndCh = is29DayCombinedMonthEnd ? 150 : spec.endCh;
    for (let ch = spec.startCh; ch <= effectiveEndCh; ch++) {
      const gem = numberToHebrewGematria(ch);
      chapters.push({
        chapterNum: ch,
        labelEn: `Chapter ${ch}`,
        labelHe: `פרק ${gem}`,
        sefariaRef: `Psalms ${ch}`,
      });
    }
  }

  const rangeLabelEn = is29DayCombinedMonthEnd
    ? 'Chapters 140–150 (Days 29 & 30 Combined)'
    : spec.rangeLabelEn;
  const rangeLabelHe = is29DayCombinedMonthEnd
    ? 'פרקים ק״מ–ק״נ (כ״ט–ל׳ מחוברים)'
    : spec.rangeLabelHe;

  return {
    hebrewDateDisplayHe: hebStrings.he,
    hebrewDateDisplayEn: hebStrings.en,
    hebrewDayNum: clampedDay,
    hebrewDayGematria: HEBREW_DAYS_GEMATRIA[clampedDay] || String(clampedDay),
    hebrewMonthEn: parts.monthEn,
    hebrewMonthHe: parts.monthHe,
    seferNum: seferInfo.seferNum,
    seferTitleEn: seferInfo.seferTitleEn,
    seferTitleHe: seferInfo.seferTitleHe,
    rangeLabelEn,
    rangeLabelHe,
    primarySefariaRef: spec.primarySefariaRef,
    is29DayCombinedMonthEnd,
    chapters,
    featuredPasukHe: spec.featuredPasukHe,
    featuredPasukEn: spec.featuredPasukEn,
    featuredPasukRef: spec.featuredPasukRef,
    themeSummary: spec.themeSummary,
  };
}
