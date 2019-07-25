// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//游戏日志

import RootNode from "./RootNode";
import GameCtrl from "./controller/GameCtrl";
import MySound from "./MySound";

declare const wx: any;

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLog {
    /** 网址 */
    private url: string = 'https://log-app-backend.log-global.aliyuncs.com/logstores/log_web/track?APIVersion=0.6.0';

    /** 小游戏版本 */
    private app_version: string = "1.1.2";

    /** 资源版本号 */
    private res_version: string = "1.1.3";

    /** 记录操作数据 */
    private actionData: Array<string> = [];

    /** 游戏开始的时间 */
    private startTime: number = 0;

    /** 随机id */
    private id: number = 0;

    /** 上一次的错误 */
    private lastError: string = '';


    /**
     * 登入日志
     * @param scene 启动小游戏场景
     * @param query  启动小游戏的参数
     * @param shareTicket 群转发
     * @param referrerInfo 来源信息
     * @param systemInfo 系统信息
     */
    public async sendLaunchInfoLog(scene: number, query: string, shareTicket: string, referrerInfo: string, systemInfo: string) {
        let openid = RootNode.instance.openId;
        let url = this.url;
        let formData = {
            app: 'number_monster',
            user_openid: openid,
            app_version: this.app_version,
            cfg_version: RootNode.instance.version,
            cfg_kidversion: RootNode.instance.kidVersion,
            gametype: RootNode.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            type: "launch_info",
            release: RootNode.instance.isRelease,
            scene,
            query,
            shareTicket,
            referrerInfo,
            systemInfo
        };
        try {
            wx.request({ url, data: formData, method: 'GET' });
        } catch (err) {

        }
    }

    /**
     * 白名单日志
     */
    public sendWhiteList() {
        let openid = RootNode.instance.openId;
        let url = this.url;
        let formData = {
            app: 'number_monster',
            user_openid: openid,
            type: "launch_info",
            mute: MySound.instance.isMut,
            release: RootNode.instance.isRelease,
        };
        try {
            wx.request({ url, data: formData, method: 'GET' });
        } catch (err) {

        }
    }

    /** 
     * 游戏操作开始记录 
     */
    public startRecorder() {
        this.startTime = Date.now();
        this.id = Math.floor(Math.random() * 100000);
        this.actionData = [];
    }

    /**
     * 保存数据
     * @param type 操作类型 d 掉落 c 合并 s 拆分  creazy_start 疯狂开始 revival 复活
     * creazy_end 疯狂结束 pause 暂停 finish 结束 signOut 退出 skipGuide 退出新手引导 
     * @param num  操作数1
     * @param num1 操作数2
     */
    public recordAction(type: string, num: number = -1, num1: number = -1) {
        //100毫秒为单位的整数
        let time = Math.floor((Date.now() - this.startTime) / 100);
        let action = time + type + (num == -1 ? "" : num.toString(16)) + (num1 == -1 ? "" : num1.toString(16));
        this.actionData.push(action);
    }


    /**
     * 错误上报
     * @param message 错误
     * @param stack 错误调用堆栈
     */
    public sendError(message: string, stack: string) {
        if (typeof wx == "undefined")
            return;

        //相同错误不重复上报
        if (this.lastError == message)
            return;
        this.lastError = message;

        let url = this.url;
        let openid = RootNode.instance.openId;
        let formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode.instance.version,
            cfg_kidversion: RootNode.instance.kidVersion,
            gametype: RootNode.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            release: RootNode.instance.isRelease,
            user_openid: openid,
            type: "Error",
            message: message,
            stack: stack,
        };
        try {
            wx.request({ url, data: formData, method: 'GET' });
        } catch (err) {

        }
    }

    /**
     * 内存警告,只有安卓才有
     * @param level 警告等级
     */
    public sendMemoryWarning(level: number) {
        if (typeof wx == "undefined")
            return;

        let url = this.url;
        let openid = RootNode.instance.openId;
        let formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode.instance.version,
            cfg_kidversion: RootNode.instance.kidVersion,
            gametype: RootNode.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            user_openid: openid,
            release: RootNode.instance.isRelease,
            type: "memory_warning",
            data: level,
        };
        try {
            wx.request({ url, data: formData, method: 'GET' });
        } catch (err) {

        }
    }

    /**
     * 发送操作日志
     */
    public sendAction() {
        if (RootNode.currentScene != "game") {
            return;
        }
        let length = this.actionData.length;
        let section = 0;
        while (this.actionData.length > 0) {
            let arr = this.actionData.splice(0, 1800);
            let data = arr.join(",")
            this.sendSection(length, section, data);
            section++;
        }
    }

    /**
     * 数据包发送,可能存在数据太长,分多个包发送的情况
     * @param length 总的数据长度
     * @param section 第几个包
     * @param data 数据
     */
    private sendSection(length: number, section: number, data: string) {
        if (typeof wx == "undefined" || GameCtrl.instance == undefined)
            return;
        let url = this.url;
        let openid = RootNode.instance.openId;
        let formData = {
            app: 'number_monster',
            app_version: this.app_version,
            cfg_version: RootNode.instance.version,
            cfg_kidversion: RootNode.instance.kidVersion,
            gametype: RootNode.instance.isKid ? "kid" : "adult",
            res_version: this.res_version,
            release: RootNode.instance.isRelease,
            user_openid: openid,
            type: "action",
            steps: length,
            score: GameCtrl.instance.Score,
            id: this.id,
            section: section,
            data: data
        };
        try {
            wx.request({ url, data: formData, method: 'GET' });
        } catch (err) {

        }
    }
}