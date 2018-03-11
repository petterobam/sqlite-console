/**
 * Created by sing on 2018/1/8.
 * @描述:景区选择控件
 */
define(function (require, exports, module) {

    function init(){
        if($.fn.scenicAreaMult) return;
        $.fn.scenicAreaMult = function(options){
            var fnName = "scenicArea" + String(Math.random()).replace(/\D/g,"");
            registerCallback(fnName, options.cbFn);
            layui.layer.open({
                type:2,
                title:"景区选择",
                content:"/component/scenicAreaMultTpl?ids="+options.ids+"&cbFn="+fnName,
                area:["700px","450px"],
                shade:0.3,
                end:function(){
                }
            });
        }
    }

    /**
     * 注册回调函数
     * @param fnName
     * @param callback
     */
    function registerCallback(fnName,callback){
        window[fnName] = function(data){
            if(callback) callback(data);
        }
    }

    exports.init = init;

});
