// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

// 生产球

import { ballJetSpeed, ballScale, ColliderType, EyeState } from "../GameConfig";
import RandomBallNum from "../RandomBallNum";
// import GameCtrl from "./";
// import RandomBallNum from "../RandomBallNum";
import RootNode from "../RootNode";
import { DebugSettings } from "../util/DebugSettings";
import Ball from "../view/Ball";
import GameCtrl from "./GameCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreatBall extends cc.Component {
    /** 生成触发疯狂模式的触发分数 */
    public crazyTriggerScore: number = undefined;

    /** 疯狂触发球触发概率 */
    public crazyTriggerOdds: number = 0.2;

    /** 疯狂模式触发球 */
    private _crazyTrigerBall: Ball = undefined;

    /** 生成速度 */
    private _creatRate: number = undefined;

    /** 球的对象池 */
    private _ballPool = {};

    /** 舞台里的球 */
    private _stageBalls:Ball[] = [];

    /** 疯狂球对象池 */
    private crazyPool: Ball[] = [];

    /** 控制球生成 */
    private _onCreate: boolean = false;

    /** 距离下一次生成球时间 */
    private nextCreatTime: number = 0;

    // 随机生成球
    private randomBallNum: RandomBallNum = new RandomBallNum();

    public static instance: CreatBall = undefined;

    onload(){
    }

    public get stageBalls(){
        return this._stageBalls;
    }

    start() {
        CreatBall.instance = this;
        // this.randomBallNum = new RandomBallNum();
    }

    /**
     * 按生成速度和生成概率生成球
     */
    update(dt: number) {
        if (!this._onCreate) { return; }
        this.nextCreatTime -= dt;
        if (this.nextCreatTime <= 0) {
            // && this.judgeCreat()
            this.genBall();
            this.nextCreatTime = this._creatRate;
        }
    }

    /**
     * 游戏开始生成五个球,再按生成速度生成
     */
    public initCreat() {
        // let count = 0
        // let callback = () => {
        //     if (GameCtrl.instance.pause == true)
        //         return;
        //     if (count == 3) {
        //         this._onCreate = true;
        //         this.unschedule(callback);
        //     }
        //     this.genBall();
        //     count++;
        // }
        // this.schedule(callback, 0.15)
        this._onCreate = true;
    }

    /**
     * 新手引导球生成
     */
    public guideCreat() {
        const arr = [2, 2, 7, 6, 5, 5];
        const callback = () => {
            if (arr.length == 0) {
                this.unschedule(callback);
                return;
            }
            const num = arr.shift();

            // 记录掉落操作
            // RootNode.instance.gameLog.recordAction('d', num);
            this.ballBirth(num);
        };
        this.schedule(callback, 0.1);
    }

    /**
     * 疯狂模式结束,疯狂球清空
     */
    public crazyPoolClear() {
        const length = this.crazyPool.length;
        for (let i = 0; i < length; i++) {
            this.crazyPool[i].node.parent = undefined;
            this.crazyPool[i].node = undefined;
        }
        this.crazyPool = [];
    }

    /**
     * 获取触发球
     */
    public get crazyTrigerBall() {
        return this._crazyTrigerBall;
    }

    /**
     * 停止球的生成
     */
    public stopCreat() {
        this._onCreate = false;
    }

    /**
     * 设置球生成速度
     */
    public set creatRate(num: number) {
        this._creatRate = num;
    }

    /**
     * 球回收
     */
    public ballRecovery(ball: Ball) {
        if (undefined == ball) { return; }

        const ballnum = ball.ballNum;
        ball.resume();

        // //触发球不放入对象池
        // if (ball == this._crazyTrigerBall) {
        //     this._crazyTrigerBall.node.removeFromParent();
        //     this._crazyTrigerBall = undefined;
        //     return;
        // }

        // //疯狂模式下的5
        // if (ball.crazyBall) {
        //     if (ballnum == 5) {
        //         this.crazyPool.push(ball);
        //         //去重
        //         let set = new Set(this.crazyPool);
        //         this.crazyPool = Array.from(set);
        //         return;
        //     }
        // }

        // 引导模式下的球不回收,因为触发监听有问题
        // if(GameCtrl.instance.guide)
        // {
        //     ball.node.removeFromParent();
        //     return;
        // }

        // 大球不回收
        if (ballnum > 10) { return; }

        const numstr = ballnum.toString();
        let arr = this._ballPool[numstr];
        if (arr == undefined) {
            arr = new Array<Ball>();
            this._ballPool[numstr] = arr;
        }

        if (arr.length < 5) {
            arr.push(ball);
        } else {
            ball.node.parent = undefined;
            ball.node = undefined;
        }

        // 使用set去重,修改生成后球消失的bug（set是非重复的键值对）
        const set = new Set(arr);
        this._ballPool[numstr] = Array.from(set);
    }

    /**
     * 更新球的生成概率
     * @param oddsStr 概率字符串
     */
    public updateOddsMap(oddsStr: string) {
        this.randomBallNum.updateOddsMap(oddsStr);
    }

    /**
     * 在具体位置生成球
     * @param num 生成球数字
     * @param pos 生成球位置
     */
    public creatBallAtPos(num: number, pos: cc.Vec2, v: cc.Vec2){
        const ball = this.createNewBall(num,v);
        const node = ball.node;
        node.position = pos;
        const seq = cc.sequence(cc.delayTime(0.5),cc.callFunc(()=>{this.stageBalls.push(ball)}));
        node.runAction(seq);
        // return node;
    }

    /**
     * 暂停
     */
    public set pause(enable: boolean) {
        if (enable) {
            this._onCreate = false;
        } else { this._onCreate = true; }
    }

    /**
     * 判断球生成,主要用于限制,桌面上球的数量
     */
    private judgeCreat(): boolean {
        const ballarr = GameCtrl.instance.getGamePanelBall();
        let num = 0;
        const length = ballarr.length;
        if (length < 18) { return true; }
        for (let i = 0; i < length; i++) {
            // 小球体积小当0.5个
            if (ballarr[i].ballNum < 5) { num += 0.5; }
            else { num++; }
        }
        if (num > 18) {
            // what's this meaning ? 球个数大于18个？
            return false;
        }
        return true;
    }

    /**
     * 按概率随机创建球
     */
    private genBall() {
        // let score = this.crazyTriggerScore;

        // //超过触发分数,随机到的数字为5
        // if (score != undefined && score < GameCtrl.instance.Score) {
        //     //概率触发
        //     if (Math.random() < this.crazyTriggerOdds) {
        //         this.crazyTriggerOdds = 0.2;
        //         let ball = this.creatNewBall(16);
        //         this._crazyTrigerBall = ball;
        //         this.initCrazyTrigerBall(ball);
        //         this.crazyTriggerScore = undefined;
        //         return;
        //     }
        // }
        const ranNum = this.randomBallNum.getBallNum();
        // 记录掉落操作
        // RootNode.instance.gameLog.recordAction('d', ranNum);

        this.ballBirth(ranNum);
    }

    /**
     * 疯狂触发球设置
     */
    private async initCrazyTrigerBall(ball: Ball) {
        const node = ball.node;
        // 位置
        node.position = new cc.Vec2(0, 1000);
        const trggerNode = cc.instantiate(GameCtrl.instance.crazyTriggerPrefab);
        trggerNode.parent = node;

        // 按配置缩放到疯狂球相同大小
        trggerNode.scale = ballScale[15];
        // 变为普通球特效
        let normal;

        // 无操作,五秒后消失变普通球
        const action = cc.sequence(
            cc.delayTime(8),
            cc.callFunc(() => {
                normal = cc.instantiate(GameCtrl.instance.crazyToNomalPrefab);
                normal.parent = node;
                normal.scale = ballScale[15];
                normal.position = cc.Vec2.ZERO;
                const callback = () => {
                    if (normal != undefined) {
                        normal.removeFromParent();
                    }
                    this.ballRecovery(this._crazyTrigerBall);
                };
                this.scheduleOnce(callback, 0.37);
            }),
            cc.delayTime(5 / 30),
            cc.callFunc(() => {
                // let newBall = this.creatBallForPos(5, node.position);
                // normal.parent = newBall;
                // normal.position = cc.Vec2.ZERO;
                // //触发球移除屏幕,等时机到自动回收
                // node.position = new cc.Vec2(0, 10000);
            }),
        );
        node.runAction(action);
    }

    /**
     * 球生成设置
     */
    private ballBirth(ballnum: number) {
        const ball = this.getBall(ballnum);
        this.stageBalls.push(ball)

        // 随机球的生成位置
        const width = ball.node.getContentSize().width;
        const x = -640 + width / 2 + Math.random() * (1280 - width);
        ball.node.position = new cc.Vec2(x, -450);
        if (DebugSettings.debugNormal) {
            console.log(`ballPos=${ball.node.position}`);
        }
    }

    /**
     * 球生成起始冲量
     * @param ball 球
     */
    private setStartImpulse(ball: Ball) {
        // let callback = () => {
        // let speed = ball.rigid.linearVelocity;
        // if (speed.y < 0) {
        //     ball.speed = new cc.Vec2(0, ballJetSpeed);
        //     this.unschedule(callback);
        // }
        ball.impulse = new cc.Vec2(0, 20000); // TODO
        // }
        // this.schedule(callback, 0.2);
    }

    /**
     * 根据数字返回需要的球
     * @param num 需要的球的数字
     */
    private getBall(num: number): Ball {
        const instance = GameCtrl.instance;
        let ball: Ball;

        // // 数字大于10的大球,不存入池
        // if (num > 10) { return this.createNewBall(num); }

        // const numstr = num.toString();
        // const arr = this._ballPool[numstr];
        // // //如果是疯狂模式下的5
        // // if (instance.crazy && num == 5) {
        // //     arr = this.crazyPool;
        // //     //预制放在15;
        // //     num = 16;
        // // }
        // if (arr != undefined && arr.length > 0) {
        //     ball = arr.shift();
        //     const node = ball.node;
        //     node.active = true;
        //     ball.node.scale = 1;
        //     node.setParent(instance.gamePanl);
        //     ball.collider.tag = ColliderType.Birth;
        // } else {  }
        ball = this.createNewBall(num,ballJetSpeed);
        return ball;
    }

    /**
     * 创建一个新球
     */
    private createNewBall(num: number,v:cc.Vec2) {
        const instance = GameCtrl.instance;
        const node = cc.instantiate(instance.preBallArr[num-1]);
        const ball = node.getComponent(Ball);
        ball.setNum(num);
        node.setParent(instance.ballStage);
        ball.speed = v;
        ball.collider.tag = ColliderType.Birth;
        return ball;
    }
}
