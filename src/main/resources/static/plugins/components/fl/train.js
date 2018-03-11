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
        VetechTab = require("js/VetechTab"),
        Common = require("js/Common");

    /**
     * 热门火车站控件
     */
    function initHotStation(){
        if($.fn.addHotStation) return;


        //tab的默认配置参数
        var tabOpts = {
            type:2,
            typeValue:"/cdsbase/kj/cds/citytrain/zdlist",
            itemWidth:70,
            rightWidth:400,
            simpleData:{
                id:"zddm",
                name:"zdmc"
            }
        };

        //下拉搜索的默认配置参数
        var pulldownOpts = {
            dataType:"dynamic",
            type:2,
            typeValue:"/cdsbase/kj/cds/citytrain/searchlist",
            simpleData:{
                id:"zddm",
                name:"zdmc"
            },
            pageSize:10,
            height:350,
            _hasPage_:false,
            fn1:function(data){
                return "<p><span>"+data.zdmc+"("+data.zddm+")</span><span class='right' >火车站</span></p>";
            }
        };

        /**
         * //封装的函数入口
         * @param opts1 tab的配置参数
         * @param opts2 pulldown的配置参数
         */
        $.fn.addHotStation = function(opts1,opts2){
            var tab  =$(this).data("tabComponent"),
                pulldown = $(this).data("pulldownComponent");

            if(tab && pulldown){
                tab.destroy();
                pulldown.destroy();
                $(this).off(".hotStation");
            }

            if(!this.length) Common.nodeError(this);

            //标记tab和下拉控件是否已经初始化
            var tabIsLoaded = false,pulldownIsLoaded = false;

            $(this).on("click.hotStation",function(){
                if(tabIsLoaded){
                    tab.show();
                }else{
                    tab = new VetechTab(this,$.extend(true,{},tabOpts,opts1));
                    tab.load(function(data){
                        this.data = data.result;
                        this.init(function(){
                            this.show();
                        });
                    });
                    $(this).data("tabComponent",tab);
                }
                tabIsLoaded = true;
                pulldown && pulldown.hide();
            }).on("keyup.hotStation",function(ev){
                if(!pulldownIsLoaded){
                    pulldown = new Pulldown(this,$.extend(true,{},pulldownOpts,opts2));
                    $(this).data("pulldownComponent",pulldown);
                    pulldownIsLoaded = true;
                }
                if(!this.value){
                    tab && tab.show();
                    pulldown && pulldown.hide();
                }else{
                    tab.hide();
                    pulldown.elemKeyUpHandler(ev,function(ev){
                        this.render();
                        this.show();
                    });
                }

            });
        }

    }

    /**
     * 火车站供应商(支持单选和多选，但是不支持检索)
     */
    function initYgs4Train(){
        if($.fn.addYgs4Train) return;

        $.fn.addYgs4Train = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".gys4Train");
            }
            var tempOpts = $.extend(true,{
                usetype:"mult",
                type:2,
                typeValue:"/train/train/kj/cpsa/gysPullDown",
                simpleData:{
                    "id":"gybh",
                    "name":"gyjc"
                },
                hasAllChecked:true,
                hiddenName:"txtHidden",
                height:200
            },options);
            var gys = new MultSelect(this.get(0),tempOpts);
            var isLoaded = false; //默认没有加载
            this.data("component",gys);

            this.on("click.gys4Train",function(){
                if(isLoaded){
                    gys.show();
                }else{
                    gys.load(function(data){
                        this.data = data.result.records;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }

    }

    /**
     * 火车站控件
     */
    function initTrainStation(){
        if($.fn.addTrainStation) return;

        $.fn.addTrainStation = function(options){
            if(!this.length) Common.nodeError(this);

            //清除重复绑定
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".trainStation");
            }

            var defaultOpts = {
                dataType:"dynamic",
                type:2,
                typeValue:"/cdsbase/kj/cds/citytrain/searchlist",
                simpleData:{
                    id:"zddm",
                    name:"zdmc"
                },
                pageSize:10,
                height:350,
                fn1:function(data){
                    return "<p><span>"+data.zdmc+"("+data.zddm+")</span><span class='right' >"+(data.csmc || "")+"</span></p>";
                }
            };
            var isLoaded = false,
                that = this,
                pulldown =null;

            this.on("click.trainStation",function(){
                if(!isLoaded){
                    pulldown = new Pulldown(this,$.extend(true,{},defaultOpts,options));
                    pulldown.load(function(){
                        this.render();
                        this.show();
                        that.data("component",pulldown);
                        isLoaded = true;
                    });

                }else{
                    pulldown.show();
                }
            }).on("keyup.trainStation",function(ev){
                pulldown.elemKeyUpHandler(ev,function(){
                    this.render();
                    this.show();
                });
            });

        }

    }

    exports.initHotStation = initHotStation;

    exports.initYgs4Train = initYgs4Train;

    exports.initTrainStation = initTrainStation;
});
