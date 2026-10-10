import { VocabularyItem } from '../types';

export const CURATED_VOCABULARY: VocabularyItem[] = [
  {
    id: 'taberu',
    japanese: '食べる',
    hiragana: 'たべる',
    romaji: 'taberu',
    english: 'To eat; to consume food',
    partOfSpeech: 'Transitive Verb (他動詞 • tadoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[ta-BE-ru]',
      moras: [
        { mora: 'ta', pitch: 'low' },
        { mora: 'BE', pitch: 'high' },
        { mora: 'ru', pitch: 'low' },
      ],
    },
    nuance: 'Used for meals and dining. Pair with object particle を (o), e.g., ご飯を食べる (to eat rice/meal). Polite form: 食べます (tabemasu).',
    exampleSentence: {
      japanese: '毎朝、七時にパンを食べます。',
      furigana: 'まいあさ、しちじに パンを たべます。',
      romaji: 'Maiasa, shichiji ni pan o tabemasu.',
      english: 'Every morning at 7 o\'clock, I eat bread.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'nomu',
    japanese: '飲む',
    hiragana: 'のむ',
    romaji: 'nomu',
    english: 'To drink; to swallow liquids',
    partOfSpeech: 'Godan Verb (五段動詞 • godandoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[NO-mu]',
      moras: [
        { mora: 'NO', pitch: 'high' },
        { mora: 'mu', pitch: 'low' },
      ],
    },
    nuance: 'Also used idiomatically for taking medicine (薬を飲む). Polite form: 飲みます (nomimasu). Past polite: 飲みました (nomimashita).',
    exampleSentence: {
      japanese: 'カフェで冷たい緑茶を飲みました。',
      furigana: 'カフェで つめたい りょくちゃを のみました。',
      romaji: 'Kafe de tsumetai ryokucha o nomimashita.',
      english: 'I drank cold green tea at the cafe.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'hon',
    japanese: '本',
    hiragana: 'ほん',
    romaji: 'hon',
    english: 'Book; volume; origin',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 50',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[HO-n]',
      moras: [
        { mora: 'HO', pitch: 'high' },
        { mora: 'n', pitch: 'low' },
      ],
    },
    nuance: 'As a counter (-hon/bon/pon), 本 counts cylindrical objects like bottles, pens, and trees, in addition to meaning "book" as a noun.',
    exampleSentence: {
      japanese: '図書館で面白い日本の本を借りました。',
      furigana: 'としょかんで おもしろい にほんの ほんを かりました。',
      romaji: 'Toshokan de omoshiroi Nihon no hon o karimashita.',
      english: 'I borrowed an interesting Japanese book from the library.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'iku',
    japanese: '行く',
    hiragana: 'いく',
    romaji: 'iku',
    english: 'To go; to proceed towards',
    partOfSpeech: 'Godan Verb (五段動詞 • godandoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 50',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[i-KU]',
      moras: [
        { mora: 'i', pitch: 'low' },
        { mora: 'KU', pitch: 'high' },
      ],
    },
    nuance: 'Takes destination particles に (ni) or へ (e). Irregular te-form: 行って (itte, not iite). Polite: 行きます (ikimasu).',
    exampleSentence: {
      japanese: '来週、友だちと京都へ行きます。',
      furigana: 'らいしゅう、ともだちと きょうとへ いきます。',
      romaji: 'Raishuu, tomodachi to Kyouto e ikimasu.',
      english: 'Next week, I am going to Kyoto with a friend.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'mizu',
    japanese: '水',
    hiragana: 'みず',
    romaji: 'mizu',
    english: 'Water (cold or ambient drinking water)',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[mi-ZU]',
      moras: [
        { mora: 'mi', pitch: 'low' },
        { mora: 'ZU', pitch: 'high' },
      ],
    },
    nuance: 'Specifically refers to cold or room-temperature water. For hot water, Japanese uses an entirely different word: お湯 (oyu). Polite: お水 (omizu).',
    exampleSentence: {
      japanese: 'すみません、お水を一杯ください。',
      furigana: 'すみません、おみずを いっぱいください。',
      romaji: 'Sumimasen, omizu o ippai kudasai.',
      english: 'Excuse me, could I have a glass of water, please?',
    },
    source: 'curated-fallback',
  },
  {
    id: 'neko',
    japanese: '猫',
    hiragana: 'ねこ',
    romaji: 'neko',
    english: 'Cat; feline',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 200',
    pitchAccent: {
      pattern: 'Atamadaka ＼',
      notation: '[NE-ko]',
      moras: [
        { mora: 'NE', pitch: 'high' },
        { mora: 'ko', pitch: 'low' },
      ],
    },
    nuance: 'Often used in cultural idioms like 猫の手も借りたい (so busy you would even borrow a cat\'s paw) and 猫舌 (nekojita, sensitive to hot food).',
    exampleSentence: {
      japanese: '庭の木の下で白い猫が寝ています。',
      furigana: 'にわの きのしたで しろい ねこが ねています。',
      romaji: 'Niwa no ki no shita de shiroi neko ga nete imasu.',
      english: 'A white cat is sleeping under the tree in the garden.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'tomodachi',
    japanese: '友達',
    hiragana: 'ともだち',
    romaji: 'tomodachi',
    english: 'Friend; companion',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[to-MO-DA-CHI]',
      moras: [
        { mora: 'to', pitch: 'low' },
        { mora: 'MO', pitch: 'high' },
        { mora: 'DA', pitch: 'high' },
        { mora: 'CHI', pitch: 'high' },
      ],
    },
    nuance: 'Composed of 友 (friend) + 達 (plural suffix), but is commonly used for both a single friend and friends collectively.',
    exampleSentence: {
      japanese: '大学の友達と一緒に日本語を勉強しました。',
      furigana: 'だいがくの ともだちと いっしょに にほんごを べんきょうしました。',
      romaji: 'Daigaku no tomodachi to issho ni Nihongo o benkyou shimashita.',
      english: 'I studied Japanese together with my university friend.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'oishii',
    japanese: '美味しい',
    hiragana: 'おいしい',
    romaji: 'oishii',
    english: 'Delicious; tasty',
    partOfSpeech: 'i-Adjective (い形容詞 • ikeiyoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Nakadaka [3]',
      notation: '[o-I-SHI-i]',
      moras: [
        { mora: 'o', pitch: 'low' },
        { mora: 'I', pitch: 'high' },
        { mora: 'SHI', pitch: 'high' },
        { mora: 'i', pitch: 'low' },
      ],
    },
    nuance: 'Very natural and universally polite. Men may informally use うまい (umai). Negative form: 美味しくない (oishikunai). Past: 美味しかった (oishikatta).',
    exampleSentence: {
      japanese: 'このラーメンのスープはとても美味しいです。',
      furigana: 'この ラーメンの スープは とても おいしいです。',
      romaji: 'Kono raamen no suupu wa totemo oishii desu.',
      english: 'The broth of this ramen is very delicious.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'arigatou',
    japanese: 'ありがとう',
    hiragana: 'ありがとう',
    romaji: 'arigatou',
    english: 'Thank you; thanks',
    partOfSpeech: 'Expression (感動詞 • kandoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 20',
    pitchAccent: {
      pattern: 'Nakadaka [2]',
      notation: '[a-RI-ga-tou]',
      moras: [
        { mora: 'a', pitch: 'low' },
        { mora: 'RI', pitch: 'high' },
        { mora: 'ga', pitch: 'low' },
        { mora: 'tou', pitch: 'low' },
      ],
    },
    nuance: 'Etymologically originates from 有り難い (arigatai, "it is rare and precious"). Polite form: ありがとうございます (arigatou gozaimasu).',
    exampleSentence: {
      japanese: '親切に教えてくれて、本当にありがとうございます。',
      furigana: 'しんせつに おしえてくれて、ほんとうに ありがとうございます。',
      romaji: 'Shinsetsu ni oshiete kurete, hontou ni arigatou gozaimasu.',
      english: 'Thank you very much for kindly teaching me.',
    },
    source: 'curated-fallback',
  },
  {
    id: 'benkyou',
    japanese: '勉強',
    hiragana: 'べんきょう',
    romaji: 'benkyou',
    english: 'Study; diligence (or "to study" with suru)',
    partOfSpeech: 'Noun / Suru Verb (サ変動詞)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[ben-KYOU]',
      moras: [
        { mora: 'ben', pitch: 'low' },
        { mora: 'KYOU', pitch: 'high' },
      ],
    },
    nuance: 'Combines 勉 (exert effort) + 強 (force/strength). In merchants\' slang in Kansai, 勉強する also means "to discount or lower the price".',
    exampleSentence: {
      japanese: '毎晩、寝る前に単語を三十分勉強します。',
      furigana: 'まいばん、ねるまえに たんごを さんじゅっぷん べんきょうします。',
      romaji: 'Maiban, neru mae ni tango o sanjuppun benkyou shimasu.',
      english: 'Every night before sleeping, I study vocabulary for 30 minutes.',
    },
    source: 'curated-fallback',
  },
];

export function findCuratedWord(query: string): VocabularyItem | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  return (
    CURATED_VOCABULARY.find(
      (v) =>
        v.english.toLowerCase().includes(clean) ||
        v.romaji.toLowerCase() === clean ||
        v.hiragana === clean ||
        v.japanese === clean ||
        v.id === clean
    ) || null
  );
}
