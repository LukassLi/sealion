"use strict";
cc._RF.push(module, '8f8d1XVNftPq4hDYHBxtFOl', 'HomeHelp');
// scripts/view/HomeHelp.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//首页的帮助界面
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var HomeHelp = /** @class */ (function (_super) {
    __extends(HomeHelp, _super);
    function HomeHelp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.spotArr = [];
        _this.stepNode = undefined;
        _this.contentNode = undefined;
        _this.scrollNode = undefined;
        _this.backBtn = undefined;
        _this.btnSpriteFrameArr = [];
        /** 点的颜色 1为当前的颜色 */
        _this.spotColor = [cc.color(227, 212, 175), cc.color(173, 184, 96)];
        /** 第几个界面 */
        _this.step = 0;
        /** 是否在移动,移动时不能点下一步按钮 */
        _this.isMove = false;
        return _this;
    }
    HomeHelp.prototype.start = function () {
        var _this = this;
        this.backBtn.on('click', function () {
            _this.node.active = false;
        });
        this.stepNode.on('click', function () {
            if (!_this.isMove)
                _this.stepbtn();
        });
        this.scrollNode.on(cc.Node.EventType.TOUCH_START, function () {
            _this.contentNode.stopAllActions();
        }, this);
        this.scrollNode.on(cc.Node.EventType.TOUCH_END, function () {
            _this.touchEnd();
        }, this);
        this.scrollNode.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            _this.touchEnd();
        }, this);
        var size = this.scrollNode.getContentSize();
        if (size.height > 1000)
            size.height = 1000;
        this.scrollNode.setContentSize(size);
    };
    /**
     * 打开
     */
    HomeHelp.prototype.open = function () {
        this.node.active = true;
        this.contentNode.stopAllActions();
        this.contentNode.position = cc.Vec2.ZERO;
        this.initStep();
    };
    /**
     * 下一步按钮
     */
    HomeHelp.prototype.stepbtn = function () {
        MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
        if (this.step == 2)
            RootNode_1.default.instance.loadScene("game");
        else
            this.stepAction(this.step + 1);
    };
    /**
     * 触碰结束
     */
    HomeHelp.prototype.touchEnd = function () {
        var index = this.contentNode.position.x < -this.step * 670 ? this.step + 1 : this.step - 1;
        if (index < 0 || index > 2)
            return;
        this.stepAction(index);
    };
    /**
     * 滑动
     * @param index 滑动到第几步
     */
    HomeHelp.prototype.stepAction = function (index) {
        var _this = this;
        this.contentNode.stopAllActions();
        var positionX = this.contentNode.position.x;
        var target = -index * 670;
        var disparity = Math.abs(positionX - target);
        this.isMove = true;
        var action = cc.sequence([
            cc.moveTo(disparity / 670 * 0.3, new cc.Vec2(target, 0)),
            cc.callFunc(function () {
                _this.initStep(index);
            })
        ]);
        this.contentNode.runAction(action);
    };
    /**
     * 步骤设置
     * @param index 第几步
     */
    HomeHelp.prototype.initStep = function (index) {
        if (index === void 0) { index = 0; }
        this.step = index;
        //设置点的颜色
        for (var i = 0; i < 3; i++) {
            if (i == index)
                this.spotArr[i].color = this.spotColor[1];
            else
                this.spotArr[i].color = this.spotColor[0];
        }
        var num = index == 2 ? 1 : 0;
        var sprite = this.stepNode.getComponent(cc.Sprite);
        sprite.spriteFrame = this.btnSpriteFrameArr[num];
        this.isMove = false;
    };
    __decorate([
        property({ type: [cc.Node], visible: true, displayName: "表示哪一页的三个点" })
    ], HomeHelp.prototype, "spotArr", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "下一步还是开始按钮" })
    ], HomeHelp.prototype, "stepNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "内容" })
    ], HomeHelp.prototype, "contentNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "滑动节点" })
    ], HomeHelp.prototype, "scrollNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "返回按钮" })
    ], HomeHelp.prototype, "backBtn", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "按钮图片" })
    ], HomeHelp.prototype, "btnSpriteFrameArr", void 0);
    HomeHelp = __decorate([
        ccclass
    ], HomeHelp);
    return HomeHelp;
}(cc.Component));
exports.default = HomeHelp;

cc._RF.pop();