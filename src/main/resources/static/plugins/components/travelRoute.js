/**
 * Created by sing on 2017/11/10.
 * @描述: 旅游线路选择控件
 */
define(function(require,exports,module){

    require("store");

    function init(){
        if($.fn.chooseTravelRoute) return ;
        $.fn.chooseTravelRoute = function(options){
            options = $.extend(true,{
                hiddenName:''
            },options);
            var dlg = new TravelRouteProvider(options);
            dlg.show();
        };
    }

    /**
     * 旅游线路选择类
     * @param options
     * @constructor
     */
    function TravelRouteProvider(options){
        this.option = options ||{};
        this.fnName = null;
        this.layerIndex = null;
    }

    TravelRouteProvider.prototype = {
        show:function(){
            var _this = this;
            this.registerCallback();
            this.keyId = "travelRoute-" + String(Math.random()).replace(/\D/g,"");
            this.keyId2 = "getChoosedList-" +String(Math.random()).replace(/\D/g,""); //获取值的函数名
            var cList = this.option.choosedList;
            window[this.keyId2] = function(){
                return cList;
            };
            this.layerIndex = window.layui.layer.open({
                type:2,
                title:"选择旅游线路",
                content:"/component/travelRouteTemplate?&cbFn="+this.fnName + "&keyId=" +this.keyId +"&keyId2=" +this.keyId2,
                area:["650px","450px"],
                shade:0.3,
                end:function(){
                    debugger;
                    alert("xxxx");
                    window[_this.fnName] = null;
                    window[_this.keyId2] = null;
                }
            });
        },
        registerCallback:function(){
            var _this = this;
            this.fnName =  "travelRoute-" + (new Date()).getTime();
            window[this.fnName] = function(data){
                _this.option.cbFn &&  _this.option.cbFn(data);
                window.layui.layer.close(_this.layerIndex);
            };
        }
    };

    module.exports.init = init;
});