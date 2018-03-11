/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:ztree右键菜单效果（只有需要右键菜单的时候，才用引用此模块）
 * @linc: MIT
 *
 */
define(function(require,exports,module){

    require("ztree");

    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultSettings = {
        callback:{
            onRightClick:rightClickHandler, //右键菜单事件
            menuClick:menuClickHandler, //菜单点击事件
            getMenuData: function(treeNode){return [];} //根据返回的treeNode获取要显示的菜单集合 [{text:"新增部门",click:"clickHandler"}]
        }
    };
    var zTree,$rMenu;


    /**
     * 初始化ztree
     * @param settings
     * @param zNodes
     */
    $.fn.initZtree = function(settings,zNodes){

        settings = $.extend(true,{},defaultSettings,settings);

        zTree =  $.fn.zTree.init(this, settings, zNodes);

        $rMenu = $('<div id="rMenu">');
        $(document.body).append($rMenu);

        $rMenu.on("click","li",menuClickHandler);

        return zTree;
    };


    /**
     * 菜单点击事件
     */
    function menuClickHandler(){
        var menuItem = $(this).data("menuItem"),
            clickFn = menuItem.click,
            menuClick =  zTree.setting.callback.menuClick,
            selectNode = zTree.getSelectedNodes();
        if(clickFn && window[clickFn]){
            window[clickFn].call(null,selectNode,menuItem);
        }else{
            menuClick && menuClick(selectNode,menuItem);
        }
        $rMenu.css({"visibility" : "hidden"});
    }

    /**
     * 右键菜单点击事件
     */
    function rightClickHandler(event,treeId,treeNode){
        var setting = zTree.setting;
        var menuData = setting.callback.getMenuData(treeNode);
        if($.type(menuData) !== "array") throw new Error("数据格式错误，菜单数据要求array");
        if(menuData.length === 0) return; //如果没有返回菜单数据，就不使用右键菜单功能。

        var $ul = $('<ul>');
        for(var i = 0, len = menuData.length;i < len;i++){
            var menuItem = menuData[i];
            var $li = $('<li>'+(menuItem.text || "")+'</li>'); //创建一个li节点
            $li.data("menuItem",menuItem);
            $ul.append($li);
        }

        $rMenu.empty().append($ul);
        if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
            zTree.cancelSelectedNode();
            showRMenu(event.clientX, event.clientY);
        } else if (treeNode && !treeNode.noR) {
            zTree.selectNode(treeNode);
            showRMenu(event.clientX, event.clientY);
        }
    }

    function showRMenu( x, y) {
        $rMenu.show().css({"top":y+"px", "left":x+"px", "visibility":"visible"});
        $("body").bind("mousedown", onBodyMouseDown);
    }

    function onBodyMouseDown(event){
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
            $rMenu.css({"visibility" : "hidden"});
        }
    }

});