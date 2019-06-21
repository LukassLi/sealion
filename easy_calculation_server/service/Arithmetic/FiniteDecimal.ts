// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)
// Author: Lucca (shihaoli@flickering.ai)

import { BaseNumber } from './BaseNumber';
import { Logger } from '../../log/logger';
import { DebugSettings } from '../DebugSettings';

export enum AddState {
    start,
    continuousTranscriptionAA,
    continuousTranscriptionBB,
    continuousCarry,
    other,
}
export enum SubState {
    start,
    continousTranscription,
    continousCarry,
    continuousCancelOut,
    other,
}

// 即 a + b 直接使用number计算出c
// 然后根据 a, b, c的数字的情况来评分
// 小数先化为了整数
export class FiniteDecimal extends BaseNumber {
    public static ZERO: FiniteDecimal = new FiniteDecimal('0');
    public static ONE: FiniteDecimal = new FiniteDecimal('1');
    public value: number;

    /** 小数长度 */
    public floatLength: number;

    /** 固定算法的复杂度 */
    public fixedArithmeticCost = 1;

    constructor(input: string | number) {
        super();
        let numString: string;
        if (typeof input === 'number') {
            numString = input.toString();
        } else {
            numString = input;
        }
        const pointIndex = numString.indexOf('.');
        if (pointIndex === -1) {
            this.floatLength = 0;
            this.value = parseInt(numString, 10);
        } else {
            this.floatLength = numString.length - 1 - pointIndex;
            this.value = parseInt(
                numString.substring(0, pointIndex) + numString.substring(pointIndex + 1),
                10
            );
        }
        this.computeCost = 0;
    }
    public clone(): FiniteDecimal {
        const that = new FiniteDecimal(0);
        that.value = this.value;
        that.floatLength = this.floatLength;
        return that;
    }

    /** 返回原始数值的字符串 */
    public valueString(): string {
        // 还原
        while (this.value % 10 === 0 && this.floatLength > 0) {
            this.value /= 10;
            --this.floatLength;
        }
        const rawString = this.value.toString();
        let result;
        if (rawString.length > this.floatLength) {
            result =
                rawString.substr(0, rawString.length - this.floatLength) +
                '.' +
                rawString.substr(rawString.length - this.floatLength);
        } else {
            result = '0.';
            for (let i = 0; i < this.floatLength - rawString.length; ++i) {
                result += '0';
            }
            result += rawString;
        }
        if (result[result.length - 1] === '.') {
            return result.substring(0, result.length - 1);
        }
        return result;
    }

    /** 归一化 */
    public normalize() {
        while (this.floatLength > 0 && this.value % 10 === 0 && this.value > 0) {
            this.value /= 10;
            this.floatLength -= 1;
        }
    }

    public expr(): string {
        return this.value.toString();
    }

