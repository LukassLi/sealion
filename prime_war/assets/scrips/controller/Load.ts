// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//loading 界面

import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Load extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "进度条" })
    private bar: cc.Node = undefined;

    // @property({ type: cc.Node, visible: true, displayName: "成人标题" })
    // private manNode: cc.Node = undefined;

    // @property({ type: cc.Node, visible: true, displayName: "儿童标题" })
    // private childNode: cc.Node = undefined;

    /** 进度条的长度 */
    private width: number = 520;
    private pro01: number = 0;
    private pro02: number = 0;
    // private pro03: number = 0;

    private completeCount: number = 0;

    start() {
        let self = this;
        let callback = function () {
            self.completeCount += 1;
            if (self.completeCount == 2) {
                RootNode.instance.loadJump();
            }
        }


        cc.director.preloadScene("home", this.onProgress01.bind(this), () => {
            callback();
        })
        cc.director.preloadScene("game", this.onProgress02.bind(this), () => {
            callback();
        })
        // cc.director.preloadScene("endless", this.onProgress03.bind(this), () => {
        //     callback();
        // })

        // this.manNode.active = !RootNode.instance.isKid;
        // this.childNode.active = RootNode.instance.isKid;
    }

   
    onProgress01(completedCount: number, totalCount: number, item: any) {
        this.pro01 = completedCount / totalCount;
        this.onProgress();
    }

    onProgress02(completedCount: number, totalCount: number, item: any) {
        this.pro02 = completedCount / totalCount;
        this.onProgress();
    }

    // onProgress03(completedCount: number, totalCount: number, item: any) {
    //     this.pro03 = completedCount / totalCount;
    //     this.onProgress();
    // }

    private onProgress() {
        this.bar.width = (this.pro01 + this.pro02) / 2 * this.width;
    }
}