/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 商户选择控件
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
        "lx":"1", //类型
        "shbh":"",  //商户编号
        "mcLike":"", //商户名称
        "szsfList":"", //所在省份
        "shpjList":""  //商户等级
    };

    var opts = {
        cbFn:null, //回调函数
        lb:"101",
        ids:"",
        shListUrl:"/customer/rest/kj/shxx/getShList", //根据ids获取商户列表接口
        shGridUrl:"/customer/rest/kj/shxx/getShPage" //获取商户表格
    };



    var app2 = null;
    $(document).ready(function(){
        queryObj.lx = $("#lx").val();
        opts.lb += queryObj.lx;
        opts.ids = $("#ids").val();
        opts.cbFn = $("#cbFn").val();
        $container = $(".shChooseContainer");
        getShListByIds();
        initShGrid();
        bindEvent();

        var app = new Vue({
            el:"#app1",
            data:queryObj,
            mounted:function () {
                initComponent();
            }
        });
        app2 = new Vue({
            el:"#app2",
            data:{
                total:0
            }
        });

    });

    function getQueryObj(){
        return queryObj;
    }

    function getShListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            url:opts.shListUrl,
            data:{
                ids:opts.ids
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
        app2.$data.total +=1;
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.mc+'">'+item.mc+'</span></li>');
        $li.data("data",item);
        return $li;
    }




    /**
     *初始化商户grid
     */
    function initShGrid(){
        require("core/jqGrid/js/jqGridExtend.js");
        var he=$(grid_selector).parent().height()-90;

        $(grid_selector).initGrid({
            url:opts.shGridUrl,
            height: he,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["商户编号", "商户名称", "商户等级"],
            colModel: [
                {name: 'shbh', index: 'shbh', width: 100, editable: true, sorttype: "date"},
                {name: 'mc', index: 'mc', width: 100},
                {name: 'shdjmc', index: 'shdjmc', width: 100}
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
                state ?  addCheckedSh(rowObject) :delCheckedSh(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    state === true ? addCheckedSh(rowObject) : delCheckedSh(rowObject);
                }
            }
        });
    }

    /**
     * 添加已经选择的商户
     * @param rowObject
     */
    function addCheckedSh(rowObject){
        var $leftContainer = $container.find(".vetech-merchants-list"),
            isExist = false; //是否存在
        //1、先判断是否重复添加
        $leftContainer.find("li").each(function(){
            if($(this).data("data").shbh === rowObject.shbh){
                isExist = true;
                return false;
            }
        });
        if(!isExist){
            $leftContainer.append(createLi(rowObject));
        }
    }

    /**
     * 删除已经被选择的商户
     * @param rowObject
     */
    function delCheckedSh(rowObject){
        app2.$data.total-=1;
        $container.find(".vetech-merchants-list").find("li").each(function(){
            var tempData = $(this).data("data");
            if(tempData.shbh === rowObject.shbh){
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
            if(data.shbh === rowObject.shbh){
                $(grid_selector).jqGrid("setSelection",ids[i]);
                isCurrPage = true;
                break;
            }
        }
    }

    /**
     * 初始化控件
     */
   function initComponent(){
        var base = require("components/base");
        base.initProvinceMult();
        $("#ssqy").addProvinceMult({
            type:2,
            typeValue:"/cdsbase/kj/cds/sfcs/get",
            qDatas:{
                sf:1
            },
            cbFn:function(data){
                var keys = [];
                for(var i = 0 ; i< data.length;i++){
                    keys.push(data[i].id);
                }
                queryObj.szsfList =keys;

            }
        });
        base.initShdj();
        $("#ssdj").showShdj({
            lb: opts.lb,
            hiddenName:"txt1Hidden",
            type:"checkbox",
            cbFn:function(data){
                var keys = [];
                for(var i = 0 ; i< data.length;i++){
                    keys.push(data[i].id);
                }
                queryObj.shpjList = keys;
            }
        });

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
