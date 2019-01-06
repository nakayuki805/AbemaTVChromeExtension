import * as $ from 'jquery';
import { getVideo, getReplayVideo } from './getAbemaElement';
import * as getInfo from './getAbemaInfo';
import * as gcl from './generic-comment-lib';
import * as gl from './generic-lib';
import { SettingItems } from '../settingsList';
// import * as settingslib from '../settings';

let settings: SettingItems; // Object.assign({}, settingslib.defaultSettings);
// (async function() {
//     const value = await settingslib.getSettings();
//     Object.assign(settings, value);
// })();
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

    let mci = $('#moveContainer');
    if (mci.length === 0) {
        $(
            '<div id="moveContainer" class="usermade" style="-webkit-mask-image: linear-gradient(black,black);mask-image: linear-gradient(black,black);">'
        ).appendTo('body');
        mci = $('#moveContainer');
        if (isReplay) {
            // 見逃し視聴時は動画の上に配置
            mci.css({
                position: 'absolute',
                height: videoRect.height + 'px',
                width: videoRect.width + 'px',
                top: videoRect.top,
                left: videoRect.left
            });
        }
    }
    let mcj = mci.children('.movingComment');
    let mclen = mcj.length;
    let inplen = inp.length;
    let comeoverflowlen = inplen + mclen - settings.movingCommentLimit;
    // あふれる分を削除
    if (comeoverflowlen > 0) {
        for (let cofi = 0; cofi < comeoverflowlen; cofi++) {
            setTimeout(
                function(cofi: number) {
                    mcj.eq(cofi).remove();
                },
                (7000 * cofi) / comeoverflowlen,
                cofi
            ); // あふれた分を1つずつ順番に7秒かけて消す
        }
        //        mclen-=comeoverflowlen;
    }
    //    var jo = $("object,video").parent();
    // let jo = $(getVideo() || []);
    let movieRightEdge;
    //    if(isMovieMaximize){
    //        if(jo.width()>jo.height()*16/9){ //横長
    //            movieRightEdge=jo.width()/2+jo.height()*8/9; //画面半分+映像横長さ/2
    //        }else{ //縦長
    //            movieRightEdge=jo.width();
    //        }
    //    }else{
    movieRightEdge =
        videoRect.left + videoRect.width / 2 + ($(video).width() as number) / 2;
    //    }
    let winwidth = isReplay
        ? videoRect.width
        : settings.comeMovingAreaTrim
        ? movieRightEdge
        : window.innerWidth;
    let outxt = '';
    let setfont = '';
    if ($('#settcont').css('display') !== 'none') {
        setfont =
            'font-size:' + parseInt($('#comeFontsize').val() as string) + 'px;';
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
    $(outxt).appendTo(mci);
    //    mclen+=inplen;
    mcj = mci.children('.movingComment');
    mclen = mcj.length;
    for (let i = 0; i < inplen; i++) {
        let mck = mcj.eq(-inplen + i);
        let mcwidth = mck.width() as number;
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
            function(jo: JQuery, w: number, delta: number) {
                if (gl.isEdge) {
                    jo = $(jo);
                }
                jo.css('transition', 'transform ' + w + 's linear')
                    .css('transform', 'translateX(' + delta + 'px)')
                    .attr('data-createdSec', onairSecCount);
            },
            0,
            mck,
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

    const mci = $('#moveContainer');
    mci.css({
        position: 'absolute',
        height: videoRect.height + 'px',
        width: videoRect.width + 'px',
        top: videoRect.top,
        left: videoRect.left
    });
}
export function setComeFontsizeChanged() {
    const comeFontSize = $('#comeFontsize').val();
    if (comeFontSize === undefined || comeFontSize === '') return;
    const nf = parseInt(comeFontSize as string);
    const jo = $('.movingComment');
    jo.css('font-size', nf + 'px');
}
export function clearOptionTemporaryStyle() {
    $('.movingComment').css('font-size', '');
}
export function moveComeTopFilter(headerHeight: number, footerHeight: number) {
    let jo = $('.movingComment');
    let i = jo.length - 1;
    while (i >= 0) {
        if (
            jo.eq(i).position().top >
            window.innerHeight - headerHeight - footerHeight
        ) {
            jo.eq(i).remove();
        }
        i -= 1;
    }
}
export function generateCSS(isReplay: boolean): string {
    let t = '';
    if (settings.comeFontsizeV && !isReplay) {
        const wh = $(window).height() as number;
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
        let arMovingComment = $('.movingComment');
        for (let j = 0; j < arMovingComment.length; j++) {
            //                if(arMovingComment.eq(j).offset().left + arMovingComment.eq(j).width()<=0){
            // if (arMovingComment.eq(j).offset().left - parseInt(arMovingComment.eq(j)[0].style.left) < 1) {
            if (
                parseInt(
                    arMovingComment[j].getAttribute('data-createdSec') || ''
                ) <
                onairSecCount - settings.movingCommentSecond * 2
            ) {
                arMovingComment[j].remove();
            } else {
                break; // 前から順番に見ていって画面外のコメントを処理し終わったらbreak
            }
        }
    }
}
export function leavePage() {
    $('.movingComment').remove();
}
