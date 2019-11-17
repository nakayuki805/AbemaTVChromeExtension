// 通知ボタン関連
import * as $ from 'jquery';
import * as dl from '../lib/dom-lib';
import * as gl from '../lib/generic-lib';
import * as gdl from '../lib/generic-dom-lib';
import * as getInfo from './getAbemaInfo';

let notifyButtonData: {
    [key: string]: {
        channel: string;
        channelName: string;
        programID: string;
        programTitle: string;
        programTime: number;
        notifyTime: number;
        type?: string;
    };
} = {}; // 通知登録ボタンの番組情報格納

// 拡張機能通知登録済みの番組に背景をつける
export function setRegistProgsBackground() {
    gl.getStorage(null, function(values) {
        // 通知登録済み番組
        const programIDs = Object.keys(values)
            .filter(k => k.startsWith('progNotify'))
            .map(k => values[k].programID);
        programIDs.forEach(programID => {
            const idElem = document.getElementById(programID);
            const article = idElem && idElem.closest('article');
            article && article.classList.add('registeredProgs');
        });
        // 登録されてないのに背景がついてる番組のclass解除
        Array.from(document.getElementsByClassName('registeredProgs')).forEach(
            article => {
                const checkbox = article.querySelector('input[type=checkbox]');
                const progId = checkbox && checkbox.getAttribute('id');
                if (progId && !programIDs.includes(progId)) {
                    article.classList.remove('registeredProgs');
                }
            }
        );
    });
}
function putNotifyButtonElement(
    channel: string,
    channelName: string,
    programID: string,
    programTitle: string,
    programTime: Date,
    notifyButParent: HTMLElement,
    notifySeconds: number
) {
    // console.log(notifySeconds)
    const notifyTime = programTime.getTime() - notifySeconds * 1000;
    const now = new Date();
    const jnotifyButParent = $(notifyButParent);
    if (notifyTime > now.getTime()) {
        const progNotifyName = 'progNotify_' + channel + '_' + programID;
        Array.from(
            notifyButParent.getElementsByClassName('addNotify')
        ).forEach(e => e.remove());
        const notifyButton = dl.createElement('div', {
            class: 'addNotify',
            'data-registered': 'false',
            'data-prognotifyname': progNotifyName
        });
        notifyButParent.insertBefore(
            notifyButton,
            notifyButParent.firstElementChild
        );
        gl.getStorage(progNotifyName, function(notifyData) {
            // console.log(notifyData, progNotifyName)
            notifyButtonData[progNotifyName] = {
                channel: channel,
                channelName: channelName,
                programID: programID,
                programTitle: programTitle,
                programTime: programTime.getTime(), // dateを数字に
                notifyTime: notifyTime
            };
            if (!notifyData[progNotifyName]) {
                // 未登録
                notifyButton.textContent = '拡張機能の通知登録';
                notifyButton.style.backgroundColor = '#fff';
                notifyButton.setAttribute('data-registered', 'false');
                notifyButton.addEventListener('click', function(e) {
                    let clickedButton = e.target as HTMLElement;
                    let request =
                        notifyButtonData[
                            clickedButton.getAttribute('data-prognotifyname') ||
                                ''
                        ];
                    request.type = 'addProgramNotifyAlarm';
                    chrome.runtime.sendMessage(request, function(response) {
                        if (response.result === 'added') {
                            gdl.toast(
                                '通知登録しました<br>番組開始' +
                                    notifySeconds +
                                    '秒前にポップアップで通知します。設定されていた場合は自動で放送画面を開きます。通知設定やChromeが立ち上がってないなどにより通知されない場合があります。Chromeが起動していればAbemaTVを開いてなくても通知されます。'
                            );
                            let clickedButtonParent = clickedButton.parentElement as HTMLElement;
                            clickedButton.remove();
                            putNotifyButtonElement(
                                request.channel,
                                request.channelName,
                                request.programID,
                                request.programTitle,
                                new Date(request.programTime),
                                clickedButtonParent,
                                notifySeconds
                            );
                            if (
                                getInfo.determineUrl() === 1 ||
                                getInfo.determineUrl() === 2
                            ) {
                                setRegistProgsBackground();
                            }
                        } else if (response.result === 'notificationDined') {
                            gdl.toast(
                                '拡張機能からの通知が拒否されているので通知できません'
                            );
                        } else if (response.result === 'pastTimeError') {
                            gdl.toast('既に開始された番組です');
                        }
                    });
                });
            } else {
                // 登録済み
                notifyButton.textContent = '拡張機能の通知登録解除';
                notifyButton.style.backgroundColor = '#feb';
                notifyButton.setAttribute('data-registered', 'true');
                notifyButton.addEventListener('click', function(e) {
                    let clickedButton = e.target as HTMLElement;
                    let progData =
                        notifyButtonData[
                            clickedButton.getAttribute('data-prognotifyname') ||
                                ''
                        ];
                    chrome.runtime.sendMessage(
                        {
                            type: 'removeProgramNotifyAlarm',
                            progNotifyName: clickedButton.getAttribute(
                                'data-prognotifyname'
                            )
                        },
                        function(response) {
                            if (response.result === 'removed') {
                                gdl.toast('通知解除しました', 3000);
                                let clickedButtonParent = clickedButton.parentElement as HTMLElement;
                                clickedButton.remove();
                                putNotifyButtonElement(
                                    progData.channel,
                                    progData.channelName,
                                    progData.programID,
                                    progData.programTitle,
                                    new Date(progData.programTime),
                                    clickedButtonParent,
                                    notifySeconds
                                );
                                if (
                                    getInfo.determineUrl() === 1 ||
                                    getInfo.determineUrl() === 2
                                ) {
                                    setRegistProgsBackground();
                                }
                            }
                        }
                    );
                });
            }
        });
    } else {
        Array.from(
            notifyButParent.getElementsByClassName('addNotify')
        ).forEach(e => e.remove());
    }
}
function programTimeStrToTime(programTimeStr: string) {
    let programTimeArray = programTimeStr.match(
        /(\d+)月(\d+)日[（\(][^ ~]+[）\)]\s*(\d+):(\d+)/
    );
    if (programTimeArray === null) {
        console.warn(
            'programTimeStrToTime("' + programTimeStr + '") not match'
        );
        return new Date(0);
    }
    let now = new Date();
    let programYear = now.getFullYear();
    let programMonthNum = parseInt(programTimeArray[1]) - 1;
    let programDate = parseInt(programTimeArray[2]);
    let programHour = parseInt(programTimeArray[3]);
    let programMinute = parseInt(programTimeArray[4]);
    if (now.getMonth() === 11 && programMonthNum === 0) {
        programYear++;
    } // 現在12月なら1月は来年とする
    let programTime = new Date(
        programYear,
        programMonthNum,
        programDate,
        programHour,
        programMinute,
        0,
        0
    );
    return programTime;
}
export function putNotifyButton(notifySeconds: number, url: string) {
    if (getInfo.determineUrl() !== getInfo.URL_SLOTPAGE) return;
    const detailContainer = dl.last(
        dl.filter(document.getElementsByTagName('div'), {
            width12b: true,
            height12b: true,
            notBodyParent: true,
            notMatchSelector: '#main>*',
            filters: [
                e => e.childElementCount === 2,
                e => e.getElementsByTagName('header').length > 0
            ]
        })
    );
    const buttonContainer =
        detailContainer &&
        dl.parentsFilterLastByArray(
            detailContainer.getElementsByTagName('button'),
            {
                height14s: true,
                filters: [
                    e =>
                        e.childElementCount >= 2 &&
                        e.tagName.toUpperCase() !== 'ul'
                ]
            }
        );
    const header =
        detailContainer && detailContainer.getElementsByTagName('header');

    let titleElement = $(header)
        .find('h1')
        .eq(0);
    if (
        titleElement.text() === '' ||
        !buttonContainer ||
        !detailContainer ||
        !header
    ) {
        setTimeout(function() {
            putNotifyButton(notifySeconds, url);
        }, 1000);
        console.log(
            'putNotifyButton wait',
            titleElement,
            buttonContainer,
            detailContainer,
            header
        );
        return;
    }
    let urlarray = url.substring(17).split('/');
    let channel = urlarray[1];
    let channelName = titleElement.next().text();
    let programID = urlarray[3];
    if (programID.indexOf('?') >= 0) {
        programID = programID.slice(0, programID.indexOf('?'));
    }
    let programTitle = titleElement.text();
    let programTimeStr = titleElement
        .nextAll()
        .eq(1)
        .text();
    console.log(
        programID,
        programTitle,
        channel,
        channelName,
        programTimeStr,
        urlarray
    );
    let programTime = programTimeStrToTime(programTimeStr);
    // console.log(programTime)
    let butParent = $(
        '<div class="addNotifyWrapper slotpage"></span>'
    ).appendTo(buttonContainer);
    putNotifyButtonElement(
        channel,
        channelName,
        programID,
        programTitle,
        programTime,
        butParent[0],
        notifySeconds
    );
    const observer = new MutationObserver((r: MutationRecord[]) => {
        // console.log(r);
        observer.disconnect();
        let butParent = $(
            '<div class="addNotifyWrapper slotpage"></span>'
        ).appendTo(buttonContainer);
        putNotifyButtonElement(
            channel,
            channelName,
            programID,
            programTitle,
            programTime,
            butParent[0],
            notifySeconds
        );
    });
    observer.observe(buttonContainer, { childList: true });
}
export function putSerachNotifyButtons(notifySeconds: number) {
    if (getInfo.determineUrl() !== getInfo.URL_SEARCH) return;
    const h1 = Array.from(document.getElementsByTagName('h1')).filter(e =>
        e.innerText.includes('放送予定')
    )[0];
    if (!h1 || !h1.nextElementSibling) {
        setTimeout(putSerachNotifyButtons, 500, notifySeconds);
        console.log('putSerachNotifyButtons wait: h1');
        return;
    }
    let listWrapper = $(
        h1.nextElementSibling.querySelector('div[role=list]') || []
    );
    let listItems = listWrapper.find('a[role=listitem]');
    let noContentText = '該当する放送予定の番組はありませんでした';
    let noContentMessage = $('p').filter(function(i, e) {
        return (e.textContent || '').includes(noContentText);
    });
    if (listItems.length === 0 && noContentMessage.length === 0) {
        setTimeout(function() {
            putSerachNotifyButtons(notifySeconds);
        }, 1000);
        console.log('putSerachNotifyButtons wait');
        return;
    }
    listItems.each(function(i: number, elem: HTMLElement) {
        let linkArea = $(elem);
        let spans = linkArea
            .children()
            .eq(0)
            .children()
            .eq(1)
            .children('span');
        console.log(spans);
        if (spans.length < 2) return;
        console.log(elem);
        if ($(elem).next('.listAddNotifyWrapper').length > 0) {
            return;
        }
        let butParent = $(
            '<span class="listAddNotifyWrapper"></span>'
        ).insertAfter(elem);
        // linkArea.children().css('border-bottom', 'none');
        let progUrl = linkArea.attr('href') || '';
        let urlarray = progUrl.substring(1).split('/');
        // console.log(urlarray);
        let channel = urlarray[1];
        // let channelNameElem = spans.eq(1);
        let channelName = channel; // channelNameElem.text();
        let programID = urlarray[3];
        let programTitle = spans.eq(0).text();
        let programTime = programTimeStrToTime(spans.eq(1).text());
        // console.log(
        //     linkArea,
        //     channel,
        //     channelName,
        //     programID,
        //     programTitle,
        //     programTime,
        //     butParent
        // );
        putNotifyButtonElement(
            channel,
            channelName,
            programID,
            programTitle,
            programTime,
            butParent[0],
            notifySeconds
        );
    });
    // もっとみるボタンに対応
    let moreBtn = listWrapper.parent().next('button');
    moreBtn.click(function() {
        setTimeout(putSerachNotifyButtons, 500, notifySeconds);
    });
}
export function putReminderNotifyButtons(notifySeconds: number) {
    if (getInfo.determineUrl() !== getInfo.URL_RESERVATION) return;
    let listWrapper = $('a[href^="/channels/"]').parents('ul');
    let listItems = $('a[href^="/channels/"]');
    let featureText = '見たい番組を見逃さないためには'; // 公式通知登録一覧で何も登録してないときの機能紹介文
    let featureMessage = $('p').filter(function(i, e) {
        return (e.textContent || '').includes(featureText);
    });
    if (listItems.length === 0 && featureMessage.length === 0) {
        setTimeout(function() {
            putReminderNotifyButtons(notifySeconds);
        }, 1000);
        console.log('putReminderNotifyButtons wait');
        return;
    }
    listItems.each(function(i, elem) {
        let linkArea = $(elem);
        let p = linkArea
            .children()
            .eq(0)
            .find('p');
        let butParent;
        if (linkArea.next().is('.listAddNotifyWrapper')) {
            butParent = linkArea.next();
        } else {
            butParent = $(
                '<span class="listAddNotifyWrapper"></span>'
            ).insertAfter(elem);
            // linkArea.css('border-bottom', 'none');
        }
        let progUrl = linkArea.attr('href') || '';
        let urlarray = progUrl.substring(1).split('/');
        console.log(urlarray, ,linkArea);
        let channel = urlarray[1];
        let titleElem = p.eq(0);
        let channelName = p.eq(1).text();
        let programID = urlarray[3];
        let programTitle = p.eq(0).text();
        let programTime = programTimeStrToTime(p.eq(2).text());
        putNotifyButtonElement(
            channel,
            channelName,
            programID,
            programTitle,
            programTime,
            butParent[0],
            notifySeconds
        );
    });
    // 一括登録ボタン
    if (listItems.length > 1 && $('.addAllNotifyButton').length < 1) {
        $(
            '<div class="addAllNotifyButton" >以上の番組を全て拡張機能の通知登録する</div>'
        )
            .insertAfter(listWrapper)
            .click(function() {
                $('.addNotify[data-registered="false"]').trigger('click');
            });
    }
}
export function putSideDetailNotifyButton(
    notifySeconds: number,
    EXTTsideL: HTMLElement,
    EXTTsideR: HTMLElement
) {
    console.log('putSideDetailNotifyButton()');
    let sideDetailWrapper = $(EXTTsideR);
    // console.log('put side notify button', sideDetailWrapper);
    if (sideDetailWrapper.length === 0) {
        setTimeout(
            putSideDetailNotifyButton,
            500,
            notifySeconds,
            EXTTsideL,
            EXTTsideR
        );
        console.log('retry putSideDetailNotifyButton (sideDetailWrapper==0)');
    }
    // console.log(sideDetailWrapper.offset(),window.innerWidth - 50);
    const offset = sideDetailWrapper.offset();
    if (offset && offset.left > window.innerWidth - 50) {
        // sideDetailWrapperが右画面外ならリトライ
        setTimeout(
            putSideDetailNotifyButton,
            1000,
            notifySeconds,
            EXTTsideL,
            EXTTsideR
        );
        console.log(
            'retry putSideDetailNotifyButton (left>window.innerWidth-50)'
        );
        return;
    }
    let fp = sideDetailWrapper.find('p'); // 番組詳細,タイトル,日時,見逃し云々?
    let progTitle;
    let progTime = programTimeStrToTime(fp.eq(2).text());
    if (fp.length >= 3) {
        progTitle = fp.eq(1).text();
        progTime = programTimeStrToTime(fp.eq(2).text());
    } else {
        progTitle = $('zo_bq').text();
        progTime = programTimeStrToTime($('.zo_hs').text()); // todo
    }
    let fa = sideDetailWrapper.find('a').filter(function(i, e) {
        return (e.textContent || '').indexOf('詳細') === 0;
    }); // 放送中なら放送画面リンク,詳細をもっとみる
    let progLinkArr;
    if (fa.length > 0) progLinkArr = (fa.first().attr('href') || '').split('/');
    else progLinkArr = ($('.zo_zu').attr('href') || '').split('/'); // todo
    //    let channel = progLinkArr[2];
    let urlchan = progLinkArr.indexOf('channels');
    // console.log(fa,progLinkArr)
    if (urlchan < 0) return;
    let channel = progLinkArr[urlchan + 1];
    let channelName =
        getInfo.getChannelNameOnTimetable(channel, EXTTsideL) || channel;
    //    let progID = progLinkArr[4];
    let progID = progLinkArr[urlchan + 3];
    let notifyButParent;
    if (
        fp.length >= 3 &&
        fa.length > 0 &&
        fp
            .eq(2)
            .next('div')
            .is(fa.first().prev('div'))
    )
        // fp2のすぐ下かつfa0のすぐ上のやつ
        notifyButParent = fp
            .eq(2)
            .next('div')
            .children('div')
            .first();
    else notifyButParent = sideDetailWrapper.find('.zo_zw>div'); // todo
    // console.log(progTitle,progTime,channel,channelName,progID,notifyButParent);
    putNotifyButtonElement(
        channel,
        channelName,
        progID,
        progTitle,
        progTime,
        notifyButParent[0],
        notifySeconds
    );
}
// 番組表スクリプト関連
let notifySeconds = 60; // 通知何秒前か 初期化時に設定に上書き
let channelsData: TimetableViewerScriptChannelsObject | null = null;
const channelKV: { [index: string]: Slot[] } = {}; // チャンネルIDと番組配列の連想配列
const slotKV: { [index: string]: Slot } = {}; // 番組IDと番組情報の連想配列
let watchdogCount = 0; // 万が一mutationobserverが暴走したときの抑制用
setInterval(() => {
    if (watchdogCount > 100) {
        console.warn('watchdogCount>100');
    }
    watchdogCount = 0;
}, 1000);
const TTVSPanelObserver = new MutationObserver(
    (mutations: MutationRecord[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(mutations);
        }
        if (watchdogCount <= 100) {
            putTTVSNotifyButton();
            watchdogCount++;
        }
    }
);

