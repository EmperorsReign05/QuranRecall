export interface DuaPart {
  id: string;
  arabicText: string;
  arabicIndoPakText: string;
  translationText: string;
  transliteration?: string;
}

export interface DuaQunootVersion {
  id: string;
  title: string;
  narrator: string;
  parts: DuaPart[];
}

export const DUA_QUNOOT_VERSIONS: Record<string, DuaQunootVersion> = {
  v1: {
    id: "v1",
    title: "Dua Qunoot",
    narrator: "Abu Dawood, al-Tirmidhi",
    parts: [
      {
        id: "qunoot-v1:1",
        arabicText: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ",
        arabicIndoPakText: "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ",
        transliteration: "Allahumma ihdini feeman hadayt",
        translationText: "O Allah guide me among those You have guided",
      },
      {
        id: "qunoot-v1:2",
        arabicText: "وَعَافِنِي فِيمَنْ عَافَيْتَ",
        arabicIndoPakText: "وَعَافِنِي فِيمَنْ عَافَيْتَ",
        transliteration: "wa a’fini fiman afait",
        translationText: "pardon me among those You have pardoned",
      },
      {
        id: "qunoot-v1:3",
        arabicText: "وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
        arabicIndoPakText: "وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ",
        transliteration: "wa tawallani fiman tawallait",
        translationText: "befriend me among those You have befriended",
      },
      {
        id: "qunoot-v1:4",
        arabicText: "وَبَارِكْ لِي فِيمَا أَعْطَيْتَ",
        arabicIndoPakText: "وَبَارِكْ لِي فِيمَا أَعْطَيْتَ",
        transliteration: "wa barik Li fima atait",
        translationText: "bless me in what You have granted",
      },
      {
        id: "qunoot-v1:5",
        arabicText: "وَقِنِي شَرَّ مَا قَضَيْتَ",
        arabicIndoPakText: "وَقِنِي شَرَّ مَا قَضَيْتَ",
        transliteration: "wa qini sharra ma qadait",
        translationText: "and save me from the evil that You decreed",
      },
      {
        id: "qunoot-v1:6",
        arabicText: "إِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ",
        arabicIndoPakText: "إِنَّكَ تَقْضِي وَلاَ يُقْضَى عَلَيْكَ",
        transliteration: "fa Innaka taqdi wa la yuqda Alaik",
        translationText: "Indeed You decree, and none can pass decree upon You",
      },
      {
        id: "qunoot-v1:7",
        arabicText: "وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ",
        arabicIndoPakText: "وَإِنَّهُ لاَ يَذِلُّ مَنْ وَالَيْتَ",
        transliteration: "wa innahu la yadhillu man walait",
        translationText: "indeed he is not humiliated whom You have befriended",
      },
      {
        id: "qunoot-v1:8",
        arabicText: "وَلاَ يَعِزُّ مَنْ عَادَيْتَ",
        arabicIndoPakText: "وَلاَ يَعِزُّ مَنْ عَادَيْتَ",
        transliteration: "wa la ya'izzu man 'adait",
        translationText: "and he is not honored whom You have taken as an enemy",
      },
      {
        id: "qunoot-v1:9",
        arabicText: "تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
        arabicIndoPakText: "تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
        transliteration: "tabarakta Rabbana wa ta’alait",
        translationText: "blessed are You our Lord and Exalted",
      },
    ],
  },
  v2: {
    id: "v2",
    title: "Dua Qunoot",
    narrator: "Al-Bayhaqi",
    parts: [
      {
        id: "qunoot-v2:1",
        arabicText: "اَللَّهُمَّ إنا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ",
        arabicIndoPakText: "اَللَّهُمَّ اِنَّا نَسۡتَعِيۡنُكَ وَنَسۡتَغْفِرُكَ",
        transliteration: "Allahumma inna nasta-eenoka wa nastaghfiruka",
        translationText: "O Allah! We invoke you for help, and beg for forgiveness",
      },
      {
        id: "qunoot-v2:2",
        arabicText: "وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ",
        arabicIndoPakText: "وَنُؤۡمِنُ بِكَ وَنَتَوَكَّلُ عَلَيۡكَ",
        transliteration: "wa nu’minu bika wa natawakkalu alaika",
        translationText: "and we believe in you and have trust in you",
      },
      {
        id: "qunoot-v2:3",
        arabicText: "وَنُثْنِئْ عَلَيْكَ الخَيْرَ",
        arabicIndoPakText: "وَنُثۡنِىۡ عَلَيۡكَ ٱلۡخَيۡرَ",
        transliteration: "wa nusni alaikal khair",
        translationText: "and we praise you, in the best way we can",
      },
      {
        id: "qunoot-v2:4",
        arabicText: "وَنَشْكُرُكَ وَلَا نَكْفُرُكَ",
        arabicIndoPakText: "وَنَشۡكُرُكَ وَلَا نَكۡفُرُكَ",
        transliteration: "wa nashkuruka wala nakfuruka",
        translationText: "and we thank you and we are not ungrateful to you",
      },
      {
        id: "qunoot-v2:5",
        arabicText: "وَنَخْلَعُ وَنَتْرُكُ مَنْ ئَّفْجُرُكَ",
        arabicIndoPakText: "وَنَخۡلَعُ وَنَتۡرُكُ مَنۡ يَّفۡجُرُكَ",
        transliteration: "wa nakhla-oo wa natruku mai yafjuruka",
        translationText: "and we forsake and turn away from the one who disobeys you",
      },
      {
        id: "qunoot-v2:6",
        arabicText: "اَللَّهُمَّ إِيَّاكَ نَعْبُدُ",
        arabicIndoPakText: "اَللَّهُمَّ اِيَّاكَ نَعۡبُدُ",
        transliteration: "Allah humma iyyaka na’budu",
        translationText: "O Allah! We worship you",
      },
      {
        id: "qunoot-v2:7",
        arabicText: "وَلَكَ نُصَلِّئ وَنَسْجُدُ",
        arabicIndoPakText: "وَلَكَ نُصَلِّئ وَنَسۡجُدُ",
        transliteration: "wa laka nusalli wa nasjud",
        translationText: "and prostrate ourselves before you",
      },
      {
        id: "qunoot-v2:8",
        arabicText: "وَإِلَيْكَ نَسْعأئ وَنَحْفِدُ",
        arabicIndoPakText: "وَاِلَيۡكَ نَسۡعٰى ونَحۡفِدُ",
        transliteration: "wa ilaika nas aaa wa nahfizu",
        translationText: "and we hasten towards you and serve you",
      },
      {
        id: "qunoot-v2:9",
        arabicText: "وَنَرْجُو رَحْمَتَكَ وَنَخْشآئ عَذَابَكَ",
        arabicIndoPakText: "ونَرۡجُوۡا رَحۡمَتَكَ وَنَخۡشٰى عَذَابَكَ",
        transliteration: "wa narju rahma taka wa nakhshaa azaabaka",
        translationText: "and we hope to receive your mercy and we dread your torment",
      },
      {
        id: "qunoot-v2:10",
        arabicText: "إِنَّ عَذَابَكَ بِالكُفَّارِ مُلْحَقٌ",
        arabicIndoPakText: "اِنَّ عَذَابَكَ بِالۡكُفَّارِ مُلۡحِقٌٌ",
        transliteration: "inna azaabaka bil kuffari mulhik",
        translationText: "Surely, the disbelievers shall incur your torment",
      },
    ],
  },
};
