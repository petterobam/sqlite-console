/**
 * Created by sing on 2017/11/13.
 * 旅游线路选择控件的弹窗内逻辑代码
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";
    require("core/jqGrid/js/jqGridExtend.js");
    require("vue2");

    var $container = null;
    var queryObj = {
        "mini":1,  //只显示线路编号和线路名称
        "gjz":""  //线路名称
    };

    var opts = {
        cbFn:null, //回调函数
        routeGridUrl:"/cds-travel/cpsa/LyXl/getLyXlFromeEs" //旅游新路列表
    };

    function getQueryObj(){
        return queryObj;
    }

    $(document).ready(function(){
        opts.cbFn = $("#cbFn").val();
        opts.fnName =$("#keyId2").val();
        $container = $(".shChooseContainer");
        initChoosedList();
        initRouteGrid();
        bindEvent();

        var app = new Vue({
            el:"#app1",
            data:getQueryObj,
            mounted:function () {
            }
        });

    });

    /**
     * 初始化已经选择的控件
     */
    function initChoosedList(){
        var list = $.type(window.parent[opts.fnName]) === "function" ? window.parent[opts.fnName]() :[];
        for(var i =0 ;i <list.length;i++){
            addCheckedCity(list[i]);
        }
    }

    /**
     * 创建已经选择dom
     * @param item
     * @returns {jQuery|HTMLElement}
     */
    function createLi(item){
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.xlmc+'">'+item.xlmc+'</span></li>');
        $li.data("data",item);
        return $li;
    }




    /**
     *初始化城市grid
     */
    function initRouteGrid(){
        var he=$(grid_selector).parent().height()-90;

        $(grid_selector).initGrid({
            url:opts.routeGridUrl,
            height: he,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["线路编号", "线路名称"],
            colModel: [
                {name: 'xlbh', index: 'xlbh', width: 50,hidden:true},
                {name: 'xlmc', index: 'xlbh', width: 100}
            ],
            viewrecords: true,
            multiselect:true,
            loadComplete:function(){
                $container.find(".vetech-merchants-list").find("li").each(function(){
                    updateGridChecked($(this).data("data"));
                });
            },
            pager: pager_selector
        });

        $(grid_selector).jqGrid('setGridParam', {
            onSelectRow : function(id,state,ev) {
                var rowObject = $(grid_selector).getRowData(id);
                state ?  addCheckedCity(rowObject) :delCheckedCity(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    state === true ? addCheckedCity(rowObject) : delCheckedCity(rowObject);
                }
            }
        });
    }

    /**
     * 添加已经选择的城市
     * @param rowObject
     */
    function addCheckedCity(rowObject){
        var $leftContainer = $container.find(".vetech-merchants-list"),
            isExist = false; //是否存在
        //1、先判断是否重复添加
        $leftContainer.find("li").each(function(){
            if($(this).data("data").xlbh === rowObject.xlbh){
                isExist = true;
                return false;
            }
        });
        if(!isExist){
            $leftContainer.append(createLi(rowObject));
        }
    }

    /**
     * 删除已经被选择的城市
     * @param rowObject
     */
    function delCheckedCity(rowObject){
        $container.find(".vetech-merchants-list").find("li").each(function(){
            var tempData = $(this).data("data");
            if(tempData.xlbh === rowObject.xlbh){
                $(this).remove();
                return false;
            }
        });

    }



    /**
     * 更新grid的选中状态
     */
    function updateGridChecked(data){
        var ids = $(grid_selector).getDataIDs(),
            isCurrPage = false;
        for(var i =0 ;i < ids.length;i++){
            var rowObject = $(grid_selector).getRowData(ids[i]);
            if(data.xlbh === rowObject.xlbh){
                $(grid_selector).jqGrid("setSelection",ids[i]);
                isCurrPage = true;
                break;
            }
        }
    }

    /**
     * 绑定事件
     */
    function bindEvent(){
        $container.on("click.shChoose",".icon-close-circle",function(){
            var data = $(this).parent().data("data");
            var result = updateGridChecked(data);
            if(!result){
                $(this).parent().remove();
            }
        });
        $container.on("click.shChoose","#queryBtn",function(){
            $(grid_selector).trigger("reloadGrid");
        });

        //确认选择
        $container.on("click.shChoose","#sureBtn",function(){
            var data = [];
            $container.find(".vetech-merchants-list").find("li").each(function(){
                var tempData = $(this).data("data");
                data.push(tempData);
            });
            if(opts.cbFn){
                parent[opts.cbFn] && parent[opts.cbFn].call(null,data);
            }
        });
    }

    /**
     * 销毁
     */
    function destroy(){
        this.$container.off(".shChoose");
        this.$container.remove();
    }

});
