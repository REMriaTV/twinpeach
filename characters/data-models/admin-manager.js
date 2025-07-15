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
            statusEl.textContent = '✅ クラウド保存モード';
            statusEl.title = 'データはSupabaseデータベースに保存されます';
            break;
        case 'disconnected':
            statusEl.classList.add('status-disconnected');
            statusEl.textContent = '❌ データベース接続エラー';
            statusEl.title = 'データベースに接続できません';
            break;
        case 'local':
            statusEl.classList.add('status-local');
            statusEl.textContent = '📱 ブラウザ保存モード';
            statusEl.title = 'データはこのブラウザにのみ保存されます（他の端末と共有されません）';
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
    document.getElementById('bird-recordings-list').innerHTML = '';
    
    // ファイルアップロードイベントリスナーを設定
    const uploadInput = document.getElementById('bird-recording-upload');
    uploadInput.onchange = handleBirdRecordingUpload;
    
    if (bird) {
        title.textContent = '鳥データを編集';
        // フォームに値を設定
        form.id.value = bird.id;
        form.id.disabled = true; // IDは編集不可
        form.name.value = bird.name || '';
        form.scientific_name.value = bird.scientificName || '';
        form.family.value = bird.family || '';
        form.size.value = bird.size || '';
        form.habitat.value = bird.habitat || '';
        form.appearance.value = bird.characteristics?.appearance || '';
        form.voice.value = bird.characteristics?.voice || '';
        form.behavior.value = bird.characteristics?.behavior || '';
        form.activity.value = bird.lifeStyle?.activity || '';
        form.diet.value = bird.lifeStyle?.diet || '';
        form.social_behavior.value = bird.lifeStyle?.socialBehavior || '';
        form.nesting_habits.value = bird.lifeStyle?.nestingHabits || '';
        form.personality_general.value = bird.personality?.general || '';
        form.human_interaction.value = bird.personality?.humanInteraction || '';
        form.intelligence.value = bird.personality?.intelligence || '';
        form.seasonal_spring.value = bird.seasonalBehavior?.spring || '';
        form.seasonal_summer.value = bird.seasonalBehavior?.summer || '';
        form.seasonal_autumn.value = bird.seasonalBehavior?.autumn || '';
        form.seasonal_winter.value = bird.seasonalBehavior?.winter || '';
        form.symbolism_cultural.value = bird.symbolism?.cultural || '';
        form.symbolism_spiritual.value = bird.symbolism?.spiritual || '';
        form.noroshiya_smoking_style.value = bird.noroshiyaTraits?.smokingStyle || '';
        form.noroshiya_communication_style.value = bird.noroshiyaTraits?.communicationStyle || '';
        
        // タグの復元
        if (bird.noroshiyaTraits?.suitableTypes && Array.isArray(bird.noroshiyaTraits.suitableTypes)) {
            bird.noroshiyaTraits.suitableTypes.forEach(type => {
                addTagToList('bird-suitable-types-tags', type);
            });
        }
        
        // 録音ファイルを表示
        if (bird.recordings && Array.isArray(bird.recordings)) {
            temporaryRecordings = [...bird.recordings]; // 既存の録音を一時配列にコピー
            displayBirdRecordings(bird.recordings);
        }
    } else {
        title.textContent = '新しい鳥を追加';
        form.id.disabled = false;
        temporaryRecordings = []; // 新規追加時は一時配列をクリア
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
    document.getElementById('stone-photos-list').innerHTML = '';
    
    // ファイルアップロードイベントリスナーを設定
    const uploadInput = document.getElementById('stone-photo-upload');
    uploadInput.onchange = handleStonePhotoUpload;
    
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
        form.appearance.value = stone.characteristics?.appearance || '';
        form.weight.value = stone.characteristics?.weight || '';
        form.hardness.value = stone.characteristics?.hardness || '';
        form.special_features.value = stone.characteristics?.specialFeatures || '';
        form.elemental_element.value = stone.elementalProperties?.element || '';
        form.elemental_energy.value = stone.elementalProperties?.energy || '';
        form.elemental_resonance.value = stone.elementalProperties?.resonance || '';
        form.noroshiya_primary_match.value = stone.noroshiyaAffinity?.primaryMatch || '';
        form.noroshiya_match_reason.value = stone.noroshiyaAffinity?.matchReason || '';
        form.noroshiya_special_reaction.value = stone.noroshiyaAffinity?.specialReaction || '';
        form.folklore_legend.value = stone.folklore?.legend || '';
        form.folklore_usage.value = stone.folklore?.usage || '';
        
        // タグの復元
        if (Array.isArray(stone.colors)) {
            stone.colors.forEach(color => {
                addTagToList('stone-colors-tags', color);
            });
        }
        if (stone.findingLocations && Array.isArray(stone.findingLocations)) {
            stone.findingLocations.forEach(loc => {
                addTagToList('stone-locations-tags', loc);
            });
        }
        if (stone.matchingKeywords && Array.isArray(stone.matchingKeywords)) {
            stone.matchingKeywords.forEach(keyword => {
                addTagToList('stone-keywords-tags', keyword);
            });
        }
        
        // 写真を表示
        if (stone.photos && Array.isArray(stone.photos)) {
            temporaryStonePhotos = [...stone.photos]; // 既存の写真を一時配列にコピー
            displayStonePhotos(stone.photos);
        }
    } else {
        title.textContent = '新しい石を追加';
        form.id.disabled = false;
        temporaryStonePhotos = []; // 新規追加時は一時配列をクリア
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
        scientificName: form.scientific_name.value,
        family: form.family.value,
        size: form.size.value,
        habitat: form.habitat.value,
        characteristics: {
            appearance: form.appearance.value,
            voice: form.voice.value,
            behavior: form.behavior.value
        },
        lifeStyle: {
            activity: form.activity.value,
            diet: form.diet.value,
            socialBehavior: form.social_behavior.value,
            nestingHabits: form.nesting_habits.value
        },
        personality: {
            general: form.personality_general.value,
            humanInteraction: form.human_interaction.value,
            intelligence: form.intelligence.value
        },
        seasonalBehavior: {
            spring: form.seasonal_spring.value,
            summer: form.seasonal_summer.value,
            autumn: form.seasonal_autumn.value,
            winter: form.seasonal_winter.value
        },
        symbolism: {
            cultural: form.symbolism_cultural.value,
            spiritual: form.symbolism_spiritual.value
        },
        noroshiyaTraits: {
            suitableTypes: suitableTypes,
            smokingStyle: form.noroshiya_smoking_style.value,
            communicationStyle: form.noroshiya_communication_style.value
        },
        recordings: temporaryRecordings // 録音データを追加
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
        characteristics: {
            appearance: form.appearance.value,
            weight: form.weight.value,
            hardness: form.hardness.value,
            specialFeatures: form.special_features.value
        },
        elementalProperties: {
            element: form.elemental_element.value,
            energy: form.elemental_energy.value,
            resonance: form.elemental_resonance.value
        },
        findingLocations: locations,
        matchingKeywords: keywords,
        noroshiyaAffinity: {
            primaryMatch: form.noroshiya_primary_match.value,
            matchReason: form.noroshiya_match_reason.value,
            specialReaction: form.noroshiya_special_reaction.value
        },
        folklore: {
            legend: form.folklore_legend.value,
            usage: form.folklore_usage.value
        },
        photos: temporaryStonePhotos // 写真データを追加
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
    temporaryRecordings = []; // 一時録音データをクリア
}

