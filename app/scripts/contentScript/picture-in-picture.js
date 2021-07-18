import * as getElm from './getAbemaElement';
import * as gdl from '../lib/generic-dom-lib';

export function createPIPbutton(EXsidebtn) {
    const PIPvideoObserver = new MutationObserver(mutations => {
        //console.log(mutations)
        if (
            !document.pictureInPictureElement ||
            document.pictureInPictureElement.src === ''
        ) {
            //console.log('!!!video changed');
            PIPvideoObserver.disconnect();
            //abemaが使用するvideo要素が変更されたら自動でPIP再表示しようと目論んでいたが
            //PIPの表示にはユーザー操作が必要なため挫折
            //現時点ではCMやCH切り替え等のタイミングでいちいちPIPボタンを押してもらう必要がある
            const PIPrequestAgain = () => {
                const video = getElm.getVideo();
                if (video) {
                    getElm
                        .getVideo()
                        .requestPictureInPicture()
                        .then(w => {
                            PIPvideoObserver.observe(
                                document.pictureInPictureElement,
                                { childList: true }
                            );
                        })
                        .catch(e => {
                            console.warn(
                                'request PIP error (video changed)',
                                e
                            );
                            setTimeout(PIPrequestAgain, 500);
                        });
                } else {
                    console.log('PIP video retry');
                    setTimeout(PIPrequestAgain, 500);
                }
            };
            //setTimeout(PIPrequestAgain,500);
        }
    });
    if (!document.pictureInPictureEnabled) return;
    if(!EXsidebtn){
        EXsidebtn = document.getElementsByClassName("ext_abm-sideButton")?.[0];
    }
    if (!EXsidebtn) {
        console.log('createPIPbutton retry');
        setTimeout(createPIPbutton, 1000);
        return;
    }
    //設定ウィンドウ・開くボタン設置
    if (!document.getElementById('PIPbutton')) {
        var PIPbutton = document.createElement('div');
        PIPbutton.id = 'PIPbutton';
        PIPbutton.classList.add('ext-sideButton');
        PIPbutton.classList.add('ext-sideButton-pip');
        PIPbutton.setAttribute(
            'title',
            'ピクチャーインピクチャーモードの切り替え(拡張機能)'
        );
        PIPbutton.insertAdjacentHTML(
            'afterbegin',
            "<img src='" +
                chrome.extension.getURL('/images/pip.svg') +
                "' alt='PIP' class='ext-sideButton-icon'>"
        );
        EXsidebtn.appendChild(PIPbutton);
        document
            .getElementById('PIPbutton')
            .addEventListener('click', function() {
                if (
                    !document.pictureInPictureElement ||
                    document.pictureInPictureElement.src === ''
                ) {
                    getElm
                        .getVideo()
                        .requestPictureInPicture()
                        .then(w => {
                            PIPvideoObserver.observe(
                                document.pictureInPictureElement,
                                { attributes: true }
                            );
                            gdl.toast(
                                'ピクチャーインピクチャーに切り替えました。<br>CMと本編の切り替わりやチャンネル変更でピクチャーインピクチャーの再生が止まります。<br>その際は毎回、再度切り替えボタンを押してください。<br>(AbemaTV及びChromeの仕様により自動で再生継続できません。)'
                            );
                            console.log(w);
                            w.addEventListener('resize', e => {
                                //console.log(e);
                                // if(!document.pictureInPictureElement || document.pictureInPictureElement.src===''){
                                //     getElm.getVideo().requestPictureInPicture();
                                // }
                            });
                        })
                        .catch(e => {
                            console.warn('request PIP error', e);
                            gdl.toast(
                                'ピクチャーインピクチャーへの切り替えに失敗しました。'
                            );
                        });
                } else {
                    document
                        .exitPictureInPicture()
                        .then(() => {
                            PIPvideoObserver.disconnect();
                        })
                        .catch(e => {
                            console.warn('exit PIP error', e);
                            gdl.toast(
                                'ピクチャーインピクチャーの終了に失敗しました。'
                            );
                        });
                }
            });
    }
}
