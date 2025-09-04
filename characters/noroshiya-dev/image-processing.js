// 画像処理機能 for デジタルスケッチブック

// 現在処理中の画像を保持
let originalImageForProcessing = null;

// 画像選択時の処理を拡張
function handleStoneImageSelectWithProcessing(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
        alert('画像サイズは5MB以下にしてください。');
        return;
    }
    
    // 画像プレビュー表示と画像処理オプション表示
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewEl = document.getElementById('stone-image-preview');
        const colorPreviewImg = document.getElementById('stone-color-preview-image');
        const noImagePlaceholder = document.querySelector('.no-image-placeholder');
        
        previewEl.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        currentStoneImage = e.target.result; // Base64データとして保存
        
        // カラーピッカー用の画像も更新
        if (colorPreviewImg) {
            colorPreviewImg.src = e.target.result;
            colorPreviewImg.style.display = 'block';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'none';
        }
        
        // 「画像から色を抽出」ボタンを表示
        const extractColorsBtn = document.getElementById('extract-colors-btn');
        if (extractColorsBtn) {
            extractColorsBtn.style.display = 'block';
        }
        
        // 画像処理オプションを表示
        document.getElementById('image-processing-options').style.display = 'block';
        
        // 元画像を保持
        const img = new Image();
        img.onload = () => {
            originalImageForProcessing = img;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// モザイクサイズのリアルタイム表示
document.addEventListener('DOMContentLoaded', () => {
    const mosaicSizeInput = document.getElementById('mosaic-size');
    const mosaicSizeValue = document.getElementById('mosaic-size-value');
    
    if (mosaicSizeInput) {
        mosaicSizeInput.addEventListener('input', (e) => {
            mosaicSizeValue.textContent = e.target.value + 'px';
        });
    }
    
    // チェックボックスでコントロールの表示/非表示
    const applyMosaicCheck = document.getElementById('apply-mosaic');
    const mosaicControls = document.getElementById('mosaic-controls');
    if (applyMosaicCheck) {
        applyMosaicCheck.addEventListener('change', (e) => {
            mosaicControls.style.display = e.target.checked ? 'block' : 'none';
        });
    }
    
    const removeBgCheck = document.getElementById('remove-background');
    const bgControls = document.getElementById('bg-removal-controls');
    if (removeBgCheck) {
        removeBgCheck.addEventListener('change', (e) => {
            bgControls.style.display = e.target.checked ? 'block' : 'none';
        });
    }
});

// 画像処理実行
function processStoneImage() {
    if (!originalImageForProcessing) {
        alert('画像を選択してください');
        return;
    }
    
    const canvas = document.getElementById('processed-canvas');
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズを画像に合わせる
    canvas.width = originalImageForProcessing.width;
    canvas.height = originalImageForProcessing.height;
    
    // 元画像を描画
    ctx.drawImage(originalImageForProcessing, 0, 0);
    
    // モザイク処理
    const applyMosaic = document.getElementById('apply-mosaic').checked;
    if (applyMosaic) {
        const pixelSize = parseInt(document.getElementById('mosaic-size').value);
        applyMosaicEffect(ctx, canvas.width, canvas.height, pixelSize);
    }
    
    // 背景除去
    const removeBackground = document.getElementById('remove-background').checked;
    if (removeBackground) {
        const method = document.getElementById('bg-removal-method').value;
        removeBackgroundEffect(ctx, canvas.width, canvas.height, method);
    }
    
    // 処理済み画像を表示
    document.getElementById('processed-image-container').style.display = 'block';
    
    // 処理済み画像をcurrentStoneImageに保存
    currentStoneImage = canvas.toDataURL('image/png');
    
    // メインの画像プレビューも更新
    const previewEl = document.getElementById('stone-image-preview');
    previewEl.innerHTML = `<img src="${currentStoneImage}" alt="プレビュー">`;
    
    // カラーピッカー用の画像も更新
    const colorPreviewImg = document.getElementById('stone-color-preview-image');
    if (colorPreviewImg) {
        colorPreviewImg.src = currentStoneImage;
    }
}

// モザイク効果
function applyMosaicEffect(ctx, width, height, pixelSize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            // ブロック内の平均色を計算
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    r += data[index];
                    g += data[index + 1];
                    b += data[index + 2];
                    a += data[index + 3];
                    count++;
                }
            }
            
            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);
            a = Math.round(a / count);
            
            // ブロック全体を平均色で塗りつぶす
            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const index = ((y + dy) * width + (x + dx)) * 4;
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = a;
                }
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// 背景除去効果
function removeBackgroundEffect(ctx, width, height, method) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    if (method === 'white') {
        // 白背景を透過
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                data[i + 3] = 0;
            }
        }
    } else if (method === 'auto') {
        // 四隅の色を背景と仮定
        const corners = [
            0, // 左上
            (width - 1) * 4, // 右上
            (height - 1) * width * 4, // 左下
            ((height - 1) * width + width - 1) * 4 // 右下
        ];
        
        // 四隅の平均色を背景色とする
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(index => {
            bgR += data[index];
            bgG += data[index + 1];
            bgB += data[index + 2];
        });
        bgR /= 4;
        bgG /= 4;
        bgB /= 4;
        
        // 背景色に近い色を透過
        for (let i = 0; i < data.length; i += 4) {
            const dr = Math.abs(data[i] - bgR);
            const dg = Math.abs(data[i + 1] - bgG);
            const db = Math.abs(data[i + 2] - bgB);
            
            if (dr < 30 && dg < 30 && db < 30) {
                data[i + 3] = 0;
            }
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// グローバルに関数を公開
window.handleStoneImageSelectWithProcessing = handleStoneImageSelectWithProcessing;
window.processStoneImage = processStoneImage;