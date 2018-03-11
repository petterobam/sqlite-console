/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 自动分隔控件
 * @linc: MIT
 */
define("js/AutoSplit", [], function(require, exports, module) {
    function init() {
        if ($.fn.autoSplit) return;
        $.fn.autoSplit = function(options) {
            if (this.data("isBinded")) return;
            //避免重复绑定
            var opts = $.extend({
                length: 3,
                //分割
                split: "/",
                //分割符号
                distinct: false,
                //是否去重
                autoAll: true,
                //是否支持---
                cbFn: function() {},
                //回调函数
                upcase: true,
                //是否转大写
                suportNum: false
            }, options);
            this.on("keydown", function(ev) {
                var codeVal = ev.keyCode;
                var strVal = $(this).val();
                //已经输入---了，什么都不能输入
                if ($(this).val() === "---" && codeVal !== 8) return false;
                //suportNum为false的时候，不让输入数字
                if ((codeVal >= 48 && codeVal <= 57 || codeVal >= 96 && codeVal <= 105) && !opts.suportNum) return false;
                //只能连续输入---，否则-是不能被输入的
                if ((codeVal === 189 || codeVal === 109) && !(strVal === "" || strVal === "-" || strVal === "--")) return false;
                return true;
            });
            this.on("keyup", function() {
                var strVal = $(this).val();
                //分两种情况，一种是length为3，直接输入---；另一种是length不为3，但是也要允许---，是否允许，取决于opts.autoAll的配置
                if (strVal === "---" || opts.autoAll && (strVal === "" || strVal === "-" || strVal === "--")) {
                    strVal = strVal;
                } else {
                    if (opts.upcase) strVal = strVal.toUpperCase();
                    strVal = strVal.replace(new RegExp(opts.split, "gm"), "");
                    var tempArr = [];
                    for (var i = 0; i < strVal.length; i++) {
                        tempArr.push(strVal.substr(i, opts.length));
                        i += opts.length - 1;
                    }
                    //去重操作
                    if (opts.distinct) {
                        var tempObj = {}, index = 0, len = tempArr.length, key;
                        for (;index < len; index++) {
                            tempObj[tempArr[index]] = tempArr[index];
                        }
                        tempArr = [];
                        for (key in tempObj) {
                            tempArr.push(key);
                        }
                    }
                    strVal = tempArr.join(opts.split);
                }
                $(this).val(strVal);
                opts.cbFn(strVal);
            });
            this.data("isBinded", true);
        };
    }
    exports.init = init;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 舱位控件
 * @linc: MIT
 */
define("js/Cabin", [ "../js/Common" ], function(require, exports, module) {
    var defaultOpts = {
        width: 400,
        //自定义宽度
        height: null,
        //自定义高度
        hiddenName: null,
        //隐藏域name
        content: "",
        //显示的内容
        autoClose: false,
        //是否自动关闭
        defer: 2e3,
        //延迟多少秒
        allCheck: "---",
        //如果配置allCheck = "---",则在全选的时候，赋值为allCheck配置的值
        fn1: null,
        //自定义渲染title
        splitStr: "/",
        //分隔符
        fn2: null,
        //自定义渲染数据项
        ajaxOpts: {
            type: "get"
        },
        simpleData: {
            id: "id",
            name: "name"
        },
        qDatas: {},
        pos: []
    }, Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function Cabin(elem, options) {
        this.id = Common.cid("vetech-cabin");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.isShow = false;
        this.checkedData = {};
        //选中的数据
        this.dataItems = [];
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.data = [];
        //存储加载的数据
        this.dataBuffer = [];
        //数据缓存
        this.init();
    }
    /**
     * 全部选中
     * @param {Object} ev
     */
    Cabin.prototype.checkedAll = function(ev) {
        var $target = $(ev.target);
        if ($target.hasClass("active")) {
            $target.removeClass("active");
            this.$container.find("label").removeClass("active");
        } else {
            //全部选中
            $target.addClass("active");
            this.$container.find("label").addClass("active");
        }
        this.setValue();
    };
    /**
     * 初始化
     */
    Cabin.prototype.init = function() {
        this.$container = $('<div class="vetech-cabin"></div>');
        this.$container.css("width", this.opts.width);
        $(document.body).append(this.$container);
    };
    /**
     * 加载数据
     * @param callback 回调函数
     */
    Cabin.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            callback.call(this, this.data);
        } else {
            $.ajax($.extend(true, {
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                }
            }, this.opts.ajaxOpts));
        }
    };
    /**
     * 渲染数据
     */
    Cabin.prototype.render = function() {
        this.dataBuffer = [];
        //再次渲染的时候，需要清除缓存的数据，然后再重新加入
        //判断一下数据格式是否正确
        if ($.type(this.data) !== "array") throw new TypeError("数据格式错误，需要[object Array]格式");
        this.$container.html("");
        var dtWidth = 80;
        var ddWidth = this.opts.width - dtWidth - 2;
        var name = this.opts.simpleData.name;
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            var $dl = $('<dl class="clearfix"></dl>');
            var $dt = $('<dt><label class="title">' + (this.opts.fn1 ? this.opts.fn1(item) : item.name) + "</label></dt>");
            $dt.css("width", dtWidth);
            var $dd = $("<dd></dd>");
            $dd.css("width", ddWidth);
            var $ul = $('<ul class="clearfix"></ul>');
            $dd.append($ul);
            $dl.append($dt).append($dd);
            for (var j = 0, len2 = item.childs.length; j < len2; j++) {
                var item2 = item.childs[j], clsName = "";
                clsName = "1" === item2.isPublish ? "publish-seat" : "no-publish-seat";
                var $li = $('<li><label class="item ' + clsName + '">' + (this.opts.fn2 ? this.opts.fn2(item2) : item2[name]) + "</label></li>");
                $li.data("data", item2);
                $ul.append($li);
            }
            this.$container.append($dl);
        }
        if (this.data.length) {
            this.addToolbar();
        }
    };
    /**
     * 添加底部工具栏
     */
    Cabin.prototype.addToolbar = function() {
        var dtWidth = 80;
        var ddWidth = this.opts.width - dtWidth - 2;
        this.$toolbar = $('<dl class="clearfix toolbar"></dl>');
        this.$toolbar.append('<dt style="width:' + dtWidth + '"><label class="checked-all-btn">全选</label></dt>');
        this.$tips = $('<dd style="width:' + ddWidth + '"><ul class="clearfix"><li>图例：</li><li><div class="tips">公布运价</div></li><li><div class="tips bgRed">非公布运价</div></li></ul></dd>');
        this.$toolbar.append(this.$tips);
        this.$container.append(this.$toolbar);
        //所有数据渲染完毕，再来绑定事件
        this.bindEvent();
        //数据回填
        this.writeValue();
    };
    /**
     * 显示
     */
    Cabin.prototype.show = function() {
        if (this.elem.readOnly) return;
        //如果是readonly，则不显示
        if (this.isShow) return;
        this.setPos();
        this.isShow = true;
        this.$container.css("visibility", "visible");
    };
    /**
     * 隐藏
     */
    Cabin.prototype.hide = function() {
        if (!this.isShow) return;
        this.$container.css({
            visibility: "hidden",
            left: -1e3,
            top: -1e3
        });
        this.isShow = false;
    };
    /**
     * 设置位置
     */
    Cabin.prototype.setPos = function() {
        var pointer = this.$elem.offset(), iWidth = $(document).outerWidth(), iTop = pointer.top + this.$elem.outerHeight(), iLeft = pointer.left + this.$container.outerWidth() > iWidth ? pointer.left + this.$elem.outerWidth() - this.$container.outerWidth() : pointer.left;
        this.$container.css({
            left: iLeft,
            top: iTop
        });
    };
    /**
     * 数据回填
     */
    Cabin.prototype.writeValue = function() {
        this.$container.find(".item").removeClass("active");
        var keys = this.$hiddenInput.length ? this.$hiddenInput.val() : this.$elem.val();
        if (keys === this.opts.allCheck) {
            this.$container.find(".checked-all-btn").addClass("active");
            this.$container.find("label").addClass("active");
            this.setValue();
        } else {
            keys = keys.split(this.opts.splitStr);
            this.$container.find(".item").each(function(i, item) {
                if ($.inArray($(item).parent().data("data").id, keys) > -1) $(item).addClass("active");
            });
        }
        this.setValue();
    };
    /**
     * 手动输入时，回填数据
     */
    Cabin.prototype.writeValueByInput = function(value) {
        value = (value || "").toUpperCase();
        var splitStr = this.opts.splitStr;
        if (this.opts.allCheck && value === this.opts.allCheck) {
            this.$hiddenInput.val(this.opts.allCheck);
        } else {
            var lastStr = value.substring(value.length - 1);
            //输入框中最后一个值
            if (lastStr === splitStr || lastStr === "-") return;
            //如果最后一个值为分隔符或者是-，则表示没有输入完，不进行舱位回填
            var strArr = value.split(splitStr);
            var resultArr = [];
            //存储最终核算后的舱位数据
            for (var i = 0, len = strArr.length; i < len; i++) {
                if (strArr[i].indexOf("-") === -1) resultArr.push(strArr[i]); else resultArr = resultArr.concat(this._getCarbinByValues(strArr[i]));
            }
            if (this.$hiddenInput.length) this.$hiddenInput.val(resultArr.join(splitStr)); else this.$elem.val(resultArr.join(this.opts.splitStr));
        }
        this.writeValue();
    };
    /**
     * 根据A-F类型的value获取舱位
     * @param {Object} value
     */
    Cabin.prototype._getCarbinByValues = function(value) {
        var startIndex = this._getIndexByValue(value.split("-")[0]);
        var endIndex = this._getIndexByValue(value.split("-")[1]);
        var $items = this.$container.find(".item");
        if (startIndex === -1 || endIndex === -1) return;
        var resultArr = [];
        if (startIndex >= endIndex) {
            resultArr.push($items.eq(startIndex).data("data").id);
        } else {
            for (var i = startIndex; i <= endIndex; i++) {
                resultArr.push($items.eq(i).parent().data("data").id);
            }
        }
        return resultArr;
    };
    /**
     * 根据值获取值所在的下标
     * @param {Object} value
     */
    Cabin.prototype._getIndexByValue = function(value) {
        var $items = this.$container.find(".item");
        for (var i = 0, len = $items.length; i < len; i++) {
            var id = $items.eq(i).parent().data("data").id;
            if (id === value) {
                return i;
            }
        }
        return -1;
    };
    /**
     * 往input中输入值
     */
    Cabin.prototype.setValue = function() {
        if (this.opts.allCheck && this.$container.find(".checked-all-btn").hasClass("active")) {
            //如果配置了自定义全选，则在全选时，采用---来标示
            this.$hiddenInput.val(this.opts.allCheck);
            this.$elem.val(this.opts.allCheck);
            this.opts.cbFn(this.opts.allCheck);
        } else {
            //如果配置了隐藏域，隐藏域中的值用分隔符隔开，input中的值还要进行二次修正（即相同的要用-来表示，A-F）
            var $items = this.$container.find(".item"), tempArr = [], keys = [], idKey = this.opts.simpleData.id, checkedArr = [];
            //临时数组
            for (var i = 0, len = $items.length; i < len; i++) {
                var $item = $items.eq(i), id = $item.parent().data("data")[idKey];
                if ($item.hasClass("active")) {
                    tempArr.push(id);
                    keys.push(id);
                } else {
                    if (tempArr.length > 2) {
                        checkedArr.push(tempArr[0] + "-" + tempArr[tempArr.length - 1]);
                    } else {
                        checkedArr = checkedArr.concat(tempArr);
                    }
                    tempArr.length = 0;
                }
            }
            if (tempArr.length) {
                if (tempArr.length > 2) {
                    checkedArr.push(tempArr[0] + "-" + tempArr[tempArr.length - 1]);
                } else {
                    checkedArr = checkedArr.concat(tempArr);
                }
            }
            var splitStr = this.opts.splitStr;
            this.$hiddenInput.val(keys.join(splitStr));
            this.$elem.val(this.$hiddenInput.length ? checkedArr.join(splitStr) : keys.join(splitStr));
            this.opts.cbFn(keys);
        }
    };
    /**
     * 绑定事件
     */
    Cabin.prototype.bindEvent = function() {
        if (this.isBindedEvent) return;
        this.isBindedEvent = true;
        var _this = this;
        //全选事件
        this.$container.on("click.cabin", ".checked-all-btn", $.proxy(this.checkedAll, this));
        //舱位分类点击事件
        this.$container.on("click.cabin", ".title", function() {
            var $target = $(this), $labels = $target.parents("dl").find("label");
            if ($target.hasClass("active")) {
                $target.removeClass("active");
                $labels.removeClass("active");
            } else {
                $target.addClass("active");
                $labels.addClass("active");
            }
            _this.setAllCheckboxState();
            _this.setValue();
        });
        //舱位点击事件
        this.$container.on("click.cabin", ".item", function() {
            var $target = $(this), $dd = $target.parents("dd");
            if ($target.hasClass("active")) {
                $target.removeClass("active");
            } else {
                $target.addClass("active");
            }
            var $title = $target.parents("dl").find("label.title");
            if ($dd.find("label").length === $dd.find("label.active").length) {
                $title.addClass("active");
            } else {
                $title.removeClass("active");
            }
            _this.setAllCheckboxState();
            _this.setValue();
        });
        $(document).on("click.cabin", function(ev) {
            var target = ev.target;
            if (target !== _this.elem) _this.hide();
        });
        $(document).on("keyup.cabin", function(ev) {
            if (ev.keyCode === 9 && !_this.$elem.is(":focus")) _this.hide();
            return false;
        });
        this.$container.on("click.cabin", function() {
            return false;
        });
        this.$elem.on("keyup.cabin", function() {
            _this.writeValueByInput($(this).val());
        });
    };
    /**
     * 设置全选的box状态
     */
    Cabin.prototype.setAllCheckboxState = function() {
        var $allCheckbox = this.$container.find(".checked-all-btn"), $titles = this.$container.find(".title");
        if ($titles.length === this.$container.find(".title.active").length) {
            $allCheckbox.addClass("active");
        } else {
            $allCheckbox.removeClass("active");
        }
    };
    Cabin.prototype.destroy = function() {
        this.$container.remove();
        $(document).off(".cabin");
    };
    return Cabin;
});

/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define("js/CallCenter", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    /**
     * 共公属性
     */
    var defaultOpts = {
        setPosition: [ -20, 150 ],
        width: 154,
        //宽度
        stateWidth: 2,
        //数据状态一排展示的个数;
        itemWidth: 3,
        //图标展示的一排展示的个数
        phoneNum: "",
        //电话号码
        defaultItems: [ //默认的图标展示个数
        {
            id: "callcenter1",
            icon: "&#xe650;",
            value: "签入"
        }, {
            id: "callcenter2",
            icon: "&#xe64d;",
            value: "签出"
        }, {
            id: "callcenter3",
            icon: "&#xe671;",
            value: "示忙"
        }, {
            id: "callcenter4",
            icon: "&#xe658;",
            value: "保持"
        }, {
            id: "callcenter5",
            icon: "&#xe657;",
            value: "静音"
        }, {
            id: "callcenter6",
            icon: "&#xe675;",
            value: "呼转"
        }, {
            id: "callcenter7",
            icon: "&#xe6ea;",
            value: "拨打"
        }, {
            id: "callcenter8",
            icon: "&#xe651;",
            value: "监听"
        }, {
            id: "callcenter9",
            icon: "&#xe66f;",
            value: "回复"
        }, {
            id: "callcenter10",
            icon: "&#xe64c;",
            value: "外呼"
        }, {
            id: "callcenter11",
            icon: "&#xe686;",
            value: "评价"
        }, {
            id: "callcenter12",
            icon: "&#xe68a;",
            value: "自动催单"
        } ],
        addItems: [],
        //添加的图标展示个数
        setRadioState: [ 0, 0 ],
        //设置两个小圆点的状态，0红色，1绿色
        setStates: {},
        //默认的title展示个数
        setSelectData: [ //select下拉框的值
        {
            id: "s001",
            value: "选择"
        }, {
            id: "s002",
            value: "后续"
        }, {
            id: "s003",
            value: "小休"
        }, {
            id: "s004",
            value: "培训"
        }, {
            id: "s005",
            value: "会议"
        }, {
            id: "s006",
            value: "面谈"
        }, {
            id: "s007",
            value: "用餐"
        } ],
        changeRestFn: null,
        //对外提供select选择里状态的方法
        btnClickFn: null,
        //对外提供点击图标的方法
        alertLayerFn: null
    };
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function CallCenter(options) {
        this.id = Common.cid("CallCenter");
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.phoneNum = this.opts.phoneNum;
        if ($.type(this.opts.changeRestFn) !== "function") {
            this.opts.changeRestFn = null;
        }
        if ($.type(this.opts.btnClickFn) !== "function") {
            this.opts.btnClickFn = null;
        }
        if ($.type(this.opts.alertLayer) !== "function") {
            this.opts.alertLayer = null;
        }
        this.init();
    }
    /**
     * 初始化加载
     */
    CallCenter.prototype.init = function() {
        this.$container = $('<div class="vetech-call-center"></div>');
        this.$ccIcon = $('<div class="cc-header layui-clear"></div>');
        this.$container.append(this.$ccIcon);
        var lr = this.opts.setPosition[0] + "px";
        var lt = this.opts.setPosition[1] + "px";
        this.$container.css({
            right: lr,
            top: lt
        });
        $(document).find("body").append(this.$container);
    };
    /**
     * 加载数据
     * @param callback
     */
    CallCenter.prototype.load = function(callback) {
        if (this.opts.setStates.state) {
            this.titleData = this.opts.setStates.value || [];
        } else {
            this.titleData = [];
        }
        if (this.opts.addItems) {
            var array = this.opts.defaultItems.concat(this.opts.addItems);
            this.items = array;
        } else {
            this.items = this.opts.defaultItems;
        }
        this.selectData = this.opts.setSelectData || [];
        this.render();
    };
    /**
     * 渲染数据
     */
    CallCenter.prototype.render = function() {
        this.$ccContent = $('<div class="cc-content"></div>');
        var $ccTelHeader = $('<div class="cc-tel-head">' + '<div class="cc-tel-search">' + '<div class="layui-inline cc-color-state">' + '<div class="cc-tel-default"></div>' + '<div class="cc-tel-default" style="margin-top: 6px;"></div>' + "</div>" + '<input type="text" placeholder="来电号码…" class="layui-inline input-phone">' + '<a href="javascript:;" class="cc-close layui-inline"></a>' + "</div>" + "</div>");
        var $ccTelCon = $('<div class="cc-tel-con"></div>');
        var swidth = (100 / this.opts.itemWidth).toFixed(2) + "%";
        var $ul2 = $('<ul class="ctc-sort layui-clear"></ul>');
        for (var j = 0, len1 = this.items.length; j < len1; j++) {
            var icon = this.items[j].icon, id = this.items[j].id, name = this.items[j].value;
            var $li = $('<li id="' + id + '" style="width:' + swidth + '"><i class="icon iconfont">' + icon + "</i><p>" + name + "</p></li>");
            $li.data("data2", this.items[j]);
            $ul2.append($li);
        }
        $ccTelCon.append($ul2);
        var $selectRest = $('<div class="cc-select"></div>');
        var $select = $("<select></select>");
        for (var k = 0, len2 = this.selectData.length; k < len2; k++) {
            var sid = this.selectData[k].id, sname = this.selectData[k].value, $option = $("<option value=" + sid + ">" + sname + "</option>");
            $option.data(this.selectData[k]);
            $select.append($option);
        }
        $selectRest.append($select);
        $ccTelCon.append($selectRest);
        this.$ccContent.append($ccTelHeader).append($ccTelCon);
        this.$container.append(this.$ccContent);
        this.reloadRender();
        this.setPhoneNumber(this.phoneNum);
        this.bindEvent();
    };
    /**
     * 绑定事件
     */
    CallCenter.prototype.bindEvent = function() {
        var _this = this;
        this.$ccContent.find(".input-phone").on("dblclick", function() {
            if ($(this).val()) {
                $(this).select();
                if (_this.opts.alertLayerFn) {
                    _this.opts.alertLayerFn($(this).val());
                }
            }
        });
        /*调用小圆点当前显示状态的方法*/
        this.setRadioState(this.opts.setRadioState);
        this.$container.find(".cc-select").on("change", "select", function() {
            _this.setRestValue($(this).children("option:selected").data());
        });
        /*点击没有disabled类的图标*/
        this.$container.find(".ctc-sort").on("click", "li:not(.disabled)", function() {
            _this.clickBtn($(this).data("data2"));
        });
        /*点击关闭的效果*/
        this.$container.find(".cc-close").on("click", function() {
            _this.$ccContent.find(".cc-tel-con").slideUp("fast").end().find(".cc-tel-head").animate({
                width: "0px",
                opacity: "0"
            }, 500).fadeOut("1000");
            _this.$ccIcon.show();
            _this.phoneCallIn(_this.opts.telCalling);
        });
        this.$container.on("mouseenter", function() {
            if (_this.$ccIcon.is(":visible")) {
                _this.$container.animate({
                    right: "2px"
                }, 100);
            }
        }).on("mouseleave", function() {
            if (_this.$ccIcon.is(":visible")) {
                _this.$container.animate({
                    right: "-20px"
                }, 100);
            }
        });
        /*点击展开的效果*/
        this.$ccIcon.on("click", function() {
            _this.$ccIcon.removeClass("active").hide();
            _this.$ccContent.find(".cc-tel-head").show().animate({
                width: _this.opts.width + "px",
                opacity: "1"
            }, 500).end().find(".cc-tel-con").animate({
                width: _this.opts.width + "px"
            }, 500).slideDown("slow");
        });
    };
    /**
     * 重新渲染标题title数据
     */
    CallCenter.prototype.reloadRender = function() {
        var _this = this;
        if (this.$ccContent.find(".ctc-title").length > 0) {
            this.$ccContent.find(".ctc-title").remove();
        }
        if (this.opts.setStates.state) {
            this.titleData = this.opts.setStates.value || [];
        } else {
            this.titleData = [];
        }
        if (this.titleData.length > 0) {
            var $li2 = null;
            var twidth = (100 / this.opts.stateWidth).toFixed(2) + "%";
            var $ul1 = $('<ul class="ctc-title layui-clear"></ul>');
            for (var i = 0, len = this.titleData.length; i < len; i++) {
                var name = this.titleData[i].name, num = this.titleData[i].num, alink = this.titleData[i].alick || "";
                if (alink) {
                    $li2 = $('<li style="width:' + twidth + '">' + name + '：<a href="javascript:;" class="tt-alink">' + num + "</span></li>");
                } else {
                    $li2 = $('<li style="width:' + twidth + '">' + name + "：<span>" + num + "</span></li>");
                }
                $li2.data("data1", this.titleData[i]);
                $ul1.append($li2);
            }
            this.$ccContent.find(".cc-tel-con").prepend($ul1);
        }
        this.$container.find(".ctc-title").on("click", ".tt-alink", function() {
            _this.clickBtn($(this).parent().data("data1"));
        });
    };
    /**
    * 设置输入框里的电话号码
    * @param {Object} number 手机号码
    */
    CallCenter.prototype.setPhoneNumber = function(number) {
        this.phoneNum = number;
        this.$ccContent.find(".input-phone").val(this.phoneNum);
    };
    /**
	 * 设置小圆点的状态
	 * @param {Object} array 默认[0,0]
	 */
    CallCenter.prototype.setRadioState = function(array) {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === 1) {
                this.$container.find(".cc-color-state").children().eq(i).addClass("active");
            } else {
                this.$container.find(".cc-color-state").children().eq(i).removeClass("active");
            }
        }
    };
    /**
    * 改变select下拉框的值并给予回调函数赋值
    * @param {Object} data //当前对象值
    */
    CallCenter.prototype.setRestValue = function(data) {
        if (this.opts.changeRestFn) {
            this.opts.changeRestFn(data);
        }
    };
    /**
	 * 点击容器上的li
	 * @param {Object} //当前对象值
	 */
    CallCenter.prototype.clickBtn = function(data) {
        if (this.opts.btnClickFn) {
            this.opts.btnClickFn(data);
        }
    };
    /**
	 * 正在时通话时需要调用的方法
	 * @param {Object} boolen//true 或者false
	 */
    CallCenter.prototype.phoneCallIn = function(boolen) {
        if (boolen) {
            this.$ccIcon.addClass("active");
        } else {
            this.$ccIcon.removeClass("active");
        }
    };
    return CallCenter;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 常用工具类
 * @linc: MIT
 *
 */
