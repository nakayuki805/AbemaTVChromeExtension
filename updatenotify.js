//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用

var currentUpdateNotifyVersion = 2;//2は0.0.20の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = "最近の更新で設定画面のがカテゴリー分けされ見やすくなりました。<br>また詳細な挙動設定など設定項目や機能も増えました。<br><b>この拡張機能の<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a>を開いて新たな機能を確認してみてください。</b><br>この拡張機能はAbemaTVの仕様変更によりある日突然うまく動かなくなることがあります。その際はアップデートをお待ちください。";

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