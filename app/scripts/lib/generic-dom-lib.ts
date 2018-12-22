// DOMを操作するがAbemaとは直接関係ない関数集

export function toast(message: string) {
    let toastElem = $(
        '<div class=\'ext-toast\'><p>' + message + '</p></div>'
    ).appendTo('body');
    setTimeout(function() {
        toastElem.fadeOut(3000);
    }, 4000);
}
