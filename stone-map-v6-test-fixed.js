// Supabase設定
const SUPABASE_URL = 'https://roaucowddadmvxgzrvnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXVjb3dkZGFkbXZ4Z3pydm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxMDMsImV4cCI6MjA2NzgyMDEwM30.Tqs__X1JOfPiKsb5llj93jVLnyszF_ZrZjfp_UaIiNw';

// Supabaseクライアント初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// マップ関連の変数
let map;
let markersLayer;
let geoJsonLayer;
let japanGeoJSON = null;

// モード管理
let currentMapMode = 'blur'; // 'blur' または 'clear'
const UNLOCK_PASSWORD = 'mokumoku';

// 都道府県の中心座標（主要都市）
const prefectureCoordinates = {
    '北海道': [43.0642, 141.3469],
    '青森県': [40.8246, 140.7406],
    '岩手県': [39.7036, 141.1527],
    '宮城県': [38.2688, 140.8721],
    '秋田県': [39.7186, 140.1024],
    '山形県': [38.2404, 140.3634],
    '福島県': [37.7608, 140.4748],
    '茨城県': [36.3418, 140.4468],
    '栃木県': [36.5657, 139.8836],
    '群馬県': [36.3911, 139.0608],
    '埼玉県': [35.8569, 139.6489],
    '千葉県': [35.6047, 140.1234],
    '東京都': [35.6762, 139.6503],
    '神奈川県': [35.4478, 139.6425],
    '新潟県': [37.9022, 139.0236],
    '富山県': [36.6953, 137.2114],
    '石川県': [36.5947, 136.6256],
    '福井県': [36.0652, 136.2218],
    '山梨県': [35.6640, 138.5684],
    '長野県': [36.6513, 138.1810],
    '岐阜県': [35.3912, 136.7223],
    '静岡県': [34.9769, 138.3831],
    '愛知県': [35.1802, 136.9066],
    '三重県': [34.7303, 136.5086],
    '滋賀県': [35.0045, 135.8686],
    '京都府': [35.0211, 135.7559],
    '大阪府': [34.6863, 135.5200],
    '兵庫県': [34.6913, 135.1830],
    '奈良県': [34.6851, 135.8329],
    '和歌山県': [34.2260, 135.1675],
    '鳥取県': [35.5011, 134.2351],
    '島根県': [35.4723, 133.0505],
    '岡山県': [34.6618, 133.9345],
    '広島県': [34.3966, 132.4596],
    '山口県': [34.1858, 131.4705],
    '徳島県': [34.0658, 134.5593],
    '香川県': [34.3400, 134.0434],
    '愛媛県': [33.8416, 132.7657],
    '高知県': [33.5597, 133.5311],
    '福岡県': [33.6064, 130.4183],
    '佐賀県': [33.2494, 130.2988],
    '長崎県': [32.7448, 129.8737],
    '熊本県': [32.7898, 130.7417],
    '大分県': [33.2382, 131.6126],
    '宮崎県': [31.9111, 131.4239],
    '鹿児島県': [31.5602, 130.5581],
    '沖縄県': [26.2124, 127.6809]
};

// 地図の初期化
function initMap() {
    // 読み込み表示を非表示
    document.getElementById('loading').style.display = 'none';
    
    // マップを初期化
    map = L.map('map').setView([36.5, 138], 5);
    
    // タイル層を追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // マーカーレイヤーを初期化
    markersLayer = L.layerGroup().addTo(map);
    
    // 都道府県フィルターを初期化
    initPrefectureFilter();
}

// 都道府県フィルターを初期化
function initPrefectureFilter() {
    const select = document.getElementById('prefectureFilter');
    select.innerHTML = '<option value="all">すべて表示</option>';
    
    Object.keys(prefectureCoordinates).forEach(pref => {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        select.appendChild(option);
    });
}

