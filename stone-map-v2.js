// モード管理
let currentMapMode = localStorage.getItem('stoneMapMode') || 'blur';
let modeUnlockExpiry = localStorage.getItem('modeUnlockExpiry');

// パスワード（実際はハッシュ化して保存すべき）
const UNLOCK_PASSWORD = 'MOKUMOKU2025';

// サンプルデータ（実際はSupabaseから取得）
const stoneLocations = [
    {
        id: 'LOC_001',
        prefecture: '鳥取県',
        location_name: '日野川',
        location_type: '川',
        detail_type_river: '下流',
        detail_notes: '中洲',
        city: '西伯郡',
        address: '鳥取県西伯郡伯耆町吉長３７−３',
        lat: 35.3439,
        lng: 133.4039,
        display_name_full: '日野川（下流）',
        display_name_simple: '日野川',
        stones: [
            { id: 'stone_001', name: '白い丸石', emoji: '⚪' },
            { id: 'stone_002', name: '黒い平石', emoji: '⚫' },
            { id: 'stone_003', name: '縞模様の石', emoji: '🔵' }
        ]
    },
    {
        id: 'LOC_002',
        prefecture: '鳥取県',
        location_name: '佐陀川（地蔵滝）',
        location_type: '川',
        detail_type_river: '中流',
        detail_notes: '小川',
        city: '西伯郡',
        address: '鳥取県西伯郡伯耆町丸山',
        lat: 35.3856,
        lng: 133.4453,
        display_name_full: '佐陀川（地蔵滝・中流）',
        display_name_simple: '佐陀川（地蔵滝）',
        stones: [
            { id: 'stone_004', name: '緑の石', emoji: '🟢' }
        ]
    },
    {
        id: 'LOC_003',
        prefecture: '香川県',
        location_name: '津嶋神社',
        location_type: '海岸',
        detail_type_ocean: '砂浜',
        city: '三豊市',
        address: '香川県三豊市三野町大見６８１６−２',
        lat: 34.1753,
        lng: 133.7267,
        display_name_full: '津嶋神社（砂浜）',
        display_name_simple: '津嶋神社',
        stones: [
            { id: 'stone_005', name: '貝殻混じりの石', emoji: '🐚' },
            { id: 'stone_006', name: '青い小石', emoji: '🔵' }
        ]
    },
    {
        id: 'LOC_004',
        prefecture: '香川県',
        location_name: '父母ヶ浜',
        location_type: '海岸',
        detail_type_ocean: '砂浜',
        city: '三豊市',
        address: '三豊市仁尾町仁尾乙２０３−３',
        lat: 34.2175,
        lng: 133.6208,
        display_name_full: '父母ヶ浜（砂浜）',
        display_name_simple: '父母ヶ浜',
        stones: [
            { id: 'stone_007', name: '透明な石', emoji: '💎' }
        ]
    },
    {
        id: 'LOC_005',
        prefecture: '三重県',
        location_name: '国府白浜',
        location_type: '海岸',
        detail_type_ocean: '石浜',
        city: '志摩市',
        address: '三重県志摩市阿児町国府１−１１',
        lat: 34.3028,
        lng: 136.8297,
        display_name_full: '国府白浜（石浜）',
        display_name_simple: '国府白浜',
        stones: [
            { id: 'stone_008', name: '赤い石', emoji: '🔴' }
        ]
    },
    {
        id: 'LOC_006',
        prefecture: '和歌山県',
        location_name: '花の窟神社前',
        location_type: '海岸',
        detail_type_ocean: '岸壁',
        city: '熊野市',
        address: '三重県熊野市有馬町１３０',
        lat: 33.8897,
        lng: 136.0989,
        display_name_full: '花の窟神社前（岸壁）',
        display_name_simple: '花の窟神社前',
        stones: [
            { id: 'stone_009', name: '黒光りする石', emoji: '⚫' }
        ]
    }
];

