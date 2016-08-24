// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var settingsList = [
    {
        "description" : "映像・表示・操作関連設定",
        "settings": [
            {
                "name": "isResizeScreen",
                //        "description": "ウィンドウサイズに合わせて映像の端が切れないようにリサイズ(コメ欄開いた時映像の大きさは変わらずコメ欄にかぶります。)",
                "description": "映像をウィンドウに合わせてリサイズ、映像の位置を上に詰める (映像がウィンドウ外にはみ出なくなり、コメ欄などを開いても映像の大きさは変わらず映像の上に重なります。)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isResizeSpacing",
                "description": "↑で映像の上側の余白をメニュー分だけ空ける",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                //        "name": "isMovieResize",
                "name": "isMovieMaximize",
                //        "description": "映像を枠に合わせて縮小する",
                //        "description": "映像の横長さを最大に固定する",
                //        "description": "映像の縦横長さを最大で固定する",
                "description": "映像をウィンドウに合わせてリサイズ、映像の位置は画面中央 (〃)",
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
            {
                "name": "isCancelWheel",
                //        "description": "マウスホイールによる番組移動を禁止する",
                "description": "マウスホイール及び上下矢印キーによる番組移動を無効化する",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isVolumeWheel",
                //        "description": "マウスホイールによる番組移動を音量操作へ変更する",
                "description": "マウスホイールで音量を操作する（&番組移動無効化）",
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
                "name": "isHideButtons",
                "description": "全画面ボタンと音量ボタンを非表示",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isAlwaysShowPanel",
                "description": "常に黒帯パネルを表示する※下の黒帯パネル開閉設定で設定",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isOpenPanelwCome",
                "description": "コメント欄を開いていても黒帯パネル等を表示できるようにする※下の黒帯パネル開閉設定で設定",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isHideTwitterPanel",
                "description": "パネル「twitterで通知を受け取る」を非表示",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isHideTodayHighlight",
                "description": "右上の「今日のみどころ」を放送中画面で非表示(このオプションはトップページには効きません)",
                "type": "boolean",
                "isInstantChangable": true
            }
        ]
    },
    {
        "description": "コメント欄関連設定",
        "settings": [
            {
                "name": "isHideOldComment",
                "description": "コメント欄のスクロールバーを非表示にする",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isInpWinBottom",
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
                "name": "isSureReadComment",
                //        "description": "常にコメント欄を表示する",
                "description": "常にコメント欄を開こうとする(開閉が制限されている時は開けません)(設定時に右下のコメント数クリックで入力欄を残してコメント欄を閉じれます)",
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
            },
            {
                "name": "isCommentWide",
                "description": "コメントを横にほんの少し広げる",
                "type": "boolean",
                "isInstantChangable": true
//            },
//            {
//                "name": "isHighlightNewCome",
//                "description": "新着コメントを少し目立たせる",
//                "type": "boolean",
//                "isInstantChangable": true
            },
            {
                "name": "isComelistNG",
//                "description": "NG設定を右コメント一覧にも適用する(流れるコメント用のNG設定がそのまま一覧にも適用されます。ただし、一覧のコメント表示数は直近100件まで、投稿時刻は新着のみ表示となります。)",
                "description": "NG設定を右コメント一覧にも適用する(流れるコメント用のNG設定がそのまま一覧にも適用されます。ただし、一覧のコメント表示数は直近100件まで<s>、投稿時刻は新着のみ表示</s>となります。)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isDelOldTime",
                "description": "↑で各コメントの投稿時刻の表示を新着のみとし、古いコメントの投稿時刻は非表示にする。",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isComelistClickNG",
//                "description": "コメント一覧クリックでNG追加欄を表示(このNG追加欄による保存は一時的です。永久保存は設定画面へ。)",
                "description": "コメント一覧クリックでNG追加欄を表示(NGボタン1回クリックで一時保存(黄色)、短時間で2回クリックすると永久保存(赤色)になります。)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isComeClickNGautoClose",
                "description": "↑でNG登録後、自動的にNG追加欄を閉じる",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "highlightComePower",
                "description": "新着コメント強調の強度",
                "type": "number",
                "isInstantChangable": true
            }
        ]
    },
    {
        "description": "コメント流し関連設定",
        "settings": [
            {
                "name": "isMovingComment",
                "description": "新着コメントをあの動画サイトのように横に流す(コメント欄を開いているときのみ有効、コメント欄関連設定の「常にコメント欄を開こうとする」を同時に有効にすると常にコメントが流れるのでおすすめです。)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "movingCommentSecond",
                "description": "↑のコメントの速さ(コメントが画面を流れる秒数、小さいほど速い)",
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
                "name": "isComeNg",
                "description": "流れるコメントから規定の単語を除去(顔文字,連続する単語など)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isDeleteStrangeCaps",
                "description": "↑に加えて、一般的な文字以外を全て削除する(英数字や漢字、ひらがな、一部の記号などは削除されません)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isComeDel",
                "description": "以下で設定した単語が含まれるコメントは流さない(1行1つ、/正規表現/も可、//コメント)(<s>流れるコメントにのみ有効、右のコメ欄には反映されません</s> 上の設定で適用可能になりました。コメント欄関連設定の「NG設定をコメント一覧にも適用する」を有効にしてください)",
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
                "name": "isShareNGword",
                "description": "<a href='https://abema.nakayuki.net/ngshare/' target='_blank'>共有NGワード</a>を有効にする(現在実験的)",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "kakikomiwait",
                "description": "自分のコメントを流すまでの待ち時間(秒)マイナスだと流れない",
                "type": "number",
                "isInstantChangable": true
            },
            {
                "name": "comeMovingAreaTrim",
                "description": "コメントを流す領域の横幅を、ウィンドウ全体でなく映像の横幅に合わせる",
                "type": "boolean",
                "isInstantChangable": true
            }
        ]
    },
    {
        "description": "番組時間・タイトル表示関連設定",
        "settings": [
            {
                "name": "isTimeVisible",
                //        "description": "コメント入力欄の近くに番組残り時間を表示",
                //        "description": "画面右上に番組残り時間を表示",
                "description": "番組残り時間を表示",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isProtitleVisible",
                "description": "番組タイトルを表示",
                "type": "boolean",
                "isInstantChangable": true
            },
            {
                "name": "isProTextLarge",
                "description": "番組残り時間・タイトルの文字を大きくする",
                "type": "boolean",
                "isInstantChangable": true
            }
        ]
    },
    {
        "description": "番組通知関連設定",
        "settings": [
            {
                "name": "notifySeconds",
                "description": "番組通知を番組開始の何秒前にするか(番組表の番組ページから番組開始前の通知を設定できます。)",
                "type": "number",
                "isInstantChangable": true
            },
            {
                "name": "isNotifyAndOpen",
                "description": "番組通知時に自動で新しいタブで放送画面を開く",
                "type": "boolean",
                "isInstantChangable": false
            },
            {
                "name": "isNaOinActive",
                "description": "↑既に開いている放送画面があれば新しいタブを開かずそのタブを切り替える(アクティブなタブ優先)",
                "type": "boolean",
                "isInstantChangable": false
            }
        ]
    },
    {
        "description": "番組表関連設定",
        "settings": [
            {
                "name": "isChTimetableExpand",
                "description": "チャンネル別番組表ページにて、番組タイトルの末尾が隠れないように枠を縦に広げる (各時刻の縦の長さが一定でなくバラバラになります)",
                "type": "boolean",
                "isInstantChangable": false
            },{
                "name": "isChTimetableBreak",
                "description": "チャンネル別番組表ページにて、番組タイトルの改行位置を変更する (2桁の話数が改行よって数字1字ずつに分かれたりするのを防止)",
                "type": "boolean",
                "isInstantChangable": false
            },{
                "name": "isChTimetableWeekend",
                "description": "チャンネル別番組表ページにて、土曜を青、日曜を赤に着色する",
                "type": "boolean",
                "isInstantChangable": false
            },{
                "name": "isChTimetablePlaybutton",
                "description": "各番組表ページに、放送中画面への直接リンクを設置する (丸型の再生ボタンの場合、番組詳細画面が一瞬だけ表示されます)",
                "type": "boolean",
                "isInstantChangable": false
            }
        ]
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
            [["windowtop","ウィンドウの右上（常時表示）"]],
            [["windowbottom","ウィンドウの右下（常時表示）"]],
            [["commentinputtop","コメント入力の右上"]],
            [["commentinputbottom","コメント入力の右下"]],
            [["header","右上のメニューの上"]],
            [["footer","右下のコメント数の下"]]
        ]
    },
    {
        "name": "protitlePosition",
        "list":[
            [
                ["windowtopleft","ウィンドウの左上（常時表示）"],
                ["windowtopright","ウィンドウの右上（常時表示）"]
            ],[
                ["windowbottomleft","ウィンドウの左下（常時表示）"],
                ["windowbottomright","ウィンドウの右下（常時表示）"]
            ],[
                ["commentinputtopleft","コメント入力の左上"],
                ["commentinputtopright","コメント入力の右上"]
            ],[
                ["commentinputbottomleft","コメント入力の左下"],
                ["commentinputbottomright","コメント入力の右下"]
            ],[
                ["headerleft","左上のアイコンの上"],
                ["headerright","右上のメニューの上"]
            ],[
                ["footerleft","左下のアイコンの下"],
                ["footerright","右下のコメント数の下"]
            ]
        ]
    },{
        "name": "proSamePosition",
        "list":[[
                ["over","重ねる"],
                ["vertical","縦"],
                ["horizontal","横(コメ欄周辺で無効)"],
                ["horizshort","タイトルを少し左へ"]
            ]]
    },{
        "name": "panelopenset",
        "list":[[["111000000000","デフォルト"],["222222222222","常に表示"],["333333333333","カスタム"]]]
    },{
        "name": "highlightNewCome",
        "list":[[
                [0,"なし"],
                [1,"先頭マーク"],
                [2,"背景着色"],
                [3,"両方"]
        ]]
    },{
        "name": "highlightComeColor",
        "list":[[
                [0,"黄"],
                [1,"橙"],
                [2,"赤"],
                [3,"桃"],
                [4,"紫"],
                [5,"青"],
                [6,"水"],
                [7,"緑"],
                [8,"白"],
                [9,"黒"]
        ]]
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
            "name": "isCMBkR",
            "description": "↑を映像クリックで解除・再適用する",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isCMsoundoff",
//            "description": "コメント数が表示されないとき音量ミュート",
            "description": "コメント数が表示されないときプレイヤーの音量ミュート",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isTabSoundplay",
            "description": "↑をプレイヤーでなくchromeタブ設定でミュートにする",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isCMsoundR",
            "description": "↑を映像クリックで解除・再適用する",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "CMsmall",
//            "description": "コメント数が表示されないとき映像部分を1/xに縮小する",
            "description": "コメント数が表示されないとき映像部分を100%(縮小なし)～5%に縮小する",
            "type": "number",
            "isInstantChangable": true
        },
        {
            "name": "isCMsmlR",
            "description": "↑を映像クリックで解除・再適用する",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "beforeCMWait",
            "description": "コメント数が表示されなくなってから↑実行までの待機時間",
            "type": "number",
            "isInstantChangable": true
        },
        {
            "name": "afterCMWait",
            "description": "コメント数が表示されてから↑解除までの待機時間",
            "type": "number",
            "isInstantChangable": true
        },
        {
            "name": "isManualKeyCtrlR",
            "description": "↑の待機中、右ctrlを押している間は実行しない（離すと即実行）",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isManualKeyCtrlL",
            "description": "↑の待機中、左ctrlを押している間は実行しない（離すと即実行）",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isManualMouseBR",
            "description": "↑の待機中、画面右下のコメ数表示部に1.2秒以上連続でカーソルを合わせている間は実行しない（カーソルを外すと即実行）",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "useEyecatch",
            "description": "左上ロゴのタイミングに合わせる",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isHidePopTL",
            "description": "左上に出てくるロゴを非表示",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isHidePopBL",
            "description": "左下に出てくる通知を非表示",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isHidePopFresh",
            "description": "左下に出てくるFresh告知を非表示",
            "type": "boolean",
            "isInstantChangable": true
        }
    ];

