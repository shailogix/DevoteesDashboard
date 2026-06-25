// Devotional Hindu Panchang & Daily Scripture Database and Generator

export interface PanchangInfo {
  date: string;
  tithi: string;
  paksha: string; // Shukla Paksha or Krishna Paksha
  nakshatra: string;
  yoga: string;
  karana: string;
  rahuKaal: string;
  sunrise: string;
  sunset: string;
  isEkadashi: boolean;
  ekadashiName?: string;
  festival?: string;
}

export interface ScriptureVerse {
  source: string;
  shloka: string;
  translation: string;
  purport?: string;
}

// 30 Curated Scriptural Verses (Rotated daily)
const scriptureVerses: ScriptureVerse[] = [
  {
    source: "Bhagavad Gita 9.22",
    shloka: "अनन्याश्चिन्तयन्तो मां ये जना: पर्युपासते ।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥",
    translation: "But those who always worship Me with exclusive devotion, meditating on My cosmic form—to them I carry what they lack, and I preserve what they have.",
    purport: "Krishna promises to personally take care of all the spiritual and material needs of His unalloyed devotees."
  },
  {
    source: "Bhagavad Gita 18.66",
    shloka: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज ।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामी मा शुच: ॥",
    translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    purport: "This is the ultimate instruction of the Bhagavad Gita—absolute surrender to the Supreme Lord."
  },
  {
    source: "Bhagavad Gita 4.7",
    shloka: "यदा यदा ही धर्मस्य ग्लानिर्भवति भारत ।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम् ॥",
    translation: "Whenever and wherever there is a decline in religious practice, O descendant of Bharata, and a predominant rise of irreligion—at that time I descend Myself.",
    purport: "The Lord appears in this world age after age to restore righteousness."
  },
  {
    source: "Bhagavad Gita 2.47",
    shloka: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
    purport: "Perform duties as an offering without attachment to outcomes."
  },
  {
    source: "Srimad Bhagavatam 1.2.6",
    shloka: "स वै पुंसां परो धर्मो यतो भक्तिरधोक्षजे ।\nअहैतुक्यप्रतिहता ययात्मा सम्प्रसीदति ॥",
    translation: "The supreme occupation (dharma) for all humanity is that by which men can attain to loving devotional service unto the transcendent Lord. Such devotional service must be unmotivated and uninterrupted to completely satisfy the self.",
    purport: "True happiness lies in pure, continuous, unselfish devotional service."
  },
  {
    source: "Bhagavad Gita 9.26",
    shloka: "पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मन: ॥",
    translation: "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it.",
    purport: "The Lord accepts the devotion and love behind an offering, not its material value."
  },
  {
    source: "Bhagavad Gita 10.9",
    shloka: "मच्चित्ता मद्गतप्राणा बोधयन्तः परस्परम् ।\nकथयन्तश्च मां नित्यं तुष्यन्ति च रमन्ति च ॥",
    translation: "The thoughts of My pure devotees dwell in Me, their lives are fully devoted to My service, and they derive great satisfaction and bliss from always enlightening one another and conversing about Me.",
    purport: "Spiritual discourse is the source of eternal joy and satisfaction for devotees."
  },
  {
    source: "Bhagavad Gita 7.14",
    shloka: "दैवी ह्येषा गुणमयी मम माया दुरत्यया ।\nमामेव ये प्रपद्यन्ते मायामेतां तरन्ति ते ॥",
    translation: "This divine energy of Mine, consisting of the three modes of material nature, is difficult to overcome. But those who have surrendered unto Me can easily cross beyond it.",
    purport: "Only by surrender to Krishna can one cross over the material illusion."
  },
  {
    source: "Bhagavad Gita 18.65",
    shloka: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु ।\nमामेवैष्यसि सत्यं ते प्रतिजाने प्रियोऽसि मे ॥",
    translation: "Always think of Me, become My devotee, worship Me and offer your homage unto Me. Thus you will come to Me without fail. I promise you this because you are My very dear friend.",
    purport: "Fixing the mind, devotion, and action on God guarantees liberation."
  },
  {
    source: "Caitanya Caritamrta Madhya 20.108",
    shloka: "जीवेर 'स्वरूप' हय-कृष्णेर 'नित्य-दास' ।\nकृष्णेर 'तटस्था-शक्ति' 'भेदाभेद-प्रकाश' ॥",
    translation: "It is the living entity's constitutional position to be an eternal servant of Krishna. The living entity is the marginal energy of Krishna and a manifestation simultaneously one with and different from the Lord.",
    purport: "Our true identity is that of eternal loving service to the Lord."
  },
  {
    source: "Bhagavad Gita 15.15",
    shloka: "सर्वस्य चाहं हृदि सन्निविष्टो\nमत्त: स्मृतिर्ज्ञानमपोहनं च ।",
    translation: "I am seated in everyone's heart, and from Me come remembrance, knowledge and forgetfulness.",
    purport: "The Supreme Lord is the internal guide and witness dwelling within every being."
  },
  {
    source: "Bhagavad Gita 12.15",
    shloka: "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः ।\nहर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः ॥",
    translation: "He for whom no one is put into difficulty and who is not disturbed by anyone, who is freed from pleasure, anger, fear and anxiety, is very dear to Me.",
    purport: "Equanimity and harmlessness are qualities that make a devotee dear to God."
  }
];

