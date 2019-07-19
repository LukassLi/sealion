// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//连击设置

import GameCtrl from "../controller/GameCtrl";

const { ccclass, property } = cc._decorator;

const enum ComboState {
    normal = 0,
    crazy = 1,
}

@ccclass
export default class ComBo extends cc.Component {
    @property({ type: cc.Node, visible: true, displayName: "普通完成" })
    public normalNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "连击完成" })
    public comBoNode: cc.Node = undefined;

    @property({ type: cc.Label, visible: true, displayName: "连击数字" })
    public numLable: cc.Label = undefined;

    @property({ type: cc.Sprite, visible: true, displayName: "连击描述" })
    public describe: cc.Sprite = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "连击描述图片" })
    public frameArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "背景图片" })
    public BgArr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.Node], visible: true, displayName: "符号节点" })
    public singNode: Array<cc.Node> = [];

    private state: ComboState = ComboState.normal;


    /**
     * 连击设置
     * @param num 连击数
     */
    public setCombo(num: number) {

        this.setState();
        if(this.state == ComboState.crazy)
            return;
        this.normalNode.active = num == 1;
        this.comBoNode.active = num != 1;
        this.initCombo(num);
    }

    /**
     * 连击初始化
     * @param num 连击数
     */
    private initCombo(num: number) {
        if (num == 1)
            return;
        this.numLable.string = num.toString();
        let frameSlect = 0;
        if (num == 10)
            frameSlect = 3;
        else if (num > 7)
            frameSlect = 2;
        else if (num > 4)
            frameSlect = 1;
        this.describe.spriteFrame = this.frameArr[frameSlect];
    }

    /**
     * 设置状态
     */
    private setState() {
        let value = GameCtrl.instance.crazy ? ComboState.crazy : ComboState.normal;
        if (this.state != value) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.BgArr[value];
            this.singNode[0].active = 0 == value;
            this.singNode[1].active = 1 == value;
            if (value == ComboState.crazy) {
                this.normalNode.active = false;
                this.comBoNode.active = true;
                this.numLable.string = GameCtrl.instance.crazyComboAdd.toString();
            }
            this.state = value;
        }
    }
}