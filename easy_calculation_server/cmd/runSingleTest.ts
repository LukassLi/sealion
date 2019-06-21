// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { FiniteDecimal } from '../service/Arithmetic/FiniteDecimal';
import { DebugSettings } from '../service/DebugSettings';
import { QiaosuanRunner } from '../service/QiaosuanRunner';
import { PreProcessor } from '../service/PreProcessor';
import { Scene, SceneType } from '../service/Animation/Scene';
import { AddParenthesisAnimation } from '../service/Animation/AddParenthesisAnimation';
import { RemoveParenthesisAnimation } from '../service/Animation/RemoveParenthesisAnimation';
import { StepCalcAnimation } from '../service/Animation/StepCalcAnimation';
import * as fs from 'fs';

console.log("Test running...")

DebugSettings.ShowSteps = true;
DebugSettings.ShowFinal = true;
//DebugSettings.ShowTransformByStep = true;
const exprList: string[] = [];
//exprList.push('25×(32×125)');
//exprList.push('63×125+125+18×250');

//exprList.push('25×(32×125)');
//exprList.push('1.01×25');
//exprList.push('(13×125)×(3×8)')
//exprList.push('88×125')
//exprList.push('144÷16+176÷16-96÷16')
//exprList.push('35×127-35×16-11×35')
//exprList.push('99+999+9999+99999')
//exprList.push('125×88×88×88')
//exprList.push('3.7×1.1')
//exprList.push('303×111');
//exprList.push('100+1-100+1')
//exprList.push('125×8101')
exprList.push('735-35×20')

//exprList.push('8.56-(87-1.44)+187');
// wrong??? exprList.push('3.5×9.9'); 
DebugSettings.DebugSingle = '32×(2×8+14)';// "63×125+125+18×(125×2)";

for (const str of exprList) {
  const runner = new QiaosuanRunner(str);
  const startDate = new Date();
  const result = runner.run();
  const endDate = new Date();
  console.log("Time = ", (endDate.getTime() - startDate.getTime())/1000.0, "s");

  // 写入json
  fs.writeFileSync("run.json", JSON.stringify({
    input: str, comment: "", scenes: result === undefined ? undefined : result.scenes}, null, 2));
}

if(false) {
console.log(new FiniteDecimal("1000").div(new FiniteDecimal("25")));
console.log(new FiniteDecimal("40").div(new FiniteDecimal("8")));
console.log(new FiniteDecimal("8").mul(new FiniteDecimal("25")));
console.log(new FiniteDecimal("1000").div(new FiniteDecimal("200")));
}

if(false) {
console.log(SceneType[SceneType.opening]);

const p1 = new AddParenthesisAnimation();
const p2 = new RemoveParenthesisAnimation();

console.log(p1.toJson());

console.log(p2.toJson());

const inputExpr = "(273-73)-(4.6+6.4)";
const processor = new PreProcessor(inputExpr);
processor.buildExpressionTree().binaryTreeToCompactedTree();
const tree = processor.tree.getTokenTree();
console.log(JSON.stringify(tree));
const frames = StepCalcAnimation.generateStepCalScene(tree);
console.log(JSON.stringify(frames, null, 2));
}

if(false) {
  console.log(new FiniteDecimal("1000").div(new FiniteDecimal("125")));
  console.log(new FiniteDecimal("8").mul(new FiniteDecimal("4")));
  console.log(new FiniteDecimal("1000").div(new FiniteDecimal("125")).mul(new FiniteDecimal("4")));
  }


if (false) {
  console.log("--------------------------------------")
  
  // 127+52+21
  console.log(
    new FiniteDecimal(127)
    .add(new FiniteDecimal(52)) // 2, 179
    .add(new FiniteDecimal(21)) // 3
    )

  // 127+52+21
  console.log(
    new FiniteDecimal(21)
    .add(new FiniteDecimal(52)) // 2, 73
    .add(new FiniteDecimal(127)) // 3 200
    ) 

  // 278+122+463+37
  console.log(
    new FiniteDecimal(278)
    .add(new FiniteDecimal(122)) // 2, 400
    .add(new FiniteDecimal(463)) // 3, 863
    .add(new FiniteDecimal(37)) // 4, 
  )

  // (278+122)+(463+37)
  console.log(
    new FiniteDecimal(278)
    .add(new FiniteDecimal(122)) // 2, 400
    .add(new FiniteDecimal(463) 
    .add(new FiniteDecimal(37))) // 1, 500
  )
}


if(false) {
  console.log(
    new FiniteDecimal(100)
    .mul(new FiniteDecimal(25))
    .sub(new FiniteDecimal(1)
    .mul(new FiniteDecimal(25)))
  )

  console.log(
    new FiniteDecimal(100)
    .mul(new FiniteDecimal(25))
  )

  console.log(
    new FiniteDecimal(1)
    .mul(new FiniteDecimal(25))
  )
}

  console.log(
    new FiniteDecimal("7650").sub(new FiniteDecimal("4650")),
    new FiniteDecimal("7650").sub(new FiniteDecimal("4650")).sub(new FiniteDecimal("550")),
    );

  console.log(
    //21.4-(9.75+1.4)
    new FiniteDecimal("7650").sub(new FiniteDecimal("550")),
    new FiniteDecimal("7650").sub(new FiniteDecimal("550")).sub(new FiniteDecimal("4650")),
  )

  console.log(
    new FiniteDecimal("1.96"),
    new FiniteDecimal("10"),
    new FiniteDecimal("1.96").div(new FiniteDecimal("10")),
  )