"use strict";
cc._RF.push(module, 'a904bHxWNxHQpnoRYvPnset', 'whiteList');
// scripts/whiteList.ts

Object.defineProperty(exports, "__esModule", { value: true });
var RootNode_1 = require("./RootNode");
// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
//用于获取白名单openId
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var whiteList = /** @class */ (function (_super) {
    __extends(whiteList, _super);
    function whiteList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 点击次数 */
        _this.hold_one_click = 0;
        return _this;
    }
    whiteList.prototype.start = function () {
        var _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            _this.hold_one_click++;
            //点击3秒后清0
            var callback = function () {
                _this.hold_one_click = 0;
            };
            _this.scheduleOnce(callback, 3);
            //判断双击
            if (_this.hold_one_click > 5) {
                if (typeof wx == "undefined")
                    return;
                wx.setClipboardData({
                    data: RootNode_1.default.instance.openId,
                    success: function (res) {
                        wx.getClipboardData({
                            success: function (res) {
                                RootNode_1.default.instance.gameLog.sendWhiteList();
                            }
                        });
                    }
                });
            }
        });
    };
    whiteList = __decorate([
        ccclass
    ], whiteList);
    return whiteList;
}(cc.Component));
exports.default = whiteList;

cc._RF.pop();