// 火打石マスターデータベース
// 狼煙屋との出会いに使われる火打石の詳細情報を管理

const stonesDatabase = [
    {
        id: "stone_001",
        name: "朝露石",
        type: "火打石",
        colors: ["透明", "薄い青"],
        size: "小さめ",
        shape: "丸みを帯びた",
        texture: "なめらか",
        origin: "川の上流",
        rarity: "common",
        characteristics: {
            appearance: "朝露のように透明感があり、光を当てると薄く青く光る",
            weight: "軽い",
            hardness: "中程度",
            specialFeatures: "朝日に当てると虹色に輝く"
        },
        elementalProperties: {
            element: "水",
            energy: "清涼",
            resonance: "高音域"
        },
        findingLocations: [
            "清流の浅瀬",
            "朝霧のかかる河原",
            "山の湧き水付近"
        ],
        matchingKeywords: [
            "きれい", "透明", "青い", "つるつる", "光る",
            "朝", "清らか", "澄んだ", "さわやか"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ピヨマル（スズメ）",
            matchReason: "純粋で清らかな性質が好奇心旺盛なタイプと相性が良い",
            specialReaction: "キラキラシテル！ボクノココロミタイ！"
        },
        folklore: {
            legend: "朝一番に川で見つけた石は幸運をもたらすという",
            usage: "清めの儀式に使われることがある"
        },
        photos: []
    },
    {
        id: "stone_002",
        name: "賢者の黒曜石",
        type: "火打石",
        colors: ["黒", "濃い灰色"],
        size: "中くらい",
        shape: "角ばった",
        texture: "ざらざら",
        origin: "山の中腹",
        rarity: "uncommon",
        characteristics: {
            appearance: "深い黒色で、表面に細かい結晶が見える",
            weight: "重い",
            hardness: "硬い",
            specialFeatures: "叩くと金属的な音がする"
        },
        elementalProperties: {
            element: "土",
            energy: "安定",
            resonance: "低音域"
        },
        findingLocations: [
            "古い岩場",
            "洞窟の入り口",
            "山道の脇"
        ],
        matchingKeywords: [
            "黒い", "重い", "ごつごつ", "硬い", "渋い",
            "落ち着いた", "しっかり", "頑丈", "古い"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ヨルノスケ（カラス）",
            matchReason: "知的で慎重な性質が心配性のタイプと相性が良い",
            specialReaction: "フム...イイセンスシテルジャナイカ"
        },
        folklore: {
            legend: "知恵を授ける石として古くから大切にされてきた",
            usage: "重要な決断の前に握ると良いとされる"
        },
        photos: []
    },
    {
        id: "stone_003",
        name: "のんびり雲石",
        type: "火打石",
        colors: ["白", "薄い灰色"],
        size: "大きめ",
        shape: "平たい",
        texture: "すべすべ",
        origin: "河原の中州",
        rarity: "common",
        characteristics: {
            appearance: "雲のような模様があり、持つと温かい",
            weight: "見た目より軽い",
            hardness: "柔らかめ",
            specialFeatures: "長時間日光に当たっていた石は特に温かい"
        },
        elementalProperties: {
            element: "風",
            energy: "穏やか",
            resonance: "中音域"
        },
        findingLocations: [
            "日当たりの良い河原",
            "広い川岸",
            "砂地の多い場所"
        ],
        matchingKeywords: [
            "白い", "温かい", "平べったい", "軽い", "雲みたい",
            "ふわふわ", "のんびり", "ゆったり", "穏やか"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ポッポロウ（ハト）",
            matchReason: "マイペースで温和な性質がめんどくさがりタイプと相性が良い",
            specialReaction: "アー、ナンカ ラクダナー"
        },
        folklore: {
            legend: "この石の上で昼寝をすると良い夢を見るという",
            usage: "枕元に置いて安眠のお守りにする"
        },
        photos: []
    },
    {
        id: "stone_004",
        name: "花蜜石",
        type: "火打石",
        colors: ["薄いピンク", "黄緑"],
        size: "小さめ",
        shape: "楕円形",
        texture: "つやつや",
        origin: "花の咲く川辺",
        rarity: "rare",
        characteristics: {
            appearance: "花びらのような模様があり、ほのかに甘い香りがする",
            weight: "とても軽い",
            hardness: "中程度",
            specialFeatures: "春になると色が鮮やかになる"
        },
        elementalProperties: {
            element: "花",
            energy: "華やか",
            resonance: "高音域"
        },
        findingLocations: [
            "花が咲く川岸",
            "蝶が集まる場所",
            "果樹園の近く"
        ],
        matchingKeywords: [
            "ピンク", "かわいい", "小さい", "きらきら", "甘い",
            "花", "春", "優しい", "美しい"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ミドリン（メジロ）",
            matchReason: "繊細で美しいものを愛する性質が芸術家タイプと相性が良い",
            specialReaction: "ワァ！ハナノカオリガスル！"
        },
        folklore: {
            legend: "恋する人が持つと想いが届くという言い伝えがある",
            usage: "大切な人への贈り物として"
        },
        photos: []
    },
    {
        id: "stone_005",
        name: "月影石",
        type: "火打石",
        colors: ["銀色", "薄い紫"],
        size: "中くらい",
        shape: "三日月形",
        texture: "ひんやり",
        origin: "夜の川原",
        rarity: "very_rare",
        characteristics: {
            appearance: "月光を浴びると薄く光り、表面に星のような斑点がある",
            weight: "不思議と重さが変わる",
            hardness: "硬い",
            specialFeatures: "満月の夜に最も美しく輝く"
        },
        elementalProperties: {
            element: "月",
            energy: "神秘",
            resonance: "超低音域"
        },
        findingLocations: [
            "月明かりの差す川原",
            "静かな夜の水辺",
            "霧の立ち込める場所"
        ],
        matchingKeywords: [
            "銀", "紫", "神秘的", "冷たい", "月",
            "夜", "静か", "不思議", "魔法"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ホウスケ（フクロウ）",
            matchReason: "夜の静寂と神秘を愛する性質が哲学者タイプと相性が良い",
            specialReaction: "...ツキノチカラヲカンジル"
        },
        folklore: {
            legend: "月の満ち欠けと共に力が変化するとされる",
            usage: "夜の瞑想や占いに使用される"
        },
        photos: []
    },
    {
        id: "stone_006",
        name: "虹色川石",
        type: "火打石",
        colors: ["虹色", "多色"],
        size: "様々",
        shape: "不規則",
        texture: "場所により異なる",
        origin: "急流の曲がり角",
        rarity: "uncommon",
        characteristics: {
            appearance: "角度によって様々な色に見え、一つとして同じものはない",
            weight: "中程度",
            hardness: "場所により異なる",
            specialFeatures: "水に濡れると色が鮮やかになる"
        },
        elementalProperties: {
            element: "虹",
            energy: "変化",
            resonance: "全音域"
        },
        findingLocations: [
            "激流の後の淀み",
            "滝壺の近く",
            "川の合流地点"
        ],
        matchingKeywords: [
            "カラフル", "虹", "いろいろ", "変わった", "面白い",
            "個性的", "特別", "ユニーク", "混ざった"
        ],
        noroshiyaAffinity: {
            primaryMatch: "ランダム（出会いの運命）",
            matchReason: "多様性を持つ石は、どの狼煙屋とも独特の関係を築く",
            specialReaction: "各狼煙屋が独自の反応を示す"
        },
        folklore: {
            legend: "七つの願いを叶える力があるという",
            usage: "人生の転機に拾うと良いとされる"
        },
        photos: []
    }
];

