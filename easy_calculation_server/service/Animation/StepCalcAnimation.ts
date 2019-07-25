// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AnimationBase, AnimationType } from './AnimationBase';
import { AstNode } from '../AstNode';
import { TokenNode, TokenType } from '../Token';
import { Scene, SceneType } from './Scene';
import { Operator, OperatorType } from '../Operator';
import { FiniteDecimal } from '../Arithmetic/FiniteDecimal';
import { CalculationSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';

/*
{
    "type": "step_calc",  // 逐步计算
    "to_tokens": ["7.98", "-", "0.01", "×", "7.98"]
    "from_indexes": [0, 2], // 计算上一个式子中的0、2个token：1和7.98
    "to_index": 0 // 新式子中的第0个token是计算结果
}
*/

export class StepCalcAnimation extends AnimationBase {
    public get animationType(): AnimationType {
        return AnimationType.step_calc;
    }

    public static generateStepCalScene(tree: TokenNode): Scene[] {
        const scenes = new Array<Scene>();

        const temp = tree.clone();
        const queue = Array<TokenNode>();
        queue.push(temp);

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < queue.length; ++i) {
            const top = queue[i];
            for (let j = top.children.length - 1; j >= 0; j--) {
                queue.push(top.children[j]);
            }
        }

        const tokensWithUid = temp.flat();
        let uidToIdx: { [key: string]: number } = {};
        tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));

        for (let i = queue.length - 1; i >= 0; --i) {
            const node = queue[i];
            const childCount = node.children.length;
            if (i === 0 && childCount > 0) {
                // 根节点需要一步步算，而不是一次性算完
                // 根节点一定是同一级运算的，所以可以从左往右算完
                let lastValue = new FiniteDecimal(node.children[0].value);
                for (let j = 2; j < childCount; j += 2) {
                    const operand2 = new FiniteDecimal(node.children[j].value);
                    const operator = Operator.parse(node.children[j - 1].value);

                    const formulaText =
                        lastValue.valueString() +
                        '，' +
                        operator.doubleCharText +
                        operand2.valueString() +
                        '，';

                    if (operator.type === (OperatorType.ADD)) {
                        lastValue = lastValue.add(operand2);
                    } else if (operator.type === (OperatorType.SUB)) {
                        lastValue = lastValue.sub(operand2);
                    } else if (operator.type === (OperatorType.DIV)) {
                        lastValue = lastValue.div(operand2);
                    } else if (operator.type === (OperatorType.MUL)) {
                        lastValue = lastValue.mul(operand2);
                    } else {
                        throw new Error('invalid operator');
                    }

                    const scene = new Scene(SceneType.calculation);
                    const animation = new StepCalcAnimation();

                    animation.from_indexes = [0, 2];
                    animation.to_index = 0;

                    animation.formulaText = formulaText;
                    animation.resultText = lastValue.valueString();

                    animation.to_tokens = [lastValue.valueString()];
                    for (let k = j + 1; k < childCount; k++) {
                        animation.to_tokens.push(node.children[k].value);
                    }

                    scene.animations.push(animation);
                    scenes.push(scene);
                }
            } else if (childCount > 0) {
                const scene = new Scene(SceneType.calculation);
                const animation = new StepCalcAnimation();
                scene.animations.push(animation);
                animation.from_indexes = node.children
                    .filter((x) => x.type === TokenType.number)
                    .map((x) => uidToIdx[x.uid]);

                const formulaText = node.children
                    .map((x) => {
                        switch (x.type) {
                            case TokenType.leftParenthesis:
                            case TokenType.rightParenthesis:
                                return '';
                            case TokenType.number:
                                return x.value + '，';
                            case TokenType.operator:
                                return Operator.parse(x.value).doubleCharText;
                        }
                    })
                    .join('');
                const resultText = node.value;
                animation.formulaText = formulaText;
                animation.resultText = resultText;

                node.children = [];
                const tokensWithUid = temp.flat();
                uidToIdx = {};
                tokensWithUid.forEach((x, i) => (uidToIdx[x.uid] = i));

                animation.to_index = uidToIdx[node.uid];
                animation.to_tokens = tokensWithUid.map((x) => x.token);

                // 分配律的树会有 v -> v 这样的子树，需要跳过
                if (childCount > 1) {
                    scenes.push(scene);
                }
            }
        }

        for (let i = 0; i < scenes.length; i++) {
            const animation = scenes[i].animations[0] as StepCalcAnimation;
            const formulaText = animation.formulaText;
            const resultText = animation.resultText;

            if (i === 0) {
                // `我们先计算${formulaText}答案是${resultText}`;
                animation.speech = format(CalculationSpeech.STEPCALC_START, {
                    formula: formulaText,
                    result: resultText,
                });
            } else if (i === 1) {
                if (scenes.length === 2) {
                    // 结束状态
                    // `再计算${formulaText}就求出来答案是${resultText}`;
                    animation.speech = format(CalculationSpeech.STEPCALC_FINAL1, {
                        formula: formulaText,
                        result: resultText,
                    });
                } else {
                    // 中间状态
                    // `再计算${formulaText}求出来是${resultText}`;
                    animation.speech = format(CalculationSpeech.STEPCALC_MIDDLE, {
                        formula: formulaText,
                        result:resultText,
                    });
                }
            } else {
                // `最后求得，答案是${resultText}`;
                animation.speech = format(CalculationSpeech.STEPCALC_FINAL2,{result:resultText}); 
            }
        }

        // 计算最多只有三步，超过三步的计算要合并
        if (scenes.length > 3) {
            const targetScene = scenes[2];
            const targetAnimation = targetScene.animations[0] as StepCalcAnimation; // 实际最后一个动画

            const lastScene = scenes[scenes.length - 1];
            const lastAnimation = lastScene.animations[0] as StepCalcAnimation; // 默认算法最后一个动画

            const scene2Animation = scenes[1].animations[0] as StepCalcAnimation; // 场景2的动画

            targetAnimation.to_index = 0;
            targetAnimation.to_tokens = lastAnimation.to_tokens;
            targetAnimation.from_indexes = [0, scene2Animation.to_tokens.length - 1];
            targetAnimation.speech = lastAnimation.speech;
            return scenes.slice(0, 3);
        }
        return scenes;
    }

    public to_tokens: string[];

    public from_indexes: number[];

    public to_index: number;

    public resultText: string;
    public formulaText: string;

    public toJson(): any {
        return {
            type: this.type,
            to_tokens: this.to_tokens,
            from_indexes: this.from_indexes,
            to_index: this.to_index,
            speech: this.speech,
        };
    }
}
