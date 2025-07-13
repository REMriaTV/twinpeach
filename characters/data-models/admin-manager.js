// 鳥・石データ管理画面用JavaScript（編集機能付き）

// Supabase設定
const SUPABASE_URL = 'https://roaucowddadmvxgzrvnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXVjb3dkZGFkbXZ4Z3pydm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxMDMsImV4cCI6MjA2NzgyMDEwM30.Tqs__X1JOfPiKsb5llj93jVLnyszF_ZrZjfp_UaIiNw';

let supabase;
let isSupabaseConnected = false;
let currentTab = 'birds';
let currentBirds = [];
let currentStones = [];
let editingBird = null;
let editingStone = null;

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // Supabase接続を試みる
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 接続テスト
        const { data, error } = await supabase.from('birds').select('id').limit(1);
        if (!error) {
            isSupabaseConnected = true;
            updateConnectionStatus('connected');
            loadDataFromSupabase();
        } else {
            throw error;
        }
    } catch (error) {
        console.log('Supabase接続エラー、ローカルストレージを使用します:', error);
        isSupabaseConnected = false;
        updateConnectionStatus('local');
        loadDataFromLocal();
    }
});

// 接続状態の更新
function updateConnectionStatus(status) {
    const statusEl = document.getElementById('connection-status');
    statusEl.className = 'connection-status';
    
    switch(status) {
        case 'connected':
            statusEl.classList.add('status-connected');
            statusEl.textContent = '✅ データベース接続中';
            break;
        case 'disconnected':
            statusEl.classList.add('status-disconnected');
            statusEl.textContent = '❌ データベース接続エラー';
            break;
        case 'local':
            statusEl.classList.add('status-local');
            statusEl.textContent = '📱 ローカルストレージモード';
            break;
    }
}

// Supabaseからデータを読み込み
async function loadDataFromSupabase() {
    try {
        // 鳥データ
        const { data: birds, error: birdsError } = await supabase
            .from('birds')
            .select('*')
            .order('name');
        
        if (birdsError) throw birdsError;
        currentBirds = birds || [];
        
        // 石データ
        const { data: stones, error: stonesError } = await supabase
            .from('stones')
            .select('*')
            .order('name');
        
        if (stonesError) throw stonesError;
        currentStones = stones || [];
        
        // 表示を更新
        displayBirds(currentBirds);
        displayStones(currentStones);
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        showMessage('データの読み込みに失敗しました', 'error');
        // フォールバックとしてローカルデータを使用
        loadDataFromLocal();
    }
}

// ローカルストレージからデータを読み込み
function loadDataFromLocal() {
    // ローカルストレージから読み込み
    const savedBirds = localStorage.getItem('masterBirds');
    const savedStones = localStorage.getItem('masterStones');
    
    if (savedBirds) {
        currentBirds = JSON.parse(savedBirds);
    } else {
        // 初期データを使用
        currentBirds = birdsDatabase || [];
        localStorage.setItem('masterBirds', JSON.stringify(currentBirds));
    }
    
    if (savedStones) {
        currentStones = JSON.parse(savedStones);
    } else {
        // 初期データを使用
        currentStones = stonesDatabase || [];
        localStorage.setItem('masterStones', JSON.stringify(currentStones));
    }
    
    displayBirds(currentBirds);
    displayStones(currentStones);
}

// タブ切り替え
function showTab(tab) {
    currentTab = tab;
    
    // タブボタンの状態を更新
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // コンテンツの表示切り替え
    document.getElementById('birds-tab').style.display = tab === 'birds' ? 'block' : 'none';
    document.getElementById('stones-tab').style.display = tab === 'stones' ? 'block' : 'none';
}

