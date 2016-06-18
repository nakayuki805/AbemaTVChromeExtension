var settings = {};
/*設定
拡張機能のオプション画面から設定できます。
以下の変数のコメントにある機能を利用する場合はtrue、利用しない場合はfalseを代入してください。
例:
var isHoge = true; //利用したい機能
var isFuga = false; //利用したくない機能
*/
settings.isResizeScreen = false; //ウィンドウが横長でも映像の端が切れることないようウィンドウに収まるようリサイズ 不具合報告があったのでデフォルトでfalse
settings.isDblFullscreen = false; //ダブルクリックで全画面表示に切り替え(全画面表示のときは機能しません。通常→全画面のみ)
//var isEnterSubmit = false; //エンターでコメント送信(無効にしていてもShift+エンターで送信できます。)
var isHideOldComment = false; //古いコメントを非表示
var isCMBlack = false; //コメント数無効(CommentMukou)の時ずっと画面真っ黒
var isCMBkTrans = false; //コメント数無効の時ずっと画面真っ黒を少し透かす
var isCMsoundoff = false; //コメント数無効の時ずっと音量ミュート
var CMsmall=100; //コメント数無効の時ずっと映像縮小
var isMovingComment = false; //あの動画サイトのように画面上をコメントが流れる(コメント欄を表示しているときのみ機能)
settings.movingCommentSecond = 10;//コメントが画面を流れる秒数
var movingCommentLimit = 30;//同時コメント最大数
var isMoveByCSS = false;//CSSのanimationでコメントを動かす
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
var sureReadRefreshx=2000000; //コメ欄開きっ放しの時にコメ数がこれ以上ならコメ欄を自動開閉する
settings.isAlwaysShowPanel = false; //黒帯パネルを常に表示する
//var isMovieResize = false; //映像を枠に合わせて縮小
var isMovieMaximize = false; //映像最大化
var commentBackColor = 255; //コメント一覧の背景色
var commentBackTrans = 127; //コメント一覧の背景透過
var commentTextColor = 0; //コメント一覧の文字色
var commentTextTrans = 255; //コメント一覧の文字透過
var isCommentPadZero=false; //コメント一覧のコメ間の間隔を詰める
var isCommentTBorder=false; //コメント一覧のコメ間の区切り線表示
var timePosition="windowtop"; //残り時間の表示位置
var notifySeconds=60;//何秒前に番組通知するか
var cmblockia=1; //コメント欄が無効になってからCM処理までのウェイト(+1以上)
var cmblockib=-1; //有効になってから解除までのウェイト(-1以下)
var isManualKeyCtrlR=false; //右ctrlキーによる手動調整
var isManualKeyCtrlL=false; //左ctrlキーによる手動調整
var isManualMouseBR=false; //マウスによる右下での手動調整
var isCMBkR=false; //画面クリックによる真っ黒解除
var isCMsoundR=false; //画面クリックによるミュート解除
var isCMsmlR=false; //画面クリックによる縮小解除

console.log("script loaded");
//window.addEventListener(function () {console.log})
//設定のロード
if (chrome.storage) {
    chrome.storage.local.get(function (value) {
        $.extend(settings, value);
        settings.isResizeScreen = value.resizeScreen || false;
        settings.isDblFullscreen = value.dblFullscreen || false;
//        isEnterSubmit = value.enterSubmit || false;
        isHideOldComment = value.hideOldComment || false;
        isCMBlack = value.CMBlack || false;
        isCMBkTrans = value.CMBkTrans || false;
        isCMsoundoff = value.CMsoundoff || false;
        CMsmall = Math.min(100,Math.max(5,((value.CMsmall!==undefined)?value.CMsmall : CMsmall)));
        isMovingComment = value.movingComment || false;
        settings.movingCommentSecond = (value.movingCommentSecond!==undefined)?value.movingCommentSecond : settings.movingCommentSecond;
        movingCommentLimit = (value.movingCommentLimit!==undefined)?value.movingCommentLimit : movingCommentLimit;
        isMoveByCSS =　value.moveByCSS || false;
        isComeNg = value.comeNg || false;
        isComeDel = value.comeDel || false;
        fullNg = value.fullNg || fullNg;
        isInpWinBottom = value.inpWinBottom || false;
        isCustomPostWin = value.customPostWin || false;
        isCancelWheel = value.cancelWheel || false;
        isVolumeWheel = value.volumeWheel || false;
        changeMaxVolume = Math.min(100,Math.max(0,((value.changeMaxVolume!==undefined)?value.changeMaxVolume : changeMaxVolume)));
        isTimeVisible = value.timeVisible || false;
        isSureReadComment = value.sureReadComment || false;
        sureReadRefreshx = Math.max(101,((value.sureReadRefreshx!==undefined)?value.sureReadRefreshx : sureReadRefreshx));
//        isMovieResize = value.movieResize || false;
        isMovieMaximize = value.movieMaximize || false;
        settings.isAlwaysShowPanel = value.isAlwaysShowPanel || false;
        commentBackColor = (value.commentBackColor!==undefined)?value.commentBackColor : commentBackColor;
        commentBackTrans = (value.commentBackTrans!==undefined)?value.commentBackTrans : commentBackTrans;
        commentTextColor = (value.commentTextColor!==undefined)?value.commentTextColor : commentTextColor;
        commentTextTrans = (value.commentTextTrans!==undefined)?value.commentTextTrans : commentTextTrans;
        isCommentPadZero = value.commentPadZero || false;
        isCommentTBorder = value.commentTBorder || false;
        timePosition = value.timePosition || timePosition;
        notifySeconds = (value.notifySeconds!==undefined)?value.notifySeconds : notifySeconds
        cmblockia = Math.max(1,((value.beforeCMWait!==undefined)?(1+value.beforeCMWait) : cmblockia));
        cmblockib = -Math.max(1,((value.afterCMWait!==undefined)?(1+value.afterCMWait) : (-cmblockib)));
        isManualKeyCtrlR = value.manualKeyCtrlR || false;
        isManualKeyCtrlL = value.manualKeyCtrlL || false;
        isManualMouseBR = value.manualMouseBR || false;
        isCMBkR = (value.CMBkR || false)&&isCMBlack;
        isCMsoundR = (value.CMsoundR || false)&&isCMsoundoff;
        isCMsmlR = (value.CMsmlR || false)&&(CMsmall!=100);
    });
}

var currentLocation = window.location.href;
//var urlchangedtick=Date.now();
var commentNum = 0;
var comeLatestPosi=[];
var comeTTLmin=3;
var comeTTLmax=13;
var comeLatestLen=10;
comeLatestPosi.length=comeLatestLen;
for(var i=0;i<comeLatestLen;i++){
    comeLatestPosi[i]=[]
    comeLatestPosi[i][0]=0;
    comeLatestPosi[i][1]=comeTTLmin;
}
var playtick=0;
var comeLatestCount=0;
var arFullNg=[];
var retrytick=[1000,3000,6000,12000,18000];
var retrycount=0;
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
//var proEnd = new Date(Date.now()+60*60*1000); //番組終了として現在時刻から1時間後を仮設定
var proEnd = new Date(); //↑で23時～24時の間に実行すると終了時刻が1日ずれるので現時刻にした
var forElementClose = 5;
var EXcomelist;
var EXcomments;

var commentsSelector = '[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]';
var commentListParentSelector = '[class*="styles__comment-list-wrapper___"] > div';

var EXmain;
var EXhead;
var EXfoot;
var EXfootcome;
var EXfootcount;
var EXfootcountview;
var EXfootcountcome;
var EXside;
var EXchli;
var EXinfo;
var EXcome;
var EXcomesend;
var EXcomesendinp;
//var EXcomesendbut;
var EXcomecont;
//var EXcomelist0;
var EXobli;
var EXwatchingnum;
var EXwatchingstr;
var EXvolume;
var comeclickcd=2; //コメント欄を早く開きすぎないためのウェイト
var cmblockcd=0; //カウント用
var comeRefreshing=false; //コメ欄自動開閉中はソートを実行したいのでコメント更新しない用
var newtop = 0;//映像リサイズのtop
var comeHealth=100; //コメント欄を開く時の初期読込時に読み込まれたコメント数（公式NGがあると100未満になる）
var bginfo=[0,[],-1,-1];
var eventAdded=false; //各イベントを1回だけ作成する用
var setBlacked=[false,false,false];
var keyinput = [];
var keyCodes = "38,38,40,40,37,39,37,39,66,65";

