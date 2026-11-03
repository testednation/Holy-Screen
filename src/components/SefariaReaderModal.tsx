import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mic,
  MicOff,
  Search,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { fetchSefariaText, SefariaTextPassage } from '../services/halachaService';

interface SefariaReaderModalProps {
  refString: string | null;
  title: string;
  onClose: () => void;
  onNavigateRef?: (newRef: string, newTitle: string) => void;
  autoStartVoice?: boolean;
}

interface CanonicalWorkEntry {
  canonical: string;
  titleHe: string;
  type: 'talmud' | 'tanakh' | 'mishnah' | 'chassidut' | 'halakhah';
  defaultSection: string;
  aliases: string[];
}

const CANONICAL_TORAH_WORKS: CanonicalWorkEntry[] = [
  // Talmud Bavli (37 Masechtot)
  {
    canonical: 'Berakhot',
    titleHe: 'מסכת ברכות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['berakhot', 'berachot', 'brachot', 'brachos', 'berachos', 'ברכות'],
  },
  {
    canonical: 'Shabbat',
    titleHe: 'מסכת שבת',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['shabbat', 'shabbos', 'shabat', 'שבת'],
  },
  {
    canonical: 'Eruvin',
    titleHe: 'מסכת עירובין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['eruvin', 'eiruvin', 'erubin', 'עירובין'],
  },
  {
    canonical: 'Pesachim',
    titleHe: 'מסכת פסחים',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['pesachim', 'pesochim', 'psachim', 'פסחים'],
  },
  {
    canonical: 'Rosh Hashanah',
    titleHe: 'מסכת ראש השנה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['rosh hashanah', 'rosh hashana', 'ראש השנה'],
  },
  {
    canonical: 'Yoma',
    titleHe: 'מסכת יומא',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['yoma', 'יומא'],
  },
  {
    canonical: 'Sukkah',
    titleHe: 'מסכת סוכה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['sukkah', 'sukka', 'succah', 'סוכה'],
  },
  {
    canonical: 'Beitzah',
    titleHe: 'מסכת ביצה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['beitzah', 'beitza', 'betzah', 'ביצה'],
  },
  {
    canonical: 'Taanit',
    titleHe: 'מסכת תענית',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['taanit', 'taanis', 'תענית'],
  },
  {
    canonical: 'Megillah',
    titleHe: 'מסכת מגילה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['megillah', 'megilla', 'megilah', 'מגילה'],
  },
  {
    canonical: 'Moed Katan',
    titleHe: 'מסכת מועד קטן',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['moed katan', 'moed kotan', 'מועד קטן'],
  },
  {
    canonical: 'Chagigah',
    titleHe: 'מסכת חגיגה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['chagigah', 'chagiga', 'hagigah', 'חגיגה'],
  },
  {
    canonical: 'Yevamot',
    titleHe: 'מסכת יבמות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['yevamot', 'yevamos', 'yebamot', 'יבמות'],
  },
  {
    canonical: 'Ketubot',
    titleHe: 'מסכת כתובות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['ketubot', 'kesubos', 'ketubos', 'כתובות'],
  },
  {
    canonical: 'Nedarim',
    titleHe: 'מסכת נדרים',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['nedarim', 'נדרים'],
  },
  {
    canonical: 'Nazir',
    titleHe: 'מסכת נזיר',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['nazir', 'נזיר'],
  },
  {
    canonical: 'Sotah',
    titleHe: 'מסכת סוטה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['sotah', 'sota', 'סוטה'],
  },
  {
    canonical: 'Gittin',
    titleHe: 'מסכת גיטין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['gittin', 'gitin', 'גיטין'],
  },
  {
    canonical: 'Kiddushin',
    titleHe: 'מסכת קידושין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['kiddushin', 'kidushin', 'קידושין'],
  },
  {
    canonical: 'Bava Kamma',
    titleHe: 'מסכת בבא קמא',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['bava kamma', 'bava kama', 'baba kama', 'בבא קמא'],
  },
  {
    canonical: 'Bava Metzia',
    titleHe: 'מסכת בבא מציעא',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['bava metzia', 'bava metsia', 'baba metzia', 'בבא מציעא'],
  },
  {
    canonical: 'Bava Batra',
    titleHe: 'מסכת בבא בתרא',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['bava batra', 'bava basra', 'baba batra', 'בבא בתרא'],
  },
  {
    canonical: 'Sanhedrin',
    titleHe: 'מסכת סנהדרין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['sanhedrin', 'סנהדרין'],
  },
  {
    canonical: 'Makkot',
    titleHe: 'מסכת מכות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['makkot', 'makkos', 'makot', 'מכות'],
  },
  {
    canonical: 'Shevuot',
    titleHe: 'מסכת שבועות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['shevuot', 'shevuos', 'shvuot', 'שבועות'],
  },
  {
    canonical: 'Avodah Zarah',
    titleHe: 'מסכת עבודה זרה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['avodah zarah', 'avoda zara', 'avodah zara', 'עבודה זרה'],
  },
  {
    canonical: 'Horayot',
    titleHe: 'מסכת הוריות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['horayot', 'horayos', 'הוריות'],
  },
  {
    canonical: 'Zevachim',
    titleHe: 'מסכת זבחים',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['zevachim', 'zevahim', 'זבחים'],
  },
  {
    canonical: 'Menachot',
    titleHe: 'מסכת מנחות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['menachot', 'menachos', 'מנחות'],
  },
  {
    canonical: 'Chullin',
    titleHe: 'מסכת חולין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['chullin', 'chulin', 'hullin', 'חולין'],
  },
  {
    canonical: 'Bekhorot',
    titleHe: 'מסכת בכורות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['bekhorot', 'bechorot', 'bechoros', 'בכורות'],
  },
  {
    canonical: 'Arakhin',
    titleHe: 'מסכת ערכין',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['arakhin', 'arachin', 'erchin', 'ערכין'],
  },
  {
    canonical: 'Temurah',
    titleHe: 'מסכת תמורה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['temurah', 'temura', 'תמורה'],
  },
  {
    canonical: 'Keritot',
    titleHe: 'מסכת כריתות',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['keritot', 'kerisos', 'kritot', 'כריתות'],
  },
  {
    canonical: 'Meilah',
    titleHe: 'מסכת מעילה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['meilah', 'meila', 'מעילה'],
  },
  {
    canonical: 'Tamid',
    titleHe: 'מסכת תמיד',
    type: 'talmud',
    defaultSection: '25b',
    aliases: ['tamid', 'תמיד'],
  },
  {
    canonical: 'Niddah',
    titleHe: 'מסכת נידה',
    type: 'talmud',
    defaultSection: '2a',
    aliases: ['niddah', 'nida', 'נידה'],
  },
  // Tanakh & Tehillim
  {
    canonical: 'Psalms',
    titleHe: 'תהילים',
    type: 'tanakh',
    defaultSection: '23',
    aliases: ['psalms', 'psalm', 'tehillim', 'tehilim', 'תהילים', 'תהלים'],
  },
  {
    canonical: 'Proverbs',
    titleHe: 'משלי',
    type: 'tanakh',
    defaultSection: '31',
    aliases: ['proverbs', 'mishlei', 'mishle', 'משלי'],
  },
  {
    canonical: 'Genesis',
    titleHe: 'בראשית',
    type: 'tanakh',
    defaultSection: '1',
    aliases: ['genesis', 'bereishit', 'bereshit', 'bereishis', 'בראשית'],
  },
  {
    canonical: 'Exodus',
    titleHe: 'שמות',
    type: 'tanakh',
    defaultSection: '20',
    aliases: ['exodus', 'shemot', 'shmos', 'שמות'],
  },
  {
    canonical: 'Leviticus',
    titleHe: 'ויקרא',
    type: 'tanakh',
    defaultSection: '19',
    aliases: ['leviticus', 'vayikra', 'ויקרא'],
  },
  {
    canonical: 'Numbers',
    titleHe: 'במדבר',
    type: 'tanakh',
    defaultSection: '6',
    aliases: ['numbers', 'bamidbar', 'במדבר'],
  },
  {
    canonical: 'Deuteronomy',
    titleHe: 'דברים',
    type: 'tanakh',
    defaultSection: '6',
    aliases: ['deuteronomy', 'devarim', 'dvarim', 'דברים'],
  },
  {
    canonical: 'Esther',
    titleHe: 'מגילת אסתר',
    type: 'tanakh',
    defaultSection: '1',
    aliases: ['esther', 'megillat esther', 'אסתר'],
  },
  // Mishnah & Ethics
  {
    canonical: 'Pirkei Avot',
    titleHe: 'פרקי אבות',
    type: 'mishnah',
    defaultSection: '1',
    aliases: ['pirkei avot', 'pirkei avos', 'avot', 'avos', 'ethics of the fathers', 'פרקי אבות', 'אבות'],
  },
  // Chassidut & Tanya
  {
    canonical: 'Tanya, Part I; Likkutei Amarim',
    titleHe: 'תניא · ליקוטי אמרים',
    type: 'chassidut',
    defaultSection: '1',
    aliases: ['tanya', 'likkutei amarim', 'likutei amarim', 'תניא', 'ליקוטי אמרים'],
  },
];

