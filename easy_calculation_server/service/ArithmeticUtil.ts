// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Siwei Lai (siweilai@flickering.ai)

import { FiniteDecimal } from './Arithmetic/FiniteDecimal';
import { BaseNumber } from './Arithmetic/BaseNumber';
import { Operator, OperatorType } from './Operator';

// 算术工具类
export class ArithmeticUtil {
    /**
     * 能不能叫做“刚好”
     * 对于整数：
     *   加减：
     *        如果 target 里面末尾 0 的个数比 nums 里的某一个更多，
     *        就可以认为 nums 通过计算，是刚好得到 target
     *   连乘：
     *        nums 和 target 去掉相同个数末尾的 0 之后，target末尾还有 0
     *   除法：
     *        商刚好只有一位有效数字
     *        除法只支持除一个数
     * 对于小数：
     *   两个数的小数点同时向右移动，直到都变成整数。然后用整数的方法处理
     * @param nums 计算过程中的数
     * @param op 计算符号（加减混合ADD、连乘MUL、除法DIV（num只能传一个数））
     * @param target 计算结果（只有加减法需要提供计算结果）
     */
    public static isExactly(nums: BaseNumber[], op: Operator, target: BaseNumber): boolean {
        if (op.type === OperatorType.DIV && nums.length !== 2) {
            throw new Error('除法只能有一个除数');
        }
        if (op.type === OperatorType.ADD || op.type === OperatorType.SUB) {
            if (target === undefined) {
                throw new Error('加减混合必须提供计算结果');
            }
            const allNum = this.normalizeAllNumbers([target, ...nums]);
            while (true) {
                // 全 0 就退出 （大于 0 的一个都没了）
                if (allNum.findIndex((x) => x > 0) === -1) {
                    return false;
                }
                // 计算结果结尾是 0
                const targetEndwithZero = allNum[0] % 10 === 0;
                // 参与计算的数字结尾全是 0（结尾非 0 的一个都没）
                const numsAllEndwithZero = allNum.slice(1).findIndex((x) => x % 10 !== 0) === -1;

                if (targetEndwithZero && !numsAllEndwithZero) {
                    return true;
                } else if (!targetEndwithZero && numsAllEndwithZero) {
                    return false;
                } else if (!targetEndwithZero && !numsAllEndwithZero) {
                    return false; // 一样多
                }
                for (let i = 0; i < allNum.length; i++) {
                    allNum[i] /= 10;
                }
            }
            return false;
        } else if (op.type === OperatorType.MUL) {
            // 所有参与相乘的数字
            const allNum = this.normalizeAllNumbers([...nums]).map((x) =>
                this.removeEndingZeros(x)
            );
            let result = 1;
            for (const x of allNum) {
                result *= x;
            }
            // “正好”：计算结果末尾有 0（参与计算的数末尾没 0）
            return result % 10 === 0 && result !== 0;
        } else if (op.type === OperatorType.DIV) {
            const allNum = this.normalizeAllNumbers([...nums]);
            const dividend = allNum[0]; // 被除数
            const divisor = allNum[1]; // 除数
            // “正好”：能整除且只有一位有效数字
            return dividend % divisor === 0 && this.removeEndingZeros(dividend / divisor) < 10;
        }
        return false;
    }

    /**
     * “不退位/不进位”
     * 对于整数：
     *    没有进位或者退位
     * 对于小数：
     *    两个数的小数点同时向右移动，直到都变成整数。然后用整数的方法处理
     * @param nums 计算过程中的数
     * @param op 计算符号（加减混合ADD、连乘MUL、除法DIV（num只能传一个数））
     */
    public static isNoCarry(nums: BaseNumber[], op: Operator): boolean {
        if (op.type === OperatorType.DIV && nums.length !== 2) {
            throw new Error('除法只能有一个除数');
        }
        if (op.type === OperatorType.ADD || op.type === OperatorType.SUB) {
            const allNum = this.normalizeAllNumbers([...nums]);
            let tailNums:number[] = [];
            while(true){
                if(allNum.findIndex((x)=>x!==0)==-1){
                    return true;
                }
                for (let i = 0; i < allNum.length; i++) {
                    tailNums[i] = allNum[i] % 10;
                    allNum[i] = (allNum[i] - tailNums[i]) / 10;
                }
                if(op.type==OperatorType.ADD){
                    
                }
  

            }
        } else if (op.type === OperatorType.MUL) {
            // 所有参与相乘的数字
            const allNum = this.normalizeAllNumbers([...nums]).map((x) =>
                this.removeEndingZeros(x)
            );
            let result = 1;
            for (const x of allNum) {
                result *= x;
            }
            // “正好”：计算结果末尾有 0（参与计算的数末尾没 0）
            return result % 10 === 0 && result !== 0;
        } else if (op.type === OperatorType.DIV) {
            const allNum = this.normalizeAllNumbers([...nums]);
            const dividend = allNum[0]; // 被除数
            const divisor = allNum[1]; // 除数
            // “正好”：能整除且只有一位有效数字
            return dividend % divisor === 0 && this.removeEndingZeros(dividend / divisor) < 10;
        }
        return false;
    }

    /**
     * 删除数字末尾的 0，得到有效数字
     * @param num 输入数字（需要是整数）
     */
    private static removeEndingZeros(num: number) {
        while (num % 10 === 0 && num > 0) {
            num /= 10;
        }
        return num;
    }

    /**
     * 归一化所有数字
     * @param nums
     */
    private static normalizeAllNumbers(nums: BaseNumber[]): number[] {
        const numsDecimal: FiniteDecimal[] = [];
        for (const num of nums) {
            if (num instanceof FiniteDecimal) {
                numsDecimal.push(num);
            } else {
                throw new Error('暂时只支持整数和小数');
            }
        }
        const floatLength = Math.max(...numsDecimal.map((x) => x.floatLength));
        const result: number[] = [];
        for (const val of numsDecimal) {
            let v = val.value;
            for (let i = val.floatLength; i < floatLength; ++i) {
                v *= 10;
            }
            result.push(v);
        }
        return result;
    }
}
