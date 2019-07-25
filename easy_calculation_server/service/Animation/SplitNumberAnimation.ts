// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';

/*
{
    "type": "split_number",  // 拆数的动画
    "to_tokens": ["(", "1", "-", "0.01", ")", "×", "7.98"],
    "from_index": 0, // 原式中的0.99
    "to_indexes": [0, 1, 2, 3, 4], // 新式子中的括号
    "highlight_indexes": []  // 没有高亮
}
*/

export class SplitNumberAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.split_number;
    }

    public to_tokens: string[];

    public from_index: number;

    public to_indexes: number[];

    public highlight_indexes: number[];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            from_index: this.from_index,
            to_indexes: this.to_indexes,
            highlight_indexes: this.highlight_indexes,
            speech: this.speech,
            // debug: this.debug
        };
    }
}
