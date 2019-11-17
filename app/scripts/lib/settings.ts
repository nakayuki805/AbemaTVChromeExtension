import * as settings from '../settingsList';
import { stringify } from 'querystring';
// edge等ブラウザ対応
// if (typeof chrome === "undefined" || !chrome.extension) {
//     console.log('!ch',chrome)
//     var chrome = browser;
// }

export type StorageItems = { [index: string]: any };
export type Setting = settings.Setting;
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
    [index: string]: settings.Setting | settings.RadioBlockSetting;
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
        chrome.storage.local.get(keyObj, item => resolve(item as StorageItems));
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
export function valueFiler(
    name: string,
    value: boolean | string | number | undefined
) {
    let retVal = value;
    if (retVal === undefined) retVal = flatSettings[name].default;
    if (
        flatSettings[name].type === 'number' ||
        flatSettings[name].type === 'range'
    ) {
        retVal = Number(retVal);
        if (isNaN(retVal)) retVal = flatSettings[name].default;
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
export function resetSettings(callback?: () => void) {
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
export function resetCMSettings(callback?: () => void) {
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
export function deleteNoIs() {
    Object.keys(flatSettings)
        .filter(n => n.startsWith('is'))
        .forEach(settingName => {
            chrome.storage.local.remove(removeIs(settingName));
        });
}
