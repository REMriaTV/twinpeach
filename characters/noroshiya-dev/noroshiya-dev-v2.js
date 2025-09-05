// 狼煙屋・鳥・石 データベース管理 JavaScript
// Version 2.0 - 色ベースシステム対応

// Supabase設定
const SUPABASE_URL = 'https://roaucowddadmvxgzrvnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvYXVjb3dkZGFkbXZ4Z3pydm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDQxMDMsImV4cCI6MjA2NzgyMDEwM30.Tqs__X1JOfPiKsb5llj93jVLnyszF_ZrZjfp_UaIiNw';

// Supabaseクライアント初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// グローバル変数
let noroshiyaList = [];
let birdsList = [];
let stonesList = [];
let currentNoroshiyaId = null;
let currentBirdId = null;
let currentStoneId = null;
let currentStoneImage = null; // 現在選択中の石の画像
let savedLocations = []; // 保存された採取ポイント

// 都道府県別の市区町村データ
const cityDataList = {
    "北海道": ["札幌市", "函館市", "小樽市", "旭川市", "室蘭市", "釧路市", "帯広市", "北見市", "夕張市", "岩見沢市", "網走市", "留萌市", "苫小牧市", "稚内市", "美唄市", "芦別市", "江別市", "赤平市", "紋別市", "士別市", "名寄市", "三笠市", "根室市", "千歳市", "滝川市", "砂川市", "歌志内市", "深川市", "富良野市", "登別市", "恵庭市", "伊達市", "北広島市", "石狩市", "北斗市"],
    "青森県": ["青森市", "弘前市", "八戸市", "黒石市", "五所川原市", "十和田市", "三沢市", "むつ市", "つがる市", "平川市"],
    "岩手県": ["盛岡市", "宮古市", "大船渡市", "花巻市", "北上市", "久慈市", "遠野市", "一関市", "陸前高田市", "釜石市", "二戸市", "八幡平市", "奥州市", "滝沢市"],
    "宮城県": ["仙台市", "石巻市", "塩竈市", "気仙沼市", "白石市", "名取市", "角田市", "多賀城市", "岩沼市", "登米市", "栗原市", "東松島市", "大崎市", "富谷市"],
    "秋田県": ["秋田市", "能代市", "横手市", "大館市", "男鹿市", "湯沢市", "鹿角市", "由利本荘市", "潟上市", "大仙市", "北秋田市", "にかほ市", "仙北市"],
    "山形県": ["山形市", "米沢市", "鶴岡市", "酒田市", "新庄市", "寒河江市", "上山市", "村山市", "長井市", "天童市", "東根市", "尾花沢市", "南陽市"],
    "福島県": ["福島市", "会津若松市", "郡山市", "いわき市", "白河市", "須賀川市", "喜多方市", "相馬市", "二本松市", "田村市", "南相馬市", "伊達市", "本宮市"],
    "茨城県": ["水戸市", "日立市", "土浦市", "古河市", "石岡市", "結城市", "龍ケ崎市", "下妻市", "常総市", "常陸太田市", "高萩市", "北茨城市", "笠間市", "取手市", "牛久市", "つくば市", "ひたちなか市", "鹿嶋市", "潮来市", "守谷市", "常陸大宮市", "那珂市", "筑西市", "坂東市", "稲敷市", "かすみがうら市", "桜川市", "神栖市", "行方市", "鉾田市", "つくばみらい市", "小美玉市"],
    "栃木県": ["宇都宮市", "足利市", "栃木市", "佐野市", "鹿沼市", "日光市", "小山市", "真岡市", "大田原市", "矢板市", "那須塩原市", "さくら市", "那須烏山市", "下野市"],
    "群馬県": ["前橋市", "高崎市", "桐生市", "伊勢崎市", "太田市", "沼田市", "館林市", "渋川市", "藤岡市", "富岡市", "安中市", "みどり市"],
    "埼玉県": ["さいたま市", "川越市", "熊谷市", "川口市", "行田市", "秩父市", "所沢市", "飯能市", "加須市", "本庄市", "東松山市", "春日部市", "狭山市", "羽生市", "鴻巣市", "深谷市", "上尾市", "草加市", "越谷市", "蕨市", "戸田市", "入間市", "朝霞市", "志木市", "和光市", "新座市", "桶川市", "久喜市", "北本市", "八潮市", "富士見市", "三郷市", "蓮田市", "坂戸市", "幸手市", "鶴ヶ島市", "日高市", "吉川市", "ふじみ野市", "白岡市"],
    "千葉県": ["千葉市", "銚子市", "市川市", "船橋市", "館山市", "木更津市", "松戸市", "野田市", "茂原市", "成田市", "佐倉市", "東金市", "旭市", "習志野市", "柏市", "勝浦市", "市原市", "流山市", "八千代市", "我孫子市", "鴨川市", "鎌ケ谷市", "君津市", "富津市", "浦安市", "四街道市", "袖ケ浦市", "八街市", "印西市", "白井市", "富里市", "南房総市", "匝瑳市", "香取市", "山武市", "いすみ市", "大網白里市"],
    "東京都": ["千代田区", "中央区", "港区", "新宿区", "文京区", "台東区", "墨田区", "江東区", "品川区", "目黒区", "大田区", "世田谷区", "渋谷区", "中野区", "杉並区", "豊島区", "北区", "荒川区", "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区", "八王子市", "立川市", "武蔵野市", "三鷹市", "青梅市", "府中市", "昭島市", "調布市", "町田市", "小金井市", "小平市", "日野市", "東村山市", "国分寺市", "国立市", "福生市", "狛江市", "東大和市", "清瀬市", "東久留米市", "武蔵村山市", "多摩市", "稲城市", "羽村市", "あきる野市", "西東京市"],
    "神奈川県": ["横浜市", "川崎市", "相模原市", "横須賀市", "平塚市", "鎌倉市", "藤沢市", "小田原市", "茅ヶ崎市", "逗子市", "三浦市", "秦野市", "厚木市", "大和市", "伊勢原市", "海老名市", "座間市", "南足柄市", "綾瀬市"],
    "新潟県": ["新潟市", "長岡市", "三条市", "柏崎市", "新発田市", "小千谷市", "加茂市", "十日町市", "見附市", "村上市", "燕市", "糸魚川市", "妙高市", "五泉市", "上越市", "阿賀野市", "佐渡市", "魚沼市", "南魚沼市", "胎内市"],
    "富山県": ["富山市", "高岡市", "魚津市", "氷見市", "滑川市", "黒部市", "砺波市", "小矢部市", "南砺市", "射水市"],
    "石川県": ["金沢市", "七尾市", "小松市", "輪島市", "珠洲市", "加賀市", "羽咋市", "かほく市", "白山市", "能美市", "野々市市"],
    "福井県": ["福井市", "敦賀市", "小浜市", "大野市", "勝山市", "鯖江市", "あわら市", "越前市", "坂井市"],
    "山梨県": ["甲府市", "富士吉田市", "都留市", "山梨市", "大月市", "韮崎市", "南アルプス市", "北杜市", "甲斐市", "笛吹市", "上野原市", "甲州市", "中央市"],
    "長野県": ["長野市", "松本市", "上田市", "岡谷市", "飯田市", "諏訪市", "須坂市", "小諸市", "伊那市", "駒ヶ根市", "中野市", "大町市", "飯山市", "茅野市", "塩尻市", "佐久市", "千曲市", "東御市", "安曇野市"],
    "岐阜県": ["岐阜市", "大垣市", "高山市", "多治見市", "関市", "中津川市", "美濃市", "瑞浪市", "羽島市", "恵那市", "美濃加茂市", "土岐市", "各務原市", "可児市", "山県市", "瑞穂市", "飛騨市", "本巣市", "郡上市", "下呂市", "海津市"],
    "静岡県": ["静岡市", "浜松市", "沼津市", "熱海市", "三島市", "富士宮市", "伊東市", "島田市", "富士市", "磐田市", "焼津市", "掛川市", "藤枝市", "御殿場市", "袋井市", "下田市", "裾野市", "湖西市", "伊豆市", "御前崎市", "菊川市", "伊豆の国市", "牧之原市"],
    "愛知県": ["名古屋市", "豊橋市", "岡崎市", "一宮市", "瀬戸市", "半田市", "春日井市", "豊川市", "津島市", "碧南市", "刈谷市", "豊田市", "安城市", "西尾市", "蒲郡市", "犬山市", "常滑市", "江南市", "小牧市", "稲沢市", "新城市", "東海市", "大府市", "知多市", "知立市", "尾張旭市", "高浜市", "岩倉市", "豊明市", "日進市", "田原市", "愛西市", "清須市", "北名古屋市", "弥富市", "みよし市", "あま市", "長久手市"],
    "三重県": ["津市", "四日市市", "伊勢市", "松阪市", "桑名市", "鈴鹿市", "名張市", "尾鷲市", "亀山市", "鳥羽市", "熊野市", "いなべ市", "志摩市", "伊賀市"],
    "滋賀県": ["大津市", "彦根市", "長浜市", "近江八幡市", "草津市", "守山市", "栗東市", "甲賀市", "野洲市", "湖南市", "高島市", "東近江市", "米原市"],
    "京都府": ["京都市", "福知山市", "舞鶴市", "綾部市", "宇治市", "宮津市", "亀岡市", "城陽市", "向日市", "長岡京市", "八幡市", "京田辺市", "京丹後市", "南丹市", "木津川市"],
    "大阪府": ["大阪市", "堺市", "岸和田市", "豊中市", "池田市", "吹田市", "泉大津市", "高槻市", "貝塚市", "守口市", "枚方市", "茨木市", "八尾市", "泉佐野市", "富田林市", "寝屋川市", "河内長野市", "松原市", "大東市", "和泉市", "箕面市", "柏原市", "羽曳野市", "門真市", "摂津市", "高石市", "藤井寺市", "東大阪市", "泉南市", "四條畷市", "交野市", "大阪狭山市", "阪南市"],
    "兵庫県": ["神戸市", "姫路市", "尼崎市", "明石市", "西宮市", "洲本市", "芦屋市", "伊丹市", "相生市", "豊岡市", "加古川市", "赤穂市", "西脇市", "宝塚市", "三木市", "高砂市", "川西市", "小野市", "三田市", "加西市", "丹波篠山市", "養父市", "丹波市", "南あわじ市", "朝来市", "淡路市", "宍粟市", "加東市", "たつの市"],
    "奈良県": ["奈良市", "大和高田市", "大和郡山市", "天理市", "橿原市", "桜井市", "五條市", "御所市", "生駒市", "香芝市", "葛城市", "宇陀市"],
    "和歌山県": ["和歌山市", "海南市", "橋本市", "有田市", "御坊市", "田辺市", "新宮市", "紀の川市", "岩出市"],
    "鳥取県": ["鳥取市", "米子市", "倉吉市", "境港市"],
    "島根県": ["松江市", "浜田市", "出雲市", "益田市", "大田市", "安来市", "江津市", "雲南市"],
    "岡山県": ["岡山市", "倉敷市", "津山市", "玉野市", "笠岡市", "井原市", "総社市", "高梁市", "新見市", "備前市", "瀬戸内市", "赤磐市", "真庭市", "美作市", "浅口市"],
    "広島県": ["広島市", "呉市", "竹原市", "三原市", "尾道市", "福山市", "府中市", "三次市", "庄原市", "大竹市", "東広島市", "廿日市市", "安芸高田市", "江田島市"],
    "山口県": ["下関市", "宇部市", "山口市", "萩市", "防府市", "下松市", "岩国市", "光市", "長門市", "柳井市", "美祢市", "周南市", "山陽小野田市"],
    "徳島県": ["徳島市", "鳴門市", "小松島市", "阿南市", "吉野川市", "阿波市", "美馬市", "三好市"],
    "香川県": ["高松市", "丸亀市", "坂出市", "善通寺市", "観音寺市", "さぬき市", "東かがわ市", "三豊市"],
    "愛媛県": ["松山市", "今治市", "宇和島市", "八幡浜市", "新居浜市", "西条市", "大洲市", "伊予市", "四国中央市", "西予市", "東温市"],
    "高知県": ["高知市", "室戸市", "安芸市", "南国市", "土佐市", "須崎市", "宿毛市", "土佐清水市", "四万十市", "香南市", "香美市"],
    "福岡県": ["北九州市", "福岡市", "大牟田市", "久留米市", "直方市", "飯塚市", "田川市", "柳川市", "八女市", "筑後市", "大川市", "行橋市", "豊前市", "中間市", "小郡市", "筑紫野市", "春日市", "大野城市", "宗像市", "太宰府市", "古賀市", "福津市", "うきは市", "宮若市", "嘉麻市", "朝倉市", "みやま市", "糸島市", "那珂川市"],
    "佐賀県": ["佐賀市", "唐津市", "鳥栖市", "多久市", "伊万里市", "武雄市", "鹿島市", "小城市", "嬉野市", "神埼市"],
    "長崎県": ["長崎市", "佐世保市", "島原市", "諫早市", "大村市", "平戸市", "松浦市", "対馬市", "壱岐市", "五島市", "西海市", "雲仙市", "南島原市"],
    "熊本県": ["熊本市", "八代市", "人吉市", "荒尾市", "水俣市", "玉名市", "山鹿市", "菊池市", "宇土市", "上天草市", "宇城市", "阿蘇市", "天草市", "合志市"],
    "大分県": ["大分市", "別府市", "中津市", "日田市", "佐伯市", "臼杵市", "津久見市", "竹田市", "豊後高田市", "杵築市", "宇佐市", "豊後大野市", "由布市", "国東市"],
    "宮崎県": ["宮崎市", "都城市", "延岡市", "日南市", "小林市", "日向市", "串間市", "西都市", "えびの市"],
    "鹿児島県": ["鹿児島市", "鹿屋市", "枕崎市", "阿久根市", "出水市", "指宿市", "西之表市", "垂水市", "薩摩川内市", "日置市", "曽於市", "霧島市", "いちき串木野市", "南さつま市", "志布志市", "奄美市", "南九州市", "伊佐市", "姶良市"],
    "沖縄県": ["那覇市", "宜野湾市", "石垣市", "浦添市", "名護市", "糸満市", "沖縄市", "豊見城市", "うるま市", "宮古島市", "南城市"]
};

