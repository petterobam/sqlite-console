;(function(){

	window.UEDITOR_HOME_URL = "/static/core/component/ueditor/";  //手动设置url，以便于其他模块进行使用
	//创建一个容器
	$.fn.createEditor = function(opts){
		if(!this.length) throw new Error("DOM绑定错误，请确认页面是否渲染完毕");
		var wrapContainer =  this.get(0);
		
		if(this.data("editor")) return;		
		 //构造容器
		 var id = "u-editor-" + String(Math.random(2)).substring(2);
		 
		 var $toolbar = createSwitchToolbar();
		 var $editorContainer = createContainer(id, $(wrapContainer).attr("name") || id);
		 
		 this.append($toolbar).append($editorContainer);
		 
		var myeditor = UE.getEditor(id,opts);
		
		this.data("editor",myeditor);
		
		$toolbar.find("img").data("editor",myeditor);
		
		
		myeditor.ready(function(){
			if(myeditor.options.showSwitchToolbar){
				$("#"+ myeditor.ui.id + "_toolbarbox").find("div").first().hide();
			}else{
				$toolbar.hide();
				$("#"+ myeditor.ui.id + "_toolbarbox").find("div").first().show();
			}
		});
		
		return myeditor;
	}
	
	function createSwitchToolbar(){
		var $div = $('<div class="switch-toolbar" style="height:8px;background:#fafafa;overflow: hidden;border:none;position:relative;"></div>');
		
		var $img = $('<img src="'+btnUrl+'" style="width:16px;height:16px;position: absolute; left: 5px; top:-8px; cursor: pointer;"/>');
		$img.attr("state","close");
		
		$img.on("click",function(){
			switchHandler.call($img);
		});
		
		$div.append($img);
		
		return $div;
	}
	/**
	 * 创建富文本编辑器的容器
	 * @param {Object} id
	 * @param {Object} name 这里的name是获取外层容器上的name，配置了是为了更好的序列化
	 */
	function createContainer(id,name){
		return $('<div id="'+id+'" name="'+name+'"></div>')
	}
	
	function switchHandler(){
		var myeditor =  $(this).data("editor");
		if($(this).attr("state") === "close"){ //打开
			$(this).css("top",0);
			$(this).attr("state","open");
			$("#"+ myeditor.ui.id + "_toolbarbox").find("div").first().show();
		}else{ //关闭
			$(this).css("top","-8px");
			$(this).attr("state","close");
			$("#"+ myeditor.ui.id + "_toolbarbox").find("div").first().hide();
		}
	}
	
	
	
	
	
	
	
	
	
	var btnUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAu0lEQVQ4T63RwQ3CMAwF0O/AHUbpCIxAxQDAFXFglEpInDMBXaEjMAodgBqFFLVJ7JADOVVK/3NsE3LnfLcg7nDdWe03UvOfMPb+no8aIgNB+FtCRlJADOtICGTDMjIBReEU8cCprWCGbXYj8eXSNGjqp76FQu1PwKVd48UWjFVRYUKPBR3CFvwcOhDlEeYeg9ngVj9csbCFX0gUToFpI+lLhLAMSIgS1oE54r5nPcdDzq/RzcSdcWDSht5VplgRYt131wAAAABJRU5ErkJggg==";
	
})();
