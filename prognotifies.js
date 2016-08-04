// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}

function dateToStr(date){
    date = new Date(date);
    return (date.getMonth()+1)+"月"+date.getDate()+"日 "+date.getHours()+"時"+date.getMinutes()+"分";
}
$(function(){
    chrome.storage.local.get(function(values){
        var notifies = [];
        for (var key in values) {
            if (key.indexOf("progNotify")==0) {//通知登録データ
                var eachNotify = values[key];
                eachNotify.progNotifyName = key;
                notifies.push(eachNotify);
            }
        }
        //notifiesを時刻順にソート
        notifies.sort(function(a, b){
            return (a.programTime < b.programTime)?-1:1;
        });
        //console.log(notifies)
        for (var i=0; i<notifies.length; i++) {
            var progNotifyName = notifies[i].progNotifyName;
            var programUrl = "https://abema.tv/channels/"+notifies[i].channel+"/slots/"+notifies[i].programID;
            var trhtml = "<tr id=\"tr_"+progNotifyName+"\">";
            trhtml += "<td>"+notifies[i].programTitle+"</td>";
            trhtml += "<td>"+notifies[i].channelName+"</td>";
            trhtml += "<td><a href=\""+programUrl+"\" target=\"_blank\">"+notifies[i].programID+"</a></td>";
            trhtml += "<td>"+dateToStr(notifies[i].programTime)+"</td>";
            trhtml += "<td><input type='button' value='削除' id='delbtn_"+progNotifyName+"'></td>";
            trhtml += "</tr>"
            $("#notifyProgTable tbody").append(trhtml);
            $("#delbtn_"+progNotifyName).click(function(e){
                //console.log(e.target.id)
                progNotifyName = e.target.id.slice(7)
                //console.log(progNotifyName)
                chrome.runtime.sendMessage({type: "removeProgramNotifyAlarm", progNotifyName: progNotifyName}, function(response) {
                    if(response.result==="removed"){
                        $("#tr_"+progNotifyName).remove();
                    }else{
                        alert("削除できませんでした");
                    }
                });
            });
        }
    });
});