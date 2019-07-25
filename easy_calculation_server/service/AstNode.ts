// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { Operator, OperatorType } from './Operator';
import { BaseNumber } from './Arithmetic/BaseNumber';
import { FiniteDecimal } from './Arithmetic/FiniteDecimal';
import { TokenNode, TokenType, Token } from './Token';
import { DebugSettings } from './DebugSettings';

export enum MixedType {
    AllAdd,
    AllSub,
    AddSub,
    AllMul,
    AllDiv,
    MulDiv,
}

/*
 表达式树
 */
export class AstNode {
    public get numUid(): string {
        return this.id.toString();
    }

    public get opUid(): string {
        return this.operator.uid;
    }

    public get subTreeValue(): BaseNumber {
        if (this._subTreeValue === undefined) {
            this.eval();
        }
        return this._subTreeValue;
    }

    public set subTreeValue(value: BaseNumber) {
        this._subTreeValue = value;
    }

    public get mixedType(): MixedType {
        const childrenOperators = this.children.map((x) => x.operator);
        if (this.infix === undefined) {
            return undefined;
        }

        if (
            this.children.some(
                (x) => x.children.length > 0 && x.infix.priority !== x.operator.priority
            )
        ) {
            return undefined;
        }

        if (this.infix.type === OperatorType.ADD || this.infix.type === OperatorType.SUB) {
            const nAdd = childrenOperators.filter((x) => x.type === OperatorType.ADD).length;
            const nSub = childrenOperators.filter((x) => x.type === OperatorType.SUB).length;
            if (nSub === 0) {
                return MixedType.AllAdd;
            } else if (nAdd === 1) {
                return MixedType.AllSub;
            } else {
                return MixedType.AddSub;
            }
        } else {
            const nMul = childrenOperators.filter((x) => x.type === OperatorType.MUL).length;
            const nDiv = childrenOperators.filter((x) => x.type === OperatorType.DIV).length;
            if (nDiv === 0) {
                return MixedType.AllMul;
            } else if (nMul === 1) {
                return MixedType.AllDiv;
            } else {
                return MixedType.MulDiv;
            }
        }
    }
    // 给节点标号
    public static COUNT: number = 0;
    public static NODEMANAGER: AstNode[] = new Array<AstNode>();
    private static GRAPHCOUNT: number = 0;
    public isAddOne: boolean = false;
    public id: number;

    // 深度
    public height: number = undefined;

    // 是否允许在compact时提升子节点
    // 当存在括号的时候，不管是不是同级运算，我们都不能提升子节点
    // 即保证树能够还原出原始的表达式
    public allowElevate: boolean;

    // 中缀操作符，即一般语法树中的运算符，根节点是运算符，左右节点是操作数
    public infix: Operator;

    // 操作符，当前子树带上操作符和同级的兄弟之间进行计算
    public operator: Operator;

    // 叶节点上记录操作数
    public operand: FiniteDecimal;

    // 当前子树求值的结果
    public _subTreeValue: BaseNumber = undefined;

    // 子节点
    public children: AstNode[] = new Array<AstNode>();

    // 父节点
    public parent: AstNode;
    // 在父节点中的序号
    public index: number;

    // 为了便于在枚举过程中简化移动操作, 标记节点
    // 0 - 正常节点
    // 1 - 已经被移走的节点
    // 2 - 临时节点
    public mark: number = 0;

    public mulTop: AstNode = undefined;

    public addTop: AstNode = undefined;

