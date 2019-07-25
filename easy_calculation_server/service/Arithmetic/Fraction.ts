// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { FiniteDecimal } from './FiniteDecimal';
import { BaseNumber } from './BaseNumber';

export class Fraction extends BaseNumber {
    // 假分数的整数部分
    public FiniteDecimal: FiniteDecimal;
    // 分子
    public numerator: FiniteDecimal;
    // 分母
    public denominator: FiniteDecimal;
    constructor(input: string) {
        super();
        if (input.indexOf('/') === -1 && input.indexOf('_') === -1) {
            this.FiniteDecimal = new FiniteDecimal(input);
            this.numerator = FiniteDecimal.ZERO;
            this.denominator = FiniteDecimal.ONE;
            return;
        }
        const indexOfUnderline = input.indexOf('_');
        if (indexOfUnderline !== -1) {
            this.FiniteDecimal = new FiniteDecimal(input.substring(0, indexOfUnderline));
            input = input.substring(indexOfUnderline + 1);
        } else {
            this.FiniteDecimal = FiniteDecimal.ZERO;
        }
        const split = input.split('/');
        if (split.length === 2) {
            this.numerator = new FiniteDecimal(split[0]);
            this.denominator = new FiniteDecimal(split[1]);
        } else if (split.length === 0) {
            this.numerator = FiniteDecimal.ZERO;
            this.denominator = FiniteDecimal.ONE;
        } else {
            throw new Error('不合法的分数');
        }
    }
    public valueString(): string {
        throw new Error('Method not implemented.');
    }
    public clearMemberScore() {
        this.FiniteDecimal.computeCost = 0;
        this.numerator.computeCost = 0;
        this.denominator.computeCost = 0;
    }
    public expr(): string {
        throw new Error('Method not implemented.');
    }
    public add(that: Fraction): Fraction {
        if (!(that instanceof Fraction)) {
            return undefined;
        }
        const result = new Fraction('1/1');
        let denominator: FiniteDecimal;
        let numerator: FiniteDecimal;
        let score = this.computeCost + that.computeCost;
        if (this.denominator === that.denominator) {
            denominator = this.denominator;
            numerator = this.numerator.add(that.numerator);
            score += numerator.computeCost;
        } else {
            denominator = this.denominator.mul(that.denominator);
            numerator = this.numerator
                .mul(that.denominator)
                .add(this.denominator.mul(that.numerator));
            score += denominator.computeCost + numerator.computeCost;
        }
        result.denominator = denominator;
        result.numerator = numerator;
        result.computeCost = score;
        result.clearMemberScore();
        return result;
    }
    public sub(that: Fraction): Fraction {
        const result = new Fraction('1/1');
        let denominator: FiniteDecimal;
        let numerator: FiniteDecimal;
        let score = this.computeCost + that.computeCost;
        if (this.denominator === that.denominator) {
            denominator = this.denominator;
            numerator = this.numerator.sub(that.numerator);
            score += numerator.computeCost;
        } else {
            denominator = this.denominator.mul(that.denominator);
            numerator = this.numerator
                .mul(that.denominator)
                .sub(this.denominator.mul(that.numerator));
            score += denominator.computeCost + numerator.computeCost;
        }
        result.denominator = denominator;
        result.numerator = numerator;
        result.computeCost = score;
        result.clearMemberScore();
        return result;
    }
    public mul(that: Fraction): Fraction {
        const result = new Fraction('1/1');
        result.numerator = this.numerator.mul(that.numerator);
        result.denominator = this.denominator.mul(that.denominator);
        result.computeCost = result.numerator.computeCost + result.denominator.computeCost;
        result.clearMemberScore();
        return result;
    }
    public div(that: Fraction): Fraction {
        if (!(that instanceof Fraction)) {
            return undefined;
        }
        const result = new Fraction('1/1');
        result.numerator = this.numerator.mul(that.denominator);
        result.denominator = this.denominator.mul(that.numerator);
        result.computeCost = result.numerator.computeCost + result.denominator.computeCost;
        result.clearMemberScore();
        return result;
    }
    public value(): string {
        if (this.FiniteDecimal.value === 0) {
            return `${this.numerator.value}/${this.denominator.value}`;
        }
        return `${this.FiniteDecimal.value}_${this.numerator.value}/${this.denominator.value}`;
    }
}
