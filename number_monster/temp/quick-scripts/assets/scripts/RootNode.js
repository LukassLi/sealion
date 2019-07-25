(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/RootNode.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'f22f0kbeslE4KXpzECgbHqB', 'RootNode', __filename);
// scripts/RootNode.ts

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)
Object.defineProperty(exports, "__esModule", { value: true });
//永驻节点处理微信域
var GameLog_1 = require("./GameLog");
var MySound_1 = require("./MySound");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
/** 消息名称 */
exports.postMessageName = {
    finish: "finish",
    charts: "charts",
    group: "group",
    openId: "openid",
    chartsBack: "chartsBack",
    finishBack: "finishBack",
    finishHide: "finishHide",
    revival: "revival",
    revivalBack: "revivalBack",
    updateScore: "updateScore",
};
/** 保存本地key */
exports.storageKey = {
    score: "local_score",
    config: "local_config",
    openid: "local_openid",
    firstOpen: "local_first_open_game",
    isKid: "local_Kid",
};
var RootNode = /** @class */ (function (_super) {
    __extends(RootNode, _super);
    function RootNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** 用户数据 */
        _this.userDate = {
            curscore: 0,
            maxscore: 0,
            maxweekscore: 0,
            weeknum: -1,
        };
        /** 显示群排行 */
        _this.showGroup = undefined;
        /** 日志 */
        _this.gameLog = undefined;
        /** 游戏配置 */
        _this._config = undefined;
        /** 展示微信域组件 */
        _this.wxSubView = undefined;
        /** 配置版本号 */
        _this._version = 0;
        /** 儿童版配置号 */
        _this._kidversion = 0;
        /** 是否是儿童版 */
        _this._isKid = false;
        /** 是否给子域发送过初始化信息 */
        _this.isSentInit = false;
        /** 是否是第一次登入 */
        _this.islunch = false;
        /** 是否为正式版 */
        _this.isRelease = true;
        /** 分享文案 */
        _this.shareString = [
            '会一加一就能玩，全国只有1%能上20000分！',
            '从小被数学虐? 这回给你机会打败学霸!',
            '凑十加法过不了10000分? 幼儿园的娃都比你强!'
        ];
        /** 群分享文案 */
        _this.groupString = [
            '听说这个群里个个都是人才敢不敢和我来一场高手之间的脑力对决！',
            '我向你发起挑战，你小学毕业了吗？'
        ];
        /** 分享图片url */
        _this.imageUrl = [
            "https://mmocgame.qpic.cn/wechatgame/3opnTXQiccus22cBo75MYk0D7HXDAnzeV7ns2XnibZAc64fhZib6fBC9WKJ6SoTOkYq/0",
            "https://mmocgame.qpic.cn/wechatgame/3opnTXQiccusjMUIOiaEw6RS0JnmtzNfHsjUQJbLPFibvS30osmNJxYwPKr0nT1GW6V/0",
        ];
        /** 分享图片id */
        _this.imageUrlId = [
            "wn4rHZIkTReQ9hYos9-oHQ",
            "iJXKHNcuTOG9C3jtMZod0Q"
        ];
        /** 上传url前半部分 */
        _this.urlhead = "https://log.mathufo.com/number_monster/v1.0/";
        return _this;
    }
    RootNode_1 = RootNode;
    RootNode.prototype.onLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                RootNode_1.instance = this;
                cc.game.addPersistRootNode(this.node);
                this.wxSubView = this.node.getComponent(cc.WXSubContextView);
                this.wxSubView.enabled = false;
                this.initKid();
                this.initShareMenu();
                this.wxListener();
                this.release();
                this.gameLog = new GameLog_1.default();
                RootNode_1.instance.initLogin();
                return [2 /*return*/];
            });
        });
    };
    RootNode.prototype.start = function () {
        this.fixPosition();
    };
    //微信事件监听
    RootNode.prototype.wxListener = function () {
        var _this = this;
        if (typeof wx == "undefined") {
            return;
        }
        var self = this;
        //小游戏回到前台,用于群排行
        wx.onShow(function (res) {
            var query = res.query.type;
            var ticket = res.shareTicket;
            if (query == "group" && _this.showGroup != undefined && ticket != undefined) {
                _this.showGroup(ticket);
            }
            if (res.query.version == "child" && !_this.isKid) {
                _this.isKid = true;
                _this.loadScene("load");
            }
        });
        //监听内存不足
        wx.onMemoryWarning(function (res) {
            _this.gameLog.sendMemoryWarning(res.level);
        });
        //监听错误
        wx.onError(function (res) {
            _this.gameLog.sendError(res.message, res.stack);
        });
        //退到后台暂停游戏
        cc.game.on(cc.game.EVENT_HIDE, function () {
            //退到后台时,发送操作日志
            self.gameLog.recordAction("signOut");
            self.gameLog.sendAction();
            cc.game.pause();
        }, this);
        //回到前台重启游戏
        cc.game.on(cc.game.EVENT_SHOW, function () {
            cc.game.resume();
            if (MySound_1.default.instance) {
                MySound_1.default.instance.setBgm();
            }
        }, this);
        wx.onAudioInterruptionBegin(function () {
            cc.game.pause();
        });
        wx.onAudioInterruptionEnd(function () {
            cc.game.resume();
            if (MySound_1.default.instance) {
                MySound_1.default.instance.setBgm();
            }
        });
    };
    /**
     * 主动触发回收
     */
    RootNode.prototype.triggerGC = function () {
        if (typeof wx != "undefined")
            wx.triggerGC();
    };
    /**
     * 刘海屏调整位置
     */
    RootNode.prototype.fixPosition = function () {
        var pos = this.node.position;
        pos.y -= RootNode_1.fixHeight;
        this.node.position = pos;
    };
    /**
     *
     * @param time 渐显时间
     */
    RootNode.prototype.fadeIn = function (time) {
        this.node.active = true;
        this.node.runAction(cc.fadeIn(time));
    };
    /**
     * 获取本地数据
     * @param name 保存数据名字
     */
    RootNode.prototype.getLocalStorage = function (name) {
        var value = undefined;
        if (window.localStorage) {
            value = window.localStorage.getItem(name);
        }
        return value;
    };
    /**
     * 保存本地数据
     * @param name 保存数据名字
     * @param value 保存的值
     */
    RootNode.prototype.setLocalStorage = function (name, value) {
        if (window.localStorage) {
            window.localStorage.setItem(name, value);
        }
    };
    /** 启动时是否是拉起群排行 */
    RootNode.prototype.LunchGroup = function () {
        //拉起启动群排行只执行一次
        if (this.islunch)
            return;
        this.islunch = true;
        var ticket = RootNode_1.instance.isLunchGroupShare();
        //进入信息包括群分享ticket,群分享展示否则更新数据
        if (ticket && this.showGroup != undefined)
            this.showGroup(ticket);
    };
    Object.defineProperty(RootNode.prototype, "initSuccess", {
        /**
         * 初始化成功
         */
        get: function () {
            //获取到openid 和 玩家信息为初始化成功
            if (this.openId != undefined && this.userDate.weeknum != -1)
                return true;
            return false;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 初始化超时.弹提示信息
     * @param chart 排行榜面板
     */
    RootNode.prototype.InitTimeOut = function (chart) {
        if (typeof wx == "undefined") {
            return;
        }
        var self = this;
        wx.showModal({
            title: '提示',
            content: '网络异常,拉取数据失败',
            cancelText: '取消',
            confirmText: '重试',
            confirmColor: '#5B6A91',
            success: function (res) {
                if (res.confirm) {
                    self.initLogin();
                    chart.postMessage();
                }
                else if (res.cancel) {
                }
            }
        });
    };
    /**
     * 更新分数
     * @param score 分数
     */
    RootNode.prototype.updateScore = function (score) {
        var _this = this;
        var self = this;
        return new Promise(function (reslove, reject) {
            if (typeof wx == "undefined") {
                var userdata = {
                    curscore: score,
                    maxscore: score,
                    maxweekscore: score,
                    weeknum: -1
                };
                self.userDate = userdata;
                reslove(true);
            }
            if (_this.openId == '') {
                reslove(false);
                return;
            }
            wx.request({
                url: self.getUrl('update_score'),
                data: {
                    "openid": self.openId,
                    "score": score,
                    "version": self._version,
                    "kids_version": self._kidversion
                },
                method: "POST",
                success: function (res) {
                    reslove(true);
                    if (res.data) {
                        //有错误码
                        if (res.data.error != null)
                            return;
                        var data = res.data.data;
                        self.userDate = data;
                        if (data.config.json != undefined)
                            self.saveConfig(data.config);
                        if (data.kids_config.json != undefined)
                            self.saveConfig(data.kids_config, true);
                        //最新分数比重传分数高,或者重传分数
                        if (score >= self.score && self.score != 0) {
                            self.score = 0;
                            self.postMessage(exports.postMessageName.updateScore, self.userDate);
                        }
                    }
                    reslove(true);
                },
                fail: function (res) {
                    //重传
                    if (RootNode_1.currentScene == "game")
                        self.scoreRetransmission(score);
                    else //首界面,有重传数据
                        self.haveScoreRetransmission();
                    reslove(false);
                    //重传
                }
            });
        });
    };
    /**
     * 发送消息
     * @param typeStr 类型
     * @param valueObj 值
     */
    RootNode.prototype.postMessage = function (typeStr, valueObj) {
        if (typeof wx == "undefined") {
            return;
        }
        //每次发消息,判断初始化不成功或者没有发送初始化消息给子域都需要尝试初始化
        if (!this.initSuccess || !this.isSentInit) {
            this.initLogin();
        }
        var openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            type: typeStr,
            value: valueObj,
        });
        this.setUpdateWechatSubCanvas(typeStr);
    };
    /**
     * 跳转界面
     * @param scene 界面
     */
    RootNode.prototype.loadScene = function (scene) {
        RootNode_1.currentScene = scene;
        cc.director.loadScene(scene);
        if (MySound_1.default.instance != undefined)
            MySound_1.default.instance.crazy = false;
    };
    /**
     * 分享按钮
     */
    RootNode.prototype.onShareBtn = function (num) {
        if (num === void 0) { num = 0; }
        if (typeof wx == "undefined") {
            return;
        }
        wx.aldShareAppMessage({
            title: this.shareString.random(),
            imageUrlId: this.imageUrlId[num],
            imageUrl: this.imageUrl[num],
        });
    };
    /**
     * 群排行
     */
    RootNode.prototype.onLookGroupBtnClicked = function () {
        if (typeof wx == "undefined") {
            return;
        }
        wx.aldShareAppMessage({
            title: this.groupString.random(),
            imageUrlId: this.imageUrlId[0],
            imageUrl: this.imageUrl[0],
            query: "type=group",
        });
    };
    ;
    /**
     * 是否从群分享启动
     */
    RootNode.prototype.isLunchGroupShare = function () {
        if (typeof wx == "undefined") {
            return;
        }
        var self = this;
        var res = wx.getLaunchOptionsSync();
        var query = JSON.stringify(res.query);
        var referrerinfo = JSON.stringify(res.referrerInfo);
        var shareTicket = res.shareTicket;
        wx.getSystemInfo({
            success: function (date) {
                //登入日志
                var systemInfo = JSON.stringify(date);
                self.gameLog.sendLaunchInfoLog(res.scene, query, shareTicket, referrerinfo, systemInfo);
            }
        });
        if (res.query.type != "group")
            return undefined;
        return res.shareTicket;
    };
    Object.defineProperty(RootNode.prototype, "openId", {
        /**
        * 获取id(有id就是登入过)
        */
        get: function () {
            return this.getLocalStorage(exports.storageKey.openid);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RootNode.prototype, "version", {
        /**
         * 获取版本号
         */
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RootNode.prototype, "kidVersion", {
        /**
         * 获取儿童版本号
         */
        get: function () {
            return this._kidversion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RootNode.prototype, "isKid", {
        /**
         * 获取是否为儿童版
         */
        get: function () {
            return this._isKid;
        },
        /**
        * 获取是否为儿童版
        */
        set: function (flag) {
            if (this._isKid != flag) {
                this._isKid = flag;
                this.readGameConfig();
                var value = flag ? 'yes' : 'no';
                this.setLocalStorage(exports.storageKey.isKid, value);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 跳转到小程序
     */
    RootNode.prototype.jumpApp = function () {
        if (typeof wx == "undefined") {
            return;
        }
        wx.navigateToMiniProgram({
            appId: 'wxcc9d6a288b8edebd',
        });
    };
    Object.defineProperty(RootNode.prototype, "newPlayer", {
        /**
         * 获取是否为新手
         */
        get: function () {
            return this.getLocalStorage(exports.storageKey.firstOpen) != "no";
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 设置为非新手
     */
    RootNode.prototype.setNewPlayer = function () {
        this.setLocalStorage(exports.storageKey.firstOpen, "no");
    };
    /**
     * load界面跳转游戏界面
     */
    RootNode.prototype.loadJump = function () {
        this.loadScene("home");
    };
    /**
     * 配置读取生成速度
     */
    RootNode.prototype.getBallCreatDic = function () {
        return this.config.ballCreatDic;
    };
    /**
     * 配置读取重力信息
     */
    RootNode.prototype.getGravityDic = function () {
        return this.config.gravityDic;
    };
    /**
    * 配置读取生成概率信息
    */
    RootNode.prototype.getBallOddsDic = function () {
        return this.config.ballOddsDic;
    };
    /**
    * 配置读取疯狂模式信息
    */
    RootNode.prototype.getCrazyDic = function () {
        return this.config.crazyDic;
    };
    Object.defineProperty(RootNode.prototype, "config", {
        /**
         * 使用配置,当配置没有的时候再读一次
         */
        get: function () {
            if (this._config == undefined)
                this.readGameConfig();
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 有重传分数,重传
     */
    RootNode.prototype.haveScoreRetransmission = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                if (typeof wx == "undefined") {
                    return [2 /*return*/];
                }
                if (this.score == 0)
                    return [2 /*return*/];
                self = this;
                wx.showModal({
                    title: '提示',
                    content: '当前有分数未上传成功,是否重试',
                    cancelText: '取消',
                    confirmText: '重试',
                    confirmColor: '#5B6A91',
                    success: function (res) {
                        if (res.confirm) {
                            self.updateScore(self.score);
                        }
                        else if (res.cancel) {
                            self.score = 0;
                        }
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * 读取是否为儿童版
     */
    RootNode.prototype.initKid = function () {
        var value = this.getLocalStorage(exports.storageKey.isKid);
        this._isKid = value == 'yes';
    };
    /**
    * 是否从app打开
    */
    RootNode.prototype.isLunchApp = function () {
        if (typeof wx == "undefined") {
            return;
        }
        var res = wx.getLaunchOptionsSync();
        if (res.query.version == "child")
            this.isKid = true;
    };
    /**
    * 分数重传
    */
    RootNode.prototype.scoreRetransmission = function (score) {
        if (typeof wx == "undefined") {
            return;
        }
        var self = this;
        //保存的数据比本次高,不弹出框,等于0可能是初始化
        if (this.score > score || score == 0)
            return;
        wx.showModal({
            title: '提示',
            content: '分数上传失败,请检测网络状态重试',
            cancelText: '延后上传',
            confirmText: '重试',
            confirmColor: '#5B6A91',
            success: function (res) {
                if (res.confirm) {
                    self.updateScore(score);
                }
                else if (res.cancel) {
                    self.score = score;
                }
            }
        });
    };
    /**
    * 登入信息初始化
    */
    RootNode.prototype.initLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isLunchApp();
                        return [4 /*yield*/, this.LogIn()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, RootNode_1.instance.updateScore(0)];
                    case 2:
                        _a.sent();
                        //初始化成功传递消息给子域
                        if (this.initSuccess) {
                            value = {};
                            value.openid = this.openId;
                            value.weeknum = this.userDate.weeknum;
                            this.isSentInit = true;
                            this.postMessage(exports.postMessageName.openId, value);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(RootNode.prototype, "score", {
        /**
         * 保存的分数信息
         */
        get: function () {
            var value = this.getLocalStorage(exports.storageKey.score);
            if (value == undefined || value == '')
                return 0;
            return parseInt(value);
        },
        /**
         * 设置保存分数
         */
        set: function (num) {
            this.setLocalStorage(exports.storageKey.score, num.toString());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 右上角
     */
    RootNode.prototype.initShareMenu = function () {
        if (typeof wx == "undefined") {
            return;
        }
        //开启右上角的分享
        wx.showShareMenu();
        //微信开启群分享
        wx.updateShareMenu({
            withShareTicket: true
        });
        var self = this;
        wx.aldOnShareAppMessage(function (res) {
            return {
                title: self.shareString.random(),
                imageUrlId: self.imageUrlId[0],
                imageUrl: self.imageUrl[0],
            };
        });
    };
    /**
   * 登入获取openId,主要为更新微信数据
   */
    RootNode.prototype.LogIn = function () {
        if (typeof wx == "undefined") {
            return;
        }
        var self = this;
        return new Promise(function (reslove, reject) {
            wx.login({
                success: function (res) {
                    if (res.code) {
                        // 发起网络请求
                        wx.request({
                            url: self.getUrl('login_wx'),
                            data: {
                                code: res.code
                            },
                            method: "POST",
                            success: function (res) {
                                if (res.data) {
                                    reslove(res.data.data.openid);
                                    //有错误码,没有正确的取到openid
                                    if (res.data.error != null)
                                        return;
                                    var openId = res.data.data.openid;
                                    self.setLocalStorage(exports.storageKey.openid, openId);
                                }
                                else {
                                    reslove("res data error");
                                }
                            },
                            fail: function () {
                                reslove("api failed");
                            }
                        });
                    }
                    else {
                        reslove("wx error");
                    }
                },
                fail: function () {
                    reslove('failed');
                }
            });
        });
    };
    /**
    * 获取是否为正式版
    */
    RootNode.prototype.release = function () {
        if (typeof wx == "undefined") {
            this.readGameConfig();
            return;
        }
        var self = this;
        // 发起网络请求
        wx.request({
            url: self.getUrl("is_release"),
            method: "POST",
            success: function (res) {
                if (res.data) {
                    self.isRelease = res.data.data.is_release;
                }
            },
            complete: function () {
                self.readGameConfig();
            }
        });
    };
    /**
     * 设置子域更新
     * @param typeStr 消息类型
     */
    RootNode.prototype.setUpdateWechatSubCanvas = function (typeStr) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                //清除未完成的计时器
                this.unscheduleAllCallbacks();
                //排行榜
                if (typeStr == exports.postMessageName.charts || typeStr == exports.postMessageName.group) {
                    this.wxSubView.enabled = true;
                }
                else if (typeStr != exports.postMessageName.openId && typeStr != exports.postMessageName.updateScore) //给子域发送id 和 更新分数不需要改变子域界面 
                 {
                    this.wxSubView.enabled = true;
                    this.scheduleOnce(function () {
                        _this.wxSubView.enabled = false;
                    }, 5);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取配置信息
     */
    RootNode.prototype.readGameConfig = function () {
        //初始配置版号
        this.initVersion();
        var key = this.isRelease ? "release" : "test";
        var type = this.isKid ? "kid" : "adult";
        key = type + "_" + key + "_" + exports.storageKey.config;
        var value = this.getLocalStorage(key);
        if (value != "" && value != undefined) {
            var data = JSON.parse(value);
            this._config = data.json;
        }
        else {
            var self_1 = this;
            var resouseKey = this.isKid ? 'GameConfig_child.json' : 'GameConfig.json';
            cc.loader.loadRes(resouseKey, function (err, object) {
                if (err) {
                    return;
                }
                var version = self_1.isKid ? self_1._kidversion : self_1._version;
                if (version > object.json.version)
                    return;
                self_1._config = object.json.json;
            });
        }
    };
    /**
    * 初始设置版号
    */
    RootNode.prototype.initVersion = function () {
        var release = this.isRelease ? "release" : "test";
        for (var i = 0; i < 2; i++) {
            var type = i == 0 ? "kid" : "adult";
            var key = type + "_" + release + "_" + exports.storageKey.config;
            var value = this.getLocalStorage(key);
            if (value != "" && value != undefined) {
                var data = JSON.parse(value);
                if (i == 0)
                    this._kidversion = Number(data.version);
                else
                    this._version = Number(data.version);
            }
        }
    };
    /**
     * 保存配置
     * @param data 配置
     * @param kid 是否为儿童版
     */
    RootNode.prototype.saveConfig = function (data, kid) {
        if (kid === void 0) { kid = false; }
        if (kid)
            this._kidversion = data.version;
        else
            this._version = data.version;
        if (this.isKid == kid)
            this._config = data.json;
        var key = this.isRelease ? "release" : "test";
        var type = kid ? "kid" : "adult";
        key = type + "_" + key + "_" + exports.storageKey.config;
        this.setLocalStorage(key, JSON.stringify(data));
    };
    /**
     * 获取url
     * @param str 字符登入还是更新分数
     */
    RootNode.prototype.getUrl = function (str) {
        return this.urlhead + str;
    };
    var RootNode_1;
    RootNode.instance = undefined;
    /** 当前scene */
    RootNode.currentScene = "";
    /** 刘海屏适配位置 */
    RootNode.fixHeight = 0;
    RootNode = RootNode_1 = __decorate([
        ccclass
    ], RootNode);
    return RootNode;
}(cc.Component));
exports.default = RootNode;

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
        //# sourceMappingURL=RootNode.js.map
        