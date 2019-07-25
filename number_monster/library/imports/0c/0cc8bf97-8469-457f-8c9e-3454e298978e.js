"use strict";
cc._RF.push(module, '0cc8b+XhGlFf4yeNFTimJeO', 'HomeCtrl');
// scripts/controller/HomeCtrl.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//首界面
var HomeView_1 = require("../view/HomeView");
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var HomeCtrl = /** @class */ (function (_super) {
    __extends(HomeCtrl, _super);
    function HomeCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 切换动画是否播放中 */
        _this.animPlaying = false;
        return _this;
    }
    HomeCtrl.prototype.start = function () {
        this.addEventListener();
        this.setSoundSprite();
        //是否有重传分数
        RootNode_1.default.instance.haveScoreRetransmission();
        this.setkid();
    };
    /**
     * 监听按钮点击
     */
    HomeCtrl.prototype.addEventListener = function () {
        var _this = this;
        //帮助
        this.guideBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.homeHelp.open();
        });
        //开始游戏
        this.startBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            RootNode_1.default.instance.loadScene("game");
        });
        //声音开关
        this.soundBtn.on("click", function () {
            MySound_1.default.instance.setMut();
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button, 0.1);
            _this.setSoundSprite();
        });
        //排行榜
        this.chartsBtn.on("click", function () {
            _this.charts.open();
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button, 0.1);
        });
        //数感星球
        this.starBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            RootNode_1.default.instance.jumpApp();
        });
        //分享
        this.shareBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            RootNode_1.default.instance.onShareBtn();
        });
        //切换游戏版本
        this.kidbtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            if (_this.animPlaying)
                return;
            RootNode_1.default.instance.isKid = !RootNode_1.default.instance.isKid;
            _this.kidAnimPlay();
        });
        //怪物图鉴
        this.monsterBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            var tipsAction = cc.sequence(cc.fadeIn(0.3), cc.delayTime(2), cc.fadeOut(0.3));
            _this.tips.stopAllActions();
            _this.tips.runAction(tipsAction);
        });
        //公众号
        this.subscriptionBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.subscriptionNode.active = true;
        });
        //群分享函数
        RootNode_1.default.instance.showGroup = function (any) {
            _this.charts.groupLunch(any);
        };
        //是否是从群分享启动
        RootNode_1.default.instance.LunchGroup();
    };
    /**
     * 设置声音按钮图片
     */
    HomeCtrl.prototype.setSoundSprite = function () {
        if (MySound_1.default.instance.isMut)
            this.soundSprite.spriteFrame = this.soundArr[1];
        else
            this.soundSprite.spriteFrame = this.soundArr[0];
    };
    /**
     * 设置版本
     */
    HomeCtrl.prototype.setkid = function () {
        var animNum = RootNode_1.default.instance.isKid ? 2 : 3;
        var clips = this.kidAnim.getClips();
        var name = clips[animNum].name;
        this.kidAnim.play(name);
    };
    /**
     * 模式切换动画
     */
    HomeCtrl.prototype.kidAnimPlay = function () {
        var _this = this;
        var animNum = RootNode_1.default.instance.isKid ? 1 : 0;
        var clips = this.kidAnim.getClips();
        var name = clips[animNum].name;
        var state = this.kidAnim.play(name);
        var time = state.duration;
        this.animPlaying = true;
        var callback = function () {
            _this.animPlaying = false;
        };
        this.scheduleOnce(callback, time);
    };
    HomeCtrl = __decorate([
        ccclass
    ], HomeCtrl);
    return HomeCtrl;
}(HomeView_1.default));
exports.default = HomeCtrl;

cc._RF.pop();