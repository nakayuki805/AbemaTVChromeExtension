import * as $ from "jquery";
import "./jquery-lib";

export function getVideo() {
    //console.trace('getVideo()')
    return $('object,video').rectFilter({displayNot: 'none', notBodyParent: true});
}
export function getHeaderElement() {
    return $('[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])').parents().rectFilter({bottom14u: true, notBodyParent: true}).last();
}