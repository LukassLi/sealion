// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { SceneType, Scene } from './Scene';
import { TransformSpeech } from '../SpeechConfig';

export class QuestionAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.question;
    }
    public static generateScence(): Scene {
        const scene = new Scene(SceneType.transform);
        scene.animations.push(new QuestionAnimation());
        scene.stop = true;
        return scene;
    }

    public speech = TransformSpeech.QUESTION; // '掌握这个信息，有什么用呢？';

    public toJson(): any {
        return {
            type: this.type,
            speech: this.speech,
        };
    }
}
