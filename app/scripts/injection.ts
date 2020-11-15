// onairpage.jsからscriptタグとしてこのスクリプトを挿入する
// 拡張機能のコンテキストではできないReactへのアクセスなどをページのコンテキストで行う
import * as getElm from './contentScript/getAbemaElement';
import * as getInfo from './contentScript/getAbemaInfo';
import * as dl from './lib/dom-lib';

// findReactでTSエラーを押さえ込むための型定義
interface AnyPropertyElement extends Element {
    [index: string]: any;
}
interface AnyPropertyWindow extends Window {
    [index: string]: any;
}

const extId = (window as AnyPropertyWindow).abema_ext_info.id as string;
let inj_currentLocation = '';
let inj_EXcomelist: HTMLElement;
let inj_EXcome: HTMLElement;
let inj_commentObserver = new MutationObserver(function(
    mutations: MutationRecord[]
) {
    inj_onCommentChange(mutations);
}); // コメント欄DOM監視

// URLが変わった時に実行される
function injection_urlChanged() {
    console.log('urlChanged() @injection');
    if (inj_currentLocation === location.href) {
        return;
    }
    inj_currentLocation = location.href;
    inj_commentObserver.disconnect();
    // inj_setRefClass();
    // 放送画面
    if (inj_currentLocation.indexOf('https://abema.tv/now-on-air/') >= 0) {
        // setTimeout(inj_delaysetComment,1000);
    } else if (inj_currentLocation.indexOf('https://abema.tv/timetable') >= 0) {
        // 番組表
        // setTimeout(function setTTRefClass() {
        //     let EXTTbody = $('.ext_abm-tt-body')[0];
        //     if (!EXTTbody) {
        //         EXTTbody = $('article')
        //             .parent()
        //             .parent()
        //             .parent()[0];
        //     }
        //     let EXTThead = $('.ext_abm-tt-head')[0];
        //     if (!EXTThead) {
        //         EXTThead = $('.ext_ref-channel-content-header').children()[0];
        //     }
        //     if (!EXTThead) {
        //         EXTThead = $(EXTTbody)
        //             .parent()
        //             .parent()
        //             .prev()
        //             .children()
        //             .children()[0];
        //     }
        //     if (EXTThead.childElementCount > EXTTbody.childElementCount) {
        //         console.log('retry setTTRefClass()');
        //         setTimeout(setTTRefClass, 500);
        //         return;
        //     }
        //     // inj_setRefClass();
        // }, 1000);
    }
}

// function inj_setRefClass(parent?: HTMLElement) {
//     // refsからclassを設定
//     Array.from(
//         parent
//             ? parent.getElementsByName('div')
//             : document.getElementsByName('div')
//     ).forEach(function(e, i) {
//         try {
//             const r = inj_findReact(e);
//             if (r && r.refs) {
//                 for (let ref in r.refs) {
//                     if (r.refs[ref] instanceof HTMLElement) {
//                         inj_addRefClass(r.refs[ref], ref);
//                         console.log(ref, r.refs[ref]);
//                     }
//                 }
//             }
//         } catch (er) {
//             console.warn(er);
//         }
//     });
// }