define("js/Common", [], function(require, exports, module) {
    function log(msg) {
        if (console && console.log) console.log(msg);
    }
    function error(msg) {
        if (console && console.error) console.error(msg);
    }
    function cid(prefix) {
        return prefix + "VComponents" + String(Math.random()).replace(/\D/g, "");
    }
    function nodeError($node) {
        error("[" + $node.selector + "] can't find element,ensure page loaded!");
    }
    function tplError(msg) {
        throw new Error("模板加载异常。" + (msg || ""));
    }
    /**
	 * 触发input的事件
     * @param dom
     */
    function triggerInput(dom) {
        if (!dom) return;
        var originalDom = dom, tagName = originalDom.tagName.toUpperCase(), userAgent = window.navigator.userAgent.toLowerCase(), ie = /(msie\s|trident.*rv:)([\w.]+)/.test(userAgent), firefox = userAgent.indexOf("firefox") >= 0, eventType = tagName === "SELECT" ? "change" : "click", ev = document.createEvent("HTMLEvents");
        if ((ie || firefox) && tagName === "INPUT") eventType = "change";
        ev.initEvent(eventType, true, true);
        originalDom.dispatchEvent(ev);
    }
    function loadTpl(url, callback) {
        $.ajax({
            type: "get",
            url: url,
            dataType: "html",
            success: function(data) {
                callback("success", data);
            },
            error: function(msg) {
                callback("error");
            }
        });
    }
    return {
        log: log,
        error: error,
        cid: cid,
        nodeError: nodeError,
        tplError: tplError,
        loadTpl: loadTpl,
        triggerInput: triggerInput
    };
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 航班号是否适用控件
 * @linc: MIT
 */
define("js/FlightNumber", [ "../js/Common" ], function(require, exports, module) {
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        cbFn: function() {},
        showGXHB: true
    };
    var Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function FlightNum(elem, options) {
        this.id = Common.cid("FlightNum");
        this.elem = elem;
        this.$elem = $(elem);
        this.isShow = false;
        this.opts = $.extend(true, {}, defaultOpts, options);
        if (!this.opts.hiddenName1) throw new Error("适用航班隐藏域ID需要配置");
        if (this.opts.showGXHB && !options.hiddenName2) throw new Error("适用共享航班隐藏域ID需要配置");
        this.$hiddenInput1 = $(document.body).find("#" + options.hiddenName1);
        this.$hiddenInput2 = $(document.body).find("#" + options.hiddenName2);
    }
    FlightNum.prototype.init = function() {
        //容器
        this.$container = $("<div class='flightNum-container'>");
        this.$container.css("height", this.opts.showGXHB ? 60 : 40);
        //title
        this.$title = $("<div class='title'>");
        //conent
        this.$content = $("<div class='content'>");
        var randomNum = String(Math.random()).replace(/\D/g, "");
        this.$container.append(createLabel("all").append(createInput("radio", "radioContent" + randomNum, "全部适用")));
        this.$container.append(createLabel("sy").append(createInput("radio", "radioContent" + randomNum, "适用")));
        this.$container.append(createLabel("bsy").append(createInput("radio", "radioContent" + randomNum, "不适用")));
        //设置底部
        this.$footer = $("<div class='footer'>");
        if (this.opts.showGXHB) {
            this.$footer.append(createLabel("sygxhb").append(createInput("checkbox", "chk", "适用共享航班")));
        }
        this.$container.append(this.$title).append(this.$content).append(this.$footer);
        $(document.body).append(this.$container);
        this.bindEvent();
        this.writeValue();
    };
    /**
     * 时间绑定
     */
    FlightNum.prototype.bindEvent = function() {
        var _this = this;
        $(document).on("click.FlightNum", function(ev) {
            var target = ev.target;
            if (target !== _this.elem) _this.hide();
        });
        this.$container.find("input").on("click.FlightNum", $.proxy(this.operateHandler, this));
        this.$container.on("click.FlightNum", function(ev) {
            ev.stopPropagation();
        });
        this.$elem.on("keyup.FlightNum", $.proxy(this.upperCaseHandler, this));
    };
    /**
     * 操作
     */
    FlightNum.prototype.operateHandler = function(ev) {
        var _this = this;
        var target = ev.target;
        this.$elem.removeClass("placeholder");
        //placeholder问题
        if ($(target).is("label") || $(target).parent().is("label")) {
            var $label = $(target).is("input") ? $(target).parent() : $(target);
            if ($label.attr("id") === "all") {
                //全部适用
                _this.$elem.val("---");
                _this.$hiddenInput1.val("1");
                _this.$elem.removeClass("bsy").addClass("sy");
            } else if ($label.attr("id") === "sy") {
                //适用
                _this.$elem.val("");
                _this.$hiddenInput1.val("1");
                _this.$elem.removeClass("bsy").addClass("sy");
            } else if ($label.attr("id") === "bsy") {
                //不适用
                _this.$elem.val("");
                _this.$hiddenInput1.val(0);
                _this.$elem.removeClass("sy").addClass("bsy");
            } else {
                //适用共享航班
                if (_this.opts.showGXHB) {
                    var result = $label.find("input").get(0).checked ? 1 : 0;
                    _this.$hiddenInput2.val(result);
                }
            }
        }
        this.$elem.focus();
        this.opts.cbFn(_this.$elem.val(), _this.$hiddenInput1.val(), _this.$hiddenInput2.val());
    };
    /**
     * 转大写
     */
    FlightNum.prototype.upperCaseHandler = function() {
        this.$elem.val((this.elem.value || "").toUpperCase());
    };
    /**
     * 显示操作
     */
    FlightNum.prototype.show = function() {
        if (this.isShow) return;
        this.setPos();
        this.$container.show();
        this.isShow = true;
    };
    /**
     * 隐藏操作
     */
    FlightNum.prototype.hide = function() {
        if (!this.isShow) return;
        this.$container.hide().css("left", "-1000px");
        this.isShow = false;
    };
    /**
     * 设置控件的位置
     */
    FlightNum.prototype.setPos = function() {
        var pointer = this.$elem.offset(), iWidth = $(document).outerWidth(), iTop = pointer.top + this.$elem.outerHeight(), iLeft = pointer.left + this.$container.outerWidth() > iWidth ? pointer.left + this.$elem.outerWidth() - this.$container.outerWidth() : pointer.left;
        this.$container.css({
            left: iLeft,
            top: iTop
        });
    };
    /**
     * 销毁
     */
    FlightNum.prototype.destroy = function() {
        this.$container.off(".FlightNum");
        $(document).off(".FlightNum");
        this.$container.remove();
    };
    /**
     * 数据回填
     */
    FlightNum.prototype.writeValue = function() {
        var value1, value2, labelId1;
        value1 = this.$hiddenInput1.val();
        value2 = this.$hiddenInput2.val();
        if (value1 === "1" && this.$elem.val() === "---") {
            labelId1 = "all";
        } else if (value1 === "1") {
            labelId1 = "sy";
        } else if (value1 === "0") {
            labelId1 = "bsy";
        }
        if (labelId1) this.$container.find("#" + labelId1).find("input").get(0).checked = true;
        if (this.opts.showGXHB) {
            this.$container.find("#sygxhb").find("input").get(0).checked = "1" === value2 ? true : false;
        }
    };
    /**
     * 创建input标签
     * @param type input类型
     * @param name name名称
     * @param value 值
     */
    function createInput(type, name, value) {
        return $("<input type='" + type + "' name='" + name + "' value='" + value + "'/>" + value + "</input>");
    }
    /**
     * 创建label
     * @param id
     * @returns {*|jQuery|HTMLElement}
     */
    function createLabel(id) {
        return $("<label id='" + id + "'>");
    }
    return FlightNum;
});

/**
 * @作者:hejie
 * @描述: 航班号搜索控件
 * @linc: MIT
 *
 */
define("js/FlightSearch", [], function(require, exports, module) {
    var defaultOptions = {
        optData: {},
        title: "输入接机航班号，如CZ6143",
        simpleData: {
            flightNum: "hbh",
            cfcsmc: "cfcsmc",
            ddcsmc: "ddcsmc",
            cfjcmc: "qfjcmc",
            ddjcmc: "jljcmc",
            cfsj: "cftime",
            ddsj: "ddtime",
            cfhzl: "cfhzl",
            ddhzl: "ddhzl"
        }
    };
    function FlightSearch(elem, options, cbFn) {
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOptions, options);
        this.cbFn = cbFn || $.noop;
        this.timerId = null;
        this.init();
    }
    FlightSearch.prototype = {
        init: function() {
            var _this = this;
            this.$container = $('<div class="vetech-userCar-container"></div>');
            this.$container.append("<p>" + this.opts.title + "</p>" + '<p class="noValue">未能查询到相关航班</p>' + "<ul></ul>");
            $(document.body).append(this.$container);
            this.$noVal = this.$container.find(".noValue");
            this.$ul = this.$container.find("ul");
            this.bindEvent();
        },
        loadData: function(keySearchData) {
            var _this = this, sjId = this.opts.sjId, cfcity = this.opts.cfcity, ddcity = this.opts.ddcity, sjData = $("#" + sjId).val() || "", typeValue = this.opts.typeValue;
            var loadDatas = $.extend({}, this.opts.optData, {
                hbh: keySearchData.toUpperCase(),
                cfcity: cfcity ? cfcity.toUpperCase() : "",
                ddcity: ddcity ? ddcity.toUpperCase() : "",
                qfsj: sjData,
                pt: _this.opts.pt
            });
            if (this.opts.type === 1) {
                this.data = typeValue;
            } else {
                $.ajax({
                    type: "get",
                    url: _this.opts.dataUrl,
                    data: loadDatas,
                    dataType: "json",
                    success: function(data) {
                        _this.data = data.result;
                        _this.$ul.empty();
                        _this.keySearchData = keySearchData;
                        _this.render();
                    }
                });
            }
        },
        render: function() {
            var _this = this, sd = this.opts.simpleData;
            var setColData, reg, changeStyle, cfhzl, ddhzl, cfsj, ddsj, cfcsmc, ddcsmc, cfcsbt, ddcsbt;
            if ($.type(this.data) !== "array") throw new Error("数据格式错误");
            if (this.data.length === 0) {
                _this.hide();
                _this.cbFn({});
                return;
            } else {
                this.$noVal.hide();
            }
            this.$ul.empty();
            for (var i = 0, len = this.data.length; i < len; i++) {
                this.$li = $("<li></li>");
                if (this.keySearchData) {
                    this.newkeySearchData = this.keySearchData;
                    if (this.keySearchData.substr(0, 1) === "*") {
                        this.newkeySearchData = this.keySearchData.replace(/\*/, "\\*");
                    }
                    reg = new RegExp(this.newkeySearchData, "ig");
                    changeStyle = "<i>" + this.keySearchData.toUpperCase() + "</i>";
                }
                setColData = this.data[i][sd.flightNum].replace(reg, changeStyle);
                cfhzl = this.data[i][sd.cfhzl] || "";
                ddhzl = this.data[i][sd.ddhzl] || "";
                cfsj = this.data[i][sd.cfsj] || "";
                ddsj = this.data[i][sd.ddsj] || "";
                cfcsmc = this.data[i][sd.cfcsmc];
                ddcsmc = this.data[i][sd.ddcsmc];
                cfcsbt = cfcsmc.length > 4 && cfcsmc.indexOf("（") > 0 ? cfcsmc.slice(0, cfcsmc.indexOf("（")) : cfcsmc;
                ddcsbt = ddcsmc.length > 4 && ddcsmc.indexOf("（") > 0 ? ddcsmc.slice(0, ddcsmc.indexOf("（")) : ddcsmc;
                this.dl = '<dl class="left">' + '<dt><em title="{ctitle}">' + cfcsbt + "</em><em>" + cfsj + "</em></dt>" + "<dd>" + this.data[i][sd.cfjcmc] + cfhzl + "</dd>" + "</dl>" + '<dl class="mid">' + "<dt>" + setColData + "</dt>" + '<dd></dd></dl><dl class="right"><dt><em title="{dtitle}">' + ddcsbt + "</em><em>" + ddsj + "</em></dt>" + "<dd>" + this.data[i][sd.ddjcmc] + ddhzl + "</dd></dl>";
                this.dl = this.dl.replace(/\{ctitle\}/g, cfcsmc).replace(/\{dtitle\}/g, ddcsmc);
                this.$dl = $(this.dl);
                this.$li.append(this.$dl);
                this.$li.data("data", this.data[i]);
                this.$ul.append(this.$li);
            }
            this.$container.append(this.$ul);
        },
        bindEvent: function() {
            var _this = this;
            this.$container.on("mouseover", "ul>li", $.proxy(this.itemMouseOver, this));
            this.$container.on("click", "ul>li", $.proxy(this.itemClick, this));
            this.$container.on("mousedown", $.proxy(this.containerMouseDown, this));
            this.$container.on("mouseup", $.proxy(this.containerMouseUp, this));
            this.$container.on("click", $.proxy(this.stopEvent, this));
            $(document).on("mousedown", $.proxy(this.bodyClick, this));
        },
        show: function() {
            this.containerPos();
            this.$container.show();
        },
        hide: function() {
            this.$container.hide();
        },
        stopEvent: function(ev) {
            return false;
        },
        waitDo: function(fn, wait) {
            var _this = this;
            if (this.timerId) {
                window.clearTimeout(this.timerId);
                this.timerId = null;
            }
            this.timerId = window.setTimeout(function() {
                fn();
                _this.timerId = null;
            }, wait);
            return this.timerId;
        },
        containerPos: function() {
            var elemPos = this.$elem.offset(), elemHeight = this.$elem.outerHeight(false);
            this.$container.css({
                width: this.opts.width,
                height: "auto",
                maxHeight: 260
            });
            this.$container.css("left", elemPos.left + "px");
            this.$container.css("top", elemPos.top + elemHeight + "px");
        },
        itemClick: function(ev) {
            var dataVal = $(ev.currentTarget).data("data"), flightNum = this.opts.simpleData.flightNum, wValData = dataVal[flightNum];
            this.stopEvent(ev);
            this.$elem.val(wValData);
            this.hide();
            this.cbFn(dataVal);
        },
        itemMouseOver: function(ev) {
            $(ev.currentTarget).addClass("active").siblings().removeClass("active");
        },
        containerMouseDown: function(ev) {
            if (document.all && !document.addEventListener) {
                this.$container[0].setCapture && this.$container[0].setCapture();
            }
            return false;
        },
        containerMouseUp: function() {
            this.$container[0].releaseCapture && this.$container[0].releaseCapture();
        },
        bodyClick: function(ev) {
            var target = ev.target;
            if (target !== this.elem) this.hide();
        }
    };
    module.exports = FlightSearch;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 国际州控件
 * @linc: MIT
 */
define("js/Gjz", [ "../js/Common" ], function(require, exports, module) {
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        width: 158,
        level: 4,
        //默认是4层
        splitStr: "/",
        filterIds: null,
        //需要过滤出来的数据，哪些不显示
        rootId: "---",
        pid: "0",
        //根节点的pid，默认设置为0，如果后台数据发生变化，可以在这里进行修改
        fn1: null
    }, $ = window.jQuery, Common = require("../js/Common");
    /**
     * 国际州构造函数
     * @param elem 绑定的控件dom
     * @param options 配置参数
     * @constructor
     */
    function Gjz(elem, options) {
        this.id = Common.cid("Gjz");
        this.elem = elem;
        this.$elem = $(elem);
        this.$listContainers = [];
        //列表集合
        this.opts = $.extend({}, defaultOpts, options);
        this.data = [];
        this.dataStore = {};
        //数据仓库，存储分组好的数据
        this.activeItems = {};
        //存储激活的对象
        this.checked = {
            keys: [],
            values: [],
            ezms: []
        };
        //选中的值
        this.isShow = false;
        //默认隐藏
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.$hiddenInput2 = $("#" + this.opts.hiddenName2);
        //获取默认值
        try {
            this.checked.keys = this.$hiddenInput.val().split(this.opts.splitStr);
        } catch (e) {
            this.checked.keys = [];
        }
    }
    /**
     * 加载数据
     * @param callback 回调函数
     */
    Gjz.prototype.load = function(callback) {
        var _this = this;
        if (1 === this.opts.type) {
            //1、type=1 ，页面加载了数据文件date.js，直接传入json对象即可
            this.data = this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: _this.opts.typeValue,
                dataType: "json",
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                }
            });
        }
    };
    /**
     * 格式化数据，将数据按层级分组，渲染时减少循环量
     */
    Gjz.prototype.formartData = function() {
        //根据回填的二字码来判断
        var checkedCountrys = [], state = false;
        if (this.$hiddenInput2 && this.$hiddenInput2.val()) {
            if (this.$hiddenInput2.val() === this.opts.rootId) {
                state = true;
            } else {
                checkedCountrys = this.$hiddenInput2.val().split(this.opts.splitStr);
            }
        }
        var tempArr = this.opts.filterIds ? this.opts.filterIds.split(this.opts.splitStr) : [];
        for (var i = 0, len = this.data.length; i < len; i++) {
            var dataItem = this.data[i];
            if ($.inArray(dataItem.id, tempArr) > -1) continue;
            //根据隐藏域中的值拿到对应的name，以此作为数据回填
            if (contains(this.checked.keys, dataItem.id)) {
                this.checked.values.push(dataItem.name);
            }
            //需要给数据构造两个私有属性，一个是_dataIndex一个是_state
            dataItem._dataIndex = i;
            if (state || $.inArray(dataItem.by3, checkedCountrys) > -1) {
                dataItem._state = true;
            } else {
                dataItem._state = false;
            }
            //按层级分组
            if (!this.dataStore[dataItem.level]) this.dataStore[dataItem.level] = [];
            this.dataStore[dataItem.level].push(dataItem);
        }
        this.render();
        this.writeValue();
    };
    /**
     * 数据回填
     */
    Gjz.prototype.writeValue = function() {
        //1、判断是否选择全球
        if (contains(this.checked.keys, this.opts.rootId)) {
            this.$elem.val("全球");
            this.$hiddenInput.val(this.getRootId());
        } else this.$elem.val(this.checked.values.join(this.opts.splitStr));
    };
    /**
     * 根据pid查询根节点的id
     */
    Gjz.prototype.getRootId = function() {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].parid === this.opts.pid) return this.data[i].id;
        }
    };
    /**
     * 渲染
     */
    Gjz.prototype.render = function() {
        for (var i = 0; i < this.opts.level; i++) {
            var $list = $('<div class="vetech-gjz-list" level-index="' + (i + 1) + '"></div>');
            $list.css("width", this.opts.width);
            this.$listContainers.push($list);
            $(document.body).append($list);
        }
        //默认创建第一层级
        this.createList(0, this.opts.pid, false).bindEvent(0).setPos(this.$elem, 0);
    };
    /**
     * 销毁
     */
    Gjz.prototype.destroy = function() {
        if (this.$listContainers.length) return;
        for (var i = 0; i < this.$listContainers.length; i++) {
            this.$listContainers[i].remove();
        }
    };
    /**
     * 设置值
     *
     */
    Gjz.prototype.setValue = function() {
        this.checked.keys.length = 0;
        //存放显示值对应的id
        this.checked.values.length = 0;
        //存放显示的值
        this.checked.ezms.length = 0;
        //存放选中对应的二字码
        this.checkedOpts = [];
        //选中的节点
        var _this = this;
        searchCheckedData(this, 0, this.opts.pid, function() {
            if (_this.checked.values.length === 1 && contains(_this.checked.values, "全球")) {
                //判断是否是选择的全球
                _this.checked.ezms = [ _this.opts.rootId ];
            }
            _this.$elem.val(_this.checked.values.join(_this.opts.splitStr));
            _this.$hiddenInput.val(_this.checked.keys.join(_this.opts.splitStr));
            _this.$hiddenInput2.val(_this.checked.ezms.join(_this.opts.splitStr));
            if (_this.opts.cbFn) _this.opts.cbFn(_this.data, this.checkedOpts);
        });
        //查找选中的数据(从根节点开始找)
        function searchCheckedData(_this, level, pid, cbFn) {
            var data = _this.getNextLevelDate(level, pid);
            for (var i = 0; i < data.length; i++) {
                if (data[i]._state) {
                    _this.checked.keys.push(data[i].id);
                    _this.checked.values.push(data[i].name);
                    _this.checkedOpts.push(data[i]);
                    if (data[i].isleaf === "1") _this.checked.ezms.push(data[i].by3); else findEzmData(_this, data[i].level + 1, data[i].id);
                } else {
                    var nextLevel = level + 1;
                    if (nextLevel < _this.opts.level) searchCheckedData(_this, nextLevel, data[i].id);
                }
            }
            if (cbFn) cbFn();
        }
        /**
         * 查找二字码
         * @param {Object} _this
         * @param {Object} level
         * @param {Object} pid
         */
        function findEzmData(_this, level, pid) {
            var data = _this.getNextLevelDate(level, pid);
            for (var i = 0; i < data.length; i++) {
                if (data[i]._state && data[i].isleaf === "1") {
                    //如果被选中，且是子节点情况下，该值需要存储
                    _this.checked.ezms.push(data[i].by3);
                    _this.checkedOpts.push(data[i]);
                }
                var nextLevel = level + 1;
                if (nextLevel < _this.opts.level) findEzmData(_this, nextLevel, data[i].id);
            }
        }
    };
    /**
     * 设置位置
     * @param {Object} dependDom 依赖的dom元素
     * @param {Object} levelIndex  要设置位置的dom元素的index
     */
    Gjz.prototype.setPos = function(dependDom, levelIndex) {
        var pointer = $(dependDom).offset();
        if (dependDom === this.$elem) {
            //第一级的位置计算和后面的位置计算方式不同，要分开处理
            this.$listContainers[levelIndex].css({
                left: pointer.left,
                top: pointer.top + dependDom.get(0).offsetHeight
            });
        } else {
            this.$listContainers[levelIndex].css({
                left: pointer.left + dependDom.get(0).offsetWidth,
                top: pointer.top
            });
        }
        return this;
    };
    /**
     * 创建list
     * @param {Object} levelIndex  层级
     * @param {Object} pid  父节点id
     * @param {Object} state  父节点id
     */
    Gjz.prototype.createList = function(levelIndex, pid, state) {
        var $list = this.$listContainers[levelIndex], data = this.getNextLevelDate(levelIndex, pid);
        //获取隐藏域中选中的值
        var keys = this.checked.keys;
        $list.data = data;
        var $ul = $("<ul></ul>");
        for (var i = 0, len = data.length; i < len; i++) {
            var $li = $('<li data-index="' + data[i]._dataIndex + '"></li>');
            var $label = $("<label></label>");
            $li.append($label);
            var $checkbox = $('<input type="checkbox"/>');
            var $span = $("<span>" + data[i].name + "</span>");
            var $checkboxImg = $('<img class="box" disabled="disabled" src="' + Gjz.uncheckedUrl + '" />');
            $label.append($checkbox).append($span).append($checkbox).append($checkboxImg);
            //如果是子节点或者已经是最后一层，不会出现下一层的图标
            if (data[i].isleaf === "0" && parseInt(levelIndex) !== this.opts.level - 1) {
                var $nextImg = $('<img class="arrow" src="' + Gjz.arrawUrl + '" />');
                $label.append($nextImg);
            }
            var tempState = contains(keys, data[i].id) ? true : state;
            setCheckboxState($checkbox.get(0), tempState);
            this.changeImgUrl($checkbox);
            $ul.append($li);
        }
        $list.html("").append($ul);
        return this;
    };
    /**
     * 绑定事件
     * @param {Object} levelIndex
     */
    Gjz.prototype.bindEvent = function(levelIndex) {
        var $list = this.$listContainers[levelIndex];
        var _this = this;
        $list.find("li").each(function() {
            var $checkbox = $(this).find("input");
            $checkbox.on("change", $.proxy(_this.itemClickHandler, _this, levelIndex, $checkbox));
            $(this).on("mouseover", $.proxy(_this.itemActiveHandler, _this, levelIndex, this));
        });
        //禁止输入框输入
        this.$elem.on("keydown", function() {
            return false;
        });
        //除了点击input自身和控件以外，点击其他的地方需要隐藏
        $(document.body).on("click", function(ev) {
            var target = ev.target;
            if (!(ev.target === _this.elem || $(target).parents("div").hasClass("vetech-gjz-list"))) {
                _this.hideContainer();
            }
        });
        return this;
    };
    /**
     * 数据项点击事件
     * @param levelIndex
     * @param $checkbox
     */
    Gjz.prototype.itemClickHandler = function(levelIndex, $checkbox) {
        //更新当前点击数据项的状态
        this.changeImgUrl($checkbox);
        var nextIndex = parseInt(levelIndex) + 1;
        var currData = this.data[$checkbox.parents("li").attr("data-index")];
        var state = $checkbox.get(0).checked;
        if (nextIndex < this.opts.level && currData.isleaf === "0") {
            //更新下一层级页面上的状态
            this.updateNextList(nextIndex, state);
            //更新点击对象下所有子数据项的状态值
            this.updateAllChildrensState(nextIndex, currData.id, state);
        }
        //更新上级节点的状态
        this.updatePNodeState(levelIndex, state);
    };
    Gjz.prototype.changeImgUrl = function($checkbox) {
        //在更改图片是否选中的时候去同步数据的状态
        var dataIndex = $checkbox.parents("li").attr("data-index");
        this.data[dataIndex]._state = $checkbox.get(0).checked;
        var boxUrl = $checkbox.get(0).checked ? Gjz.checkedUrl : Gjz.uncheckedUrl;
        $checkbox.parent().find(".box").attr("src", boxUrl);
    };
    /**
     * 更新下一个list的状态
     * @param {Object} levelIndex 层级
     * @param {Object} state
     */
    Gjz.prototype.updateNextList = function(levelIndex, state) {
        var $list = this.$listContainers[levelIndex];
        var _this = this;
        $list.find("input").each(function() {
            setCheckboxState(this, state);
            _this.changeImgUrl($(this));
        });
    };
    /**
     * 更新所有子节点的状态
     * @param {Object} levelIndex  层级
     * @param {Object} pid
     * @param {Object} state
     */
    Gjz.prototype.updateAllChildrensState = function(levelIndex, pid, state) {
        function update(_this, level, pid, state) {
            var data = _this.getNextLevelDate(level, pid);
            for (var i = 0; i < data.length; i++) {
                data[i]._state = state;
                var nextLevel = level + 1;
                if (nextLevel < _this.opts.level) update(_this, nextLevel, data[i].id, state);
            }
        }
        update(this, levelIndex, pid, state);
    };
    /**
     * 更新父节点的状态
     * @param {Object} levelIndex
     * @param {Object} state
     * @desc:更新父节点有两种情况，一种是state为false时，父节点需要清除选中，一种是state，且state所在的层级全部选中，父节点要选中
     */
    Gjz.prototype.updatePNodeState = function(levelIndex, state) {
        var $checkbox;
        if (levelIndex !== 0) {
            if (!state) {
                for (var i = 0; i < levelIndex; i++) {
                    $checkbox = $(this.activeItems[i]).find("input");
                    setCheckboxState($checkbox.get(0), state);
                    this.changeImgUrl($checkbox);
                }
            } else {
                var $checkboxs = this.$listContainers[levelIndex].find("input").not("input:checked");
                if ($checkboxs.length === 0) {
                    var prevIndex = levelIndex - 1;
                    $checkbox = $(this.activeItems[prevIndex]).find("input");
                    setCheckboxState($checkbox.get(0), state);
                    this.changeImgUrl($checkbox);
                    this.updatePNodeState(prevIndex, state);
                }
            }
        }
        this.setValue();
    };
    /**
     * 数据项激活对象,鼠标移入事件
     * @param {Object} levelIndex
     * @param {Object} li
     */
    Gjz.prototype.itemActiveHandler = function(levelIndex, li) {
        //如果已经是当前对象，不会再执行
        levelIndex = parseInt(levelIndex);
        this.closeNextLists(levelIndex);
        var currData = this.data[$(li).attr("data-index")];
        this.$listContainers[levelIndex].find("li").removeClass("active");
        $(li).addClass("active");
        this.activeItems[levelIndex] = li;
        //如果不是最底层而且该节点不是子节点
        if (levelIndex < this.opts.level - 1 && currData.isleaf !== "1") {
            var nexeIndex = levelIndex + 1;
            var pid = currData.id;
            var state = $(li).find("input").get(0).checked;
            this.createList(nexeIndex, pid, state).bindEvent(nexeIndex).setPos($(li), nexeIndex).show(nexeIndex);
        }
        return false;
    };
    /**
     *关闭下层所有list
     */
    Gjz.prototype.closeNextLists = function(levelIndex) {
        for (var i = levelIndex + 1; i < this.opts.level; i++) {
            this.hide(i);
        }
    };
    /**
     * 列表显示
     * @param {Object} levelIndex
     */
    Gjz.prototype.show = function(levelIndex) {
        this.$listContainers[levelIndex].show();
        this.isShow = true;
    };
    /**
     * 列表隐藏
     * @param {Object} levelIndex
     */
    Gjz.prototype.hide = function(levelIndex) {
        this.$listContainers[levelIndex] && this.$listContainers[levelIndex].hide();
    };
    /**
     * 隐藏整个容器
     */
    Gjz.prototype.hideContainer = function() {
        for (var i = 0; i < this.$listContainers.length; i++) {
            this.$listContainers[i].hide();
        }
        this.isShow = false;
    };
    /**
     * 获取下一层的数据
     * @param {Object} levelIndex
     * @param {Object} pid
     */
    Gjz.prototype.getNextLevelDate = function(levelIndex, pid) {
        var data = this.dataStore[levelIndex];
        if (!data) return [];
        //防止层级乱写报错
        var newData = [];
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].parid === pid) newData[newData.length] = data[i];
        }
        return newData;
    };
    /**
     * 判断一个数组中是否包含value值
     * @param arr
     * @param value
     */
    function contains(arr, value) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (value === arr[i]) return true;
        }
        return false;
    }
    /**
     * 设置checkbox的状态
     * @param {Object} box  checkbox
     * @param {Object} state  状态
     */
    function setCheckboxState(box, state) {
        if (box && box.type === "checkbox") {
            box.checked = state;
        }
    }
    Gjz.checkedUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABR0lEQVQ4T6VT3VGDQBD+vrsCPCswVqAOvksLqcBYQJBUEDsQje9SAiXEd5nECowViAXAOgc5PJBkMsobs7vfz963xD8/9ufNKjaoyjmEIYlzWxfBGkQGpR6Ki6TwZzoAJp9OAN4TMEPCBCgAmRXBInX1FsAOE3w+xJFINS4unzLbWwM0sqv3XcwOVCAfBE9qJUqdWjsNQB4lBG73sQvkDUqHqMqM4JU0VuycBZiuCZ7tAmiHyyohcV0vFvJSBIuwBjjOI+nL9P4bZm/Y1T6DR3YARGQJrceoyqVVNMTsq2wBfAsCSaH0zDJCq3iI+ZcFk0d3BOae7LQIFjfmNUqd5/5+uktcxYZluQF59AOCDYHR4GJFvkTrUfuM25f4e5AcS51GQeIr6SiwzJCJS2GbRL9pm8oYkNAGxi0MsMek073HdMgd9Hu+ASMdqhFDVly6AAAAAElFTkSuQmCC";
    Gjz.uncheckedUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA+0lEQVQ4T62T3Y2DMAzHbcz7dYQboZHC8zHCjdAROgIblBG6QTsC95xIZoQboQNgfHKUoqoKDy3HQ0SM/fMffyAUHmbeTdP0VVXV3j7P8zzWdf3jnLs9u+OjwQJF5AQAZr+qagpAxB0AfNs7ER0fQQuAmfci0mWH3xVlnyLSE1HnnBsT3I6c+UxEh5LMgsrFNwFijGYwajHzsxpmNiWd9/6AOXtvl5LsNVtOesQYYyqO9/76IiDFYQihA4ChaZrhFUAIoQWAdjtg8y9sLuLmNv7LIGXI+6N8b9+9HnZX1QsR3UTEpvUDEa3vuLpMhXlvVTWtMyKORDSU9uQPB1G/Nds28bkAAAAASUVORK5CYII=";
    Gjz.arrawUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA1klEQVQ4T53TMQ6CMBgF4L8GNxxcNCbAWTgCHcqMN/AIeAOPoKtM3oAj6A1MmASHOsrAMzWSoCktyERo/q+89JVR51kei90t9jfdb7Z39gVkBYgofzoul3wubcNqXQcQCLIhxu/Cz22IFmiHQJSWwt+aECPwGTRGGgIYIw0CTJFGAQoC4VSKIGrRUQCAB2gSVrF3Hg0AdKmnbvjbj0F/AMKhFEGiO04r0ICtq9jb93WhF1B5G8YiWxv1VX7ndSLJV9fRVVbHVDuz5K/LtMgK1f3Utmt3/QXLB3gRjd5nowAAAABJRU5ErkJggg==";
    return Gjz;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 航司多选控件，也可以用于国际舱位控件
 * @linc: MIT
 */
