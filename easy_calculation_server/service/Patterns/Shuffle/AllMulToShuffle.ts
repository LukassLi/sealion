// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { Operator, OperatorType } from '../../Operator';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { MixedType } from '../../AstNode';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class AllMulToShuffle extends QiaoSuanPattern {
    private shuffleOrAddBracket: TransformActionBase = undefined;

    public get name(): string {
        return '连乘|交换位置优先算';
    }

    public get firstExpression(): string {
        return this.shuffleOrAddBracket.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        // 连加、连减的特征改成在枚举之初检查并放到QiaoSuanRunner中去
        if (
            steps.length >= 1 &&
            (steps[0] instanceof ShuffleAction || steps[0] instanceof AddBracketAction)
        ) {
            this.shuffleOrAddBracket = steps[0];
            if (this.shuffleOrAddBracket.mixed === MixedType.AllMul) {
                const val0 = this.shuffleOrAddBracket.targetToState.children[0].subTreeValue.valueString();
                if (val0 === '1' || val0 === '0') {
                    // 如果是 0/1 * ... ，那么跳过
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return (this.shuffleOrAddBracket as
            | ShuffleAction
            | AddBracketAction).getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        return (this.shuffleOrAddBracket as
            | ShuffleAction
            | AddBracketAction).getNumberFeatureScenes();
    }

    public getTransformScenes(): Scene[] {
        return (this.shuffleOrAddBracket as ShuffleAction | AddBracketAction).getTransformScenes();
    }

    public finalTokenNodeTree(): TokenNode {
        if (this.shuffleOrAddBracket instanceof ShuffleAction) {
            return this.shuffleOrAddBracket.getFinalTokenNodeTree();
        } else {
            return this.shuffleOrAddBracket.treeToTokenNodeTree;
        }
    }
}