// データベース操作関数
const StonesDB = {
    // 全ての石データを取得
    getAll() {
        return stonesDatabase;
    },

    // IDで特定の石を取得
    getById(stoneId) {
        return stonesDatabase.find(stone => stone.id === stoneId);
    },

    // 名前で検索
    getByName(name) {
        return stonesDatabase.find(stone => stone.name === name);
    },

    // キーワードでマッチング（火打石ページで使用）
    findByKeywords(userInput) {
        const keywords = userInput.toLowerCase().split(/[\s、。]+/);
        let bestMatch = null;
        let highestScore = 0;

        stonesDatabase.forEach(stone => {
            let score = 0;
            keywords.forEach(keyword => {
                if (keyword && stone.matchingKeywords.some(k => k.includes(keyword))) {
                    score++;
                }
            });
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = stone;
            }
        });

        // スコアが0の場合はランダムな石を返す
        if (highestScore === 0) {
            const randomIndex = Math.floor(Math.random() * stonesDatabase.length);
            return stonesDatabase[randomIndex];
        }

        return bestMatch;
    },

    // レアリティで絞り込み
    getByRarity(rarity) {
        return stonesDatabase.filter(stone => stone.rarity === rarity);
    },

    // 色で検索
    getByColor(color) {
        return stonesDatabase.filter(stone => 
            stone.colors.some(c => c.includes(color))
        );
    },

    // 狼煙屋との相性で検索
    getByNoroshiya(noroshiyaName) {
        return stonesDatabase.filter(stone => 
            stone.noroshiyaAffinity.primaryMatch.includes(noroshiyaName)
        );
    }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stonesDatabase, StonesDB };
}