import { parseHebrewDateParts } from '../services/halachaService';

export interface DailyThoughtEntry {
  id: string;
  lens: 'parsha' | 'mishnah' | 'date_gem';
  categoryLabel: string;
  titleEn: string;
  titleHe: string;
  quoteHe: string;
  quoteEn: string;
  sourceEn: string;
  sourceHe: string;
  reflection: string;
  sefariaRef: string;
}

/**
 * Local Data Object: Parsha-specific Inspirational Thoughts & Torah Insights
 */
export const PARSHA_THOUGHTS_MAP: Record<string, Omit<DailyThoughtEntry, 'id' | 'lens'>> = {
  bereshit: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Renewal of Creation Every Morning',
    titleHe: 'המחדש בטובו בכל יום תמיד',
    quoteHe: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    quoteEn: 'In the beginning God created the heavens and the earth.',
    sourceEn: 'Genesis 1:1 · Baal Shem Tov on Bereshit',
    sourceHe: 'בראשית א׳:א׳',
    reflection:
      'Creation is not a past historical event; every single moment is infused with fresh divine speech and purpose.',
    sefariaRef: 'Genesis 1:1-5',
  },
  noach: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Illuminating the Ark Through Words of Kindness',
    titleHe: 'צהר תעשה לתיבה',
    quoteHe: 'צֹהַר תַּעֲשֶׂה לַתֵּבָה וְאֶל־אַמָּה תְּכַלֶּנָּה מִלְמַעְלָה',
    quoteEn: 'Make a window of light (Tzohar) for the Tevah (Ark / Word).',
    sourceEn: 'Genesis 6:16 · Baal Shem Tov',
    sourceHe: 'בראשית ו׳:ט״ז',
    reflection:
      'In Hebrew, "Tevah" means both Ark and Word. Every word of prayer and speech we utter should shine like a luminous gemstone.',
    sefariaRef: 'Genesis 6:14-18',
  },
  'lech lecha': {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Journeying Toward Your Truest Self',
    titleHe: 'לך לך אל הארץ אשר אראך',
    quoteHe: 'וַיֹּאמֶר ה׳ אֶל־אַבְרָם לֶךְ־לְךָ מֵאַרְצְךָ וּמִמּוֹלַדְתְּךָ... אֶל־הָאָרֶץ אֲשֶׁר אַרְאֶךָּ',
    quoteEn: 'Go forth for yourself from your land and your birthplace to the land that I will show you.',
    sourceEn: 'Genesis 12:1 · Kli Yakar',
    sourceHe: 'בראשית י״ב:א׳',
    reflection:
      '“Lech Lecha” literally means “Go to yourself”—stepping beyond habitual comfort zones uncovers the highest potential of the soul.',
    sefariaRef: 'Genesis 12:1-5',
  },
  vayera: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Running to Do Chesed',
    titleHe: 'והוא יושב פתח האוהל כחום היום',
    quoteHe: 'וַיַּרְא וְהִנֵּה שְׁלֹשָׁה אֲנָשִׁים נִצָּבִים עָלָיו וַיַּרְא וַיָּרָץ לִקְרָאתָם מִפֶּתַח הָאֹהֶל',
    quoteEn: 'When he saw them, he ran to greet them from the entrance of the tent.',
    sourceEn: 'Genesis 18:2 · Talmud Shabbat 127a',
    sourceHe: 'בראשית י״ח:ב׳',
    reflection:
      'Welcoming guests and extending warmth to another person is so cherished that Abraham interrupted a direct divine revelation to serve wayfarers.',
    sefariaRef: 'Genesis 18:1-8',
  },
  'chayei sarah': {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Every Day Filled WithWholeness',
    titleHe: 'ואברהם זקן בא בימים',
    quoteHe: 'וְאַבְרָהָם זָקֵן בָּא בַּיָּמִים וַה׳ בֵּרַךְ אֶת־אַבְרָהָם בַּכֹּל',
    quoteEn: 'And Abraham was old, well advanced in days, and the Lord had blessed Abraham in all things.',
    sourceEn: 'Genesis 24:1 · Zohar Chayei Sarah',
    sourceHe: 'בראשית כ״ד:א׳',
    reflection:
      'To “enter into one’s days” (Ba BaYamim) means treating each single day as a complete garment of Torah, Tefillah, and Chesed.',
    sefariaRef: 'Genesis 24:1-9',
  },
  toldot: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Uncovering the Living Wells Within',
    titleHe: 'ויחפור יצחק את בארות המים',
    quoteHe: 'וַיָּשָׁב יִצְחָק וַיַּחְפֹּר אֶת־בְּאֵרֹת הַמַּיִם אֲשֶׁר חָפְרוּ בִּימֵי אַבְרָהָם אָבִיו',
    quoteEn: 'And Isaac dug anew the wells of water which had been dug in the days of his father Abraham.',
    sourceEn: 'Genesis 26:18 · Sefat Emet',
    sourceHe: 'בראשית כ״ו:י״ח',
    reflection:
      'Spiritual work is often not about inventing something foreign, but clearing away the surface dust to reveal the living waters already within.',
    sefariaRef: 'Genesis 26:18-22',
  },
  vayetzei: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Standing on Earth, Reaching the Heavens',
    titleHe: 'סולם מוצב ארצה וראשו מגיע השמימה',
    quoteHe: 'וְהִנֵּה סֻלָּם מֻצָּב אַרְצָה וְרֹאשׁוֹ מַגִּיעַ הַשָּׁמָיְמָה',
    quoteEn: 'Behold, a ladder was set on the ground and its top reached to the heavens.',
    sourceEn: 'Genesis 28:12 · Likutei Torah',
    sourceHe: 'בראשית כ״ח:י״ב',
    reflection:
      'Prayer (Sulam) connects our everyday physical responsibilities on earth directly to the highest spiritual realms.',
    sefariaRef: 'Genesis 28:10-17',
  },
  vayishlach: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Wrestling Until the Dawn Breaks',
    titleHe: 'לא אשלחך כי אם ברכתני',
    quoteHe: 'וַיֹּאמֶר לֹא אֲשַׁלֵּחֲךָ כִּי אִם־בֵּרַכְתָּנִי',
    quoteEn: 'And he said: I will not let you go unless you bless me.',
    sourceEn: 'Genesis 32:27 · Chassidic Masters',
    sourceHe: 'בראשית ל״ב:כ״ז',
    reflection:
      'Every challenge carries a hidden blessing inside it; perseverance through the night reveals that blessing at dawn.',
    sefariaRef: 'Genesis 32:25-30',
  },
  vayeshev: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'Divine Providence in Every Step',
    titleHe: 'ויהי ה׳ את יוסף ויהי איש מצליח',
    quoteHe: 'וַיְהִי ה׳ אֶת־יוֹסֵף וַיְהִי אִישׁ מַצְלִיחַ',
    quoteEn: 'The Lord was with Joseph, and he was a successful man.',
    sourceEn: 'Genesis 39:2 · Midrash Tanchuma',
    sourceHe: 'בראשית ל״ט:ב׳',
    reflection:
      'Because the name of Heaven was constantly on Joseph’s lips even in adversity, everything his hands touched became a vessel for blessing.',
    sefariaRef: 'Genesis 39:1-6',
  },
  miketz: {
    categoryLabel: 'Parsha Insight',
    titleEn: 'From the Dungeon to Light in a Single Moment',
    titleHe: 'ויריצוהו מן הבור',
    quoteHe: 'וַיִּשְׁלַח פַּרְעֹה וַיִּקְרָא אֶת־יוֹסֵף וַיְרִיצֻהוּ מִן־הַבּוֹר',
    quoteEn: 'Pharaoh sent and called Joseph, and they hurried him out of the pit.',
    sourceEn: 'Genesis 41:14 · Talmud Berakhot',
    sourceHe: 'בראשית מ״א:י״ד',
    reflection:
      'Salvation does not require slow bureaucratic steps; in the blink of an eye, darkness can be transformed into leadership and light.',
    sefariaRef: 'Genesis 41:14-16',
  },
};

