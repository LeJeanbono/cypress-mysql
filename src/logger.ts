export class Logger {
    shouldLog: boolean

    constructor(debug = false) {
        this.shouldLog = debug;
    }

    log(message: string) {
        if (this.shouldLog) {
            console.info(message);
        }
    }

}
