/**
 * Created by sing on 2017/12/25.
 * @描述:旅游目的地树形选择控件
 */
define(function(require,exports,module){
    /**
     * 旅游目的地控件初始化入口
     */
    function init(){
        if($.fn.travelDestination) return ;
        $.fn.travelDestination = function(options){
            options = $.extend(true,{
                choosedList:[],
                width:650,
                height:450
            },options);
            var dlg = new TravelDestinationProvider(options);
            dlg.render();
        };
    }

    /**
     * 旅游目的地控件类
     * @param options
     * @constructor
     */
    function TravelDestinationProvider(options){
        this.option = options ||{};
        this.fnName = null;
        this.layerIndex = null;
    }

    TravelDestinationProvider.prototype = {
        render:function(){
            var _this = this;
            this.registerCallback();
            this.choosedFn = "travelDestination-" + String(Math.random()).replace(/\D/g,"");
            var choosedList = this.option.choosedList;
            window[this.choosedFn] = function(){
                return choosedList;
            };
            this.layerIndex = window.layui.layer.open({
                type:2,
                title:"选择旅游目的地",
                content:"/component/travelDestinationTpl?&cbFn="+this.fnName + "&choosedFn=" +this.choosedFn,
                area:["650px","450px"],
                shade:0.3,
                end:function(){
                    window[_this.fnName] = null;
                    window[_this.choosedFn] = null;
                }
            });
        },
        registerCallback:function(){
            var _this = this;
            this.fnName =  "travelDestination-" + String(Math.random()).replace(/\D/g,"");
            window[this.fnName] = function(data){
                _this.option.cbFn &&  _this.option.cbFn(data);
                window.layui.layer.close(_this.layerIndex);
            };
        }
    };
    module.exports.init = init;

});