function closeStoneForm() {
    document.getElementById('stone-form-modal').style.display = 'none';
    editingStone = null;
    temporaryStonePhotos = []; // 一時写真データをクリア
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

// 録音ファイル管理
let temporaryRecordings = []; // アップロード中の一時的な録音データ

// 録音ファイルのアップロード処理
function handleBirdRecordingUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const recording = {
                id: `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                dataUrl: e.target.result,
                uploadedAt: new Date().toISOString(),
                type: file.type.startsWith('audio/') ? 'audio' : 'video',
                metadata: {
                    recordedDate: '',
                    location: '',
                    voiceType: '',
                    notes: ''
                }
            };
            
            temporaryRecordings.push(recording);
            displayBirdRecordings([...temporaryRecordings]);
        };
        
        reader.readAsDataURL(file);
    }
    
    // 入力をリセット
    event.target.value = '';
}

// 録音ファイルの表示
function displayBirdRecordings(recordings) {
    const listEl = document.getElementById('bird-recordings-list');
    
    if (!recordings || recordings.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 12px;">録音・動画はまだありません</div>';
        return;
    }
    
    listEl.innerHTML = recordings.map(rec => `
        <div class="recording-item">
            <div class="file-icon">${rec.type === 'audio' ? '🎵' : '🎬'}</div>
            <div class="file-info">
                <div class="file-name">${rec.fileName}</div>
                <div class="file-details">
                    ${formatFileSize(rec.fileSize)} • ${new Date(rec.uploadedAt).toLocaleDateString('ja-JP')}
                </div>
            </div>
            ${rec.type === 'audio' ? 
                `<audio controls src="${rec.dataUrl}"></audio>` :
                `<video controls src="${rec.dataUrl}" style="max-height: 100px;"></video>`
            }
            <div class="file-actions">
                <button class="btn btn-sm btn-secondary" onclick="editRecordingMetadata('${rec.id}')">📝</button>
                <button class="btn btn-sm btn-danger" onclick="removeRecording('${rec.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ファイルサイズのフォーマット
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024) * 10) / 10 + ' MB';
}

// 録音の削除
function removeRecording(recordingId) {
    temporaryRecordings = temporaryRecordings.filter(rec => rec.id !== recordingId);
    displayBirdRecordings(temporaryRecordings);
}

// 録音メタデータの編集（今後実装）
function editRecordingMetadata(recordingId) {
    alert('録音の詳細情報編集機能は今後実装予定です');
}

// 石の写真管理
let temporaryStonePhotos = []; // アップロード中の一時的な写真データ

// 石の写真アップロード処理
function handleStonePhotoUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        // 画像ファイルのみ処理
        if (!file.type.startsWith('image/')) {
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const photo = {
                id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                dataUrl: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            
            temporaryStonePhotos.push(photo);
            displayStonePhotos([...temporaryStonePhotos]);
        };
        
        reader.readAsDataURL(file);
    }
    
    // 入力をリセット
    event.target.value = '';
}

// 石の写真表示
function displayStonePhotos(photos) {
    const listEl = document.getElementById('stone-photos-list');
    
    if (!photos || photos.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 24px;">写真はまだありません</div>';
        return;
    }
    
    listEl.innerHTML = photos.map(photo => `
        <div class="photo-item">
            <img src="${photo.dataUrl}" alt="${photo.fileName}" onclick="viewPhoto('${photo.dataUrl}')">
            <button class="photo-remove" onclick="removeStonePhoto('${photo.id}')">×</button>
        </div>
    `).join('');
}

// 写真の削除
function removeStonePhoto(photoId) {
    temporaryStonePhotos = temporaryStonePhotos.filter(photo => photo.id !== photoId);
    displayStonePhotos(temporaryStonePhotos);
}

// 写真の拡大表示（簡易版）
function viewPhoto(dataUrl) {
    window.open(dataUrl, '_blank');
}