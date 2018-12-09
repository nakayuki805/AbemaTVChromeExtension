//AbemaTVのページから要素を取得する系の寄せ集め
import * as $ from "jquery";
import "./jquery-lib";
import * as getInfo from './getAbemaInfo';
import * as dl from './dom-lib';

export function getVideo() {
    //console.trace('getVideo()')
    let ret: HTMLElement|null = dl.filter(document.getElementsByTagName('video'),{displayNot: 'none', notBodyParent: true, filters:[(e,b)=>{
        return (b.height>window.innerHeight*0.5&&b.width>window.innerWidth*0.5)||(!!e.style.transform&&e.style.transform.includes('scale'));
    }]})[0];
    if(!ret){
        ret=dl.filter(document.getElementsByTagName('object'),{displayNot: 'none', notBodyParent: true})[0];
        if(ret && ret.childElementCount<7){
            //console.log("ocec",ret.childElementCount)
            ret=null;
        }
    }
    return ret;
}
export function getVideoAreaElement() {//映像領域を内包する要素(旧obliの子に相当)
    const videoElement = getVideo();
    if(!videoElement)return null;
    return dl.parentsFilterLast(videoElement, {notBodyParent: true, filters: [e=>{
        const children = e.children;
        let btnFlag = false, imgFlag = false;
        for(let i=0; i<children.length; i++){
            const tag = children[i].tagName.toUpperCase();
            if(tag === 'BUTTON') btnFlag = true;
            if(tag === 'IMG') imgFlag = true;
        }
        return btnFlag && imgFlag;
    }]});
}
export function getHeaderElement() {
    return dl.parentsFilterLastByArray(document.querySelectorAll('[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])'),{bottom14u: true, notBodyParent: true});
}
export function getViewCounterElement() {
    const p = dl.filter(document.getElementsByTagName('p'), {includeText: '視聴数'});
    if (p.length === 0) {console.log('?viewCounter(!p)');return null;}
    return dl.parentsFilterLastByArray(p, {width14s: true, height14s: true, notBodyParent: true, filters: [function(e){return $(e).children('div').length<2;}]});
}
export function getFooterElement() {
    //console.log("?foot");
    //左下のチャンネルロゴを子孫にもち下方にあるものをfooterとする
    const channelName = getInfo.getChannelByURL();
    if (!channelName){console.log("?footer(!channelName)");return null;}
    const footerLogo = dl.filter(document.querySelectorAll('img[src*="/channels/logo/' + channelName + '"]'), {top34d: true, right14l: true})[0];
    if(!footerLogo){console.log("?footer(!footerLogo)");return null;}
    return dl.parentsFilterLast(footerLogo, {top34d: true, notBodyParent: true});
}
export function getChannelListElement() {
    //console.log("?chli");
    //右下にある番組表リンクを孫にもち右にあるのをchliとする //元々は直下がaリストだったけどその上のfooter,info等と同じ階層のを選ぶようにする
    var ret = document.getElementsByClassName('com-tv-VChannelList__container')[0] as HTMLElement;
    var links = document.links;
    if(!ret){
        for (let i = links.length - 1,b; i >= 0; i--) {
            b=links[i].getBoundingClientRect();
            if (links[i].href.indexOf("/timetable") < 0 || b.top < window.innerHeight * 3 / 4||b.left<window.innerWidth/2) continue;
            ret = links[i];
            break;
        }
    }
    //if(!ret)ret=$('.ext_ref-programList')[0];
    if(!ret){/*console.log("?chli");*/return null;}
    return dl.parentsFilterLast(ret, {left12r: true, notBodyParent: true});
}
export function getVolElement(){
    //console.log("?vol");
    //音声アイコンを含んで右下のをvolとする
    const svg: HTMLElement|null = document.querySelector('[*|href*="/volume_"][*|href$="#svg-body"]:not([href])');
    if(!svg){console.log("?getvol");return null;}
    return dl.parentsFilterLast(svg, {left23r: true, top23d: true, notBodyParent: true})
}

export function getFullScreenElement(){
    //console.log("?fullscreen");
    var ret = $('[*|href*="/full_screen.svg"][*|href$="#svg-body"]:not([href])').first().parentsUntil("button").parent().get(0);
    let svg: HTMLElement|null = document.querySelector('[*|href*="/full_screen.svg"][*|href$="#svg-body"]:not([href])');
    if(!svg){console.log("?fullscreen");return null;}
    return dl.filter(dl.parents(svg), {tagName: 'button'})[0];
}
