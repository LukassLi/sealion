// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { AddParenthesisAnimation } from './AddParenthesisAnimation';
export class RemoveParenthesisAnimation extends AddParenthesisAnimation {
    public get animationType(): AnimationType {
        return AnimationType.remove_parenthesis;
    }
}
