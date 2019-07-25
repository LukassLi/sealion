// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
/*
{
    "type": "highlight",  // 用字体颜色表示朗读进度
    "indexes": [0]  // 表示前面token里的第0个元素278
}
*/
export class HighLightAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.highlight;
    }

    public indexes: number[] = [];

    public text: string;

    public calc: string;

    public toJson(): any {
        return {
            type: this.type,
            indexes: this.indexes,
            text: this.text,
            calc: this.calc,
            speech: this.speech,
            //debug: this.debug,
        };
    }
}
