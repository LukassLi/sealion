// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

// import Charts from "../controller/Charts";
// import HomeHelp from "./HomeHelp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeView extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "根节点" })
    public fixedNode:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "引导按钮" })
    public guideBtn:cc.Node = undefined;

    // @property({ type: HomeHelp, visible: true, displayName: "帮助脚本" })
    // public homeHelp:HomeHelp = undefined;

    @property({ type: cc.Node, visible: true, displayName: "排行榜按钮" })
    public chartsBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "分享按钮" })
    public shareBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "数感星球按钮" })
    public starBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "公众号按钮" })
    public subscriptionBtn:cc.Node = undefined;

    // @property({ type: Charts, visible: true, displayName: "排行榜" })
    // public charts:Charts = undefined;

    @property({ type: cc.Node, visible: true, displayName: "无尽模式按钮" })
    public endlessBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "计时模式按钮" })
    public timerBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "声音按钮" })
    public soundBtn:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "切换游戏版本" })
    public kidbtn:cc.Node = undefined;

    @property({ type: cc.Sprite, visible: true, displayName: "声音sprite" })
    public soundSprite:cc.Sprite = undefined;

    @property({ type: cc.Animation, visible: true, displayName: "版本切换动画" })
    public kidAnim:cc.Animation = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "声音图片" })
    public soundArr:Array<cc.SpriteFrame> = [];

    @property({ type: cc.Node, visible: true, displayName: "公众号引导面板" })
    public  subscriptionNode:cc.Node = undefined;
}
