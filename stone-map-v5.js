// モード管理
let currentMapMode = localStorage.getItem('stoneMapMode') || 'blur';
let modeUnlockExpiry = localStorage.getItem('modeUnlockExpiry');

// パスワード（実際はハッシュ化して保存すべき）
const UNLOCK_PASSWORD = 'mokumoku';

// GeoJSONデータ格納用
let japanGeoJSON = null;

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

// 地図の初期化
const map = L.map('map').setView([36.5, 138], 6);

// タイルレイヤー
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// レイヤーグループ
let markersLayer = L.layerGroup().addTo(map);
let geoJSONLayer = null;

// 日本の都道府県GeoJSONを読み込む
async function loadJapanGeoJSON() {
    try {
        // 代替のGeoJSONデータソースを試す
        const urls = [
            'https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/geojson/s0010/prefectures.json',
            'https://raw.githubusercontent.com/niiyz/JapanCityGeoJson/master/geojson/prefectures.geojson',
            'https://raw.githubusercontent.com/dataofjapan/land/master/prefecture.geojson'
        ];
        
        let loaded = false;
        for (const url of urls) {
            try {
                console.log('GeoJSONを読み込み中:', url);
                const response = await fetch(url);
                if (response.ok) {
                    japanGeoJSON = await response.json();
                    console.log('GeoJSONデータ読み込み完了:', url);
                    loaded = true;
                    break;
                }
            } catch (e) {
                console.warn('読み込み失敗:', url, e);
            }
        }
        
        if (!loaded) {
            throw new Error('すべてのGeoJSONソースの読み込みに失敗');
        }
        
        // 読み込み完了後、地図を更新
        document.getElementById('loading').style.display = 'none';
        updateMapDisplay();
    } catch (error) {
        console.error('GeoJSON読み込みエラー:', error);
        // エラー時は簡易版にフォールバック
        document.getElementById('loading').innerHTML = '<div>地図データの読み込みに失敗しました。簡易版で表示します。</div>';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            updateMapDisplay();
        }, 2000);
    }
}

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
    const clearLegend = document.getElementById('clearModeLegend');
    const blurLegend = document.getElementById('blurModeLegend');
    
    if (currentMapMode === 'clear') {
        modeBtn.textContent = 'ぼんやりモードに戻る';
        modeBtn.classList.remove('locked');
        currentModeText.textContent = '現在: はっきり密画モード';
        clearLegend.style.display = 'block';
        blurLegend.style.display = 'none';
    } else {
        modeBtn.textContent = 'はっきりモードに切り替え 🔒';
        modeBtn.classList.add('locked');
        currentModeText.textContent = '現在: ぼんやり略画モード';
        clearLegend.style.display = 'none';
        blurLegend.style.display = 'block';
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

// 詳細モーダルを閉じる
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
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
    
    if (location.location_type === '川') {
        tags.push(`<span class="tag-badge tag-river">川・河原</span>`);
    } else if (location.location_type === '海岸') {
        tags.push(`<span class="tag-badge tag-ocean">海岸</span>`);
    } else {
        tags.push(`<span class="tag-badge tag-mountain">山・その他</span>`);
    }
    
    return tags.join(' ');
}

// ミニマルなポップアップコンテンツ（ホバー用）
function createMiniPopupContent(prefecture, totalStones) {
    return `
        <div class="mini-popup" style="cursor: pointer;" onclick="showPrefectureDetails('${prefecture}')">
            <h4>${prefecture}</h4>
            <div class="stone-count">採取石数: ${totalStones}個</div>
        </div>
    `;
}

// 詳細情報を表示
function showPrefectureDetails(prefecture) {
    const locations = stoneLocations.filter(loc => loc.prefecture === prefecture);
    const totalStones = locations.reduce((sum, loc) => sum + loc.stones.length, 0);
    
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
    
    // 各場所の詳細
    let locationsHTML = '';
    if (currentMapMode === 'blur') {
        // ぼんやりモード：場所名のリスト
        const locationNames = locations.map(loc => loc.display_name_simple).join('、');
        locationsHTML = `<p><strong>場所:</strong> ${locationNames}</p>`;
    } else {
        // はっきりモード：詳細な場所情報
        locations.forEach(location => {
            let detailType = '';
            if (location.location_type === '川' && location.detail_type_river) {
                detailType = ` (${location.detail_type_river})`;
            } else if (location.location_type === '海岸' && location.detail_type_ocean) {
                detailType = ` (${location.detail_type_ocean})`;
            }
            
            locationsHTML += `
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f8f8; border-radius: 8px;">
                    <h4 style="margin: 0 0 5px 0; font-size: 16px;">${location.display_name_full}</h4>
                    <p style="font-size: 14px; color: #666; margin: 5px 0;">
                        ${location.city}${detailType}<br>
                        <span style="font-size: 12px;">${location.address}</span>
                    </p>
                </div>
            `;
        });
    }
    
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
    
    // 詳細モーダルに内容を設定
    document.getElementById('detailTitle').textContent = prefecture;
    document.getElementById('detailBody').innerHTML = `
        <div class="location-tags">${tagsHTML}</div>
        ${locationsHTML}
        <h4 style="margin: 20px 0 10px 0; font-size: 18px; display: inline-block;">ひろった石</h4>
        <span style="font-size: 18px; margin-left: 10px;">${totalStones}個</span>
        ${stonesHtml}
    `;
    
    // モーダルを表示
    document.getElementById('detailModal').style.display = 'flex';
}