// 詳細な場所のオプション
const locationDetailDataList = {
    "川・河原": ["上流", "中流", "下流", "源流", "河口付近", "川岸", "中州", "支流合流点"],
    "海岸": ["砂浜", "磯", "岩場", "防波堤", "港湾", "入り江", "岬"],
    "山・その他": ["山頂", "山腹", "麓", "登山道", "林道", "公園", "その他"]
};

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
            
            if (tab === 'birds' && birdsList.length === 0) {
                await loadBirdsData();
            } else if (tab === 'stones' && stonesList.length === 0) {
                await loadStonesData();
            } else if (tab === 'noroshiya' && noroshiyaList.length === 0) {
                await loadNoroshiyaData();
            }
        });
    });
    
    // フォームのサブミット
    document.getElementById('noroshiya-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNoroshiya();
    });
    
    document.getElementById('bird-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBird();
    });
    
    document.getElementById('stone-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStoneWithImage();
    });
    
    // 石の色調合システムを初期化
    initializeColorBlendingSystem();
    
    // GoogleマップURLから緯度経度を自動抽出
    const addressInput = document.getElementById('stone-address');
    if (addressInput) {
        addressInput.addEventListener('change', (e) => {
            extractLatLngFromUrl(e.target.value);
        });
    }
    
    // 都道府県選択時に市区町村を動的に更新
    const prefectureSelect = document.getElementById('stone-prefecture');
    if (prefectureSelect) {
        prefectureSelect.addEventListener('change', (e) => {
            updateCityOptions(e.target.value);
        });
    }
    
    // タグ選択時に詳細な場所を動的に更新
    const tagSelect = document.getElementById('stone-location-tag');
    if (tagSelect) {
        tagSelect.addEventListener('change', (e) => {
            updateLocationDetailOptions(e.target.value);
        });
    }
    
    // データ読み込み（最初は石タブ）
    await loadStonesData();
    
    // 保存された採取ポイントを読み込み
    loadSavedLocations();
    
    // モバイルの初期設定
    if (window.innerWidth <= 768) {
        // 初期状態でサイドバーを非表示に
        setTimeout(() => {
            hideSidebar();
        }, 10);
        
        // メインコンテンツクリックでサイドバーを閉じる
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (sidebarVisible) {
                    const sidebar = document.querySelector('.tab-content.active .sidebar');
                    const mainContent = document.querySelector('.tab-content.active .main-content');
                    const isClickInsideSidebar = sidebar && sidebar.contains(e.target);
                    const isClickOnIndicator = e.target.id === 'slide-indicator' || e.target.classList.contains('slide-indicator');
                    const isClickOnMainContent = mainContent && mainContent.contains(e.target);
                    
                    if (isClickOnMainContent && !isClickInsideSidebar && !isClickOnIndicator) {
                        hideSidebar();
                    }
                }
            }, true);
        }, 100);
    }
});

