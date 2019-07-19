import { DebugSettings } from './util/DebugSettings';

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//随机生成球(用平滑的加权轮询均匀取球,然后每取10个球随机打乱)

const { ccclass, property } = cc._decorator;

@ccclass
export default class RandomBallNum extends cc.Component {
    /** 球出现的概率 */
    private oddsArr = [];

    /** 选球前数组 */
    private oddsFromArr = Array<number>();

    /** 保存均匀打乱以后的球,当为空时重新取10个 */
    private ballNumArr = [];

    /** 球的总权重(正常为100,但为防止配置出错,算一次) */
    private total = 0

    /**
    * 更新球的生成概率
    * @param oddsStr 概率字符串
    */
    public updateOddsMap(oddsStr: string) {
        //概率改变重新取球
        this.ballNumArr = [];
        this.total = 0;
        this.oddsArr = [];
        let arr = oddsStr.split(',');
        for (let i = 0; i < arr.length; i++) {
            let str = arr[i].replace('%', '');
            let strArr = str.split(":");
            let value = Number(strArr[1]);
            let key = Number(strArr[0]) - 1;
            this.oddsArr[key] = value;
            this.total += value;
        }
        this.oddsFromArr = this.oddsArr.slice(0); // why to do slice(0) 相当于clone？
    }

    /**
     * 获取随机生成的球数字
     */
    public getBallNum(): number {
        if (this.ballNumArr.length == 0)
            this.initBallNumArr();
        return this.ballNumArr.pop();
    }

    /**
     * 球列表为空时,初始球
     */
    private initBallNumArr() {
        for (let i = 0; i < 10; i++) {
            let index = this.getMaxIndex(this.oddsFromArr);
            let current = this.oddsFromArr.slice(0);
            current[index] = current[index] - this.total; // 46.5 - 100 = -53.5? "1:2%,2:3%,3:10%,4:17%,5:46.5%,6:12.5%,7:8%,8:1%,9:0%" -7
            this.oddsFromArr = this.arrAdd(current, this.oddsArr);
            if(DebugSettings.debugNormal){
                console.log(`oddsFromArr=${this.oddsFromArr}`);
            }

            //取的是从0开始,球是从1开始
            this.ballNumArr.push(index + 1);
        }
        //打乱顺序
        this.ballNumArr = this.shuffle(this.ballNumArr);
    }

    /** 
     * 乱序化
     */
    private shuffle(arr: Array<number>): Array<number> {
        let newArr = arr.slice(0);
        let length = newArr.length;
        for (let i = 0; i < length; i++) {
            let randIdx = Math.floor(Math.random() * length);

            //当前元素与随机一个位置元素交换位置
            let temp = newArr[i];
            newArr[i] = newArr[randIdx];
            newArr[randIdx] = temp;
        }
        return newArr;
    }

    /**
     * 获取数组中数字最大的序号
     * @param arr 数组
     */
    private getMaxIndex(arr: Array<number>): number {
        let n = 0;
        let max = 0
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                n = i;
                max = arr[i];
            }
        }
        return n;
    }

    /**
     * 两个数组每一项的值相加
     * @param arrA 
     * @param arrB 
     */
    private arrAdd(arrA: Array<number>, arrB: Array<number>): Array<number> {
        let arr = [];
        for (let i = 0; i < arrA.length; i++) {
            arr[i] = arrA[i] + arrB[i];
        }
        return arr;
    }
}