/**
 * Created by sing on 2017/11/14.
 *  包车、租车、用车产品多选控件
 */
define(function(require,exports,module){
    function init(){
        if($.fn.productChoose) return ;
        $.fn.productChoose = function(options){
            options = $.extend(true,{
                hiddenName:'',
                useType:1,//1包车，2租车，3用车
            },options);
            var dlg = new ProductChooseProvider(options);
            this.on('click.travel',function(e){
                dlg.show();
            });
        };
    }

    /**
     * 产品选择控件类
     * @param options
     * @constructor
     */
    function ProductChooseProvider(options){
        this.option = options ||{};
        this.fnName = null;
        this.layIndex = null;
    }

    ProductChooseProvider.prototype = {
        show:function(){
            var _this = this,
                hiddenTxt = this.option.hiddenName,
                use = this.option.useType,
                cpids = $("#"+hiddenTxt).val()||"";
            this.registerCallback();
            this.layerIndex = window.layui.layer.open({
                type:2,
                title:"产品选择",
                content:"/component/productsChooseTemplate?cpids="+cpids+"&cbFn="+this.fnName+"&useType="+use,
                area:["600px","450px"],
                shade:0.3,
                end:function(){
                    window[_this.fnName] = null;
                }
            });
        },
        registerCallback:function(){
            var _this = this,hiddenTxt = this.option.hiddenName,cpxx;
            this.fnName =  "travelRoute-" + (new Date()).getTime();
            window[this.fnName] = function(data){
                cpxx = _this.filterResults(data);
                $("#"+hiddenTxt).val(cpxx.cpid.join(","));
                _this.option.cbFn &&  _this.option.cbFn(data,cpxx);
                window.layui.layer.close(_this.layerIndex);
            };
        },
        filterResults:function(data){
            var cpObj = {
                cpid:[],
                cpmc:[]
            },useType = this.option.useType;
            $.each(data,function(i,n){
                if(useType == "1"){
                    cpObj.cpid.push(n.cpid);
                    cpObj.cpmc.push(n.cpmc);
                }else if(useType == "2"){
                }else if(useType == "3"){
                    cpObj.cpid.push(n.id);
                    cpObj.cpmc.push(n.cpmc);
                }
            });
            return cpObj;
        }
    };

    module.exports.init = init;
});
