// event page script
/*
onairpage.js等から以下のようにして通知登録
var req = {type:"addProgramNotifyAlarm",channel:"abema-news", channelName:"AbemaNews", programID: "P2Z4XVYyzAo", programTitle: "AbemaNews夜①／芸能もういっちょ", programTime: 番組開始時間(number), notifyTime: 通知時間(number)};
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
        chrome.storage.local.get([alarm.name, "isNotifyAndOpen", "isNaOinActive"], function(storeObj) {
            console.log("show notification", storeObj);
            var programData = storeObj[alarm.name];
            //var progStartMinStr = ((programData.programTime-programData.notifyTime)/60000).toFixed(1).replace(".0","");
            var progStartSecStr = (programData.programTime-programData.notifyTime)/1000;
            var programTime = new Date(programData.programTime);
            var programTimeStr = programTime.getHours() + "時" + programTime.getMinutes() + "分";
            var channelUrl = "https://abema.tv/now-on-air/" + programData.channel;
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'abemaexticon.png',
                title: '「' + programData.programTitle +'」開始' + progStartSecStr + '秒前',
                message: "AbemaTVの" + programData.channelName + "チャンネルの番組「" + programData.programTitle + "」が" + progStartSecStr + "秒後の" + programTimeStr + "に始まります。"
            }, function(notificationID)  {
                chrome.storage.local.remove(alarm.name);
                if (storeObj.isNotifyAndOpen === true && !storeObj.isNaOinActive) {
                    chrome.tabs.create({'url': channelUrl}, function(newTab) {
                        chrome.windows.update(newTab.windowId,{focused: true});
                    });
                } else if (storeObj.isNaOinActive) {
                    chrome.tabs.query({url:"https://abema.tv/now-on-air/*"},function(onairTabs) {
                        if (onairTabs.length > 0) {
                            var targetTab = onairTabs[0];
                            var activeTabs = [];
                            for (var i = 1; i < onairTabs.length; i++) {
                                if (onairTabs[i].active){
                                    activeTabs.push(onairTabs[i]);
                                }
                            }
                            if (activeTabs.length === 0) {
                                //放送画面は開いてるがすべてアクティブではない
                                if (targetTab.url!==channelUrl){
                                    chrome.tabs.update(targetTab.id,{url:channelUrl});
                                }
                                chrome.tabs.update(targetTab.id,{active:true});
                                chrome.windows.update(targetTab.windowId,{focused: true});
                            } else if (activeTabs.length === 1) {
                                //アクティブな放送画面が一つ
                                targetTab = activeTabs[0];
                                if (targetTab.url!==channelUrl){
                                    chrome.tabs.update(targetTab.id,{url:channelUrl});
                                }
                                chrome.windows.update(targetTab.windowId,{focused: true});
                            } else {
                                //アクティブな放送画面が複数→その中でウィンドウがフォーカスされてるもの選ぶ
                                chrome.windows.getAll(function(wins) {
                                    //var targetWin = wins[0];
                                    targetTab = activeTabs[0];
                                    for (var i = 1; i < activeTabs.length; i++) {
                                        for (var j = 1; j < wins.length; j++) {
                                            if (activeTabs[i].windowId === wins[j].id && wins[j].focused) {
                                                //targetWin = wins[j];
                                                targetTab = activeTabs[i];
                                            }
                                        }
                                    }
                                    if (targetTab.url!==channelUrl){
                                        chrome.tabs.update(targetTab.id,{url:channelUrl});
                                    }
                                    chrome.windows.update(targetTab.windowId,{focused: true});
                                });
                            }
                        } else {
                            //放送画面を開いているタブがない
                            chrome.tabs.create({'url': channelUrl}, function(newTab) {
                                chrome.windows.update(newTab.windowId,{focused: true});
                            });
                        }
                    });
                } else {
                    sessionStorage.setItem(notificationID, channelUrl);
                }
            });
        });
    }
});

//通知をクリックした時
chrome.notifications.onClicked.addListener(function(notificationID) {
    var url = sessionStorage.getItem(notificationID);
    if (url){
        chrome.tabs.create({'url': sessionStorage.getItem(notificationID)});
    }
    chrome.notifications.clear(notificationID);
});
//messageが来た時
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log("message", request,sender)
    if (request.type === "addProgramNotifyAlarm"){
        var programID = request.programID;
        var channel = request.channel;
        var channelName = request.channelName;
        var programTime = request.programTime;
        var notifyTime = request.notifyTime;
        var programTitle = request.programTitle;
        var progNotifyName = "progNotify_"+channel+"_"+programID;
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
    } else if (request.type === "removeProgramNotifyAlarm") {
        var progNotifyName = request.progNotifyName;
        chrome.alarms.clear(progNotifyName, function(wasCleared) {
            chrome.storage.local.remove(progNotifyName, function(){
                //console.log("alarm " + progNotifyName + " cleared>"+wasCleared);
                sendResponse({result: "removed"});
            });
        });
    } else {
        console.warn("message type not match", request.type);
    }
    return true;
});
chrome.runtime.onMessageExternal.addListener(function(r){
 if(r.name!="bgsend"){return;}
 chrome.tabs.sendMessage(r.tab,{name:r.name,type:r.type,value:r.value});
});
