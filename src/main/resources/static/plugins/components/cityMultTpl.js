/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 城市多选控件
 * @linc: MIT
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";

    require("vue2");
    var $container = null;
    var queryObj = {
        "csmc":"",  //城市名称
        "sfgjmc":"" //省份国家名称
    };

    var opts = {
        cbFn:null, //回调函数
        csids:"",
        cityListUrl:"/cdsbase/veCity/getCityList", //根据ids获取商户列表接口
        cityGridUrl:"/cdsbase/veCity/getCityPage" //获取商户表格
    };



    $(document).ready(function(){
        opts.csids = $("#csids").val();
        opts.cbFn = $("#cbFn").val();
        $container = $(".shChooseContainer");
        getCityListByIds();
        initCityGrid();
        bindEvent();

        var app = new Vue({
            el:"#app1",
            data:queryObj,
            mounted:function () {
            }
        });

    });

    function getQueryObj(){
        return queryObj;
    }

    //省份/城市列
    function unionProvinceCountry(cellvalue, options, rowObject){
        return cellvalue+"/"+rowObject.gjmc;
    }

    /**
     * 根据城市编号获取城市集合
     */
    function getCityListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            url:opts.cityListUrl,
            data:{
                csids:opts.csids
            },
            success:function(data){
                if(data && data.result.length){
                    for(var i = 0 ,len = data.result.length;i<len;i++){
                        var item = data.result[i];
                        $container.append(createLi(item));
                    }
                }
            }
        });

    }

    /**
     * 创建已经选择dom
     * @param item
     * @returns {jQuery|HTMLElement}
     */
    function createLi(item){
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.csmc+'">'+item.csmc+'</span></li>');
        $li.data("data",item);
        return $li;
    }




    /**
     *初始化城市grid
     */
    function initCityGrid(){
        require("core/jqGrid/js/jqGridExtend.js");
        var he=$(grid_selector).parent().height()-90;

        $(grid_selector).initGrid({
            url:opts.cityGridUrl,
            height: he,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["城市编号", "城市名称", "省份/国家","","",""],
            colModel: [
                {name: 'csid', index: 'csid', width: 100, editable: true, sorttype: "date"},
                {name: 'csmc', index: 'csmc', width: 100},
                {name: 'sfmc', index: 'sfmc', width: 100,formatter:unionProvinceCountry},
                {name: 'sfid', index: 'sfid', width: 0,hidden:true},
                {name: 'gjid', index: 'gjid', width: 0,hidden:true},
                {name: 'gjmc', index: 'gjmc', width: 0,hidden:true}
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
            if($(this).data("data").csid === rowObject.csid){
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
            if(tempData.csid === rowObject.csid){
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
            if(data.csid === rowObject.csid){
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
            $.each(data,function(i,n){
                if(n.sfmc.indexOf("/")>0) n.sfmc = n.sfmc.split("/")[0];
            });
            if(opts.cbFn){
                parent[opts.cbFn] && parent[opts.cbFn].call(null,data);
            }
            var  index= parent.layui.layer.getFrameIndex(window.name);
            parent.layui.layer.close(index);
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
