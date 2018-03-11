/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 供应商单选控件
 * @linc: MIT
 *
 */
define(function (require,exports) {
    var $ = window.jQuery;
    var Pulldown = require("js/Pulldown.js"),
        Common = require("js/Common.js");

    function init(){
        if($.fn.shdanxuan) return;

        $.fn.shdanxuan = function(opts1,opts2){

            if(!this.length) Common.nodeError(this);
            var options1 = $.extend(true,{
                simpleData:{
                    "id":"shbh",
                    "name":"jc"
                },
                title:"可输入简称、拼音首字母、编号",
                fn1:function(data){
                    return "<span style=''>"+data.jc+"</span><span class='right'>"+data.shbh+"</span>";
                },
                height:300,
                type:2,
                typeValue:"/customer/kj/cpsa/sh/like",
                "dataType":"dynamic",
                "_hasPage_":false //不要分页
            },opts1);

            var options2 = $.extend(true,{
                simpleData:{
                    "id":"shbh",
                    "name":"jc"
                },
                title:"可输入简称、拼音首字母、编号",
                fn1:function(data){
                    return "<span style=''>"+data.jc+"</span><span class='right'>"+data.shbh+"</span>";
                },
                type:2,
                typeValue:"/customer/kj/cpsa/sh/like",
                "dataType":"dynamic"
            },opts2);
            var pulldown1 = new Pulldown(this.get(0), options1);
            var pulldown2 = new Pulldown(this.get(0), options2);
            var isLoaded = false;

            this.on("click",function(){
                if(!isLoaded){
                    pulldown1.load(function(data){
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }else{
                    pulldown1.show();
                }
                pulldown2.hide();
            }).on("keyup",function(ev){
                exec.call(this,ev);
            }).on("keydown",function(ev){
                //输入中文的时候，按enter键，在360上不能检索
                if(ev.keyCode === 229){
                    var _this = this;
                    setTimeout(function(){
                        exec.call(_this,ev);
                    },500);
                }
            });

            function exec(ev){
                if(!this.value){
                    pulldown1.show();
                    pulldown2.hide();
                }else{
                    pulldown1.hide();
                    pulldown2.elemKeyUpHandler(ev,function(data){
                        this.render();
                        this.show();
                    });
                }
            }

        };
    }
    exports.init = init;
});