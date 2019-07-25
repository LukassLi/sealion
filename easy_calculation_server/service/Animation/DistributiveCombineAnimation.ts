// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
/*
// 原token是["25", "×", "78", "+", "23", "×", "25", "-", "25", "×", "1"]
{
    "type": "distributive_combine",  // 拆数的动画
    "to_tokens": ["25", "×", "(", "78", "+", "23", "-", "1", ")"],
    "from_indexes": [0, 6, 8], // 原式中的3个25
    "to_index": 0, // 新式子中的25
    "move_indexes": [[2, 3], [4, 5], [10, 7]]  // 原式的78，从原式的index2到目标的3；原式的4到目标的5；原式的10到目标的7
}
*/
export class DistributiveCombineAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.distributive_combine;
    }

    public to_tokens: string[];

    public from_indexes: number[];

    public to_index: number;

    public move_indexes: number[][];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            from_indexes: this.from_indexes,
            to_index: this.to_index,
            move_indexes: this.move_indexes,
            // debug: this.debug,
            speech: this.speech,
        };
    }
}