define("js/HSMult", [ "../js/Common" ], function(require, exports, module) {
    var defaultOpts = {
        width: 380,
        //自定义宽度
        height: null,
        //自定义高度
        hiddenName: null,
        //隐藏域name
        content: "",
        //显示的内容
        autoClose: false,
        //是否自动关闭
        defer: 2e3,
        //延迟多少秒
        allCheck: "---",
        //如果配置allCheck = "---",则在全选的时候，赋值为allCheck配置的值
        fn1: null,
        //自定义渲染title
        splitStr: "/",
        //分隔符
        fn2: null,
        //自定义渲染数据项
        qDatas: {},
        ajaxOpts: {
            type: "get"
        },
        simpleData: {
            id: "id",
            name: "name"
        },
        pos: []
    }, $ = window.jQuery, Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function HSMult(elem, options) {
        this.id = Common.cid("vetech-cabin");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.isShow = false;
        this.checkedData = {};
        //选中的数据
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.data = [];
        //存储加载的数据
        this.init();
    }
    /**
     * 初始化
     */
    HSMult.prototype.init = function() {
        this.$container = $('<div class="vetech-cabin"></div>');
        this.$container.css("width", this.opts.width);
        $(document.body).append(this.$container);
    };
    /**
     * 加载数据
     * @param callback 回调函数
     */
    HSMult.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            callback.call(this, this.data);
        } else {
            $.ajax($.extend(true, {
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                }
            }, this.opts.ajaxOpts));
        }
    };
    /**
     * 渲染数据
     */
    HSMult.prototype.render = function() {
        if ($.type(this.data) !== "array") throw new TypeError("数据格式错误，需要[object Array]格式");
        this.$container.html("");
        var $dl = $('<dl class="clearfix"></dl>');
        var $dd = $("<dd></dd>");
        $dd.css("width", "100%");
        var $ul = $('<ul class="clearfix"></ul>');
        $dd.append($ul);
        $dl.append($dd);
        var name = this.opts.simpleData.name;
        for (var i = 0, len2 = this.data.length; i < len2; i++) {
            var item2 = this.data[i];
            var $li = $('<li><label class="item no-publish-seat">' + (this.opts.fn2 ? this.opts.fn2(item2) : item2[name]) + "</label></li>");
            $li.data("data", item2);
            $ul.append($li);
        }
        this.$container.append($dl);
        if (this.data.length) {
            this.addToolbar();
        }
    };
    /**
     * 添加底部工具栏
     */
    HSMult.prototype.addToolbar = function() {
        this.$toolbar = $('<dl class="clearfix toolbar"></dl>');
        this.$toolbar.append('<dt style="width:100%;"><label class="checked-all-btn">全选</label></dt>');
        this.$container.append(this.$toolbar);
        this.bindEvent();
    };
    /**
     * 显示
     */
    HSMult.prototype.show = function() {
        if (this.elem.readOnly) return;
        //如果是readonly，则不显示
        if (this.isShow) return;
        this.setPos();
        this.isShow = true;
        this.$container.css("visibility", "visible");
    };
    /**
     * 隐藏
     */
    HSMult.prototype.hide = function() {
        if (!this.isShow) return;
        this.$container.css({
            visibility: "hidden",
            left: -1e3,
            top: -1e3
        });
        this.isShow = false;
    };
    /**
     * 设置位置
     */
    HSMult.prototype.setPos = function() {
        var pointer = this.$elem.offset(), iWidth = $(document).outerWidth(), iTop = pointer.top + this.$elem.outerHeight(), iLeft = pointer.left + this.$container.outerWidth() > iWidth ? pointer.left + this.$elem.outerWidth() - this.$container.outerWidth() : pointer.left;
        this.$container.css({
            left: iLeft,
            top: iTop
        });
    };
    /**
     * 数据回填
     */
    HSMult.prototype.writeValue = function() {
        var checked = (this.$hiddenInput.val() || "").split(this.opts.splitStr), checkedData = [], names = [], id = this.opts.simpleData.id, name = this.opts.simpleData.name;
        this.$container.find(".item").each(function(i, item) {
            var data = $(item).parent().data("data");
            if ($.inArray(data[id], checked) > -1) {
                $(item).addClass("active");
                checkedData.push(data);
                names.push(data[name]);
            }
        });
        this.$elem.val(names.join(this.opts.splitStr));
        this.opts.cbFn(checkedData);
    };
    /**
     * 全部选中
     * @param {Object} ev
     */
    HSMult.prototype.checkedAll = function(ev) {
        var $target = $(ev.target);
        if ($target.hasClass("active")) {
            $target.removeClass("active");
            this.$container.find("label").removeClass("active");
        } else {
            //全部选中
            $target.addClass("active");
            this.$container.find("label").addClass("active");
        }
        this.setValue();
    };
    /**
     * 绑定事件
     */
    HSMult.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("click.HSMult", ".checked-all-btn", $.proxy(this.checkedAll, this));
        this.$container.on("click.HSMult", ".item", $.proxy(this.itemClick, this));
        $(document).on("click.HSMult", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
        this.$container.on("click.HSMult", function() {
            return false;
        });
    };
    /**
     * 销毁
     */
    HSMult.prototype.destroy = function() {
        this.$container.off(".HSMult");
        this.$container.remove();
        $(document).off(".HSMult");
    };
    /**
     * 设置值
     */
    HSMult.prototype.setValue = function() {
        var checkeds = [], names = [], ids = [], id = this.opts.simpleData.id, name = this.opts.simpleData.name;
        this.$container.find(".item").each(function(i, item) {
            if ($(item).hasClass("active")) {
                var data = $(item).parent().data("data");
                checkeds.push(data);
                names.push(data[name]);
                ids.push(data[id]);
            }
        });
        this.$elem.val(names.join(this.opts.splitStr));
        this.$hiddenInput.val(ids.join(this.opts.splitStr));
        this.opts.cbFn(checkeds);
    };
    /**
     * 单个选项点击事件
     * @param ev
     */
    HSMult.prototype.itemClick = function(ev) {
        var $target = $(ev.target);
        if ($target.hasClass("active")) {
            $target.removeClass("active");
            this.$container.find(".checked-all-btn").removeClass("active");
        } else {
            $target.addClass("active");
            var isCheckedAll = true;
            this.$container.find(".item").each(function() {
                if (!$(this).hasClass("active")) {
                    isCheckedAll = false;
                    return false;
                }
            });
            if (isCheckedAll) {
                this.$container.find(".checked-all-btn").addClass("active");
            }
        }
        this.setValue();
    };
    return HSMult;
});

/**
 * @作者:hejie
 * @描述: 酒店热门商圈控件
 * @linc: MIT
 *
 */
define("js/HotelHotCircle", [ "../js/Pulldown", "./Common", "../js/Common" ], function(require, exports, module) {
    var pullDown = require("../js/Pulldown");
    var Common = require("../js/Common");
    var laytpl = window.layui ? window.layui.laytpl : window.laytpl;
    var defaultOptions = {
        serviceUrl: "/cdsbase/kj/cds/hotel/getHotelDistrict",
        tplUrl: "/plugins/components/tpl/hotelHotCircleTpl.html",
        pt: "asms",
        pulldown: true,
        csbh: null,
        hiddenName: "",
        simpleData: {
            id: "id",
            //隐藏域的取值字段
            name: "name"
        },
        type: 2,
        cbFn: null
    };
    function HotelHotCircle(elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.pullDown = null;
        this.$xzqSqAddressContainer = null;
        if (this.$elem.length <= 0) {
            throw new Error("DOM绑定错误【请查看页面是否渲染完毕，或者是否存在该DOM对象】");
        }
        this.opts = $.extend(true, {}, defaultOptions, options);
        this.tplCache = null;
        this.init();
    }
    HotelHotCircle.prototype.init = function() {
        this.data = null;
        //服务数据缓存
        this.bindInputEvent();
        this.$elem.data("hotelHotCircle", this);
    };
    HotelHotCircle.prototype.bindInputEvent = function() {};
    HotelHotCircle.prototype.clickEvent = function(e) {
        this.render();
    };
    HotelHotCircle.prototype.load = function(filterFn) {
        //filterFn为ajax请求成功的回调函数，对外抛出使数据内容在控件外可修改
        var csbh = $("#" + this.opts.csbh).val();
        var _this = this;
        var _mid = Math.floor(Math.random() * 1e3);
        if (!csbh) return this;
        $.ajax({
            type: "get",
            url: this.opts.serviceUrl,
            data: {
                pt: this.opts.pt,
                bh: csbh,
                _mid: _mid
            },
            success: function(data) {
                _this.data = data;
                if ($.isFunction(filterFn)) {
                    filterFn.call(_this, data);
                }
            },
            error: function(a, b, c) {
                console.log(a);
            }
        });
    };
    HotelHotCircle.prototype.render = function() {};
    HotelHotCircle.prototype.show = function() {
        var _this = this;
        //缓存模板，以免每次都请求同一个模板
        if (this.tplCache == null) {
            Common.loadTpl(this.opts.tplUrl, function(state, result) {
                if (state === "error") Common.tplError();
                _this.tplCache = result;
                _this.buildControl(result, _this.data);
            });
        } else {
            this.buildControl(this.tplCache, _this.data);
        }
    };
    HotelHotCircle.prototype.buildControl = function(tpl, data) {
        var domData = laytpl(tpl).render(data);
        this.destroy();
        this.$xzqSqAddressContainer = $($.trim(domData));
        this.bindEvent();
        this.display();
    };
    HotelHotCircle.prototype.destroy = function() {
        if (this.$xzqSqAddressContainer) {
            this.$xzqSqAddressContainer.off(".xzqSqAddressComponent");
            $(document).off(".xzqSqAddressComponent");
            this.$xzqSqAddressContainer.remove();
            this.$xzqSqAddressContainer = null;
            this.$elem.removeData("hotelHotCircle");
        }
    };
    HotelHotCircle.prototype.bindEvent = function() {
        this.$xzqSqAddressContainer.on("click.xzqSqAddressComponent", ".header li", $.proxy(this.switchTabHandler, this));
        this.$xzqSqAddressContainer.on("click.xzqSqAddressComponent", ".second_tab li", $.proxy(this.switchSecondTabHandler, this));
        this.$xzqSqAddressContainer.on("click.xzqSqAddressComponent", ".content ul:not(.second_tab) li", $.proxy(this.itemClickHandler, this));
        this.$xzqSqAddressContainer.on("click.xzqSqAddressComponent", ".header .close", $.proxy(this.closeHandler, this));
        $(document).on("mousedown.xzqSqAddressComponent", $.proxy(this.closeHandler, this));
        this.$xzqSqAddressContainer.on("mousedown.xzqSqAddressComponent", function() {
            return false;
        });
    };
    HotelHotCircle.prototype.switchTabHandler = function(ev) {
        var eDom = $(ev.target);
        var index = eDom.attr("data-index");
        eDom.parent().find("li").removeClass("active").end().end().addClass("active");
        this.$xzqSqAddressContainer.find(".content .tab-page").removeClass("active").eq(index).addClass("active");
    };
    HotelHotCircle.prototype.switchSecondTabHandler = function(ev) {
        var eDom = $(ev.currentTarget);
        var index = eDom.attr("data-index");
        eDom.parent().find("li").removeClass("active").end().end().addClass("active");
        var $page = eDom.parent().parent();
        $page.find("ul:gt(0)").hide().eq(index).show();
        if ($page.attr("page-index") === "0") {
            $page.find("ul:gt(0)").eq(index).find("li:first").addClass("active");
        }
    };
    HotelHotCircle.prototype.itemClickHandler = function(ev) {
        try {
            var data = $(ev.currentTarget).attr("data-data");
            data = JSON.parse(data);
            this.setValue(data);
            if (typeof this.opts.cbFn === "function") {
                this.opts.cbFn(data, $(this.elem));
            }
            this.destroy();
        } catch (e) {
            throw new Error("数据格式错误" + e);
        }
    };
    HotelHotCircle.prototype.closeHandler = function(ev) {
        var target = ev.target;
        if (this.$elem[0] !== target) {
            try {
                var page = this.$xzqSqAddressContainer.find(".content .tab-page.active");
                var index = page.find(".second_tab li.active").attr("data-index");
                if (page.size() <= 0 || !$.isNumeric(index)) {
                    this.destroy();
                    return;
                }
                index = parseInt(index, 10);
                var data = page.find("ul").eq(index + 1).find("li.active").data("data-data");
                data = JSON.parse(data);
                if (data && !$.isEmptyObject(data)) {
                    this.setValue(data);
                    if (typeof this.opts.cbFn === "function") {
                        this.opts.cbFn(data, $(this.elem));
                    }
                }
            } catch (e) {}
            this.destroy();
        }
    };
    HotelHotCircle.prototype.markKeyword = function(keyWord, name) {
        var raRegExp = new RegExp(keyWord, "g");
        return name.replace(raRegExp, "<i style='color:red;font-style: normal;'>" + keyWord + "</i>");
    };
    HotelHotCircle.prototype.display = function() {
        this.setPos();
        $(document.body).append(this.$xzqSqAddressContainer);
        this.$xzqSqAddressContainer.css("visibility", "visible");
    };
    HotelHotCircle.prototype.hide = function() {
        this.destroy();
    };
    HotelHotCircle.prototype.setPos = function() {
        var point = $(this.elem).offset();
        if (!this.$xzqSqAddressContainer) {
            return;
        }
        this.$xzqSqAddressContainer.css({
            left: point.left,
            top: point.top + $(this.elem).outerHeight()
        });
    };
    HotelHotCircle.prototype.isBlank = function(s) {
        if (s == null) {
            return true;
        }
        return $.trim(s) === "";
    };
    HotelHotCircle.prototype.setValue = function(data) {
        if (typeof data !== "object" || data == null) {
            return;
        }
        var simple = this.opts.simpleData;
        this.$elem.val(data[simple.name]);
        $("#" + this.opts.hiddenName).val(data[simple.id]);
    };
    module.exports = HotelHotCircle;
});

