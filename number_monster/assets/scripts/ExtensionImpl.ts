// Copyright (C) 2018, Flickering Inc. All rights reserved.
// Author: Wende Luo (wendeluo@flickering.ai)
//
// 对原生的ts类拓展一些函数
// 这个是实现文件，就是拓展函数的具体实现代码


/** 
 * 随机一个范围内的数字（整数），范围的左边是闭区间，右边是开区间
 */
function random(min: number, max: number) {
    let d = Math.floor(max) - Math.floor(min);
    return min + Math.floor(Math.random() * d);
}

/**
 * 激活拓展方法
 */
export function initExtensions() {

    Array.prototype.pushRange = function (items) {
        if (!items || items.length == 0) {
            return;
        }
        for (var x of items) {
            this.push(x);
        }
    };

    Array.prototype.random = function () {
        let randIdx = Math.floor(Math.random() * this.length);
        return this[randIdx];
    };

    Array.prototype.contains = function (param) {
        if (typeof param !== 'function') {
            return this.indexOf(param) >= 0;
        }
        return !!this.first(param);
    };

    Array.prototype.remove = function (param) {

        const removeItem = item => {
            const index = this.indexOf(item);
            if (index >= 0) {
                this.splice(index, 1);
            }
        };

        const removeLambda = lambda => {
            for (let i = 0; i < this.length; i++) {
                if (lambda(this[i])) {
                    this.splice(i, 1);
                    i--;
                }
            }
        };

        typeof param === 'function' ? removeLambda(param) : removeItem(param);
    };

    Array.prototype.removed = function (param) {
        const copy = this.clone();
        copy.remove(param);
        return copy;
    };

    Array.prototype.clear = function () {
        this.length = 0;
    }

    Array.prototype.first = function () {
        if (arguments.length == 0 && this.length > 0) {
            return this[0];
        }
        const lambda = arguments[0];
        for (let x of this) {
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
        const lambda = arguments[0];
        for (let i = this.length - 1; i >= 0; i--) {
            if (lambda(this[i])) {
                return this[i];
            }
        }
        return undefined;
    };

    Array.prototype.max = function () {
        if (this.length == 0)
            return undefined;
        const lambda = arguments.length > 0 ? arguments[0] : item => item;
        let maxItem = this[0];
        let maxVal = lambda(maxItem);
        for (let i = 1; i < this.length; i++) {
            const currItem = this[i];
            const currVal = lambda(currItem);
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
        const lambda = arguments.length > 0 ? arguments[0] : item => item;
        let minItem = this[0];
        let minVal = lambda(minItem);
        for (let i = 1; i < this.length; i++) {
            const currItem = this[i];
            const currVal = lambda(currItem);
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
        const lambda = arguments.length > 0 ? arguments[0] : item => item;
        let sum = 0;
        for (let item of this) {
            const val = lambda(item);
            if (typeof val !== 'number') {
                throw new Error('Array.sum 中，lambda 选择的字段不是 number 类型，无法求和');
            }
            sum += val;
        }
        return sum;
    }

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
        let obj = {};
        for (var x of this) {
            obj[lambda(x)] = x;
        }
        return obj;
    };

    Array.prototype.clone = function () {
        return this.slice(0);
    };

    Array.prototype.shuffle = function () {
        // 当前元素与随机一个位置元素交换位置
        for (let i = 0; i < this.length; i++) {
            const randIdx = random(0, this.length);
            const temp = this[i];
            this[i] = this[randIdx];
            this[randIdx] = temp;
        }
    };

    Array.prototype.shuffled = function () {
        let copy = this.clone();
        copy.shuffle();
        return copy;
    };

    Array.prototype.sortAsc = function (...lambdas: Function[]) {
        if (lambdas.length == 0) {
            lambdas.push(item => item);
        }
        this.sort((a, b) => {
            for (let lambda of lambdas) {
                if (lambda(a) > lambda(b))
                    return 1;
                if (lambda(a) < lambda(b))
                    return -1;
            }
            return 0;
        });
    };

    Array.prototype.sortedAsc = function (...lambdas: any[]) {
        const copy = this.clone();
        copy.sortAsc(...lambdas);
        return copy;
    };

    Array.prototype.sortDesc = function (...lambdas: Function[]) {
        if (lambdas.length == 0) {
            lambdas.push(item => item);
        }
        this.sort((a, b) => {
            for (let lambda of lambdas) {
                if (lambda(a) > lambda(b))
                    return -1;
                if (lambda(a) < lambda(b))
                    return 1;
            }
            return 0;
        });
    };

    Array.prototype.sortedDesc = function (...lambdas: any[]) {
        const copy = this.clone();
        copy.sortDesc(...lambdas);
        return copy;
    };
}

(function () {
    initExtensions();
}());

export default initExtensions;