// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

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
    $('<span style="margin-left:4px;">↑と↓が同じ位置の場合: </span>').prependTo("#iproSamePosition>*");
    if($('#CommentMukouSettings .setTables').length==0){
        $('#CommentMukouSettings').wrapInner('<div id="ComeMukouD">');
        $('<div id="ComeMukouO" class="setTables">コメント数が表示されないとき</div>').prependTo('#CommentMukouSettings');
        $('#ComeMukouO').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('<table id="setTable">').appendTo('#ComeMukouO');
        $('#setTable').css("border-collapse","collapse");
        $('<tr><th></th><th colspan=2>画面真っ黒</th><th>画面縮小</th><th colspan=2>音量ミュート</th></tr>').appendTo('#setTable');
        $('<tr><td>適用</td><td></td><td></td><td></td><td></td><td></td></tr>').appendTo('#setTable');
        $('<tr><td>画面クリックで<br>解除・再適用</td><td colspan=2></td><td></td><td colspan=2></td></tr>').appendTo('#setTable');

        $('#isCMBlack').appendTo('#setTable tr:eq(1)>td:eq(1)');
        $('#isCMBkTrans').appendTo('#setTable tr:eq(1)>td:eq(1)').css("display","none");
        $('<input type="radio" name="cmbktype" value=0>').appendTo('#setTable tr:eq(1)>td:eq(2)')
            .after("全面真黒<br>")
        ;
        $('<input type="radio" name="cmbktype" value=1>').appendTo('#setTable tr:eq(1)>td:eq(2)')
            .after("下半透明")
        ;
        $('#setTable input[type="radio"][name="cmbktype"]').change(setCMBKChangedR);

        $('#CMsmall').appendTo('#setTable tr:eq(1)>td:eq(3)').after("％")
            .css("text-align","right")
            .css("width","4em")
        ;

        $('#isCMsoundoff').appendTo('#setTable tr:eq(1)>td:eq(4)');
        $('#isTabSoundplay').appendTo('#setTable tr:eq(1)>td:eq(4)').css("display","none");
        $('<input type="radio" name="cmsotype" value=0>').appendTo('#setTable tr:eq(1)>td:eq(5)')
            .after("プレイヤー<br>")
        ;
        $('<input type="radio" name="cmsotype" value=1>').appendTo('#setTable tr:eq(1)>td:eq(5)')
            .after("タブ設定")
        ;
        $('#setTable input[type="radio"][name="cmsotype"]').change(setCMsoundChangedR);

        $('#setTable #isCMBlack').change(setCMBKChangedB);
        $('#setTable #CMsmall').change(setCMzoomChangedR);
        $('#setTable #isCMsoundoff').change(setCMsoundChangedB);
        $('#isCMBkR').appendTo('#setTable tr:eq(2)>td:eq(1)');
        $('#isCMsmlR').appendTo('#setTable tr:eq(2)>td:eq(2)');
        $('#isCMsoundR').appendTo('#setTable tr:eq(2)>td:eq(3)');
        $('#setTable td').css("border","1px solid black")
            .css("text-align","center")
            .css("padding","3px")
        ;
        $('#setTable tr:eq(1)>td:eq(1)').css("border-right","none");
        $('#setTable tr:eq(1)>td:eq(2)').css("border-left","none")
            .css("text-align","left")
        ;
        $('#setTable tr:eq(1)>td:eq(4)').css("border-right","none");
        $('#setTable tr:eq(1)>td:eq(5)').css("border-left","none")
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
        $('<div id="ComeMukouN" class="setTables"></div>').insertAfter('#ComeMukouW');
        $('#ComeMukouN').css("margin-top","8px")
            .css("padding","8px")
            .css("border","1px solid black")
        ;
        $('#useEyecatch').appendTo('#ComeMukouN').after("左上ロゴのタイミングも利用する<br>");
        $('#isHidePopTL').appendTo('#ComeMukouN').after("左上ロゴを非表示<br>");
        $('#isHidePopBL').appendTo('#ComeMukouN').after("左下の通知を非表示<br>");
        $('#isHidePopFresh').appendTo('#ComeMukouN').after("左下のFreshの通知を非表示");
        $('#ComeMukouD').remove();
    }
    if($('#panelCustom').length==0){
        $('<fieldset><legend>黒帯パネル開閉設定</legend><div id="panelCustom""></div></fieldset>').insertBefore('#CommentMukouSettings');
        $('#panelCustom').css("margin-top","8px")
            .css("padding","8px");
            //.css("border","1px solid black")
        ;
        $('#isAlwaysShowPanel').appendTo('#panelCustom').prop("disabled",true).before("旧");
        $('<input type="button" id="alwaysShowPanelB" value="下表に適用">').insertAfter('#isAlwaysShowPanel').before("常に黒帯パネルを表示する");
        $('#isOpenPanelwCome').appendTo('#panelCustom').prop("disabled",true).before("<br>旧");
        $('<input type="button" id="openPanelwComeB" value="下表に適用">').insertAfter('#isOpenPanelwCome').before("コメント欄を開いていても黒帯パネル等を表示できるようにする");
        $('<br><span>※以上の古いオプションは以下の新オプションに統合され、適当な経過期間の後に削除予定</span>').appendTo('#panelCustom');
        $('#ipanelopenset').appendTo('#panelCustom')
            .children().css("display","flex")
            .css("flex-direction","row")
        ;
        $('<table id="panelcustomTable">').appendTo('#panelCustom');
        $('#panelcustomTable').css("border-collapse","collapse");
        $('<tr><th></th><th>上のメニュー</th><th>下のバー</th><th>右のボタン</th></tr>').appendTo('#panelcustomTable');
        $('<tr><td>基本</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>番組情報<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>放送中一覧<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        $('<tr><td>コメント<br>表示時</td><td></td><td></td><td></td></tr>').appendTo('#panelcustomTable');
        var rd=["非表示<br>","マウス反応<br>","常に表示"];
        for(var i=0;i<4;i++){
            for(var j=0;j<3;j++){
                for(var k=0;k<3;k++){
                    $('<input type="radio" name="d'+i+''+j+'" value='+k+'>').appendTo('#panelcustomTable tr:eq('+(i+1)+')>td:eq('+(j+1)+')')
                        .after(rd[k])
                    ;
                }
            }
        }
        $('#panelcustomTable td').css("border","1px solid black")
            .css("text-align","left")
            .css("padding","3px")
        ;
        $('#panelcustomTable td:first-child').css("text-align","center");
    }
    $("#ihighlightNewCome").insertBefore("#isCommentWide")
        .css("border","black solid 1px")
        .children().css("display","flex")
        .css("flex-direction","row")
        .css("margin","1px 0px")
        .css("padding-left","8px")
        .children().css("margin-left","4px")
        .first().before("新着コメントを少し強調する")
    ;
    $("#ihighlightComeColor").insertBefore("#isCommentWide")
        .css("border","black solid 1px")
        .children().css("display","flex")
        .css("flex-direction","row")
        .css("margin","1px 0px")
        .css("padding-left","8px")
        .children().css("margin-left","4px")
        .first().before("↑の色")
    ;
    var c=$('#highlightComePower').parent().contents();
    var jo=$('#highlightComePower');
    var i=c.index(jo);
    c.slice(i-2,i).remove();
     $('#highlightComePower').appendTo($("#ihighlightComeColor").children().first())
        .prop("type","range")
        .prop("max","100")
        .prop("min","0")
    ;
    $('<span id="highlightPdesc" style="margin-right:4px;margin-left:12px;">背景濃さ: </span>').insertBefore("#highlightComePower");

    chrome.storage.local.get(function (value) {
        var isResizeScreen = value.resizeScreen || false;
        console.log(value.movingCommentLimit)
        var isDblFullscreen = value.dblFullscreen || false;
        var isHideOldComment = value.hideOldComment || false;
        var isCMBlack = value.CMBlack || false;
        var isCMBkTrans = value.CMBkTrans || false;
        var isCMsoundoff = value.CMsoundoff || false;
        var CMsmall = Math.min(100,Math.max(5,((value.CMsmall!==undefined)?value.CMsmall : 100)));
        var isMovingComment = value.movingComment || false;
        var movingCommentSecond = (value.movingCommentSecond!==undefined)?value.movingCommentSecond : 10;
        var movingCommentLimit = (value.movingCommentLimit!==undefined)?value.movingCommentLimit : 30;
//        var isMoveByCSS =　value.moveByCSS || false;
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
        var isOpenPanelwCome=(value.openPanelwCome!==undefined)?value.openPanelwCome : true;
        var isProtitleVisible=value.protitleVisible||false;
        var protitlePosition=value.protitlePosition||"windowtopleft";
        var proSamePosition=value.proSamePosition||"over";
        var isProTextLarge=value.proTextLarge||false;
        var isCommentWide=value.commentWide||false;
        var kakikomiwait=(value.kakikomiwait!==undefined)?value.kakikomiwait:0;
        var useEyecatch=value.useEyecatch||false;
        var isHidePopTL=value.hidePopTL||false;
        var isHidePopBL=value.hidePopBL||false;
        var panelopenset=value.panelopenset||(isAlwaysShowPanel?"222222222222":(isOpenPanelwCome?"111000000111":"111000000000"));//isA..とisO..を初回のみ適用
        var comeMovingAreaTrim=value.comeMovingAreaTrim||false;
        var isHideButtons=value.hideButtons||false;
        var isResizeSpacing=value.resizeSpacing||false;
        var isDeleteStrangeCaps=value.deleteStrangeCaps||false;
        var highlightNewCome=(value.highlightNewCome!==undefined)?Number(value.highlightNewCome):0;
        var isChTimetableExpand=value.chTimetableExpand||false;
        var isHidePopFresh = value.hidePopFresh||false;
        var isChTimetableBreak=value.chTimetableBreak||false;
        var isChTimetableWeekend=value.chTimetableWeekend||false;
        var isChTimetablePlaybutton=value.chTimetablePlaybutton||false;
        var isHideTwitterPanel=value.hideTwitterPanel||false;
        var isHideTodayHighlight=value.hideTodayHighlight||false;
        var isComelistNG=value.comelistNG||false;
        var isComelistClickNG=value.comelistClickNG||false;
        var highlightComeColor=(value.highlightComeColor!==undefined)?Number(value.highlightComeColor):0;
        var highlightComePower=(value.highlightComePower!==undefined)?Number(value.highlightComePower):30;
        var isComeClickNGautoClose=value.comeClickNGautoClose||false;

        $("#isResizeScreen").prop("checked", isResizeScreen);
        $("#isDblFullscreen").prop("checked", isDblFullscreen);
        $("#isHideOldComment").prop("checked", isHideOldComment);
        $("#isCMBlack").prop("checked", isCMBlack);
        $("#isCMBkTrans").prop("checked", isCMBkTrans);
        $("#isCMsoundoff").prop("checked", isCMsoundoff);
        $("#CMsmall").val(CMsmall);
        $("#isMovingComment").prop("checked", isMovingComment);
        $("#movingCommentSecond").val(movingCommentSecond);
        $("#movingCommentLimit").val(movingCommentLimit);
//        $("#isMoveByCSS").prop("checked", isMoveByCSS);
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
        $("#isOpenPanelwCome").prop("checked",isOpenPanelwCome);
        $("#isProtitleVisible").prop("checked",isProtitleVisible);
        $('#iprotitlePosition [type="radio"][name="protitlePosition"]').val([protitlePosition]);
        $('#iproSamePosition [type="radio"][name="proSamePosition"]').val([proSamePosition]);
        $('#isProTextLarge').prop("checked",isProTextLarge);
        $('#isCommentWide').prop("checked",isCommentWide);
        $('#kakikomiwait').val(kakikomiwait);
        $('#useEyecatch').prop("checked",useEyecatch);
        $('#isHidePopTL').prop("checked",isHidePopTL);
        $('#isHidePopBL').prop("checked",isHidePopBL);

        $('#settingsArea input[type="radio"][name="cmbktype"]').prop("disabled",!isCMBlack)
            .val([isCMBkTrans?1:0])
        ;
        $('#settingsArea input[type="radio"][name="cmsotype"]').prop("disabled",!isCMsoundoff)
            .val([isTabSoundplay?1:0])
        ;
        if($('#ipanelopenset [type="radio"][name="panelopenset"][value='+panelopenset+']').length>0){
            $('#ipanelopenset [type="radio"][name="panelopenset"]').val([panelopenset]);
        }else{
            $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
        }
        var sp=panelopenset.split('');
        for(var i=0;i<4;i++){
            for(var j=0;j<3;j++){
                $('#panelcustomTable [type="radio"][name="d'+i+''+j+'"]').val([sp[i*3+j]]);
            }
        }
        $('#comeMovingAreaTrim').prop("checked",comeMovingAreaTrim);
        $('#isHideButtons').prop("checked",isHideButtons);
        $('#isResizeSpacing').prop("checked",isResizeSpacing);
        $('#isDeleteStrangeCaps').prop("checked",isDeleteStrangeCaps);
//        $('#isHighlightNewCome').prop("checked",isHighlightNewCome);
        $('#ihighlightNewCome [type="radio"][name="highlightNewCome"]').val([highlightNewCome]);
        $('#isChTimetableExpand').prop("checked",isChTimetableExpand);
        $('#isHidePopFresh').prop("checked",isHidePopFresh);
        $('#isChTimetableBreak').prop("checked",isChTimetableBreak);
        $('#isChTimetableWeekend').prop("checked",isChTimetableWeekend);
        $('#isChTimetablePlaybutton').prop("checked",isChTimetablePlaybutton);
        $('#isHideTwitterPanel').prop("checked",isHideTwitterPanel);
        $('#isHideTodayHighlight').prop("checked",isHideTodayHighlight);
        $('#isComelistNG').prop("checked",isComelistNG);
        $('#isComelistClickNG').prop("checked",isComelistClickNG);
        $('#ihighlightComeColor [type="radio"][name="highlightComeColor"]').val([highlightComeColor]);
        $("#highlightComePower").val(highlightComePower);
        $('#highlightPdesc').text("背景濃さ:"+highlightComePower);
        $('#isComeClickNGautoClose').prop("checked",isComeClickNGautoClose);
    });
    $("#saveBtn").click(function () {
        var panelopenset='';
        for(var i=0;i<4;i++){
            for(var j=0;j<3;j++){
                panelopenset+=''+$('#panelcustomTable [type="radio"][name="d'+i+''+j+'"]:checked').val();
            }
        }
        chrome.storage.local.set({
            "resizeScreen": $("#isResizeScreen").prop("checked"), 
            "dblFullscreen": $("#isDblFullscreen").prop("checked"),
            "hideOldComment": $("#isHideOldComment").prop("checked"),
            "CMBlack": $("#isCMBlack").prop("checked"),
            "CMBkTrans": $("#isCMBkTrans").prop("checked"),
            "CMsoundoff": $("#isCMsoundoff").prop("checked"),
            "CMsmall": Math.min(100,Math.max(5,parseInt($("#CMsmall").val()))),
            "movingComment": $("#isMovingComment").prop("checked"),
            "movingCommentSecond": parseInt($("#movingCommentSecond").val()),
            "movingCommentLimit": parseInt($("#movingCommentLimit").val()),
//            "moveByCSS": $("#isMoveByCSS").prop("checked"),
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
            "tabSoundplay": $("#isTabSoundplay").prop("checked"),
            "openPanelwCome":$("#isOpenPanelwCome").prop("checked"),
            "protitleVisible":$("#isProtitleVisible").prop("checked"),
            "protitlePosition":$('#iprotitlePosition [name="protitlePosition"]:checked').val(),
            "proSamePosition":$('#iproSamePosition [name="proSamePosition"]:checked').val(),
            "proTextLarge":$('#isProTextLarge').prop("checked"),
            "commentWide":$('#isCommentWide').prop("checked"),
            "kakikomiwait":parseInt($('#kakikomiwait').val()),
            "useEyecatch":$('#useEyecatch').prop("checked"),
            "hidePopBL":$('#isHidePopBL').prop("checked"),
            "hidePopTL":$('#isHidePopTL').prop("checked"),
            "panelopenset":panelopenset,
            "comeMovingAreaTrim":$('#comeMovingAreaTrim').prop("checked"),
            "hideButtons":$('#isHideButtons').prop("checked"),
            "resizeSpacing":$('#isResizeSpacing').prop("checked"),
            "deleteStrangeCaps":$('#isDeleteStrangeCaps').prop("checked"),
//            "highlightNewCome":$('#isHighlightNewCome').prop("checked"),
            "highlightNewCome":$('#ihighlightNewCome [name="highlightNewCome"]:checked').val(),
            "chTimetableExpand":$('#isChTimetableExpand').prop("checked"),
            "hidePopFresh":$('#isHidePopFresh').prop("checked"),
            "chTimetableBreak":$('#isChTimetableBreak').prop("checked"),
            "chTimetableWeekend":$('#isChTimetableWeekend').prop("checked"),
            "chTimetablePlaybutton":$('#isChTimetablePlaybutton').prop("checked"),
            "hideTwitterPanel":$('#isHideTwitterPanel').prop("checked"),
            "hideTodayHighlight":$('#isHideTodayHighlight').prop("checked"),
            "comelistNG":$('#isComelistNG').prop("checked"),
            "comelistClickNG":$('#isComelistClickNG').prop("checked"),
            "highlightComeColor":$('#ihighlightComeColor [name="highlightComeColor"]:checked').val(),
            "highlightComePower":$('#highlightComePower').val(),
            "comeClickNGautoClose":$('#isComeClickNGautoClose').prop("checked")
        }, function () {
            $("#info").show().text("設定保存しました").fadeOut(4000);
        });
    });
    $('#CommentColorSettings').change(function(){
        var p=[];
        var jo=$('#CommentColorSettings input[type="range"]');
        for(var i=0;i<jo.length;i++){
            jo.eq(i).prev('span.prop').text(jo.eq(i).val()+" ("+Math.round(jo.eq(i).val()*100/255)+"%)");
            p[i]=jo.eq(i).val();
        }
//        $('#CommentColorSettings input[type="range"]').each(function(i,jo){
//            $(jo).prev('span.prop').text($(jo).val()+" ("+Math.round($(jo).val()*100/255)+"%)");
//            p[i]=$(jo).val();
//        });
        $('#CommentColorSettings>div>span.desc').css("background-color","rgba("+p[0]+","+p[0]+","+p[0]+","+(p[1]/255)+")")
            .css("color","rgba("+p[2]+","+p[2]+","+p[2]+","+(p[3]/255)+")")
        ;
    });
    $('#highlightComePower').change(function(){
        $('#highlightPdesc').text("背景濃さ"+$('#highlightComePower').val());
    });
    $('#alwaysShowPanelB').on("click",panelTableUpdateA);
    $('#openPanelwComeB').on("click",panelTableUpdateO);
    $('#ipanelopenset').change(panelTableUpdateS);
    $('#panelcustomTable').change(panelTableUpdateT);
    //クリアボタン
    $('#resetSettingsBtn').click(function(){
        if (window.confirm("設定をすべて削除しますか？")) {
            resetSettings(function(){
                window.alert("設定をリセットしました。");
                location.reload();
            });
        }
    });
    $("#resetCMSettingsBtn").click(function(){
        resetCMSettings(function(){
            window.alert("コメント無効時の情報をリセットしました。");
            location.reload();
        });
    });
    //通知登録番組一覧リンク書き換え
    $("#prognotifiesLink").attr("href", chrome.extension.getURL("prognotifies.html"));
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
function panelTableUpdateA(){
    $('#panelcustomTable [type="radio"]').val([2]);
}
function panelTableUpdateO(){
    $('#panelcustomTable [type="radio"][name^="d3"]').val([1]);
}
function panelTableUpdateS(){
    var jo=$('#panelcustomTable [type="radio"]');
    var jv=$('#ipanelopenset [type="radio"][name="panelopenset"]:checked').val();
    var js=jv.split('');
    for(var i=0;i<4;i++){
        for(var j=0;j<3;j++){
            if(parseInt(js[i*3+j])<3){
                jo.filter('[name^="d'+i+''+j+'"]').val([js[i*3+j]]);
            }
        }
    }
}
function panelTableUpdateT(){
    $('#ipanelopenset [type="radio"][name="panelopenset"]').val(["333333333333"]);
}
