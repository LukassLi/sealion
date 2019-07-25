// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

// 球类

import { ballsize, ballScale, ColliderType, ballHighLightWidth, EyeState, ballRestitution, ballFriction, ballAngularDamping } from "../GameConfig";

import GameCtrl from "../controller/GameCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Ball extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "底" })
    private bottomNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "球节点" })
    public ballNode: cc.Node = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "眼睛图片" })
    public eyeSpriteFrameArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.Sprite], visible: true, displayName: "眼睛" })
    public eyeSpriteArr: Array<cc.Sprite> = [];

    /** 球的数字*/
    public ballNum: number = undefined;

    /** 是否为疯狂模式的5 */
    public crazyBall: boolean = false;

    /** 最大倾斜角度 */
    private limitAngle = 15;

    /** 刚体 */
    private _rigid: cc.RigidBody = undefined;

    /** 碰撞组件 */
    private _collider: cc.PhysicsCollider = undefined;

    /** 点击次数用于检测双击 */
    private hold_one_click = 0;

    /** 球的尺寸 */
    private nodeSize: cc.Vec2 = undefined;

    /**11-14 不规则碰撞组件的点*/
    private colliderPoints: Array<cc.Vec2> = [];

    /** 圆底部阴影 */
    private shadowNode: cc.Node = undefined;

    /** 是否被选中 */
    private _slect = false;

    /** 手指触碰点与球心的位置 */
    private subPos: cc.Vec2 = undefined;

    /** 移动结束位置 */
    private moveEnd: cc.Vec2 = undefined;

    /** 移动时移出球 */
    private moveOut: boolean = false;

    /** 眼睛的状态 */
    private eyeState: EyeState = undefined;

    /** 大于10的球的数目 */
    private static bigThanTenNum: number = 0;

    /** 是否被回收 */
    private isResume: boolean = false;


    start() {
        this.addEventListener();
        this.shadowNode = this.ballNode.getChildByName("shadow");
        this.shadowNode.opacity = 255;
    }

    update(dt: number) {
        if (this.node.rotation > this.limitAngle)
            this.node.rotation = this.limitAngle;
        else if (this.rigid.node.rotation < -this.limitAngle)
            this.node.rotation = -this.limitAngle;
        this.move(dt);
    }

    /**
     * 只在两个碰撞体开始接触时被调用一次
     * @param contact 
     * @param selfCollider 自己的碰撞体
     * @param otherCollider 发生碰撞的碰撞体
     */
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.tag == ColliderType.Normal)
            this.judegeBlink();
    }

    public set ballStatic(enabled: boolean) {
        if (enabled) {
            this.rigid.type = cc.RigidBodyType.Static;
            this.speed = cc.Vec2.ZERO;
        } else {
            this.rigid.type = cc.RigidBodyType.Dynamic;
        }

    }

    /**
     * 球的刚体组件
     */
    public get rigid() {
        if (this._rigid == undefined) {
            this._rigid = this.node.getComponent(cc.RigidBody);
            this._rigid.angularDamping = ballAngularDamping;
        }
        return this._rigid;
    }

    /**
     * 碰撞组件
     */
    public get collider() {
        if (this._collider == undefined) {
            this._collider = this.node.getComponent(cc.PhysicsCollider);
            this._collider.restitution = ballRestitution;
            this._collider.friction = ballFriction;
        }
        return this._collider;
    }

    /**
     * 设置触发状态,底高亮
     */
    public set setTrigger(enabled: boolean) {
        this.bottomNode.opacity = enabled ? 255 : 0;
        this.shadowNode.opacity = enabled ? 0 : 255;
    }

    /**
     * 更新手指最新位置
     * @param touchPos 移动点的位置
     */
    public movePos(touchPos: cc.Vec2) {
        let flag = cc.Intersection.pointInPolygon(touchPos, GameCtrl.instance.bottomPoints);
        //是否超出可移动区域
        if (flag || Math.abs(touchPos.x) > 360) {
            //超出的第一个点保留,球才能移动到目标位置
            if (!this.moveOut) {
                this.moveEnd = touchPos;
                this.moveOut = true;
            }
            return;
        }

        //未赋值和超出状态移入,重新计算值
        if (this.subPos == undefined || this.moveOut) {
            this.subPos = touchPos.sub(this.node.position);
            if (this.judgePosOut(this.subPos)) {
                this.subPos = undefined;
                this.speed = cc.Vec2.ZERO;
                return;
            }
            this.moveOut = false;
        }

        this.moveEnd = touchPos;
        this.updateTriggerBall();
    }

    /**
     * 选中后移动
     * @param dt 时间
     */
    public move(dt: number) {
        if (this._slect && this.subPos != undefined) {
            let pos = this.subPos.add(this.node.position);
            let speed = this.moveEnd.sub(pos);
            speed.mulSelf(1 / dt);
            this.speed = speed;
        }
    }

    /**
     * 设置球的数字,第一次设置的时候设置大小
     * @param num 球的数字
     */
    public setNum(num: number) {
        //16为疯狂小五
        if (num == 16) {
            this.crazyBall = true;
            num = 5;
        }

        if (num > 10) {
            Ball.bigThanTenNum++;
            cc.PhysicsManager.POSITION_ITERATIONS = 50;
            this.addDoubleClick();
        }

        if (this.ballNum != undefined)
            return;
        this.setSize(num);
        this.ballNum = num;
    }

    /**
    * 设置眼睛打开还是关闭
    * @param state 眼睛状态
    */
    public setEyeState(state: EyeState) {
        if (this.eyeState == state)
            return;
        this.rigid.enabledContactListener = false;
        this.eyeState = state;
        let spriteFrame = this.eyeSpriteFrameArr[state];
        for (let i = 0; i < this.eyeSpriteArr.length; i++) {
            this.eyeSpriteArr[i].spriteFrame = spriteFrame;
        }

        //游戏结束,去掉所有监听
        if (state == EyeState.die) {
            this.node.targetOff(this);

            //停止双击检测
            this.hold_one_click = 0;
        }
    }

    /** 恢复原始状态 */
    public resume() {
        this.isResume = true;
        this.setSlect = false;
        this.setTrigger = false;
        this.node.stopAllActions();
        this.setEyeState(EyeState.open);
        this.node.opacity = 255;
        this.node.active = false;
        this.rigid.active = true;
        this.hold_one_click = 0;
        this.unscheduleAllCallbacks();
        this.rigid.enabledContactListener = true;

        //重置回收状态
        this.isResume = false;

        //大球直接删除
        if (this.ballNum > 10) {
            Ball.bigThanTenNum--;
            if (Ball.bigThanTenNum == 0) {
                cc.PhysicsManager.POSITION_ITERATIONS = 20;
            }
            this.node.removeFromParent(true);
            return;
        }
        //游戏结束,停止了所有监听,重新监听
        if (!this.node.hasEventListener(cc.Node.EventType.TOUCH_START))
            this.addEventListener();
    }

    /**
     * 监听点击事件
     */
    private addEventListener() {
        this.node.on(cc.Node.EventType.TOUCH_START, (e) => {
            //缩放状态不检测选中
            if (this.node.scale != 1)
                return;

            this.onTouchStart(e);
        }, this)

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.setSlect = false;
            this.hold_one_click = 0;
        }, this)

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            //点击结束触发了触发球,应该不触发双击(0.5有可能触发合并有触发双击)
            if (GameCtrl.instance.triggerBall != undefined)
                this.hold_one_click = 0;

            this.setSlect = false;

            //缩放状态不检测双击
            if (this.node.scale != 1)
                return;

            //不检测双击
            if (this.crazyBall)
                return;
            this.hold_one_click++;

            //点击0.5秒后清0
            let callback = () => {
                this.hold_one_click = 0;
            }
            this.scheduleOnce(callback, 0.5);

            //判断双击
            if (this.hold_one_click > 1 && this.ballNum != 1)
                GameCtrl.instance.ballsCtr.ballDoubleClick(this);
        }, this)
    }

    /**
     * 设置速度
     */
    public set speed(v: cc.Vec2) {
        this.rigid.linearVelocity = v;
    }

    /**
     * 延迟设置速度
     * @param v 速度
     * @param delayTime 延迟时间 
     */
    public speedDelay(v: cc.Vec2, delayTime: number = 0) {
        let callback = () => {
            this.speed = v;
        }
        this.scheduleOnce(callback, delayTime);
    }

    /**
     * 获取速度
     */
    public get speed() {
        return this.rigid.linearVelocity;
    }

    /**
     * 判断点是否在球的范围内
     * @param pos 判断点
     */
    private judgePosOut(pos: cc.Vec2): boolean {
        let arr = this.colliderPoints;
        if (arr.length > 0) {
            let flag = cc.Intersection.pointInPolygon(pos, arr);
            if (!flag) {
                return true;
            }
        }
        if (pos.mag() > this.nodeSize.x / 2) {
            return true;
        }
        return false;
    }

    /**
     * 设置点击选中,可以移动
     */
    private set setSlect(enabled: boolean) {
        if (this._slect == enabled)
            return;
        this._slect = enabled;
        if (enabled) {
            this.rigid.gravityScale = 0;
            this.rigid.linearVelocity = cc.Vec2.ZERO;
            this.ballNode.opacity = 127;
            this.group = "touch";
            GameCtrl.instance.slectBall = this;
            GameCtrl.instance.triggerBall = undefined;
            this.setEyeState(EyeState.close);
            this.collider.tag = ColliderType.Slect;
        } else {
            this.rigid.enabledContactListener = true;
            this.subPos = undefined;
            this.rigid.gravityScale = 1;
            this.rigid.linearVelocity = new cc.Vec2(0, 1);
            this.group = "ball";
            this.ballNode.opacity = 255;

            //没有被回收,才触发touch
            if (!this.isResume)
                GameCtrl.instance.ballsCtr.touchEnd();
            GameCtrl.instance.slectBall = undefined;
            this.setEyeState(EyeState.open);
        }
        this.setIndex(enabled);
        this.collider.apply();
    }

    /**
     * 设置层级
     * @param slect 是否选中
     */
    private setIndex(slect: boolean) {
        this.node.zIndex = slect ? 1 : 0;
    }

    /**
     * 设置球的状态,选中时不能旋转,可以碰撞的物体变动
     */
    private set group(str: string) {
        this.node.group = str;
        this.rigid.fixedRotation = str == "touch";
    }

    /**
     * 根据数字,根据配置设置球大小信息
     * @param num 球的数字
     */
    private setSize(num: number) {
        let scal = ballScale[num - 1];
        let size = ballsize[num - 1].clone();
        size.x *= scal;
        size.y *= scal;
        this.nodeSize = size;
        this.ballNode.scale = scal;
        this.group = "ball";
        let width = ballHighLightWidth;
        this.setBottom();
        let collider = undefined;
        if (num < 10 || num == 15 || num == 16) {
            collider = this.node.getComponent(cc.PhysicsCircleCollider);

            //碰撞体的边缘离球是高亮的一半
            collider.radius = size.x / 2 + width / 2;
        } else if (num < 15) {
            collider = this.node.getComponent(cc.PhysicsPolygonCollider);
            this.colliderPoints = collider.points;
            this.adjustPolygonColliderPoint(scal);
            collider.points = this.colliderPoints;
        }
        collider.apply();
    }

    /** 设置底部高亮 */
    private setBottom() {
        /** 边距是上下 左右所以是两倍 */
        let width = ballHighLightWidth * 2;
        this.bottomNode.setContentSize(this.nodeSize.x + width, this.nodeSize.y + width);
        this.bottomNode.opacity = 0;
        this.bottomNode.color = new cc.Color(255, 249, 205);
    }

    /**
     * 调整不规则球的碰撞边缘点
     * @param scal 配置的缩放
     */
    private adjustPolygonColliderPoint(scal: number) {
        let width = ballHighLightWidth;
        let size = this.nodeSize.clone();
        //球的原始大小
        size.mulSelf(1 / scal);

        //设计的尺寸加上高亮的一半
        let change = (this.nodeSize.x + width) / size.x;
        let length = this.colliderPoints.length;
        for (let i = 0; i < length; i++)
            this.colliderPoints[i] = this.colliderPoints[i].mulSelf(change);
    }

    /**
     * 掉落时眨眼动画,30会帧率 4 5为隔了几帧
     */
    private blink() {
        this.collider.tag = ColliderType.Normal;
        this.node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    if (this.eyeState != EyeState.die)
                        this.setEyeState(EyeState.close);
                }),
                cc.delayTime(5 / 30),
                cc.callFunc(() => {
                    if (this.eyeState != EyeState.die)
                        this.setEyeState(EyeState.open);
                })
            )
        )
    }

    /**
     * 点击触摸处理
     * @param touch 点击事件
     */
    private onTouchStart(touch: cc.Event.EventTouch) {
        if (GameCtrl.instance.slectBall != undefined)
            return;
        let pos = this.node.convertToNodeSpaceAR(touch.getLocation());
        if (!this.judgePosOut(pos)) {
            this.setSlect = true;
        }
    }

    /**
     * 移动选中球后,判断触发球是否改变
     */
    private updateTriggerBall() {

        //大球暂时不检测触发
        if (this.ballNum > 10) {
            GameCtrl.instance.triggerBall = undefined;
            return;
        }

        let speed = this.rigid.linearVelocity;

        //双击bug,当速度太低,视为无效拖动
        if (speed.mag() < 10)
            return;
        let ball = this.getTriggerBall();
        let triggerBall = GameCtrl.instance.triggerBall;
        if (triggerBall) {
            if (triggerBall == ball)
                return;
        }
        GameCtrl.instance.triggerBall = ball;
    }

    /**
     * 获取选中球中心触发的球
     */
    private getTriggerBall(): Ball {
        //节点销毁
        if (this.node == undefined)
            return undefined;

        let ballArr = GameCtrl.instance.getGamePanelBall();

        //如果是引导下触发的球只有一个
        if (GameCtrl.instance.guide) {
            ballArr = GameCtrl.instance.guide.ballOperate;

            //引导模式下,移动球也需要是触发球
            if (ballArr.indexOf(this) == -1)
                return undefined;
        }
        let length = ballArr.length;

        //手指位置获取的理论球位置
        let ballForFinger = this.moveEnd.sub(this.subPos);

        //遍历界面上的所有球判断有没有触发的
        for (let i = 0; i < length; i++) {
            let ball = ballArr[i];

            //为自己,判断球为undefined或者判断球节点销毁
            if (this == ball || ball == undefined || ball.node == undefined)
                continue;

            //手指获取理论球位置
            let subPosForfinger = ballForFinger.sub(ball.node.position);
            let flagForfinger = ball.judgePosOut(subPosForfinger);

            //实际球位置判断
            let subPos = this.node.position.sub(ball.node.position);
            let flag = ball.judgePosOut(subPos);

            //两个判断有一个生效,就默认触发
            if (!flagForfinger || !flag)
                return ball;
        }
        return undefined;
    }

    /**
     * 判断是否眨眼
     */
    private judegeBlink() {
        if (GameCtrl.instance.slectBall == this)
            return;
        if (this.collider.tag == ColliderType.Birth || this.collider.tag == ColliderType.Slect)
            this.blink();
    }

    /**
     * 大于11 添加双击特效
     */
    private addDoubleClick() {
        let node = cc.instantiate(GameCtrl.instance.balldoubleClick);
        node.parent = this.node;
        node.position = cc.Vec2.ZERO;
        node.scale = 1;
    }
}