import {
  ChayenuDailyPackage,
  ChayenuSectionItem,
  GeulahMoshiachEntry,
  RambamDailyData,
  SeferHamitzvotItem,
  ParshaData,
} from '../types/dashboard';
import { getHebrewDateStrings, parseHebrewDateParts } from '../services/halachaService';
import { getHaYomYomForDate } from './hayomYomData';

// 30-Day Curated Geulah & Moshiach Teachings (Chayenu Signature Section)
const GEULAH_CURRICULUM_CYCLE: {
  themeTitleEn: string;
  themeTitleHe: string;
  propheticQuoteHe: string;
  propheticQuoteEn: string;
  propheticSourceEn: string;
  propheticSourceHe: string;
  propheticSefariaRef: string;
  rambamHalachaHe: string;
  rambamHalachaEn: string;
  rambamSourceEn: string;
  rambamSourceHe: string;
  rambamSefariaRef: string;
  sichotDvarTorah: string;
  dailyMeditation: string;
}[] = [
  {
    themeTitleEn: 'The Universal Knowledge of the Divine',
    themeTitleHe: 'ומלאה הארץ דעה את ה׳ כמים לים מכסים',
    propheticQuoteHe: 'לֹא־יָרֵעוּ וְלֹא־יַשְׁחִיתוּ בְּכָל־הַר קָדְשִׁי כִּי־מָלְאָה הָאָרֶץ דֵּעָה אֶת־ה׳ כַּמַּיִם לַיָּם מְכַסִּים',
    propheticQuoteEn:
      'They shall not hurt nor destroy in all My holy mountain, for the earth shall be full of the knowledge of the Lord, as the waters cover the sea.',
    propheticSourceEn: 'Isaiah 11:9',
    propheticSourceHe: 'ישעיהו י״א:ט׳',
    propheticSefariaRef: 'Isaiah 11:1-10',
    rambamHalachaHe:
      'וּבְאוֹתוֹ הַזְּמַן לֹא יִהְיֶה שָׁם לֹא רָעָב וְלֹא מִלְחָמָה וְלֹא קִנְאָה וְתַחֲרוּת... וְלֹא יִהְיֶה עֵסֶק כָּל הָעוֹלָם כֻּלּוֹ אֶלָּא לָדַעַת אֶת ה׳ בִּלְבַד',
    rambamHalachaEn:
      'In that era, there will be neither famine nor war, neither jealousy nor competition... The single occupation of the entire world will be solely to know God.',
    rambamSourceEn: 'Mishneh Torah, Kings and Wars 12:5',
    rambamSourceHe: 'הלכות מלכים פרק י״ב:ה׳',
    rambamSefariaRef: 'Mishneh Torah, Kings and Wars 12',
    sichotDvarTorah:
      'The Lubavitcher Rebbe explains that just as fish live surrounded by water and perceive water as their very life source, in the Messianic era all creation will perceive Divinity as the true source of vitality in every physical particle.',
    dailyMeditation:
      'Live today with the awareness that every mitzvah you perform reveals the hidden Godliness within the material world, bringing redemption one step closer.',
  },
  {
    themeTitleEn: 'The Third Temple: Built by Heaven and Earth',
    themeTitleHe: 'מקדש אדני כוננו ידיך',
    propheticQuoteHe: 'וְהָיָה בְּאַחֲרִית הַיָּמִים נָכוֹן יִהְיֶה הַר בֵּית־ה׳ בְּרֹאשׁ הֶהָרִים וְנִשָּׂא מִגְּבָעוֹת וְנָהֲרוּ אֵלָיו כָּל־הַגּוֹיִם',
    propheticQuoteEn:
      'And it shall come to pass in the end of days, that the mountain of the Lord’s house shall be established on the top of the mountains and exalted above the hills; and all nations shall flow unto it.',
    propheticSourceEn: 'Isaiah 2:2',
    propheticSourceHe: 'ישעיהו ב׳:ב׳',
    propheticSefariaRef: 'Isaiah 2:1-5',
    rambamHalachaHe:
      'הַמֶּלֶךְ הַמָּשִׁיחַ עָתִיד לַעֲמֹד וּלְהַחֲזִיר מַלְכוּת דָּוִד לְיָשְׁנָהּ לַמֶּמְשָׁלָה הָרִאשׁוֹנָה, וּבוֹנֶה הַמִּקְדָּשׁ וּמְקַבֵּץ נִדְחֵי יִשְׂרָאֵל',
    rambamHalachaEn:
      'The King Moshiach will arise and restore the dynasty of David to its original sovereignty, rebuild the Sanctuary, and gather the dispersed of Israel.',
    rambamSourceEn: 'Mishneh Torah, Kings and Wars 11:1',
    rambamSourceHe: 'הלכות מלכים פרק י״א:א׳',
    rambamSefariaRef: 'Mishneh Torah, Kings and Wars 11',
    sichotDvarTorah:
      'The Beit HaMikdash represents the complete union between physical human labor and divine revelation—a dwelling place below for the Infinite Divine Presence.',
    dailyMeditation:
      'Construct your own home and workplace as a sanctuary for prayer, study, and hospitality (Mikdash Me’at).',
  },
  {
    themeTitleEn: 'Swords into Plowshares: World Peace and Harmony',
    themeTitleHe: 'וכתתו חרבותם לאתים וחניתותיהם למזמרות',
    propheticQuoteHe: 'וְכִתְּתוּ חַרְבוֹתָם לְאִתִּים וַחֲנִיתוֹתֵיהֶם לְמַזְמֵרוֹת לֹא־יִשָּׂא גוֹי אֶל־גּוֹי חֶרֶב וְלֹא־יִלְמְדוּ עוֹד מִלְחָמָה',
    propheticQuoteEn:
      'They shall beat their swords into plowshares, and their spears into pruning hooks; nation shall not lift up sword against nation, neither shall they learn war anymore.',
    propheticSourceEn: 'Micah 4:3',
    propheticSourceHe: 'מיכה ד׳:ג׳',
    propheticSefariaRef: 'Micah 4:1-5',
    rambamHalachaHe:
      'אַל יַעֲלֶה עַל הַלֵּב שֶׁבִּימוֹת הַמָּשִׁיחַ יִבָּטֵל דָּבָר מִמִּנְהָגוֹ שֶׁל עוֹלָם... אֶלָּא הָעוֹלָם כְּמִנְהָגוֹ הוֹלֵךְ',
    rambamHalachaEn:
      'Let no one imagine that in the days of Moshiach anything of the natural order will be abolished; rather, the world will proceed along its natural course, elevated to ultimate righteousness.',
    rambamSourceEn: 'Mishneh Torah, Kings and Wars 12:1',
    rambamSourceHe: 'הלכות מלכים פרק י״ב:א׳',
    rambamSefariaRef: 'Mishneh Torah, Kings and Wars 12',
    sichotDvarTorah:
      'The Rebbe noted in 1992 that the worldwide dismantling of nuclear armaments and conversion of defense manufacturing to agricultural and civilian technologies is the tangible beginning of “swords into plowshares.”',
    dailyMeditation:
      'Resolve arguments through genuine empathy and peace. Shalom Bayit is the vessel that holds all blessings.',
  },
  {
    themeTitleEn: 'The Ingathering of the Exiles (Kibbutz Galuyot)',
    themeTitleHe: 'וקבץ נדחינו מארבע כנפות הארץ',
    propheticQuoteHe: 'וְהָיָה בַּיּוֹם הַהוּא יִתָּקַע בְּשׁוֹפָר גָּדוֹל וּבָאוּ הָאֹבְדִים בְּאֶרֶץ אַשּׁוּר וְהַנִּדָּחִים בְּאֶרֶץ מִצְרָיִם וְהִשְׁתַּחֲווּ לַה׳ בְּהַר הַקֹּדֶשׁ בִּירוּשָׁלָםִ',
    propheticQuoteEn:
      'And it shall come to pass on that day that a great shofar shall be blown; and they shall come who were lost in the land of Assyria and cast away in Egypt, and shall worship the Lord in the holy mount at Jerusalem.',
    propheticSourceEn: 'Isaiah 27:13',
    propheticSourceHe: 'ישעיהו כ״ז:י״ג',
    propheticSefariaRef: 'Isaiah 27:12-13',
    rambamHalachaHe:
      'וְכָל מִי שֶׁאֵינוֹ מַאֲמִין בּוֹ, אוֹ מִי שֶׁאֵינוֹ מְחַכֶּה לְבִיאָתוֹ, לֹא בִּשְׁאָר נְבִיאִים בִּלְבַד הוּא כּוֹפֵר, אֶלָּא בַּתּוֹרָה וּבְמֹשֶׁה רַבֵּנוּ',
    rambamHalachaEn:
      'Whoever does not believe in him or does not anticipate his arrival denies not only the prophets, but also the Torah and Moses our Teacher.',
    rambamSourceEn: 'Mishneh Torah, Kings and Wars 11:1',
    rambamSourceHe: 'הלכות מלכים פרק י״א:א׳',
    rambamSefariaRef: 'Mishneh Torah, Kings and Wars 11',
    sichotDvarTorah:
      'Every single Jewish soul, no matter how distant they may seem or feel, is precious and indispensable to the completeness of the Jewish people and the final redemption.',
    dailyMeditation:
      'Reach out with unconditional Ahavat Yisrael to bring another person closer to their Torah heritage.',
  },
  {
    themeTitleEn: 'Resurrection of the Dead (Techiyat HaMeitim)',
    themeTitleHe: 'הקיצו ורננו שוכני עפר',
    propheticQuoteHe: 'יִחְיוּ מֵתֶיךָ נְבֵלָתִי יְקוּמוּן הָקִיצוּ וְרַנְּנוּ שֹׁכְנֵי עָפָר כִּי טַל אוֹרֹת טַלֶּךָ וָאָרֶץ רְפָאִים תַּפִּיל',
    propheticQuoteEn:
      'Your dead shall live, my dead bodies shall arise. Awake and sing, you who dwell in the dust, for your dew is as the dew of light, and the earth shall cast out the dead.',
    propheticSourceEn: 'Isaiah 26:19',
    propheticSourceHe: 'ישעיהו כ״ו:י״ט',
    propheticSefariaRef: 'Isaiah 26:19-21',
    rambamHalachaHe:
      'תְּחִיַּת הַמֵּתִים הִיא יְסוֹד מִיסוֹדֵי תּוֹרַת מֹשֶׁה רַבֵּנוּ עָלָיו הַשָּׁלוֹם, וְאֵין דָּת וְלֹא דְּבֵקוּת בְּדַת יְהוּדִית לְמִי שֶׁלֹּא יַאֲמִין בָּזֶה',
    rambamHalachaEn:
      'The resurrection of the dead is a fundamental principle of the Torah of Moses our Teacher; one cannot be considered steadfast in the Jewish faith without believing in it.',
    rambamSourceEn: 'Rambam, Commentary on the Mishnah, Sanhedrin 10:1',
    rambamSourceHe: 'פירוש המשניות לרמב״ם סנהדרין י׳:א׳',
    rambamSefariaRef: 'Mishnah Sanhedrin 10:1',
    sichotDvarTorah:
      'The ultimate reward is not in the disembodied spiritual realm of souls, but in this physical world where body and soul are reunited to bask in the direct light of the Shechinah.',
    dailyMeditation:
      'Treat the physical body with holy care; it is the holy instrument through which Mitzvot are carried out in this earthly world.',
  },
];

