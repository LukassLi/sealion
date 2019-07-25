// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AstNode, MixedType } from '../AstNode';
import { BinaryHeap } from '../BinaryHeap';
import { TokenNode } from '../Token';
import { Scene } from '../Animation/Scene';

export abstract class TransformActionBase {
    public heap: BinaryHeap<AstNode>;
    public target: AstNode;
    public targetFromState: AstNode;
    public targetToState: AstNode;
    public treeFromState: string;
    public treeToState: string;

    /*
     一个target会被连续执行多个action
     例如 (T1)-> 去括号 -> (T2) -> 带符号搬家 -> (T3) -> 添加括号 -> (T4)
     那么
     1. 三个action的 treeInitialTokenNodeTree都一样都是T1
     2. treeFromTokenNodeTree 就是前一个变换之后的状态。去括号是T1，带符号搬家是T2，添加括号是T3。
     2. treeToTokenNodeTree 是变换之后的状态。去括号是T2，带符号搬家是T3，添加括号是T4。
    */

    // 在target还没有变换之前的树
    public treeInitialTokenNodeTree: TokenNode;
    // 在当前action还没有执行之前的树
    public treeFromTokenNodeTree: TokenNode;
    // 在当前action执行之后的树
    public treeToTokenNodeTree: TokenNode;

    public cost: number;
    public tree: AstNode;
    public mixed: MixedType;

    constructor(targetFrom: AstNode, from: AstNode, heap: BinaryHeap<AstNode> = undefined) {
        this.targetFromState = targetFrom.clone();
        this.tree = from;
        this.treeFromState = from.expr();
        this.cost = undefined;
        this.heap = heap;

        this.treeInitialTokenNodeTree = from.getTokenTree();
    }
    // 在node上尝试枚举变换，并对树执行callback
    public abstract runAction(node: AstNode, callback: () => any);

    public abstract getTransformScenes(): Scene[];

    public abstract getNumberFeatureScenes(): Scene[];

    public abstract getExpressionFeatureScenes(): Scene[];
}
