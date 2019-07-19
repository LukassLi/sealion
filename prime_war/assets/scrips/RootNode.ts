import { DebugSettings } from './util/DebugSettings';

const { ccclass, property } = cc._decorator;

declare const wx: any;

@ccclass
export default class RootNode extends cc.Component {
    /**
     * 使用配置,当配置没有的时候再读一次
     */
    private get config() {
        if (this._config == undefined) {
            this.readGameConfig();
        }
        return this._config;
    }
    public static instance: RootNode = undefined;

    /** 当前scene */
    public static currentScene: string = "";

    /** 游戏配置 */
    private _config: any = undefined;

    public onLoad() {
        RootNode.instance = this;
        cc.game.addPersistRootNode(this.node);
        this.readGameConfig();
        // this.wxListener();
    }

    public start() {}

    /**
     * 跳转界面
     * @param scene 界面
     */
    public loadScene(scene: string) {
        RootNode.currentScene = scene;
        cc.director.loadScene(scene);
        // if (MySound.instance != undefined) {
        //     MySound.instance.crazy = false;
        // }
    }

    /**
     * 跳转至主页场景
     */
    public loadJump() {
        this.loadScene("home");
    }

    /**
     * 主动触发回收
     */
    public triggerGC() {
        if (typeof wx != "undefined") {
            wx.triggerGC();
        }
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
     * 获取本地数据
     * @param name 保存数据名字
     */
    public getLocalStorage(name: string): string {
        let value;
        if (window.localStorage) {
            value = window.localStorage.getItem(name);
        }
        return value;
    }

    private wxListener() {
        this.loadScene("load");
    }

    /**
     * 获取配置信息
     */
    private readGameConfig() {
        // // 初始配置版号
        // this.initVersion();
        // let key = this.isRelease ? "release" : "test";
        // const type = this.isKid ? "kid" : "adult";
        // key = type + "_" + key + "_" + storageKey.config;
        // const value = this.getLocalStorage(key);
        // if (value != "" && value != undefined) {
        //     const data = JSON.parse(value);
        //     this._config = data.json;
        // } else {
            const self = this;
            const resouseKey = "GameConfig.json";//this.isKid ? "GameConfig_child.json" : "GameConfig.json";
            cc.loader.loadRes(resouseKey, function(err, object) {
                if (err) {
                    return;
                }
                // const version = self.isKid ? self._kidversion : self._version;
                // if (version > object.json.version) {
                //     return;
                // }
                self._config = object.json.json;
                if(DebugSettings.showConfig){
                    console.log(self._config);
                }
            });
        // }
    }
}
