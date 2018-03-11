/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {

    var Pulldown = require("js/Pulldown"),
        MultSelect = require("js/MultSelect.js"),
        Common = require("js/Common");

    /**
     * 商户组多选控件
     */
    function initShzList(){
        if($.fn.addShzList) return;

        $.fn.addShzList = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".shzList");
            }
            var tempOpts = $.extend(true,{
                type:2,
                typeValue:"/usecar/cpsa/customergroup/shzlist",
                usetype:"mult",
                hasAllChecked:true,
                hiddenName:"txtHidden",
                simpleData:{
                    id:"id",
                    name:"fzmc"
                },
                height:200
            },options);
            var shList = new MultSelect(this.get(0),tempOpts);
            var isLoaded = false; //默认没有加载
            this.data("component",shList);

            this.on("click.shzList",function(){
                if(isLoaded){
                    shList.show();
                }else{
                    shList.load(function(data){
                        this.data = data.result;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }

    }

    /**
     * 机服商户组多选控件
     */
    function initJfShGroup(){
        if($.fn.addJfShGroup) return;

        $.fn.addJfShGroup = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".jfshgroup");
            }
            var tempOpts = $.extend({},{
                type:2,
                typeValue:"/airservice/cpsa/customergroup/shzlist",
                usetype:"mult",
                hasAllChecked:true,
                hiddenName:"txtHidden",
                simpleData:{
                    id:"id",
                    name:"fzmc"
                },
                height:200
            },options);
            var jfshgroup = new MultSelect(this.get(0),tempOpts);
            var isLoaded = false; //默认没有加载
            this.data("component",jfshgroup);

            this.on("click.jfshgroup",function(){
                if(isLoaded){
                    jfshgroup.show();
                }else{
                    jfshgroup.load(function(data){
                        this.data = data.result;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }

    }


    exports.initShzList = initShzList;

    exports.initJfShGroup = initJfShGroup;
});
