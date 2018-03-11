(function(){
	function getBrowserInfo(){
		var agent = navigator.userAgent.toLowerCase() ;
	
		var regStr_ie = /msie [\d.]+;/gi ;
		var regStr_ff = /firefox\/[\d.]+/gi
		var regStr_chrome = /chrome\/[\d.]+/gi ;
		var regStr_saf = /safari\/[\d.]+/gi ;
		//IE
		if(agent.indexOf("msie") > 0){
			return agent.match(regStr_ie) ;
		}
		//firefox
		if(agent.indexOf("firefox") > 0){
			return agent.match(regStr_ff) ;
		}
		//Chrome
		if(agent.indexOf("chrome") > 0){
			return agent.match(regStr_chrome) ;
		}
		//Safari
		if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0){
			return agent.match(regStr_saf) ;
		}
	}
	var browser = getBrowserInfo() ;
	
	var typeInfo = (browser+"").replace(/[0-9.\/; ]/ig,"");
	typeInfo = typeInfo === "msie" ? "IE": typeInfo;
	
	var verinfo = (browser+"").replace(/[^0-9.]/ig,"");
	
	window.BROWSER = {
		type: typeInfo,
		version:verinfo
	};
	
	function addTips(){
		var tips = document.createElement("div");
		tips.style.background = "#fffbee";
		tips.style.height = "30px";
		tips.style.width = "100%";
		tips.style.lineHeight = "30px";
		tips.style.textAlign = "center";
		tips.innerHTML = "您的浏览器版本太低，为了避免影响使用，请升级您的浏览器！";
		if(window.BROWSER.type === "IE" &&  window.BROWSER.version < 8){
			var showTips = document.getElementById("browser-typeAndVersion-info");
			if(showTips){
				showTips.appendChild(tips);
			}else{
				tips.style.position = "fixed";
				tips.style.left = 0;
				tips.style.top = 0;
				document.body.appendChild(tips);
			}
			
		}
	}

	window.addTips = addTips;
	//页面加载完毕以后执行，防止出现错误，IE9兼容模式下
	$(document).ready(function(){
		// addTips();
        console.log(window.location.href);
        if(window.BROWSER.type === "IE" &&  window.BROWSER.version < 9){

        	window.location.href = "/"+appName+"/view/component/browser";
		}

	});

})(window,document);
