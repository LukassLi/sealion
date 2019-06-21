// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode, MixedType } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { BinaryHeap } from '../BinaryHeap';
import { Scene, SceneType } from '../Animation/Scene';
import {
    AddParenthesisAnimation,
    ParenthesisDescription,
} from '../Animation/AddParenthesisAnimation';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { TokenType } from '../Token';
import { ExprFeatureSpeech, TransformSpeech, NumFeatureSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';
export class AddBracketAction extends TransformActionBase {
    public get transformDescription(): string {
        return '我们可以通过添加括号，来改变运算的顺序[p0]';
    }

    public get expressionFeature(): string {
        if (this.mixed === MixedType.AllAdd) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_ALLADD; // '首先注意到，它是一个连续加法运算[p300]';
        } else if (this.mixed === MixedType.AllSub) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_ALLSUB; // '首先注意到，它是一个连续减法运算[p300]';
        } else if (this.mixed === MixedType.AddSub) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_ADDSUB; // '首先注意到，它是加减混合的同级运算[p300]';
        } else if (this.mixed === MixedType.AllMul) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_ALLMUL; // '首先注意到，它是一个连续乘法运算[p300]';
        } else if (this.mixed === MixedType.AllDiv) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_ALLDIV; // '首先注意到，它是一个连续除法运算[p300]';
        } else if (this.mixed === MixedType.MulDiv) {
            return ExprFeatureSpeech.ADDBRACKET_HIGHLIGHT_MULDIV; // '首先注意到，它是乘除混合的同级运算[p300]';
        }
    }

    public get operandFeature1(): string {
        const numberFeatures = this.getNumberFeatures();
        if (numberFeatures.length > 0) {
            return numberFeatures[0];
        }
        return '';
    }

    public get operandFeature2(): string {
        const numberFeatures = this.getNumberFeatures();
        if (numberFeatures.length > 1) {
            return numberFeatures[1];
        }
        return '';
    }

    public newBrackets: AstNode[];

    public mixed: MixedType;

    public partitions: string;

    private numberFeatures: string[];

    constructor(targetFromState: AstNode, treeFromState: AstNode, heap: BinaryHeap<AstNode>) {
        super(targetFromState, treeFromState, heap);
        this.mixed = targetFromState.mixedType;
    }

    public explain(speechType: Operator): string {
        if (speechType.type === OperatorType.LEFT_BRACE) {
            return TransformSpeech.ADDBRACKET_ADDPARENTHESIS_NONE;
            // ['注意这里，括号前面什么都没有', '所以括号内的符号维持原状'];
        } else if (speechType.type === OperatorType.ADD) {
            return TransformSpeech.ADDBRACKET_ADDPARENTHESIS_ADD; // ['注意这里，括号前面是加号', '所以括号内的符号维持原状'];
        } else if (speechType.type === OperatorType.SUB) {
            return TransformSpeech.ADDBRACKET_ADDPARENTHESIS_SUB; // ['注意这里，括号前面是减号', '所以括号内每一项都需要变号'];
        } else if (speechType.type === OperatorType.MUL) {
            return TransformSpeech.ADDBRACKET_ADDPARENTHESIS_MUL; // ['注意这里，括号前面是乘号', '所以括号内的符号维持原状'];
        } else if (speechType.type === OperatorType.DIV) {
            return TransformSpeech.ADDBRACKET_ADDPARENTHESIS_DIV; // ['注意这里，括号前面是除号', '所以括号内每一项都需要变号'];
        }
        throw new Error('错误的符号');
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
        } else if (this.mixed === MixedType.AllMul) {
            highlight.text = '连续乘法';
        } else if (this.mixed === MixedType.AllDiv) {
            highlight.text = '连续除法';
        } else if (this.mixed === MixedType.MulDiv) {
            highlight.text = '乘除混合';
        }
        highlight.speech = this.expressionFeature;
        scene.animations.push(highlight);

        return [scene];
    }

    public getNumberFeatureBrackets(): AstNode[] {
        // return this.newBrackets;
        return this.newBrackets.filter(
            (x) => x.children.length >= 2 && x.children.some((x) => x.children.length > 0) === false
        );
    }

    public getNumberFeatureScenes(): Scene[] {
        const scenes = new Array<Scene>();

        const numberFeatureBrackets = this.getNumberFeatureBrackets();

        const tokensWithUid = this.treeInitialTokenNodeTree.flat();
        const uidToIdx: { [key: string]: number } = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        for (let i = 0; i < 2 && i < numberFeatureBrackets.length; ++i) {
            const scene = new Scene(SceneType.number_feature);
            const highlight = new HighLightAnimation();
            highlight.indexes = [
                numberFeatureBrackets[i].children[0].numUid,
                numberFeatureBrackets[i].children[1].numUid,
            ].map((x) => uidToIdx[x]);
            highlight.calc = numberFeatureBrackets[i].subTreeValue.valueString();
            highlight.speech = this.getNumberFeatures()[i];
            scene.animations.push(highlight);
            scenes.push(scene);
        }
        return scenes;
    }

    public getNumberFeatures(_: AstNode = null): string[] {
        if (this.numberFeatures === undefined) {
            this.numberFeatures = new Array<string>();
            for (const node of this.newBrackets) {
                const operand1 = node.children[0].subTreeValue;
                const operand2 = node.children[1].subTreeValue;
                const operator = node.children[1].operator;
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

                // TODO

                const speech = format(NumFeatureSpeech.ADDBRACKET_HIGHLIGHT, {
                    number1: operand1.valueString(),
                    operator: operator.doubleCharText,
                    number2: operand2.valueString(),
                    result,
                });
                this.numberFeatures.push(speech);
            }
        }
        return this.numberFeatures;
    }

    /**
     * 获取加括号的变换动画
     * @param transOrder 是第几个变换动画（从0开始编号）
     * @param isLast 是否是最后一个动画
     */
    public getTransformScenes(transOrder: number = 0, isLast: boolean = false): Scene[] {
        const scene = new Scene(SceneType.transform);
        const addParenthesis = new AddParenthesisAnimation();
        const tokensWithUid = this.treeToTokenNodeTree.flat();
        const uidToIdx = {};
        tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));
        addParenthesis.to_tokens = tokensWithUid.map((x) => x.token);
        let speechType : Operator = Operator.createLeftParenthesis(); // 挑一个最适合讲的括号用来配台词。优先级：变号、不变、开头
        for (const bracket of this.newBrackets) {
            if (bracket.children.length > 1) {
                const parenthesis: ParenthesisDescription = {
                    indexes: ['(', ')']
                        .map((x) => bracket.numUid + '_' + x)
                        .map((x) => uidToIdx[x]),
                    type: Operator.createLeftParenthesis(),
                };
                const sign = {
                    sign_before: uidToIdx[bracket.opUid],
                    sign_in: bracket.children.filter((x, i) => i > 0).map((x) => uidToIdx[x.opUid]),
                };
                if (
                    bracket.operator.type === (OperatorType.SUB) ||
                    bracket.operator.type === (OperatorType.DIV)
                ) {
                    parenthesis.change_sign = sign;
                    parenthesis.type = bracket.operator;
                    speechType = bracket.operator;
                } else {
                    parenthesis.no_change_sign = sign;
                    if (sign.sign_before !== undefined && speechType.type === OperatorType.LEFT_BRACE) {
                        speechType = bracket.operator;
                        parenthesis.type = bracket.operator;
                    }
                }
                addParenthesis.parenthesis.push(parenthesis);
            }
        }

        // 只保留优先级最高的动画
        addParenthesis.parenthesis.forEach((p) => {
            if (p.type.type !== speechType.type) {
                delete p.change_sign;
                delete p.no_change_sign;
            }
            delete p.type;
        });

        const explain = this.explain(speechType);
        if (transOrder === 0) {
            addParenthesis.speech = TransformSpeech.ADDBRACKET_ADDPARENTHESIS_TRANSORDER0 + explain;
            // '我们可以通过添加括号，来改变运算的顺序[p300]' + explain;// explain[0] + '[p300]' + explain[1];
        } else if (transOrder === 1) {
            addParenthesis.speech = TransformSpeech.ADDBRACKET_ADDPARENTHESIS_TRANSORDER1; // '我们再在算式中添加一下括号';
        } else {
            addParenthesis.speech = TransformSpeech.ADDBRACKET_ADDPARENTHESIS_TRANSORDERX; // '并添上括号';
        }
        if (isLast) {
            addParenthesis.speech += TransformSpeech.ADDBRACKET_ADDPARENTHESIS_LAST; // '，就能得到这样的算式。';
        }

        scene.animations.push(addParenthesis);
        scene.stop = false;

        return [scene];
    }

    /*
    递归枚举list的划分方法，采用从左往右扫描的方法
    callback - 对每一个划分方式partitions需要调用的方法
    k - 已经枚举了k个划分
    partitions - 已经枚举的方法
    current - 已经从左往右扫描到了current
  */
    public enumeratePartitions(
        list: AstNode[],
        callback: (partitions: AstNode[][]) => any,
        k: number = 0,
        partitions: AstNode[][] = new Array<AstNode[]>(),
        current: number = 0
    ) {
        if (current === list.length) {
            callback(partitions);
        }

        if (k === list.length) {
            return;
        }
        const partition = new Array<AstNode>();
        partitions.push(partition);
        for (let i = current; i < list.length; ++i) {
            partition.push(list[i]);
            this.enumeratePartitions(list, callback, k + 1, partitions, i + 1);
        }
        partitions.pop();
    }

    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        this.numberFeatures = undefined;
        callback();

        // 少于三项不用加括号
        if (node.children.length < 3) {
            return;
        }

        const nodeChildrenBackup = [...node.children];

        let addOneAtEnd = 0;
        for(let i = node.children.length - 1; i >= 0; --i) {
            if(node.children[i].isAddOne) {
                ++addOneAtEnd;
            } else {
                break;
            }
        }

        const notAddOnes = node.children.slice(0, node.children.length - addOneAtEnd);
        const addOnes = node.children.slice(node.children.length - addOneAtEnd);

        const partitionCallBack = (partitions: AstNode[][]) => {
            if (partitions.length === notAddOnes.length) {
                // 如果每个分组都只有一个节点，那么等于没有添加括号
                return;
            }

            if (partitions.length === 1) {
                return;
            }

            const allPartitions = [...partitions];

            if(addOnes.length > 0) {
                allPartitions.push(addOnes);
            }

            const groupedChildren = [];
            this.cost = 0;
            for (const partition of allPartitions) {
                if (
                    groupedChildren.length === 0 &&
                    (partition[0].operator.type === (OperatorType.SUB) ||
                        partition[0].operator.type === (OperatorType.DIV))
                ) {
                    // 首项的符号不能是减号或者除号
                    return;
                }

                if (
                    allPartitions.length > 2 &&
                    allPartitions[0].length === 1 &&
                    allPartitions[1].length === 1
                ) {
                    // 对于 a + b + ( ... ) + ...
                    // 我们总是要求 (a + b) + ( ... ) + ...
                    return;
                }

                if (partition.length === 1) {
                    // 如果该组只有一项，那么直接放入
                    partition[0].index = groupedChildren.length;
                    groupedChildren.push(partition[0]);
                } else {
                    ++this.cost;
                    const group = new AstNode();
                    if (
                        partition[0].operator.type === (OperatorType.DIV) ||
                        partition[0].operator.type === (OperatorType.SUB)
                    ) {
                        group.children = partition.map((x) => x.clone());
                        group.children.forEach((x) => (x.operator = x.operator.opposite));
                    } else {
                        group.children = partition;
                    }
                    group.infix = node.infix;
                    group.children.forEach((x, i) => (x.index = i));
                    group.operator = partition[0].operator;
                    group.index = groupedChildren.length;
                    groupedChildren.push(group);
                    group.height = node.height + 1;
                    // console.log("new group", group.getFlatTree());
                    // this.heap.push(group);
                }
            }
            node.children = groupedChildren;
            this.newBrackets = groupedChildren.filter((x) => x.children.length > 1);
            this.targetToState = node.clone();
            this.partitions = partitions
                .map((x) => '[' + x.map((x) => x.numUid).join(',') + ']')
                .join(',');
            callback();
            node.children = nodeChildrenBackup;
            node.children.forEach((x, i) => (x.index = i));
        };
        this.enumeratePartitions(notAddOnes, partitionCallBack);
        node.children = nodeChildrenBackup;
        node.children.forEach((x, i) => (x.index = i));
    }
}