// 30-Day Curated Rambam Mishneh Torah & Sefer HaMitzvot Schedules
const RAMBAM_SCHEDULE_CYCLE: {
  threeChaptersTitleEn: string;
  threeChaptersTitleHe: string;
  threeChaptersRef: string;
  threeChaptersSummary: string;
  oneChapterTitleEn: string;
  oneChapterTitleHe: string;
  oneChapterRef: string;
  oneChapterSummary: string;
  seferHamitzvotRef: string;
  seferHamitzvotSummary: string;
  items: SeferHamitzvotItem[];
}[] = [
  {
    threeChaptersTitleEn: 'Foundations of the Torah (Yesodei HaTorah) 1–3',
    threeChaptersTitleHe: 'הלכות יסודי התורה פרקים א׳–ג׳',
    threeChaptersRef: 'Mishneh Torah, Foundations of the Torah 1',
    threeChaptersSummary:
      'The foundational belief in the Prime Existence of God, His unity, incorporeality, love, awe, and the celestial spheres.',
    oneChapterTitleEn: 'Foundations of the Torah (Yesodei HaTorah) 1',
    oneChapterTitleHe: 'הלכות יסודי התורה פרק א׳',
    oneChapterRef: 'Mishneh Torah, Foundations of the Torah 1',
    oneChapterSummary:
      'The fundamental pillar of wisdom: knowing that there is a Prime Being who brought everything in existence into reality.',
    seferHamitzvotRef: 'Sefer HaMitzvot, Positive Commandments 1-2',
    seferHamitzvotSummary:
      'Mitzvat Aseh 1 & 2: Knowing the existence of Hashem and His singular Unity.',
    items: [
      {
        id: 'aseh-1',
        type: 'aseh',
        mitzvahNum: 1,
        labelEn: 'To Know Hashem Exists',
        labelHe: 'מצות עשה א׳: לידע שיש שם אלוה',
        summary: 'To know with certainty that the Blessed Creator oversees and sustains all created things.',
        biblicalSource: 'Exodus 20:2 — "I am the Lord your God"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 1',
      },
      {
        id: 'aseh-2',
        type: 'aseh',
        mitzvahNum: 2,
        labelEn: 'The Unity of God (Yichud Hashem)',
        labelHe: 'מצות עשה ב׳: אחדות ה׳',
        summary: 'To believe that this Creator is One, absolute and unique without any multiplicity.',
        biblicalSource: 'Deuteronomy 6:4 — "Hear O Israel, the Lord is our God, the Lord is One"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 2',
      },
      {
        id: 'lo-taaseh-1',
        type: 'lo_taaseh',
        mitzvahNum: 1,
        labelEn: 'Prohibition of Believing in Other Deities',
        labelHe: 'מצות לא תעשה א׳: שלא להאמין באלוה זולתו',
        summary: 'Not to believe or entertain that there is any sovereign power other than Hashem.',
        biblicalSource: 'Exodus 20:3 — "You shall have no other gods before Me"',
        sefariaRef: 'Sefer HaMitzvot, Negative Commandments 1',
      },
    ],
  },
  {
    threeChaptersTitleEn: 'Foundations of the Torah 4–6',
    threeChaptersTitleHe: 'הלכות יסודי התורה פרקים ד׳–ו׳',
    threeChaptersRef: 'Mishneh Torah, Foundations of the Torah 4',
    threeChaptersSummary:
      'The four earthly elements (Fire, Air, Water, Earth), prophecy validation, and the sacred prohibition against destroying holy names.',
    oneChapterTitleEn: 'Foundations of the Torah 2',
    oneChapterTitleHe: 'הלכות יסודי התורה פרק ב׳',
    oneChapterRef: 'Mishneh Torah, Foundations of the Torah 2',
    oneChapterSummary:
      'Attaining genuine love and awe of God by contemplating His vast, wondrous cosmos and creations.',
    seferHamitzvotRef: 'Sefer HaMitzvot, Positive Commandments 3-4',
    seferHamitzvotSummary:
      'Mitzvat Aseh 3 & 4: To love Hashem and to revere Him through awe and devotion.',
    items: [
      {
        id: 'aseh-3',
        type: 'aseh',
        mitzvahNum: 3,
        labelEn: 'Love of God (Ahavat Hashem)',
        labelHe: 'מצות עשה ג׳: אהבת ה׳',
        summary: 'To cultivate a deep, ardent love of the Creator through reflecting on His Torah and works.',
        biblicalSource: 'Deuteronomy 6:5 — "You shall love the Lord your God with all your heart"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 3',
      },
      {
        id: 'aseh-4',
        type: 'aseh',
        mitzvahNum: 4,
        labelEn: 'Awe and Fear of God (Yirat Hashem)',
        labelHe: 'מצות עשה ד׳: יראת ה׳',
        summary: 'To maintain an attitude of reverent awe before the Infinite Sovereign.',
        biblicalSource: 'Deuteronomy 6:13 — "You shall revere the Lord your God"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 4',
      },
    ],
  },
  {
    threeChaptersTitleEn: 'Moral Dispositions (Hilchot De’ot) 1–3',
    threeChaptersTitleHe: 'הלכות דעות פרקים א׳–ג׳',
    threeChaptersRef: 'Mishneh Torah, Human Dispositions 1',
    threeChaptersSummary:
      'The Golden Mean (Shvil HaZahav) in human temperament, avoiding anger and haughtiness, and using physical bodily health for divine service.',
    oneChapterTitleEn: 'Foundations of the Torah 3',
    oneChapterTitleHe: 'הלכות יסודי התורה פרק ג׳',
    oneChapterRef: 'Mishneh Torah, Foundations of the Torah 3',
    oneChapterSummary:
      'The celestial spheres, the stars, planetary orbits, and the majesty of creation.',
    seferHamitzvotRef: 'Sefer HaMitzvot, Positive Commandments 5-6',
    seferHamitzvotSummary:
      'Mitzvat Aseh 5 & 6: Daily prayer (Tefillah) and cleaving to Torah scholars (Dibuk Chaverim).',
    items: [
      {
        id: 'aseh-5',
        type: 'aseh',
        mitzvahNum: 5,
        labelEn: 'Service of the Heart (Prayer / Tefillah)',
        labelHe: 'מצות עשה ה׳: עבודת הלב בתפילה',
        summary: 'To serve God with prayer every day, expressing thanksgiving and yearning for divine assistance.',
        biblicalSource: 'Exodus 23:25 — "And you shall serve the Lord your God"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 5',
      },
      {
        id: 'aseh-6',
        type: 'aseh',
        mitzvahNum: 6,
        labelEn: 'Cleaving to Scholars and Sages',
        labelHe: 'מצות עשה ו׳: להידבק בחכמים ובתלמידיהם',
        summary: 'To associate with Torah scholars, learn from their virtuous ways, and support their learning.',
        biblicalSource: 'Deuteronomy 10:20 — "And to Him shall you cleave"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 6',
      },
    ],
  },
  {
    threeChaptersTitleEn: 'Laws of Torah Study (Talmud Torah) 1–3',
    threeChaptersTitleHe: 'הלכות תלמוד תורה פרקים א׳–ג׳',
    threeChaptersRef: 'Mishneh Torah, Torah Study 1',
    threeChaptersSummary:
      'The obligation of every Jewish person to study Torah day and night, the curriculum division (Mikra, Mishnah, Gemara/Halacha), and the primacy of Torah over all mitzvot.',
    oneChapterTitleEn: 'Foundations of the Torah 4',
    oneChapterTitleHe: 'הלכות יסודי התורה פרק ד׳',
    oneChapterRef: 'Mishneh Torah, Foundations of the Torah 4',
    oneChapterSummary:
      'The nature of form and matter, the physical elements, and the human soul given by God.',
    seferHamitzvotRef: 'Sefer HaMitzvot, Positive Commandments 11-12',
    seferHamitzvotSummary:
      'Mitzvat Aseh 11: Studying and teaching Torah to one’s children and students.',
    items: [
      {
        id: 'aseh-11',
        type: 'aseh',
        mitzvahNum: 11,
        labelEn: 'Study and Teach Torah',
        labelHe: 'מצות עשה י״א: לימוד תורה ולמדה',
        summary: 'To study Torah constantly and teach it diligently to one’s children and community.',
        biblicalSource: 'Deuteronomy 6:7 — "And you shall teach them diligently to your children"',
        sefariaRef: 'Sefer HaMitzvot, Positive Commandments 11',
      },
    ],
  },
];