// カスタムアイコンを作成
function createCustomIcon(locationTag) {
    const color = getMarkerColor(locationTag);
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

// GeoJSONデータを読み込む
async function loadJapanGeoJSON() {
    console.log('Starting to load GeoJSON...');
    try {
        const response = await fetch('https://raw.githubusercontent.com/niiyz/JapanGeoGo/master/geojson/prefectures.geojson');
        japanGeoJSON = await response.json();
        console.log('GeoJSON loaded successfully');
        
        // 初期化が完了したら石データを読み込む
        initMap();
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            console.log('Stones loaded:', stones.length);
            updateMapDisplay('all', stones);
        }).catch(err => {
            console.error('Error loading stones:', err);
        });
    } catch (error) {
        console.error('Failed to load GeoJSON:', error);
        // フォールバック：GeoJSONなしで続行
        initMap();
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            console.log('Stones loaded (fallback):', stones.length);
            updateMapDisplay('all', stones);
        }).catch(err => {
            console.error('Error loading stones (fallback):', err);
        });
    }
}

// モードの有効期限をチェック
function checkModeExpiry() {
    const savedMode = localStorage.getItem('stoneMapMode');
    const expiry = localStorage.getItem('modeUnlockExpiry');
    
    if (savedMode === 'clear' && expiry) {
        const expiryTime = parseInt(expiry);
        if (new Date().getTime() > expiryTime) {
            // 期限切れ
            localStorage.removeItem('stoneMapMode');
            localStorage.removeItem('modeUnlockExpiry');
            currentMapMode = 'blur';
        } else {
            currentMapMode = 'clear';
        }
    } else {
        currentMapMode = 'blur';
    }
}

// モード表示を更新
function updateModeDisplay() {
    const modeText = document.getElementById('currentMode');
    const toggleBtn = document.getElementById('toggleMode');
    
    if (currentMapMode === 'blur') {
        modeText.textContent = 'ぼんやりモード';
        toggleBtn.textContent = 'はっきりモードへ';
    } else {
        modeText.textContent = 'はっきりモード';
        toggleBtn.textContent = 'ぼんやりモードへ';
    }
}

// モード切り替え
function toggleMode() {
    if (currentMapMode === 'blur') {
        // パスワード入力モーダルを表示
        document.getElementById('passwordModal').style.display = 'flex';
        document.getElementById('passwordInput').focus();
    } else {
        currentMapMode = 'blur';
        localStorage.setItem('stoneMapMode', 'blur');
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            updateMapDisplay(document.getElementById('prefectureFilter').value, stones);
        });
    }
}

