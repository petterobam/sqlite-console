/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {
    var Pulldown = require("js/Pulldown"),
        Common = require("js/Common"),
        MultSelect = require("js/MultSelect.js"),
        MultSelectAndSearch = require("js/MultSelectAndSearch"),
        VetechSlider = require("js/VetechSlider"),
        InputNumber = require("js/InputNumber"),
        $ = window.jQuery;
    require("js/treeSelectExtra").init();
    require("ztree");

    var provinceData = []; //省份数据
    /**
     * 初始化省市控件
     * @param options
     */
    function initProvinceAndCity(opts1,opts2){
        if(!(provinceData.length && isLoaded)){
            $.ajax({
                type:"get",
                url:opts1.typeValue,
                data:$.extend(true,{sf:1},opts1.qDatas),
                success:function(data){
                    provinceData = data.result.records;
                    isLoaded = true;
                }
            });
        }
        //省份配置参数
        var pOpts = $.extend(true,{
            type:1,
            typeValue:provinceData,
            pageSize:15,
            fn1:function(data){
                return "<span>"+(data.qp || "").toUpperCase()+"</span><span class='right' >"+data.name+"</span>";
            },
            filterFn:provinceFilterFn
        },opts1);

        //城市配置参数
        var cOpts = $.extend({
            qDatas:{
                szsf:""
            },
            pageSize:15,
            fn1:function(data){
                return "<span>"+(data.qp || "").toUpperCase()+"</span><span class='right'>"+data.name+"</span>";
            },
            "dataType":"dynamic"
        },opts2);

        var $pElem = $("#" + opts1.el),
            $cElem = $("#" + opts2.el);
        if(!$pElem.length){
            Common.nodeError($pElem);
            return;
        }
        if(!$cElem.length){
            Common.nodeError($cElem);
            return;
        }

        var provincePulldown = new Pulldown($pElem.get(0),pOpts);
        var cityPulldown = new Pulldown($cElem.get(0),cOpts);

        //省份
        $pElem.on("click",function(){
            if(isLoaded){
                provincePulldown.opts.typeValue = provinceData;
                provincePulldown.load(function(){
                    this.render();
                    this.show();
                });
            }else{
                provincePulldown.show();
            }
        }).on("keyup",function(e){
            cityPulldown.$elem.val("");
            cityPulldown.$hiddenInput.val("");
            provincePulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });

        //城市
        $cElem.on("click",function(){
            cityPulldown.currentPage = 1;
            cityPulldown.triggerType = "click";
            cityPulldown.opts.qDatas.szsf = provincePulldown.$hiddenInput.val() || "";
            cityPulldown.load(function(){
                this.render();
                this.show();
            });
        }).on("keyup",function(e){
            cityPulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });
    }

    /**
     * 省份过滤函数
     * @param item
     * @param qStr
     * @returns {*}
     */
    function provinceFilterFn(item, qStr) {
        qStr = (qStr || "").toUpperCase();
        var name = (item.name || "").toUpperCase(),
            id = item.id,
            jp = (item.pyjsm || "").toUpperCase(),
            qp = (item.qp || "").toUpperCase();

        if (id === qStr || name === qStr || jp === qStr || qp === qStr) {
            return 1;
        } else if (id.indexOf(qStr) > -1) {
            return id.indexOf(qStr);
        } else if (name.indexOf(qStr) > -1) {
            return name.indexOf(qStr);
        } else if (jp.indexOf(qStr) > -1) {
            return jp.indexOf(qStr);
        } else if (qp.indexOf(qStr) > -1) {
            return qp.indexOf(qStr);
        } else {
            return -1;
        }
    }

    /**
     * 初始化城市控件
     */
    function initVecity(){
        if($.fn.veCity) return;

        $.fn.veCity = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".pulldown");
            }

            var opts = $.extend(true,{
                dataType:"dynamic",
                type:2,
                typeValue:"/cdsbase/kj/cds/sfcs/get",
                pageSize:15,
                fn1:function(data){
                    return "<p><span>"+(data.qp || "").toUpperCase()+"</span><span class='right' >"+data.name+"</span></p>";
                }
            },options);

            var cityPulldown = new Pulldown(this.get(0),opts);
            this.on("click.pulldown",function(){
                cityPulldown.load(function(){
                    this.render();
                    this.show();
                });
            }).on("keyup.pulldown",function(ev){
                cityPulldown.elemKeyUpHandler(ev,function(){
                    this.render();
                    this.show();
                })
            });
            this.data("component",cityPulldown);
        };
    }

    /**
     * 悬浮层
     */
    function initPopup(){
        if($.fn.addPopup) return;
        var Popup = require("js/Popup");

        $.fn.addPopup = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("popupComponent")){
                this.data("popupComponent").destroy();
            }

            var opts = $.extend(true,{
                width:200,
                height:100,
                "arraw_down":"/static/plugins/components/img/down.png",
                "arraw_up":"/static/plugins/components/img/up.png",
                position:"down",
                createOnce:true,
                defer:0,
                triggerType:"mousemove",
                beforeDestroy:function(){
                    popup = null;
                  return true;
                },
                getContent:function(){return ""}
            },options),
                popup,
                eventName = "click";

            if(opts.triggerType === "mousemove"){
                eventName = "mouseenter";
            }
            this.on(eventName,function(){
                if(!popup){
                    popup = new Popup(this,opts);
                    $(this).data("popupComponent",popup);
                    popup.addContent(opts.getContent());
                }
                popup.show();
            });
        }
    }

    /**
     * 省份多选控件
     */
    function initProvinceMult(){
        if($.fn.addProvinceMult) return;

        $.fn.addProvinceMult = function(options){
            if(!this.length) Common.nodeError(this);
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
                this.off(".provinceMult");
            }
            var tempOpts = $.extend(true,{
                usetype:"mult",
                hasAllChecked:true,
                hiddenName:"txtHidden",
                type:2,
                typeValue:"/cdsbase/kj/cds/sfcs/get",
                qDatas:{
                    sf:1
                },
                height:200
            },options);
            var pv = new MultSelect(this.get(0),tempOpts);
            var isLoaded = false; //默认没有加载
            this.data("component",pv);

            this.on("click.provinceMult",function(){
                if(isLoaded){
                    pv.show();
                }else{
                    pv.load(function(data){
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
     * 初始化poi控件
     */
    function initPOI(){
        if($.fn.addPOI) return;

        $.fn.addPOI = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("componentPOI")){
                this.data("componentPOI").destroy();
                this.off(".POI");
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
                    return "<p><span>"+markKeyword(data.nm,_this.val())+"</span><span class='right'>"+(data.citymc + "," + data.szqmc)+"</span></p><p style='color:#9B9B9B;'>"+data.addr+"</p>";
                }
            },options);

            var poiPulldown = new Pulldown(this.get(0),opts);
            this.data("componentPOI",poiPulldown);

            //城市id
            var $city = $("#" + opts.qDatas.cityid);
            this.on("keyup.POI",function(ev){
                poiPulldown.opts.qDatas.cityid =$city.val() || "";
                poiPulldown.elemKeyUpHandler(ev,function(){
                    this.render();
                    this.show();
                })
            });
        }

    }

    /**
     * 标记关键字
     * @param name
     * @param keyWord
     */
    function markKeyword(name,keyWord){
        var raRegExp = new RegExp(keyWord,"g");
        return name.replace(raRegExp,"<i style='color:red;font-style: normal;'>"+keyWord+"</i>");
    }


    /**
     * 经营范围控件
     */
    function initBusinessScope(){
        require("ztree");
        var TreeSelect = require("js/TreeSelect.js");
        if($.fn.businessScope) return;
        $.fn.businessScope = function(options){
            options = $.extend(true,{
                url:"/base/cpsa/cpsclass/selectByLb",
                type:"checkbox",
                cbFn: $.noop,
                filterParent:true,
                settings:{
                    data:{
                        key:{
                            name:"mc"
                        },
                        simpleData:{
                            enable:true,
                            idKey:"id",
                            pIdKey:"parid",
                            rootPId:"none"
                        }
                    }
                }
            },options);
            if(this.data("componentTreeSelect")){
                this.data("componentTreeSelect").destroy();
                this.off(".ztree");
            }
            var tree = new TreeSelect(this.get(0),options),hasLoad = false;
            this.data("componentTreeSelect",tree);
            this.on("click.tree",function(e){
                if(hasLoad){
                    tree.show();
                }else{
                    tree.load(function(data){
                        hasLoad = true;
                        this.data = data.result;
                        this.writeValue();
                        this.render();
                        this.show();
                    });
                }
            });
        };
    }

    /**
     * 供应产品多选控件
     */
    function initSupplyProducts(){
        require("ztree");
        var TreeSelect = require("js/TreeSelect.js");
        if($.fn.supplyProducts) return;
        $.fn.supplyProducts = function(options){
            options = $.extend(true,{
                url:"/base/cpsa/vecpfl/selectCpflListByParbh?parbh=none",
                type:"checkbox",
                cbFn: $.noop,
                settings:{
                    data:{
                        key:{
                            name:"cpmc"
                        },
                        simpleData:{
                            enable:true,
                            idKey:"cpbh",
                            pIdKey:"",
                            rootPId:null
                        }
                    },
                    view:{
                        showIcon:false,
                        showLine:false
                    }
                }
            },options);
            if(this.data("componentTreeSelect")){
                this.data("componentTreeSelect").destroy();
                this.off(".ztree");
            }
            var tree = new TreeSelect(this.get(0),options),hasLoad = false;
            this.data("componentTreeSelect",tree);
            this.on("click.tree",function(e){
                if(hasLoad){
                    tree.show();
                }else{
                    tree.load(function(data){
                        hasLoad = true;
                        this.data = data.result;
                        this.render();
                        this.writeValue();
                        this.show();
                    });
                }
            });
        };

    }

    /**
     * 总公司控件
     */
    function initHeadquarters(){
        if($.fn.headquarters) return;
        $.fn.headquarters = function(options){
            options = $.extend(true,{
                title:"可输入公司全拼/首字母/汉字/编号",
                typeValue:"",
                dataType:"dynamic",
                simpleData:{
                    name:"",
                    id:""
                },
                fn1:function(item){
                    return "";
                },
                cbFn: $.noop
            },options);
            if(this.data("headquarters")){
                this.data("headquarters").destroy();
                this.off(".headquarters");
            }
            var pulldown = new Pulldown(this.get(0),options),_this = this;
            this.on("keyup.headquarters",function(e){
                //pulldown.opts.qDatas.xm = $(_this).val();
                pulldown.elemKeyUpHandler(e,function(){
                    this.render();
                    this.show();
                });
            }).on("click.headquarters",function(e){
                // pulldown.opts.qDatas.xm = $(_this).val();
                pulldown.load(function(){
                    this.render();
                    this.show();
                });
            });
        };
    }

    /**
     * 文件上传控件
     */
    function initFileUpload(){
        if($.fn.upload) return;
        $.fn.upload = function(options){
            var opts = $.extend(true,{
                filecallbak: $.noop,
                width:600,
                height:300,
                size:3072000,
                appName:"", //应用名称
                pt:"cpsa", //平台（cpsb）
                uploadType:"single",
                type:"all"
            },options);
            function openUploadLayer(_this){
                var fnName = "_uploadFn" + (new Date()).getTime();
                var layerIndex = window.layui.layer.open({
                    title:"文件上传",
                    type: 2,
                    area: [opts.width+'px', opts.height+'px'],
                    content: "/component/uploadFile?size="+opts.size+"&type="+opts.type+"&uploadType="+opts.uploadType+"&fnName="+fnName+"&pt="+opts.pt +"&appName="+opts.appName,
                    end:function(){
                        window[fnName] = null;
                    }
                });
                window[fnName] = function(data){
                    opts.filecallbak.call(_this,data);
                    window.layui.layer.close(layerIndex);
                };
            }
            if(opts.bindEvent!=="false"){
                this.on("click",function(){
                    openUploadLayer(this);
                });
            }else{
                openUploadLayer(this);
            }
        };
    }


    /**
     * 初始化城市和行政区控件
     */
    function initCityAndXzq(){
        if($.fn.cityAndXzq) return;

        $.fn.cityAndXzq = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("componentCAX")){
                this.data("componentCAX").destroy();
                this.off(".cityAndXzq");
            }

            var tempObj = $.extend(true,{
                height:200,
                type:2,
                typeValue:"/cdsbase/veCityArea/selectXzqPageByCsid",
                qDatas:{}
            },options);
            this.on("click.cityAndXzq",function(){
                var cityId = $("#" + tempObj.cityId).val(); //获取城市id
                tempObj.qDatas.csid = cityId;
                var xzqObj = new MultSelect(this,tempObj);

                $(this).data("componentCAX",xzqObj);

                xzqObj.load(function(data){
                    //TODO:这里data返回有问题，需要再次确认
                    this.data = data.result ? data.result.records :[];
                    this.render();
                    this.show();
                });
            });
        };

    }

    /**
     * 商户等级
     */
    function initShdj(options){

        if($.fn.showShdj) return;

        $.fn.showShdj = function(options){
            var tempObj =$.extend(true,{
                url:"/base/rest/kj/cpsClassShdj/getShdjSj",
                height:200,
                qDatas:{
                    lb:options.lb ||"1011"
                },
                settings:{
                    data:{
                        simpleData:{
                            pIdKey: "pid"
                        }
                    }
                },
                type:"radio",
                hiddenName:"txt1Hidden"
            },options) ;
            $(this).showTreeSelect(tempObj);
        };
    }


    /**
     * 初始化省市区联动控件
     * @param opts1 省份配置参数
     * @param opts2 城市配置参数
     * @param opts3 区县配置参数
     */
    function initProCityVisa(opts1,opts2,opts3){
        var proloaded =true;
        if(!(provinceData.length && proloaded)){
            $.ajax({
                type:"get",
                url:opts1.typeValue,
                data:$.extend({},{sf:1},opts1.qDatas),
                success:function(data){
                    provinceData = data.result.records;
                    proloaded = false;
                }
            });
        }
        //省份配置参数
        var pOpts = $.extend({},{
            type:1,
            typeValue:provinceData,
            pageSize:15,
            fn1:function(data){
                return "<span>"+(data.qp || "").toUpperCase()+"</span><span class='right' >"+data.name+"</span>";
            },
            filterFn:provinceFilterFn
        },opts1);

        //城市配置参数
        var cOpts = $.extend({},{
            type:2,
            typeValue:"/cdsbase/kj/cds/sfcs/get",
            qDatas:{
                szsf:""
            },
            pageSize:15,
            fn1:function(data){
                return "<span>"+data.qp+"</span><span class='right'>"+data.name+"</span>";
            },
            "dataType":"dynamic"
        },opts2);

        //区县配置参数
        var qOpts = $.extend({},{
            type:2,
            typeValue:"/cdsbase/veCityArea/selectXzqPageByCsid",
            qDatas:{
                csid:""
            },
            pageSize:15,
            fn1:function(data){
                return "<span>"+data.name+"</span><span class='right'>"+data.id+"</span>";
            },
            "dataType":"dynamic"
        },opts3);

        var $pElem = $("#" + opts1.el),
            $cElem = $("#" + opts2.el),
            $qElem = $("#" + opts3.el);
        if(!$pElem.length){
            Common.nodeError($pElem);
            return;
        }
        if(!$cElem.length){
            Common.nodeError($cElem);
            return;
        }
        if(!$qElem.length){
            Common.nodeError($qElem);
            return;
        }

        var provincePulldown = new Pulldown($pElem.get(0),pOpts);
        var cityPulldown = new Pulldown($cElem.get(0),cOpts);
        var visaPulldown = new Pulldown($qElem.get(0),qOpts);

        //省份
        $pElem.on("click",function(){
            if(!proloaded){
                provincePulldown.opts.typeValue = provinceData;
                provincePulldown.load(function(){
                    this.render();
                    this.show();
                });
            }else{
                provincePulldown.show();
            }
        }).on("keyup",function(e){
            cityPulldown.$elem.val("");
            cityPulldown.$hiddenInput.val("");
            visaPulldown.$elem.val("");
            visaPulldown.$hiddenInput.val("");
            provincePulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });

        //城市
        $cElem.on("click",function(){
            if(provincePulldown.$hiddenInput.val()){
                cityPulldown.triggerType = "click";
                cityPulldown.currentPage = 1;
                cityPulldown.opts.qDatas.szsf = provincePulldown.$hiddenInput.val();
                cityPulldown.load(function(){
                    this.render();
                    this.show();
                });
            }else{
                window.layui.layer.msg("请先选择省！");
                $pElem.focus();
            }
        }).on("keyup",function(e){
            visaPulldown.$elem.val("");
            visaPulldown.$hiddenInput.val("");
            cityPulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });
        //区县
        $qElem.on("click",function(){
            if(cityPulldown.$hiddenInput.val()) {
                visaPulldown.currentPage = 1;
                visaPulldown.triggerType = "click";
                visaPulldown.opts.qDatas.csid = cityPulldown.$hiddenInput.val();
                visaPulldown.load(function () {
                    this.render();
                    this.show();
                });
            }else{
                window.layui.layer.msg("请先选择市！");
                $cElem.focus();
            }
        }).on("keyup",function(e){
            visaPulldown.elemKeyUpHandler(e,function(data){
                this.render();
                this.show();
            });
        });
    }


    /**
     * 业务部门
     */
    function initDept(){
        if($.fn.dept) return;

        $.fn.dept = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("deptComponent")){
                this.data("deptComponent").destroy();
                this.off(".dept");
            }
            var opts = {
                title:"可输入部门全拼/拼音首字母/汉字/编号",
                dataType:"dynamic",
                width:220,
                cascade:false,
                cascadeOpts:{
                    inputId:"",
                    hiddenId:""
                },
                typeValue:"/base/rest/kj/vedept/getVeDept",
                simpleData:{
                    id:"bh",
                    name:"mc"
                },
                fn1:function(item){
                    return  "<span title='"+item.mc+"' class='right' style='width:100%;'>"+(item.mc)+"("+item.bh+")</span>";
                },
                cbFn: $.noop
            };

            //如果有级联，在选择部门以后，要清理用户的输入框和隐藏域
            if(options && options.cascade){
                var cbFn = options.cbFn;
                options.cbFn = function(data){
                    $("#" + options.cascadeOpts.inputId).val("");
                    $("#" + options.cascadeOpts.hiddenId).val("");
                    cbFn(data);
                }
            }

            var deptPulldown = new Pulldown(this.get(0),$.extend(true,{},opts,options));
            this.data("deptComponent",deptPulldown);

            this.on("keyup.dept",function(e){
                deptPulldown.elemKeyUpHandler(e,function(){
                    this.render();
                    this.show();
                });
            }).on("click.dept",function(){
                deptPulldown.load(function(){
                    this.render();
                    this.show();
                });
            });
        }
    }

    /**
     * 业务员
     */
    function initUser(){
        if($.fn.user) return;

        $.fn.user = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("userComponent")){
                this.data("userComponent").destroy();
                this.off(".user");
            }
            var opts = {
                title:"可输入用户全拼/拼音首字母/汉字/工号",
                dataType:"dynamic",
                cascade:false,
                cascadeOpts:{
                    inputId:"",
                    hiddenId:""
                },
                width:220,
                typeValue:"/base/rest/kj/veuser/getUserList",
                simpleData:{
                    id:"bh",
                    name:"xm"
                },
                formatPostData:function(data){
                    return JSON.stringify(data);
                },
                ajaxOpts:{
                    type:"post",
                    contentType: "application/json"
                },
                fn1:function(item){
                    return  "<span title='"+item.xm+"' class='right' style='width:100%;'>"+(item.xm)+"("+item.bh+")</span>";
                },
                cbFn: $.noop
            };

            var userPulldown = new Pulldown(this.get(0),$.extend(true,{},opts,options));
            this.data("userComponent",userPulldown);

            this.on("keyup.dept",function(e){
                userPulldown.elemKeyUpHandler(e,function(){
                    this.render();
                    this.show();
                });
            }).on("click.dept",function(){
                if(userPulldown.opts.cascade){
                    userPulldown.opts.qDatas.deptid = $("#" + userPulldown.opts.cascadeOpts.hiddenId).val();
                    userPulldown.triggerType = "click";
                }
                userPulldown.load(function(){
                    this.render();
                    this.show();
                });
            });
        }
    }

    /**
     * 需求组控件
     */
    function initGroup() {
        if($.fn.group) return;

        $.fn.group = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("groupComponent")){
                this.data("groupComponent").destroy();
                this.off(".group");
            }
            var opts = {
                title:"可输入部门全拼/拼音首字母/汉字/编号",
                dataType:"dynamic",
                width:220,
                cascade:false,
                cascadeOpts:{
                    inputId:"",
                    hiddenId:""
                },
                ajaxOpts:{
                    type:"post",
                    contentType:"application/json"
                },
                typeValue:"/base/rest/kj/veuser/selectGroupPage",
                simpleData:{
                    id:"bh",
                    name:"mc"
                },
                fn1:function(item){
                    return  "<span title='"+item.mc+"' class='right' style='width:100%;'>"+(item.mc)+"("+item.bh+")</span>";
                },
                cbFn: $.noop,
                formatPostData:function(data){
                    var param = {
                        current:data.current,
                        size:data.size
                    };
                    param.data = data;
                    return JSON.stringify(param);
                },
                qDatas:{
                    deptid:""
                }
            };

            //如果有级联，在选择部门以后，要清理用户的输入框和隐藏域
            if(options && options.cascade){
                var cbFn = options.cbFn;
                options.cbFn = function(data){
                    $("#" + options.cascadeOpts.inputId).val("");
                    $("#" + options.cascadeOpts.hiddenId).val("");
                    cbFn(data);
                }
            }

            var groupPullDown = new Pulldown(this.get(0),$.extend(true,{},opts,options));
            this.data("groupComponent",groupPullDown);

            this.on("keyup.group",function(e){
                groupPullDown.elemKeyUpHandler(e,function(){
                    this.render();
                    this.show();
                });
            }).on("click.group",function(){
                if(groupPullDown.opts.cascade){
                    groupPullDown.opts.qDatas.deptid = $("#" + options.cascadeOpts.hiddenId).val();
                    groupPullDown.triggerType = "click";
                }
                groupPullDown.load(function(){
                    this.render();
                    this.show();
                });
            });
        }
    }

    /**
     * number控件
     */
    function initInputNumber(){
        if($.fn.inputNumber) return ;

        $.fn.inputNumber = function(options,cbFn){
            if(!this.length) Common.nodeError(this);
            var inn = new InputNumber(this.get(0),options,cbFn);
            inn.init();
            return inn;
        }
    }

    /**
     * 保险下拉控件
     */
    function initBx(){
        if($.fn.showBx) return;

        var tempObj ={
            url:"/insurance/bx/kj/cpsa/getInsuranceProductForKj",
            height:300,
            settings:{
                data:{
                    simpleData:{
                        pIdKey: "pid"
                    }
                }
            },
            isExpandAll:false,
            type:"radio"
        };

        $.fn.showBx = function(options){
            //如果禁用父节点，父节点点击无效果
            if(options.disabledPNode){
                tempObj.settings.callback = {
                    beforeClick:function(treeId,treeNode){
                        return !treeNode.isParent;
                    }
                }
            }
            $(this).showTreeSelect($.extend(true,{},tempObj,options));
        };
    }

    /**
     * 省份单选
     */
    function initProvince(){

        if($.fn.addProvince) return;

        if(!(provinceData.length && isLoaded)){
            $.ajax({
                type:"get",
                url:"/cdsbase/kj/cds/sfcs/get",
                data:{sf:1},
                success:function(data){
                    provinceData = data.result.records;
                    isLoaded = true;
                }
            });
        }
        //省份配置参数
        var pOpts ={
            type:1,
            typeValue:provinceData,
            pageSize:15,
            fn1:function(data){
                return "<span>"+(data.qp || "").toUpperCase()+"</span><span class='right' >"+data.name+"</span>";
            },
            filterFn:provinceFilterFn
        };

        $.fn.addProvince = function(options){
            if(!this.length) Common.nodeError(this);

            var opts = $.extend(true,{},pOpts,options);

            if(this.data("provinceComponent")){
                this.data("provinceComponent").destroy();
                this.off(".province");
            }

            var provincePulldown = new Pulldown(this.get(0),opts);
            this.data("provinceComponent",provincePulldown);
            //省份
            this.on("click.province",function(){
                if(isLoaded){
                    provincePulldown.opts.typeValue = provinceData;
                    provincePulldown.load(function(){
                        this.render();
                        this.show();
                    });
                }else{
                    provincePulldown.show();
                }
            }).on("keyup.province",function(e){
                provincePulldown.elemKeyUpHandler(e,function(data){
                    this.render();
                    this.show();
                });
            });
        };
    }

    /**
     * 城市多选
     */
    function initCityMult(){
        if($.fn.addCityMult)return;

        var defaultOpts = {
            type:2,
            typeValue:"/cdsbase/kj/cds/sfcs/get",
            qDatas:{
                size:100
            },
            filterFn:function(data,value){
                value = value.toUpperCase();
                return (data.id.toUpperCase().indexOf(value) > -1 || data.name.toUpperCase().indexOf(value) >-1 || data.pyjsm.toUpperCase().indexOf(value) >-1 || data.qp.toUpperCase().indexOf(value) >-1);
            }
        };

        $.fn.addCityMult = function(options){

            if(!this.length) Common.nodeError(this);

            if(this.data("cityMultComponent")){
                this.data("cityMultComponent").destroy();
                this.off(".cityMult");
            }

            var msasObj =new  MultSelectAndSearch(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;
            this.data("cityMultComponent",msasObj);

            this.on("click.cityMult",function(){
                var provinceId = $("#" +msasObj.opts.provinceId).val();
                if($(this).data("provinceId") !== provinceId || !isLoaded){
                    $(this).data("provinceId",provinceId);
                    msasObj.opts.qDatas.szsf = provinceId;
                    msasObj.load(function(data){
                        this.unCheckedData = data.result.records;
                        isLoaded = true;
                        this.render();
                        this.show();
                    });
                }else{
                    msasObj.show();
                }
            });
        }

    }

    /**
     * 轮播图
     */
    function initVetechSlider(){
        if($.fn.addVetechSlider) return;

        /**
         * //封装的函数入口
         * @param options 轮播图的参数
         */
        $.fn.addVetechSlider = function(options){
            //如果有重复绑定的情况，先清除
            if(this.data("component")){
                this.data("component").destroy();
            }
            var veslider = new VetechSlider(this.get(0),options);
            this.data("component",veslider);
            veslider.load(function(data){
                this.data = data;
                this.render();
            });
        }

    }

    function initPoiType(){
        if($.fn.showPoiType) return;

        var tempObj ={
            url:"/cdspoi/poi/type/getTree",
            height:300,
            splitStr:"|",
            settings:{
                data:{
                    simpleData:{
                        pIdKey: "pId"
                    }
                },
                callback:{
                    onClick:function(event,treeId,treeNode){
                        var nodes = getPNodes(treeNode,[treeNode]);
                        nodes.reverse();
                        this.checkedNodes = nodes;
                        this.setValue();
                        this.hide();
                    }
                }
            },
            isExpandAll:false,
            type:"radio"
        };

        $.fn.showPoiType = function(options){
            $(this).showTreeSelect($.extend(true,{},tempObj,options));
        };

        /**
         * 获取选中节点及子节点的信息
         * @param treeNode
         * @param nodes
         * @returns {*}
         */
        function getPNodes(treeNode,nodes){
            var pNode = treeNode.getParentNode();
            if(pNode){
                nodes.push(pNode);
                return getPNodes(pNode,nodes);
            }else{
                return nodes;
            }
        }

    }

    /**
     *
     * @param shbh pt
     * @param shbh 商户编号
     * @param fzcp 负责产品，可传多个，用逗号分隔
     * @param fzyw 负责业务,31200501采购、31200502结算、 31200503供应
     */
    function showShInfo(pt,shbh,fzcp,fzyw){
        pt = pt ? pt: "cpsa";
        layui.layer.open({
            title:"商户信息",
            type:2,
            content:"/"+pt+"/view/component/shInfo?shbh="+shbh +"&fzcp="+fzcp+"&fzyw="+fzyw,
            area:["600px","400px"]
        });
    }

    /**
     * 国家控件
     */
    var countryData; //数据
    function initNationality(){

        if($.fn.addNationality) return;

        var defaultOpts = {
            "dataType":"static",
            pageSize:10,
            simpleData:{
                id:"by3",
                name:"mc"
            },
            title:"可输入汉字、二字码、三字码。",
            type:1,
            typeValue: $.extend(true,[],countryData),
            fn1:function(data){
                return "<span>"+data.mc+"</span><span class='right'>"+(data.by3 || "")+"</span>";
            },
            filterFn:function(data,qStr){
                var mc = (data.mc || "").toUpperCase(),
                    by3 = (data.by3 || "").toUpperCase(),
                    by2 =(data.by2 || "").toUpperCase(),
                    ywmc = (data.ywmc || "").toUpperCase(),
                    id = data.id,
                    qStr = (qStr || "").toUpperCase();

                var index1 = by3.indexOf(qStr),
                    index2 =by2.indexOf(qStr),
                    index3 = mc.indexOf(qStr),
                    index4 =ywmc.indexOf(qStr),
                    index5 = id.indexOf(qStr);

                if(qStr === by3 || qStr === by2 || qStr === mc || qStr === ywmc || id === qStr){
                    return 0;
                }else if(index1>-1){
                    return index1;
                }else if(index2>-1){
                    return index2;
                }else if(index3>-1){
                    return index3;
                }else if(index4>-1){
                    return index4;
                }else if( index5>-1){
                    return index5
                }else{
                    return -1;
                }
            }
        };

        /**
         * 国家控件
         * @param options
         */
        $.fn.addNationality = function(options){

            if(this.data("nationalityComponent")){
                this.data("nationalityComponent").destroy();
                this.off(".nationality");
            }

            var pulldown = new Pulldown(this.get(0),$.extend(true,{},defaultOpts,options));

            $(this).on("click.nationality",function () {
                if(countryData){
                    pulldown.show();
                }else{
                    $.ajax({
                        type:"get",
                        url:"/cdsbase/bClass/getCountry?data=",
                        success:function(data){
                            pulldown.opts.typeValue = data.result || [];
                            countryData = $.extend(true,[],pulldown.opts.typeValue);
                            pulldown.load(function(){
                                this.render();
                                this.show();
                                this.$elem.data("nationalityComponent",pulldown);
                            });

                        }
                    });
                }
            }).on("keyup",function(e){
                pulldown.elemKeyUpHandler(e,function(data){
                    this.render();
                    this.show();
                });
            });
        }
    }


    exports.initProvinceAndCity = initProvinceAndCity;

    exports.initVecity = initVecity;

    exports.initPopup = initPopup;

    exports.initProvinceMult = initProvinceMult;

    exports.initPOI = initPOI;

    exports.initBusinessScope = initBusinessScope;

    exports.initSupplyProducts = initSupplyProducts;

    exports.initHeadquarters = initHeadquarters;

    exports.initFileUpload = initFileUpload;

    exports.initCityAndXzq = initCityAndXzq;

    exports.initShdj = initShdj;

    exports.initProCityVisa = initProCityVisa;

    exports.initDept = initDept;

    exports.initUser = initUser;

    exports.initGroup = initGroup;

    exports.initInputNumber = initInputNumber;

    exports.initProvince = initProvince;

    exports.initCityMult = initCityMult;

    exports.initVetechSlider = initVetechSlider;

    exports.initBx = initBx;


    exports.initPoiType = initPoiType;

    exports.showShInfo = showShInfo;

    exports.initNationality = initNationality;

});
