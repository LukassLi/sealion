import RootNode from "./RootNode";

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//用于获取白名单openId

const { ccclass, property } = cc._decorator;

declare const wx: any;

@ccclass
export default class whiteList extends cc.Component {

    /** 点击次数 */
    private hold_one_click = 0;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.hold_one_click++;

            //点击3秒后清0
            let callback = () => {
                this.hold_one_click = 0;
            }
            this.scheduleOnce(callback, 3);

            //判断双击
            if (this.hold_one_click > 5) {
                if (typeof wx == "undefined")
                    return;
                wx.setClipboardData({
                    data: RootNode.instance.openId,
                    success(res) {
                        wx.getClipboardData({
                            success(res) {
                                RootNode.instance.gameLog.sendWhiteList();
                            }
                        })
                    }
                })
            }
        })
    }
}