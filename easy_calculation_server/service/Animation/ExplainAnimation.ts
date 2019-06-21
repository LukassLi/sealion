// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { Scene, SceneType } from './Scene';
export class ExplainAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.explain;
    }

    public highlight_indexes: number[];

    public text: string[];

    public toJson(): any {
        return {
            type: this.type,
            highlight_indexes: this.highlight_indexes,
            text: this.text,
            speech: this.speech,
        };
    }
}
