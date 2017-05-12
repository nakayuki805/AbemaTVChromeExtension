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
// edge等ブラウザ対応
if (typeof chrome === "undefined" || !chrome.extension) {
    var chrome = browser;
}
var isFirefox = window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1;

//通知
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name.indexOf("progNotify_") === 0){
        chrome.storage.local.get([alarm.name, "isNotifyAndOpen", "isNaOinActive", "isNotifySound"], function(storeObj) {
            console.log("show notification", storeObj);
            var programData = storeObj[alarm.name];
            //var progStartMinStr = ((programData.programTime-programData.notifyTime)/60000).toFixed(1).replace(".0","");
            var progStartSecStr = (programData.programTime-programData.notifyTime)/1000;
            var programTime = new Date(programData.programTime);
            var programTimeStr = programTime.getHours() + "時" + programTime.getMinutes() + "分";
            var channelUrl = "https://abema.tv/now-on-air/" + programData.channel;
            chrome.notifications.create(alarm.name, {
                type: 'basic',
                iconUrl: 'icon/notify.png',
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
            //音を鳴らす
            if (storeObj.isNotifySound) {
                var audio = new Audio("notify.mp3");
                audio.play();
            }    
        });
    }
});

//通知をクリックした時
chrome.notifications.onClicked.addListener(function(notificationID) {
    //console.log('clicked notification: ', notificationID);
    if (notificationID.indexOf('progNotify_') == 0){
        var url = sessionStorage.getItem(notificationID);
        if (url){
            chrome.tabs.create({'url': sessionStorage.getItem(notificationID)});
        }
    } else if (notificationID == 'extUpdated'){
        chrome.tabs.query({url:"https://abema.tv/*"},function(abemaTabs) {
            //console.log(abemaTabs);
            for(var i=0; i<abemaTabs.length; i++){
                chrome.tabs.reload(abemaTabs[i].id);
            }
        });
    }
    chrome.notifications.clear(notificationID);
});