const SPOKEN_NUMBER_WORDS: Record<string, number> = {
  one: 1,
  first: 1,
  two: 2,
  second: 2,
  three: 3,
  third: 3,
  four: 4,
  fourth: 4,
  five: 5,
  fifth: 5,
  six: 6,
  sixth: 6,
  seven: 7,
  seventh: 7,
  eight: 8,
  eighth: 8,
  nine: 9,
  ninth: 9,
  ten: 10,
  tenth: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

function convertSpokenWordsToNumbers(input: string): string {
  const tokens = input.split(/\s+/);
  const out: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const clean = tokens[i].toLowerCase().replace(/[^a-z]/g, '');
    if (clean === 'one' && tokens[i + 1]?.toLowerCase() === 'hundred') {
      let val = 100;
      i += 2;
      if (tokens[i]?.toLowerCase() === 'and') i++;
      const nextClean = tokens[i]?.toLowerCase().replace(/[^a-z]/g, '') || '';
      if (SPOKEN_NUMBER_WORDS[nextClean]) {
        val += SPOKEN_NUMBER_WORDS[nextClean];
        i++;
        const unitClean = tokens[i]?.toLowerCase().replace(/[^a-z]/g, '') || '';
        if (SPOKEN_NUMBER_WORDS[unitClean] && SPOKEN_NUMBER_WORDS[unitClean] < 10) {
          val += SPOKEN_NUMBER_WORDS[unitClean];
          i++;
        }
      }
      out.push(String(val));
      continue;
    }

    if (SPOKEN_NUMBER_WORDS[clean] && SPOKEN_NUMBER_WORDS[clean] >= 20 && SPOKEN_NUMBER_WORDS[clean] < 100) {
      let val = SPOKEN_NUMBER_WORDS[clean];
      const nextClean = tokens[i + 1]?.toLowerCase().replace(/[^a-z]/g, '') || '';
      if (SPOKEN_NUMBER_WORDS[nextClean] && SPOKEN_NUMBER_WORDS[nextClean] < 10) {
        val += SPOKEN_NUMBER_WORDS[nextClean];
        i += 2;
      } else {
        i += 1;
      }
      out.push(String(val));
      continue;
    }

    if (SPOKEN_NUMBER_WORDS[clean]) {
      out.push(String(SPOKEN_NUMBER_WORDS[clean]));
      i++;
      continue;
    }

    out.push(tokens[i]);
    i++;
  }

  return out.join(' ');
}

