// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { BaseNumber } from './BaseNumber';

export class Float extends BaseNumber {
    public expr(): string {
        throw new Error('Method not implemented.');
    }
    public add(that: BaseNumber): BaseNumber {
        throw new Error('Method not implemented.');
    }
    public sub(that: BaseNumber): BaseNumber {
        throw new Error('Method not implemented.');
    }
    public mul(that: BaseNumber): BaseNumber {
        throw new Error('Method not implemented.');
    }
    public div(that: BaseNumber): BaseNumber {
        throw new Error('Method not implemented.');
    }
    public valueString(): string {
        throw new Error('Method not implemented.');
    }
}
