// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase } from './AnimationBase';

/*
{
    "id": 0,
    "scene": "opening",
    "animations": [
        {
            "type": "calc",
            "indexes": [3, 4, 6, 7],
            "tip": "100",
            "speech": "这题，我们计算的是[p300]2[p0]加3[p0]加12[p0]加7"
        },
    ],
    "stop": false
}
*/

export enum SceneType {
    opening,
    expression_feature,
    transform,
    split_number,
    calculation,
    number_feature,
}

export class Scene {
    public id: number;
    public type: SceneType;
    public animations: AnimationBase[];
    public stop: boolean;

    constructor(type: SceneType) {
        this.type = type;
        this.animations = new Array<AnimationBase>();
    }

    public get json(): any {
        return {
            id: this.id,
            scene: SceneType[this.type],
            animations: this.animations.map((x) => x.toJson()),
            stop: this.stop,
        };
    }
}
