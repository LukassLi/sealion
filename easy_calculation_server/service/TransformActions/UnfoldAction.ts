// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { BinaryHeap } from '../BinaryHeap';
import { Scene, SceneType } from '../Animation/Scene';
import { DistributiveSplitAnimation } from '../Animation/DistributiveSplitAnimation';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { NumFeatureSpeech, ExprFeatureSpeech, TransformSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';

export class UnfoldAction extends TransformActionBase {
    public otherFact: AstNode;

    // 展开之后每一组
    public groups: AstNode[];

    public commonFact: AstNode;

    public expandCommonFact: AstNode[];
    public getNumberFeature(node: AstNode): string {
        const number1 = node.children[0].subTreeValue.valueString();
        const number2 = node.children[1].subTreeValue.valueString();
        const result = node.subTreeValue.valueString();

        // `这两个数[p0]${number1}[p0]如果乘以${number2}[p0]结果刚好是${result}`;
        const speech = format(NumFeatureSpeech.UNFOLD_HIGHLIGHT, {
            number1,
            number2,
            result,
        });
        return speech;
    }

    public getNumberFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.number_feature);
        const uidToFromIdx: { [key: string]: number } = this.treeFromTokenNodeTree
            .flat()
            .reduce((l, x, i) => {
                l[x.uid] = i;
                return l;
            }, {});
        for (let i = 0; i < this.otherFact.children.length; ++i) {
            const child = this.otherFact.children[i];
            const animation = new HighLightAnimation();
            if (this.groups[i].children[0].numUid === child.numUid) {
                animation.indexes = [child.numUid, this.commonFact.numUid].map(
                    (x) => uidToFromIdx[x]
                );
            } else {
                animation.indexes = [this.commonFact.numUid, child.numUid].map(
                    (x) => uidToFromIdx[x]
                );
            }
            animation.calc = this.targetToState.children[i].subTreeValue.valueString();
            animation.speech = this.getNumberFeature(this.groups[i]);
            scene.animations.push(animation);
        }
        return [scene];
    }

    public getExpressionFeature(): string {
        return ExprFeatureSpeech.UNFOLD_HIGHLIGHT; // '它由一个括号包着的式子，与另一个数相乘组成[p300]';
    }

    public getExpressionFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.expression_feature);
        let animation = new HighLightAnimation();
        const uidToFromIdx: { [key: string]: number } = this.treeFromTokenNodeTree
            .flat()
            .reduce((l, x, i) => {
                l[x.uid] = i;
                return l;
            }, {});

        const idx = this.otherFact.children.reduce((l, x, i) => {
            if (i > 0) {
                l.push(uidToFromIdx[x.opUid]);
            }
            l.push(uidToFromIdx[x.numUid]);
            return l;
        }, []);
        idx.unshift(idx[0] - 1); // 加上括号
        idx.push(idx[idx.length - 1] + 1);
        animation.indexes = idx;

        scene.animations.push(animation);
        animation = new HighLightAnimation();
        animation.indexes.push(uidToFromIdx[this.commonFact.numUid]);
        scene.animations.push(animation);
        animation = new HighLightAnimation();
        if (this.commonFact.index === 1) {
            animation.indexes.push(uidToFromIdx[this.commonFact.opUid]);
        } else {
            animation.indexes.push(uidToFromIdx[this.otherFact.opUid]);
        }
        animation.speech = this.getExpressionFeature();
        scene.animations.push(animation);
        return [scene];
    }

    public getTransformScenes(): Scene[] {
        const scene = new Scene(SceneType.transform);
        const animation = new DistributiveSplitAnimation();
        const uidToFromIdx = this.treeFromTokenNodeTree.flat().reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const uidToIdx = this.treeToTokenNodeTree.flat().reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        animation.to_tokens = this.treeToTokenNodeTree.flat().map((x) => x.token);
        animation.from_index = uidToFromIdx[this.commonFact.id];
        animation.to_indexes = this.expandCommonFact.map((x) => uidToIdx[x.numUid]);
        animation.move_indexes = this.otherFact.children.reduce((l, x, i) => {
            if (i > 0) {
                l.push([uidToFromIdx[x.opUid], uidToIdx[x.opUid]]);
            }
            l.push([uidToFromIdx[x.numUid], uidToIdx[x.numUid]]);
            return l;
        }, new Array<number[]>());
        animation.speech = TransformSpeech.UNFOLD_DISTRIBUTIVESPLIT; // '根据乘法分配律，我们可以将算式写成这样';
        scene.animations.push(animation);
        return [scene];
    }

    /*
    尝试使用分配律展开两个乘积节点
    */
    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        callback();
        // 当前节点的符号不是加减，不可以使用结合律
        if (node.infix === undefined || node.infix.type === OperatorType.MUL === false) {
            return;
        }

        if (node.children.length < 2) {
            // 少于两个节点时无法使用结合律展开
            return;
        }

        if (node.children.length > 2) {
            // 多余两个节点时无法直接使用结合律展开，需要先进行Shuffle和AddBracket.
            return;
        }

        const nodeChildrenBackup = node.children;

        this.expandCommonFact = [];

        // 因为是使用结合律，所以node只有两个child
        for (let i = 0; i < node.children.length; ++i) {
            const child = node.children[i];
            // 子节点如果是加减，那么可以使用结合律展开
            if (
                child.children.length >= 2 &&
                (child.infix.type === OperatorType.SUB || child.infix.type === OperatorType.ADD)
            ) {
                const unfold = new Array<AstNode>();
                const common = node.children[1 - i];
                this.commonFact = common;
                this.otherFact = node.children[i];
                for (const grandChild of child.children) {
                    /*
            对于如下的子树
                        node----> child ---> grandChild
                         |          |
                         v          v
                         common   grandChild

                        node
                         |
                         |--------> new-child-------> grandChild-clone
                         |          |
                         |          v
                         |         common-clone
                         |
                         |
                         ---------> new-child-------> grandChild-clone
                                    |
                                    v
                                   common-clone
                    */
                    const grandChildClone = grandChild.clone();
                    const newChild = grandChild.clone();
                    newChild.children = [undefined, undefined];
                    newChild.children[1 - i] = common.clone(false);
                    this.expandCommonFact.push(newChild.children[1 - i]);
                    newChild.children[i] = grandChildClone;
                    newChild.operator = grandChild.operator;
                    newChild.infix = Operator.createMul();
                    grandChildClone.operator = node.children[1 - i].operator;
                    unfold.push(newChild);
                }
                node.children = unfold;
                node.infix = Operator.createAdd();
                this.targetToState = node.clone();
                this.cost = node.children.length;
                this.groups = unfold;
                callback();
                // 恢复，删去unfold，替换回node
                node.children = nodeChildrenBackup;
                node.infix = Operator.createMul();
            }
        }
    }
}
