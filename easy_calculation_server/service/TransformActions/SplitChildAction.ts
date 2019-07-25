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
import { timingSafeEqual } from 'crypto';
import { TokenNode, Token } from '../Token';

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

export class SplitChildAction extends TransformActionBase {
    public splitSumCandidates: { [key: number]: number[] };
    public splitProductCandidates: { [key: number]: number[] };

    public sum: FiniteDecimal[];

    public splits: Array<{
        splitFrom: AstNode;
        splitTo: AstNode[];
        splitType: SplitType;
        splitToToken: Token[];
    }>;

    constructor(
        targetFrom: AstNode,
        from: AstNode,
        heap: BinaryHeap<AstNode>,
        splitSumCandidates: { [key: number]: number[] },
        splitProductCandidates: { [key: number]: number[] }
    ) {
        super(targetFrom, from, heap);
        this.splitSumCandidates = splitSumCandidates;
        this.splitProductCandidates = splitProductCandidates;
    }

    public getNumberFeatureScenes(): Scene[] {
        const tokensWithUid = this.treeInitialTokenNodeTree.flat();
        const uidFromIdx = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const scenes = new Array<Scene>();

        for (const split of this.splits) {
            const splitFrom = split.splitFrom;
            const splitTo = split.splitTo;

            const splitScene = new Scene(SceneType.number_feature);
            const splitHighLight = new HighLightAnimation();
            splitHighLight.indexes = [uidFromIdx[splitFrom.numUid]];
            // splitHighLight.debug = tokensWithUid;
            if (split.splitType === SplitType.AddOne) {
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
            scenes.push(splitScene);
        }
        return scenes;
    }

    public getExpressionFeatureScenes(): Scene[] {
        return [];
    }

    public getTransformScenes(): Scene[] {
        let fromUidToIdx = this.treeInitialTokenNodeTree.flat().reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        const scenes = new Array<Scene>();

        for (const split of this.splits) {
            const transform = new Scene(SceneType.transform);
            const animation = new SplitNumberAnimation();

            const uidToIdx = split.splitToToken.reduce((l, x, i) => {
                l[x.uid] = i;
                return l;
            }, {});

            animation.from_index = fromUidToIdx[split.splitFrom.numUid];
            animation.to_tokens = split.splitToToken.map((x) => x.token);
            animation.to_indexes = split.splitTo.map((x) => uidToIdx[x.numUid]);
            animation.highlight_indexes = [];
            animation.speech = format(TransformSpeech.SPLIT_TRANS, {
                numberTarget: split.splitFrom.operand.valueString(),
                number1: split.splitTo[0].operand.valueString(),
                operator: split.splitTo[1].operator.doubleCharText,
                number2: split.splitTo[1].operand.valueString(),
            });
            transform.animations.push(animation);
            scenes.push(transform);

            fromUidToIdx = uidToIdx;
        }
        return scenes;
    }

    public trySplit(rightChildren: AstNode[], leftChildren: AstNode[], callback: () => any) {
        if (rightChildren.length === 0) {
            this.targetToState = this.target.clone();
            callback();
            return;
        }

        const node = rightChildren[0];
        const newRightChildren = rightChildren.slice(1);

        // 1. 不Split当前节点，直接下一个
        this.trySplit(newRightChildren, [...leftChildren, node], callback);

        if (node.children.length > 0) {
            return;
        }

        let allowSplitAsAdd = true;

        if (
            node.operator.type === OperatorType.MUL || node.operator.type === OperatorType.DIV
        ) {
            let containsAdd = false;
            
            // 不允许拆出 (a + b) * (c + d) * ...
            
            node.treeApply((x) => {
                if(x.children.length !== 0) {
                    return;
                }
                
                if(x.operator.type === OperatorType.ADD || x.operator.type === OperatorType.SUB) {
                    allowSplitAsAdd = false;
                }
            });
            allowSplitAsAdd = false;
        }

        const value = node.operand.value;

        ++this.cost;

        const moveToNextSplit = (a: AstNode, b: AstNode, c: AstNode, type) => {
            const newLeftChildren =
                c === undefined ? [...leftChildren, a, b] : [...leftChildren, c];
            this.target.setChildren([...newLeftChildren, ...newRightChildren]);
            this.splits.push({
                splitFrom: node,
                splitTo: [a, b],
                splitType: type,
                splitToToken: this.tree.getTokenTree().flat(),
            });
            this.trySplit(newRightChildren, newLeftChildren, callback);
            this.splits.pop();
        };

        // 2. 尝试拆和，只有非除法的时候才拆两个和/差
        if (allowSplitAsAdd && node.operator.type !== OperatorType.DIV) {
            for (const v0 of this.splitSumCandidates[node.opUid]) {
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
                    b.operator = value > v ? Operator.createAdd() : Operator.createSub();

                    if (
                        node.operator.type === OperatorType.ADD ||
                        node.operator.type === OperatorType.SUB
                    ) {
                        if (node.operator.type === OperatorType.SUB) {
                            a.operator = a.operator.opposite;
                            b.operator = b.operator.opposite;
                        }
                        moveToNextSplit(a, b, undefined, SplitType.Sum);
                        if (value > v) {
                            moveToNextSplit(b, a, undefined, SplitType.Sum);
                        }
                    } else if (node.operator.type === OperatorType.MUL) {
                        const c = node.clone();
                        c.setChildren([a, b]);
                        c.infix = Operator.createAdd();
                        moveToNextSplit(a, b, c, SplitType.Sum);
                        if (value > v) {
                            c.setChildren([b, a]);
                            moveToNextSplit(a, b, c, SplitType.Sum);
                        }
                    }
                }
            }
        }

        // 2. 拆因子 fa * fb
        for (const fa of this.splitProductCandidates[node.opUid]) {
            if (value % fa === 0 && value !== fa && fa !== 1) {
                const fb = value / fa;

                const a = new AstNode();
                a.operand = new FiniteDecimal(fa);
                a.operator = Operator.createMul();

                const b = new AstNode();
                b.operand = new FiniteDecimal(fb);
                b.operand.floatLength = node.operand.floatLength;
                b.operator = Operator.createMul();

                if (
                    node.operator.type === OperatorType.ADD ||
                    node.operator.type === OperatorType.SUB
                ) {
                    const c = node.clone();
                    c.setChildren([a, b]);
                    c.infix = Operator.createMul();
                    moveToNextSplit(a, b, c, SplitType.Product);
                    if (fa !== fb) {
                        c.setChildren([b, a]);
                        moveToNextSplit(a, b, c, SplitType.Product);
                    }
                } else {
                    if (node.operator.type === OperatorType.DIV) {
                        a.operator = a.operator.opposite;
                        b.operator = b.operator.opposite;
                    }
                    moveToNextSplit(a, b, undefined, SplitType.Product);
                    if (fa !== fb) {
                        moveToNextSplit(b, a, undefined, SplitType.Product);
                    }
                }
            }
        }

        // 拆整数
        if (allowSplitAsAdd && node.operator.type !== OperatorType.DIV) {
            let one = 1;
            let val = value;
            while (val % 10 === 0) {
                one = one * 10;
                val = val / 10;
            }

            const next = (a: AstNode, b: AstNode) => {
                if (
                    node.operator.type === OperatorType.ADD ||
                    node.operator.type === OperatorType.SUB
                ) {
                    if (node.operator.type === OperatorType.SUB) {
                        a.operator = a.operator.opposite;
                        b.operator = b.operator.opposite;
                    }
                    moveToNextSplit(a, b, undefined, SplitType.AddOne);
                } else if (node.operator.type === OperatorType.MUL) {
                    const c = node.clone();
                    c.setChildren([a, b]);
                    c.infix = Operator.createAdd();
                    moveToNextSplit(a, b, c, SplitType.AddOne);
                }
            };

            if (val % 10 === 9 && value > 0) {
                const a = new AstNode();
                a.operand = new FiniteDecimal(value + one);
                a.operand.floatLength = node.operand.floatLength;
                a.operator = Operator.createAdd();

                const b = new AstNode();
                b.operand = new FiniteDecimal(one);
                b.operand.floatLength = node.operand.floatLength;
                b.operator = Operator.createSub();
                b.isAddOne = true;
                next(a, b);
            }

            if (val % 10 === 1 && value > one) {
                const a = new AstNode();
                a.operand = new FiniteDecimal(value - one);
                a.operand.floatLength = node.operand.floatLength;
                a.operator = Operator.createAdd();

                const b = new AstNode();
                b.operand = new FiniteDecimal(one);
                b.operand.floatLength = node.operand.floatLength;
                b.operator = Operator.createAdd();
                b.isAddOne = true;
                next(a, b);
            }
        }

        --this.cost;
    }

    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        this.cost = 0;
        this.target = node;
        this.splits = [];
        callback();
        if (node.children.length === 0) {
            // 非叶节点直接skip
            return;
        }

        this.targetToState = undefined;
        this.cost = 0;
        const childrenBackup = this.target.children;
        this.trySplit(node.children, [], callback);
        this.target.setChildren(childrenBackup);
        return;
    }
}
