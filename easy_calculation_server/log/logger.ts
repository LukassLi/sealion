// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import * as winston from 'winston';

export class Logger {

    public static logInfo(...message: string[]) {
        Logger.getOrCreateLogger().log({ level: 'info', message: message.join() });
    }

    public static logError(...message: string[]) {
        Logger.getOrCreateLogger().log({ level: 'error', message: message.join() });
    }
    private static instance: winston.Logger = undefined;

    private static getOrCreateLogger(): winston.Logger {
        if (Logger.instance === undefined) {
            Logger.instance = winston.createLogger({
                format: winston.format.json(),
                transports: [
                    new winston.transports.File({ filename: 'error.log', level: 'error' }),
                    new winston.transports.File({ filename: 'combined.log' }),
                ],
            });
        }
        return Logger.instance;
    }
}
