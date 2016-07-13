//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用

var currentUpdateNotifyVersion = 4;//4は0.1.2の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近追加された機能(要設定):チャンネル別の番組表の拡張、新着コメントの強調<br>abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。<br>再掲:CM開始直前に画面が小さくなってしまう場合はこの拡張機能の<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a>の下のある「コメント無効時関連リセット」ボタンを試してください。";

function updateInfo(message) {
    var toastElem = $("<div class='toast' id='updateInfo'><p>" + message + "<br><input type='button' value='閉じる' onclick='$(\"#updateInfo\").hide()' style='color:black;'></p></div>").appendTo("body");
    setTimeout(function(){
        toastElem.fadeOut(10000);
    },20000);
}
chrome.storage.local.get("updateNotifyVer", function (value) {
    if (value.updateNotifyVer == undefined || value.updateNotifyVer < currentUpdateNotifyVersion) {
        updateInfo(notifyContent);
        chrome.storage.local.set({updateNotifyVer: currentUpdateNotifyVersion});
    }
});