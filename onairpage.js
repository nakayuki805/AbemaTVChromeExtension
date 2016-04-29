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
var isHideCommentList = false; //コメントリストを非表示、かつコメント入力欄を下の方へ。
var isCustomPostWin = false; //コメント投稿ボタン等を非表示、かつコメント入力欄を1行化。
var isCancelWheel = false; //マウスホイールによるページ遷移を抑止する
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
    isHideCommentList = value.hideCommentList || false;
    isCustomPostWin = value.customPostWin || false;
    isCancelWheel = value.cancelWheel || false;
});

console.log("script loaded");
var currentLocation = window.location.href;
// jqueryを開発者コンソールから使う
var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
$("<script src='"+jquerypath+"'></script>").appendTo("head");
var commentNum = 0;
var comeLatestPosi=[];
var comeTTL=4;
var comeLatestLen=10;
comeLatestPosi.length=comeLatestLen;
for(var i=0;i<comeLatestLen;i++){
    comeLatestPosi[i]=[]
    comeLatestPosi[i][0]=0;
    comeLatestPosi[i][1]=comeTTL;
}
var playtick=0;
var comeLatestCount=0;

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
function moveComment(commentElement, commentLeftEnd){
    var commentLeft = commentElement.offset().left - 2;
    commentElement.css("left", commentLeft+"px");
    if (commentLeft > commentLeftEnd) {
        setTimeout(function (){moveComment(commentElement,commentLeftEnd);},movingCommentSpeed);
    }else{
        commentElement.remove();
    }
    
}
function putComment(commentText) {
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
    if(i>=20){
        commentTop=50;
    }
    comeLatestPosi.push([commentTop,comeTTL]);
    comeLatestPosi.shift();
    var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+window.innerWidth+"px;'>" + commentText + "</div>").appendTo("body");
    var commentWidth = commentElement.width();
    var commentLeftEnd = -1*commentWidth;
    setTimeout(function (){moveComment(commentElement, commentLeftEnd);},Math.random()*1000);
    //moveComment(commentElement);
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
function delayset(){
    //シングルクリックで真っ黒を解除
    var pwaku=$('[class^="style__overlap___"]');
    if(pwaku[0]){
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
    if (isCancelWheel){
        window.addEventListener("mousewheel",function(e){
            e.stopImmediatePropagation();
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

    //コメントリスト削除・入力欄を下方へ
    if (isHideCommentList) {
        var hideCommentListCSS1 = '[class*="styles__comment-list___"]{display: none;}';
        var hideCommentParam = 142;
        if (isCustomPostWin){
            hideCommentParam=64;
        }
        var hideCommentListCSS2 = '[class^="TVContainer__right-comment-area___"]{height: auto;position:absolute;top:'+(window.innerHeight-hideCommentParam)+'px;}';
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(hideCommentListCSS1) + "'>").appendTo("head");
        $("<link rel='stylesheet' href='data:text/css," + encodeURI(hideCommentListCSS2) + "'>").appendTo("head");
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
        if (btn[0]) {
            //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
            btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
        }
        //コメント取得
        var comments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
        var newCommnetNum = comments.length - commentNum;
        if (commentNum != 0){
            if (isMovingComment) {
                for (var i = commentNum;i < comments.length; i += 1){
                    putComment(comments[comments.length-i-1].innerHTML);
                }
            }
        }

        commentNum = comments.length;
        var countElements = $('[class^="TVContainer__footer___"] [class*="styles__count___"]')
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

        //流れるコメント過多の場合は消していく
        if (isMovingComment){
            var comments = $(".movingComment");
            if (comments.length > movingCommentLimit){
                for (var j=0;j < comments.length-movingCommentLimit; j+=1){
                    comments[j].remove();
                }
            }
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