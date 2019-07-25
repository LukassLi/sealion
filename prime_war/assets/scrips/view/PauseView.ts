// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

const {ccclass, property} = cc._decorator;

@ccclass
export default class PauseView extends cc.Component {

    @property({ type: cc.Node, visible: true, displayName: "重玩" })
    public btnReplay:cc.Node = undefined;  

    @property({ type: cc.Node, visible: true, displayName: "返回主页" })
    public btnHome:cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "继续" })
    public btnResume:cc.Node = undefined;

}