// AbemaTVのページから要素を取得する系の寄せ集め
import * as getInfo from './getAbemaInfo';
import * as dl from '../lib/dom-lib';

export function getReplayVideo(): HTMLVideoElement | null {
    return dl.filter(document.getElementsByTagName('video'), {
        displayNot: 'none',
        notBodyParent: true
    })[0] as HTMLVideoElement;
}
export function getVideo() {
    // console.trace('getVideo()')
    let ret: HTMLElement | null = dl.filter(
        document.getElementsByTagName('video'),
        {
            displayNot: 'none',
            notBodyParent: true,
            filters: [
                (e, b) => {
                    return (
                        (b.height > window.innerHeight * 0.1 &&
                            b.width > window.innerWidth * 0.1) ||
                        (!!e.style.transform &&
                            e.style.transform.includes('scale'))
                    );
                }
            ]
        }
    )[0];
    if (!ret) {
        ret = dl.filter(document.getElementsByTagName('object'), {
            displayNot: 'none',
            notBodyParent: true
        })[0];
        if (ret && ret.childElementCount < 7) {
            // console.log("ocec",ret.childElementCount)
            ret = null;
        }
    }
    return ret;
}
export function getVideoAreaElement() {
    // 映像領域を内包する要素(旧obliの子に相当)
    const videoElement = getVideo();
    if (!videoElement) return null;
    const parents = dl.filter(dl.parents(videoElement), {
        notBodyParent: true,
        filters: [
            e => {
                const children = e.children;
                let btnFlag = false,
                    imgFlag = false;
                for (let i = 0; i < children.length; i++) {
                    const tag = children[i].tagName.toUpperCase();
                    if (tag === 'BUTTON') btnFlag = true;
                }
                return btnFlag;
            }
        ]
    });
    return parents && parents[0];
}
export function getHeaderElement() {
    return document.getElementsByTagName('header')[0]?.parentElement;
    // return dl.parentsFilterLastByArray(
    //     document.querySelectorAll(
    //         '[*|href*="/logo.svg"][*|href$="#svg-body"]:not([href])'
    //     ),
    //     { bottom14u: true, notBodyParent: true }
    // );
}
export function getLeftMenuElement(){
    const es = dl.filter(document.getElementsByTagName('nav'),{left14l:true,filter:e=>!document.getElementsByTagName('header')[0].contains(e)});
    return es?.[0]?.parentElement;
}
export function getViewCounterElement() {
    const svg = document.querySelectorAll(
        '[*|href*="/view.svg"][*|href$="#svg-body"]:not([href]),.com-tv-TVViewCounter__icon>use'
    ) as ArrayLike<HTMLElement>;
    if (svg.length === 0) {
        console.log('?viewCounter(!svg)');
        return null;
    }
    return dl.parentsFilterLastByArray(svg, {
        width14s: true,
        height14s: true,
        notBodyParent: true,
        filters: [
            e => e.querySelectorAll(':scope>div').length < 2,
            e => e.getElementsByTagName('button').length === 0
        ]
    });
}
export function getFooterElement() {
    // console.log("?foot");
    // 左下のチャンネルロゴを子孫にもち下方にあるものをfooterとする
    const channelName = getInfo.getChannelByURL();
    if (!channelName) {
        console.log('?footer(!channelName)');
        return null;
    }
    const footerLogo = dl.filter(
        document.querySelectorAll(
            'img[src*="/channels/logo/' + channelName + '"]'
        ),
        { top34d: true, left14l: true }
    )[0];
    if (!footerLogo) {
        console.log('?footer(!footerLogo)');
        return null;
    }
    return dl.parentsFilterLast(footerLogo, {
        top34d: true,
        notBodyParent: true
    });
}
export function getChannelListElement() {
    // console.log("?chli");
    // 右下にある番組表リンクを孫にもち右にあるのをchliとする //元々は直下がaリストだったけどその上のfooter,info等と同じ階層のを選ぶようにする
    let ret = document.getElementsByClassName(
        'com-tv-VChannelList__container'
    )[0] as HTMLElement;
    let links = document.links;
    if (!ret) {
        for (let i = links.length - 1, b; i >= 0; i--) {
            b = links[i].getBoundingClientRect();
            if (
                links[i].href.indexOf('/timetable') < 0 ||
                b.top < (window.innerHeight * 3) / 4 ||
                b.left < window.innerWidth / 2
            )
                continue;
            ret = links[i];
            break;
        }
    }
    if (!ret) {
        /*console.log("?chli");*/ return null;
    }
    return dl.parentsFilterLast(ret, { left12r: true, notBodyParent: true });
}
export function getVolElement() {
    // console.log("?vol");
    // 音声アイコンを含んで右下のをvolとする
    const svg: HTMLElement | null = document.querySelector(
        '[*|href*="/volume_"][*|href$="#svg-body"]:not([href])'
    );
    if (!svg) {
        console.log('?getvol');
        return null;
    }
    return dl.parentsFilterLast(svg, {
        left23r: true,
        top23d: true,
        notBodyParent: true
    });
}

export function getFullScreenElement() {
    // console.log("?fullscreen");
    let svg: HTMLElement | null = document.querySelector(
        '[*|href*="/full_screen.svg"][*|href$="#svg-body"]:not([href])'
    );
    if (!svg) {
        console.log('?fullscreen');
        return null;
    }
    return dl.filter(dl.parents(svg), { tagName: 'button' })[0];
}