/**
 * Local Data Object: Curated Mishnah & Pirkei Avot Snippets (Indexed across the month)
 */
export const MISHNAH_SNIPPETS: Omit<DailyThoughtEntry, 'id' | 'lens'>[] = [
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'The Three Pillars of the World',
    titleHe: 'על שלושה דברים העולם עומד',
    quoteHe: 'עַל שְׁלֹשָׁה דְבָרִים הָעוֹלָם עוֹמֵד, עַל הַתּוֹרָה וְעַל הָעֲבוֹדָה וְעַל גְּמִילוּת חֲסָדִים.',
    quoteEn: 'The world stands upon three things: upon Torah study, upon prayer (Avodah), and upon acts of lovingkindness.',
    sourceEn: 'Mishnah Pirkei Avot 1:2 · Shimon HaTzaddik',
    sourceHe: 'משנה אבות א׳:ב׳',
    reflection:
      'Balance your schedule today so that study, heartfelt Tefillah, and a tangible act of kindness for another person all have a place.',
    sefariaRef: 'Pirkei Avot 1:2',
  },
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'If Not Now, When?',
    titleHe: 'אם אין אני לי מי לי, ואם לא עכשיו אימתי',
    quoteHe: 'הוּא הָיָה אוֹמֵר, אִם אֵין אֲנִי לִי, מִי לִי. וּכְשֶׁאֲנִי לְעַצְמִי, מָה אֲנִי. וְאִם לֹא עַכְשָׁיו, אֵימָתָי.',
    quoteEn: 'If I am not for myself, who will be for me? Look if I care only for myself, what am I? And if not now, when?',
    sourceEn: 'Mishnah Pirkei Avot 1:14 · Hillel the Elder',
    sourceHe: 'משנה אבות א׳:י״ד',
    reflection:
      'Every day has its own unique mitzvot and Zmanim that belong specifically to this hour—do not defer today’s light to tomorrow.',
    sefariaRef: 'Pirkei Avot 1:14',
  },
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'Receiving Every Person With a Cheerful Countenance',
    titleHe: 'והוי מקבל את כל האדם בסבר פנים יפות',
    quoteHe: 'שַׁמַּאי אוֹמֵר, עֲשֵׂה תוֹרָתְךָ קֶבַע, אֱמֹר מְעַט וַעֲשֵׂה הַרְבֵּה, וֶהֱוֵי מְקַבֵּל אֶת כָּל הָאָדָם בְּסֵבֶר פָּנִים יָפוֹת.',
    quoteEn: 'Make your Torah study a fixed habit; say little and do much; and receive every person with a cheerful countenance.',
    sourceEn: 'Mishnah Pirkei Avot 1:15 · Shammai',
    sourceHe: 'משנה אבות א׳:ט״ו',
    reflection:
      'Fixed daily anchors (Keviut) in Torah give stability to the mind, while a warm smile gives life to everyone you encounter.',
    sefariaRef: 'Pirkei Avot 1:15',
  },
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'Who Is Wise, Strong, and Wealthy?',
    titleHe: 'איזהו חכם? הלומד מכל אדם',
    quoteHe: 'בֶּן זוֹמָא אוֹמֵר, אֵיזֶהוּ חָכָם, הַלּוֹמֵד מִכָּל אָדָם... אֵיזֶהוּ עָשִׁיר, הַשָּׂמֵחַ בְּחֶלְקוֹ.',
    quoteEn: 'Who is wise? One who learns from every person... Who is wealthy? One who rejoices in his portion.',
    sourceEn: 'Mishnah Pirkei Avot 4:1 · Ben Zoma',
    sourceHe: 'משנה אבות ד׳:א׳',
    reflection:
      'Gratitude transforms ordinary possessions into abundance, and humility turns every conversation into a classroom.',
    sefariaRef: 'Pirkei Avot 4:1',
  },
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'You Are Not Obligated to Finish the Work, Nor Free to Desist',
    titleHe: 'לא עליך המלאכה לגמור',
    quoteHe: 'לֹא עָלֶיךָ הַמְּלָאכָה לִגְמֹר, וְלֹא אַתָּה בֶן חוֹרִין לִבָּטֵל מִמֶּנָּה.',
    quoteEn: 'It is not upon you to finish the work, yet neither are you free to desist from it.',
    sourceEn: 'Mishnah Pirkei Avot 2:16 · Rabbi Tarfon',
    sourceHe: 'משנה אבות ב׳:ט״ז',
    reflection:
      'Even a single verse or five focused minutes of study has infinite value when done consistently.',
    sefariaRef: 'Pirkei Avot 2:16',
  },
  {
    categoryLabel: 'Mishnah Berakhot',
    titleEn: 'Directing the Heart in Prayer',
    titleHe: 'אחד המרבה ואחד הממעיט ובלבד שיכוון לבו לשמים',
    quoteHe: 'אֶחָד הַמַּרְבֶּה וְאֶחָד הַמַּמְעִיט, וּבִלְבַד שֶׁיְּכַוֵּן לִבּוֹ לַשָּׁמַיִם.',
    quoteEn: 'Whether one does much or little, all that matters is that one directs their heart toward Heaven.',
    sourceEn: 'Mishnah Menachot 13:11',
    sourceHe: 'משנה מנחות י״ג:י״א',
    reflection:
      'Quality of intention (Kavanah) elevates even the shortest blessing into a profound connection.',
    sefariaRef: 'Mishnah Menachot 13:11',
  },
  {
    categoryLabel: 'Pirkei Avot · Mishnah',
    titleEn: 'A Good Heart Includes All Virtues',
    titleHe: 'לב טוב — שבכלל דבריו דבריכם',
    quoteHe: 'אֵיזוֹהִי דֶרֶךְ יְשָׁרָה שֶׁיִּדְבַּק בָּהּ הָאָדָם? רַבִּי אֶלְעָזָר אוֹמֵר: לֵב טוֹב.',
    quoteEn: 'Which is the upright path to which a person should cleave? Rabbi Elazar said: A good heart.',
    sourceEn: 'Mishnah Pirkei Avot 2:9',
    sourceHe: 'משנה אבות ב׳:ט׳',
    reflection:
      'When the heart seeks the good of others, every action, word, and thought naturally aligns with holiness.',
    sefariaRef: 'Pirkei Avot 2:9',
  },
];

