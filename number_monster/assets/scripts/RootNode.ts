// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//永驻节点处理微信域

import GameLog from "./GameLog";
import Charts from "./controller/Charts";
import MySound from "./MySound";
import ald = require("./utils/ald-game");

const { ccclass, property } = cc._decorator;

declare const wx: any;

/** 消息名称 */
export const postMessageName = {
    finish: "finish",            //游戏结束结算
    charts: "charts",            //排行榜
    group: "group",             //群排行
    openId: "openid",            //向子域传递自己的openID
    chartsBack: "chartsBack",    //排行榜关闭
    finishBack: "finishBack",    //结束界面关闭
    finishHide: "finishHide",    //结束界面隐藏
    revival: "revival",            //复活界面
    revivalBack: "revivalBack",    //复活界面关闭
    updateScore: "updateScore",    // 新分数更新数据
}

/** 保存本地key */
export const storageKey = {
    score: "local_score",               //存储上传失败的分数
    config: "local_config",             //存储配置信息        
    openid: "local_openid",             //游戏的openid
    firstOpen: "local_first_open_game",  //第一次进入游戏,新手引导
    isKid: "local_Kid",                  //是否为儿童版
}

interface data {
    curscore: number		//当前分数
    maxscore: number        //历史最高（本次分数之前的历史最高）
    maxweekscore: number    //周最高 （本次分数之前的周最高）
    weeknum: number         //第几周
}

@ccclass
export default class RootNode extends cc.Component {
    public static instance: RootNode = undefined;

    /** 当前scene */
    public static currentScene: string = "";

    /** 用户数据 */
    public userDate: data = {
        curscore: 0,
        maxscore: 0,
        maxweekscore: 0,
        weeknum: -1,
    };

    /** 显示群排行 */
    public showGroup: any = undefined;

    /** 日志 */
    public gameLog: GameLog = undefined;

    /** 刘海屏适配位置 */
    public static fixHeight: number = 0;

    /** 游戏配置 */
    private _config: any = undefined;

    /** 展示微信域组件 */
    private wxSubView: cc.WXSubContextView = undefined;

    /** 配置版本号 */
    private _version: number = 0;

    /** 儿童版配置号 */
    private _kidversion: number = 0;

    /** 是否是儿童版 */
    private _isKid: boolean = false;

    /** 是否给子域发送过初始化信息 */
    private isSentInit = false;

    /** 是否是第一次登入 */
    private islunch: boolean = false;

    /** 是否为正式版 */
    public isRelease: boolean = true;

    /** 分享文案 */
    private shareString = [
        '会一加一就能玩，全国只有1%能上20000分！',
        '从小被数学虐? 这回给你机会打败学霸!',
        '凑十加法过不了10000分? 幼儿园的娃都比你强!'
    ];

    /** 群分享文案 */
    private groupString = [
        '听说这个群里个个都是人才敢不敢和我来一场高手之间的脑力对决！',
        '我向你发起挑战，你小学毕业了吗？'
    ];

    /** 分享图片url */
    private imageUrl = [
        "https://mmocgame.qpic.cn/wechatgame/3opnTXQiccus22cBo75MYk0D7HXDAnzeV7ns2XnibZAc64fhZib6fBC9WKJ6SoTOkYq/0",
        "https://mmocgame.qpic.cn/wechatgame/3opnTXQiccusjMUIOiaEw6RS0JnmtzNfHsjUQJbLPFibvS30osmNJxYwPKr0nT1GW6V/0",
    ]


    /** 分享图片id */
    private imageUrlId =
        [
            "wn4rHZIkTReQ9hYos9-oHQ",
            "iJXKHNcuTOG9C3jtMZod0Q"
        ];

    /** 上传url前半部分 */
    private urlhead = "https://log.mathufo.com/number_monster/v1.0/";

    async onLoad() {
        RootNode.instance = this;
        cc.game.addPersistRootNode(this.node);
        this.wxSubView = this.node.getComponent(cc.WXSubContextView);
        this.wxSubView.enabled = false;
        this.initKid();
        this.initShareMenu();
        this.wxListener();
        this.release();
        this.gameLog = new GameLog();
        RootNode.instance.initLogin();
    }

