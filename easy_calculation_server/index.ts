// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)
//         Siwei Lai (siweilai@flickering.ai)

import { QiaosuanRunner } from './service/QiaosuanRunner';
import express = require('express');
import reload = require('express-reload');
import * as morgan from 'morgan'; // log requests to the console (express4)
import { DebugSettings } from './service/DebugSettings';

DebugSettings.Silent = true;

const app: express.Application = express();

let path = __dirname + '/project/';

app.disable('etag');

app.use(
    morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :res[body]'
    )
);

// 跨域设置
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'content-type, x-requested-with');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

app.get('/expression/:expression/:action(check|scenes|test)', (req, res) => {
    console.log(req.params.expression, req.params.action);
    const expression = req.params.expression;
    const action = req.params.action;
    const runner = new QiaosuanRunner(expression);
    if (action === 'check') {
        const result = runner.check();
        res.json({
            input: expression,
            result,
        });
    } else if (action === 'scenes') {
        const result = runner.run();
        res.json({
            input: expression,
            result: result === undefined || result.scenes === undefined ? [] : result.scenes,
        });
    } else if (action === 'test') {
        const result = runner.run();
        res.json(result);
    }
});

app.get('/expressions/:expressions', (req, res) => {
    const expressions = JSON.parse(req.params.expressions);
    console.log(expressions);
    const data = [];
    for (const expression of expressions) {
        const runner = new QiaosuanRunner(expression);
        const result = runner.check();
        data.push({
            input: expression,
            result,
        });
    }
    res.json({ data });
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
