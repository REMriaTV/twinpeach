// データ管理用JavaScript

let currentTab = 'birds';
let currentBirds = [];
let currentStones = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadBirdsData();
    loadStonesData();
});

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

// 鳥データの読み込みと表示
function loadBirdsData() {
    try {
        currentBirds = BirdsDB.getAll();
        displayBirds(currentBirds);
    } catch (error) {
        document.getElementById('birds-grid').innerHTML = '<div class="error">データの読み込みに失敗しました。</div>';
    }
}

// 鳥データの表示
function displayBirds(birds) {
    const grid = document.getElementById('birds-grid');
    
    if (birds.length === 0) {
        grid.innerHTML = '<div class="loading">データが見つかりません。</div>';
        return;
    }
    
    grid.innerHTML = birds.map(bird => `
        <div class="data-card bird-card" onclick="showBirdDetail('${bird.id}')">
            <h3>${bird.name}（${bird.scientificName}）</h3>
            <div class="bird-info">
                <div class="info-row">
                    <span class="info-label">科:</span>
                    <span class="info-value">${bird.family}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">サイズ:</span>
                    <span class="info-value">${bird.size}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">生息地:</span>
                    <span class="info-value">${bird.habitat}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">狼煙屋タイプ:</span>
                    <span class="info-value">${bird.noroshiyaTraits.suitableTypes.join(', ')}</span>
                </div>
            </div>
            <div class="characteristics">
                <small>${bird.characteristics.appearance}</small>
            </div>
        </div>
    `).join('');
}

// 石データの読み込みと表示
function loadStonesData() {
    try {
        currentStones = StonesDB.getAll();
        displayStones(currentStones);
    } catch (error) {
        document.getElementById('stones-grid').innerHTML = '<div class="error">データの読み込みに失敗しました。</div>';
    }
}

// 石データの表示
function displayStones(stones) {
    const grid = document.getElementById('stones-grid');
    
    if (stones.length === 0) {
        grid.innerHTML = '<div class="loading">データが見つかりません。</div>';
        return;
    }
    
    grid.innerHTML = stones.map(stone => `
        <div class="data-card stone-card" onclick="showStoneDetail('${stone.id}')">
            <h3>${stone.name}</h3>
            <div class="stone-info">
                <div class="info-row">
                    <span class="info-label">色:</span>
                    <span class="info-value">
                        ${stone.colors.map(color => `<span class="tag color-tag">${color}</span>`).join('')}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">サイズ:</span>
                    <span class="info-value">${stone.size}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">形状:</span>
                    <span class="info-value">${stone.shape}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">相性の良い狼煙屋:</span>
                    <span class="info-value">${stone.noroshiyaAffinity.primaryMatch}</span>
                </div>
            </div>
            <div class="characteristics">
                <small>${stone.characteristics.appearance}</small>
            </div>
        </div>
    `).join('');
}