/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define("js/InputNumber", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var defaultOpts = {
        maxNum: 50,
        minNum: 0,
        defaultNum: 0,
        numSize: 1
    };
    function InputNumber(elem, options) {
        this.id = Common.cid("InputNumber");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend({}, defaultOpts, options);
        this.data = this.opts.data;
        this.cbFn = this.opts.cbFn || $.noop;
        this.maxNum = parseInt(this.opts.maxNum, 10);
        this.minNum = parseInt(this.opts.minNum, 10);
        this.numSize = parseInt(this.opts.numSize, 10);
    }
    var fn = InputNumber.prototype;
    //初始化容器
    fn.init = function() {
        this.$container = $('<div class="vetech-inputnumer"></div>');
        this.$input = $('<input type="text" class="ve-number" value="' + this.opts.defaultNum + '"/>');
        this.$button = $('<div class="ve-button">' + '<button type="button" class="iconfont">&#xe605;</button>' + '<button type="button" class="iconfont">&#xe601;</button></div>');
        this.$container.append(this.$input).append(this.$button);
        this.show();
        this.bindEvent();
    };
    //展现数据
    fn.show = function() {
        var mm = this.$elem.css("margin"), iWidth = this.$elem.width(), iHeight = this.$elem.height();
        this.$container.css({
            width: iWidth - 2,
            height: iHeight,
            margin: mm
        });
        this.$elem.after(this.$container).remove();
        this.$button.innerHeight(iHeight);
        this.$input.innerWidth(iWidth - this.$button.width() - 5);
    };
    //绑定事件
    fn.bindEvent = function() {
        var _this = this;
        this.$button.on("click", "button:first", function() {
            var value = parseInt(_this.$input.val() || 0, 10);
            if (value < _this.maxNum) {
                value = value + _this.numSize;
            }
            _this.$input.val(value);
            _this.cbFn(value);
        });
        this.$button.on("click", "button:last", function() {
            var value = _this.$input.val() || 0;
            if (value > _this.minNum) {
                value = value - _this.numSize;
            }
            _this.$input.val(value);
            _this.cbFn(value);
        });
        this.$input.on("blur", function() {
            var value = _this.$input.val();
            if (value) {
                value = parseInt(value, 10);
                if (value > _this.maxNum) {
                    value = _this.maxNum;
                } else if (value < _this.minNum) {
                    value = _this.maxNum;
                }
            } else {
                value = "";
            }
            _this.$input.val(value);
            _this.cbFn(value);
        });
        this.$input.on("keyup", function(ev) {
            ev = ev || window.event;
            var code = ev.keyCode;
            if (!(code >= 48 && code <= 57 || code === 8 || code === 46)) {
                this.value = this.value.replace(/\D/g, "");
            }
            _this.cbFn(this.value);
        });
    };
    return InputNumber;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 机场航站楼控件
 * @linc: MIT
 *
 */
define("js/JCHZL", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var laytpl = window.layui ? window.layui.laytpl : window.laytpl;
    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
        type: 1,
        typeValue: {},
        splitStr: ",",
        //默认分隔符
        itemWidth: 55,
        //选项的宽度
        tabWidth: 60,
        //选项卡的宽度
        rightWidth: 100,
        //tab-header右侧空余的宽度
        mult: false,
        //支持多选
        title: "支持中文拼音/简拼/三字码的输入",
        hotSimpleData: {
            //热门机场显示名称
            id: "nbbh",
            name: "hzlqm"
        },
        hzlOpts: {
            //航站楼配置参数
            type: 2,
            simpleData: {
                id: "nbbh",
                name: "hzlqm"
            },
            qDatas: {
                dldh: ""
            },
            backContent: "点击返回城市列表",
            typeValue: "../data/hzl.json"
        },
        simpleData: {
            id: "bh",
            name: "name"
        },
        cbFn: function() {}
    };
    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function JCHZL(elem, options) {
        this.id = Common.cid("JCHZL");
        this.elem = elem;
        this.$elem = $(elem);
        this.data = {};
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.isShow = false;
        //标记是否已经显示
        //把初始化的数据存储起来
        this.tempData = {};
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.iNow = 0;
    }
    /**
     * 加载数据
     * @param callback 回调函数
     */
    JCHZL.prototype.load = function(callback) {
        if ($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                dataType: "json",
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        }
    };
    /**
     * 存储数据
     */
    JCHZL.prototype.storeData = function() {
        var data = this.data;
        var id = this.opts.simpleData.id;
        var hotId = this.opts.hotSimpleData.id;
        for (var i = 0, len = data.length; i < len; i++) {
            for (var j = 0, len2 = data[i].groups.length; j < len2; j++) {
                var items = data[i].groups[j].items;
                for (var k = 0, len3 = items.length; k < len3; k++) {
                    var item = items[k];
                    this.tempData[item[hotId] || item[id]] = item;
                }
            }
        }
    };
    /**
     * 初始化
     */
    JCHZL.prototype.init = function(callback) {
        var _this = this;
        this.storeData();
        var data = {
            title: this.opts.title,
            simpleData: this.opts.simpleData,
            hotSimpleData: this.opts.hotSimpleData,
            list: this.data
        };
        Common.loadTpl(window.CTPL.JCHZL, function(state, result) {
            if ("error" === state) Common.tplError();
            laytpl(result).render(data, function(html) {
                _this.$container = $(html);
                $(document.body).append(_this.$container);
                _this.setWidth();
                _this.bindEvent();
                _this.tabClick(_this.$container.find(".tab").eq(_this.iNow).find("a"));
                if (callback) callback.call(_this);
            });
        });
    };
    /**
     * 设置容器的宽度
     */
    JCHZL.prototype.setWidth = function() {
        var $tabs = this.$container.find(".tab-header").find("li");
        $tabs.css("width", this.opts.tabWidth);
        this.$container.width($tabs.length * this.opts.tabWidth + this.opts.rightWidth);
        this.$container.find(".tab-content").find("li").width(this.opts.itemWidth);
    };
    /**
     * 绑定相关事件
     */
    JCHZL.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("click.JCHZL", ".tab", function(ev) {
            _this.tabClick($(ev.target));
        });
        this.$container.on("click.JCHZL", ".item", $.proxy(this.itemClick, this));
        this.$container.on("click.JCHZL", function() {
            return false;
        });
        this.$container.on("click.JCHZL", ".close", $.proxy(this.hide, this));
        $(document).on("click.JCHZL", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
        this.$container.on("click.JCHZL", ".backBtn", function() {
            _this.$container.find(".tab-content").eq(_this.iNow).addClass("active");
            _this.hzl.hide();
        });
        this.$container.on("click.jCHZL", ".hzlItem", function() {
            var data = $(this).data("data");
            _this.setValue(data, true);
            _this.opts.cbFn(data, true);
            _this.hide();
        });
    };
    /**
     * 选项卡卡头点击事件
     * @param $target
     */
    JCHZL.prototype.tabClick = function($target) {
        var $tabs = this.$container.find(".tab"), $contents = this.$container.find(".tab-content"), currIndex = $target.data("index");
        $tabs.find("a").removeClass("active");
        $contents.removeClass("active");
        $tabs.eq(currIndex).find("a").addClass("active");
        $contents.eq(currIndex).addClass("active");
        this.iNow = currIndex;
    };
    /**
     * 具体选项点击事件
     */
    JCHZL.prototype.itemClick = function(ev) {
        var target = ev.target, $target = $(target), id = target.id, result = this.tempData[id];
        if (!$target.is("a")) return;
        //点击的热门机场
        if ($target.hasClass("hot")) {
            this.setValue(result, true);
            this.opts.cbFn(result, true);
            this.hide();
        } else {
            this.tabItemClick(result);
        }
    };
    /**
     * tab选项卡点击事件（beforeItemClick）
     * @param data
     */
    JCHZL.prototype.tabItemClick = function(data) {
        var _this = this;
        this.opts.hzlOpts.qDatas = {
            dldh: data.dldh
        };
        this.opts.hzlOpts.cityData = data;
        this.hzl = new Hzl(this.opts.hzlOpts);
        this.hzl.load(function(data) {
            this.data = data.result;
            this.render();
            _this.$container.append(this.$container);
            _this.$container.find(".tab-content").eq(_this.iNow).removeClass("active").end().last().addClass("active");
        });
    };
    /**
     * 设置值
     * @param data
     * @param isHot 是否热门
     */
    JCHZL.prototype.setValue = function(data, isHot) {
        var id = isHot ? this.opts.hotSimpleData.id : this.opts.simpleData.id;
        var name = isHot ? this.opts.hotSimpleData.name : this.opts.simpleData.name;
        var keys = [], values = [];
        if (this.opts.mult) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    keys.push(data[key][id]);
                    values.push(data[key][name]);
                }
            }
        } else {
            keys.push(data[id]);
            values.push(data[name]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
    };
    /**
     * 显示
     */
    JCHZL.prototype.show = function() {
        if (!this.isShow) {
            this.setPos();
            this.$container.show();
            this.isShow = true;
        }
    };
    /**
     * 隐藏
     */
    JCHZL.prototype.hide = function() {
        if (this.isShow) {
            this.$container.hide();
            this.isShow = false;
        }
    };
    /**
     * 设置位置
     */
    JCHZL.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    /**
     * 销毁
     */
    JCHZL.prototype.destroy = function() {
        this.$container.off(".JCHZL");
        $(document).off(".JCHZL");
        this.$container.remove();
    };
    /**
     * 航站楼构造函数
     * @param data
     * @constructor
     */
    function Hzl(options) {
        this.id = Common.cid("HZL");
        this.opts = $.extend(true, {}, options);
        this.init();
    }
    Hzl.prototype = {
        init: function() {
            this.$container = $("<div class='vetech-jchzl-container tab-content'>");
        },
        load: function(callback) {
            var _this = this;
            $.ajax({
                url: this.opts.typeValue,
                type: "get",
                dataType: "json",
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        },
        render: function() {
            var data = this.data, id = this.opts.simpleData.id, name = this.opts.simpleData.name;
            var $div = $('<div class="city-header clearfix"><span>' + this.opts.cityData.dlmc + '</span><span class="backBtn">' + this.opts.backContent + "</span></div>");
            this.$container.append($div);
            var $ul = $('<ul class="clearfix"></ul>');
            for (var i = 0, len = data.length; i < len; i++) {
                var $li = $('<li class="hzlItem" id="' + data[i][id] + '">' + data[i][name] + "</li>");
                $li.data("data", data[i]);
                $ul.append($li);
            }
            this.$container.append($ul);
        },
        show: function() {
            this.$container.show();
        },
        hide: function() {
            this.$container.remove();
        }
    };
    return JCHZL;
});

/**
 * @作者:yilia 
 * @时间：2018.1.3
 * @描述: 旅游出发地控件
 *
 */
define("js/LYCFD", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var laytpl = window.layui.laytpl;
    /**
	 * 默认参数
	 */
    var defaultOptions = {
        simpleData: {
            id: "id",
            name: "name"
        },
        autoClose: false,
        //是否自动关闭
        writeValue: [],
        //数据回填
        renderFn: null,
        //自定义渲染函数
        isAuto: false,
        //内容页中的选项是否根据内容自适应，默认是false，即以...代替，如果为true
        type: 1,
        typeValue: "",
        pt: "ASMS",
        //平台
        csbh: "",
        //城市编号
        queryUrl: "/webcomponent/travel/kjcommtravel/searchTravelCity",
        //查询的url
        maxNum: 20,
        size: 10,
        //搜索时，默认显示10条数据
        cbFn: function() {}
    };
    /**
	 * 加载模板
	 */
    function LYCFD(elem, options) {
        this.id = Common.cid("LYCFD");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOptions, options);
        this.cbFn = this.opts.cbFn || $.noop();
        this.isShow = false;
        //标记是否已经显示
        this.isComming = false;
        this.loadShow = null;
    }
    var fn = LYCFD.prototype;
    /**
     * 加载数据
     * @param callback 回调函数
     */
    fn.load = function(callback) {
        if ($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                dataType: "json",
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        }
    };
    /**
     * 初始化
     */
    fn.init = function(callback) {
        var _this = this;
        Common.loadTpl(_this.opts.tplUrl, function(state, result) {
            if ("error" === state) Common.tplError();
            laytpl(result).render(_this.data, function(html) {
                _this.$mddContainer = $(html);
                $(document.body).append(_this.$mddContainer);
                _this.setWidth();
                _this.bindEvent();
                _this.show();
            });
        });
    };
    /**
	 * 数据回填
	 */
    fn.writeValue = function() {
        var result = this.opts.writeValue;
        if (result && result.length > 0) {
            this.$mddContainer.find(".em-none").hide();
            for (var i = 0, len = result.length; i < len; i++) {
                this.addSpan(result[i]);
            }
        }
    };
    /**
	 * 展示
	 */
    fn.show = function() {
        if (!this.isShow) {
            this.setPos();
            $(document.body).append(this.$mddContainer);
            this.$mddContainer.show();
            this.setWidth();
            this.isShow = true;
        }
    };
    fn.setPos = function() {
        var point = this.$elem.offset();
        this.$mddContainer.css({
            left: point.left,
            top: point.top + this.$elem.outerHeight()
        });
    };
    /**
     * 隐藏
     */
    fn.hide = function() {
        if (this.isShow) {
            this.$mddContainer.hide();
            this.isShow = false;
        }
    };
    /**
	 * 设置已经选择的宽度
	 */
    fn.setWidth = function() {
        var iWidth = this.$mddContainer.find(".header li").length * 60 + 50;
        this.$mddContainer.find(".search-container div").width(iWidth - 85);
        this.$mddContainer.find(".list-container").width(iWidth - 85);
        this.$mddContainer.width(iWidth);
    };
    fn.bindEvent = function() {
        var _this = this;
        this.$mddContainer.on("keyup.mddComponent", ".searchTxt", function(ev) {
            _this.searchHandler($(this), ev);
        });
        this.$mddContainer.on("click.mddComponent", ".header li", function() {
            _this.switchTabHandler($(this));
        });
        this.$mddContainer.on("click.mddComponent", ".list-container li", function() {
            _this.addCityHandler($(this));
        });
        this.$mddContainer.on("click.mddComponent", ".content li", function() {
            _this.itemClickHandler($(this));
        });
        this.$mddContainer.on("click.mddComponent", ".choosedCity", function() {
            _this.choosedCityClickHandler($(this));
            return false;
        });
        this.$mddContainer.on("keyup.mddComponent", ".focusInput", function(ev) {
            _this.choosedCityKeyHandler($(this), ev);
        });
        this.$mddContainer.on("click.mddComponent", ".sureBtn", function() {
            _this.sureHandler($(this));
        });
        this.$mddContainer.on("click.mddComponent", ".search-container div", function() {
            _this.setFocus($(this));
        });
        $(document).on("mousedown.mddComponent", function() {
            _this.hide();
        });
        this.$mddContainer.on("mousedown.mddComponent", function() {
            return false;
        });
        //是否自动关闭
        if (this.opts.autoClose) {
            this.$mddContainer.on("mouseleave", function() {
                _this.isComming = false;
                _this.hide();
            });
        }
        this.$mddContainer.on("mouseenter", function() {
            _this.isComming = true;
        });
    };
    /**
	 * 模糊搜索查询
	 * @param {Object} obj
	 * @param {Object} ev
	 */
    fn.searchHandler = function(obj, ev) {
        var _this = this;
        var value = this.$mddContainer.find(".searchTxt").val();
        var keyCode = ev.keyCode;
        var $container = _this.$mddContainer.find(".list-container");
        var $currLi = $container.find(".active");
        if (keyCode === 8 && !value) {
            //删除选中的
            if ($(obj).data("isNull")) {
                $(obj).parents(".search-container").find(".choosedCity").last().remove();
                this.warnMaxNum();
            } else {
                this.$mddContainer.find(".tab-container").show().end().find(".list-container").hide();
                $(obj).data("isNull", true);
            }
        } else if (keyCode === 38) {
            //方向键↑
            if ($currLi.length) {
                if (!$currLi.prev("li").length) return;
                //如果当前选中的列已经是第一列了，就不往上选中了
                $currLi.prev("li").addClass("active");
                $currLi.removeClass("active");
            }
        } else if (keyCode === 40) {
            //方向键↓
            if (!$currLi.length) {
                $container.find("li").eq(0).addClass("active");
            } else {
                if (!$currLi.next("li").length) return;
                $currLi.next("li").addClass("active");
                $currLi.removeClass("active");
            }
        } else if (keyCode === 13) {
            //enter
            if ($container.find(".active").length > 0) {
                this.addCityHandler($container.find(".active"));
            }
        } else {
            var iWidth = _this.calcInputWdith(value);
            $(obj).css("width", iWidth + 20);
            this.$mddContainer.find(".tab-container").hide().end().find(".list-container").show();
            $(obj).data("isNull", false);
            $.ajax({
                type: "get",
                url: _this.opts.queryUrl,
                data: {
                    pt: _this.opts.pt,
                    size: _this.opts.size,
                    qStr: value
                },
                dataType: "json",
                success: function(data) {
                    if (_this.opts.type === "cfd") {
                        data = data.data || [];
                    } else {
                        data = _this.formatData(data);
                    }
                    _this.renderList(data);
                }
            });
        }
    };
    /**
	 * 渲染
	 * @param data
     */
    fn.renderList = function(data) {
        var $frag = $(document.createDocumentFragment());
        var keyWord = $.trim($(".searchTxt").val());
        for (var i = 0, len = data.length; i < len; i++) {
            var $li = $("<li>" + markKeyword(data[i][this.opts.simpleData.name]) + "</li>");
            if (this.opts.renderFn) {
                $li = this.opts.renderFn(data[i], keyWord);
            }
            $li.data("data", data[i]);
            $frag.append($li);
        }
        this.$mddContainer.find(".list-container").html("").append($frag);
    };
    /**
	 * 标记关键字
	 * @param name
     */
    function markKeyword(name) {
        var keyWord = $.trim($(".searchTxt").val());
        var raRegExp = new RegExp(keyWord, "g");
        return name.replace(raRegExp, "<i style='color:red;font-style: normal;'>" + keyWord + "</i>");
    }
    /**
	 * 计算input的宽度
	 */
    fn.calcInputWdith = function(value) {
        var $span = $("<span style='left:-1000px;position:absolute'>" + value + "</span>");
        $(document.body).append($span);
        var iWidth = $span.width();
        $span.remove();
        return iWidth;
    };
    /**
	 * tab页切换
	 */
    fn.switchTabHandler = function(obj) {
        var index = $(obj).data("index");
        $(obj).parent().find("li").removeClass("active").end().end().addClass("active");
        this.$mddContainer.find(".content div").removeClass("active").eq(index).addClass("active");
    };
    fn.addCityHandler = function(obj) {
        this.$mddContainer.find(".tab-container").show().end().find(".list-container").hide();
        var data = $(obj).data("data"), $searchTxt = this.$mddContainer.find(".searchTxt"), id = data[this.opts.simpleData.id];
        //添加的时候，需要对其进行判断，防止重复添加,如果设置了最大值，则超出不许添加
        if (!this.$mddContainer.find(".search-container").find("#" + id).length) {
            this.warnMaxNum();
            if (this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum) {
                this.addSpan(data);
            }
        } else {
            $searchTxt.val("").focus();
        }
        $searchTxt.css("width", 20);
    };
    /*判断已选数据是否超出最大限制个数，超出则提示，不超出则正常添加*/
    fn.warnMaxNum = function() {
        var _this = this;
        if (this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum) {
            this.$mddContainer.find(".search-container div").css("border", "1px solid #76b5f4").find("p").remove();
        } else {
            this.$mddContainer.find(".search-container .searchTxt").val("");
            this.$mddContainer.find(".search-container div").css("border", "1px solid red");
            if (this.$mddContainer.find(".choose-warn").length === 0) {
                var $p = $("<p style='color:red' class='choose-warn'>您最多能选择" + this.opts.maxNum + "个地方</p>");
                this.$mddContainer.find(".search-container div").append($p);
            }
            setTimeout(function() {
                _this.$mddContainer.find(".search-container div").css("border", "1px solid #76b5f4").find("p").remove();
            }, 2e3);
        }
    };
    /**
	 * 格式化数据(目的地城市)
	 * @param data
     */
    fn.formatData = function(data) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var newData = {};
            newData[this.opts.simpleData.id] = data[i].BH;
            newData[this.opts.simpleData.name] = data[i].MC;
            $.extend({}, newData, data[i]);
            result.push(newData);
        }
        //其他属性保持不变
        return result;
    };
    /**
	 * 添加选中的区块
	 */
    fn.addSpan = function(data) {
        var $input = this.$mddContainer.find(".search-container .searchTxt");
        var $span = $("<span id='" + data[this.opts.simpleData.id] + "' class='choosedCity'>" + data[this.opts.simpleData.name] + ";<input class='focusInput'/></span>");
        $span.data("data", data);
        $span.insertBefore($input);
        $input.val("").focus();
    };
    /**
	 * 选择
	 */
    fn.itemClickHandler = function(obj) {
        try {
            var data = $(obj).data("data");
            var id = data[this.opts.simpleData.id];
            //点击之前，先判断是否已经选择，如果选择后，就不再进行添加
            if (!this.$mddContainer.find(".search-container").find("#" + id).length) {
                this.warnMaxNum();
                if (this.$mddContainer.find(".search-container").find("span").length < this.opts.maxNum) {
                    this.addSpan(data);
                }
            }
            this.$mddContainer.find(".em-none").hide();
        } catch (e) {
            throw new Error("数据格式错误" + e);
        }
    };
    /**
	 * 确认选择
	 */
    fn.sureHandler = function(obj) {
        var result = [];
        this.$mddContainer.find(".choosedCity").each(function() {
            var tempData = $(this).data("data");
            result.push(tempData);
        });
        if (this.cbFn) this.cbFn(result);
        this.hide();
    };
    fn.setFocus = function(obj) {
        this.$mddContainer.find(".em-none").hide();
        $(obj).find("input").focus();
    };
    /**
	 * 点击已经选择的城市，给其选中标记，并设置焦点
	 */
    fn.choosedCityClickHandler = function(obj) {
        $(obj).parent().find("span").removeClass("active").end().end().addClass("active");
        $(obj).find("input").focus();
    };
    //按删除键，可以删除已经选择的城市
    fn.choosedCityKeyHandler = function(obj, ev) {
        if (ev.keyCode === 8) {
            $(obj).parent().remove();
            this.$mddContainer.find(".searchTxt").focus();
            this.warnMaxNum();
        }
    };
    return LYCFD;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 多选下拉框
 * @linc: MIT
 *
 */
define("js/MultSelect", [ "../js/Common" ], function(require, exports, module) {
    /**
     * 默认配置参数
     * @type {{width: number, height: number, type: number, typeValue: Array, simpleData: {id: string, name: string, title: null}, hiddenName: string, splitStr: string, hasAllChecked: boolean, usetype: string, editable: boolean, fn1: null}}
     */
    var defaultOpts = {
        width: null,
        height: 120,
        type: 1,
        typeValue: [],
        simpleData: {
            id: "id",
            name: "name",
            title: null
        },
        formatPostData: function(data) {
            return data;
        },
        //格式化发送请求的数据
        ajaxOpts: {
            type: "get"
        },
        defaultValues: null,
        //默认显示的值，默认不会配置，==请选择==
        qDatas: {},
        //查询参数
        hiddenName: "",
        //隐藏域id
        splitStr: ",",
        //分隔符
        hasAllChecked: false,
        //是否有全选功能
        usetype: "mult",
        //默认是多选的
        disbale: false,
        //是否不可编辑
        fn1: null,
        //自定义渲染
        cbFn: function() {}
    };
    var Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function MultSelect(elem, options) {
        this.id = Common.cid("MultSelect");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.isShow = false;
        //默认是没有显示的
        //隐藏域
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.checked = null;
        //选择的对象值，这个属性只针对单选
        this.init();
    }
    /**
     * 初始化
     */
    MultSelect.prototype.init = function() {
        this.$elem.addClass("ve-arrow-down");
        this.$container = $('<div class="mult-select">');
        var width = this.opts.width;
        width = width ? width : this.$elem.outerWidth();
        this.$container.css({
            width: width,
            height: this.opts.height
        });
    };
    /**
     * 加载数据
     * @param callback
     */
    MultSelect.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax($.extend(true, {
                type: "get",
                url: this.opts.typeValue,
                dataType: "json",
                data: this.opts.formatPostData(this.opts.qDatas),
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    throw new Error("数据加载错误" + msg);
                }
            }, this.opts.ajaxOpts));
        }
    };
    /**
     * 初始化
     */
    MultSelect.prototype.render = function() {
        var sd = this.opts.simpleData, dvs = this.opts.defaultValues, value = "", title = "";
        if (!this.data.length) return;
        var keys = this.$hiddenInput.val() || "";
        keys = keys.split(this.opts.splitStr);
        //多选下拉全选功能
        if (this.opts.usetype === "mult" && this.opts.hasAllChecked) {
            var $allChecked = $('<label class="allChecked checkbox" title="全选">全选<input type="checkbox"></label>');
            this.$container.append($allChecked);
        } else if (this.opts.usetype === "radio" && this.opts.defaultValues) {
            //单选，可能要配置==请选择==
            value = dvs[sd.name];
            title = dvs[sd.title];
            var $firstLabel = $('<label class="item" title="' + title + '">' + value + "</label>");
            $firstLabel.data("data", this.opts.defaultValues);
            this.$container.append($firstLabel);
        }
        for (var i = 0, len = this.data.length; i < len; i++) {
            value = this.opts.fn1 ? this.opts.fn1(this.data[i]) : this.data[i][sd.name];
            title = sd.title ? this.data[i][sd.title] : value;
            var $label = $('<label class="item" title="' + title + '">' + value + "</label>");
            if (this.opts.usetype === "mult") {
                $label.addClass("checkbox").append('<input type="checkbox" value="' + this.data[i][sd.id] + '">');
                if ($.inArray(this.data[i][sd.id], keys) !== -1) {
                    $label.find("input").get(0).checked = true;
                }
            }
            if (!this.checked && this.opts.usetype === "radio") {
                if ($.inArray(this.data[i][sd.id], keys) !== -1) {
                    this.checked = this.data[i];
                }
            }
            $label.data("data", this.data[i]);
            this.$container.append($label);
        }
        $(document.body).append(this.$container);
        this.bindEvent();
        this.writeValue();
    };
    /**
     * 显示
     */
    MultSelect.prototype.show = function() {
        if (this.isShow) return;
        this.$elem.removeClass("ve-arrow-down").addClass("ve-arrow-up");
        this.setPos();
        this.$container.css("visibility", "visible");
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    MultSelect.prototype.hide = function() {
        if (!this.isShow) return;
        this.$elem.removeClass("ve-arrow-up").addClass("ve-arrow-down");
        this.$container.css({
            visibility: "hidden",
            left: -1e3,
            top: -1e3
        });
        this.isShow = false;
    };
    /**
     * 设置位置
     */
    MultSelect.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    /**
     * 销毁整个控件
     */
    MultSelect.prototype.destroy = function() {
        this.$container.off(".multSelect");
        this.$container.remove();
    };
    /**
     * 绑定事件
     */
    MultSelect.prototype.bindEvent = function() {
        var _this = this;
        if (this.opts.usetype === "mult") {
            this.$container.on("change.multSelect", ".item", $.proxy(this.setValue, this));
        } else {
            this.$container.on("click.multSelect", ".item", function() {
                var data = $(this).data("data");
                _this.setValue(data);
            });
        }
        //全选功能
        if (this.opts.hasAllChecked) {
            this.$container.on("change.multSelect", ".allChecked", function() {
                var state = $(this).find("input").get(0).checked;
                _this.$container.find("input[type='checkbox']").each(function(i, item) {
                    item.checked = state;
                });
                _this.setValue();
            });
        }
        this.$container.on("mousedown.multSelect", function() {
            return false;
        });
        $(document).on("mousedown.multSelect", function(ev) {
            var target = ev.target;
            if (target !== _this.elem) _this.hide();
        });
        //如果不可编辑，则不让输入
        if (this.opts.disabled) {
            this.$elem.on("keydown.multSelect", function() {
                return false;
            });
        }
    };
    /**
     * 设置值
     * @param data 设置值
     */
    MultSelect.prototype.setValue = function(data) {
        var result = [], keys = [], values = [], sd = this.opts.simpleData;
        if (this.opts.usetype === "mult") {
            var $checkedBox = this.$container.find("input[type='checkbox']:checked");
            var checkedCount = 0;
            $checkedBox.each(function(i, item) {
                var $label = $(item).parents("label");
                if ($label.hasClass("allChecked")) return true;
                var data = $label.data("data");
                result.push(data);
                keys.push(data[sd.id]);
                values.push(data[sd.name]);
                checkedCount++;
            });
            //设置全选是否选中
            var $allChecked = this.$container.find(".allChecked");
            if ($allChecked.length) {
                $allChecked.find("input").get(0).checked = checkedCount === this.$container.find("input[type='checkbox']").length - 1;
            }
        } else {
            values.push(data[sd.name]);
            keys.push(data[sd.id]);
            this.hide();
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(this.opts.usetype === "mult" ? result : data);
    };
    /**
     * 数据回填
     */
    MultSelect.prototype.writeValue = function() {
        if (this.checked) {
            this.setValue(this.checked);
            delete this.checked;
        }
    };
    return MultSelect;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 多选搜索
 * @linc: MIT
 */
define("js/MultSelectAndSearch", [ "../js/Common" ], function(require, exports, module) {
    var defaultOpts = {
        simpleData: {
            id: "id",
            name: "name"
        },
        ajaxOpts: {},
        title1: "已选择的城市",
        title2: "未选择的城市",
        qDatas: {},
        //查询参数
        hiddenName: "",
        //隐藏域id
        splitStr: ","
    }, $ = window.jQuery, Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function MultSelectAndSearch(elem, options) {
        this.id = Common.cid("MultSelectAndSearch");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, defaultOpts, options);
        this.checkedData = [];
        //已经选择的
        this.unCheckedData = [];
        //未选择的
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.init();
    }
    /**
     * 初始化
     */
    MultSelectAndSearch.prototype.init = function() {
        this.$container = $('<div class="multSelectAndSearch">');
        //查询区域
        this.$searchContent = $('<div class="searchContent"><input type="text" class="searchTxt" placeholder="请输入检索"></div>');
        //内容区
        var $content = $('<div class="content">');
        this.$leftConent = $('<div class="leftContent"><p>' + this.opts.title1 + '</p><select multiple="multiple"></select></div>');
        this.$centerContent = $('<div class="centerContent"></div>');
        var $add = $('<input type="button" class="add" value="添加"/>'), $addAll = $('<input type="button" class="addAll" value="全部添加"/>'), $del = $('<input type="button" class="del" value="删除"/>'), $delAll = $('<input type="button" class="delAll" value="全部删除"/>');
        this.$centerContent.append($add).append($addAll).append($del).append($delAll);
        this.$rightContent = $('<div class="leftContent"><p>' + this.opts.title2 + '</p><select multiple="multiple"></select></div>');
        $content.append(this.$leftConent).append(this.$centerContent).append(this.$rightContent);
        //底部工具条
        this.$toolbarContent = $('<div class="toolbarContent"><input type="button" class="sureBtn" value="确认选择"><input type="button" class="closeBtn" value="关闭窗口"></div>');
        this.$container.append(this.$searchContent).append($content).append(this.$toolbarContent);
        $(document.body).append(this.$container);
        this.bindEvent();
    };
    /**
     *加载数据
     * @param callback
     */
    MultSelectAndSearch.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            var data = $.extend(true, {}, this.opts.typeValue);
            this.checkedData = data.checked || [];
            this.unCheckedData = data.unChecked || [];
            callback.call(_this, data);
            this.opts.typeValue = null;
        } else {
            $.ajax($.extend(true, {
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data || [];
                    callback.call(_this, data);
                }
            }, this.opts.ajaxOpts));
        }
    };
    /**
     * 数据回填
     */
    MultSelectAndSearch.prototype.writeValue = function() {
        this.checkedData = [];
        this.unCheckedData = [];
        var checkedIds = this.$hiddenInput && this.$hiddenInput.val() || "";
        if (!checkedIds) {
            this.checkedData = [];
            this.unCheckedData = $.extend(true, [], this.data);
        } else {
            var ids = checkedIds.split(this.opts.splitStr), id = this.opts.simpleData.id, item;
            for (var i = 0, len = this.data.length; i < len; i++) {
                item = this.data[i];
                if ($.inArray(item[id], ids) > -1) {
                    this.checkedData.push(item);
                } else {
                    this.unCheckedData.push(item);
                }
            }
        }
        this.data = [];
    };
    /**
     * 渲染
     */
    MultSelectAndSearch.prototype.render = function() {
        this.$searchContent.find(".searchTxt").val("");
        this.rendered(this.$leftConent.find("select").empty(), this.checkedData);
        this.rendered(this.$rightContent.find("select").empty(), this.unCheckedData);
    };
    /**
     * 渲染已经选择的
     */
    MultSelectAndSearch.prototype.rendered = function($select, data) {
        var id = this.opts.simpleData.id, name = this.opts.simpleData.name, $option, renderFn = this.opts.fn1, isCustom = $.type(renderFn) === "function", item;
        for (var i = 0, len = data.length; i < len; i++) {
            item = data[i];
            $option = isCustom ? renderFn(item) : $('<option  title="' + item[name] + '" value="' + item[id] + '">' + item[name] + "</option>");
            $select.append($option);
        }
    };
    /**
     * 绑定事件
     */
    MultSelectAndSearch.prototype.bindEvent = function() {
        var _this = this;
        this.$leftConent.on("dblclick.MultSelectAndSearch", "option", function(ev) {
            _this.revertData("checkedData", [ $(ev.target).val() ]);
            _this.render();
        });
        this.$rightContent.on("dblclick.MultSelectAndSearch", "option", function(ev) {
            _this.revertData("unCheckedData", [ $(ev.target).val() ]);
            _this.render();
        });
        this.$centerContent.on("click.MultSelectAndSearch", ".add", function() {
            var values = _this.$rightContent.find("select").val();
            _this.revertData("unCheckedData", values);
            _this.render();
        }).on("click.MultSelectAndSearch", ".addAll", function() {
            _this.checkedData = _this.checkedData.concat(_this.unCheckedData);
            _this.unCheckedData = [];
            _this.render();
        }).on("click.MultSelectAndSearch", ".del", function() {
            var values = _this.$leftConent.find("select").val();
            _this.revertData("checkedData", values);
            _this.render();
        }).on("click.MultSelectAndSearch", ".delAll", function() {
            _this.unCheckedData = _this.unCheckedData.concat(_this.checkedData);
            _this.checkedData = [];
            _this.render();
        });
        $(document).on("click.MultSelectAndSearch", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
        this.$container.on("click", function() {
            return false;
        });
        this.$searchContent.on("keyup.MultSelectAndSearch", ".searchTxt", $.proxy(this.filterHandler, this));
        this.$toolbarContent.on("click.MultSelectAndSearch", ".sureBtn", $.proxy(this.sureHandler, this));
        this.$toolbarContent.on("click.MultSelectAndSearch", ".closeBtn", $.proxy(this.closeHandler, this));
    };
    /**
     *
     */
    MultSelectAndSearch.prototype.revertData = function(dataKey, values) {
        var newArr = [], tempArr = [], id = this.opts.simpleData.id, item;
        for (var i = 0, len = this[dataKey].length; i < len; i++) {
            item = this[dataKey][i];
            if ($.inArray(item[id], values) > -1) {
                tempArr.push(item);
            } else {
                newArr.push(item);
            }
        }
        this[dataKey] = newArr;
        var reverKey = dataKey === "checkedData" ? "unCheckedData" : "checkedData";
        this[reverKey] = this[reverKey].concat(tempArr);
    };
    /**
     * 显示
     */
    MultSelectAndSearch.prototype.show = function() {
        this.setPos();
        this.$container.show();
    };
    MultSelectAndSearch.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight() + 2
        });
    };
    /**
     * 隐藏
     */
    MultSelectAndSearch.prototype.hide = function() {
        this.$container.hide();
    };
    /**
     * 销毁
     */
    MultSelectAndSearch.prototype.destroy = function() {
        this.$container.off(".MultSelectAndSearch");
        this.$container.remove();
    };
    /**
     * 确认操作
     */
    MultSelectAndSearch.prototype.sureHandler = function() {
        var id = this.opts.simpleData.id, name = this.opts.simpleData.name, item, items = [], ids = [], names = [];
        for (var i = 0, len = this.checkedData.length; i < len; i++) {
            item = this.checkedData[i];
            ids.push(item[id]);
            names.push(item[name]);
            items.push(item);
        }
        this.$elem.val(names.join(this.opts.splitStr));
        this.$hiddenInput.val(ids.join(this.opts.splitStr));
        this.hide();
        this.opts.cbFn(items);
    };
    /**
     * 关闭操作
     */
    MultSelectAndSearch.prototype.closeHandler = function() {
        this.hide();
    };
    /**
     * 过滤数据
     */
    MultSelectAndSearch.prototype.filterHandler = function() {
        var value = this.$searchContent.find(".searchTxt").val(), hasFilterFn = $.type(this.opts.filterFn) === "function", filterFn = this.opts.filterFn, id = this.opts.simpleData.id, name = this.opts.simpleData.name, newArr = [], item;
        for (var i = 0, len = this.unCheckedData.length; i < len; i++) {
            item = this.unCheckedData[i];
            if (!hasFilterFn) {
                if (item[id].indexOf(value) > -1 || item[name].indexOf(value) > -1) {
                    newArr.push(item);
                }
            } else {
                if (filterFn(item, value)) {
                    newArr.push(item);
                }
            }
        }
        this.rendered(this.$rightContent.find("select").empty(), newArr);
    };
    return MultSelectAndSearch;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 悬浮层控件
 * @linc: MIT
 *
 */
