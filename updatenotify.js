//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var currentUpdateNotifyVersion = 7;//7は0.4.3の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近追加された機能(※デフォルト無効):<br>AbemaTV側の仕様変更に対応しましたが、現在一部動作が不安定です。<br>コメントの反映が少し遅くなっています。また最初開いたときにコメ欄が消えますがすぐ復活します。<br>コメント欄の表示が乱れるため<b>コメント入力欄を下にする機能は一旦無効にしています。</b><br>v0.4.0より共有NGワードに対応しました。※<br>v0.3.0よりNG設定を流れるコメントだけではなく右のコメント欄にも反映させることも可能になりました。※<br><b>設定変更により機能が有効</b>になるので必要に応じて有効にしてください。→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a><br>拡張機能のユーザー数1万人突破しました！<br>abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。";

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