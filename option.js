$(function(){
    $("#settingsArea").html(generateOptionHTML(true));
    $("#CommentMukouSettings").hide();
    chrome.storage.local.get(function (value) {
        var isResizeScreen = value.resizeScreen || false;
        console.log(value.movingCommentLimit)
        var isDblFullscreen = value.dblFullscreen || false;
        var isEnterSubmit = value.enterSubmit || false;
        var isHideOldComment = value.hideOldComment || false;
        var isCMBlack = value.CMBlack || false;
        var isCMBkTrans = value.CMBkTrans || false;
        var isCMsoundoff = value.CMsoundoff || false;
        var isMovingComment = value.movingComment || false;
        var movingCommentSpeed = value.movingCommentSpeed || 15;
        var movingCommentLimit = value.movingCommentLimit || 30;
        var isMoveByCSS =　value.moveByCSS || false;
        var isComeNg = value.comeNg || false;
        var isComeDel = value.comeDel || false;
        var valFullNg = value.fullNg || "";
        var isInpWinBottom = value.inpWinBottom || false;
        var isCustomPostWin = value.customPostWin || false;
        var isCancelWheel = value.cancelWheel || false;
        var isVolumeWheel = value.volumeWheel || false;
        var changeMaxVolume = Math.min(100,Math.max(0,(value.changeMaxVolume || 100)));
        var isTimeVisible = value.timeVisible || false;
        var isSureReadComment = value.sureReadComment || false;
        var isAlwaysShowPanel = value.isAlwaysShowPanel || false;
        var isMovieResize = value.movieResize || false;
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
        $("#isAlwaysShowPanel").prop("checked", isAlwaysShowPanel);
        $("#isMovieResize").prop("checked", isMovieResize);
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
            "movingComment": $("#isMovingComment").prop("checked"),
            "movingCommentSpeed": parseInt($("#movingCommentSpeed").val()),
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
            "isAlwaysShowPanel": $("#isAlwaysShowPanel").prop("checked"),
            "movieResize": $("#isMovieResize").prop("checked")
        }, function () {
            $("#info").show().text("設定保存しました").fadeOut(4000);
        });
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
