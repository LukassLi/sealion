// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AstNode } from './AstNode';
import { Operator, OperatorType } from './Operator';
import { FiniteDecimal } from './Arithmetic/FiniteDecimal';

/** 预处理 */
export class PreProcessor {
    public tokens: string[] = [];
    public tree: AstNode;
    public input: string;

    constructor(input: string) {
        this.input = input;
    }

    /**
     * token化
     * 生成token数组
     */
    public tokenize(): string[] {
        this.tokens = ['('];
        for (let i = 0; i < this.input.length; ) {
            if ('+-×÷()'.indexOf(this.input[i]) !== -1) {
                this.tokens.push(this.input[i]);
                ++i;
            } else if (
                (this.input[i] >= '0' && this.input[i] <= '9') ||
                '._/%'.indexOf(this.input[i]) !== -1
            ) {
                let token = '';
                while (
                    (this.input[i] >= '0' && this.input[i] <= '9') ||
                    '._/%'.indexOf(this.input[i]) !== -1
                ) {
                    token += this.input[i];
                    ++i;
                }
                this.tokens.push(token);
            } else {
                throw new Error(`无法识别的字符 ${this.input[i]} in ${this.input}`);
            }
        }
        this.tokens.push(')');
        return this.tokens;
    }

    /** 构建生成表达式树 */
    public buildExpressionTree() {
        this.tokenize();
        const operators = new Array<Operator>();
        const operands = new Array<AstNode>();
        for (const token of this.tokens) {
            if (token === '(') {
                operators.push(Operator.parse(token));
            } else if (token === ')') {
                while (
                    operators.length > 0 &&
                    operators[operators.length - 1].type !== OperatorType.LEFT_BRACE
                ) {
                    // 生成一个子树
                    const node = new AstNode();
                    node.infix = operators.pop();
                    const right = operands.pop();
                    const left = operands.pop();
                    node.children.push(left);
                    node.children.push(right);
                    operands.push(node);
                }
                // 不允许在compact的时候消去这一个节点，因为这里有括号
                operands[operands.length - 1].allowElevate = false;
                operators.pop();
            } else if ('+-×÷'.indexOf(token) !== -1) {
                const operator = Operator.parse(token);
                while (
                    operators.length > 0 &&
                    operator.priority <= operators[operators.length - 1].priority
                ) {
                    const node = new AstNode();
                    node.infix = operators.pop();
                    const right = operands.pop();
                    const left = operands.pop();
                    node.children.push(left);
                    node.children.push(right);
                    operands.push(node);
                }
                operators.push(operator);
            } else {
                const node = new AstNode();
                node.operand = new FiniteDecimal(token);
                operands.push(node);
            }
        }
        this.tree = operands[0];
        return this.tree;
    }
}
