"use strict";
cc._RF.push(module, 'e96abz37r1EU5jNWuJB1SHt', 'CreatBall');
// scripts/controller/CreatBall.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//生成球控制类
var Ball_1 = require("../view/Ball");
var GameConfig_1 = require("../GameConfig");
var GameCtrl_1 = require("./GameCtrl");
var RandomBallNum_1 = require("../RandomBallNum");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var CreatBall = /** @class */ (function (_super) {
    __extends(CreatBall, _super);
    function CreatBall() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 生成触发疯狂模式的触发分数 */
        _this.crazyTrigerNum = undefined;
        /** 疯狂触发球触发概率 */
        _this.crazyTrigerOdds = 0.2;
        /** 疯狂模式触发球 */
        _this._crazyTrigerBall = undefined;
        /** 生成速度 */
        _this._creatSpeed = undefined;
        /** 球的对象池 */
        _this.ballArr = {};
        /** 疯狂球对象池 */
        _this.crazyPool = [];
        /** 控制creat生成 */
        _this.creatFlag = false;
        /** 距离下一次生成球时间 */
        _this.nextCreatTime = 0;
        //随机生成球
        _this.randomBallNum = undefined;
        return _this;
    }
    CreatBall.prototype.start = function () {
        this.randomBallNum = new RandomBallNum_1.default();
    };
    /**
     * 按生成速度和生成概率生成球
     */
    CreatBall.prototype.update = function (dt) {
        if (!this.creatFlag)
            return;
        this.nextCreatTime -= dt;
        if (this.nextCreatTime <= 0 && this.judgeCreat()) {
            this.randomBall();
            this.nextCreatTime = this._creatSpeed;
        }
    };
    /**
     * 游戏开始生成五个球,再按生成速度生成
     */
    CreatBall.prototype.initCreat = function () {
        var _this = this;
        var count = 0;
        var callback = function () {
            if (GameCtrl_1.default.instance.pause == true)
                return;
            if (count == 3) {
                _this.creatFlag = true;
                _this.unschedule(callback);
            }
            _this.randomBall();
            count++;
        };
        this.schedule(callback, 0.15);
    };
    /**
     * 新手引导球生成
     */
    CreatBall.prototype.guideCreat = function () {
        var _this = this;
        var arr = [2, 2, 7, 6, 5, 5];
        var callback = function () {
            if (arr.length == 0) {
                _this.unschedule(callback);
                return;
            }
            var num = arr.shift();
            //记录掉落操作
            RootNode_1.default.instance.gameLog.recordAction('d', num);
            _this.ballBirth(num);
        };
        this.schedule(callback, 0.1);
    };
    /**
     * 疯狂模式结束,疯狂球清空
     */
    CreatBall.prototype.crazyPoolClear = function () {
        var length = this.crazyPool.length;
        for (var i = 0; i < length; i++) {
            this.crazyPool[i].node.parent = undefined;
            this.crazyPool[i].node = undefined;
        }
        this.crazyPool = [];
    };
    Object.defineProperty(CreatBall.prototype, "crazyTrigerBall", {
        /**
         * 获取触发球
         */
        get: function () {
            return this._crazyTrigerBall;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 停止球的生成
     */
    CreatBall.prototype.stopCreat = function () {
        this.creatFlag = false;
    };
    Object.defineProperty(CreatBall.prototype, "creatSpeed", {
        /**
         * 设置球生成速度
         */
        set: function (num) {
            this._creatSpeed = num;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 球回收
     */
    CreatBall.prototype.ballRecovery = function (ball) {
        if (undefined == ball)
            return;
        var ballnum = ball.ballNum;
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
                var set_1 = new Set(this.crazyPool);
                this.crazyPool = Array.from(set_1);
                return;
            }
        }
        //引导模式下的球不回收,因为触发监听有问题
        if (GameCtrl_1.default.instance.guide) {
            ball.node.removeFromParent();
            return;
        }
        //大球不回收
        if (ballnum > 10)
            return;
        var numstr = ballnum.toString();
        var arr = this.ballArr[numstr];
        if (arr == undefined) {
            arr = new Array();
            this.ballArr[numstr] = arr;
        }
        if (arr.length < 5) {
            arr.push(ball);
        }
        else {
            ball.node.parent = undefined;
            ball.node = undefined;
        }
        //去重,修改生成后球消失的bug
        var set = new Set(arr);
        this.ballArr[numstr] = Array.from(set);
    };
    /**
     * 更新球的生成概率
     * @param oddsStr 概率字符串
     */
    CreatBall.prototype.updateOddsMap = function (oddsStr) {
        this.randomBallNum.updateOddsMap(oddsStr);
    };
    /**
     * 在具体位置生成球
     * @param num 生成球数字
     * @param pos 生成球位置
     */
    CreatBall.prototype.creatBallForPos = function (num, pos) {
        var ball = this.getBall(num);
        var node = ball.node;
        node.position = pos;
        return node;
    };
    Object.defineProperty(CreatBall.prototype, "pause", {
        /**
         * 暂停
         */
        set: function (enable) {
            if (enable) {
                this.creatFlag = false;
            }
            else
                this.creatFlag = true;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 判断球生成,主要用于限制,桌面上球的数量
     */
    CreatBall.prototype.judgeCreat = function () {
        var ballarr = GameCtrl_1.default.instance.getGamePanelBall();
        var num = 0;
        var length = ballarr.length;
        if (length < 18)
            return true;
        for (var i = 0; i < length; i++) {
            //小球体积小当0.5个
            if (ballarr[i].ballNum < 5)
                num += 0.5;
            else
                num++;
        }
        if (num > 18)
            return false;
        return true;
    };
    /**
     * 按概率随机创建球
     */
    CreatBall.prototype.randomBall = function () {
        var num = this.crazyTrigerNum;
        //超过触发分数,随机到的数字为5
        if (num != undefined && num < GameCtrl_1.default.instance.Score) {
            //概率触发
            if (Math.random() < this.crazyTrigerOdds) {
                this.crazyTrigerOdds = 0.2;
                var ball = this.creatNewBall(16);
                this._crazyTrigerBall = ball;
                this.initCrazyTrigerBall(ball);
                this.crazyTrigerNum = undefined;
                return;
            }
        }
        var ranNum = this.randomBallNum.getBallNum();
        //记录掉落操作
        RootNode_1.default.instance.gameLog.recordAction('d', ranNum);
        this.ballBirth(ranNum);
    };
    /**
     * 疯狂触发球设置
     */
    CreatBall.prototype.initCrazyTrigerBall = function (ball) {
        return __awaiter(this, void 0, void 0, function () {
            var node, trggerNode, normal, action;
            var _this = this;
            return __generator(this, function (_a) {
                node = ball.node;
                //位置
                node.position = new cc.Vec2(0, 1000);
                trggerNode = cc.instantiate(GameCtrl_1.default.instance.crazyTriggerPrefab);
                trggerNode.parent = node;
                //按配置缩放到疯狂球相同大小
                trggerNode.scale = GameConfig_1.ballScale[15];
                normal = undefined;
                action = cc.sequence(cc.delayTime(8), cc.callFunc(function () {
                    normal = cc.instantiate(GameCtrl_1.default.instance.crazyToNomalPrefab);
                    normal.parent = node;
                    normal.scale = GameConfig_1.ballScale[15];
                    normal.position = cc.Vec2.ZERO;
                    var callback = function () {
                        if (normal != undefined) {
                            normal.removeFromParent();
                        }
                        _this.ballRecovery(_this._crazyTrigerBall);
                    };
                    _this.scheduleOnce(callback, 0.37);
                }), cc.delayTime(5 / 30), cc.callFunc(function () {
                    var newBall = _this.creatBallForPos(5, node.position);
                    normal.parent = newBall;
                    normal.position = cc.Vec2.ZERO;
                    //触发球移除屏幕,等时机到自动回收
                    node.position = new cc.Vec2(0, 10000);
                }));
                node.runAction(action);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 球生成设置
     */
    CreatBall.prototype.ballBirth = function (ballnum) {
        var ball = this.getBall(ballnum);
        var width = ball.node.getContentSize().width;
        //1000为下降高度, x为随机位置
        var x = -360 + width / 2 + Math.random() * (720 - width);
        ball.node.position = new cc.Vec2(x, 1000);
        this.setBirthSpeed(ball);
    };
    /**
     * 球生成起始速度
     * @param ball 球
     */
    CreatBall.prototype.setBirthSpeed = function (ball) {
        var _this = this;
        var callback = function () {
            var speed = ball.rigid.linearVelocity;
            if (speed.y < 0) {
                ball.speed = new cc.Vec2(0, -GameConfig_1.ballDropSpeed);
                _this.unschedule(callback);
            }
        };
        this.schedule(callback, 0.2);
    };
    /**
     * 根据数字返回需要的球
     * @param num 需要的球的数字
     */
    CreatBall.prototype.getBall = function (num) {
        var instance = GameCtrl_1.default.instance;
        var ball = undefined;
        //大于10的大球,不保存内存池
        if (num > 10)
            return this.creatNewBall(num);
        var numstr = num.toString();
        var arr = this.ballArr[numstr];
        //如果是疯狂模式下的5
        if (instance.crazy && num == 5) {
            arr = this.crazyPool;
            //预制放在15;
            num = 16;
        }
        if (arr != undefined && arr.length > 0) {
            ball = arr.shift();
            var node = ball.node;
            node.active = true;
            ball.node.scale = 1;
            node.setParent(instance.gamePanl);
            ball.collider.tag = GameConfig_1.ColliderType.Birth;
        }
        else
            ball = this.creatNewBall(num);
        return ball;
    };
    /**
     * 创建一个新球
     */
    CreatBall.prototype.creatNewBall = function (num) {
        var instance = GameCtrl_1.default.instance;
        var node = cc.instantiate(instance.ballPreArr[num - 1]);
        var ball = node.getComponent(Ball_1.default);
        ball.setNum(num);
        node.setParent(instance.gamePanl);
        ball.collider.tag = GameConfig_1.ColliderType.Birth;
        return ball;
    };
    CreatBall = __decorate([
        ccclass
    ], CreatBall);
    return CreatBall;
}(cc.Component));
exports.default = CreatBall;

cc._RF.pop();