$(function () {
    initPage();
});

/*初始化界面*/
function initPage() {
    //界面调整
    cssAdjust();
    //表单初始化
    consoleFormInit();
}

/*界面调整*/
function cssAdjust() {
    var mainHeight = $("#page").height() - $("#top").height() - $("#footer").height();
    $("#db-list").height(mainHeight);
    $("#console").height(mainHeight);
}

/*consoleForm事件添加*/
function consoleFormInit() {
    $("#findDbBtn").click(function () {
        findDbs();
    });
    $("#db-path-ipt").on("keydown", function (event) {
        if (event.keyCode == "13") {//监控enter键
            findDbs();
            return false;
        }
    })
}

function findDbs() {
    var formJsonStr = JSON.stringify($("#consoleForm").serializeObject());
    $.ajax({
        url: "/find/dbs",
        type: "post",
        contentType: "application/json",
        data: formJsonStr,
        success: function (res) {
            var status = res.status;
            if (status == 1) {
                var data = res.result;
                var htmlTpl = $("#db-list-tpl").html();
                laytpl(htmlTpl).render(data, function (html) {
                    $("#db-list").html(html);
                });
                if (data instanceof Array && data.length > 0) {
                    addDbClickEvent();
                }
            } else {

            }
        }, error: function (e) {

        }
    })
}

/*console控制台输入项初始化，事件添加*/
function consoleActiveInit() {
    var activeTextarea = $("#console").find(".active-console .console-content textarea");
    if (null == activeTextarea || activeTextarea.length == 0) {
        var htmlTpl = $("#console-active-tpl").html();
        $("#console").append(htmlTpl);
        activeTextarea = $("#console").find(".active-console .console-content textarea");

        activeTextarea.on("keydown", function (event) {
            var $this = $(this);
            $this.height(this.scrollHeight + 20);
            if (event.keyCode == "13") {//监控enter键
                excuteSql($this);
            } else if (event.keyCode == 37) {//左

            } else if (event.keyCode == 38) {//上
                historySqlAttach($this, "up");
                addCurrentSqlStyle($this);
            } else if (event.keyCode == 39) {//右

            } else if (event.keyCode == 40) {//下
                historySqlAttach($this, "down");
                addCurrentSqlStyle($this);
            } else {
                addCurrentSqlStyle($this);
            }
        }).focus();

        $("#console").click(function () {
            $("#console").find(".active-console .console-content textarea").focus();
        });
    }
}

/*执行SQL，并将结果打印到控制台*/
function excuteSql(activeTextarea) {
    var dbName = $("#console").attr("current-db-name");
    var currentSql = activeTextarea.val();
    // 存储历史执行过的命令
    addExcutedSql(currentSql);
    if (currentSql == "clear") {
        $("#console").empty();
        consoleActiveInit();
        return;
    }
    var formJson = getFormJsonWithDbPathDeal(dbName);
    formJson.sql = currentSql;
    var formJsonStr = JSON.stringify(formJson);
    $.ajax({
        url: "/excute",
        type: "post",
        contentType: "application/json",
        data: formJsonStr,
        success: function (res) {
            var status = res.status;
            var data = res.result;
            if (status == 1) {
                addConsoleExcInfo(data);
                //去掉当前active
                $("#console").find(".active-console").removeClass("active-console");
                var sqlPre = $("<pre></pre>").html(currentSql);
                activeTextarea.parent().append(sqlPre);
                activeTextarea.remove();
                //添加新active，并初始化
                consoleActiveInit();
            } else {

            }
        }, error: function (e) {

        }
    });
}

var OLD_SQL = {sqlArr: [], statusArr: [], current: -1};

/*添加执行过的历史SQL*/
function addExcutedSql(sql) {
    OLD_SQL.sqlArr.push(sql);
    OLD_SQL.current = OLD_SQL.sqlArr.length - 1;
}

function addExcuteStatus(status) {
    OLD_SQL.statusArr.push(status);
}

/*样式字典*/
var SQL_EXEC_STATUS = {
    NORMAL: {KEY: 0, STYLE: {color: "#FFFFFF"}},
    YELLOW: {KEY: 1, STYLE: {color: "#f8f533"}},
    PINK: {KEY: 2, STYLE: {color: "#f83df2"}},
    RED: {KEY: 3, STYLE: {color: "#f81516"}}
};

/*设置当前Sql应有的样式*/
function addCurrentSqlStyle(activeTextarea) {
    var currentSql = activeTextarea.val();
    var currentOldSql = activeTextarea.attr("current-old-sql");
    var currentOldStatus = activeTextarea.attr("current-old-sql-status");
    if (currentSql == currentOldSql) {
        if (currentOldStatus == SQL_EXEC_STATUS.YELLOW.KEY) {
            activeTextarea.css(SQL_EXEC_STATUS.YELLOW.STYLE);
        } else if (currentOldStatus == SQL_EXEC_STATUS.PINK.KEY) {
            activeTextarea.css(SQL_EXEC_STATUS.PINK.STYLE);
        } else if (currentOldStatus == SQL_EXEC_STATUS.RED.KEY) {
            activeTextarea.css(SQL_EXEC_STATUS.RED.STYLE);
        } else {
            activeTextarea.css(SQL_EXEC_STATUS.NORMAL.STYLE);
        }
    } else {
        activeTextarea.css(SQL_EXEC_STATUS.NORMAL.STYLE);
    }
}

