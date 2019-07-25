// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//首页的帮助界面

import MySound, { AudioType } from "../MySound";
import RootNode from "../RootNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeHelp extends cc.Component {
    @property({ type: [cc.Node], visible: true, displayName: "表示哪一页的三个点" })
    private spotArr: Array<cc.Node> = [];

    @property({ type: cc.Node, visible: true, displayName: "下一步还是开始按钮" })
    private stepNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "内容" })
    private contentNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "滑动节点" })
    private scrollNode: cc.Node = undefined;

    @property({ type: cc.Node, visible: true, displayName: "返回按钮" })
    private backBtn: cc.Node = undefined;

    @property({ type: [cc.SpriteFrame], visible: true, displayName: "按钮图片" })
    private btnSpriteFrameArr: Array<cc.SpriteFrame> = [];

    /** 点的颜色 1为当前的颜色 */
    private spotColor: Array<cc.Color> = [cc.color(227, 212, 175), cc.color(173, 184, 96)];

    /** 第几个界面 */
    private step: number = 0;

    /** 是否在移动,移动时不能点下一步按钮 */
    private isMove: boolean = false;

    start() {
        this.backBtn.on('click', () => {
            this.node.active = false;
        })

        this.stepNode.on('click', () => {
            if (!this.isMove)
                this.stepbtn();
        })

        this.scrollNode.on(cc.Node.EventType.TOUCH_START, () => {
            this.contentNode.stopAllActions();
        }, this)

        this.scrollNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.touchEnd();
        }, this)

        this.scrollNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.touchEnd();
        }, this)

        let size = this.scrollNode.getContentSize();
        if (size.height > 1000)
            size.height = 1000;
        this.scrollNode.setContentSize(size);
    }

    /**
     * 打开
     */
    public open() {
        this.node.active = true;
        this.contentNode.stopAllActions();
        this.contentNode.position = cc.Vec2.ZERO;
        this.initStep();

    }

    /**
     * 下一步按钮
     */
    private stepbtn() {
        MySound.instance.playAudio(AudioType.Button);
        if (this.step == 2)
            RootNode.instance.loadScene("game");
        else
            this.stepAction(this.step + 1);

    }

    /**
     * 触碰结束
     */
    private touchEnd() {
        let index = this.contentNode.position.x < -this.step * 670 ? this.step + 1 : this.step - 1;
        if (index < 0||index>2)
            return;
    
        this.stepAction(index);
    }

    /**
     * 滑动
     * @param index 滑动到第几步
     */
    private stepAction(index: number) {
        this.contentNode.stopAllActions();

        let positionX = this.contentNode.position.x;
        let target = -index * 670;
        let disparity = Math.abs(positionX - target);

        this.isMove = true;
        let action = cc.sequence([
            cc.moveTo(disparity / 670 * 0.3, new cc.Vec2(target, 0)),
            cc.callFunc(() => {
                this.initStep(index);
            })
        ])
        this.contentNode.runAction(action);
    }

    /**
     * 步骤设置
     * @param index 第几步
     */
    private initStep(index: number = 0) {
        this.step = index;
        //设置点的颜色
        for (let i = 0; i < 3; i++) {
            if (i == index)
                this.spotArr[i].color = this.spotColor[1];
            else
                this.spotArr[i].color = this.spotColor[0];
        }

        let num = index == 2 ? 1 : 0;
        let sprite = this.stepNode.getComponent(cc.Sprite);
        sprite.spriteFrame = this.btnSpriteFrameArr[num];
        this.isMove = false;
    }
}