/*設定
拡張機能のオプション画面から設定できます。
以下の変数のコメントにある機能を利用する場合はtrue、利用しない場合はfalseを代入してください。
例:
var isHoge = true; //利用したい機能
var isFuga = false; //利用したくない機能
*/
var isResizeScreen = false; //ウィンドウが横長でも映像の端が切れることないようウィンドウに収まるようリサイズ 不具合報告があったのでデフォルトでfalse
var isDblFullscreen = false; //ダブルクリックで全画面表示に切り替え(全画面表示のときは機能しません。通常→全画面のみ)
var isEnterSubmit = false; //エンターでコメント送信(無効にしていてもShift+エンターで送信できます。)
var isHideOldComment = false; //古いコメントを非表示
var isCMBlack = false; //CM時ずっと画面真っ黒
var isCMBkTrans = false; //CM時ずっと画面真っ黒を少し透かす
var isCMsoundoff = false; //CM時ずっと音量ミュート
var isMovingComment = false; //あの動画サイトのように画面上をコメントが流れる(コメント欄を表示しているときのみ機能)
var movingCommentSpeed = 15;//2pxあたりの時間(ms)
var movingCommentLimit = 30;//同時コメント最大数
var isComeNg = false;//流れるコメントのうち特定の文字列を削除or置き換えする
var isComeDel = false;//流れるコメントのうちユーザー指定の文字列を含むものを流さない(この処理は↑の除去前に実行される)
var fullNg = "";//流れるコメントのうち特定の文字列を含む場合は流さない
var isInpWinBottom = false; //コメントリストを非表示、かつコメント入力欄を下の方へ。
var isCustomPostWin = false; //コメント投稿ボタン等を非表示、かつコメント入力欄を1行化。
var isCancelWheel = false; //マウスホイールによるページ遷移を抑止する
var isTimeVisible = false; //残り時間を表示
var isSureReadComment = false;
//設定のロード
chrome.storage.local.get(function (value) {
    isResizeScreen = value.resizeScreen || false;
    isDblFullscreen = value.dblFullscreen || false;
    isEnterSubmit = value.enterSubmit || false;
    isHideOldComment = value.hideOldComment || false;
    isCMBlack = value.CMBlack || false;
    isCMBkTrans = value.CMBkTrans || false;
    isCMsoundoff = value.CMsoundoff || false;
    isMovingComment = value.movingComment || false;
    movingCommentSpeed = value.movingCommentSpeed || movingCommentSpeed;
    movingCommentLimit = value.movingCommentLimit || movingCommentLimit;
    isComeNg = value.comeNg || false;
    isComeDel = value.comeDel || false;
    fullNg = value.fullNg || fullNg;
    isInpWinBottom = value.inpWinBottom || false;
    isCustomPostWin = value.customPostWin || false;
    isCancelWheel = value.cancelWheel || false;
    isTimeVisible = value.timeVisible || false;
    isSureReadComment = value.sureReadComment || false;
});

console.log("script loaded");
var currentLocation = window.location.href;
// jqueryを開発者コンソールから使う
var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
$("<script src='"+jquerypath+"'></script>").appendTo("head");
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
var retrytick=[1000,3000,6000,12000];
var retrycount=0;
var proStart = new Date(); //番組開始時刻として現在時刻を仮設定
var proEnd = new Date(Date.now()+60*60*1000); //番組終了として現在時刻から1時間後を仮設定
var forElementClose = 5;
var EXcomelist;
var EXcomments;

