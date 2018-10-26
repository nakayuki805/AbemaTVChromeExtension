//AbemaTVのページから要素を取得する系の寄せ集め
import * as $ from "jquery";
import "./jquery-lib";
import * as getInfo from './getAbemaInfo';
import * as dl from './dom-lib';

export function getVideo() {
    //console.trace('getVideo()')
    let ret: HTMLElement|null = dl.filter(document.getElementsByTagName('video'),{width12b:true, height12b:true, displayNot: 'none', notBodyParent: true})[0];
    if(!ret){
        ret=dl.filter(document.getElementsByTagName('object'),{displayNot: 'none', notBodyParent: true})[0];
        if(ret && ret.childElementCount<7){
            //console.log("ocec",ret.childElementCount)
            ret=null;
        }
    }
    return ret;
}
export function getHeaderElement() {
    //return $('[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])').parents().rectFilter({bottom14u: true, notBodyParent: true}).last();
    return dl.parentsFilterLastByArray(document.querySelectorAll('[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])'),{bottom14u: true, notBodyParent: true});
}
export function getViewCounterElement() {
    let p = $('p').filter(function(){return this.innerHTML.indexOf('視聴数')>=0;});
    if (p.isEmpty()) {console.log('?viewCounter(!p)');return null;}
    return p.parents().rectFilter({width14s: true, height14s: true, notBodyParent: true, filters: [function(e){return $(e).children('div').length<2;}]}).last()[0];
}
export function getFooterElement() {
    //console.log("?foot");
    //左下のチャンネルロゴを子孫にもち下方にあるものをfooterとする
    let channelName = getInfo.getChannelByURL();
    if (!channelName){console.log("?footer(!channelName)");return null;}
    let logo = $('img[src*="/channels/logo/' + channelName + '"]');
    let ret = logo.rectFilter({top34d: true, right14l: true}).first();
    if(ret.isEmpty()){console.log("?footer(empty ret)");return null;}
    return ret.parents().rectFilter({top34d: true, notBodyParent: true}).last()[0];
}
