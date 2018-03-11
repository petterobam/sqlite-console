/** index.js By Beginner Emain:zheng_jinfan@126.com HomePage:http://www.zhengjinfan.cn */

var tab;
layui.config({
    base: '/plugins/core/',
    version: new Date().getTime()
}).use(['element', 'layer', 'menu', 'tab'], function () {
    var element = layui.element,
        $ = layui.jquery,
        layer = layui.layer,
        menu = layui.menu;
    tab = layui.tab({
        elem: '.admin-nav-card' //设置选项卡容器
        ,
        maxSetting: {
            max: 8,
            tipMsg: '最多只能打开8个tab页，请尝试关闭其他不用的tab页'
        },
        contextMenu: true,
        openWait:false,
        onSwitch: function (data) {
        },
        closeBefore: function (obj) { //tab 关闭之前触发的事件
            //obj.title  -- 标题
            //obj.url    -- 链接地址
            //obj.id     -- id
            //obj.tabId  -- lay-id
            if (obj.title === 'BTable') {
                layer.confirm('确定要关闭' + obj.title + '吗?', { icon: 3, title: '系统提示' }, function (index) {
                    //因为confirm是非阻塞的，所以这里关闭当前tab需要调用一下deleteTab方法
                    tab.deleteTab(obj.tabId);
                    layer.close(index);
                });
                //返回true会直接关闭当前tab
                return false;
            }else if(obj.title==='表单'){
                layer.confirm('未保存的数据可能会丢失哦，确定要关闭吗?', { icon: 3, title: '系统提示' }, function (index) {
                    tab.deleteTab(obj.tabId);
                    layer.close(index);
                });
                return false;
            }
            return true;
        }
    });
    //iframe自适应
    $(window).on('resize', function () {
        var $content = $('.admin-nav-card .layui-tab-content');
        $content.height($(this).height() - 97);
        $content.find('iframe').each(function () {
            $(this).height($content.height());
        });
    }).resize();


    menu.set({
        "menuId":"admin-navbar-side"
    });
    menu.loadData(menuUrl,function(data){
        //这里取具体数据
        this.data = data.result;
        this.render();
        //this.setActive(this.$nav.find("a").first());
    });
    menu.on("click(menu)",function(data){
        tab.tabAdd(data.field);
    });
    menu.on("mouseenter(menu)",function(){
        alert(222);
    });

    $('.admin-side-toggle').on('click', function () {
        var sideWidth = $('#admin-side').width();
        if (sideWidth === 200) {

            $('#admin-body').animate({
                left: '0'
            }); //admin-footer
            $('#admin-footer').animate({
                left: '0'
            });
            $('#admin-side').animate({
                width: '0'
            });
            $(this).find("i").html("&#xe6f8;");
        } else {
            $('#admin-body').animate({
                left: '200px'
            });
            $('#admin-footer').animate({
                left: '200px'
            });
            $('#admin-side').animate({
                width: '200px'
            });
            $(this).find("i").html("&#xe6f9;");
        }
    });
    $('.admin-side-full').on('click', function () {
        var docElm = document.documentElement;
        //W3C  
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        //FireFox  
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        //Chrome等  
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        //IE11
        else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        layer.msg('按Esc即可退出全屏');
    });

    $('#setting').on('click', function () {
        tab.tabAdd({
            href: '/Manage/Account/Setting/',
            icon: 'fa-gear',
            title: '设置'
        });
    });

    //锁屏
    $(document).on('keydown', function () {
        var e = window.event;
        if (e.keyCode === 76 && e.altKey) {
            //alert("你按下了alt+l");
            lock($, layer);
        }
    });
    $('#lock').on('click', function () {
        lock($, layer);
    });

    //手机设备的简单适配
    var treeMobile = $('.site-tree-mobile'),
        shadeMobile = $('.site-mobile-shade');
    treeMobile.on('click', function () {
        $('body').addClass('site-mobile');
    });
    shadeMobile.on('click', function () {
        $('body').removeClass('site-mobile');
    });


    /*主题颜色初始化*/
    var color=localStorage.getItem("themecolor");
    if(color){
        $("#skin-change").find("span").removeClass("active").end().find("[data-color$='"+color+"']").addClass("active");
        $("#skin-style").attr("href","/static/plugins/css/layui/skin/"+color+".css");
    }else{
        $("#skin-change").find("span").removeClass("active").end().find(".skin-green").addClass("active");
    }
    $("#skin-change").on("click","span",function(){
        var c=$(this).attr("data-color");
        $("#skin-change").find("span").removeClass("active");
        $(this).addClass("active");
        var url="/static/plugins/css/layui/skin/";
        $("#skin-style").attr("href",url+c+".css");
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("themecolor",c);
        }
    });

    $("#cpsqq").on("click",function(){
        var _this=this;
        layer.open({
            type: 2,
            title: 'CPS在线客服',
            shadeClose: true,
            shade: false,
            maxmin: false, //开启最大化最小化按钮
            area: ['700px', '460px'],
            content: '/component/cpsKf',
            cancel: function(){
                $(_this).removeClass("layui-this");
            }
    });
    });
    //任务管理
    $("#task").on("click",function(){
        var title =$(this).data("title"),
            url = $(this).data("url");
        tab.tabAdd({
            id:"taskManage",
            href:url,
            title:title
        });
    });


});

