import * as $ from "jquery";
import "./jquery-lib";

export function getVideo() {
    //console.trace('getVideo()')
    return $('object,video').rectFilter({displayNot: 'none', notBodyParent: true});
}
export function getHeaderElement() {
    return $('[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])').parents().rectFilter({bottom14u: true, notBodyParent: true}).last();
}
export function getViewCounterElement() {
    let p = $('p').filter(function(){return this.innerHTML.indexOf('視聴数')>=0;});
    if (p.isEmpty) {console.log('?viewCounter(!p)');}
    return p.parents().rectFilter({width14s: true, height14s: true, notBodyParent: true, filters: [function(e){return $(e).children('div').length<2;}]}).last();
}