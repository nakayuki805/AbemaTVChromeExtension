// 拡張機能の通知登録一覧ページのJS
// edge対応
if (
    (typeof chrome === 'undefined' || !chrome.extension) &&
    typeof browser !== 'undefined'
) {
    this.chrome = chrome || browser;
}

function dateToStr(date) {
    date = new Date(date);
    var days = ['日', '月', '火', '水', '木', '金', '土'];
    return (
        date.getMonth() +
        1 +
        '月' +
        date.getDate() +
        '日（' +
        days[date.getDay()] +
        '）' +
        date.getHours() +
        '時' +
        date.getMinutes() +
        '分'
    );
}
window.addEventListener('load', function() {
    try {
        //firefoxでは予約一覧ページでstorageのgetがエラーになることがある
        chrome.storage.local.get(function(values) {
            var notifies = [];
            for (var key in values) {
                if (key.indexOf('progNotify') == 0) {
                    //通知登録データ
                    var eachNotify = values[key];
                    eachNotify.progNotifyName = key;
                    notifies.push(eachNotify);
                }
            }
            //notifiesを時刻順にソート
            notifies.sort(function(a, b) {
                return a.programTime < b.programTime ? -1 : 1;
            });
            //console.log(notifies)
            for (var i = 0; i < notifies.length; i++) {
                var progNotifyName = notifies[i].progNotifyName;
                progNotifyName = progNotifyName
                    .replace(/\?/g, '__question__')
                    .replace(/=/g, '__equal__')
                    .replace(/&/g, '__and__'); //URLパラメータを番組IDに含んでしまう問題(修正済み)への対応
                let programID = notifies[i].programID;
                if (programID.indexOf('?') >= 0)
                    programID = programID.slice(0, programID.indexOf('?'));
                var programUrl =
                    'https://abema.tv/channels/' +
                    notifies[i].channel +
                    '/slots/' +
                    programID;
                var trhtml = '<tr id="tr_' + progNotifyName + '">';
                trhtml += '<td>' + notifies[i].programTitle + '</td>';
                trhtml += '<td>' + notifies[i].channelName + '</td>';
                trhtml +=
                    '<td><a href="' +
                    programUrl +
                    '" target="_blank">' +
                    programID +
                    '</a></td>';
                trhtml += '<td>' + dateToStr(notifies[i].programTime) + '</td>';
                trhtml +=
                    "<td><input type='button' value='削除' id='delbtn_" +
                    progNotifyName +
                    "'></td>";
                trhtml += '</tr>';
                document
                    .querySelector('#notifyProgTable tbody')
                    .insertAdjacentHTML('beforeend', trhtml);
                document
                    .getElementById('delbtn_' + progNotifyName)
                    .addEventListener('click', function(e) {
                        //console.log(e.target.id)
                        progNotifyName = e.target.id.slice(7);
                        //console.log(progNotifyName)
                        chrome.runtime.sendMessage(
                            {
                                type: 'removeProgramNotifyAlarm',
                                progNotifyName: progNotifyName
                                    .replace(/__question__/g, '?')
                                    .replace(/__equal__/g, '=')
                                    .replace(/__and__/g, '&')
                            },
                            function(response) {
                                if (response.result === 'removed') {
                                    const tr = document.getElementById(
                                        'tr_' + progNotifyName
                                    );
                                    tr.parentElement.removeChild(tr);
                                } else {
                                    alert('削除できませんでした');
                                }
                            }
                        );
                    });
            }
        });
    } catch (e) {
        if (location.search.indexOf('?reloaded=1') < 0) {
            location.href = location.href + '?reloaded=1';
        } else {
            document.getElementById('notloaded').style.display = 'block';
            document.getElementById('notifyProgTable').style.display = 'none';
        }
    }
});
