(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/controller/Revival.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '8b5164Ow2lLJrDM1/2/C3cz', 'Revival', __filename);
// scripts/controller/Revival.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
var MySound_1 = require("../MySound");
var GameCtrl_1 = require("./GameCtrl");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Revival = /** @class */ (function (_super) {
    __extends(Revival, _super);
    function Revival() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.revivalBtn = undefined;
        _this.skipBtn = undefined;
        _this.scoreLabel = undefined;
        /** 激励视频 */
        _this.videoAd = undefined;
        return _this;
    }
    Revival.prototype.start = function () {
        this.addEventListener();
    };
    /**
     * 面板打开
     */
    Revival.prototype.open = function () {
        this.node.active = true;
        var score = GameCtrl_1.default.instance.Score.toString();
        this.scoreLabel.string = score;
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.revival, score);
        RootNode_1.default.instance.fadeIn(0.3);
        this.node.runAction(cc.fadeIn(0.3));
        if (this.videoAd != undefined)
            this.videoAd.load();
    };
    /**
     * 面板关闭
     */
    Revival.prototype.close = function () {
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.revivalBack, undefined);
        this.node.active = false;
    };
    /**
     * 是否有复活
     */
    Revival.prototype.canRevival = function () {
        if (wx.createRewardedVideoAd && !RootNode_1.default.instance.isKid)
            return true;
        return false;
    };
    /**
     * 复活操作
     */
    Revival.prototype.revivalOperation = function () {
        this.node.active = false;
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.revivalBack, undefined);
        GameCtrl_1.default.instance.maskPanl.active = false;
        GameCtrl_1.default.instance.revivalTime = 0;
        GameCtrl_1.default.instance.revivalInit();
        RootNode_1.default.instance.gameLog.recordAction("revival");
    };
    /**
     * 监听按钮,渐变过程不能点击按钮
     */
    Revival.prototype.addEventListener = function () {
        var _this = this;
        this.revivalBtn.on("click", function () {
            if (_this.node.opacity < 255) {
                return;
            }
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.revival();
        });
        this.skipBtn.on("click", function () {
            if (_this.node.opacity < 255) {
                return;
            }
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.skip();
        });
        if (typeof wx == "undefined") {
            return;
        }
        //不是儿童版时创建激励视频
        if (wx.createRewardedVideoAd && !RootNode_1.default.instance.isKid) {
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-e8ea267b5679a9c8'
            });
            this.videoAd.onClose(function (res) {
                if (res.isEnded != undefined && res.isEnded == false)
                    return;
                _this.revivalOperation();
            });
        }
    };
    /**
     * 分享复活
     */
    Revival.prototype.revival = function () {
        var _this = this;
        if (this.videoAd != undefined) {
            this.videoAd.show().catch(function (err) {
                _this.videoAd.load();
            });
        }
    };
    /**
     * 跳过
     */
    Revival.prototype.skip = function () {
        this.node.active = false;
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.revivalBack, undefined);
        GameCtrl_1.default.instance.gameFinish.open(true);
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "复活分享" })
    ], Revival.prototype, "revivalBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "点击跳过" })
    ], Revival.prototype, "skipBtn", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "分数" })
    ], Revival.prototype, "scoreLabel", void 0);
    Revival = __decorate([
        ccclass
    ], Revival);
    return Revival;
}(cc.Component));
exports.default = Revival;

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
        //# sourceMappingURL=Revival.js.map
        