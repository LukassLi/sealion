// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { BinaryHeap } from '../BinaryHeap';
import { FiniteDecimal } from '../Arithmetic/FiniteDecimal';
import { Scene, SceneType } from '../Animation/Scene';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { SplitNumberAnimation } from '../Animation/SplitNumberAnimation';
import { NumFeatureSpeech, TransformSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';

export enum SplitType {
    Sum,
    Product,
    AddOne,
}

/*
    拆数的情形

    *x => *(a*b)   split -> remove bracket
    *x => *(a+b)   split -> unfold
    +x => +a*b     split -> fold
    +x => +(a+b)   split -> remove bracket
*/

export class SplitNumberAction extends TransformActionBase {
    public splitType: SplitType;
    public splitSumCandidates: number[];
    public splitProductCandidates: number[];

    public sum: FiniteDecimal[];

    public splitTo: AstNode[];

    constructor(
        targetFrom: AstNode,
        from: AstNode,
        heap: BinaryHeap<AstNode>,
        splitSumCandidates: number[],
        splitProductCandidates: number[]
    ) {
        super(targetFrom, from, heap);
        this.splitSumCandidates = splitSumCandidates;
        this.splitProductCandidates = splitProductCandidates;
    }

    public getNumberFeatureScenes(): Scene[] {
        const tokensWithUid = this.treeInitialTokenNodeTree.flat();
        const uidToIdx = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const splitScene = new Scene(SceneType.number_feature);
        const splitHighLight = new HighLightAnimation();
        splitHighLight.indexes = [uidToIdx[this.targetFromState.numUid]];

        const splitFrom = this.targetFromState;
        const splitTo = this.targetToState.children;
        if (this.splitType === SplitType.AddOne) {
            splitHighLight.text = `${splitFrom.operand.valueString()}≈${splitTo[0].operand.valueString()}`;
            splitHighLight.speech = format(NumFeatureSpeech.SPLIT_HIGHLIGHT_NEAR, {
                number1: splitFrom.operand.valueString(),
                number2: splitTo[0].operand.valueString(),
            });
        } else {
            splitHighLight.text = `${splitFrom.operand.valueString()}=${splitTo[0].operand.valueString()}${
                splitTo[1].operator.mark
            }${splitTo[1].operand.valueString()}`;

            splitHighLight.speech = format(NumFeatureSpeech.SPLIT_HIGHLIGHT_CALC, {
                numberTarget: splitFrom.operand.valueString(),
                number1: splitTo[0].operand.valueString(),
                operator: splitTo[1].operator.doubleCharText,
                number2: splitTo[1].operand.valueString(),
            });
        }
        splitScene.animations.push(splitHighLight);
        return [splitScene];
    }

    public getExpressionFeatureScenes(): Scene[] {
        return [];
    }

    public getTransformScenes(): Scene[] {
        const fromTokensWithUid = this.treeInitialTokenNodeTree.flat();
        const fromUidToIdx = fromTokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const tokensWithUid = this.treeToTokenNodeTree.flat();
        const uidToIdx = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const scenes = new Array<Scene>();
        const transform = new Scene(SceneType.transform);
        const animation = new SplitNumberAnimation();

        animation.from_index = fromUidToIdx[this.targetFromState.numUid];
        animation.to_tokens = this.treeToTokenNodeTree.flat().map((x) => x.token);
        animation.to_indexes = this.targetToState
            .getTokenTree()
            .flat()
            .map((x) => uidToIdx[x.uid]);
        animation.highlight_indexes = [];
        animation.speech = format(TransformSpeech.SPLIT_TRANS, {
            numberTarget: this.targetFromState.operand.valueString(),
            number1: this.targetToState.children[0].operand.valueString(),
            operator: this.targetToState.children[1].operator.doubleCharText,
            number2: this.targetToState.children[1].operand.valueString(),
        });
        transform.animations.push(animation);
        scenes.push(transform);
        return scenes;
    }

    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        this.cost = 0;
        callback();
        if (node.children.length > 0) {
            // 非叶节点直接skip
            return;
        }

        if (
            node.parent !== undefined &&
            (node.operator.type === OperatorType.MUL || node.operator.priority === OperatorType.DIV)
        ) {
            for (const child of node.parent.children) {
                if (child.children.length > 0) {
                    return;
                }
            }
        }

        this.cost = 1;

        node.operand.normalize();
        const value = node.operand.value;

        if ((node.operator.type === OperatorType.DIV) === false) {
            this.splitType = SplitType.Sum;
            for (const v0 of this.splitSumCandidates) {
                for (let v = v0; v <= value; v *= 10) {
                    if (value === v) {
                        continue;
                    }

                    const valueString = value.toString();
                    const vString = v.toString();

                    if (valueString.endsWith(vString)) {
                        // value 以 v 结尾
                    } else if (valueString.length === vString.length) {
                        // value 以 v 开头，末尾用0补齐
                        let isOk = true;
                        for (let i = 0; i < vString.length; ++i) {
                            if (valueString[i] === vString[i]) {
                                continue;
                            } else {
                                for (let j = i; j < vString.length; ++j) {
                                    if (vString[i] !== '0') {
                                        isOk = false;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!isOk) {
                            continue;
                        }
                    }

                    const a = new AstNode();
                    a.operand = new FiniteDecimal(v);
                    a.operand.floatLength = node.operand.floatLength;
                    a.operator = Operator.createAdd();

                    const b = new AstNode();
                    b.operand = new FiniteDecimal(Math.abs(value - v));
                    b.operand.floatLength = node.operand.floatLength;
                    b.operator = Operator.createAdd();

                    node.children = [a, b];
                    node.infix = value > v ? Operator.createAdd() : Operator.createSub();

                    this.targetToState = node.clone();
                    this.cost = 1;
                    this.sum = [a.operand, b.operand];
                    callback();

                    if (value > v) {
                        node.children = [b, a];
                        node.infix = Operator.createAdd();
                        this.targetToState = node.clone();
                        this.cost = 1;
                        this.sum = [b.operand, a.operand];
                        callback();
                    }
                }
            }
        }

        this.splitType = SplitType.Product;
        // 拆因子 fa * fb
        for (const fa of this.splitProductCandidates) {
            if (value % fa === 0 && value !== fa && fa !== 1) {
                const fb = value / fa;

                const a = new AstNode();
                a.operand = new FiniteDecimal(fa);
                a.operator = Operator.createMul();

                const b = new AstNode();
                b.operand = new FiniteDecimal(fb);
                b.operand.floatLength = node.operand.floatLength;
                b.operator = Operator.createMul();

                node.infix = Operator.createMul();
                node.children = [a, b];
                node.children.forEach((x, i) => (x.index = i));
                this.targetToState = node.clone();

                callback();
                if (fa !== fb) {
                    node.children = [b, a];
                    node.children.forEach((x, i) => (x.index = i));
                    this.targetToState = node.clone();
                    callback();
                }
            }
        }

        if ((node.operator.type === OperatorType.DIV) === false) {
            this.splitType = SplitType.AddOne;
            let one = 1;
            let val = value;
            while (val % 10 === 0) {
                one = one * 10;
                val = val / 10;
            }

            if (val % 10 === 9 && value > 0) {
                const a = new AstNode();
                a.operand = new FiniteDecimal(value + one);
                a.operand.floatLength = node.operand.floatLength;
                a.operator = Operator.createAdd();

                const c = new AstNode();
                c.operand = new FiniteDecimal(one);
                c.operand.floatLength = node.operand.floatLength;
                c.operator = Operator.createSub();
                c.isAddOne = true;

                node.children = [a, c];
                node.infix = Operator.createAdd();
                this.targetToState = node.clone();

                this.cost = 1;
                this.sum = [a.operand, c.operand];
                callback();
            }

            if (val % 10 === 1 && value > one) {
                const a = new AstNode();
                a.operand = new FiniteDecimal(value - one);
                a.operand.floatLength = node.operand.floatLength;
                a.operator = Operator.createAdd();

                const c = new AstNode();
                c.operand = new FiniteDecimal(one);
                c.operand.floatLength = node.operand.floatLength;
                c.operator = Operator.createAdd();
                c.isAddOne = true;

                node.children = [a, c];
                node.infix = Operator.createAdd();
                this.targetToState = node.clone();

                this.cost = 1;
                this.sum = [a.operand, c.operand];
                callback();
            }
        }

        node.children = [];
        node.infix = undefined;
    }
}
