// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { Scene } from '../../Animation/Scene';
import { SplitNumberAction, SplitType } from '../../TransformActions/SplitNumberAction';
import { QiaoSuanPatternMatcher } from '../../QiaoSuanPatternMatcher';
import { TokenNode } from '../../Token';

export class AddToMakeTens extends QiaoSuanPattern {
    public makeTens: SplitNumberAction[];

    public subPattern: QiaoSuanPattern;

    public get name(): string {
        return '"减去整十百临近数|凑整（易错）';
    }

    // 第一步算式
    public get firstExpression(): string {
        return this.makeTens[0].treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps[0] instanceof SplitNumberAction) {
            this.makeTens = new Array<SplitNumberAction>();
            for (let i = 0; i < steps.length; ++i) {
                if (
                    steps[i] instanceof SplitNumberAction &&
                    (steps[i] as SplitNumberAction).splitType === SplitType.AddOne
                ) {
                    this.makeTens.push(steps[i] as SplitNumberAction);
                } else {
                    const matchedSubPattern = QiaoSuanPatternMatcher.getBasicPatternList().filter(
                        (x) => x.match(steps.slice(i))
                    );

                    if (matchedSubPattern.length > 0) {
                        this.subPattern = matchedSubPattern[0];
                        return true;
                    } else {
                        return false;
                    }
                }
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
        for (const makeTen of this.makeTens) {
            scenes.push(...makeTen.getNumberFeatureScenes());
        }
        return scenes;
    }

    public getTransformScenes(): Scene[] {
        const subPatternTransform = this.subPattern.getTransformScenes();
        const scenes = new Array<Scene>();
        scenes.push(...this.makeTens[0].getTransformScenes());
        scenes.push(...subPatternTransform);
        return scenes;
    }

    public finalTokenNodeTree(): TokenNode {
        return this.subPattern.finalTokenNodeTree();
    }
}
