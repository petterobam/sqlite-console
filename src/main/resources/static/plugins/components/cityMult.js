/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 城市多选控件
 * @linc: MIT
 */
define(function (require, exports, module) {

    function init(){
        if($.fn.addCityMult) return;

        $.fn.addCityMult = function(options){
            var fnName = "cityMult" + String(Math.random()).replace(/\D/g,"");
            registerCallback(fnName, options.cbFn);
            layui.layer.open({
                type:2,
                title:"城市多选",
                content:"/component/cityMultTemplate?csids="+options.csids+"&cbFn="+fnName,
                area:["600px","450px"],
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
            callback && callback(data);
        }
    }

    exports.init = init;
});
