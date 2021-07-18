import * as $ from 'jquery';
import * as dl from '../lib/dom-lib';
import * as getInfo from './getAbemaInfo';
import * as gl from '../lib/generic-lib';
import * as gdl from '../lib/generic-dom-lib';
import * as notifyButton from './notifyButton';
import * as settingslib from '../lib/settings';

if (process.env.NODE_ENV === 'development') {
    window.logTTEval = function(varName) {
        console.log(eval(varName));
    };
}

let EXTThead = null; // timetableのヘッダ部分(チャンネル,日付の親)
let EXTTbody = null; // timetableのボディ(チャンネル,日付の親)
let EXTTbodyS = null; // bodyのスクロール担当(sideL,Rの兄弟)
let EXTTsideR = null; // timetableの右の番組詳細
let EXTTsideL = null; // timetableの左の番組一覧
let EXTTtime = null; // timetableの時間列(縦長の緑のやつ)
let allowChannelNum = []; // Namesを元にした表示列番号
let allowChannelNames = [];
let timetableRunning = null; // 番組表表示時の10分インターバル
const timetableClasses = { arrow: '', timebar: '' }; // ページ遷移直後に取得できないので初回取得時に保持する getSingleSelectorの結果を入れるので使用時は.を付けない
const timetableGrabbing = {
    value: false,
    cx: 0,
    cy: 0,
    test: false,
    sx: 0,
    sy: 0,
    scrolled: false
}; // 番組表を掴む

const settings = Object.assign({}, settingslib.defaultSettings);

