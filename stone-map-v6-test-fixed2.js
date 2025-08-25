// モード管理
let currentMapMode = localStorage.getItem('stoneMapMode') || 'blur';
let modeUnlockExpiry = localStorage.getItem('modeUnlockExpiry');

// パスワード
const UNLOCK_PASSWORD = 'mokumoku';

// GeoJSONデータ格納用
let japanGeoJSON = null;

// マップとレイヤーの変数
let map = null;
let markersLayer = null;
let geoJSONLayer = null;

// DOMContentLoadedを待つ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing map...');
    initializeMap();
});

// 地図の初期化
function initializeMap() {
    try {
        // 地図の初期化
        map = L.map('map').setView([36.5, 138], 6);
        console.log('Map initialized');

        // タイルレイヤー
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // レイヤーグループ
        markersLayer = L.layerGroup().addTo(map);
        
        // 初期化完了後、その他の処理を開始
        checkModeExpiry();
        updateModeDisplay();
        loadJapanGeoJSON();
        
    } catch (error) {
        console.error('Map initialization error:', error);
        document.getElementById('loading').innerHTML = '<div style="color: red;">地図の初期化に失敗しました: ' + error.message + '</div>';
    }
}

// Supabaseから石データを取得
async function fetchStonesFromSupabase() {
    try {
        // Supabaseクライアントの確認
        if (!window.supabase) {
            console.error('Supabase client not initialized');
            return [];
        }

        const { data, error } = await window.supabase
            .from('stones')
            .select('*')
            .not('lat', 'is', null)
            .not('lng', 'is', null)
            .order('id');

        if (error) throw error;
        
        console.log('Fetched stones:', data);
        return data || [];
    } catch (error) {
        console.error('Error fetching stones:', error);
        return [];
    }
}

// 日本の都道府県GeoJSONを読み込む
async function loadJapanGeoJSON() {
    try {
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
        
        // 読み込み完了後、石データを取得して地図を更新
        const stones = await fetchStonesFromSupabase();
        updateMapDisplay('', stones);
        updatePrefectureFilter(stones);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('GeoJSON読み込みエラー:', error);
        // エラー時は簡易版にフォールバック
        document.getElementById('loading').innerHTML = '<div>地図データの読み込みに失敗しました。簡易版で表示します。</div>';
        setTimeout(async () => {
            document.getElementById('loading').style.display = 'none';
            const stones = await fetchStonesFromSupabase();
            updateMapDisplay('', stones);
            updatePrefectureFilter(stones);
        }, 2000);
    }
}

// 都道府県フィルターを更新
function updatePrefectureFilter(stones) {
    const prefectures = [...new Set(stones.map(s => s.prefecture).filter(p => p))].sort();
    const select = document.getElementById('prefectureFilter');
    select.innerHTML = '<option value="">すべて</option>';
    prefectures.forEach(pref => {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        select.appendChild(option);
    });
}

// モード期限チェック
function checkModeExpiry() {
    if (currentMapMode === 'clear' && modeUnlockExpiry) {
        if (new Date().getTime() > parseInt(modeUnlockExpiry)) {
            currentMapMode = 'blur';
            localStorage.setItem('stoneMapMode', 'blur');
            localStorage.removeItem('modeUnlockExpiry');
        }
    }
}

// モード表示更新
function updateModeDisplay() {
    const currentModeEl = document.getElementById('currentMode');
    const toggleBtn = document.getElementById('toggleModeBtn');
    
    if (currentMapMode === 'blur') {
        currentModeEl.textContent = '現在: ぼんやり略画モード';
        toggleBtn.textContent = 'はっきりモードに切り替え 🔒';
        document.getElementById('clearModeLegend').style.display = 'none';
        document.getElementById('blurModeLegend').style.display = 'block';
    } else {
        currentModeEl.textContent = '現在: はっきり密画モード';
        toggleBtn.textContent = 'ぼんやりモードに切り替え';
        document.getElementById('clearModeLegend').style.display = 'block';
        document.getElementById('blurModeLegend').style.display = 'none';
    }
}