function onresize() {
    if (isResizeScreen) {
        var obj = $("object").parent(),
            wd = window.innerWidth,
            hg = window.innerHeight,
            wdbyhg = hg*16/9,
            newwd,
            newhg;
        if (wd > wdbyhg) {
            newwd = wdbyhg;
            newhg = hg;
        } else {
            newwd = wd;
            newhg = wd*9/16;
        }
        obj.css("width", newwd + "px");
        obj.css("height", newhg + "px");
        obj.css("left", ((wd-newwd)/2)+"px");
        obj.css("top", ((hg-newhg)/2)+"px");
        //console.log(newwd,newhg);
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
//    }
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
    ngedcome = ngedcome.replace(/h?ttps?:\/\/.*\..*/,"");
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
    var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+(Math.floor(window.innerWidth-$("#moveContainer").offset().left+Math.random()*200))+"px;'>" + commentText + "</div>").appendTo("#moveContainer");
    //コメント設置位置の保持
    comeLatestPosi.push([commentTop,Math.min(comeTTLmax,Math.max(comeTTLmin,Math.floor((commentElement.width()+200)*movingCommentSpeed/2000+2)))]);
    comeLatestPosi.shift();
    if(parseInt($("#moveContainer").css("left"))>=1){ //初期位置にいたら動かす
        StartMoveComment();
    }
}
//ミュート(false)・ミュート解除(true)する関数
function soundSet(isSound) {
    var butvol=$('[class*="styles__volume___"] svg'); //音量ボタン
    var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]'); //高さが音量のやつ
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
        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7);border-top-style:solid;border-top-color:black;border-top-width:"+Math.floor(window.innerHeight/2)+"px;");
    } else if (type == 2) {
        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.7)");
    } else if (type == 3) {
        pwaku[0].setAttribute("style","background-color:black;");
    }
}
function openOption(){
    $("#settcont").css("display","block");
    //設定ウィンドウにロード
    $("#isResizeScreen").prop("checked", isResizeScreen);
    $("#isDblFullscreen").prop("checked", isDblFullscreen);
    $("#isEnterSubmit").prop("checked", isEnterSubmit);
    $("#isHideOldComment").prop("checked", isHideOldComment);
    $("#isCMBlack").prop("checked", isCMBlack);
    $("#isCMBkTrans").prop("checked", isCMBkTrans);
    $("#isCMsoundoff").prop("checked", isCMsoundoff);
    $("#isMovingComment").prop("checked", isMovingComment);
    $("#movingCommentSpeed").val(movingCommentSpeed);
    $("#movingCommentLimit").val(movingCommentLimit);
    $("#isComeNg").prop("checked", isComeNg);
    $("#isComeDel").prop("checked", isComeDel);
    $("#elmFullNg").val(fullNg);
    $("#isInpWinBottom").prop("checked", isInpWinBottom);
    $("#isCustomPostWin").prop("checked", isCustomPostWin);
    $("#isCancelWheel").prop("checked", isCancelWheel);
    $("#isTimeVisible").prop("checked", isTimeVisible);
    $("#isSureReadComment").prop("checked", isSureReadComment);
}
function closeOption(){
    $("#settcont").css("display","none");
}
function delayset(){
    //シングルクリックで真っ黒を解除
    var pwaku=$('[class^="style__overlap___"]');
    var slidecont = $('[class^="TVContainer__side___"]');
    if(pwaku[0]&&slidecont[0]){
        pwaku[0].addEventListener("click",function(){
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if(come[1]){
                if(isNaN(parseInt(come[1].innerHTML))){
                    //CM中は切り替えする
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
                    //本編中は切替しない(真っ黒になっちゃった時の解除用)
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
            }
        },false);
        //設定ウィンドウ・開くボタン設置
        //中身は参照でなくここに直接記述した(ローカルのoption.htmlが参照できなかった)
        var optionbutton = document.createElement("div");
        optionbutton.id = "optionbutton";
        optionbutton.setAttribute("style","width:40px;height:60px;background-color:gray;opacity:0.5;");
        optionbutton.innerHTML = "&nbsp;";
        var settcont = document.createElement("div");
        settcont.id = "settcont";
        //設定ウィンドウの中身
        //ただちに反映できなかった入力欄一行化は省いたけど、やる気になれば多分反映できる（これを書いた人にその気が無かった）
        //ただちには反映できなかったけどやる気になったコメ欄非表示切替は反映できた
        settcont.innerHTML = "<input type=checkbox id=isResizeScreen>:ウィンドウサイズに合わせて映像の端が切れないようにリサイズ<br><input type=checkbox id=isDblFullscreen>:ダブルクリックで全画面表示に切り替え<br><input type=checkbox id=isEnterSubmit>:エンターでコメント送信<br><input type=checkbox id=isHideOldComment>:古いコメントを非表示(コメント欄のスクロールバーがなくなります。)<br><input type=checkbox id=isCMBlack>:CM時画面真っ黒<br><input type=checkbox id=isCMBkTrans>:↑を下半分だけ少し透かす<br><input type=checkbox id=isCMsoundoff>:CM時音量ミュート<br><input type=checkbox id=isMovingComment>:新着コメントをあの動画サイトのように横に流す<br>↑のコメントの速さ(2pxあたりのミリ秒を入力、少ないほど速い):<input type=number id=movingCommentSpeed><br>↑のコメントの同時表示上限:<input type=number id=movingCommentLimit><br><input type=checkbox id=isComeNg>:流れるコメントから規定の単語を除去(顔文字,連続する単語など)<br><input type=checkbox id=isComeDel>:以下で設定した単語が含まれるコメントは流さない(1行1つ、/正規表現/i可、//コメント)<br><textarea id=elmFullNg rows=3 cols=40 wrap=off></textarea><br><input type=checkbox id=isInpWinBottom>:コメント入力欄の位置を下へ・コメント一覧を逆順・下へスクロール<br><input type=checkbox id=isCustomPostWin disabled>:投稿ボタン削除・入力欄1行化　※この設定はここで変更不可<br><input type=checkbox id=isCancelWheel>:マウスホイールによる番組移動を禁止する<br><input type=checkbox id=isTimeVisible>:コメント入力欄の近くに番組残り時間を表示<br><input type=checkbox id=isSureReadComment disabled>:常にコメント欄を表示する　※この設定はここで変更不可<br><br><input type=button id=saveBtn value=一時保存><br>※ここでの設定はこのタブでのみ保持され、このタブを閉じると全て破棄されます。<br>";
        settcont.style = "width:600px;position:absolute;right:40px;bottom:-100px;background-color:white;opacity:0.8;padding:20px;display:none;z-index:12;";
        if (slidecont[0]){ //画面右に設定ウィンドウ開くボタン設置
            slidecont[0].appendChild(optionbutton);
            slidecont[0].appendChild(settcont); //設定ウィンドウ設置
        }
        $("#optionbutton").on("click",function(){
            if($("#settcont").css("display")=="none"){
                openOption();
            }else{
                closeOption();
            }
        });
        $("#saveBtn").on("click",function(){
            isResizeScreen = $("#isResizeScreen").prop("checked");
            isDblFullscreen = $("#isDblFullscreen").prop("checked");
            isEnterSubmit = $("#isEnterSubmit").prop("checked");
            isHideOldComment = $("#isHideOldComment").prop("checked");
            isCMBlack = $("#isCMBlack").prop("checked");
            isCMBkTrans = $("#isCMBkTrans").prop("checked");
            isCMsoundoff = $("#isCMsoundoff").prop("checked");
            isMovingComment = $("#isMovingComment").prop("checked");
            movingCommentSpeed = parseInt($("#movingCommentSpeed").val());
            movingCommentLimit = parseInt($("#movingCommentLimit").val());
            isComeNg = $("#isComeNg").prop("checked");
            isComeDel = $("#isComeDel").prop("checked");
            fullNg = $("#elmFullNg").val();
            var beforeInpWinBottom=isInpWinBottom;
            isInpWinBottom = $("#isInpWinBottom").prop("checked");
            //isCustomPostWin = $("#isCustomPostWin").prop("checked");
            isCancelWheel = $("#isCancelWheel").prop("checked");
            isTimeVisible = $("#isTimeVisible").prop("checked");
            //isSureReadComment = $("#isSureReadComment").prop("checked");
            var hideCommentParam = 142;
            if (isCustomPostWin){
                hideCommentParam=64;
            }
            var comeList = $('[class*="styles__comment-list___"]');
            var comeForm = $('[class*="styles__comment-form___"]');
            if(isHideOldComment){
                comeList.css("overflow","hidden");
            }else{
                comeList.css("overflow-y","scroll");
            }
            var contCome = $('[class^="TVContainer__right-comment-area___"]');
            if(beforeInpWinBottom!=isInpWinBottom){ //ソート
                for(var i=0;i<EXcomelist.childElementCount;i++){
                    EXcomelist.insertBefore(EXcomelist.children[i],EXcomelist.firstChild);
                }
            }
            if(isInpWinBottom){
                contCome.css("position","absolute");
                comeForm.css("position","absolute");
                comeForm.css("top","");
                comeForm.css("bottom",0);
                comeList.css("position","absolute");
                comeList.css("bottom","");
                comeList.css("top",0);
                if(comeList.css("display")=="none"){
                    contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
                    contCome.css("height",hideCommentParam+"px");
                }else{
                    contCome.css("top","44px");
                    contCome.css("height",(window.innerHeight-44-61)+"px");
                    comeList.css("width","100%");
                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                }
                $("#forProEndBk").css("bottom",0);
                $("#forProEndTxt").css("bottom",0);
                if(isSureReadComment){
                    $('[class^="styles__full-screen___"]button').css("bottom",(80+hideCommentParam)+"px");
                    $('[class^="styles__volume___"]div').css("bottom",(80+hideCommentParam)+"px");
                }else{
                    $('[class^="styles__full-screen___"]button').css("bottom","");
                    $('[class^="styles__volume___"]div').css("bottom","");
                    if(comeList.css("display")=="none"){
                        contCome.css("top",(window.innerHeight-hideCommentParam)+"px");
                    }else{
                        contCome.css("top",0);
                        contCome.css("height",window.innerHeight+"px");
                        comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
                    }
                }
            }else{
                $('[class^="styles__full-screen___"]button').css("bottom","");
                $('[class^="styles__volume___"]div').css("bottom","");
                contCome.css("position","absolute");
                contCome.css("top","44px");
                comeForm.css("position","absolute");
                comeForm.css("bottom","");
                comeForm.css("top",0);
                comeList.css("position","absolute");
                comeList.css("top","");
                comeList.css("bottom",0);
                if(comeList.css("display")=="none"){
                    contCome.css("height",hideCommentParam+"px");
                }else{
                    contCome.css("height",(window.innerHeight-44-61)+"px");
                    comeList.css("width","100%");
                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                }
                $("#forProEndBk").css("bottom","");
                $("#forProEndTxt").css("bottom","");
                if(!isSureReadComment){
                    contCome.css("top",0);
                    if(comeList.css("display")=="none"){
                    }else{
                        contCome.css("height",window.innerHeight+"px");
                        comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
                    }
                }
            }
            $("#settcont").css("display","none");
            closeOption();
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

        if(isSureReadComment){
            popElement();
            var contCome = $('[class^="TVContainer__right-comment-area___"]');
            var comeForm = $('[class*="styles__comment-form___"]');
            var comeList = $('[class*="styles__comment-list___"]');
            var hideCommentParam = 142;
            if (isCustomPostWin){
                hideCommentParam=64;
            }
            if(isInpWinBottom){
                $('[class^="styles__full-screen___"]button').css("bottom",(80+hideCommentParam)+"px");
                $('[class^="styles__volume___"]div').css("bottom",(80+hideCommentParam)+"px");
                if(comeList.css("display")=="none"){
                    contCome.css("position","absolute");
                    contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
                    contCome.css("height",hideCommentParam+"px");
                    comeForm.css("position","absolute");
                    comeForm.css("top","");
                    comeForm.css("bottom",0);
                    comeForm.css("height",hideCommentParam+"px");
                    comeList.css("position","absolute");
//                    comeList.css("bottom","");
//                    comeList.css("top",0);
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                    comeList.css("width","100%");
                }else{
                    contCome.css("position","absolute");
                    contCome.css("top","44px");
                    contCome.css("height",(window.innerHeight-44-61)+"px");
                    comeForm.css("position","absolute");
                    comeForm.css("top","");
                    comeForm.css("bottom",0);
                    comeForm.css("height",hideCommentParam+"px");
                    comeList.css("position","absolute");
                    comeList.css("bottom","");
                    comeList.css("top",0);
                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                    comeList.css("width","100%");
                }
            }else{
                $('[class^="styles__full-screen___"]button').css("bottom","");
                $('[class^="styles__volume___"]div').css("bottom","");
                if(comeList.css("display")=="none"){
                    contCome.css("position","absolute");
                    contCome.css("top","44px");
                    contCome.css("height",hideCommentParam+"px");
                    comeForm.css("position","absolute");
                    comeForm.css("bottom","");
                    comeForm.css("top",0);
                    comeForm.css("height",hideCommentParam+"px");
                    comeList.css("position","absolute");
//                    comeList.css("top","");
//                    comeList.css("bottom",0);
//                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                    comeList.css("width","100%");
                }else{
                    contCome.css("position","absolute");
                    contCome.css("top","44px");
                    contCome.css("height",(window.innerHeight-44-61)+"px");
                    comeForm.css("position","absolute");
                    comeForm.css("bottom","");
                    comeForm.css("top",0);
                    comeForm.css("height",hideCommentParam+"px");
                    comeList.css("position","absolute");
                    comeList.css("top","");
                    comeList.css("bottom",0);
                    comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
                    comeList.css("width","100%");
                }
            }
            //各要素を隠すまでのカウントをマウスオーバーで5にリセット
            window.addEventListener("mousemove",function(e){
                if (isSureReadComment){ //設定ウィンドウ反映用
                    if(forElementClose<5){
                        forElementClose=5;
                        popElement(); //各要素を表示
                    }
                }
            },true);
        }
        //右下にコメント一覧表示切替を設置
        $('[class^="TVContainer__footer___"] [class*="styles__right-container___"]').on("click",function(){
            if(isSureReadComment){
                if($('[class^="TVContainer__right-comment-area___"][class*="TVContainer__right-slide--shown___"]').length>0){ //コメント一覧が表示状態のとき
                    toggleCommentList();
                }
            }
        });
        $('[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]').on("click",function(e){
            //コメント一覧の表示切替 ボタンならそのまま
            if(e.target.tagName.toLowerCase()=='div'){
                toggleCommentList();
            }
        });
        $('[class^="TVContainer__right-comment-area___"] [class*="styles__comment-form___"]>form').on("click",function(e){
            //枠から↑へのバブルを止める
            if(e.target.tagName.toLowerCase()=='div'){
                e.stopPropagation();
            }
        });
        EXcomelist = $('[class*="styles__comment-list___"]')[0];
        EXcomments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');

        console.log("delayset ok");
    }else{
        retrycount+=1;
        if(retrycount<4){
            console.log("delayset failed#"+retrycount);
            setTimeout(delayset,retrytick[retrycount]);
        }
    }
}
function toggleCommentList(){
    var contCome = $('[class^="TVContainer__right-comment-area___"]');
    var comeList = $('[class*="styles__comment-list___"]');
    var hideCommentParam = 142;
    if (isCustomPostWin){
        hideCommentParam=64;
    }
    var clipSlideBarTop = 0;
    var clipSlideBarBot = 0;
    if(isSureReadComment){
        clipSlideBarTop = 44;
        clipSlideBarBot = 61;
    }
    if(isInpWinBottom){
        if(comeList.css("display")=="none"){
            comeList.css("display","block");
            comeList.css("height",(window.innerHeight-hideCommentParam-clipSlideBarTop-clipSlideBarBot)+"px");
            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
            contCome.css("top",clipSlideBarTop+"px");
        }else{
            comeList.css("display","none");
            contCome.css("top",(window.innerHeight-hideCommentParam-clipSlideBarBot)+"px");
            contCome.css("height",hideCommentParam+"px");
        }
    }else{
        if(comeList.css("display")=="none"){
            comeList.css("display","block");
            contCome.css("height",(window.innerHeight-clipSlideBarTop-clipSlideBarBot)+"px");
        }else{
            comeList.css("display","none");
            contCome.css("height",hideCommentParam+"px");
        }
    }
}
function StartMoveComment(){
    if($('#moveContainer').children().length>0){
        $('#moveContainer').animate({"left":"-="+Math.floor(2000/movingCommentSpeed)+"px"},{duration:1000,easing:"linear",complete:StartMoveComment});
    }else{
        $('#moveContainer').css("left","1px");
    }
}
function popElement(){
    //マウスオーバーで各要素表示
    $('[class^="TVContainer__right-slide___"]').css("z-index",11);
    $('[class^="TVContainer__side___"]').css("transform","translate(0,-50%)");
    $('[class^="TVContainer__right-list-slide___"]').css("z-index",11);
    var contHeader = $('[class^="AppContainer__header-container___"]');
    var comeList = $('[class*="styles__comment-list___"]');
    var oldcontVisible = contHeader.css("visibility");
    contHeader.css("visibility","visible");
    contHeader.css("opacity",1);
    var contFooter = $('[class^="TVContainer__footer-container___"]');
    contFooter.css("visibility","visible");
    contFooter.css("opacity",1);
    var contCome = $('[class^="TVContainer__right-comment-area___"]');
    contCome.css("transform","translateX(0px)");
    contCome.css("position","absolute");
    var hideCommentParam = 142;
    if (isCustomPostWin){
        hideCommentParam=64;
    }
    if(isInpWinBottom){
        if(comeList.css("display")=="none"){
            contCome.css("top",(window.innerHeight-hideCommentParam-61)+"px");
            contCome.css("height",hideCommentParam+"px");
        }else{
            contCome.css("top","44px");
            contCome.css("height",(window.innerHeight-44-61)+"px");
            comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
        }
    }else{
        contCome.css("top","44px");
        if(comeList.css("display")=="none"){
            contCome.css("height",hideCommentParam+"px");
        }else{
            contCome.css("height",(window.innerHeight-44-61)+"px");
            comeList.css("position","absolute");
            comeList.css("width","100%");
            comeList.css("height",(window.innerHeight-hideCommentParam-44-61)+"px");
        }
    }
    if(oldcontVisible !="visible"){
        if(isInpWinBottom){
            comeList[0].scrollTop = comeList[0].scrollHeight;
        }
    }
}
$(window).on('load', function () {
    console.log("loaded");
    var csspath = chrome.extension.getURL("onairpage.css");
    $("<link rel='stylesheet' href='" + csspath + "'>").appendTo("head");
    //ダブルクリックでフルスクリーン
    $(window).on("dblclick",function(){
        console.log("dblclick");
        if (isDblFullscreen) {
                    $('[class*="styles__full-screen___"],[class*="styles__exit-fullscreen___"]').trigger("click");
        }
    });
    //ウィンドウをリサイズ
    setTimeout(onresize, 1000);
    //マウスホイール無効
    if (isCancelWheel){
        window.addEventListener("mousewheel",function(e){
            if (isCancelWheel){ //設定ウィンドウ反映用
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
        var hideOldCommentCSS = '[class*="styles__comment-list___"]{overflow: hidden;}';
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
        //コメント取得
//        var comments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
//        var newCommentNum = comments.length - commentNum;
//        if (commentNum != 0){
//            if (isMovingComment) {
//                for (var i = commentNum;i < comments.length; i += 1){
//                    putComment(comments[comments.length-i-1].innerHTML);
//                }
//            }
//        }
//        commentNum = comments.length;
//        EXcomelist = $('[class*="styles__comment-list___"]')[0];
        if(EXcomelist){
            var comeListLen = EXcomelist.childElementCount;
            if(comeListLen>commentNum){ //コメ増加あり
                //入力欄が下にあるときはソート
                if(isInpWinBottom){
                    for(var i=commentNum;i<comeListLen;i++){
                        EXcomelist.insertBefore(EXcomelist.children[i],EXcomelist.firstChild);
                    }
                    //ソートした後でコメントを流す 最初は流さない
                    if(isMovingComment&&commentNum>1){
                        for(var i=Math.max(comeListLen-movingCommentLimit,commentNum);i<comeListLen;i++){
                            putComment(EXcomelist.children[i].firstChild.innerHTML);
                        }
                    }
                    EXcomelist.scrollTop = EXcomelist.scrollHeight;
                }else if(isMovingComment){
                    for(var i=Math.min(movingCommentLimit,(comeListLen-commentNum))-1;i>=0;i--){
                        putComment(EXcomelist.children[i].firstChild.innerHTML);
                    }
                }
                commentNum=comeListLen;
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
        //CM時画面真っ黒
        if (isCMBlack) {
            var pwaku = $('[class^="style__overlap___"]'); //動画枠
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if(pwaku[0]&&come[1]){
                //切替時のみ動作
                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
                    //今CMで直前が本編(=CM開始?)
                    if(isCMBkTrans){
                            screenBlackSet(1);
                    }else{
                        screenBlackSet(3);
                    }
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今本編で直前がCM(=CM終了?)
                    screenBlackSet(0);
                }
            }
        }

        //CM時音量ミュート
        if (isCMsoundoff){
            var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]'); //高さが音量のやつ
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if (valvol[0]&&come[1]){
                if(isNaN(parseInt(come[1].innerHTML))&&comeLatestCount>=0){
                    //今CMで直前が本編(=CM開始?)
                    soundSet(false);
                }else if(!isNaN(parseInt(come[1].innerHTML))&&comeLatestCount<0){
                    //今本編で直前がCM(=CM終了?)
                    soundSet(true);
                }
            }
        }

        var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
        if(come[1]){
            if(isNaN(parseInt(come[1].innerHTML))){
                comeLatestCount=-1;
            }else{
                comeLatestCount=parseInt(come[1].innerHTML);
            }
        }else{
            comeLatestCount=-1;
        }

        //投稿ボタン削除・入力欄1行化(初回クリック時と4行以上入力時に大きくなるのを防ぐ)
        if (isCustomPostWin){
            var postwin = $('[class^="styles__opened-textarea-wrapper___"]');
            if (postwin[0]&&postwin[0].hasChildNodes()&&postwin[0].children[1]){
                postwin[0].children[0].style.height="18px";
                postwin[0].children[1].style.height="18px";
            }
        }

        //コメント入力欄に改行が含まれていたら送信
        if (isEnterSubmit){
            var butsend = $('[class*="styles__post-wrapper___"] button');
            var inpcome = $('[class*="styles__comment-form___"] textarea').val();
            if(inpcome&&inpcome.match(/[\n\r]/g)&&inpcome.replace(/[\n\r]/g,"").length>0&&!butsend[0].hasAttribute('disabled')){
                //送信前に改行は除去
                console.log("post");
                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
                $('[class*="styles__post-button"]').trigger("click");
                $('[class*="styles__comment-form___"] textarea').val("");
            }else if(inpcome){
                //エンター送信なら改行は除去
                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
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
            if($("#forProEndBk").length==0){
                var rightCommentArea = $('[class^="TVContainer__right-comment-area___"]');
                if(rightCommentArea[0]){
                    var eForProEndBk = document.createElement("span");
                    eForProEndBk.id="forProEndBk";
                    eForProEndBk.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;background-color:rgba(255,255,255,0.2);z-index:13;");
                    eForProEndBk.innerHTML="&nbsp;";
                    rightCommentArea[0].insertBefore(eForProEndBk,rightCommentArea[0].firstChild);
                    var eForProEndTxt = document.createElement("span");
                    eForProEndTxt.id="forProEndTxt";
                    eForProEndTxt.setAttribute("style","position:absolute;right:0;font-size:x-small;padding:0px 5px;color:rgba(255,255,255,0.8);text-align:right;letter-spacing:1px;z-index:11;");
                    eForProEndTxt.innerHTML=strProEnd;
                    rightCommentArea[0].insertBefore(eForProEndTxt,rightCommentArea[0].firstChild);
                    if (isInpWinBottom) {
                        $("#forProEndBk").css("bottom",0);
                        $("#forProEndTxt").css("bottom",0);
                    }
                    $("#forProEndBk").css("width",Math.floor(100*forProEnd/proLength)+"%");
                    //残り時間クリックで設定ウィンドウ開閉
                    $("#forProEndBk").on("click",function(){
                        if($("#settcont").css("display")=="none"){
                            openOption();
                        }else{
                            closeOption();
                        }
                    });
                }
            }else{
                $("#forProEndTxt").html(strProEnd);
                if(forProEnd>0){
                    $("#forProEndBk").css("width",Math.floor(100*forProEnd/proLength)+"%");
                }else{
                    $("#forProEndBk").css("width","100%");
                }
            }
        }else{
            while($("#forProEndTxt").length>0){
                $("#forProEndTxt").remove();
            }
            while($("#forProEndBk").length>0){
                $("#forProEndBk").remove();
            }
        }
        //コメント欄を常時表示
        if(isSureReadComment){
            //右下をクリックできそうならクリック
            if($('[class^="TVContainer__right-comment-area___"][class*="TVContainer__right-slide--shown___"]').length==0){ //コメント一覧が表示状態でないとき
                if($('[class^="TVContainer__right-slide___"][class*="TVContainer__right-slide--shown___"]').length==0){ //番組情報が表示状態でないとき
                    if($('[class^="TVContainer__right-list-slide___"][class*="TVContainer__right-slide--shown___"]').length==0){ //放送中一覧が表示状態でないとき
                        if($('[class^="TVContainer__footer___"] [class*="styles__right-container___"][class*="styles__right-container-not-clickable___"]').length==0){ //右下ボタンが押下可能設定のとき
                            $('[class^="TVContainer__footer___"] [class*="styles__right-container___"]').trigger("click");
                        }
                    }
                }
            }
            //各要素を隠すまでのカウントダウン
            if(forElementClose>0){
                forElementClose-=1;
                if(forElementClose<=0){
                    //各要素を隠す
                    $('[class^="TVContainer__side___"]').css("transform","");
                    var contHeader = $('[class^="AppContainer__header-container___"]');
                    contHeader.css("visibility","");
                    contHeader.css("opacity","");
                    var contFooter = $('[class^="TVContainer__footer-container___"]');
                    contFooter.css("visibility","");
                    contFooter.css("opacity","");
                    var comeList = $('[class*="styles__comment-list___"]');
                    var contCome = $('[class^="TVContainer__right-comment-area___"]');
                    contCome.css("position","absolute");
                    var hideCommentParam = 142;
                    if (isCustomPostWin){
                        hideCommentParam=64;
                    }
                    if(isInpWinBottom){
                        if(comeList.css("display")=="none"){
                            contCome.css("position","absolute");
                            contCome.css("top",(window.innerHeight-hideCommentParam)+"px");
                            contCome.css("height",hideCommentParam+"px");
                        }else{
                            contCome.css("position","absolute");
                            contCome.css("top",0);
                            contCome.css("height",window.innerHeight+"px");
                            comeList.css("position","absolute");
                            comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
                        }
                    }else{
                        if(comeList.css("display")=="none"){
                            contCome.css("position","absolute");
                            contCome.css("top",0);
                            contCome.css("height",hideCommentParam+"px");
                        }else{
                            contCome.css("position","absolute");
                            contCome.css("top",0);
                            contCome.css("height",window.innerHeight+"px");
                            comeList.css("position","absolute");
                            comeList.css("height",(window.innerHeight-hideCommentParam)+"px");
                        }
                    }
                }
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

    }, 1000);
    setTimeout(onresize, 1000);
    setTimeout(delayset,1000);
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
