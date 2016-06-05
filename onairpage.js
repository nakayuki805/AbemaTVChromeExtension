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
var isEnterSubmit = false; //エンターでコメント送信(無効にしていてもShift+エンターで送信できます。)
var isHideOldComment = false; //古いコメントを非表示
var isCMBlack = false; //コメント数無効(CommentMukou)の時ずっと画面真っ黒
var isCMBkTrans = false; //コメント数無効の時ずっと画面真っ黒を少し透かす
var isCMsoundoff = false; //コメント数無効の時ずっと音量ミュート
var CMsmall=1; //コメント数無効の時ずっと映像縮小
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
var sureReadRefresh=200; //コメ欄開きっ放しの時にコメ数がこれ以上ならコメ欄を自動開閉する
settings.isAlwaysShowPanel = false; //黒帯パネルを常に表示する
var isMovieResize = false; //映像を枠に合わせて縮小

console.log("script loaded");
//window.addEventListener(function () {console.log})
//設定のロード
if (chrome.storage) {
    chrome.storage.local.get(function (value) {
        $.extend(settings, value);
        settings.isResizeScreen = value.resizeScreen || false;
        settings.isDblFullscreen = value.dblFullscreen || false;
        isEnterSubmit = value.enterSubmit || false;
        isHideOldComment = value.hideOldComment || false;
        isCMBlack = value.CMBlack || false;
        isCMBkTrans = value.CMBkTrans || false;
        isCMsoundoff = value.CMsoundoff || false;
        CMsmall = Math.max(1,(value.CMsmall || CMsmall));
        isMovingComment = value.movingComment || false;
        settings.movingCommentSecond = value.movingCommentSecond || settings.movingCommentSecond;
        movingCommentLimit = value.movingCommentLimit || movingCommentLimit;
        isMoveByCSS =　value.moveByCSS || false;
        isComeNg = value.comeNg || false;
        isComeDel = value.comeDel || false;
        fullNg = value.fullNg || fullNg;
        isInpWinBottom = value.inpWinBottom || false;
        isCustomPostWin = value.customPostWin || false;
        isCancelWheel = value.cancelWheel || false;
        isVolumeWheel = value.volumeWheel || false;
        changeMaxVolume = Math.min(100,Math.max(0,(value.changeMaxVolume || changeMaxVolume)));
        isTimeVisible = value.timeVisible || false;
        isSureReadComment = value.sureReadComment || false;
        sureReadRefresh = Math.max(101,(value.sureReadRefresh || sureReadRefresh));
        isMovieResize = value.movieResize || false;
        settings.isAlwaysShowPanel = value.isAlwaysShowPanel || false;
    });
}

var currentLocation = window.location.href;
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
var EXcomesendbut;
var EXcomecont;
var EXcomelist0;
var EXobli;
var EXwatchingnum;
var EXwatchingstr;
var EXvolume;
var comeclickcd=2; //コメント欄を早く開きすぎないためのウェイト
var cmblockia=1; //コメント欄が無効になってからCM処理までのウェイト(+1以上)
var cmblockib=-1; //有効になってから解除までのウェイト(-1以下)
var cmblockcd=0; //カウント用
var comeRefreshing=false; //コメ欄自動開閉中はソートを実行したいのでコメント更新しない用

