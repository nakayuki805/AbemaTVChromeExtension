//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var currentUpdateNotifyVersion = 6;//6は0.3.0の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近追加された機能(デフォルト無効):<br>NG設定を流れるコメントだけではなく右のコメント欄にも反映させることも可能になりました。またコメント欄をクリックすると一時NGワードに簡単追加もできます。<br><b>両機能とも設定を変更しないと使えません</b>ので必要に応じて有効にしてください。(コメント欄関連設定にあります)→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a><br>abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。";

function updateInfo(message) {
    var toastElem = $("<div class='toast' id='updateInfo'><p>" + message + "<br><input type='button' value='閉じる' onclick='$(\"#updateInfo\").hide()' style='color:black;'></p></div>").appendTo("body");
    setTimeout(function(){
        toastElem.fadeOut(10000);
    },30000);
}
chrome.storage.local.get("updateNotifyVer", function (value) {
    if (value.updateNotifyVer == undefined || value.updateNotifyVer < currentUpdateNotifyVersion) {
        updateInfo(notifyContent);
        chrome.storage.local.set({updateNotifyVer: currentUpdateNotifyVersion});
    }
});