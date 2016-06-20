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
        var notifySeconds = (value.notifySeconds!==undefined)?value.notifySeconds : 60;
        var isNotifyAndOpen = value.isNotifyAndOpen || false;
        var isNaOinActive = value.isNaOinActive || false;
        var beforeCMWait = Math.max(0,((value.beforeCMWait!==undefined)?value.beforeCMWait : 0));
        var afterCMWait = Math.max(0,((value.afterCMWait!==undefined)?value.afterCMWait : 0));
        var isManualKeyCtrlR = value.manualKeyCtrlR || false;
        var isManualKeyCtrlL = value.manualKeyCtrlL || false;
        var isManualMouseBR = value.manualMouseBR || false;
        var isCMBkR = (value.CMBkR || false)&&isCMBlack;
        var isCMsoundR = (value.CMsoundR || false)&&isCMsoundoff;
        var isCMsmlR = (value.CMsmlR || false)&&(CMsmall!=100);
        var isTabSoundplay = value.tabSoundplay || false;
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
        $("#notifySeconds").val(notifySeconds);
        $("#isNotifyAndOpen").prop("checked", isNotifyAndOpen);
        $("#isNaOinActive").prop("checked", isNaOinActive);
        $("#beforeCMWait").val(beforeCMWait);
        $("#afterCMWait").val(afterCMWait);
        $("#isManualKeyCtrlR").prop("checked", isManualKeyCtrlR);
        $("#isManualKeyCtrlL").prop("checked", isManualKeyCtrlL);
        $("#isManualMouseBR").prop("checked", isManualMouseBR);
        $("#isCMBkR").prop("checked", isCMBkR);
        $("#isCMsoundR").prop("checked", isCMsoundR);
        $("#isCMsmlR").prop("checked", isCMsmlR);
        $("#isTabSoundplay").prop("checked", isTabSoundplay);
    });
    if($('#settingsArea #CommentMukouSettings .setTables').length==0){
        $('#settingsArea #CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $('<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>').prependTo('#settingsArea #CommentMukouSettings');
        $('#settingsArea #ComeMukouO').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('<table id="setTable">').appendTo('#settingsArea #ComeMukouO');
        $('#settingsArea table#setTable').css("border-collapse","collapse");
        $('<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th colspan=2>音量ミュート</th></tr>').appendTo('#settingsArea table#setTable');
        $('<tr><td>適用</td><td></td><td></td><td></td><td></td><td></td></tr>').appendTo('#settingsArea table#setTable');
        $('<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td colspan=2></td></tr>').appendTo('#settingsArea table#setTable');

        $('#settingsArea #isCMBlack').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(1)');
        $('#settingsArea #isCMBkTrans').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(1)').css("display","none");
        $('<input type="radio" name="cmbktype" value=0>').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(2)')
            .after("全面真黒<br>")
        ;
        $('<input type="radio" name="cmbktype" value=1>').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(2)')
            .after("下半透明")
        ;
        $('#settingsArea table#setTable input[type="radio"][name="cmbktype"]').change(setCMBKChangedR);

        $('#settingsArea #CMsmall').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(3)').after("％")
            .css("text-align","right")
            .css("width","4em")
        ;

        $('#settingsArea #isCMsoundoff').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(4)');
        $('#settingsArea #isTabSoundplay').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(4)').css("display","none");
        $('<input type="radio" name="cmsotype" value=0>').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(5)')
            .after("プレイヤー<br>")
        ;
        $('<input type="radio" name="cmsotype" value=1>').appendTo('#settingsArea table#setTable tr:eq(1)>td:eq(5)')
            .after("タブ設定")
        ;
        $('#settingsArea table#setTable input[type="radio"][name="cmsotype"]').change(setCMsoundChangedR);

        $('#settingsArea table#setTable #isCMBlack').change(setCMBKChangedB);
        $('#settingsArea table#setTable #CMsmall').change(setCMzoomChangedR);
        $('#settingsArea table#setTable #isCMsoundoff').change(setCMsoundChangedB);
        $('#settingsArea #isCMBkR').appendTo('#settingsArea table#setTable tr:eq(2)>td:eq(1)');
        $('#settingsArea #isCMsmlR').appendTo('#settingsArea table#setTable tr:eq(2)>td:eq(2)');
        $('#settingsArea #isCMsoundR').appendTo('#settingsArea table#setTable tr:eq(2)>td:eq(3)');
        $('#settingsArea table#setTable td').css("border","1px solid black")
            .css("text-align","center")
            .css("padding","3px")
        ;
        $('#settingsArea table#setTable tr:eq(1)>td:eq(1)').css("border-right","none");
        $('#settingsArea table#setTable tr:eq(1)>td:eq(2)').css("border-left","none")
            .css("text-align","left")
        ;
        $('#settingsArea table#setTable tr:eq(1)>td:eq(4)').css("border-right","none");
        $('#settingsArea table#setTable tr:eq(1)>td:eq(5)').css("border-left","none")
            .css("text-align","left")
        ;

        $('<div id="ComeMukouW" class="setTables">↑の実行待機(秒)</div>').insertAfter('#settingsArea #ComeMukouO');
        $('#settingsArea #ComeMukouW').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('#settingsArea #beforeCMWait').appendTo('#settingsArea #ComeMukouW')
            .before("　開始後")
        ;
        $('#settingsArea #afterCMWait').appendTo('#settingsArea #ComeMukouW')
            .before("　終了後")
            .after("<br>待機時間中、押している間は実行せず、離すと即実行するキー<br>")
        ;
        $('#settingsArea #isManualKeyCtrlL').appendTo('#settingsArea #ComeMukouW').after("左ctrl");
        $('#settingsArea #isManualKeyCtrlR').appendTo('#settingsArea #ComeMukouW').after("右ctrl");
        $('#settingsArea #isManualMouseBR').appendTo('#settingsArea #ComeMukouW')
            .before("<br>待機時間中、カーソルを1秒以上連続で合わせている間は実行せず、外すと即実行する場所<br>")
            .after("右下のコメント数表示部")
        ;
        $('#settingsArea #ComeMukouD').remove();
        setTimeout(radiodelayset,50);
    }
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
            "notifySeconds": parseInt($("#notifySeconds").val()),
            "isNotifyAndOpen": $("#isNotifyAndOpen").prop("checked"),
            "isNaOinActive": $("#isNaOinActive").prop("checked"),
            "beforeCMWait": Math.max(0,parseInt($("#beforeCMWait").val())),
            "afterCMWait": Math.max(0,parseInt($("#afterCMWait").val())),
            "manualKeyCtrlR": $("#isManualKeyCtrlR").prop("checked"),
            "manualKeyCtrlL": $("#isManualKeyCtrlL").prop("checked"),
            "manualMouseBR": $("#isManualMouseBR").prop("checked"),
            "CMBkR": $("#isCMBkR").prop("checked")&&$("#isCMBlack").prop("checked"),
            "CMsoundR": $("#isCMsoundR").prop("checked")&&$("#isCMsoundoff").prop("checked"),
            "CMsmlR": $("#isCMsmlR").prop("checked")&&(parseInt($("#CMsmall").val())!=100),
            "tabSoundplay": $("#isTabSoundplay").prop("checked")
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
});
function setCMzoomChangedR(){
    var jo=$('#settingsArea #isCMsmlR');
    if(parseInt($("#CMsmall").val())==100){
        jo.prop("checked",false)
            .prop("disabled",true)
        ;
    }else{
      jo.prop("disabled",false);
    }
}
function setCMsoundChangedB(){
    $('#settingsArea input[type="radio"][name="cmsotype"]').prop("disabled",!$("#isCMsoundoff").prop("checked"));
    $('#settingsArea #isCMsoundR').prop("checked",false)
        .prop("disabled",!$("#isCMsoundoff").prop("checked"))
    ;
}
function setCMBKChangedB(){
    $('#settingsArea input[type="radio"][name="cmbktype"]').prop("disabled",!$("#isCMBlack").prop("checked"));
    $('#settingsArea #isCMBkR').prop("checked",false)
        .prop("disabled",!$("#isCMBlack").prop("checked"))
    ;
}
function setCMBKChangedR(){
    $('#settingsArea #isCMBkTrans').prop("checked",$('#settingsArea input[type="radio"][name="cmbktype"]:checked').val()==1?true:false);
}
function setCMsoundChangedR(){
    $('#settingsArea #isTabSoundplay').prop("checked",$('#settingsArea input[type="radio"][name="cmsotype"]:checked').val()==1?true:false);
}
function radiodelayset(){
    $('#settingsArea input[type="radio"][name="cmbktype"]').prop("disabled",!$("#isCMBlack").prop("checked"))
        .val([$("#isCMBkTrans").prop("checked")?1:0])
    ;
    $('#settingsArea input[type="radio"][name="cmsotype"]').prop("disabled",!$("#isCMsoundoff").prop("checked"))
        .val([$("#isTabSoundplay").prop("checked")?1:0])
    ;
}
