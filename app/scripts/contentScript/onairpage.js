import * as $ from 'jquery';
import * as settingHtml from '../lib/settingHtml';
import * as getElm from './getAbemaElement';
import * as getInfo from './getAbemaInfo';
import * as dl from '../lib/dom-lib';
import * as gl from '../lib/generic-lib';
import * as gdl from '../lib/generic-dom-lib';
import * as gcl from './generic-comment-lib';
import * as mc from './movingComment';
import * as replayComment from './replayComment';
import { createPIPbutton } from './picture-in-picture';

//devtoolのコンソールから呼び出せる関数
if (process.env.NODE_ENV === 'development') {
    window.logOAEval = function(varName) {
        console.log(eval(varName));
    };
}
//変数定義

//複数ファイル間で参照を保つオブジェクト
let settings = {};
let bginfo = [0, [], -1, -1]; //ソースの縦長さなど主にwebrequestメッセージ入れ

const arFullNg = [];
const arUserNg = [];
export function applySharedObjects(newSettings) {
    settings = newSettings;
    mc.applySettings(settings);
    replayComment.applySharedObjects(settings, arFullNg, arUserNg);
}

var currentLocation = window.location.href;
var previousLocation = currentLocation; //URL変化前のURL

var cmblockia = 1; //コメント欄が無効になってからCM処理までのウェイト(+1以上)
var cmblockib = -1; //有効になってから解除までのウェイト(-1以下)
var panelopenset = [[1, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]]; //head,foot,sideの開閉設定[全閉,info開,chli開,come開] 0:非表示 1:5秒で隠す 2:常に表示

export const headerHeight = 68;

const footerHeight = 72;
const commentListWidth = 310;
const volumeRight = 20;
const fullscrRight = 72;

var commentNum = 0;
var isComeLatestClickable = true; //右下コメント数をクリックできるか
//var retrycount=0;
const initDate = new Date();
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
var proEnd = new Date(); //番組終了時刻として現時刻を仮定(日付が変わる直前で未来を仮定すると1日ずれる)
var forElementClose = 0; //コメント表示中でも各要素を表示させた時に自動で隠す場合のカウントダウン
var EXcomelist;

var overlapSelector; // = '#main div.'+$('div').map(function(i,e){var b=e.getBoundingClientRect();if($(e).css("position")=="absolute"&&b.top<5&&b.left<5&&b.width>window.innerWidth-10&&b.height>window.innerHeight-10&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0))return e;}).eq(0).prop("class");

var EXmain;
var EXhead;
let EXleftMenu;
var EXmenu; //元hover-contents
var EXfoot;
var EXfootcome;
var EXfootcount;
var EXcountview;
var EXfootcountcome;
var EXsidebtn;
var EXsidepanel;
var EXchli;
var EXinfo;
var EXcome;
var EXcomesend; //コメント入力フォーム
var EXcomesendinp; //↑のtextarea
//var EXobli;
let EXvideoarea;
//var EXwatchingnum;//EXobliの現在視聴中のチャンネルの子供のindex
var EXvolume;
var EXfullscr;
var EXcomemodule; //Twitterボタンや投稿ボタンを含む要素 放送画面以外ではnull
let EXcometwmodule; // コメ入力欄のTwitterボタン　入力欄をフォーカスしたときにセット
var cmblockcd = 0; //カウント用
var comeRefreshing = false; //コメ欄自動開閉中はソートを実行したいのでコメント更新しない用
var comeFastOpen = false;
//var newtop = 0;//映像位置のtop
var comeHealth = 100; //コメント欄を開く時の初期読込時に読み込まれたコメント数（公式NGがあると100未満になる）

var eventAdded = false; //各イベントを1回だけ作成する用
var setBlacked = [false, false, false]; //soundsetなどのスイッチ
var keyinput = []; //コマンド入れ
var keyCodes = '38,38,40,40,37,39,37,39,66,65';
var proTitle = ''; //番組タイトル
var proinfoOpened = false; //番組タイトルクリックで番組情報枠を開いた後にクリックで閉じれるようにする
var optionStatsUpdated = false; //optionStatsUpdateの重複起動防止
var kakikomitxt = ''; //自分の投稿内容
var eyecatched = false; //前回(1s前)の左上のロゴの存在 false:無かった true:有った
var eyecatcheck = false; //eyecatch利用時の高速チェックの多重起動を防止
var popCodes = '39' + ',39'.repeat(50); //黒帯パネルを全て非表示にした時の脱出コマンド(右矢印を51回連打)
var popinput = [];
var popacti = false; //脱出コマンドを受け付けるかどうか
var onairRunning = false; //映像ページの定期実行のやつの複数起動防止用 setintervalの格納
var comeNGmode = 0; //NG追加先の分岐用
var isComelistMouseDown = false;
var movieWidth = 0; //.TVContainer__resize-screenの大きさ(onresize発火用)
//var movieHeight = 0;
var waitingforResize = false; //waitforresizeの複数起動防止用
//var movieWidth2 = 0; //video.parentの大きさ(onresize発火用)
var oldWindowState = 'normal'; // フルスクリーン切り替え前のウィンドウのstate
var isTootEnabled = false; //コメントのトゥート有効か
var commentObserver = new MutationObserver(function(mutations) {
    setTimeout(
        function(mutations) {
            onCommentChange(mutations);
        },
        50,
        mutations
    ); //injection.jsでdata属性のセットが終わるまで待つ
}); //コメント欄DOM監視
var isFirstComeAnimated = false; //最初に既存のコメがanimationしたか 最初に既存のコメが一気に画面に流れてくるのを防ぐためのフラグ
var audibleReloadCount = -1;
var isSoundFlag = true; //音が出ているか soundSet(isSound)のisSoundを保持したり音量クリック時にミュートチェック

var comelistClasses = {
    comment: '',
    stabled: '',
    animated: '',
    empty: '',
    progress: '',
    message: '',
    posttime: '',
    newhilight: ''
};

var resizeEventTimer = 0; //ウィンドウリサイズイベント用のタイマー
var isBottomScrolled = false; //コメ欄逆順時初回で下にスクロールしたか

var comelistReadyEvent = new Event('commentListReady');
const settingsChangeEvent = new Event('settingsChange');
export const resolutionSetEvent = new Event('resolutionSet');

let delaysetConsoleStr = '';
let delaysetConsoleRepeated = false;
let setEXsConsoleStr = '';
let setEXsConsoleRepeated = false;
var lastMovedCommentTime = 0; //最後に流れたコメントの時間(コメントが二重に流れるのを防ぐ)
let resizeAgainTimer = 0;
let isComeInpFocus = false;
let isNowResizing = false;
const resizeObserver = new MutationObserver(mutations => {
    // console.log('resize mutated,', isNowResizing)
    if (!isNowResizing) {
        onresize();
    }
});

//

export function afterLoadSetting(value) {
    cmblockia = Math.max(
        1,
        value.beforeCMWait !== undefined ? 1 + value.beforeCMWait : cmblockia
    );
    cmblockib = -Math.max(
        1,
        value.afterCMWait !== undefined ? 1 + value.afterCMWait : -cmblockib
    );
    //        panelopenses=value.panelopenset||"111000000000";
    // panelopenses = value.panelopenset || (settings.isAlwaysShowPanel ? "222222222222" : (isOpenPanelwCome ? "111000000111" : "111000000000"));//isA..とisO..を初回のみ適用
    var panelopenses =
        typeof value.panelopenset == 'number'
            ? value.panelopenset
            : parseInt(value.panelopenset || '111000000000', 3);
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
    //無視する設定
    settings.isInpWinBottom = false;
    settings.sureReadRefreshx = 1000;
}
export function onairCleaner() {
    console.log('onairCleaner');
    //onairfunc以降に作成した要素を削除
    $('.usermade').remove();
    if (EXhead && EXfoot) {
        try {
            // 放送画面から他の画面に推移した際、EXinfo等がnullでエラーになる
            pophideElement({ allreset: true });
        } catch (e) {
            console.warn(e);
        }
        try {
            pophideElement({ head: 1 }); //allresetしてもヘッダーが表示されないので
        } catch (e) {
            console.warn(e);
        }
    }
    //変数クリア
    EXcomemodule = null;
    EXcometwmodule = null;
    //放送画面のEX*をクリアする、一旦非放送画面に移った後放送画面に戻ると再利用できないため再度setEXsで取得する必要がある
    EXhead = null;
    EXleftMenu = null;
    EXmenu = null;
    EXfoot = null;
    EXfootcome = null;
    EXcountview = null;
    EXfootcountcome = null;
    EXsidebtn = null;
    EXsidepanel = null;
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
    resizeObserver.disconnect();
}
function onresize(isAgain) {
    const video = getElm.getVideo();
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR || !EXvideoarea || !video)
        return;
    const videoContainer = dl.last(dl.parentsUntil(video, EXvideoarea));
    if (!videoContainer) {
        console.warn('onresize: videoContainer not found');
        return;
    }
    // console.log(videoContainer);
    isNowResizing = true;
    if (resizeAgainTimer > 0) clearTimeout(resizeAgainTimer);
    const settingWindow = document.getElementById('settcont');
    const isSettingOpen =
        settingWindow && settingWindow.style.display !== 'none';
    const isResizeScreen = isSettingOpen
        ? document.getElementById('isResizeScreen').checked
        : settings.isResizeScreen;
    const isMovieSpacingZeroTop = isSettingOpen
        ? document.getElementById('isMovieSpacingZeroTop').checked
        : settings.isMovieSpacingZeroTop;
    const isResizeSpacing = isSettingOpen
        ? document.getElementById('isResizeSpacing').checked
        : settings.isResizeSpacing;
    const isDAR43 = isSettingOpen
        ? document.getElementById('isDAR43').checked
        : settings.isDAR43;
    const isHeaderTop = isSettingOpen
        ? document.getElementById('isResizeSpacing').checked
        : settings.isResizeSpacing;
    const isMovieSpacingZeroLeft = isSettingOpen
        ? document.getElementById('isMovieSpacingZeroLeft').checked
        : settings.isMovieSpacingZeroLeft;
    const isVideoResizeNeeded =
        isDAR43 ||
        isMovieSpacingZeroTop ||
        isResizeSpacing ||
        isMovieSpacingZeroLeft;

    // ウィンドウの高さに合わす
    if (isResizeScreen || isResizeSpacing || isMovieSpacingZeroTop || isDAR43) {
        EXvideoarea.style.height =
            window.innerHeight - (isHeaderTop ? headerHeight : 0) + 'px';
        if (isResizeSpacing) {
            EXvideoarea.style.height = window.innerHeight - headerHeight + 'px';
            EXvideoarea.style.marginTop = headerHeight + 'px';
        } else {
            EXvideoarea.style.height = window.innerHeight + 'px';
            EXvideoarea.style.marginTop = '';
        }
    } else {
        EXvideoarea.style.marginTop = '';
    }
    // ウィンドウの幅に合わす
    // divを右側から幅や高さ絞り込んでそれの幅の最大値を得る
    // const rightObjectWidth = dl.filter(document.getElementsByTagName('div'), {notBodyParent: true, left12r: true, height34b: true, filters: [(e,b)=>b.width>300, e=>e.parentElement.getBoundingClientRect().width>window.innerWidth/2]}).reduce((n,e)=>Math.max(n,e.getBoundingClientRect().width),0);        EXvideoarea.style.width = '';
    // EXvideoarea.style.width = (window.innerWidth-rightObjectWidth)+'px';

    if (isResizeScreen) {
        // console.log(EXvideoarea, window.innerWidth)
        EXvideoarea.style.width = window.innerWidth + 'px';
    }

    const videoAreaRect = EXvideoarea.getBoundingClientRect();

    if (isVideoResizeNeeded) {
        let translateX = '0px';
        let translateY = '0px';
        let zoomRatio = 1;
        if (isDAR43) {
            const videoAreaRatio = videoAreaRect.height / videoAreaRect.width;
            if (videoAreaRatio > 9 / 16) {
                // 16:9基準で高さが大きい→横が見切れるように拡大
                if (videoAreaRatio > 3 / 4) {
                    // 4:3基準でも大きいのでそのまま拡大
                    zoomRatio = 4 / 3;
                } else {
                    // 9/16 < videoAreaRatio <= 3/4
                    // 4:3基準ではまだ小さいので倍率を調節する
                    // videoAreaRatioが9/16時にzoomRatioが1、3/4時に4/3として線形に倍率を決める
                    zoomRatio =
                        1 +
                        ((4 / 3 - 1) * (videoAreaRatio - 9 / 16)) /
                            (3 / 4 - 9 / 16);
                }
            }
        }
        // videoarea内のvideoContainerを実際に表示されている映像と同じ大きさにする
        if (settings.isResizeScreen) {
            // if (settings.isResizeSpacing){
            //     videoContainer.style.height = `calc((100vh - ${headerHeight}px) * ${zoomRatio})`;
            // }else {
            //     videoContainer.style.height = 100*zoomRatio+'vh';
            // }
            videoContainer.style.height = `calc(100vh - ${
                isHeaderTop ? headerHeight : 0
            }px)`;
            videoContainer.style.width = 100 * zoomRatio + 'vw';
            videoContainer.style.maxHeight = `calc(100vw * ${zoomRatio} * 9 / 16)`;
            videoContainer.style.maxWidth = `calc((100vh - ${
                isHeaderTop ? headerHeight : 0
            }px) * ${zoomRatio} * 16 / 9)`;
        } else {
            videoContainer.style.height = `calc(100%)`; // (100*zoomRatio)+'%';
            videoContainer.style.width = 100 * zoomRatio + '%';
            videoContainer.style.maxHeight =
                (zoomRatio * videoAreaRect.width * 9) / 16 + 'px';
            videoContainer.style.maxWidth =
                (zoomRatio * videoAreaRect.height * 16) / 9 + 'px';
        }
        // 横方向の中央揃え
        if (isMovieSpacingZeroLeft) {
            const videoContainerRect = videoContainer.getBoundingClientRect();
            const left = isDAR43
                ? (-1 *
                      (videoContainerRect.width -
                          videoContainerRect.height * (4 / 3))) /
                  2
                : 0;
            // videoContainer.style.left = `-${offset}px`;
            //console.log(left)
            videoContainer.style.left = left + 'px';
        } else {
            videoContainer.style.left = '50%';
            translateX = '-50%';
        }
        // 縦方向の中央揃え
        if (isMovieSpacingZeroTop || isResizeSpacing) {
            videoContainer.style.top = '0px';
        } else {
            videoContainer.style.top = '50%';
            translateY = '-50%';
        }
        // translate反映
        videoContainer.style.transform = `translate(${translateX}, ${translateY})`;
    } else {
        videoContainer.style.height = '';
        videoContainer.style.width = '';
        videoContainer.style.top = '';
        videoContainer.style.left = '';
        videoContainer.style.maxHeight = '';
        videoContainer.style.maxWidth = '';
        videoContainer.style.transform = '';
    }
    isNowResizing = false;
    if (!isAgain) resizeAgainTimer = setTimeout(onresize, 1000, true);
    // console.log('resize done');
}

function onScreenDblClick() {
    console.log('dblclick');
    if (comeNGmode == 2) return;
    if (settings.isDblFullscreen) {
        toggleFullscreen();
    }
}
function toggleFullscreen() {
    chrome.runtime.sendMessage(
        { type: 'toggleFullscreen', mode: 'toggle', oldState: oldWindowState },
        function(response) {
            oldWindowState = response.oldState;
        }
    );
    setTimeout(onresize, 1000);
}

//ミュート(false)・ミュート解除(true)する関数
function soundSet(isSound) {
    //isSound=true:音を出す
    isSoundFlag = isSound;
    if (settings.isTabSoundplay) {
        setBlacked[1] = !isSound;
        chrome.runtime.sendMessage(
            { type: 'tabsoundplaystop', valb: !isSound },
            function(r) {}
        );
        return;
    }
    if (!EXvolume) return;
    var volcon = $(EXvolume).contents();
    var butvol = volcon.find('svg')[0];
    var volobj = getVolbarObject();
    if (volobj == null) return;
    var valvol = volobj.height();
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
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
    var pwaku = $('#ComeMukouMask'); // 動画枠
    if ($(overlapSelector).length == 0) return;
    if (
        /*pwaku.length == 0*/ $(overlapSelector).siblings('#ComeMukouMask')
            .length == 0
    ) {
        //delaysetから移動してきた
        $('#ComeMukouMask').remove();
        $(
            '<div id="ComeMukouMask" style="position:absolute;width:100%;height:100%;">'
        ).insertAfter(overlapSelector);
        pwaku = $('#ComeMukouMask');
        pwaku[0].addEventListener('click', comemukouClick);
        pwaku[0].addEventListener('dblclick', onScreenDblClick);
    }
    if (type == 0) {
        setBlacked[0] = false;
        pwaku.css('background-color', '').css('border-top', '');
    } else if (type == 1) {
        var h = window.innerHeight;
        var p = 0;
        var jo = $(getElm.getVideo());
        if (jo.length !== 0) {
            var eo = jo[0];
            var cr = eo.getBoundingClientRect();
            h = cr.height;
            p = cr.top;
        }
        setBlacked[0] = true;
        pwaku
            .css('background-color', 'rgba(0,0,0,0.7)')
            //            .css("border-top",Math.floor(p+w*t/2)+"px black solid")
            .css('border-top', Math.floor(p + h / 2) + 'px black solid');
        //        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+Math.floor(p+w/2)+"px;");
    } else if (type == 2) {
        setBlacked[0] = true;
        pwaku.css('background-color', 'rgba(0,0,0,0.7)');
    } else if (type == 3) {
        setBlacked[0] = true;
        pwaku.css('background-color', 'black');
    }
}
function movieZoomOut(sw) {
    var j = $(getElm.getVideo());
    if (j.length === 0) return;
    var t = j[0].style.transform.replace(/\s*scale\(\d*(\.\d+)?\)/, '');
    if (sw == 1 && settings.CMsmall < 100) {
        setBlacked[2] = true;
        t += ' scale(' + settings.CMsmall / 100 + ')';
    } else {
        setBlacked[2] = false;
    }
    j.css('transform', t);
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
    var settcontjq = $('#settcont');
    settcontjq.css('display', 'flex');
    optionHeightFix();
    //設定ウィンドウにロード
    settingHtml.setSettingInputValue(settings, false);
    settingHtml.setRangeNumberDisplayer(); // rangeのprop反映
    var bc =
        'rgba(' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        settings.commentBackTrans / 255 +
        ')';
    var tc =
        'rgba(' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextTrans / 255 +
        ')';
    var jo = $(EXcomelist)
        .children()
        .slice(0, 10);
    jo.css('background-color', bc).css('color', tc);
    if (comelistClasses.message)
        jo.children('.' + comelistClasses.message).css('color', tc);

    $(
        '#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]'
    ).val([0]);
    $(
        '#settcont>#windowresize>#windowheight input[type="radio"][name="movieheight"]'
    ).val([0]);
    $('#beforeCMWait').val(cmblockia - 1);
    $('#afterCMWait').val(-cmblockib - 1);
    $('#iprotitlePosition').css(
        'display',
        settings.isProtitleVisible ? 'flex' : 'none'
    );
    $('#iproSamePosition').css(
        'display',
        settings.isProtitleVisible && settings.isTimeVisible ? 'flex' : 'none'
    );
    $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#windowheight input[type="radio"][name="windowheight"]').val([0]);

    var panelopenses = 0;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenses +=
                panelopenset[i][j] * Math.pow(3, (3 - i) * 3 + (2 - j));
        }
    }

    if (
        $(
            '#ipanelopenset [type="radio"][name="panelopenset"][value=' +
                panelopenses +
                ']'
        ).length > 0
    ) {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val([
            panelopenses
        ]);
    } else {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val([531441]);
    }
    if (panelopenses == 0) {
        putPopacti();
    } else {
        cancelPopacti();
    }
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            $(
                '#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]'
            ).val([panelopenset[i][j]]);
        }
    }

    $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').val([
        settings.isResizeScreen ? 1 : 0
    ]);
    $(
        '#moviePositionContainer input[type="radio"][name="moviePositionVType"]'
    ).val([
        settings.isMovieSpacingZeroTop ? 1 : settings.isResizeSpacing ? 2 : 0
    ]);
    $(
        '#moviePositionContainer input[type="radio"][name="moviePositionHType"]'
    ).val([settings.isMovieSpacingZeroLeft ? 1 : 0]);

    if (!optionStatsUpdated) {
        optionStatsUpdated = true;
        setTimeout(optionStatsUpdate, 500, false);
    }
}
function closeOption() {
    $('#settcont')
        .css('display', 'none')
        .css('right', '40px');
    $('.rightshift').css('display', 'none');
    $('.leftshift').css('display', '');
    var jo = $(EXcomelist).children('div');
    jo.css('background-color', '') //基本色、新着強調
        .css('color', '') //基本色
        .css('border-left', '') //新着強調
        .css('padding-left', '') //新着強調
        .css('border-top', '') //区切り線
        .css('transition', ''); //新着強調
    if (comelistClasses.message)
        jo.children('.' + comelistClasses.message).css('color', '');
    mc.clearOptionTemporaryStyle();
    onresize();
    setOptionElement();
    optionStatsUpdated = false;
}
function optionHeightFix() {
    var settcontjq = $('#settcont');
    var settcontheight = settcontjq[0].scrollHeight;
    var settcontpadv =
        parseInt(settcontjq.css('padding-top')) +
        parseInt(settcontjq.css('padding-bottom'));
    if (settcontheight > window.innerHeight - 105 - settcontpadv) {
        //console.log("optionHeightFix: "+settcontjq.height()+" -> "+($(window).height()-105-settcontpadv));
        settcontjq.height(window.innerHeight - 105 - settcontpadv);
    }
}