define("js/Popup", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        width: 200,
        height: 100,
        position: "down",
        arraw_down: "img/down.png",
        arraw_up: "img/up.png",
        triggerType: "mousemove",
        beforeDestroy: function() {
            return true;
        },
        setEvent: function() {},
        //设置事件函数
        defer: 100,
        //关闭窗口延时时间
        createOnce: true
    };
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function Popup(elem, options) {
        this.id = Common.cid("vetech-popup");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.init();
        this.isShow = false;
    }
    /**
     * 初始化
     */
    Popup.prototype.init = function() {
        this.$container = $('<div class="vetech-popup">');
        var $content = $('<div class="content">');
        this.$container.append($content);
        var $img = $("<img>");
        if (this.opts.position === "down") {
            $content.addClass("upContent");
            $img.addClass("arraw_up").attr("src", this.opts.arraw_up);
        } else {
            $content.addClass("downContent");
            $img.addClass("arraw_down").attr("src", this.opts.arraw_down);
        }
        $img.css("left", (this.opts.width - 20) / 2);
        this.$container.append($img);
        this.$container.css({
            width: this.opts.width,
            height: this.opts.height
        });
        $(document.body).append(this.$container);
        this.bindEvent();
    };
    /**
     * 添加内容
     */
    Popup.prototype.addContent = function(html) {
        this.$container.find(".content").append(html);
    };
    /**
     * 显示
     */
    Popup.prototype.show = function() {
        if (this.isShow) return;
        this.setPos();
        this.$container.show();
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    Popup.prototype.hide = function() {
        if (!this.isShow) return;
        this.$container.hide();
        this.isShow = false;
    };
    /**
     * 销毁
     */
    Popup.prototype.destroy = function() {
        if ($.type(this.opts.beforeDestroy) === "function" && this.opts.beforeDestroy()) {
            $(document).off(".popup");
            this.$elem.off(".popup");
            this.$container.off(".popup");
            this.$container.remove();
        }
    };
    /**
     * 绑定事件
     */
    Popup.prototype.bindEvent = function() {
        var _this = this;
        _this.timer = null;
        _this.state = null;
        //当前状态
        if (this.opts.triggerType === "click") {
            this.opts.defer = 0;
        }
        $(document).on(this.opts.triggerType + ".popup", function(ev) {
            clearTimeout(_this.timer);
            var target = ev.target;
            if (target !== _this.elem && $(target).closest(".vetech-popup").get(0) !== _this.$container.get(0)) {
                _this.state = "isClosing";
                //准备关闭
                _this.timer = setTimeout(function() {
                    if (_this.state !== "isClosing") return;
                    if (_this.opts.createOnce) {
                        _this.destroy();
                    } else {
                        _this.hide();
                    }
                }, _this.opts.defer);
            } else {
                _this.state = "open";
            }
        });
        //添加外面绑定的事件
        this.opts.setEvent.call(this);
    };
    /**
     * 设置位置
     */
    Popup.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        var iLeft = pointer.left + this.$elem.width() / 2 - this.opts.width / 2;
        //左侧
        iLeft = iLeft < 0 ? 0 : iLeft;
        if ($(document.body).width() - iLeft < this.opts.width) {
            iLeft = $(document.body).width() - this.opts.width;
        }
        var iTop = pointer.top - this.opts.height + 1;
        if (this.opts.position === "down" || iTop < 0) {
            iTop = pointer.top + this.$elem.height();
        }
        this.$container.css({
            left: iLeft,
            top: iTop
        });
    };
    return Popup;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 酒店城市省份多选控件
 * @linc: MIT
 */
define("js/ProvinceAndCity", [], function(require, exports, module) {
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        simpleData: {
            id: "id",
            name: "name"
        },
        splitStr: ","
    };
    /**
     * 构造函数
     * @param {Object} options
     * @param {Object} cbFn 回调函数
     */
    function ProvinceAndCity(elem, options, cbFn) {
        this.id = "vetech-provinceAndCity-" + String(Math.random()).replace(/\D/g, "");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.callback = cbFn || $.noop;
        //回调函数
        this.$hiddenInput = $("#" + (this.opts.hiddenName || ""));
        this.init();
    }
    /**
     * 初始化整个容器
     */
    ProvinceAndCity.prototype.init = function() {
        //外层容器
        this.$container = $('<div class="vetech-provinceAndCity-container">');
        //toolbar
        this.$toolbar = $('<div class="toolbar"></div>');
        this.$toolbar.append('<strong>选择地区</strong><input type="button" value="确定" />');
        //checkedArea
        this.$checkedArea = $('<div class="checkedArea clear">');
        //content
        this.$content = $('<div class="content clear">');
        //cityPanel
        this.$cityPanel = $('<div class="cityPanel">');
        this.$container.append(this.$toolbar).append(this.$checkedArea).append(this.$content);
        $(document.body).append(this.$container);
        this.addEvent();
        this.bindEvent();
    };
    /**
     * 加载数据
     * @param url  可以传一个url地址，也可以传一个数据对象
     * @param callback 回调函数
     */
    ProvinceAndCity.prototype.load = function(url, callback) {
        callback = callback && $.type(callback) === "function" ? callback : function() {};
        var _this = this;
        if ($.type(url) === "string") {
            $.ajax({
                url: url,
                data: this.opts.qDatas,
                success: function(data) {
                    _this.opts.data = data;
                    callback.call(_this);
                }
            });
        } else {
            this.opts.data = url;
            callback.call(_this);
        }
    };
    /**
     * 渲染
     */
    ProvinceAndCity.prototype.render = function() {
        var provinceData = this.opts.data || [];
        var _this = this;
        $.each(provinceData, function(i, item) {
            var $span = $(addItem.call(_this, item));
            $span.data("citys", item.citys || []);
            //省对应的城市数据
            $span.find(".province").data("data", item);
            //省的数据
            _this.$content.append($span);
        });
    };
    ProvinceAndCity.prototype.writeValue = function() {
        var _this = this;
        if (this.$hiddenInput.length && this.$hiddenInput.val()) {
            var value = this.$hiddenInput.val();
            value = value.split(this.opts.splitStr);
            //过滤数据，先找出省份，再找出城市
            var provinceDatas = [], cityDatas = {}, //城市的用对象字面量来表示
            values = [], //文本框中要显示的信息
            indexName = this.opts.simpleData.id;
            for (var i = 0, len = value.length; i < len; i++) {
                var id = value[i];
                innerNoop: //命名内圈语句
                for (var j = 0, len2 = this.opts.data.length; j < len2; j++) {
                    var provinceItem = this.opts.data[j];
                    if (id === provinceItem[indexName]) {
                        provinceDatas.push(provinceItem);
                        _this.addCheckedItem.call(_this, provinceItem, "province");
                        values.push(provinceItem[_this.opts.simpleData.name]);
                        break;
                    } else {
                        var citys = provinceItem.citys;
                        //城市
                        for (var k = 0, len3 = citys.length; k < len3; k++) {
                            var city = citys[k];
                            if (id === city[indexName]) {
                                cityDatas[city.pid] = cityDatas[city.pid] || [];
                                cityDatas[city.pid].push(city);
                                _this.addCheckedItem.call(_this, city, "city");
                                values.push(city[_this.opts.simpleData.name]);
                                break innerNoop;
                            }
                        }
                    }
                }
            }
            this.$elem.val(values.join(this.opts.splitStr));
            //省份回调
            $.each(provinceDatas, function(i, provinceValue) {
                var $span = $("#" + provinceValue[_this.opts.simpleData.id]), $input = $span.find(".province");
                $span.css("color", "orange");
                setChecked($input, true);
                _this.$container.trigger("choose.provinceAndCity", $input);
            });
            //城市进行回调
            $.each(this.$container.find(".province"), function(i, input) {
                var $input = $(input), currData = $input.data("data"), $span = $input.parents(".item"), checkedCitys = cityDatas[currData[_this.opts.simpleData.id]];
                if (checkedCitys) {
                    $span.data("checkedData", checkedCitys);
                    $span.css("color", "orange");
                }
            });
        }
    };
    ProvinceAndCity.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("click.provinceAndCity", "span.item", function(ev) {
            //由于cityPanel加在span中,所以点击cityPanel中的内容时，也会出发该事件，所以在这里要判断一下
            if ($(ev.target).hasClass("item") || $(ev.target).hasClass("collapse")) {
                _this.$container.find(".detail").hide();
                _this.$container.trigger("expand.provinceAndCity", this);
            }
        }).on("mouseleave.provinceAndCity", "span.item", function() {
            _this.$container.trigger("collapse.provinceAndCity", this);
        }).on("click.provinceAndCity", "input[type='checkbox']", function() {
            _this.$container.trigger("choose.provinceAndCity", this);
        }).on("click.provinceAndCity", ".expand", function() {
            _this.$container.trigger("collapse.provinceAndCity", $(this).parents(".item"));
        });
        this.$checkedArea.on("click.provinceAndCity", ".close", function() {
            _this.$container.trigger("delete.provinceAndCity", $(this).parent());
        });
        this.$toolbar.on("click.provinceAndCity", "input", function() {
            _this.$container.trigger("sure.provinceAndCity");
            _this.hide();
        });
    };
    /**
     * 添加自定义事件
     */
    ProvinceAndCity.prototype.addEvent = function() {
        var _this = this;
        //自定义展开函数(点击省份，展开城市)
        this.$container.on("expand.provinceAndCity", function(e, span) {
            var $span = $(span);
            $span.find(".detail").show();
            _this.$cityPanel.html("");
            $.each($span.data("citys"), function(i, item) {
                var $label = $('<label id="' + item[_this.opts.simpleData.id] + '" class="ellipsis" title="' + item[_this.opts.simpleData.name] + '"><input type="checkbox" />' + item[_this.opts.simpleData.name] + "</label>");
                $label.find("input").data("data", item);
                _this.$cityPanel.append($label);
            });
            //展开城市的时候，要进行回填
            if ($span.find(".province").is(":checked")) {
                var $inputs = _this.$cityPanel.find("input");
                setChecked($inputs, true);
                $inputs.attr("disabled", "disabled");
            } else {
                var tempData = $span.data("checkedData") || [];
                $.each(tempData, function(i, item) {
                    setChecked(_this.$cityPanel.find("#" + item[_this.opts.simpleData.id]).find("input"), true);
                });
            }
            $span.append(_this.$cityPanel.show());
        });
        //自定义折叠函数（点击折叠，关闭城市弹出层）
        this.$container.on("collapse.provinceAndCity", function(e, span) {
            var $span = $(span);
            $span.find(".detail").hide().end().find(".cityPanel").hide();
        });
        //input checked事件
        this.$container.on("choose.provinceAndCity", function(e, input) {
            var $span = $(input).parents(".item"), $input = $(input), currData = $input.data("data"), //当前选择的input框对应的数据值
            $inputs;
            if ($input.hasClass("province")) {
                if ($input.is(":checked")) {
                    $inputs = _this.$cityPanel.find("input");
                    setChecked($inputs, true);
                    $inputs.attr("disabled", "disabled");
                    $span.data("checkedData", []);
                    //清除选中的data
                    _this.addCheckedItem.call(_this, currData, "province");
                } else {
                    $inputs = _this.$cityPanel.find("input");
                    setChecked($inputs, false);
                    $inputs.removeAttr("disabled");
                    $.each(_this.$checkedArea.find(".checkedItem"), function(i, item2) {
                        var $item = $(item2), td = $item.data("data");
                        if (currData[_this.opts.simpleData.id] === td[_this.opts.simpleData.id]) $item.remove();
                    });
                }
            } else {
                var tempData = $span.data("checkedData") || [];
                if ($input.is(":checked")) {
                    //把选择的城市放入缓存
                    tempData.push(currData);
                    _this.addCheckedItem.call(_this, currData, "city");
                } else {
                    //当没有选中的时候，要在数据缓存中过滤掉被取消勾选的数据
                    var newData = tempData;
                    tempData = [];
                    $.each(newData, function(i, item) {
                        if (currData[_this.opts.simpleData.id] !== item[_this.opts.simpleData.id]) {
                            tempData.push(item);
                        } else {
                            $.each(_this.$checkedArea.find(".checkedItem"), function(i, item2) {
                                var $item = $(item2), td = $item.data("data");
                                if (item[_this.opts.simpleData.id] === td[_this.opts.simpleData.id]) $item.remove();
                            });
                        }
                    });
                }
                $span.data("checkedData", tempData);
            }
        });
        //删除操作（拿到所有省的节点，判断当前删除的是不是省的数据，如果是省的数据，直接删除已经选择的节点，把该省对应的checkbox设置为不选中并执行choose.provinceAndCity函数，如果不是省的数据，则要遍历每个省下面的缓存已选中的城市，并踢出该城市）
        this.$container.on("delete.provinceAndCity", function(e, span) {
            var currData = $(span).data("data");
            $.each(_this.$container.find(".province"), function(i, input) {
                var $input = $(input);
                var tempData = $input.data("data");
                if (currData[_this.opts.simpleData.id] === tempData[_this.opts.simpleData.id]) {
                    setChecked($input, false);
                    _this.$container.trigger("choose.provinceAndCity", input);
                }
                var $pSpan = $input.parents(".item");
                var newData = [];
                $.each($pSpan.data("checkedData") || [], function(i, itemValue) {
                    if (itemValue[_this.opts.simpleData.id] !== currData[_this.opts.simpleData.id]) {
                        newData.push(itemValue);
                    }
                });
                $pSpan.data("checkedData", newData);
            });
            $(span).remove();
        });
        //确认操作
        this.$container.on("sure.provinceAndCity", function() {
            var resultData = [], ids = [], values = [];
            $.each(_this.$checkedArea.find(".checkedItem ") || [], function(i, item) {
                var itemValue = $(item).data("data");
                ids.push(itemValue[_this.opts.simpleData.id]);
                values.push(itemValue[_this.opts.simpleData.name]);
                resultData.push(itemValue);
            });
            _this.$elem.val(values.join(_this.opts.splitStr));
            _this.$hiddenInput.length && _this.$hiddenInput.val(ids.join(_this.opts.splitStr));
            //执行回调
            _this.callback(resultData);
        });
    };
    /**
     * 添加选择的项目
     * @param {Object} data
     * @param {Object} type
     */
    ProvinceAndCity.prototype.addCheckedItem = function(data, type) {
        var needAdd = true;
        //标记是否需要添加
        if (type === "province") {
            //先检查已经选择的数据中，是否有省内的城市，如果有省内城市，则清除
            var id = this.opts.simpleData.id;
            $.each(this.$checkedArea.find(".checkedItem"), function(i, item) {
                var $item = $(item), tempData = $item.data("data");
                if (tempData.pid === data[id]) {
                    $item.remove();
                } else if (tempData[id] === data[id]) {
                    needAdd = false;
                    return false;
                }
            });
        }
        needAdd && this.$checkedArea.append(createCheckedItem.call(this, data));
    };
    function createCheckedItem(data) {
        var $span = $('<span class="checkedItem ellipsis">' + data[this.opts.simpleData.name] + '<i class="close"></i></span>');
        $span.data("data", data);
        return $span;
    }
    /**
     *显示
     */
    ProvinceAndCity.prototype.show = function() {
        this.setPos();
        this.$container.css("visibility", "visible");
    };
    ProvinceAndCity.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    ProvinceAndCity.prototype.hide = function() {
        this.$container.css({
            visibility: "hidden",
            left: "-1000px",
            top: "-1000px"
        });
    };
    ProvinceAndCity.prototype.destroy = function() {
        //移除该控件绑定的所有的事件
        this.clear();
        this.$container.remove();
    };
    ProvinceAndCity.prototype.clear = function() {
        this.$container.off(".provinceAndCity");
        this.$checkedArea.off(".provinceAndCity");
        this.$toolbar.off(".provinceAndCity");
    };
    /**
     * 添加item
     * @param {Object} item
     */
    function addItem(item) {
        return '<span class="item" id="' + item[this.opts.simpleData.id] + '">' + '<i class="collapse"></i>' + item[this.opts.simpleData.name] + "" + '<div class="detail">' + '<i class="expand"></i>' + '<label class="ellipsis"><input type="checkbox" class="province"  value="' + item[this.opts.simpleData.id] + '" />' + item[this.opts.simpleData.name] + "</label>" + "</div>" + "</span>";
    }
    /**
     * 设置选中
     * @param $inputs
     * @param state
     */
    function setChecked($inputs, state) {
        $.each($inputs, function(i, input) {
            input.checked = state;
        });
    }
    return ProvinceAndCity;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:下拉、多选下拉、模糊搜索
 * @linc: MIT
 *
 */
