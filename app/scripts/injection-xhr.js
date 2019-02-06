//画質選択が有効なときのみこのスクリプトを読み込む
//画質選択
import * as xhook from 'xhook';
if (process.env.NODE_ENV === 'development') {
    window.logEval = function(str) {
        console.log(eval(str));
    };
    window.logReps = function() {
        console.log(inj_representations);
    };
}
xhook.enable();
const extId = window.abema_ext_info.id;
let inj_maxRes = window.localStorage.getItem('ext_maxResolution');
let inj_minRes = window.localStorage.getItem('ext_minResolution');
inj_maxRes = parseInt(inj_maxRes !== undefined ? inj_maxRes : 2160); //4K解像度をデフォルトの最大値としておく
inj_minRes = parseInt(inj_minRes !== undefined ? inj_minRes : 0);
let inj_representations = [];
const hlsInitPlaylistPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/channel\/[-a-z0-9]+\/playlist.m3u8/;
const hlsPlaylistPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/channel\/[-a-z0-9]+\/(\d+)\/playlist.m3u8/;
const hlsTSPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/ts\/.*\/h264\/(\d+)\/[^\/\.]*\.ts$/;
const hlsTSnewsPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/tsnews\/.*\/h264\/(\d+)\/[^\/\.]*\.ts$/;
const hlsTSlivePattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/tslive\/.*\/h264\/(\d+)\/[^\/\.]*\.ts$/;
const hlsTSADPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/tsad\/.*/;
const dashMpdPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/channel\/[-a-z0-9]+\/manifest.mpd/;
const m4sVideoPattern = /^https:\/\/ds-linear-abematv.akamaized.net\/mp4[cde]*\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/(\d+)p.1\/[0-9init]+.m4s/;
const m4sAudioPattern = /^https:\/\/ds-linear-abematv.akamaized.net\/mp4[cde]*\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/(\d+)p.2\/[0-9init]+.m4s/;
const m4sLiveVideoPattern = /^https:\/\/ds-linear-abematv.akamaized.net\/mp4live\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/v(\d+)\/[0-9]+\/[0-9int]+.m4s/;
const m4sAdVideoPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/mp4ad\/[-a-zA-Z0-9]+\/\d+\/[a-zA-Z0-9]+\/(video-\d+)\/[0-9int]+.m4s/;
const m4sAdAudioPattern = /^https:\/\/ds-linear-abematv\.akamaized\.net\/mp4ad\/[-a-zA-Z0-9]+\/\d+\/[a-zA-Z0-9]+\/(audio-\d+)\/[0-9int]+.m4s/;
// ↓現状使われていない謎のURL
// ドメインを手がかりに検索してみた結果多分これ→https://media.abema.io/tracks/glasgow/:channelId/:sequence/:elapsedTime/:duration
const rcm = /^https:\/\/media\.abema\.io\/.*\/(\d+)\/(\d+)\/(\d+)\?[^\/]*$/;
// トラック用アドレス
// https://trk.ad.abema.io/v1/trk?rd={uuid}&tm=2&tid={cmid?}&qsui={userid}&qsgi=5%2C1&qpl=web&qos=PC&qua={UserAgent}&qt={url}&portrait=false&qccf=29&qfld=19
const adtrackPattern = /^https:\/\/trk.ad.abema.io\/v1\/trk\?.+/;

console.log('xhr open,send override');

window.addEventListener('resolutionSet', function() {
    let maxres = window.localStorage.getItem('ext_maxResolution');
    let minres = window.localStorage.getItem('ext_minResolution');
    inj_maxRes = parseInt(maxres !== undefined ? maxres : 2160); //4K解像度をデフォルトの最大値としておく
    inj_minRes = parseInt(minres !== undefined ? minres : 0);
});

