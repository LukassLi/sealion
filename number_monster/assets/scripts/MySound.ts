// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//控制音效

declare const wx: any;

import { effectVolume } from "./GameConfig";

const { ccclass, property } = cc._decorator;

export const enum AudioType {
    GameBgm = 0,              //游戏背景音乐
    ComboGood = 1,          //combo good 音效
    ComboTen = 2,          //连击为10
    Finish = 3,             //结束面板
    FinishRecordBreak = 4,  //结束破纪录
    GameEnter = 5,          //进入游戏
    GameOver = 6,           //游戏结束
    GreaterThanTen = 7,     //合成超过10
    GreaterThanFifteen = 8, //合成超过15
    LessThanTen = 9,        //合成小于10
    Split = 10,             //分开
    Ten = 11,               //合成10
    Button = 12,            //按钮
    DropNum1 = 13,          //下落数字1   
    DropNum2 = 14,          //下落数字2 
    DropNum3 = 15,          //下落数字3 
    DropNum4 = 16,          //下落数字4     
    DropNum5 = 17,          //下落数字5 
    DropNum6 = 18,          //下落数字6 
    DropNum7 = 19,          //下落数字7 
    DropNum8 = 20,          //下落数字8 
    DropNum9 = 21,          //下落数字9 
    CrazyFive = 22,         //疯狂模式切入
    CrazyFiveBgm = 23,      //疯狂模式的背景音乐
    ComboTen1 = 24,         //连击为10 1
    ComboTen2 = 25,         //连击为10 2
    PlayAgain = 26,         //复活音效
}

@ccclass
export default class MySound extends cc.Component {
    @property({ type: [cc.AudioClip], visible: true, displayName: "音效" })
    public clipArr: Array<cc.AudioClip> = [];

    public static instance: MySound = undefined;

    /** 是否静音 */
    private mute: boolean = false;

    /** 背景id */
    private bgmId: number = -100;

    /** 疯狂背景id */
    private crazyBgmId: number = -100;

    /** 连10 三个音效随机 */
    private tenArr = [2, 24, 25];

    /** 微信播放声音实例数组 */
    private audioArr = [];

    /** 背景音效是否为疯狂背景 */
    private isCrazy: boolean = false;

    onLoad() {
        MySound.instance = this;
        cc.game.addPersistRootNode(this.node);
        this.setIosMuteSwitch();
        this.initWxAudio();
        this.initMute();
        this.setBgm();
    }

    /**
     * 初始化微信音效实例
     */
    private initWxAudio() {
        if (typeof wx == "undefined") {
            return;
        }
        for (let i = 0; i < 27; i++) {
            let audio = wx.createInnerAudioContext();
            audio.src = wxDownloader.REMOTE_SERVER_ROOT + "/" + this.getNativeurl(i);
            if (i == AudioType.GameBgm || i == AudioType.CrazyFiveBgm)
                audio.loop = true;
            audio.volume = effectVolume[i];
            this.audioArr.push(audio);
        }
    }

    /**
     * 获取音频的勾选md5 后文件名
     * @param num 第几个音频
     */
    private getNativeurl(num: number): string {
        let url = this.clipArr[num].nativeUrl;
        if (cc.loader.md5Pipe == null)
            return url;
        let length = url.length;
        let index = url.lastIndexOf('/') + 1;
        let id = url.substring(index, length - 4);
        let md51 = cc.loader.md5Pipe.md5AssetsMap[id];
        let md52 = cc.loader.md5Pipe.md5NativeAssetsMap[id];
        let md5 = md51 == undefined ? md52 : md51;
        if (md5 != undefined)
            url = url.substring(0, length - 4) + "." + md5 + ".mp3";
        return url;
    }


    /**
     * 设置ios静音模式下播放声音
     */
    private setIosMuteSwitch() {
        if (typeof wx == "undefined") {
            return;
        }

        //存在该接口
        if(wx.setInnerAudioOption)
        {
            wx.setInnerAudioOption({
                obeyMuteSwitch: false,
                success() {
                }
            })
        }
    }

    /**
     * 初始读取音效开关
     */
    private initMute() {
        // 读取本地音效开关变量
        if (window.localStorage) {
            let isMutStorage = window.localStorage.getItem('number_sprite_isMut');
            this.mute = isMutStorage != undefined ? (isMutStorage == 'yes' ? true : false) : false;
        }
    }

    /**
     * 获取静音状态
     */
    public get isMut() {
        return this.mute;
    }

    /**
     * 设置静音状态
     */
    public setMut() {
        this.mute = !this.mute;

        // 设置本地开关变量
        if (window.localStorage) {
            let value = (this.mute ? 'yes' : 'no');
            window.localStorage.setItem('number_sprite_isMut', value)
        }
        // setMut(isMut);
        this.setBgm();
    }

    public set crazy(flag: boolean) {
        if (this.isCrazy != flag) {
            this.isCrazy = flag;
            this.setBgm();
        }
    }

    /**
     * 设置背景音效
     */
    public setBgm() {
        //微信环境下
        if (typeof wx != "undefined") {
            this.setBgmWx();
            return;
        }

        if (!this.mute) {
            if (this.isCrazy) {
                cc.audioEngine.stopEffect(this.bgmId);
                this.crazyBgmId = cc.audioEngine.playEffect(this.clipArr[23], true);
                cc.audioEngine.setVolume(this.crazyBgmId, effectVolume[23]);
            }
            else {
                cc.audioEngine.stopEffect(this.crazyBgmId);
                this.bgmId = cc.audioEngine.playEffect(this.clipArr[0], true);
                cc.audioEngine.setVolume(this.bgmId, effectVolume[0]);
            }
        } else {
            cc.audioEngine.stopEffect(this.crazyBgmId);
            cc.audioEngine.stopEffect(this.bgmId);
        }
    }

    private setBgmWx() {
        if (!this.mute) {
            if (this.isCrazy) {
                this.audioArr[AudioType.CrazyFiveBgm].play();
                this.audioArr[AudioType.GameBgm].pause();
            } else {
                this.audioArr[AudioType.CrazyFiveBgm].pause();
                this.audioArr[AudioType.GameBgm].play();
            }
        } else {
            this.audioArr[AudioType.GameBgm].pause();
            this.audioArr[AudioType.CrazyFiveBgm].pause();
        }
    }

    /**
     * 设置疯狂背景音效
     * @param active 是否是疯狂背景
     */
    public setCrazyBgm(active: boolean) {
        this.isCrazy = active;
        this.setBgm();
    }

    /**
     * 播放音效
     * @param clip 音效
     * @param delay 延迟
     */
    public playAudio(clip: AudioType, delay: number = 0) {
        if (this.mute)
            return;
        let callback = () => {
            //连击为10
            if (clip == 2)
                clip = this.tenArr.random();
            //微信环境下
            if (typeof wx != "undefined") {
                this.audioArr[clip].play();
                return;
            }

            let volume = effectVolume[clip];
            let id = cc.audioEngine.playEffect(this.clipArr[clip], false);
            cc.audioEngine.setVolume(id, volume);
        }

        this.scheduleOnce(callback, delay);
    }
}