define("js/Pulldown", [ "../js/Common" ], function(require, exports) {
    var defaultOpts = {
        width: 200,
        //自定义宽度,默认宽度200
        height: 200,
        //该属性只会在没有分页的时候有效
        simpleData: {
            //个性化配置参数
            id: "id",
            name: "name",
            count: "size",
            //
            start: "current",
            //
            totalNum: "totalNum",
            //总数
            data: "data"
        },
        ajaxOpts: {
            //配置ajax相关信息
            type: "get"
        },
        formatPostData: function(data) {
            return data;
        },
        //格式化发送请求的数据
        qDatas: {},
        //查询参数
        filterFn: function(item) {
            //过滤函数
            return 0;
        },
        cbFn: function() {},
        title: "可输入拼音、汉字、三字码",
        //提示信息
        type: 1,
        //数据加载方式，默认为3
        typeValue: null,
        //如果数据加载传递的值：jsonName/url
        hiddenName: null,
        //隐藏域name
        dataType: "static",
        //取值static和dynamic,如果是dynamic，则翻页时，就是实时查询
        qUrl: "",
        //当dataype是dynamic时，qUrl必须要配置
        pageSize: 10,
        //每页显示多少条
        inputExecCallback: false,
        //输入自动执行回调函数
        hiddenFilter: true,
        //静态数据的时候是否根据隐藏域中的值去过滤数据，默认为false会过滤。。设置true不会
        autoSetValue: true,
        _openFilter_: true,
        //默认开启检索功能
        _hasPage_: true,
        //是否有分页，默认是有的，配置为false，就直接显示数据,直接显示数据就不存在检索的情况
        defer: 0,
        //0毫秒以后执行查询，可以配置
        autoExecCallback: false,
        //自动执行回调
        filterData: [],
        //需要过滤的数据
        fn1: null
    }, Common = require("../js/Common");
    /**
	 * 构造函数
	 * @param {Object} elem
	 * @param {Object} options
	 */
    function Pulldown(elem, options) {
        this.id = Common.cid("Pulldown");
        this.elem = elem;
        this.$elem = $(elem);
        this.$elem.attr("autocomplete", "off");
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.$hiddenInput = $(document.body).find("#" + this.opts.hiddenName);
        this.data = [];
        //存储加载的数据
        this.currentPage = 1;
        this.totalNum = 0;
        //总共有多少条数据
        this.iNow = 0;
        //默认哪个选中
        this.timer = null;
        //定时器
        this.ajax = null;
        //发送ajax的对象
        this.isBindedEvent = false;
        //标记是否已经绑定过事件
        this.triggerType = "key";
        //查询触发的方式，默认是key，还可以取值为page，即分页
        this.init();
    }
    /**
	 * 初始化方法
	 */
    Pulldown.prototype.init = function() {
        this.$elem.addClass("ve-arrow-down");
        this.$container = $('<div class="vetech-pulldown-container"></div>');
        this.$container.css({
            visibility: "hidden",
            width: this.opts.width
        });
        this.$title = $('<div class="title">' + this.opts.title + "</div>");
        this.$content = $('<div class="content"></div>');
        //如果没有分页，又设置了高度，设置高度即可
        if (!this.opts._hasPage_ && this.opts.height) {
            this.$container.css({
                "max-height": this.opts.height,
                overflow: "auto"
            });
        }
        this.$container.append(this.$title).append(this.$content);
        $(document.body).append(this.$container);
    };
    /**
	 * 加载数据
	 */
    Pulldown.prototype.load = function(callback) {
        if (this.opts.dataType === "dynamic") {
            this.loadDynamicData(callback);
        } else {
            this.formartData(this.opts.typeValue, callback);
        }
    };
    /**
	 * 实时加载数据
	 * @param {Object} callback 回调函数
	 */
    Pulldown.prototype.loadDynamicData = function(callback) {
        var qStr = $.trim(this.$elem.val()), //查询参数
        id = this.$hiddenInput.val() || "", _this = this, simpleData = this.opts.simpleData;
        var lastValue = this.$elem.data("lastValue");
        if (lastValue === qStr && this.triggerType === "key") {
            callback.call(this, this.data);
            return;
        }
        this.$elem.data("lastValue", qStr);
        this.ajax && this.ajax.abort();
        //查询参数
        var tempData = {
            data: qStr,
            id: id
        };
        tempData[simpleData.count] = this.opts.pageSize;
        tempData[simpleData.start] = this.currentPage;
        this.ajax = $.ajax($.extend(true, {
            type: "get",
            url: this.opts.typeValue,
            dataType: "json",
            data: this.opts.formatPostData($.extend(true, {}, tempData, this.opts.qDatas)),
            success: function(data) {
                if (data.status === "200") {
                    _this.data = data.result.records || data.result;
                    _this.totalNum = data.result.total;
                } else {
                    Common.error(data.message);
                }
                callback.call(_this, _this.data);
            }
        }, this.opts.ajaxOpts));
    };
    /**
	 * 格式化数据
	 * @param {Object} data 数据
	 * @param {Object} callback 回调函数
	 */
    Pulldown.prototype.formartData = function(data, callback) {
        var filterData = this.opts.filterData;
        //如果是静态数据，又配置了有filterData，那么可以在静态数据中过滤掉filterData中 的数据
        if ($.type(filterData) === "array" && filterData.length) {
            var newData = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];
                if ($.inArray(item[this.opts.simpleData.id], filterData) === -1) {
                    newData.push(item);
                }
            }
            this.data = newData;
            newData = null;
        }
        this.loadStaticData();
        if ($.type(callback) === "function") {
            callback.call(this, this.data);
        }
    };
    /**
	 * 数据回填
	 */
    Pulldown.prototype.writeValue = function() {
        if (!this.$hiddenInput.val()) return;
        var tempData = null;
        for (var i = 0, len = this.data.length; i < len; i++) {
            if (this.$hiddenInput.val() === this.data[i][this.opts.simpleData.id]) {
                tempData = this.data[i];
                break;
            }
        }
        if (!tempData) return;
        this.$elem.val(tempData[this.opts.simpleData.name]);
        this.opts.autoExecCallback && this.opts.opts.cbFn(tempData);
    };
    /**
	 * 渲染
	 */
    Pulldown.prototype.render = function() {
        this.iNow = 0;
        var $ul = $("<ul></ul>");
        var simpleData = this.opts.simpleData;
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            var showTxt = this.opts.fn1 ? this.opts.fn1(item) : "<span title='" + item[simpleData.name] + "'>" + item[simpleData.name] + "</span><span class='right' title='" + item.py + "'>" + item.py + "</span>";
            var $li = $('<li class="' + (i === 0 ? "active" : "") + '">' + showTxt + "</li>");
            $ul.append($li);
            $li.data("index", i);
            //把数据存储
            $li.data("data", item);
        }
        this.$content.html("").append($ul);
        if (this.opts._hasPage_ && !this.isBindedEvent) {
            this.$toolbar = $('<div class="toolbar"></div>');
            this.$prevBtn = $('<a class="prev" href="javascript:void(0)">上一页</a>');
            this.$nextBtn = $('<a class="next" href="javascript:void(0)">下一页</a>');
            this.$toolbar.empty().append(this.$prevBtn).append(this.$nextBtn);
            this.$container.append(this.$toolbar);
        }
        if (this.opts._hasPage_) this.listenBtnState();
        if (!this.isBindedEvent) this.bindEvent();
    };
    /**
	 * 监听分页按钮状态
	 */
    Pulldown.prototype.listenBtnState = function() {
        if (this.currentPage <= 1) {
            this.$prevBtn.isDisabled = true;
            this.$prevBtn.addClass("disable");
        } else {
            this.$prevBtn.isDisabled = false;
            this.$prevBtn.removeClass("disable");
        }
        var lastPage = Math.ceil(this.totalNum / this.opts.pageSize);
        if (this.currentPage >= lastPage) {
            this.$nextBtn.isDisabled = true;
            this.$nextBtn.addClass("disable");
        } else {
            this.$nextBtn.isDisabled = false;
            this.$nextBtn.removeClass("disable");
        }
    };
    /**
	 * 设置数据
	 */
    Pulldown.prototype.setValue = function(data) {
        var id = this.opts.simpleData.id, name = this.opts.simpleData.name;
        if ($.type(data) === "object") {
            this.$elem.val(data[name] || "");
            this.$hiddenInput.val(data[id] || "");
            //currentPage重置为1
            this.currentPage = 1;
            this.hide();
        }
        if (this.opts.cbFn) this.opts.cbFn(data);
    };
    /**
	 * 下一页事件处理
	 * @param {Object} ev
	 */
    Pulldown.prototype.nextBtnHandler = function(ev) {
        if (this.$nextBtn.isDisabled) return;
        this.currentPage = this.currentPage + 1;
        this.triggerType = "page";
        this.load(function() {
            this.render();
            this.show();
        });
    };
    /**
	 * 上一页事件处理
	 * @param {Object} ev
	 */
    Pulldown.prototype.prevBtnHandler = function(ev) {
        if (this.$prevBtn.isDisabled) return;
        this.currentPage = this.currentPage - 1;
        this.triggerType = "page";
        this.load(function() {
            this.render();
            this.show();
        });
    };
    Pulldown.prototype.loadStaticData = function() {
        this.filterStaticData();
        var startIndex = (this.currentPage - 1) * this.opts.pageSize;
        var data = this.data.slice(startIndex, startIndex + this.opts.pageSize);
        this.data = data;
    };
    /**
	 * 输入元素点击事件
	 * @param {Object} ev
	 */
    Pulldown.prototype.elemClickHandler = function(ev) {};
    /**
	 * 滑动效果
	 * @param {Object} value
	 */
    Pulldown.prototype.slideHandler = function(value) {
        if (this.iNow === 0 && value === -1) return;
        var $lis = this.$container.find("li");
        if (this.iNow === $lis.length - 1 && value === 1) return;
        $lis.eq(this.iNow).removeClass("active");
        this.iNow += value;
        $lis.eq(this.iNow).addClass("active");
    };
    /**
	 * 输入元素键盘事件
	 * @param {Object} ev
	 * @param {Object} callback回调函数
	 * @desc:键盘事件要考虑方向键，上下是选择，左右是翻页，enter是确定
	 */
    Pulldown.prototype.elemKeyUpHandler = function(ev, callback) {
        var _this = this;
        this.$hiddenInput.val("");
        //只要键盘有输入，直接清除隐藏域中的数据
        this.$elem.removeClass("placeholder");
        //input输入的时候，需要清除class为placeholder
        if (this.data && this.data.length) {
            if (ev.keyCode === 13) {
                //确定
                this.setValue(this.$container.find("li").eq(this.iNow).data("data"));
            } else if (ev.keyCode === 37) {
                this.opts._hasPage_ && this.prevBtnHandler(ev);
            } else if (ev.keyCode === 38) {
                this.slideHandler(-1);
            } else if (ev.keyCode === 39) {
                this.opts._hasPage_ && this.nextBtnHandler(ev);
            } else if (ev.keyCode === 40) {
                this.slideHandler(1);
            } else {
                if (this.timer) window.clearTimeout(this.timer);
                this.timer = window.setTimeout(function() {
                    _this.currentPage = 1;
                    _this.triggerType = "key";
                    _this.load(callback);
                }, this.opts.defer);
                //如果配置了inputExecCallback为true，则执行回调函数，回调函数第一个参数值是input输入值，第二个是标记是输入时执行的回调
                //在对接时，可拿到回调的第二个参数判断是什么场景下执行的回调
                if (this.opts.inputExecCallback) {
                    this.opts.cbFn(this.$elem.val(), true);
                }
            }
        } else {
            if (this.timer) window.clearTimeout(this.timer);
            this.timer = window.setTimeout(function() {
                _this.load(callback);
            }, this.opts.defer);
            if (this.opts.inputExecCallback) {
                this.opts.cbFn(this.$elem.val(), true);
            }
        }
    };
    Pulldown.prototype.bindEvent = function() {
        this.isBindedEvent = true;
        var _this = this;
        if (this.opts._hasPage_) {
            this.$prevBtn.on("click.pulldown", function(ev) {
                //上一页事件
                _this.prevBtnHandler.call(_this, ev);
            });
            this.$nextBtn.on("click.pulldown", function(ev) {
                _this.nextBtnHandler.call(_this, ev);
            });
        }
        this.$container.on("mouseenter.pulldown", "li", function() {
            var $lis = _this.$container.find("li");
            $lis.eq(_this.iNow).removeClass("active");
            $(this).addClass("active");
            _this.iNow = $(this).data("index");
        }).on("mousedown.pulldown", function() {
            //IE8及以下做特殊处理
            if (document.all && !document.addEventListener) {
                _this.$container[0].setCapture && _this.$container[0].setCapture();
            }
            return false;
        }).on("click.pulldown", "li", function() {
            _this.setValue($(this).data("data"));
        }).on("mouseup.pulldown", function(ev) {
            _this.$container[0].releaseCapture && _this.$container[0].releaseCapture();
        });
        this.$elem.on("blur.pulldown", function() {
            _this.hide.call(_this);
        }).on("click.pulldown", function() {
            //当点击click的时候，选中所有的值，以便更好的执行删除操作
            if ($(this).val()) $(this).select();
        });
    };
    /**
	 * 销毁方法
	 */
    Pulldown.prototype.destroy = function() {
        this.$container.off(".pulldown");
        this.$elem.off(".pulldown");
        this.$prevBtn && this.$prevBtn.off(".pulldown");
        this.$nextBtn && this.$nextBtn.off(".pulldown");
        this.$container.remove();
    };
    /**
	 * 隐藏
	 */
    Pulldown.prototype.hide = function() {
        this.$elem.removeClass("ve-arrow-up").addClass("ve-arrow-down");
        this.$container.css("visibility", "hidden");
        //如果文本框中没有值，则直接清除隐藏域中的值
        if (!this.$elem.val()) this.$hiddenInput.val("");
    };
    Pulldown.prototype.setPos = function() {
        var pointer = this.$elem.offset(), iWidth = $(document).outerWidth(), iTop = pointer.top + this.$elem.outerHeight(), iLeft = pointer.left + this.$container.outerWidth() > iWidth ? pointer.left + this.$elem.outerWidth() - this.$container.outerWidth() : pointer.left;
        this.$container.css({
            left: iLeft,
            top: iTop
        });
    };
    /**
	 * 显示
	 * @param {Object}
	 */
    Pulldown.prototype.show = function() {
        this.$elem.removeClass("ve-arrow-down").addClass("ve-arrow-up");
        this.setPos();
        this.$container.css("visibility", "visible");
    };
    /**
	 * 过滤静态数据
	 * @desc:静态数据过滤的时候
	 */
    Pulldown.prototype.filterStaticData = function() {
        var qStr = $.trim(this.$elem.val());
        //查询参数
        var tempArr = [], originData = this.opts.typeValue;
        for (var i = 0, len = originData.length; i < len; i++) {
            var item = originData[i];
            var result = this.opts.filterFn.call(this, item, qStr);
            if (result === -1) continue;
            item.sortIndex = result;
            //排序字段
            tempArr.push(item);
        }
        if (qStr) {
            //根据索引排序
            tempArr.sort(function(item1, item2) {
                return item1.sortIndex - item2.sortIndex;
            });
        }
        this.data = tempArr;
        this.totalNum = this.data.length;
    };
    return Pulldown;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 定时器刷新
 * @linc: MIT
 *
 */
define("js/Refresh", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var defautOpts = {
        totalTime: 60,
        //总时长
        startTxt: "启",
        stopTxt: "停"
    };
    /**
     * 构造函数
     * @param elem 要添加的样式
     * @param options
     * @constructor
     */
    function Refresh(elem, options) {
        this.id = Common.cid("Refresh");
        this.elem = elem;
        this.$elem = $(elem);
        this.timer = null;
        this.state = "start";
        this.opts = $.extend(true, {}, defautOpts, options);
        this.currTime = this.opts.totalTime;
        this.render();
    }
    Refresh.prototype.render = function() {
        this.$container = $('<div class="refresh-container"><p>本页面将在</p>\n' + '    <p><span class="clock">' + this.currTime + "</span>秒</p>\n" + "    <p>后自动刷新</p>\n" + '    <input type="button" value="' + this.opts.stopTxt + '">');
        this.$elem.append(this.$container);
        this.init();
        this.bindEvent();
    };
    Refresh.prototype.init = function() {
        this.timer && clearInterval(this.timer);
        var _this = this;
        this.update();
        this.timer = setInterval(function() {
            _this.currTime--;
            _this.update();
        }, 1e3);
    };
    Refresh.prototype.start = function() {
        this.state = "start";
        this.$container.find("input").val(this.opts.stopTxt);
        this.init();
    };
    Refresh.prototype.stop = function() {
        clearInterval(this.timer);
        this.state = "stop";
        this.$container.find("input").val(this.opts.startTxt);
    };
    Refresh.prototype.update = function() {
        if (this.currTime <= 0) {
            this.currTime = this.opts.totalTime;
            if (this.opts.cbFn) this.opts.cbFn();
            this.init();
        } else {
            this.$container.find(".clock").html(this.currTime);
        }
    };
    /**
     * 重置
     */
    Refresh.prototype.reset = function() {
        this.state = "start";
        this.currTime = this.opts.totalTime;
        this.init();
    };
    Refresh.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("click.Refresh", "input", function() {
            if (_this.state === "start") {
                _this.stop();
            } else {
                _this.start();
            }
        });
    };
    /**
     *
     */
    Refresh.prototype.destroy = function() {
        this.off(".Refresh");
        this.$container.remove();
    };
    return Refresh;
});

/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define("js/RouteTheme", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    /**
     * 共公属性
     */
    var defaultOpts = {
        width: 600,
        //宽度
        height: 200,
        //最小高度
        itemWidth: 80,
        //数据项的宽度
        splitStr: ",",
        //分隔符
        classW: 80,
        // 左侧类型的宽度
        type: 3,
        //数据加载方式，
        ajaxType: "get",
        typeValue: null,
        //如果数据加载传递的值：jsonName/url
        hiddenName: null,
        //隐藏域name
        fn1: null,
        //fn1 自定义渲染热门线路主题数据值
        fn2: null,
        //fn2 自定义分类
        fn3: null,
        //fn3自定义渲染数据值
        model: "single"
    };
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function RouteTheme(elem, options, cbFn) {
        this.id = Common.cid("RouteTheme");
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.elem = elem;
        this.$elem = $(elem);
        this.cbFn = cbFn || function() {};
        this.$hotThemes = [];
        //热门主题
        this.$allThemes = [];
        //所有主题(排除相同的)
        this.$sameThemes = [];
        //存储和热门主题相同的数据
        this.model = this.opts.model;
        //使用模式
        this.isOpen = false;
        //标示是否打开更多
        this.checked = {
            keys: [],
            values: []
        };
        //选择的
        //隐藏域
        if (this.opts.hiddenName) {
            this.$hiddenInput = $("#" + this.opts.hiddenName);
            this.checked.keys = (this.$hiddenInput.val() || "").split(this.opts.splitStr);
        }
        if ($.type(this.opts.fn1) !== "function") {
            this.opts.fn1 = null;
        }
        if ($.type(this.opts.fn2) !== "function") {
            this.opts.fn2 = null;
        }
        if ($.type(this.opts.fn3) !== "function") {
            this.opts.fn3 = null;
        }
        this.init();
    }
    /**
     * 初始化加载
     */
    RouteTheme.prototype.init = function() {
        if (this.model === "group") {
            this.$hotElement = $('<div class="vetech-route-theme clearfix"></div>');
            this.$hotContainer = $("<ul></ul>");
            this.$hotElement.append(this.$hotContainer);
        }
        this.$layer = $('<div class="vetech-route-theme vrt-layer">');
        this.$layer.css({
            width: this.opts.width,
            "min-height": this.opts.height
        });
        $(document).find("body").append(this.$layer);
    };
    /**
     * 加载数据
     * @param callback
     */
    RouteTheme.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: this.opts.ajaxType,
                url: this.opts.typeValue,
                dataType: "json",
                data: this.opts.qDatas,
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    throw new Error("数据加载错误" + msg);
                }
            });
        }
    };
    /**
     * 设置位置
     */
    RouteTheme.prototype.setPos = function() {
        var pointer = this.$elem.offset(), iWidth = $(document).outerWidth(), iTop = pointer.top + this.$elem.outerHeight(), iLeft = pointer.left + this.$layer.outerWidth() > iWidth ? pointer.left + this.$elem.outerWidth() - this.$layer.outerWidth() : pointer.left;
        this.$layer.css({
            left: iLeft,
            top: iTop
        });
    };
    /**
     * 渲染
     */
    RouteTheme.prototype.render = function() {
        var checkedLis = [];
        //要选中的li
        if (this.model === "group") {
            var hotData = this.data.hotTheme;
            var templateFn = this.opts.fn1;
            for (var i = 0, len = hotData.length; i < len; i++) {
                var item = hotData[i];
                //利用模板函数自定义渲染
                var showText = templateFn ? templateFn(item) : item.mc;
                var $li = $('<li><label title="' + item.mc + '"><input type="checkbox"/>' + showText + "</label></li>");
                $li.data = item;
                this.$hotThemes.push($li);
                this.$hotContainer.append($li);
                if ($.inArray(item.id, this.checked.keys) !== -1) checkedLis.push($li);
            }
            this.$more = $('<li class="more"><a href="javascript:void(0);">更多</a></li>');
            this.$hotContainer.append(this.$more);
            this.$elem.append(this.$hotElement);
        }
        var allData = this.data;
        var tempWidth = this.opts.width - this.opts.classW;
        //10 为dd的margin-left值,另外10px为dl的margin值
        var templateFn2 = this.opts.fn2;
        var templateFn3 = this.opts.fn3;
        for (var k = 0, len2 = allData.length; k < len2; k++) {
            var item1 = allData[k];
            var $dl = $('<dl class="vetech-clearfix"></dl>');
            var showText1 = templateFn2 ? templateFn2(item1) : item1.mc;
            var $dt = $('<dt class="vetech-inline" style="width:' + this.opts.classW + 'px;">' + showText1 + "</dt>");
            var $dd = $('<dd class="vetech-inline" style="width:' + tempWidth + 'px;"></dd>');
            $dl.append($dt).append($dd);
            var $ul = $("<ul></ul>");
            for (var j = 0, len3 = item1.childs.length; j < len3; j++) {
                var item2 = item1.childs[j];
                var showText2 = templateFn3 ? templateFn3(item2) : item2.mc;
                var $li2 = $('<li><label title="' + item2.mc + '"><input type="checkbox"/>' + showText2 + "</label></li>");
                $li2.css("width", this.opts.itemWidth);
                $li2.data = item2;
                if (this.isInHotThemes(item2)) {
                    this.$sameThemes.push($li2);
                } else {
                    this.$allThemes.push($li2);
                }
                if ($.inArray(item2.bh, this.checked.keys) !== -1) checkedLis.push($li2);
                $ul.append($li2);
            }
            $dd.append($ul);
            this.$layer.append($dl);
        }
        this.bindEvent();
        this.writeValue(checkedLis);
    };
    /**
     * 数据回填
     */
    RouteTheme.prototype.writeValue = function(checkedLis) {
        var names = [];
        for (var i = 0, len = checkedLis.length; i < len; i++) {
            var $li = checkedLis[i];
            names.push($li.data.mc);
            setCheckboxState($li.find("input[type='checkbox']").get(0), true);
        }
        if (this.model === "single") {
            this.$elem.val(names.join(this.opts.splitStr));
        }
    };
    /**
     * 选择以后设置值
     */
    RouteTheme.prototype.setValue = function() {
        var result = [];
        var mySelf = this;
        this.checked = {
            keys: [],
            values: []
        };
        //选择的
        //获取被选中的热门线路主题
        for (var i = 0, len = this.$hotThemes.length; i < len; i++) {
            var $li = this.$hotThemes[i];
            getValue($li);
        }
        //获取弹出层被选中的线路主题，排除相同的
        for (var j = 0, len2 = this.$allThemes.length; j < len2; j++) {
            var $li2 = this.$allThemes[j];
            getValue($li2);
        }
        function getValue($li) {
            if ($li.find("input[type='checkbox']").get(0).checked) {
                result.push($li.data);
                mySelf.checked.keys.push($li.data.bh);
                mySelf.checked.values.push($li.data.mc);
            }
        }
        this.$elem.val(mySelf.checked.values.join(this.opts.splitStr));
        this.$hiddenInput.val(mySelf.checked.keys.join(this.opts.splitStr));
        //执行回调
        this.cbFn(result);
    };
    /**
     * 检索数据项是否在热门主题中
     */
    RouteTheme.prototype.isInHotThemes = function(item) {
        var tempItem = null;
        for (var i = 0, len = this.$hotThemes.length; i < len; i++) {
            tempItem = this.$hotThemes[i].data;
            if (item.bh === tempItem.bh && $.trim(item.mc) === $.trim(tempItem.mc)) {
                return true;
            }
        }
        return false;
    };
    /**
     * 显示
     */
    RouteTheme.prototype.show = function() {
        this.setPos();
        this.$layer.css("visibility", "visible");
        if (this.$more) {
            this.$more.find("a").text("关闭");
            this.isOpen = true;
        }
    };
    /**
     * 隐藏
     */
    RouteTheme.prototype.hide = function() {
        this.$layer.css("visibility", "hidden");
        if (this.$more) {
            this.$more.find("a").text("更多");
            this.isOpen = false;
        }
    };
    /**
     * 绑定事件
     */
    RouteTheme.prototype.bindEvent = function() {
        var self = this;
        if (this.model === "group") {
            //更多点击事件
            this.$more.on("click", function() {
                if (!self.isOpen) {
                    self.show();
                } else {
                    self.hide();
                }
            });
        } else {
            this.$elem.on("click", $.proxy(self.show, self));
            //如果不是用的组合模式，那么需要给document添加点击事件用来隐藏弹出层
            $(document).on("mousedown", function(ev) {
                var target = ev.target;
                if (self.elem !== target) self.hide();
            });
            this.$layer.on("mousedown", function() {
                return false;
            });
        }
        for (var i = 0, len = this.$hotThemes.length; i < len; i++) {
            change1(this.$hotThemes[i]);
        }
        function change1($li) {
            $li.find("input[type='checkbox']").on("change", function(ev) {
                self.mutexOperate($li, self.$sameThemes);
                ev.stopPropagation();
            });
        }
        //其他的数据项目绑定值
        for (var j = 0, len2 = this.$allThemes.length; j < len2; j++) {
            change2(this.$allThemes[j]);
        }
        function change2($li) {
            $li.find("input[type='checkbox']").on("change", function(ev) {
                self.setValue();
                return false;
            });
        }
        for (var k = 0, len3 = this.$sameThemes.length; k < len3; k++) {
            change3(this.$sameThemes[i]);
        }
        function change3($li) {
            $li.find("input[type='checkbox']").on("change", function(ev) {
                self.mutexOperate($li, self.$hotThemes);
                return false;
            });
        }
    };
    /**
     * 互斥操作
     * @param {Object} item 被选中的数据项
     * @param {Object} $searchThemes 检索的数据项
     */
    RouteTheme.prototype.mutexOperate = function($li, $searchThemes) {
        for (var i = 0, len = $searchThemes.length; i < len; i++) {
            var tempItem = $searchThemes[i].data;
            if ($li.data.bh === tempItem.bh) {
                if ($li.find("input[type='checkbox']").get(0).checked) {
                    setCheckboxState($searchThemes[i].find("input[type='checkbox']").get(0), true);
                    this.setValue();
                } else {
                    setCheckboxState($searchThemes[i].find("input[type='checkbox']").get(0), false);
                    this.setValue();
                }
                break;
            }
        }
    };
    /**
     * 设置checkbox的选中状态
     * @param {Object} box
     * @param {Object} state
     */
    function setCheckboxState(box, state) {
        if (box && box.type === "checkbox") {
            box.checked = state;
        }
    }
    return RouteTheme;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 省市区县联动控件(所有控件不提供数据回填功能)
 * @linc: MIT
 *
 */
