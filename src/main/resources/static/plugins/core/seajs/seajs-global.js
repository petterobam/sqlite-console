seajs.config({
	base:"/static/plugins",
	paths:{
		"core":"/static/plugins/core"
	},
	alias:{
		"validation":"core/validation/jquery.validationEngine.js",
		"validationRule":"core/validation/jquery.validationEngine-zh_CN.js",
		"jqGrid-core":"core/jqGrid/js/jquery.jqGrid.js",
		"jqGrid-zh":"core/jqGrid/js/i18n/grid.locale-cn.js",
		"cookie":"core/cookie/jquery.cookie.js",
		"store":"core/store/store2.min.js",
		"md5":"core/util/md5.min.js",
		"vue2":"vue/vue.min.js",
		"ztree":"core/ztree/js/jquery.ztree.all.min.js",
		"moment":"/static/plugins/core/util/moment/moment.min.js"
	}
});

/**
 * 模板路径
 * @type {{}}
 */
window.CTPL = {
    YEARQUARTERMONTH:"/static/plugins/components/tpl/yearQuarterMonthTpl.html",
    "TAB":"/static/plugins/components/tpl/tabTpl.html",
	"JCHZL":"/static/plugins/components/tpl/jchzlTpl.html"
};