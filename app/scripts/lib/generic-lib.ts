// 一般的な用途の関数集　DOM操作やAbemaに直接関わることはしないただの便利関数ファイル

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

// HTTP通信
export function postJson(
    url: string,
    data: any,
    headers: any,
    callback: any,
    errorCallback: any
) {
    // Chromeの仕様変更でcontent scriptからの通信がCORBブロックされるのでfirefox以外でもevent page経由で通信
    // if (isFirefox) {
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
    /*} else {
        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: Object.assign(
                {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                headers || {}
            ),
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                callback(result);
            })
            .catch(e => {
                console.warn(e);
                errorCallback({ status: 'error' });
            });
    }*/
}
export function getJson(url: string, data: any, callback: any) {
    let paramStr = '';
    if (data) {
        const params = Object.keys(data).map(
            k => `${k}=${encodeURIComponent(data[k])}`
        );
        if (params.length > 0) paramStr = '?';
        paramStr += params.join('&');
    }
    url += paramStr;
    // if (isFirefox) {
    chrome.runtime.sendMessage({ type: 'getJson', url: url }, function(
        response
    ) {
        if (response.status === 'success') {
            callback(response.result);
        }
    });
    /*} else {
        fetch(url, { mode: 'cors' })
            .then(response => response.json())
            .then(json => {
                callback(json);
            });
    }*/
}