// Curated Chayenu Daily Halachah Lessons (Kitzur Shulchan Aruch / Shulchan Aruch HaRav)
const DAILY_HALACHAH_SNIPPETS = [
  {
    titleEn: 'Awakening with Gratitude (Modeh Ani & Netilat Yadayim)',
    titleHe: 'השכמת הבוקר ונטילת ידיים',
    topic: 'Morning Blessings',
    ruleEn:
      'Immediately upon opening one’s eyes, say Modeh Ani without pronouncing holy names. Wash each hand alternately three times from a vessel (Netilat Yadayim) to welcome the renewed soul with holiness and purity.',
    sourceEn: 'Kitzur Shulchan Aruch 1:1–2 · Shulchan Aruch HaRav 1',
    sefariaRef: 'Kitzur Shulchan Aruch 1',
  },
  {
    titleEn: 'Kavanah in the Shema and Morning Prayer',
    titleHe: 'כוונת הלב בקריאת שמע ותפילה',
    topic: 'Tefillah',
    ruleEn:
      'When reciting the first verse of Shema, cover your eyes with your right hand and concentrate intently on accepting the absolute Sovereignty of Heaven and the unity of God in all six directions of the universe.',
    sourceEn: 'Kitzur Shulchan Aruch 17:1 · Shulchan Aruch Orach Chaim 61',
    sefariaRef: 'Kitzur Shulchan Aruch 17',
  },
  {
    titleEn: 'Honoring and Preparing for Shabbat Kodesh',
    titleHe: 'כבוד שבת והכנות לשבת קודש',
    topic: 'Shabbat',
    ruleEn:
      'It is a special mitzvah to actively prepare for Shabbat with one’s own hands, tasting the Shabbat dishes beforehand, bathing, dressing in fine garments, and welcoming the holy day with radiant joy.',
    sourceEn: 'Kitzur Shulchan Aruch 72:1–4 · Shulchan Aruch HaRav 250',
    sefariaRef: 'Kitzur Shulchan Aruch 72',
  },
  {
    titleEn: 'The Power of Brachot: Transforming Food into Light',
    titleHe: 'ברכות הנהנין וקדושת האכילה',
    topic: 'Blessings',
    ruleEn:
      'Reciting a blessing with focus before eating elevates the physical nourishment into spiritual energy used for holy deeds, thanking Hashem for sustaining all life with grace and compassion.',
    sourceEn: 'Kitzur Shulchan Aruch 49:1 · Shulchan Aruch Orach Chaim 202',
    sefariaRef: 'Kitzur Shulchan Aruch 49',
  },
  {
    titleEn: 'Integrity in Business and the Workplace',
    titleHe: 'משא ומתן באמונה וביושר',
    topic: 'Choshen Mishpat',
    ruleEn:
      'The first question a person is asked in the Heavenly Court after 120 years is: "Did you conduct your business dealings with faith, honesty, and integrity?" Every commercial transaction must reflect righteousness.',
    sourceEn: 'Talmud Shabbat 31a · Kitzur Shulchan Aruch 62:1',
    sefariaRef: 'Kitzur Shulchan Aruch 62',
  },
  {
    titleEn: 'Guarding One’s Tongue (Shemirat HaLashon)',
    titleHe: 'זהירות בלשון הרע ואהבת ישראל',
    topic: 'Interpersonal Mitzvot',
    ruleEn:
      'Words possess immense spiritual creative power. Guarding speech from gossip, negativity, and falsehood preserves peace in families and invites divine blessings into one’s life.',
    sourceEn: 'Chofetz Chaim, Introduction · Kitzur Shulchan Aruch 30',
    sefariaRef: 'Chofetz Chaim, Positive Commandments 1',
  },
];

