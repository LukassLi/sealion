import MySound, { AudioType } from "../MySound";

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//公众号引导

const { ccclass, property } = cc._decorator;

@ccclass
export default class Subscription extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "返回按钮" })
    private backBtn:cc.Node = undefined;

    start()
    {
        this.backBtn.on('click',()=>{
            MySound.instance.playAudio(AudioType.Button);
            this.back();
        })

        cc.game.on(cc.game.EVENT_HIDE, function () {
           this.back();
        }, this)
    }

    private back()
    {
        this.node.active = false;
    }
}