// 位置情報入力機能 for デジタルスケッチブック

let locationMap = null;
let locationMarker = null;

// 現在地取得（GPS）
function getCurrentLocationGPS() {
    if (!navigator.geolocation) {
        alert('お使いのブラウザは位置情報取得に対応していません');
        return;
    }
    
    // ローディング表示など
    const originalText = event.target.textContent;
    event.target.textContent = '⏳ 取得中...';
    event.target.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // 緯度経度フィールドに設定
            document.getElementById('stone-lat').value = lat.toFixed(7);
            document.getElementById('stone-lng').value = lng.toFixed(7);
            
            // 成功メッセージ
            alert(`現在地を取得しました！\n精度: 約${Math.round(accuracy)}m`);
            
            // ボタンを元に戻す
            event.target.textContent = originalText;
            event.target.disabled = false;
            
            // 地図が表示されていたら更新
            if (locationMap && locationMarker) {
                locationMap.setView([lat, lng], 15);
                locationMarker.setLatLng([lat, lng]);
            }
        },
        (error) => {
            let errorMessage = '位置情報の取得に失敗しました: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += '位置情報の使用が許可されていません';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += '位置情報が利用できません';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'タイムアウトしました';
                    break;
                default:
                    errorMessage += '不明なエラー';
            }
            alert(errorMessage);
            
            // ボタンを元に戻す
            event.target.textContent = originalText;
            event.target.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// 地図の初期化（自動実行用）
function initializeLocationMap() {
    // 現在の緯度経度を取得（あれば）
    const currentLat = document.getElementById('stone-lat').value || 35.681236;
    const currentLng = document.getElementById('stone-lng').value || 139.767125;
    
    // 地図を初期化
    locationMap = L.map('location-map').setView([currentLat, currentLng], 15);
    
    // OpenStreetMapタイル
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(locationMap);
    
    // クリックイベント
    locationMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        if (locationMarker) {
            locationMarker.setLatLng(e.latlng);
        } else {
            locationMarker = L.marker(e.latlng, {draggable: true}).addTo(locationMap);
            
            // マーカーのドラッグイベント
            locationMarker.on('dragend', function(event) {
                const position = locationMarker.getLatLng();
                updateLocationFields(position.lat, position.lng);
            });
        }
        
        updateLocationFields(lat, lng);
    });
    
    // 既存のマーカーがあれば表示
    if (currentLat && currentLng && currentLat !== 35.681236) {
        locationMarker = L.marker([currentLat, currentLng], {draggable: true}).addTo(locationMap);
        
        locationMarker.on('dragend', function(event) {
            const position = locationMarker.getLatLng();
            updateLocationFields(position.lat, position.lng);
        });
    }
}

// 地図から選択（廃止予定だが互換性のため残す）
function openMapSelection() {
    // すでに地図は表示されているので、何もしない
    if (locationMap) {
        locationMap.invalidateSize();
    }
}

// 緯度経度フィールドを更新
function updateLocationFields(lat, lng) {
    document.getElementById('stone-lat').value = lat.toFixed(7);
    document.getElementById('stone-lng').value = lng.toFixed(7);
}

// GoogleマップURLから抽出
function extractFromGoogleMapUrl() {
    const url = document.getElementById('stone-address').value.trim();
    
    if (!url) {
        alert('住所またはGoogleマップURLフィールドにURLを入力してください');
        return;
    }
    
    let lat, lng;
    
    // @緯度,経度 形式
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
    }
    
    // place/緯度,経度 形式
    const placeMatch = url.match(/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) {
        lat = parseFloat(placeMatch[1]);
        lng = parseFloat(placeMatch[2]);
    }
    
    // ll=緯度,経度 形式
    const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
        lat = parseFloat(llMatch[1]);
        lng = parseFloat(llMatch[2]);
    }
    
    if (lat && lng) {
        document.getElementById('stone-lat').value = lat.toFixed(7);
        document.getElementById('stone-lng').value = lng.toFixed(7);
        alert('URLから位置情報を取得しました！');
        
        // 地図が表示されていたら更新
        if (locationMap && locationMarker) {
            locationMap.setView([lat, lng], 15);
            locationMarker.setLatLng([lat, lng]);
        }
    } else {
        // 短縮URLの場合の注意
        if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
            alert('短縮URLからは直接位置情報を取得できません。\n\n次の手順でお試しください：\n1. URLをブラウザで開く\n2. 展開された完全なURLをコピー\n3. 再度このフィールドに貼り付けて実行');
        } else {
            alert('URLから位置情報を取得できませんでした。\n正しいGoogleマップのURLか確認してください。');
        }
    }
}

// 既存の extractLatLngFromUrl 関数を置き換え
window.extractLatLngFromUrl = extractFromGoogleMapUrl;

// グローバルに関数を公開
window.getCurrentLocationGPS = getCurrentLocationGPS;
window.openMapSelection = openMapSelection;
window.extractFromGoogleMapUrl = extractFromGoogleMapUrl;
window.initializeLocationMap = initializeLocationMap;

// 石タブが開かれた時に地図を初期化
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延を置いて、石タブがアクティブかチェック
    setTimeout(() => {
        const stonesTab = document.getElementById('stones-tab');
        if (stonesTab && stonesTab.classList.contains('active')) {
            // 石タブが最初から開いている場合は地図を初期化
            initializeLocationMap();
        }
    }, 500);
});