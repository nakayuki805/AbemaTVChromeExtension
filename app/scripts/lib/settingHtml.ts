import {
    settingsList,
    RadioSettingList,
    ComeColorSettingList,
    CMSettingList,
    valueFiler,
    flatSettings,
    StorageItems,
    Setting
} from './settings';
function generateOptionInput(settingsArr: Setting[], isPermanent: boolean) {
    let inputHTML = '';
    let i = 0;
    let description;
    let isNotChangable;
    let defaultVal;
    for (i = 0; i < settingsArr.length; i += 1) {
        description =
            !isPermanent && settingsArr[i].instantDescription
                ? settingsArr[i].instantDescription
                : settingsArr[i].description;
        isNotChangable = !isPermanent && !settingsArr[i].isInstantChangable;
        // 変更不可な項目は表示せず飛ばす
        if (isNotChangable) continue;
        inputHTML +=
            '<div class="inputWrapper" id="' +
            settingsArr[i].name +
            '-wrapper">';
        if (settingsArr[i].type === 'boolean') {
            inputHTML +=
                '<div class="toggle-switch" id="' +
                settingsArr[i].name +
                '-switch"><input type="checkbox" id="' +
                settingsArr[i].name +
                '"><label for="' +
                settingsArr[i].name +
                '"></label></div><label for="' +
                settingsArr[i].name +
                '">:' +
                description +
                '</label>';
            inputHTML += '<br/>';
        } else {
            if (settingsArr[i].type === 'number') {
                inputHTML += '<label for="' + settingsArr[i].name + '">';
                inputHTML += description;
                inputHTML += ':</label>';
                inputHTML +=
                    '<input type="number" id="' + settingsArr[i].name + '">';
                inputHTML += '<br/>';
            } else if (settingsArr[i].type === 'textarea') {
                inputHTML += '<label for="' + settingsArr[i].name + '">';
                inputHTML +=
                    '<textarea id="' +
                    settingsArr[i].name +
                    '" rows=3 cols=40 wrap=off></textarea>';
                inputHTML += ':' + description;
                inputHTML += '</label>';
                inputHTML += '<br/>';
            } else if (settingsArr[i].type === 'range') {
                const range = settingsArr[i].range || [0, 255];
                inputHTML +=
                    '<div><span class="desc"><label for="' +
                    settingsArr[i].name +
                    '">' +
                    description;
                inputHTML += '</label></span>:';
                inputHTML += '<span class="prop">-</span>';
                inputHTML +=
                    '<input type="range" id="' +
                    settingsArr[i].name +
                    '" class="setting-range"' +
                    (range[0] ? ` min="${range[0]}"` : '') +
                    (range[1] ? ` max="${range[1]}"` : '') +
                    '></div>';
            } else if (settingsArr[i].type === 'text') {
                defaultVal = settingsArr[i].default || '';
                inputHTML += '<label for="' + settingsArr[i].name + '">';
                inputHTML += description;
                inputHTML += ':</label>';
                inputHTML +=
                    '<input type="input" id="' +
                    settingsArr[i].name +
                    '" placeholder=' +
                    defaultVal +
                    '>';
                inputHTML += '<br/>';
            } else if (settingsArr[i].type === 'select') {
                inputHTML += '<label for="' + settingsArr[i].name + '">';
                inputHTML += description;
                inputHTML += ':</label>';
                inputHTML += '<select id="' + settingsArr[i].name + '">';
                const selections = settingsArr[i].selections;
                if (selections !== undefined) {
                    selections.forEach(function(item) {
                        inputHTML +=
                            '<option value="' +
                            item.value +
                            '">' +
                            item.string +
                            '</option>';
                    });
                }
                inputHTML += '</select><br/>';
            } else if (settingsArr[i].type === 'radio') {
                inputHTML += '<label for="' + settingsArr[i].name + '">';
                inputHTML += description;
                inputHTML += ':</label>';
                const selections = settingsArr[i].selections;
                if (selections !== undefined) {
                    selections.forEach(function(item) {
                        const id = settingsArr[i].name + '-' + item.value;
                        inputHTML +=
                            '<input type="radio" value="' +
                            item.value +
                            '" id="' +
                            id +
                            '" name="' +
                            settingsArr[i].name +
                            '"><label for="' +
                            id +
                            '">' +
                            item.string +
                            '</label> ';
                    });
                }
                inputHTML += '<br/>';
            }
        }
        inputHTML += '</div>';
    }
    return inputHTML;
}
function generateRadioInput(settingsArr: typeof RadioSettingList) {
    let inputHTML = '';
    for (let i = 0; i < settingsArr.length; i++) {
        inputHTML += '<div id="i' + settingsArr[i].name + '">';
        for (let j = 0; j < settingsArr[i].list.length; j++) {
            inputHTML += '<div>';
            for (let k = 0; k < settingsArr[i].list[j].length; k++) {
                let radioID =
                    'radio-' +
                    settingsArr[i].name +
                    '-' +
                    settingsArr[i].list[j][k][0];
                inputHTML += '<div>';
                inputHTML +=
                    '<input type="radio" name="' +
                    settingsArr[i].name +
                    '" value="' +
                    settingsArr[i].list[j][k][0] +
                    '" id="' +
                    radioID +
                    '"><label for="' +
                    radioID +
                    '">';
                inputHTML += settingsArr[i].list[j][k][1];
                inputHTML += '</label></div>';
            }
            inputHTML += '</div>';
        }
        inputHTML += '</div>';
    }
    return inputHTML;
}
export function generateOptionHTML(isPermanent: boolean) {
    let htmlstr = '';
    const dummySrc = '/images/settings/1x1.png';
    for (let i = 0; i < settingsList.length; i++) {
        let inputHtml = generateOptionInput(
            settingsList[i].settings,
            isPermanent
        );
        // 一時設定で項目が空なら飛ばす
        if (
            !inputHtml &&
            !isPermanent &&
            !settingsList[i].instantHeader &&
            !settingsList[i].instantFooter
        )
            continue;
        htmlstr +=
            '<fieldset style="border: 1px solid silver;margin: 0 2px;padding: .35em .625em .75em;"><legend>' +
            settingsList[i].description +
            '</legend><div class="settingWrapper' +
            (settingsList[i].isShowImage && isPermanent ? ' showimage' : '') +
            '">' +
            '<div class="settingInputWrapper">';
        if (isPermanent) {
            htmlstr += settingsList[i].header || '';
        } else {
            htmlstr +=
                settingsList[i].instantHeader || settingsList[i].header || '';
        }
        htmlstr += inputHtml;
        if (isPermanent) {
            htmlstr += settingsList[i].footer || '';
        } else {
            htmlstr +=
                settingsList[i].instantFooter || settingsList[i].footer || '';
        }
        htmlstr += '</div>';
        if (settingsList[i].isShowImage && isPermanent)
            htmlstr +=
                '<div class="imageSpace"><img class="descImage" src="' +
                dummySrc +
                '"></div>';
        htmlstr += '</div></fieldset>';
    }
    htmlstr +=
        '<fieldset><legend>コメント色関連設定</legend><div id="CommentColorSettings">' +
        generateOptionInput(ComeColorSettingList, isPermanent) +
        '</div></fieldset>';
    htmlstr += generateRadioInput(RadioSettingList);
    htmlstr +=
        '<div id="CommentMukouSettings"><fieldset><legend>コメント無効時関連設定</legend>' +
        generateOptionInput(CMSettingList, isPermanent) +
        '</fieldset></div>';
    return htmlstr;
}