export function resolveSpokenTorahQuery(rawTranscript: string): {
  ref: string;
  displayTitle: string;
  matchedWork?: CanonicalWorkEntry;
} {
  const cleaned = convertSpokenWordsToNumbers(
    rawTranscript
      .trim()
      .replace(/[.,?!;]+/g, ' ')
      .replace(/\b(masechet|maseches|tractate|book of|sefer|chapter|perek|daf|page|folio)\b/gi, ' ')
      .replace(/\b(amud\s+alef|amud\s+a|side\s+a)\b/gi, 'a')
      .replace(/\b(amud\s+bet|amud\s+beis|amud\s+b|side\s+b)\b/gi, 'b')
      .replace(/\s+/g, ' ')
      .trim()
  );

  const lower = cleaned.toLowerCase();

  for (const work of CANONICAL_TORAH_WORKS) {
    for (const alias of work.aliases) {
      if (lower.startsWith(alias) || lower.includes(alias)) {
        const remainder = lower.replace(alias, '').trim();
        // Extract daf / chapter / verse pattern like "2a", "2 b", "23", "23:1", "23 1"
        const matchDaf = remainder.match(/(\d+)\s*([ab])?\b(?:\s*[:\s]\s*(\d+))?/i);
        if (matchDaf) {
          const num = parseInt(matchDaf[1], 10);
          const amud = matchDaf[2]?.toLowerCase();
          const subVerse = matchDaf[3];

          if (work.type === 'talmud') {
            const safeNum = Math.max(2, num);
            const finalAmud = amud === 'b' ? 'b' : 'a';
            const finalRef = `${work.canonical} ${safeNum}${finalAmud}`;
            return {
              ref: finalRef,
              displayTitle: `${work.canonical} ${safeNum}${finalAmud} · ${work.titleHe}`,
              matchedWork: work,
            };
          } else {
            const section = subVerse ? `${num}:${subVerse}` : `${num}`;
            const finalRef = `${work.canonical} ${section}`;
            return {
              ref: finalRef,
              displayTitle: `${work.canonical} ${section} · ${work.titleHe}`,
              matchedWork: work,
            };
          }
        }

        // No number spoken -> open default first Daf/Chapter of that Masechet or Sefer
        const defaultRef = `${work.canonical} ${work.defaultSection}`;
        return {
          ref: defaultRef,
          displayTitle: `${work.canonical} ${work.defaultSection} · ${work.titleHe}`,
          matchedWork: work,
        };
      }
    }
  }

  // Fallback: pass cleaned query directly to Sefaria
  const fallbackRef = cleaned || 'Berakhot 2a';
  return {
    ref: fallbackRef,
    displayTitle: `Sefaria · ${fallbackRef}`,
  };
}

