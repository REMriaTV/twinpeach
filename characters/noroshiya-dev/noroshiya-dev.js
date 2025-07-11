// 狼煙屋設定管理ツール JavaScript

// Supabase設定（親ディレクトリから設定を読み込む）
const SUPABASE_URL = 'https://roaucowddadmvxgzrvnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXVjb3dkZGFkbXZ4Z3pydm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxMDMsImV4cCI6MjA2NzgyMDEwM30.Tqs__X1JOfPiKsb5llj93jVLnyszF_ZrZjfp_UaIiNw';

let supabase;
if (typeof window !== 'undefined' && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// グローバル変数
let characters = [];
let currentCharacterId = null;
let isDirty = false;
let availableStones = []; // 利用可能な火打石リスト

// 初期データ（ローカルストレージ用）
const initialCharacters = [
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
        description: "いつも元気いっぱいで、新しいメッセージが来るとピヨピヨと飛び跳ねる",
        dialogues: {
            hiuchiishi: {
                "初回出会い時": "オッ！キレイナイシダネ！ボクト トモダチニナロウ！",
                "再会時": "マタアエタネ！キョウモ ガンバロウ！"
            },
            chat: {
                "メッセージ送信時": "ヨシ！チャントトドケルヨ！",
                "返信受信時": "ヘンジガキタヨ！ミテミテ！"
            }
        },
        behavior: {
            activeStartTime: "06:00",
            activeEndTime: "18:00",
            inactiveBehavior: "巣で丸くなって寝ている",
            smokeCharacteristics: "白くてふわふわ、朝露のような清々しい香り",
            smokeSpeed: "normal"
        },
        devNotes: "",
        changeHistory: []
    }
];

// データ読み込み
async function loadCharacters() {
    // まずローカルストレージから読み込み
    const saved = localStorage.getItem('noroshiya-dev-characters');
    if (saved) {
        characters = JSON.parse(saved);
    } else {
        characters = [...initialCharacters];
    }
    
    // Supabaseから読み込みを試みる
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('noroshiya_characters')
                .select('*')
                .order('id', { ascending: true });
            
            if (!error && data) {
                // Supabaseのデータを優先
                characters = data.map(char => ({
                    ...char,
                    dialogues: char.dialogues || { hiuchiishi: {}, chat: {} },
                    behavior: char.behavior || {},
                    devNotes: char.dev_notes || "",
                    changeHistory: char.change_history || []
                }));
            }
        } catch (err) {
            console.error('Supabase読み込みエラー:', err);
        }
    }
    
    displayCharacterList();
    if (characters.length > 0) {
        selectCharacter(characters[0].id);
    }
}

// キャラクターリスト表示
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
        
        item.innerHTML = `
            <div class="name">${char.name}</div>
            <div class="type">${char.type}</div>
        `;
        
        listEl.appendChild(item);
    });
}

// キャラクター選択
function selectCharacter(id) {
    if (isDirty) {
        if (!confirm('保存されていない変更があります。破棄してもよろしいですか？')) {
            return;
        }
    }
    
    currentCharacterId = id;
    const char = characters.find(c => c.id === id);
    if (!char) return;
    
    // 基本情報
    document.getElementById('name').value = char.name || '';
    document.getElementById('type').value = char.type || '';
    document.getElementById('birdType').value = char.birdType || '';
    document.getElementById('catchphrase').value = char.catchphrase || '';
    document.getElementById('appearance').value = char.appearance || '';
    document.getElementById('personality').value = char.personality || '';
    document.getElementById('background').value = char.background || '';
    document.getElementById('noroshiPlace').value = char.noroshiPlace || '';
    document.getElementById('specialSkill').value = char.specialSkill || '';
    
    // セリフパターン
    loadDialogues('hiuchiishiDialogues', char.dialogues?.hiuchiishi || {});
    loadDialogues('chatReactions', char.dialogues?.chat || {});
    
    // 振る舞い設定
    document.getElementById('activeStartTime').value = char.behavior?.activeStartTime || '06:00';
    document.getElementById('activeEndTime').value = char.behavior?.activeEndTime || '18:00';
    document.getElementById('inactiveBehavior').value = char.behavior?.inactiveBehavior || '';
    document.getElementById('smokeCharacteristics').value = char.behavior?.smokeCharacteristics || '';
    document.getElementById('smokeSpeed').value = char.behavior?.smokeSpeed || 'normal';
    
    // 開発メモ
    document.getElementById('devNotes').value = char.devNotes || '';
    
    // 変更履歴
    displayChangeHistory(char.changeHistory || []);
    
    isDirty = false;
    displayCharacterList();
}

