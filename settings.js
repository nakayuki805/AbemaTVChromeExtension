var settingsList = [
        {
            "name": "isResizeScreen",
            "description": "ウィンドウサイズに合わせて映像の端が切れないようにリサイズ",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isDblFullscreen",
            "description": "ダブルクリックで全画面表示に切り替え",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isEnterSubmit",
            "description": "エンターでコメント送信",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isHideOldComment",
            "description": "古いコメントを非表示(コメント欄のスクロールバーがなくなります。)",
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
            "name": "movingCommentSpeed",
            "description": "↑のコメントの速さ(2pxあたりのミリ秒を入力、少ないほど速い)",
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
            "description": "コメントをCSSのanimationで流す(速度は変更できません。コメント流しが重い場合、これで軽減するかもしれません。)",
            "type": "boolean",
            "isInstantChangable": false
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
            "name": "valFullNg",
            "description": "",
            "type": "textarea",
            "isInstantChangable": true
        },
        {
            "name": "isInpWinBottom",
            "description": "コメント入力欄の位置を下へ・コメント一覧を逆順・下へスクロール",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isCustomPostWin",
            "description": "投稿ボタン削除・入力欄1行化",
            "type": "boolean",
            "isInstantChangable": false
        },
        {
            "name": "isCancelWheel",
            "description": "マウスホイールによる番組移動を禁止する",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isTimeVisible",
            "description": "コメント入力欄の近くに番組残り時間を表示",
            "type": "boolean",
            "isInstantChangable": true
        },
        {
            "name": "isSureReadComment",
            "description": "常にコメント欄を表示する",
            "type": "boolean",
            "isInstantChangable": false
        }
    ];
var CDSettingList = [
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
        }
    ];
function getSettings(callback) {
    var res = {};
    
}