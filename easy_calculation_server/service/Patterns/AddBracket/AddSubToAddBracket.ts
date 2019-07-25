// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { MixedType } from '../../AstNode';
import { TokenNode } from '../../Token';
import { Scene } from '../../Animation/Scene';

export class AddSubToAddBracket extends QiaoSuanPattern {
    private addBracket: AddBracketAction = undefined;

    public get name(): string {
        return '连减或混合|添括号';
    }

    // 第一步算式
    public get firstExpression(): string {
        return this.addBracket.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        // 连加、连减的特征改成在枚举之初检查并放到QiaoSuanRunner中去
        if (steps.length === 1 && steps[0] instanceof AddBracketAction) {
            this.addBracket = steps[0] as AddBracketAction;
            return (
                (this.addBracket.targetFromState.mixedType === MixedType.AllSub ||
                    this.addBracket.targetFromState.mixedType === MixedType.AddSub ||
                    this.addBracket.targetFromState.mixedType === MixedType.AllAdd) &&
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
        return this.addBracket.getTransformScenes();
    }

    public finalTokenNodeTree(): TokenNode {
        return this.addBracket.treeToTokenNodeTree;
    }
}
