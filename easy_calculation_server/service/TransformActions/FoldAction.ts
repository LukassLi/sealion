// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { TransformActionBase } from './TransformActionBase';
import { AstNode, MixedType } from '../AstNode';
import { Operator, OperatorType } from '../Operator';
import { FiniteDecimal } from '../Arithmetic/FiniteDecimal';
import { Scene, SceneType } from '../Animation/Scene';
import { HighLightAnimation } from '../Animation/HighLightAnimation';
import { DistributiveCombineAnimation } from '../Animation/DistributiveCombineAnimation';
import { SplitNumberAnimation } from '../Animation/SplitNumberAnimation';
import { TokenNode, TokenType } from '../Token';
import { on } from 'cluster';
import { ExplainAnimation } from '../Animation/ExplainAnimation';
import { ArithmeticUtil } from '../ArithmeticUtil';
import { NumFeatureSpeech, ExprFeatureSpeech, TransformSpeech } from '../SpeechConfig';
import { format } from '../util/Utils';
import { Logger } from '../../log/logger';

/*35×52+21×35+35×127*/
export class FoldAction extends TransformActionBase {
    /**
     * 公因数在原式中的坐标
     */
    public get commonFactIndexes(): number[] {
        const tokensWithUid = this.treeFromTokenNodeTree.flat();

        const uidToIdx: { [key: string]: number } = tokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        return this.targetFromState.children
            .reduce((l, x, i) => {
                if (this.commonFactMatchIndices[i] === -1) {
                    l.push(x.numUid);
                } else {
                    l.push(
                        ...x.children
                            .filter((_, j) => j === this.commonFactMatchIndices[i])
                            .map((x) => x.numUid)
                    );
                }
                return l;
            }, [])
            .map((x) => uidToIdx[x.toString()]);
    }

