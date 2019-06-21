// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
/*
// 原token是["(", "1", "-", "0.01", ")", "×", "7.98"]
{
    "type": "distributive_split",  // 拆数的动画
    "to_tokens": ["1", "×", "7.98", "-", "0.01", "×", "7.98"],
    "from_index": 6, // 原式中的7.98
    "to_indexes": [2, 6], // 新式子中的两个7.98
    "move_indexes": [{
        "from": 1, // 原式的1，从原式的index1到目标的0
        "to": 0
    }, {
        "from": 3, // 原式的3到目标的4
        "to": 4
    }]
}
*/
export class DistributiveSplitAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.distributive_split;
    }

    public to_tokens: string[];

    public from_index: number;

    public to_indexes: number[];

    public move_indexes: number[][];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            from_indexes: this.from_index,
            to_index: this.to_indexes,
            move_indexes: this.move_indexes,
            speech: this.speech,
        };
    }
}
