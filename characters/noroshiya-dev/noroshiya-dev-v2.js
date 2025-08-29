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
let currentStoneImage = null; // 現在選択中の石の画像
let savedLocations = []; // 保存された採取ポイント

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
            
            if (tab === 'birds' && birdsList.length === 0) {
                await loadBirdsData();
            } else if (tab === 'stones' && stonesList.length === 0) {
                await loadStonesData();
            } else if (tab === 'noroshiya' && noroshiyaList.length === 0) {
                await loadNoroshiyaData();
            }
        });
    });
    
    // フォームのサブミット
    document.getElementById('noroshiya-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNoroshiya();
    });
    
    document.getElementById('bird-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBird();
    });
    
    document.getElementById('stone-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStone();
    });
    
    // 石の色調合システムを初期化
    initializeColorBlendingSystem();
    
    // GoogleマップURLから緯度経度を自動抽出
    const addressInput = document.getElementById('stone-address');
    if (addressInput) {
        addressInput.addEventListener('change', (e) => {
            extractLatLngFromUrl(e.target.value);
        });
    }
    
    // データ読み込み（最初は石タブ）
    await loadStonesData();
    
    // 保存された採取ポイントを読み込み
    loadSavedLocations();
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

// 石の色調合システムを初期化
function initializeColorBlendingSystem() {
    // カラーピッカーとテキストフィールドの連動
    const colorInputs = [
        { picker: 'stone-color-main', hex: 'stone-color-main-hex', ratio: 'stone-color-main-ratio' },
        { picker: 'stone-color-sub1', hex: 'stone-color-sub1-hex', ratio: 'stone-color-sub1-ratio' },
        { picker: 'stone-color-sub2', hex: 'stone-color-sub2-hex', ratio: 'stone-color-sub2-ratio' }
    ];
    
    colorInputs.forEach(input => {
        const picker = document.getElementById(input.picker);
        const hex = document.getElementById(input.hex);
        const ratio = document.getElementById(input.ratio);
        
        if (picker && hex) {
            // カラーピッカー変更時
            picker.addEventListener('input', (e) => {
                hex.value = e.target.value;
                updateBlendedColor();
            });
            
            // HEX入力変更時
            hex.addEventListener('input', (e) => {
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    picker.value = e.target.value;
                    updateBlendedColor();
                }
            });
        }
        
        if (ratio) {
            // 割合変更時
            ratio.addEventListener('input', (e) => {
                const ratioValue = e.target.nextElementSibling;
                if (ratioValue) {
                    ratioValue.textContent = e.target.value + '%';
                }
                updateBlendedColor();
            });
        }
    });
}

// 色を調合して結果を更新
function updateBlendedColor() {
    const mainColor = document.getElementById('stone-color-main').value;
    const sub1Color = document.getElementById('stone-color-sub1').value;
    const sub2Color = document.getElementById('stone-color-sub2').value;
    
    const mainRatio = parseInt(document.getElementById('stone-color-main-ratio').value) / 100;
    const sub1Ratio = parseInt(document.getElementById('stone-color-sub1-ratio').value) / 100;
    const sub2Ratio = parseInt(document.getElementById('stone-color-sub2-ratio').value) / 100;
    
    // 割合を正規化（合計が100%になるように）
    const totalRatio = mainRatio + sub1Ratio + sub2Ratio;
    const normalizedRatios = {
        main: mainRatio / totalRatio,
        sub1: sub1Ratio / totalRatio,
        sub2: sub2Ratio / totalRatio
    };
    
    // 色を調合
    const blendedColor = blendColors([
        { color: mainColor, ratio: normalizedRatios.main },
        { color: sub1Color, ratio: normalizedRatios.sub1 },
        { color: sub2Color, ratio: normalizedRatios.sub2 }
    ]);
    
    // プレビューと結果を更新
    const preview = document.getElementById('blended-color-preview');
    const hexDisplay = document.getElementById('blended-color-hex');
    
    if (preview) {
        preview.style.background = blendedColor;
    }
    if (hexDisplay) {
        hexDisplay.textContent = blendedColor;
    }
}