function stepReference(currentRef: string, direction: -1 | 1): string {
  // Check if Talmud Daf reference (e.g., "Berakhot 2a", "Shabbat 21b")
  const dafMatch = currentRef.match(/^(.+?)\s+(\d+)([ab])$/i);
  if (dafMatch) {
    const base = dafMatch[1];
    const dafNum = parseInt(dafMatch[2], 10);
    const amud = dafMatch[3].toLowerCase();
    if (direction === 1) {
      return amud === 'a' ? `${base} ${dafNum}b` : `${base} ${dafNum + 1}a`;
    } else {
      if (amud === 'b') return `${base} ${dafNum}a`;
      return `${base} ${Math.max(2, dafNum - 1)}b`;
    }
  }

  // Check if Chapter reference (e.g., "Psalms 23", "Pirkei Avot 1")
  const chapMatch = currentRef.match(/^(.+?)\s+(\d+)$/);
  if (chapMatch) {
    const base = chapMatch[1];
    const chapNum = parseInt(chapMatch[2], 10);
    const nextChap = Math.max(1, chapNum + direction);
    return `${base} ${nextChap}`;
  }

  return currentRef;
}

const VOICE_QUICK_EXAMPLES = [
  { label: 'Berakhot 2a', query: 'Berakhot 2a' },
  { label: 'Shabbat 21b', query: 'Shabbat 21b' },
  { label: 'Bava Metzia 59b', query: 'Bava Metzia 59b' },
  { label: 'Tehillim 23', query: 'Psalms 23' },
  { label: 'Pirkei Avot 1', query: 'Pirkei Avot 1' },
  { label: 'Tanya Ch. 1', query: 'Tanya, Part I; Likkutei Amarim 1' },
];

