"use strict";
cc._RF.push(module, '1d251mOEFZL1ImVoXxwIFGA', ' Subscription');
// scripts/view/ Subscription.ts

Object.defineProperty(exports, "__esModule", { value: true });
var MySound_1 = require("../MySound");
// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
//公众号引导
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Subscription = /** @class */ (function (_super) {
    __extends(Subscription, _super);
    function Subscription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.backBtn = undefined;
        return _this;
    }
    Subscription.prototype.start = function () {
        var _this = this;
        this.backBtn.on('click', function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.back();
        });
        cc.game.on(cc.game.EVENT_HIDE, function () {
            this.back();
        }, this);
    };
    Subscription.prototype.back = function () {
        this.node.active = false;
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "返回按钮" })
    ], Subscription.prototype, "backBtn", void 0);
    Subscription = __decorate([
        ccclass
    ], Subscription);
    return Subscription;
}(cc.Component));
exports.default = Subscription;

cc._RF.pop();