// セリフパターン読み込み
function loadDialogues(containerId, dialogues) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    Object.entries(dialogues).forEach(([situation, text]) => {
        const item = createDialogueItem(situation, text);
        container.appendChild(item);
    });
    
    // デフォルトがない場合は追加
    if (Object.keys(dialogues).length === 0) {
        if (containerId === 'hiuchiishiDialogues') {
            container.appendChild(createDialogueItem('初回出会い時', ''));
            container.appendChild(createDialogueItem('再会時', ''));
        } else {
            container.appendChild(createDialogueItem('メッセージ送信時', ''));
            container.appendChild(createDialogueItem('返信受信時', ''));
        }
    }
}

// セリフアイテム作成
function createDialogueItem(situation, text) {
    const div = document.createElement('div');
    div.className = 'dialogue-item';
    div.innerHTML = `
        <span class="situation">${situation}</span>
        <input type="text" value="${text}" placeholder="カタカナでセリフを入力" onchange="setDirty()">
        <button class="remove-btn" onclick="removeDialogue(this)">削除</button>
    `;
    return div;
}

// セリフ追加
function addDialogue(containerId) {
    const container = document.getElementById(containerId);
    const situation = prompt('シチュエーションを入力してください');
    if (!situation) return;
    
    const item = createDialogueItem(situation, '');
    container.appendChild(item);
    setDirty();
}

// セリフ削除
function removeDialogue(button) {
    button.parentElement.remove();
    setDirty();
}

