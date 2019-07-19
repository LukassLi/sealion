(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/controller/TopStrip.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '20590HDpfRAFJr8tGXyzKE/', 'TopStrip', __filename);
// scripts/controller/TopStrip.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//游戏上横栏,用于判断游戏结束
var Ball_1 = require("../view/Ball");
var GameCtrl_1 = require("../controller/GameCtrl");
var MySound_1 = require("../MySound");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TopStrip = /** @class */ (function (_super) {
    __extends(TopStrip, _super);
    function TopStrip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 触发的刚体 */
        _this.colliderArr = [];
        /** 触发球对应的触发时间 */
        _this.timeArr = [];
        /** 球数量,前五个球不放声音 */
        _this.count = 0;
        /** 是否判断标志 */
        _this.judgeFlag = false;
        /** 多久判断一次 */
        _this.time = 0;
        return _this;
    }
    /**
     * 开始结束判断
     */
    TopStrip.prototype.endJudgment = function () {
        this.count = 0;
        this.colliderArr = [];
        this.timeArr = [];
        this.judgeFlag = true;
        this.time = 0;
    };
    /**
     * 停止判断
     */
    TopStrip.prototype.stopJudgment = function () {
        this.judgeFlag = false;
    };
    TopStrip.prototype.onBeginContact = function (contact, selfCollider, otherCollider) {
        this.count++;
        if (this.count > 5) {
            this.sound(otherCollider.node);
            this.colliderArr.push(otherCollider);
            this.timeArr.push(0);
        }
    };
    TopStrip.prototype.onEndContact = function (contact, selfCollider, otherCollider) {
        var index = this.colliderArr.indexOf(otherCollider);
        if (index != -1) {
            this.colliderArr.splice(index, 1);
            this.timeArr.splice(index, 1);
        }
    };
    /**
     * 设置球下落音效
     * @param node 球
     */
    TopStrip.prototype.sound = function (node) {
        var ball = node.getComponent(Ball_1.default);
        var num = ball.ballNum;
        var audioNum = MySound_1.AudioType.DropNum1 + num - 1;
        MySound_1.default.instance.playAudio(audioNum);
    };
    TopStrip.prototype.update = function (dt) {
        if (GameCtrl_1.default.instance.pause == true || !this.judgeFlag)
            return;
        this.time += dt;
        if (this.time < 0.1)
            return;
        var length = this.timeArr.length;
        for (var i = 0; i < length; i++) {
            var time = this.timeArr[i] + this.time;
            if (time > 3) {
                this.end();
                break;
            }
            this.timeArr[i] = time;
        }
        this.time = 0;
    };
    /**
     * 判断结束
     */
    TopStrip.prototype.end = function () {
        //疯狂模式下,结束模式
        if (GameCtrl_1.default.instance.crazy)
            GameCtrl_1.default.instance.crazy = false;
        else
            GameCtrl_1.default.instance.gameOver();
    };
    TopStrip = __decorate([
        ccclass
    ], TopStrip);
    return TopStrip;
}(cc.Component));
exports.default = TopStrip;

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
        //# sourceMappingURL=TopStrip.js.map
        