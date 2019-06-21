// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { Operator, OperatorType } from '../Operator';

/*
    "to_tokens": ["(", "8.56", "+", "1.44", ")", "+", "(", "4_3/5", "-", "1_3/5", ")"],
    "parenthesis": [ // 这是一个数组，因为每组可能会要增加多组括号
        {
            "indexes": [0, 4], // 新式子中括号的坐标
            "change_sign": undefined // 无需变号
        },
        {
            "indexes": [6, 10],
            "change_sign": undefined // 无需变号
        }
    ]
*/

export interface ParenthesisDescription {
    indexes: number[];
    change_sign?: { sign_before: number; sign_in: number[] };
    no_change_sign?: { sign_before: number; sign_in: number[] };
    type?: Operator;
}

export class AddParenthesisAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.add_parenthesis;
    }

    public to_tokens: string[] = [];

    public parenthesis: ParenthesisDescription[] = [];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            parenthesis: this.parenthesis,
            speech: this.speech,
        };
    }
}
