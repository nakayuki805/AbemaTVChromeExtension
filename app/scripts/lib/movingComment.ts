import { getVideo, getReplayVideo } from './getAbemaElement';
import * as getInfo from './getAbemaInfo';
import * as gcl from './generic-comment-lib';
import { SettingItems } from '../settingsList';

let settings: SettingItems;
export function applySettings(newSettings: SettingItems) {
    settings = newSettings;
}

let comeArray: [string, number, number, boolean][] = []; // 流すコメントで、新着の複数コメントのうちNG処理等を経て実際に出力するコメントのリスト
const comeLatestPosi: number[][] = [];
const comeTTLmin = 3;
const comeTTLmax = 13;
const comeLatestLen = 10;
let onairSecCount = 0;
comeLatestPosi.length = comeLatestLen;
for (let i = 0; i < comeLatestLen; i++) {
    comeLatestPosi[i] = [];
    comeLatestPosi[i][0] = 0;
    comeLatestPosi[i][1] = comeTTLmin;
}

function putComeArray(inp: typeof comeArray, isReplay: boolean) {
    // console.log("putComeArray");
    // console.table(inp);
    // inp[i]=[ commentText , commentTop , leftOffset, isSelf]
    const video = isReplay ? getReplayVideo() : getVideo();
    if (!video) {
        console.warn('video not found in putComeArray', video);
        return;
    }
    let videoRect = video.getBoundingClientRect();

    let moveContainer = document.getElementById('moveContainer');
    if (!moveContainer) {
        moveContainer = document.createElement('div');
        moveContainer.id = 'moveContainer';
        moveContainer.classList.add('usermade');
        moveContainer.style.cssText =
            '-webkit-mask-image: linear-gradient(black,black);mask-image: linear-gradient(black,black);';
        document.body.appendChild(moveContainer);

        if (isReplay) {
            // 見逃し視聴時は動画の上に配置
            moveContainer.style.position = 'absolute';
            moveContainer.style.height = videoRect.height + 'px';
            moveContainer.style.width = videoRect.width + 'px';
            moveContainer.style.top = videoRect.top + 'px';
            moveContainer.style.left = videoRect.left + 'px';
        }
    }
    let movingComments = moveContainer.getElementsByClassName('movingComment');
    let mclen = movingComments.length;
    let inplen = inp.length;
    let comeoverflowlen = inplen + mclen - settings.movingCommentLimit;
    // あふれる分を削除
    if (comeoverflowlen > 0) {
        for (let cofi = 0; cofi < comeoverflowlen; cofi++) {
            setTimeout(
                function(cofi: number) {
                    movingComments[cofi].remove();
                },
                (7000 * cofi) / comeoverflowlen,
                cofi
            ); // あふれた分を1つずつ順番に7秒かけて消す
        }
    }
    let movieRightEdge;
    movieRightEdge =
        videoRect.left +
        videoRect.width / 2 +
        video.getBoundingClientRect().width / 2;
    let winwidth = isReplay
        ? videoRect.width
        : settings.comeMovingAreaTrim
        ? movieRightEdge
        : window.innerWidth;
    let outxt = '';
    let setfont = '';
    const settcont = document.getElementById('settcont');
    if (settcont && settcont.style.display !== 'none') {
        setfont =
            'font-size:' +
            parseInt(
                (document.getElementById('comeFontsize') as HTMLInputElement)
                    .value
            ) +
            'px;';
    }
    for (let i = 0; i < inplen; i++) {
        outxt +=
            '<span class="movingComment' +
            (inp[i][3] ? ' selfComment' : '') +
            '" style="position:absolute;top:' +
            inp[i][1] +
            'px;left:' +
            (inp[i][2] + winwidth) +
            'px;' +
            setfont +
            '">' +
            inp[i][0] +
            '</span>';
    }
    moveContainer.insertAdjacentHTML('beforeend', outxt);
    movingComments = moveContainer.getElementsByClassName('movingComment');
    mclen = movingComments.length;
    for (let i = 0; i < inplen; i++) {
        const movingComment = movingComments[mclen - inplen + i];
        let mcwidth = movingComment.getBoundingClientRect().width;
        let mcleft = inp[i][2] + winwidth;
        // コメント長さによって流れる速度が違いすぎるのでlogを速度計算部分に適用することで差を減らす
        // 長いコメントは遅くなるので設定値より少し時間がかかる
        let mcfixedwidth =
            mcwidth < 237 ? mcwidth : 100 * Math.floor(Math.log(mcwidth));

        // コメント設置位置の更新
        // コメント右端が画面右端に出てくるまでの時間を保持する
        let r =
            (settings.movingCommentSecond * (mcleft + mcwidth - winwidth)) /
            (winwidth + mcfixedwidth);
        for (let j = comeLatestPosi.length - 1; j >= 0; j--) {
            if (
                comeLatestPosi[j][1] > comeTTLmax &&
                comeLatestPosi[j][0] === inp[i][1]
            ) {
                comeLatestPosi[j][1] = Math.min(
                    comeTTLmax,
                    Math.max(comeTTLmin, 1 + Math.ceil(r))
                );
                break;
            }
        }

        let waitsec =
            (settings.movingCommentSecond * (mcleft + mcwidth)) /
            (winwidth + mcfixedwidth);
        let movingDelta = -mcwidth - 2 - (inp[i][2] + winwidth);

        setTimeout(
            function(mc: HTMLElement, w: number, delta: number) {
                mc.style.transition = 'transform ' + w + 's linear';
                mc.style.transform = 'translateX(' + delta + 'px)';
                mc.setAttribute('data-createdSec', onairSecCount.toString());
            },
            0,
            movingComment,
            waitsec,
            movingDelta
        );
    }
}
export function putComment(
    commentText: string,
    userid: string,
    index: number,
    inmax: number,
    isSelf: boolean,
    // settings: { [index: string]: boolean | string | number },
    arFullNg: RegExp[],
    arUserNg: string[],
    kakikomitxt: string,
    EXhead: HTMLElement | null,
    EXfoot: HTMLElement | null
) {
    // console.log('putComment', commentText, userid, index, inmax, isSelf)
    let outflg = false;
    if (index === 0) {
        comeArray = [];
    }
    if (index === inmax - 1) {
        outflg = true;
    }
    if (isSelf === undefined) {
        isSelf = false;
    }
    // kakikomiwaitが0でない時は自分の書き込みをputCommentから除外する
    // console.log("commentText="+commentText+", kakikomitxt="+kakikomitxt);
    if (commentText.length > 0 && commentText === kakikomitxt) {
        console.log('kakikomi match,wait=' + settings.kakikomiwait);
        isSelf = true;
        if (settings.kakikomiwait > 0) {
            // waitがプラスなら後から単独で流す
            setTimeout(
                putComment,
                settings.kakikomiwait * 1000,
                commentText,
                userid,
                0,
                1,
                true,
                arFullNg,
                arUserNg,
                kakikomitxt
            );
            commentText = '';
        } else if (settings.kakikomiwait < 0) {
            commentText = '';
        }
        kakikomitxt = '';
        // console.log("kakikomitxt reset: putComment")
    }
    commentText = gcl.comefilter(
        commentText,
        userid,
        arFullNg,
        arUserNg,
        settings.isComeDel,
        settings.isUserDel,
        settings.isComeNg,
        settings.isDeleteStrangeCaps
    );
    let commentTopMargin = 50;
    let commentBottomMargin = 150;
    if (EXhead && EXhead.style.visibility === 'hidden') {
        commentTopMargin = 10;
    }
    if (EXfoot && EXfoot.style.visibility === 'hidden') {
        commentBottomMargin = 100;
    }
    let commentTop =
        Math.floor(
            Math.random() *
                (window.innerHeight - (commentTopMargin + commentBottomMargin))
        ) + commentTopMargin;
    if (commentText.length > 0) {
        let i = 0;
        let k = false;
        while (i < 20) {
            k = false;
            for (let j = 0; j < comeLatestLen; j++) {
                if (
                    Math.abs(commentTop - comeLatestPosi[j][0]) <
                    settings.comeFontsize * 1.5
                ) {
                    k = true;
                }
            }
            if (k) {
                commentTop =
                    Math.floor(
                        Math.random() *
                            (window.innerHeight -
                                (commentTopMargin + commentBottomMargin))
                    ) + commentTopMargin;
            } else {
                break;
            }
            i += 1;
        }
    }
    const maxLeftOffset =
        (window.innerWidth * 7) / settings.movingCommentSecond; // 7秒の移動長さ
    const leftOffset = Math.floor((maxLeftOffset * index) / inmax);
    if (commentText.length > 0) {
        comeArray.push([commentText, commentTop, leftOffset, isSelf]);
    }
    if (outflg && comeArray.length > 0) {
        setTimeout(putComeArray, 50, comeArray, false);
    }
    // コメント設置位置の保持
    // この時点では要素長さが未確定なので暫定的に異常値を入力してputComeArray側で拾う
    comeLatestPosi.push([commentTop, comeTTLmax + 2]);
    comeLatestPosi.shift();
}
export function putReplayComment(
    commentText: string,
    userid: string,
    index: number,
    inmax: number,
    arFullNg: RegExp[],
    arUserNg: string[]
) {
    // console.log('putComment', commentText, userid, index, inmax, isSelf)
    let outflg = false;
    if (index === 0) {
        comeArray = [];
    }
    if (index === inmax - 1) {
        outflg = true;
    }
    const video = getReplayVideo();
    if (!video) {
        console.warn('putReplayComment: video not found');
        return;
    }
    const videoRect = video.getBoundingClientRect();

    commentText = gcl.comefilter(
        commentText,
        userid,
        arFullNg,
        arUserNg,
        settings.isComeDel,
        settings.isUserDel,
        settings.isComeNg,
        settings.isDeleteStrangeCaps
    );
    let commentTopMargin = 10;
    let commentBottomMargin = 30;

    let commentTop =
        Math.floor(
            Math.random() *
                (videoRect.height - (commentTopMargin + commentBottomMargin))
        ) + commentTopMargin;
    if (commentText.length > 0) {
        let i = 0;
        let k = false;
        while (i < 20) {
            k = false;
            for (let j = 0; j < comeLatestLen; j++) {
                if (
                    Math.abs(commentTop - comeLatestPosi[j][0]) <
                    settings.comeFontsize * 1.5
                ) {
                    k = true;
                }
            }
            if (k) {
                commentTop =
                    Math.floor(
                        Math.random() *
                            (videoRect.height -
                                (commentTopMargin + commentBottomMargin))
                    ) + commentTopMargin;
            } else {
                break;
            }
            i += 1;
        }
    }
    const maxLeftOffset = (videoRect.width * 7) / settings.movingCommentSecond; // 7秒の移動長さ
    const leftOffset = Math.floor((maxLeftOffset * index) / inmax);
    if (commentText.length > 0) {
        comeArray.push([commentText, commentTop, leftOffset, false]);
    }
    if (outflg && comeArray.length > 0) {
        setTimeout(putComeArray, 50, comeArray, true);
    }
    // コメント設置位置の保持
    // この時点では要素長さが未確定なので暫定的に異常値を入力してputComeArray側で拾う
    comeLatestPosi.push([commentTop, comeTTLmax + 2]);
    comeLatestPosi.shift();
}
export function resizeMoveContainer() {
    // 見逃しコメントでコメ欄のリサイズ
    const video = getReplayVideo();
    if (!video) return;
    if (getInfo.determineUrl() !== getInfo.URL_SLOTPAGE) return;
    const videoRect = video.getBoundingClientRect();
    const moveContainer = document.getElementById('moveContainer');
    if (moveContainer) {
        moveContainer.style.position = 'absolute';
        moveContainer.style.height = videoRect.height + 'px';
        moveContainer.style.width = videoRect.width + 'px';
        moveContainer.style.top = videoRect.top + 'px';
        moveContainer.style.left = videoRect.left + 'px';
    }
}
export function setComeFontsizeChanged() {
    const comeFontsizeInput = document.getElementById('comeFontsize');
    if (!comeFontsizeInput) return;
    const comeFontSize = (comeFontsizeInput as HTMLInputElement).value;
    if (comeFontSize === undefined || comeFontSize === '') return;
    const nf = parseInt(comeFontSize);
    Array.from(document.getElementsByClassName('movingComment')).forEach(
        mcElem => ((mcElem as HTMLElement).style.fontSize = nf + 'px')
    );
}
export function clearOptionTemporaryStyle() {
    Array.from(document.getElementsByClassName('movingComment')).forEach(
        mcElem => ((mcElem as HTMLElement).style.fontSize = '')
    );
}
export function moveComeTopFilter(headerHeight: number, footerHeight: number) {
    const movingCommentElements = document.getElementsByClassName(
        'movingComment'
    );
    for (let i = movingCommentElements.length; i >= 0; i--) {
        const rect = movingCommentElements[i].getBoundingClientRect();
        if (rect.top > window.innerHeight - headerHeight - footerHeight) {
            movingCommentElements[i].remove();
        }
    }
}
export function generateCSS(isReplay: boolean): string {
    let t = '';
    if (settings.comeFontsizeV && !isReplay) {
        const wh = window.innerHeight;
        const vh = Math.round((1000 * settings.comeFontsize) / wh) / 10;
        t += '.movingComment{font-size:' + vh + 'vh;}';
    } else t += '.movingComment{font-size:' + settings.comeFontsize + 'px;}';
    return t;
}
export function intervalFunction() {
    // コメント流し実行中、この関数を1秒ごとに呼び出す
    onairSecCount++;
    // コメント位置のTTLを減らす
    for (let i = 0; i < comeLatestLen; i++) {
        if (comeLatestPosi[i][1] > 0) {
            comeLatestPosi[i][1] -= 1;
            if (comeLatestPosi[i][1] <= 0) {
                comeLatestPosi[i][0] = 0;
            }
        }
    }
    // 流れるコメントのうちmovingCommentSecond*2経過したものを削除
    if (settings.isMovingComment) {
        let arMovingComment = document.getElementsByClassName('movingComment');
        for (let j = 0; j < arMovingComment.length; j++) {
            if (
                parseInt(
                    arMovingComment[j].getAttribute('data-createdSec') || ''
                ) <
                onairSecCount - settings.movingCommentSecond * 2
            ) {
                arMovingComment[j].remove();
            } else {
                break; // 前から順番に見ていって古いコメントを処理し終わったらbreak
            }
        }
    }
}
export function leavePage() {
    Array.from(document.getElementsByClassName('movingComment')).forEach(
        mcElem => mcElem.remove()
    );
}