define("js/SSQX", [ "../js/Common" ], function(require, exports, module) {
    /**
     * 默认配置参数
     */
    var defaultOpts = {
        type: 1,
        typeValue: {},
        splitStr: ",",
        //默认分隔符
        itemWidth: 55,
        //选项的宽度
        tabWidth: 100,
        //选项卡的宽度
        rightWidth: 180,
        //tab-header右侧空余的宽度
        headers: [ "省份", "城市", "区县" ],
        //省份、城市、区县头部
        simpleData: {
            id: "bh",
            name: "name",
            pid: "pid"
        },
        pid: "00002",
        //省份的pid
        closeImg: "/img/clsoe.png",
        //关闭
        cbFn: function() {}
    }, Common = require("../js/Common");
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function SSQX(elem, options) {
        this.id = Common.cid("SSQX");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.iNow = 0;
        //当前激活的tab
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.init();
    }
    /**
     * 初始化
     */
    SSQX.prototype.init = function() {
        this.$container = $('<div class="vetech-ssqx">');
        var $closeBtn = $('<span class="close"> <img src="' + this.opts.closeImg + '"> </span>');
        //构造tab头部
        var $tabHeader = $('<div class="tab-header">');
        var headers = this.opts.headers, $ul = $('<ul class="clearfix">');
        var tabContents = [];
        for (var i = 0, len = headers.length; i < len; i++) {
            var $li = $('<li class="tab"><a href="javascript:;" data-index="' + i + '">' + headers[i] + "</a></li>");
            var contentDiv = '<div class="tab-content"></div>';
            tabContents.push(contentDiv);
            $ul.append($li);
        }
        $tabHeader.append($ul);
        this.$container.append($closeBtn).append($tabHeader).append(tabContents.join(""));
        this.tabClick($tabHeader.find("li").first());
        this.bindEvent();
    };
    /**
     * load函数
     * @param callback
     */
    SSQX.prototype.load = function(callback) {
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            callback.call(this, this.data);
        } else {
            //查询参数
            var queryObj = this.opts.qDatas;
            queryObj[this.opts.simpleData.pid] = this.opts.pid;
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: queryObj,
                success: function(data) {
                    if (data.status === "200") {
                        _this.data = data.result.records;
                    } else {
                        Common.error(data.message);
                    }
                    callback.call(_this, _this.data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        }
    };
    /**
     * 渲染
     */
    SSQX.prototype.render = function() {
        if (!this.data.length) return;
        var $ul = $('<ul class="clearfix">');
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            var $li = $('<li class="item"><a href="javascript:;" title="' + item[this.opts.simpleData.name] + '">' + item[this.opts.simpleData.name] + "</a>");
            $li.data("data", item);
            $ul.appendChild($li);
        }
        this.$container.find(".tab-content").eq(this.iNow).html($ul);
    };
    /**
     * 头部点击事件
     */
    SSQX.prototype.tabClick = function($li) {
        var index = $li.data("index");
        this.iNow = parseInt(index);
        this.$container.find(".tab").find("a").removeClass("active").end().eq(index).find("a").addClass("active");
        this.$container.find(".tab-content").removeClass("active").eq(index).addClass("active");
    };
    /**
     * 点击事件点击事件
     * @param $li
     */
    SSQX.prototype.itemClick = function($li) {
        if ($li.find("a").hasClass("active")) {
            //取消选择
            $li.parents(".tab-content").nextAll(".tab-content").empty();
            $li.find("a").removeClass("active");
        } else {
            //选择
            $li.find("a").addClass("active");
            var data = $li.data("data");
            this.opts.pid = data[this.opts.simpleData.pid];
            if (this.iNow < this.opts.headers.length - 1) {
                //已经选择到最后一层
                this.iNow = this.iNow + 1;
                this.tabClick(this.$container.find(".tab").eq(this.iNow));
                this.load(function() {
                    this.render();
                });
            }
            this.setValue();
        }
    };
    /**
     * 设置值
     */
    SSQX.prototype.setValue = function() {
        var result = [], values = [], keys = [], sd = this.opts.simpleData;
        this.$container.find(".tab-content").find("a").each(function(i, item) {
            if ($(item).hasClass("active")) {
                var data = $(item).parent().data("data");
                result.push(data);
                values.push(sd.name);
                keys.push(sd.id);
            }
        });
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.length && this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(result);
        result = null;
        values = null;
        keys = null;
    };
    /**
     * 绑定事件
     */
    SSQX.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("mousedown.ssqx", function() {
            return false;
        }).on("click", ".close", function() {
            _this.hide();
        }).on("click", ".tab", function() {
            _this.tabClick($(this));
        }).on("click", ".item", function() {
            _this.itemClick($(this));
        });
        //close
        $(document).on("mousedown.ssqx", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
    };
    /**
     * 显示
     */
    SSQX.prototype.show = function() {
        if (this.isShow) return;
        this.setPos();
        this.$container.show();
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    SSQX.prototype.hide = function() {
        if (this.isShow) {
            this.$container.hide();
            this.isShow = false;
        }
    };
    /**
     * 设置位置
     */
    SSQX.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    /**
     * 销毁
     */
    SSQX.prototype.destroy = function() {
        this.$container.off(".ssqx");
        this.$container.remove();
    };
});

/**
 * Created by yilia on 2017/12/5.
 * @描述: 旅游线路主题控件
 */
define("js/SelectPeople", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var defaultOpts = {
        hiddenPeople: null,
        hiddenChild: null,
        hiddenYear: null,
        qxCbFn: function() {},
        data: {
            people: "5",
            child: "3",
            year: "17"
        }
    };
    function SelectPeople(elem, options, cbFn) {
        this.id = Common.cid("CallCenter");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend({}, defaultOpts, options);
        this.data = this.opts.data;
        this.cbFn = cbFn || $.noop;
        this.isShow = false;
        //默认隐藏
        this.people = 2;
        this.child = 0;
        this.year = [];
        this.$hiddenPeople = $("#" + this.opts.hiddenPeople);
        this.$hiddenChild = $("#" + this.opts.hiddenChild);
        this.$hiddenYear = $("#" + this.opts.hiddenYear);
        this.init();
    }
    var fn = SelectPeople.prototype;
    //初始化容器
    fn.init = function() {
        this.$container = $('<div class="vetech-xzperson-container" style="z-index:999"></div>');
        this.$navbox = $('<div class="navbox"></div>');
        this.$sortbox = $('<div class="sortbox"></div>');
        this.$childContent = $('<div class="xzperson-group clearfix"></div>');
        this.$container.append(this.$navbox);
        this.$container.append(this.$sortbox);
        $(document.body).append(this.$container);
        this.renderData();
    };
    //渲染数据
    fn.renderData = function() {
        var people = parseInt(this.data.people, 10);
        var child = parseInt(this.data.child, 10);
        if (people > 0) {
            var $ul = $("<ul></ul>");
            for (var i = 1; i < people + 1; i++) {
                var data = {
                    people: i,
                    child: "0",
                    year: []
                };
                var $li = $("<li title=" + i + "成人+0儿童/间><span>" + i + "</span>成人+0儿童/间</li>");
                $li.data("liData", data);
                $ul.append($li);
            }
            var $more = $('<a class="xzperson-more" href="javascript:;">更多选择》</a>');
            this.$navbox.append($ul);
            this.$navbox.append($more);
            var html = '<div class="xzperson-group clearfix">' + "<label>每间入住</label>" + '<div class="group-right"><div class="xzperson-input"><input type="text" id="peoplenum" value="2成人" data="2" readonly></div>' + '<div class="xzperson-input"><input type="text" id="childnum" value="0儿童" data="0" readonly></div>' + "</div></div>" + '<div class="group-foot">' + '<a class="xzperson-more" href="javascript:;">《常用选择 </a>' + '<div class="foot-btn">' + '<button class="btn-sure">确定</button>' + '<button class="btn-cancle">取消</button>' + "</div></div>";
            "</div></div>";
            this.$sortbox.append(html);
            this.createSelectNum("peoplenum", people);
            this.createSelectNum("childnum", child);
            this.bindEvent();
        }
    };
    //绑定事件
    fn.bindEvent = function(ev) {
        var _this = this;
        //绑定navbox下的li元素点击事件
        this.$navbox.find("ul li").on("click", function() {
            _this.liClickhandler($(this));
        });
        //绑定more元素点击事件
        this.$container.find(".xzperson-more").on("click", function() {
            _this.moreClickhandler();
        });
        this.$sortbox.find(".xzperson-input input").on("click", function() {
            _this.$sortbox.find(".select-nav").hide();
            $(this).siblings(".select-nav").show();
            return false;
        });
        /*绑定sortbox下的li元素点击事件*/
        this.$sortbox.find(".xzperson-input .select-nav li").on("click", function() {
            _this.setValuehandler($(this));
        });
        /*确定按钮*/
        this.$sortbox.find(".btn-sure").on("click", function() {
            _this.year = [];
            _this.people = _this.$sortbox.find("#peoplenum").attr("data");
            _this.child = _this.$sortbox.find("#childnum").attr("data");
            var yearNum = _this.$childContent.find(".xzperson-input").length;
            if (yearNum > 0) {
                for (var i = 0; i < yearNum; i++) {
                    _this.year.push(_this.$childContent.find(".xzperson-input").eq(i).find("input").attr("data"));
                }
            } else {
                _this.year = [];
            }
            _this.$elem.val(_this.people + "成人+" + _this.child + "儿童/间");
            _this.$hiddenPeople.val(_this.people);
            _this.$hiddenChild.val(_this.child);
            _this.$hiddenYear.val(_this.year);
            var cbfnData = {
                people: _this.people,
                child: _this.child,
                year: _this.year
            };
            if (_this.cbFn) _this.cbFn(cbfnData);
            _this.hide();
        });
        /*取消按钮*/
        this.$sortbox.find(".btn-cancle").on("click", function() {
            _this.opts.qxCbFn.call(_this);
            _this.hide();
        });
        //点击document关闭窗口
        $(document).on("click", function(ev) {
            var event = ev || window.event;
            var target = event.target;
            if (_this.elem !== target) {
                _this.hide();
            }
        });
        //容器阻止冒泡
        this.$container.on("click", function() {
            return false;
        });
        this.$sortbox.on("click", function() {
            $(this).find(".select-nav").hide();
        });
    };
    /*展开伸缩的事件*/
    fn.moreClickhandler = function() {
        if (this.$navbox.is(":hidden")) {
            this.$navbox.show();
            this.$sortbox.hide();
        } else {
            this.$navbox.hide();
            this.$sortbox.show();
        }
    };
    /*nav的下拉列表点击*/
    fn.liClickhandler = function(obj) {
        var $this = $(obj);
        this.$elem.val($this.text());
        this.$hiddenPeople.val($this.data("liData").people);
        this.$hiddenChild.val($this.data("liData").child);
        this.$hiddenYear.val($this.data("liData").year);
        if (this.cbFn) this.cbFn($this.data("liData"));
        this.hide();
    };
    /**
     * 创建选择人数下拉列表
     * @param obj 作用的元素
     * @param num 需要循环的num
     */
    fn.createSelectNum = function(obj, num) {
        var _this = this;
        var $select = $("<ul class='select-nav'></ul>");
        var text = "", qdvalue = 0;
        if (obj === "peoplenum") {
            text = "成人";
            qdvalue = 1;
        } else {
            text = "儿童";
            qdvalue = 0;
        }
        for (var i = qdvalue; i < num + 1; i++) {
            var $li = $('<li data="' + i + '">' + i + text + "</li>");
            $select.append($li);
        }
        this.$sortbox.find("#" + obj).parent().append($select);
        $select.hide();
    };
    /**
     * 创建儿童个数
     * @param num 创建儿童年龄下拉列表个数
     */
    fn.createChildNum = function(num) {
        var _this = this;
        num = parseInt(num, 10);
        var year = parseInt(this.data.year, 10);
        if (num > 0) {
            var $childLabel = $("<label>儿童年龄</label>");
            var $groupright = $('<div class="group-right"></div>');
            this.$childContent.append($childLabel);
            for (var i = 0; i < num; i++) {
                $groupright.append('<div class="xzperson-input" id="child' + i + '"><input type="text" value="≤1岁"  data="1" readonly></div>');
                var $select = $("<ul class='select-nav'></ul>");
                var text = "";
                for (var j = 1; j < year + 1; j++) {
                    if (j === 1) {
                        text = "≤1岁";
                    } else {
                        text = j + "岁";
                    }
                    var $li = $('<li data="' + j + '">' + text + "</li>");
                    $select.append($li);
                }
                $groupright.find("#child" + i).append($select);
                $select.hide();
            }
            this.$childContent.append($groupright);
            /*绑定$childContent下的input点击事件*/
            this.$childContent.find(".xzperson-input input").on("click", function() {
                _this.$sortbox.find(".select-nav").hide();
                $(this).siblings(".select-nav").show();
                return false;
            });
            /*绑定$childContent下的li元素点击事件*/
            this.$childContent.find(".xzperson-input .select-nav li").on("click", function() {
                _this.setValuehandler($(this));
            });
            this.$sortbox.find(".group-foot").before(this.$childContent);
        }
    };
    /**
     * 选择人数回填到下拉输入框
     * @param obj
     */
    fn.setValuehandler = function(obj) {
        var $this = $(obj);
        if ($this.parent().siblings().attr("id") === "childnum") {
            this.$childContent.children().remove();
            this.createChildNum($this.attr("data"));
        }
        $this.parents(".xzperson-input").find("input").val($this.text()).attr("data", $this.attr("data"));
        $this.parent().hide();
        return false;
    };
    /**
     * 显示
     */
    fn.show = function() {
        if (this.isShow) return;
        this.setPos();
        this.$container.css("visibility", "visible");
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    fn.hide = function() {
        if (!this.isShow) return;
        this.$container.css({
            left: "-1000px",
            top: "-1000px",
            visibility: "hidden"
        });
        this.isShow = false;
    };
    /**
     * 计算控件出现的位置
     */
    fn.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    /**
     * 阻止冒泡
     * @param {Object} ev
     */
    fn.stopEvent = function(ev) {
        ev = ev || window.event;
        if (ev.stopPropagation) ev.stopPropagation(); else ev.cancelbubble = true;
    };
    return SelectPeople;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 树形下拉控件（同步加载的数据，支持数据回填，异步加载的数据，不支持数据回填，因为每次要展开节点才能加载数据）
 * @linc: MIT
 *
 */
define("js/TreeSelect", [ "../js/Common" ], function(require) {
    var Common = require("../js/Common");
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOptions = {
        height: 300,
        //下拉框高度
        width: 0,
        //下拉框宽度，默认给0，如果不配置，则以input的宽度为准，
        type: "radio",
        //默认是单选，checkbox
        url: "",
        //url如果是字符串，标记是要在数据库中去加载，如果是数组，直接使用
        splitStr: ",",
        //分割符
        isExpandAll: true,
        //是否全部展开
        filterParent: false,
        //是否过滤过滤父节点
        cbFn: function() {},
        //回调函数
        settings: {
            async: {
                enable: false
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "pId"
                },
                key: {
                    name: "name"
                }
            }
        }
    };
    /**
     * 构造函数
     * @param elem
     * @param options
     * @constructor
     */
    function TreeSelect(elem, options) {
        this.id = Common.cid("TreeSelect");
        this.ztreeId = Common.cid("ztree");
        this.opts = $.extend(true, {}, defaultOptions, options);
        this.$elem = $(elem);
        this.elem = elem;
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.hiddenInputVal = [];
        //获取隐藏域中的值
        if (this.$hiddenInput.length) {
            this.hiddenInputVal = (this.$hiddenInput.val() || "").split(this.opts.splitStr);
        }
        this.ztreeObj = null;
        this.checkedNodes = [];
        //默认选中的节点
        this.data = [];
        //数据
        this.isShow = false;
        this.init();
    }
    /**
     * 初始化方法
     */
    TreeSelect.prototype.init = function() {
        //初始化容器
        this.$container = $('<div class="vetech-treeSelect"></div>');
        this.$treeContainer = $('<div class="ztree" id="' + this.ztreeId + '"></div>');
        var iContainerWidth = this.opts.width ? this.opts.width : this.$elem.outerWidth();
        this.$container.css({
            width: iContainerWidth,
            height: this.opts.height
        });
        this.$container.append(this.$treeContainer);
        $(document.body).append(this.$container);
        //配置
        var tempSettings = {
            check: {
                enable: this.opts.type !== "radio"
            },
            callback: {
                onNodeCreated: $.proxy(this.nodeCreatedHandler, this)
            }
        };
        this.settings = $.extend(true, {}, tempSettings, this.opts.settings);
        //如果是单选的，直接监听节点点击事件即可
        if (this.opts.type === "radio") {
            var onClick = this.settings.callback.onClick;
            if ($.type(onClick) === "function") {
                this.settings.callback.onClick = $.proxy(onClick, this);
            } else {
                this.settings.callback.onClick = $.proxy(this.itemClickHandler, this);
            }
        } else if (this.opts.type === "checkbox") {
            this.settings.callback.onCheck = $.proxy(this.itemCheckedHandler, this);
        }
    };
    /**
     * 加载数据
     * @param callback
     */
    TreeSelect.prototype.load = function(callback) {
        var _this = this;
        //异步
        if (this.settings.async.enable) {
            this.settings.async.url = this.opts.url;
            callback.call(_this);
        } else {
            var url = this.opts.url;
            if ($.type(url) === "array") {
                //数组
                this.data = url;
                callback.call(_this, _this.data);
            } else {
                $.ajax({
                    url: url,
                    dataType: "json",
                    type: "get",
                    data: this.opts.qDatas,
                    success: function(data) {
                        _this.data = data;
                        callback.call(_this, _this.data);
                    },
                    error: function(msg) {
                        Common.error(msg);
                    }
                });
            }
        }
    };
    TreeSelect.prototype.render = function() {
        this.ztreeObj = $.fn.zTree.init(this.$treeContainer, this.settings, this.data);
        var isAsync = this.settings.async.enable;
        if (!isAsync && this.opts.isExpandAll) {
            this.ztreeObj.expandAll(true);
        }
        //如果是同步树，则在500毫秒以后，执行回调函数
        if (!isAsync) {
            setTimeout($.proxy(this.writeValue, this), 500);
        }
        this.bindEvent();
    };
    /**
     * 节点创建后事件，用于同步数据回填
     * @param event
     * @param treeId
     * @param treeNode
     */
    TreeSelect.prototype.nodeCreatedHandler = function(event, treeId, treeNode) {
        if ($.inArray(treeNode[this.opts.settings.data.simpleData.idKey], this.hiddenInputVal) > -1) this.checkedNodes.push(treeNode);
    };
    /**
     * 同步树数据回填
     */
    TreeSelect.prototype.writeValue = function() {
        for (var i = 0, len = this.checkedNodes.length; i < len; i++) {
            this.ztreeObj.checkNode(this.checkedNodes[i], true, false);
        }
        this.setValue();
    };
    /**
     * 设置位置
     */
    TreeSelect.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        var InputHeihgt = this.$elem.outerHeight();
        //input的高度
        this.$container.css({
            left: pointer.left,
            top: pointer.top + InputHeihgt
        });
    };
    /**
     * 显示
     */
    TreeSelect.prototype.show = function() {
        if (this.isShow) return;
        this.setPos();
        this.$container.css("visibility", "visible");
        this.isShow = true;
    };
    /**
     * 隐藏
     */
    TreeSelect.prototype.hide = function() {
        if (!this.isShow) return;
        this.$container.css({
            visibility: "hidden",
            left: "-1000px",
            top: "-1000px"
        });
        this.isShow = false;
    };
    TreeSelect.prototype.destroy = function() {
        this.$container.remove();
        $(document).off(".ztree");
    };
    /**
     * 绑定事件
     */
    TreeSelect.prototype.bindEvent = function() {
        var _this = this;
        $(document).on("click.ztree", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
        this.$container.on("click.ztree", function() {
            return false;
        });
    };
    /**
     *节点被点击的事件回调函数
     * @param {Object} event 点击的事件对象
     * @param {Object} treeId  对应ztree的treeid，便于用户操作
     * @param {Object} treeNode 点击的节点对象（JSON格式）
     */
    TreeSelect.prototype.itemClickHandler = function(event, treeId, treeNode) {
        this.setValue(treeNode);
        this.hide();
    };
    /**
     * 捕获checkbox被勾选或取消勾选的事件回调
     */
    TreeSelect.prototype.itemCheckedHandler = function() {
        this.checkedNodes = this.ztreeObj.getCheckedNodes(true);
        this.setValue();
    };
    /**
     * 设置值
     * @param treeNode
     */
    TreeSelect.prototype.setValue = function(treeNode) {
        var checkedNodes = treeNode ? [ treeNode ] : this.checkedNodes;
        //获取所有选中的节点
        var values = [], keys = [];
        var id = this.opts.settings.data.simpleData.idKey, name = this.opts.settings.data.key.name;
        for (var i = 0, len = checkedNodes.length; i < len; i++) {
            //filter parent node data
            if (this.opts.filterParent && checkedNodes[i].isParent) continue;
            values.push(checkedNodes[i][name]);
            keys.push(checkedNodes[i][id]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
        this.opts.cbFn(checkedNodes);
    };
    return TreeSelect;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 右键菜单功能
 * @linc: MIT
 *
 */
define("js/VMenu", [ "../js/Common" ], function(require, exports, module) {
    "use strict";
    var Common = require("../js/Common");
    /**
	 * 默认参数
	 */
    var defaultOpts = {
        width: 100,
        model: 1,
        //model可以取两种，一种是model=1,菜单以show/hide方式来展现，一种是model=2，菜单是以enable/disable来显示
        type: 1,
        //type分两种情况，一种是type为1，表示typeValue就是数据对象，type为2，表示要用ajax去请求的
        typeValue: [],
        simpleData: {
            text: "text",
            //显示的内容
            icon: "icon"
        },
        cbFn: $.noop
    };
    /**
	 * 构造函数
	 * @param {Object} elem
	 * @param {Object} node
	 * @param {Object} options
	 */
    function VMenu(elem, options) {
        this.id = Common.cid("VMenu");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.state = "open";
    }
    /**
	 * 加载数据
	 * @param {Object} callback
	 */
    VMenu.prototype.load = function(callback) {
        callback = $.type(callback) === "function" ? callback : null;
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback && callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas || {},
                success: function(data) {
                    _this.data = data;
                    callback && callback.call(_this, data);
                },
                error: function(data) {
                    Common.error(data);
                }
            });
        }
    };
    VMenu.prototype.init = function() {
        if ($.type(this.data) !== "array") {
            Common.error("数据格式错误，菜单控件需要array");
            return;
        }
        this.$container = $("<div class='vetech-menu-container'></div>");
        var $ul = $("<ul></ul>");
        this.$container.append($ul);
        var len = this.data.length;
        //total count
        var _this = this;
        $.each(this.data, function(i, item) {
            var $li = $("<li class='menu-item'></li>");
            //把其他属性都加到li上
            _this.addExtendProps.call(_this, $li, item);
            if (item.icon) {
                var $img = $("<img src='" + item.icon + "'/>");
                $li.append($img);
            }
            var $span = $("<span>" + (item.text || "") + "</span>");
            $li.append($span);
            //最后一个节点不加上底线
            if (i === len - 1) $li.css("border-bottom", "none");
            //beforeInit自己控制是否显示隐藏
            var beforeInit = _this.opts.beforeInit;
            if ($.type(beforeInit) === "function") {
                var result = beforeInit(_this.$elem, $li, _this.opts.model, item);
                if (false === result) {
                    if (_this.opts.model === 1) {
                        setItemHide($li);
                    } else if (_this.opts.model === 2) {
                        setDisabled($li);
                    }
                }
            }
            $li.data("data", item);
            $ul.append($li);
        });
        //如果有数据的话，直接添加上去
        if (_this.data.length) {
            $(document.body).append(_this.$container);
            var afterInit = _this.opts.afterInit;
            //在初始化完毕以后，调用afterInit函数，进行权限设置
            if (afterInit && $.type(afterInit) === "function") {
                afterInit($ul.find("li"));
            }
        }
    };
    /**
	 * bind event
	 */
    VMenu.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("mousedown.vmenu", function(event) {
            if (event.button === 2) return false;
        }).on("contextmenu.vmenu", function() {
            return false;
        }).on("click.vmenu", "li", function() {
            _this.itemClick($(this));
        }).on("mouseenter.vmenu", "li", function() {
            _this.hoverHandler($(this));
        }).on("mouseleave.vmenu", function() {
            _this.hide();
        });
        $(document).on("mousemove." + _this.id, function(ev) {
            var target = ev.target;
            if (target !== _this.elem && !$(target).parents(".vetech-menu-container").length) {
                _this.state = "isClosing";
                //准备关闭
                clearTimeout(_this.timer);
                _this.timer = setTimeout(function() {
                    if (_this.state === "isClosing") {
                        _this.hide();
                    }
                }, 10);
            } else {
                _this.state = "open";
            }
        });
    };
    /**
	 * 菜单点击事件
	 */
    VMenu.prototype.itemClick = function($li) {
        if ($li.attr("isDisabled")) return;
        var callback = this.opts.cbFn;
        if (callback && $.type(callback) === "function") {
            callback($li, $li.data("data"));
        }
        this.hide();
    };
    /**
	 * 鼠标移动事件
	 */
    VMenu.prototype.hoverHandler = function($li) {
        if ($li.attr("isdisabled") === "true") return;
        this.$container.find("li").css("background", "#fff");
        $li.css("background", "#ddd");
    };
    /**
	 * 设置菜单显示的位置
	 */
    VMenu.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        var iWidth = $(document).width();
        var iHeight = $(document).height();
        //判断是显示左边还是显示右边
        if (iWidth - pointer.left - this.elem.offsetWidth < this.$container[0].offsetWidth) {
            this.$container.css("left", pointer.left - this.$container[0].offsetWidth);
        } else {
            this.$container.css("left", pointer.left + this.elem.offsetWidth);
        }
        //判断是显示下面还是显示上面(判断规则：以整个document中间为界限，目标点在中间偏上的位置，菜单显示在下方,目标点在中间偏下的地方，再进行特殊处理)
        if (pointer.top + this.elem.offsetHeight / 2 < iHeight / 2 || iHeight - pointer.top - this.elem.offsetHeight > this.$container[0].offsetHeight) {
            this.$container.css("top", pointer.top);
            //显示下面
            if (iHeight - pointer.top < this.$container[0].offsetHeight) {
                this.$container.css({
                    height: iHeight - pointer.top - 10,
                    overflow: "auto"
                });
            }
        } else {
            var iBottom = pointer.top + this.elem.offsetHeight - this.$container.get(0).offsetHeight;
            if (iBottom < 0) iBottom = 0;
            this.$container.css("top", iBottom);
            //显示上面
            if (pointer.top + this.elem.offsetHeight < this.$container[0].offsetHeight) {
                this.$container.css({
                    height: pointer.top + this.elem.offsetHeight - 10,
                    overflow: "auto"
                });
            }
        }
    };
    /**
	 * 显示
	 */
    VMenu.prototype.show = function() {
        this.setPos();
        this.$container.css("visibility", "visible");
    };
    /**
	 * 隐藏
	 */
    VMenu.prototype.hide = function() {
        this.$container.hide();
        this.destroy();
    };
    /**
	 * 销毁
	 */
    VMenu.prototype.destroy = function() {
        this.$container.off(".vmenu");
        $(document).off("." + this.id);
        this.$container.remove();
    };
    /**
	 * 设置菜单项不可操作
	 * @param {Object} $li
	 */
    function setDisabled($li) {
        $li.css({
            background: "#FCFCFC",
            color: "#999",
            cursor: "not-allowed"
        });
        $li.find("span").css("cursor", "not-allowed");
        $li.attr("isDisabled", true);
    }
    /**
	 * 设置菜单项隐藏
	 * @param {Object} $li
	 */
    function setItemHide($li) {
        $li.hide();
    }
    /**
	 * 添加扩展属性
	 * @param {Object} $li
	 * @param {Object} node
	 */
    VMenu.prototype.addExtendProps = function($li, nodeData) {
        var opts = this.opts.simpleData;
        for (var key in nodeData) {
            if (nodeData.hasOwnProperty(key) && key !== opts.text && key !== opts.icon) {
                $li.attr(key, nodeData[key]);
            }
        }
    };
    return VMenu;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: tab选项卡控件
 * @linc: MIT
 *
 */
define("js/VetechSlider", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
        width: 600,
        //轮播图的宽度
        height: 300,
        //轮播图的高度
        defer: 2e3,
        //自动播放间隔时间
        textAlign: "right",
        //圆点对齐方式
        isAutoPlay: true,
        //是否自动播放
        showTitle: true
    };
    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function VetechSlider(elem, options) {
        this.id = Common.cid("VetechSlider");
        this.opts = $.extend({}, defaultOpts, options);
        this.elem = elem;
        this.$elem = $(elem);
        this.cbFn = this.opts.cbFn || "";
        this.isMoving = false;
        //标记是否在移动
        this.currIndex = 0;
        //当前显示图片的下标
        this.nextIndex = 0;
        //下一个要显示的图片下标
        this.timer = {};
        this.direction = -1;
    }
    var fn = VetechSlider.prototype;
    /**
     * 加载数据
     * @param callback 回调函数
     */
    fn.load = function(callback) {
        if ($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                dataType: "json",
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        }
    };
    /**
	 * 初始化
	 */
    fn.render = function() {
        this.NUM = this.data.length;
        //图片的个数
        if (!this.NUM) return;
        //如果没有正确加载数据，或者是获取的数据对象中不存在数据，轮播图就不进行渲染
        this.$container = $('<div class="vetech-swiper"><ul></ul><div class="switch-bar"></div></div>');
        this.$nav = $("<ul></ul>");
        this.$slidebar = $('<div class="switch-bar"></div>');
        this.$container.css({
            width: this.opts.width,
            height: this.opts.height
        });
        this.$slidebar.css("text-align", this.opts.textAlign);
        this.$leftBtn = $('<span class="switch-btn leftBtn"></span>');
        this.$rightBtn = $('<span class="switch-btn rightBtn"></span>');
        this.$container.append(this.$nav).append(this.$slidebar).append(this.$leftBtn).append(this.$rightBtn);
        this.$elem.append(this.$container);
        this.renderData();
    };
    //渲染数据
    fn.renderData = function() {
        for (var i = 0; i < this.NUM; i++) {
            this.$nav.append(this.createLi(i, this.data[i]));
            var $point = this.createPoint(i);
            if (i === 0) $point.addClass("active");
            this.$slidebar.append($point);
        }
        this.bindEvent();
        this.autoPlay();
    };
    fn.bindEvent = function() {
        var _this = this;
        this.$leftBtn.on("click", $.proxy(this.leftBtnHandler, this));
        this.$rightBtn.on("click", $.proxy(this.rightBtnHandler, this));
        this.$container.on("click", ".point", $.proxy(this.pointHandler, this));
        this.$container.on("click", "ul li", function() {
            if ($.type(_this.cbFn) === "function") {
                _this.cbFn($(this));
            }
        });
    };
    /**
	 * 自动播放
	 */
    fn.autoPlay = function() {
        if (!this.opts.isAutoPlay) return;
        var _this = this;
        this.timer = setInterval(function() {
            _this.rightBtnHandler.call(_this);
        }, this.opts.defer);
    };
    /**
	 * 停止播放
	 */
    fn.stopPlay = function() {
        if (this.timer) clearInterval(this.timer);
    };
    fn.switchHandler = function() {
        var _this = this;
        if (this.isMoving) return;
        this.isMoving = true;
        this.stopPlay();
        var $currLi = this.$container.find("li[data-index='" + this.currIndex + "']");
        this.$container.find(".point").removeClass("active").eq(this.nextIndex).addClass("active");
        if (this.direction === 1) {
            //左边
            this.$nav.css("left", -this.opts.width);
            this.$container.find('li[data-index="' + this.nextIndex + '"]').insertBefore($currLi);
            this.$nav.animate({
                left: 0
            }, function() {
                _this.currIndex = _this.nextIndex;
                _this.isMoving = false;
                _this.autoPlay.call(_this);
            });
        } else {
            //右边操作
            $currLi.after(this.$container.find("li[data-index='" + this.nextIndex + "']"));
            this.$nav.animate({
                left: -this.opts.width
            }, function() {
                _this.$nav.find("li").last().after(_this.$nav.find("li").first());
                _this.$nav.css("left", 0);
                _this.currIndex = _this.nextIndex;
                _this.isMoving = false;
                _this.autoPlay.call(_this);
            });
        }
    };
    /**
	 * 左边按钮点击事件
	 */
    fn.leftBtnHandler = function() {
        this.direction = 1;
        this.nextIndex = this.currIndex <= 0 ? this.NUM - 1 : this.currIndex - 1;
        this.switchHandler();
    };
    /**
	 * 右边按钮点击事件
	 */
    fn.rightBtnHandler = function() {
        this.direction = -1;
        this.nextIndex = this.currIndex >= this.NUM - 1 ? 0 : this.currIndex + 1;
        this.switchHandler();
    };
    /**
	 * 点击圆点事件
	 * @param {Object} ev
	 */
    fn.pointHandler = function(ev) {
        if (this.isMoving) return;
        var $target = $(ev.target);
        if ($target.hasClass("active")) return;
        var index = $target.data("index");
        this.nextIndex = index;
        this.switchHandler();
    };
    /**
	 * 创建可点击的点
	 * @param {Object} index
	 */
    fn.createPoint = function(index) {
        return $('<span class="point" data-index="' + index + '"></span>');
    };
    fn.createLi = function(index, data) {
        var $li = $('<li data-index="' + index + '" style="width:' + this.opts.width + 'px"></li>'), $a = $("<a></a>"), $img = $("<img/>"), $p = $("<p>" + data.title + "</p>");
        if (data.href) {
            $a.attr("href", data.href).attr("target", "_blank");
        } else {
            $a.attr("href", "javascript:void(0);");
        }
        $a.append($img);
        if (this.opts.showTitle) {
            $a.append($p);
        }
        $li.append($a);
        $img.attr("src", data.url).css({
            width: this.opts.width,
            height: this.opts.height
        });
        //如果图片加载不出来，用占位图来显示
        $img.on("error", function() {
            $img.attr("src", "../img/slide-btn.png");
            $img.off("error");
        });
        return $li;
    };
    return VetechSlider;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: tab选项卡控件
 * @linc: MIT
 *
 */
define("js/VetechTab", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    var laytpl = window.laytpl;
    /**
     * 默认参数
     * @type {{}}
     */
    var defaultOpts = {
        type: 1,
        typeValue: {},
        splitStr: ",",
        //默认分隔符
        itemWidth: 55,
        //选项的宽度
        tabWidth: 100,
        //选项卡的宽度
        rightWidth: 180,
        //tab-header右侧空余的宽度
        mult: false,
        //支持多选
        title: "支持中文拼音/简拼/三字码的输入",
        simpleData: {
            id: "bh",
            name: "name"
        },
        beforeItemClick: function() {
            return true;
        },
        //选项点击前事件
        cbFn: function() {}
    };
    /**
     * tab选项卡
     * @param elem
     * @param options
     * @constructor
     */
    function VetechTab(elem, options) {
        this.id = Common.cid("vetechTab");
        this.elem = elem;
        this.$elem = $(elem);
        this.data = {};
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.isShow = false;
        //标记是否已经显示
        //把初始化的数据存储起来
        this.tempData = {};
        this.$hiddenInput = $("#" + this.opts.hiddenName);
        this.checkedItems = {};
    }
    /**
     * 加载数据
     * @param callback 回调函数
     */
    VetechTab.prototype.load = function(callback) {
        if ($.type(callback) !== "function") throw new Error("参数配置错误");
        var _this = this;
        if (this.opts.type === 1) {
            this.data = this.opts.typeValue;
            delete this.opts.typeValue;
            callback.call(_this, this.data);
        } else {
            $.ajax({
                type: "get",
                url: this.opts.typeValue,
                data: this.opts.qDatas,
                dataType: "json",
                success: function(data) {
                    _this.data = data;
                    callback.call(_this, data);
                },
                error: function(msg) {
                    Common.error(msg);
                }
            });
        }
    };
    /**
     * 存储数据
     */
    VetechTab.prototype.storeData = function() {
        var data = this.data;
        var id = this.opts.simpleData.id;
        for (var i = 0, len = data.length; i < len; i++) {
            for (var j = 0, len2 = data[i].groups.length; j < len2; j++) {
                var items = data[i].groups[j].items;
                for (var k = 0, len3 = items.length; k < len3; k++) {
                    var item = items[k];
                    this.tempData[item[id]] = item;
                }
            }
        }
    };
    /**
     * 初始化
     */
    VetechTab.prototype.init = function(callback) {
        var _this = this;
        this.storeData();
        var data = {
            title: this.opts.title,
            simpleData: this.opts.simpleData,
            list: this.data
        };
        Common.loadTpl(window.CTPL.TAB, function(state, result) {
            if ("error" === state) Common.tplError();
            laytpl(result).render(data, function(html) {
                _this.$container = $(html);
                $(document.body).append(_this.$container);
                _this.setWidth();
                _this.bindEvent();
                _this.tabClick(_this.$container.find(".tab").eq(0).find("a"));
                if (callback) callback.call(_this);
            });
        });
    };
    /**
     * 设置容器的宽度
     */
    VetechTab.prototype.setWidth = function() {
        var $tabs = this.$container.find(".tab-header").find("li");
        $tabs.css("width", this.opts.tabWidth);
        this.$container.width($tabs.length * this.opts.tabWidth + this.opts.rightWidth);
        this.$container.find(".tab-content").find("li").width(this.opts.itemWidth);
    };
    /**
     * 绑定相关事件
     */
    VetechTab.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("click.vetechTab", ".tab", function(ev) {
            _this.tabClick($(ev.target));
        });
        this.$container.on("click.vetechTab", ".item", $.proxy(this.itemClick, this));
        this.$container.on("click.vetechTab", function() {
            return false;
        });
        this.$container.on("click.vetechTab", ".close", $.proxy(this.hide, this));
        $(document).on("click.vetechTab", function(ev) {
            if (ev.target !== _this.elem) _this.hide();
        });
    };
    /**
     * 选项卡卡头点击事件
     * @param $target
     */
    VetechTab.prototype.tabClick = function($target) {
        var $tabs = this.$container.find(".tab"), $contents = this.$container.find(".tab-content"), currIndex = $target.data("index");
        $tabs.find("a").removeClass("active");
        $contents.removeClass("active");
        $tabs.eq(currIndex).find("a").addClass("active");
        $contents.eq(currIndex).addClass("active");
    };
    /**
     * 具体选项点击事件
     */
    VetechTab.prototype.itemClick = function(ev) {
        var target = ev.target, $target = $(target), id = target.id, result = this.tempData[id];
        if (!$target.is("a")) return;
        if (this.opts.mult) {
            if ($target.parent().hasClass("active")) {
                $target.parent().removeClass("active");
                delete this.checkedItems[id];
            } else {
                $target.parent().addClass("active");
                this.checkedItems[id] = result;
            }
            this.setValue(this.checkedItems);
            this.opts.cbFn(this.checkedItems);
        } else {
            var beforeItemClick = this.opts.beforeItemClick, isContinue = true;
            //是否继续执行
            //beforeItemClick用于机场航站楼控件，点击城市以后，还要展示该城市对应的航站楼
            if (beforeItemClick && $.type(beforeItemClick) === "function") {
                isContinue = beforeItemClick(result);
            }
            if (isContinue) {
                this.setValue(result);
                this.opts.cbFn(result);
                this.hide();
            }
        }
    };
    /**
     * 设置值
     * @param data
     */
    VetechTab.prototype.setValue = function(data) {
        var id = this.opts.simpleData.id;
        var name = this.opts.simpleData.name;
        var keys = [], values = [];
        if (this.opts.mult) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    keys.push(data[key][id]);
                    values.push(data[key][name]);
                }
            }
        } else {
            keys.push(data[id]);
            values.push(data[name]);
        }
        this.$elem.val(values.join(this.opts.splitStr));
        this.$hiddenInput.val(keys.join(this.opts.splitStr));
    };
    /**
     * 显示
     */
    VetechTab.prototype.show = function() {
        if (!this.isShow) {
            this.setPos();
            this.$container.show();
            this.isShow = true;
        }
    };
    /**
     * 隐藏
     */
    VetechTab.prototype.hide = function() {
        if (this.isShow) {
            this.$container.hide();
            this.isShow = false;
        }
    };
    /**
     * 设置位置
     */
    VetechTab.prototype.setPos = function() {
        var pointer = this.$elem.offset();
        this.$container.css({
            left: pointer.left,
            top: pointer.top + this.$elem.outerHeight()
        });
    };
    /**
     * 销毁
     */
    VetechTab.prototype.destroy = function() {
        this.$container.off(".vetechTab");
        $(document).off(".vetechTab");
        this.$container.remove();
    };
    return VetechTab;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 年月控件
 * @linc: MIT
 */
