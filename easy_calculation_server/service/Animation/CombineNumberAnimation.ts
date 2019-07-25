// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
/*
{
    "type": "combine_number",  // 合并数字（计算）
    "to_tokens": ["23", "÷", "1", "×", "4"],  // 这里保证一定是在上一个token的基础上，在末尾添加了4个元素。所有的高亮
    "from_indexes": [2, 3, 4], // 计算上一个式子中的2,3,4这三个token进行计算（0.25÷4）
    "to_index": 2 // 新式子中的第2个token是计算结果:1
}
*/
export class CombineNumberAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.combine_number;
    }

    public token_tokens: string[];

    public from_indexes: number[];

    public to_index: number;

    public toJson(): any {    
        return {
            type: this.type,
            to_tokens: this.token_tokens,
            from_indexes: this.from_indexes,
            to_index: this.to_index,
            speech: this.speech,
        };
    }
}
