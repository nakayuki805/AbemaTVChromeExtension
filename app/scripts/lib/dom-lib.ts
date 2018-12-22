// DOM操作にまつわる関数集

interface RectFilterOption {
    left14l?: boolean;
    left12l?: boolean;
    left12r?: boolean;
    left23r?: boolean;
    left34r?: boolean;
    right14r?: boolean;
    right14l?: boolean;
    right12r?: boolean;
    right12l?: boolean;
    right34l?: boolean;
    top14u?: boolean;
    top12u?: boolean;
    top12d?: boolean;
    top23d?: boolean;
    top34d?: boolean;
    bottom14u?: boolean;
    bottom12u?: boolean;
    bottom12d?: boolean;
    bottom34d?: boolean;
    width12s?: boolean;
    width12b?: boolean;
    width14s?: boolean;
    width14b?: boolean;
    width34s?: boolean;
    width34b?: boolean;
    height14s?: boolean;
    height14b?: boolean;
    height12s?: boolean;
    height12b?: boolean;
    height34s?: boolean;
    height34b?: boolean;
    notBodyParent?: boolean;
    display?: string;
    displayNot?: string;
    tagName?: string;
    tagNames?: string[];
    notTagName?: string;
    notTagNames?: string[];
    matchSelector?: string;
    notMatchSelector?: string;
    includeText?: string;
    filters?: Array<(element: HTMLElement, b: ClientRect) => boolean>;
}