function delayset(
    isInit,
    isOLS,
    isEXC,
    isInfo,
    isTwT,
    isVideo,
    isChli,
    isComeli,
    isCome,
    isComesend,
    isComesendinp
) {
    if (getInfo.determineUrl() != getInfo.URL_ONAIR) return;
    let resetOptionHead = false;
    let reSetOptionEvent = false;

    if (!isOLS) {
        if (!overlapSelector) {
            //ページ遷移の再delayset時に本来のoverlapが無くなって映像枠が引っかかるので再探査しない
            //var jo=$('div').map(function(i,e){var b=e.getBoundingClientRect();if($(e).css("position")=="absolute"&&b.top<5&&b.left<5&&b.width>window.innerWidth-10&&b.height>window.innerHeight-10&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0)&&parseInt($(e).css("opacity"))>0)return e;});
            var jo = $('div,button').map(function(i, e) {
                var b = e.getBoundingClientRect();
                var bp = e.parentElement.getBoundingClientRect(); //↓縦長ウィンドウでも反応するようtop判定はやめる
                if (
                    $(e).css('position') == 'absolute' &&
                    /*b.top<5&&*/ b.left < 5 &&
                    b.width == bp.width &&
                    b.height == bp.height &&
                    (!isNaN(parseInt($(e).css('z-index'))) &&
                        $(e).css('z-index') > 0) &&
                    $(e).css('opacity') == 0 &&
                    $(e).siblings().length < 10
                )
                    return e;
            });
            if (jo.length > 0)
                overlapSelector = dl.getElementSingleSelector(jo[0]);
            //else{
            //    console.log('?overlapSelector');
            //    overlapSelector = "#main div.nN_nR";
            //}
        }
        if ($(overlapSelector).length > 0) {
            if (
                /*$('#ComeMukouMask').length == 0*/ $(overlapSelector).siblings(
                    '#ComeMukouMask'
                ).length == 0
            ) {
                //delaysetにも設置
                $('#ComeMukouMask').remove();
                $(
                    '<div id="ComeMukouMask" style="position:absolute;width:100%;height:100%;">'
                ).insertAfter(overlapSelector);
                document
                    .getElementById('ComeMukouMask')
                    .addEventListener('click', comemukouClick);
                document
                    .getElementById('ComeMukouMask')
                    .addEventListener('dblclick', onScreenDblClick);
            }
            isOLS = true;
        }
    }

    if (!isInit && $(EXfootcome).length > 0 && $(EXcountview).length > 0) {
        createSettingWindow();
        gcl.arrayFullNgMaker(arFullNg, settings.fullNg, settings.isShareNGword);
        gcl.arrayUserNgMaker(arUserNg, settings.userNg, settings.isShareNGuser);
        //映像のリサイズ
        onresize();
        // if (!isResizeInterval) setInterval(onresize, 30000);
        // isResizeInterval = true;
        volumecheck(); //1秒ごとに実行していた最大音量チェックを初回読込時の1回だけに変更
        if ($('#moveContainer').length == 0) {
            $('<div id="moveContainer" class="usermade">').appendTo('body');
        }

        //初期読込時にマウス反応の要素が閉じないのを直したい
        forElementClose = 1;

        // ピクチャーインピクチャーボタン設置
        createPIPbutton(EXsidebtn);

        isInit = true;
    }

    if (!isInfo && (EXinfo = getInfoElement())) {
        EXcome = null;
        EXcomesend = null;
        EXcomesendinp = null;
        EXcomelist = null;
        EXchli = null;
        isCome = false;
        isComesend = false;
        isComesendinp = false;
        isComeli = false;
        isChli = false;
        dl.addExtClass(EXinfo, 'info');
        console.log('setOptionHead delayset(EXinfo)');
        resetOptionHead = true;
        isInfo = true;

        //放送中一覧のスクロール
        //すぐだと失敗する？からinfo読んでからやる
        let cn = getInfo.getChannelByURL();
        if (cn && EXchli) {
            const chlogo = $(EXchli)
                .find('img[src*="/channels/logo/' + cn + '"]')
                .eq(0);
            if (chlogo.length !== 0)
                $(EXchli).scrollTop(
                    chlogo.parentsUntil(EXchli).eq(-2)[0].offsetTop -
                        window.innerHeight / 2
                );
        }
    }
    if (!isChli && (EXchli = getElm.getChannelListElement())) {
        dl.addExtClass(EXchli, 'channelList');
        console.log('setOptionHead delayset(EXchli)');
        resetOptionHead = true;
        isChli = true;

        EXcome = null;
        EXcomesend = null;
        EXcomesendinp = null;
        EXcomelist = null;
        EXinfo = null;
        const ci = document.getElementById('copyinfo');
        if (ci) ci.remove();
        isCome = false;
        isComesend = false;
        isComesendinp = false;
        isComeli = false;
        isInfo = false;
        //放送中一覧のスクロール
        //↑のinfoと同じもの
        let cn = getInfo.getChannelByURL();
        let currentChannelElem = $(EXchli)
            .find('img[src*="/channels/logo/' + cn + '"]')
            .eq(0)
            .parentsUntil(EXchli)
            .eq(-2)[0];
        if (cn && isInfo && currentChannelElem)
            $(EXchli).scrollTop(
                currentChannelElem.offsetTop - window.innerHeight / 2
            );
    }
    if (!isComeli && (EXcomelist = getComeListElement())) {
        dl.addExtClass(EXcomelist, 'comelist');
        window.dispatchEvent(comelistReadyEvent);
        console.log('setOptionHead delayset(EXchli)');
        resetOptionHead = true;
        isComeli = true;
    }
    if (!isTwT && getReceiveTwtElement()) {
        console.log('setOptionHead delayset(twt)');
        resetOptionHead = true;
        isTwT = true;
    }
    if (!isEXC && $(EXcomelist).length > 0) {
        //        dl.addExtClass(EXcomelist, 'comelist');
        setTimeout(applyCommentListNG, 1000);

        //コメ欄のDOM変更監視
        commentObserver.observe(EXcomelist, {
            childList: true /*, subtree: true, attributes: true*/
        });
        //        console.log("setOptionHead delayset(EXcomelist)");
        //        resetOptionHead=true;
        isEXC = true;
        //}
    }
    if (!isVideo && getElm.getVideo()) {
        console.log('setOptionHead delayset(video)');
        resetOptionHead = true;
        isVideo = true;
    }
    // 19/7/17仕様変更でコメントcome,comesend,comesendinpをdelaysetに退避
    if (!isCome && (EXcome = getComeFormElement(2))) {
        console.log('setOptionHead delayset(come)');
        dl.addExtClass(EXcome, 'come');
        resetOptionHead = true;
        reSetOptionEvent = true;
        isCome = true;

        EXinfo = null;
        const ci = document.getElementById('copyinfo');
        if (ci) ci.remove();
        EXchli = null;
        isInfo = false;
        isChli = false;
    }
    if (!isComesend && (EXcomesend = getComeFormElement(1))) {
        console.log('setOptionHead delayset(comesend)');
        dl.addExtClass(EXcomesend, 'comesend');
        resetOptionHead = true;
        reSetOptionEvent = true;
        isComesend = true;
        comeModuleEditor();
    }
    if (!isComesendinp && (EXcomesendinp = getComeFormElement(0))) {
        console.log('setOptionHead delayset(comesendinp)');
        dl.addExtClass(EXcomesendinp, 'comesendinp');
        resetOptionHead = true;
        reSetOptionEvent = true;
        isComesendinp = true;
    }

    try {
        //タイミングによってはsetEXsが完了する前にここでsetOptionHead()が実行されエラーになってdelaysetが完遂されないのでとりあえずtryで囲む
        if (resetOptionHead) setOptionHead();
        if (reSetOptionEvent) setOptionEvent();
    } catch (e) {
        console.warn(e);
    }

    if (
        isInit &&
        isOLS &&
        isEXC &&
        isInfo &&
        isTwT &&
        isVideo &&
        isChli &&
        isComeli &&
        isCome &&
        isComesend &&
        isComesendinp
    )
        console.log('%cdelayset ok', 'color:green;');
    else {
        var cstr =
            'delayset retry ' +
            (isInit ? '.' : 'I') +
            (isOLS ? '.' : 'O') +
            (isEXC ? '.' : 'C') +
            (isInfo ? '.' : 'F') +
            (isTwT ? '.' : 'T') +
            (isVideo ? '.' : 'V') +
            (isChli ? '.' : 'L') +
            (isComeli ? '.' : 'Cl') +
            (EXcomesendinp ? '..' : 'Ct') +
            (EXcomesend ? '..' : 'Cf') +
            (EXcome ? '..' : 'Cm');
        if (delaysetConsoleStr !== cstr) {
            console.log(cstr);
            delaysetConsoleStr = cstr;
            delaysetConsoleRepeated = false;
        } else {
            if (!delaysetConsoleRepeated) {
                console.log(
                    '%crepeating:%c ' + cstr,
                    'background-color: orange;',
                    ''
                );
                delaysetConsoleRepeated = true;
            }
        }
        setTimeout(
            delayset,
            1000,
            isInit,
            isOLS,
            isEXC,
            isInfo,
            isTwT,
            isVideo,
            isChli,
            isComeli,
            isCome,
            isComesend,
            isComesendinp
        );
        return;
    }
}
function volumecheck() {
    if (getInfo.determineUrl() != getInfo.URL_ONAIR) return;
    //console.log("volumecheck");
    var t = getVolbarObject();
    if (t == null) return;
    var v = t.height();
    if (v !== null && 0 <= v && v <= 92) {
        if (v == 92 && settings.changeMaxVolume < 100) {
            if (
                $(EXvolume)
                    .contents()
                    .find('svg')
                    .css('fill') == 'rgb(255, 255, 255)'
            ) {
                otoColor();
            }
            otosageru();
        }
    } else {
        setTimeout(volumecheck, 1000);
    }
}
function optionStatsUpdate(outflg) {
    if (getInfo.determineUrl() != getInfo.URL_ONAIR) return;
    //console.log("optionStatusUpdate("+(outflg?"true":"false"));
    var out = [0, 0];
    if ($('#settcont').length == 0 || $('#settcont').css('display') == 'none')
        return;
    var tar = $('#sourceheight');
    if (bginfo[0] > 0 && tar.length > 0) {
        tar.text('(ソース:' + bginfo[0] + 'p)').css('display', 'block');
    } else {
        tar.css('display', 'none');
    }
    tar = $('#windowsizes');
    //    var jp = $('object,video').parent();
    var jp = $(getElm.getVideo());
    //    if(EXwatchingnum!==undefined&&tar.length>0){
    if (jp.length !== 0 && tar.length > 0) {
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
        var odes = '';
        var ndes = '';
        //resized
        var romw = omw;
        var romh = omh;
        var ropw = opw;
        var ropb = opb;
        var ropt = opt;
        var er = jp[0].getBoundingClientRect();
        if (settings.isResizeScreen) {
            //映像リサイズ1
            odes = '(拡大中)';
            ndes = '(拡大後)';
            romw = jp.width();
            romh = jp.height();
            ropw = oww - romw;
            //            ropt= settings.isResizeSpacing?headerHeight:0;
            ropt = Math.round(jp.offset().top - (jp.height() - er.height) / 2);
            ropb = owh - romh - ropt;
        }
        var nmw = omw;
        var nmh = omh;
        //resized
        var rnmw = romw;
        var rnmh = romh;
        var sm = parseInt(
            $(
                '#movieheight input[type="radio"][name="movieheight"]:checked'
            ).val()
        );
        if (sm > 0) {
            nmh = sm;
            nmw = Math.ceil((nmh * 16) / 9);
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
        var sw = parseInt(
            $(
                '#windowheight input[type="radio"][name="windowheight"]:checked'
            ).val()
        );
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
            sss =
                '現在' +
                odes +
                ': 映像' +
                romw +
                'x' +
                romh +
                ' +余白(左右合計' +
                ropw +
                ', 上' +
                ropt +
                ', 下' +
                ropb +
                ') =窓' +
                oww +
                'x' +
                owh +
                '<br>変更' +
                ndes +
                ': 映像' +
                rnmw +
                'x' +
                rnmh +
                ' +余白(左右合計' +
                rnpw +
                ', 上' +
                rnpt +
                ', 下' +
                rnpb +
                ') =窓' +
                rnww +
                'x' +
                rnwh;
        } else {
            sss =
                '現在: 映像' +
                omw +
                'x' +
                omh +
                ' +余白(右' +
                opw +
                ', 上' +
                opt +
                ', 下' +
                opb +
                ') =窓' +
                oww +
                'x' +
                owh +
                '<br>変更: 映像' +
                nmw +
                'x' +
                nmh +
                ' +余白(右' +
                npw +
                ', 上' +
                npt +
                ', 下' +
                npb +
                ') =窓' +
                nww +
                'x' +
                nwh;
        }
        tar.html(sss).css('display', '');
        //        if(settings.isResizeScreen||isMovieMaximize){
        if (settings.isResizeScreen) {
            out = [rnww - oww, rnwh - owh];
        } else {
            out = [nww - oww, nwh - owh];
        }
    }
    clearBtnColored($('#saveBtn'));

    if (outflg) {
        return out;
    } else {
        setTimeout(optionStatsUpdate, 800, false);
    }
}
function createSettingWindow() {
    if (getInfo.determineUrl() != getInfo.URL_ONAIR) return;
    if (!EXsidebtn) {
        console.log('createSettingWindow retry');
        setTimeout(createSettingWindow, 1000);
        return;
    }
    var slidecont = EXsidebtn;
    //設定ウィンドウ・開くボタン設置
    if ($(EXsidebtn).children('#optionbutton').length == 0) {
        var optionbutton = document.createElement('div');
        optionbutton.id = 'optionbutton';
        optionbutton.classList.add('ext-sideButton');
        optionbutton.setAttribute('title', '拡張機能の一時設定');
        optionbutton.insertAdjacentHTML(
            'afterbegin',
            "<img src='" +
                chrome.extension.getURL('/images/gear.svg') +
                "' alt='拡張設定' class='ext-sideButton-icon'>"
        );
        slidecont.appendChild(optionbutton);
        $('#optionbutton').on('click', function() {
            if ($('#settcont').css('display') == 'none') {
                openOption();
            } else {
                closeOption();
            }
        });
    }
    if ($('#settcont').length == 0) {
        let settcont = '<div id="settcont" class="usermade" style="';
        settcont +=
            'width:670px;position:absolute;right:40px;top:' +
            headerHeight +
            'px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:16;flex-flow:column;'; //head11より上の残り時間12,13,14より上の番組情報等15より上
        //ピッタリの658pxから少し余裕を見る
        settcont += '">';
        //設定ウィンドウの中身
        settcont += '<div id="settcontheader">';
        settcont +=
            '<span style="font-weight:bold;">拡張機能一時設定画面</span> (一時設定できない項目は表示されません)<br>';
        settcont +=
            '<input type="button" class="closeBtn" value="閉じる" style="position:absolute;top:10px;right:10px;">';
        settcont +=
            '<a href="' +
            chrome.extension.getURL('/pages/option.html') +
            '" target="_blank">永久設定オプション画面はこちら</a><br>';
        settcont += '</div>';
        settcont += '<div id="settcontbody" style="overflow:scroll;">';
        settcont += settingHtml.generateOptionHTML(false) + '<br><hr>';
        settcont +=
            '<input type="button" id="clearLocalStorage" value="localStorageクリア"><br>';
        settcont +=
            '<span style="word-wrap: break-word; color: #444; font-size: smaller;">UserID:' +
            localStorage.getItem('abm_userId') +
            ' token:' +
            localStorage.getItem('abm_token') +
            '</span>';
        settcont += '</div>';
        settcont += '<div id="settcontfooter">';
        settcont += '<input type="button" id="saveBtn" value="一時保存"> ';
        settcont += '<input type="button" class="closeBtn" value="閉じる"> ';
        settcont +=
            '<input type="button" class="leftshift" value="←この設定画面を少し左へ">';
        settcont +=
            '<input type="button" class="rightshift" value="この設定画面を右へ→" style="display:none;">';
        settcont += '<br>';
        settcont +=
            '※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。';
        settcont += '</div>';
        settcont += '</div>';
        $(settcont).prependTo('body');
        $('#CommentColorSettings').change(setComeColorChanged);
        $('#itimePosition,#isTimeVisible').change(setTimePosiChanged);
        $('.closeBtn').on('click', closeOption);
        $('#clearLocalStorage').on('click', setClearStorageClicked);
        $('#saveBtn').on('click', setSaveClicked);
        $('#iprotitlePosition,#isProtitleVisible').change(
            setProtitlePosiChanged
        );
        $('#iproSamePosition').change(setProSamePosiChanged);
        $('#isProTextLarge').change(setProTextSizeChanged);
        $('#comeFontsize').change(mc.setComeFontsizeChanged);
        $('.leftshift').on('click', function() {
            $('#settcont').css('right', commentListWidth + 'px');
            $('.leftshift').css('display', 'none');
            $('.rightshift').css('display', '');
        });
        $('.rightshift').on('click', function() {
            $('#settcont').css('right', '40px');
            $('.rightshift').css('display', 'none');
            $('.leftshift').css('display', '');
        });
    }
    $('#CommentMukouSettings').hide();
    $('#CommentColorSettings')
        .css('width', '600px')
        .css('padding', '8px')
        .css('border', '1px solid black')
        .children('div')
        .css('clear', 'both')
        .children('span.desc')
        .css('padding', '0px 4px')
        .next('span.prop')
        .css('padding', '0px 4px')
        .next('input[type="range"]')
        .css('float', 'right');
    $('#itimePosition')
        .insertAfter('#isTimeVisible-switch+*')
        .css('border', '1px solid black')
        .css('margin-left', '16px')
        .css('display', 'flex')
        .css('flex-direction', 'column')
        .css('padding', '8px')
        .children()
        .css('display', 'flex')
        .css('flex-direction', 'row')
        .css('margin', '1px 0px')
        .children()
        .css('margin-left', '4px');
    $('#iprotitlePosition')
        .insertAfter('#isProtitleVisible-switch+*')
        .css('border', 'black solid 1px')
        .css('margin-left', '16px')
        .css('display', 'flex')
        .css('flex-direction', 'column')
        .children()
        .css('display', 'flex')
        .css('flex-direction', 'row')
        .css('margin', '1px 0px')
        .children()
        .css('margin-left', '4px');
    $('#iproSamePosition')
        .insertBefore('#isProtitleVisible-switch')
        .css('border', 'black solid 1px')
        .children()
        .css('display', 'flex')
        .css('flex-direction', 'row')
        .css('margin', '1px 0px')
        .children()
        .css('margin-left', '4px');
    if ($('#prosamedesc').length == 0) {
        $(
            '<span id="prosamedesc" style="margin-left:4px;">↑と↓が同じ位置の場合: </span>'
        ).prependTo('#iproSamePosition>*');
    }

    if ($('#windowresize').length == 0) {
        $(
            '<div id="windowresize">ウィンドウのサイズ変更<span id="windowsizes"></span></div>'
        ).insertAfter('#CommentColorSettings');
        $('#windowresize')
            .css('display', 'flex')
            .css('flex-direction', 'column')
            .css('margin-top', '8px')
            .css('padding', '8px')
            .css('border', '1px solid black')
            .children('#windowsizes')
            .css('display', 'none');
    }
    if ($('#movieheight').length == 0) {
        $(
            '<div id="movieheight">映像の縦長さ<br><p id="sourceheight"></p></div>'
        ).appendTo('#windowresize');
        $(
            '<div><input type="radio" name="movieheight" value=0>変更なし</div>'
        ).appendTo('#movieheight');
        $(
            '<div><input type="radio" name="movieheight" value=240>240px</div>'
        ).appendTo('#movieheight');
        $(
            '<div><input type="radio" name="movieheight" value=360>360px</div>'
        ).appendTo('#movieheight');
        $(
            '<div><input type="radio" name="movieheight" value=480>480px</div>'
        ).appendTo('#movieheight');
        $(
            '<div><input type="radio" name="movieheight" value=720>720px</div>'
        ).appendTo('#movieheight');
        $(
            '<div><input type="radio" name="movieheight" value=1080>1080px</div>'
        ).appendTo('#movieheight');
        $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
        $('#movieheight')
            .css('display', 'flex')
            .css('flex-direction', 'row')
            .css('flex-wrap', 'wrap')
            .css('padding', '0px 8px')
            .children('#sourceheight')
            .css('display', 'none')
            .siblings()
            .css('padding', '0px 3px')
            .change(setSaveDisable);
    }
    if ($('#windowheight').length == 0) {
        $('<div id="windowheight">ウィンドウの縦長さ</div>').appendTo(
            '#windowresize'
        );
        $(
            '<div><input type="radio" name="windowheight" value=0>変更なし</div>'
        ).appendTo('#windowheight');
        $(
            '<div><input type="radio" name="windowheight" value=1>映像の縦長さに合わせる</div>'
        ).appendTo('#windowheight');
        $(
            '<div><input type="radio" name="windowheight" value=2>黒枠の分だけ空ける</div>'
        ).appendTo('#windowheight');
        $(
            '<div><input type="radio" name="windowheight" value=3>現在の余白を維持</div>'
        ).appendTo('#windowheight');
        $('#windowheight input[type="radio"][name="windowheight"]').val([0]);
        $('#windowheight')
            .css('display', 'flex')
            .css('flex-direction', 'row')
            .css('flex-wrap', 'wrap')
            .css('padding', '0px 8px')
            .children()
            .css('padding', '0px 3px')
            .change(setSaveDisable);
    }
    if ($('#PsaveCome').length == 0) {
        $(
            '<input type="button" id="PsaveCome" class="Psave" value="このコメント外見設定を永久保存(上書き)">'
        ).appendTo('#CommentColorSettings');
        $('#PsaveCome')
            .css('margin', '8px 0 0 24px')
            .on('click', setPSaveCome);
    }
    if ($('#PsaveNG').length == 0) {
        $(
            '<input type="button" id="PsaveNG" class="Psave" value="←これらを永久保存(上書き)">'
        ).insertAfter('#fullNg');
        $('#PsaveNG')
            .css('margin', '8px 0 0 8px')
            .on('click', setPSaveNG);
        $('<div style="clear:both;">').insertAfter('#PsaveNG');
        $('#fullNg').css('float', 'left');
    }
    $('.Psave')
        .css('margin-left', '8px')
        .css('padding', '0px 3px');
    if ($('#ComeMukouO').length == 0) {
        $('#CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $(
            '<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>'
        ).prependTo('#CommentMukouSettings');
        $('#ComeMukouO')
            .css('margin-top', '8px')
            .css('padding', '8px')
            .css('border', '1px solid black');
        $('<table id="setTable">').appendTo('#ComeMukouO');
        var stjo = $('#setTable');
        stjo.css('border-collapse', 'collapse');
        $(
            '<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th colspan=2>音量ミュート</th></tr>'
        ).appendTo(stjo);
        $(
            '<tr><td>適用</td><td></td><td></td><td></td><td></td><td></td></tr>'
        ).appendTo(stjo);
        $(
            '<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td colspan=2></td></tr>'
        ).appendTo(stjo);

        const sttr = stjo.contents('tr');
        var stra = sttr.eq(1).children('td');
        var strb = sttr.eq(2).children('td');
        $('#isCMBlack').appendTo(stra.eq(1));
        $('#isCMBkTrans')
            .appendTo(stra.eq(1))
            .css('display', 'none');
        $('<input type="radio" name="cmbktype" value=0>')
            .appendTo(stra.eq(2))
            .after('全面真黒<br>');
        $('<input type="radio" name="cmbktype" value=1>')
            .appendTo(stra.eq(2))
            .after('下半透明');
        stra.eq(2)
            .children('input[type="radio"][name="cmbktype"]')
            .prop('disabled', !settings.isCMBlack)
            .val([settings.isCMBkTrans ? 1 : 0])
            .change(setCMBKChangedR);

        $('#CMsmall')
            .appendTo(stra.eq(3))
            .after('％')
            .css('text-align', 'right')
            .css('width', '4em');

        $('#isCMsoundoff').appendTo(stra.eq(4));
        $('#isTabSoundplay')
            .appendTo(stra.eq(4))
            .css('display', 'none');
        $('<input type="radio" name="cmsotype" value=0>')
            .appendTo(stra.eq(5))
            .after('プレイヤー<br>');
        $('<input type="radio" name="cmsotype" value=1>')
            .appendTo(stra.eq(5))
            .after('タブ設定');
        stra.eq(5)
            .children('input[type="radio"][name="cmsotype"]')
            .prop('disabled', !settings.isCMsoundoff)
            .val([settings.isTabSoundplay ? 1 : 0])
            .change(setCMsoundChangedR);

        $('#isCMBlack').change(setCMBKChangedB);
        $('#CMsmall').change(setCMzoomChangedR);
        $('#isCMsoundoff').change(setCMsoundChangedB);
        $('#isCMBkR').appendTo(strb.eq(1));
        $('#isCMsmlR').appendTo(strb.eq(2));
        $('#isCMsoundR').appendTo(strb.eq(3));
        stra.add(strb)
            .css('border', '1px solid black')
            .css('text-align', 'center')
            .css('padding', '3px');
        stra.eq(1)
            .add(stra.eq(4))
            .css('border-right', 'none');
        stra.eq(2)
            .add(stra.eq(5))
            .css('border-left', 'none')
            .css('text-align', 'left');

        $(
            '<div id="ComeMukouW" class="setTables">↑の実行待機(秒)</div>'
        ).insertAfter('#ComeMukouO');
        $('#ComeMukouW')
            .css('margin-top', '8px')
            .css('padding', '8px')
            .css('border', '1px solid black');
        $('#beforeCMWait')
            .appendTo('#ComeMukouW')
            .before('　開始後');
        $('#afterCMWait')
            .appendTo('#ComeMukouW')
            .before('　終了後')
            .after(
                '<br>待機時間中、押している間は実行せず、離すと即実行するキー<br>'
            );
        $('#isManualKeyCtrlL')
            .appendTo('#ComeMukouW')
            .after('左ctrl');
        $('#isManualKeyCtrlR')
            .appendTo('#ComeMukouW')
            .after('右ctrl');
        $('#isManualMouseBR')
            .appendTo('#ComeMukouW')
            .before(
                '<br>待機時間中、カーソルを1秒以上連続で合わせている間は実行せず、外すと即実行する場所<br>'
            )
            .after('右下のコメント数表示部');
        $('<div id="ComeMukouN" class="setTables"></div>').insertAfter(
            '#ComeMukouW'
        );
        $('#ComeMukouN')
            .css('margin-top', '8px')
            .css('padding', '8px')
            .css('border', '1px solid black');
        $('#useEyecatch')
            .appendTo('#ComeMukouN')
            .after(
                '左上ロゴのタイミングを利用(キー/カーソルでの実行待機中は効きません)<br>'
            );
        $('#isHidePopTL')
            .appendTo('#ComeMukouN')
            .after('左上ロゴを非表示<br>');
        $('#isHidePopBL')
            .appendTo('#ComeMukouN')
            .after('左下の通知を非表示');
        $('#isHidePopFresh')
            .appendTo('#ComeMukouN')
            .after('左下のFreshの通知を非表示');
        $('#ComeMukouD').remove();
    }
    if ($('#epnumedit').length == 0) {
        var s =
            '<div id="epnumedit" style="border:1px solid black;padding:8px;margin-left:16px;display:flex;flex-direction:row;">';
        s +=
            '<div>背景区切り数<input type="number" name="epcount" min=1 max=31></div>';
        //        s+='<div style="margin-left:16px;">1番目の数字<input type="number" name="epfirst" min=1 max=69 disabled>(区切り数7以上で表示)</div>';
        s +=
            '<div style="margin-left:16px;">1番目の数字<input type="number" name="epfirst" min=0 max=69></div>(0で非表示)';
        //        s+='<div style="margin-left:16px;">末尾調整(分)<input type="number" name="epfix" min=0 max=60 disabled></div>';
        s +=
            '<div style="margin-left:16px;">末尾調整(分)<input type="number" name="epfix" min=0 max=60></div>';
        s += '</div>';
        $(s).insertAfter('#isTimeVisible-switch+*');
        var epnume = $('#epnumedit')
            .contents()
            .find('input[type="number"]');
        epnume
            .filter('[name="epcount"]')
            .val(2)
            .change(epcountchange);
        epnume
            .filter('[name="epfirst"]')
            .val(0)
            .change(epfirstchange);
        epnume
            .filter('[name="epfix"]')
            .val(0)
            .change(epfixchange);
    }
    if ($('#panelCustom').length == 0) {
        $('<div id="panelCustom"">黒帯パネル開閉設定<br></div>').insertBefore(
            '#CommentMukouSettings'
        );
        $('#panelCustom')
            .css('margin-top', '8px')
            .css('padding', '8px')
            .css('border', '1px solid black');
        $('#ipanelopenset')
            .appendTo('#panelCustom')
            .children()
            .css('display', 'flex')
            .css('flex-direction', 'row');
        $('<table id="panelcustomTable">').appendTo('#panelCustom');
        $('#panelcustomTable').css('border-collapse', 'collapse');
        $(
            '<tr><th></th><th>上のメニュー</th><th>下のバー</th><th>右のボタン</th></tr>'
        ).appendTo('#panelcustomTable');
        $('<tr><td>基本</td><td></td><td></td><td></td></tr>').appendTo(
            '#panelcustomTable'
        );
        $(
            '<tr><td>番組情報<br>表示時</td><td></td><td></td><td></td></tr>'
        ).appendTo('#panelcustomTable');
        $(
            '<tr><td>放送中一覧<br>表示時</td><td></td><td></td><td></td></tr>'
        ).appendTo('#panelcustomTable');
        $(
            '<tr><td>コメント<br>表示時</td><td></td><td></td><td></td></tr>'
        ).appendTo('#panelcustomTable');
        var rd = ['非表示<br>', 'マウス反応<br>', '常に表示'];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 3; j++) {
                for (var k = 0; k < 3; k++) {
                    $(
                        '<input type="radio" name="d' +
                            i +
                            '' +
                            j +
                            '" value="' +
                            k +
                            '" id="radio-d' +
                            i +
                            j +
                            '-' +
                            k +
                            '">'
                    )
                        .appendTo(
                            '#panelcustomTable tr:eq(' +
                                (i + 1) +
                                ')>td:eq(' +
                                (j + 1) +
                                ')'
                        )
                        .after(
                            '<label for="radio-d' +
                                i +
                                j +
                                '-' +
                                k +
                                '">' +
                                rd[k] +
                                '</label>'
                        );
                }
            }
        }
        $('#panelcustomTable td')
            .css('border', '1px solid black')
            .css('text-align', 'left')
            .css('padding', '3px');
        $('#panelcustomTable td:first-child').css('text-align', 'center');
        // $('#alwaysShowPanelB').on("click", panelTableUpdateA);
        // $('#openPanelwComeB').on("click", panelTableUpdateO);
        $('#ipanelopenset').change(panelTableUpdateS);
        $('#panelcustomTable').change(panelTableUpdateT);
    }
    if ($('#movieResizeContainer').length == 0) {
        let jo = $('#isResizeScreen-wrapper');
        let ja = jo.parent().contents();
        //        var jm=$('#isMovieMaximize');
        let jm = $('#isDAR43-wrapper');
        ja.slice(ja.index(jo), ja.index(jm) + 1).wrapAll(
            '<div id="movieResizeContainer" style="margin:8px;padding:8px;border:1px solid black;">'
        );
        let tres = '';
        tres +=
            '<br><input type="radio" name="movieResizeType" value=0 style="margin-left:16px;" id="radio-movieResizeType-0">:<label for="radio-movieResizeType-0"><span id="movieResizeDesc">' +
            (settings.isDAR43
                ? '左枠サイズに合わせる(左詰め推奨)'
                : 'デフォルト') +
            '</span></label>';
        tres +=
            '<br><input type="radio" name="movieResizeType" value=1 style="margin-left:16px;" id="radio-movieResizeType-1">:<label for="radio-movieResizeType-1">ウィンドウ全体に最大化</label>';
        $('#isResizeScreen-wrapper')
            .css('display', 'none')
            //            .before('<input type="radio" name="movieResizeType" value=0 style="margin-left:16px;">:上に詰める (空き無し)')
            .before(tres);
        let jc = $('#movieResizeContainer').contents();
        //既存のラベル除去
        $('#isResizeScreen-switch+label').remove();
        $('#isDAR43-switch+label').remove();
        // jc.eq(jc.index($('#isResizeScreen-wrapper')) + 1)
        //     .add(jc.eq(jc.index($('#isDAR43-wrapper')) + 1))
        //     .remove();
        $('#isDAR43-wrapper')
            .css({ display: 'inline-block', border: 'none' })
            .prependTo('#movieResizeContainer')
            .before('映像の大きさ　')
            .after(" <label for='isDAR43'>: 映像4:3モード</label>");
        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]')
            .add('#isDAR43')
            .change(movieResizeTypeChanged);
    }
    if ($('#moviePositionContainer').length == 0) {
        let jo = $('#isMovieSpacingZeroTop-wrapper');
        let ja = jo.parent().contents();
        let jm = $('#isMovieSpacingZeroLeft-wrapper');
        ja.slice(ja.index(jo), ja.index(jm) + 1).wrapAll(
            '<div id="moviePositionContainer" style="margin:8px;padding:8px;border:1px solid black;">'
        );
        let tres = '映像の上下位置';
        tres +=
            '<br><input type="radio" name="moviePositionVType" value=0 style="margin-left:16px;" id="radio-moviePositionVType-0"><label for="radio-moviePositionVType-0">:デフォルト (中央)</label>';
        tres +=
            '<br><input type="radio" name="moviePositionVType" value=1 style="margin-left:16px;" id="radio-moviePositionVType-1"><label for="radio-moviePositionVType-1">:上に詰める (空き無し) ※額縁は詰まりません</label>';
        $('#isMovieSpacingZeroTop-wrapper')
            .css('display', 'none')
            .before(tres);
        $('#isResizeSpacing-wrapper')
            .css('display', 'none')
            .before(
                '<br><input type="radio" name="moviePositionVType" value=2 style="margin-left:16px;" id="radio-moviePositionVType-2"><label for="radio-moviePositionVType-2">:上に詰めるが、上の黒帯の分だけ空ける ※額縁は詰まりません</label>'
            );
        tres = '<br>映像の左右位置';
        tres +=
            '<br><input type="radio" name="moviePositionHType" value=0 style="margin-left:16px;" id="radio-moviePositionHType-0"><label for="radio-moviePositionHType-0">:デフォルト <span id="moviePosiHDesc"></span></label>';
        tres +=
            '<br><input type="radio" name="moviePositionHType" value=1 style="margin-left:16px;" id="radio-moviePositionHType-1"><label for="radio-moviePositionHType-1">:左に詰める (空き無し)</label>';
        $('#isMovieSpacingZeroLeft-wrapper')
            .css('display', 'none')
            .before(tres);
        $('#moviePosiHDesc').text(
            settings.isResizeScreen
                ? '(ウィンドウ全体の中央)'
                : '(ウィンドウ左側内の中央)'
        );
        // var jc = $('#moviePositionContainer').contents();
        // 既存のラベル除去
        $('#isMovieSpacingZeroTop-switch+label').remove();
        $('#isResizeSpacing-switch+label').remove();
        $('#isMovieSpacingZeroLeft-switch+label').remove();
        // jc.eq(jc.index($('#isMovieSpacingZeroTop-wrapper')) + 1)
        //     .add(jc.eq(jc.index($('#isResizeSpacing-wrapper')) + 1))
        //     .add(jc.eq(jc.index($('#isMovieSpacingZeroLeft-wrapper')) + 1))
        //     .remove();
        $(
            '#moviePositionContainer input[type="radio"][name="moviePositionVType"]'
        ).change(moviePositionVTypeChanged);
        $(
            '#moviePositionContainer input[type="radio"][name="moviePositionHType"]'
        ).change(moviePositionHTypeChanged);
        $('#movieResizeContainer,#moviePositionContainer')
            .next('label')
            .remove();
        $('#movieResizeContainer,#moviePositionContainer')
            .next('br')
            .remove();
    }
    /*if ($('#highlightdesc').length == 0) {
        $('#ihighlightNewCome')
            .insertBefore('#isCommentWide-switch')
            .css('border', 'black solid 1px')
            .children()
            .css('display', 'flex')
            .css('flex-direction', 'row')
            .css('margin', '1px 0px')
            .css('padding-left', '8px')
            .children()
            .css('margin-left', '4px')
            .first()
            .before(
                '<span id="highlightdesc">新着コメントを少し強調する</span>'
            );
    }*/
    /*if ($('#highlightCdesc').length == 0) {
        $('#ihighlightComeColor')
            .insertBefore('#isCommentWide-switch')
            .css('border', 'black solid 1px')
            .children()
            .css('display', 'flex')
            .css('flex-direction', 'row')
            .css('margin', '1px 0px')
            .css('padding-left', '8px')
            .children()
            .css('margin-left', '4px')
            .first()
            .before('<span id="highlightCdesc">↑の色</span>');
        let c = $('#highlightComePower')
            .parent()
            .contents();
        let jo = $('#highlightComePower');
        let i = c.index(jo);
        c.slice(i - 2, i).remove();
        $('#highlightComePower')
            .appendTo(
                $('#ihighlightComeColor')
                    .children()
                    .first()
            )
            .prop('type', 'range')
            .prop('max', '100')
            .prop('min', '0');
        $(
            '<span id="highlightPdesc" style="margin-right:4px;margin-left:12px;">背景濃さ:' +
                settings.highlightComePower +
                '</span>'
        ).insertBefore('#highlightComePower');
    }*/
    $('#changeMaxVolume')
        .prop('max', '100')
        .prop('min', '0');
    $('#sureReadRefreshx').prop('min', '101');
    $('#movingCommentSecond').prop('min', '1');
    $('#movingCommentLimit').prop('min', '0');
    $('#comeFontsize')
        .prop('max', '99')
        .prop('min', '1');
    $('#notifySeconds').prop('min', '0');
    $('#CMsmall')
        .prop('max', '100')
        .prop('min', '5');
    $('#beforeCMWait').prop('min', '0');
    $('#afterCMWait').prop('min', '0');
    console.log('createSettingWindow ok');
}

