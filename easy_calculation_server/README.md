## README

### 1. Launch server

```
npm run serve
```

Check logs from error.log and combined.log.


### 2. API

Check 

http://localhost:3000/expression/97%C3%9725+222/check

Get scenes

http://localhost:3000/expression/97%C3%9725+222/scenes

### 3. docker
**build**
docker build -t registry.cn-beijing.aliyuncs.com/zuoyeji/app_qiaosuan:v1.0.36 .
docker push registry.cn-beijing.aliyuncs.com/zuoyeji/app_qiaosuan:v1.0.36

**run**
docker stop qiaosuan
docker rm qiaosuan
docker run --name qiaosuan -d -p 6789:3000 registry.cn-beijing.aliyuncs.com/zuoyeji/app_qiaosuan:v1.0.32

docker stop qiaosuan_old
docker rm qiaosuan_old
docker run --name qiaosuan_old -d -p 6790:3000 registry.cn-beijing.aliyuncs.com/zuoyeji/app_qiaosuan:v1.0.36

docker stop qiaosuan_test
docker rm qiaosuan_test
docker run --name qiaosuan_test -d -p 6791:3000 registry.cn-beijing.aliyuncs.com/zuoyeji/app_qiaosuan:v1.0.36

1. “刚好”怎么讲（“刚好”、“不退位/不进位”、“位数变少”、“得数变小”）
->是否意为扩大范围
->台词‘刚好’的替换

2. 打分修改
 a. 1000÷(25×8) => 4×250÷(25×8)  | 4÷25×250÷8 | 4÷(25÷250)÷8
  打分25/250，和4/0.1，应该都是0。所以会被选中
 b. 37.24-23.79+16.76 这个题会把23.79变成23.8-0.01
 
 拆数的识别局限化

37.24-23.79+16.76 （拆数化 23.79）
10.1+9-10.1+9 （拆数化 "10.1","-","10.1","+","9","+","10","-","1"）
1000÷(25×8) （拆数化 8）
125×(8+40) （拆数化 40）
125×(40-8) （拆数化 40）
25×(4+8) （拆数化 8）
34×17+15×17+49×3需屏蔽 （拆数化）
735-35×20 （拆数化 735）
40+360÷40-1需屏蔽 （拆数化）
200+19+81-57-43 （拆数化）

明显的第一步巧算，隐性的第二步巧算

25+75-25+75 这个是25-25+75+75比较好还是25+75-（75-25）比较好？


减少记忆复杂度

动画末尾添数加高亮强调，不改变结果这句话移到前面

fail 113 125×(8+40)
fail 114 125×(40-8)
fail 115 25×(4+8)
fail 116 99+999+9999+99999
fail 118 0.99+9.9+99+999
4×100×0.25
fail 31 10÷3.2÷0.25÷1.25
fail 40 25×23+76×25+25

拆数局限在表内以及凑整
两数相乘—拆数（和）用运算律(SplitChildren)

last node transforms -> node2 transforms -> node3 transforms````

堆栈追踪默认只追踪10行？

callback 一定会执行一次
回调函数和递归一般用于流程控制
infix 中缀
pattern ->match get各种scene
treeToState 第一步的式子字符串
treeFromTokenNodeTree？
各种token？

// 增加的
astnode：  multTop/addTop
operator:  operatorType
