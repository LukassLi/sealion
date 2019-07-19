"use strict";
cc._RF.push(module, '04ef49RIBBOY5jH/52/5GUP', 'ComBo');
// scripts/view/ComBo.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//连击设置
var GameCtrl_1 = require("../controller/GameCtrl");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var ComboState;
(function (ComboState) {
    ComboState[ComboState["normal"] = 0] = "normal";
    ComboState[ComboState["crazy"] = 1] = "crazy";
})(ComboState || (ComboState = {}));
var ComBo = /** @class */ (function (_super) {
    __extends(ComBo, _super);
    function ComBo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.normalNode = undefined;
        _this.comBoNode = undefined;
        _this.numLable = undefined;
        _this.describe = undefined;
        _this.frameArr = [];
        _this.BgArr = [];
        _this.singNode = [];
        _this.state = ComboState.normal;
        return _this;
    }
    /**
     * 连击设置
     * @param num 连击数
     */
    ComBo.prototype.setCombo = function (num) {
        this.setState();
        if (this.state == ComboState.crazy)
            return;
        this.normalNode.active = num == 1;
        this.comBoNode.active = num != 1;
        this.initCombo(num);
    };
    /**
     * 连击初始化
     * @param num 连击数
     */
    ComBo.prototype.initCombo = function (num) {
        if (num == 1)
            return;
        this.numLable.string = num.toString();
        var frameSlect = 0;
        if (num == 10)
            frameSlect = 3;
        else if (num > 7)
            frameSlect = 2;
        else if (num > 4)
            frameSlect = 1;
        this.describe.spriteFrame = this.frameArr[frameSlect];
    };
    /**
     * 设置状态
     */
    ComBo.prototype.setState = function () {
        var value = GameCtrl_1.default.instance.crazy ? ComboState.crazy : ComboState.normal;
        if (this.state != value) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.BgArr[value];
            this.singNode[0].active = 0 == value;
            this.singNode[1].active = 1 == value;
            if (value == ComboState.crazy) {
                this.normalNode.active = false;
                this.comBoNode.active = true;
                this.numLable.string = GameCtrl_1.default.instance.crazyComboAdd.toString();
            }
            this.state = value;
        }
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "普通完成" })
    ], ComBo.prototype, "normalNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "连击完成" })
    ], ComBo.prototype, "comBoNode", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "连击数字" })
    ], ComBo.prototype, "numLable", void 0);
    __decorate([
        property({ type: cc.Sprite, visible: true, displayName: "连击描述" })
    ], ComBo.prototype, "describe", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "连击描述图片" })
    ], ComBo.prototype, "frameArr", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "背景图片" })
    ], ComBo.prototype, "BgArr", void 0);
    __decorate([
        property({ type: [cc.Node], visible: true, displayName: "符号节点" })
    ], ComBo.prototype, "singNode", void 0);
    ComBo = __decorate([
        ccclass
    ], ComBo);
    return ComBo;
}(cc.Component));
exports.default = ComBo;

cc._RF.pop();