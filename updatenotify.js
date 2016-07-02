//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用

var currentUpdateNotifyVersion = 3;//3は0.0.21の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "現在、一部の環境でCM開始直前に画面が小さくなってしまう現象が確認されています。<br><b>この拡張機能の<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a>の下のある「コメント無効時関連リセット」ボタンを試してください。</b><br>設定リセとボタンはアップデートで新たに追加されました。";

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