"use strict";
cc._RF.push(module, 'ba4d0wh7S1ICIzmsGC2Piar', 'FinishCtrl');
// scripts/controller/FinishCtrl.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//结束页面
var FinishView_1 = require("../view/FinishView");
var GameCtrl_1 = require("./GameCtrl");
var MySound_1 = require("../MySound");
var RootNode_1 = require("../RootNode");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var Type;
(function (Type) {
    Type[Type["normal"] = 888] = "normal";
    Type[Type["week"] = 750] = "week";
    Type[Type["best"] = 650] = "best";
})(Type || (Type = {}));
var FinishCtrl = /** @class */ (function (_super) {
    __extends(FinishCtrl, _super);
    function FinishCtrl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FinishCtrl.prototype.start = function () {
        this.addEventListener();
    };
    /**
     * 控制面板打开
     * @param active 是否打开
     */
    FinishCtrl.prototype.open = function (active) {
        var instance = GameCtrl_1.default.instance;
        if (!active) {
            RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.finishBack, undefined);
            instance.maskPanl.active = false;
            this.node.active = false;
            return;
        }
        this.node.active = true;
        var data = RootNode_1.default.instance.userDate;
        data.curscore = instance.Score;
        this.setSize();
        RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.finish, data);
        this.node.runAction(cc.fadeIn(0.3));
        RootNode_1.default.instance.fadeIn(0.3);
        RootNode_1.default.instance.updateScore(instance.Score);
        RootNode_1.default.instance.gameLog.recordAction("finish");
        RootNode_1.default.instance.gameLog.sendAction();
    };
    /**
     * 监听重玩,返回首页按键
     */
    FinishCtrl.prototype.addEventListener = function () {
        this.replayBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            GameCtrl_1.default.instance.replay();
            //重玩开始记录游戏操作
            RootNode_1.default.instance.gameLog.startRecorder();
        });
        this.homeBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            RootNode_1.default.instance.postMessage(RootNode_1.postMessageName.finishBack, undefined);
            RootNode_1.default.instance.loadScene("home");
        });
        this.shareBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            RootNode_1.default.instance.onShareBtn(1);
        });
        this.chartsBtn.on("click", function () {
            MySound_1.default.instance.playAudio(MySound_1.AudioType.Button);
            GameCtrl_1.default.instance.charts.open();
        });
    };
    /**
     * 设置面板高度
     */
    FinishCtrl.prototype.setSize = function () {
        var data = RootNode_1.default.instance.userDate;
        //网络异常
        if (data.weeknum == -1) {
            this.node.height = Type.best;
            return;
        }
        var height = Type.normal;
        if (data.curscore > data.maxscore) {
            height = Type.best;
        }
        else if (data.curscore > data.maxweekscore) {
            height = Type.week;
        }
        this.node.height = height;
    };
    FinishCtrl = __decorate([
        ccclass
    ], FinishCtrl);
    return FinishCtrl;
}(FinishView_1.default));
exports.default = FinishCtrl;

cc._RF.pop();