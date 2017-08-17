// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

var settings = {};
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
/*設定
拡張機能のオプション画面から設定できます。
以下の変数のコメントにある機能を利用する場合はtrue、利用しない場合はfalseを代入してください。
例:
var isHoge = true; //利用したい機能
var isFuga = false; //利用したくない機能
*/
settings.isResizeScreen = false; //ウィンドウが横長でも映像の端が切れることないようウィンドウに収まるようリサイズ 不具合報告があったのでデフォルトでfalse
settings.isDblFullscreen = false; //ダブルクリックで全画面表示に切り替え(全画面表示のときは機能しません。通常→全画面のみ)
var isHideOldComment = false; //古いコメントを非表示
var isCMBlack = false; //コメント数無効(CommentMukou)の時ずっと画面真っ黒
var isCMBkTrans = false; //コメント数無効の時ずっと画面真っ黒を少し透かす
var isCMsoundoff = false; //コメント数無効の時ずっと音量ミュート
var CMsmall = 100; //コメント数無効の時ずっと映像縮小
var isMovingComment = false; //あの動画サイトのように画面上をコメントが流れる(コメント欄を表示しているときのみ機能)
settings.movingCommentSecond = 8;//コメントが画面を流れる秒数
var movingCommentLimit = 50;//同時コメント最大数
//var isMoveByCSS = false;//CSSのanimationでコメントを動かす//デフォに
var isComeNg = false;//流れるコメントのうち特定の文字列を削除or置き換えする
var isComeDel = false;//流れるコメントのうちユーザー指定の文字列を含むものを流さない(この処理は↑の除去前に実行される)
var fullNg = "";//流れるコメントのうち特定の文字列を含む場合は流さない
var isInpWinBottom = false; //コメントリストを非表示、かつコメント入力欄を下の方へ。
var isCustomPostWin = false; //コメント投稿ボタン等を非表示、かつコメント入力欄を1行化。
var isCancelWheel = false; //マウスホイールによるページ遷移を抑止する
var isVolumeWheel = false; //マウスホイールで音量を操作する
var changeMaxVolume = 100; //最大音量(100)をこの値へ自動変更
var isTimeVisible = false; //残り時間を表示
var isSureReadComment = false; //コメント欄を開きっ放しにする
settings.isCommentFormWithSide = false;//↑有効時にコメ入力欄を右ボタンに連動させて非表示
var sureReadRefreshx = 500; //コメ欄開きっ放しの時にコメ数がこれ以上ならコメ欄を自動開閉する
settings.isAlwaysShowPanel = false; //黒帯パネルを常に表示する
//var isMovieResize = false; //映像を枠に合わせて縮小
//var isMovieMaximize = false; //映像最大化
var commentBackColor = 255; //コメント一覧の背景色
var commentBackTrans = 127; //コメント一覧の背景透過
var commentTextColor = 0; //コメント一覧の文字色
var commentTextTrans = 255; //コメント一覧の文字透過
var isCommentPadZero = false; //コメント一覧のコメ間の間隔を詰める
var isCommentTBorder = false; //コメント一覧のコメ間の区切り線表示
var timePosition = "windowtop"; //残り時間の表示位置
var notifySeconds = 60;//何秒前に番組通知するか
var cmblockia = 1; //コメント欄が無効になってからCM処理までのウェイト(+1以上)
var cmblockib = -1; //有効になってから解除までのウェイト(-1以下)
var isManualKeyCtrlR = false; //右ctrlキーによる手動調整
var isManualKeyCtrlL = false; //左ctrlキーによる手動調整
var isManualMouseBR = false; //マウスによる右下での手動調整
var isCMBkR = false; //画面クリックによる真っ黒解除
var isCMsoundR = false; //画面クリックによるミュート解除
var isCMsmlR = false; //画面クリックによる縮小解除
var isTabSoundplay = false; //タブ設定によるミュート切替
var isOpenPanelwCome = true; //コメント欄を開いてる時にもマウスオーバーで各要素を表示する
var isProtitleVisible = false; //番組名を画面右の情報枠から取得して表示する
var protitlePosition = "windowtopleft"; //番組名の表示位置
var proSamePosition = "over"; //番組名と残り時間の位置が重なった場合の対処方法
var isCommentWide = false; //コメント一覧内のコメント部分の横幅を広げる
var isProTextLarge = false; //番組名と残り時間の文字を大きくする
var kakikomiwait = 0; //自分のコメントを流すまでのウェイト(マイナスは流さない)
var isHidePopBL = false; //左下に出る告知
var isHidePopTL = false; //左上に出るロゴ
var panelopenset = [[1, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]];//head,foot,sideの開閉設定[全閉,info開,chli開,come開] 0:非表示 1:5秒で隠す 2:常に表示
var panelopenses = '111000000000'; //設定との読み書き時にのみ使用
var useEyecatch = false; //左上に出るロゴのタイミングを利用する
var comeMovingAreaTrim = false; //false:ウィンドウ全体 true:映像でない右側では流さない
var isHideButtons = false; //全画面と音量ボタンの非表示
var isResizeSpacing = false; //上下位置調整時に上ヘッダ分の余白を開けて上に詰めるかどうか
var isDeleteStrangeCaps = false; //流れるコメントの規定NGに文字コード基準のフィルターを適用する
var highlightNewCome = 0; //新着コメントの強調
var isChTimetableExpand = false; //チャンネル別番組表でタイトルが隠れないように縦に広げる
var isHidePopFresh = false; //左下に出るFresh宣伝
var isChTimetableBreak = false; //チャンネル別番組表でタイトルの改行位置を変更する
var isChTimetableWeekend = true; //土日を着色する
var isChTimetablePlaybutton = true; //番組表からnow-on-airに直接移動するためのリンク設置
settings.timetableScroll = ""; //番組表で指定チャンネルへスクロール
var isHideTwitterPanel = false; //「twitterで番組情報を受け取ろう」な左下パネル非表示
var isHideTodayHighlight = false; //ヘッダメニューの今日のみどころのポップアップ
var isComelistNG = false; //コメント一覧の代わりにNG適用済一覧を表示する
var isComelistClickNG = false; //コメント一覧のコメントクリックでNG一時追加用の入力欄を表示
var highlightComeColor = 0; //新着コメント強調色 0:黄色
var highlightComePower = 30; //新着コメント強調の強度(不透明度)
var isComeClickNGautoClose = false; //NG追加したらNG入力欄を自動的に閉じる
settings.isShareNGword = false;//共有NGワード
var isDelOldTime = false; //NG適用コメ一覧から古いコメの書込時刻を削除する
var isMovieSpacingZeroTop = false; //映像位置を上に詰める
var isMovieSpacingZeroLeft = false; //映像位置を左に詰める
var comeFontsize = 32; //流れるコメントのfont-size xx-large
var isHideVoting = false; //アンケート機能の非表示
var isStoreViewCounter = false; //視聴数をコメント開閉ボタンのコメ数表記と並べる
var isComeTriming = false; //コメント欄常時表示時はコメ欄の分だけ上下黒帯を縮めてコメ欄を縦に伸ばす
//var allowChannelNames = ["abema-news", "abema-special", "special-plus", "special-plus-2", "special-plus-3", "special-plus-4", "special-plus-5", "special-plus-6", "drama", "asia-drama", "reality-show", "mtv-hits", "space-shower", "documentary", "variety", "pet", "club-channel", "commercial", "anime24", "midnight-anime", "oldtime-anime", "family-anime", "new-anime", "yokonori-sports", "hiphop", "soccer", "fighting-sports", "fighting-sports2", "golf", "fishing", "shogi", "mahjong"];
var allowChannelNames = [];
var isExpandLastItem = false; //番組表の一番下の細いマスを縦に少し伸ばす
var isExpandFewChannels = false; //番組表の余白がある場合に横に伸ばす
var isHideArrowButton = false; //番組表の左右移動ボタンを非表示
var isPutSideDetailHighlight = true; //番組表の右枠に番組詳細を追加する
settings.panelOpacity = 127; //黒帯パネル透過度
var comeFontsizeV = false; //流れるコメントの文字サイズをウィンドウ縦長さに合わせる
var proTitleFontC = false; //タイトル・残り時間の文字色をコメント欄に合わせる
var isDelTime = false; //NG適用コメ一覧からコメの書込時刻を削除する
settings.mastodonInstance = ""; //mastodon投稿用インスタンス
settings.mastodonToken = ""; //mastodon api token
settings.mastodonFormat = "{comment}\\n#AbemaTV\\n{onairpage}"; //mastodon投稿用トゥートフォーマット
var audibleReloadWait = 20; // タブの音声再生が停止してからタブを更新するまでの秒数

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
getStorage(null, function (value) {
    $.extend(settings, value);
    settings.isResizeScreen = value.resizeScreen || false;
    settings.isDblFullscreen = value.dblFullscreen || false;
    isHideOldComment = value.hideOldComment || false;
    isCMBlack = value.CMBlack || false;
    isCMBkTrans = value.CMBkTrans || false;
    isCMsoundoff = value.CMsoundoff || false;
    CMsmall = Math.min(100, Math.max(5, ((value.CMsmall !== undefined) ? value.CMsmall : CMsmall)));
    isMovingComment = value.movingComment || false;
    settings.movingCommentSecond = (value.movingCommentSecond !== undefined) ? value.movingCommentSecond : settings.movingCommentSecond;
    movingCommentLimit = (value.movingCommentLimit !== undefined) ? value.movingCommentLimit : movingCommentLimit;
    //isMoveByCSS =　value.moveByCSS || false;
    isComeNg = value.comeNg || false;
    isComeDel = value.comeDel || false;
    fullNg = value.fullNg || fullNg;
    isInpWinBottom = value.inpWinBottom || false;
    isCustomPostWin = value.customPostWin || false;
    isCancelWheel = value.cancelWheel || false;
    isVolumeWheel = value.volumeWheel || false;
    changeMaxVolume = Math.min(100, Math.max(0, ((value.changeMaxVolume !== undefined) ? value.changeMaxVolume : changeMaxVolume)));
    isTimeVisible = value.timeVisible || false;
    isSureReadComment = value.sureReadComment || false;
    settings.isCommentFormWithSide = value.isCommentFormWithSide || false;
    sureReadRefreshx = Math.max(101, ((value.sureReadRefreshx !== undefined) ? value.sureReadRefreshx : sureReadRefreshx));
    //        isMovieResize = value.movieResize || false;
    //    isMovieMaximize = value.movieMaximize || false;
    settings.isAlwaysShowPanel = value.isAlwaysShowPanel || false;
    commentBackColor = (value.commentBackColor !== undefined) ? value.commentBackColor : commentBackColor;
    commentBackTrans = (value.commentBackTrans !== undefined) ? value.commentBackTrans : commentBackTrans;
    commentTextColor = (value.commentTextColor !== undefined) ? value.commentTextColor : commentTextColor;
    commentTextTrans = (value.commentTextTrans !== undefined) ? value.commentTextTrans : commentTextTrans;
    isCommentPadZero = value.commentPadZero || false;
    isCommentTBorder = value.commentTBorder || false;
    timePosition = value.timePosition || timePosition;
    notifySeconds = (value.notifySeconds !== undefined) ? value.notifySeconds : notifySeconds
    cmblockia = Math.max(1, ((value.beforeCMWait !== undefined) ? (1 + value.beforeCMWait) : cmblockia));
    cmblockib = -Math.max(1, ((value.afterCMWait !== undefined) ? (1 + value.afterCMWait) : (-cmblockib)));
    isManualKeyCtrlR = value.manualKeyCtrlR || false;
    isManualKeyCtrlL = value.manualKeyCtrlL || false;
    isManualMouseBR = value.manualMouseBR || false;
    isCMBkR = (value.CMBkR || false) && isCMBlack;
    isCMsoundR = (value.CMsoundR || false) && isCMsoundoff;
    isCMsmlR = (value.CMsmlR || false) && (CMsmall != 100);
    isTabSoundplay = value.tabSoundplay || false;
    isOpenPanelwCome = (value.openPanelwCome !== undefined) ? value.openPanelwCome : isOpenPanelwCome;
    isProtitleVisible = value.protitleVisible || false;
    protitlePosition = value.protitlePosition || protitlePosition;
    proSamePosition = value.proSamePosition || proSamePosition;
    isCommentWide = value.commentWide || false;
    isProTextLarge = value.proTextLarge || false;
    kakikomiwait = (value.kakikomiwait !== undefined) ? value.kakikomiwait : kakikomiwait;
    useEyecatch = value.useEyecatch || false;
    isHidePopTL = value.hidePopTL || false;
    isHidePopBL = value.hidePopBL || false;
    //        panelopenses=value.panelopenset||"111000000000";
    panelopenses = value.panelopenset || (settings.isAlwaysShowPanel ? "222222222222" : (isOpenPanelwCome ? "111000000111" : "111000000000"));//isA..とisO..を初回のみ適用
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenset[i][j] = panelopenses.split('')[i * 3 + j];
        }
    }
    if (panelopenses == "000000000000") {
        putPopacti();
    }
    comeMovingAreaTrim = value.comeMovingAreaTrim || false;
    isHideButtons = value.hideButtons || false;
    isResizeSpacing = value.resizeSpacing || false;
    isDeleteStrangeCaps = value.deleteStrangeCaps || false;
    highlightNewCome = (value.highlightNewCome !== undefined) ? Number(value.highlightNewCome) : highlightNewCome;
    isChTimetableExpand = value.chTimetableExpand || false;
    isHidePopFresh = value.hidePopFresh || false;
    isChTimetableBreak = value.chTimetableBreak || false;
    isChTimetableWeekend = value.chTimetableWeekend || false;
    isChTimetablePlaybutton = value.chTimetablePlaybutton || false;
    timetableScroll = value.timetableScroll || "";
    isHideTwitterPanel = value.hideTwitterPanel || false;
    isHideTodayHighlight = value.hideTodayHighlight || false;
    isComelistNG = value.comelistNG || false;
    isComelistClickNG = value.comelistClickNG || false;
    highlightComeColor = (value.highlightComeColor !== undefined) ? Number(value.highlightComeColor) : highlightComeColor;
    highlightComePower = (value.highlightComePower !== undefined) ? Number(value.highlightComePower) : highlightComePower;
    isComeClickNGautoClose = value.comeClickNGautoClose || false;
    settings.isShareNGword = value.isShareNGword || false;
    isDelOldTime = value.delOldTime || false;
    isMovieSpacingZeroTop = value.movieSpacingZeroTop || false;
    isMovieSpacingZeroLeft = value.movieSpacingZeroLeft || false;
    comeFontsize = Math.min(99, Math.max(1, ((value.comeFontsize !== undefined) ? Number(value.comeFontsize) : comeFontsize)));
    isHideVoting = value.hideVoting || false;
    isStoreViewCounter = value.storeViewCounter || false;
    isComeTriming = value.comeTriming || false;
    allowChannelNames = (value.allowChannelNames !== undefined) ? value.allowChannelNames.split(",") : allowChannelNames;
    isExpandLastItem = value.expandLastItem || false;
    isExpandFewChannels = value.expandFewChannels || false;
    isHideArrowButton = value.hideArrowButton || false;
    isPutSideDetailHighlight = value.putSideDetailHighlight || false;
    settings.panelOpacity = (value.panelOpacity!==undefined)?value.panelOpacity : 127;
    comeFontsizeV = value.comeFontsizeV || false;
    proTitleFontC = value.proTitleFontC || false;
    isDelTime = value.delTime || false;
    settings.mastodonInstance = value.mastodonInstance || "";
    settings.mastodonToken = value.mastodonToken || "";
    settings.mastodonFormat = value.mastodonFormat || "{comment}\\n#AbemaTV\\n{onairpage}";
    audibleReloadWait = (value.audibleReloadWait !== undefined) ? value.audibleReloadWait : 20;
});

var currentLocation = window.location.href;
var previousLocation = currentLocation;//URL変化前のURL
//var urlchangedtick=Date.now();
var isFirefox = window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
var isEdge = window.navigator.userAgent.toLowerCase().indexOf("edge") != -1;
var headerHeight = 44;
var footerHeight = 70;
var commentNum = 0;
var comeLatestPosi = [];
var comeTTLmin = 3;
var comeTTLmax = 13;
var comeLatestLen = 10;
comeLatestPosi.length = comeLatestLen;
for (var i = 0; i < comeLatestLen; i++) {
    comeLatestPosi[i] = []
    comeLatestPosi[i][0] = 0;
    comeLatestPosi[i][1] = comeTTLmin;
}
//var playtick=0;
//var comeLatestCount = 0; //画面右下で取得するコメント数
isComeLatestClickable = true; //右下コメント数をクリックできるか
var arFullNg = [];
//var retrytick=[1000,3000,6000,12000,18000];
//var retrycount=0;
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
//var proEnd = new Date(Date.now()+60*60*1000); //番組終了として現在時刻から1時間後を仮設定
var proEnd = new Date(); //↑で23時～24時の間に実行すると終了時刻が1日ずれるので現時刻にした
var forElementClose = 0; //コメント表示中でも各要素を表示させた時に自動で隠す場合のカウントダウン
var EXcomelist;
var EXcomments;

//var commentsSelector = '[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]';
var commentListParentSelector = '#main div.Ai_Am.t7_e.t7_t9 > div';
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
var EXobli;
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
var proTitle = "未取得"; //番組タイトル
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
var isNGwordShareInterval = false; //applySharedNGwordがinterval状態か
var postedNGwords = []; //送信済みNGワード
var isComelistMouseDown = false;
var movieWidth = 0; //.TVContainer__resize-screenの大きさ(onresize発火用)
var movieHeight = 0;
var waitingforResize = false; //waitforresizeの複数起動防止用
var copycomecount = 2; //番組移動直後にcopycomeをfullcopyする回数
var notifyButtonData = {}; //通知登録ボタンの番組情報格納
var allowChannelNum = []; //Namesを元にした表示列番号
var movieWidth2 = 0; //video.parentの大きさ(onresize発火用)
var oldWindowState = "normal" // フルスクリーン切り替え前のウィンドウのstate
var isTootEnabled = false; //コメントのトゥート有効か
var onairSecCount = 0; //onairbasefuncでカウントアップされる
var commentObserver = new MutationObserver(function(mutations) {
    onCommentChange(mutations);
}); //コメント欄DOM監視
var isFirstComeAnimated = false; //最初に既存のコメがanimationしたか 最初に既存のコメが一気に画面に流れてくるのを防ぐためのフラグ
var timetableRunning = false; //番組表表示時の10分インターバル
var audibleReloadCount = -1;
var isSoundFlag = true; //音が出ているか soundSet(isSound)のisSoundを保持したり音量クリック時にミュートチェック
var timetableGrabbing = {value:false,cx:0,cy:0,test:false,sx:0,sy:0,scrolled:false,}; //番組表を掴む

function hasArray(array, item) {//配列arrayにitemが含まれているか
    var hasFlg = false;
    for (var hai = 0; hai < array.length; hai++) {
        if (array[hai] === item) {
            hasFlg = true;
        }
    }
    return hasFlg;
}

