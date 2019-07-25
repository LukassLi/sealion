// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
export class AddTailAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.add_tail;
    }

    public to_tokens: string[];

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            speech: this.speech,
        };
    }
}
