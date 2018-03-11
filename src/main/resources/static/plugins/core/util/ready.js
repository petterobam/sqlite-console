define(function(require,exports,module){
    var $ = window.jQuery,
        VeUtil = require("core/util/VeUtil.js");

    require("store");

    //设置全局监听
    $.ajaxSetup({
        global:true
    });

    var winIndex = null;

    $(document).ajaxError(function(event,jqXhr,settings,exception){
        if(exception === "abort") return; //取消发送请求时不执行
        var result = jqXhr.responseText || "";
        console.log("ajaxError",result);
        if(winIndex) return;
        store.set("cps-exception",result);
        winIndex = layui.layer.open({
            type:2,
            title:"异常信息",
            content:"/component/exceptionInfo",
            area:["700px","400px"],
            end:function(){
                layui.layer.close(winIndex);
                winIndex = null;
            }
        });
    });


    $(document).ready(function(){
        layui.element.on("tab",function(){
            $(window).trigger("resize.jqGrid");
        });
        VeUtil.addTitleTips();
    });

});