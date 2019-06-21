// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode, MixedType } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { PermutationUtil } from '../PermutationUtil';
import { BinaryHeap } from '../BinaryHeap';
import { Scene, SceneType } from '../Animation/Scene';
import { MoveAnimation } from '../Animation/MoveAnimation';
import { TokenType, TokenNode } from '../Token';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { ExplainAnimation } from '../Animation/ExplainAnimation';
import { ExprFeatureSpeech, TransformSpeech, NumFeatureSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';

/** 随机 */
export class ShuffleAction extends TransformActionBase {
    public get operandFeature1(): string {
        const startPos = 0;

        const child1 = this.targetToState.children[startPos];
        const child2 = this.targetToState.children[startPos + 1];

        const operand1 = child1.subTreeValue;
        const operator = child2.operator;
        const operand2 = child2.subTreeValue;

        let result = '';
        if (operator.type === (OperatorType.ADD)) {
            result = operand1.add(operand2).valueString();
        } else if (operator.type === (OperatorType.SUB)) {
            result = operand1.sub(operand2).valueString();
        } else if (operator.type === (OperatorType.DIV)) {
            result = operand1.div(operand2).valueString();
        } else if (operator.type === (OperatorType.MUL)) {
            result = operand1.mul(operand2).valueString();
        } else {
            throw new Error('invalid operator');
        }

        this.finalTokenNodeTree = this.treeToTokenNodeTree;

        const mergedOneAndTwo = new TokenNode(
            result,
            TokenType.number,
            child1.numUid + '_' + child2.numUid
        );

        mergedOneAndTwo.children.push(
            new TokenNode(operand1.valueString(), TokenType.number, child1.numUid),
            new TokenNode(child2.operator.mark, TokenType.operator, child2.opUid),
            new TokenNode(operand2.valueString(), TokenType.number, child2.numUid)
        );

        this.finalTokenNodeTree.children = [
            mergedOneAndTwo,
            ...this.treeToTokenNodeTree.children.slice(3),
        ];

        // `这两个数[p0]${operand1.valueString()}[p0]如果${
        //     operator.doubleCharText
        // }${operand2.valueString()}[p0]结果刚好是${result}[p300]`;
        const speech = format(NumFeatureSpeech.SHUFFLE_HIGHLIGHT, {
            number1: operand1.valueString(),
            operator: operator.doubleCharText,
            number2: operand2.valueString(),
            result,
        });
        return speech;
    }

    public get expressionFeature(): string {
        if (this.mixed === MixedType.AllAdd) {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_ALLADD; // '首先注意到，它是一个连续加法运算[p300]';
        } else if (this.mixed === MixedType.AllSub) {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_ALLSUB; // '首先注意到，它是一个连续减法运算[p300]';
        } else if (this.mixed === MixedType.AddSub) {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_ADDSUB; // '首先注意到，它是加减混合的同级运算[p300]';
        } else if (this.mixed === MixedType.AllDiv) {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_ALLDIV; // '首先注意到，它是一个连续除法运算[p300]';
        } else if (this.mixed === MixedType.AllMul) {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_ALLMUL; // '首先注意到，它是一个连续乘法运算[p300]';
        } else {
            return ExprFeatureSpeech.SHUFFLE_HIGHLIGHT_MULDIV; // '首先注意到，它是乘除混合的同级运算[p300]';
        }
    }

    public get explain(): string[] {
        if (this.mixed === MixedType.AllAdd) {
            return ['连续加法运算', '先加后加没有区别'];
        } else if (this.mixed === MixedType.AllSub) {
            return ['连续减法运算', '先减后减没有区别'];
        } else if (this.mixed === MixedType.AddSub) {
            return ['加减法同级运算', '先加减后加减没有区别'];
        }
        if (this.mixed === MixedType.AllMul) {
            return ['连续乘法运算', '先乘后乘没有区别'];
        } else if (this.mixed === MixedType.AllDiv) {
            return ['连续除法运算', '先除后除没有区别'];
        } else if (this.mixed === MixedType.MulDiv) {
            return ['乘除法同级运算', '先乘除后乘除没有区别'];
        }
    }

    public get explainSpeech(): string {
        if (this.mixed === MixedType.AllAdd) {
            return TransformSpeech.SHUFFLE_EXPLAIN_ALLADD; // '因为连续加法运算时，先加[p0]还是后加[p0]没有区别。这两个算式的结果是一样的';
        } else if (this.mixed === MixedType.AllSub) {
            return TransformSpeech.SHUFFLE_EXPLAIN_ALLSUB; // '因为连续减法运算时，先减[p0]还是后减[p0]没有区别。这两个算式的结果是一样的';
        } else if (this.mixed === MixedType.AddSub) {
            return TransformSpeech.SHUFFLE_EXPLAIN_ADDSUB; // '因为加减法同级运算时，先加减[p0]还是后加减[p0]没有区别。这两个算式的结果是一样的';
        } else if (this.mixed === MixedType.AllMul) {
            return TransformSpeech.SHUFFLE_EXPLAIN_ALLMUL; // '因为连续乘法运算时，先乘[p0]还是后乘[p0]没有区别。这两个算式的结果是一样的';
        } else if (this.mixed === MixedType.AllDiv) {
            return TransformSpeech.SHUFFLE_EXPLAIN_ALLDIV; // '因为连续除法运算时，先除[p0]还是后除[p0]没有区别。这两个算式的结果是一样的';
        } else if (this.mixed === MixedType.MulDiv) {
            return TransformSpeech.SHUFFLE_EXPLAIN_MULDIV; // '因为乘除法同级运算时，先乘除[p0]还是后乘除[p0]没有区别。这两个算式的结果是一样的';
        }
    }

    public get transformDescription(): string {
        return '我们可以带着符号搬家[p0]';
    }

    public get feature1Result(): string {
        const operator = this.targetToState.children[1].operator;
        const val1 = this.targetToState.children[0].subTreeValue;
        const val2 = this.targetToState.children[1].subTreeValue;
        let result;
        if (operator.type === (OperatorType.ADD)) {
            result = val1.add(val2);
        } else if (operator.type === (OperatorType.SUB)) {
            result = val1.sub(val2);
        } else if (operator.type === (OperatorType.MUL)) {
            result = val1.mul(val2);
        } else if (operator.type === (OperatorType.DIV)) {
            result = val1.div(val2);
        } else {
            throw new Error('invalid operator');
        }
        return result.valueString();
    }
    // All
    public mixed: MixedType;

    public indexList: number[];
    private finalTokenNodeTree: TokenNode;

    constructor(targetFromState: AstNode, treeFromState: AstNode, heap: BinaryHeap<AstNode>) {
        super(targetFromState, treeFromState, heap);
        this.mixed = targetFromState.mixedType;
    }

    public getFinalTokenNodeTree(): TokenNode {
        return this.finalTokenNodeTree;
    }

    public getNumberFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.number_feature);

        const tokensWithUid = this.treeInitialTokenNodeTree.flat();
        const uidToIdx = {};
        tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));

        const highlight = new HighLightAnimation();

        const startPos = 0;

        highlight.indexes = [
            this.targetToState.children[startPos].numUid,
            this.targetToState.children[startPos + 1].numUid,
        ].map((x) => uidToIdx[x]);
        highlight.calc = this.feature1Result;

        // TODO:似乎可以考虑根据highlight来生成speech，这样可以更统一
        highlight.speech = this.operandFeature1;
        scene.animations.push(highlight);

        return [scene];
    }

    public getExpressionFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.expression_feature);

        const highlight = new HighLightAnimation();

        const tokensWithUid = this.treeFromTokenNodeTree.flat();
        const uidToIdx = {};
        tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));

        // 高亮加减号
        highlight.indexes = tokensWithUid
            .filter((x) => x.type === TokenType.operator)
            .map((x) => uidToIdx[x.uid]);
        if (this.mixed === MixedType.AllSub) {
            highlight.text = '连续减法';
        } else if (this.mixed === MixedType.AddSub) {
            highlight.text = '加减混合';
        } else if (this.mixed === MixedType.AllAdd) {
            highlight.text = '连续加法';
        }
        if (this.mixed === MixedType.AllAdd) {
            highlight.text = '连续加法';
        } else if (this.mixed === MixedType.MulDiv) {
            highlight.text = '乘除混合';
        } else if (this.mixed === MixedType.AllDiv) {
            highlight.text = '连续除法';
        }
        highlight.speech = this.expressionFeature;
        scene.animations.push(highlight);

        return [scene];
    }

    /**
     * 获取带符号搬家的变换动画
     * @param transOrder 是第几个变换动画（从0开始编号）
     * @param isLast 是否是最后一个动画
     */
    public getTransformScenes(transOrder: number = 0, isLast: boolean = false): Scene[] {
        const scene = new Scene(SceneType.transform);

        const move = new MoveAnimation();

        const uidToFromIdx: { [key: string]: number } = this.treeFromTokenNodeTree
            .flat()
            .reduce((l, x, i) => {
                l[x.uid] = i;
                return l;
            }, {});

        const tokensWithUid = this.treeToTokenNodeTree.flat();
        const uidToIdx: { [key: string]: number } = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});
        move.to_tokens = tokensWithUid.map((x) => x.token);

        for (let i = 0; i < this.indexList.length; ++i) {
            if (this.indexList[i] === i) {
                continue;
            }

            const numWithOp = [
                this.targetToState.children[i].opUid,
                ...this.targetToState.children[i]
                    .getTokenTree()
                    .flat()
                    .map((x) => x.uid),
            ];

            const move_index = {
                from: numWithOp.map((x) => uidToFromIdx[x]),
                to: numWithOp.map((x) => uidToIdx[x]),
            };

            move.move_indexes.push(move_index);
        }

        if (transOrder === 0) {
            move.speech = TransformSpeech.SHUFFLE_MOVE_TRANSORDER0; // '我们可以带着符号搬家，将算式写成这样';
        } else {
            move.speech = TransformSpeech.SHUFFLE_MOVE_TRANSORDERX; // '我们再带着符号搬家';
            if (isLast) {
                move.speech += TransformSpeech.SHUFFLE_MOVE_LAST; // '，就能得到这样的算式。';
            }
        }

        scene.animations.push(move);

        const explainScene = new Scene(SceneType.transform);
        const explainAnimation = new ExplainAnimation();
        explainAnimation.highlight_indexes = [];
        explainAnimation.text = this.explain;

        explainAnimation.speech = this.explainSpeech;
        explainScene.animations.push(explainAnimation);
        explainScene.stop = true;

        return [scene, explainScene];
    }

    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        callback();
        if (node.children.length < 3) {
            // 子节点不够3个，不需要带符号搬家
            return;
        }
        const nodeChildrenBackup = [...node.children];
        const permIndexList = nodeChildrenBackup
            .map((x, i) => {
                return { isAddOne: x.isAddOne, idx: i };
            })
            .filter((x) => !x.isAddOne)
            .map((x) => x.idx);
        const addOneIndexList = nodeChildrenBackup
            .map((x, i) => {
                return { isAddOne: x.isAddOne, idx: i };
            })
            .filter((x) => x.isAddOne)
            .map((x) => x.idx);
        while (PermutationUtil.getNext(permIndexList)) {
            if (permIndexList[0] !== 0) {
                // 首项不搬家
                continue;
            }

            const indexList = [];
            indexList.push(...permIndexList, ...addOneIndexList);

            node.children = indexList.map((x) => nodeChildrenBackup[x]);
            node.children.forEach((x, i) => (x.index = i));
            if (
                node.children[0].operator.type === (OperatorType.DIV) === false &&
                node.children[0].operator !== Operator.createSub()
            ) {
                this.indexList = indexList;
                // 首项不得为减号或者除号
                this.targetToState = node.clone();
                // 错位和
                this.cost = indexList.reduce((l, x, i) => l + Math.abs(x - i), 0);
                callback();
            }
        }
        node.children = nodeChildrenBackup;
        node.children.forEach((x, i) => (x.index = i));
    }
}
