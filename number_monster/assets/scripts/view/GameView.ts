// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

import CreatBall from "../controller/CreatBall";
import FinishCtrl from "../controller/FinishCtrl";
import Revival from "../controller/Revival";
import TopStrip from "../controller/TopStrip";
import Charts from "../controller/Charts";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameView extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "游戏面板" })
    public gamePanl: cc.Node = undefined;

    @property({ type: [cc.Prefab], visible: true, displayName: "球预制" })
    public ballPreArr: Array<cc.Prefab> = [];

    @property({ type: cc.Prefab, visible: true, displayName: "连击预制" })
    public comBoPre: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "引导预制体" })
    public guidePre: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "入场动画预制" })
    public cloudPrefab: cc.Prefab = undefined;

    @property({ type: cc.Node, visible: true, displayName: "合成球大于等于16爆炸节点" })
    public ballboom: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "面板底遮罩" })
    public maskPanl: cc.Node = undefined;

    @property({ type: cc.Label, visible: true, displayName: "分数节点" })
    public scoreLable: cc.Label = undefined;

    @property({ type: cc.Node, visible: true, displayName: "游戏节点" })
    public gameNode: cc.Node = undefined;

    @property({ type: FinishCtrl, visible: true, displayName: "游戏结束" })
    public gameFinish: FinishCtrl = undefined;

    @property({ type: Revival, visible: true, displayName: "复活面板" })
    public revival: Revival = undefined;

    @property({ type: cc.Node, visible: true, displayName: "暂停节点" })
    public pauseNode: cc.Node = undefined;

    @property({ type: cc.SpriteFrame, visible: true, displayName: "主页图片" })
    public topHomeIm: cc.SpriteFrame = undefined;

    @property({ type: cc.Sprite, visible: true, displayName: "顶部按钮暂停" })
    public topSprte: cc.Sprite = undefined;

    @property({ type: cc.PhysicsPolygonCollider, visible: true, displayName: "底部碰撞体" })
    public bottomCollider: cc.PhysicsPolygonCollider = undefined;

    @property({ type: TopStrip, visible: true, displayName: "顶部横栏,结束判断" })
    public topStrip: TopStrip = undefined;

    @property({ type: Charts, visible: true, displayName: "排行榜" })
    public charts: Charts = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "游戏背景图片" })
    public gameBgImArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "暂停图片" })
    public topPauseImArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "底部图片" })
    public bottomImArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "顶部图片" })
    public topImArr: Array<cc.SpriteFrame> = [];

    @property({ type: cc.Sprite, visible: true, displayName: "背景适配节点" })
    public bgFitSprite: cc.Sprite = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "背景适配图片" })
    public bgFitImArr: Array<cc.SpriteFrame> = [];

    @property({ type: cc.Node, visible: true, displayName: "疯狂模式进度条节点" })
    public crazyProgressNode: cc.Node = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "进度图片" })
    public barImArr: Array<cc.SpriteFrame> = [];

    @property({ type: cc.Prefab, visible: true, displayName: "进入疯狂模式" })
    public crazyCutToPrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "退出疯狂模式" })
    public crazyCutOutPrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "疯狂模式球等待触发特效" })
    public crazyTriggerPrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "疯狂模式球变为普通球" })
    public crazyToNomalPrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "疯狂模式进行中" })
    public crazyLivePrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "复活特效" })
    public revivalePrefab: cc.Prefab = undefined;

    @property({ type: cc.Prefab, visible: true, displayName: "大于11球的双击特效" })
    public balldoubleClick: cc.Prefab = undefined;

    public creatBall: CreatBall = undefined;

}