// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//生成球控制类

import Ball from "../view/Ball";
import { ColliderType, EyeState, ballDropSpeed, ballScale } from "../GameConfig";
import GameCtrl from "./GameCtrl";
import RandomBallNum from "../RandomBallNum";
import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreatBall extends cc.Component {
    /** 生成触发疯狂模式的触发分数 */
    public crazyTrigerNum: number = undefined;

    /** 疯狂触发球触发概率 */
    public crazyTrigerOdds: number = 0.2;

    /** 疯狂模式触发球 */
    private _crazyTrigerBall: Ball = undefined;

    /** 生成速度 */
    private _creatSpeed: number = undefined;

    /** 球的对象池 */
    private ballArr = {};

    /** 疯狂球对象池 */
    private crazyPool: Array<Ball> = [];

    /** 控制creat生成 */
    private creatFlag: boolean = false;

    /** 距离下一次生成球时间 */
    private nextCreatTime: number = 0;

    //随机生成球
    private randomBallNum: RandomBallNum = undefined;

    start() {
        this.randomBallNum = new RandomBallNum();
    }

    /**
     * 按生成速度和生成概率生成球
     */
    update(dt: number) {
        if (!this.creatFlag)
            return;
        this.nextCreatTime -= dt;
        if (this.nextCreatTime <= 0 && this.judgeCreat()) {
            this.randomBall();
            this.nextCreatTime = this._creatSpeed;
        }
    }


    /**
     * 游戏开始生成五个球,再按生成速度生成
     */
    public initCreat() {
        let count = 0
        let callback = () => {
            if (GameCtrl.instance.pause == true)
                return;
            if (count == 3) {
                this.creatFlag = true;
                this.unschedule(callback);
            }
            this.randomBall();
            count++;
        }
        this.schedule(callback, 0.15)
    }

    /**
     * 新手引导球生成
     */
    public guideCreat() {
        let arr = [2, 2, 7, 6, 5, 5];
        let callback = () => {
            if (arr.length == 0) {
                this.unschedule(callback);
                return;
            }
            let num = arr.shift();

            //记录掉落操作
            RootNode.instance.gameLog.recordAction('d', num);
            this.ballBirth(num);
        }
        this.schedule(callback, 0.1);
    }

    /**
     * 疯狂模式结束,疯狂球清空
     */
    public crazyPoolClear() {
        let length = this.crazyPool.length;
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
        this.creatFlag = false;
    }

    /**
     * 设置球生成速度
     */
    public set creatSpeed(num: number) {
        this._creatSpeed = num;
    }

    /** 
     * 球回收
     */
    public ballRecovery(ball: Ball) {
        if (undefined == ball)
            return;

        let ballnum = ball.ballNum;
        ball.resume();

        //触发球不放入对象池
        if (ball == this._crazyTrigerBall) {
            this._crazyTrigerBall.node.removeFromParent();
            this._crazyTrigerBall = undefined;
            return;
        }

        //疯狂模式下的5
        if (ball.crazyBall) {
            if (ballnum == 5) {
                this.crazyPool.push(ball);
                //去重
                let set = new Set(this.crazyPool);
                this.crazyPool = Array.from(set);
                return;
            }
        }

        //引导模式下的球不回收,因为触发监听有问题
        if(GameCtrl.instance.guide)
        {
            ball.node.removeFromParent();
            return;
        }

        //大球不回收
        if (ballnum > 10)
            return;

        let numstr = ballnum.toString();
        let arr = this.ballArr[numstr];
        if (arr == undefined) {
            arr = new Array<Ball>();
            this.ballArr[numstr] = arr;
        }

        if (arr.length < 5) {
            arr.push(ball);
        } else {
            ball.node.parent = undefined;
            ball.node = undefined;
        }

        //去重,修改生成后球消失的bug
        let set = new Set(arr);
        this.ballArr[numstr] = Array.from(set);
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
    public creatBallForPos(num: number, pos: cc.Vec2): cc.Node {
        let ball = this.getBall(num);
        let node = ball.node;
        node.position = pos;
        return node;
    }

    /**
     * 暂停
     */
    public set pause(enable: boolean) {
        if (enable) {
            this.creatFlag = false;
        } else
            this.creatFlag = true;
    }

    /**
     * 判断球生成,主要用于限制,桌面上球的数量
     */
    private judgeCreat(): boolean {
        let ballarr = GameCtrl.instance.getGamePanelBall();
        let num = 0;
        let length = ballarr.length;
        if (length < 18)
            return true;
        for (let i = 0; i < length; i++) {
            //小球体积小当0.5个
            if (ballarr[i].ballNum < 5)
                num += 0.5;
            else
                num++;
        }
        if (num > 18)
            return false;
        return true;
    }

    /**
     * 按概率随机创建球
     */
    private randomBall() {
        let num = this.crazyTrigerNum;

        //超过触发分数,随机到的数字为5
        if (num != undefined && num < GameCtrl.instance.Score) {
            //概率触发
            if (Math.random() < this.crazyTrigerOdds) {
                this.crazyTrigerOdds = 0.2;
                let ball = this.creatNewBall(16);
                this._crazyTrigerBall = ball;
                this.initCrazyTrigerBall(ball);
                this.crazyTrigerNum = undefined;
                return;
            }
        }
        let ranNum = this.randomBallNum.getBallNum();
        //记录掉落操作
        RootNode.instance.gameLog.recordAction('d', ranNum);

        this.ballBirth(ranNum);
    }

    /**
     * 疯狂触发球设置
     */
    private async initCrazyTrigerBall(ball: Ball) {
        let node = ball.node;
        //位置
        node.position = new cc.Vec2(0, 1000);
        let trggerNode = cc.instantiate(GameCtrl.instance.crazyTriggerPrefab);
        trggerNode.parent = node;

        //按配置缩放到疯狂球相同大小
        trggerNode.scale = ballScale[15];
        //变为普通球特效
        let normal = undefined;

        //无操作,五秒后消失变普通球
        let action = cc.sequence(
            cc.delayTime(8),
            cc.callFunc(() => {
                normal = cc.instantiate(GameCtrl.instance.crazyToNomalPrefab);
                normal.parent = node;
                normal.scale = ballScale[15];
                normal.position = cc.Vec2.ZERO;
                let callback = ()=>{
                    if (normal != undefined) {
                        normal.removeFromParent();
                    }
                    this.ballRecovery(this._crazyTrigerBall);
                }
                this.scheduleOnce(callback,0.37);
            }),
            cc.delayTime(5 / 30),
            cc.callFunc(() => {
                let newBall = this.creatBallForPos(5, node.position);
                normal.parent = newBall;
                normal.position = cc.Vec2.ZERO;
                //触发球移除屏幕,等时机到自动回收
                node.position = new cc.Vec2(0, 10000);
            }),
        )
        node.runAction(action);
    }

    /**
     * 球生成设置
     */
    private ballBirth(ballnum: number) {
        let ball = this.getBall(ballnum);
        let width = ball.node.getContentSize().width;

        //1000为下降高度, x为随机位置
        let x = -360 + width / 2 + Math.random() * (720 - width);
        ball.node.position = new cc.Vec2(x, 1000);
        this.setBirthSpeed(ball);
    }

    /**
     * 球生成起始速度
     * @param ball 球
     */
    private setBirthSpeed(ball: Ball) {
        let callback = () => {
            let speed = ball.rigid.linearVelocity;
            if (speed.y < 0) {
                ball.speed = new cc.Vec2(0, -ballDropSpeed);
                this.unschedule(callback);
            }
        }
        this.schedule(callback, 0.2);
    }

    /**
     * 根据数字返回需要的球
     * @param num 需要的球的数字
     */
    private getBall(num: number): Ball {
        let instance = GameCtrl.instance;
        let ball: Ball = undefined;

        //大于10的大球,不保存内存池
        if (num > 10)
            return this.creatNewBall(num);

        let numstr = num.toString();
        let arr = this.ballArr[numstr];
        //如果是疯狂模式下的5
        if (instance.crazy && num == 5) {
            arr = this.crazyPool;
            //预制放在15;
            num = 16;
        }
        if (arr != undefined && arr.length > 0) {
            ball = arr.shift();
            let node = ball.node;
            node.active = true;
            ball.node.scale = 1;
            node.setParent(instance.gamePanl);
            ball.collider.tag = ColliderType.Birth;
        }
        else
            ball = this.creatNewBall(num);
        return ball;
    }

    /**
     * 创建一个新球
     */
    private creatNewBall(num: number) {
        let instance = GameCtrl.instance;
        let node = cc.instantiate(instance.ballPreArr[num - 1]);
        let ball = node.getComponent(Ball);
        ball.setNum(num);
        node.setParent(instance.gamePanl);
        ball.collider.tag = ColliderType.Birth;
        return ball;
    }
}