function moviePositionVTypeChanged() {
    switch (
        +$(
            '#moviePositionContainer input[type="radio"][name="moviePositionVType"]:checked'
        ).val()
    ) {
        case 0:
            $('#isMovieSpacingZeroTop').prop('checked', false);
            $('#isResizeSpacing').prop('checked', false);
            break;
        case 1:
            $('#isMovieSpacingZeroTop').prop('checked', true);
            $('#isResizeSpacing').prop('checked', false);
            break;
        case 2:
            $('#isMovieSpacingZeroTop').prop('checked', false);
            $('#isResizeSpacing').prop('checked', true);
            break;
        default:
    }
    onresize();
}
function moviePositionHTypeChanged() {
    switch (
        +$(
            '#moviePositionContainer input[type="radio"][name="moviePositionHType"]:checked'
        ).val()
    ) {
        case 0:
            $('#isMovieSpacingZeroLeft').prop('checked', false);
            break;
        case 1:
            $('#isMovieSpacingZeroLeft').prop('checked', true);
            break;
        default:
    }
    onresize();
}
function movieResizeTypeChanged() {
    switch (
        +$(
            '#movieResizeContainer input[type="radio"][name="movieResizeType"]:checked'
        ).val()
    ) {
        case 0:
            $('#isResizeScreen').prop('checked', false);
            //            $('#isResizeSpacing').prop("checked",false);
            //            $('#isMovieMaximize').prop("checked",false);
            $('#moviePosiHDesc').text('(ウィンドウ左側内の中央)');
            break;
        case 1:
            $('#isResizeScreen').prop('checked', true);
            //            $('#isResizeSpacing').prop("checked",true);
            //            $('#isMovieMaximize').prop("checked",false);
            $('#moviePosiHDesc').text('(ウィンドウ全体の中央)');
            break;
        //        case 2:
        //            $('#isResizeScreen').prop("checked",false);
        //            $('#isResizeSpacing').prop("checked",false);
        //            $('#isMovieMaximize').prop("checked",true);
        //            break;
        default:
    }
    $('#movieResizeDesc').text(
        $('#isDAR43').prop('checked')
            ? '左枠サイズに合わせる(左詰め推奨)'
            : 'デフォルト'
    );
    onresize();
}

