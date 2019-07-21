// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

// 游戏配置信息

import RootNode from "./RootNode";

/** 球高亮的宽度 */
export const ballHighLightWidth = 20;

/** 球初始喷射速度 */
export const ballJetSpeed =new cc.Vec2(0,1000); // todo

/** 球的弹性 [0,1]*/
export const ballRestitution = 0.2;

/** 球的摩擦力 [0,1]*/
export const ballFriction = 0.3;

/** 分离时速度衰减 */
export const LinearDamping = 10;

/** 球的角速度 */
export const ballAngularDamping = 3;

/** combo动画的速度 如:2 则为加速到原始的两倍 0.5则为放慢 */
export const comboSpeed = 1.5;

export const effectVolume = [
    0.2,              //游戏背景音乐
    0.5,            //combo good 音效
    0.7,            //combo 十次
    0,              //结束面板
    0,              //结束破纪录
    0.4,            //进入游戏
    0.5,            //游戏结束
    0.3,               //合成超过10
    0.6,               //合成超过15
    0.7,               //合成小于10
    0.3,               //分开
    0.5,               //合成10
    0.4,               //按钮
    0.1,               //数字1
    0.1,               //数字2
    0.1,               //数字3
    0.1,               //数字4
    0.1,               //数字5
    0.1,               //数字6
    0.1,               //数字7
    0.1,               //数字8
    0.1,               //数字9
    0.8,                //疯狂模式切入
    0.8,                //疯狂背景音
    0.7,                //combo 十次 1
    0.7,                //combo 十次 2
    1,                  //复活音效
]

export const enum EyeState {
    open = 0,
    close = 1,
    die = 2
}

export const enum ColliderType {
    Birth = 1,
    Slect = 2,
    Normal = 0,
    Wall = 4,
}

/** 配置球的大小,调整到一半设置成0.5 */
export const ballScale = [
    0.9,      //1
    0.9,      //2
    0.9,      //3
    0.9,      //4
    0.9,      //5
    0.9,      //6
    0.8,      //7
    0.8,      //8
    0.8,      //9
    1,      //10
    1,      //11
    1,      //12
    1,      //13
    1,      //14
    1,      //15
    0.9,      //crazy 5
]

/** 给出的球图片实际大小,不是更换图片不要修改 */
export const ballsize = [
    new cc.Vec2(129, 129),     //1
    new cc.Vec2(148, 152),     //2
    new cc.Vec2(194, 194),     //3
    new cc.Vec2(196, 198),     //4
    new cc.Vec2(222, 222),     //5
    new cc.Vec2(241, 240),     //6
    new cc.Vec2(279, 278),     //7
    new cc.Vec2(322, 322),     //8
    new cc.Vec2(364, 364),     //9
    new cc.Vec2(461, 461),     //10
    new cc.Vec2(621, 509),     //11
    new cc.Vec2(526, 621),     //12
    new cc.Vec2(561, 609),     //13
    new cc.Vec2(643, 598),     //14
    new cc.Vec2(573, 573),     //15
    new cc.Vec2(225, 224),     //crazy 5
]

/** 球在不同分段多久生成一个球 key为分段 value为间隔 */
const ballCreatDic: { [key: number]: number } = {
    2000: 2,
    5000: 1,
    10000: 0.5,
    1000000: 0.2,
}

/** 物理的重力加速度设置,用于控制生成球下降速度 key为分段 value为重力,标准加速度为320 */
const gravityDic: { [key: number]: number } = {
    2000: 480,
    5000: 600,
    10000: 720,
    1000000: 840,
}

/** 各种球生成的概率 */
const ballOddsDic: { [key: number]: string } = {
    500: "1:6%,2:10%,3:10%,4:19%,5:31%,6:24%",
    2000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    5000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    10000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
    1000000: "1:6%,2:10%,3:10%,4:12%,5:24%,6:12%,7:10%,8:10%,9:6%",
}

/**
 * 获取生成一个球时间和下一次更新分数
 * @param score 分数
 */
function getCreatInformation(score: number): Array<any> {
    let arr = [];
    let dic = RootNode.instance.getBallCreatDic();
    for (const key in dic) {
        let value = keyToInt(key);
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
function getGravityInformation(score: number): Array<any> {
    let arr = [];
    let dic = RootNode.instance.getGravityDic();
    for (const key in dic) {
        let value = keyToInt(key);
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
function getOddsInformation(score: number): Array<any> {
    let arr = [];
    let dic = RootNode.instance.getBallOddsDic();
    for (const key in dic) {
        let value = keyToInt(key);
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
function getCrazyInformation(score: number): Array<any> {
    let arr = new Array<any>();
    let dic = RootNode.instance.getCrazyDic();
    for (const key in dic) {
        let value = keyToInt(key);
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
function getcrazyInitValue(score: number): string {
    let initValue: string = undefined;
    let dic = RootNode.instance.getCrazyDic();
    for (const key in dic) {
        let value = keyToInt(key);
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
function keyToInt(key: string): number {
    let str = key.replace('k', '');
    return Number(str);
}


export default {
    getCreatInformation,
    getOddsInformation,
    getGravityInformation,
    getCrazyInformation,
    getcrazyInitValue,
}