// タブ切り替え
function switchTab(tabName) {
    // タブボタン
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // タブコンテンツ
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// 変更フラグ設定
function setDirty() {
    isDirty = true;
}

// 保存処理
async function saveCharacter() {
    const char = characters.find(c => c.id === currentCharacterId);
    if (!char) return;
    
    // 変更前の値を保存
    const oldValues = JSON.parse(JSON.stringify(char));
    
    // 基本情報を更新
    char.name = document.getElementById('name').value;
    char.type = document.getElementById('type').value;
    char.birdType = document.getElementById('birdType').value;
    char.catchphrase = document.getElementById('catchphrase').value;
    char.appearance = document.getElementById('appearance').value;
    char.personality = document.getElementById('personality').value;
    char.background = document.getElementById('background').value;
    char.noroshiPlace = document.getElementById('noroshiPlace').value;
    char.specialSkill = document.getElementById('specialSkill').value;
    
    // セリフパターンを収集
    char.dialogues = {
        hiuchiishi: collectDialogues('hiuchiishiDialogues'),
        chat: collectDialogues('chatReactions')
    };
    
    // 振る舞い設定
    char.behavior = {
        activeStartTime: document.getElementById('activeStartTime').value,
        activeEndTime: document.getElementById('activeEndTime').value,
        inactiveBehavior: document.getElementById('inactiveBehavior').value,
        smokeCharacteristics: document.getElementById('smokeCharacteristics').value,
        smokeSpeed: document.getElementById('smokeSpeed').value
    };
    
    // 開発メモ
    char.devNotes = document.getElementById('devNotes').value;
    
    // 変更履歴を追加
    const changes = [];
    if (oldValues.name !== char.name) changes.push('名前');
    if (oldValues.type !== char.type) changes.push('タイプ');
    if (JSON.stringify(oldValues.dialogues) !== JSON.stringify(char.dialogues)) changes.push('セリフ');
    
    if (changes.length > 0) {
        char.changeHistory = char.changeHistory || [];
        char.changeHistory.unshift({
            date: new Date().toISOString(),
            changes: changes.join(', ') + 'を変更'
        });
    }
    
    // ローカルストレージに保存
    localStorage.setItem('noroshiya-dev-characters', JSON.stringify(characters));
    
    // Supabaseに保存
    if (supabase) {
        try {
            const { error } = await supabase
                .from('noroshiya_characters')
                .upsert({
                    id: char.id,
                    name: char.name,
                    type: char.type,
                    bird_type: char.birdType,
                    catchphrase: char.catchphrase,
                    appearance: char.appearance,
                    personality: char.personality,
                    background: char.background,
                    noroshi_place: char.noroshiPlace,
                    special_skill: char.specialSkill,
                    description: char.description,
                    dialogues: char.dialogues,
                    behavior: char.behavior,
                    dev_notes: char.devNotes,
                    change_history: char.changeHistory
                });
            
            if (error) throw error;
        } catch (err) {
            console.error('Supabase保存エラー:', err);
        }
    }
    
    isDirty = false;
    showStatus('保存しました');
    displayCharacterList();
    displayChangeHistory(char.changeHistory);
}

// セリフパターン収集
function collectDialogues(containerId) {
    const container = document.getElementById(containerId);
    const dialogues = {};
    
    container.querySelectorAll('.dialogue-item').forEach(item => {
        const situation = item.querySelector('.situation').textContent;
        const text = item.querySelector('input').value;
        if (text) {
            dialogues[situation] = text;
        }
    });
    
    return dialogues;
}

// 新規キャラクター追加
function addNewCharacter() {
    if (isDirty) {
        if (!confirm('保存されていない変更があります。破棄してもよろしいですか？')) {
            return;
        }
    }
    
    const newChar = {
        id: Date.now(),
        name: "新しい狼煙屋",
        type: "タイプ未設定",
        birdType: "鳥の種類",
        appearance: "",
        personality: "",
        catchphrase: "",
        background: "",
        noroshiPlace: "",
        specialSkill: "",
        description: "",
        dialogues: { hiuchiishi: {}, chat: {} },
        behavior: {
            activeStartTime: "06:00",
            activeEndTime: "18:00",
            inactiveBehavior: "",
            smokeCharacteristics: "",
            smokeSpeed: "normal"
        },
        devNotes: "",
        changeHistory: [{
            date: new Date().toISOString(),
            changes: 'キャラクター作成'
        }]
    };
    
    characters.push(newChar);
    displayCharacterList();
    selectCharacter(newChar.id);
}

// キャンセル
function cancelEdit() {
    if (isDirty) {
        if (!confirm('保存されていない変更があります。破棄してもよろしいですか？')) {
            return;
        }
    }
    selectCharacter(currentCharacterId);
}

// ステータス表示
function showStatus(message) {
    const indicator = document.getElementById('statusIndicator');
    indicator.textContent = message;
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 3000);
}

// 変更履歴表示
function displayChangeHistory(history) {
    const container = document.getElementById('changeHistory');
    if (!history || history.length === 0) {
        container.innerHTML = '<p style="color: #999;">変更履歴はありません</p>';
        return;
    }
    
    container.innerHTML = history.slice(0, 10).map(item => `
        <div style="margin-bottom: 0.5rem;">
            <strong>${new Date(item.date).toLocaleString('ja-JP')}</strong><br>
            ${item.changes}
        </div>
    `).join('');
}

// 入力フィールドに変更検知を追加
document.addEventListener('DOMContentLoaded', () => {
    // すべての入力フィールドに変更検知を追加
    document.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('change', setDirty);
    });
    
    // 初期データ読み込み
    loadCharacters();
    
    // ページ離脱時の警告
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});