// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AstNode } from './AstNode';
import { DebugSettings } from './DebugSettings';
import { PreProcessor } from './PreProcessor';
import { QiaoSuanPatternMatcher } from './QiaoSuanPatternMatcher';
import { TransformEnumerator } from './TransformEnumerator';
import { QiaoSuanPattern } from './Patterns/QiaoSuanPattern';
import { Scene } from './Animation/Scene';
import { Logger } from '../log/logger';

export class QiaosuanRunner {
    public input: string;
    public tree: AstNode;
    public enumerator: TransformEnumerator;
    constructor(input: string) {
        this.input = input;
    }

    public check(): boolean {
        const result = this.run(false);
        return result !== undefined && result.pattern !== undefined;
    }

    public arr = [1,2,3]

    // public test(){
    //     if(this.arr.length==0){
    //         return;
    //     }
    //     const node=this.arr.pop();
    //     const a = [1,2,3,4,5];
    //     let count = 0;
    //     a.reduceRight((r,x)=>()=>{
    //         console.log("myCount",count++);
    //         console.log(x);
    //         r();

    //     },()=>{
    //         console.log('helloworld');
    //         this.test();
    //     })();
    //     this.arr.push(node);
    // }



    public run(
        generateScenes: boolean = true
    ): { pattern: QiaoSuanPattern; scenes: Scene[] } | undefined {

        Logger.logInfo('begin: input=', this.input);

        try {
            const processor = new PreProcessor(this.input);
            this.tree = processor.buildExpressionTree();
            this.tree.binaryTreeToCompactedTree();
            this.tree.eval();
        } catch (error) {
            Logger.logError('process exception: input=', this.input, 'error=', error);
            console.log(error);
            return undefined;
        }

        const best = {
            computeCost: this.tree.subTreeValue.computeCost,
            transformCost: 0,
            steps: undefined,
            mapping: undefined,
            script: undefined,
            expr: undefined,
            scenes: undefined,
        };

        const readText = this.tree.getReadText();

        // 初始化
        this.enumerator = new TransformEnumerator(this.tree);

        let enumerationCount = 0;

        try {
            // this.test();

            this.enumerator.beginEnumerateOnTree((x) => {
                console.trace();
                ++enumerationCount;
                const computeCost = x.eval().computeCost;
                const transformCost = this.enumerator.transformList.reduce((l, x) => l + x.cost, 0);
                if (DebugSettings.DebugSingle === x.expr() || DebugSettings.DebugSingle === 'ALL') {
                    console.log('transformStack:'+this.enumerator.transformStack);
                    // console.log(this.enumerator.transformStack.map((x) => x.map((x) => x.targetToState.expr())));
                }
                const pattern = QiaoSuanPatternMatcher.tryMatch(this.enumerator.transformList);
                if (
                    DebugSettings.ShowSteps &&
                    (DebugSettings.DebugSingle === undefined ||
                        x.expr() === DebugSettings.DebugSingle)
                ) {
                    // console.log(
                    //     this.input,
                    //     pattern === undefined ? undefined : pattern.firstExpression,
                    //     x.expr(),
                    //     'compute=',
                    //     computeCost,
                    //     'transform=',
                    //     transformCost,
                    //     readText,
                    //     this.enumerator.transformList.length,
                    //     pattern === undefined ? undefined : pattern.name
                    // );
                    Logger.logInfo(
                        this.input,
                        pattern === undefined ? undefined : pattern.firstExpression,
                        x.expr(), // final
                        'compute=',
                        `${computeCost}`,
                        'transform=',
                        `${transformCost}`,
                        x.getReadText(),
                        `${this.enumerator.transformList.length}`,
                        pattern === undefined ? undefined : pattern.name
                    );
                    if (DebugSettings.ShowTransformByStep) {
                        console.log(this.enumerator.transformList);
                        if (pattern !== undefined) {
                            console.log(pattern.toString());
                        }
                    }
                }

                // 对于非法的pattern，直接skip掉
                if (pattern !== undefined) {
                    pattern.inputExpression = this.input;
                    pattern.finalExpression = x.expr();
                    if (pattern.finalExpression === pattern.firstExpression) {
                        pattern.finalExpression = '';
                    }
                    // pattern.readExpression = readText;
                    if (
                        computeCost < best.computeCost ||
                        (computeCost === best.computeCost && transformCost < best.transformCost)
                    ) {
                        best.computeCost = computeCost;
                        best.transformCost = transformCost;
                        best.expr = x.expr();
                        best.mapping = pattern === undefined ? undefined : pattern.getJson();

                        // 拆数的模式和拆数的scenes输出有不同   
                        best.scenes =
                            pattern === undefined || generateScenes === false
                                ? []
                                : pattern.getScenes();

                    }
                }
            });

            // 输出
            if (best.expr !== undefined) {
                if (DebugSettings !== undefined && DebugSettings.ShowFinal) {
                    Logger.logInfo(
                        'input=',
                        this.input,
                        'final=',
                        best.expr,
                        'computeCost=',
                        best.computeCost.toString(),
                        'transformCost=',
                        best.transformCost.toString(),
                    );
                    console.log('pattern=', best.mapping);
                    // console.log('scenes=', JSON.stringify(best.scenes.map((x) => x.json), null, 2));
                }

                // Logger.logInfo(
                //     'returned: input=',
                //     this.input,
                //     'pattern=',
                //     best.mapping === undefined ? undefined : best.mapping.finalExpression
                // );

                return {
                    pattern: best.mapping,
                    scenes: best.scenes === undefined ? [] : best.scenes.map((x) => x.json),
                };
            } else {
                
                Logger.logInfo(
                    'returned: input=',
                    this.input,
                    'pattern=',
                    best.mapping === undefined ? undefined : best.mapping.finalExpression
                );

                console.log('no');
                return undefined;
            }
        } catch (error) {
            console.log(this.enumerator.transformStack);
            Logger.logError('exception: input=', this.input, 'error=', error);

            if (DebugSettings.Silent === false) {
                throw error;
            }
            return undefined;
        } finally {
            console.log('enumerationCount=', enumerationCount);
        }
    }
}
