// 鳥マスターデータベース
// 狼煙屋のモデルとなる鳥の詳細情報を管理

const birdsDatabase = [
    {
        id: "bird_001",
        name: "スズメ",
        scientificName: "Passer montanus",
        family: "スズメ科",
        size: "小型",
        habitat: "市街地、農村、森林の周辺",
        characteristics: {
            appearance: "茶色の羽毛に黒い斑点、頬に黒い模様",
            voice: "チュンチュン、ピヨピヨ",
            behavior: "群れを作る、地面で跳ねるように移動"
        },
        lifeStyle: {
            activity: "昼行性",
            diet: "雑食（種子、昆虫）",
            socialBehavior: "群居性",
            nestingHabits: "屋根の隙間や木の洞"
        },
        personality: {
            general: "好奇心旺盛、警戒心もある",
            humanInteraction: "人間の近くで生活、餌付けされることも",
            intelligence: "環境適応力が高い"
        },
        seasonalBehavior: {
            spring: "繁殖期、巣作り",
            summer: "子育て",
            autumn: "群れで行動",
            winter: "餌を求めて移動"
        },
        symbolism: {
            cultural: "身近な存在、庶民的",
            spiritual: "素朴さ、親しみやすさ"
        },
        noroshiyaTraits: {
            suitableTypes: ["好奇心旺盛でピュアタイプ"],
            smokingStyle: "軽やかで素早い",
            communicationStyle: "シンプルで分かりやすい"
        }
    },
    {
        id: "bird_002",
        name: "カラス",
        scientificName: "Corvus macrorhynchos",
        family: "カラス科",
        size: "大型",
        habitat: "市街地、森林、農地",
        characteristics: {
            appearance: "全身黒い羽毛、太いくちばし",
            voice: "カーカー、ガーガー",
            behavior: "知能が高い、道具を使う"
        },
        lifeStyle: {
            activity: "昼行性",
            diet: "雑食（何でも食べる）",
            socialBehavior: "群居性、縄張り意識強い",
            nestingHabits: "高い木の上"
        },
        personality: {
            general: "賢い、用心深い、記憶力が良い",
            humanInteraction: "人間を観察、顔を覚える",
            intelligence: "非常に高い、問題解決能力あり"
        },
        seasonalBehavior: {
            spring: "繁殖期、縄張り防衛",
            summer: "子育て",
            autumn: "若鳥の独立",
            winter: "集団ねぐら"
        },
        symbolism: {
            cultural: "知恵、不吉（地域による）",
            spiritual: "メッセンジャー、変化の前兆"
        },
        noroshiyaTraits: {
            suitableTypes: ["心配性の少しオタクタイプ"],
            smokingStyle: "計画的で効率的",
            communicationStyle: "複雑で暗号的"
        }
    },
    {
        id: "bird_003",
        name: "ハト",
        scientificName: "Columba livia",
        family: "ハト科",
        size: "中型",
        habitat: "市街地、公園、駅",
        characteristics: {
            appearance: "灰色の体、虹色に光る首元",
            voice: "クルックー、ポッポー",
            behavior: "歩く時に首を振る"
        },
        lifeStyle: {
            activity: "昼行性",
            diet: "種子食",
            socialBehavior: "群居性",
            nestingHabits: "建物の隙間、橋の下"
        },
        personality: {
            general: "のんびり、マイペース",
            humanInteraction: "人を恐れない",
            intelligence: "帰巣本能が強い"
        },
        seasonalBehavior: {
            spring: "繁殖期",
            summer: "日陰を好む",
            autumn: "餌を蓄える",
            winter: "日向ぼっこ"
        },
        symbolism: {
            cultural: "平和の象徴",
            spiritual: "メッセージの運び手"
        },
        noroshiyaTraits: {
            suitableTypes: ["ちょっとめんどくさいけど愛着の湧くタイプ"],
            smokingStyle: "ゆったりとマイペース",
            communicationStyle: "繰り返しが多い"
        }
    },
    {
        id: "bird_004",
        name: "メジロ",
        scientificName: "Zosterops japonicus",
        family: "メジロ科",
        size: "小型",
        habitat: "森林、公園、庭園",
        characteristics: {
            appearance: "緑色の体、目の周りに白い輪",
            voice: "チーチー、細く美しい声",
            behavior: "花の蜜を好む、逆さまにぶら下がる"
        },
        lifeStyle: {
            activity: "昼行性",
            diet: "蜜食、果実、昆虫",
            socialBehavior: "小群で行動",
            nestingHabits: "木の枝にカップ状の巣"
        },
        personality: {
            general: "活発、器用",
            humanInteraction: "警戒心はあるが観察可能",
            intelligence: "機敏で適応力がある"
        },
        seasonalBehavior: {
            spring: "梅や桜の蜜を求める",
            summer: "昆虫を多く食べる",
            autumn: "果実を食べる",
            winter: "暖かい地域へ移動することも"
        },
        symbolism: {
            cultural: "春の訪れ、美しさ",
            spiritual: "繊細さ、純粋さ"
        },
        noroshiyaTraits: {
            suitableTypes: ["芸術家タイプ（未設定）"],
            smokingStyle: "優雅で美しい",
            communicationStyle: "詩的で繊細"
        }
    },
    {
        id: "bird_005",
        name: "フクロウ",
        scientificName: "Strix uralensis",
        family: "フクロウ科",
        size: "中型〜大型",
        habitat: "森林、里山",
        characteristics: {
            appearance: "丸い顔、大きな目、茶褐色の羽毛",
            voice: "ホーホー、低い声",
            behavior: "夜行性、音もなく飛ぶ"
        },
        lifeStyle: {
            activity: "夜行性",
            diet: "肉食（小動物）",
            socialBehavior: "単独行動",
            nestingHabits: "木の洞、古い建物"
        },
        personality: {
            general: "静かで観察力が鋭い",
            humanInteraction: "人を避ける傾向",
            intelligence: "優れた聴覚と視覚"
        },
        seasonalBehavior: {
            spring: "繁殖期、縄張り宣言",
            summer: "子育て",
            autumn: "若鳥の巣立ち",
            winter: "狩りに専念"
        },
        symbolism: {
            cultural: "知恵、学問の象徴",
            spiritual: "夜の守護者、秘密の知識"
        },
        noroshiyaTraits: {
            suitableTypes: ["夜型の哲学者タイプ（未設定）"],
            smokingStyle: "静かで神秘的",
            communicationStyle: "深遠で謎めいている"
        }
    }
];

// データベース操作関数
const BirdsDB = {
    // 全ての鳥データを取得
    getAll() {
        return birdsDatabase;
    },

    // IDで特定の鳥を取得
    getById(birdId) {
        return birdsDatabase.find(bird => bird.id === birdId);
    },

    // 名前で検索
    getByName(name) {
        return birdsDatabase.find(bird => bird.name === name);
    },

    // タイプに適した鳥を検索
    getBySuitableType(type) {
        return birdsDatabase.filter(bird => 
            bird.noroshiyaTraits.suitableTypes.includes(type)
        );
    },

    // サイズで絞り込み
    getBySize(size) {
        return birdsDatabase.filter(bird => bird.size === size);
    },

    // 活動時間で絞り込み
    getByActivity(activity) {
        return birdsDatabase.filter(bird => 
            bird.lifeStyle.activity === activity
        );
    }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { birdsDatabase, BirdsDB };
}