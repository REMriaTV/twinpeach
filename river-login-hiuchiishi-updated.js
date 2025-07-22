// 更新されたマッチングロジック（river-login-hiuchiishi.html用）

// 火打石の色を抽出する関数
function extractStoneColors(description) {
    const colorKeywords = {
        '赤': ['赤い', '赤色', '紅', 'あか'],
        '透明': ['透明', '透き通', 'クリア', 'ガラス'],
        '白': ['白い', '白色', 'しろ'],
        '黒': ['黒い', '黒色', 'くろ'],
        '青': ['青い', '青色', 'あお'],
        '茶': ['茶色', '茶', 'ちゃ'],
        'オレンジ': ['オレンジ', '橙'],
        '緑': ['緑', 'みどり'],
        '紫': ['紫', 'むらさき'],
        '黄': ['黄色', '黄', 'きいろ']
    };
    
    const foundColors = [];
    const lowerDesc = description.toLowerCase();
    
    for (const [color, keywords] of Object.entries(colorKeywords)) {
        if (keywords.some(keyword => lowerDesc.includes(keyword))) {
            foundColors.push(color);
        }
    }
    
    return foundColors;
}

// 最適な狼煙屋を見つける（改良版）
async function findBestMatchNoroshiya(userDescription) {
    try {
        // Supabaseから狼煙屋データを取得
        const { data, error } = await supabase
            .from('noroshiya_characters')
            .select('*');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            console.log('狼煙屋データが見つかりません');
            return getDefaultNoroshiya(userDescription);
        }
        
        // ユーザーの入力から色を抽出
        const userColors = extractStoneColors(userDescription);
        console.log('検出された石の色:', userColors);
        
        // 各狼煙屋とのマッチングスコアを計算
        let bestMatch = null;
        let highestScore = 0;
        
        data.forEach(noroshiya => {
            let score = 0;
            
            // 石の色の好みでマッチング（最重要）
            if (noroshiya.stone_color_affinities && userColors.length > 0) {
                userColors.forEach(userColor => {
                    if (noroshiya.stone_color_affinities.includes(userColor)) {
                        score += 50; // 色のマッチは高得点
                    }
                });
            }
            
            // その他のキーワードでマッチング
            if (noroshiya.matching_keywords) {
                const keywords = Array.isArray(noroshiya.matching_keywords) 
                    ? noroshiya.matching_keywords 
                    : noroshiya.matching_keywords.split(/[、,\s]+/);
                    
                keywords.forEach(keyword => {
                    if (keyword && userDescription.includes(keyword)) {
                        score += 10;
                    }
                });
            }
            
            console.log(`${noroshiya.color_name}の狼煙屋: スコア ${score}`);
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = noroshiya;
            }
        });
        
        // スコアが0の場合はランダムに選択
        if (highestScore === 0) {
            console.log('マッチする狼煙屋が見つからないため、ランダムに選択');
            bestMatch = data[Math.floor(Math.random() * data.length)];
        }
        
        return bestMatch;
        
    } catch (error) {
        console.error('Supabase接続エラー:', error);
        return getDefaultNoroshiya(userDescription);
    }
}

// 狼煙屋を表示（改良版）
function showNoroshiya(noroshiyaData) {
    const entrance = document.getElementById('noroshiyaEntrance');
    
    if (noroshiyaData && noroshiyaData.color_name) {
        // 色の丸を表示（色見本として）
        const colorDot = `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${noroshiyaData.color_code}; border-radius: 50%; margin-right: 10px;"></span>`;
        
        // セリフを取得
        const greeting = noroshiyaData.dialogues?.hiuchiishi?.['初回出会い時'] || 'ヨロシク！';
        const finalMessage = noroshiyaData.dialogues?.hiuchiishi?.['再会時'] || 'マタ会オウ！';
        
        // 狼煙屋の説明
        const description = `${colorDot}${noroshiyaData.color_name}の狼煙屋`;
        
        document.getElementById('noroshiyaIcon').innerHTML = colorDot;
        document.getElementById('noroshiyaMessage').innerHTML = 
            `「${greeting}」<br><br>` +
            `${description}が現れた！<br><br>` +
            `「${finalMessage}」`;
        
        // データを保存
        localStorage.setItem('selectedNoroshiyaData', JSON.stringify(noroshiyaData));
    } else {
        // フォールバック処理
        defaultNoroshiyaDisplay();
    }
    
    entrance.style.display = 'block';
}

// デフォルトの狼煙屋表示
function defaultNoroshiyaDisplay() {
    const colors = [
        { name: '灰汁色', code: '#9e9478' },
        { name: '樺茶色', code: '#726250' },
        { name: '黄唐茶色', code: '#b98c46' }
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const colorDot = `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${randomColor.code}; border-radius: 50%; margin-right: 10px;"></span>`;
    
    document.getElementById('noroshiyaIcon').innerHTML = colorDot;
    document.getElementById('noroshiyaMessage').innerHTML = 
        `「オヤ、珍シイ石ダネ！」<br><br>` +
        `${colorDot}${randomColor.name}の狼煙屋が現れた！<br><br>` +
        `「一緒ニ行コウ！」`;
}