function getNotificationPermission(callback){
    if (chrome.notifications.getPermissionLevel) {
        chrome.notifications.getPermissionLevel(callback);
    } else {
        console.log("getPermissionLevel not supported so returned granted");
        callback("granted");
    }
}
function addProgramNotify(programID, channel, channelName, programTime, notifyTime, programTitle, addedCallback, errorCallback){
    var progNotifyName = "progNotify_"+channel+"_"+programID;
    if ((new Date()) > notifyTime) {
        errorCallback("pastTimeError");
    } else {
        getNotificationPermission(function(ret){
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
                    addedCallback();
                });
            } else {
                errorCallback("notificationDined");
            }
        });
    }
}
function removeProgramNotify(progNotifyName, callback){
    chrome.alarms.clear(progNotifyName, function(wasCleared) {
        chrome.storage.local.remove(progNotifyName, function(){
            //console.log("alarm " + progNotifyName + " cleared>"+wasCleared);
            callback();
        });
    });
}
//messageが来た時
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log("message", request,sender)
    if (request.type === "addProgramNotifyAlarm"){
        addProgramNotify(request.programID, request.channel, request.channelName, request.programTime, request.notifyTime, request.programTitle, function(){
            //追加成功
            sendResponse({result: "added"});
        }, function(error){
            //エラー
            sendResponse({result: error});
        });
    } else if (request.type === "removeProgramNotifyAlarm") {
        removeProgramNotify(request.progNotifyName, function(){
            sendResponse({result: "removed"});
        });
    } else if (request.type === "windowresize"){
        chrome.windows.get(sender.tab.windowId,function(w){
            chrome.windows.update(w.id,{width:(w.width+request.valw),height:(w.height+request.valh)});
        });
        sendResponse(0);
    } else if (request.type === "tabsoundplaystop"){
        chrome.tabs.update(sender.tab.id,{muted:request.valb});
        sendResponse(0);
    } else if (request.type === "toggleFullscreen"){
        chrome.windows.get(sender.tab.windowId,function(w){
            if (request.mode === "isFullscreen") {
                sendResponse({isFullscreen: (w.state === "fullscreen"), oldState: w.state});
            } else if (request.mode === "enter") {
                chrome.windows.update(w.id, {state: "fullscreen"}, function(w2){
                    sendResponse({isFullscreen: (w2.state === "fullscreen"), oldState: w.state});
                });
            } else if (request.mode === "exit") {
                chrome.windows.update(w.id, {state: request.oldState}, function(w2){
                    sendResponse({isFullscreen: (w2.state === "fullscreen"), oldState: w.state});
                });
            } else if (request.mode === "toggle") {
                chrome.windows.update(w.id, {state: (w.state === "fullscreen" ? request.oldState : "fullscreen")}, function(w2){
                    sendResponse({isFullscreen: (w2.state === "fullscreen"), oldState: w.state});
                });
            }
        });
    } else if (request.type === "getStorage"){
        if (request.keys) {
            chrome.storage.local.get(request.keys, function(items){
                sendResponse({items: items});
            });
        } else {
            chrome.storage.local.get(function(items){
                sendResponse({items: items});
            });
        }
    } else if (request.type === "setStorage"){
        chrome.storage.local.set(request.items,function(){
            sendResponse({result: "seted"});
        });
    } else {
        console.warn("message type not match:", request.type);
    }
    return true;
});
// onMessageExternal firefox54未満やedgeでは未対応
chrome.runtime.onMessageExternal && chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse){
    if(request.name==="bgsend"){
        chrome.tabs.sendMessage(request.tab,{name:request.name,type:request.type,value:request.value});
    }else if(request.name==="addProgramNotify"){
        chrome.storage.local.get({notifySeconds: 60}, function(storeObj){
            var notifyTime = request.programTime - storeObj.notifySeconds*1000;
            var programTimeDate = new Date(request.programTime);
            var programTimeStr = programTimeDate.getMonth()+1 + "/" + programTimeDate.getDate() + " " + programTimeDate.getHours() + "時" + programTimeDate.getMinutes() + "分";
            addProgramNotify(request.programID, request.channel, request.channelName, request.programTime, notifyTime, request.programTitle, function(){
                chrome.notifications.create("add_"+request.programID, {
                    type: 'basic',
                    iconUrl: 'icon/add.png',
                    title: request.site + 'から「' + request.programTitle +'」を通知登録しました。',
                    message: "AbemaTVの" + request.channelName + "チャンネルの番組「" + request.programTitle + "」(" + programTimeStr + ")が通知登録されました。"
                }, function(notificationID)  {
                    sendResponse({result: "added"});
                });
            }, function(error){
                sendResponse({result: error});
            });
        });
    }else if(request.name==="checkProgramNotify"){
        var progNotifyName = "progNotify_"+request.channel+"_"+request.programID;
        chrome.storage.local.get(progNotifyName,function(value){
            if(value[progNotifyName]){
                sendResponse({result: "registered"});
            }else{
                sendResponse({result: "unregistered"});
            }
        });
    }else if(request.name==="removeProgramNotify"){
        var progNotifyName = "progNotify_"+request.channel+"_"+request.programID;
        chrome.storage.local.get(progNotifyName, function(value){
            var programTimeDate = new Date(value[progNotifyName].programTime);
            var programTimeStr = programTimeDate.getMonth()+1 + "/" + programTimeDate.getDate() + " " + programTimeDate.getHours() + "時" + programTimeDate.getMinutes() + "分";
            removeProgramNotify(progNotifyName, function(){
                chrome.notifications.create("remove_"+progNotifyName, {
                    type: 'basic',
                    iconUrl: 'icon/remove.png',
                    title: request.site + 'から「' + value[progNotifyName].programTitle +'」を通知解除しました。',
                    message: "AbemaTVの番組「" + value[progNotifyName].programTitle + "」(" + programTimeStr + ")が通知登録解除されました。"
                }, function(notificationID)  {
                    sendResponse({result: "removed"});
                });
            });
        });
    }else if(request.name==="getVersion"){
        sendResponse({version: chrome.runtime.getManifest().version});
    }else{
        console.warn("external message name not match", request.name);
    }
    return true;
});

