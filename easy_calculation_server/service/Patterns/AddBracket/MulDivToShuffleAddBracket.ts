// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { MixedType } from '../../AstNode';
import { Scene } from '../../Animation/Scene';
import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TokenNode } from '../../Token';

/*
  2.7÷0.9÷0.9×2.7
  (2.7÷0.9)×(2.7÷0.9)
*/
export class MulDivToShuffleAddBracket extends QiaoSuanPattern {
    private shuffle: ShuffleAction;
    private addBracket: AddBracketAction;

    public get name(): string {
        return '乘除混合|符号搬家(MulDivToShuffleAddBracket)';
    }

    public get firstExpression(): string {
        return this.shuffle.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (
            steps.length === 2 &&
            steps[0] instanceof ShuffleAction &&
            steps[1] instanceof AddBracketAction
        ) {
            this.shuffle = steps[0] as ShuffleAction;
            this.addBracket = steps[1] as AddBracketAction;
            return (
                (this.shuffle.targetFromState.mixedType === MixedType.AllMul ||
                    this.shuffle.targetFromState.mixedType === MixedType.AllDiv ||
                    this.shuffle.targetFromState.mixedType === MixedType.MulDiv) &&
                this.addBracket.newBrackets.some((x) => x.children.length > 2) === false
            );
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return this.addBracket.getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        return this.addBracket.getNumberFeatureScenes();
    }

    public getTransformScenes(): Scene[] {
        const scenes = this.shuffle
            .getTransformScenes()
            .concat(this.addBracket.getTransformScenes(1, true));
        return scenes;
    }

    public finalTokenNodeTree(): TokenNode {
        return this.addBracket.treeToTokenNodeTree;
    }
}
