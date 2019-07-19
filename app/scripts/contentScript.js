//import 'chromereload/devonly';//これがあるとfirefoxで動かなくなるしこの拡張には拡張リロード時に通知ポップアップをクリックしてAbemaのページをリロードする機能があるからcontent scriptには不要かと
import * as $ from 'jquery';
import * as settingslib from './lib/settings';
import * as getElm from './contentScript/getAbemaElement';
import * as getInfo from './contentScript/getAbemaInfo';
import * as gl from './lib/generic-lib';
import * as gdl from './lib/generic-dom-lib';
import * as notifyButton from './contentScript/notifyButton';
import * as TT from './contentScript/timetable';
import * as replayComment from './contentScript/replayComment';
import * as onair from './contentScript/onairpage';

import './contentScript/updatenotify.js';

// edge対応
if (process.env.VENDOR === 'edge') {
    let chrome = chrome || browser;
}
console.log(process.env.VENDOR);

//複数ファイル間で参照を保つオブジェクト
const settings = Object.assign({}, settingslib.defaultSettings);
onair.applySharedObjects(settings);

//debug
/*
jQuery.noConflict();
$ = function $(selector, context){
    if(typeof selector == "string" && selector.length<100){
        console.log("$("+selector+")");
    }
    return new jQuery.fn.init(selector, context);
}
$.fn = $.prototype = jQuery.fn;
jQuery.extend($, jQuery);
var oldfind = $.fn.find;
$.fn.find = $.extend(function find(){
    if(arguments[0]){
        console.log('find('+arguments[0]+')');
    }else{
        console.trace('find('+arguments[0]+')');
    }
    return oldfind.apply(this, arguments);
}, oldfind);
var oldchildren = $.fn.children;
$.fn.children = $.extend(function children(){
    if(arguments[0]){
        console.log('find('+arguments[0]+')');
    }else{
        console.trace('find('+arguments[0]+')');
    }
    return oldchildren.apply(this, arguments);
}, oldchildren);
*/
//devtoolのコンソールから呼び出せる関数
if (process.env.NODE_ENV === 'development') {
    window.logEval = function(varName) {
        console.log(eval(varName));
    };
    window.logGetInfo = function(name) {
        console.log(getInfo[name]());
    };
    window.logGetElm = function(name) {
        console.log(getElm[name]());
    };
}

/*設定
拡張機能のオプション画面から設定できます。
以下の変数のコメントにある機能を利用する場合はtrue、利用しない場合はfalseを代入してください。
例:
var isHoge = true; //利用したい機能
var isFuga = false; //利用したくない機能
*/
//console.log('before', Object.assign({},settings))

var disableExtVersion = ''; //拡張機能の動作を停止するバージョン

const extId = chrome.runtime.id;
const manifest = chrome.runtime.getManifest();

console.log('script loaded');
//window.addEventListener(function () {console.log})
//chrome.storageの関数

//設定のロード
(async function() {
    let value = await settingslib.getSettings();
    Object.assign(settings, value);
    //console.log('after',settings);
    onair.afterLoadSetting(value);
})();

var currentLocation = window.location.href;
var previousLocation = currentLocation; //URL変化前のURL

var currentVersion = manifest.version;

var urlChangeEvent = new Event('urlChange');

function delaysetNotOA() {
    const menuElement = getMenuObject();
    var hoverContents = $(menuElement);
    if (menuElement === null) hoverContents = $('.zC_zJ'); //todo
    if (hoverContents.children().length == 0) {
        console.log('delaysetNotOA retry');
        setTimeout(delaysetNotOA, 1000);
        return;
    }

    hoverContents.css({
        'max-height': 'calc(100vh - ' + onair.headerHeight + 'px)',
        'overflow-y': 'auto'
    });
    //拡張機能の設定と通知番組一覧をその他メニューに追加
    var hoverLinkClass = hoverContents.children('a')[0].className;
    var hoverSpanClass = hoverContents.children('a').children('span')[0]
        .className;
    //console.log(hoverContents,hoverContents.children(),hoverLinkClass)
    if (hoverContents.children('#extSettingLink').length == 0) {
        hoverContents.children(':last').css({
            'border-bottom': '1px solid #333',
            'margin-bottom': '8px',
            'padding-bottom': '12px'
        });
        hoverContents
            .append(
                '<a class="' +
                    hoverLinkClass +
                    '" id="extSettingLink" href="' +
                    chrome.extension.getURL('/pages/option.html') +
                    '" target="_blank"><span class="' +
                    hoverSpanClass +
                    '">拡張設定</span></a>'
            )
            .append(
                '<a class="' +
                    hoverLinkClass +
                    '" id="extProgNotifiesLink" href="' +
                    chrome.extension.getURL('/pages/notifylist.html') +
                    '" target="_blank"><span class="' +
                    hoverSpanClass +
                    '">拡張通知登録一覧</span></a>'
            );
    }
}