// 都道府県の中心座標（ぼんやりモード用）
const prefectureCenters = {
    '鳥取県': { lat: 35.5011, lng: 134.2380 },
    '香川県': { lat: 34.3401, lng: 134.0434 },
    '三重県': { lat: 34.7303, lng: 136.5086 },
    '和歌山県': { lat: 34.2250, lng: 135.1675 }
};

// 地図の初期化
const map = L.map('map').setView([36.5, 138], 6);

// タイルレイヤー
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// マーカーグループ
let markers = L.layerGroup().addTo(map);

// モード確認と期限チェック
function checkModeExpiry() {
    if (modeUnlockExpiry && new Date().getTime() > parseInt(modeUnlockExpiry)) {
        currentMapMode = 'blur';
        localStorage.removeItem('stoneMapMode');
        localStorage.removeItem('modeUnlockExpiry');
    }
    updateModeDisplay();
}

// モード表示更新
function updateModeDisplay() {
    const modeBtn = document.getElementById('toggleModeBtn');
    const currentModeText = document.getElementById('currentMode');
    
    if (currentMapMode === 'clear') {
        modeBtn.textContent = 'ぼんやりモードに戻る';
        modeBtn.classList.remove('locked');
        currentModeText.textContent = '現在: はっきり密画モード';
    } else {
        modeBtn.textContent = 'はっきりモードに切り替え 🔒';
        modeBtn.classList.add('locked');
        currentModeText.textContent = '現在: ぼんやり略画モード';
    }
}

// モード切替
function toggleMode() {
    if (currentMapMode === 'blur') {
        // パスワード入力モーダルを表示
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').focus();
    } else {
        // ぼんやりモードに戻る
        currentMapMode = 'blur';
        localStorage.setItem('stoneMapMode', 'blur');
        updateModeDisplay();
        updateMapDisplay();
    }
}

// パスワード確認
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === UNLOCK_PASSWORD) {
        currentMapMode = 'clear';
        // 30日間有効
        const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('stoneMapMode', 'clear');
        localStorage.setItem('modeUnlockExpiry', expiry);
        closePasswordModal();
        updateModeDisplay();
        updateMapDisplay();
    } else {
        alert('パスワードが正しくありません。\nTWIN PEACH 公式マガジン「MOKUMOKU」をご確認ください。');
        document.getElementById('passwordInput').value = '';
    }
}

// パスワードモーダルを閉じる
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('passwordInput').value = '';
}

// ピンの色を決定
function getMarkerColor(locationType) {
    switch(locationType) {
        case '川': return '#4ECDC4';
        case '海岸': return '#45B7D1';
        default: return '#96CEB4';
    }
}

// タグHTMLを生成
function createTagHTML(location) {
    let tags = [];
    const typeColor = getMarkerColor(location.location_type);
    
    if (location.location_type === '川') {
        tags.push(`<span class="tag-badge tag-river">川・河原</span>`);
    } else if (location.location_type === '海岸') {
        tags.push(`<span class="tag-badge tag-ocean">海岸</span>`);
    } else {
        tags.push(`<span class="tag-badge tag-mountain">山・その他</span>`);
    }
    
    return tags.join(' ');
}

