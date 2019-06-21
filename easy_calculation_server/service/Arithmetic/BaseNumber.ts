// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

export abstract class BaseNumber {
    public computeCost: number = 0;
    public abstract expr(): string;
    public abstract add(that: BaseNumber): BaseNumber;
    public abstract sub(that: BaseNumber): BaseNumber;
    public abstract mul(that: BaseNumber): BaseNumber;
    public abstract div(that: BaseNumber): BaseNumber;
    public abstract valueString(): string;
}
