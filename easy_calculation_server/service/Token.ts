// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

export enum TokenType {
    number,
    operator,
    leftParenthesis,
    rightParenthesis,
    undetermined,
}

export class Token {
    public token: string;
    public uid: string;
    public type: TokenType;

    constructor(token:string, uid: string, type:TokenType) {
        this.token = token;
        this.uid = uid;
        this.type = type;
    }
}

export class TokenNode {
    public children: TokenNode[];

    public type: TokenType;

    public value: string;

    public uid: string;

    public idx: number;

    constructor(value: string, type: TokenType, id: string | number) {
        this.children = new Array<TokenNode>();
        this.type = type;
        this.value = value;
        if (typeof id === 'number') {
            this.uid = id.toString();
        } else {
            this.uid = id;
        }
    }

    public clone(): TokenNode {
        const node = new TokenNode(this.value, this.type, this.uid);
        node.uid = node.uid;
        for (const child of this.children) {
            node.children.push(child.clone());
        }
        return node;
    }

    public toString() {
        if (this.children.length > 0) {
            return this.children.map((x) => x.toString()).join('');
        } else {
            return this.value;
        }
    }

    public flat(): Token[] {
        if (this.children.length > 0) {
            return this.children.reduce((l, x) => {
                l.push(...x.flat());
                return l;
            }, []);
        } else {
            return [new Token(this.value, this.uid, this.type)];
        }
    }
}