// パスワード確認
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === UNLOCK_PASSWORD) {
        currentMapMode = 'clear';
        const expiry = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('stoneMapMode', 'clear');
        localStorage.setItem('modeUnlockExpiry', expiry);
        closePasswordModal();
        updateModeDisplay();
        fetchStonesFromSupabase().then(stones => {
            updateMapDisplay(document.getElementById('prefectureFilter').value, stones);
        });
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
function getMarkerColor(locationTag) {
    switch(locationTag) {
        case '川・河原': return '#4ECDC4';
        case '海岸': return '#45B7D1';
        default: return '#96CEB4';
    }
}

// タグHTMLを生成
function createTagHTML(stone) {
    if (!stone.location_tag) return '';
    
    const className = stone.location_tag === '川・河原' ? 'tag-river' : 
                     stone.location_tag === '海岸' ? 'tag-ocean' : 'tag-mountain';
    return `<span class="tag-badge ${className}">${stone.location_tag}</span>`;
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
    fetchStonesFromSupabase().then(allStones => {
        const stones = allStones.filter(stone => stone.prefecture === prefecture);
        const totalStones = stones.length;
        
        // タグの集計
        const tags = new Set();
        stones.forEach(stone => {
            if (stone.location_tag) tags.add(stone.location_tag);
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
            const locationNames = [...new Set(stones.map(s => s.location_name).filter(n => n))].join('、');
            locationsHTML = `<p><strong>場所:</strong> ${locationNames || '未設定'}</p>`;
        } else {
            // はっきりモード：詳細な場所情報をグループ化
            const locationGroups = {};
            stones.forEach(stone => {
                const key = stone.location_name || '場所未設定';
                if (!locationGroups[key]) {
                    locationGroups[key] = {
                        name: stone.location_name,
                        city: stone.city,
                        detail: stone.location_detail,
                        notes: stone.location_notes,
                        address: stone.address,
                        stones: []
                    };
                }
                locationGroups[key].stones.push(stone);
            });
            
            Object.values(locationGroups).forEach(location => {
                let detailInfo = '';
                if (location.detail) {
                    detailInfo = ` (${location.detail})`;
                }
                if (location.notes) {
                    detailInfo += ` - ${location.notes}`;
                }
                
                locationsHTML += `
                    <div style="margin-bottom: 15px; padding: 10px; background: #f8f8f8; border-radius: 8px;">
                        <h4 style="margin: 0 0 5px 0; font-size: 16px;">${location.name || '場所未設定'}${detailInfo}</h4>
                        <p style="font-size: 14px; color: #666; margin: 5px 0;">
                            ${location.city || ''}
                            ${location.address ? `<br><span style="font-size: 12px;">${location.address}</span>` : ''}
                        </p>
                        <p style="font-size: 12px; color: #999;">採取石数: ${location.stones.length}個</p>
                    </div>
                `;
            });
        }
        
        let stonesHtml = '<div class="stone-grid">';
        stones.forEach(stone => {
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
    });
}

// Supabaseから石データを取得
async function fetchStonesFromSupabase() {
    console.log('Fetching stones from Supabase...');
    try {
        const { data, error } = await supabase
            .from('stones')
            .select('*')
            .not('lat', 'is', null)
            .not('lng', 'is', null);
        
        if (error) {
            console.error('Supabase error:', error);
            // エラー表示
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = `<div class="error-message">データの読み込みに失敗しました: ${error.message}</div>`;
            return [];
        }
        
        console.log('Fetched stones:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Error fetching stones:', error);
        // エラー表示
        const mapDiv = document.getElementById('map');
        mapDiv.innerHTML = `<div class="error-message">データベース接続エラー: ${error.message}</div>`;
        return [];
    }
}

// 地図の表示を更新
async function updateMapDisplay(prefectureFilter, stones) {
    // 既存のマーカーをクリア
    markersLayer.clearLayers();
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
        geoJsonLayer = null;
    }
    
    // フィルタリング
    const filteredStones = prefectureFilter === 'all' 
        ? stones 
        : stones.filter(stone => stone.prefecture === prefectureFilter);
    
    if (currentMapMode === 'blur') {
        // ぼんやりモード: 都道府県ごとに色分け
        const prefectureGroups = {};
        filteredStones.forEach(stone => {
            if (!prefectureGroups[stone.prefecture]) {
                prefectureGroups[stone.prefecture] = [];
            }
            prefectureGroups[stone.prefecture].push(stone);
        });
        
        // GeoJSONを使った都道府県表示
        if (japanGeoJSON) {
            geoJsonLayer = L.geoJSON(japanGeoJSON, {
                style: function(feature) {
                    const prefName = feature.properties.nam_ja || 
                                   feature.properties.name_ja || 
                                   feature.properties.name || 
                                   feature.properties.NAME || 
                                   feature.properties.prefecture ||
                                   feature.properties.N03_001;
                    
                    const stones = prefectureGroups[prefName];
                    
                    if (stones && stones.length > 0) {
                        // 最も多い location_tag を取得
                        const tagCount = {};
                        stones.forEach(stone => {
                            if (stone.location_tag) {
                                tagCount[stone.location_tag] = (tagCount[stone.location_tag] || 0) + 1;
                            }
                        });
                        const dominantTag = Object.entries(tagCount)
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || '山・その他';
                        
                        const color = getMarkerColor(dominantTag);
                        
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
            // 都道府県ごとに中心点にマーカーを配置するなど
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

// 初期化
checkModeExpiry();
loadJapanGeoJSON();