    constructor() {
        this.id = AstNode.COUNT++;
        this.allowElevate = true;
        AstNode.NODEMANAGER.push(this);
    }
    /*
        将表达式由二叉树转换为多叉树
        例如 1+2*3+3-(4+5+6+7)+(8+9)/10
        表示为 {+1, +{*2, *3}, +3, -{+4, +5, +6, +7}, +{*(+8, +9), /10}
        好处是容易进行交换律的变换
        注意这里(4+5+6+7)并没有直接被去掉括号提取到外面
        算法思路就是把中缀运算符下推
    */
    public binaryTreeToCompactedTree() {
        for (const child of this.children) {
            child.binaryTreeToCompactedTree();
        }
        const compactedChildren = [];
        if (this.children.length === 2) {
            for (let i = 0; i < this.children.length; ++i) {
                const child = this.children[i];
                let operator;
                let elevate = false;
                if (this.infix.type === OperatorType.ADD) {
                    // 加号同时下推给两个操作数
                    operator = Operator.createAdd();
                } else if (this.infix.type === OperatorType.SUB) {
                    // 减号只下推给第二个操作数
                    operator = i === 0 ? Operator.createAdd() : Operator.createSub();
                } else if (this.infix.type === OperatorType.MUL) {
                    // 减号只下推给第二个操作数
                    operator = Operator.createMul();
                } else if (this.infix.type === OperatorType.DIV) {
                    // 除号只下推给第二个操作数
                    operator = i === 0 ? Operator.createMul() : Operator.createDiv();
                }

                // 子节点优先级相同的时候可以考虑将子节点的子节点直接提升到当前节点下面
                if (child.children.length > 0 && child.infix.priority === this.infix.priority) {
                    // 减法和除法只能提升第一个操作数
                    if (this.infix.type === OperatorType.SUB || this.infix.type === OperatorType.DIV) {
                        elevate = i === 0;
                    } else {
                        elevate = true;
                    }
                }
                if (child.allowElevate && elevate) {
                    for (const grandChild of child.children) {
                        if (grandChild.operator === undefined) {
                            grandChild.operator = operator;
                        }
                        grandChild.parent = this;
                        grandChild.index = compactedChildren.length;
                        compactedChildren.push(grandChild);
                    }
                } else {
                    if (child.operator === undefined) {
                        child.operator = operator;
                    }
                    child.parent = this;
                    child.index = compactedChildren.length;
                    compactedChildren.push(child);
                }
            }
        } else if (this.children.length !== 0) {
            throw Error('unexpected');
        }
        this.children = compactedChildren;
    }
    public json(): {
        [key: string]: any;
    } {
        const ret: {
            [key: string]: any;
        } = {};
        ret.operator = this.infix;
        ret.operand = this.operand;
        ret.children = this.children.map((x) => x.json());
        return ret;
    }

    public getMulTop(): AstNode {
        if (this.mulTop === undefined) {
            this.mulTop = this;
            while (
                this.mulTop.operator !== undefined &&
                (this.mulTop.operator.type === OperatorType.MUL || this.mulTop.operator.type === OperatorType.DIV) &&
                this.mulTop.parent !== undefined
            ) {
                this.mulTop = this.mulTop.parent;
            }
        }
        return this.mulTop;
    }

    public getAddTop(): AstNode {
        if (this.addTop === undefined) {
            this.addTop = this;
            while (
                this.addTop.operator !== undefined &&(
                this.addTop.operator.type === OperatorType.ADD || this.addTop.operator.type === OperatorType.SUB) &&
                this.addTop.parent !== undefined
            ) {
                this.addTop = this.addTop.parent;
            }
        }
        return this.addTop;
    }

    /*
        可视化 http://viz-js.com/
    */
    public toVizGraph(label: string = ''): string {
        return `
subgraph cluster${AstNode.GRAPHCOUNT++} {
${label.length > 0 ? 'label="' + label + '";' : ''}
${this._toVizGraph()}
}
`;
    }

    public expr(): string {
        let expr = this.operator !== undefined ? this.operator.mark : '';
        if (
            this.operator !== undefined &&
            this.infix !== undefined &&
            this.operator.priority > this.infix.priority
        ) {
            expr += '(' + this._expr() + ')';
        } else {
            expr += this._expr();
        }
        if (DebugSettings !== undefined && DebugSettings.ShowTokens) {
            return expr + ' tokens=' + this.getFlatTree();
        } else {
            return expr;
        }
    }

    public toVizNode(): string {
        let style = '';
        switch (this.mark) {
            case 1:
                style = ' fillcolor=blue, style=filled';
                break;
            case 2:
                style = ' fillcolor=red, style=filled';
                break;
            case 3:
                style = ' fillcolor=yellow, style=filled';
                break;
        }
        const operator = this.operator === undefined ? '' : this.operator.mark;
        const operand = this.operand === undefined ? '' : this.operand;
        const infix = this.infix === undefined ? '' : '(' + this.infix.mark + ')';
        return `node_${this.numUid}_${
            AstNode.GRAPHCOUNT
        }[label="${operator}${operand}${infix}" ${style}]`;
    }

    public toString(): string {
        return `${this.operator === undefined ? '' : this.operator.mark}${
            this.operand === undefined ? '' : this.operand
        }${this.infix === undefined ? '' : '(' + this.infix.mark + ')'}`;
    }

    public clone(keepId: boolean = true): AstNode {
        const ret = new AstNode();
        ret.infix = this.infix === undefined ? undefined : this.infix.clone(keepId);
        ret.operand = this.operand === undefined ? undefined : this.operand.clone();
        ret.operator = this.operator === undefined ? undefined : this.operator.clone(keepId);
        ret.isAddOne = this.isAddOne;
        ret.children = [...this.children];
        if (keepId) {
            ret.id = this.id;
        }
        return ret;
    }