xhook.before(req => {
    console.log(req)
    let url = req.url;
    if ((inj_maxRes != 2160 || inj_minRes != 0) && inj_maxRes >= inj_minRes) {
        //console.log('resch enabled');
        if (hlsPlaylistPattern.test(url)) {
            let res = parseInt(url.match(hlsPlaylistPattern)[1]);
            let newRes = res;
            if (inj_maxRes < res) {
                newRes = inj_maxRes;
            } else if (inj_minRes > res) {
                newRes = inj_minRes;
            }
            url = url.replace('/' + res + '/', '/' + newRes + '/');
            //console.log('m3u8 res=',res, newRes);
        } else if (m4sVideoPattern.test(url)) {
            // let res = parseInt(url.match(m4sVideoPattern)[1]);
            // let newRes = res;
            //console.log('m4svideo res=',res, newRes);
        } else if (m4sLiveVideoPattern.test(url)) {
            // let res = parseInt(url.match(m4sLiveVideoPattern)[1]);
            // let newRes = res;
            //console.log('m4sLivevideo res=',res, newRes);
        } else if (m4sAdVideoPattern.test(url)) {
            // let repid = url.match(m4sAdVideoPattern)[1];
            //console.log('m4sAdvideo res=',res, newRes, ' repid=', repid, newRepid);
        }
    }
    // URL別処理 mediaUrlMatchでメディア系URLが取得されたことを拡張機能に伝える
    if (hlsPlaylistPattern.test(url)) {
        // リアルタイムに更新される解像度別のm3u8
    } else if (hlsInitPlaylistPattern.test(url)) {
        // チャンネルで最初に読み込まれる初期のm3u8
    } else if (hlsTSPattern.test(url)) {
        // hlsのtsファイル(通常)
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 0,
            value: parseInt(hlsTSPattern.exec(url)[1])
        });
    } else if (hlsTSnewsPattern.test(url)) {
        // hlsのtsセグメント(ニュース)
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 0,
            value: parseInt(hlsTSnewsPattern.exec(url)[1])
        });
    } else if (hlsTSlivePattern.test(url)) {
        // hlsのtsセグメント(生放送)
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 0,
            value: parseInt(hlsTSlivePattern.exec(url)[1])
        });
    } else if (hlsTSADPattern.test(url) || m4sAdVideoPattern.test(url)) {
        // hlsもしくはdashのadセグメント
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 2,
            value: 0
        });
    } else if (m4sVideoPattern.test(url)) {
        // dashの映像セグメント
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 0,
            value: parseInt(m4sVideoPattern.exec(url)[1])
        });
    } else if (m4sAudioPattern.test(url)) {
        // dashの音声セグメント
    } else if (m4sAdAudioPattern.test(url)) {
        // dashの音声adセグメント
    } else if (dashMpdPattern.test(url)) {
        // dashのmpdファイル
    } else if (rcm.test(url)) {
        // 謎のURL 現状では意味をなしていない
        var re = rcm.exec(url);
        chrome.runtime.sendMessage(extId, {
            name: 'mediaUrlMatch',
            type: 1,
            value: [parseInt(re[1]), parseInt(re[2]), parseInt(re[3])]
        });
    } else if (adtrackPattern.test(url)) {
        const params = url
            .slice(url.indexOf('?') + 1)
            .split('&')
            .reduce((o, v) => {
                const p = v.split('=');
                o[p[0]] = decodeURIComponent(p[1]);
                return o;
            }, {});
        // const params2 = Object.assign({}, params);
        // tm trackingTiming 1~6
        // tid token
        // qsgi segmentGroupId
        // position
        // [
        //     'qua',// useragent
        //     'qsui',// userid
        //     'qt',// url
        //     'rd',// uuid
        //     'qos',// os
        //     'qpl',// platform
        //     'portrait',// 多分スマホで画面が縦向きかどうか
        //     'qccf',//ccfId
        //     'qfld'//failTimes
        // ].forEach(k => {
        //     if (params2[k]) delete params2[k];
        // });
        // console.log(params2);
    } else if (url.startsWith('https://ds-linear-abematv.akamaized.net')) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('not match media url', url);
        }
    }

    req.url = url;
});
xhook.after((req, res) => {
    if (dashMpdPattern.test(req.url)) {
        //console.log("XHR .mpd onload", this.responseURL);
        let dom = new DOMParser().parseFromString(res.text, 'text/xml');
        let adpSets = dom.getElementsByTagName('AdaptationSet');
        let videoAdpSets = [];
        for (let i = 0; i < adpSets.length; i++) {
            if (adpSets[i].getAttribute('mimeType') == 'video/mp4')
                videoAdpSets.push(adpSets[i]);
        }
        for (let i = 0; i < videoAdpSets.length; i++) {
            let repArr = [];
            let reps = Array.from(
                videoAdpSets[i].getElementsByTagName('Representation')
            );
            for (let j = 0; j < reps.length; j++) {
                let id = reps[j].getAttribute('id');
                let resolution = parseInt(reps[j].getAttribute('height'));
                repArr.push([id, resolution]);
                // console.log(reps);

                if (
                    (inj_maxRes != 2160 || inj_minRes != 0) &&
                    inj_maxRes >= inj_minRes &&
                    ((reps[j].previousElementSibling &&
                        reps[j].previousElementSibling.tagName.toUpperCase() ===
                            'REPRESENTATION') ||
                        (reps[j].nextElementSibling &&
                            reps[j].nextElementSibling.tagName.toUpperCase() ===
                                'REPRESENTATION'))
                ) {
                    // console.log('can remove', resolution);
                    if (resolution < inj_minRes || inj_maxRes < resolution) {
                        reps[j].remove();
                    }
                } else {
                    // console.log(
                    //     'cannot remove',
                    //     resolution,
                    //     inj_maxRes,
                    //     inj_minRes,
                    //     reps[j].previousElementSibling,
                    //     reps[j].nextElementSibling
                    // );
                }
            }
        }
        res.data = res.text = new XMLSerializer().serializeToString(dom);
        // console.log(res.text, res);
    }
});
