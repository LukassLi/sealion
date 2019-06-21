// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { Scene, SceneType } from '../Animation/Scene';
import { Operator, OperatorType } from '../Operator';
import { TokenNode, TokenType } from '../Token';
import { TransformActionBase } from '../TransformActions/TransformActionBase';
import { AddTokensAnimation } from '../Animation/AddTokensAnimation';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { StartExplainAnimation } from '../Animation/StartExplainAnimation';
import { MagnifierAnimation } from '../Animation/MagnifierAnimation';
import { AnimationBase } from '../Animation/AnimationBase';
import { StepCalcAnimation } from '../Animation/StepCalcAnimation';
import { WaitCalcAnimation } from '../Animation/WaitCalcAnimation';
import { QuestionAnimation } from '../Animation/QuestionAnimation';
import { FinishAnimation } from '../Animation/FinishAnimation';
import { OpeningSpeech } from '../SpeechConfig';

/** 巧算模式--运算模式 */
export abstract class QiaoSuanPattern {
    public abstract get name(): string;

    // 第一步算式
    public abstract get firstExpression(): string;

    // 输入算式
    public inputExpression: string = '<inputExpression>';

    // 最终算式
    public finalExpression: string = '<finalExpression>';

    public inputTokenNodeTree: TokenNode;

    public abstract match(steps: TransformActionBase[]): boolean;
    public abstract getExpressionFeatureScenes(): Scene[];
    public abstract getNumberFeatureScenes(): Scene[];
    public abstract getTransformScenes(): Scene[];
    public abstract finalTokenNodeTree(): TokenNode;

    public toString() {
        return (
            [this.name, this.inputExpression, this.firstExpression, this.finalExpression].join(
                '\n'
            ) + '\n'
        );
    }

    public getJson() {
        return {
            name: this.name,
            inputExpression: this.inputExpression,
            firstExpression: this.firstExpression,
            finalExpression: this.finalExpression,
        };
    }

    /** 生成一系列场景（一整个流程） */
    public getScenes(): Scene[] {
        const scenes = new Array<Scene>();
        const open = new Scene(SceneType.opening);
        const addTokens = new AddTokensAnimation();
        addTokens.value = this.inputTokenNodeTree.flat().map((x) => x.token);
        open.animations.push(addTokens);
        open.stop = true;
        scenes.push(open);

        const explain = new Scene(SceneType.opening);
        const startExplain = new StartExplainAnimation();
        startExplain.speech = OpeningSpeech.STARTEXPLAIN; // '这题，我们计算的是';
        explain.animations.push(startExplain);
        explain.stop = false;
        scenes.push(explain);

        for (let i = 0, tokenNodes = this.inputTokenNodeTree.flat(); i < tokenNodes.length; ++i) {
            const tokenNode = tokenNodes[i];

            const readInput = new Scene(SceneType.opening);
            const frame = new HighLightAnimation();

            readInput.animations.push(frame);
            if (tokenNode.type === TokenType.number) {
                frame.indexes = [i];
                frame.speech = tokenNode.token;
            } else if (
                tokenNode.type === TokenType.leftParenthesis ||
                tokenNode.type === TokenType.rightParenthesis
            ) {
                frame.indexes = [i];
                frame.speech = Operator.parse(tokenNode.token).singleCharText;
            } else if (tokenNode.type === TokenType.operator) {
                if (i + 1 < tokenNodes.length && tokenNodes[i + 1].type === TokenType.number) {
                    // 紧接着的如果是数，那么需要把数和运算符组合在一起
                    frame.indexes = [i, i + 1];
                    frame.speech =
                        Operator.parse(tokenNode.token).singleCharText + tokenNodes[i + 1].token;
                    ++i;
                } else {
                    // 否则运算符单独作为一个场景
                    frame.indexes = [i];
                    frame.speech = Operator.parse(tokenNode.token).singleCharText;
                }
            }
            readInput.stop = false;
            scenes.push(readInput);
        }

        // 入场放大镜
        const magnifier = new Scene(SceneType.opening);
        magnifier.animations.push(new MagnifierAnimation());
        scenes.push(magnifier);

        const expressionFeatures = this.getExpressionFeatureScenes();
        scenes.push(...expressionFeatures);

        const numberFeatures = this.getNumberFeatureScenes();
        scenes.push(...numberFeatures);

        // 算式特征和数字特征都有的话，中间加个连词
        if (numberFeatures.length > 0 && expressionFeatures.length > 0) {
            const animation = numberFeatures[0].animations[0];
            animation.speech = '并且，' + animation.speech;
        }

        // 多个数字特征之间加连词
        if (numberFeatures.length > 1) {
            const animation = numberFeatures[1].animations[0];
            animation.speech = '而' + animation.speech;
        }

        scenes.push(QuestionAnimation.generateScence());

        scenes.push(...this.getTransformScenes());

        scenes.push(WaitCalcAnimation.generateScence());

        scenes.push(...StepCalcAnimation.generateStepCalScene(this.finalTokenNodeTree()));

        scenes.push(FinishAnimation.generateScence());

        scenes.forEach((x, i) => (x.id = i));
        return scenes;
    }
}
