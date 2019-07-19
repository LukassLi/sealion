"use strict";
cc._RF.push(module, 'c396bN5Y2JJVLlVliDHwt1I', 'GameLog');
// scripts/GameLog.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//游戏日志
var RootNode_1 = require("./RootNode");
var GameCtrl_1 = require("./controller/GameCtrl");
var MySound_1 = require("./MySound");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameLog = /** @class */ (function () {
    function GameLog() {
        /** 网址 */
        this.url = 'https://log-app-backend.log-global.aliyuncs.com/logstores/log_web/track?APIVersion=0.6.0';
        /** 小游戏版本 */
        this.app_version = "1.1.2";
        /** 资源版本号 */
        this.res_version = "1.1.3";
        /** 记录操作数据 */
        this.actionData = [];
        /** 游戏开始的时间 */
        this.startTime = 0;
        /** 随机id */
        this.id = 0;
        /** 上一次的错误 */
        this.lastError = '';
    }
    /**
     * 登入日志
     * @param scene 启动小游戏场景
     * @param query  启动小游戏的参数
     * @param shareTicket 群转发
     * @param referrerInfo 来源信息
     * @param systemInfo 系统信息
     */
    GameLog.prototype.sendLaunchInfoLog = function (scene, query, shareTicket, referrerInfo, systemInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var openid, url, formData;
            return __generator(this, function (_a) {
                openid = RootNode_1.default.instance.openId;
                url = this.url;
                formData = {
                    app: 'number_monster',
                    user_openid: openid,
                    app_version: this.app_version,
                    cfg_version: RootNode_1.default.instance.version,
                    cfg_kidversion: RootNode_1.default.instance.kidVersion,
                    gametype: RootNode_1.default.instance.isKid ? "kid" : "adult",
                    res_version: this.res_version,
                    type: "launch_info",
                    release: RootNode_1.default.instance.isRelease,
                    scene: scene,
                    query: query,
                    shareTicket: shareTicket,
                    referrerInfo: referrerInfo,
                    systemInfo: systemInfo
                };
                try {
                    wx.request({ url: url, data: formData, method: 'GET' });
                }
                catch (err) {
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 白名单日志
     */
    GameLog.prototype.sendWhiteList = function () {
        var openid = RootNode_1.default.instance.openId;
        var url = this.url;
        var formData = {
            app: 'number_monster',
            user_openid: openid,
            type: "launch_info",
            mute: MySound_1.default.instance.isMut,
            release: RootNode_1.default.instance.isRelease,
        };
        try {
            wx.request({ url: url, data: formData, method: 'GET' });
        }
        catch (err) {
        }
    };
    /**
     * 游戏操作开始记录
     */
    GameLog.prototype.startRecorder = function () {
        this.startTime = Date.now();
        this.id = Math.floor(Math.random() * 100000);
        this.actionData = [];
    };
    /**
     * 保存数据
     * @param type 操作类型 d 掉落 c 合并 s 拆分  creazy_start 疯狂开始 revival 复活
     * creazy_end 疯狂结束 pause 暂停 finish 结束 signOut 退出 skipGuide 退出新手引导
     * @param num  操作数1
     * @param num1 操作数2
     */
    GameLog.prototype.recordAction = function (type, num, num1) {
        if (num === void 0) { num = -1; }
        if (num1 === void 0) { num1 = -1; }
        //100毫秒为单位的整数
        var time = Math.floor((Date.now() - this.startTime) / 100);
        var action = time + type + (num == -1 ? "" : num.toString(16)) + (num1 == -1 ? "" : num1.toString(16));
        this.actionData.push(action);
    };
    /**
     * 错误上报
     * @param message 错误
     * @param stack 错误调用堆栈
     */
    GameLog.prototype.sendError = function (message, stack) {
        if (typeof wx == "undefined")
            return;
        //相同错误不重复上报
        if (this.lastError == message)
            return;
        this.lastError = message;
        var url = this.url;
        var openid = RootNode_1.default.instance.openId;
        var formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode_1.default.instance.version,
            cfg_kidversion: RootNode_1.default.instance.kidVersion,
            gametype: RootNode_1.default.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            release: RootNode_1.default.instance.isRelease,
            user_openid: openid,
            type: "Error",
            message: message,
            stack: stack,
        };
        try {
            wx.request({ url: url, data: formData, method: 'GET' });
        }
        catch (err) {
        }
    };
    /**
     * 内存警告,只有安卓才有
     * @param level 警告等级
     */
    GameLog.prototype.sendMemoryWarning = function (level) {
        if (typeof wx == "undefined")
            return;
        var url = this.url;
        var openid = RootNode_1.default.instance.openId;
        var formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode_1.default.instance.version,
            cfg_kidversion: RootNode_1.default.instance.kidVersion,
            gametype: RootNode_1.default.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            user_openid: openid,
            release: RootNode_1.default.instance.isRelease,
            type: "memory_warning",
            data: level,
        };
        try {
            wx.request({ url: url, data: formData, method: 'GET' });
        }
        catch (err) {
        }
    };
    /**
     * 发送操作日志
     */
    GameLog.prototype.sendAction = function () {
        if (RootNode_1.default.currentScene != "game") {
            return;
        }
        var length = this.actionData.length;
        var section = 0;
        while (this.actionData.length > 0) {
            var arr = this.actionData.splice(0, 1800);
            var data = arr.join(",");
            this.sendSection(length, section, data);
            section++;
        }
    };
    /**
     * 数据包发送,可能存在数据太长,分多个包发送的情况
     * @param length 总的数据长度
     * @param section 第几个包
     * @param data 数据
     */
    GameLog.prototype.sendSection = function (length, section, data) {
        if (typeof wx == "undefined" || GameCtrl_1.default.instance == undefined)
            return;
        var url = this.url;
        var openid = RootNode_1.default.instance.openId;
        var formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode_1.default.instance.version,
            cfg_kidversion: RootNode_1.default.instance.kidVersion,
            gametype: RootNode_1.default.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            release: RootNode_1.default.instance.isRelease,
            user_openid: openid,
            type: "action",
            steps: length,
            score: GameCtrl_1.default.instance.Score,
            id: this.id,
            section: section,
            data: data
        };
        try {
            wx.request({ url: url, data: formData, method: 'GET' });
        }
        catch (err) {
        }
    };
    GameLog = __decorate([
        ccclass
    ], GameLog);
    return GameLog;
}());
exports.default = GameLog;

cc._RF.pop();