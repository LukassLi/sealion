// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from './../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { MixedType } from '../../AstNode';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class MulDivToAddBracket extends QiaoSuanPattern {
    private addBracket: AddBracketAction = undefined;

    public get name(): string {
        return '连除或混合|添括号(MulDivToAddBracket)';
    }

    public get firstExpression(): string {
        return this.addBracket.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        // 连加、连减的特征改成在枚举之初检查并放到QiaoSuanRunner中去
        if (steps.length === 1 && steps[0] instanceof AddBracketAction) {
            this.addBracket = steps[0] as AddBracketAction;
            return (
                (this.addBracket.mixed === MixedType.AllDiv ||
                    this.addBracket.mixed === MixedType.MulDiv) &&
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