export function TTViewerScriptPrepare(SettingNotifySeconds: number) {
    notifySeconds = SettingNotifySeconds;
    const panelsTop = document.getElementById('TimetableViewer-panels');
    if (!panelsTop) return;
    if (panelsTop.getAttribute('data-ext-prepared') === 'true') return;
    console.log('found AbemaTV Timetable Viewer'); // , panelsTop, panelsTop.innerHTML);
    if (panelsTop.childElementCount === 0) {
        // まだ中身がない
        const TTVSReadyObserver = new MutationObserver(
            (mutations: MutationRecord[]) => {
                TTVSPanelReady();
                TTVSReadyObserver.disconnect();
            }
        );
        TTVSReadyObserver.observe(panelsTop, { childList: true });
    } else {
        TTVSPanelReady();
    }

    panelsTop.setAttribute('data-ext-prepared', 'true');
}
function TTVSPanelReady() {
    // 番組表スクリプト準備OK
    console.log('TTVS panel ready');
    const channelsDataJson = localStorage.getItem('TimetableViewer-channels');
    if (!channelsDataJson) {
        setTimeout(TTVSPanelReady, 2000);
        console.log('TTVS channels data wait');
        return;
    }
    channelsData = JSON.parse(
        channelsDataJson
    ) as TimetableViewerScriptChannelsObject;
    const channelSchedule = channelsData.value;
    channelSchedule.forEach(ch => {
        channelKV[ch.id] = ch.programs;
        ch.programs.forEach(slot => {
            slotKV[slot.id] = slot;
        });
    });
    const timetablePanel = document.getElementById(
        'TimetableViewer-timetable-panel'
    );
    if (timetablePanel) {
        const programArea = timetablePanel.getElementsByClassName('program')[0];
        // console.log(programArea);
        const dateP = programArea.querySelector('.summary>.date');
        if (dateP) {
            TTVSPanelObserver.observe(dateP, {
                childList: true
            });
        } else {
            console.warn('!dateP');
        }
    } else console.warn('!timetablePanel');
}
function putTTVSNotifyButton() {
    console.log('putTTVSNB');
    const timetablePanel = document.getElementById(
        'TimetableViewer-timetable-panel'
    );
    if (!timetablePanel) return;
    const programArea = timetablePanel.getElementsByClassName('program')[0];
    const dateP = programArea.querySelector('.summary>.date');
    if (!dateP) return;
    Array.from(
        programArea.getElementsByClassName('TTVSNotifyButtonWrapper')
    ).forEach(e => e.remove());
    const button = dateP.getElementsByTagName('button')[0];
    const slotId = button.getAttribute('data-once');
    if (
        button.classList.contains('current') ||
        button.classList.contains('play') ||
        !slotId
    ) {
        if (
            !button.classList.contains('current') &&
            !button.classList.contains('play') &&
            !slotId
        ) {
            setTimeout(putTTVSNotifyButton, 1000);
            console.log('no slot retry');
            return;
        }
    } else {
        // console.log('summary', slotId, slotKV[slotId]);
        const slot = slotKV[slotId];
        const notifyButtonWrapper = document.createElement('div');
        notifyButtonWrapper.classList.add('TTVSNotifyButtonWrapper');
        (dateP.parentElement as HTMLElement).insertBefore(
            notifyButtonWrapper,
            dateP.nextSibling
        );
        // console.log(dateP, notifyButtonWrapper);
        putNotifyButtonElement(
            slot.channel.id,
            slot.channel.name,
            slotId,
            slot.title,
            new Date(slot.startAt * 1000),
            notifyButtonWrapper,
            notifySeconds
        );
    }
    // シリーズ・再放送
    const lis = programArea.querySelectorAll('.program li');
    Array.from(lis).forEach(li => {
        const button = li.getElementsByTagName('button')[0];
        if (!button) return;
        const slotId = button.getAttribute('data-once');
        if (!slotId) return;
        // console.log(slotId, slotKV[slotId]);
        const slot = slotKV[slotId];
        const notifyButtonWrapper = document.createElement('div');
        notifyButtonWrapper.classList.add('TTVSNotifyButtonWrapper');
        li.appendChild(notifyButtonWrapper);
        putNotifyButtonElement(
            slot.channel.id,
            slot.channel.name,
            slotId,
            slot.title,
            new Date(slot.startAt * 1000),
            notifyButtonWrapper,
            notifySeconds
        );
    });
}
// TS型定義
interface Slot {
    casts: string[];
    channel: { id: string; name: string };
    content: string;
    copyrights: string[];
    crews: string[];
    detailHighlight: string;
    displayProgramId: string;
    endAt: number;
    id: string;
    links?: { value: string; type: number; title: string }[];
    marks: {};
    noContent: boolean;
    padding: boolean;
    scheneThumbImgs: string[];
    series: string;
    slotGroup?: { id: string; name: string; lastSlotId: string };
    startAt: number;
    thumbImg: string;
    timeshiftEndAt?: number;
    timeshiftFreeEndAt?: number;
    title: string;
}
interface Channel {
    fullName: string;
    id: string;
    name: string;
    order: number;
    programs: Slot[];
}
interface TimetableViewerScriptChannelsObject {
    expire?: number;
    saved: number;
    value: Channel[];
}