function getMenuObject() {
    //1番目に多くリンクを子にもつ親をMenuとする(子の数は6以上15以下)
    const minLinkParentChildren = 6;
    const maxLinkParentChildren = 10;
    const linkParentMap = new Map();
    const links = document.links;
    Array.from(links).forEach(l => {
        if (!linkParentMap.has(l.parentElement)) {
            linkParentMap.set(l.parentElement, [l]);
        } else {
            linkParentMap.get(l.parentElement).push(l);
        }
    });
    const linkParentRanking = Array.from(linkParentMap.entries()).sort(
        (a, b) => b[1].length - a[1].length
    );
    const filteredLinkParentRankingTop = linkParentRanking.filter(
        lp =>
            lp[1].length >= minLinkParentChildren &&
            lp[1].length <= maxLinkParentChildren
    )[0];
    if (!filteredLinkParentRankingTop) {
        console.log('?menu', filteredLinkParentRankingTop);
        return null;
    } else {
        return filteredLinkParentRankingTop[0];
    }
}

gl.getStorage(['disableExtVersion', 'maxResolution', 'minResolution'], function(
    val
) {
    if (val.disableExtVersion !== currentVersion) {
        if (gl.isEdge) {
            mainfunc();
        } else {
            $(window).on('load', mainfunc);
        }
        if (val.maxResolution != undefined && val.minResolution != undefined) {
            settings.maxResolution = val.maxResolution;
            settings.minResolution = val.minResolution;
        }
        // 拡張機能の情報をページ内JSから参照できるようにする
        const extInfoScript = document.createElement('script');
        const extInfoJS = `window.abema_ext_info = {"id": "${extId}", "name": "${
            manifest.name
        }", "version": "${manifest.version}"};`;
        extInfoScript.insertAdjacentHTML('afterbegin', extInfoJS);
        document.head.appendChild(extInfoScript);

        onair.injectXHR();
    } else {
        var csspath = chrome.extension.getURL('/styles/content.css');
        $("<link rel='stylesheet' href='" + csspath + "'>").appendTo('head');
        gdl.toast('現在のバージョンの拡張機能は動作が停止されています。');
    }
});

