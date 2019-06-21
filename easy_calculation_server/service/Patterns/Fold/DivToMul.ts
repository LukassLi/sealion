// 暂时不做
/*import { QiaoSuanPattern } from './QiaoSuanPattern';
import { TransformActionBase } from '../../TransformActions/TransformActionBase';
import { AddBracketAction } from '../../TransformActions/AddBracketAction';
import { MixedType } from '../AstNode';
import { Operator, OperatorType } from '../Operator';

export class DivToMul extends QiaoSuanPattern {
  public get name(): string {
    return '乘除混合—变除为乘应用结合律';
  }

  public match(steps: TransformActionBase[]): boolean {
    return false;
  }

  public get firstExpression(): string {
    return "first expression";
  }

  public get expressionFeature(): string {
    return '';
  }

  public get operandFeature1(): string {
    return `我们注意到，算式中含有数字${0.25}。它如果乘以${4}，结果刚刚好是${1}[p300]`;
  }

  public get explain(): string[] {
    return '显然，这么做不会改变算式的结果。那么，又有什么好处呢？';
  }
  public get transformDescription(): string {
    return `我们可以在算式的末尾除以再乘以${
      4
    }[p300]`;
  }
  public get lastTransition(): string {
    return '<>';
  }
  public get displayNewExpression(): string {
    return `将算式写成这样[p300]`;
  }

  // 开场读题
  public get prefaceWords(): string {
    return '这题，我们计算的是';
    // 有的是 “这道题，算的是” ？？
  }

  // 连接词
  public get transition(): string {
    return '并且[p300]';
  }

}
*/