// タブ切り替え
function switchTab(tabName) {
    // タブボタンの状態変更
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// 石の色調合システムを初期化
function initializeColorBlendingSystem() {
    // カラーピッカーとテキストフィールドの連動
    const colorInputs = [
        { picker: 'stone-color-main', hex: 'stone-color-main-hex', ratio: 'stone-color-main-ratio' },
        { picker: 'stone-color-sub1', hex: 'stone-color-sub1-hex', ratio: 'stone-color-sub1-ratio' },
        { picker: 'stone-color-sub2', hex: 'stone-color-sub2-hex', ratio: 'stone-color-sub2-ratio' }
    ];
    
    colorInputs.forEach(input => {
        const picker = document.getElementById(input.picker);
        const hex = document.getElementById(input.hex);
        const ratio = document.getElementById(input.ratio);
        
        if (picker && hex) {
            // カラーピッカー変更時
            picker.addEventListener('input', (e) => {
                hex.value = e.target.value;
                updateBlendedColor();
            });
            
            // HEX入力変更時
            hex.addEventListener('input', (e) => {
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                    picker.value = e.target.value;
                    updateBlendedColor();
                }
            });
        }
        
        if (ratio) {
            // 割合変更時
            ratio.addEventListener('input', (e) => {
                const ratioValue = e.target.nextElementSibling;
                if (ratioValue) {
                    ratioValue.textContent = e.target.value + '%';
                }
                updateBlendedColor();
            });
        }
    });
}

// 色を調合して結果を更新
function updateBlendedColor() {
    const mainColor = document.getElementById('stone-color-main').value;
    const sub1Color = document.getElementById('stone-color-sub1').value;
    const sub2Color = document.getElementById('stone-color-sub2').value;
    
    const mainRatio = parseInt(document.getElementById('stone-color-main-ratio').value) / 100;
    const sub1Ratio = parseInt(document.getElementById('stone-color-sub1-ratio').value) / 100;
    const sub2Ratio = parseInt(document.getElementById('stone-color-sub2-ratio').value) / 100;
    
    // 割合を正規化（合計が100%になるように）
    const totalRatio = mainRatio + sub1Ratio + sub2Ratio;
    const normalizedRatios = {
        main: mainRatio / totalRatio,
        sub1: sub1Ratio / totalRatio,
        sub2: sub2Ratio / totalRatio
    };
    
    // 色を調合
    const blendedColor = blendColors([
        { color: mainColor, ratio: normalizedRatios.main },
        { color: sub1Color, ratio: normalizedRatios.sub1 },
        { color: sub2Color, ratio: normalizedRatios.sub2 }
    ]);
    
    // プレビューと結果を更新
    const preview = document.getElementById('blended-color-preview');
    const hexDisplay = document.getElementById('blended-color-hex');
    
    if (preview) {
        preview.style.background = blendedColor;
    }
    if (hexDisplay) {
        hexDisplay.textContent = blendedColor;
    }
}

// 複数の色を割合に基づいて調合
function blendColors(colors) {
    let r = 0, g = 0, b = 0;
    
    colors.forEach(({ color, ratio }) => {
        const rgb = hexToRgb(color);
        r += rgb.r * ratio;
        g += rgb.g * ratio;
        b += rgb.b * ratio;
    });
    
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    
    return rgbToHex(r, g, b);
}

// HEXをRGBに変換
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGBをHEXに変換
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// 狼煙屋データ読み込み
async function loadNoroshiyaData() {
    try {
        const { data, error } = await supabase
            .from('noroshiya_characters')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        noroshiyaList = data || [];
        displayNoroshiyaList();
        
        // 最初の狼煙屋を選択
        if (noroshiyaList.length > 0) {
            selectNoroshiya(noroshiyaList[0].id);
        }
    } catch (error) {
        console.error('狼煙屋データの読み込みエラー:', error);
        // エラー時はローカルストレージから読み込みを試みる
        const saved = localStorage.getItem('noroshiya-dev-data');
        if (saved) {
            noroshiyaList = JSON.parse(saved);
            displayNoroshiyaList();
        }
    }
}

