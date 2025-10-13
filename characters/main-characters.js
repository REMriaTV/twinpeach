// 桃次郎プロジェクトの全キャラクターデータ構造

const characterGroups = {
    main: {
        name: "主要キャラクター",
        description: "桃次郎の物語の中心となるキャラクターたち",
        theme: "theme-main",
        characters: [
            {
                id: 'momo-jiro',
                name: "桃次郎",
                type: "主人公",
                description: "桃太郎の影に隠れた、もう一人の桃から生まれた青年",
                details: {
                    appearance: "桃太郎に似ているが、どこか儚げな雰囲気を持つ青年",
                    personality: "内省的で思慮深い、影の存在として生きることを選んだ",
                    background: "同じ桃から生まれたが、桃太郎の陰に隠れて生きてきた",
                    specialAbility: "影を操る能力、人の心の闇を理解する力"
                }
            },
            {
                id: 'momo-taro',
                name: "桃太郎",
                type: "英雄",
                description: "誰もが知る鬼退治の英雄、桃次郎の双子の兄弟",
                details: {
                    appearance: "凛々しく勇ましい姿、常に自信に満ちている",
                    personality: "勇敢で正義感が強い、リーダーシップに優れる",
                    background: "桃から生まれ、鬼ヶ島で鬼を退治した英雄",
                    specialAbility: "超人的な身体能力、カリスマ性"
                }
            }
        ]
    },
    noroshiya: {
        name: "狼煙屋（ノロシヤ）",
        description: "煙を使って時空を超えてメッセージを届ける、不思議な鳥たち",
        theme: "theme-noroshiya",
        characters: [] // 既存の狼煙屋データを使用
    },
    oni: {
        name: "鬼族",
        description: "鬼ヶ島に住む鬼たち、実は彼らにも事情がある",
        theme: "theme-oni",
        characters: [
            {
                id: 'oni-boss',
                name: "鬼大将",
                type: "鬼族の長",
                description: "鬼ヶ島を統べる大鬼、桃太郎に敗れた後の物語",
                details: {
                    appearance: "巨大な体躯、赤い肌と鋭い角",
                    personality: "威厳があるが、実は部下思いの優しい一面も",
                    background: "桃太郎との戦いの後、平和的な道を模索している",
                    specialAbility: "雷を操る力、強大な腕力"
                }
            }
        ]
    },
    villager: {
        name: "村人たち",
        description: "桃次郎と桃太郎が育った村の人々",
        theme: "theme-villager",
        characters: [
            {
                id: 'grandpa',
                name: "おじいさん",
                type: "育ての親",
                description: "桃太郎と桃次郎を育てた心優しい老人",
                details: {
                    appearance: "白髪で温和な表情、いつも笑顔",
                    personality: "優しく寛容、二人の息子を分け隔てなく愛する",
                    background: "山で柴刈りをしていた時に桃次郎たちと出会った",
                    specialAbility: "誰よりも早く山の変化に気づく観察眼"
                }
            },
            {
                id: 'grandma',
                name: "おばあさん",
                type: "育ての親",
                description: "川で桃を拾った、物語の始まりの人",
                details: {
                    appearance: "小柄で品のある老婦人",
                    personality: "聡明で直感力に優れる、秘密を見抜く力がある",
                    background: "川で洗濯をしていた時に大きな桃を見つけた",
                    specialAbility: "不思議な出来事を受け入れる包容力"
                }
            }
        ]
    }
};

// キャラクターグループを表示する関数
function displayCharacterGroups() {
    const container = document.querySelector('.container');
    
    // 既存のコンテンツをクリア（タイトル以外）
    const title = container.querySelector('h1');
    container.innerHTML = '';
    container.appendChild(title);
    
    // 各グループを表示
    Object.entries(characterGroups).forEach(([key, group]) => {
        if (key === 'noroshiya') {
            // 狼煙屋は既存のデータを使用
            const groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.innerHTML = `
                <h2 class="group-title">${group.name}</h2>
                <p class="group-description">${group.description}</p>
            `;
            container.appendChild(groupHeader);
            
            const grid = document.createElement('div');
            grid.className = 'character-grid';
            grid.id = 'characterGrid';
            container.appendChild(grid);
            
            // 既存の狼煙屋表示関数を呼び出し
            displayCharacters();
        } else {
            // 他のグループは後で実装
            // プレースホルダーとして表示
            const groupSection = document.createElement('div');
            groupSection.className = `character-group ${group.theme}`;
            groupSection.innerHTML = `
                <div class="group-header">
                    <h2 class="group-title">${group.name}</h2>
                    <p class="group-description">${group.description}</p>
                </div>
                <div class="character-grid">
                    ${group.characters.map(char => `
                        <div class="character-card" style="opacity: 0.5; cursor: not-allowed;">
                            <div class="character-name">${char.name}</div>
                            <div class="character-type">${char.type}</div>
                            <div class="character-description">${char.description}</div>
                            <div style="margin-top: 1rem; font-size: 0.8rem; color: #888;">
                                (準備中)
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(groupSection);
        }
    });
    
    // 最後に「新しいキャラクターを追加」ボタンを追加
    const addButton = document.createElement('button');
    addButton.className = 'add-character';
    addButton.textContent = '新しいキャラクターを追加';
    addButton.onclick = addNewCharacter;
    container.appendChild(addButton);
}