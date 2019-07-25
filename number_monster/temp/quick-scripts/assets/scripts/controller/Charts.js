(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/controller/Charts.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ad0b0NnakVL5oDU/ClKTyql', 'Charts', __filename);
// scripts/controller/Charts.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//排行榜
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var GameCtrl_1 = require("./GameCtrl");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Type;
(function (Type) {
    Type[Type["charts"] = 0] = "charts";
    Type[Type["group"] = 1] = "group";
})(Type || (Type = {}));
var Charts = /** @class */ (function (_super) {
    __extends(Charts, _super);
    function Charts() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupNode = undefined;
        _this.chartsBackBtn = undefined;
        _this.arrowNote = undefined;
        _this.spriteArr = [];
        _this.btnLable = undefined;
        _this.title = undefined;
        /** 状态:有排行榜和群排行两种 */
        _this.type = Type.charts;
        /** 发送给开放域的消息类型 */
        _this.messageType = undefined;
        /** 发送给开放域的值,群排行有 */
        _this.messageValue = undefined;
        /** 退出回调 */
        _this.outCallback = false;
        return _this;
    }
    Charts.prototype.start = function () {
        var _this = this;
        this.node.zIndex = 11;
        this.groupNode.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            if (_this.type == Type.charts)
                RootNode_1.default.instance.onLookGroupBtnClicked();
            else //群排行
             {
                RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.chartsBack, undefined);
                _this.outCallback = true;
                //首界面
                if (RootNode_1.default.currentScene == "home")
                    RootNode_1.default.instance.loadScene("game");
                else //游戏界面
                 {
                    _this.node.active = false;
                    GameCtrl_1.default.instance.replay();
                }
            }
        });
        this.chartsBackBtn.on("click", function () {
            RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.chartsBack, RootNode_1.default.currentScene);
            _this.node.active = false;
            _this.outCallback = true;
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            _this.setType(Type.charts);
            //如果是游戏界面
            if (RootNode_1.default.currentScene == "game")
                GameCtrl_1.default.instance.groupPause = false;
        });
    };
    /**
     * 设置状态
     * @param type 状态
     */
    Charts.prototype.setType = function (type) {
        if (this.type == type)
            return;
        if (type == Type.charts) {
            this.title.string = "排行榜";
            this.btnLable.string = "查看群排行";
        }
        else {
            this.btnLable.string = "我也要挑战";
            this.title.string = "群排行榜";
        }
        this.type = type;
        this.arrowNote.active = type != Type.charts;
        this.btnLable.node.position = type == Type.charts ? cc.Vec2.ZERO : new cc.Vec2(-18, 0);
        this.groupNode.getComponent(cc.Sprite).spriteFrame = type == Type.charts ? this.spriteArr[0] : this.spriteArr[1];
    };
    /**
     * 面板打开
     * @param enable
     */
    Charts.prototype.open = function () {
        this.node.active = true;
        this.messageType = RootNode_1.postMessageName.charts;
        this.messageValue = undefined;
        this.postMessage();
    };
    /**
     * 群分享进入
     */
    Charts.prototype.groupLunch = function (ticket) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setType(Type.group);
                this.node.active = true;
                this.messageType = RootNode_1.postMessageName.group;
                this.messageValue = ticket;
                this.postMessage();
                return [2 /*return*/];
            });
        });
    };
    /**
     * 发送消息,加入初始化判定
     */
    Charts.prototype.postMessage = function () {
        var _this = this;
        var time = 0;
        //游戏结束时,结算界面隐藏
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.finishHide, undefined);
        this.outCallback = false;
        var callback = function () {
            if (_this.outCallback) {
                _this.unschedule(callback);
                return;
            }
            time += 0.1;
            //等待两秒,超时处理
            if (time > 2) {
                RootNode_1.default.instance.InitTimeOut(_this);
                _this.unschedule(callback);
            }
            //初始化成功,且面板是打开的,发送消息给开放域
            if (RootNode_1.default.instance.initSuccess) {
                RootNode_1.default.instance.postMessage(_this.messageType, _this.messageValue);
                _this.unschedule(callback);
            }
        };
        this.schedule(callback, 0.1);
    };
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "查看群排行" })
    ], Charts.prototype, "groupNode", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "排行榜返回" })
    ], Charts.prototype, "chartsBackBtn", void 0);
    __decorate([
        property({ type: cc.Node, visible: true, displayName: "箭头" })
    ], Charts.prototype, "arrowNote", void 0);
    __decorate([
        property({ type: [cc.SpriteFrame], visible: true, displayName: "群排行按钮图片" })
    ], Charts.prototype, "spriteArr", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "群分享上的文字" })
    ], Charts.prototype, "btnLable", void 0);
    __decorate([
        property({ type: cc.Label, visible: true, displayName: "标题" })
    ], Charts.prototype, "title", void 0);
    Charts = __decorate([
        ccclass
    ], Charts);
    return Charts;
}(cc.Component));
exports.default = Charts;

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
        //# sourceMappingURL=Charts.js.map
        