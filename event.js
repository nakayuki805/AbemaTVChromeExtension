// event page script
/*
onairpage.js等から以下のようにして通知登録
var req = {channel:"abema-news", channelName:"AbemaNews", programID: "P2Z4XVYyzAo", programTitle: "AbemaNews夜①／芸能もういっちょ", programTime: 番組開始時間(Date), notifyTime: 通知時間(Date)};
chrome.runtime.sendMessage(req, function(response) {
  //response.resultが"added"なら通知設定完了、"pastTimeError"なら過去の時間を指定している
});
//デバッグ用
time=(new Date());req = {type:"addProgramNotifyAlarm",channel:"abema-news", channelName:"AbemaNews", programID: "P2Z4XVYyzAo", programTitle: "AbemaNews夜①／芸能もういっちょ", programTime: time.setMinutes(time.getMinutes()+3), notifyTime: time.setMinutes(time.getMinutes()-4)};
chrome.runtime.sendMessage(req, function(response) {console.log(response);})
*/
//通知
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name.indexOf("progNotify_") === 0){
        chrome.storage.local.get(alarm.name, function(storeObj) {
            console.log("show notification", storeObj);
            var programData = storeObj[alarm.name];
            var progStartMinStr = ((programData.programTime-programData.notifyTime)/60000).toFixed(1).replace(".0","");
            var programTime = new Date(programData.programTime);
            var programTimeStr = programTime.getHours() + "時" + programTime.getMinutes() + "分";
            var channelUrl = "https://abema.tv/now-on-air/" + programData.channel;
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'abemaexticon.png',
                title: '「' + programData.programTitle +'」開始' + progStartMinStr + '分前',
                message: "AbemaTVの" + programData.channelName + "チャンネルの番組「" + programData.programTitle + "」が" + progStartMinStr + "分後の" + programTimeStr + "に始まります。"
            }, function(notificationID)  {
                chrome.storage.local.remove(alarm.name);
                sessionStorage.setItem(notificationID, channelUrl)
            });
        });
    }
});

//通知をクリックした時
chrome.notifications.onClicked.addListener(function(notificationID) {
    chrome.tabs.create({'url': sessionStorage.getItem(notificationID)});
    chrome.notifications.clear(notificationID);
});
//messageが来た時
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "addProgramNotifyAlarm"){
        var programID = request.programID;
        var channel = request.channel;
        var channelName = request.channelName;
        var programTime = request.programTime;
        var notifyTime = request.notifyTime;
        var programTitle = request.programTitle;
        var progNotifyName = "progNotify_"+channel+"_"+programID;
        console.log("message", request,sender)
        if ((new Date()) > notifyTime) {
            sendResponse({result: "pastTimeError"});
        } else {
            chrome.notifications.getPermissionLevel(function(ret){
                if (ret === "granted") {
                    chrome.alarms.create(progNotifyName, {
                        when: notifyTime
                    });
                    var storeObj = {};
                    storeObj[progNotifyName] = {
                        channel: channel,
                        channelName: channelName,
                        programID: programID,
                        programTitle: programTitle,
                        programTime: programTime,
                        notifyTime: notifyTime
                    };
                    chrome.storage.local.set(storeObj, function() {
                        sendResponse({result: "added"});
                    });
                } else {
                    sendResponse({result: "notificationDined"});
                }
            });
        }
    } else {
        console.warn("message type not match", request.type);
    }
    return true;
});