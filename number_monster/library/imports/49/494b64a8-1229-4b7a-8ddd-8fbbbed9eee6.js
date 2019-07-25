"use strict";
cc._RF.push(module, '494b6SoEilLeo3dj7u+2e7m', 'HomeView');
// scripts/view/HomeView.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
var Charts_1 = require("../controller/Charts");
var HomeHelp_1 = require("./HomeHelp");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var HomeView = /** @class */ (function (_super) {
    __extends(HomeView, _super);
    function HomeView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fixedNode = undefined;
        _this.tips = undefined;
        _this.guideBtn = undefined;
        _this.homeHelp = undefined;
        _this.chartsBtn = undefined;
        _this.shareBtn = undefined;
        _this.starBtn = undefined;
        _this.monsterBtn = undefined;
        _this.subscriptionBtn = undefined;
        _this.charts = undefined;
        _this.startBtn = undefined;
        _this.soundBtn = undefined;
        _this.kidbtn = undefined;
        _this.soundSprite = undefined;
        _this.kidAnim = undefined;
        _this.soundArr = [];
        _this.subscriptionNode = undefined;
        return _this;
    }
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "根节点" })
    ], HomeView.prototype, "fixedNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "怪物图鉴未开通提示节点" })
    ], HomeView.prototype, "tips", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "引导按钮" })
    ], HomeView.prototype, "guideBtn", void 0);
    __decorate([
        property({ type: HomeHelp_1.default, visible: true, displayName: "帮助脚本" })
    ], HomeView.prototype, "homeHelp", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "排行榜按钮" })
    ], HomeView.prototype, "chartsBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "分享按钮" })
    ], HomeView.prototype, "shareBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "数感星球按钮" })
    ], HomeView.prototype, "starBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "怪物图鉴按钮" })
    ], HomeView.prototype, "monsterBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "公众号按钮" })
    ], HomeView.prototype, "subscriptionBtn", void 0);
    __decorate([
        property({ type: Charts_1.default, visible: true, displayName: "排行榜" })
    ], HomeView.prototype, "charts", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "开始游戏按钮" })
    ], HomeView.prototype, "startBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "声音按钮" })
    ], HomeView.prototype, "soundBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "切换游戏版本" })
    ], HomeView.prototype, "kidbtn", void 0);
    __decorate([
        property({ type: cc.Sprite, visible: true, displayName: "声音sprite" })
    ], HomeView.prototype, "soundSprite", void 0);
    __decorate([
        property({ type: cc.Animation, visible: true, displayName: "版本切换动画" })
    ], HomeView.prototype, "kidAnim", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "声音图片" })
    ], HomeView.prototype, "soundArr", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "公众号引导面板" })
    ], HomeView.prototype, "subscriptionNode", void 0);
    HomeView = __decorate([
        ccclass
    ], HomeView);
    return HomeView;
}(cc.Component));
exports.default = HomeView;

cc._RF.pop();