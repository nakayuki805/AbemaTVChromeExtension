//画質選択
var inj_maxRes = window.localStorage.getItem('ext_maxResolution')||2160;//4K解像度をデフォルトの最大値としておく
var inj_minRes = window.localStorage.getItem('ext_minResolution')||0;
var inj_representations = [];
var hlsPlaylistPattern = /^https:\/\/linear-abematv\.akamaized\.net\/channel\/[-a-z0-9]+\/(\d+)\/playlist.m3u8/
var dashMpdPattern = /^https:\/\/linear-abematv\.akamaized\.net\/channel\/[-a-z0-9]+\/manifest.mpd/
var m4sVideoPattern = /^https:\/\/linear-abematv.akamaized.net\/mp4\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/(\d+)p.1\/[0-9int]+.m4s/
var m4sAdVideoPattern = /^https:\/\/linear-abematv\.akamaized\.net\/mp4ad\/[a-zA-Z0-9]+\/\d+\/[a-zA-Z0-9]+\/([a-zA-Z0-9]+)\/v\/[0-9int]+.m4s/
function getRepresentations(mpd){
    var dom = (new DOMParser()).parseFromString(mpd, 'text/xml');
    var adpSets = dom.getElementsByTagName('AdaptationSet');
    var videoAdpSets = [];
    for(var i=0; i<adpSets.length; i++){
        if(adpSets[i].getAttribute('mimeType')=='video/mp4')videoAdpSets.push(adpSets[i]);
    }
    for(var i=0; i<videoAdpSets.length; i++){
        var repArr = [];
        var reps = videoAdpSets[i].getElementsByTagName('Representation');
        for(var j=0; j<reps.length; j++){
            var id = reps[j].getAttribute('id');
            var res = parseInt(reps[j].getAttribute('height'));
            repArr.push([id, res]);
        }
        if(inj_representations.toString().indexOf(repArr.toString())<0){
            inj_representations.push(repArr);
        }
    }
}

//xhr上書き
var inj_originalXHRopen = window.XMLHttpRequest.prototype.open;
var inj_originalXHRsend = window.XMLHttpRequest.prototype.send;
var inj_extXHRopen = function() {
    var method = arguments[0];
    var url = arguments[1];
    //console.log("XHR", method, url);
    if(hlsPlaylistPattern.test(url)){
        var res = parseInt(url.match(hlsPlaylistPattern)[1]);
        var newRes = res;
        if(inj_maxRes<res){
            newRes = inj_maxRes;
        }else if (inj_minRes>res){
            newRes = inj_minRes;
        }
        url = url.replace('/'+res+'/', '/'+newRes+'/');
        console.log('m3u8 res=',res, newRes);
    }else if(m4sVideoPattern.test(url)){
        var res = parseInt(url.match(m4sVideoPattern)[1]);
        var newRes = res;
        if(inj_maxRes<res){
            newRes = inj_maxRes;
        }else if (inj_minRes>res){
            newRes = inj_minRes;
        }
        url = url.replace('/'+res+'p.1/', '/'+newRes+'p.1/');
        console.log('m4svideo res=',res, newRes);
    }else if(m4sAdVideoPattern.test(url)){
        var repid = url.match(m4sAdVideoPattern)[1];
        var res = null;
        var repArrIdx = null;
        for(var i=0; i<inj_representations.length; i++){
            for(var j=0; j<inj_representations[i].length; j++){
                if(inj_representations[i][j][0]==repid){
                    res = inj_representations[i][j][1];
                    repArrIdx = i;
                    break;
                }
            }
            if(repArrIdx!==null)break;
        }
        var newRes = res;
        if(inj_maxRes<res){
            newRes = inj_maxRes;
        }else if (inj_minRes>res){
            newRes = inj_minRes;
        }
        var newRepid = null;
        if(res!=newRes&&repArrIdx!==null){
            for(var i=0; i<inj_representations[repArrIdx].length; i++){
                if(inj_representations[repArrIdx][i][1]==newRes){
                    newRepid = inj_representations[repArrIdx][i][0];
                    url.replace(repid, newRepid);
                    break;
                }
            }
        }
        
        console.log('m4sAdvideo res=',res, newRes, ' repid=', repid, newRepid);
    }
    arguments[1] = url;
    return inj_originalXHRopen.apply(this, arguments);
};
var inj_extXHRsend = function() {
    var xhr = this;
    var onload = function() {
        if(dashMpdPattern.test(this.responseURL)){
            //console.log("XHR .mpd onload", this.responseURL);
            getRepresentations(this.responseText);   
        }
    }
    xhr.addEventListener("load", onload, false);
    return inj_originalXHRsend.apply(this, arguments);
};
window.XMLHttpRequest.prototype.open = inj_extXHRopen;
window.XMLHttpRequest.prototype.send = inj_extXHRsend;
console.log('xhr open,send override');
//setInterval(inj_overrideXHRopen, 5000);

window.addEventListener('resolutionSet', function(){
    inj_maxRes = window.localStorage.getItem('ext_maxResolution')||2160;//4K解像度をデフォルトの最大値としておく
    inj_minRes = window.localStorage.getItem('ext_minResolution')||0;    
});