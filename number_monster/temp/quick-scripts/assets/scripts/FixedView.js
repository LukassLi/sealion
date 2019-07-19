(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/FixedView.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '0bd1fGxx6FH5oCPd9gP0UYM', 'FixedView', __filename);
// scripts/FixedView.ts

Object.defineProperty(exports, "__esModule", { value: true });
var RootNode_1 = require("./RootNode");
// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
//用于界面适配
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var FixedView = /** @class */ (function (_super) {
    __extends(FixedView, _super);
    function FixedView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FixedView.prototype.onLoad = function () {
        this.fixedViewSize();
    };
    FixedView.prototype.fixedViewSize = function () {
        if (typeof wx == "undefined")
            return;
        //菜单按钮上边界
        var height = 0;
        //低版本可能没接口
        if (wx.getMenuButtonBoundingClientRect) {
            //获取菜单按钮（右上角胶囊按钮）的布局位置信息。
            var object = wx.getMenuButtonBoundingClientRect();
            height = object.top;
        }
        var nodeSize = new cc.Size(720, 1280);
        var size = cc.view.getFrameSize();
        var scale = size.width / size.height;
        if (scale < 9 / 16) {
            //有额头
            if (height > 5.625) {
                //比例换算
                height = height * 1280 / size.height;
            }
            else
                height = 0;
            nodeSize.height = 720 / scale - height;
            this.node.position = new cc.Vec2(0, -height / 2);
            RootNode_1.default.fixHeight = height / 2;
        }
        else
            nodeSize.width = 1280 * scale;
        this.node.setContentSize(nodeSize);
    };
    FixedView = __decorate([
        ccclass
    ], FixedView);
    return FixedView;
}(cc.Component));
exports.default = FixedView;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=FixedView.js.map
        