// ぼんやりモードのポップアップコンテンツ
function createBlurPopupContent(prefecture, locations) {
    const totalStones = locations.reduce((sum, loc) => sum + loc.stones.length, 0);
    const locationNames = locations.map(loc => loc.display_name_simple).join(', ');
    
    // タグの集計
    const tags = new Set();
    locations.forEach(loc => {
        if (loc.location_type === '川') tags.add('川・河原');
        else if (loc.location_type === '海岸') tags.add('海岸');
        else tags.add('山・その他');
    });
    
    let tagsHTML = '';
    tags.forEach(tag => {
        const className = tag === '川・河原' ? 'tag-river' : 
                         tag === '海岸' ? 'tag-ocean' : 'tag-mountain';
        tagsHTML += `<span class="tag-badge ${className}">${tag}</span> `;
    });
    
    // すべての石を収集
    let allStones = [];
    locations.forEach(loc => {
        allStones = allStones.concat(loc.stones);
    });
    
    let stonesHtml = '<div class="stone-grid">';
    allStones.forEach(stone => {
        stonesHtml += `
            <div class="stone-item" onclick="viewStone('${stone.id}')">
                <div class="stone-thumbnail">${stone.emoji}</div>
                <div class="stone-name">${stone.name}</div>
            </div>
        `;
    });
    stonesHtml += '</div>';
    
    return `
        <div class="stone-popup">
            <h3>${prefecture}</h3>
            <div class="location-info">
                <strong>エリア名:</strong> ${locationNames}<br>
                <strong>採取石数:</strong> ${totalStones}個
            </div>
            <div class="location-tags">${tagsHTML}</div>
            ${stonesHtml}
        </div>
    `;
}

// はっきりモードのポップアップコンテンツ
function createClearPopupContent(location) {
    const tagHTML = createTagHTML(location);
    
    let detailType = '';
    if (location.location_type === '川' && location.detail_type_river) {
        detailType = `<strong>データ:</strong> ${location.detail_type_river}<br>`;
    } else if (location.location_type === '海岸' && location.detail_type_ocean) {
        detailType = `<strong>データ:</strong> ${location.detail_type_ocean}<br>`;
    }
    
    let notes = '';
    if (location.detail_notes) {
        notes = `<strong>備考:</strong> ${location.detail_notes}<br>`;
    }
    
    let stonesHtml = '<div class="stone-grid">';
    location.stones.forEach(stone => {
        stonesHtml += `
            <div class="stone-item" onclick="viewStone('${stone.id}')">
                <div class="stone-thumbnail">${stone.emoji}</div>
                <div class="stone-name">${stone.name}</div>
            </div>
        `;
    });
    stonesHtml += '</div>';
    
    return `
        <div class="stone-popup">
            <h3>${location.display_name_full}</h3>
            <div class="location-info">
                <strong>都道府県:</strong> ${location.prefecture}<br>
                <strong>市区町村:</strong> ${location.city}<br>
                <strong>採取石数:</strong> ${location.stones.length}個<br>
                ${detailType}
                ${notes}
                <strong>住所:</strong> ${location.address}
            </div>
            <div class="location-tags">${tagHTML}</div>
            ${stonesHtml}
        </div>
    `;
}

// カスタムアイコンを作成
function createCustomIcon(locationType) {
    const color = getMarkerColor(locationType);
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// 現在開いているポップアップを追跡
let currentOpenPopup = null;
let popupTimer = null;

// ポップアップのホバー処理を設定
function setupPopupHover(marker, popup) {
    let isOverMarker = false;
    let isOverPopup = false;
    let closeTimer = null;
    
    const startCloseTimer = () => {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            if (!isOverMarker && !isOverPopup && popup.isOpen()) {
                popup.close();
                if (currentOpenPopup === popup) {
                    currentOpenPopup = null;
                }
            }
        }, 500); // 0.5秒の猶予
    };
    
    const cancelCloseTimer = () => {
        clearTimeout(closeTimer);
    };
    
    // ポップアップ内でのマウス操作を検知
    popup.on('popupopen', function() {
        currentOpenPopup = popup;
        cancelCloseTimer();
        console.log('Popup opened');
        
        // DOMが完全に生成されるまで待つ
        setTimeout(() => {
            const popupElement = popup.getElement();
            console.log('Popup element after timeout:', popupElement);
            
            if (popupElement) {
                // ポップアップ全体にイベントを設定
                popupElement.addEventListener('mouseenter', (e) => {
                    console.log('Mouse entered popup');
                    isOverPopup = true;
                    cancelCloseTimer();
                });
                
                popupElement.addEventListener('mouseleave', (e) => {
                    console.log('Mouse left popup');
                    isOverPopup = false;
                    startCloseTimer();
                });
                
                // ポップアップコンテンツにも念のため設定
                const contentWrapper = popupElement.querySelector('.leaflet-popup-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.addEventListener('mouseenter', () => {
                        console.log('Mouse entered content wrapper');
                        isOverPopup = true;
                        cancelCloseTimer();
                    });
                }
            } else {
                console.log('Popup element not found!');
            }
        }, 100);
    });
    
    popup.on('popupclose', function() {
        isOverPopup = false;
        cancelCloseTimer();
        if (currentOpenPopup === popup) {
            currentOpenPopup = null;
        }
    });
    
    // マーカーのホバーイベント
    marker.on('mouseover', function(e) {
        isOverMarker = true;
        cancelCloseTimer();
        if (currentOpenPopup && currentOpenPopup !== popup) {
            currentOpenPopup.close();
        }
        this.bindPopup(popup).openPopup();
    });
    
    marker.on('mouseout', function(e) {
        isOverMarker = false;
        startCloseTimer();
    });
    
    // クリックで固定表示
    marker.on('click', function(e) {
        cancelCloseTimer();
        if (currentOpenPopup && currentOpenPopup !== popup) {
            currentOpenPopup.close();
        }
        this.bindPopup(popup).openPopup();
    });
}

