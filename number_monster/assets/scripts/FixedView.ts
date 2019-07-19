import RootNode from "./RootNode";

// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: hongchangfu (hongchangfu@flickering.ai)

//用于界面适配

const { ccclass, property } = cc._decorator;

declare const wx: any;

@ccclass
export default class FixedView extends cc.Component {
    onLoad() {
        this.fixedViewSize();
    }

    private fixedViewSize() {
        if (typeof wx == "undefined")
            return;

         //菜单按钮上边界
         let height = 0;

        //低版本可能没接口
        if (wx.getMenuButtonBoundingClientRect) {
            //获取菜单按钮（右上角胶囊按钮）的布局位置信息。
            let object = wx.getMenuButtonBoundingClientRect();
            height = object.top;
        }

        let nodeSize = new cc.Size(720, 1280);
        let size = cc.view.getFrameSize();
        let scale = size.width / size.height;
        if (scale < 9 / 16) {
            //有额头
            if (height > 5.625) {
                //比例换算
                height = height * 1280 / size.height;
            } else
                height = 0;
            nodeSize.height = 720 / scale - height;
            this.node.position = new cc.Vec2(0, -height / 2);
            RootNode.fixHeight = height / 2;
        }
        else
            nodeSize.width = 1280 * scale;
        this.node.setContentSize(nodeSize);
    }
}