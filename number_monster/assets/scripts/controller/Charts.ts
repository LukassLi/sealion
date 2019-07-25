// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//排行榜

import MySound, { AudioType } from "../MySound";
import RootNode, { postMessageName } from "../RootNode";
import GameCtrl from "./GameCtrl";

const { ccclass, property } = cc._decorator;

const enum Type {
    charts = 0,    //排行榜
    group = 1,     //群排行
}

@ccclass
export default class Charts extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "查看群排行" })
    private groupNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "排行榜返回" })
    public chartsBackBtn: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "箭头" })
    public arrowNote: cc.Node = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "群排行按钮图片" })
    public spriteArr: Array<cc.SpriteFrame> = [];

    @property({ type: cc.Label, visible: true, displayName: "群分享上的文字" })
    public btnLable: cc.Label = undefined;

    @property({ type: cc.Label, visible: true, displayName: "标题" })
    public title: cc.Label = undefined

    /** 状态:有排行榜和群排行两种 */
    private type: Type = Type.charts;

    /** 发送给开放域的消息类型 */
    private messageType: string = undefined;

    /** 发送给开放域的值,群排行有 */
    private messageValue: string = undefined;

    /** 退出回调 */
    private outCallback: boolean = false;


    start() {
        this.node.zIndex = 11;
        this.groupNode.on("click", () => {
            MySound.instance.playAudio(AudioType.Button);
            if (this.type == Type.charts)
                RootNode.instance.onLookGroupBtnClicked();
            else //群排行
            {
                RootNode.instance.postMessage(postMessageName.chartsBack, undefined);
                this.outCallback = true;
                //首界面
                if (RootNode.currentScene == "home")
                    RootNode.instance.loadScene("game");
                else//游戏界面
                {
                    this.node.active = false;
                    GameCtrl.instance.replay();
                }
            }
        })

        this.chartsBackBtn.on("click", () => {
            RootNode.instance.postMessage(postMessageName.chartsBack, RootNode.currentScene);
            this.node.active = false;
            this.outCallback = true;
            MySound.instance.playAudio(AudioType.Button);
            this.setType(Type.charts);

            //如果是游戏界面
            if (RootNode.currentScene == "game")
                GameCtrl.instance.groupPause = false;
        })
    }

    /**
     * 设置状态
     * @param type 状态
     */
    private setType(type: Type) {
        if (this.type == type)
            return;
        if (type == Type.charts) {
            this.title.string = "排行榜";
            this.btnLable.string = "查看群排行";
        } else {
            this.btnLable.string = "我也要挑战";
            this.title.string = "群排行榜";
        }
        this.type = type;
        this.arrowNote.active = type != Type.charts;
        this.btnLable.node.position = type == Type.charts ? cc.Vec2.ZERO : new cc.Vec2(-18, 0);
        this.groupNode.getComponent(cc.Sprite).spriteFrame = type == Type.charts ? this.spriteArr[0] : this.spriteArr[1];
    }

    /**
     * 面板打开
     * @param enable 
     */
    public open() {
        this.node.active = true;
        this.messageType = postMessageName.charts;
        this.messageValue = undefined;
        this.postMessage();
    }

    /**
     * 群分享进入
     */
    public async groupLunch(ticket: string) {
        this.setType(Type.group);
        this.node.active = true;
        this.messageType = postMessageName.group;
        this.messageValue = ticket;
        this.postMessage();
    }

    /**
     * 发送消息,加入初始化判定
     */
    public postMessage() {
        let time = 0;

        //游戏结束时,结算界面隐藏
        RootNode.instance.postMessage(postMessageName.finishHide, undefined);

        this.outCallback = false;
        let callback = () => {

            if (this.outCallback) {
                this.unschedule(callback);
                return;
            }

            time += 0.1;
            //等待两秒,超时处理
            if (time > 2) {
                RootNode.instance.InitTimeOut(this);
                this.unschedule(callback);
            }

            //初始化成功,且面板是打开的,发送消息给开放域
            if (RootNode.instance.initSuccess) {
                RootNode.instance.postMessage(this.messageType, this.messageValue);
                this.unschedule(callback);
            }
        }
        this.schedule(callback, 0.1);
    }
}