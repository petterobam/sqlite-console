/**
 * 文件上传逻辑
 */
$(function(){
    var picExt = ["gif","jpeg","png","jpg","bmp"],
        docExt = ["doc","xls","pdf","docx","xlsx","ppt"],
        fileExt =["rar","zip","txt","cer","jks","crt","p12","p8","pem","pfx","key"],
        allExt = picExt.concat(docExt).concat(fileExt);
    var ext = {
        img:picExt,
        doc:docExt,
        file:fileExt,
        all:allExt
    };
    var result = parseQueryString(window.location.href);
    var fileSize = result["size"]||3072000;
    var fileType = result["type"]||"all";
    var uploadType = result["uploadType"] || "single";
    var fileReg = new RegExp("\.("+ext[fileType].join("|")+")$","i");
    var service = "/system-dfs/cps/opera/upload/"+result.appName+"?size="+fileSize+"&type="+fileType;
    var deleteUrl = "/system-dfs/cps/opera/deleteFile";
    var template = document.getElementById("template-item").innerHTML;

    if(uploadType === "single"){
        $(".fileupload-buttonbar .start").hide();
        $(".fileupload-buttonbar input[type='file']").removeAttr("multiple");
    }

    //保存添加的数据
    var fileData = [];

    $('#fileupload').fileupload({
        url:service,
        minFileSize:0,
        autoUpload:(uploadType == "single")?true:false,
        maxFileSize:fileSize,
        dataType: 'json',
        add:function(e,data){
            if(!data.files.length) return ;
            data.files[0].cid = (new Date()).getTime();
            var itemData = {
                file:data.files[0],
                autoUpload:$(this).fileupload('option', 'autoUpload')
            };
            layui.laytpl(template).render(itemData,function(htm){
                $(".files").append(htm);
                layui.element.init();
                if(!fileReg.test(itemData.file.name)){
                    $(".files tr[data-index='"+data.files[0].cid+"']").find(".text-danger").text("文件格式错误");
                    $(".files tr[data-index='"+data.files[0].cid+"']").find(".start").attr("disabled","disabled");
                    $(".files tr[data-index='"+data.files[0].cid+"']").find(".cancel").show();
                }
            });
            fileData.push(data);
            if (e.isDefaultPrevented()) {
                return false;
            }
            if (data.autoUpload || (data.autoUpload !== false &&
                $(this).fileupload('option', 'autoUpload'))) {
                fileReg.test(itemData.file.name) && data.process().done(function () {
                    data.submit();
                });
            }
        },
        fail:function(e,data){
            var id = data.files[0].cid;
            $(".files tr[data-index='"+id+"']").find(".text-danger").text("上传失败");
            layui.element.progress(id,"0%");
        },
        done:function(e,data){
            var id = data.files[0].cid,
                $dom =$(".files tr[data-index='"+id+"']");
            $dom.find(".cancel").hide();
            $dom.find(".delete").show();
            $dom.find(".start").attr("disabled","disabled");
            $dom.data("fileData",data.result);
        },
        progress:function(e,data){
            var id = data.files[0].cid;
            if (e.isDefaultPrevented()) {
                return false;
            }
            var progress = Math.floor(data.loaded/data.total*100);
            layui.element.progress(id, progress+"%");
            setProgress(id,"100%");
        }
    });

    function setProgress(id,value){
        setTimeout(function(){
            layui.element.progress(id,value);
        },500);
    }

    //取消上传操作
    $(".files").on('click',".cancel",function(e){
        var tr = $(e.target).closest("tr"),
            cid = tr.attr("data-index");
        tr.remove();
        cancelUploadEvent(cid);
    });
    //上传操作
    $(".files").on('click',".start",function(e){
        var tr = $(e.target).closest("tr"),
            cid = tr.attr("data-index");
        $.each(fileData, function(i,file) {
            if(file.files[0].cid == cid){
                file.process().done(function(){
                    file.submit();
                });
            }
        });
    });
    //批量上传操作
    $(".fileupload-buttonbar .start").on('click',function(e){
        $(".files").find(".start").trigger("click");
    });
    //删除操作
    $(".files").on('click',".delete",function(e){
        var tr = $(e.target).closest("tr"),
            cid = tr.attr("data-index");
        var opts = $(e.target).parents("tr").data("fileData");
        if(opts){
            $.ajax({
                type:"post",
                url:deleteUrl,
                data:{
                    filePath:opts.result
                },
                success:function(){
                    cancelUploadEvent(cid);
                    tr.remove();
                },
                error:function(){
                    tr.find(".text-danger").text("服务异常");
                }
            });
        }
    });
    //确定并关闭
    $(".sureBtn").on("click",function(){
        var cbFnName = result["fnName"];
        var cache = [],temp = null;
        $(".files tr").each(function(i){
            temp = $(this).data("fileData");
            if(temp){
                temp.fileName = $(this).find("p.name").html() || "";
                cache[cache.length] = temp;
            }
        });
        cache.length && window.parent[cbFnName] && window.parent[cbFnName](cache);
    });
    //取消上传---删除前端数据
    function cancelUploadEvent(cid){
        if((fileData.length==0)||!cid) return ;
        for(var i=0;i<fileData.length;i++){
            if(fileData[i].files[0].cid == cid){
                fileData.splice(i,1);
                i--;
            }
        }
    }
    //解析url上的查询参数
    function parseQueryString(url){
        var tempAarr;
        var result ={};
        url = url.split("#")[0];
        tempAarr = url.split("?");
        tempAarr.shift();
        var queryStr = tempAarr.join("?");
        if($.trim(queryStr).length === 0){
            return result;
        }
        tempAarr = queryStr.split("&");
        for(var i = 0, len = tempAarr.length;i<len;i++){
            var itemArr = tempAarr[i].split("=");
            result[itemArr[0]] = itemArr[1];
        }
        return result;
    }

});

