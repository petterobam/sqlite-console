/**
 * Created by sing on 2017/11/14.
 * 包车、租车、用车产品多选控件跳转逻辑
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var lv = require("/static/plugins/vue/LVForm.js");
    require("core/jqGrid/js/jqGridExtend.js");
    require("vue2");

    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";

    var $container = null,
        coulms = null,
        key = null,
        useType = "1";

    var queryObj = {
        "cplx":"",//产品类型
        "cpmcLike":"",//产品名称
        "gyShmc":""  //供应商
    };
     //1包车，2租车，3用车
    var opts = {
        cbFn:null, //回调函数
        ids:"",// 1711021556579814956
        "1":{
            listUrl:"/charcar/cpsa/product/getCpListByids",
            gridUrl:"/charcar/cpsa/product/getCpPage",
            cpEnumUrl:"/charcar/cpsa/product/getCpEnum",
            cols:["cpmc","cplx","gyShmc","cpid"],
            productsList:[{id:"",name:"===请选择==="}]
        },
        "2":{
            listUrl:"",
            gridUrl:""
        },
        "3":{
            listUrl:"/usecar/cpsa/product/getCpListByids",
            gridUrl:"/usecar/cpsa/product/getCpPage",
            cpEnumUrl:"/usecar/cpsa/product/getCpEnum",
            cols:["cpmc","cplxmc","fbShmc","id"],
            productsList:[{id:"",name:"===请选择==="}]
        }
    };

    $(document).ready(function(){
        opts.ids = $("#cpids").val();
        opts.cbFn = $("#cbFn").val();
        useType = $("#useType").val()||"1";
        coulms = opts[useType].cols;
        key = coulms[3];
        $container = $(".shChooseContainer");
        getProductListByIds();
        initProductGrid();
        bindEvent();

        var app = new Vue({
            el:"#app1",
            data:{
                query:queryObj,
                productsList:opts[useType].productsList
            },
            mounted:function () {
                layui.form.render();
                lv.listenFormEvent(this);
                getProductLists();
            },
            updated:function(){
                layui.form.render();
            }
        });

    });

    function getQueryObj(){
        var obj = {};
        if(useType === "1"){
            obj = queryObj;
        }else if(useType === "3"){
            obj.cplxid = queryObj.cplx;
            obj.fbShmc = queryObj.gyShmc;
            obj.cpmcLike = queryObj.cpmcLike;
        }else{

        }
        return obj;
    }

    /**
     * 根据城市编号获取城市集合
     */
    function getProductListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            url:opts[useType].listUrl,
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
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.cpmc+'">'+item.cpmc+'</span></li>');
        $li.data("data",item);
        return $li;
    }

    /**
     *初始化城市grid
     */
    function initProductGrid(){
        var he=$(grid_selector).parent().height()-90;
        $(grid_selector).initGrid({
            url:opts[useType].gridUrl,
            height: he,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["产品名称", "产品类型", "供应商",""],
            colModel: [
                {name: coulms[0], index: coulms[0], width: 100, editable: true, sorttype: "date"},
                {name:coulms[1], index:coulms[1], width: 100,formatter:function(cellValue,options, rowObject){
                    return typeof cellValue == "object"?cellValue.message:cellValue;
                }},
                {name: coulms[2], index: coulms[1], width: 100},
                {name: coulms[3], index: coulms[1], width: 0,hidden:true}
            ],
            viewrecords: true,
            multiselect:true,
            gridComplete:function(){
                $container.find(".vetech-merchants-list").find("li").each(function(){
                    updateGridChecked($(this).data("data"));
                });
            },
            pager: pager_selector
        });

        $(grid_selector).jqGrid('setGridParam', {
            onSelectRow : function(id,state,ev) {
                var rowObject = $(grid_selector).getRowData(id);
                state ?  addCheckedProduct(rowObject) :delCheckedProduct(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    state === true ? addCheckedProduct(rowObject) : delCheckedProduct(rowObject);
                }
            }
        });
    }

    /**
     * 添加已经选择的产品名称
     * @param rowObject
     */
    function addCheckedProduct(rowObject){
        var $leftContainer = $container.find(".vetech-merchants-list"),
            isExist = false;
        $leftContainer.find("li").each(function(){
            if($(this).data("data")[key] === rowObject[key]){
                isExist = true;
                return false;
            }
        });
        if(!isExist){
            $leftContainer.append(createLi(rowObject));
        }
    }

    /**
     * 删除已经被选择的产品名称
     * @param rowObject
     */
    function delCheckedProduct(rowObject){
        $container.find(".vetech-merchants-list").find("li").each(function(){
            var tempData = $(this).data("data");
            if(tempData[key] === rowObject[key]){
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
            if(data[key] === rowObject[key]){
                $(grid_selector).jqGrid("setSelection",ids[i]);
                isCurrPage = true;
                break;
            }
        }
    }

    /**
     * 获取产品类型列表
     */
    function getProductLists(){
        var serviceUrl = opts[useType].cpEnumUrl,
            pdList = opts[useType].productsList;
        $.ajax({
            type:"POST",
            url:serviceUrl,
            dataType:'json',
            data:{}
        }).done(function(response){
            var ret = response.result||[],item = null;
            for(var i=0;i<ret.length;i++){
                item = new Object();
                item.id = ret[i].cplxid;
                item.name =  ret[i].cplxmc;
                pdList.push(item);
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