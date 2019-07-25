// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { Scene, SceneType } from './Scene';
import { CalculationSpeech } from '../SpeechConfig';
export class FinishAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.finish;
    }

    public static generateScence(): Scene {
        const scene = new Scene(SceneType.calculation);
        scene.animations.push(new FinishAnimation());
        return scene;
    }

    public speech = CalculationSpeech.FINISH; // '怎么样，这么算是不是又快又准呢？';
    public toJson() {
        return {
            type: this.type,
            speech: this.speech,
        };
    }
}
