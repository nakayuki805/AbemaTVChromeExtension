//onairpage.jsからscriptタグとしてこのスクリプトを挿入する
//拡張機能のコンテキストではできないReactへのアクセスなどをページのコンテキストで行う

var inj_currentLocation = '';
var inj_EXcomelist;
var inj_commentObserver = new MutationObserver(function(mutations) {
    inj_onCommentChange(mutations);
}); //コメント欄DOM監視

//URLが変わった時に実行される
function injection_urlChanged(){
    console.log("urlChanged() @injection");
    if(inj_currentLocation === location.href){
        return;
    }
    inj_currentLocation = location.href;
    inj_commentObserver.disconnect();
    //inj_setRefClass();
    //放送画面
    if(inj_currentLocation.indexOf('https://abema.tv/now-on-air/')>=0){
        setTimeout(inj_delaysetComment,1000);
    }else if(inj_currentLocation.indexOf('https://abema.tv/timetable')>=0){
        //番組表
        setTimeout(function setTTRefClass(){
            var EXTTbody = $('.ext_abm-tt-body')[0];
            if(!EXTTbody){
                EXTTbody = $('article').parent().parent().parent()[0];
            }
            var EXTThead = $('.ext_abm-tt-head')[0];
            if(!EXTThead){
                EXTThead = $('.ext_ref-channel-content-header').children()[0];
            }
            if(!EXTThead){
                EXTThead = $(EXTTbody).parent().parent().prev().children().children()[0];
            }
            if (EXTThead.childElementCount > EXTTbody.childElementCount){
                console.log('retry setTTRefClass()');
                setTimeout(setTTRefClass, 500);
                return;
            }
            //inj_setRefClass();
        },1000);
    }
}

function inj_setRefClass(parent){
    //refsからclassを設定
    (parent?$(parent).find('div'):$('div')).each(function(i,e){
        try{
            var r=inj_findReact(e);
            if(r&&r.refs){
                for(var ref in r.refs){
                    if(r.refs[ref] instanceof HTMLElement){
                        inj_addRefClass(r.refs[ref], ref);
                        console.log(ref,r.refs[ref]);                        
                    }
                }
            }
        }catch(er){
            console.warn(er);
        }
    });
}

function inj_delaysetComment(){
    var comelistInstance = null;
    var jComelist = $('.ext_abm-comelist');
    if(jComelist.length>0){
        comelistInstance = inj_findReact(jComelist.parent().get(0));
    }
    if(comelistInstance !== null){
        //console.log('comelistInstance:', comelistInstance);
        inj_EXcomelist = jComelist.get(0);
        inj_commentObserver.disconnect();
        inj_commentObserver.observe(inj_EXcomelist, {childList: true});
        //放送画面→番組表推移時にAbemaがバグるのに対処
        setTimeout(function(){
            //なぜか存在しないrefs.animatableに対してremoveEventListenerしようとするのでダミーの要素いれておく
            inj_findReact(inj_EXcomelist.parentElement).refs.animatable = document.createElement('div');
        },1000);
    }else{
        console.log('waitng inj_delaysetComment()');
        setTimeout(inj_delaysetComment, 1000);
    }
}
function inj_onCommentChange(mutations){
    var comelistInstance = inj_findReact(inj_EXcomelist.parentElement);
    //console.log('inj_occ comelistInstance:', comelistInstance);
    var newCommentCount = comelistInstance.state.newCommentCount;//animationのコメ数
    var hasCommentAnimation = comelistInstance.props.hasCommentAnimation;
    var comments = comelistInstance.props.comments;
    //console.log('inj_occ newComeC,hasComeAni,comeli[0]', newCommentCount, hasCommentAnimation, inj_EXcomelist.firstChild);
    $(inj_EXcomelist).attr('data-ext-hasCommentAnimation', hasCommentAnimation);
    var jComments = $(inj_EXcomelist).children();
    var i, comment;
    //animation部
    for(i=0; i < newCommentCount; i++){
        comment = comments[i];
        jComments.eq(0).children('div').children('div').eq(i)
            .attr('data-ext-message', comments[i].message)
            .attr('data-ext-createdatms', comments[i].createdAtMs)
            .attr('data-ext-id', comments[i].id)
            .attr('data-ext-userid', comments[i].userId);
            //.attr('data-ext-origmsg', jComments.eq(0).children('div').children('div').eq(i).text());
    }
    //コメントリスト本体部
    //hasCommentAnimationがtrueなのにanimation部が無いことがあるので本当にあるのかここでチェック
    if(hasCommentAnimation&&jComments.eq(0).children().children('p').length>0){hasCommentAnimation=false;}
    for(i=(hasCommentAnimation?1:0); i<jComments.length; i++){
        if(!jComments.eq(i).attr('data-ext-id')){
            comment = comments[i + newCommentCount - (hasCommentAnimation?1:0)];
            if(!comment){continue;}
            jComments.eq(i)
                .attr('data-ext-message', comment.message)
                .attr('data-ext-createdatms', comment.createdAtMs)
                .attr('data-ext-id', comment.id)
                .attr('data-ext-userid', comment.userId);
                //.attr('data-ext-origmsg', jComments.eq(i).find('p').text());
        }
    }
}

function inj_findReact(comelist) {
    for (var key in comelist) {
        if (key.startsWith("__reactInternalInstance$")) {
            if (comelist[key].child && comelist[key].child.stateNode){
                return comelist[key].child.stateNode;
            }
        }
    }
    return null;
}
function inj_setReact(comelist, vkey, value) {
    for (var key in comelist) {
        if (key.startsWith("__reactInternalInstance$")) {
            if (comelist[key].child && comelist[key].child.stateNode){
                comelist[key].child.stateNode[vkey] = value;
            }
        }
    }
}
function inj_addRefClass(elm, refName){
    var className = 'ext_ref-'+refName;
    //$('.'+className).removeClass(className);
    $(elm).addClass(className).attr('data-ext-ref',refName);
}

setTimeout(function inj_jqwait(){
    //jqueryが使えるまで待機
    if(!$){
        setTimeout(inj_jqwait, 500);
    }else{
        injection_urlChanged();
    }
}, 500);

//イベント
window.addEventListener('urlChange', injection_urlChanged);
window.addEventListener('commentListReady', inj_delaysetComment);
