// 鳥の位置情報入力機能 for デジタルスケッチブック

let birdLocationMap = null;
let birdLocationMarker = null;

// 地図の初期化（鳥タブ用）
function initializeBirdLocationMap() {
    // 既に初期化されていたら何もしない
    if (birdLocationMap) {
        birdLocationMap.invalidateSize();
        return;
    }
    
    // 地図コンテナが存在しない場合は何もしない
    const mapContainer = document.getElementById('bird-location-map');
    if (!mapContainer) {
        return;
    }
    
    // 現在の緯度経度を取得（あれば）
    const currentLat = document.getElementById('bird-lat').value || 35.681236;
    const currentLng = document.getElementById('bird-lng').value || 139.767125;
    
    // 地図を初期化
    birdLocationMap = L.map('bird-location-map').setView([currentLat, currentLng], 15);
    
    // CartoDBの明るいタイルレイヤー（石マップと同じスタイル）
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(birdLocationMap);
    
    // クリックイベント
    birdLocationMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        if (birdLocationMarker) {
            birdLocationMarker.setLatLng(e.latlng);
        } else {
            birdLocationMarker = L.marker(e.latlng, {draggable: true}).addTo(birdLocationMap);
            
            // マーカーのドラッグイベント
            birdLocationMarker.on('dragend', function(event) {
                const position = birdLocationMarker.getLatLng();
                updateBirdLocationFields(position.lat, position.lng);
            });
        }
        
        updateBirdLocationFields(lat, lng);
    });
    
    // 既存のマーカーがあれば表示
    if (currentLat && currentLng && currentLat !== 35.681236) {
        birdLocationMarker = L.marker([currentLat, currentLng], {draggable: true}).addTo(birdLocationMap);
        
        birdLocationMarker.on('dragend', function(event) {
            const position = birdLocationMarker.getLatLng();
            updateBirdLocationFields(position.lat, position.lng);
        });
    }
}

// 緯度経度フィールドを更新
function updateBirdLocationFields(lat, lng) {
    document.getElementById('bird-lat').value = lat.toFixed(7);
    document.getElementById('bird-lng').value = lng.toFixed(7);
}

// グローバルに公開
window.birdLocationMap = birdLocationMap;
window.birdLocationMarker = birdLocationMarker;
window.initializeBirdLocationMap = initializeBirdLocationMap;

// 石タブが開かれた時に地図を初期化
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延を置いて、鳥タブがアクティブかチェック
    setTimeout(() => {
        const birdsTab = document.getElementById('birds-tab');
        if (birdsTab && birdsTab.classList.contains('active')) {
            // 鳥タブが最初から開いている場合は地図を初期化
            initializeBirdLocationMap();
        }
    }, 500);
    
    // 緯度経度フィールドの変更を監視
    const latField = document.getElementById('bird-lat');
    const lngField = document.getElementById('bird-lng');
    
    if (latField && lngField) {
        // 緯度フィールドの変更時
        latField.addEventListener('change', function() {
            const lat = parseFloat(this.value);
            const lng = parseFloat(lngField.value);
            
            if (!isNaN(lat) && !isNaN(lng) && birdLocationMap) {
                birdLocationMap.setView([lat, lng], 15);
                
                if (birdLocationMarker) {
                    birdLocationMarker.setLatLng([lat, lng]);
                } else {
                    birdLocationMarker = L.marker([lat, lng], {draggable: true}).addTo(birdLocationMap);
                    
                    birdLocationMarker.on('dragend', function(event) {
                        const position = birdLocationMarker.getLatLng();
                        updateBirdLocationFields(position.lat, position.lng);
                    });
                }
            }
        });
        
        // 経度フィールドの変更時
        lngField.addEventListener('change', function() {
            const lat = parseFloat(latField.value);
            const lng = parseFloat(this.value);
            
            if (!isNaN(lat) && !isNaN(lng) && birdLocationMap) {
                birdLocationMap.setView([lat, lng], 15);
                
                if (birdLocationMarker) {
                    birdLocationMarker.setLatLng([lat, lng]);
                } else {
                    birdLocationMarker = L.marker([lat, lng], {draggable: true}).addTo(birdLocationMap);
                    
                    birdLocationMarker.on('dragend', function(event) {
                        const position = birdLocationMarker.getLatLng();
                        updateBirdLocationFields(position.lat, position.lng);
                    });
                }
            }
        });
    }
    
    // 都道府県選択イベント
    const prefectureSelect = document.getElementById('bird-prefecture');
    if (prefectureSelect) {
        prefectureSelect.addEventListener('change', function() {
            if (window.updateBirdCityOptions) {
                window.updateBirdCityOptions(this.value);
            }
        });
    }
});