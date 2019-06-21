// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { MixedType } from '../../AstNode';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class AllAddToShuffle extends QiaoSuanPattern {
    private shuffle: ShuffleAction = undefined;

    public get name(): string {
        return '连加|交换位置优先算(AllAddToShuffle)';
    }

    public get firstExpression(): string {
        return this.shuffle.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length === 1 && steps[0] instanceof ShuffleAction) {
            this.shuffle = steps[0] as ShuffleAction;
            if (this.shuffle.mixed === MixedType.AllAdd) {
                if (this.shuffle.targetToState.children[0].subTreeValue.valueString() === '0') {
                    // 如果是 0 +/- ... ，那么跳过
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return this.shuffle.getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        return this.shuffle.getNumberFeatureScenes();
    }

    public getTransformScenes(): Scene[] {
        return this.shuffle.getTransformScenes();
    }

    public finalTokenNodeTree(): TokenNode {
        return this.shuffle.getFinalTokenNodeTree();
    }
}
