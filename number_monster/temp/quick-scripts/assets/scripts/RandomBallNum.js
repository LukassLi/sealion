(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/RandomBallNum.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '1f172EpRxRE1aGk60OtkTjJ', 'RandomBallNum', __filename);
// scripts/RandomBallNum.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//随机生成球(用平滑的加权轮询均匀取球,然后每取10个球随机打乱)
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var RandomBallNum = /** @class */ (function (_super) {
    __extends(RandomBallNum, _super);
    function RandomBallNum() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 球出现的概率 */
        _this.oddsArr = [];
        /** 选球前数组 */
        _this.beforSlectArr = Array();
        /** 保存均匀打乱以后的球,当为空时重新取10个 */
        _this.ballNumArr = [];
        /** 球的总权重(正常为100,但为防止配置出错,算一次) */
        _this.total = 0;
        return _this;
    }
    /**
    * 更新球的生成概率
    * @param oddsStr 概率字符串
    */
    RandomBallNum.prototype.updateOddsMap = function (oddsStr) {
        //概率改变重新取球
        this.ballNumArr = [];
        this.total = 0;
        this.oddsArr = [];
        var arr = oddsStr.split(',');
        for (var i = 0; i < arr.length; i++) {
            var str = arr[i].replace('%', '');
            var strArr = str.split(":");
            var value = Number(strArr[1]);
            var key = Number(strArr[0]) - 1;
            this.oddsArr[key] = value;
            this.total += value;
        }
        this.beforSlectArr = this.oddsArr.slice(0);
    };
    /**
     * 获取随机生成的球
     */
    RandomBallNum.prototype.getBallNum = function () {
        if (this.ballNumArr.length == 0)
            this.initBallNumArr();
        return this.ballNumArr.pop();
    };
    /**
     * 球列表为空时,初始球
     */
    RandomBallNum.prototype.initBallNumArr = function () {
        for (var i = 0; i < 10; i++) {
            var index = this.getMaxIndex(this.beforSlectArr);
            var current = this.beforSlectArr.slice(0);
            current[index] = current[index] - this.total;
            this.beforSlectArr = this.arrAdd(current, this.oddsArr);
            //取的是从0开始,球是从1开始
            this.ballNumArr.push(index + 1);
        }
        //打乱顺序
        this.ballNumArr = this.shuffle(this.ballNumArr);
    };
    RandomBallNum.prototype.shuffle = function (arr) {
        var newArr = arr.slice(0);
        var length = newArr.length;
        for (var i = 0; i < length; i++) {
            var randIdx = Math.floor(Math.random() * length);
            //当前元素与随机一个位置元素交换位置
            var temp = newArr[i];
            newArr[i] = newArr[randIdx];
            newArr[randIdx] = temp;
        }
        return newArr;
    };
    /**
     * 获取数组中数字最大的序号
     * @param arr 数组
     */
    RandomBallNum.prototype.getMaxIndex = function (arr) {
        var n = 0;
        var max = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                n = i;
                max = arr[i];
            }
        }
        return n;
    };
    /**
     * 两个数组每一项的值相加
     * @param arrA
     * @param arrB
     */
    RandomBallNum.prototype.arrAdd = function (arrA, arrB) {
        var arr = [];
        for (var i = 0; i < arrA.length; i++) {
            arr[i] = arrA[i] + arrB[i];
        }
        return arr;
    };
    RandomBallNum = __decorate([
        ccclass
    ], RandomBallNum);
    return RandomBallNum;
}(cc.Component));
exports.default = RandomBallNum;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=RandomBallNum.js.map
        