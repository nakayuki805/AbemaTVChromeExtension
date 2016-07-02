function dateToStr(date){
    date = new Date(date);
    return (date.getMonth()+1)+"月"+date.getDate()+"日 "+date.getHours()+"時"+date.getMinutes()+"分";
}
$(function(){
    chrome.storage.local.get(function(values){
        var notifies = {};
        for (var key in values) {
            if (key.indexOf("progNotify")==0) {//通知登録データ
                notifies[key] = values[key];
            }
        }
        //console.log(notifies)
        for (var progNotifyName in notifies) {
            var programUrl = "https://abema.tv/channels/"+notifies[progNotifyName].channel+"/slots/"+notifies[progNotifyName].programID;
            var trhtml = "<tr id=\"tr_"+progNotifyName+"\">";
            trhtml += "<td>"+notifies[progNotifyName].programTitle+"</td>";
            trhtml += "<td>"+notifies[progNotifyName].channelName+"</td>";
            trhtml += "<td><a href=\""+programUrl+"\" target=\"_blank\">"+notifies[progNotifyName].programID+"</a></td>";
            trhtml += "<td>"+dateToStr(notifies[progNotifyName].programTime)+"</td>";
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