// 狼煙屋リスト表示
function displayNoroshiyaList() {
    const listEl = document.getElementById('noroshiya-list');
    listEl.innerHTML = '';
    
    noroshiyaList.forEach(noroshiya => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => {
            selectNoroshiya(noroshiya.id);
            // モバイルの場合、狼煙屋を選択したらサイドバーを自動で閉じる
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    hideSidebar();
                }, 100);
            }
        };
        
        if (noroshiya.id === currentNoroshiyaId) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="name">
                <span class="color-dot" style="background-color: ${noroshiya.color_code || '#999'}"></span>
                ${noroshiya.color_name || 'ID: ' + noroshiya.id}の狼煙屋
            </div>
            <div class="details">
                好む石: ${(noroshiya.stone_color_affinities || []).join('、') || '未設定'}
            </div>
        `;
        
        listEl.appendChild(card);
    });
}

// 狼煙屋選択
function selectNoroshiya(id) {
    currentNoroshiyaId = id;
    const noroshiya = noroshiyaList.find(n => n.id === id);
    
    if (!noroshiya) return;
    
    // フォームに値を設定
    document.getElementById('noroshiya-id').value = noroshiya.id;
    document.getElementById('color-name').value = noroshiya.color_name || '';
    document.getElementById('color-code').value = noroshiya.color_code || '#000000';
    document.getElementById('color-picker').value = noroshiya.color_code || '#000000';
    document.getElementById('pattern-type').value = noroshiya.pattern_type || '無地';
    
    // 石の好みのチェックボックス
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
        cb.checked = (noroshiya.stone_color_affinities || []).includes(cb.value);
    });
    
    document.getElementById('affinity-notes').value = noroshiya.affinity_notes || '';
    document.getElementById('personality').value = noroshiya.personality || '';
    document.getElementById('speech-style').value = noroshiya.speech_style || '';
    document.getElementById('favorite-topics').value = (noroshiya.favorite_topics || []).join(', ');
    document.getElementById('emotional-range').value = noroshiya.emotional_range || '';
    
    // セリフ
    const dialogues = noroshiya.dialogues || {};
    document.getElementById('dialogue-first-meet').value = dialogues.hiuchiishi?.['初回出会い時'] || '';
    document.getElementById('dialogue-reunion').value = dialogues.hiuchiishi?.['再会時'] || '';
    document.getElementById('dialogue-send').value = dialogues.chat?.['メッセージ送信時'] || '';
    document.getElementById('dialogue-receive').value = dialogues.chat?.['返信受信時'] || '';
    
    document.getElementById('matching-keywords').value = (noroshiya.matching_keywords || []).join(', ');
    document.getElementById('backstory').value = noroshiya.backstory || '';
    
    // リスト更新
    displayNoroshiyaList();
    
    // メインコンテンツを最上部にスクロール
    const mainContent = document.querySelector('.tab-content.active .main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
    
    // モバイルの場合はサイドバーを隠す
    if (window.innerWidth <= 768) {
        hideSidebar();
    }
}

// 新規狼煙屋追加
function addNewNoroshiya() {
    const newId = 'noroshiya_' + String(noroshiyaList.length + 1).padStart(3, '0');
    const newNoroshiya = {
        id: newId,
        color_name: '',
        color_code: '#000000',
        pattern_type: '無地',
        personality: '',
        speech_style: '',
        favorite_topics: [],
        message_types: [],
        emotional_range: '',
        dialogues: {
            hiuchiishi: {
                '初回出会い時': '',
                '再会時': ''
            },
            chat: {
                'メッセージ送信時': '',
                '返信受信時': ''
            }
        },
        stone_color_affinities: [],
        matching_keywords: [],
        affinity_notes: '',
        backstory: ''
    };
    
    noroshiyaList.push(newNoroshiya);
    displayNoroshiyaList();
    selectNoroshiya(newId);
}

// 狼煙屋保存
async function saveNoroshiya() {
    if (!currentNoroshiyaId) return;
    
    // フォームからデータ取得
    const formData = {
        id: currentNoroshiyaId,
        color_name: document.getElementById('color-name').value,
        color_code: document.getElementById('color-code').value,
        pattern_type: document.getElementById('pattern-type').value,
        personality: document.getElementById('personality').value,
        speech_style: document.getElementById('speech-style').value,
        favorite_topics: document.getElementById('favorite-topics').value.split(',').map(s => s.trim()).filter(s => s),
        emotional_range: document.getElementById('emotional-range').value,
        dialogues: {
            hiuchiishi: {
                '初回出会い時': document.getElementById('dialogue-first-meet').value,
                '再会時': document.getElementById('dialogue-reunion').value
            },
            chat: {
                'メッセージ送信時': document.getElementById('dialogue-send').value,
                '返信受信時': document.getElementById('dialogue-receive').value
            }
        },
        stone_color_affinities: Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked')).map(cb => cb.value),
        matching_keywords: document.getElementById('matching-keywords').value.split(',').map(s => s.trim()).filter(s => s),
        affinity_notes: document.getElementById('affinity-notes').value,
        backstory: document.getElementById('backstory').value
    };
    
    try {
        // Supabaseに保存
        const { error } = await supabase
            .from('noroshiya_characters')
            .upsert(formData);
        
        if (error) throw error;
        
        // ローカルリストも更新
        const index = noroshiyaList.findIndex(n => n.id === currentNoroshiyaId);
        if (index !== -1) {
            noroshiyaList[index] = formData;
        }
        
        // ローカルストレージにも保存
        localStorage.setItem('noroshiya-dev-data', JSON.stringify(noroshiyaList));
        
        displayNoroshiyaList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// キャンセル
function cancelEdit() {
    if (currentNoroshiyaId) {
        selectNoroshiya(currentNoroshiyaId);
    }
}

// 鳥データ読み込み
async function loadBirdsData() {
    try {
        const { data, error } = await supabase
            .from('birds')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        birdsList = data || [];
        displayBirdsList();
        
        if (birdsList.length > 0) {
            selectBird(birdsList[0].id);
        }
    } catch (error) {
        console.error('鳥データの読み込みエラー:', error);
    }
}

// 鳥リスト表示
function displayBirdsList() {
    const listEl = document.getElementById('birds-list');
    listEl.innerHTML = '';
    
    birdsList.forEach(bird => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => {
            selectBird(bird.id);
            // モバイルの場合、鳥を選択したらサイドバーを自動で閉じる
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    hideSidebar();
                }, 100);
            }
        };
        
        if (bird.id === currentBirdId) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="name">${bird.name}</div>
            <div class="details">${bird.size} / ${bird.habitat}</div>
        `;
        
        listEl.appendChild(card);
    });
}

// 鳥選択
function selectBird(id) {
    currentBirdId = id;
    const bird = birdsList.find(b => b.id === id);
    
    if (!bird) return;
    
    document.getElementById('bird-id').value = bird.id;
    document.getElementById('bird-name').value = bird.name || '';
    document.getElementById('bird-scientific-name').value = bird.scientific_name || '';
    document.getElementById('bird-size').value = bird.size || '';
    document.getElementById('bird-habitat').value = bird.habitat || '';
    document.getElementById('bird-characteristics').value = bird.characteristics || '';
    document.getElementById('bird-behavior').value = bird.behavior || '';
    document.getElementById('bird-call').value = bird.call_description || '';
    document.getElementById('bird-symbolism').value = bird.symbolism || '';
    document.getElementById('bird-season').value = bird.season || '';
    document.getElementById('bird-rarity').value = bird.rarity || 'common';
    
    displayBirdsList();
    
    // メインコンテンツを最上部にスクロール
    const mainContent = document.querySelector('.tab-content.active .main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
    
    // モバイルの場合はサイドバーを隠す
    if (window.innerWidth <= 768) {
        hideSidebar();
    }
}

// 新規鳥追加
function addNewBird() {
    const newId = 'bird_' + String(birdsList.length + 1).padStart(3, '0');
    const newBird = {
        id: newId,
        name: '',
        scientific_name: '',
        size: '',
        habitat: '',
        characteristics: '',
        behavior: '',
        call_description: '',
        symbolism: '',
        season: '',
        rarity: 'common'
    };
    
    birdsList.push(newBird);
    displayBirdsList();
    selectBird(newId);
}

// 鳥保存
async function saveBird() {
    if (!currentBirdId) return;
    
    const formData = {
        id: currentBirdId,
        name: document.getElementById('bird-name').value,
        scientific_name: document.getElementById('bird-scientific-name').value,
        size: document.getElementById('bird-size').value,
        habitat: document.getElementById('bird-habitat').value,
        characteristics: document.getElementById('bird-characteristics').value,
        behavior: document.getElementById('bird-behavior').value,
        call_description: document.getElementById('bird-call').value,
        symbolism: document.getElementById('bird-symbolism').value,
        season: document.getElementById('bird-season').value,
        rarity: document.getElementById('bird-rarity').value
    };
    
    try {
        const { error } = await supabase
            .from('birds')
            .upsert(formData);
        
        if (error) throw error;
        
        const index = birdsList.findIndex(b => b.id === currentBirdId);
        if (index !== -1) {
            birdsList[index] = formData;
        }
        
        displayBirdsList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// 石データ読み込み
async function loadStonesData() {
    try {
        const { data, error } = await supabase
            .from('stones')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) throw error;
        
        console.log('読み込んだ石データ:', data);
        
        // 特定の石の詳細を確認（最新のもの）
        if (data && data.length > 0) {
            console.log('最新の石の詳細:', {
                id: data[0].id,
                name: data[0].name,
                prefecture: data[0].prefecture,
                city: data[0].city,
                location_tag: data[0].location_tag,
                location_detail: data[0].location_detail
            });
        }
        
        stonesList = data || [];
        displayStonesList();
        
        if (stonesList.length > 0) {
            selectStone(stonesList[0].id);
        }
    } catch (error) {
        console.error('石データの読み込みエラー:', error);
    }
}

// 石リスト表示
function displayStonesList() {
    const listEl = document.getElementById('stones-list');
    const titleEl = document.getElementById('stones-list-title');
    
    // タイトルを更新（石の数を表示）
    if (titleEl) {
        titleEl.textContent = `石の数：${stonesList.length}コ`;
    }
    
    listEl.innerHTML = '';
    
    stonesList.forEach(stone => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        // 火打石の場合はクラスを追加
        if (stone.is_hiuchiishi) {
            card.classList.add('hiuchiishi');
        }
        
        card.onclick = () => {
            selectStone(stone.id);
            // モバイルの場合、石を選択したらサイドバーを自動で閉じる
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    hideSidebar();
                }, 100);
            }
        };
        
        if (stone.id === currentStoneId) {
            card.classList.add('active');
        }
        
        // サブテキストの構成: 色コード + 都道府県
        let subText = '';
        
        // 色コードを取得（調合色 > プライマリ色の優先順位）
        const colors = stone.colors || {};
        const colorCode = colors.blended || colors.primary || '';
        
        if (colorCode) {
            subText = colorCode;
        }
        
        // 都道府県を追加
        if (stone.prefecture) {
            subText += (subText ? ' / ' : '') + stone.prefecture;
        }
        
        // サブテキストが空の場合のフォールバック
        if (!subText) {
            // 火打石の場合は「火打石」と表示
            if (stone.is_hiuchiishi) {
                subText = '火打石';
            } else if (stone.type) {
                subText = stone.type;
            }
        }
        
        // IDを小さく表示
        const stoneIdDisplay = stone.id ? `<span style="font-size: 10px; color: #999; position: absolute; top: 5px; right: 5px;">${stone.id}</span>` : '';
        
        card.innerHTML = `
            ${stoneIdDisplay}
            ${stone.image_url ? `<img src="${stone.image_url}" alt="${stone.name}" class="item-image">` : ''}
            <div class="name">${stone.name}</div>
            <div class="details">${subText}</div>
        `;
        
        listEl.appendChild(card);
    });
}

