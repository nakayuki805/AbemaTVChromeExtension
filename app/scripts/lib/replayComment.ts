import * as dl from './dom-lib';
import * as mc from './movingComment';

let EXcommentButton: HTMLElement | null = null;
let EXcommentsParent: HTMLElement | null = null;

let settings: { [index: string]: boolean | string | number } = {};
let arFullNg: RegExp[] = [];
let arUserNg: string[] = [];
export function applySharedObjects(
    newSettings: {
        [index: string]: boolean | string | number;
    },
    newArFullNg: RegExp[],
    newArUserNg: string[]
) {
    settings = newSettings;
    arFullNg = newArFullNg;
    arUserNg = newArUserNg;
}

let delaysetConsoleStr = '';
let delaysetConsoleRepeated = false;
let isDelaysetRunning = false;
let interval: number | null = null;
let isResizeEventAdded = false;
const commentObserver = new MutationObserver(function(mutations) {
    setTimeout(
        function(mutations: MutationRecord[]) {
            onCommentChange(mutations);
        },
        50,
        mutations
    ); // injection.jsでdata属性のセットが終わるまで待つ
}); // コメント欄DOM監視

function onCommentChange(mutations: MutationRecord[]) {
    let isCommentAdded = false;
    const comments: [string, string][] = [];
    for (let i = 0; i < mutations.length; i++) {
        if (
            mutations[i].type === 'childList' &&
            mutations[i].addedNodes.length > 0
        ) {
            const element = mutations[i].addedNodes[0] as HTMLElement;
            if (element.tagName.toUpperCase() === 'LI') {
                isCommentAdded = true;
                const text = element.getElementsByTagName('span')[0].innerText;
                // const userid = element.getAttribute('data-ext-userid');
                comments.push([text, '']);
            }
        }
    }
    if (isCommentAdded) {
        if (settings.isMovingComment) {
            comments.forEach((comment, i, comments) => {
                mc.putReplayComment(
                    comment[0],
                    comment[1],
                    i,
                    comments.length,
                    arFullNg,
                    arUserNg
                );
            });
        }
    }
    // console.log(mutations, comments);
}

function getCommentButton(): HTMLElement | null {
    const button = dl.parentsFilterLastByArray(
        document.querySelectorAll(
            '[*|href*="/comment.svg"][*|href$="#svg-body"]:not([href])'
        ),
        { tagName: 'button' }
    );
    return button && button.parentElement;
}
function getCommentWrapper(): HTMLElement | null {
    return dl.parentsFilterLastByArray(
        document.querySelectorAll(
            '[*|href*="/comment.svg"][*|href$="#svg-body"]:not([href])'
        ),
        { filters: [(e, b) => b.width < 400] }
    );
}
function getCommentsParent(): HTMLElement | null {
    const commentWrapper = getCommentWrapper();
    if (!commentWrapper) return null;
    return commentWrapper.getElementsByTagName('ul')[0];
}

function delayset(isInterval: boolean, count: number) {
    if (!EXcommentButton) {
        EXcommentButton = getCommentButton();
        if (EXcommentButton) {
            if (settings.isHideReplayCommentButton) {
                EXcommentButton.style.display = 'none';
            }
        }
    }
    if (!EXcommentsParent) {
        EXcommentsParent = getCommentsParent();
        if (EXcommentsParent) {
            const commentWrapper = getCommentWrapper();
            if (
                commentWrapper &&
                !commentWrapper.querySelector('a[href*="/about/premium"]')
            ) {
                // コメント欄監視開始
                commentObserver.observe(EXcommentsParent, {
                    childList: true /*, subtree: true, attributes: true*/
                });
            } else {
                // コメント欄にプレミアム宣伝があった場合は何もしない
                console.log('premium ad detected: ignore comment.');
            }
        }
    }

    const cstr =
        'replayComment delayset ' +
        (!EXcommentButton ? 'Cb' : '..') +
        (!EXcommentsParent ? 'Cp' : '..');
    if (delaysetConsoleStr !== cstr) {
        console.log(cstr);
        delaysetConsoleStr = cstr;
        delaysetConsoleRepeated = false;
    } else {
        if (!delaysetConsoleRepeated) {
            console.log(
                '%crepeating:%c ' + cstr,
                'background-color: orange;',
                ''
            );
            delaysetConsoleRepeated = true;
        }
    }

    if (!(EXcommentButton && EXcommentsParent)) {
        if (count > 20 && document.getElementsByTagName('video').length === 0) {
            // リトライ20回したのにvideoが見つからない→見逃し視聴の画面では無いと判断し打ち切り
            console.log('video not found 20 times: abort delayset');
            isDelaysetRunning = false;
        } else if (count > 60 && !EXcommentButton) {
            // リトライ60回したのにコメントボタンがない→コメントがない見逃し視聴と判断し打ち切り
            console.log('comment button not found 60 times: abort delayset');
            isDelaysetRunning = false;
        } else if ((!isInterval && !isDelaysetRunning) || isInterval) {
            setTimeout(delayset, 1000, true, count + 1);
            isDelaysetRunning = true;
        }
        // console.log(
        //     EXcommentButton,
        //     EXcommentsParent,
        //     isInterval,
        //     isDelaysetRunning
        // );
    } else {
        isDelaysetRunning = false;
        console.log('replayComment delayset complete');
        // console.log(EXcommentButton, EXcommentsParent);
    }
}
function intervalFunction() {
    if (!EXcommentsParent || !EXcommentsParent.matches('html *')) {
        EXcommentsParent = getCommentsParent();
        if (EXcommentsParent) {
            commentObserver.disconnect();
            commentObserver.observe(EXcommentsParent, {
                childList: true
            });
        }
    }
    mc.intervalFunction();
}
export function prepare() {
    if (EXcommentButton && !EXcommentButton.matches('html *'))
        EXcommentButton = null;
    if (EXcommentsParent && !EXcommentsParent.matches('html *'))
        EXcommentsParent = null;

    delayset(false, 0);
    if (interval === null)
        interval = window.setInterval(intervalFunction, 1000);

    // CSSの準備
    let csslink = document.querySelector('head>link.usermade');
    if (!csslink) {
        csslink = document.createElement('link');
        csslink.setAttribute('rel', 'stylesheet');
        csslink.classList.add('usermade');
        document.getElementsByTagName('head')[0].appendChild(csslink);
    }
    const dataUri = 'data:text/css,' + encodeURIComponent(mc.generateCSS(true));
    csslink.setAttribute('href', dataUri);
    if (!isResizeEventAdded) {
        window.addEventListener('resize', mc.resizeMoveContainer);
        isResizeEventAdded = true;
    }
}
export function leavePage() {
    commentObserver.disconnect();
    mc.leavePage();
    EXcommentButton = null;
    EXcommentsParent = null;
    if (interval !== null) window.clearInterval(interval);
    interval = null;
}
