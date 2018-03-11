/**
 * Created by sing on 2017/11/13.
 * 用户多选控件
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";
    require("../core/jqGrid/js/jqGridExtend.js");
    require("vue2");

    base.initDept();
    base.initGroup();

    var $container = null,app = null;
    var queryObj = {
        xm:"",
        deptmc:"",
        deptid:"",
        groupmc:"",
        groupid:"",
        id:"" //工号
    };

    var opts = {
        cbFn:null, //回调函数
        ids:"",
        userListUrl:"/base/rest/kj/veuser/getUserListByBhs",
        userGridUrl:"/base/rest/kj/veuser/selectUserPage"
    };

    $(document).ready(function(){
        opts.ids = $("#ids").val();
        opts.cbFn = $("#cbFn").val();
        $container = $(".shChooseContainer");
        app = new Vue({
            el:"#app1",
            data:queryObj,
            mounted:function () {
                initPlugins();
                getCityListByIds();
            },
            methods:{
                clearDept:function(){
                    queryObj.deptid = "";
                    queryObj.deptmc = "";
                    queryObj.groupid = "";
                    queryObj.groupmc = "";
                },
                clearGroup:function(){
                    queryObj.groupid = "";
                }
            }
        });
        initUserGrid();
        bindEvent();
    });

    function getQueryObj(){
        return queryObj;
    }

    /**
     * 根据城市编号获取城市集合
     */
    function getCityListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            url:opts.userListUrl,
            data:{
                bhs:opts.ids
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
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.xm+'">'+item.xm+'</span></li>');
        $li.data("data",item);
        return $li;
    }

    /**
     *初始化城市grid
     */
    function initUserGrid(){
        var height=$(grid_selector).parent().height()-70;
        $(grid_selector).initGrid({
            url:opts.userGridUrl,
            height: height,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["工号", "姓名","部门","组"],
            colModel: [
                {name: 'bh', index: 'bh', width: 100},
                {name: 'xm', index: 'xm', width: 100},
                {name: 'deptmc', index: 'deptmc', width: 100},
                {name: 'groupmc', index: 'groupmc', width: 100}
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
            if($(this).data("data").bh === rowObject.bh){
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
            if(tempData.bh === rowObject.bh){
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
            if(data.bh === rowObject.bh){
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
        $("#dept").dept({
            hiddenName:"deptHidden",
            cascade:true,
            cascadeOpts:{
                inputId:"group",
                hiddenId:"groupHidden"
            },
            cbFn:function(data){
                queryObj.deptmc = data.mc;
                queryObj.deptid = data.bh;
                queryObj.groupmc = "";
                queryObj.groupid = "";
            }
        });
        $("#group").group({
            hiddenName:"groupHidden",
            cascade:true,
            cascadeOpts:{
                inputId:"dept",
                hiddenId:"deptHidden"
            },
            cbFn:function(data){
                queryObj.groupmc = data.mc;
                queryObj.groupid = data.bh;
            }
        });
    }

});
