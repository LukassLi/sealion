(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/GameConfig.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '7f4b1qbWtNOwov62VdCea0V', 'GameConfig', __filename);
// scripts/GameConfig.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
// 游戏配置信息
var RootNode_1 = require("./RootNode");
/** 球高亮的宽度 */
exports.ballHighLightWidth = 20;
/** 球初始下降速度 */
exports.ballDropSpeed = 0;
/** 球的弹性 [0,1]*/
exports.ballRestitution = 0.2;
/** 球的摩擦力 [0,1]*/
exports.ballFriction = 0.3;
/** 分离时速度衰减 */
exports.LinearDamping = 10;
/** 球的角速度 */
exports.ballAngularDamping = 3;
/** combo动画的速度 如:2 则为加速到原始的两倍 0.5则为放慢 */
exports.comboSpeed = 1.5;
exports.effectVolume = [
    0.2,
    0.5,
    0.7,
    0,
    0,
    0.4,
    0.5,
    0.3,
    0.6,
    0.7,
    0.3,
    0.5,
    0.4,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.1,
    0.8,
    0.8,
    0.7,
    0.7,
    1,
];
var EyeState;
(function (EyeState) {
    EyeState[EyeState["open"] = 0] = "open";
    EyeState[EyeState["close"] = 1] = "close";
    EyeState[EyeState["die"] = 2] = "die";
})(EyeState = exports.EyeState || (exports.EyeState = {}));
var ColliderType;
(function (ColliderType) {
    ColliderType[ColliderType["Birth"] = 1] = "Birth";
    ColliderType[ColliderType["Slect"] = 2] = "Slect";
    ColliderType[ColliderType["Normal"] = 0] = "Normal";
    ColliderType[ColliderType["Wall"] = 4] = "Wall";
})(ColliderType = exports.ColliderType || (exports.ColliderType = {}));
/** 配置球的大小,调整到一半设置成0.5 */
exports.ballScale = [
    0.9,
    0.9,
    0.9,
    0.9,
    0.9,
    0.9,
    0.8,
    0.8,
    0.8,
    1,
    1,
    1,
    1,
    1,
    1,
    0.9,
];
/** 给出的球图片实际大小,不是更换图片不要修改 */
exports.ballsize = [
    new cc.Vec2(129, 129),
    new cc.Vec2(148, 152),
    new cc.Vec2(194, 194),
    new cc.Vec2(196, 198),
    new cc.Vec2(222, 222),
    new cc.Vec2(241, 240),
    new cc.Vec2(279, 278),
    new cc.Vec2(322, 322),
    new cc.Vec2(364, 364),
    new cc.Vec2(461, 461),
    new cc.Vec2(621, 509),
    new cc.Vec2(526, 621),
    new cc.Vec2(561, 609),
    new cc.Vec2(643, 598),
    new cc.Vec2(573, 573),
    new cc.Vec2(225, 224),
];
/** 球在不同分段多久生成一个球 key为分段 value为间隔 */
var ballCreatDic = {
    2000: 2,
    5000: 1,
    10000: 0.5,
    1000000: 0.2,
};
/** 物理的重力加速度设置,用于控制生成球下降速度 key为分段 value为重力,标准加速度为320 */
var gravityDic = {
    2000: 480,
    5000: 600,
    10000: 720,
    1000000: 840,
};
/** 各种球生成的概率 */
var ballOddsDic = {
    500: "1:6%,2:10%,3:10%,4:19%,5:31%,6:24%",
    2000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    5000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    10000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    1000000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
};
/**
 * 获取生成一个球时间和下一次更新分数
 * @param score 分数
 */
function getCreatInformation(score) {
    var arr = [];
    var dic = RootNode_1.default.instance.getBallCreatDic();
    for (var key in dic) {
        var value = keyToInt(key);
        if (score < value) {
            arr[1] = value;
            break;
        }
        arr[0] = dic[key];
    }
    return arr;
}
/**
 * 获取重力加速度和下一次更新分数
 * @param score 分数
 */
function getGravityInformation(score) {
    var arr = [];
    var dic = RootNode_1.default.instance.getGravityDic();
    for (var key in dic) {
        var value = keyToInt(key);
        if (score < value) {
            arr[1] = value;
            break;
        }
        arr[0] = dic[key];
    }
    return arr;
}
/**
 * 获取球生成概率和下一次更新分数
 * @param score 分数
 */
function getOddsInformation(score) {
    var arr = [];
    var dic = RootNode_1.default.instance.getBallOddsDic();
    for (var key in dic) {
        var value = keyToInt(key);
        if (score < value) {
            arr[1] = value;
            break;
        }
        arr[0] = dic[key];
    }
    return arr;
}
/**
 * 获取持续时间和下一次触发分数
 * @param score 分数
 */
function getCrazyInformation(score) {
    var arr = new Array();
    var dic = RootNode_1.default.instance.getCrazyDic();
    for (var key in dic) {
        var value = keyToInt(key);
        if (score < value) {
            arr.push(value);
            arr.push(dic[key]);
            break;
        }
    }
    return arr;
}
/**
 * 获得疯狂模式的初始化信息
 * @param score 分数
 */
function getcrazyInitValue(score) {
    var initValue = undefined;
    var dic = RootNode_1.default.instance.getCrazyDic();
    for (var key in dic) {
        var value = keyToInt(key);
        if (score <= value) {
            break;
        }
        initValue = dic[key];
    }
    return initValue;
}
/**
 * key转换为数字
 * @param key 转换的key
 */
function keyToInt(key) {
    var str = key.replace('k', '');
    return Number(str);
}
exports.default = {
    getCreatInformation: getCreatInformation,
    getOddsInformation: getOddsInformation,
    getGravityInformation: getGravityInformation,
    getCrazyInformation: getCrazyInformation,
    getcrazyInitValue: getcrazyInitValue,
};

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
        //# sourceMappingURL=GameConfig.js.map
        