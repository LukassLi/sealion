// Copyright (C) 2018, Flickering Inc. All rights reserved.
// Author: Wende Luo (wendeluo@flickering.ai)
//
// 对原生的ts类拓展一些函数
// 这个是定义文件。只定义，不做实现

interface Array<T> {

    /**
     * 添加一个数组
     */
    pushRange(items: Array<T>): void;

    /**
     * 随机其中一个元素
     */
    random(): T;

    /**
     * 确定数组中是否存在某个具体元素
     */
    contains(item: T): boolean;

    /**
     * 确定数组中是否存在满足特定 lambda 表达式的元素
     */
    contains(lambda: (item: T) => boolean): boolean;

    /**
     * 删除数组中某一项  
     * 【在自身数组操作】
     */
    remove(item: T): void;

    /**
     * 删除数组中满足特定 lambda 表达式的元素  
     * 【在自身数组操作】
     */
    remove(lambda: (item: T) => boolean): void;

    /**
     * 删除数组中某一项  
     * 【返回新数组】
     */
    removed(item: T): Array<T>;

    /**
     * 删除数组中满足特定 lambda 表达式的元素  
     * 【返回新数组】
     */
    removed(lambda: (item: T) => boolean): Array<T>;

    /**
     * 清空数组  
     * 【在自身数组操作】
     */
    clear(): void;

    /**
     * 返回第0个元素
     */
    first(): T;

    /**
     * 寻找第一个符合 lambda 表达式的元素
     */
    first(lambda: (item: T) => boolean): T;

    /**
     * 返回数组最后一个元素
     */
    last(): T;

    /**
     * 寻找最后一个符合 lambda 表达式的元素
     */
    last(lambda?: (item: T) => boolean): T;

    /**
     * 返回数组中的最大值（元素都为number时有效）
     */
    max(): T;

    /**
     * 将lambda作为转换函数作用于每个元素上，返回最大结果的那个元素
     * @param lambda 转换函数
     */
    max<R>(lambda: (item: T) => R): T;

    /**
     * 返回数组中的最小值（元素都为number时有效）
     */
    min(): T;

    /**
     * 将lambda作为转换函数作用于每个元素上，返回最小结果的那个元素
     * @param lambda 转换函数
     */
    min<R>(lambda: (item: T) => R): T;

    /**
     * 对数值所有元素进行求和（如果元素不是number类型则抛出异常）
     */
    sum(): number;

    /**
     * 对数组元素某个字段进行求和。
     * @example ```typescript
       // 对数组元素的age字段求和
       array.sum(item => item.age);

       // age > 20 的元素求和
       array.sum(item => {
           if(item.age > 20) {
               return item.age;
           } else {
               return 0;
           }
       });

       ```
     */
    sum(lambda: (item: T) => number): number;

    /**
     * 将序列中的每个元素投影到新表中
     */
    select<R>(lambda: (item: T) => R): Array<R>;

    /**
     * 筛选出满足条件的元素
     */
    where(lambda: (item: T) => boolean): Array<T>;

    /**
     * 统计数组中满足条件的元素数量
     */
    count(lambda: (item: T) => boolean): number;

    /**
     * 将数组转化为Object
     * 将lambda作为转换函数作用于每个元素上，构建Dictionary的key
     * @param lambda key的转换函数
     */
    toDictionary(lambda: (item: T) => string | number): { [key: string]: T };

    /**
     * 克隆一个数组
     */
    clone(): Array<T>;

    /**
     * 将数组【本身】随机打乱
     */
    shuffle(): void;

    /**
     * 【返回】随机打乱后的数组
     */
    shuffled(): Array<T>;

    /**
     * 升序排列
     * 【在自身数组操作】
     */
    sortAsc(): void;

    /**
     * 升序排列（根据对象某个字段作为参考）  
     * 【在自身数组操作】
     * @param lambda 排序字段，可以传多个字段
     */
    sortAsc<R extends (string | number)>(...lambda: Array<(item: T) => R>): void;

    /**
     * 升序排列  
     * 【返回新数组】
     */
    sortedAsc(): Array<T>;

    /**
     * 升序排列（根据对象某个字段作为参考）  
     * 【返回新数组】
     * @param lambda 排序字段，可以传多个字段
     */
    sortedAsc<R extends (string | number)>(...lambda: Array<(item: T) => R>): Array<T>;

    /**
     * 降序排列  
     * 【在自身数组操作】
     */
    sortDesc(): void;

    /**
     * 降序排列（根据对象某个字段作为参考）  
     * 【在自身数组操作】
     * @param lambda 排序字段，可以传多个字段
     */
    sortDesc<R extends (string | number)>(...lambda: Array<(item: T) => R>): void;

    /**
     * 降序排列
     * 【返回新数组】
     */
    sortedDesc(): Array<T>;

    /**
     * 降序排列（根据对象某个字段作为参考）  
     * 【返回新数组】
     * @param lambda 排序字段，可以传多个字段
     */
    sortedDesc<R extends (string | number)>(...lambda: Array<(item: T) => R>): Array<T>;
}