    public add(that: FiniteDecimal): FiniteDecimal {
        const result = new FiniteDecimal('0');
        result.floatLength = Math.max(this.floatLength, that.floatLength);
        let thisVal = this.value;
        let thatVal = that.value;
        for (let i = this.floatLength; i < result.floatLength; ++i) {
            thisVal *= 10;
        }
        for (let i = that.floatLength; i < result.floatLength; ++i) {
            thatVal *= 10;
        }
        result.value = thisVal + thatVal;
        result.computeCost = this.computeCost + that.computeCost;
        if (result.computeCost === Infinity) {
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}+${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+0=${result.computeCost}`
                );
            }
            return result;
        }

        // 去掉两数末尾0
        while (thisVal % 10 === 0 && thatVal % 10 === 0 && (thisVal > 0 || thatVal > 0)) {
            thisVal /= 10;
            thatVal /= 10;
        }
        let currentCost = 0;
        let state: AddState = AddState.start;
        const continuousCarryCost = 0;
        const continuousTransCost = 2; // 3;
        const normalAddCost = 4;
        const memoryOneCarryCost = 5; // 8;
        let carry = 0;
        let calcTimes = 0; // 计算次数
        for (let a = thisVal, b = thatVal; a > 0 || b > 0; ) {
            calcTimes++;
            if (a == 0 || b == 0) {
                currentCost += 1; // 0.1;
                if(carry!=0 && state==AddState.other){
                    currentCost+=2;
                    carry=0;
                }
                const aa = a % 10;
                const bb = b % 10;
                a = (a - aa) / 10;
                b = (b - bb) / 10;
                continue;
            }
            const aa = a % 10;
            const bb = b % 10;
            a = (a - aa) / 10;
            b = (b - bb) / 10;
            let cc = aa + bb + carry;
            switch (state) {
                case AddState.start:
                    if (aa + bb === 10) {
                        currentCost += normalAddCost; // continuousCarryCost;
                        state = AddState.continuousCarry;
                    } else if (aa === 0) {
                        currentCost += continuousTransCost;
                        state = AddState.continuousTranscriptionAA;
                    } else if (bb === 0) {
                        currentCost += continuousTransCost;
                        state = AddState.continuousTranscriptionBB;
                    } else {
                        if (cc > 10) {
                            currentCost += memoryOneCarryCost;
                        } else {
                            currentCost += normalAddCost;
                        }
                        state = AddState.other;
                    }
                    break;
                case AddState.continuousCarry:
                    if (cc === 10) {
                        if (calcTimes === 2) {
                            // 如果第二步还是进位为0则减去第一步增加的复杂度
                            currentCost -= normalAddCost;
                            
                        }
                        currentCost += continuousCarryCost;
                        state = AddState.continuousCarry;
                    } else {
                        if (cc > 10) {
                            currentCost += memoryOneCarryCost;
                        } else {
                            currentCost += normalAddCost;
                        }
                        state = AddState.other;
                    }
                    break;
                case AddState.continuousTranscriptionAA:
                    if (aa === 0) {
                        currentCost += continuousTransCost;
                        state = AddState.continuousTranscriptionAA;
                    } else {
                        if (cc > 10) {
                            currentCost += memoryOneCarryCost;
                        } else {
                            currentCost += normalAddCost;
                        }
                        state = AddState.other;
                    }
                    break;
                case AddState.continuousTranscriptionBB:
                    if (bb === 0) {
                        currentCost += continuousTransCost;
                        state = AddState.continuousTranscriptionBB;
                    } else {
                        if (cc > 10) {
                            currentCost += memoryOneCarryCost;
                        } else {
                            currentCost += normalAddCost;
                        }
                        state = AddState.other;
                    }
                    break;
                case AddState.other:
                    if (carry != 0) {
                        // 第二步存在进位则需要增加额外的复杂度
                        currentCost += 2;
                    }
                    if (cc > 10) {
                        currentCost += memoryOneCarryCost;
                    } else {
                        currentCost += normalAddCost;
                    }
                    state = AddState.other;
                    break;
                default:
                    break;
            }
            for (carry = 0; cc >= 10; ) {
                ++carry;
                cc -= 10;
            }
        }
        result.computeCost += currentCost;
        if (DebugSettings.ShowComputeCost) {
            Logger.logInfo(
                '复杂度打分:',
                `${thisVal}+${thatVal}`,
                `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                `结果打分=原复杂度+${currentCost}=${result.computeCost}`
            );
        }
        return result;
    }

    public sub(that: FiniteDecimal): FiniteDecimal {
        const result = new FiniteDecimal('0');
        result.floatLength = Math.max(this.floatLength, that.floatLength);
        let thisVal = this.value;
        let thatVal = that.value;
        for (let i = this.floatLength; i < result.floatLength; ++i) {
            thisVal *= 10;
        }
        for (let i = that.floatLength; i < result.floatLength; ++i) {
            thatVal *= 10;
        }
        result.value = thisVal - thatVal;
        result.computeCost = this.computeCost + that.computeCost;
        if (result.computeCost === Infinity) {
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}-${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+0=${result.computeCost}`
                );
            }
            return result;
        }

        // 去掉两数末尾0
        while (thisVal % 10 === 0 && thatVal % 10 === 0 && (thisVal > 0 || thatVal > 0)) {
            thisVal /= 10;
            thatVal /= 10;
        }
        let currentCost = 0;
        if (thisVal < thatVal) {
            result.computeCost = Infinity;
        } else {
            let state: SubState = SubState.start;
            const continuousCancelOutCost = 0;
            const continuousTranscriptionCost = 2; // 1;
            const normalSubCost = 4;
            // const continuousCarryCost = 5;
            const memoryOneCarryCost = 5; // 8;
            for (let a = thisVal, b = thatVal, carry = 0; a > 0 || b > 0; ) {
                if (a == 0 || b == 0) {
                    currentCost += 1; // 0.1;
                    if(carry!=0&& state==SubState.other){
                        currentCost+=2;
                        carry=0;
                    }
                    const aa = a % 10;
                    const bb = b % 10;
                    a = (a - aa) / 10;
                    b = (b - bb) / 10;
                    continue;
                }
                const aa = a % 10;
                const bb = b % 10;
                const cc = aa - bb - carry;
                a = (a - aa) / 10;
                b = (b - bb) / 10;
                switch (state) {
                    case SubState.start:
                        if (aa - bb === 0) {
                            state = SubState.continuousCancelOut;
                            currentCost += continuousCancelOutCost;
                        } else if (bb === 0) {
                            state = SubState.continousTranscription;
                            currentCost += continuousTranscriptionCost;
                            // } else if (aa === 0) {
                            //     state = SubState.continousCarry;
                            //     currentCost += continuousCarryCost;
                        } else {
                            state = SubState.other;
                            if (aa < bb) {
                                currentCost += memoryOneCarryCost;
                            } else {
                                currentCost += normalSubCost;
                            }
                        }
                        break;
                    // case SubState.continousCarry:
                    //     if (aa === 0) {
                    //         state = SubState.continousCarry;
                    //         currentCost += continuousCarryCost;
                    //     } else {
                    //         state = SubState.other;
                    //         if (aa < bb) {
                    //             currentCost += memoryOneCarryCost;
                    //         } else {
                    //             currentCost += normalSubCost;
                    //         }
                    //     }
                    //     break;
                    case SubState.continousTranscription:
                        if (aa === bb) {
                            state = SubState.continuousCancelOut;
                            currentCost += 2;
                        } else if (bb === 0) {
                            state = SubState.continousTranscription;
                            currentCost += continuousTranscriptionCost;
                        } else if (aa !== bb) {
                            // toadd  if(aa!==bb)
                            state = SubState.other;
                            if (aa < bb) {
                                currentCost += memoryOneCarryCost;
                            } else {
                                currentCost += normalSubCost;
                            }
                        }
                        break;
                    case SubState.continuousCancelOut:
                        if (aa === bb) {
                            state = SubState.continuousCancelOut;
                            currentCost += continuousCancelOutCost;
                        } else {
                            state = SubState.other;
                            if (aa < bb) {
                                currentCost += memoryOneCarryCost;
                            } else {
                                currentCost += normalSubCost;
                            }
                        }
                        break;
                    case SubState.other:
                        state = SubState.other;
                        if (carry != 0) {
                            // 第二步存在进位则需要增加额外的复杂度
                            currentCost += 2;
                        }
                        if(aa===0){
                            currentCost+=normalSubCost;
                        } else if (aa - carry < bb) {
                            currentCost += memoryOneCarryCost;
                        } else {
                            currentCost += normalSubCost;
                        }
                        break;
                    default:
                        break;
                }
                if (aa - carry < bb) {
                    carry = 1;
                } else {
                    carry = 0;
                }
            }
        }
        result.computeCost += currentCost;
        if (DebugSettings.ShowComputeCost) {
            Logger.logInfo(
                '复杂度打分:',
                `${thisVal}-${thatVal}`,
                `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                `结果打分=原复杂度+${currentCost}=${result.computeCost}`
            );
        }
        return result;
    }

    public mul(that: FiniteDecimal): FiniteDecimal {
        const result = new FiniteDecimal('0');
        result.floatLength = this.floatLength + that.floatLength;
        let thisVal = this.value;
        let thatVal = that.value;
        if (thatVal < thisVal) {
            const tmp = thatVal;
            thatVal = thisVal;
            thisVal = tmp;
        }
        result.value = thisVal * thatVal;
        result.computeCost = this.computeCost + that.computeCost;
        if (result.computeCost === Infinity) {
            return result;
        }
        while (thisVal % 10 === 0 && thisVal > 0) {
            thisVal /= 10;
        }
        while (thatVal % 10 === 0 && thatVal > 0) {
            thatVal /= 10;
        }

        if (thisVal > 100 && thatVal > 100) {
            result.computeCost = Infinity;
            return result;
        }

        const resultUnchangedCost = 1;
        if (thatVal === 1 || thisVal === 1) {
            result.computeCost += resultUnchangedCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}×${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+0=${result.computeCost}`
                );
            }
            return result;
        }
        // const easyCalculationCost = 1;
        if ((thisVal === 125 && thatVal === 8) || (thisVal === 8 && thatVal === 125)) {
            result.computeCost += this.fixedArithmeticCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}×${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${this.fixedArithmeticCost}=${result.computeCost}`
                );
            }
            return result;
        }
        if ((thisVal === 25 && thatVal === 4) || (thisVal === 4 && thatVal === 25)) {
            result.computeCost += this.fixedArithmeticCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}×${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${this.fixedArithmeticCost}=${result.computeCost}`
                );
            }
            return result;
        }
        const sameValCost = 1;
        const mulWithinTableCost = 2;
        if (thisVal < 10 && thatVal < 10) {
            if (thisVal === thatVal) {
                result.computeCost += sameValCost;
                if (DebugSettings.ShowComputeCost) {
                    Logger.logInfo(
                        '复杂度打分:',
                        `${thisVal}×${thatVal}`,
                        `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                        `结果打分=原复杂度+${sameValCost}=${result.computeCost}`
                    );
                }
            } else {
                result.computeCost += mulWithinTableCost;
                if (DebugSettings.ShowComputeCost) {
                    Logger.logInfo(
                        '复杂度打分:',
                        `${thisVal}×${thatVal}`,
                        `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                        `结果打分=原复杂度+${mulWithinTableCost}=${result.computeCost}`
                    );
                }
            }
            return result;
        }
        const buf = new Array<number>(100);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = 0;
        }
        let currentCost = 0;
        const containZeroCost = 2;
        const containOneCost = 2;
        const normalMulCost = 4;
        const memoryCarryCost = 5;
        for (let a = thisVal, ai = 0; a > 0; ++ai) {
            const aa = a % 10;
            a = (a - aa) / 10;
            for (let b = thatVal, bi = 0; b > 0; ++bi) {
                const bb = b % 10;
                b = (b - bb) / 10;
                const cc = buf[ai + bi];
                if (aa === 0 || bb === 0) {
                    currentCost += containZeroCost;
                } else if (aa === 1 || bb === 1) {
                    currentCost += containOneCost;
                } else if (aa * bb + cc >= 10) {
                    currentCost += memoryCarryCost;
                } else {
                    currentCost += normalMulCost;
                }
                for (let ab = aa * bb + cc; ab >= 10; ab -= 10) {
                    buf[ai + bi + 1] += 1;
                    buf[ai + bi] = ab;
                }
            }
        }
        for (let c = result.value; c > 0; ) {
            const cc = c % 10;
            if (cc === 0) {
                c = (c - cc) / 10;
            } else {
                break;
            }
        }
        result.computeCost += currentCost;
        if (DebugSettings.ShowComputeCost) {
            Logger.logInfo(
                '复杂度打分:',
                `${thisVal}×${thatVal}`,
                `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                `结果打分=原复杂度+${currentCost}=${result.computeCost}`
            );
        }
        return result;
    }

    public div(that: FiniteDecimal): FiniteDecimal {
        const result = new FiniteDecimal('0');
        let thisVal = this.value;
        let thatVal = that.value;
        result.floatLength = this.floatLength - that.floatLength;
        let currentCost: number = 0;
        if (thatVal === 0) {
            throw new Error('除数为0');
        }

        // // 被除数需要归一化
        // // 则复杂度+1
        // let normalLizeCost = 0;
        // if((this.floatLength!=that.floatLength)||that.floatLength>0){
        //     normalLizeCost+=1;
        // }

        // 归一化
        while (result.floatLength < 0) {
            thisVal *= 10;
            ++result.floatLength;
        }
        while (thatVal % 10 === 0 && thatVal > 0) {
            thatVal /= 10;
            ++result.floatLength;
        }
        while (result.floatLength > 0 && thisVal % 10 === 0 && thisVal > 0) {
            thisVal /= 10;
            --result.floatLength;
        }
        let reminder = thisVal;
        result.value = 0;
        result.computeCost = this.computeCost + that.computeCost;
        if (result.computeCost === Infinity) {
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+0=${result.computeCost}`
                );
            }
            return result;
        }
        const normalDivCost = 4;
        const hash: { [key: string]: boolean } = {};
        let reminderCount: number = 0;
        while (reminder > 0) {
            hash[reminder] = true;
            reminder *= 10;
            const newReminder = reminder % thatVal;
            result.value = result.value * 10 + (reminder - newReminder) / thatVal;
            ++result.floatLength;
            if (result.value > 0) {
                currentCost += normalDivCost * thatVal.toString().length;
            }

            // 无限不循环小数 或者 很长的循环小数
            reminderCount++;
            if (hash[newReminder] === true || reminderCount > 10) {
                result.computeCost = Infinity;
                return result;
            }
            reminder = newReminder;
        }
        result.normalize();
        // if (thatVal === 1) {
        //     result.computeCost+=normalLizeCost;
        //     if (DebugSettings.ShowComputeCost) {
        //         Logger.logInfo(
        //             '复杂度打分:',
        //             `${thisVal}÷${thatVal}`,
        //             `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
        //             `结果打分=原复杂度+1+${normalLizeCost}=${result.computeCost}`
        //         );
        //     }
        //     return result;
        // }

        if (thisVal === thatVal) {
            // 除数和被除数有效数字相同
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+0=${result.computeCost}`
                );
            }
            return result;
        } else if (thisVal === 100 && thatVal === 25) {
            if (that.floatLength > 0 || result.floatLength < 0) {
                this.fixedArithmeticCost += 1;
            }
            result.computeCost += this.fixedArithmeticCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${this.fixedArithmeticCost}=${result.computeCost}`
                );
            }
            return result;
        } else if (thisVal === 1000 && thatVal === 125) {
            if (that.floatLength > 0 || result.floatLength < 0) {
                this.fixedArithmeticCost += 1;
            }
            result.computeCost += this.fixedArithmeticCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${this.fixedArithmeticCost}=${result.computeCost}`
                );
            }
            return result;
        } else if (thatVal < 10 && result.value < 10) {
            // 表内除法
            let divWithinTable = 1;
            if (that.floatLength > 0 || result.floatLength < 0) {
                divWithinTable += 1;
            }
            if (true) {
                divWithinTable += 1;
            }
            result.computeCost += divWithinTable;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${divWithinTable}=${result.computeCost}`
                );
            }
        } else {
            result.computeCost += currentCost;
            if (DebugSettings.ShowComputeCost) {
                Logger.logInfo(
                    '复杂度打分:',
                    `${thisVal}÷${thatVal}`,
                    `原复杂度${thisVal}=${this.computeCost}，${thatVal}=${that.computeCost}`,
                    `结果打分=原复杂度+${currentCost}=${result.computeCost}`
                );
            }
        }
        return result;
    }

    public equal(that: FiniteDecimal) {
        return this.value === that.value;
    }

    private log(...args: any): any {}
}
