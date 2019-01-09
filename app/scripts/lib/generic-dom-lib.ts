// DOMを操作するがAbemaとは直接関係ない関数集

export function toast(message: string, duaration: number = 5000) {
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('ext-toast');
    const toastP = document.createElement('p');
    toastP.insertAdjacentHTML('afterbegin', message);
    toastDiv.appendChild(toastP);
    document.body.appendChild(toastDiv);

    setTimeout(function() {
        toastDiv.classList.add('ext-fadeOut3s');
        setTimeout(function() {
            toastDiv.remove();
        }, 3000);
    }, duaration);
}
