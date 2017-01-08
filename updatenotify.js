//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var currentUpdateNotifyVersion = 8;//8は0.6.2の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近追加された機能(※デフォルト無効):<br>番組表を開いたときに指定したチャンネルへ自動スクロール※<br>番組表の検索結果と公式の視聴予約一覧に拡張機能の通知登録ボタン設置<br>コメント欄を常に表示する際に右ボタンに連動して入力欄を非表示※<br>以上の機能が追加されています。<br><b>※設定変更により機能が有効</b>になるので必要に応じて有効にしてください。→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a><br>abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。";

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