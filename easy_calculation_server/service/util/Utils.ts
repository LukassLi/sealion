// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Lucca (shihaoli@flickering.ai)
//
// 工具函数

/** 格式化 */
export function format(targetStr: string, args:{[key:string]:string}): string {
    let result = targetStr;
    for (const key in args) {
        if (args[key] != undefined) {
            const reg = new RegExp('({' + key + '})', 'g');
            result = result.replace(reg, args[key]);
        }
    }
    return result;
}
