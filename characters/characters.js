// 狼煙屋キャラクターデータ
let characters = [
    {
        id: 1,
        name: "ピヨマル",
        type: "好奇心旺盛でピュアタイプ",
        birdType: "スズメ",
        appearance: "小柄で丸みを帯びた体型、茶色の羽毛に白い斑点",
        personality: "好奇心旺盛で素直、新しいものに興味津々",
        catchphrase: "ピヨピヨ！ナニソレ、オモシロソウ！",
        background: "街の屋根裏で生まれ、人間の生活に興味を持って狼煙屋になった",
        noroshiPlace: "東の丘の頂上",
        specialSkill: "朝一番に起きて誰よりも早く狼煙を上げる",
        description: "いつも元気いっぱいで、新しいメッセージが来るとピヨピヨと飛び跳ねる"
    },
    {
        id: 2,
        name: "フクロウジ",
        type: "心配性の少しオタクタイプ",
        birdType: "フクロウ",
        appearance: "丸い大きな目、グレーの羽毛、眼鏡をかけている",
        personality: "慎重で心配性、でも知識豊富で頼りになる",
        catchphrase: "ホーホー、ダイジョウブカナ？モウイッカイカクニンシヨウ",
        background: "古い図書館で育ち、本から得た知識で狼煙の技術を習得",
        noroshiPlace: "西の森の大木の上",
        specialSkill: "夜でも正確に狼煙を読み取れる夜目",
        description: "メッセージを何度も確認してから送る慎重派、でも一度信頼すると献身的"
    },
    {
        id: 3,
        name: "カラスケ",
        type: "ちょっとめんどくさいけど愛着の湧くタイプ",
        birdType: "カラス",
        appearance: "黒い羽毛、少し大きめの体格、片目をウインクすることが多い",
        personality: "ひねくれ者だけど実は優しい、ツンデレ気質",
        catchphrase: "カーカー、ベツニアンタノタメジャナイカラネ",
        background: "都会で生まれ育ち、人間に対して複雑な感情を持ちながら狼煙屋に",
        noroshiPlace: "北の廃墟の塔",
        specialSkill: "暗号化した狼煙を送れる（本人曰く「プライバシー重視」）",
        description: "文句を言いながらも誰よりも早くメッセージを届けてくれる"
    },
    {
        id: 4,
        name: "ハトポッポ",
        type: "のんびり屋でマイペースタイプ",
        birdType: "ハト",
        appearance: "白と灰色の羽毛、ぽっちゃり体型、いつも眠そうな目",
        personality: "のんびり屋で平和主義、争いを好まない",
        catchphrase: "ポッポー、マァマァ、ユックリイコウヨ",
        background: "公園で平和に暮らしていたが、人々をつなぐ仕事に魅力を感じて狼煙屋に",
        noroshiPlace: "南の広場の噴水近く",
        specialSkill: "どんなに急いでいる人も落ち着かせる癒しの狼煙",
        description: "ゆっくりだけど確実にメッセージを届ける、みんなの癒し系"
    },
    {
        id: 5,
        name: "ツバクロウ",
        type: "スピード重視のせっかちタイプ",
        birdType: "ツバメ",
        appearance: "スリムな体型、紺色の羽毛に白い腹部、長い尾羽",
        personality: "せっかちでスピード重視、効率を何より大切にする",
        catchphrase: "ピューッ！ハヤクハヤク、ジカンガモッタイナイ！",
        background: "渡り鳥として世界中を旅し、最速の通信手段として狼煙屋になることを決意",
        noroshiPlace: "風の通り道になっている峡谷",
        specialSkill: "どんな天候でも最速で狼煙を届ける",
        description: "とにかく速い！でも時々速すぎて狼煙が読みにくいことも"
    }
];

// ローカルストレージからデータを読み込む
function loadCharacters() {
    const saved = localStorage.getItem('noroshiya-characters');
    if (saved) {
        characters = JSON.parse(saved);
    }
}

// ローカルストレージにデータを保存
function saveCharacters() {
    localStorage.setItem('noroshiya-characters', JSON.stringify(characters));
}

// キャラクターカードを表示
function displayCharacters() {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = '';
    
    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.onclick = () => showCharacterDetail(char.id);
        
        card.innerHTML = `
            <div class="character-name">${char.name}</div>
            <div class="character-type">${char.type}</div>
            <div class="character-description">${char.description}</div>
        `;
        
        grid.appendChild(card);
    });
}