/*var channelList = {
    "abema-news": "AbemaNews",
    "abema-special": "Abema SPECIAL",
    "special-plus": "SPECIAL PLUS",
    "drama": "ドラマ"
}*/
function removeIs(str) {
    var afteris = str.indexOf("is")==0?str.slice(2):str;
    var firtsLetter = afteris.substr(0,2)=="CM"?"C":afteris.substr(0,1).toLocaleLowerCase();
    return firtsLetter + afteris.slice(1);
}
function getSettings(callback) {
    var res = {};
}
function resetSettings(callback) {
    chrome.storage.local.get(function(value){
        var keys = [];
        for (var key in value) {
            if (key.indexOf("progNotify")<0) {//通知登録データは除外
                keys.push(key);
            }
        }
        chrome.storage.local.remove(keys, callback);
    });
    
}
function resetCMSettings(callback) {
    var keys = [];
    for (var i=0; i<CMSettingList.length; i++) {
        keys.push(CMSettingList[i].name);
        if (CMSettingList[i].name.indexOf("is")==0) {
            keys.push(removeIs(CMSettingList[i].name));
        }
    }
    chrome.storage.local.remove(keys, callback);

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
    for(var i=0;i<settingsArr.length;i++){
        inputHTML+='<div id="i'+settingsArr[i].name+'">';
        for(var j=0;j<settingsArr[i].list.length;j++){
            inputHTML+='<div>';
            for(var k=0;k<settingsArr[i].list[j].length;k++){
                inputHTML+='<div>';
                inputHTML+='<input type="radio" name="'+settingsArr[i].name+'" value="'+settingsArr[i].list[j][k][0]+'">';
                inputHTML+=settingsArr[i].list[j][k][1];
                inputHTML+='</div>';
            }
            inputHTML+='</div>';
        }
        inputHTML+='</div>';
    }
    return inputHTML;
}
function generateOptionHTML(isPermanent) {
    var htmlstr = "";
    for (var i=0; i < settingsList.length; i++) {
        htmlstr += "<fieldset><legend>" + settingsList[i].description + "</legend>";
        htmlstr += generateOptionInput(settingsList[i].settings, isPermanent);
        htmlstr += "</fieldset>";
    }
    htmlstr += '<fieldset><legend>コメント色関連設定</legend><div id="CommentColorSettings">' + generateOptionInput(ComeColorSettingList, isPermanent) + '</div></fieldset>';
    htmlstr += generateRadioInput(RadioSettingList);
    htmlstr += '<div id="CommentMukouSettings"><fieldset><legend>コメント無効時関連設定</legend>' + generateOptionInput(CMSettingList, isPermanent) + '</fieldset></div>';
    return htmlstr;
}
