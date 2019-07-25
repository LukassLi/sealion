// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//主页界面

import HomeView from "../view/HomeView";
// import MySound, { AudioType } from "../MySound";
import RootNode from '../RootNode';
// import RootNode, { postMessageName } from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeCtrl extends HomeView {
    /** 切换动画是否播放中 */
    private animPlaying:boolean = false;

    start() {
        this.addEventListener();
        // this.setSoundSprite();
        // //是否有重传分数
        // RootNode.instance.haveScoreRetransmission();
        // this.setkid();
    }

    /**
     * 监听按钮点击
     */
    private addEventListener() {

        // 进入计时模式
        this.endlessBtn.on("click", () => {
            // MySound.instance.playAudio(AudioType.Button);
            // RootNode.instance.loadScene("game");
            cc.director.loadScene('game');
        })

        // 进入计时模式
        this.timerBtn.on("click", () => {
            // MySound.instance.playAudio(AudioType.Button);
            RootNode.instance.loadScene("game");
        })

        // //声音开关
        // this.soundBtn.on("click", () => {
        //     MySound.instance.setMut();
        //     MySound.instance.playAudio(AudioType.Button, 0.1);
        //     this.setSoundSprite();
        // })

        // //排行榜
        // this.chartsBtn.on("click", () => {
        //     this.charts.open();
        //     MySound.instance.playAudio(AudioType.Button, 0.1);
        // })

        // //数感星球
        // this.starBtn.on("click", () => {
        //     MySound.instance.playAudio(AudioType.Button);
        //     RootNode.instance.jumpApp();
        // });

        // //分享
        // this.shareBtn.on("click", () => {
        //     MySound.instance.playAudio(AudioType.Button);
        //     RootNode.instance.onShareBtn();
        // });

        // //切换游戏版本
        // this.kidbtn.on("click", () => {
        //     MySound.instance.playAudio(AudioType.Button);
        //     if(this.animPlaying)
        //         return;
        //     RootNode.instance.isKid = !RootNode.instance.isKid;
        //     this.kidAnimPlay();
        // });

        // //怪物图鉴
        // this.monsterBtn.on("click", () => {
        //     MySound.instance.playAudio(AudioType.Button);
        //     let tipsAction = cc.sequence(
        //         cc.fadeIn(0.3),
        //         cc.delayTime(2),
        //         cc.fadeOut(0.3),
        //     )
        //     this.tips.stopAllActions();
        //     this.tips.runAction(tipsAction);
        // });

        //  //公众号
        //  this.subscriptionBtn.on("click", () => {
        //     MySound.instance.playAudio(AudioType.Button);
          
        //     this.subscriptionNode.active = true;
        // });

        // //群分享函数
        // RootNode.instance.showGroup = (any) => {
        //     this.charts.groupLunch(any);
        // };

        // //是否是从群分享启动
        // RootNode.instance.LunchGroup();
    }

    // /**
    //  * 设置声音按钮图片
    //  */
    // private setSoundSprite() {
    //     if (MySound.instance.isMut)
    //         this.soundSprite.spriteFrame = this.soundArr[1];
    //     else
    //         this.soundSprite.spriteFrame = this.soundArr[0];
    // }

    // /**
    //  * 设置版本
    //  */
    // private setkid() {
    //     let animNum = RootNode.instance.isKid ? 2 : 3;
    //     let clips = this.kidAnim.getClips();
    //     let name = clips[animNum].name;
    //     this.kidAnim.play(name);
    // }

    // /**
    //  * 模式切换动画
    //  */
    // private kidAnimPlay() {
    //     let animNum = RootNode.instance.isKid ? 1 : 0;
    //     let clips = this.kidAnim.getClips();
    //     let name = clips[animNum].name;
    //     let state = this.kidAnim.play(name);
    //     let time = state.duration;
    //     this.animPlaying = true;
    //     let callback = () => {
    //         this.animPlaying = false;
    //     }
    //     this.scheduleOnce(callback,time);
    // }
}