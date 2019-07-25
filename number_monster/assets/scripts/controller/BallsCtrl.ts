// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//球操作的控制

import { comboSpeed } from "../GameConfig";
import Ball from "../view/Ball";
import ComBo from "../view/ComBo";
import GameCtrl from "./GameCtrl";
import MySound, { AudioType } from "../MySound";
import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BallsCtrl {
    /** 连击数 */
    private combo: number = 0;

    /** 10球对象池*/
    private tenArr: Array<cc.Node> = [];

    /** comBo对象池 */
    private comBoArr: Array<ComBo> = [];

    /**
     * 选中球,手指停止触碰处理
     */
    public touchEnd() {
        if (!this.isCrazeTriggerBallValidAdd())
            return;
        let triggerBall = GameCtrl.instance.triggerBall;
        let moveBall = GameCtrl.instance.slectBall;
        let num = triggerBall.ballNum + moveBall.ballNum;

        //疯狂模式不能大于15
        if (num > 15 && GameCtrl.instance.crazy)
            return;
        if (num != 10)
            this.addNormal(num);
        else
            this.addTen()
        this.ballAddDisappear(triggerBall);
        let pos = triggerBall.node.position;
        this.moveAddDisappear(moveBall, pos);
        GameCtrl.instance.triggerBall = undefined;

        //记录合并
        RootNode.instance.gameLog.recordAction('c', triggerBall.ballNum, moveBall.ballNum);

        //引导
        if (GameCtrl.instance.guide)
            GameCtrl.instance.guide.nextGuide(1);
    }

    /**
     * 选中球双击处理
     * @param ball 选中球
     */
    public ballDoubleClick(ball: Ball) {
        let num = ball.ballNum;
        if (!this.isValidDoubleClick(num))
            return;

        MySound.instance.playAudio(AudioType.Split);
        let num1 = Math.ceil(num / 2);
        let num2 = num - num1;
        let pos = ball.node.position;
        GameCtrl.instance.creatBall.ballRecovery(ball);
        this.creatForDouble(num1, pos);
        let ball2 = this.creatForDouble(num2, pos, false);
        let v = new cc.Vec2(0, 260);
        ball2.speedDelay(v, 0.1);
        this.combo = 0;

        //记录拆分
        RootNode.instance.gameLog.recordAction('s', num);
    }

    /**
     * 游戏开始连击重置
     */
    public reset() {
        this.combo = 0;
    }

    /**
     * 是否为有效的双击拆分
     */
    private isValidDoubleClick(num: number): boolean {
        //引导时,第五步双击引导,双击数字6才能拆
        let guide = GameCtrl.instance.guide
        if (guide) {
            if (guide.Index == 5 && num == 6) {
                guide.nextGuide();
                return true;
            }
            return false;
        }
        return true;
    }

    /**
     * 是否为有效的疯狂模式触发球相加
     */
    private isCrazeTriggerBallValidAdd(): boolean {
        let triggerBall = GameCtrl.instance.triggerBall;
        let moveBall = GameCtrl.instance.slectBall;
        if (triggerBall == undefined)
            return false;
        //有触发球
        if (GameCtrl.instance.creatBall.crazyTrigerBall) {
            //判断的两球中有触发球
            if (triggerBall.crazyBall || moveBall.crazyBall) {
                //不为10 均为无效
                if (triggerBall.ballNum + moveBall.ballNum != 10)
                    return false;
                else //等到合10特效结束,触发疯狂模式
                {
                    //合了疯狂球就立刻结束判断,等待进入疯狂模式
                    GameCtrl.instance.topStrip.stopJudgment();

                    GameCtrl.instance.crazyDelay(true,38/30);
                }
            }
        }
        return true;
    }

    /**
     * 选中球消失 5帧数 30为帧率
     * @param ball 选中球
     * @param pos 消失位置
     */
    private moveAddDisappear(ball: Ball, pos: cc.Vec2) {
        ball.rigid.active = false;
        let move = cc.moveTo(5 / 30, pos);
        let disappear = this.addDisappear(ball);
        let spa = cc.spawn([move, disappear]);
        ball.node.runAction(spa);
    }

    /**
     * 触发球消失 5帧数 30为帧率
     * @param ball 触发球
     */
    private ballAddDisappear(ball: Ball) {
        ball.rigid.active = false;
        let delay = cc.delayTime(5 / 30);
        let action = this.addDisappear(ball);
        let sqe = cc.sequence(delay, action);
        ball.node.runAction(sqe);
    }

    /**
     * 球在相加时,消失的动画 5帧数 30为帧率
     * @param ball 消失的球
     */
    private addDisappear(ball: Ball): cc.ActionInterval {
        let fun = cc.callFunc(() => {
            GameCtrl.instance.creatBall.ballRecovery(ball);
        });
        let scale = cc.scaleTo(5 / 30, 0);
        let fade = cc.fadeTo(5 / 30, 0);
        let spa = cc.spawn([scale, fade]);
        let seq = cc.sequence([spa, fun]);
        return seq;
    }

    /**
     * 普通加
     * @param num 相加后生成的球数字
     */
    private addNormal(num: number) {
        this.combo = 0;
        let pos = GameCtrl.instance.triggerBall.node.position;
        if (num > 15) {
            MySound.instance.playAudio(AudioType.GreaterThanFifteen);
            let boom = GameCtrl.instance.ballboom;
            boom.active = true;
            boom.position = pos;
            this.playAnimation(boom, "boom");
            GameCtrl.instance.gameOver(1);
            return;
        }
        this.addCreatBall(num, pos);
    }

    /**
     * 相加生成球 4 6 1 为帧数 30为帧率
     * @param num 球的数字
     * @param pos 球的位置
     */
    private addCreatBall(num: number, pos: cc.Vec2) {
        if (num > 10)
            MySound.instance.playAudio(AudioType.GreaterThanTen);
        else
            MySound.instance.playAudio(AudioType.LessThanTen);
        let ballNode = GameCtrl.instance.creatBall.creatBallForPos(num, pos);
        ballNode.scale = 0.01;
        ballNode.opacity = 0;
        let delay = cc.delayTime(4 / 30);
        let spa = cc.spawn([
            cc.scaleTo(6 / 30, 1),
            cc.fadeTo(1 / 30, 255)
        ])
        let seq = cc.sequence([delay, spa]);
        ballNode.runAction(seq);

        if (GameCtrl.instance.guide)
            ballNode.parent = GameCtrl.instance.guide.node;
    }

    /**
     * 相加等于10
     */
    private addTen() {
        if (GameCtrl.instance.crazy)
            GameCtrl.instance.addScore = GameCtrl.instance.crazyComboAdd;
        else {
            this.combo++;
            if (this.combo > 10)
                this.combo = 10;
            GameCtrl.instance.addScore = this.combo * 10;
        }
        let pos = GameCtrl.instance.triggerBall.node.position;
        this.creatTen(pos);
        this.creatCombo(pos);
    }

    /**
     * 10球生成 25为帧数 30为帧率
     * @param pos 位置
     */
    private creatTen(pos: cc.Vec2) {
        MySound.instance.playAudio(AudioType.Ten);
        let instance = GameCtrl.instance;
        let node: cc.Node = undefined;
        if (this.tenArr.length > 0)
            node = this.tenArr.pop();
        else {
            node = cc.instantiate(instance.ballPreArr[9]);
        }
        let recover = cc.sequence([
            cc.delayTime(25 / 30),
            cc.callFunc(() => {
                this.tenArr.push(node);
            })
        ]);
        if (instance.guide)
            node.setParent(instance.maskPanl.parent);
        else
            node.setParent(instance.gameNode);
        node.position = pos;
        node.zIndex = 3;
        this.playAnimation(node, "ball_10", comboSpeed);
        node.runAction(recover);
    }

    /**
     * 连击生成 38为第几帧 30 为帧率
     * @param pos 位置
     */
    private creatCombo(pos: cc.Vec2) {
        if (GameCtrl.instance.crazy)
            MySound.instance.playAudio(AudioType.ComboGood, 20 / 30);
        else if (this.combo == 10)
            MySound.instance.playAudio(AudioType.ComboTen, 20 / 30);
        else if (this.combo > 1)
            MySound.instance.playAudio(AudioType.ComboGood, 20 / 30);
        let instance = GameCtrl.instance;
        let combo: ComBo = undefined;
        let node: cc.Node = undefined;
        if (this.comBoArr.length > 0)
            combo = this.comBoArr.pop();
        else {
            node = cc.instantiate(instance.comBoPre);
            combo = node.getComponent(ComBo);
        }
        let recover = cc.sequence([
            cc.delayTime(38 / 30),
            cc.callFunc(() => {
                this.comBoArr.push(combo);
            })
        ]);
        combo.setCombo(this.combo);
        node = combo.node;
        node.position = pos;
        this.playAnimation(node, "combo", comboSpeed);
        node.runAction(recover);
        if (instance.guide)
            node.setParent(instance.maskPanl.parent);
        else
            node.setParent(instance.gameNode);
    }

    /**
     * 播放动画
     * @param node 节点
     * @param ani 播放动画名字
     */
    private playAnimation(node: cc.Node, ani: string, speed: number = 1) {
        let anim = node.getComponent(cc.Animation);
        let animState = anim.play(ani);
        animState.speed = speed;
    }

    /**
     * 双击生成球
     * @param num 球的数字
     * @param pos 位置
     * @param active 生成时刚体是否有效
     */
    private creatForDouble(num: number, pos: cc.Vec2, active: boolean = true): Ball {
        let node = GameCtrl.instance.creatBall.creatBallForPos(num, pos);
        let ball = node.getComponent(Ball);
        node.scale = 0;
        ball.rigid.active = active;
        let action = cc.sequence(
            cc.scaleTo(0.2, 1),
            cc.callFunc(() => {
                ball.rigid.active = true;
            })
        )
        node.runAction(action);

        if (GameCtrl.instance.guide)
            node.parent = GameCtrl.instance.guide.node;
        return ball;
    }
}