// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Lucca (shihaoli@flickering.ai)

export enum OpeningSpeech {
    STARTEXPLAIN = '这题，我们计算的是',
    MAGNIFIER = '计算前[p0]我们首先观察一下算式的特点',
}

export enum ExprFeatureSpeech {
    ADDBRACKET_HIGHLIGHT_ALLADD = '首先注意到，它是一个连续加法运算[p300]',
    ADDBRACKET_HIGHLIGHT_ALLSUB = '首先注意到，它是一个连续减法运算[p300]',
    ADDBRACKET_HIGHLIGHT_ADDSUB = '首先注意到，它是加减混合的同级运算[p300]',
    ADDBRACKET_HIGHLIGHT_ALLMUL = '首先注意到，它是一个连续乘法运算[p300]',
    ADDBRACKET_HIGHLIGHT_ALLDIV = '首先注意到，它是一个连续除法运算[p300]',
    ADDBRACKET_HIGHLIGHT_MULDIV = '首先注意到，它是乘除混合的同级运算[p300]',
    FOLD_HIGHLIGHT = '它由这{count}个部分相{operator}组成[p300]',
    REMOVEBRACKET_HIGHLIGHT = '首先注意到，它是一个含括号的算式[p300]',
    SHUFFLE_HIGHLIGHT_ALLADD = '首先注意到，它是一个连续加法运算[p300]',
    SHUFFLE_HIGHLIGHT_ALLSUB = '首先注意到，它是一个连续减法运算[p300]',
    SHUFFLE_HIGHLIGHT_ADDSUB = '首先注意到，它是加减混合的同级运算[p300]',
    SHUFFLE_HIGHLIGHT_ALLMUL = '首先注意到，它是一个连续乘法运算[p300]',
    SHUFFLE_HIGHLIGHT_ALLDIV = '首先注意到，它是一个连续除法运算[p300]',
    SHUFFLE_HIGHLIGHT_MULDIV = '首先注意到，它是乘除混合的同级运算[p300]',
    UNFOLD_HIGHLIGHT = '它由一个括号包着的式子，与另一个数相乘组成[p300]',
}

export enum NumFeatureSpeech {
    ADDBRACKET_HIGHLIGHT = '这两个数[p0]{number1}[p0]如果{operator}{number2}[p0]结果刚好是{result}[p300]',
    FOLD_HIGHLIGHT_COMMONFACT = '每一个部分[p0]都刚好含有{value}',
    FOLD_HIGHLIGHT_OTHERFACT = '这{count}个数[p0]{formula}结果刚好是{result}',
    REMOVEBRACKET_HIGHLIGHT = '这两个数[p0]{number1}[p0]如果{operator}{number2}[p0]结果刚好是{result}[p300]',
    SHUFFLE_HIGHLIGHT = '这两个数[p0]{number1}[p0]如果{operator}{number2}[p0]结果刚好是{result}[p300]',
    UNFOLD_HIGHLIGHT = '这两个数[p0]{number1}[p0]如果乘以{number2}[p0]结果刚好是{result}',
    SPLIT_HIGHLIGHT_NEAR = '可以发现[p0]这个数{number1}[p0]离{number2}非常接近',
    SPLIT_HIGHLIGHT_CALC = '{numberTarget}可以看作{number1}{operator}{number2}',
}

