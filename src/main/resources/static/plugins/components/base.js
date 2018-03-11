/**
 * @作者:tengri
 * @联系方式:1130139617@qq.com
 * @博客:"http://www.cnblogs.com/tengri/"
 * @描述:基础公共控件封装(二次封装的代码都统一放在这个文件里面)
 * @linc: MIT
 */
define(function (require, exports, module) {

    var Mcommon=require("/static/plugins/components/fl/common.js"),
        Mhotel=require("/static/plugins/components/fl/hotel.js"),
        Mticket=require("/static/plugins/components/fl/ticket.js"),
        Mtrain=require("/static/plugins/components/fl/train.js"),
        Mtravel=require("/static/plugins/components/fl/travel.js"),
        Myc=require("/static/plugins/components/fl/yc.js");

    //对外抛出接口
    exports.initProvinceAndCity = Mcommon.initProvinceAndCity;

    exports.initVecity =Mcommon.initVecity;

    exports.initPopup = Mcommon.initPopup;

    exports.initProvinceMult = Mcommon.initProvinceMult;

    exports.initPOI = Mcommon.initPOI;

    exports.initJdrmsq = Mhotel.initJdrmsq;

    exports.initHbhss = Mticket.initHbhss;

    exports.initTrackStaff = Mcommon.initTrackStaff;

    exports.initBusinessScope = Mcommon.initBusinessScope;

    exports.initSupplyProducts = Mcommon.initSupplyProducts;

    exports.initHeadquarters = Mcommon.initHeadquarters;

    exports.initFileUpload = Mcommon.initFileUpload;

    exports.initTravelCountry = Mtravel.initTravelCountry;

    exports.initCityAndXzq = Mcommon.initCityAndXzq;

    exports.initShdj = Mcommon.initShdj;

    exports.initShzList = Myc.initShzList;

    exports.initHotStation = Mtrain.initHotStation;

    exports.initJcHzl = Mticket.initJcHzl;

    exports.initYgs4Train = Mtrain.initYgs4Train;

    exports.initProCityVisa = Mcommon.initProCityVisa;

    exports.initTrainStation = Mtrain.initTrainStation;

    exports.initJfShGroup = Myc.initJfShGroup;

    exports.initFlightNum = Mticket.initFlightNum;

    exports.initHsDanxuan = Mticket.initHsDanxuan;

    exports.initRouteTheme = Mtravel.initRouteTheme;

    exports.initSelectPeople = Mhotel.initSelectPeople;

    exports.initBx = Mcommon.initBx;

    exports.initJdpp =  Mhotel.initJdpp;

    exports.initGjz = Mtravel.initGjz;

    exports.initHsMult = Mticket.initHsMult;

    exports.initDept = Mcommon.initDept;

    exports.initUser = Mcommon.initUser;

    exports.initGjCabin = Mticket.initGjCabin;

    exports.initGroup = Mcommon.initGroup;

    exports.initInputNumber = Mcommon.initInputNumber;

    exports.initGnCabin = Mticket.initGnCabin;

    exports.initProvince = Mcommon.initProvince;

    exports.initMultSelectAndSearch = Mticket.initMultSelectAndSearch;

    exports.initCityMult = Mcommon.initCityMult;

    exports.initGjHsMult = Mticket.initGjHsMult;

    exports.initJcHzlMult = Mticket.initJcHzlMult;

    exports.initHotelGjCity = Mhotel.initHotelGjCity;

    exports.initVetechSlider = Mcommon.initVetechSlider;

    exports.initTravelCfdCity = Mtravel.initTravelCfdCity;

    exports.initTravelMddCity = Mtravel.initTravelMddCity;

    exports.initAddTpAndGq = Mticket.initAddTpAndGq;

    exports.initScenicAreaName = Mtravel.initScenicAreaName;

    exports.initScenicTheme= Mtravel.initScenicTheme;

    exports.initGjAndGnCity= Mticket.initGjAndGnCity;


    exports.initNationality= Mcommon.initNationality;

    exports.initSign = Mticket.initSign;

    exports.initCurrency = Mticket.initCurrency;

    exports.initPoiType = Mcommon.initPoiType;

    exports.showShInfo = Mcommon.showShInfo;

    exports.initGnCabinRadio = Mticket.initGnCabinRadio;

    exports.initCityMult2 = Mticket.initCityMult2;

});
