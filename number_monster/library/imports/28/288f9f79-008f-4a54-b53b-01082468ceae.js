"use strict";
cc._RF.push(module, '288f995AI9KVLU7AQgkaM6u', 'Load');
// scripts/controller/Load.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//loading 界面
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Load = /** @class */ (function (_super) {
    __extends(Load, _super);
    function Load() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.bar = undefined;
        _this.manNode = undefined;
        _this.childNode = undefined;
        /** 进度条的长度 */
        _this.width = 520;
        _this.pro1 = 0;
        _this.pro2 = 0;
        _this.finishCount = 0;
        return _this;
    }
    Load.prototype.start = function () {
        var self = this;
        var callback = function () {
            self.finishCount += 1;
            if (self.finishCount == 2) {
                RootNode_1.default.instance.loadJump();
            }
        };
        cc.director.preloadScene("home", this.onProgress1.bind(this), function () {
            callback();
        });
        cc.director.preloadScene("game", this.onProgress2.bind(this), function () {
            callback();
        });
        this.manNode.active = !RootNode_1.default.instance.isKid;
        this.childNode.active = RootNode_1.default.instance.isKid;
    };
    Load.prototype.onProgress1 = function (completedCount, totalCount, item) {
        this.pro1 = completedCount / totalCount;
        this.onProgress();
    };
    Load.prototype.onProgress2 = function (completedCount, totalCount, item) {
        this.pro2 = completedCount / totalCount;
        this.onProgress();
    };
    Load.prototype.onProgress = function () {
        this.bar.width = (this.pro1 + this.pro2) / 2 * 520;
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "进度条" })
    ], Load.prototype, "bar", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "成人标题" })
    ], Load.prototype, "manNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "儿童标题" })
    ], Load.prototype, "childNode", void 0);
    Load = __decorate([
        ccclass
    ], Load);
    return Load;
}(cc.Component));
exports.default = Load;

cc._RF.pop();