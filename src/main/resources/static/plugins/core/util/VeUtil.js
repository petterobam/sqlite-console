/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述: 公共的一些东西
 * @linc: MIT
 */
define(function (require, exports, module) {
    //锁屏
    var loadingCache ={},
        $= window.jQuery,
        layer = layui.layer;
    require("store");


    /**
     * 锁屏
     */
    exports.load = function(){
        var index =  layer.msg("努力加载中...", {
            icon: 16,
            time:0,
            skin:"layui-kz-loading",
            area:["170px","50px"],
            shade: [0.1, '#000000']
        });
        loadingCache[index] = index;
        return index;
    };

    /**
     * 解锁
     * @param index
     */
    exports.unload = function(index){
        layer.close(index);
    };

    /**
     * 根据汉字获取汉字所对应的英文字母
     * @param cnStr
     * @param callback
     */
    exports.getInitialByCn = function(cnStr,callback){
        callabck = $.type(callback) === "function" ? callback :function(){};

        if($.trim(cnStr) === ""){
            callback("success","");
            return;
        }
        $.ajax({
            url:"/component/toPinYin",
            data:{
                cn: cnStr
            },
            success:function(data){
                callabck("success",data.result);
            },
            error:function(msg){
                callabck("error",msg);
            }
        })
    };


    /**
     * 某列相同值行合并（主要用于动态生成的表格，根据某列数据值进行合并的）
     * @param tableId 要合并的表格id
     * @param columnId 哪一列要进行相同值的合并
     * @param formatFn  td中值的格式化函数，防止显示的值是一样的，但是实际上td中dom节点不一样导致的无法合并
     */
    function rowGroup(tableId,columnId,formatFn){
        var columns = [];
        $("#" +tableId).find("tbody").find("tr").each(function(){
            var $tds = $(this).find("td");
            columns.push($tds.eq(columnId));
        });
        merge(columns,formatFn);
    }

    function merge(arr,formatFn){
        var lastVal = "",
            delArr = [],
            rowSpanNum = 1;

        for(var i = 0,len = arr.length;i<len;i++){
            var thisVal = arr[i].html();
            thisVal = $.type(formatFn) === "function" ? formatFn(thisVal) : thisVal;
            if(i === 0){
                lastVal = thisVal;
            }else{
                if(lastVal === thisVal){
                    rowSpanNum +=1;
                    delArr.push(arr[i]);
                }
                if(lastVal !== thisVal){
                    if(rowSpanNum !==1){
                        arr[i - rowSpanNum].attr("rowspan",rowSpanNum);
                        clearTd(delArr);
                    }
                    lastVal = thisVal;
                    rowSpanNum = 1;
                }
            }
        }
        //如果最后一行有需要合并的，在循环完毕以后，执行合并操作
        if(rowSpanNum >1){
            arr[len - rowSpanNum].attr("rowspan",rowSpanNum);
            clearTd(delArr);
        }
    }

    /**
     * 清除多余的td
     * @param arr  被清除的td节点集合
     */
    function clearTd(arr){
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].remove();
        }
        arr.length = 0;
    }

    exports.rowGroup = rowGroup;


    /**
     * 导出表格
     * @param params
     */
    function exportGrid(params){
        var keyId = "gps_" +String(Math.random()).replace(/\D/g,"");
        store.set(keyId,params);
        layui.layer.open({
            type:2,
            area:["700px","450px"],
            title:"导出",
            content:"/component/exportGrid?keyId=" + keyId,
            end:function(){
                store.remove(keyId);
            }
        });

    }

    exports.exportGrid = exportGrid;

    /**
     * 人民币转汉字大写
     */
    function RMBUpperCase(currencyDigits,prefix){
        var MAXIMUM_NUMBER = 99999999999.99;
        var CN_ZERO = "零",CN_ONE = "壹",CN_TWO = "贰", CN_THREE = "叁",CN_FOUR = "肆",CN_FIVE = "伍",
            CN_SIX = "陆", CN_SEVEN = "柒", CN_EIGHT = "捌", CN_NINE = "玖",CN_TEN = "拾",CN_HUNDRED = "佰",
            CN_THOUSAND = "仟", CN_TEN_THOUSAND = "万",CN_HUNDRED_MILLION = "亿", CN_SYMBOL = "人民币",
            CN_DOLLAR = "元", CN_TEN_CENT = "角", CN_CENT = "分", CN_INTEGER = "整";
        // Variables:
        var integral, decimal, outputCharacters,parts;
        var digits, radices, bigRadices, decimals;
        var zeroCount,i, p, d,quotient, modulus;
        // Validate input string:
        currencyDigits = currencyDigits.toString();
        if (currencyDigits == "") {
            alert("请输入小写金额！");
            return "";
        }
        if (currencyDigits.match(/[^,.\d]/) != null) {
            alert("小写金额含有无效字符！");
            return "";
        }
        if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
            alert("小写金额的格式不正确！");
            return "";
        }
        // Normalize the format of input digits:
        currencyDigits = currencyDigits.replace(/,/g, "");    // Remove comma delimiters.
        currencyDigits = currencyDigits.replace(/^0+/, "");    // Trim zeros at the beginning.
        // Assert the number is not greater than the maximum number.
        if (Number(currencyDigits) > MAXIMUM_NUMBER) {
            alert("金额过大，应小于1000亿元！");
            return "";
        }
        // Process the coversion from currency digits to characters:
        // Separate integral and decimal parts before processing coversion:
        parts = currencyDigits.split(".");
        if (parts.length > 1) {
            integral = parts[0];
            decimal = parts[1];
            // Cut down redundant decimal digits that are after the second.
            decimal = decimal.substr(0, 2);
        }
        else {
            integral = parts[0];
            decimal = "";
        }
        // Prepare the characters corresponding to the digits:
        digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
        radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
        bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
        decimals = new Array(CN_TEN_CENT, CN_CENT);
        // Start processing:
        outputCharacters = "";
        // Process integral part if it is larger than 0:
        if (Number(integral) > 0) {
            zeroCount = 0;
            for (i = 0; i < integral.length; i++) {
                p = integral.length - i - 1;
                d = integral.substr(i, 1);
                quotient = p / 4;
                modulus = p % 4;
                if (d == "0") {
                    zeroCount++;
                }else {
                    if (zeroCount > 0)
                    {
                        outputCharacters += digits[0];
                    }
                    zeroCount = 0;
                    outputCharacters += digits[Number(d)] + radices[modulus];
                }
                if (modulus == 0 && zeroCount < 4) {
                    outputCharacters += bigRadices[quotient];
                    zeroCount = 0;
                }
            }
            outputCharacters += CN_DOLLAR;
        }
        // Process decimal part if there is:
        if (decimal != "") {
            for (i = 0; i < decimal.length; i++) {
                d = decimal.substr(i, 1);
                if (d != "0") {
                    outputCharacters += digits[Number(d)] + decimals[i];
                }
            }
        }
        // Confirm and return the final output string:
        if (outputCharacters == "") {
            outputCharacters = CN_ZERO + CN_DOLLAR;
        }
        if (decimal == "") {
            outputCharacters += CN_INTEGER;
        }
        //prefix 为true则结果带`人民币`的前缀
        outputCharacters = (prefix?CN_SYMBOL:"") + outputCharacters;
        return outputCharacters;
    }

    exports.RMBUpperCase = RMBUpperCase;


    /**
     * 添加title提示
     */
    exports.addTitleTips = function(){
        $(document).on("mousemove",function(ev){
            var $target = $(ev.target),
                veTitle = $target.attr("veTitle");
            if(veTitle){
                //如果已经被绑定，就不再弹出
                if($target.data("tipsIndex")) return;

                var tipsIndex = layer.tips(veTitle, $target, {
                    tips: [1, '#009688'],
                    time:1000*30
                });
                $target.data("tipsIndex",tipsIndex);
                $target.on("mouseleave.tips",function(){
                    layer.close($(this).data("tipsIndex"));
                    $(this).removeData("tipsIndex");
                    $target.off("tips");
                });
            }
        });

    }




});
