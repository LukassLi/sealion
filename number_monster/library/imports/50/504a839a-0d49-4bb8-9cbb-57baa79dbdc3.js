"use strict";
cc._RF.push(module, '504a8OaDUlLuJy7V7qnnb3D', 'FinishView');
// scripts/view/FinishView.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var FinishView = /** @class */ (function (_super) {
    __extends(FinishView, _super);
    function FinishView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.shareBtn = undefined;
        _this.replayBtn = undefined;
        _this.homeBtn = undefined;
        _this.chartsBtn = undefined;
        return _this;
    }
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "分享按钮" })
    ], FinishView.prototype, "shareBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "重玩按钮" })
    ], FinishView.prototype, "replayBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "返回主页按钮" })
    ], FinishView.prototype, "homeBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "查看排行榜按钮" })
    ], FinishView.prototype, "chartsBtn", void 0);
    FinishView = __decorate([
        ccclass
    ], FinishView);
    return FinishView;
}(cc.Component));
exports.default = FinishView;

cc._RF.pop();