function epcountchange() {
    var c = parseInt(
        $('#epnumedit input[type="number"][name="epcount"]').val()
    );
    var f = parseInt(
        $('#epnumedit input[type="number"][name="epfirst"]').val()
    );
    var proLength = 0;
    var oneLength = 0;
    //    if(c>6){
    if (f > 0) {
        $('#epnumedit input[type="number"][name="epfirst"]').prop(
            'disabled',
            false
        );
        $('#epnumedit input[type="number"][name="epfix"]').prop(
            'disabled',
            false
        );
        proLength = proEnd.getTime() - proStart.getTime(); //番組の全体長さms
        var x =
            60000 *
            parseInt($('#epnumedit input[type="number"][name="epfix"]').val());
        const proTimeColorNum =
            settings.timePosition.includes('commentinput') &&
            settings.commentBackColor > 127
                ? 0
                : 255;
        const proTimeBkColor = `rgba(${proTimeColorNum},${proTimeColorNum},${proTimeColorNum},0.2)`;

        if (x > 0) {
            var y = Math.floor((310 * proLength) / (proLength + x));
            $('#proTimeEpNum')
                .css('right', 310 - y + 'px')
                .css('width', y + 'px')
                .css('border-right', '1px solid ' + proTimeBkColor);
            proLength -= x;
        } else {
            $('#proTimeEpNum')
                .css('right', 0)
                .css('width', '310px')
                .css('border-right', '');
        }
        if (proLength > 0) {
            oneLength = Math.floor(proLength / c); //1話あたりの長さms
        }
        $('#forProEndTxt').css('background-color', 'rgba(0,0,0,0.4)');
    } else {
        //        $('#epnumedit input[type="number"][name="epfirst"]').prop("disabled",true);
        //        $('#epnumedit input[type="number"][name="epfix"]').prop("disabled",true);
        $('#forProEndTxt').css('background-color', 'transparent');
    }
    var eo = '<div>';
    var ea = '';
    for (var i = 0; i < c; i++) {
        ea += eo;
        //        if(c>6){
        if (f > 0) {
            var sprost = new Date(proStart);
            var eprost = new Date(proStart);
            sprost.setSeconds(Math.floor((i * oneLength) / 1000));
            var sh = ('0' + sprost.getHours()).slice(-2);
            var sm = ('0' + sprost.getMinutes()).slice(-2);
            eprost.setSeconds(Math.floor(((i + 1) * oneLength) / 1000));
            var eh = ('0' + eprost.getHours()).slice(-2);
            var em = ('0' + eprost.getMinutes()).slice(-2);
            ea +=
                '<a title="#' +
                (i + f) +
                ' ' +
                sh +
                ':' +
                sm +
                '-' +
                eh +
                ':' +
                em +
                '">' +
                (i + f) +
                '</a>';
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
    console.info('cleared localStorage');
}

function setSaveDisable() {
    $('#saveBtn')
        .prop('disabled', true)
        .css('color', 'gray');
}
function setPSaveNG() {
    settings.fullNg = $('#fullNg').val();
    gcl.arrayFullNgMaker(arFullNg, settings.fullNg, settings.isShareNGword);
    applyCommentListNG();
    gl.setStorage(
        {
            fullNg: settings.fullNg
        },
        function() {
            $('#PsaveNG')
                .prop('disabled', true)
                .css('background-color', 'lightyellow')
                .css('color', 'gray');
            setTimeout(clearBtnColored, 1200, $('#PsaveNG'));
        }
    );
}
function setPSaveCome() {
    settings.commentBackColor = parseInt($('#commentBackColor').val());
    settings.commentBackTrans = parseInt($('#commentBackTrans').val());
    settings.commentTextColor = parseInt($('#commentTextColor').val());
    settings.commentTextTrans = parseInt($('#commentTextTrans').val());
    setOptionHead();
    gl.setStorage(
        {
            'settings.commentBackColor': settings.commentBackColor,
            'settings.commentBackTrans': settings.commentBackTrans,
            'settings.commentTextColor': settings.commentTextColor,
            'settings.commentTextTrans': settings.commentTextTrans
        },
        function() {
            $('#PsaveCome')
                .prop('disabled', true)
                .css('background-color', 'lightyellow')
                .css('color', 'gray');
            setTimeout(clearBtnColored, 1200, $('#PsaveCome'));
        }
    );
}
function clearBtnColored(target) {
    target
        .prop('disabled', false)
        .css('background-color', '')
        .css('color', '');
}
// 現在無効
// デバッグ目的で強制的にinjectXHRしたい場合は引数でtrueを渡す
export function injectXHR(isForce) {
    if (
        $('#ext-xhr-injection').length === 0 &&
        (settings.maxResolution != 2160 || settings.minResolution != 0) &&
        isForce
    ) {
        var xhrinjectionpath = chrome.extension.getURL(
            '/scripts/injection-xhr.js'
        );
        $(
            "<script src='" +
                xhrinjectionpath +
                "' id='ext-xhr-injection'></script>"
        ).appendTo('head');
    }
}
function setSaveClicked() {
    Object.assign(settings, settingHtml.getSettingInputValue(false));
    cmblockia = Math.max(1, 1 + parseInt($('#beforeCMWait').val()));
    cmblockib = -Math.max(1, 1 + parseInt($('#afterCMWait').val()));
    settings.isCMBkR =
        $('#isCMBkR').prop('checked') && $('#isCMBlack').prop('checked');
    settings.isCMsoundR =
        $('#isCMsoundR').prop('checked') && $('#isCMsoundoff').prop('checked');
    settings.isCMsmlR =
        $('#isCMsmlR').prop('checked') && $('#CMsmall').val() != 100;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenset[i][j] = $(
                '#panelcustomTable [type="radio"][name="d' +
                    i +
                    '' +
                    j +
                    '"]:checked'
            ).val();
        }
    }
    gcl.arrayFullNgMaker(arFullNg, settings.fullNg, settings.isShareNGword);
    gcl.arrayUserNgMaker(arUserNg, settings.userNg, settings.isShareNGuser);

    onresize();
    setOptionHead();
    setOptionElement();
    pophideSelector(-1, 0);
    if (settings.isShareNGword || settings.isShareNGuser) {
        gcl.applySharedNG(sharedNGappender);
    }
    optionHeightFix();
    var sm = parseInt(
        $('#movieheight input[type="radio"][name="movieheight"]:checked').val()
    );
    var sw = parseInt(
        $(
            '#windowheight input[type="radio"][name="windowheight"]:checked'
        ).val()
    );
    //console.log("sm="+sm+",sw="+sw);
    if (sm != 0 || sw != 0) {
        var s = optionStatsUpdate(true);
        if (s[0] != 0 || s[1] != 0) {
            chrome.runtime.sendMessage(
                { type: 'windowresize', valw: s[0], valh: s[1] },
                function(r) {
                    setTimeout(optionHeightFix, 1000);
                    setTimeout(
                        mc.moveComeTopFilter,
                        1000,
                        headerHeight,
                        footerHeight
                    );
                }
            );
        }
    }
    //解像度設定反映
    localStorage.setItem('ext_minResolution', settings.minResolution);
    localStorage.setItem('ext_maxResolution', settings.maxResolution);
    injectXHR();
    window.dispatchEvent(resolutionSetEvent);
    $('#saveBtn')
        .prop('disabled', true)
        .css('background-color', 'lightyellow')
        .css('color', 'gray');
    setTimeout(clearBtnColored, 1200, $('#saveBtn'));
}
function setProTextSizeChanged() {
    setProSamePosiChanged(false, $('#isProTextLarge').prop('checked'));
}
function setProSamePosiChanged(pophide, bigtext) {
    //console.log("setProSamePosiChanged pophide="+(pophide?"true":"false")+",bigtext="+(bigtext?"true":"false"));
    //ref:
    //setTimePosiChanged
    //setProtitlePosiChanged
    //setoptionelement
    //hideElement,popElement pophide=true 開閉遅延を考慮する
    var titleprop = '';
    var timeprop = '';
    var sameprop = '';
    if ($('#settcont').css('display') == 'flex') {
        if ($('#isProtitleVisible').prop('checked')) {
            titleprop = $(
                '#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked'
            ).val();
        }
        if ($('#isTimeVisible').prop('checked')) {
            timeprop = $(
                '#itimePosition input[type="radio"][name="timePosition"]:checked'
            ).val();
        }
        sameprop = $(
            '#iproSamePosition input[type="radio"][name="proSamePosition"]:checked'
        ).val();
        if (bigtext === undefined) {
            bigtext = $('#isProTextLarge').prop('checked');
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
    if (titleprop != '') {
        createProtitle(0, bigtext);
    } else {
        createProtitle(1);
    }
    if (timeprop != '') {
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
    if ($('#isProtitleVisible').prop('checked')) {
        $('#iprotitlePosition').css('display', 'flex');
    } else {
        $('#iprotitlePosition').css('display', 'none');
    }
    //sameposi表示切替
    if (
        $('#isProtitleVisible').prop('checked') &&
        $('#isTimeVisible').prop('checked')
    ) {
        $('#iproSamePosition').css('display', 'block');
    } else {
        $('#iproSamePosition').css('display', 'none');
    }
    setProSamePosiChanged();
}
function setTimePosiChanged() {
    //選択肢の表示切替だけして本体はsetProSamePosiChangedで行う
    if ($('#isTimeVisible').prop('checked')) {
        $('#itimePosition').css('display', 'flex');
        $('#epnumedit').css('display', 'flex');
    } else {
        $('#itimePosition').css('display', 'none');
        $('#epnumedit').css('display', 'none');
    }
    //sameposi表示切替
    if (
        $('#isProtitleVisible').prop('checked') &&
        $('#isTimeVisible').prop('checked')
    ) {
        $('#iproSamePosition').css('display', 'block');
    } else {
        $('#iproSamePosition').css('display', 'none');
    }
    setProSamePosiChanged();
}
function setCMzoomChangedR() {
    var jo = $('#isCMsmlR');
    if (parseInt($('#CMsmall').val()) == 100) {
        jo.prop('checked', false).prop('disabled', true);
    } else {
        jo.prop('disabled', false);
    }
}
function setCMsoundChangedB() {
    var b = $('#isCMsoundoff').prop('checked');
    $('#CommentMukouSettings input[type="radio"][name="cmsotype"]').prop(
        'disabled',
        !b
    );
    $('#isCMsoundR')
        .prop('checked', false)
        .prop('disabled', !b);
}
function setCMBKChangedB() {
    var b = $('#isCMBlack').prop('checked');
    $('#CommentMukouSettings input[type="radio"][name="cmbktype"]').prop(
        'disabled',
        !b
    );
    $('#isCMBkR')
        .prop('checked', false)
        .prop('disabled', !b);
}
function setCMBKChangedR() {
    $('#isCMBkTrans').prop(
        'checked',
        $(
            '#CommentMukouSettings input[type="radio"][name="cmbktype"]:checked'
        ).val() == 1
            ? true
            : false
    );
}
function setCMsoundChangedR() {
    $('#isTabSoundplay').prop(
        'checked',
        $(
            '#CommentMukouSettings input[type="radio"][name="cmsotype"]:checked'
        ).val() == 1
            ? true
            : false
    );
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
    var jv = parseInt(
        $('#ipanelopenset [type="radio"][name="panelopenset"]:checked').val()
    );
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
            if (
                parseInt(
                    $(
                        '#panelcustomTable [type="radio"][name="d' +
                            i +
                            '' +
                            j +
                            '"]:checked'
                    ).val()
                ) != 0
            ) {
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
    $('#popacti').css('display', 'none');
}
function putPopacti() {
    popacti = true;
    if ($('#popacti').length == 0) {
        $(
            '<span id="popacti" style="display:block;color:black;background-color:yellow;font-weight:bold;padding:2px 4px;">※全て非表示の場合、右矢印を51連打すると、右ボタンが常時表示に切替わります<br>（押しっ放しでも可）</span>'
        ).insertAfter('#panelcustomTable');
    } else {
        $('#popacti').css('display', 'block');
    }
}
function setComeColorChanged() {
    //console.log("setComeColorChanged");
    var p = [];
    var jo = $('#CommentColorSettings input[type="range"]');
    for (var i = 0; i < jo.length; i++) {
        var jq = jo.eq(i);
        var jv = jq.val();
        p[i] = jv;
    }
    var bc = 'rgba(' + p[0] + ',' + p[0] + ',' + p[0] + ',' + p[1] / 255 + ')';
    var tc = 'rgba(' + p[2] + ',' + p[2] + ',' + p[2] + ',' + p[3] / 255 + ')';
    var js = $(EXcomelist)
        .children()
        .slice(0, 10);
    js.css('background-color', bc).css('color', tc);
    if (comelistClasses.message)
        js.children('.' + comelistClasses.message).css('color', tc);
    if (settings.isCommentTBorder) {
        var vc = 'rgba(' + p[2] + ',' + p[2] + ',' + p[2] + ',' + 0.3 + ')';
        js.css('border-top', '1px solid ' + vc);
    }
}
function toggleCommentList() {
    console.log('comevisiset toggleCommentList');
    //    var jo=$(EXcomelist).parent();
    var jo = $(EXcomelist).parent();
    //display:noneだと崩れるので変更
    //重なっていて下にあるfooterの音量ボタン等を使用できるようにpointer-eventsを利用
    var jv = jo.css('visibility');
    if (jv != 'hidden') {
        jo.css('visibility', 'hidden').css('opacity', 0);
        $(EXcome).css('pointer-events', 'none');
        $(EXcomesend).css('pointer-events', 'auto');
    } else {
        jo.css('visibility', '').css('opacity', '');
        $(EXcome).css('pointer-events', '');
        $(EXcomesend).css('pointer-events', '');
    }
}
function pophideElement(inp) {
    //console.log(inp);
    //inpを1(pop),-1(hide),0(除去)で受け取る
    //除去前の中身はチェックせずに除去する
    if (EXfoot === undefined || EXfoot === null) return; //未setEXs：now-on-air未表示：pophideする必要が無い
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
            EXhead.style.visibility = 'visible';
            EXhead.style.opacity = '1';
            EXhead.style.transform = 'translate(0)';
        } else if (inp.head == -1) {
            EXhead.style.visibility = 'hidden';
            EXhead.style.opacity = '0';
            EXhead.style.transform = 'translateY(-100%)';
        } else if (inp.head == 0) {
            EXhead.style.visibility = '';
            EXhead.style.opacity = '';
            EXhead.style.transform = '';
        }
    }
    if (inp.foot !== undefined) {
        comefix = true;
        if (inp.foot == 1) {
            EXfoot.style.visibility = 'visible';
            EXfoot.style.opacity = '1';
            EXfoot.style.transform = 'translate(0)';
        } else if (inp.foot == -1) {
            EXfoot.style.visibility = 'hidden';
            EXfoot.style.opacity = '0';
            EXfoot.style.transform = 'translateY(100%)';
        } else if (inp.foot == 0) {
            EXfoot.style.visibility = '';
            EXfoot.style.opacity = '';
            EXfoot.style.transform = '';
        }
    }
    if (inp.side == 1) {
        EXsidebtn.style.transform = 'translateY(-50%)';
        EXsidebtn.style.visibility = 'visible';
        if (
            settings.isSureReadComment &&
            settings.isCommentFormWithSide &&
            $(EXcomesend).is(':hidden')
        ) {
            $(EXcomesend).show();
            if (isComeInpFocus) EXcomesendinp.focus();
        }
    } else if (inp.side == -1) {
        EXsidebtn.style.transform = 'translate(100%, -50%)';
        EXsidebtn.style.visibility = 'hidden';
        if (settings.isSureReadComment && settings.isCommentFormWithSide) {
            $(EXcomesend).hide();
            isComeInpFocus =
                EXcomesendinp == document.activeElement ? true : false;
        }
    } else if (inp.side == 0) {
        EXsidebtn.style.transform = '';
        EXsidebtn.style.visibility = '';
    }
    if (inp.programinfo == 1) {
        EXinfo.style.transform = 'translateX(0px)';
    } else if (inp.programinfo == -1) {
        EXinfo.style.transform = 'translateX(100%)';
    } else if (inp.programinfo == 0) {
        EXinfo.style.transform = '';
    }
    if (EXchli) {
        if (inp.channellist == 1) {
            EXchli.style.transform = 'translateX(0px)';
        } else if (inp.channellist == -1) {
            EXchli.style.transform = 'translateX(100%)';
        } else if (inp.channellist == 0) {
            EXchli.style.transform = '';
        }
    }
    if (inp.commentlist == 1) {
        EXcome.style.transform = 'translateX(0px)';
    } else if (inp.commentlist == -1) {
        EXcome.style.transform = 'translateX(100%)';
    } else if (inp.commentlist == 0) {
        EXcome.style.transform = '';
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
    var jcome = $(EXcomesend)
        .siblings()
        .map(function(i, e) {
            if (e == EXcomelist || $(e).find(EXcomelist).length > 0) return e;
        })
        .first();
    var jfptop = 0; //jformのpadding-top
    var jfpbot = 0;
    var jfmtop = 0; //jformのmargin-top
    var jfmbot = 0;
    var jcmtop = 0; //jcomeのmargin-top
    var jcmbot = 0;
    var jccont = $(EXcome);
    var jcct = 0; //jccontのtop
    var jcchd = 0; //jccontのheightの100%からの減り分(最後にcalcで100%から引く)
    var htime = settings.isTimeVisible
        ? $('#forProEndTxt').height() +
          parseInt($('#forProEndTxt').css('padding-top')) +
          parseInt($('#forProEndTxt').css('padding-bottom')) +
          parseInt($('#forProEndTxt').css('margin-top')) +
          parseInt($('#forProEndTxt').css('margin-bottom'))
        : 0;
    var htitle = settings.isProtitleVisible
        ? $('#tProtitle').height() +
          parseInt($('#tProtitle').css('padding-top')) +
          parseInt($('#tProtitle').css('padding-bottom')) +
          parseInt($('#tProtitle').css('margin-top')) +
          parseInt($('#tProtitle').css('margin-bottom'))
        : 0;
    var ptime =
        inptime !== undefined
            ? inptime
            : settings.isTimeVisible
            ? settings.timePosition
            : '';
    var ptitle =
        inptitle !== undefined
            ? inptitle
            : settings.isProtitleVisible
            ? settings.protitlePosition
            : '';
    var psame = inpsame !== undefined ? inpsame : settings.proSamePosition;
    //画面上部の設定
    if (
        !(settings.isComeTriming && settings.isSureReadComment) &&
        $(EXhead).css('visibility') == 'visible'
    ) {
        //ヘッダ表示時
        if (settings.isInpWinBottom) {
            //入力欄が下＝コメ欄が上＝対象はjcomeのtopmargin
            if (
                ptime == 'windowtop' &&
                ptitle == 'windowtopright' &&
                psame == 'vertical'
            ) {
                jcmtop = Math.max(htime + htitle - 8, headerHeight);
            } else {
                jcmtop = headerHeight;
            }
            jcct = jcmtop;
            jcchd += jcmtop;
        } else {
            //入力欄が上＝対象はjformのtopmargin＋番組情報(コメ上)
            if (
                ptime == 'windowtop' &&
                ptitle == 'windowtopright' &&
                psame == 'vertical'
            ) {
                jfmtop = Math.max(htime + htitle - 8, headerHeight);
            } else {
                jfmtop = headerHeight;
            }
            if (
                ptime == 'commentinputtop' &&
                ptitle == 'commentinputtopright' &&
                psame == 'vertical'
            ) {
                //(ptitle=="commentinputtopleft"||
                jfptop = Math.max(htime + htitle, 15);
            } else if (
                ptime == 'commentinputtop' ||
                (ptitle == 'commentinputtopleft' ||
                    ptitle == 'commentinputtopright')
            ) {
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
            if (
                ptime == 'windowtop' &&
                ptitle == 'windowtopright' &&
                psame == 'vertical'
            ) {
                jcmtop = htime + htitle;
            } else if (ptime == 'windowtop' || ptitle == 'windowtopright') {
                jcmtop = Math.max(htime, htitle);
            } else {
                jcmtop = 0;
            }
            jcct = jcmtop;
            jcchd += jcmtop;
        } else {
            //jftop
            let margincut = 0;
            if (
                (ptime == 'windowtop' || ptitle == 'windowtopright') &&
                (ptime != 'commentinputtop' &&
                    ptitle != 'commentinputtopright' &&
                    ptitle != 'commentinputtopleft')
            ) {
                //ウィンドウ右上に何かあり、入力欄の上には何も無いとき
                margincut = 15;
            } else if (ptime != 'windowtop' && ptitle != 'windowtopright') {
                //ウィンドウ右上には何も無いとき
                margincut = 15;
            }
            if (
                ptime == 'windowtop' &&
                ptitle == 'windowtopright' &&
                psame == 'vertical'
            ) {
                jfmtop = htime + htitle - margincut;
            } else if (ptime == 'windowtop' || ptitle == 'windowtopright') {
                jfmtop = Math.max(htime, htitle, 15) - margincut;
            } else {
                jfmtop = 15 - margincut;
            }
            if (
                ptime == 'commentinputtop' &&
                ptitle == 'commentinputtopright' &&
                psame == 'vertical'
            ) {
                //(ptitle=="commentinputtopleft"||
                jfptop = Math.max(htime + htitle, 15);
            } else if (
                ptime == 'commentinputtop' ||
                (ptitle == 'commentinputtopleft' ||
                    ptitle == 'commentinputtopright')
            ) {
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
    $(EXvolume).css('bottom', '');
    $(EXfullscr).css('bottom', '');

    if (
        !(settings.isComeTriming && settings.isSureReadComment) &&
        $(EXfoot).css('visibility') == 'visible'
    ) {
        //フッタ表示時
        if (settings.isInpWinBottom) {
            // jctop,jfbot
            if (isComeOpen()) {
                volshift = true;
            }
            jfmbot = 0; //old:footerHeight abema公式でフッター部がコメント欄部を開けるようになったので0に
            if (
                ptime == 'commentinputbottom' &&
                ptitle == 'commentinputbottomright' &&
                psame == 'vertical'
            ) {
                //(ptitle=="commentinputbottomleft"||
                jfpbot = Math.max(htime + htitle, 15);
            } else if (
                ptime == 'commentinputbottom' ||
                (ptitle == 'commentinputbottomleft' ||
                    ptitle == 'commentinputbottomright')
            ) {
                jfpbot = Math.max(htime, htitle, 15);
            } else {
                jfpbot = 15; //footerHeight;
            }
            jcchd += jfmbot;
        } else {
            // jftop,jcbot
            jcmbot = 0; //old:footerHeight abema公式でフッター部がコメント欄部を開けるようになったので0に
            jcchd += jcmbot;
        }
    } else {
        //フッタ非表示時
        if (settings.isInpWinBottom) {
            // jctop,jfbot
            let margincut = 0;
            if (
                (ptime == 'windowbottom' || ptitle == 'windowbottomright') &&
                (ptime != 'commentinputbottom' &&
                    ptitle != 'commentinputbottomright' &&
                    ptitle != 'commentinputbottomleft')
            ) {
                //ウィンドウ右下に何かあり、入力欄の下には何も無いとき
                margincut = 15;
            } else if (
                ptime != 'windowbottom' &&
                ptitle != 'windowbottomright'
            ) {
                //ウィンドウ右下には何も無いとき
                margincut = 15;
            }
            if (
                ptime == 'windowbottom' &&
                ptitle == 'windowbottomright' &&
                psame == 'vertical'
            ) {
                jfmbot = htime + htitle - margincut;
            } else if (
                ptime == 'windowbottom' ||
                ptitle == 'windowbottomright'
            ) {
                jfmbot = Math.max(htime, htitle, 15) - margincut;
            } else {
                jfmbot = 15 - margincut;
            }
            if (
                ptime == 'commentinputbottom' &&
                ptitle == 'commentinputbottomright' &&
                psame == 'vertical'
            ) {
                //(ptitle=="commentinputbottomleft"||
                jfpbot = Math.max(htime + htitle, 15);
            } else if (
                ptime == 'commentinputbottom' ||
                (ptitle == 'commentinputbottomleft' ||
                    ptitle == 'commentinputbottomright')
            ) {
                jfpbot = Math.max(htime, htitle, 15);
            } else {
                jfpbot = 15;
            }
            jcchd += jfmbot;
        } else {
            // jftop,jcbot
            if (
                ptime == 'windowbottom' &&
                ptitle == 'windowbottomright' &&
                psame == 'vertical'
            ) {
                jcmbot = htime + htitle;
            } else if (
                ptime == 'windowbottom' ||
                ptitle == 'windowbottomright'
            ) {
                jcmbot = Math.max(htime, htitle);
            } else {
                jcmbot = 0;
            }
            jcchd += jcmbot;
        }
    }
    if (settings.isInpWinBottom) {
        //jctop,jfbot,jftop
        if (
            ptime == 'commentinputtop' &&
            ptitle == 'commentinputtopright' &&
            psame == 'vertical'
        ) {
            //(ptitle=="commentinputtopleft"||
            jfptop = Math.max(htime + htitle, 15);
        } else if (
            ptime == 'commentinputtop' ||
            (ptitle == 'commentinputtopleft' ||
                ptitle == 'commentinputtopright')
        ) {
            jfptop = Math.max(htime, htitle, 15);
        } else {
            jfptop = 15;
        }
    } else {
        //jftop,jcbot,jfbot
        if (
            ptime == 'commentinputbottom' &&
            ptitle == 'commentinputbottomright' &&
            psame == 'vertical'
        ) {
            //(ptitle=="commentinputbottomleft"||
            jfpbot = htime + htitle;
        } else if (
            ptime == 'commentinputbottom' ||
            (ptitle == 'commentinputbottomleft' ||
                ptitle == 'commentinputbottomright')
        ) {
            jfpbot = Math.max(htime, htitle, 15);
        } else {
            jfpbot = 15;
        }
    }

    jccont.css('top', jcct).css('height', 'calc(100% - ' + jcchd + 'px)');
    //AbemaTV Screen Comment Scrollerスクリプトによるコメ欄paddingをキャンセルする
    jccont.children().css('padding-top', '0px');
    //console.log("form padding top, bottom", jfptop, jfpbot);
    if (settings.isInpWinBottom) {
        jform.css('padding-top', jfptop).css('padding-bottom', jfpbot);
    } else {
        jform.css('padding-top', jfptop).css('padding-bottom', jfpbot);
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
        $(EXvolume).css('bottom', 80 + jform.height() + jfptop + jfpbot + 'px');
        $(EXfullscr).css(
            'bottom',
            80 + jform.height() + jfptop + jfpbot + 'px'
        );
    }
    if (repeatcount > 0) {
        setTimeout(
            comemarginfix,
            300,
            repeatcount - 1,
            inptime,
            inptitle,
            inpsame,
            inpbig
        );
    }
}

function setEXs() {
    //ロード直後に取得が期待できるやつ
    //obliが遅くinfoはもっと遅い
    //infoはdelaysetの方でやる
    if (getInfo.determineUrl() != getInfo.URL_ONAIR) return;
    var b = true;
    if ($('#main').length == 0 || !(EXmain = $('#main')[0])) b = false; // console.log("#main"); }
    if (
        !EXhead &&
        !(EXhead = getElm.getHeaderElement()) /*&& ($('.P_R'  ).length == 0 || !( EXhead          = $('.P_R'  )[0] ))*/
    )
        b = false; // console.log("head"); }//AppContainer__header-container___
    if(!EXleftMenu && !(EXleftMenu = getElm.getLeftMenuElement()))
        b = false;
    if (
        !EXmenu &&
        !(EXmenu = getSettingMenuElement()) /*&& ($('.Fb_Fi').length == 0 || !( EXmenu          = $('.Fb_Fi')[0] ))*/
    )
        b = false;
    if (
        !EXfoot &&
        !(EXfoot = getElm.getFooterElement()) /*&& ($('.v3_v_').length == 0 || !( EXfoot          = $('.v3_v_')[0] ))*/
    )
        b = false; // console.log("foot"); }//TVContainer__footer-container___
    if (
        !EXfootcome &&
        !(EXfootcome = getFootcomeElement()) /*&& ($('.mb_mo').length == 0 || !( EXfootcome      = $('.mb_mo')[0] ))*/
    )
        b = false; // console.log("footcome"); }//右下の入れ物
    if (
        !EXcountview &&
        !(EXcountview = getElm.getViewCounterElement()) /*&& ($('.Eu_e' ).length == 0 || !( EXcountview     = $('.Eu_e' )[0] ))*/
    )
        b = false; // console.log("footcountview"); }//閲覧数
    if (
        !EXfootcountcome &&
        !(EXfootcountcome = getFootcomeBtnElement()) /*&& ($('.JH_e' ).length == 0 || !( EXfootcountcome = $('.JH_e' )[0] ))*/
    )
        b = false; // console.log("footcountcome"); }//コメント数
    if (
        !EXsidebtn &&
        !(EXsidebtn = getSideBtnElement()) /*&& ($('.v3_v5').length == 0 || !( EXsidebtn          = $('.v3_v5')[0] ))*/
    )
        b = false; // console.log("side"); }//TVContainer__side___
    // if (
    //     !EXcomesendinp &&
    //     !(EXcomesendinp = getComeFormElement(
    //         0
    //     )) /*&& ($('.HH_HN').length == 0 || !( EXcomesendinp   = $('.HH_HN')[0] ))*/
    // )
    //     b = false; // console.log("comesendinp"); }
    // if (
    //     !EXcomesend &&
    //     !(EXcomesend = getComeFormElement(
    //         1
    //     )) /*&& ($('.HH_e' ).length == 0 || !( EXcomesend      = $('.HH_e' )[0] ))*/
    // )
    //     b = false; // console.log("comesend"); }
    // if (
    //     !EXcome &&
    //     !(EXcome = getComeFormElement(
    //         2
    //     )) /*&& ($('.v3_wi').length == 0 || !( EXcome          = $('.v3_wi')[0] ))*/
    // )
    //     b = false; // console.log("come"); }//TVContainer__right-comment-area___
    if (
        !EXvolume &&
        !(EXvolume = getElm.getVolElement()) /*&& ($('.mb_mk').length == 0 || !( EXvolume        = $('.mb_mk')[0] ))*/
    )
        b = false; // console.log("vol"); }
    if (
        !EXfullscr &&
        !(EXfullscr = getElm.getFullScreenElement()) /*&& ($('.mb_mi').length == 0 || !( EXvolume        = $('.mb_mi')[0] ))*/
    )
        b = false; // console.log("vol"); }
    if (!EXvideoarea && !(EXvideoarea = getElm.getVideoAreaElement()))
        b = false;
    //    if (! EXcomelist      &&!( EXcomelist      = getComeListElement()            ) /*&& ($('.uo_e' ).length == 0 || !( EXcomelist      = $('.uo_e' )[0] ))*/) b = false;
    EXfootcount = EXfootcome; //仕様変更により右下にはコメント数のみとなった

    if (b == true) {
        // class付与
        dl.addExtClass(EXhead, 'header');
        dl.addExtClass(EXleftMenu, 'leftMenu');
        dl.addExtClass(EXmenu, 'menu');
        dl.addExtClass(EXfoot, 'footer');
        dl.addExtClass(EXfootcome, 'footcome');
        dl.addExtClass(EXcountview, 'countview');
        dl.addExtClass(EXfootcountcome, 'footcountcome');
        dl.addExtClass(EXsidebtn, 'sideButton');
        //dl.addExtClass(EXchli, "channelList");
        //dl.addExtClass(EXinfo, 'info');
        // dl.addExtClass(EXcome, 'come');
        // dl.addExtClass(EXcomesend, 'comesend');
        // dl.addExtClass(EXcomesendinp, 'comesendinput');
        dl.addExtClass(EXvolume, 'volume');
        dl.addExtClass(EXfullscr, 'fullscr');
        //dl.addExtClass(EXobli, 'objectlist');
        dl.addExtClass(EXvideoarea, 'videoarea');

        console.log('%csetEXs ok', 'color:green;');
        //setEX2(); 残ってたchli.scrollをdelaysetに移動させてsetex2を空にした
        setOptionHead(); //各オプションをhead内に記述
        setOptionElement(); //各オプションを要素に直接適用
        setOptionEvent(); //各オプションによるイベントを作成
        // videoareaのリサイズ検知
        resizeObserver.observe(EXvideoarea, {
            attributes: true,
            attributeFilter: ['style']
        });
    } else {
        const cstr =
            'setEXs retry ' +
            (EXhead ? '.' : 'H') +
            (EXleftMenu ? '.' : 'L') +
            (EXmenu ? '.' : 'M') +
            (EXfoot ? '.' : 'F') +
            (EXfootcome ? '..' : 'Fc') +
            (EXcountview ? '.' : 'V') +
            (EXfootcountcome ? '..' : 'Fb') +
            (EXsidebtn ? '.' : 'S') +
            // (EXcomesendinp ? '..' : 'Ct') +
            // (EXcomesend ? '..' : 'Cf') +
            // (EXcome ? '.' : 'C') +
            (EXvolume ? '..' : 'Vo') +
            (EXfullscr ? '..' : 'Fs') +
            (EXvideoarea ? '..' : 'Va') +
            (EXcomelist ? '..' : 'Cl');
        if (setEXsConsoleStr !== cstr) {
            console.log(cstr);
            setEXsConsoleStr = cstr;
            setEXsConsoleRepeated = false;
        } else {
            if (!setEXsConsoleRepeated) {
                console.log(
                    '%crepeating:%c ' + cstr,
                    'background-color: orange;',
                    ''
                );
                setEXsConsoleRepeated = true;
            }
        }
        setTimeout(setEXs, 1000);
    }
}

function getFootcomeElement(returnSingleSelector) {
    //console.log("?footcome");
    //コメントアイコンを孫にもち左下のチャンネルロゴと共通の親をもつものをfootcomeとする
    var cn = getInfo.getChannelByURL();
    if (!cn) {
        console.log('?footcome(!cn)');
        return null;
    }
    var chlogo = $(EXfoot)
        .find('img[src*="/channels/logo/' + cn + '"]')
        .get(0);
    if (!chlogo) {
        console.log('?footcome(!chlogo)');
        return null;
    }
    var ret = $(EXfoot)
        .find($('[*|href*="/comment.svg"][*|href$="#svg-body"]:not([href])'))
        .get(0);
    if (!ret) {
        console.log('?footcome(!ret)');
        return null;
    }
    var rep = ret.parentElement;
    // while (!$(ret).is(EXfoot) && $(rep).find(chlogo).length == 0) {
    //     ret = rep;
    //     rep = ret.parentElement;
    // }
    ret = dl.parentsFilterLast(ret, {
        notElement: EXfoot,
        notContainElements: [chlogo, EXcountview],
        filter: e =>
            !e.querySelector(
                '[*|href*="/view.svg"][*|href$="#svg-body"]:not([href])'
            )
    });
    if ($(ret).is(EXfoot)) {
        console.log('?footcome(ret=EXfoot)');
        return null;
    }
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}

function getFootcomeBtnElement(returnSingleSelector) {
    if (!EXfootcome) return null;
    var ret = $(EXfootcome).find('button')[0];
    if (!ret) return null;
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getSideBtnElement(returnSingleSelector) {
    //console.log("?sidebtn");
    //リストアイコンを孫にもち右方にあるものをsidebtnとする
    var listIcon = $('[*|href*="/list.svg"][*|href$="#svg-body"]:not([href])');
    //フッターにあるものを除外
    if (!EXfoot) {
        return null;
    }
    var ret = null;
    for (var i = 0; i < listIcon.length; i++) {
        if ($(EXfoot).has(listIcon.get(i)).length == 0) {
            ret = listIcon.get(i);
        }
    }
    if (!ret) {
        console.log('?sidebtn');
        return null;
    }
    var rep = ret.parentElement;
    var b = rep.getBoundingClientRect();
    while (
        rep.tagName.toUpperCase() != 'BODY' &&
        b.left > (window.innerWidth * 3) / 4
    ) {
        ret = rep;
        rep = ret.parentElement;
        b = rep.getBoundingClientRect();
    }
    if (rep.tagName.toUpperCase() == 'BODY') {
        console.log('?sidebtn');
        return null;
    }
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getInfoElement(returnSingleSelector) {
    //console.log("?info");
    //ズバリ番組概要と書かれた要素を孫にもち右方にあるものをinfoとする
    //copyinfo後だとinfoのdisplay:noneでclientrectが取れない
    let ret = null;
    let h3a = document.getElementsByTagName('h3');
    let copyinfo = document.getElementById('copyinfo');
    const h3 = Array.from(h3a).filter(e => {
        return (
            e.textContent.indexOf('詳細情報') >= 0 &&
            (!copyinfo || !copyinfo.contains(e))
        );
    })[0];
    if (!h3) {
        if (!ret) {
            // console.log('?info');
            return null;
        } else {
            return ret;
        }
    }
    ret = dl.parentsFilterLast(h3 || ret, {
        left12r: true,
        notBodyParent: true
    });
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}

function getComeFormElement(sw, returnSingleSelector) {
    //sw 0:textarea 1:form 2:come
    //0 placeholderにコメントを含むtextarea
    //1 〃を含むform
    //2 〃を含んでwidthの2/3か右から(320+余裕10=330)pxの小さい方より右にあるやつ
    var e;
    if (sw != 0 && !(e = EXcomesendinp)) {
        // console.log('?comeform' + sw + '(EX=null)');
        return null;
    }
    //console.log("?comesend");
    var ret = null;
    if (sw == 0) {
        var taa = document.getElementsByTagName('textarea');
        for (var i = 0, ti, p, b; (ti = taa[i]); i++) {
            if (ti.placeholder.indexOf('コメント') < 0) continue;
            ret = ti;
            break;
        }
    } else if (sw == 1) {
        while (
            e.tagName.toUpperCase() != 'BODY' &&
            e.tagName.toUpperCase() != 'FORM'
        )
            e = e.parentElement;
        if (e.tagName.toUpperCase() == 'BODY') {
            console.log('?comeform' + sw + '(e=BODY)');
            return null;
        }
        ret = e;
    } else if (sw == 2) {
        let p = e.parentElement;
        let b = p.getBoundingClientRect();
        while (
            p.tagName.toUpperCase() != 'BODY' &&
            b.left >=
                Math.min(
                    (window.innerWidth * 2) / 3,
                    window.innerWidth - (320 + 10)
                )
        ) {
            e = p;
            p = e.parentElement;
            b = p.getBoundingClientRect();
        }
        if (p.tagName.toUpperCase() == 'BODY') {
            console.log('?comeform' + sw + '(p=BODY)');
            return null;
        }
        if (e == EXcomesendinp) {
            console.log('?comeform' + sw + '(come=comesendinp)');
            return null;
        }
        ret = e;
    }
    if (!ret) {
        if (EXcome) console.log('?comeform' + sw + '(ret=null)');
        return null;
    }
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getComeListElement(returnSingleSelector) {
    // console.log("?comelist");
    //EXcomeの中で秒前とかを探して5人以上の親をcomelistとする
    //下からだとanimatedが引っかかるので上から探す
    //無ければ <p>この番組には<br>まだ投稿がありません</p> の親divとしてみたけどやめて大丈夫そうならやめたいが、
    //やっぱりanimatedに引っかかる(初回は全部animated)からまだ投稿～で取るようにする
    var ret = null;
    var jo = $(EXcome).find('span:not(.usermade),p');
    if (jo.length < 5) {
        //無投稿メッセージ探す
        for (var i = 0, ji; i < jo.length; i++) {
            ji = jo.eq(i);
            if (ji.text().indexOf('まだ投稿がありません') < 0) continue;
            comelistClasses.empty = ji.prop('class');
            ret = ji.parent('div')[0];
            console.log(
                'indexOf投稿なし>=0 @getComeListElement emptyC=',
                ji.prop('class')
            );
            break;
        }
        if (!ret) {
            //無投稿メッセージがなければプログレスsvg
            var jpd = $(EXcome)
                .find('div[role=progressbar]')
                .parents()
                .eq(1);
            if (jpd.length > 0) {
                comelistClasses.progress = jpd.prop('class');
                ret = jpd.parent('div')[0];
                console.log(
                    'div[role=progressbar].l>0 @getComeListElement emptyC=',
                    jpd.prop('class')
                );
            }
        }
        if (!ret) {
            if (EXcome)
                console.log('?comelist(emptylist or progress notfound)');
            return null;
        }
        return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
    }

    for (let i = 0, t, ji; i < jo.length; i++) {
        ji = jo.eq(i);
        t = ji.text();
        if (
            t.indexOf('今') < 0 &&
            t.indexOf('秒前') < 0 &&
            t.indexOf('分前') < 0
        )
            continue; //この辺でcomelistClassesを取得したいがまだ分離が不完全
        ret = true;
        jo = ji.parentsUntil(EXcome);
        break;
    }
    if (!ret) {
        console.log('?comelist(time notfound)');
        return null;
    }
    ret = null;
    // console.log(jo);
    for (let i = jo.length - 1, j; i >= 0; i--) {
        j = jo.eq(i);
        if (j.find(EXcomesend).length > 0) continue;
        // console.log(j[0],j.children());
        if (j.children().length < 5) continue;
        //if(j.parent())
        ret = jo[i];
        break;
    }
    //↑ではanimationが引っかかっている可能性があるのでanimationの部分なら親の親に置き換える
    //とりあえず親の親の親がformと兄弟もしくはref=containerならanimationの部分と判定する
    if (ret) {
        var gp = ret.parentElement.parentElement;
        var jgpp = $(gp).parent();
        if (
            jgpp.siblings('form').length > 0 ||
            jgpp.attr('data-ext-ref') == 'container'
        ) {
            comelistClasses.animated = $(ret)
                .parent()
                .attr('class');
            ret = gp;
            console.log(
                'jgpp.sib(form).l>0||jgppExtRef==container @getComeListElement aniC=',
                comelistClasses.animated
            );
        }
    }
    if (!ret) {
        console.log('?comelist(children notfound)');
        return null;
    }
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}

function getVolbarObject() {
    var ret = null;
    //EXvolume内で細くて背景に彩度がありそうなのを選ぶ
    var jo = $(EXvolume).find('div');
    // console.log(jo)
    var re = /rgba? *\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *\d+ *,?)? *\)/;
    for (var i = 0, j, r, g, b, w; i < jo.length; i++) {
        w = jo.eq(i).width();
        // console.log('w',i,w)
        if (w < 5 && w > 0) {
            j = re.exec(jo.eq(i).css('background-color'));
            r = parseInt(j[1]);
            g = parseInt(j[2]);
            b = parseInt(j[3]);
            // console.log(j,r,g,b)
            if ((r < 50 || g < 50 || b < 50) && (r > 50 || g > 50 || b > 50)) {
                ret = jo.eq(i);
                break;
            }
        }
    }
    // console.log('gVbO:',ret)
    return ret;
}
function getReceiveNotifyElement(returnSingleSelector) {
    //idがあるので利用する
    var ret = $('input#1')[0];
    if (!ret) return null;
    var rep = ret.parentElement;
    var b = rep.getBoundingClientRect();
    while (
        rep.tagName.toUpperCase() != 'BODY' &&
        b.height < window.innerHeight / 4 &&
        b.width < window.innerWidth / 4 &&
        b.top > (window.innerHeight * 2) / 3 &&
        b.left + b.width < (window.innerWidth * 2) / 3
    ) {
        ret = rep;
        rep = ret.parentElement;
        b = rep.getBoundingClientRect();
    }
    if (rep.tagName.toUpperCase == 'BODY') return null;
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getReceiveTwtElement(returnSingleSelector) {
    //左下にあるtwtアイコンの親で左下のを選ぶ
    var jo = $(
        '[*|href*="/images/icons/twitter.svg"][*|href$="#svg-body"]:not([href])'
    );
    var ret = null;
    for (var i = 0; i < jo.length; i++) {
        if (
            jo.eq(i).offset().top < (window.innerHeight * 2) / 3 ||
            jo.eq(i).offset().left > (window.innerWidth * 2) / 3
        )
            continue;
        ret = jo[i];
        break;
    }
    if (!ret) return null;
    var rep = ret.parentElement;
    var b = rep.getBoundingClientRect();
    while (
        rep.tagName.toUpperCase() != 'BODY' &&
        b.height < window.innerHeight / 2 &&
        b.width < window.innerWidth / 2 &&
        b.top > window.innerHeight / 4 &&
        b.left + b.width < (window.innerWidth * 2) / 3
    ) {
        ret = rep;
        rep = ret.parentElement;
        b = rep.getBoundingClientRect();
    }
    if (rep.tagName.toUpperCase == 'BODY') return null;
    return returnSingleSelector ? dl.getElementSingleSelector(ret) : ret;
}
function getComeModuleElements(returnSingleSelector) {
    //投稿ボタンの祖先でtextareaと共通の祖先の子 と投稿ボタン とtwtコンテナを返す
    const ret = [null, null, null];

    const postButton = dl.last(
        dl.filter(EXcomesend.getElementsByTagName('button'), {
            filter: e => e.innerText.includes('投稿')
        }),
        true
    );
    ret[1] = postButton;
    if (!postButton) return ret;

    const modulesTopElement = dl.parentsFilterLast(postButton, {
        notContainElement: EXcomesendinp,
        notElement: EXcome
    });
    ret[0] = modulesTopElement;
    if (!modulesTopElement) return ret;

    const twIcon = modulesTopElement.querySelector(
        '[*|href*="/images/icons/twitter.svg"][*|href$="#svg-body"]:not([href])'
    );
    if (!twIcon) return ret;
    const twIconParents = dl.parentsUntil(twIcon, modulesTopElement);
    for (var r = 0; r < twIconParents.length; r++) {
        const twIconParentSpan = twIconParents[r].getElementsByTagName('span');
        if (twIconParentSpan.length == 0) continue;
        if (
            Array.from(twIconParentSpan).some(s => s.innerText.includes('連携'))
        );
        for (var k = r; k + 1 < twIconParents.length; k++) {
            console.log(
                4363,
                twIconParents[k + 1].clientWidth,
                twIconParents[k].clientWidth
            );
            if (
                twIconParents[k + 1].clientWidth == 0 ||
                twIconParents[k].clientWidth == 0
            )
                break;
            if (
                twIconParents[k + 1].clientWidth <
                twIconParents[k].clientWidth + 10
            )
                continue;
            ret[2] = twIconParents[k];
            break;
        }
        break;
    }
    if (returnSingleSelector) {
        ret[0] = dl.getElementSingleSelector(ret[0]);
        ret[1] = dl.getElementSingleSelector(ret[1]);
        ret[2] = dl.getElementSingleSelector(ret[2]);
    }
    return ret;
}
function getVideoRouteClasses() {
    //EXobli>各chコンテナ>背景画像,videoの親..からvideoの親のclassを選ぶ
    const videoElem = getElm.getVideo();
    if (!videoElem) {
        console.log('?getVideoRouteClasses no video');
        return ['', ''];
    }
    let videoContainer = dl.parentsFilterLast(videoElem, {
        filters: [e => e.parentElement === EXvideoarea]
    });
    //var jo= $(EXobli).find('video,object').first().parentsUntil(EXobli).eq(-2);
    //return [jo.first().prop("class"), jo.siblings('img[src*="/channels/logo/"]').first().prop("class")];
    return [
        videoContainer.getAttribute('class'),
        videoContainer.parentElement
            .querySelector(':scope>img[src*="/channels/logo/"]')
            .getAttribute('class')
    ];
}
function getSettingMenuElement() {
    const mypageMenuS = document.getElementsByClassName('com-application-MypageMenu');
    if (mypageMenuS.length===0) {
        return null;
    }
    return mypageMenuS[0];
}

function hasNotTransformed(jo) {
    //transformしていない=right0等が画面外に移動していない=開いている
    //1つでも開いてればtrue,全部閉じてたらfalse
    // matrix(1, 0, 0, 1, 0, 0)
    for (var i = 0; i < jo.length; i++) {
        if (
            /matrix *\( *1(\.0+)? *, *-?0(\.0+)? *, *-?0(\.0+)? *, *1(\.0+)? *, *-?0(\.0+)? *, *-?0(\.0+)? *,? *\)/.test(
                jo.eq(i).css('transform')
            )
        )
            return true;
    }
    return false;
}
function isComeOpen(sw) {
    //console.trace('isComeOpen()')
    if (sw === undefined) {
        sw = 0;
    }
    var eo = EXcome;
    if (!eo) return false;
    var jo = $(eo);
    var bs = jo.attr('aria-hidden');
    var bb;
    if (bs == 'true' || bs == 'false') {
        bb = bs == 'false';
    } else {
        bb = hasNotTransformed(jo);
    }
    var bc = eo.style.transform == 'translateX(0px)';
    var bd = jo.offset().left < window.innerWidth; //少しでも開いてるとtrue
    var be = jo.offset().left + jo.width() < window.innerWidth + 50; //ほぼ開いてたらtrue
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
        case 4:
            return be;
            break;
    }
    return false;
}
function isSlideOpen(sw) {
    if (!sw) sw = 0;
    return isChliOpen(sw) || isInfoOpen(sw) || isComeOpen(sw);
}
function isInfoOpen(sw) {
    //sw 0:内部の開閉状態 1:cssの開閉 2:0or1 3:見た目の開閉
    if (!EXinfo) return false;
    if (sw === undefined) {
        sw = 0;
    }
    var eo = EXinfo;
    var jo = $(eo);
    var bs = jo.attr('aria-hidden');
    var bb;
    if (bs == 'true' || bs == 'false') {
        bb = bs == 'false';
    } else {
        bb = hasNotTransformed(jo);
    }
    var bc = eo.style.transform == 'translateX(0px)';
    var bd = jo.offset().left < window.innerWidth;
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
function isChliOpen(sw) {
    //sw 0:shown 1:transform 2:両方
    if (sw === undefined) {
        sw = 0;
    }
    if (!EXchli) return false;
    var eo = EXchli;
    var jo = $(eo);
    var bs = jo.attr('aria-hidden');
    var bb;
    if (bs == 'true' || bs == 'false') {
        bb = bs == 'false';
    } else {
        bb = hasNotTransformed(jo);
    }
    var bc = eo.style.transform == 'translateX(0px)';
    var bd = jo.offset().left < window.innerWidth;
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
    var eo = EXsidebtn;
    var jo = $(eo);
    var bs = jo.attr('aria-hidden');
    var bb;
    if (bs == 'true' || bs == 'false') {
        bb = bs == 'false';
    } else {
        bb = hasNotTransformed(jo);
    }
    var bc = eo.style.transform == 'translateY(-50%)';
    var bd = jo.offset().left < window.innerWidth;
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
    var teka = document.createEvent('MouseEvents');
    var teki = getVolbarObject();
    if (teki == null) return;
    var maxvol = teki.parent().height();
    var targetvolume = Math.min(
        maxvol,
        Math.max(0, Math.floor((maxvol * settings.changeMaxVolume) / 100))
    );
    teki = teki.parent().parent();
    var teku =
        teki.offset().top +
        parseInt(teki.css('padding-top')) +
        maxvol -
        targetvolume;
    teka.initMouseEvent(
        'mousedown',
        true,
        true,
        window,
        0,
        0,
        0,
        teki.offset().left + 15,
        teku
    );
    setTimeout(otomouseup, 100, teku);
    return teki[0].dispatchEvent(teka);
}
function moVol(d) {
    // console.log('movol ' + d);
    if (!EXvolume) return;
    // console.log(EXvolume);
    var mouseEvent = document.createEvent('MouseEvents');
    var volbarObj = getVolbarObject();
    if (volbarObj == null) return;
    // console.log(volbarObj);
    var orivol = volbarObj.height();
    volbarObj = volbarObj.parent();
    var maxvol = volbarObj.height();
    var targetvolume = Math.min(maxvol, Math.max(0, orivol + d));
    volbarObj = volbarObj.parent();
    var evtPosY =
        volbarObj.offset().top +
        parseInt(volbarObj.css('padding-top')) +
        maxvol -
        targetvolume;
    mouseEvent.initMouseEvent(
        'mousedown',
        true,
        true,
        window,
        0,
        0,
        0,
        volbarObj.offset().left + 15,
        evtPosY
    );
    setTimeout(otomouseup, 100, evtPosY);
    return volbarObj[0].dispatchEvent(mouseEvent);
}
function otomouseup(p) {
    if (!EXvolume) return;
    // console.log(EXvolume);
    var mouseEvent = document.createEvent('MouseEvents');
    var volbarObj = getVolbarObject();
    if (volbarObj == null) return;
    // console.log(volbarObj);
    mouseEvent.initMouseEvent(
        'mouseup',
        true,
        true,
        window,
        0,
        0,
        0,
        volbarObj
            .parent()
            .parent()
            .offset().left + 15,
        p
    );
    setTimeout(volbar, 100);
    setTimeout(() => {
        const vol = getVolbarObject().height();
        isSoundFlag = vol > 0 ? true : false;
    }, 100);
    return volbarObj[0].dispatchEvent(mouseEvent);
}
function otoColor() {
    var jo = $(EXvolume)
        .contents()
        .find('svg');
    if (jo.length == 0) return;
    if (jo.css('fill') == 'rgb(255, 255, 255)') {
        jo.css('fill', 'red');
        setTimeout(otoColor, 800);
    } else {
        jo.css('fill', '');
    }
}
function otoSize(ts) {
    var jo = $(EXvolume)
        .contents()
        .find('svg');
    if (jo.length == 0) return;
    if (jo.css('zoom') == '1') {
        jo.css('zoom', ts);
        setTimeout(otoSize, 400);
    } else {
        jo.css('zoom', '');
    }
}
function volbar() {
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;
    var jo = $('#forProEndTxt');
    //    if(jo.filter('.forProEndTxt').length==0){
    if (jo.is('.vol')) {
        //        jo.prop("class","forProEndTxt");
        jo.removeClass('vol');
    } else {
        //        jo.prop("class","");
        jo.addClass('vol');
        var teki = getVolbarObject();
        var orivol = 46;
        var maxvol = 92;
        if (teki != null) {
            orivol = teki.height();
            maxvol = teki.parent().height();
        }
        var v = Math.min(maxvol, Math.max(0, orivol));
        var p = Math.min(100, Math.round((100 * v) / 92));
        var q = v == 0 ? 'mute' : p + '%';
        var w = 1 + Math.round((309 * v) / maxvol);
        jo.text('vol ' + q);
        $('#forProEndBk').css('width', w + 'px');
        setTimeout(volbar, 800);
    }
}
function faintcheck2(retrycount, sw, fcd, bgi) {
    //console.log("faintcheck#"+retrycount+",fcd="+fcd);
    if (EXfootcountcome) {
        if (sw < 0) {
            if (!isFootcomeClickable()) {
                //isNaN(parseInt($(EXfootcountcome).text()))
                //console.log("faintcheck cmblockcd="+cmblockcd+"->"+fcd);
                cmblockcd = fcd;
                bginfo[3] = bgi;
                return;
            }
        } else if (sw > 0) {
            if (isFootcomeClickable()) {
                //!isNaN(parseInt($(EXfootcountcome).text()))
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
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;
    //console.log("comeColor:"+inp);
    if (!EXfootcountcome) return;
    //console.log($(EXfootcountcome).css("color"));
    if (inp === undefined) {
        jo.css('display', 'none');
        setTimeout(comeColor, 800, jo, -2);
    } else if (inp == -2) {
        jo.css('display', '');
    } else if (inp == -1) {
        jo.css('color', '');
        jo.prev('svg').css('fill', '');
    } else {
        var lim = [90, 60, 30];
        if (inp > lim[0]) {
            jo.css('color', '');
        } else if (inp > lim[1]) {
            jo.css(
                'color',
                'rgb(255, 255, ' +
                    Math.round((255 * (inp - lim[1])) / (lim[0] - lim[1])) +
                    ')'
            );
        } else if (inp > lim[2]) {
            jo.css(
                'color',
                'rgb(255, ' +
                    Math.round((255 * (inp - lim[2])) / (lim[2] - lim[1])) +
                    ', 0)'
            );
        } else {
            jo.css('color', 'rgb(255, 0, 0)');
        }
        jo.prev('svg').css('fill', 'black');
        setTimeout(comeColor, 800, jo, -1);
    }
}
function waitforComeReady() {
    if (!EXcomelist) {
        return;
    }
    var comeListLen = EXcomelist.childElementCount;
    if (
        comelistClasses.animated &&
        EXcomelist.firstElementChild.className.indexOf(
            comelistClasses.animated
        ) >= 0
    ) {
        comeListLen--;
    } //冒頭のanimationは数から除外
    else if (
        EXcomelist.firstElementChild.firstElementChild.firstElementChild.tagName
            .toUpperCase()
            .indexOf('DIV') >= 0
    ) {
        comeListLen--;
    }
    if (comeListLen > 0) {
        applyCommentListNG();
    } else {
        console.log('waitforComeReady', comeListLen);
        setTimeout(waitforComeReady, 1000);
    }
}
function chkcomelist(retrycount) {
    //console.log("chkcomelist#"+retrycount);
    if ($(EXcomelist).length == 0) return;
    var comeListLen = EXcomelist.childElementCount;
    if (
        comelistClasses.animated &&
        EXcomelist.firstElementChild.className.indexOf(
            comelistClasses.animated
        ) >= 0
    ) {
        comeListLen--;
    } //冒頭のanimationは数から除外
    //console.log("chkcomelist#"+retrycount+",comelistlen="+comeListLen);
    if (
        comeListLen <= settings.sureReadRefreshx &&
        (comeListLen > 1 || retrycount == 0)
    ) {
        //console.log("comeRefreshed " + commentNum + "->" + comeListLen);
        comeRefreshing = false;
        comeFastOpen = false;
        commentNum = comeListLen;
        comeHealth = Math.min(100, Math.max(0, commentNum));
        comeColor($(EXfootcountcome), comeHealth);
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
let lastFootcomeTriggeredTime = 0;
function waitforOpenableCome(retrycount) {
    // console.log("waitforOpenableCome#"+retrycount);
    const nowTime = new Date().getTime();
    // コメ欄自動開閉が暴走しないようトリガーは最低3秒は開ける
    if (
        !isSlideOpen() &&
        isFootcomeClickable() &&
        nowTime - lastFootcomeTriggeredTime >= 3000
    ) {
        $(EXfootcome)
            .find('button')
            .trigger('click');
        // console.log("comeopen waitforopenable");
        waitforOpenCome(5);
        lastFootcomeTriggeredTime = nowTime;
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
    var prehoverContents = $('[class*="Dropdown__button___"]')
        .parent()
        .parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot)
        .contents()
        .find('[class*="styles__channel-logo___"]')
        .first(); //todo
    var forpros = $('.forpros');
    var bsize = bigtext !== undefined ? bigtext : settings.isProTextLarge;
    var fsize = bsize ? 'medium' : 'x-small';
    var tpro = $('#tProtitle');
    tpro.css('transform', '')
        .css('left', '')
        .css('right', '')
        .css('top', '')
        .css('bottom', '')
        .css('font-size', fsize);
    forpros
        .css('top', '')
        .css('bottom', '')
        .css('font-size', fsize);
    prehoverContents
        .css('margin-top', '')
        .css('margin-right', '')
        //        .css("transform","")
        .css('margin-left', '')
        .prev()
        .css('margin-top', '')
        //        .css("transform","")
        .contents()
        .find('li')
        .slice(1)
        .css('margin-left', '');
    headlogo
        .css('margin-top', '')
        .next()
        .css('margin-top', '')
        .find('[class*="styles__default-input-text___"]')
        .css('height', ''); //todo
    parexfootcount
        .css('margin-bottom', '')
        .css('margin-top', '')
        .css('height', '');
    $(EXfootcome)
        .css('border-left', '')
        .css('margin-right', '')
        .prev()
        .css('border-right', '');
    footlogo
        .css('margin-bottom', '')
        .next()
        .css('margin-bottom', '');
    if (EXvolume) EXvolume.style.marginBottom = '';
    if (EXfullscr) EXfullscr.style.marginBottom = '';
}
function proSamePositionFix(inptime, inptitle, inpsame, inpbig) {
    //console.log("proSameFix time="+inptime+", title="+inptitle+", same="+inpsame);
    var prehoverContents = $('[class*="Dropdown__button___"]')
        .parent()
        .parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot)
        .contents()
        .find('[class*="styles__channel-logo___"]')
        .first(); //todo
    var forpros = $('.forpros');
    var forprot = $('#forProEndTxt');
    var tpro = $('#tProtitle');
    var fproh =
        forprot.height() +
        parseInt(forprot.css('padding-top')) +
        parseInt(forprot.css('padding-bottom')) +
        parseInt(forprot.css('margin-top')) +
        parseInt(forprot.css('margin-bottom'));
    var tproh =
        tpro.height() +
        parseInt(tpro.css('padding-top')) +
        parseInt(tpro.css('padding-bottom')) +
        parseInt(tpro.css('margin-top')) +
        parseInt(tpro.css('margin-bottom'));
    var tprow =
        tpro.width() +
        parseInt(tpro.css('padding-left')) +
        parseInt(tpro.css('padding-right')) +
        parseInt(tpro.css('margin-left')) +
        parseInt(tpro.css('margin-right'));
    var fprow =
        forprot.width() +
        parseInt(forprot.css('padding-top')) +
        parseInt(forprot.css('padding-bottom')) +
        parseInt(forprot.css('margin-top')) +
        parseInt(forprot.css('margin-bottom'));
    var timeshown = inptime;
    //    var bigtext=(inpbig!==undefined)?bigtext:settings.isProTextLarge;
    if (timeshown == 'header') {
        if ($(EXhead).css('visibility') == 'visible') {
            timeshown = 'windowtop';
        } else {
            timeshown = '';
        }
    } else if (timeshown == 'footer') {
        if ($(EXfoot).css('visibility') == 'visible') {
            timeshown = 'windowbottom';
        } else {
            timeshown = '';
        }
    }
    var titleshown = inptitle;
    if (titleshown == 'headerright') {
        if ($(EXhead).css('visibility') == 'visible') {
            titleshown = 'windowtopright';
        } else {
            titleshown = '';
        }
    } else if (titleshown == 'footerright') {
        if ($(EXfoot).css('visibility') == 'visible') {
            titleshown = 'windowbottomright';
        } else {
            titleshown = '';
        }
    }
    //console.log("fix timeshown:"+timeshown+",titleshown:"+titleshown);
    if (timeshown == 'windowtop' && titleshown == 'windowtopright') {
        switch (inpsame) {
            case 'over':
                tpro.css('right', '310px').css('transform', 'translateX(100%)');
                break;
            case 'vertical':
                forpros.css('top', tproh - 4 + 'px');
                if (tprow <= 320) {
                    prehoverContents
                        .css(
                            'margin-right',
                            settings.isComeTriming && settings.isSureReadComment
                                ? ''
                                : '310px'
                        )
                        .css('margin-top', '')
                        .css('margin-left', '12px')
                        .prev()
                        .css('margin-top', '')
                        .contents()
                        .find('li')
                        .slice(1)
                        .css('margin-left', '12px');
                } else {
                    prehoverContents
                        .css(
                            'margin-right',
                            settings.isComeTriming && settings.isSureReadComment
                                ? ''
                                : '310px'
                        )
                        .css('margin-left', '12px')
                        .prev()
                        .contents()
                        .find('li')
                        .slice(1)
                        .css('margin-left', '12px');
                }
                break;
            case 'horizontal':
                tpro.css('right', '310px');
                break;
            case 'horizshort':
                tpro.css('right', fprow + 8 + 'px');
                break;
            default:
        }
    } else if (
        timeshown == 'windowbottom' &&
        titleshown == 'windowbottomright'
    ) {
        switch (inpsame) {
            case 'over':
                tpro.css('right', '310px').css('transform', 'translateX(100%)');
                break;
            case 'vertical':
                tpro.css('bottom', fproh - 4 + 'px');
                $(EXfootcome).css('margin-right', '310px');
                if (tprow <= 320) {
                    parexfootcount.css('margin-bottom', '');
                    $(EXfootcome)
                        .css('border-left', '')
                        .prev()
                        .css('border-right', '');
                } else {
                    //タイトルが長い場合はmargin-bottomをtopに入れ替えてタイトルを避ける
                    var fcmb = parseInt(parexfootcount.css('margin-bottom'));
                    parexfootcount.css('margin-bottom', '');
                    parexfootcount.css('margin-top', fcmb + 'px');
                }
                break;
            case 'horizontal':
                tpro.css('right', '310px');
                break;
            case 'horizshort':
                tpro.css('right', fprow + 8 + 'px');
                break;
            default:
        }
    } else if (
        timeshown == 'commentinputtop' &&
        titleshown == 'commentinputtopright'
    ) {
        switch (inpsame) {
            case 'over':
            case 'horizontal':
                tpro.css('right', '').css('left', 0);
                break;
            case 'vertical':
                forpros.css('top', tproh - 4 + 'px');
                break;
            case 'horizshort':
                tpro.css('right', fprow + 8 + 'px');
                break;
            default:
        }
    } else if (
        timeshown == 'commentinputbottom' &&
        titleshown == 'commentinputbottomright'
    ) {
        switch (inpsame) {
            case 'over':
            case 'horizontal':
                tpro.css('right', '').css('left', 0);
                break;
            case 'vertical':
                tpro.css('bottom', fproh - 4 + 'px');
                break;
            case 'horizshort':
                tpro.css('right', fprow + 8 + 'px');
                break;
            default:
        }
    }
}
function openInfo(sw) {
    if (!EXinfo) return;
    if (sw) {
        $(EXinfo).css('transform', 'translateX(0)');
        proinfoOpened = true; //クリックで解除できるようにする
    } else {
        $(EXinfo).css('transform', '');
        proinfoOpened = false;
    }
}
function createProtitle(sw, bt) {
    // if (!EXcome) return;
    if (sw == 0) {
        if ($('#tProtitle').length == 0) {
            var eProtitle = '<span id="tProtitle" class="usermade" style="';
            //            eProtitle+='position:absolute;right:0;font-size:'+(bt?"medium":"x-small")+';padding:4px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14;background-color:transparent;top:0px;';
            eProtitle +=
                'font-size:' +
                (bt ? 'medium' : 'x-small') +
                ';position:absolute;top:0px;right:0';
            eProtitle +=
                '">' +
                (proTitle ? proTitle : '未取得(番組詳細パネルを開いて取得)') +
                '</span>';
            //            EXcome.insertBefore(eProtitle,EXcome.firstChild);
            $(eProtitle).prependTo(document.body);
            //番組名クリックで番組情報タブ開閉
            $('#tProtitle').on('click', function() {
                if (!EXinfo) return;
                if (!proinfoOpened) {
                    setTimeout(openInfo, 50, true);
                } else {
                    setTimeout(openInfo, 50, false);
                }
            });
        }
    } else if (sw == 1) {
        $('#tProtitle').remove();
    }
}
function setProtitlePosition(timepar, titlepar, samepar, bigpar) {
    //残り時間との重なり処理はこれが終わってから
    var prehoverContents = $('[class*="Dropdown__button___"]')
        .parent()
        .parent(); //todo
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot)
        .contents()
        .find('[class*="styles__channel-logo___"]')
        .first(); //todo
    var tpro = $('#tProtitle');
    //    var bigtext=(bigpar!==undefined)?bigpar:settings.isProTextLarge;
    var tproh =
        tpro.height() +
        parseInt(tpro.css('padding-top')) +
        parseInt(tpro.css('padding-bottom'));
    var tprouc = tpro.height() + parseInt(tpro.css('padding-top'));
    var headh = $(EXhead).height();
    var tprow =
        tpro.width() +
        parseInt(tpro.css('padding-left')) +
        parseInt(tpro.css('padding-right')) +
        parseInt(tpro.css('margin-left')) +
        parseInt(tpro.css('margin-right'));
    var par = titlepar;
    let hmt, fmb;
    switch (par) {
        case 'windowtopleft':
        case 'windowtopright':
        case 'commentinputtopleft':
        case 'commentinputtopright':
        case 'headerleft':
        case 'headerright':
            tpro.css('bottom', '').css('top', 0);
            break;
        case 'windowbottomleft':
        case 'windowbottomright':
        case 'commentinputbottomleft':
        case 'commentinputbottomright':
        case 'footerleft':
        case 'footerright':
            tpro.css('top', '').css('bottom', 0);
            break;
        default:
    }
    switch (par) {
        case 'windowtopleft':
        case 'windowbottomleft':
        case 'commentinputtopleft':
        case 'commentinputbottomleft':
        case 'headerleft':
        case 'footerleft':
            tpro.css('right', '').css('left', 0);
            break;
        case 'windowtopright':
        case 'windowbottomright':
        case 'commentinputtopright':
        case 'commentinputbottomright':
        case 'headerright':
        case 'footerright':
            tpro.css('left', '').css('right', 0);
            break;
        default:
    }
    switch (par) {
        case 'windowtopright':
        case 'headerright':
            if (
                settings.isComeTriming &&
                settings.isSureReadComment &&
                tprow <= 320
            )
                break;
            hmt = tproh - 12 + Math.floor((headh - tproh - 12) / 2);
            prehoverContents
                .css('margin-top', hmt + 'px')
                .prev()
                .css('margin-top', hmt + 'px');
            break;
        default:
    }
    switch (par) {
        case 'windowtopleft':
        case 'headerleft':
            hmt = tproh + 8 - 18 + Math.floor((headh - tproh - 8 - 18) / 2);
            headlogo
                .css('margin-top', hmt + 'px')
                .next()
                .css('margin-top', hmt + 'px');
            if (bigpar)
                headlogo
                    .next()
                    .find('[class*="styles__default-input-text___"]')
                    .css('height', headh - tprouc + 'px'); //todo
            break;
        default:
    }
    switch (par) {
        case 'windowbottomright':
        case 'footerright':
            fmb = tproh;
            parexfootcount
                .css('margin-bottom', fmb + 'px')
                .css('height', 'unset');
            $(EXfootcome)
                .css('border-left', '1px solid #444')
                .prev()
                .css('border-right', 'none');
            break;
        default:
    }
    switch (par) {
        case 'windowbottomleft':
        case 'footerleft':
            fmb = tproh;
            footlogo
                .css('margin-bottom', fmb + 'px')
                .next()
                .css('margin-bottom', fmb + 'px');
            break;
        default:
    }
    switch (par) {
        case 'windowtopleft':
        case 'windowtopright':
        case 'windowbottomleft':
        case 'windowbottomright':
            if (
                !$('body')
                    .children()
                    .is(tpro)
            ) {
                tpro.prependTo('body');
            }
            break;
        case 'commentinputtopleft':
        case 'commentinputtopright':
        case 'commentinputbottomleft':
        case 'commentinputbottomright':
            if (
                !$(EXcomesend)
                    .children()
                    .is(tpro)
            ) {
                tpro.prependTo(EXcomesend);
            }
            break;
        case 'headerleft':
        case 'headerright':
            if (
                !$(EXhead)
                    .children()
                    .is(tpro)
            ) {
                tpro.prependTo(EXhead);
            }
            break;
        case 'footerleft':
        case 'footerright':
            if (
                !$(EXfoot)
                    .children()
                    .is(tpro)
            ) {
                tpro.prependTo(EXfoot);
            }
            break;
        default:
    }

    var b = false;
    if (settings.proTitleFontC) {
        switch (par) {
            case 'commentinputtopleft':
            case 'commentinputtopright':
            case 'commentinputbottomleft':
            case 'commentinputbottomright':
                b = true;
                break;
            // コメ入力欄周辺でない場合でも、ウィンドウ右下かつコメ入力欄下かつコメ欄表示中などによりコメ入力欄周辺に設置される場合があるけどそこまでは未設定
            default:
        }
    }
    if (b)
        tpro.css(
            'color',
            'rgba(' +
                settings.commentTextColor +
                ',' +
                settings.commentTextColor +
                ',' +
                settings.commentTextColor +
                ',' +
                settings.commentTextTrans / 255 +
                ')'
        );
    else tpro.css('color', '');
}
function createTime(sw, bt) {
    //console.log("createTime:"+sw);
    // if (!EXcome) return;
    if (sw == 0) {
        var fsize = bt ? 'medium' : 'x-small';
        if ($('#forProEndBk').length == 0) {
            var eForProEndBk =
                '<span id="forProEndBk" class="usermade forpros" style="';
            //            eForProEndBk+='position:absolute;right:0;font-size:'+fsize+';padding:0px 0px;margin:4px 0px;background-color:rgba(255,255,255,0.2);z-index:12;width:310px;top:0px;';
            eForProEndBk +=
                'font-size:' +
                fsize +
                ';position:absolute;top:0px;right:0;width:310px;';
            eForProEndBk += '"></span>';
            //            EXcome.insertBefore(eForProEndBk,EXcome.firstChild);
            $(eForProEndBk).prependTo(document.body);
            $('#forProEndBk').html('&nbsp;');
        }
        if ($('#forProEndTxt').length == 0) {
            var eForProEndTxt =
                '<span id="forProEndTxt" class="usermade forpros" style="';
            //            eForProEndTxt+='position:absolute;right:0;font-size:'+fsize+';padding:4px 5px 4px 11px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14;background-color:transparent;top:0px;';
            eForProEndTxt +=
                'font-size:' + fsize + ';position:absolute;top:0px;right:0;';
            eForProEndTxt += '">未取得(番組詳細パネルを開いて取得)</span>';
            //            EXcome.insertBefore(eForProEndTxt,EXcome.firstChild);
            $(eForProEndTxt).prependTo(document.body);
            $('#forProEndTxt').html('&nbsp;');
            //残り時間クリックで設定ウィンドウ開閉
            $('#forProEndTxt')
                .removeClass('vol')
                .on('click', function() {
                    if ($('#settcont').css('display') == 'none') {
                        openOption();
                    } else {
                        closeOption();
                    }
                });
        }
        if ($('#proTimeEpNum').length == 0) {
            const proTimeColorNum =
                settings.timePosition.includes('commentinput') &&
                settings.commentBackColor > 127
                    ? 0
                    : 255;
            const proTimeBkColor = `rgba(${proTimeColorNum},${proTimeColorNum},${proTimeColorNum},0.2)`;
            var eproTimeEpNum =
                '<div id="proTimeEpNum" class="usermade forpros" style="';
            //            eproTimeEpNum.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:4px 0px;background-color:transparent;z-index:13;width:310px;top:0px;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;");
            //            eproTimeEpNum+='position:absolute;right:0;font-size:'+fsize+';padding:4px 0px;background-color:transparent;z-index:13;width:310px;top:0px;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;';
            eproTimeEpNum +=
                'font-size:' +
                fsize +
                ';position:absolute;top:0px;right:0;width:310px;';
            eproTimeEpNum += '">';
            eproTimeEpNum += (
                '<div style="border-left:1px solid ' +
                proTimeBkColor +
                ';flex:1 0 1px;">&nbsp;</div>'
            ).repeat(2);
            //            EXcome.insertBefore(eproTimeEpNum,EXcome.firstChild);
            $(eproTimeEpNum).prependTo(document.body);
            $('#proTimeEpNum')
                .children()
                .html('&nbsp;');
            $('#proTimeEpNum')
                .on('mousemove', proepMousemove)
                .on('mouseleave', proepMouseleave);
        }
    } else if (sw == 1) {
        $('.forpros').remove();
    }
}
function proepMousemove() {
    //    var c=parseInt($('#epnumedit input[type="number"][name="epcount"]').val());
    //    if(c<=6){return;}
    var c = parseInt(
        $('#epnumedit input[type="number"][name="epfirst"]').val()
    );
    if (c <= 0) return;
    var jo = $('#forProEndTxt');
    if (jo.css('display') == 'none') return;
    var t = parseFloat(jo.css('opacity'));
    if (t == 0) {
        jo.css('display', 'none')
            .css('transition', '')
            .css('opacity', '');
    } else if (t == 1) {
        jo.css('transition', 'opacity 0.5s linear').css('opacity', 0);
    }
}
function proepMouseleave() {
    $('#forProEndTxt')
        .css('display', '')
        .css('transition', '')
        .css('opacity', '');
}
function setTimePosition(timepar, titlepar, samepar, bigpar) {
    var prehoverContents = $('[class*="Dropdown__button___"]')
        .parent()
        .parent(); //todo
    var parexfootcount = $(EXfootcount).parent();
    var forpros = $('.forpros');
    //    var bigtext=(bigpar!==undefined)?bigpar:settings.isProTextLarge;
    var fproh = $('#forProEndTxt').height();
    var headh = $(EXhead).height();
    var par = timepar;
    switch (par) {
        case 'windowtop':
        case 'commentinputtop':
        case 'header':
            forpros.css('bottom', '').css('top', 0);
            break;
        case 'windowbottom':
        case 'commentinputbottom':
        case 'footer':
            forpros.css('top', '').css('bottom', 0);
            break;
        default:
    }
    switch (par) {
        case 'windowtop':
        case 'header':
            if (settings.isComeTriming && settings.isSureReadComment) break;
            var hmt = fproh - 12 + Math.floor((headh - fproh - 12) / 2);
            prehoverContents
                .css('margin-top', hmt + 'px')
                .prev()
                .css('margin-top', hmt + 'px');
            break;
        default:
    }
    switch (par) {
        case 'windowbottom':
        case 'footer':
            var fmb = fproh;
            parexfootcount
                .css('margin-bottom', fmb + 'px')
                .css('height', 'unset');
            $(EXfootcome)
                .css('border-left', '1px solid #444')
                .prev()
                .css('border-right', 'none');
            if (EXvolume) EXvolume.style.marginBottom = fmb + 'px';
            if (EXfullscr) EXfullscr.style.marginBottom = fmb + 'px';
            break;
        default:
    }
    switch (par) {
        case 'windowtop':
        case 'windowbottom':
            if (
                !$('body')
                    .children()
                    .is(forpros)
            ) {
                forpros.prependTo('body');
            }
            break;
        case 'commentinputtop':
        case 'commentinputbottom':
            if (
                !$(EXcomesend)
                    .children()
                    .is(forpros)
            ) {
                forpros.prependTo(EXcomesend);
            }
            break;
        case 'header':
            if (
                !$(EXhead)
                    .children()
                    .is(forpros)
            ) {
                forpros.prependTo(EXhead);
            }
            break;
        case 'footer':
            if (
                !$(EXfoot)
                    .children()
                    .is(forpros)
            ) {
                forpros.prependTo(EXfoot);
            }
            break;
        default:
    }
    if (
        settings.proTitleFontC &&
        (par == 'commentinputtop' || par == 'commentinputbottom')
    ) {
        $('#forProEndTxt').css(
            'color',
            'rgba(' +
                settings.commentTextColor +
                ',' +
                settings.commentTextColor +
                ',' +
                settings.commentTextColor +
                ',' +
                settings.commentTextTrans / 255 +
                ')'
        );
        $('#forProEndBk').css(
            'background-color',
            'rgba(' +
                settings.commentBackColor +
                ',' +
                settings.commentBackColor +
                ',' +
                settings.commentBackColor +
                ',' +
                0.2 +
                ')'
        );
    } else {
        $('#forProEndTxt').css('color', '');
        $('#forProEndBk').css('background-color', '');
    }
}
function setOptionHead() {
    //ほぼ同時に複数起動した場合の重複を避けるため削除はappend直前にする
    //$('head>link[title="usermade"]').remove();
    //適宜再実行するようにしたので、この中でgetElementした後にdisplay:none等やると次回のgetElementで大きさや位置が取れずgetできない場合があることに注意する
    var t = '';
    var jo, jp;
    var eo;
    var to = '';
    var selCome,
        selComesend,
        selComesendinpp,
        selComesendinp,
        selComelist,
        selComelistp,
        selHead,
        selFoot,
        selSide,
        selChli,
        selInfo,
        selVideoarea,
        selFootcome,
        selCountview;
    var alt = false;

    //投稿ボタン削除（入力欄1行化はこの下のコメ見た目のほうとoptionElementでやる）
    //後から生成される場合ここだとクラス名決め打ちになるのでcomemoduleeditorでやる
    //if (settings.isCustomPostWin) {
    //    t += '.hw_hy.HH_HR{display:none;}'
    //}
    //twtパネルのように再生成されるかもしれないのでmoduleeditorからこのoptionheadを再実行して適用させる
    if (settings.isCustomPostWin && EXcomemodule) {
        to = dl.getElementSingleSelector(EXcomemodule);
        if ($(to).length != 1) {
            console.log('?EXcomemodule ' + to);
            to = alt ? '.hw_hy.HH_HR' : '';
        }
        if (to) {
            t += to + '{display:none;}';
        }
    }

    //コメント見た目
    var bc =
        'rgba(' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        settings.commentBackTrans / 255 +
        ')'; //コメント背景色
    const cbhn =
        settings.commentBackColor > 127
            ? settings.commentBackColor - 32
            : settings.commentBackColor + 32;
    const comeBackHl =
        'rgba(' +
        cbhn +
        ',' +
        cbhn +
        ',' +
        cbhn +
        ',' +
        settings.commentBackTrans / 255 +
        ')'; //新着コメント背景色
    var cc =
        'rgba(' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        settings.commentBackColor +
        ',' +
        0.2 +
        ')';
    var rc =
        'rgba(' +
        Math.floor(255 - (255 - settings.commentTextColor) * 0.8) +
        ',' +
        Math.floor(settings.commentTextColor * 0.8) +
        ',' +
        Math.floor(settings.commentTextColor * 0.8) +
        ',' +
        settings.commentTextTrans / 255 +
        ')'; //赤系のコメント文字色(NG登録で使用)
    var tc =
        'rgba(' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextTrans / 255 +
        ')'; //コメント文字色
    var uc =
        'rgba(' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        0.1 +
        ')'; //コメント入力欄背景色
    const activeInputBack =
        'rgba(' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        0.2 +
        ')'; //コメント入力欄背景色(入力可能時)
    var vc =
        'rgba(' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        settings.commentTextColor +
        ',' +
        0.3 +
        ')'; //コメント一覧区切り線色

    t +=
        '@keyframes comebg{0%{background:' +
        comeBackHl +
        '}to{background:' +
        bc +
        '}}';
    selCome = dl.getElementSingleSelector(EXcome);
    if ($(selCome).length != 1) {
        console.log('?EXcome ' + selCome);
        selCome = alt ? '.v3_wi' : '';
    }
    if (selCome) {
        t += selCome + '{background-color:transparent;}';
        t += selCome + '>*{background-color:transparent;}';
    }

    selComesend = dl.getElementSingleSelector(EXcomesend);
    if ($(selComesend).length != 1) {
        console.log('?EXcomesend ' + selComesend);
        selComesend = alt ? '.HH_e' : '';
    }
    if (selComesend) {
        t += selComesend + '{background-color:' + bc + ';}';
    }

    selComesendinpp =
        EXcomesendinp &&
        (dl.getElementSingleSelector(EXcomesendinp.parentElement) ||
            '.' + EXcomesendinp.parentElement.classList[0]);
    if ($(selComesendinpp).not('#copyotw').length != 1) {
        console.log('?EXcomesendinp.parentElement ' + selComesendinpp);
        selComesendinpp = alt ? '.HH_HL' : '';
    }
    if (selComesendinpp) {
        t += selComesendinpp + '{background-color:' + uc + ' !important;}';
        //投稿可能時にabemaが付与すると思われるクラスがついたときは背景色を少し変える
        t +=
            '.com-o-CommentForm__can-post .com-o-CommentForm__opened-textarea-wrapper:not(#copytw){background-color:' +
            activeInputBack +
            ' !important;}';
    }

    selComesendinp = dl.getElementSingleSelector(EXcomesendinp, 2);
    if ($(selComesendinp).not('#copyot').length != 1) {
        console.log('?EXcomesendinp ' + selComesendinp);
        selComesendinp = alt ? '.HH_HN' : '';
    }
    if (selComesendinp) {
        //t += selComesendinp+'{background-color:' + uc + ';color:' + tc + ';}';
        //t += selComesendinp+'+*{background-color:' + uc + ';color:' + tc + ';}';
        //↓コメント入力欄が二重枠にならないようにtextareaとその兄弟の背景は透明にしておく
        t +=
            selComesendinp +
            ',.com-o-CommentForm__can-post .com-o-CommentForm__opened-textarea{background-color: transparent;color:' +
            tc +
            ' !important;}'; //公式標準の文字色(黒)を打ち消すため!important
        t +=
            selComesendinp +
            '+*{background-color: transparent;color:' +
            tc +
            ';}';
        t += selComesendinp + '+* span{color:' + tc + ';}';
    }

    selComelist = dl.getElementSingleSelector(EXcomelist, 0);
    if ($(selComelist).length != 1) {
        console.log('?EXcomelist ' + selComelist);
        selComelist = alt ? '.uo_e' : '';
    }
    selComelistp = EXcomelist
        ? dl.getElementSingleSelector(EXcomelist.parentElement, 0)
        : null;
    if ($(selComelistp).length != 1) {
        console.log('?EXcomelist.parent ' + selComelistp);
        selComelistp = alt ? '.Ai_Am.t7_e' : '';
    }
    if (selComelist) {
        t +=
            selComelist +
            '>div,' +
            selComelist +
            '>div[class]:first-child>div>div{background-color:' +
            bc +
            ';color:' +
            tc +
            ';animation: ' +
            (settings.highlightNewCome >= 2 ? 'none' : 'comebg 2s ease-in') +
            ' !important;}';
        t +=
            selComelist +
            '>div[data-ext-isowner="true"],' +
            selComelist +
            '>div[class]:first-child>div>div[data-ext-isowner="true"]{background-color:' +
            comeBackHl +
            ' !important;}';
        t +=
            selComelist +
            '>div>div>p>span,' +
            selComelist +
            '>div[class]:first-child>div>div>div>p>span{color:' +
            tc +
            ' !important;}'; //コメント文字色
        t +=
            selComelist +
            '>div>div,' +
            selComelist +
            '>div[class]:first-child>div>div>div{background-color: transparent !important}';
        t +=
            selComelist +
            '>div>div:hover,' +
            selComelist +
            '>div[class]:first-child>div>div>div:hover{background-color: transparent;}';
    }

    if (selComelist && selComelistp) {
        //コメ欄スクロールバー非表示
        /*if (settings.isInpWinBottom) {//コメ逆順の時は対象が逆になる
            t += selComelist+'{overflow:hidden;}';
            t += selComelistp+'{';
        } else {
            t += selComelistp+'{overflow:hidden;}';
            t += selComelist+'{';
        }*/
        t += selComelistp + '{';
        if (settings.isHideOldComment) {
            t += 'overflow:hidden;';
        } else {
            t += 'overflow-x:hidden;overflow-y:scroll;';
        }
        t += '}';

        //ユーザースクリプトのngconfigのz-index変更
        t += '#NGConfig{z-index:20;}';
        if (settings.isInpWinBottom) {
            //コメ入力欄を下
            if (selCome)
                t +=
                    selCome + '>*{display:flex;flex-direction:column-reverse;}';
            t +=
                selComelistp +
                '{display:flex;flex-direction:column;border-top:1px solid ' +
                vc +
                ';border-bottom:1px solid ' +
                vc +
                ';}';
            t +=
                selComelist +
                '{display:flex;flex-direction:column-reverse;min-height:min-content}';
            t += selComelist + '>div{overflow:visible;min-height:min-content;}'; //min-heightがないとdislay:flexで重なってしまう
            //↑の構成そのままだと各コメントのデフォ間隔padding:15px 15px 0;のtop,bottomがうまく効かなくなってしまう
            //2つめのflex(下スクロール、コメント少数時の下詰め)を解除すれば有効になるけど、下スクロールを解除したくない
            //各コメントの中身(本文、投稿時刻)にpadding設定したらうまくいった→min-height指定で不要に

            //AbemaTV Screen Comment Scrollerスクリプトのコメントグラデーションを逆向きに
            t +=
                '[data-selector="commentPane"] > div {-webkit-mask-image: linear-gradient(transparent 0%, black 50%);mask-image: linear-gradient(transparent 0%, black 50%);}';
            //新着コメントアニメーションを打ち消し
            t +=
                selComelist +
                '>div[class]:first-child>div{transform:none!important;}';
        }
        //t += selComelist+'>div{padding:0 15px;}';//公式のcssのmarginを個々のコメントのpaddingにする

        if (settings.isCommentPadZero) {
            //コメ間隔詰め
            t +=
                selComelist +
                '>div>div,' +
                selComelist +
                '>div[class]:first-child>div>div>div{padding-top:0px;padding-bottom:0px;}';
            t +=
                selComelist +
                '>div>div>*,' +
                selComelist +
                '>div[class]:first-child>div>div>div>*{margin-top:0px;margin-bottom:0px!important;}'; //bottomはあったり無かったりする(これより強い)ので付けておく
        }
        if (settings.isCommentTBorder) {
            //コメ区切り線
            t +=
                selComelist +
                '>div,' +
                selComelist +
                '>div[class]:first-child>div>div{border-top:1px solid ' +
                vc +
                ';}';
            if (settings.isInpWinBottom) {
                //先頭コメ(一番下)の下にも線を引く
                t +=
                    selComelist +
                    '>div:first,' +
                    selComelist +
                    '>div[class]:first-child>div>div:first{border-bottom:1px solid ' +
                    vc +
                    ';}';
            }
        }
        if (settings.isCommentWide) {
            //コメント部分をほんの少し広く
            t +=
                selComelist +
                '>div>div,' +
                selComelist +
                '>div[class]:first-child>div>div>div{padding-right:4px;padding-left:8px;}';
            t +=
                selComelist +
                '>div>div>p:first,' +
                selComelist +
                '>div[class]:first-child>div>div>div>p:first{width:' +
                (settings.isHideOldComment ? 258 : 242) +
                'px;}';
            //フォントによるがそれぞれ259,243でギリギリなので1だけ余裕をみる
            t += selComelist + '{margin:0;}';
        }

        if (settings.isDelTime) {
            //コメントの時刻非表示
            t += selComelist + ' time{display:none}';
        }
        if (settings.isDelOldTime || settings.isDelTime) {
            t += selComelist + '>div>div>div:nth-child(2){width:unset;}';
        }
    }

    //各パネルの常時表示 隠す場合は積極的にelement.cssに隠す旨を記述する(fade-out等に任せたり単にcss除去で済まさない)
    //もしくは常時隠して表示する場合に記述する、つまり表示切替の一切を自力でやる
    //（コメ欄常時表示で黒帯パネルの表示切替が発生した時のレイアウト崩れを防ぐため）

    selHead = dl.getElementSingleSelector(EXhead);
    if ($(selHead).length != 1) {
        console.log('?EXhead ' + selHead);
        selHead = alt ? '.P_R' : '';
    }
    if (selHead) {
        t += selHead + '{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selFoot = dl.getElementSingleSelector(EXfoot);
    if ($(selFoot).length != 1) {
        console.log('?EXfoot ' + selFoot);
        selFoot = alt ? '.v3_v_' : '';
    }
    if (selFoot) {
        t += selFoot + '{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selSide = dl.getElementSingleSelector(EXsidebtn);
    if ($(selSide).length != 1) {
        console.log('?EXsidebtn ' + selSide);
        selSide = alt ? '.v3_v5' : '';
    }
    if (selSide) {
        t += selSide + '{transform:translateY(-50%);opacity:0.5}';
    }

    selChli = dl.getElementSingleSelector(EXchli);
    if ($(selChli).length != 1) {
        console.log('?EXchli ' + selChli);
        selChli = alt ? '.v3_wk' : '';
    }
    if (selChli) {
        t += selChli + '{z-index:15;}'; //head11より上の残り時間12,13,14より上
    }

    selInfo = dl.getElementSingleSelector(EXinfo);
    if ($(selInfo).length != 1) {
        console.log('?EXinfo ' + selInfo);
        selInfo = alt ? '.v3_wg' : '';
    }
    if (selInfo) {
        t += selInfo + '{z-index:15;}';
    }

    if (selCome) t += selCome + '>div:first-child{z-index:11;}'; //foot10より上(foot内の全画面・音ボタンをマスク)
    if (selComelist) t += selComelist + '{margin:0px}';

    //左上・左下の非表示
    to = dl.getElementSingleSelector(EXvideoarea) + '>div[style^="bottom: "]';
    if (to) {
        t += to + '{z-index:8;'; //元はoverlapと同じ3 通知を受け取る
        if (settings.isHidePopBL) {
            //t += 'transform:translateX(-170px);';
            t += 'display: none;';
        }
        t += '}';
    }

    //twitter通知パネル すぐには生成されないので遅延適用するためdelaysetのループへ
    //生成されたらこのoptionheadを再実行して適用させる
    jo = getReceiveTwtElement();
    if (!jo || !((to = dl.getElementSingleSelector(jo)) && $(to).length == 1)) {
        console.log('?twtPanel');
        to = alt ? '.v3_wA' : '';
    }
    if (to) {
        t += to + '{z-index:9;'; //元が4(overlapは元3)なのでoverlapよりは上に置く
        if (settings.isHideTwitterPanel) {
            t += 'transform:translateX(-20px) translateX(-100%);';
        }
        t += '}';
    }

    selVideoarea = dl.getElementSingleSelector(EXvideoarea);
    if (document.querySelector(selVideoarea)) {
        console.log('?EXvideoarea ' + selVideoarea);
    }
    if (settings.isHidePopTL && selVideoarea) {
        //直接指定しようとするといつか出た時の短時間にgetしないといけないので映像以外を消す
        to = getVideoRouteClasses();
        if (!to[0] || !to[1]) {
            console.log('?videoRouteClass ' + to[0] + ',' + to[1]);
            to = alt ? ['.qJ_e', '.Aq_bT'] : ['', ''];
        } else to = ['.' + to[0], '.' + to[1]];
        //.Aq_Ay .Aq_AA
        if (to[0] && to[1]) {
            t += selVideoarea + '>div:not(' + to[0] + '){display:none;}';
            t += selVideoarea + '>img:not(' + to[1] + '){display:none;}';
        }
    }
    if (selVideoarea)
        t += selVideoarea + '{transition-delay:0.5s; background-color: black;}'; // onresizeで設定していたtransitionをheadに付けてみる fastrefreshでガクっとなるのを防ぐ 映像の背景を純粋な黒にする
    //アベマショッピング等で情報表示時の下のバー
    if (selVideoarea) {
        t += selVideoarea + '~div[style^="width:"]{z-index:8;}';
    }
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

    let fullscrSlector = dl.getElementSingleSelector(EXfullscr);
    if ($(fullscrSlector).length != 1) {
        console.log('?fullscreen ' + fullscrSlector);
        fullscrSlector = alt && selFoot ? selFoot + ' .mb_mi' : '';
    }
    let volumeSelector = dl.getElementSingleSelector(EXvolume);
    if ($(volumeSelector).length != 1) {
        console.log('?volume ' + volumeSelector);
        volumeSelector = alt & selFoot ? selFoot + ' .mb_mk' : '';
    }
    //全画面・音量ボタン非表示 display:noneだとホイール音量操作でスタック
    if (settings.isHideButtons) {
        if (fullscrSlector) {
            t += fullscrSlector + '{opacity:0;visibility:hidden;}';
        }
        if (volumeSelector) {
            t += volumeSelector + '{opacity:0;visibility:hidden;}';
        }
    }
    //常にコメ欄表示時、全画面・音量ボタンをずらす
    if (settings.isSureReadComment && !settings.isComeTriming) {
        if (fullscrSlector) {
            t +=
                fullscrSlector +
                `{right:${commentListWidth + fullscrRight}px;}`;
        }
        if (volumeSelector) {
            t +=
                volumeSelector + `{right:${commentListWidth + volumeRight}px;}`;
        }
    }
    //残り時間用
    const proTitleColorNum =
        settings.protitlePosition.includes('commentinput') &&
        settings.commentBackColor > 127
            ? 0
            : 255;
    const proTitleColor = `rgba(${proTitleColorNum},${proTitleColorNum},${proTitleColorNum},0.8)`;
    const proTimeColorNum =
        settings.timePosition.includes('commentinput') &&
        settings.commentBackColor > 127
            ? 0
            : 255;
    const proTimeColor = `rgba(${proTimeColorNum},${proTimeColorNum},${proTimeColorNum},0.8)`;
    const proTimeBkColor = `rgba(${proTimeColorNum},${proTimeColorNum},${proTimeColorNum},0.2)`;
    const proTimeEpColor = `rgba(${proTimeColorNum},${proTimeColorNum},${proTimeColorNum},0.3)`;

    t +=
        '#forProEndBk{padding:0px 0px;margin:4px 0px;background-color:' +
        proTimeBkColor +
        ';z-index:12!important;}';
    t +=
        '#forProEndTxt{padding:4px 5px 4px 11px;color:' +
        proTimeColor +
        ';text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t +=
        '#proTimeEpNum{padding:4px 0px;background-color:transparent;z-index:13!important;text-align:center;color:' +
        proTimeEpColor +
        ';display:flex;flex-direction:row;align-items:center;}';
    t +=
        '#tProtitle{padding:4px 8px;color:' +
        proTitleColor +
        ';text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t +=
        '#proTimeEpNum>div{border-left:1px solid ' +
        proTimeBkColor +
        ';flex:1 0 1px;}';

    selFootcome = dl.getElementSingleSelector(EXfootcome);
    if ($(selFootcome).length != 1) {
        console.log('?EXfootcome ' + selFootcome);
        selFootcome = alt ? '.iF_iT' : '';
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
    t += mc.generateCSS(false);
    //投票機能
    t += selInfo + '+div[style^="width:"]{z-index:8;'; //infoの隣でwidthがinnerWidthに直指定されてる
    if (settings.isHideVoting) {
        t += 'display:none;';
    }
    t += '}';
    //視聴数
    selCountview = dl.getElementSingleSelector(EXcountview);
    if ($(selCountview).length != 1) {
        console.log('?EXcountview ' + selCountview);
        selCountview = alt ? '.com-tv-TVFooter__view-counter' : '';
    }
    if (selCountview) {
        // t += selCountview + '{}';
    }
    //視聴数格納
    if (settings.isStoreViewCounter && selFoot) {
        //to=selCountview;
        //t += to+'{display:none;}';
        t += '#viewcounticon{vertical-align:middle;fill:#1a1a1a;}';
        t +=
            '#viewcountcont{margin-left:4px;font-size:12px;font-weight:700;vertical-align:middle;color:#1a1a1a;}';
        t +=
            '#comecountcont{margin-left:10px;font-size:18px;font-weight:700;vertical-align:middle;line-height:1.6;color:#1a1a1a;}';
        to = dl.getElementSingleSelector(EXfootcome);
        if ($(to).length != 1) {
            console.log('?EXfootcome ' + to);
            to = alt ? selFoot + ' .mb_mo' : '';
        }
        if (to) {
            t +=
                to +
                ' button{line-height:1;height:50px;padding:0px 12px;display:initial;}';
            t +=
                to +
                ' button>span:not(#viewcountcont):not(#comecountcont){display:none;}';
        }
    }
    //コメ欄常時表示時に伸張する
    if (settings.isComeTriming && settings.isSureReadComment) {
        // フッターは公式で縮むようなのでコメントアウト
        if (selHead /* && selFoot*/)
            t += selHead + /*',' + selFoot*/ +'{width:calc(100% - 310px);}';
        if (selHead) t += selHead + '>*{min-width:unset;}';
        //
    }
    //黒帯パネルの透過
    if (selHead && selFoot) {
        t +=
            selFoot +
            '>div>div:nth-child(2),' +
            selHead +
            '>nav{background:rgba(0,0,0,' +
            settings.panelOpacity / 255 +
            ')}';

        t +=
            selFoot +
            '>div>div:nth-child(2)>*,' +
            selHead +
            '>*{opacity:' +
            (settings.panelOpacity / 255 < 0.7
                ? 0.7
                : settings.panelOpacity / 255) +
            '}';
        t +=
            selFoot +
            '>div>div:nth-child(2)>div:nth-child(1):hover{background:rgba(32,32,32,' +
            settings.panelOpacity / 255 +
            ')}';
        //フッターチャンネルアイコンの背景を透過
        var selChLogoDiv = dl.getElementSingleSelector(
            $(EXfoot)
                .find('img')
                .parent()
                .get(0)
        );
        t += selChLogoDiv + '{background-color:transparent !important;}';
    }

    //番組情報のコピー置換
    if (selInfo) {
        t += selInfo + '>.originalinfo{display:none;}';
        t += selInfo + '>#copyinfo{width:100%;padding:15px;}';
    }

    let styleLink = $('head>link#extstyle');
    let dataUri = 'data:text/css,' + encodeURIComponent(t);
    if (styleLink.length === 0) {
        styleLink = $(
            "<link title='usermade' id='extstyle' rel='stylesheet' href='" +
                dataUri +
                "'>"
        ).appendTo('head');
    } else {
        styleLink.attr('href', dataUri);
    }
    console.log('setOptionHead ok');
}

function setOptionElement() {
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;

    if (settings.isCustomPostWin) {
        $(EXcomesendinp).prop('wrap', 'soft');
    } else {
        gl.isEdge || $(EXcomesendinp).prop('wrap', '');
    }
    setProSamePosiChanged();

    //    $(EXfootcome).css("pointer-events","auto");
    if (EXcomelist) {
        applyCommentListNG();
    }

    if (!settings.isStoreViewCounter)
        $(EXfootcountcome)
            .children('#viewcounticon,#viewcountcont,br,#comecountcont')
            .remove();

    // var hoverLinkClass = $(EXmenu).children('a')[0].className;
    // var hoverSpanClass = $(EXmenu)
    //     .children('a')
    //     .children('span')[0].className;
    // if ($(EXmenu).children('#extSettingLink').length == 0) {
    //     $(EXmenu)
    //         .children(':last')
    //         .css({
    //             'border-bottom': '1px solid #333',
    //             'margin-bottom': '8px',
    //             'padding-bottom': '12px'
    //         });
    //     $(EXmenu)
    //         .append(
    //             '<a class="' +
    //                 hoverLinkClass +
    //                 '" id="extSettingLink" href="' +
    //                 chrome.extension.getURL('/pages/option.html') +
    //                 '" target="_blank"><span class="' +
    //                 hoverSpanClass +
    //                 '">拡張設定</span></a>'
    //         )
    //         .append(
    //             '<a class="' +
    //                 hoverLinkClass +
    //                 '" id="extProgNotifiesLink" href="' +
    //                 chrome.extension.getURL('/pages/notifylist.html') +
    //                 '" target="_blank"><span class="' +
    //                 hoverSpanClass +
    //                 '">拡張通知登録一覧</span></a>'
    //         );
    // }
    const settingMenuHtml = `
    <li class="com-application-SideNavigationItem ext-menu-item" id="ext-menu-settings"><a href=${chrome.extension.getURL('/pages/option.html')}" target="_blank" class="com-a-Link com-a-Link--block">
        <div class="com-application-SideNavigationItemContent">
            <div class="com-application-SideNavigationItemContent__text">拡張機能設定</div>
        </div>
    </a></li>`;
        const notifyMenuHtml = `<li class="com-application-SideNavigationItem ext-menu-item" id="ext-menu-notifylist">
        <div class="com-application-CollapsibleWrapper">
            <div class="com-application-CollapsibleWrapper__inner"><a href="${chrome.extension.getURL('/pages/notifylist.html')}" target="_blank" 
                    class="com-a-Link com-a-Link--block">
                    <div class="com-application-SideNavigationItemContent">
                        <div class="com-application-SideNavigationItemContent__icon"><span
                                class="c-application-SideNavigation__footer-icon"><svg aria-label="" class="com-a-Symbol"
                                    width="100%" height="100%" role="img" focusable="false">
                                    <use xlink:href="/images/icons/mylist.svg?version=20200413#svg-body"></use>
                                </svg></span></div>
                        <div class="com-application-SideNavigationItemContent__text"  style="opacity:0;">拡張通知一覧</div>
                    </div>
                    <!--<div class="com-application-SideNavigationItemContent__sub-text">_bem_tv ext</div>-->
                </a></div>
        </div>
    </li>
    `;
        if(document.getElementsByClassName("ext-menu-item").length==0){
            EXmenu.insertAdjacentHTML("beforebegin",notifyMenuHtml);
            EXmenu.getElementsByTagName("ul")[0].insertAdjacentHTML("beforeend",settingMenuHtml);
        }

    console.log('setOptionElement ok');
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
        if (isInfoOpen(3)) {
            //console.log("panel info");
            st = panelopenset[2];
        } else if (isChliOpen(3)) {
            //console.log("panel chli");
            st = panelopenset[1];
        } else if (isComeOpen()) {
            //console.log("panel come");
            st = panelopenset[3];
        } else st = panelopenset[0];
    }
    //console.log(st);
    if (st !== undefined) {
        pophideElement({
            head: st[0] > sw ? 1 : -1,
            foot: st[1] > sw ? 1 : -1,
            side: st[2] > sw ? 1 : -1
        });
    }
}
function isFootcomeClickable() {
    //コメント数ボタンがクリックできるかどうか
    return !EXfootcountcome.disabled;
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
    console.log('comemukouClick');
    if (settings.isSureReadComment && !isFootcomeClickable()) {
        //常にコメ欄開だけど開けない状態ならoverlapはクリックさせず直接wakuclickへ移行
        usereventWakuclick();
    } else {
        //overlapをクリックしても良さそうならtrigger経由でwakuclickへ移行
        $(overlapSelector)
            .css('pointer-events', 'auto')
            .trigger('click');
    }
}
function usereventWakuclick() {
    $(overlapSelector).css('pointer-events', 'none');
    //overlapは常時pointer-events:noneにしておき、その下のcomemukoumaskをclickさせる
    //その時にoverlapをクリックしても良さそうならクリックさせてすぐ塞ぐ
    console.log('wakuclick');
    //ComeMukou時はそれぞれ解除・再適用スイッチ
    if (bginfo[2] >= 2 || bginfo[3] == 2) {
        if (settings.isCMBlack && settings.isCMBkR) {
            screenBlackSet(setBlacked[0] ? 0 : settings.isCMBkTrans ? 1 : 3);
        }
        if (settings.isCMsoundoff && settings.isCMsoundR) {
            soundSet(setBlacked[1]);
        }
        if (settings.CMsmall < 100 && settings.isCMsmlR) {
            movieZoomOut(setBlacked[2] ? 0 : 1);
        }
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
    } else {
        //コメ欄を常に表示*しない*時で画面クリックによりコメ欄を閉じた時
        if (isComeOpen()) {
            //現状コメ欄があいてる→これから閉まる
            EXfullscr.style.right = '';
            EXvolume.style.right = '';
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
    if (jo.length !== 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width())); //, parseInt(jo[0].style.height));
    }
}
function waitforResize(retrycount, jo, w) {
    //, h) {
    var jw = parseInt(jo.width());
    //var jh = parseInt(eo.style.height);
    if (w != jw) {
        // || h != jh) {
        waitingforResize = false;
        if (jw != movieWidth) {
            // || jh != movieHeight) {
            onresize();
        }
    } else if (retrycount > 0) {
        setTimeout(waitforResize, 50, retrycount - 1, jo, w); //, h);
    } else {
        waitingforResize = false;
    }
}
function usereventVolMousemove() {
    if (!EXsidebtn) return;
    $(EXsidebtn).css('transform', 'translate(50%,-50%)');
}
function usereventVolMouseout() {
    if (!EXsidebtn) return;
    $(EXsidebtn).css('transform', 'translate(0px,-50%)');
}
function usereventVolClick() {
    setTimeout(function() {
        var svgpath = $(EXvolume)
            .find('button')
            .find('use')
            .attr('xlink:href');
        if (svgpath.indexOf('volume_off') >= 0) {
            isSoundFlag = false;
        } else {
            isSoundFlag = true;
        }
    }, 100);
}
function usereventFCMouseleave() {
    //console.log("ueFCMouseleave");
    if (!EXfootcome) return;
    $(EXfootcome)
        .css('transition', '')
        .css('background-color', '');
    $('.manualblock').remove();
    $('body').css('overflow-y', '');
    if ((cmblockcd * 100) % 100 == 63) {
        bginfo[3] = 2;
        cmblockcd = 0;
        startCM();
    } else if ((cmblockcd * 100) % 100 == -63) {
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
    $(EXfootcome)
        .css('transition', '')
        .css('background-color', '');
    if ($('#manualblockrd').length == 0) {
        $('body').css('overflow-y', 'hidden');
        $(
            '<div id="manualblockrd" class="manualblock usermade"></div>'
        ).appendTo('body');
        $('#manualblockrd')
            .html('&nbsp;')
            .css('position', 'absolute')
            .css('height', '5px')
            .css('width', '5px')
            .css('bottom', 0)
            .css('right', 0)
            .css('background-color', 'magenta')
            .css('z-index', 20);
    }
}
function isFCbgColored() {
    if (Math.abs((cmblockcd * 100) % 100) == 63) {
        return true;
    }
    if (!EXfootcome) {
        return false;
    }
    var re = /^rgba?\( *(\d+) *, *(\d+) *, *(\d+) *(?:, *(\d+) *)?\)$/;
    var tar = $(EXfootcome).css('background-color');
    if (re.test(tar)) {
        var rex = re.exec(tar);
        if (
            parseInt(rex[1]) == 255 &&
            parseInt(rex[2]) == 0 &&
            parseInt(rex[3]) == 255 &&
            (rex[4] === undefined || rex[4] == 1)
        ) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
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
    if (cmblockcd != 0 && Math.abs((cmblockcd * 100) % 100) != 63) {
        if (
            $(EXfootcome).css('transition') != 'background-color 1.2s linear 0s'
        ) {
            $(EXfootcome)
                .css('transition', 'background-color 1.2s linear 0s')
                .css('background-color', 'rgb(255, 0, 255)');
            setTimeout(chkFCbgc, 1200, 5);
        }
        if (isFCbgColored()) {
            finishFCbgColored();
        }
    } else {
        $(EXfootcome)
            .css('transition', '')
            .css('background-color', '');
    }
}

function overlapTriggerClick() {
    $(overlapSelector).trigger('click');
}
function waitforComemukouEnd(url) {
    //コメ欄常時開でComeMukou中に放送中一覧を閉じた場合、overlapをクリックしないために映像縮小が解除されない
    //そのままだとComeMukouが終わっても縮小が解除されないので、ComeMukouが終わるのを待つ
    //長時間になるので無限再試行が適切に終了されるようにする
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;
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
    if (jo.length !== 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width())); //, parseInt(jo[0].style.height));
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
    if (jo.length !== 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width())); //, parseInt(jo[0].style.height));
    }
}
function delkakikomitxt(inptxt) {
    if (kakikomitxt == inptxt) {
        kakikomitxt = '';
        console.log('kakikomitxt reset: inptxt');
    }
}
function usercommentposted(inptxt) {
    console.log('usercommentposted inp=' + inptxt);
    kakikomitxt = inptxt;
    setTimeout(delkakikomitxt, 4100, inptxt);
    if (isTootEnabled) {
        // toot
        var tootText = settings.mastodonFormat;
        tootText = tootText
            .replace('{comment}', inptxt)
            .replace('{onairpage}', location.href)
            .replace(/\\n/g, '\n');
        gl.postJson(
            'https://' + settings.mastodonInstance + '/api/v1/statuses',
            { status: tootText },
            { Authorization: 'Bearer ' + settings.mastodonToken },
            function(result) {
                console.log('toot:', tootText);
            },
            function() {
                gdl.toast('Mastodon投稿エラー');
            }
        );
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
    console.log('usereventFCclick');
    if (isComeOpen()) {
        //console.log("toggleCommentList EXfootcomeclick");
        toggleCommentList();
    } else if (isFootcomeClickable()) {
        //閉じている＝これから開く
        // console.log(5731+comeRefreshing)
        if (!comeRefreshing) {
            pophideSelector(3, 0);
        }
        if (settings.isResizeScreen) {
            setTimeout(function() {
                $(EXvideoarea)
                    .width(window.innerWidth)
                    .height(window.innerHeight);
            }, 500); // コメ欄を開くと公式が映像サイズを縮めてしまうので広げ直す
        }
        // コメ欄が開かれるので全画面・音量ボタンずらす(黒帯トリミングの場合は不要)
        if (!(settings.isComeTriming && settings.isSureReadComment)) {
            EXfullscr.style.right = commentListWidth + fullscrRight + 'px';
            EXvolume.style.right = commentListWidth + volumeRight + 'px';
        }
    }
    var jo = $(getElm.getVideo());
    if (jo.length !== 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo.first(), parseInt(jo.first().width())); //, parseInt(jo[0].style.height));
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
        $(EXcomesendinp)
            .parent()
            .css('padding-top', '5px')
            .css('padding-bottom', '5px');
        /*$(EXcomesendinp).css("height", "24px")//入力欄のレイアウトが崩れるのでとりあえずコメントアウト
            .css("overflow-y", "scroll")
            .next('div').css("height", "24px")//textareaに重なっている入力内容が表示されるdiv
            .css("visibility", "hidden")
            ;*/
    } else {
        $(EXcomesendinp)
            .parent()
            .css('padding-top', '')
            .css('padding-bottom', '');
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
    if (EXcomemodule && document.body.contains(EXcomemodule)) return;
    var ret = getComeModuleElements();
    if (!ret[0] || !ret[1]) {
        console.log('retry comeModuleEditor');
        setTimeout(comeModuleEditor, 1000);
        return;
    }
    EXcomemodule = ret[0];
    var to = dl.getElementSingleSelector(ret[1]);
    if (!to) {
        console.log('?sendbtn');
        to = ''; //'.ts_jZ';
    }
    //投稿ボタンを押した時
    if (to) $(EXcomesend).on('click', to, usereventSendButClick);

    if (settings.isCustomPostWin) {
        console.log('setOptionHead comeModuleEditor');
        setOptionHead();
    }
}
function comeModuleEditorFocused() {
    // コメ入力欄フォーカス時にTwitterボタンを含む要素を取得し処理
    if (EXcometwmodule && document.body.contains(EXcometwmodule)) return;
    var ret = getComeModuleElements();
    if (!ret[2]) {
        console.log('retry comeModuleEditorFocused');
        setTimeout(comeModuleEditorFocused, 1000);
        return;
    }
    EXcometwmodule = ret[2];
    var twitterWrapper = $(ret[2]);
    if (settings.mastodonInstance && settings.mastodonToken) {
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
        twitterWrapper
            .css('float', 'left')
            .after(
                '<div class="usermade" id="mastodon-btn" style="float:left;margin-left:10px;padding:2px;cursor:pointer;background-color:#ddd;border-radius:2px;"><img src="' +
                    chrome.extension.getURL(
                        '/images/mastodon-icon' +
                            (isTootEnabled ? '-blue' : '') +
                            '.svg'
                    ) +
                    '" style="" height="25" width="25" id="mastodon-icon"></div>'
            );
        $('#mastodon-btn').click(function() {
            isTootEnabled = !isTootEnabled;
            localStorage.setItem('isTootEnabled', isTootEnabled.toString());
            $('#mastodon-icon').attr(
                'src',
                chrome.extension.getURL(
                    '/images/mastodon-icon' +
                        (isTootEnabled ? '-blue' : '') +
                        '.svg'
                )
            );
        });
    }
}
function setOptionEvent() {
    //放送画面用イベント設定
    if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;
    //自作要素のイベントは自作部分で対応
    console.log('setOptionEvent() eventAdded:', eventAdded);

    // 左メニューにマウスオーバー時のみ拡張メニューのテキスト表示
    if(EXleftMenu.getAttribute('data-ext-event-added') != 'true'){
        EXleftMenu.addEventListener("mouseover",()=>{
            Array.from(document.querySelectorAll(".ext-menu-item .com-application-CollapsibleWrapper")).forEach(e=>e.style.width='188');
            Array.from(document.querySelectorAll(".ext-menu-item .com-application-SideNavigationItemContent__text")).forEach(e=>e.style.opacity='1');
        });
        EXleftMenu.addEventListener("mouseout",()=>{
            Array.from(document.querySelectorAll(".ext-menu-item .com-application-CollapsibleWrapper")).forEach(e=>e.style.width='64');
            Array.from(document.querySelectorAll(".ext-menu-item .com-application-SideNavigationItemContent__text")).forEach(e=>e.style.opacity='0');
        });
        EXleftMenu.setAttribute('data-ext-event-added', 'true');
    }
    // Array.from(document.querySelectorAll(".ext-menu-item .com-application-SideNavigationItemContent__text")).forEach(e=>e.style.opacity='0')

    var butfs;
    var pwaku;
    if (
        (butfs = EXfullscr) == null ||
        (pwaku = $(overlapSelector)[0]) == null /* ||
        !EXcome*/
    ) {
        console.log('setOptionEvent retry');
        setTimeout(setOptionEvent, 1000);
        return;
    }
    if (pwaku.getAttribute('data-ext-event-added') != 'true') {
        pwaku.addEventListener('click', usereventWakuclick);
        //ダブルクリックでフルスクリーン
        pwaku.addEventListener('dblclick', onScreenDblClick);
        pwaku.setAttribute('data-ext-event-added', 'true');
    }

    //フルスクリーンボタンの割り当て変更
    if (butfs.getAttribute('data-ext-event-added') !== 'true') {
        butfs.addEventListener('click', function(e) {
            if (settings.isDblFullscreen) {
                toggleFullscreen();
                e.stopImmediatePropagation();
            }
        });
        butfs.setAttribute('data-ext-event-added', 'true');
    }
    //右下のコメント数表示
    if (
        EXfootcome &&
        EXfootcome.getAttribute('data-ext-event-added') !== 'true'
    ) {
        // 一覧表示切替を設置
        $(EXfootcome).on('click', usereventFCclick);
        //
        $(EXfootcome)
            //
            .on('mousemove', usereventFCMousemove)
            .on('mouseleave', usereventFCMouseleave);
        // 番組情報を開く
        $(EXfootcome)
            .parent()
            .prev()
            .on('click', usereventFootInfoButClick);
        EXfootcome.setAttribute('data-ext-event-added', 'true');
    }
    //コメ入力欄クリックでコメント一覧の表示切替
    if (
        EXcomesend &&
        EXcomesend.getAttribute('data-ext-event-added') !== 'true'
    ) {
        $(EXcomesend).on('click', function(e) {
            console.log('excomesend clicked', e.target);
            let twBtnFlag = false;
            // コメ欄入力欄をフォーカスする前に入力欄枠をクリックしてTwitterボタンのdivが反応した時に対応
            if (
                e.target.tagName.toLowerCase() === 'div' &&
                e.target.innerText.includes('連携') &&
                e.target.getBoundingClientRect().width <= 100 &&
                EXcomesendinp
            ) {
                // Twitter連携ボタンが押された
                // console.log('twbtn')
                const inprect = EXcomesendinp.getBoundingClientRect();
                if (
                    e.target.getBoundingClientRect().top <
                    inprect.top + inprect.height
                ) {
                    twBtnFlag = true;
                }
                // console.log(e.target.getBoundingClientRect().top,inprect.top , inprect.height)
            }
            if (
                (e.target.tagName.toLowerCase() === 'form' || twBtnFlag) &&
                EXcomesendinp
            ) {
                // コメント常時表示オフ時にコメント入力欄のクリックが誤爆することがあるのでフォームの周囲であるか座標判定する
                const pageX = e.originalEvent.pageX;
                const pageY = e.originalEvent.pageY;
                const formRect = EXcomesend.getBoundingClientRect();
                const formPad = 12;
                const formInnerLeft = formRect.left + formPad;
                const formInnerLeft2 = formRect.left + formRect.width - formPad;
                const formInnerTop = formRect.top + formPad;
                const formInnerTop2 = formRect.top + formRect.height - formPad;
                // console.log({pageX,pageY,formInnerLeft,formInnerLeft2,formInnerTop,formInnerTop2});
                if (
                    pageX < formInnerLeft ||
                    pageX > formInnerLeft2 ||
                    (pageY < formInnerTop || pageY > formInnerTop2)
                ) {
                    console.log(
                        'toggleCommentList EXcomesendclick' /*, e.originalEvent*/
                    );
                    toggleCommentList();
                }
            }
        });
        EXcomesend.setAttribute('data-ext-event-added', 'true');
    }
    // コメ入力欄
    if (
        EXcomesendinp &&
        EXcomesendinp.getAttribute('data-ext-event-added') !== 'true'
    ) {
        // 入力欄のすぐ周りのクリックは何もしない
        $(EXcomesendinp)
            .parent()
            .on('click', function(e) {
                if (e.target.tagName.toLowerCase() == 'div') {
                    e.stopPropagation();
                }
            });
        //投稿ボタンを押した時
        $(EXcomesendinp).on('keydown keyup', usereventSendInpKeyinput);
        //コメ入力欄がフォーカスされた時
        $(EXcomesendinp).on('focus', comeModuleEditorFocused);

        EXcomesendinp.setAttribute('data-ext-event-added', 'true');
    }
    //放送中番組一覧を開く
    if (EXsidebtn.getAttribute('data-ext-event-added') !== 'true') {
        $(EXsidebtn)
            .contents()
            .find('button')
            .eq(1)
            .on('click', usereventSideChliButClick);
        EXsidebtn.setAttribute('data-ext-event-added', 'true');
    }

    //コメ一覧をクリック時
    if (EXcome && EXcome.getAttribute('data-ext-event-added') !== 'true') {
        $(EXcome).on('click', '.ext_abm-comelist', comecopy);
        EXcome.setAttribute('data-ext-event-added', 'true');
    }
    if (EXvolume.getAttribute('data-ext-event-added') !== 'true') {
        $(EXvolume)
            .on('mousemove', usereventVolMousemove)
            .on('mouseout', usereventVolMouseout)
            .on('click', usereventVolClick);
        EXvolume.setAttribute('data-ext-event-added', 'true');
    }

    if (eventAdded) return;
    // 以下windowに対するイベント設定

    //    $(window).on("click",usereventWindowclick);
    //マウスホイール無効か音量操作
    window.addEventListener(
        'wheel',
        function(e) {
            if (
                e.target.id == 'ComeMukouMask' ||
                e.target.getAttribute('data-selector') == 'closer'
            ) {
                //AbemaTV Screen Comment Scrollerスクリプトを併用しているとdiv[data-selector=closer]な要素が上にかぶさる(data-selectorはスクリプト側による属性)
                console.log(
                    'onmousewheel on ComeMukouMask or [data-selector=closer]' // ,
                    // e
                );
                //イベントが映像上なら
                if (
                    settings.isVolumeWheel &&
                    (e.target.id == 'ComeMukouMask' ||
                        e.target.getAttribute('data-selector') == 'closer')
                ) {
                    if (
                        EXvolume &&
                        $(EXvolume)
                            .contents()
                            .find('svg')
                            .css('zoom') == '1'
                    ) {
                        otoSize(e.deltaY > 0 ? 0.8 : 1.2);
                    }
                    moVol(e.deltaY > 0 ? -5 : 5);
                }
                if (settings.isCancelWheel || settings.isVolumeWheel) {
                    //設定ウィンドウ反映用
                    //console.log("cancelling wheel")
                    e.stopImmediatePropagation();
                }
            }
        },
        true
    );
    window.addEventListener('mousemove', usereventMouseover, true);
    window.addEventListener('keydown', usereventMouseover, true); //コメント入力時などキー入力時もマウスが動いたのと同じ扱いにしてelementをhideするカウントダウンをさせない
    window.addEventListener(
        'keydown',
        function(e) {
            //console.log(e)
            if (e.keyCode == 13) {
                //enter
                usereventSendButClick();
            } else if (e.keyCode == 38 || e.keyCode == 40) {
                //38^ 40v
                if (settings.isCancelWheel || settings.isVolumeWheel) {
                    e.stopPropagation();
                }
            } else if (popacti && e.keyCode == 39) {
                //39>
                popinput.push(e.keyCode);
                if (popinput.toString().indexOf(popCodes) == 0) {
                    for (var i = 0; i < 4; i++) {
                        panelopenset[i][2] = 2;
                    }
                    pophideSelector(-1, 0);
                    popinput = [];
                } else {
                    while (
                        popinput.length > 0 &&
                        popCodes.indexOf(popinput.toString()) != 0
                    ) {
                        if (popinput.length > 1) {
                            popinput.shift();
                        } else {
                            popinput = [];
                        }
                    }
                }
            } else if (
                e.keyCode == 17 &&
                ((e.location == 1 && settings.isManualKeyCtrlL) ||
                    (e.location == 2 && settings.isManualKeyCtrlR))
            ) {
                //17ctrl
                if (cmblockcd != 0) {
                    if (cmblockcd > 0) {
                        cmblockcd = 1.73;
                    } else if (cmblockcd < 0) {
                        cmblockcd = -1.73;
                    }
                    var posi = '';
                    if (e.location == 1 && settings.isManualKeyCtrlL) {
                        posi = 'left';
                    } else if (e.location == 2 && settings.isManualKeyCtrlR) {
                        posi = 'right';
                    }
                    if (posi != '' && $('#manualblock' + posi).length == 0) {
                        $('body').css('overflow-y', 'hidden');
                        $(
                            '<div id="manualblock' +
                                posi +
                                '" class="manualblock usermade"></div>'
                        ).appendTo('body');
                        $('#manualblock' + posi)
                            .html('&nbsp;')
                            .css('position', 'absolute')
                            .css('height', '5px')
                            .css('width', '5px')
                            .css('bottom', 0)
                            .css(posi, 0)
                            .css('background-color', 'magenta')
                            .css('z-index', 20);
                    }
                }
            }
        },
        true
    );
    window.addEventListener(
        'keyup',
        function(e) {
            keyinput.push(e.keyCode);
            if (keyinput.toString().indexOf(keyCodes) == 0) {
                $('#CommentMukouSettings').show();
                keyinput = [];
            } else {
                while (
                    keyinput.length > 0 &&
                    keyCodes.indexOf(keyinput.toString()) != 0
                ) {
                    if (keyinput.length > 1) {
                        keyinput.shift();
                    } else {
                        keyinput = [];
                    }
                }
            }
            if (
                e.keyCode == 17 &&
                ((e.location == 1 && settings.isManualKeyCtrlL) ||
                    (e.location == 2 && settings.isManualKeyCtrlR))
            ) {
                if (cmblockcd == 0) {
                } else if ((cmblockcd * 100) % 100 == 73) {
                    bginfo[3] = 2;
                    cmblockcd = 0;
                    startCM();
                } else if ((cmblockcd * 100) % 100 == -73) {
                    bginfo[3] = 0;
                    cmblockcd = 0;
                    endCM();
                }
                $('.manualblock').remove();
                $('body').css('overflow-y', '');
            }
        },
        true
    );

    eventAdded = true;
    console.log('setOptionEvent()');
}
export function startCM() {
    console.log('startCM');
    if (settings.isCMBlack) {
        screenBlackSet(settings.isCMBkTrans ? 1 : 3);
    }
    if (settings.isCMsoundoff) {
        soundSet(false);
    }
    if (settings.CMsmall < 100) {
        movieZoomOut(1);
    }
}
export function endCM() {
    console.log('endCM');
    if (bginfo[1].length == 2) return;
    if (settings.isCMBlack) {
        screenBlackSet(0);
    }
    if (settings.isCMsoundoff) {
        soundSet(true);
    }
    if (settings.CMsmall < 100) {
        movieZoomOut(0);
    }
}
export function tryCM(retrycount) {
    if (isFootcomeClickable()) {
        bginfo[2] = 0;
        if ((cmblockcd * 100) % 10 != -3) {
            cmblockcd = 0;
            endCM();
        }
    } else if (retrycount > 0) {
        setTimeout(tryCM, 500, retrycount - 1);
    }
}
function fastEyecatching(retrycount) {
    //console.log("fastEyecatch#"+retrycount);
    if ($('.manualblock').length > 0 || retrycount <= 0) {
        eyecatcheck = false;
        return;
    } //手動対応を優先
    if (EXvideoarea.childElementCount > 4 && retrycount > 0) {
        setTimeout(fastEyecatching, 100, retrycount - 1);
    } else {
        //eyecatch消失
        eyecatcheck = false;
        if (!isFootcomeClickable()) {
            //isNaN(parseInt($(EXfootcountcome).text()))
            bginfo[3] = 2;
            cmblockcd = 0;
            startCM();
        }
    }
}
function comehl(jo, hlsw) {
    hlsw = parseInt(hlsw);
    // console.log('comehl',jo,hlsw)
    var hlbc = settings.commentBackColor;
    var hlbt = settings.commentBackTrans;
    var hlc = parseInt(settings.highlightComeColor);
    var hlp = settings.highlightComePower;
    if ($('#settcont').css('display') != 'none') {
        hlbc = parseInt($('#commentBackColor').val());
        hlbt = parseInt($('#commentBackTrans').val());
        hlc = parseInt(
            $('input[type="radio"][name="highlightComeColor"]:checked').val()
        );
        hlp = parseInt($('#highlightComePower').val());
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
            jo.children()
                .css(
                    'padding-left',
                    (settings.isCommentWide ? 8 : 15) - 4 + 'px'
                )
                .css(
                    'border-left',
                    '4px solid rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.6)'
                )
                .css('transition', '');
            break;
        case 3:
            jo.children()
                .css(
                    'padding-left',
                    (settings.isCommentWide ? 8 : 15) - 4 + 'px'
                )
                .css(
                    'border-left',
                    '4px solid rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.8)'
                )
                .css('transition', '');
        case 2:
            var p = hlp / 100; //bの割合
            //            var c=[255,255,0,255]; //yellow
            var r = hlbc + Math.floor((c[0] - hlbc) * p);
            var g = hlbc + Math.floor((c[1] - hlbc) * p);
            var b = hlbc + Math.floor((c[2] - hlbc) * p);
            var a = hlbt + Math.floor((c[3] - hlbt) * p);
            jo.css(
                'background-color',
                'rgba(' + r + ',' + g + ',' + b + ',' + a / 255 + ')'
            )
                .css('transition', '')
                .attr(
                    'data-test-hl',
                    'rgba(' + r + ',' + g + ',' + b + ',' + a / 255 + ')'
                );
            break;
        default:
    }
    setTimeout(
        function(jo) {
            //console.log(jo)
            for (var i = jo.length - 1, j = 0; i >= 0; i--, j++) {
                //console.log(jo,i)
                switch (hlsw) {
                    case 1:
                        jo.eq(i)
                            .children()
                            .css(
                                'border-left-color',
                                'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
                            )
                            .css(
                                'transition',
                                'border-left-color 1s linear ' +
                                    (3 + 0.02 * j) +
                                    's'
                            );
                        break;
                    case 2:
                        jo.eq(i)
                            .css(
                                'background-color',
                                'rgba(' +
                                    hlbc +
                                    ',' +
                                    hlbc +
                                    ',' +
                                    hlbc +
                                    ',' +
                                    hlbt / 255 +
                                    ')'
                            )
                            .css(
                                'transition',
                                'background-color 1s linear ' +
                                    (3 + 0.02 * j) +
                                    's'
                            );
                        break;
                    case 3:
                        jo.eq(i)
                            .children()
                            .css(
                                'border-left-color',
                                'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)'
                            )
                            .css(
                                'transition',
                                'border-left-color 1s linear ' +
                                    (3 + 0.02 * j) +
                                    's'
                            );
                        jo.eq(i)
                            .css(
                                'background-color',
                                'rgba(' +
                                    hlbc +
                                    ',' +
                                    hlbc +
                                    ',' +
                                    hlbc +
                                    ',' +
                                    hlbt / 255 +
                                    ')'
                            )
                            .css(
                                'transition',
                                'background-color 1s linear ' +
                                    (2 + 0.02 * j) +
                                    's'
                            );
                        break;
                    default:
                }
            }
        },
        0,
        jo
    );
}

var comeUserHlInterval = null;
function comeUserHighlight(jo) {
    function userHl(e) {
        var j = $(e);
        var uid = j.attr('data-ext-userid') || '';
        //var opacity = settings.commentTextTrans/255;
        //console.log('mov',e,j,uid);
        const defaultcss = j.children().attr('style');
        if (uid.length > 0) {
            //console.log(j.siblings('[data-ext-userid='+uid+']'))
            let hlelem = j.siblings('[data-ext-userid=' + uid + ']').children();
            hlelem.css({
                cssText:
                    defaultcss +
                    'background-color:rgba(255,255,0,0.6) !important;'
            });
            j.siblings(':not([data-ext-userid=' + uid + '])')
                .children()
                .css('background-color', '');
        }
        j.children().css({
            cssText:
                defaultcss + 'background-color:rgba(255,255,0,0.6) !important;'
        });
    }
    const firstClass = jo.first().attr('class');
    if (
        firstClass &&
        comelistClasses.animated &&
        firstClass.includes(comelistClasses.animated)
    ) {
        jo = jo.slice(1); //先頭要素が新着アニメーションなら飛ばす
    }
    $(jo).mouseover(function(e) {
        if (comeUserHlInterval !== null) {
            clearInterval(comeUserHlInterval);
            comeUserHlInterval = null;
        }
        userHl(e.currentTarget);
        comeUserHlInterval = setInterval(userHl, 1000, e.currentTarget);
    });
    $(jo).mouseout(function(e) {
        var j = $(e.currentTarget);
        var uid = j.attr('data-ext-userid') || '';
        //console.log('mou',e,uid);
        //if(uid.length>0){
        //    j.siblings('[data-ext-userid='+uid+']').css('background-color', '');
        //}else{
        j.siblings()
            .children()
            .css('background-color', '');
        //}
        j.children().css('background-color', '');
        clearInterval(comeUserHlInterval);
        comeUserHlInterval = null;
    });
}

function getComeInfo(wdiv) {
    var uid = $(wdiv).attr('data-ext-userid');
    var div = $(wdiv)
        .children()
        .eq(0);
    var msg = div.children('p').text();
    var timeElem = div.children('div').children('time');
    var timeStr = timeElem.text();
    var datetime = timeElem.attr('datetime');
    var mwidth = div.children('p').css('width');
    if (!datetime) {
        var nt = Date.now();
        var rn = /^今$/;
        var rs = /^(\d+) *秒前$/;
        var rm = /^(\d+) *分前$/;
        if (rn.test(timeStr)) {
            datetime = nt;
        } else if (rs.test(timeStr)) {
            datetime = nt - +rs.exec(timeStr)[1] * 1000;
        } else if (rm.test(timeStr)) {
            datetime = nt - +rm.exec(timeStr)[1] * 60000;
        }
    }
    return { message: msg, datetime: datetime, timeStr: timeStr, userid: uid };
}
function applyCommentListNG(d) {
    if (!EXcomelist) return;
    let commentDivs = EXcomelist.children;
    if (
        comelistClasses.progress &&
        commentDivs[0].className.includes(comelistClasses.progress)
    ) {
        console.log('skip applyCommentListNG: progress');
        return;
    }
    if (d === undefined || d < 0) {
        d = commentDivs.length;
        console.log('applyCommentListNG: all');
    }
    for (let i = commentDivs.length - d; i < commentDivs.length; i++) {
        if (!commentDivs[i])
            console.warn('applyCommentListNG: invalid index', i, commentDivs);
        if (
            d < commentDivs.length &&
            commentDivs[i].getAttribute('data-ext-filtered') == 'true'
        )
            continue;
        commentDivs[i].setAttribute('data-ext-filtered', 'true');
        let cinfo = getComeInfo(commentDivs[i]);
        let filteredComment = gcl.comefilter(
            cinfo.message,
            cinfo.userid,
            arFullNg,
            arUserNg,
            settings.isComeDel,
            settings.isUserDel,
            settings.isComeNg,
            settings.isDeleteStrangeCaps
        );
        //commentDivs[i].classList.add('comew');
        if (
            !(
                commentDivs[i].firstElementChild &&
                commentDivs[i].firstElementChild.getElementsByTagName('p')[0] &&
                commentDivs[i].firstElementChild
                    .getElementsByTagName('p')[0]
                    .getElementsByTagName('span')[0]
            )
        ) {
            console.warn(
                'applyCommentListNG: could not find message span',
                commentDivs[i]
            );
            return;
        }
        if (filteredComment != '') {
            commentDivs[i].firstElementChild
                .getElementsByTagName('p')[0]
                .classList.add('comem');
            commentDivs[i].firstElementChild
                .getElementsByTagName('p')[0]
                .getElementsByTagName('span')[0].innerText = filteredComment;
            commentDivs[i].setAttribute('data-ext-ngcomment', 'false');
        } else {
            commentDivs[i].setAttribute('data-ext-ngcomment', 'true');
        }
    }
}
// コメ欄クリック時に呼び出され、NGワード追加画面表示
function comecopy() {
    console.log('comecopy');
    if (!settings.isComelistClickNG) return;
    var jo = $('.comem');
    if (jo.length == 0) return;

    //var eo = jo[0];
    var r = /rgba?\((\d+), (\d+), (\d+)(, \d?(?:\.\d+)?)?\)/;
    var s = '';
    var uid = '';
    for (
        var i = 0, e, c, t;
        (e = jo.eq(i)) && (c = e.css('color')) && r.test(c);
        i++
    ) {
        //c = $(e.children[0]).css("color");
        //if (r.test(c)) {
        t = r.exec(c);
        if (t[2] == t[3] && +t[1] > +t[2]) {
            s = e.text();
            uid =
                e
                    .parent()
                    .parent()
                    .attr('data-ext-userid') || '';
            break;
            //}
        }
    }
    if (s.length > 0) {
        if ($('#copyotw').length == 0) {
            let t =
                '<div id="copyotw" class="' +
                $(EXcomesendinp.parentElement).attr('class') +
                ' usermade" style="padding:5px 28px 30px 18px;">';
            t +=
                '<a style="position:absolute;top:10px;left:1px;cursor:pointer;"><svg id="closecopyotw" class="usermade" width="16" height="16" style="fill:rgba(255,255,255,0.5);"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/images/icons/close.svg#svg-body"></use></svg></a>';
            t += '<input type="hidden" id="copyotu" value="">';
            t +=
                '<textarea id="copyot" class="' +
                $(EXcomesendinp).attr('class') +
                '" rows="1" maxlength="100" wrap="soft" style="height:24px;width:248px;padding-left:4px;border: black solid 1px;"></textarea>';
            t += '<div style="height:24px;pointer-events:none;">　</div>';
            t +=
                '<a id="textNG" style="position:absolute;top:6px;right:1px;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);padding:0px 1px;letter-spacing:1px;cursor:pointer;">NG</a>';
            t += '<div style="position:absolute;top:32px;right:1px;">';
            t += '<span id="copyotuDisp"></span>';
            t +=
                '<a id="useridNG" style="color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);padding:0px 1px;letter-spacing:1px;cursor:pointer;margin:1px;">ユーザーNG</a>';
            t += '</div></div>';
            $(t).insertAfter(EXcomesendinp.parentElement);
            $('#closecopyotw')
                .parent('a')
                .on('click', closecotwclick);
            $('#textNG').on('click', appendTextNG);
            $('#useridNG').on('click', appendUserNG);
        } else {
            $('#copyotw')
                .insertAfter(EXcomesendinp.parentElement) //#copyotw作成後に投稿ボタン等が生成された場合の順序修正
                .css('display', '');
        }
        $(EXcomesendinp.parentElement).css('display', 'none');
        $(EXcomesend).css('padding-left', '0px');
        $('#copyot').val(s);
        $('#copyotu').val(uid) || '';
        var co = $(EXcomesendinp).css('color');
        $('#textNG,#useridNG')
            .css('color', co)
            .css('border-color', co);
        $('#closecopyotw').css('fill', co);
        $('#copyotuDisp')
            .text('ID: ' + uid + ' ')
            .css('color', co);
        paintcopyot(1);
        paintcopyotw(1);
    }
    comeNGmode = 0;
}
function paintcopyot(mode) {
    //mode 0:色除去 1:青 2:黄 3:赤
    if ($('#copyot').length == 0) return;
    if (mode == 0) {
        $('#copyot').css('color', '');
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
    var r = /rgba?\( *(\d+), *(\d+), *(\d+)(?:, *(\d?(?:\.\d+)?))? *\)/;
    var c = $(EXcomesendinp).css('color');
    if (r.test(c)) {
        var t = r.exec(c);
        const color =
            'rgba(' +
            Math.floor(a[0] - (a[0] - +t[1]) * p) +
            ',' +
            Math.floor(a[1] - (a[1] - +t[2]) * p) +
            ',' +
            Math.floor(a[2] - (a[2] - +t[3]) * p) +
            ',' +
            (t[4] || '1') +
            ')';
        const copyot = document.getElementById('copyot');
        copyot.style.color = color;
    }
}
function paintcopyotw(mode) {
    //mode 0:色除去 1:青 2:黄 3:赤
    if ($('#copyotw').length == 0) return;
    if (mode == 0) {
        $('#copyotw').css('background-color', '');
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
    var r = /rgba?\( *(\d+), *(\d+), *(\d+)(?:, *(\d?(?:\.\d+)?))? *\)/;
    var b = $(EXcomesendinp.parentElement).css('background-color');
    if (r.test(b)) {
        var t = r.exec(b);
        const bgstyle =
            'rgba(' +
            Math.floor(a[0] - (a[0] - +t[1]) * p) +
            ',' +
            Math.floor(a[1] - (a[1] - +t[2]) * p) +
            ',' +
            Math.floor(a[2] - (a[2] - +t[3]) * p) +
            ',' +
            (t[4] || '1') +
            ')';
        const copyotw = document.getElementById('copyotw');
        copyotw.style.cssText += `background-color:${bgstyle} !important;`;
    }
}
export function appendTextNG(ev, inpstr) {
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
        spfullng[ngi] = spfullng[ngi].replace(/\/\/.*$/, ''); //文中コメントを除去
        for (ngsi = 0; ngsi < strArr.length; ngsi++) {
            if (strArr[ngsi] == spfullng[ngi]) {
                b = false;
                break;
            }
        }
    }
    if (b) {
        //既存のfullNgに無い場合のみ追加
        for (ngsi = 0; ngsi < strArr.length; ngsi++) {
            if (/\r|\n/.test(settings.fullNg[settings.fullNg.length - 1])) {
                settings.fullNg += strArr[ngsi];
            } else {
                settings.fullNg += '\n' + strArr[ngsi];
            }
        }

        gcl.arrayFullNgMaker(arFullNg, settings.fullNg, settings.isShareNGword);
        applyCommentListNG();
    }
    if (inpstr === undefined) {
        if (settings.isComeClickNGautoClose) {
            $('#closecopyotw')
                .parent('a')
                .css('pointer-events', 'none')
                .css('visibility', 'hidden');
        }
        //NGボタン押下1回目(一時登録)は黄色
        paintcopyot(2);
        paintcopyotw(2);
        setTimeout(copyotuncolor, 800, 1);
    }
}
function appendUserNG(ev, inpstr) {
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
        spuserng[ngi] = spuserng[ngi].replace(/\/\/.*$/, ''); //文中コメントを除去
        for (ngsi = 0; ngsi < uidArr.length; ngsi++) {
            if (uidArr[ngsi] == spuserng[ngi]) {
                b = false;
                //console.log('apUsNg already added', uidArr,ngsi,spuserng,ngi)
                break;
            }
        }
    }
    if (b) {
        //既存のuserNgに無い場合のみ追加
        for (ngsi = 0; ngsi < uidArr.length; ngsi++) {
            if (/\r|\n/.test(settings.userNg[settings.fullNg.length - 1])) {
                settings.userNg += uidArr[ngsi];
            } else {
                settings.userNg += '\n' + uidArr[ngsi];
            }
        }
        console.log('apUsNg append');
        gcl.arrayUserNgMaker(arUserNg, settings.userNg);
        if (settings.isShareNGuser) {
            gcl.postShareNGusers(arUserNg, getInfo.getChannelByURL());
        }
        applyCommentListNG();
    }
    if (inpstr === undefined) {
        if (settings.isComeClickNGautoClose) {
            $('#closecopyotw')
                .parent('a')
                .css('pointer-events', 'none')
                .css('visibility', 'hidden');
        }
        //NGボタン押下1回目(一時登録)は黄色
        paintcopyot(2);
        paintcopyotw(2);
        setTimeout(copyotuncolor, 800, 1);
    }
}
function sharedNGappender(word, userid) {
    if (settings.isShareNGword) {
        appendTextNG(null, word);
    }
    if (settings.isShareNGuser) {
        appendUserNG(null, userid);
    }
}
export function addPermanentNG(word, userid) {
    //既存の(一時保存済の)fullNgをそのままsetStorageすると、一時保存したが永久保存しなかった単語まで永久保存されてしまうので、
    //storageから持ってきて追加、setStorageする
    //console.log('addPermanentNG',word,userid)
    var PfullNg, PuserNg;
    gl.getStorage(null, function(value) {
        var b = true;
        PfullNg = value.fullNg || settings.fullNg;
        PuserNg = value.userNg || settings.userNg;
        var spPfullng = PfullNg.split(/\r|\n|\r\n/);
        var spPuserng = PuserNg.split(/\r|\n|\r\n/);
        if (word) {
            for (let ngi = 0; ngi < spPfullng.length; ngi++) {
                if (
                    spPfullng[ngi].length == 0 ||
                    spPfullng[ngi].match(/^\/\//)
                ) {
                    continue;
                }
                spPfullng[ngi] = spPfullng[ngi].replace(/\/\/.*$/, ''); //文中コメントを除去
                if (word == spPfullng[ngi]) {
                    b = false;
                    break;
                }
            }
            if (b) {
                //storage内のfullNgに無い場合のみ追加
                if (/\r|\n/.test(PfullNg[settings.fullNg.length - 1])) {
                    PfullNg += word;
                } else {
                    PfullNg += '\n' + word;
                }
                gl.setStorage({
                    fullNg: PfullNg
                });
            }
        }
        b = true;
        if (userid) {
            for (let ngi = 0; ngi < spPuserng.length; ngi++) {
                if (
                    spPuserng[ngi].length == 0 ||
                    spPuserng[ngi].match(/^\/\//)
                ) {
                    continue;
                }
                spPuserng[ngi] = spPuserng[ngi].replace(/\/\/.*$/, ''); //文中コメントを除去
                if (userid == spPuserng[ngi]) {
                    b = false;
                    break;
                }
            }
            if (b) {
                //storage内のfullNgに無い場合のみ追加
                if (/\r|\n/.test(PuserNg[settings.userNg.length - 1])) {
                    PuserNg += userid;
                } else {
                    PuserNg += '\n' + userid;
                }
                gl.setStorage({
                    userNg: PuserNg
                });
            }
        }
    });
}
function appendNGpermanent(sw) {
    //sw= 1:ワード 2=ユーザーID
    console.log('appendNGpermanent', sw);
    comeNGmode = 2;
    $('#textNG,#useridNG').css('pointer-events', 'none');
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
    } else if (sw == 2) {
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
    $('#copyot').val('');
    $('#textNG,#useridNG').css('pointer-events', '');
    paintcopyot(1);
    paintcopyotw(1);
    if (settings.isComeClickNGautoClose) {
        $('#closecopyotw')
            .parent('a')
            .css('pointer-events', '')
            .css('visibility', '');
        closecotwclick();
    }
}
function closecotwclick() {
    $('#copyotw').css('display', 'none');
    $(EXcomesendinp.parentElement).css('display', '');
    $(EXcomesend).css('padding-left', '');
}

export function onairfunc() {
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
    if (settings.isShareNGword || settings.isShareNGuser) {
        setTimeout(gcl.applySharedNG, 1000, sharedNGappender);
    }
    if (settings.mastodonInstance && settings.mastodonToken) {
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
    }
    //何らかの不具合で放送ページに推移したのに放送画面が構築されない場合は5秒待って再読み込み
    setTimeout(function() {
        if (getInfo.determineUrl() !== getInfo.URL_ONAIR) return;
        if (previousLocation.indexOf('now-on-air') >= 0) return;
        if (!EXfoot && !EXcome && !EXsidebtn) location.href = location.href;
    }, 5000);
}
//    setInterval(function () {
function onairBasefunc() {
    //console.log("1s");
    //console.time('onairbasefunc');
    try {
        //console.time('obf_1');
        let isResetHead = false;
        let isResetEvent = false;
        if (getInfo.determineUrl() !== getInfo.URL_ONAIR) {
            clearInterval(onairRunning);
            onairRunning = false;
            return;
        }

        // 1秒ごとに実行
        if (!EXfoot || !document.body.contains(EXfoot)) {
            EXfoot = getElm.getFooterElement();
            if (EXfoot) {
                dl.addExtClass(EXfoot, 'foot');
                isResetHead = true;
                isResetEvent = true;
            }
        }

        if (!EXfootcome || !document.body.contains(EXfootcome)) {
            EXfootcome = getFootcomeElement();
            if (EXfootcome) {
                dl.addExtClass(EXfootcome, 'footcome');
                isResetHead = true;
            }
        }
        if (!EXfootcountcome || !document.body.contains(EXfootcountcome)) {
            EXfootcountcome = getFootcomeBtnElement();
            if (EXfootcountcome) {
                dl.addExtClass(EXfootcountcome, 'footcountcome');
                isResetHead = true;
            }
        }
        if (
            !EXvideoarea ||
            document.getElementsByClassName('ext_abm-videoarea').length === 0
        ) {
            if (!EXvideoarea || !document.body.contains(EXvideoarea)) {
                EXvideoarea = getElm.getVideoAreaElement();
            }
            if (EXvideoarea) {
                dl.addExtClass(EXvideoarea, 'videoarea');
                resizeObserver.disconnect();
                resizeObserver.observe(EXvideoarea, {
                    attributes: true,
                    attributeFilter: ['style']
                });
                setTimeout(onresize, 1000);
            }
        }

        // コメント周りの要素について存在チェック&再取得
        // EXcomesendとEXcomeの取得はEXcomesendinpに、EXcomelistの取得はEXcomeに依存しているためcomesendinp->comesend,come->comelistの順に取得する
        if (!EXcomesendinp || !document.body.contains(EXcomesendinp)) {
            EXcomesendinp = getComeFormElement(0);
            if (EXcomesendinp) {
                dl.addExtClass(EXcomesendinp, 'comesendinp');
                isResetHead = true;
                isResetEvent = true;
            }
        }
        if (!EXcomesend || !document.body.contains(EXcomesend)) {
            EXcomesend = getComeFormElement(1);
            if (EXcomesend) {
                dl.addExtClass(EXcomesend, 'comesend');
                isResetHead = true;
                isResetEvent = true;
                comeModuleEditor();
            }
        }
        if (!EXcome || !document.body.contains(EXcome)) {
            EXcome = getComeFormElement(2);
            if (EXcome) {
                dl.addExtClass(EXcome, 'come');
                isResetHead = true;
                isResetEvent = true;
            }
        }
        if (
            EXcome &&
            document.getElementsByClassName('ext_abm-come').length == 0
        ) {
            dl.addExtClass(EXcome, 'come');
        }
        if (!EXcomelist || !document.body.contains(EXcomelist)) {
            EXcomelist = getComeListElement();
            if (EXcomelist) {
                // console.log('ecl', EXcomelist, $('body').has(EXcomelist).length==0)
                dl.addExtClass(EXcomelist, 'comelist');
                isResetHead = true;
                window.dispatchEvent(comelistReadyEvent);
                commentObserver.disconnect();
                commentObserver.observe(EXcomelist, { childList: true });
            }
        }
        if (
            EXcomelist &&
            document.getElementsByClassName('ext_abm-comelist').length == 0
        ) {
            dl.addExtClass(EXcomelist, 'comelist');
        }

        if (!EXinfo || !document.body.contains(EXinfo)) {
            EXinfo = getInfoElement();
            if (EXinfo) {
                dl.addExtClass(EXinfo, 'info');
                EXcome = null;
                EXcomesend = null;
                EXcomesendinp = null;
                EXchli = null;
                isResetHead = true;
            }
        }
        if (!EXvolume || !document.body.contains(EXvolume)) {
            EXvolume = getElm.getVolElement();
            dl.addExtClass(EXvolume, 'volume');
        }

        if (isResetHead) setOptionHead();
        if (isResetEvent) setOptionEvent();

        //        //映像のtopが変更したらonresize()実行
        //        if(settings.isResizeScreen && $("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        //        if($("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        var jo = $(getElm.getVideo());
        //.resize-screenに設定されるwidth,heightをトリガーにする
        if (
            jo.length !== 0 &&
            movieWidth != parseInt(jo.first().width()) &&
            !isNowResizing
        ) {
            // || movieHeight != parseInt(jo[0].style.height))) {
            // onresize();
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

        mc.intervalFunction();
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
            if (
                settings.isCMBlack ||
                settings.isCMsoundoff ||
                settings.CMsmall < 100
            ) {
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
            isComeLatestClickable = isComeClickable;
        }
        if (settings.useEyecatch) {
            //if ((EXwatchingnum !== undefined) && settings.useEyecatch) {
            //if ($(EXobli).find("object,video").first().parentsUntil(EXobli).last().children().length > 3) {
            if (EXvideoarea.childElementCount > 4) {
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

        //残り時間取得
        if (EXinfo) {
            var eProTime = $(EXinfo)
                .children('div:not(#copyinfo)')
                .find('h2')
                .nextAll()
                .eq(1);
            //            var reProTime = /(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*\~[　 ]*(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var reProTime = /(?:(\d{1,2})[　 ]*[月/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（(][月火水木金土日][）)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*[~～〜\-－][　 ]*(?:(\d{1,2})[　 ]*[月/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（(][月火水木金土日][）)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var arProTime;
            if (
                eProTime.length > 0 &&
                (arProTime = reProTime.exec(eProTime[0].textContent)) != null
            ) {
                //番組開始時刻を設定
                if (
                    arProTime[1] &&
                    1 <= parseInt(arProTime[1]) &&
                    parseInt(arProTime[1]) <= 12
                ) {
                    proStart.setMonth(parseInt(arProTime[1]) - 1);
                }
                if (
                    arProTime[2] &&
                    1 <= parseInt(arProTime[2]) &&
                    parseInt(arProTime[2]) <= 31
                ) {
                    proStart.setDate(parseInt(arProTime[2]));
                }
                if (
                    arProTime[3] &&
                    0 <= parseInt(arProTime[3]) &&
                    parseInt(arProTime[3]) <= 47
                ) {
                    if (parseInt(arProTime[3]) < 24) {
                        proStart.setHours(parseInt(arProTime[3]));
                    } else {
                        proStart.setHours(parseInt(arProTime[3]) - 24);
                        proStart = new Date(
                            proStart.getTime() + 24 * 60 * 60 * 1000
                        );
                    }
                }
                if (
                    arProTime[4] &&
                    0 <= parseInt(arProTime[4]) &&
                    parseInt(arProTime[4]) <= 59
                ) {
                    proStart.setMinutes(parseInt(arProTime[4]));
                }
                proStart.setSeconds(0);
                //番組終了時刻を設定
                if (
                    arProTime[5] &&
                    1 <= parseInt(arProTime[5]) &&
                    parseInt(arProTime[5]) <= 12
                ) {
                    proEnd.setMonth(parseInt(arProTime[5]) - 1);
                }
                if (
                    arProTime[6] &&
                    1 <= parseInt(arProTime[6]) &&
                    parseInt(arProTime[6]) <= 31
                ) {
                    proEnd.setDate(parseInt(arProTime[6]));
                }
                if (
                    arProTime[7] &&
                    0 <= parseInt(arProTime[7]) &&
                    parseInt(arProTime[7]) <= 47
                ) {
                    if (parseInt(arProTime[7]) < 24) {
                        proEnd.setHours(parseInt(arProTime[7]));
                    } else {
                        proEnd.setHours(parseInt(arProTime[7]) - 24);
                        proEnd = new Date(
                            proEnd.getTime() + 24 * 60 * 60 * 1000
                        );
                    }
                }
                if (
                    arProTime[8] &&
                    0 <= parseInt(arProTime[8]) &&
                    parseInt(arProTime[8]) <= 59
                ) {
                    proEnd.setMinutes(parseInt(arProTime[8]));
                }
                proEnd.setSeconds(0);
            }
        }
        // 残り時間表示
        if (settings.isTimeVisible) {
            //console.log(eProTime, arProTime, proStart, proEnd)
            var forProEnd = proEnd.getTime() - Date.now(); //番組の残り時間
            var proLength = proEnd.getTime() - proStart.getTime(); //番組の全体長さ
            var strProEnd = Math.floor(forProEnd / 1000);
            if (forProEnd > 0) {
                //                strProEnd = (("0"+Math.floor(forProEnd/3600000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%3600000)/60000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%60000)/1000)).slice(-2)).replace(/^00?( : )?0?0?( : )?0?/,"");
                strProEnd = (
                    ('0' + Math.floor(forProEnd / 3600000)).slice(-2) +
                    '：' +
                    ('0' + Math.floor((forProEnd % 3600000) / 60000)).slice(
                        -2
                    ) +
                    '：' +
                    ('0' + Math.floor((forProEnd % 60000) / 1000)).slice(-2)
                ).replace(/^[0：]*/, '');
            }
            if (!$('#forProEndTxt').is('.vol')) {
                $('#forProEndTxt').text(strProEnd);
                $('#forProEndBk').css(
                    'width',
                    (forProEnd > 0
                        ? Math.floor((310 * forProEnd) / proLength)
                        : 310) + 'px'
                );
            }
        }
        //コメント欄を常時表示
        if (
            settings.isSureReadComment &&
            !comeRefreshing &&
            !comeFastOpen &&
            !isComeOpen()
        ) {
            // console.log('sureRead waitforCloseCome(0)')
            waitforCloseCome(0);
        }
        // コメント欄を常に表示時でコメ欄が開かれているときはコメ開閉ボタンのイベント無効化(拡張のtoggleCommentListに割り当てるため)
        if (EXfootcountcome && settings.isSureReadComment && isComeOpen()) {
            EXfootcountcome.style.pointerEvents = 'none';
        } else {
            EXfootcountcome.style.pointerEvents = 'auto';
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

        //番組タイトルの更新
        if (EXinfo) {
            let jo = $(EXinfo)
                .children()
                .not('#copyinfo')
                .find('h2');
            if (jo.length > 0) {
                var tp = jo.first().text();
                if (
                    (tp && proTitle != tp) ||
                    !document.getElementById('copyinfo')
                ) {
                    //if (proTitle != jo.first().text()) {//if ($('#tProtitle').text() != jo.first().text()) {
                    proTitle = tp;
                    if (settings.isProtitleVisible) {
                        $('#tProtitle').text(proTitle);
                    }
                    setTimeout(applyCommentListNG, 300);
                    //番組情報(コピー)を更新
                    $(EXinfo)
                        .children('#copyinfo')
                        .remove();
                    $(EXinfo)
                        .children()
                        .not('#copyinfo')
                        .first()
                        .addClass('originalinfo')
                        .clone()
                        .removeClass()
                        .addClass('usermade')
                        .prop('id', 'copyinfo')
                        .appendTo($(EXinfo));
                    //番組情報のSNSボタンのイベント設定
                    $('#copyinfo ul>li button').click(function(e) {
                        $(EXinfo)
                            .children()
                            .not('#copyinfo')
                            .first()
                            .find('ul>li button')
                            .eq(
                                $(e.target)
                                    .parent()
                                    .index()
                            )
                            .trigger('click');
                    });
                }
            }
        }else if(proEnd.getTime()-Date.now()<0){
            // 取得済み番組終了時刻を過ぎている
            proTitle = '';
            if (settings.isProtitleVisible) {
                $('#tProtitle').text('未取得(番組詳細パネルを開いて取得)');
            }
        }

        if (settings.comeMovingAreaTrim) {
            //            var jo = $("object,video").parent();
            let jo = $(getElm.getVideo());
            //            if (jo.length > 0) {
            if (jo.length !== 0) {
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
                $('#moveContainer').css('width', movieRightEdge + 'px');
            }
        }

        //視聴数をコメ欄開閉ボタンにコピー
        if (settings.isStoreViewCounter) {
            var footbutton = $(EXfootcountcome);
            var viewcountcont = $('#viewcountcont');
            if (viewcountcont.length == 0) {
                $('<span id="viewcountcont"></span>').prependTo(footbutton);
                viewcountcont = $('#viewcountcont');
            }
            var viewcounticon = $('#viewcounticon');
            if (viewcounticon.length == 0) {
                $(
                    '<svg id="viewcounticon" width="14" height="14"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/images/icons/view.svg#svg-body"></use></svg>'
                ).insertBefore(viewcountcont);
                viewcounticon = $('#viewcounticon');
            }
            if (viewcountcont.next('br').length == 0) {
                $('<br>').insertAfter(viewcountcont);
            }
            var comecounticon = footbutton.children('svg').not(viewcounticon);
            var comecountcont = $('#comecountcont');
            if (comecountcont.length == 0) {
                $('<span id="comecountcont"></span>').insertAfter(
                    comecounticon
                );
                comecountcont = $('#comecountcont');
            }
            var viewpop = $(EXcountview).find('span');
            var viewpt = viewpop.text();
            if (viewpop.length == 0 || isNaN(parseInt(viewpt))) {
                viewcounticon.css('fill', 'gray');
                viewcountcont.css('color', 'gray').css('font-weight', 'normal');
            } else {
                viewcounticon.css('fill', '');
                viewcountcont.css('color', '').css('font-weight', '');
                if (viewcountcont.text() != viewpt) {
                    if (/^\d+(k|m)$/.test(viewpt)) {
                        viewcountcont.text(viewpt.replace(/(k|m)$/, '.0$1'));
                    } else {
                        viewcountcont.text(viewpt);
                    }
                }
            }
            var comepop = footbutton
                .children('span')
                .not(viewcountcont)
                .not(comecountcont);
            var comept = comepop.text();
            if (comepop.length == 0 || isNaN(parseInt(comept))) {
                comecounticon.css('fill', 'gray');
                comecountcont.css('color', 'gray').css('font-weight', 'normal');
            } else {
                comecounticon.css('fill', '');
                comecountcont.css('color', '').css('font-weight', '');
                if (comecountcont.text() != comept) {
                    if (/^\d+(k|m)$/.test(comept)) {
                        comecountcont.text(comept.replace(/(k|m)$/, '.0$1'));
                    } else {
                        comecountcont.text(comept);
                    }
                }
            }
            // CSS設定(setOptionHeadでも設定しているが公式に上書きされるのでここでも設定)
            EXfootcountcome.style.height = '50px';
            EXfootcountcome.style.padding = '0px 12px';
            EXfootcountcome.style.display = 'initial';
        }

        //タブの音声再生状態を取得して停止してたらリロードまでカウントダウン
        chrome.runtime.sendMessage({ type: 'getTabAudible' }, function(r) {
            if (r.audible == true || !isSoundFlag)
                audibleReloadCount = settings.audibleReloadWait;
            else if (audibleReloadCount >= 0 && --audibleReloadCount < 0)
                window.location.href = window.location.href;
        });
        //console.timeEnd('obf_2');
        //    }, 1000);
    } catch (e) {
        console.warn(e);
    }
    //console.timeEnd('onairbasefunc');
}
function onCommentChange(mutations) {
    //console.log('mutations', mutations)

    var isAnimationAdded = false,
        isCommentAdded = false,
        newCommentNum = 0,
        nodeClass,
        firstChildClass;
    for (var i = 0, eo, eofc; i < mutations.length; i++) {
        if (
            mutations[i].type == 'childList' &&
            mutations[i].addedNodes.length > 0
        ) {
            eo = mutations[i].addedNodes[0];
            eofc = eo.firstElementChild;
            nodeClass = eo.className;
            firstChildClass = eofc.className;
            //nextClass = jo.next().attr('class');
            //console.log(nodeClass, eo.getAttribute('data-ext-userid'),eo);
            if (
                !comelistClasses.animated &&
                comelistClasses.empty &&
                mutations[i].addedNodes.length == 1 &&
                EXcomelist.childElementCount == 1
            ) {
                //1つだけなら初回読込としてanimatedとする(emptyも1つだけだがEXcomelist取得時にempty取得済 だけど一応チェック)
                comelistClasses.animated = nodeClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                isAnimationAdded = true;
                console.log(
                    '!aniC&&emp&&added.l==1&&EXcomeli.chi.l==1 aniC=',
                    comelistClasses.animated
                );
            } else if (
                !comelistClasses.animated &&
                eofc.firstElementChild.tagName.toUpperCase() == 'DIV' &&
                (comelistClasses.progress &&
                    nodeClass.indexOf(comelistClasses.progress) < 0)
            ) {
                //直下のコメ本文がpじゃなければanimatedとする
                comelistClasses.animated = nodeClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                isAnimationAdded = true;
                console.log(
                    '!aniC&&eo.1stChi==div aniC=',
                    comelistClasses.animated
                );
            } else if (
                !comelistClasses.animated &&
                parseInt(eo.style.height) < 10
            ) {
                //jo.css("transition-property")=="height"だと反応しないっぽい
                //console.log('mutation added: animation');
                comelistClasses.animated = nodeClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                isAnimationAdded = true;
                console.log(
                    '!aniC&&eo.style.height<10 aniC=',
                    comelistClasses.animated,
                    ' height=',
                    eo.style.height
                );
            } else if (
                !comelistClasses.animated &&
                EXcomelist.getAttribute('data-ext-hascommentanimation') ==
                    'true' &&
                nodeClass &&
                [...EXcomelist.children].indexOf(eo) === 0 &&
                eo.nextElementSibling &&
                nodeClass !== eo.nextElementSibling.className
            ) {
                comelistClasses.animated = nodeClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                isAnimationAdded = true;
                console.log(
                    '!aniC&&come[0]class!=come[1]class&&hasComeAni==true aniC=',
                    comelistClasses.animated
                );
            } else if (
                comelistClasses.animated &&
                nodeClass.indexOf(comelistClasses.animated) >= 0 &&
                comelistClasses.progress &&
                nodeClass.indexOf(comelistClasses.progress) >= 0
            ) {
                //animation部がプログレスバー なにもしない
                console.log('animation: progress');
            } else if (
                comelistClasses.animated &&
                nodeClass.indexOf(comelistClasses.animated) >= 0
            ) {
                isAnimationAdded = true;
            } else if (
                !comelistClasses.stabled &&
                eofc.childElementCount > 1 &&
                eofc.children[0].tagName.toUpperCase() == 'P' &&
                (eofc.children[1].children[1].textContent.indexOf('今') >= 0 ||
                    eofc.children[1].children[1].textContent.indexOf('秒前') >=
                        0 ||
                    eofc.children[1].children[1].textContent.indexOf('分前') >=
                        0)
            ) {
                comelistClasses.stabled = firstChildClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                comelistClasses.message = eofc.children[0].className;
                comelistClasses.posttime =
                    eofc.children[1].children[1].className;
                comelistClasses.comment = nodeClass
                    .split(/\s/)[0]
                    .replace(/^\s+|\s+$/g, '');
                isCommentAdded = true;
                newCommentNum++;
            } else if (
                comelistClasses.stabled &&
                firstChildClass.indexOf(comelistClasses.stabled) >= 0
            ) {
                isCommentAdded = true;
                newCommentNum++;
            } else if (
                !comelistClasses.progress &&
                eo.firstElementChild &&
                eo.firstElementChild.firstElementChild &&
                eo.firstElementChild.firstElementChild.getAttribute('role') ==
                    'progressbar'
            ) {
                comelistClasses.progress = nodeClass;
                console.log('!progC&&eoRole==progressbar progC=', nodeClass);
            } else if (
                (comelistClasses.empty &&
                    nodeClass.indexOf(comelistClasses.empty) >= 0) ||
                (comelistClasses.progress &&
                    nodeClass.indexOf(comelistClasses.progress) >= 0) ||
                ((eo.tagName.toUpperCase() == 'P' ||
                    eo.tagName.toUpperCase() == 'SPAN') &&
                    eo.textContent.indexOf(
                        'この番組にはまだ投稿がありません'
                    ) >= 0) ||
                eo.firstElementChild.getAttribute('role') == 'progressbar'
            ) {
                //CH切り替え等でコメ欄が空になった時 何もしない
                console.log('mutation added: no comment');
            } else {
                console.warn(
                    'unexpected onCommentChange()',
                    mutations[i],
                    eo.parentElement,
                    eo,
                    nodeClass,
                    eo.innerHTML,
                    comelistClasses
                );
            }
            //console.log(nodeClass,comelistClasses.animated,isAnimationAdded)
        } else {
            //console.log('other mutation', mutations[i].type, mutations[i])
        }
    }
    //console.log(isAnimationAdded,isCommentAdded,newCommentNum);
    if (isCommentAdded) {
        //コメント取得(animation除外) ただし最初のanimationでも実行
        //console.time('obf_getComment_beforeif')
        var commentDivParent = $(EXcomelist);
        var firstChild = commentDivParent.children().eq(0);
        var isAnimationIncluded = false; //parseInt(commentDivParent.children().eq(0).css("height"))<10;//EXcomelist.children[0].className.indexOf('uo_k') >= 0;
        if (
            comelistClasses.animated &&
            firstChild.attr('class') &&
            firstChild.attr('class').indexOf(comelistClasses.animated) >= 0
        ) {
            isAnimationIncluded = true;
            isAnimationAdded = true; //コメントが追加されてanimationも含まれていればaimatonも追加されたとみなす
        }
        //console.log("isA",isAnimationIncluded,EXcomelist.children[0],commentDivParent.children().eq(0).css("height"))
        var comments = []; // 負荷軽減のためjQuery使わずに
        var commentDivs = EXcomelist.children;
        //if(isAnimationIncluded){console.log('div[1]:', commentDivs[1].innerHTML)}
        for (
            var cdi = 0;
            cdi < commentDivs.length - (isAnimationIncluded ? 1 : 0);
            cdi++
        ) {
            var cinfo = getComeInfo(commentDivs[cdi]);
            comments.push([cinfo.message, cinfo.userid, cinfo.datetime]);
        }
        var d = newCommentNum;
        //console.timeEnd('obf_getComment_beforeif')
        if (EXcomelist && isComeOpen()) {
            var comeListLen = comments.length; //EXcomelist.childElementCount;
            //var d = comeListLen - commentNum;//一定数(500)に達するとコメント数の総数は増えなくなるので左式は0になる
            //console.log('cl,cn,d', comeListLen,commentNum,d)
            //            if(comeListLen>commentNum){ //コメ増加あり
            //                if(!comeRefreshing||!settings.isSureReadComment){
            var commentDivParentV = commentDivParent;
            var scrolled = false;
            if (!settings.isInpWinBottom)
                scrolled =
                    commentDivParentV
                        .children()
                        .first()
                        .offset().top > window.innerHeight;
            else
                scrolled =
                    commentDivParentV
                        .children()
                        .first()
                        .offset().top < 0;
            if (d > 0 && !scrolled) {
                //コメ増加あり && スクロールが規定値以上でない
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
                if (
                    /*settings.isSureReadComment && */ commentNum >
                        Math.max(comeHealth + 20, settings.sureReadRefreshx) &&
                    isFootcomeClickable() &&
                    !hasNotTransformed($(EXsidebtn).add(EXchli))
                ) {
                    // $(EXcome).siblings('.v3_wo').length == 0) {
                    ///*コメ常時表示 &*/ コメ数>設定値 & コメ開可 & 他枠(番組詳細と放送中一覧)非表示
                    //comehealth(refresh直後のコメ数)が100に近く設定値も100に近い場合は毎回refreshしてしまうので適当な余裕を設けておく
                    console.log('comeRefreshing start');
                    comeRefreshing = true;
                    //                    commentNum=0;
                    $('#ComeMukouMask').trigger('click');
                    fastRefreshing();
                }
                //新着コメント強調 一時試用できるように、一時保存画面が開いている場合を考慮
                var hlsw =
                    $('#settcont').css('display') == 'none'
                        ? settings.highlightNewCome
                        : parseInt(
                              $(
                                  'input[type="radio"][name="highlightNewCome"]:checked'
                              ).val()
                          );
                applyCommentListNG(d);
                if (hlsw > 0) {
                    comehl(
                        $(EXcomelist)
                            .children()
                            .slice(-d),
                        hlsw
                    );
                }
                if (settings.isUserHighlight) {
                    comeUserHighlight(
                        $(EXcomelist)
                            .children()
                            .slice(-d)
                    );
                }
                //}
            } else if (comeListLen < commentNum && !isAnimationIncluded) {
                commentNum = 0;
                comeHealth = 100;
            }
            //コメ欄逆順で初回スクロール
            //console.log('ibs,sh', isBottomScrolled,commentDivParentV[0].scrollHeight);

            if (!isBottomScrolled && commentDivParentV[0].scrollHeight > 0) {
                commentDivParentV.scrollTop(commentDivParentV[0].scrollHeight);
                isBottomScrolled = true;
            }
            //新着コメがanimationされないときがあるのでanimationが含まれないときはコメ流しもここでやる(下でも同様にコメ流しの処理をしていて多分重複するけどlastMovedCommentTimeで弾けるはず)
            if (
                settings.isMovingComment &&
                isFirstComeAnimated &&
                !isAnimationAdded
            ) {
                let idx,
                    dt,
                    movingStarti = null;
                for (let i = 0; i < d; i++) {
                    //idx = d - i - 1;
                    idx = comments.length - d + i; //commentsの後ろに新着がある
                    //console.log(comments[idx],i)
                    dt = comments[idx] ? parseInt(comments[idx][2]) : 0;
                    if (dt <= lastMovedCommentTime) {
                        continue;
                    } else if (movingStarti == null) {
                        movingStarti = i; //movingStartiはlastMovedCommentTimeで弾いたコメントを除いた新着として流すコメントの起点
                    }
                    //console.log(comments[idx],idx,i,d,movingStarti)
                    mc.putComment(
                        comments[idx][0],
                        comments[idx][1],
                        i - movingStarti,
                        d - movingStarti,
                        undefined,
                        // settings,
                        arFullNg,
                        arUserNg,
                        kakikomitxt,
                        EXhead,
                        EXfoot
                    );
                    if (i == d - 1 && dt > 0) {
                        lastMovedCommentTime = dt;
                    }
                }
            }
            //console.log('newcome', comments, isFirstComeAnimated, d);
            if (!isFirstComeAnimated && isComeOpen()) {
                isFirstComeAnimated = true;
            }
        }
    }
    if (isAnimationAdded) {
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
            let animationCommentDivs =
                EXcomelist.children[0].children[0].children;
            let idx;
            let movingStarti = 0;
            //console.log(animationCommentDivs)
            for (let i = 0; i < animationCommentDivs.length; i++) {
                idx = animationCommentDivs.length - i - 1;
                //console.log('pc(animation)',animationCommentDivs[idx].children[0].innerHTML, i, animationCommentDivs.length);
                if (!animationCommentDivs[idx].firstElementChild.children[0]) {
                    //プログレスバーがあるなどコメントが無いときはスキップ
                    //console.log(animationCommentDivs[idx], EXcomelist.innerHTML);
                    continue;
                }
                let cinfo = getComeInfo(animationCommentDivs[idx]);
                var dt = parseInt(cinfo.datetime);
                //console.log(cinfo)
                if (dt <= lastMovedCommentTime) {
                    continue;
                } else if (movingStarti == 0) {
                    movingStarti = i;
                }
                mc.putComment(
                    cinfo.message,
                    cinfo.userid,
                    i - movingStarti,
                    animationCommentDivs.length - movingStarti,
                    undefined,
                    // settings,
                    arFullNg,
                    arUserNg,
                    kakikomitxt,
                    EXhead,
                    EXfoot
                );
                if (i == animationCommentDivs.length - 1 && dt > 0) {
                    lastMovedCommentTime = dt;
                }
            }
            //if(animationCommentDivs.length>40)console.log('mc Aadded>40', animationCommentDivs, animationCommentDivs.length, newCommentNum, EXcomelist.childElementCount);
        }
        if (!isFirstComeAnimated) {
            isFirstComeAnimated = true;
        }
    }
}

$(window).on('resize', function() {
    if (resizeEventTimer > 0) {
        clearTimeout(resizeEventTimer);
    }
    resizeEventTimer = setTimeout(function() {
        //ウィンドウのリサイズ完了時の処理
        console.log('resize finished');
        if (settings.isResizeScreen /* && isComeOpen()*/) {
            setTimeout(function() {
                //コメ欄を開くと公式が映像サイズを縮めてしまうので広げ直す
                // onresize() でやる
                // $(EXvideoarea)
                //     .width(window.innerWidth)
                //     .height(window.innerHeight);
                console.log('onresize()');
                onresize();
                // setTimeout(onresize, 1000); //1秒後にリサイズをかける
                // setTimeout(onresize, 1500);//たまに映像がずれるので再度リサイズかけると落ち着く
            }, 500);
        }
    }, 200);
});

export function onChangeURL(isBeforeNotOnair) {
    if (currentLocation != window.location.href) {
        previousLocation = currentLocation;
        currentLocation = window.location.href;
    }

    if (isBeforeNotOnair) {
        eventAdded = false; //放送画面以外→放送画面と推移した場合イベント設定しなおし
    }
    setTimeout(onresize, 1000);
    mc.leavePage();
    commentNum = 0;
    endCM();
    proStart = new Date();
    proEnd = new Date();
    proTitle = '';
    bginfo = [0, [], -1, -1];
    $('#tProtitle').text('未取得(番組詳細パネルを開いて取得)');
    $('#copyotw').remove();
    if (EXcomesendinp) $(EXcomesendinp.parentElement).css('display', '');
    //全画面・音量ボタンの位置を戻す
    if (EXfullscr && EXvolume) {
        EXfullscr.style.right = '';
        EXvolume.style.right = '';
    }
    replayComment.leavePage();
}

export function bgUpdate(type, value) {
    if (type == 0) {
        // 通常のhlsかdashセグメント
        bginfo[0] = value; // 解像度
        if (bginfo[2] < 0) bginfo[2] = 0;
        else if (bginfo[2] == 2) bginfo[2] = 3;
    } else if (type == 1) {
        if (value[1] < value[2]) {
            var b = false;
            if (bginfo[1].length == 0) b = true;
            else {
                if (value[0] == bginfo[1][0] && value[1] > bginfo[1][1])
                    b = true;
                else if (value[0] > bginfo[1][0]) b = true;
            }
            if (b) {
                bginfo[1] = [value[0], value[1], value[2]];
                cmblockcd = value[1] - value[2] - 1;
                b = false;
                if (bginfo[2] <= 1) {
                    bginfo[2] = 2;
                    if ((cmblockcd * 100) % 10 != 3) b = true;
                }
                if (
                    !settings.isCMBkR &&
                    !settings.isCMsoundR &&
                    !settings.isCMsmlR
                )
                    b = true;
                if (b) startCM();
                if (bginfo[1][0] > 0 && bginfo[1][1] == 0)
                    setTimeout(tryCM, 500, 5);
            }
        } else if (value[1] == value[2]) {
            if (bginfo[1].length > 0 && value[0] == bginfo[1][0])
                bginfo[1] = [];
            if (bginfo[1].length == 0) {
                if (bginfo[2] == 3) {
                    bginfo[2] = 0;
                    if ((cmblockcd * 100) % 10 != -3) {
                        cmblockcd = 0;
                        endCM();
                    }
                } else setTimeout(tryCM, 500);
            }
        }
    } else if (type == 2) {
        // ADセグメント
        if (bginfo[2] < 1) bginfo[2] = 1;
    }
}