function onresize() {
    if (settings.isResizeScreen) {
        var obj = $("object").parent(),
            wd = window.innerWidth,
            hg = window.innerHeight,
            wdbyhg = hg*16/9,
            newwd,
            newhg,
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
        obj.css("left", ((wd-newwd)/2)+"px");
        obj.css("top", newtop+"px");
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
        var fullscTarget = document.body;
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
    ngedcome = ngedcome.replace(/[！\!]+/g,"！");
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
//    var butvol=$('[class*="styles__volume___"] svg'); //音量ボタン
//    var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]'); //高さが音量のやつ
    if(!EXvolume){
      return;
    }
    var butvol=$(EXvolume).contents().find('svg:first');
    var valvol=$(EXvolume).contents().find('[class^="styles__highlighter___"]:first');
    var evt=document.createEvent("MouseEvents");
    evt.initEvent("click",true,true);
    valvol=parseInt(valvol[0].style.height);
    if (isSound) {
        //ミュート解除
        //音量0ならボタンを押す
        if(valvol==0){
            butvol[0].dispatchEvent(evt);
        }
    } else {
        //ミュート
        //音量0でないならボタンを押す
        if(valvol!=0){
            butvol[0].dispatchEvent(evt);
        }
    }
}
//画面を真っ暗、透過する関数 0:無 1:半分透過 2:すべて透過 3:真っ黒
function screenBlackSet(type) {
    var pwaku = $('[class^="style__overlap___"]'); //動画枠
    if (type == 0) {
        pwaku[0].removeAttribute("style");
    } else if (type == 1) {
        var w=(EXobli&&EXwatchingnum)?$(EXobli.children[EXwatchingnum]).height():window.innerHeight;
        w=w/2;
        var p=(EXobli)?parseInt($(EXobli).css("padding-top")):0;
        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+(w+p)+"px;");
    } else if (type == 2) {
        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7)");
    } else if (type == 3) {
        pwaku[0].setAttribute("style","background-color:black;");
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
function openOption(){
    var settcontjq = $("#settcont");
    settcontjq.css("display","block");
    var settconttop = settcontjq.offset().top;
    if (settconttop < 0){//設定ウィンドウが画面からはみ出したときにスクロールできるように
        settcontjq.height(settcontjq.height() + settcontjq.offset().top).css("overflow-y", "scroll");
    }
    //設定ウィンドウにロード
    $("#isResizeScreen").prop("checked", settings.isResizeScreen);
    $("#isDblFullscreen").prop("checked", settings.isDblFullscreen);
    $("#isEnterSubmit").prop("checked", isEnterSubmit);
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
    $("#sureReadRefresh").val(sureReadRefresh);
    $("#isAlwaysShowPanel").prop("checked", settings.isAlwaysShowPanel);
    $("#isMovieResize").prop("checked", isMovieResize);
}
function closeOption(){
    $("#settcont").css("display","none");
}
function delayset(){
    //シングルクリックで真っ黒を解除
    var pwaku=$('[class^="style__overlap___"]');
    setEXs(30);
//    if(pwaku[0]&&slidecont[0]){
    if(pwaku[0]&&EXobli){
        pwaku[0].addEventListener("click",function(){
//            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            var come = $(EXfootcountcome);
//            if(come[1]){
//                if(isNaN(parseInt(come[1].innerHTML))){
                if(isNaN(parseInt(come.text()))){
                    //コメント数無効の時は切り替えする
                    if(pwaku[0].hasAttribute("style")){
                        screenBlackSet(0);
                    }else{
                        if(isCMBkTrans){
                            screenBlackSet(1);
                        }else{
                            screenBlackSet(3);
                        }
                    }
                }else{
                    //コメント数有効の時は切替しない(真っ黒になっちゃった時の解除用)
                    if(pwaku[0].hasAttribute("style")){
                        screenBlackSet(0);
                    }else{
                        //if(isCMBkTrans){
                        //    pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+Math.floor(window.innerHeight/2)+"px;");
                        //}else{
                        //    pwaku[0].setAttribute("style","background-color:black;");
                        //}
                    }
                }
//            }
        },false);
//    var slidecont = $('[class^="TVContainer__side___"]');
        var slidecont = EXside
        //設定ウィンドウ・開くボタン設置
        //中身は参照でなくここに直接記述した(ローカルのoption.htmlが参照できなかった)
        var optionbutton = document.createElement("div");
        optionbutton.id = "optionbutton";
        optionbutton.setAttribute("style","width:40px;height:60px;background-color:gray;opacity:0.5;");
        optionbutton.innerHTML = "&nbsp;";
        var settcont = document.createElement("div");
        settcont.id = "settcont";
        //設定ウィンドウの中身
//        //ただちに反映できなかった入力欄一行化は省いたけど、やる気になれば多分反映できる（これを書いた人にその気が無かった）
//        //ただちには反映できなかったけどやる気になったコメ欄非表示切替は反映できた
        //settcont.innerHTML = "<input type=checkbox id=isResizeScreen>:ウィンドウサイズに合わせて映像の端が切れないようにリサイズ<br><input type=checkbox id=isDblFullscreen>:ダブルクリックで全画面表示に切り替え　※プレーヤーの全画面ボタンの割り当てには反映されません<br><input type=checkbox id=isEnterSubmit>:エンターでコメント送信<br><input type=checkbox id=isHideOldComment>:古いコメントを非表示(コメント欄のスクロールバーがなくなります。)<br><!--<input type=checkbox id=isCMBlack>:コメント数無効の時画面真っ黒<br><input type=checkbox id=isCMBkTrans>:↑を下半分だけ少し透かす<br><input type=checkbox id=isCMsoundoff>:コメント数無効の時音量ミュート<br>--><input type=checkbox id=isMovingComment>:新着コメントをあの動画サイトのように横に流す<br>↑のコメントの速さ(2pxあたりのミリ秒を入力、少ないほど速い):<input type=number id=movingCommentSecond><br>↑のコメントの同時表示上限:<input type=number id=movingCommentLimit><br><input type=checkbox id=isComeNg>:流れるコメントから規定の単語を除去(顔文字,連続する単語など)<br><input type=checkbox id=isComeDel>:以下で設定した単語が含まれるコメントは流さない(1行1つ、/正規表現/i可、//コメント)<br><textarea id=elmFullNg rows=3 cols=40 wrap=off></textarea><br><input type=checkbox id=isInpWinBottom>:コメント入力欄の位置を下へ・コメント一覧を逆順・下へスクロール<br><input type=checkbox id=isCustomPostWin disabled>:投稿ボタン削除・入力欄1行化　※この設定はここで変更不可<br><input type=checkbox id=isCancelWheel>:マウスホイールによる番組移動を止める<br><input type=checkbox id=isVolumeWheel>:マウスホイールによる番組移動を音量操作へ変更する<br>音量が最大(100)の場合は以下へ自動変更する:<input type=number id=changeMaxVolume><br><input type=checkbox id=isTimeVisible>:コメント入力欄の近くに番組残り時間を表示<br><input type=checkbox id=isSureReadComment disabled>:常にコメント欄を表示する　※この設定はここで変更不可<br><input type=checkbox id=isAlwaysShowPanel disabled>:常に黒帯パネルを表示する　※この設定はここで変更不可<br><input type=checkbox id=isMovieResize>:映像を枠に合わせて縮小する<br><br><input type=button id=saveBtn value=一時保存><br>※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<br>";
        settcont.innerHTML = generateOptionHTML(false) + "<br><input type=button id=saveBtn value=一時保存> <input type=button id=closeBtn value=閉じる><br>※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<br>";
        settcont.style = "width:600px;position:absolute;right:40px;bottom:-100px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:12;";
//        if (slidecont[0]){ //画面右に設定ウィンドウ開くボタン設置
//            slidecont[0].appendChild(optionbutton);
//            slidecont[0].appendChild(settcont); //設定ウィンドウ設置
//        }
        slidecont.appendChild(optionbutton);
        slidecont.appendChild(settcont); //設定ウィンドウ設置
        if($(EXside).children("#settcont").position().top<0){ //設定画面が上にはみ出てたら上ピッタリにする
          var b=$(EXside).children("#settcont").css("bottom")
            .css("bottom",b+$(EXside).children("#settcont").position().top)
          ;
        }
        $("#CommentMukouSettings").hide();
        $("#optionbutton").on("click",function(){
            if($("#settcont").css("display")=="none"){
                openOption();
            }else{
                closeOption();
            }
        });
        $("#closeBtn").on("click", closeOption);
        $("#saveBtn").on("click",function(){
            settings.isResizeScreen = $("#isResizeScreen").prop("checked");
            settings.isDblFullscreen = $("#isDblFullscreen").prop("checked");
            isEnterSubmit = $("#isEnterSubmit").prop("checked");
            isHideOldComment = $("#isHideOldComment").prop("checked");
            isCMBlack = $("#isCMBlack").prop("checked");
            isCMBkTrans = $("#isCMBkTrans").prop("checked");
            isCMsoundoff = $("#isCMsoundoff").prop("checked");
            CMsmall = Math.max(1,$("#CMsmall").val());
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
            sureReadRefresh = Math.max(101,$("#sureReadRefresh").val());
            isMovieResize = $("#isMovieResize").prop("checked");
            settings.isAlwaysShowPanel = $("#isAlwaysShowPanel").prop("checked");
//            var hideCommentParam = 142;
//            if (isCustomPostWin){
//                hideCommentParam=64;
//            }
////            var comeForm = $('[class*="styles__comment-form___"]');
//            var comeForm = $(EXcomesend);
            var comeList = $(commentListParentSelector);
            if(isHideOldComment){
                comeList.css("overflow-x","")
                  .css("overflow-y","")
                  .css("overflow","hidden")
                ;
            }else{
                comeList.css("overflow","")
                  .css("overflow-x","hidden")
                  .css("overflow-y","scroll")
                ;
            }
            copyCome();
//            var contCome = $('[class^="TVContainer__right-comment-area___"]');
//            var contCome = $(EXcome);
//            if(beforeInpWinBottom!=isInpWinBottom){ //ソート
//                for(var i=0;i<EXcomelist.childElementCount;i++){
//                    EXcomelist.insertBefore(EXcomelist.children[i],EXcomelist.firstChild);
//                }
//            }
//console.log("delayset>savebtn.on");
            comevisiset(false);
//            var butscr = $('[class^="styles__full-screen___"]button');
//            var butvol = $(EXvolume);
//            if(isInpWinBottom){
//                contCome.css("position","absolute");
//                comeForm.css("position","absolute");
//                comeForm.css("top","");
//                comeForm.css("bottom",0);
//                comeList.css("position","absolute");
//                comeList.css("bottom","");
//                comeList.css("top",0);
//                if(comeList.css("display")=="none"){
//                    contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
//                    contCome.css("height",hideCommentParam+"px");
//                }else{
//                    contCome.css("top","44px");
//                    contCome.css("height",(window.innerHeight-44-61)+"px");
//                    comeList.css("width","100%");
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                }
//                $("#forProEndBk").css("bottom",0);
//                $("#forProEndTxt").css("bottom",0);
//                if(isSureReadComment){
//                    $('[class^="styles__full-screen___"]button').css("bottom",(80+hideCommentParam)+"px");
//                    $('[class^="styles__volume___"]div').css("bottom",(80+hideCommentParam)+"px");
//                    butscr.css("bottom",(80+hideCommentParam)+"px");
//                    butvol.css("bottom",(80+hideCommentParam)+"px");
//                }else{
////                    $('[class^="styles__full-screen___"]button').css("bottom","");
////                    $('[class^="styles__volume___"]div').css("bottom","");
//                    butscr.css("bottom","");
//                    butvol.css("bottom","");
//                    if(comeList.css("display")=="none"){
//                        contCome.css("top",(window.innerHeight-hideCommentParam)+"px");
//                    }else{
//                        contCome.css("top",0);
//                        contCome.css("height",window.innerHeight+"px");
//                        comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
//                    }
//                }
//            }else{
//                $('[class^="styles__full-screen___"]button').css("bottom","");
//                $('[class^="styles__volume___"]div').css("bottom","");
//                butscr.css("bottom","");
//                butvol.css("bottom","");
//                contCome.css("position","absolute");
//                contCome.css("top","44px");
//                comeForm.css("position","absolute");
//                comeForm.css("bottom","");
//                comeForm.css("top",0);
//                comeList.css("position","absolute");
//                comeList.css("top","");
//                comeList.css("bottom",0);
//                if(comeList.css("display")=="none"){
//                    contCome.css("height",hideCommentParam+"px");
//                }else{
//                    contCome.css("height",(window.innerHeight-44-61)+"px");
//                    comeList.css("width","100%");
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                }
//                $("#forProEndBk").css("bottom","");
//                $("#forProEndTxt").css("bottom","");
//                if(!isSureReadComment){
//                    contCome.css("top",0);
//                    if(comeList.css("display")=="none"){
//                    }else{
//                        contCome.css("height",window.innerHeight+"px");
//                        comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
//                    }
//                }
//            }
//            $("#settcont").css("display","none");
//            closeOption();
          waitforRightShown(0);
        });
        arrayFullNgMaker();

        var eMoveContainer=document.createElement('div');
        eMoveContainer.id="moveContainer";
        eMoveContainer.setAttribute("style","position:absolute;top:50px;left:1px;z-index:9;");
        $("body").append(eMoveContainer);

        if(isInpWinBottom){
            $("#forProEndBk").css("bottom",0);
            $("#forProEndTxt").css("bottom",0);
        }else{
            $("#forProEndBk").css("bottom","");
            $("#forProEndTxt").css("bottom","");
        }
//console.log("delayset");
        comevisiset(false);
        if(isSureReadComment){
//          console.log("delayset>(isSureReadComment=true)");
            popElement();
//            var contCome = $('[class^="TVContainer__right-comment-area___"]');
//            var comeForm = $('[class*="styles__comment-form___"]');
//            var contCome = $(EXcome);
//            var comeForm = $(EXcomesend);
//            var comeList = $(commentListParentSelector);
//            var hideCommentParam = 142;
//            if (isCustomPostWin){
//                hideCommentParam=64;
//            }
//            var butscr = $('[class^="styles__full-screen___"]button');
//            var butvol = $(EXvolume);
//            if(isInpWinBottom){
//                $('[class^="styles__full-screen___"]button').css("bottom",(80+hideCommentParam)+"px");
//                $('[class^="styles__volume___"]div').css("bottom",(80+hideCommentParam)+"px");
//                butscr.css("bottom",(80+hideCommentParam)+"px");
//                butvol.css("bottom",(80+hideCommentParam)+"px");
//                if(comeList.css("display")=="none"){
//                    contCome.css("position","absolute");
//                    contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
//                    contCome.css("height",hideCommentParam+"px");
//                    comeForm.css("position","absolute");
//                    comeForm.css("top","");
//                    comeForm.css("bottom",0);
//                    comeForm.css("height",hideCommentParam+"px");
//                    comeList.css("position","absolute");
////                    comeList.css("bottom","");
////                    comeList.css("top",0);
////                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                    comeList.css("width","100%");
//                }else{
//                    contCome.css("position","absolute");
//                    contCome.css("top","44px");
//                    contCome.css("height",(window.innerHeight-44-61)+"px");
//                    comeForm.css("position","absolute");
//                    comeForm.css("top","");
//                    comeForm.css("bottom",0);
//                    comeForm.css("height",hideCommentParam+"px");
//                    comeList.css("position","absolute");
//                    comeList.css("bottom","");
//                    comeList.css("top",0);
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                    comeList.css("width","100%");
//                }
//            }else{
////                $('[class^="styles__full-screen___"]button').css("bottom","");
////                $('[class^="styles__volume___"]div').css("bottom","");
//                butscr.css("bottom","");
//                butvol.css("bottom","");
//                if(comeList.css("display")=="none"){
//                    contCome.css("position","absolute");
//                    contCome.css("top","44px");
//                    contCome.css("height",hideCommentParam+"px");
//                    comeForm.css("position","absolute");
//                    comeForm.css("bottom","");
//                    comeForm.css("top",0);
//                    comeForm.css("height",hideCommentParam+"px");
//                    comeList.css("position","absolute");
////                    comeList.css("top","");
////                    comeList.css("bottom",0);
////                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                    comeList.css("width","100%");
//                }else{
//                    contCome.css("position","absolute");
//                    contCome.css("top","44px");
//                    contCome.css("height",(window.innerHeight-44-61)+"px");
//                    comeForm.css("position","absolute");
//                    comeForm.css("bottom","");
//                    comeForm.css("top",0);
//                    comeForm.css("height",hideCommentParam+"px");
//                    comeList.css("position","absolute");
//                    comeList.css("top","");
//                    comeList.css("bottom",0);
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//                    comeList.css("width","100%");
//                }
//            }
            //各要素を隠すまでのカウントをマウスオーバーで5にリセット
            window.addEventListener("mousemove",function(e){
//              console.log("delayset>addEvent(mousemove)");
//                if (isSureReadComment){ //設定ウィンドウ反映用
//                  console.log("delayset>addEvent(mousemove)>(isSureReadComment=true)");
                if(settings.isAlwaysShowPanel){
//                  console.log("delayset>addEvent(mousemove)>(isAlwaysShowPanel=true)");
                    if(forElementClose<5){
                        forElementClose=5;
                        popElement(); //各要素を表示
                    }
                }else{
//                  console.log("delayset>addEvent(mousemove)>(isSureReadComment=false)");
//                  console.log("delayset>addEvent(mousemove)>(isAlwaysShowPanel=false)");
                  unpopElement(false);
                }
            },true);
        }else{
//          console.log("delayset>(isSureReadComment=false)");
          unpopElement(false);
        }
        //右下にコメント一覧表示切替を設置
//        $('[class^="TVContainer__footer___"] [class*="styles__right-container___"]').on("click",function(){
        $(EXfootcome).on("click",function(){
//            if(isSureReadComment){
//                if($('[class^="TVContainer__right-comment-area___"][class*="TVContainer__right-slide--shown___"]').length>0){ //コメント一覧が表示状態のとき
                if($(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length>0){
                    toggleCommentList();
                }
//            }
        });
//        $('[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]').on("click",function(e){
        $(EXcomesend).on("click",function(e){
            //コメント一覧の表示切替 ボタンならそのまま
            if(e.target.tagName.toLowerCase()=='form'){
                toggleCommentList();
            }
        });
//        $('[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]>form').on("click",function(e){
        $(EXcomesendinp).parent().on("click",function(e){
            //枠から↑へのバブルを止める
            if(e.target.tagName.toLowerCase()=='div'){
                e.stopPropagation();
            }
        });
        EXcomelist = $(commentListParentSelector)[0];
//        EXcomments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
        EXcomments = $(EXcomelist).contents().find('[class^="styles__message___"]');
        //映像のリサイズ
        onresize();
        //フルスクリーンボタンの割り当て変更
        $('button[class*="styles__full-screen___"]')[0].addEventListener("click", function(e){
            if (settings.isDblFullscreen) {
                toggleFullscreen();
                e.stopImmediatePropagation();
            }
        });
        //拡張機能の設定をその他メニューに追加
        var hoverContents = $('[class*="styles__hover-contents___"]');
        var hoverLinkClass = hoverContents.children()[0].className;
        hoverContents.append('<a class="' + hoverLinkClass + '" id="extSettingLink" href="#">拡張設定</a>');
        $("#extSettingLink").click(openOption);
        //ユーザースクリプトのngconfigのz-index変更
        $("#NGConfig").css("z-index", 20);

        copyCome();

        console.log("delayset ok");
    }else{
        retrycount+=1;
        if(retrycount<retrytick.length){
            console.log("delayset failed#"+retrycount);
            setTimeout(delayset,retrytick[retrycount]);
        }
    }
}
function toggleCommentList(){
//    console.log("toggleCommentList()")
//    var contCome = $('[class^="TVContainer__right-comment-area___"]');
//    var contCome = $(EXcome);
//    var comeList = $(commentListParentSelector);
//    var comeForm = $(EXcomesend);
    comevisiset(true);
//    var hideCommentParam = 142;
//    if (isCustomPostWin){
//        hideCommentParam=64;
//    }
//    var clipSlideBarTop = 0;
//    var clipSlideBarBot = 0;
//    if(isSureReadComment){
//        clipSlideBarTop = 44;
//        clipSlideBarBot = 61;
//    }
//    if(isInpWinBottom){
//        if(comeList.css("display")=="none"){
//            comeList.css("display","block");
//            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot)+"px");
//            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
//            contCome.css("top",clipSlideBarTop+"px");
//        }else{
//            comeList.css("display","none");
//            contCome.css("top",(window.innerHeight-hideCommentParam-clipSlideBarBot)+"px");
//            contCome.css("height",hideCommentParam+"px");
//        }
//    }else{
//        if(comeList.css("display")=="none"){
//            comeList.css("display","block");
//            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
//        }else{
//            comeList.css("display","none");
//            contCome.css("height",hideCommentParam+"px");
//        }
//    }
}
function StartMoveComment(){
    if($('body>#moveContainer').children().length>0){
        $('body>#moveContainer').animate({"left":"-="+Math.floor(window.innerWidth/settings.movingCommentSecond)+"px"},{duration:1000,easing:"linear",complete:StartMoveComment});
    }else{
        $('body>#moveContainer').css("left","1px");
    }
}
function unpopHeader(){
//console.log("unpopHeader");
  $(EXhead).css("visibility","")
    .css("opacity","")
  ;
  $(EXfoot).css("visibility","")
    .css("opacity","")
  ;
  comevisiset(false);
}
function popHeader(){
//console.log("popHeader");
//    var contHeader = $('[class^="AppContainer__header-container___"]');
    $(EXhead).css("visibility","visible")
      .css("opacity",1)
    ;
//    var contFooter = $('[class^="TVContainer__footer-container___"]');
    $(EXfoot).css("visibility","visible")
      .css("opacity",1)
    ;
    comevisiset(false);
//    var contCome = $('[class^="TVContainer__right-comment-area___"]');
//    var contCome = $(EXcome);
//    var comeList = $(commentListParentSelector);
////    var oldcontVisible = contHeader.css("visibility");
//    var hideCommentParam = 142;
//    if (isCustomPostWin){
//        hideCommentParam=64;
//    }
//    if(isInpWinBottom){
//        if(comeList.css("display")=="none"){
//            contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
//            contCome.css("height",hideCommentParam+"px");
//        }else{
//            contCome.css("top","44px");
//            contCome.css("height",(window.innerHeight-44-61)+"px");
//            comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//        }
//    }
//    if(oldcontVisible !="visible"){
//        if(isInpWinBottom){
//            comeList[0].scrollTop = comeList[0].scrollHeight;
//        }
//    }
}
function comevisiset(sw){
//console.log("comevisiset");
  var comeList = $(commentListParentSelector);
  if(sw){
    comeList.css("display",(comeList.css("display")=="block")?"none":"block");
  }
  $(EXcomesend.children[1]).css("display",isCustomPostWin?"none":"flex");
  var contCome = $(EXcome);
  var comeForm = $(EXcomesend);
  var comeshown = $(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length>0?true:false;
  var hideCommentParam = isCustomPostWin?64:142;
  var clipSlideBarTop = settings.isAlwaysShowPanel?44:0;
  var clipSlideBarBot = settings.isAlwaysShowPanel?61:0;
//  var butscr = $('[class^="styles__full-screen___"]button');
  var butscr = $(EXfoot).contents().find('button[class^="styles__full-screen___"]:first');
  var butvol = $(EXvolume);
  var comepro=$(EXcome).children("#forProEndTxt,#forProEndBk");
  if(isInpWinBottom){
    var b=80+((isSureReadComment||comeshown)?hideCommentParam:0);
    butscr.css("bottom",b+"px");
    butvol.css("bottom",b+"px");
    comepro.css("bottom",0);
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
      contCome.css("top",clipSlideBarTop+"px");
      contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
      comeForm.css("position","absolute");
      comeForm.css("top","");
      comeForm.css("bottom",0);
      comeForm.css("height",hideCommentParam+"px");
      comeList.css("position","absolute");
      comeList.css("bottom","");
      comeList.css("top",0);
      comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot)+"px");
      comeList.css("width","100%");
    }
  }else{
    butscr.css("bottom","");
    butvol.css("bottom","");
    comepro.css("bottom","");
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
      contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
      comeForm.css("position","absolute");
      comeForm.css("bottom","");
      comeForm.css("top",0);
      comeForm.css("height",hideCommentParam+"px");
      comeList.css("position","absolute");
      comeList.css("top","");
      comeList.css("bottom",0);
      comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot)+"px");
      comeList.css("width","100%");
    }
  }
}
function unpopElement(sw){
//console.log("unpopElement");
    $(EXinfo).css("z-index","");
    $(EXside).css("transform","");
    $(EXchli).parent().css("z-index","");
  if(!sw){
    $(EXhead).css("visibility","")
      .css("opacity","")
    ;
    $(EXfoot).css("visibility","")
      .css("opacity","")
    ;
  }
    if(!isSureReadComment){
      $(EXcome).css("transform","")
        .css("position","")
      ;
    }
    comevisiset(false);
}
function popElement(){
//console.log("popElement");
    //マウスオーバーで各要素表示
//    console.log("popElement()")
//    $('[class^="TVContainer__right-slide___"]').css("z-index",11);
//    $('[class^="TVContainer__side___"]').css("transform","translate(0,-50%)");
//    $('[class^="TVContainer__right-list-slide___"]').css("z-index",11);
    $(EXinfo).css("z-index",11);
    $(EXside).css("transform","translate(0,-50%)");
    $(EXchli).parent().css("z-index",11);
//    var contHeader = $('[class^="AppContainer__header-container___"]');
    $(EXhead).css("visibility","visible")
      .css("opacity",1)
    ;
//    var comeList = $(commentListParentSelector);
//    var oldcontVisible = $(EXhead).css("visibility");
//    var contFooter = $('[class^="TVContainer__footer-container___"]');
    $(EXfoot).css("visibility","visible")
      .css("opacity",1)
    ;
//    var contCome = $('[class^="TVContainer__right-comment-area___"]');
    $(EXcome).css("transform","translateX(0px)")
      .css("position","absolute")
    ;
    comevisiset(false);
//    var hideCommentParam = 142;
//    if (isCustomPostWin){
//        hideCommentParam=64;
//    }
//    if(isInpWinBottom){
//        if(comeList.css("display")=="none"){
//            contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
//            contCome.css("height",hideCommentParam+"px");
//        }else{
//            contCome.css("top","44px");
//            contCome.css("height",(window.innerHeight-44-61)+"px");
//            comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//        }
//    }else{
//        contCome.css("top","44px");
//        if(comeList.css("display")=="none"){
//            contCome.css("height",hideCommentParam+"px");
//        }else{
//            contCome.css("height",(window.innerHeight-44-61)+"px");
//            comeList.css("position","absolute");
//            comeList.css("width","100%");
//            comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
//        }
//    }
//    if(oldcontVisible !="visible"){
//        if(isInpWinBottom){
//            comeList[0].scrollTop = comeList[0].scrollHeight;
//        }
//    }
}
function waitforRightShown(retrycount){
  if(!EXwatchingnum){return;}
  var ss=($('body>#cmcm').length==0)?1:CMsmall;
  $(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__watch___"]:first').index()*85-$(EXside).position().top);
//  var ww=16*Math.floor(($(window).width()-(($(EXobli).siblings('[class*="TVContainer__right-slide--shown___"]').length>0)?310:0))/16);
  var ww=$(window).width();
  var wm=isSureReadComment?310:0;
  var jo=$(EXobli).siblings('[class*="TVContainer__right-slide--shown___"]');
  if(jo.length>0){
    for(var i=0;i<jo.length;i++){
      if(wm<jo.eq(i).width()){
        wm=jo.eq(i).width();
      }
    }
  }
  ww=isMovieResize?ww-wm:$(window).width();
  var wh=Math.floor(ww*9/16);
//  if(isMovieResize){
//    wh=16*Math.floor(wh/16);
//    ww=Math.ceil(wh*16/9);
//  }
  var pt=44;
  var pb=$(window).height()-wh-pt;
  var ph=0;
  if(ss>1){
//    ww=isMovieResize?Math.floor(ww/ss):$(window).width();
    ww=Math.floor(ww/ss);
    wh=Math.floor(ww*9/16);
//    if(isMovieResize){
//      wh=16*Math.floor(wh/16);
//      ww=Math.ceil(wh*16/9);
//    }
    pt=44+(ss-1)*Math.floor(wh/2);
    pb=$(window).height()-wh-pt;
    ph=(ss-1)*Math.floor(ww/2);
  }
  $(EXobli).children().css("width",ww+"px");
  $(EXobli).children().css("height",wh+"px");
  $(EXobli).css("padding",pt+"px 0px "+pb+"px "+ph+"px");
  $(EXobli).parent().scrollTop(wh*EXwatchingnum);
//  $(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__watch___"]:first').index()*85-$(EXside).position().top);
  if(retrycount>0){
    setTimeout(waitforRightShown,50,retrycount-1);
  }
}
function setEXs(retrycount){
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
  else if((EXcomelist0=$($(EXcome).contents().find('[class^="styles__no-contents-text___"]:first')[0]).parent()[0])==null){b=false;console.log("comelist");}
  else if((EXvolume=$('[class^="styles__volume___"]:first')[0])==null){b=false;console.log("vol");}
  else{
    if($('img[class^="styles__channel-icon___"]').length>0){
      var i=$('img[class^="styles__channel-icon___"]');
      b=false;
      for(var j=i.length-1;j>=0;j--){
        var k=i.eq(j).parent().parent();
        if(k[0].childElementCount>EXchli.childElementCount-3&&k.height()>100*k[0].childElementCount){
            EXobli=k[0];
            b=true;
            break;
        }
      }
    }else{b=false;console.log("obli");}
  }
  if(b==true){
    console.log("setEXs");
    setTimeout(setEX2,1000,30);
  }else if(retrycount>0){
    setTimeout(setEXs,1000,retrycount-1);
  }
}
function setEX2(retrycount){
  var b=true;
  if($(EXchli).children('[class*="styles__watch___"]:first').length==0){b=false;}
  else if((EXwatchingstr=$(EXchli).children('[class*="styles__watch___"]:first').contents().find('img').prop("alt"))==null){b=false;}
  else if((EXwatchingnum=$(EXobli).contents().find('img[alt='+EXwatchingstr+']').parents().index())==null){b=false;}
  else{
    $(EXchli).parent().scrollTop($(EXchli).children('[class*="styles__watch___"]:first').index()*85-$(EXside).position().top);
  }
  if(b==true){
    console.log("setEX2");
  }else if(retrycount>0){
    setTimeout(setEX2,1000,retrycount-1);
  }
}
function isComeOpen(){
  return ($(EXcome).filter('[class*="TVContainer__right-slide--shown___"]').length==1)?true:false;
}
function getComeId(inp){
  return parseInt(/.*\$(\d+)$/.exec(EXcomelist.children[inp].getAttribute("data-reactid"))[1]);
}
function comesort(){
//  if(isComeOpen()&&(isInpWinBottom&&getComeId(EXcomelist.childElementCount-1)!=0)){
  if(isComeOpen()&&isInpWinBottom){
//  console.log("dec sort");
    for(var i=0;i<EXcomelist.childElementCount-1;i++){
      if(getComeId(i)<getComeId(i+1)){
        EXcomelist.insertBefore(EXcomelist.children[i+1],EXcomelist.firstChild);
      }
    }
//  }else if((isComeOpen()&&(!isInpWinBottom&&getComeId(EXcomelist.childElementCount-1)==0))||(!isComeOpen()&&getComeId(EXcomelist.childElementCount-1)==0)){
  }else if(!isInpWinBottom||!isComeOpen()){
//  console.log("inc sort");
    for(var i=EXcomelist.childElementCount-1;i>=1;i--){
      if(getComeId(i-1)>getComeId(i)){
        EXcomelist.insertBefore(EXcomelist.children[i-1],null);
      }
    }
  }
}
function otosageru(){
    var teka=document.createEvent("MouseEvents");
    var teki=$('[class^="styles__slider-container___"]').children();
    var teku=teki.offset().top+106-Math.min(92,Math.max(0,Math.floor(92*changeMaxVolume/100)));
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku);
    setTimeout(otomouseup,100);
    return teki[0].dispatchEvent(teka);
}
function moVol(d){
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]:first').children();
    var teku=teki.offset().top+106;
    var teke=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]:first').css("height"));