// Curated Living with the Times (Oneness in the Parsha) Essays
const LIVING_WITH_THE_TIMES_MAP: Record<
  string,
  {
    titleEn: string;
    titleHe: string;
    coreIdea: string;
    chassidicInsight: string;
    application: string;
    sefariaRef: string;
  }
> = {
  bereshit: {
    titleEn: 'The Universe Was Created For You to Elevate',
    titleHe: 'בשביל ישראל שנקראו ראשית',
    coreIdea: 'Creation is purposefully imperfect so that human beings can become active partners in its completion.',
    chassidicInsight:
      'The Alter Rebbe teaches that physical matter was created with high spiritual sparks locked inside it; every time we utilize a physical object for a mitzvah, that spark returns to its divine source.',
    application: 'Before you interact with any material thing today, remember that its ultimate destiny is to be sanctified.',
    sefariaRef: 'Genesis 1:1-5',
  },
  noach: {
    titleEn: 'Entering the Ark: Words of Prayer as Sanctuary',
    titleHe: 'בוא אל התיבה — אותיות התורה והתפילה',
    coreIdea: 'When the floods of worldly stress and anxiety threaten to overwhelm you, enter into the holy words of Torah and Tefillah.',
    chassidicInsight:
      'The Baal Shem Tov interprets "Bo El HaTevah" as entering into the letters and words (Tevot) of the Shema, Amida, and Psalms until the light inside transforms fear into serenity.',
    application: 'When stressed, take two minutes to slowly pronounce three verses of Psalms with deep focus.',
    sefariaRef: 'Genesis 6:14-22',
  },
  'lech lecha': {
    titleEn: 'Lech Lecha: Journeying Beyond the Ego',
    titleHe: 'לך לך מארצך — התעלות מעל הרגיל',
    coreIdea: 'Every person must embark on a personal journey away from habit and inertia toward their soul’s highest mission.',
    chassidicInsight:
      '“Lech Lecha” means going to your authentic divine essence, which is inherently connected to the Infinite.',
    application: 'Take one bold, positive step outside of your comfort zone today to assist someone in need.',
    sefariaRef: 'Genesis 12:1-9',
  },
  vayera: {
    titleEn: 'Hospitality Greater than Receiving the Divine Presence',
    titleHe: 'גדולה הכנסת אורחים מהקבלת פני השכינה',
    coreIdea: 'Serving another human being with warmth and kindness is the highest expression of walking in God’s ways.',
    chassidicInsight:
      'Abraham ran in the scorching desert heat to serve travelers because seeing the divine image in another human is the true realization of God’s presence.',
    application: 'Greet every person you meet today with a radiant smile and generous warmth.',
    sefariaRef: 'Genesis 18:1-10',
  },
  'chayei sarah': {
    titleEn: 'Living with Every Single Day',
    titleHe: 'בא בימים — שכל ימיו היו שלמים',
    coreIdea: 'True spiritual accomplishment is not judged by fleeting flashes of inspiration, but by filling every single day with sacred purpose.',
    chassidicInsight:
      'Abraham was “well-advanced in days” (Ba BaYamim)—the Zohar explains that when Abraham ascended to Heaven, every day of his life arrived as a complete, luminous garment of good deeds.',
    application: 'Do not let a day slip by as routine; dedicate at least 15 minutes of uninterrupted Torah study today.',
    sefariaRef: 'Genesis 24:1-9',
  },
  toldot: {
    titleEn: 'The Eternal Struggle and the Power of Prayer',
    titleHe: 'ויתרוצצו הבנים בקרבה',
    coreIdea: 'The internal tug-of-war between the Yetzer HaTov (Godly Soul) and Yetzer HaRa (Animal Soul) is natural and purposeful.',
    chassidicInsight:
      'Tanya explains that the Beinoni (intermediate person) feels this struggle constantly throughout life; the victory lies in never letting negative impulses manifest in actual thought, speech, or deed.',
    application: 'Whenever you feel an urge to lose your temper or criticize, pause for three breaths and respond with gentleness.',
    sefariaRef: 'Genesis 25:19-26',
  },
};

