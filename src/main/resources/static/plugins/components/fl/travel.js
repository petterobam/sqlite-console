/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {
    var Pulldown = require("js/Pulldown"),
        RouteTheme =  require("js/RouteTheme"),
        Gjz = require("js/Gjz"),
        MultSelect = require("js/MultSelect"),
        Common = require("js/Common");

    /**
     * 旅游国家控件
     */
    var travelCountry =[],travelCountryLoad = false;
    function initTravelCountry(opts){
        if(!(travelCountry.length && travelCountryLoad)){
            $.ajax({
                type:"POST",
                url:opts.typeValue||"/cds-visa/cpsa/visa/jcsj",
                data: JSON.stringify($.extend(true,{lb:"10001"},opts.qDatas||{})),
                contentType:"application/json",
                success:function(response){
                    travelCountry = response.result;
                    travelCountryLoad = true;
                }
            });
        }
        var pullOpts = $.extend({},{
            type:1,
            title:"可输入国家名称",
            typeValue:travelCountry,
            pageSize:10,
            simpleData:{
                name:"mc",
                id:"id"
            },
            fn1:function(data){
                return "<span>"+(data.mc || "")+"</span><span class='right' >"+(data.ywmc||"")+"</span>";
            },
            filterFn:function(item, qStr){
                qStr = (qStr || "").toUpperCase();
                var name = (item.mc || "").toUpperCase(),id = item.id;
                if(qStr === name || qStr === id){
                    return 1;
                }else if(name.indexOf(qStr)>-1){
                    return name.indexOf(qStr);
                }else if(id.indexOf(qStr)>-1){
                    return id.indexOf(qStr);
                }else{
                    return -1;
                }
            }
        },opts);
        var $dom = $("#" + opts.el);
        if(!$dom.length){
            Common.nodeError($dom);
            return;
        }
        var countryPulldown = new Pulldown($dom.get(0),pullOpts);
        $dom.on("click",function(){
            if(travelCountryLoad){
                countryPulldown.opts.typeValue = travelCountry;
                countryPulldown.load(function(){
                    this.render();
                    this.show();
                });
            }else{
                countryPulldown.show();
            }
        }).on("keyup",function(e){
            //countryPulldown.$elem.val("");
            //countryPulldown.$hiddenInput.val("");
            countryPulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });



    }

    /**
     * 旅游主题线路控件
     */
    function initRouteTheme(){
        if($.fn.addRouteTheme) return;

        $.fn.addRouteTheme = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".rt");
            }
            var tempOpts = $.extend({},{
                type:2,
                typeValue:"/cds-travel/cpsa/LyJcsjCps/getLyJcsj",
                itemWidth: 75, //数据项的宽度
                ajaxType:"post",
                classW: 70,
                width:630,
                hiddenName:"txtHidden",
                qDatas:{
                    lb:"1009"
                },
                height:200
            },options);
            var routetheme = new RouteTheme(this.get(0),tempOpts);
            var isLoaded = false; //默认没有加载
            this.data("component",routetheme);

            this.on("click.rt",function(){
                if(isLoaded){
                    routetheme.show();
                }else{
                    routetheme.load(function(data){

                        var parentObj={},childObj=[],nameObj={};
                        var list=data.result;
                        for(var i=0;i<list.length;i++){
                            var item=list[i];
                            if(item.sjbh==routetheme.opts.qDatas.lb){
                                parentObj[item.bh] = [];
                                nameObj[item.bh]=item.mc;
                            }else{
                                childObj.push(item);
                            }
                        }
                        for(var j=0;j<childObj.length;j++){
                            var item = childObj[j];
                            parentObj[item.sjbh].push(item);
                        }
                        var result = [];
                        for(var key in parentObj){
                            var obj = {
                                mc: nameObj[key],
                                childs:parentObj[key]
                            }
                            result.push(obj);
                        }
                        this.data = result;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }

    }

    /**
     * 国际州控件
     */
    var gjzList = null;
    function initGjz(){
        if($.fn.addGjz) return;

        $.fn.addGjz = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".gjz");
            }

            var gjz = new Gjz(this.get(0),$.extend(true,{
                type:1,
                typeValue:""
            },options));
            var isLoaded = false;
            this.data("component",gjz);

            this.on("click.gjz",function(){
                if(isLoaded){
                    gjz.show(0);
                }else{
                    getList(function(data){
                        gjz.opts.typeValue = data;
                        gjz.load(function(){
                            this.formartData();
                            this.render();
                            this.show(0);
                            isLoaded = true;
                        });
                    })
                }

            });


        };


        function getList(callback){
            if(gjzList){
                callback(gjzList);
            }else{
                $.ajax({
                    type:"get",
                    url:"/cdsbase/api/cdsbase/bclass/getAllCountry",
                    success:function(data){
                        gjzList = data.result || [];
                        callback(gjzList);
                    }
                });
            }
        }


    }

    /**
     * 旅游出发地城市控件
     */
    function initTravelCfdCity(){
        if($.fn.addTravelCfdCity) return;

        $.fn.addTravelCfdCity = function(options){

        }

    }

    /**
     * 旅游出发地城市控件
     */
    function initTravelMddCity(){
        if($.fn.addTravelMddCity) return;

        $.fn.initTravelMddCity = function(options){

        }

    }

    /**
     * 景区名称控件
     */
    function initScenicAreaName(){
        if($.fn.scenicAreaName) return ;
        $.fn.scenicAreaName = function(options){
            if(!this.length) Common.nodeError(this);
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".scenicAreaName");
            }
            var opts = {
                title:"可输入景区名称",
                dataType:"dynamic",
                width:220,
                typeValue:"/cds-mp/cpsa/mp/sceneryQuerySceneryList",
                simpleData:{
                    id:"jqid",
                    name:"jqmc"
                },
                formatPostData:function(data){
                    var param ={
                        current:data.current,
                        size:data.size,
                        isAsc:true,
                        orderByField:""
                    };
                    param.data = data;
                    return JSON.stringify(param);
                },
                ajaxOpts:{
                    type:"post",
                    contentType: "application/json"
                },
                fn1:function(item){
                    return  "<span title='"+item.jqmc+"' class='left' style='width:100%;'>"+(item.jqmc||"")+"</span>";
                },
                qDatas:{
                    jqmc:""
                },
                cbFn: $.noop
            };
            var _this = this;
            var scenicPulldown = new Pulldown(this.get(0),$.extend(true,{},opts,options));
            this.data("component",scenicPulldown);
            this.on("keyup.scenicAreaName",function(e){
                scenicPulldown.opts.qDatas.jqmc = $(_this).val();
                scenicPulldown.elemKeyUpHandler(e,function(){
                    this.render();
                    this.show();
                });
            }).on("click.scenicAreaName",function(){
                scenicPulldown.opts.qDatas.jqmc = $(_this).val();
                scenicPulldown.load(function(){
                    this.render();
                    this.show();
                });
            });
        };
    }

    /**
     * 景区主题控件
     */
    function initScenicTheme(){
        if($.fn.addScenicTheme) return;
        $.fn.addScenicTheme = function(options){
            if(!this.length) Common.nodeError(this);
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".scenicTheme");
            }
            var tempOpts = $.extend(true,{
                type:2,
                typeValue:"/cds-visa/cpsa/visa/jcsj",
                usetype:"mult",
                hasAllChecked:false,
                hiddenName:"txtHidden",
                simpleData:{
                    id:"id",
                    name:"mc"
                },
                qDatas:{
                    lb:"810510",
                    parid:"810510"
                },
                height:200,
                ajaxOpts:{
                    type:"POST",
                    contentType:"application/json"
                },
                formatPostData:function(data){
                    return JSON.stringify(data);
                }
            },options);
            var scenicTheme = new MultSelect(this.get(0),tempOpts);
            var isLoaded = false;
            this.data("component",scenicTheme);
            this.on("click.scenicTheme",function(){
                if(isLoaded){
                    scenicTheme.show();
                }else{
                    scenicTheme.load(function(data){
                        this.data = data.result||data;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }
    }




    exports.initTravelCountry = initTravelCountry;

    exports.initRouteTheme = initRouteTheme;

    exports.initGjz = initGjz;

    exports.initTravelCfdCity = initTravelCfdCity;

    exports.initTravelMddCity = initTravelMddCity;

    exports.initScenicAreaName = initScenicAreaName;

    exports.initScenicAreaName = initScenicAreaName;

    exports.initScenicTheme = initScenicTheme;

});
