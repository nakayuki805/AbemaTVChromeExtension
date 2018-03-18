/// <reference path="./jquery-lib.d.ts" />
import * as $ from 'jquery';
(function($) {
    $.fn.rect = function() {
        return this.get(0).getBoundingClientRect();
    };
    $.fn.isContainedBy = function(containerElement) {
        return $(containerElement).has(this).length > 0;
    }
    $.fn.containedBy = function(containerElement) {
        return this.filter(function(){
            return $(this).isContainedBy(containerElement);
        });
    }
    $.fn.rectFilter = function(option) {
        // 要素の位置等で絞り込む
        // option = {left14l: true, ...} left14lはleft座標が1/4より左側(l)であるということ
        return this.filter(function(){
            let b = this.getBoundingClientRect();
            let height = b.height;
            let width = b.width;
            if (option.left14l && b.left>window.innerWidth/4) return false;
            if (option.left12l && b.left>window.innerWidth/2) return false;
            if (option.left12r && b.left<window.innerWidth/2) return false;
            if (option.left34r && b.left<window.innerWidth*3/4) return false;
            if (option.right14r && b.left+b.width<window.innerWidth/4) return false;
            if (option.right12r && b.left+b.width<window.innerWidth/2) return false;
            if (option.right12l && b.left+b.width>window.innerWidth/2) return false;
            if (option.right34l && b.left+b.width>window.innerWidth*3/4) return false;
            if (option.top14u && b.top>window.innerHeight/4) return false;
            if (option.top12u && b.top>window.innerHeight/2) return false;
            if (option.top12d && b.top<window.innerHeight/2) return false;
            if (option.top34d && b.top<window.innerHeight*3/4) return false;
            if (option.width12s && b.width>window.innerWidth/2) return false;//幅が画面の半分より小さいか(大きいとfalse)
            if (option.width12b && b.width<window.innerWidth/2) return false;//〃大きいか
            if (option.width14s && b.width>window.innerWidth/4) return false;
            if (option.width14b && b.width<window.innerWidth/4) return false;
            if (option.width34s && b.width>window.innerWidth*3/4) return false;
            if (option.width34b && b.width<window.innerWidth*3/4) return false;
            if (option.height14s && b.height>window.innerHeight/4) return false;
            if (option.height14b && b.height<window.innerHeight/4) return false;
            if (option.height12s && b.height>window.innerHeight/2) return false;
            if (option.height12b && b.height<window.innerHeight/2) return false;
            if (option.height34s && b.height>window.innerHeight*3/4) return false;
            if (option.height34b && b.height<window.innerHeight*3/4) return false;
            if (option.notBodyParent && $(this).parent().is('body,html')) return false;

            return true;
        });
    }
})(jQuery);