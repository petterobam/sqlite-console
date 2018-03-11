/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:  导出表格功能
 * @linc: MIT
 */
define(function (require, exports, module) {
    require("store");
    require("vue2");
    var lvForm = require("/static/plugins/vue/LVForm.js"),
        mkName  = "";
    var enums={};//保存所有的枚举类型
    var pt={};//所属平台
    cacheData = {}; //缓存数据，方便取出

    var app1,app2,saveMbIndex;
    $(document).ready(function(){
        var keyId = $("#keyId").val(),
            params =  store.get(keyId);
        mkName = params.mkName;
        pt = params.pt;

        var newParams = formartData(params);
        params = null;

        app1 = new Vue({
            el:"#app1",
            data:{
                gridParams:newParams,
                list:[],
                defaultMb:"", //默认模板
                mbList:[]
            },
            mounted:function(){
                lvForm.listenFormEvent(this);
                layui.form.render();
                layui.element.init();
                var _this = this;
                getMbsByMk(function(data){
                    _this.$data.mbList = data.result;
                    $.each(data.result,function(i,item){
                        //默认模板进行回填
                        if(item.ifmr) {
                            initMb.call(_this,item);
                            return false;
                        }
                    });
                });
            },
            methods:{
                checkedAllHandler:function(ev){
                    var $target = $(ev.target),
                        index = $target.attr("index"),
                        currObj = this.$data.gridParams.resultList[index];
                    if(currObj.isChecked){
                        for(var i = 0,len = currObj.childs.length;i<len;i++){
                            currObj.checkedArr.push(currObj.childs[i].index);
                        }
                    }else{
                        currObj.checkedArr = [];
                    }
                },
                checkedHandler:function(ev){
                    var $target = $(ev.target),
                        index = $target.attr("index"),
                        currObj = this.$data.gridParams.resultList[index];
                    currObj.isChecked = currObj.childs.length === currObj.checkedArr.length;
                },
                exportImmediately:function () {
                    var opts = this.$data.gridParams;
                    var param = opts.postData;
                    param.data = opts.qDatas;
                    var result = {
                        url:opts.url,
                        lx:2,
                        mk:mkName,
                        enums:getEnums(),
                        param:JSON.stringify(param),
                        field:JSON.stringify(this.$data.list)
                    };
                    exportTask(1,result);//立即导出
                },
                opCheckedAll:function(){ //全选操作
                    var list = this.$data.gridParams.resultList;
                    for(var i = 0 , len = list.length;i<len;i++){
                        var item = list[i];
                        if(item.checked) item.checked = [item.index];
                        if(item.hasOwnProperty("isChecked")) item.isChecked = true; //分组表头
                        if(item.checkedArr){
                            var tempArr = [];
                            for(var j = 0;j<item.childs.length;j++){
                                tempArr.push(item.childs[j].index);
                            }
                            item.checkedArr = tempArr;
                        }
                    }

                },
                opUnCheckedAll:function(){ //反选操作
                    var list = this.$data.gridParams.resultList;
                    for(var i = 0 , len = list.length;i<len;i++){
                        var item = list[i];
                        if(item.checked) item.checked = item.checked.length ? [] : [item.index];
                        if(item.hasOwnProperty("isChecked")) item.isChecked = !item.isChecked; //分组表头
                        if(item.checkedArr){
                            var tempArr = [];
                            for(var j = 0;j<item.childs.length;j++){
                                if($.inArray(item.childs[j].index,item.checkedArr) === -1){
                                    tempArr.push(item.childs[j].index);
                                }
                            }
                            item.checkedArr = tempArr;
                            //只有当选中的个数和总数相同时，头部才能被选中
                            if(item.hasOwnProperty("isChecked")) item.isChecked = item.checkedArr.length === item.childs.length ? true : false; //分组表头
                        }
                    }
                },
                clearAll:function(){
                    var list = this.$data.gridParams.resultList;
                    for(var i = 0 , len = list.length;i<len;i++){
                        var item = list[i];
                        if(item.checked) item.checked = [];
                        if(item.hasOwnProperty("isChecked")) item.isChecked = false; //分组表头
                        if(item.checkedArr) item.checkedArr = [];
                    }
                },
                upHandler:function(){ //向上操作
                    setSxhHandler.call(this,-1);
                },
                downHandler:function(){ //向下操作
                    setSxhHandler.call(this,1);
                },
                resetHandler:function(){ //重置顺序号
                    resetSxhHandler.call(this);
                },
                closeWindow:function(){
                    var index = parent.layui.layer.getFrameIndex(window.name);
                    parent.layui.layer.close(index);
                    store.remove(keyId);
                },
                delayExport:function(){//延迟导出
                    var opts = this.$data.gridParams;
                    var param = opts.postData;
                    param.data = opts.qDatas;
                    var result = {
                        url:opts.url,
                        lx:3,
                        mk:mkName,
                        enums:getEnums(),//枚举值
                        param:JSON.stringify(param),
                        field:JSON.stringify(this.$data.list)
                    };
                    exportTask(0,result);
                },
                saveThisMb:function(){
                    //如果选择了模板，直接给模板id
                    var currMbId =this.$data.defaultMb;
                    if(currMbId){
                        var param={
                            id:currMbId,
                            pt:getPt(),
                            field:JSON.stringify(app1.$data.list),
                            mk:mkName
                        };
                        saveMb(param);
                    }else{
                        saveMbIndex = layui.layer.open({
                            title:"编辑模板",
                            type:1,
                            area:["300px","160px"],
                            success:function(){
                                initApp2();
                                layui.form.render();
                            },
                            content:$("#saveMbContent").html()
                        });
                    }
                },
                saveNewMb:function(){
                    var param={
                        mbmc:'',
                        pt:getPt(),
                        field:JSON.stringify(this.$data.list),
                        mk:mkName,
                        mbmc:mkName
                    }
                    saveMbIndex = layui.layer.open({
                        title:"创建模板",
                        type:1,
                        area:["300px","160px"],
                        success:function(){
                            initApp2();
                            layui.form.render();
                        },
                        content:$("#saveMbContent").html()
                    });
                    /* postJSON('/vereport/rest/report/saveMb',JSON.stringify(param),function(res){
                     // console.dir(res);
                     if(res['result']==true){
                     layer.alert('模板保存成功.', {icon: 6});
                     }else{
                     layer.alert('模板保存失败', {icon: 2});
                     }
                     })*/
                },
                delThisMb:function(){
                    //当前选中的mbid
                    var currMbId =this.$data.defaultMb;
                    if(currMbId==undefined||currMbId==null||currMbId==''){
                        layer.alert('请选择需要操作删除的模板', {icon: 2});
                        return;
                    }
                    postJSON('/vereport/rest/report/delMb?mbid='+currMbId,{'mbid':currMbId},function(res){
                        // console.dir(res);
                        if(res['result']==true){
                            layer.alert('模板删除成功.', {icon: 6,yes:function () {
                                window.location.reload();
                            }});
                        }else{
                            layer.alert('模板删除失败', {icon: 2});
                        }
                    });
                }
            },
            updated:function(){
                layui.form.render();
                layui.element.init();
            },
            watch:{
                gridParams:{
                    deep:true,
                    handler:function(){
                        resetSxhHandler.call(this);
                    }
                },
                defaultMb:function(newVal,oldVal){
                    var _this = this;
                    $.each(this.$data.mbList,function(i,item){
                        if(item.id === newVal){
                            initMb.call(_this,item);
                            return false;
                        }
                    });
                }
            }
        });

        layui.form.render();

    });
    /**
     * 获取平台默认cpsa
     * @returns {*}
     */
    var getPt = function () {
        return (pt == null || pt == '') ? 'CPSA' : pt;
    }

    /**
     * 初始化app2
     */
    function initApp2(){
        app2 = new Vue({
            el:"#app2",
            data:{
                mbName:"",
                sfmr:"1"
            },
            methods:{
                saveHandler:function(){
                    var param={
                        id:'',
                        pt:getPt(),
                        field:JSON.stringify(app1.$data.list),
                        mk:mkName,
                        mbmc:this.$data.mbName,
                        sfmr:this.$data.sfmr
                    };
                    saveMb(param);
                    layui.layer.close(saveMbIndex);
                },
                closeHandler:function(){
                    layui.layer.close(saveMbIndex);
                }
            }
        });
    }


    /**
     * 保存模板
     */
    function saveMb(param){
        console.log("要保存的数据",param);
        // debugger;
        if(app1.$data.list.length){
            postJSON('/vereport/rest/report/saveMb',JSON.stringify(param),function(res){
                // console.dir(res);
                if(res['result']==true){
                    layer.alert('模板保存成功.', {icon: 6,yes:function () {
                        window.location.reload();
                    }});
                }else{
                    layer.alert('模板保存失败', {icon: 2});
                }
            })
        }else{
            layer.alert('请选择要导出的字段数据...', {icon: 2});
        }


    }

    /**
     * 初始化模板信息
     */
    function initMb(item){
        this.$data.defaultMb = item.id;
        if(item.field){
            this.$data.list = JSON.parse(item.field);
        }else{
            this.$data.list = [];
        }

        var resultList = this.$data.gridParams.resultList;
        var tempList = this.$data.list;
        for (var i = 0, len = resultList.length; i < len; i++) {
            var item = resultList[i];
            if(item.isMerge){
                var childs = item.childs;
                for (var j = 0, len2 = childs.length; j < len2; j++) {
                    if(isExist(childs[j].index,tempList)){
                        item.checkedArr.push(childs[j].index);
                    }else{
                        deleteValFromArr(childs[j].index,item.checkedArr);
                    }
                }
                item.isChecked = item.checkedArr.length === childs.length;
            }else{
                if(isExist(item.index,tempList)){
                    item.checked.push(item.index);
                }else{
                    item.checked = [];
                }
            }
        }

    }

    /**
     * 判断是否存在
     * @param value
     * @param arr
     */
    function isExist(value,arr){
        for(var i = 0,len = arr.length; i<len; i++){
            if(value === arr[i].index) return true;
        }
        return false;
    }

    /**
     * 从数组中删除某个元素
     * @param value
     * @param arr
     */
    function deleteValFromArr(value,arr){
        for(var i = 0,len = arr.length; i<len; i++){
            if(value === arr[i].index) arr.splice(i,1);
        }
    }


    /**
     * post方式请求数据
     * @param url url链接
     * @param data 需要发送的数据
     * @param callback 回调函数
     */
    function postJSON(url, data, callback,contentType) {
        if(contentType==undefined){
            contentType= 'application/json';
        }
        // debugger;
        return $.ajax({
            'type' : 'POST',
            'url' : url,
            'contentType' :contentType,
            'data' : data,
            'dataType' : 'json',
            'success' : callback
        });
    }
    /**
     * 任务导出
     * @param lx 任务类型
     */
    var exportTask=function(lx,result){ //导出
        if(app1.$data.list.length){
            postJSON('/vereport/rest/reporttask/addTask',JSON.stringify(result),function(res){
                var id=res['result'];
                if(id!=null){
                    if(lx=='1'){
                        //立即导出
                        var  timer;
                        layer.alert("任务已创建成功，可以至任务管理进行操作或或等待任务执行完毕",{icon:6,yes:function () {
                            window.location.reload();
                        },end:function(){
                            clearInterval(timer);
                        }});
                        timer = setInterval(function(){
                            $.ajax({
                                url:"/vereport/rest/reporttask/getRw",
                                data:{'id':id},
                                type : 'POST',
                                success:function(data){
                                    if(data['result']['zt']==3){
                                        clearInterval(timer);
                                        layer.alert('<a href="/vereport/rest/reporttask/download?id='+id+'" target="_blank">下载</a>', {icon: 6,yes:function () {
                                            window.location.reload();
                                        }});
                                    }
                                }
                            });
                        },500);
                    }else{
                        //延迟导出
                        layer.alert('任务创建成功,请至任务管理查看导出进度.', {icon: 6});
                    }
                }else{
                    layer.alert('任务创建失败,请稍后再试或联系管理员...', {icon: 2});
                }
            })
        }else{
            layer.alert('请选择要导出的字段数据...', {icon: 2});
        }
    }
    /**
     * 查询模板
     * @param callback
     */
    function getMbsByMk(callback){
        $.ajax({
            'type' : 'POST',
            'url' : '/vereport/rest/report/getMbsByMk',
            'data' : {'mk':mkName},
            'dataType' : 'json',
            'success' : callback
        });
    }
    /**
     * 设置顺序号
     * @param state number ,接收两个值1和-1,1表示向下，-1表示向上
     */
    function setSxhHandler(state){
        var index = parseInt($("#sortList").find('option:selected').attr("index"),10);

        if(state === -1 && index === 0) return;
        if(state === 1 && index === this.$data.list.length-1) return;

        this.$data.list[index].sxh = index + state;
        $("#sortList").get(0).selectedIndex = index + state;
        this.$data.list[index + state].sxh =index;
        var tempList = $.extend(true,[],this.$data.list);
        tempList.sort(function(a,b){
            return a.sxh  - b.sxh;
        });
        this.$data.list  =tempList;
    }

    function resetSxhHandler(){
        var tempList = getSaveData(this.$data.gridParams);
        tempList = $.extend(true,[],tempList);
        //按照列所在的顺序号进行排序，让其在右侧能够顺序展示
        tempList.sort(function(a,b){
            return a.sxh - b.sxh;
        });

        //重置要展示的顺序号的实际值
        for(var i = 0 ;i<tempList.length;i++){
            tempList[i].sxh = i;
        }
        this.$data.list =tempList;
    }


    /**
     * 获取要导出的
     * @param gridParams
     */
    function getSaveData(gridParams){
        cacheData = $.extend(true,{},cacheData);
        var arr =[],
            list = gridParams.resultList;
        if(gridParams.hasGroup){
            for(var i=0,len = list.length;i<len;i++){
                var checkedArr = list[i].checkedArr,
                    name = list[i].name;
                if(checkedArr && $.type(checkedArr) === "array"){
                    for(var j =0, len2 = checkedArr.length;j<len2;j++){
                        var obj = cacheData[checkedArr[j]];
                        obj.prefix = name;
                        arr.push(obj);
                    }
                }else{
                    if(list[i].checked.length){
                        var obj =cacheData[list[i].checked[0]];
                        delete obj.checked;
                        arr.push(obj);
                    }

                }
            }
        }else{
            for(var k =0, len3= list.length;k<len3;k++){
                var item = list[k];
                if(item.checked.length){
                    var obj = cacheData[item.checked[0]];
                    delete obj.checked;
                    arr.push(obj);
                }
            }
        }
        return arr;
    }

    /**
     * 格式化数据
     * @param params
     */
    function formartData(params){
        var colModel = params.colModel,
            colNames = params.colNames,
            hasGroup = false, //是否有分组
            groupHeader = params.groupHeader;

        var arr = [],
            resultList = [],
            cache = {}; //缓存每列对应的序号
        for(var i =0,len = colNames.length;i<len;i++){
            //TODO:这里还需要确认下，看要把哪些参数获取到
            var obj = {
                name: colNames[i],
                index: colModel[i].name,
                sxh:i,
                checked:[] //标记是否选中
            };
            cache[obj.index] = i;
            cacheData[obj.index] = obj;
            arr[i] = obj;
        }

        //有表头合并的情况
        var lastCount = 0;
        if (groupHeader && groupHeader.length) {
            var groupHeaders = groupHeader[0].groupHeaders;
            hasGroup = true;
            var tempObj, start, num, title,newItem;
            for (var j = 0, len2 = groupHeaders.length; j < len2; j++) {
                tempObj = groupHeaders[j];
                start = tempObj.startColumnName;
                num = tempObj.numberOfColumns;
                title = tempObj.titleText;

                if(cache[start] !== lastCount){
                    resultList = resultList.concat(arr.slice(lastCount,cache[start]));
                    lastCount = cache[start];
                }

                newItem = {
                    name:title,
                    isMerge:true,  //标记是合并的表头
                    isChecked:false,
                    checkedArr:[],
                    childs:arr.slice(cache[start],cache[start]+num)
                };
                resultList.push(newItem);
                lastCount = cache[start] +num;
            }
            if(cache[start] + num !== arr.length){
                resultList =  resultList.concat(arr.slice(cache[start]+num,arr.length));
                lastCount = arr.length;
            }
        }else{
            resultList = arr;
        }
        return {
            url:params.url,
            hasGroup:hasGroup,
            qDatas:params.qDatas,
            postData:params.postData,
            resultList:resultList
        }
    }

    /**
     * 获取枚举
     */
    var getEnums=function(){
        var res=null;
        if('string' ==typeof enums){
            res=enums;
        }else if('object' ==typeof enums){
            res=JSON.stringify(enums);
        }else{
            res=JSON.stringify({});
        }
        return res;
    }
});