// 石選択
function selectStone(id) {
    currentStoneId = id;
    const stone = stonesList.find(s => s.id === id);
    
    if (!stone) return;
    
    const colors = stone.colors || {};
    
    document.getElementById('stone-id').value = stone.id;
    document.getElementById('stone-name').value = stone.name || '';
    document.getElementById('stone-type').value = stone.type || '';
    document.getElementById('stone-hiuchiishi').value = stone.is_hiuchiishi ? 'true' : 'false';
    // カラーピッカーの復元
    if (colors.main) {
        document.getElementById('stone-color-main').value = colors.main;
        document.getElementById('stone-color-main-hex').value = colors.main;
    }
    if (colors.sub1) {
        document.getElementById('stone-color-sub1').value = colors.sub1;
        document.getElementById('stone-color-sub1-hex').value = colors.sub1;
    }
    if (colors.sub2) {
        document.getElementById('stone-color-sub2').value = colors.sub2;
        document.getElementById('stone-color-sub2-hex').value = colors.sub2;
    }
    if (colors.main_ratio !== undefined) {
        document.getElementById('stone-color-main-ratio').value = colors.main_ratio;
        document.querySelector('#stone-color-main-ratio + .ratio-value').textContent = colors.main_ratio + '%';
    }
    if (colors.sub1_ratio !== undefined) {
        document.getElementById('stone-color-sub1-ratio').value = colors.sub1_ratio;
        document.querySelector('#stone-color-sub1-ratio + .ratio-value').textContent = colors.sub1_ratio + '%';
    }
    if (colors.sub2_ratio !== undefined) {
        document.getElementById('stone-color-sub2-ratio').value = colors.sub2_ratio;
        document.querySelector('#stone-color-sub2-ratio + .ratio-value').textContent = colors.sub2_ratio + '%';
    }
    
    // 調合色を更新
    if (colors.blended) {
        document.getElementById('blended-color-preview').style.background = colors.blended;
        document.getElementById('blended-color-hex').textContent = colors.blended;
    } else {
        updateBlendedColor();
    }
    
    // 従来のフィールド（後方互換性）
    document.getElementById('stone-color-primary').value = colors.primary || '';
    document.getElementById('stone-color-secondary').value = colors.secondary || '';
    document.getElementById('stone-pattern').value = colors.pattern || '';
    // 物理的描写フィールドの復元
    document.getElementById('stone-hardness').value = stone.hardness || '';
    
    // 古いフィールドは存在する場合のみ設定
    if (document.getElementById('stone-hardness-feel')) {
        document.getElementById('stone-hardness-feel').value = stone.hardness_feel || 'ふつう';
    }
    if (document.getElementById('stone-weight')) {
        document.getElementById('stone-weight').value = stone.weight || '';
    }
    if (document.getElementById('stone-weight-feel')) {
        document.getElementById('stone-weight-feel').value = stone.weight_feel || 'ふつう';
    }
    if (document.getElementById('stone-size')) {
        document.getElementById('stone-size').value = stone.size || '';
    }
    if (document.getElementById('stone-size-feel')) {
        document.getElementById('stone-size-feel').value = stone.size_feel || 'ふつう';
    }
    
    document.getElementById('stone-texture').value = stone.texture || '';
    document.getElementById('stone-transparency').value = stone.transparency || '不透明';
    document.getElementById('stone-features').value = stone.special_features || '';
    
    // 狼煙屋的見立てフィールド
    if (document.getElementById('stone-noroshiya-interpretation')) {
        document.getElementById('stone-noroshiya-interpretation').value = stone.noroshiya_interpretation || '';
    }
    
    // 拾った日フィールドの復元
    if (document.getElementById('stone-found-date')) {
        document.getElementById('stone-found-date').value = stone.found_date || '';
    }
    
    // 位置情報フィールドの復元
    console.log('選択した石の位置情報:', {
        location_name: stone.location_name,
        prefecture: stone.prefecture,
        city: stone.city,
        location_tag: stone.location_tag,
        location_detail: stone.location_detail
    });
    
    document.getElementById('stone-location-name').value = stone.location_name || '';
    document.getElementById('stone-prefecture').value = stone.prefecture || '';
    
    // 都道府県が設定されている場合は市区町村を更新
    if (stone.prefecture) {
        updateCityOptions(stone.prefecture);
        // 市区町村の値を設定
        setTimeout(() => {
            document.getElementById('stone-city').value = stone.city || '';
        }, 10);
    } else {
        document.getElementById('stone-city').value = '';
    }
    
    document.getElementById('stone-location-tag').value = stone.location_tag || '';
    
    // タグが設定されている場合は詳細場所を更新
    if (stone.location_tag) {
        updateLocationDetailOptions(stone.location_tag);
        // 詳細場所の値を設定
        setTimeout(() => {
            document.getElementById('stone-location-detail').value = stone.location_detail || '';
        }, 10);
    } else {
        document.getElementById('stone-location-detail').value = '';
    }
    
    document.getElementById('stone-location-notes').value = stone.location_notes || '';
    document.getElementById('stone-address').value = stone.address || stone.map_url || '';
    document.getElementById('stone-lat').value = stone.lat || '';
    document.getElementById('stone-lng').value = stone.lng || '';
    
    // 画像プレビューを更新（メインと色選択部分の両方）
    const previewEl = document.getElementById('stone-image-preview');
    const colorPreviewImg = document.getElementById('stone-color-preview-image');
    const noImagePlaceholder = document.querySelector('.no-image-placeholder');
    
    if (stone.image_url) {
        previewEl.innerHTML = `<img src="${stone.image_url}" alt="${stone.name}">`;
        currentStoneImage = stone.image_url;
        
        // カラーピッカー用の画像も更新
        if (colorPreviewImg) {
            colorPreviewImg.src = stone.image_url;
            colorPreviewImg.style.display = 'block';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'none';
        }
        // 抽出ボタンを表示
        const extractBtn = document.getElementById('extract-colors-btn');
        if (extractBtn) {
            extractBtn.style.display = 'block';
        }
    } else {
        previewEl.innerHTML = '<div class="placeholder">画像なし</div>';
        currentStoneImage = null;
        
        // カラーピッカー用の画像も非表示
        if (colorPreviewImg) {
            colorPreviewImg.style.display = 'none';
        }
        if (noImagePlaceholder) {
            noImagePlaceholder.style.display = 'block';
        }
        // 抽出ボタンを非表示
        const extractBtn = document.getElementById('extract-colors-btn');
        if (extractBtn) {
            extractBtn.style.display = 'none';
        }
    }
    
    displayStonesList();
    
    // メインコンテンツを最上部にスクロール
    const mainContent = document.querySelector('.tab-content.active .main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
    
    // モバイルの場合はサイドバーを隠す
    if (window.innerWidth <= 768) {
        hideSidebar();
    }
}

// 新規石追加
function addNewStone() {
    const newId = 'stone_' + String(stonesList.length + 1).padStart(3, '0');
    const newStone = {
        id: newId,
        name: '',
        type: '',
        colors: { primary: '', secondary: '', pattern: '' },
        hardness: null,
        size_range: '',
        texture: '',
        transparency: '不透明',
        special_features: '',
        is_hiuchiishi: true,
        image_url: null,
        found_date: null,
        // 位置情報フィールド
        location_name: '',
        prefecture: '',
        city: '',
        location_tag: '',
        location_detail: '',
        location_notes: '',
        address: '',
        map_url: '',
        lat: null,
        lng: null
    };
    
    // 画像プレビューをクリア
    document.getElementById('stone-image-preview').innerHTML = '<div class="placeholder">画像なし</div>';
    currentStoneImage = null;
    
    stonesList.push(newStone);
    displayStonesList();
    selectStone(newId);
}

// 石保存
async function saveStone() {
    if (!currentStoneId) return;
    
    const formData = {
        id: currentStoneId,
        name: document.getElementById('stone-name').value,
        type: document.getElementById('stone-type').value,
        colors: {
            primary: document.getElementById('stone-color-primary').value,
            secondary: document.getElementById('stone-color-secondary').value || null,
            pattern: document.getElementById('stone-pattern').value || null
        },
        hardness: parseFloat(document.getElementById('stone-hardness').value) || null,
        hardness_feel: document.getElementById('stone-hardness-feel').value,
        weight: parseFloat(document.getElementById('stone-weight').value) || null,
        weight_feel: document.getElementById('stone-weight-feel').value,
        size: parseFloat(document.getElementById('stone-size').value) || null,
        size_feel: document.getElementById('stone-size-feel').value,
        texture: document.getElementById('stone-texture').value,
        transparency: document.getElementById('stone-transparency').value,
        special_features: document.getElementById('stone-features').value,
        noroshiya_interpretation: document.getElementById('stone-noroshiya-interpretation').value,
        found_locations: document.getElementById('stone-locations').value,
        rarity: document.getElementById('stone-rarity').value,
        is_hiuchiishi: document.getElementById('stone-hiuchiishi').value === 'true',
        ng_keywords: document.getElementById('stone-ng-keywords').value.split(',').map(s => s.trim()).filter(s => s)
    };
    
    try {
        const { error } = await supabase
            .from('stones')
            .upsert(formData);
        
        if (error) throw error;
        
        const index = stonesList.findIndex(s => s.id === currentStoneId);
        if (index !== -1) {
            stonesList[index] = formData;
        }
        
        displayStonesList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// キャンセル関数
function cancelBirdEdit() {
    if (currentBirdId) {
        selectBird(currentBirdId);
    }
}

function cancelStoneEdit() {
    if (currentStoneId) {
        selectStone(currentStoneId);
    }
}


// 削除機能
async function deleteNoroshiya() {
    if (!currentNoroshiyaId) return;
    
    const noroshiya = noroshiyaList.find(n => n.id === currentNoroshiyaId);
    if (!noroshiya) return;
    
    if (!confirm(`本当に「${noroshiya.color_name}の狼煙屋」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('noroshiya_characters')
            .delete()
            .eq('id', currentNoroshiyaId);
        
        if (error) throw error;
        
        // リストから削除
        noroshiyaList = noroshiyaList.filter(n => n.id !== currentNoroshiyaId);
        localStorage.setItem('noroshiya-dev-data', JSON.stringify(noroshiyaList));
        
        // 次のアイテムを選択
        if (noroshiyaList.length > 0) {
            selectNoroshiya(noroshiyaList[0].id);
        } else {
            currentNoroshiyaId = null;
            document.getElementById('noroshiya-form').reset();
        }
        
        displayNoroshiyaList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

async function deleteBird() {
    if (!currentBirdId) return;
    
    const bird = birdsList.find(b => b.id === currentBirdId);
    if (!bird) return;
    
    if (!confirm(`本当に「${bird.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('birds')
            .delete()
            .eq('id', currentBirdId);
        
        if (error) throw error;
        
        birdsList = birdsList.filter(b => b.id !== currentBirdId);
        
        if (birdsList.length > 0) {
            selectBird(birdsList[0].id);
        } else {
            currentBirdId = null;
            document.getElementById('bird-form').reset();
        }
        
        displayBirdsList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

async function deleteStone() {
    if (!currentStoneId) return;
    
    const stone = stonesList.find(s => s.id === currentStoneId);
    if (!stone) return;
    
    if (!confirm(`本当に「${stone.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('stones')
            .delete()
            .eq('id', currentStoneId);
        
        if (error) throw error;
        
        stonesList = stonesList.filter(s => s.id !== currentStoneId);
        
        if (stonesList.length > 0) {
            selectStone(stonesList[0].id);
        } else {
            currentStoneId = null;
            document.getElementById('stone-form').reset();
        }
        
        displayStonesList();
        alert('削除しました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

// 画像選択処理
async function handleStoneImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
        alert('画像サイズは5MB以下にしてください。');
        return;
    }
    
    // 画像プレビュー表示
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
    };
    reader.readAsDataURL(file);
}

// 石保存（画像対応版に更新）
async function saveStoneWithImage() {
    if (!currentStoneId) return;
    
    // デバッグ用：保存前の値を確認
    console.log('保存する位置情報:', {
        prefecture: document.getElementById('stone-prefecture').value,
        city: document.getElementById('stone-city').value,
        location_tag: document.getElementById('stone-location-tag').value,
        location_detail: document.getElementById('stone-location-detail').value
    });
    
    const formData = {
        id: currentStoneId,
        name: document.getElementById('stone-name').value,
        type: document.getElementById('stone-type').value,
        colors: {
            // カラーピッカーから取得した色情報
            main: document.getElementById('stone-color-main').value,
            sub1: document.getElementById('stone-color-sub1').value,
            sub2: document.getElementById('stone-color-sub2').value,
            main_ratio: parseInt(document.getElementById('stone-color-main-ratio').value),
            sub1_ratio: parseInt(document.getElementById('stone-color-sub1-ratio').value),
            sub2_ratio: parseInt(document.getElementById('stone-color-sub2-ratio').value),
            blended: document.getElementById('blended-color-hex').textContent,
            // 後方互換性のため従来のフィールドも保持
            primary: document.getElementById('stone-color-primary').value || document.getElementById('blended-color-hex').textContent,
            secondary: document.getElementById('stone-color-secondary').value || null,
            pattern: document.getElementById('stone-pattern').value || null
        },
        hardness: parseFloat(document.getElementById('stone-hardness').value) || null,
        size_range: document.getElementById('stone-size').value,
        texture: document.getElementById('stone-texture').value,
        transparency: document.getElementById('stone-transparency').value,
        special_features: document.getElementById('stone-features').value,
        is_hiuchiishi: document.getElementById('stone-hiuchiishi').value === 'true',
        found_date: document.getElementById('stone-found-date').value || null, // 拾った日
        image_url: currentStoneImage, // 画像データを追加
        // 位置情報フィールド
        location_name: document.getElementById('stone-location-name').value || null,
        prefecture: document.getElementById('stone-prefecture').value || null,
        city: document.getElementById('stone-city').value || null,
        location_tag: document.getElementById('stone-location-tag').value || null,
        location_detail: document.getElementById('stone-location-detail').value || null,
        location_notes: document.getElementById('stone-location-notes').value || null,
        address: document.getElementById('stone-address').value || null,
        map_url: document.getElementById('stone-address').value || null, // addressと同じ値を使用
        lat: document.getElementById('stone-lat').value ? parseFloat(document.getElementById('stone-lat').value) : null,
        lng: document.getElementById('stone-lng').value ? parseFloat(document.getElementById('stone-lng').value) : null
    };
    
    // デバッグ用：保存するデータの詳細を確認
    console.log('保存するデータ:', formData);
    
    try {
        // まず、upsertを実行
        const { error: upsertError } = await supabase
            .from('stones')
            .upsert(formData);
        
        if (upsertError) throw upsertError;
        
        // upsert後、別途selectで全データを取得
        const { data: savedData, error: selectError } = await supabase
            .from('stones')
            .select('*')
            .eq('id', currentStoneId)
            .single();
        
        if (selectError) throw selectError;
        
        console.log('Supabaseから取得したデータ:', savedData);
        
        // 取得したデータで更新
        const index = stonesList.findIndex(s => s.id === currentStoneId);
        if (index !== -1) {
            stonesList[index] = savedData;
        }
        
        displayStonesList();
        alert('保存しました！');
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

// saveStone関数を新しいものに置き換え
window.saveStone = saveStoneWithImage;

// グローバル関数として公開
window.addNewNoroshiya = addNewNoroshiya;
window.addNewBird = addNewBird;
window.addNewStone = addNewStone;
window.selectNoroshiya = selectNoroshiya;
window.selectBird = selectBird;
window.selectStone = selectStone;
window.saveNoroshiya = saveNoroshiya;
window.saveBird = saveBird;
window.saveStone = saveStoneWithImage;
window.cancelEdit = cancelEdit;
window.cancelBirdEdit = cancelBirdEdit;
window.cancelStoneEdit = cancelStoneEdit;
window.deleteNoroshiya = deleteNoroshiya;
window.deleteBird = deleteBird;
window.deleteStone = deleteStone;
window.handleStoneImageSelect = handleStoneImageSelect;

// GoogleマップURLから緯度経度を抽出
function extractLatLngFromUrl(url) {
    if (!url) return;
    
    let lat = null;
    let lng = null;
    
    // パターン1: @緯度,経度,ズームz の形式
    const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match1 = url.match(pattern1);
    if (match1) {
        lat = parseFloat(match1[1]);
        lng = parseFloat(match1[2]);
    }
    
    // パターン2: place/場所名/@緯度,経度,ズームz の形式
    const pattern2 = /place\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match2 = url.match(pattern2);
    if (match2) {
        lat = parseFloat(match2[1]);
        lng = parseFloat(match2[2]);
    }
    
    // パターン3: dir/出発地/目的地/@緯度,経度,ズームz の形式
    const pattern3 = /dir\/[^\/]+\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match3 = url.match(pattern3);
    if (match3) {
        lat = parseFloat(match3[1]);
        lng = parseFloat(match3[2]);
    }
    
    // パターン4: search/検索キーワード/@緯度,経度,ズームz の形式
    const pattern4 = /search\/[^\/]+\/@(-?\d+\.\d+),(-?\d+\.\d+),/;
    const match4 = url.match(pattern4);
    if (match4) {
        lat = parseFloat(match4[1]);
        lng = parseFloat(match4[2]);
    }
    
    // パターン5: !3d緯度!4d経度 の形式（ストリートビューなど）
    const pattern5 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const match5 = url.match(pattern5);
    if (match5) {
        lat = parseFloat(match5[1]);
        lng = parseFloat(match5[2]);
    }
    
    // パターン6: ll=緯度,経度 の形式（古い形式）
    const pattern6 = /ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match6 = url.match(pattern6);
    if (match6) {
        lat = parseFloat(match6[1]);
        lng = parseFloat(match6[2]);
    }
    
    // パターン7: q=緯度,経度 の形式（検索クエリ）
    const pattern7 = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match7 = url.match(pattern7);
    if (match7) {
        lat = parseFloat(match7[1]);
        lng = parseFloat(match7[2]);
    }
    
    // 緯度経度が見つかった場合、フィールドに自動入力
    if (lat !== null && lng !== null) {
        document.getElementById('stone-lat').value = lat;
        document.getElementById('stone-lng').value = lng;
        
        // ユーザーに通知
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
        notification.textContent = `緯度経度を自動抽出しました: ${lat}, ${lng}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

window.extractLatLngFromUrl = extractLatLngFromUrl;

// 都道府県選択時に市区町村を更新
function updateCityOptions(prefecture) {
    const citySelect = document.getElementById('stone-city');
    if (!citySelect) return;
    
    // クリア
    citySelect.innerHTML = '';
    
    if (!prefecture) {
        citySelect.innerHTML = '<option value="">都道府県を先に選択してください</option>';
        return;
    }
    
    // デフォルトオプション
    citySelect.innerHTML = '<option value="">選択してください</option>';
    
    // 選択された都道府県の市区町村を追加
    const cities = cityDataList[prefecture];
    if (cities) {
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

// タグ選択時に詳細な場所を更新
function updateLocationDetailOptions(tag) {
    const detailSelect = document.getElementById('stone-location-detail');
    if (!detailSelect) return;
    
    // クリア
    detailSelect.innerHTML = '';
    
    if (!tag) {
        detailSelect.innerHTML = '<option value="">タグを先に選択してください</option>';
        return;
    }
    
    // デフォルトオプション
    detailSelect.innerHTML = '<option value="">選択してください</option>';
    
    // 選択されたタグの詳細場所を追加
    const details = locationDetailDataList[tag];
    if (details) {
        details.forEach(detail => {
            const option = document.createElement('option');
            option.value = detail;
            option.textContent = detail;
            detailSelect.appendChild(option);
        });
    }
}

window.updateCityOptions = updateCityOptions;
window.updateLocationDetailOptions = updateLocationDetailOptions;

// 採取ポイント管理機能
async function loadSavedLocations() {
    try {
        // Supabaseから採取ポイントを読み込み
        const { data, error } = await supabase
            .from('saved_locations')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        
        savedLocations = data || [];
        
        // セレクトボックスを更新
        updateLocationSelect();
    } catch (error) {
        console.error('採取ポイントの読み込みエラー:', error);
        // エラー時はローカルストレージから読み込みを試みる（後方互換性）
        const saved = localStorage.getItem('twinpeach_saved_locations');
        if (saved) {
            savedLocations = JSON.parse(saved);
            updateLocationSelect();
        }
    }
}

// 採取ポイントセレクトボックスを更新
function updateLocationSelect() {
    const select = document.getElementById('saved-locations');
    if (!select) return;
    
    // 既存のオプションをクリア（最初のオプションは残す）
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // 保存された採取ポイントを追加
    savedLocations.forEach((location) => {
        const option = document.createElement('option');
        option.value = location.id; // Supabaseのidを使用
        option.textContent = `${location.name} (${location.prefecture}${location.city || ''})`;
        select.appendChild(option);
    });
}

// 選択された採取ポイントを読み込み
async function loadSavedLocation() {
    const select = document.getElementById('saved-locations');
    const locationId = select.value;
    
    if (locationId === '') return;
    
    try {
        // Supabaseから特定の採取ポイントを読み込み
        const { data: location, error } = await supabase
            .from('saved_locations')
            .select('*')
            .eq('id', locationId)
            .single();
        
        if (error) throw error;
        if (!location) return;
        
        // フォームに値を設定
        document.getElementById('stone-location-name').value = location.location_name || location.name || '';
        document.getElementById('stone-prefecture').value = location.prefecture || '';
        document.getElementById('stone-city').value = location.city || '';
        document.getElementById('stone-location-tag').value = location.location_tag || '';
        document.getElementById('stone-location-detail').value = location.location_detail || '';
        document.getElementById('stone-location-notes').value = location.location_notes || '';
        document.getElementById('stone-address').value = location.address || location.map_url || '';
        document.getElementById('stone-lat').value = location.lat || '';
        document.getElementById('stone-lng').value = location.lng || '';
        
        // ユーザーに通知
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #9b59b6; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
        notification.textContent = `採取ポイント「${location.name}」を読み込みました`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    } catch (error) {
        console.error('採取ポイントの読み込みエラー:', error);
        alert('採取ポイントの読み込みに失敗しました');
    }
}

// 現在の入力内容を採取ポイントとして保存
async function saveCurrentLocation() {
    const locationName = document.getElementById('stone-location-name').value;
    const prefecture = document.getElementById('stone-prefecture').value;
    
    if (!locationName || !prefecture) {
        alert('場所名と都道府県は必須です');
        return;
    }
    
    // 採取ポイントデータを作成
    const newLocation = {
        name: locationName,
        location_name: locationName,
        prefecture: prefecture,
        city: document.getElementById('stone-city').value || null,
        location_tag: document.getElementById('stone-location-tag').value || null,
        location_detail: document.getElementById('stone-location-detail').value || null,
        location_notes: document.getElementById('stone-location-notes').value || null,
        address: document.getElementById('stone-address').value || null,
        map_url: document.getElementById('stone-address').value || null,
        lat: document.getElementById('stone-lat').value ? parseFloat(document.getElementById('stone-lat').value) : null,
        lng: document.getElementById('stone-lng').value ? parseFloat(document.getElementById('stone-lng').value) : null
    };
    
    try {
        // 重複チェック
        const { data: existingLocations, error: checkError } = await supabase
            .from('saved_locations')
            .select('*')
            .eq('name', newLocation.name)
            .eq('prefecture', newLocation.prefecture)
            .eq('city', newLocation.city || '');
        
        if (checkError) throw checkError;
        
        if (existingLocations && existingLocations.length > 0) {
            if (!confirm('同じ名前の採取ポイントが既に存在します。上書きしますか？')) {
                return;
            }
            
            // 既存の場所を更新
            const { error: updateError } = await supabase
                .from('saved_locations')
                .update(newLocation)
                .eq('id', existingLocations[0].id);
            
            if (updateError) throw updateError;
        } else {
            // 新規追加
            const { error: insertError } = await supabase
                .from('saved_locations')
                .insert([newLocation]);
            
            if (insertError) throw insertError;
        }
        
        // 採取ポイントリストを再読み込み
        await loadSavedLocations();
        
        // ユーザーに通知
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
        notification.textContent = `採取ポイント「${locationName}」を保存しました`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // ローカルストレージにもバックアップ保存（オフライン対応）
        localStorage.setItem('twinpeach_saved_locations', JSON.stringify(savedLocations));
        
    } catch (error) {
        console.error('採取ポイントの保存エラー:', error);
        alert('採取ポイントの保存に失敗しました: ' + error.message);
    }
}

// グローバル関数として公開
window.loadSavedLocation = loadSavedLocation;
window.saveCurrentLocation = saveCurrentLocation;

// 画像から色を抽出する関数
async function extractColorsFromImage() {
    const img = document.getElementById('stone-color-preview-image');
    if (!img || !img.src || img.style.display === 'none') {
        alert('画像を選択してください');
        return;
    }
    
    try {
        // Color Thiefのインスタンスを作成
        const colorThief = new ColorThief();
        
        // 画像が読み込まれていることを確認
        if (img.complete) {
            extractColors(img);
        } else {
            img.addEventListener('load', function() {
                extractColors(img);
            });
        }
    } catch (error) {
        console.error('色の抽出エラー:', error);
        alert('色の抽出に失敗しました');
    }
}

// 実際の色抽出処理
function extractColors(img) {
    const colorThief = new ColorThief();
    
    // パレット（3色）を取得
    const palette = colorThief.getPalette(img, 3);
    
    if (palette && palette.length >= 3) {
        // RGB値を16進数に変換
        const colors = palette.map(rgb => rgbToHex(rgb[0], rgb[1], rgb[2]));
        
        // 各色の明度を計算して、最も暗い色をメインに
        const colorsWithBrightness = colors.map((color, index) => {
            const rgb = palette[index];
            const brightness = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
            return { color, brightness, rgb };
        });
        
        // 明度でソート（暗い順）
        colorsWithBrightness.sort((a, b) => a.brightness - b.brightness);
        
        // 色をスライダーに設定
        // メインカラー（最も暗い色）
        document.getElementById('stone-color-main').value = colorsWithBrightness[0].color;
        document.getElementById('stone-color-main-hex').value = colorsWithBrightness[0].color;
        document.getElementById('stone-color-main-ratio').value = 50;
        document.getElementById('stone-color-main-ratio').nextElementSibling.textContent = '50%';
        
        // サブカラー1（中間の色）
        document.getElementById('stone-color-sub1').value = colorsWithBrightness[1].color;
        document.getElementById('stone-color-sub1-hex').value = colorsWithBrightness[1].color;
        document.getElementById('stone-color-sub1-ratio').value = 35;
        document.getElementById('stone-color-sub1-ratio').nextElementSibling.textContent = '35%';
        
        // サブカラー2（最も明るい色）
        document.getElementById('stone-color-sub2').value = colorsWithBrightness[2].color;
        document.getElementById('stone-color-sub2-hex').value = colorsWithBrightness[2].color;
        document.getElementById('stone-color-sub2-ratio').value = 15;
        document.getElementById('stone-color-sub2-ratio').nextElementSibling.textContent = '15%';
        
        // 調合色を更新
        updateBlendedColor();
        
        // 成功メッセージ
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
        notification.textContent = '色を抽出しました';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// RGB値を16進数に変換
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// グローバル関数として公開
window.extractColorsFromImage = extractColorsFromImage;

// スライドパネル機能（シンプル版）
let sidebarVisible = true;
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;

// スライドパネルの表示/非表示
function toggleSidebar() {
    if (sidebarVisible) {
        hideSidebar();
    } else {
        showSidebar();
    }
}

// サイドバーを表示
function showSidebar() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) {
        console.error('Active tab not found');
        return;
    }
    
    const sidebar = activeTab.querySelector('.sidebar');
    const container = activeTab.querySelector('.container');
    const indicator = document.getElementById('slide-indicator');
    
    if (!sidebar || !container) {
        console.error('Sidebar or container not found');
        return;
    }
    
    // 強制的にスタイルを適用
    sidebar.classList.remove('hidden');
    sidebar.style.transform = 'translateX(0)';
    container.classList.remove('sidebar-hidden');
    if (indicator) indicator.classList.add('hidden');
    sidebarVisible = true;
}

// サイドバーを非表示
function hideSidebar() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const sidebar = activeTab.querySelector('.sidebar');
    const container = activeTab.querySelector('.container');
    const indicator = document.getElementById('slide-indicator');
    
    if (!sidebar || !container) return;
    
    sidebar.classList.add('hidden');
    sidebar.style.transform = '';  // スタイルをリセット
    container.classList.add('sidebar-hidden');
    if (indicator) indicator.classList.remove('hidden');
    sidebarVisible = false;
}

// グローバル関数として公開
window.toggleSidebar = toggleSidebar;
window.showSidebar = showSidebar;
window.hideSidebar = hideSidebar;

// モバイルスワイプ機能の初期化（削除）
// スワイプ機能は使用しない

// タッチハンドラは削除（スワイプ機能を使用しない）

// タブ切り替え時にサイドバーの状態をリセット
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    originalSwitchTab(tabName);
    
    // モバイルの場合、新しいタブのサイドバーを表示
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab) {
                const sidebar = activeTab.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('hidden');
                    sidebarVisible = true;
                }
            }
        }, 100);
    }
};