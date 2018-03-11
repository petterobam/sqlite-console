/**
 * Created by sing on 2018/1/8.
 * @描述:景区选择控件
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var lv = require("/static/plugins/vue/LVForm.js");
    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";
    require("../core/jqGrid/js/jqGridExtend.js");
    require("vue2");

    base.initProvinceMult();

    var $container = null,app = null,cacheRequestData = [];
    var queryObj = {
        jqmc:"",
        sssfmc:"",
        sssf:"",
        lb1:""
    };

    var opts = {
        cbFn:null,
        ids:"",
        userListUrl:"/cds-mp/cpsa/mp/getJqByIds",
        userGridUrl:"/cds-mp/cpsa/mp/sceneryQuerySceneryList"
    };

    $(document).ready(function(){
        opts.ids = $("#ids").val();
        opts.cbFn = $("#cbFn").val();
        $container = $(".shChooseContainer");
        app = new Vue({
            el:"#app1",
            data:queryObj,
            mounted:function () {
                layui.form.render();
                lv.listenFormEvent(this);
                initPlugins();
                getScenicAreaListByIds();
            },
            methods:{
            },
            updated:function(){
                layui.form.render();
            }
        });
        initScenicAreaGrid();
        bindEvent();
    });

    function getQueryObj(){
        return queryObj;
    }

    /**
     * 根据编号获取城市集合
     */
    function getScenicAreaListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            type:"POST",
            url:opts.userListUrl,
            data:JSON.stringify({jqid:opts.ids}),
            contentType:"application/json",
            success:function(data){
                if(data && data.result && data.result.length){
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
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.jqmc+'">'+item.jqmc+'</span></li>');
        $li.data("data",item);
        return $li;
    }

    /**
     *初始化景区grid
     */
    function initScenicAreaGrid(){
        var height=$(grid_selector).parent().height()-70;
        $(grid_selector).initGrid({
            url:opts.userGridUrl,
            height: height,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["景区名称", "所属城市","景区类别","景区编号"],
            colModel: [
                {name: 'jqmc', index: 'jqmc', width: 200},
                {name: 'sscsmc', index: 'sscsmc', width: 100},
                {name: 'lb1mc', index: 'lb1mc', width: 80},
                {name: 'jqid', index: 'jqid', width: 0,hidden:true}
            ],
            viewrecords: true,
            multiselect:true,
            loadComplete:function(xhr){
                cacheRequestData = xhr.result.records||[];
                $container.find(".vetech-merchants-list").find("li").each(function(){
                    updateGridChecked($(this).data("data"));
                });
            },
            pager: pager_selector
        });

        $(grid_selector).jqGrid('setGridParam', {
            onSelectRow : function(id,state,ev) {
                var rowObject = $(grid_selector).getRowData(id);
                rowObject = getRawItemData(rowObject,cacheRequestData,"jqid");
                state ?  addCheckedCity(rowObject) :delCheckedCity(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    rowObject = getRawItemData(rowObject,cacheRequestData,"jqid");
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
            if($(this).data("data").jqid === rowObject.jqid){
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
            if(tempData.jqid === rowObject.jqid){
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
            if(data.jqid === rowObject.jqid){
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

    /**
     * 初始化插件
     */
    function initPlugins(){
        $("#provice").addProvinceMult({
            hiddenName:"proviceHidden",
            cbFn:function(data){
                queryObj.sssfmc = $("#provice").val();
                queryObj.sssf = $("#proviceHidden").val();
            }
        });
    }

    /**
     * 获取服务器返回的原始行数据
     */
    function getRawItemData(row,orgData,key){
        var newItem = {};
        for(var i= 0,len=orgData.length;i<len;i++){
            if(row[key] === orgData[i][key]){
                $.extend(true,newItem,orgData[i]);
                break;
            }
        }
        return newItem;
    }

});
