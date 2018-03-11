/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {

    var Pulldown = require("js/Pulldown"),
        HotelHotCircle = require("js/HotelHotCircle"),
        VetechTab = require("js/VetechTab"),
        SelectPeople =  require("js/SelectPeople"),
        Common = require("js/Common");

    /**
     * 酒店热门商圈
     */
    function initJdrmsq(){
        if($.fn.showXzqSqAddress) return ;
        $.fn.showXzqSqAddress = function(options){
            if(!this.length) Common.nodeError(this);
            if(this.data("componentPOI")){
                this.data("componentPOI").destroy();
                this.off(".POI");
            }
            if(this.data("hotelHotCircle")){
                this.data("hotelHotCircle").destroy();
            }
            var _this = this;
            var opts = $.extend(true,{
                type:2,
                pageSize:10,
                "_hasPage_":false,
                dataType:"dynamic",
                simpleData:{
                    id:"nm",
                    name:"nm"
                },
                height:500,
                width:300,
                typeValue:"/cdspoi/poi/getPoiEvent",
                fn1:function(data){
                    return "<p><span>"+data.nm+"</span><span class='right'>"+(data.citymc + "," + data.szqmc)+"</span></p><p style='color:#9B9B9B;'>"+data.addr+"</p>";
                }
            },options);
            var hotelCrtl = new HotelHotCircle(this.get(0),options);
            var pullDown  = new Pulldown(this.get(0),opts);
            this.data("componentPOI",pullDown);
            this.on("click",function(ev){
                pullDown.hide();
                hotelCrtl.load(function(data){
                    var ret = data.result;
                    ret.xjsList = ret.xjsList||[];
                    this.data = ret;
                    this.render();
                    this.show();
                });
            });

            this.on("keydown.POI",function(ev){
                hotelCrtl.hide();
                pullDown.opts.qDatas.cityid = $("#"+options.csbh).val();
                pullDown.elemKeyUpHandler(ev,function(){
                    this.render();
                    this.show();
                });
            });
        }
    }


    /**
     * 酒店选择人数控件
     */
    function initSelectPeople(){
        if($.fn.addSelectPeople) return;

        $.fn.addSelectPeople = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".sp");
            }
            var selectpeople = new SelectPeople(this.get(0),options);
            var isLoaded = false; //默认没有加载
            this.data("component",selectpeople);

            this.on("click.sp",function(){
                selectpeople.show();
            });
        }

    }

    /**
     * 酒店品牌控件
     */
    var jdppList  = null;
    function initJdpp(){
        if($.fn.addJdpp) return;

        $.fn.addJdpp = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".jdpp");
            }

            var opts = $.extend(true,{
                dataType:"static",
                type:1,
                typeValue:"",
                simpleData:{
                    id:"id",
                    name:"mc"
                },
                fn1:function(data){
                    return "<span style='width:30%'>"+data.ywmc+"</span><span style='width:70%;' class='right' >"+data.mc+"("+data.id+")</span>";
                },
                filterFn:function(data,keyWords){
                    keyWords = ($.trim(keyWords) || "").toUpperCase(),
                        id = (data.id || "").toUpperCase(),
                        mc  = (data.mc || "").toUpperCase(),
                        ywmc = (data.ywmc || "").toUpperCase();
                    if(id === keyWords){
                        return 1;
                    }else if(mc === keyWords){
                        return 1;
                    }else if(ywmc === keyWords){
                        return 1;
                    } else if(id.indexOf(keyWords) !== -1){
                        return id.indexOf(keyWords);
                    }else if(mc.indexOf(keyWords) !== -1){
                        return mc.indexOf(keyWords);
                    }else if(ywmc.indexOf(keyWords) !== -1){
                        return ywmc.indexOf(keyWords);
                    }else{
                        return -1;
                    }
                }
            },options);

            var pulldown = new Pulldown(this.get(0),opts),
                isLoaded = false;

            var _this = this;
            $(this).on("click.jdpp",function(){
                if(isLoaded){
                    pulldown.show();
                }else{
                    getPPList(function(data){
                        pulldown.opts.typeValue = data;
                        pulldown.load(function(){
                            this.render();
                            this.show();
                            isLoaded = true;
                            $(_this).data("component",pulldown);
                        });
                    });

                }
            }).on("keyup",function (e) {
                pulldown.elemKeyUpHandler(e,function(data){
                    this.render();
                    this.show();
                });
            });
        };

        /**
         * 获取酒店品牌数据
         * @param callback
         */
        function getPPList(callback){
            if(jdppList){
                callback(jdppList);
            }else{
                $.ajax({
                    type:"get",
                    url:"/cds-hotel-es/kj/cds/hotel/getHotelPp",
                    success:function(data){
                        jdppList = data.result;
                        callback(data.result);
                    }
                });
            }


        }
    }

    /**
     * 国际酒店城市控件
     */
    function initHotelGjCity(){
        /*if($.fn.addHotelGjCity) return;

        //tab的默认配置参数
        var tabOpts = {
            type:2,
            //typeValue:"/cdsbase/kj/cds/citytrain/zdlist",
            itemWidth:70,
            rightWidth:400,
            simpleData:{
                /!*id:"zddm",
                 name:"zdmc"*!/
            }
        };

        //下拉搜索的默认配置参数
        var pulldownOpts = {
            dataType:"dynamic",
            type:2,
            //typeValue:"/cdsbase/kj/cds/citytrain/searchlist",
            simpleData:{
                /!* id:"zddm",
                 name:"zdmc"*!/
            },
            pageSize:10,
            height:350,
            _hasPage_:false,
            fn1:function(data){
                //return "<p><span>"+data.zdmc+"("+data.zddm+")</span><span class='right' >火车站</span></p>";
            }
        };

        /!**
         * //封装的函数入口
         * @param opts1 tab的配置参数
         * @param opts2 pulldown的配置参数
         *!/
        $.fn.addHotelGjCity = function(opts1,opts2){
            var tab  =$(this).data("tabComponent"),
                pulldown = $(this).data("pulldownComponent");

            if(tab && pulldown){
                tab.destroy();
                pulldown.destroy();
                $(this).off("hotelgjcity");
            }

            if(!this.length) Common.nodeError(this);

            //标记tab和下拉控件是否已经初始化
            var tabIsLoaded = false,pulldownIsLoaded = false;

            $(this).on("click.hotelgjcity",function(){
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
            }).on("keyup.hotelgjcity",function(ev){
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
*/
    }


    exports.initJdrmsq = initJdrmsq;

    exports.initSelectPeople = initSelectPeople;

    exports.initJdpp = initJdpp;

    exports.initHotelGjCity = initHotelGjCity;

});
