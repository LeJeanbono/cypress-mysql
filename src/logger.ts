import ora from 'ora';

export class Logger {
    logger: any;
    shouldLog: boolean

    constructor(debug = false) {
        this.logger = ora();
        this.shouldLog = debug;
    }

    log(message: string) {
        if (this.shouldLog) {
            this.logger.info(message);
        }
    }

}

