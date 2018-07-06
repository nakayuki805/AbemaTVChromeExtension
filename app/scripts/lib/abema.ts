
import * as $ from "jquery";
import "./jquery-lib";
import * as cwlog from "cw-log";

let log = cwlog.logger(6);

export function getChannelByURL(url?: string){
    return ((url||location.href).match(/https:\/\/abema\.tv\/now-on-air\/([-\w]+)/) || [null, null])[1];
};

export function isFootCommentClickable(){
    return footerComment().length>0 && footerComment().css("pointer-events")!="none";
}

// 要素を取得する関数 基本的にjqueryで返し、取得できなければ空jqueryを返す
// find*が探し出す関数で接頭辞なしが参照用
let _elements: {[index: string]: JQuery;} = {};
function _elementOrFind(name: string){
    if (_elements[name] && _elements[name].length>0) {
        return _elements[name];
    } else {
        return _elements[name] = _findFunctions[name]();
    }
}
const _findFunctions:{[index: string]: () => JQuery} = {
    'videoParent': findVideoParent,
    'header': findHeader,
    'footer': findFooter,
    'footerComment': findFooterComment,
    'viewCounter': findViewCounter,
    'sideMenu': findSidemenu,
    'info': findInfo,
    'channelList': findChannelList
}
export function findVideoParent(){
    let video = $('object,video');
    let videoParent:JQuery<HTMLElement> = $([]);
    for (let i = 0; i < video.length; i++) {
        if (video.eq(i).css('display') !== 'none') {
            videoParent = video.eq(i).parent();
            if (!videoParent.is('body')) {
                break;
            } else {
                videoParent = $([]);
            }
        }
    }
    return videoParent;
}
export function videoParent(){
    return _elementOrFind('videoParent');
}
export function findHeader(){
    let logo = $('[*|href*="/logo.svg"]:not([href])'); //ロゴを取得
    if (logo.length===0) {
        log.trace('findElement', '?head(nologo)');
        return $([]);
    }
    let header = $('header').has(logo);
    if (header.length===1) {
        return header;
    } else {
        log.trace('findElement', '?head');
        return $([]);
    }
}
export function header(){
    return _elementOrFind('header');
}
export function findFooter(){
    //まずは左下のチャンネルロゴを見つける
    let ch = getChannelByURL(location.href);
    if (!ch) {log.trace('findElement', '?footer(noch)');return $([]);}
    let chLogo = $('img[src*="/channels/logo/' + ch + '"]').rectFilter({top34d: true, right12l: true});
    //チャンネルロゴの先祖で下にある中の一番祖先をフッタとする
    let parents = chLogo.parents().rectFilter({notBodyParent: true, top34d: true});
    if (parents.length>=1) {
        return parents.last();
    } else {
        log.trace('findElement', '?footer(noparents)');
        return $([]);
    }
}
export function footer(){
    return _elementOrFind('footer');
}
export function findFooterComment(){
    //コメントアイコンの先祖button
    let chLogo = footer().find('img[src*="/channels/logo/' + getChannelByURL() + '"]');
    if (chLogo.length === 0) {log.trace('findElement', '?footcome(!chLogo)');return $([]);}
    let commentIcon = $('[*|href*="/comment.svg"]:not([href])').containedBy(footer());
    if (commentIcon.length === 0) {log.trace('findElement', '?footcome(!commentIcon)');return $([]);}
    let parents = commentIcon.parents();
    let footerComment:JQuery = $([]);
    for (let i=0; i<parents.length; i++) {
        let i_1 = Math.max(0, i-1);
        if(parents.eq(i).has(chLogo).length>0 && !parents.eq(i_1).is(footer())){
            footerComment = parents.eq(i_1);
        }
    }
    return footerComment;
}
export function footerComment(){
    return _elementOrFind('footerComment');
}
export function findViewCounter(){
    let p = $('p').filter(function(){
        return ($(this).text().indexOf('視聴数') >= 0 && $(this).siblings('span').length>0);//コメ欄と区別するためspanが兄弟かもみる
    });
    if (p.length === 0) {log.trace('findElement', '?vierCounter(!p)');return $([]);}
    let counter = p.parents().rectFilter({width12s: true, height14s: true, notBodyParent: true});
    if (counter.length===1) {
        return counter.last();
    } else {
        log.trace('findElement', '?viewCounter(!counter)');return $([]);
    }
}
export function viewCounter(){
    return _elementOrFind('viewCounter');
}
export function findSidemenu(){
    let listIcon = $('[*|href*="/list.svg"]:not([href])');
    if (listIcon.length === 0) {log.trace('findElement', '?sidemenu(!listIcon)');return $([]);}
    let sidemenu = listIcon.parents().rectFilter({left34r: true, notBodyParent: true}).last();
    if (sidemenu.length === 0) log.trace('findElement', '?sidemenu(!sidemenu)');
    return sidemenu;
}
export function sideMenu(){
    return _elementOrFind('sidemenu');
}
export function findInfo(){
    return $('h3:contains(番組概要)').parents().rectFilter({left12r: true, notBodyParent: true}).last();
}
export function info(){
    return _elementOrFind('info');
}
export function findChannelList(){
    return $('a[href*="/timetable"]').rectFilter({top34d:true, left12r: true}).parents().rectFilter({left12r:true, notBodyParent: true});
}
export function channelList(){
    return _elementOrFind('channelList');
}

//URL判定
export const URL_SLOTPAGE = 0; //番組個別ページ
export const URL_DATETABLE = 1; //日付別番組表
export const URL_CHANNELTABLE = 2; //チャンネル別番組表
export const URL_ONAIR = 3; //放送ページ
export const URL_SEARCH = 4; //番組検索結果(未来)
export const URL_RESERVATION = 5; //公式の視聴予約一覧
export const URL_OTHER = -1; //その他

export function determineUrl(url?: string){
    url = url || location.href;
    if (/https:\/\/abema.tv\/channels\/[-a-z0-9]+\/slots\/[a-zA-Z\d]+/.test(url)) return URL_SLOTPAGE;
    else if (/^https:\/\/abema.tv\/timetable(?:$|\/dates\/.*)/.test(url)) return URL_DATETABLE;
    else if (/^https:\/\/abema.tv\/now-on-air\/.*/.test(url)) return URL_ONAIR;
    else if (/https:\/\/abema.tv\/search\/future\?q=.+/.test(url)) return URL_SEARCH;
    else if (/https:\/\/abema.tv\/my\/lists\/reservation/.test(url)) return URL_RESERVATION;
    else return URL_OTHER;
}