// 複数の色を割合に基づいて調合
function blendColors(colors) {
    let r = 0, g = 0, b = 0;
    
    colors.forEach(({ color, ratio }) => {
        const rgb = hexToRgb(color);
        r += rgb.r * ratio;
        g += rgb.g * ratio;
        b += rgb.b * ratio;
    });
    
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    
    return rgbToHex(r, g, b);
}

// HEXをRGBに変換
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGBをHEXに変換
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
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

// 鳥データ読み込み
async function loadBirdsData() {
    try {
        const { data, error } = await supabase
            .from('birds')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        birdsList = data || [];
        displayBirdsList();
        
        if (birdsList.length > 0) {
            selectBird(birdsList[0].id);
        }
    } catch (error) {
        console.error('鳥データの読み込みエラー:', error);
    }
}

// 鳥リスト表示
function displayBirdsList() {
    const listEl = document.getElementById('birds-list');
    listEl.innerHTML = '';
    
    birdsList.forEach(bird => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => selectBird(bird.id);
        
        if (bird.id === currentBirdId) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="name">${bird.name}</div>
            <div class="details">${bird.size} / ${bird.habitat}</div>
        `;
        
        listEl.appendChild(card);
    });
}

// 鳥選択
function selectBird(id) {
    currentBirdId = id;
    const bird = birdsList.find(b => b.id === id);
    
    if (!bird) return;
    
    document.getElementById('bird-id').value = bird.id;
    document.getElementById('bird-name').value = bird.name || '';
    document.getElementById('bird-scientific-name').value = bird.scientific_name || '';
    document.getElementById('bird-size').value = bird.size || '';
    document.getElementById('bird-habitat').value = bird.habitat || '';
    document.getElementById('bird-characteristics').value = bird.characteristics || '';
    document.getElementById('bird-behavior').value = bird.behavior || '';
    document.getElementById('bird-call').value = bird.call_description || '';
    document.getElementById('bird-symbolism').value = bird.symbolism || '';
    document.getElementById('bird-season').value = bird.season || '';
    document.getElementById('bird-rarity').value = bird.rarity || 'common';
    
    displayBirdsList();
}

// 新規鳥追加
function addNewBird() {
    const newId = 'bird_' + String(birdsList.length + 1).padStart(3, '0');
    const newBird = {
        id: newId,
        name: '',
        scientific_name: '',
        size: '',
        habitat: '',
        characteristics: '',
        behavior: '',
        call_description: '',
        symbolism: '',
        season: '',
        rarity: 'common'
    };
    
    birdsList.push(newBird);
    displayBirdsList();
    selectBird(newId);
}

// 鳥保存
async function saveBird() {
    if (!currentBirdId) return;
    
    const formData = {
        id: currentBirdId,
        name: document.getElementById('bird-name').value,
        scientific_name: document.getElementById('bird-scientific-name').value,
        size: document.getElementById('bird-size').value,
        habitat: document.getElementById('bird-habitat').value,
        characteristics: document.getElementById('bird-characteristics').value,
        behavior: document.getElementById('bird-behavior').value,
        call_description: document.getElementById('bird-call').value,
        symbolism: document.getElementById('bird-symbolism').value,
        season: document.getElementById('bird-season').value,
        rarity: document.getElementById('bird-rarity').value
    };
    
    try {
        const { error } = await supabase
            .from('birds')
            .upsert(formData);
        
        if (error) throw error;
        
        const index = birdsList.findIndex(b => b.id === currentBirdId);
        if (index !== -1) {
            birdsList[index] = formData;
        }
        
        displayBirdsList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// 石データ読み込み
async function loadStonesData() {
    try {
        const { data, error } = await supabase
            .from('stones')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        stonesList = data || [];
        displayStonesList();
        
        if (stonesList.length > 0) {
            selectStone(stonesList[0].id);
        }
    } catch (error) {
        console.error('石データの読み込みエラー:', error);
    }
}

// 石リスト表示
function displayStonesList() {
    const listEl = document.getElementById('stones-list');
    listEl.innerHTML = '';
    
    stonesList.forEach(stone => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => selectStone(stone.id);
        
        if (stone.id === currentStoneId) {
            card.classList.add('active');
        }
        
        // サブテキストの構成
        let subText = '';
        
        // 火打石の場合は「火打石」と表示
        if (stone.is_hiuchiishi) {
            subText = '火打石';
        } else {
            // 火打石でない場合は色情報を表示
            const colors = stone.colors || {};
            const colorText = [colors.primary, colors.secondary].filter(c => c).join('・');
            if (colorText) {
                subText = colorText;
            }
            // タイプがあれば追加
            if (stone.type) {
                subText += (subText ? ' / ' : '') + stone.type;
            }
        }
        
        // エリア名を追加
        if (stone.location_name) {
            subText += ' / ' + stone.location_name;
        }
        
        // IDを小さく表示
        const stoneIdDisplay = stone.id ? `<span style="font-size: 10px; color: #999; position: absolute; top: 5px; right: 5px;">${stone.id}</span>` : '';
        
        card.innerHTML = `
            ${stoneIdDisplay}
            ${stone.image_url ? `<img src="${stone.image_url}" alt="${stone.name}" class="item-image">` : ''}
            <div class="name">${stone.name}</div>
            <div class="details">${subText}</div>
        `;
        
        listEl.appendChild(card);
    });
}

// 石選択
function selectStone(id) {
    currentStoneId = id;
    const stone = stonesList.find(s => s.id === id);
    
    if (!stone) return;
    
    const colors = stone.colors || {};
    
    document.getElementById('stone-id').value = stone.id;
    document.getElementById('stone-name').value = stone.name || '';
    document.getElementById('stone-type').value = stone.type || '';
    document.getElementById('stone-hiuchiishi').value = stone.is_hiuchiishi ? 'true' : 'false';
    // カラーピッカーの復元
    if (colors.main) {
        document.getElementById('stone-color-main').value = colors.main;
        document.getElementById('stone-color-main-hex').value = colors.main;
    }
    if (colors.sub1) {
        document.getElementById('stone-color-sub1').value = colors.sub1;
        document.getElementById('stone-color-sub1-hex').value = colors.sub1;
    }
    if (colors.sub2) {
        document.getElementById('stone-color-sub2').value = colors.sub2;
        document.getElementById('stone-color-sub2-hex').value = colors.sub2;
    }
    if (colors.main_ratio !== undefined) {
        document.getElementById('stone-color-main-ratio').value = colors.main_ratio;
        document.querySelector('#stone-color-main-ratio + .ratio-value').textContent = colors.main_ratio + '%';
    }
    if (colors.sub1_ratio !== undefined) {
        document.getElementById('stone-color-sub1-ratio').value = colors.sub1_ratio;
        document.querySelector('#stone-color-sub1-ratio + .ratio-value').textContent = colors.sub1_ratio + '%';
    }
    if (colors.sub2_ratio !== undefined) {
        document.getElementById('stone-color-sub2-ratio').value = colors.sub2_ratio;
        document.querySelector('#stone-color-sub2-ratio + .ratio-value').textContent = colors.sub2_ratio + '%';
    }
    
    // 調合色を更新
    if (colors.blended) {
        document.getElementById('blended-color-preview').style.background = colors.blended;
        document.getElementById('blended-color-hex').textContent = colors.blended;
    } else {
        updateBlendedColor();
    }
    
    // 従来のフィールド（後方互換性）
    document.getElementById('stone-color-primary').value = colors.primary || '';
    document.getElementById('stone-color-secondary').value = colors.secondary || '';
    document.getElementById('stone-pattern').value = colors.pattern || '';
    document.getElementById('stone-hardness').value = stone.hardness || '';
    document.getElementById('stone-size').value = stone.size_range || '';
    document.getElementById('stone-texture').value = stone.texture || 'ツルツル';
    document.getElementById('stone-transparency').value = stone.transparency || '不透明';
    document.getElementById('stone-features').value = stone.special_features || '';
    
    // 位置情報フィールドの復元
    document.getElementById('stone-location-name').value = stone.location_name || '';
    document.getElementById('stone-prefecture').value = stone.prefecture || '';
    document.getElementById('stone-city').value = stone.city || '';
    document.getElementById('stone-location-tag').value = stone.location_tag || '';
    document.getElementById('stone-location-detail').value = stone.location_detail || '';
    document.getElementById('stone-location-notes').value = stone.location_notes || '';
    document.getElementById('stone-address').value = stone.address || stone.map_url || '';
    document.getElementById('stone-lat').value = stone.lat || '';
    document.getElementById('stone-lng').value = stone.lng || '';
    
    // 画像プレビューを更新（メインと色選択部分の両方）
    const previewEl = document.getElementById('stone-image-preview');
    const colorPreviewImg = document.getElementById('stone-color-preview-image');
    const noImagePlaceholder = document.querySelector('.no-image-placeholder');
    
    if (stone.image_url) {
        previewEl.innerHTML = `<img src="${stone.image_url}" alt="${stone.name}">`;
        currentStoneImage = stone.image_url;
        
        // カラーピッカー用の画像も更新
        if (colorPreviewImg) {
            colorPreviewImg.src = stone.image_url;
            colorPreviewImg.style.display = 'block';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'none';
        }
    } else {
        previewEl.innerHTML = '<div class="placeholder">画像なし</div>';
        currentStoneImage = null;
        
        // カラーピッカー用の画像も非表示
        if (colorPreviewImg) {
            colorPreviewImg.style.display = 'none';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'block';
        }
    }
    
    displayStonesList();
}

// 新規石追加
function addNewStone() {
    const newId = 'stone_' + String(stonesList.length + 1).padStart(3, '0');
    const newStone = {
        id: newId,
        name: '',
        type: '',
        colors: { primary: '', secondary: '', pattern: '' },
        hardness: 7.0,
        size_range: '',
        texture: 'ツルツル',
        transparency: '不透明',
        special_features: '',
        is_hiuchiishi: true,
        image_url: null,
        // 位置情報フィールド
        location_name: '',
        prefecture: '',
        city: '',
        location_tag: '',
        location_detail: '',
        location_notes: '',
        address: '',
        map_url: '',
        lat: null,
        lng: null
    };
    
    // 画像プレビューをクリア
    document.getElementById('stone-image-preview').innerHTML = '<div class="placeholder">画像なし</div>';
    currentStoneImage = null;
    
    stonesList.push(newStone);
    displayStonesList();
    selectStone(newId);
}

// 石保存
async function saveStone() {
    if (!currentStoneId) return;
    
    const formData = {
        id: currentStoneId,
        name: document.getElementById('stone-name').value,
        type: document.getElementById('stone-type').value,
        colors: {
            primary: document.getElementById('stone-color-primary').value,
            secondary: document.getElementById('stone-color-secondary').value || null,
            pattern: document.getElementById('stone-pattern').value || null
        },
        hardness: parseFloat(document.getElementById('stone-hardness').value) || null,
        size_range: document.getElementById('stone-size').value,
        texture: document.getElementById('stone-texture').value,
        transparency: document.getElementById('stone-transparency').value,
        special_features: document.getElementById('stone-features').value,
        found_locations: document.getElementById('stone-locations').value,
        rarity: document.getElementById('stone-rarity').value,
        is_hiuchiishi: document.getElementById('stone-hiuchiishi').value === 'true',
        ng_keywords: document.getElementById('stone-ng-keywords').value.split(',').map(s => s.trim()).filter(s => s)
    };
    
    try {
        const { error } = await supabase
            .from('stones')
            .upsert(formData);
        
        if (error) throw error;
        
        const index = stonesList.findIndex(s => s.id === currentStoneId);
        if (index !== -1) {
            stonesList[index] = formData;
        }
        
        displayStonesList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// キャンセル関数
function cancelBirdEdit() {
    if (currentBirdId) {
        selectBird(currentBirdId);
    }
}

function cancelStoneEdit() {
    if (currentStoneId) {
        selectStone(currentStoneId);
    }
}


// 削除機能
async function deleteNoroshiya() {
    if (!currentNoroshiyaId) return;
    
    const noroshiya = noroshiyaList.find(n => n.id === currentNoroshiyaId);
    if (!noroshiya) return;
    
    if (!confirm(`本当に「${noroshiya.color_name}の狼煙屋」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('noroshiya_characters')
            .delete()
            .eq('id', currentNoroshiyaId);
        
        if (error) throw error;
        
        // リストから削除
        noroshiyaList = noroshiyaList.filter(n => n.id !== currentNoroshiyaId);
        localStorage.setItem('noroshiya-dev-data', JSON.stringify(noroshiyaList));
        
        // 次のアイテムを選択
        if (noroshiyaList.length > 0) {
            selectNoroshiya(noroshiyaList[0].id);
        } else {
            currentNoroshiyaId = null;
            document.getElementById('noroshiya-form').reset();
        }
        
        displayNoroshiyaList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

async function deleteBird() {
    if (!currentBirdId) return;
    
    const bird = birdsList.find(b => b.id === currentBirdId);
    if (!bird) return;
    
    if (!confirm(`本当に「${bird.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('birds')
            .delete()
            .eq('id', currentBirdId);
        
        if (error) throw error;
        
        birdsList = birdsList.filter(b => b.id !== currentBirdId);
        
        if (birdsList.length > 0) {
            selectBird(birdsList[0].id);
        } else {
            currentBirdId = null;
            document.getElementById('bird-form').reset();
        }
        
        displayBirdsList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

async function deleteStone() {
    if (!currentStoneId) return;
    
    const stone = stonesList.find(s => s.id === currentStoneId);
    if (!stone) return;
    
    if (!confirm(`本当に「${stone.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('stones')
            .delete()
            .eq('id', currentStoneId);
        
        if (error) throw error;
        
        stonesList = stonesList.filter(s => s.id !== currentStoneId);
        
        if (stonesList.length > 0) {
            selectStone(stonesList[0].id);
        } else {
            currentStoneId = null;
            document.getElementById('stone-form').reset();
        }
        
        displayStonesList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

// 画像選択処理
async function handleStoneImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
        alert('画像サイズは5MB以下にしてください。');
        return;
    }
    
    // 画像プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewEl = document.getElementById('stone-image-preview');
        const colorPreviewImg = document.getElementById('stone-color-preview-image');
        const noImagePlaceholder = document.querySelector('.no-image-placeholder');
        
        previewEl.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        currentStoneImage = e.target.result; // Base64データとして保存
        
        // カラーピッカー用の画像も更新
        if (colorPreviewImg) {
            colorPreviewImg.src = e.target.result;
            colorPreviewImg.style.display = 'block';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// 石保存（画像対応版に更新）
async function saveStoneWithImage() {
    if (!currentStoneId) return;
    
    const formData = {
        id: currentStoneId,
        name: document.getElementById('stone-name').value,
        type: document.getElementById('stone-type').value,
        colors: {
            // カラーピッカーから取得した色情報
            main: document.getElementById('stone-color-main').value,
            sub1: document.getElementById('stone-color-sub1').value,
            sub2: document.getElementById('stone-color-sub2').value,
            main_ratio: parseInt(document.getElementById('stone-color-main-ratio').value),
            sub1_ratio: parseInt(document.getElementById('stone-color-sub1-ratio').value),
            sub2_ratio: parseInt(document.getElementById('stone-color-sub2-ratio').value),
            blended: document.getElementById('blended-color-hex').textContent,
            // 後方互換性のため従来のフィールドも保持
            primary: document.getElementById('stone-color-primary').value || document.getElementById('blended-color-hex').textContent,
            secondary: document.getElementById('stone-color-secondary').value || null,
            pattern: document.getElementById('stone-pattern').value || null
        },
        hardness: parseFloat(document.getElementById('stone-hardness').value) || null,
        size_range: document.getElementById('stone-size').value,
        texture: document.getElementById('stone-texture').value,
        transparency: document.getElementById('stone-transparency').value,
        special_features: document.getElementById('stone-features').value,
        is_hiuchiishi: document.getElementById('stone-hiuchiishi').value === 'true',
        image_url: currentStoneImage, // 画像データを追加
        // 位置情報フィールド
        location_name: document.getElementById('stone-location-name').value || null,
        prefecture: document.getElementById('stone-prefecture').value || null,
        city: document.getElementById('stone-city').value || null,
        location_tag: document.getElementById('stone-location-tag').value || null,
        location_detail: document.getElementById('stone-location-detail').value || null,
        location_notes: document.getElementById('stone-location-notes').value || null,
        address: document.getElementById('stone-address').value || null,
        map_url: document.getElementById('stone-address').value || null, // addressと同じ値を使用
        lat: document.getElementById('stone-lat').value ? parseFloat(document.getElementById('stone-lat').value) : null,
        lng: document.getElementById('stone-lng').value ? parseFloat(document.getElementById('stone-lng').value) : null
    };
    
    try {
        const { error } = await supabase
            .from('stones')
            .upsert(formData);
        
        if (error) throw error;
        
        const index = stonesList.findIndex(s => s.id === currentStoneId);
        if (index !== -1) {
            stonesList[index] = formData;
        }
        
        displayStonesList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// saveStone関数を新しいものに置き換え
window.saveStone = saveStoneWithImage;

// グローバル関数として公開
window.addNewNoroshiya = addNewNoroshiya;
window.addNewBird = addNewBird;
window.addNewStone = addNewStone;
window.selectNoroshiya = selectNoroshiya;
window.selectBird = selectBird;
window.selectStone = selectStone;
window.saveNoroshiya = saveNoroshiya;
window.saveBird = saveBird;
window.saveStone = saveStoneWithImage;
window.cancelEdit = cancelEdit;
window.cancelBirdEdit = cancelBirdEdit;
window.cancelStoneEdit = cancelStoneEdit;
window.deleteNoroshiya = deleteNoroshiya;
window.deleteBird = deleteBird;
window.deleteStone = deleteStone;
window.handleStoneImageSelect = handleStoneImageSelect;

// GoogleマップURLから緯度経度を抽出
function extractLatLngFromUrl(url) {
    if (!url) return;
    
    let lat = null;
    let lng = null;
    
    // パターン1: @緯度,経度,ズームz の形式
    const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match1 = url.match(pattern1);
    if (match1) {
        lat = parseFloat(match1[1]);
        lng = parseFloat(match1[2]);
    }
    
    // パターン2: place/場所名/@緯度,経度,ズームz の形式
    const pattern2 = /place\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match2 = url.match(pattern2);
    if (match2) {
        lat = parseFloat(match2[1]);
        lng = parseFloat(match2[2]);
    }
    
    // パターン3: dir/出発地/目的地/@緯度,経度,ズームz の形式
    const pattern3 = /dir\/[^\/]+\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match3 = url.match(pattern3);
    if (match3) {
        lat = parseFloat(match3[1]);
        lng = parseFloat(match3[2]);
    }
    
    // パターン4: search/検索キーワード/@緯度,経度,ズームz の形式
    const pattern4 = /search\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match4 = url.match(pattern4);
    if (match4) {
        lat = parseFloat(match4[1]);
        lng = parseFloat(match4[2]);
    }
    
    // パターン5: !3d緯度!4d経度 の形式（ストリートビューなど）
    const pattern5 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const match5 = url.match(pattern5);
    if (match5) {
        lat = parseFloat(match5[1]);
        lng = parseFloat(match5[2]);
    }
    
    // パターン6: ll=緯度,経度 の形式（古い形式）
    const pattern6 = /ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match6 = url.match(pattern6);
    if (match6) {
        lat = parseFloat(match6[1]);
        lng = parseFloat(match6[2]);
    }
    
    // パターン7: q=緯度,経度 の形式（検索クエリ）
    const pattern7 = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match7 = url.match(pattern7);
    if (match7) {
        lat = parseFloat(match7[1]);
        lng = parseFloat(match7[2]);
    }
    
    // 緯度経度が見つかった場合、フィールドに自動入力
    if (lat !== null && lng !== null) {
        document.getElementById('stone-lat').value = lat;
        document.getElementById('stone-lng').value = lng;
        
        // ユーザーに通知
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
        notification.textContent = `緯度経度を自動抽出しました: ${lat}, ${lng}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

window.extractLatLngFromUrl = extractLatLngFromUrl;

// 採取ポイント管理機能
function loadSavedLocations() {
    // ローカルストレージから採取ポイントを読み込み
    const saved = localStorage.getItem('twinpeach_saved_locations');
    if (saved) {
        savedLocations = JSON.parse(saved);
    } else {
        savedLocations = [];
    }
    
    // セレクトボックスを更新
    updateLocationSelect();
}

// 採取ポイントセレクトボックスを更新
function updateLocationSelect() {
    const select = document.getElementById('saved-locations');
    if (!select) return;
    
    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // 保存された採取ポイントを追加
    savedLocations.forEach((location, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${location.name} (${location.prefecture}${location.city || ''})`;
        select.appendChild(option);
    });
}

// 選択された採取ポイントを読み込み
function loadSavedLocation() {
    const select = document.getElementById('saved-locations');
    const index = select.value;
    
    if (index === '') return;
    
    const location = savedLocations[parseInt(index)];
    if (!location) return;
    
    // フォームに値を設定
    document.getElementById('stone-location-name').value = location.location_name || '';
    document.getElementById('stone-prefecture').value = location.prefecture || '';
    document.getElementById('stone-city').value = location.city || '';
    document.getElementById('stone-location-tag').value = location.location_tag || '';
    document.getElementById('stone-location-detail').value = location.location_detail || '';
    document.getElementById('stone-location-notes').value = location.location_notes || '';
    document.getElementById('stone-address').value = location.address || '';
    document.getElementById('stone-lat').value = location.lat || '';
    document.getElementById('stone-lng').value = location.lng || '';
    
    // ユーザーに通知
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #9b59b6; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
    notification.textContent = `採取ポイント「${location.name}」を読み込みました`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 現在の入力内容を採取ポイントとして保存
function saveCurrentLocation() {
    const locationName = document.getElementById('stone-location-name').value;
    const prefecture = document.getElementById('stone-prefecture').value;
    
    if (!locationName || !prefecture) {
        alert('場所名と都道府県は必須です');
        return;
    }
    
    // 採取ポイントデータを作成
    const newLocation = {
        name: locationName,
        location_name: locationName,
        prefecture: prefecture,
        city: document.getElementById('stone-city').value,
        location_tag: document.getElementById('stone-location-tag').value,
        location_detail: document.getElementById('stone-location-detail').value,
        location_notes: document.getElementById('stone-location-notes').value,
        address: document.getElementById('stone-address').value,
        lat: document.getElementById('stone-lat').value ? parseFloat(document.getElementById('stone-lat').value) : null,
        lng: document.getElementById('stone-lng').value ? parseFloat(document.getElementById('stone-lng').value) : null,
        created_at: new Date().toISOString()
    };
    
    // 重複チェック
    const exists = savedLocations.some(loc => 
        loc.name === newLocation.name && 
        loc.prefecture === newLocation.prefecture &&
        loc.city === newLocation.city
    );
    
    if (exists) {
        if (!confirm('同じ名前の採取ポイントが既に存在します。上書きしますか？')) {
            return;
        }
        // 既存の場所を更新
        const index = savedLocations.findIndex(loc => 
            loc.name === newLocation.name && 
            loc.prefecture === newLocation.prefecture &&
            loc.city === newLocation.city
        );
        savedLocations[index] = newLocation;
    } else {
        // 新規追加
        savedLocations.push(newLocation);
    }
    
    // ローカルストレージに保存
    localStorage.setItem('twinpeach_saved_locations', JSON.stringify(savedLocations));
    
    // セレクトボックスを更新
    updateLocationSelect();
    
    // ユーザーに通知
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
    notification.textContent = `採取ポイント「${locationName}」を保存しました`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// グローバル関数として公開
window.loadSavedLocation = loadSavedLocation;
window.saveCurrentLocation = saveCurrentLocation;