// 鳥データの表示（テーブル形式）
function displayBirds(birds) {
    const listEl = document.getElementById('birds-list');
    
    if (birds.length === 0) {
        listEl.innerHTML = '<div class="loading">データがありません</div>';
        return;
    }
    
    listEl.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>名前</th>
                    <th>学名</th>
                    <th>科</th>
                    <th>サイズ</th>
                    <th>適合タイプ</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${birds.map(bird => `
                    <tr>
                        <td><strong>${bird.name}</strong></td>
                        <td>${bird.scientific_name || '-'}</td>
                        <td>${bird.family || '-'}</td>
                        <td>${bird.size || '-'}</td>
                        <td>${Array.isArray(bird.noroshiya_suitable_types) ? bird.noroshiya_suitable_types.join(', ') : '-'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="editBird('${bird.id}')">編集</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteBird('${bird.id}')">削除</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 石データの表示（テーブル形式）
function displayStones(stones) {
    const listEl = document.getElementById('stones-list');
    
    if (stones.length === 0) {
        listEl.innerHTML = '<div class="loading">データがありません</div>';
        return;
    }
    
    listEl.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>名前</th>
                    <th>色</th>
                    <th>サイズ</th>
                    <th>レアリティ</th>
                    <th>相性の良い狼煙屋</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${stones.map(stone => `
                    <tr>
                        <td><strong>${stone.name}</strong></td>
                        <td>${Array.isArray(stone.colors) ? stone.colors.join(', ') : '-'}</td>
                        <td>${stone.size || '-'}</td>
                        <td>${stone.rarity || '-'}</td>
                        <td>${stone.noroshiya_primary_match || '-'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="editStone('${stone.id}')">編集</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteStone('${stone.id}')">削除</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 鳥の編集フォームを表示
function showBirdForm(bird = null) {
    editingBird = bird;
    const form = document.getElementById('bird-form');
    const title = document.getElementById('bird-form-title');
    
    // フォームをリセット
    form.reset();
    document.getElementById('bird-suitable-types-tags').innerHTML = '';
    
    if (bird) {
        title.textContent = '鳥データを編集';
        // フォームに値を設定
        form.id.value = bird.id;
        form.id.disabled = true; // IDは編集不可
        form.name.value = bird.name || '';
        form.scientific_name.value = bird.scientific_name || '';
        form.family.value = bird.family || '';
        form.size.value = bird.size || '';
        form.habitat.value = bird.habitat || '';
        form.appearance.value = bird.appearance || '';
        form.voice.value = bird.voice || '';
        form.behavior.value = bird.behavior || '';
        form.activity.value = bird.activity || '';
        form.diet.value = bird.diet || '';
        form.social_behavior.value = bird.social_behavior || '';
        form.nesting_habits.value = bird.nesting_habits || '';
        form.personality_general.value = bird.personality_general || '';
        form.human_interaction.value = bird.human_interaction || '';
        form.intelligence.value = bird.intelligence || '';
        form.seasonal_spring.value = bird.seasonal_spring || '';
        form.seasonal_summer.value = bird.seasonal_summer || '';
        form.seasonal_autumn.value = bird.seasonal_autumn || '';
        form.seasonal_winter.value = bird.seasonal_winter || '';
        form.symbolism_cultural.value = bird.symbolism_cultural || '';
        form.symbolism_spiritual.value = bird.symbolism_spiritual || '';
        form.noroshiya_smoking_style.value = bird.noroshiya_smoking_style || '';
        form.noroshiya_communication_style.value = bird.noroshiya_communication_style || '';
        
        // タグの復元
        if (Array.isArray(bird.noroshiya_suitable_types)) {
            bird.noroshiya_suitable_types.forEach(type => {
                addTagToList('bird-suitable-types-tags', type);
            });
        }
    } else {
        title.textContent = '新しい鳥を追加';
        form.id.disabled = false;
    }
    
    document.getElementById('bird-form-modal').style.display = 'block';
}

// 鳥の編集
function editBird(birdId) {
    const bird = currentBirds.find(b => b.id === birdId);
    if (bird) {
        showBirdForm(bird);
    }
}

// 石の編集フォームを表示
function showStoneForm(stone = null) {
    editingStone = stone;
    const form = document.getElementById('stone-form');
    const title = document.getElementById('stone-form-title');
    
    // フォームをリセット
    form.reset();
    document.getElementById('stone-colors-tags').innerHTML = '';
    document.getElementById('stone-locations-tags').innerHTML = '';
    document.getElementById('stone-keywords-tags').innerHTML = '';
    
    if (stone) {
        title.textContent = '石データを編集';
        // フォームに値を設定
        form.id.value = stone.id;
        form.id.disabled = true;
        form.name.value = stone.name || '';
        form.type.value = stone.type || '火打石';
        form.size.value = stone.size || '';
        form.shape.value = stone.shape || '';
        form.texture.value = stone.texture || '';
        form.origin.value = stone.origin || '';
        form.rarity.value = stone.rarity || '';
        form.appearance.value = stone.appearance || '';
        form.weight.value = stone.weight || '';
        form.hardness.value = stone.hardness || '';
        form.special_features.value = stone.special_features || '';
        form.elemental_element.value = stone.elemental_element || '';
        form.elemental_energy.value = stone.elemental_energy || '';
        form.elemental_resonance.value = stone.elemental_resonance || '';
        form.noroshiya_primary_match.value = stone.noroshiya_primary_match || '';
        form.noroshiya_match_reason.value = stone.noroshiya_match_reason || '';
        form.noroshiya_special_reaction.value = stone.noroshiya_special_reaction || '';
        form.folklore_legend.value = stone.folklore_legend || '';
        form.folklore_usage.value = stone.folklore_usage || '';
        
        // タグの復元
        if (Array.isArray(stone.colors)) {
            stone.colors.forEach(color => {
                addTagToList('stone-colors-tags', color);
            });
        }
        if (stone.finding_locations) {
            const locations = Array.isArray(stone.finding_locations) ? 
                stone.finding_locations : 
                (stone.finding_locations.locations || []);
            locations.forEach(loc => {
                addTagToList('stone-locations-tags', loc);
            });
        }
        if (Array.isArray(stone.matching_keywords)) {
            stone.matching_keywords.forEach(keyword => {
                addTagToList('stone-keywords-tags', keyword);
            });
        }
    } else {
        title.textContent = '新しい石を追加';
        form.id.disabled = false;
    }
    
    document.getElementById('stone-form-modal').style.display = 'block';
}

// 石の編集
function editStone(stoneId) {
    const stone = currentStones.find(s => s.id === stoneId);
    if (stone) {
        showStoneForm(stone);
    }
}

// タグを追加する共通関数
function addTagToList(listId, value) {
    if (!value) return;
    
    const tagList = document.getElementById(listId);
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.innerHTML = `
        ${value}
        <span class="tag-remove" onclick="removeTag(this)">×</span>
    `;
    tagList.appendChild(tagEl);
}

// タグを削除
function removeTag(element) {
    element.parentElement.remove();
}

// 鳥のタグ追加（Enterキー）
function addBirdTag(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        if (value) {
            addTagToList('bird-suitable-types-tags', value);
            input.value = '';
        }
    }
}

// 石の色追加
function addStoneColor(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        if (value) {
            addTagToList('stone-colors-tags', value);
            input.value = '';
        }
    }
}

// 石の場所追加
function addStoneLocation(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        if (value) {
            addTagToList('stone-locations-tags', value);
            input.value = '';
        }
    }
}

// 石のキーワード追加
function addStoneKeyword(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        if (value) {
            addTagToList('stone-keywords-tags', value);
            input.value = '';
        }
    }
}

