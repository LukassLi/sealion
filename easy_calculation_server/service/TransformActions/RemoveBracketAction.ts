// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { Scene, SceneType } from '../Animation/Scene';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { TokenType } from '../Token';
import { ParenthesisDescription } from '../Animation/AddParenthesisAnimation';
import { RemoveParenthesisAnimation } from '../Animation/RemoveParenthesisAnimation';
import { TransformSpeech, ExprFeatureSpeech, NumFeatureSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';

/* 25×(32×125) */
export class RemoveBracketAction extends TransformActionBase {
    public get transformDescription(): string {
        return '既然括号妨碍了这两个数进行计算，我们就把它去掉[p300]';
    }

    public get expressionFeature(): string {
        return ExprFeatureSpeech.REMOVEBRACKET_HIGHLIGHT; // '首先注意到，它是一个含括号的算式[p300]';
    }

    public get operandFeature1(): string {
        const numberFeatures = this.getNumberFeatures(this.targetToState);
        if (numberFeatures.length > 0) {
            return numberFeatures[0];
        }
        return '';
    }

    public get operandFeature2(): string {
        const numberFeatures = this.getNumberFeatures(this.targetToState);
        if (numberFeatures.length > 1) {
            return numberFeatures[1];
        }
        return '';
    }

    public unbracketGroup: AstNode[] = new Array<AstNode>();

    private numberFeatures: string[];

    public explain(speechType: Operator): string {
        if (speechType.type === OperatorType.LEFT_BRACE) {
            return TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_NONE; // ['注意这里，括号前面什么都没有', '所以括号内的符号维持原状。'];
        } else if (speechType.type === OperatorType.ADD) {
            return TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_ADD; // ['注意这里，括号前面是加号', '所以括号内的符号维持原状。'];
        } else if (speechType.type === OperatorType.SUB) {
            return TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_SUB; // ['注意这里，括号前面是减号', '所以括号内每一项都需要变号。'];
        } else if (speechType.type === OperatorType.MUL) {
            return TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_MUL; // ['注意这里，括号前面是乘号', '所以括号内的符号维持原状。'];
        } else if (speechType.type === OperatorType.DIV) {
            return TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_DIV; // ['注意这里，括号前面是除号', '所以括号内每一项都需要变号。'];
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
            .filter(
                (x) => x.type === TokenType.leftParenthesis || x.type === TokenType.rightParenthesis
            )
            .map((x) => uidToIdx[x.uid]);

        highlight.speech = this.expressionFeature;
        scene.animations.push(highlight);

        return [scene];
    }

    public getNumberFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.number_feature);

        const tokensWithUid = this.treeFromTokenNodeTree.flat();
        const uidToIdx = {};
        tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));

        const highlight = new HighLightAnimation();
        highlight.indexes = [
            this.targetToState.children[0].numUid,
            this.targetToState.children[1].opUid,
            this.targetToState.children[1].numUid,
        ]
            .map((x) => uidToIdx[x])
            .filter((x) => x !== undefined);
        highlight.calc = this.numberFeatureResult(this.targetToState);
        highlight.speech = this.operandFeature1;
        scene.animations.push(highlight);

        return [scene];
    }

    public numberFeatureResult(node: AstNode): string {
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
        return result;
    }

    public getNumberFeatures(node: AstNode): string[] {
        if (this.numberFeatures === undefined) {
            const operand1 = node.children[0].subTreeValue;
            const operand2 = node.children[1].subTreeValue;
            const operator = node.children[1].operator;
            const result = this.numberFeatureResult(node);

            //  [
            //     `这两个数[p0]${operand1.valueString()}[p0]如果${
            //         operator.doubleCharText
            //     }${operand2.valueString()}[p0]结果刚好是${result}[p300]`,
            // ];
            const speech = format(NumFeatureSpeech.REMOVEBRACKET_HIGHLIGHT, {
                number1: operand1.valueString(),
                operator: operator.doubleCharText,
                number2: operand2.valueString(),
                result,
            });
            this.numberFeatures = [speech];
        }
        return this.numberFeatures;
    }

    public getTransformScenes(): Scene[] {
        const scene = new Scene(SceneType.transform);
        const removeParenthesis = new RemoveParenthesisAnimation();
        const tokensWithUid = this.treeFromTokenNodeTree.flat();
        const uidToFromIdx = {};
        tokensWithUid.forEach((x, i) => (uidToFromIdx[x.uid] = i));

        removeParenthesis.to_tokens = this.treeToTokenNodeTree.flat().map((x) => x.token);
        let speechType : Operator = Operator.createLeftParenthesis(); // 挑一个最适合讲的括号用来配台词。优先级：变号、不变、开头
        for (const bracket of this.unbracketGroup) {
            if (bracket.children.length > 1) {
                const parenthesis: ParenthesisDescription = {
                    indexes: ['(', ')']
                        .map((x) => bracket.numUid + '_' + x)
                        .map((x) => uidToFromIdx[x]),
                    type: Operator.createLeftParenthesis(),
                };
                const sign = {
                    sign_before: uidToFromIdx[bracket.opUid],
                    sign_in: bracket.children
                        .filter((x, i) => i > 0)
                        .map((x) => uidToFromIdx[x.opUid]),
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
                removeParenthesis.parenthesis.push(parenthesis);
            }
        }

        // 只保留优先级最高的动画
        removeParenthesis.parenthesis.forEach((p) => {
            if (p.type.type !== speechType.type) {
                delete p.change_sign;
                delete p.no_change_sign;
            }
            delete p.type;
        });

        const explain = this.explain(speechType);

        // '既然括号妨碍了这两个数进行计算，我们就把它去掉[p300]' +
        // explain[0] +
        // '[p300]' +
        // explain[1];
        removeParenthesis.speech = TransformSpeech.REMOVEBRACKET_REMOVEPARENTHESIS_PRE + explain;
        scene.animations.push(removeParenthesis);
        scene.stop = false;
        return [scene];
    }

    // 移除当前节点的子节点对应的括号，将子节点提升到父节点
    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        this.numberFeatures = undefined;
        callback();

        if (node.children.length === 0) {
            return;
        }

        const nodeChildrenBackup = [...node.children];
        node.children = [];
        this.cost = 0;
        for (const child of nodeChildrenBackup) {
            if (child.children.length > 0 && child.infix.priority === child.operator.priority) {
                ++this.cost;
                this.unbracketGroup.push(child);
                for (const grandChild of child.children) {
                    const grandChildClone = grandChild.clone();
                    if (
                        child.operator.type === (OperatorType.DIV) ||
                        child.operator.type === (OperatorType.SUB)
                    ) {
                        grandChildClone.operator = grandChildClone.operator.opposite;
                    }
                    node.children.push(grandChildClone);
                }
            } else {
                node.children.push(child);
            }
        }
        node.children.forEach((x, i) => (x.index = i));
        if (this.cost > 0) {
            this.targetToState = node.clone();
            callback();
        }
        node.children = nodeChildrenBackup;
        node.children.forEach((x, i) => (x.index = i));
    }
}
