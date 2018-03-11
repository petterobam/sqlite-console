/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:  加、减、乘、除、四舍五入、五舍六入等计算工具类库
 * @linc: MIT
 */
define(function (require, exports, module) {

    require("core/util/decimal.js");

    var Calc = {
        //加法运算
        add: function (x, y) {
            var b = new Decimal(x || 0).plus(y || 0);
            return b.toNumber();
        },
        //减法运算
        sub: function (x, y) {
            var b = new Decimal(x || 0).sub(y || 0);
            return b.toNumber();
        },
        //乘法运算
        mul: function (x, y) {
            var b = new Decimal(x || 0).mul(y || 0);
            return b.toNumber();
        },
        //除法运算
        div: function (x, y) {
            var b = new Decimal(x || 0).div(y || 0);
            return b.toNumber();
        },
        //4舍五入  舍入规则 num为需要舍入的数字，len为要保留几位小数
        sr4: function (num, len) {
            return this.sr(num, len, 4);
        },
        //舍入规则 num为需要舍入的数字，len为要保留几位小数，sr为要舍去的最大数，例如sr=8的话就是8舍9入.三个参数都是必传否则会直接返回num
        sr: function (num, len, sr) {
            var arr = String(num).split(".");
            if (arr.length === 1) return num; //如果要舍入的num就是一个整数，直接返回，不进行舍入
            if (len == 0) { //不保留小数，只取整数
                var currVal = parseInt(arr[1].charAt(0));
                var tempArr = (currVal > sr ? 1 : 0);
                return parseInt(arr[0]) + parseInt(tempArr);
            } else if (len >= arr[1].length) { //如果要保留的小数位数大于本身存在的小数位数，就直接返回
                return num;
            } else {
                var currVal = parseInt(arr[1].charAt(len));
                var tempArr = ( parseInt(arr[1].substring(0, len)) + ( currVal > sr ? 1 : 0) ) / Math.pow(10, len);
                return parseInt(arr[0]) + tempArr;
            }
        },
        arr_sum: function (arr) {
            var result = 0;
            if (arr.length == 1) {//数组中只有1个那么直接返回
                return arr[0];

            } else if (arr.length > 1) {//数据中如果有2个及2个以上的数据那么就循环求和
                result = arr[0] || 0;
                for (var i = 1; i < arr.length; i++) {
                    result = new Decimal(result).plus(arr[i] ||0);
                }
            }
            return result;
        },
        formatNum:function(num,len,sr){ //格式化数据
            len = len || 2;
            sr = sr || 4;
            var result = this.sr(num,len,sr) +"";
            if(result.indexOf(".") >-1 && result.lastIndexOf("0") === result.length-1){
                result = result.substring(0,result.length-1);
                if(result.lastIndexOf(".") === result.length-1){ //123.0，去掉最后一个零以后，还要把.去掉
                    result = result.substring(0,result.length-1);
                }
            }

            return result;
        }
    };

   return Calc;

});
