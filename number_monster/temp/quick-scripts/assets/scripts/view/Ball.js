(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/view/Ball.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '6f83ehiSXhCxLA+16WTSYj1', 'Ball', __filename);
// scripts/view/Ball.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
// 球类
var GameConfig_1 = require("../GameConfig");
var GameCtrl_1 = require("../controller/GameCtrl");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.bottomNode = undefined;
        _this.ballNode = undefined;
        _this.eyeSpriteFrameArr = [];
        _this.eyeSpriteArr = [];
        /** 球的数字*/
        _this.ballNum = undefined;
        /** 是否为疯狂模式的5 */
        _this.crazyBall = false;
        /** 最大倾斜角度 */
        _this.limitAngle = 15;
        /** 刚体 */
        _this._rigid = undefined;
        /** 碰撞组件 */
        _this._collider = undefined;
        /** 点击次数用于检测双击 */
        _this.hold_one_click = 0;
        /** 球的尺寸 */
        _this.nodeSize = undefined;
        /**11-14 不规则碰撞组件的点*/
        _this.colliderPoints = [];
        /** 圆底部阴影 */
        _this.shadowNode = undefined;
        /** 是否被选中 */
        _this._slect = false;
        /** 手指触碰点与球心的位置 */
        _this.subPos = undefined;
        /** 移动结束位置 */
        _this.moveEnd = undefined;
        /** 移动时移出球 */
        _this.moveOut = false;
        /** 眼睛的状态 */
        _this.eyeState = undefined;
        /** 是否被回收 */
        _this.isResume = false;
        return _this;
    }
    Ball_1 = Ball;
    Ball.prototype.start = function () {
        this.addEventListener();
        this.shadowNode = this.ballNode.getChildByName("shadow");
        this.shadowNode.opacity = 255;
    };
    Ball.prototype.update = function (dt) {
        if (this.node.rotation > this.limitAngle)
            this.node.rotation = this.limitAngle;
        else if (this.rigid.node.rotation < -this.limitAngle)
            this.node.rotation = -this.limitAngle;
        this.move(dt);
    };
    /**
     * 只在两个碰撞体开始接触时被调用一次
     * @param contact
     * @param selfCollider 自己的碰撞体
     * @param otherCollider 发生碰撞的碰撞体
     */
    Ball.prototype.onBeginContact = function (contact, selfCollider, otherCollider) {
        if (otherCollider.tag == GameConfig_1.ColliderType.Normal)
            this.judegeBlink();
    };
    Object.defineProperty(Ball.prototype, "ballStatic", {
        set: function (enabled) {
            if (enabled) {
                this.rigid.type = cc.RigidBodyType.Static;
                this.speed = cc.Vec2.ZERO;
            }
            else {
                this.rigid.type = cc.RigidBodyType.Dynamic;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "rigid", {
        /**
         * 球的刚体组件
         */
        get: function () {
            if (this._rigid == undefined) {
                this._rigid = this.node.getComponent(cc.RigidBody);
                this._rigid.angularDamping = GameConfig_1.ballAngularDamping;
            }
            return this._rigid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "collider", {
        /**
         * 碰撞组件
         */
        get: function () {
            if (this._collider == undefined) {
                this._collider = this.node.getComponent(cc.PhysicsCollider);
                this._collider.restitution = GameConfig_1.ballRestitution;
                this._collider.friction = GameConfig_1.ballFriction;
            }
            return this._collider;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "setTrigger", {
        /**
         * 设置触发状态,底高亮
         */
        set: function (enabled) {
            this.bottomNode.opacity = enabled ? 255 : 0;
            this.shadowNode.opacity = enabled ? 0 : 255;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 更新手指最新位置
     * @param touchPos 移动点的位置
     */
    Ball.prototype.movePos = function (touchPos) {
        var flag = cc.Intersection.pointInPolygon(touchPos, GameCtrl_1.default.instance.bottomPoints);
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
    };
    /**
     * 选中后移动
     * @param dt 时间
     */
    Ball.prototype.move = function (dt) {
        if (this._slect && this.subPos != undefined) {
            var pos = this.subPos.add(this.node.position);
            var speed = this.moveEnd.sub(pos);
            speed.mulSelf(1 / dt);
            this.speed = speed;
        }
    };
    /**
     * 设置球的数字,第一次设置的时候设置大小
     * @param num 球的数字
     */
    Ball.prototype.setNum = function (num) {
        //16为疯狂小五
        if (num == 16) {
            this.crazyBall = true;
            num = 5;
        }
        if (num > 10) {
            Ball_1.bigThanTenNum++;
            cc.PhysicsManager.POSITION_ITERATIONS = 50;
            this.addDoubleClick();
        }
        if (this.ballNum != undefined)
            return;
        this.setSize(num);
        this.ballNum = num;
    };
    /**
    * 设置眼睛打开还是关闭
    * @param state 眼睛状态
    */
    Ball.prototype.setEyeState = function (state) {
        if (this.eyeState == state)
            return;
        this.rigid.enabledContactListener = false;
        this.eyeState = state;
        var spriteFrame = this.eyeSpriteFrameArr[state];
        for (var i = 0; i < this.eyeSpriteArr.length; i++) {
            this.eyeSpriteArr[i].spriteFrame = spriteFrame;
        }
        //游戏结束,去掉所有监听
        if (state == GameConfig_1.EyeState.die) {
            this.node.targetOff(this);
            //停止双击检测
            this.hold_one_click = 0;
        }
    };
    /** 恢复原始状态 */
    Ball.prototype.resume = function () {
        this.isResume = true;
        this.setSlect = false;
        this.setTrigger = false;
        this.node.stopAllActions();
        this.setEyeState(GameConfig_1.EyeState.open);
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
            Ball_1.bigThanTenNum--;
            if (Ball_1.bigThanTenNum == 0) {
                cc.PhysicsManager.POSITION_ITERATIONS = 20;
            }
            this.node.removeFromParent(true);
            return;
        }
        //游戏结束,停止了所有监听,重新监听
        if (!this.node.hasEventListener(cc.Node.EventType.TOUCH_START))
            this.addEventListener();
    };
    /**
     * 监听点击事件
     */
    Ball.prototype.addEventListener = function () {
        var _this = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (e) {
            //缩放状态不检测选中
            if (_this.node.scale != 1)
                return;
            _this.onTouchStart(e);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            _this.setSlect = false;
            _this.hold_one_click = 0;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            //点击结束触发了触发球,应该不触发双击(0.5有可能触发合并有触发双击)
            if (GameCtrl_1.default.instance.triggerBall != undefined)
                _this.hold_one_click = 0;
            _this.setSlect = false;
            //缩放状态不检测双击
            if (_this.node.scale != 1)
                return;
            //不检测双击
            if (_this.crazyBall)
                return;
            _this.hold_one_click++;
            //点击0.5秒后清0
            var callback = function () {
                _this.hold_one_click = 0;
            };
            _this.scheduleOnce(callback, 0.5);
            //判断双击
            if (_this.hold_one_click > 1 && _this.ballNum != 1)
                GameCtrl_1.default.instance.ballsCtr.ballDoubleClick(_this);
        }, this);
    };
    Object.defineProperty(Ball.prototype, "speed", {
        /**
         * 获取速度
         */
        get: function () {
            return this.rigid.linearVelocity;
        },
        /**
         * 设置速度
         */
        set: function (v) {
            this.rigid.linearVelocity = v;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 延迟设置速度
     * @param v 速度
     * @param delayTime 延迟时间
     */
    Ball.prototype.speedDelay = function (v, delayTime) {
        var _this = this;
        if (delayTime === void 0) { delayTime = 0; }
        var callback = function () {
            _this.speed = v;
        };
        this.scheduleOnce(callback, delayTime);
    };
    /**
     * 判断点是否在球的范围内
     * @param pos 判断点
     */
    Ball.prototype.judgePosOut = function (pos) {
        var arr = this.colliderPoints;
        if (arr.length > 0) {
            var flag = cc.Intersection.pointInPolygon(pos, arr);
            if (!flag) {
                return true;
            }
        }
        if (pos.mag() > this.nodeSize.x / 2) {
            return true;
        }
        return false;
    };
    Object.defineProperty(Ball.prototype, "setSlect", {
        /**
         * 设置点击选中,可以移动
         */
        set: function (enabled) {
            if (this._slect == enabled)
                return;
            this._slect = enabled;
            if (enabled) {
                this.rigid.gravityScale = 0;
                this.rigid.linearVelocity = cc.Vec2.ZERO;
                this.ballNode.opacity = 127;
                this.group = "touch";
                GameCtrl_1.default.instance.slectBall = this;
                GameCtrl_1.default.instance.triggerBall = undefined;
                this.setEyeState(GameConfig_1.EyeState.close);
                this.collider.tag = GameConfig_1.ColliderType.Slect;
            }
            else {
                this.rigid.enabledContactListener = true;
                this.subPos = undefined;
                this.rigid.gravityScale = 1;
                this.rigid.linearVelocity = new cc.Vec2(0, 1);
                this.group = "ball";
                this.ballNode.opacity = 255;
                //没有被回收,才触发touch
                if (!this.isResume)
                    GameCtrl_1.default.instance.ballsCtr.touchEnd();
                GameCtrl_1.default.instance.slectBall = undefined;
                this.setEyeState(GameConfig_1.EyeState.open);
            }
            this.setIndex(enabled);
            this.collider.apply();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 设置层级
     * @param slect 是否选中
     */
    Ball.prototype.setIndex = function (slect) {
        this.node.zIndex = slect ? 1 : 0;
    };
    Object.defineProperty(Ball.prototype, "group", {
        /**
         * 设置球的状态,选中时不能旋转,可以碰撞的物体变动
         */
        set: function (str) {
            this.node.group = str;
            this.rigid.fixedRotation = str == "touch";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 根据数字,根据配置设置球大小信息
     * @param num 球的数字
     */
    Ball.prototype.setSize = function (num) {
        var scal = GameConfig_1.ballScale[num - 1];
        var size = GameConfig_1.ballsize[num - 1].clone();
        size.x *= scal;
        size.y *= scal;
        this.nodeSize = size;
        this.ballNode.scale = scal;
        this.group = "ball";
        var width = GameConfig_1.ballHighLightWidth;
        this.setBottom();
        var collider = undefined;
        if (num < 10 || num == 15 || num == 16) {
            collider = this.node.getComponent(cc.PhysicsCircleCollider);
            //碰撞体的边缘离球是高亮的一半
            collider.radius = size.x / 2 + width / 2;
        }
        else if (num < 15) {
            collider = this.node.getComponent(cc.PhysicsPolygonCollider);
            this.colliderPoints = collider.points;
            this.adjustPolygonColliderPoint(scal);
            collider.points = this.colliderPoints;
        }
        collider.apply();
    };
    /** 设置底部高亮 */
    Ball.prototype.setBottom = function () {
        /** 边距是上下 左右所以是两倍 */
        var width = GameConfig_1.ballHighLightWidth * 2;
        this.bottomNode.setContentSize(this.nodeSize.x + width, this.nodeSize.y + width);
        this.bottomNode.opacity = 0;
        this.bottomNode.color = new cc.Color(255, 249, 205);
    };
    /**
     * 调整不规则球的碰撞边缘点
     * @param scal 配置的缩放
     */
    Ball.prototype.adjustPolygonColliderPoint = function (scal) {
        var width = GameConfig_1.ballHighLightWidth;
        var size = this.nodeSize.clone();
        //球的原始大小
        size.mulSelf(1 / scal);
        //设计的尺寸加上高亮的一半
        var change = (this.nodeSize.x + width) / size.x;
        var length = this.colliderPoints.length;
        for (var i = 0; i < length; i++)
            this.colliderPoints[i] = this.colliderPoints[i].mulSelf(change);
    };
    /**
     * 掉落时眨眼动画,30会帧率 4 5为隔了几帧
     */
    Ball.prototype.blink = function () {
        var _this = this;
        this.collider.tag = GameConfig_1.ColliderType.Normal;
        this.node.runAction(cc.sequence(cc.callFunc(function () {
            if (_this.eyeState != GameConfig_1.EyeState.die)
                _this.setEyeState(GameConfig_1.EyeState.close);
        }), cc.delayTime(5 / 30), cc.callFunc(function () {
            if (_this.eyeState != GameConfig_1.EyeState.die)
                _this.setEyeState(GameConfig_1.EyeState.open);
        })));
    };
    /**
     * 点击触摸处理
     * @param touch 点击事件
     */
    Ball.prototype.onTouchStart = function (touch) {
        if (GameCtrl_1.default.instance.slectBall != undefined)
            return;
        var pos = this.node.convertToNodeSpaceAR(touch.getLocation());
        if (!this.judgePosOut(pos)) {
            this.setSlect = true;
        }
    };
    /**
     * 移动选中球后,判断触发球是否改变
     */
    Ball.prototype.updateTriggerBall = function () {
        //大球暂时不检测触发
        if (this.ballNum > 10) {
            GameCtrl_1.default.instance.triggerBall = undefined;
            return;
        }
        var speed = this.rigid.linearVelocity;
        //双击bug,当速度太低,视为无效拖动
        if (speed.mag() < 10)
            return;
        var ball = this.getTriggerBall();
        var triggerBall = GameCtrl_1.default.instance.triggerBall;
        if (triggerBall) {
            if (triggerBall == ball)
                return;
        }
        GameCtrl_1.default.instance.triggerBall = ball;
    };
    /**
     * 获取选中球中心触发的球
     */
    Ball.prototype.getTriggerBall = function () {
        //节点销毁
        if (this.node == undefined)
            return undefined;
        var ballArr = GameCtrl_1.default.instance.getGamePanelBall();
        //如果是引导下触发的球只有一个
        if (GameCtrl_1.default.instance.guide) {
            ballArr = GameCtrl_1.default.instance.guide.ballOperate;
            //引导模式下,移动球也需要是触发球
            if (ballArr.indexOf(this) == -1)
                return undefined;
        }
        var length = ballArr.length;
        //手指位置获取的理论球位置
        var ballForFinger = this.moveEnd.sub(this.subPos);
        //遍历界面上的所有球判断有没有触发的
        for (var i = 0; i < length; i++) {
            var ball = ballArr[i];
            //为自己,判断球为undefined或者判断球节点销毁
            if (this == ball || ball == undefined || ball.node == undefined)
                continue;
            //手指获取理论球位置
            var subPosForfinger = ballForFinger.sub(ball.node.position);
            var flagForfinger = ball.judgePosOut(subPosForfinger);
            //实际球位置判断
            var subPos = this.node.position.sub(ball.node.position);
            var flag = ball.judgePosOut(subPos);
            //两个判断有一个生效,就默认触发
            if (!flagForfinger || !flag)
                return ball;
        }
        return undefined;
    };
    /**
     * 判断是否眨眼
     */
    Ball.prototype.judegeBlink = function () {
        if (GameCtrl_1.default.instance.slectBall == this)
            return;
        if (this.collider.tag == GameConfig_1.ColliderType.Birth || this.collider.tag == GameConfig_1.ColliderType.Slect)
            this.blink();
    };
    /**
     * 大于11 添加双击特效
     */
    Ball.prototype.addDoubleClick = function () {
        var node = cc.instantiate(GameCtrl_1.default.instance.balldoubleClick);
        node.parent = this.node;
        node.position = cc.Vec2.ZERO;
        node.scale = 1;
    };
    var Ball_1;
    /** 大于10的球的数目 */
    Ball.bigThanTenNum = 0;
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "底" })
    ], Ball.prototype, "bottomNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "球节点" })
    ], Ball.prototype, "ballNode", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "眼睛图片" })
    ], Ball.prototype, "eyeSpriteFrameArr", void 0);
    __decorate([
        property({ type: [cc.Sprite], visible: true, displayName: "眼睛" })
    ], Ball.prototype, "eyeSpriteArr", void 0);
    Ball = Ball_1 = __decorate([
        ccclass
    ], Ball);
    return Ball;
}(cc.Component));
exports.default = Ball;

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
        //# sourceMappingURL=Ball.js.map
        