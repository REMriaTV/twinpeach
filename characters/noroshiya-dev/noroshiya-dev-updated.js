// 狼煙屋編集画面用の更新されたJavaScript（一部抜粋）

// キャラクターリスト表示（更新版）
function displayCharacterList() {
    const listEl = document.getElementById('characterList');
    listEl.innerHTML = '';
    
    characters.forEach(char => {
        const item = document.createElement('div');
        item.className = 'character-item';
        item.onclick = () => selectCharacter(char.id);
        if (char.id === currentCharacterId) {
            item.classList.add('active');
        }
        
        // 色の丸を表示
        const colorDot = `<span style="display: inline-block; width: 16px; height: 16px; background-color: ${char.color_code || '#999'}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span>`;
        
        item.innerHTML = `
            <div class="name">${colorDot}${char.color_name || 'ID: ' + char.id}の狼煙屋</div>
            <div class="type">好む石: ${(char.stone_color_affinities || []).join('、') || '未設定'}</div>
        `;
        
        listEl.appendChild(item);
    });
}

// 新規狼煙屋を追加（更新版）
function addNewCharacter() {
    const newId = 'noroshiya_' + String(characters.length + 1).padStart(3, '0');
    const newChar = {
        id: newId,
        color_name: '',
        color_code: '#000000',
        pattern_type: '無地',
        personality: '',
        speech_style: '',
        favorite_topics: [],
        message_types: [],
        emotional_range: '',
        dialogues: { hiuchiishi: {}, chat: {} },
        stone_color_affinities: [],
        matching_keywords: [],
        affinity_notes: '',
        backstory: ''
    };
    
    characters.push(newChar);
    displayCharacterList();
    selectCharacter(newId);
}

// フォームのHTMLを更新する関数
function updateFormHTML() {
    // 基本設定タブのHTML
    const basicTabHTML = `
        <div class="form-section">
            <h2>基本情報</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label>色の名前</label>
                    <input type="text" id="colorName" placeholder="例: 灰汁色、樺茶色">
                </div>
                <div class="form-group">
                    <label>色コード</label>
                    <div style="display: flex; align-items: center;">
                        <input type="color" id="colorPicker" style="width: 50px; height: 40px; margin-right: 10px;">
                        <input type="text" id="colorCode" placeholder="#9e9478" pattern="^#[0-9A-Fa-f]{6}$">
                    </div>
                </div>
                <div class="form-group">
                    <label>模様</label>
                    <select id="patternType">
                        <option value="無地">無地</option>
                        <option value="縞々">縞々</option>
                        <option value="ドット">ドット</option>
                        <option value="格子">格子</option>
                        <option value="その他">その他</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-section">
            <h2>性格・特徴</h2>
            <div class="form-group">
                <label>性格</label>
                <textarea id="personality" placeholder="おしゃべりの特徴、どんな性格か"></textarea>
            </div>
            <div class="form-group">
                <label>話し方</label>
                <textarea id="speechStyle" placeholder="ゆったり、早口、元気など"></textarea>
            </div>
            <div class="form-group">
                <label>好きな話題（カンマ区切り）</label>
                <input type="text" id="favoriteTopics" placeholder="日常の小さな幸せ, 季節の移ろい">
            </div>
            <div class="form-group">
                <label>得意なメッセージタイプ（複数選択可）</label>
                <div id="messageTypes">
                    <label><input type="checkbox" value="恋文"> 恋文</label>
                    <label><input type="checkbox" value="ダベリ"> ダベリ</label>
                    <label><input type="checkbox" value="訴求"> 訴求</label>
                    <label><input type="checkbox" value="親友"> 親友</label>
                    <label><input type="checkbox" value="家族"> 家族</label>
                </div>
            </div>
        </div>
    `;
    
    // 火打石設定タブのHTML
    const hiuchiishiTabHTML = `
        <div class="form-section">
            <h2>好む石の色</h2>
            <div id="stoneColorAffinities">
                <label><input type="checkbox" value="赤い"> 赤い石</label>
                <label><input type="checkbox" value="透明"> 透明な石</label>
                <label><input type="checkbox" value="白い"> 白い石</label>
                <label><input type="checkbox" value="黒い"> 黒い石</label>
                <label><input type="checkbox" value="青い"> 青い石</label>
                <label><input type="checkbox" value="茶色い"> 茶色い石</label>
                <label><input type="checkbox" value="オレンジ"> オレンジの石</label>
                <label><input type="checkbox" value="緑"> 緑の石</label>
                <label><input type="checkbox" value="紫"> 紫の石</label>
                <label><input type="checkbox" value="黄色い"> 黄色い石</label>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>なぜその色の石を好むのか</label>
                <textarea id="affinityNotes" placeholder="例: 透明な石の純粋さが、素直に話を聞く自分と重なるから"></textarea>
            </div>
        </div>
        
        <div class="form-section">
            <h2>その他のマッチングキーワード</h2>
            <div class="form-group">
                <label>キーワード（カンマ区切り）</label>
                <textarea id="matchingKeywords" placeholder="例: 朝, 静か, 優しい" rows="3"></textarea>
            </div>
        </div>
    `;
    
    // HTMLを更新
    document.getElementById('tab-basic').innerHTML = basicTabHTML;
    document.getElementById('tab-hiuchiishi').innerHTML = hiuchiishiTabHTML;
    
    // カラーピッカーとテキストフィールドの連動
    document.getElementById('colorPicker').addEventListener('change', (e) => {
        document.getElementById('colorCode').value = e.target.value;
    });
    
    document.getElementById('colorCode').addEventListener('change', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            document.getElementById('colorPicker').value = e.target.value;
        }
    });
}

