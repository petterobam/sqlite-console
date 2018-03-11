/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {
    var Pulldown = require("js/Pulldown"),
        JCHZL = require("js/JCHZL"),
        FlightSearch =  require("js/FlightSearch"),
        FlightNum = require("js/FlightNumber"),
        Cabin = require("js/Cabin"),
        HSMult = require("js/HSMult"),
        MultSelect = require("js/MultSelect"),
        MultSelectAndSearch = require("js/MultSelectAndSearch"),
        Common = require("js/Common");

    /**
     * 航班号搜索
     */
    function initHbhss(){
        if($.fn.addHbhSs|| $.fn.hbhss) return ;
        $.fn.addHbhSs = function(options,cbFn){
            if(this.length <= 0) throw new TypeError("DOM绑定错误");
            var oInput = this.get(0);
            var $this = $(this);
            var flight = new FlightSearch(oInput,options,cbFn);
            var prevInput = "";
            var keySearchData;
            $this.on("keyup",function(){
                $this.val($this.val().toUpperCase());
                if($this.val() === ""){
                    flight.hide();
                    return ;
                }
                flight.waitDo(function(){
                    keySearchData = $this.val();
                    prevInput = keySearchData;
                    if($this.val().length>=options.searchLen){
                        flight.show();
                        flight.loadData(keySearchData);
                    }
                },options.wait);
            }).on("click",function(){
                if($this.val() === "") return false;
                if(($this.val() === prevInput) && flight.data && flight.data.length){
                    flight.show();
                }
                if(($this.val() !== prevInput)){
                    flight.show();
                    prevInput = $this.val();
                    flight.loadData($this.val());
                }
                return false;
            });
        };

        $.fn.hbhss = function(options,callBack){
            var opt = {
                wait : 0,
                width :"415",
                height:"260",
                searchLen:1,
                pt:"ASMS",
                dataUrl: "/cdsbase/bCommHb/getSearchList"
            };
            var opts = $.extend({},opt,options);
            this.addHbhSs(opts,function(data){
                if(! $.isEmptyObject(data)){
                    var cfcity = data["cfcity"];
                    var ddcity = data["ddcity"];
                    var hbh = data["hbh"];
                    var sj = options["sj"]||$('#'+options["sjId"]).val();
                    $.ajax({
                        type:"post",
                        url:"/cdsbase/bCommHb/getHbsk",
                        data:{pt:opts["pt"],qfsj:sj,cfcity:cfcity,ddcity:ddcity,hbh:hbh},
                        success:function(res){
                            res.hbhState=true;
                            callBack(res);
                        }
                    });
                }else{
                    var data={};
                    data.hbhState=false;
                    callBack(data);
                }
            });
        };
    }


    /**
     * 机场航站楼
     */
    function initJcHzlMult(){
        var defaultOpts = {
            type:2,
            simpleData:{
                id:"nbbh",
                name:"hzlqm"
            },
            title1:"已选航站楼",
            title2:"未选航站楼",
            typeValue:"/cdsbase/kj/cds/cityhzl/getHzlListAll",
            filterFn:function(data,value){
                value = (value || "").toUpperCase();
                return ((data.nbbh || "").toUpperCase().indexOf(value) >-1 || (data.dlmcjp || "").toUpperCase().indexOf(value) >-1 || (data.jcmc || "").toUpperCase().indexOf(value)>-1);
            }
        };
        initMultSelectAndSearch();

        $.fn.addJChzlMult = function(options){
            this.addMultSelectAndSearch($.extend(true,{},defaultOpts,options));
        }
    }
    function initMultSelectAndSearch(){
        if($.fn.addMultSelectAndSearch)return;

        var defaultOpts = {};

        $.fn.addMultSelectAndSearch = function(options){

            if(!this.length) Common.nodeError(this);

            if(this.data("MSASComponent")){
                this.data("MSASComponent").destroy();
                this.off(".MSAS");
            }
            var msasObj = new MultSelectAndSearch(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;
            this.data("MSASComponent",msasObj);

            this.on("click.MSAS",function(){
                if(isLoaded && !msasObj.opts.immediately){
                    msasObj.show();
                }else{
                    $.type(msasObj.opts.beforeLoad) === "function" && msasObj.opts.beforeLoad.call(msasObj);
                    msasObj.load(function(data){
                        this.data = $.type(data.result) === "array" ? data.result : data.result.records;
                        this.writeValue();
                        isLoaded = true;
                        this.render();
                        this.show();
                    });
                }
            });
        }
    }


    /**
     * 初始化机场航站楼
     */
    function initJcHzl(){
        if($.fn.showJcHzl) return;

        var defaultOpts = {
            type:2,
            hiddenName:"txt7Hidden",
            typeValue:"/cdsbase/kj/cds/cityhzl/citylist",
            simpleData:{
                "id":"dldh",
                "name":"dlmc"
            },
            hzlOpts:{
                typeValue:"/cdsbase/kj/cds/cityhzl/hzllist"
            }
        };

        $.fn.showJcHzl = function(options){
            if(!this.length) Common.nodeError(this);

            var isLoaded = false;
            //防止重复绑定
            var comObj = this.data("jchzlComponent");
            if(comObj){
                comObj.destroy();
                this.off(".jchzl");
            }
            var jchzlObj =null;
            $(this).on("click.jchzl",function () {
                if(isLoaded){
                    jchzlObj.show();
                }else{
                    jchzlObj = new JCHZL(this,$.extend(true,{},defaultOpts,options));
                    jchzlObj.load(function(data){
                        this.data = data.result;
                        this.init(function(){
                            this.show();
                        });
                        isLoaded = true;
                    });
                }
            });
        };

    }

    /**
     * 航班号是否适用控件
     */
    function initFlightNum(){
        if($.fn.applyFlightNum) return;

        $.fn.applyFlightNum = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".flightNum");
            }

            var flightNum = new FlightNum(this.get(0),options);
            flightNum.init();
            $(this).on("click",function(){
                flightNum.show();
            })
        }
    }

    /**
     * 国际舱位控件
     */
    function initGjCabin(){
        initHsMult();
        var arr = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
            data = {result:{records:[]}};
        for(var i = 0,len = arr.length;i<len;i++){
            data.result.records.push({"id":arr[i],"name":arr[i]});
        }

        $.fn.addGjCabin = function(options){
            var opts = $.extend(true,{
                simpleData:{
                    id:"id",
                    name:"name"
                },
                type:1,
                typeValue:data
            },options);
            $(this).addHsMult(opts);
        }
    }

    /**
     * 航司多选控件
     */
    function initHsMult(){
        if($.fn.addHsMult) return;

        $.fn.addHsMult = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".hsMult");
            }

            var hsObj = new HSMult(this.get(0),$.extend(true,{
                    type:2,
                    typeValue:"/cdsbase/ticketBairway/like",
                    qDatas:{
                        gngj:1,
                        size:100,
                        current:1
                    },
                    simpleData:{
                        id:"szdh",
                        name:"ezdh"
                    }
                },options)),
                isLoaded = false;
            this.on("click.hsMult",function(){
                if(isLoaded){
                    hsObj.show();
                }else{
                    hsObj.load(function(data){
                        this.data = data.result.records;
                        this.render();
                        this.writeValue();
                        this.show();
                        this.$elem.data("component",this);
                        isLoaded = true;
                    });
                }
            });

        }
    }

    /**
     * 国内舱位控件
     */
    function initGnCabin(){
        if($.fn.addGnCabin) return;

        $.fn.addGnCabin = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("gnCabinComponent")){
                this.data("gnCabinComponent").destroy();
                this.off(".gnCabin");
            }
            var opts = $.extend(true,{
                type:2,
                simpleData:{
                    id:"cwdj",
                    name:"name"
                },
                typeValue:"/cdsbase/ticketBairwayCw/like",
                hsId:"" //航司id
            },options);

            var cabin =new Cabin(this.get(0),opts);
            this.data("gnCabinComponent",cabin);

            this.on("click.gnCabin",function(){
                //如果没有选择航司，舱位不加载
                var hsId =$("#" + cabin.opts.hsId).val();
                if(!hsId)return;

                if(hsId === cabin.opts.qDatas.data){
                    cabin.show();
                }else{
                    cabin.opts.qDatas.data = hsId;
                    cabin.load(function(data){
                        if(!data.result.length) return;
                        this.data = _formatCabinData(data.result);
                        this.render();
                        this.show();
                    });
                }
            });
        }
    }

    /**
     * 国内舱位单选
     */
    function initGnCabinRadio(){
        if($.fn.addGnCabinRadio) return;

        $.fn.addGnCabinRadio = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("gnCabinRadio")){
                this.data("gnCabinRadio").destroy();
                this.off(".gnCabinRadio");
            }

            var opts = $.extend(true,{
                type:1,
                typeValue:[],
                simpleData:{
                    id:"cwdj",
                    name:"cwdj"
                },
                "dataType":"static",
                pageSize:10,
                title:"可输入检索",
                fn1:function(data){
                    return "<span style='width:100%;'>"+data.cwdj +Math.floor(data.zkl * 100)+"</span>";
                },
                filterFn:function(data,qStr){
                    qStr = qStr.toUpperCase();
                    return (data.cwdj || "").toUpperCase().indexOf(qStr);
                },
                hsId:"" //航司id
            },options);

            var cabinPulldown =new Pulldown(this.get(0),opts);

            this.data("gnCabinRadio",cabinPulldown);

            this.on("click.gnCabinRadio",function(){
                //如果没有选择航司，舱位不加载
                var hsId =$("#" + cabinPulldown.opts.hsId).val();
                if(!hsId)return;

                if(hsId === cabinPulldown.opts.qDatas.data){
                    cabinPulldown.show();
                }else{
                    cabinPulldown.opts.qDatas.data = hsId;
                    $.ajax({
                       type:"get",
                        url:"/cdsbase/ticketBairwayCw/like?data="+hsId,
                        success:function(data){
                            cabinPulldown.opts.typeValue = sortCabinData(data.result || []);
                            cabinPulldown.load(function(data){
                                this.render();
                                this.show();
                            });
                        }
                    });


                }
            }).on("keyup.gnCabinRadio",function(e){
                cabinPulldown.elemKeyUpHandler(e,function(data){
                    this.render();
                    this.show();
                });
            });
        }
    }

    /**
     * 对舱位数据进行排序（舱位单选）
     * @param data
     */
    function sortCabinData(data){
        data.sort(function(a,b){
            return  b.zkl - a.zkl;
        });
        return data;
    }

    /**
     *
     * @param data
     * @returns {Array}
     * @private
     */
    function _formatCabinData(data) {
        //根据舱位等级进行分类
        var cwdjObj = {
            "0": {name: "经济舱", childs: []},
            "6": {name: "头等舱", childs: []},
            "7": {name: "公务舱", childs: []},
            "10": {name: "明珠舱", childs: []}
        };
        for (var i = 0, len = data.length; i < len; i++) {
            var item = data[i];
            item.isPublish = item.ifgbyj;
            item.name = item.cwdj + " " + Math.floor(item.zkl * 100);
            cwdjObj[item.cwdjlx].childs.push(item);
        }
        var newArr = [];
        for (var keys in cwdjObj) {
            if (cwdjObj[keys].childs.length) {
                newArr.push(cwdjObj[keys]);
            }
        }
        return newArr;
    }

    /**
     * 国际航司多选
     */
    function initGjHsMult(){
        if($.fn.addGjHsMult) return;

        var defaultOpts = {
            type:2,
            typeValue:"/cdsbase/ticketBairway/like",
            title1:"已选择的航司",
            title2:"未选择的航司",
            simpleData:{
                id:"ezdh",
                name:"shortname"
            },
            qDatas:{
                gngj:0,
                size:1000
            },
            filterFn:function(data,value){
                value = (value || "").toUpperCase();
                return (data.ezdh).toUpperCase().indexOf(value) >-1 || (data.airway).toUpperCase().indexOf(value) >-1;
            },
            fn1:function(item){
                return $('<option  title="'+item.shortname+'" value="'+item.ezdh+'">'+item.shortname+'('+item.ezdh+')</option>');
            }

        };

        $.fn.addGjHsMult = function(options){
            if(!this.length) Common.nodeError(this);

            //如果已经绑定的，先销毁，再重新绑定
            if(this.data("gjhsMultComponent")){
                this.data("gjhsMultComponent").destroy();
                this.off(".gjhsMult");
            }

            var gjhsObj = new MultSelectAndSearch(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;
            this.data("gjhsMultComponent",gjhsObj);

            this.on("click.gjhsMult",function(){
                if(isLoaded){
                    gjhsObj.show();
                }else{
                    gjhsObj.load(function(data){
                        this.data = data.result.records;
                        this.writeValue();
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }

            });


        }

    }

    /**
     * 航司单选控件
     */
    function initHsDanxuan(){
        if($.fn.addHsDanxuan) return;

        $.fn.addHsDanxuan = function(options){
            if(!this.length) Common.nodeError(this);

            if(this.data("component")){
                this.data("component").destroy();
                this.off(".hsDanxuan");
            }

            var opts = $.extend(true,{
                dataType:"dynamic",
                type:2,
                title:"可输入汉字、二字码",
                typeValue:"/cdsbase/ticketBairway/like",
                qDatas:{
                    gngj:1
                },
                simpleData:{
                    id:"ezdh",
                    name:"shortname"
                },
                fn1:function(data){
                    return "<span>"+data.shortname+"</span><span class='right' >"+data.ezdh+"</span>";
                }

            },options);

            var pulldown = new Pulldown(this.get(0),opts),
                isLoaded = false;

            var _this = this;
            $(this).on("click",function(){
                if(isLoaded){
                    pulldown.show();
                }else{
                    pulldown.load(function(){
                        this.render();
                        this.show();
                        isLoaded = true;
                        $(_this).data("component",pulldown);
                    });
                }
            }).on("keyup",function (e) {
                pulldown.elemKeyUpHandler(e,function(data){
                    this.render();
                    this.show();
                });
            });
        }
    }

    /**
     * 退票和改签
     */
    function initAddTpAndGq(){
        if($.fn.addTpAndGq) return;

        $.fn.addTpAndGq = function(options){
            if(!this.length) Common.nodeError(this);

            var defaultOpts = {
                type:2,
                typeValue:"/cdsbase/bClass/getLb",
                simpleData:{
                    id:"id",
                    name:"mc"
                },
                usetype:"radio",
                height:200,
                qDatas:{
                    lb: options.lb || "10007"
                }
            };

            if(this.data("tplyComponent")){
                this.data("tplyComponent").destroy();
                this.off(".tply");
            }

            var tplySelect = new MultSelect(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;

            this.data("tplyComponent",tplySelect);

            this.on("click",function(){
                if(isLoaded){
                    tplySelect.show();
                }else{
                    tplySelect.load(function(data){
                        this.data = data.result || [];
                        this.render();
                        this.writeValue();
                        this.show();
                        isLoaded = true;
                    });
                }
            });

        };
    }


    /**
     *初始化国内国际城市
     */
    function initGjAndGnCity(){
        if($.fn.shdanxuan) return;

        $.fn.addGnGjCity = function(opts){

            if(!this.length) Common.nodeError(this);
            var options1 = $.extend(true,{
                simpleData:{
                    "id":"nbbh",
                    "name":"dlmc"
                },
                title:"可输入城市拼音、汉字、三字码",
                fn1:function(data){
                    return "<span style=''>"+data.ywmc+"</span><span class='right'>"+data.dlmc+"("+data.nbbh || ""+")</span>";
                },
                height:300,
                type:2,
                typeValue:"/cdsbase/kj/cds/cityjc/hotcitylist",
                qDatas:{
                  gngj:"0"
                },
                "dataType":"dynamic",
                "_hasPage_":false //不要分页
            },opts);

            var options2 = $.extend(true,{
                simpleData:{
                    "id":"nbbh",
                    "name":"dlmc"
                },
                ajaxOpts:{
                  type:"post",
                  contentType:"application/json"
                },
                formatPostData:function(data){
                    return JSON.stringify(data);
                },
                title:"可输入城市拼音、汉字、三字码",
                fn1:function(data){
                    return "<span style=''>"+data.ywmc+"</span><span class='right'>"+data.dlmc+"("+data.nbbh || "" +")</span>";
                },
                type:2,
                typeValue:"/cdsbase/kj/cds/cityjc/jclist",
                "dataType":"dynamic"
            },opts);
            var pulldown1 = new Pulldown(this.get(0), options1);
            var pulldown2 = new Pulldown(this.get(0), options2);
            var isLoaded = false;

            this.on("click",function(){
                if(!isLoaded){
                    pulldown1.load(function(data){
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }else{
                    pulldown1.show();
                }
                pulldown2.hide();
            }).on("keyup",function(ev){
                exec.call(this,ev);
            }).on("keydown",function(ev){
                //输入中文的时候，按enter键，在360上不能检索
                if(ev.keyCode === 229){
                    var _this = this;
                    setTimeout(function(){
                        exec.call(_this,ev);
                    },500);
                }
            });

            function exec(ev){
                if(!this.value){
                    pulldown1.show();
                    pulldown2.hide();
                }else{
                    pulldown1.hide();
                    pulldown2.elemKeyUpHandler(ev,function(data){
                        this.render();
                        this.show();
                    });
                }
            }

        };
    }
    /**
     * 签发国家
     */
    function initSign(){
        if($.fn.addSign) return;

        var defaultOpts = {
            "dataType":"dynamic",
            "_hasPage_":false,
            simpleData:{
              id:"by1",
              name:"mc"
            },
            type:2,
            typeValue:"/cdsbase/kj/cds/certificate/gjzjlx",
            fn1:function(data){
                return "<span style='width:100%;'>"+data.mc+"</span>"
            }

        };

        $.fn.addSign = function(options){

            if(this.data("nationalityComponent")){
                this.data("nationalityComponent").destroy();
                this.off(".nationality");
            }

            var pulldown = new Pulldown(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;

            $(this).on("click.nationality",function () {

                if(isLoaded){
                    pulldown.show();
                }else{
                    pulldown.load(function(data){
                        this.render();
                        this.show();
                        isLoaded = true;
                        this.$elem.data("nationalityComponent",pulldown);
                    });
                }
            });

        }

    }


    /**
     * 币种下拉控件
     */
    function initCurrency(){
        if($.fn.addCurrencySelect) return;

        var defaultOpts = {
            type:2,
            typeValue:"/cdsbase/bClass/getLb",
            simpleData:{
                id:"id",
                name:"mc"
            },
            usetype:"radio",
            height:200,
            qDatas:{
                lb: "2003"
            }
        };

        /**
         *
         * @param options
         */
        $.fn.addCurrencySelect = function(options){

            if(this.data("currency")){
                this.data("currency").destroy();
                this.off(".currency");
            }

            var currencySelect = new MultSelect(this.get(0),$.extend(true,{},defaultOpts,options)),
                isLoaded = false;

            this.on("click",function(){
                if(isLoaded){
                    currencySelect.show();
                }else{
                    currencySelect.load(function(data){
                        this.data = data.result || [];
                        this.render();
                        this.writeValue();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        }
    }

    /**
     * 城市多选控件
     */
    function initCityMult2(){
        var defaultOpts = {
            type:2,
            simpleData:{
                id:"nbbh",
                name:"mc"
            },
            ajaxOpts:{
                type:"post"
            },
            qDatas:{
                size:1000,
                current:1
            },
            hsId:"", //航司对应的domid
            immediately:true,
            title1:"已选择的城市",
            title2:"未选择的城市",
            typeValue:"/cdsbase/bCommHbBCity/getAll",
            fn1:function(item){
                return $('<option  title="'+item.mc+'" value="'+item.nbbh+'">'+item.mc+'('+item.nbbh+')</option>');
            },
            filterFn:function(data,value){
                value = (value || "").toUpperCase();
                return (data.nbbh || "").toUpperCase().indexOf(value) >-1 || (data.mc || "").toUpperCase().indexOf(value) >-1 || (data.ywmc || "").toUpperCase().indexOf(value) >-1;
            },
            beforeLoad:function () {
                this.opts.qDatas.other = $("#" + this.opts.hsId).val() || "CA";
            }
        };
        initMultSelectAndSearch();

        $.fn.addCityMult2 = function(options){
            this.addMultSelectAndSearch($.extend(true,{},defaultOpts,options));
        }
    }


    exports.initHbhss = initHbhss;

    exports.initJcHzl = initJcHzl;

    exports.initJcHzlMult = initJcHzlMult;

    exports.initFlightNum = initFlightNum;

    exports.initGjCabin = initGjCabin;

    exports.initHsMult = initHsMult;

    exports.initGnCabin = initGnCabin;

    exports.initGjHsMult = initGjHsMult;

    exports.initHsDanxuan = initHsDanxuan;

    exports.initAddTpAndGq = initAddTpAndGq;

    exports.initGjAndGnCity = initGjAndGnCity;

    exports.initSign =initSign;

    exports.initCurrency = initCurrency;

    exports.initGnCabinRadio = initGnCabinRadio;

    exports.initCityMult2 = initCityMult2;

});