    /*
        求值
    */
    public eval(): BaseNumber {
        let result: FiniteDecimal;
        // 叶节点是操作数，直接返回
        if (this.children.length === 0) {
            result = this.operand;
        } else {
            for (const child of this.children) {
                const value = child.eval() as FiniteDecimal;
                const operator = child.operator;
                if (result === undefined) {
                    result = value;
                    if (operator.type === OperatorType.SUB || operator.type === OperatorType.DIV) {
                        result.computeCost = Infinity;
                    }
                } else if (operator.type === OperatorType.ADD) {
                    result = result.add(value);
                } else if (operator.type === OperatorType.SUB) {
                    result = result.sub(value);
                } else if (operator.type === OperatorType.MUL) {
                    result = result.mul(value);
                } else if (operator.type === OperatorType.DIV) {
                    result = result.div(value);
                }
            }
        }
        this.subTreeValue = result;
        return result;
    }

    public getTokenTree(): TokenNode {
        const node = new TokenNode('x', TokenType.number, undefined);
        const queue = new Array<{ node: AstNode; token: TokenNode }>();
        queue.push({ node: this, token: node });

        while (queue.length > 0) {
            const top = queue.pop();

            top.token.type = TokenType.number;
            top.token.value = top.node.subTreeValue.valueString();
            top.token.uid = top.node.id.toString();

            if (top.node.children.length === 0) {
                continue;
            }

            let addBracket = false;

            if (
                top.node.operator !== undefined &&
                top.node.infix !== undefined &&
                top.node.operator.priority >= top.node.infix.priority
            ) {
                addBracket = true;
            }

            if (addBracket) {
                top.token.children.push(
                    new TokenNode('(', TokenType.leftParenthesis, top.node.numUid + '_(')
                );
            }

            for (let i = 0; i < top.node.children.length; ++i) {
                const child = top.node.children[i];
                if (i > 0) {
                    top.token.children.push(
                        new TokenNode(child.operator.mark, TokenType.operator, child.opUid)
                    );
                }

                const childToken = new TokenNode('x', TokenType.number, undefined);
                top.token.children.push(childToken);

                queue.push({
                    node: child,
                    token: childToken,
                });
            }

            if (addBracket) {
                top.token.children.push(
                    new TokenNode(')', TokenType.rightParenthesis, top.node.numUid + '_)')
                );
            }
        }

        return node;
    }

    public getReadText(): string {
        const tokens = this.getTokenTree().flat();
        return (
            tokens
                .map((x) => {
                    if (x.type === TokenType.number) {
                        return x.token;
                    } else {
                        const operator = Operator.parse(x.token);
                        return '[p0]' + operator.singleCharText;
                    }
                })
                .join('') + '[p300]'
        );
    }

    public treeApply(func: (x: AstNode) => any) {
        func(this);
        for (const child of this.children) {
            child.treeApply(func);
        }
    }

    public setChildren(children: AstNode[]) {
        this.children = children;
        this.children.forEach((x, i) => (x.index = i));
    }

    private getFlatTree(): string {
        if (this.children.length === 0) {
            return this.operand.valueString();
        } else {
            return (
                '[' + this.children.map((x) => x.operator.mark + x.getFlatTree()).join(',') + ']'
            );
        }
    }

    private _toVizGraph() {
        const edges = new Array<string>();
        edges.push(this.toVizNode());
        for (const child of this.children) {
            edges.push(child._toVizGraph());
            edges.push(
                `node_${this.numUid}_${AstNode.GRAPHCOUNT} -> node_${child.numUid}_${
                    AstNode.GRAPHCOUNT
                };`
            );
        }
        return edges.join('\n');
    }

    /*
        获得表达式
    */
    private _expr(): string {
        let start = true;
        let expr = '';
        if (this.children.length > 0) {
            for (const child of this.children) {
                if (
                    !start ||
                    (child.operator.type !== OperatorType.ADD &&
                        child.operator.type !== OperatorType.MUL)
                ) {
                    expr += child.operator.mark;
                }
                start = false;
                if (child.children.length !== 0) {
                    if (child.operator.priority >= child.infix.priority) {
                        expr += `(${child._expr()})`;
                    } else {
                        expr += `${child._expr()}`;
                    }
                } else {
                    expr += child.operand.valueString();
                }
            }
        } else {
            expr = this.operand.valueString();
        }
        return expr;
    }
}
