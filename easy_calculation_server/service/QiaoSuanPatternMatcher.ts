// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AddSubToAddBracket } from './Patterns/AddBracket/AddSubToAddBracket';
import { AddSubToShuffleAddBracket } from './Patterns/AddBracket/AddSubToShuffleAddBracket';
import { AllAddToShuffleAddBracket } from './Patterns/AddBracket/AllAddToShuffleAddBracket';
import { MulDivToAddBracket } from './Patterns/AddBracket/MulDivToAddBracket';
import { MulDivToShuffleAddBracket } from './Patterns/AddBracket/MulDivToShuffleAddBracket';
import { MulAddToFold } from './Patterns/Fold/MulAddToFold';
import { QiaoSuanPattern } from './Patterns/QiaoSuanPattern';
import { AddSubToRemoveBracket } from './Patterns/RemoveBracket/AddSubToRemoveBracket';
import { MulDivToRemoveBracket } from './Patterns/RemoveBracket/MulDivToRemoveBracket';
import { AddSubToShuffle } from './Patterns/Shuffle/AddSubToShuffle';
import { AllAddToShuffle } from './Patterns/Shuffle/AllAddToShuffle';
import { AllMulToShuffle } from './Patterns/Shuffle/AllMulToShuffle';
import { MulDivToShuffle } from './Patterns/Shuffle/MulDivToShuffle';
import { AddToMakeTens } from './Patterns/Split/AddToMakeTens';
import { AddToSplitAsSum } from './Patterns/Split/AddToSplitAsSum';
import { MulToSplitAsSum } from './Patterns/Split/MulToSplitAsSum';
import { AddMulToUnfold } from './Patterns/Unfold/AddMulToUnfold';
import { TransformActionBase } from './TransformActions/TransformActionBase';
import { MulToSplitAsProduct } from './Patterns/Split/MulToSplitAsProduct';
import { AddToSplitAsProduct } from './Patterns/Split/AddToSplitAsProduct';
import { SplitChildren } from './Patterns/SplitChildren/SplitChildren';

/**  批量匹配transformaction和qiaosuanpattern */
export class QiaoSuanPatternMatcher {
    public static getBasicPatternList(): QiaoSuanPattern[] {
        return [
            new AddMulToUnfold(),
            new AddSubToAddBracket(),
            new AddSubToRemoveBracket(),
            new AddSubToShuffle(),
            new MulAddToFold(),
            new AllAddToShuffle(),
            new AllMulToShuffle(),
            new MulDivToRemoveBracket(),
            new MulDivToAddBracket(),
            new MulDivToShuffle(),
            new AddSubToShuffleAddBracket(),
            new AllAddToShuffleAddBracket(),
            new MulDivToShuffleAddBracket(),
        ];
    }

    public static getSplitPatternList(): QiaoSuanPattern[] {
        return [
//            new AddToMakeTens(),
//            new MulToSplitAsSum(),
//            new AddToSplitAsSum(),
//            new MulToSplitAsProduct(),
//            new AddToSplitAsProduct(),
            new SplitChildren(),
        ];
    }

    public static tryMatch(transformList: TransformActionBase[]): QiaoSuanPattern {
        const patternList = this.getBasicPatternList().concat(this.getSplitPatternList());

        try {
            const matched = patternList.filter((x) => x.match(transformList));

            if (matched.length > 0) {
                // 更新tokenNodeTree
                matched.forEach(
                    (x) => (x.inputTokenNodeTree = transformList[0].treeFromTokenNodeTree)
                );

                // 根据枚举迭代器迭代transformactions匹配巧算模式，选取第一个作为最优先的模式
                return matched[0];
            } else {
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }
}
