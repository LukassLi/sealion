"use strict";
cc._RF.push(module, 'f2a87sm5g1B7rolViwRQOmT', 'GameView');
// scripts/view/GameView.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
var FinishCtrl_1 = require("../controller/FinishCtrl");
var Revival_1 = require("../controller/Revival");
var TopStrip_1 = require("../controller/TopStrip");
var Charts_1 = require("../controller/Charts");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameView = /** @class */ (function (_super) {
    __extends(GameView, _super);
    function GameView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.gamePanl = undefined;
        _this.ballPreArr = [];
        _this.comBoPre = undefined;
        _this.guidePre = undefined;
        _this.cloudPrefab = undefined;
        _this.ballboom = undefined;
        _this.maskPanl = undefined;
        _this.scoreLable = undefined;
        _this.gameNode = undefined;
        _this.gameFinish = undefined;
        _this.revival = undefined;
        _this.pauseNode = undefined;
        _this.topHomeIm = undefined;
        _this.topSprte = undefined;
        _this.bottomCollider = undefined;
        _this.topStrip = undefined;
        _this.charts = undefined;
        _this.gameBgImArr = [];
        _this.topPauseImArr = [];
        _this.bottomImArr = [];
        _this.topImArr = [];
        _this.bgFitSprite = undefined;
        _this.bgFitImArr = [];
        _this.crazyProgressNode = undefined;
        _this.barImArr = [];
        _this.crazyCutToPrefab = undefined;
        _this.crazyCutOutPrefab = undefined;
        _this.crazyTriggerPrefab = undefined;
        _this.crazyToNomalPrefab = undefined;
        _this.crazyLivePrefab = undefined;
        _this.revivalePrefab = undefined;
        _this.balldoubleClick = undefined;
        _this.creatBall = undefined;
        return _this;
    }
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "游戏面板" })
    ], GameView.prototype, "gamePanl", void 0);
    __decorate([
        property({ type: [cc.Prefab], visible: true, displayName: "球预制" })
    ], GameView.prototype, "ballPreArr", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "连击预制" })
    ], GameView.prototype, "comBoPre", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "引导预制体" })
    ], GameView.prototype, "guidePre", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "入场动画预制" })
    ], GameView.prototype, "cloudPrefab", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "合成球大于等于16爆炸节点" })
    ], GameView.prototype, "ballboom", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "面板底遮罩" })
    ], GameView.prototype, "maskPanl", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "分数节点" })
    ], GameView.prototype, "scoreLable", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "游戏节点" })
    ], GameView.prototype, "gameNode", void 0);
    __decorate([
        property({ type: FinishCtrl_1.default, visible: true, displayName: "游戏结束" })
    ], GameView.prototype, "gameFinish", void 0);
    __decorate([
        property({ type: Revival_1.default, visible: true, displayName: "复活面板" })
    ], GameView.prototype, "revival", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "暂停节点" })
    ], GameView.prototype, "pauseNode", void 0);
    __decorate([
        property({ type: cc.SpriteFrame, visible: true, displayName: "主页图片" })
    ], GameView.prototype, "topHomeIm", void 0);
    __decorate([
        property({ type: cc.Sprite, visible: true, displayName: "顶部按钮暂停" })
    ], GameView.prototype, "topSprte", void 0);
    __decorate([
        property({ type: cc.PhysicsPolygonCollider, visible: true, displayName: "底部碰撞体" })
    ], GameView.prototype, "bottomCollider", void 0);
    __decorate([
        property({ type: TopStrip_1.default, visible: true, displayName: "顶部横栏,结束判断" })
    ], GameView.prototype, "topStrip", void 0);
    __decorate([
        property({ type: Charts_1.default, visible: true, displayName: "排行榜" })
    ], GameView.prototype, "charts", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "游戏背景图片" })
    ], GameView.prototype, "gameBgImArr", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "暂停图片" })
    ], GameView.prototype, "topPauseImArr", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "底部图片" })
    ], GameView.prototype, "bottomImArr", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "顶部图片" })
    ], GameView.prototype, "topImArr", void 0);
    __decorate([
        property({ type: cc.Sprite, visible: true, displayName: "背景适配节点" })
    ], GameView.prototype, "bgFitSprite", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "背景适配图片" })
    ], GameView.prototype, "bgFitImArr", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "疯狂模式进度条节点" })
    ], GameView.prototype, "crazyProgressNode", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "进度图片" })
    ], GameView.prototype, "barImArr", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "进入疯狂模式" })
    ], GameView.prototype, "crazyCutToPrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "退出疯狂模式" })
    ], GameView.prototype, "crazyCutOutPrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "疯狂模式球等待触发特效" })
    ], GameView.prototype, "crazyTriggerPrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "疯狂模式球变为普通球" })
    ], GameView.prototype, "crazyToNomalPrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "疯狂模式进行中" })
    ], GameView.prototype, "crazyLivePrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "复活特效" })
    ], GameView.prototype, "revivalePrefab", void 0);
    __decorate([
        property({ type: cc.Prefab, visible: true, displayName: "大于11球的双击特效" })
    ], GameView.prototype, "balldoubleClick", void 0);
    GameView = __decorate([
        ccclass
    ], GameView);
    return GameView;
}(cc.Component));
exports.default = GameView;

cc._RF.pop();