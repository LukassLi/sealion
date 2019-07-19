"use strict";
cc._RF.push(module, 'b6eabShO+ZM+YhxirarLF/h', 'GameCtrl');
// scripts/controller/GameCtrl.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//游戏逻辑控制
var Ball_1 = require("../view/Ball");
var BallsCtrl_1 = require("./BallsCtrl");
var CreatBall_1 = require("./CreatBall");
var GameConfig_1 = require("../GameConfig");
var GameView_1 = require("../view/GameView");
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var GameGuide_1 = require("../view/GameGuide");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameCtrl = /** @class */ (function (_super) {
    __extends(GameCtrl, _super);
    function GameCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 疯狂模式combo 加的分 */
        _this.crazyComboAdd = 50;
        /** 点击选中的球 */
        _this.slectBall = undefined;
        /** 球操作控制函数 */
        _this.ballsCtr = undefined;
        /** 底部多边形碰撞组件点数组 */
        _this.bottomPoints = [];
        /** 每一局可以复活的次数 */
        _this.revivalTime = 1;
        /** 引导 */
        _this.guide = undefined;
        /** 得分 */
        _this._score = 0;
        /** 下一个要更新生成速度的分数值 */
        _this.speedUpdateTarget = undefined;
        /** 下一个更新球生成的概率的分数值 */
        _this.oddsUpdateTarget = undefined;
        /** 下一个更新重力加速度的分数值 */
        _this.gravityUpdateTarget = undefined;
        /** 触发疯狂模式分数值 */
        _this._crazyTarget = 0;
        /** 疯狂模式持续时间 */
        _this.crazyDuration = undefined;
        /** 拖动球触发的球*/
        _this._triggerBall = undefined;
        /** 暂停 */
        _this.pauseFlag = false;
        /** 疯狂模式 */
        _this.crazyFlag = false;
        /** 物理引擎 */
        _this.physicsManager = undefined;
        return _this;
    }
    GameCtrl_1 = GameCtrl;
    GameCtrl.prototype.onLoad = function () {
        GameCtrl_1.instance = this;
        this.physicsManager = cc.director.getPhysicsManager();
        this.physicsManager.enabled = true;
        cc.PhysicsManager.POSITION_ITERATIONS = 20;
    };
    GameCtrl.prototype.start = function () {
        var _this = this;
        this.ballsCtr = new BallsCtrl_1.default();
        //挂上生成球的脚本  
        this.creatBall = this.node.addComponent(CreatBall_1.default);
        this.addEventListener();
        this.pointsTransformationGamePanel();
        this.ballboom.zIndex = cc.macro.MAX_ZINDEX;
        //暂停面板在动画层上面
        this.pauseNode.zIndex = this.pauseNode.zIndex + 10;
        MySound_1.default.instance.playAudio(MySound_1.AudioType.GameEnter);
        var action = cc.sequence([
            cc.delayTime(0.3),
            cc.callFunc(function () {
                _this.gameInit();
            })
        ]);
        this.node.runAction(action);
        this.playAnimation(this.cloudPrefab);
        //进入游戏,开始操作记录
        RootNode_1.default.instance.gameLog.startRecorder();
        //如果有新手引导拉起遮罩
        if (RootNode_1.default.instance.newPlayer) {
            this.maskPanl.active = true;
            this.maskPanl.opacity = 1;
        }
        this.updateRevivalTime();
    };
    Object.defineProperty(GameCtrl.prototype, "addScore", {
        /**
         * 加分
         */
        set: function (num) {
            var _this = this;
            this._score += num;
            //疯狂模式不需要更新这些
            if (!this.crazy) {
                if (this._score > this.speedUpdateTarget)
                    this.updateCreatSpeed();
                if (this._score > this.oddsUpdateTarget)
                    this.updateballOdds();
                if (this._score > this.gravityUpdateTarget)
                    this.updateGravity();
                this.updateCreazy();
            }
            var scoreDisplay = cc.sequence([
                cc.delayTime(1),
                cc.callFunc(function () {
                    _this.scoreLable.string = _this._score.toString();
                })
            ]);
            this.node.runAction(scoreDisplay);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameCtrl.prototype, "Score", {
        /**
         * 获取分数
         */
        get: function () {
            return this._score;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameCtrl.prototype, "physicsManagerEnable", {
        set: function (enabled) {
            if (this.physicsManager.enabled == enabled)
                return;
            this.physicsManager.enabled = enabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameCtrl.prototype, "triggerBall", {
        /**
         * 获取触发球
         */
        get: function () {
            return this._triggerBall;
        },
        /**
         * 设置触发球
         */
        set: function (ball) {
            if (this._triggerBall)
                this._triggerBall.setTrigger = false;
            if (ball)
                ball.setTrigger = true;
            this._triggerBall = ball;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 暂停
     */
    GameCtrl.prototype.pauseButton = function () {
        this.pause = true;
    };
    /**
     * 返回首界面
     */
    GameCtrl.prototype.HomeButton = function () {
        //返回首界面发送操作日志
        RootNode_1.default.instance.gameLog.sendAction();
        MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
        RootNode_1.default.instance.loadScene("home");
    };
    Object.defineProperty(GameCtrl.prototype, "pause", {
        /**
         * 获取是否暂停
         */
        get: function () {
            return this.pauseFlag;
        },
        /**
         * 游戏暂停
         */
        set: function (flag) {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            this.physicsManager.enabled = !flag;
            this.pauseFlag = flag;
            this.pauseNode.active = flag;
            this.creatBall.pause = flag;
            RootNode_1.default.instance.gameLog.recordAction("pause");
            //疯狂模式倒计时中,暂停继续倒计时
            if (this.crazyProgressNode.active) {
                var bar = this.crazyProgressNode.children[0];
                if (flag)
                    bar.pauseAllActions();
                else
                    bar.resumeAllActions();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameCtrl.prototype, "groupPause", {
        /**
         * 查看群排行暂停
         */
        set: function (flag) {
            //如果是游戏结束和暂停状态不需要暂停游戏
            if (this.maskPanl.active || this.pauseNode.active)
                return;
            this.physicsManager.enabled = !flag;
            this.pauseFlag = flag;
            this.creatBall.pause = flag;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameCtrl.prototype, "crazy", {
        /**
         * 获取是否是疯狂模式
         */
        get: function () {
            return this.crazyFlag;
        },
        /**
         * 设置疯狂模式
         */
        set: function (flag) {
            this.crazyFlag = flag;
            this.creatBall.stopCreat();
            if (flag)
                this.initCreazy();
            else
                this.creazyCutout();
            var str = flag ? "crazy_start" : "crazy_end";
            RootNode_1.default.instance.gameLog.recordAction(str);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 疯狂模式延迟设置
     * @param flag 是否疯狂模式
     * @param delay 延迟时间
     */
    GameCtrl.prototype.crazyDelay = function (flag, delay) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        var callback = function () {
            _this.crazy = flag;
        };
        this.scheduleOnce(callback, delay);
    };
    /**
     * 游戏继续
     */
    GameCtrl.prototype.continue = function () {
        this.pause = false;
    };
    /**
     * 重玩
     */
    GameCtrl.prototype.replay = function () {
        MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
        this._score = 0;
        this.updateRevivalTime();
        //如果有新手引导结束新手引导
        if (this.guide)
            this.guide.guideEnd();
        else {
            this.clearBall();
            this.gameInit();
        }
        this.revival.close();
        this.pause = false;
        this.gameFinish.open(false);
        this.physicsManager.enabled = true;
    };
    /**
     * 游戏结束,有复活次数弹复活
     * @param delayTime 结束页出现时间
     */
    GameCtrl.prototype.gameOver = function (delayTime) {
        var _this = this;
        if (delayTime === void 0) { delayTime = 0; }
        this.topStrip.stopJudgment();
        this.creatBall.stopCreat();
        this.setballDie();
        this.physicsManager.enabled = false;
        this.maskFadeIn();
        var seq = cc.sequence([
            cc.delayTime(delayTime),
            cc.callFunc(function () {
                if (_this.revivalTime > 0)
                    _this.revival.open();
                else
                    _this.gameFinish.open(true);
            })
        ]);
        this.node.runAction(seq);
    };
    /**
     * 获取游戏面板的球
     */
    GameCtrl.prototype.getGamePanelBall = function () {
        var nodes = this.gamePanl.children;
        var balls = [];
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].active)
                continue;
            var ball = nodes[i].getComponent(Ball_1.default);
            if (ball)
                balls.push(ball);
        }
        return balls;
    };
    /**
     * 复活初始化
     */
    GameCtrl.prototype.revivalInit = function () {
        var _this = this;
        //复活动画
        this.playAnimation(this.revivalePrefab);
        MySound_1.default.instance.playAudio(MySound_1.AudioType.PlayAgain);
        var action = cc.sequence(
        //7帧最亮的时候,清理球
        cc.delayTime(11 / 30), cc.callFunc(function () {
            _this.clearBall();
        }), 
        //切换动画播放后,正常游戏
        cc.delayTime(19 / 30), cc.callFunc(function () {
            _this.gameInit();
            _this.physicsManager.enabled = true;
        }));
        this.node.runAction(action);
    };
    /**
     * 新手引导结束,初始化游戏
     */
    GameCtrl.prototype.guideEnd = function () {
        this.maskPanl.active = false;
        this.clearBall();
        this.creatBall.initCreat();
        this.guide = undefined;
        this.physicsManagerEnable = true;
    };
    /**
     * 遮罩渐显
     */
    GameCtrl.prototype.maskFadeIn = function () {
        this.maskPanl.active = true;
        this.maskPanl.opacity = 0;
        var action = cc.fadeTo(1.5, 127);
        this.maskPanl.runAction(action);
    };
    /**
     * 底部碰撞体点坐标转换到游戏面板
     */
    GameCtrl.prototype.pointsTransformationGamePanel = function () {
        var arr = this.bottomCollider.points;
        var pos = this.bottomCollider.node.position;
        for (var i = 0; i < arr.length; i++) {
            var point = arr[i].clone();
            point.addSelf(pos);
            this.bottomPoints.push(point);
        }
    };
    /**
     * 监听手指移动
     */
    GameCtrl.prototype.addEventListener = function () {
        var _this = this;
        this.gamePanl.on(cc.Node.EventType.TOUCH_MOVE, function (e) {
            _this.onTouchMove(e);
        });
        RootNode_1.default.instance.showGroup = function (any) {
            _this.charts.groupLunch(any);
            _this.groupPause = true;
        };
    };
    /**
     * 触碰移动处理
     * @param touch 触碰事件
     */
    GameCtrl.prototype.onTouchMove = function (touch) {
        if (this.slectBall == undefined)
            return;
        var pos = this.gamePanl.convertToNodeSpaceAR(touch.getLocation());
        this.slectBall.movePos(pos);
    };
    /**
     * 游戏初始化
     */
    GameCtrl.prototype.gameInit = function () {
        RootNode_1.default.instance.triggerGC();
        this._crazyTarget = 0;
        this.creatBall.crazyTrigerNum = undefined;
        this.updateCreazy();
        this.updateCreatSpeed();
        this.updateballOdds();
        this.updateGravity();
        this.ballsCtr.reset();
        this.scoreLable.string = this._score.toString();
        this.topStrip.endJudgment();
        this.isNewPlayer();
    };
    /**
     * 是否为新手
     */
    GameCtrl.prototype.isNewPlayer = function () {
        //为新手开启新手引导
        if (RootNode_1.default.instance.newPlayer) {
            this.creatBall.guideCreat();
            var node = cc.instantiate(this.guidePre);
            node.parent = this.maskPanl.parent;
            this.guide = node.getComponent(GameGuide_1.default);
            this.guide.init();
        }
        else
            this.creatBall.initCreat();
    };
    /**
     * 根据分数更新球生成速度
     */
    GameCtrl.prototype.updateCreatSpeed = function () {
        var speedArr = GameConfig_1.default.getCreatInformation(this._score);
        this.speedUpdateTarget = speedArr[1];
        this.creatBall.creatSpeed = speedArr[0];
    };
    /**
     * 根据分数更新重力,用于控制下落速度
     */
    GameCtrl.prototype.updateGravity = function () {
        var grivityArr = GameConfig_1.default.getGravityInformation(this._score);
        this.gravityUpdateTarget = grivityArr[1];
        this.physicsManager.gravity = new cc.Vec2(0, -grivityArr[0]);
    };
    /**
     * 根据分数更新球生成的概率
     */
    GameCtrl.prototype.updateballOdds = function () {
        var oddsArr = GameConfig_1.default.getOddsInformation(this._score);
        this.oddsUpdateTarget = oddsArr[1];
        this.creatBall.updateOddsMap(oddsArr[0]);
    };
    /**
    * 根据分数进入Crazy模式
    */
    GameCtrl.prototype.updateCreazy = function () {
        //生成球正在判断中,等判断结束,再更新
        if (this.creatBall.crazyTrigerNum != undefined)
            return;
        if (this._crazyTarget > this._score)
            return;
        var creazyArr = GameConfig_1.default.getCrazyInformation(this._score);
        this._crazyTarget = creazyArr[0];
        this.creatBall.crazyTrigerNum = creazyArr[0];
        //解析值 20|50|20%|0.75|1250|1:4%,2:4%,3:4%,4:4%,5:80%,6:1%,7:1%,8:1%,9:1% 持续时间 合成得分 概率 重力 球生成概率
        var value = creazyArr[1].replace('%', '');
        var arr = value.split("|");
        this.crazyDuration = arr[0];
        this.creatBall.crazyTrigerOdds = arr[2] / 100;
    };
    /**
     * 疯狂模式初始化
     */
    GameCtrl.prototype.initCreazy = function () {
        var _this = this;
        //进场动画
        this.playAnimation(this.crazyCutToPrefab);
        MySound_1.default.instance.playAudio(MySound_1.AudioType.CrazyFive);
        var action = cc.sequence(
        //7帧最亮的时候,清理球
        cc.delayTime(7 / 30), cc.callFunc(function () {
            _this.clearBall();
            _this.crazyUiChange();
        }), 
        //切换动画播放后,开始疯狂模式
        cc.delayTime(23 / 30), cc.callFunc(function () {
            _this.creazyProgress();
            _this.creazyCutIn();
        }));
        this.node.runAction(action);
    };
    /**
     * 疯狂模式切入
    */
    GameCtrl.prototype.creazyCutIn = function () {
        //解析值 20|50|20%|0.75|1250|1:4%,2:4%,3:4%,4:4%,5:80%,6:1%,7:1%,8:1%,9:1% 持续时间 合成得分 概率 重力 球生成概率
        var value = GameConfig_1.default.getcrazyInitValue(this.Score);
        var arr = value.split("|");
        this.crazyComboAdd = parseInt(arr[1]);
        this.creatBall.creatSpeed = Number(arr[3]);
        this.physicsManager.gravity = new cc.Vec2(0, -arr[4]);
        this.creatBall.updateOddsMap(arr[5]);
        this.creatBall.initCreat();
        this.topStrip.endJudgment();
    };
    /**
     * 疯狂模式退出
     */
    GameCtrl.prototype.creazyCutout = function () {
        var _this = this;
        //疯狂模式结束,防止合球
        this.maskPanl.active = true;
        this.maskPanl.opacity = 1;
        //停掉死亡检测
        this.topStrip.stopJudgment();
        this.playAnimation(this.crazyCutOutPrefab);
        this.crazyProgressNode.active = false;
        var action = cc.sequence(
        //14帧最亮的时候,清理球
        cc.delayTime(14 / 30), cc.callFunc(function () {
            _this.clearBall();
            _this.creatBall.crazyPoolClear();
            _this.crazyUiChange();
        }), 
        //切换动画播放后,正常游戏
        cc.delayTime(8 / 30), cc.callFunc(function () {
            _this.maskPanl.active = false;
            _this.gameInit();
            _this.physicsManager.enabled = true;
        }));
        this.node.runAction(action);
    };
    /**
     * 疯狂模式进度条
     */
    GameCtrl.prototype.creazyProgress = function () {
        var _this = this;
        var time = this.crazyDuration;
        this.crazyProgressNode.active = true;
        var bar = this.crazyProgressNode.children[0];
        var sprite = bar.getComponent(cc.Sprite);
        bar.stopAllActions();
        sprite.spriteFrame = this.barImArr[0];
        bar.scale = 1;
        var action = cc.sequence(cc.scaleTo(time * 0.75, 0.25, 1), cc.callFunc(function () {
            sprite.spriteFrame = _this.barImArr[1];
        }), cc.scaleTo(time * 0.25, 0, 1), cc.callFunc(function () {
            _this.crazyProgressNode.active = false;
            _this.crazy = false;
        }));
        bar.runAction(action);
    };
    /**
     * 疯狂模式切换,ui改变
     */
    GameCtrl.prototype.crazyUiChange = function () {
        var num = this.crazy ? 1 : 0;
        //界面的设置
        this.gamePanl.getComponent(cc.Sprite).spriteFrame = this.gameBgImArr[num];
        this.topSprte.spriteFrame = this.topPauseImArr[num];
        this.bottomCollider.node.getComponent(cc.Sprite).spriteFrame = this.bottomImArr[num];
        this.bgFitSprite.spriteFrame = this.bgFitImArr[num];
        var topNode = this.topStrip.node;
        topNode.getComponent(cc.Sprite).spriteFrame = this.topImArr[num];
        var positionY = this.crazy ? 450 : 500;
        topNode.setPosition(0, positionY);
        MySound_1.default.instance.setCrazyBgm(this.crazy);
    };
    /**
     * 死亡闭眼
     */
    GameCtrl.prototype.setballDie = function () {
        var childs = this.getGamePanelBall();
        var length = childs.length;
        for (var i = 0; i < length; i++) {
            var ball = childs[i];
            ball.setEyeState(GameConfig_1.EyeState.die);
        }
    };
    /**
    * 界面上的球清理
    */
    GameCtrl.prototype.clearBall = function () {
        this.ballboom.active = false;
        var childs = this.getGamePanelBall();
        var length = childs.length;
        for (var i = 0; i < length; i++) {
            var ball = childs[i];
            this.creatBall.ballRecovery(ball);
        }
    };
    /**
     * 播放动画
     * @param prefab 带有动画的预制体
     * @param time 销毁时间为0就为动画时长
     */
    GameCtrl.prototype.playAnimation = function (prefab, time) {
        if (time === void 0) { time = 0; }
        var node = cc.instantiate(prefab);
        node.parent = this.maskPanl.parent;
        //层次在游戏层上面
        node.zIndex = 1;
        var animation = node.getComponent(cc.Animation);
        var animState = animation.play();
        time = time == 0 ? animState.duration : time;
        //销毁
        this.scheduleOnce(function () {
            node.removeFromParent();
        }, time);
        return node;
    };
    GameCtrl.prototype.updateRevivalTime = function () {
        if (this.revival.canRevival())
            this.revivalTime = 1;
        else
            this.revivalTime = 0;
    };
    var GameCtrl_1;
    GameCtrl.instance = undefined;
    GameCtrl = GameCtrl_1 = __decorate([
        ccclass
    ], GameCtrl);
    return GameCtrl;
}(GameView_1.default));
exports.default = GameCtrl;

cc._RF.pop();