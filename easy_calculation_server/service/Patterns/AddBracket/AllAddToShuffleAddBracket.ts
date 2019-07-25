// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { MixedType } from '../../AstNode';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class AllAddToShuffleAddBracket extends QiaoSuanPattern {
    private shuffle: ShuffleAction = undefined;
    private addBracket: AddBracketAction = undefined;

    public get name(): string {
        return '连加|交换位置优先算(AllAddToShuffleAddBracket)';
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
                this.shuffle.mixed === MixedType.AllAdd &&
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
        return this.shuffle
            .getTransformScenes()
            .concat(this.addBracket.getTransformScenes(1, true));
    }

    public finalTokenNodeTree(): TokenNode {
        return this.addBracket.treeToTokenNodeTree;
    }
}