// 場所の詳細を表示（はっきりモード用）
function showLocationDetails(locationId) {
    const location = stoneLocations.find(loc => loc.id === locationId);
    if (!location) return;
    
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
    
    // 詳細モーダルに内容を設定
    document.getElementById('detailTitle').textContent = location.display_name_full;
    document.getElementById('detailBody').innerHTML = `
        <div class="location-info">
            <strong>都道府県:</strong> ${location.prefecture}<br>
            <strong>市区町村:</strong> ${location.city}<br>
            ${detailType}
            ${notes}
            <strong>住所:</strong> ${location.address}
        </div>
        <div class="location-tags">${tagHTML}</div>
        <h4 style="margin: 20px 0 10px 0; font-size: 18px; display: inline-block;">ひろった石</h4>
        <span style="font-size: 18px; margin-left: 10px;">${location.stones.length}個</span>
        ${stonesHtml}
    `;
    
    // モーダルを表示
    document.getElementById('detailModal').style.display = 'flex';
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

// 地図表示を更新
function updateMapDisplay(filterPrefecture = '') {
    // レイヤーをクリア
    markersLayer.clearLayers();
    if (geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
        geoJSONLayer = null;
    }
    
    if (currentMapMode === 'blur') {
        // ぼんやりモード: 都道府県を色分け表示
        const prefectureGroups = {};
        
        stoneLocations
            .filter(loc => !filterPrefecture || loc.prefecture === filterPrefecture)
            .forEach(location => {
                if (!prefectureGroups[location.prefecture]) {
                    prefectureGroups[location.prefecture] = [];
                }
                prefectureGroups[location.prefecture].push(location);
            });
        
        // GeoJSONがある場合は正確な都道府県形状を使用
        if (japanGeoJSON) {
            geoJSONLayer = L.geoJSON(japanGeoJSON, {
                style: function(feature) {
                    // さまざまなプロパティ名に対応
                    const prefName = feature.properties.nam_ja || 
                                   feature.properties.name_ja || 
                                   feature.properties.name || 
                                   feature.properties.NAME || 
                                   feature.properties.prefecture ||
                                   feature.properties.N03_001;
                    
                    console.log('都道府県名:', prefName, '全プロパティ:', feature.properties);
                    
                    const locations = prefectureGroups[prefName];
                    
                    if (locations && locations.length > 0) {
                        // 最も多い location_type を取得
                        const typeCount = {};
                        locations.forEach(loc => {
                            typeCount[loc.location_type] = (typeCount[loc.location_type] || 0) + 1;
                        });
                        const dominantType = Object.entries(typeCount)
                            .sort((a, b) => b[1] - a[1])[0][0];
                        
                        const color = getMarkerColor(dominantType);
                        
                        return {
                            fillColor: color,
                            fillOpacity: 0.3,
                            color: color,
                            weight: 2,
                            opacity: 0.8
                        };
                    } else {
                        // データがない都道府県は薄いグレー
                        return {
                            fillColor: '#ddd',
                            fillOpacity: 0.1,
                            color: '#999',
                            weight: 1,
                            opacity: 0.3
                        };
                    }
                },
                onEachFeature: function(feature, layer) {
                    const prefName = feature.properties.nam_ja || 
                                   feature.properties.name_ja || 
                                   feature.properties.name || 
                                   feature.properties.NAME || 
                                   feature.properties.prefecture ||
                                   feature.properties.N03_001;
                    const locations = prefectureGroups[prefName];
                    
                    if (locations && locations.length > 0) {
                        const totalStones = locations.reduce((sum, loc) => sum + loc.stones.length, 0);
                        
                        // ポップアップをバインド
                        layer.bindPopup(createMiniPopupContent(prefName, totalStones), {
                            maxWidth: 200,
                            closeButton: false,
                            autoClose: true,
                            closeOnClick: false
                        });
                        
                        // イベントハンドラ
                        layer.on({
                            mouseover: function(e) {
                                const layer = e.target;
                                layer.setStyle({
                                    fillOpacity: 0.5
                                });
                                this.openPopup();
                            },
                            mouseout: function(e) {
                                const layer = e.target;
                                layer.setStyle({
                                    fillOpacity: 0.3
                                });
                                // マウスが離れたらポップアップを閉じる
                                this.closePopup();
                            },
                            click: function(e) {
                                showPrefectureDetails(prefName);
                            }
                        });
                    }
                }
            }).addTo(map);
        } else {
            // GeoJSONがない場合は簡易的な四角形で表示（フォールバック）
            const prefecturePolygons = {
                '鳥取県': [[35.2, 133.0], [35.2, 134.5], [35.6, 134.5], [35.6, 133.0]],
                '香川県': [[34.0, 133.5], [34.0, 134.5], [34.5, 134.5], [34.5, 133.5]],
                '三重県': [[33.8, 135.8], [33.8, 137.0], [35.2, 137.0], [35.2, 135.8]],
                '和歌山県': [[33.5, 134.8], [33.5, 136.0], [34.4, 136.0], [34.4, 134.8]]
            };
            
            Object.entries(prefectureGroups).forEach(([prefecture, locations]) => {
                const polygonCoords = prefecturePolygons[prefecture];
                if (polygonCoords) {
                    // 最も多い location_type を取得
                    const typeCount = {};
                    locations.forEach(loc => {
                        typeCount[loc.location_type] = (typeCount[loc.location_type] || 0) + 1;
                    });
                    const dominantType = Object.entries(typeCount)
                        .sort((a, b) => b[1] - a[1])[0][0];
                    
                    const color = getMarkerColor(dominantType);
                    const totalStones = locations.reduce((sum, loc) => sum + loc.stones.length, 0);
                    
                    // ポリゴンを作成
                    const polygon = L.polygon(polygonCoords, {
                        color: color,
                        weight: 2,
                        opacity: 0.8,
                        fillColor: color,
                        fillOpacity: 0.3
                    });
                    
                    // ミニマルなポップアップをバインド
                    const popupContent = createMiniPopupContent(prefecture, totalStones);
                    polygon.bindPopup(popupContent, {
                        maxWidth: 200,
                        closeButton: false,
                        autoClose: true,
                        closeOnClick: false
                    });
                    
                    // ホバーイベント
                    polygon.on('mouseover', function(e) {
                        this.setStyle({
                            fillOpacity: 0.5
                        });
                        this.openPopup();
                    });
                    
                    polygon.on('mouseout', function(e) {
                        this.setStyle({
                            fillOpacity: 0.3
                        });
                        // マウスが離れたらポップアップを閉じる
                        this.closePopup();
                    });
                    
                    // クリックで詳細表示
                    polygon.on('click', function(e) {
                        showPrefectureDetails(prefecture);
                    });
                    
                    markersLayer.addLayer(polygon);
                }
            });
        }
        
    } else {
        // はっきりモード: 個別の場所にマーカーを配置
        stoneLocations
            .filter(loc => !filterPrefecture || loc.prefecture === filterPrefecture)
            .forEach(location => {
                const marker = L.marker([location.lat, location.lng], {
                    icon: createCustomIcon(location.location_type)
                });
                
                // ミニマルなポップアップ
                const miniContent = `
                    <div class="mini-popup" style="cursor: pointer;" onclick="showLocationDetails('${location.id}')">
                        <h4>${location.display_name_simple}</h4>
                        <div class="stone-count">石: ${location.stones.length}個</div>
                    </div>
                `;
                
                marker.bindPopup(miniContent, {
                    maxWidth: 200,
                    closeButton: false,
                    autoClose: true,
                    closeOnClick: false
                });
                
                // ホバーイベント
                marker.on('mouseover', function(e) {
                    this.openPopup();
                });
                
                marker.on('mouseout', function(e) {
                    // 少し遅延を入れてポップアップを閉じる
                    setTimeout(() => {
                        this.closePopup();
                    }, 300);
                });
                
                // クリックで詳細表示
                marker.on('click', function(e) {
                    showLocationDetails(location.id);
                });
                
                markersLayer.addLayer(marker);
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

// 詳細モーダルの外側クリックで閉じる
document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') {
        closeDetailModal();
    }
});

// 初期化
checkModeExpiry();
// GeoJSONデータを読み込んでから地図を表示
loadJapanGeoJSON();