function onresize() {
    if (settings.isResizeScreen) {
        var obj = $("object").parent(),
            wd = window.innerWidth,
            hg = window.innerHeight,
            wdbyhg = hg*16/9,
            newwd,
            newhg;
        newtop = 0;
        if (wd > wdbyhg) {
            newwd = wdbyhg;
            newhg = hg;
            //newtop = (hg-newhg)/2;
        } else {
            newwd = wd;
            newhg = wd*9/16;
        }
        obj.css("width", newwd + "px");
        obj.css("height", newhg + "px");
        //obj.css("left", ((wd-newwd)/2)+"px");
        //obj.css("top", newtop+"px");
        obj.offset({"top": newtop, "left": ((wd-newwd)/2)})
        console.log("screen resized");
    }
}
function toggleFullscreen() {
    var fullscElem = document.fullscreenElement || document.webkitFullscreenElement|| document.mozFullscreenElement|| document.msFullscreenElement;
    if (fullscElem) {
        document.exitFullscreen && document.exitFullscreen();
        document.webkitCancelFullScreen && document.webkitCancelFullScreen();
        document.mozCancelFullScreen && document.mozCancelFullScreen();
        document.msExitFullscreen && document.msExitFullscreen();
        document.cancelFullScreen && document.cancelFullScreen();
    } else {
        //setTimeout()
        //$(".style__screen___3qOxD").css({"position": "absolute", "left": "0px", "top": "0px"});//フルスクリーンにするとこの要素が迷子になってしまうので位置指定
        var fullscTarget = $(".style__home___1-shO")[0];
        fullscTarget.requestFullscreen && fullscTarget.requestFullscreen();
        fullscTarget.webkitRequestFullscreen && fullscTarget.webkitRequestFullscreen();
        fullscTarget.mozRequestFullScreen && fullscTarget.mozRequestFullScreen();
        fullscTarget.msRequestFullscreen && fullscTarget.msRequestFullscreen();
    }
}
//function moveComment(commentElement, commentLeftEnd){
//    var commentLeft = commentElement.offset().left - 2;
//    commentElement.css("left", commentLeft+"px");
//    if (commentLeft > commentLeftEnd) {
//        setTimeout(function (){moveComment(commentElement,commentLeftEnd);},movingCommentSpeed);
//function moveComment(){
//    //コメントコンテナを動かす
//    //削除は1秒おきのイベントで行う
//    if($('#moveContainer').children().length>0){
//        $('#moveContainer').css("left",($('#moveContainer').offset().left-2)+"px");
//    }else{
//        commentElement.remove();
//        $('#moveContainer').css("left","0px"); //コメントが無い場合はleftを0に戻す
//    }s
//    setTimeout(moveComment,movingCommentSpeed);
//}
function arrayFullNgMaker(){
    //自由入力欄からNG正規表現を生成
    arFullNg=[];
    var spfullng = fullNg.split(/\r|\n|\r\n/);
    for(var ngi=0;ngi<spfullng.length;ngi++){
        if(spfullng[ngi].length==0||spfullng[ngi].match(/^\/\//)){
            continue;
        }
        spfullng[ngi]=spfullng[ngi].replace(/\/\/.*$/,""); //文中コメントを除去
        var refullng = /^\/(.+)\/([igm]*)$/;
        var rexefullng;
        if((rexefullng=refullng.exec(spfullng[ngi]))!=null){
            try{
                spfullng[ngi]=new RegExp(rexefullng[1],rexefullng[2]);
            }catch(e){
                spfullng[ngi]=new RegExp("\\"+spfullng[ngi].split("").join("\\"));
            }
        }else{
            spfullng[ngi]=new RegExp("\\"+spfullng[ngi].split("").join("\\"));
        }
        console.log(spfullng[ngi]);
        arFullNg.push(spfullng[ngi]);
    }
}
function comeNG(prengcome){
    //規定のNG処理
    var ngedcome = prengcome;
    var strface1 = "[　 ]*[Σ<＜‹૮＋\\+\\*＊･゜ﾟ:\\.｡\\'☆〜～ｗﾍ√ﾚｖꉂ]*[　 ]*[┌└┐⊂二乁＼ヾヽつっdｄo_ƪ\\\\╭╰m👆ฅｍ\╲٩Ｏ∩]*[　 ]*[（\\(《〈\\[\\|｜fζ]+.*[8oO∀дД□◯▽△＿ڼ ౪艸^_⌣зεωm௰ｍ꒳ｰワヮ－U◇。｡࿄ш﹏㉨ꇴㅂ\\-ᴗ‿˘﹃_ﾛ◁ฅ∇益言人ㅅＡAΔΘ罒ᗜ◒◊vਊ⍛ー3xエェｪｴρｐ]+.*";
    var strface2 = "[）\\)》〉\\]\\|｜]";
    var strface3 = "[　 ]*[┐┘┌┸┓／シノ厂\\/ｼﾉ۶つっbｂoა_╮╯mｍو👎☝」Ｏσ二⊃ゝʃง∩]";
    var strface4 = "[　 ]*[彡°ﾟ\\+・･⚡\\*＋＊ﾞ゜:\\.｡\\' ̑̑🌾💢ฅ≡<＜>＞ｗﾍ√ﾚｖ]*[　 ]*";
    var reface1 = new RegExp(strface1+strface2+"+"+strface3+"*"+strface4,"g");
    var reface2 = new RegExp(strface1+strface2+"*"+strface3+"+"+strface4,"g");
    ngedcome = ngedcome.replace(reface1,"");
    ngedcome = ngedcome.replace(reface2,"");
    ngedcome = ngedcome.replace(/(\@\w+[　 ]*)+/g,""); //twitter-dest.
    ngedcome = ngedcome.replace(/(#[^　 ]+[　 ]*)+$/g,""); //twitter-tag
    ngedcome = ngedcome.replace(/[ｗw]{4,}/g,"ｗｗｗ");
    ngedcome = ngedcome.replace(/ʬ+/g,"ｗ");
    ngedcome = ngedcome.replace(/h?ttps?\:\/\/.*\..*/,"");
    ngedcome = ngedcome.replace(/[〜～ー－━─]{2,}/g,"ー");
    ngedcome = ngedcome.replace(/[・\･…‥、\､。\｡．\.]{2,}/g,"‥");
    ngedcome = ngedcome.replace(/[　 \n]+/g," ");
    ngedcome = ngedcome.replace(/[？\?❔]+/g,"？");
    ngedcome = ngedcome.replace(/[！\!‼️]+/g,"！");
    ngedcome = ngedcome.replace(/[○●]+/g,"○");
    ngedcome = ngedcome.replace(/(.)\1{3,}/g,"$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1{3,}/,"$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1*(...*?)(\1|\2){2,}/g,"$1$2");
    return ngedcome;
}
function putComment(commentText) {
    if (isComeDel) {
        //arFullNgがマッチしたコメントは流さない
        for(var ngi=0;ngi<arFullNg.length;ngi++){
            if(commentText.match(arFullNg[ngi])){
                console.log("userNG matched text:" + commentText  + "ngword:" + arFullNg[ngi].toString())
                return "";
            }
        }
    }
    if (isComeNg) {
        commentText = comeNG(commentText);
    }
    var commentTop = Math.floor(Math.random()*(window.innerHeight-200))+50;
    i=0;
    var k=false;
    while(i<20){
        k=false;
        for(var j=0;j<comeLatestLen;j++){
            if(Math.abs(commentTop-comeLatestPosi[j][0])<30){
                k=true;
            }
        }
        if(k){
            commentTop = Math.floor(Math.random()*(window.innerHeight-200))+50;
        }else{
            break;
        }
        i+=1;
    }
//    if(i>=20){
//        commentTop=50;
//    }
//    var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+window.innerWidth+"px;'>" + commentText + "</div>").appendTo("body");
//    var commentWidth = commentElement.width();
//    var commentLeftEnd = -1*commentWidth;
//    setTimeout(function (){moveComment(commentElement, commentLeftEnd);},Math.random()*1000);
//    moveComment(commentElement);
//    comeLatestPosi.push([commentTop,comeTTL]);
    var maxLeftOffset = window.innerWidth*5 / settings.movingCommentSecond;
    
    if (isMoveByCSS) {
        var leftOffset = maxLeftOffset - Math.floor(Math.random()*maxLeftOffset);
        var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+(window.innerWidth+leftOffset)+"px;twidth:"+window.innerWidth+"px;'>" + commentText + "</div>").appendTo("#moveContainer");
        setTimeout(function(){
            commentElement.css("transition", "left "+settings.movingCommentSecond*(1+maxLeftOffset/window.innerWidth)+"s linear");
            commentElement.css("left", -(commentElement.width()+maxLeftOffset-leftOffset) + "px");
        },0);
    } else {
        var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+(Math.floor(window.innerWidth-$("#moveContainer").offset().left+Math.random()*maxLeftOffset))+"px;'>" + commentText + "</div>").appendTo("#moveContainer");
    }
    //コメント設置位置の保持
    comeLatestPosi.push([commentTop,Math.min(comeTTLmax,Math.max(comeTTLmin,Math.floor((commentElement.width()+maxLeftOffset)*settings.movingCommentSecond/window.innerWidth+2)))]);
    comeLatestPosi.shift();
    if(parseInt($("#moveContainer").css("left"))>=1 && !isMoveByCSS){ //初期位置にいたら動かす
        StartMoveComment();
    }
}
//ミュート(false)・ミュート解除(true)する関数
function soundSet(isSound) {
    if(!EXvolume){return;}
    var butvol=$(EXvolume).contents().find('svg:first');
    var valvol=$(EXvolume).contents().find('[class^="styles__highlighter___"]:first');
    var evt=document.createEvent("MouseEvents");
    evt.initEvent("click",true,true);
    valvol=parseInt(valvol[0].style.height);
    if (isSound) {
        //ミュート解除
        //音量0ならボタンを押す
        if(valvol==0){
            setBlacked[1]=false;
            butvol[0].dispatchEvent(evt);
        }
    } else {
        //ミュート
        //音量0でないならボタンを押す
        if(valvol!=0){
            setBlacked[1]=true;
            butvol[0].dispatchEvent(evt);
        }
    }
}
//画面を真っ暗、透過する関数 0:無 1:半分透過 2:すべて透過 3:真っ黒
function screenBlackSet(type) {
    var pwaku = $('[class^="style__overlap___"]'); //動画枠
    if (type == 0) {
        setBlacked[0]=false;
        pwaku.css("background-color","")
            .css("border-top","")
        ;
    } else if (type == 1) {
        var w=$(window).height();
        var p=0;
        var t=1;
        if(EXwatchingnum){
            var jo=$(EXobli.children[EXwatchingnum]);
            w=jo.height();
            p=jo.offset().top;
            if(jo.css("transform")!="none"){
                t=parseFloat((/(?:^| )matrix\( *\d+.?\d* *, *\d+.?\d* *, *\d+.?\d* *, *(\d+.?\d*) *, *\d+.?\d* *, *\d+.?\d* *\)/.exec(jo.css("transform"))||[,t])[1]);
            }
        }
        setBlacked[0]=true;
        pwaku.css("background-color","rgba(0,0,0,0.7)")
            .css("border-top",Math.floor(p+w*t/2)+"px black solid")
        ;
//        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+Math.floor(p+w/2)+"px;");
    } else if (type == 2) {
        setBlacked[0]=true;
        pwaku.css("background-color","rgba(0,0,0,0.7)");
    } else if (type == 3) {
        setBlacked[0]=true;
        pwaku.css("background-color","black");
    }
}
function movieZoomOut(sw){
    if(!EXwatchingnum){return;}
    if(sw==1&&CMsmall<100){
        setBlacked[2]=true;
        $(EXobli.children[EXwatchingnum]).css("transform","scale("+CMsmall/100+")");
    }else{
        setBlacked[2]=false;
        $(EXobli.children[EXwatchingnum]).css("transform","");
    }
}
//マウスを動かすイベント
var movecnt = 0;
function triggerMousemoveEvt(x, y){
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("mousemove", true, false, window, 0, 0, 0, x, y);
    return document.dispatchEvent(evt);
}
function triggerMouseMoving(){
//console.log('triggerMM')
    var overlap = $('[class^="AppContainer__background-black___"]');
    overlap.trigger('mouseover').trigger('mousemove');
    $('body').trigger('mouseover').trigger('mousemove');
    var xy = Math.random()*100+300;
    triggerMousemoveEvt(xy,xy);
    
}
function openOption(sw){
    var settcontjq = $("#settcont");
    settcontjq.css("display","block");
//    var settcontheight=settcontjq[0].scrollHeight;
//    var settcontpadv=parseInt(settcontjq.css("padding-top"))+parseInt(settcontjq.css("padding-bottom"));
////    if (settconttop < 0){//設定ウィンドウが画面からはみ出したときにスクロールできるように
//    if(settcontheight>$(window).height()-105-settcontpadv){
//        settcontjq.height($(window).height()-105-settcontpadv).css("overflow-y", "scroll");
//    }
    optionHeightFix();
    sw=sw.data||sw;
    if(sw==1){ //サイドバーボタン
    }else if(sw==2){ //残り時間上
    }else if(sw==3){ //残り時間下
    }
    //設定ウィンドウにロード
    $("#isResizeScreen").prop("checked", settings.isResizeScreen);
    $("#isDblFullscreen").prop("checked", settings.isDblFullscreen);
//    $("#isEnterSubmit").prop("checked", isEnterSubmit);
    $("#isHideOldComment").prop("checked", isHideOldComment);
    $("#isCMBlack").prop("checked", isCMBlack);
    $("#isCMBkTrans").prop("checked", isCMBkTrans);
    $("#isCMsoundoff").prop("checked", isCMsoundoff);
    $("#CMsmall").val(CMsmall);
    $("#isMovingComment").prop("checked", isMovingComment);
    $("#movingCommentSecond").val(settings.movingCommentSecond);
    $("#movingCommentLimit").val(movingCommentLimit);
    $("#isMoveByCSS").prop("checked", isMoveByCSS);
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
    $("#sureReadRefreshx").val(sureReadRefreshx);
    $("#isAlwaysShowPanel").prop("checked", settings.isAlwaysShowPanel);
//    $("#isMovieResize").prop("checked", isMovieResize);
    $("#isMovieMaximize").prop("checked", isMovieMaximize);
    $("#commentBackColor").val(commentBackColor);
    $("#commentBackTrans").val(commentBackTrans);
    $("#commentTextColor").val(commentTextColor);
    $("#commentTextTrans").val(commentTextTrans);
    var bc="rgba("+commentBackColor+","+commentBackColor+","+commentBackColor+","+(commentBackTrans/255)+")";
    var tc="rgba("+commentTextColor+","+commentTextColor+","+commentTextColor+","+(commentTextTrans/255)+")";
    $(EXcomelist).children('div').css("background-color",bc)
        .css("color",tc)
        .children('p[class^="styles__message___"]').css("color",tc)
    ;
    $("#commentBackColor").val(commentBackColor)
        .prev('span.prop').text(commentBackColor+" ("+Math.round(commentBackColor*100/255)+"%)")
    ;
    $("#commentBackTrans").val(commentBackTrans)
        .prev('span.prop').text(commentBackTrans+" ("+Math.round(commentBackTrans*100/255)+"%)")
    ;
    $("#commentTextColor").val(commentTextColor)
        .prev('span.prop').text(commentTextColor+" ("+Math.round(commentTextColor*100/255)+"%)")
    ;
    $("#commentTextTrans").val(commentTextTrans)
        .prev('span.prop').text(commentTextTrans+" ("+Math.round(commentTextTrans*100/255)+"%)")
    ;
    $("#isCommentPadZero").prop("checked", isCommentPadZero);
    $("#isCommentTBorder").prop("checked", isCommentTBorder);
    $('#itimePosition [type="radio"][name="timePosition"]').val([timePosition]);
    $('#itimePosition').css("display",isTimeVisible?"block":"none");
    $("#notifySeconds").val(notifySeconds);
    $('#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]').val([0]);
    $('#settcont>#windowresize>#windowheight input[type="radio"][name="movieheight"]').val([0]);
    $("#beforeCMWait").val(cmblockia-1);
    $("#afterCMWait").val(-cmblockib-1);
    $("#isManualKeyCtrlR").prop("checked", isManualKeyCtrlR);
    $("#isManualKeyCtrlL").prop("checked", isManualKeyCtrlL);
    $("#isManualMouseBR").prop("checked", isManualMouseBR);
    $("#isCMBkR").prop("checked", isCMBkR);
    $("#isCMsoundR").prop("checked", isCMsoundR);
    $("#isCMsmlR").prop("checked", isCMsmlR);
}
function closeOption(){
    $("#settcont").css("display","none")
        .css("right","40px")
    ;
    $("#settcont .rightshift").css("display","none");
    $("#settcont .leftshift").css("display","");
    $(EXcomelist).children('div').css("background-color","")
        .css("color","")
        .children('p[class^="styles__message___"]').css("color","")
    ;
    setOptionElement();
}
function optionHeightFix(){
    var settcontjq = $("#settcont");
    var settcontheight=settcontjq[0].scrollHeight;
    var settcontpadv=parseInt(settcontjq.css("padding-top"))+parseInt(settcontjq.css("padding-bottom"));
    if(settcontheight>$(window).height()-105-settcontpadv){
//console.log("optionHeightFix: "+settcontjq.height()+" -> "+($(window).height()-105-settcontpadv));
        settcontjq.height($(window).height()-105-settcontpadv).css("overflow-y", "scroll");
    }
}
function toast(message) {
    var toastElem = $("<div class='toast'><p>" + message + "</p></div>").appendTo("body");
    setTimeout(function(){
        toastElem.fadeOut(3000);
    },4000);
}
function delayset(){
    var hoverContents = $('[class*="styles__hover-contents___"]');
    if(hoverContents.length==0){
console.log("delayset retry");
        setTimeout(delayset,1000);
        return;
    }
    //拡張機能の設定をその他メニューに追加
    var hoverLinkClass = hoverContents.children()[0].className;
    if(hoverContents.children('#extSettingLink').length==0){
        hoverContents.append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="' + chrome.extension.getURL("option.html") + '" target="_blank">拡張設定</a>');
    }
    createSettingWindow();
    arrayFullNgMaker();
    if($('body:first>#moveContainer').length==0){
        var eMoveContainer=document.createElement('div');
        eMoveContainer.id="moveContainer";
        eMoveContainer.setAttribute("style","position:absolute;top:50px;left:1px;z-index:9;");
        $("body").append(eMoveContainer);
    }
//console.log("comevisiset delayset");
    comevisiset(false);
    if(isSureReadComment){
//console.log("popElement delayset");
        popElement();
    }else{
        unpopElement();
    }
    EXcomelist = $(commentListParentSelector)[0];
    EXcomments = $(EXcomelist).contents().find('[class^="styles__message___"]');
    //映像のリサイズ
    onresize();
console.log("delayset ok");
}
function optionStatsUpdate(outflg){
    var out=[0,0];
    if($('body:first>#settcont').length==0){return;}
    var tar=$('#settcont>#windowresize>#movieheight>#sourceheight');
    if(bginfo[0]>0&&tar.length>0){
        tar.text("(ソース:"+bginfo[0]+"p)")
            .css("display","")
        ;
    }
    tar=$('#settcont>#windowresize>#windowsizes');
    if(EXwatchingnum&&tar.length>0){
        var jo=$(EXobli.children[EXwatchingnum]);
        var omw=jo.width();
        var omh=jo.height();
        var oww=$(window).width();
        var owh=$(window).height();
        var opw=oww-omw;
        var opb=Math.floor((owh-omh)/2);
        var opt=owh-omh-opb;
        var nmw=omw;
        var nmh=omh;
        var sm=parseInt($('#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]:checked').val());
        if(sm>0){
            nmh=sm;
            nmw=Math.ceil(nmh*16/9);
        }
        var npw=opw;
        var npb=opb;
        var npt=opt;
        var sw=parseInt($('#settcont>#windowresize>#windowheight input[type="radio"][name="windowheight"]:checked').val());
        switch(sw){
            case 0: //変更なし
                npb=Math.floor((owh-nmh)/2);
                npt=owh-nmh-npb;
                break;
            case 1: //映像の縦長さに合わせる
                npb=0;
                npt=0;
                break;
            case 2: //黒枠の分だけ空ける
                npb=64;
                npt=64;
                break;
            case 3: //現在の空きを維持
                npb=opb;
                npt=opt;
                break;
            default:
        }
        var nww=nmw+npw;
        var nwh=nmh+npb+npt;
        tar.html("現在: 映像"+omw+"x"+omh+" +余白(右"+opw+", 上"+opt+", 下"+opb+") =窓"+oww+"x"+owh+"<br>変更: 映像"+nmw+"x"+nmh+" +余白(右"+npw+", 上"+npt+", 下"+npb+") =窓"+nww+"x"+nwh)
            .css("display","")
        ;
        out=[(nww-oww),(nwh-owh)];
    }
    if(outflg){return out;}
}
function createSettingWindow(){
    if(!EXside){
console.log("createSettingWindow retry");
        setTimeout(createSettingWindow,1000);
        return;
    }
    var slidecont = EXside
    //設定ウィンドウ・開くボタン設置
    if($(EXside).children('#optionbutton').length==0){
        var optionbutton = document.createElement("div");
        optionbutton.id = "optionbutton";
        optionbutton.setAttribute("style","width:40px;height:60px;background-color:gray;opacity:0.5;");
        optionbutton.innerHTML = "&nbsp;";
        slidecont.appendChild(optionbutton);
        $("#optionbutton").on("click",function(){
            if($("#settcont").css("display")=="none"){
                openOption(1);
            }else{
                closeOption();
            }
        });
    }
    if($('body:first>#settcont').length==0){
        var settcont = document.createElement("div");
        settcont.id = "settcont";
        //設定ウィンドウの中身
        settcont.innerHTML = "<input type=button class=closeBtn value=閉じる style='position:absolute;top:10px;right:10px;'><br>"+generateOptionHTML(false) + "<br><input type=button id=saveBtn value=一時保存> <input type=button class=closeBtn value=閉じる><br>※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<hr><input type='button' id='clearLocalStorage' value='localStorageクリア'>";
        settcont.style = "width:640px;position:absolute;right:40px;top:44px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:12;";
        $(settcont).prependTo('body');
        $('#settcont #CommentColorSettings').change(setComeColorChanged);
        $('#settcont #itimePosition,#isTimeVisible').change(setTimePosiChanged);
        $("#settcont .closeBtn").on("click", closeOption);
        $("#settcont #clearLocalStorage").on("click", setClearStorageClicked);
        $("#settcont #saveBtn").on("click",setSaveClicked);
    }
    $("#CommentMukouSettings").hide();
    $("#settcont #CommentColorSettings").css("width","600px")
        .css("padding","8px")
        .css("border","1px solid black")
        .children('div').css("clear","both")
        .children('span.desc').css("padding","0px 4px")
        .next('span.prop').css("padding","0px 4px")
        .next('input[type="range"]').css("float","right")
    ;
    $("#settcont #itimePosition").insertBefore("#settcont #isTimeVisible+*")
        .css("border","1px solid black")
        .css("margin-left","16px")
        .css("display","flex")
        .css("flex-direction","column")
        .css("padding","8px")
    ;
    if($('#settcont .leftshift').length==0){
        $('<input type="button" class="leftshift" value="←この画面を少し左へ" style="float:right;margin-top:10px;padding:0px 3px;">').appendTo('#settcont #CommentColorSettings');
        $("#settcont .leftshift").on("click",function(){
            $("#settcont").css("right","320px");
            $("#settcont .leftshift").css("display","none");
            $("#settcont .rightshift").css("display","");
        });
    }
    if($('#settcont .rightshift').length==0){
        $('<input type="button" class="rightshift" value="この画面を右へ→" style="float:right;margin-top:10px;display:none;padding:0px 3px;">').appendTo('#settcont #CommentColorSettings');
        $("#settcont .rightshift").on("click",function(){
            $("#settcont").css("right","40px");
            $("#settcont .rightshift").css("display","none");
            $("#settcont .leftshift").css("display","");
            $('#PsaveCome').prop("disabled",true)
                .css("color","gray")
            ;
            setTimeout(clearBtnColored,1200,$('#PsaveCome'));
        });
    }
    if($('#settcont #windowresize').length==0){
        $('<div id="windowresize">ウィンドウのサイズ変更<span id="windowsizes"></span></div>').insertAfter('#settcont #CommentColorSettings');
        $('#settcont>#windowresize').css("display","flex")
            .css("flex-direction","column")
            .css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
            .children('#windowsizes').css("display","none")
        ;
    }
    if($('#settcont #movieheight').length==0){
        $('<div id="movieheight">映像の縦長さ<br><p id="sourceheight"></p></div>').appendTo('#settcont #windowresize');
        $('<div><input type="radio" name="movieheight" value=0>変更なし</div>').appendTo('#settcont #movieheight');
        $('<div><input type="radio" name="movieheight" value=240>240px</div>').appendTo('#settcont #movieheight');
        $('<div><input type="radio" name="movieheight" value=360>360px</div>').appendTo('#settcont #movieheight');
        $('<div><input type="radio" name="movieheight" value=480>480px</div>').appendTo('#settcont #movieheight');
        $('<div><input type="radio" name="movieheight" value=720>720px</div>').appendTo('#settcont #movieheight');
        $('#settcont #movieheight input[type="radio"][name="movieheight"]').val([0]);
        $('#settcont #movieheight').css("display","flex")
            .css("flex-direction","row")
            .css("flex-wrap","wrap")
            .css("padding","0px 8px")
            .children('#sourceheight').css("display","none")
            .siblings().css("padding","0px 3px")
        ;
    }
    if($('#settcont #windowheight').length==0){
        $('<div id="windowheight">ウィンドウの縦長さ</div>').appendTo('#settcont #windowresize');
        $('<div><input type="radio" name="windowheight" value=0>変更なし</div>').appendTo('#settcont #windowheight');
        $('<div><input type="radio" name="windowheight" value=1>映像の縦長さに合わせる</div>').appendTo('#settcont #windowheight');
        $('<div><input type="radio" name="windowheight" value=2>黒枠の分だけ空ける</div>').appendTo('#settcont #windowheight');
        $('<div><input type="radio" name="windowheight" value=3>現在の余白を維持</div>').appendTo('#settcont #windowheight');
        $('#settcont #windowheight input[type="radio"][name="windowheight"]').val([0]);
        $('#settcont #windowheight').css("display","flex")
            .css("flex-direction","row")
            .css("flex-wrap","wrap")
            .css("padding","0px 8px")
            .children().css("padding","0px 3px")
        ;
    }
    if($('#settcont #PsaveCome').length==0){
        $('<input type="button" id="PsaveCome" class="Psave" value="このコメント外見設定を永久保存(上書き)">').appendTo('#settcont #CommentColorSettings');
        $('#settcont #PsaveCome').css("margin","8px 0 0 24px")
            .on("click",setPSaveCome)
        ;
    }
    if($('#settcont #PsaveNG').length==0){
        $('<input type="button" id="PsaveNG" class="Psave" value="←これらを永久保存(上書き)">').insertAfter('#settcont #fullNg');
        $('#settcont #PsaveNG').css("margin","8px 0 0 8px")
            .on("click",setPSaveNG)
        ;
        $('<div style="clear:both;">').insertAfter('#settcont #PsaveNG');
        $('#settcont #fullNg').css("float","left");
    }
    $('#settcont .Psave').css("margin-left","8px")
        .css("padding","0px 3px")
    ;
    if($('#settcont #CommentMukouSettings .setTables').length==0){
        $('#settcont #CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $('<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>').prependTo('#settcont #CommentMukouSettings');
        $('#settcont #ComeMukouO').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('<table id="setTable">').appendTo('#settcont #ComeMukouO');
        $('#settcont table#setTable').css("border-collapse","collapse");
        $('<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th>音量ミュート</th></tr>').appendTo('#settcont table#setTable');
        $('<tr><td>適用</td><td></td><td></td><td></td><td></td></tr>').appendTo('#settcont table#setTable');
        $('<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td></td></tr>').appendTo('#settcont table#setTable');
//        $('#settcont table#setTable tr:eq(1)>td:eq(0)').html('適用');
        $('#settcont #isCMBlack').appendTo('#settcont table#setTable tr:eq(1)>td:eq(1)');
        $('#settcont #isCMBkTrans').appendTo('#settcont table#setTable tr:eq(1)>td:eq(1)').css("display","none");
        $('<input type="radio" name="cmbktype" value=0>').appendTo('#settcont table#setTable tr:eq(1)>td:eq(2)')
            .after("全面真黒<br>")
        ;
        $('<input type="radio" name="cmbktype" value=1>').appendTo('#settcont table#setTable tr:eq(1)>td:eq(2)')
            .after("下半透明")
        ;
        $('#settcont input[type="radio"][name="cmbktype"]').prop("disabled",!isCMBlack)
            .val([isCMBkTrans?1:0])
        ;
        $('#settcont table#setTable input[type="radio"][name="cmbktype"]').change(setCMBKChangedR);
        $('#settcont #CMsmall').appendTo('#settcont table#setTable tr:eq(1)>td:eq(3)').after("％")
            .css("text-align","right")
            .css("width","4em")
        ;
        $('#settcont #isCMsoundoff').appendTo('#settcont table#setTable tr:eq(1)>td:eq(4)');
        $('#settcont table#setTable #isCMBlack').change(setCMBKChangedB);
        $('#settcont table#setTable #CMsmall').change(setCMzoomChangedR);
        $('#settcont table#setTable #isCMsoundoff').change(setCMsoundChangedB);
//        $('#settcont table#setTable tr:eq(2)>td:eq(0)').html('画面クリックで<br>解除・再適用');
        $('#settcont #isCMBkR').appendTo('#settcont table#setTable tr:eq(2)>td:eq(1)');
        $('#settcont #isCMsmlR').appendTo('#settcont table#setTable tr:eq(2)>td:eq(2)');
        $('#settcont #isCMsoundR').appendTo('#settcont table#setTable tr:eq(2)>td:eq(3)');
        $('#settcont table#setTable td').css("border","1px solid black")
            .css("text-align","center")
            .css("padding","3px")
        ;
        $('#settcont table#setTable tr:eq(1)>td:eq(1)').css("border-right","none");
        $('#settcont table#setTable tr:eq(1)>td:eq(2)').css("border-left","none")
            .css("text-align","left")
        ;
        $('<div id="ComeMukouW" class="setTables">↑の実行待機(秒)</div>').insertAfter('#settcont #ComeMukouO');
        $('#settcont #ComeMukouW').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('#settcont #beforeCMWait').appendTo('#settcont #ComeMukouW')
            .before("　開始後")
        ;
        $('#settcont #afterCMWait').appendTo('#settcont #ComeMukouW')
            .before("　終了後")
            .after("<br>待機時間中、押している間は実行せず、離すと即実行するキー<br>")
        ;
        $('#settcont #isManualKeyCtrlL').appendTo('#settcont #ComeMukouW').after("左ctrl");
        $('#settcont #isManualKeyCtrlR').appendTo('#settcont #ComeMukouW').after("右ctrl");
        $('#settcont #isManualMouseBR').appendTo('#settcont #ComeMukouW')
            .before("<br>待機時間中、カーソルを合わせている間は実行せず、外すと即実行する場所<br>")
            .after("右下のコメント数表示部")
        ;
        $('#settcont #ComeMukouD').remove();
    }
console.log("createSettingWindow ok");
}
function setClearStorageClicked(){
    window.localStorage.clear();
console.info("cleared localStorage");
}
function setPSaveNG(){
    fullNg = $("#fullNg").val();
    arrayFullNgMaker();
    chrome.storage.local.set({
        "fullNg": fullNg
    },function(){
        $('#PsaveNG').prop("disabled",true)
            .css("background-color","lightyellow")
            .css("color","gray")
        ;
        setTimeout(clearBtnColored,1200,$('#PsaveNG'));
    });
}
function setPSaveCome(){
    commentBackColor = parseInt($("#commentBackColor").val());
    commentBackTrans = parseInt($("#commentBackTrans").val());
    commentTextColor = parseInt($("#commentTextColor").val());
    commentTextTrans = parseInt($("#commentTextTrans").val());
    setOptionHead();
    chrome.storage.local.set({
        "commentBackColor": commentBackColor,
        "commentBackTrans": commentBackTrans,
        "commentTextColor": commentTextColor,
        "commentTextTrans": commentTextTrans
    },function(){
        $('#PsaveCome').prop("disabled",true)
            .css("background-color","lightyellow")
            .css("color","gray")
        ;
        setTimeout(clearBtnColored,1200,$('#PsaveCome'));
    });
}
function clearBtnColored(target){
    target.prop("disabled",false)
        .css("background-color","")
        .css("color","")
    ;
}
function setSaveClicked(){
    settings.isResizeScreen = $("#isResizeScreen").prop("checked");
    settings.isDblFullscreen = $("#isDblFullscreen").prop("checked");
//    isEnterSubmit = $("#isEnterSubmit").prop("checked");
    isHideOldComment = $("#isHideOldComment").prop("checked");
    isCMBlack = $("#isCMBlack").prop("checked");
    isCMBkTrans = $("#isCMBkTrans").prop("checked");
    isCMsoundoff = $("#isCMsoundoff").prop("checked");
    CMsmall = Math.min(100,Math.max(5,$("#CMsmall").val()));
    isMovingComment = $("#isMovingComment").prop("checked");
    settings.movingCommentSecond = parseInt($("#movingCommentSecond").val());
    movingCommentLimit = parseInt($("#movingCommentLimit").val());
    isMoveByCSS = $("#isMoveByCSS").prop("checked");
    isComeNg = $("#isComeNg").prop("checked");
    isComeDel = $("#isComeDel").prop("checked");
    fullNg = $("#fullNg").val();
    var beforeInpWinBottom=isInpWinBottom;
    isInpWinBottom = $("#isInpWinBottom").prop("checked");
    isCustomPostWin = $("#isCustomPostWin").prop("checked");
    isCancelWheel = $("#isCancelWheel").prop("checked");
    isVolumeWheel = $("#isVolumeWheel").prop("checked");
    changeMaxVolume = Math.min(100,Math.max(0,parseInt($("#changeMaxVolume").val())));
    isTimeVisible = $("#isTimeVisible").prop("checked");
    isSureReadComment = $("#isSureReadComment").prop("checked");
    sureReadRefreshx = Math.max(101,$("#sureReadRefreshx").val());
//    isMovieResize = $("#isMovieResize").prop("checked");
    isMovieMaximize = $("#isMovieMaximize").prop("checked");
    settings.isAlwaysShowPanel = $("#isAlwaysShowPanel").prop("checked");
    commentBackColor = parseInt($("#commentBackColor").val());
    commentBackTrans = parseInt($("#commentBackTrans").val());
    commentTextColor = parseInt($("#commentTextColor").val());
    commentTextTrans = parseInt($("#commentTextTrans").val());
    isCommentPadZero = $("#isCommentPadZero").prop("checked");
    isCommentTBorder = $("#isCommentTBorder").prop("checked");
    timePosition = $('#itimePosition [name="timePosition"]:checked').val();
    notifySeconds = parseInt($("#notifySeconds").val());
    cmblockia = Math.max(1,1+parseInt($("#beforeCMWait").val()));
    cmblockib = -Math.max(1,1+parseInt($("#afterCMWait").val()));
    isManualKeyCtrlR = $("#isManualKeyCtrlR").prop("checked");
    isManualKeyCtrlL = $("#isManualKeyCtrlL").prop("checked");
    isManualMouseBR = $("#isManualMouseBR").prop("checked");
    isCMBkR = $("#isCMBkR").prop("checked")&&$("#isCMBlack").prop("checked");
    isCMsoundR = $("#isCMsoundR").prop("checked")&&$("#isCMsoundoff").prop("checked");
    isCMsmlR = $("#isCMsmlR").prop("checked")&&($("#CMsmall").val()!=100);
    setOptionHead();
    setOptionElement();
    arrayFullNgMaker();
//console.log("comevisiset savebtnclick");
    comevisiset(false);
    optionHeightFix();
    var sm=parseInt($('#settcont>#windowresize>#movieheight input[type="radio"][name="movieheight"]:checked').val());
    var sw=parseInt($('#settcont>#windowresize>#windowheight input[type="radio"][name="windowheight"]:checked').val());
//console.log("sm="+sm+",sw="+sw);
    if(sm!=0||sw!=0){
        var s=optionStatsUpdate(true);
        if(s[0]!=0||s[1]!=0){
            chrome.runtime.sendMessage({type:"windowresize",valw:s[0],valh:s[1]},function(r){
                setTimeout(optionHeightFix,1000);
                setTimeout(comevisiset,1000,false);
            });
        }
    }
    $("#saveBtn").prop("disabled",true)
        .css("background-color","lightyellow")
        .css("color","gray")
    ;
    setTimeout(clearBtnColored,1200,$("#saveBtn"));
}
function setTimePosiChanged(){
    if($("#isTimeVisible").prop("checked")){
        $('#itimePosition').css("display","block");
        createTime(0);
        setTimePosition($('#itimePosition [name="timePosition"]:checked').val());
    }else{
        $('#itimePosition').css("display","none");
        createTime(1);
        $('#forProEndTxt,#forProEndBk').css("display","none");
    }
}
function setCMzoomChangedR(){
    var jo=$('#settcont #isCMsmlR');
    if(parseInt($("#CMsmall").val())==100){
        jo.prop("checked",false)
            .prop("disabled",true)
        ;
    }else{
      jo.prop("disabled",false);
    }
}
function setCMsoundChangedB(){
    $('#settcont #isCMsoundR').prop("checked",false)
        .prop("disabled",!$("#isCMsoundoff").prop("checked"))
    ;
}
function setCMBKChangedB(){
    $('#settcont input[type="radio"][name="cmbktype"]').prop("disabled",!$("#isCMBlack").prop("checked"));
    $('#settcont #isCMBkR').prop("checked",false)
        .prop("disabled",!$("#isCMBlack").prop("checked"))
    ;
}
function setCMBKChangedR(){
    $('#settcont #isCMBkTrans').prop("checked",$('#settcont input[type="radio"][name="cmbktype"]:checked').val()==1?true:false);
}
function setComeColorChanged(){
    var p=[];
    $('#CommentColorSettings>div>input[type="range"]').each(function(i,jo){
        $(jo).prev('span.prop').text($(jo).val()+" ("+Math.round($(jo).val()*100/255)+"%)");
        p[i]=$(jo).val();
    });
    var bc="rgba("+p[0]+","+p[0]+","+p[0]+","+(p[1]/255)+")";
    var tc="rgba("+p[2]+","+p[2]+","+p[2]+","+(p[3]/255)+")";
    $(EXcomelist).children('div').css("background-color",bc)
        .css("color",tc)
        .children('p[class^="styles__message___"]').css("color",tc)
    ;
}
function toggleCommentList(){
//console.log("comevisiset toggleCommentList");
    comevisiset(true);
}
function StartMoveComment(){
    if($('body>#moveContainer').children().length>0){
        $('body>#moveContainer').animate({"left":"-="+Math.floor(window.innerWidth/settings.movingCommentSecond)+"px"},{duration:1000,easing:"linear",complete:StartMoveComment});
    }else{
        $('body>#moveContainer').css("left","1px");
    }
}
//function unpopHeader(){
//console.log("unpopHeader");
//    $(EXhead).css("visibility","")
//        .css("opacity","")
//    ;
//    $(EXfoot).css("visibility","")
//        .css("opacity","")
//    ;
//console.log("comevisiset unpopHeader");
//    comevisiset(false);
//}
function popHeader(){
//console.log("popHeader");
    $(EXhead).css("visibility","visible")
      .css("opacity",1)
    ;
    $(EXfoot).css("visibility","visible")
      .css("opacity",1)
    ;
//console.log("comevisiset popHeader");
    comevisiset(false);
}
function comevisiset(sw){
//console.log("comevisiset");
    var comeList = $(commentListParentSelector);
    if(sw){
        comeList.css("display",(comeList.css("display")!="none")?"none":(isInpWinBottom?"flex":"block"));
    }
    var contCome = $(EXcome);
    var comeForm = $(EXcomesend);
    var comeshown = $(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length>0?true:false;
    var hideCommentParam = isCustomPostWin?64:108;
    var clipSlideBarTop = ($(EXhead).css("visibility")=="visible")?44:0;
    var clipSlideBarBot = ($(EXfoot).css("visibility")=="visible")?61:0;
    var butscr = $(EXfoot).contents().find('button[class^="styles__full-screen___"]:first');
    var butvol = $(EXvolume);
    var timepadtop=(isTimeVisible&&(timePosition=="windowtop")&&($(EXhead).css("visibility")=="hidden"))?15:0;
    var timepadbot=(isTimeVisible&&(timePosition=="windowbottom")&&($(EXfoot).css("visibility")=="hidden"))?15:0;
    contCome.css("transform",isSureReadComment?"translateX(0px)":"");
    if(isInpWinBottom){
        var b=80+((isSureReadComment||comeshown)?hideCommentParam:0);
        butscr.css("bottom",b+"px");
        butvol.css("bottom",b+"px");
        if(comeList.css("display")=="none"){
            contCome.css("position","absolute");
            contCome.css("top",(window.innerHeight-hideCommentParam-clipSlideBarBot)+"px");
            contCome.css("height",hideCommentParam+"px");
            comeForm.css("position","absolute");
            comeForm.css("top","");
            comeForm.css("bottom",0);
            comeForm.css("height",hideCommentParam+"px");
            comeList.css("position","absolute");
            comeList.css("width","100%");
        }else{
            contCome.css("position","absolute");
            contCome.css("top",(clipSlideBarTop+timepadtop)+"px");
            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot-timepadtop)+"px");
            comeForm.css("position","absolute");
            comeForm.css("top","");
            comeForm.css("bottom",0);
            comeForm.css("height",hideCommentParam+"px");
            comeList.css("position","absolute");
            comeList.css("bottom","");
            comeList.css("top",0);
            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot-timepadtop)+"px");
            comeList.css("width","100%");
        }
    }else{
        butscr.css("bottom","");
        butvol.css("bottom","");
        if(comeList.css("display")=="none"){
            contCome.css("position","absolute");
            contCome.css("top",clipSlideBarTop+"px");
            contCome.css("height",hideCommentParam+"px");
            comeForm.css("position","absolute");
            comeForm.css("bottom","");
            comeForm.css("top",0);
            comeForm.css("height",hideCommentParam+"px");
            comeList.css("position","absolute");
            comeList.css("width","100%");
        }else{
            contCome.css("position","absolute");
            contCome.css("top",clipSlideBarTop+"px");
            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot-timepadbot)+"px");
            comeForm.css("position","absolute");
            comeForm.css("bottom","");
            comeForm.css("top",0);
            comeForm.css("height",hideCommentParam+"px");
            comeList.css("position","absolute");
            comeList.css("top","");
            comeList.css("bottom",0);
            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot-timepadbot)+"px");
            comeList.css("width","100%");
        }
    }
}
function unpopElement(){
//console.log("unpopElement");
    $(EXinfo).css("z-index","");
    $(EXside).css("transform","");
    $(EXchli).parent().css("z-index","");
    $(EXhead).css("visibility","")
      .css("opacity","")
    ;
    $(EXfoot).css("visibility","")
      .css("opacity","")
    ;
    if(!isSureReadComment){
      $(EXcome).css("transform","")
        .css("position","")
      ;
    }
//console.log("comevisiset unpopElement");
    comevisiset(false);
}
function popElement(){
//console.log("popElement");
    //マウスオーバーで各要素表示
    $(EXinfo).css("z-index",11);
    $(EXside).css("transform","translate(0,-50%)");
    $(EXchli).parent().css("z-index",11);
    $(EXhead).css("visibility","visible")
      .css("opacity",1)
    ;
    $(EXfoot).css("visibility","visible")
      .css("opacity",1)
    ;
    $(EXcome).css("transform","translateX(0px)")
      .css("position","absolute")
    ;
//console.log("comevisiset popElement");
    comevisiset(false);
}
function setEXs(){
    var b=true;
    if((EXmain=$('#main')[0])==null){b=false;}
    else if((EXhead=$('[class^="AppContainer__header-container___"]:first')[0])==null){b=false;}
    else if((EXfoot=$('[class^="TVContainer__footer-container___"]:first')[0])==null){b=false;console.log("foot");}
    else if((EXfootcome=$(EXfoot).contents().find('[class*="styles__right-container"]:first')[0])==null){b=false;console.log("footcome");}
    else if((EXfootcount=$(EXfoot).contents().find('[class*="styles__counter___"]'))==null){b=false;console.log("footcount");}
    else if((EXfootcountview=EXfootcount[0])==null){b=false;console.log("footcountview");}
    else if((EXfootcountcome=EXfootcount[1])==null){b=false;console.log("footcountcome");}
    else if((EXside=$('[class^="TVContainer__side___"]:first')[0])==null){b=false;console.log("side");}
    else if((EXchli=$('[class*="TVContainer__right-v-channel-list___"]:first')[0])==null){b=false;console.log("chli");}
    else if((EXinfo=$('[class^="TVContainer__right-slide___"]:first')[0])==null){b=false;console.log("info");}
    else if((EXcome=$('[class^="TVContainer__right-comment-area___"]:first')[0])==null){b=false;console.log("come");}
    else if((EXcomesend=$(EXcome).contents().find('[class*="styles__comment-form___"]:first')[0])==null){b=false;console.log("comesend");}
    else if((EXcomesendinp=$(EXcomesend).contents().find('textarea:first')[0])==null){b=false;console.log("comesendinp");}
//    else if((EXcomelist0=$($(EXcome).contents().find('[class^="styles__no-contents-text___"]:first')[0]).parent()[0])==null){b=false;console.log("comelist");}
    else if((EXvolume=$('[class^="styles__volume___"]:first')[0])==null){b=false;console.log("vol");}
    else if((EXobli=$('[class*="TVContainer__tv-container___"]:first')[0])==null){b=false;console.log("obli");}
    if(b==true){
console.log("setEXs ok");
        setEX2();
        setOptionHead();    //各オプションをhead内に記述
        setOptionElement(); //各オプションを要素に直接適用
        if(!eventAdded){
            setOptionEvent();   //各オプションによるイベントを作成
        }
    }else{
console.log("setEXs retry");
        setTimeout(setEXs,1000);
    }
}
function setEX2(){
    var b=true;
    if($(EXchli).children('[class*="styles__watch___"]:first').length==0){b=false;}
    else if((EXwatchingstr=$(EXchli).children('[class*="styles__watch___"]:first').contents().find('img').prop("alt"))==null){b=false;}
    else if((EXwatchingnum=$(EXobli).contents().find('img[alt='+EXwatchingstr+']').parents().index())==null){b=false;}
    else{
        $(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__watch___"]:first').index()*85-$(EXside).position().top);
    }
    if(b==true){
console.log("setEX2 ok");
    }else{
console.log("setEX2 retry");
        setTimeout(setEX2,1000);
    }
}
function isComeOpen(){
    return ($(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
}
function isSlideShown(){
    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
}
//function getComeId(inp){
//    return parseInt(/.*\$(\d+)$/.exec(EXcomelist.children[inp].getAttribute("data-reactid"))[1]);
//}
//function comesort(){
////  if(isComeOpen()&&(isInpWinBottom&&getComeId(EXcomelist.childElementCount-1)!=0)){
//    if(isComeOpen()&&isInpWinBottom){
////  console.log("dec sort");
//        for(var i=0;i<EXcomelist.childElementCount-1;i++){
//            if(getComeId(i)<getComeId(i+1)){
//                EXcomelist.insertBefore(EXcomelist.children[i+1],EXcomelist.firstChild);
//            }
//        }
////  }else if((isComeOpen()&&(!isInpWinBottom&&getComeId(EXcomelist.childElementCount-1)==0))||(!isComeOpen()&&getComeId(EXcomelist.childElementCount-1)==0)){
//    }else if(!isInpWinBottom||!isComeOpen()){
////  console.log("inc sort");
//        for(var i=EXcomelist.childElementCount-1;i>=1;i--){
//            if(getComeId(i-1)>getComeId(i)){
//                EXcomelist.insertBefore(EXcomelist.children[i-1],null);
//            }
//        }
//    }
//}
function otosageru(){
    if(!EXvolume){return;}
    var teka=document.createEvent("MouseEvents");
//    var teki=$('[class^="styles__slider-container___"]').children();
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]:first').children();
    var teku=teki.offset().top+106-Math.min(92,Math.max(0,Math.floor(92*changeMaxVolume/100)));
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku);
    setTimeout(otomouseup,100);
    return teki[0].dispatchEvent(teka);
}
function moVol(d){
    if(!EXvolume){return;}
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]:first').children();
    var teku=teki.offset().top+106;
    var teke=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]:first').css("height"));
    teke=(teke+d>91)?91:(teke+d<0)?0:(teke+d);
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku-teke);
    setTimeout(otomouseup,100);
    return teki[0].dispatchEvent(teka);
}
function otomouseup(){
    if(!EXvolume){return;}
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]:first').children();
    var teku=teki.offset().top+106;
    var teke=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]:first').css("height"));
    teka.initMouseEvent("mouseup",true,true,window,0,0,0,teki.offset().left+15,teku-teke);
    return teki[0].dispatchEvent(teka);
}
function otoColor(){
    var jo=$(EXvolume).contents().find('svg:first');
    if(jo.length==0){return;}
    if(jo.css("fill")=="rgb(255, 255, 255)"){
        jo.css("fill","red");
        setTimeout(otoColor,800);
    }else{
        jo.css("fill","");
    }
}
function otoSize(ts){
    var jo=$(EXvolume).contents().find('svg:first');
    if(jo.length==0){return;}
    if(jo.css("zoom")=="1"){
        jo.css("zoom",ts);
        setTimeout(otoSize,400);
    }else{
        jo.css("zoom","");
    }
}
function faintcheck2(retrycount,fcd){
    var pwaku = $('[class^="style__overlap___"]'); //動画枠
//  var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
    if(pwaku[0]&&EXfootcountcome){
        if(isNaN(parseInt($(EXfootcountcome).text()))){
            cmblockcd=fcd;
            return;
        }
    }
    if(retrycount>0){
        setTimeout(faintcheck2,150,retrycount-1,fcd);
    }
}
function faintcheck(fcd){
    if(fcd>0){
        faintcheck2(5,Math.max(1,fcd));
    }else if(fcd<0){
        faintcheck2(5,Math.min(-1,fcd));
    }
}
function comeColor(inp){
//console.log("comeColor:"+inp);
    if(!EXfootcountcome){return;}
//console.log($(EXfootcountcome).css("color"));
    if(inp==-1){
        $(EXfootcountcome).css("color","");
        $(EXfootcountcome).prev('svg').css("fill","");
    }else{
       var lim=[90,60,30];
       if(inp>lim[0]){
            $(EXfootcountcome).css("color","");
        }else if(inp>lim[1]){
            $(EXfootcountcome).css("color","rgb(255, 255, "+Math.round(255*(inp-lim[1])/(lim[0]-lim[1]))+")");
        }else if(inp>lim[2]){
            $(EXfootcountcome).css("color","rgb(255, "+Math.round(255*(inp-lim[2])/(lim[2]-lim[1]))+", 0)");
        }else{
            $(EXfootcountcome).css("color","rgb(255, 0, 0)");
        }
        $(EXfootcountcome).prev('svg').css("fill","black");
        setTimeout(comeColor,800,-1);
    }
}
function chkcomelist(retrycount){
    var comeListLen = EXcomelist.childElementCount;
//console.log("chkcomelist#"+retrycount+",comelistlen="+comeListLen);
    if(comeListLen<=100){
console.log("comeRefreshed "+commentNum+"->"+comeListLen);
        comeRefreshing=false;
        commentNum=comeListLen;
        comeHealth=Math.min(100,Math.max(0,commentNum));
        comeColor(comeHealth);
    }else if(retrycount>0){
        setTimeout(chkcomelist,10,retrycount-1);
    }
}
function waitforOpenCome(retrycount){
    if(isComeOpen()){
        chkcomelist(50);
    }else if(retrycount>0){
        setTimeout(waitforOpenCome,10,retrycount-1);
    }
}
function waitforOpenableCome(retrycount){
    if(!isSlideShown()&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){
//    if($(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){
        $(EXfootcome).trigger("click");
//console.log("comeopen waitforopenable");
        waitforOpenCome(50);
    }else if(retrycount>0){
        setTimeout(waitforOpenableCome,10,retrycount-1);
    }
}
function waitforCloseCome(retrycount){
    if(!isComeOpen()){
        waitforOpenableCome(50);
    }else if(retrycount>0){
        setTimeout(waitforCloseCome,10,retrycount-1);
    }
}
function fastRefreshing(){
    waitforCloseCome(100);
}
function createTime(sw){
//console.log("createTime:"+sw);
    if(!EXcome){return;}
    if(sw==0){
        if($("#forProEndBk").length==0){
            var eForProEndBk = document.createElement("span");
            eForProEndBk.id="forProEndBk";
            eForProEndBk.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;background-color:rgba(255,255,255,0.2);z-index:18;width:310px;top:0px;");
            eForProEndBk.innerHTML="&nbsp;";
            EXcome.insertBefore(eForProEndBk,EXcome.firstChild);
        }
        if($("#forProEndTxt").length==0){
           var eForProEndTxt = document.createElement("span");
            eForProEndTxt.id="forProEndTxt";
            eForProEndTxt.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:19;width:310px;background:rgba(255,255,255,0.1);border-left:1px solid rgba(255,255,255,0.4);top:0px;");
            eForProEndTxt.innerHTML="&nbsp;";
            EXcome.insertBefore(eForProEndTxt,EXcome.firstChild);
            //残り時間クリックで設定ウィンドウ開閉
            $("#forProEndTxt").on("click",function(){
               if($("#settcont").css("display")=="none"){
                    openOption(isInpWinBottom?3:2);
                }else{
                    closeOption();
                }
            });
        }
        setTimePosition();
    }else if(sw==1){
        var prehoverContents = $('[class*="styles__hover-contents___"]').prev();
        var parexfootcount=$(EXfootcount).parent();
        var forpros=$("#forProEndTxt,#forProEndBk");
        prehoverContents.css("padding-top","")
            .prev().css("padding-top","")
        ;
        parexfootcount.css("padding-bottom","");
        $(EXfootcome).next('#timerthird').remove();
        $("#forProEndBk,#forProEndTxt").remove();
    }
}
function setTimePosition(par){
    if(par===undefined){par=timePosition;}
    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
    var parexfootcount=$(EXfootcount).parent();
    var forpros=$("#forProEndTxt,#forProEndBk");
    switch(par){
        case "windowtop":
        case "commentinputtop":
        case "header":
            forpros.css("bottom","")
                .css("top",0)
            ;
            break;
        case "windowbottom":
        case "commentinputbottom":
        case "footer":
            forpros.css("top","")
                .css("bottom",0)
            ;
            break;
        default:
    }
    switch(par){
        case "windowtop":
        case "header":
            prehoverContents.css("padding-top","9px")
                .prev().css("padding-top","9px")
            ;
            break;
        case "commentinputtop":
        case "windowbottom":
        case "commentinputbottom":
        case "footer":
            prehoverContents.css("padding-top","")
                .prev().css("padding-top","")
            ;
            break;
        default:
    }
    switch(par){
        case "windowtop":
        case "commentinputtop":
        case "header":
        case "commentinputbottom":
            parexfootcount.css("padding-bottom","");
            $(EXfootcome).next('#timerthird').remove();
            break;
        case "windowbottom":
        case "footer":
            parexfootcount.css("padding-bottom","14px");
            if($(EXfootcome).next('#timerthird').length==0){
                $('<div id="timerthird" style="position:absolute;bottom:0;right:207px;height:15px;width:143px;color:white;font-size:x-small;letter-spacing:1px;padding:0px 5px;border-right:1px solid #444;"></div>').insertAfter(EXfootcome);
                $(EXfootcome).next('#timerthird').html('&nbsp;');
            }
            break;
        default:
    }
    switch(par){
        case "windowtop":
        case "windowbottom":
            $("#forProEndBk,#forProEndTxt").prependTo('body');
            break;
        case "commentinputtop":
        case "commentinputbottom":
            $("#forProEndBk,#forProEndTxt").prependTo(EXcomesend);
            break;
        case "header":
            $("#forProEndBk,#forProEndTxt").prependTo(EXhead);
        case "footer":
            $("#forProEndBk,#forProEndTxt").prependTo(EXfoot);
        default:
    }
}
function waitforhide(retrycount){
    if($(EXhead).css("visibility")=="hidden"){
//console.log("comevisiset waitforhide");
        comevisiset(false);
    }else if(retrycount>0){
        setTimeout(waitforhide,100,retrycount-1);
    }
}
function setOptionHead(){
    $('head:first>link[title="usermade"]').remove();
    var t="";
    //コメントのZ位置を上へ
    if(isMovingComment){
        t+='[class="movingComment"]{z-index:5;}';
    }
    //投稿ボタン削除（入力欄1行化はこの下のコメ見た目のほうとoptionElementでやる）
    if(isCustomPostWin){
        t+='[class^="styles__opened-textarea-wrapper___"]+div{display:none;}';
    }
    //コメント見た目
    var bc="rgba("+commentBackColor+","+commentBackColor+","+commentBackColor+","+(commentBackTrans/255)+")";
    var cc="rgba("+commentBackColor+","+commentBackColor+","+commentBackColor+","+(0.2)+")";
    var tc="rgba("+commentTextColor+","+commentTextColor+","+commentTextColor+","+(commentTextTrans/255)+")";
    var uc="rgba("+commentTextColor+","+commentTextColor+","+commentTextColor+","+(0.2)+")";
    var vc="rgba("+commentTextColor+","+commentTextColor+","+commentTextColor+","+(0.3)+")";
    t+='[class^="TVContainer__right-comment-area___"]{background-color:transparent;}';
    t+='[class^="TVContainer__right-comment-area___"]>*{background-color:transparent;}';
    t+='[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]{background-color:'+bc+';}';
    t+='[class^="TVContainer__right-comment-area___"] [class^="styles__opened-textarea-wrapper___"]{background-color:'+uc+';}';
    t+='[class^="TVContainer__right-comment-area___"] textarea{background-color:'+uc+';color:'+tc+';';
    if(isCustomPostWin){
        t+='height:18px!important;';
    }
    t+='}';
    t+='[class^="TVContainer__right-comment-area___"] textarea+*{background-color:'+cc+';color:'+tc+';';
    if(isCustomPostWin){
        t+='height:18px!important;';
    }
    t+='}';
    t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{background-color:'+bc+';color:'+tc+';';
    if(isCommentPadZero){
        t+='padding:0px 15px;';
    }
    if(isCommentTBorder){
        t+='border-top:1px solid '+vc+';';
    }
    t+='}';
    t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div>p[class^="styles__message__"]{color:'+tc+';}';
    //映像最大化
    if(isMovieMaximize||isSureReadComment){
        t+='[class*="TVContainer__tv-container___"]{width:100%;';
        if(isMovieMaximize){
            t+='height:100%;';
        }
        t+='}';
        t+='[class*="TVContainer__tv-container___"]>[class*="TVContainer__resize-screen___"]{';
        if(isMovieMaximize){
            t+='width:100%!important;height:100%!important;';
        }else if(isSureReadComment){
            t+='max-width:calc(100% - 310px);';
        }
        t+='}';
    }
    //コメ一覧の逆順・スクロールバー非表示
    if(isInpWinBottom||isHideOldComment){
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div{';
        if(isInpWinBottom){
            t+='display:flex;flex-direction:column-reverse;';
        }
        if(isHideOldComment){
            t+='overflow:hidden;';
        }else{
            t+='overflow-x:hidden;overflow-y:scroll;';
        }
        t+='}';
    }
    //ユーザースクリプトのngconfigのz-index変更
    t+='#NGConfig{z-index:20;}';
    $("<link title='usermade' rel='stylesheet' href='data:text/css," + encodeURI(t) + "'>").appendTo("head");
console.log("setOptionHead ok");
}
function setOptionElement(){
    if(!EXcomesendinp){
console.log("setOptionElement retry");
        setTimeout(setOptionElement,1000);
        return;
    }
    if(isCustomPostWin){
        $(EXcomesendinp).prop("wrap","soft");
    }else{
        $(EXcomesendinp).prop("wrap","");
    }
    if(isTimeVisible){
        createTime(0);
        setTimePosition();
    }else{
        createTime(1);
    }
    $(EXfootcome).css("pointer-events","auto");
console.log("setOptionElement ok");
}
function usereventMouseover(){
    //各要素を隠すまでのカウントをマウスオーバーで5にリセット
    if(forElementClose<4){
        forElementClose=5;
//console.log("popElement usereventMouseover");
        popElement(); //各要素を表示
    }
}
function usereventWakuclick(){
//console.log("wakuclick");
    if(bginfo[2]>=2||bginfo[3]==2){
        if(isCMBlack&&isCMBkR){screenBlackSet(setBlacked[0]?0:(isCMBkTrans?1:3));}
        if(isCMsoundoff&&isCMsoundR){soundSet(setBlacked[1]);}
        if(CMsmall<100&&isCMsmlR){movieZoomOut(setBlacked[2]?0:1);}
    }
}
function usereventVolMousemove(){
    if(!EXside){return;}
    $(EXside).css("transform","translate(50%,-50%)");
}
function usereventVolMouseout(){
    if(!EXside){return;}
    $(EXside).css("transform","translate(0px,-50%)");
}
//function usereventFCMouseout(){
function usereventFCMouseleave(){
//console.log("ueFCMouseleave");
    if(!EXfootcome){return;}
    $(EXfootcome).css("transition","")
        .css("background-color","")
    ;
//    $('body:first>#manualblockrd').remove();
    $('body:first>.manualblock').remove();
//    if($('body:first>.manualblock').length==0){
    $('body').css("overflow-y","");
//    }
    if(cmblockcd*100%100==63){
        bginfo[3]=2;
        cmblockcd=0;
        startCM();
    }else if(cmblockcd*100%100==-63){
        cmblockcd=0;
        bginfo[3]=0;
        endCM();
    }
}
function finishFCbgColored(){
    if(cmblockcd>0){
        cmblockcd=299.63;
    }else if(cmblockcd<0){
        cmblockcd=-299.63;
    }
    $(EXfootcome).css("transition","")
        .css("background-color","")
    ;
    if($('body:first>#manualblockrd').length==0){
        $('body').css("overflow-y","hidden");
        $('<div id="manualblockrd" class="manualblock"></div>').appendTo('body');
        $('body:first>#manualblockrd').html('&nbsp;')
            .css("position","absolute")
            .css("height","5px")
            .css("width","5px")
            .css("bottom",0)
            .css("right",0)
            .css("background-color","magenta")
            .css("z-index",20)
        ;
    }
}
function isFCbgColored(){
    if(Math.abs(cmblockcd*100%100)==63){return true;}
    if(!EXfootcome){return false;}
    var re=/^rgba?\( *(\d+) *, *(\d+) *, *(\d+) *(?:, *(\d+) *)?\)$/;
    var tar=$(EXfootcome).css("background-color");
    if(re.test(tar)){
        var rex=re.exec(tar);
        if(parseInt(rex[1])==255&&parseInt(rex[2])==0&&parseInt(rex[3])==255&&((rex[4]===undefined)||rex[4]==1)){
            return true;
        }else{return false;}
    }else{return false;}
}
function chkFCbgc(retrycount){
    if(isFCbgColored()){
        finishFCbgColored();
    }else if(retrycount>0){
        setTimeout(chkFCbgc,100,retrycount-1);
    }
}
function usereventFCMousemove(){
//console.log("ueFCMousemove");
    if(!EXfootcome||!isManualMouseBR){return;}
    if(cmblockcd!=0&&Math.abs(cmblockcd*100%100)!=63){
        if($(EXfootcome).css("transition")!="background-color 1.2s linear 0s"){
            $(EXfootcome).css("transition","background-color 1.2s linear 0s")
                .css("background-color","rgb(255, 0, 255)")
            ;
            setTimeout(chkFCbgc,1200,5);
        }
        if(isFCbgColored()){
            finishFCbgColored();
        }
    }else{
        $(EXfootcome).css("transition","")
            .css("background-color","")
        ;
    }
}
function setOptionEvent(){
//自作要素のイベントは自作部分で対応
    if(eventAdded){return;}
    var butfs;
    var pwaku;
    if(((butfs=$('button[class*="styles__full-screen___"]:first')[0])==null)||((pwaku=$('[class^="style__overlap___"]:first')[0])==null)||!EXcome){
console.log("setOptionEvent retry");
        setTimeout(setOptionEvent,1000);
        return;
    }
    eventAdded=true;
    //ダブルクリックでフルスクリーン
    $(window).on("dblclick",function(){
console.log("dblclick");
        if(settings.isDblFullscreen){
            toggleFullscreen();
        }
    });
    //コメ常時表示のときは画面クリックした後に開こうとする
    $(window).on("click",function(){
//console.log("windowclick");
        if(isSureReadComment){
            comeclickcd=2;
        }
    });
    //マウスホイール無効か音量操作
    window.addEventListener("mousewheel",function(e){
        if (isVolumeWheel&&e.target.className.indexOf("style__overlap___") != -1){//イベントが映像上なら
            if(EXvolume&&$(EXvolume).contents().find('svg:first').css("zoom")=="1"){
                otoSize(e.wheelDelta<0?0.8:1.2);
            }
            moVol(e.wheelDelta<0?-5:5);
        }
        if (isCancelWheel||isVolumeWheel){ //設定ウィンドウ反映用
            e.stopImmediatePropagation();
        }
    },true);
    //フルスクリーンボタンの割り当て変更
    butfs.addEventListener("click", function(e){
        if (settings.isDblFullscreen) {
            toggleFullscreen();
            e.stopImmediatePropagation();
        }
    });
    //右下にコメント一覧表示切替を設置
    $(EXfootcome).on("click",function(){
//        if($(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length>0){
        if(isComeOpen()){
//console.log("toggleCommentList EXfootcomeclick");
            toggleCommentList();
        }
    });
    //コメント一覧の表示切替
    $(EXcomesend).on("click",function(e){
        if(e.target.tagName.toLowerCase()=='form'){
//console.log("toggleCommentList EXcomesendclick");
            toggleCommentList();
        }
    });
    //入力欄のすぐ周りのクリックは何もしない
    $(EXcomesendinp).parent().on("click",function(e){
        if(e.target.tagName.toLowerCase()=='div'){
            e.stopPropagation();
        }
    });
    window.addEventListener("mousemove",usereventMouseover,true);
    pwaku.addEventListener("click",usereventWakuclick,false);
    $(EXvolume).on("mousemove",usereventVolMousemove);
    $(EXvolume).on("mouseout",usereventVolMouseout);
    window.addEventListener("keydown",function(e){
        if(e.keyCode==38||e.keyCode==40){ //38^ 40v
            if(isCancelWheel||isVolumeWheel){
                e.stopPropagation();
            }
        }else if(e.keyCode==17&&((e.location==1&&isManualKeyCtrlL)||(e.location==2&&isManualKeyCtrlR))){ //17ctrl
            if(cmblockcd!=0){
                if(cmblockcd>0){
                    cmblockcd=1.73;
                }else if(cmblockcd<0){
                    cmblockcd=-1.73;
                }
                var posi="";
                if(e.location==1&&isManualKeyCtrlL){
                    posi="left";
                }else if(e.location==2&&isManualKeyCtrlR){
                    posi="right";
                }
                if(posi!=""&&$('body:first>#manualblock'+posi).length==0){
                    $('body').css("overflow-y","hidden");
                    $('<div id="manualblock'+posi+'" class="manualblock"></div>').appendTo('body');
                    $('body:first>#manualblock'+posi).html('&nbsp;')
                        .css("position","absolute")
                        .css("height","5px")
                        .css("width","5px")
                        .css("bottom",0)
                        .css(posi,0)
                        .css("background-color","magenta")
                        .css("z-index",20)
                    ;
                }
            }
        }
    },true);
    window.addEventListener("keyup",function(e){
        keyinput.push(e.keyCode);
        if (keyinput.toString().indexOf(keyCodes) == 0) {
            $("#CommentMukouSettings").show();
            keyinput = [];
        }else{
            while(keyinput.length>0&&keyCodes.indexOf(keyinput.toString())!=0){
                if(keyinput.length>1){
                    keyinput.shift();
                }else{
                    keyinput=[];
                }
            }
        }
        if(e.keyCode==17&&((e.location==1&&isManualKeyCtrlL)||(e.location==2&&isManualKeyCtrlR))){
            if(cmblockcd==0){
            }else if(cmblockcd*100%100==73){
                bginfo[3]=2;
                cmblockcd=0;
                startCM();
            }else if(cmblockcd*100%100==-73){
                bginfo[3]=0;
                cmblockcd=0;
                endCM();
            }
//            var posi="";
//            if(e.location==1&&isManualKeyCtrlL){
//                posi="left";
//            }else if(e.location==2&&isManualKeyCtrlR){
//                posi="right";
//            }
//            $('body:first>#manualblock'+posi).remove();
            $('body:first>.manualblock').remove();
//            if($('body:first>.manualblock').length==0){
            $('body').css("overflow-y","");
//            }
        }
    },true);
    $(EXfootcome).on("mousemove",usereventFCMousemove);
//    $(EXfootcome).on("mouseout",usereventFCMouseout);
    $(EXfootcome).on("mouseleave",usereventFCMouseleave);
console.log("setOptionEvent ok");
}
function startCM(){
console.log("startCM");
    if(isCMBlack){screenBlackSet(isCMBkTrans?1:3);}
    if(isCMsoundoff){soundSet(false);}
    if(CMsmall<100){movieZoomOut(1);}
}
function endCM(){
console.log("endCM");
    if(bginfo[1].length!=0){return;}
    if(isCMBlack){screenBlackSet(0);}
    if(isCMsoundoff){soundSet(true);}
    if(CMsmall<100){movieZoomOut(0);}
}
function tryCM(){
    if(bginfo[1].length!=0){return;}
    bginfo[2]=0;
    if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
        $(EXfootcome).next('#timerthird').html('&nbsp;');
    }
    if(cmblockcd*100%10!=-3){
        cmblockcd=0;
        endCM();
    }
}
$(window).on('load', function () {
    console.log("loaded");
    var csspath = chrome.extension.getURL("onairpage.css");
    $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
    // jqueryを開発者コンソールから使う
    var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
    $("<script src='"+jquerypath+"'></script>").appendTo("head");
    //URLパターンチェック
    checkUrlPattern(location.href);
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
    //要素チェック
    setEXs();
    delayset();

    setInterval(function () {
        // 1秒ごとに実行
        var btn = $('[class^="TVContainer__right-comment-area___"] [class^="styles__continue-btn___"]'); //新着コメのボタン
        if (btn.length>0) {
            //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
            btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
        }
        //映像のtopが変更したらonresize()実行
        if(settings.isResizeScreen && $("object").parent().offset().top !== newtop) {
            onresize();
        }
        //黒帯パネル表示のためマウスを動かすイベント発火
        if (settings.isAlwaysShowPanel) {
            triggerMouseMoving();
            if(!isSureReadComment){
                popHeader();
            }
        }
        //音量が最大なら設定値へ自動変更
        if(changeMaxVolume<100&&$('[class^="styles__highlighter___"]').css("height")=="92px"){
            if($(EXvolume).contents().find('svg:first').css("fill")=="rgb(255, 255, 255)"){
                otoColor();
            }
            otosageru();
        }
        //コメント取得
        var comments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
        if(EXcomelist&&isComeOpen()){
            var comeListLen = EXcomelist.childElementCount;
            if(comeListLen>commentNum){ //コメ増加あり
//                if(!comeRefreshing||!isSureReadComment){
                if(!comeRefreshing){ //isSureReadCommentの判定が必要な理由を失念。
                    if(isMovingComment&&commentNum>0){
                        for(var i=Math.min(movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
                            putComment(comments[i].innerHTML);
                        }
                    }
                }else{
                    comeRefreshing=false;
                }
                if(commentNum==0){
                    comeHealth=Math.min(100,Math.max(0,comeListLen));
                    comeColor(comeHealth);
                }
                commentNum=comeListLen;
                if(isSureReadComment&&commentNum>Math.max(comeHealth+20,sureReadRefreshx)&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){ //右下ボタンが押下可能設定のとき
                    comeRefreshing=true;
//                    commentNum=0;
                    $('[class^="style__overlap___"]:first').trigger("click");
                    fastRefreshing();
                }
            }else if(comeListLen<commentNum){
                commentNum=0;
                comeHealth=100;
            }
        }
            
        //流れるコメントのうち画面外に出たものを削除
        var arMovingComment = $('[class="movingComment"]');
        if(arMovingComment.length>0){
            for (var j = arMovingComment.length-1;j>=0;j--){
                if(arMovingComment.eq(j).offset().left + arMovingComment.eq(j).width()<0){
                    arMovingComment[j].remove();
                }
            }
        }
        //流れるコメント過多の場合は消していく
        if (isMovingComment){
            var comments = $(".movingComment");
            if (comments.length > movingCommentLimit){
                for (var j=0;j < comments.length-movingCommentLimit; j+=1){
                    comments[j].remove();
                }
            }
        }

        var countElements = $('[class^="TVContainer__footer___"] [class*="styles__count___"]');
        //var viewCount = countElements[0].innerHTML
        //var commentCount = countElements[1].innerHTML
        //コメント数無効の時画面真っ黒
        var faintchecked=false;
        if (isCMBlack) {
            var pwaku = $('[class^="style__overlap___"]'); //動画枠
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if(pwaku[0]&&come[1]){
                //切替時のみ動作
                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
                    if(cmblockcd<=0){
                      cmblockcd=cmblockia;
                    }
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
                    if(!faintchecked){
                      faintchecked=true;
                      faintcheck(cmblockcd);
                    }
                    cmblockcd=cmblockib;
                }
            }
        }

        //コメント数無効の時音量ミュート
        if (isCMsoundoff){
            var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]'); //高さが音量のやつ
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if (valvol[0]&&come[1]){
                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
                    if(cmblockcd<=0){
                      cmblockcd=cmblockia;
                    }
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
                    if(!faintchecked){
                      faintchecked=true;
                      faintcheck(cmblockcd);
                    }
                    cmblockcd=cmblockib;
                }
            }
        }
        if(cmblockcd!=0){
            if(cmblockcd>0){
                cmblockcd-=1;
                if(cmblockcd<=0){
                    bginfo[3]=2;
                    cmblockcd=0;
                    startCM();
                }
            }else{
                cmblockcd+=1;
                if(cmblockcd>=0){
                    cmblockcd=0;
                    bginfo[3]=0;
                    endCM();
                }
            }
        }

//        var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
//        if(come[1]){
//            if(isNaN(parseInt(come[1].innerHTML))){
//                comeLatestCount=-1;
//            }else{
//                comeLatestCount=parseInt(come[1].innerHTML);
//            }
//        }else{
//            comeLatestCount=-1;
//        }
        if(isNaN(parseInt($(EXfootcountcome).text()))){
            comeLatestCount=-1;
        }else{
            comeLatestCount=parseInt($(EXfootcountcome).text());
        }

        //残り時間表示
        if (isTimeVisible){
            var eProTime = $('[class^="TVContainer__right-slide___"] [class^="styles__time___"]');
            var reProTime = /(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*\~[　 ]*(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var arProTime;
            if(eProTime[0]&&(arProTime=reProTime.exec(eProTime[0].textContent))!=null){
                //番組開始時刻を設定
                if(arProTime[1]&&1<=parseInt(arProTime[1])&&parseInt(arProTime[1])<=12){
                    proStart.setMonth(parseInt(arProTime[1])-1);
                }
                if(arProTime[2]&&1<=parseInt(arProTime[2])&&parseInt(arProTime[2])<=31){
                    proStart.setDate(parseInt(arProTime[2]));
                }
                if(arProTime[3]&&0<=parseInt(arProTime[3])&&parseInt(arProTime[3])<=47){
                    if(parseInt(arProTime[3])<24){
                        proStart.setHours(parseInt(arProTime[3]));
                    }else{
                        proStart.setHours(parseInt(arProTime[3])-24);
                        proStart = new Date(proStart.getTime()+24*60*60*1000);
                    }
                }
                if(arProTime[4]&&0<=parseInt(arProTime[4])&&parseInt(arProTime[4])<=59){
                    proStart.setMinutes(parseInt(arProTime[4]));
                }
                proStart.setSeconds(0);
                //番組終了時刻を設定
                if(arProTime[5]&&1<=parseInt(arProTime[5])&&parseInt(arProTime[5])<=12){
                    proEnd.setMonth(parseInt(arProTime[5])-1);
                }
                if(arProTime[6]&&1<=parseInt(arProTime[6])&&parseInt(arProTime[6])<=31){
                    proEnd.setDate(parseInt(arProTime[6]));
                }
                if(arProTime[7]&&0<=parseInt(arProTime[7])&&parseInt(arProTime[7])<=47){
                    if(parseInt(arProTime[7])<24){
                        proEnd.setHours(parseInt(arProTime[7]));
                    }else{
                        proEnd.setHours(parseInt(arProTime[7])-24);
                        proEnd = new Date(proEnd.getTime()+24*60*60*1000);
                    }
                }
                if(arProTime[8]&&0<=parseInt(arProTime[8])&&parseInt(arProTime[8])<=59){
                    proEnd.setMinutes(parseInt(arProTime[8]));
                }
                proEnd.setSeconds(0);
            }
            var forProEnd = proEnd.getTime() - Date.now(); //番組の残り時間
            var proLength = proEnd.getTime() - proStart.getTime(); //番組の全体長さ
            var strProEnd = Math.floor(forProEnd/1000);
            if(forProEnd>0){
                strProEnd = (("0"+Math.floor(forProEnd/3600000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%3600000)/60000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%60000)/1000)).slice(-2)).replace(/^00?( : )?0?0?( : )?0?/,"");
            }
            $("#forProEndTxt").html(strProEnd);
            $("#forProEndBk").css("width",((forProEnd>0)?Math.floor(310*forProEnd/proLength):310)+"px");
        }
        //コメント欄を常時表示
        if(isSureReadComment){
            //右下をクリックできそうならクリック
            if($(EXfoot).siblings('[class*="TVContainer__right-slide--shown___"]').length==0&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){
                if(comeclickcd>0){
                    comeclickcd-=1;
                    if(comeclickcd<=0){
                        $(EXfootcome).trigger("click");
                    }
                }
            }
        }
        //各要素を隠すまでのカウントダウン
        if(forElementClose>0){
            forElementClose-=1;
            if(forElementClose<=0){
                //各要素を隠す
                $(EXside).css("transform","");
                $(EXhead).css("visibility","")
                  .css("opacity","")
                ;
                $(EXfoot).css("visibility","")
                  .css("opacity","")
                ;
                waitforhide(10);
            }
        }

        //コメント位置のTTLを減らす
        for(var i=0;i<comeLatestLen;i++){
            if(comeLatestPosi[i][1]>0){
                comeLatestPosi[i][1]-=1;
                if(comeLatestPosi[i][1]<=0){
                    comeLatestPosi[i][0]=0;
                }
            }
        }

        //一時設定画面の情報更新
        if($('body:first>#settcont').css("display")!="none"){
            optionStatsUpdate(false);
        }

    }, 1000);

    setTimeout(onresize,5000);
});
$(window).on("resize", onresize);

