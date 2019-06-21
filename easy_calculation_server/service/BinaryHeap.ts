// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

// 二项堆, 最小堆
export class BinaryHeap<T> {
    public elements: T[];
    public value: (x: T) => number;

    constructor(value: (x: T) => number) {
        this.elements = [];
        this.value = value;
    }

    public clear() {
        this.elements = [];
    }
    public push(element: T) {
        this.elements.push(element);
        this.bubbleUp(this.elements.length - 1);
    }

    public pop(): T {
        if (this.elements.length === 0) {
            throw new Error('Empty Heap');
        }
        const result = this.elements[0];
        const end = this.elements.pop();
        if (this.elements.length > 0) {
            this.elements[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    public remove(node: T) {
        const length = this.elements.length;
        for (let i = 0; i < length; i++) {
            if (this.elements[i] !== node) {
                continue;
            } else {
                const end = this.elements.pop();
                this.elements[i] = end;
                this.bubbleUp(i);
                this.sinkDown(i);
                break;
            }
        }
    }

    public size() {
        return this.elements.length;
    }

    private bubbleUp(n: number) {
        const element = this.elements[n];
        const value = this.value(element);
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.elements[parentN];
            if (value >= this.value(parent)) {
                break;
            }
            this.elements[parentN] = element;
            this.elements[n] = parent;
            n = parentN;
        }
    }

    private sinkDown(n: number) {
        const length = this.elements.length;
        const element = this.elements[n];
        const elemvalue = this.value(element);

        while (true) {
            const child2N = (n + 1) * 2;
            const child1N = child2N - 1;
            let swap = null;
            let swapvalue = null;
            if (child1N < length) {
                const child1 = this.elements[child1N];
                const child1value = this.value(child1);
                if (child1value < elemvalue) {
                    swap = child1N;
                    swapvalue = child1value;
                }
            }
            if (child2N < length) {
                const child2 = this.elements[child2N];
                const child2value = this.value(child2);
                if (child2value < (swap == null ? elemvalue : swapvalue)) {
                    swap = child2N;
                }
            }

            if (swap == null) {
                break;
            }

            this.elements[n] = this.elements[swap];
            this.elements[swap] = element;
            n = swap;
        }
    }
}
