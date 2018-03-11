/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:  复制功能扩展
 * @linc: MIT
 */
define(function (require, exports, module) {
    addClipboard();
    var layer = layui.layer;

    function init(){
        $(document).on("mouseenter",".copyText",function(){
            var text = $(this).attr("copyText"),
                showText = $(this).attr("showText"),
                copyText = encodeURIComponent($.trim(text));

            var msgHtml = '<a href="javascript:;" class="clipboard_msg" style="cursor: pointer;color:#fff;" onclick=copy("' + copyText + '")>复制 <span style="color:red;">' + (showText || text) + '</span></a>';

            layer.tips(msgHtml,this,{
                guide:1,
                tips: [2, '#FF9901']
            });
        });

    }

    /**
     * 复制
     * @param text 要复制的文本
     */
    window.copy = function(text){
        text = decodeURIComponent(text);
        $(".clipboard_msg").remove();
        if(window.clipboardData){
            window.clipboardData.setData("text",text);
        }else{
            var clipboard = new Clipboard(".clipboard_msg",{
                text:function(){
                    return text;
                }
            });
            clipboard.on("success",function(){});
            clipboard.on("error",function(e){
                console.log("复制失败",e);
            });
        }
        layer.closeAll("tips");
    };

    /**
     * 添加剪贴板对象，没有直接引入，如果是IE，则不需要引入
     */
    function addClipboard(){
        if (!window.clipboardData) {
            var oHead = document.getElementsByTagName('HEAD').item(0);

            var oScript = document.createElement("script");

            oScript.type = "text/javascript";

            oScript.src ="/static/plugins/core/clipboard/clipboard.min.js";

            oHead.appendChild(oScript);
        }
    }

    exports.init = init;

});