// モード切り替え
function toggleMode() {
    if (currentMapMode === 'blur') {
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').focus();
    } else {
        currentMapMode = 'blur';
        localStorage.setItem('stoneMapMode', 'blur');
        localStorage.removeItem('modeUnlockExpiry');
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            updateMapDisplay(document.getElementById('prefectureFilter').value, stones);
        });
    }
}

// パスワードチェック
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === UNLOCK_PASSWORD) {
        currentMapMode = 'clear';
        const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30日
        localStorage.setItem('stoneMapMode', 'clear');
        localStorage.setItem('modeUnlockExpiry', expiry.toString());
        closePasswordModal();
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            updateMapDisplay(document.getElementById('prefectureFilter').value, stones);
        });
    } else {
        alert('パスワードが正しくありません');
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

// カスタムアイコン作成
function createCustomIcon(locationTag) {
    const color = getMarkerColor(locationTag);
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// マーカーの色を取得
function getMarkerColor(locationTag) {
    switch(locationTag) {
        case '川・河原': return '#4ECDC4';
        case '海岸': return '#45B7D1';
        case '山・その他': 
        default: return '#96CEB4';
    }
}

// ミニポップアップコンテンツ作成
function createMiniPopupContent(prefecture, count) {
    return `
        <div class="mini-popup">
            <h4>${prefecture}</h4>
            <div class="stone-count">採取石数: ${count}個</div>
        </div>
    `;
}

// タグHTML作成
function createTagHTML(stone) {
    if (!stone.location_tag) return '';
    
    const colors = {
        '川・河原': '#4ECDC4',
        '海岸': '#45B7D1',
        '山・その他': '#96CEB4'
    };
    
    return `<span class="tag-badge" style="background: ${colors[stone.location_tag] || '#96CEB4'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${stone.location_tag}</span>`;
}

// 都道府県詳細表示
function showPrefectureDetails(prefecture) {
    fetchStonesFromSupabase().then(allStones => {
        const stones = allStones.filter(s => s.prefecture === prefecture);
        
        let content = `<h4>採取場所一覧</h4>`;
        
        const locations = {};
        stones.forEach(stone => {
            const key = stone.location_name || '場所未設定';
            if (!locations[key]) {
                locations[key] = [];
            }
            locations[key].push(stone);
        });
        
        Object.entries(locations).forEach(([location, locationStones]) => {
            content += `
                <div style="margin: 15px 0; padding: 10px; background: #f8f8f8; border-radius: 8px;">
                    <h5 style="margin: 0 0 10px 0;">${location}</h5>
                    <div style="font-size: 14px; color: #666;">石の数: ${locationStones.length}個</div>
                    <div class="stone-grid">
            `;
            
            locationStones.forEach(stone => {
                const imageHtml = stone.image_url 
                    ? `<img src="${stone.image_url}" alt="${stone.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<div style="background: #ddd; width: 100%; height: 100%; border-radius: 50%;"></div>`;
                
                content += `
                    <div class="stone-item" onclick="viewStone('${stone.id}')">
                        <div class="stone-thumbnail">${imageHtml}</div>
                        <div class="stone-name">${stone.name}</div>
                    </div>
                `;
            });
            
            content += `</div></div>`;
        });
        
        document.getElementById('detailTitle').textContent = prefecture;
        document.getElementById('detailBody').innerHTML = content;
        document.getElementById('detailModal').style.display = 'flex';
    });
}

// 地図表示更新
async function updateMapDisplay(prefectureFilter, stones) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    // マーカーとGeoJSONレイヤーをクリア
    markersLayer.clearLayers();
    if (geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
        geoJSONLayer = null;
    }
    
    // フィルタリング
    const filteredStones = prefectureFilter 
        ? stones.filter(s => s.prefecture === prefectureFilter)
        : stones;
    
    if (currentMapMode === 'blur') {
        // ぼんやりモード
        const prefectureGroups = {};
        filteredStones.forEach(stone => {
            if (!prefectureGroups[stone.prefecture]) {
                prefectureGroups[stone.prefecture] = [];
            }
            prefectureGroups[stone.prefecture].push(stone);
        });
        
        if (japanGeoJSON) {
            geoJSONLayer = L.geoJSON(japanGeoJSON, {
                style: function(feature) {
                    const prefName = feature.properties.nam_ja || 
                                   feature.properties.name_ja || 
                                   feature.properties.name || 
                                   feature.properties.NAME || 
                                   feature.properties.prefecture ||
                                   feature.properties.N03_001;
                    
                    const stones = prefectureGroups[prefName];
                    
                    if (stones && stones.length > 0) {
                        const tags = stones.map(s => s.location_tag).filter(t => t);
                        const primaryTag = tags.length > 0 ? 
                            tags.reduce((a,b) => tags.filter(v => v===a).length >= tags.filter(v => v===b).length ? a : b) : 
                            '山・その他';
                        
                        const color = getMarkerColor(primaryTag);
                        
                        return {
                            fillColor: color,
                            weight: 2,
                            opacity: 0.8,
                            color: color,
                            fillOpacity: 0.3
                        };
                    } else {
                        return {
                            fillColor: '#ddd',
                            weight: 1,
                            opacity: 0.3,
                            color: '#999',
                            fillOpacity: 0.1
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
                    const prefStones = prefectureGroups[prefName];
                    
                    if (prefStones && prefStones.length > 0) {
                        const totalStones = prefStones.length;
                        
                        layer.bindPopup(createMiniPopupContent(prefName, totalStones), {
                            maxWidth: 200,
                            closeButton: false,
                            autoClose: true,
                            closeOnClick: false
                        });
                        
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
            // フォールバック：簡易的な表示
            console.log('GeoJSONなしのフォールバック表示');
        }
        
    } else {
        // はっきりモード: 場所ごとにグループ化してマーカーを配置
        const locationGroups = {};
        
        // 場所ごとに石をグループ化
        filteredStones.forEach(stone => {
            // 位置情報をキーとして使用（緯度経度を丸めて同じ場所と判定）
            const locKey = `${Math.round(stone.lat * 1000) / 1000}_${Math.round(stone.lng * 1000) / 1000}`;
            
            if (!locationGroups[locKey]) {
                locationGroups[locKey] = {
                    lat: stone.lat,
                    lng: stone.lng,
                    location_name: stone.location_name || '場所未設定',
                    prefecture: stone.prefecture,
                    city: stone.city,
                    location_tag: stone.location_tag,
                    stones: []
                };
            }
            locationGroups[locKey].stones.push(stone);
        });
        
        // 各場所にマーカーを配置
        Object.entries(locationGroups).forEach(([locKey, location]) => {
            const marker = L.marker([location.lat, location.lng], {
                icon: createCustomIcon(location.location_tag || '山・その他')
            });
            
            // ミニマルなポップアップ（第1段階）
            const miniContent = `
                <div class="mini-popup" style="cursor: pointer;" onclick="showLocationDetails('${locKey}')">
                    <h4>${location.location_name}</h4>
                    <div class="stone-count">ひろった石: ${location.stones.length}個</div>
                </div>
            `;
            
            marker.bindPopup(miniContent, {
                maxWidth: 200,
                closeButton: false,
                autoClose: true,
                closeOnClick: false
            });
            
            marker.on('mouseover', function(e) {
                this.openPopup();
            });
            
            marker.on('mouseout', function(e) {
                setTimeout(() => {
                    this.closePopup();
                }, 300);
            });
            
            marker.on('click', function(e) {
                showLocationDetails(locKey);
            });
            
            markersLayer.addLayer(marker);
            
            // グローバル変数として保存（後でアクセスするため）
            if (!window.locationGroupsData) {
                window.locationGroupsData = {};
            }
            window.locationGroupsData[locKey] = location;
        });
    }
}

// 場所の詳細を表示（第2段階）
function showLocationDetails(locKey) {
    const location = window.locationGroupsData[locKey];
    if (!location) return;
    
    const tagHTML = location.location_tag ? createTagHTML({location_tag: location.location_tag}) : '';
    
    // 石のサムネイル一覧を作成
    let stonesHtml = '<div class="stone-grid">';
    location.stones.forEach(stone => {
        const imageHtml = stone.image_url 
            ? `<img src="${stone.image_url}" alt="${stone.name}">`
            : `<div style="background: #ddd; width: 100%; height: 100%; border-radius: 50%;"></div>`;
        
        stonesHtml += `
            <div class="stone-item" onclick="viewStone('${stone.id}')">
                <div class="stone-thumbnail">${imageHtml}</div>
                <div class="stone-name">${stone.name}</div>
            </div>
        `;
    });
    stonesHtml += '</div>';
    
    // 詳細モーダルに内容を設定
    document.getElementById('detailTitle').textContent = location.location_name;
    document.getElementById('detailBody').innerHTML = `
        <div class="location-tags">${tagHTML}</div>
        <p><strong>都道府県:</strong> ${location.prefecture || '未設定'}</p>
        <p><strong>市区町村:</strong> ${location.city || '未設定'}</p>
        <h4 style="margin: 20px 0 10px 0; font-size: 18px;">ひろった石: ${location.stones.length}個</h4>
        ${stonesHtml}
    `;
    
    // モーダルを表示
    document.getElementById('detailModal').style.display = 'flex';
}

// 石の詳細を表示（第3段階）
function viewStone(stoneId) {
    // イベントの伝播を停止
    event.stopPropagation();
    
    fetchStonesFromSupabase().then(allStones => {
        const stone = allStones.find(s => s.id === stoneId);
        if (!stone) return;
        
        const tagHTML = createTagHTML(stone);
        
        const imageHtml = stone.image_url 
            ? `<img src="${stone.image_url}" alt="${stone.name}" style="max-width: 300px; border-radius: 8px;">`
            : `<div style="background: #ddd; width: 300px; height: 300px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">画像なし</div>`;
        
        // 石の情報ポップアップを作成
        const stoneModal = document.createElement('div');
        stoneModal.className = 'modal';
        stoneModal.innerHTML = `
            <div class="modal-content">
                <button class="close-button" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <h2 class="modal-title">${stone.name}</h2>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        ${imageHtml}
                    </div>
                    <div class="location-info">
                        ${tagHTML ? `<div style="margin-bottom: 10px;">${tagHTML}</div>` : ''}
                        <p><strong>色:</strong> ${stone.colors?.primary || '未設定'}</p>
                        <p><strong>特徴:</strong> ${stone.special_features || '未設定'}</p>
                        <p><strong>場所:</strong> ${stone.location_name || '未設定'}</p>
                        <p><strong>詳細:</strong> ${stone.location_detail || '未設定'}</p>
                        ${stone.location_notes ? `<p><strong>備考:</strong> ${stone.location_notes}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(stoneModal);
        stoneModal.style.display = 'flex';
        
        // モーダルの外側クリックで閉じる
        stoneModal.addEventListener('click', (e) => {
            if (e.target === stoneModal) {
                stoneModal.remove();
            }
        });
    });
}

// イベントリスナー設定（DOMContentLoaded後に実行）
document.addEventListener('DOMContentLoaded', function() {
    // 都道府県フィルター
    document.getElementById('prefectureFilter').addEventListener('change', (e) => {
        fetchStonesFromSupabase().then(stones => {
            updateMapDisplay(e.target.value, stones);
        });
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
});

// グローバル関数として公開（HTMLから呼び出すため）
window.toggleMode = toggleMode;
window.checkPassword = checkPassword;
window.closePasswordModal = closePasswordModal;
window.closeDetailModal = closeDetailModal;
window.showLocationDetails = showLocationDetails;
window.viewStone = viewStone;