/**
 * Returns the Chayenu daily study package containing all sections of the Chayenu publication
 */
export function getChayenuPackageForDate(
  date: Date,
  parsha?: ParshaData | null
): ChayenuDailyPackage {
  const dateStr = date.toISOString().slice(0, 10);
  const hebrewDates = getHebrewDateStrings(date);
  const { dayNum } = parseHebrewDateParts(date);

  const dayOfWeek = date.getDay(); // 0 = Sun ... 6 = Sat
  const dayNamesHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת קודש'];
  const aliyahNamesEn = [
    'First Aliyah (Kohen)',
    'Second Aliyah (Levi)',
    'Third Aliyah (Shlishi)',
    'Fourth Aliyah (Revi’i)',
    'Fifth Aliyah (Chamishi)',
    'Sixth Aliyah (Shishi)',
    'Seventh Aliyah & Haftarah (Shevi’i & Maftir)',
  ];

  const currentParsha = parsha?.nameEn ? parsha : null;
  const parshaKey = (currentParsha?.nameEn || 'chayei sarah')
    .toLowerCase()
    .replace('parashat', '')
    .trim();

  // 1. Chumash with Rashi section
  const aliyahIndex = Math.min(6, dayOfWeek);
  const aliyahItem = currentParsha?.aliyot?.[aliyahIndex];
  const chumashRef = aliyahItem?.ref || currentParsha?.fullRef || 'Genesis 23:1-24:9';

  // 2. HaYom Yom entry
  const hayomYomEntry = getHaYomYomForDate(date);

  // 3. Rambam schedule for the day
  const rambamCycle = RAMBAM_SCHEDULE_CYCLE[(dayNum - 1) % RAMBAM_SCHEDULE_CYCLE.length];

  // 4. Geulah & Moshiach entry
  const geulahEntry = GEULAH_CURRICULUM_CYCLE[(dayNum - 1) % GEULAH_CURRICULUM_CYCLE.length];

  // 5. Daily Halachah snippet
  const halachaSnippet = DAILY_HALACHAH_SNIPPETS[(dayNum - 1) % DAILY_HALACHAH_SNIPPETS.length];

  // 6. Living with the Times essay
  const livingEssay =
    LIVING_WITH_THE_TIMES_MAP[parshaKey] ||
    LIVING_WITH_THE_TIMES_MAP['chayei sarah'] || {
      titleEn: 'Living with the Weekly Torah Portion',
      titleHe: 'חיים עם הזמן',
      coreIdea: 'The weekly Parsha contains personal guidance for every dilemma we encounter today.',
      chassidicInsight:
        'The Alter Rebbe instructed to “live with the times”—meaning to live with the lessons of the daily Torah portion.',
      application: 'Dedicate time to read the daily Aliyah with Rashi and reflect on its message.',
      sefariaRef: chumashRef,
    };

  const sections: ChayenuSectionItem[] = [
    {
      id: 'chumash',
      badge: `Chitas · ${aliyahNamesEn[aliyahIndex].split(' ')[0]} Aliyah`,
      titleEn: `Chumash & Rashi · ${aliyahNamesEn[aliyahIndex]}`,
      titleHe: `חומש עם רש״י · עליה ${dayNamesHe[aliyahIndex]}`,
      subtitleEn: `${currentParsha?.nameEn || 'Parashat Hashavua'} (${chumashRef})`,
      subtitleHe: `${currentParsha?.nameHe || 'פרשת השבוע'}`,
      sefariaRef: chumashRef,
      quoteHe: 'וַיְהִי ה׳ אֶת־אַבְרָהָם בַּכֹּל',
      quoteEn: 'Daily Aliyah accompanied by the foundational commentary of Rashi with English translation.',
      summaryEn:
        aliyahItem
          ? `Study today's reading for ${aliyahItem.labelEn} (${aliyahItem.ref}) with classic Rashi elucidations.`
          : `Daily portion of the weekly Torah reading (${chumashRef}) with Rashi commentary.`,
      practicalAvodah: 'Review the verses with Shnayim Mikra V’Echad Targum / Rashi.',
    },
    {
      id: 'tehillim',
      badge: 'Chitas · Daily Psalms',
      titleEn: `Daily Tehillim · ${hayomYomEntry.tehillimRangeEn}`,
      titleHe: `תהילים יומי · ${hayomYomEntry.tehillimRangeHe}`,
      subtitleEn: `Monthly Cycle · Day ${dayNum} of Hebrew Month`,
      subtitleHe: `חלוקה חודשית · יום ${hebrewDates.he.split(' ')[0]}`,
      sefariaRef: hayomYomEntry.tehillimSefariaRef,
      quoteHe: 'הַשְׁלֵךְ עַל־ה׳ יְהָבְךָ וְהוּא יְכַלְכְּלֶךָ',
      quoteEn: 'Cast your burden upon the Lord, and He shall sustain you.',
      summaryEn: `Recite the daily chapters (${hayomYomEntry.tehillimRangeEn}) following the sacred division established by King David and the Chassidic Rebbes.`,
      practicalAvodah: 'Conclude with Psalm 20 and prayer for all those in need of healing and peace.',
    },
    {
      id: 'tanya',
      badge: 'Chitas · Daily Chassidut',
      titleEn: `Daily Tanya · ${hayomYomEntry.tanyaPortionEn}`,
      titleHe: `תניא יומי · ${hayomYomEntry.tanyaPortionHe}`,
      subtitleEn: 'Foundational Text of Chabad Chassidic Philosophy',
      subtitleHe: 'ספר של בינונים · אדמו״ר הזקן',
      sefariaRef: hayomYomEntry.tanyaSefariaRef,
      quoteHe: 'קָרוֹב אֵלֶיךָ הַדָּבָר מְאֹד בְּפִיךָ וּבִלְבָבְךָ לַעֲשׂתוֹ',
      quoteEn: 'For the thing is very close to you, in your mouth and in your heart, that you may do it.',
      summaryEn: `Annual study portion of Likutei Amarim Tanya (${hayomYomEntry.tanyaPortionEn}), illuminating how to master negative impulses and ignite the Divine soul.`,
      practicalAvodah: 'Remember that the mind has natural supremacy over emotional impulses.',
    },
    {
      id: 'rambam',
      badge: 'Maimonides Daily Code',
      titleEn: `Rambam (Mishneh Torah & Sefer HaMitzvot)`,
      titleHe: `רמב״ם · משנה תורה וספר המצוות`,
      subtitleEn: `${rambamCycle.threeChaptersTitleEn}`,
      subtitleHe: `${rambamCycle.threeChaptersTitleHe}`,
      sefariaRef: rambamCycle.threeChaptersRef,
      quoteHe: 'הַלּוֹמֵד תּוֹרָה כְּדֵי לַעֲשׂוֹת, מַסְפִּיקִין בְּיָדוֹ',
      quoteEn: 'Study encompasses the entire corpus of Halachot through the 3-chapter, 1-chapter, or Sefer HaMitzvot track.',
      summaryEn: `${rambamCycle.threeChaptersSummary} In Sefer HaMitzvot: ${rambamCycle.seferHamitzvotSummary}`,
      practicalAvodah: 'Review one halacha thoroughly until you can explain it clearly to a study partner.',
    },
    {
      id: 'hayom_yom',
      badge: 'Daily Chassidic Almanac',
      titleEn: `HaYom Yom · ${hayomYomEntry.titleEn}`,
      titleHe: `היום יום · ${hayomYomEntry.titleHe}`,
      subtitleEn: `From the Talks & Customs of the Lubavitcher Rebbe`,
      subtitleHe: `מפי כ״ק אדמו״ר מליובאוויטש`,
      sefariaRef: hayomYomEntry.tehillimSefariaRef,
      quoteHe: hayomYomEntry.aphorismHe,
      quoteEn: hayomYomEntry.aphorismEn,
      summaryEn: hayomYomEntry.aphorismEn,
      practicalAvodah: hayomYomEntry.practicalAvodah,
    },
    {
      id: 'geulah',
      badge: 'Chayenu Signature Feature',
      titleEn: `Geulah & Moshiach · ${geulahEntry.themeTitleEn}`,
      titleHe: `ענייני גאולה ומשיח · ${geulahEntry.themeTitleHe}`,
      subtitleEn: `${geulahEntry.propheticSourceEn} & ${geulahEntry.rambamSourceEn}`,
      subtitleHe: `${geulahEntry.propheticSourceHe}`,
      sefariaRef: geulahEntry.rambamSefariaRef,
      quoteHe: geulahEntry.propheticQuoteHe,
      quoteEn: geulahEntry.propheticQuoteEn,
      summaryEn: geulahEntry.sichotDvarTorah,
      practicalAvodah: geulahEntry.dailyMeditation,
    },
    {
      id: 'halacha',
      badge: 'Daily Practical Halachah',
      titleEn: `Daily Halachah · ${halachaSnippet.titleEn}`,
      titleHe: `הלכה יומית · ${halachaSnippet.titleHe}`,
      subtitleEn: `${halachaSnippet.sourceEn}`,
      subtitleHe: `${halachaSnippet.topic}`,
      sefariaRef: halachaSnippet.sefariaRef,
      quoteHe: 'הֲלָכָה לְמַעֲשֶׂה בְּכָל יוֹם',
      quoteEn: halachaSnippet.ruleEn,
      summaryEn: halachaSnippet.ruleEn,
      practicalAvodah: 'Implement this practical halachic enhancement today.',
    },
    {
      id: 'living_times',
      badge: 'Oneness in the Parsha',
      titleEn: `Living with the Times · ${livingEssay.titleEn}`,
      titleHe: `חיים עם הזמן · ${livingEssay.titleHe}`,
      subtitleEn: `Weekly Chassidic Insight into ${currentParsha?.nameEn || 'the Parsha'}`,
      subtitleHe: `עומק הפרשה לאור החסידות`,
      sefariaRef: livingEssay.sefariaRef,
      quoteHe: 'לִחְיוֹת עִם הַזְּמַן — עִם פָּרָשַׁת הַשָּׁבוּעַ',
      quoteEn: livingEssay.coreIdea,
      summaryEn: `${livingEssay.chassidicInsight} ${livingEssay.application}`,
      practicalAvodah: livingEssay.application,
    },
  ];

  if (currentParsha?.haftarahRef) {
    sections.push({
      id: 'haftarah',
      badge: 'Prophetic Reading',
      titleEn: `Haftarah · ${currentParsha.nameEn}`,
      titleHe: `הפטרת השבוע`,
      subtitleEn: currentParsha.haftarahRef,
      subtitleHe: currentParsha.haftarahRef,
      sefariaRef: currentParsha.haftarahRef,
      quoteHe: 'קוּמִי אוֹרִי כִּי בָא אוֹרֵךְ וּכְבוֹד ה׳ עָלַיִךְ זָרָח',
      quoteEn: 'Arise, shine, for your light has come, and the glory of the Lord is risen upon you.',
      summaryEn: `Prophetic reading corresponding to the weekly Torah portion (${currentParsha.haftarahRef}).`,
      practicalAvodah: 'Review the connection between the Parsha and the prophetic words of the Haftarah.',
    });
  }

  return {
    dateStr,
    hebrewDateEn: hebrewDates.en,
    hebrewDateHe: hebrewDates.he,
    parshaNameEn: currentParsha?.nameEn || 'Parashat Hashavua',
    parshaNameHe: currentParsha?.nameHe || 'פרשת השבוע',
    dayOfWeekHebrewName: dayNamesHe[dayOfWeek],
    aliyahLabelEn: aliyahNamesEn[aliyahIndex],
    sections,
    livingWithTimesEssay: {
      ...livingEssay,
      parshaEn: currentParsha?.nameEn || 'Weekly Torah Portion',
    },
    dailyHalachaSnippet: halachaSnippet,
  };
}

