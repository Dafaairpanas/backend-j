import { supabase } from '../config/supabase';

/**
 * Seed database with initial data
 */

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Seed Hiragana
    await seedHiragana();

    // Seed Katakana
    await seedKatakana();

    // Seed sample Kanji N5
    await seedKanji();

    // Seed sample Vocabulary
    await seedVocabulary();

    // Seed sample Grammar
    await seedGrammar();

    // Seed Roadmap
    await seedRoadmap();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

async function seedHiragana() {
  console.log('📝 Seeding Hiragana...');

  const basicHiragana = [
    // Vowels
    { character: 'あ', romaji: 'a', type: 'basic', order_index: 1, example_word: 'あめ', example_meaning: 'rain' },
    { character: 'い', romaji: 'i', type: 'basic', order_index: 2, example_word: 'いぬ', example_meaning: 'dog' },
    { character: 'う', romaji: 'u', type: 'basic', order_index: 3, example_word: 'うみ', example_meaning: 'sea' },
    { character: 'え', romaji: 'e', type: 'basic', order_index: 4, example_word: 'えき', example_meaning: 'station' },
    { character: 'お', romaji: 'o', type: 'basic', order_index: 5, example_word: 'おに', example_meaning: 'demon' },
    // K-row
    { character: 'か', romaji: 'ka', type: 'basic', order_index: 6, example_word: 'かわ', example_meaning: 'river' },
    { character: 'き', romaji: 'ki', type: 'basic', order_index: 7, example_word: 'きく', example_meaning: 'chrysanthemum' },
    { character: 'く', romaji: 'ku', type: 'basic', order_index: 8, example_word: 'くも', example_meaning: 'cloud' },
    { character: 'け', romaji: 'ke', type: 'basic', order_index: 9, example_word: 'けむり', example_meaning: 'smoke' },
    { character: 'こ', romaji: 'ko', type: 'basic', order_index: 10, example_word: 'こい', example_meaning: 'carp' },
    // S-row
    { character: 'さ', romaji: 'sa', type: 'basic', order_index: 11, example_word: 'さかな', example_meaning: 'fish' },
    { character: 'し', romaji: 'shi', type: 'basic', order_index: 12, example_word: 'しお', example_meaning: 'salt' },
    { character: 'す', romaji: 'su', type: 'basic', order_index: 13, example_word: 'すし', example_meaning: 'sushi' },
    { character: 'せ', romaji: 'se', type: 'basic', order_index: 14, example_word: 'せかい', example_meaning: 'world' },
    { character: 'そ', romaji: 'so', type: 'basic', order_index: 15, example_word: 'そら', example_meaning: 'sky' },
    // T-row
    { character: 'た', romaji: 'ta', type: 'basic', order_index: 16, example_word: 'たべる', example_meaning: 'to eat' },
    { character: 'ち', romaji: 'chi', type: 'basic', order_index: 17, example_word: 'ちず', example_meaning: 'map' },
    { character: 'つ', romaji: 'tsu', type: 'basic', order_index: 18, example_word: 'つき', example_meaning: 'moon' },
    { character: 'て', romaji: 'te', type: 'basic', order_index: 19, example_word: 'てがみ', example_meaning: 'letter' },
    { character: 'と', romaji: 'to', type: 'basic', order_index: 20, example_word: 'とり', example_meaning: 'bird' },
    // N-row
    { character: 'な', romaji: 'na', type: 'basic', order_index: 21, example_word: 'なつ', example_meaning: 'summer' },
    { character: 'に', romaji: 'ni', type: 'basic', order_index: 22, example_word: 'にく', example_meaning: 'meat' },
    { character: 'ぬ', romaji: 'nu', type: 'basic', order_index: 23, example_word: 'ぬの', example_meaning: 'cloth' },
    { character: 'ね', romaji: 'ne', type: 'basic', order_index: 24, example_word: 'ねこ', example_meaning: 'cat' },
    { character: 'の', romaji: 'no', type: 'basic', order_index: 25, example_word: 'のり', example_meaning: 'seaweed' },
    // H-row
    { character: 'は', romaji: 'ha', type: 'basic', order_index: 26, example_word: 'はな', example_meaning: 'flower' },
    { character: 'ひ', romaji: 'hi', type: 'basic', order_index: 27, example_word: 'ひと', example_meaning: 'person' },
    { character: 'ふ', romaji: 'fu', type: 'basic', order_index: 28, example_word: 'ふね', example_meaning: 'ship' },
    { character: 'へ', romaji: 'he', type: 'basic', order_index: 29, example_word: 'へや', example_meaning: 'room' },
    { character: 'ほ', romaji: 'ho', type: 'basic', order_index: 30, example_word: 'ほし', example_meaning: 'star' },
    // M-row
    { character: 'ま', romaji: 'ma', type: 'basic', order_index: 31, example_word: 'まど', example_meaning: 'window' },
    { character: 'み', romaji: 'mi', type: 'basic', order_index: 32, example_word: 'みず', example_meaning: 'water' },
    { character: 'む', romaji: 'mu', type: 'basic', order_index: 33, example_word: 'むし', example_meaning: 'insect' },
    { character: 'め', romaji: 'me', type: 'basic', order_index: 34, example_word: 'め', example_meaning: 'eye' },
    { character: 'も', romaji: 'mo', type: 'basic', order_index: 35, example_word: 'もり', example_meaning: 'forest' },
    // Y-row
    { character: 'や', romaji: 'ya', type: 'basic', order_index: 36, example_word: 'やま', example_meaning: 'mountain' },
    { character: 'ゆ', romaji: 'yu', type: 'basic', order_index: 37, example_word: 'ゆき', example_meaning: 'snow' },
    { character: 'よ', romaji: 'yo', type: 'basic', order_index: 38, example_word: 'よる', example_meaning: 'night' },
    // R-row
    { character: 'ら', romaji: 'ra', type: 'basic', order_index: 39, example_word: 'らいねん', example_meaning: 'next year' },
    { character: 'り', romaji: 'ri', type: 'basic', order_index: 40, example_word: 'りんご', example_meaning: 'apple' },
    { character: 'る', romaji: 'ru', type: 'basic', order_index: 41, example_word: 'るす', example_meaning: 'absence' },
    { character: 'れ', romaji: 're', type: 'basic', order_index: 42, example_word: 'れきし', example_meaning: 'history' },
    { character: 'ろ', romaji: 'ro', type: 'basic', order_index: 43, example_word: 'ろうか', example_meaning: 'corridor' },
    // W-row
    { character: 'わ', romaji: 'wa', type: 'basic', order_index: 44, example_word: 'わたし', example_meaning: 'I' },
    { character: 'を', romaji: 'wo', type: 'basic', order_index: 45, example_word: 'を', example_meaning: 'object marker' },
    // N
    { character: 'ん', romaji: 'n', type: 'basic', order_index: 46, example_word: 'にほん', example_meaning: 'Japan' },
  ];

  const dakuonHiragana = [
    { character: 'が', romaji: 'ga', type: 'dakuon', order_index: 47, example_word: 'がっこう', example_meaning: 'school' },
    { character: 'ぎ', romaji: 'gi', type: 'dakuon', order_index: 48, example_word: 'ぎんこう', example_meaning: 'bank' },
    { character: 'ぐ', romaji: 'gu', type: 'dakuon', order_index: 49, example_word: 'ぐあい', example_meaning: 'condition' },
    { character: 'げ', romaji: 'ge', type: 'dakuon', order_index: 50, example_word: 'げんき', example_meaning: 'healthy' },
    { character: 'ご', romaji: 'go', type: 'dakuon', order_index: 51, example_word: 'ごはん', example_meaning: 'rice/meal' },
    { character: 'ざ', romaji: 'za', type: 'dakuon', order_index: 52, example_word: 'ざっし', example_meaning: 'magazine' },
    { character: 'じ', romaji: 'ji', type: 'dakuon', order_index: 53, example_word: 'じかん', example_meaning: 'time' },
    { character: 'ず', romaji: 'zu', type: 'dakuon', order_index: 54, example_word: 'ずっと', example_meaning: 'always' },
    { character: 'ぜ', romaji: 'ze', type: 'dakuon', order_index: 55, example_word: 'ぜんぶ', example_meaning: 'all' },
    { character: 'ぞ', romaji: 'zo', type: 'dakuon', order_index: 56, example_word: 'ぞう', example_meaning: 'elephant' },
    { character: 'だ', romaji: 'da', type: 'dakuon', order_index: 57, example_word: 'だれ', example_meaning: 'who' },
    { character: 'ぢ', romaji: 'di', type: 'dakuon', order_index: 58, example_word: 'ちぢむ', example_meaning: 'shrink' },
    { character: 'づ', romaji: 'du', type: 'dakuon', order_index: 59, example_word: 'つづく', example_meaning: 'continue' },
    { character: 'で', romaji: 'de', type: 'dakuon', order_index: 60, example_word: 'でんわ', example_meaning: 'telephone' },
    { character: 'ど', romaji: 'do', type: 'dakuon', order_index: 61, example_word: 'どこ', example_meaning: 'where' },
    { character: 'ば', romaji: 'ba', type: 'dakuon', order_index: 62, example_word: 'ばしょ', example_meaning: 'place' },
    { character: 'び', romaji: 'bi', type: 'dakuon', order_index: 63, example_word: 'びょうき', example_meaning: 'illness' },
    { character: 'ぶ', romaji: 'bu', type: 'dakuon', order_index: 64, example_word: 'ぶた', example_meaning: 'pig' },
    { character: 'べ', romaji: 'be', type: 'dakuon', order_index: 65, example_word: 'べんり', example_meaning: 'convenient' },
    { character: 'ぼ', romaji: 'bo', type: 'dakuon', order_index: 66, example_word: 'ぼうし', example_meaning: 'hat' },
  ];

  const handakuonHiragana = [
    { character: 'ぱ', romaji: 'pa', type: 'handakuon', order_index: 67, example_word: 'ぱん', example_meaning: 'bread' },
    { character: 'ぴ', romaji: 'pi', type: 'handakuon', order_index: 68, example_word: 'ぴんく', example_meaning: 'pink' },
    { character: 'ぷ', romaji: 'pu', type: 'handakuon', order_index: 69, example_word: 'ぷーる', example_meaning: 'pool' },
    { character: 'ぺ', romaji: 'pe', type: 'handakuon', order_index: 70, example_word: 'ぺん', example_meaning: 'pen' },
    { character: 'ぽ', romaji: 'po', type: 'handakuon', order_index: 71, example_word: 'ぽすと', example_meaning: 'post' },
  ];

  const allHiragana = [...basicHiragana, ...dakuonHiragana, ...handakuonHiragana];

  const { error } = await supabase.from('hiragana').upsert(allHiragana, {
    onConflict: 'order_index',
  });

  if (error) throw error;
  console.log(`  ✓ Inserted ${allHiragana.length} hiragana characters`);
}

