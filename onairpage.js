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
var isTabSoundplay=false; //タブ設定によるミュート切替
var isOpenPanelwCome=true; //コメント欄を開いてる時にもマウスオーバーで各要素を表示する
var isProtitleVisible=false; //番組名を画面右の情報枠から取得して表示する
var protitlePosition="windowtopleft"; //番組名の表示位置
var proSamePosition="over"; //番組名と残り時間の位置が重なった場合の対処方法
var isCommentWide=true;
var isProTextLarge=true;

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
        isTabSoundplay = value.tabSoundplay || false;
        isOpenPanelwCome=value.openPanelwCome||false;
        isProtitleVisible=value.protitleVisible||false;
        protitlePosition=value.protitlePosition||protitlePosition;
        proSamePosition=value.proSamePosition||proSamePosition;
        isCommentWide=value.commentWide||false;
        isProTextLarge=value.proTextLarge||false;
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
//var playtick=0;
var comeLatestCount=0; //画面右下で取得するコメント数
var arFullNg=[];
//var retrytick=[1000,3000,6000,12000,18000];
//var retrycount=0;
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
//var proEnd = new Date(Date.now()+60*60*1000); //番組終了として現在時刻から1時間後を仮設定
var proEnd = new Date(); //↑で23時～24時の間に実行すると終了時刻が1日ずれるので現時刻にした
var forElementClose = 5; //コメント表示中でも各要素を表示させた時に自動で隠す場合のカウントダウン
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
var bginfo=[0,[],-1,-1]; //ソースの縦長さなど主にwebrequestメッセージ入れ
var eventAdded=false; //各イベントを1回だけ作成する用
var setBlacked=[false,false,false]; //soundsetなどのスイッチ
var keyinput = []; //コマンド入れ
var keyCodes = "38,38,40,40,37,39,37,39,66,65";
var comeArray=[]; //流すコメントで、新着の複数コメントのうちNG処理等を経て実際に出力するコメントのリスト
var popElemented=false; //mouseoverでunpopElementが実行されまくるのを防止
var proTitle="未取得"; //番組タイトル
var proinfoOpened=false; //番組タイトルクリックで番組情報枠を開いた後にクリックで閉じれるようにする

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
    var strface1 = "[　 ]*[Σ<＜‹૮＋\\+\\*＊･゜ﾟ:\\.｡\\'☆〜～ｗﾍ√ﾚｖꉂ꒰·‧º∑]*[　 ]*[┌└┐⊂二乁＼ヾヽつっdｄo_ƪ\\\\╭╰m👆ฅｍ\╲٩Ｏ∩┗┏]*[　 ]*[（\\(《〈\\[\\|｜fζᔦ]+.*[8oO∀дД□◯▽△＿ڼ ౪艸^_⌣зεωm௰ｍ꒳ｰワヮ－U◇。｡࿄ш﹏㉨ꇴㅂ\\-ᴗ‿˘﹃_ﾛ◁ฅ∇益言人ㅅＡAΔΘ罒ᗜ◒◊vਊ⍛ー3xエェｪｴρｐё灬]+.*";
    var strface2 = "[）\\)》〉\\]\\|｜ᔨ]";
    var strface3 = "[　 ]*[┐┘┌┸┓／シノ厂\\/ｼﾉ۶つっbｂoა_╮╯mｍو👎☝」Ｏσ二⊃ゝʃง╭☞∩ゞ┛︎]";
    var strface4 = "[　 ]*[彡°ﾟ\\+・･⚡\\*＋＊ﾞ゜:\\.｡\\' ̑̑🌾💢ฅ≡<＜>＞ｗﾍ√ﾚｖ꒱‧º·]*[　 ]*";
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
    ngedcome = ngedcome.replace(/[！\!‼️❗❗️]+/g,"！");
    ngedcome = ngedcome.replace(/[○●]+/g,"○");
    ngedcome = ngedcome.replace(/[͜͜͏̘̣͔͙͎͎̘̜̫̗͍͚͓]+/g,"");
    ngedcome = ngedcome.replace(/[ด็้]+/g,"");
    ngedcome = ngedcome.replace(/(.)\1{3,}/g,"$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1{3,}/,"$1$1$1");
    ngedcome = ngedcome.replace(/(...*?)\1*(...*?)(\1|\2){2,}/g,"$1$2");
    return ngedcome;
}
function putComeArray(inp){
// inp[i]=[ commentText , commentTop , leftOffset ]
    var mci=$('#moveContainer');
    var mcj=mci.children('.movingComment');
    var mclen=mcj.length;
    var inplen=inp.length;
    var comeoverflowlen=inplen+mclen-movingCommentLimit;
    //あふれる分を削除
    if(comeoverflowlen>0){
        mcj.slice(0,comeoverflowlen).remove();
//        mclen-=comeoverflowlen;
    }
    var winwidth=window.innerWidth;
    var outxt='';
    for(var i=0;i<inplen;i++){
        outxt+='<span class="movingComment" style="position:absolute;top:'+inp[i][1]+'px;left:'+(inp[i][2]+winwidth)+'px;">'+inp[i][0]+'</span>';
    }
    $(outxt).appendTo(mci);
//    mclen+=inplen;
    mcj=mci.children('.movingComment');
    mclen=mcj.length;
    for(var i=0;i<inplen;i++){
        var mck=mcj.eq(-inplen+i);
        var mcwidth=mck.width();
        var mcleft=inp[i][2]+winwidth;
        //コメント長さによって流れる速度が違いすぎるのでlogを速度計算部分に適用することで差を減らす
        //長いコメントは遅くなるので設定値より少し時間がかかる
        var mcfixedwidth=mcwidth<237?mcwidth:100*Math.floor(Math.log(mcwidth));

        //コメント設置位置の更新
        //コメント右端が画面右端に出てくるまでの時間を保持する
        var r=settings.movingCommentSecond*(mcleft+mcwidth-winwidth)/(winwidth+mcfixedwidth);
        for(var j=comeLatestPosi.length-1;j>=0;j--){
            if(comeLatestPosi[j][1]>comeTTLmax&&comeLatestPosi[j][0]==inp[i][1]){
                comeLatestPosi[j][1]=Math.min(comeTTLmax,Math.max(comeTTLmin,1+Math.ceil(r)));
                break;
            }
        }

        var waitsec=settings.movingCommentSecond*(mcleft+mcwidth)/(winwidth+mcfixedwidth);
        setTimeout(function(jo,w,l){
            jo.css("transition","left "+w+"s linear")
                .css("left",l+"px")
            ;
        },0,mck,waitsec,(-mcwidth-2));
    }
}
function putComment(commentText,index,inmax) {
    var outflg=false;
    if(index==0){
        comeArray=[];
    }
    if(index==inmax-1){
        outflg=true;
    }
    if (isComeDel) {
        //arFullNgがマッチしたコメントは流さない
        for(var ngi=0;ngi<arFullNg.length;ngi++){
            if(commentText.match(arFullNg[ngi])){
                console.log("userNG matched text:" + commentText  + "ngword:" + arFullNg[ngi].toString())
//                return "";
                commentText="";
                break;
            }
        }
    }
    if (isComeNg) {
        commentText = comeNG(commentText);
    }
    var commentTop = Math.floor(Math.random()*(window.innerHeight-200))+50;
    if(commentText.length>0){
        i=0;
        var k=false;
        while(i<20){
            k=false;
            for(var j=0;j<comeLatestLen;j++){
                if(Math.abs(commentTop-comeLatestPosi[j][0])<48){ //xx-large
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
    var maxLeftOffset = window.innerWidth*5 / settings.movingCommentSecond; //5秒の移動長さ

//    if (isMoveByCSS) {
//        var leftOffset = maxLeftOffset - Math.floor(Math.random()*maxLeftOffset);
//        var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+(window.innerWidth+leftOffset)+"px;twidth:"+window.innerWidth+"px;'>" + commentText + "</div>").appendTo("#moveContainer");
    var leftOffset = Math.floor(maxLeftOffset*index/inmax);
    if(commentText.length>0){
        comeArray.push([commentText,commentTop,leftOffset]);
    }
    if(outflg&&comeArray.length>0){
        setTimeout(putComeArray,50,comeArray);
    }
//        setTimeout(function(){
//            commentElement.css("transition", "left "+settings.movingCommentSecond*(1+maxLeftOffset/window.innerWidth)+"s linear");
//            commentElement.css("left", -(commentElement.width()+maxLeftOffset-leftOffset) + "px");
//        },0);
//    } else {
//        var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+(Math.floor(window.innerWidth-$("#moveContainer").offset().left+Math.random()*maxLeftOffset))+"px;'>" + commentText + "</div>").appendTo("#moveContainer");
//    }
    //コメント設置位置の保持
//    comeLatestPosi.push([commentTop,Math.min(comeTTLmax,Math.max(comeTTLmin,Math.floor((commentElement.width()+maxLeftOffset)*settings.movingCommentSecond/window.innerWidth+2)))]);
//この時点では要素長さが未確定なので暫定的に異常値を入力してputComeArray側で拾う
    comeLatestPosi.push([commentTop,comeTTLmax+2]);
    comeLatestPosi.shift();
//    if(parseInt($("#moveContainer").css("left"))>=1 && !isMoveByCSS){ //初期位置にいたら動かす
//        StartMoveComment();
//    }
}
//function StartMoveComment(){
//    if($('body>#moveContainer').children('.movingComment').length>0){
//        $('body>#moveContainer').animate({"left":"-="+Math.floor(window.innerWidth/settings.movingCommentSecond)+"px"},{duration:1000,easing:"linear",complete:StartMoveComment});
//    }else{
//        $('body>#moveContainer').css("left","1px");
//    }
//}
//ミュート(false)・ミュート解除(true)する関数
function soundSet(isSound) {
//isSound=true:音を出す
    if(isTabSoundplay){
        setBlacked[1]=!isSound;
        chrome.runtime.sendMessage({type:"tabsoundplaystop",valb:!isSound},function(r){});
        return;
    }
    if(!EXvolume){return;}
    var volcon=$(EXvolume).contents();
    var butvol=volcon.find('svg')[0];
    var valvol=volcon.find('[class^="styles__highlighter___"]').height();
    var evt=document.createEvent("MouseEvents");
    evt.initEvent("click",true,true);
//    valvol=parseInt(valvol[0].style.height);
    if (isSound) {
        //ミュート解除
        //音量0ならボタンを押す
        if(valvol==0){
            setBlacked[1]=false;
            butvol.dispatchEvent(evt);
        }
    } else {
        //ミュート
        //音量0でないならボタンを押す
        if(valvol!=0){
            setBlacked[1]=true;
            butvol.dispatchEvent(evt);
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
//        var w=$(window).height();
        var h=window.innerHeight;
        var p=0;
//        var t=1;
        if(EXwatchingnum!==undefined){
//            var jo=$(EXobli.children[EXwatchingnum]);
//            w=jo.height();
//            p=jo.offset().top;
//            if(jo.css("transform")!="none"){
//                t=parseFloat((/(?:^| )matrix\( *\d+.?\d* *, *\d+.?\d* *, *\d+.?\d* *, *(\d+.?\d*) *, *\d+.?\d* *, *\d+.?\d* *\)/.exec(jo.css("transform"))||[,t])[1]);
//            }
//zoom後の実際に見えている大きさでheightを取得できる以下に変更
            var eo=EXobli.children[EXwatchingnum];
            var cr=eo.getBoundingClientRect();
            h=cr.height;
            p=cr.top;
//            if(eo.style.transform.indexOf("scale")>=0){
//                t=CMsmall/100;
//            }
        }
        setBlacked[0]=true;
        pwaku.css("background-color","rgba(0,0,0,0.7)")
//            .css("border-top",Math.floor(p+w*t/2)+"px black solid")
            .css("border-top",Math.floor(p+h/2)+"px black solid")
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
    if(EXwatchingnum===undefined){return;}
    if(sw==1&&CMsmall<100){
        setBlacked[2]=true;
        $(EXobli.children[EXwatchingnum]).css("transform","scale("+CMsmall/100+")");
    }else{
        setBlacked[2]=false;
        $(EXobli.children[EXwatchingnum]).css("transform","");
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
    $(EXcomelist).children().slice(0,10).css("background-color",bc)
        .css("color",tc)
        .children('[class^="styles__message___"]').css("color",tc)
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
    $('#itimePosition input[type="radio"][name="timePosition"]').val([timePosition]);
    $('#itimePosition').css("display",isTimeVisible?"flex":"none");
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
    $("#isTabSoundplay").prop("checked",isTabSoundplay);
    $("#isOpenPanelwCome").prop("checked",isOpenPanelwCome);
    $("#isProtitleVisible").prop("checked",isProtitleVisible);
    $('#iprotitlePosition input[type="radio"][name="protitlePosition"]').val([protitlePosition]);
    $('#iprotitlePosition').css("display",isProtitleVisible?"flex":"none");
    $('#iproSamePosition input[type="radio"][name="proSamePosition"]').val([proSamePosition]);
    $('#iproSamePosition').css("display",(isProtitleVisible&&isTimeVisible)?"flex":"none");
    $('#isCommentWide').prop("checked",isCommentWide);
    $('#isProTextLarge').prop("checked",isProTextLarge);
    setTimeout(optionStatsUpdate,500,false);
}
function closeOption(){
    $("#settcont").css("display","none")
        .css("right","40px")
    ;
    $(".rightshift").css("display","none");
    $(".leftshift").css("display","");
    $(EXcomelist).children('div').css("background-color","")
        .css("color","")
        .children('[class^="styles__message___"]').css("color","")
    ;
    setOptionElement();
}
function optionHeightFix(){
    var settcontjq = $("#settcont");
    var settcontheight=settcontjq[0].scrollHeight;
    var settcontpadv=parseInt(settcontjq.css("padding-top"))+parseInt(settcontjq.css("padding-bottom"));
    if(settcontheight>window.innerHeight-105-settcontpadv){
//console.log("optionHeightFix: "+settcontjq.height()+" -> "+($(window).height()-105-settcontpadv));
        settcontjq.height(window.innerHeight-105-settcontpadv).css("overflow-y", "scroll");
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
    if($('#moveContainer').length==0){
        var eMoveContainer=document.createElement('div');
        eMoveContainer.id="moveContainer";
//        eMoveContainer.setAttribute("style","position:absolute;top:50px;left:1px;z-index:9;");
        eMoveContainer.setAttribute("style","z-index:9;"); //コメ欄10の下
        document.body.appendChild(eMoveContainer);
    }
//console.log("comevisiset delayset");
//    comevisiset(false);
//    if(isSureReadComment){
//console.log("popElement delayset");
//        popElement();
//    }else{
//        unpopElement();
//    }
    EXcomelist = $(commentListParentSelector)[0];
    EXcomments = $(EXcomelist).contents().find('[class^="styles__message___"]');
    //映像のリサイズ
    onresize();
console.log("delayset ok");
}
function optionStatsUpdate(outflg){
    var out=[0,0];
    if($('#settcont').length==0||$('#settcont').css("display")=="none"){return;}
    var tar=$('#sourceheight');
    if(bginfo[0]>0&&tar.length>0){
        tar.text("(ソース:"+bginfo[0]+"p)")
            .css("display","block")
        ;
    }else{
        tar.css("display","none");
    }
    tar=$('#windowsizes');
    if(EXwatchingnum!==undefined&&tar.length>0){
        var jo=$(EXobli.children[EXwatchingnum]);
        var omw=jo.width();
        var omh=jo.height();
        var oww=window.innerWidth;
        var owh=window.innerHeight;
        var opw=oww-omw;
        var opb=Math.floor((owh-omh)/2);
        var opt=owh-omh-opb;
        var nmw=omw;
        var nmh=omh;
        var sm=parseInt($('#movieheight input[type="radio"][name="movieheight"]:checked').val());
        if(sm>0){
            nmh=sm;
            nmw=Math.ceil(nmh*16/9);
        }
        var npw=opw;
        var npb=opb;
        var npt=opt;
        var sw=parseInt($('#windowheight input[type="radio"][name="windowheight"]:checked').val());
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
    clearBtnColored($("#saveBtn"));

    if(outflg){return out;}else{
        setTimeout(optionStatsUpdate,800,false);
    }
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
    if($('#settcont').length==0){
        var settcont = document.createElement("div");
        settcont.id = "settcont";
        //設定ウィンドウの中身
        settcont.innerHTML = "<input type=button class=closeBtn value=閉じる style='position:absolute;top:10px;right:10px;'><br>"+generateOptionHTML(false) + "<br><input type=button id=saveBtn value=一時保存> <input type=button class=closeBtn value=閉じる><br>※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<hr><input type='button' id='clearLocalStorage' value='localStorageクリア'>";
        settcont.style = "width:640px;position:absolute;right:40px;top:44px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:12;";//コメ欄10より上の番組情報等11より上
        $(settcont).prependTo('body');
        $('#CommentColorSettings').change(setComeColorChanged);
        $('#itimePosition,#isTimeVisible').change(setTimePosiChanged);
        $(".closeBtn").on("click", closeOption);
        $("#clearLocalStorage").on("click", setClearStorageClicked);
        $("#saveBtn").on("click",setSaveClicked);
        $('#iprotitlePosition,#isProtitleVisible').change(setProtitlePosiChanged);
        $('#iproSamePosition').change(setProSamePosiChanged);
        $('#isProTextLarge').change(setProTextSizeChanged);
    }
    $("#CommentMukouSettings").hide();
    $("#CommentColorSettings").css("width","600px")
        .css("padding","8px")
        .css("border","1px solid black")
        .children('div').css("clear","both")
        .children('span.desc').css("padding","0px 4px")
        .next('span.prop').css("padding","0px 4px")
        .next('input[type="range"]').css("float","right")
    ;
    $("#itimePosition").insertBefore("#isTimeVisible+*")
        .css("border","1px solid black")
        .css("margin-left","16px")
        .css("display","flex")
        .css("flex-direction","column")
        .css("padding","8px")
        .children().css("display","flex")
        .css("flex-direction","row")
        .css("margin","1px 0px")
        .children().css("margin-left","4px")
    ;
    $("#iprotitlePosition").insertBefore("#isProtitleVisible+*")
        .css("border","black solid 1px")
        .css("margin-left","16px")
        .css("display","flex")
        .css("flex-direction","column")
        .children().css("display","flex")
        .css("flex-direction","row")
        .css("margin","1px 0px")
        .children().css("margin-left","4px")
    ;
    $("#iproSamePosition").insertBefore("#isProtitleVisible")
        .css("border","black solid 1px")
        .children().css("display","flex")
        .css("flex-direction","row")
        .css("margin","1px 0px")
        .children().css("margin-left","4px")
    ;
    if($('#prosamedesc').length==0){
        $('<span id="prosamedesc" style="margin-left:4px;">↑と↓が同じ位置の場合: </span>').prependTo("#iproSamePosition>*");
    }
    if($('.leftshift').length==0){
        $('<input type="button" class="leftshift" value="←この画面を少し左へ" style="float:right;margin-top:10px;padding:0px 3px;">').appendTo('#CommentColorSettings');
        $(".leftshift").on("click",function(){
            $("#settcont").css("right","320px");
            $(".leftshift").css("display","none");
            $(".rightshift").css("display","");
        });
    }
    if($('.rightshift').length==0){
        $('<input type="button" class="rightshift" value="この画面を右へ→" style="float:right;margin-top:10px;display:none;padding:0px 3px;">').appendTo('#CommentColorSettings');
        $(".rightshift").on("click",function(){
            $("#settcont").css("right","40px");
            $(".rightshift").css("display","none");
            $(".leftshift").css("display","");
            $('#PsaveCome').prop("disabled",true)
                .css("color","gray")
            ;
            setTimeout(clearBtnColored,1200,$('#PsaveCome'));
        });
    }
    if($('#windowresize').length==0){
        $('<div id="windowresize">ウィンドウのサイズ変更<span id="windowsizes"></span></div>').insertAfter('#CommentColorSettings');
        $('#windowresize').css("display","flex")
            .css("flex-direction","column")
            .css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
            .children('#windowsizes').css("display","none")
        ;
    }
    if($('#movieheight').length==0){
        $('<div id="movieheight">映像の縦長さ<br><p id="sourceheight"></p></div>').appendTo('#windowresize');
        $('<div><input type="radio" name="movieheight" value=0>変更なし</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=240>240px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=360>360px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=480>480px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=720>720px</div>').appendTo('#movieheight');
        $('<div><input type="radio" name="movieheight" value=1080>1080px</div>').appendTo('#movieheight');
        $('#movieheight input[type="radio"][name="movieheight"]').val([0]);
        $('#movieheight').css("display","flex")
            .css("flex-direction","row")
            .css("flex-wrap","wrap")
            .css("padding","0px 8px")
            .children('#sourceheight').css("display","none")
            .siblings().css("padding","0px 3px")
            .change(setSaveDisable)
        ;
    }
    if($('#windowheight').length==0){
        $('<div id="windowheight">ウィンドウの縦長さ</div>').appendTo('#windowresize');
        $('<div><input type="radio" name="windowheight" value=0>変更なし</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=1>映像の縦長さに合わせる</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=2>黒枠の分だけ空ける</div>').appendTo('#windowheight');
        $('<div><input type="radio" name="windowheight" value=3>現在の余白を維持</div>').appendTo('#windowheight');
        $('#windowheight input[type="radio"][name="windowheight"]').val([0]);
        $('#windowheight').css("display","flex")
            .css("flex-direction","row")
            .css("flex-wrap","wrap")
            .css("padding","0px 8px")
            .children().css("padding","0px 3px")
            .change(setSaveDisable)
        ;
    }
    if($('#PsaveCome').length==0){
        $('<input type="button" id="PsaveCome" class="Psave" value="このコメント外見設定を永久保存(上書き)">').appendTo('#CommentColorSettings');
        $('#PsaveCome').css("margin","8px 0 0 24px")
            .on("click",setPSaveCome)
        ;
    }
    if($('#PsaveNG').length==0){
        $('<input type="button" id="PsaveNG" class="Psave" value="←これらを永久保存(上書き)">').insertAfter('#fullNg');
        $('#PsaveNG').css("margin","8px 0 0 8px")
            .on("click",setPSaveNG)
        ;
        $('<div style="clear:both;">').insertAfter('#PsaveNG');
        $('#fullNg').css("float","left");
    }
    $('.Psave').css("margin-left","8px")
        .css("padding","0px 3px")
    ;
    if($('#ComeMukouO').length==0){
        $('#CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $('<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>').prependTo('#CommentMukouSettings');
        $('#ComeMukouO').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('<table id="setTable">').appendTo('#ComeMukouO');
        var stjo=$('#setTable');
        var sttr=stjo.contents().find('tr');
        stjo.css("border-collapse","collapse");
        $('<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th colspan=2>音量ミュート</th></tr>').appendTo(stjo);
        $('<tr><td>適用</td><td></td><td></td><td></td><td></td><td></td></tr>').appendTo(stjo);
        $('<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td colspan=2></td></tr>').appendTo(stjo);

        sttr=stjo.contents().find('tr');
        var stra=sttr.eq(1).children('td');
        var strb=sttr.eq(2).children('td');
        $('#isCMBlack').appendTo(stra.eq(1));
        $('#isCMBkTrans').appendTo(stra.eq(1)).css("display","none");
        $('<input type="radio" name="cmbktype" value=0>').appendTo(stra.eq(2))
            .after("全面真黒<br>")
        ;
        $('<input type="radio" name="cmbktype" value=1>').appendTo(stra.eq(2))
            .after("下半透明")
        ;
        stra.eq(2).children('input[type="radio"][name="cmbktype"]').prop("disabled",!isCMBlack)
            .val([isCMBkTrans?1:0])
            .change(setCMBKChangedR)
        ;

        $('#CMsmall').appendTo(stra.eq(3)).after("％")
            .css("text-align","right")
            .css("width","4em")
        ;

        $('#isCMsoundoff').appendTo(stra.eq(4));
        $('#isTabSoundplay').appendTo(stra.eq(4)).css("display","none");
        $('<input type="radio" name="cmsotype" value=0>').appendTo(stra.eq(5))
            .after("プレイヤー<br>")
        ;
        $('<input type="radio" name="cmsotype" value=1>').appendTo(stra.eq(5))
            .after("タブ設定")
        ;
        stra.eq(5).children('input[type="radio"][name="cmsotype"]').prop("disabled",!isCMsoundoff)
            .val([isTabSoundplay?1:0])
            .change(setCMsoundChangedR)
        ;

        $('#isCMBlack').change(setCMBKChangedB);
        $('#CMsmall').change(setCMzoomChangedR);
        $('#isCMsoundoff').change(setCMsoundChangedB);
        $('#isCMBkR').appendTo(strb.eq(1));
        $('#isCMsmlR').appendTo(strb.eq(2));
        $('#isCMsoundR').appendTo(strb.eq(3));
        stra.add(strb).css("border","1px solid black")
            .css("text-align","center")
            .css("padding","3px")
        ;
        stra.eq(1).add(stra.eq(4)).css("border-right","none");
        stra.eq(2).add(stra.eq(5)).css("border-left","none")
            .css("text-align","left")
        ;

        $('<div id="ComeMukouW" class="setTables">↑の実行待機(秒)</div>').insertAfter('#ComeMukouO');
        $('#ComeMukouW').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
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
        $('#ComeMukouD').remove();
    }
    if($('#epnumedit').length==0){
        $('<div id="epnumedit" style="border:1px solid black;padding:8px;margin-left:16px;display:flex;flex-direction:row;"><div>背景区切り数<input type="number" name="epcount" min=1 max=26></div><div style="margin-left:16px;">1番目の数字<input type="number" name="epfirst" min=1 max=26>(区切り数7以上の場合のみ表示)</div></div>').insertBefore("#isTimeVisible+*");
        var epnume=$('#epnumedit').contents().find('input[type="number"]');
        epnume.filter('[name="epcount"]').val(2)
            .change(epcountchange)
        ;
        epnume.filter('[name="epfirst"]').val(1)
            .change(epfirstchange)
        ;
    }
console.log("createSettingWindow ok");
}
function epcountchange(){
    var c=parseInt($('#epnumedit input[type="number"][name="epcount"]').val());
    var f=parseInt($('#epnumedit input[type="number"][name="epfirst"]').val());
    var eo='<div style="border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;">';
    var ea='';
    for(var i=0;i<c;i++){
        ea+=eo+(c>6?(i+f):'&nbsp;')+'</div>';
    }
    $('#proTimeEpNum').html(ea);
}
function epfirstchange(){
    if(parseInt($('#epnumedit input[type="number"][name="epcount"]').val())>6){
        epcountchange();
    }
}
function setClearStorageClicked(){
    window.localStorage.clear();
console.info("cleared localStorage");
}
function moveComeTopFilter(){
    var jo=$('.movingComment');
    var i=jo.length-1
    while(i>=0){
        if(jo.eq(i).position().top>window.innerHeight-48-61){
            jo.eq(i).remove();
        }
        i-=1;
    }
}
function setSaveDisable(){
    $("#saveBtn").prop("disabled",true)
        .css("color","gray")
    ;
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
    timePosition = $('#itimePosition input[type="radio"][name="timePosition"]:checked').val();
    notifySeconds = parseInt($("#notifySeconds").val());
    cmblockia = Math.max(1,1+parseInt($("#beforeCMWait").val()));
    cmblockib = -Math.max(1,1+parseInt($("#afterCMWait").val()));
    isManualKeyCtrlR = $("#isManualKeyCtrlR").prop("checked");
    isManualKeyCtrlL = $("#isManualKeyCtrlL").prop("checked");
    isManualMouseBR = $("#isManualMouseBR").prop("checked");
    isCMBkR = $("#isCMBkR").prop("checked")&&$("#isCMBlack").prop("checked");
    isCMsoundR = $("#isCMsoundR").prop("checked")&&$("#isCMsoundoff").prop("checked");
    isCMsmlR = $("#isCMsmlR").prop("checked")&&($("#CMsmall").val()!=100);
    isTabSoundplay = $("#isTabSoundplay").prop("checked");
    isOpenPanelwCome=$("#isOpenPanelwCome").prop("checked");
    isProtitleVisible=$("#isProtitleVisible").prop("checked");
    protitlePosition=$('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val();
    proSamePosition=$('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
    isCommentWide=$('#isCommentWide').prop("checked");
    isProTextLarge=$('#isProTextLarge').prop("checked");

    setOptionHead();
    setOptionElement();
    arrayFullNgMaker();
    if(settings.isAlwaysShowPanel){
        popElement({head:true,foot:true,side:true});
        forElementClose=0;
    }else if(isOpenPanelwCome&&isComeOpen()){
        popElement({head:true,foot:true,side:true});
        forElementClose=5;
    }else if(!isOpenPanelwCome&&isComeOpen()){
        hideElement({head:true,foot:true,side:true});
        forElementClose=0;
    }
//console.log("comevisiset savebtnclick");
//    setTimeout(comevisiset,200,false);
    optionHeightFix();
    var sm=parseInt($('#movieheight input[type="radio"][name="movieheight"]:checked').val());
    var sw=parseInt($('#windowheight input[type="radio"][name="windowheight"]:checked').val());
//console.log("sm="+sm+",sw="+sw);
    if(sm!=0||sw!=0){
        var s=optionStatsUpdate(true);
        if(s[0]!=0||s[1]!=0){
            chrome.runtime.sendMessage({type:"windowresize",valw:s[0],valh:s[1]},function(r){
                setTimeout(optionHeightFix,1000);
//                setTimeout(comevisiset,1000,false);
                setTimeout(moveComeTopFilter,1000);
            });
        }
    }
    $("#saveBtn").prop("disabled",true)
        .css("background-color","lightyellow")
        .css("color","gray")
    ;
    setTimeout(clearBtnColored,1200,$("#saveBtn"));
}
function setProTextSizeChanged(){
    setProSamePosiChanged(false,$('#isProTextLarge').prop("checked"));
}
function setProSamePosiChanged(pophide,bigtext){
//ref:
//setTimePosiChanged
//setProtitlePosiChanged
//setoptionelement
//hideElement,popElement pophide=true 開閉遅延を考慮する
    var titleprop="";
    var timeprop="";
    var sameprop="";
    if($("#settcont").css("display")=="block"){
        if($("#isProtitleVisible").prop("checked")){
            titleprop=$('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val();
        }
        if($("#isTimeVisible").prop("checked")){
            timeprop=$('#itimePosition input[type="radio"][name="timePosition"]:checked').val();
        }
        sameprop=$('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
        if(bigtext===undefined){
            bigtext=$("#isProTextLarge").prop("checked");
        }
    }else{
        if(isProtitleVisible){
            titleprop=protitlePosition;
        }
        if(isTimeVisible){
            timeprop=timePosition;
        }
        sameprop=proSamePosition;
        if(bigtext===undefined){
            bigtext=isProTextLarge;
        }
    }
    if(titleprop!=""){
        createProtitle(0,bigtext);
    }else{
        createProtitle(1);
    }
    if(timeprop!=""){
        createTime(0,bigtext);
    }else{
        createTime(1);
    }
//console.log("setProSamePosiChanged:time="+timeprop+",title="+titleprop+",same="+sameprop);
    proPositionAllReset(bigtext);
    setTimePosition(timeprop,titleprop,sameprop,bigtext);
    setProtitlePosition(timeprop,titleprop,sameprop,bigtext);
    proSamePositionFix(timeprop,titleprop,sameprop,bigtext);
    setTimeout(comemarginfix,(pophide?110:0),(pophide?1:0),timeprop,titleprop,sameprop,bigtext);
}
function setProtitlePosiChanged(){
    //選択肢の表示切替だけして本体はsetProSamePosiChangedで行う
    if($("#isProtitleVisible").prop("checked")){
        $('#iprotitlePosition').css("display","flex");
    }else{
        $('#iprotitlePosition').css("display","none");
    }
    //sameposi表示切替
    if($("#isProtitleVisible").prop("checked")&&$("#isTimeVisible").prop("checked")){
        $('#iproSamePosition').css("display","block");
    }else{
        $('#iproSamePosition').css("display","none");
    }
    setProSamePosiChanged();
}
function setTimePosiChanged(){
    //選択肢の表示切替だけして本体はsetProSamePosiChangedで行う
    if($("#isTimeVisible").prop("checked")){
        $('#itimePosition').css("display","flex");
        $('#epnumedit').css("display","flex");
    }else{
        $('#itimePosition').css("display","none");
        $('#epnumedit').css("display","none");
    }
    //sameposi表示切替
    if($("#isProtitleVisible").prop("checked")&&$("#isTimeVisible").prop("checked")){
        $('#iproSamePosition').css("display","block");
    }else{
        $('#iproSamePosition').css("display","none");
    }
    setProSamePosiChanged();
}
function setCMzoomChangedR(){
    var jo=$('#isCMsmlR');
    if(parseInt($("#CMsmall").val())==100){
        jo.prop("checked",false)
            .prop("disabled",true)
        ;
    }else{
      jo.prop("disabled",false);
    }
}
function setCMsoundChangedB(){
    var b=$("#isCMsoundoff").prop("checked");
    $('#CommentMukouSettings input[type="radio"][name="cmsotype"]').prop("disabled",!b);
    $('#isCMsoundR').prop("checked",false)
        .prop("disabled",!b)
    ;
}
function setCMBKChangedB(){
    var b=$("#isCMBlack").prop("checked")
    $('#CommentMukouSettings input[type="radio"][name="cmbktype"]').prop("disabled",!b);
    $('#isCMBkR').prop("checked",false)
        .prop("disabled",!b)
    ;
}
function setCMBKChangedR(){
    $('#isCMBkTrans').prop("checked",$('#CommentMukouSettings input[type="radio"][name="cmbktype"]:checked').val()==1?true:false);
}
function setCMsoundChangedR(){
    $('#isTabSoundplay').prop("checked",$('#CommentMukouSettings input[type="radio"][name="cmsotype"]:checked').val()==1?true:false);
}
function setComeColorChanged(){
//console.log("setComeColorChanged");
    var p=[];
    var jo=$('#CommentColorSettings input[type="range"]');
    for(var i=0;i<jo.length;i++){
        var jq=jo.eq(i);
        var jv=jq.val();
        jq.prevAll('span.prop').text(jv+" ("+Math.round(jv*100/255)+"%)");
        p[i]=jv;
    }
    var bc="rgba("+p[0]+","+p[0]+","+p[0]+","+(p[1]/255)+")";
    var tc="rgba("+p[2]+","+p[2]+","+p[2]+","+(p[3]/255)+")";
    $(EXcomelist).children().slice(0,10).css("background-color",bc)
        .css("color",tc)
        .children('[class^="styles__message___"]').css("color",tc)
    ;
}
function toggleCommentList(){
//console.log("comevisiset toggleCommentList");
//    comevisiset(true);
    var jo=$(EXcomelist).parent();
    var jv=jo.css("display");
    if(jv!="none"){
        jo.css("display","none");
        $(EXcome).css("height","unset");
        if(isInpWinBottom){
            $(EXcome).css("top","unset")
                .css("bottom","0px")
            ;
        }
    }else{
        jo.css("display",isInpWinBottom?"flex":"");
        $(EXcome).css("height","")
            .css("top","")
            .css("bottom","")
        ;
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
//function popHeader(){
//console.log("popHeader");
//    $(EXhead).css("visibility","visible")
//      .css("opacity",1)
//    ;
//    $(EXfoot).css("visibility","visible")
//      .css("opacity",1)
//    ;
//console.log("comevisiset popHeader");
//    comevisiset(false);
//}
//function comevisiset(sw){
//    setProSamePosiChanged();
//}
//function comevisiset(sw){
//console.log("comevisiset");
//    var comeList = $(commentListParentSelector);
//    if(sw){
//        comeList.css("display",(comeList.css("display")!="none")?"none":(isInpWinBottom?"flex":"block"));
//    }
//    var contCome = $(EXcome);
//    var comeForm = $(EXcomesend);
//    var comeshown = $(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length>0?true:false;
//    var hideCommentParam = isCustomPostWin?64:108;
//    var clipSlideBarTop = ($(EXhead).css("visibility")=="visible")?44:0;
//    var clipSlideBarBot = ($(EXfoot).css("visibility")=="visible")?61:0;
//    var butscr = $(EXfoot).contents().find('button[class^="styles__full-screen___"]').first();
//    var butvol = $(EXvolume);
//    var itimeposi=($('#settcont').css("display")=="none")?(isTimeVisible?timePosition:""):($('#isTimeVisible').prop("checked")?$('#itimePosition input[type="radio"][name="timePosition"]:checked').val():"");
//    var ititleposi=($('#settcont').css("display")=="none")?(isProtitleVisible?protitlePosition:""):($('#isProtitleVisible').prop("checked")?$('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val():"");
//    var iprosame=($('#settcont').css("display")=="none")?proSamePosition:$('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
//    var timepadtop=(isTimeVisible&&(itimeposi=="windowtop")&&($(EXhead).css("visibility")=="hidden"))?15:0;
//    var timepadbot=(isTimeVisible&&(itimeposi=="windowbottom")&&($(EXfoot).css("visibility")=="hidden"))?15:0;
//    var titlepadtop=(isProtitleVisible&&(ititleposi=="windowtopright")&&($(EXhead).css("visibility")=="hidden"))?15:0;
//    var titlepadbot=(isProtitleVisible&&(ititleposi=="windowbottomright")&&($(EXfoot).css("visibility")=="hidden"))?15:0;
//    if(timepadtop==0||titlepadtop==0||iprosame=="vertical"){
//        timepadtop+=titlepadtop;
//        timepadbot+=titlepadbot;
//    }
//    contCome.css("transform",isSureReadComment?"translateX(0px)":"");
//    if(isInpWinBottom){
//        var b=80+((isSureReadComment||comeshown)?hideCommentParam:0);
//        butscr.css("bottom",b+"px");
//        butvol.css("bottom",b+"px");
//        if(comeList.css("display")=="none"){
//            contCome.css("position","absolute");
//            contCome.css("top",(window.innerHeight-hideCommentParam-clipSlideBarBot)+"px");
//            contCome.css("height",hideCommentParam+"px");
//            comeForm.css("position","absolute");
//            comeForm.css("top","");
//            comeForm.css("bottom",0);
//            comeForm.css("height",hideCommentParam+"px");
//            comeList.css("position","absolute");
//            comeList.css("width","100%");
//        }else{
//            contCome.css("position","absolute");
//            contCome.css("top",(clipSlideBarTop+timepadtop)+"px");
//            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot-timepadtop)+"px");
//            comeForm.css("position","absolute");
//            comeForm.css("top","");
//            comeForm.css("bottom",0);
//            comeForm.css("height",hideCommentParam+"px");
//            comeList.css("position","absolute");
//            comeList.css("bottom","");
//            comeList.css("top",0);
//            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot-timepadtop)+"px");
//            comeList.css("width","100%");
//        }
//    }else{
//        butscr.css("bottom","");
//        butvol.css("bottom","");
//        if(comeList.css("display")=="none"){
//            contCome.css("position","absolute");
//            contCome.css("top",clipSlideBarTop+"px");
//            contCome.css("height",hideCommentParam+"px");
//            comeForm.css("position","absolute");
//            comeForm.css("bottom","");
//            comeForm.css("top",0);
//            comeForm.css("height",hideCommentParam+"px");
//            comeList.css("position","absolute");
//            comeList.css("width","100%");
//        }else{
//            contCome.css("position","absolute");
//            contCome.css("top",clipSlideBarTop+"px");
//            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot-timepadbot)+"px");
//            comeForm.css("position","absolute");
//            comeForm.css("bottom","");
//            comeForm.css("top",0);
//            comeForm.css("height",hideCommentParam+"px");
//            comeList.css("position","absolute");
//            comeList.css("top","");
//            comeList.css("bottom",0);
//            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot-timepadbot)+"px");
//            comeList.css("width","100%");
//        }
//    }
//    setProSamePosiChanged();
//}
function hideElement(inp){
//console.log("hideElement");
//console.log(inp);
//trueなら積極的に隠すよう設定
//falseはtrueの解除(trueの設定値どおりの時のみ機能するので、積極的に表示する場合はpopElementを使用する)
//true,falseは見た目の変化のみで内部の開閉状態は変化しないので映像の横縮小などは変化しない
//"force"ならoverlayをクリックさせて閉じる（視聴中番組情報、放送中番組一覧、コメント一覧）
//クリックによる影響（他要素の開閉やイベント）は全く考慮していない
//ref
//setSaveClicked 一時保存時にコメ欄が閉じていて、コメ欄黒帯共存が無効のとき
//$(EXfootcome).on("click" コメ欄が閉じている＝開ける時で、黒帯が常時表示でなく、コメ欄黒帯共存が無効のとき
//1s 隠すカウントダウンが0になったとき

    var oclick=false; //overlayをクリックするかどうか
    var comefix=false; //コメント欄の表示修正
    if(inp.head!==undefined){
        comefix=true;
        if(inp.head==true){
            EXhead.style.visibility="hidden";
            EXhead.style.opacity="0";
        }else if(inp.head==false){
            if(EXhead.style.visibility=="hidden"){
                EXhead.style.visibility="";
            }
            if(EXhead.style.opacity=="0"){
                EXhead.style.opacity="";
            }
        }
    }
    if(inp.foot!==undefined){
        comefix=true;
        if(inp.foot==true){
            EXfoot.style.visibility="hidden";
            EXfoot.style.opacity="0";
        }else if(inp.foot==false){
            if(EXfoot.style.visibility=="hidden"){
                EXfoot.style.visibility="";
            }
            if(EXfoot.style.opacity=="0"){
                EXfoot.style.opacity="";
            }
        }
    }
    if(inp.side==true){
        EXside.style.transform="translate(100%, -50%)";
    }else if(inp.foot==false){
        if(EXside.style.transform=="translate(100%, -50%)"){
            EXside.style.transform="";
        }
    }
    if(inp.programinfo==true){
        EXinfo.style.transform="translateX(100%)";
    }else if(inp.programinfo==false){
        if(EXinfo.style.transform=="translateX(100%)"){
            EXinfo.style.transform="";
        }
    }else if(inp.programinfo=="force"){
        EXinfo.style.transform="translateX(100%)";
        oclick=true;
    }
    if(inp.channellist==true){
        EXchli.parentElement.style.transform="translateX(100%)";
    }else if(inp.channellist==false){
        if(EXchli.parentElement.style.transform=="translateX(100%)"){
            EXchli.parentElement.style.transform="";
        }
    }else if(inp.channellist=="force"){
        EXchli.parentElement.style.transform="translateX(100%)";
        oclick=true;
    }
    if(inp.commentlist==true){
        EXcome.style.transform="translateX(100%)";
    }else if(inp.commentlist==false){
        if(EXcome.style.transform=="translateX(100%)"){
            EXcome.style.transform="";
        }
    }else if(inp.commentlist=="force"){
        EXcome.style.transform="translateX(100%)";
        oclick=true;
    }
    if(oclick){
        $('[class^="style__overlap___"]').trigger("click");
    }
    if(comefix){
        setTimeout(setProSamePosiChanged,110,true);
    }
}
function popElement(inp){
//console.log("popElement");
//console.log(inp);
//trueなら積極的に表示するよう設定
//falseはtrueの解除(trueの設定値どおりの時のみ機能するので、積極的に隠す場合はhideElementを使用する)
//true,falseは見た目の変化のみで内部の開閉状態は変化しないので映像の横縮小などは変化しないはず
//"force"なら各triggerで開こうとする（視聴中番組情報、放送中番組一覧、コメントリスト）
//クリックによる影響（他要素の開閉やイベント）は全く考慮していない
//音量ボタン等の高さ位置はここで調整
    var comefix=false;
    if(inp.head!==undefined){
        comefix=true;
        if(inp.head==true){
            EXhead.style.visibility="visible";
            EXhead.style.opacity="1";
        }else if(inp.head==false){
            if(EXhead.style.visibility=="visible"){
                EXhead.style.visibility="";
            }
            if(EXhead.style.opacity=="1"){
                EXhead.style.opacity="";
            }
        }
    }
    if(inp.foot!==undefined){
        comefix=true;
        if(inp.foot==true){
            EXfoot.style.visibility="visible";
            EXfoot.style.opacity="1";
        }else if(inp.foot==false){
            if(EXfoot.style.visibility=="visible"){
                EXfoot.style.visibility="";
            }
            if(EXfoot.style.opacity=="1"){
                EXfoot.style.opacity="";
            }
        }
    }
    if(inp.side==true){
        EXside.style.transform="translateY(-50%)";
    }else if(inp.foot==false){
        if(EXside.style.transform=="translateY(-50%)"){
            EXside.style.transform="";
        }
    }
    if(inp.programinfo==true){
        EXinfo.style.transform="translateX(0px)";
    }else if(inp.programinfo==false){
        if(EXinfo.style.transform=="translateX(0px)"){
            EXinfo.style.transform="";
        }
    }else if(inp.programinfo=="force"){
        EXinfo.style.transform="translateX(0px)";
        $(EXfootcome).prev().not('[class*="styles__left-container-not-clickable___"]').trigger("click");
    }
    if(inp.channellist==true){
        EXchli.parentElement.style.transform="translateX(0px)";
    }else if(inp.channellist==false){
        if(EXchli.parentElement.style.transform=="translateX(0px)"){
            EXinfo.parentElement.style.transform="";
        }
    }else if(inp.channellist=="force"){
        EXchli.parentElement.style.transform="translateX(0px)";
        $(EXside).contents().find('button').eq(1).trigger("click");
    }
    if(inp.commentlist==true){
        EXcome.style.transform="translateX(0px)";
    }else if(inp.commentlist==false){
        if(EXcome.style.transform=="translateX(0px)"){
            EXcome.style.transform="";
        }
    }else if(inp.commentlist=="force"){
        EXcome.style.transform="translateX(0px)";
        $(EXfootcome).not('[class*="styles__right-container-not-clickable___"]').trigger("click");
    }
    if(comefix){
        setTimeout(setProSamePosiChanged,110,true);
    }
}
function comemarginfix(repeatcount,inptime,inptitle,inpsame,inpbig){
//旧comevisiset
//setProSamePosiChangedから呼ぶ
//黒帯パネルとコメント欄が重なるのを防ぎ
//番組残り時間とタイトルの分を考慮して入力欄周辺とコメ欄端のmarginを設定する
//再試行はヘッダとフッタの開閉遅延を考慮
    var jform=$(EXcomesend);
    var jcome=$(EXcomesend).siblings(['class^="styles__comment-list-wrapper___"']);
    var jfptop=0; //jformのpadding-top
    var jfpbot=0;
    var jfmtop=0; //jformのmargin-top
    var jfmbot=0;
    var jcmtop=0; //jcomeのmargin-top
    var jcmbot=0;
    var htime=isTimeVisible?$('#forProEndTxt').height():0;
    var htitle=isProtitleVisible?$('#tProtitle').height():0;
    var ptime=(inptime!==undefined)?inptime:(isTimeVisible?timePosition:"");
    var ptitle=(inptitle!==undefined)?inptitle:(isProtitleVisible?protitlePosition:"");
    var psame=(inpsame!==undefined)?inpsame:proSamePosition;
    //画面上部の設定
    if($(EXhead).css("visibility")=="visible"){
        //ヘッダ表示時
        if(isInpWinBottom){
            //入力欄が下＝コメ欄が上＝対象はjcomeのtopmargin
            if(ptime=="windowtop"&&ptitle=="windowtopright"&&psame=="vertical"){
                jcmtop=Math.max(htime+htitle,44);
            }else{
                jcmtop=44;
            }
        }else{
            //入力欄が上＝対象はjformのtopmargin＋番組情報(コメ上)
            if(ptime=="windowtop"&&ptitle=="windowtopright"&&psame=="vertical"){
                jfmtop=Math.max(htime+htitle,44);
            }else{
                jfmtop=44;
            }
            if(ptime=="commentinputtop"&&ptitle=="commentinputtopright"&&psame=="vertical"){//(ptitle=="commentinputtopleft"||
                jfptop=Math.max(htime+htitle,15);
            }else if(ptime=="commentinputtop"||(ptitle=="commentinputtopleft"||ptitle=="commentinputtopright")){
                jfptop=Math.max(htime,htitle,15);
            }else{
                jfptop=15;
            }
        }
    }else{
        //ヘッダ非表示時
        if(isInpWinBottom){
            if(ptime=="windowtop"&&ptitle=="windowtopright"&&psame=="vertical"){
                jcmtop=htime+htitle;
            }else if(ptime=="windowtop"||ptitle=="windowtopright"){
                jcmtop=Math.max(htime,htitle);
            }else{
                jcmtop=0;
            }
        }else{ //jftop
            var margincut=0;
            if((ptime=="windowtop"||ptitle=="windowtopright")&&(ptime!="commentinputtop"&&ptitle!="commentinputtopright"&&ptitle!="commentinputtopleft")){
                //ウィンドウ右上に何かあり、入力欄の上には何も無いとき
                margincut=15;
            }else if(ptime!="windowtop"&&ptitle!="windowtopright"){
                //ウィンドウ右上には何も無いとき
                margincut=15;
            }
            if(ptime=="windowtop"&&ptitle=="windowtopright"&&psame=="vertical"){
                jfmtop=htime+htitle-margincut;
            }else if(ptime=="windowtop"||ptitle=="windowtopright"){
                jfmtop=Math.max(htime,htitle,15)-margincut;
            }else{
                jfmtop=15-margincut;
            }
            if(ptime=="commentinputtop"&&ptitle=="commentinputtopright"&&psame=="vertical"){//(ptitle=="commentinputtopleft"||
                jfptop=Math.max(htime+htitle,15);
            }else if(ptime=="commentinputtop"||(ptitle=="commentinputtopleft"||ptitle=="commentinputtopright")){
                jfptop=Math.max(htime,htitle,15);
            }else{
                jfptop=15;
            }
        }
    }
    //フッタ表示かつコメ入力下の場合は音量ボタン等の下位置を上げる
    var volshift=false;
    $(EXvolume).css("bottom","")
        .prev('[class^="styles__full-screen___"]').css("bottom","")
    ;
    if($(EXfoot).css("visibility")=="visible"){
        //フッタ表示時
        if(isInpWinBottom){ // jctop,jfbot
            volshift=true;
            jfmbot=$(EXfoot).children('[class^="TVContainer__footer___"]').height();
            if(ptime=="commentinputbottom"&&ptitle=="commentinputbottomright"&&psame=="vertical"){//(ptitle=="commentinputbottomleft"||
                jfpbot=Math.max(htime+htitle,15);
            }else if(ptime=="commentinputbottom"||(ptitle=="commentinputbottomleft"||ptitle=="commentinputbottomright")){
                jfpbot=Math.max(htime,htitle,15);
            }else{
                jfpbot=15;
            }
        }else{ // jftop,jcbot
            jcmbot=$(EXfoot).children('[class^="TVContainer__footer___"]').height();
        }
    }else{
        //フッタ非表示時
        if(isInpWinBottom){ // jctop,jfbot
            var margincut=0;
            if((ptime=="windowbottom"||ptitle=="windowbottomright")&&(ptime!="commentinputbottom"&&ptitle!="commentinputbottomright"&&ptitle!="commentinputbottomleft")){
                //ウィンドウ右下に何かあり、入力欄の下には何も無いとき
                margincut=15;
            }else if(ptime!="windowbottom"&&ptitle!="windowbottomright"){
                //ウィンドウ右下には何も無いとき
                margincut=15;
            }
            if(ptime=="windowbottom"&&ptitle=="windowbottomright"&&psame=="vertical"){
                jfmbot=htime+htitle-margincut;
            }else if(ptime=="windowbottom"||ptitle=="windowbottomright"){
                jfmbot=Math.max(htime,htitle,15)-margincut;
            }else{
                jfmbot=15-margincut;
            }
            if(ptime=="commentinputbottom"&&ptitle=="commentinputbottomright"&&psame=="vertical"){//(ptitle=="commentinputbottomleft"||
                jfpbot=Math.max(htime+htitle,15);
            }else if(ptime=="commentinputbottom"||(ptitle=="commentinputbottomleft"||ptitle=="commentinputbottomright")){
                jfpbot=Math.max(htime,htitle,15);
            }else{
                jfpbot=15;
            }
        }else{ // jftop,jcbot
            if(ptime=="windowbottom"&&ptitle=="windowbottomright"&&psame=="vertical"){
                jcmbot=htime+htitle;
            }else if(ptime=="windowbottom"||ptitle=="windowbottomright"){
                jcmbot=Math.max(htime,htitle);
            }else{
                jcmbot=0;
            }
        }
    }
    if(isInpWinBottom){ //jctop,jfbot,jftop
        if(ptime=="commentinputtop"&&ptitle=="commentinputtopright"&&psame=="vertical"){//(ptitle=="commentinputtopleft"||
            jfptop=Math.max(htime+htitle,15);
        }else if(ptime=="commentinputtop"||(ptitle=="commentinputtopleft"||ptitle=="commentinputtopright")){
            jfptop=Math.max(htime,htitle,15);
        }else{
            jfptop=15;
        }
    }else{ //jftop,jcbot,jfbot
        if(ptime=="commentinputbottom"&&ptitle=="commentinputbottomright"&&psame=="vertical"){//(ptitle=="commentinputbottomleft"||
            jfpbot=htime+htitle;
        }else if(ptime=="commentinputbottom"||(ptitle=="commentinputbottomleft"||ptitle=="commentinputbottomright")){
            jfpbot=Math.max(htime,htitle,15);
        }else{
            jfpbot=15;
        }
    }
    jform.css("margin-top",jfmtop)
        .css("margin-bottom",jfmbot)
        .css("padding-top",jfptop)
        .css("padding-bottom",jfpbot)
    ;
    jcome.css("margin-top",jcmtop)
        .css("margin-bottom",jcmbot)
    ;
    if(volshift){
        $(EXvolume).css("bottom",(80+jform.height()+jfptop+jfpbot)+"px")
            .prev('[class^="styles__full-screen___"]').css("bottom",(80+jform.height()+jfptop+jfpbot)+"px")
        ;
    }
    if(repeatcount>0){
        setTimeout(comemarginfix,210,repeatcount-1,inptime,inptitle,inpsame,inpbig);
    }
}
//function unpopElement(){
////console.log("unpopElement");
//    popElemented=false;
//    $(EXinfo).css("z-index","");
//    $(EXside).css("transform","");
//    $(EXchli).parent().css("z-index","");
//    $(EXhead).css("visibility","")
//      .css("opacity","")
//    ;
//    $(EXfoot).css("visibility","")
//      .css("opacity","")
//    ;
////    if(!isSureReadComment){
//    $(EXcome).css("transform","")
////        .css("position","")
//      ;
////    }
////console.log("comevisiset unpopElement");
////    comevisiset(false);
////    waitforhide(10);
//    $(EXcomesend).css("margin","")
//        .siblings(['class^="styles__comment-list-wrapper___"']).css("margin","")
//    ;
//}
//function popElement(){
//console.log("popElement");
//    popElemented=true;
//    //マウスオーバーで各要素表示
//    $(EXinfo).css("z-index",11); //コメ欄が10なのでそれより上へ
//    $(EXside).css("transform","translate(0,-50%)");
//    $(EXchli).parent().css("z-index",11);
//    $(EXhead).css("visibility","visible")
//      .css("opacity",1)
//    ;
//    $(EXfoot).css("visibility","visible")
//      .css("opacity",1)
//    ;
//    $(EXcome).css("transform","translateX(0px)")
////      .css("position","absolute")
//    ;
////console.log("comevisiset popElement");
////    comevisiset(false);
////    waitforpop(10);
//}
function setEXs(){
    var b=true;
    if((EXmain=$('#main')[0])==null){b=false;}
    else if((EXhead=$('[class^="AppContainer__header-container___"]')[0])==null){b=false;}
    else if((EXfoot=$('[class^="TVContainer__footer-container___"]')[0])==null){b=false;console.log("foot");}
    else if((EXfootcome=$(EXfoot).contents().find('[class*="styles__right-container"]')[0])==null){b=false;console.log("footcome");}
    else if((EXfootcount=$(EXfoot).contents().find('[class*="styles__counter___"]'))==null){b=false;console.log("footcount");}
    else if((EXfootcountview=EXfootcount[0])==null){b=false;console.log("footcountview");}
    else if((EXfootcountcome=EXfootcount[1])==null){b=false;console.log("footcountcome");}
    else if((EXside=$('[class^="TVContainer__side___"]')[0])==null){b=false;console.log("side");}
    else if((EXchli=$('[class*="TVContainer__right-v-channel-list___"]')[0])==null){b=false;console.log("chli");}
    else if((EXinfo=$('[class^="TVContainer__right-slide___"]')[0])==null){b=false;console.log("info");}
    else if((EXcome=$('[class^="TVContainer__right-comment-area___"]')[0])==null){b=false;console.log("come");}
    else if((EXcomesend=$(EXcome).contents().find('[class*="styles__comment-form___"]')[0])==null){b=false;console.log("comesend");}
    else if((EXcomesendinp=$(EXcomesend).contents().find('textarea')[0])==null){b=false;console.log("comesendinp");}
//    else if((EXcomelist0=$($(EXcome).contents().find('[class^="styles__no-contents-text___"]:first')[0]).parent()[0])==null){b=false;console.log("comelist");}
    else if((EXvolume=$('[class^="styles__volume___"]')[0])==null){b=false;console.log("vol");}
    else if((EXobli=$('[class*="TVContainer__tv-container___"]')[0])==null){b=false;console.log("obli");}
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
    if($(EXchli).children('[class*="styles__watch___"]').length==0){b=false;}
    else if((EXwatchingstr=$(EXchli).children('[class*="styles__watch___"]').contents().find('img').prop("alt"))==null){b=false;}
    else if((EXwatchingnum=$(EXobli).contents().find('img[alt='+EXwatchingstr+']').parents().index())==null){b=false;}
    else{
        $(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__watch___"]').index()*85-$(EXside).position().top);
    }
    if(b==true){
console.log("setEX2 ok");
    }else{
console.log("setEX2 retry");
        setTimeout(setEX2,1000);
    }
}
function isComeOpen(){
//    return ($(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
    return $(EXcome).is('[class*="TVContainer__right-slide--shown___"]');
}
function isSlideShown(){
//    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
    return ($(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length>0)?true:false;
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
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]').children();
    var targetvolume=Math.min(92,Math.max(0,Math.floor(92*changeMaxVolume/100)));
    var teku=teki.offset().top+106-targetvolume;
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku);
    setTimeout(otomouseup,100,teku);
    return teki[0].dispatchEvent(teka);
}
function moVol(d){
    if(!EXvolume){return;}
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]').children();
    var orivol=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]').css("height"));
    var targetvolume=Math.min(91,Math.max(0,orivol+d));
    var teku=teki.offset().top+106-targetvolume;
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku);
    setTimeout(otomouseup,100,teku);
    return teki[0].dispatchEvent(teka);
}
function otomouseup(p){
    if(!EXvolume){return;}
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]').children();
    teka.initMouseEvent("mouseup",true,true,window,0,0,0,teki.offset().left+15,p);
    setTimeout(volbar,100);
    return teki[0].dispatchEvent(teka);
}
function otoColor(){
    var jo=$(EXvolume).contents().find('svg');
    if(jo.length==0){return;}
    if(jo.css("fill")=="rgb(255, 255, 255)"){
        jo.css("fill","red");
        setTimeout(otoColor,800);
    }else{
        jo.css("fill","");
    }
}
function otoSize(ts){
    var jo=$(EXvolume).contents().find('svg');
    if(jo.length==0){return;}
    if(jo.css("zoom")=="1"){
        jo.css("zoom",ts);
        setTimeout(otoSize,400);
    }else{
        jo.css("zoom","");
    }
}
function volbar(){
    var jo=$('#forProEndTxt');
    if(jo.filter('.forProEndTxt').length==0){
        jo.prop("class","forProEndTxt");
    }else{
        jo.prop("class","");
        var orivol=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]').css("height"));
        var v=Math.min(92,Math.max(0,orivol));
        var p=Math.min(99,Math.round(100*v/92));
        var q=(v==0)?"mute":(p+"%");
        var w=1+Math.round(309*v/92);
        jo.text("vol "+q);
        $('#forProEndBk').css("width",w+"px");
        setTimeout(volbar,800);
    }
}
function faintcheck2(retrycount,fcd,sw){
//console.log("faintcheck#"+retrycount+",fcd="+fcd);
//    var pwaku = $('[class^="style__overlap___"]'); //動画枠
//  var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
//    if(pwaku[0]&&EXfootcountcome){
    if(EXfootcountcome){
        if(sw<0){
            if(isNaN(parseInt($(EXfootcountcome).text()))){
//console.log("faintcheck cmblockcd="+cmblockcd+"->"+fcd);
                cmblockcd=fcd;
                return;
            }
        }else if(sw>0){
            if(!isNaN(parseInt($(EXfootcountcome).text()))){
//console.log("faintcheck cmblockcd="+cmblockcd+"->"+fcd);
                cmblockcd=fcd;
                return;
            }
        }
    }
    if(retrycount>0){
        setTimeout(faintcheck2,150,retrycount-1,fcd);
    }
}
function faintcheck(fcd,sw){
    if(sw>0){
        faintcheck2(5,Math.max(0,fcd),sw);
    }else if(sw<0){
        faintcheck2(5,Math.min(0,fcd),sw);
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
    if(!isSlideShown()&&!$(EXfootcome).is('[class*="styles__right-container-not-clickable___"]')){
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
//function proFontChange(timepar,titlepar,samepar){
//    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
//    var headlogo=prehoverContents.siblings().first();
//    var parexfootcount=$(EXfootcount).parent();
//    var footlogo=$(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
//    var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
//    var tpro=$("#tProtitle");
//    switch(titlepar){
//        case "windowtopleft":
//        case "headerleft":
//            tpro.css("font-size","medium");
//            headlogo.css("padding-top","9px")
//                .next().css("padding-top","9px")
//            ;
//            break;
/////        case "windowbottomleft":
//        case "footerleft":
//            tpro.css("font-size","medium");
//            footlogo.css("padding-bottom","18px")
//                .next().css("padding-bottom","18px")
//            ;
//            break;
//        case "windowtopright":
//        case "headerright":
//            if(timepar!="windowtop"&&timepar!="header"||samepar=="horizontal"){
//                tpro.css("font-size","medium");
//                prehoverContents.css("padding-top","12px")
//                    .prev().css("padding-top","12px")
//                ;
//            }
//            break;
//    }
////    if(titlepar=="window$(EXhead).css("visibility")=="visible")
//}
function proPositionAllReset(bigtext){
//console.log("proSameUnFix");
    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
    var headlogo=prehoverContents.siblings().first();
    var parexfootcount=$(EXfootcount).parent();
    var footlogo=$(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
    var bsize=(bigtext!==undefined)?bigtext:isProTextLarge;
    var fsize=bsize?"medium":"x-small";
    var tpro=$("#tProtitle");
//    tpro.css("overflow","")
//        .css("width","")
//        .css("text-align","")
    tpro.css("transform","")
        .css("left","")
        .css("right","")
        .css("top","")
        .css("bottom","")
        .css("font-size",fsize)
    ;
//    forpros.css("left","")
//        .css("right","")
    forpros.css("top","")
        .css("bottom","")
        .css("font-size",fsize)
    ;
    prehoverContents.css("margin-top","")
        .css("transform","")
        .css("margin-left","")
        .prev().css("margin-top","")
        .css("transform","")
        .contents().find('li').slice(1).css("margin-left","")
    ;
//console.log("windowTR.pad=0 unfix");
    headlogo.css("margin-top","")
        .next().css("margin-top","")
    ;
//console.log("windowTL.pad=0 unfix");
    parexfootcount.css("margin-bottom","")
        .css("height","")
    ;
    $(EXfootcome).css("border-left","")
        .prev().css("border-right","")
    ;
//console.log("windowBR.pad=0 unfix");
    footlogo.css("margin-bottom","")
        .next().css("margin-bottom","")
    ;
//console.log("windowBL.pad=0 unfix");
//    $(EXfootcome).next('#timerthird').remove();
}
//function proSamePositionFix(){
function proSamePositionFix(inptime,inptitle,inpsame,inpbig){
//    if(!inptime||inptime==""){inptime=($('#settcont').css("display")=="none")?(isTimeVisible?timePosition:""):($('#isTimeVisible').prop("checked")?$('#itimePosition input[type="radio"][name="timePosition"]:checked').val():"");}
//    if(!inptitle||inptitle==""){inptitle=($('#settcont').css("display")=="none")?(isProtitleVisible?protitlePosition:""):($('#isProtitleVisible').prop("checked")?$('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val():"");}
//    if(!inptime||inptime==""){inptime=timePosition;}
//    if(!inptitle||inptitle==""){inptitle=protitlePosition;}
//    var inptime=($('#settcont').css("display")=="none")?(isTimeVisible?timePosition:""):($('#isTimeVisible').prop("checked")?$('#itimePosition input[type="radio"][name="timePosition"]:checked').val():"");
//    var inptitle=($('#settcont').css("display")=="none")?(isProtitleVisible?protitlePosition:""):($('#isProtitleVisible').prop("checked")?$('#iprotitlePosition input[type="radio"][name="protitlePosition"]:checked').val():"");
//    var inpsame=($('#settcont').css("display")=="none")?proSamePosition:$('#iproSamePosition input[type="radio"][name="proSamePosition"]:checked').val();
//console.log("proSameFix time="+inptime+", title="+inptitle+", same="+inpsame);
    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
    var headlogo=prehoverContents.siblings().first();
    var parexfootcount=$(EXfootcount).parent();
    var footlogo=$(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
    var forprot=$("#forProEndTxt");
    var tpro=$("#tProtitle");
    var timeshown=inptime;
    var bigtext=(inpbig!==undefined)?bigtext:isProTextLarge;
    if(timeshown=="header"){
        if($(EXhead).css("visibility")=="visible"){
            timeshown="windowtop";
        }else{
            timeshown="";
        }
    }else if(timeshown=="footer"){
        if($(EXfoot).css("visibility")=="visible"){
            timeshown="windowbottom";
        }else{
            timeshown="";
        }
    }
    var titleshown=inptitle;
    if(titleshown=="headerright"){
        if($(EXhead).css("visibility")=="visible"){
            titleshown="windowtopright";
        }else{
            titleshown="";
        }
    }else if(titleshown=="footerright"){
        if($(EXfoot).css("visibility")=="visible"){
            titleshown="windowbottomright";
        }else{
            titleshown="";
        }
    }
//console.log("fix timeshown:"+timeshown+",titleshown:"+titleshown);
    if(timeshown=="windowtop"&&titleshown=="windowtopright"){
        switch(inpsame){
            case "over":
//                tpro.css("overflow","hidden")
//                    .css("width","310px")
//                    .css("text-align","left")
                tpro.css("right","310px")
                    .css("transform","translateX(100%)")
                ;
                break;
            case "vertical":
//                if(!isInpWinBottom&&$(EXhead).css("visibility")=="hidden"&&isComeOpen()){
//                    tpro.css("overflow","hidden")
//                        .css("width","310px")
//                        .css("text-align","left")
//                    ;
//                    tpro.css("right","310px")
//                        .css("transform","translateX(100%)")
//                    ;
//                }else{
                forpros.css("top",tpro.height()+"px");
                prehoverContents.css("margin-top","")
                    .css("transform","translateX(-310px)")
                    .css("margin-left","12px")
                    .prev().css("margin-top","")
                    .css("transform","translateX(-310px)")
                    .contents().find('li').slice(1).css("margin-left","12px")
                ;
//console.log("windowTR.pad=16 fix");
//                }
                break;
            case "horizontal":
                tpro.css("right","310px");
                break;
            case "horizshort":
                tpro.css("right",(forprot.width()+16)+"px");
                break;
            default:
        }
    }else if(timeshown=="windowbottom"&&titleshown=="windowbottomright"){
        switch(inpsame){
            case "over":
//                tpro.css("overflow","hidden")
//                    .css("width","310px")
//                    .css("text-align","left")
                tpro.css("right","310px")
                    .css("transform","translateX(100%)")
                ;
                break;
            case "vertical":
//                if(isInpWinBottom&&$(EXfoot).css("visibility")=="hidden"&&isComeOpen()){
//                    tpro.css("overflow","hidden")
//                        .css("width","310px")
//                        .css("text-align","left")
//                tpro.css("right","310px")
//                    .css("transform","translateX(100%)")
//                ;
//                }else{
                tpro.css("bottom",forpros.height()+"px");
                parexfootcount.css("margin-bottom","45px")
                    .css("height","unset")
                ;
                $(EXfootcome).css("border-left","1px solid #444")
                    .prev().css("border-right","none")
                ;
//console.log("windowBR.pad=31 fix");
//                }
                break;
            case "horizontal":
                tpro.css("right","310px");
                break;
            case "horizshort":
                tpro.css("right",(forprot.width()+16)+"px");
                break;
            default:
        }
    }else if(timeshown=="commentinputtop"&&titleshown=="commentinputtopright"){
        switch(inpsame){
            case "over":
            case "horizontal":
//        tpro.css("overflow","hidden")
//            .css("width","310px")
//            .css("text-align","left")
                tpro.css("right","")
                    .css("left",0)
//                .css("transform","translateX(100%)")
                ;
                break;
            case "vertical":
                forpros.css("top",tpro.height()+"px");
                break;
            case "horizshort":
                tpro.css("right",(forprot.width()+16)+"px");
                break;
            default:
        }
    }else if(timeshown=="commentinputbottom"&&titleshown=="commentinputbottomright"){
        switch(inpsame){
            case "over":
            case "horizontal":
//        tpro.css("overflow","hidden")
//            .css("width","310px")
//            .css("text-align","left")
                tpro.css("right","")
                    .css("left",0)
//                .css("transform","translateX(100%)")
                ;
                break;
            case "vertical":
                tpro.css("bottom",forpros.height()+"px");
                break;
            case "horizshort":
                tpro.css("right",(forprot.width()+16)+"px");
                break;
            default:
        }
    }
}
function openInfo(sw){
    if(!EXinfo){return;}
    if(sw){
        $(EXinfo).css("transform","translateX(0)");
        proinfoOpened=true; //クリックで解除できるようにする
    }else{
        $(EXinfo).css("transform","");
        proinfoOpened=false;
    }
}
function createProtitle(sw,bt){
    if(!EXcome){return;}
    if(sw==0){
        if($("#tProtitle").length==0){
           var eProtitle = document.createElement("span");
            eProtitle.id="tProtitle";
            eProtitle.setAttribute("style","position:absolute;right:0;font-size:"+(bt?"medium":"x-small")+";padding:0px 8px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:19;background-color:transparent;top:0px;");
            eProtitle.innerHTML="未取得";
            EXcome.insertBefore(eProtitle,EXcome.firstChild);
            //番組名クリックで番組情報タブ開閉
            $("#tProtitle").on("click",function(){
                if(!EXinfo){return;}
                if(!proinfoOpened){
                    setTimeout(openInfo,50,true);
                }else{
                    setTimeout(openInfo,50,false);
                }
            });
        }
    }else if(sw==1){
        var prehoverContents = $('[class*="styles__hover-contents___"]').prev();
        var headlogo=prehoverContents.siblings().first();
        var parexfootcount=$(EXfootcount).parent();
        var footlogo=$(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
        var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
        prehoverContents.css("padding-top","")
            .prev().css("padding-top","")
        ;
        headlogo.css("padding-top","")
            .next().css("padding-top","")
        ;
        footlogo.css("padding-bottom","")
            .next().css("padding-bottom","");
        $("#tProtitle").remove();
    }
}
function setProtitlePosition(timepar,titlepar,samepar,bigpar){
//console.log("setProtitle timepar:"+timepar+", par:"+par+", sub:"+(subfunc?"true":"false"));
    //残り時間との重なり処理はこれが終わってから
//    if(!titlepar||titlepar==""){
//        titlepar=isProtitleVisible?protitlePosition:"";
//    }
//    if(!timepar||timepar==""){
//        timepar=isTimeVisible?timePosition:"";
//    }
//    if(!samepar||samepar==""){
//        samepar=proSamePosition;
//    }
//console.log("setProtitle timepar:"+timepar+", par:"+par+", sub:"+(subfunc?"true":"false"));
    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
    var headlogo=prehoverContents.siblings().first();
    var parexfootcount=$(EXfootcount).parent();
    var footlogo=$(EXfoot).contents().find('[class*="styles__channel-logo___"]').first();
    var tpro=$("#tProtitle");
    var bigtext=(bigpar!==undefined)?bigpar:isProTextLarge;
    var par=titlepar;
    switch(par){
        case "windowtopleft":
        case "windowtopright":
        case "commentinputtopleft":
        case "commentinputtopright":
        case "headerleft":
        case "headerright":
            tpro.css("bottom","")
                .css("top",0)
            ;
            break;
        case "windowbottomleft":
        case "windowbottomright":
        case "commentinputbottomleft":
        case "commentinputbottomright":
        case "footerleft":
        case "footerright":
            tpro.css("top","")
                .css("bottom",0)
            ;
            break;
        default:
    }
    switch(par){
        case "windowtopleft":
        case "windowbottomleft":
        case "commentinputtopleft":
        case "commentinputbottomleft":
        case "headerleft":
        case "footerleft":
            tpro.css("right","")
                .css("left",0)
            ;
            break;
        case "windowtopright":
        case "windowbottomright":
        case "commentinputtopright":
        case "commentinputbottomright":
        case "headerright":
        case "footerright":
            tpro.css("left","")
                .css("right",0)
            ;
            break;
        default:
    }
    switch(par){
        case "windowtopright":
        case "headerright":
            prehoverContents.css("margin-top",(bigtext?14:9)+"px")
                .prev().css("margin-top",(bigtext?14:9)+"px")
//            ;
//console.log("windowTR.pad=9 setTitle("+(subfunc?"sub":"main"));
            break;
        default:
    }
    switch(par){
        case "windowtopleft":
        case "headerleft":
            headlogo.css("margin-top",(bigtext?10:6)+"px")
                .next().css("margin-top",(bigtext?10:6)+"px")
            ;
//console.log("windowTL.pad=18 setTitle("+(subfunc?"sub":"main"));
            break;
        default:
    }
    switch(par){
        case "windowbottomright":
        case "footerright":
            parexfootcount.css("margin-bottom",(bigtext?24:14)+"px")
                .css("height","unset")
            ;
            $(EXfootcome).css("border-left","1px solid #444")
                .prev().css("border-right","none")
            ;
//console.log("windowBR.pad=14 setTitle("+(subfunc?"sub":"main"));
            break;
        default:
    }
    switch(par){
        case "windowbottomleft":
        case "footerleft":
            footlogo.css("margin-bottom",(bigtext?24:14)+"px")
                .next().css("margin-bottom",(bigtext?24:14)+"px")
            ;
//console.log("windowBL.pad=14 setTitle("+(subfunc?"sub":"main"));
            break;
        default:
    }
    switch(par){
        case "windowtopleft":
        case "windowtopright":
        case "windowbottomleft":
        case "windowbottomright":
            if(!$('body').children().is(tpro)){
                tpro.prependTo('body');
            }
            break;
        case "commentinputtopleft":
        case "commentinputtopright":
        case "commentinputbottomleft":
        case "commentinputbottomright":
            if(!$(EXcomesend).children().is(tpro)){
                tpro.prependTo(EXcomesend);
            }
            break;
        case "headerleft":
        case "headerright":
            if(!$(EXhead).children().is(tpro)){
                tpro.prependTo(EXhead);
            }
            break;
        case "footerleft":
        case "footerright":
            if(!$(EXfoot).children().is(tpro)){
                tpro.prependTo(EXfoot);
            }
            break;
        default:
    }
}
function createTime(sw,bt){
//console.log("createTime:"+sw);
    if(!EXcome){return;}
    if(sw==0){
        var fsize=bt?"medium":"x-small";
        if($("#forProEndBk").length==0){
            var eForProEndBk = document.createElement("span");
            eForProEndBk.id="forProEndBk";
            eForProEndBk.setAttribute("style","position:absolute;right:0;font-size:"+fsize+";padding:0px 5px;background-color:rgba(255,255,255,0.2);z-index:18;width:310px;top:0px;");
            eForProEndBk.innerHTML="&nbsp;";
            EXcome.insertBefore(eForProEndBk,EXcome.firstChild);
        }
        if($("#forProEndTxt").length==0){
           var eForProEndTxt = document.createElement("span");
            eForProEndTxt.id="forProEndTxt";
//            eForProEndTxt.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:19;width:310px;background-color:rgba(255,255,255,0.1);border-left:1px solid rgba(255,255,255,0.4);top:0px;");
            eForProEndTxt.setAttribute("style","position:absolute;right:0;font-size:"+fsize+";padding:0px 5px 0px 11px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:19;background-color:transparent;top:0px;");
            eForProEndTxt.innerHTML="&nbsp;";
            EXcome.insertBefore(eForProEndTxt,EXcome.firstChild);
            //残り時間クリックで設定ウィンドウ開閉
            $("#forProEndTxt").prop("class","forProEndTxt")
                .on("click",function(){
               if($("#settcont").css("display")=="none"){
                    openOption(isInpWinBottom?3:2);
                }else{
                    closeOption();
                }
            });
        }
        if($("#proTimeEpNum").length==0){
            var eproTimeEpNum = document.createElement("div");
            eproTimeEpNum.id="proTimeEpNum";
            eproTimeEpNum.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px;background-color:transparent;z-index:17;width:310px;top:0px;text-align:center;color:rgba(255,255,255,0.3);display:flex;flex-direction:row;");
            eproTimeEpNum.innerHTML='<div style="border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;">&nbsp;</div><div style="border-left:1px solid rgba(255,255,255,0.2);flex:1 0 1px;">&nbsp;</div>';
            EXcome.insertBefore(eproTimeEpNum,EXcome.firstChild);
        }
    }else if(sw==1){
        var prehoverContents = $('[class*="styles__hover-contents___"]').prev();
        var parexfootcount=$(EXfootcount).parent();
        var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
        prehoverContents.css("padding-top","")
            .prev().css("padding-top","")
        ;
        parexfootcount.css("padding-bottom","");
//        $(EXfootcome).next('#timerthird').remove();
        $("#forProEndBk,#forProEndTxt,#proTimeEpNum").remove();
    }
}
function setTimePosition(timepar,titlepar,samepar,bigpar){
//console.log("setTimePosi par:"+par+", titlepar:"+titlepar+", sub:"+(subfunc?"true":"false"));
//    if(!timepar||timepar==""){
//        timepar=isTimeVisible?timePosition:"";
//    }
//    if(!titlepar||titlepar==""){
//        titlepar=isProtitleVisible?protitlePosition:"";
//    }
//    if(!samepar||samepar==""){
//        samepar=proSamePosition;
//    }
//    if(!par||par==""){par=timePosition;}
//    if(!titlepar||titlepar==""){titlepar=protitlePosition;}
//console.log("setTimePosi par:"+par+", titlepar:"+titlepar+", sub:"+(subfunc?"true":"false"));
    var prehoverContents = $('[class*="styles__hover-contents___"]').parent();
    var parexfootcount=$(EXfootcount).parent();
    var forpros=$("#forProEndTxt,#forProEndBk,#proTimeEpNum");
    var bigtext=(bigpar!==undefined)?bigpar:isProTextLarge;
    var par=timepar;
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
            prehoverContents.css("margin-top",(bigtext?14:9)+"px")
                .prev().css("margin-top",(bigtext?14:9)+"px")
            ;
//console.log("windowTR.pad=9 setTime("+(subfunc?"sub":"main"));
            break;
        default:
    }
    switch(par){
        case "windowbottom":
        case "footer":
            parexfootcount.css("margin-bottom",(bigtext?24:14)+"px")
                .css("height","unset")
            ;
            $(EXfootcome).css("border-left","1px solid #444")
                .prev().css("border-right","none")
            ;
//console.log("windowBR.pad=14 setTime("+(subfunc?"sub":"main"));
//            if($(EXfootcome).next('#timerthird').length==0){
//                $('<div id="timerthird" style="position:absolute;bottom:0;right:207px;height:15px;width:143px;color:white;font-size:x-small;letter-spacing:1px;padding:0px 5px;border-right:1px solid #444;"></div>').insertAfter(EXfootcome);
//                $(EXfootcome).next('#timerthird').html('&nbsp;');
//            }
            break;
        default:
    }
    switch(par){
        case "windowtop":
        case "windowbottom":
            if(!$('body').children().is(forpros)){
                forpros.prependTo('body');
            }
            break;
        case "commentinputtop":
        case "commentinputbottom":
            if(!$(EXcomesend).children().is(forpros)){
                forpros.prependTo(EXcomesend);
            }
            break;
        case "header":
            if(!$(EXhead).children().is(forpros)){
                forpros.prependTo(EXhead);
            }
        case "footer":
            if(!$(EXfoot).children().is(forpros)){
                forpros.prependTo(EXfoot);
            }
        default:
    }
}
//function waitforpop(retrycount){
//    if($(EXhead).css("visibility")=="visible"){
////console.log("comevisiset waitforhide");
//        comevisiset(false);
//    }else if(retrycount>0){
//        setTimeout(waitforpop,100,retrycount-1);
//    }
//}
//function waitforhide(retrycount){
//    if($(EXhead).css("visibility")=="hidden"){
////console.log("comevisiset waitforhide");
//        comevisiset(false);
//    }else if(retrycount>0){
//        setTimeout(waitforhide,100,retrycount-1);
//    }
//}
function setOptionHead(){
    $('head>link[title="usermade"]').remove();
    var t="";
    //コメントのZ位置を上へ
    if(isMovingComment){
        t+='[class="movingComment"]{z-index:5;}';
    }
    //投稿ボタン削除（入力欄1行化はこの下のコメ見た目のほうとoptionElementでやる）
    if(isCustomPostWin){
//        t+='[class^="styles__opened-textarea-wrapper___"]+div{display:none;}';
        t+='[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]>[class*="styles__etc-modules___"]{display:none;}';
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
    t+='[class^="TVContainer__right-comment-area___"] textarea{background-color:'+uc+';color:'+tc+';}';
    t+='[class^="TVContainer__right-comment-area___"] textarea+*{background-color:'+cc+';color:'+tc+';}';
    t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{background-color:'+bc+';color:'+tc+';}';
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

    //コメ欄スクロールバー非表示
    if(isInpWinBottom){//コメ逆順の時は対象が逆になる
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]{overflow:hidden;}';
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div{';
    }else{
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div{overflow:hidden;}';
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]{';
    }
    if(isHideOldComment){
        t+='overflow:hidden;';
    }else{
        t+='overflow-x:hidden;overflow-y:scroll;';
    }
    t+='}';
    //ユーザースクリプトのngconfigのz-index変更
    t+='#NGConfig{z-index:20;}';
    //コメント欄を常に表示
    if(isSureReadComment){
//        t+='[class^="TVContainer__right-comment-area___"]{transform:translateX(0);}';
        t+='[class^="TVContainer__right-list-slide___"]{z-index:11;}'; //コメ欄は10
        t+='[class^="TVContainer__right-slide___"]{z-index:11;}';
    }
    if(isInpWinBottom){ //コメ入力欄を下
        t+='[class^="TVContainer__right-comment-area___"]>*{display:flex;flex-direction:column-reverse;}';
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]{display:flex;flex-direction:column;justify-content:flex-end;border-top:1px solid '+vc+';border-bottom:1px solid '+vc+';}';
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div{display:flex;flex-direction:column-reverse;}';
    }
    if(isCustomPostWin){ //1行化
        t+='[class^="TVContainer__right-comment-area___"] textarea{height:18px!important;}';
        t+='[class^="TVContainer__right-comment-area___"] textarea+*{height:18px!important;}';
    }
    if(isCommentPadZero){ //コメ間隔詰め
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{padding-top:0px;padding-bottom:0px;}';
    }
    if(isCommentTBorder){ //コメ区切り線
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{border-top:1px solid '+vc+';}';
        if(isInpWinBottom){ //先頭コメ(一番下)の下にも線を引く
            t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div:first{border-bottom:1px solid '+vc+';}';
        }
    }
    if(isCommentWide){ //コメント部分をほんの少し広く
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div{padding-right:4px;padding-left:8px;}';
        t+='[class^="TVContainer__right-comment-area___"] [class^="styles__comment-list-wrapper___"]>div>div>p[class^="styles__message__"]{width:'+(isHideOldComment?260:244)+'px;}';
    }
    //各パネルの常時表示 隠す場合は積極的にelement.cssに隠す旨を記述する(fade-out等に任せたり単にcss除去で済まさない)
    //もしくは常時隠して表示する場合に記述する、つまり表示切替の一切を自力でやる
    //（コメ欄常時表示で黒帯パネルの表示切替が発生した時のレイアウト崩れを防ぐため）
    t+='[class^="AppContainer__header-container___"]{visibility:visible;opacity:1;}';
    t+='[class^="TVContainer__footer-container___"]{visibility:visible;opacity:1;}';
    t+='[class^="TVContainer__side___"]{transform:translateY(-50%);}';
//    t+='[class^="TVContainer__right-list-slide___"]{transform:translateX(0);}';
//    t+='[class^="TVContainer__right-slide___"]{transform:translateX(0);}';

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
    setProSamePosiChanged();
    $(EXfootcome).css("pointer-events","auto");
console.log("setOptionElement ok");
}
function usereventMouseover(){
    //マウスオーバーで表示させる場合はカウントリセット
    if(!settings.isAlwaysShowPanel&&(!isComeOpen()||isOpenPanelwCome)){
        if(forElementClose<4){
            forElementClose=5;
//console.log("popElement usereventMouseover");
            popElement({head:true,foot:true,side:true});
        }
    }
//    if(isOpenPanelwCome&&!settings.isAlwaysShowPanel&&isComeOpen()){
//        //各要素を隠すまでのカウントをマウスオーバーで5にリセット
//        if(forElementClose<4){
//            forElementClose=5;
//console.log("popElement usereventMouseover");
//            popElement(); //各要素を表示
//        }
//    }else if(popElemented){
//        unpopElement(); //popElementの設定を消す
//    }
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
    $('.manualblock').remove();
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
    if($('#manualblockrd').length==0){
        $('body').css("overflow-y","hidden");
        $('<div id="manualblockrd" class="manualblock"></div>').appendTo('body');
        $('#manualblockrd').html('&nbsp;')
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
function usereventSideChliButClick(){
//番組情報枠と被らないようにする
    popElement({channellist:false});
    hideElement({channellist:false});
    hideElement({programinfo:true});
//    $(EXchli.parentElement).css("z-index",12);
//    $(EXinfo).css("z-index",11);
}
function usereventFootInfoButClick(){
    popElement({programinfo:false});
    hideElement({programinfo:false});
    hideElement({channellist:true});
//    $(EXinfo).css("z-index",12);
//    $(EXchli.parentElement).css("z-index",11);
}
function setOptionEvent(){
//自作要素のイベントは自作部分で対応
    if(eventAdded){return;}
    var butfs;
    var pwaku;
    if(((butfs=$('button[class*="styles__full-screen___"]')[0])==null)||((pwaku=$('[class^="style__overlap___"]')[0])==null)||!EXcome){
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
        if(isSureReadComment){
            comeclickcd=2;
        }
        if(proinfoOpened){
            setTimeout(openInfo,50,false);
        }
    });
    //マウスホイール無効か音量操作
    window.addEventListener("mousewheel",function(e){
        if (isVolumeWheel&&e.target.className.indexOf("style__overlap___") != -1){//イベントが映像上なら
            if(EXvolume&&$(EXvolume).contents().find('svg').css("zoom")=="1"){
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
        }else if(!settings.isAlwaysShowPanel&&!isOpenPanelwCome){
            hideElement({head:true,foot:true,side:true});
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
                if(posi!=""&&$('#manualblock'+posi).length==0){
                    $('body').css("overflow-y","hidden");
                    $('<div id="manualblock'+posi+'" class="manualblock"></div>').appendTo('body');
                    $('#manualblock'+posi).html('&nbsp;')
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
            $('.manualblock').remove();
//            if($('body:first>.manualblock').length==0){
            $('body').css("overflow-y","");
//            }
        }
    },true);
    $(EXfootcome).on("mousemove",usereventFCMousemove);
//    $(EXfootcome).on("mouseout",usereventFCMouseout);
    $(EXfootcome).on("mouseleave",usereventFCMouseleave);
    //放送中番組一覧を開く
    $(EXside).contents().find('button').eq(1).on("click",usereventSideChliButClick);
    //番組情報を開く
    $(EXfootcome).prev().on("click",usereventFootInfoButClick);
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
//    if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
//        $(EXfootcome).next('#timerthird').html('&nbsp;');
//    }
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
        if(EXcome){
            var btn = $(EXcome).contents().find('[class^="styles__continue-btn___"]'); //新着コメのボタン
            if (btn.length>0) {
                //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
                btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
            }
        }
        //映像のtopが変更したらonresize()実行
        if(settings.isResizeScreen && $("object").parent().offset().top !== newtop) {
            onresize();
        }
//        //黒帯パネル表示のためマウスを動かすイベント発火
//        if (settings.isAlwaysShowPanel) {
//            triggerMouseMoving();
//            if(!isSureReadComment){
//console.log("popHeader 1s");
//                popHeader();
//            }
//        }
        //音量が最大なら設定値へ自動変更
        if(changeMaxVolume<100&&$('[class^="styles__highlighter___"]').css("height")=="92px"){
            if($(EXvolume).contents().find('svg').css("fill")=="rgb(255, 255, 255)"){
                otoColor();
            }
            otosageru();
        }
        //コメント取得
        var comments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
        if(EXcomelist&&isComeOpen()){
            var comeListLen = EXcomelist.childElementCount;
            var d=comeListLen-commentNum;
//            if(comeListLen>commentNum){ //コメ増加あり
//                if(!comeRefreshing||!isSureReadComment){
            if(d>0){ //コメ増加あり
                if(!comeRefreshing){ //isSureReadCommentの判定が必要な理由を失念。
                    if(isMovingComment&&commentNum>0){
//                        for(var i=Math.min(movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
//                            putComment(comments[i].innerHTML);
                        for(var i=0;i<d;i++){
                            putComment(comments[d-i-1].innerHTML,i,d);
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
//                if(isSureReadComment&&commentNum>Math.max(comeHealth+20,sureReadRefreshx)&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0&&$(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==0){
                if(isSureReadComment&&commentNum>Math.max(comeHealth+20,sureReadRefreshx)&&!$(EXfootcome).is('[class*="styles__right-container-not-clickable___"]')&&$(EXcome).siblings('[class*="TVContainer__right-slide--shown___"]').length==0){
                    //コメ常時表示 & コメ数>設定値 & コメ開可 & 他枠非表示
                    comeRefreshing=true;
//                    commentNum=0;
                    $('[class^="style__overlap___"]').trigger("click");
                    fastRefreshing();
                }
            }else if(comeListLen<commentNum){
                commentNum=0;
                comeHealth=100;
            }
        }

        //流れるコメントのうち画面外に出たものを削除
//        var arMovingComment = $('[class="movingComment"]');
//        if(arMovingComment.length>0){
        if(isMovingComment){
            var arMovingComment = $('.movingComment');
            for (var j = arMovingComment.length-1;j>=0;j--){
                if(arMovingComment.eq(j).offset().left + arMovingComment.eq(j).width()<=0){
                    arMovingComment[j].remove();
                }
            }
//putCommentArrayにて設置時に対応
//            if(arMovingComment.length>movingCommentLimit){
//                //流れるコメント過多の場合は消していく
//                arMovingComment.slice(0,-movingCommentLimit).remove();
//            }
        }
//        //流れるコメント過多の場合は消していく
//        if (isMovingComment){
//            var comments = $(".movingComment");
//            if (comments.length > movingCommentLimit){
//                for (var j=0;j < comments.length-movingCommentLimit; j+=1){
//                    comments[j].remove();
//                }
//            }
//        }

//        var countElements = $('[class^="TVContainer__footer___"] [class*="styles__count___"]');
        //var viewCount = countElements[0].innerHTML
        //var commentCount = countElements[1].innerHTML

        //2つに分かれていたのを統合
        //この後ろで結局コメ数チェックするのでここでついでに実行
        if(EXfootcountcome){
            var comeContStr=EXfootcountcome.innerHTML;
            var commentCount;
            if(isNaN(parseInt(comeContStr))){ //今コメント無効
                commentCount=-1;
            }else{
                commentCount=parseInt(comeContStr);
            }
            if(isCMBlack||isCMsoundoff||CMsmall<100){
                if(commentCount<0&&comeLatestCount>=0){
                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
                    if(cmblockcd<=0){
                        faintcheck(cmblockcd,1);
                        cmblockcd=cmblockia;
                    }
                }else if(commentCount>=0&&comeLatestCount<0){
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
                    if(cmblockcd>=0){
                        faintcheck(cmblockcd,-1);
                        cmblockcd=cmblockib;
                    }
                }
            }else{
            }
            comeLatestCount=commentCount;
        }
//        //コメント数無効の時画面真っ黒
//        var faintchecked=false;
//        if (isCMBlack) {
//            var pwaku = $('[class^="style__overlap___"]'); //動画枠
//            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
//            if(pwaku[0]&&come[1]){
//                //切替時のみ動作
//                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
//                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
//                    if(cmblockcd<=0){
//                      cmblockcd=cmblockia;
//                    }
//                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
//                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
//                    if(!faintchecked){
//                      faintchecked=true;
//                      faintcheck(cmblockcd);
//                    }
//                    cmblockcd=cmblockib;
//                }
//            }
//        }
//
//        //コメント数無効の時音量ミュート
//        if (isCMsoundoff){
//            var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]'); //高さが音量のやつ
//            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
//            if (valvol[0]&&come[1]){
//                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
//                    //今コメント数無効で直前がコメント数有効(=コメント数無効開始?)
//                    if(cmblockcd<=0){
//                      cmblockcd=cmblockia;
//                    }
//                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
//                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
//                    if(!faintchecked){
//                      faintchecked=true;
//                      faintcheck(cmblockcd);
//                    }
//                    cmblockcd=cmblockib;
//                }
//            }
//        }
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
//        if(isNaN(parseInt($(EXfootcountcome).text()))){
//            comeLatestCount=-1;
//        }else{
//            comeLatestCount=parseInt($(EXfootcountcome).text());
//        }

        //残り時間表示
        if (isTimeVisible&&EXinfo){
//            var eProTime = $('[class^="TVContainer__right-slide___"] [class^="styles__time___"]');
            var eProTime = $(EXinfo).contents().find('[class^="styles__time___"]');
            var reProTime = /(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?[　 ]*\~[　 ]*(?:(\d{1,2})[　 ]*[月\/][　 ]*(\d{1,2})[　 ]*日?)?[　 ]*(?:[（\(][月火水木金土日][）\)])?[　 ]*(\d{1,2})[　 ]*[時:：][　 ]*(\d{1,2})[　 ]*分?/;
            var arProTime;
            if(eProTime.length>0&&(arProTime=reProTime.exec(eProTime[0].textContent))!=null){
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
//                strProEnd = (("0"+Math.floor(forProEnd/3600000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%3600000)/60000)).slice(-2)+" : "+("0"+Math.floor((forProEnd%60000)/1000)).slice(-2)).replace(/^00?( : )?0?0?( : )?0?/,"");
                strProEnd = (("0"+Math.floor(forProEnd/3600000)).slice(-2)+"："+("0"+Math.floor((forProEnd%3600000)/60000)).slice(-2)+"："+("0"+Math.floor((forProEnd%60000)/1000)).slice(-2)).replace(/^[0：]*/,"");
            }
            if($("#forProEndTxt").filter(".forProEndTxt").length>0){
                $("#forProEndTxt").filter(".forProEndTxt").text(strProEnd);
                $("#forProEndBk").css("width",((forProEnd>0)?Math.floor(310*forProEnd/proLength):310)+"px");
            }
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
                //黒パネルを隠す
                hideElement({head:true,foot:true,side:true});
//                unpopElement();
//                $(EXside).css("transform","");
//                $(EXhead).css("visibility","")
//                  .css("opacity","")
//                ;
//                $(EXfoot).css("visibility","")
//                  .css("opacity","")
//                ;
//                waitforhide(10);
            }
        }

        //コメント位置のTTLを減らす
//var ttlmonitora="0:"
//var ttlmonitorb="1:"
        for(var i=0;i<comeLatestLen;i++){
//            ttlmonitora+=" "+("...."+comeLatestPosi[i][0]).slice(-4);
//            ttlmonitorb+=" "+("...."+comeLatestPosi[i][1]).slice(-4);
            if(comeLatestPosi[i][1]>0){
                comeLatestPosi[i][1]-=1;
                if(comeLatestPosi[i][1]<=0){
                    comeLatestPosi[i][0]=0;
                }
            }
        }

//一時設定画面を開いた時に定期実行を開始するように変更
//        //一時設定画面の情報更新
//        if($('body:first>#settcont').css("display")!="none"){
//            optionStatsUpdate(false);
//        }
        //番組タイトルの更新
        if(isProtitleVisible&&EXinfo){
            var jo=$(EXinfo).contents().find('h2');
            if(jo.length>0){
                if($('#tProtitle').text()!=jo.first().text()){
                    proTitle=jo.first().text();
                    $('#tProtitle').text(proTitle);
                }
            }
        }
//console.log(ttlmonitora);
//console.log(ttlmonitorb);

//無変化時のカラ実行を防ぐため、黒パネルの表示切替は全て自力で行う
//        //コメ欄表示調整（黒帯が自動で閉じた時に崩れるのを直す）
//        setTimeout(comevisiset,500,false);


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
        bginfo=[0,[],-1,-1];
        endCM();
        checkUrlPattern(currentLocation);
        proStart=new Date();
        proEnd=new Date();
        proTitle="未取得";
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
//                if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
//                    $(EXfootcome).next('#timerthird').text('CM>');
//                }
            }
        }else{
//            if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
//                $(EXfootcome).next('#timerthird').html('&nbsp;');
//            }
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
//                if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
//                    $(EXfootcome).next('#timerthird').text('CM');
//                }
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
//                    if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0&&bginfo[0]>0){
//                        $(EXfootcome).next('#timerthird').html('&nbsp;');
//                    }
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
//            if(EXfootcome&&$(EXfootcome).next('#timerthird').length>0){
//                $(EXfootcome).next('#timerthird').text('>CM');
//            }
        }
    }
});
