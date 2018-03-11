/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:
 * @linc: MIT
 */
define(function (require, exports, module) {

    var callback = null;
    function init(){
        if($.fn.addMPCPDuoxuan) return;

        $.fn.addMPCPDuoxuan = function(options){
            var fnName = "MPCPDuoxuan" + String(Math.random()).replace(/\D/g,"");
            registerCallback(fnName, options.cbFn);
            layui.layer.open({
                type:2,
                title:"商户选择",
                content:"/component/mpcpduoxuanTpl?ids="+options.ids+"&cbFn="+fnName,
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
