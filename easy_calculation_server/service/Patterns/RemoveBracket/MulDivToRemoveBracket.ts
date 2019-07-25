// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from './../QiaoSuanPattern';
import { RemoveBracketAction } from '../../TransformActions/RemoveBracketAction';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { MixedType } from '../../AstNode';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class MulDivToRemoveBracket extends QiaoSuanPattern {
    private removeBracket: RemoveBracketAction = undefined;

    public get name(): string {
        return '乘除混合|去括号';
    }

    public get firstExpression(): string {
        return this.removeBracket.treeToState;
    }

    /** 判断变化动作是否匹配 */
    public match(steps: TransformActionBase[]): boolean {
        if (steps.length >= 1 && steps[0] instanceof RemoveBracketAction) {
            this.removeBracket = steps[0] as RemoveBracketAction;
            if (
                this.removeBracket.targetToState.mixedType !== MixedType.AllDiv &&
                this.removeBracket.targetToState.mixedType !== MixedType.MulDiv
            ) {
                return false;
            }
            return true;
        }
    }

    public getExpressionFeatureScenes(): Scene[] {
        throw new Error('Method not implemented.');
    }

    public getNumberFeatureScenes(): Scene[] {
        throw new Error('Method not implemented.');
    }

    public getTransformScenes(): Scene[] {
        throw new Error('Method not implemented.');
    }

    public finalTokenNodeTree(): TokenNode {
        throw new Error('Method not implemented.');
    }
}