    public get uidToToIdx(): { [key: string]: number } {
        const toTokensWithUid = this.treeToTokenNodeTree.flat();
        return toTokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});
    }

    public get uidToFromIdx(): { [key: string]: number } {
        const fromTokensWithUid = this.treeFromTokenNodeTree.flat();
        return fromTokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});
    }

    // 因为存在需要 a*b + a这种形式，所以我们用intermediate state来表示a*b + a*1
    public treeSplitState: string;
    public targetSplitState: AstNode = undefined;

    public commonFact: AstNode;

    public otherFact: AstNode;

    private commonFactMatchIndices: number[] = [];

    private splitItems: Array<{ opUid: string; numUid: string; fromUid: string }>;

    public getCommonFactScene(): Scene {
        const scene = new Scene(SceneType.number_feature);
        const highlight = new HighLightAnimation();
        highlight.indexes = this.commonFactIndexes;
        highlight.text = '相同的数';

        // `每一个部分[p0]都刚好含有${this.commonFact.subTreeValue.valueString()}`;
        highlight.speech = format(NumFeatureSpeech.FOLD_HIGHLIGHT_COMMONFACT, {
            value: this.commonFact.subTreeValue.valueString(),
        });
        scene.animations.push(highlight);
        scene.stop = false;
        return scene;
    }

    public getOtherFactScene(): Scene | undefined {
        const tokensWithUid = this.treeFromTokenNodeTree.flat();
        const uidToIdx = this.uidToFromIdx;

        const scene = new Scene(SceneType.number_feature);
        const highlight = new HighLightAnimation();
        highlight.indexes = this.targetFromState.children
            .reduce((l, x, i) => {
                l.push(
                    ...x.children
                        .filter((_, j) => j !== this.commonFactMatchIndices[i])
                        .map((x) => x.numUid)
                );
                return l;
            }, [])
            .map((x) => uidToIdx[x.toString()]);
        highlight.calc = this.otherFact.subTreeValue.valueString();

        const moveIndexes = this.getMoveIndexes(this.uidToFromIdx, this.uidToToIdx);

        // 脑补 1 的需要去掉，不讲结果刚好是 xxx
        if (highlight.indexes.length * 2 - 1 !== moveIndexes.length) {
            return undefined;
        }

        const targetOfParenthesis = this.otherFact.subTreeValue; // 括号里的计算结果
        const valuesInParenthesis: FiniteDecimal[] = []; // 参与计算的数字
        // const oprsInParenthesis:Operator[] = []; // 参与计算的符号

        for (let i = 0; i < moveIndexes.length; i += 2) {
            valuesInParenthesis.push(new FiniteDecimal(tokensWithUid[moveIndexes[i][0]].token));
        }

        // console.log('fold_action--logMoveTokens--start');
        // for (let i = 0; i < moveIndexes.length; i ++) {
        //     console.log(tokensWithUid[moveIndexes[i][0]].token);
        //     // valuesInParenthesis.push(new FiniteDecimal(tokensWithUid[moveIndexes[i][0]].token));
        // }
        // console.log('fold_action--logMoveTokens--end');

        // 不能叫做“正好”
        if (!ArithmeticUtil.isExactly(valuesInParenthesis, Operator.createAdd(), targetOfParenthesis)) {
            return undefined;
        }
        let formula = tokensWithUid[moveIndexes[0][0]].token + '，';
        for (let i = 2; i < moveIndexes.length; i += 2) {
            const op = Operator.parse(tokensWithUid[moveIndexes[i - 1][0]].token);
            const num = tokensWithUid[moveIndexes[i][0]].token;
            if (i === 2) {
                formula += '如果';
            } else {
                formula += '再';
            }
            formula += op.doubleCharText + num + '，';
        }

        //  `这${highlight.indexes.length}个数[p0]${formula}结果刚好是${
        //     highlight.calc
        // }`;
        highlight.speech = format(NumFeatureSpeech.FOLD_HIGHLIGHT_OTHERFACT, {
            count: highlight.indexes.length.toString(),
            formula,
            result: highlight.calc,
        });
        scene.animations.push(highlight);
        scene.stop = false;
        return scene;
    }

    public getNumberFeatureScenes(): Scene[] {
        const scenes = new Array<Scene>();
        Logger.logInfo('fold_action_number_feature');

        const commonFact = this.getCommonFactScene();
        scenes.push(commonFact);

        const otherFact = this.getOtherFactScene();
        if (otherFact !== undefined) {
            scenes.push(otherFact);
        }

        return scenes;
    }

    public addOrSubType(): string {
        return [Operator.createAdd(), Operator.createSub()]
            .filter((op) =>
                this.targetFromState.children.slice(1).some((x) => x.operator.type === op.type)
            )
            .map((x) => x.singleCharText)
            .join('');
    }

    public getExpressionFeature(node: AstNode): string {
        // `它由这${node.children.length}个部分相${this.addOrSubType()}组成[p300]`;
        return format(ExprFeatureSpeech.FOLD_HIGHLIGHT, {
            count: node.children.length.toString(),
            operator: this.addOrSubType(),
        });
    }

    public getExpressionFeatureScenes(): Scene[] {
        const scene = new Scene(SceneType.expression_feature);
        const uidToIdx = this.uidToFromIdx;

        for (const child of this.targetFromState.children) {
            const highlight = new HighLightAnimation();
            if (child.children.length === 0) {
                // 没有子节点，因为脑补了1
                highlight.indexes = [uidToIdx[child.numUid]];
            } else {
                // 一般情况，需要展示子节点
                highlight.indexes = child.children.reduce((l, x, i) => {
                    if (i > 0) {
                        l.push(uidToIdx[x.opUid]);
                    }
                    l.push(uidToIdx[x.numUid]);
                    return l;
                }, []);
            }
            scene.animations.push(highlight);
        }

        for (let i = 1; i < this.targetFromState.children.length; i++) {
            const x = this.targetFromState.children[i];
            const highlight = new HighLightAnimation();
            highlight.indexes = [uidToIdx[x.opUid]];
            scene.animations.push(highlight);
        }

        // 计算符号需要单独一个highlight元素
        if (scene.animations.length > 0) {
            const animations = scene.animations;
            const speech = this.getExpressionFeature(this.targetFromState);
            animations[animations.length - 1].speech = speech;
        }

        scene.stop = false;
        return [scene];
    }

    /**
     * 要移动的（括号内的）那些元素的前后 index
     */
    public getMoveIndexes(
        uidToFromIdx: { [key: string]: number },
        uidToIdx: { [key: string]: number }
    ) {
        return this.otherFact.children.reduce((l, x, i) => {
            if (i > 0) {
                l.push([uidToFromIdx[x.opUid], uidToIdx[x.opUid]]);
            }
            const grandChildrenMove = x.children.reduce((l, y, i) => {
                l.push([uidToFromIdx[y.numUid], uidToIdx[y.numUid]]);
                return l;
            }, new Array<number[]>());
            l.push(...grandChildrenMove);
            return l;
        }, new Array<number[]>());
    }

    /**
     * 如果有 脑补*1，则加上这部分动画，并且修改token id
     * @param uidToFromIdx token id 映射
     */
    public getSplitScenes(uidToFromIdx: {
        [key: string]: number;
    }): { scenes: Scene[]; uidToFromIdx: { [key: string]: number } } {
        const scenes = new Array<Scene>();
        if (this.splitItems.length === 0) {
            return { scenes, uidToFromIdx };
        }

        // 脑补 1 的动画
        const scene = new Scene(SceneType.transform);
        const split = new SplitNumberAnimation();
        const fromTokensWithUid = this.treeFromTokenNodeTree.flat();
        const token = this.treeToTokenNodeTree.flat();
        const splitItem = this.splitItems[0]; // 假设只有一个

        const splitIdPos = fromTokensWithUid.findIndex((x) => x.uid === splitItem.fromUid);
        fromTokensWithUid.splice(
            splitIdPos + 1,
            0,
            { token: Operator.createMul().mark, uid: splitItem.opUid, type: TokenType.operator },
            { token: '1', uid: splitItem.numUid, type: TokenType.number }
        );

        // split.debug = [fromTokensWithUid, splitItem];

        split.to_tokens = fromTokensWithUid.map((x) => x.token);
        split.from_index = splitIdPos;
        split.to_indexes = [splitIdPos, splitIdPos + 1, splitIdPos + 2];
        split.highlight_indexes = [splitIdPos + 1, splitIdPos + 2];

        const splitToken = fromTokensWithUid.find((x) => x.uid === splitItem.fromUid).token;

        // `我们可以把${splitToken}看作${splitToken}乘以1，将算式写成这样`;
        split.speech = format(TransformSpeech.FOLD_SPLITNUMBER, {
            number1: splitToken,
            number2: splitToken,
        });
        scene.animations.push(split);
        scenes.push(scene);
        uidToFromIdx = fromTokensWithUid.reduce((l, x, i) => {
            l[x.uid] = i;
            return l;
        }, {});

        // 解释动画
        const explainScene = new Scene(SceneType.transform);
        const explainAnimation = new ExplainAnimation();

        // '当然，这么做不会改变算式的结果。那么，又有什么好处呢？';
        explainAnimation.speech = TransformSpeech.FOLD_EXPLAIN;
        explainScene.animations.push(explainAnimation);
        explainScene.stop = true;
        scenes.push(explainScene);

        return { scenes, uidToFromIdx };
    }

    public getTransformScenes(): Scene[] {
        const scenes = new Array<Scene>();

        let uidToFromIdx = this.uidToFromIdx;

        // 脑补 1 的动画
        const splitResult = this.getSplitScenes(uidToFromIdx);
        scenes.push(...splitResult.scenes);
        uidToFromIdx = splitResult.uidToFromIdx;

        // 分配律的动画
        const scene = new Scene(SceneType.transform);
        const fold = new DistributiveCombineAnimation();

        const tokensWithUid = this.treeToTokenNodeTree.flat();
        const uidToIdx = this.uidToToIdx;

        // fold.debug = uidToFromIdx;

        fold.to_tokens = tokensWithUid.map((x) => x.token);
        fold.from_indexes = this.commonFactIndexes;
        fold.to_index = uidToIdx[this.commonFact.numUid];
        fold.move_indexes = this.getMoveIndexes(uidToFromIdx, this.uidToToIdx);

        if (scenes.length === 0) {
            // '根据乘法分配律，我们可以将算式写成这样';
            fold.speech = TransformSpeech.FOLD_DISTRIBUTIVECOMBINE_LENGTH0;
        } else {
            // '根据乘法分配律，我们可以得到这样的算式';
            fold.speech = TransformSpeech.FOLD_DISTRIBUTIVECOMBINE_LENGTHX;
        }
        scene.animations.push(fold);

        scenes.push(scene);
        return scenes;
    }

    // TODO
    public runAction(node: AstNode, callback: () => any) {
        this.targetToState = undefined;
        callback();
        if (
            node.infix === undefined ||
            (node.infix.type !== OperatorType.SUB && node.infix.type !== OperatorType.ADD)
        ) {
            return;
        }
        for (const child of node.children) {
            // 子节点不是乘除项，不可以使用结合律
            if (
                child.children.length !== 0 &&
                child.infix.type !== OperatorType.MUL &&
                child.infix.type !== OperatorType.DIV
            ) {
                return undefined;
            }
        }
        const nodeBackup = node.clone(false);
        // 逐个尝试children[0]的因子
        for (const pair of [
            { index: -1, node: node.children[0] },
            ...node.children[0].children.map((x, i) => {
                return { index: i, node: x };
            }),
        ]) {
            const j = pair.index;
            const common = pair.node.clone();
            if (j === -1) {
                common.operator = Operator.createMul();
            }
            // console.log(j, common.expr());
            if (common.children.length !== 0) {
                // 只尝试单一操作数
                continue;
            }
            let ok = true;
            this.commonFactMatchIndices = [j];
            // 看是否存在于其他child里面
            for (let i = 1; i < node.children.length; ++i) {
                const child = node.children[i];
                let match = false;
                if (
                    common.operator.type === (OperatorType.MUL) &&
                    child.children.length === 0 &&
                    common.operand.valueString() === child.operand.valueString()
                ) {
                    // -1 意味着整个都匹配
                    this.commonFactMatchIndices.push(-1);
                    match = true;
                } else {
                    for (let k = 0; k < child.children.length; ++k) {
                        const thatGrandChild = child.children[k];
                        if (this.deepCompare(common, thatGrandChild)) {
                            this.commonFactMatchIndices.push(k);
                            match = true;
                            break;
                        }
                    }
                }
                // console.log('      ', common.expr(), this.commonFactMatchIndices);
                // 如果有一个child不存在因子，则放弃
                if (match === false) {
                    ok = false;
                    break;
                }
            }
            if (ok === true) {
                const commonFact = common.clone();
                const otherFact = node.clone();
                this.splitItems = [];
                for (let i = 0; i < otherFact.children.length; ++i) {
                    // 保持原有的uid不变
                    const child = otherFact.children[i].clone();
                    if (this.commonFactMatchIndices[i] >= 0) {
                        child.children.splice(this.commonFactMatchIndices[i], 1);
                        child.children.forEach((x, i) => (x.index = i));
                    } else {
                        // 拆成了 *1，这个1要新赋值一个id，所以clone(false)
                        const one = new AstNode();
                        child.children = [one];
                        child.infix = Operator.createMul();
                        one.operand = FiniteDecimal.ONE;
                        one.operator = Operator.createMul();
                        one.index = 0;
                        this.splitItems.push({
                            fromUid: child.numUid,
                            numUid: one.numUid,
                            opUid: one.opUid,
                        });
                    }
                    otherFact.children[i] = child;
                }

                otherFact.operator = Operator.createMul();
                otherFact.infix = Operator.createAdd();
                otherFact.mark = 2;

                this.commonFact = commonFact;
                this.otherFact = otherFact;
                if (j <= 0) {
                    node.children = [commonFact, otherFact];
                } else {
                    node.children = [otherFact, commonFact];
                }
                node.infix = Operator.createMul();
                node.mark = 2;

                this.targetToState = node.clone();
                this.cost = this.otherFact.children.length;
                callback();
                // recovery
                node.mark = nodeBackup.mark;
                node.infix = nodeBackup.infix;
                node.children = nodeBackup.children;
                node.children.forEach((x, i) => (x.index = i));
            }
        }
    }

    public deepCompare(a: AstNode, b: AstNode): boolean {
        if (a.operator.type !== b.operator.type) {
            return false;
        }

        if (a.children.length !== b.children.length) {
            return false;
        }

        // 目前仅支持一元公因子
        // 即 ___ * b + b * ___ ，暂不支持 (a + b) * ___ + (a + b) * ___
        if (a.children.length === 0) {
            return a.operand.valueString() === b.operand.valueString();
        }

        return false;
    }
}
