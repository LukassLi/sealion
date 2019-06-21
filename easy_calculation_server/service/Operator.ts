// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

export enum OperatorType {
    ADD,
    SUB,
    MUL,
    DIV,
    LEFT_BRACE,
    RIGHT_BRACE,
};

export class Operator {
    public static createRightParenthesis(): Operator {
        return new Operator(OperatorType.RIGHT_BRACE, ')', 3, '反括号');
    }
    public static createLeftParenthesis(): Operator {
        return new Operator(OperatorType.LEFT_BRACE, '(', 1, '括号');
    }
    public static createAdd(): Operator {
        return new Operator(OperatorType.ADD, '+', 2, '加', '加上');
    }
    public static createSub(): Operator {
        return new Operator(OperatorType.SUB, '-', 2, '减', '减去');
    }
    public static createMul(): Operator {
        return new Operator(OperatorType.MUL, '×', 3, '乘以', '乘以');
    }
    public static createDiv(): Operator {
        return new Operator(OperatorType.DIV, '÷', 3, '除以', '除以');
    }

    public get opposite(): Operator | undefined {
        let result: Operator | undefined;
        if (this.type === OperatorType.ADD) {
            result = Operator.createSub();
        } else if (this.type === OperatorType.SUB) {
            result = Operator.createAdd();
        } else if (this.type === OperatorType.MUL) {
            result = Operator.createDiv();
        } else if (this.type === OperatorType.DIV) {
            result = Operator.createMul();
        }

        if (result !== undefined) {
            result.uid = this.uid;
        }

        return result;
    }

    public type: OperatorType;

    public static parse(mark: string): Operator {
        if (mark === '(') {
            return Operator.createLeftParenthesis();
        }
        if (mark === ')') {
            return Operator.createRightParenthesis();
        }
        if (mark === '+') {
            return Operator.createAdd();
        }
        if (mark === '-') {
            return Operator.createSub();
        }
        if (mark === '×') {
            return Operator.createMul();
        }
        if (mark === '÷') {
            return Operator.createDiv();
        }
        throw Error(`无法识别的运算符 ${mark}`);
    }

    private static MaxUid: number = 0;

    public singleCharText: string;

    public doubleCharText: string;

    public mark: string;

    public priority: number;

    public uid: string;

    private constructor(
        type: OperatorType,
        mark: string,
        priority: number,
        singleCharText?: string,
        doubleCharText?: string
    ) {
        this.uid = Operator.MaxUid++ + '_op';
        this.type = type;
        this.mark = mark;
        this.priority = priority;
        this.singleCharText = singleCharText;
        this.doubleCharText = doubleCharText;
    }

    public clone(keepId: boolean): Operator {
        const clone = new Operator(
            this.type,
            this.mark,
            this.priority,
            this.singleCharText,
            this.doubleCharText
        );
        if (keepId) {
            clone.uid = this.uid;
        }
        return clone;
    }
}