/*window.addEventListener('popstate', function () { //URLが変化したとき(チャンネルを変えたとき)
    console.log("onpopstate")
    setTimeout(onresize, 1000);
});*/
//↑なぜかpopstateイベントが発火しないので代わりに↓
setInterval(chkurl,2000);
function chkurl() {
    if (currentLocation != window.location.href) {
        console.log("url changed");
        setTimeout(onresize, 1000);
        commentNum = 0;
        currentLocation = window.location.href;
        $(".movingComment").remove();
        setEX2();
        setOptionElement();
        delayset();
        comeclickcd=2;
        checkUrlPattern(currentLocation);
    }
}
//onloadからも呼ばれる
function checkUrlPattern(url){
    console.log("cup", url)
    if (url.match(/https:\/\/abema.tv\/channels\/[-a-z0-9]+\/slots\/[a-zA-Z]+/)) {
        //番組個別ページ
        putNotifyButton(url);
    }
}

//通知機能
function putNotifyButton(url){
    if($('[class*="BroadcastingFrameContainer__program-heading___"] [class*="styles__time___"]').text()==""){setTimeout(function(){putNotifyButton(url)},1000);console.log("putNotifyButton wait");return;}
    var urlarray = url.substring(17).split("/");
    var channel = urlarray[1];
    var channelName = channel;//目標はチャンネル名取得
    var programID = urlarray[3];
    var programTitle = $('[class*="BroadcastingFrameContainer__program-heading___"] [class*="styles__heading___"]').text();
    var programTimeStr = $('[class*="BroadcastingFrameContainer__program-heading___"] [class*="styles__time___"]').text();
    console.log(programTimeStr, urlarray)
    var programTimeArray = programTimeStr.match(/(\d+)月(\d+)日（.+）(\d+):(\d+)/);
    var programTime = new Date();
    var now = new Date();
    programTime.setMonth(parseInt(programTimeArray[1])-1);
    programTime.setDate(parseInt(programTimeArray[2]));
    programTime.setHours(parseInt(programTimeArray[3]));
    programTime.setMinutes(parseInt(programTimeArray[4]));
    programTime.setSeconds(0);
    if (now.getMonth === 11 && programTime.getMonth === 0) {programTime.setFullYear(now.getFullYear+1);} //現在12月なら1月は来年とする
    //console.log(programTime)
    var notifyTime = programTime - notifySeconds*1000;
    if (notifyTime > now){
        var progNotifyName = "progNotify_"+channel+"_"+programID;
        var notifyButton = $('<input type="button" id="addNotify">');
        notifyButton.appendTo('[class*="BroadcastingFrameContainer__program-heading___"] [class*="styles__checkbox-button-area___"]');
        chrome.storage.local.get(progNotifyName, function(notifyData) {
            //console.log(notifyData,progNotifyName)
           if(!notifyData[progNotifyName]){
               //未登録
               notifyButton.val("拡張機能の通知登録").click(function() {
                   var request = {
                       type:"addProgramNotifyAlarm",
                       channel: channel,
                       channelName: channelName,
                       programID: programID,
                       programTitle: programTitle,
                       programTime: programTime-0,//dateを数字に
                       notifyTime: notifyTime
                   };
                   chrome.runtime.sendMessage(request, function(response) {
                       if(response.result==="added"){
                           toast("通知登録しました<br>番組開始" + notifySeconds + "秒前にポップアップで通知します。設定されていた場合は自動で放送画面を開きます。通知設定やChromeが立ち上がってないなどにより通知されない場合があります。Chromeが起動していればAbemaTVを開いてなくても通知されます。");
                           notifyButton.remove();
                           putNotifyButton(url);
                       }else if(response.result==="notificationDined"){
                           toast("拡張機能からの通知が拒否されているので通知できません")
                       }else if(response.result==="pastTimeError"){
                           toast("既に開始された番組です")
                       }
                   })
               });
           } else {
               //登録済み
               notifyButton.val("拡張機能の通知登録解除").click(function(){
                   chrome.runtime.sendMessage({type: "removeProgramNotifyAlarm", progNotifyName: progNotifyName}, function(response) {
                       if(response.result==="removed"){
                           toast("通知解除しました");
                           notifyButton.remove();
                           putNotifyButton(url);
                       }
                   });
               });
           }
        });
    }
}

