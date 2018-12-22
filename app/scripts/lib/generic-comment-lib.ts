// Abemaの仕様に依存しないコメント関係の関数群

function comeNG(prengcome: string, isDeleteStrangeCaps: boolean) {
    // 規定のNG処理
    let ngedcome = prengcome;
    const strface1 =
        '[　 ]*[Σ<＜‹૮＋\\+\\*＊･゜ﾟ:\\.｡\\\'☆〜～ｗﾍ√ﾚｖꉂ꒰·‧º∑♪₍⁺✧]*[　 ]*[┌└┐⊂二乁＼ヾヽつっdｄo_ƪ\\\\╭╰m👆ฅｍ╲٩Ｏ∩┗┏∠٩☜ᕕԅ]*[　 ]*[（\\(《〈\\[\\|｜fζᔦ]+.*[8oO∀дД□◯▽△＿ڼ ౪艸^_⌣зεωm௰ｍ꒳ｰワヮ－U◇。｡࿄ш﹏㉨ꇴㅂ\\-ᴗ‿˘﹃_ﾛ◁ฅ∇益言人ㅅＡAΔΘ罒ᗜ◒◊vਊ⍛ー3xエェｪｴρｐё灬▿┓ڡ◡凵⌑︎▾0▼]+.*';
    const strface2 = '[）\\)》〉\\]\\|｜ᔨ]';
    const strface3 =
        '[　 ]*[┐┘┌┸┓／シノ厂\\/ｼﾉ۶つっbｂoა_╮╯mｍو👎☝」Ｏσ二⊃ゝʃง╭☞∩ゞ┛︎۶งวᕗ]';
    const strface4 =
        '[　 ]*[彡°ﾟ\\+・･⚡\\*＋＊ﾞ゜:\\.｡\\\' ̑̑🌾💢ฅ≡<＜>＞ｗﾍ√ﾚｖ꒱‧º·…⋆ฺ✲⁾♪⁺✧]*[　 ]*';
    const reface1 = new RegExp(
        strface1 + strface2 + '+' + strface3 + '*' + strface4,
        'g'
    );
    const reface2 = new RegExp(
        strface1 + strface2 + '*' + strface3 + '+' + strface4,
        'g'
    );
    ngedcome = ngedcome.replace(reface1, '');
    ngedcome = ngedcome.replace(reface2, '');
    ngedcome = ngedcome.replace(/(@\w+[　 ]*)+/g, ''); // twitter-dest.
    ngedcome = ngedcome.replace(/(#[^　 ]+[　 ]*)+$/g, ''); // twitter-tag
    ngedcome = ngedcome.replace(/[ｗw]{3,}/g, 'ｗｗｗ');
    ngedcome = ngedcome.replace(/ʬ+/g, 'ｗ');
    ngedcome = ngedcome.replace(/h?ttps?:\/\/.*\..*/, '');
    ngedcome = ngedcome.replace(/[〜～ー－━─]{2,}/g, 'ー');
    ngedcome = ngedcome.replace(/[・･…‥、､。｡．\.]{2,}/g, '‥');
    ngedcome = ngedcome.replace(/[　 \n]+/g, ' ');
    ngedcome = ngedcome.replace(/[？?❔❓]+/g, '？');
    ngedcome = ngedcome.replace(/[！!‼️❗❗️]+/g, '！');
    ngedcome = ngedcome.replace(/[○●]+/g, '○');
    ngedcome = ngedcome.replace(/[⑧❽８]{3,}/g, '888');
    ngedcome = ngedcome.replace(/[工エｴｪ]{3,}/g, 'エエエ');
    ngedcome = ngedcome.replace(/([ﾊハ八]|[ﾉノ/][ヽ＼]){3,}/g, 'ハハハ');
    if (isDeleteStrangeCaps) {
        ngedcome = ngedcome.replace(/[^ - -⁯■□▲△▼▽◆◇○◎●　-ヿ一-鿿＀-￯]/g, ''); // 基本ラテン・一般句読点・幾何学模様(一部)・CJK用の記号および分音記号・ひらがな・かたかな・CJK統合漢字・半角形/全角形
    }
    ngedcome = ngedcome.replace(/[͜͜͏̘̣͔͙͎͎̘̜̫̗͍͚͓]+/g, '');
    ngedcome = ngedcome.replace(/[ด็้]+/g, '');

    ngedcome = ngedcome.replace(/[▀-▓]+/g, '');
    ngedcome = ngedcome.replace(/(.)\1{3,}/g, '$1$1$1');
    ngedcome = ngedcome.replace(/(...*?)\1{3,}/, '$1$1$1');
    ngedcome = ngedcome.replace(/(...*?)\1*(...*?)(\1|\2){2,}/g, '$1$2');
    return ngedcome;
}
export function comefilter(
    m: string,
    uid: string,
    arFullNg: RegExp[],
    arUserNg: string[],
    isComeDel: boolean,
    isUserDel: boolean,
    isComeNg: boolean,
    isDeleteStrangeCaps: boolean
) {
    // putComeArrayとcopycomeで同じNG処理を実行するので分離
    let n = m;
    if (isComeNg && m.length > 0) {
        n = comeNG(m, isDeleteStrangeCaps);
    }
    if (isComeDel && m.length > 0) {
        for (let ngi = 0; ngi < arFullNg.length; ngi++) {
            if (arFullNg[ngi].test(m)) {
                console.log(
                    'userNG matched text:' +
                        m +
                        ' ngword:' +
                        arFullNg[ngi].toString()
                );
                m = '';
                break;
            } else if (arFullNg[ngi].test(n)) {
                console.log(
                    'userNG matched text:' +
                        n +
                        '(ori:' +
                        m +
                        ') ngword:' +
                        arFullNg[ngi].toString()
                );
                m = '';
                break;
            }
        }
    }
    if (isUserDel && m.length > 0 && uid) {
        if (arUserNg.includes(uid)) {
            console.log('userNG matched UserID:' + uid + ' text:' + m);
            m = '';
        }
    }
    if (isComeNg && m.length > 0) {
        m = n;
    }
    return m;
}
export function arrayFullNgMaker(fullNg: string) {
    // 自由入力欄からNG正規表現を生成
    let arFullNg = [];
    const spfullng = fullNg.split(/\r|\n|\r\n/);
    for (let ngi = 0; ngi < spfullng.length; ngi++) {
        if (spfullng[ngi].length === 0 || spfullng[ngi].match(/^\/\//)) {
            continue;
        }
        spfullng[ngi] = spfullng[ngi].replace(/\/\/.*$/, ''); // 文中コメントを除去
        let NGregexp;
        const refullng = /^\/(.+)\/([igm]*)$/;
        let rexefullng;
        let b = true;
        if ((rexefullng = refullng.exec(spfullng[ngi])) != null) {
            try {
                NGregexp = new RegExp(rexefullng[1], rexefullng[2]);
                b = false;
            } catch (e) {
                console.warn(e);
                //                spfullng[ngi]=new RegExp("\\"+spfullng[ngi].split("").join("\\"));
            }
        }
        if (b) {
            NGregexp = new RegExp(
                spfullng[ngi].replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1')
            );
        }
        // console.log(spfullng[ngi]);

        arFullNg.push(NGregexp);
    }

    return arFullNg;
}
export function arrayUserNgMaker(userNg: string) {
    let arUserNg = [];
    const splitedUserNg = userNg.split(/\r|\n|\r\n/);
    for (let ngi = 0; ngi < splitedUserNg.length; ngi++) {
        if (
            splitedUserNg[ngi].length === 0 ||
            splitedUserNg[ngi].match(/^\/\//)
        ) {
            continue;
        }
        splitedUserNg[ngi] = splitedUserNg[ngi].replace(/\/\/.*$/, ''); // 文中コメントを除去
        arUserNg.push(splitedUserNg[ngi]);
    }

    return arUserNg;
}
