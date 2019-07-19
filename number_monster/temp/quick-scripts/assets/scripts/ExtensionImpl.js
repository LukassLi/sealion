(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/ExtensionImpl.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '15a75p7/GNPOLCPf68vmvHF', 'ExtensionImpl', __filename);
// scripts/ExtensionImpl.ts

// Copyright (C) 2018, Flickering Inc. All rights reserved.
// Author: Wende Luo (wendeluo@flickering.ai)
//
// 对原生的ts类拓展一些函数
// 这个是实现文件，就是拓展函数的具体实现代码
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 随机一个范围内的数字（整数），范围的左边是闭区间，右边是开区间
 */
function random(min, max) {
    var d = Math.floor(max) - Math.floor(min);
    return min + Math.floor(Math.random() * d);
}
/**
 * 激活拓展方法
 */
function initExtensions() {
    Array.prototype.pushRange = function (items) {
        if (!items || items.length == 0) {
            return;
        }
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var x = items_1[_i];
            this.push(x);
        }
    };
    Array.prototype.random = function () {
        var randIdx = Math.floor(Math.random() * this.length);
        return this[randIdx];
    };
    Array.prototype.contains = function (param) {
        if (typeof param !== 'function') {
            return this.indexOf(param) >= 0;
        }
        return !!this.first(param);
    };
    Array.prototype.remove = function (param) {
        var _this = this;
        var removeItem = function (item) {
            var index = _this.indexOf(item);
            if (index >= 0) {
                _this.splice(index, 1);
            }
        };
        var removeLambda = function (lambda) {
            for (var i = 0; i < _this.length; i++) {
                if (lambda(_this[i])) {
                    _this.splice(i, 1);
                    i--;
                }
            }
        };
        typeof param === 'function' ? removeLambda(param) : removeItem(param);
    };
    Array.prototype.removed = function (param) {
        var copy = this.clone();
        copy.remove(param);
        return copy;
    };
    Array.prototype.clear = function () {
        this.length = 0;
    };
    Array.prototype.first = function () {
        if (arguments.length == 0 && this.length > 0) {
            return this[0];
        }
        var lambda = arguments[0];
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var x = _a[_i];
            if (lambda(x)) {
                return x;
            }
        }
        return undefined;
    };
    Array.prototype.last = function () {
        if (arguments.length == 0 && this.length > 0) {
            return this[this.length - 1];
        }
        var lambda = arguments[0];
        for (var i = this.length - 1; i >= 0; i--) {
            if (lambda(this[i])) {
                return this[i];
            }
        }
        return undefined;
    };
    Array.prototype.max = function () {
        if (this.length == 0)
            return undefined;
        var lambda = arguments.length > 0 ? arguments[0] : function (item) { return item; };
        var maxItem = this[0];
        var maxVal = lambda(maxItem);
        for (var i = 1; i < this.length; i++) {
            var currItem = this[i];
            var currVal = lambda(currItem);
            if (currVal > maxVal) {
                maxVal = currVal;
                maxItem = currItem;
            }
        }
        return maxItem;
    };
    Array.prototype.min = function () {
        if (this.length == 0)
            return undefined;
        var lambda = arguments.length > 0 ? arguments[0] : function (item) { return item; };
        var minItem = this[0];
        var minVal = lambda(minItem);
        for (var i = 1; i < this.length; i++) {
            var currItem = this[i];
            var currVal = lambda(currItem);
            if (currVal < minVal) {
                minVal = currVal;
                minItem = currItem;
            }
        }
        return minItem;
    };
    Array.prototype.sum = function () {
        if (this.length == 0)
            return 0;
        var lambda = arguments.length > 0 ? arguments[0] : function (item) { return item; };
        var sum = 0;
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var item = _a[_i];
            var val = lambda(item);
            if (typeof val !== 'number') {
                throw new Error('Array.sum 中，lambda 选择的字段不是 number 类型，无法求和');
            }
            sum += val;
        }
        return sum;
    };
    Array.prototype.select = function (lambda) {
        return this.map(lambda);
    };
    Array.prototype.where = function (lambda) {
        return this.filter(lambda);
    };
    Array.prototype.count = function (lambda) {
        return this.where(lambda).length;
    };
    Array.prototype.toDictionary = function (lambda) {
        var obj = {};
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var x = _a[_i];
            obj[lambda(x)] = x;
        }
        return obj;
    };
    Array.prototype.clone = function () {
        return this.slice(0);
    };
    Array.prototype.shuffle = function () {
        // 当前元素与随机一个位置元素交换位置
        for (var i = 0; i < this.length; i++) {
            var randIdx = random(0, this.length);
            var temp = this[i];
            this[i] = this[randIdx];
            this[randIdx] = temp;
        }
    };
    Array.prototype.shuffled = function () {
        var copy = this.clone();
        copy.shuffle();
        return copy;
    };
    Array.prototype.sortAsc = function () {
        var lambdas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lambdas[_i] = arguments[_i];
        }
        if (lambdas.length == 0) {
            lambdas.push(function (item) { return item; });
        }
        this.sort(function (a, b) {
            for (var _i = 0, lambdas_1 = lambdas; _i < lambdas_1.length; _i++) {
                var lambda = lambdas_1[_i];
                if (lambda(a) > lambda(b))
                    return 1;
                if (lambda(a) < lambda(b))
                    return -1;
            }
            return 0;
        });
    };
    Array.prototype.sortedAsc = function () {
        var lambdas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lambdas[_i] = arguments[_i];
        }
        var copy = this.clone();
        copy.sortAsc.apply(copy, lambdas);
        return copy;
    };
    Array.prototype.sortDesc = function () {
        var lambdas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lambdas[_i] = arguments[_i];
        }
        if (lambdas.length == 0) {
            lambdas.push(function (item) { return item; });
        }
        this.sort(function (a, b) {
            for (var _i = 0, lambdas_2 = lambdas; _i < lambdas_2.length; _i++) {
                var lambda = lambdas_2[_i];
                if (lambda(a) > lambda(b))
                    return -1;
                if (lambda(a) < lambda(b))
                    return 1;
            }
            return 0;
        });
    };
    Array.prototype.sortedDesc = function () {
        var lambdas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lambdas[_i] = arguments[_i];
        }
        var copy = this.clone();
        copy.sortDesc.apply(copy, lambdas);
        return copy;
    };
}
exports.initExtensions = initExtensions;
(function () {
    initExtensions();
}());
exports.default = initExtensions;

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
        //# sourceMappingURL=ExtensionImpl.js.map
        