chrome.runtime.onMessage.addListener(function(r){
//console.log(r);
    if(r.name!="bgsend"){return;}
    if(r.type==0){
//console.log("ts,"+r.value+"p");
        bginfo[0]=r.value;
        if(bginfo[2]!=0){
            if(bginfo[2]==-1){
//console.log("tryCM bginfo[2]= -1");
                setTimeout(tryCM,500);
            }
            if(bginfo[1].length>0&&bginfo[1][2]-bginfo[1][1]>5){
//console.log("bginfo[2]= "+bginfo[2]+" -> 3");
                bginfo[2]=3;
                if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
                    $(EXfootcome).next('#timerthird').text('CM>');
                }
            }
        }else{
            if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
                $(EXfootcome).next('#timerthird').html('&nbsp;');
            }
        }
    }else if(r.type==1){
//console.log("nowcm#"+r.value[0]+","+r.value[1]+"/"+r.value[2]);
        if(r.value[1]<r.value[2]){
            var b=false;
            if(bginfo[1].length==0){
                b=true;
            }else{
                if(r.value[0]==bginfo[1][0]&&r.value[1]>bginfo[1][1]){
                    b=true;
                }else if(r.value[0]>bginfo[1][0]){
                    b=true;
                }
            }
            if(b){
                bginfo[1]=[r.value[0],r.value[1],r.value[2]];
            }
            if(bginfo[2]<=1){
//console.log("bginfo[2]= "+bginfo[2]+" -> 2");
                bginfo[2]=2;
                if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
                    $(EXfootcome).next('#timerthird').text('CM');
                }
                if(cmblockcd*100%10!=3){
                    cmblockcd=0;
                    startCM();
                }
            }
        }else if(r.value[1]==r.value[2]){
            if(bginfo[1].length>0&&r.value[0]==bginfo[1][0]){
                bginfo[1]=[];
            }
            if(bginfo[1].length==0){
                if(bginfo[2]==3){
//console.log("bginfo[2]= 3 -> 0");
                    bginfo[2]=0;
                    if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
                        $(EXfootcome).next('#timerthird').html('&nbsp;');
                    }
                    if(cmblockcd*100%10!=-3){
                        cmblockcd=0;
                        endCM();
                    }
                }else{
//console.log("tryCM bginfo[2]= "+bginfo[2]);
                    setTimeout(tryCM,500);
                }
            }
        }
    }else if(r.type==2){
//console.log("precm");
        if(bginfo[1].length==0){
//console.log("bginfo[2]= "+bginfo[2]+" -> 1");
            bginfo[2]=1;
            if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
                $(EXfootcome).next('#timerthird').text('>CM');
            }
        }
    }
});
