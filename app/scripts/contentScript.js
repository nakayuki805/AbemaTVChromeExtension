//import 'chromereload/devonly';//これがあるとfirefoxで動かなくなるしこの拡張には拡張リロード時に通知ポップアップをクリックしてAbemaのページをリロードする機能があるからcontent scriptには不要かと
import * as $ from "jquery";
import "./lib/jquery-lib";
import * as settingslib from './settings';
import * as getElm from './lib/getAbemaElement';
import * as getInfo from './lib/getAbemaInfo';
import * as dl from './lib/dom-lib';
import './updatenotify.js';

// edge対応
if (process.env.VENDOR === 'edge') {
    let chrome = chrome || browser;
}console.log(process.env.VENDOR);

var settings = settingslib.defaultSettings;
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
window.logEval = function(varName) {
    console.log(eval(varName));
};
window.logGetInfo = function(name) {
    console.log(getInfo[name]());
};
window.logGetElm = function(name){
    console.log(getElm[name]());
};
/*設定
拡張機能のオプション画面から設定できます。
以下の変数のコメントにある機能を利用する場合はtrue、利用しない場合はfalseを代入してください。
例:
var isHoge = true; //利用したい機能
var isFuga = false; //利用したくない機能
*/
console.log('before', Object.assign({},settings))

var cmblockia = 1; //コメント欄が無効になってからCM処理までのウェイト(+1以上)
var cmblockib = -1; //有効になってから解除までのウェイト(-1以下)
var panelopenset = [[1, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]];//head,foot,sideの開閉設定[全閉,info開,chli開,come開] 0:非表示 1:5秒で隠す 2:常に表示
// settings.isChTimetableExpand = false; //チャンネル別番組表でタイトルが隠れないように縦に広げる
//settings.allowChannelNames = ["abema-news", "abema-special", "special-plus", "special-plus-2", "special-plus-3", "special-plus-4", "special-plus-5", "special-plus-6", "drama", "asia-drama", "reality-show", "mtv-hits", "space-shower", "documentary", "variety", "pet", "club-channel", "commercial", "anime24", "midnight-anime", "oldtime-anime", "family-anime", "new-anime", "yokonori-sports", "hiphop", "soccer", "fighting-sports", "fighting-sports2", "golf", "fishing", "shogi", "mahjong"];
settings.allowChannelNames = [];

var disableExtVersion = ''; //拡張機能の動作を停止するバージョン

console.log("script loaded");
//window.addEventListener(function () {console.log})
//chrome.storageの関数
function getStorage(keys, callback) {
    if (chrome.storage) {
        if (keys) {
            chrome.storage.local.get(keys, callback);
        } else {
            chrome.storage.local.get(callback);
        }
    } else {
        chrome.runtime.sendMessage({ type: "getStorage", keys: keys }, function (response) {
            callback(response.items);
        });
    }
}
function setStorage(items, callback) {
    if (chrome.storage) {
        chrome.storage.local.set(items, callback);
    } else {
        chrome.runtime.sendMessage({ type: "setStorage", items: items }, function (response) {
            //console.log(response.result)
            callback();
        });
    }
}
//設定のロード
(async function () {
    let value = await settingslib.getSettings();
    Object.assign(settings, value);
    console.log('after',settings);
    cmblockia = Math.max(1, ((value.beforeCMWait !== undefined) ? (1 + value.beforeCMWait) : cmblockia));
    cmblockib = -Math.max(1, ((value.afterCMWait !== undefined) ? (1 + value.afterCMWait) : (-cmblockib)));
    //        panelopenses=value.panelopenset||"111000000000";
    // panelopenses = value.panelopenset || (settings.isAlwaysShowPanel ? "222222222222" : (isOpenPanelwCome ? "111000000111" : "111000000000"));//isA..とisO..を初回のみ適用
    var panelopenses = typeof value.panelopenset == "number" ? value.panelopenset : parseInt(value.panelopenset || "111000000000", 3);
    if (panelopenses == 0) putPopacti();
    if (panelopenses < Math.pow(3, 12)) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0, m, d; j < 3; j++) {
                m = Math.pow(3, (3 - i) * 3 + (2 - j));
                d = 0;
                while (m <= panelopenses) {
                    panelopenses -= m;
                    d++;
                }
                if (d < 3) panelopenset[i][j] = d;
            }
        }
    }
    settings.highlightNewCome = (value.highlightNewCome !== undefined) ? Number(value.highlightNewCome) : settings.highlightNewCome;
    settings.highlightComeColor = (value.highlightComeColor !== undefined) ? Number(value.highlightComeColor) : settings.highlightComeColor;
    settings.highlightComePower = (value.highlightComePower !== undefined) ? Number(value.highlightComePower) : settings.highlightComePower;
    settings.allowChannelNames = (value.allowChannelNames !== undefined) ? value.allowChannelNames.split(",") : settings.allowChannelNames;
})();

var currentLocation = window.location.href;
var previousLocation = currentLocation;//URL変化前のURL
//var urlchangedtick=Date.now();
var isFirefox = window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
var isEdge = window.navigator.userAgent.toLowerCase().indexOf("edge") != -1;
var headerHeight = 68;
var footerHeight = 72;
var commentNum = 0;
var comeLatestPosi = [];
var comeTTLmin = 3;
var comeTTLmax = 13;
var comeLatestLen = 10;
comeLatestPosi.length = comeLatestLen;
for (var i = 0; i < comeLatestLen; i++) {
    comeLatestPosi[i] = [];
    comeLatestPosi[i][0] = 0;
    comeLatestPosi[i][1] = comeTTLmin;
}
//var playtick=0;
//var comeLatestCount = 0; //画面右下で取得するコメント数
var isComeLatestClickable = true; //右下コメント数をクリックできるか
var arFullNg = [];
var arUserNg = [];
//var retrytick=[1000,3000,6000,12000,18000];
//var retrycount=0;
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
//var proEnd = new Date(Date.now()+60*60*1000); //番組終了として現在時刻から1時間後を仮設定
var proEnd = new Date(); //↑で23時～24時の間に実行すると終了時刻が1日ずれるので現時刻にした
var forElementClose = 0; //コメント表示中でも各要素を表示させた時に自動で隠す場合のカウントダウン
var EXcomelist;
var EXcomments;

//var commentsSelector = '[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]';
var commentListParentSelector = '#main div.ww_wA.rH_e.rH_rJ > div';
var overlapSelector;// = '#main div.'+$('div').map(function(i,e){var b=e.getBoundingClientRect();if($(e).css("position")=="absolute"&&b.top<5&&b.left<5&&b.width>window.innerWidth-10&&b.height>window.innerHeight-10&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0))return e;}).eq(0).prop("class");

var EXmain;
var EXhead;
var EXmenu; //元hover-contents
var EXfoot;
var EXfootcome;
var EXfootcount;
var EXcountview;
var EXfootcountcome;
var EXside;
var EXchli;
var EXinfo;
var EXcome;
var EXcomesend;//コメント入力フォーム
var EXcomesendinp;//↑のtextarea
//var EXcomesendbut;
var EXcomecont;
//var EXcomelist0;
//var EXobli;
let EXvideoarea;
//var EXwatchingnum;//EXobliの現在視聴中のチャンネルの子供のindex
//var EXwatchingstr;//現在視聴中のチャンネル名(右チャネル一覧のチャンネルロゴのaltから取得)
var EXvolume;
var EXfullscr;
var EXcomemodule;//Twitterボタンや投稿ボタンを含む要素 入力欄をフォーカスしたときにセットし放送画面以外ではnull
var EXTThead;//timetableのヘッダ部分(チャンネル,日付の親)
var EXTTbody;//timetableのボディ(チャンネル,日付の親)
var EXTTbodyS;//bodyのスクロール担当(sideL,Rの兄弟)
var EXTTsideR;//timetableの右の番組詳細
var EXTTsideL;//timetableの左の番組一覧
var EXTTtime;//timetableの時間列(縦長の緑のやつ)
var comeclickcd = 2; //コメント欄を早く開きすぎないためのウェイト
var cmblockcd = 0; //カウント用
var comeRefreshing = false; //コメ欄自動開閉中はソートを実行したいのでコメント更新しない用
var comeFastOpen = false;
//var newtop = 0;//映像位置のtop
var comeHealth = 100; //コメント欄を開く時の初期読込時に読み込まれたコメント数（公式NGがあると100未満になる）
var bginfo = [0, [], -1, -1]; //ソースの縦長さなど主にwebrequestメッセージ入れ
var eventAdded = false; //各イベントを1回だけ作成する用
var setBlacked = [false, false, false]; //soundsetなどのスイッチ
var keyinput = []; //コマンド入れ
var keyCodes = "38,38,40,40,37,39,37,39,66,65";
var comeArray = []; //流すコメントで、新着の複数コメントのうちNG処理等を経て実際に出力するコメントのリスト
//var popElemented=false; //mouseoverでunpopElementが実行されまくるのを防止
var proTitle = ""; //番組タイトル
var proinfoOpened = false; //番組タイトルクリックで番組情報枠を開いた後にクリックで閉じれるようにする
var optionStatsUpdated = false; //optionStatsUpdateの重複起動防止
var kakikomitxt = ""; //自分の投稿内容
var eyecatched = false;//前回(1s前)の左上のロゴの存在 false:無かった true:有った
var eyecatcheck = false; //eyecatch利用時の高速チェックの多重起動を防止
var popCodes = "39" + ",39".repeat(50); //黒帯パネルを全て非表示にした時の脱出コマンド(右矢印を51回連打)
var popinput = [];
var popacti = false; //脱出コマンドを受け付けるかどうか
var isAutoReload = false; //コメ欄スクロール時に読込済コメントを自動反映するかどうか
var onairRunning = false; //映像ページの定期実行のやつの複数起動防止用 setintervalの格納
var comeNGmode = 0; //NG追加先の分岐用
var NGshareURLbase = "https://abema.nakayuki.net/ngshare/v1/"; //共有NGワードAPI
var APIclientName = "AbemaTVChromeExtension"; //↑のクライアント名
var isNGShareInterval = false; //applySharedNGwordがinterval状態か
var postedNGwords = []; //送信済みNGワード
var postedNGusers = []; //送信済みNGユーザー
var isComelistMouseDown = false;
var movieWidth = 0; //.TVContainer__resize-screenの大きさ(onresize発火用)
//var movieHeight = 0;
var waitingforResize = false; //waitforresizeの複数起動防止用
var copycomecount = 2; //番組移動直後にcopycomeをfullcopyする回数
var notifyButtonData = {}; //通知登録ボタンの番組情報格納
var allowChannelNum = []; //Namesを元にした表示列番号
//var movieWidth2 = 0; //video.parentの大きさ(onresize発火用)
var oldWindowState = "normal"; // フルスクリーン切り替え前のウィンドウのstate
var isTootEnabled = false; //コメントのトゥート有効か
var onairSecCount = 0; //onairbasefuncでカウントアップされる
var commentObserver = new MutationObserver(function(mutations) {
    setTimeout(function(mutations){
        onCommentChange(mutations);
    }, 50, mutations);//injection.jsでdata属性のセットが終わるまで待つ
}); //コメント欄DOM監視
var isFirstComeAnimated = false; //最初に既存のコメがanimationしたか 最初に既存のコメが一気に画面に流れてくるのを防ぐためのフラグ
var timetableRunning = false; //番組表表示時の10分インターバル
var audibleReloadCount = -1;
var isSoundFlag = true; //音が出ているか soundSet(isSound)のisSoundを保持したり音量クリック時にミュートチェック
var timetableGrabbing = {value:false,cx:0,cy:0,test:false,sx:0,sy:0,scrolled:false,}; //番組表を掴む
var comelistClasses = { stabled: "", animated: "", empty: "", progress: "", message: "", posttime: ""};
var timetableClasses = { arrow: "", timebar: "", };//ページ遷移直後に取得できないので初回取得時に保持する getSingleSelectorの結果を入れるので使用時は.を付けない
var currentVersion = chrome.runtime.getManifest().version;
var resizeEventTimer = 0; //ウィンドウリサイズイベント用のタイマー
var isBottomScrolled = false; //コメ欄逆順時初回で下にスクロールしたか
var urlChangeEvent = new Event('urlChange');
var comelistReadyEvent = new Event('commentListReady');
var resolutionSetEvent = new Event('resolutionSet');
var delaysetConsoleStr = "";
var delaysetConsoleRepeated = false;
var lastMovedCommentTime = 0;//最後に流れたコメントの時間(コメントが二重に流れるのを防ぐ)
let isResizeInterval = false;

function hasArray(array, item) {//配列arrayにitemが含まれているか
    var hasFlg = false;
    for (var hai = 0; hai < array.length; hai++) {
        if (array[hai] === item) {
            hasFlg = true;
        }
    }
    return hasFlg;
}
function postJson(url, data, headers, callback, errorCallback) {
    if(isFirefox){
        chrome.runtime.sendMessage({ type: "postJson", url: url, data: data, headers: headers}, function (response) {
            if (response.status == 'success') {
                callback(response.result);                
            }else {
                errorCallback();
            }
        });
    }else{
        $.ajax({url: url, type: 'POST', data: JSON.stringify(data), headers: headers, contentType: 'application/json', dataType: 'json', success: callback, error: errorCallback});
    }
}
function getJson(url, data, callback) {
    if(isFirefox){
        chrome.runtime.sendMessage({ type: "getJson", url: url, data: data}, function (response) {
            if (response.status == 'success') {
                callback(response.result);                
            }
        });
    }else{
        $.get(url, data, callback);
    }
}

function onairCleaner() {
    console.log("onairCleaner");
    //onairfunc以降に作成した要素を削除
    $('.usermade').remove();
    if (EXhead && EXfoot) {
        pophideElement({ allreset: true });
        pophideElement({head:1}); //allresetしてもヘッダーが表示されないので    
    }
    //変数クリア
    EXcomemodule = null;
    //放送画面のEX*をクリアする、一旦非放送画面に移った後放送画面に戻ると再利用できないため再度setEXsで取得する必要がある
    EXhead = null;
    EXmenu = null;
    EXfoot = null;
    EXfootcome = null;
    EXcountview = null;
    EXfootcountcome = null;
    EXside = null;
    EXchli = null;
    EXinfo = null;
    EXcomesendinp = null;
    EXcomesend = null;
    EXcome = null;
    EXvolume = null;
    EXfullscr = null;
    //EXobli = null;
    EXvideoarea = null;
    EXcomelist = null;
    EXfootcount = null;
    //DOM監視停止
    commentObserver.disconnect();
}
function allowChannelNumMaker() {
//console.log("allowChannelNumMaker");
    if (settings.allowChannelNames.length == 0) return 2;
    var u = "https://abema.tv/timetable/channels/";
//    var jo = $('[class^="styles__channel-content-header___"]').children('[class^="styles__channel-icon-header___"]');
    var eaHead=$(EXTThead).children("a");
    if (eaHead.length == 0) return -2;
    var n = [];
    for (var i = 0, f, h, c; i < eaHead.length; i++) {
        if ((h = eaHead.eq(i).prop("href")) && h.indexOf(u) == 0) {
            c = h.replace(u, "");
//console.log("c="+c);
            if (settings.allowChannelNames.includes(c)) {
                n.push(i);
            }
        }
    }
    if (n.length == 0) return -1;
    var b = false;
    if (n.length == allowChannelNum.length) {
        b = true;
        for (let i = 0; i < n.length; i++) {
            if (n[i] != allowChannelNum[i]) {
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
//console.log("timetableCss");
    $('head>link[title="usermade"]').remove();
    var t = "";
    var ts = "";
    var to,tp;
    var selBody, selHead, selTime, selPTitle, selBodyS;
    var eo,ep;
    var m;
    var alt=false;

    //番組タイトルが少ない状態だとうまく取れないが今の遅延適用される状態(ch列が少し溜まるまでこのcssが生成されない)のがうまいこと効いてる
    selPTitle=getTTProgramTitleClass();
    if(!selPTitle){
        console.log("?番組タイトルclass "+to);
        selPTitle=alt?'.ok_bq':'';
    }else selPTitle='.'+selPTitle;

    selBody=dl.getElementSingleSelector(EXTTbody);
    if($(selBody).length!=1){
        console.log("?EXTTbody "+selBody);
        selBody=alt?'.pi_pk':"";
    }

    if (settings.isExpandFewChannels) {
        //横長さ制限があるのはfuturetitleのpだけだが仕様変更に備えて全てのpに適用しておく
        //futuretitleだけに適用する場合はgetTTTimeClassとかでがんばる
        if(selBody) t += selBody+' p{width:100%;padding-right:1em;}';

        //横幅100%から左端～時間軸の右端と右のスクロールバーの分(適当)を引いた幅にする
        //真面目にやるならexttbodyから上がっていってoverflowがvisibleでない要素(またはsideLの兄弟)のclientWidthを取ればスクロールバーまでバッチリ取れるかも
        m=EXTTtime?EXTTtime.getBoundingClientRect().right+19:265;
        ts = 'width:calc((100vw - '+m+'px) / '+allowChannelNum.length+')!important;min-width:176px;';
    }
    if (settings.isChTimetableBreak&&selPTitle) {
        t += selPTitle+'{word-break:break-word;}';
    }

    var c = checkUrlPattern(true);
    if (c == 1) {
        if (allowChannelNum.length > 0) {
            selHead=dl.getElementSingleSelector(EXTThead);
            if($(selHead).length!=1){
                console.log("?EXTThead "+selHead);
                selHead=alt?'.qR_qT ':"";
            }
            if(selHead) t += selHead+'>a{display:none;}';
            if(selBody) t += selBody+'>div{display:none;}';
            for (var i = 0, j; i < allowChannelNum.length; i++) {
                j = allowChannelNum[i] + 1;
                if(selHead) t += selHead+'>a:nth-child(' + j + '){display:unset!important;' + ts + '}';
                if(selBody) t += selBody+'>div:nth-child(' + j + '){display:unset!important;' + ts + '}';
            }
        }
        if (!timetableClasses.timebar) {
            selTime = getTTtimebarElement(true);
            if ($(selTime).length != 1) {
                console.log("?date-bar " + selTime);
                selTime = alt ? '.i__j3' : "";
            }
        } else selTime = timetableClasses.timebar;
        if (selTime) {
            timetableClasses.timebar = selTime;
            t += selTime + '{pointer-events:none;}';
        }
        //t += '[class^="styles__date-bar___"]{pointer-events:none;}';
//    }else if(c==2){
//        t+='[class^="styles__date-list-header___"]>*{width:calc((100vw - 265px) / 8);min-width:176px;}';
//        t+='[class^="styles__timetable-wrapper___"]>*{width:calc((100vw - 265px) / 8);min-width:176px;}';
    }

    if (settings.isHideArrowButton) {
        if (!timetableClasses.arrow) {
            to = getTTLRArrowContainerElement(true);
            if ($(to).length != 1) {
                console.log("?Arrowbutton " + to);
                to = alt ? '.i__jw' : "";
            }
        } else to = timetableClasses.arrow;
        if (to) {
            timetableClasses.arrow = to;
            t += to + '{visibility:hidden;opacity:0;pointer-events:none;}';
        }
    }
    if (settings.isExpandLastItem) {
        if(selBody) t += selBody+'>div{height:unset;min-height:' + ($(EXTTtime).height()||4320) + 'px;}';//各列の縦長さ制限を外す
        if(selBody) t += selBody+'>div>*:last-child>article{min-height:43px;}';
    }
    if (settings.isHideTodayHighlight) {
        t += '[class*="styles__popup-container___"]{display:none;}'; //todo
    }
    if (settings.isChTimetablePlaybutton) {
        t += '.playbutton:hover{background-color:yellow;}';
    }
    if (settings.isChTimetableWeekend) {
        var r = getSatSun();
        var sat = r[0];
        var sun = r[1];
        if (sat >= 0) {
            t += tp+'>div:nth-child(' + (sat + 1) + ') article:not(.registeredProgs) .w7_mH{background-color:rgba(227,238,255,0.7);}';
            t += tp+'>div:nth-child(' + (sat + 1) + ') article:not(.registeredProgs) .w7_mH:hover{background-color:rgba(222,233,250,0.7);}';
        }
        if (sun >= 0) {
            t += tp+'>div:nth-child(' + (sun + 1) + ') article:not(.registeredProgs) .w7_mH{background-color:rgba(255,227,238,0.7);}';
            t += tp+'>div:nth-child(' + (sun + 1) + ') article:not(.registeredProgs) .w7_mH:hover{background-color:rgba(250,222,233,0.7);}';
        }
    }

    selBodyS = dl.getElementSingleSelector(EXTTbodyS);
    if ($(selBodyS).length != 1) {
        console.log("?EXTTbodyS " + selBodyS);
        selBody = alt ? '.i__jT' : "";
    }
    if (selBodyS) t += selBodyS + '{user-select:none;}';//選択テキストを掴むと移動できないので選択不可にしておく

    $("<link title='usermade' rel='stylesheet' href='data:text/css," + encodeURIComponent(t) + "'>").appendTo("head");
}
function toggleChannel(targetUrl) {
//console.log("toggleChannel url="+targetUrl);
    var t = /\/([^/]+)$/.exec(targetUrl)[1];
    if(t == 'timetable'){
        //ALLを選択した時
        toast("番組表に表示するチャンネルをリセットしました。");
        settings.allowChannelNames = [];
        allowChannelNum = [];
    }else{
        var i = settings.allowChannelNames.indexOf(t);
        var chname = getChannelNameOnTimetable(t);
        if (i < 0) {
            //追加
            toast(chname+"を番組表に表示するチャンネルに追加しました。");
            settings.allowChannelNames.push(t);
        } else {
            //削除
            toast(chname+"を番組表に表示するチャンネルから削除しました。");
            settings.allowChannelNames.splice(i,1);
        }
    }
    console.log(settings.allowChannelNames);
    setStorage({"allowChannelNames": settings.allowChannelNames.join(",")});
    waitforloadtimetable(currentLocation);
}
function waitforloadtimetable(url) {
    var c = checkUrlPattern(true);
    if (c != 1 && c != 2) { clearInterval(timetableRunning); timetableRunning = false; return; }
    if (url != currentLocation) return;
    // 10分インターバル
    if (timetableRunning === false) {
        timetableRunning = setInterval(waitforloadtimetable, 600000, url);
    }
    //if (!settings.isChTimetableExpand && !settings.isChTimetableBreak && !settings.isChTimetableWeekend && !settings.isChTimetablePlaybutton && !settings.timetableScroll) { return; }
    var b = false;
    //    if($('[class^="styles__channel-icon-header___"]').next('[class*="styles__time-table___"]').length>0){
//    if ($('[class*="styles__channel-content-header-wrapper___"]').next('[class*="styles__time-table___"]').length > 0) {
//        var c = $('[class*="styles__col___"]'); //日付の列
//        var t = $('[class^="styles__title___"]'); //タイトル
//        if (c.length > 0 && t.length > 0) {
//            b = true;
//        }
//    }
    var dd=$('div');
    var alt=false;
    $('head>link[title="usermade"]').remove();//要素がdisplay:noneだと探索で大きさが取れないのでまず元に戻す
    var j=dd.map(function(i,e){ //ヘッダ探索、上の方にあって横長くて列の数は7日分くらいより多いやつ
        var b=e.getBoundingClientRect();
        if(b.top<window.innerHeight/4&&b.top>5&&b.left<window.innerWidth/3&&b.width>window.innerWidth/2&&b.height<window.innerHeight/3&&e.childElementCount>5)return e;
    });
    if(j.length>0) EXTThead=j[0];
    else if(alt){
        j=$('.rT_r1').children("div");
        if(j.length>0) EXTThead=j[0];
    }
    if(!EXTThead){
        console.log("?EXTThead");
        EXTThead=null;
    }

    j=dd.map(function(i,e){
        var b=e.getBoundingClientRect(); //ボディ探索、でかいやつ(ただしチャンネル選択時に幅を調整するので幅では判定しない)でdiv>div>articleがあるやつ left判定で左CHリスト幅の226を引く
        if(b.top<window.innerHeight/4&&(b.left-226)<window.innerWidth/4&&b.height>window.innerHeight/2&&$(e).children("div").length>5&&$(e).find('div>div>article').length>0)return e;
    });
    if(j.length>=0) EXTTbody=j[0];
    else if(alt){
        j=$('.pi_pk');
        if(j.length>0) EXTTbody=j[0];
    }
    if(!EXTTbody){
        console.log("?EXTTbody");
        EXTTbody=null;
    }

    j=dd.map(function(i,e){ //番組詳細探索、右にあるやつ
        var b=e.getBoundingClientRect();
        if($(e).css("position")=="fixed"&&!isNaN(parseInt($(e).css("z-index")))&&parseInt($(e).css("z-index"))>0&&b.top<window.innerHeight/4&&b.left>window.innerWidth/2&&b.width<window.innerWidth/2&&b.width>50&&b.height>window.innerHeight*2/3)return e;
    });
    if(j.length>0)EXTTsideR=j[0];
    else if(alt){
        j=$('.rT_sL');
        if(j.length>0) EXTTsideR=j[0];
    }
    if(!EXTTsideR){
        console.log("?EXTTsideR");
        EXTTsideR=null;
    }

    j=$('a[href$="/timetable"]'); // 番組表リンク(ALL)をsideLとする
    if(j.length>=2){
        j=j.eq(1); //ヘッダの番組表リンクは除く
        while(j.prop("tagName").toUpperCase()!="BODY"&&j.children().length<5) j=j.parent();
        if(j.children().length>=5) EXTTsideL=j[0];
    }
    if(!EXTTsideL && alt){
        j=$('.rT_sq ul');
        if(j.length>0) EXTTsideL=j[0];
    }
    if(!EXTTsideL){
        console.log("?EXTTsideL");
        EXTTsideL=null;
    }

    if(EXTTbody){
        j=$(EXTTbody);
        while(j.prop("tagName").toUpperCase()!="BODY"&&j.css("overflow")=="visible"&&!j.siblings().is(EXTTsideL)) j=j.parent();
        if(j.css("overflow")!="visible") EXTTbodyS=j[0];
    }
    if(!EXTTbodyS && alt){
        j=$('.rT_ss');
        if(j.length>0) EXTTbodyS=j[0];
    }
    if(!EXTTbodyS){
        console.log("?EXTTbodyS");
        EXTTbodyS=null;
    }

    j=dd.map(function(i,e){ //timetable-axis
        var b=e.getBoundingClientRect();
        if(b.top<window.innerHeight/3&&b.left<window.innerWidth/3&&b.width<50&&b.height>window.innerHeight*2/3&&e.childElementCount>20)return e;
    });
    if(j.length>0) EXTTtime=j[0];
    else if(alt){
        j=$('.pi_eR');
        if(j.length>0) EXTTtime=j[0];
    }
    if(!EXTTtime){
        console.log("?EXTTtime");
        EXTTtime=null;
    }

    if (EXTThead!=null && EXTTbody!=null && EXTTsideR!=null&&EXTTsideL!=null&&EXTTtime!=null &&EXTTbodyS!=null) {
        addExtClass(EXTThead, 'tt-head');
        addExtClass(EXTTbody, 'tt-body');
        addExtClass(EXTTsideR, 'tt-side-r');
        addExtClass(EXTTsideL, 'tt-side-l');
        addExtClass(EXTTtime, 'tt-time');
        addExtClass(EXTTbodyS, 'tt-body-s');
        allowChannelNumMaker();
//        if (currentLocation.indexOf("https://abema.tv/timetable/channels/") == 0) {
        if (c == 2) {
            setTimeout(timetablechfix, 100);
//        } else if (currentLocation.match(/^https:\/\/abema\.tv\/timetable(?:\/dates\/.+)?$/)) {
        } else if (c == 1) {
            setTimeout(timetabledtfix, 100);
        }
        setTimeout(timetableCommonFix, 100);
        //番組表クリックで右詳細に通知登録ボタン設置
        $(EXTTbody).click(function(e){ // 掴んでスクロールした場合番組詳細は開かないことにする
            if(!timetableGrabbing.scrolled){
                setTimeout(function(){
                    var jSideR1 = $(EXTTsideR); 
                    var sideDetailDivClass = jSideR1.children().attr('class');
                    var jSideR2 = jSideR1.siblings(':has(div.'+sideDetailDivClass+')');
                    if (jSideR1.css('z-index')<jSideR2.css('z-index')){
                        EXTTsideR = jSideR2[0];
                        addExtClass(EXTTsideR, 'tt-side-r');
                    }
                    putSideDetailNotifyButton();
                    if (settings.isPutSideDetailHighlight) {
                        putSideDetailHighlight();
                    }
                    //右詳細が溢れてもスクロールできるように
                    $(EXTTsideR).css('overflow-y', 'auto');
                },100);

                //console.log("putSideDetail*");
            }else{
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            //console.log('EXTTbody clicked',e,timetableGrabbing.scrolled)
        });
        timetableCss();
        //$('div')を取ってきてあるのでここで使う 拡張のtoastとTimetableViewerスクリプトは除外する
        dd.map(function(i,e){if($(e).css("z-index")>10 && e.className.indexOf('ext-toast')<0 && e.id.indexOf('TimetableViewer')<0)return e;}).css("z-index","-1");

        //番組表を掴んでドラッグする
        timetableGrabbing.test=false;
        timetableGrabbing.value=false;
        $(EXTTbodyS).mouseleave();
        if(timetableGrabbing.test==false){
            $(EXTTbodyS).mouseleave(function(){
                timetableGrabbing.test=true;
                timetableGrabbing.value=false;
                timetableGrabbing.scrolled=false;
            })
            .mouseup(function(e){timetableGrabbing.value=false;})
            .mousedown(function(e){
                if(e.buttons==1){ // 左クリックだけの場合掴む
                    timetableGrabbing.value=true;
                    timetableGrabbing.cx=e.clientX;
                    timetableGrabbing.cy=e.clientY;
                    timetableGrabbing.sx=$(EXTTbodyS).scrollLeft();
                    timetableGrabbing.sy=$(EXTTbodyS).scrollTop();
                    timetableGrabbing.scrolled=false;
                }else{
                    //timetableGrabbing.value=false;
                    //timetableGrabbing.scrolled=false;
                }
            })
            .mousemove(function(e){ // 掴んで少し移動したらスクロール
                if(timetableGrabbing.value==false||e.buttons!=1){
                    //timetableGrabbing.scrolled=false;
                }else{
                    if(timetableGrabbing.scrolled==false&&(Math.abs(timetableGrabbing.cx-e.clientX)>10||Math.abs(timetableGrabbing.cy-e.clientY)>10)) timetableGrabbing.scrolled=true;
                    if(timetableGrabbing.scrolled){
                        $(EXTTbodyS).scrollLeft(timetableGrabbing.sx+timetableGrabbing.cx-e.clientX)
                            .scrollTop(timetableGrabbing.sy+timetableGrabbing.cy-e.clientY)
                        ;
                    }
                }
            });
        }
    } else {
        console.log("retry waitforloadtimetable");
        setTimeout(waitforloadtimetable, 500, url);
    }
}
function putSideDetailHighlight() {
    var sideDetailWrapper = $(EXTTsideR); 
    if (sideDetailWrapper.length == 0 || sideDetailWrapper.offset().left > window.innerWidth - 50) return;
    sideDetailWrapper.css("overflow-x", "").find('p[class="addedHighlight"]').remove();
    var fp = sideDetailWrapper.find('p');//番組詳細,タイトル,日時,見逃し云々?
    if (fp.length < 2) return;
    var progTitle = fp.eq(1).text();

    var selPTitle = getTTProgramTitleClass();
    if (!selPTitle) return;
    var searchTarget = $(EXTTbody).find('.' + selPTitle);
    var highlightString = "";
    for (var i = 0, t, s; i < searchTarget.length; i++) {
        t = searchTarget.eq(i).text();
        if (t != progTitle) continue;
        highlightString = searchTarget.eq(i).parentsUntil('p').parent('p').next('p').text();
        break;
    }
    if (!highlightString) return;
    $('<p class="addedHighlight" style="line-height:19px;font-size:12px;margin-top:20px;">' + highlightString + '</p>').appendTo(sideDetailWrapper.children().last());
    sideDetailWrapper.css("overflow-x", "hidden");
}
function timetabledtfix() {
    if (EXTThead.childElementCount > EXTTbody.childElementCount){
        console.log('retry timetabledtfix()');
        setTimeout(timetabledtfix, 500);
        return;
    }
    //console.log("timetabledtfix");
    //日付別番組表
    //今はオプション1つのみだがチャンネル別のコピー
    var ce = false;
    var t = '';
    if (settings.isChTimetablePlaybutton) {
        ce = true;
//        t += '.playbutton:hover{background-color:yellow;}';
    }
//    if (t.length > 0) {
//        $('head>link[title="usermade"]').remove();
//        $('<link title="usermade" rel="stylesheet" href="data:text/css,' + encodeURI(t) + '">').appendTo("head");
//    }
    if (ce) {
        timetabledtloop();
    }
    console.log(allowChannelNum);
    var channelLink = $(EXTThead).children('a').eq(0);
    var chLinkWidth = 176;
    var isTimetableScroll = false;
    if (settings.timetableScroll != "") {
        channelLink = $(EXTThead).children('a[href$="/timetable/channels/' + settings.timetableScroll + '"]');
        if (channelLink.length > 0) {
            isTimetableScroll = true;
        } else {
            channelLink = $(EXTThead).children('a').eq(0);
            console.warn("timetable scroll error. (channelLink not found: チャンネル名が正しくないか仕様変更)");
        }
    }
    var chLinkIndex = channelLink.index();
    chLinkWidth = $(EXTTbody).children().eq(chLinkIndex).outerWidth();//channelLink.width();
    var visibleChLinkIndex = chLinkIndex;
    var axisWidth = $(EXTTtime).width();
    let timetableWidth;
    if (allowChannelNum.length > 0) {
        //chLinkWidth = $(EXTTbody).children().eq(allowChannelNum[0]).width();//channelLink.siblings().eq(allowChannelNum[0]).width();//allowChannelに含まれないチャンネルのchannelLinkから幅を取得するとずれる
        if (isTimetableScroll){
            visibleChLinkIndex = 0;
            for(var i = 0; i < allowChannelNum.length; i++){
                if (allowChannelNum[i] < chLinkIndex) {
                    visibleChLinkIndex++;
                }else {
                    break;
                }
            }
            $(EXTTbody).parent().parent().parent().parent().scrollLeft(Math.min(chLinkWidth * visibleChLinkIndex, chLinkWidth*allowChannelNum.length-$(EXTTbodyS).width()+axisWidth));
        }
        if (!settings.isExpandFewChannels) {
            timetableWidth = axisWidth + chLinkWidth * allowChannelNum.length;
        } else {
            timetableWidth = axisWidth + chLinkWidth * EXTThead.childElementCount;
        }
    } else {
        if (isTimetableScroll) {
            $(EXTTbody).parent().parent().parent().parent().scrollLeft(chLinkWidth * visibleChLinkIndex);
        }
        timetableWidth = axisWidth + chLinkWidth * EXTThead.childElementCount;
    }
    //番組表幅の調整
    //console.log(timetableWidth)
    $(EXTThead).parent().innerWidth(timetableWidth);
    $(EXTTbodyS).children().width(timetableWidth)
        .children('div').last().width(timetableWidth);

    //左チャンネル一覧にチェックボックス設置
    var channelsli = $(EXTTsideL).children("li");
    if(channelsli.length == 0){console.warn('channelsli');}
    channelsli.each(function (i, li){
        // if(i == 0){return;}
        // i--;
        li = $(li);
        var checkbox = li.children('input');
        if(checkbox.length == 0){
            checkbox = $('<input type="checkbox" class="usermade chlicheckbox" style="display:inline-block;margin:'+(isFirefox?7:8)+'px;height:12px;vertical-align:middle;" title="拡張機能のチャンネル表示切替">').appendTo(li);
            checkbox.click(function (e){
                toggleChannel(e.currentTarget.previousElementSibling.getAttribute('href'));
            });
        }
        if(i == 0){
            checkbox.prop('checked', allowChannelNum.length == 0);
            checkbox.prop('disabled', allowChannelNum.length == 0);
        }else{
            checkbox.prop('checked', hasArray(allowChannelNum, i - 1));
        }
        li.children('a').css('display', 'inline-block').css('width', 'calc(100% - '+(16+checkbox.width())+'px)');
    });
}
function timetabledtloop() {
    if (checkUrlPattern(true) != 1) return;
    if (!settings.isChTimetablePlaybutton) return;
    if (settings.isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetabledtloop, 1000);
}
function timetablechfix() {
    //console.log("timetablechfix");
    //チャンネル別番組表
    var ce = false; //定期実行するかどうか
//    if (settings.isChTimetableExpand) {
//        ce = true; //現在時刻の横棒の位置を直す
//        setTimeout(TimetableExpander, 500, 0); //playbutton設置(timetablechloop)によって隠れる分も考慮してそれより後に実行するようにset
//    }
    //削除できるようにtitleを付けているせいかusermade以降の追加cssが適用されないので全て纏めてからusermadeに適用する
    //setoptionheadも同様
//    var t = '';
//    if (settings.isChTimetableBreak) {
//        t += '[class^="styles__title___"]{word-break:break-word;}';
//    }
    if (settings.isChTimetablePlaybutton) {
        //再生ボタンの設置場所(放送中の緑色枠)は移動するので定期実行にて削除,設置する
        ce = true;
//        t += '.playbutton:hover{background-color:yellow;}';
    }
//    if (t.length > 0) {
//        $('head>link[title="usermade"]').remove();
//        $('<link title="usermade" rel="stylesheet" href="data:text/css,' + encodeURIComponent(t) + '">').appendTo("head");
//    }
    if (ce) {
        timetablechloop();
    }
}
function getSatSun() {
//    if (settings.isChTimetableWeekend) {
//        var h = $('[class*="styles__date-list-header___"]').children();//styles__date-list-header-inner___
    var h = $(EXTThead).children('a[href*="/timetable/dates/"]');
    var sat = -1;
    var sun = -1;
    for (var i = 0; i < h.length; i++) {
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
                if (i - 1 == 0) {
                    break;
                } else if (i > 1) {
                    sat = i - 2;
                    break;
                }
            }
        }
    }
//        if (sat >= 0) {
//            t += '[class^="styles__timetable-wrapper"]>div[class^="styles__col___"]:nth-child(' + (sat + 1) + ') [class*="style__status-future___"]{background-color:rgba(227,238,255,0.7);}';
//            t += '[class^="styles__timetable-wrapper"]>div[class*="styles__col___"]:nth-child(' + (sat + 1) + ') [class*="style__status-future___"]:hover{background-color:rgba(222,233,250,0.7);}';
//        }
//        if (sun >= 0) {
//            t += '[class^="styles__timetable-wrapper"]>div[class*="styles__col___"]:nth-child(' + (sun + 1) + ') [class*="style__status-future___"]{background-color:rgba(255,227,238,0.7);}';
//            t += '[class^="styles__timetable-wrapper"]>div[class*="styles__col___"]:nth-child(' + (sun + 1) + ') [class*="style__status-future___"]:hover{background-color:rgba(250,222,233,0.7);}';
//        }
//    }
    return [sat, sun];
}
/*function TimetableExpander(prevColNum) {
    if (!settings.isChTimetableExpand) { return; }
    var dayCols = $('[class*="styles__col___"]'); //日付の列
    if(dayCols.length == 0 || dayCols.length > prevColNum){//列が出そろうまで待つ
        //console.log("retry TimetableExpander colnum="+dayCols.length+" prev="+prevColNum);
        setTimeout(TimetableExpander, 1500, dayCols.length);
        return;
    }
    //console.log("TimetableExpander() colnum="+dayCols.length+" prev="+prevColNum);
    var progTitles = $('span[class^="styles__title___"]'); //各番組タイトル
    var i = 0, col, titlesInCol;
    for (i = 0; i < dayCols.length; i++) { //列の日付についてのループ
        col = dayCols.eq(i);
        titlesInCol = col.find(progTitles);
        var j, eachTitle, titleHeight, titleWrapper, lessTextClassName, progDiv, progDivHeight, progDivTop, progDivBottomPos, progArticle, progArticleHeight, heightDelta;
        for (j = titlesInCol.length - 1; j >= 0; j--) { //列の中の番組タイトルについてのループ
            eachTitle = titlesInCol.eq(j);
            titleHeight = eachTitle.height();
            titleWrapper = eachTitle.parents('p').css('height', titleHeight + 'px');
            lessTextClassName = (titleWrapper.attr('class').match(/style__less-text___[a-zA-Z0-9]+/)||[""])[0];
            titleWrapper.removeClass(lessTextClassName);//省略されたタイトル等につくclassを除去
            progDiv = col.children().has(eachTitle);
            progDivTop = progDiv.offset().top;
            progDivHeight = progDiv.height();
            progDivBottomPos = progDivTop + progDivHeight;//各番組divの底のtop位置
            progArticle = eachTitle.parents('article');//各番組div内のarticle要素
            //番組articleの前後に空白がある場合、porgDivの位置を設定し直す
            if (progArticle.prev().is('[class^="styles__suspension-item___"]')) { //suspension-itemは番組表の空白埋めdivで連接する番組のarticleと兄弟(例えばその日最初の番組の前に前日からの日越し番組があるとその部分がその日の番組表では空白になる)
                progDivTop = progArticle.offset().top;
            }
            if (progArticle.next().is('[class^="styles__suspension-item___"]')) {
                progDivBottomPos = progArticle.next('[class^="styles__suspension-item___"]').offset().top - 1;
            }
            progDivHeight = progDivBottomPos - progDivTop;
            var progArticleHeight = parseInt(progArticle.css("height"));
            var heightDelta = titleHeight + 24 - progArticleHeight;//枠を広げた高さの差 24という数字はタイトルのpaddingの上下計(上8px,下8+8px)
            if (heightDelta <= 0) { continue; }
            var axisItems = $('[class^="styles__time-axis-item___"]');//時刻軸のメモリ
            var v, axisItem, axisItemHeight, axisItemBottom;
            for (v = 0; v < axisItems.length; v++) {//時刻軸のメモリ0-23時ループ
                axisItem = axisItems.eq(v);
                axisItemHeight = parseInt(axisItem.css("height"));
                axisItemBottom = axisItem.offset().top + axisItemHeight + 1;
                if (axisItemBottom >= progDivBottomPos) {
                    axisItem.css("padding-top", (parseInt(axisItem.css("padding-top")) + Math.floor(heightDelta / 2)) + "px")
                        .css("height", (axisItemHeight + heightDelta) + "px")
                        ;
                    break;
                }
            }
            var u = 0, col_u_items, heightDelta_u, progDivHeight_u
            for (u = 0; u < dayCols.length; u++) {//日付列についてのループ(番組タイトルについてのループの中)
                col_u_items = dayCols.eq(u).children();
                heightDelta_u = heightDelta;
                progDivHeight_u = progDivHeight;
                var v, coluItem, coluItemChildren
                for (v = col_u_items.length - 1; v >= 0; v--) {//番組毎divについてのループ
                    coluItem = col_u_items.eq(v);
                    coluItemChildren = coluItem.children();
                    var w, hm, coluItemChiTop, coluItemBottomPos, coluItemArticle;
                    for (w = coluItemChildren.length - 1; w >= 0; w--) {//番組毎divの子供についてループ
                        if (coluItemChildren.length > 1) {
                            coluItemChiTop = coluItemChildren.eq(w).offset().top;
                            if (w == coluItemChildren.length - 1) {
                                coluItemBottomPos = coluItem.offset().top + coluItem.height();
                            } else {
                                coluItemBottomPos = coluItemChiTop + parseInt(coluItemChildren.eq(w).css("height"));
                            }
                        } else {
                            coluItemChiTop = coluItem.offset().top;
                            coluItemBottomPos = coluItemChiTop + coluItem.height();
                        }
                        hm = Math.min(progDivBottomPos, coluItemBottomPos) - Math.max(progDivTop, coluItemChiTop);
                        //console.log("i="+i+",j="+j+",u="+u+",v="+v+",w="+w+",text="+coluItem.find(progTitles).text()+",cucvot="+coluItemChiTop+",cucvob="+coluItemBottomPos+",hm="+hm);
                        if (hm > 0) {
                            if (w < coluItemChildren.length - 1) {
                                coluItemArticle = coluItemChildren.eq(w);
                            } else {
                                coluItemArticle = coluItem.children('article');
                            }
                            var hn = Math.round(heightDelta * hm / progDivHeight);
                            progDivHeight_u -= hm;
                            if (progDivHeight_u <= 0) {
                                hn = heightDelta_u
                            } else {
                                heightDelta_u -= hn;
                            }
                            coluItemArticle.css("height", (parseInt(coluItemArticle.css("height")) + hn) + "px");
                        }
                    }
                }
            }
        }
    }
    var nd = new Date;
    var nh = nd.getHours();
    $('body').scrollTop($('[class^="styles__time-axis-item___"]').eq(nh).offset().top - 160);
}*/
function timetablechloop() {
    //URL変わったら終われるようにURLチェック
    if (checkUrlPattern(true) != 2) return;
//    if (!settings.isChTimetableExpand && !settings.isChTimetablePlaybutton) { return; }
    if (!settings.isChTimetablePlaybutton) return;
//    if (settings.isChTimetableExpand) {
//        //現在時刻の赤棒の位置変更
//        var nd = new Date;
//        var nh = nd.getHours();
//        var nm = nd.getMinutes();
//        var jo = $('[class^="styles__time-axis-item___"]').eq(nh);
//        var jh = parseInt(jo.css("height"));
//        $('[class^="TimeTableContainer__date-bar___"]').css("top", (jo.offset().top - 170 + jh * (nm / 60)) + "px")
//            .css("pointer-events", "none") //特に再生ボタンと重なると邪魔、この赤棒はクリックできなくても別に問題無さそう
//            ;
//    }
    if (settings.isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetablechloop, 1000);
}
function PlaybuttonEditor() {
    if (!settings.isChTimetablePlaybutton) return;
    if(/^https:\/\/abema\.tv\/timetable\/dates\/.+$/.test(currentLocation)) return;//当日を除く日付別番組表では実行しない
    //放送中の緑枠のclassを取得
    var fisrtChDivs = EXTTbody.firstElementChild.childNodes;
    var presentClass = '';
    var clsArr = [];
    //一つのチャンネルの一日分番組divを取得しそのarticle>button>divのclass名が仲間はずれのものが放送中のclass
    for (var i=0,cls,flg=true; i<fisrtChDivs.length; i++) {
        cls=$(fisrtChDivs[i]).find('article>button>div').attr('class');
        flg=true;
        for (var j=0; j<clsArr.length; j++) {
            if (clsArr[j][0]==cls) {clsArr[j][1]++;flg=false;}
        }
        if (flg) {
            clsArr.push([cls,1]);
        }
    }
    if (clsArr.length==3&&clsArr[1][1]==1) {
        presentClass = clsArr[1][0];
    } else if (clsArr.length==2) {
        if (clsArr[0][1]==1) presentClass = clsArr[0][0];
        else if (clsArr[1][1]==1) presentClass = clsArr[1][0];
    }
    if (presentClass.length==0) {
        console.warn('?presentClass failed');
        return;
    }
    var presentSelector = '.'+presentClass.split(' ').join('.');
    //放送中の緑枠の移動に合わせて再生ボタンを削除、設置する
    var p = $(presentSelector); //放送中の緑色枠
    var b = $('.playbutton');
    var c = $(EXTThead).children(); //channel link
    var cr = /^https:\/\/abema\.tv\/timetable\/channels\/(.+)$/;
    var dr = /^https:\/\/abema\.tv\/timetable(?:\/dates\/.+)?$/;
    var umc = currentLocation.match(cr);
    var umd = currentLocation.match(dr);
    var pn = -1;
    var bn = -2;
    var titleClass = getTTProgramTitleClass();
    for (let i = b.length - 1, d, s; i >= 0; i--) {
        d = b.eq(i).parent('a');
        s = d.siblings();
        if (!s.is(presentSelector)) {
            //設置済ボタン位置が緑枠でなければボタン削除
            s.find('.'+titleClass).parents('p').css("width", "");
            d.remove();
        }
    }
    for (let i = 0, j, q, a, u, iumc; i < p.length; i++) {
        q = p.eq(i);
        if (umc && umc.length > 1 && umc[1].length > 0) {
            //チャンネル別番組表ならボタンのリンク先はURLから取得
            u = '/now-on-air/' + umc[1];
        } else if (umd && umd.length > 0 && c.length > 0) {
            //日付別番組表ならアイコンのリンクから取得
            j = $(EXTTbody).children().has(q).index(); //列のindex
            iumc = c.eq(j).prop("href").match(cr);
            if (iumc && iumc.length > 1 && iumc[1].length > 0) {
                u = '/now-on-air/' + iumc[1];
            } else {
                u = '';
            }
        } else {
            //何か変な場合はトップページへ飛ぶようにする
            u = '';
        }
        if (!q.siblings().children().is('.playbutton')) {
            //緑枠にボタンがなければ設置
            q.find('.'+titleClass).parents('p').css("width", "86px");
            a = '<a href="javascript:location.href=\'https://abema.tv' + u + '\';" title="放送中画面へ移動">';
            a += '<div class="playbutton" style="position:absolute;right:30px;top:4px;width:24px;height:24px;border:1px solid #6fb900;border-radius:50%;">';
            a += '<svg width="10" height="14" style="fill:#6fb900;transform:translate(1px,3px)">';// 以前は7px,3px
            a += '<use xlink:href="/images/icons/playback.svg#svg-body">';
            a += '</use></svg></div>';
            a += '</a>';
            $(a).insertAfter(q);
            $('.playbutton').on("click", function (e) {
                //普通の左クリックのみ移動、特殊クリックの場合はその操作に従う(移動しない)
                //console.log(e);
                if (e.which == 1 && e.altKey == false && e.ctrlKey == false && e.shiftKey == false) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    // 番組表ページから直接放送画面へ飛ぶボタンがないため以下の関数は使用せずlocation.hrefで移動する
                    //clickPlaybuttonBack(e.currentTarget);//←↓この2関数はコメントアウトされている
                    //waitformakelink(50);
                    //再生ボタンのある番組をクリックして右詳細の番組画像をクリック
                    //console.log(e.currentTarget);
                    clickElement($(e.currentTarget).parents('button'));
                    setTimeout(clickElement,10,$(EXTTsideR).find('a[href^="/now-on-air/"]')); //todo
                }
            });
        }
    }
}
/*function clickPlaybuttonBack(eo) {
    console.log("clickPlaybuttonBack", eo);
    var jo = $(eo).parent('a').siblings('a');
    if (jo.length == 0) { return; }
    var teka = document.createEvent("MouseEvents");
    teka.initMouseEvent("click", true, true, window);
    //console.log("dispatch");
    return jo[0].dispatchEvent(teka);
}*/
function clickElement(jo) {//clickOnairLink(jo)
    //console.log("clickElement", jo);
    var teka = document.createEvent("MouseEvents");
    teka.initMouseEvent("click", true, true, window);
    //console.log("dispatch");
    return jo[0].dispatchEvent(teka);
}
/*function waitformakelink(retrycount) {
    console.log("waitformakelink#" + retrycount);
    var jo = $('[class*="styles__contents___"]').find('[class^="styles__link___"]');
    if (jo.length > 0 && /^https:\/\/abema.tv\/now-on-air\//.test(jo.prop("href"))) {
        //console.log("jo.len="+jo.length+",jo.href="+jo.prop("href"));
        clickElement(jo);
    } else if (retrycount > 40) {
        setTimeout(waitformakelink, 20, retrycount - 1);
    } else if (retrycount > 30) {
        setTimeout(waitformakelink, 80, retrycount - 1);
    } else if (retrycount > 20) {
        setTimeout(waitformakelink, 200, retrycount - 1);
    } else if (retrycount > 10) {
        setTimeout(waitformakelink, 1000, retrycount - 1);
    } else if (retrycount > 0) {
        setTimeout(waitformakelink, 2000, retrycount - 1);
    }
}*/
function timetableCommonFix(retrycount) {
    var progArticle, progTitle;
//    var cols = $('[class*="styles__col___"]');
//    if(cols.length == 0 || cols.length > prevColNum){ //列が出そろうまで待つ
//        //console.log("retry timetableCommonFix colnum="+cols.length+" prev="+prevColNum);
//        setTimeout(timetableCommonFix, 1000, cols.length);
//        return;
//    }
//読込に1秒以上かかる場合を考慮し、ヘッダと列の数を見るようにしてみる
    var cols = $(EXTTbody).children("div").map(function(i,e){if($(e).width()>50&&$(e).height()>window.innerHeight*2/3)return e;});
    var c = checkUrlPattern(true);
//    var j = $('[class^="styles__channel-content-header___"]');
//    var h;
//    if (c == 1) {
//        h = '[class^="styles__channel-icon-header___"]';
//    } else if (c == 2) {
//        h = '[class^="styles__date-list-header___"]';
//    }
    if (cols.length < EXTThead.childElementCount){
        setTimeout(timetableCommonFix, 1000);
        return;
    }

    //別の日のページへの遷移直後は前の読込済表示が残っている(cols.len=head.childcount)ので更新を待つ必要がある
    //とりあえず最後の番組のarticleにtitleが付いてたら残ってることにしてリトライする
    if (cols.last().children().last().find("article").attr("title")) {
        if (retrycount === undefined) retrycount = 5;
        if (retrycount > 0) setTimeout(timetableCommonFix, 1000, retrycount - 1);
    }

    //番組タイトルをtitle要素にする
    var selPTitle = getTTProgramTitleClass();
    var selICont = getTTProgramTimeClasses()[1];
    var jt, jp, jf;
    cols.each(function(){
        $(this).children().each(function(){
            //番組毎divについてのループ
            progArticle = $(this).find("article");
            jt = progArticle.find('.' + selPTitle);
            progTitle = jt.text();
            //progTitle = progArticle.find('span[class^="styles__title___"]').text();
            progArticle.attr("title", progTitle);

            if (settings.isReplaceIcons && selICont) {
                jp = jt.siblings("span,svg");
                if (jp.length > 0) {
                    jf = progArticle.find('.' + selICont);
                    if (jf.length > 0) {
                        jp.each(function () {
                            $(this).appendTo(jf);
                        });
                    }
                }
            }
        });
    });
    setRegistProgsBackground();

}
//拡張機能通知登録済みの番組に背景をつける
function setRegistProgsBackground(){
    getStorage(null, function(values){
        var programIDs = [];
        for (var key in values) {
            if (key.indexOf("progNotify")==0) {//通知登録データ
                programIDs.push(values[key].programID);
                //登録済みなのでclass追加
                $('#'+values[key].programID).closest('article').addClass('registeredProgs');
            }
        }
        //登録されてないのに背景がついてる番組のclass解除
        $('.registeredProgs').each(function(){
            var article = $(this);
            var progID = article.find('input[type=checkbox]').attr('id');
            if(!hasArray(programIDs, progID)){
                article.removeClass('registeredProgs');
            }
        });
    });
}
function getChannelNameOnTimetable(channel) { //番組表ページのチャンネルリストを利用してチャンネル名を得る
    var hrefStr = "/timetable/channels/" + channel;
    if (EXTTsideL != null) return $(EXTTsideL).find('a[href$="' + hrefStr + '"]').text();
    else return $('.i__jP ul').find('a[href$="' + hrefStr + '"]').text();
}

function onresize(oldTranslate) {
    if (checkUrlPattern(true) != 3) return;
    //console.log("onresize()");

    var mode43=settings.isDAR43;
    var resizeType = (settings.isResizeScreen ? 2 : 0)+(mode43?1:0);//0:左枠内で中央,1:左枠内で最大(4:3用),2:ウィンドウ内で最大,3:ウィンドウ内で最大(4:3用),
    var posiVType = settings.isMovieSpacingZeroTop ? 1 : (settings.isResizeSpacing ? 2 : 0);//0:上下内で中央,1:上端,2:上端+head
    var posiHType = settings.isMovieSpacingZeroLeft ? 1 : 0;//0:左端,1:左端(4:3用)
    if ($('#settcont').css("display") != "none") {
        mode43=$('#isDAR43').prop("checked");
        resizeType = +$('#movieResizeContainer input[type="radio"][name="movieResizeType"]:checked').val()*2+(mode43?1:0);
        posiVType = +$('#moviePositionContainer input[type="radio"][name="moviePositionVType"]:checked').val();
        posiHType = +$('#moviePositionContainer input[type="radio"][name="moviePositionHType"]:checked').val();
    }

    var tar=$(getElm.getVideo());
    if (tar.isEmpty()) return;
    tar=tar.first();//.parent();
    var ori=tar.parent();
    var o={w:{l:ori.offset().left,t:ori.offset().top,w:ori.width(),h:ori.height(),},v:{l:-1,t:-1,w:-1,h:-1,},};
    var t={w:{l:-1,t:-1,w:-1,h:-1,},v:{l:-1,t:-1,w:-1,h:-1,},};
    o.v.h=9*o.w.w>=16*o.w.h?o.w.h:o.w.w*9/16;
    o.v.w=Math.min(o.w.w, o.v.h*(mode43?4/3:16/9));
    o.v.t=o.w.t+(o.w.h-o.v.h)/2;
    o.v.l=o.w.l+(o.w.w-o.v.w)/2;

    var hh=posiVType==2&&EXhead?$(EXhead).height():0;
    var zz=resizeType==0?100:Math.min(100*(resizeType==1?o.w.w:window.innerWidth)/o.v.w,100*(window.innerHeight-hh)/o.v.h);
    t.v.w=o.v.w*zz/100;
    t.v.h=o.v.h*zz/100;
    t.w.w=tar.width();//t.w.w=t.v.h*16/9;
    t.w.h=tar.height();//t.w.h=t.v.h;
    t.w.l=o.w.l;
    t.w.t=o.w.t;
    t.v.l=t.w.l+(t.w.w-t.v.w)/2;
    t.v.t=t.w.t+(t.w.h-t.v.h)/2;
    //tar.css("width",t.w.w+"px").css("height",t.w.h+"px");//px指定だと各ウィンドウ開閉時の自動リサイズ時にズレる(movieWidthで監視するから問題無さそうだけど一応%指定にしておく)
    tar.css("width",zz+"%").css("height",zz+"%");
    //console.log("tar", tar, zz, o, t)

    var r = tar[0].style.transform.replace(/\s*translate(X|Y)\([-0-9]*(\.[-0-9e]+)?(px|vw|%)\)/g, "").replace(/^\s+|\s+$/g, "");
    switch (posiHType) {
        case 0: r += resizeType > 0 ? " translateX(" + ((window.innerWidth - t.v.w) / 2 - t.v.l) + "px)" : ""; break;
        case 1: r += " translateX(" + (-t.v.l) + "px)"; break;
    }
    switch (posiVType) {
        case 0: r += resizeType > 0 ? " translateY(" + ((window.innerHeight - t.v.h) / 2 - t.v.t) + "px)" : ""; break;
        case 1: r += " translateY(" + (-t.v.t) + "px)"; break;
        case 2: r += " translateY(" + (hh - t.v.t) + "px)"; break;
    }
    r = r.replace(/^\s+|\s+$/g, "");

    tar.css("transform",r);
    tar.css('transition-delay', '0.4s');
    var isVideoResized = r != oldTranslate; ///translate[XY]\([^0][-0-9e\.]*px\)/.test(r);
    movieWidth=parseInt(tar.width());
    if(isVideoResized){//映像のリサイズが落ち着くまで(translateが落ち着くまで)リトライする
        console.log("screen resizing");//,isVideoResized,r);
        setTimeout(onresize, 1000, r);
    }else{
        console.log('screen resize complete');
        //視聴数の位置調整
        setTimeout(function(){
            if(EXcountview){
                let cvb = EXcountview.getBoundingClientRect();
               // let cvWidth = Math.ceil(cvb.width/2)*2;//2で割り切れるよう切り上げ
                //console.log(cvWidth,$(EXcountview).width())
                //$(EXcountview).width(cvWidth);
                let footer = $(EXfootcome).parent().addClass('countviewtrans');
                $(EXcountview).css({'position': 'fixed', 'margin-bottom': footer.css('margin-bottom'), 'height': footer.height()+'px'}).offset({left: EXfootcome.getBoundingClientRect().left-cvb.width/2-50});
                
                setFooterBGStyle();
            }
        },2000);
    }
}
/*
function onresize() {
    if (checkUrlPattern(true) != 3) { return; }
    //console.log("onresize()");
    //視聴数の位置調整
    setTimeout(function(){
        if(EXcountview){
            $(EXcountview).offset({ top: window.innerHeight - (EXcountview.style.visibility==="hidden"?0:footerHeight) });
            $(EXcountview).offset({left:($(EXfootcome).offset().left-200)});
        }
    },2000);

    var resizeType = settings.isResizeScreen ? 1 : 0;
    var posiVType = settings.isMovieSpacingZeroTop ? 1 : ( settings.isResizeSpacing ? 2 : 0);
    var posiHType = settings.isMovieSpacingZeroLeft ? 1 : 0;
    if ($('#settcont').css("display") != "none") {
        resizeType = +$('#movieResizeContainer input[type="radio"][name="movieResizeType"]:checked').val();
        posiVType = +$('#moviePositionContainer input[type="radio"][name="moviePositionVType"]:checked').val();
        posiHType = +$('#moviePositionContainer input[type="radio"][name="moviePositionHType"]:checked').val();
    }

//    var obj = $("object,video").parent(),
    var obj,
        wd,
        hg,
        wdbyhg,
        newwd,
        newhg;
//    if (obj.length == 0) {
    if(!(obj = getVideo())) {
        //console.log("obj.length==0 -> onresize() return;");
        return;
    }
    if (resizeType == 0 && posiVType == 0 && posiHType == 0) {
        //        obj.css("top","")
        //            .css("left","")
        obj.css("transition", "")
            .css("width", "")
            .css("height", "")
            ;
        obj.parents('[class*="styles__resize-screen___"]').parent().css("transition", "")
            .css("transform", "")
            .css("top", "")
            .css("left", "")
            ;
        //console.log("*Type==0 -> onresize() return;");
        return;
    }
    //元の枠 ウィンドウが縦長の場合は映像サイズと同じ、横長の場合は横が長い
    var objr = obj.parents('[class*="styles__resize-screen___"]');
    if (objr.length == 0) {
        //console.log("objr.length==0 -> onresize() return;");
        return;
    }
    var oldwd = parseInt(objr[0].style.width);
    var oldhg = parseInt(objr[0].style.height);

    //映像を最大化する先の大きさ設定
    if (resizeType == 1) {
        //リサイズする場合、ウィンドウ内で最大化
        wd = window.innerWidth;
        hg = window.innerHeight;
    } else {
        //リサイズしない場合、元のサイズ
        wd = oldwd;
        hg = oldhg;
    }
    if (posiVType == 2 && hg + headerHeight > window.innerHeight) {
        hg = window.innerHeight - headerHeight;
    }

    //映像サイズ設定
    wdbyhg = Math.ceil(hg * 16 / 9); //480*16/9=853.333->854
    if (wd > wdbyhg) {
        //横に余裕がある場合、wdbyhgを適用
        newwd = wdbyhg;
        newhg = hg;
    } else {
        //横に余裕が無い場合、wdbyhgをやめる
        newwd = wd;
        newhg = Math.floor(wd * 9 / 16); //854*9/16=480.375->480
    }

    //newtop設定
    var newtop;
    if (posiVType == 2) {
        newtop = headerHeight;
    } else if (posiVType == 1) {
        newtop = 0;
    } else { //中央合わせ
        newtop = Math.floor((window.innerHeight - newhg) / 2);
    }
    //    if(setBlacked[2]){
    //        newtop+=Math.floor(newhg*(100-settings.CMsmall)/200);
    //}

    //newleft設定
    var newleft;
    if (posiHType == 1) {
        newleft = 0;
    } else { //中央合わせ
        newleft = Math.floor((wd - newwd) / 2);
    }
    //    if(setBlacked[2]){
    //        newleft+=Math.floor(newwd*(100-settings.CMsmall)/200);
    //}

    //transition設定
    if (obj[0].style.transition.length == 0) {
        var objt = ' 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0s';
        obj.css("transition", "width" + objt + ", height" + objt);
        objr.parent().css("transition", "top" + objt + ", left" + objt);
    }

    //console.log("setTimeout onresize2()");
    setTimeout(onresize2, 0, obj, objr, newwd, newhg, newtop, newleft, oldwd, oldhg);
}
function onresize2(obj, objr, newwd, newhg, newtop, newleft, oldwd, oldhg) {
    obj.css("width", newwd + "px")
        .css("height", newhg + "px")
        //        .offset({"top": newtop, "left": newleft})
        ;

    objr.parent().css("transform", "translateY(0)")
        .css("top", newtop)
        .css("left", newleft)
        ;
    //    newtop=obj.offset().top;
    //ここでobjr(.resize-screen)のwidth,heightを取得するとonresize時から変化している場合があるので引数で持ってくる
    movieWidth = oldwd;
    movieHeight = oldhg;
    movieWidth2 = newwd;

    console.log("screen resized");
}
*/
function onScreenDblClick() {
    console.log("dblclick");
    if (comeNGmode == 2) return;
    if (settings.isDblFullscreen) {
        toggleFullscreen();
    }
}
function toggleFullscreen() {
    chrome.runtime.sendMessage({type: 'toggleFullscreen', mode: 'toggle', oldState: oldWindowState}, function(response){
        oldWindowState = response.oldState;
    });
    setTimeout(onresize, 1000);
}
function postShareNGwords(words, channel) {
    var postWords = [];
    for(var i=0; i < words.length; i++) {
        if (!hasArray(postedNGwords, words[i].toString())) {
            postWords.push(words[i].toString());
        }
    }
    if (postWords.length == 0) return;

    var postData = {
        "client": APIclientName,
        "channel": channel,
        "words": postWords
    };
    postedNGwords = postedNGwords.concat(postWords);//重複送信防止のため送信前にpostedに追加する
    postJson(NGshareURLbase + 'add_json.php', postData, {}, function(result) {
        if (result.status == "success") {
            console.log("postShareNGwords success", postWords, channel);
            //postedNGwords = postedNGwords.concat(postWords);
        } else {
            console.log("postShareNGwords failed", result);
        }
    }, function() {
        console.log("postShareNGwords post error");
    });
}
function postShareNGusers(users, channel) {
    var postUsers = [];
    for(var i=0; i < users.length; i++) {
        if (!hasArray(postedNGusers, users[i].toString())) {
            postUsers.push(users[i].toString());
        }
    }
    if (postUsers.length == 0) return;

    var postData = {
        "client": APIclientName,
        "channel": channel,
        "users": postUsers
    };
    postedNGusers = postedNGusers.concat(postUsers);//重複送信防止のため送信前にpostedに追加する
    postJson(NGshareURLbase + 'add_json.php', postData, {}, function(result) {
        if (result.status == "success") {
            console.log("postShareNGusers success", postUsers, channel);
        } else {
            console.log("postShareNGusers failed", result);
        }
    }, function() {
        console.log("postShareNGusers post error");
    });
}
function applySharedNG() {
    var channel = getInfo.getChannelByURL();
    isNGShareInterval = true;
    getJson(NGshareURLbase + "sharedng/" + channel + ".json", { "client": APIclientName }, function (data) {
        if (settings.isShareNGword) {
            var sharedNGwords = data.ngword;
            var appendNGwords = [];
            console.log("got shared NG words ");
            console.table(sharedNGwords);
            for (var asni = 0; asni < sharedNGwords.length; asni++) {
                if (!hasArray(postedNGwords, sharedNGwords[asni].word)) {
                    postedNGwords.push(sharedNGwords[asni].word);
                }
                appendNGwords.push(sharedNGwords[asni].word);
            }
            appendTextNG(null, appendNGwords);
        }
        if (settings.isShareNGuser) {
            var sharedNGusers = data.nguser;
            var appendNGusers = [];
            console.log("got shared NG users ");
            console.table(sharedNGusers);
            for (let asni = 0; asni < sharedNGusers.length; asni++) {
                if (!hasArray(postedNGusers, sharedNGusers[asni].userid)) {
                    postedNGusers.push(sharedNGusers[asni].userid);
                }
                appendNGusers.push(sharedNGusers[asni].userid);
            }
            appendUserNG(null, appendNGusers);
        }
    });
    if (channel) {
        setTimeout(applySharedNG, 300000); //5分毎
    } else {
        isNGShareInterval = false;
    }
}
function arrayFullNgMaker() {
    //自由入力欄からNG正規表現を生成
    arFullNg = [];
    var spfullng = settings.fullNg.split(/\r|\n|\r\n/);
    for (var ngi = 0; ngi < spfullng.length; ngi++) {
        if (spfullng[ngi].length == 0 || spfullng[ngi].match(/^\/\//)) {
            continue;
        }
        spfullng[ngi] = spfullng[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
        var refullng = /^\/(.+)\/([igm]*)$/;
        var rexefullng;
        var b = true;
        if ((rexefullng = refullng.exec(spfullng[ngi])) != null) {
            try {
                spfullng[ngi] = new RegExp(rexefullng[1], rexefullng[2]);
                b = false;
            } catch (e) {
                console.warn(e);
                //                spfullng[ngi]=new RegExp("\\"+spfullng[ngi].split("").join("\\"));
            }
        }
        if (b) {
            spfullng[ngi] = new RegExp(spfullng[ngi].replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1"));
        }
        //console.log(spfullng[ngi]);

        arFullNg.push(spfullng[ngi]);
    }
    if (settings.isShareNGword) {
        postShareNGwords(arFullNg, getInfo.getChannelByURL());
    }
}
function arrayUserNgMaker() {
    arUserNg = [];
    var splitedUserNg = settings.userNg.split(/\r|\n|\r\n/);
    for(var ngi = 0; ngi < splitedUserNg.length; ngi++) {
        if (splitedUserNg[ngi].length == 0 || splitedUserNg[ngi].match(/^\/\//)) {
            continue;
        }
        splitedUserNg[ngi] = splitedUserNg[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
        arUserNg.push(splitedUserNg[ngi]);
    }
    if (settings.isShareNGuser) {
        postShareNGusers(arUserNg, getInfo.getChannelByURL());
    }
}

function comeNG(prengcome) {
    //規定のNG処理
    var ngedcome = prengcome;
    var strface1 = "[　 ]*[Σ<＜‹૮＋\\+\\*＊･゜ﾟ:\\.｡\\'☆〜～ｗﾍ√ﾚｖꉂ꒰·‧º∑♪₍⁺✧]*[　 ]*[┌└┐⊂二乁＼ヾヽつっdｄo_ƪ\\\\╭╰m👆ฅｍ\╲٩Ｏ∩┗┏∠٩☜ᕕԅ]*[　 ]*[（\\(《〈\\[\\|｜fζᔦ]+.*[8oO∀дД□◯▽△＿ڼ ౪艸^_⌣зεωm௰ｍ꒳ｰワヮ－U◇。｡࿄ш﹏㉨ꇴㅂ\\-ᴗ‿˘﹃_ﾛ◁ฅ∇益言人ㅅＡAΔΘ罒ᗜ◒◊vਊ⍛ー3xエェｪｴρｐё灬▿┓ڡ◡凵⌑︎▾0▼]+.*";
    var strface2 = "[）\\)》〉\\]\\|｜ᔨ]";
    var strface3 = "[　 ]*[┐┘┌┸┓／シノ厂\\/ｼﾉ۶つっbｂoა_╮╯mｍو👎☝」Ｏσ二⊃ゝʃง╭☞∩ゞ┛︎۶งวᕗ]";
    var strface4 = "[　 ]*[彡°ﾟ\\+・･⚡\\*＋＊ﾞ゜:\\.｡\\' ̑̑🌾💢ฅ≡<＜>＞ｗﾍ√ﾚｖ꒱‧º·…⋆ฺ✲⁾♪⁺✧]*[　 ]*";
    var reface1 = new RegExp(strface1 + strface2 + "+" + strface3 + "*" + strface4, "g");
    var reface2 = new RegExp(strface1 + strface2 + "*" + strface3 + "+" + strface4, "g");
    ngedcome = ngedcome.replace(reface1, "");
    ngedcome = ngedcome.replace(reface2, "");
    ngedcome = ngedcome.replace(/(\@\w+[　 ]*)+/g, ""); //twitter-dest.
    ngedcome = ngedcome.replace(/(#[^　 ]+[　 ]*)+$/g, ""); //twitter-tag
    ngedcome = ngedcome.replace(/[ｗw]{3,}/g, "ｗｗｗ");
    ngedcome = ngedcome.replace(/ʬ+/g, "ｗ");
    ngedcome = ngedcome.replace(/h?ttps?\:\/\/.*\..*/, "");
    ngedcome = ngedcome.replace(/[〜～ー－━─]{2,}/g, "ー");
    ngedcome = ngedcome.replace(/[・\･…‥、\､。\｡．\.]{2,}/g, "‥");
    ngedcome = ngedcome.replace(/[　 \n]+/g, " ");
    ngedcome = ngedcome.replace(/[？\?❔❓]+/g, "？");
    ngedcome = ngedcome.replace(/[！\!‼️❗❗️]+/g, "！");
    ngedcome = ngedcome.replace(/[○●]+/g, "○");
    ngedcome = ngedcome.replace(/[⑧❽８]{3,}/g, "888");
    ngedcome = ngedcome.replace(/[工エｴｪ]{3,}/g, "エエエ");
    ngedcome = ngedcome.replace(/([ﾊハ八]|[ﾉノ/][ヽ＼]){3,}/g, "ハハハ");
    if (settings.isDeleteStrangeCaps) {
        ngedcome = ngedcome.replace(/[^ - -⁯■□▲△▼▽◆◇○◎●　-ヿ一-鿿＀-￯]/g, ""); //基本ラテン・一般句読点・幾何学模様(一部)・CJK用の記号および分音記号・ひらがな・かたかな・CJK統合漢字・半角形/全角形
    }
    ngedcome = ngedcome.replace(/[͜͜͏̘̣͔͙͎͎̘̜̫̗͍͚͓]+/g, "");
    ngedcome = ngedcome.replace(/[ด็้]+/g, "");

    ngedcome = ngedcome.replace(/[▀-▓]+/g, "");
    ngedcome = ngedcome.replace(/(.)\1{3,}/g, "$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1{3,}/, "$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1*(...*?)(\1|\2){2,}/g, "$1$2");
    return ngedcome;
}
function comefilter(m, uid) {
    //putComeArrayとcopycomeで同じNG処理を実行するので分離
    var n = m;
    if (settings.isComeNg && m.length > 0) {
        n = comeNG(m);
    }
    if (settings.isComeDel && m.length > 0) {
        for (var ngi = 0; ngi < arFullNg.length; ngi++) {
            if (arFullNg[ngi].test(m)) {
                console.log("userNG matched text:" + m + " ngword:" + arFullNg[ngi].toString());
                m = "";
                break;
            } else if (arFullNg[ngi].test(n)) {
                console.log("userNG matched text:" + n + "(ori:" + m + ") ngword:" + arFullNg[ngi].toString());
                m = "";
                break;
            }
        }
    }
    if (settings.isUserDel && m.length > 0 && uid) {
        if (hasArray(arUserNg, uid)) {
            console.log("userNG matched UserID:" + uid + " text:" + m);
            m = "";
        }
    }
    if (settings.isComeNg && m.length > 0) {
        m = n;
    }
    return m;
}
function putComeArray(inp) {
    //console.log("putComeArray");
    //console.table(inp);
    // inp[i]=[ commentText , commentTop , leftOffset, isSelf]
    var mci = $('#moveContainer');
    if (mci.length == 0) {
        $('<div id="moveContainer" class="usermade">').appendTo('body');
        mci = $('#moveContainer');
    }
    var mcj = mci.children('.movingComment');
    var mclen = mcj.length;
    var inplen = inp.length;
    var comeoverflowlen = inplen + mclen - settings.movingCommentLimit;
    //あふれる分を削除
    if (comeoverflowlen > 0) {
        for(var cofi = 0; cofi < comeoverflowlen; cofi++){
            setTimeout(function(cofi){
                mcj.eq(cofi).remove();
            }, 7000*cofi/comeoverflowlen, cofi);//あふれた分を1つずつ順番に7秒かけて消す
        }
        //        mclen-=comeoverflowlen;
    }
//    var jo = $("object,video").parent();
    var jo = $(getElm.getVideo());
    if (jo.isEmpty()) {
        console.log('video empty in putComeArray', jo);
    }
    var er = jo[0].getBoundingClientRect();
    var movieRightEdge;
    //    if(isMovieMaximize){
    //        if(jo.width()>jo.height()*16/9){ //横長
    //            movieRightEdge=jo.width()/2+jo.height()*8/9; //画面半分+映像横長さ/2
    //        }else{ //縦長
    //            movieRightEdge=jo.width();
    //        }
    //    }else{
    movieRightEdge = er.left + er.width / 2 + jo.width() / 2;
    //    }
    var winwidth = settings.comeMovingAreaTrim ? movieRightEdge : window.innerWidth;
    var outxt = '';
    var setfont = '';
    if ($('#settcont').css("display") != "none") {
        setfont = 'font-size:' + parseInt($('#comeFontsize').val()) + 'px;';
    }
    for (var i = 0; i < inplen; i++) {
        outxt += '<span class="movingComment' + (inp[i][3]?' selfComment':'') + '" style="position:absolute;top:' + inp[i][1] + 'px;left:' + (inp[i][2] + winwidth) + 'px;' + setfont + '">' + inp[i][0] + '</span>';
    }
    $(outxt).appendTo(mci);
    //    mclen+=inplen;
    mcj = mci.children('.movingComment');
    mclen = mcj.length;
    for (let i = 0; i < inplen; i++) {
        var mck = mcj.eq(-inplen + i);
        var mcwidth = mck.width();
        var mcleft = inp[i][2] + winwidth;
        //コメント長さによって流れる速度が違いすぎるのでlogを速度計算部分に適用することで差を減らす
        //長いコメントは遅くなるので設定値より少し時間がかかる
        var mcfixedwidth = mcwidth < 237 ? mcwidth : 100 * Math.floor(Math.log(mcwidth));

        //コメント設置位置の更新
        //コメント右端が画面右端に出てくるまでの時間を保持する
        var r = settings.movingCommentSecond * (mcleft + mcwidth - winwidth) / (winwidth + mcfixedwidth);
        for (var j = comeLatestPosi.length - 1; j >= 0; j--) {
            if (comeLatestPosi[j][1] > comeTTLmax && comeLatestPosi[j][0] == inp[i][1]) {
                comeLatestPosi[j][1] = Math.min(comeTTLmax, Math.max(comeTTLmin, 1 + Math.ceil(r)));
                break;
            }
        }

        var waitsec = settings.movingCommentSecond * (mcleft + mcwidth) / (winwidth + mcfixedwidth);
        var movingDelta = (-mcwidth - 2)-(inp[i][2] + winwidth);

        setTimeout(function (jo, w, delta) {
            if (isEdge) { jo = $(jo); }
            jo.css("transition", "transform " + w + "s linear")
                .css("transform", "translateX(" + delta + "px)")
                .attr('data-createdSec', onairSecCount)
                ;
        }, 0, mck, waitsec, movingDelta);
    }
}
function putComment(commentText, userid, index, inmax, isSelf) {
    //console.log('putComment', commentText, userid, index, inmax, isSelf)
    var outflg = false;
    if (index == 0) {
        comeArray = [];
    }
    if (index == inmax - 1) {
        outflg = true;
    }
    if (isSelf == undefined) {isSelf = false;}
    //kakikomiwaitが0でない時は自分の書き込みをputCommentから除外する
    //console.log("commentText="+commentText+", kakikomitxt="+kakikomitxt);
    if (commentText.length > 0 && commentText == kakikomitxt) {
        console.log("kakikomi match,wait="+settings.kakikomiwait);
        isSelf = true;
        if (settings.kakikomiwait > 0) { //waitがプラスなら後から単独で流す
            setTimeout(putComment, 'self', settings.kakikomiwait * 1000, commentText, 0, 1, true);
            commentText = "";
        } else if (settings.kakikomiwait < 0) {
            commentText = "";
        }
        kakikomitxt = "";
        // console.log("kakikomitxt reset: putComment")
    }
    commentText = comefilter(commentText, userid);
    var commentTopMargin = 50;
    var commentBottomMargin = 150;
    if (EXhead.style.visibility == "hidden") {
        commentTopMargin = 10;
    }
    if (EXfoot.style.visibility == "hidden") {
        commentBottomMargin = 100;
    }
    var commentTop = Math.floor(Math.random() * (window.innerHeight - (commentTopMargin + commentBottomMargin))) + commentTopMargin;
    if (commentText.length > 0) {
        i = 0;
        var k = false;
        while (i < 20) {
            k = false;
            for (var j = 0; j < comeLatestLen; j++) {
                if (Math.abs(commentTop - comeLatestPosi[j][0]) < settings.comeFontsize * 1.5) {
                    k = true;
                }
            }
            if (k) {
                commentTop = Math.floor(Math.random() * (window.innerHeight - (commentTopMargin + commentBottomMargin))) + commentTopMargin;
            } else {
                break;
            }
            i += 1;
        }
    }
    var maxLeftOffset = window.innerWidth * 7 / settings.movingCommentSecond; //7秒の移動長さ
    var leftOffset = Math.floor(maxLeftOffset * index / inmax);
    if (commentText.length > 0) {
        comeArray.push([commentText, commentTop, leftOffset, isSelf]);
    }
    if (outflg && comeArray.length > 0) {
        setTimeout(putComeArray, 50, comeArray);
    }
    //コメント設置位置の保持
    //この時点では要素長さが未確定なので暫定的に異常値を入力してputComeArray側で拾う
    comeLatestPosi.push([commentTop, comeTTLmax + 2]);
    comeLatestPosi.shift();
}
//ミュート(false)・ミュート解除(true)する関数
function soundSet(isSound) {
    //isSound=true:音を出す
    isSoundFlag = isSound;
    if (settings.isTabSoundplay) {
        setBlacked[1] = !isSound;
        chrome.runtime.sendMessage({ type: "tabsoundplaystop", valb: !isSound }, function (r) { });
        return;
    }
    if (!EXvolume) return;
    var volcon = $(EXvolume).contents();
    var butvol = volcon.find('svg')[0];
    var volobj=getVolbarObject();
    if (volobj == null) return;
    var valvol = volobj.height();
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, true);
    //    valvol=parseInt(valvol[0].style.height);
    if (isSound) {
        //ミュート解除
        //音量0ならボタンを押す
        if (valvol == 0) {
            setBlacked[1] = false;
            butvol.dispatchEvent(evt);
        }
    } else {
        //ミュート
        //音量0でないならボタンを押す
        if (valvol != 0) {
            setBlacked[1] = true;
            butvol.dispatchEvent(evt);
        }
    }
}
//画面を真っ暗、透過する関数 0:無 1:半分透過 2:すべて透過 3:真っ黒
function screenBlackSet(type) {
    //    var pwaku = $('[class^="style__overlap___"]'); //動画枠
    var pwaku = $('#ComeMukouMask');
    if ($(overlapSelector).length == 0) return;
    if (/*pwaku.length == 0*/ $(overlapSelector).siblings('#ComeMukouMask').length == 0) { //delaysetから移動してきた
        $('#ComeMukouMask').remove();
        $('<div id="ComeMukouMask" style="position:absolute;width:100%;height:100%;">').insertAfter(overlapSelector);
        pwaku = $('#ComeMukouMask');
        pwaku[0].addEventListener("click", comemukouClick);
        pwaku[0].addEventListener("dblclick", onScreenDblClick);
    }
    if (type == 0) {
        setBlacked[0] = false;
        pwaku.css("background-color", "")
            .css("border-top", "")
            ;
    } else if (type == 1) {
        //        var w=$(window).height();
        var h = window.innerHeight;
        var p = 0;
        //        var t=1;
//        var jo = $('object,video').parent();
        var jo = $(getElm.getVideo());
        //        if(EXwatchingnum!==undefined){
//        if (jo.length > 0) {
        if (!jo.isEmpty()) {
            //            var jo=$(EXobli.children[EXwatchingnum]);
            //            w=jo.height();
            //            p=jo.offset().top;
            //            if(jo.css("transform")!="none"){
            //                t=parseFloat((/(?:^| )matrix\( *\d+.?\d* *, *\d+.?\d* *, *\d+.?\d* *, *(\d+.?\d*) *, *\d+.?\d* *, *\d+.?\d* *\)/.exec(jo.css("transform"))||[,t])[1]);
            //            }
            //zoom後の実際に見えている大きさでheightを取得できる以下に変更
            //            var eo=EXobli.children[EXwatchingnum];
            var eo = jo[0];
            var cr = eo.getBoundingClientRect();
            h = cr.height;
            p = cr.top;
            //            if(eo.style.transform.indexOf("scale")>=0){
            //                t=settings.CMsmall/100;
            //            }
        }
        setBlacked[0] = true;
        pwaku.css("background-color", "rgba(0,0,0,0.7)")
            //            .css("border-top",Math.floor(p+w*t/2)+"px black solid")
            .css("border-top", Math.floor(p + h / 2) + "px black solid")
            ;
        //        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+Math.floor(p+w/2)+"px;");
    } else if (type == 2) {
        setBlacked[0] = true;
        pwaku.css("background-color", "rgba(0,0,0,0.7)");
    } else if (type == 3) {
        setBlacked[0] = true;
        pwaku.css("background-color", "black");
    }
}
function movieZoomOut(sw) {
    var j = $(getElm.getVideo());
    if (j.isEmpty()) return;
    var t=j[0].style.transform.replace(/\s*scale\(\d*(\.\d+)?\)/,"");
    if (sw == 1 && settings.CMsmall < 100) {
        setBlacked[2] = true;
        t+=" scale(" + settings.CMsmall / 100 + ")";
    } else {
        setBlacked[2] = false;
    }
    j.css("transform", t);
}
//マウスを動かすイベント
//var movecnt = 0;
//function triggerMousemoveEvt(x, y){
//    var evt = document.createEvent("MouseEvents");
//    evt.initMouseEvent("mousemove", true, false, window, 0, 0, 0, x, y);
//    return document.dispatchEvent(evt);
//}
//function triggerMouseMoving(){
//console.log('triggerMM')
//    var overlap = $('[class^="AppContainer__background-black___"]');
//    overlap.trigger('mouseover').trigger('mousemove');
//    $('body').trigger('mouseover').trigger('mousemove');
//    var xy = Math.random()*100+300;
//    triggerMousemoveEvt(xy,xy);
//}
function openOption() {
    var settcontjq = $("#settcont");
    settcontjq.css("display", "block");
    optionHeightFix();
    //設定ウィンドウにロード
    $("#isResizeScreen").prop("checked", settings.isResizeScreen);
    $("#isDblFullscreen").prop("checked", settings.isDblFullscreen);
    $("#isHideOldComment").prop("checked", settings.isHideOldComment);
    $("#isCMBlack").prop("checked", settings.isCMBlack);
    $("#isCMBkTrans").prop("checked", settings.isCMBkTrans);
    $("#isCMsoundoff").prop("checked", settings.isCMsoundoff);
    $("#CMsmall").val(settings.CMsmall);
    $("#isMovingComment").prop("checked", settings.isMovingComment);
    $("#movingCommentSecond").val(settings.movingCommentSecond);
    $("#movingCommentLimit").val(settings.movingCommentLimit);
    //    $("#isMoveByCSS").prop("checked", isMoveByCSS);
    $("#isComeNg").prop("checked", settings.isComeNg);
    $("#isComeDel").prop("checked", settings.isComeDel);
    $("#fullNg").val(settings.fullNg);
    $("#isInpWinBottom").prop("checked", settings.isInpWinBottom);
    $("#isCustomPostWin").prop("checked", settings.isCustomPostWin);
    $("#isCancelWheel").prop("checked", settings.isCancelWheel);
    $("#isVolumeWheel").prop("checked", settings.isVolumeWheel);
    $("#changeMaxVolume").val(settings.changeMaxVolume);
    $("#isTimeVisible").prop("checked", settings.isTimeVisible);
    $("#isSureReadComment").prop("checked", settings.isSureReadComment);
    $("#isCommentFormWithSide").prop("checked", settings.isCommentFormWithSide);
    $("#sureReadRefreshx").val(settings.sureReadRefreshx);
    // $("#isAlwaysShowPanel").prop("checked", settings.isAlwaysShowPanel);
    //    $("#isMovieMaximize").prop("checked", isMovieMaximize);
    $("#commentBackColor").val(settings.commentBackColor);
    $("#commentBackTrans").val(settings.commentBackTrans);
    $("#commentTextColor").val(settings.commentTextColor);
    $("#commentTextTrans").val(settings.commentTextTrans);
    var bc = "rgba(" + settings.commentBackColor + "," + settings.commentBackColor + "," + settings.commentBackColor + "," + (settings.commentBackTrans / 255) + ")";
    var tc = "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (settings.commentTextTrans / 255) + ")";
    var jo = $(EXcomelist).children().slice(0, 10);
    jo.css("background-color", bc)
        .css("color", tc)
        ;
    //.children('[class^="styles__message___"]').css("color", tc)
    if (comelistClasses.message) jo.children('.' + comelistClasses.message).css("color", tc);
    $("#commentBackColor").val(settings.commentBackColor)
        .prev('span.prop').text(settings.commentBackColor + " (" + Math.round(settings.commentBackColor * 100 / 255) + "%)")
        ;
    $("#commentBackTrans").val(settings.commentBackTrans)
        .prev('span.prop').text(settings.commentBackTrans + " (" + Math.round(settings.commentBackTrans * 100 / 255) + "%)")
        ;
    $("#commentTextColor").val(settings.commentTextColor)
        .prev('span.prop').text(settings.commentTextColor + " (" + Math.round(settings.commentTextColor * 100 / 255) + "%)")
        ;
    $("#commentTextTrans").val(settings.commentTextTrans)
        .prev('span.prop').text(settings.commentTextTrans + " (" + Math.round(settings.commentTextTrans * 100 / 255) + "%)")
        ;
    $("#isCommentPadZero").prop("checked", settings.isCommentPadZero);
    $("#isCommentTBorder").prop("checked", settings.isCommentTBorder);
    $('#itimePosition input[type="radio"][name="timePosition"]').val([settings.timePosition]);
    $('#itimePosition').css("display", settings.isTimeVisible ? "flex" : "none");
    $("#notifySeconds").val(settings.notifySeconds);
    $('#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#settcont>#windowresize>#windowheight input[type="radio"][name="movieheight"]').val([0]);
    $("#beforeCMWait").val(cmblockia - 1);
    $("#afterCMWait").val(-cmblockib - 1);
    $("#isManualKeyCtrlR").prop("checked", settings.isManualKeyCtrlR);
    $("#isManualKeyCtrlL").prop("checked", settings.isManualKeyCtrlL);
    $("#isManualMouseBR").prop("checked", settings.isManualMouseBR);
    $("#isCMBkR").prop("checked", settings.isCMBkR);
    $("#isCMsoundR").prop("checked", settings.isCMsoundR);
    $("#isCMsmlR").prop("checked", settings.isCMsmlR);
    $("#isTabSoundplay").prop("checked", settings.isTabSoundplay);
    // $("#isOpenPanelwCome").prop("checked", isOpenPanelwCome);
    $("#isProtitleVisible").prop("checked", settings.isProtitleVisible);
    $('#iprotitlePosition input[type="radio"][name="protitlePosition"]').val([settings.protitlePosition]);
    $('#iprotitlePosition').css("display", settings.isProtitleVisible ? "flex" : "none");
    $('#iproSamePosition input[type="radio"][name="proSamePosition"]').val([settings.proSamePosition]);
    $('#iproSamePosition').css("display", (settings.isProtitleVisible && settings.isTimeVisible) ? "flex" : "none");
    $('#isCommentWide').prop("checked", settings.isCommentWide);
    $('#isProTextLarge').prop("checked", settings.isProTextLarge);
    $('#kakikomiwait').val(settings.kakikomiwait);
    $('#useEyecatch').prop("checked", settings.useEyecatch);
    $('#isHidePopTL').prop("checked", settings.isHidePopTL);
    $('#isHidePopBL').prop("checked", settings.isHidePopBL);
    $('#comeMovingAreaTrim').prop("checked", settings.comeMovingAreaTrim);
    $('#isHideButtons').prop("checked", settings.isHideButtons);
    $('#isResizeSpacing').prop("checked",  settings.isResizeSpacing);
    $('#isDeleteStrangeCaps').prop("checked", settings.isDeleteStrangeCaps);
    //    $('#isHighlightNewCome').prop("checked",isHighlightNewCome);
    $('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]').val([settings.highlightNewCome]);
    // $('#isChTimetableExpand').prop("checked", settings.isChTimetableExpand);
    $('#isHidePopFresh').prop("checked", settings.isHidePopFresh);
    $('#isChTimetableBreak').prop("checked", settings.isChTimetableBreak);
    $('#isChTimetableWeekend').prop("checked", settings.isChTimetableWeekend);
    $('#isChTimetablePlaybutton').prop("checked", settings.isChTimetablePlaybutton);
    $('#timetableScroll').val(settings.timetableScroll);
    $('#isHideTwitterPanel').prop("checked", settings.isHideTwitterPanel);
    $('#isHideTodayHighlitht').prop("checked", settings.isHideTodayHighlight);
    $('#isComelistNG').prop("checked", settings.isComelistNG);
    $('#isComelistClickNG').prop("checked", settings.isComelistClickNG);
    $('#ihighlightComeColor input[type="radio"][name="highlightComeColor"]').val([settings.highlightComeColor]);
    $('#highlightComePower').val(settings.highlightComePower);
    $('#isComeClickNGautoClose').prop("checked", settings.isComeClickNGautoClose);
    $('#isShareNGword').prop("checked", settings.isShareNGword);
    $('#isDelOldTime').prop("checked", settings.isDelOldTime);
    $('#isMovieSpacingZeroTop').prop("checked", settings.isMovieSpacingZeroTop);
    $('#isMovieSpacingZeroLeft').prop("checked", settings.isMovieSpacingZeroLeft);
    $('#comeFontsize').val(settings.comeFontsize);
    $('#isHideVoting').prop("checked", settings.isHideVoting);
    $('#isStoreViewCounter').prop("checked", settings.isStoreViewCounter);
    $('#isComeTriming').prop("checked", settings.isComeTriming);
    $('#audibleReloadWait').val(settings.audibleReloadWait);
    $('#isDAR43').prop("checked", settings.isDAR43);
    $('#isUserDel').prop("checked", settings.isUserDel);
    $('#userNg').val(settings.userNg);
    $('#isUserHighlight').prop("checked", settings.isUserHighlight);
    $('#isShareNGuser').prop("checked", settings.isShareNGuser);

    $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#windowheight input[type="radio"][name="windowheight"]').val([0]);

    $('#panelOpacity').val(settings.panelOpacity);
    $('#panelOpacity').siblings('.prop').text(settings.panelOpacity);    
    $('#comeFontsizeV').prop("checked", settings.comeFontsizeV);
    $('#proTitleFontC').prop("checked", settings.proTitleFontC);
    $('#isDelTime').prop("checked", settings.isDelTime);
    $('#mastodonFormat').val(settings.mastodonFormat);
    $('#minResolution').val(settings.minResolution);
    $('#maxResolution').val(settings.maxResolution);

    var panelopenses = 0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenses += panelopenset[i][j] * Math.pow(3, (3 - i) * 3 + (2 - j));
        }
    }
    //    panelopenseu[i] = panelopenset[i].join('');
    //}
    //panelopenses = panelopenseu.join('');
    if ($('#ipanelopenset [type="radio"][name="panelopenset"][value=' + panelopenses + ']').length > 0) {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val([panelopenses]);
    } else {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val([531441]);
    }
    if (panelopenses == 0) {
        putPopacti();
    } else {
        cancelPopacti();
    }
    // var sp = panelopenses.split('');
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            $('#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]').val([panelopenset[i][j]]);
        }
    }

    //    if(settings.isResizeScreen||isMovieMaximize){
    //    if(settings.isResizeScreen){
    //        $('#movieResizeChkA').prop("checked",true);
    //        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').prop("disabled",false)
    //            .val([settings.isResizeScreen?([settings.isResizeSpacing?1:0):2])
    //        ;
    //    }else{
    //        $('#movieResizeChkA').prop("checked",false);
    //        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').val([0])
    //            .prop("disabled",true)
    //        ;
    //    }
    $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').val([settings.isResizeScreen ? 1 : 0]);
    $('#moviePositionContainer input[type="radio"][name="moviePositionVType"]').val([settings.isMovieSpacingZeroTop ? 1 : ( settings.isResizeSpacing ? 2 : 0)]);
    $('#moviePositionContainer input[type="radio"][name="moviePositionHType"]').val([settings.isMovieSpacingZeroLeft ? 1 : 0]);

    if (!optionStatsUpdated) {
        optionStatsUpdated = true;
        setTimeout(optionStatsUpdate, 500, false);
    }
}
function closeOption() {
    $("#settcont").css("display", "none")
        .css("right", "40px")
        ;
    $(".rightshift").css("display", "none");
    $(".leftshift").css("display", "");
    var jo = $(EXcomelist).add('#copycomec').children('div');
    jo.css("background-color", "") //基本色、新着強調
        .css("color", "") //基本色
        .css("border-left", "") //新着強調
        .css("padding-left", "") //新着強調
        .css("border-top", "") //区切り線
        .css("transition", "") //新着強調
        ;
        //.children('[class^="styles__message___"]').css("color", "") //基本色
    if (comelistClasses.message) jo.children('.' + comelistClasses.message).css("color", "");
    $('.movingComment').css("font-size", "");
    onresize();
    setOptionElement();
    optionStatsUpdated = false;
}
function optionHeightFix() {
    var settcontjq = $("#settcont");
    var settcontheight = settcontjq[0].scrollHeight;
    var settcontpadv = parseInt(settcontjq.css("padding-top")) + parseInt(settcontjq.css("padding-bottom"));
    if (settcontheight > window.innerHeight - 105 - settcontpadv) {
        //console.log("optionHeightFix: "+settcontjq.height()+" -> "+($(window).height()-105-settcontpadv));
        settcontjq.height(window.innerHeight - 105 - settcontpadv).css("overflow-y", "scroll");
    }
}
function toast(message) {
    var toastElem = $("<div class='ext-toast'><p>" + message + "</p></div>").appendTo("body");
    setTimeout(function () {
        toastElem.fadeOut(3000);
    }, 4000);
}
function delayset(isInit,isOLS,isEXC,isInfo,isTwT,isVideo,isChli,isComeli) {
    if (checkUrlPattern(true) != 3) return;
    if(!isOLS){
        if(!overlapSelector){//ページ遷移の再delayset時に本来のoverlapが無くなって映像枠が引っかかるので再探査しない
            //var jo=$('div').map(function(i,e){var b=e.getBoundingClientRect();if($(e).css("position")=="absolute"&&b.top<5&&b.left<5&&b.width>window.innerWidth-10&&b.height>window.innerHeight-10&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0)&&parseInt($(e).css("opacity"))>0)return e;});
            var jo=$('div,button').map(function(i,e){
                var b=e.getBoundingClientRect();
                var bp=e.parentElement.getBoundingClientRect();//↓縦長ウィンドウでも反応するようtop判定はやめる
                if($(e).css("position")=="absolute"&&/*b.top<5&&*/b.left<5&&b.width==bp.width&&b.height==bp.height&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0)&&$(e).css("opacity")==0&&$(e).siblings().length<10)return e;
            });
            if(jo.length>0)overlapSelector=dl.getElementSingleSelector(jo[0]);
            //else{
            //    console.log('?overlapSelector');
            //    overlapSelector = "#main div.nN_nR";
            //}
        }
        if ($(overlapSelector).length>0){
            if(/*$('#ComeMukouMask').length == 0*/ $(overlapSelector).siblings('#ComeMukouMask').length == 0) { //delaysetにも設置
                $('#ComeMukouMask').remove();
                $('<div id="ComeMukouMask" style="position:absolute;width:100%;height:100%;">').insertAfter(overlapSelector);
                document.getElementById('ComeMukouMask').addEventListener("click", comemukouClick);
                document.getElementById('ComeMukouMask').addEventListener("dblclick", onScreenDblClick);
            }
            isOLS=true;
        }
    }

//EXmenuを作ったのでoptionelementに移動
//    if(!isHC){
//        var hoverContents = getMenuObject();
//        if(hoverContents==null) hoverContents=$('.Fb_Fi');
//        if (hoverContents.children().length > 0) {
//            //拡張機能の設定と通知番組一覧をその他メニューに追加
//            var hoverLinkClass = hoverContents.children()[0].className;
//            var hoverSpanClass = hoverContents.children().eq(0).children()[0].className;
//            if (hoverContents.children('#extSettingLink').length == 0) {
//                hoverContents.append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("option.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張設定</span></a>');
//                hoverContents.append('<a class="' + hoverLinkClass + '" id="extProgNotifiesLink" href="' + chrome.extension.getURL("prognotifies.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張通知登録一覧</span></a>');
//            }
//            isHC=true;
//        }
//    }

    if(!isInit&&$(EXfootcome).length>0&&$(EXcountview).length>0){
        createSettingWindow();
        arrayFullNgMaker();
        arrayUserNgMaker();
        //映像のリサイズ
        onresize();
        if(!isResizeInterval)setInterval(onresize, 30000);
        isResizeInterval = true;
        volumecheck(); //1秒ごとに実行していた最大音量チェックを初回読込時の1回だけに変更
        if ($('#moveContainer').length == 0) {
            $('<div id="moveContainer" class="usermade">').appendTo('body');
        }
        //視聴数の位置調整
        var fixCountViewLeft = function () {
            if (EXcountview) {
                let oldLeft = EXcountview.getBoundingClientRect().left;
                //let cvWidth = Math.ceil(EXcountview.getBoundingClientRect().width/2)*2;//2で割り切れるよう切り上げ
                //console.log(cvWidth,$(EXcountview).width())
                //$(EXcountview).width(cvWidth);
                let footer = $(EXfootcome).parent().addClass('countviewtrans');
                $(EXcountview).css({'position': 'fixed', 'margin-bottom': footer.css('margin-bottom'), 'height': footer.height()+'px'}).offset({left: EXfootcome.getBoundingClientRect().left-EXcountview.getBoundingClientRect().width/2-50});
                if(oldLeft != EXcountview.getBoundingClientRect().left){
                    setFooterBGStyle();
                }
            }
        };
        setTimeout(fixCountViewLeft, 3000);//コメント数が表示されるまで待つ
        setTimeout(fixCountViewLeft, 10000);//再度修正
        setInterval(fixCountViewLeft, 30000);//30秒ごとに再調整


        //初期読込時にマウス反応の要素が閉じないのを直したい
        forElementClose=1;

        // ピクチャーインピクチャーボタン設置
        createPIPbutton();

        isInit=true;
    }

    var resetOptionHead=false;
    if(!isInfo&&(EXinfo=getInfoElement())){
        addExtClass(EXinfo, 'info');
        console.log("setOptionHead delayset(EXinfo)");
        resetOptionHead=true;
        isInfo=true;

        //放送中一覧のスクロール
        //すぐだと失敗する？からinfo読んでからやる
        let cn = getInfo.getChannelByURL();
        if (cn&&EXchli) {
            const chlogo = $(EXchli).find('img[src*="/channels/logo/' + cn + '"]').eq(0)
            if(!chlogo.isEmpty()) $(EXchli).scrollTop(chlogo.parentsUntil(EXchli).eq(-2)[0].offsetTop-window.innerHeight/2);
        }
    }
    if(!isChli&&(EXchli=getElm.getChannelListElement())){
        addExtClass(EXchli, 'channelList');
        console.log("setOptionHead delayset(EXchli)");
        resetOptionHead=true;
        isChli=true;
        //放送中一覧のスクロール
        //↑のinfoと同じもの
        let cn = getInfo.getChannelByURL();
        if (cn&&isInfo) $(EXchli).scrollTop($(EXchli).find('img[src*="/channels/logo/' + cn + '"]').eq(0).parentsUntil(EXchli).eq(-2)[0].offsetTop-window.innerHeight/2);

    }
    if(!isComeli&&(EXcomelist=getComeListElement())){
        addExtClass(EXcomelist, 'comelist');
        window.dispatchEvent(comelistReadyEvent);
        console.log("setOptionHead delayset(EXchli)");
        resetOptionHead=true;
        isComeli=true;
    }
    if(!isTwT&&getReceiveTwtElement()){
        console.log("setOptionHead delayset(twt)");
        resetOptionHead=true;
        isTwT=true;
    }
    if(!isEXC&&$(EXcomelist).length>0){
//        addExtClass(EXcomelist, 'comelist');
        setTimeout(copycome, 1000);
        //EXcomelist = $(commentListParentSelector)[0];
        //if($(EXcomelist).length>0){
        EXcomments = $(EXcomelist).find('p').map(function(i,e){if($(e).index()==0)return e;});
        //コメ欄のDOM変更監視
        commentObserver.observe(EXcomelist, {childList: true/*, subtree: true, attributes: true*/});
//        console.log("setOptionHead delayset(EXcomelist)");
//        resetOptionHead=true;
        isEXC=true;
        //}
    }
    if(!isVideo&&getElm.getVideo()){
        console.log("setOptionHead delayset(video)");
        resetOptionHead=true;
        isVideo=true;
    }
    try{//タイミングによってはsetEXsが完了する前にここでsetOptionHead()が実行されエラーになってdelaysetが完遂されないのでとりあえずtryで囲む
        if(resetOptionHead) setOptionHead();
    }catch(e){console.warn(e);}

    if(isInit&&isOLS&&isEXC&&isInfo&&isTwT&&isVideo&&isChli&&isComeli)console.log("%cdelayset ok", 'color:green;');
    else{
        var cstr = "delayset retry "+(isInit?".":"I")+(isOLS?".":"O")+(isEXC?".":"C")+(isInfo?".":"F")+(isTwT?".":"T")+(isVideo?".":"V")+(isChli?".":"L")+(isComeli?".":"Cl");
        if(delaysetConsoleStr!==cstr){
            console.log(cstr);
            delaysetConsoleStr=cstr;
            delaysetConsoleRepeated = false;       
        }else{
            if(!delaysetConsoleRepeated){
                console.log('%crepeating:%c '+cstr, 'background-color: orange;', '');
                delaysetConsoleRepeated = true;
            }
        }
        setTimeout(delayset, 1000,isInit,isOLS,isEXC,isInfo,isTwT,isVideo,isChli,isComeli);
        return;
    }
}
function delaysetNotOA(){
    var hoverContents = getMenuObject();
    if(hoverContents==null) hoverContents=$('.zC_zJ'); //todo
    if (hoverContents.children().length == 0) {
        console.log("delaysetNotOA retry");
        setTimeout(delaysetNotOA, 1000);
        return;
    }

    hoverContents.css({'max-height': 'calc(100vh - '+headerHeight+'px)','overflow-y': 'auto'});
    //拡張機能の設定と通知番組一覧をその他メニューに追加
    var hoverLinkClass = hoverContents.children('a')[0].className;
    var hoverSpanClass = hoverContents.children('a').children('span')[0].className;
    //console.log(hoverContents,hoverContents.children(),hoverLinkClass)
    if (hoverContents.children('#extSettingLink').length == 0) {
        hoverContents.children(':last').css({'border-bottom':'1px solid #333', 'margin-bottom': '8px', 'padding-bottom': '12px'});
        hoverContents.append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("/pages/option.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張設定</span></a>')
            .append('<a class="' + hoverLinkClass + '" id="extProgNotifiesLink" href="' + chrome.extension.getURL("/pages/notifylist.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張通知登録一覧</span></a>')
            ;
    }
}
function volumecheck() {
    if (checkUrlPattern(true) != 3) return;
    //console.log("volumecheck");
    var t=getVolbarObject();
    if (t == null) return;
    var v = t.height();
    if (v !== null && 0 <= v && v <= 92) {
        if (v == 92 && settings.changeMaxVolume < 100) {
            if ($(EXvolume).contents().find('svg').css("fill") == "rgb(255, 255, 255)") {
                otoColor();
            }
            otosageru();
        }
    } else {
        setTimeout(volumecheck, 1000);
    }
}
function createPIPbutton() {
    const PIPvideoObserver = new MutationObserver(mutations=>{
        //console.log(mutations)
        if(!document.pictureInPictureElement || document.pictureInPictureElement.src===''){
            //console.log('!!!video changed');
            PIPvideoObserver.disconnect();
            //abemaが使用するvideo要素が変更されたら自動でPIP再表示しようと目論んでいたが
            //PIPの表示にはユーザー操作が必要なため挫折
            //現時点ではCMやCH切り替え等のタイミングでいちいちPIPボタンを押してもらう必要がある
            const PIPrequestAgain = ()=>{
                const video = getElm.getVideo();
                if(video){
                    getElm.getVideo().requestPictureInPicture()
                    .then(w=>{
                        PIPvideoObserver.observe(document.pictureInPictureElement, {childList: true});
                    })
                    .catch(e=>{
                        console.warn('request PIP error (video changed)', e);
                        setTimeout(PIPrequestAgain,500);
                    });
    
                }else{
                    console.log('PIP video retry');
                    setTimeout(PIPrequestAgain,500);
                }
            }
            //setTimeout(PIPrequestAgain,500);
        }
    })
    if (!document.pictureInPictureEnabled) return;
    if (!EXside) {
        console.log("createPIPbutton retry");
        setTimeout(createPIPbutton, 1000);
        return;
    }
    //設定ウィンドウ・開くボタン設置
    if (!document.getElementById('PIPbutton')) {
        var PIPbutton = document.createElement("div");
        PIPbutton.id = "PIPbutton";
        PIPbutton.classList.add('ext-sideButton');
        PIPbutton.setAttribute('title', 'ピクチャーインピクチャーモードの切り替え(拡張機能)');
        PIPbutton.innerHTML = "<img src='" + chrome.extension.getURL("/images/pip.svg") + "' alt='PIP' class='ext-sideButton-icon'>";
        EXside.appendChild(PIPbutton);
        $("#PIPbutton").on("click", function () {
            if (!document.pictureInPictureElement||document.pictureInPictureElement.src==="") {
                getElm.getVideo().requestPictureInPicture()
                .then(w=>{
                    PIPvideoObserver.observe(document.pictureInPictureElement, {attributes: true});
                    toast('ピクチャーインピクチャーに切り替えました。<br>CMと本編の切り替わりやチャンネル変更でピクチャーインピクチャーの再生が止まります。<br>その際は毎回、再度切り替えボタンを押してください。<br>(AbemaTV及びChromeの仕様により自動で再生継続できません。)');
                    console.log(w);
                    w.addEventListener('resize', e=>{
                        //console.log(e);
                        // if(!document.pictureInPictureElement || document.pictureInPictureElement.src===''){
                        //     getElm.getVideo().requestPictureInPicture();
                        // }
                    });
                })
                .catch(e=>{console.warn('request PIP error', e);toast('ピクチャーインピクチャーへの切り替えに失敗しました。');});
            } else {
                document.exitPictureInPicture().then(()=>{
                    PIPvideoObserver.disconnect();
                }).catch(e=>{console.warn('exit PIP error', e); toast('ピクチャーインピクチャーの終了に失敗しました。');});
            }
        });
    }
}
function optionStatsUpdate(outflg) {
    if (checkUrlPattern(true) != 3) return;
    //console.log("optionStatusUpdate("+(outflg?"true":"false"));
    var out = [0, 0];
    if ($('#settcont').length == 0 || $('#settcont').css("display") == "none") return;
    var tar = $('#sourceheight');
    if (bginfo[0] > 0 && tar.length > 0) {
        tar.text("(ソース:" + bginfo[0] + "p)")
            .css("display", "block")
            ;
    } else {
        tar.css("display", "none");
    }
    tar = $('#windowsizes');
//    var jp = $('object,video').parent();
    var jp = $(getElm.getVideo());
    //    if(EXwatchingnum!==undefined&&tar.length>0){
    if (!jp.isEmpty() && tar.length > 0) {
        //        var jo=$(EXobli.children[EXwatchingnum]);
        //        var omw=jo.width();
        //        var omh=jo.height();
        var omw = jp.width();
        var omh = jp.height();
        var oww = window.innerWidth;
        var owh = window.innerHeight;
        var opw = oww - omw;
        //        var opb=Math.floor((owh-omh)/2);
        //        var opt=owh-omh-opb;
        var opt = jp.offset().top;
        var opb = owh - omh - opt;
        var odes = "";
        var ndes = "";
        //resized
        var romw = omw;
        var romh = omh;
        var ropw = opw;
        var ropb = opb;
        var ropt = opt;
        var er = jp[0].getBoundingClientRect();
        if (settings.isResizeScreen) { //映像リサイズ1
            odes = "(拡大中)";
            ndes = "(拡大後)";
            romw = jp.width();
            romh = jp.height();
            ropw = oww - romw;
            //            ropt= settings.isResizeSpacing?headerHeight:0;
            ropt = Math.round(jp.offset().top - (jp.height() - er.height) / 2);
            ropb = owh - romh - ropt;
            //        }else if(isMovieMaximize){ //映像リサイズ2
            //            odes="(拡大中)";
            //            ndes="(拡大後)";
            //            romw=jp.width(); //window100%
            //            romh=jp.height(); //〃
            //            var rodar=romw/romh;
            //            if(rodar>16/9){ //darが16/9超 横に長い 縦にfit
            //                romw=Math.ceil(romh*16/9);
            //            }else if(rodar<16/9){ //darが16/9未満 縦に長い 横にfit
            //                romh=Math.floor(romw*9/16);
            //            }
            //            ropw=oww-romw;
            //            ropb=Math.floor((owh-romh)/2);
            //            ropt=owh-romh-ropb;
        }
        var nmw = omw;
        var nmh = omh;
        //resized
        var rnmw = romw;
        var rnmh = romh;
        var sm = parseInt($('#movieheight input[type="radio"][name="movieheight"]:checked').val());
        if (sm > 0) {
            nmh = sm;
            nmw = Math.ceil(nmh * 16 / 9);
            rnmh = nmh;
            rnmw = nmw;
        }
        var npw = opw;
        var npb = opb;
        var npt = opt;
        //resized
        var rnpw = ropw;
        var rnpb = ropb;
        var rnpt = ropt;
        var sw = parseInt($('#windowheight input[type="radio"][name="windowheight"]:checked').val());
        switch (sw) {
        case 0: //変更なし
            //                if(settings.isResizeScreen||isMovieMaximize){
            if (settings.isResizeScreen) {
                rnpt = ropt;
                rnpb = owh - rnmh - rnpt;
                if (rnpt != 0 || rnpb != 0) {
                    rnpw = 0;
                }
            } else {
                //                    npb=Math.floor((owh-nmh)/2);
                //                    npt=owh-nmh-npb;
                npt = opt;
                npb = owh - nmh - npt;
            }
            break;
        case 1: //映像の縦長さに合わせる
            //                if(settings.isResizeScreen||isMovieMaximize){
            if (settings.isResizeScreen) {
                rnpt = 0;
                rnpb = 0;
            } else {
                npb = 0;
                npt = 0;
            }
            break;
        case 2: //黒枠の分だけ空ける
            if (settings.isResizeScreen) {
                rnpw = 0;
                rnpt = headerHeight;
                rnpb = footerHeight;
                //                }else if(isMovieMaximize){
                //                    rnpw=0;
                //                    rnpb=64;
                //                    rnpt=64;
            } else {
                npb = footerHeight;
                npt = headerHeight;
            }
            break;
        case 3: //現在の空きを維持
            //                if(settings.isResizeScreen||isMovieMaximize){
            if (settings.isResizeScreen) {
                rnpt = ropt;
                rnpb = ropb;
            } else {
                npb = opb;
                npt = opt;
            }
            break;
        default:
        }
        var nww = nmw + npw;
        var nwh = nmh + npb + npt;
        //resized
        var rnww = rnmw + rnpw;
        var rnwh = rnmh + rnpb + rnpt;
        var sss;
        //        if(settings.isResizeScreen||isMovieMaximize){
        if (settings.isResizeScreen) {
            sss = "現在" + odes + ": 映像" + romw + "x" + romh + " +余白(左右合計" + ropw + ", 上" + ropt + ", 下" + ropb + ") =窓" + oww + "x" + owh + "<br>変更" + ndes + ": 映像" + rnmw + "x" + rnmh + " +余白(左右合計" + rnpw + ", 上" + rnpt + ", 下" + rnpb + ") =窓" + rnww + "x" + rnwh;
        } else {
            sss = "現在: 映像" + omw + "x" + omh + " +余白(右" + opw + ", 上" + opt + ", 下" + opb + ") =窓" + oww + "x" + owh + "<br>変更: 映像" + nmw + "x" + nmh + " +余白(右" + npw + ", 上" + npt + ", 下" + npb + ") =窓" + nww + "x" + nwh;
        }
        tar.html(sss)
            .css("display", "")
            ;
        //        if(settings.isResizeScreen||isMovieMaximize){
        if (settings.isResizeScreen) {
            out = [(rnww - oww), (rnwh - owh)];
        } else {
            out = [(nww - oww), (nwh - owh)];
        }
    }
    clearBtnColored($("#saveBtn"));

    if (outflg) { return out; } else {
        setTimeout(optionStatsUpdate, 800, false);
    }
}
function createSettingWindow() {
    if (checkUrlPattern(true) != 3) return;
    if (!EXside) {
        console.log("createSettingWindow retry");
        setTimeout(createSettingWindow, 1000);
        return;
    }
    var slidecont = EXside;
    //設定ウィンドウ・開くボタン設置
    if ($(EXside).children('#optionbutton').length == 0) {
        var optionbutton = document.createElement("div");
        optionbutton.id = "optionbutton";
        optionbutton.classList.add('ext-sideButton');
        optionbutton.setAttribute('title', '拡張機能の一時設定');
        optionbutton.innerHTML = "<img src='" + chrome.extension.getURL("/images/gear.svg") + "' alt='拡張設定' class='ext-sideButton-icon'>";
        slidecont.appendChild(optionbutton);
        $("#optionbutton").on("click", function () {
            if ($("#settcont").css("display") == "none") {
                openOption();
            } else {
                closeOption();
            }
        });
    }
    if ($('#settcont').length == 0) {
        let settcont = '<div id="settcont" class="usermade" style="';
        settcont += 'width:670px;position:absolute;right:40px;top:' + headerHeight + 'px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:16;';//head11より上の残り時間12,13,14より上の番組情報等15より上
        //ピッタリの658pxから少し余裕を見る
        settcont += '">';
        //設定ウィンドウの中身
        settcont += '<span style="font-weight:bold;">拡張機能一時設定画面</span><br>';
        settcont += '<input type="button" class="closeBtn" value="閉じる" style="position:absolute;top:10px;right:10px;">';
        settcont += '<a href="' + chrome.extension.getURL('/pages/option.html') + '" target="_blank">永久設定オプション画面はこちら</a><br>';
        settcont += settingslib.generateOptionHTML(false) + '<br>';
        settcont += '<input type="button" id="saveBtn" value="一時保存"> ';
        settcont += '<input type="button" class="closeBtn" value="閉じる"><br>';
        settcont += '※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<hr>';
        settcont += '<input type="button" id="clearLocalStorage" value="localStorageクリア"><br>';
        settcont += '<span style="word-wrap: break-word; color: #444; font-size: smaller;">UserID:' + localStorage.getItem('abm_userId') + ' token:' + localStorage.getItem('abm_token') + '</span>';
        settcont += '</div>';
        $(settcont).prependTo('body');
        $('#CommentColorSettings').change(setComeColorChanged);
        $('#itimePosition,#isTimeVisible').change(setTimePosiChanged);
        $(".closeBtn").on("click", closeOption);
        $("#clearLocalStorage").on("click", setClearStorageClicked);
        $("#saveBtn").on("click", setSaveClicked);
        $('#iprotitlePosition,#isProtitleVisible').change(setProtitlePosiChanged);
        $('#iproSamePosition').change(setProSamePosiChanged);
        $('#isProTextLarge').change(setProTextSizeChanged);
        $('#highlightComePower').change(setHighlightComePowerChanged);
        $('#panelOpacity').change(setPanelOpacityChanged);
        $('#comeFontsize').change(setComeFontsizeChanged);
    }
    $("#CommentMukouSettings").hide();
    $("#CommentColorSettings").css("width", "600px")
        .css("padding", "8px")
        .css("border", "1px solid black")
        .children('div').css("clear", "both")
        .children('span.desc').css("padding", "0px 4px")
        .next('span.prop').css("padding", "0px 4px")
        .next('input[type="range"]').css("float", "right")
        ;
    $("#itimePosition").insertAfter("#isTimeVisible-switch+*")
        .css("border", "1px solid black")
        .css("margin-left", "16px")
        .css("display", "flex")
        .css("flex-direction", "column")
        .css("padding", "8px")
        .children().css("display", "flex")
        .css("flex-direction", "row")
        .css("margin", "1px 0px")
        .children().css("margin-left", "4px")
        ;
    $("#iprotitlePosition").insertAfter("#isProtitleVisible-switch+*")
        .css("border", "black solid 1px")
        .css("margin-left", "16px")
        .css("display", "flex")
        .css("flex-direction", "column")
        .children().css("display", "flex")
        .css("flex-direction", "row")
        .css("margin", "1px 0px")
        .children().css("margin-left", "4px")
        ;
    $("#iproSamePosition").insertBefore("#isProtitleVisible-switch")
        .css("border", "black solid 1px")
        .children().css("display", "flex")
        .css("flex-direction", "row")
        .css("margin", "1px 0px")
        .children().css("margin-left", "4px")
        ;
    if ($('#prosamedesc').length == 0) {
        $('<span id="prosamedesc" style="margin-left:4px;">↑と↓が同じ位置の場合: </span>').prependTo("#iproSamePosition>*");
    }
    if ($('.leftshift').length == 0) {
        $('<input type="button" class="leftshift" value="←この設定画面を少し左へ" style="float:right;margin-top:10px;padding:0px 3px;">').insertBefore($('#CommentColorSettings').parent());
        $(".leftshift").on("click", function () {
            $("#settcont").css("right", "320px");
            $(".leftshift").css("display", "none");
            $(".rightshift").css("display", "");
        });
    }
    if ($('.rightshift').length == 0) {
        $('<input type="button" class="rightshift" value="この設定画面を右へ→" style="float:right;margin-top:10px;display:none;padding:0px 3px;">').insertBefore($('#CommentColorSettings').parent());
        $(".rightshift").on("click", function () {
            $("#settcont").css("right", "40px");
            $(".rightshift").css("display", "none");
            $(".leftshift").css("display", "");
            //$('#PsaveCome').prop("disabled", true)
            //    .css("color", "gray")
            //    ;
            //setTimeout(clearBtnColored, 1200, $('#PsaveCome'));
        });
    }
    if ($('#windowresize').length == 0) {
        $('<div id="windowresize">ウィンドウのサイズ変更<span id="windowsizes"></span></div>').insertAfter('#CommentColorSettings');
        $('#windowresize').css("display", "flex")
            .css("flex-direction", "column")
            .css("margin-top", "8px")
            .css("padding", "8px")
            .css("border", "1px solid black")
            .children('#windowsizes').css("display", "none")
            ;
    }
    if ($('#movieheight').length == 0) {
        $('<div id="movieheight">映像の縦長さ<br><p id="sourceheight"></p></div>').appendTo('#windowresize');
        $('<div><input type="radio" name="movieheight" value=0>変更なし</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=240>240px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=360>360px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=480>480px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=720>720px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=1080>1080px</div>').appendTo('#movieheight');
        $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
        $('#movieheight').css("display", "flex")
            .css("flex-direction", "row")
            .css("flex-wrap", "wrap")
            .css("padding", "0px 8px")
            .children('#sourceheight').css("display", "none")
            .siblings().css("padding", "0px 3px")
            .change(setSaveDisable)
            ;
    }
    if ($('#windowheight').length == 0) {
        $('<div id="windowheight">ウィンドウの縦長さ</div>').appendTo('#windowresize');
        $('<div><input type="radio" name="windowheight" value=0>変更なし</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=1>映像の縦長さに合わせる</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=2>黒枠の分だけ空ける</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=3>現在の余白を維持</div>').appendTo('#windowheight');
        $('#windowheight input[type="radio"][name="windowheight"]').val([0]);
        $('#windowheight').css("display", "flex")
            .css("flex-direction", "row")
            .css("flex-wrap", "wrap")
            .css("padding", "0px 8px")
            .children().css("padding", "0px 3px")
            .change(setSaveDisable)
            ;
    }
    if ($('#PsaveCome').length == 0) {
        $('<input type="button" id="PsaveCome" class="Psave" value="このコメント外見設定を永久保存(上書き)">').appendTo('#CommentColorSettings');
        $('#PsaveCome').css("margin", "8px 0 0 24px")
            .on("click", setPSaveCome)
            ;
    }
    if ($('#PsaveNG').length == 0) {
        $('<input type="button" id="PsaveNG" class="Psave" value="←これらを永久保存(上書き)">').insertAfter('#fullNg');
        $('#PsaveNG').css("margin", "8px 0 0 8px")
            .on("click", setPSaveNG)
            ;
        $('<div style="clear:both;">').insertAfter('#PsaveNG');
        $('#fullNg').css("float", "left");
    }
    $('.Psave').css("margin-left", "8px")
        .css("padding", "0px 3px")
        ;
    if ($('#ComeMukouO').length == 0) {
        $('#CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $('<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>').prependTo('#CommentMukouSettings');
        $('#ComeMukouO').css("margin-top", "8px")
            .css("padding", "8px")
            .css("border", "1px solid black")
            ;
        $('<table id="setTable">').appendTo('#ComeMukouO');
        var stjo = $('#setTable');
        var sttr = stjo.contents().find('tr');
        stjo.css("border-collapse", "collapse");
        $('<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th colspan=2>音量ミュート</th></tr>').appendTo(stjo);
        $('<tr><td>適用</td><td></td><td></td><td></td><td></td><td></td></tr>').appendTo(stjo);
        $('<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td colspan=2></td></tr>').appendTo(stjo);

        sttr = stjo.contents().find('tr');
        var stra = sttr.eq(1).children('td');
        var strb = sttr.eq(2).children('td');
        $('#isCMBlack').appendTo(stra.eq(1));
        $('#isCMBkTrans').appendTo(stra.eq(1)).css("display", "none");
        $('<input type="radio" name="cmbktype" value=0>').appendTo(stra.eq(2))
            .after("全面真黒<br>")
            ;
        $('<input type="radio" name="cmbktype" value=1>').appendTo(stra.eq(2))
            .after("下半透明")
            ;
        stra.eq(2).children('input[type="radio"][name="cmbktype"]').prop("disabled", !settings.isCMBlack)
            .val([settings.isCMBkTrans ? 1 : 0])
            .change(setCMBKChangedR)
            ;

        $('#CMsmall').appendTo(stra.eq(3)).after("％")
            .css("text-align", "right")
            .css("width", "4em")
            ;

        $('#isCMsoundoff').appendTo(stra.eq(4));
        $('#isTabSoundplay').appendTo(stra.eq(4)).css("display", "none");
        $('<input type="radio" name="cmsotype" value=0>').appendTo(stra.eq(5))
            .after("プレイヤー<br>")
            ;
        $('<input type="radio" name="cmsotype" value=1>').appendTo(stra.eq(5))
            .after("タブ設定")
            ;
        stra.eq(5).children('input[type="radio"][name="cmsotype"]').prop("disabled", !settings.isCMsoundoff)
            .val([settings.isTabSoundplay ? 1 : 0])
            .change(setCMsoundChangedR)
            ;

        $('#isCMBlack').change(setCMBKChangedB);
        $('#CMsmall').change(setCMzoomChangedR);
        $('#isCMsoundoff').change(setCMsoundChangedB);
        $('#isCMBkR').appendTo(strb.eq(1));
        $('#isCMsmlR').appendTo(strb.eq(2));
        $('#isCMsoundR').appendTo(strb.eq(3));
        stra.add(strb).css("border", "1px solid black")
            .css("text-align", "center")
            .css("padding", "3px")
            ;
        stra.eq(1).add(stra.eq(4)).css("border-right", "none");
        stra.eq(2).add(stra.eq(5)).css("border-left", "none")
            .css("text-align", "left")
            ;

        $('<div id="ComeMukouW" class="setTables">↑の実行待機(秒)</div>').insertAfter('#ComeMukouO');
        $('#ComeMukouW').css("margin-top", "8px")
            .css("padding", "8px")
            .css("border", "1px solid black")
            ;
        $('#beforeCMWait').appendTo('#ComeMukouW')
            .before("　開始後")
            ;
        $('#afterCMWait').appendTo('#ComeMukouW')
            .before("　終了後")
            .after("<br>待機時間中、押している間は実行せず、離すと即実行するキー<br>")
            ;
        $('#isManualKeyCtrlL').appendTo('#ComeMukouW').after("左ctrl");
        $('#isManualKeyCtrlR').appendTo('#ComeMukouW').after("右ctrl");
        $('#isManualMouseBR').appendTo('#ComeMukouW')
            .before("<br>待機時間中、カーソルを1秒以上連続で合わせている間は実行せず、外すと即実行する場所<br>")
            .after("右下のコメント数表示部")
            ;
        $('<div id="ComeMukouN" class="setTables"></div>').insertAfter('#ComeMukouW');
        $('#ComeMukouN').css("margin-top", "8px")
            .css("padding", "8px")
            .css("border", "1px solid black")
            ;
        $('#useEyecatch').appendTo('#ComeMukouN').after("左上ロゴのタイミングを利用(キー/カーソルでの実行待機中は効きません)<br>");
        $('#isHidePopTL').appendTo('#ComeMukouN').after("左上ロゴを非表示<br>");
        $('#isHidePopBL').appendTo('#ComeMukouN').after("左下の通知を非表示");
        $('#isHidePopFresh').appendTo('#ComeMukouN').after("左下のFreshの通知を非表示");
        $('#ComeMukouD').remove();
    }
    if ($('#epnumedit').length == 0) {
        var s = '<div id="epnumedit" style="border:1px solid black;padding:8px;margin-left:16px;display:flex;flex-direction:row;">';
        s += '<div>背景区切り数<input type="number" name="epcount" min=1 max=31></div>';
        //        s+='<div style="margin-left:16px;">1番目の数字<input type="number" name="epfirst" min=1 max=69 disabled>(区切り数7以上で表示)</div>';
        s += '<div style="margin-left:16px;">1番目の数字<input type="number" name="epfirst" min=0 max=69></div>(0で非表示)';
        //        s+='<div style="margin-left:16px;">末尾調整(分)<input type="number" name="epfix" min=0 max=60 disabled></div>';
        s += '<div style="margin-left:16px;">末尾調整(分)<input type="number" name="epfix" min=0 max=60></div>';
        s += '</div>';
        $(s).insertAfter("#isTimeVisible-switch+*");
        var epnume = $('#epnumedit').contents().find('input[type="number"]');
        epnume.filter('[name="epcount"]').val(2)
            .change(epcountchange)
            ;
        epnume.filter('[name="epfirst"]').val(0)
            .change(epfirstchange)
            ;
        epnume.filter('[name="epfix"]').val(0)
            .change(epfixchange)
            ;
    }
    if ($('#panelCustom').length == 0) {
        $('<div id="panelCustom"">黒帯パネル開閉設定<br></div>').insertBefore('#CommentMukouSettings');
        $('#panelCustom').css("margin-top", "8px")
            .css("padding", "8px")
            .css("border", "1px solid black")
            ;
        // $('#isAlwaysShowPanel').appendTo('#panelCustom').prop("disabled", true).before("旧");
        // $('<input type="button" id="alwaysShowPanelB" value="下表に適用">').insertAfter('#isAlwaysShowPanel').before("常に黒帯パネルを表示する");
        // $('#isOpenPanelwCome').appendTo('#panelCustom').prop("disabled", true).before("<br>旧");
        // $('<input type="button" id="openPanelwComeB" value="下表に適用">').insertAfter('#isOpenPanelwCome').before("コメント欄を開いていても黒帯パネル等を表示できるようにする");
        // $('<br><span>※以上の古いオプションは以下の新オプションに統合され、適当な経過期間の後に削除予定</span>').appendTo('#panelCustom');
        $('#ipanelopenset').appendTo('#panelCustom')
            .children().css("display", "flex")
            .css("flex-direction", "row")
            ;
        $('<table id="panelcustomTable">').appendTo('#panelCustom');
        $('#panelcustomTable').css("border-collapse", "collapse");
        $('<tr><th></th><th>上のメニュー</th><th>下のバー</th><th>右のボタン</th></tr>').appendTo('#panelcustomTable');
        $('<tr><td>基本</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>番組情報<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>放送中一覧<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>コメント<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        var rd = ["非表示<br>", "マウス反応<br>", "常に表示"];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    $('<input type="radio" name="d' + i + '' + j + '" value="' + k + '" id="radio-d'+i+j+'-'+k+'">').appendTo('#panelcustomTable tr:eq(' + (i + 1) + ')>td:eq(' + (j + 1) + ')')
                        .after('<label for="radio-d'+i+j+'-'+k+'">'+rd[k]+'</label>')
                        ;
                }
            }
        }
        $('#panelcustomTable td').css("border", "1px solid black")
            .css("text-align", "left")
            .css("padding", "3px")
            ;
        $('#panelcustomTable td:first-child').css("text-align", "center");
        // $('#alwaysShowPanelB').on("click", panelTableUpdateA);
        // $('#openPanelwComeB').on("click", panelTableUpdateO);
        $('#ipanelopenset').change(panelTableUpdateS);
        $('#panelcustomTable').change(panelTableUpdateT);
    }
    if ($('#movieResizeContainer').length == 0) {
        let jo = $('#isResizeScreen-switch');
        let ja = jo.parent().contents();
        //        var jm=$('#isMovieMaximize');
        let jm = $('#isDAR43-switch');
        ja.slice(ja.index(jo), ja.index(jm.next())).wrapAll('<div id="movieResizeContainer" style="margin:8px;padding:8px;border:1px solid black;">');
        //        $('<input id="movieResizeChkA" type="checkbox">').prependTo('#movieResizeContainer')
        //            .after(':映像リサイズ (ウィンドウに合わせます。映像がウィンドウの外にハミ出なくなり、コメ欄などを開いても映像の大きさは変わらず、コメ欄などは映像の上に重なります。)<br>映像の上下位置<br>')
        //            .change(movieResizeChkChanged)
        //        ;
        let tres = '';
        tres += '<br><input type="radio" name="movieResizeType" value=0 style="margin-left:16px;" id="radio-movieResizeType-0">:<label for="radio-movieResizeType-0"><span id="movieResizeDesc">'+(settings.isDAR43?'左枠サイズに合わせる(左詰め推奨)':'デフォルト')+'</span></label>';
        tres += '<br><input type="radio" name="movieResizeType" value=1 style="margin-left:16px;" id="radio-movieResizeType-1">:<label for="radio-movieResizeType-1">ウィンドウ全体に最大化</label>';
        $('#isResizeScreen-switch').css("display", "none")
            //            .before('<input type="radio" name="movieResizeType" value=0 style="margin-left:16px;">:上に詰める (空き無し)')
            .before(tres)
            ;
        //        $('#isResizeSpacing').css("display","none")
        //            .before('<input type="radio" name="movieResizeType" value=1 style="margin-left:16px;">:上に詰めるが、上の黒帯の分だけ空ける')
        //        ;
        //        $('#isMovieMaximize').css("display","none")
        //            .before('<input type="radio" name="movieResizeType" value=2 style="margin-left:16px;">:画面中央')
        //        ;
        let jc = $('#movieResizeContainer').contents();
        jc.eq(jc.index($('#isResizeScreen-switch')) + 1)
            //            .add(jc.eq(jc.index($('#isResizeSpacing'))+1))
            //            .add(jc.eq(jc.index($('#isMovieMaximize'))+1))
            .add(jc.eq(jc.index($('#isDAR43-switch'))+1))
            .remove()
            ;
        $('#isDAR43-switch').prependTo("#movieResizeContainer").before('映像の大きさ　').after(" <label for='isDAR43'>映像4:3モード</label>");
        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').add("#isDAR43").change(movieResizeTypeChanged);
    }
    if ($('#moviePositionContainer').length == 0) {
        let jo = $('#isMovieSpacingZeroTop-switch');
        let ja = jo.parent().contents();
        let jm = $('#isMovieSpacingZeroLeft-switch');
        ja.slice(ja.index(jo), ja.index(jm.next())).wrapAll('<div id="moviePositionContainer" style="margin:8px;padding:8px;border:1px solid black;">');
        let tres = '映像の上下位置';
        tres += '<br><input type="radio" name="moviePositionVType" value=0 style="margin-left:16px;" id="radio-moviePositionVType-0"><label for="radio-moviePositionVType-0">:デフォルト (中央)</label>';
        tres += '<br><input type="radio" name="moviePositionVType" value=1 style="margin-left:16px;" id="radio-moviePositionVType-1"><label for="radio-moviePositionVType-1">:上に詰める (空き無し) ※額縁は詰まりません</label>';
        $('#isMovieSpacingZeroTop-switch').css("display", "none")
            .before(tres)
            ;
        $('#isResizeSpacing-switch').css("display", "none")
            .before('<input type="radio" name="moviePositionVType" value=2 style="margin-left:16px;" id="radio-moviePositionVType-2"><label for="radio-moviePositionVType-2">:上に詰めるが、上の黒帯の分だけ空ける ※額縁は詰まりません</label>')
            ;
        tres = '映像の左右位置';
        tres += '<br><input type="radio" name="moviePositionHType" value=0 style="margin-left:16px;" id="radio-moviePositionHType-0"><label for="radio-moviePositionHType-0">:デフォルト <span id="moviePosiHDesc"></span></label>';
        tres += '<br><input type="radio" name="moviePositionHType" value=1 style="margin-left:16px;" id="radio-moviePositionHType-1"><label for="radio-moviePositionHType-1">:左に詰める (空き無し)</label>';
        $('#isMovieSpacingZeroLeft-switch').css("display", "none")
            .before(tres)
            ;
        $('#moviePosiHDesc').text(settings.isResizeScreen ? "(ウィンドウ全体の中央)" : "(ウィンドウ左側内の中央)");
        var jc = $('#moviePositionContainer').contents();
        jc.eq(jc.index($('#isMovieSpacingZeroTop-switch')) + 1)
            .add(jc.eq(jc.index($('#isResizeSpacing-switch')) + 1))
            .add(jc.eq(jc.index($('#isMovieSpacingZeroLeft-switch')) + 1))
            .remove()
            ;
        $('#moviePositionContainer input[type="radio"][name="moviePositionVType"]').change(moviePositionVTypeChanged);
        $('#moviePositionContainer input[type="radio"][name="moviePositionHType"]').change(moviePositionHTypeChanged);
        $('#movieResizeContainer,#moviePositionContainer').next('label').remove();
        $('#movieResizeContainer,#moviePositionContainer').next("br").remove();
    }
    if ($('#highlightdesc').length == 0) {
        $("#ihighlightNewCome").insertBefore("#isCommentWide-switch")
            .css("border", "black solid 1px")
            .children().css("display", "flex")
            .css("flex-direction", "row")
            .css("margin", "1px 0px")
            .css("padding-left", "8px")
            .children().css("margin-left", "4px")
            .first().before('<span id="highlightdesc">新着コメントを少し強調する</span>')
            ;
    }
    if ($('#highlightCdesc').length == 0) {
        $("#ihighlightComeColor").insertBefore("#isCommentWide-switch")
            .css("border", "black solid 1px")
            .children().css("display", "flex")
            .css("flex-direction", "row")
            .css("margin", "1px 0px")
            .css("padding-left", "8px")
            .children().css("margin-left", "4px")
            .first().before('<span id="highlightCdesc">↑の色</span>')
            ;
        let c = $('#highlightComePower').parent().contents();
        let jo = $('#highlightComePower');
        let i = c.index(jo);
        c.slice(i - 2, i).remove();
        $('#highlightComePower').appendTo($("#ihighlightComeColor").children().first())
            .prop("type", "range")
            .prop("max", "100")
            .prop("min", "0")
            ;
        $('<span id="highlightPdesc" style="margin-right:4px;margin-left:12px;">背景濃さ:' + settings.highlightComePower + '</span>').insertBefore("#highlightComePower");
    }
    $('#changeMaxVolume').prop("max", "100").prop("min", "0");
    $('#sureReadRefreshx').prop("min", "101");
    $('#movingCommentSecond').prop("min", "1");
    $('#movingCommentLimit').prop("min", "0");
    $('#comeFontsize').prop("max", "99").prop("min", "1");
    $('#notifySeconds').prop("min", "0");
    $('#CMsmall').prop("max", "100").prop("min", "5");
    $('#beforeCMWait').prop("min", "0");
    $('#afterCMWait').prop("min", "0");
    console.log("createSettingWindow ok");
}
function setComeFontsizeChanged() {
    var nf = parseInt($('#comeFontsize').val());
    var jo = $('.movingComment');
    jo.css("font-size", nf + "px");
}
function setHighlightComePowerChanged() {
    $('#highlightPdesc').text("背景濃さ:" + $('#highlightComePower').val());
}
function setPanelOpacityChanged() {
    $('#panelOpacity').siblings('.prop').text($('#panelOpacity').val());
}
function moviePositionVTypeChanged() {
    switch (+$('#moviePositionContainer input[type="radio"][name="moviePositionVType"]:checked').val()) {
    case 0:
        $('#isMovieSpacingZeroTop').prop("checked", false);
        $('#isResizeSpacing').prop("checked", false);
        break;
    case 1:
        $('#isMovieSpacingZeroTop').prop("checked", true);
        $('#isResizeSpacing').prop("checked", false);
        break;
    case 2:
        $('#isMovieSpacingZeroTop').prop("checked", false);
        $('#isResizeSpacing').prop("checked", true);
        break;
    default:
    }
    onresize();
}
function moviePositionHTypeChanged() {
    switch (+$('#moviePositionContainer input[type="radio"][name="moviePositionHType"]:checked').val()) {
    case 0:
        $('#isMovieSpacingZeroLeft').prop("checked", false);
        break;
    case 1:
        $('#isMovieSpacingZeroLeft').prop("checked", true);
        break;
    default:
    }
    onresize();
}
function movieResizeTypeChanged() {
    switch (+$('#movieResizeContainer input[type="radio"][name="movieResizeType"]:checked').val()) {
        case 0:
            $('#isResizeScreen').prop("checked", false);
            //            $('#isResizeSpacing').prop("checked",false);
            //            $('#isMovieMaximize').prop("checked",false);
            $('#moviePosiHDesc').text("(ウィンドウ左側内の中央)");
            break;
        case 1:
            $('#isResizeScreen').prop("checked", true);
            //            $('#isResizeSpacing').prop("checked",true);
            //            $('#isMovieMaximize').prop("checked",false);
            $('#moviePosiHDesc').text("(ウィンドウ全体の中央)");
            break;
        //        case 2:
        //            $('#isResizeScreen').prop("checked",false);
        //            $('#isResizeSpacing').prop("checked",false);
        //            $('#isMovieMaximize').prop("checked",true);
        //            break;
        default:
    }
    $('#movieResizeDesc').text($('#isDAR43').prop("checked")?"左枠サイズに合わせる(左詰め推奨)":"デフォルト");
    onresize();
}
//function movieResizeChkChanged(){
//    if($('#movieResizeChkA').prop("checked")){
//        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').prop("disabled",false);
//        movieResizeTypeChanged();
//    }else{
//        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').prop("disabled",true);
//        $('#isResizeScreen').prop("checked",false);
//        $('#isResizeSpacing').prop("checked",false);
//        $('#isMovieMaximize').prop("checked",false);
//    }
//}
function epcountchange() {
    var c = parseInt($('#epnumedit input[type="number"][name="epcount"]').val());
    var f = parseInt($('#epnumedit input[type="number"][name="epfirst"]').val());
    var proLength = 0;
    var oneLength = 0;
    //    if(c>6){
    if (f > 0) {
        $('#epnumedit input[type="number"][name="epfirst"]').prop("disabled", false);
        $('#epnumedit input[type="number"][name="epfix"]').prop("disabled", false);
        proLength = proEnd.getTime() - proStart.getTime(); //番組の全体長さms
        var x = 60000 * parseInt($('#epnumedit input[type="number"][name="epfix"]').val());
        if (x > 0) {
            var y = Math.floor(310 * proLength / (proLength + x));
            $('#proTimeEpNum').css("right", (310 - y) + "px")
                .css("width", y + "px")
                .css("border-right", "1px solid rgba(255,255,255,0.2)")
                ;
            proLength -= x;
        } else {
            $('#proTimeEpNum').css("right", 0)
                .css("width", "310px")
                .css("border-right", "")
                ;
        }
        if (proLength > 0) {
            oneLength = Math.floor(proLength / c); //1話あたりの長さms
        }
        $('#forProEndTxt').css("background-color", "rgba(0,0,0,0.4)");
    } else {
        //        $('#epnumedit input[type="number"][name="epfirst"]').prop("disabled",true);
        //        $('#epnumedit input[type="number"][name="epfix"]').prop("disabled",true);
        $('#forProEndTxt').css("background-color", "transparent");
    }
    var eo = '<div>';
    var ea = '';
    for (var i = 0; i < c; i++) {
        ea += eo;
        //        if(c>6){
        if (f > 0) {
            var sprost = new Date(proStart);
            var eprost = new Date(proStart);
            sprost.setSeconds(Math.floor(i * oneLength / 1000));
            var sh = ('0' + sprost.getHours()).slice(-2);
            var sm = ('0' + sprost.getMinutes()).slice(-2);
            eprost.setSeconds(Math.floor((i + 1) * oneLength / 1000));
            var eh = ('0' + eprost.getHours()).slice(-2);
            var em = ('0' + eprost.getMinutes()).slice(-2);
            ea += '<a title="#' + (i + f) + ' ' + sh + ':' + sm + '-' + eh + ':' + em + '">' + (i + f) + '</a>';
        } else {
            ea += '&nbsp;';
        }
        ea += '</div>';
    }
    $('#proTimeEpNum').html(ea);
}
function epfirstchange() {
    //    if(parseInt($('#epnumedit input[type="number"][name="epcount"]').val())>6){
    epcountchange();
    //    }
}
function epfixchange() {
    epcountchange();
}
function setClearStorageClicked() {
    window.localStorage.clear();
    console.info("cleared localStorage");
}
function moveComeTopFilter() {
    var jo = $('.movingComment');
    var i = jo.length - 1;
    while (i >= 0) {
        if (jo.eq(i).position().top > window.innerHeight - headerHeight - footerHeight) {
            jo.eq(i).remove();
        }
        i -= 1;
    }
}
function setSaveDisable() {
    $("#saveBtn").prop("disabled", true)
        .css("color", "gray")
        ;
}
function setPSaveNG() {
    settings.fullNg = $("#fullNg").val();
    arrayFullNgMaker();
    if (settings.isComelistNG) {
        copycome();
    }
    setStorage({
        "fullNg": settings.fullNg
    }, function () {
        $('#PsaveNG').prop("disabled", true)
            .css("background-color", "lightyellow")
            .css("color", "gray")
            ;
        setTimeout(clearBtnColored, 1200, $('#PsaveNG'));
    });
}
function setPSaveCome() {
    settings.commentBackColor = parseInt($("#commentBackColor").val());
    settings.commentBackTrans = parseInt($("#commentBackTrans").val());
    settings.commentTextColor = parseInt($("#commentTextColor").val());
    settings.commentTextTrans = parseInt($("#commentTextTrans").val());
    setOptionHead();
    setStorage({
        "settings.commentBackColor": settings.commentBackColor,
        "settings.commentBackTrans": settings.commentBackTrans,
        "settings.commentTextColor": settings.commentTextColor,
        "settings.commentTextTrans": settings.commentTextTrans
    }, function () {
        $('#PsaveCome').prop("disabled", true)
            .css("background-color", "lightyellow")
            .css("color", "gray")
            ;
        setTimeout(clearBtnColored, 1200, $('#PsaveCome'));
    });
}
function clearBtnColored(target) {
    target.prop("disabled", false)
        .css("background-color", "")
        .css("color", "")
        ;
}
function setSaveClicked() {
    settings.isResizeScreen = $("#isResizeScreen").prop("checked");
    settings.isDblFullscreen = $("#isDblFullscreen").prop("checked");
    settings.isHideOldComment = $("#isHideOldComment").prop("checked");
    settings.isCMBlack = $("#isCMBlack").prop("checked");
    settings.isCMBkTrans = $("#isCMBkTrans").prop("checked");
    settings.isCMsoundoff = $("#isCMsoundoff").prop("checked");
    settings.CMsmall = Math.min(100, Math.max(5, $("#CMsmall").val()));
    settings.isMovingComment = $("#isMovingComment").prop("checked");
    settings.movingCommentSecond = parseInt($("#movingCommentSecond").val());
    settings.movingCommentLimit = parseInt($("#movingCommentLimit").val());
    //    isMoveByCSS = $("#isMoveByCSS").prop("checked");
    settings.isComeNg = $("#isComeNg").prop("checked");
    settings.isComeDel = $("#isComeDel").prop("checked");
    settings.fullNg = $("#fullNg").val();
    var beforeInpWinBottom = settings.isInpWinBottom;
    settings.isInpWinBottom = $("#isInpWinBottom").prop("checked");
    settings.isCustomPostWin = $("#isCustomPostWin").prop("checked");
    settings.isCancelWheel = $("#isCancelWheel").prop("checked");
    settings.isVolumeWheel = $("#isVolumeWheel").prop("checked");
    settings.changeMaxVolume = Math.min(100, Math.max(0, parseInt($("#changeMaxVolume").val())));
    settings.isTimeVisible = $("#isTimeVisible").prop("checked");
    settings.isSureReadComment = $("#isSureReadComment").prop("checked");
    settings.isCommentFormWithSide = $("#isCommentFormWithSide").prop("checked");
    settings.sureReadRefreshx = Math.max(101, $("#sureReadRefreshx").val());
    //    isMovieMaximize = $("#isMovieMaximize").prop("checked");
    // settings.isAlwaysShowPanel = $("#isAlwaysShowPanel").prop("checked");
    settings.commentBackColor = parseInt($("#commentBackColor").val());
    settings.commentBackTrans = parseInt($("#commentBackTrans").val());
    settings.commentTextColor = parseInt($("#commentTextColor").val());
    settings.commentTextTrans = parseInt($("#commentTextTrans").val());
    settings.isCommentPadZero = $("#isCommentPadZero").prop("checked");
    settings.isCommentTBorder = $("#isCommentTBorder").prop("checked");
    settings.timePosition = $('#itimePosition input[type="radio"][name="timePosition"]:checked').val();
    settings.notifySeconds = parseInt($("#notifySeconds").val());
    cmblockia = Math.max(1, 1 + parseInt($("#beforeCMWait").val()));
    cmblockib = -Math.max(1, 1 + parseInt($("#afterCMWait").val()));
    settings.isManualKeyCtrlR = $("#isManualKeyCtrlR").prop("checked");
    settings.isManualKeyCtrlL = $("#isManualKeyCtrlL").prop("checked");
    settings.isManualMouseBR = $("#isManualMouseBR").prop("checked");
    settings.isCMBkR = $("#isCMBkR").prop("checked") && $("#isCMBlack").prop("checked");
    settings.isCMsoundR = $("#isCMsoundR").prop("checked") && $("#isCMsoundoff").prop("checked");
    settings.isCMsmlR = $("#isCMsmlR").prop("checked") && ($("#CMsmall").val() != 100);
    settings.isTabSoundplay = $("#isTabSoundplay").prop("checked");
    // isOpenPanelwCome = $("#isOpenPanelwCome").prop("checked");
    settings.isProtitleVisible = $("#isProtitleVisible").prop("checked");
    settings.protitlePosition = $('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val();
    settings.proSamePosition = $('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
    settings.isCommentWide = $('#isCommentWide').prop("checked");
    settings.isProTextLarge = $('#isProTextLarge').prop("checked");
    settings.kakikomiwait = parseInt($('#kakikomiwait').val());
    settings.useEyecatch = $('#useEyecatch').prop("checked");
    settings.isHidePopTL = $('#isHidePopTL').prop("checked");
    settings.isHidePopBL = $('#isHidePopBL').prop("checked");
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenset[i][j] = $('#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]:checked').val();
        }
    }
    settings.comeMovingAreaTrim = $('#comeMovingAreaTrim').prop("checked");
    settings.isHideButtons = $('#isHideButtons').prop("checked");
    settings.isResizeSpacing = $('#isResizeSpacing').prop("checked");
    settings.isDeleteStrangeCaps = $('#isDeleteStrangeCaps').prop("checked");
    //    isHighlightNewCome=$('#isHighlightNewCome').prop("checked");
    settings.highlightNewCome = parseInt($('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]:checked').val());
    //    settings.isChTimetableExpand=$('#isChTimetableExpand').prop("checked");
    settings.isHidePopFresh = $('#isHidePopFresh').prop("checked");
    //    settings.isChTimetableBreak=$('#isChTimetableBreak').prop("checked");
    //    settings.isChTimetableWeekend=$('#isChTimetableWeekend').prop("checked");
    //    settings.isChTimetablePlaybutton=$('#isChTimetablePlaybutton').prop("checked");
    settings.isHideTwitterPanel = $('#isHideTwitterPanel').prop("checked");
    settings.isHideTodayHighlight = $('#isHideTodayHighlight').prop("checked");
    settings.isComelistNG = $('#isComelistNG').prop("checked");
    settings.isComelistClickNG = $('#isComelistClickNG').prop("checked");
    settings.highlightComeColor = parseInt($('#ihighlightComeColor input[type="radio"][name="highlightComeColor"]:checked').val());
    settings.highlightComePower = parseInt($('#highlightComePower').val());
    settings.isComeClickNGautoClose = $('#isComeClickNGautoClose').prop("checked");
    settings.isShareNGword = $('#isShareNGword').prop("checked");
    settings.isDelOldTime = $('#isDelOldTime').prop("checked");
    settings.isMovieSpacingZeroTop = $('#isMovieSpacingZeroTop').prop("checked");
    settings.isMovieSpacingZeroLeft = $('#isMovieSpacingZeroLeft').prop("checked");
    settings.comeFontsize = Math.min(99, Math.max(1, parseInt($('#comeFontsize').val())));
    settings.isHideVoting = $('#isHideVoting').prop("checked");
    settings.isStoreViewCounter = $('#isStoreViewCounter').prop("checked");
    settings.isComeTriming = $('#isComeTriming').prop("checked");
    settings.panelOpacity =  parseInt($("#panelOpacity").val());
    settings.comeFontsizeV = $('#comeFontsizeV').prop("checked");
    settings.proTitleFontC = $('#proTitleFontC').prop("checked");
    settings.isDelTime = $('#isDelTime').prop("checked");
    settings.mastodonFormat = $('#mastodonFormat').val();
    settings.audibleReloadWait = Math.max(0, parseInt($('#audibleReloadWait').val()));
    settings.isDAR43 = $('#isDAR43').prop("checked");
    settings.isUserDel = $('#isUserDel').prop("checked");
    settings.userNg = $('#userNg').val();
    settings.isUserHighlight = $('#isUserHighlight').prop("checked");
    settings.isShareNGuser = $('#isShareNGuser').prop("checked");
    settings.minResolution = parseInt($('#minResolution').val());
    settings.maxResolution = parseInt($('#maxResolution').val());

    arrayFullNgMaker();
    arrayUserNgMaker();
    onresize();
    setOptionHead();
    setOptionElement();
    pophideSelector(-1, 0);
    if ((settings.isShareNGword || settings.isShareNGuser) && !isNGShareInterval) { applySharedNG(); }
    optionHeightFix();
    var sm = parseInt($('#movieheight input[type="radio"][name="movieheight"]:checked').val());
    var sw = parseInt($('#windowheight input[type="radio"][name="windowheight"]:checked').val());
    //console.log("sm="+sm+",sw="+sw);
    if (sm != 0 || sw != 0) {
        var s = optionStatsUpdate(true);
        if (s[0] != 0 || s[1] != 0) {
            chrome.runtime.sendMessage({ type: "windowresize", valw: s[0], valh: s[1] }, function (r) {
                setTimeout(optionHeightFix, 1000);
                setTimeout(moveComeTopFilter, 1000);
            });
        }
    }
    //解像度設定反映
    localStorage.setItem('ext_minResolution', settings.minResolution);
    localStorage.setItem('ext_maxResolution', settings.maxResolution);
    injectXHR();
    window.dispatchEvent(resolutionSetEvent);
    $("#saveBtn").prop("disabled", true)
        .css("background-color", "lightyellow")
        .css("color", "gray")
        ;
    setTimeout(clearBtnColored, 1200, $("#saveBtn"));
}
function setProTextSizeChanged() {
    setProSamePosiChanged(false, $('#isProTextLarge').prop("checked"));
}
function setProSamePosiChanged(pophide, bigtext) {
    //console.log("setProSamePosiChanged pophide="+(pophide?"true":"false")+",bigtext="+(bigtext?"true":"false"));
    //ref:
    //setTimePosiChanged
    //setProtitlePosiChanged
    //setoptionelement
    //hideElement,popElement pophide=true 開閉遅延を考慮する
    var titleprop = "";
    var timeprop = "";
    var sameprop = "";
    if ($("#settcont").css("display") == "block") {
        if ($("#isProtitleVisible").prop("checked")) {
            titleprop = $('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val();
        }
        if ($("#isTimeVisible").prop("checked")) {
            timeprop = $('#itimePosition input[type="radio"][name="timePosition"]:checked').val();
        }
        sameprop = $('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
        if (bigtext === undefined) {
            bigtext = $("#isProTextLarge").prop("checked");
        }
    } else {
        if (settings.isProtitleVisible) {
            titleprop = settings.protitlePosition;
        }
        if (settings.isTimeVisible) {
            timeprop = settings.timePosition;
        }
        sameprop = settings.proSamePosition;
        if (bigtext === undefined) {
            bigtext = settings.isProTextLarge;
        }
    }
    if (titleprop != "") {
        createProtitle(0, bigtext);
    } else {
        createProtitle(1);
    }
    if (timeprop != "") {
        createTime(0, bigtext);
    } else {
        createTime(1);
    }
    //console.log("setProSamePosiChanged:time="+timeprop+",title="+titleprop+",same="+sameprop);
    proPositionAllReset(bigtext);
    setTimePosition(timeprop, titleprop, sameprop, bigtext);
    setProtitlePosition(timeprop, titleprop, sameprop, bigtext);
    proSamePositionFix(timeprop, titleprop, sameprop, bigtext);
    //    setTimeout(comemarginfix,(pophide?110:0),(pophide?1:0),timeprop,titleprop,sameprop,bigtext);
    setTimeout(comemarginfix, 110, 1, timeprop, titleprop, sameprop, bigtext);
}
function setProtitlePosiChanged() {
    //選択肢の表示切替だけして本体はsetProSamePosiChangedで行う
    if ($("#isProtitleVisible").prop("checked")) {
        $('#iprotitlePosition').css("display", "flex");
    } else {
        $('#iprotitlePosition').css("display", "none");
    }
    //sameposi表示切替
    if ($("#isProtitleVisible").prop("checked") && $("#isTimeVisible").prop("checked")) {
        $('#iproSamePosition').css("display", "block");
    } else {
        $('#iproSamePosition').css("display", "none");
    }
    setProSamePosiChanged();
}
function setTimePosiChanged() {
    //選択肢の表示切替だけして本体はsetProSamePosiChangedで行う
    if ($("#isTimeVisible").prop("checked")) {
        $('#itimePosition').css("display", "flex");
        $('#epnumedit').css("display", "flex");
    } else {
        $('#itimePosition').css("display", "none");
        $('#epnumedit').css("display", "none");
    }
    //sameposi表示切替
    if ($("#isProtitleVisible").prop("checked") && $("#isTimeVisible").prop("checked")) {
        $('#iproSamePosition').css("display", "block");
    } else {
        $('#iproSamePosition').css("display", "none");
    }
    setProSamePosiChanged();
}
function setCMzoomChangedR() {
    var jo = $('#isCMsmlR');
    if (parseInt($("#CMsmall").val()) == 100) {
        jo.prop("checked", false)
            .prop("disabled", true)
            ;
    } else {
        jo.prop("disabled", false);
    }
}
function setCMsoundChangedB() {
    var b = $("#isCMsoundoff").prop("checked");
    $('#CommentMukouSettings input[type="radio"][name="cmsotype"]').prop("disabled", !b);
    $('#isCMsoundR').prop("checked", false)
        .prop("disabled", !b)
        ;
}
function setCMBKChangedB() {
    var b = $("#isCMBlack").prop("checked");
    $('#CommentMukouSettings input[type="radio"][name="cmbktype"]').prop("disabled", !b);
    $('#isCMBkR').prop("checked", false)
        .prop("disabled", !b)
        ;
}
function setCMBKChangedR() {
    $('#isCMBkTrans').prop("checked", $('#CommentMukouSettings input[type="radio"][name="cmbktype"]:checked').val() == 1 ? true : false);
}
function setCMsoundChangedR() {
    $('#isTabSoundplay').prop("checked", $('#CommentMukouSettings input[type="radio"][name="cmsotype"]:checked').val() == 1 ? true : false);
}
//function panelTableUpdateA() {
//    $('#panelcustomTable [type="radio"]').val([2]);
//    cancelPopacti();
//    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["222222222222"]);
//}
//function panelTableUpdateO() {
//    $('#panelcustomTable [type="radio"][name^="d3"]').val([1]);
//    cancelPopacti();
//    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
//}
function panelTableUpdateS() {
    var jo = $('#panelcustomTable [type="radio"]');
    var jv = parseInt($('#ipanelopenset [type="radio"][name="panelopenset"]:checked').val());
    if (jv >= Math.pow(3, 12)) return;
    for (var i = 0; i < 4; i++) {
        for (var j = 0, m, d; j < 3; j++) {
            m = Math.pow(3, (3 - i) * 3 + (2 - j));
            d = 0;
            while (m <= jv) {
                jv -= m;
                d++;
            }
            if (d < 3) jo.filter('[name^="d' + i + '' + j + '"]').val([d]);
        }
    }
    cancelPopacti();
}
function panelTableUpdateT() {
    $('#ipanelopenset [type="radio"][name="panelopenset"]').val([531441]);
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            if (parseInt($('#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]:checked').val()) != 0) {
                cancelPopacti();
                return;
            }
        }
    }
    //全て非表示になったとき
    putPopacti();
}
function cancelPopacti() {
    popacti = false;
    $('#popacti').css("display", "none");
}
function putPopacti() {
    popacti = true;
    if ($('#popacti').length == 0) {
        $('<span id="popacti" style="display:block;color:black;background-color:yellow;font-weight:bold;padding:2px 4px;">※全て非表示の場合、右矢印を51連打すると、右ボタンが常時表示に切替わります<br>（押しっ放しでも可）</span>').insertAfter('#panelcustomTable');
    } else {
        $('#popacti').css("display", "block");
    }
}
function setComeColorChanged() {
    //console.log("setComeColorChanged");
    var p = [];
    var jo = $('#CommentColorSettings input[type="range"]');
    for (var i = 0; i < jo.length; i++) {
        var jq = jo.eq(i);
        var jv = jq.val();
        jq.prevAll('span.prop').text(jv + " (" + Math.round(jv * 100 / 255) + "%)");
        p[i] = jv;
    }
    var bc = "rgba(" + p[0] + "," + p[0] + "," + p[0] + "," + (p[1] / 255) + ")";
    var tc = "rgba(" + p[2] + "," + p[2] + "," + p[2] + "," + (p[3] / 255) + ")";
    var js = $(EXcomelist).children().slice(0, 10);
    js.css("background-color", bc)
        .css("color", tc)
        ;
        //.children('[class^="styles__message___"]').css("color", tc)
    if (comelistClasses.message) js.children('.' + comelistClasses.message).css("color", tc);
    if (settings.isCommentTBorder) {
        var vc = "rgba(" + p[2] + "," + p[2] + "," + p[2] + "," + (0.3) + ")";
        js.css("border-top", "1px solid " + vc);
    }
}
function toggleCommentList() {
    console.log("comevisiset toggleCommentList");
    //    var jo=$(EXcomelist).parent();
    var jo = $(EXcomelist).parent().add('#copycome');
    //display:noneだと崩れるので変更
    //重なっていて下にあるfooterの音量ボタン等を使用できるようにpointer-eventsを利用
    var jv = jo.css("visibility");
    if (jv != "hidden") {
        jo.css("visibility", "hidden")
            .css("opacity", 0)
            ;
        $(EXcome).css("pointer-events", "none");
        $(EXcomesend).css("pointer-events", "auto");
    } else {
        jo.css("visibility", "")
            .css("opacity", "")
            ;
        $(EXcome).css("pointer-events", "");
        $(EXcomesend).css("pointer-events", "");
    }
}
function pophideElement(inp) {
    //console.log(inp);
    //inpを1(pop),-1(hide),0(除去)で受け取る
    //除去前の中身はチェックせずに除去する
    if (EXfoot === undefined) return; //未setEXs：now-on-air未表示：pophideする必要が無い
    if (inp.allreset == true) {
        inp.head = 0;
        inp.foot = 0;
        inp.side = 0;
        inp.programinfo = 0;
        inp.channellist = 0;
        inp.commentlist = 0;
    }
    var comefix = false;
    if (inp.head !== undefined) {
        comefix = true;
        if (inp.head == 1) {
            EXhead.style.visibility = "visible";
            EXhead.style.opacity = "1";
            EXhead.style.transform = "translate(0)";
        } else if (inp.head == -1) {
            EXhead.style.visibility = "hidden";
            EXhead.style.opacity = "0";
            EXhead.style.transform = "translateY(-100%)";
        } else if (inp.head == 0) {
            EXhead.style.visibility = "";
            EXhead.style.opacity = "";
            EXhead.style.transform = "";
        }
    }
    if (inp.foot !== undefined) {//EXcountviewもfootに連動させる
        comefix = true;
        if (inp.foot == 1) {
            EXfoot.style.visibility = "visible";
            EXfoot.style.opacity = "1";
            EXfoot.style.transform = "translate(0)";
            EXcountview.style.visibility = "visible";
            EXcountview.style.opacity = "1";
            EXcountview.style.transform = "translate(0)";
        } else if (inp.foot == -1) {
            EXfoot.style.visibility = "hidden";
            EXfoot.style.opacity = "0";
            EXfoot.style.transform = "translateY(100%)";
            EXcountview.style.visibility = "hidden";
            EXcountview.style.opacity = "0";
            EXcountview.style.transform = "translateY(100%)";
        } else if (inp.foot == 0) {
            EXfoot.style.visibility = "";
            EXfoot.style.opacity = "";
            EXfoot.style.transform = "";
            EXcountview.style.visibility = "";
            EXcountview.style.opacity = "";
            EXcountview.style.transform = "";
        }
    }
    if (inp.side == 1) {
        EXside.style.transform = "translateY(-50%)";
        if (settings.isSureReadComment && settings.isCommentFormWithSide) {
            $(EXcomesend).show();
        }
    } else if (inp.side == -1) {
        EXside.style.transform = "translate(100%, -50%)";
        if (settings.isSureReadComment && settings.isCommentFormWithSide) {
            $(EXcomesend).hide();
        }
    } else if (inp.side == 0) {
        EXside.style.transform = "";
    }
    if (inp.programinfo == 1) {
        EXinfo.style.transform = "translateX(0px)";
    } else if (inp.programinfo == -1) {
        EXinfo.style.transform = "translateX(100%)";
    } else if (inp.programinfo == 0) {
        EXinfo.style.transform = "";
    }
    if(EXchli){
        if (inp.channellist == 1) {
            EXchli.style.transform = "translateX(0px)";
        } else if (inp.channellist == -1) {
            EXchli.style.transform = "translateX(100%)";
        } else if (inp.channellist == 0) {
            EXchli.style.transform = "";
        }
    }
    if (inp.commentlist == 1) {
        EXcome.style.transform = "translateX(0px)";
    } else if (inp.commentlist == -1) {
        EXcome.style.transform = "translateX(100%)";
    } else if (inp.commentlist == 0) {
        EXcome.style.transform = "";
    }
    if (comefix) {
        setTimeout(setProSamePosiChanged, 110, true);
    }
}
function comemarginfix(repeatcount, inptime, inptitle, inpsame, inpbig) {
    //旧comevisiset
    //setProSamePosiChangedから呼ぶ
    //黒帯パネルとコメント欄が重なるのを防ぎ
    //番組残り時間とタイトルの分を考慮して入力欄周辺とコメ欄端のmarginを設定する
    //再試行はヘッダとフッタの開閉遅延を考慮
    //音量ボタン等の高さ位置はここで調整
    var jform = $(EXcomesend);
    var jcome = $(EXcomesend).siblings().map(function(i,e){if(e==EXcomelist||$(e).find(EXcomelist).length>0)return e;}).first();
    var jfptop = 0; //jformのpadding-top
    var jfpbot = 0;
    var jfmtop = 0; //jformのmargin-top
    var jfmbot = 0;
    var jcmtop = 0; //jcomeのmargin-top
    var jcmbot = 0;
    var jccont = $(EXcome);
    var jcct = 0; //jccontのtop
    var jcchd = 0; //jccontのheightの100%からの減り分(最後にcalcで100%から引く)
    var htime = settings.isTimeVisible ? ($('#forProEndTxt').height() + parseInt($('#forProEndTxt').css("padding-top")) + parseInt($('#forProEndTxt').css("padding-bottom")) + parseInt($('#forProEndTxt').css("margin-top")) + parseInt($('#forProEndTxt').css("margin-bottom"))) : 0;
    var htitle = settings.isProtitleVisible ? ($('#tProtitle').height() + parseInt($('#tProtitle').css("padding-top")) + parseInt($('#tProtitle').css("padding-bottom")) + parseInt($('#tProtitle').css("margin-top")) + parseInt($('#tProtitle').css("margin-bottom"))) : 0;
    var ptime = (inptime !== undefined) ? inptime : (settings.isTimeVisible ? settings.timePosition : "");
    var ptitle = (inptitle !== undefined) ? inptitle : (settings.isProtitleVisible ? settings.protitlePosition : "");
    var psame = (inpsame !== undefined) ? inpsame : settings.proSamePosition;
    //画面上部の設定
    if (!(settings.isComeTriming && settings.isSureReadComment) && $(EXhead).css("visibility") == "visible") {
        //ヘッダ表示時
        if (settings.isInpWinBottom) {
            //入力欄が下＝コメ欄が上＝対象はjcomeのtopmargin
            if (ptime == "windowtop" && ptitle == "windowtopright" && psame == "vertical") {
                jcmtop = Math.max(htime + htitle - 8, headerHeight);
            } else {
                jcmtop = headerHeight;
            }
            jcct = jcmtop;
            jcchd += jcmtop;
        } else {
            //入力欄が上＝対象はjformのtopmargin＋番組情報(コメ上)
            if (ptime == "windowtop" && ptitle == "windowtopright" && psame == "vertical") {
                jfmtop = Math.max(htime + htitle - 8, headerHeight);
            } else {
                jfmtop = headerHeight;
            }
            if (ptime == "commentinputtop" && ptitle == "commentinputtopright" && psame == "vertical") {//(ptitle=="commentinputtopleft"||
                jfptop = Math.max(htime + htitle, 15);
            } else if (ptime == "commentinputtop" || (ptitle == "commentinputtopleft" || ptitle == "commentinputtopright")) {
                jfptop = Math.max(htime, htitle, 15);
            } else {
                jfptop = 15;
            }
            jcct = jfmtop;
            jcchd += jfmtop;
        }
    } else {
        //ヘッダ非表示時
        if (settings.isInpWinBottom) {
            if (ptime == "windowtop" && ptitle == "windowtopright" && psame == "vertical") {
                jcmtop = htime + htitle;
            } else if (ptime == "windowtop" || ptitle == "windowtopright") {
                jcmtop = Math.max(htime, htitle);
            } else {
                jcmtop = 0;
            }
            jcct = jcmtop;
            jcchd += jcmtop;
        } else { //jftop
            let margincut = 0;
            if ((ptime == "windowtop" || ptitle == "windowtopright") && (ptime != "commentinputtop" && ptitle != "commentinputtopright" && ptitle != "commentinputtopleft")) {
                //ウィンドウ右上に何かあり、入力欄の上には何も無いとき
                margincut = 15;
            } else if (ptime != "windowtop" && ptitle != "windowtopright") {
                //ウィンドウ右上には何も無いとき
                margincut = 15;
            }
            if (ptime == "windowtop" && ptitle == "windowtopright" && psame == "vertical") {
                jfmtop = htime + htitle - margincut;
            } else if (ptime == "windowtop" || ptitle == "windowtopright") {
                jfmtop = Math.max(htime, htitle, 15) - margincut;
            } else {
                jfmtop = 15 - margincut;
            }
            if (ptime == "commentinputtop" && ptitle == "commentinputtopright" && psame == "vertical") {//(ptitle=="commentinputtopleft"||
                jfptop = Math.max(htime + htitle, 15);
            } else if (ptime == "commentinputtop" || (ptitle == "commentinputtopleft" || ptitle == "commentinputtopright")) {
                jfptop = Math.max(htime, htitle, 15);
            } else {
                jfptop = 15;
            }
            jcct = jfmtop;
            jcchd += jfmtop;
        }
    }
    //フッタ表示かつコメ入力下の場合は音量ボタン等の下位置を上げる
    var volshift = false;
    $(EXvolume).css("bottom", "");
    $(EXfullscr).css("bottom", "");
    
    if (!(settings.isComeTriming && settings.isSureReadComment) && $(EXfoot).css("visibility") == "visible") {
        //フッタ表示時
        if (settings.isInpWinBottom) { // jctop,jfbot
            if (isComeOpen()) {
                volshift = true;
            }
            //            jfmbot=$(EXfoot).children('[class^="TVContainer__footer___"]').height();
            jfmbot = footerHeight;//old:61
            if (ptime == "commentinputbottom" && ptitle == "commentinputbottomright" && psame == "vertical") {//(ptitle=="commentinputbottomleft"||
                jfpbot = Math.max(htime + htitle, 15);
            } else if (ptime == "commentinputbottom" || (ptitle == "commentinputbottomleft" || ptitle == "commentinputbottomright")) {
                jfpbot = Math.max(htime, htitle, 15);
            } else {
                jfpbot = 15;//footerHeight;
            }
            jcchd += jfmbot;
        } else { // jftop,jcbot
            //            jcmbot=$(EXfoot).children('[class^="TVContainer__footer___"]').height();
            jcmbot = footerHeight;//old:61
            jcchd += jcmbot;
        }
    } else {
        //フッタ非表示時
        if (settings.isInpWinBottom) { // jctop,jfbot
            let margincut = 0;
            if ((ptime == "windowbottom" || ptitle == "windowbottomright") && (ptime != "commentinputbottom" && ptitle != "commentinputbottomright" && ptitle != "commentinputbottomleft")) {
                //ウィンドウ右下に何かあり、入力欄の下には何も無いとき
                margincut = 15;
            } else if (ptime != "windowbottom" && ptitle != "windowbottomright") {
                //ウィンドウ右下には何も無いとき
                margincut = 15;
            }
            if (ptime == "windowbottom" && ptitle == "windowbottomright" && psame == "vertical") {
                jfmbot = htime + htitle - margincut;
            } else if (ptime == "windowbottom" || ptitle == "windowbottomright") {
                jfmbot = Math.max(htime, htitle, 15) - margincut;
            } else {
                jfmbot = 15 - margincut;
            }
            if (ptime == "commentinputbottom" && ptitle == "commentinputbottomright" && psame == "vertical") {//(ptitle=="commentinputbottomleft"||
                jfpbot = Math.max(htime + htitle, 15);
            } else if (ptime == "commentinputbottom" || (ptitle == "commentinputbottomleft" || ptitle == "commentinputbottomright")) {
                jfpbot = Math.max(htime, htitle, 15);
            } else {
                jfpbot = 15;
            }
            jcchd += jfmbot;
        } else { // jftop,jcbot
            if (ptime == "windowbottom" && ptitle == "windowbottomright" && psame == "vertical") {
                jcmbot = htime + htitle;
            } else if (ptime == "windowbottom" || ptitle == "windowbottomright") {
                jcmbot = Math.max(htime, htitle);
            } else {
                jcmbot = 0;
            }
            jcchd += jcmbot;
        }
    }
    if (settings.isInpWinBottom) { //jctop,jfbot,jftop
        if (ptime == "commentinputtop" && ptitle == "commentinputtopright" && psame == "vertical") {//(ptitle=="commentinputtopleft"||
            jfptop = Math.max(htime + htitle, 15);
        } else if (ptime == "commentinputtop" || (ptitle == "commentinputtopleft" || ptitle == "commentinputtopright")) {
            jfptop = Math.max(htime, htitle, 15);
        } else {
            jfptop = 15;
        }
    } else { //jftop,jcbot,jfbot
        if (ptime == "commentinputbottom" && ptitle == "commentinputbottomright" && psame == "vertical") {//(ptitle=="commentinputbottomleft"||
            jfpbot = htime + htitle;
        } else if (ptime == "commentinputbottom" || (ptitle == "commentinputbottomleft" || ptitle == "commentinputbottomright")) {
            jfpbot = Math.max(htime, htitle, 15);
        } else {
            jfpbot = 15;
        }
    }

    jccont.css("top", jcct)
        .css("height", "calc(100% - " + jcchd + "px)")
        ;
    //AbemaTV Screen Comment Scrollerスクリプトによるコメ欄paddingをキャンセルする
    jccont.children().css('padding-top', '0px');
    //console.log("form padding top, bottom", jfptop, jfpbot);
    if (settings.isInpWinBottom) {
        jform.css("padding-top", jfptop)
            .css("padding-bottom", jfpbot)
            ;
    } else {
        jform.css("padding-top", jfptop)
            .css("padding-bottom", jfpbot)
            ;
    }
    //    jform.css("margin-top",jfmtop)
    //        .css("margin-bottom",jfmbot)
    //        .css("padding-top",jfptop)
    //        .css("padding-bottom",jfpbot)
    //    ;
    //    jcome.css("margin-top",jcmtop)
    //        .css("margin-bottom",jcmbot)
    //    ;
    if (volshift) {
        $(EXvolume).css("bottom", (80 + jform.height() + jfptop + jfpbot) + "px");
        $(EXfullscr).css("bottom", (80 + jform.height() + jfptop + jfpbot) + "px");
    }
    if (repeatcount > 0) {
        setTimeout(comemarginfix, 300, repeatcount - 1, inptime, inptitle, inpsame, inpbig);
    }
}
function addExtClass(elm, className){
    //return ;
    className = 'ext_abm-'+className;
    $('.'+className).removeClass(className);
    $(elm).addClass(className);
}
function setEXs() {
    //ロード直後に取得が期待できるやつ
    //obliが遅くinfoはもっと遅い
    //infoはdelaysetの方でやる
    if (checkUrlPattern(true) != 3) return;
    var b = true;
    if (                                                                                  $('#main' ).length == 0 || !( EXmain          = $('#main' )[0] ))    b = false;// console.log("#main"); }
    if (! EXhead          &&!( EXhead          = getElm.getHeaderElement()                 ) /*&& ($('.P_R'  ).length == 0 || !( EXhead          = $('.P_R'  )[0] ))*/) b = false;// console.log("head"); }//AppContainer__header-container___
    if (! EXmenu          &&!( EXmenu          = getMenuElement()                ) /*&& ($('.Fb_Fi').length == 0 || !( EXmenu          = $('.Fb_Fi')[0] ))*/) b = false;
    if (! EXfoot          &&!( EXfoot          = getElm.getFooterElement()                 ) /*&& ($('.v3_v_').length == 0 || !( EXfoot          = $('.v3_v_')[0] ))*/) b = false;// console.log("foot"); }//TVContainer__footer-container___
    if (! EXfootcome      &&!( EXfootcome      = getFootcomeElement()            ) /*&& ($('.mb_mo').length == 0 || !( EXfootcome      = $('.mb_mo')[0] ))*/) b = false;// console.log("footcome"); }//右下の入れ物
    if (! EXcountview     &&!( EXcountview     = getElm.getViewCounterElement()            ) /*&& ($('.Eu_e' ).length == 0 || !( EXcountview     = $('.Eu_e' )[0] ))*/) b = false;// console.log("footcountview"); }//閲覧数
    if (! EXfootcountcome &&!( EXfootcountcome = getFootcomeBtnElement()         ) /*&& ($('.JH_e' ).length == 0 || !( EXfootcountcome = $('.JH_e' )[0] ))*/) b = false;// console.log("footcountcome"); }//コメント数
    if (! EXside          &&!( EXside          = getSideElement()                ) /*&& ($('.v3_v5').length == 0 || !( EXside          = $('.v3_v5')[0] ))*/) b = false;// console.log("side"); }//TVContainer__side___
//    if (! EXchli          &&!( EXchli          = getChannelListElement()         ) /*&& ($('.mT_e' ).length == 0 || !( EXchli          = $('.mT_e' )[0] ))*/) b = false;// console.log("chli"); }
//    if (! EXinfo          &&!( EXinfo          = getInfoElement()                ) /*&& ($('.v3_wg').length == 0 || !( EXinfo          = $('.v3_wg')[0] ))*/) b = false;// console.log("info"); }//TVContainer__right-slide___
    if (! EXcomesendinp   &&!( EXcomesendinp   = getComeFormElement(0)           ) /*&& ($('.HH_HN').length == 0 || !( EXcomesendinp   = $('.HH_HN')[0] ))*/) b = false;// console.log("comesendinp"); }
    if (! EXcomesend      &&!( EXcomesend      = getComeFormElement(1)           ) /*&& ($('.HH_e' ).length == 0 || !( EXcomesend      = $('.HH_e' )[0] ))*/) b = false;// console.log("comesend"); }
    if (! EXcome          &&!( EXcome          = getComeFormElement(2)           ) /*&& ($('.v3_wi').length == 0 || !( EXcome          = $('.v3_wi')[0] ))*/) b = false;// console.log("come"); }//TVContainer__right-comment-area___
    if (! EXvolume        &&!( EXvolume        = getElm.getVolElement()                 ) /*&& ($('.mb_mk').length == 0 || !( EXvolume        = $('.mb_mk')[0] ))*/) b = false;// console.log("vol"); }
    if (! EXfullscr       &&!( EXfullscr       = getElm.getFullScreenElement()          ) /*&& ($('.mb_mi').length == 0 || !( EXvolume        = $('.mb_mi')[0] ))*/) b = false;// console.log("vol"); }
//    if (! EXobli          &&!( EXobli          = getObliElement()                ) /*&& ($('.v3_ws').length == 0 || !( EXobli          = $('.v3_ws')[0] ))*/) b = false;// console.log("obli"); }//TVContainer__tv-container___
    if (! EXvideoarea     &&!( EXvideoarea     = getElm.getVideoAreaElement()    )) b = false;
//    if (! EXcomelist      &&!( EXcomelist      = getComeListElement()            ) /*&& ($('.uo_e' ).length == 0 || !( EXcomelist      = $('.uo_e' )[0] ))*/) b = false;
    EXfootcount = EXfootcome;//仕様変更により右下にはコメント数のみとなった

    if (b == true) {
        // class付与
        addExtClass(EXhead, 'header');
        addExtClass(EXmenu, 'menu');
        addExtClass(EXfoot, 'footer');
        addExtClass(EXfootcome, 'footcome');
        addExtClass(EXcountview, 'countview');
        addExtClass(EXfootcountcome, "footcountcome");
        addExtClass(EXside, 'sideButton');
        //addExtClass(EXchli, "channelList");
        //addExtClass(EXinfo, 'info');
        addExtClass(EXcome, 'come');
        addExtClass(EXcomesend, 'comesend');
        addExtClass(EXcomesendinp, 'comesendinput');
        addExtClass(EXvolume, 'volume');
        addExtClass(EXfullscr, 'fullscr');
        //addExtClass(EXobli, 'objectlist');
        addExtClass(EXvideoarea, 'videoarea');
        addExtClass(EXcomelist, 'comelist');

        console.log("%csetEXs ok", 'color:green;');
        //setEX2(); 残ってたchli.scrollをdelaysetに移動させてsetex2を空にした
        setOptionHead();    //各オプションをhead内に記述
        setOptionElement(); //各オプションを要素に直接適用
        setOptionEvent();   //各オプションによるイベントを作成
    } else {
        console.log("setEXs retry "+(EXhead?".":"H")+(EXmenu?".":"M")+(EXfoot?".":"F")+(EXfootcome?"..":"Fc")+(EXcountview?".":"V")+(EXfootcountcome?"..":"Fb")+(EXside?".":"S")+(EXcomesendinp?"..":"Ct")+(EXcomesend?"..":"Cf")+(EXcome?".":"C")+(EXvolume?"..":"Vo")+(EXfullscr?"..":"Fs")+(EXvideoarea?"..":"Va")+(EXcomelist?"..":"Cl"));
        setTimeout(setEXs, 1000);
    }
}

function getFootcomeElement(returnSingleSelector) {
    //console.log("?footcome");
    //コメントアイコンを孫にもち左下のチャンネルロゴと共通の親をもつものをfootcomeとする
    var cn = getInfo.getChannelByURL();
    if (!cn){console.log("?footcome(!cn)");return null;}
    var reb = $(EXfoot).find('img[src*="/channels/logo/' + cn + '"]').get(0);
    if(!reb){console.log("?footcome(!reb)");return null;}
    var ret = $(EXfoot).find($('[*|href*="/comment.svg"][*|href$="#svg-body"]:not([href])')).get(0);
    if(!ret){console.log("?footcome(!ret)");return null;}
    var rep=ret.parentElement;
    while(!$(ret).is(EXfoot)&&$(rep).find(reb).length==0){
        ret=rep;
        rep=ret.parentElement;
    }
    if($(ret).is(EXfoot)){console.log("?footcome(ret=EXfoot)");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}

function getFootcomeBtnElement(returnSingleSelector){
    if(!EXfootcome) return null;
    var ret=$(EXfootcome).find("button")[0];
    if(!ret) return null;
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getSideElement(returnSingleSelector) {
    //console.log("?side");
    //リストアイコンを孫にもち右方にあるものをsideとする
    var listIcon = $('[*|href*="/list.svg"][*|href$="#svg-body"]:not([href])');
    //フッターにあるものを除外
    if(!EXfoot){return null;}
    var ret = null;
    for(var i=0; i<listIcon.length; i++){
        if($(EXfoot).has(listIcon.get(i)).length==0){ret = listIcon.get(i);}
    }
    if(!ret){console.log("?side");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth*3/4){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?side");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getInfoElement(returnSingleSelector) {
    //console.log("?info");
    //ズバリ番組概要と書かれた要素を孫にもち右方にあるものをinfoとする
    //copyinfo後だとinfoのdisplay:noneでclientrectが取れない
    let ret = null;
    let h3a=document.getElementsByTagName('h3');
    ret = Array.from(h3a).filter(e=>{return e.textContent.indexOf("詳細情報")>=0})[0];
    if(!ret){
        //CM中など↑で取得できないことがあるのでEXchliの次もしくはsideButtonの次の次を使う
        if(EXchli){
            ret = $(EXchli).next().get(0);
            console.log("?info -> EXchli next");
        }else if(EXside){
            ret = $(EXside).next().next().get(0);
            console.log("?info -> EXside next next");
        }
        if(!ret){console.log("?info");return null;}
    }
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth/2){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?info");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}

function getComeFormElement(sw,returnSingleSelector) {
    //sw 0:come 1:form 2:textarea
    //0 placeholderにコメントを含むtextarea
    //1 〃を含むform
    //2 〃を含んで右にあるやつ
    var e;
    if(sw!=0&&!(e=EXcomesendinp)){console.log("?comeform"+sw+"(EX=null)");return null;}
    //console.log("?comesend");
    var ret = null;
    if(sw==0){
        var taa=document.getElementsByTagName('textarea');
        for(var i=0,ti,p,b;(ti=taa[i]);i++){
            if(ti.placeholder.indexOf("コメント")<0) continue;
            ret=ti;
            break;
        }
    }else if(sw==1){
        while(e.tagName.toUpperCase()!="BODY"&&e.tagName.toUpperCase()!="FORM") e=e.parentElement;
        if(e.tagName.toUpperCase()=="BODY"){console.log("?comeform"+sw+"(e=BODY)");return null;}
        ret=e;
    }else if(sw==2){
        let p=e.parentElement;
        let b=p.getBoundingClientRect();
        while(p.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth*2/3){
            e=p;
            p=e.parentElement;
            b=p.getBoundingClientRect();
        }
        if(p.tagName.toUpperCase()=="BODY"){console.log("?comeform"+sw+"(p=BODY)");return null;}
        ret=e;
    }
    if(!ret){console.log("?comeform"+sw+"(ret=null)");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getComeListElement(returnSingleSelector){
    console.log("?comelist");
    //EXcomeの中で秒前とかを探して5人以上の親をcomelistとする
    //下からだとanimatedが引っかかるので上から探す
    //無ければ <p>この番組には<br>まだ投稿がありません</p> の親divとしてみたけどやめて大丈夫そうならやめたいが、
    //やっぱりanimatedに引っかかる(初回は全部animated)からまだ投稿～で取るようにする
    var ret=null;
    var jo=$(EXcome).find("span,p");
    if(jo.length<5){
        //無投稿メッセージ探す
        for(var i=0,ji;i<jo.length;i++){
            ji=jo.eq(i);
            if(ji.text().indexOf("まだ投稿がありません")<0) continue;
            comelistClasses.empty=ji.prop("class");
            ret=ji.parent("div")[0];
            console.log('indexOf投稿なし>=0 @getComeListElement emptyC=',ji.prop("class"));
            break;
        }
        if(!ret){
            //無投稿メッセージがなければプログレスsvg
            var jpd = $(EXcome).find('div[role=progressbar]').parents().eq(1);
            if(jpd.length>0){
                comelistClasses.progress=jpd.prop('class');
                ret=jpd.parent('div')[0];
                console.log('div[role=progressbar].l>0 @getComeListElement emptyC=',jpd.prop("class"));                
            }
        }
        if(!ret){console.log("?comelist(emptylist or progress notfound)");return null;}
        return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
    }

    for(let i=0,t,ji;i<jo.length;i++){
        ji=jo.eq(i);
        t=ji.text();
        if(t.indexOf("今")<0&&t.indexOf("秒前")<0&&t.indexOf("分前")<0) continue; //この辺でcomelistClassesを取得したいがまだ分離が不完全
        ret=true;
        jo=ji.parentsUntil(EXcome);
        break;
    }
    if(!ret){console.log("?comelist(time notfound)");return null;}
    ret=null;
    console.log(jo)
    for(let i=jo.length-1,j;i>=0;i--){
        j=jo.eq(i);
        if(j.find(EXcomesend).length>0) continue;
        //console.log(j,j.children(),j.css('height'),j.css('transition'))        
        if(j.children().length<5) continue;
        //if(j.parent())
        ret=jo[i];
        break;
    }
    //↑ではanimationが引っかかっている可能性があるのでanimationの部分なら親の親に置き換える
    //とりあえず親の親の親がformと兄弟もしくはref=containerならanimationの部分と判定する
    if(ret){
        var gp = ret.parentElement.parentElement;
        var jgpp = $(gp).parent();
        if(jgpp.siblings('form').length>0||jgpp.attr('data-ext-ref')=='container'){
            comelistClasses.animated = $(ret).parent().attr('class');
            ret=gp;
            console.log('jgpp.sib(form).l>0||jgppExtRef==container @getComeListElement aniC=',comelistClasses.animated);
        }
    }
    if(!ret){console.log("?comelist(children notfound)");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}

function getMenuElement(returnSingleSelector){
    //head内にあること前提でリンクが多いのを選ぶ
    var ret=null;
    var jo=$(EXhead).find('a');
    var la=[];
    var ac=0;
    for(var i=0,ji,jp,et=null,lc=0;i<jo.length;i++){
        ji=jo.eq(i);
        jp=ji.parent();
        if(et==jp[0]) lc++;
        else{
            if(lc>0) la[ac++]=[et,lc];
            et=jp[0];
            lc=0;
        }
    }
    if(lc>0) la[ac++]=[et,lc];//上のループがet==jp[0]で終わった時用
    for(let i=0,m=0;i<la.length;i++){
        if(m<la[i][1]){
            m=la[i][1];
            ret=la[i][0];
        }
    }
    if(!ret){console.log("?menu");return null;}
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getMenuObject() {
    console.log("?menu");
    //2番目に多くリンクを子にもつ親をMenuとする(1番目は放送中一覧)
    var ret = null;
    var links = document.links;
    var alinks = [];
    for (var i = links.length - 1, ilink, ilinkp, tlinkp = null, tlinkc = 0; i >= 0; i--) {
        ilink = links[i];
        ilinkp = ilink.parentElement;
        if (ilinkp == tlinkp) {
            tlinkc++;
        } else {
            if (tlinkc > 5) {//6以上のリンクを持つものに限る
                alinks[alinks.length] = [tlinkp, tlinkc];
            }
            tlinkp = ilinkp;
            tlinkc = 0;
        }
    }
    if (alinks.length == 1) {
        ret = $(alinks[0][0]);
    } else if (alinks.length > 1) {
        var si = -1;
        for (let i = alinks.length - 1, m = 0, mi = -1; i >= 0; i--) {
            if (m < alinks[i][1]) {
                si = mi;
                m = alinks[i][1];
                mi = i;
            }
        }
        if (si >= 0) {
            ret = $(alinks[si][0]);
        }
    }
    return ret;
}
function getVolbarObject(){
    var ret=null;
    //EXvolume内で細くて背景に彩度がありそうなのを選ぶ
    var jo = $(EXvolume).find("div");
    var re=/rgba? *\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *\d+ *,?)? *\)/;
    for(var i=0,j,r,g,b,w;i<jo.length;i++){
        w=jo.eq(i).width();
        if(w<5&&w>0){
            j=re.exec(jo.eq(i).css("background-color"));
            r=parseInt(j[1]);
            g=parseInt(j[2]);
            b=parseInt(j[3]);
            if((r<5||g<5||b<5)&&(r>5||g>5||b>5)){
                ret=jo.eq(i);
                break;
            }
        }
    }
    return ret;
}
function getReceiveNotifyElement(returnSingleSelector){
    //idがあるので利用する
    var ret=$('input#1')[0];
    if(!ret) return null;
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.height<window.innerHeight/4&&b.width<window.innerWidth/4&&b.top>window.innerHeight*2/3&&b.left+b.width<window.innerWidth*2/3){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase=="BODY") return null;
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getReceiveTwtElement(returnSingleSelector){
    //左下にあるtwtアイコンの親で左下のを選ぶ
    var jo=$('[*|href*="/images/icons/twitter.svg"][*|href$="#svg-body"]:not([href])');
    var ret=null;
    for(var i=0;i<jo.length;i++){
        if(jo.eq(i).offset().top<window.innerHeight*2/3||jo.eq(i).offset().left>window.innerWidth*2/3) continue;
        ret=jo[i];
        break;
    }
    if(!ret) return null;
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.height<window.innerHeight/2&&b.width<window.innerWidth/2&&b.top>window.innerHeight/4&&b.left+b.width<window.innerWidth*2/3){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase=="BODY") return null;
    return returnSingleSelector?dl.getElementSingleSelector(ret):ret;
}
function getComeModuleElements(returnSingleSelector){
    //投稿ボタンの祖先でtextareaと共通の祖先の子 と投稿ボタン とtwtコンテナを返す
    let jo=$(EXcomesend).find("button");
    var ret=[null,null,null];
    for(var i=0;i<jo.length;i++){
        if(jo.eq(i).text().indexOf("投稿")<0) continue;
        ret[1]=jo[i];
        jo=jo.eq(i).parentsUntil(EXcome);
        break;
    }
    if(!ret[1]) return ret;
    if(jo.length<2) return ret;
    for(let i=1;i<jo.length;i++){
        if(jo.eq(i).find(EXcomesendinp).length==0) continue;
        ret[0]=jo[i-1];
        break;
    }
    if(!ret[0]) return ret;

    jo=$(ret[0]).find($('[*|href*="/images/icons/twitter.svg"][*|href$="#svg-body"]:not([href])'));
    if(jo.length==0) return null;
    var jp=jo.first().parentsUntil(ret[0]);
    for(var r=0,js,jd;r<jp.length;r++){
        js=jp.eq(r).find('span');
        if(js.length==0) continue;
        jd=null;
        for(var c=0;c<js.length;c++){
            if(js.eq(c).text().indexOf("連携")<0) continue;
            jd=js.eq(c);
            break;
        }
        if(!jd) continue;
        for(var k=r;k+1<jp.length;k++){
            //console.log(4363,jp.eq(k+1).innerWidth(),jp.eq(k).innerWidth())
            if(jp.eq(k+1).innerWidth()==0||jp.eq(k).innerWidth()==0) break;
            if(jp.eq(k+1).innerWidth()<jp.eq(k).innerWidth()+10) continue;
            ret[2]=jp[k];
            break;
        }
        break;
    }
    if(returnSingleSelector){
        ret[0]=dl.getElementSingleSelector(ret[0]);
        ret[1]=dl.getElementSingleSelector(ret[1]);
        ret[2]=dl.getElementSingleSelector(ret[2]);
    }
    return ret;
}
function getVideoRouteClasses(){
    //EXobli>各chコンテナ>背景画像,videoの親..からvideoの親のclassを選ぶ
    let videoContainer = dl.parentsFilterLast(getElm.getVideo(),{filters:[e=>e.parentElement===EXvideoarea]});
    //var jo= $(EXobli).find('video,object').first().parentsUntil(EXobli).eq(-2);
    //return [jo.first().prop("class"), jo.siblings('img[src*="/channels/logo/"]').first().prop("class")];
    return [videoContainer.getAttribute('class'), videoContainer.parentElement.querySelector(':scope>img[src*="/channels/logo/"]').getAttribute('class')];
}
function getTTProgramTitleClass(){
    // 0:ビデオのN、1～その他、10くらいから番組タイトル
    //後ろから取るが、番組表の後ろに要素が新設されても対応できるように適当なオフセットを設けておく
    return $(EXTTbody).find('span').map(function (i, e) { if (e.childElementCount == 0 && e.className != "" && e.textContent != "") return e; }).eq(-5).prop("class");
}
function getTTTimeClassesFromPT(proTitleClass) {
    // return[] 0:過去 1:放送中 2:放送予定 の背景を司るクラスを番組タイトルクラスから探す
    // programtitleの親の(articleの子の)buttonの子のdivが灰/緑/白の背景を持っているのでそれを探す
    // '.'を付けたクラス名で受ける(ここでは付けない)
    var ret = [null, null, null];
    if (!proTitleClass) {
        proTitleClass = getTTProgramTitleClass();
        if (!proTitleClass) return ret;
        else proTitleClass = "." + proTitleClass;
    }

    var jb = $(EXTTbody);
    var jo = jb.find(proTitleClass);
    var re = /rgba?\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *\d+ *,?)? *\)/;
    var rs = /\s/;
    var rr = /^\s+|\s+$/g;
    var classes = [null, null, null,];
    for (var i = 0, j, t, e, r, g, b, c; i < jo.length; i++) {
        j = jo.eq(i).parentsUntil("button").last();
        t = j.css("background-color");
        if (!re.test(t)) continue;
        e = re.exec(t);
        r = parseInt(e[1]);
        g = parseInt(e[2]);
        b = parseInt(e[3]);
        if (!classes[0] && r < 248 && g < 248 && b < 248) c = 0;
        else if (!classes[1] && r < 248 && g > 248 && b < 248) c = 1;
        else if (!classes[2] && r > 248 && g > 248 && b > 248) c = 2;
        else continue;
        classes[c] = j.prop("class").split(rs);
        if (classes[0] && classes[1] && classes[2]) break;
    }

    // timetable/dates/など全部過去、全部未来の場合(1つしか取れてない)はクラスが該当する要素が同数で判別できない
    var nc = 0;
    for (let i = 0; i < 3; i++) if (!classes[i]) nc++;
    if (nc == 3 || nc == 2) return ret;
    //(2以上の要素内で)重複クラスを削除して1つにならなければ全体の該当要素が少ないのを選ぶ
    for (let i = 0; i < 3; i++) {

    }
    var jc = 9999;
    var eq = true;
    ret = null;
    for (let i = 0, ci, cl; i < classes.length; i++) {
        ci = classes[i].replace(rr, "");
        if (!ci) continue;
        cl = jb.find('.' + ci).length;
        if (jc > cl) {
            jc = cl;
            ret = ci;
            eq = i == 0;
        }
        else if (jc < cl) eq = false;
    }
    return eq ? null : ret;
}
function getTTLRArrowContainerElement(returnSingleSelector) {
    //右にある右アイコンの親buttonの親divを選びたいが初期状態では存在せず取れない場合があるので、
    //横に長くて縦が短く画面中央にあってtimebarでないものを選ぶ
    //var jo = $('[*|href$="/images/icons/chevron_right.svg#svg-body"]:not([href])');
    var jo = $('div').map(function (i, e) { if (e.clientWidth > window.innerWidth / 2 && e.offsetTop > window.innerHeight / 3 && e.offsetTop < window.innerHeight * 2 / 3) return e; });
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    //特定条件でtimebarも取れるので除外する
    var ret = getTTtimebarElement();
    if (ret) {
        jo = jo.not(ret);
        if (jo.length == 0) return null;
        else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];
    }
    for (let i = 0; i < jo.length; i++) {
        if ($(EXTTtime).find(jo.eq(i)).length > 0) jo = jo.not(jo.eq(i));
    }
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    for (let i = 0, z; i < jo.length; i++) {
        z = jo.eq(i).css("z-index");
        if (z == "auto" || isNaN(parseInt(z)) || parseInt(z) <= 0) jo = jo.not(jo.eq(i));
    }
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    for (let i = 0, z; i < jo.length; i++) {
        if (jo.eq(i).offset().left > 50) jo = jo.not(jo.eq(i));
    }
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    return null;
}
function getTTtimebarElement(returnSingleSelector) {
    //横に長くて縦が短くtopが直接指定されてるのを選ぶ
    let jo = $('div').map(function (i, e) { if (e.clientWidth > window.innerWidth / 2 && e.clientHeight < 30 && e.style.top != "") return e; });
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    //もし2以上引っかかったら時刻を探す
    var re = /(^|[^\d])\d{1,2}:\d{2}($|[^\d])/;
    jo = jo.map(function (i, e) { if (re.test(e.textContent)) return e; });
    if (jo.length == 0) return null;
    else if (jo.length == 1) return returnSingleSelector ? dl.getElementSingleSelector(jo[0]) : jo[0];

    //この時点でまだ取りきれないなら背景を使う
    var rt = /rgba? *\( *(\d+) *, *(\d+) *, *(\d+)(?: *,\d+ *,?)? *\)/;
    jo = $('p').map(function (i, e) { if (e.offsetHeight > 0 && e.offsetHeight < 30 && re.test(e.textContent)) return e; });
    var ret = null;
    for (var i = 0, c, e, r, g, b; i < jo.length; i++) {
        c = jo.eq(i).css("background-color");
        if (!rt.test(c)) continue;
        e = rt.exec(c);
        r = parseInt(e[1]);
        g = parseInt(e[2]);
        b = parseInt(e[3]);
        if ((r < 192 && g < 192 && b < 192) || (r > 64 && g > 64 && b > 64)) continue;
        ret = jo[i];
        break;
    }
    if (!ret) return null;
    var p = ret.parentElement;
    while (p.tagName.toUpperCase() != "BODY" && p.offsetHeight < 30) {
        ret = p;
        p = ret.parentElement;
    }
    if (p.tagName.toUpperCase() == "BODY") return null;
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getTTProgramTimeClasses() {
    //番組開始の00とか30のクラス とその中のアイコンコンテナ(FREEとかを収納する用)があれば取る
    //数字2桁をexttbody以外から取ると時間軸と日付も引っかかる
    var ret = [null, null];
    var jo = $(EXTTbody).find('div').map(function (i, e) { if (/^\d{2}$/.test(e.textContent)) return e; });
    var ja = [];
    for (var i = 0, c, added; i < jo.length; i++) {
        c = jo.eq(i).prop("class");
        if (!/\w/.test(c)) continue;
        c = c.split(/\s/)[0].replace(/^\s+|\s+$/, "");
        added = false;
        for (var j = 0; j < ja.length; j++) {
            if (ja[j][0] != c) continue;
            ja[j][1]++;
            added = true;
            break;
        }
        if (!added) {
            ja[ja.length] = [c, 1];
        }
    }
    if (ja.length == 0) return ret;
    var t = ja[0][0];
    var m = ja[0][1];
    for (let i = 1; i < ja.length; i++) {
        if (m > ja[i][1]) continue;
        t = ja[i][0];
        m = ja[i][1];
    }
    ret[0] = t;

    //時刻の後ろでtable-cellなdivのclassを選ぶ
    jo = $('.' + t);
    for (let i = 0, ji; i < jo.length; i++) {
        ji = jo.eq(i).contents();
        for (let j = 0, jp; j < ji.length; j++) {
            if (!/^\d{2}$/.test(ji.eq(j).text())) continue;
            jp = ji.eq(j).nextAll("div");
            for (let k = 0, c; k < jp.length; k++) {
                if (jp.eq(k).css("display") != "table-cell") continue;
                c = jp.eq(k).prop("class");
                if (!/\w/.test(c)) continue;
                ret[1] = c.split(/\s/)[0].replace(/\s+|\s+$/, "");
                break;
            }
            if (ret[1]) break;
        }
        if (ret[1]) break;
    }
    return ret;
}
function getElementSelector(inpElm,includeID,includeClass,includeIndex,remove){
//includeID true:#idを含める false:含めない
//includeClass 2:全ての.classを含める 1:全体で唯一の.classだけ含める 0:含めない
//includeIndex 2:全要素*:eq(index)を含める 1:要素名:eq(index)を含める 0:含めない
//全体に含めないid,classをremoveで受ける
    if(!inpElm) return null;
    var ta=$(inpElm);
    var pa=ta.parentsUntil("html");
    var ts="";
    var ps="";
    var tt=[];
    var ns=[];
    var re=/\w/;
    var rd=/\s+/;
    var rc=/^\s+|\s+$/g;
    var jr=null;
    if(remove&&remove.length>0){
        jr=$(remove[0]);
        for(var i=1;i<remove.length;i++) jr=jr.add(remove[i]);
    }

    ns[0]=[];
    ns[0][0]=ta.prop("nodeName");
    if(includeID){
        ns[0][1]=ta.prop("id");
    }else{
        ns[0][1]="";
    }
    ns[0][3]=[];
    ts=ta.prop("class");
    if(re.test(ts)){
        tt=ts.split(rd);
        for(var j=0,k=0;j<tt.length;j++){
            ts=tt[j].replace(rc,"");
            if(re.test(ts) && ts.indexOf('ext_abm-')<0){//拡張機能で付与したclassは除外しておく(含めるとcomeまわりでうまくいかない)
                if(includeClass==1){
                    if($('.'+ts).remove(jr).length==1){
                        ns[0][3][k++]=ts;
                    }
                }else if(includeClass==2){
                    ns[0][3][k++]=ts;
                }
            }
        }
    }
    if(includeIndex==2&&includeClass==0&&!includeID){
        ns[0][2]=ta.index();
    }else if(includeIndex>0){
        if(includeIndex==1){
            ts=ta.prop("nodeName");
        }else if(includeIndex==2){
            ts="";
        }
        if(ns[0][1].length>0){
            ts=ts+"#"+ns[0][1];
        }
        for(let j=0;j<ns[0][3].length;j++){
            ts=ts+"."+ns[0][3][j];
        }
        ns[0][2]=ta.prevAll(ts).length;
    }else{
        ns[0][2]=0;
    }
    for(let i=0;i<pa.length;i++){
        ns[i+1]=[];
        ns[i+1][0]=pa.eq(i).prop("nodeName");
        if(includeID){
            ns[i+1][1]=pa.eq(i).prop("id");
        }else{
            ns[i+1][1]="";
        }
        ns[i+1][3]=[];
        ts=pa.eq(i).prop("class");
        if(re.test(ts)){
            tt=ts.split(rd);
            for(let j=0,k=0;j<tt.length;j++){
                ts=tt[j].replace(rc,"");
                if(re.test(ts) && ts.indexOf('ext_abm-')<0){
                    if(includeClass==1){
                        if($('.'+ts).length==1){
                            ns[i+1][3][k++]=ts;
                        }
                    }else if(includeClass==2){
                        ns[i+1][3][k++]=ts;
                    }
                }
            }
        }
        if(includeIndex==2&&includeClass==0&&!includeID){
            ns[i+1][2]=pa.eq(i).index();
        }else if(includeIndex>0){
            if(includeIndex==1){
                ts=pa.eq(i).prop("nodeName");
            }else if(includeIndex==2){
                ts="*";
            }
            if(ns[i+1][1].length>0){
                ts=ts+"#"+ns[i+1][1];
            }
            for(let j=0;j<ns[i+1][3].length;j++){
                ts=ts+"."+ns[i+1][3][j];
            }
            ns[i+1][2]=pa.eq(i).prevAll(ts).length;
        }else{
            ns[i+1][2]=0;
        }
    }

    ps="";
    if(includeIndex==2){
        ts="*";
    }else{
        ts=ns[0][0];
    }
    if(includeID && ns[0][1].length>0){
        ts=ts+"#"+ns[0][1];
    }
    if(includeClass>0){
        for(let j=0;j<ns[0][3].length;j++){
            ts=ts+"."+ns[0][3][j];
        }
    }
    if(includeIndex>0){
        ts=ts+":eq("+ns[0][2]+")";
    }
    ps=ts;
    for(let i=1;i<ns.length-1;i++){
        if(includeIndex==2){
            ts="*";
        }else{
            ts=ns[i][0];
        }
        if(includeID && ns[i][1].length>0){
            ts=ts+"#"+ns[i][1];
        }
        if(includeClass>0){
            for(let j=0;j<ns[i][3].length;j++){
                ts=ts+"."+ns[i][3][j];
            }
        }
        if(includeIndex>0){
            ts=ts+":eq("+ns[i][2]+")";
        }
        ps=ts+">"+ps;
    }
    ps="BODY>"+ps;
    return ps;
}
function hasNotTransformed(jo) {
    //transformしていない=right0等が画面外に移動していない=開いている
    //1つでも開いてればtrue,全部閉じてたらfalse
    // matrix(1, 0, 0, 1, 0, 0)
    for (var i = 0; i < jo.length; i++) {
        if (/matrix *\( *1(\.0+)? *, *-?0(\.0+)? *, *-?0(\.0+)? *, *1(\.0+)? *, *-?0(\.0+)? *, *-?0(\.0+)? *,? *\)/.test(jo.eq(i).css("transform"))) return true;
    }
    return false;
}
function isComeOpen(sw) {
    //console.trace('isComeOpen()')
    if (sw === undefined) { sw = 0; }
    var eo = EXcome;
    if (!eo) return false;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = hasNotTransformed(jo);//.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
    }
    var bc = (eo.style.transform == "translateX(0px)");
    var bd = jo.offset().left < window.innerWidth; //少しでも開いてるとtrue
    var be = jo.offset().left + jo.width() < window.innerWidth + 50; //ほぼ開いてたらtrue
    switch (sw) {
    case 0: return bb; break;
    case 1: return bc; break;
    case 2: return bb || bc; break;
    case 3: return bd; break;
    case 4: return be; break;
    }
    return false;
}
function isSlideOpen(sw) {
    //    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
    //    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length>0)?true:false;
    //return hasNotTransformed($(EXchli).add(EXinfo).add(EXcome));//.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
    if (!sw) sw = 0;
    return isChliOpen(sw) || isInfoOpen(sw) || isComeOpen(sw);
}
function isInfoOpen(sw) {
    //sw 0:内部の開閉状態 1:cssの開閉 2:0or1 3:見た目の開閉
    if(!EXinfo) return false;
    if (sw === undefined) { sw = 0; }
    var eo = EXinfo;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = hasNotTransformed(jo);//.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
    }
    var bc = (eo.style.transform == "translateX(0px)");
    var bd = (jo.offset().left < window.innerWidth);
    switch (sw) {
    case 0:
        //            return $(EXinfo).is('[class*="TVContainer__right-slide--shown___"]');
        return bb;
        break;
    case 1:
        //            return (EXinfo.style.transform=="translateX(0px)");
        return bc;
        break;
    case 2:
        //            return $(EXinfo).is('[class*="TVContainer__right-slide--shown___"]')||(EXinfo.style.transform=="translateX(0px)");
        return bb || bc;
        break;
    case 3:
        //            return ($(EXinfo).is('[class*="TVContainer__right-slide--shown___"]')&&EXinfo.style.transform!="translateX(100%)")||(EXinfo.style.transform=="translateX(0px)");
        return bd;
        break;
    default:
    }
}
function isChliOpen(sw) {
    //sw 0:shown 1:transform 2:両方
    if (sw === undefined) { sw = 0; }
    if (!EXchli) return false;
    var eo = EXchli;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = hasNotTransformed(jo);//.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
    }
    var bc = (eo.style.transform == "translateX(0px)");
    var bd = (jo.offset().left < window.innerWidth);
    switch (sw) {
    case 0:
        //            return $(EXchli.parentElement).is('[class*="TVContainer__right-slide--shown___"]');
        return bb;
        break;
    case 1:
        //            return (EXchli.parentElement.style.transform=="translateX(0px)");
        return bc;
        break;
    case 2:
        //            return $(EXchli.parentElement).is('[class*="TVContainer__right-slide--shown___"]')||(EXchli.parentElement.style.transform=="translateX(0px)");
        return bb || bc;
        break;
    case 3:
        //            return ($(EXchli.parentElement).is('[class*="TVContainer__right-slide--shown___"]')&&EXchli.parentElement.style.transform!="translateX(100%)")||(EXchli.parentElement.style.transform=="translateX(0px)");
        return bd;
        break;
    default:
    }
}
function isSideOpen(sw) {
    if (sw === undefined) sw = 0;
    var eo = EXside;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = hasNotTransformed(jo);//.is('[class*="styles__right-slide--shown__"]');
    }
    var bc = (eo.style.transform == "translateY(-50%)");
    var bd = (jo.offset().left < window.innerWidth);
    switch (sw) {
    case 0:
        return bb;
        break;
    case 1:
        return bc;
        break;
    case 2:
        return bb || bc;
        break;
    case 3:
        return bd;
        break;
    default:
    }
}
function otosageru() {
    if (!EXvolume) return;
    var teka = document.createEvent("MouseEvents");
    //    var teki=$('[class^="styles__slider-container___"]').children();
    var teki = getVolbarObject();
    if (teki == null) return;
    var maxvol=teki.parent().height();
    var targetvolume = Math.min(maxvol, Math.max(0, Math.floor(maxvol * settings.changeMaxVolume / 100)));
    teki=teki.parent().parent();
    var teku = teki.offset().top + parseInt(teki.css("padding-top")) + maxvol - targetvolume;
    teka.initMouseEvent("mousedown", true, true, window, 0, 0, 0, teki.offset().left + 15, teku);
    setTimeout(otomouseup, 100, teku);
    return teki[0].dispatchEvent(teka);
}
function moVol(d) {
    console.log("movol "+d);
    if (!EXvolume) return;
    var teka = document.createEvent("MouseEvents");
    var teki = getVolbarObject();
    if (teki == null) return;
    var orivol = teki.height();
    teki=teki.parent();
    var maxvol=teki.height();
    var targetvolume = Math.min(maxvol, Math.max(0, orivol + d));
    teki=teki.parent();
    var teku = teki.offset().top + parseInt(teki.css("padding-top")) + maxvol - targetvolume;
    teka.initMouseEvent("mousedown", true, true, window, 0, 0, 0, teki.offset().left + 15, teku);
    setTimeout(otomouseup, 100, teku);
    return teki[0].dispatchEvent(teka);
}
function otomouseup(p) {
    if (!EXvolume) return;
    var teka = document.createEvent("MouseEvents");
    var teki = getVolbarObject();
    if (teki == null) return;
    teka.initMouseEvent("mouseup", true, true, window, 0, 0, 0, teki.parent().parent().offset().left + 15, p);
    setTimeout(volbar, 100);
    setTimeout(()=>{const vol = getVolbarObject().height();isSoundFlag=vol>0?true:false;},100);
    return teki[0].dispatchEvent(teka);
}
function otoColor() {
    var jo = $(EXvolume).contents().find('svg');
    if (jo.length == 0) return;
    if (jo.css("fill") == "rgb(255, 255, 255)") {
        jo.css("fill", "red");
        setTimeout(otoColor, 800);
    } else {
        jo.css("fill", "");
    }
}
function otoSize(ts) {
    var jo = $(EXvolume).contents().find('svg');
    if (jo.length == 0) return;
    if (jo.css("zoom") == "1") {
        jo.css("zoom", ts);
        setTimeout(otoSize, 400);
    } else {
        jo.css("zoom", "");
    }
}
function volbar() {
    if (checkUrlPattern(true) != 3) return;
    var jo = $('#forProEndTxt');
    //    if(jo.filter('.forProEndTxt').length==0){
    if (jo.is('.vol')) {
        //        jo.prop("class","forProEndTxt");
        jo.removeClass('vol');
    } else {
        //        jo.prop("class","");
        jo.addClass('vol');
        var teki=getVolbarObject();
        var orivol = 46;
        var maxvol=92;
        if(teki!=null){
            orivol=teki.height();
            maxvol=teki.parent().height();
        }
        var v = Math.min(maxvol, Math.max(0, orivol));
        var p = Math.min(100, Math.round(100 * v / 92));
        var q = (v == 0) ? "mute" : (p + "%");
        var w = 1 + Math.round(309 * v / maxvol);
        jo.text("vol " + q);
        $('#forProEndBk').css("width", w + "px");
        setTimeout(volbar, 800);
    }
}
function faintcheck2(retrycount, sw, fcd, bgi) {
    //console.log("faintcheck#"+retrycount+",fcd="+fcd);
    if (EXfootcountcome) {
        if (sw < 0) {
            if (!isFootcomeClickable()) { //isNaN(parseInt($(EXfootcountcome).text()))
                //console.log("faintcheck cmblockcd="+cmblockcd+"->"+fcd);
                cmblockcd = fcd;
                bginfo[3] = bgi;
                return;
            }
        } else if (sw > 0) {
            if (isFootcomeClickable()) { //!isNaN(parseInt($(EXfootcountcome).text()))
                //console.log("faintcheck cmblockcd="+cmblockcd+"->"+fcd);
                cmblockcd = fcd;
                bginfo[3] = bgi;
                return;
            }
        }
    }
    if (retrycount > 0) {
        setTimeout(faintcheck2, 150, retrycount - 1, sw, fcd, bgi);
    }
}
function faintcheck(sw, fcd, bgi) {
    if (sw > 0) {
        faintcheck2(5, sw, Math.max(0, fcd), bgi);
    } else if (sw < 0) {
        faintcheck2(5, sw, Math.min(0, fcd), bgi);
    }
}
function comeColor(jo, inp) {
    if (checkUrlPattern(true) != 3) return;
    //console.log("comeColor:"+inp);
    if (!EXfootcountcome) return;
    //console.log($(EXfootcountcome).css("color"));
    if (inp === undefined) {
        jo.css("display", "none");
        setTimeout(comeColor, 800, jo, -2);
    } else if (inp == -2) {
        jo.css("display", "");
    } else if (inp == -1) {
        jo.css("color", "");
        jo.prev('svg').css("fill", "");
    } else {
        var lim = [90, 60, 30];
        if (inp > lim[0]) {
            jo.css("color", "");
        } else if (inp > lim[1]) {
            jo.css("color", "rgb(255, 255, " + Math.round(255 * (inp - lim[1]) / (lim[0] - lim[1])) + ")");
        } else if (inp > lim[2]) {
            jo.css("color", "rgb(255, " + Math.round(255 * (inp - lim[2]) / (lim[2] - lim[1])) + ", 0)");
        } else {
            jo.css("color", "rgb(255, 0, 0)");
        }
        jo.prev('svg').css("fill", "black");
        setTimeout(comeColor, 800, jo, -1);
    }
}
function waitforComeReady(){
    if(!EXcomelist){return;}
    var comeListLen = EXcomelist.childElementCount;
    if (comelistClasses.animated&&EXcomelist.firstElementChild.className.indexOf(comelistClasses.animated) >= 0) { comeListLen--; }//冒頭のanimationは数から除外
    else if(EXcomelist.firstElementChild.firstElementChild.firstElementChild.tagName.toUpperCase().indexOf('DIV')>=0) { comeListLen--;}
    if (comeListLen>0){
        if (settings.isComelistNG) {
            copycome();
        }
    }else{
        console.log('waitforComeReady',comeListLen);
        setTimeout(waitforComeReady, 1000);
    }
}
function chkcomelist(retrycount) {
    //console.log("chkcomelist#"+retrycount);
    if ($(EXcomelist).length == 0) return;
    var comeListLen = EXcomelist.childElementCount;
    if (comelistClasses.animated&&EXcomelist.firstElementChild.className.indexOf(comelistClasses.animated) >= 0) { comeListLen--; }//冒頭のanimationは数から除外
    //console.log("chkcomelist#"+retrycount+",comelistlen="+comeListLen);
    if (comeListLen <= settings.sureReadRefreshx && (comeListLen > 1 || retrycount == 0)) {
        //console.log("comeRefreshed " + commentNum + "->" + comeListLen);
        comeRefreshing = false;
        comeFastOpen = false;
        commentNum = comeListLen;
        comeHealth = Math.min(100, Math.max(0, commentNum));
        comeColor($(EXfootcountcome), comeHealth);
        //if(comeListLen<10){console.log('chkcomelist copycome ', EXcomelist.children)}
        waitforComeReady();
    } else if (retrycount > 0) {
        setTimeout(chkcomelist, 200, retrycount - 1);
    } else {
        comeRefreshing = false;
        comeFastOpen = false;
    }
}
function waitforOpenCome(retrycount) {
    //console.log("waitforOpenCome#"+retrycount);
    if (isComeOpen()) {
        setTimeout(chkcomelist, 100, 2);
    } else if (retrycount > 0) {
        setTimeout(waitforOpenCome, 10, retrycount - 1);
    } else {
        comeRefreshing = false;
        comeFastOpen = false;
    }
}
function waitforOpenableCome(retrycount) {
    //console.log("waitforOpenableCome#"+retrycount);
    if (!isSlideOpen() && isFootcomeClickable()) {
        //    if($(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){
        $(EXfootcome).children('button').trigger("click");
        //console.log("comeopen waitforopenable");
        waitforOpenCome(5);
    } else if (retrycount > 0) {
        setTimeout(waitforOpenableCome, 10, retrycount - 1);
    } else {
        comeRefreshing = false;
        comeFastOpen = false;
    }
}
function waitforCloseSlide(retrycount) {
    //console.log("waitforCloseSlide#"+retrycount);
    if (comeRefreshing) return;
    if (!isSlideOpen()) {
        waitforOpenableCome(5);
    } else if (retrycount > 0) {
        setTimeout(waitforCloseSlide, 10, retrycount - 1);
    } else {
        comeFastOpen = false;
    }
}
function waitforCloseCome(retrycount) {
    //console.log("waitforCloseCome#"+retrycount);
    if (comeFastOpen) return;
    if (!isComeOpen()) {
        waitforOpenableCome(5);
    } else if (retrycount > 0) {
        setTimeout(waitforCloseCome, 10, retrycount - 1);
    } else {
        comeRefreshing = false;
    }
}
function fastRefreshing() {
    waitforCloseCome(5);
}
function proPositionAllReset(bigtext) {
    //console.log("proSameUnFix");
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first(); //todo
    var forpros = $(".forpros");
    var bsize = (bigtext !== undefined) ? bigtext : settings.isProTextLarge;
    var fsize = bsize ? "medium" : "x-small";
    var tpro = $("#tProtitle");
    tpro.css("transform", "")
        .css("left", "")
        .css("right", "")
        .css("top", "")
        .css("bottom", "")
        .css("font-size", fsize)
        ;
    forpros.css("top", "")
        .css("bottom", "")
        .css("font-size", fsize)
        ;
    prehoverContents.css("margin-top", "")
        .css("margin-right", "")
        //        .css("transform","")
        .css("margin-left", "")
        .prev().css("margin-top", "")
        //        .css("transform","")
        .contents().find('li').slice(1).css("margin-left", "")
        ;
    headlogo.css("margin-top", "")
        .next().css("margin-top", "")
        .find('[class*="styles__default-input-text___"]').css("height", "") //todo
        ;
    parexfootcount.css("margin-bottom", "")
        .css("margin-top", "")
        .css("height", "")
        ;
    $(EXfootcome).css("border-left", "")
        .css("margin-right", "")
        .prev().css("border-right", "")
        ;
    footlogo.css("margin-bottom", "")
        .next().css("margin-bottom", "")
        ;
}
function proSamePositionFix(inptime, inptitle, inpsame, inpbig) {
    //console.log("proSameFix time="+inptime+", title="+inptitle+", same="+inpsame);
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first(); //todo
    var forpros = $(".forpros");
    var forprot = $("#forProEndTxt");
    var tpro = $("#tProtitle");
    var fproh = forprot.height() + parseInt(forprot.css("padding-top")) + parseInt(forprot.css("padding-bottom")) + parseInt(forprot.css("margin-top")) + parseInt(forprot.css("margin-bottom"));
    var tproh = tpro.height() + parseInt(tpro.css("padding-top")) + parseInt(tpro.css("padding-bottom")) + parseInt(tpro.css("margin-top")) + parseInt(tpro.css("margin-bottom"));
    var tprow = tpro.width() + parseInt(tpro.css("padding-left")) + parseInt(tpro.css("padding-right")) + parseInt(tpro.css("margin-left")) + parseInt(tpro.css("margin-right"));
    var fprow = forprot.width() + parseInt(forprot.css("padding-top")) + parseInt(forprot.css("padding-bottom")) + parseInt(forprot.css("margin-top")) + parseInt(forprot.css("margin-bottom"));
    var timeshown = inptime;
    //    var bigtext=(inpbig!==undefined)?bigtext:settings.isProTextLarge;
    if (timeshown == "header") {
        if ($(EXhead).css("visibility") == "visible") {
            timeshown = "windowtop";
        } else {
            timeshown = "";
        }
    } else if (timeshown == "footer") {
        if ($(EXfoot).css("visibility") == "visible") {
            timeshown = "windowbottom";
        } else {
            timeshown = "";
        }
    }
    var titleshown = inptitle;
    if (titleshown == "headerright") {
        if ($(EXhead).css("visibility") == "visible") {
            titleshown = "windowtopright";
        } else {
            titleshown = "";
        }
    } else if (titleshown == "footerright") {
        if ($(EXfoot).css("visibility") == "visible") {
            titleshown = "windowbottomright";
        } else {
            titleshown = "";
        }
    }
    //console.log("fix timeshown:"+timeshown+",titleshown:"+titleshown);
    if (timeshown == "windowtop" && titleshown == "windowtopright") {
        switch (inpsame) {
        case "over":
            tpro.css("right", "310px")
                .css("transform", "translateX(100%)")
                ;
            break;
        case "vertical":
            forpros.css("top", (tproh - 4) + "px");
            if (tprow <= 320) {
                prehoverContents.css("margin-right", (settings.isComeTriming && settings.isSureReadComment)?"":"310px")
                    .css("margin-top", "")
                    .css("margin-left", "12px")
                    .prev().css("margin-top", "")
                    .contents().find('li').slice(1).css("margin-left", "12px")
                    ;
            } else {
                prehoverContents.css("margin-right", (settings.isComeTriming && settings.isSureReadComment)?"":"310px")
                    .css("margin-left", "12px")
                    .prev().contents().find('li').slice(1).css("margin-left", "12px")
                    ;
            }
            break;
        case "horizontal":
            tpro.css("right", "310px");
            break;
        case "horizshort":
            tpro.css("right", (fprow + 8) + "px");
            break;
        default:
        }
    } else if (timeshown == "windowbottom" && titleshown == "windowbottomright") {
        switch (inpsame) {
        case "over":
            tpro.css("right", "310px")
                .css("transform", "translateX(100%)")
                ;
            break;
        case "vertical":
            tpro.css("bottom", (fproh - 4) + "px");
            $(EXfootcome).css("margin-right", "310px");
            if (tprow <= 320) {
                parexfootcount.css("margin-bottom", "");
                $(EXfootcome).css("border-left", "")
                    .prev().css("border-right", "")
                    ;
            } else { //タイトルが長い場合はmargin-bottomをtopに入れ替えてタイトルを避ける
                var fcmb = parseInt(parexfootcount.css("margin-bottom"));
                parexfootcount.css("margin-bottom", "");
                parexfootcount.css("margin-top", fcmb + "px");
            }
            break;
        case "horizontal":
            tpro.css("right", "310px");
            break;
        case "horizshort":
            tpro.css("right", (fprow + 8) + "px");
            break;
        default:
        }
    } else if (timeshown == "commentinputtop" && titleshown == "commentinputtopright") {
        switch (inpsame) {
        case "over":
        case "horizontal":
            tpro.css("right", "")
                .css("left", 0)
                ;
            break;
        case "vertical":
            forpros.css("top", (tproh - 4) + "px");
            break;
        case "horizshort":
            tpro.css("right", (fprow + 8) + "px");
            break;
        default:
        }
    } else if (timeshown == "commentinputbottom" && titleshown == "commentinputbottomright") {
        switch (inpsame) {
        case "over":
        case "horizontal":
            tpro.css("right", "")
                .css("left", 0)
                ;
            break;
        case "vertical":
            tpro.css("bottom", (fproh - 4) + "px");
            break;
        case "horizshort":
            tpro.css("right", (fprow + 8) + "px");
            break;
        default:
        }
    }
}
function openInfo(sw) {
    if (!EXinfo) return;
    if (sw) {
        $(EXinfo).css("transform", "translateX(0)");
        proinfoOpened = true; //クリックで解除できるようにする
    } else {
        $(EXinfo).css("transform", "");
        proinfoOpened = false;
    }
}
function createProtitle(sw, bt) {
    if (!EXcome) return;
    if (sw == 0) {
        if ($("#tProtitle").length == 0) {
            var eProtitle = '<span id="tProtitle" class="usermade" style="';
            //            eProtitle+='position:absolute;right:0;font-size:'+(bt?"medium":"x-small")+';padding:4px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14;background-color:transparent;top:0px;';
            eProtitle += 'font-size:' + (bt ? "medium" : "x-small") + ';position:absolute;top:0px;right:0';
            eProtitle += '">' + (proTitle ? proTitle : '未取得') + '</span>';
            //            EXcome.insertBefore(eProtitle,EXcome.firstChild);
            $(eProtitle).prependTo(EXcome);
            //番組名クリックで番組情報タブ開閉
            $("#tProtitle").on("click", function () {
                if (!EXinfo) return;
                if (!proinfoOpened) {
                    setTimeout(openInfo, 50, true);
                } else {
                    setTimeout(openInfo, 50, false);
                }
            });
        }
    } else if (sw == 1) {
        $("#tProtitle").remove();
    }
}
function setProtitlePosition(timepar, titlepar, samepar, bigpar) {
    //残り時間との重なり処理はこれが終わってから
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first(); //todo
    var tpro = $("#tProtitle");
    //    var bigtext=(bigpar!==undefined)?bigpar:settings.isProTextLarge;
    var tproh = tpro.height() + parseInt(tpro.css("padding-top")) + parseInt(tpro.css("padding-bottom"));
    var tprouc = tpro.height() + parseInt(tpro.css("padding-top"));
    var headh = $(EXhead).height();
    var tprow = tpro.width() + parseInt(tpro.css("padding-left")) + parseInt(tpro.css("padding-right")) + parseInt(tpro.css("margin-left")) + parseInt(tpro.css("margin-right"));
    var par = titlepar;
    let hmt, fmb;
    switch (par) {
    case "windowtopleft":
    case "windowtopright":
    case "commentinputtopleft":
    case "commentinputtopright":
    case "headerleft":
    case "headerright":
        tpro.css("bottom", "")
            .css("top", 0)
            ;
        break;
    case "windowbottomleft":
    case "windowbottomright":
    case "commentinputbottomleft":
    case "commentinputbottomright":
    case "footerleft":
    case "footerright":
        tpro.css("top", "")
            .css("bottom", 0)
            ;
        break;
    default:
    }
    switch (par) {
    case "windowtopleft":
    case "windowbottomleft":
    case "commentinputtopleft":
    case "commentinputbottomleft":
    case "headerleft":
    case "footerleft":
        tpro.css("right", "")
            .css("left", 0)
            ;
        break;
    case "windowtopright":
    case "windowbottomright":
    case "commentinputtopright":
    case "commentinputbottomright":
    case "headerright":
    case "footerright":
        tpro.css("left", "")
            .css("right", 0)
            ;
        break;
    default:
    }
    switch (par) {
    case "windowtopright":
    case "headerright":
        if ((settings.isComeTriming && settings.isSureReadComment) && tprow <= 320) break;
        hmt = (tproh - 12) + Math.floor((headh - tproh - 12) / 2);
        prehoverContents.css("margin-top", hmt + "px")
            .prev().css("margin-top", hmt + "px")
            ;
        break;
    default:
    }
    switch (par) {
    case "windowtopleft":
    case "headerleft":
        hmt = (tproh + 8 - 18) + Math.floor((headh - tproh - 8 - 18) / 2);
        headlogo.css("margin-top", hmt + "px")
            .next().css("margin-top", hmt + "px")
            ;
        if (bigpar)
            headlogo.next().find('[class*="styles__default-input-text___"]').css("height", (headh - tprouc) + "px"); //todo
        break;
    default:
    }
    switch (par) {
    case "windowbottomright":
    case "footerright":
        fmb = tproh;
        parexfootcount.css("margin-bottom", fmb + "px")
            .css("height", "unset")
            ;
        $(EXfootcome).css("border-left", "1px solid #444")
            .prev().css("border-right", "none")
            ;
        break;
    default:
    }
    switch (par) {
    case "windowbottomleft":
    case "footerleft":
        fmb = tproh;
        footlogo.css("margin-bottom", fmb + "px")
            .next().css("margin-bottom", fmb + "px")
            ;
        break;
    default:
    }
    switch (par) {
    case "windowtopleft":
    case "windowtopright":
    case "windowbottomleft":
    case "windowbottomright":
        if (!$('body').children().is(tpro)) {
            tpro.prependTo('body');
        }
        break;
    case "commentinputtopleft":
    case "commentinputtopright":
    case "commentinputbottomleft":
    case "commentinputbottomright":
        if (!$(EXcomesend).children().is(tpro)) {
            tpro.prependTo(EXcomesend);
        }
        break;
    case "headerleft":
    case "headerright":
        if (!$(EXhead).children().is(tpro)) {
            tpro.prependTo(EXhead);
        }
        break;
    case "footerleft":
    case "footerright":
        if (!$(EXfoot).children().is(tpro)) {
            tpro.prependTo(EXfoot);
        }
        break;
    default:
    }

    var b = false;
    if (settings.proTitleFontC) {
        switch (par) {
        case "commentinputtopleft":
        case "commentinputtopright":
        case "commentinputbottomleft":
        case "commentinputbottomright":
            b = true;
            break;
// コメ入力欄周辺でない場合でも、ウィンドウ右下かつコメ入力欄下かつコメ欄表示中などによりコメ入力欄周辺に設置される場合があるけどそこまでは未設定
        default:
        }
    }
    if (b)
        tpro.css("color", "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (settings.commentTextTrans / 255) + ")");
    else
        tpro.css("color", "");

}
function createTime(sw, bt) {
    //console.log("createTime:"+sw);
    if (!EXcome) return;
    if (sw == 0) {
        var fsize = bt ? "medium" : "x-small";
        if ($("#forProEndBk").length == 0) {
            var eForProEndBk = '<span id="forProEndBk" class="usermade forpros" style="';
            //            eForProEndBk+='position:absolute;right:0;font-size:'+fsize+';padding:0px 0px;margin:4px 0px;background-color:rgba(255,255,255,0.2);z-index:12;width:310px;top:0px;';
            eForProEndBk += 'font-size:' + fsize + ';position:absolute;top:0px;right:0;width:310px;';
            eForProEndBk += '"></span>';
            //            EXcome.insertBefore(eForProEndBk,EXcome.firstChild);
            $(eForProEndBk).prependTo(EXcome);
            $('#forProEndBk').html("&nbsp;");
        }
        if ($("#forProEndTxt").length == 0) {
            var eForProEndTxt = '<span id="forProEndTxt" class="usermade forpros" style="';
            //            eForProEndTxt+='position:absolute;right:0;font-size:'+fsize+';padding:4px 5px 4px 11px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14;background-color:transparent;top:0px;';
            eForProEndTxt += 'font-size:' + fsize + ';position:absolute;top:0px;right:0;';
            eForProEndTxt += '"></span>';
            //            EXcome.insertBefore(eForProEndTxt,EXcome.firstChild);
            $(eForProEndTxt).prependTo(EXcome);
            $('#forProEndTxt').html("&nbsp;");
            //残り時間クリックで設定ウィンドウ開閉
            $("#forProEndTxt").removeClass("vol")
                .on("click", function () {
                    if ($("#settcont").css("display") == "none") {
                        openOption();
                    } else {
                        closeOption();
                    }
                });
        }
        if ($("#proTimeEpNum").length == 0) {
            var eproTimeEpNum = '<div id="proTimeEpNum" class="usermade forpros" style="';
            //            eproTimeEpNum.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:4px 0px;background-color:transparent;z-index:13;width:310px;top:0px;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;");
            //            eproTimeEpNum+='position:absolute;right:0;font-size:'+fsize+';padding:4px 0px;background-color:transparent;z-index:13;width:310px;top:0px;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;';
            eproTimeEpNum += 'font-size:' + fsize + ';position:absolute;top:0px;right:0;width:310px;';
            eproTimeEpNum += '">';
            eproTimeEpNum += '<div style="border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;">&nbsp;</div>'.repeat(2);
            //            EXcome.insertBefore(eproTimeEpNum,EXcome.firstChild);
            $(eproTimeEpNum).prependTo(EXcome);
            $('#proTimeEpNum').children().html("&nbsp;");
            $("#proTimeEpNum").on("mousemove", proepMousemove)
                .on("mouseleave", proepMouseleave)
                ;
        }
    } else if (sw == 1) {
        $(".forpros").remove();
    }
}
function proepMousemove() {
    //    var c=parseInt($('#epnumedit input[type="number"][name="epcount"]').val());
    //    if(c<=6){return;}
    var c = parseInt($('#epnumedit input[type="number"][name="epfirst"]').val());
    if (c <= 0) return;
    var jo = $('#forProEndTxt');
    if (jo.css("display") == "none") return;
    var t = parseFloat(jo.css("opacity"));
    if (t == 0) {
        jo.css("display", "none")
            .css("transition", "")
            .css("opacity", "")
            ;
    } else if (t == 1) {
        jo.css("transition", "opacity 0.5s linear")
            .css("opacity", 0)
            ;
    }
}
function proepMouseleave() {
    $('#forProEndTxt').css("display", "")
        .css("transition", "")
        .css("opacity", "")
        ;
}
function setTimePosition(timepar, titlepar, samepar, bigpar) {
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent(); //todo
    var parexfootcount = $(EXfootcount).parent();
    var forpros = $(".forpros");
    //    var bigtext=(bigpar!==undefined)?bigpar:settings.isProTextLarge;
    var fproh = $("#forProEndTxt").height();
    var headh = $(EXhead).height();
    var par = timepar;
    switch (par) {
        case "windowtop":
        case "commentinputtop":
        case "header":
            forpros.css("bottom", "")
                .css("top", 0)
                ;
            break;
        case "windowbottom":
        case "commentinputbottom":
        case "footer":
            forpros.css("top", "")
                .css("bottom", 0)
                ;
            break;
        default:
    }
    switch (par) {
        case "windowtop":
        case "header":
            if (settings.isComeTriming && settings.isSureReadComment) break;
            var hmt = (fproh - 12) + Math.floor((headh - fproh - 12) / 2);
            prehoverContents.css("margin-top", hmt + "px")
                .prev().css("margin-top", hmt + "px")
                ;
            break;
        default:
    }
    switch (par) {
        case "windowbottom":
        case "footer":
            var fmb = fproh;
            parexfootcount.css("margin-bottom", fmb + "px")
                .css("height", "unset")
                ;
            $(EXfootcome).css("border-left", "1px solid #444")
                .prev().css("border-right", "none")
                ;
            break;
        default:
    }
    switch (par) {
        case "windowtop":
        case "windowbottom":
            if (!$('body').children().is(forpros)) {
                forpros.prependTo('body');
            }
            break;
        case "commentinputtop":
        case "commentinputbottom":
            if (!$(EXcomesend).children().is(forpros)) {
                forpros.prependTo(EXcomesend);
            }
            break;
        case "header":
            if (!$(EXhead).children().is(forpros)) {
                forpros.prependTo(EXhead);
            }
            break;
        case "footer":
            if (!$(EXfoot).children().is(forpros)) {
                forpros.prependTo(EXfoot);
            }
            break;
        default:
    }
    if (settings.proTitleFontC && (par == "commentinputtop" || par == "commentinputbottom")) {
        $("#forProEndTxt").css("color", "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (settings.commentTextTrans / 255) + ")");
        $("#forProEndBk").css("background-color", "rgba(" + settings.commentBackColor + "," + settings.commentBackColor + "," + settings.commentBackColor + "," + (0.2) + ")");
    } else {
        $("#forProEndTxt").css("color", "");
        $("#forProEndBk").css("background-color", "");
    }
}
function setOptionHead() {
    //ほぼ同時に複数起動した場合の重複を避けるため削除はappend直前にする
    //$('head>link[title="usermade"]').remove();
    //適宜再実行するようにしたので、この中でgetElementした後にdisplay:none等やると次回のgetElementで大きさや位置が取れずgetできない場合があることに注意する
    var t = "";
    var jo,jp;
    var eo;
    var to="";
    var selCome,selComesend,selComesendinpp,selComesendinp,selComelist,selComelistp,selHead,selFoot,selSide,selChli,selInfo,selVideoarea,selFootcome,selCountview;
    var alt=false;

    //投稿ボタン削除（入力欄1行化はこの下のコメ見た目のほうとoptionElementでやる）
    //後から生成される場合ここだとクラス名決め打ちになるのでfocus時のcomemoduleeditorでやる
    //if (settings.isCustomPostWin) {
    //    t += '.hw_hy.HH_HR{display:none;}'
    //}
    //twtパネルのように再生成されるかもしれないのでmoduleeditorからこのoptionheadを再実行して適用させる
    if (settings.isCustomPostWin&&EXcomemodule) {
        to=dl.getElementSingleSelector(EXcomemodule);
        if($(to).length!=1){
            console.log("?EXcomemodule "+to);
            to=alt?'.hw_hy.HH_HR':'';
        }
        if(to){
            t += to+'{display:none;}';
        }
    }

    //コメント見た目
    var bc = "rgba(" + settings.commentBackColor + "," + settings.commentBackColor + "," + settings.commentBackColor + "," + (settings.commentBackTrans / 255) + ")";//コメント背景色
    var cc = "rgba(" + settings.commentBackColor + "," + settings.commentBackColor + "," + settings.commentBackColor + "," + (0.2) + ")";
    var rc = "rgba(" + Math.floor(255 - (255 - settings.commentTextColor) * 0.8) + "," + Math.floor(settings.commentTextColor * 0.8) + "," + Math.floor(settings.commentTextColor * 0.8) + "," + (settings.commentTextTrans / 255) + ")";//赤系のコメント文字色(NG登録で使用)
    var tc = "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (settings.commentTextTrans / 255) + ")";//コメント文字色
    var uc = "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (0.1) + ")";//コメント入力欄背景色
    const activeInputBack = "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (0.2) + ")";//コメント入力欄背景色(入力可能時)
    var vc = "rgba(" + settings.commentTextColor + "," + settings.commentTextColor + "," + settings.commentTextColor + "," + (0.3) + ")";//コメント一覧区切り線色

    selCome=dl.getElementSingleSelector(EXcome);
    if($(selCome).length!=1){
        console.log("?EXcome "+selCome);
        selCome=alt?".v3_wi":"";
    }
    if(selCome){
        t += selCome+'{background-color:transparent;}';
        t += selCome+'>*{background-color:transparent;}';
    }

    selComesend=dl.getElementSingleSelector(EXcomesend);
    if($(selComesend).length!=1){
        console.log("?EXcomesend "+selComesend);
        selComesend=alt?".HH_e":"";
    }
    if(selComesend){
        t += selComesend+'{background-color:' + bc + ';}';
    }

    selComesendinpp=(EXcomesendinp&&dl.getElementSingleSelector(EXcomesendinp.parentElement))||'.'+EXcomesendinp.parentElement.classList[0];
    if($(selComesendinpp).not('#copyotw').length!=1){
        console.log("?EXcomesendinp.parentElement "+selComesendinpp);
        selComesendinpp=alt?".HH_HL":"";
    }
    if(selComesendinpp){
        t += selComesendinpp+'{background-color:' + uc + ' !important;}';
        //投稿可能時にabemaが付与すると思われるクラスがついたときは背景色を少し変える
        t += '.com-o-CommentForm__can-post .com-o-CommentForm__opened-textarea-wrapper{background-color:' + activeInputBack + ' !important;}';
    }

    selComesendinp=dl.getElementSingleSelector(EXcomesendinp,2);
    if($(selComesendinp).not('#copyot').length!=1){
        console.log("?EXcomesendinp "+selComesendinp);
        selComesendinp=alt?".HH_HN":"";
    }
    if(selComesendinp){
        //t += selComesendinp+'{background-color:' + uc + ';color:' + tc + ';}';
        //t += selComesendinp+'+*{background-color:' + uc + ';color:' + tc + ';}';
        //↓コメント入力欄が二重枠にならないようにtextareaとその兄弟の背景は透明にしておく
        t += selComesendinp+'{background-color: transparent;color:' + tc + ' !important;}';
        t += selComesendinp+'+*{background-color: transparent;color:' + tc + ' !important;}';

    }

    //EXcomelistのコピー#copycomecがあるので注意する
    selComelist=dl.getElementSingleSelector(EXcomelist,0,["#copycomec"]);
    if($(selComelist).not("#copycomec").length!=1){
        console.log("?EXcomelist "+selComelist);
        selComelist=alt?".uo_e":"";
    }
    selComelistp=EXcomelist?dl.getElementSingleSelector(EXcomelist.parentElement,0,["#copycome"]):null;
    if($(selComelistp).not("#copycome").length!=1){
        console.log("?EXcomelist.parent "+selComelistp);
        selComelistp=alt?".Ai_Am.t7_e":"";
    }
    if(selComelist){
        t += selComelist+'>div{background-color:' + bc + ';color:' + tc + ';}';
        t += selComelist+':not(#copycomec)>div[class]:first-child>div{display:none;}';//コメント欄のスライドするように出てくる新着コメントは非表示(拡張のスタイルが反映されないので) EXcomelistの一番最初の子でclassが指定されてるやつ
        t += selComelist+'>div>div>p>span{color:' + tc + ' !important;}';//コメント文字色
        t += selComelist+'>div>div{background-color: transparent;}';
        t += selComelist+'>div>div:hover{background-color: transparent;}';
    }

    //    //映像最大化
    ////    if(isMovieMaximize||settings.isSureReadComment){
    //    if(settings.isSureReadComment){
    //        t+='[class*="TVContainer__tv-container___"]{width:100%;';
    ////        if(isMovieMaximize){
    ////            t+='height:100%;';
    ////        }
    //        t+='}';
    //        t+='[class*="TVContainer__tv-container___"]>[class*="TVContainer__resize-screen___"]{';
    ////        if(isMovieMaximize){
    ////            t+='width:100%!important;height:100%!important;';
    ////        }else if(settings.isSureReadComment){
    //        if(settings.isSureReadComment){
    //            t+='max-width:calc(100% - 310px);';
    //        }
    //        t+='}';
    //    }

    if(selComelist&&selComelistp){
        //コメ欄スクロールバー非表示
        if (settings.isInpWinBottom) {//コメ逆順の時は対象が逆になる
            t += selComelistp+'{overflow:hidden;}';
            t += selComelist+'{';
        } else {
            t += selComelist+'{overflow:hidden;}';
            t += selComelistp+'{';
        }
        if (settings.isHideOldComment) {
            t += 'overflow:hidden;';
        } else {
            t += 'overflow-x:hidden;overflow-y:scroll;';
        }
        t += '}';

        //ユーザースクリプトのngconfigのz-index変更
        t += '#NGConfig{z-index:20;}';
        if (settings.isInpWinBottom) { //コメ入力欄を下
            if(selCome) t += selCome+'>*{display:flex;flex-direction:column-reverse;}';
            t += selComelistp+'{display:flex;flex-direction:column;justify-content:flex-end;border-top:1px solid ' + vc + ';border-bottom:1px solid ' + vc + ';}';
            t += selComelist+'{display:flex;flex-direction:column-reverse;}';
            t += selComelist+'>div{overflow:visible;min-height:min-content;}';//min-heightがないとdislay:flexで重なってしまう
            //↑の構成そのままだと各コメントのデフォ間隔padding:15px 15px 0;のtop,bottomがうまく効かなくなってしまう
            //2つめのflex(下スクロール、コメント少数時の下詰め)を解除すれば有効になるけど、下スクロールを解除したくない
            //各コメントの中身(本文、投稿時刻)にpadding設定したらうまくいった→min-height指定で不要に
            /*if (!settings.isCommentPadZero) {
                    t += '[class^="styles__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{padding-top:0px;padding-bottom:0px;}';
                    t += '[class^="styles__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div>p{padding-top:12px;padding-bottom:3px;}';
            }*/
            //AbemaTV Screen Comment Scrollerスクリプトのコメントグラデーションを逆向きに
            t += '[data-selector="commentPane"] > div {-webkit-mask-image: linear-gradient(transparent 0%, black 50%);mask-image: linear-gradient(transparent 0%, black 50%);}';
        }
        //t += selComelist+'>div{padding:0 15px;}';//copycomeじゃない方に適用されてる公式のcssのmarginを個々のコメントのpaddingにする
        //    if(settings.isCustomPostWin){ //1行化
        //        t+='[class^="TVContainer__right-comment-area___"] textarea{height:18px!important;}';
        //        t+='[class^="TVContainer__right-comment-area___"] textarea+div{height:18px!important;}';
        //    }
        if (settings.isCommentPadZero) { //コメ間隔詰め
            t += selComelist+'>div>div{padding-top:0px;padding-bottom:0px;}';
            t += selComelist+'>div>div>*{margin-top:0px;margin-bottom:0px!important;}';//bottomはあったり無かったりする(これより強い)ので付けておく
        }
        if (settings.isCommentTBorder) { //コメ区切り線
            t += selComelist+'>div{border-top:1px solid ' + vc + ';}';
            if (settings.isInpWinBottom) { //先頭コメ(一番下)の下にも線を引く
                t += selComelist+'>div:first{border-bottom:1px solid ' + vc + ';}';
            }
        }
        if (settings.isCommentWide) { //コメント部分をほんの少し広く
            t += selComelist+'>div>div{padding-right:4px;padding-left:8px;}';
            t += selComelist+'>div>div>p:first{width:' + (settings.isHideOldComment ? 258 : 242) + 'px;}';
            //フォントによるがそれぞれ259,243でギリギリなので1だけ余裕をみる
            t += selComelist+'{margin:0;}';
        }
    }

    //各パネルの常時表示 隠す場合は積極的にelement.cssに隠す旨を記述する(fade-out等に任せたり単にcss除去で済まさない)
    //もしくは常時隠して表示する場合に記述する、つまり表示切替の一切を自力でやる
    //（コメ欄常時表示で黒帯パネルの表示切替が発生した時のレイアウト崩れを防ぐため）

    selHead=dl.getElementSingleSelector(EXhead);
    if($(selHead).length!=1){
        console.log("?EXhead "+selHead);
        selHead=alt?".P_R":"";
    }
    if(selHead){
        t += selHead+'{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selFoot=dl.getElementSingleSelector(EXfoot);
    if($(selFoot).length!=1){
        console.log("?EXfoot "+selFoot);
        selFoot=alt?".v3_v_":"";
    }
    if(selFoot){
        t += selFoot+'{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selSide=dl.getElementSingleSelector(EXside);
    if($(selSide).length!=1){
        console.log("?EXside "+selSide);
        selSide=alt?".v3_v5":"";
    }
    if(selSide){
        t += selSide+'{transform:translateY(-50%);z-index:20;opacity:0.5}';
    }

    selChli=dl.getElementSingleSelector(EXchli);
    if($(selChli).length!=1){
        console.log("?EXchli "+selChli);
        selChli=alt?".v3_wk":"";
    }
    if(selChli){
        t += selChli+'{z-index:15;}';//head11より上の残り時間12,13,14より上
    }

    selInfo=dl.getElementSingleSelector(EXinfo);
    if($(selInfo).length!=1){
        console.log("?EXinfo "+selInfo);
        selInfo=alt?".v3_wg":"";
    }
    if(selInfo){
        t += selInfo+'{z-index:15;}';
    }

    if(selCome) t += selCome+'>*{z-index:11;}';//foot10より上(foot内の全画面・音ボタンをマスク)
    if(selComelist) t += selComelist+'{margin:0px}';

    //左上・左下の非表示
    /*jo=getReceiveNotifyElement();
    if(!jo || !((to=dl.getElementSingleSelector(jo))&&$(to).length==1)){
        console.log("?ad-reserve");
        to=alt?'.v3_wC':"";
    }*/
    to = dl.getElementSingleSelector(EXvideoarea) + '>div[style^="bottom: "]';
    if(to){
        t += to+'{z-index:8;'; //元はoverlapと同じ3 通知を受け取る
        if (settings.isHidePopBL) {
            //t += 'transform:translateX(-170px);';
            t += 'display: none;';
        }
        t+='}';
    }

    //twitter通知パネル すぐには生成されないので遅延適用するためdelaysetのループへ
    //生成されたらこのoptionheadを再実行して適用させる
    jo=getReceiveTwtElement();
    if(!jo || !((to=dl.getElementSingleSelector(jo))&&$(to).length==1)){
        console.log("?twtPanel");
        to=alt?'.v3_wA':"";
    }
    if(to){
        t += to+'{z-index:9;'; //元が4(overlapは元3)なのでoverlapよりは上に置く
        if (settings.isHideTwitterPanel) {
            t += 'transform:translateX(-20px) translateX(-100%);';
        }
        t += '}';
    }

    selVideoarea = dl.getElementSingleSelector(EXvideoarea);
    if(document.querySelector(selVideoarea)){
        console.log("?EXvideoarea "+selVideoarea);
    }
    if (settings.isHidePopTL&&selVideoarea) {
        //直接指定しようとするといつか出た時の短時間にgetしないといけないので映像以外を消す
        to=getVideoRouteClasses();
        if(!to[0]||!to[1]){
            console.log("?videoRouteClass "+to[0]+","+to[1]);
            to=alt?[".qJ_e",".Aq_bT"]:["",""];
        }else to=['.'+to[0],'.'+to[1]];
        //.Aq_Ay .Aq_AA
        if(to[0]&&to[1]){
            t += selVideoarea+'>div:not('+to[0]+'){display:none;}';
            t += selVideoarea+'>img:not('+to[1]+'){display:none;}';
        }
        //t += '[class*="styles__eyecatch-blind___"]{display:none;}';
    }
    if (selVideoarea) t += selVideoarea + '{transition-delay:0.5s;}'; // onresizeで設定していたtransitionをheadに付けてみる fastrefreshでガクっとなるのを防ぐ
    if (selCome) t += selCome + '{transition-delay:0.5s;}';

    //z-index調整、コメ流す範囲
    t += '#moveContainer{z-index:7;';
    if (settings.comeMovingAreaTrim) {
        t += 'position:absolute;top:0;left:0;overflow:hidden;height:100%;';
    }
    t += '}';
    t += overlapSelector + '{z-index:8;}';
    t += '#ComeMukouMask{z-index:6;}';
    t += '[class*="styles__fresh-panel___"]{z-index:9;'; //元は4 //todo
    if (settings.isHidePopFresh) {
        t += 'transform:translateX(-20px) translateX(-100%);';
    }
    t += '}';
    //変更後のz-index(これを書いてる時点)
    //20 side 右のボタン
    //16 #settcont 一時設定画面
    //15 right-slide 番組情報
    //15 right-list-slide 放送中一覧
    //14 #forProEndTxt 残り時間
    //13 #proTimeEpNum 残り時間の背景区切り
    //12 #forProEndBk 残り時間の背景
    //11 right-comment-area コメント一覧・入力欄
    //11 header ヘッダー
    //10 balloon 右のボタンの吹き出しポップ(常時非表示)
    //10 footer フッター 全画面・音量ボタン
    //9 twitter-panel twitter通知受取ポップ 元4
    //9 fresh-panel fresh用の左下ポップ 元4
    //8 ad-reserve-button 番宣中の左下ポップ 元3
    //8 vote 投票機能 元3
    //8 overlap 映像クリック受付(クリックイベントは常時無効) 元3
    //7 #moveContainer 流れるコメント(クリックイベントは常時無効)
    //6 #ComeMukouMask 画面装飾、映像クリック受付(クリックはここで受ける)

    //全画面・音量ボタン非表示 display:noneだとホイール音量操作でスタック
    if (settings.isHideButtons) {
        to=dl.getElementSingleSelector(EXfullscr);
        if($(to).length!=1){
            console.log("?fullscreen "+to);
            to=alt&&selFoot?selFoot+" .mb_mi":"";
        }
        if(to){
            t += to+'{opacity:0;visibility:hidden;}';
        }

        to=dl.getElementSingleSelector(EXvolume);
        if($(to).length!=1){
            console.log("?volume "+to);
            to=alt&selFoot?selFoot+" .mb_mk":"";
        }
        if(to){
            t += to+'{opacity:0;visibility:hidden;}';
        }
    }

    //残り時間用
    t += '#forProEndBk{padding:0px 0px;margin:4px 0px;background-color:rgba(255,255,255,0.2);z-index:12!important;}';
    t += '#forProEndTxt{padding:4px 5px 4px 11px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t += '#proTimeEpNum{padding:4px 0px;background-color:transparent;z-index:13!important;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;align-items:center;}';
    t += '#tProtitle{padding:4px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t += '#proTimeEpNum>div{border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;}';

    selFootcome = dl.getElementSingleSelector(EXfootcome);
    if ($(selFootcome).length != 1) {
        console.log("?EXfootcome " + selFootcome);
        selFootcome = alt ? ".iF_iT" : "";
    }

    //画面クリック調整
    t += '#moveContainer{pointer-events:none;}';
    t += overlapSelector + '{pointer-events:none;}';
    if (selFootcome) t += selFootcome + '{pointer-events:auto;}';

    //今日のみどころポップアップ(トップページで出現確認、放送画面にまで出るかは不明だけど念のため)
    if (settings.isHideTodayHighlight) {
        t += '[class^="styles__highlights-balloon___"]{display:none;}'; //todo
    }
    //コメント一覧クリックNG時はマウスオーバーで文字色を赤系にする(comecopyはクリック対象を受けずhoverで変色したものを対象とする)
    if (settings.isComelistClickNG) {
        t += '.comem:hover{color:' + rc + '!important;}';
    }
    //流れるコメントのフォントサイズ
    if (settings.comeFontsizeV) {
        var wh = $(window).height();
        var vh = Math.round(1000 * settings.comeFontsize / wh) / 10;
        t += '.movingComment{font-size:' + vh + 'vh;}';
    } else
        t += '.movingComment{font-size:' + settings.comeFontsize + 'px;}';

    //投票機能
    t += selInfo+'+div[style^="width:"]{z-index:8;'; //infoの隣でwidthがinnerWidthに直指定されてる
    if (settings.isHideVoting) {
        t += 'display:none;';
    }
    t += '}';
    //視聴数
    selCountview=dl.getElementSingleSelector(EXcountview);
    if($(selCountview).length!=1){
        console.log("?EXcountview "+selCountview);
        selCountview=alt?".v3_wX":"";
    }
    if(selCountview){
        t += selCountview+',.ext_abm-countview{position:fixed;z-index:11;bottom:0px;';
        t += 'background:rgba(0,0,0,' + (settings.panelOpacity/255) + ');';
        //下から出てくるアニメーション
        t += 'transition: transform .5s cubic-bezier(.215,.61,.355,1),visibility .5s cubic-bezier(.215,.61,.355,1),-webkit-transform .5s cubic-bezier(.215,.61,.355,1);';
        //パディング
        t += 'padding:4px 0px;';//4=(footerHeight-EXcountview.getBoundingClientRect().height)/2)
        t += '}';
        t += selCountview+'>div,.ext_abm-countview>div{background:transparent;}';

        t += selCountview+'>div>*,.ext_abm-countview>div>*{opacity:' + ((settings.panelOpacity/255<0.7)?0.7:(settings.panelOpacity/255)) + ';}';
    }
    //視聴数格納
    if (settings.isStoreViewCounter&&selFoot) {
        //to=selCountview;
        //t += to+'{display:none;}';
        //t += '[class*="styles__view-counter___"]{display:none;}';
        t += '#viewcounticon{vertical-align:middle;fill:#1a1a1a;}';
        t += '#viewcountcont{margin-left:4px;font-size:12px;font-weight:700;vertical-align:middle;color:#1a1a1a;}';
        t += '#comecountcont{margin-left:10px;font-size:18px;font-weight:700;vertical-align:middle;line-height:1.6;color:#1a1a1a;}';
        to=dl.getElementSingleSelector(EXfootcome);
        if($(to).length!=1){
            console.log("?EXfootcome "+to);
            to=alt?selFoot+" .mb_mo":"";
        }
        if(to){
            t += to+' button{line-height:1;}';
            t += to+' button>span:not(#viewcountcont):not(#comecountcont){display:none;}';
        }
    }
    //コメ欄常時表示時に伸張する
    if (settings.isComeTriming && settings.isSureReadComment) {
        if(selHead&&selFoot) t += selHead+','+selFoot+'{width:calc(100% - 310px);}';
        if(selHead) t += selHead+'>*{min-width:unset;}';
        //
    }
    //黒帯パネルの透過
    if(selHead&&selFoot){
        t += selFoot+'>div>div:nth-child(3),'+selHead+'{background:rgba(0,0,0,' + (settings.panelOpacity/255) + ')}';

        t += selFoot+'>div>div:nth-child(3)>*,'+selHead+'>*{opacity:' + ((settings.panelOpacity/255<0.7)?0.7:(settings.panelOpacity/255)) + '}';
        t += selFoot+'>div>div:nth-child(3)>div:nth-child(1):hover{background:rgba(32,32,32,' + (settings.panelOpacity/255) + ')}';
        //フッターチャンネルアイコンの背景を透過
        var selChLogoDiv = dl.getElementSingleSelector($(EXfoot).find('img').parent().get(0));
        t += selChLogoDiv+'{background-color:transparent !important;}';
    }
 
    //t += selHead+'{background-color: transparent;}[class*="Header__container___"]{background-color: black;}';

    //番組情報のコピー置換
    if(selInfo){
        t += selInfo+'>*:not(#copyinfo){display:none;}';
        t += selInfo+'>#copyinfo{width:100%;padding:15px;}';
    }

    let styleLink = $('head>link#extstyle');
    let dataUri = 'data:text/css,' + encodeURIComponent(t);
    if(styleLink.isEmpty()){
        styleLink =$("<link title='usermade' id='extstyle' rel='stylesheet' href='" + dataUri + "'>").appendTo("head");
    }else{
        styleLink.attr('href', dataUri);
    }
    setFooterBGStyle();
    console.log("setOptionHead ok");
}
function setFooterBGStyle(){
    let t='';
    let selFoot=dl.getElementSingleSelector(EXfoot);
    if($(selFoot).isEmpty()) return;
    //フッターの視聴数にかぶる部分を透明にした背景
    let barcolor = `rgba(0,0,0,${settings.panelOpacity/255})`;
    let cvb = EXcountview.getBoundingClientRect();
    let fbb = EXfootcome.parentElement.getBoundingClientRect();
    let cvLeft = Math.round(cvb.left);
    let cvWidth = Math.round(cvb.width);
    let fbWidth = Math.round(fbb.width);
    let fbbackImage = `linear-gradient(90deg, ${barcolor}, ${barcolor} ${cvLeft}px, transparent ${cvLeft}px, transparent ${cvLeft+cvWidth}px, ${barcolor} ${cvLeft+cvWidth}px, ${barcolor} ${fbWidth}px);`
    t += selFoot+'>div>div.countviewtrans{background:'+fbbackImage+'}';
    let dataUri = 'data:text/css,' + encodeURIComponent(t);
    let footerBGstyle = $('#footerBGstyle');
    if(footerBGstyle.isEmpty()){
        footerBGstyle = $("<link title='usermade' id='footerBGstyle' rel='stylesheet' href='" + dataUri + "'>").appendTo("head");
    }else{
        footerBGstyle.attr('href', dataUri);
    }
}
function setOptionElement() {
    if (checkUrlPattern(true) != 3) return;

    if (settings.isCustomPostWin) {
        $(EXcomesendinp).prop("wrap", "soft");
    } else {
        isEdge || $(EXcomesendinp).prop("wrap", "");
    }
    setProSamePosiChanged();

    //    $(EXfootcome).css("pointer-events","auto");
    if(EXcomelist)copycome();

    if (!settings.isStoreViewCounter) $(EXfootcountcome).children('#viewcounticon,#viewcountcont,br,#comecountcont').remove();

    var hoverLinkClass = $(EXmenu).children('a')[0].className;
    var hoverSpanClass = $(EXmenu).children('a').children('span')[0].className;
    if ($(EXmenu).children('#extSettingLink').length == 0) {
        $(EXmenu).children(':last').css({'border-bottom':'1px solid #333', 'margin-bottom': '8px', 'padding-bottom': '12px'});
        $(EXmenu).append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("/pages/option.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張設定</span></a>')
                 .append('<a class="' + hoverLinkClass + '" id="extProgNotifiesLink" href="' + chrome.extension.getURL("/pages/notifylist.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張通知登録一覧</span></a>')
        ;
    }

    console.log("setOptionElement ok");
}
function pophideSelector(sv, sw) {
    //console.log("pophideSelector("+sv+","+sw+")");
    //pophideElementの前座
    //sv 状況 panelopenset[x] -1:ここで選択 0:全閉 1:chli 2:info 3:come
    //sw 表示フラグ 0:2(常時表示)と1(カウント)を表示 1:2のみ表示,1はカウントゼロで非表示
    var st;
    if (sv >= 0) {
        st = panelopenset[sv];
    } else {
        //var jo = $(EXfoot).nextAll('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
        //if (jo.length == 0) {
            //console.log("panel none");
            //st = panelopenset[0];
        if (isInfoOpen(3)) {
            //console.log("panel info");
            st = panelopenset[2];
        } else if (isChliOpen(3)) {
            //console.log("panel chli");
            st = panelopenset[1];
        } else if (isComeOpen()) {
            //console.log("panel come");
            st = panelopenset[3];
        }else st=panelopenset[0];
    }
    //console.log(st);
    if (st !== undefined) {
        pophideElement({ head: (st[0] > sw ? 1 : -1), foot: (st[1] > sw ? 1 : -1), side: (st[2] > sw ? 1 : -1) });
    }
}
function isFootcomeClickable(){ //コメント数ボタンがクリックできるかどうか
    return $(EXfootcountcome).css("pointer-events")!="none";
}
function usereventMouseover() {
    if (forElementClose < 4) {
        forElementClose = 5;
        //カーソルを表示する
        EXmain.style.cursor = 'auto';
        pophideSelector(-1, 0);
    }
}
function comemukouClick() {
    console.log("comemukouClick");
    if (settings.isSureReadComment && !isFootcomeClickable()) {
        //常にコメ欄開だけど開けない状態ならoverlapはクリックさせず直接wakuclickへ移行
        usereventWakuclick();
    } else {
        //overlapをクリックしても良さそうならtrigger経由でwakuclickへ移行
        $(overlapSelector).css("pointer-events", "auto")
            .trigger("click")
            ;
    }
}
function usereventWakuclick() {
    $(overlapSelector).css("pointer-events", "none");
    //overlapは常時pointer-events:noneにしておき、その下のcomemukoumaskをclickさせる
    //その時にoverlapをクリックしても良さそうならクリックさせてすぐ塞ぐ
    console.log("wakuclick");
    //ComeMukou時はそれぞれ解除・再適用スイッチ
    if (bginfo[2] >= 2 || bginfo[3] == 2) {
        if (settings.isCMBlack && settings.isCMBkR) { screenBlackSet(setBlacked[0] ? 0 : (settings.isCMBkTrans ? 1 : 3)); }
        if (settings.isCMsoundoff && settings.isCMsoundR) { soundSet(setBlacked[1]); }
        if (settings.CMsmall < 100 && settings.isCMsmlR) { movieZoomOut(setBlacked[2] ? 0 : 1); }
    }
    if (settings.isSureReadComment) {
        if (!isFootcomeClickable()) {
        } else {
            //overlapのclickにより閉じられるので早く開き直す
            if (!comeFastOpen && !comeRefreshing) {
                comeFastOpen = true;
                waitforCloseSlide(5);
            }
        }
    }
    //旧windowclick
    if (forElementClose < 5) {
        forElementClose = 5;
    }
    //番組タイトルのクリックにより番組情報欄を開いた(ように見せた)後ならそれを閉じる(ように見せる)
    if (proinfoOpened) {
        setTimeout(openInfo, 50, false);
    }
    var jo = $(getElm.getVideo());
    if (!jo.isEmpty() && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width()));//, parseInt(jo[0].style.height));
    }
}
function waitforResize(retrycount, jo, w){//, h) {
    var jw = parseInt(jo.width());
    //var jh = parseInt(eo.style.height);
    if (w != jw){// || h != jh) {
        waitingforResize = false;
        if (jw != movieWidth){// || jh != movieHeight) {
            onresize();
        }
    } else if (retrycount > 0) {
        setTimeout(waitforResize, 50, retrycount - 1, jo, w);//, h);
    } else {
        waitingforResize = false;
    }
}
function usereventVolMousemove() {
    if (!EXside) return;
    $(EXside).css("transform", "translate(50%,-50%)");
}
function usereventVolMouseout() {
    if (!EXside) return;
    $(EXside).css("transform", "translate(0px,-50%)");
}
function usereventVolClick() {
    setTimeout(function(){
           var svgpath = $(EXvolume).find('button').find('use').attr('xlink:href');
    if (svgpath.indexOf('volume_off')>=0) {isSoundFlag = false;}
    else {isSoundFlag = true;}
    }, 100);
}
function usereventFCMouseleave() {
    //console.log("ueFCMouseleave");
    if (!EXfootcome) return;
    $(EXfootcome).css("transition", "")
        .css("background-color", "")
        ;
    $('.manualblock').remove();
    $('body').css("overflow-y", "");
    if (cmblockcd * 100 % 100 == 63) {
        bginfo[3] = 2;
        cmblockcd = 0;
        startCM();
    } else if (cmblockcd * 100 % 100 == -63) {
        cmblockcd = 0;
        bginfo[3] = 0;
        endCM();
    }
}
function finishFCbgColored() {
    if (cmblockcd > 0) {
        cmblockcd = 299.63;
    } else if (cmblockcd < 0) {
        cmblockcd = -299.63;
    }
    $(EXfootcome).css("transition", "")
        .css("background-color", "")
        ;
    if ($('#manualblockrd').length == 0) {
        $('body').css("overflow-y", "hidden");
        $('<div id="manualblockrd" class="manualblock usermade"></div>').appendTo('body');
        $('#manualblockrd').html('&nbsp;')
            .css("position", "absolute")
            .css("height", "5px")
            .css("width", "5px")
            .css("bottom", 0)
            .css("right", 0)
            .css("background-color", "magenta")
            .css("z-index", 20)
            ;
    }
}
function isFCbgColored() {
    if (Math.abs(cmblockcd * 100 % 100) == 63) { return true; }
    if (!EXfootcome) { return false; }
    var re = /^rgba?\( *(\d+) *, *(\d+) *, *(\d+) *(?:, *(\d+) *)?\)$/;
    var tar = $(EXfootcome).css("background-color");
    if (re.test(tar)) {
        var rex = re.exec(tar);
        if (parseInt(rex[1]) == 255 && parseInt(rex[2]) == 0 && parseInt(rex[3]) == 255 && ((rex[4] === undefined) || rex[4] == 1)) {
            return true;
        } else { return false; }
    } else { return false; }
}
function chkFCbgc(retrycount) {
    if (isFCbgColored()) {
        finishFCbgColored();
    } else if (retrycount > 0) {
        setTimeout(chkFCbgc, 100, retrycount - 1);
    }
}
function usereventFCMousemove() {
    //console.log("ueFCMousemove");
    if (!EXfootcome || !settings.isManualMouseBR) return;
    if (cmblockcd != 0 && Math.abs(cmblockcd * 100 % 100) != 63) {
        if ($(EXfootcome).css("transition") != "background-color 1.2s linear 0s") {
            $(EXfootcome).css("transition", "background-color 1.2s linear 0s")
                .css("background-color", "rgb(255, 0, 255)")
                ;
            setTimeout(chkFCbgc, 1200, 5);
        }
        if (isFCbgColored()) {
            finishFCbgColored();
        }
    } else {
        $(EXfootcome).css("transition", "")
            .css("background-color", "")
            ;
    }
}

function overlapTriggerClick() {
    $(overlapSelector).trigger("click");
}
function waitforComemukouEnd(url) {
    //コメ欄常時開でComeMukou中に放送中一覧を閉じた場合、overlapをクリックしないために映像縮小が解除されない
    //そのままだとComeMukouが終わっても縮小が解除されないので、ComeMukouが終わるのを待つ
    //長時間になるので無限再試行が適切に終了されるようにする
    if (checkUrlPattern(true) != 3) return;
    if (url != currentLocation) return;
    if (settings.isSureReadComment && isFootcomeClickable()) {
        setTimeout(overlapTriggerClick, 20);
    } else {
        setTimeout(waitforComemukouEnd, 500, url);
    }
}
function usereventSideChliButClick() {
    if (isChliOpen(3)) {
        if (settings.isSureReadComment && !isFootcomeClickable()) {
            //コメ常時開で開けない状態の場合は見た目だけ閉じてoverlapクリックは後回し
            pophideElement({ channellist: -1 });
            waitforComemukouEnd(currentLocation);
        } else {
            //放送中番組一覧が既に見えていたら閉じる
            pophideElement({ allreset: true });
            setTimeout(overlapTriggerClick, 20);
        }
    } else {
        //番組情報枠と被らないようにする
        pophideSelector(1, 0);
        var phi = { channellist: 0 };
        if (isInfoOpen(3)) {
            phi.programinfo = -1;
        }
        pophideElement(phi);
    }
    var jo = $(getElm.getVideo());
    if (!jo.isEmpty() && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width()));//, parseInt(jo[0].style.height));
    }
}
function usereventFootInfoButClick() {
    if (isInfoOpen(3)) {
        if (settings.isSureReadComment && !isFootcomeClickable()) {
            pophideElement({ programinfo: -1 });
            waitforComemukouEnd(currentLocation);
        } else {
            //番組情報枠が既に見えていたら閉じる
            pophideElement({ allreset: true });
            setTimeout(overlapTriggerClick, 20);
        }
    } else {
        pophideSelector(2, 0);
        var phi = { programinfo: 0 };
        if (isChliOpen(3)) {
            phi.channellist = -1;
        }
        pophideElement(phi);
    }
    var jo = $(getElm.getVideo());
    if (!jo.isEmpty() && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width()));//, parseInt(jo[0].style.height));
    }
}
function delkakikomitxt(inptxt) {
    if (kakikomitxt == inptxt) {
        kakikomitxt = "";
        console.log("kakikomitxt reset: inptxt");
    }
}
function usercommentposted(inptxt) {
    console.log("usercommentposted inp="+inptxt);
    kakikomitxt = inptxt;
    setTimeout(delkakikomitxt, 4100, inptxt);
    if (isTootEnabled) {
        // toot
        var tootText = settings.mastodonFormat;
        tootText = tootText.replace('{comment}', inptxt).replace('{onairpage}', location.href).replace(/\\n/g,"\n");
        postJson('https://' + settings.mastodonInstance + '/api/v1/statuses', {status: tootText}, {'Authorization': 'Bearer ' + settings.mastodonToken}, function(result) {
            console.log('toot:', tootText);
        }, function() {
            toast('Mastodon投稿エラー');
        });
    }
}
function waitforinperase(retrycount, inptxt) {
    //console.log("waitforinperase#"+retrycount+",textarea="+$(EXcomesendinp).val()+",inp="+inptxt);
    if ($(EXcomesendinp).val() != inptxt) {
        usercommentposted(inptxt);
    } else if (retrycount > 0) {
        setTimeout(waitforinperase, 10, retrycount - 1, inptxt);
    }
}
function usereventSendButClick() {
    var ta = $(EXcomesendinp).val();
    //console.log("usereventSendButClick textarea="+ta);
    if (ta.length > 0) {
        waitforinperase(10, ta);
    }
}
function usereventFCclick() {
    //console.log("usereventFCclick");
    if (isComeOpen()) {
        //console.log("toggleCommentList EXfootcomeclick");
        toggleCommentList();
    } else if(isFootcomeClickable()){
        //閉じている＝これから開く
        if (!comeRefreshing) {
            pophideSelector(3, 0);
        }
        if(settings.isResizeScreen){
            setTimeout(function(){
                $(EXvideoarea).width(window.innerWidth).height(window.innerHeight);            
            },500);//コメ欄を開くと公式が映像サイズを縮めてしまうので広げ直す
        }
    }
    var jo = $(getElm.getVideo());
    if (!jo.isEmpty() && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width()));//, parseInt(jo[0].style.height));
    }
}
//function usereventWindowclick(){
//console.log("usereventWindowclick");
//    if(forElementClose<5){
//        forElementClose=5;
//    }
//    if(proinfoOpened){
//        setTimeout(openInfo,50,false);
//    }
//}
function usereventSendInpKeyinput() {
    //console.log("usereventSendInpKeyinput");
    if (EXcomesendinp && parseInt(EXcomesendinp.style.height) > 18) {
        $(EXcomesendinp).parent().css("padding-top", "5px")
            .css("padding-bottom", "5px")
            ;
        /*$(EXcomesendinp).css("height", "24px")//入力欄のレイアウトが崩れるのでとりあえずコメントアウト
            .css("overflow-y", "scroll")
            .next('div').css("height", "24px")//textareaに重なっている入力内容が表示されるdiv
            .css("visibility", "hidden")
            ;*/
    } else {
        $(EXcomesendinp).parent().css("padding-top", "")
            .css("padding-bottom", "")
            ;
        /*$(EXcomesendinp).css("height", "18px")
            .css("overflow-y", "")
            .next('div').css("height", "18px")
            .css("visibility", "")
            ;*/
    }
    var s = -6 + 18 * Math.round($(EXcomesendinp).scrollTop() / 18);
    //console.log($(EXcomesendinp).scrollTop()+"->"+s);
    $(EXcomesendinp).scrollTop(s);
}
function comeModuleEditor() {
    if (EXcomemodule) return;
    var ret=getComeModuleElements();
    if(!ret[0]||!ret[1]||!ret[2]){
        console.log("retry comeModuleEditor");
        setTimeout(comeModuleEditor,1000);
        return;
    }
    EXcomemodule=ret[0];
    var to=dl.getElementSingleSelector(ret[1]);
    if(!to){
        console.log("?sendbtn");
        to = "";//'.ts_jZ';
    }
    //投稿ボタンを押した時
    if(to) $(EXcomesend).on("click", to, usereventSendButClick);

    if (settings.isCustomPostWin){console.log("setOptionHead comeModuleEditor");setOptionHead();}

    var twitterWrapper = $(ret[2]);
    if (settings.mastodonInstance && settings.mastodonToken){
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
        twitterWrapper.css('float', 'left').after('<div class="usermade" id="mastodon-btn" style="float:left;margin-left:10px;padding:2px;cursor:pointer;background-color:#ddd;border-radius:2px;"><img src="' + chrome.extension.getURL("/images/mastodon-icon" + (isTootEnabled?'-blue':'') + ".svg") + '" style="" height="25" width="25" id="mastodon-icon"></div>');
        $('#mastodon-btn').click(function(){
            isTootEnabled = !isTootEnabled;
            localStorage.setItem('isTootEnabled', isTootEnabled.toString());
            $('#mastodon-icon').attr('src', chrome.extension.getURL("/images/mastodon-icon" + (isTootEnabled?'-blue':'') + ".svg"));
        });   
    }
}
function setOptionEvent() {//放送画面用イベント設定
    if (checkUrlPattern(true) != 3) return;
    //自作要素のイベントは自作部分で対応
    //console.log("setOptionEvent() eventAdded:", eventAdded);
    var butfs;
    var pwaku;
    if (((butfs = EXfullscr) == null) || ((pwaku = $(overlapSelector)[0]) == null) || !EXcome) {
        console.log("setOptionEvent retry");
        setTimeout(setOptionEvent, 1000);
        return;
    }
    if (pwaku.getAttribute('data-ext-event-added')!='true') {
        pwaku.addEventListener("click", usereventWakuclick);
        //ダブルクリックでフルスクリーン
        pwaku.addEventListener("dblclick", onScreenDblClick);
        pwaku.setAttribute('data-ext-event-added', 'true');
    }
    if (eventAdded) return;       
    //    $(window).on("click",usereventWindowclick);
    //マウスホイール無効か音量操作
    window.addEventListener('wheel', function (e) {
        if (e.target.id == "ComeMukouMask"||e.target.getAttribute('data-selector')=='closer') {//AbemaTV Screen Comment Scrollerスクリプトを併用しているとdiv[data-selector=closer]な要素が上にかぶさる(data-selectorはスクリプト側による属性)
            console.log("onmousewheel on ComeMukouMask or [data-selector=closer]",e);
                //        if (settings.isVolumeWheel&&e.target.className.indexOf("style__overlap___") != -1){//イベントが映像上なら
            if (settings.isVolumeWheel && (e.target.id == "ComeMukouMask"||e.target.getAttribute('data-selector')=='closer')) {
                if (EXvolume && $(EXvolume).contents().find('svg').css("zoom") == "1") {
                    otoSize(e.deltaY > 0 ? 0.8 : 1.2);
                }
                moVol(e.deltaY > 0 ? -5 : 5);
            }
            if (settings.isCancelWheel || settings.isVolumeWheel) { //設定ウィンドウ反映用
                //console.log("cancelling wheel")
                e.stopImmediatePropagation();
            }
        }
    }, true);
    //フルスクリーンボタンの割り当て変更
    butfs.addEventListener("click", function (e) {
        if (settings.isDblFullscreen) {
            toggleFullscreen();
            e.stopImmediatePropagation();
        }
    });
    //右下にコメント一覧表示切替を設置
    $(EXfootcome).on("click", usereventFCclick);
    //コメント一覧の表示切替
    $(EXcomesend).on("click", function (e) {
        if (e.target.tagName.toLowerCase() == 'form') {
            console.log("toggleCommentList EXcomesendclick");
            toggleCommentList();
        }
    });
    //入力欄のすぐ周りのクリックは何もしない
    $(EXcomesendinp).parent().on("click", function (e) {
        if (e.target.tagName.toLowerCase() == 'div') {
            e.stopPropagation();
        }
    });
    window.addEventListener("mousemove", usereventMouseover, true);
    window.addEventListener("keydown", usereventMouseover, true); //コメント入力時などキー入力時もマウスが動いたのと同じ扱いにしてelementをhideするカウントダウンをさせない
    //pwakuと同じイベントを#ComeMukouMaskにも設置
    $(EXvolume).on("mousemove", usereventVolMousemove)
        .on("mouseout", usereventVolMouseout)
        .on('click', usereventVolClick)
        ;
    window.addEventListener("keydown", function (e) {
        //console.log(e)
        if (e.keyCode == 13) { //enter
            usereventSendButClick();
        } else if (e.keyCode == 38 || e.keyCode == 40) { //38^ 40v
            if (settings.isCancelWheel || settings.isVolumeWheel) {
                e.stopPropagation();
            }
        } else if (popacti && e.keyCode == 39) { //39>
            popinput.push(e.keyCode);
            if (popinput.toString().indexOf(popCodes) == 0) {
                for (var i = 0; i < 4; i++) {
                    panelopenset[i][2] = 2;
                }
                pophideSelector(-1, 0);
                popinput = [];
            } else {
                while (popinput.length > 0 && popCodes.indexOf(popinput.toString()) != 0) {
                    if (popinput.length > 1) {
                        popinput.shift();
                    } else {
                        popinput = [];
                    }
                }
            }
        } else if (e.keyCode == 17 && ((e.location == 1 && settings.isManualKeyCtrlL) || (e.location == 2 && settings.isManualKeyCtrlR))) { //17ctrl
            if (cmblockcd != 0) {
                if (cmblockcd > 0) {
                    cmblockcd = 1.73;
                } else if (cmblockcd < 0) {
                    cmblockcd = -1.73;
                }
                var posi = "";
                if (e.location == 1 && settings.isManualKeyCtrlL) {
                    posi = "left";
                } else if (e.location == 2 && settings.isManualKeyCtrlR) {
                    posi = "right";
                }
                if (posi != "" && $('#manualblock' + posi).length == 0) {
                    $('body').css("overflow-y", "hidden");
                    $('<div id="manualblock' + posi + '" class="manualblock usermade"></div>').appendTo('body');
                    $('#manualblock' + posi).html('&nbsp;')
                        .css("position", "absolute")
                        .css("height", "5px")
                        .css("width", "5px")
                        .css("bottom", 0)
                        .css(posi, 0)
                        .css("background-color", "magenta")
                        .css("z-index", 20)
                        ;
                }
            }
        }
    }, true);
    window.addEventListener("keyup", function (e) {
        keyinput.push(e.keyCode);
        if (keyinput.toString().indexOf(keyCodes) == 0) {
            $("#CommentMukouSettings").show();
            keyinput = [];
        } else {
            while (keyinput.length > 0 && keyCodes.indexOf(keyinput.toString()) != 0) {
                if (keyinput.length > 1) {
                    keyinput.shift();
                } else {
                    keyinput = [];
                }
            }
        }
        if (e.keyCode == 17 && ((e.location == 1 && settings.isManualKeyCtrlL) || (e.location == 2 && settings.isManualKeyCtrlR))) {
            if (cmblockcd == 0) {
            } else if (cmblockcd * 100 % 100 == 73) {
                bginfo[3] = 2;
                cmblockcd = 0;
                startCM();
            } else if (cmblockcd * 100 % 100 == -73) {
                bginfo[3] = 0;
                cmblockcd = 0;
                endCM();
            }
            $('.manualblock').remove();
            $('body').css("overflow-y", "");
        }
    }, true);
    $(EXfootcome).on("mousemove", usereventFCMousemove)
        .on("mouseleave", usereventFCMouseleave)
        ;
    //放送中番組一覧を開く
    $(EXside).contents().find('button').eq(1).on("click", usereventSideChliButClick);
    //番組情報を開く
    $(EXfootcome).prev().on("click", usereventFootInfoButClick);
    //投稿ボタンを押した時
    //$(EXcomesend).on("click", '[class*="styles__post-button___"]', usereventSendButClick);//コメント欄に入るまで投稿ボタンが存在しないためcomemoduleeditorでやる
    //    $(EXcomesend).contents().find('[class*="styles__post-button___"]').on("click",usereventSendButClick);
    $(EXcomesendinp).on("keydown keyup", usereventSendInpKeyinput);
    //コメ一覧をクリック時
    $(EXcome).on("click", '#copycomec', comecopy);
    //コメ入力欄がフォーカスされた時
    $(EXcomesendinp).on('focus', comeModuleEditor);

    eventAdded = true;
    console.log("setOptionEvent ok");
}
function startCM() {
    console.log("startCM");
    if (settings.isCMBlack) { screenBlackSet(settings.isCMBkTrans ? 1 : 3); }
    if (settings.isCMsoundoff) { soundSet(false); }
    if (settings.CMsmall < 100) { movieZoomOut(1); }
}
function endCM() {
    console.log("endCM");
    if (bginfo[1].length == 2) return;
    if (settings.isCMBlack) { screenBlackSet(0); }
    if (settings.isCMsoundoff) { soundSet(true); }
    if (settings.CMsmall < 100) { movieZoomOut(0); }
}
function tryCM(retrycount) {
    if (isFootcomeClickable()) {
        bginfo[2] = 0;
        if (cmblockcd * 100 % 10 != -3) {
            cmblockcd = 0;
            endCM();
        }
    } else if (retrycount > 0) {
        setTimeout(tryCM, 500, retrycount - 1);
    }
}
function fastEyecatching(retrycount) {
    //console.log("fastEyecatch#"+retrycount);
    if ($('.manualblock').length > 0 || retrycount <= 0) { eyecatcheck = false; return; }//手動対応を優先
    //if ($(EXobli).find("object,video").first().parentsUntil(EXobli).last().children().length > 3 && retrycount > 0){
    if (EXvideoarea.childElementCount > 4 && retrycount > 0){
    //if ($(EXobli.children[EXwatchingnum]).children().is('[class*="styles__eyecatch"]') && retrycount > 0) {
        setTimeout(fastEyecatching, 100, retrycount - 1);
    } else {
        //eyecatch消失
        eyecatcheck = false;
        if (!isFootcomeClickable()) { //isNaN(parseInt($(EXfootcountcome).text()))
            bginfo[3] = 2;
            cmblockcd = 0;
            startCM();
        }
    }
}
function comehl(jo, hlsw) {
    var hlbc = settings.commentBackColor;
    var hlbt = settings.commentBackTrans;
    var hlc = settings.highlightComeColor;
    var hlp = settings.highlightComePower;
    if ($('#settcont').css("display") != "none") {
        hlbc = parseInt($("#commentBackColor").val());
        hlbt = parseInt($("#commentBackTrans").val());
        hlc = parseInt($('#ihighlightComeColor input[type="radio"][name="highlightComeColor"]:checked').val());
        hlp = parseInt($("#highlightComePower").val());
    }
    var c;
    switch (hlc) {
        case 0:
            c = [255, 255, 0, 255]; //yellow
            break;
        case 1:
            c = [255, 165, 0, 255]; //orange
            break;
        case 2:
            c = [255, 0, 0, 255]; //red
            break;
        case 3:
            c = [255, 192, 203, 255]; //pink
            break;
        case 4:
            c = [255, 0, 255, 255]; //purple+V
            break;
        case 5:
            c = [0, 0, 255, 255]; //blue
            break;
        case 6:
            c = [0, 255, 255, 255]; //aqua
            break;
        case 7:
            c = [0, 255, 0, 255]; //green+V
            break;
        case 8:
            c = [255, 255, 255, 255]; //white
            break;
        case 9:
            c = [0, 0, 0, 255]; //black
            break;
        default:
    }
    switch (hlsw) {
        case 1:
            jo.children().css("padding-left", ((settings.isCommentWide ? 8 : 15) - 4) + "px")
                .css("border-left", "4px solid rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.6)")
                .css("transition", "")
                ;
            break;
        case 3:
            jo.children().css("padding-left", ((settings.isCommentWide ? 8 : 15) - 4) + "px")
                .css("border-left", "4px solid rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.8)")
                .css("transition", "")
                ;
        case 2:
            var p = hlp / 100; //bの割合
            //            var c=[255,255,0,255]; //yellow
            var r = hlbc + Math.floor((c[0] - hlbc) * p);
            var g = hlbc + Math.floor((c[1] - hlbc) * p);
            var b = hlbc + Math.floor((c[2] - hlbc) * p);
            var a = hlbt + Math.floor((c[3] - hlbt) * p);
            jo.css("background-color", "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")")
                .css("transition", "")
                ;
            break;
        default:
    }
    setTimeout(function (jo) {
        //console.log(jo)
        for (var i = jo.length - 1, j = 0; i >= 0; i-- , j++) {
            //console.log(jo,i)
            switch (hlsw) {
                case 1:
                    jo.eq(i).children().css("border-left-color", "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)")
                        .css("transition", "border-left-color 1s linear " + (3 + 0.02 * j) + "s")
                        ;
                    break;
                case 2:
                    jo.eq(i).css("background-color", "rgba(" + hlbc + "," + hlbc + "," + hlbc + "," + (hlbt / 255) + ")")
                        .css("transition", "background-color 1s linear " + (3 + 0.02 * j) + "s")
                        ;
                    break;
                case 3:
                    jo.eq(i).children().css("border-left-color", "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)")
                        .css("transition", "border-left-color 1s linear " + (3 + 0.02 * j) + "s")
                        ;
                    jo.eq(i).css("background-color", "rgba(" + hlbc + "," + hlbc + "," + hlbc + "," + (hlbt / 255) + ")")
                        .css("transition", "background-color 1s linear " + (2 + 0.02 * j) + "s")
                        ;
                    break;
                default:
            }
        }
    }, 0, jo);
}

var comeUserHlInterval = null;
function comeUserHighlight(jo){
    function userHl(e) {
        var j=$(e);
        var uid = j.attr('data-ext-userid') || '';
        //var opacity = settings.commentTextTrans/255;
        //console.log('mov',e,j,uid);
        if(uid.length>0){
            //console.log(j.siblings('[data-ext-userid='+uid+']'))
            j.siblings('[data-ext-userid='+uid+']').children().css('background-color', 'rgba(255,255,0,0.6)');
            j.siblings(':not([data-ext-userid='+uid+'])').children().css('background-color', '');
        }
        j.children().css('background-color', 'rgba(255,255,0,0.6)');
    }
    $(jo).mouseover(function(e){
        if (comeUserHlInterval !== null) {
            clearInterval(comeUserHlInterval);
            comeUserHlInterval = null;
        }
        userHl(e.currentTarget);
        comeUserHlInterval = setInterval(userHl, 1000, e.currentTarget);
    });
    $(jo).mouseout(function(e){
        var j=$(e.currentTarget);
        var uid = j.attr('data-ext-userid') || '';
        //console.log('mou',e,uid);        
        //if(uid.length>0){
        //    j.siblings('[data-ext-userid='+uid+']').css('background-color', '');
        //}else{
            j.siblings().children().css('background-color', '');
        //}
        j.children().css('background-color', '');
        clearInterval(comeUserHlInterval);
        comeUserHlInterval = null;
    });
}
//copycomeで作ったコメ欄のcomepにコメントをセットする
function setCopycome(comep, msg, uid, datetime, timeStr, msgWidth){
    var div = $(comep).children().eq(0);
    div.children('p').children('span').text(msg);
    div.children('p').css('width', msgWidth);
    $(comep).attr('data-ext-userid', uid);
    var btdiv = div.children('div');
    var time = btdiv.children('time');
    time.attr('datetime', datetime);
    time.children('span').text(timeStr);
    div.children('.comeposttime').attr('name', 'n'+datetime*1000);
    if(timeStr==""){
        btdiv.css('width', '0px');
    }else{
        btdiv.css('width', '');
    }
}
function getComeInfo(wdiv){
    var uid = $(wdiv).attr('data-ext-userid');
    var div = $(wdiv).children().eq(0);
    var msg = div.children('p').text();
    var timeElem = div.children('div').children('time');
    var timeStr = timeElem.text();
    var datetime = timeElem.attr('datetime');
    var mwidth = div.children('p').css('width');
    if(!datetime){
        var nt = Date.now();
        var rn = /^今$/;
        var rs = /^(\d+) *秒前$/;
        var rm = /^(\d+) *分前$/;
        if (rn.test(timeStr)) {
            datetime = nt;
        } else if (rs.test(timeStr)) {
            datetime = nt - (+rs.exec(timeStr)[1]) * 1000;
        } else if (rm.test(timeStr)) {
            datetime = nt - (+rm.exec(timeStr)[1]) * 60000;
        }
    }
    return {message: msg, datetime: datetime, timeStr: timeStr, userid: uid};
}
function copycome(d, hlsw) {
//console.log("copycome d="+d,isComelistMouseDown);
    if (isComelistMouseDown) return;//もしコメ欄でマウスが押されている途中なら=コメ欄で文字列を選択中ならcopycomeは一時停止
    if (!EXcomelist) return;
    if (!settings.isComelistNG) {
        $('#copycome').remove();
        $(EXcomelist).parent().css("display", "");
        return;
    }
    //console.time('copycome')
    var eo = EXcomelist;
    var isAnimationIncluded = false;
    var isCopycomeCreated = false;
    if (comelistClasses.animated) {isAnimationIncluded = eo.firstElementChild.className.indexOf(comelistClasses.animated) >= 0;}
    else if (eo.childElementCount>2) {
        isAnimationIncluded = eo.firstElementChild.className!=eo.childNodes[1].className;
    } else return;
    //console.log('copycome isA:',isAnimationIncluded,eo.firstElementChild)
    var EXcomelistChildren = $(EXcomelist).children('div' + (isAnimationIncluded ? ':gt(0)' : ''));
    //console.log("EXCLChi",EXcomelistChildren)
    var jo = $(eo);
    if ($('#copycome').length == 0) {
        //console.log("copycome leng=0");
        var t = '<div id="copycome" class="' + jo.parent().attr("class") + ' usermade"><div id="copycomec" class="'+jo.attr("class")+' usermade">';
        var eofc = EXcomelistChildren[0];
        if(!eofc)return;
        var eofcfc = eofc.firstElementChild;
        //console.log(eofc,isAnimationIncluded,eo.firstElementChild,EXcomelistChildren, comelistClasses)
        if ((comelistClasses.empty && eo.firstElementChild.className.indexOf(comelistClasses.empty) >= 0) || eo.firstElementChild.textContent.indexOf('まだ投稿がありません') >= 0) return;
        //eofc=eo.children[1];//firstElementChildが空っぽの場合があるので二番目の子供を使う
        if (eofc === undefined || eofcfc === undefined || !eofcfc.hasChildNodes()) return;
        var eofcc = $(eofc).prop("class");
        var eofcfcc = $(eofcfc).prop("class");
        if (eofcfcc === undefined || (comelistClasses.progress&&eofcc.indexOf(comelistClasses.progress)>=0)) return;
        var em = eofcfc.children[0];
        var ecm = $(em).prop("class");
        var ems = eofcfc.children[0].firstElementChild;
        var ecms = $(ems).prop("class");
        var ebtw = eofcfc.children[1];//ブロックボタンと時間の親div
        if(!ebtw)return;
        var ecbtw = $(ebtw).prop("class");
        var et = ebtw.children[1];
        var ect = $(et).prop("class");
        var ets = ebtw.children[1].firstElementChild;
        var ects = $(ets).prop("class");
        for (var i = 0; i < 100; i++) {
            t += '<div class="comew"><div class="' + eofcfcc + ' comep usermade"><p class="' + ecm + ' comem usermade"><span class="'+ecms+'"></span></p><div class="'+ecbtw+' btwrapper"> <time class="' + ect + ' comet usermade"><span class="'+ects+'"></span></time></div><p class="comeposttime usermade" style="display:none;"></p></div></div>';
        }
        t += '</div></div>';
        $(t).insertAfter(jo.parent());
        //EXcomelistをコピーしてそのすぐ後ろに追加した場合、copycomeをスクロールするとEXcomelistに既存コメントが重複して追加されていってしまう
        //なのでその親ごとコピーして回避した
        //空のdivがあるので今後の仕様変更がある可能性は高い
        jo.parent().css("display", "none");
        d = undefined; //新規作成した場合は全コピー
        //コメ欄でマウスが押されているか
        $('#copycome').mousedown(function (e) { if (e.button != 2) { isComelistMouseDown = true; } });//右クリックには反応しない
        $('#copycome').mouseup(function () { setTimeout(function () { isComelistMouseDown = false; }, 3000); });//選択し終わってから右クリまで3秒の猶予
        isCopycomeCreated = true;
    }
    var jc = $('#copycomec').children();
    var ec = $('#copycomec')[0];
    var nt = Date.now();
    var rn = /^今$/;
    var rs = /^(\d+) *秒前$/;
    var rm = /^(\d+) *分前$/;

    if (d < 0 || (comelistClasses.empty && eo.firstElementChild.className.indexOf(comelistClasses.empty) >= 0) || eo.firstElementChild.textContent.indexOf('まだ投稿がありません') >= 0) { //全消去
        console.log("copycome allerase");
        jc.find('span').text("");
        $('.comeposttime').attr("name", "");
        $('.comet').attr("datetime", "");
    } else if (d > 0 && copycomecount <= 0) {
        //console.log("copycome append:"+d);
        //d件をNG処理して追加した後にcomehl
        var ma = [];
        for (let i = 0, e, dt, m, n, t, u, cinfo; i < d; i++) {
            //console.log("ma loop")
            e = EXcomelistChildren[i];//eo.children[i];
            if(!e||!e.firstElementChild||e.firstElementChild.childElementCount<2||e.firstElementChild.firstElementChild.tagName.toUpperCase()!='P') continue;
            cinfo = getComeInfo(e);
            u = cinfo.userid;
            m = comefilter(cinfo.message, u);
            if (m.length > 0) {
                t = cinfo.timeStr;
                dt = cinfo.datetime;
                ma.push([m, t, u, dt]);
            }
        }
        //console.log("ma:",ma)
        if (ma.length > 0) {
            if (ma.length <= 100) {
                //console.time('ma100_loop')
                for (let i = ec.childElementCount - 1, e, m, t, n, d, s, u, efc, cinfo, mw; (e = ec.children[i - ma.length]) ; i--) {
                    //console.log("loop ma<100")
                    efc = e.firstElementChild;
                    cinfo = getComeInfo(e);
                    m = cinfo.message;
                    u = cinfo.userid;
                    mw = "";
                    t = "";
                    if (settings.isDelOldTime || settings.isDelTime) {
                        mw = (isComeOpen(3) && isSideOpen(3)) ? e.children[0].style.width : "unset";
                    } else {
                        d = cinfo.datetime;
                        if (d>0) {
                            s = Math.floor((nt - d) / 1000);
                            if (s < 60) {
                                t = s + "秒前";
                            } else if (s >= 60) {
                                t = Math.floor(s / 60) + "分前";
                            }
                        }
                    }
                    //jc.eq(i).attr('data-ext-userid', u);
                    setCopycome(jc.eq(i), m, u, cinfo.datetime, t, mw);
                }
                //console.timeEnd('ma100_loop')
            }
            var malen = Math.min(ma.length, 100);
            //console.time('malen_loop')
            for (let i = 0, m, t, d, u, dt, mw; i < malen; i++) {
                //console.log("loop after malen")
                m = ma[i][0];
                u = ma[i][2];
                t = ma[i][1];
                dt = ma[i][3];
                mw = "";
                if (settings.isDelTime) {
                    mw = "unset";
                    t = "";
                }
                setCopycome(jc.eq(i), m, u, dt, t, mw);
            }
            //console.timeEnd('malen_loop')
            //            if(eo.childElementCount<100){
            //                jc.slice(eo.childElementCount,100).children().text("")
            //                    .filter('.comeposttime').attr("name","")
            //                ;
            //            }
            if (hlsw > 0) {
                comehl(jc.slice(0, ma.length), hlsw);
            }
            if (settings.isUserHighlight) {
                comeUserHighlight(jc.slice(0, ma.length));
            }
            if ((settings.isDelOldTime || settings.isDelTime) && isComeOpen(4) && isSideOpen(3)) setTimeout(comewidthfix, 0, 0, 0);
        }
        commentNum = EXcomelistChildren.length;//EXcomelist.childElementCount;
    } else if (d === undefined || copycomecount > 0) {
        console.log("copycome fullcopy");
        //100件全てを上書き
        jc.find('span').text("");
        $('.comeposttime').attr("name", "");
        //console.time('fullcp_loop')
        for (let i = 0, j = 0, e, m, t, dt, u, cinfo, mw; (e = EXcomelist.children[i]) ; i++) {
            if (e.hasChildNodes() && e.firstElementChild.childElementCount > 1 && e.firstElementChild.firstElementChild.tagName.toUpperCase()=='P') {
                cinfo = getComeInfo(e);
                u = cinfo.userid;
                m = comefilter(cinfo.message, u);
                //console.log(e,cinfo,m)
                if (m.length > 0) {
                    mw = "";
                    if (settings.isDelTime) {
                        mw = "unset";
                        t = "";
                    } else {
                        t = cinfo.timeStr;
                    }
                    //console.log(e,cinfo,m,jc.eq(j),j)
                    setCopycome(jc.eq(j), m, u, cinfo.datetime, t, mw);
                    j += 1;                    
                    if (j >= 100) { break; }
                }
            }
        }
        //console.timeEnd('fullcp_loop')
        if (settings.isUserHighlight) {
            comeUserHighlight(jc);
        }
        if ((settings.isDelOldTime || settings.isDelTime) && isComeOpen(4) && isSideOpen(3)) setTimeout(comewidthfix, 0, 0, 0);
        commentNum = EXcomelistChildren.length;//EXcomelist.childElementCount;
        if (--copycomecount > 0) {
            //番組ページ読込直後か番組開始直後でcopycomeに残ったままのコメントをfullcopyで上書き消去する
            setTimeout(copycome, 800);
        }
    }
 
    //console.timeEnd('copycome');
}
function comewidthfix(i, h) {
// コメ欄のwidth:unsetによって文字列分の幅になっているコメントが右コントロールと被っていたら縮める
// スクロールするごとに改行位置を変えるのは忙しすぎるのでスクロール状態は無視する
// コメ欄がスクロール状態でも未スクロールと同様に動作させるためtopの使用は避けてheightを加算している
    //微妙に閉じてる時に作動すると酷いことになるので注意する(呼出時に)
    if (!(i <= 100)) return;
    if (i == 0) {
        if (settings.isInpWinBottom)
            h = window.innerHeight - EXcomesend.getBoundingClientRect().height;
        else
            h = EXcomesend.getBoundingClientRect().height;
    }
    var jo=$('#copycomec').children().eq(i);
    var jc=jo.children().first();
    var j = 1 + jo.height();
    var ti, bi;
    if (settings.isInpWinBottom) {
        ti = h - j;
        bi = h;
    } else {
        ti = h;
        bi = h + j;
    }
    var ts = $(EXside).offset().top;
    var bs = $(EXside).height() + ts;
    if (ts < bi && ti < bs && jc.length>0) {
        jc.css("width", ($(EXside).offset().left - jc.offset().left - 8) + "px");
    } else if (settings.isInpWinBottom ? (bi < ts) : (ti < bs)) {
        $('#copycomec').children().slice(i).children('p').first().css("width", "unset");
        return;
    } else {
        jc.css("width", "unset");
    }
    j = 1 + $('#copycomec').children().eq(i).height();
    setTimeout(comewidthfix, 0, i + 1, settings.isInpWinBottom ? h - j : h + j);
}
// コメ欄クリック時に呼び出され、NGワード追加画面表示
function comecopy() {
    console.log("comecopy");
    if (!settings.isComelistClickNG) return;
    var jo = $('.comem');
    if (jo.length == 0) return;

    //var eo = jo[0];
    var r = /rgba?\((\d+), (\d+), (\d+)(, \d?(?:\.\d+)?)?\)/;
    var s = "";
    var uid = "";
    for (var i = 0, e, c, t; (e = jo.eq(i))&&(c=e.css("color"))&&r.test(c); i++) {
        //c = $(e.children[0]).css("color");
        //if (r.test(c)) {
        t = r.exec(c);
        if (t[2] == t[3] && +t[1] > +t[2]) {
            s = e.text();
            uid = e.parent().parent().attr('data-ext-userid') || '';
            break;
        //}
        }
    }
    if (s.length > 0) {
        if ($('#copyotw').length == 0) {
            let t = '<div id="copyotw" class="' + $(EXcomesendinp.parentElement).attr("class") + ' usermade" style="padding:5px 28px 30px 18px;">';
            t += '<a style="position:absolute;top:10px;left:1px;cursor:pointer;"><svg id="closecopyotw" class="usermade" width="16" height="16" style="fill:rgba(255,255,255,0.5);"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/images/icons/close.svg#svg-body"></use></svg></a>';
            t += '<input type="hidden" id="copyotu" value="">';
            t += '<textarea id="copyot" class="' + $(EXcomesendinp).attr("class") + '" rows="1" maxlength="100" wrap="soft" style="height:24px;width:248px;padding-left:4px;border: black solid 1px;"></textarea>';
            t += '<div style="height:24px;pointer-events:none;">　</div>';
            t += '<a id="textNG" style="position:absolute;top:6px;right:1px;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);padding:0px 1px;letter-spacing:1px;cursor:pointer;">NG</a>';            
            t += '<div style="position:absolute;top:32px;right:1px;">';
            t += '<span id="copyotuDisp"></span>';
            t += '<a id="useridNG" style="color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);padding:0px 1px;letter-spacing:1px;cursor:pointer;margin:1px;">ユーザーNG</a>';
            t += '</div></div>';
            $(t).insertAfter(EXcomesendinp.parentElement);
            $('#closecopyotw').parent('a').on("click", closecotwclick);
            $('#textNG').on("click", appendTextNG);
            $('#useridNG').on("click", appendUserNG);
        } else {
            $('#copyotw').insertAfter(EXcomesendinp.parentElement) //#copyotw作成後に投稿ボタン等が生成された場合の順序修正
                .css("display", "")
                ;
        }
        $(EXcomesendinp.parentElement).css("display", "none");
        $(EXcomesend).css("padding-left", "0px");
        $('#copyot').val(s);
        $('#copyotu').val(uid) || '';
        var co = $(EXcomesendinp).css("color");
        $('#textNG,#useridNG').css("color", co)
            .css("border-color", co)
            ;
        $('#closecopyotw').css("fill", co);
        $('#copyotuDisp').text('ID: '+uid+' ').css("color", co);        
        paintcopyot(1);
        paintcopyotw(1);
    }
    comeNGmode = 0;
}
function paintcopyot(mode) {
    //mode 0:色除去 1:青 2:黄 3:赤
    if ($('#copyot').length == 0) return;
    if (mode == 0) {
        $('#copyot').css("color", "");
        return;
    }
    var a = [0, 0, 0];
    var p = 1;
    switch (mode) {
        case 1:
            a = [0, 0, 255];
            p = 0.9;
            break;
        case 2:
            a = [255, 255, 0];
            p = 0.6;
            break;
        case 3:
            a = [255, 0, 0];
            p = 0.6;
            break;
        default:
    }
    var r = /rgba\( *(\d+), *(\d+), *(\d+), *(\d?(?:\.\d+)?) *\)/;
    var c = $(EXcomesendinp).css("color");
    if (r.test(c)) {
        var t = r.exec(c);
        $('#copyot').css("color", "rgba(" + Math.floor(a[0] - (a[0] - (+t[1])) * p) + "," + Math.floor(a[1] - (a[1] - (+t[2])) * p) + "," + Math.floor(a[2] - (a[2] - (+t[3])) * p) + "," + t[4] + ")");
    }
}
function paintcopyotw(mode) {
    //mode 0:色除去 1:青 2:黄 3:赤
    if ($('#copyotw').length == 0) return;
    if (mode == 0) {
        $('#copyotw').css("background-color", "");
        return;
    }
    var a = [0, 0, 0];
    var p = 1;
    switch (mode) {
        case 1:
            a = [0, 0, 255];
            p = 0.8;
            break;
        case 2:
            a = [255, 255, 0];
            p = 0.6;
            break;
        case 3:
            a = [255, 0, 0];
            p = 0.6;
            break;
        default:
    }
    var r = /rgba\( *(\d+), *(\d+), *(\d+), *(\d?(?:\.\d+)?) *\)/;
    var b = $(EXcomesendinp.parentElement).css("background-color");
    if (r.test(b)) {
        var t = r.exec(b);
        $('#copyotw').css("background-color", "rgba(" + Math.floor(a[0] - (a[0] - (+t[1])) * p) + "," + Math.floor(a[1] - (a[1] - (+t[2])) * p) + "," + Math.floor(a[2] - (a[2] - (+t[3])) * p) + "," + t[4] + ")");
    }
}
function appendTextNG(ev, inpstr) {
    //ev #textNGのclickの場合イベントが渡される
    //inpstr これ以外からNG追加する場合こっちに渡すようにする(複数なら配列可)
    if (ev && comeNGmode > 0) {
        appendNGpermanent(1);
        return;
    }
    comeNGmode = 1;
    var s;
    if (inpstr === undefined) {
        s = $('#copyot').val();
        isComelistMouseDown = false;        
    } else {
        s = inpstr;
    }
    if (s.length == 0) {
        //空欄のままNGボタン押下時は何もしないように直ちに終了する
        comeNGmode = 0;
        return;
    }
    var strArr = [];
    if (Array.isArray(s)) {
        strArr = s;
    } else {
        strArr = [s];
    }
    var b = true,
        ngsi;
    var spfullng = settings.fullNg.split(/\r|\n|\r\n/);
    for (var ngi = 0; ngi < spfullng.length; ngi++) {
        if (spfullng[ngi].length == 0 || spfullng[ngi].match(/^\/\//)) {
            continue;
        }
        spfullng[ngi] = spfullng[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
        for (ngsi = 0; ngsi < strArr.length; ngsi++){
            if (strArr[ngsi] == spfullng[ngi]) {
                b = false;
                break;
            }
        }
    }
    if (b) { //既存のfullNgに無い場合のみ追加
        for (ngsi = 0; ngsi < strArr.length; ngsi++){
            if (/\r|\n/.test(settings.fullNg[settings.fullNg.length - 1])) {
                settings.fullNg += strArr[ngsi];
            } else {
                settings.fullNg += "\n" + strArr[ngsi];
            }
        }

        arrayFullNgMaker();
        copycome();
    }
    if (inpstr === undefined) {
        if (settings.isComeClickNGautoClose) {
            $('#closecopyotw').parent('a').css("pointer-events", "none")
                .css("visibility", "hidden")
                ;
        }
        //NGボタン押下1回目(一時登録)は黄色
        paintcopyot(2);
        paintcopyotw(2);
        setTimeout(copyotuncolor, 800, 1);
    }
}
function appendUserNG(ev, inpstr){
    //ユーザーID appendTextNgに準ずる
    if (ev && comeNGmode > 0) {
        appendNGpermanent(2);
        return;
    }
    comeNGmode = 1;
    var uid;
    if (inpstr === undefined) {
        uid = $('#copyotu').val();
        isComelistMouseDown = false;        
    } else {
        uid = inpstr;
    }
    if (uid.length == 0) {
        //空欄のままNGボタン押下時は何もしないように直ちに終了する
        comeNGmode = 0;
        return;
    }
    var uidArr = [];
    if (Array.isArray(uid)) {
        uidArr = uid;
    } else {
        uidArr = [uid];
    }
    var b = true,
        ngsi;
    var spuserng = settings.userNg.split(/\r|\n|\r\n/);
    for (var ngi = 0; ngi < spuserng.length; ngi++) {
        if (spuserng[ngi].length == 0 || spuserng[ngi].match(/^\/\//)) {
            continue;
        }
        spuserng[ngi] = spuserng[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
        for (ngsi = 0; ngsi < uidArr.length; ngsi++){
            if (uidArr[ngsi] == spuserng[ngi]) {
                b = false;
                //console.log('apUsNg already added', uidArr,ngsi,spuserng,ngi)
                break;
            }
        }
    }
    if (b) { //既存のuserNgに無い場合のみ追加
        for (ngsi = 0; ngsi < uidArr.length; ngsi++){
            if (/\r|\n/.test(settings.userNg[settings.fullNg.length - 1])) {
                settings.userNg += uidArr[ngsi];
            } else {
                settings.userNg += "\n" + uidArr[ngsi];
            }
        }
        console.log('apUsNg append');
        arrayUserNgMaker();
        copycome();
    }
    if (inpstr === undefined) {
        if (settings.isComeClickNGautoClose) {
            $('#closecopyotw').parent('a').css("pointer-events", "none")
                .css("visibility", "hidden")
                ;
        }
        //NGボタン押下1回目(一時登録)は黄色
        paintcopyot(2);
        paintcopyotw(2);
        setTimeout(copyotuncolor, 800, 1);
    }
}
function addPermanentNG(word, userid) {
    //既存の(一時保存済の)fullNgをそのままsetStorageすると、一時保存したが永久保存しなかった単語まで永久保存されてしまうので、
    //storageから持ってきて追加、setStorageする
    //console.log('addPermanentNG',word,userid)
    var PfullNg, PuserNg;
    getStorage(null, function (value) {
        var b = true;        
        PfullNg = value.fullNg || settings.fullNg;
        PuserNg = value.userNg || settings.userNg;
        var spPfullng = PfullNg.split(/\r|\n|\r\n/);
        var spPuserng = PuserNg.split(/\r|\n|\r\n/);
        if (word) {
            for (let ngi = 0; ngi < spPfullng.length; ngi++) {
                if (spPfullng[ngi].length == 0 || spPfullng[ngi].match(/^\/\//)) {
                    continue;
                }
                spPfullng[ngi] = spPfullng[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
                if (word == spPfullng[ngi]) {
                    b = false;
                    break;
                }
            }
            if (b) { //storage内のfullNgに無い場合のみ追加
                if (/\r|\n/.test(PfullNg[settings.fullNg.length - 1])) {
                    PfullNg += word;
                } else {
                    PfullNg += "\n" + word;
                }
                setStorage({
                    "fullNg": PfullNg
                });
            }
        }
        b = true;
        if (userid) {
            for (let ngi = 0; ngi < spPuserng.length; ngi++) {
                if (spPuserng[ngi].length == 0 || spPuserng[ngi].match(/^\/\//)) {
                    continue;
                }
                spPuserng[ngi] = spPuserng[ngi].replace(/\/\/.*$/, ""); //文中コメントを除去
                if (userid == spPuserng[ngi]) {
                    b = false;
                    break;
                }
            }
            if (b) { //storage内のfullNgに無い場合のみ追加
                if (/\r|\n/.test(PuserNg[settings.userNg.length - 1])) {
                    PuserNg += userid;
                } else {
                    PuserNg += "\n" + userid;
                }
                setStorage({
                    "userNg": PuserNg
                });
            }
        }
        
    });
}
function appendNGpermanent(sw) { //sw= 1:ワード 2=ユーザーID
    console.log("appendNGpermanent", sw);
    comeNGmode = 2;
    $('#textNG,#useridNG').css("pointer-events", "none");
    var s = $('#copyot').val();
    var uid = $('#copyotu').val();
    if ((s.length == 0 && sw == 1) || (uid.length == 0 && sw == 2)) {
        //console.log(s,uid,sw)
        comeNGmode = 0;
        return;
    }
    //storageへの追加部を外部関数へ
    if (sw == 1) {
        addPermanentNG(s);        
    }else if (sw == 2) {
        addPermanentNG(null, uid);        
    }

    //NGボタン押下2回目は赤
    paintcopyot(3);
    paintcopyotw(3);
    setTimeout(copyotuncolor, 800, 2);
}
function copyotuncolor(mode) {
    //mode 1:一時登録 2:permanent
    //一時登録から呼んだ時(mode=1)にcomeNGmodeが1でない場合、NGボタンを2度押したのでmode=1での実行は中止する
    if (mode == 1 && comeNGmode == 2) return;
    comeNGmode = 0;
    $('#copyot').val("");
    $('#textNG,#useridNG').css("pointer-events", "");
    paintcopyot(1);
    paintcopyotw(1);
    if (settings.isComeClickNGautoClose) {
        $('#closecopyotw').parent('a').css("pointer-events", "")
            .css("visibility", "")
            ;
        closecotwclick();
    }
}
function closecotwclick() {
    $('#copyotw').css("display", "none");
    $(EXcomesendinp.parentElement).css("display", "");
    $(EXcomesend).css("padding-left", "");
}

function injectXHR(){
    if($('#ext-xhr-injection').isEmpty()&&(settings.maxResolution!=2160||settings.minResolution!=0)){
        var xhrinjectionpath = chrome.extension.getURL("/scripts/injection-xhr.js");
        $("<script src='" + xhrinjectionpath + "' id='ext-xhr-injection'></script>").appendTo("head");
    }
}
getStorage(['disableExtVersion', 'maxResolution', 'minResolution'], function(val){
    if(val.disableExtVersion !== currentVersion){
        if (isEdge) {
            mainfunc();
        } else {
            $(window).on('load', mainfunc);
        }
        if(val.maxResolution!=undefined && val.minResolution!=undefined){
            settings.maxResolution = val.maxResolution;
            settings.minResolution = val.minResolution;
        }

        injectXHR();
    }else{
        var csspath = chrome.extension.getURL("/styles/content.css");
        $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
        toast('現在のバージョンの拡張機能は動作が停止されています。');
    }
});

//URLによって実行内容を変更すべく各部を分離
function mainfunc() { //初回に一度実行しておけば後でURL部分が変わっても大丈夫なやつ
    console.log("loaded");
    var csspath = chrome.extension.getURL("/styles/content.css");
    $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
    // jqueryを開発者コンソールから使う
    var jquerypath = chrome.extension.getURL("/jquery-3.2.1.min.js");
    $("<script src='" + jquerypath + "'></script>").appendTo("head");
    var injectionpath = chrome.extension.getURL("/scripts/injection.js");
    $("<script src='" + injectionpath + "'></script>").appendTo("head");
    //URLパターンチェック
    checkUrlPattern(location.href);
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
    //解像度設定反映
    localStorage.setItem('ext_minResolution', settings.minResolution);
    localStorage.setItem('ext_maxResolution', settings.maxResolution);
    window.dispatchEvent(resolutionSetEvent);
}
function onairfunc() {
    //変数リセット
    isFirstComeAnimated = false;
    isBottomScrolled = false;
    //要素チェック
    setEXs();
    delayset();
    if (onairRunning === false) {
        onairRunning = setInterval(onairBasefunc, 1000);
    }

    setTimeout(onresize, 5000);
    if ((settings.isShareNGword || settings.isShareNGuser) && !isNGShareInterval) {
        setTimeout(applySharedNG, 1000);
    }
    copycomecount = 2;
    if (settings.mastodonInstance && settings.mastodonToken){
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
    }
    //何らかの不具合で放送ページに推移したのに放送画面が構築されない場合は5秒待って再読み込み
    setTimeout(function(){
        if (checkUrlPattern(true) != 3) return;
        if (previousLocation.indexOf('now-on-air')>=0) return;
        if (!EXfoot && !EXcome && !EXside) location.href = location.href;
    }, 5000);
}
//    setInterval(function () {
function onairBasefunc() {
    //console.log("1s");
    //console.time('onairbasefunc');
    onairSecCount++;
    try {
        //console.time('obf_1');
        if (checkUrlPattern(true) != 3) { clearInterval(onairRunning); onairRunning = false; return; }

        // 1秒ごとに実行
        if($('.ext_abm-come').length==0){
            addExtClass(EXcome, 'come');
        }
        if($('.ext_abm-comelist').length==0){
            addExtClass(EXcomelist, 'comelist');
        }
        if (!EXcomelist || $(document).has(EXcomelist).length==0) {
            EXcomelist = getComeListElement();
            if(EXcomelist){
                //console.log('ecl', EXcomelist, $('body').has(EXcomelist).length==0)
                addExtClass(EXcomelist, 'comelist');
                setOptionHead();
                window.dispatchEvent(comelistReadyEvent);
                commentObserver.disconnect();
                commentObserver.observe(EXcomelist, { childList: true});
            }
        }
        if (!EXinfo || $(document).has(EXinfo).length==0){
            EXinfo = getInfoElement();
            addExtClass(EXinfo, 'info');
            setOptionHead();
        }

        //        //映像のtopが変更したらonresize()実行
        //        if(settings.isResizeScreen && $("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        //        if($("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        var jo = $(getElm.getVideo());
        //.resize-screenに設定されるwidth,heightをトリガーにする
        if (!jo.isEmpty() && (movieWidth != parseInt(jo.first().width()))){// || movieHeight != parseInt(jo[0].style.height))) {
            onresize();
        }
/*
//video.parentのwidthが外れた場合にonresizeをかけ直す用 onresize変更で一旦不要になった
        if (settings.isResizeScreen) {
            var jo;
            if ((jo = getVideo())){
                var jw = parseInt(jo.css("width"));
                if (jw != movieWidth2) {
                    onresize();
                }
            }
        }
*/
        //console.timeEnd('obf_1');
        //console.time('obf_come');
        //        //黒帯パネル表示のためマウスを動かすイベント発火
        //        if (settings.isAlwaysShowPanel) {
        //            triggerMouseMoving();
        //            if(!settings.isSureReadComment){
        //console.log("popHeader 1s");
        //                popHeader();
        //            }
        //        }
        //初回読込時のみ実行するためにdelayset内へ移動
        //        //音量が最大なら設定値へ自動変更
        //        if(settings.changeMaxVolume<100&&$('[class^="styles__highlighter___"]').css("height")=="92px"){
        //            if($(EXvolume).contents().find('svg').css("fill")=="rgb(255, 255, 255)"){
        //                otoColor();
        //            }
        //            otosageru();
        //        }
        
        // コメント取得関係はonCommentChange()へ移動

        //console.timeEnd('obf_come');
        //console.time('obf_1_2');
        if (settings.isComelistNG) {
            //copycomeできていない場合はここで全copyする
            var b = true;
            if ($('#copycome').length > 0) {
                //番組切替直後などでcopycomeはある場合は中身があるか数件チェックする
                for (var i = 0, c = $('#copycomec').children(), j; i < 5; i++) {
                    if (c.eq(i).children().children().first().text().length > 0) {
                        b = false;
                        break;
                    }
                }
            }
            if (b) {
                copycome();
            }
        }
        //console.timeEnd('obf_1_2');
        //流れるコメントのうちmovingCommentSecond*2経過したものを削除
        if (settings.isMovingComment) {
            var arMovingComment = $('.movingComment');
            for (let j = 0; j < arMovingComment.length; j++) {
                //                if(arMovingComment.eq(j).offset().left + arMovingComment.eq(j).width()<=0){
                //if (arMovingComment.eq(j).offset().left - parseInt(arMovingComment.eq(j)[0].style.left) < 1) {
                if (parseInt(arMovingComment[j].getAttribute('data-createdSec')) < (onairSecCount - settings.movingCommentSecond*2)) {
                    arMovingComment[j].remove();
                } else {
                    break; //前から順番に見ていって画面外のコメントを処理し終わったらbreak
                }
            }
        }
        //console.time('obf_2');
        //2つに分かれていたのを統合
        //この後ろで結局コメ数チェックするのでここでついでに実行
        if (EXfootcountcome) {
            //var comeContStr = $(EXfootcountcome).text();
            //var commentCount;
            var isComeClickable = isFootcomeClickable();
            /*if (isNaN(parseInt(comeContStr))) { //今コメント無効
                commentCount = -1;
            } else {
                commentCount = parseInt(comeContStr);
            }*/
            if (settings.isCMBlack || settings.isCMsoundoff || settings.CMsmall < 100) {
                if (!isComeClickable && isComeLatestClickable) {
                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
                    if (cmblockcd <= 0) {
                        faintcheck(1, cmblockcd, bginfo[3]);
                        cmblockcd = cmblockia;
                        bginfo[3] = 1;
                    }
                } else if (isComeClickable && !isComeLatestClickable) {
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
                    if (cmblockcd >= 0) {
                        faintcheck(-1, cmblockcd, bginfo[3]);
                        cmblockcd = cmblockib;
                        bginfo[3] = 3;
                    }
                }
            } else {
            }
            //comeLatestCount = commentCount;
            isComeLatestClickable = isComeClickable;
        }
        if (settings.useEyecatch) {
        //if ((EXwatchingnum !== undefined) && settings.useEyecatch) {
            //if ($(EXobli).find("object,video").first().parentsUntil(EXobli).last().children().length > 3) {
            if (EXvideoarea.childElementCount > 4){
            //if ($(EXobli.children[EXwatchingnum]).children('[class*="styles__eyecatch"]').length > 0) {
                //eyecatchが有る
                if (eyecatched == true) {
                    //前回も有った=eyecatchが引き続き出現中
                } else {
                    //console.log("eyecatch appeared");
                    //前回は無かった=eyecatchが今出現した
                    if (cmblockcd <= -1) {
                        //カウントアップ中なら早めてこの後すぐ発動
                        cmblockcd = -1;
                        //                    }
                        //                    if(!eyecatcheck){
                    } else if (!eyecatcheck) {
                        //早めた場合のeyecatch(=コメ無効終了直後?)が消える時は無効開始直前ではない？ので実行しない
                        //無効終了直後と無効開始直前のeyecatchが共通である場合は実行した方がいいが、
                        //それほどに本編が短時間な場合そもそもコメントが有効にならない可能性が高い
                        eyecatcheck = true;
                        fastEyecatching(100);
                    }
                }
                eyecatched = true;
            } else {
                //eyecatchが無い
                if (eyecatched == true) {
                    //前回は有った=eyecatchが今消えた
                    //ここでなく、この上のfastEyecatching以下で行う
                    //                    if(cmblockcd>=1){
                    //                        //カウントダウン中なら早めてこの後すぐ発動
                    //                        cmblockcd=1;
                    //                    }
                } else {
                    //前回も無かった=eyecatchは引き続き無い
                }
                eyecatched = false;
            }
        }
        //console.log("cmblockcd",cmblockcd);
        if (cmblockcd != 0) {
        //console.log("cmblockcd",cmblockcd);
            if (cmblockcd > 0) {
                cmblockcd -= 1;
                if (cmblockcd <= 0) {
                    bginfo[3] = 2;
                    cmblockcd = 0;
                    startCM();
                }
            } else {
                cmblockcd += 1;
                if (cmblockcd >= 0) {
                    cmblockcd = 0;
                    bginfo[3] = 0;
                    endCM();
                }
            }
        }

        //残り時間表示
        if (settings.isTimeVisible && EXinfo) {
            //            var eProTime = $('[class^="TVContainer__right-slide___"] [class^="styles__time___"]');
            var eProTime = $(EXinfo).children('div:not(#copyinfo)').find('h2').nextAll().eq(1);
            //            var reProTime = /(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*\~[　 ]*(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var reProTime = /(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*[\~～〜\-－][　 ]*(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var arProTime;
            if (eProTime.length > 0 && (arProTime = reProTime.exec(eProTime[0].textContent)) != null) {
                //番組開始時刻を設定
                if (arProTime[1] && 1 <= parseInt(arProTime[1]) && parseInt(arProTime[1]) <= 12) {
                    proStart.setMonth(parseInt(arProTime[1]) - 1);
                }
                if (arProTime[2] && 1 <= parseInt(arProTime[2]) && parseInt(arProTime[2]) <= 31) {
                    proStart.setDate(parseInt(arProTime[2]));
                }
                if (arProTime[3] && 0 <= parseInt(arProTime[3]) && parseInt(arProTime[3]) <= 47) {
                    if (parseInt(arProTime[3]) < 24) {
                        proStart.setHours(parseInt(arProTime[3]));
                    } else {
                        proStart.setHours(parseInt(arProTime[3]) - 24);
                        proStart = new Date(proStart.getTime() + 24 * 60 * 60 * 1000);
                    }
                }
                if (arProTime[4] && 0 <= parseInt(arProTime[4]) && parseInt(arProTime[4]) <= 59) {
                    proStart.setMinutes(parseInt(arProTime[4]));
                }
                proStart.setSeconds(0);
                //番組終了時刻を設定
                if (arProTime[5] && 1 <= parseInt(arProTime[5]) && parseInt(arProTime[5]) <= 12) {
                    proEnd.setMonth(parseInt(arProTime[5]) - 1);
                }
                if (arProTime[6] && 1 <= parseInt(arProTime[6]) && parseInt(arProTime[6]) <= 31) {
                    proEnd.setDate(parseInt(arProTime[6]));
                }
                if (arProTime[7] && 0 <= parseInt(arProTime[7]) && parseInt(arProTime[7]) <= 47) {
                    if (parseInt(arProTime[7]) < 24) {
                        proEnd.setHours(parseInt(arProTime[7]));
                    } else {
                        proEnd.setHours(parseInt(arProTime[7]) - 24);
                        proEnd = new Date(proEnd.getTime() + 24 * 60 * 60 * 1000);
                    }
                }
                if (arProTime[8] && 0 <= parseInt(arProTime[8]) && parseInt(arProTime[8]) <= 59) {
                    proEnd.setMinutes(parseInt(arProTime[8]));
                }
                proEnd.setSeconds(0);
            }
            //console.log(eProTime, arProTime, proStart, proEnd)
            var forProEnd = proEnd.getTime() - Date.now(); //番組の残り時間
            var proLength = proEnd.getTime() - proStart.getTime(); //番組の全体長さ
            var strProEnd = Math.floor(forProEnd / 1000);
            if (forProEnd > 0) {
                //                strProEnd = (("0"+Math.floor(forProEnd/3600000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%3600000)/60000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%60000)/1000)).slice(-2)).replace(/^00?( : )?0?0?( : )?0?/,"");
                strProEnd = (("0" + Math.floor(forProEnd / 3600000)).slice(-2) + "：" + ("0" + Math.floor((forProEnd % 3600000) / 60000)).slice(-2) + "：" + ("0" + Math.floor((forProEnd % 60000) / 1000)).slice(-2)).replace(/^[0：]*/, "");
            }
            if (!$("#forProEndTxt").is(".vol")) {
                $("#forProEndTxt").text(strProEnd);
                $("#forProEndBk").css("width", ((forProEnd > 0) ? Math.floor(310 * forProEnd / proLength) : 310) + "px");
            }
        }
        //コメント欄を常時表示
        if (settings.isSureReadComment && !comeRefreshing && !comeFastOpen && !isComeOpen()) {
            waitforCloseCome(0);
        }
        //各要素を隠すまでのカウントダウン (マウスが動かずに時間経過)
        if (forElementClose > 0 && eventAdded) {
            //console.log("forElementClose:"+forElementClose+"->"+(forElementClose-1));
            forElementClose -= 1;
            if (forElementClose <= 0) {
                //黒パネルを隠す
                pophideSelector(-1, 1);
                //カーソルを隠す
                EXmain.style.cursor = 'none';
            }
        }

        //コメント位置のTTLを減らす
        for (let i = 0; i < comeLatestLen; i++) {
            if (comeLatestPosi[i][1] > 0) {
                comeLatestPosi[i][1] -= 1;
                if (comeLatestPosi[i][1] <= 0) {
                    comeLatestPosi[i][0] = 0;
                }
            }
        }

        //番組タイトルの更新
        if (EXinfo) {
            let jo = $(EXinfo).children().not('#copyinfo').find('h2');
            if (jo.length > 0) {
                var tp = jo.first().text();
                if (tp && proTitle != tp) {
                    //if (proTitle != jo.first().text()) {//if ($('#tProtitle').text() != jo.first().text()) {
                    proTitle = tp;
                    if (settings.isProtitleVisible) {
                        $('#tProtitle').text(proTitle);
                    }
                    copycomecount = 2;
                    setTimeout(copycome, 300);
                    //番組情報(コピー)を更新
                    $(EXinfo).children('#copyinfo').remove();
                    $(EXinfo).children().not('#copyinfo').first().clone().removeClass().addClass('usermade').prop("id", "copyinfo").appendTo($(EXinfo));
                    //番組情報のSNSボタンのイベント設定
                    $('#copyinfo ul>li button').click(function (e) {
                        $(EXinfo).children().not('#copyinfo').first().find('ul>li button').eq($(e.target).parent().index()).trigger('click');
                    });
                }
            }
        }

        if (settings.comeMovingAreaTrim) {
//            var jo = $("object,video").parent();
            let jo = $(getElm.getVideo());
//            if (jo.length > 0) {
            if (!jo.isEmpty()) {
                var er = jo[0].getBoundingClientRect();
                var movieRightEdge;
                //                if(isMovieMaximize){
                //                    if(jo.width()>jo.height()*16/9){ //横長
                //                        movieRightEdge=jo.width()/2+jo.height()*8/9; //画面半分+映像横長さ/2
                //                    }else{ //縦長
                //                        movieRightEdge=jo.width();
                //                    }
                //                }else{
                movieRightEdge = er.left + er.width / 2 + jo.width() / 2;
                //                }
                $('#moveContainer').css("width", movieRightEdge + "px");
            }
        }

//視聴数をコメ欄開閉ボタンにコピー
        if (settings.isStoreViewCounter) {
            var footbutton = $(EXfootcountcome);
            var viewcountcont = $("#viewcountcont");
            if (viewcountcont.length == 0) {
                $('<span id="viewcountcont"></span>').prependTo(footbutton);
                viewcountcont = $("#viewcountcont");
            }
            var viewcounticon = $("#viewcounticon");
            if (viewcounticon.length == 0) {
                $('<svg id="viewcounticon" width="14" height="14"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/images/icons/view.svg#svg-body"></use></svg>').insertBefore(viewcountcont);
                viewcounticon = $("#viewcounticon");
            }
            if (viewcountcont.next("br").length == 0) {
                $('<br>').insertAfter(viewcountcont);
            }
            var comecounticon = footbutton.children("svg").not(viewcounticon);
            var comecountcont = $("#comecountcont");
            if (comecountcont.length == 0) {
                $('<span id="comecountcont"></span>').insertAfter(comecounticon);
                comecountcont = $("#comecountcont");
            }
            var viewpop = $(EXcountview).find('span');
            var viewpt = viewpop.text();
            if (viewpop.length == 0 || isNaN(parseInt(viewpt))) {
                viewcounticon.css("fill", "gray");
                viewcountcont.css("color", "gray").css("font-weight", "normal");
            } else {
                viewcounticon.css("fill", "");
                viewcountcont.css("color", "").css("font-weight", "");
                if (viewcountcont.text() != viewpt) {
                    if (/^\d+(k|m)$/.test(viewpt)) {
                        viewcountcont.text(viewpt.replace(/(k|m)$/, ".0$1"));
                    } else {
                        viewcountcont.text(viewpt);
                    }
                }
            }
            var comepop = footbutton.children("span").not(viewcountcont).not(comecountcont);
            var comept = comepop.text();
            if (comepop.length == 0 || isNaN(parseInt(comept))) {
                comecounticon.css("fill", "gray");
                comecountcont.css("color", "gray").css("font-weight", "normal");
            } else {
                comecounticon.css("fill", "");
                comecountcont.css("color", "").css("font-weight", "");
                if (comecountcont.text() != comept) {
                    if (/^\d+(k|m)$/.test(comept)) {
                        comecountcont.text(comept.replace(/(k|m)$/, ".0$1"));
                    } else {
                        comecountcont.text(comept);
                    }
                }
            }
        }

        //タブの音声再生状態を取得して停止してたらリロードまでカウントダウン
        chrome.runtime.sendMessage({type:"getTabAudible"},function(r){
            if(r.audible==true || !isSoundFlag)audibleReloadCount=settings.audibleReloadWait;
            else if(audibleReloadCount>=0&&--audibleReloadCount<0)window.location.href=window.location.href;
        });
        //console.timeEnd('obf_2');
        //    }, 1000);
    } catch (e) {
        console.warn(e);
    }
    //console.timeEnd('onairbasefunc');
}
function onCommentChange(mutations){
    //console.log('mutations', mutations)

    var isAnimationAdded = false,
        isCommentAdded = false,
        newCommentNum = 0,
        nodeClass,
        firstChildClass;
    for(var i=0,eo,eofc; i<mutations.length; i++){
        if(mutations[i].type == 'childList' && mutations[i].addedNodes.length > 0){
            eo = mutations[i].addedNodes[0];
            eofc = eo.firstElementChild;
            nodeClass = eo.className;
            firstChildClass = eofc.className;
            //nextClass = jo.next().attr('class');
            //console.log(nodeClass, eo.getAttribute('data-ext-userid'),eo);
            if (!comelistClasses.animated && comelistClasses.empty && mutations[i].addedNodes.length == 1 && EXcomelist.childElementCount == 1) { //1つだけなら初回読込としてanimatedとする(emptyも1つだけだがEXcomelist取得時にempty取得済 だけど一応チェック)
                comelistClasses.animated = nodeClass.split(/\s/)[0].replace(/^\s+|\s+$/g, "");
                isAnimationAdded = true;
                console.log('!aniC&&emp&&added.l==1&&EXcomeli.chi.l==1 aniC=',comelistClasses.animated);
            }else if (!comelistClasses.animated && eofc.firstElementChild.tagName.toUpperCase() == "DIV") { //直下のコメ本文がpじゃなければanimatedとする
                comelistClasses.animated = nodeClass.split(/\s/)[0].replace(/^\s+|\s+$/g, "");
                isAnimationAdded = true;
                console.log('!aniC&&eo.1stChi==div aniC=',comelistClasses.animated);
            }else if(!comelistClasses.animated && parseInt(eo.style.height)<10){//jo.css("transition-property")=="height"だと反応しないっぽい
                //console.log('mutation added: animation');
                comelistClasses.animated = nodeClass.split(/\s/)[0].replace(/^\s+|\s+$/g, "");
                isAnimationAdded = true;
                console.log('!aniC&&eo.style.height<10 aniC=',comelistClasses.animated,' height=',eo.style.height);                
            }else if(!comelistClasses.animated && EXcomelist.getAttribute('data-ext-hascommentanimation')=='true'){
                comelistClasses.animated = nodeClass.split(/\s/)[0].replace(/^\s+|\s+$/g, "");
                isAnimationAdded = true;
                console.log('!aniC&&hasComeAni==true aniC=',comelistClasses.animated);
            }else if (comelistClasses.animated && nodeClass.indexOf(comelistClasses.animated) >= 0 && comelistClasses.progress && nodeClass.indexOf(comelistClasses.progress) >= 0) {
                //animation部がプログレスバー なにもしない
                console.log('animation: progress');
            }else if (comelistClasses.animated && nodeClass.indexOf(comelistClasses.animated) >= 0) {
                isAnimationAdded = true;
            }else if (comelistClasses.animated && !comelistClasses.stabled && eofc.childElementCount>1 && eofc.children[0].tagName.toUpperCase() == "P" && (eofc.children[1].children[1].textContent.indexOf("今") >= 0 || eofc.children[1].children[1].textContent.indexOf("秒前") >= 0 || eofc.children[1].children[1].textContent.indexOf("分前") >= 0)) {
                comelistClasses.stabled = firstChildClass.split(/\s/)[0].replace(/^\s+|\s+$/g, "");
                comelistClasses.message = eofc.children[0].className;
                comelistClasses.posttime = eofc.children[1].children[1].className;
                isCommentAdded = true;
                newCommentNum++;
            }else if (comelistClasses.stabled&&firstChildClass.indexOf(comelistClasses.stabled) >= 0){
                isCommentAdded = true;
                newCommentNum++;
            }else if (!comelistClasses.progress && eo.firstElementChild && eo.firstElementChild.firstElementChild && eo.firstElementChild.firstElementChild.getAttribute('role')=='progressbar') {
                comelistClasses.progress = nodeClass;
                console.log('!progC&&eoRole==progressbar progC=',nodeClass);
            }else if((comelistClasses.empty && nodeClass.indexOf(comelistClasses.empty) >= 0) || (comelistClasses.progress && nodeClass.indexOf(comelistClasses.progress) >= 0) || ((eo.tagName.toUpperCase() == "P" || eo.tagName.toUpperCase() == "SPAN") && eo.textContent.indexOf('この番組にはまだ投稿がありません')>=0) || eo.firstElementChild.getAttribute('role')=='progressbar'){
                //CH切り替え等でコメ欄が空になった時 何もしない
                console.log('mutation added: no comment');
            }else{
                console.warn('unexpected onCommentChange()', mutations[i], eo.parentElement, eo, nodeClass, eo.innerHTML, comelistClasses);
            }
            //console.log(nodeClass,comelistClasses.animated,isAnimationAdded)                    
        }else{
            //console.log('other mutation', mutations[i].type, mutations[i])
        }
    }
    //console.log(isAnimationAdded,isCommentAdded);
    if(isCommentAdded){
        //コメント取得(animation除外) ただし最初のanimationでも実行
        //console.time('obf_getComment_beforeif')
        var commentDivParent = $(EXcomelist);//$('#main div[class*="styles__comment-list-wrapper___"]:not(#copycome)  > div');//copycome除外
        var firstChild = commentDivParent.children().eq(0);
        var isAnimationIncluded = false;//parseInt(commentDivParent.children().eq(0).css("height"))<10;//EXcomelist.children[0].className.indexOf('uo_k') >= 0;
        if(comelistClasses.animated && firstChild.attr('class') && firstChild.attr('class').indexOf(comelistClasses.animated)>=0){
            isAnimationIncluded = true;
            isAnimationAdded = true;//コメントが追加されてanimationも含まれていればaimatonも追加されたとみなす
        }
        //console.log("isA",isAnimationIncluded,EXcomelist.children[0],commentDivParent.children().eq(0).css("height"))
        //var comments = commentDivParent.children('div' + (isAnimationIncluded ? ':gt(1)' : '')).find(' [class^="styles__message___"]');//新着animetionも除外
        var comments = [];// 負荷軽減のためjQuery使わずに
        var commentDivs = EXcomelist.children;
        //if(isAnimationIncluded){console.log('div[1]:', commentDivs[1].innerHTML)}
        for(var cdi = isAnimationIncluded?1:0; cdi < commentDivs.length; cdi++){
            var cinfo = getComeInfo(commentDivs[cdi]);
            comments.push([cinfo.message, cinfo.userid, cinfo.datetime]);
        }
        var d = newCommentNum;
        //var comments = $('[class*="styles__comment-list-wrapper___"]:not(#copycome)  > div > div[class*="styles__containerer___"] > p[class^="styles__message___"]');
        //console.timeEnd('obf_getComment_beforeif')
        if (EXcomelist && isComeOpen()) {
            var comeListLen = comments.length;//EXcomelist.childElementCount;
            //var d = comeListLen - commentNum;//一定数(500)に達するとコメント数の総数は増えなくなるので左式は0になる
            //console.log('cl,cn,d', comeListLen,commentNum,d)
            //            if(comeListLen>commentNum){ //コメ増加あり
            //                if(!comeRefreshing||!settings.isSureReadComment){
            var commentDivParentV = (settings.isComelistNG && $('#copycomec').length > 0) ? $('#copycomec') : commentDivParent;
            var scrolled = false;
            if (settings.isInpWinBottom) scrolled = (commentDivParentV.children().first().offset().top > window.innerHeight);
            else scrolled = (commentDivParentV.children().first().offset().top < 0);
            if (d > 0 && !scrolled) { //コメ増加あり && スクロールが規定値以上でない
                //console.log("cmts",comments,commentDivParent,d,comeListLen,commentNum)
                //                if(!comeRefreshing){ //settings.isSureReadCommentの判定が必要な理由を失念。

                //                }else{
                //                    comeRefreshing=false;
                //                }
                if (commentNum == 0) {
                    comeHealth = Math.min(100, Math.max(0, comeListLen));
                    comeColor($(EXfootcountcome), comeHealth);
                }
                commentNum = comeListLen;
                //                if(settings.isSureReadComment&&commentNum>Math.max(comeHealth+20,settings.sureReadRefreshx)&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0&&$(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==0){
                if (/*settings.isSureReadComment && */commentNum > Math.max(comeHealth + 20, settings.sureReadRefreshx) && isFootcomeClickable() && !hasNotTransformed($(EXside).add(EXchli))) {// $(EXcome).siblings('.v3_wo').length == 0) {
                    ///*コメ常時表示 &*/ コメ数>設定値 & コメ開可 & 他枠(番組詳細と放送中一覧)非表示
                    //comehealth(refresh直後のコメ数)が100に近く設定値も100に近い場合は毎回refreshしてしまうので適当な余裕を設けておく
                    console.log("comeRefreshing start");
                    comeRefreshing = true;
                    //                    commentNum=0;
                    $('#ComeMukouMask').trigger("click");
                    fastRefreshing();
                }
                //新着コメント強調 一時試用できるように、一時保存画面が開いている場合を考慮
                var hlsw = $('#settcont').css("display") == "none" ? settings.highlightNewCome : parseInt($('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]:checked').val());
                if (settings.isComelistNG) {
                    copycome(d, hlsw); //copycome内からcomehlを実行
                } else {
                    if (hlsw > 0) {
                        comehl($(EXcomelist).children().slice(0, d), hlsw);
                    }
                    if (settings.isUserHighlight) {
                        comeUserHighlight($(EXcomelist).children().slice(0, d));
                    }
                }
            } else if (comeListLen < commentNum && !isAnimationIncluded) {
                commentNum = 0;
                comeHealth = 100;
            }
            //コメ欄逆順で初回スクロール
            //console.log('ibs,sh', isBottomScrolled,commentDivParentV[0].scrollHeight);
            
            if (!isBottomScrolled && commentDivParentV[0].scrollHeight>0) {
                commentDivParentV.scrollTop(commentDivParentV[0].scrollHeight);
                isBottomScrolled = true;
            }
            //新着コメがanimationされないときがあるのでanimationが含まれないときはコメ流しもここでやる(下でも同様にコメ流しの処理をしていて多分重複するけどlastMovedCommentTimeで弾けるはず)
            if (settings.isMovingComment && isFirstComeAnimated && !isAnimationAdded) {
                    let idx, dt, movingStarti=0;
                    for(let i = 0; i < d; i++){
                        idx = d - i - 1;
                        dt = comments[idx]?parseInt(comments[idx][2]):0;
                        if(dt<=lastMovedCommentTime){
                            continue;
                        }else if(movingStarti==0){
                            movingStarti = i;
                        }
                        putComment(comments[idx][0], comments[idx][1], i-movingStarti, d-movingStarti);                
                        if(i == d-1 && dt > 0){
                            lastMovedCommentTime = dt;
                        }
                    }
                }
                //console.log('newcome', comments, isFirstComeAnimated, d);                    
                if(!isFirstComeAnimated && isComeOpen()){
                    isFirstComeAnimated = true;
                }
            }
        }
    if(isAnimationAdded){
        //上でも同様にコメ流しの処理をする
        //console.log(isFirstComeAnimated,mutations)
        if (settings.isMovingComment && isFirstComeAnimated) {
            //                        for(var i=Math.min(settings.movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
            //                            putComment(comments[i]);
            /*for (var i = 0; i < d; i++) {
                //console.log("pc",d-i-1,comments[d-i-1])
                putComment(comments[d - i - 1], i, d);
            }*/
            //animation部から新着コメを取得し流す
            let animationCommentDivs = EXcomelist.children[0].children[0].children;
            let idx;
            let movingStarti = 0;
            //console.log(animationCommentDivs)
            for(let i = 0; i < animationCommentDivs.length; i++){
                idx = animationCommentDivs.length - i - 1;
                //console.log('pc(animation)',animationCommentDivs[idx].children[0].innerHTML, i, animationCommentDivs.length);
                if(!animationCommentDivs[idx].firstElementChild.children[0]){
                    //プログレスバーがあるなどコメントが無いときはスキップ
                    //console.log(animationCommentDivs[idx], EXcomelist.innerHTML);
                    continue;
                }
                let cinfo = getComeInfo(animationCommentDivs[idx]);
                var dt = parseInt(cinfo.datetime);
                //console.log(cinfo)
                if(dt<=lastMovedCommentTime){
                    continue;
                }else if(movingStarti==0){
                    movingStarti = i;
                }
                putComment(cinfo.message, cinfo.userid, i-movingStarti, animationCommentDivs.length-movingStarti);                
                if(i == animationCommentDivs.length-1 && dt > 0){
                    lastMovedCommentTime = dt;
                }
            }
            //if(animationCommentDivs.length>40)console.log('mc Aadded>40', animationCommentDivs, animationCommentDivs.length, newCommentNum, EXcomelist.childElementCount);
            
        }
        if(!isFirstComeAnimated){
            isFirstComeAnimated = true;
        }
    }
}

$(window).on("resize", function (){
    if (resizeEventTimer > 0) {
        clearTimeout(resizeEventTimer);
    }
    resizeEventTimer = setTimeout(function(){
        //ウィンドウのリサイズ完了時の処理
        if(settings.isResizeScreen/* && isComeOpen()*/){
            setTimeout(function(){
                //コメ欄を開くと公式が映像サイズを縮めてしまうので広げ直す
                $(EXvideoarea).width(window.innerWidth).height(window.innerHeight);
                setTimeout(onresize, 1000);//1秒後にリサイズをかける
                //setTimeout(onresize, 1500);//たまに映像がずれるので再度リサイズかけると落ち着く
            },200);
        }
    }, 200);
});

//event.jsでonHistoryStateUpdatedでページ推移を捕捉してるが念の為に10秒ポーリング(AbemaTV開いたまま拡張アップデートされたときとか)
setInterval(chkurl, 10000);
function chkurl() {
    if (currentLocation != window.location.href && disableExtVersion !== currentVersion) {
        previousLocation = currentLocation;
        currentLocation = window.location.href;
        console.log("%curl changed", "background-color:yellow;");
        //console.log("old location:", previousLocation);
        setTimeout(onresize, 1000);
        if (checkUrlPattern(false) != 3){
            eventAdded = false;//放送画面以外→放送画面と推移した場合イベント設定しなおし
        }
        commentNum = 0;
        $(".movingComment").remove();
        comeclickcd = 2;
        bginfo = [0, [], -1, -1];
        endCM();
        proStart = new Date();
        proEnd = new Date();
        proTitle = "";
        $('#tProtitle').text("未取得");
        $('#copycome').remove();
        $('#copyotw').remove();
        if(EXcomesendinp) $(EXcomesendinp.parentElement).css("display", "");
        window.dispatchEvent(urlChangeEvent);

        checkUrlPattern(currentLocation);
    }
}
//onloadからも呼ばれる
function checkUrlPattern(url) {
    //urlがtrueなら各部の実行はせず出力のみ(無限再試行でもURL切替で終了できるようにするURL判定用)
    //↑判定出力はgetInfo.determineUrl(url)に移行
    //urlがfalseなら各部の実行はせずpreviousLocationによる出力のみ
    var output = false;
    if (url === true) { url = currentLocation; output = true; } 
    else if (url === false) { url = previousLocation; output = true; }
    else {
        console.log("cup", url);
    }
    switch(getInfo.determineUrl(url)){
    case getInfo.URL_SLOTPAGE:
        //番組個別ページ
        if (output) {
            return 0;
        } else {
            putNotifyButton(url);
            //放送画面へのリンク追加
            // var channel = url.match(/https:\/\/abema.tv\/channels\/([-a-z0-9]+)\/slots\/[a-zA-Z\d]+/)[1];
            // var channelUrl = "https://abema.tv/now-on-air/" + channel;
            // $('<br><a href="' + channelUrl + '">放送画面</a>').appendTo('[class*="BroadcastingFrameContainer__left-contents___"] > div');
            onairCleaner();
            delaysetNotOA();
        }
        break;
    case getInfo.URL_DATETABLE:
        //日付別番組表
        if (output) {
            return 1;
        } else {
            //番組表(チャンネル個別ではない)のとき
            //番組表に再生ボタンを追加する機能があるため、ここにあった放送画面へのリンクは廃止
            onairCleaner();
            delaysetNotOA();
            waitforloadtimetable(url);
        }
        break;
    case getInfo.URL_CHANNELTABLE:
        //チャンネル別番組表
        if (output) {
            return 2;
        } else {
            onairCleaner();
            delaysetNotOA();
            waitforloadtimetable(url);
        }
        break;
    case getInfo.URL_ONAIR:
        //放送ページ
        if (output) {
            return 3;
        } else {
            onairfunc();
        }
        break;
    case getInfo.URL_SEARCH:
        //番組検索結果(放送予定の番組)
        if (output) {
            return 4;
        } else {
            onairCleaner();
            delaysetNotOA();
            putSerachNotifyButtons();
        }
        break;
    case getInfo.URL_RESERVATION:
        //公式の視聴予約一覧
        if (output) {
            return 5;
        } else {
            onairCleaner();
            delaysetNotOA();
            putReminderNotifyButtons();
            //スクロールで続きを読み込んだときのためチェック
            var itemCount = 0;
            var checkListInterval = setInterval(function(){
                if(checkUrlPattern(true) != 5){
                    clearInterval(checkListInterval);
                    return;
                }
                var count = $('a[role=listitem]').length;
                if(itemCount<count){
                    putReminderNotifyButtons();
                    itemCount = count;
                }
            },500);
        }
        break;
    default:
        // それ以外のページ
        if (output) {
            return -1;
        } else {
            onairCleaner();
            delaysetNotOA();
        }
        break;
    }
}

//通知機能
function putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, notifyButParent) {
    var notifyTime = programTime - settings.notifySeconds * 1000;
    var now = new Date();
    if (notifyTime > now) {
        var progNotifyName = "progNotify_" + channel + "_" + programID;
        notifyButParent.children('.addNotify').remove();
        var notifyButton = $('<div class="addNotify" data-prognotifyname="' + progNotifyName + '" data-registered="false"></div>').prependTo(notifyButParent);        
        getStorage(progNotifyName, function (notifyData) {
            //console.log(notifyData, progNotifyName)
            notifyButtonData[progNotifyName] = {
                channel: channel,
                channelName: channelName,
                programID: programID,
                programTitle: programTitle,
                programTime: programTime - 0,//dateを数字に
                notifyTime: notifyTime
            };
            if (!notifyData[progNotifyName]) {
                //未登録
                notifyButton.text("拡張機能の通知登録").css('background-color', '#fff').attr('data-registered', 'false').click(function (e) {
                    var clickedButton = $(e.target);
                    var request = notifyButtonData[clickedButton.attr("data-prognotifyname")];
                    request.type = "addProgramNotifyAlarm";
                    chrome.runtime.sendMessage(request, function (response) {
                        if (response.result === "added") {
                            toast("通知登録しました<br>番組開始" + settings.notifySeconds + "秒前にポップアップで通知します。設定されていた場合は自動で放送画面を開きます。通知設定やChromeが立ち上がってないなどにより通知されない場合があります。Chromeが起動していればAbemaTVを開いてなくても通知されます。");
                            var clickedButtonParent = clickedButton.parent();
                            clickedButton.remove();
                            putNotifyButtonElement(request.channel, request.channelName, request.programID, request.programTitle, request.programTime, clickedButtonParent);
                            if(checkUrlPattern(true) == 1 || checkUrlPattern(true) == 2){setRegistProgsBackground();}
                        } else if (response.result === "notificationDined") {
                            toast("拡張機能からの通知が拒否されているので通知できません");
                        } else if (response.result === "pastTimeError") {
                            toast("既に開始された番組です");
                        }
                    });
                });
            } else {
                //登録済み
                notifyButton.text("拡張機能の通知登録解除").css('background-color', '#feb').attr('data-registered', 'true').click(function (e) {
                    var clickedButton = $(e.target);
                    var progData = notifyButtonData[clickedButton.attr("data-prognotifyname")];
                    chrome.runtime.sendMessage({ type: "removeProgramNotifyAlarm", progNotifyName: clickedButton.attr("data-prognotifyname") }, function (response) {
                        if (response.result === "removed") {
                            toast("通知解除しました");
                            var clickedButtonParent = clickedButton.parent();
                            clickedButton.remove();
                            putNotifyButtonElement(progData.channel, progData.channelName, progData.programID, progData.programTitle, progData.programTime, clickedButtonParent);
                            if(checkUrlPattern(true) == 1 || checkUrlPattern(true) == 2){setRegistProgsBackground();}
                        }
                    });
                });
            }
        });
    } else {
        notifyButParent.children('.addNotify').remove();
    }
}
function programTimeStrToTime(programTimeStr) {
    var programTimeArray = programTimeStr.match(/(\d+)月(\d+)日[（\(][^ ~]+[）\)]\s*(\d+):(\d+)/);
    if(programTimeArray===null){console.warn('programTimeStrToTime("'+programTimeStr+'") not match'); return new Date(0);}
    var now = new Date();
    var programYear = now.getFullYear();
    var programMonthNum = parseInt(programTimeArray[1]) - 1;
    var programDate = parseInt(programTimeArray[2]);
    var programHour = parseInt(programTimeArray[3]);
    var programMinute = parseInt(programTimeArray[4]);
    if (now.getMonth() === 11 && programMonthNum === 0) {programYear++;} //現在12月なら1月は来年とする
    var programTime = new Date(programYear, programMonthNum, programDate, programHour, programMinute, 0, 0);
    return programTime;
}
function putNotifyButton(url) {
    if (checkUrlPattern(true) != 0) return;
    var divs = $("div");
    var contentsWrapper;
    var rightContents;
    var leftContnts;
    var j=divs.map(function(i, e){//大きくて子要素が２つでmain直下じゃないもの
        var rect = e.getBoundingClientRect();
        if(rect.top<window.innerHeight/4&&rect.left<window.innerWidth/4&&rect.width>1000/2&&rect.height>window.innerHeight/2&&$(e).children().length==2&&!$(e).parent().is('main'))return e;
    });
    if(j.length>0){contentsWrapper=j;}
    else{
        contentsWrapper=$('.tZ_o'); //todo
    }
    rightContents = contentsWrapper.children().eq(1);
    leftContnts = contentsWrapper.children().eq(0);
    var titleElement = rightContents.find('h2').eq(0);
    if (titleElement.text() == "") { setTimeout(function () { putNotifyButton(url); }, 1000); console.log("putNotifyButton wait"); return; }
    var urlarray = url.substring(17).split("/");
    var channel = urlarray[1];
    var channelName = titleElement.next().text();
    var programID = urlarray[3];
    if(programID.indexOf('?')>=0){
        programID = programID.slice(0,programID.indexOf('?'));
    }
    var programTitle = titleElement.text();
    var programTimeStr = titleElement.nextAll().eq(2).text();
    console.log(programID, programTitle, channel, channelName, programTimeStr, urlarray);
    var programTime = programTimeStrToTime(programTimeStr);
    //console.log(programTime)
    var butParent = $('<span class="addNotifyWrapper"></span>').insertAfter(leftContnts.children('div').children('div').eq(0));
    putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, butParent);
}
function putSerachNotifyButtons() {
    if (checkUrlPattern(true) != 4 && checkUrlPattern(true) != 5) return;
    var listWrapper = $('div[role=list]');
    var listItems = $('a[role=listitem]');
    var noContentText = '該当する放送予定の番組はありませんでした';
    var noContentMessage = $('p').map(function(i,e){if(e.innerHTML.indexOf(noContentText)>=0){return e;}});
    if (listItems.length == 0 && noContentMessage.length == 0) { setTimeout(function () { putSerachNotifyButtons(); }, 1000); console.log("putSerachNotifyButtons wait"); return; }
    listItems.each(function (i, elem) {
        var linkArea = $(elem);
        var spans = linkArea.children().eq(0).children().eq(1).children('span');
        //console.log(spans)
        if(spans.length<3)return;
        if($(elem).next('.listAddNotifyWrapper').length>0){return;}
        var butParent = $('<span class="listAddNotifyWrapper"></span>').insertAfter(elem);
        var progUrl = linkArea.attr('href');
        var urlarray = progUrl.substring(1).split("/");
        //console.log(urlarray);
        var channel = urlarray[1];
        var channelNameElem = spans.eq(1);
        var channelName = channelNameElem.text();
        var programID = urlarray[3];
        var programTitle = spans.eq(0).text();
        var programTime = programTimeStrToTime(spans.eq(2).text());
        //console.log(linkArea, channel, channelName, programID, programTitle, programTime, butParent);
        putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, butParent);
    });
    //もっとみるボタンに対応
    var moreBtn = listWrapper.next('button');
    moreBtn.click(function(){
        setTimeout(putSerachNotifyButtons, 500);
    });
}
function putReminderNotifyButtons() {
    if (checkUrlPattern(true) != 4 && checkUrlPattern(true) != 5) return;
    var listWrapper = $('div[role=list]');
    var listItems = $('a[role=listitem]');
    var featureText = '見たい番組を見逃さないためには';//公式通知登録一覧で何も登録してないときの機能紹介文
    var featureMessage = $('p').map(function(i,e){if(e.innerHTML.indexOf(featureText)>=0){return e;}});
    if (listItems.length == 0 && featureMessage.length == 0) { setTimeout(function () { putReminderNotifyButtons(); }, 1000); console.log("putReminderNotifyButtons wait"); return; }
    listItems.each(function (i, elem) {
        var linkArea = $(elem);
        var spans = linkArea.children().eq(1).find('span');
        var butParent;
        if(linkArea.next().is('.listAddNotifyWrapper')){
            butParent = linkArea.next();
        }else{
            butParent = $('<span class="listAddNotifyWrapper"></span>').insertAfter(elem);
        }
        var progUrl = linkArea.attr('href');
        var urlarray = progUrl.substring(1).split("/");
        //console.log(urlarray);
        var channel = urlarray[1];
        var titleElem = spans.eq(0);
        var channelName = spans.eq(1).text();
        var programID = urlarray[3];
        var programTitle = spans.eq(0).text();
        var programTime = programTimeStrToTime(spans.eq(2).text());
        putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, butParent);
    });
    //一括登録ボタン
    if(listItems.length>1&&$('.addAllNotifyButton').length<1){
        $('<div class="addAllNotifyButton" >以上の番組を全て拡張機能の通知登録する</div>').insertAfter(listWrapper).click(function(){
            $('.addNotify[data-registered="false"]').trigger('click');
        });
    }
}
function putSideDetailNotifyButton(){
    console.log('putSideDetailNotifyButton()');
    var sideDetailWrapper = $(EXTTsideR);
    //console.log('put side notify button', sideDetailWrapper);
    if (sideDetailWrapper.length == 0) {
        setTimeout(putSideDetailNotifyButton, 500);
        console.log('retry putSideDetailNotifyButton (sideDetailWrapper==0)');
    }
    //console.log(sideDetailWrapper.offset(),window.innerWidth - 50);
    if (sideDetailWrapper.offset().left > window.innerWidth - 50) {// sideDetailWrapperが右画面外ならリトライ
        setTimeout(putSideDetailNotifyButton, 1000);
        console.log('retry putSideDetailNotifyButton (left>window.innerWidth-50)');
        return;
    }
    var fp=sideDetailWrapper.find('p');//番組詳細,タイトル,日時,見逃し云々?
    var progTitle;
    var progTime = programTimeStrToTime(fp.eq(2).text());
    if(fp.length>=3){
        progTitle = fp.eq(1).text();
        progTime = programTimeStrToTime(fp.eq(2).text());
    }else{
        progTitle=$('zo_bq').text();
        progTime = programTimeStrToTime($('.zo_hs').text()); //todo
    }
    var fa = sideDetailWrapper.find('a').map(function (i, e) { if (e.textContent.indexOf("詳細") == 0) return e; });//a 放送中なら放送画面リンク,詳細をもっとみる
    var progLinkArr;
    if(fa.length>0) progLinkArr = fa.first().attr("href").split('/');
    else progLinkArr=$('.zo_zu').attr("href").split('/'); //todo
//    var channel = progLinkArr[2];
    var urlchan = progLinkArr.indexOf("channels");
    //console.log(fa,progLinkArr)
    if (urlchan < 0) return;
    var channel = progLinkArr[urlchan + 1];
    var channelName = getChannelNameOnTimetable(channel);
//    var progID = progLinkArr[4];
    var progID = progLinkArr[urlchan + 3];
    var notifyButParent;
    if(fp.length>=3&&fa.length>0&&fp.eq(2).next("div").is(fa.first().prev("div")))//fp2のすぐ下かつfa0のすぐ上のやつ
        notifyButParent=fp.eq(2).next("div").children("div").first();
    else notifyButParent=sideDetailWrapper.find('.zo_zw>div'); //todo
    console.log(progTitle,progTime,channel,channelName,progID,notifyButParent);
    putNotifyButtonElement(channel, channelName, progID, progTitle, progTime, notifyButParent);
}

chrome.runtime.onMessage.addListener(function (r) {
    //console.log(r);
    if (r.name == "bgsend") {
        if (r.type == 0) {
            bginfo[0] = r.value;
            if (bginfo[2] < 0) bginfo[2] = 0;
            else if (bginfo[2] == 2) bginfo[2] = 3;
        } else if (r.type == 1) {
            if (r.value[1] < r.value[2]) {
                var b = false;
                if (bginfo[1].length == 0) b = true;
                else {
                    if (r.value[0] == bginfo[1][0] && r.value[1] > bginfo[1][1]) b = true;
                    else if (r.value[0] > bginfo[1][0]) b = true;
                }
                if (b) {
                    bginfo[1] = [r.value[0], r.value[1], r.value[2]];
                    cmblockcd = r.value[1] - r.value[2] - 1;
                    b = false;
                    if (bginfo[2] <= 1) {
                        bginfo[2] = 2;
                        if (cmblockcd * 100 % 10 != 3) b = true;
                    }
                    if (!settings.isCMBkR && !settings.isCMsoundR && !settings.isCMsmlR) b = true;
                    if (b) startCM();
                    if (bginfo[1][0] > 0 && bginfo[1][1] == 0) setTimeout(tryCM, 500, 5);
                }
            } else if (r.value[1] == r.value[2]) {
                if (bginfo[1].length > 0 && r.value[0] == bginfo[1][0]) bginfo[1] = [];
                if (bginfo[1].length == 0) {
                    if (bginfo[2] == 3) {
                        bginfo[2] = 0;
                        if (cmblockcd * 100 % 10 != -3) {
                            cmblockcd = 0;
                            endCM();
                        }
                    } else setTimeout(tryCM, 500);
                }
            }
        } else if (r.type == 2) {
            if (bginfo[2] < 1) bginfo[2] = 1;
        }
    } else if (r.name == "addNGword") {
        appendTextNG(null, r.word);
        if (r.isPermanent) {
            addPermanentNG(r.word);
        }
    } else if (r.name == "toggleChannel") {
        toggleChannel(r.url);
    } else if (r.name == "historyStateUpdated") {
        chkurl();
    } else {
        console.warn("message not match");
    }
});
