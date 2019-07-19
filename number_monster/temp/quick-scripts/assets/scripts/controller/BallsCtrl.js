(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/controller/BallsCtrl.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '387876rKhFIob8ndzzXc1wh', 'BallsCtrl', __filename);
// scripts/controller/BallsCtrl.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//球操作的控制
var GameConfig_1 = require("../GameConfig");
var Ball_1 = require("../view/Ball");
var ComBo_1 = require("../view/ComBo");
var GameCtrl_1 = require("./GameCtrl");
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var BallsCtrl = /** @class */ (function () {
    function BallsCtrl() {
        /** 连击数 */
        this.combo = 0;
        /** 10球对象池*/
        this.tenArr = [];
        /** comBo对象池 */
        this.comBoArr = [];
    }
    /**
     * 选中球,手指停止触碰处理
     */
    BallsCtrl.prototype.touchEnd = function () {
        if (!this.isCrazeTriggerBallValidAdd())
            return;
        var triggerBall = GameCtrl_1.default.instance.triggerBall;
        var moveBall = GameCtrl_1.default.instance.slectBall;
        var num = triggerBall.ballNum + moveBall.ballNum;
        //疯狂模式不能大于15
        if (num > 15 && GameCtrl_1.default.instance.crazy)
            return;
        if (num != 10)
            this.addNormal(num);
        else
            this.addTen();
        this.ballAddDisappear(triggerBall);
        var pos = triggerBall.node.position;
        this.moveAddDisappear(moveBall, pos);
        GameCtrl_1.default.instance.triggerBall = undefined;
        //记录合并
        RootNode_1.default.instance.gameLog.recordAction('c', triggerBall.ballNum, moveBall.ballNum);
        //引导
        if (GameCtrl_1.default.instance.guide)
            GameCtrl_1.default.instance.guide.nextGuide(1);
    };
    /**
     * 选中球双击处理
     * @param ball 选中球
     */
    BallsCtrl.prototype.ballDoubleClick = function (ball) {
        var num = ball.ballNum;
        if (!this.isValidDoubleClick(num))
            return;
        MySound_1.default.instance.playAudio(MySound_1.AudioType.Split);
        var num1 = Math.ceil(num / 2);
        var num2 = num - num1;
        var pos = ball.node.position;
        GameCtrl_1.default.instance.creatBall.ballRecovery(ball);
        this.creatForDouble(num1, pos);
        var ball2 = this.creatForDouble(num2, pos, false);
        var v = new cc.Vec2(0, 260);
        ball2.speedDelay(v, 0.1);
        this.combo = 0;
        //记录拆分
        RootNode_1.default.instance.gameLog.recordAction('s', num);
    };
    /**
     * 游戏开始连击重置
     */
    BallsCtrl.prototype.reset = function () {
        this.combo = 0;
    };
    /**
     * 是否为有效的双击拆分
     */
    BallsCtrl.prototype.isValidDoubleClick = function (num) {
        //引导时,第五步双击引导,双击数字6才能拆
        var guide = GameCtrl_1.default.instance.guide;
        if (guide) {
            if (guide.Index == 5 && num == 6) {
                guide.nextGuide();
                return true;
            }
            return false;
        }
        return true;
    };
    /**
     * 是否为有效的疯狂模式触发球相加
     */
    BallsCtrl.prototype.isCrazeTriggerBallValidAdd = function () {
        var triggerBall = GameCtrl_1.default.instance.triggerBall;
        var moveBall = GameCtrl_1.default.instance.slectBall;
        if (triggerBall == undefined)
            return false;
        //有触发球
        if (GameCtrl_1.default.instance.creatBall.crazyTrigerBall) {
            //判断的两球中有触发球
            if (triggerBall.crazyBall || moveBall.crazyBall) {
                //不为10 均为无效
                if (triggerBall.ballNum + moveBall.ballNum != 10)
                    return false;
                else //等到合10特效结束,触发疯狂模式
                 {
                    //合了疯狂球就立刻结束判断,等待进入疯狂模式
                    GameCtrl_1.default.instance.topStrip.stopJudgment();
                    GameCtrl_1.default.instance.crazyDelay(true, 38 / 30);
                }
            }
        }
        return true;
    };
    /**
     * 选中球消失 5帧数 30为帧率
     * @param ball 选中球
     * @param pos 消失位置
     */
    BallsCtrl.prototype.moveAddDisappear = function (ball, pos) {
        ball.rigid.active = false;
        var move = cc.moveTo(5 / 30, pos);
        var disappear = this.addDisappear(ball);
        var spa = cc.spawn([move, disappear]);
        ball.node.runAction(spa);
    };
    /**
     * 触发球消失 5帧数 30为帧率
     * @param ball 触发球
     */
    BallsCtrl.prototype.ballAddDisappear = function (ball) {
        ball.rigid.active = false;
        var delay = cc.delayTime(5 / 30);
        var action = this.addDisappear(ball);
        var sqe = cc.sequence(delay, action);
        ball.node.runAction(sqe);
    };
    /**
     * 球在相加时,消失的动画 5帧数 30为帧率
     * @param ball 消失的球
     */
    BallsCtrl.prototype.addDisappear = function (ball) {
        var fun = cc.callFunc(function () {
            GameCtrl_1.default.instance.creatBall.ballRecovery(ball);
        });
        var scale = cc.scaleTo(5 / 30, 0);
        var fade = cc.fadeTo(5 / 30, 0);
        var spa = cc.spawn([scale, fade]);
        var seq = cc.sequence([spa, fun]);
        return seq;
    };
    /**
     * 普通加
     * @param num 相加后生成的球数字
     */
    BallsCtrl.prototype.addNormal = function (num) {
        this.combo = 0;
        var pos = GameCtrl_1.default.instance.triggerBall.node.position;
        if (num > 15) {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.GreaterThanFifteen);
            var boom = GameCtrl_1.default.instance.ballboom;
            boom.active = true;
            boom.position = pos;
            this.playAnimation(boom, "boom");
            GameCtrl_1.default.instance.gameOver(1);
            return;
        }
        this.addCreatBall(num, pos);
    };
    /**
     * 相加生成球 4 6 1 为帧数 30为帧率
     * @param num 球的数字
     * @param pos 球的位置
     */
    BallsCtrl.prototype.addCreatBall = function (num, pos) {
        if (num > 10)
            MySound_1.default.instance.playAudio(MySound_1.AudioType.GreaterThanTen);
        else
            MySound_1.default.instance.playAudio(MySound_1.AudioType.LessThanTen);
        var ballNode = GameCtrl_1.default.instance.creatBall.creatBallForPos(num, pos);
        ballNode.scale = 0.01;
        ballNode.opacity = 0;
        var delay = cc.delayTime(4 / 30);
        var spa = cc.spawn([
            cc.scaleTo(6 / 30, 1),
            cc.fadeTo(1 / 30, 255)
        ]);
        var seq = cc.sequence([delay, spa]);
        ballNode.runAction(seq);
        if (GameCtrl_1.default.instance.guide)
            ballNode.parent = GameCtrl_1.default.instance.guide.node;
    };
    /**
     * 相加等于10
     */
    BallsCtrl.prototype.addTen = function () {
        if (GameCtrl_1.default.instance.crazy)
            GameCtrl_1.default.instance.addScore = GameCtrl_1.default.instance.crazyComboAdd;
        else {
            this.combo++;
            if (this.combo > 10)
                this.combo = 10;
            GameCtrl_1.default.instance.addScore = this.combo * 10;
        }
        var pos = GameCtrl_1.default.instance.triggerBall.node.position;
        this.creatTen(pos);
        this.creatCombo(pos);
    };
    /**
     * 10球生成 25为帧数 30为帧率
     * @param pos 位置
     */
    BallsCtrl.prototype.creatTen = function (pos) {
        var _this = this;
        MySound_1.default.instance.playAudio(MySound_1.AudioType.Ten);
        var instance = GameCtrl_1.default.instance;
        var node = undefined;
        if (this.tenArr.length > 0)
            node = this.tenArr.pop();
        else {
            node = cc.instantiate(instance.ballPreArr[9]);
        }
        var recover = cc.sequence([
            cc.delayTime(25 / 30),
            cc.callFunc(function () {
                _this.tenArr.push(node);
            })
        ]);
        if (instance.guide)
            node.setParent(instance.maskPanl.parent);
        else
            node.setParent(instance.gameNode);
        node.position = pos;
        node.zIndex = 3;
        this.playAnimation(node, "ball_10", GameConfig_1.comboSpeed);
        node.runAction(recover);
    };
    /**
     * 连击生成 38为第几帧 30 为帧率
     * @param pos 位置
     */
    BallsCtrl.prototype.creatCombo = function (pos) {
        var _this = this;
        if (GameCtrl_1.default.instance.crazy)
            MySound_1.default.instance.playAudio(MySound_1.AudioType.ComboGood, 20 / 30);
        else if (this.combo == 10)
            MySound_1.default.instance.playAudio(MySound_1.AudioType.ComboTen, 20 / 30);
        else if (this.combo > 1)
            MySound_1.default.instance.playAudio(MySound_1.AudioType.ComboGood, 20 / 30);
        var instance = GameCtrl_1.default.instance;
        var combo = undefined;
        var node = undefined;
        if (this.comBoArr.length > 0)
            combo = this.comBoArr.pop();
        else {
            node = cc.instantiate(instance.comBoPre);
            combo = node.getComponent(ComBo_1.default);
        }
        var recover = cc.sequence([
            cc.delayTime(38 / 30),
            cc.callFunc(function () {
                _this.comBoArr.push(combo);
            })
        ]);
        combo.setCombo(this.combo);
        node = combo.node;
        node.position = pos;
        this.playAnimation(node, "combo", GameConfig_1.comboSpeed);
        node.runAction(recover);
        if (instance.guide)
            node.setParent(instance.maskPanl.parent);
        else
            node.setParent(instance.gameNode);
    };
    /**
     * 播放动画
     * @param node 节点
     * @param ani 播放动画名字
     */
    BallsCtrl.prototype.playAnimation = function (node, ani, speed) {
        if (speed === void 0) { speed = 1; }
        var anim = node.getComponent(cc.Animation);
        var animState = anim.play(ani);
        animState.speed = speed;
    };
    /**
     * 双击生成球
     * @param num 球的数字
     * @param pos 位置
     * @param active 生成时刚体是否有效
     */
    BallsCtrl.prototype.creatForDouble = function (num, pos, active) {
        if (active === void 0) { active = true; }
        var node = GameCtrl_1.default.instance.creatBall.creatBallForPos(num, pos);
        var ball = node.getComponent(Ball_1.default);
        node.scale = 0;
        ball.rigid.active = active;
        var action = cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(function () {
            ball.rigid.active = true;
        }));
        node.runAction(action);
        if (GameCtrl_1.default.instance.guide)
            node.parent = GameCtrl_1.default.instance.guide.node;
        return ball;
    };
    BallsCtrl = __decorate([
        ccclass
    ], BallsCtrl);
    return BallsCtrl;
}());
exports.default = BallsCtrl;

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
        //# sourceMappingURL=BallsCtrl.js.map
        