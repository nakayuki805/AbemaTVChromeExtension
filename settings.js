var settingsList = [
    {
        "name": "isResizeScreen",
        "description": "ウィンドウサイズに合わせて映像の端が切れないようにリサイズ(コメ欄開いた時映像の大きさは変わらずコメ欄にかぶります。)",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isDblFullscreen",
        "description": "<s>ダブルクリックで全画面表示に切り替え＆全画面ボタンをF11相当のフルスクリーンに割り当て(コメント欄を表示したまま全画面にできます。)</s>※現在うまくフルスクリーン表示できません。かわりにF11キーを使用してください>",
        "instantDescription": "ダブルクリックで全画面表示に切り替え　※プレーヤーの全画面ボタンの割り当てには反映されません※現在不具合があります",
        "type": "boolean",
        "isInstantChangable": true
    },
//    {
//        "name": "isEnterSubmit",
//        "description": "エンターでコメント送信",
//        "type": "boolean",
//        "isInstantChangable": true
//    },
    {
        "name": "isHideOldComment",
        "description": "コメント欄のスクロールバーを非表示にする",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isMovingComment",
        "description": "新着コメントをあの動画サイトのように横に流す",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "movingCommentSecond",
        "description": "↑のコメントの速さ(コメントが画面を流れる秒数)",
        "type": "number",
        "isInstantChangable": true
    },
    {
        "name": "movingCommentLimit",
        "description": "↑のコメントの同時表示上限",
        "type": "number",
        "isInstantChangable": true
    },
    {
        "name": "isMoveByCSS",
        "description": "コメントをCSSのtransitionで流す(速度も変更できます。コメント流しが重い場合、これで軽減するかもしれません。)",
        "type": "boolean",
//        "isInstantChangable": false
        "isInstantChangable": true
    },
    {
        "name": "isComeNg",
        "description": "流れるコメントから規定の単語を除去(顔文字,連続する単語など)",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isComeDel",
        "description": "以下で設定した単語が含まれるコメントは流さない(1行1つ、/正規表現/、//コメント)",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "fullNg",
        "description": "",
        "type": "textarea",
        "isInstantChangable": true
    },
    {
        "name": "isInpWinBottom",
//        "description": "コメント入力欄の位置を下へ・コメント一覧を逆順・下へスクロール(コメ欄を常に表示しているときのみ)",
//        "description": "コメント入力欄の位置を下へ(コメント一覧の逆順・スクロール機能は一時廃止)",
//        "description": "コメント入力欄と番組残り時間を下へ(コメント一覧は逆順・下スクロール)",
        "description": "コメント入力欄を下へ(コメント一覧は逆順・下スクロール)",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isCustomPostWin",
//        "description": "投稿ボタン削除・入力欄1行化",
        "description": "投稿ボタン等を非表示",
        "type": "boolean",
//        "isInstantChangable": false
        "isInstantChangable": true
    },
    {
        "name": "isCancelWheel",
        "description": "マウスホイールによる番組移動を禁止する",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isVolumeWheel",
        "description": "マウスホイールによる番組移動を音量操作へ変更する",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "changeMaxVolume",
        "description": "音量が最大(100)の場合は以下へ自動変更する",
        "type": "number",
        "isInstantChangable": true
    },
    {
        "name": "isTimeVisible",
//        "description": "コメント入力欄の近くに番組残り時間を表示",
//        "description": "画面右上に番組残り時間を表示",
        "description": "番組残り時間を表示",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isSureReadComment",
        "description": "常にコメント欄を表示する",
        "type": "boolean",
//        "isInstantChangable": false
        "isInstantChangable": true
    },
    {
        "name": "sureReadRefreshx",
//        "description": "読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(再度開く時に100以降の古いコメントが破棄される)",
//        "description": "常にコメント欄を表示する場合で、読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(再度開く時に100以降の古いコメントが破棄される)",
        "description": "常にコメント欄を表示する場合で、読込済コメント数がx(101以上)を超えた時にコメ欄を閉じる(直ちに開き直され、100以前の古いコメントが破棄されることで動作が軽くなります)",
        "type": "number",
        "isInstantChangable": true
    },
    {
        "name": "isAlwaysShowPanel",
        "description": "常に黒帯パネルを表示する",
        "type": "boolean",
//        "isInstantChangable": false
        "isInstantChangable": true
    },
    {
//        "name": "isMovieResize",
        "name": "isMovieMaximize",
//        "description": "映像を枠に合わせて縮小する",
//        "description": "映像の横長さを最大に固定する",
        "description": "映像の縦横長さを最大で固定する",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isCommentPadZero",
        "description": "コメントの縦の隙間を詰める",
        "type": "boolean",
        "isInstantChangable": true
    },
    {
        "name": "isCommentTBorder",
        "description": "コメントの区切り線を付ける",
        "type": "boolean",
        "isInstantChangable": true
    }
    ];
