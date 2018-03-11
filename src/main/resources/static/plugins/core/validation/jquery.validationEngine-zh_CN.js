(function($){
    $.fn.validationEngineLanguage = function(){
    };
    $.validationEngineLanguage = {
        newLang: function(){
            $.validationEngineLanguage.allRules = {
                "required": { // Add your regex rules here, you can take telephone as an example
                    "regex": "none",
                    "alertText": "此处不为空，请输入值",
                    "alertTextCheckboxMultiple": "请选择一个项目",
                    "alertTextCheckboxe": "您必须钩选此栏",
                    "alertTextDateRange": "日期范围不可为空"
                },
                "requiredInFunction": {
                    "func": function (field, rules, i, options) {
                        return (field.val() == "test") ? true : false;
                    },
                    "alertText": "Field must equal test"
                },
                "airportCode": {
                    "func": function (field, rules, i, options) {
                        var val = field.val();
                        if ($.trim(val)=="") {
                            return true;
                        }
                        if (val == "---") {
                            return true;
                        }
                        var reg = /\//g;
                        var str = val.replace(reg, "");
                        reg = /\w{3}/g;
                        var a = str.match(reg);
                        if (!a) {
                            return false;
                        }
                        var end = str.substring(a.join('').length);
                        if (end.length > 0) {
                            return false;
                        }
                        return true;
                    },
                    "alertText": "请输入正确的机场三字码，必须用/分隔,如:PEK/SZX"
                },
                "hx": {
                    "func": function (field, rules, i, options) {
                        var val = field.val();
                        if ($.trim(val)=="") {
                            return true;
                        }
                        var reg = /\//g;
                        var str = val.replace(reg, "");
                        reg = /\w{6}/g;
                        var a = str.match(reg);
                        if (!a) {
                            return false;
                        }
                        var end = str.substring(a.join('').length);
                        if (end.length > 0) {
                            return false;
                        }
                        return true;
                    },
                    "alertText": "请输入正确航线，必须用/分隔,如:PEKWUH/SZXPEK"
                },
                "dotmax": {
                    "regex": "none",
                    "alertText": "小数点后位数不能超过"
                },
                "dateRange": {
                    "regex": "none",
                    "alertText": "无效的 ",
                    "alertText2": " 日期范围"
                },
                "dateTimeRange": {
                    "regex": "none",
                    "alertText": "无效的 ",
                    "alertText2": " 时间范围"
                },
                "minSize": {
                    "regex": "none",
                    "alertText": "最少",
                    "alertText2": "个字符"
                },
                "maxSize": {
                    "regex": "none",
                    "alertText": "最多 ",
                    "alertText2": " 个字符"
                },
                "groupRequired": {
                    "regex": "none",
                    "alertText": "你必须选填其中一个栏位"
                },
                "min": {
                    "regex": "none",
                    "alertText": "最小值为 "
                },
                "max": {
                    "regex": "none",
                    "alertText": "最大值为 "
                },
                "past": {
                    "regex": "none",
                    "alertText": "日期必须等于 ",
                    "alertText2": " 或者在此日期之前"
                },
                "future": {
                    "regex": "none",
                    "alertText": "日期必须等于 ",
                    "alertText2": " 或者在此日期之后"
                },
                "maxCheckbox": {
                    "regex": "none",
                    "alertText": "最多选取 ",
                    "alertText2": " 个项目"
                },
                "minCheckbox": {
                    "regex": "none",
                    "alertText": "请选择 ",
                    "alertText2": " 个项目"
                },
                "minCheckbox4b2g": {
                    "regex": "none",
                    "alertText": "请选择 ",
                    "alertText2": " 个选项"
                },
                "equals": {
                    "regex": "none",
                    "alertText": "请输入与前面相同的密码"
                },
                "creditCard": {
                    "regex": "none",
                    "alertText": "无效的信用卡号码"
                },
                "phone": {
                    // credit: jquery.h5validate.js / orefalo
                    "regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
                    "alertText": "无效的电话号码"
                },
                "fax": {
                    // credit: jquery.h5validate.js / orefalo
                    "regex": /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
                    "alertText": "无效的传真号码"
                },
                "mobile": {
                    // credit: jquery.h5validate.js / orefalo
                    "regex": /(^0?[1][0-9]{10}$)/,
                    "alertText": "请输入合法的手机号码"
                },
                "email": {
                    // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
                    "regex": /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
                    "alertText": "邮件地址无效"
                },
                "integer": {
                    "regex": /^[\-\+]?\d+$/,
                    "alertText": "只能输入有效的整数"
                },
                "qqnumber": {
                    "regex": /^[\-\+]?\d+$/,
                    "alertText": "* 无效的格式"
                },
                "number": {
                    // Number, including positive, negative, and floating decimal. credit: orefalo
                    "regex": /^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/,
                    "alertText": "无效的数字"
                },
                "date": {
                    "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/,
                    "alertText": "无效的日期，格式必须为 YYYY-MM-DD"
                },
                "ipv4": {
                    "regex": /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/,
                    "alertText": "无效的 IP 地址"
                },
                "mipv4": {
                    "func": function (field, rules, i, options) {
                        var ipval = field.val();
                        if (ipval == "")return true;
                        var reg = /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/;
                        var patt1 = new RegExp(reg);
                        var ipvalarr = ipval.split(",");
                        for (var i = 0; i < ipvalarr.length; i++) {
                            if (!patt1.test(ipvalarr[i])) {
                                return false;
                            }
                        }
                        return true;
                    },
                    "alertText": "无效的 IP 地址,多个请用,分隔"
                },
                "url": {
                    "regex": /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    "alertText": "请输入合法的URL"
                },
                "url2": {
                    "regex": /^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                    "alertText": "请输入合法的URL"
                },
                "onlyNumberSp": {
                    "regex": /^[0-9]+$/,
                    "alertText": "只能输入数字"
                },
                "onlyNumberGroup": {
                    "regex": /^\d+([,]\d+)*$/,
                    "alertText": "只能输入数字,多个以逗号分割"
                },
                "chinese": {
                    "regex": /^[\u4e00-\u9fa5]+$/,
                    "alertText": "只能输入中文"
                },
                "letter": {
                    "regex": /^[a-zA-Z]+$/,
                    "alertText": "只能输入英文字母"
                },
                "zip": {
                    "regex": /^[0-9]\d{5}$/,
                    "alertText": "请输入合法的邮政编码"
                },
                "onlyLetterSp": {
                    "regex": /^[a-zA-Z\ \']+$/,
                    "alertText": "只能输入英文字母"
                },
                "onlyLetterNumber": {
                    "regex": /^[0-9a-zA-Z]+$/,
                    "alertText": "只能输入英文和数字"
                },
                "onlyLetterNumberPoint": {
                    "regex": /^[0-9a-zA-Z.]+$/,
                    "alertText": "只能输入英文数字和 . (英文点)"
                },
                "onlyLetterNumberUnderline": {
                    "regex": /^[0-9a-zA-Z-]+$/,
                    "alertText": "只能输入英文数字和破折号"
                },
                "checkGjCjrxm": {
                    "regex": /^[A-Z|0-9|\(|\)|\s]+\/[A-Z|0-9|\(|\)|\s]+$/,
                    "alertText": "请输入合法的乘机人格式，如：XX/XX"
                },
                "checkYhzh": {
                    "regex": /^[\-\+]?\d+$/,
                    "alertText": "银行账号只能是数字"
                },
                // --- CUSTOM RULES -- Those are specific to the demos, they can be removed or changed to your likings
                "ajaxUserCall": {
                    "url": "ajaxValidateFieldUser",
                    // you may want to pass extra data on the ajax call
                    "extraData": "name=eric",
                    "alertText": "此名称已被其他人使用",
                    "alertTextLoad": "正在确认名称是否有其他人使用，请稍等。"
                },
                "ajaxUserCallPhp": {
                    "url": "phpajax/ajaxValidateFieldUser.php",
                    // you may want to pass extra data on the ajax call
                    "extraData": "name=eric",
                    // if you provide an "alertTextOk", it will show as a green prompt when the field validates
                    "alertTextOk": "此帐号名称可以使用",
                    "alertText": "此名称已被其他人使用",
                    "alertTextLoad": "正在确认帐号名称是否有其他人使用，请稍等。"
                },
                "ajaxSpdhValidate": {
                    "url": "/webcomponent/b2g/kjcommb2g/getTravelNum?notitle=1",
                    "extraData": "hyid,clkid,sqdh,cplx",
                    "extraDataDynamic": ['#widget_validate_hyid','#widget_validate_clkid','#widget_spdh','#widget_validate_cplx'],
                    "alertText": "此审批单号验证不合格,请重新输入"
                },
                "ajaxNameCall": {
                    // remote json service location
                    "url": "ajaxValidateFieldName",
                    // error
                    "alertText": "此名称可以使用",
                    // if you provide an "alertTextOk", it will show as a green prompt when the field validates
                    "alertTextOk": "此名称已被其他人使用",
                    // speaks by itself
                    "alertTextLoad": "正在确认名称是否有其他人使用，请稍等。"
                },
                "ajaxNameCallPhp": {
                    // remote json service location
                    "url": "phpajax/ajaxValidateFieldName.php",
                    // error
                    "alertText": "此名称已被其他人使用",
                    // speaks by itself
                    "alertTextLoad": "正在确认名称是否有其他人使用，请稍等。"
                },
                "validate2fields": {
                    "alertText": "请输入 HELLO"
                },
                //tls warning:homegrown not fielded
                "dateFormat": {
                    "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|1\d|2[0-8]))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^(0?2(\/|-)29)(\/|-)(?:(?:0[48]00|[13579][26]00|[2468][048]00)|(?:\d\d)?(?:0[48]|[2468][048]|[13579][26]))$/,
                    "alertText": "无效的日期格式"
                },
                //tls warning:homegrown not fielded 
                "dateTimeFormat": {
                    "regex": /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1}$|^(?:(?:(?:0?[13578]|1[02])(\/|-)31)|(?:(?:0?[1,3-9]|1[0-2])(\/|-)(?:29|30)))(\/|-)(?:[1-9]\d\d\d|\d[1-9]\d\d|\d\d[1-9]\d|\d\d\d[1-9])$|^((1[012]|0?[1-9]){1}\/(0?[1-9]|[12][0-9]|3[01]){1}\/\d{2,4}\s+(1[012]|0?[1-9]){1}:(0?[1-5]|[0-6][0-9]){1}:(0?[0-6]|[0-6][0-9]){1}\s+(am|pm|AM|PM){1})$/,
                    "alertText": "无效的日期或时间格式",
                    "alertText2": "可接受的格式： ",
                    "alertText3": "mm/dd/yyyy hh:mm:ss AM|PM 或 ",
                    "alertText4": "yyyy-mm-dd hh:mm:ss AM|PM"
                },
                //身份证校验 custom[checkCard]
                "checkCard": {
                    "func": function (field, rules, i, options) {
                        return $.checkCard(field.val());
                    },
                    "alertText": "您输入的身份证号码不正确，请重新输入"
                },
                "ajaxShbhCall": {
                    "url": "/airsa/shb!checkZh.shtml",
                    "alertText": "该商户编号已使用，请重新输入"
                },
                "ajaxCheckHd": {
                    "url": "/airsb/cgsgl!checkHd.shtml",
                    "extraData": "bx_dzhd.ksno=,bx_dzhd.jsno=,bx_dzhd.bxxz=,bx_dzhd.dzqz=",
                    "extraDataDynamic": ['#ksno', '#jsno', '#bxxz', '#dzqz'],
                    "alertText": "该号段已被使用，请重新输入"
                },
                "ajaxCheckUserBh": {
                    "url": "/airsa/ve_user!checkBh.shtml",
                    "alertText": "该用户编号已使用，请重新输入"
                },
                "ajaxCheckYhBhB": {
                    "url": "/airsb/sh_yhb!checkYhbh.shtml",
                    "alertText": "该用户编号已使用，请重新输入"
                },
                //检查唯一性 ajax[ajaxCheckVeYhbBh]
                "ajaxCheckVeYhbBh": {
                    "url": "/asms/organization/ve_yhb/checkVeYhbBh",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该用户编号已使用，请重新输入"
                },
                "ajaxCheckMemberHyzcm": {
                    "url": "/asms/member/t_member/checkMember",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该会员注册名已使用，请重新输入"
                },
                "ajaxCheckMemberHykh": {
                    "url": "/asms/member/t_member/checkMember",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该会员卡号已使用，请重新输入"
                },
                "ajaxCheckYwlxmc": {
                    "url": "/asms/sysconfig/jcsj/ys_ywlx/ajaxCheckYwlxmc",
                    "extraData": "ys_ywlx.ywlx=,ys_ywlx.bh=",
                    "extraDataDynamic": ['#ywlx', '#bh'],
                    "alertText": "该业务名称已使用，请重新输入"
                },
                "ajaxCheckSvalue": {
                    "url": "/asms/member/grade/ajaxCheckHydj",
                    "extraData": "b_jcsjb.svalue=",
                    "extraDataDynamic": ['#svalue'],
                    "alertText": "该规则名称已使用，请重新输入"
                },
                //政策发布航班号格式校验 custom[checkZcHbh]
                "checkZcHbh": {
                    "func": function (field, rules, i, options) {
                        return hbhValidate($(field)[0]);
                    },
                    "alertText": "航班号格式错误!航班号支持四种<br>格式：---、MU2301/2302、MU2310、MU2310-2314"
                },
                "checkBsyrq": {
                    "func": function (field, rules, i, options) {
                        return bsyrqValidate($(field)[0]);
                    },
                    "alertText": "不适用日期格式错误!支持区间段【用“|”分割】和多个日期【用“/”分割】格式<br>例如：2016-02-04|2016-02-10 或 2016-02-04|2016-02-10/2016-02-12 或 2016-01-08/2016-01-09三种格式"
                },
                "pnrNo": {
                    "regex": /^(\w|\d){6}$/,
                    "alertText":"PNR格式错误"
                },
                "tkno": {
                    "regex": /^[0-9]{3}\-[0-9]{10}$/,
                    "alertText":"票号格式不正确"
                },
                //航空公司二字代号
                "ajaxEzdhCall": {
                    "url": "/airsa/b_airway!checkez.shtml",
                    "extraData": "ezdh=",
                    "extraDataDynamic": ['#ezdh'],
                    "alertText": "该二字代号已使用，请重新输入"
                },
                //舱位编号
                "ajaxCwbhCall": {
                    "url": "/airsa/b_airway_cw!check.shtml",
                    "extraData": "cwdj=,ezdh=,yxq=",
                    "extraDataDynamic": ['#cwdj', '#ezdh', '#yxq'],
                    "alertText": "该舱位编号已使用，请重新输入"
                },
                //飞机机型
                "ajaxFjjxCall": {
                    "url": "/airsa/b_comm_plane!check.shtml",
                    "extraData": "fjjx=",
                    "extraDataDynamic": ['#fjjx'],
                    "alertText": "该飞机机型已使用，请重新输入"
                },
                //票价比例 生效时间    航空公司
                "ajaxSxrqCall": {
                    "url": "/airsa/rep_pjgz!checknHkgs.shtml",
                    "extraData": "hkgs=,sxrq=",
                    "extraDataDynamic": ['#hkgs', '#sxrq'],
                    "alertText": "此航空公司在此生效日期已设置过票价比例,不能重复设置"
                },
                //燃油分段 生效时间    航空公司
                "ajaxHkgsCall": {
                    "url": "/airsa/rep_rysz!checkHkgs.shtml",
                    "extraData": "hkgs=,sxrq=",
                    "extraDataDynamic": ['#hkgs', '#sxrq'],
                    "alertText": "此航空公司在该日期已存在燃油设置,不能重复设置"
                },
                //特殊航线 航空公司    航程   舱位编号
                "ajaxTshxCall": {
                    "url": "/airsa/b_airway_cw_hc!check.shtml",
                    "alertText": "航空公司、舱位及航程不能重复录入"
                },
                //航班资料 航班
                "ajaxHbCall": {
                    "url": "/airsa/b_comm_hb!check.shtml",
                    "alertText": "航班已存在，不能重复！"
                },
                //城市机场资料管理  三字代码
                "ajaxSzdmCall": {
                    "url": "/airsa/b_city_old!checknbbh.shtml",
                    "extraDataDynamic": ['#bh'],
                    "alertText": "记录已经存在，请重新录入！"
                },
                //城市机场资料管理  三字代码同意词
                "ajaxSzdmtycCall": {
                    "url": "/airsa/b_city_old!checktyc.shtml",
                    "extraDataDynamic": ['#bh'],
                    "alertText": "记录已经存在，请重新录入！"
                },
                //城市机场资料管理  地理编号
                "ajaxDlbhcCall": {
                    "url": "/airsa/b_city_old!checkdldh.shtml",
                    "extraDataDynamic": ['#bh'],
                    "alertText": "记录已经存在，请重新录入！"
                },
                //航程票价管理  航空公司 出发城市 到达城市 有效期
                "ajaxHkpjCall": {
                    "url": "/airsa/b_air_price!check.shtml",
                    "alertText": "记录已经存在，请重新录入！"
                },
                //参数设置 参数编号
                "ajaxCsbhCall": {
                    "url": "/airsa/ve_csb!checkbh.shtml",
                    "alertText": "参数编号已经存在，请重新录入！"
                },
                //供应合同编号
                "ajaxHtbhCall": {
                    "url": "/airsa/sh_gyht!checkHtbh.shtml",
                    "alertText": "该合同编号已使用，请重新输入"
                },
                //公司编号
                "ajaxCompbhCall": {
                    "url": "/airsa/ve_zzjgqx!checkCompBh.shtml",
                    "alertText": "该公司编号已使用，请重新输入"
                },
                //独占的广告，同一时间段不能发两个
                "ajaxDzggxx": {
                    "url": "/airsa/cxzx/ggw_ggxx!getDzggList.shtml",
                    "extraData": "cx_ggw_cp.syrqs=,cx_ggw_cp.syrqz=,cx_ggw_cp.dzsjs=,cx_ggw_cp.dzsjz=,cx_ggw_cp.ggwwz=,cx_ggw_cp.id=",
                    "extraDataDynamic": ['#syrqs', '#syrqz', '#qfsjs', '#qfsjz', '#ggwwz', '#cx_ggw_cpid'],
                    "alertText": "独占的广告，同一时间段不能发两个!"
                },

                "compareNumber": {
                    "regex": "none",
                    "alertText": "后面的值必须大于或等于前面的值"
                },
                "compareTime": {
                    "regex": "none",
                    "alertText": "后面的时间必须晚于前面的时间"
                },
                "timeFormat": {
                    "regex": /^(?:[01]\d|2[0-3])(?::[0-5]\d)$/,
                    "alertText": "时间格式错误，时间格式为：HH:mm"
                },
                "dotformat": {
                    "regex": "none",
                    "alertText": "小数格式为："
                },
                //IBE接口名称
                "ajaxIbeJkmcCall": {
                    "url": "/airsa/resource/zgl!checkeIbemc.shtml",
                    "extraData": "ibe_jkgl.ibemc=,ibe_jkgl.id",
                    "extraDataDynamic": ['#ibemc', '#id'],
                    "alertText": "该接口名称已使用，请重新输入"
                },
                //OFFICE号
                "checkOffice": {
                    "regex": /^[A-Z]{3}\d{3}$/,
                    "alertText": "OFFICE号格式不对，例： WUH123"
                },
                //城市代码
                "checkCsdm": {
                    "regex": /^[A-Z]{3}$/,
                    "alertText": "城市代码格式不对，例： WUH"
                },
                //发送时间段
                "checkFssjd": {
                    "regex": /^\d{2}:\d{2}-\d{2}:\d{2}([,]\d{2}:\d{2}-\d{2}:\d{2})*$/,
                    "alertText": "时间格式:HH:mm-HH:mm,多时间段还用 , 分隔"
                },
                //密码限制
                "checkMm": {
                    "regex": /^[a-zA-Z0-9_-]{6,18}$/,
                    "alertText": "密码格式不对，密码由6-18位的数字、字母、_和-组成"
                },
                //端口号限制
                "checkPort": {
                    "regex": /^\d{1,10}$/,
                    "alertText": "端口格式不对，端口由1-10长度的数字组成"
                },
                "validate-alpha-chinese": {
                    "regex": /^[\u4e00-\u9fa5a-zA-Z\/*\s*\·\.]+$/,
                    "alertText": "请输入英文字母或中文"
                },
                "validate-both-phone": {
                    "regex": /(^0?[1][0-9]{10}$)|(^((0[1-9]{3})?(0[12][0-9])?)?\d{7,10}$)/,
                    "alertText": "请输入正确的手机号码或电话号码,电话号码如需加区号，格式如：01029392929"
                },
                "4numbers": {
                    "regex": /\d{4}/,
                    "alertText": "请输入4位数字"
                },
                "gzbh": {
                    "regex": /(^\d{1,3}-{1}\d{1,3}-{1}\d{1,3}$)|(^\d{1,3}-{1}\d{1,3}-{1}\d{1,3}-{1}\d{1,3}-{1}\d{1,3}$)|(^0$)/,
                    "alertText": "格式不正确，请输入正确的规则编号"
                },
                "checkInput": {
                    "regex": /^[^<>`~!/@\#}$%:; _^{&*=|'+-]+$/,
                    "alertText": "含有非法字符，请正确输入"
                },
                "checkInputToNumber": {
                    "regex": /^\+?[1-9][0-9]*$/,
                    "alertText": "请输入正整数"
                },
                "checkInputNumeric": {
                    "regex": /^\+?\d+(\.\d+)?$/,
                    "alertText": "请输入正数"
                },
                "checkInputMobleNumber": {
                    "regex": /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
                    "alertText": "请输入正确格式的手机号码"
                },
                "hh:mm": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == "") return true;
                        var reg = /^(\d{2})\:(\d{2})$/;
                        var exp = new RegExp(reg);
                        if (exp.test(_val)) {
                            var $1 = _val.substr(0, 2);
                            var $2 = _val.substr(3, 2);
                            return ($1 < 24 && $2 < 60) ? true : false;
                        }
                    },
                    "alertText": "时间格式错误，时间格式为：HH:mm"
                },
                "hh:mm:ss": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == "") return true;
                        var reg = /^(\d{2})\:(\d{2})\:(\d{2})$/;
                        var exp = new RegExp(reg);
                        if (exp.test(_val)) {
                            var $1 = _val.substr(0, 2);
                            var $2 = _val.substr(3, 2);
                            var $3 = _val.substr(6, 2);
                            return ($1 < 24 && $2 < 60 && $3 < 60) ? true : false;
                        }
                    },
                    "alertText": "时间格式错误，时间格式为：HH:mm:ss"
                },
                "hhmm": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == "") return true;
                        var reg = /^(\d{2})(\d{2})$/;
                        var exp = new RegExp(reg);
                        if (exp.test(_val)) {
                            var $1 = _val.substr(0, 2);
                            var $2 = _val.substr(2, 2);
                            return ($1 < 24 && $2 < 60) ? true : false;
                        }
                    },
                    "alertText": "时间格式错误，时间格式为：HHmm"
                },
                "hhmmss": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == "") return true;
                        var reg = /^(\d{2})(\d{2})(\d{2})$/;
                        var exp = new RegExp(reg);
                        if (exp.test(_val)) {
                            var $1 = _val.substr(0, 2);
                            var $2 = _val.substr(2, 2);
                            var $3 = _val.substr(4, 2);
                            return ($1 < 24 && $2 < 60 && $3 < 60) ? true : false;
                        }
                    },
                    "alertText": "时间格式错误，时间格式为：HHmmss"
                },
                "hhmm-hhmm": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == "") return true;
                        var reg = /^(\d{2})(\d{2})-(\d{2})(\d{2})$/;
                        var exp = new RegExp(reg);
                        if (exp.test(_val)) {
                            var $1 = _val.substr(0, 2);
                            var $2 = _val.substr(2, 2);
                            var $3 = _val.substr(5, 2);
                            var $4 = _val.substr(7, 2);
                            return ($1 < 24 && $2 < 60 && $3 < 24 && $4 < 60 && ($1 + $2) <= ($3 + $4)) ? true : false;
                        }
                    },
                    "alertText": "时间格式错误，时间格式为：HHmm-HHmm"
                },
                "mult-mobile": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        var phArr = _val.split('/');
                        var regx = /(^0?[1][0-9]{10}$)/;
                        for (var f = 0; f < phArr.length; f++) {
                            if (!regx.test(phArr[f])) {
                                return false;
                            }
                        }
                        return true;
                    },
                    "alertText": "请输入正确的手机号码，多个用'/'分隔"
                },
                "mult-mobilePhone": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        var phArr = _val.split(',');
                        var regx = /(^0?[1][0-9]{10}$)/;
                        for (var f = 0; f < phArr.length; f++) {
                            if (!regx.test(phArr[f])) {
                                return false;
                            }
                        }
                        return true;
                    },
                    "alertText": "请输入正确的手机号码，多个用','分隔"
                },
                "mult-mobilePhone-xh": {////支持星号的电话号码
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        //这里和CTO确认过，星号验证，统一返回true
                        /*var phArr = _val.split(',');
                         var regx = /(^0?[1][0-9 \*]{10}$)/;
                         for (var f = 0; f < phArr.length; f++) {
                         if (!regx.test(phArr[f])) {
                         return false;
                         }
                         }*/
                        return true;
                    },
                    "alertText": "请输入正确的手机号码，多个用','分隔"
                },
                "mult-email": {
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        var phArr = _val.split('/');
                        var regx = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
                        for (var f = 0; f < phArr.length; f++) {
                            if (!regx.test(phArr[f])) {
                                return false;
                            }
                        }
                        return true;
                    },
                    "alertText": "请输入正确的邮件，多个用'/'分隔"
                },
                "ajaxCheckVeDpet": {
                    "url": "/asms/b2b/sysconfig/fxsz/fxsz_ve_dept/checkVeDpet",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该分销商信息已使用，请重新输入"
                },
                "ajaxCheckVeCompBh": {
                    "url": "/asms/organization/ve_comp/checkVeCompBh",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该单位代号已使用，请重新输入"
                },
                "ajaxCheckUpdateKmmc": { //支付科目名称验证
                    "url": "/asms/sysconfig/fskm/b_zfkmsz/ajaxCheckUpdateKmmc",
                    "extraData": "b_zfkmsz.kmmc=,b_zfkmsz.id=,b_zfkmsz.compid=",
                    "extraDataDynamic": ['#kmmc', '#id', '#compid'],
                    "alertText": "该支付科目名称已使用，请重新输入"
                },
                "ajaxCheckHydj": { //会员等级验证
                    "url": "/asms/member/grade/ajaxCheckHydj",
                    "extraData": "b_jcsjb.svalue=,b_jcsjb.id=,b_jcsjb.compid=,b_jcsjb.hylx=",
                    "extraDataDynamic": ['#svalue', '#id', '#compid', '#hylx'],
                    "alertText": "该等级名称已使用，请重新输入"
                },
                "ajaxCheckJcsjbBymc": { //检查基础数据名称唯一
                    "url": "/asms/sysconfig/jcsj/b_jcsjb_cj/ajaxCheckJcsjbBymc",
                    "extraData": "b_jcsjb_cj.mc=,b_jcsjb_cj.id=,b_jcsjb_cj.zgs=,b_jcsjb_cj.lb=",
                    "extraDataDynamic": ['#mc', '#id', '#zgs', '#lb'],
                    "alertText": "该名称已使用，请重新输入"
                },
                //密码限制,必须包含数字和字母
                "checkMm2": {
                    "regex": /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/,
                    "alertText": "密码长度6-18位，且必须是数字和字母组合"
                },
                "ajaxCheckVeDeptBh": {
                    "url": "/asms/organization/ve_dept/checkVeDeptBh",
                    "extraData": "dt=" + (new Date()).getTime(),
                    "alertText": "该部门编号已使用，请重新输入"
                },
                "mult-phone": {  //added 47
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        var phArr = _val.split(',');
                        var regx = /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/;
                        for (var f = 0; f < phArr.length; f++) {
                            if (!regx.test(phArr[f])) {
                                return false;
                            }
                        }
                        return true;
                    },
                    "alertText": "请输入正确的电话号码，多个用','分隔"
                },
                "mult-phone-xh": {  //支持星号的手机号码验证
                    "func": function (field, rules, i, options) {
                        var _val = field.val();
                        if (_val == '' || _val == null) {
                            return true;
                        }
                        //和CTO确认过，星号验证，统一返回true
                        /*var phArr = _val.split(',');
                         var regx = /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/\*]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/;
                         for (var f = 0; f < phArr.length; f++) {
                         if (!regx.test(phArr[f])) {
                         return false;
                         }
                         }*/
                        return true;
                    },
                    "alertText": "请输入正确的电话号码，多个用','分隔"
                },
                "onlyLetterNumberAt": {
                    "regex": /^[0-9a-zA-Z@]+$/,
                    "alertText": "只能输入英文数字和@"
                },
                "ffzs":{
                    "regex": /(^[1-9]+\d*$)|(^0$)/,
                    "alertText":"只能输入非负整数"
                },
                "captcha":{
                    "regex":/^[A-Za-z0-9]{4}$/,
                    "alertText":"验证码格式错误"
                }

            }
        }
    };
    $.validationEngineLanguage.newLang();
    function hbhValidate(obj){
        var obj=$(obj);
        var _hbh = obj.val();
        obj.val(obj.val().toUpperCase());
        _hbh = _hbh.toUpperCase();
        if(_hbh=="---"){
            return true;
        }
        if($.trim(_hbh)==""){
            return true;
        }
        if(_hbh.indexOf("/") > -1){//MU2301/2302 MU2301/MU2302
            var hbhs = _hbh.split("/");
            return hbhsValid(hbhs,obj);
        }else if(_hbh.indexOf("-") > -1){//MU2310-2314
            var hbhs = _hbh.split("-");
            if(hbhs.length != 2){
                flag = false;
                obj.focus();
                return false;
            }
            return hbhsValid(hbhs,obj);
        }else{//MU2301
            if(!hbhValid(_hbh)){
                obj.focus();
                return false;
            }
        }
        return true;
    }
    //单独验证一个完整航班(辅助)
    function hbhValid(hbh){
        hbh=hbh+"/";
        return (hbh.replace(/[A-Za-z|0-9]{2}\w{3,5}\//g, "").length == 0);
    }
    //航班号分割之后的数组进行验证(辅助)
    function hbhsValid(hbhs,obj){
        var flag = true;
        for(var i=0;i<hbhs.length;i++){
            if(i == 0){
                if(!(hbhs[i].length > 4 && hbhs[i].length <= 6)){
                    flag = false;
                    obj.focus();
                }else{
                    var temp = hbhs[i].replace(/[A-Za-z|0-9]{2}\w{3,5}/, "");
                    if(temp.length != 0){
                        flag = false;
                        obj.focus();
                    }
                }
            }else{
                if(!(hbhs[i].length >= 3 && hbhs[i].length <= 6)){
                    flag = false;
                    obj.focus();
                }else{
                    var temp = hbhs[i].replace(/([A-Za-z|0-9]{2}){0,1}\w{3,5}/, "");
                    if(temp.length != 0){
                        flag = false;
                        obj.focus();
                    }
                }
            }
            if(!flag) break;
        }
        return flag;

    }
    //不适用日期格式验证
    function bsyrqValidate(obj){

        var _value = $(obj).val();

        if(_value == "") return true;

        if(_value.indexOf("|") == -1){
            if(_value.indexOf("/") == -1){
                return _dateValid(_value);
            }else{
                var _arr = _value.split("/");
                for(var i=0;i<_arr.length;i++){
                    if(!_dateValidXg(_arr[i])){
                        return false;
                    }
                }
            }
        }else{
            var _arr = _value.split("|");

            if(_value.indexOf("/") == -1){
                if(!_dateValidHg(_value)){
                    return false;
                }
            }else{

                var _arrT = _value.split("/");
                for(var i=0;i<_arrT.length;i++){
                    if(_arrT[i].indexOf("|") == -1){
                        if(!_dateValidXg(_arrT[i])){
                            return false;
                        }
                    }else{
                        if(!_dateValidHg(_arrT[i])){
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    //单独的斜杠[/]格式验证
    function _dateValidXg(_value){
        if(_value == "") return true;

        if(_value != "" && !_dateValid(_value)){
            return false;
        }
        return true;
    }

    //单独的竖杠[|]格式验证
    function _dateValidHg(_value){

        if(_value == "") return true;

        var _arr = _value.split("|");

        if(_arr.length != 2) return false;

        var begin = _arr[0];
        var end   = _arr[1];

        if(begin != "" && !_dateValid(begin)){//单个日期格式验证
            return false;
        }

        if(end != "" && !_dateValid(end)){//单个日期格式验证
            return false;
        }

        //比较大小
        return $.dateDiff(begin,end) > 0;
    }
    //单个日期格式验证
    function _dateValid(_value){
        var reg = /^\d{4}[\/\-](0[1-9]|1[012])[\/\-](0[1-9]|[12][0-9]|3[01])$/;
        return (_value.replace(reg, "").length == 0);
    }
})(jQuery);