export enum TransformSpeech {
    ADDBRACKET_ADDPARENTHESIS_TRANSORDER0 = '我们可以通过添加括号，来改变运算的顺序[p300]',
    ADDBRACKET_ADDPARENTHESIS_TRANSORDER1 = '我们再在算式中添加一下括号',
    ADDBRACKET_ADDPARENTHESIS_TRANSORDERX = '并添上括号',
    ADDBRACKET_ADDPARENTHESIS_LAST = '，就能得到这样的算式',
    ADDBRACKET_ADDPARENTHESIS_NONE = '注意这里，括号前面什么都没有[p300]所以括号内的符号维持原状',
    ADDBRACKET_ADDPARENTHESIS_ADD = '注意这里，括号前面是加号[p300]所以括号内的符号维持原状',
    ADDBRACKET_ADDPARENTHESIS_SUB = '注意这里，括号前面是减号[p300]所以括号内每一项都需要变号',
    ADDBRACKET_ADDPARENTHESIS_MUL = '注意这里，括号前面是乘号[p300]所以括号内的符号维持原状',
    ADDBRACKET_ADDPARENTHESIS_DIV = '注意这里，括号前面是除号[p300]所以括号内每一项都需要变号',
    FOLD_DISTRIBUTIVECOMBINE_LENGTH0 = '根据乘法分配律，我们可以将算式写成这样',
    FOLD_DISTRIBUTIVECOMBINE_LENGTHX = '根据乘法分配律，我们可以得到这样的算式',
    FOLD_SPLITNUMBER = '我们可以把{number1}看作{number2}乘以1，将算式写成这样',
    FOLD_EXPLAIN = '当然，这么做不会改变算式的结果。那么，又有什么好处呢',
    REMOVEBRACKET_REMOVEPARENTHESIS_PRE = '既然括号妨碍了这两个数进行计算，我们就把它去掉[p300]',
    REMOVEBRACKET_REMOVEPARENTHESIS_NONE = '注意这里，括号前面什么都没有[p300]所以括号内的符号维持原状',
    REMOVEBRACKET_REMOVEPARENTHESIS_ADD = '注意这里，括号前面是加号[p300]所以括号内的符号维持原状',
    REMOVEBRACKET_REMOVEPARENTHESIS_SUB = '注意这里，括号前面是减号[p300]所以括号内每一项都需要变号',
    REMOVEBRACKET_REMOVEPARENTHESIS_MUL = '注意这里，括号前面是乘号[p300]所以括号内的符号维持原状',
    REMOVEBRACKET_REMOVEPARENTHESIS_DIV = '注意这里，括号前面是除号[p300]所以括号内每一项都需要变号',
    SHUFFLE_MOVE_TRANSORDER0 = '我们可以带着符号搬家，将算式写成这样',
    SHUFFLE_MOVE_TRANSORDERX = '我们再带着符号搬家',
    SHUFFLE_MOVE_LAST = '，就能得到这样的算式',
    SHUFFLE_EXPLAIN_ALLADD = '因为连续加法运算时，先加[p0]还是后加[p0]没有区别。这两个算式的结果是一样的',
    SHUFFLE_EXPLAIN_ALLSUB = '因为连续减法运算时，先减[p0]还是后减[p0]没有区别。这两个算式的结果是一样的',
    SHUFFLE_EXPLAIN_ADDSUB = '因为加减法同级运算时，先加减[p0]还是后加减[p0]没有区别。这两个算式的结果是一样的',
    SHUFFLE_EXPLAIN_ALLMUL = '因为连续乘法运算时，先乘[p0]还是后乘[p0]没有区别。这两个算式的结果是一样的',
    SHUFFLE_EXPLAIN_ALLDIV = '因为连续除法运算时，先除[p0]还是后除[p0]没有区别。这两个算式的结果是一样的',
    SHUFFLE_EXPLAIN_MULDIV = '因为乘除法同级运算时，先乘除[p0]还是后乘除[p0]没有区别。这两个算式的结果是一样的',
    UNFOLD_DISTRIBUTIVESPLIT = '根据乘法分配律，我们可以将算式写成这样',
    SPLIT_TRANS = '我们可以把{numberTarget}可以看作{number1}{operator}{number2}，将算式改写成这样',
    QUESTION = '掌握这个信息，有什么用呢',
    WAITCALC = '现在，你能不动笔，就口算出来吗',
}

export enum CalculationSpeech {
    FINISH = '怎么样，这么算是不是又快又准呢',
    STEPCALC_START = '我们先计算{formula}答案是{result}',
    STEPCALC_MIDDLE = '再计算{formula}求出来是{result}',
    STEPCALC_FINAL1 = '再计算{formula}就求出来答案是{result}',
    STEPCALC_FINAL2 = '最后求得，答案是{result}',
}
