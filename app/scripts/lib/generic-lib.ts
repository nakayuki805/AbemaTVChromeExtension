// 一般的な用途の関数集　DOM操作やAbemaに直接関わることはしないただの便利関数ファイル
import * as $ from 'jquery';

export const isFirefox = window.navigator.userAgent
    .toLowerCase()
    .includes('firefox');
export const isEdge = window.navigator.userAgent.toLowerCase().includes('edge');

export function hasArray(array: ArrayLike<any>, item: any) {
    // 配列arrayにitemが含まれているか
    return Array.from(array).includes(item);
}

export function getStorage(
    keys: string | Object | string[] | null,
    callback: (items: { [key: string]: any }) => void
) {
    if (chrome.storage) {
        if (keys) {
            chrome.storage.local.get(keys, callback);
        } else {
            chrome.storage.local.get(callback);
        }
    } else {
        chrome.runtime.sendMessage({ type: 'getStorage', keys: keys }, function(
            response
        ) {
            callback(response.items);
        });
    }
}
export function setStorage(
    items: string | Object | string[],
    callback: () => void
) {
    if (chrome.storage) {
        chrome.storage.local.set(items, callback);
    } else {
        chrome.runtime.sendMessage(
            { type: 'setStorage', items: items },
            function(response) {
                // console.log(response.result)
                callback();
            }
        );
    }
}

// jQuery ajax
export function postJson(
    url: string,
    data: any,
    headers: any,
    callback: any,
    errorCallback: any
) {
    if (isFirefox) {
        chrome.runtime.sendMessage(
            { type: 'postJson', url: url, data: data, headers: headers },
            function(response) {
                if (response.status === 'success') {
                    callback(response.result);
                } else {
                    errorCallback();
                }
            }
        );
    } else {
        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            headers: headers,
            contentType: 'application/json',
            dataType: 'json',
            success: callback,
            error: errorCallback
        });
    }
}
export function getJson(url: string, data: any, callback: any) {
    if (isFirefox) {
        chrome.runtime.sendMessage(
            { type: 'getJson', url: url, data: data },
            function(response) {
                if (response.status === 'success') {
                    callback(response.result);
                }
            }
        );
    } else {
        $.get(url, data, callback);
    }
}
