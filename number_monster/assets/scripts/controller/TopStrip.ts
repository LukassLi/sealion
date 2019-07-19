// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//游戏上横栏,用于判断游戏结束

import Ball from "../view/Ball";
import GameCtrl from "../controller/GameCtrl";
import MySound, { AudioType } from "../MySound";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TopStrip extends cc.Component {
    /** 触发的刚体 */
    private colliderArr: Array<cc.PhysicsCollider> = []

    /** 触发球对应的触发时间 */
    private timeArr: Array<number> = []

    /** 球数量,前五个球不放声音 */
    private count: number = 0;

    /** 是否判断标志 */
    private judgeFlag = false;

    /** 多久判断一次 */
    private time:number = 0;

    /**
     * 开始结束判断
     */
    public endJudgment() {
        this.count = 0;
        this.colliderArr = [];
        this.timeArr = [];
        this.judgeFlag = true;
        this.time = 0;
    }

    /**
     * 停止判断
     */
    public stopJudgment() {
        this.judgeFlag = false;
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        this.count++;
        if (this.count > 5) {
            this.sound(otherCollider.node);
            this.colliderArr.push(otherCollider);
            this.timeArr.push(0);
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let index = this.colliderArr.indexOf(otherCollider);
        if (index != -1) {
            this.colliderArr.splice(index, 1);
            this.timeArr.splice(index, 1);
        }
    }

    /**
     * 设置球下落音效
     * @param node 球
     */
    private sound(node: cc.Node) {
        let ball = node.getComponent(Ball);
        let num = ball.ballNum;
        let audioNum = AudioType.DropNum1 + num - 1;
        MySound.instance.playAudio(audioNum);
    }

    update(dt: number) {
        if (GameCtrl.instance.pause == true||!this.judgeFlag)
            return;
        this.time += dt;
        if(this.time<0.1)
            return;
        let length = this.timeArr.length;
        for (let i = 0; i < length; i++) {
            let time = this.timeArr[i] + this.time;
            if (time > 3) {
                this.end();
                break;
            }
            this.timeArr[i] = time;
        }
        this.time = 0;
    }

    /**
     * 判断结束
     */
    private end() {
        //疯狂模式下,结束模式
        if (GameCtrl.instance.crazy)
            GameCtrl.instance.crazy = false;
        else
            GameCtrl.instance.gameOver();
    }
}