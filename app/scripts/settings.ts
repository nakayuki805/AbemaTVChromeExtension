import * as settings from './settingsList';
// edge等ブラウザ対応
// if (typeof chrome === "undefined" || !chrome.extension) {
//     console.log('!ch',chrome)
//     var chrome = browser;
// }

type StorageItems = { [index: string]: any };
export const settingsList = settings.settings;
export const ComeColorSettingList = settings.comeColorSettings;
export const RadioSettingList = settings.radioSettings;
export const CMSettingList = settings.CMSettings;

export const defaultSettings: {
    [index: string]: boolean | string | number;
} = _defaultSettings(false);
export const defaultSettingsIncludeNoIs: {
    [index: string]: boolean | string | number;
} = _defaultSettings(true);
export const settingNames = Object.keys(defaultSettings);
export const settingNamesIncludeNoIs = Object.keys(defaultSettingsIncludeNoIs);
export const flatSettings: {
    [index: string]: settings.Setting | settings.RadioSetting;
} = _flatSettings();

function removeIs(str: string) {
    let afteris = str.indexOf('is') === 0 ? str.slice(2) : str;
    let firtsLetter =
        afteris.substr(0, 2) === 'CM'
            ? 'C'
            : afteris.substr(0, 1).toLocaleLowerCase();
    return firtsLetter + afteris.slice(1);
}
export function getStorage(keyObj?: string | StorageItems | string[] | null) {
    return new Promise(resolve => {
        if (keyObj === undefined) keyObj = null;
        chrome.storage.local.get(keyObj, item => resolve(item));
    });
}
export function setStorage(obj: StorageItems) {
    return new Promise(resolve => {
        chrome.storage.local.set(obj, () => {
            resolve();
        });
    });
}
function _defaultSettings(isIncludeNoIs: boolean) {
    let ret: StorageItems = {};
    for (let i = 0; i < settingsList.length; i++) {
        for (let j = 0; j < settingsList[i].settings.length; j++) {
            ret[settingsList[i].settings[j].name] =
                settingsList[i].settings[j].default;
            if (isIncludeNoIs) {
                ret[removeIs(settingsList[i].settings[j].name)] =
                    settingsList[i].settings[j].default;
            }
        }
    }
    for (let i = 0; i < ComeColorSettingList.length; i++) {
        ret[ComeColorSettingList[i].name] = ComeColorSettingList[i].default;
        if (isIncludeNoIs) {
            ret[removeIs(ComeColorSettingList[i].name)] =
                ComeColorSettingList[i].default;
        }
    }
    for (let i = 0; i < RadioSettingList.length; i++) {
        ret[RadioSettingList[i].name] = RadioSettingList[i].default;
        if (isIncludeNoIs) {
            ret[removeIs(RadioSettingList[i].name)] =
                RadioSettingList[i].default;
        }
    }
    for (let i = 0; i < CMSettingList.length; i++) {
        ret[CMSettingList[i].name] = CMSettingList[i].default;
        if (isIncludeNoIs) {
            ret[removeIs(CMSettingList[i].name)] = CMSettingList[i].default;
        }
    }
    return ret;
}
function _flatSettings() {
    let ret: typeof flatSettings = {};
    for (let i = 0; i < settingsList.length; i++) {
        for (let j = 0; j < settingsList[i].settings.length; j++) {
            ret[settingsList[i].settings[j].name] = settingsList[i].settings[j];
        }
    }
    for (let i = 0; i < ComeColorSettingList.length; i++) {
        ret[ComeColorSettingList[i].name] = ComeColorSettingList[i];
    }
    for (let i = 0; i < RadioSettingList.length; i++) {
        ret[RadioSettingList[i].name] = RadioSettingList[i];
    }
    for (let i = 0; i < CMSettingList.length; i++) {
        ret[CMSettingList[i].name] = CMSettingList[i];
    }
    return ret;
}
export function valueFiler(name: string, value: boolean | string | number) {
    let retVal = value;
    if (
        flatSettings[name].type === 'number' ||
        flatSettings[name].type === 'range'
    ) {
        retVal = Number(retVal);
    }
    if (flatSettings[name].range !== undefined) {
        const range = flatSettings[name].range;
        if (range[0] !== undefined) retVal = Math.max(range[0], Number(retVal));
        if (range[1] !== undefined) retVal = Math.min(range[1], Number(retVal));
    }
    return retVal;
}
export async function getSettings() {
    // isアリを優先で取得後、isありなし両方を出力
    let val: StorageItems = await getStorage(defaultSettings);
    let valNoIs: StorageItems = await getStorage(defaultSettingsIncludeNoIs);
    let retval: StorageItems = {};
    settingNames.forEach(name => {
        let eachValue = val[name];
        let noIsValue = valNoIs[removeIs(name)];
        if (eachValue === defaultSettings[name] && noIsValue !== undefined) {
            eachValue = noIsValue;
        }
        retval[name] = valueFiler(name, eachValue);
        retval[removeIs(name)] = retval[name];
    });
    return retval;
}
export function resetSettings(callback?: (() => void)) {
    chrome.storage.local.get(function(value) {
        let keys = [];
        for (let key in value) {
            if (key.indexOf('progNotify') < 0) {
                // 通知登録データは除外
                keys.push(key);
            }
        }
        chrome.storage.local.remove(keys, callback);
    });
}
export function resetCMSettings(callback?: (() => void)) {
    let keys = [];
    for (let i = 0; i < CMSettingList.length; i++) {
        keys.push(CMSettingList[i].name);
        if (CMSettingList[i].name.indexOf('is') === 0) {
            keys.push(removeIs(CMSettingList[i].name));
        }
    }
    chrome.storage.local.remove(keys, callback);
}
export function removeCMsettings(obj: StorageItems) {
    let keys = [],
        i;
    for (i = 0; i < CMSettingList.length; i++) {
        keys.push(CMSettingList[i].name);
        if (CMSettingList[i].name.indexOf('is') === 0) {
            keys.push(removeIs(CMSettingList[i].name));
        }
    }
    for (let key in obj) {
        for (i = 0; i < keys.length; i++) {
            if (key === keys[i]) {
                delete obj[key];
            }
        }
    }
    return obj;
}
function generateOptionInput(
    settingsArr: settings.Setting[],
    isPermanent: boolean
) {
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
                    '" max=255></div>';
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
                if (settingsArr[i].selections !== undefined) {
                    (settingsArr[i].selections as (string | number)[]).forEach(
                        function(item) {
                            inputHTML +=
                                '<option value="' +
                                item +
                                '">' +
                                item +
                                '</option>';
                        }
                    );
                }
                inputHTML += '</select><br/>';
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
            '<fieldset style=\'border: 1px solid silver;margin: 0 2px;padding: .35em .625em .75em;\'><legend>' +
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
