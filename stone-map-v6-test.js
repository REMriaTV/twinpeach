// モード管理
let currentMapMode = localStorage.getItem('stoneMapMode') || 'blur';
let modeUnlockExpiry = localStorage.getItem('modeUnlockExpiry');

// パスワード
const UNLOCK_PASSWORD = 'mokumoku';

// GeoJSONデータ格納用
let japanGeoJSON = null;

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
    const filterSelect = document.getElementById('prefectureFilter');
    
    // 既存のオプションをクリア（「すべて表示」以外）
    filterSelect.innerHTML = '<option value="">すべて表示</option>';
    
    // 都道府県を追加
    prefectures.forEach(pref => {
        const option = document.createElement('option');
        option.value = pref;
        option.textContent = pref;
        filterSelect.appendChild(option);
    });
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

// 石の詳細を表示（はっきりモード用）
function showStoneDetails(stoneId) {
    fetchStonesFromSupabase().then(allStones => {
        const stone = allStones.find(s => s.id === stoneId);
        if (!stone) return;
        
        const tagHTML = createTagHTML(stone);
        
        let detailType = '';
        if (stone.location_detail) {
            detailType = `<strong>データ:</strong> ${stone.location_detail}<br>`;
        }
        
        let notes = '';
        if (stone.location_notes) {
            notes = `<strong>備考:</strong> ${stone.location_notes}<br>`;
        }
        
        const imageHtml = stone.image_url 
            ? `<img src="${stone.image_url}" alt="${stone.name}" style="max-width: 300px; border-radius: 8px;">`
            : `<div style="background: #ddd; width: 300px; height: 300px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">画像なし</div>`;
        
        // 詳細モーダルに内容を設定
        document.getElementById('detailTitle').textContent = stone.name;
        document.getElementById('detailBody').innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${imageHtml}
            </div>
            <div class="location-info">
                <strong>エリア名:</strong> ${stone.location_name || '未設定'}<br>
                <strong>都道府県:</strong> ${stone.prefecture || '未設定'}<br>
                <strong>市区町村:</strong> ${stone.city || '未設定'}<br>
                ${detailType}
                ${notes}
                ${stone.address ? `<strong>住所:</strong> ${stone.address}<br>` : ''}
                ${stone.special_features ? `<strong>特徴:</strong> ${stone.special_features}<br>` : ''}
            </div>
            <div class="location-tags">${tagHTML}</div>
        `;
        
        // モーダルを表示
        document.getElementById('detailModal').style.display = 'flex';
    });
}

// カスタムアイコンを作成
function createCustomIcon(locationTag) {
    const color = getMarkerColor(locationTag);
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

// 地図表示を更新
function updateMapDisplay(filterPrefecture = '', stones = []) {
    // レイヤーをクリア
    markersLayer.clearLayers();
    if (geoJSONLayer) {
        map.removeLayer(geoJSONLayer);
        geoJSONLayer = null;
    }
    
    // フィルタリング
    const filteredStones = stones.filter(stone => 
        (!filterPrefecture || stone.prefecture === filterPrefecture) &&
        stone.lat && stone.lng
    );
    
    if (currentMapMode === 'blur') {
        // ぼんやりモード: 都道府県を色分け表示
        const prefectureGroups = {};
        
        filteredStones.forEach(stone => {
            if (!prefectureGroups[stone.prefecture]) {
                prefectureGroups[stone.prefecture] = [];
            }
            prefectureGroups[stone.prefecture].push(stone);
        });
        
        // GeoJSONがある場合は正確な都道府県形状を使用
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
        // はっきりモード: 個別の石の場所にマーカーを配置
        filteredStones.forEach(stone => {
            const marker = L.marker([stone.lat, stone.lng], {
                icon: createCustomIcon(stone.location_tag || '山・その他')
            });
            
            // ミニマルなポップアップ
            const miniContent = `
                <div class="mini-popup" style="cursor: pointer;" onclick="showStoneDetails('${stone.id}')">
                    <h4>${stone.name}</h4>
                    <div class="stone-count">${stone.location_name || '場所未設定'}</div>
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
                showStoneDetails(stone.id);
            });
            
            markersLayer.addLayer(marker);
        });
    }
}

// 石の詳細を表示
function viewStone(stoneId) {
    console.log('石の詳細を表示:', stoneId);
    // 実際の詳細ページへの遷移やモーダル表示を実装
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