//コンテキストメニュー
function putContextMenu(){
    chrome.contextMenus.create({
        "title": "「%s」をコメントNGワードに追加",
        "type": "normal",
        "contexts": ["selection"],
        "documentUrlPatterns": ["https://abema.tv/now-on-air/*"],
        "id": "addNGwordMenu"
    });
    chrome.contextMenus.create({
        "title": "一時追加",
        "type": "normal",
        "contexts": ["selection"],
        "documentUrlPatterns": ["https://abema.tv/now-on-air/*"],
        "parentId": "addNGwordMenu",
        "id": "addNGwordMenuTemporary"
    });
    chrome.contextMenus.create({
        "title": "永久追加",
        "type": "normal",
        "contexts": ["selection"],
        "documentUrlPatterns": ["https://abema.tv/now-on-air/*"],
        "parentId": "addNGwordMenu",
        "id": "addNGwordMenuPermanent"
    });
    chrome.contextMenus.create({
        "title": "AbemaTV番組表で「%s」を検索",
        "type": "normal",
        "contexts": ["selection"],
        "documentUrlPatterns": ["https://abema.tv/channels/*"],
        "id": "searchAbemaTVTimetable"
    });
    chrome.contextMenus.create({
        "title": "このチャンネルを表示切替",
        "type": "normal",
        "contexts": ["link"],
        "documentUrlPatterns": ["https://abema.tv/timetable","https://abema.tv/timetable/dates/*"],
        "targetUrlPatterns":["https://abema.tv/timetable/channels/*"],
        "id": "toggleChannel"
    });
}
function onContextMenuClick(info, tab){
    if(info.menuItemId.indexOf("addNGwordMenu")===0){
        var word = info.selectionText;
        var isPermanent = info.menuItemId=="addNGwordMenuPermanent";
        chrome.tabs.sendMessage(tab.id,{"name": "addNGword", "word": word, "isPermanent": isPermanent});
    }else if(info.menuItemId == "searchAbemaTVTimetable"){
        var word = info.selectionText;
        //chrome.tabs.create({url: "https://abema.tv/search/future?q="+encodeURIComponent(word)});
        window.open("https://abema.tv/search/future?q="+encodeURIComponent(word));
    }else if(info.menuItemId == "toggleChannel"){
        var tar = info.linkUrl;
        chrome.tabs.sendMessage(tab.id,{"name":"toggleChannel","url":tar});
    }
}
chrome.contextMenus.onClicked.addListener(onContextMenuClick);
if(isFirefox){
    putContextMenu();
}

//ページ推移
chrome.webNavigation.onHistoryStateUpdated.addListener((detail) => {
    //console.log(detail);
    chrome.tabs.sendMessage(detail.tabId,{name:"historyStateUpdated"});
}, {url: [{hostContains: "abema.tv"}]});
chrome.runtime.onInstalled.addListener(() => {
    console.log('oninstalled');
    //現在開かれているAbemaTVのタブを取得
    chrome.tabs.query({url:"https://abema.tv/*"},function(abemaTabs) {
        if(abemaTabs.length>0){
            //通知
            chrome.notifications.create('extUpdated', {
                type: 'basic',
                iconUrl: 'abemaexticon.png',
                title: chrome.runtime.getManifest().name + 'が更新されました',
                message: "現在開いているAbemaTVのタブを再読込してください。\nクリックで再読み込みします。"
            }, function(notificationID) {
                //console.log(notificationID);
            });
        }
    });
    //context menu (not firefox)
    if (!isFirefox) {
        putContextMenu();
    }
    // 番組通知のalarmが消えていれば再登録
    chrome.storage.local.get(function(val){
        chrome.alarms.getAll(function(alarms){
            for (var key in val) {
                if (key.indexOf("progNotify") == 0) {//通知登録データのみ
                    var alarmFlag = false;
                    for(var i = 0; i < alarms.length; i++){
                        if(alarms[i].name == key){
                            alarmFlag = true;
                        }
                    }
                    if (!alarmFlag) {
                        //登録されてなければここで追加
                        console.log('recreate alarm:' + key);
                        chrome.alarms.create(key, {
                            when: val[key].notifyTime
                        });
                    }//else{console.log('already have',key)}
                }
            }
        });
    });
});