function inj_delaysetComment() {
    console.log('inj_delayset');
    let comelistInstance = null;
    const comelist = document.getElementsByClassName('ext_abm-comelist')[0];
    const come = document.getElementsByClassName('ext_abm-come')[0];
    if (come) {
        comelistInstance = inj_findReact(comelist as HTMLElement);
    }
    if (comelistInstance !== null) {
        // console.log('comelistInstance:', comelistInstance);
        inj_EXcomelist = comelist as HTMLElement;
        inj_EXcome = come as HTMLElement;
        inj_commentObserver.disconnect();
        inj_commentObserver.observe(inj_EXcomelist, { childList: true });
        // 放送画面→番組表推移時にAbemaがバグるのに対処→直ったようなのでコメントアウト
        setTimeout(function() {
            // なぜか存在しないrefs.animatableに対してremoveEventListenerしようとするのでダミーの要素いれておく
            // inj_findReact(inj_EXcomelist.parentElement).refs.animatable = document.createElement('div');
        }, 1000);
    } else {
        console.log('waitng inj_delaysetComment()');
        setTimeout(inj_delaysetComment, 1000);
    }
}
function inj_onCommentChange(mutations: MutationRecord[]) {
    // 新着animationは廃止されたようなので無いものとしてコメントアウトされている(今後復活したときのために残しておく)
    const instanceElement = inj_EXcomelist.parentElement;
    if (!instanceElement || !instanceElement.parentElement) {
        console.warn('inj_occ !instanceElement');
        return;
    }
    const comelistInstance = inj_findReact(instanceElement);
    // console.log('inj_occ comelistInstance:', comelistInstance);
    const newCommentCount = 0; // comelistInstance.props.newCommentCount; // animationのコメ数
    let hasCommentAnimation = false; // comelistInstance.props.hasCommentAnimation;
    const comments = comelistInstance.props.comments;
    // console.log(
    //     'inj_occ newComeC,hasComeAni,comeli[0]',
    //     newCommentCount,
    //     hasCommentAnimation,
    //     inj_EXcomelist.firstChild
    // );
    inj_EXcomelist.setAttribute(
        'data-ext-hasCommentAnimation',
        hasCommentAnimation.toString()
    );
    const commentElements = inj_EXcomelist.children;
    // animation部
    // for (let i = 0; i < newCommentCount; i++) {
    //     const comment = comments[i];

    //     const commentElement =
    //         commentElements[0].children[0].children[0].children[i];
    //     commentElement.setAttribute('data-ext-message', comment.message);
    //     commentElement.setAttribute(
    //         'data-ext-createdatms',
    //         comment.createdAtMs
    //     );
    //     commentElement.setAttribute('data-ext-id', comment.id);
    //     commentElement.setAttribute('data-ext-userid', comment.userId);
    //     commentElement.setAttribute('data-ext-isowner', comment.isOwner);
    // }
    // コメントリスト本体部
    // hasCommentAnimationがtrueなのにanimation部が無いことがあるので本当にあるのかここでチェック
    // if (
    //     hasCommentAnimation &&
    //     commentElements[0].children[0].querySelector(':scope>p')
    // ) {
    //     hasCommentAnimation = false;
    // }
    for (let i = hasCommentAnimation ? 1 : 0; i < commentElements.length; i++) {
        if (!commentElements[i].getAttribute('data-ext-id')) {
            const comment =
                comments[i + newCommentCount - (hasCommentAnimation ? 1 : 0)];
            if (!comment) {
                continue;
            }
            const commentElement = commentElements[i];
            commentElement.setAttribute('data-ext-message', comment.message);
            commentElement.setAttribute(
                'data-ext-createdatms',
                comment.createdAtMs
            );
            commentElement.setAttribute('data-ext-id', comment.id);
            commentElement.setAttribute('data-ext-userid', comment.userId);
            commentElement.setAttribute('data-ext-isowner', comment.isOwner);
        }
    }
}

function inj_findReact(comelist: AnyPropertyElement) {
    for (let key in comelist) {
        if (key.startsWith('__reactInternalInstance$')) {
            if (comelist[key].child && comelist[key].child.stateNode) {
                return comelist[key].child.stateNode;
            }
        }
    }
    return null;
}
// function inj_setReact(comelist: AnyPropertyElement, vkey: string, value: any) {
//     for (let key in comelist) {
//         if (key.startsWith('__reactInternalInstance$')) {
//             if (comelist[key].child && comelist[key].child.stateNode) {
//                 comelist[key].child.stateNode[vkey] = value;
//             }
//         }
//     }
// }
// function inj_addRefClass(elm: HTMLElement, refName: string) {
//     const className = 'ext_ref-' + refName;
//     // $('.'+className).removeClass(className);
//     elm.classList.add(className);
//     elm.setAttribute('data-ext-ref', refName);
// }

// イベント
window.addEventListener('urlChange', injection_urlChanged);
window.addEventListener('commentListReady', inj_delaysetComment);

// デバッグ用にコンソールから関数を使えるようにする
function setExtFunction(moduleName: string, moduleObj: any) {
    (<AnyPropertyWindow>window)[moduleName] = moduleObj;
    // for(let key in moduleObj){
    //     if(typeof moduleObj[key] === 'function'){
    //         window[moduleName]
    //     }
    // }
}
[
    ['getElem', getElm],
    ['getInfo', getInfo],
    ['dl', dl]
].forEach((m: [string, any]) => {
    setExtFunction(m[0], m[1]);
});
if (process.env.NODE_ENV === 'development') {
    (<AnyPropertyWindow>window).logCSEval = function(evalString: string) {
        chrome.runtime.sendMessage(extId, {
            name: 'contentScriptEval',
            evalString: evalString
        });
    };
    (<AnyPropertyWindow>window).logInjEval = function(evalString: string) {
        console.log(eval(evalString));
    };
}