var ComeColorSettingList = [
    {
        "name": "commentBackColor",
        "description": "コメント一覧の背景色(黒0～灰～255白)",
        "type": "range",
        "isInstantChangable": true
    },
    {
        "name": "commentBackTrans",
        "description": "コメント一覧の背景の透明度(完全透明0～255不透明)",
        "type": "range",
        "isInstantChangable": true
    },
    {
        "name": "commentTextColor",
        "description": "コメントの文字色(黒0～灰～255白)",
        "type": "range",
        "isInstantChangable": true
    },
    {
        "name": "commentTextTrans",
        "description": "コメントの文字の透明度(完全透明0～255不透明)",
        "type": "range",
        "isInstantChangable": true
    }
    ];
var RadioSettingList = [
    {
        "name": "timePosition",
        "list":[
            ["windowtop","ウィンドウの右上（常時表示）"],
            ["windowbottom","ウィンドウの右下（常時表示）"],
            ["commentinputtop","コメント入力の右上"],
            ["commentinputbottom","コメント入力の右下"],
            ["header","右上のメニューの上"],
            ["footer","右下のコメント数の下"]
        ]
    }
    ];
var CMSettingList = [
        {
            "name": "isCMBlack",
            "description": "コメント数が表示されないとき画面真っ黒",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isCMBkTrans",
            "description": "↑を下半分だけ少し透かす",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isCMsoundoff",
            "description": "コメント数が表示されないとき音量ミュート",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "CMsmall",
//            "description": "コメント数が表示されないとき映像部分を1/xに縮小する",
            "description": "コメント数が表示されないとき映像部分を100%(縮小なし)～5%に縮小する",
            "type": "number",
            "isInstantChangable": true
        }
    ];
function getSettings(callback) {
    var res = {};
    
}
function generateOptionInput(settingsArr, isPermanent) {
    var inputHTML = "";
    var i = 0;
    var disabled;
    var description;
    var isNotChangable;
    var NCTEXT="　※この設定はここで変更不可";
    for (i = 0; i < settingsArr.length; i += 1) {
        description = (!isPermanent && settingsArr[i].instantDescription) ? settingsArr[i].instantDescription : settingsArr[i].description;
        isNotChangable = !isPermanent && !settingsArr[i].isInstantChangable;
        disabled = isNotChangable ? " disabled" : "";
        if (settingsArr[i].type === "boolean") {
            inputHTML += '<input type="checkbox" id="' + settingsArr[i].name + '" ' + disabled + '>:' + description;
            inputHTML += isNotChangable ? NCTEXT : "";
            inputHTML += "<br/>"
        } else {
            if (settingsArr[i].type === "number") {
                inputHTML += description;
                inputHTML += isNotChangable ? NCTEXT : "" + ":";
                inputHTML += '<input type="number" id="' + settingsArr[i].name + '" ' + disabled + '>';
                inputHTML += "<br/>"
            } else if (settingsArr[i].type === "textarea") {
                inputHTML += description;
                inputHTML += isNotChangable ? NCTEXT : "" + ":";
                inputHTML += '<textarea id="' + settingsArr[i].name + '" rows=3 cols=40 wrap=off ' + disabled + '></textarea>';
                inputHTML += "<br/>"
            } else if (settingsArr[i].type === "range") {
                inputHTML += '<div><span class="desc">'+description;
                inputHTML += isNotChangable ? NCTEXT : "" + "</span>:";
                inputHTML += '<span class="prop">-</span>';
                inputHTML += '<input type="range" id="' + settingsArr[i].name + '" max=255 ' + disabled + '></div>';
            }
        }
    }
    return inputHTML;
}
function generateRadioInput(settingsArr){
    var inputHTML="";
    for(i=0;i<settingsArr.length;i++){
        inputHTML+='<div id="i'+settingsArr[i].name+'">';
        for(j=0;j<settingsArr[i].list.length;j++){
            inputHTML+='<div>';
            inputHTML+='<input type="radio" name="'+settingsArr[i].name+'" value="'+settingsArr[i].list[j][0]+'">';
            inputHTML+=settingsArr[i].list[j][1];
            inputHTML+='</div>';
        }
        inputHTML+='</div>';
    }
    return inputHTML;
}
function generateOptionHTML(isPermanent) {
    var htmlstr = generateOptionInput(settingsList, isPermanent);
    htmlstr += '<div id="CommentColorSettings">' + generateOptionInput(ComeColorSettingList, isPermanent) + '</div>';
    htmlstr += '<div id="CommentMukouSettings">' + generateOptionInput(CMSettingList, isPermanent) + '</div>';
    htmlstr += generateRadioInput(RadioSettingList);
    return htmlstr;
}
