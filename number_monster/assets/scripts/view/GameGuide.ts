// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//新手引导

import Ball from "./Ball";
import GameCtrl from "../controller/GameCtrl";
import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameGuide extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "手" })
    private hand: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "线" })
    private line: cc.Node = undefined;

    @property({ type: cc.Label, visible: true, displayName: "文字描述" })
    private describeLable: cc.Label = undefined;

    @property({ type: cc.Node, visible: true, displayName: "跳过按钮" })
    private jumpbtn: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "跳过按钮" })
    private continueBtn: cc.Node = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "手指图片" })
    private handSpr: Array<cc.SpriteFrame> = [];

    @property({ type: cc.Node, visible: true, displayName: "双击动画" })
    private doubleNode: cc.Node = undefined;

    /** 引导了几步 */
    private index: number = 0;

    /** 动画操作的球 */
    public ballOperate: Array<Ball> = [];

    /** 引导结束 */
    private endFlag: boolean = false;

    private strArr: Array<string> = [
        '欢迎来到数字精灵的世界~\n让我们了解下游戏的基本规则吧。',
        '如果两个数字相加的结果是10，合成就会消失，并且获得积分奖励。',
        '我们还可以连续合成数字球，先试试用数字2和数字2合成。',
        '然后用数字4和数字6合成，\n就可以合成10啦~',
        '6和7相加不等于10！\n我们可以通过双击数字球进行拆数~',
        '数字6拆成了两个数字3!\n我们用其中一个数字3和数字7合成吧~',
        '游戏规则就是这么简单，\n让我们开始游戏吧~'
    ]

    start() {
        this.jumpbtn.on("click", () => {
            RootNode.instance.gameLog.recordAction("skipGuide");
            this.guideEnd();
        })

        this.continueBtn.on("click", () => {
            this.continue();
        })

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            if (GameCtrl.instance.slectBall == undefined)
                return;
            let pos = this.node.convertToNodeSpaceAR(e.getLocation());
            GameCtrl.instance.slectBall.movePos(pos);
        });

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.continueBtn.active)
                return;
            this.continue();
        })

        this.hand.zIndex = 10;
        this.line.zIndex = 10;
        this.doubleNode.zIndex = 8;
        this.doubleNode.active = false;
        this.continueBtn.active = false;
    }

    update() {
        //当点击了球时,手指动画隐藏
        if (GameCtrl.instance.slectBall) {
            this.hand.opacity = 0;
            this.line.opacity = 0;

            //操作球可以动
            this.operateStatic(false);
        }
    }

    /**
     * 引导初始化
     */
    public init() {
        this.node.opacity = 0;
        this.describeLable.string = '';
        let callback = () => {
            this.node.opacity = 255;
            GameCtrl.instance.maskPanl.opacity = 125;
            this.setDescribe(0);
            this.continueBtn.active = true;
            //新手引导已经触发
            RootNode.instance.setNewPlayer();
        }
        //等待三秒是考虑球的下落
        this.scheduleOnce(callback, 3);
    }

    /** 
     * 下一步引导 (合成和双击触发)
     * @param delay 延迟时间
     */
    public async nextGuide(delay: number = 0.5) {
        this.typeResume();
        this.describeLable.node.parent.opacity = 0;
        if (this.index == 2)
            delay = 0.8;
        let callback = () => {
            this.guide();
        }
        this.scheduleOnce(callback, delay);
    }

    /**
     * 第几步
     */
    public get Index() {
        return this.index;
    }

    /**
    * 引导结束
    */
    public guideEnd() {
        //终止所有回调
        this.unscheduleAllCallbacks();

        this.endFlag = true;

        //把所有球回收
        let nodes = this.node.children;
        for (let i = 0; i < nodes.length; i++) {
            let ball = nodes[i].getComponent(Ball);
            if (ball)
                GameCtrl.instance.creatBall.ballRecovery(ball);
        }

        //清空游戏面板所有球
        GameCtrl.instance.guideEnd();
        this.node.removeFromParent();
    }

    /**
     * 开始下一步引导前状态回置
     */
    private typeResume() {
        this.unscheduleAllCallbacks();
        this.hand.scale = 1;
        this.hand.opacity = 0;
        this.line.opacity = 0;

        //操作球清空
        this.ballOperate = [];
    }

    /**
     * 引导
     */
    private guide() {
        this.index++;
        switch (this.index) {
            case 1:
                this.setDescribe(1);
                this.getBallFromGame([5, 5]);
                this.guideAdd([5, 5]);
                break;
            case 2:
                this.setDescribe(2);
                this.getBallFromGame([2, 2, 6])
                this.guideAdd([2, 2]);
                break;
            case 3:
                this.setDescribe(3);
                this.guideAdd([4, 6]);
                break;
            case 4:
                this.creatBall();
                break;
            case 5:
                this.setDescribe(4);
                this.getBallFromGame([7, 6])
                this.guideDoubleClick();
                break;
            case 6:
                this.setDescribe(5);
                this.guideAdd([3, 7]);
                break;
            case 7:
                let arr = this.getBallNode([3]);
                arr[0].parent = GameCtrl.instance.gamePanl;
                this.continueBtn.active = true;
                this.setDescribe(6);
                break;
        }
    }

    /**
     * 设置描述文字
     * @param num 文本序号
     */
    private setDescribe(num: number) {
        let node = this.describeLable.node.parent;
        node.runAction(cc.fadeIn(0.1));

        //打印机方式显示文字
        let arr = this.strArr[num].split('')
        let length = arr.length;
        let str = '';
        let step = 0;
        let callback = () => {
            str += arr[step];
            this.describeLable.string = str;
            if (++step == length)
                this.unschedule(callback);
        }
        this.schedule(callback, 0.05)
    }

    /**
     * 生成新球
     */
    private creatBall() {
        GameCtrl.instance.maskPanl.opacity = 127;
        //生成数字6
        let node = GameCtrl.instance.creatBall.creatBallForPos(6, new cc.Vec2(200, 700));
        let ball = node.getComponent(Ball);
        ball.speed = new cc.Vec2(0, 300);
        let callback = () => {
            //生成球掉下接近底部,到下一步
            if (node.position.y < -400) {
                this.nextGuide();
                this.unschedule(callback);
            }
        }

        this.schedule(callback, 0.1);
    }

    /**
     * 引导双击
     */
    private guideDoubleClick() {
        let arr = this.getBallNode([6]);
        this.ballOperate = [arr[0].getComponent(Ball)];
        this.hand.getComponent(cc.Sprite).spriteFrame = this.handSpr[0];
        let callback = () => {
            if (this.endFlag || GameCtrl.instance.slectBall)
                return;
            arr[0].zIndex = 0;
            let pos = arr[0].position;

            //操作球不能移动
            this.operateStatic(true);
            this.doubleClick(pos);
        }
        this.schedule(callback, 3, cc.macro.REPEAT_FOREVER, 0.1);
    }

    /**
     * 双击动画
     */
    private doubleClick(pos: cc.Vec2) {
        this.hand.stopAllActions();
        this.hand.opacity = 255;
        pos.y = pos.y - 10;
        this.hand.position = pos;
        this.doubleNode.position = pos;
        let action = cc.sequence([
            cc.scaleTo(0.3, 1.1),
            cc.scaleTo(0.3, 0.9),
            cc.callFunc(() => {
                this.playAni(this.doubleNode);
            }),
            cc.scaleTo(0.3, 1.1),
            cc.scaleTo(0.3, 0.9),
            cc.callFunc(() => {
                this.playAni(this.doubleNode);
            }),
            cc.scaleTo(0.3, 1),
            cc.callFunc(() => {
                this.hand.opacity = 0;
            })
        ])
        this.hand.runAction(action);
    }

    /**
     * 播放动画
     */
    private playAni(node: cc.Node) {
        node.active = true;
        let anim = node.getComponent(cc.Animation);
        anim.play();
    }

    /**
     * 从游戏面板获取球
     * @param arr 获取球的数组
     */
    private getBallFromGame(arr: Array<number>) {
        //游戏面板上的球
        let arrBall = GameCtrl.instance.getGamePanelBall();
        for (let i = 0; i < arrBall.length; i++) {
            let ballNum = arrBall[i].ballNum;
            let index = arr.indexOf(ballNum);
            if (index != -1) {
                arr.splice(index, 1);
                let node = arrBall[i].node;
                node.parent = this.node;
                node.zIndex = 0;
            }
        }
    }

    /**
     * 从引导面板获取球(为了简化判断,取球做了两步)
     * @param arr 获取球的数组
     */
    private getBallNode(arr: Array<number>): Array<cc.Node> {
        let nodeArr = [];
        let nodes = this.node.children;
        for (let i = 0; i < nodes.length; i++) {
            if (!nodes[i].active)
                continue;
            let ball = nodes[i].getComponent(Ball);
            if (ball) {
                let index = arr.indexOf(ball.ballNum)
                if (index != -1) {
                    arr.splice(index, 1);
                    nodeArr.push(ball.node);
                }
            }
        }
        return nodeArr;
    }

    /**
     * 引导数字相加
     * @param numArr 操作的数字
     */
    private guideAdd(numArr: Array<number>) {
        //需要操作的两个球
        let arr = this.getBallNode(numArr);

        //设置操作球
        for (let i = 0; i < arr.length; i++) {
            let ball = arr[i].getComponent(Ball);
            this.ballOperate.push(ball);
        }

        arr.sort(this.ballSore);
        let callback = () => {
            if (this.endFlag || GameCtrl.instance.slectBall)
                return;

            //操作球不能移动
            this.operateStatic(true);
            this.handMove(arr);
        }

        this.schedule(callback, 2, cc.macro.REPEAT_FOREVER, 0.1);
    }

    /**
     * 滑动合成动画
     * @param arr 操作球数组
     */
    private handMove(arr: Array<cc.Node>) {
        //节点为空
        if (arr[0] == undefined || arr[1] == undefined)
            return;

        let start = arr[0].position;
        let end = arr[1].position;

        arr[0].zIndex = 0;
        arr[1].zIndex = 0;

        //滑动起始在球心下移10个像素
        start.y -= 10;
        end.y -= 10;

        //手和线的动作停止
        this.hand.stopAllActions();
        this.line.stopAllActions();

        this.hand.opacity = 255;
        this.line.opacity = 255;

        //手指滑动
        this.hand.position = start;
        this.hand.opacity = 255;
        let sprite = this.hand.getComponent(cc.Sprite);
        sprite.spriteFrame = this.handSpr[0];
        this.hand.scale = 1.2;
        let handAct = cc.sequence([
            cc.scaleTo(0.2, 1),
            cc.callFunc(() => {
                sprite.spriteFrame = this.handSpr[1];
            }),
            cc.moveTo(1, end),
            cc.callFunc(() => {
                this.hand.opacity = 0;
            })
        ])
        this.hand.runAction(handAct);

        //线
        this.line.position = start;
        let lineVec = end.sub(start);
        let length = lineVec.mag();
        let d = new cc.Vec2(1, 0);
        let lineAngle = lineVec.signAngle(d);
        this.line.scaleX = 0;
        this.line.width = length;
        this.line.rotation = lineAngle * 180 / Math.PI;

        let lineAct = cc.sequence([
            cc.delayTime(0.2),
            cc.scaleTo(1, 1),
            cc.callFunc(() => {
                this.line.opacity = 0;
            })
        ])
        this.line.runAction(lineAct);
    }

    /**
     * 排序,为了手指都是从左往右滑
     * @param a 
     * @param b 
     */
    private ballSore(a: cc.Node, b: cc.Node) {
        let ballA = a.getComponent(Ball);
        let ballB = b.getComponent(Ball);
        if (ballA.ballNum == ballB.ballNum)
            return a.position.x - b.position.x;
        return ballA.ballNum - ballB.ballNum;
    }

    /**
     * 点击继续
     */
    private continue() {
        this.continueBtn.active = false;
        if (this.index == 0)
            this.nextGuide();
        else
            this.guideEnd();
    }

    /**
     * 设置操作球是否禁止
     * @param enable 是否禁止
     */
    private operateStatic(enable: boolean) {
        for (let i = 0; i < this.ballOperate.length; i++) {
            this.ballOperate[i].ballStatic = enable;
        }
    }
}