// 保存処理（更新版）
async function saveCharacter() {
    const char = characters.find(c => c.id === currentCharacterId);
    if (!char) return;
    
    // 基本情報を更新
    char.color_name = document.getElementById('colorName').value;
    char.color_code = document.getElementById('colorCode').value;
    char.pattern_type = document.getElementById('patternType').value;
    char.personality = document.getElementById('personality').value;
    char.speech_style = document.getElementById('speechStyle').value;
    char.favorite_topics = document.getElementById('favoriteTopics').value.split(',').map(s => s.trim()).filter(s => s);
    
    // メッセージタイプを取得
    char.message_types = Array.from(document.querySelectorAll('#messageTypes input:checked')).map(cb => cb.value);
    
    // 石の色の好みを取得
    char.stone_color_affinities = Array.from(document.querySelectorAll('#stoneColorAffinities input:checked')).map(cb => cb.value);
    char.affinity_notes = document.getElementById('affinityNotes').value;
    char.matching_keywords = document.getElementById('matchingKeywords').value.split(',').map(s => s.trim()).filter(s => s);
    
    // Supabaseに保存
    if (supabase) {
        try {
            const { error } = await supabase
                .from('noroshiya_characters')
                .upsert({
                    id: char.id,
                    color_name: char.color_name,
                    color_code: char.color_code,
                    pattern_type: char.pattern_type,
                    personality: char.personality,
                    speech_style: char.speech_style,
                    favorite_topics: char.favorite_topics,
                    message_types: char.message_types,
                    emotional_range: char.emotional_range,
                    dialogues: char.dialogues,
                    stone_color_affinities: char.stone_color_affinities,
                    matching_keywords: char.matching_keywords,
                    affinity_notes: char.affinity_notes,
                    backstory: char.backstory
                });
            
            if (error) throw error;
            
            showStatus('保存しました');
        } catch (err) {
            console.error('保存エラー:', err);
            showStatus('保存に失敗しました', 'error');
        }
    }
    
    // ローカルストレージにも保存
    localStorage.setItem('noroshiya-dev-characters', JSON.stringify(characters));
    isDirty = false;
}