export const SefariaReaderModal: React.FC<SefariaReaderModalProps> = ({
  refString,
  title,
  onClose,
  onNavigateRef,
  autoStartVoice = false,
}) => {
  const [activeRef, setActiveRef] = useState<string>(refString || '');
  const [activeTitle, setActiveTitle] = useState<string>(title || '');
  const [passage, setPassage] = useState<SefariaTextPassage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [langMode, setLangMode] = useState<'bilingual' | 'he' | 'en'>('bilingual');

  // Search & Voice Control States
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'he-IL'>('en-US');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [voiceStatusMsg, setVoiceStatusMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (refString) {
      setActiveRef(refString);
      setActiveTitle(title || refString);
    }
  }, [refString, title]);

  const navigateToCitation = useCallback(
    (rawQuery: string) => {
      if (!rawQuery.trim()) return;
      const resolved = resolveSpokenTorahQuery(rawQuery);
      setActiveRef(resolved.ref);
      setActiveTitle(resolved.displayTitle);
      setSearchInput(resolved.ref);
      setSuggestions([]);
      if (onNavigateRef) {
        onNavigateRef(resolved.ref, resolved.displayTitle);
      }
    },
    [onNavigateRef]
  );

  // Fetch passage whenever activeRef changes
  useEffect(() => {
    if (!activeRef) return;
    let active = true;
    setLoading(true);
    fetchSefariaText(activeRef)
      .then((res) => {
        if (active) {
          setPassage(res);
          if (res.ref && res.heRef) {
            setActiveTitle(`${res.ref} · ${res.heRef}`);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeRef]);

  // Fetch Sefaria Name Autocomplete when typing in search box
  useEffect(() => {
    const q = searchInput.trim();
    if (q.length < 2 || q === activeRef) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://www.sefaria.org/api/name/${encodeURIComponent(q)}?limit=6`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data?.completions)) {
          setSuggestions(data.completions.slice(0, 6));
        }
      } catch {
        // ignore network errors
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchInput, activeRef]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startVoiceRecognition = useCallback(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatusMsg(
        'Browser Speech Recognition is not supported in this browser. Type any Masechet or Chapter above.'
      );
      return;
    }

    stopVoiceRecognition();

    try {
      const recognition = new SpeechRec();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setLiveTranscript('');
        setVoiceStatusMsg(
          voiceLang === 'he-IL'
            ? 'מקשיב... אמור שם מסכת או פרק (למשל: "ברכות ב עמוד א" או "תהילים כג")'
            : 'Listening... Speak a Masechet or chapter (e.g., "Berachot 2a", "Shabbat 21b", "Tehillim 23")'
        );
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interim += transcriptPiece;
          }
        }

        const currentText = (finalTranscript || interim).trim();
        if (currentText) {
          setLiveTranscript(currentText);
          setSearchInput(currentText);
        }

        if (finalTranscript.trim()) {
          const resolved = resolveSpokenTorahQuery(finalTranscript.trim());
          setVoiceStatusMsg(
            `Heard "${finalTranscript.trim()}" → Opening ${resolved.ref}`
          );
          setIsListening(false);
          navigateToCitation(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'not-allowed') {
          setVoiceStatusMsg(
            'Microphone access was blocked. Please allow microphone permission or use the search bar.'
          );
        } else if (event?.error === 'no-speech') {
          setVoiceStatusMsg(
            'No speech detected. Click the microphone and speak a Masechet or chapter name.'
          );
        } else {
          setVoiceStatusMsg('Voice search paused. Click the microphone to try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatusMsg('Unable to start microphone. Please use the search input.');
    }
  }, [voiceLang, stopVoiceRecognition, navigateToCitation]);

  // Auto-start voice recognition if launched via the Voice Search button
  useEffect(() => {
    if (refString && autoStartVoice) {
      const timer = setTimeout(() => {
        startVoiceRecognition();
      }, 180);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [refString, autoStartVoice, startVoiceRecognition]);

  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, [stopVoiceRecognition]);

  if (!refString) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Bilingual Torah Study Reader</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold">
                {activeRef}
              </span>
            </div>
            <h3
              id="reader-modal-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-0.5"
            >
              {activeTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next Daf or Chapter Stepper */}
            <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
              <button
                type="button"
                onClick={() => navigateToCitation(stepReference(activeRef, -1))}
                title="Previous Daf or Chapter"
                aria-label="Previous Daf or Chapter"
                className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigateToCitation(stepReference(activeRef, 1))}
                title="Next Daf or Chapter"
                aria-label="Next Daf or Chapter"
                className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bilingual / Hebrew / English Switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700">
              {(
                [
                  { id: 'bilingual', label: 'Bilingual' },
                  { id: 'he', label: 'עברית' },
                  { id: 'en', label: 'English' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLangMode(m.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    langMode === m.id
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                stopVoiceRecognition();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice-Controlled Search & Masechet/Chapter Citation Bar */}
        <div className="px-6 py-3 bg-[#FAF8F5] dark:bg-stone-950/70 border-b border-stone-200/80 dark:border-stone-800 space-y-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigateToCitation(searchInput);
            }}
            className="flex flex-wrap sm:flex-nowrap items-center gap-2 relative"
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Search or speak a Masechet or chapter (e.g., "Berakhot 2a", "Shabbat 21b", "Tehillim 23")...'
                aria-label="Search Sefaria Masechet or chapter"
                className="w-full pl-8 pr-20 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              />
              {searchInput && (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-700 text-white dark:bg-amber-500 dark:text-stone-950 hover:bg-amber-800 dark:hover:bg-amber-400 transition-colors"
                >
                  Open
                </button>
              )}

              {/* Live Sefaria Autocomplete Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-9 z-30 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-lg py-1 max-h-48 overflow-y-auto">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => navigateToCitation(sug)}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between"
                    >
                      <span className="font-medium">{sug}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        Jump to Text →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Recognition Microphone Button */}
            <button
              type="button"
              onClick={
                isListening ? stopVoiceRecognition : startVoiceRecognition
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 shadow-[0_0_14px_rgba(225,29,72,0.55)] animate-pulse'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100/80'
              }`}
              title="Voice Search: Speak a Masechet or Chapter name"
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Listening... (Stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Voice Search</span>
                </>
              )}
            </button>

            {/* Voice Language Selector (English / Hebrew) */}
            <button
              type="button"
              onClick={() =>
                setVoiceLang((prev) => (prev === 'en-US' ? 'he-IL' : 'en-US'))
              }
              title="Switch speech recognition language between English and Hebrew"
              className="px-2 py-1.5 rounded-lg text-[11px] font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-600 transition-colors shrink-0"
            >
              {voiceLang === 'en-US' ? '🎤 EN' : '🎤 עב'}
            </button>
          </form>

          {/* Live Voice Status Banner or Quick Spoken Examples */}
          {isListening || voiceStatusMsg ? (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200/80 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 min-w-0">
                <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="truncate">
                  {liveTranscript
                    ? `Speaking: "${liveTranscript}"`
                    : voiceStatusMsg}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoiceStatusMsg(null);
                  setLiveTranscript('');
                }}
                className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline shrink-0"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1 font-medium text-stone-600 dark:text-stone-300 mr-1">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Try speaking or clicking:
              </span>
              {VOICE_QUICK_EXAMPLES.map((ex) => (
                <button
                  key={ex.query}
                  type="button"
                  onClick={() => navigateToCitation(ex.query)}
                  className={`px-2 py-0.5 rounded-md border transition-colors ${
                    activeRef === ex.query
                      ? 'bg-amber-700 text-white border-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:border-amber-500 font-semibold'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-500'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-lg bg-stone-100 dark:bg-stone-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : passage && passage.verses.length > 0 ? (
            passage.verses.map((v) => (
              <div
                key={v.num}
                className="pb-4 border-b border-stone-200/60 dark:border-stone-800/70 last:border-b-0"
              >
                <div className="text-[11px] font-mono tabular-nums text-amber-700 dark:text-amber-400 mb-1.5">
                  Segment {v.num}
                </div>
                {(langMode === 'bilingual' || langMode === 'he') && v.he && (
                  <p
                    dir="rtl"
                    className="text-lg leading-relaxed font-display text-stone-900 dark:text-stone-100 mb-2"
                  >
                    {v.he}
                  </p>
                )}
                {(langMode === 'bilingual' || langMode === 'en') && v.en && (
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {v.en}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Unable to load text preview for &ldquo;{activeRef}&rdquo;.
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Try speaking or typing a Masechet and Daf (e.g., &ldquo;Berakhot 2a&rdquo;, &ldquo;Shabbat 31a&rdquo;) or chapter (e.g., &ldquo;Psalms 23&rdquo;).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Source text provided via Sefaria Library API · Voice Search Ready</span>
          <a
            href={`https://www.sefaria.org/${encodeURIComponent(activeRef)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            Open Full Commentary on Sefaria
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
