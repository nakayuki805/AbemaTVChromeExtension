//webストア版向けに拡張機能の新機能等お知らせをアップデート後初回のみtoast状に表示
//webストア公開版、firefoxパッケージ版のmanifest.jsonにはcontent_scriptsのjsの最後にこのファイルが加えられる
//github版では不使用
// edge対応
if (
    (typeof chrome === 'undefined' || !chrome.extension) &&
    typeof browser !== 'undefined'
) {
    window.chrome = chrome || browser;
}

var currentUpdateNotifyVersion = 15; //0.13.1の時
var optionUrl = chrome.extension.getURL('/pages/option.html');
var notifyContent = [
    '_bem_tv ext (AbemaTV非公式拡張機能) 最近追加された機能:', //表示させたいときはcurrentUpdateNotifyVersionの更新を忘れずに
    'Abemaプレミアムの見逃しコメント表示時にコメントを流す(放送画面でのコメント流しの設定に準ずる)',
    'ピクチャーインピクチャーモードへの切り替え(Chrome 70以降、仕様によりCM等で再生停止するためその都度手動で再度切り替えが必要です。)',
    '解像度変更(実験的、有効にすると不具合が発生する可能性あり)',
    'などの機能が追加されています。',
    //    "<b>※設定変更により機能が有効</b>になるので必要に応じて有効にしてください。→<a href='"+optionUrl+"' target='_blank'>オプション設定画面</a>",
    "<span style='font-size:small'>コメント欄がちらつく場合はコメント欄関連設定の「読込済コメント数がxを超えた時にコメ欄を閉じる」を500以上にしてください。",
    "</span><span style='font-size:x-small;'>不具合等あれば設定画面の不具合報告フォームから詳細を報告お願いします。</span>",
    "<a href='" +
        optionUrl +
        "' target='_blank'>オプション設定画面</a> 一部の設定項目に説明画像を追加しました。"
    //"abematv拡張機能の実験的なfirefox版<a href='https://www.nakayuki.net/abema-ext/' target='_blank'>公開中</a>です。"
].join('<br>');

function updateInfo(message) {
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('ext-toast');
    toastDiv.id = 'updateInfo';
    toastDiv.style.cssText = 'width:600px;top:20%;left:50%;';
    const toastP = document.createElement('p');
    toastP.insertAdjacentHTML('afterbegin', message);
    toastP.appendChild(document.createElement('br'));
    const closeBtn = document.createElement('input');
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('value', '閉じる');
    closeBtn.id = 'updateInfoCloseBtn';
    closeBtn.style.color = 'black';
    toastP.appendChild(closeBtn);
    toastDiv.appendChild(toastP);
    document.body.appendChild(toastDiv);
    // var toastElem = $(
    //     "<div class='ext-toast' id='updateInfo' style='width:600px;top:20%;left:40%;'><p>" +
    //         message +
    //         "<br><input type='button' value='閉じる' style='color:black;' id='updateInfoCloseBtn'></p></div>"
    // ).appendTo('body');
    setTimeout(function() {
        toastDiv.classList.add('ext-fadeOut10s');
        setTimeout(function() {
            toastDiv.remove();
        }, 10000);
    }, 50000);
    // $('#updateInfoCloseBtn').click(function() {
    //     $('#updateInfo').hide();
    // });
    closeBtn.addEventListener('click', function() {
        toastDiv.remove();
    });
}
//updateInfo(notifyContent);
window.addEventListener('load', function() {
    chrome.storage.local.get('updateNotifyVer', function(value) {
        if (
            process.env.NODE_ENV != 'development' &&
            (value.updateNotifyVer == undefined ||
                value.updateNotifyVer < currentUpdateNotifyVersion)
        ) {
            updateInfo(notifyContent);
            chrome.storage.local.set({
                updateNotifyVer: currentUpdateNotifyVersion
            });
        }
    });
});
