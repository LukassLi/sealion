// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
export class StartExplainAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.start_explain;
    }
    public toJson(): any {
        return {
            type: this.type,
            speech: this.speech,
        };
    }
}
