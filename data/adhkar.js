// The dhikr lists. Kept as plain data so the screen stays about presentation.
//
// Each entry: a stable `id` (used as the storage key for its count), the Arabic
// text, a transliteration, a plain-English meaning, and how many times it's
// traditionally repeated.

export const TASBIH = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللهِ',
    latin: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    target: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Alhamdulillah',
    meaning: 'All praise is for Allah',
    target: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللهُ أَكْبَرُ',
    latin: 'Allahu akbar',
    meaning: 'Allah is the greatest',
    target: 34,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللهَ',
    latin: 'Astaghfirullah',
    meaning: 'I seek forgiveness from Allah',
    target: 100,
  },
  {
    id: 'subhanallah-wabihamdih',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    latin: 'SubhanAllahi wa bihamdih',
    meaning: 'Glory be to Allah, and praise be to Him',
    target: 100,
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    latin: 'La hawla wa la quwwata illa billah',
    meaning: 'There is no power nor strength except by Allah',
    target: 10,
  },
];

export const MORNING = [
  {
    id: 'morning-mulk',
    arabic:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    latin:
      'Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    meaning:
      'We have entered the morning and the dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, with no partner.',
    target: 1,
  },
  {
    id: 'morning-tawhid',
    arabic:
      'لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    latin:
      'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shayin qadir',
    meaning:
      'There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things.',
    target: 10,
  },
  {
    id: 'morning-hasbi',
    arabic: 'حَسْبِيَ اللهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ',
    latin: 'Hasbiyallahu la ilaha illa huwa, alayhi tawakkalt',
    meaning:
      'Allah is sufficient for me. There is no god but Him. In Him I put my trust.',
    target: 7,
  },
];

export const EVENING = [
  {
    id: 'evening-mulk',
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    latin:
      'Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    meaning:
      'We have entered the evening and the dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, with no partner.',
    target: 1,
  },
  {
    id: 'evening-tawhid',
    arabic:
      'لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    latin:
      'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shayin qadir',
    meaning:
      'There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things.',
    target: 10,
  },
  {
    id: 'evening-hasbi',
    arabic: 'حَسْبِيَ اللهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ',
    latin: 'Hasbiyallahu la ilaha illa huwa, alayhi tawakkalt',
    meaning:
      'Allah is sufficient for me. There is no god but Him. In Him I put my trust.',
    target: 7,
  },
];

export const SECTIONS = [
  { key: 'tasbih', label: 'Tasbih', items: TASBIH },
  { key: 'morning', label: 'Morning', items: MORNING },
  { key: 'evening', label: 'Evening', items: EVENING },
];