async function seedKatakana() {
  console.log('📝 Seeding Katakana...');

  const basicKatakana = [
    // Vowels
    { character: 'ア', romaji: 'a', type: 'basic', order_index: 1, example_word: 'アメリカ', example_meaning: 'America' },
    { character: 'イ', romaji: 'i', type: 'basic', order_index: 2, example_word: 'イギリス', example_meaning: 'England' },
    { character: 'ウ', romaji: 'u', type: 'basic', order_index: 3, example_word: 'ウイルス', example_meaning: 'virus' },
    { character: 'エ', romaji: 'e', type: 'basic', order_index: 4, example_word: 'エレベーター', example_meaning: 'elevator' },
    { character: 'オ', romaji: 'o', type: 'basic', order_index: 5, example_word: 'オレンジ', example_meaning: 'orange' },
    // K-row
    { character: 'カ', romaji: 'ka', type: 'basic', order_index: 6, example_word: 'カメラ', example_meaning: 'camera' },
    { character: 'キ', romaji: 'ki', type: 'basic', order_index: 7, example_word: 'キロ', example_meaning: 'kilo' },
    { character: 'ク', romaji: 'ku', type: 'basic', order_index: 8, example_word: 'クラス', example_meaning: 'class' },
    { character: 'ケ', romaji: 'ke', type: 'basic', order_index: 9, example_word: 'ケーキ', example_meaning: 'cake' },
    { character: 'コ', romaji: 'ko', type: 'basic', order_index: 10, example_word: 'コーヒー', example_meaning: 'coffee' },
    // S-row
    { character: 'サ', romaji: 'sa', type: 'basic', order_index: 11, example_word: 'サラダ', example_meaning: 'salad' },
    { character: 'シ', romaji: 'shi', type: 'basic', order_index: 12, example_word: 'シャツ', example_meaning: 'shirt' },
    { character: 'ス', romaji: 'su', type: 'basic', order_index: 13, example_word: 'スポーツ', example_meaning: 'sports' },
    { character: 'セ', romaji: 'se', type: 'basic', order_index: 14, example_word: 'セーター', example_meaning: 'sweater' },
    { character: 'ソ', romaji: 'so', type: 'basic', order_index: 15, example_word: 'ソファー', example_meaning: 'sofa' },
    // T-row
    { character: 'タ', romaji: 'ta', type: 'basic', order_index: 16, example_word: 'タクシー', example_meaning: 'taxi' },
    { character: 'チ', romaji: 'chi', type: 'basic', order_index: 17, example_word: 'チーズ', example_meaning: 'cheese' },
    { character: 'ツ', romaji: 'tsu', type: 'basic', order_index: 18, example_word: 'ツアー', example_meaning: 'tour' },
    { character: 'テ', romaji: 'te', type: 'basic', order_index: 19, example_word: 'テレビ', example_meaning: 'TV' },
    { character: 'ト', romaji: 'to', type: 'basic', order_index: 20, example_word: 'トイレ', example_meaning: 'toilet' },
    // Continue with other rows...
    { character: 'ナ', romaji: 'na', type: 'basic', order_index: 21, example_word: 'ナイフ', example_meaning: 'knife' },
    { character: 'ニ', romaji: 'ni', type: 'basic', order_index: 22, example_word: 'ニュース', example_meaning: 'news' },
    { character: 'ヌ', romaji: 'nu', type: 'basic', order_index: 23, example_word: 'ヌードル', example_meaning: 'noodle' },
    { character: 'ネ', romaji: 'ne', type: 'basic', order_index: 24, example_word: 'ネクタイ', example_meaning: 'necktie' },
    { character: 'ノ', romaji: 'no', type: 'basic', order_index: 25, example_word: 'ノート', example_meaning: 'notebook' },
    { character: 'ハ', romaji: 'ha', type: 'basic', order_index: 26, example_word: 'ハンバーガー', example_meaning: 'hamburger' },
    { character: 'ヒ', romaji: 'hi', type: 'basic', order_index: 27, example_word: 'ヒーター', example_meaning: 'heater' },
    { character: 'フ', romaji: 'fu', type: 'basic', order_index: 28, example_word: 'フランス', example_meaning: 'France' },
    { character: 'ヘ', romaji: 'he', type: 'basic', order_index: 29, example_word: 'ヘリコプター', example_meaning: 'helicopter' },
    { character: 'ホ', romaji: 'ho', type: 'basic', order_index: 30, example_word: 'ホテル', example_meaning: 'hotel' },
    { character: 'マ', romaji: 'ma', type: 'basic', order_index: 31, example_word: 'マンゴー', example_meaning: 'mango' },
    { character: 'ミ', romaji: 'mi', type: 'basic', order_index: 32, example_word: 'ミルク', example_meaning: 'milk' },
    { character: 'ム', romaji: 'mu', type: 'basic', order_index: 33, example_word: 'ムービー', example_meaning: 'movie' },
    { character: 'メ', romaji: 'me', type: 'basic', order_index: 34, example_word: 'メニュー', example_meaning: 'menu' },
    { character: 'モ', romaji: 'mo', type: 'basic', order_index: 35, example_word: 'モダン', example_meaning: 'modern' },
    { character: 'ヤ', romaji: 'ya', type: 'basic', order_index: 36, example_word: 'ヤード', example_meaning: 'yard' },
    { character: 'ユ', romaji: 'yu', type: 'basic', order_index: 37, example_word: 'ユーザー', example_meaning: 'user' },
    { character: 'ヨ', romaji: 'yo', type: 'basic', order_index: 38, example_word: 'ヨーグルト', example_meaning: 'yogurt' },
    { character: 'ラ', romaji: 'ra', type: 'basic', order_index: 39, example_word: 'ラーメン', example_meaning: 'ramen' },
    { character: 'リ', romaji: 'ri', type: 'basic', order_index: 40, example_word: 'リモコン', example_meaning: 'remote' },
    { character: 'ル', romaji: 'ru', type: 'basic', order_index: 41, example_word: 'ルール', example_meaning: 'rule' },
    { character: 'レ', romaji: 're', type: 'basic', order_index: 42, example_word: 'レストラン', example_meaning: 'restaurant' },
    { character: 'ロ', romaji: 'ro', type: 'basic', order_index: 43, example_word: 'ロボット', example_meaning: 'robot' },
    { character: 'ワ', romaji: 'wa', type: 'basic', order_index: 44, example_word: 'ワイン', example_meaning: 'wine' },
    { character: 'ヲ', romaji: 'wo', type: 'basic', order_index: 45, example_word: 'ヲ', example_meaning: 'object marker' },
    { character: 'ン', romaji: 'n', type: 'basic', order_index: 46, example_word: 'パン', example_meaning: 'bread' },
  ];

  const { error } = await supabase.from('katakana').upsert(basicKatakana, {
    onConflict: 'order_index',
  });

  if (error) throw error;
  console.log(`  ✓ Inserted ${basicKatakana.length} katakana characters`);
}

