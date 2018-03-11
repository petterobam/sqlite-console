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

    base.initJdpp();

    var $container = null,app = null,cacheRequestData = [];
    var queryObj = {
        ppid:""
    };

    var opts = {
        cbFn:null,
        ids:"",
        userListUrl:"/cds-hotel/cds/hotel/brand/brandByIds",
        userGridUrl:"/cds-hotel/cds/hotel/brand/list"
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
                initComponent(); //初始化酒店名称控件；
                getJdppListByIds();
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
     * 根据品牌id去获取品牌集合
     */
    function getJdppListByIds(){
        var $container = $(".vetech-merchants-list");
        $.ajax({
            type:"POST",
            url:opts.userListUrl,
            data:{ppids:opts.ids},
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
        var $li = $('<li><a href="javascript:;" class="layui-inline red iconfont icon-close-circle"></a><span class="layui-inline" title="'+item.zwjc+'">'+item.zwjc+'</span></li>');
        $li.data("data",item);
        return $li;
    }

    /**
     *初始化酒店品牌产品grid
     */
    function initScenicAreaGrid(){
        var height=$(grid_selector).parent().height()-70;
        $(grid_selector).initGrid({
            url:opts.userGridUrl,
            height: height,
            shrinkToFit:true,
            qDatas:getQueryObj,
            colNames: ["品牌简称","品牌全称","品牌ID"],
            colModel: [
                {name: 'zwjc', index: 'zwjc', width: 135},
                {name: 'zwqc', index: 'zwqc', width: 195},
                {name: 'ppid', index: 'ppid', width: 50}
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
                rowObject = getRawItemData(rowObject,cacheRequestData,"ppid");
                state ?  addCheckedCity(rowObject) :delCheckedCity(rowObject);
            },
            onSelectAll:function(ids,state){
                for(var i = 0 ; i < ids.length;i++){
                    var rowObject = $(grid_selector).getRowData(ids[i]);
                    rowObject = getRawItemData(rowObject,cacheRequestData,"ppid");
                    state === true ? addCheckedCity(rowObject) : delCheckedCity(rowObject);
                }
            }
        });
    }

    /**
     * 添加已经选择的品牌名称
     * @param rowObject
     */
    function addCheckedCity(rowObject){
        var $leftContainer = $container.find(".vetech-merchants-list"),
            isExist = false; //是否存在
        //1、先判断是否重复添加
        $leftContainer.find("li").each(function(){
            if($(this).data("data").ppid == rowObject.ppid){
                isExist = true;
                return false;
            }
        });
        if(!isExist){
            $leftContainer.append(createLi(rowObject));
        }
    }

    /**
     * 删除已经被选择的品牌名称
     * @param rowObject
     */
    function delCheckedCity(rowObject){
        app2.$data.total-=1;
        $container.find(".vetech-merchants-list").find("li").each(function(){
            var tempData = $(this).data("data");
            if(tempData.ppid == rowObject.ppid){
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
            if(data.ppid == rowObject.ppid){
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
            var result = delCheckedCity(data);
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
     * 初始化品牌控件
     */
    function initComponent(){
        $("#ppmc").addJdpp({
            hiddenName:"ppidhidden",
            inputExecCallback:true,
            cbFn:function(data,name){
                if(name){
                    $("#ppidhidden").val("");
                }
                queryObj.ppid = $("#ppidhidden").val();
            }
        });
    }

    /**
     * 获取服务器返回的原始行数据
     */
    function getRawItemData(row,orgData,key){
        var newItem = {};
        for(var i= 0,len=orgData.length;i<len;i++){
            if(row[key] == orgData[i][key]){
                $.extend(true,newItem,orgData[i]);
                break;
            }
        }
        return newItem;
    }

});