//    teke=(teke+d>92)?92:(teke+d<0)?0:(teke+d);
    teke=(teke+d>91)?91:(teke+d<0)?0:(teke+d);
    teka.initMouseEvent("mousedown",true,true,window,0,0,0,teki.offset().left+15,teku-teke);
    setTimeout(otomouseup,100);
    return teki[0].dispatchEvent(teka);
}
function otomouseup(){
    var teka=document.createEvent("MouseEvents");
    var teki=$(EXvolume).contents().find('[class^="styles__slider-container___"]:first').children();
    var teku=teki.offset().top+106;
    var teke=parseInt($(EXvolume).contents().find('[class^="styles__highlighter___"]:first').css("height"));
    teka.initMouseEvent("mouseup",true,true,window,0,0,0,teki.offset().left+15,teku-teke);
    return teki[0].dispatchEvent(teka);
}
function otoColor(){
  var jo=$(EXvolume).contents().find('svg:first');
  if(jo.length>0){
    if(jo.css("fill")=="rgb(255, 255, 255)"){
      jo.css("fill","red");
      setTimeout(otoColor,800);
    }else{
      jo.css("fill","");
    }
  }
}
function otoSize(ts){
  var jo=$(EXvolume).contents().find('svg:first');
  if(jo.length>0){
    if(jo.css("zoom")=="1"){
      jo.css("zoom",ts);
      setTimeout(otoSize,400);
    }else{
      jo.css("zoom","");
    }
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
  faintcheck2(5,Math.max(1,fcd));
}
function copyCome(){
//console.log("copycome");
  if(isInpWinBottom){
    if(!EXcomelist||$(EXcomelist).css("display")=="none"||$(EXcome).contents().find('[class^="styles__no-contents-text___"]:first').length>0||$(EXcomelist.firstChild).children('p[class^="styles__message___"]:first').length==0){
      return;
    }
    $(EXcomelist).css("visibility","hidden")
      .css("opacity",1)
    ;
    var cf=$(EXcomelist.firstChild);
    var dc=cf.prop("class");
    var mc=cf.children('p[class^="styles__message___"]:first').prop("class");
    var tc=cf.children('p[class^="styles__time___"]:first').prop("class");
    var mh=";";
    var th=";";
    var lh=$(window).height();
    var jcopycome=$(EXcomelist).siblings('#copycome');
    if(jcopycome.length==0){
      $('<div id="copycome"></div>').insertAfter($(EXcomelist));
      jcopycome=$(EXcomelist).siblings('#copycome');
      do{
        $('<div class="'+dc+'" style="visibility:hidden;"><p class="'+mc+'">'+mh+'</p><p class="'+tc+'">'+th+'</p></div>').appendTo(jcopycome);
      }while(jcopycome[0].scrollHeight<lh);
    }
    while(jcopycome[0].scrollHeight<lh){
      $('<div class="'+dc+'" style="visibility:hidden;"><p class="'+mc+'">'+mh+'</p><p class="'+tc+'">'+th+'</p></div>').appendTo(jcopycome);
    }
    while(jcopycome[0].scrollHeight>=lh){
      jcopycome.children(':first').remove();
    }
//comeupdate
    var copycomelist=jcopycome.children();
    var origcomelist=$(EXcomelist).children();
    var j;
    for(var i=copycomelist.length-1;i>=0;i--){
      j=copycomelist.length-1-i;
      if(j>=origcomelist.length-1){
        mh=";";
        th=";";
        copycomelist.eq(i).css("visibility","hidden");
      }else{
        mh=origcomelist.eq(j).children('[class^="styles__message___"]:first').text();
        th=origcomelist.eq(j).children('[class^="styles__time___"]:first').text();
        copycomelist.eq(i).css("visibility","");
      }
      copycomelist.eq(i).children('[class^="styles__message___"]:first').text(mh);
      copycomelist.eq(i).children('[class^="styles__time___"]:first').text(th);
    }
//comeupdate
    jcopycome.scrollTop(jcopycome[0].scrollHeight);
    if(isHideOldComment){
      jcopycome.css("overflow-x","")
        .css("overflow-y","")
        .css("overflow","hidden")
      ;
    }else{
      jcopycome.css("overflow","")
        .css("overflow-x","hidden")
        .css("overflow-y","scroll")
      ;
    }
  }else{
    $(EXcomelist).css("visibility","")
      .css("opacity","")
    ;
    $(EXcomelist).siblings('#copycome').remove();
  }
}
$(window).on('load', function () {
    console.log("loaded");
    var csspath = chrome.extension.getURL("onairpage.css");
    $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
    // jqueryを開発者コンソールから使う
    var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
    $("<script src='"+jquerypath+"'></script>").appendTo("head");
    //ダブルクリックでフルスクリーン
    $(window).on("dblclick",function(){
        console.log("dblclick");
        if (settings.isDblFullscreen) {
                    //$('[class*="styles__full-screen___"],[class*="styles__exit-fullscreen___"]').trigger("click");
            toggleFullscreen();
        }
    });
    $(window).on("click",function(){
      if(isSureReadComment){
        comeclickcd=2;
//        setTimeout(comesort,500);
      }
      if(isMovieResize){
        waitforRightShown(1);
      }
    });
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
    //マウスホイール無効か音量操作
    if (isCancelWheel||isVolumeWheel){
        window.addEventListener("mousewheel",function(e){
            if (isVolumeWheel&&e.target.className.indexOf("style__overlap___") != -1){//イベントが映像上なら
                if($(EXvolume).contents().find('svg:first').css("zoom")=="1"){
                  otoSize(e.wheelDelta<0?0.8:1.2);
                }
                moVol(e.wheelDelta<0?-5:5);
            }
            if (isCancelWheel||isVolumeWheel){ //設定ウィンドウ反映用
                e.stopImmediatePropagation();
            }
        },true);
    }
/*
    //エンターキーでコメント投稿
    $('[class*="styles__comment-form___"] textarea').keypress(function(e){
        if (e.keyCode == 13 && (isEnterSubmit || e.shiftKey)) {
            $('[class*="styles__post-button"]').trigger("click");
            $('[class*="styles__comment-form___"] textarea').val("");
        }
    });
*/

    //古いコメントを非表示
    if (isHideOldComment) {
        var hideOldCommentCSS = commentListParentSelector + '{overflow: hidden;}';
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(hideOldCommentCSS) + "'>").appendTo("head");
    }

    //コメントのZ位置を上へ
    if (isMovingComment) {
        var comeZindexCSS = '[class="movingComment"]{z-index:5;}';
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(comeZindexCSS) + "'>").appendTo("head");
    }

    //投稿ボタン削除・入力欄1行化
    if (isCustomPostWin){
        var CustomPostWinCSS1 = '[class^="styles__opened-textarea-wrapper___"] * {height:18px;}';
        var CustomPostWinCSS2 = '[class^="styles__opened-textarea-wrapper___"] + div {display:none;}';
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(CustomPostWinCSS1) + "'>").appendTo("head");
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(CustomPostWinCSS2) + "'>").appendTo("head");
    }

    setInterval(function () {
        // 1秒ごとに実行
        var btn = $('[class^="TVContainer__right-comment-area___"] [class^="styles__continue-btn___"]'); //新着コメのボタン
        if (btn.length>0) {
            //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
            btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
        }
        //黒帯パネル表示のためマウスを動かすイベント発火
        if (settings.isAlwaysShowPanel) {
//           console.log("1>(alwaysshowpanel=true)");
            triggerMouseMoving();
            if(!isSureReadComment){
//                console.log("1>(alwaysshowpanel=true)>(surereadcome=false)");
                unpopElement(true);
                popHeader();
            }else{
//                console.log("1>(alwaysshowpanel=true)>(surereadcome=true)");
//                unpopHeader();
            }
        }else{
//          console.log("1>(alwaysshowpanel=false)");
          unpopHeader();
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
//        var newCommentNum = comments.length - commentNum;
//        if (commentNum != 0){
//            if (isMovingComment) {
//                for (var i = commentNum;i < comments.length; i += 1){
//                    putComment(comments[comments.length-i-1].innerHTML);
//                }
//            }
//        }
//        commentNum = comments.length;
//        EXcomelist = $(commentListParentSelector)[0];
        if(EXcomelist&&isComeOpen()){
            var comeListLen = EXcomelist.childElementCount;
            if(comeListLen>commentNum){ //コメ増加あり
                //入力欄が下にあるときはソート
              if(!comeRefreshing){
//                if(isInpWinBottom){
//                    comesort();
//                    for(var i=commentNum;i<comeListLen;i++){
//                        EXcomelist.insertBefore(EXcomelist.children[i],EXcomelist.firstChild);
//                    }
//                    comments = $(commentsSelector);//ソートの反映
//                    //ソートした後でコメントを流す 最初は流さない
//                    if(isMovingComment&&commentNum>1){
//                        for(var i=Math.max(comeListLen-movingCommentLimit,commentNum);i<comeListLen;i++){
//                            putComment(EXcomelist.children[i].firstChild.innerHTML);
//                        }
//                    }
//                    EXcomelist.scrollTop = EXcomelist.scrollHeight;
//                }else if(isMovingComment){
                if(isMovingComment&&commentNum>0){
                    for(var i=Math.min(movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
                        putComment(comments[i].innerHTML);
                    }
                }
              }else{
                comeRefreshing=false;
                $(EXcome).css("border-left-color","")
                  .css("border-left-style","")
                  .css("border-left-width","")
                ;
              }
                commentNum=comeListLen;
              if(commentNum>sureReadRefresh&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){ //右下ボタンが押下可能設定のとき
console.log("comeRefresh now:"+commentNum+">set:"+sureReadRefresh);
                comeRefreshing=true;
                commentNum=0;
                $(EXcome).css("border-left-color","gray")
                  .css("border-left-style","solid")
                  .css("border-left-width","3px")
                ;
                $('[class^="style__overlap___"]:first').trigger("click");
              }
            }else if(comeListLen<commentNum){
                commentNum=0;
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
//                    if(isCMBkTrans){
//                            screenBlackSet(1);
//                    }else{
//                        screenBlackSet(3);
//                    }
                    if(cmblockcd<=0){
                      cmblockcd=cmblockia;
                    }
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
//                    screenBlackSet(0);
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
//                    soundSet(false);
                    if(cmblockcd<=0){
                      cmblockcd=cmblockia;
                    }
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今コメント数有効で直前がコメント数無効(=コメント数無効終了?)
//                    soundSet(true);
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
            $(EXcomesendinp).parent().css("background","rgba(0,0,0,0.4)");
            if(cmblockcd<=0){
              cmblockcd=0;
              if($('body>#cmcm').length==0){
                var c=document.createElement('span');
                c.id="cmcm";
                document.body.insertBefore(c,document.body.firstChild);
              }
              if(isCMBlack){
                if(isCMBkTrans){
                  screenBlackSet(1);
                }else{
                  screenBlackSet(3);
                }
              }
              if(isCMsoundoff){soundSet(false);}
              waitforRightShown(0);
            }
          }else{
            cmblockcd+=1;
            if(cmblockcd>=0){
              cmblockcd=0;
              $('body>#cmcm').remove();
              $(EXcomesendinp).parent().css("background","");
              if(isCMBlack){screenBlackSet(0);}
              if(isCMsoundoff){soundSet(true);}
              waitforRightShown(0);
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

        //投稿ボタン削除・入力欄1行化(初回クリック時と4行以上入力時に大きくなるのを防ぐ)
        if (isCustomPostWin){
          $(EXcomesendinp).parent().children().css("height","18px");
//            var postwin = $('[class^="styles__opened-textarea-wrapper___"]');
//            if (postwin[0]&&postwin[0].hasChildNodes()&&postwin[0].children[1]){
//                postwin[0].children[0].style.height="18px";
//                postwin[0].children[1].style.height="18px";
//            }
        }

        if((EXcomesendbut=$(EXcomesend).contents().find('button:contains("投稿する"):first')[0])==null){};
        //コメント入力欄に改行が含まれていたら送信
        if (isEnterSubmit){
//            var butsend = $('button[class*="styles__post-button___"]');
//            var inpcome = $('[class*="styles__comment-form___"] textarea').val();
//            if(inpcome&&inpcome.match(/[\n\r]/g)&&inpcome.replace(/[\n\r]/g,"").length>0&&!butsend[0].hasAttribute('disabled')){
            var inpcome=$(EXcomesendinp).val();
            if(inpcome&&inpcome.match(/[\n\r]/g)&&inpcome.replace(/[\n\r]/g,"").length>0&&!$(EXcomesendbut).prop("disabled")){
                //送信前に改行は除去
                console.log("post");
//                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
//                $('[class*="styles__post-button"]').trigger("click");
//                $('[class*="styles__comment-form___"] textarea').val("");
                $(EXcomesendinp).val(inpcome.replace(/[\n\r]/g,""));
                $(EXcomesendbut).trigger("click");
                $(EXcomesendinp).val("");
            }else if(inpcome){
                //エンター送信なら改行は除去
//                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
              $(EXcomesendinp).val(inpcome.replace(/[\n\r]/g,""));
            }
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
//            if($("#forProEndBk").length==0){
            if($("#forProEndBk").length==0&&EXcome){
//                var rightCommentArea = $('[class^="TVContainer__right-comment-area___"]');
//                if(rightCommentArea[0]){
                    var eForProEndBk = document.createElement("span");
                    eForProEndBk.id="forProEndBk";
                    eForProEndBk.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;background-color:rgba(255,255,255,0.2);z-index:13;width:"+Math.floor(100*forProEnd/proLength)+"%;");
                    eForProEndBk.innerHTML="&nbsp;";
//                    rightCommentArea[0].insertBefore(eForProEndBk,rightCommentArea[0].firstChild);
                    EXcome.insertBefore(eForProEndBk,EXcome.firstChild);
                    var eForProEndTxt = document.createElement("span");
                    eForProEndTxt.id="forProEndTxt";
                    eForProEndTxt.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:11;");
                    eForProEndTxt.innerHTML=strProEnd;
//                    rightCommentArea[0].insertBefore(eForProEndTxt,EXcome.firstChild);
                    EXcome.insertBefore(eForProEndTxt,EXcome.firstChild);
                    if (isInpWinBottom) {
//                        $("#forProEndBk").css("bottom",0);
//                        $("#forProEndTxt").css("bottom",0);
                      $(EXcome).children("#forProEndTxt,#forProEndBk").css("bottom",0);
                    }
//                    $("#forProEndBk").css("width",Math.floor(100*forProEnd/proLength)+"%");
                    //残り時間クリックで設定ウィンドウ開閉
                    $("#forProEndBk").on("click",function(){
                        if($("#settcont").css("display")=="none"){
                            openOption();
                        }else{
                            closeOption();
                        }
                    });
//                }
            }else{
                $("#forProEndTxt").html(strProEnd);
                $(EXcome).children("#forProEndBk").css("width",((forProEnd>0)?Math.floor(100*forProEnd/proLength):100)+"%");
//                if(forProEnd>0){
//                    $("#forProEndBk").css("width",Math.floor(100*forProEnd/proLength)+"%");
//                }else{
//                    $("#forProEndBk").css("width","100%");
//                }
            }
        }else{
//            while($("#forProEndTxt").length>0){
//                $("#forProEndTxt").remove();
//            }
//            while($("#forProEndBk").length>0){
//                $("#forProEndBk").remove();
//            }
          $(EXcome).children("#forProEndTxt,#forProEndBk").remove();
        }
        //コメント欄を常時表示
        if(isSureReadComment){
            //右下をクリックできそうならクリック
//            if($('[class^="TVContainer__right-comment-area___"][class*="TVContainer__right-slide--shown___"]').length==0){ //コメント一覧が表示状態でないとき
//                if($('[class^="TVContainer__right-slide___"][class*="TVContainer__right-slide--shown___"]').length==0){ //番組情報が表示状態でないとき
//                    if($('[class^="TVContainer__right-list-slide___"][class*="TVContainer__right-slide--shown___"]').length==0){ //放送中一覧が表示状態でないとき
//                        if($('[class^="TVContainer__footer___"] [class*="styles__right-container___"][class*="styles__right-container-not-clickable___"]').length==0){ //右下ボタンが押下可能設定のとき
            if($(EXfoot).siblings('[class*="TVContainer__right-slide--shown___"]').length==0&&$(EXfootcome).filter('[class*="styles__right-container-not-clickable___"]').length==0){
                            if(comeclickcd>0){
                                comeclickcd-=1;
                                if(comeclickcd<=0){
//                                    $('[class^="TVContainer__footer___"] [class*="styles__right-container___"]').trigger("click");
                                  $(EXfootcome).trigger("click");
                                }
                            }
            }
//                        }
//                    }
//                }
//            }
            //各要素を隠すまでのカウントダウン
            if(forElementClose>0){
                forElementClose-=1;
                if(forElementClose<=0){
                    //各要素を隠す
//                    $('[class^="TVContainer__side___"]').css("transform","");
                    $(EXside).css("transform","");
//                    var contHeader = $('[class^="AppContainer__header-container___"]');
//                    var contHeader = $(EXhead);
//                    contHeader.css("visibility","")
                    $(EXhead).css("visibility","")
                      .css("opacity","")
                    ;
//                    var contFooter = $('[class^="TVContainer__footer-container___"]');
//                    var contFooter = $(EXfoot);
//                    contFooter.css("visibility","")
                    $(EXfoot).css("visibility","")
                      .css("opacity","")
                    ;
                    var comeList = $(commentListParentSelector);
//                    var contCome = $('[class^="TVContainer__right-comment-area___"]');
                    var contCome = $(EXcome);
                    contCome.css("position","absolute");
//                    var hideCommentParam = 142;
//                    if (isCustomPostWin){
//                        hideCommentParam=64;
//                    }
                    var hideCommentParam = isCustomPostWin?64:142;
                    if(comeList.css("display")=="none"){
                      contCome.css("height",hideCommentParam+"px")
                        .css("top",isInpWinBottom?(window.innerHeight-hideCommentParam)+"px":0)
                      ;
                    }else{
                      contCome.css("top",0)
                        .css("height",window.innerHeight+"px")
                      ;
                      comeList.css("position","absolute")
                        .css("height",(window.innerHeight-hideCommentParam)+"px")
                      ;
                    }
//                    if(isInpWinBottom){
//                        if(comeList.css("display")=="none"){
//                            contCome.css("position","absolute");
//                            contCome.css("top",(window.innerHeight-hideCommentParam)+"px");
//                            contCome.css("height",hideCommentParam+"px");
//                        }else{
//                            contCome.css("position","absolute");
//                            contCome.css("top",0);
//                            contCome.css("height",window.innerHeight+"px");
//                            comeList.css("position","absolute");
//                            comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
//                        }
//                    }else{
//                        if(comeList.css("display")=="none"){
//                            contCome.css("position","absolute");
//                            contCome.css("top",0);
//                            contCome.css("height",hideCommentParam+"px");
//                        }else{
//                            contCome.css("position","absolute");
//                            contCome.css("top",0);
//                            contCome.css("height",window.innerHeight+"px");
//                            comeList.css("position","absolute");
//                            comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
//                        }
//                    }
                }
            }
        }
        copyCome();

        //コメント位置のTTLを減らす
        for(var i=0;i<comeLatestLen;i++){
            if(comeLatestPosi[i][1]>0){
                comeLatestPosi[i][1]-=1;
                if(comeLatestPosi[i][1]<=0){
                    comeLatestPosi[i][0]=0;
                }
            }
        }

    }, 1000);
    setTimeout(delayset,1000);
    setTimeout(onresize,5000);
});
$(window).on("resize", onresize);

/*window.addEventListener('popstate', function () { //URLが変化したとき(チャンネルを変えたとき)
    console.log("onpopstate")
    setTimeout(onresize, 1000);
});*/
//↑なぜかpopstateイベントが発火しないので代わりに↓
setInterval(function () {
    if (currentLocation != window.location.href) {
        //console.log("url changed");
        setTimeout(onresize, 1000);
        commentNum = 0;
        currentLocation = window.location.href;
        $(".movingComment").remove();
    }
}, 2000);
