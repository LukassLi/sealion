// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

const {ccclass, property} = cc._decorator;

@ccclass
export default class FinishView extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "分享按钮" })
    public shareBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "重玩按钮" })
    public replayBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "返回主页按钮" })
    public homeBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "查看排行榜按钮" })
    public chartsBtn:cc.Node = undefined;
}