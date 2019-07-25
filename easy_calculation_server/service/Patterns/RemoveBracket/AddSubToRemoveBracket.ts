// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaoSuanPattern } from '../QiaoSuanPattern';
import { RemoveBracketAction } from '../../TransformActions/RemoveBracketAction';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { ShuffleAction } from '../../TransformActions/ShuffleAction';
import { Scene, SceneType } from '../../Animation/Scene';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { TokenNode } from '../../Token';

/*1000÷(125÷4) */
/*8.56-(87-1.44)+187*/
export class AddSubToRemoveBracket extends QiaoSuanPattern {
    private removeBracket: RemoveBracketAction = undefined;
    private addBracket: AddBracketAction = undefined;
    private shuffle: ShuffleAction = undefined;
    private finalAction: TransformActionBase;

    public get name(): string {
        return '加减混合|去括号(AddSubToRemoveBracket)';
    }

    // 第一步算式
    public get firstExpression(): string {
        return this.removeBracket.treeToState;
    }

    public match(steps: TransformActionBase[]): boolean {
        if (steps.length >= 1 && steps[0] instanceof RemoveBracketAction) {
            this.removeBracket = steps[0] as RemoveBracketAction;
            this.finalAction = steps[0];

            if (steps.length >= 2 && steps[1] instanceof ShuffleAction) {
                this.shuffle = steps[1] as ShuffleAction;
                this.finalAction = steps[1];
                if (steps.length >= 3 && steps[2] instanceof AddBracketAction) {
                    this.addBracket = steps[2] as AddBracketAction;
                    this.finalAction = steps[2];
                }
            }
            if (steps.length >= 2 && steps[1] instanceof AddBracketAction) {
                this.addBracket = steps[1] as AddBracketAction;
                this.finalAction = steps[1];
            }
            return true;
        }
        return false;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return this.removeBracket.getExpressionFeatureScenes();
    }

    public getNumberFeatureScenes(): Scene[] {
        if (this.addBracket !== undefined) {
            return this.addBracket.getNumberFeatureScenes();
        } else if (this.shuffle !== undefined) {
            return this.shuffle.getNumberFeatureScenes();
        } else {
            return this.removeBracket.getNumberFeatureScenes();
        }
    }

    public getTransformScenes(): Scene[] {
        const scenes = new Array<Scene>();
        const removeBracketScene = this.removeBracket.getTransformScenes()[0];
        scenes.push(removeBracketScene);

        let shuffleScene: Scene;
        let addBrackScene: Scene;
        let order = 1;
        if (this.shuffle !== undefined) {
            const isLast = this.addBracket === undefined;
            shuffleScene = this.shuffle.getTransformScenes(order, isLast)[0];
            if (shuffleScene !== undefined) {
                order++;
            }
        }
        if (this.addBracket !== undefined) {
            addBrackScene = this.addBracket.getTransformScenes(order, true)[0];
        }

        if (shuffleScene !== undefined || addBrackScene !== undefined) {
            const mergedScene = new Scene(SceneType.transform);
            if (shuffleScene !== undefined) {
                mergedScene.animations.push(shuffleScene.animations[0]);
            }
            if (addBrackScene !== undefined) {
                mergedScene.animations.push(addBrackScene.animations[0]);
            }
            scenes.push(mergedScene);
        }

        return scenes;
    }

    public finalTokenNodeTree(): TokenNode {
        return this.finalAction.treeToTokenNodeTree;
    }
}