/*历史执行SQL切换*/
function historySqlAttach(activeTextarea, type) {
    var oldCurrent = OLD_SQL.current;
    var oldCurrentStatus = "normal";
    if (type == "up") {
        if (OLD_SQL.current > -1 && OLD_SQL.current < OLD_SQL.sqlArr.length) {
            activeTextarea.val(OLD_SQL.sqlArr[oldCurrent]);
            OLD_SQL.current--;
        }
        OLD_SQL.current = OLD_SQL.current < 0 ? OLD_SQL.sqlArr.length - 1 : OLD_SQL.current;
    } else if (type == "down") {
        if (OLD_SQL.current > -1 && OLD_SQL.current < OLD_SQL.sqlArr.length) {
            activeTextarea.val(OLD_SQL.sqlArr[oldCurrent]);
            OLD_SQL.current++;
        }
        OLD_SQL.current = OLD_SQL.current >= OLD_SQL.sqlArr.length ? 0 : OLD_SQL.current;
    }
    activeTextarea.attr("current-old-sql", OLD_SQL.sqlArr[oldCurrent]);
    if (OLD_SQL.current > -1 && OLD_SQL.current < OLD_SQL.statusArr.length) {
        oldCurrentStatus = OLD_SQL.statusArr[oldCurrent];
    }
    activeTextarea.attr("current-old-sql-status", oldCurrentStatus);
}

/*输出执行语句的结果*/
function addConsoleExcInfo(data) {
    if (null != data) {
        var queryResult = data["queryResult"];
        var cmdResult = data["cmdResult"];
        var infactLine = data["infactLine"];
        var sqlException = data["sqlException"];
        var exception = data["exception"];
        if (null != queryResult) {
            addConsoleInfo(queryResult, "table");
            addExcuteStatus(SQL_EXEC_STATUS.NORMAL.KEY);
        } else if (null != cmdResult) {
            addConsoleInfo(cmdResult);
            addExcuteStatus(SQL_EXEC_STATUS.YELLOW.KEY);
        } else if (null != sqlException) {
            addConsoleInfo("语句有误：" + sqlException["message"]);
            addExcuteStatus(SQL_EXEC_STATUS.PINK.KEY);
        } else if (null != exception) {
            addConsoleInfo("程序异常：" + exception["message"]);
            addExcuteStatus(SQL_EXEC_STATUS.RED.KEY);
        } else {
            addConsoleInfo("执行完毕，影响行数 " + infactLine + "行。");
            addExcuteStatus(SQL_EXEC_STATUS.NORMAL.KEY);
        }
    } else {
        addConsoleInfo("执行未响应！！")
    }
}

/*添加控制台信息*/
function addConsoleInfo(data, type) {
    if ("table" == type) {
        var htmlTpl = $("#console-table-output-tpl").html();
        laytpl(htmlTpl).render(data, function (html) {
            $("#console").append(html);
        });
    } else {
        var htmlTpl = $("#console-normal-output-tpl").html();
        laytpl(htmlTpl).render(data, function (html) {
            $("#console").append(html);
        });
    }
}

/*连接数据库，双击查询表清单，单击缩放*/
function addDbClickEvent() {
    $("#db-list").find(".db-area").dblclick(function () {
        var dbDiv = $(this);
        var dbName = dbDiv.attr("db-name");
        var formJson = getFormJsonWithDbPathDeal(dbName);
        var formJsonStr = JSON.stringify(formJson);
        $("#console").find(".active-console").remove();
        addConsoleInfo("正在连接数据库 => " + dbName + " ...");
        $.ajax({
            url: "/find/tables",
            type: "post",
            contentType: "application/json",
            data: formJsonStr,
            success: function (res) {
                var status = res.status;
                if (status == 1) {
                    var data = res.result;
                    if (data == null) data = [];
                    var htmlTpl = $("#table-list-tpl").html();
                    laytpl(htmlTpl).render(data, function (html) {
                        //填充表格信息
                        var parentEle = dbDiv.parent();
                        var tableListEle = parentEle.find(".table-list");
                        tableListEle.html(html);
                        //添加表格点击事件
                        addTableClickEvent(tableListEle);
                        parentEle.find("span").removeClass("red").addClass("green");
                        $("#db-list").find(".db-area").removeClass("active");
                        dbDiv.addClass("active");
                        $("#console").attr("current-db-name", dbName);
                        $("#current-db-info").html("<pre>  当前连接 => " + dbName + "</pre>");
                        addConsoleInfo("数据库已连接 => " + dbName);
                        //添加新active，并初始化
                        consoleActiveInit();
                    });
                } else {

                }
            }, error: function (e) {

            }
        });
    }).click(function () {
        var dbDiv = $(this);
        var parentEle = dbDiv.parent();
        var openTable = dbDiv.attr("open-table");
        if (openTable == "0") {
            parentEle.find(".table-list").show();
            dbDiv.attr("open-table", "1");
        } else {
            parentEle.find(".table-list").hide();
            dbDiv.attr("open-table", "0");
        }
    });
}

/*添加表格点击事件*/
function addTableClickEvent(parentEle) {
    parentEle.find(".table-area").dblclick(function () {
        var activeTextarea = $("#console").find(".active-console .console-content textarea");
        var tableName = $(this).attr("table-name");
        activeTextarea.val("select * from sqlite_master where type='table' and name='" + tableName + "'");
        excuteSql(activeTextarea);
    });
}

/*预处理数据库路径，并得到表单Json*/
function getFormJsonWithDbPathDeal(dbName) {
    var dbPathIpt = $("#db-path-ipt");
    var daPath = dbPathIpt.val();
    var oldDbPath = daPath;
    if (!daPath.endsWith(".db")) {
        daPath = "/" + daPath + "/" + dbName;
    }
    dbPathIpt.val(daPath);
    var formJson = $("#consoleForm").serializeObject();
    dbPathIpt.val(oldDbPath);
    return formJson;
}

/*序列化表单成json对象*/
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};