// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { OpeningSpeech } from '../SpeechConfig';

export class MagnifierAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.magnifier;
    }

    public speech = OpeningSpeech.MAGNIFIER // '计算前[p0]我们首先观察一下算式的特点';

    public toJson(): any {
        return {
            type: this.type,
            speech: this.speech,
        };
    }
}