    start() {
        this.fixPosition();
    }

    //微信事件监听
    private wxListener() {
        if (typeof wx == "undefined") {
            return;
        }

        let self = this;
        //小游戏回到前台,用于群排行
        wx.onShow((res) => {
            let query = res.query.type;
            let ticket = res.shareTicket;
            if (query == "group" && this.showGroup != undefined && ticket != undefined) {
                this.showGroup(ticket);
            }

            if (res.query.version == "child" && !this.isKid) {
                this.isKid = true;
                this.loadScene("load");
            }
        })

        //监听内存不足
        wx.onMemoryWarning((res) => {
            this.gameLog.sendMemoryWarning(res.level);
        });

        //监听错误
        wx.onError((res) => {
            this.gameLog.sendError(res.message, res.stack);
        })

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
            if (MySound.instance) {
                MySound.instance.setBgm();
            }
        }, this);

        wx.onAudioInterruptionBegin(function () {
            cc.game.pause();
        })

        wx.onAudioInterruptionEnd(() => {
        cc.game.resume();
            if (MySound.instance) {
                MySound.instance.setBgm();
            }
        })
    }

    /**
     * 主动触发回收
     */
    public triggerGC() {
        if (typeof wx != "undefined")
            wx.triggerGC();
    }

    /**
     * 刘海屏调整位置
     */
    public fixPosition() {
        let pos = this.node.position;
        pos.y -= RootNode.fixHeight;
        this.node.position = pos;
    }

    /**
     * 
     * @param time 渐显时间
     */
    public fadeIn(time: number) {
        this.node.active = true;
        this.node.runAction(cc.fadeIn(time));
    }

    /**
     * 获取本地数据
     * @param name 保存数据名字
     */
    public getLocalStorage(name: string): string {
        let value = undefined;
        if (window.localStorage) {
            value = window.localStorage.getItem(name);
        }
        return value;
    }

    /**
     * 保存本地数据
     * @param name 保存数据名字
     * @param value 保存的值
     */
    public setLocalStorage(name: string, value: string) {
        if (window.localStorage) {
            window.localStorage.setItem(name, value)
        }
    }

    /** 启动时是否是拉起群排行 */
    public LunchGroup() {
        //拉起启动群排行只执行一次
        if (this.islunch)
            return;
        this.islunch = true;
        let ticket = RootNode.instance.isLunchGroupShare()
        //进入信息包括群分享ticket,群分享展示否则更新数据
        if (ticket && this.showGroup != undefined)
            this.showGroup(ticket);
    }

    /**
     * 初始化成功
     */
    public get initSuccess() {
        //获取到openid 和 玩家信息为初始化成功
        if (this.openId != undefined && this.userDate.weeknum != -1)
            return true;
        return false;
    }

    /**
     * 初始化超时.弹提示信息
     * @param chart 排行榜面板
     */
    public InitTimeOut(chart: Charts) {
        if (typeof wx == "undefined") {
            return;
        }
        let self = this;
        wx.showModal({
            title: '提示',
            content: '网络异常,拉取数据失败',
            cancelText: '取消',
            confirmText: '重试',
            confirmColor: '#5B6A91',
            success(res) {
                if (res.confirm) {
                    self.initLogin();
                    chart.postMessage();
                } else if (res.cancel) {

                }
            }
        })
    }

    /**
     * 更新分数
     * @param score 分数
     */
    public updateScore(score: number): Promise<any> {
        let self = this;
        return new Promise((reslove, reject) => {
            if (typeof wx == "undefined") {
                let userdata: data = {
                    curscore: score,
                    maxscore: score,
                    maxweekscore: score,
                    weeknum: -1
                }
                self.userDate = userdata;
                reslove(true);
            }

            if (this.openId == '') {
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
                success(res) {
                    reslove(true);
                    if (res.data) {
                        //有错误码
                        if (res.data.error != null)
                            return;
                        let data = res.data.data;
                        self.userDate = data;
                        if (data.config.json != undefined)
                            self.saveConfig(data.config);
                        if (data.kids_config.json != undefined)
                            self.saveConfig(data.kids_config, true);
                        //最新分数比重传分数高,或者重传分数
                        if (score >= self.score && self.score != 0) {
                            self.score = 0;
                            self.postMessage(postMessageName.updateScore, self.userDate);
                        }
                    }
                    reslove(true)
                },
                fail(res) {
                    //重传
                    if (RootNode.currentScene == "game")
                        self.scoreRetransmission(score);
                    else//首界面,有重传数据
                        self.haveScoreRetransmission();
                    reslove(false)
                    //重传
                }
            })
        })
    }

    /**
     * 发送消息
     * @param typeStr 类型
     * @param valueObj 值
     */
    public postMessage(typeStr: string, valueObj: any) {
        if (typeof wx == "undefined") {
            return;
        }

        //每次发消息,判断初始化不成功或者没有发送初始化消息给子域都需要尝试初始化
        if (!this.initSuccess || !this.isSentInit) {
            this.initLogin();
        }

        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
            type: typeStr,
            value: valueObj,
        })
        this.setUpdateWechatSubCanvas(typeStr);
    }

    /**
     * 跳转界面
     * @param scene 界面
     */
    public loadScene(scene: string) {
        RootNode.currentScene = scene;
        cc.director.loadScene(scene);
        if (MySound.instance != undefined)
            MySound.instance.crazy = false;
    }

    /**
     * 分享按钮
     */
    public onShareBtn(num: number = 0) { //分享按钮
        if (typeof wx == "undefined") {
            return;
        }

        wx.aldShareAppMessage({
            title: this.shareString.random(),
            imageUrlId: this.imageUrlId[num],
            imageUrl: this.imageUrl[num],
        })
    }

    /**
     * 群排行
     */
    public onLookGroupBtnClicked() { //查看群排行按钮(实际是分享)
        if (typeof wx == "undefined") {
            return;
        }
        wx.aldShareAppMessage({
            title: this.groupString.random(),
            imageUrlId: this.imageUrlId[0],
            imageUrl: this.imageUrl[0],
            query: "type=group",
        })
    };

    /**
     * 是否从群分享启动
     */
    public isLunchGroupShare(): string {
        if (typeof wx == "undefined") {
            return;
        }
        let self = this;
        let res = wx.getLaunchOptionsSync();
        let query = JSON.stringify(res.query);
        let referrerinfo = JSON.stringify(res.referrerInfo);
        let shareTicket = res.shareTicket;
        wx.getSystemInfo({
            success(date) {
                //登入日志
                let systemInfo = JSON.stringify(date);
                self.gameLog.sendLaunchInfoLog(res.scene, query, shareTicket, referrerinfo, systemInfo);
            }
        })
        if (res.query.type != "group")
            return undefined;
        return res.shareTicket;
    }

    /**
    * 获取id(有id就是登入过)
    */
    public get openId() {
        return this.getLocalStorage(storageKey.openid);
    }

    /**
     * 获取版本号
     */
    public get version() {
        return this._version;
    }

    /**
     * 获取儿童版本号
     */
    public get kidVersion() {
        return this._kidversion;
    }

    /**
     * 获取是否为儿童版
     */
    public get isKid() {
        return this._isKid;
    }

    /**
    * 获取是否为儿童版
    */
    public set isKid(flag: boolean) {
        if (this._isKid != flag) {
            this._isKid = flag;
            this.readGameConfig();
            let value = flag ? 'yes' : 'no';
            this.setLocalStorage(storageKey.isKid, value);
        }
    }

    /**
     * 跳转到小程序
     */
    public jumpApp() {
        if (typeof wx == "undefined") {
            return;
        }

        wx.navigateToMiniProgram({
            appId: 'wxcc9d6a288b8edebd',
        })
    }

    /**
     * 获取是否为新手
     */
    public get newPlayer() {
        return this.getLocalStorage(storageKey.firstOpen) != "no";
    }

    /**
     * 设置为非新手
     */
    public setNewPlayer() {
        this.setLocalStorage(storageKey.firstOpen, "no");
    }

    /**
     * load界面跳转游戏界面
     */
    public loadJump() {
        this.loadScene("home");
    }

    /**
     * 配置读取生成速度
     */
    public getBallCreatDic(): any {
        return this.config.ballCreatDic;
    }

    /**
     * 配置读取重力信息
     */
    public getGravityDic(): any {
        return this.config.gravityDic;
    }

    /**
    * 配置读取生成概率信息
    */
    public getBallOddsDic(): any {
        return this.config.ballOddsDic;
    }

    /**
    * 配置读取疯狂模式信息
    */
    public getCrazyDic(): any {
        return this.config.crazyDic;
    }

    /**
     * 使用配置,当配置没有的时候再读一次
     */
    private get config() {
        if (this._config == undefined)
            this.readGameConfig();
        return this._config;
    }

    /**
     * 有重传分数,重传
     */
    public async haveScoreRetransmission() {
        if (typeof wx == "undefined") {
            return;
        }
        if (this.score == 0)
            return;
        let self = this;
        wx.showModal({
            title: '提示',
            content: '当前有分数未上传成功,是否重试',
            cancelText: '取消',
            confirmText: '重试',
            confirmColor: '#5B6A91',
            success(res) {
                if (res.confirm) {
                    self.updateScore(self.score);
                } else if (res.cancel) {
                    self.score = 0;
                }
            }
        })
    }

    /**
     * 读取是否为儿童版
     */
    private initKid() {
        let value = this.getLocalStorage(storageKey.isKid);
        this._isKid = value == 'yes';
    }

    /**
    * 是否从app打开
    */
    private isLunchApp(): string {
        if (typeof wx == "undefined") {
            return;
        }
        let res = wx.getLaunchOptionsSync();
        if (res.query.version == "child")
            this.isKid = true;
    }

    /**
    * 分数重传
    */
    private scoreRetransmission(score: number) {
        if (typeof wx == "undefined") {
            return;
        }

        let self = this;

        //保存的数据比本次高,不弹出框,等于0可能是初始化
        if (this.score > score || score == 0)
            return;
        wx.showModal({
            title: '提示',
            content: '分数上传失败,请检测网络状态重试',
            cancelText: '延后上传',
            confirmText: '重试',
            confirmColor: '#5B6A91',
            success(res) {
                if (res.confirm) {
                    self.updateScore(score);
                } else if (res.cancel) {
                    self.score = score;
                }
            }
        })
    }

    /**
    * 登入信息初始化
    */
    private async initLogin() {
        this.isLunchApp();

        await this.LogIn();
        await RootNode.instance.updateScore(0);

        //初始化成功传递消息给子域
        if (this.initSuccess) {
            let value: any = {}
            value.openid = this.openId;
            value.weeknum = this.userDate.weeknum;
            this.isSentInit = true;
            this.postMessage(postMessageName.openId, value);
        }
    }

    /**
     * 保存的分数信息
     */
    private get score() {
        let value = this.getLocalStorage(storageKey.score)
        if (value == undefined || value == '')
            return 0;
        return parseInt(value);
    }

    /**
     * 设置保存分数
     */
    private set score(num: number) {
        this.setLocalStorage(storageKey.score, num.toString());
    }

    /**
     * 右上角
     */
    private initShareMenu() {
        if (typeof wx == "undefined") {
            return;
        }
        //开启右上角的分享
        wx.showShareMenu();

        //微信开启群分享
        wx.updateShareMenu({
            withShareTicket: true
        })

        let self = this;

        wx.aldOnShareAppMessage(function (res) {
            return {
                title: self.shareString.random(),
                imageUrlId: self.imageUrlId[0],
                imageUrl: self.imageUrl[0],
            }
        })


    }

    /**
   * 登入获取openId,主要为更新微信数据
   */
    private LogIn(): Promise<string> {
        if (typeof wx == "undefined") {
            return;
        }
        let self = this;
        return new Promise((reslove, reject) => {
            wx.login({
                success(res) {
                    if (res.code) {
                        // 发起网络请求
                        wx.request({
                            url: self.getUrl('login_wx'),
                            data: {
                                code: res.code
                            },
                            method: "POST",
                            success(res) {
                                if (res.data) {
                                    reslove(res.data.data.openid);

                                    //有错误码,没有正确的取到openid
                                    if (res.data.error != null)
                                        return;
                                    let openId = res.data.data.openid;
                                    self.setLocalStorage(storageKey.openid, openId);
                                } else {
                                    reslove("res data error");
                                }

                            },
                            fail() {
                                reslove("api failed");
                            }
                        });
                    } else {
                        reslove("wx error");
                    }
                },
                fail() {
                    reslove('failed')
                }
            })
        })
    }


    /**
    * 获取是否为正式版
    */
    private release() {
        if (typeof wx == "undefined") {
            this.readGameConfig();
            return;
        }
        let self = this;
        // 发起网络请求
        wx.request({
            url: self.getUrl("is_release"),
            method: "POST",
            success(res) {
                if (res.data) {
                    self.isRelease = res.data.data.is_release;
                }
            },
            complete() {
                self.readGameConfig();
            }
        });
    }

    /**
     * 设置子域更新
     * @param typeStr 消息类型
     */
    private async setUpdateWechatSubCanvas(typeStr: string) {
        //清除未完成的计时器
        this.unscheduleAllCallbacks();
        //排行榜
        if (typeStr == postMessageName.charts || typeStr == postMessageName.group) {
            this.wxSubView.enabled = true;
        }
        else if (typeStr != postMessageName.openId && typeStr != postMessageName.updateScore) //给子域发送id 和 更新分数不需要改变子域界面 
        {
            this.wxSubView.enabled = true;
            this.scheduleOnce(() => {
                this.wxSubView.enabled = false;
            }, 5);
        }
    }

    /**
     * 获取配置信息
     */
    private readGameConfig() {
        //初始配置版号
        this.initVersion();
        let key = this.isRelease ? "release" : "test";
        let type = this.isKid ? "kid" : "adult";
        key = type + "_" + key + "_" + storageKey.config;
        let value = this.getLocalStorage(key);
        if (value != "" && value != undefined) {
            let data = JSON.parse(value);
            this._config = data.json;
        } else {
            let self = this;
            let resouseKey = this.isKid ? 'GameConfig_child.json' : 'GameConfig.json';
            cc.loader.loadRes(resouseKey, function (err, object) {
                if (err) {
                    return;
                }
                let version = self.isKid ? self._kidversion : self._version;
                if (version > object.json.version)
                    return;
                self._config = object.json.json;
            });
        }
    }

    /**
    * 初始设置版号
    */
    private initVersion() {
        let release = this.isRelease ? "release" : "test";
        for (let i = 0; i < 2; i++) {
            let type = i == 0 ? "kid" : "adult";
            let key = type + "_" + release + "_" + storageKey.config;
            let value = this.getLocalStorage(key);
            if (value != "" && value != undefined) {
                let data = JSON.parse(value);
                if (i == 0)
                    this._kidversion = Number(data.version);
                else
                    this._version = Number(data.version);
            }
        }
    }

    /**
     * 保存配置
     * @param data 配置
     * @param kid 是否为儿童版
     */
    private saveConfig(data: any, kid: boolean = false) {
        if (kid)
            this._kidversion = data.version;
        else
            this._version = data.version;

        if (this.isKid == kid)
            this._config = data.json;
        let key = this.isRelease ? "release" : "test";
        let type = kid ? "kid" : "adult";
        key = type + "_" + key + "_" + storageKey.config;
        this.setLocalStorage(key, JSON.stringify(data));
    }

    /**
     * 获取url
     * @param str 字符登入还是更新分数
     */
    private getUrl(str: string): string {
        return this.urlhead + str;
    }
}