// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { MixedType } from '../../AstNode';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class AddSubToShuffle extends QiaoSuanPattern {
    private shuffle: ShuffleAction;

    public get name(): string {
        return '加减混合|符号搬家(AddSubToShuffle)';
    }

    public get firstExpression(): string {
        return this.shuffle.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length == 1 && steps[0] instanceof ShuffleAction) {
            this.shuffle = steps[0] as ShuffleAction;
            if (
                this.shuffle.targetFromState.mixedType === MixedType.AllSub ||
                this.shuffle.targetFromState.mixedType === MixedType.AddSub
            ) {
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
