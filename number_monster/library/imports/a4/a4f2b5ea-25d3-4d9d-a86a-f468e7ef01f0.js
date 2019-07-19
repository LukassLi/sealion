"use strict";
cc._RF.push(module, 'a4f2bXqJdNNnahq9Gjn7wHw', 'GameGuide');
// scripts/view/GameGuide.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//新手引导
var Ball_1 = require("./Ball");
var GameCtrl_1 = require("../controller/GameCtrl");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameGuide = /** @class */ (function (_super) {
    __extends(GameGuide, _super);
    function GameGuide() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hand = undefined;
        _this.line = undefined;
        _this.describeLable = undefined;
        _this.jumpbtn = undefined;
        _this.continueBtn = undefined;
        _this.handSpr = [];
        _this.doubleNode = undefined;
        /** 引导了几步 */
        _this.index = 0;
        /** 动画操作的球 */
        _this.ballOperate = [];
        /** 引导结束 */
        _this.endFlag = false;
        _this.strArr = [
            '欢迎来到数字精灵的世界~\n让我们了解下游戏的基本规则吧。',
            '如果两个数字相加的结果是10，合成就会消失，并且获得积分奖励。',
            '我们还可以连续合成数字球，先试试用数字2和数字2合成。',
            '然后用数字4和数字6合成，\n就可以合成10啦~',
            '6和7相加不等于10！\n我们可以通过双击数字球进行拆数~',
            '数字6拆成了两个数字3!\n我们用其中一个数字3和数字7合成吧~',
            '游戏规则就是这么简单，\n让我们开始游戏吧~'
        ];
        return _this;
    }
    GameGuide.prototype.start = function () {
        var _this = this;
        this.jumpbtn.on("click", function () {
            RootNode_1.default.instance.gameLog.recordAction("skipGuide");
            _this.guideEnd();
        });
        this.continueBtn.on("click", function () {
            _this.continue();
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (e) {
            if (GameCtrl_1.default.instance.slectBall == undefined)
                return;
            var pos = _this.node.convertToNodeSpaceAR(e.getLocation());
            GameCtrl_1.default.instance.slectBall.movePos(pos);
        });
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (!_this.continueBtn.active)
                return;
            _this.continue();
        });
        this.hand.zIndex = 10;
        this.line.zIndex = 10;
        this.doubleNode.zIndex = 8;
        this.doubleNode.active = false;
        this.continueBtn.active = false;
    };
    GameGuide.prototype.update = function () {
        //当点击了球时,手指动画隐藏
        if (GameCtrl_1.default.instance.slectBall) {
            this.hand.opacity = 0;
            this.line.opacity = 0;
            //操作球可以动
            this.operateStatic(false);
        }
    };
    /**
     * 引导初始化
     */
    GameGuide.prototype.init = function () {
        var _this = this;
        this.node.opacity = 0;
        this.describeLable.string = '';
        var callback = function () {
            _this.node.opacity = 255;
            GameCtrl_1.default.instance.maskPanl.opacity = 125;
            _this.setDescribe(0);
            _this.continueBtn.active = true;
            //新手引导已经触发
            RootNode_1.default.instance.setNewPlayer();
        };
        //等待三秒是考虑球的下落
        this.scheduleOnce(callback, 3);
    };
    /**
     * 下一步引导 (合成和双击触发)
     * @param delay 延迟时间
     */
    GameGuide.prototype.nextGuide = function (delay) {
        if (delay === void 0) { delay = 0.5; }
        return __awaiter(this, void 0, void 0, function () {
            var callback;
            var _this = this;
            return __generator(this, function (_a) {
                this.typeResume();
                this.describeLable.node.parent.opacity = 0;
                if (this.index == 2)
                    delay = 0.8;
                callback = function () {
                    _this.guide();
                };
                this.scheduleOnce(callback, delay);
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(GameGuide.prototype, "Index", {
        /**
         * 第几步
         */
        get: function () {
            return this.index;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * 引导结束
    */
    GameGuide.prototype.guideEnd = function () {
        //终止所有回调
        this.unscheduleAllCallbacks();
        this.endFlag = true;
        //把所有球回收
        var nodes = this.node.children;
        for (var i = 0; i < nodes.length; i++) {
            var ball = nodes[i].getComponent(Ball_1.default);
            if (ball)
                GameCtrl_1.default.instance.creatBall.ballRecovery(ball);
        }
        //清空游戏面板所有球
        GameCtrl_1.default.instance.guideEnd();
        this.node.removeFromParent();
    };
    /**
     * 开始下一步引导前状态回置
     */
    GameGuide.prototype.typeResume = function () {
        this.unscheduleAllCallbacks();
        this.hand.scale = 1;
        this.hand.opacity = 0;
        this.line.opacity = 0;
        //操作球清空
        this.ballOperate = [];
    };
    /**
     * 引导
     */
    GameGuide.prototype.guide = function () {
        this.index++;
        switch (this.index) {
            case 1:
                this.setDescribe(1);
                this.getBallFromGame([5, 5]);
                this.guideAdd([5, 5]);
                break;
            case 2:
                this.setDescribe(2);
                this.getBallFromGame([2, 2, 6]);
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
                this.getBallFromGame([7, 6]);
                this.guideDoubleClick();
                break;
            case 6:
                this.setDescribe(5);
                this.guideAdd([3, 7]);
                break;
            case 7:
                var arr = this.getBallNode([3]);
                arr[0].parent = GameCtrl_1.default.instance.gamePanl;
                this.continueBtn.active = true;
                this.setDescribe(6);
                break;
        }
    };
    /**
     * 设置描述文字
     * @param num 文本序号
     */
    GameGuide.prototype.setDescribe = function (num) {
        var _this = this;
        var node = this.describeLable.node.parent;
        node.runAction(cc.fadeIn(0.1));
        //打印机方式显示文字
        var arr = this.strArr[num].split('');
        var length = arr.length;
        var str = '';
        var step = 0;
        var callback = function () {
            str += arr[step];
            _this.describeLable.string = str;
            if (++step == length)
                _this.unschedule(callback);
        };
        this.schedule(callback, 0.05);
    };
    /**
     * 生成新球
     */
    GameGuide.prototype.creatBall = function () {
        var _this = this;
        GameCtrl_1.default.instance.maskPanl.opacity = 127;
        //生成数字6
        var node = GameCtrl_1.default.instance.creatBall.creatBallForPos(6, new cc.Vec2(200, 700));
        var ball = node.getComponent(Ball_1.default);
        ball.speed = new cc.Vec2(0, 300);
        var callback = function () {
            //生成球掉下接近底部,到下一步
            if (node.position.y < -400) {
                _this.nextGuide();
                _this.unschedule(callback);
            }
        };
        this.schedule(callback, 0.1);
    };
    /**
     * 引导双击
     */
    GameGuide.prototype.guideDoubleClick = function () {
        var _this = this;
        var arr = this.getBallNode([6]);
        this.ballOperate = [arr[0].getComponent(Ball_1.default)];
        this.hand.getComponent(cc.Sprite).spriteFrame = this.handSpr[0];
        var callback = function () {
            if (_this.endFlag || GameCtrl_1.default.instance.slectBall)
                return;
            arr[0].zIndex = 0;
            var pos = arr[0].position;
            //操作球不能移动
            _this.operateStatic(true);
            _this.doubleClick(pos);
        };
        this.schedule(callback, 3, cc.macro.REPEAT_FOREVER, 0.1);
    };
    /**
     * 双击动画
     */
    GameGuide.prototype.doubleClick = function (pos) {
        var _this = this;
        this.hand.stopAllActions();
        this.hand.opacity = 255;
        pos.y = pos.y - 10;
        this.hand.position = pos;
        this.doubleNode.position = pos;
        var action = cc.sequence([
            cc.scaleTo(0.3, 1.1),
            cc.scaleTo(0.3, 0.9),
            cc.callFunc(function () {
                _this.playAni(_this.doubleNode);
            }),
            cc.scaleTo(0.3, 1.1),
            cc.scaleTo(0.3, 0.9),
            cc.callFunc(function () {
                _this.playAni(_this.doubleNode);
            }),
            cc.scaleTo(0.3, 1),
            cc.callFunc(function () {
                _this.hand.opacity = 0;
            })
        ]);
        this.hand.runAction(action);
    };
    /**
     * 播放动画
     */
    GameGuide.prototype.playAni = function (node) {
        node.active = true;
        var anim = node.getComponent(cc.Animation);
        anim.play();
    };
    /**
     * 从游戏面板获取球
     * @param arr 获取球的数组
     */
    GameGuide.prototype.getBallFromGame = function (arr) {
        //游戏面板上的球
        var arrBall = GameCtrl_1.default.instance.getGamePanelBall();
        for (var i = 0; i < arrBall.length; i++) {
            var ballNum = arrBall[i].ballNum;
            var index = arr.indexOf(ballNum);
            if (index != -1) {
                arr.splice(index, 1);
                var node = arrBall[i].node;
                node.parent = this.node;
                node.zIndex = 0;
            }
        }
    };
    /**
     * 从引导面板获取球(为了简化判断,取球做了两步)
     * @param arr 获取球的数组
     */
    GameGuide.prototype.getBallNode = function (arr) {
        var nodeArr = [];
        var nodes = this.node.children;
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].active)
                continue;
            var ball = nodes[i].getComponent(Ball_1.default);
            if (ball) {
                var index = arr.indexOf(ball.ballNum);
                if (index != -1) {
                    arr.splice(index, 1);
                    nodeArr.push(ball.node);
                }
            }
        }
        return nodeArr;
    };
    /**
     * 引导数字相加
     * @param numArr 操作的数字
     */
    GameGuide.prototype.guideAdd = function (numArr) {
        var _this = this;
        //需要操作的两个球
        var arr = this.getBallNode(numArr);
        //设置操作球
        for (var i = 0; i < arr.length; i++) {
            var ball = arr[i].getComponent(Ball_1.default);
            this.ballOperate.push(ball);
        }
        arr.sort(this.ballSore);
        var callback = function () {
            if (_this.endFlag || GameCtrl_1.default.instance.slectBall)
                return;
            //操作球不能移动
            _this.operateStatic(true);
            _this.handMove(arr);
        };
        this.schedule(callback, 2, cc.macro.REPEAT_FOREVER, 0.1);
    };
    /**
     * 滑动合成动画
     * @param arr 操作球数组
     */
    GameGuide.prototype.handMove = function (arr) {
        var _this = this;
        //节点为空
        if (arr[0] == undefined || arr[1] == undefined)
            return;
        var start = arr[0].position;
        var end = arr[1].position;
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
        var sprite = this.hand.getComponent(cc.Sprite);
        sprite.spriteFrame = this.handSpr[0];
        this.hand.scale = 1.2;
        var handAct = cc.sequence([
            cc.scaleTo(0.2, 1),
            cc.callFunc(function () {
                sprite.spriteFrame = _this.handSpr[1];
            }),
            cc.moveTo(1, end),
            cc.callFunc(function () {
                _this.hand.opacity = 0;
            })
        ]);
        this.hand.runAction(handAct);
        //线
        this.line.position = start;
        var lineVec = end.sub(start);
        var length = lineVec.mag();
        var d = new cc.Vec2(1, 0);
        var lineAngle = lineVec.signAngle(d);
        this.line.scaleX = 0;
        this.line.width = length;
        this.line.rotation = lineAngle * 180 / Math.PI;
        var lineAct = cc.sequence([
            cc.delayTime(0.2),
            cc.scaleTo(1, 1),
            cc.callFunc(function () {
                _this.line.opacity = 0;
            })
        ]);
        this.line.runAction(lineAct);
    };
    /**
     * 排序,为了手指都是从左往右滑
     * @param a
     * @param b
     */
    GameGuide.prototype.ballSore = function (a, b) {
        var ballA = a.getComponent(Ball_1.default);
        var ballB = b.getComponent(Ball_1.default);
        if (ballA.ballNum == ballB.ballNum)
            return a.position.x - b.position.x;
        return ballA.ballNum - ballB.ballNum;
    };
    /**
     * 点击继续
     */
    GameGuide.prototype.continue = function () {
        this.continueBtn.active = false;
        if (this.index == 0)
            this.nextGuide();
        else
            this.guideEnd();
    };
    /**
     * 设置操作球是否禁止
     * @param enable 是否禁止
     */
    GameGuide.prototype.operateStatic = function (enable) {
        for (var i = 0; i < this.ballOperate.length; i++) {
            this.ballOperate[i].ballStatic = enable;
        }
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "手" })
    ], GameGuide.prototype, "hand", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "线" })
    ], GameGuide.prototype, "line", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "文字描述" })
    ], GameGuide.prototype, "describeLable", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "跳过按钮" })
    ], GameGuide.prototype, "jumpbtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "跳过按钮" })
    ], GameGuide.prototype, "continueBtn", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "手指图片" })
    ], GameGuide.prototype, "handSpr", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "双击动画" })
    ], GameGuide.prototype, "doubleNode", void 0);
    GameGuide = __decorate([
        ccclass
    ], GameGuide);
    return GameGuide;
}(cc.Component));
exports.default = GameGuide;

cc._RF.pop();