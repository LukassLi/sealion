// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//复活

declare const wx: any;

import MySound, { AudioType } from "../MySound";
import GameCtrl from "./GameCtrl";
import RootNode, { postMessageName } from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Revival extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "复活分享" })
    private revivalBtn: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "点击跳过" })
    private skipBtn: cc.Node = undefined;

    @property({ type: cc.Label, visible: true, displayName: "分数" })
    private scoreLabel: cc.Label = undefined;

    /** 激励视频 */
    private videoAd: any = undefined;

    start() {
        this.addEventListener();
    }

    /**
     * 面板打开
     */
    public open() {
        this.node.active = true;
        let score = GameCtrl.instance.Score.toString();
        this.scoreLabel.string = score;
        RootNode.instance.postMessage(postMessageName.revival, score);
        RootNode.instance.fadeIn(0.3);
        this.node.runAction(cc.fadeIn(0.3));
        if (this.videoAd != undefined)
            this.videoAd.load();
    }

    /**
     * 面板关闭
     */
    public close() {
        RootNode.instance.postMessage(postMessageName.revivalBack, undefined);
        this.node.active = false;
    }

    /**
     * 是否有复活
     */
    public canRevival():boolean
    {
        if(wx.createRewardedVideoAd && !RootNode.instance.isKid)
            return true;
        return false;
    }

    /**
     * 复活操作
     */
    private revivalOperation() {
        this.node.active = false;
        RootNode.instance.postMessage(postMessageName.revivalBack, undefined);
        GameCtrl.instance.maskPanl.active = false;
        GameCtrl.instance.revivalTime = 0;
        GameCtrl.instance.revivalInit();
        RootNode.instance.gameLog.recordAction("revival");
    }

    /**
     * 监听按钮,渐变过程不能点击按钮
     */
    private addEventListener() {
        this.revivalBtn.on("click", () => {
            if (this.node.opacity < 255) {
                return;
            }
            MySound.instance.playAudio(AudioType.Button);
            this.revival();
        });

        this.skipBtn.on("click", () => {
            if (this.node.opacity < 255) {
                return;
            }
            MySound.instance.playAudio(AudioType.Button);
            this.skip();
        })

        if (typeof wx == "undefined") {
            return;
        }

        //不是儿童版时创建激励视频
        if (wx.createRewardedVideoAd && !RootNode.instance.isKid) {
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-e8ea267b5679a9c8'
            })
            this.videoAd.onClose((res) => {
                if (res.isEnded != undefined && res.isEnded == false)
                    return;
                this.revivalOperation();
            })
        }
    }

    /**
     * 分享复活
     */
    private revival() {
        if (this.videoAd != undefined) {
            this.videoAd.show().catch(err => {
                this.videoAd.load();
            })
        }
    }

    /**
     * 跳过
     */
    private skip() {
        this.node.active = false;
        RootNode.instance.postMessage(postMessageName.revivalBack, undefined);
        GameCtrl.instance.gameFinish.open(true);
    }
}