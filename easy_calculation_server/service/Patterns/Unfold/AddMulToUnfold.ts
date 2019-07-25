// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { UnfoldAction } from '../../TransformActions/UnfoldAction';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

export class AddMulToUnfold extends QiaoSuanPattern {
    private unfold: UnfoldAction = undefined;

    public get name(): string {
        return '正用—展开凑整(a+b)c=ac+bc';
    }

    // 第一步算式
    public get firstExpression(): string {
        return this.unfold.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        // TODO:连加、连减的特征改成在枚举之初检查并放到QiaoSuanRunner中去
        if (steps.length >= 1 && steps[0] instanceof UnfoldAction) {
            this.unfold = steps[0] as UnfoldAction;
            return true;
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return this.unfold.getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        return this.unfold.getNumberFeatureScenes();
    }

    public getTransformScenes(): Scene[] {
        return this.unfold.getTransformScenes();
    }

    public finalTokenNodeTree(): TokenNode {
        return this.unfold.treeToTokenNodeTree;
    }
}