//URLによって実行内容を変更すべく各部を分離
function mainfunc() {
    //初回に一度実行しておけば後でURL部分が変わっても大丈夫なやつ
    console.log('loaded');
    const csspath = chrome.extension.getURL('/styles/content.css');
    // 静的なCSSを追加
    // $("<link rel='stylesheet' href='" + csspath + "'>").appendTo('head');
    const CSSlink = document.createElement('link');
    CSSlink.setAttribute('rel', 'stylesheet');
    CSSlink.setAttribute('href', csspath);
    document.head.appendChild(CSSlink);
    // jqueryを開発者コンソールから使う
    const jquerypath = chrome.extension.getURL('/jquery-3.2.1.min.js');
    // $("<script src='" + jquerypath + "'></script>").appendTo('head');
    const jqScript = document.createElement('script');
    jqScript.setAttribute('src', jquerypath);
    document.head.appendChild(jqScript);
    // ページにJSを注入
    const injectionpath = chrome.extension.getURL('/scripts/injection.js');
    // $("<script src='" + injectionpath + "'></script>").appendTo('head');
    const injectionScript = document.createElement('script');
    injectionScript.setAttribute('src', injectionpath);
    document.head.appendChild(injectionScript);

    //URLパターン別処理
    URLPatternSwitch();
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
    //解像度設定反映
    localStorage.setItem('ext_minResolution', settings.minResolution);
    localStorage.setItem('ext_maxResolution', settings.maxResolution);
    window.dispatchEvent(onair.resolutionSetEvent);
}
//event.jsでonHistoryStateUpdatedでページ推移を捕捉してるが念の為に10秒ポーリング(AbemaTV開いたまま拡張アップデートされたときとか)
setInterval(chkurl, 10000);
function chkurl() {
    if (
        currentLocation != window.location.href &&
        disableExtVersion !== currentVersion
    ) {
        previousLocation = currentLocation;
        currentLocation = window.location.href;
        console.log('%curl changed', 'background-color:yellow;');
        //console.log("old location:", previousLocation);

        onair.onChangeURL(determinePreviousUrl() != getInfo.URL_ONAIR);

        window.dispatchEvent(urlChangeEvent);

        URLPatternSwitch();
    }
}
function determinePreviousUrl() {
    return getInfo.determineUrl(previousLocation);
}
//onloadからも呼ばれる
function URLPatternSwitch() {
    //URLごとの分岐処理
    //判定出力はgetInfo.determineUrl(url)に移行したのでここでは出力しない
    const url = location.href;
    console.log('cup', url);
    const urlType = getInfo.determineUrl(url);

    switch (urlType) {
        case getInfo.URL_SLOTPAGE:
            //番組個別ページ
            notifyButton.putNotifyButton(settings.notifySeconds, url);
            onair.onairCleaner();
            delaysetNotOA();
            replayComment.prepare();
            break;
        case getInfo.URL_DATETABLE:
            //日付別番組表
            //番組表(チャンネル個別ではない)のとき
            //番組表に再生ボタンを追加する機能があるため、ここにあった放送画面へのリンクは廃止
            onair.onairCleaner();
            delaysetNotOA();
            TT.waitforloadtimetable(url);
            break;
        case getInfo.URL_CHANNELTABLE:
            //チャンネル別番組表
            onair.onairCleaner();
            delaysetNotOA();
            TT.waitforloadtimetable(url);
            break;
        case getInfo.URL_ONAIR:
            //放送ページ
            onair.onairfunc();
            break;
        case getInfo.URL_SEARCH:
            //番組検索結果(放送予定の番組)
            onair.onairCleaner();
            delaysetNotOA();
            notifyButton.putSerachNotifyButtons(settings.notifySeconds);
            break;
        case getInfo.URL_RESERVATION:
            //公式の視聴予約一覧
            onair.onairCleaner();
            delaysetNotOA();
            notifyButton.putReminderNotifyButtons(settings.notifySeconds);
            //スクロールで続きを読み込んだときのためチェック
            var itemCount = 0;
            var checkListInterval = setInterval(function() {
                if (getInfo.determineUrl() != getInfo.URL_RESERVATION) {
                    clearInterval(checkListInterval);
                    return;
                }
                var count = $('a[role=listitem]').length;
                if (itemCount < count) {
                    notifyButton.putReminderNotifyButtons(
                        settings.notifySeconds
                    );
                    itemCount = count;
                }
            }, 500);
            break;
        case getInfo.URL_TOPPAGE:
            onair.onairCleaner();
            // トップページではhoverメニューの追加のため少し待ってからdelaysetNotOAする
            setTimeout(delaysetNotOA, 1000);
            break;
        default:
            // それ以外のページ
            onair.onairCleaner();
            delaysetNotOA();
            break;
    }
    // AbemaTV Timetable Viewer スクリプト用
    if (
        urlType === getInfo.URL_ONAIR ||
        urlType === getInfo.URL_DATETABLE ||
        urlType === getInfo.URL_CHANNELTABLE
    ) {
        setTimeout(function() {
            const panelsTop = document.getElementById('TimetableViewer-panels');
            if (panelsTop)
                notifyButton.TTViewerScriptPrepare(settings.notifySeconds);
        }, 1000);
    }
}

chrome.runtime.onMessage.addListener(function(r) {
    //console.log(r);
    if (r.name === 'bgsend' || r.name === 'mediaUrlMatch') {
        onair.bgUpdate(r.type, r.value);
    } else if (r.name == 'addNGword') {
        onair.appendTextNG(null, r.word);
        if (r.isPermanent) {
            onair.addPermanentNG(r.word);
        }
    } else if (r.name == 'toggleChannel') {
        TT.toggleChannel(r.url);
    } else if (r.name == 'historyStateUpdated') {
        chkurl();
    } else if (r.name == 'contentScriptEval') {
        // 開発時のみevalを実行 抜け道がないように注意
        if (process.env.NODE_ENV === 'development') {
            const evalResult = eval(r.evalString);
            window.tmp = evalResult;
            console.log(evalResult);
        }
    } else {
        console.warn('message not match');
    }
});
