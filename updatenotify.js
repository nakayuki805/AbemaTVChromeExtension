//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var currentUpdateNotifyVersion = 10;//0.9.0の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近追加された機能(※デフォルト無効):<br>流れるコメント文字サイズをウィンドウ高さに追従※<br>タイトル・残り時間表示をコメ欄付近でコメ欄の色に合わせる※<br>コメント投稿時刻の削除※<br>上下黒帯パネルの透過度を設定可に※<br>などの機能が追加されています。<br><b>コメント数が多い時に</b>コメント流しが<b>重い場合</b>はコメント欄関連設定の「読込済コメント数がxを超えた時にコメ欄を閉じる」を低めの値(数百)にすると軽減されます。<br><b>※設定変更により機能が有効</b>になるので必要に応じて有効にしてください。→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a><!--<br>abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。-->";

function updateInfo(message) {
    var toastElem = $("<div class='toast' id='updateInfo'><p>" + message + "<br><input type='button' value='閉じる' onclick='$(\"#updateInfo\").hide()' style='color:black;'></p></div>").appendTo("body");
    setTimeout(function(){
        toastElem.fadeOut(10000);
    },50000);
}
chrome.storage.local.get("updateNotifyVer", function (value) {
    if (value.updateNotifyVer == undefined || value.updateNotifyVer < currentUpdateNotifyVersion) {
        updateInfo(notifyContent);
        chrome.storage.local.set({updateNotifyVer: currentUpdateNotifyVersion});
    }
});