/**
 * Returns the dedicated Rambam study cycle dataset for the given date
 */
export function getRambamDailyForDate(
  date: Date,
  activeTrack: 'three_chapters' | 'one_chapter' | 'sefer_hamitzvot' = 'three_chapters'
): RambamDailyData {
  const hebrewDates = getHebrewDateStrings(date);
  const { dayNum } = parseHebrewDateParts(date);
  const cycle = RAMBAM_SCHEDULE_CYCLE[(dayNum - 1) % RAMBAM_SCHEDULE_CYCLE.length];

  return {
    hebrewDateEn: hebrewDates.en,
    hebrewDateHe: hebrewDates.he,
    activeTrack,
    threeChaptersTitleEn: cycle.threeChaptersTitleEn,
    threeChaptersTitleHe: cycle.threeChaptersTitleHe,
    threeChaptersRef: cycle.threeChaptersRef,
    threeChaptersSummary: cycle.threeChaptersSummary,
    oneChapterTitleEn: cycle.oneChapterTitleEn,
    oneChapterTitleHe: cycle.oneChapterTitleHe,
    oneChapterRef: cycle.oneChapterRef,
    oneChapterSummary: cycle.oneChapterSummary,
    seferHamitzvotRef: cycle.seferHamitzvotRef,
    seferHamitzvotSummary: cycle.seferHamitzvotSummary,
    seferHamitzvotItems: cycle.items,
    cycleInfo: 'Cycle 44 · Completing the Entire Mishneh Torah in ~3 Years (or 1 Chapter Daily)',
  };
}

/**
 * Returns the dedicated Geulah & Moshiach entry for the given date
 */
export function getGeulahMoshiachForDate(date: Date): GeulahMoshiachEntry {
  const hebrewDates = getHebrewDateStrings(date);
  const { dayNum } = parseHebrewDateParts(date);
  const cycleItem = GEULAH_CURRICULUM_CYCLE[(dayNum - 1) % GEULAH_CURRICULUM_CYCLE.length];

  return {
    id: `geulah-${date.toISOString().slice(0, 10)}`,
    hebrewDateDisplayEn: hebrewDates.en,
    hebrewDateDisplayHe: hebrewDates.he,
    ...cycleItem,
  };
}