(async function() {
    const value = await settingslib.getSettings();
    Object.assign(settings, value);
    allowChannelNames = value.allowChannelNames.split(',');
})();
function getTTProgramTitleClass() {
    // 0:ビデオのN、1～その他、10くらいから番組タイトル
    // 後ろから取るが、番組表の後ろに要素が新設されても対応できるように適当なオフセットを設けておく
    return $(EXTTbody)
        .find('span')
        .map(function(i, e) {
            if (
                e.childElementCount === 0 &&
                e.className !== '' &&
                e.textContent !== ''
            )
                return e;
        })
        .eq(-5)
        .prop('class');
}
function getTTTimeClassesFromPT(proTitleClass) {
    // return[] 0:過去 1:放送中 2:放送予定 の背景を司るクラスを番組タイトルクラスから探す
    // programtitleの親の(articleの子の)buttonの子のdivが灰/緑/白の背景を持っているのでそれを探す
    // '.'を付けたクラス名で受ける(ここでは付けない)
    let ret = [null, null, null];
    if (!proTitleClass) {
        proTitleClass = getTTProgramTitleClass();
        if (!proTitleClass) return ret;
        else proTitleClass = '.' + proTitleClass;
    }

    let jb = $(EXTTbody);
    let jo = jb.find(proTitleClass);
    let re = /rgba?\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *\d+ *,?)? *\)/;
    let rs = /\s/;
    let rr = /^\s+|\s+$/g;
    let classes = [null, null, null];
    for (let i = 0, j, t, e, r, g, b, c; i < jo.length; i++) {
        j = jo
            .eq(i)
            .parentsUntil('button')
            .last();
        t = j.css('background-color');
        if (!re.test(t)) continue;
        e = re.exec(t);
        r = parseInt(e[1]);
        g = parseInt(e[2]);
        b = parseInt(e[3]);
        if (!classes[0] && r < 248 && g < 248 && b < 248) c = 0;
        else if (!classes[1] && r < 248 && g > 248 && b < 248) c = 1;
        else if (!classes[2] && r > 248 && g > 248 && b > 248) c = 2;
        else continue;
        classes[c] = j.prop('class').split(rs);
        if (classes[0] && classes[1] && classes[2]) break;
    }

    // timetable/dates/など全部過去、全部未来の場合(1つしか取れてない)はクラスが該当する要素が同数で判別できない
    let nc = 0;
    for (let i = 0; i < 3; i++) if (!classes[i]) nc++;
    if (nc === 3 || nc === 2) return ret;
    // (2以上の要素内で)重複クラスを削除して1つにならなければ全体の該当要素が少ないのを選ぶ
    let jc = 9999;
    let eq = true;
    ret = null;
    for (let i = 0, ci, cl; i < classes.length; i++) {
        ci = classes[i].replace(rr, '');
        if (!ci) continue;
        cl = jb.find('.' + ci).length;
        if (jc > cl) {
            jc = cl;
            ret = ci;
            eq = i === 0;
        } else if (jc < cl) eq = false;
    }
    return eq ? null : ret;
}
function getTTLRArrowContainerElement(returnSingleSelector) {
    // 右にある右アイコンの親buttonの親divを選びたいが初期状態では存在せず取れない場合があるので、
    // 横に長くて縦が短く画面中央にあってtimebarでないものを選ぶ
    // var jo = $('[*|href$="/images/icons/chevron_right.svg#svg-body"]:not([href])');
    let jo = $('div').map(function(i, e) {
        if (
            e.clientWidth > window.innerWidth / 2 &&
            e.offsetTop > window.innerHeight / 3 &&
            e.offsetTop < (window.innerHeight * 2) / 3
        )
            return e;
    });
    if (jo.length === 0) return null;
    else if (jo.length === 1) {
        return returnSingleSelector
            ? dl.getElementSingleSelector(jo[0])
            : jo[0];
    }

    // 特定条件でtimebarも取れるので除外する
    let ret = getTTtimebarElement();
    if (ret) {
        jo = jo.not(ret);
        if (jo.length === 0) return null;
        else if (jo.length === 1)
            return returnSingleSelector
                ? dl.getElementSingleSelector(jo[0])
                : jo[0];
    }
    for (let i = 0; i < jo.length; i++) {
        if ($(EXTTtime).find(jo.eq(i)).length > 0) jo = jo.not(jo.eq(i));
    }
    if (jo.length === 0) return null;
    else if (jo.length === 1)
        return returnSingleSelector
            ? dl.getElementSingleSelector(jo[0])
            : jo[0];

    for (let i = 0, z; i < jo.length; i++) {
        z = jo.eq(i).css('z-index');
        if (z === 'auto' || isNaN(parseInt(z)) || parseInt(z) <= 0)
            jo = jo.not(jo.eq(i));
    }
    if (jo.length === 0) return null;
    else if (jo.length === 1)
        return returnSingleSelector
            ? dl.getElementSingleSelector(jo[0])
            : jo[0];

    for (let i = 0; i < jo.length; i++) {
        if (jo.eq(i).offset().left > 50) jo = jo.not(jo.eq(i));
    }
    if (jo.length === 0) return null;
    else if (jo.length === 1)
        return returnSingleSelector
            ? dl.getElementSingleSelector(jo[0])
            : jo[0];

    return null;
}
function getTTtimebarElement(returnSingleSelector) {
    // 横に長くて縦が短くtopが直接指定されてるのを選ぶ
    // let jo = $('div').map(function(i, e) {
    //     if (
    //         e.clientWidth > window.innerWidth / 2 &&
    //         e.clientHeight < 30 &&
    //         e.style.top != ''
    //     )
    //         return e;
    // });
    const yokonagaDivs = dl.filter(document.getElementsByTagName('div'), {
        width12b: true,
        filters: [(e, b) => b.height < 30, e => e.style.top !== '']
    });
    // console.log(yokonagaDivs);
    if (yokonagaDivs.length === 0) return null;
    else if (yokonagaDivs.length === 1)
        return returnSingleSelector
            ? dl.getElementSingleSelector(yokonagaDivs[0])
            : yokonagaDivs[0];

    // もし2以上引っかかったら時刻を探す
    const re = /(^|[^\d])\d{1,2}:\d{2}($|[^\d])/;
    // jo = jo.map(function(i, e) {
    //     if (re.test(e.textContent)) return e;
    // });
    const timeDivs = yokonagaDivs.filter(e => re.test(e.textContent));
    // console.log(timeDivs);
    if (timeDivs.length === 0) return null;
    else if (timeDivs.length === 1)
        return returnSingleSelector
            ? dl.getElementSingleSelector(timeDivs[0])
            : timeDivs[0];

    // この時点でまだ取りきれないなら背景を使う
    const rt = /rgba? *\( *(\d+) *, *(\d+) *, *(\d+)(?: *,\d+ *,?)? *\)/;
    let jo = $('p').map(function(i, e) {
        if (e.offsetHeight > 0 && e.offsetHeight < 30 && re.test(e.textContent))
            return e;
    });
    let ret = null;
    for (let i = 0, c, e, r, g, b; i < jo.length; i++) {
        c = jo.eq(i).css('background-color');
        if (!rt.test(c)) continue;
        e = rt.exec(c);
        r = parseInt(e[1]);
        g = parseInt(e[2]);
        b = parseInt(e[3]);
        if ((r < 192 && g < 192 && b < 192) || (r > 64 && g > 64 && b > 64))
            continue;
        ret = jo[i];
        break;
    }
    // console.log(jo);
    if (!ret) return null;
    let p = ret.parentElement;
    while (p.tagName.toUpperCase() !== 'BODY' && p.offsetHeight < 30) {
        ret = p;
        p = ret.parentElement;
    }
    if (p.tagName.toUpperCase() === 'BODY') return null;
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getTTProgramTimeClasses() {
    // 番組開始の00とか30のクラス とその中のアイコンコンテナ(FREEとかを収納する用)があれば取る
    // 数字2桁をexttbody以外から取ると時間軸と日付も引っかかる
    let ret = [null, null];
    let jo = $(EXTTbody)
        .find('div')
        .map(function(i, e) {
            if (/^\d{2}$/.test(e.textContent)) return e;
        });
    let ja = [];
    for (let i = 0, c, added; i < jo.length; i++) {
        c = jo.eq(i).prop('class');
        if (!/\w/.test(c)) continue;
        c = c.split(/\s/)[0].replace(/^\s+|\s+$/, '');
        added = false;
        for (let j = 0; j < ja.length; j++) {
            if (ja[j][0] !== c) continue;
            ja[j][1]++;
            added = true;
            break;
        }
        if (!added) {
            ja[ja.length] = [c, 1];
        }
    }
    if (ja.length === 0) return ret;
    let t = ja[0][0];
    let m = ja[0][1];
    for (let i = 1; i < ja.length; i++) {
        if (m > ja[i][1]) continue;
        t = ja[i][0];
        m = ja[i][1];
    }
    ret[0] = t;

    // 時刻の後ろでtable-cellなdivのclassを選ぶ
    jo = $('.' + t);
    for (let i = 0, ji; i < jo.length; i++) {
        ji = jo.eq(i).contents();
        for (let j = 0, jp; j < ji.length; j++) {
            if (!/^\d{2}$/.test(ji.eq(j).text())) continue;
            jp = ji.eq(j).nextAll('div');
            for (let k = 0, c; k < jp.length; k++) {
                if (jp.eq(k).css('display') !== 'table-cell') continue;
                c = jp.eq(k).prop('class');
                if (!/\w/.test(c)) continue;
                ret[1] = c.split(/\s/)[0].replace(/\s+|\s+$/, '');
                break;
            }
            if (ret[1]) break;
        }
        if (ret[1]) break;
    }
    return ret;
}
function allowChannelNumMaker() {
    console.log("allowChannelNumMaker",allowChannelNames);
    if (allowChannelNames.length === 0) return 2;
    let u = 'https://abema.tv/timetable/channels/';
    let eaHead = $(EXTThead).children('a');
    if (eaHead.length === 0) return -2;
    let n = [];
    for (let i = 0, h, c; i < eaHead.length; i++) {
        if ((h = eaHead.eq(i).prop('href')) && h.indexOf(u) === 0) {
            c = h.replace(u, '');
            // console.log("c="+c);
            if (allowChannelNames.includes(c)) {
                n.push(i);
            }
        }
    }
    if (n.length === 0) return -1;
    let b = false;
    if (n.length === allowChannelNum.length) {
        b = true;
        for (let i = 0; i < n.length; i++) {
            if (n[i] !== allowChannelNum[i]) {
                b = false;
                break;
            }
        }
    }
    allowChannelNum = n;
    if (b) {
        return 0;
    } else {
        return 1;
    }
}
function timetableCss() {
    // console.log("timetableCss");
    $('head>link[title="usermade"]').remove();
    let t = '';
    let ts = '';
    let to;
    let selBody, selHead, selTime, selPTitle, selBodyS;
    let m;
    let alt = false;

    // 番組タイトルが少ない状態だとうまく取れないが今の遅延適用される状態(ch列が少し溜まるまでこのcssが生成されない)のがうまいこと効いてる
    selPTitle = getTTProgramTitleClass();
    if (!selPTitle) {
        console.log('?番組タイトルclass ' + to);
        selPTitle = alt ? '.ok_bq' : '';
    } else selPTitle = '.' + selPTitle;

    selBody = dl.getElementSingleSelector(EXTTbody);
    if ($(selBody).length !== 1) {
        console.log('?EXTTbody ' + selBody);
        selBody = alt ? '.pi_pk' : '';
    }

    if (settings.isExpandFewChannels) {
        // 横長さ制限があるのはfuturetitleのpだけだが仕様変更に備えて全てのpに適用しておく
        // futuretitleだけに適用する場合はgetTTTimeClassとかでがんばる
        if (selBody) t += selBody + ' p{width:100%;padding-right:1em;}';

        // 横幅100%から左端～時間軸の右端と右のスクロールバーの分(適当)を引いた幅にする
        // 真面目にやるならexttbodyから上がっていってoverflowがvisibleでない要素(またはsideLの兄弟)のclientWidthを取ればスクロールバーまでバッチリ取れるかも
        m = EXTTtime ? EXTTtime.getBoundingClientRect().right + 19 : 265;
        ts =
            'width:calc((100vw - ' +
            m +
            'px) / ' +
            allowChannelNum.length +
            ')!important;min-width:176px;';
    }
    if (settings.isChTimetableBreak && selPTitle) {
        t += selPTitle + '{word-break:break-word;}';
    }

    let c = getInfo.determineUrl();
    if (c === getInfo.URL_DATETABLE) {
        if (allowChannelNum.length > 0) {
            selHead = dl.getElementSingleSelector(EXTThead);
            if ($(selHead).length !== 1) {
                console.log('?EXTThead ' + selHead);
                selHead = alt ? '.qR_qT ' : '';
            }
            if (selHead) t += selHead + '>a{display:none;}';
            if (selBody) t += selBody + '>div{display:none;}';
            for (let i = 0, j; i < allowChannelNum.length; i++) {
                j = allowChannelNum[i] + 1;
                if (selHead)
                    t +=
                        selHead +
                        '>a:nth-child(' +
                        j +
                        '){display:unset!important;' +
                        ts +
                        '}';
                if (selBody)
                    t +=
                        selBody +
                        '>div:nth-child(' +
                        j +
                        '){display:unset!important;' +
                        ts +
                        '}';
            }
        }
        if (!timetableClasses.timebar) {
            selTime = getTTtimebarElement(true);
            if ($(selTime).length !== 1) {
                console.log('?date-bar ' + selTime);
                selTime = alt ? '.i__j3' : '';
            }
        } else selTime = timetableClasses.timebar;
        if (selTime) {
            timetableClasses.timebar = selTime;
            t += selTime + '{pointer-events:none;}';
            // console.log(selTime);
        }
    }

    if (settings.isHideArrowButton) {
        if (!timetableClasses.arrow) {
            to = getTTLRArrowContainerElement(true);
            if ($(to).length !== 1) {
                console.log('?Arrowbutton ' + to);
                to = alt ? '.i__jw' : '';
            }
        } else to = timetableClasses.arrow;
        if (to) {
            timetableClasses.arrow = to;
            t += to + '{visibility:hidden;opacity:0;pointer-events:none;}';
        }
    }
    if (settings.isExpandLastItem) {
        if (selBody)
            t +=
                selBody +
                '>div{height:unset;min-height:' +
                ($(EXTTtime).height() || 4320) +
                'px;}'; // 各列の縦長さ制限を外す
        if (selBody)
            t += selBody + '>div>*:last-child>article{min-height:43px;}';
    }
    if (settings.isHideTodayHighlight) {
        t += '[class*="styles__popup-container___"]{display:none;}'; // todo
    }
    if (settings.isChTimetablePlaybutton) {
        t += '.playbutton:hover{background-color:yellow;}';
    }
    if (settings.isChTimetableWeekend) {
        const r = getSatSun();
        const sat = r[0];
        const sun = r[1];
        if (sat >= 0) {
            t +=
                selBody +
                '>div:nth-child(' +
                (sat + 1) +
                ') article:not(.registeredProgs)>button>div{background-color:rgba(227,238,255,0.7);}';
            t +=
                selBody +
                '>div:nth-child(' +
                (sat + 1) +
                ') article:not(.registeredProgs)>button>div:hover{background-color:rgba(222,233,250,0.7);}';
        }
        if (sun >= 0) {
            t +=
                selBody +
                '>div:nth-child(' +
                (sun + 1) +
                ') article:not(.registeredProgs)>button>div{background-color:rgba(255,227,238,0.7);}';
            t +=
                selBody +
                '>div:nth-child(' +
                (sun + 1) +
                ') article:not(.registeredProgs)>button>div:hover{background-color:rgba(250,222,233,0.7);}';
        }
    }

    selBodyS = dl.getElementSingleSelector(EXTTbodyS);
    if ($(selBodyS).length !== 1) {
        console.log('?EXTTbodyS ' + selBodyS);
        selBody = alt ? '.i__jT' : '';
    }
    if (selBodyS) t += selBodyS + '{user-select:none;}'; // 選択テキストを掴むと移動できないので選択不可にしておく

    $(
        "<link title='usermade' rel='stylesheet' href='data:text/css," +
            encodeURIComponent(t) +
            "'>"
    ).appendTo('head');
}
export function toggleChannel(targetUrl) {
    // console.log("toggleChannel url="+targetUrl);
    let t = /\/([^/]+)$/.exec(targetUrl)[1];
    if (t === 'timetable') {
        // ALLを選択した時
        gdl.toast('番組表に表示するチャンネルをリセットしました。');
        allowChannelNames = [];
        allowChannelNum = [];
    } else {
        let i = allowChannelNames.indexOf(t);
        let chname = getInfo.getChannelNameOnTimetable(t, EXTTsideL);
        if (i < 0) {
            // 追加
            gdl.toast(chname + 'を番組表に表示するチャンネルに追加しました。');
            allowChannelNames.push(t);
        } else {
            // 削除
            gdl.toast(
                chname + 'を番組表に表示するチャンネルから削除しました。'
            );
            allowChannelNames.splice(i, 1);
        }
    }
    console.log(allowChannelNames);
    gl.setStorage({ allowChannelNames: allowChannelNames.join(',') });
    waitforloadtimetable(location.href);
}
export function waitforloadtimetable(url) {
    let c = getInfo.determineUrl();
    if (c !== getInfo.URL_DATETABLE && c !== getInfo.URL_CHANNELTABLE) {
        clearInterval(timetableRunning);
        timetableRunning = null;
        return;
    }
    if (url !== location.href) return;
    // 10分インターバル
    if (timetableRunning === null) {
        timetableRunning = setInterval(waitforloadtimetable, 600000, url);
    }

    let dd = $('div');
    let alt = false;
    $('head>link[title="usermade"]').remove(); // 要素がdisplay:noneだと探索で大きさが取れないのでまず元に戻す
    let j = dd.map(function(i, e) {
        // ヘッダ探索、上の方にあって横長くて列の数は7日分くらいより多いやつ
        let b = e.getBoundingClientRect();
        if (
            b.top < window.innerHeight / 4 &&
            b.top > 5 &&
            b.left < window.innerWidth / 3 &&
            b.width > window.innerWidth / 2 &&
            b.height < window.innerHeight / 3 &&
            e.childElementCount > 5
        )
            return e;
    });
    if (j.length > 0) EXTThead = j[0];
    else if (alt) {
        j = $('.rT_r1').children('div');
        if (j.length > 0) EXTThead = j[0];
    }
    if (!EXTThead) {
        console.log('?EXTThead');
        EXTThead = null;
    }

    j = dd.map(function(i, e) {
        let b = e.getBoundingClientRect(); // ボディ探索、でかいやつ(ただしチャンネル選択時に幅を調整するので幅では判定しない)でdiv>div>articleがあるやつ left判定で左CHリスト幅の226を引く
        if (
            b.top < window.innerHeight / 4 &&
            b.left - 226 < window.innerWidth / 4 &&
            b.height > window.innerHeight / 2 &&
            $(e).children('div').length > 5 &&
            $(e).find('div>div>button').length > 0
        )
            return e;
    });
    if (j.length >= 0) EXTTbody = j[0];
    else if (alt) {
        j = $('.com-timetable-TimeTableListTimeTable-wrapper');
        if (j.length > 0) EXTTbody = j[0];
    }
    if (!EXTTbody) {
        console.log('?EXTTbody');
        EXTTbody = null;
    }

    j = dd.map(function(i, e) {
        // 番組詳細探索、右にあるやつ
        let b = e.getBoundingClientRect();
        if (
            $(e).css('position') === 'fixed' &&
            !isNaN(parseInt($(e).css('z-index'))) &&
            parseInt($(e).css('z-index')) > 0 &&
            b.top < window.innerHeight / 4 &&
            b.left > window.innerWidth / 2 &&
            b.width < window.innerWidth / 2 &&
            b.width > 50 &&
            b.height > (window.innerHeight * 2) / 3
        )
            return e;
    });
    if (j.length > 0) EXTTsideR = j[0];
    else if (alt) {
        j = $('.rT_sL');
        if (j.length > 0) EXTTsideR = j[0];
    }
    if (!EXTTsideR) {
        console.log('?EXTTsideR');
        EXTTsideR = null;
    }

    j = $('a[href$="/timetable"]'); // 番組表リンク(ALL)をsideLとする
    if (j.length >= 2) {
        j = j.eq(1); // ヘッダの番組表リンクは除く
        while (
            j.prop('tagName').toUpperCase() !== 'BODY' &&
            j.children().length < 5
        )
            j = j.parent();
        if (j.children().length >= 5) EXTTsideL = j[0];
    }
    if (!EXTTsideL && alt) {
        j = $('.rT_sq ul');
        if (j.length > 0) EXTTsideL = j[0];
    }
    if (!EXTTsideL) {
        console.log('?EXTTsideL');
        EXTTsideL = null;
    }

    if (EXTTbody) {
        j = $(EXTTbody);
        while (
            j.prop('tagName').toUpperCase() !== 'BODY' &&
            j.css('overflow') === 'visible' &&
            !j.siblings().is(EXTTsideL)
        )
            j = j.parent();
        if (j.css('overflow') !== 'visible') EXTTbodyS = j[0];
    }
    if (!EXTTbodyS && alt) {
        j = $('.rT_ss');
        if (j.length > 0) EXTTbodyS = j[0];
    }
    if (!EXTTbodyS) {
        console.log('?EXTTbodyS');
        EXTTbodyS = null;
    }

    j = dd.map(function(i, e) {
        // timetable-axis
        let b = e.getBoundingClientRect();
        if (
            b.top < window.innerHeight / 3 &&
            b.left < window.innerWidth / 3 &&
            b.width < 50 &&
            b.height > (window.innerHeight * 2) / 3 &&
            e.childElementCount > 20
        )
            return e;
    });
    if (j.length > 0) EXTTtime = j[0];
    else if (alt) {
        j = $('.pi_eR');
        if (j.length > 0) EXTTtime = j[0];
    }
    if (!EXTTtime) {
        console.log('?EXTTtime');
        EXTTtime = null;
    }

    if (
        EXTThead !== null &&
        EXTTbody !== null &&
        EXTTsideR !== null &&
        EXTTsideL !== null &&
        EXTTtime !== null &&
        EXTTbodyS !== null
    ) {
        dl.addExtClass(EXTThead, 'tt-head');
        dl.addExtClass(EXTTbody, 'tt-body');
        dl.addExtClass(EXTTsideR, 'tt-side-r');
        dl.addExtClass(EXTTsideL, 'tt-side-l');
        dl.addExtClass(EXTTtime, 'tt-time');
        dl.addExtClass(EXTTbodyS, 'tt-body-s');
        allowChannelNumMaker();
        if (c === getInfo.URL_CHANNELTABLE) {
            setTimeout(timetablechfix, 100);
        } else if (c === getInfo.URL_DATETABLE) {
            setTimeout(timetabledtfix, 100);
        }
        setTimeout(timetableCommonFix, 100);
        // 番組表クリックで右詳細に通知登録ボタン設置
        $(EXTTbody).click(function(e) {
            // 掴んでスクロールした場合番組詳細は開かないことにする
            if (!timetableGrabbing.scrolled) {
                setTimeout(function() {
                    let jSideR1 = $(EXTTsideR);
                    let sideDetailDivClass = jSideR1.children().attr('class');
                    let jSideR2 = jSideR1.siblings(
                        ':has(div.' + sideDetailDivClass + ')'
                    );
                    if (jSideR1.css('z-index') < jSideR2.css('z-index')) {
                        EXTTsideR = jSideR2[0];
                        dl.addExtClass(EXTTsideR, 'tt-side-r');
                    }
                    console.log(EXTTsideR);
                    notifyButton.putSideDetailNotifyButton(
                        settings.notifySeconds,
                        EXTTsideL,
                        EXTTsideR
                    );
                    if (settings.isPutSideDetailHighlight) {
                        putSideDetailHighlight();
                    }
                    // 右詳細が溢れてもスクロールできるように
                    $(EXTTsideR).css('overflow-y', 'auto');
                }, 100);

                // console.log("putSideDetail*");
            } else {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            // console.log('EXTTbody clicked',e,timetableGrabbing.scrolled)
        });
        timetableCss();
        //↓謎のz-index:-1指定　番組表ページでヘッダが触れなくなるのでコメントアウト
        // $('div')を取ってきてあるのでここで使う 拡張のtoastとTimetableViewerスクリプトは除外する
        // dd.map(function(i, e) {
        //     if (
        //         $(e).css('z-index') > 10 &&
        //         e.className.indexOf('ext-toast') < 0 &&
        //         e.id.indexOf('TimetableViewer') < 0
        //     )
        //         return e;
        // }).css('z-index', '-1');

        // 番組表を掴んでドラッグする
        timetableGrabbing.test = false;
        timetableGrabbing.value = false;
        $(EXTTbodyS).mouseleave();
        if (timetableGrabbing.test === false) {
            $(EXTTbodyS)
                .mouseleave(function() {
                    timetableGrabbing.test = true;
                    timetableGrabbing.value = false;
                    timetableGrabbing.scrolled = false;
                })
                .mouseup(function() {
                    timetableGrabbing.value = false;
                })
                .mousedown(function(e) {
                    if (e.buttons === 1) {
                        // 左クリックだけの場合掴む
                        timetableGrabbing.value = true;
                        timetableGrabbing.cx = e.clientX;
                        timetableGrabbing.cy = e.clientY;
                        timetableGrabbing.sx = $(EXTTbodyS).scrollLeft();
                        timetableGrabbing.sy = $(EXTTbodyS).scrollTop();
                        timetableGrabbing.scrolled = false;
                    } else {
                        // timetableGrabbing.value=false;
                        // timetableGrabbing.scrolled=false;
                    }
                })
                .mousemove(function(e) {
                    // 掴んで少し移動したらスクロール
                    if (timetableGrabbing.value === false || e.buttons !== 1) {
                        // timetableGrabbing.scrolled=false;
                    } else {
                        if (
                            timetableGrabbing.scrolled === false &&
                            (Math.abs(timetableGrabbing.cx - e.clientX) > 10 ||
                                Math.abs(timetableGrabbing.cy - e.clientY) > 10)
                        )
                            timetableGrabbing.scrolled = true;
                        if (timetableGrabbing.scrolled) {
                            $(EXTTbodyS)
                                .scrollLeft(
                                    timetableGrabbing.sx +
                                        timetableGrabbing.cx -
                                        e.clientX
                                )
                                .scrollTop(
                                    timetableGrabbing.sy +
                                        timetableGrabbing.cy -
                                        e.clientY
                                );
                        }
                    }
                });
        }
    } else {
        console.log('retry waitforloadtimetable');
        setTimeout(waitforloadtimetable, 500, url);
    }
}
function putSideDetailHighlight() {
    let sideDetailWrapper = $(EXTTsideR);
    if (
        sideDetailWrapper.length === 0 ||
        sideDetailWrapper.offset().left > window.innerWidth - 50
    )
        return;
    sideDetailWrapper
        .css('overflow-x', '')
        .find('p[class="addedHighlight"]')
        .remove();
    let fp = sideDetailWrapper.find('p'); // 番組詳細,タイトル,日時,見逃し云々?
    if (fp.length < 2) return;
    let progTitle = fp.eq(1).text();

    let selPTitle = getTTProgramTitleClass();
    if (!selPTitle) return;
    let searchTarget = $(EXTTbody).find('.' + selPTitle);
    let highlightString = '';
    for (let i = 0, t; i < searchTarget.length; i++) {
        t = searchTarget.eq(i).text();
        if (t !== progTitle) continue;
        highlightString = searchTarget
            .eq(i)
            .parentsUntil('p')
            .parent('p')
            .next('p')
            .text();
        break;
    }
    if (!highlightString) return;
    $(
        '<p class="addedHighlight" style="line-height:19px;font-size:12px;margin-top:20px;">' +
            highlightString +
            '</p>'
    ).appendTo(sideDetailWrapper.children().last());
    sideDetailWrapper.css('overflow-x', 'hidden');
}
function timetabledtfix() {
    if (EXTThead.childElementCount > EXTTbody.childElementCount) {
        console.log('retry timetabledtfix()');
        setTimeout(timetabledtfix, 500);
        return;
    }
    // console.log("timetabledtfix");
    // 日付別番組表
    // 今はオプション1つのみだがチャンネル別のコピー
    let ce = false;
    if (settings.isChTimetablePlaybutton) {
        ce = true;
    }
    if (ce) {
        timetabledtloop();
    }
    console.log(allowChannelNum);
    let channelLink = $(EXTThead)
        .children('a')
        .eq(0);
    let chLinkWidth = 176;
    let isTimetableScroll = false;
    if (settings.timetableScroll !== '') {
        channelLink = $(EXTThead).children(
            'a[href$="/timetable/channels/' + settings.timetableScroll + '"]'
        );
        if (channelLink.length > 0) {
            isTimetableScroll = true;
        } else {
            channelLink = $(EXTThead)
                .children('a')
                .eq(0);
            console.warn(
                'timetable scroll error. (channelLink not found: チャンネル名が正しくないか仕様変更)'
            );
        }
    }
    let chLinkIndex = channelLink.index();
    chLinkWidth = $(EXTTbody)
        .children()
        .eq(chLinkIndex)
        .outerWidth(); // channelLink.width();
    let visibleChLinkIndex = chLinkIndex;
    let axisWidth = $(EXTTtime).width();
    let timetableWidth;
    if (allowChannelNum.length > 0) {
        if (isTimetableScroll) {
            visibleChLinkIndex = 0;
            for (let i = 0; i < allowChannelNum.length; i++) {
                if (allowChannelNum[i] < chLinkIndex) {
                    visibleChLinkIndex++;
                } else {
                    break;
                }
            }
            $(EXTTbody)
                .parent()
                .parent()
                .parent()
                .parent()
                .scrollLeft(
                    Math.min(
                        chLinkWidth * visibleChLinkIndex,
                        chLinkWidth * allowChannelNum.length -
                            $(EXTTbodyS).width() +
                            axisWidth
                    )
                );
        }
        if (!settings.isExpandFewChannels) {
            timetableWidth = axisWidth + chLinkWidth * allowChannelNum.length;
        } else {
            timetableWidth =
                axisWidth + chLinkWidth * EXTThead.childElementCount;
        }
    } else {
        if (isTimetableScroll) {
            $(EXTTbody)
                .parent()
                .parent()
                .parent()
                .parent()
                .scrollLeft(chLinkWidth * visibleChLinkIndex);
        }
        timetableWidth = axisWidth + chLinkWidth * EXTThead.childElementCount;
    }
    // 番組表幅の調整
    timetableWidth = Math.ceil(timetableWidth);
    // console.log(timetableWidth)
    $(EXTThead)
        .parent()
        .innerWidth(timetableWidth);
    $(EXTTbodyS)
        .children()
        .width(timetableWidth)
        .children('div')
        .last()
        .width(timetableWidth);

    // 左チャンネル一覧にチェックボックス設置
    let channelsli = $(EXTTsideL).children('li');
    if (channelsli.length === 0) {
        console.warn('channelsli');
    }
    channelsli.each(function(i, li) {
        // if(i == 0){return;}
        // i--;
        li = $(li);
        let checkbox = li.children('input');
        if (checkbox.length === 0) {
            checkbox = $(
                '<input type="checkbox" class="usermade chlicheckbox" style="display:inline-block;margin:' +
                    (gl.isFirefox ? 7 : 8) +
                    'px;height:12px;vertical-align:middle;" title="拡張機能のチャンネル表示切替">'
            ).appendTo(li);
            checkbox.click(function(e) {
                toggleChannel(
                    e.currentTarget.previousElementSibling.getAttribute('href')
                );
            });
        }
        if (i === 0) {
            checkbox.prop('checked', allowChannelNum.length === 0);
            checkbox.prop('disabled', allowChannelNum.length === 0);
        } else {
            checkbox.prop('checked', gl.hasArray(allowChannelNum, i - 1));
        }
        li.children('a')
            .css('display', 'inline-block')
            .css('width', 'calc(100% - ' + (16 + checkbox.width()) + 'px)');
    });
}
function timetabledtloop() {
    if (getInfo.determineUrl() !== getInfo.URL_DATETABLE) return;
    if (!settings.isChTimetablePlaybutton) return;
    if (settings.isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetabledtloop, 1000);
}
function timetablechfix() {
    // console.log("timetablechfix");
    // チャンネル別番組表
    let ce = false; // 定期実行するかどうか

    if (settings.isChTimetablePlaybutton) {
        // 再生ボタンの設置場所(放送中の緑色枠)は移動するので定期実行にて削除,設置する
        ce = true;
    }

    if (ce) {
        timetablechloop();
    }
}
function getSatSun() {
    let h = $(EXTThead).children('a[href*="/timetable/dates/"]');
    let sat = -1;
    let sun = -1;
    for (let i = 0; i < h.length; i++) {
        if (/[(（]土[)）]/.test(h.eq(i).text())) {
            sat = i;
            if (i < h.length - 1) {
                sun = i + 1;
                break;
            }
        } else if (/[(（]日[)）]/.test(h.eq(i).text())) {
            sun = i;
            if (i > 0) {
                sat = i - 1;
                break;
            }
        } else if (/[(（]月[)）]/.test(h.eq(i).text())) {
            if (i > 0) {
                sun = i - 1;
                if (i - 1 === 0) {
                    break;
                } else if (i > 1) {
                    sat = i - 2;
                    break;
                }
            }
        }
    }
    return [sat, sun];
}
function timetablechloop() {
    // URL変わったら終われるようにURLチェック
    if (getInfo.determineUrl() !== getInfo.URL_CHANNELTABLE) return;
    if (!settings.isChTimetablePlaybutton) return;
    if (settings.isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetablechloop, 1000);
}
function PlaybuttonEditor() {
    if (!settings.isChTimetablePlaybutton) return;
    if (/^https:\/\/abema\.tv\/timetable\/dates\/.+$/.test(location.href))
        return; // 当日を除く日付別番組表では実行しない
    // 放送中の緑枠のclassを取得
    let fisrtChDivs = EXTTbody.firstElementChild.childNodes;
    let presentClass = '';
    let clsArr = [];
    // 一つのチャンネルの一日分番組divを取得しそのarticle>button>divのclass名が仲間はずれのものが放送中のclass
    for (let i = 0, cls, flg = true; i < fisrtChDivs.length; i++) {
        cls = $(fisrtChDivs[i])
            .find('button')
            .attr('class');
        flg = true;
        for (let j = 0; j < clsArr.length; j++) {
            if (clsArr[j][0] === cls) {
                clsArr[j][1]++;
                flg = false;
            }
        }
        if (flg) {
            clsArr.push([cls, 1]);
        }
    }
    // console.log(clsArr);
    if (clsArr.length === 3 && clsArr[1][1] === 1) {
        presentClass = clsArr[1][0];
    } else if (clsArr.length === 2) {
        if (clsArr[0][1] === 1) presentClass = clsArr[0][0];
        else if (clsArr[1][1] === 1) presentClass = clsArr[1][0];
    }
    if (presentClass.length === 0) {
        console.warn('?presentClass failed');
        return;
    }
    // console.log(presentClass)
    let presentSelector = '.' + presentClass.split(' ').join('.');
    // 放送中の緑枠の移動に合わせて再生ボタンを削除、設置する
    let p = $(presentSelector); // 放送中の緑色枠
    // console.log(p,presentSelector)
    let b = $('.playbutton');
    let c = $(EXTThead).children(); // channel link
    let cr = /^https:\/\/abema\.tv\/timetable\/channels\/(.+)$/;
    let dr = /^https:\/\/abema\.tv\/timetable(?:\?.+|\/dates\/.+)?$/;
    let umc = location.href.match(cr);
    let umd = location.href.match(dr);
    let titleClass = getTTProgramTitleClass();
    for (let i = b.length - 1, d, s; i >= 0; i--) {
        d = b.eq(i).parent('a');
        s = d.siblings();
        if (!s.is(presentSelector)) {
            // 設置済ボタン位置が緑枠でなければボタン削除
            s.find('.' + titleClass)
                .parents('p')
                .css('width', '');
            d.remove();
        }
    }
    for (let i = 0, j, q, a, u, iumc; i < p.length; i++) {
        q = p.eq(i);// 放送中番組button要素
        const ttcolRect = Array.from(EXTTbody.children).filter(e=>e.contains(q[0]))[0].getBoundingClientRect();
        if (umc && umc.length > 1 && umc[1].length > 0) {
            // チャンネル別番組表ならボタンのリンク先はURLから取得
            u = '/now-on-air/' + umc[1];
        } else if (umd && umd.length > 0 && c.length > 0) {
            // 日付別番組表ならアイコンのリンクから取得
            j = $(EXTTbody)
                .children()
                .has(q)
                .index(); // 列のindex
            iumc = c
                .eq(j)
                .prop('href')
                .match(cr);
            if (iumc && iumc.length > 1 && iumc[1].length > 0) {
                u = '/now-on-air/' + iumc[1];
            } else {
                u = '';
            }
        } else {
            // 何か変な場合はトップページへ飛ぶようにする
            u = '';
        }
        if (
            !q
                .siblings()
                .children()
                .is('.playbutton')
        ) {
            // 緑枠にボタンがなければ設置
            const presentRect = q[0].getBoundingClientRect();
            const pbTop = presentRect.top-ttcolRect.top+4;
            const pbLeft = presentRect.left-ttcolRect.left+presentRect.width-24-4;
            // console.log(presentRect.left,pbLeft,q[0])
            q.children('div').children('div').children('div')
                .css('width', 'calc(100% - 24px)');
            a =
                '<a href="javascript:location.href=\'https://abema.tv' +
                u +
                '\';" title="放送中画面へ移動">';
            a +=
                `<div class="playbutton" style="position:absolute;left:${pbLeft}px;top:${pbTop}px;width:24px;height:24px;border:1px solid #6fb900;border-radius:50%;">`;
            a +=
                '<svg width="20" height="14" style="fill:#6fb900;transform:translate(1px,3px)">'; // 以前は7px,3px
            a += '<use xlink:href="/images/icons/playback.svg#svg-body">';
            a += '</use></svg></div>';
            a += '</a>';
            $(a).insertAfter(q);
            $('.playbutton').on('click', function(e) {
                // 普通の左クリックのみ移動、特殊クリックの場合はその操作に従う(移動しない)
                // console.log(e);
                if (
                    e.which === 1 &&
                    e.altKey === false &&
                    e.ctrlKey === false &&
                    e.shiftKey === false
                ) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    // 再生ボタンのある番組をクリックして右詳細の番組画像をクリック
                    // console.log(e.currentTarget);
                    console.log(e.currentTarget,e);
                    dl.clickElement(
                        $(e.currentTarget)
                            .parents('a').siblings('button')
                            .get(0)
                    );
                    setTimeout(
                        dl.clickElement,
                        10,
                        $(EXTTsideR)
                            .find('a[href^="/now-on-air/"]')
                            .get(0)
                    ); // todo
                }
            });
        }
    }
}

function timetableCommonFix(retrycount) {
    let progArticle, progTitle;
    // 読込に1秒以上かかる場合を考慮し、ヘッダと列の数を見るようにしてみる
    let cols = $(EXTTbody)
        .children('div')
        .map(function(i, e) {
            if (
                $(e).width() > 50 &&
                $(e).height() > (window.innerHeight * 2) / 3
            )
                return e;
        });

    if (cols.length < EXTThead.childElementCount) {
        setTimeout(timetableCommonFix, 1000);
        return;
    }

    // 別の日のページへの遷移直後は前の読込済表示が残っている(cols.len=head.childcount)ので更新を待つ必要がある
    // とりあえず最後の番組のarticleにtitleが付いてたら残ってることにしてリトライする
    if (
        cols
            .last()
            .children()
            .last()
            .find('article')
            .attr('title')
    ) {
        if (retrycount === undefined) retrycount = 5;
        if (retrycount > 0)
            setTimeout(timetableCommonFix, 1000, retrycount - 1);
    }

    // 番組タイトルをtitle要素にする
    let selPTitle = getTTProgramTitleClass();
    let selICont = getTTProgramTimeClasses()[1];
    let jt, jp, jf;
    cols.each(function() {
        $(this)
            .children()
            .each(function() {
                // 番組毎divについてのループ
                progArticle = $(this).find('article');
                jt = progArticle.find('.' + selPTitle);
                progTitle = jt.text();
                progArticle.attr('title', progTitle);

                if (settings.isReplaceIcons && selICont) {
                    jp = jt.siblings('span,svg');
                    if (jp.length > 0) {
                        jf = progArticle.find('.' + selICont);
                        if (jf.length > 0) {
                            jp.each(function() {
                                $(this).appendTo(jf);
                            });
                        }
                    }
                }
            });
    });
    notifyButton.setRegistProgsBackground();
}
