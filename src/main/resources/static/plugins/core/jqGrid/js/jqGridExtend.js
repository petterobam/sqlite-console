/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: jqGrid扩展
 * @linc: MIT
 *
 */
define(function(require,exports,module){

    require("jqGrid-core");
    require("jqGrid-zh");
    var Calc = require("core/util/calc.js");

    var defaultOpts = {
        jsonReader:{
            records:"result.total",
            rows:"result.records",
            root:"result.records",
            page:"result.current",
            total:"result.pages"
        },
        prmNames:{
            "page":"current",
            "rows":"size"
        },
        datatype: "json",
        mtype:"POST",
        amountSettings:{
            show:{
                text:"总计"
            }
        },
        viewrecords : true,
        rowNum:20,
        serializeGridData:function(){
            var result = formartPostData.call(this);
            return result;
        },
        beforeProcessing:function(data,state,xhr){ //总计的控制
            if(this.p.amount){
                var st = this.p;
                var showObj = {};
                showObj[st.amountSettings.show.colIndex] = st.amountSettings.show.text;
                if(data.result && data.result.condition){
                    var tempObj = data.result.condition;
                    for(var kId in tempObj){
                        showObj[kId] = tempObj[kId];
                    }
                }
                $(this).footerData("set", showObj,null,$(this).parents(".ui-jqgrid-view").find(".ui-jqgrid-sdiv").find("tr").length-1);
            }
        },
        shrinkToFit:false, //设置按要求来显示宽度
        openServiceLog:false, //是否开启异动日志
        rowList:[10,20,30]
    };

    //设置jqgrid的ajax参数
    $.jgrid.ajaxOptions = {
        headers:{"Content-type":"application/json; charset=utf-8"}
    };


    $.fn.initGrid = function(options){
        var $grid = this;
        var parent_column = $grid.closest('div');

        defaultOpts.width = this.parent().width();

        var newOpts = $.extend(true,{},defaultOpts,options);

        var isExec = false; //是否执行列合计操作
        if(newOpts.footers){
            newOpts.footerrow = true;
            isExec = true;
        }else{
            //如果没有合计，看是否需要总计，如果需要总计，把合计配置为true，直接用合计的展示区域作为总计的展示区域即可
            newOpts.footerrow = newOpts.amount ? true :false;
        }
        var  customGridComplete = newOpts.gridComplete;
        newOpts.gridComplete = function(){
            if(customGridComplete) customGridComplete.call(this);
            $(this).parents(".ui-jqgrid-bdiv").scrollTop(0);
            if(isExec){
                var rowNum = parseInt($(this).getGridParam('records'), 10);
                if (rowNum > 0) {
                    $(this).parents(".ui-jqgrid-view ").find(".ui-jqgrid-sdiv").show();
                    var showObj = {},
                        footers =newOpts.footers;
                    if(footers.show){
                        showObj[footers.show.colIndex] = footers.show.text;
                    }
                    var flag = $.type(footers.formatSum) === "function"; //标记是否有格式化函数
                    for(var i = 0, len = footers.cols.length;i<len;i++){
                        showObj[footers.cols[i]] = $(this).getCol(footers.cols[i], false, 'sum',function(num1,num2){
                            var result = Calc.add(num1,num2);
                            return flag ? footers.formatSum(result) :result ;
                        });
                    }
                    $(this).footerData("set", showObj);
                } else {
                    $(this).parents(".ui-jqgrid-view ").find(".ui-jqgrid-sdiv").hide();
                }
            }
            repairGridHeight($grid,parent_column,"gridComplete");
            $grid.jqGrid( 'setGridWidth',parent_column.width()-2);
            $(window).triggerHandler("scroll.jqGrid");
        };

        $(this).jqGrid(newOpts);
        if(newOpts.rownumbers){
            $grid.jqGrid('setLabel',0, '序号','labelstyle');
        }
        //异动日志的操作
        if(newOpts.openServiceLog){
            $grid.jqGrid("setGridParam",{
                "onSelectRow":function(id,state,ev){
                    serviceLogHandler.call(this,$grid,id,ev);
                }
            })
        }

        (function($grid,parent_column){
            var $currTab = parent_column.parents(".layui-tab-item");
            $(window).on('resize.jqGrid', function () {
                if($(".query-content").parents().hasClass("query-notab")){
                    var iHeight = $(".query-content").height() || 0;
                    $(".grid-content") && $(".grid-content").css("top",iHeight+5);
                }else{
                    var iHeight = $currTab.find(".query-content").height() ||0;
                    $currTab.find(".grid-content").css("top",iHeight+5);
                }

                if($grid){
                    repairGridHeight($grid,parent_column,"resize");
                    $grid.jqGrid( 'setGridWidth',parent_column.width()-2);
                }
            });
            $(window).triggerHandler('resize.jqGrid');//trigger window resize to make the grid get the correct size

            //订单列表页特殊处理
            if($(parent_column).hasClass("grid-list")){
                var pointer =$(parent_column).offset();
                var iTop = pointer.top,
                    iLeft =pointer.left,
                    iHeight = 0;

                var timer = null;
                $(window).on("scroll.jqGrid",function(ev){
                    clearTimeout(timer);
                    timer = setTimeout(exec,50);
                });

                function exec(){
                    var scrollTopVal = $(window).scrollTop(),
                        $hdiv = $(parent_column).find(".ui-jqgrid-hdiv");
                    if(!iHeight) iHeight = $hdiv.outerHeight();

                    if(scrollTopVal -iTop >= 10 && !$hdiv.hasClass("fixedGrid")){
                        $hdiv.css({
                            "left":iLeft
                        }).addClass("fixedGrid");
                        $(".frozen-bdiv").css("top",0);
                    }else if(scrollTopVal - iTop <-10 && $hdiv.hasClass("fixedGrid")){
                        $hdiv.css({
                            "left":0
                        }).removeClass("fixedGrid");
                        $(".frozen-bdiv").css("top",iHeight);
                    }
                }

            }
        })($grid,parent_column);


    };

    /**
     * 获取grid的配置参数
     */
    $.fn.getGridParams = function(){
        var obj = $(this).jqGrid("getGridParam");
        obj.qDatas = $.type(obj.qDatas) === "function" ? obj.qDatas() : obj.qDatas;
        return obj;
    };


    /**
     * 异动日志操作
     * @param $grid
     * @param id  当前选择行的id
     * @param ev
     */
    function serviceLogHandler($grid,id,ev){
        var $target = $(ev.target).parents("tr");
        if($target.data("state") !== "open"){
            var result = $grid.jqGrid("getRowData",id)["serviceLog"] || "";
            $target.after("<tr class='serviceLog-container'><td colspan='"+$target.find("td").length+"'><pre>"+result+"</pre></td></tr>");
            $target.data("state","open");
        }else{
            if($target.next().hasClass("serviceLog-container"))  $target.next().remove();
            $target.removeData("state");
        }
    }


    /**
     * 格式化参数
     */
    function formartPostData(){
        //查询条件判断
        var condition = $.type(this.p.qDatas) === "function" ? this.p.qDatas() :( $.type(this.p.qDatas) === "object" ? this.p.qDatas: {});
        var newCondition = {};
        for(var key in condition){
            if(condition.hasOwnProperty(key) && condition[key] !== "") newCondition[key] = condition[key];
        }
        //这里要重新构造分页请求参数
        var postData = this.p.postData;
        var newData = {
            current:postData.current,
            size: parseInt(postData.size,10),
            data:newCondition,
            isAsc: postData.sord === "asc" ? true: false,
            orderByField:postData.sidx,
            "_search": postData._search
        };
        return JSON.stringify(newData);
    }

    /**
     * 修正表格的个高度
     * @param $grid
     * @param parent_column
     * @param from
     */
    function repairGridHeight($grid,parent_column,from){
        var headerHeight = $grid.parents(".ui-jqgrid").find(".ui-jqgrid-hdiv").outerHeight();
        var pagerHeight = $grid.parents(".ui-jqgrid").find(".ui-jqgrid-pager").outerHeight();
        //获取分页合计和总计的
        var params =  $grid.jqGrid("getGridParam") || {};
        var footerHeight = params.footerrow ? $grid.parents(".ui-jqgrid").find(".ui-jqgrid-sdiv").outerHeight() : 0;


        if($grid.parents(".grid-content").length>0){
            $grid.jqGrid( 'setGridHeight', parent_column.height()-headerHeight-pagerHeight-footerHeight-2);
        }
    }


});