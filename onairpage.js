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
var isCMBlack = false; //CM時画面真っ黒
var isCMBkTrans = false; //CM時画面真っ黒を少し透かす
var isCMsoundoff = false; //CM時音量ミュート
var isMovingComment = false; //あの動画サイトのように画面上をコメントが流れる(コメント欄を表示しているときのみ機能)
var movingCommentSpeed = 15;//2pxあたりの時間(ms)
var movingCommentLimit = 30;//同時コメント最大数
var isHideCommentList = false; //コメントリストを非表示、かつコメント入力欄を下の方へ。
var isCustomPostWin = false; //コメント投稿ボタン等を非表示、かつコメント入力欄を1行化。
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
});


console.log("script loaded");
var currentLocation = window.location.href;
// jqueryを開発者コンソールから使う
var jquerypath = chrome.extension.getURL("jquery-2.2.3.min.js");
$("<script src='"+jquerypath+"'></script>").appendTo("head");
var commentNum = 0;
var comeLatestPosi1=0;
var comeLatestPosi2=0;

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
    //直近2回のコメ位置を避け、上下端も避ける
    var commentTop = comeLatestPosi1 + 100 + Math.floor(Math.random()*(window.innerHeight-200))
    if (Math.abs(commentTop-comeLatestPosi2)<100){
        commentTop+=200;
    }
    if (commentTop>(window.innerHeight-150)){
        commentTop-=(window.innerHeight-150)
    }
    if (commentTop<100){
        commentTop=100;
    }
    comeLatestPosi2=comeLatestPosi1;
    comeLatestPosi1=commentTop;
    var commentElement = $("<span class='movingComment' style='position:absolute;top:"+commentTop+"px;left:"+window.innerWidth+"px;'>" + commentText + "</div>").appendTo("body");
    var commentWidth = commentElement.width();
    var commentLeftEnd = -1*commentWidth;
    setTimeout(function (){moveComment(commentElement, commentLeftEnd);},Math.random()*1000);
    //moveComment(commentElement);
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
        var btn = $('[class^="styles__continue-btn___"]'); //新着コメのボタン
        if (btn) {
            //var newCommentNum = parseInt(btn.text().match("^[0-9]+"));
            btn.trigger("click");// 1秒毎にコメントの読み込みボタンを自動クリック
        }
        //コメント取得
        var comments = $('[class^="TVContainer__right-comment-area___"] [class^="styles__message___"]');
        var newCommnetNum = comments.length - commentNum;
        if (commentNum != 0){
            if (isMovingComment) {
                for (var i = commentNum;i < comments.length; i += 1){
                    putComment(comments[comments.length-i-1].innerHTML)

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
                if (isNaN(parseInt(come[1].innerHTML))) {
                    if(isCMBkTrans){
                        pwaku[0].setAttribute("style","background-color:rgba(0,0,0,0.6);");
                    }else{
                        pwaku[0].setAttribute("style","background-color:black;");
                    }
                }else{
                    pwaku[0].removeAttribute("style");
                }
            }
        }
        //CM時音量ミュート
        if (isCMsoundoff){
            var butvol=$('[class*="styles__volume___"] svg');
            var valvol=$('[class^="styles__volume___"] [class^="styles__highlighter___"]');
            var evt=document.createEvent("MouseEvents");
            evt.initEvent("click",true,true);
            var come = $('[class*="styles__counter___"]'); //画面右下のカウンター
            if (valvol[0]&&come[1]){
                valvol=parseInt(valvol[0].style.height);
                if (isNaN(parseInt(come[1].innerHTML))) {
                    if(valvol!=0){
                        butvol[0].dispatchEvent(evt);
                    }
                }else{
                    if(valvol==0){
                        butvol[0].dispatchEvent(evt);
                    }
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
                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
                $('[class*="styles__post-button"]').trigger("click");
                $('[class*="styles__comment-form___"] textarea').val("");
            }else if(inpcome){
                $('[class*="styles__comment-form___"] textarea').val(inpcome.replace(/[\n\r]/g,""));
            }
        }

    }, 1000);
    setTimeout(onresize, 1000);
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