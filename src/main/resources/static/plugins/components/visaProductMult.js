/**
 * Created by sing on 2018/1/4.
 * @描述:签证产品多选控件
 */

define(function (require, exports, module) {

    function init(){
        if($.fn.addVisaProductMult) return;
        $.fn.addVisaProductMult = function(options){
            var fnName = "visaProductMult" + String(Math.random()).replace(/\D/g,"");
            registerCallback(fnName, options.cbFn);
            layui.layer.open({
                type:2,
                title:"产品选择",
                content:"/component/visaProductMultTpl?ids="+options.ids+"&cbFn="+fnName,
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
