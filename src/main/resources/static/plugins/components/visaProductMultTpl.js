/**
 * Created by sing on 2018/1/4.
 * 用户多选控件
 */
define(function (require, exports, module) {
    var Common = require("../js/Common");
    var base = require("/static/plugins/components/base.js");
    var lv = require("/static/plugins/vue/LVForm.js");
    var grid_selector = "#vetech-merchants-gridContainer";
    var pager_selector = "#vetech-merchants-pager";
    require("../core/jqGrid/js/jqGridExtend.js");
    require("vue2");

    var $container = null,app = null;
    var queryObj = {
        gjmc:"",
        gjdm:"",
        qzmc:"",
        qzlx:""
    };

    var opts = {
        cbFn:null, //回调函数
        ids:"",
        userListUrl:"/cds-visa/cpsa/visa/getByIds",
        userGridUrl:"/cds-visa/cpsa/visa/queryProductList"
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
                getCityListByIds();
            },
            methods:{
                clearDept:function(){
                },
                clearGroup:function(){
                }
            },
            updated:function(){
                layui.form.render();
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
            type:"POST",
            url:opts.userListUrl,
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
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.qzmc+'">'+item.qzmc+'</span></li>');
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
            colNames: ["国家", "签证名称","签证类型","套餐类型","签证id"],
            colModel: [
                {name: 'gjmc', index: 'gjmc', width: 100},
                {name: 'qzmc', index: 'qzmc', width: 140},
                {name: 'qzlxmc', index: 'qzlxmc', width: 80},
                {name: 'tcflmc', index: 'tcflmc', width: 80},
                {name: 'qzid', index: 'qzid', width: 0,hidden:true}
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
            if($(this).data("data").qzid === rowObject.qzid){
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
            if(tempData.qzid === rowObject.qzid){
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
            if(data.qzid === rowObject.qzid){
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
        base.initTravelCountry({
            el:"nation",
            type:1,
            hiddenName:"gjdm",
            cbFn:function(data){
                //console.log(data);
                queryObj.gjmc = data.mc;
                queryObj.gjdm = data.id;
            }
        });
    }

});