/**
 * Local Data Object: Daily Chassidic & Mussar Gems (Hayom Yom / Tanya / Tehillim)
 */
export const DATE_GEMS: Omit<DailyThoughtEntry, 'id' | 'lens'>[] = [
  {
    categoryLabel: 'Daily Chassidic Gem',
    titleEn: 'A Little Light Dispels Much Darkness',
    titleHe: 'מעט מן האור דוחה הרבה מן החושך',
    quoteHe: 'מְעַט מִן הָאוֹר דּוֹחֶה הַרְבֵּה מִן הַחֹשֶׁךְ.',
    quoteEn: 'A small amount of light pushes away a great deal of darkness.',
    sourceEn: 'Tanya, Likutei Amarim Ch. 12 · Bahya ibn Paquda',
    sourceHe: 'תניא פרק י״ב · חובות הלבבות',
    reflection:
      'Never fight darkness with a stick; simply ignite one additional candle of Torah and kindness.',
    sefariaRef: 'Tanya, Part I; Likutei Amarim 12',
  },
  {
    categoryLabel: 'Daily Tehillim Gem',
    titleEn: 'Serve the Lord With Joy',
    titleHe: 'עבדו את ה׳ בשמחה',
    quoteHe: 'עִבְדוּ אֶת־ה׳ בְּשִׂמְחָה בֹּאוּ לְפָנָיו בִּרְנָנָה',
    quoteEn: 'Serve the Lord with gladness; come before His presence with joyful song.',
    sourceEn: 'Psalms 100:2 · Mizmor LeTodah',
    sourceHe: 'תהילים ק׳:ב׳',
    reflection:
      'Simcha (joy) breaks through all spiritual barriers and turns daily routine into song.',
    sefariaRef: 'Psalms 100:1-5',
  },
  {
    categoryLabel: 'Hayom Yom · Daily Apophthegm',
    titleEn: 'Living With the Times',
    titleHe: 'לחיות עם הזמן — פרשת השבוע',
    quoteHe: 'צָרִיךְ לִחְיוֹת עִם הַזְּמַן — עִם פָּרָשַׁת הַשָּׁבוּעַ שֶׁבְּכָל יוֹם.',
    quoteEn: 'One must “live with the times”—by viewing the events of each day through the lens of that day’s Torah portion.',
    sourceEn: 'Hayom Yom · Teachings of Baal HaTanya',
    sourceHe: 'היום יום',
    reflection:
      'Today’s Aliyah in Chumash contains a personal directive tailored specifically for the events you will encounter today.',
    sefariaRef: 'Psalms 119:105',
  },
  {
    categoryLabel: 'Daily Mussar Gem',
    titleEn: 'Where One’s Thoughts Are, There One Entirely Is',
    titleHe: 'במקום שמחשבתו של אדם שם הוא נמצא כולו',
    quoteHe: 'בְּמָקוֹם שֶׁמַּחֲשַׁבְתּוֹ שֶׁל אָדָם — שָׁם הוּא נִמְצָא כֻּלּוֹ.',
    quoteEn: 'Wherever a person’s thoughts are, there they are in their entirety.',
    sourceEn: 'Baal Shem Tov · Keter Shem Tov',
    sourceHe: 'כתר שם טוב · הבעש״ט',
    reflection:
      'By lifting your thoughts for a moment to words of Torah or trust in Hashem, you immediately place yourself in a sanctuary of peace.',
    sefariaRef: 'Psalms 23:1-6',
  },
  {
    categoryLabel: 'Daily Halachic Gem',
    titleEn: 'Sanctifying the Everyday',
    titleHe: 'בכל דרכיך דעהו והוא יישר אורחותיך',
    quoteHe: 'בְּכָל־דְּרָכֶיךָ דָעֵהוּ וְהוּא יְיַשֵּׁר אֹרְחֹתֶיךָ',
    quoteEn: 'In all your ways know Him, and He will make your paths straight.',
    sourceEn: 'Proverbs 3:6 · Shulchan Arukh Orach Chayim 231',
    sourceHe: 'משלי ג׳:ו׳',
    reflection:
      'Even ordinary work, meals, and rest become Torah when performed with the intention of having strength to do good.',
    sefariaRef: 'Proverbs 3:5-6',
  },
];