export function setSettingInputValue(
    settings: StorageItems,
    isPermanent: boolean
) {
    Object.keys(flatSettings).forEach(function(key) {
        const value = valueFiler(key, settings[key]);
        const setting = flatSettings[key];
        if (!isPermanent && !setting.isInstantChangable) return;
        const idElem = document.getElementById(key);
        if (idElem) {
            if (setting.type === 'boolean') {
                (<HTMLInputElement>idElem).checked = value as boolean;
            } else if (setting.type === 'text') {
                (<HTMLInputElement>idElem).value = value as string;
            } else if (setting.type === 'textarea') {
                (<HTMLTextAreaElement>idElem).value = value as string;
            } else if (setting.type === 'number') {
                (<HTMLInputElement>idElem).value = value.toString();
            } else if (setting.type === 'select') {
                (<HTMLSelectElement>idElem).value = value as string;
            } else if (setting.type === 'range') {
                (<HTMLInputElement>idElem).value = value.toString();
            }
        } else if (setting.type === 'radio' || setting.type === 'radioblock') {
            const radios = document.querySelectorAll('[name="' + key + '"]');
            for (let i = 0; i < radios.length; i++) {
                const radio = radios[i] as HTMLInputElement;
                if (radio.value === value.toString()) radio.checked = true;
            }
        } else if (setting.type === 'panelopenset') {
            let sp = value as number;
            // console.log(sp.toString(3).padStart(12, '0'));
            if (sp < Math.pow(3, 12)) {
                for (let i = 0; i < 4; i++) {
                    for (let j = 0, m, d; j < 3; j++) {
                        m = Math.pow(3, (3 - i) * 3 + (2 - j));
                        // console.log(
                        //     'i=' + i + ',j=' + j + ',m=' + m.toString(3)
                        // );
                        d = 0;
                        while (m <= sp) {
                            sp -= m;
                            d++;
                        }
                        // console.log('sp=' + sp.toString(3) + ',d=' + d);
                        if (d < 3) {
                            const radios = document.querySelectorAll(
                                '#panelcustomTable [type="radio"][name="d' +
                                    i +
                                    '' +
                                    j +
                                    '"]'
                            );
                            for (let k = 0; k < radios.length; k++) {
                                const radio = radios[k] as HTMLInputElement;
                                if (radio.value === d.toString())
                                    radio.checked = true;
                            }
                        }
                    }
                }
            }
        }
    });
}
export function getSettingInputValue(isPermanent: true): StorageItems {
    const gotSetting: StorageItems = {};
    Object.keys(flatSettings).forEach(function(key) {
        const setting = flatSettings[key];
        if (!isPermanent && !setting.isInstantChangable) return;
        let value = setting.default;
        const idElem = document.getElementById(key);
        if (idElem) {
            if (setting.type === 'boolean') {
                value = (<HTMLInputElement>idElem).checked;
            } else if (setting.type === 'text') {
                value = (<HTMLInputElement>idElem).value;
            } else if (setting.type === 'textarea') {
                value = (<HTMLTextAreaElement>idElem).value;
            } else if (setting.type === 'number') {
                value = parseInt((<HTMLInputElement>idElem).value);
            } else if (setting.type === 'select') {
                value = (<HTMLSelectElement>idElem).value;
            } else if (setting.type === 'range') {
                value = parseInt((<HTMLInputElement>idElem).value);
            }
        } else if (setting.type === 'radio' || setting.type === 'radioblock') {
            const checked = document.querySelector(
                '[name="' + key + '"]:checked'
            );
            if (checked) value = (<HTMLInputElement>checked).value;
            else console.warn(`${key}: checked radio not found`);
        } else if (setting.type === 'panelopenset') {
            let panelopenset = 0;
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 3; j++) {
                    const checked = document.querySelector(
                        '#panelcustomTable [type="radio"][name="d' +
                            i +
                            '' +
                            j +
                            '"]:checked'
                    );
                    if (checked)
                        panelopenset +=
                            parseInt((<HTMLInputElement>checked).value) *
                            Math.pow(3, (3 - i) * 3 + (2 - j));
                }
            }
            value = panelopenset;
        } else
            console.warn(
                `getSettingInputValue: not match type: ${setting.type} (${key})`
            );
        value = valueFiler(key, value);
        gotSetting[key] = value;
    });
    return gotSetting;
}
export function setRangeNumberDisplayer() {
    function displayNum(range: HTMLInputElement) {
        if (!range.parentElement) return;
        const prop = range.parentElement.getElementsByClassName(
            'prop'
        )[0] as HTMLSpanElement;
        const value = parseInt(range.value);
        const name = range.id;

        if (!name) return;
        const settingRange = flatSettings[name].range || [0, 255];
        const min = settingRange[0] === undefined ? 0 : settingRange[0];
        const max = settingRange[1] === undefined ? 255 : settingRange[1];
        console.log(name, value, min, max);

        const text = `${value} (${Math.round(
            (100 * (value - min)) / (max - min)
        )}%)`;
        prop.innerText = text;
    }
    Array.from(document.getElementsByClassName('setting-range')).forEach(
        range => {
            setTimeout(displayNum, 100, range as HTMLInputElement);
            range.addEventListener('change', (e: Event) => {
                displayNum(e.target as HTMLInputElement);
            });
        }
    );
}
