// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { Operator, OperatorType } from '../../Operator';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { MixedType } from '../../AstNode';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class MulDivToShuffle extends QiaoSuanPattern {
    private shuffle: ShuffleAction;

    public get name(): string {
        return '乘除混合|符号搬家(MulDivToShuffle)';
    }

    public get firstExpression(): string {
        return this.shuffle.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length === 1 && steps[0] instanceof ShuffleAction) {
            this.shuffle = steps[0] as ShuffleAction;
            if (
                this.shuffle.targetFromState.mixedType === MixedType.AllDiv ||
                this.shuffle.targetFromState.mixedType === MixedType.MulDiv
            ) {
                const val0 = this.shuffle.targetToState.children[0].subTreeValue.valueString();
                const op = this.shuffle.targetToState.children[1].operator;
                if (val0 === '0' || (val0 === '1' && op.type === OperatorType.MUL)) {
                    // 如果是 0 * ... ，那么跳过
                    // 如果是 0 / ... ，那么跳过
                    // 如果是 1 * ... ，那么跳过
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
        return this.shuffle.treeToTokenNodeTree;
    }
}
