// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//loading 界面

import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Load extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "进度条" })
    private bar: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "成人标题" })
    private manNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "儿童标题" })
    private childNode: cc.Node = undefined;

    /** 进度条的长度 */
    private width: number = 520;
    private pro1: number = 0;
    private pro2: number = 0;

    private finishCount: number = 0;

    start() {
        let self = this;
        let callback = function () {
            self.finishCount += 1;
            if (self.finishCount == 2) {
                RootNode.instance.loadJump();
            }
        }

        cc.director.preloadScene("home", this.onProgress1.bind(this), () => {
            callback();
        })
        cc.director.preloadScene("game", this.onProgress2.bind(this), () => {
            callback();
        })

        this.manNode.active = !RootNode.instance.isKid;
        this.childNode.active = RootNode.instance.isKid;
    }

    onProgress1(completedCount: number, totalCount: number, item: any) {
        this.pro1 = completedCount / totalCount;
        this.onProgress();
    }

    onProgress2(completedCount: number, totalCount: number, item: any) {
        this.pro2 = completedCount / totalCount;
        this.onProgress();
    }

    private onProgress() {
        this.bar.width = (this.pro1 + this.pro2) / 2 * 520;
    }
}