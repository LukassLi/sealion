// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
export class AddTokensAnimation extends AnimationBase {
    public value: string[];
    public get animationType(): AnimationType {
        return AnimationType.add_tokens;
    }
    public toJson(): any {
        return {
            type: this.type,
            value: this.value,
            speech: this.speech,
        };
    }
}