async function seedKanji() {
  console.log('📝 Seeding Kanji (N5 sample)...');

  const kanjiN5 = [
    {
      character: '日',
      meaning: 'day, sun',
      kunyomi: 'ひ, -び, -か',
      onyomi: 'ニチ, ジツ',
      level: 'N5',
      stroke_count: 4,
      radical: '日',
      jlpt_order: 1,
      examples: [
        { word: '日本', reading: 'にほん', meaning: 'Japan' },
        { word: '今日', reading: 'きょう', meaning: 'today' },
        { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' },
      ],
      mnemonic: 'Looks like a window with a sunrise',
    },
    {
      character: '月',
      meaning: 'month, moon',
      kunyomi: 'つき',
      onyomi: 'ゲツ, ガツ',
      level: 'N5',
      stroke_count: 4,
      radical: '月',
      jlpt_order: 2,
      examples: [
        { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
        { word: '一月', reading: 'いちがつ', meaning: 'January' },
      ],
      mnemonic: 'Crescent moon shape',
    },
    {
      character: '火',
      meaning: 'fire',
      kunyomi: 'ひ, -び',
      onyomi: 'カ',
      level: 'N5',
      stroke_count: 4,
      radical: '火',
      jlpt_order: 3,
      examples: [
        { word: '火曜日', reading: 'かようび', meaning: 'Tuesday' },
        { word: '花火', reading: 'はなび', meaning: 'fireworks' },
      ],
      mnemonic: 'Flames rising up',
    },
    {
      character: '水',
      meaning: 'water',
      kunyomi: 'みず',
      onyomi: 'スイ',
      level: 'N5',
      stroke_count: 4,
      radical: '水',
      jlpt_order: 4,
      examples: [
        { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
        { word: 'お水', reading: 'おみず', meaning: 'water' },
      ],
      mnemonic: 'Water droplets flowing',
    },
    {
      character: '木',
      meaning: 'tree, wood',
      kunyomi: 'き, こ',
      onyomi: 'ボク, モク',
      level: 'N5',
      stroke_count: 4,
      radical: '木',
      jlpt_order: 5,
      examples: [
        { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
        { word: '木', reading: 'き', meaning: 'tree' },
      ],
      mnemonic: 'A tree with branches',
    },
    {
      character: '金',
      meaning: 'gold, money',
      kunyomi: 'かね, かな',
      onyomi: 'キン, コン',
      level: 'N5',
      stroke_count: 8,
      radical: '金',
      jlpt_order: 6,
      examples: [
        { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
        { word: 'お金', reading: 'おかね', meaning: 'money' },
      ],
      mnemonic: 'Gold nuggets under a roof',
    },
    {
      character: '土',
      meaning: 'earth, soil',
      kunyomi: 'つち',
      onyomi: 'ド, ト',
      level: 'N5',
      stroke_count: 3,
      radical: '土',
      jlpt_order: 7,
      examples: [
        { word: '土曜日', reading: 'どようび', meaning: 'Saturday' },
        { word: '土', reading: 'つち', meaning: 'soil' },
      ],
      mnemonic: 'A plant growing from earth',
    },
    {
      character: '一',
      meaning: 'one',
      kunyomi: 'ひと',
      onyomi: 'イチ',
      level: 'N5',
      stroke_count: 1,
      radical: '一',
      jlpt_order: 8,
      examples: [
        { word: '一つ', reading: 'ひとつ', meaning: 'one thing' },
        { word: '一人', reading: 'ひとり', meaning: 'one person' },
      ],
      mnemonic: 'One horizontal line',
    },
    {
      character: '二',
      meaning: 'two',
      kunyomi: 'ふた',
      onyomi: 'ニ',
      level: 'N5',
      stroke_count: 2,
      radical: '二',
      jlpt_order: 9,
      examples: [
        { word: '二つ', reading: 'ふたつ', meaning: 'two things' },
        { word: '二人', reading: 'ふたり', meaning: 'two people' },
      ],
      mnemonic: 'Two horizontal lines',
    },
    {
      character: '三',
      meaning: 'three',
      kunyomi: 'み',
      onyomi: 'サン',
      level: 'N5',
      stroke_count: 3,
      radical: '三',
      jlpt_order: 10,
      examples: [
        { word: '三つ', reading: 'みっつ', meaning: 'three things' },
        { word: '三人', reading: 'さんにん', meaning: 'three people' },
      ],
      mnemonic: 'Three horizontal lines',
    },
  ];

  const { error } = await supabase.from('kanji').upsert(kanjiN5, {
    onConflict: 'jlpt_order',
  });

  if (error) throw error;
  console.log(`  ✓ Inserted ${kanjiN5.length} kanji characters`);
}

async function seedVocabulary() {
  console.log('📝 Seeding Vocabulary (N5 sample)...');

  const vocabN5 = [
    { word: 'こんにちは', reading: 'こんにちは', meaning: 'Hello', part_of_speech: 'greeting', level: 'N5', category: 'daily', example_sentence: 'こんにちは、お元気ですか？', example_translation: 'Hello, how are you?' },
    { word: 'ありがとう', reading: 'ありがとう', meaning: 'Thank you', part_of_speech: 'greeting', level: 'N5', category: 'daily', example_sentence: 'ありがとうございます。', example_translation: 'Thank you very much.' },
    { word: '水', reading: 'みず', meaning: 'Water', part_of_speech: 'noun', level: 'N5', category: 'food', example_sentence: '水を飲みます。', example_translation: 'I drink water.' },
    { word: '食べる', reading: 'たべる', meaning: 'To eat', part_of_speech: 'verb', level: 'N5', category: 'food', example_sentence: '朝ごはんを食べます。', example_translation: 'I eat breakfast.' },
    { word: '飲む', reading: 'のむ', meaning: 'To drink', part_of_speech: 'verb', level: 'N5', category: 'food', example_sentence: 'コーヒーを飲みます。', example_translation: 'I drink coffee.' },
    { word: '学校', reading: 'がっこう', meaning: 'School', part_of_speech: 'noun', level: 'N5', category: 'school', example_sentence: '学校に行きます。', example_translation: 'I go to school.' },
    { word: '先生', reading: 'せんせい', meaning: 'Teacher', part_of_speech: 'noun', level: 'N5', category: 'school', example_sentence: '先生は優しいです。', example_translation: 'The teacher is kind.' },
    { word: '本', reading: 'ほん', meaning: 'Book', part_of_speech: 'noun', level: 'N5', category: 'school', example_sentence: '本を読みます。', example_translation: 'I read a book.' },
    { word: '大きい', reading: 'おおきい', meaning: 'Big', part_of_speech: 'adjective', level: 'N5', category: 'daily', example_sentence: 'この家は大きいです。', example_translation: 'This house is big.' },
    { word: '小さい', reading: 'ちいさい', meaning: 'Small', part_of_speech: 'adjective', level: 'N5', category: 'daily', example_sentence: 'この犬は小さいです。', example_translation: 'This dog is small.' },
  ];

  const { error } = await supabase.from('vocabulary').upsert(vocabN5);

  if (error) throw error;
  console.log(`  ✓ Inserted ${vocabN5.length} vocabulary words`);
}

async function seedGrammar() {
  console.log('📝 Seeding Grammar (N5 sample)...');

  const grammarN5 = [
    {
      pattern: 'です',
      meaning: 'To be (polite)',
      explanation: 'This is the polite form of the copula, used to describe what something is. It comes at the end of sentences.',
      level: 'N5',
      structure: 'Noun + です',
      examples: [
        { japanese: '私は学生です。', romaji: 'Watashi wa gakusei desu.', english: 'I am a student.' },
        { japanese: 'これは本です。', romaji: 'Kore wa hon desu.', english: 'This is a book.' },
      ],
    },
    {
      pattern: 'は',
      meaning: 'Topic marker',
      explanation: 'The particle は (wa) marks the topic of a sentence. It tells us what the sentence is about.',
      level: 'N5',
      structure: 'Noun + は + comment',
      examples: [
        { japanese: '私は田中です。', romaji: 'Watashi wa Tanaka desu.', english: 'I am Tanaka.' },
        { japanese: '猫は可愛いです。', romaji: 'Neko wa kawaii desu.', english: 'Cats are cute.' },
      ],
    },
    {
      pattern: 'が',
      meaning: 'Subject marker',
      explanation: 'The particle が marks the grammatical subject of a sentence. It emphasizes what the subject is.',
      level: 'N5',
      structure: 'Noun + が + predicate',
      examples: [
        { japanese: '誰が来ましたか？', romaji: 'Dare ga kimashita ka?', english: 'Who came?' },
        { japanese: '水が欲しいです。', romaji: 'Mizu ga hoshii desu.', english: 'I want water.' },
      ],
    },
    {
      pattern: 'を',
      meaning: 'Object marker',
      explanation: 'The particle を marks the direct object of a verb. It shows what is receiving the action.',
      level: 'N5',
      structure: 'Object + を + Verb',
      examples: [
        { japanese: 'パンを食べます。', romaji: 'Pan wo tabemasu.', english: 'I eat bread.' },
        { japanese: '本を読みます。', romaji: 'Hon wo yomimasu.', english: 'I read a book.' },
      ],
    },
    {
      pattern: 'に',
      meaning: 'Direction/Time marker',
      explanation: 'The particle に indicates direction, time, or location where something exists.',
      level: 'N5',
      structure: 'Place/Time + に + Verb',
      examples: [
        { japanese: '学校に行きます。', romaji: 'Gakkou ni ikimasu.', english: 'I go to school.' },
        { japanese: '七時に起きます。', romaji: 'Shichi-ji ni okimasu.', english: 'I wake up at 7 o\'clock.' },
      ],
    },
  ];

  const { error } = await supabase.from('grammar').upsert(grammarN5);

  if (error) throw error;
  console.log(`  ✓ Inserted ${grammarN5.length} grammar patterns`);
}

async function seedRoadmap() {
  console.log('📝 Seeding Roadmap...');

  const n5Roadmap = [
    {
      level: 'N5',
      stage_number: 1,
      title: 'Hiragana Mastery',
      description: 'Learn all 46 basic hiragana characters. This is your first step to reading Japanese!',
      objectives: [
        'Recognize all basic hiragana',
        'Write hiragana from memory',
        'Read simple hiragana words',
      ],
      content_requirements: [
        { type: 'hiragana', count: 46 },
      ],
      estimated_hours: 10,
      order_index: 1,
    },
    {
      level: 'N5',
      stage_number: 2,
      title: 'Katakana Mastery',
      description: 'Learn all 46 basic katakana characters. Essential for reading loanwords and foreign names!',
      objectives: [
        'Recognize all basic katakana',
        'Write katakana from memory',
        'Read loanwords in katakana',
      ],
      content_requirements: [
        { type: 'katakana', count: 46 },
      ],
      estimated_hours: 10,
      order_index: 2,
    },
    {
      level: 'N5',
      stage_number: 3,
      title: 'Basic Kanji (1-20)',
      description: 'Start learning basic kanji. Focus on numbers, days, and common characters.',
      objectives: [
        'Learn first 20 N5 kanji',
        'Understand basic kanji readings',
        'Write simple kanji',
      ],
      content_requirements: [
        { type: 'kanji', count: 20 },
      ],
      estimated_hours: 15,
      order_index: 3,
    },
    {
      level: 'N5',
      stage_number: 4,
      title: 'Essential Vocabulary',
      description: 'Build your vocabulary with the most common Japanese words.',
      objectives: [
        'Learn 100 essential words',
        'Practice using words in context',
        'Understand word categories',
      ],
      content_requirements: [
        { type: 'vocabulary', count: 100 },
      ],
      estimated_hours: 20,
      order_index: 4,
    },
    {
      level: 'N5',
      stage_number: 5,
      title: 'Basic Grammar',
      description: 'Learn fundamental grammar patterns to form basic sentences.',
      objectives: [
        'Master basic particles (は, が, を, に)',
        'Learn polite form (です, ます)',
        'Form simple questions',
      ],
      content_requirements: [
        { type: 'grammar', count: 20 },
      ],
      estimated_hours: 25,
      order_index: 5,
    },
  ];

  const { error } = await supabase.from('roadmap_stages').upsert(n5Roadmap, {
    onConflict: 'order_index',
  });

  if (error) throw error;
  console.log(`  ✓ Inserted ${n5Roadmap.length} roadmap stages`);
}

// Run seed
seed();
