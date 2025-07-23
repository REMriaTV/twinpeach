// 狼煙屋・鳥・石 データベース管理 JavaScript
// Version 2.0 - 色ベースシステム対応

// Supabase設定
const SUPABASE_URL = 'https://roaucowddadmvxgzrvnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXVjb3dkZGFkbXZ4Z3pydm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxMDMsImV4cCI6MjA2NzgyMDEwM30.Tqs__X1JOfPiKsb5llj93jVLnyszF_ZrZjfp_UaIiNw';

// Supabaseクライアント初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// グローバル変数
let noroshiyaList = [];
let birdsList = [];
let stonesList = [];
let currentNoroshiyaId = null;
let currentBirdId = null;
let currentStoneId = null;

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // フォームのサブミット
    document.getElementById('noroshiya-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNoroshiya();
    });
    
    // カラーピッカーとカラーコードの連動
    const colorPicker = document.getElementById('color-picker');
    const colorCode = document.getElementById('color-code');
    
    colorPicker.addEventListener('change', (e) => {
        colorCode.value = e.target.value;
    });
    
    colorCode.addEventListener('change', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            colorPicker.value = e.target.value;
        }
    });
    
    // データ読み込み
    await loadNoroshiyaData();
});

// タブ切り替え
function switchTab(tabName) {
    // タブボタンの状態変更
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// 狼煙屋データ読み込み
async function loadNoroshiyaData() {
    try {
        const { data, error } = await supabase
            .from('noroshiya_characters')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        noroshiyaList = data || [];
        displayNoroshiyaList();
        
        // 最初の狼煙屋を選択
        if (noroshiyaList.length > 0) {
            selectNoroshiya(noroshiyaList[0].id);
        }
    } catch (error) {
        console.error('狼煙屋データの読み込みエラー:', error);
        // エラー時はローカルストレージから読み込みを試みる
        const saved = localStorage.getItem('noroshiya-dev-data');
        if (saved) {
            noroshiyaList = JSON.parse(saved);
            displayNoroshiyaList();
        }
    }
}

// 狼煙屋リスト表示
function displayNoroshiyaList() {
    const listEl = document.getElementById('noroshiya-list');
    listEl.innerHTML = '';
    
    noroshiyaList.forEach(noroshiya => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => selectNoroshiya(noroshiya.id);
        
        if (noroshiya.id === currentNoroshiyaId) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="name">
                <span class="color-dot" style="background-color: ${noroshiya.color_code || '#999'}"></span>
                ${noroshiya.color_name || 'ID: ' + noroshiya.id}の狼煙屋
            </div>
            <div class="details">
                好む石: ${(noroshiya.stone_color_affinities || []).join('、') || '未設定'}
            </div>
        `;
        
        listEl.appendChild(card);
    });
}

// 狼煙屋選択
function selectNoroshiya(id) {
    currentNoroshiyaId = id;
    const noroshiya = noroshiyaList.find(n => n.id === id);
    
    if (!noroshiya) return;
    
    // フォームに値を設定
    document.getElementById('noroshiya-id').value = noroshiya.id;
    document.getElementById('color-name').value = noroshiya.color_name || '';
    document.getElementById('color-code').value = noroshiya.color_code || '#000000';
    document.getElementById('color-picker').value = noroshiya.color_code || '#000000';
    document.getElementById('pattern-type').value = noroshiya.pattern_type || '無地';
    
    // 石の好みのチェックボックス
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.checked = (noroshiya.stone_color_affinities || []).includes(cb.value);
    });
    
    document.getElementById('affinity-notes').value = noroshiya.affinity_notes || '';
    document.getElementById('personality').value = noroshiya.personality || '';
    document.getElementById('speech-style').value = noroshiya.speech_style || '';
    document.getElementById('favorite-topics').value = (noroshiya.favorite_topics || []).join(', ');
    document.getElementById('emotional-range').value = noroshiya.emotional_range || '';
    
    // セリフ
    const dialogues = noroshiya.dialogues || {};
    document.getElementById('dialogue-first-meet').value = dialogues.hiuchiishi?.['初回出会い時'] || '';
    document.getElementById('dialogue-reunion').value = dialogues.hiuchiishi?.['再会時'] || '';
    document.getElementById('dialogue-send').value = dialogues.chat?.['メッセージ送信時'] || '';
    document.getElementById('dialogue-receive').value = dialogues.chat?.['返信受信時'] || '';
    
    document.getElementById('matching-keywords').value = (noroshiya.matching_keywords || []).join(', ');
    document.getElementById('backstory').value = noroshiya.backstory || '';
    
    // リスト更新
    displayNoroshiyaList();
}

// 新規狼煙屋追加
function addNewNoroshiya() {
    const newId = 'noroshiya_' + String(noroshiyaList.length + 1).padStart(3, '0');
    const newNoroshiya = {
        id: newId,
        color_name: '',
        color_code: '#000000',
        pattern_type: '無地',
        personality: '',
        speech_style: '',
        favorite_topics: [],
        message_types: [],
        emotional_range: '',
        dialogues: {
            hiuchiishi: {
                '初回出会い時': '',
                '再会時': ''
            },
            chat: {
                'メッセージ送信時': '',
                '返信受信時': ''
            }
        },
        stone_color_affinities: [],
        matching_keywords: [],
        affinity_notes: '',
        backstory: ''
    };
    
    noroshiyaList.push(newNoroshiya);
    displayNoroshiyaList();
    selectNoroshiya(newId);
}

// 狼煙屋保存
async function saveNoroshiya() {
    if (!currentNoroshiyaId) return;
    
    // フォームからデータ取得
    const formData = {
        id: currentNoroshiyaId,
        color_name: document.getElementById('color-name').value,
        color_code: document.getElementById('color-code').value,
        pattern_type: document.getElementById('pattern-type').value,
        personality: document.getElementById('personality').value,
        speech_style: document.getElementById('speech-style').value,
        favorite_topics: document.getElementById('favorite-topics').value.split(',').map(s => s.trim()).filter(s => s),
        emotional_range: document.getElementById('emotional-range').value,
        dialogues: {
            hiuchiishi: {
                '初回出会い時': document.getElementById('dialogue-first-meet').value,
                '再会時': document.getElementById('dialogue-reunion').value
            },
            chat: {
                'メッセージ送信時': document.getElementById('dialogue-send').value,
                '返信受信時': document.getElementById('dialogue-receive').value
            }
        },
        stone_color_affinities: Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')).map(cb => cb.value),
        matching_keywords: document.getElementById('matching-keywords').value.split(',').map(s => s.trim()).filter(s => s),
        affinity_notes: document.getElementById('affinity-notes').value,
        backstory: document.getElementById('backstory').value
    };
    
    try {
        // Supabaseに保存
        const { error } = await supabase
            .from('noroshiya_characters')
            .upsert(formData);
        
        if (error) throw error;
        
        // ローカルリストも更新
        const index = noroshiyaList.findIndex(n => n.id === currentNoroshiyaId);
        if (index !== -1) {
            noroshiyaList[index] = formData;
        }
        
        // ローカルストレージにも保存
        localStorage.setItem('noroshiya-dev-data', JSON.stringify(noroshiyaList));
        
        displayNoroshiyaList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// キャンセル
function cancelEdit() {
    if (currentNoroshiyaId) {
        selectNoroshiya(currentNoroshiyaId);
    }
}

// グローバル関数として公開
window.addNewNoroshiya = addNewNoroshiya;
window.addNewBird = () => alert('鳥データベースは準備中です');
window.addNewStone = () => alert('石データベースは準備中です');
window.selectNoroshiya = selectNoroshiya;
window.saveNoroshiya = saveNoroshiya;
window.cancelEdit = cancelEdit;