export function last(array: any[], isNull?: boolean) {
    if (array.length < 1) return isNull ? null : undefined;
    return array[array.length - 1];
}
export function parents(element: HTMLElement) {
    let parents = [];
    while (element.parentElement) {
        parents.push(element.parentElement);
        element = element.parentElement;
    }
    return parents;
}
export function filter(
    elements: ArrayLike<HTMLElement>,
    option: RectFilterOption
) {
    // 要素の位置等で絞り込む
    // option = {left14l: true, ...} left14lはleft座標が1/4より左側(l)であるということ
    return Array.from(elements).filter((element: HTMLElement) => {
        let b = element.getBoundingClientRect();
        let height = b.height;
        let width = b.width;
        if (option.left14l && b.left > window.innerWidth / 4) return false;
        if (option.left12l && b.left > window.innerWidth / 2) return false;
        if (option.left12r && b.left < window.innerWidth / 2) return false;
        if (option.left23r && b.left < (window.innerWidth * 2) / 3)
            return false;
        if (option.left34r && b.left < (window.innerWidth * 3) / 4)
            return false;
        if (option.right14r && b.left + b.width < window.innerWidth / 4)
            return false;
        if (option.right14l && b.left + b.width > window.innerWidth / 4)
            return false;
        if (option.right12r && b.left + b.width < window.innerWidth / 2)
            return false;
        if (option.right12l && b.left + b.width > window.innerWidth / 2)
            return false;
        if (option.right34l && b.left + b.width > (window.innerWidth * 3) / 4)
            return false;
        if (option.top14u && b.top > window.innerHeight / 4) return false;
        if (option.top12u && b.top > window.innerHeight / 2) return false;
        if (option.top12d && b.top < window.innerHeight / 2) return false;
        if (option.top23d && b.top < (window.innerHeight * 2) / 3) return false;
        if (option.top34d && b.top < (window.innerHeight * 3) / 4) return false;
        if (option.bottom14u && b.top + b.height > window.innerHeight / 4)
            return false;
        if (option.bottom12u && b.top + b.height > window.innerHeight / 2)
            return false;
        if (option.bottom12d && b.top + b.height < window.innerHeight / 2)
            return false;
        if (option.bottom34d && b.top + b.height < (window.innerHeight * 3) / 4)
            return false;
        if (option.width12s && b.width > window.innerWidth / 2) return false; // 幅が画面の半分より小さいか(大きいとfalse)
        if (option.width12b && b.width < window.innerWidth / 2) return false; // 〃大きいか
        if (option.width14s && b.width > window.innerWidth / 4) return false;
        if (option.width14b && b.width < window.innerWidth / 4) return false;
        if (option.width34s && b.width > (window.innerWidth * 3) / 4)
            return false;
        if (option.width34b && b.width < (window.innerWidth * 3) / 4)
            return false;
        if (option.height14s && b.height > window.innerHeight / 4) return false;
        if (option.height14b && b.height < window.innerHeight / 4) return false;
        if (option.height12s && b.height > window.innerHeight / 2) return false;
        if (option.height12b && b.height < window.innerHeight / 2) return false;
        if (option.height34s && b.height > (window.innerHeight * 3) / 4)
            return false;
        if (option.height34b && b.height < (window.innerHeight * 3) / 4)
            return false;
        if (
            option.notBodyParent &&
            (!element.parentElement ||
                /BODY|HTML/i.test(element.parentElement.tagName))
        )
            return false;
        if (option.display && element.style.display !== option.display)
            return false;
        if (option.displayNot && element.style.display === option.displayNot)
            return false;
        if (option.tagName || option.tagNames) {
            const tagNames = option.tagNames ? [...option.tagNames] : [];
            if (option.tagName) tagNames.push(option.tagName);
            for (const tagName of tagNames) {
                if (element.tagName.toUpperCase() !== tagName.toUpperCase())
                    return false;
            }
        }
        if (option.notTagName || option.notTagNames) {
            const notTagNames = option.notTagNames
                ? [...option.notTagNames]
                : [];
            if (option.notTagName) notTagNames.push(option.notTagName);
            for (const notTagName of notTagNames) {
                if (element.tagName.toUpperCase() === notTagName.toUpperCase())
                    return false;
            }
        }
        if (option.matchSelector) {
            if (!element.matches(option.matchSelector)) return false;
        }
        if (option.notMatchSelector) {
            if (element.matches(option.notMatchSelector)) return false;
        }
        if (option.includeText) {
            if (
                !element.textContent ||
                !element.textContent.includes(option.includeText)
            )
                return false;
        }
        if (option.filters && option.filters.length > 0) {
            let flag = true;
            option.filters.forEach(filter => {
                if (flag) {
                    flag = filter(element, b);
                }
            });
            if (!flag) return false;
        }
        return true;
    });
}
export function parentsFilterLast(
    element: HTMLElement,
    option: RectFilterOption
): HTMLElement | null {
    return last(filter(parents(element), option), true);
}
export function parentsFilterLastByArray(
    elements: ArrayLike<HTMLElement>,
    option: RectFilterOption
): HTMLElement | null {
    let filteredArray: HTMLElement[] = [];
    Array.from(elements).forEach(element => {
        const lastElement = parentsFilterLast(element, option);
        if (lastElement) filteredArray.push(lastElement);
    });
    return last(filteredArray, true);
}
// セレクターを返す
export function getElementSingleSelector(
    element: HTMLElement,
    sw: number,
    remove?: string[]
) {
    // idがあれば要素名#idを返す
    // classが全体で唯一なら要素名.classを返す
    // sw 1:classが全体でその兄弟だけなら要素名.class:eq(index)を返す 2:classが兄弟で唯一なら要素名.classを返す
    // 全体や兄弟に含めないid,classをremoveで受ける swを忘れないように注意する

    if (!element) return null;
    const tagName = element.tagName;
    let rw = /\w/;
    let rt = /^\s+|\s+$/g;
    const id = element.id.trim();
    if (id !== '') return tagName + '#' + id;
    let rs = /\s/;
    const className = element.className.trim();
    let jo;
    let jolen;
    if (className === '') return null;
    let jr: JQuery<HTMLElement> = $([]);
    if (remove && remove.length > 0) {
        jr = $(remove[0]);
        for (let i = 1; i < remove.length; i++) jr = jr.add(remove[i]);
    }
    const classArray = className.split(rs);
    let selector = className;
    for (let i = 0; i < classArray.length; i++) {
        if (classArray[i] === '' && classArray[i].indexOf('ext_abm-') >= 0)
            continue; // 拡張機能が付与したclassは除外
        selector = tagName + '.' + classArray[i].trim();
        jo = $(selector).not(jr);
        jolen = jo.length;
        if (jolen === 0) continue;
        if (jolen === 1) return selector;
        else if (sw === 1) {
            jo = $(element)
                .siblings(selector)
                .not(jr);
            if (jolen === 1 + jo.length)
                return (
                    selector +
                    ':eq(' +
                    $(element)
                        .prevAll(selector)
                        .not(jr).length +
                    ')'
                );
        } else if (
            sw === 2 &&
            $(element)
                .siblings(selector)
                .not(jr).length === 0
        )
            return selector;
    }
    console.log('?getElementSingleSelector:');
    console.log(element);
    return null;
}
// ↓現在未使用 とりあえずTS移植せずにここにコメントアウトで置いておく
/*function getElementSelector(
    inpElm,
    includeID,
    includeClass,
    includeIndex,
    remove
) {
    //includeID true:#idを含める false:含めない
    //includeClass 2:全ての.classを含める 1:全体で唯一の.classだけ含める 0:含めない
    //includeIndex 2:全要素*:eq(index)を含める 1:要素名:eq(index)を含める 0:含めない
    //全体に含めないid,classをremoveで受ける
    if (!inpElm) return null;
    var ta = $(inpElm);
    var pa = ta.parentsUntil('html');
    var ts = '';
    var ps = '';
    var tt = [];
    var ns = [];
    var re = /\w/;
    var rd = /\s+/;
    var rc = /^\s+|\s+$/g;
    var jr = null;
    if (remove && remove.length > 0) {
        jr = $(remove[0]);
        for (var i = 1; i < remove.length; i++) jr = jr.add(remove[i]);
    }

    ns[0] = [];
    ns[0][0] = ta.prop('nodeName');
    if (includeID) {
        ns[0][1] = ta.prop('id');
    } else {
        ns[0][1] = '';
    }
    ns[0][3] = [];
    ts = ta.prop('class');
    if (re.test(ts)) {
        tt = ts.split(rd);
        for (var j = 0, k = 0; j < tt.length; j++) {
            ts = tt[j].replace(rc, '');
            if (re.test(ts) && ts.indexOf('ext_abm-') < 0) {
                //拡張機能で付与したclassは除外しておく(含めるとcomeまわりでうまくいかない)
                if (includeClass == 1) {
                    if ($('.' + ts).remove(jr).length == 1) {
                        ns[0][3][k++] = ts;
                    }
                } else if (includeClass == 2) {
                    ns[0][3][k++] = ts;
                }
            }
        }
    }
    if (includeIndex == 2 && includeClass == 0 && !includeID) {
        ns[0][2] = ta.index();
    } else if (includeIndex > 0) {
        if (includeIndex == 1) {
            ts = ta.prop('nodeName');
        } else if (includeIndex == 2) {
            ts = '';
        }
        if (ns[0][1].length > 0) {
            ts = ts + '#' + ns[0][1];
        }
        for (let j = 0; j < ns[0][3].length; j++) {
            ts = ts + '.' + ns[0][3][j];
        }
        ns[0][2] = ta.prevAll(ts).length;
    } else {
        ns[0][2] = 0;
    }
    for (let i = 0; i < pa.length; i++) {
        ns[i + 1] = [];
        ns[i + 1][0] = pa.eq(i).prop('nodeName');
        if (includeID) {
            ns[i + 1][1] = pa.eq(i).prop('id');
        } else {
            ns[i + 1][1] = '';
        }
        ns[i + 1][3] = [];
        ts = pa.eq(i).prop('class');
        if (re.test(ts)) {
            tt = ts.split(rd);
            for (let j = 0, k = 0; j < tt.length; j++) {
                ts = tt[j].replace(rc, '');
                if (re.test(ts) && ts.indexOf('ext_abm-') < 0) {
                    if (includeClass == 1) {
                        if ($('.' + ts).length == 1) {
                            ns[i + 1][3][k++] = ts;
                        }
                    } else if (includeClass == 2) {
                        ns[i + 1][3][k++] = ts;
                    }
                }
            }
        }
        if (includeIndex == 2 && includeClass == 0 && !includeID) {
            ns[i + 1][2] = pa.eq(i).index();
        } else if (includeIndex > 0) {
            if (includeIndex == 1) {
                ts = pa.eq(i).prop('nodeName');
            } else if (includeIndex == 2) {
                ts = '*';
            }
            if (ns[i + 1][1].length > 0) {
                ts = ts + '#' + ns[i + 1][1];
            }
            for (let j = 0; j < ns[i + 1][3].length; j++) {
                ts = ts + '.' + ns[i + 1][3][j];
            }
            ns[i + 1][2] = pa.eq(i).prevAll(ts).length;
        } else {
            ns[i + 1][2] = 0;
        }
    }

    ps = '';
    if (includeIndex == 2) {
        ts = '*';
    } else {
        ts = ns[0][0];
    }
    if (includeID && ns[0][1].length > 0) {
        ts = ts + '#' + ns[0][1];
    }
    if (includeClass > 0) {
        for (let j = 0; j < ns[0][3].length; j++) {
            ts = ts + '.' + ns[0][3][j];
        }
    }
    if (includeIndex > 0) {
        ts = ts + ':eq(' + ns[0][2] + ')';
    }
    ps = ts;
    for (let i = 1; i < ns.length - 1; i++) {
        if (includeIndex == 2) {
            ts = '*';
        } else {
            ts = ns[i][0];
        }
        if (includeID && ns[i][1].length > 0) {
            ts = ts + '#' + ns[i][1];
        }
        if (includeClass > 0) {
            for (let j = 0; j < ns[i][3].length; j++) {
                ts = ts + '.' + ns[i][3][j];
            }
        }
        if (includeIndex > 0) {
            ts = ts + ':eq(' + ns[i][2] + ')';
        }
        ps = ts + '>' + ps;
    }
    ps = 'BODY>' + ps;
    return ps;
}*/
export function clickElement(element: HTMLElement) {
    // clickOnairLink(jo)
    // console.log("clickElement", jo);
    let evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
        'click',
        true,
        true,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
    );
    // console.log("dispatch");
    return element.dispatchEvent(evt);
}
export function addExtClass(elm: HTMLElement, className: string) {
    className = 'ext_abm-' + className;
    $('.' + className).removeClass(className);
    $(elm).addClass(className);
}