function onairCleaner() {
    console.log("onairCleaner");
    //onairfunc以降に作成した要素を削除
    $('.usermade').remove();
    pophideElement({ allreset: true });
    pophideElement({head:1}); //allresetしてもヘッダーが表示されないので
    //変数クリア
    EXcomemodule = null;
    //DOM監視停止
    commentObserver.disconnect();
}
function allowChannelNumMaker() {
//console.log("allowChannelNumMaker");
    if (allowChannelNames.length == 0) return 2;
    var u = "https://abema.tv/timetable/channels/";
//    var jo = $('[class^="styles__channel-content-header___"]').children('[class^="styles__channel-icon-header___"]');
    var eaHead=$(EXTThead).children("a");
    if (eaHead.length == 0) return -2;
    var n = [];
    for (var i = 0, b, f, h, c; i < eaHead.length; i++) {
        if ((h = eaHead.eq(i).prop("href")) && h.indexOf(u) == 0) {
            c = h.replace(u, "");
//console.log("c="+c);
            if (allowChannelNames.includes(c)) {
                n.push(i);
            }
        }
    }
    if (n.length == 0) return -1;
    var b = false;
    if (n.length == allowChannelNum.length) {
        b = true;
        for (var i = 0; i < n.length; i++) {
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
    var selBody,selHead,selTime,selPTitle;
    var eo,ep;
    var m;
    var alt=false;

    //番組タイトルが少ない状態だとうまく取れないが今の遅延適用される状態(ch列が少し溜まるまでこのcssが生成されない)のがうまいこと効いてる
    selPTitle=getTTProgramTitleClass();
    if(!selPTitle){
        console.log("?番組タイトルclass "+to);
        selPTitle=alt?'.ok_bq':'';
    }else selPTitle='.'+selPTitle;

    selBody=getElementSingleSelector(EXTTbody);
    if($(selBody).length!=1){
        console.log("?EXTTbody "+selBody);
        selBody=alt?'.pi_pk':"";
    }

    if (isExpandFewChannels) {
        //横長さ制限があるのはfuturetitleのpだけだが仕様変更に備えて全てのpに適用しておく
        //futuretitleだけに適用する場合はgetTTTimeClassとかでがんばる
        if(selBody) t += selBody+' p{width:100%;padding-right:1em;}';

        //横幅100%から左端～時間軸の右端と右のスクロールバーの分(適当)を引いた幅にする
        //真面目にやるならexttbodyから上がっていってoverflowがvisibleでない要素(またはsideLの兄弟)のclientWidthを取ればスクロールバーまでバッチリ取れるかも
        m=EXTTtime?EXTTtime.getBoundingClientRect().right+19:265;
        ts = 'width:calc((100vw - '+m+'px) / '+allowChannelNum.length+')!important;min-width:176px;';
    }
    if (isChTimetableBreak&&selPTitle) {
        t += selPTitle+'{word-break:break-word;}';
    }

    var c = checkUrlPattern(true);
    if (c == 1) {
        if (allowChannelNum.length > 0) {
            selHead=getElementSingleSelector(EXTThead);
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
        selTime=EXTTtime?getElementSingleSelector(EXTTtime.lastChild):null;
        if($(selTime).length!=1){
            console.log("?date-bar "+selTime);
            selTime=alt?'.rT_sC':"";
        }
        t += selTime+'{pointer-events:none;}';
        //t += '[class^="styles__date-bar___"]{pointer-events:none;}';
//    }else if(c==2){
//        t+='[class^="styles__date-list-header___"]>*{width:calc((100vw - 265px) / 8);min-width:176px;}';
//        t+='[class^="styles__timetable-wrapper___"]>*{width:calc((100vw - 265px) / 8);min-width:176px;}';
    }

    if (isHideArrowButton) {
        t += '.rT_r3{display:none;}';
    }
    if (isExpandLastItem) {
        if(selBody) t += selBody+'>div{height:unset;min-height:' + ($(EXTTtime).height()||4320) + 'px;}';//各列の縦長さ制限を外す
        if(selBody) t += selBody+'>div>*:last-child>article{min-height:43px;}';
    }
    if (isHideTodayHighlight) {
        t += '[class*="styles__popup-container___"]{display:none;}';
    }
    if (isChTimetablePlaybutton) {
        t += '.playbutton:hover{background-color:yellow;}';
    }
    if (isChTimetableWeekend) {
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

    $("<link title='usermade' rel='stylesheet' href='data:text/css," + encodeURI(t) + "'>").appendTo("head");
}
function toggleChannel(targetUrl) {
//console.log("toggleChannel url="+targetUrl);
    var t = /\/([^/]+)$/.exec(targetUrl)[1];
    if(t == 'timetable'){
        //ALLを選択した時
        toast("番組表に表示するチャンネルをリセットしました。");
        allowChannelNames = [];
        allowChannelNum = [];
    }else{
        var i = allowChannelNames.indexOf(t);
        var chname = getChannelNameOnTimetable(t);
        if (i < 0) {
            //追加
            toast(chname+"を番組表に表示するチャンネルに追加しました。");
            allowChannelNames.push(t);
        } else {
            //削除
            toast(chname+"を番組表に表示するチャンネルから削除しました。");
            allowChannelNames.splice(i,1);
        }
    }
    console.log(allowChannelNames);
    setStorage({"allowChannelNames": allowChannelNames.join(",")});
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
    //if (!isChTimetableExpand && !isChTimetableBreak && !isChTimetableWeekend && !isChTimetablePlaybutton && !timetableScroll) { return; }
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
    var j=dd.map(function(i,e){ //ヘッダ探索　上の方にあって横長くて列の数は7日分くらいより多いやつ
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
        var b=e.getBoundingClientRect(); //ボディ探索　でかいやつ
        if(b.top<window.innerHeight/4&&b.left<window.innerWidth/4&&b.width>window.innerWidth/2&&b.height>window.innerHeight/2&&$(e).children("div").length>5)return e;
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

    j=dd.map(function(i,e){ //番組詳細探索　右にあるやつ
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
//        if (currentLocation.indexOf("https://abema.tv/timetable/channels/") == 0) {
        if (c == 2) {
            setTimeout(timetablechfix, 100);
//        } else if (currentLocation.match(/^https:\/\/abema\.tv\/timetable(?:\/dates\/.+)?$/)) {
        } else if (c == 1) {
            setTimeout(timetabledtfix, 100);
        }
        setTimeout(timetableCommonFix, 100, 0);
        //番組表クリックで右詳細に通知登録ボタン設置
        $(EXTTbody).click(function(e){ // 掴んでスクロールした場合番組詳細は開かないことにする
            if(!timetableGrabbing.scrolled){
                setTimeout(putSideDetailNotifyButton,50);
                if (isPutSideDetailHighlight) {
                    setTimeout(putSideDetailHighlight,50);
                }
            }else{
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });
        allowChannelNumMaker();
        timetableCss();
        //$('div')を取ってきてあるのでここで使う
        dd.map(function(i,e){if($(e).css("z-index")>10 && e.className.indexOf('toast')<0)return e;}).css("z-index","-1");

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
function putSideDetailHighlight(){
    var sideDetailWrapper = $('[class*="styles__side-slot-detail-wrapper___"][class*="styles__is-opened___"]');
    if (sideDetailWrapper.length == 0) { return; }
    var progTitle = sideDetailWrapper.find('p[class*="styles__title___"]').text();
    var progLinkArr = sideDetailWrapper.find('[class*="styles__link-detail___"]').attr("href").split('/');
    var urlchan = progLinkArr.indexOf("channels");
    if (urlchan < 0) { return; }
    var channel = progLinkArr[urlchan + 1];

    var cols = $('[class^="styles__timetable-wrapper___"]').children('div[class^="styles__col___"]');
    var c = checkUrlPattern(true);
    var j = $('[class^="styles__channel-content-header___"]');
    var h;
    var allTitle = $('[class^="styles__title___"]');
    var searchTarget;
    if (c == 1) {
        h = '[class^="styles__channel-icon-header___"]';
        var headLinks = j.children(h).children('a[class^="styles__channel-link___"]');
        var headTarget = headLinks.filter('[href$="' + channel + '"]');
        var targetIndex = headLinks.index(headTarget);
        searchTarget = cols.eq(targetIndex).find(allTitle);
    } else if (c == 2) {
//        h = '[class^="styles__date-list-header___"]';
        searchTarget = cols.find(allTitle);
    }
    var highlightString = "";
    for (var i = 0, t, s; i < searchTarget.length; i++) {
        t = searchTarget.eq(i).text();
        if (t == progTitle) {
            s = searchTarget.eq(i).parents('[class^="style__body-text___"]').children('[class^="style__tableHighlight___"]').text();
            if (s.length > 0) {
                highlightString = s;
                break;
            }
        }
    }
    sideDetailWrapper.find('p[class="addedHighlight"]').remove();
    if (highlightString.length > 0) {
        $('<p class="addedHighlight" style="line-height:19px;font-size:12px;margin-top:20px;">' + highlightString + '</p>').appendTo(sideDetailWrapper.children().last());
        sideDetailWrapper.css("overflow-x", "hidden");
    } else {
        sideDetailWrapper.css("overflow-x", "");
    }
}
function timetabledtfix() {
    //console.log("timetabledtfix");
    //日付別番組表
    //今はオプション1つのみだがチャンネル別のコピー
    var ce = false;
    var t = '';
    if (isChTimetablePlaybutton) {
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
    console.log(allowChannelNum)
    if (timetableScroll != "") {
        var channelLink = $(EXTThead).children('a[href$="/timetable/channels/' + timetableScroll + '"]');
        if (channelLink.length > 0) {
            var chLinkIndex = channelLink.index();
            var chLinkWidth = channelLink.width();
            var visibleChLinkIndex = chLinkIndex;
            if (allowChannelNum.length > 0) {
                chLinkWidth = channelLink.siblings().eq(allowChannelNum[0]).width();//allowChannelに含まれないチャンネルのchannelLinkから幅を取得するとずれる
                visibleChLinkIndex = 0;
                for(var i = 0; i < allowChannelNum.length; i++){
                    if (allowChannelNum[i] < chLinkIndex) {
                        visibleChLinkIndex++;
                    }else {
                        break;
                    }
                }
                $(EXTTbody).parent().parent().parent().parent().scrollLeft(Math.min(chLinkWidth * visibleChLinkIndex, chLinkWidth*allowChannelNum.length-$(EXTTbody).width()+20));
            }else{
                $(EXTTbody).parent().parent().parent().parent().scrollLeft(chLinkWidth * visibleChLinkIndex);
            }
            //console.log(chLinkWidth,visibleChLinkIndex,chLinkWidth * visibleChLinkIndex, allowChannelNum);
        } else {
            console.warn("timetable scroll failed. (channelLink not found: チャンネル名が正しくないか仕様変更)");
        }
    }
    //左チャンネル一覧にチェックボックス設置
    var channelsli = $(EXTTsideL).children("li");
    if(channelsli.length == 0){console.warn('channelsli');}
    channelsli.each(function (i, li){
        // if(i == 0){return;}
        // i--;
        li = $(li);
        var checkbox = li.children('input');
        if(checkbox.length == 0){
            checkbox = $('<input type="checkbox" class="usermade chlicheckbox" style="float:right;margin:'+(isFirefox?9:10)+'px;" title="拡張機能のチャンネル表示切替">').appendTo(li);
            checkbox.click(function (e){
                toggleChannel(e.currentTarget.previousElementSibling.getAttribute('href'));
            });
        }
        if(i == 0){
            checkbox.prop('checked', allowChannelNum.length == 0);
            checkbox.prop('disabled', allowChannelNum.length == 0)
        }else{
            checkbox.prop('checked', hasArray(allowChannelNum, i - 1));
        }
        li.children('a').css('display', 'inline-block').css('width', 'calc(100% - '+(20+checkbox.width())+'px)');
    });
}
function timetabledtloop() {
    if (checkUrlPattern(true) != 1) { return; }
    if (!isChTimetablePlaybutton) { return; }
    if (isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetabledtloop, 1000);
}
function timetablechfix() {
    //console.log("timetablechfix");
    //チャンネル別番組表
    var ce = false; //定期実行するかどうか
//    if (isChTimetableExpand) {
//        ce = true; //現在時刻の横棒の位置を直す
//        setTimeout(TimetableExpander, 500, 0); //playbutton設置(timetablechloop)によって隠れる分も考慮してそれより後に実行するようにset
//    }
    //削除できるようにtitleを付けているせいかusermade以降の追加cssが適用されないので全て纏めてからusermadeに適用する
    //setoptionheadも同様
//    var t = '';
//    if (isChTimetableBreak) {
//        t += '[class^="styles__title___"]{word-break:break-word;}';
//    }
    if (isChTimetablePlaybutton) {
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
//    if (isChTimetableWeekend) {
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
    if (!isChTimetableExpand) { return; }
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
    if (checkUrlPattern(true) != 2) { return; }
//    if (!isChTimetableExpand && !isChTimetablePlaybutton) { return; }
    if (!isChTimetablePlaybutton) { return; }
//    if (isChTimetableExpand) {
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
    if (isChTimetablePlaybutton) {
        PlaybuttonEditor();
    }
    setTimeout(timetablechloop, 1000);
}
function PlaybuttonEditor() {
    if (!isChTimetablePlaybutton) { return; }
    //放送中の緑枠の移動に合わせて再生ボタンを削除、設置する
    var p = $('[class*="style__status-present___"]'); //放送中の緑色枠
    var b = $('.playbutton');
    var c = $('[class*="styles__channel-link___"]');
    var cr = /^https:\/\/abema\.tv\/timetable\/channels\/(.+)$/;
    var dr = /^https:\/\/abema\.tv\/timetable(?:\/dates\/.+)?$/;
    var umc = currentLocation.match(cr);
    var umd = currentLocation.match(dr);
    var pn = -1;
    var bn = -2;
    for (var i = b.length - 1, d, s; i >= 0; i--) {
        d = b.eq(i).parent('a');
        s = d.siblings();
        if (!s.is('[class*="style__status-present___"]')) {
            //設置済ボタン位置が緑枠でなければボタン削除
            s.find('[class^="style__title___"]').css("width", "");
            d.remove();
        }
    }
    for (var i = 0, j, q, a, u, iumc; i < p.length; i++) {
        q = p.eq(i);
        if (umc && umc.length > 1 && umc[1].length > 0) {
            //チャンネル別番組表ならボタンのリンク先はURLから取得
            u = '/now-on-air/' + umc[1];
        } else if (umd && umd.length > 0 && c.length > 0) {
            //日付別番組表ならアイコンのリンクから取得
            j = q.parents('[class*="styles__col___"]').index();
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
            q.find('[class*="style__title___"]').css("width", "130px");
            a = '<a href="javascript:location.href=\'https://abema.tv' + u + '\';" title="放送中画面へ移動">';
            a += '<div class="playbutton" style="position:absolute;right:4px;top:4px;width:24px;height:24px;border:1px solid #6fb900;border-radius:50%;">';
            a += '<svg width="10" height="14" style="fill:#6fb900;transform:translate(1px,3px)">';// 以前は7px,3px
            a += '<use xlink:href="/svg/images/icons/playback.svg#svg-body">';
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
                    clickElement($(e.currentTarget).parents('button'));
                    setTimeout(clickElement,10,$('[class*="SlotCard__thumbnail___"]'));
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
function timetableCommonFix(prevColNum) {
    var cols, progArticle, progTitle;
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
    //番組タイトルをtitle要素にする
    cols.each(function(){
        $(this).children().each(function(){
            //番組毎divについてのループ
            progArticle = $(this).find("article");
            progTitle = progArticle.find('span.ok_bq').text();
            //progTitle = progArticle.find('span[class^="styles__title___"]').text();
            progArticle.attr("title", progTitle);
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
    if(EXTTsideL!=null) return $(EXTTsideL).find('a[href$="' + hrefStr + '"]').text();
    else return $('.rT_sq ul').find('a[href$="' + hrefStr + '"]').text();
}
function getVideo() {
    //console.trace('getVideo()')
    var jo = $('object,video');
    var jp;
    for (var i = 0; i < jo.length; i++) {
        if (jo.eq(i).css("display") != "none") {
            jp = jo.eq(i).parent();
            break;
        }
    }
    return jp;
}
function onresize() {
    if (checkUrlPattern(true) != 3) { return; }
    //console.log("onresize()");
    //視聴数の位置調整
    setTimeout(function(){
        if(EXcountview){
            $(EXcountview).offset({ top: window.innerHeight - (EXcountview.style.visibility==="hidden"?0:footerHeight) });
            $(EXcountview).offset({left:($(EXfootcome).offset().left-100)});
        }
    },2000);

    var resizeType = settings.isResizeScreen ? 1 : 0;
    var posiVType = isMovieSpacingZeroTop ? 1 : (isResizeSpacing ? 2 : 0);
    var posiHType = isMovieSpacingZeroLeft ? 1 : 0;
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
    //        newtop+=Math.floor(newhg*(100-CMsmall)/200);
    //}

    //newleft設定
    var newleft;
    if (posiHType == 1) {
        newleft = 0;
    } else { //中央合わせ
        newleft = Math.floor((wd - newwd) / 2);
    }
    //    if(setBlacked[2]){
    //        newleft+=Math.floor(newwd*(100-CMsmall)/200);
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
function onScreenDblClick() {
    console.log("dblclick");
    if (comeNGmode == 2) { return; }
    if (settings.isDblFullscreen) {
        toggleFullscreen();
    }
}
function toggleFullscreen() {
    chrome.runtime.sendMessage({type: 'toggleFullscreen', mode: 'toggle', oldState: oldWindowState}, function(response){
        oldWindowState = response.oldState;
    });
}
function getChannelByURL() {
    return (location.href.match(/https:\/\/abema\.tv\/now-on-air\/([-\w]+)/) || [null, null])[1];
}
function postShareNGwords(words, channel) {
    var postWords = [];
    for(var i=0; i < words.length; i++) {
        if (!hasArray(postedNGwords, words[i].toString())) {
            postWords.push(words[i].toString());
        }
    }
    if(postWords.length == 0) {
        return;
    }
    var postData = {
        "client": APIclientName,
        "channel": channel,
        "words": postWords
    };
    postedNGwords = postedNGwords.concat(postWords);//重複送信防止のため送信前にpostedに追加する
    $.ajax({url: NGshareURLbase + 'add_json.php', type: 'POST', data: JSON.stringify(postData), contentType: 'application/json', dataType: 'json', success: function(result) {
        if (result.status == "success") {
            console.log("postShareNGwords success", postWords, channel);
            //postedNGwords = postedNGwords.concat(postWords);
        } else {
            console.log("postShareNGwords failed", result);
        }
    }, error: function() {
        console.log("postShareNGwords post error");
    }});
}
function applySharedNGword() {
    var channel = getChannelByURL();
    isNGwordShareInterval = true;
    $.get(NGshareURLbase + "sharedng/" + channel + ".json", { "client": APIclientName }, function (data) {
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
    })
    if (channel) {
        setTimeout(applySharedNGword, 300000); //5分毎
    } else {
        isNGwordShareInterval = false;
    }
}
function arrayFullNgMaker() {
    //自由入力欄からNG正規表現を生成
    arFullNg = [];
    var spfullng = fullNg.split(/\r|\n|\r\n/);
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
        postShareNGwords(arFullNg, getChannelByURL());
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
    if (isDeleteStrangeCaps) {
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
function comefilter(m) {
    //putComeArrayとcopycomeで同じNG処理を実行するので分離
    var n = m;
    if (isComeNg && m.length > 0) {
        n = comeNG(m);
    }
    if (isComeDel && m.length > 0) {
        for (var ngi = 0; ngi < arFullNg.length; ngi++) {
            if (arFullNg[ngi].test(m)) {
                console.log("userNG matched text:" + m + " ngword:" + arFullNg[ngi].toString())
                m = "";
                break;
            } else if (arFullNg[ngi].test(n)) {
                console.log("userNG matched text:" + n + "(ori:" + m + ") ngword:" + arFullNg[ngi].toString())
                m = "";
                break;
            }
        }
    }
    if (isComeNg && m.length > 0) {
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
    var comeoverflowlen = inplen + mclen - movingCommentLimit;
    //あふれる分を削除
    if (comeoverflowlen > 0) {
        mcj.slice(0, comeoverflowlen).remove();
        //        mclen-=comeoverflowlen;
    }
//    var jo = $("object,video").parent();
    var jo;
    if(!(jo = getVideo())) return;
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
    var winwidth = comeMovingAreaTrim ? movieRightEdge : window.innerWidth;
    var outxt = '';
    var setfont = '';
    if ($('#settcont').css("display") != "none") {
        setfont = 'font-size:' + parseInt($('#comeFontsize').val()) + 'px;';
    }
    for (var i = 0; i < inplen; i++) {
        outxt += '<span class="movingComment' + (inp[i][3]?' selfComment':'') + '" style="position:absolute;top:' + inp[i][1] + 'px;left:' + (inp[i][2] + winwidth) + 'px;' + setfont + '">' + inp[i][0] + '</span>';
    }
    //console.log(outxt)
    $(outxt).appendTo(mci);
    //    mclen+=inplen;
    mcj = mci.children('.movingComment');
    mclen = mcj.length;
    for (var i = 0; i < inplen; i++) {
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
        setTimeout(function (jo, w, l) {
            if (isEdge) { jo = $(jo); }
            jo.css("transition", "left " + w + "s linear")
                .css("left", l + "px")
                .attr('data-createdSec', onairSecCount)
                ;
        }, 0, mck, waitsec, (-mcwidth - 2));
    }
}
function putComment(commentText, index, inmax, isSelf) {
    //console.log(commentText)
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
        console.log("kakikomi match,wait="+kakikomiwait)
        isSelf = true;
        if (kakikomiwait > 0) { //waitがプラスなら後から単独で流す
            setTimeout(putComment, kakikomiwait * 1000, commentText, 0, 1, true);
            commentText = "";
        } else if (kakikomiwait < 0) {
            commentText = "";
        }
        kakikomitxt = "";
        // console.log("kakikomitxt reset: putComment")
    }
    commentText = comefilter(commentText);
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
                if (Math.abs(commentTop - comeLatestPosi[j][0]) < comeFontsize * 1.5) {
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
    var maxLeftOffset = window.innerWidth * 5 / settings.movingCommentSecond; //5秒の移動長さ
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
    if (isTabSoundplay) {
        setBlacked[1] = !isSound;
        chrome.runtime.sendMessage({ type: "tabsoundplaystop", valb: !isSound }, function (r) { });
        return;
    }
    if (!EXvolume) { return; }
    var volcon = $(EXvolume).contents();
    var butvol = volcon.find('svg')[0];
    var volobj=getVolbarObject();
    if(volobj==null)return;
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
    if (pwaku.length == 0) { //delaysetから移動してきた
        if ($(overlapSelector).length == 0) { return; }
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
        var jo;
        //        if(EXwatchingnum!==undefined){
//        if (jo.length > 0) {
        if ((jo = getVideo())) {
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
            //                t=CMsmall/100;
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
    //    if(EXwatchingnum===undefined){return;}
    var j = getVideo();
//    if (j.length == 0) { return; }
    if (j === undefined) return;
    if (sw == 1 && CMsmall < 100) {
        setBlacked[2] = true;
        //        $(EXobli.children[EXwatchingnum]).css("transform","scale("+CMsmall/100+")");
//        $('object,video').parent().css("transform", "scale(" + CMsmall / 100 + ")");
        j.css("transform", "scale(" + CMsmall / 100 + ")");
    } else {
        setBlacked[2] = false;
        //        $(EXobli.children[EXwatchingnum]).css("transform","");
//        $('object,video').parent().css("transform", "");
        j.css("transform", "");
    }
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
    $("#isHideOldComment").prop("checked", isHideOldComment);
    $("#isCMBlack").prop("checked", isCMBlack);
    $("#isCMBkTrans").prop("checked", isCMBkTrans);
    $("#isCMsoundoff").prop("checked", isCMsoundoff);
    $("#CMsmall").val(CMsmall);
    $("#isMovingComment").prop("checked", isMovingComment);
    $("#movingCommentSecond").val(settings.movingCommentSecond);
    $("#movingCommentLimit").val(movingCommentLimit);
    //    $("#isMoveByCSS").prop("checked", isMoveByCSS);
    $("#isComeNg").prop("checked", isComeNg);
    $("#isComeDel").prop("checked", isComeDel);
    $("#fullNg").val(fullNg);
    $("#isInpWinBottom").prop("checked", isInpWinBottom);
    $("#isCustomPostWin").prop("checked", isCustomPostWin);
    $("#isCancelWheel").prop("checked", isCancelWheel);
    $("#isVolumeWheel").prop("checked", isVolumeWheel);
    $("#changeMaxVolume").val(changeMaxVolume);
    $("#isTimeVisible").prop("checked", isTimeVisible);
    $("#isSureReadComment").prop("checked", isSureReadComment);
    $("#isCommentFormWithSide").prop("checked", settings.isCommentFormWithSide);
    $("#sureReadRefreshx").val(sureReadRefreshx);
    $("#isAlwaysShowPanel").prop("checked", settings.isAlwaysShowPanel);
    //    $("#isMovieResize").prop("checked", isMovieResize);
    //    $("#isMovieMaximize").prop("checked", isMovieMaximize);
    $("#commentBackColor").val(commentBackColor);
    $("#commentBackTrans").val(commentBackTrans);
    $("#commentTextColor").val(commentTextColor);
    $("#commentTextTrans").val(commentTextTrans);
    var bc = "rgba(" + commentBackColor + "," + commentBackColor + "," + commentBackColor + "," + (commentBackTrans / 255) + ")";
    var tc = "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (commentTextTrans / 255) + ")";
    $(EXcomelist).children().slice(0, 10).css("background-color", bc)
        .css("color", tc)
        .children('[class^="styles__message___"]').css("color", tc)
        ;
    $("#commentBackColor").val(commentBackColor)
        .prev('span.prop').text(commentBackColor + " (" + Math.round(commentBackColor * 100 / 255) + "%)")
        ;
    $("#commentBackTrans").val(commentBackTrans)
        .prev('span.prop').text(commentBackTrans + " (" + Math.round(commentBackTrans * 100 / 255) + "%)")
        ;
    $("#commentTextColor").val(commentTextColor)
        .prev('span.prop').text(commentTextColor + " (" + Math.round(commentTextColor * 100 / 255) + "%)")
        ;
    $("#commentTextTrans").val(commentTextTrans)
        .prev('span.prop').text(commentTextTrans + " (" + Math.round(commentTextTrans * 100 / 255) + "%)")
        ;
    $("#isCommentPadZero").prop("checked", isCommentPadZero);
    $("#isCommentTBorder").prop("checked", isCommentTBorder);
    $('#itimePosition input[type="radio"][name="timePosition"]').val([timePosition]);
    $('#itimePosition').css("display", isTimeVisible ? "flex" : "none");
    $("#notifySeconds").val(notifySeconds);
    $('#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#settcont>#windowresize>#windowheight input[type="radio"][name="movieheight"]').val([0]);
    $("#beforeCMWait").val(cmblockia - 1);
    $("#afterCMWait").val(-cmblockib - 1);
    $("#isManualKeyCtrlR").prop("checked", isManualKeyCtrlR);
    $("#isManualKeyCtrlL").prop("checked", isManualKeyCtrlL);
    $("#isManualMouseBR").prop("checked", isManualMouseBR);
    $("#isCMBkR").prop("checked", isCMBkR);
    $("#isCMsoundR").prop("checked", isCMsoundR);
    $("#isCMsmlR").prop("checked", isCMsmlR);
    $("#isTabSoundplay").prop("checked", isTabSoundplay);
    $("#isOpenPanelwCome").prop("checked", isOpenPanelwCome);
    $("#isProtitleVisible").prop("checked", isProtitleVisible);
    $('#iprotitlePosition input[type="radio"][name="protitlePosition"]').val([protitlePosition]);
    $('#iprotitlePosition').css("display", isProtitleVisible ? "flex" : "none");
    $('#iproSamePosition input[type="radio"][name="proSamePosition"]').val([proSamePosition]);
    $('#iproSamePosition').css("display", (isProtitleVisible && isTimeVisible) ? "flex" : "none");
    $('#isCommentWide').prop("checked", isCommentWide);
    $('#isProTextLarge').prop("checked", isProTextLarge);
    $('#kakikomiwait').val(kakikomiwait);
    $('#useEyecatch').prop("checked", useEyecatch);
    $('#isHidePopTL').prop("checked", isHidePopTL);
    $('#isHidePopBL').prop("checked", isHidePopBL);
    $('#comeMovingAreaTrim').prop("checked", comeMovingAreaTrim);
    $('#isHideButtons').prop("checked", isHideButtons);
    $('#isResizeSpacing').prop("checked", isResizeSpacing);
    $('#isDeleteStrangeCaps').prop("checked", isDeleteStrangeCaps);
    //    $('#isHighlightNewCome').prop("checked",isHighlightNewCome);
    $('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]').val([highlightNewCome]);
    $('#isChTimetableExpand').prop("checked", isChTimetableExpand);
    $('#isHidePopFresh').prop("checked", isHidePopFresh);
    $('#isChTimetableBreak').prop("checked", isChTimetableBreak);
    $('#isChTimetableWeekend').prop("checked", isChTimetableWeekend);
    $('#isChTimetablePlaybutton').prop("checked", isChTimetablePlaybutton);
    $('#timetableScroll').val(settings.timetableScroll);
    $('#isHideTwitterPanel').prop("checked", isHideTwitterPanel);
    $('#isHideTodayHighlitht').prop("checked", isHideTodayHighlight);
    $('#isComelistNG').prop("checked", isComelistNG);
    $('#isComelistClickNG').prop("checked", isComelistClickNG);
    $('#ihighlightComeColor input[type="radio"][name="highlightComeColor"]').val([highlightComeColor]);
    $('#highlightComePower').val(highlightComePower);
    $('#isComeClickNGautoClose').prop("checked", isComeClickNGautoClose);
    $('#isShareNGword').prop("checked", settings.isShareNGword);
    $('#isDelOldTime').prop("checked", isDelOldTime);
    $('#isMovieSpacingZeroTop').prop("checked", isMovieSpacingZeroTop);
    $('#isMovieSpacingZeroLeft').prop("checked", isMovieSpacingZeroLeft);
    $('#comeFontsize').val(comeFontsize);
    $('#isHideVoting').prop("checked", isHideVoting);
    $('#isStoreViewCounter').prop("checked", isStoreViewCounter);
    $('#isComeTriming').prop("checked", isComeTriming);
    $('#audibleReloadWait').val(audibleReloadWait);

    $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#windowheight input[type="radio"][name="windowheight"]').val([0]);

    $('#panelOpacity').val(settings.panelOpacity);
    $('#comeFontsizeV').prop("checked", comeFontsizeV);
    $('#proTitleFontC').prop("checked", proTitleFontC);
    $('#isDelTime').prop("checked", isDelTime);
    $('#mastodonFormat').val(settings.mastodonFormat);

    var panelopenseu = [];
    for (var i = 0; i < 4; i++) {
        panelopenseu[i] = panelopenset[i].join('');
    }
    panelopenses = panelopenseu.join('');
    if ($('#ipanelopenset [type="radio"][name="panelopenset"][value=' + panelopenses + ']').length > 0) {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val([panelopenses]);
    } else {
        $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
    }
    if (panelopenses == "000000000000") {
        putPopacti();
    } else {
        cancelPopacti();
    }
    var sp = panelopenses.split('');
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            $('#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]').val([sp[i * 3 + j]]);
        }
    }

    //    if(settings.isResizeScreen||isMovieMaximize){
    //    if(settings.isResizeScreen){
    //        $('#movieResizeChkA').prop("checked",true);
    //        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').prop("disabled",false)
    //            .val([settings.isResizeScreen?(isResizeSpacing?1:0):2])
    //        ;
    //    }else{
    //        $('#movieResizeChkA').prop("checked",false);
    //        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').val([0])
    //            .prop("disabled",true)
    //        ;
    //    }
    $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').val([settings.isResizeScreen ? 1 : 0]);
    $('#moviePositionContainer input[type="radio"][name="moviePositionVType"]').val([isMovieSpacingZeroTop ? 1 : (isResizeSpacing ? 2 : 0)]);
    $('#moviePositionContainer input[type="radio"][name="moviePositionHType"]').val([isMovieSpacingZeroLeft ? 1 : 0]);

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
    $(EXcomelist).add('#copycomec').children('div').css("background-color", "") //基本色、新着強調
        .css("color", "") //基本色
        .css("border-left", "") //新着強調
        .css("padding-left", "") //新着強調
        .css("border-top", "") //区切り線
        .css("transition", "") //新着強調
        .children('[class^="styles__message___"]').css("color", "") //基本色
        ;
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
    var toastElem = $("<div class='toast'><p>" + message + "</p></div>").appendTo("body");
    setTimeout(function () {
        toastElem.fadeOut(3000);
    }, 4000);
}
function delayset(isInit,isOLS,isEXC,isInfo,isTwT,isVideo) {
    if (checkUrlPattern(true) != 3) { return; }
    if(!isOLS){
        if(!overlapSelector){//ページ遷移の再delayset時に本来のoverlapが無くなって映像枠が引っかかるので再探査しない
            var jo=$('div').map(function(i,e){var b=e.getBoundingClientRect();if($(e).css("position")=="absolute"&&b.top<5&&b.left<5&&b.width>window.innerWidth-10&&b.height>window.innerHeight-10&&(!isNaN(parseInt($(e).css("z-index")))&&$(e).css("z-index")>0)&&parseInt($(e).css("opacity"))>0)return e;});
            if(jo.length>0)overlapSelector=getElementSingleSelector(jo[0]);
            //else{
            //    console.log('?overlapSelector');
            //    overlapSelector = "#main div.nN_nR";
            //}
        }
        if ($(overlapSelector).length>0){
            if($('#ComeMukouMask').length == 0) { //delaysetにも設置
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
        //映像のリサイズ
        onresize();
        volumecheck(); //1秒ごとに実行していた最大音量チェックを初回読込時の1回だけに変更
        if ($('#moveContainer').length == 0) {
            $('<div id="moveContainer" class="usermade">').appendTo('body');
        }
        //視聴数の位置調整
        setTimeout(function () {
            $(EXcountview).offset({left:($(EXfootcome).offset().left-100)});
        }, 3000);//コメント数が表示されるまで待つ
        setTimeout(function () {
            $(EXcountview).offset({left:($(EXfootcome).offset().left-100)});
        }, 10000);//再度修正
        setInterval(function () {
            $(EXcountview).offset({left:($(EXfootcome).offset().left-100)});
        }, 30000);//30秒ごとに再調整

        //初期読込時にマウス反応の要素が閉じないのを直したい
        forElementClose=1;

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
        var cn = getChannelByURL();
        if (cn) $(EXchli).scrollTop($(EXchli).find('img[src*="/channels/logo/' + cn + '"]').eq(0).parentsUntil(EXchli).eq(-2)[0].offsetTop-window.innerHeight/2);
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
        commentObserver.observe(EXcomelist, { childList: true});
//        console.log("setOptionHead delayset(EXcomelist)");
//        resetOptionHead=true;
        isEXC=true;
        //}
    }
    if(!isVideo&&$('video,object').length>0){
        console.log("setOptionHead delayset(video)");
        resetOptionHead=true;
        isVideo=true;
    }
    if(resetOptionHead) setOptionHead();

    if(isInit&&isOLS&&isEXC&&isInfo&&isTwT&&isVideo)console.log("delayset ok");
    else{
        console.log("delayset retry "+(isInit?".":"I")+(isOLS?".":"O")+(isEXC?".":"C")+(isInfo?".":"F")+(isTwT?".":"T")+(isVideo?".":"V"));
        setTimeout(delayset, 1000,isInit,isOLS,isEXC,isInfo,isTwT,isVideo);
        return;
    }
}
function delaysetNotOA(){
    var hoverContents = getMenuObject();
    if(hoverContents==null) hoverContents=$('.Fb_Fi');
    if (hoverContents.children().length == 0) {
        console.log("delaysetNotOA retry");
        setTimeout(delaysetNotOA, 1000);
        return;
    }
    //拡張機能の設定と通知番組一覧をその他メニューに追加
    var hoverLinkClass = hoverContents.children()[0].className;
    var hoverSpanClass = hoverContents.children().eq(0).children()[0].className;
    //console.log(hoverContents,hoverContents.children(),hoverLinkClass)
    if (hoverContents.children('#extSettingLink').length == 0) {
        hoverContents.append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("option.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張設定</span></a>');
        hoverContents.append('<a class="' + hoverLinkClass + '" id="extProgNotifiesLink" href="' + chrome.extension.getURL("prognotifies.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張通知登録一覧</span></a>');
    }
}
function volumecheck() {
    if (checkUrlPattern(true) != 3) { return; }
    //console.log("volumecheck");
    var t=getVolbarObject();
    if(t==null)return;
    var v = t.height();
    if (v !== null && 0 <= v && v <= 92) {
        if (v == 92 && changeMaxVolume < 100) {
            if ($(EXvolume).contents().find('svg').css("fill") == "rgb(255, 255, 255)") {
                otoColor();
            }
            otosageru();
        }
    } else {
        setTimeout(volumecheck, 1000);
    }
}
function optionStatsUpdate(outflg) {
    if (checkUrlPattern(true) != 3) { return; }
    //console.log("optionStatusUpdate("+(outflg?"true":"false"));
    var out = [0, 0];
    if ($('#settcont').length == 0 || $('#settcont').css("display") == "none") { return; }
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
    var jp;
    //    if(EXwatchingnum!==undefined&&tar.length>0){
    if ((jp = getVideo()) && tar.length > 0) {
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
            //            ropt=isResizeSpacing?headerHeight:0;
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
    if (checkUrlPattern(true) != 3) { return; }
    if (!EXside) {
        console.log("createSettingWindow retry");
        setTimeout(createSettingWindow, 1000);
        return;
    }
    var slidecont = EXside
    //設定ウィンドウ・開くボタン設置
    if ($(EXside).children('#optionbutton').length == 0) {
        var optionbutton = document.createElement("div");
        optionbutton.id = "optionbutton";
        optionbutton.setAttribute("style", "width:40px;height:40px;position:relative;background-color:#ddd;opacity:0.5;cursor:pointer;");
        optionbutton.innerHTML = "<img src='" + chrome.extension.getURL("icon/gear.svg") + "' alt='拡張設定' style='margin: auto;position: absolute;left: 0;top: 0;right: 0;bottom: 0;height:20px;width:20px;'>";
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
        var settcont = '<div id="settcont" class="usermade" style="';
        settcont += 'width:670px;position:absolute;right:40px;top:' + headerHeight + 'px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:16;';//head11より上の残り時間12,13,14より上の番組情報等15より上
        //ピッタリの658pxから少し余裕を見る
        settcont += '">';
        //設定ウィンドウの中身
        settcont += '<span style="font-weight:bold;">拡張機能一時設定画面</span><br>';
        settcont += '<input type="button" class="closeBtn" value="閉じる" style="position:absolute;top:10px;right:10px;">';
        settcont += '<a href="' + chrome.extension.getURL('option.html') + '" target="_blank">永久設定オプション画面はこちら</a><br>';
        settcont += generateOptionHTML(false) + '<br>';
        settcont += '<input type="button" id="saveBtn" value="一時保存"> ';
        settcont += '<input type="button" class="closeBtn" value="閉じる"><br>';
        settcont += '※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<hr>';
        settcont += '<input type="button" id="clearLocalStorage" value="localStorageクリア"><br>';
        settcont += '<span style="word-wrap: break-word; color: #444; font-size: smaller;">UserID:' + localStorage.getItem('abm_userId') + ' token:' + localStorage.getItem('abm_token') + '</span>';
        settcont += '</div>'
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
    $("#itimePosition").insertBefore("#isTimeVisible+*")
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
    $("#iprotitlePosition").insertBefore("#isProtitleVisible+*")
        .css("border", "black solid 1px")
        .css("margin-left", "16px")
        .css("display", "flex")
        .css("flex-direction", "column")
        .children().css("display", "flex")
        .css("flex-direction", "row")
        .css("margin", "1px 0px")
        .children().css("margin-left", "4px")
        ;
    $("#iproSamePosition").insertBefore("#isProtitleVisible")
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
        $('<input type="button" class="leftshift" value="←この設定画面を少し左へ" style="float:right;margin-top:10px;padding:0px 3px;">').appendTo('#CommentColorSettings');
        $(".leftshift").on("click", function () {
            $("#settcont").css("right", "320px");
            $(".leftshift").css("display", "none");
            $(".rightshift").css("display", "");
        });
    }
    if ($('.rightshift').length == 0) {
        $('<input type="button" class="rightshift" value="この設定画面を右へ→" style="float:right;margin-top:10px;display:none;padding:0px 3px;">').appendTo('#CommentColorSettings');
        $(".rightshift").on("click", function () {
            $("#settcont").css("right", "40px");
            $(".rightshift").css("display", "none");
            $(".leftshift").css("display", "");
            $('#PsaveCome').prop("disabled", true)
                .css("color", "gray")
                ;
            setTimeout(clearBtnColored, 1200, $('#PsaveCome'));
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
        stra.eq(2).children('input[type="radio"][name="cmbktype"]').prop("disabled", !isCMBlack)
            .val([isCMBkTrans ? 1 : 0])
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
        stra.eq(5).children('input[type="radio"][name="cmsotype"]').prop("disabled", !isCMsoundoff)
            .val([isTabSoundplay ? 1 : 0])
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
        $(s).insertBefore("#isTimeVisible+*");
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
        $('#isAlwaysShowPanel').appendTo('#panelCustom').prop("disabled", true).before("旧");
        $('<input type="button" id="alwaysShowPanelB" value="下表に適用">').insertAfter('#isAlwaysShowPanel').before("常に黒帯パネルを表示する");
        $('#isOpenPanelwCome').appendTo('#panelCustom').prop("disabled", true).before("<br>旧");
        $('<input type="button" id="openPanelwComeB" value="下表に適用">').insertAfter('#isOpenPanelwCome').before("コメント欄を開いていても黒帯パネル等を表示できるようにする");
        $('<br><span>※以上の古いオプションは以下の新オプションに統合され、適当な経過期間の後に削除予定</span>').appendTo('#panelCustom');
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
                    $('<input type="radio" name="d' + i + '' + j + '" value=' + k + '>').appendTo('#panelcustomTable tr:eq(' + (i + 1) + ')>td:eq(' + (j + 1) + ')')
                        .after(rd[k])
                        ;
                }
            }
        }
        $('#panelcustomTable td').css("border", "1px solid black")
            .css("text-align", "left")
            .css("padding", "3px")
            ;
        $('#panelcustomTable td:first-child').css("text-align", "center");
        $('#alwaysShowPanelB').on("click", panelTableUpdateA);
        $('#openPanelwComeB').on("click", panelTableUpdateO);
        $('#ipanelopenset').change(panelTableUpdateS);
        $('#panelcustomTable').change(panelTableUpdateT);
    }
    if ($('#movieResizeContainer').length == 0) {
        var jo = $('#isResizeScreen');
        var ja = jo.parent().contents();
        //        var jm=$('#isMovieMaximize');
        var jm = jo;
        ja.slice(ja.index(jo), ja.index(jm.next())).wrapAll('<div id="movieResizeContainer" style="margin:8px;padding:8px;border:1px solid black;">');
        //        $('<input id="movieResizeChkA" type="checkbox">').prependTo('#movieResizeContainer')
        //            .after(':映像リサイズ (ウィンドウに合わせます。映像がウィンドウの外にハミ出なくなり、コメ欄などを開いても映像の大きさは変わらず、コメ欄などは映像の上に重なります。)<br>　映像の上下位置<br>')
        //            .change(movieResizeChkChanged)
        //        ;
        var tres = '映像の大きさ';
        tres += '<br><input type="radio" name="movieResizeType" value=0 style="margin-left:16px;">:デフォルト';
        tres += '<br><input type="radio" name="movieResizeType" value=1 style="margin-left:16px;">:ウィンドウ全体に最大化';
        $('#isResizeScreen').css("display", "none")
            //            .before('<input type="radio" name="movieResizeType" value=0 style="margin-left:16px;">:上に詰める (空き無し)')
            .before(tres)
            ;
        //        $('#isResizeSpacing').css("display","none")
        //            .before('<input type="radio" name="movieResizeType" value=1 style="margin-left:16px;">:上に詰めるが、上の黒帯の分だけ空ける')
        //        ;
        //        $('#isMovieMaximize').css("display","none")
        //            .before('<input type="radio" name="movieResizeType" value=2 style="margin-left:16px;">:画面中央')
        //        ;
        var jc = $('#movieResizeContainer').contents();
        jc.eq(jc.index($('#isResizeScreen')) + 1)
            //            .add(jc.eq(jc.index($('#isResizeSpacing'))+1))
            //            .add(jc.eq(jc.index($('#isMovieMaximize'))+1))
            .remove()
            ;
        $('#movieResizeContainer input[type="radio"][name="movieResizeType"]').change(movieResizeTypeChanged);
    }
    if ($('#moviePositionContainer').length == 0) {
        var jo = $('#isMovieSpacingZeroTop');
        var ja = jo.parent().contents();
        var jm = $('#isMovieSpacingZeroLeft');
        ja.slice(ja.index(jo), ja.index(jm.next())).wrapAll('<div id="moviePositionContainer" style="margin:8px;padding:8px;border:1px solid black;">');
        var tres = '映像の上下位置';
        tres += '<br><input type="radio" name="moviePositionVType" value=0 style="margin-left:16px;">:デフォルト (中央)';
        tres += '<br><input type="radio" name="moviePositionVType" value=1 style="margin-left:16px;">:上に詰める (空き無し) ※額縁は詰まりません';
        $('#isMovieSpacingZeroTop').css("display", "none")
            .before(tres)
            ;
        $('#isResizeSpacing').css("display", "none")
            .before('<input type="radio" name="moviePositionVType" value=2 style="margin-left:16px;">:上に詰めるが、上の黒帯の分だけ空ける ※額縁は詰まりません')
            ;
        tres = '映像の左右位置';
        tres += '<br><input type="radio" name="moviePositionHType" value=0 style="margin-left:16px;">:デフォルト <span id="moviePosiHDesc"></span>';
        tres += '<br><input type="radio" name="moviePositionHType" value=1 style="margin-left:16px;">:左に詰める (空き無し) ※額縁は詰まりません';
        $('#isMovieSpacingZeroLeft').css("display", "none")
            .before(tres)
            ;
        $('#moviePosiHDesc').text(settings.isResizeScreen ? "(ウィンドウ全体の中央)" : "(ウィンドウ左側内の中央)");
        var jc = $('#moviePositionContainer').contents();
        jc.eq(jc.index($('#isMovieSpacingZeroTop')) + 1)
            .add(jc.eq(jc.index($('#isResizeSpacing')) + 1))
            .add(jc.eq(jc.index($('#isMovieSpacingZeroLeft')) + 1))
            .remove()
            ;
        $('#moviePositionContainer input[type="radio"][name="moviePositionVType"]').change(moviePositionVTypeChanged);
        $('#moviePositionContainer input[type="radio"][name="moviePositionHType"]').change(moviePositionHTypeChanged);
        $('#moviePositionContainer').prev("br").remove();
    }
    if ($('#highlightdesc').length == 0) {
        $("#ihighlightNewCome").insertBefore("#isCommentWide")
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
        $("#ihighlightComeColor").insertBefore("#isCommentWide")
            .css("border", "black solid 1px")
            .children().css("display", "flex")
            .css("flex-direction", "row")
            .css("margin", "1px 0px")
            .css("padding-left", "8px")
            .children().css("margin-left", "4px")
            .first().before('<span id="highlightCdesc">↑の色</span>')
            ;
        var c = $('#highlightComePower').parent().contents();
        var jo = $('#highlightComePower');
        var i = c.index(jo);
        c.slice(i - 2, i).remove();
        $('#highlightComePower').appendTo($("#ihighlightComeColor").children().first())
            .prop("type", "range")
            .prop("max", "100")
            .prop("min", "0")
            ;
        $('<span id="highlightPdesc" style="margin-right:4px;margin-left:12px;">背景濃さ:' + highlightComePower + '</span>').insertBefore("#highlightComePower");
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
    var i = jo.length - 1
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
    fullNg = $("#fullNg").val();
    arrayFullNgMaker();
    if (isComelistNG) {
        copycome();
    }
    setStorage({
        "fullNg": fullNg
    }, function () {
        $('#PsaveNG').prop("disabled", true)
            .css("background-color", "lightyellow")
            .css("color", "gray")
            ;
        setTimeout(clearBtnColored, 1200, $('#PsaveNG'));
    });
}
function setPSaveCome() {
    commentBackColor = parseInt($("#commentBackColor").val());
    commentBackTrans = parseInt($("#commentBackTrans").val());
    commentTextColor = parseInt($("#commentTextColor").val());
    commentTextTrans = parseInt($("#commentTextTrans").val());
    setOptionHead();
    setStorage({
        "commentBackColor": commentBackColor,
        "commentBackTrans": commentBackTrans,
        "commentTextColor": commentTextColor,
        "commentTextTrans": commentTextTrans
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
    isHideOldComment = $("#isHideOldComment").prop("checked");
    isCMBlack = $("#isCMBlack").prop("checked");
    isCMBkTrans = $("#isCMBkTrans").prop("checked");
    isCMsoundoff = $("#isCMsoundoff").prop("checked");
    CMsmall = Math.min(100, Math.max(5, $("#CMsmall").val()));
    isMovingComment = $("#isMovingComment").prop("checked");
    settings.movingCommentSecond = parseInt($("#movingCommentSecond").val());
    movingCommentLimit = parseInt($("#movingCommentLimit").val());
    //    isMoveByCSS = $("#isMoveByCSS").prop("checked");
    isComeNg = $("#isComeNg").prop("checked");
    isComeDel = $("#isComeDel").prop("checked");
    fullNg = $("#fullNg").val();
    var beforeInpWinBottom = isInpWinBottom;
    isInpWinBottom = $("#isInpWinBottom").prop("checked");
    isCustomPostWin = $("#isCustomPostWin").prop("checked");
    isCancelWheel = $("#isCancelWheel").prop("checked");
    isVolumeWheel = $("#isVolumeWheel").prop("checked");
    changeMaxVolume = Math.min(100, Math.max(0, parseInt($("#changeMaxVolume").val())));
    isTimeVisible = $("#isTimeVisible").prop("checked");
    isSureReadComment = $("#isSureReadComment").prop("checked");
    settings.isCommentFormWithSide = $("#isCommentFormWithSide").prop("checked");
    sureReadRefreshx = Math.max(101, $("#sureReadRefreshx").val());
    //    isMovieResize = $("#isMovieResize").prop("checked");
    //    isMovieMaximize = $("#isMovieMaximize").prop("checked");
    settings.isAlwaysShowPanel = $("#isAlwaysShowPanel").prop("checked");
    commentBackColor = parseInt($("#commentBackColor").val());
    commentBackTrans = parseInt($("#commentBackTrans").val());
    commentTextColor = parseInt($("#commentTextColor").val());
    commentTextTrans = parseInt($("#commentTextTrans").val());
    isCommentPadZero = $("#isCommentPadZero").prop("checked");
    isCommentTBorder = $("#isCommentTBorder").prop("checked");
    timePosition = $('#itimePosition input[type="radio"][name="timePosition"]:checked').val();
    notifySeconds = parseInt($("#notifySeconds").val());
    cmblockia = Math.max(1, 1 + parseInt($("#beforeCMWait").val()));
    cmblockib = -Math.max(1, 1 + parseInt($("#afterCMWait").val()));
    isManualKeyCtrlR = $("#isManualKeyCtrlR").prop("checked");
    isManualKeyCtrlL = $("#isManualKeyCtrlL").prop("checked");
    isManualMouseBR = $("#isManualMouseBR").prop("checked");
    isCMBkR = $("#isCMBkR").prop("checked") && $("#isCMBlack").prop("checked");
    isCMsoundR = $("#isCMsoundR").prop("checked") && $("#isCMsoundoff").prop("checked");
    isCMsmlR = $("#isCMsmlR").prop("checked") && ($("#CMsmall").val() != 100);
    isTabSoundplay = $("#isTabSoundplay").prop("checked");
    isOpenPanelwCome = $("#isOpenPanelwCome").prop("checked");
    isProtitleVisible = $("#isProtitleVisible").prop("checked");
    protitlePosition = $('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val();
    proSamePosition = $('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
    isCommentWide = $('#isCommentWide').prop("checked");
    isProTextLarge = $('#isProTextLarge').prop("checked");
    kakikomiwait = parseInt($('#kakikomiwait').val());
    useEyecatch = $('#useEyecatch').prop("checked");
    isHidePopTL = $('#isHidePopTL').prop("checked");
    isHidePopBL = $('#isHidePopBL').prop("checked");
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            panelopenset[i][j] = $('#panelcustomTable [type="radio"][name="d' + i + '' + j + '"]:checked').val();
        }
    }
    comeMovingAreaTrim = $('#comeMovingAreaTrim').prop("checked");
    isHideButtons = $('#isHideButtons').prop("checked");
    isResizeSpacing = $('#isResizeSpacing').prop("checked");
    isDeleteStrangeCaps = $('#isDeleteStrangeCaps').prop("checked");
    //    isHighlightNewCome=$('#isHighlightNewCome').prop("checked");
    highlightNewCome = parseInt($('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]:checked').val());
    //    isChTimetableExpand=$('#isChTimetableExpand').prop("checked");
    isHidePopFresh = $('#isHidePopFresh').prop("checked");
    //    isChTimetableBreak=$('#isChTimetableBreak').prop("checked");
    //    isChTimetableWeekend=$('#isChTimetableWeekend').prop("checked");
    //    isChTimetablePlaybutton=$('#isChTimetablePlaybutton').prop("checked");
    isHideTwitterPanel = $('#isHideTwitterPanel').prop("checked");
    isHideTodayHighlight = $('#isHideTodayHighlight').prop("checked");
    isComelistNG = $('#isComelistNG').prop("checked");
    isComelistClickNG = $('#isComelistClickNG').prop("checked");
    highlightComeColor = parseInt($('#ihighlightComeColor input[type="radio"][name="highlightComeColor"]:checked').val());
    highlightComePower = parseInt($('#highlightComePower').val());
    isComeClickNGautoClose = $('#isComeClickNGautoClose').prop("checked");
    settings.isShareNGword = $('#isShareNGword').prop("checked");
    isDelOldTime = $('#isDelOldTime').prop("checked");
    isMovieSpacingZeroTop = $('#isMovieSpacingZeroTop').prop("checked");
    isMovieSpacingZeroLeft = $('#isMovieSpacingZeroLeft').prop("checked");
    comeFontsize = Math.min(99, Math.max(1, parseInt($('#comeFontsize').val())));
    isHideVoting = $('#isHideVoting').prop("checked");
    isStoreViewCounter = $('#isStoreViewCounter').prop("checked");
    isComeTriming = $('#isComeTriming').prop("checked");
    settings.panelOpacity =  parseInt($("#panelOpacity").val());
    comeFontsizeV = $('#comeFontsizeV').prop("checked");
    proTitleFontC = $('#proTitleFontC').prop("checked");
    isDelTime = $('#isDelTime').prop("checked");
    settings.mastodonFormat = $('#mastodonFormat').val();
    audibleReloadWait = Math.max(0, parseInt($('#audibleReloadWait').val()));

    arrayFullNgMaker();
    onresize();
    setOptionHead();
    setOptionElement();
    pophideSelector(-1, 0);
    if (settings.isShareNGword && !isNGwordShareInterval) { applySharedNGword(); }
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
        if (isProtitleVisible) {
            titleprop = protitlePosition;
        }
        if (isTimeVisible) {
            timeprop = timePosition;
        }
        sameprop = proSamePosition;
        if (bigtext === undefined) {
            bigtext = isProTextLarge;
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
    var b = $("#isCMBlack").prop("checked")
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
function panelTableUpdateA() {
    $('#panelcustomTable [type="radio"]').val([2]);
    cancelPopacti();
    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["222222222222"]);
}
function panelTableUpdateO() {
    $('#panelcustomTable [type="radio"][name^="d3"]').val([1]);
    cancelPopacti();
    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
}
function panelTableUpdateS() {
    var jo = $('#panelcustomTable [type="radio"]');
    var jv = $('#ipanelopenset [type="radio"][name="panelopenset"]:checked').val();
    if (jv == "333333333333") { return; }
    var js = jv.split('');
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            jo.filter('[name^="d' + i + '' + j + '"]').val([js[i * 3 + j]]);
        }
    }
    cancelPopacti();
}
function panelTableUpdateT() {
    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
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
        .children('[class^="styles__message___"]').css("color", tc)
        ;
    if (isCommentTBorder) {
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
    if (EXfoot === undefined) { return; } //未setEXs：now-on-air未表示：pophideする必要が無い
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
        if (isSureReadComment && settings.isCommentFormWithSide) {
            $(EXcomesend).show();
        }
    } else if (inp.side == -1) {
        EXside.style.transform = "translate(100%, -50%)";
        if (isSureReadComment && settings.isCommentFormWithSide) {
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
    if (inp.channellist == 1) {
        EXchli.style.transform = "translateX(0px)";
    } else if (inp.channellist == -1) {
        EXchli.style.transform = "translateX(100%)";
    } else if (inp.channellist == 0) {
        EXchli.style.transform = "";
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
    var htime = isTimeVisible ? ($('#forProEndTxt').height() + parseInt($('#forProEndTxt').css("padding-top")) + parseInt($('#forProEndTxt').css("padding-bottom")) + parseInt($('#forProEndTxt').css("margin-top")) + parseInt($('#forProEndTxt').css("margin-bottom"))) : 0;
    var htitle = isProtitleVisible ? ($('#tProtitle').height() + parseInt($('#tProtitle').css("padding-top")) + parseInt($('#tProtitle').css("padding-bottom")) + parseInt($('#tProtitle').css("margin-top")) + parseInt($('#tProtitle').css("margin-bottom"))) : 0;
    var ptime = (inptime !== undefined) ? inptime : (isTimeVisible ? timePosition : "");
    var ptitle = (inptitle !== undefined) ? inptitle : (isProtitleVisible ? protitlePosition : "");
    var psame = (inpsame !== undefined) ? inpsame : proSamePosition;
    //画面上部の設定
    if (!isComeTriming && $(EXhead).css("visibility") == "visible") {
        //ヘッダ表示時
        if (isInpWinBottom) {
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
        if (isInpWinBottom) {
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
            var margincut = 0;
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
    $(EXvolume).css("bottom", "")
    $(EXfullscr).css("bottom", "")
        ;
    if (!isComeTriming && $(EXfoot).css("visibility") == "visible") {
        //フッタ表示時
        if (isInpWinBottom) { // jctop,jfbot
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
        if (isInpWinBottom) { // jctop,jfbot
            var margincut = 0;
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
    if (isInpWinBottom) { //jctop,jfbot,jftop
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
    //console.log("form padding top, bottom", jfptop, jfpbot);
    if (isInpWinBottom) {
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
    $(elm).addClass(className)
}
function setEXs() {
    //ロード直後に取得が期待できるやつ
    //obliが遅くinfoはもっと遅い
    //infoはdelaysetの方でやる
    if (checkUrlPattern(true) != 3) { return; }
    var b = true;
    if (                                                                                  $('#main' ).length == 0 || !( EXmain          = $('#main' )[0] ))    b = false;// console.log("#main"); }
    if (! EXhead          &&!( EXhead          = getHeaderElement()              ) /*&& ($('.P_R'  ).length == 0 || !( EXhead          = $('.P_R'  )[0] ))*/) b = false;// console.log("head"); }//AppContainer__header-container___
    if (! EXmenu          &&!( EXmenu          = getMenuElement()                ) /*&& ($('.Fb_Fi').length == 0 || !( EXmenu          = $('.Fb_Fi')[0] ))*/) b = false;
    if (! EXfoot          &&!( EXfoot          = getFooterElement()              ) /*&& ($('.v3_v_').length == 0 || !( EXfoot          = $('.v3_v_')[0] ))*/) b = false;// console.log("foot"); }//TVContainer__footer-container___
    if (! EXfootcome      &&!( EXfootcome      = getFootcomeElement()            ) /*&& ($('.mb_mo').length == 0 || !( EXfootcome      = $('.mb_mo')[0] ))*/) b = false;// console.log("footcome"); }//右下の入れ物
    if (! EXcountview     &&!( EXcountview     = getViewCounterElement()         ) /*&& ($('.Eu_e' ).length == 0 || !( EXcountview     = $('.Eu_e' )[0] ))*/) b = false;// console.log("footcountview"); }//閲覧数
    if (! EXfootcountcome &&!( EXfootcountcome = getFootcomeBtnElement()         ) /*&& ($('.JH_e' ).length == 0 || !( EXfootcountcome = $('.JH_e' )[0] ))*/) b = false;// console.log("footcountcome"); }//コメント数
    if (! EXside          &&!( EXside          = getSideElement()                ) /*&& ($('.v3_v5').length == 0 || !( EXside          = $('.v3_v5')[0] ))*/) b = false;// console.log("side"); }//TVContainer__side___
    if (! EXchli          &&!( EXchli          = getChannelListElement()         ) /*&& ($('.mT_e' ).length == 0 || !( EXchli          = $('.mT_e' )[0] ))*/) b = false;// console.log("chli"); }
//    if (! EXinfo          &&!( EXinfo          = getInfoElement()                ) /*&& ($('.v3_wg').length == 0 || !( EXinfo          = $('.v3_wg')[0] ))*/) b = false;// console.log("info"); }//TVContainer__right-slide___
    if (! EXcomesendinp   &&!( EXcomesendinp   = getComeFormElement(0)           ) /*&& ($('.HH_HN').length == 0 || !( EXcomesendinp   = $('.HH_HN')[0] ))*/) b = false;// console.log("comesendinp"); }
    if (! EXcomesend      &&!( EXcomesend      = getComeFormElement(1)           ) /*&& ($('.HH_e' ).length == 0 || !( EXcomesend      = $('.HH_e' )[0] ))*/) b = false;// console.log("comesend"); }
    if (! EXcome          &&!( EXcome          = getComeFormElement(2)           ) /*&& ($('.v3_wi').length == 0 || !( EXcome          = $('.v3_wi')[0] ))*/) b = false;// console.log("come"); }//TVContainer__right-comment-area___
    if (! EXvolume        &&!( EXvolume        = getVolElement()                 ) /*&& ($('.mb_mk').length == 0 || !( EXvolume        = $('.mb_mk')[0] ))*/) b = false;// console.log("vol"); }
    if (! EXfullscr       &&!( EXfullscr       = getFullScreenElement()          ) /*&& ($('.mb_mi').length == 0 || !( EXvolume        = $('.mb_mi')[0] ))*/) b = false;// console.log("vol"); }
    if (! EXobli          &&!( EXobli          = getObliElement()                ) /*&& ($('.v3_ws').length == 0 || !( EXobli          = $('.v3_ws')[0] ))*/) b = false;// console.log("obli"); }//TVContainer__tv-container___
    if (! EXcomelist      &&!( EXcomelist      = getComeListElement()            ) /*&& ($('.uo_e' ).length == 0 || !( EXcomelist      = $('.uo_e' )[0] ))*/) b = false;
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
        addExtClass(EXchli, "channelList");
        addExtClass(EXinfo, 'info');
        addExtClass(EXcome, 'come');
        addExtClass(EXcomesend, 'comesend');
        addExtClass(EXcomesendinp, 'comesendinput');
        addExtClass(EXvolume, 'volume');
        addExtClass(EXfullscr, 'fullscr');
        addExtClass(EXobli, 'objectlist');
        addExtClass(EXcomelist, 'comelist');

        console.log("setEXs ok");
        //setEX2(); 残ってたchli.scrollをdelaysetに移動させてsetex2を空にした
        setOptionHead();    //各オプションをhead内に記述
        setOptionElement(); //各オプションを要素に直接適用
        if (!eventAdded) {
            setOptionEvent();   //各オプションによるイベントを作成
        }
    } else {
        console.log("setEXs retry "+(EXhead?".":"H")+(EXmenu?".":"M")+(EXfoot?".":"F")+(EXfootcome?"..":"Fc")+(EXcountview?".":"V")+(EXfootcountcome?"..":"Fb")+(EXside?".":"S")+(EXchli?"..":"L")+(EXcomesendinp?"..":"Ct")+(EXcomesend?"..":"Cf")+(EXcome?".":"C")+(EXvolume?"..":"Vo")+(EXfullscr?"..":"Fs")+(EXobli?".":"O")+(EXcomelist?"..":"Cl"));
        setTimeout(setEXs, 1000);
    }
}
/*function setEX2() {
    if (checkUrlPattern(true) != 3) { return; }
    var b = true;
    //if ($(EXchli).children('[class*="styles__current___"]').length == 0) { b = false; }
    //eyecatchの捕捉はexwatchingnumでなくvideoから使うようにする
    //if ((EXwatchingstr = $(EXchli).children('[class*="styles__current___"]').contents().find('img[class*="styles__logo___"]').prop("alt") || getEXWatchingStr()) == null) { b = false; }
    //else if ((EXwatchingnum = $(EXobli).contents().find('img[alt=' + EXwatchingstr + ']').parents().index()) == null) { b = false; }
    //else {
    var cn = getChannelByURL();
    if (cn){
        $(EXchli).scrollTop($(EXchli).find('img[src*="/channels/logo/' + cn + '"]').eq(0).parentsUntil(EXchli).eq(-2)[0].offsetTop-window.innerHeight/2);
        //$(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__current___"]').index() * 85 - $(EXside).position().top);
    }
    if (b == true) {
        console.log("setEX2 ok");
    } else {
        console.log("setEX2 retry");
        setTimeout(setEX2, 1000);
    }
}*/
function getHeaderElement(returnSingleSelector) {
    //console.log("?head");
    //左上のロゴを孫にもち上方にあるものをheaderとする
    var ret = $('[*|href$="/logo.svg#svg-body"]:not([href])').get(0);
    if(!ret){console.log("?head");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY" && b.top+b.height<window.innerHeight/4){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?head");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getElementSingleSelector(ret,sw,remove){
    //idがあれば要素名#idを返す
    //classが全体で唯一なら要素名.classを返す
    //sw 1:classが全体でその兄弟だけなら要素名.class:eq(index)を返す 2:classが兄弟で唯一なら要素名.classを返す
    //全体や兄弟に含めないid,classをremoveで受ける swを忘れないように注意する

    if(!ret) return null;
    var ren=ret.tagName;
    var rw=/\w/;
    var rt=/^\s+|\s+$/;
    var tms=ret.id;
    if(rw.test(tms)) return ren+'#'+tms.replace(rt,"");
    var rs=/\s/;
    tms=ret.className;
    var jo;
    var jolen;
    if(!rw.test(tms)) return null;
    var jr=null;
    if(remove&&remove.length>0){
        jr=$(remove[0]);
        for(var i=1;i<remove.length;i++) jr=jr.add(remove[i]);
    }
    var tma=tms.replace(rt,"").split(rs);
    for(var i=0;i<tma.length;i++){
        if(!rw.test(tma[i]) && tma[i].indexOf('ext_abm-')<0) continue; //拡張機能が付与したclassは除外
        tms=ren+'.'+tma[i].replace(rt,"");
        jo=$(tms).not(jr);
        jolen=jo.length;
        if(jolen==0) continue;
        if(jolen==1) return tms;
        else if(sw==1){
            jo=$(ret).siblings(tms).not(jr);
            if(jolen==1+jo.length) return tms+":eq("+$(ret).prevAll(tms).not(jr).length+")";
        }else if(sw==2&&$(ret).siblings(tms).not(jr).length==0) return tms;
    }
    console.log("?getElementSingleSelector:");
    console.log(ret);
    return null;
}
function getFooterElement(returnSingleSelector) {
    //console.log("?foot");
    //左下のチャンネルロゴを子孫にもち下方にあるものをfooterとする
    var cn = getChannelByURL();
    if (!cn){console.log("?footer");return null;}
    var jo = $('img[src*="/channels/logo/' + cn + '"]');
    var ret = null;
    for (var i = 0,e,b;(e=jo.get(i))&&(b=e.getBoundingClientRect()); i++) {
        if (b.top < window.innerHeight * 3 / 4 || b.left+b.width > window.innerWidth / 4) continue;
        ret=e;
        break;
    }
    if(!ret){console.log("?footer");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.top>window.innerHeight*3/4){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?footer");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getFootcomeElement(returnSingleSelector) {
    //console.log("?footcome");
    //コメントアイコンを孫にもち左下のチャンネルロゴと共通の親をもつものをfootcomeとする
    var cn = getChannelByURL();
    if (!cn){console.log("?footcome(!cn)");return null;}
    var reb = $(EXfoot).find('img[src*="/channels/logo/' + cn + '"]').get(0);
    if(!reb){console.log("?footcome(!reb)");return null;}
    var ret = $(EXfoot).find($('[*|href$="/comment.svg#svg-body"]:not([href])')).get(0);
    if(!ret){console.log("?footcome(!ret)");return null;}
    var rep=ret.parentElement;
    while(!$(ret).is(EXfoot)&&$(rep).find(reb).length==0){
        ret=rep;
        rep=ret.parentElement;
    }
    if($(ret).is(EXfoot)){console.log("?footcome(ret=EXfoot)");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getViewCounterElement(returnSingleSelector) {
    //console.log("?viewcounter");
    //ズバリ視聴数と書かれた小さい要素をviewcounterとする
    //見た目が変わるので探索に注意する
    var ret = null;
    var pa=document.getElementsByTagName("p");
    for(var i=0;i<pa.length;i++){
        if(pa[i].innerText.indexOf("視聴数")<0) continue;
        ret=pa[i];
        break;
    }
    if(!ret){console.log("?viewcounter");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.width<window.innerWidth/2&&b.height<window.innerHeight/4){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?viewcounter");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getFootcomeBtnElement(returnSingleSelector){
    if(!EXfootcome) return null;
    var ret=$(EXfootcome).find("button")[0];
    if(!ret) return null;
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getSideElement(returnSingleSelector) {
    //console.log("?side");
    //リストアイコンを孫にもち右方にあるものをsideとする
    var ret = $('[*|href$="/list.svg#svg-body"]:not([href])').get(0);
    if(!ret){console.log("?side");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth*3/4){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?side");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getInfoElement(returnSingleSelector) {
    //console.log("?info");
    //ズバリ番組概要と書かれた要素を孫にもち右方にあるものをinfoとする
    //copyinfo後だとinfoのdisplay:noneでclientrectが取れない
    var ret = null;
    var h3a=document.getElementsByTagName('h3');
    for(var i=0,t;i<h3a.length;i++){
        if(h3a[i].innerText.indexOf("番組概要")<0) continue;
        ret=h3a[i];
        break;
    }
    if(!ret){console.log("?info");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth/2){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?info");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getChannelListElement(returnSingleSelector) {
    //console.log("?chli");
    //右下にある番組表リンクを孫にもち右にあるのをchliとする //元々は直下がaリストだったけどその上のfooter,info等と同じ階層のを選ぶようにする
    var ret = null;
    var links = document.links;
    for (var i = links.length - 1,b; i >= 0; i--) {
        b=links[i].getBoundingClientRect();
        if (links[i].href.indexOf("/timetable") < 0 || b.top < window.innerHeight * 3 / 4||b.left<window.innerWidth/2) continue;
        ret = links[i];
        break;
    }
    if(!ret){console.log("?chli");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth/2){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?chli");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
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
        var p=e.parentElement;
        var b=p.getBoundingClientRect();
        while(p.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth*2/3){
            e=p;
            p=e.parentElement;
            b=p.getBoundingClientRect();
        }
        if(p.tagName.toUpperCase()=="BODY"){console.log("?comeform"+sw+"(p=BODY)");return null;}
        ret=e;
    }
    if(!ret){console.log("?comeform"+sw+"(ret=null)");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getComeListElement(returnSingleSelector){
    console.log("?comelist");
    //EXcomeの中で秒前とかを探して5人以上の親をcomelistとする
    //下からだとanimatedが引っかかるので上から探す
    //無ければ <p>この番組には<br>まだ投稿がありません</p> の親divとしてみたけどやめて大丈夫そうならやめたいが、
    //やっぱりanimatedに引っかかる(初回は全部animated)からまだ投稿～で取るようにする
    var ret=null;
    var jo=$(EXcome).find("p");
    if(jo.length<5){
        for(var i=0;i<jo.length;i++){
            if(jo.eq(i).text().indexOf("まだ投稿がありません")<0) continue;
            ret=jo.eq(i).parent("div")[0];
            break;
        }
        if(!ret){console.log("?comelist(emptylist notfound)");return null;}
        return returnSingleSelector?getElementSingleSelector(ret):ret;
    }

    for(var i=0,t;i<jo.length;i++){
        t=jo.eq(i).text();
        if(t.indexOf("秒前")<0&&t.indexOf("分前")<0) continue;
        ret=true;
        jo=jo.eq(i).parentsUntil(EXcome);
        break;
    }
    if(!ret){console.log("?comelist(time notfound)");return null;}
    ret=null;
    for(var i=jo.length-1,j;i>=0;i--){
        j=jo.eq(i);
        if(j.find(EXcomesend).length>0) continue;
        if(j.children().length<5) continue;
        ret=jo[i];
        break;
    }
    if(!ret){console.log("?comelist(children notfound)");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getVolElement(returnSingleSelector){
    //console.log("?vol");
    //音声アイコンを含んで右下のをvolとする
    var ret = $('[*|href$="/volume_on.svg#svg-body"]:not([href])').add('[*|href$="/volume_off.svg#svg-body"]:not([href])').get(0);
    if(!ret){console.log("?getvol");return null;}
    var rep=ret.parentElement;
    var b=rep.getBoundingClientRect();
    while(rep.tagName.toUpperCase()!="BODY"&&b.left>window.innerWidth*2/3&&b.top>window.innerHeight*2/3){
        ret=rep;
        rep=ret.parentElement;
        b=rep.getBoundingClientRect();
    }
    if(rep.tagName.toUpperCase()=="BODY"){console.log("?getvol");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getObliElement(returnSingleSelector){
    //console.log("?obli");
    //videoを含んで子沢山をobliとする
    var ret=$('video').get(0);
    if(!ret){console.log("?obli");return null;}
    while(ret.tagName.toUpperCase!="BODY"&&ret.childElementCount<16){
        ret=ret.parentElement;
    }
    if(ret.tagName.toUpperCase=="BODY"){console.log("?obli");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
/*function getEXWatchingStr(){
    console.log("?exws");
    var ret=null;
    var chlic=$(EXchli);
    while(chlic.children().length<16){
        chlic=chlic.children().first();
    }
    chlic=chlic.children();
    for(var i=0,t;i<chlic.length;i++){
        if(chlic.eq(i).children("div").length>1){
            t=chlic.eq(i).find('img[src*="/channels/logo/"]');
            if(t.length>0){
                ret=t.eq(0).prop("alt");
                break;
            }
        }
    }
    return ret;
}*/
function getFullScreenElement(returnSingleSelector){
    //console.log("?fullscreen");
    var ret = $('[*|href$="/full_screen.svg#svg-body"]:not([href])').first().parentsUntil("button").parent().get(0);
    if(!ret){console.log("?fullscreen");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
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
    for(var i=0,m=0;i<la.length;i++){
        if(m<la[i][1]){
            m=la[i][1];
            ret=la[i][0];
        }
    }
    if(!ret){console.log("?menu");return null;}
    return returnSingleSelector?getElementSingleSelector(ret):ret;
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
            if (tlinkc > 0) {
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
        for (var i = alinks.length - 1, m = 0, mi = -1; i >= 0; i--) {
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
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getReceiveTwtElement(returnSingleSelector){
    //左下にあるtwtアイコンの親で左下のを選ぶ
    var jo=$('[*|href$="/images/icons/twitter.svg#svg-body"]:not([href])');
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
    return returnSingleSelector?getElementSingleSelector(ret):ret;
}
function getComeModuleElements(returnSingleSelector){
    //投稿ボタンの祖先でtextareaと共通の祖先の子 と投稿ボタン とtwtコンテナを返す
    var jo=$(EXcomesend).find("button");
    var ret=[null,null,null];
    for(var i=0;i<jo.length;i++){
        if(jo.eq(i).text().indexOf("投稿")<0) continue;
        ret[1]=jo[i];
        jo=jo.eq(i).parentsUntil(EXcome);
        break;
    }
    if(!ret[1]) return ret;
    if(jo.length<2) return ret;
    for(var i=1;i<jo.length;i++){
        if(jo.eq(i).find(EXcomesendinp).length==0) continue;
        ret[0]=jo[i-1];
        break;
    }
    if(!ret[0]) return ret;

    var jo=$(ret[0]).find($('[*|href$="/images/icons/twitter.svg#svg-body"]:not([href])'));
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
            if(jp.eq(k+1).innerWidth()==0||jp.eq(k).innerWidth()==0) break;
            if(jp.eq(k+1).innerWidth()<jp.eq(k).innerWidth()+10) continue;
            ret[2]=jp[k];
            break;
        }
        break;
    }
    if(returnSingleSelector){
        ret[0]=getElementSingleSelector(ret[0]);
        ret[1]=getElementSingleSelector(ret[1]);
        ret[2]=getElementSingleSelector(ret[2]);
    }
    return ret;
}
function getVideoRouteClasses(){
    //EXobli>各chコンテナ>背景画像,videoの親..からvideoの親のclassを選ぶ
    var jo= $(EXobli).find('video,object').first().parentsUntil(EXobli).eq(-2);
    return [jo.first().prop("class"), jo.siblings('img[src*="/channels/logo/"]').first().prop("class")];
}
function getTTProgramTitleClass(){
    // 0:ビデオのN、1～その他、10くらいから番組タイトル
    //後ろから取るが、番組表の後ろに要素が新設されても対応できるように適当なオフセットを設けておく
    return $(EXTTbody).find('span').map(function(i,e){if(e.childElementCount==0&&e.className!=""&&e.innerText!="")return e;}).eq(-5).prop("class");
}
function getTTTimeClassFromPT(proTitleClass,sw){
    // sw 0:過去 1:放送中 2:放送予定 の背景を司るクラスを番組タイトルクラスから探す
    // programtitleの親のarticleの子のbuttonの子のdivが灰/緑/白の背景を持っているのでそれを探す
    //　'.'を付けたクラス名で受ける(ここでは付けない)

    if(!proTitleClass){
        proTitleClass=getTTProgramTitleClass();
        if(!proTitleClass) return null;
        else proTitleClass="."+proTitleClass;
    }

    var jb=$(EXTTbody);
    var jo=jb.find(proTitleClass);
    var re=/rgba?\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *\d+ *,?)? *\)/;
    var rs=/\s/;
    var rr=/^\s+|\s+$/;
    for(var i=0,j,t,e,r,g,b,c,m,n;i<jo.length;i++){
        j=jo.eq(i).parentsUntil("article").eq(-2);
        t=j.css("background-color");
        if(!re.test(t))continue;
        e=re.exec(t);
        r=parseInt(e[1]);
        g=parseInt(e[2]);
        b=parseInt(e[3]);
        if(!(sw==2&&r>248&&g>248&&b>248)&&!(sw==0&&r<248&&g<248&&b<248)&&!(sw==1&&r<248&&g>248&&b<248)) continue;
        c=j.prop("class").split(rs);

        //3クラスのうち2つは全部に付いてるので一番少ないクラスを探す
        m=9999;
        n=null;
        for(var k=0,d,l;k<c.length;k++){
          d=c[k].replace(rr,"");
          if(!d) continue;
          l=jb.find('.'+d).length;
          if(m<l) continue;
          m=l;
          n=d;
        }
        return n;
    }
    return null;
}
function getTTLRArrowContainerElement(returnSingleSelector){
    //右アイコンの親buttonの親divを選ぶ 左アイコンはスクロール左端にいる初期状態では存在しないので無視する
    // z-indexがautoでないdivを探す方が適切かもしれない
    var jo=$('[*|href$="/images/icons/chevron_right.svg#svg-body"]:not([href])');
    if(jo.length==0) return null;
    var eo=jo[0];
    var ret=eo.parentElement;
    while(ret.tagName.toUpperCase()!="BODY"&&eo.tagName.toUpperCase()!="BUTTON"){
        eo=ep;
        ret=eo.parentElement;
    }
    if(ret.tagName.toUpperCase()=="BODY") return null;
    return returnSingleSelector?getElementSingleSelector(ret):ret;
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
        for(var j=0;j<ns[0][3].length;j++){
            ts=ts+"."+ns[0][3][j];
        }
        ns[0][2]=ta.prevAll(ts).length;
    }else{
        ns[0][2]=0;
    }
    for(var i=0;i<pa.length;i++){
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
            for(var j=0,k=0;j<tt.length;j++){
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
            for(var j=0;j<ns[i+1][3].length;j++){
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
        for(var j=0;j<ns[0][3].length;j++){
            ts=ts+"."+ns[0][3][j];
        }
    }
    if(includeIndex>0){
        ts=ts+":eq("+ns[0][2]+")";
    }
    ps=ts;
    for(var i=1;i<ns.length-1;i++){
        if(includeIndex==2){
            ts="*";
        }else{
            ts=ns[i][0];
        }
        if(includeID && ns[i][1].length>0){
            ts=ts+"#"+ns[i][1];
        }
        if(includeClass>0){
            for(var j=0;j<ns[i][3].length;j++){
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
function isComeOpen(sw) {
    //console.trace('isComeOpen()')
    if (sw === undefined) { sw = 0; }
    var eo = EXcome;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = jo.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
    }
    var bc = (eo.style.transform == "translateX(0px)");
    var bd = (jo.offset().left < window.innerWidth);
    switch (sw) {
        case 0:
            //            return $(EXcome).is('[class*="TVContainer__right-slide--shown___"]');
            return bb;
            break;
        case 1:
            //            return (EXcome.style.transform=="translateX(0px)");
            return bc;
            break;
        case 2:
            //            return $(EXcome).is('[class*="TVContainer__right-slide--shown___"]')||(EXcome.style.transform=="translateX(0px)");
            return bb || bc;
            break;
        case 3:
            return bd;
            break;
        default:
    }
}
function isSlideOpen() {
    //    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
    //    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length>0)?true:false;
    return $(EXfoot).nextAll().is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
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
        bb = jo.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
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
    var eo = EXchli;
    var jo = $(eo);
    var bs = jo.attr("aria-hidden");
    var bb;
    if (bs == "true" || bs == "false") {
        bb = (bs == "false");
    } else {
        bb = jo.is('[class*="styles__right-slide--shown___"]');//TVContainer__right-slide--shown___
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
        bb = jo.is('[class*="styles__right-slide--shown__"]');
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
    if (!EXvolume) { return; }
    var teka = document.createEvent("MouseEvents");
    //    var teki=$('[class^="styles__slider-container___"]').children();
    var teki = getVolbarObject();
    if(teki==null)return;
    var maxvol=teki.parent().height();
    var targetvolume = Math.min(maxvol, Math.max(0, Math.floor(maxvol * changeMaxVolume / 100)));
    teki=teki.parent().parent();
    var teku = teki.offset().top + parseInt(teki.css("padding-top")) + maxvol - targetvolume;
    teka.initMouseEvent("mousedown", true, true, window, 0, 0, 0, teki.offset().left + 15, teku);
    setTimeout(otomouseup, 100, teku);
    return teki[0].dispatchEvent(teka);
}
function moVol(d) {
console.log("movol "+d);
    if (!EXvolume) { return; }
    var teka = document.createEvent("MouseEvents");
    var teki = getVolbarObject();
    if(teki==null)return;
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
    if (!EXvolume) { return; }
    var teka = document.createEvent("MouseEvents");
    var teki = getVolbarObject();
    if(teki==null)return;
    teka.initMouseEvent("mouseup", true, true, window, 0, 0, 0, teki.parent().parent().offset().left + 15, p);
    setTimeout(volbar, 100);
    return teki[0].dispatchEvent(teka);
}
function otoColor() {
    var jo = $(EXvolume).contents().find('svg');
    if (jo.length == 0) { return; }
    if (jo.css("fill") == "rgb(255, 255, 255)") {
        jo.css("fill", "red");
        setTimeout(otoColor, 800);
    } else {
        jo.css("fill", "");
    }
}
function otoSize(ts) {
    var jo = $(EXvolume).contents().find('svg');
    if (jo.length == 0) { return; }
    if (jo.css("zoom") == "1") {
        jo.css("zoom", ts);
        setTimeout(otoSize, 400);
    } else {
        jo.css("zoom", "");
    }
}
function volbar() {
    if (checkUrlPattern(true) != 3) { return; }
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
    if (checkUrlPattern(true) != 3) { return; }
    //console.log("comeColor:"+inp);
    if (!EXfootcountcome) { return; }
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
function chkcomelist(retrycount) {
    //console.log("chkcomelist#"+retrycount);
    if($(EXcomelist).length==0)return;
    var comeListLen = EXcomelist.childElementCount;
    if (EXcomelist.firstElementChild.className.indexOf('styles__animation___') >= 0) { comeListLen--; }//冒頭のanimationは数から除外
    //console.log("chkcomelist#"+retrycount+",comelistlen="+comeListLen);
    if (comeListLen <= sureReadRefreshx && (comeListLen > 1 || retrycount == 0)) {
        //console.log("comeRefreshed " + commentNum + "->" + comeListLen);
        comeRefreshing = false;
        comeFastOpen = false;
        commentNum = comeListLen;
        comeHealth = Math.min(100, Math.max(0, commentNum));
        comeColor($(EXfootcountcome), comeHealth);
        if (isComelistNG) {
            copycome();
        }
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
        waitforOpenCome(1);
    } else if (retrycount > 0) {
        setTimeout(waitforOpenableCome, 10, retrycount - 1);
    } else {
        comeRefreshing = false;
        comeFastOpen = false;
    }
}
function waitforCloseSlide(retrycount) {
    //console.log("waitforCloseSlide#"+retrycount);
    if (comeRefreshing) { return; }
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
    if (comeFastOpen) { return; }
    if (!isComeOpen()) {
        waitforOpenableCome(1);
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
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent();
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var forpros = $(".forpros");
    var bsize = (bigtext !== undefined) ? bigtext : isProTextLarge;
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
        .find('[class*="styles__default-input-text___"]').css("height", "")
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
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent();
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var forpros = $(".forpros");
    var forprot = $("#forProEndTxt");
    var tpro = $("#tProtitle");
    var fproh = forprot.height() + parseInt(forprot.css("padding-top")) + parseInt(forprot.css("padding-bottom")) + parseInt(forprot.css("margin-top")) + parseInt(forprot.css("margin-bottom"));
    var tproh = tpro.height() + parseInt(tpro.css("padding-top")) + parseInt(tpro.css("padding-bottom")) + parseInt(tpro.css("margin-top")) + parseInt(tpro.css("margin-bottom"));
    var tprow = tpro.width() + parseInt(tpro.css("padding-left")) + parseInt(tpro.css("padding-right")) + parseInt(tpro.css("margin-left")) + parseInt(tpro.css("margin-right"));
    var fprow = forprot.width() + parseInt(forprot.css("padding-top")) + parseInt(forprot.css("padding-bottom")) + parseInt(forprot.css("margin-top")) + parseInt(forprot.css("margin-bottom"));
    var timeshown = inptime;
    //    var bigtext=(inpbig!==undefined)?bigtext:isProTextLarge;
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
                    prehoverContents.css("margin-right", isComeTriming?"":"310px")
                        .css("margin-top", "")
                        .css("margin-left", "12px")
                        .prev().css("margin-top", "")
                        .contents().find('li').slice(1).css("margin-left", "12px")
                        ;
                } else {
                    prehoverContents.css("margin-right", isComeTriming?"":"310px")
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
    if (!EXinfo) { return; }
    if (sw) {
        $(EXinfo).css("transform", "translateX(0)");
        proinfoOpened = true; //クリックで解除できるようにする
    } else {
        $(EXinfo).css("transform", "");
        proinfoOpened = false;
    }
}
function createProtitle(sw, bt) {
    if (!EXcome) { return; }
    if (sw == 0) {
        if ($("#tProtitle").length == 0) {
            var eProtitle = '<span id="tProtitle" class="usermade" style="';
            //            eProtitle+='position:absolute;right:0;font-size:'+(bt?"medium":"x-small")+';padding:4px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14;background-color:transparent;top:0px;';
            eProtitle += 'font-size:' + (bt ? "medium" : "x-small") + ';position:absolute;top:0px;right:0';
            eProtitle += '">未取得</span>';
            //            EXcome.insertBefore(eProtitle,EXcome.firstChild);
            $(eProtitle).prependTo(EXcome);
            //番組名クリックで番組情報タブ開閉
            $("#tProtitle").on("click", function () {
                if (!EXinfo) { return; }
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
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent();
    var headlogo = prehoverContents.siblings().first();
    var parexfootcount = $(EXfootcount).parent();
    var footlogo = $(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var tpro = $("#tProtitle");
    //    var bigtext=(bigpar!==undefined)?bigpar:isProTextLarge;
    var tproh = tpro.height() + parseInt(tpro.css("padding-top")) + parseInt(tpro.css("padding-bottom"));
    var tprouc = tpro.height() + parseInt(tpro.css("padding-top"));
    var headh = $(EXhead).height();
    var tprow = tpro.width() + parseInt(tpro.css("padding-left")) + parseInt(tpro.css("padding-right")) + parseInt(tpro.css("margin-left")) + parseInt(tpro.css("margin-right"));
    var par = titlepar;
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
            if (isComeTriming && tprow <= 320) break;
            var hmt = (tproh - 12) + Math.floor((headh - tproh - 12) / 2);
            prehoverContents.css("margin-top", hmt + "px")
                .prev().css("margin-top", hmt + "px")
                ;
            break;
        default:
    }
    switch (par) {
        case "windowtopleft":
        case "headerleft":
            var hmt = (tproh + 8 - 18) + Math.floor((headh - tproh - 8 - 18) / 2);
            headlogo.css("margin-top", hmt + "px")
                .next().css("margin-top", hmt + "px")
                ;
            if (bigpar)
                headlogo.next().find('[class*="styles__default-input-text___"]').css("height", (headh - tprouc) + "px");
            break;
        default:
    }
    switch (par) {
        case "windowbottomright":
        case "footerright":
            var fmb = tproh;
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
            var fmb = tproh;
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
    if (proTitleFontC) {
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
        tpro.css("color", "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (commentTextTrans / 255) + ")");
    else
        tpro.css("color", "");

}
function createTime(sw, bt) {
    //console.log("createTime:"+sw);
    if (!EXcome) { return; }
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
    if (c <= 0) { return; }
    var jo = $('#forProEndTxt');
    if (jo.css("display") == "none") { return; }
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
    var prehoverContents = $('[class*="Dropdown__button___"]').parent().parent();
    var parexfootcount = $(EXfootcount).parent();
    var forpros = $(".forpros");
    //    var bigtext=(bigpar!==undefined)?bigpar:isProTextLarge;
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
            if (isComeTriming) break;
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
    if (proTitleFontC && (par == "commentinputtop" || par == "commentinputbottom")) {
        $("#forProEndTxt").css("color", "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (commentTextTrans / 255) + ")");
        $("#forProEndBk").css("background-color", "rgba(" + commentBackColor + "," + commentBackColor + "," + commentBackColor + "," + (0.2) + ")");
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
    var selCome,selComesend,selComesendinpp,selComesendinp,selComelist,selComelistp,selHead,selFoot,selSide,selChli,selInfo,selObli;
    var alt=false;

    //投稿ボタン削除（入力欄1行化はこの下のコメ見た目のほうとoptionElementでやる）
    //後から生成される場合ここだとクラス名決め打ちになるのでfocus時のcomemoduleeditorでやる
    //if (isCustomPostWin) {
    //    t += '.hw_hy.HH_HR{display:none;}'
    //}
    //twtパネルのように再生成されるかもしれないのでmoduleeditorからこのoptionheadを再実行して適用させる
    if (isCustomPostWin&&EXcomemodule) {
        to=getElementSingleSelector(EXcomemodule);
        if($(to).length!=1){
            console.log("?EXcomemodule "+to);
            to=alt?'.hw_hy.HH_HR':'';
        }
        if(to){
            t += to+'{display:none;}';
        }
    }

    //コメント見た目
    var bc = "rgba(" + commentBackColor + "," + commentBackColor + "," + commentBackColor + "," + (commentBackTrans / 255) + ")";//コメント背景色
    var cc = "rgba(" + commentBackColor + "," + commentBackColor + "," + commentBackColor + "," + (0.2) + ")";
    var rc = "rgba(" + Math.floor(255 - (255 - commentTextColor) * 0.8) + "," + Math.floor(commentTextColor * 0.8) + "," + Math.floor(commentTextColor * 0.8) + "," + (commentTextTrans / 255) + ")";//赤系のコメント文字色(NG登録で使用)
    var tc = "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (commentTextTrans / 255) + ")";//コメント文字色
    var uc = "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (0.2) + ")";//コメント入力欄背景色
    var vc = "rgba(" + commentTextColor + "," + commentTextColor + "," + commentTextColor + "," + (0.3) + ")";//コメント一覧区切り線色

    selCome=getElementSingleSelector(EXcome);
    if($(selCome).length!=1){
        console.log("?EXcome "+selCome);
        selCome=alt?".v3_wi":"";
    }
    if(selCome){
        t += selCome+'{background-color:transparent;}';
        t += selCome+'>*{background-color:transparent;}';
    }

    selComesend=getElementSingleSelector(EXcomesend);
    if($(selComesend).length!=1){
        console.log("?EXcomesend "+selComesend);
        selComesend=alt?".HH_e":"";
    }
    if(selComesend){
        t += selComesend+'{background-color:' + bc + ';}';
    }

    selComesendinpp=getElementSingleSelector(EXcomesendinp.parentElement);
    if($(selComesendinpp).length!=1){
        console.log("?EXcomesendinp.parentElement "+selComesendinpp);
        selComesendinpp=alt?".HH_HL":"";
    }
    if(selComesendinpp){
        t += selComesendinpp+'{background-color:' + uc + ';}';
    }

    selComesendinp=getElementSingleSelector(EXcomesendinp);
    if($(selComesendinp).length!=1){
        console.log("?EXcomesendinp "+selComesendinp);
        selComesendinp=alt?".HH_HN":"";
    }
    if(selComesendinp){
        t += selComesendinp+'{background-color:' + uc + ';color:' + tc + ';}';
        t += selComesendinp+'+*{background-color:' + cc + ';color:' + tc + ';}';
    }

    //EXcomelistのコピー#copycomecがあるので注意する
    selComelist=getElementSingleSelector(EXcomelist,0,["#copycomec"]);
    if($(selComelist).not("#copycomec").length!=1){
        console.log("?EXcomelist "+selComelist);
        selComelist=alt?".uo_e":"";
    }
    selComelistp=EXcomelist?getElementSingleSelector(EXcomelist.parentElement,0,["#copycome"]):null;
    if($(selComelistp).not("#copycome").length!=1){
        console.log("?EXcomelist.parent "+selComelistp);
        selComelistp=alt?".Ai_Am.t7_e":"";
    }
    if(selComelist){
        t += selComelist+'>div{background-color:' + bc + ';color:' + tc + ';}';
        t += selComelist+'>div:first-child>div{display:none;}';//コメント欄のスライドするように出てくる新着コメントは非表示(拡張のスタイルが反映されないので)
        t += selComelist+'>div>p:nth-child(1){color:' + tc + ';}';//コメント文字色
    }

    //    //映像最大化
    ////    if(isMovieMaximize||isSureReadComment){
    //    if(isSureReadComment){
    //        t+='[class*="TVContainer__tv-container___"]{width:100%;';
    ////        if(isMovieMaximize){
    ////            t+='height:100%;';
    ////        }
    //        t+='}';
    //        t+='[class*="TVContainer__tv-container___"]>[class*="TVContainer__resize-screen___"]{';
    ////        if(isMovieMaximize){
    ////            t+='width:100%!important;height:100%!important;';
    ////        }else if(isSureReadComment){
    //        if(isSureReadComment){
    //            t+='max-width:calc(100% - 310px);';
    //        }
    //        t+='}';
    //    }

    if(selComelist&&selComelistp){
        //コメ欄スクロールバー非表示
        if (isInpWinBottom) {//コメ逆順の時は対象が逆になる
            t += selComelistp+'{overflow:hidden;}';
            t += selComelist+'{';
        } else {
            t += selComelist+'{overflow:hidden;}';
            t += selComelistp+'{';
        }
        if (isHideOldComment) {
            t += 'overflow:hidden;';
        } else {
            t += 'overflow-x:hidden;overflow-y:scroll;';
        }
        t += '}';

        //ユーザースクリプトのngconfigのz-index変更
        t += '#NGConfig{z-index:20;}';
        if (isInpWinBottom) { //コメ入力欄を下
            if(selCome) t += selCome+'>*{display:flex;flex-direction:column-reverse;}';
            t += selComelistp+'{display:flex;flex-direction:column;justify-content:flex-end;border-top:1px solid ' + vc + ';border-bottom:1px solid ' + vc + ';}';
            t += selComelist+'{display:flex;flex-direction:column-reverse;}';
            t += selComelist+'>div{overflow:visible;min-height:min-content;}';//min-heightがないとdislay:flexで重なってしまう
            //↑の構成そのままだと各コメントのデフォ間隔padding:15px 15px 0;のtop,bottomがうまく効かなくなってしまう
            //2つめのflex(下スクロール、コメント少数時の下詰め)を解除すれば有効になるけど、下スクロールを解除したくない
            //各コメントの中身(本文、投稿時刻)にpadding設定したらうまくいった→min-height指定で不要に
            /*if (!isCommentPadZero) {
                    t += '[class^="styles__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{padding-top:0px;padding-bottom:0px;}';
                    t += '[class^="styles__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div>p{padding-top:12px;padding-bottom:3px;}';
            }*/
        }
        t += selComelist+'>div{padding:0 15px;}';//copycomeじゃない方に適用されてる公式のcssのmarginを個々のコメントのpaddingにする
        //    if(isCustomPostWin){ //1行化
        //        t+='[class^="TVContainer__right-comment-area___"] textarea{height:18px!important;}';
        //        t+='[class^="TVContainer__right-comment-area___"] textarea+div{height:18px!important;}';
        //    }
        if (isCommentPadZero) { //コメ間隔詰め
            t += selComelist+'>div{padding-top:0px;padding-bottom:0px;}';
            t += selComelist+'>div>*{margin-top:0px;margin-bottom:0px!important;}';//bottomはあったり無かったりする(これより強い)ので付けておく
        }
        if (isCommentTBorder) { //コメ区切り線
            t += selComelist+'>div{border-top:1px solid ' + vc + ';}';
            if (isInpWinBottom) { //先頭コメ(一番下)の下にも線を引く
                t += selComelist+'>div:first{border-bottom:1px solid ' + vc + ';}';
            }
        }
        if (isCommentWide) { //コメント部分をほんの少し広く
            t += selComelist+'>div{padding-right:4px;padding-left:8px;}';
            t += selComelist+'>div>p:first{width:' + (isHideOldComment ? 258 : 242) + 'px;}';
            //フォントによるがそれぞれ259,243でギリギリなので1だけ余裕をみる
            t += selComelist+'{margin:0;}';
        }
    }

    //各パネルの常時表示 隠す場合は積極的にelement.cssに隠す旨を記述する(fade-out等に任せたり単にcss除去で済まさない)
    //もしくは常時隠して表示する場合に記述する、つまり表示切替の一切を自力でやる
    //（コメ欄常時表示で黒帯パネルの表示切替が発生した時のレイアウト崩れを防ぐため）

    selHead=getElementSingleSelector(EXhead);
    if($(selHead).length!=1){
        console.log("?EXhead "+selHead);
        selHead=alt?".P_R":"";
    }
    if(selHead){
        t += selHead+'{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selFoot=getElementSingleSelector(EXfoot);
    if($(selFoot).length!=1){
        console.log("?EXfoot "+selFoot);
        selFoot=alt?".v3_v_":"";
    }
    if(selFoot){
        t += selFoot+'{visibility:visible;opacity:1;transform:translate(0);}';
    }

    selSide=getElementSingleSelector(EXside);
    if($(selSide).length!=1){
        console.log("?EXside "+selSide);
        selSide=alt?".v3_v5":"";
    }
    if(selSide){
        t += selSide+'{transform:translateY(-50%);z-index:20;opacity:0.5}';
    }

    selChli=getElementSingleSelector(EXchli);
    if($(selChli).length!=1){
        console.log("?EXchli "+selChli);
        selChli=alt?".v3_wk":"";
    }
    if(selChli){
        t += selChli+'{z-index:15;}';//head11より上の残り時間12,13,14より上
    }

    selInfo=getElementSingleSelector(EXinfo);
    if($(selInfo).length!=1){
        console.log("?EXinfo "+selInfo);
        selInfo=alt?".v3_wg":"";
    }
    if(selInfo){
        t += selInfo+'{z-index:15;}';
    }

    if(selCome) t += selCome+' *{z-index:11;}';//foot10より上(foot内の全画面・音ボタンをマスク)
    if(selComelist) t += selComelist+'{margin:0px}';

    //左上・左下の非表示
    jo=getReceiveNotifyElement();
    if(!jo || !((to=getElementSingleSelector(jo))&&$(to).length==1)){
        console.log("?ad-reserve");
        to=alt?'.v3_wC':"";
    }
    if(to){
        t += to+'{z-index:8;'; //元はoverlapと同じ3 通知を受け取る
        if (isHidePopBL) {
            t += 'transform:translateX(-170px);';
        }
        t+='}';
    }

    //twitter通知パネル すぐには生成されないので遅延適用するためdelaysetのループへ
    //生成されたらこのoptionheadを再実行して適用させる
    jo=getReceiveTwtElement();
    if(!jo || !((to=getElementSingleSelector(jo))&&$(to).length==1)){
        console.log("?twtPanel");
        to=alt?'.v3_wA':"";
    }
    if(to){
        t += to+'{z-index:9;'; //元が4(overlapは元3)なのでoverlapよりは上に置く
        if (isHideTwitterPanel) {
            t += 'transform:translateX(-20px) translateX(-100%);';
        }
        t += '}';
    }

    selObli=getElementSingleSelector(EXobli);
    if($(selObli).length!=1){
        console.log("?EXobli "+selObli);
        selObli=alt?".v3_ws":"";
    }
    if (isHidePopTL&&selObli) {
        //直接指定しようとするといつか出た時の短時間にgetしないといけないので映像以外を消す
        to=getVideoRouteClasses();
        if(!to[0]||!to[1]){
            console.log("?videoRouteClass "+to[0]+","+to[1]);
            to=alt?[".qJ_e",".Aq_bT"]:["",""];
        }else to=['.'+to[0],'.'+to[1]];
        //.Aq_Ay .Aq_AA
        if(to[0]&&to[1]){
            t += selObli+'>div>div:not('+to[0]+'){display:none;}';
            t += selObli+'>div>img:not('+to[1]+'){display:none;}';
        }
        //t += '[class*="styles__eyecatch-blind___"]{display:none;}';
    }
    //z-index調整、コメ流す範囲
    t += '#moveContainer{z-index:7;';
    if (comeMovingAreaTrim) {
        t += 'position:absolute;top:0;left:0;overflow:hidden;height:100%;';
    }
    t += '}';
    t += overlapSelector + '{z-index:8;}';
    t += '#ComeMukouMask{z-index:6;}';
    t += '[class*="styles__fresh-panel___"]{z-index:9;'; //元は4
    if (isHidePopFresh) {
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
    if (isHideButtons) {
        to=getElementSingleSelector(EXfullscr);
        if($(to).length!=1){
            console.log("?fullscreen "+to);
            to=alt&&selFoot?selFoot+" .mb_mi":"";
        }
        if(to){
            t += to+'{opacity:0;visibility:hidden;}';
        }

        to=getElementSingleSelector(EXvolume);
        if($(to).length!=1){
            console.log("?volume "+to);
            to=alt&selFoot?selFoot+" .mb_mk":"";
        }
        if(to){
            t += to+'{opacity:0;visibility:hidden;}';
        }
    }

/*
    //自動更新停止アイコン用
    t += '.reloadicon{fill:rgba(255,255,255,0.5);position:absolute;right:0;top:9px;}';
    t += '#reloadon{transform:rotate3d(3,-2,0,180deg);}';
    t += '#reloadoff{pointer-events:none;}';
    t += '[class^="styles__right-comment-area___"] [class*="styles__comment-form___"]{padding-right:0;}';
    t += '[class^="styles__right-comment-area___"] [class^="styles__opened-textarea-wrapper___"]{padding-right:23px;}';
    t += '[class^="styles__right-comment-area___"] textarea{width:calc(100% - 8px * 2 - 15px);}';
*/
    //残り時間用
    t += '#forProEndBk{padding:0px 0px;margin:4px 0px;background-color:rgba(255,255,255,0.2);z-index:12!important;}';
    t += '#forProEndTxt{padding:4px 5px 4px 11px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t += '#proTimeEpNum{padding:4px 0px;background-color:transparent;z-index:13!important;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;align-items:center;}';
    t += '#tProtitle{padding:4px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:14!important;background-color:transparent;}';
    t += '#proTimeEpNum>div{border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;}';
    //画面クリック調整
    t += '#moveContainer{pointer-events:none;}';
    t += overlapSelector + '{pointer-events:none;}';
    t += '[class^="styles__footer-container___"] [class*="styles__right-container"]{pointer-events:auto;}';

    //今日のみどころポップアップ(トップページで出現確認、放送画面にまで出るかは不明だけど念のため)
    if (isHideTodayHighlight) {
        t += '[class^="styles__highlights-balloon___"]{display:none;}';
    }
    //コメント一覧クリックNG時はマウスオーバーで文字色を赤系にする(comecopyはクリック対象を受けずhoverで変色したものを対象とする)
    if (isComelistClickNG) {
        t += '.comem:hover{color:' + rc + '!important;}';
    }
    //流れるコメントのフォントサイズ
    if (comeFontsizeV) {
        var wh = $(window).height();
        var vh = Math.round(1000 * comeFontsize / wh) / 10;
        t += '.movingComment{font-size:' + vh + 'vh;}';
    } else
        t += '.movingComment{font-size:' + comeFontsize + 'px;}';

    //投票機能
    t += '[class^="styles__vote-container___"]{z-index:8;';
    if (isHideVoting) {
        t += 'display:none;';
    }
    t += '}';
    //視聴数
    selCountview=getElementSingleSelector(EXcountview);
    if($(selCountview).length!=1){
        console.log("?EXcountview "+selCountview);
        selCountview=alt?".v3_wX":"";
    }
    if(selCountview){
        t += selCountview+'{background-color:transparent;}';
        t += selCountview+'>*{opacity:' + (settings.panelOpacity/255) + ';}';
    }
    //視聴数格納
    if (isStoreViewCounter&&selFoot) {
        //to=selCountview;
        //t += to+'{display:none;}';
        //t += '[class*="styles__view-counter___"]{display:none;}';
        t += '#viewcounticon{vertical-align:middle;fill:#1a1a1a;}';
        t += '#viewcountcont{margin-left:4px;font-size:12px;font-weight:700;vertical-align:middle;color:#1a1a1a;}';
        t += '#comecountcont{margin-left:10px;font-size:18px;font-weight:700;vertical-align:middle;line-height:1.6;color:#1a1a1a;}';
        to=getElementSingleSelector(EXfootcome);
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
    if (isComeTriming && isSureReadComment) {
        if(selHead&&selFoot) t += selHead+','+selFoot+'{width:calc(100% - 310px);}';
        if(selHead) t += selHead+'>*{min-width:unset;}';
    }
    //黒帯パネルの透過
    if(selHead&&selFoot){
        t += selFoot+'>div>div:nth-child(3),'+selHead+'{background:rgba(0,0,0,' + (settings.panelOpacity/255) + ')}';
        t += selFoot+'>div>div:nth-child(3)>*,'+selHead+'>*{opacity:' + (settings.panelOpacity/255) + '}';
    }
 
    //t += selHead+'{background-color: transparent;}[class*="Header__container___"]{background-color: black;}';

    //番組情報のコピー置換
    if(selInfo){
        t += selInfo+'>*:not(#copyinfo){display:none;}';
        t += selInfo+'>#copyinfo{width:100%;padding:15px;}';
    }

    $('head>link[title="usermade"]').remove();
    $("<link title='usermade' rel='stylesheet' href='data:text/css," + encodeURIComponent(t) + "'>").appendTo("head");
    console.log("setOptionHead ok");
}
function setOptionElement() {
    if (checkUrlPattern(true) != 3) { return; }

    if (isCustomPostWin) {
        $(EXcomesendinp).prop("wrap", "soft");
    } else {
        isEdge || $(EXcomesendinp).prop("wrap", "");
    }
    setProSamePosiChanged();

    //コメントアイコン付近にリロードアイコン作成
    /*
    if ($('#reloadon').length == 0) {
        var ri = '<a title="スクロール時コメ自動更新は現在 OFF です">';
        ri += '<svg id="reloadon" class="usermade reloadicon" width="16" height="16">';
        ri += '<use xlink:href="/images/icons/return.svg#svg-body"></use></svg>';
        ri += '<svg id="reloadoff" class="usermade reloadicon" width="16" height="16" style="">';
        ri += '<use xlink:href="/images/icons/close.svg#svg-body"></use></svg>';
        ri += '</a>';
        $(ri).appendTo(EXcomesendinp.parentElement);
        $('#reloadon').on("click", function () {
            isAutoReload = !isAutoReload;
            $('#reloadoff').css("display", isAutoReload ? "none" : "block");
            $('#reloadoff').parent('a').prop("title", "スクロール時コメ自動更新は現在 " + (isAutoReload ? "ON" : "OFF") + " です");
        });
    }
    */

    //    $(EXfootcome).css("pointer-events","auto");
    if(EXcomelist)copycome();

    if (!isStoreViewCounter) $(EXfootcountcome).children('#viewcounticon,#viewcountcont,br,#comecountcont').remove();

    var hoverLinkClass = $(EXmenu).children('a')[0].className;
    var hoverSpanClass = $(EXmenu).children('a').children('span')[0].className;
    if ($(EXmenu).children('#extSettingLink').length == 0) {
        $(EXmenu).append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("option.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張設定</span></a>')
                 .append('<a class="' + hoverLinkClass + '" id="extProgNotifiesLink" href="' + chrome.extension.getURL("prognotifies.html") + '" target="_blank"><span class="' + hoverSpanClass + '">拡張通知登録一覧</span></a>')
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
        pophideSelector(-1, 0);
        //カーソルを表示する
        EXmain.style.cursor = 'auto';
    }
}
function comemukouClick() {
    console.log("comemukouClick");
    if (isSureReadComment && !isFootcomeClickable()) {
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
        if (isCMBlack && isCMBkR) { screenBlackSet(setBlacked[0] ? 0 : (isCMBkTrans ? 1 : 3)); }
        if (isCMsoundoff && isCMsoundR) { soundSet(setBlacked[1]); }
        if (CMsmall < 100 && isCMsmlR) { movieZoomOut(setBlacked[2] ? 0 : 1); }
    }
    if (isSureReadComment) {
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
    var jo = $('#main div[class*="styles__resize-screen___"]');
    if (jo.length > 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo[0], parseInt(jo[0].style.width), parseInt(jo[0].style.height));
    }
}
function waitforResize(retrycount, eo, w, h) {
    var jw = parseInt(eo.style.width);
    var jh = parseInt(eo.style.height);
    if (w != jw || h != jh) {
        waitingforResize = false;
        if (jw != movieWidth || jh != movieHeight) {
            onresize();
        }
    } else if (retrycount > 0) {
        setTimeout(waitforResize, 50, retrycount - 1, eo, w, h);
    } else {
        waitingforResize = false;
    }
}
function usereventVolMousemove() {
    if (!EXside) { return; }
    $(EXside).css("transform", "translate(50%,-50%)");
}
function usereventVolMouseout() {
    if (!EXside) { return; }
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
    if (!EXfootcome) { return; }
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
    if (!EXfootcome || !isManualMouseBR) { return; }
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
    if (checkUrlPattern(true) != 3) { return; }
    if (url != currentLocation) { return; }
    if (isSureReadComment && isFootcomeClickable()) {
        setTimeout(overlapTriggerClick, 20);
    } else {
        setTimeout(waitforComemukouEnd, 500, url);
    }
}
function usereventSideChliButClick() {
    if (isChliOpen(3)) {
        if (isSureReadComment && !isFootcomeClickable()) {
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
    var jo = $('#main div[class*="styles__resize-screen___"]');
    if (jo.length > 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo[0], parseInt(jo[0].style.width), parseInt(jo[0].style.height));
    }
}
function usereventFootInfoButClick() {
    if (isInfoOpen(3)) {
        if (isSureReadComment && !isFootcomeClickable()) {
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
    var jo = $('#main div[class*="styles__resize-screen___"]');
    if (jo.length > 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo[0], parseInt(jo[0].style.width), parseInt(jo[0].style.height));
    }
}
function delkakikomitxt(inptxt) {
    if (kakikomitxt == inptxt) {
        kakikomitxt = "";
        console.log("kakikomitxt reset: inptxt")
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
        $.ajax({url: 'https://' + settings.mastodonInstance + '/api/v1/statuses', type: 'POST', data: {status: tootText}, headers:{'Authorization': 'Bearer ' + settings.mastodonToken}, dataType: 'json', success: function(result) {
            console.log('toot:', tootText);
        }, error: function() {
            toast('Mastodon投稿エラー');
        }});
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
    } else {
        //閉じている＝これから開く
        if (!comeRefreshing) {
            pophideSelector(3, 0);
        }
    }
    var jo = $('#main div[class*="styles__resize-screen___"]');
    if (jo.length > 0 && !waitingforResize) {
        waitingforResize = true;
        waitforResize(5, jo[0], parseInt(jo[0].style.width), parseInt(jo[0].style.height));
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
        $(EXcomesendinp).css("height", "24px")
            .css("overflow-y", "scroll")
            .siblings('[class^="styles__print-text___"]').css("height", "24px")
            .css("visibility", "hidden")
            ;
    } else {
        $(EXcomesendinp).parent().css("padding-top", "")
            .css("padding-bottom", "")
            ;
        $(EXcomesendinp).css("height", "18px")
            .css("overflow-y", "")
            .siblings('[class^="styles__print-text___"]').css("height", "18px")
            .css("visibility", "")
            ;
    }
    var s = -6 + 18 * Math.round($(EXcomesendinp).scrollTop() / 18);
    //console.log($(EXcomesendinp).scrollTop()+"->"+s);
    $(EXcomesendinp).scrollTop(s);
}
function comeModuleEditor() {
    if(EXcomemodule) return;
    var ret=getComeModuleElements();
    if(!ret[0]||!ret[1]||!ret[2]){
        console.log("retry comeModuleEditor");
        setTimeout(comeModuleEditor,1000);
        return;
    }
    EXcomemodule=ret[0];
    var to=getElementSingleSelector(ret[1]);
    if(!to){
        console.log("?sendbtn");
        to='.ts_jZ';
    }
    //投稿ボタンを押した時
    $(EXcomesend).on("click", to, usereventSendButClick);

    if (isCustomPostWin){console.log("setOptionHead comeModuleEditor");setOptionHead();}

    var twitterWrapper = $(ret[2]);
    if (settings.mastodonInstance && settings.mastodonToken){
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
        twitterWrapper.css('float', 'left').after('<div class="usermade" id="mastodon-btn" style="float:left;margin-left:10px;padding:2px;cursor:pointer;background-color:#ddd;border-radius:2px;"><img src="' + chrome.extension.getURL("icon/mastodon-icon" + (isTootEnabled?'-blue':'') + ".svg") + '" style="" height="25" width="25" id="mastodon-icon"></div>');
        $('#mastodon-btn').click(function(){
            isTootEnabled = !isTootEnabled;
            localStorage.setItem('isTootEnabled', isTootEnabled.toString());
            $('#mastodon-icon').attr('src', chrome.extension.getURL("icon/mastodon-icon" + (isTootEnabled?'-blue':'') + ".svg"));
        });   
    }
}
function setOptionEvent() {//放送画面用イベント設定
    if (checkUrlPattern(true) != 3) { return; }
    //自作要素のイベントは自作部分で対応
    //console.log("setOptionEvent() eventAdded:", eventAdded);
    if (eventAdded) { return; }
    var butfs;
    var pwaku;
    if (((butfs = EXfullscr) == null) || ((pwaku = $(overlapSelector)[0]) == null) || !EXcome) {
        console.log("setOptionEvent retry");
        setTimeout(setOptionEvent, 1000);
        return;
    }
    eventAdded = true;
    //    $(window).on("click",usereventWindowclick);
    //マウスホイール無効か音量操作
    var mousewheelEvtName = isFirefox ? 'DOMMouseScroll' : 'mousewheel';
    window.addEventListener(mousewheelEvtName, function (e) {
        if (e.target.id == "ComeMukouMask") {
            console.log("onmousewheel on ComeMukouMask",e);
                //        if (isVolumeWheel&&e.target.className.indexOf("style__overlap___") != -1){//イベントが映像上なら
            if (isVolumeWheel && e.target.id == "ComeMukouMask") {
                if (EXvolume && $(EXvolume).contents().find('svg').css("zoom") == "1") {
                    otoSize(e.wheelDelta < 0 ? 0.8 : 1.2);
                }
                moVol(e.wheelDelta < 0 ? -5 : 5);
            }
            if (isCancelWheel || isVolumeWheel) { //設定ウィンドウ反映用
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
    pwaku.addEventListener("click", usereventWakuclick);
    //ダブルクリックでフルスクリーン
    pwaku.addEventListener("dblclick", onScreenDblClick);
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
            if (isCancelWheel || isVolumeWheel) {
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
        } else if (e.keyCode == 17 && ((e.location == 1 && isManualKeyCtrlL) || (e.location == 2 && isManualKeyCtrlR))) { //17ctrl
            if (cmblockcd != 0) {
                if (cmblockcd > 0) {
                    cmblockcd = 1.73;
                } else if (cmblockcd < 0) {
                    cmblockcd = -1.73;
                }
                var posi = "";
                if (e.location == 1 && isManualKeyCtrlL) {
                    posi = "left";
                } else if (e.location == 2 && isManualKeyCtrlR) {
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
        if (e.keyCode == 17 && ((e.location == 1 && isManualKeyCtrlL) || (e.location == 2 && isManualKeyCtrlR))) {
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

    console.log("setOptionEvent ok");
}
function startCM() {
    console.log("startCM");
    if (isCMBlack) { screenBlackSet(isCMBkTrans ? 1 : 3); }
    if (isCMsoundoff) { soundSet(false); }
    if (CMsmall < 100) { movieZoomOut(1); }
}
function endCM() {
    console.log("endCM");
    if (bginfo[1].length != 0) { return; }
    if (isCMBlack) { screenBlackSet(0); }
    if (isCMsoundoff) { soundSet(true); }
    if (CMsmall < 100) { movieZoomOut(0); }
}
function tryCM() {
    if (bginfo[1].length != 0) { return; }
    bginfo[2] = 0;
    if (cmblockcd * 100 % 10 != -3) {
        cmblockcd = 0;
        endCM();
    }
}
function fastEyecatching(retrycount) {
    //console.log("fastEyecatch#"+retrycount);
    if ($('.manualblock').length > 0 || retrycount <= 0) { eyecatcheck = false; return; }//手動対応を優先
    if ($(EXobli).find("object,video").first().parentsUntil(EXobli).last().children().length > 3 && retrycount > 0){
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
    var hlbc = commentBackColor;
    var hlbt = commentBackTrans;
    var hlc = highlightComeColor;
    var hlp = highlightComePower;
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
            jo.css("padding-left", ((isCommentWide ? 8 : 15) - 4) + "px")
                .css("border-left", "4px solid rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0.6)")
                .css("transition", "")
                ;
            break;
        case 3:
            jo.css("padding-left", ((isCommentWide ? 8 : 15) - 4) + "px")
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
                    jo.eq(i).css("border-left-color", "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)")
                        .css("transition", "border-left-color 1s linear " + (3 + 0.02 * j) + "s")
                        ;
                    break;
                case 2:
                    jo.eq(i).css("background-color", "rgba(" + hlbc + "," + hlbc + "," + hlbc + "," + (hlbt / 255) + ")")
                        .css("transition", "background-color 1s linear " + (3 + 0.02 * j) + "s")
                        ;
                    break;
                case 3:
                    jo.eq(i).css("border-left-color", "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)")
                        .css("background-color", "rgba(" + hlbc + "," + hlbc + "," + hlbc + "," + (hlbt / 255) + ")")
                        .css("transition", "border-left-color 1s linear " + (3 + 0.02 * j) + "s,background-color 1s linear " + (2 + 0.02 * j) + "s")
                        ;
                    break;
                default:
            }
        }
    }, 0, jo);
}
function copycome(d, hlsw) {
//console.log("copycome d="+d);
    if (isComelistMouseDown) { return; }//もしコメ欄でマウスが押されている途中なら=コメ欄で文字列を選択中ならcopycomeは一時停止
    if (!EXcomelist) { return; }
    if (!isComelistNG) {
        $('#copycome').remove();
        $(EXcomelist).parent().css("display", "");
        return;
    }
    //console.time('copycome')
    var eo = EXcomelist;
    var isAnimationIncluded = EXcomelist.children[0].className.indexOf('uo_k') >= 0;
    var EXcomelistChildren = $(EXcomelist).children('div' + (isAnimationIncluded ? ':gt(0)' : ''));
    //console.log("EXCLChi",EXcomelistChildren)
    var jo = $(eo);
    if ($('#copycome').length == 0) {
        //console.log("copycome leng=0");
        var t = '<div id="copycome" class="' + jo.parent().attr("class") + ' usermade"><div id="copycomec" class="'+jo.attr("class")+' usermade">';
        var eofc = EXcomelistChildren[0];
        if ($(eo.firstElementChild).is('.uo_uq')) { return; }
        //eofc=eo.children[1];//firstElementChildが空っぽの場合があるので二番目の子供を使う
        var eofcc = $(eofc).prop("class");
        if (eofc === undefined || !eofc.hasChildNodes()) { return; }
        var em = eofc.children[0];
        var ecm = $(em).prop("class");
        var et = eofc.children[1];
        var ect = $(et).prop("class");
        for (var i = 0; i < 100; i++) {
            t += '<div class="' + eofcc + ' comep usermade"><p class="' + ecm + ' comem usermade"></p><p class="' + ect + ' comet usermade"></p><p class="comeposttime usermade" style="display:none;"></p></div>';
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
        $('#copycome').mouseup(function () { setTimeout(function () { isComelistMouseDown = false; }, 3000) });//選択し終わってから右クリまで3秒の猶予
    }
    var jc = $('#copycomec').children();
    var ec = $('#copycomec')[0];
    var nt = Date.now();
    var rn = /^今$/;
    var rs = /^(\d+) *秒前$/;
    var rm = /^(\d+) *分前$/;

    if (d < 0 || jo.children().is('.uo_uq')) { //全消去
        console.log("copycome allerase");
        jc.children().text("");
        $('.comeposttime').attr("name", "");
    } else if (d > 0 && copycomecount <= 0) {
        //console.log("copycome append:"+d);
        //d件をNG処理して追加した後にcomehl
        var ma = [];
        for (var i = 0, e, m, n, t; i < d; i++) {
            //console.log("ma loop")
            e = EXcomelistChildren[i];//eo.children[i];
            if(!e.children[0]||!e.children[1]) continue;
            m = comefilter(e.children[0].textContent);
            if (m.length > 0) {
                t = e.children[1].textContent;
                ma.push([m, t]);
            }
        }
        //console.log("ma:",ma)
        if (ma.length > 0) {
            if (ma.length <= 100) {
                //console.time('ma100_loop')
                for (var i = ec.childElementCount - 1, e, m, t, n, d, s; (e = ec.children[i - ma.length]) ; i--) {
                    //console.log("loop ma<100")
                    m = e.children[0].textContent;
                    if (isDelOldTime || isDelTime) {
                        jc.eq(i).children().first().text(m)
                            .css("width", (isComeOpen(3) && isSideOpen(3)) ? e.children[0].style.width : "unset")
                            .next().text("")
                        ;
                    } else {
                        t = "";
                        n = e.children[2].getAttribute("name") || "";
                        if (/^t\d+$/.test(n)) {
                            d = +(n.substr(1));
                            s = Math.floor((nt - d) / 1000);
                            if (s < 60) {
                                t = s + "秒前";
                            } else if (s >= 60) {
                                t = Math.floor(s / 60) + "分前";
                            }
                        }
                        jc.eq(i).children().first().text(m)
                            .css("width", "")
                            .next().text(t)
                            .next().attr("name", n);
                        ;
                    }
                }
                //console.timeEnd('ma100_loop')
            }
            var malen = Math.min(ma.length, 100);
            //console.time('malen_loop')
            for (var i = 0, m, t, d; i < malen; i++) {
                //console.log("loop after malen")
                m = ma[i][0];
                if (isDelTime) {
                    jc.eq(i).children().first().text(m)
                        .css("width", "unset")
                        .next().text("")
                    ;
                } else {
                    t = ma[i][1];
                    if (rn.test(t)) {
                        d = nt;
                    } else if (rs.test(t)) {
                        d = nt - (+rs.exec(t)[1]) * 1000;
                    } else if (rm.test(t)) {
                        d = nt - (+rm.exec(t)[1]) * 60000;
                    }
                    jc.eq(i).children().first().text(m)
                        .css("width", "")
                        .next().text(t)
                        .next().attr("name", "t" + d)
                    ;
                }
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
            if ((isDelOldTime || isDelTime) && isComeOpen(3) && isSideOpen(3)) setTimeout(comewidthfix, 0, 0, 0)
        }
        commentNum = EXcomelistChildren.length;//EXcomelist.childElementCount;
    } else if (d === undefined || copycomecount > 0) {
        console.log("copycome fullcopy");
        //100件全てを上書き
        jc.children().text("");
        $('.comeposttime').attr("name", "");
        //console.time('fullcp_loop')
        for (var i = 0, j = 0, e, m, t, dt; (e = EXcomelist.children[i]) ; i++) {
            if (e.hasChildNodes() && e.childElementCount > 1) {
                m = comefilter(e.children[0].textContent);
                if (m.length > 0) {
                    if (isDelTime) {
                        jc.eq(j).children().first().text(m)
                            .css("width", "unset")
                            .next().text("")
                        ;
                    } else {
                        t = e.children[1].textContent;
                        if (rn.test(t)) {
                            dt = nt;
                        } else if (rs.test(t)) {
                            dt = nt - (+rs.exec(t)[1]) * 1000;
                        } else if (rm.test(t)) {
                            dt = nt - (+rm.exec(t)[1]) * 60000;
                        }
                        jc.eq(j).children().first().text(m)
                            .css("width", "")
                            .next().text(t)
                            .next().attr("name", "t" + dt)
                        ;
                    }
                    j += 1;
                    if (j >= 100) { break; }
                }
            }
        }
        //console.timeEnd('fullcp_loop')
        if ((isDelOldTime || isDelTime) && isComeOpen(3) && isSideOpen(3)) setTimeout(comewidthfix, 0, 0, 0)
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
    if (!(i <= 100)) return;
    if (i == 0) {
        if (isInpWinBottom)
            h = window.innerHeight - EXcomesend.getBoundingClientRect().height;
        else
            h = EXcomesend.getBoundingClientRect().height;
    }
    var jo=$('#copycomec').children().eq(i);
    var jc=jo.children().first();
    var j = 1 + jo.height();
    var ti, bi;
    if (isInpWinBottom) {
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
    } else if (isInpWinBottom ? (bi < ts) : (ti < bs)) {
        $('#copycomec').children().slice(i).children('p').first().css("width", "unset");
        return;
    } else {
        jc.css("width", "unset");
    }
    j = 1 + $('#copycomec').children().eq(i).height();
    setTimeout(comewidthfix, 0, i + 1, isInpWinBottom ? h - j : h + j);
}
// コメ欄クリック時に呼び出され、NGワード追加画面表示
function comecopy() {
console.log("comecopy");
    if (!isComelistClickNG) { return; }
    var jo = $('.comem');
    if (jo.length == 0) {
        //jo = $(EXcomelist);
        return;
    }
    //var eo = jo[0];
    var r = /rgba?\((\d+), (\d+), (\d+)(, \d?(?:\.\d+)?)?\)/;
    var s = "";
    for (var i = 0, e, c, t; (e = jo.eq(i))&&(c=e.css("color"))&&r.test(c); i++) {
        //c = $(e.children[0]).css("color");
        //if (r.test(c)) {
            t = r.exec(c);
            if (t[2] == t[3] && +t[1] > +t[2]) {
                s = e.text();
                break;
            //}
        }
    }
    if (s.length > 0) {
        if ($('#copyotw').length == 0) {
            var t = '<div id="copyotw" class="' + $(EXcomesendinp.parentElement).attr("class") + ' usermade" style="padding:5px 28px 5px 18px;">';
            t += '<a style="position:absolute;top:10px;left:1px;cursor:pointer;"><svg id="closecopyotw" class="usermade" width="16" height="16" style="fill:rgba(255,255,255,0.5);"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/images/icons/close.svg#svg-body"></use></svg></a>';
            t += '<textarea id="copyot" class="' + $(EXcomesendinp).attr("class") + '" rows="1" maxlength="100" wrap="soft" style="height:24px;width:264px;padding-left:4px;"></textarea>';
            t += '<div style="height:24px;pointer-events:none;">　</div>';
            t += '<a id="textNG" style="position:absolute;top:6px;right:1px;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.5);padding:0px 1px;letter-spacing:1px;cursor:pointer;">NG</a>';
            t += '</div>';
            $(t).insertAfter(EXcomesendinp.parentElement);
            $('#closecopyotw').parent('a').on("click", closecotwclick);
            $('#textNG').on("click", appendTextNG);
        } else {
            $('#copyotw').insertAfter(EXcomesendinp.parentElement) //#copyotw作成後に投稿ボタン等が生成された場合の順序修正
                .css("display", "")
                ;
        }
        $(EXcomesendinp.parentElement).css("display", "none");
        $(EXcomesend).css("padding-left", "0px");
        $('#copyot').val(s);
        var co = $(EXcomesendinp).css("color");
        $('#textNG').css("color", co)
            .css("border-color", co)
            ;
        $('#closecopyotw').css("fill", co);
        paintcopyot(1);
        paintcopyotw(1);
    }
    comeNGmode = 0;
}
function paintcopyot(mode) {
    //mode 0:色除去 1:青 2:黄 3:赤
    if ($('#copyot').length == 0) { return; }
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
    if ($('#copyotw').length == 0) { return; }
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
        appendNGpermanent();
        return;
    }
    comeNGmode = 1;
    var s;
    if (inpstr === undefined) {
        s = $('#copyot').val();
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
    var spfullng = fullNg.split(/\r|\n|\r\n/);
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
            if (/\r|\n/.test(fullNg[fullNg.length - 1])) {
                fullNg += strArr[ngsi];
            } else {
                fullNg += "\n" + strArr[ngsi];
            }
        }

        arrayFullNgMaker();
        copycome();
    }
    if (inpstr === undefined) {
        if (isComeClickNGautoClose) {
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
function addPermanentNG(word) {
    //既存の(一時保存済の)fullNgをそのままsetStorageすると、一時保存したが永久保存しなかった単語まで永久保存されてしまうので、
    //storageから持ってきて追加、setStorageする
    var PfullNg;
    var b = true;
    getStorage(null, function (value) {
        PfullNg = value.fullNg || fullNg;
        var spPfullng = PfullNg.split(/\r|\n|\r\n/);
        for (var ngi = 0; ngi < spPfullng.length; ngi++) {
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
            if (/\r|\n/.test(PfullNg[fullNg.length - 1])) {
                PfullNg += word;
            } else {
                PfullNg += "\n" + word;
            }
            setStorage({
                "fullNg": PfullNg
            });
        }
    });
}
function appendNGpermanent() {
    console.log("appendNGpermanent");
    comeNGmode = 2;
    $('#textNG').css("pointer-events", "none");
    var s = $('#copyot').val();
    if (s.length == 0) {
        comeNGmode = 0;
        return;
    }
    //storageへの追加部を外部関数へ
    addPermanentNG(s);

    //NGボタン押下2回目は赤
    paintcopyot(3);
    paintcopyotw(3);
    setTimeout(copyotuncolor, 800, 2)
}
function copyotuncolor(mode) {
    //mode 1:一時登録 2:permanent
    //一時登録から呼んだ時(mode=1)にcomeNGmodeが1でない場合、NGボタンを2度押したのでmode=1での実行は中止する
    if (mode == 1 && comeNGmode == 2) { return; }
    comeNGmode = 0;
    $('#copyot').val("");
    $('#textNG').css("pointer-events", "");
    paintcopyot(1);
    paintcopyotw(1);
    if (isComeClickNGautoClose) {
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
if (isEdge) {
    mainfunc();
} else {
    $(window).on('load', mainfunc);
}
//URLによって実行内容を変更すべく各部を分離
function mainfunc() { //初回に一度実行しておけば後でURL部分が変わっても大丈夫なやつ
    console.log("loaded");
    var csspath = chrome.extension.getURL("onairpage.css");
    $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
    // jqueryを開発者コンソールから使う
    var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
    $("<script src='" + jquerypath + "'></script>").appendTo("head");
    //URLパターンチェック
    checkUrlPattern(location.href);
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
}
function onairfunc() {
    //変数リセット
    isFirstComeAnimated = false;
    //要素チェック
    setEXs();
    delayset();
    if (onairRunning === false) {
        onairRunning = setInterval(onairBasefunc, 1000);
    }

    setTimeout(onresize, 5000);
    if (settings.isShareNGword && !isNGwordShareInterval) {
        setTimeout(applySharedNGword, 1000);
    }
    copycomecount = 2;
    if (settings.mastodonInstance && settings.mastodonToken){
        isTootEnabled = localStorage.getItem('isTootEnabled') == 'true';
    }
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

        if (EXcome && isAutoReload) {
            //            var btn = $(EXcome).contents().find('[class^="styles__continue-btn___"]'); //新着コメのボタン
            var btn = $(EXcomesend).siblings('[class^="styles__continue-btn___"]');
            if (btn.length > 0) {
                //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
                btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
                comeColor($('#reloadon'));
            }
        }
        //        //映像のtopが変更したらonresize()実行
        //        if(settings.isResizeScreen && $("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        //        if($("object,video").size()>0 && $("object,video").parent().offset().top !== newtop) {
        var jo = $('#main div[class*="styles__resize-screen___"]');
        //.resize-screenに設定されるwidth,heightをトリガーにする
        if (jo.length > 0 && (movieWidth != parseInt(jo[0].style.width) || movieHeight != parseInt(jo[0].style.height))) {
            onresize();
        }

//video.parentのwidthが外れた場合にonresizeをかけ直す用
        if (settings.isResizeScreen) {
            var jo;
            if ((jo = getVideo())){
                var jw = parseInt(jo.css("width"));
                if (jw != movieWidth2) {
                    onresize();
                }
            }
        }
        //console.timeEnd('obf_1');
        //console.time('obf_come');
        //        //黒帯パネル表示のためマウスを動かすイベント発火
        //        if (settings.isAlwaysShowPanel) {
        //            triggerMouseMoving();
        //            if(!isSureReadComment){
        //console.log("popHeader 1s");
        //                popHeader();
        //            }
        //        }
        //初回読込時のみ実行するためにdelayset内へ移動
        //        //音量が最大なら設定値へ自動変更
        //        if(changeMaxVolume<100&&$('[class^="styles__highlighter___"]').css("height")=="92px"){
        //            if($(EXvolume).contents().find('svg').css("fill")=="rgb(255, 255, 255)"){
        //                otoColor();
        //            }
        //            otosageru();
        //        }
        
        // コメント取得関係はonCommentChange()へ移動

        //console.timeEnd('obf_come');
        //console.time('obf_1_2');
        if (isComelistNG) {
            //copycomeできていない場合はここで全copyする
            var b = true;
            if ($('#copycome').length > 0) {
                //番組切替直後などでcopycomeはある場合は中身があるか数件チェックする
                for (var i = 0, c = $('#copycomec').children(), j; i < 5; i++) {
                    if (c.eq(i).children().first().text().length > 0) {
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
        if (isMovingComment) {
            var arMovingComment = $('.movingComment');
            for (var j = 0; j < arMovingComment.length; j++) {
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
            if (isCMBlack || isCMsoundoff || CMsmall < 100) {
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
        if (useEyecatch) {
        //if ((EXwatchingnum !== undefined) && useEyecatch) {
            if ($(EXobli).find("object,video").first().parentsUntil(EXobli).last().children().length > 3) {
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
        console.log("cmblockcd",cmblockcd);
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
        if (isTimeVisible && EXinfo) {
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
        if (isSureReadComment && !comeRefreshing && !comeFastOpen && !isComeOpen()) {
            waitforCloseCome(0);
        }
        //各要素を隠すまでのカウントダウン (マウスが動かずに時間経過)
        if (forElementClose > 0) {
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
        for (var i = 0; i < comeLatestLen; i++) {
            if (comeLatestPosi[i][1] > 0) {
                comeLatestPosi[i][1] -= 1;
                if (comeLatestPosi[i][1] <= 0) {
                    comeLatestPosi[i][0] = 0;
                }
            }
        }

        //番組タイトルの更新
        if (EXinfo) {
            var jo = $(EXinfo).contents().find('h2');
            if (jo.length > 0) {
                if (proTitle != jo.first().text()) {//if ($('#tProtitle').text() != jo.first().text()) {
                    proTitle = jo.first().text();
                    if(isProtitleVisible){
                        $('#tProtitle').text(proTitle);
                    }
                    copycomecount = 2;
                    setTimeout(copycome, 300);
                    //番組情報(コピー)を更新
                    $(EXinfo).children('#copyinfo').remove();
                    $(EXinfo).children().not('#copyinfo').first().clone().removeClass().addClass('usermade').prop("id", "copyinfo").appendTo($(EXinfo));
                    //番組情報のSNSボタンのイベント設定
                    $('#copyinfo ul>li button').click(function (e){
                        $(EXinfo).children().not('#copyinfo').first().find('ul>li button').eq($(e.target).parent().index()).trigger('click');
                    });
                }
            }
        }

        if (comeMovingAreaTrim) {
//            var jo = $("object,video").parent();
            var jo;
//            if (jo.length > 0) {
            if ((jo = getVideo())) {
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
        if (isStoreViewCounter) {
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
            if(r.audible==true || !isSoundFlag)audibleReloadCount=audibleReloadWait;
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
        nodeClass;
    for(var i=0,jo; i<mutations.length; i++){
        if(mutations[i].type == 'childList' && mutations[i].addedNodes.length > 0){
            jo=$(mutations[i].addedNodes[0]);
            nodeClass = mutations[i].addedNodes[0].className;
            if(jo.css("height")=="0px"){//jo.css("transition-property")=="height"だと反応しないっぽい
                //console.log('mutation added: animation');
                isAnimationAdded = true;
            }else if(jo.find("p").map(function(i,e){var t=e.innerText;if(t.indexOf("今")>=0||t.indexOf("秒前")>=0||t.indexOf("分前")>=0) return e;}).length>0){
                isCommentAdded = true;
                newCommentNum++;
            }else if(jo.is('p') && jo.text().indexOf('この番組にはまだ投稿がありません')>=0){
                //CH切り替え等でコメ欄が空になった時 何もしない
                console.log('mutation added: no comment');
            }else{
                console.warn('unexpected onCommentChange()', mutations[i]);
            }
        }
    }
    //console.log(isAnimationAdded,isCommentAdded);
    if(isCommentAdded){
        //コメント取得(animation除外) ただし最初のanimationでも実行
        //console.time('obf_getComment_beforeif')
        var commentDivParent = $(EXcomelist);//$('#main div[class*="styles__comment-list-wrapper___"]:not(#copycome)  > div');//copycome除外
        var isAnimationIncluded = commentDivParent.css("height")=="0px";//EXcomelist.children[0].className.indexOf('uo_k') >= 0;
        //console.log("isA",isAnimationIncluded,EXcomelist.children[0])
        //var comments = commentDivParent.children('div' + (isAnimationIncluded ? ':gt(1)' : '')).find(' [class^="styles__message___"]');//新着animetionも除外
        var comments = [];// 負荷軽減のためjQuery使わずに
        var commentDivs = EXcomelist.children;
        //if(isAnimationIncluded){console.log('div[1]:', commentDivs[1].innerHTML)}
        for(var cdi = isAnimationIncluded?1:0; cdi < commentDivs.length; cdi++){
            comments.push(commentDivs[cdi].children[0].innerHTML);
        }
        //var comments = $('[class*="styles__comment-list-wrapper___"]:not(#copycome)  > div > div[class*="styles__containerer___"] > p[class^="styles__message___"]');
        //console.timeEnd('obf_getComment_beforeif')
        if (EXcomelist && isComeOpen()) {
            var comeListLen = comments.length;//EXcomelist.childElementCount;
            //var d = comeListLen - commentNum;//一定数(500)に達するとコメント数の総数は増えなくなるので左式は0になる
            var d = newCommentNum;
            //console.log(comeListLen,commentNum,d)
            //            if(comeListLen>commentNum){ //コメ増加あり
            //                if(!comeRefreshing||!isSureReadComment){
            var commentDivParentV = (isComelistNG && $('#copycomec').length > 0) ? $('#copycomec') : commentDivParent;
            var scrolled = false;
            if (isInpWinBottom) scrolled = (commentDivParentV.children().first().offset().top > window.innerHeight);
            else scrolled = (commentDivParentV.children().first().offset().top < 0);
            if (d > 0 && !scrolled) { //コメ増加あり && スクロールが規定値以上でない
                //console.log("cmts",comments,commentDivParent,d,comeListLen,commentNum)
                //                if(!comeRefreshing){ //isSureReadCommentの判定が必要な理由を失念。

                //                }else{
                //                    comeRefreshing=false;
                //                }
                if (commentNum == 0) {
                    comeHealth = Math.min(100, Math.max(0, comeListLen));
                    comeColor($(EXfootcountcome), comeHealth);
                }
                commentNum = comeListLen;
                //                if(isSureReadComment&&commentNum>Math.max(comeHealth+20,sureReadRefreshx)&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0&&$(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==0){
                if (/*isSureReadComment && */commentNum > Math.max(comeHealth + 20, sureReadRefreshx) && isFootcomeClickable() && $(EXcome).siblings('.v3_wo').length == 0) {
                    ///*コメ常時表示 &*/ コメ数>設定値 & コメ開可 & 他枠非表示
                    console.log("comeRefreshing start");
                    comeRefreshing = true;
                    //                    commentNum=0;
                    $('#ComeMukouMask').trigger("click");
                    fastRefreshing();
                }
                //新着コメント強調 一時試用できるように、一時保存画面が開いている場合を考慮
                var hlsw = $('#settcont').css("display") == "none" ? highlightNewCome : parseInt($('#ihighlightNewCome input[type="radio"][name="highlightNewCome"]:checked').val());
                if (isComelistNG) {
                    copycome(d, hlsw); //copycome内からcomehlを実行
                } else if (hlsw > 0) {
                    comehl($(EXcomelist).children().slice(0, d), hlsw);
                }
            } else if (comeListLen < commentNum && !isAnimationIncluded) {
                commentNum = 0;
                comeHealth = 100;
            }
        }
    }
    if(isAnimationAdded){
        //console.log(isFirstComeAnimated,mutations)
        //animation部の新着コメのコメ流し
        if (isMovingComment && isFirstComeAnimated) {
            //                        for(var i=Math.min(movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
            //                            putComment(comments[i]);
            /*for (var i = 0; i < d; i++) {
                //console.log("pc",d-i-1,comments[d-i-1])
                putComment(comments[d - i - 1], i, d);
            }*/
            //animation部から新着コメを取得し流す
            var animationCommentDivs = EXcomelist.children[0].children[0].children;
            var idx;
            //console.log(animationCommentDivs)
            for(var i = 0; i < animationCommentDivs.length; i++){
                idx = animationCommentDivs.length - i - 1;
                //console.log('pc',animationCommentDivs[idx].children[0].innerHTML, i, animationCommentDivs.length);
                putComment(animationCommentDivs[idx].children[0].innerHTML, i, animationCommentDivs.length);
            }
        }
        if(!isFirstComeAnimated){
            isFirstComeAnimated = true;
        }
    }
}

$(window).on("resize", onresize);

//event.jsでonHistoryStateUpdatedでページ推移を捕捉してるが念の為に10秒ポーリング(AbemaTV開いたまま拡張アップデートされたときとか)
setInterval(chkurl, 10000);
function chkurl() {
    if (currentLocation != window.location.href) {
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
        proTitle = "未取得";
        $('#tProtitle').text(proTitle);
        $('#copycome').remove();

        checkUrlPattern(currentLocation);
    }
}
//onloadからも呼ばれる
function checkUrlPattern(url) {
    //urlがtrueなら各部の実行はせず出力のみ(無限再試行でもURL切替で終了できるようにするURL判定用)
    //urlがfalseなら各部の実行はせずpreviousLocationによる出力のみ
    var output = false;
    if (url === true) { url = currentLocation; output = true; } 
    else if (url === false) { url = previousLocation; output = true; }
    else {
        console.log("cup", url)
            ;
    }
    if (/https:\/\/abema.tv\/channels\/[-a-z0-9]+\/slots\/[a-zA-Z\d]+/.test(url)) {
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
    } else if (/^https:\/\/abema.tv\/timetable(?:$|\/dates\/.*)/.test(url)) {
        //日付別番組表
        if (output) {
            return 1;
        } else {
            //番組表(チャンネル個別ではない)のとき
            var chBanners = $('[class*="styles__channel-link___"]');
            chBanners.each(function () {
                var chBanner = $(this);
                var chBannerPos = chBanner.offset();
                var chTableUrl = chBanner.attr("href");
                var channel = chTableUrl.match(/\/timetable\/channels\/([-a-z0-9]+)/)[1];
                var channelUrl = "https://abema.tv/now-on-air/" + channel;
                //console.log(channelUrl)
                var onairpageLink = $('<div style="border:solid 1px black;background-color:white;position:absolute;display:none;" class="onairpageLink"><a href="' + channelUrl + '">放送画面</a></div>').appendTo(chBanner);
                //chBannerPos.top += chBanner.height();
                //chBannerPos.left += (chBanner.width()+onairpageLink.width())/2;
                //onairpageLink.offset(chBannerPos);

            });
            onairCleaner();
            delaysetNotOA();
            waitforloadtimetable(url);
        }
    } else if (/^https:\/\/abema.tv\/timetable\/channels\/.*/.test(url)) {
        //チャンネル別番組表
        if (output) {
            return 2;
        } else {
            onairCleaner();
            delaysetNotOA();
            waitforloadtimetable(url);
        }
    } else if (/^https:\/\/abema.tv\/now-on-air\/.*/.test(url)) {
        //放送ページ
        if (output) {
            return 3;
        } else {
            onairfunc();
        }
    } else if (/https:\/\/abema.tv\/search\/future\?q=.+/.test(url)) {
        //番組検索結果(放送予定の番組)
        if (output) {
            return 4;
        } else {
            onairCleaner();
            delaysetNotOA();
            putSerachNotifyButtons();
        }
    } else if (/https:\/\/abema.tv\/my\/lists\/reservation/.test(url)) {
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
            });
        }
    } else {
        // それ以外のページ
         if (output) {
            return -1;
        } else {
            onairCleaner();
            delaysetNotOA();
        }

    }
}

//通知機能
function putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, notifyButParent) {
    var notifyTime = programTime - notifySeconds * 1000;
    var now = new Date();
    if (notifyTime > now) {
        var progNotifyName = "progNotify_" + channel + "_" + programID;
        var notifyButton = $('<div class="addNotify" data-prognotifyname="' + progNotifyName + '"></div>');
        if (!notifyButParent.children().is('.addNotify')) { //重複設置の防止
            notifyButton.appendTo(notifyButParent);
        }
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
                notifyButton.text("拡張機能の通知登録").css('background-color', '#fff').click(function (e) {
                    var clickedButton = $(e.target);
                    var request = notifyButtonData[clickedButton.attr("data-prognotifyname")];
                    request.type = "addProgramNotifyAlarm";
                    chrome.runtime.sendMessage(request, function (response) {
                        if (response.result === "added") {
                            toast("通知登録しました<br>番組開始" + notifySeconds + "秒前にポップアップで通知します。設定されていた場合は自動で放送画面を開きます。通知設定やChromeが立ち上がってないなどにより通知されない場合があります。Chromeが起動していればAbemaTVを開いてなくても通知されます。");
                            var clickedButtonParent = clickedButton.parent();
                            clickedButton.remove();
                            putNotifyButtonElement(request.channel, request.channelName, request.programID, request.programTitle, request.programTime, clickedButtonParent);
                            if(checkUrlPattern(true) == 1 || checkUrlPattern(true) == 2){setRegistProgsBackground();}
                        } else if (response.result === "notificationDined") {
                            toast("拡張機能からの通知が拒否されているので通知できません")
                        } else if (response.result === "pastTimeError") {
                            toast("既に開始された番組です")
                        }
                    })
                });
            } else {
                //登録済み
                notifyButton.text("拡張機能の通知登録解除").css('background-color', '#feb').click(function (e) {
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
    }
}
function programTimeStrToTime(programTimeStr) {
    var programTimeArray = programTimeStr.match(/(\d+)月(\d+)日（[^ ~]+）(\d+):(\d+)/);
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
    if (checkUrlPattern(true) != 0) { return; }
    var divs = $("div");
    var contentsWrapper;
    var rightContents;
    var leftContnts;
    var j=divs.map(function(i, e){//大きくて子要素が２つ
        var rect = e.getBoundingClientRect();
        if(rect.top<window.innerHeight/4&&rect.left<window.innerWidth/4&&rect.width>1000/2&&rect.height>window.innerHeight/2&&$(e).children().length==2)return e;
    });
    if(j.length>0){contentsWrapper=j;}
    else{
        contentsWrapper=$('.tZ_o')
    }
    rightContents = contentsWrapper.children().eq(1);
    leftContnts = contentsWrapper.children().eq(0);
    var titleElement = rightContents.find('h2').eq(0);
    if (titleElement.text() == "") { setTimeout(function () { putNotifyButton(url) }, 1000); console.log("putNotifyButton wait"); return; }
    var urlarray = url.substring(17).split("/");
    var channel = urlarray[1];
    var channelName = titleElement.next().text();
    var programID = urlarray[3];
    var programTitle = titleElement.text();
    var programTimeStr = titleElement.nextAll().eq(2).text();
    //console.log(programTimeStr, urlarray)
    var programTime = programTimeStrToTime(programTimeStr);
    console.log(programTime)
    putNotifyButtonElement(channel, channelName, programID, programTitle, programTime, leftContnts.children('div'));
}
function putSerachNotifyButtons() {
    if (checkUrlPattern(true) != 4 && checkUrlPattern(true) != 5) { return; }
    var listWrapper = $('div[role=list]');
    var listItems = $('a[role=listitem]');
    var noContentText = '該当する放送予定の番組はありませんでした';
    var noContentMessage = $('p').map(function(i,e){if(e.innerHTML.indexOf(noContentText)>=0){return e}});
    if (listItems.length == 0 && noContentMessage.length == 0) { setTimeout(function () { putSerachNotifyButtons() }, 1000); console.log("putSerachNotifyButtons wait"); return; }
    listItems.each(function (i, elem) {
        var linkArea = $(elem);
        var spans = linkArea.children().eq(1).find('span');
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
}
function putReminderNotifyButtons() {
    if (checkUrlPattern(true) != 4 && checkUrlPattern(true) != 5) { return; }
    var listWrapper = $('div[role=list]');
    var listItems = $('a[role=listitem]');
    var featureText = '見たい番組を見逃さないためには';//公式通知登録一覧で何も登録してないときの機能紹介文
    var featureMessage = $('p').map(function(i,e){if(e.innerHTML.indexOf(featureText)>=0){return e}});
    if (listItems.length == 0 && featureMessage.length == 0) { setTimeout(function () { putReminderNotifyButtons() }, 1000); console.log("putReminderNotifyButtons wait"); return; }
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
}
function putSideDetailNotifyButton(){
    //console.log('putSideDetailNotifyButton()');
    var sideDetailWrapper = $(EXTTsideR);
    if(sideDetailWrapper.length == 0||sideDetailWrapper.offset().left>window.innerWidth-50){return;}
    console.log('put side notify button');
    var fp=sideDetailWrapper.find('p');//番組詳細,タイトル,日時,見逃し云々?
    var progTitle;
    var progTime = programTimeStrToTime(fp.eq(2).text());
    if(fp.length>=3){
        progTitle = fp.eq(1).text();
        progTime = programTimeStrToTime(fp.eq(2).text());
    }else{
        progTitle=$('zo_bq').text();
        progTime = programTimeStrToTime($('.zo_hs').text());
    }
    var fa=sideDetailWrapper.find('a').map(function(i,e){if(e.innerHTML.indexOf("詳細")==0)return e;});//a 放送中なら放送画面リンク,詳細をもっとみる
    var progLinkArr;
    if(fa.length>0) progLinkArr = fa.first().attr("href").split('/');
    else progLinkArr=$('.zo_zu').attr("href").split('/');
//    var channel = progLinkArr[2];
    var urlchan = progLinkArr.indexOf("channels");
    if (urlchan < 0) { return; }
    var channel = progLinkArr[urlchan + 1];
    var channelName = getChannelNameOnTimetable(channel);
//    var progID = progLinkArr[4];
    var progID = progLinkArr[urlchan + 3];
    var notifyButParent;
    if(fp.length>=3&&fa.length>0&&fp.eq(2).next("div").is(fa.first().prev("div")))//fp2のすぐ下かつfa0のすぐ上のやつ
        notifyButParent=fp.eq(2).next("div").children("div").first();
    else notifyButParent=sideDetailWrapper.find('.zo_zw>div');
    putNotifyButtonElement(channel, channelName, progID, progTitle, progTime, notifyButParent);
}

chrome.runtime.onMessage.addListener(function (r) {
    //console.log(r);
    if (r.name == "bgsend") {
        if (r.type == 0) {
            //console.log("ts,"+r.value+"p");
            bginfo[0] = r.value;
            if (bginfo[2] != 0) {
                if (bginfo[2] == -1) {
                    //console.log("tryCM bginfo[2]= -1");
                    setTimeout(tryCM, 500);
                }
                if (bginfo[1].length > 0 && bginfo[1][2] - bginfo[1][1] > 5) {
                    //console.log("bginfo[2]= "+bginfo[2]+" -> 3");
                    bginfo[2] = 3;
                }
            }
        } else if (r.type == 1) {
            //console.log("nowcm#"+r.value[0]+","+r.value[1]+"/"+r.value[2]);
            if (r.value[1] < r.value[2]) {
                var b = false;
                if (bginfo[1].length == 0) {
                    b = true;
                } else {
                    if (r.value[0] == bginfo[1][0] && r.value[1] > bginfo[1][1]) {
                        b = true;
                    } else if (r.value[0] > bginfo[1][0]) {
                        b = true;
                    }
                }
                if (b) {
                    bginfo[1] = [r.value[0], r.value[1], r.value[2]];
                }
                if (bginfo[2] <= 1) {
                    //console.log("bginfo[2]= "+bginfo[2]+" -> 2");
                    bginfo[2] = 2;
                    if (cmblockcd * 100 % 10 != 3) {
                        cmblockcd = 0;
                        startCM();
                    }
                }
                cmblockcd=r.value[1]-r.value[2]-1;
            } else if (r.value[1] == r.value[2]) {
                if (bginfo[1].length > 0 && r.value[0] == bginfo[1][0]) {
                    bginfo[1] = [];
                }
                if (bginfo[1].length == 0) {
                    if (bginfo[2] == 3) {
                        //console.log("bginfo[2]= 3 -> 0");
                        bginfo[2] = 0;
                        if (cmblockcd * 100 % 10 != -3) {
                            cmblockcd = 0;
                            endCM();
                        }
                    } else {
                        //console.log("tryCM bginfo[2]= "+bginfo[2]);
                        setTimeout(tryCM, 500);
                    }
                }
            }
        } else if (r.type == 2) {
            //console.log("precm");
            if (bginfo[1].length == 0) {
                //console.log("bginfo[2]= "+bginfo[2]+" -> 1");
                bginfo[2] = 1;
            }
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
        console.warn("message not match")
    }
});