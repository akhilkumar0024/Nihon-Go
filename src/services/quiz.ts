import { QuizQuestion, VocabularyItem } from '../types';
import { CURATED_VOCABULARY } from '../data/curatedVocab';
import { getSavedWords } from './storage';

export function generateQuizQuestions(count: number = 5): QuizQuestion[] {
  const saved = getSavedWords();
  const pool = saved.length >= 3 ? saved : CURATED_VOCABULARY;

  const questions: QuizQuestion[] = [];

  // Question 1: Listening & Reading Comprehension (Past tense of 食べる - from Stitch design reference!)
  questions.push({
    id: 'q-tabemashita-past',
    wordId: 'taberu',
    type: 'conjugation',
    prompt: 'What does 「食べました」 mean in this sentence?',
    japanesePrompt: {
      sentence: '昨日、美味しいラーメンを食べました。',
      furigana: 'きのう、おいしい ラーメンを たべました。',
      highlighted: '食べました',
      accentNote: 'Accent: たべま＼した (Nakadaka drop at ま) • Polite Style (丁寧語)',
    },
    audioSentence: '昨日、美味しいラーメンを食べました。',
    options: [
      { id: 'A', text: 'Drank (Past tense)', subtext: 'Associated verb: 飲みました' },
      { id: 'B', text: 'Ate (Polite past tense)', subtext: 'Direct match for 食べる + ました' },
      { id: 'C', text: 'Will eat (Future polite)', subtext: 'Associated verb: 食べます' },
      { id: 'D', text: 'Cooked (Past tense)', subtext: 'Associated verb: 作りました' },
    ],
    correctOptionId: 'B',
    explanation: '「食べました」 is the polite past affirmative form of the ichidan verb 食べる (to eat). The suffix -ました (-mashita) systematically replaces the polite non-past marker -ます (-masu).',
    grammarNotes: ['Ichidan Verb (一段)', 'JLPT N5 Core', 'Formal Register (Desu/Masu)'],
    xp: 15,
  });

  // Question 2: Reading identification
  const nomu = pool.find((w) => w.id === 'nomu') || CURATED_VOCABULARY[1];
  questions.push({
    id: 'q-nomu-reading',
    wordId: nomu.id,
    type: 'reading',
    prompt: `What is the correct hiragana reading for the kanji 「${nomu.japanese}」?`,
    japanesePrompt: {
      sentence: 'カフェで冷たい緑茶を飲みました。',
      furigana: 'カフェで つめたい りょくちゃを のみました。',
      highlighted: '飲みました',
      accentNote: 'Godan Verb • Transitive (他動詞)',
    },
    audioSentence: '緑茶を飲みます。',
    options: [
      { id: 'A', text: 'たべる (taberu)', subtext: 'Meaning: to eat' },
      { id: 'B', text: 'のむ (nomu)', subtext: 'Meaning: to drink' },
      { id: 'C', text: 'よむ (yomu)', subtext: 'Meaning: to read' },
      { id: 'D', text: 'いく (iku)', subtext: 'Meaning: to go' },
    ],
    correctOptionId: 'B',
    explanation: `The kanji 飲 is read as 「のむ」 (nomu) in kun\'yomi, meaning to drink or swallow liquids. Its polite form is 飲みます (nomimasu).`,
    grammarNotes: ['Godan Verb (五段)', 'JLPT N5 Core', 'Kun\'yomi Reading'],
    xp: 15,
  });

  // Question 3: Meaning from sentence
  const hon = pool.find((w) => w.id === 'hon') || CURATED_VOCABULARY[2];
  questions.push({
    id: 'q-hon-meaning',
    wordId: hon.id,
    type: 'meaning',
    prompt: 'Select the English meaning of the noun 「本」 in this context:',
    japanesePrompt: {
      sentence: '図書館で面白い日本の本を借りました。',
      furigana: 'としょかんで おもしろい にほんの ほんを かりました。',
      highlighted: '本',
      accentNote: 'Pitch Accent: [HO-n] (Atamadaka)',
    },
    audioSentence: '図書館で日本の本を借りました。',
    options: [
      { id: 'A', text: 'Book / Volume', subtext: 'Reading: ほん (hon)' },
      { id: 'B', text: 'Water', subtext: 'Reading: みず (mizu)' },
      { id: 'C', text: 'Friend', subtext: 'Reading: ともだち (tomodachi)' },
      { id: 'D', text: 'Building / Library', subtext: 'Reading: としょかん (toshokan)' },
    ],
    correctOptionId: 'A',
    explanation: '「本」 (hon) means "book" as a standalone noun. Notice how it is modified by 日本の (Japanese) in the sentence.',
    grammarNotes: ['Noun (名詞)', 'JLPT N5 Essential', 'Atamadaka Accent'],
    xp: 15,
  });

  // Question 4: Irregular te-form / destination particle
  const iku = pool.find((w) => w.id === 'iku') || CURATED_VOCABULARY[3];
  questions.push({
    id: 'q-iku-particle',
    wordId: iku.id,
    type: 'conjugation',
    prompt: 'Which sentence correctly uses 「行く」 (to go) in the polite non-past tense?',
    japanesePrompt: {
      sentence: '来週、友だちと京都へ行きます。',
      furigana: 'らいしゅう、ともだちと きょうとへ いきます。',
      highlighted: '行きます',
      accentNote: 'Direction particle へ (pronounced "e") + 行きます',
    },
    audioSentence: '来週、友だちと京都へ行きます。',
    options: [
      { id: 'A', text: '来週、友だちと京都へ行きます。', subtext: 'I will go to Kyoto next week with a friend.' },
      { id: 'B', text: '来週、友だちと京都へ飲みます。', subtext: 'Incorrect verb: 飲みます (will drink)' },
      { id: 'C', text: '来週、友だちと京都へ食べました。', subtext: 'Incorrect verb & past tense' },
      { id: 'D', text: '来週、友だちと京都へ行きますか？', subtext: 'Question form, not affirmative statement' },
    ],
    correctOptionId: 'A',
    explanation: '「行きます」 (ikimasu) is the polite non-past affirmative form of 行く (to go). It pairs with the direction particle へ (e) or に (ni).',
    grammarNotes: ['Direction Particle へ', 'Polite Non-Past Form', 'Godan Verb'],
    xp: 15,
  });

  // Question 5: i-adjective
  questions.push({
    id: 'q-oishii-adj',
    wordId: 'oishii',
    type: 'meaning',
    prompt: 'What does the i-adjective 「美味しい」 mean?',
    japanesePrompt: {
      sentence: 'このラーメンのスープはとても美味しいです。',
      furigana: 'この ラーメンの スープは とても おいしいです。',
      highlighted: '美味しい',
      accentNote: 'Nakadaka pattern [3] • い-Adjective',
    },
    audioSentence: 'このラーメンのスープはとても美味しいです。',
    options: [
      { id: 'A', text: 'Spicy / Hot', subtext: 'Japanese: からい (karai)' },
      { id: 'B', text: 'Expensive', subtext: 'Japanese: たかい (takai)' },
      { id: 'C', text: 'Delicious / Tasty', subtext: 'Japanese: おいしい (oishii)' },
      { id: 'D', text: 'Cold', subtext: 'Japanese: つめたい (tsumetai)' },
    ],
    correctOptionId: 'C',
    explanation: '「美味しい」 (oishii) means delicious or tasty. Its negative form is 美味しくない (oishikunai) and past form is 美味しかった (oishikatta).',
    grammarNotes: ['i-Adjective (い形容詞)', 'JLPT N5 Core', 'Food & Dining'],
    xp: 15,
  });

  return questions.slice(0, count);
}
