// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

export enum AnimationType {
    magnifier,
    highlight,
    start_explain,
    add_tokens,
    split_number,
    combine_number,
    add_tail,
    distributive_combine,
    distributive_split,
    add_parenthesis,
    remove_parenthesis,
    move,
    step_calc,
    question,
    explain,
    wait_calc,
    finish,
}

export abstract class AnimationBase {
    public abstract get animationType(): AnimationType;

    protected get type(): string {
        return AnimationType[this.animationType];
    }

    public debug: any;
    public speech: string;

    public abstract toJson(): any;
}