// 鳥データの保存
async function saveBird(event) {
    event.preventDefault();
    const form = event.target;
    
    // タグからデータを収集
    const suitableTypes = Array.from(document.querySelectorAll('#bird-suitable-types-tags .tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    const birdData = {
        id: form.id.value,
        name: form.name.value,
        scientific_name: form.scientific_name.value,
        family: form.family.value,
        size: form.size.value,
        habitat: form.habitat.value,
        appearance: form.appearance.value,
        voice: form.voice.value,
        behavior: form.behavior.value,
        activity: form.activity.value,
        diet: form.diet.value,
        social_behavior: form.social_behavior.value,
        nesting_habits: form.nesting_habits.value,
        personality_general: form.personality_general.value,
        human_interaction: form.human_interaction.value,
        intelligence: form.intelligence.value,
        seasonal_spring: form.seasonal_spring.value,
        seasonal_summer: form.seasonal_summer.value,
        seasonal_autumn: form.seasonal_autumn.value,
        seasonal_winter: form.seasonal_winter.value,
        symbolism_cultural: form.symbolism_cultural.value,
        symbolism_spiritual: form.symbolism_spiritual.value,
        noroshiya_suitable_types: suitableTypes,
        noroshiya_smoking_style: form.noroshiya_smoking_style.value,
        noroshiya_communication_style: form.noroshiya_communication_style.value
    };
    
    try {
        if (isSupabaseConnected) {
            // Supabaseに保存
            if (editingBird) {
                const { error } = await supabase
                    .from('birds')
                    .update(birdData)
                    .eq('id', birdData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('birds')
                    .insert([birdData]);
                if (error) throw error;
            }
        } else {
            // ローカルストレージに保存
            if (editingBird) {
                const index = currentBirds.findIndex(b => b.id === birdData.id);
                currentBirds[index] = birdData;
            } else {
                currentBirds.push(birdData);
            }
            localStorage.setItem('masterBirds', JSON.stringify(currentBirds));
        }
        
        showMessage('保存しました', 'success');
        closeBirdForm();
        
        // データを再読み込み
        if (isSupabaseConnected) {
            await loadDataFromSupabase();
        } else {
            displayBirds(currentBirds);
        }
        
    } catch (error) {
        console.error('保存エラー:', error);
        showMessage('保存に失敗しました', 'error');
    }
}

// 石データの保存
async function saveStone(event) {
    event.preventDefault();
    const form = event.target;
    
    // タグからデータを収集
    const colors = Array.from(document.querySelectorAll('#stone-colors-tags .tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    const locations = Array.from(document.querySelectorAll('#stone-locations-tags .tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    const keywords = Array.from(document.querySelectorAll('#stone-keywords-tags .tag'))
        .map(tag => tag.textContent.replace('×', '').trim());
    
    const stoneData = {
        id: form.id.value,
        name: form.name.value,
        type: form.type.value,
        colors: colors,
        size: form.size.value,
        shape: form.shape.value,
        texture: form.texture.value,
        origin: form.origin.value,
        rarity: form.rarity.value,
        appearance: form.appearance.value,
        weight: form.weight.value,
        hardness: form.hardness.value,
        special_features: form.special_features.value,
        elemental_element: form.elemental_element.value,
        elemental_energy: form.elemental_energy.value,
        elemental_resonance: form.elemental_resonance.value,
        finding_locations: isSupabaseConnected ? { locations } : locations,
        matching_keywords: keywords,
        noroshiya_primary_match: form.noroshiya_primary_match.value,
        noroshiya_match_reason: form.noroshiya_match_reason.value,
        noroshiya_special_reaction: form.noroshiya_special_reaction.value,
        folklore_legend: form.folklore_legend.value,
        folklore_usage: form.folklore_usage.value
    };
    
    try {
        if (isSupabaseConnected) {
            // Supabaseに保存
            if (editingStone) {
                const { error } = await supabase
                    .from('stones')
                    .update(stoneData)
                    .eq('id', stoneData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('stones')
                    .insert([stoneData]);
                if (error) throw error;
            }
        } else {
            // ローカルストレージに保存
            if (editingStone) {
                const index = currentStones.findIndex(s => s.id === stoneData.id);
                currentStones[index] = stoneData;
            } else {
                currentStones.push(stoneData);
            }
            localStorage.setItem('masterStones', JSON.stringify(currentStones));
        }
        
        showMessage('保存しました', 'success');
        closeStoneForm();
        
        // データを再読み込み
        if (isSupabaseConnected) {
            await loadDataFromSupabase();
        } else {
            displayStones(currentStones);
        }
        
    } catch (error) {
        console.error('保存エラー:', error);
        showMessage('保存に失敗しました', 'error');
    }
}

// 鳥の削除
async function deleteBird(birdId) {
    if (!confirm('本当に削除しますか？')) return;
    
    try {
        if (isSupabaseConnected) {
            const { error } = await supabase
                .from('birds')
                .delete()
                .eq('id', birdId);
            if (error) throw error;
        } else {
            currentBirds = currentBirds.filter(b => b.id !== birdId);
            localStorage.setItem('masterBirds', JSON.stringify(currentBirds));
        }
        
        showMessage('削除しました', 'success');
        
        // データを再読み込み
        if (isSupabaseConnected) {
            await loadDataFromSupabase();
        } else {
            displayBirds(currentBirds);
        }
        
    } catch (error) {
        console.error('削除エラー:', error);
        showMessage('削除に失敗しました', 'error');
    }
}

// 石の削除
async function deleteStone(stoneId) {
    if (!confirm('本当に削除しますか？')) return;
    
    try {
        if (isSupabaseConnected) {
            const { error } = await supabase
                .from('stones')
                .delete()
                .eq('id', stoneId);
            if (error) throw error;
        } else {
            currentStones = currentStones.filter(s => s.id !== stoneId);
            localStorage.setItem('masterStones', JSON.stringify(currentStones));
        }
        
        showMessage('削除しました', 'success');
        
        // データを再読み込み
        if (isSupabaseConnected) {
            await loadDataFromSupabase();
        } else {
            displayStones(currentStones);
        }
        
    } catch (error) {
        console.error('削除エラー:', error);
        showMessage('削除に失敗しました', 'error');
    }
}

// フォームを閉じる
function closeBirdForm() {
    document.getElementById('bird-form-modal').style.display = 'none';
    editingBird = null;
}

function closeStoneForm() {
    document.getElementById('stone-form-modal').style.display = 'none';
    editingStone = null;
}

// 検索機能
function searchBirds() {
    const searchTerm = document.getElementById('bird-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayBirds(currentBirds);
        return;
    }
    
    const filtered = currentBirds.filter(bird => 
        bird.name.toLowerCase().includes(searchTerm) ||
        (bird.scientific_name && bird.scientific_name.toLowerCase().includes(searchTerm)) ||
        (bird.family && bird.family.toLowerCase().includes(searchTerm))
    );
    
    displayBirds(filtered);
}

function searchStones() {
    const searchTerm = document.getElementById('stone-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayStones(currentStones);
        return;
    }
    
    const filtered = currentStones.filter(stone => 
        stone.name.toLowerCase().includes(searchTerm) ||
        (stone.colors && stone.colors.some(color => color.toLowerCase().includes(searchTerm))) ||
        (stone.matching_keywords && stone.matching_keywords.some(keyword => keyword.includes(searchTerm)))
    );
    
    displayStones(filtered);
}

// メッセージ表示
function showMessage(message, type) {
    const msgEl = document.createElement('div');
    msgEl.className = type === 'error' ? 'error' : 'success';
    msgEl.textContent = message;
    
    document.querySelector('.container').insertBefore(msgEl, document.querySelector('.tab-container'));
    
    setTimeout(() => {
        msgEl.remove();
    }, 3000);
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    if (event.target.className === 'form-modal') {
        closeBirdForm();
        closeStoneForm();
    }
}

// Enterキーで検索
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bird-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBirds();
    });
    
    document.getElementById('stone-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchStones();
    });
});