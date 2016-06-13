$(function(){
    $("#settingsArea").html(generateOptionHTML(true));
    $("#CommentMukouSettings").hide();
    $("#CommentColorSettings").css("width","600px")
      .css("background-color","darkgreen")
      .css("padding","8px")
      .children('div').css("clear","both")
      .children('span.desc').css("padding","0px 4px")
      .next('span.prop').css("background-color","white")
      .css("padding","0px 4px")
      .next('input[type="range"]').css("float","right")
    ;
    $("#itimePosition").insertBefore("#isTimeVisible+*")
      .css("border","black solid 1px")
      .css("margin-left","16px")
      .css("display","flex")
      .css("flex-direction","column")
    ;
    chrome.storage.local.get(function (value) {
        var isResizeScreen = value.resizeScreen || false;
        console.log(value.movingCommentLimit)
        var isDblFullscreen = value.dblFullscreen || false;
        var isEnterSubmit = value.enterSubmit || false;
        var isHideOldComment = value.hideOldComment || false;
        var isCMBlack = value.CMBlack || false;
        var isCMBkTrans = value.CMBkTrans || false;
        var isCMsoundoff = value.CMsoundoff || false;
        var CMsmall = Math.min(100,Math.max(5,((value.CMsmall!==undefined)?value.CMsmall : 100)));
        var isMovingComment = value.movingComment || false;
        var movingCommentSecond = (value.movingCommentSecond!==undefined)?value.movingCommentSecond : 10;
        var movingCommentLimit = (value.movingCommentLimit!==undefined)?value.movingCommentLimit : 30;
        var isMoveByCSS =　value.moveByCSS || false;
        var isComeNg = value.comeNg || false;
        var isComeDel = value.comeDel || false;
        var valFullNg = value.fullNg || "";
        var isInpWinBottom = value.inpWinBottom || false;
        var isCustomPostWin = value.customPostWin || false;
        var isCancelWheel = value.cancelWheel || false;
        var isVolumeWheel = value.volumeWheel || false;
        var changeMaxVolume = Math.min(100,Math.max(0,((value.changeMaxVolume!==undefined)?value.changeMaxVolume : 100)));
        var isTimeVisible = value.timeVisible || false;
        var isSureReadComment = value.sureReadComment || false;
        var sureReadRefreshx = Math.max(101,((value.sureReadRefreshx!==undefined)?value.sureReadRefreshx : 2000000));
        var isAlwaysShowPanel = value.isAlwaysShowPanel || false;
//        var isMovieResize = value.movieResize || false;
        var isMovieMaximize = value.movieMaximize || false;
        var commentBackColor = (value.commentBackColor!==undefined)?value.commentBackColor : 255;
        var commentBackTrans = (value.commentBackTrans!==undefined)?value.commentBackTrans : 127;
        var commentTextColor = (value.commentTextColor!==undefined)?value.commentTextColor : 0;
        var commentTextTrans = (value.commentTextTrans!==undefined)?value.commentTextTrans : 255;
        var isCommentPadZero = value.commentPadZero || false;
        var isCommentTBorder = value.commentTBorder || false;
        var timePosition = value.timePosition || "windowtop";
        var notifyMinutes = (value.notifyMinutes!==undefined)?value.notifyMinutes : 1;
        $("#isResizeScreen").prop("checked", isResizeScreen);
        $("#isDblFullscreen").prop("checked", isDblFullscreen);
        $("#isEnterSubmit").prop("checked", isEnterSubmit);
        $("#isHideOldComment").prop("checked", isHideOldComment);
        $("#isCMBlack").prop("checked", isCMBlack);
        $("#isCMBkTrans").prop("checked", isCMBkTrans);
        $("#isCMsoundoff").prop("checked", isCMsoundoff);
        $("#CMsmall").val(CMsmall);
        $("#isMovingComment").prop("checked", isMovingComment);
        $("#movingCommentSecond").val(movingCommentSecond);
        $("#movingCommentLimit").val(movingCommentLimit);
        $("#isMoveByCSS").prop("checked", isMoveByCSS);
        $("#isComeNg").prop("checked", isComeNg);
        $("#isComeDel").prop("checked", isComeDel);
        $("#fullNg").val(valFullNg);
        $("#isInpWinBottom").prop("checked", isInpWinBottom);
        $("#isCustomPostWin").prop("checked", isCustomPostWin);
        $("#isCancelWheel").prop("checked", isCancelWheel);
        $("#isVolumeWheel").prop("checked", isVolumeWheel);
        $("#changeMaxVolume").val(changeMaxVolume);
        $("#isTimeVisible").prop("checked", isTimeVisible);
        $("#isSureReadComment").prop("checked", isSureReadComment);
        $("#sureReadRefreshx").val(sureReadRefreshx);
        $("#isAlwaysShowPanel").prop("checked", isAlwaysShowPanel);
//        $("#isMovieResize").prop("checked", isMovieResize);
        $("#isMovieMaximize").prop("checked", isMovieMaximize);
        var bc="rgba("+commentBackColor+","+commentBackColor+","+commentBackColor+","+(commentBackTrans/255)+")";
        var tc="rgba("+commentTextColor+","+commentTextColor+","+commentTextColor+","+(commentTextTrans/255)+")";
        $("#CommentColorSettings>div>span.desc").css("background-color",bc)
          .css("color",tc)
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
        $("#notifyMinutes").val(notifyMinutes);
    });
    $("#saveBtn").click(function () {
        chrome.storage.local.set({
            "resizeScreen": $("#isResizeScreen").prop("checked"), 
            "dblFullscreen": $("#isDblFullscreen").prop("checked"),
            "enterSubmit": $("#isEnterSubmit").prop("checked"),
            "hideOldComment": $("#isHideOldComment").prop("checked"),
            "CMBlack": $("#isCMBlack").prop("checked"),
            "CMBkTrans": $("#isCMBkTrans").prop("checked"),
            "CMsoundoff": $("#isCMsoundoff").prop("checked"),
            "CMsmall": Math.min(100,Math.max(5,parseInt($("#CMsmall").val()))),
            "movingComment": $("#isMovingComment").prop("checked"),
            "movingCommentSecond": parseInt($("#movingCommentSecond").val()),
            "movingCommentLimit": parseInt($("#movingCommentLimit").val()),
            "moveByCSS": $("#isMoveByCSS").prop("checked"),
            "comeNg": $("#isComeNg").prop("checked"),
            "comeDel": $("#isComeDel").prop("checked"),
            "fullNg": $("#fullNg").val(),
            "inpWinBottom": $("#isInpWinBottom").prop("checked"),
            "customPostWin": $("#isCustomPostWin").prop("checked"),
            "cancelWheel": $("#isCancelWheel").prop("checked"),
            "volumeWheel": $("#isVolumeWheel").prop("checked"),
            "changeMaxVolume": Math.min(100,Math.max(0,parseInt($("#changeMaxVolume").val()))),
            "timeVisible": $("#isTimeVisible").prop("checked"),
            "sureReadComment": $("#isSureReadComment").prop("checked"),
            "sureReadRefreshx": Math.max(101,parseInt($("#sureReadRefreshx").val())),
            "isAlwaysShowPanel": $("#isAlwaysShowPanel").prop("checked"),
//            "movieResize": $("#isMovieResize").prop("checked")
            "movieMaximize": $("#isMovieMaximize").prop("checked"),
            "commentBackColor": parseInt($("#commentBackColor").val()),
            "commentBackTrans": parseInt($("#commentBackTrans").val()),
            "commentTextColor": parseInt($("#commentTextColor").val()),
            "commentTextTrans": parseInt($("#commentTextTrans").val()),
            "commentPadZero": $("#isCommentPadZero").prop("checked"),
            "commentTBorder": $("#isCommentTBorder").prop("checked"),
            "timePosition": $('#itimePosition [name="timePosition"]:checked').val(),
            "notifyMinutes": parseInt($("#notifyMinutes").val())
        }, function () {
            $("#info").show().text("設定保存しました").fadeOut(4000);
        });
    });
    $('#CommentColorSettings').change(function(){
      var p=[];
      $('#CommentColorSettings>div>input[type="range"]').each(function(i,jo){
        $(jo).prev('span.prop').text($(jo).val()+" ("+Math.round($(jo).val()*100/255)+"%)");
        p[i]=$(jo).val();
      });
      $('#CommentColorSettings>div>span.desc').css("background-color","rgba("+p[0]+","+p[0]+","+p[0]+","+(p[1]/255)+")")
        .css("color","rgba("+p[2]+","+p[2]+","+p[2]+","+(p[3]/255)+")")
      ;
    });
});
var keyinput = [];
var keyCodes = "38,38,40,40,37,39,37,39,66,65";
$(window).keyup(function(e){
    keyinput.push(e.keyCode);
    if (keyinput.toString().indexOf(keyCodes) >= 0) {
        $("#CommentMukouSettings").show();
        keyinput = [];
    }
});
