$(function(){
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
        var isHideCommentList = value.hideCommentList || false;
        var isCustomPostWin = value.customPostWin || false;
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
        $("#isHideCommentList").prop("checked", isHideCommentList);
        $("#isCustomPostWin").prop("checked", isCustomPostWin);
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
        "hideCommentList": $("#isHideCommentList").prop("checked"),
        "customPostWin": $("#isCustomPostWin").prop("checked")
    }, function () {
        $("#info").show().text("設定保存しました").fadeOut(4000);
    });
});
});