export function getDailyThoughtsForDateAndParsha(
  date: Date,
  parshaNameEn?: string
): {
  parshaThought: DailyThoughtEntry;
  mishnahThought: DailyThoughtEntry;
  dateGemThought: DailyThoughtEntry;
  hebrewDayNum: number;
  hebrewMonthHe: string;
} {
  const hebParts = parseHebrewDateParts(date);
  const cleanParshaKey = (parshaNameEn || 'Chayei Sarah')
    .toLowerCase()
    .replace(/^parashat\s+/i, '')
    .replace(/^parshat\s+/i, '')
    .trim();

  // 1. Parsha Thought (matches active Parsha or deterministic fallback)
  const matchedParsha =
    PARSHA_THOUGHTS_MAP[cleanParshaKey] ||
    Object.entries(PARSHA_THOUGHTS_MAP).find(([k]) =>
      cleanParshaKey.includes(k)
    )?.[1] ||
    PARSHA_THOUGHTS_MAP['chayei sarah'];

  // 2. Mishnah Snippet (deterministically indexed by Hebrew day + month so every day on the Mini Calendar shows a distinct Mishnah)
  const daySeed = hebParts.dayNum + date.getMonth() * 7 + date.getDate();
  const mishnahBase = MISHNAH_SNIPPETS[daySeed % MISHNAH_SNIPPETS.length];

  // 3. Date Gem (deterministically indexed by Hebrew day of month)
  const gemBase = DATE_GEMS[(hebParts.dayNum - 1) % DATE_GEMS.length];

  return {
    parshaThought: {
      ...matchedParsha,
      id: `pt-${cleanParshaKey}`,
      lens: 'parsha',
    },
    mishnahThought: {
      ...mishnahBase,
      id: `mt-${daySeed}`,
      lens: 'mishnah',
    },
    dateGemThought: {
      ...gemBase,
      id: `gt-${hebParts.dayNum}`,
      lens: 'date_gem',
    },
    hebrewDayNum: hebParts.dayNum,
    hebrewMonthHe: hebParts.monthHe,
  };
}
