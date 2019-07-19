// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

// 游戏逻辑控制

// import CreatBall from "./CreatBall";
import GameConfig, { EyeState } from "../GameConfig";
// import GameView from "../view/GameView";
// import MySound, { AudioType } from "../MySound";
import RootNode from "../RootNode";
import { DebugSettings } from "../util/DebugSettings";
import Ball from "../view/Ball";
import GameView from "../view/GameView";
import BallsCtrl from "./BallsCtrl";
import CreatBall from "./CreateBall";
// import GameGuide from "../view/GameGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtrl extends GameView {
    /**
     * 加分
     */
    public set addScore(num: number) {
        this._score += num;

        // 疯狂模式不需要更新这些
        if (!this.crazy) {
            if (this._score > this.speedUpdateTarget) {
                this.updateCreatRate();
            }
            if (this._score > this.oddsUpdateTarget) {
                this.updateballOdds();
            }
            if (this._score > this.gravityUpdateTarget) {
                this.updateGravity();
            }
            this.updateCreazy();
        }

        // 展示分数
        const scoreDisplay = cc.sequence([
            cc.delayTime(1),
            cc.callFunc(() => {
                this.scoreLable.string = this._score.toString();
            }),
        ]);
        this.node.runAction(scoreDisplay);
    }

    /**
     * 获取分数
     */
    public get Score() {
        return this._score;
    }

    public set physicsManagerEnable(enabled: boolean) {
        if (this.physicsManager.enabled == enabled) {
            return;
        }
        this.physicsManager.enabled = enabled;
    }

    /**
     * 设置触发球
     */
    public set triggerBall(ball: Ball) {
        if (this._triggerBall) {
            this._triggerBall.setTrigger = false;
        }
        if (ball) {
            ball.setTrigger = true;
        }
        this._triggerBall = ball;
    }

    /**
     * 获取触发球
     */
    public get triggerBall() {
        return this._triggerBall;
    }

    /**
     * 游戏暂停
     */
    public set pause(flag: boolean) {
        // MySound.instance.playAudio(AudioType.Button);
        this.physicsManager.enabled = !flag;
        this.pauseFlag = flag;
        this.pauseNode.active = flag;
        this.creatBall.pause = flag;

        // RootNode.instance.gameLog.recordAction("pause");
        // 疯狂模式倒计时中,暂停继续倒计时
        if (this.crazyProgressNode.active) {
            const bar = this.crazyProgressNode.children[0];
            if (flag) {
                bar.pauseAllActions();
            } else {
                bar.resumeAllActions();
            }
        }
    }

    /**
     * 查看群排行暂停
     */
    public set groupPause(flag: boolean) {
        // 如果是游戏结束和暂停状态不需要暂停游戏
        if (this.maskPanl.active || this.pauseNode.active) {
            return;
        }
        this.physicsManager.enabled = !flag;
        this.pauseFlag = flag;
        this.creatBall.pause = flag;
    }

    /**
     * 获取是否是疯狂模式
     */
    public get crazy() {
        return this.crazyFlag;
    }

    /**
     * 设置疯狂模式
     */
    public set crazy(flag: boolean) {
        this.crazyFlag = flag;
        this.creatBall.stopCreat();
        if (flag) {
            this.initCreazy();
        } else {
            this.creazyCutout();
        }

        const str = flag ? "crazy_start" : "crazy_end";
        // RootNode.instance.gameLog.recordAction(str);
    }

    /**
     * 获取是否暂停
     */
    public get pause() {
        return this.pauseFlag;
    }
    public static instance: GameCtrl = undefined;

    /** 疯狂模式combo 加的分 */
    public crazyComboAdd: number = 50;

    /** 点击选中的球 */
    public slectBall: Ball = undefined;

    /** 球操作控制函数 */
    public ballsCtrl: BallsCtrl = undefined;

    /** 底部多边形碰撞组件点数组 */
    public bottomPoints: cc.Vec2[] = [];

    /** 每一局可以复活的次数 */
    public revivalTime = 1;

    /** 物理引擎 */
    public physicsManager: cc.PhysicsManager = undefined;

    /** 引导 */
    // public guide: GameGuide = undefined;

    /** 得分 */
    private _score: number = 0;

    /** 下一个速度段的分数值 */
    private speedUpdateTarget: number = undefined;

    /** 下一个概率段的分数值 */
    private oddsUpdateTarget: number = undefined;

    /** 下一个重力段的分数值 */
    private gravityUpdateTarget: number = undefined;

    /** 触发疯狂模式分数值 */
    private _crazyTarget: number = 0;

    /** 疯狂模式持续时间 */
    private crazyDuration: number = undefined;

    /** 拖动球触发的球*/
    private _triggerBall: Ball = undefined;

    /** 暂停 */
    private pauseFlag: boolean = false;

    /** 疯狂模式 */
    private crazyFlag: boolean = false;

    private _touchPos: cc.Vec2 = undefined;

    private _onTouchMove: boolean = false;

    public onLoad() {
        GameCtrl.instance = this;

        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;

        this.physicsManager = cc.director.getPhysicsManager();
        this.physicsManager.enabled = true;
        cc.PhysicsManager.POSITION_ITERATIONS = 20;
    }

    public start() {
        this.ballsCtrl = BallsCtrl.getInstance();

        // 挂上生成球的脚本
        this.creatBall = this.node.addComponent(CreatBall);

        this.gameInit();

        this.addEventListener();
        // this.pointsTransformationGamePanel();
        // this.ballboom.zIndex = cc.macro.MAX_ZINDEX;

        // 暂停面板在动画层上面
        // this.pauseNode.zIndex = this.pauseNode.zIndex + 10;

        // MySound.instance.playAudio(AudioType.GameEnter);
        // let action = cc.sequence([
        //     cc.delayTime(0.3),
        //     cc.callFunc(() => {
        //         this.gameInit();
        //     })
        // ])
        // this.node.runAction(action);

        return;
        this.playAnimation(this.cloudPrefab);

        // 进入游戏,开始操作记录
        // RootNode.instance.gameLog.startRecorder();

        // //如果有新手引导拉起遮罩
        // if (RootNode.instance.newPlayer) {
        //     this.maskPanl.active = true;
        //     this.maskPanl.opacity = 1;
        // }

        this.updateRevivalTime();
    }

    public update() {
       
    }

    /**
     * 暂停
     */
    public pauseButton() {
        this.pause = true;
    }

    /**
     * 返回首界面
     */
    public HomeButton() {
        // 返回首界面发送操作日志
        // RootNode.instance.gameLog.sendAction();

        // MySound.instance.playAudio(AudioType.Button);
        RootNode.instance.loadScene("home");
    }

    /**
     * 疯狂模式延迟设置
     * @param flag 是否疯狂模式
     * @param delay 延迟时间
     */
    public crazyDelay(flag: boolean, delay: number = 0) {
        const callback = () => {
            this.crazy = flag;
        };
        this.scheduleOnce(callback, delay);
    }

    /**
     * 游戏继续
     */
    public continue() {
        this.pause = false;
    }

    /**
     * 重玩
     */
    public replay() {
        // MySound.instance.playAudio(AudioType.Button);
        this._score = 0;
        this.updateRevivalTime();

        // 如果有新手引导结束新手引导
        // if (this.guide)
        //     this.guide.guideEnd();
        // else {
        this.clearBall();
        this.gameInit();
        // }

        // this.revival.close();
        this.pause = false;
        // this.gameFinish.open(false);
        this.physicsManager.enabled = true;
    }

    /**
     * 游戏结束,有复活次数弹复活
     * @param delayTime 结束页出现时间
     */
    public gameOver(delayTime: number = 0) {
        this.topStrip.stopJudgment();
        this.creatBall.stopCreat();
        // this.setballDie();
        this.physicsManager.enabled = false;
        this.maskFadeIn();
        const seq = cc.sequence([
            cc.delayTime(delayTime),
            cc.callFunc(() => {
                // if (this.revivalTime > 0)
                //     this.revival.open();
                // else
                // this.gameFinish.open(true);
            }),
        ]);
        this.node.runAction(seq);
    }

    /**
     * 获取游戏面板的球
     */
    public getGamePanelBall(): Ball[] {
        const nodes = this.gamePanl.children;
        const balls = [];
        for (let i = 0; i < nodes.length; i++) {
            if (!nodes[i].active) {
                continue;
            }
            const ball = nodes[i].getComponent(Ball);
            if (ball) {
                balls.push(ball);
            }
        }
        return balls;
    }

    /**
     * 复活初始化
     */
    public revivalInit() {
        // 复活动画
        this.playAnimation(this.revivalePrefab);
        // MySound.instance.playAudio(AudioType.PlayAgain);
        const action = cc.sequence(
            // 7帧最亮的时候,清理球
            cc.delayTime(11 / 30),
            cc.callFunc(() => {
                this.clearBall();
            }),

            // 切换动画播放后,正常游戏
            cc.delayTime(19 / 30),
            cc.callFunc(() => {
                this.gameInit();
                this.physicsManager.enabled = true;
            }),
        );
        this.node.runAction(action);
    }

    /**
     * 新手引导结束,初始化游戏
     */
    public guideEnd() {
        this.maskPanl.active = false;
        this.clearBall();
        this.creatBall.initCreat();
        // this.guide = undefined;
        this.physicsManagerEnable = true;
    }

    /**
     * 遮罩渐显
     */
    private maskFadeIn() {
        this.maskPanl.active = true;
        this.maskPanl.opacity = 0;
        const action = cc.fadeTo(1.5, 127);
        this.maskPanl.runAction(action);
    }

    /**
     * 底部碰撞体点坐标转换到游戏面板
     */
    private pointsTransformationGamePanel() {
        const arr = this.bottomCollider.points;
        const pos = this.bottomCollider.node.position;
        for (let i = 0; i < arr.length; i++) {
            const point = arr[i].clone();
            point.addSelf(pos);
            this.bottomPoints.push(point);
        }
    }

    /**
     * 监听手指移动
     */
    private addEventListener() {
        this.gamePanl.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (DebugSettings.debugEvent) {
                console.log("touch start on gamepanel");
            }
        });

        this.gamePanl.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            if (DebugSettings.debugEvent) {
                console.log("touch move on gamepanel");
            }
            const touch = e as cc.Event.EventTouch;
            const pos = this.knifeStage.convertToNodeSpaceAR(touch.getLocation());
            this.knife.move(pos);
            const balls = this.creatBall.stageBalls;
            for (let i = 0; i < balls.length; i++) {
                const ball = balls[i];
                const radius = ball.getComponent(cc.CircleCollider).radius;
                const pos = this.ballStage.convertToNodeSpaceAR(touch.getLocation());
                if (ball.position.sub(pos).mag() <= radius) {
                    this.ballsCtrl.splitBall(ball.getComponent(Ball));
                    ball.getComponent(Ball).remove();
                }
            }
        });

        this.gamePanl.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (DebugSettings.debugEvent) {
                console.log("touch end on gamepanel");
            }
            if (this.knife.node.active) {
                this.knife.node.active = false;
            }
        });
    }

    /**
     * 触碰移动处理
     * @param touch 触碰事件
     */
    private onTouchMove(touch: cc.Event.EventTouch) {
        if (this.slectBall == undefined) {
            return;
        }
        const pos = this.gamePanl.convertToNodeSpaceAR(touch.getLocation());
        this.slectBall.movePos(pos);
    }

    private onRayCast(p1, p2, type: cc.RayCastType) {
        const results = cc.director.getPhysicsManager().rayCast(p1, p2, type);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const collider = result.collider;
            const point = result.point;
            const normal = result.normal;
            const fraction = result.fraction;
        }
    }

    /**
     * 游戏初始化
     */
    private gameInit() {
        RootNode.instance.triggerGC();
        this._crazyTarget = 0;
        // this.creatBall.crazyTriggerScore = undefined;
        // this.updateCreazy();
        this.updateCreatRate();
        this.updateballOdds();
        this.updateGravity();
        this.isNewPlayer();
        return;
        this.ballsCtrl.reset(); // 连击重置
        this.scoreLable.string = this._score.toString();
        this.topStrip.endJudgment();
        this.isNewPlayer();
    }

    /**
     * 是否为新手
     */
    private isNewPlayer() {
        // 为新手开启新手引导
        // if (RootNode.instance.newPlayer) {
        //     this.creatBall.guideCreat();
        //     let node = cc.instantiate(this.guidePre);
        //     node.parent = this.maskPanl.parent;
        //     this.guide = node.getComponent(GameGuide);
        //     this.guide.init();
        // } else
        this.creatBall.initCreat();
    }

    /**
     * 根据分数更新球生成速度
     */
    private updateCreatRate() {
        const speedArr = GameConfig.getCreatInformation(this._score);
        this.speedUpdateTarget = speedArr[1];
        this.creatBall.creatRate = speedArr[0];
    }

    /**
     * 根据分数更新重力,用于控制下落速度
     */
    private updateGravity() {
        const grivityArr = GameConfig.getGravityInformation(this._score);
        this.gravityUpdateTarget = grivityArr[1];
        this.physicsManager.gravity = new cc.Vec2(0, -grivityArr[0]);
    }

    /**
     * 根据分数更新球生成的概率
     */
    private updateballOdds() {
        // 数组的第一个是当前的概率
        // 第二个是下一阶段的分数
        const oddsArr = GameConfig.getOddsInformation(this._score);
        this.oddsUpdateTarget = oddsArr[1];
        this.creatBall.updateOddsMap(oddsArr[0]);
    }

    /**
     * 根据分数进入Crazy模式
     */
    private updateCreazy() {
        // 生成球正在判断中,等判断结束,再更新
        if (this.creatBall.crazyTriggerScore != undefined) {
            return;
        }
        if (this._crazyTarget > this._score) {
            return;
        }
        const creazyArr = GameConfig.getCrazyInformation(this._score);
        this._crazyTarget = creazyArr[0];
        this.creatBall.crazyTriggerScore = creazyArr[0];

        // 解析值 20|50|20%|0.75|1250|1:4%,2:4%,3:4%,4:4%,5:80%,6:1%,7:1%,8:1%,9:1% 持续时间 合成得分 概率 重力 球生成概率
        const value = creazyArr[1].replace("%", "");
        const arr = value.split("|");
        this.crazyDuration = arr[0];
        this.creatBall.crazyTriggerOdds = arr[2] / 100;
    }

    /**
     * 疯狂模式初始化
     */
    private initCreazy() {
        // 进场动画
        this.playAnimation(this.crazyCutToPrefab);
        // MySound.instance.playAudio(AudioType.CrazyFive);
        const action = cc.sequence(
            // 7帧最亮的时候,清理球
            cc.delayTime(7 / 30),
            cc.callFunc(() => {
                this.clearBall();
                this.crazyUiChange();
            }),
            // 切换动画播放后,开始疯狂模式
            cc.delayTime(23 / 30),
            cc.callFunc(() => {
                this.creazyProgress();
                this.creazyCutIn();
            }),
        );
        this.node.runAction(action);
    }

    /**
     * 疯狂模式切入
     */
    private creazyCutIn() {
        // 解析值 20|50|20%|0.75|1250|1:4%,2:4%,3:4%,4:4%,5:80%,6:1%,7:1%,8:1%,9:1% 持续时间 合成得分 概率 重力 球生成概率
        const value = GameConfig.getcrazyInitValue(this.Score);
        const arr = value.split("|");
        this.crazyComboAdd = parseInt(arr[1]);
        this.creatBall.creatRate = Number(arr[3]);
        this.physicsManager.gravity = new cc.Vec2(0, -arr[4]);
        this.creatBall.updateOddsMap(arr[5]);
        this.creatBall.initCreat();
        this.topStrip.endJudgment();
    }

    /**
     * 疯狂模式退出
     */
    private creazyCutout() {
        // 疯狂模式结束,防止合球
        this.maskPanl.active = true;
        this.maskPanl.opacity = 1;

        // 停掉死亡检测
        this.topStrip.stopJudgment();
        this.playAnimation(this.crazyCutOutPrefab);
        this.crazyProgressNode.active = false;
        const action = cc.sequence(
            // 14帧最亮的时候,清理球
            cc.delayTime(14 / 30),
            cc.callFunc(() => {
                this.clearBall();
                this.creatBall.crazyPoolClear();
                this.crazyUiChange();
            }),

            // 切换动画播放后,正常游戏
            cc.delayTime(8 / 30),
            cc.callFunc(() => {
                this.maskPanl.active = false;
                this.gameInit();
                this.physicsManager.enabled = true;
            }),
        );
        this.node.runAction(action);
    }

    /**
     * 疯狂模式进度条
     */
    private creazyProgress() {
        const time = this.crazyDuration;
        this.crazyProgressNode.active = true;
        const bar = this.crazyProgressNode.children[0];
        const sprite = bar.getComponent(cc.Sprite);

        bar.stopAllActions();
        sprite.spriteFrame = this.barImArr[0];
        bar.scale = 1;
        const action = cc.sequence(
            cc.scaleTo(time * 0.75, 0.25, 1),
            cc.callFunc(() => {
                sprite.spriteFrame = this.barImArr[1];
            }),
            cc.scaleTo(time * 0.25, 0, 1),
            cc.callFunc(() => {
                this.crazyProgressNode.active = false;
                this.crazy = false;
            }),
        );
        bar.runAction(action);
    }

    /**
     * 疯狂模式切换,ui改变
     */
    private crazyUiChange() {
        const num = this.crazy ? 1 : 0;
        // 界面的设置
        this.gamePanl.getComponent(cc.Sprite).spriteFrame = this.gameBgImArr[num];
        this.topSprte.spriteFrame = this.topPauseImArr[num];
        this.bottomCollider.node.getComponent(cc.Sprite).spriteFrame = this.bottomImArr[num];
        this.bgFitSprite.spriteFrame = this.bgFitImArr[num];
        const topNode = this.topStrip.node;
        topNode.getComponent(cc.Sprite).spriteFrame = this.topImArr[num];

        const positionY = this.crazy ? 450 : 500;
        topNode.setPosition(0, positionY);

        // MySound.instance.setCrazyBgm(this.crazy);
    }

    // /**
    //  * 死亡闭眼
    //  */
    // private setballDie() {
    //     let childs = this.getGamePanelBall();
    //     let length = childs.length;
    //     for (let i = 0; i < length; i++) {
    //         let ball = childs[i];
    //         ball.setEyeState(EyeState.die);
    //     }
    // }

    /**
     * 界面上的球清理
     */
    private clearBall() {
        this.ballboom.active = false;
        const childs = this.getGamePanelBall();
        const length = childs.length;
        for (let i = 0; i < length; i++) {
            const ball = childs[i];
            this.creatBall.ballRecovery(ball);
        }
    }

    /**
     * 播放动画
     * @param prefab 带有动画的预制体
     * @param time 销毁时间为0就为动画时长
     */
    private playAnimation(prefab: cc.Prefab, time: number = 0): cc.Node {
        const node = cc.instantiate(prefab);
        node.parent = this.maskPanl.parent;
        // 层次在游戏层上面
        node.zIndex = 1;
        const animation = node.getComponent(cc.Animation);
        const animState = animation.play();
        time = time == 0 ? animState.duration : time;
        // 销毁
        this.scheduleOnce(() => {
            node.removeFromParent();
        }, time);
        return node;
    }

    private updateRevivalTime() {
        // if(this.revival.canRevival())
        //     this.revivalTime = 1;
        // else
        //     this.revivalTime = 0;
    }
}
