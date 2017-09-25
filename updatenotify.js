//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var currentUpdateNotifyVersion = 14;//0.12.0の時
var optionUrl = chrome.extension.getURL("option.html");
var notifyContent = [
    "仕様変更に対応しましたがまだ不安定な可能性があります",
    "最近追加された機能(※デフォルト無効):",
    "コメントマウスオーバーで同一ユーザーのコメントをハイライト※",
    "ユーザーIDによるNG※",
    "拡張機能を一時停止させる(設定画面の下のボタン)",
    "番組表を掴んで移動",
    "などの機能が追加されています。",
    "<b>※設定変更により機能が有効</b>になるので必要に応じて有効にしてください。→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a>",
    "<span style='font-size:small'>コメント流しが<b>重い場合</b>はコメント欄関連設定の「読込済コメント数がxを超えた時にコメ欄を閉じる」を低めの値(数百)にすると軽減されます。",
    "番組表で右側の番組表詳細に初回だけ通知登録ボタンが表示されない場合、番組表を開いて少し待ってから番組をクリックしてください。",
    "</span><span style='font-size:x-small;'>不具合等あれば設定画面の不具合報告フォームから詳細を報告お願いします。</span>"
    //"abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。"
].join("<br>");

function updateInfo(message) {
    var toastElem = $("<div class='toast' id='updateInfo' style='width:600px;top:20%;left:40%;'><p>" + message + "<br><input type='button' value='閉じる' onclick='$(\"#updateInfo\").hide()' style='color:black;'></p></div>").appendTo("body");
    setTimeout(function(){
        toastElem.fadeOut(10000);
    },50000);
}
//updateInfo(notifyContent);
chrome.storage.local.get("updateNotifyVer", function (value) {
    if (value.updateNotifyVer == undefined || value.updateNotifyVer < currentUpdateNotifyVersion) {
        updateInfo(notifyContent);
        chrome.storage.local.set({updateNotifyVer: currentUpdateNotifyVersion});
    }
});