define("js/YearAndMonth", [ "../js/Common" ], function(require, exports, module) {
    var Common = require("../js/Common");
    //默认配置参数
    var defaultOpts = {
        yearName: "",
        //年份name属性，用于生成select的name属性值
        monthName: "",
        //月份name属性,用于生成select的name属性值
        disabledLater: false,
        //禁止当前时间后的年月不可选
        currYear: "",
        //当前要显示的年份
        currMonth: "",
        //当前要显示的月份
        startTime: new Date().getFullYear() - 20,
        //开始时间（默认是当前年前20年）
        endTime: new Date().getFullYear() + 20
    };
    /**
	 * 配置参数
	 * @param {Object} elem 
	 * @param {Object} options
	 * @param {Object} cbFn
	 */
    function YearAndMonth(elem, options, cbFn) {
        this.id = Common.cid("yearAndMonth");
        this.opts = $.extend({}, defaultOpts, options);
        this.opts.startTime = $.type(this.opts.startTime) === "string" ? parseInt(this.opts.startTime) : this.opts.startTime;
        this.opts.endTime = $.type(this.opts.endTime) === "string" ? parseInt(this.opts.endTime) : this.opts.endTime;
        //当前选中的年和月
        var date = new Date();
        this.opts.currYear = this.opts.currYear ? this.opts.currYear : date.getFullYear();
        this.opts.currMonth = this.opts.currMonth ? this.opts.currMonth : date.getMonth() + 1;
        this.cbFn = cbFn || function() {};
        this.$elem = $(elem);
        this.elem = elem;
        this.init();
    }
    /**
	 * 初始化函数
	 */
    YearAndMonth.prototype.init = function() {
        //年份
        this.$yearContainer = $('<select class="year"></select>');
        if (this.opts.yearName) this.$yearContainer.attr("name", this.opts.yearName);
        //月份
        this.$monthContainer = $('<select class="month"></select>');
        if (this.opts.monthName) this.$monthContainer.attr("name", this.opts.monthName);
        this.$container = $('<div class="time-Container"></div>');
        this.$container.append(this.$yearContainer).append(this.$monthContainer);
        this.hide();
        //先隐藏
        this.$elem.append(this.$container);
        this.bindEvent();
    };
    /**
	 * 渲染
	 */
    YearAndMonth.prototype.render = function() {
        //如果禁止选择当前时间后的时间，那么当前年以后的年份不进行渲染
        var endYear = this.opts.disabledLater ? new Date().getFullYear() : this.opts.endTime;
        var $option = null;
        for (var i = this.opts.startTime; i <= endYear; i++) {
            $option = $('<option value="' + i + '">' + i + "年</option>");
            this.$yearContainer.append($option);
        }
        var endMonth = this.opts.disabledLater ? new Date().getMonth() + 1 : 12;
        for (var j = 1; j <= endMonth; j++) {
            var value = j < 10 ? "0" + j : j;
            $option = $('<option value="' + value + '">' + j + "月</option>");
            this.$monthContainer.append($option);
        }
        this.wirteValue();
    };
    /**
	 * 数据回填
	 */
    YearAndMonth.prototype.wirteValue = function() {
        this.$yearContainer.val(this.opts.currYear);
        var month = parseInt(this.opts.currMonth);
        month = month < 10 ? "0" + month : month;
        this.$monthContainer.val(month);
    };
    /**
	 * 显示
	 */
    YearAndMonth.prototype.show = function() {
        this.$container.show();
    };
    /**
	 * 隐藏
	 */
    YearAndMonth.prototype.hide = function() {
        this.$container.hide();
    };
    /**
	 * 函数绑定
	 */
    YearAndMonth.prototype.bindEvent = function() {
        this.$yearContainer.on("change", $.proxy(this.timeChangeHandler, this));
        this.$monthContainer.on("change", $.proxy(this.timeChangeHandler, this));
    };
    /**
	 * 时间改变事件
	 */
    YearAndMonth.prototype.timeChangeHandler = function(ev) {
        var value = $(ev.target).find("option:selected").val();
        this.cbFn(ev.target, value);
    };
    return YearAndMonth;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:年月控件扩展
 * @linc: MIT
 *
 */
define("js/YearAndMonthExtra", [ "../js/Common", "../js/YearAndMonth", "./Common" ], function(require, exports, module) {
    function init() {
        var Common = require("../js/Common");
        var YearAndMonth = require("../js/YearAndMonth");
        /**
		 * 入口函数
		 * @param {Object} options
		 * @param {Object} cbFn
		 */
        $.fn.addYearAndMonth = function(options, cbFn) {
            if (!this.length) Common.nodeError(this);
            var yam = new YearAndMonth(this.get(0), options, cbFn);
            yam.render();
            yam.show();
        };
    }
    exports.init = init;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 年度、季度和月度控件
 * @linc: MIT
 *
 */
define("js/YearQuarterMonth", [ "../js/Common" ], function(require, exports, module) {
    //当前年
    var currYear = new Date().getFullYear();
    var Common = require("../js/Common");
    var laytpl = window.layui ? window.layui.laytpl : window.laytpl;
    /**
     * 默认配置参数
     * @type {{}}
     */
    var defaultOpts = {
        startYear: currYear - 10,
        //年份开始时间
        endYear: currYear + 10,
        //年份结束时间
        chooseName: "choose",
        //选择框的名字
        yearName: "year",
        //年下拉框的名称
        month1Name: "month1",
        //月份1下拉框的名称
        month2Name: "month2",
        //月份2下拉框的名称
        cbFn: function(select, value) {}
    };
    /**
     *
     * @param elem  要存放年度、季度和月度控件的
     * @param options
     * @constructor
     */
    function YearQuarterMonth(elem, options) {
        this.id = Common.cid("YearQuarterMonth");
        this.elem = elem;
        this.$elem = $(elem);
        this.opts = $.extend(true, {}, defaultOpts, options);
        this.init();
    }
    /**
     * 初始化
     */
    YearQuarterMonth.prototype.init = function() {
        var _this = this;
        Common.loadTpl(window.CTPL.YEARQUARTERMONTH, function(state, result) {
            if (state === "error") Common.tplError();
            laytpl(result).render(_this.opts, function(html) {
                _this.$container = $(html);
                _this.$elem.html(_this.$container);
                _this.bindEvent();
                _this.chooseHandler("year");
            });
        });
    };
    /**
     * 绑定函数
     */
    YearQuarterMonth.prototype.bindEvent = function() {
        var _this = this;
        this.$container.on("change.yearQuarterMonth", "select", function(ev) {
            var $target = $(this);
            if ($target.hasClass("choose")) {
                _this.chooseHandler(this.value);
            } else {
                _this.opts.cbFn(this, this.value);
            }
        });
    };
    /**
     * 选择
     * @param value
     */
    YearQuarterMonth.prototype.chooseHandler = function(value) {
        //初始选择的时候，让所有的都显示（相当于重置）
        this.$container.find("select").show().end().find("span").show();
        if (value === "year") {
            this.$container.find(".month1").hide().next("span").hide().next().hide();
            this.$container.find(".month2").hide().next("span").hide();
        } else if (value === "month") {
            this.$container.find(".splitStr").hide().end().find(".month2").hide().next("span").hide();
        }
    };
    /**
     * 销毁
     */
    YearQuarterMonth.prototype.destroy = function() {
        this.$container.off(".yearQuarterMonth");
        this.$container.remove();
    };
    return YearQuarterMonth;
});

/**
 * Created by zh on 2017/8/11.
 * @desc:酒店身份城市多选控件封装
 */
define("js/provinceAndCityExtra", [ "../js/ProvinceAndCity" ], function(require, exports, module) {
    /**
	 * 初始化模块
	 */
    function init() {
        var ProvinceAndCity = require("../js/ProvinceAndCity");
        var data = window.ssqx;
        if (!data) console.log("ssqx数据获取失败");
        var provinceData = data[0].data, cityData = data[1].data;
        var newData = [];
        $.each(provinceData, function(i, item) {
            item.type = "p";
            item.citys = getCitysByProvinceId(item.id, cityData);
            newData.push(item);
        });
        data = null;
        provinceData = null;
        cityData = null;
        $.fn.showProvinceAndCity = function(options, cbFn) {
            var pc = new ProvinceAndCity(this.get(0), options, cbFn);
            pc.load(newData, function() {
                this.render();
                this.writeValue();
            });
            this.on("click", function() {
                pc.show();
            });
        };
    }
    function getCitysByProvinceId(pId, cityData) {
        var cityDatas = [];
        $.each(cityData, function(i, item) {
            if (item.pid === pId) {
                item.type = "c";
                cityDatas.push(item);
            }
        });
        return cityDatas;
    }
    exports.init = init;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: treeSelect下拉框扩展
 * @linc: MIT
 *
 */
define("js/treeSelectExtra", [ "../js/Common", "../js/TreeSelect", "./Common" ], function(require, exports) {
    var Common = require("../js/Common");
    var TreeSelect = require("../js/TreeSelect");
    function init() {
        if ($.fn.showTreeSelect) return;
        $.fn.showTreeSelect = function(options) {
            if (!this.length) {
                Common.nodeError(this);
                return;
            }
            if (this.data("componentTreeSelect")) {
                this.data("componentTreeSelect").destroy();
                this.off(".ztree");
            }
            var tr = new TreeSelect(this.get(0), options);
            var isLoaded = false;
            this.on("click.ztree", function() {
                if (isLoaded) {
                    tr.show();
                } else {
                    tr.load(function(data) {
                        this.data = data.result;
                        this.render();
                        this.show();
                        isLoaded = true;
                    });
                }
            });
        };
    }
    exports.init = init;
});

/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 右键菜单功能
 * @linc: MIT
 *
 */
define("js/vmenuExtra", [ "../js/VMenu", "./Common" ], function(require, exports, module) {
    var VMenu = require("../js/VMenu");
    function init() {
        //如果已经被渲染完毕，就不在继续渲染，以便节省性能
        if ($.fn.createMenu) return;
        /**
		 * 添加方法
		 * @param {Object} nodes
		 * @param {Object} options
		 */
        $.fn.createMenu = function(options) {
            var triggerType = options.triggerType ? options.triggerType : "mouseenter";
            $.each(this, function(i, item) {
                $(item).on(triggerType, function() {
                    var menu = new VMenu(this, options);
                    menu.load(function() {
                        this.init();
                        this.bindEvent();
                        this.show();
                    });
                });
            });
        };
    }
    exports.init = init;
});