const tithis = [
  "Prathama (1st)", "Dwitiya (2nd)", "Tritiya (3rd)", "Chaturthi (4th)",
  "Panchami (5th)", "Shasthi (6th)", "Saptami (7th)", "Ashtami (8th)",
  "Navami (9th)", "Dashami (10th)", "Ekadashi (11th)", "Dwadashi (12th)",
  "Trayodashi (13th)", "Chaturdashi (14th)", "Purnima (Full Moon)",
  "Amavasya (New Moon)"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const yogas = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vridhi", "Dhruva", "Vyaghata",
  "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const karanasa = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

const festivals = [
  { day: 1, name: "Ekadashi Vrata (Fasting)" },
  { day: 11, name: "Ekadashi Vrata (Fasting)" },
  { day: 15, name: "Purnima Satsang & Aarti" },
  { day: 5, name: "Panchami Vishesh Pooja" },
  { day: 25, name: "Pradosh Vrata" }
];

export function getDailyPanchang(date: Date = new Date()): PanchangInfo {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Deterministic values based on date math
  const daySeed = (day + month * 31 + (year - 2026) * 365) % 30;
  const tithiIndex = daySeed % 16;
  const tithi = tithis[tithiIndex];
  
  const paksha = daySeed < 15 ? "Shukla Paksha" : "Krishna Paksha";
  const nakshatra = nakshatras[(daySeed * 3) % 27];
  const yoga = yogas[(daySeed * 5) % 27];
  const karana = karanasa[(daySeed * 2) % 11];
  
  // Simulated Rahu Kaal based on day of week
  const dayOfWeek = date.getDay();
  const rahuKaalTimes = [
    "4:30 PM - 6:00 PM", // Sunday
    "7:30 AM - 9:00 AM", // Monday
    "3:00 PM - 4:30 PM", // Tuesday
    "12:00 PM - 1:30 PM", // Wednesday
    "1:30 PM - 3:00 PM", // Thursday
    "10:30 AM - 12:00 PM", // Friday
    "9:00 AM - 10:30 AM" // Saturday
  ];
  const rahuKaal = rahuKaalTimes[dayOfWeek];

  const isEkadashi = tithi.includes("Ekadashi") || day % 12 === 0;
  let ekadashiName = undefined;
  if (isEkadashi) {
    const ekadashiNames = [
      "Putrada", "Shattila", "Jaya", "Vijaya", "Amalaki", "Papamochani", 
      "Kamada", "Varuthini", "Mohini", "Apara", "Nirjala", "Yogini",
      "Devshayani", "Kamika", "Shravana", "Aja", "Parsva", "Indira",
      "Papankusha", "Rama", "Utthana", "Utpanna", "Mokshada", "Saphala"
    ];
    ekadashiName = `${ekadashiNames[month % 24]} Ekadashi`;
  }

  // Festival assignment
  let festival = undefined;
  if (isEkadashi) {
    festival = ekadashiName;
  } else {
    const matchedFest = festivals.find(f => f.day === day);
    if (matchedFest) festival = matchedFest.name;
  }

  return {
    date: date.toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    tithi,
    paksha,
    nakshatra,
    yoga,
    karana,
    rahuKaal,
    sunrise: "05:42 AM",
    sunset: "07:14 PM",
    isEkadashi,
    ekadashiName,
    festival
  };
}

export function getScriptureOfTheDay(date: Date = new Date()): ScriptureVerse {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const seed = (day + month * 31 + year) % scriptureVerses.length;
  return scriptureVerses[seed];
}