// 鳥の詳細表示
function showBirdDetail(birdId) {
    const bird = BirdsDB.getById(birdId);
    if (!bird) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${bird.name}</h2>
        <p><em>${bird.scientificName}</em> - ${bird.family}</p>
        
        <div class="detail-section">
            <h3>基本情報</h3>
            <div class="info-row">
                <span class="info-label">サイズ:</span>
                <span class="info-value">${bird.size}</span>
            </div>
            <div class="info-row">
                <span class="info-label">生息地:</span>
                <span class="info-value">${bird.habitat}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>特徴</h3>
            <p><strong>外見:</strong> ${bird.characteristics.appearance}</p>
            <p><strong>鳴き声:</strong> ${bird.characteristics.voice}</p>
            <p><strong>行動:</strong> ${bird.characteristics.behavior}</p>
        </div>
        
        <div class="detail-section">
            <h3>生態</h3>
            <p><strong>活動時間:</strong> ${bird.lifeStyle.activity}</p>
            <p><strong>食性:</strong> ${bird.lifeStyle.diet}</p>
            <p><strong>社会性:</strong> ${bird.lifeStyle.socialBehavior}</p>
            <p><strong>営巣:</strong> ${bird.lifeStyle.nestingHabits}</p>
        </div>
        
        <div class="detail-section">
            <h3>性格</h3>
            <p>${bird.personality.general}</p>
            <p><strong>人との関わり:</strong> ${bird.personality.humanInteraction}</p>
            <p><strong>知能:</strong> ${bird.personality.intelligence}</p>
        </div>
        
        <div class="detail-section">
            <h3>季節ごとの行動</h3>
            <p><strong>春:</strong> ${bird.seasonalBehavior.spring}</p>
            <p><strong>夏:</strong> ${bird.seasonalBehavior.summer}</p>
            <p><strong>秋:</strong> ${bird.seasonalBehavior.autumn}</p>
            <p><strong>冬:</strong> ${bird.seasonalBehavior.winter}</p>
        </div>
        
        <div class="detail-section">
            <h3>象徴性</h3>
            <p><strong>文化的意味:</strong> ${bird.symbolism.cultural}</p>
            <p><strong>精神的意味:</strong> ${bird.symbolism.spiritual}</p>
        </div>
        
        <div class="detail-section">
            <h3>狼煙屋としての特性</h3>
            <p><strong>適合タイプ:</strong> ${bird.noroshiyaTraits.suitableTypes.join(', ')}</p>
            <p><strong>煙のスタイル:</strong> ${bird.noroshiyaTraits.smokingStyle}</p>
            <p><strong>コミュニケーション:</strong> ${bird.noroshiyaTraits.communicationStyle}</p>
        </div>
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

// 石の詳細表示
function showStoneDetail(stoneId) {
    const stone = StonesDB.getById(stoneId);
    if (!stone) return;
    
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${stone.name}</h2>
        <p>${stone.type} - レアリティ: ${stone.rarity}</p>
        
        <div class="detail-section">
            <h3>基本情報</h3>
            <div class="info-row">
                <span class="info-label">色:</span>
                <span class="info-value">
                    ${stone.colors.map(color => `<span class="tag color-tag">${color}</span>`).join('')}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">サイズ:</span>
                <span class="info-value">${stone.size}</span>
            </div>
            <div class="info-row">
                <span class="info-label">形状:</span>
                <span class="info-value">${stone.shape}</span>
            </div>
            <div class="info-row">
                <span class="info-label">質感:</span>
                <span class="info-value">${stone.texture}</span>
            </div>
            <div class="info-row">
                <span class="info-label">産地:</span>
                <span class="info-value">${stone.origin}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>特徴</h3>
            <p><strong>外観:</strong> ${stone.characteristics.appearance}</p>
            <p><strong>重さ:</strong> ${stone.characteristics.weight}</p>
            <p><strong>硬さ:</strong> ${stone.characteristics.hardness}</p>
            <p><strong>特殊な特徴:</strong> ${stone.characteristics.specialFeatures}</p>
        </div>
        
        <div class="detail-section">
            <h3>元素的性質</h3>
            <p><strong>元素:</strong> ${stone.elementalProperties.element}</p>
            <p><strong>エネルギー:</strong> ${stone.elementalProperties.energy}</p>
            <p><strong>共鳴:</strong> ${stone.elementalProperties.resonance}</p>
        </div>
        
        <div class="detail-section">
            <h3>発見場所</h3>
            <ul>
                ${stone.findingLocations.map(loc => `<li>${loc}</li>`).join('')}
            </ul>
        </div>
        
        <div class="detail-section">
            <h3>マッチングキーワード</h3>
            <p>
                ${stone.matchingKeywords.map(keyword => `<span class="tag">${keyword}</span>`).join('')}
            </p>
        </div>
        
        <div class="detail-section">
            <h3>狼煙屋との相性</h3>
            <p><strong>相性の良い狼煙屋:</strong> ${stone.noroshiyaAffinity.primaryMatch}</p>
            <p><strong>理由:</strong> ${stone.noroshiyaAffinity.matchReason}</p>
            <p><strong>特別な反応:</strong> "${stone.noroshiyaAffinity.specialReaction}"</p>
        </div>
        
        <div class="detail-section">
            <h3>伝承</h3>
            <p><strong>言い伝え:</strong> ${stone.folklore.legend}</p>
            <p><strong>使用法:</strong> ${stone.folklore.usage}</p>
        </div>
    `;
    
    document.getElementById('detail-modal').style.display = 'block';
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// モーダル外クリックで閉じる
window.onclick = function(event) {
    const modal = document.getElementById('detail-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// 鳥の検索
function searchBirds() {
    const searchTerm = document.getElementById('bird-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayBirds(currentBirds);
        return;
    }
    
    const filtered = currentBirds.filter(bird => 
        bird.name.toLowerCase().includes(searchTerm) ||
        bird.scientificName.toLowerCase().includes(searchTerm) ||
        bird.family.toLowerCase().includes(searchTerm) ||
        bird.habitat.toLowerCase().includes(searchTerm)
    );
    
    displayBirds(filtered);
}

// 石の検索
function searchStones() {
    const searchTerm = document.getElementById('stone-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayStones(currentStones);
        return;
    }
    
    const filtered = currentStones.filter(stone => 
        stone.name.toLowerCase().includes(searchTerm) ||
        stone.colors.some(color => color.toLowerCase().includes(searchTerm)) ||
        stone.characteristics.appearance.toLowerCase().includes(searchTerm) ||
        stone.matchingKeywords.some(keyword => keyword.includes(searchTerm))
    );
    
    displayStones(filtered);
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