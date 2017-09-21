//onairpage.jsからscriptタグとしてこのスクリプトを挿入する
//拡張機能のコンテキストではできないReactへのアクセスなどをページのコンテキストで行う

var inj_currentLocation = '';
var inj_EXcomelist;
var inj_commentObserver = new MutationObserver(function(mutations) {
    inj_onCommentChange(mutations);
}); //コメント欄DOM監視

//URLが変わった時にonairpage.jsからjavascript:スキーマ経由で呼ぶ
function injection_urlChanged(){
    console.log("urlChanged() @injection");
    if(inj_currentLocation === location.href){
        return;
    }
    inj_currentLocation = location.href;
    inj_commentObserver.disconnect();
    //放送画面
    if(inj_currentLocation.indexOf('https://abema.tv/now-on-air/')>=0){
        inj_delaysetComment();
    }
}

function inj_delaysetComment(){
    var comelistInstance = null;
    var jComelist = $('.ext_abm-comelist');
    if(jComelist.length>0){
        comelistInstance = inj_findReact(jComelist.get(0));
    }
    if(comelistInstance !== null){
        //console.log('comelistInstance:', comelistInstance);
        inj_EXcomelist = jComelist.get(0);
        inj_commentObserver.observe(inj_EXcomelist, {childList: true});
    }else{
        console.log('waitng inj_delaysetComment()');
        setTimeout(inj_delaysetComment, 1000);
    }
}
function inj_onCommentChange(mutations){
    var comelistInstance = inj_findReact(inj_EXcomelist);
    //console.log('inj_occ comelistInstance:', comelistInstance);
    var newCommentCount = comelistInstance.state.newCommentCount;//animationのコメ数
    var hasCommentAnimation = comelistInstance.props.hasCommentAnimation;
    var comments = comelistInstance.props.comments;
    //console.log('inj_occ newComeC,hasComeAni,comeli[0]', newCommentCount, hasCommentAnimation, inj_EXcomelist.firstChild);
    $(inj_EXcomelist).attr('data-ext-hasCommentAnimation', hasCommentAnimation);
    var jComments = $(inj_EXcomelist).children();
    var i;
    //animation部
    for(i=0; i < newCommentCount; i++){
        var comment = comments[i];
        jComments.eq(0).children('div').children('div').eq(i)
            .attr('data-ext-message', comments[i].message)
            .attr('data-ext-createdatms', comments[i].createdAtMs)
            .attr('data-ext-id', comments[i].id)
            .attr('data-ext-userid', comments[i].userId);
            //.attr('data-ext-origmsg', jComments.eq(0).children('div').children('div').eq(i).text());
    }
    //コメントリスト本体部
    for(i=(hasCommentAnimation?1:0); i<jComments.length; i++){
        if(!jComments.eq(i).attr('data-ext-id')){
            var comment = comments[i + newCommentCount - (hasCommentAnimation?1:0)];
            if(!comment){continue;}
            jComments.eq(i)
                .attr('data-ext-message', comment.message)
                .attr('data-ext-createdatms', comment.createdAtMs)
                .attr('data-ext-id', comment.id)
                .attr('data-ext-userid', comment.userId);
                //.attr('data-ext-origmsg', jComments.eq(i).text());
        }
    }
}

function inj_findReact(dom) {
    for (var key in dom) {
        if (key.startsWith("__reactInternalInstance$")) {
            var compInternals = dom[key]._currentElement;
            var compWrapper = compInternals._owner;
            var comp = compWrapper._instance;
            return comp;
        }
    }
    return null;
};

setTimeout(function inj_jqwait(){
    //jqueryが使えるまで待機
    if(!$){
        setTimeout(inj_jqwait, 500);
    }else{
        injection_urlChanged();
    }
}, 500);
