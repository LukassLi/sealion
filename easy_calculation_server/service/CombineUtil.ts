// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

// 暂时没有用了
// 枚举子集拆分方式的组合数
// 即子集无序，子集间也无序
// 或者是第二类斯特林数
export class CombineUtil {
    private ns: any[];
    private m: number;
    private count: number = 0;
    private callback: (x: any[][]) => any;

    public b(mu: number, nu: number, sigma: number, n: number, a: number[]) {
        if (nu === mu + 1) {
            while (a[nu] < mu - 1) {
                this.visit(n, a);
                a[nu] = a[nu] + 1;
            }
            this.visit(n, a);
            a[mu] = 0;
        } else if (nu > mu + 1) {
            if ((a[nu] + sigma) % 2 === 1) {
                this.f(mu, nu - 1, 0, n, a);
            } else {
                this.b(mu, nu - 1, 0, n, a);
            }
            while (a[nu] < mu - 1) {
                a[nu] = a[nu] + 1;
                if ((a[nu] + sigma) % 2 === 1) {
                    this.f(mu, nu - 1, 0, n, a);
                } else {
                    this.b(mu, nu - 1, 0, n, a);
                }
            }
            if ((mu + sigma) % 2 === 1) {
                a[nu - 1] = 0;
            } else {
                a[mu] = 0;
            }
        }
        if (mu === 2) {
            this.visit(n, a);
        } else {
            this.b(mu - 1, nu - 1, (mu + sigma) % 2, n, a);
        }
    }

    public run(ns: any[], m: number, callback: (x: any[][]) => any) {
        this.ns = ns;
        this.m = m;
        this.callback = callback;
        if (m === 1) {
            callback([ns]);
            return;
        }

        this.count = 0;
        const n = this.ns.length;
        const a = new Array<number>(n + 1);
        for (let i = 0; i < n + 1; ++i) {
            a[i] = 0;
        }
        for (let j = 1; j < this.m + 1; ++j) {
            a[n - this.m + j] = j - 1;
        }
        this.f(this.m, n, 0, n, a);

        // 验算
        const s = this.s(n, m);
        if (this.count !== s) {
            throw new Error(`expected = ${s} actual = ${this.count}`);
        }
    }

    // 第二类斯特林数
    public s(n: number, k: number) {
        if (n === 0 && k === 0) {
            return 1;
        }

        if (n === 0 || k === 0) {
            return 0;
        }

        return k * this.s(n - 1, k) + this.s(n - 1, k - 1);
    }
    private visit(n: number, a: number[]) {
        const ps = Array<number[]>(this.m);
        for (let i = 0; i < this.m; ++i) {
            ps[i] = new Array<number>();
        }
        for (let j = 0; j < n; ++j) {
            ps[a[j + 1]].push(this.ns[j]);
        }
        this.callback(ps);
        ++this.count;
    }

    private f(mu: number, nu: number, sigma: number, n: number, a: number[]) {
        if (mu === 2) {
            this.visit(n, a);
        } else {
            this.f(mu - 1, nu - 1, (mu + sigma) % 2, n, a);
        }
        if (nu === mu + 1) {
            a[mu] = mu - 1;
            this.visit(n, a);
            while (a[nu] > 0) {
                a[nu] = a[nu] - 1;
                this.visit(n, a);
            }
        } else if (nu > mu + 1) {
            if ((mu + sigma) % 2 === 1) {
                a[nu - 1] = mu - 1;
            } else {
                a[mu] = mu - 1;
            }
            if ((a[nu] + sigma) % 2 === 1) {
                this.b(mu, nu - 1, 0, n, a);
            } else {
                this.f(mu, nu - 1, 0, n, a);
            }
            while (a[nu] > 0) {
                a[nu] = a[nu] - 1;
                if ((a[nu] + sigma) % 2 === 1) {
                    this.b(mu, nu - 1, 0, n, a);
                } else {
                    this.f(mu, nu - 1, 0, n, a);
                }
            }
        }
    }
}
