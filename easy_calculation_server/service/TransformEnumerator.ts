// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { AstNode } from './AstNode';
import { BinaryHeap } from './BinaryHeap';
import { Operator, OperatorType } from './Operator';
import { AddBracketAction } from './TransformActions/AddBracketAction';
import { FoldAction } from './TransformActions/FoldAction';
import { RemoveBracketAction } from './TransformActions/RemoveBracketAction';
import { ShuffleAction } from './TransformActions/ShuffleAction';
import { SplitNumberAction as SplitToSumOrProductAction } from './TransformActions/SplitNumberAction';
import { TransformActionBase } from './TransformActions/TransformActionBase';
import { UnfoldAction } from './TransformActions/UnfoldAction';
import { SplitChildAction } from './TransformActions/SplitChildAction';

export class TransformEnumerator {
    public get transformList(): TransformActionBase[] {
        return new Array<TransformActionBase>().concat(...this.transformStack);
    }
    public transformStack: TransformActionBase[][] = [];

    /*
    使用一个堆，每次选取一个深度最大的节点来进行枚举
  */
    public heap = new BinaryHeap<AstNode>((x) => -x.height);

    public splitSumCandidates: { [key: string]: number[] };

    public splitProductCandidates: { [key: string]: number[] };

    private tree: AstNode;

    constructor(tree: AstNode) {
        this.tree = tree;
    }

    public beginEnumerateOnTree(callback: (x: AstNode) => any) {
        this.splitProductCandidates = {};
        this.splitSumCandidates = {};

        this.tree.treeApply((node: AstNode) => {
            if (node.children.length > 0) {
                return;
            }

            const mulTop = node.getMulTop();

            const splitProductCandidates = [];
            const splitSumCandidates = [];
            mulTop.treeApply((x: AstNode) => {
                if (x.children.length !== 0) {
                    return;
                }
                if (x === node) {
                    return;
                }
                if (x.operator.type === (OperatorType.DIV)) {
                    return;
                }
                let n = x.operand.value;
                while (n % 10 === 0) {
                    n = n / 10;
                }
                if (n === 125) {
                    splitProductCandidates.push(8);
                    splitSumCandidates.push(8);
                }
                if (n === 25) {
                    splitProductCandidates.push(4);
                    splitSumCandidates.push(4);
                }
            });

            let foldTop: AstNode = mulTop;

            foldTop = foldTop.getAddTop();

            foldTop.treeApply((x: AstNode) => {
                if (x.children.length !== 0) {
                    return;
                }
                if (x === node) {
                    return;
                }
                if (x.operator.type === (OperatorType.DIV)) {
                    return;
                }
                if (x.operator.type === OperatorType.MUL && x.parent === node.parent) {
                    return;
                }
                if (x.getMulTop() === node.getMulTop()) {
                    return;
                }
                let n = x.operand.value;
                splitProductCandidates.push(n);
            });

            const opUid = node.opUid;
            this.splitSumCandidates[opUid] = this.unique(splitSumCandidates);
            this.splitProductCandidates[opUid] = this.unique(splitProductCandidates);
            console.log(
                node.operand.value,
                this.splitSumCandidates[opUid],
                this.splitProductCandidates[opUid]
            );
        });

        /*
            使用一个堆，每次选取一个深度最大的节点来进行枚举
        */
        const queue = new Array<AstNode>();
        this.heap.clear();
        queue.push(this.tree);
        this.tree.height = 0;
        while (queue.length > 0) {
            const node = queue.pop();
            this.heap.push(node);
            for (const child of node.children) {
                child.height = node.height + 1;
                queue.push(child);
            }
        }

        this.processToNextNode(callback);
    }

    public processToNextNode(callback: (x: AstNode) => any): any {
        // 选取深度最大的节点，并在这个节点上尝试变换，变换完之后再尝试下一个节点

        if (this.heap.size() === 0) {
            // 输出一系列scene json
            callback(this.tree);
            return;
        }
        console.log("heapSize="+this.heap.size());

        const top = this.heap.pop();
        console.log("topNode=",top);
        const transforms: TransformActionBase[] = [];
        if (false && top.children.length === 0) {
            transforms.push(
                // new AddToMakeTensAction(top, this.tree, this.heap),
                new SplitToSumOrProductAction(
                    top,
                    this.tree,
                    this.heap,
                    this.splitSumCandidates[top.opUid],
                    this.splitProductCandidates[top.opUid]
                )
            );
        }
        transforms.push(
            new SplitChildAction(top, this.tree, this.heap, this.splitSumCandidates, this.splitProductCandidates),
            new UnfoldAction(top, this.tree, this.heap),
            new RemoveBracketAction(top, this.tree, this.heap),
            new ShuffleAction(top, this.tree, this.heap),
            new AddBracketAction(top, this.tree, this.heap),
            new FoldAction(top, this.tree, this.heap)
        );

        // const stack: string[] = [];
        let count = 0;
        const actionChain = transforms.reduceRight(
            (r, x) => () => {
                console.log("myCount=",count++);
                // console.log('transformAction=',x);
                x.treeFromState = this.tree.expr();
                x.treeFromTokenNodeTree = this.tree.getTokenTree();
                x.runAction(top, () => {
                    x.treeToState = this.tree.expr();
                    x.treeToTokenNodeTree = this.tree.getTokenTree();
                    r();
                });
                console.log('????????????????????');
            },
            () => {
                const effectiveTransforms = transforms.filter((x) => x.targetToState !== undefined);
                this.transformStack.push(effectiveTransforms);
                this.processToNextNode(callback);
                this.transformStack.pop();
            }
        );

        actionChain();
        this.heap.push(top);
    }

    private unique(array: number[]) {
        return array
            .sort((x, y) => (x === y ? 0 : x < y ? -1 : 1))
            .reduce((left, x) => {
                if (left.length === 0 || left[left.length - 1] !== x) {
                    left.push(x);
                }
                return left;
            }, []);
    }
}