// キャラクター詳細モーダルを表示
function showCharacterDetail(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    
    const modal = document.getElementById('characterModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div id="detailView">
            <h2>${char.name}</h2>
            
            <div class="detail-section">
                <h3>基本情報</h3>
                <p><strong>タイプ:</strong> ${char.type}</p>
                <p><strong>鳥の種類:</strong> ${char.birdType}</p>
                <p><strong>口癖:</strong> ${char.catchphrase}</p>
            </div>
            
            <div class="detail-section">
                <h3>外見</h3>
                <p>${char.appearance}</p>
            </div>
            
            <div class="detail-section">
                <h3>性格</h3>
                <p>${char.personality}</p>
            </div>
            
            <div class="detail-section">
                <h3>背景</h3>
                <p>${char.background}</p>
            </div>
            
            <div class="detail-section">
                <h3>狼煙場</h3>
                <p>${char.noroshiPlace}</p>
            </div>
            
            <div class="detail-section">
                <h3>特技</h3>
                <p>${char.specialSkill}</p>
            </div>
            
            <button class="edit-button" onclick="editCharacter(${char.id})">編集</button>
        </div>
        
        <div id="editView" class="edit-form">
            <h2>キャラクター編集</h2>
            <form onsubmit="saveCharacterEdit(event, ${char.id})">
                <div class="form-group">
                    <label>名前</label>
                    <input type="text" id="editName" value="${char.name}" required>
                </div>
                
                <div class="form-group">
                    <label>タイプ</label>
                    <input type="text" id="editType" value="${char.type}" required>
                </div>
                
                <div class="form-group">
                    <label>鳥の種類</label>
                    <input type="text" id="editBirdType" value="${char.birdType}" required>
                </div>
                
                <div class="form-group">
                    <label>口癖</label>
                    <input type="text" id="editCatchphrase" value="${char.catchphrase}" required>
                </div>
                
                <div class="form-group">
                    <label>外見</label>
                    <textarea id="editAppearance" required>${char.appearance}</textarea>
                </div>
                
                <div class="form-group">
                    <label>性格</label>
                    <textarea id="editPersonality" required>${char.personality}</textarea>
                </div>
                
                <div class="form-group">
                    <label>背景</label>
                    <textarea id="editBackground" required>${char.background}</textarea>
                </div>
                
                <div class="form-group">
                    <label>狼煙場</label>
                    <input type="text" id="editNoroshiPlace" value="${char.noroshiPlace}" required>
                </div>
                
                <div class="form-group">
                    <label>特技</label>
                    <textarea id="editSpecialSkill" required>${char.specialSkill}</textarea>
                </div>
                
                <div class="form-group">
                    <label>説明</label>
                    <textarea id="editDescription" required>${char.description}</textarea>
                </div>
                
                <button type="submit" class="save-button">保存</button>
                <button type="button" class="cancel-button" onclick="cancelEdit()">キャンセル</button>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 編集モードに切り替え
function editCharacter(id) {
    document.getElementById('detailView').style.display = 'none';
    document.getElementById('editView').style.display = 'block';
}

// 編集をキャンセル
function cancelEdit() {
    document.getElementById('detailView').style.display = 'block';
    document.getElementById('editView').style.display = 'none';
}

// キャラクター編集を保存
function saveCharacterEdit(event, id) {
    event.preventDefault();
    
    const char = characters.find(c => c.id === id);
    if (!char) return;
    
    char.name = document.getElementById('editName').value;
    char.type = document.getElementById('editType').value;
    char.birdType = document.getElementById('editBirdType').value;
    char.catchphrase = document.getElementById('editCatchphrase').value;
    char.appearance = document.getElementById('editAppearance').value;
    char.personality = document.getElementById('editPersonality').value;
    char.background = document.getElementById('editBackground').value;
    char.noroshiPlace = document.getElementById('editNoroshiPlace').value;
    char.specialSkill = document.getElementById('editSpecialSkill').value;
    char.description = document.getElementById('editDescription').value;
    
    saveCharacters();
    displayCharacters();
    showCharacterDetail(id);
}

// 新しいキャラクターを追加
function addNewCharacter() {
    const newChar = {
        id: Date.now(),
        name: "新しい狼煙屋",
        type: "タイプ未設定",
        birdType: "鳥の種類",
        appearance: "外見の説明",
        personality: "性格の説明",
        catchphrase: "口癖",
        background: "背景ストーリー",
        noroshiPlace: "狼煙場の場所",
        specialSkill: "特技",
        description: "キャラクターの簡単な説明"
    };
    
    characters.push(newChar);
    saveCharacters();
    displayCharacters();
    showCharacterDetail(newChar.id);
    editCharacter(newChar.id);
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('characterModal').style.display = 'none';
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const modal = document.getElementById('characterModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// 初期化
loadCharacters();
displayCharacters();