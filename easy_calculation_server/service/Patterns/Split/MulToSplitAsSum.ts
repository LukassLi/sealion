// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { SplitNumberAction, SplitType } from '../../TransformActions/SplitNumberAction';
import { Scene } from '../../Animation/Scene';
import { TokenNode } from '../../Token';
import { RemoveBracketAction } from '../../TransformActions/RemoveBracketAction';
import { QiaoSuanPatternMatcher } from '../../QiaoSuanPatternMatcher';
import { Operator, OperatorType } from '../../Operator';

/* 25×(32×125) */
/* 108×125 */
export class MulToSplitAsSum extends QiaoSuanPattern {
    public split: SplitNumberAction;
    public unbracket: RemoveBracketAction;

    public subPattern: QiaoSuanPattern;

    public get name(): string {
        return '两数相乘—拆数（和）用运算律（MulToSplitAsSum）';
    }

    public get firstExpression(): string {
        return this.split.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length >= 1 && steps[0] instanceof SplitNumberAction) {
            this.split = steps[0] as SplitNumberAction;

            try {
                if (
                    this.split.targetFromState.operator.type !== OperatorType.MUL &&
                    this.split.targetFromState.operator.type !== OperatorType.DIV ||
                    this.split.splitType !== SplitType.Sum
                ) {
                    return false;
                }
            } catch (error) {
                console.log(this.split);
                throw error;
            }

            const matchedSubPattern = QiaoSuanPatternMatcher.getBasicPatternList().filter((x) =>
                x.match(steps.slice(1))
            );
            if (matchedSubPattern.length > 0) {
                this.subPattern = matchedSubPattern[0];
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return [];
    }

    public getNumberFeatureScenes(): Scene[] {
        const subPatternNumberFeature = this.subPattern.getNumberFeatureScenes();
        const scenes = new Array<Scene>();
        scenes.push(...this.split.getNumberFeatureScenes());
        return scenes;
    }

    public getTransformScenes(): Scene[] {
        const subPatternTransform = this.subPattern.getTransformScenes();
        const scenes = new Array<Scene>();
        scenes.push(...this.split.getTransformScenes());
        scenes.push(...subPatternTransform);
        return scenes;
    }

    public finalTokenNodeTree(): TokenNode {
        return this.subPattern.finalTokenNodeTree();
    }
}
