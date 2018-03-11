/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: layui+vue的结合使用时，form特殊处理
 * @linc: MIT
 *
 */
define(function(require,exports,module){

    function listenFormEvent(appObj){
        var obj = appObj._data;
        //下拉
        layui.form.on("select",function(data){
            fireEvent(data);
        });
        //复选框
        layui.form.on("checkbox",function(data){
            fireEvent(data);
        });
        //开关切换
        layui.form.on("switch",function(data){
            fireEvent(data);
        });
        //单选按钮
        layui.form.on("radio",function(data){
            fireEvent(data);
        });
    }

    function fireEvent(data,app){
        var originalDom = $(data.elem)[0],
            tagName = originalDom.tagName.toUpperCase(),
            userAgent = window.navigator.userAgent.toLowerCase(),
            ie =  /(msie\s|trident.*rv:)([\w.]+)/.test(userAgent),
            firefox = userAgent.indexOf("firefox")>=0,
            eventType = (tagName === "SELECT")?"change":"click",
            ev = document.createEvent("HTMLEvents");
        if((ie || firefox) && (tagName==="INPUT")) eventType = "change";
        ev.initEvent(eventType,true,true);
        originalDom.dispatchEvent(ev);
    }

    return {
        listenFormEvent:listenFormEvent
    }

});