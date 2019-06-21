// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { FoldAction } from '../../TransformActions/FoldAction';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';

/*35×127-35×16-11×35*/
export class MulAddToFold extends QiaoSuanPattern {
    private fold: FoldAction = undefined;

    public get name(): string {
        return '逆用（乘法分配-加法）—提取公因数(MulAddToFold)'; // return '逆用（乘法分配-减法）—提取公因数';
    }

    public get firstExpression(): string {
        return this.fold.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length >= 1 && steps[0] instanceof FoldAction) {
            this.fold = steps[0] as FoldAction;
            // if (this.fold.targetFromState.mixedType === MixedType.AllAdd)
            {
                return true;
            }
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return this.fold.getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        return this.fold.getNumberFeatureScenes();
    }

    public getTransformScenes(): Scene[] {
        return this.fold.getTransformScenes();
    }

    public finalTokenNodeTree(): TokenNode {
        return this.fold.treeToTokenNodeTree;
    }
}
