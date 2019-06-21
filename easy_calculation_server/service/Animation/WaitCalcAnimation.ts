// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { Scene, SceneType } from './Scene';
import { TransformSpeech } from '../SpeechConfig';
export class WaitCalcAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.wait_calc;
    }

    public static generateScence(): Scene {
        const scene = new Scene(SceneType.transform);
        scene.animations.push(new WaitCalcAnimation());
        scene.stop = true;
        return scene;
    }

    public speech = TransformSpeech.WAITCALC; // '现在，你能不动笔，就口算出来吗？';
    public toJson() {
        return {
            type: this.type,
            speech: this.speech,
        };
    }
}
