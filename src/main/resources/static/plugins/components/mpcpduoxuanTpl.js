/**
 * Created by sing on 2018/1/8.
 * @描述:门票产品选择控件
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
    base.initScenicAreaName();

    var $container = null,app = null,cacheRequestData = [];
    var queryObj = {
        jqid:"",
        sssfList:"",
        cpmc:""
    };

    var opts = {
        cbFn:null,
        ids:"",
        userListUrl:"/cds-mp/cpsa/mp/getJqCpByIds",
        userGridUrl:"/cds-mp/cpsa/mp/queryProductList"
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
                initComponent(); //初始化景区名称和所属省份；
                getMpcpListByIds();
            },
            methods:{
            },
            updated:function(){
                layui.form.render();
            }
        }),
        app2 = new Vue({
            el:"#app2",
            data:{
                total:0
            }
        });
        initScenicAreaGrid();
        bindEvent();
    });

    function getQueryObj(){
        return queryObj;
    }

    /**
     * 根据编号获取景区集合
     */
    function getMpcpListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            type:"POST",
            url:opts.userListUrl,
            data:JSON.stringify({cpid:opts.ids}),
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
        app2.$data.total +=1;
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.cpmc+'">'+item.cpmc+'</span></li>');
        $li.data("data",item);
        return $li;
    }

    /**
     *初始化门票产品grid
     */
    function initScenicAreaGrid(){
        var height=$(grid_selector).parent().height()-70;
        $(grid_selector).initGrid({
            url:opts.userGridUrl,
            height: height,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["景区名称","产品名称","所属城市","产品编号"],
            colModel: [
                {name: 'jqmc', index: 'jqmc', width: 135},
                {name: 'cpmc', index: 'sscsmc', width: 195},
                {name: 'sscsmc', index: 'lb1mc', width: 50},
                {name: 'cpid', index: 'cpid', width: 0,hidden:true}
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
            onSelectRow : function(id,state) {
                var rowObject = $(grid_selector).getRowData(id);
                rowObject = getRawItemData(rowObject,cacheRequestData,"cpid");
                state ?  addCheckedCity(rowObject) :delCheckedCity(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    rowObject = getRawItemData(rowObject,cacheRequestData,"cpid");
                    state === true ? addCheckedCity(rowObject) : delCheckedCity(rowObject);
                }
            }
        });
    }

    /**
     * 添加已经选择的门票产品
     * @param rowObject
     */
    function addCheckedCity(rowObject){
        var $leftContainer = $container.find(".vetech-merchants-list"),
            isExist = false; //是否存在
        //1、先判断是否重复添加
        $leftContainer.find("li").each(function(){
            if($(this).data("data").cpid === rowObject.cpid){
                isExist = true;
                return false;
            }
        });
        if(!isExist){
            $leftContainer.append(createLi(rowObject));
        }
    }

    /**
     * 删除已经被选择的门票产品
     * @param rowObject
     */
    function delCheckedCity(rowObject){
        app2.$data.total-=1;
        $container.find(".vetech-merchants-list").find("li").each(function(){
            var tempData = $(this).data("data");
            if(tempData.cpid === rowObject.cpid){
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
            if(data.cpid === rowObject.cpid){
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
            queryObj.cpmc = $("#cpmc").val();
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
     * 初始化景区控件
     * 初始化省份多选控件
     */
    function initComponent(){
        $("#scenic").scenicAreaName({
            hiddenName:"scenicHidden",
            inputExecCallback:true,
            cbFn:function(data,name){
                if(name){
                    $("#scenicHidden").val("");
                }
                queryObj.jqid = $("#scenicHidden").val();
            }
        });

        $("#provice").addProvinceMult({
            hiddenName:"proviceHidden",
            cbFn:function(){
                if($("#proviceHidden").val()){
                    queryObj.sssfList = $("#proviceHidden").val().split(",");
                }else{
                    queryObj.sssfList=[];
                }

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