// 地図表示を更新
function updateMapDisplay(filterPrefecture = '') {
    markers.clearLayers();
    
    if (currentMapMode === 'blur') {
        // ぼんやりモード: 都道府県ごとにグループ化
        const prefectureGroups = {};
        
        stoneLocations
            .filter(loc => !filterPrefecture || loc.prefecture === filterPrefecture)
            .forEach(location => {
                if (!prefectureGroups[location.prefecture]) {
                    prefectureGroups[location.prefecture] = [];
                }
                prefectureGroups[location.prefecture].push(location);
            });
        
        // 都道府県ごとにマーカーを配置
        Object.entries(prefectureGroups).forEach(([prefecture, locations]) => {
            const center = prefectureCenters[prefecture];
            if (center) {
                // 最も多い location_type を取得
                const typeCount = {};
                locations.forEach(loc => {
                    typeCount[loc.location_type] = (typeCount[loc.location_type] || 0) + 1;
                });
                const dominantType = Object.entries(typeCount)
                    .sort((a, b) => b[1] - a[1])[0][0];
                
                const marker = L.marker([center.lat, center.lng], {
                    icon: createCustomIcon(dominantType)
                });
                
                const popup = L.popup({
                    maxWidth: 300,
                    closeOnClick: false,
                    autoClose: false,
                    closeButton: true,
                    className: 'custom-popup'
                });
                
                popup.setContent(createBlurPopupContent(prefecture, locations));
                
                // ポップアップのホバー処理を設定
                setupPopupHover(marker, popup);
                
                markers.addLayer(marker);
            }
        });
        
    } else {
        // はっきりモード: 個別の場所にマーカーを配置
        stoneLocations
            .filter(loc => !filterPrefecture || loc.prefecture === filterPrefecture)
            .forEach(location => {
                const marker = L.marker([location.lat, location.lng], {
                    icon: createCustomIcon(location.location_type)
                });
                
                const popup = L.popup({
                    maxWidth: 300,
                    closeOnClick: false,
                    autoClose: false,
                    closeButton: true,
                    className: 'custom-popup'
                });
                
                popup.setContent(createClearPopupContent(location));
                
                // ポップアップのホバー処理を設定
                setupPopupHover(marker, popup);
                
                markers.addLayer(marker);
            });
    }
}

// 石の詳細を表示
function viewStone(stoneId) {
    console.log('石の詳細を表示:', stoneId);
    alert(`石ID: ${stoneId} の詳細ページに遷移します`);
}

// 都道府県フィルター
document.getElementById('prefectureFilter').addEventListener('change', (e) => {
    updateMapDisplay(e.target.value);
});

// Enterキーでパスワード送信
document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

// 初期化
checkModeExpiry();
updateMapDisplay();