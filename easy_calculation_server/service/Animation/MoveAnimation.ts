// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';

/*
{
        "type": "move",  // 带符号搬家的动画
        "to_tokens": ["8.56", "+", "1.44", "+", "4_3/5", "-", "1_3/5"],
        "move_indexes": [{
            "from": [1, 2], // 原式中的 "-", "1_3/5" 位于 1 2位置
            "to": [5, 6] // 移动到目标式子的 5 6位置
        }, {
            "from": [3, 4], // "+", "1.44"
            "to": [1, 2]
        }, {
            "from": [5, 6], // "+", "4_3/5"
            "to": [3, 4]
        }
*/

export class MoveAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.move;
    }

    public to_tokens: string[] = [];

    public move_indexes: Array<{ from: number[]; to: number[] }> = [];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            move_indexes: this.move_indexes,
            speech: this.speech,
        };
    }
}