var isShowLock = false;
function lock($, layer) {
    if (isShowLock)
        return;
    //自定页
    layer.open({
        title: false,
        type: 1,
        closeBtn: 0,
        anim: 6,
        content: $('#lock-temp').html(),
        shade: [0.9, '#393D49'],
        success: function (layero, lockIndex) {
            isShowLock = true;
            //给显示用户名赋值
            //layero.find('div#lockUserName').text('admin');
            //layero.find('input[name=username]').val('admin');
            layero.find('input[name=password]').on('focus', function () {
                var $this = $(this);
                if ($this.val() === '输入密码解锁..') {
                    $this.val('').attr('type', 'password');
                }
            })
                .on('blur', function () {
                    var $this = $(this);
                    if ($this.val() === '' || $this.length === 0) {
                        $this.attr('type', 'text').val('输入密码解锁..');
                    }
                });
            //在此处可以写一个请求到服务端删除相关身份认证，因为考虑到如果浏览器被强制刷新的时候，身份验证还存在的情况			
            //do something...
            //e.g. 

            $.getJSON('/Account/Logout', null, function (res) {
                if (!res.rel) {
                    layer.msg(res.msg);
                }
            }, 'json');

            //绑定解锁按钮的点击事件
            layero.find('button#unlock').on('click', function () {
                var $lockBox = $('div#lock-box');

                var userName = $lockBox.find('input[name=username]').val();
                var pwd = $lockBox.find('input[name=password]').val();
                if (pwd === '输入密码解锁..' || pwd.length === 0) {
                    layer.msg('请输入密码..', {
                        icon: 2,
                        time: 1000
                    });
                    return;
                }
                unlock(userName, pwd);
            });
            /**
             * 解锁操作方法
             * @param {String} 用户名
             * @param {String} 密码
             */
            var unlock = function (un, pwd) {
                console.log(un, pwd);
                //这里可以使用ajax方法解锁
                $.post('/Account/UnLock', { userName: un, password: pwd }, function (res) {
                    //验证成功
                    if (res.rel) {
                        //关闭锁屏层
                        layer.close(lockIndex);
                        isShowLock = false;
                    } else {
                        layer.msg(res.msg, { icon: 2, time: 1000 });
                    }
                }, 'json');
                //isShowLock = false;
                //演示：默认输入密码都算成功
                //关闭锁屏层
                //layer.close(lockIndex);
            };
        }
    });
};