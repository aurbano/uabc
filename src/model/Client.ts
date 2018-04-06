import * as os from 'os';

import ConsoleLogger from "../lib/ConsoleLogger";
import FileLogger from "../lib/FileLogger";
import {Options} from "../lib/input";
import {ChildProcess} from "child_process";
import exec from '../lib/exec';

abstract class Client {
    private loggers: {
        console?: ConsoleLogger,
        file?: FileLogger,
    };
    private playerProcess: ChildProcess;

    constructor(options: Options) {
        this.loggers = {};

        if (options.verbose) {
            this.loggers.console = new ConsoleLogger();
        }

        if (options.log) {
            let logName;
            if (options.log.length > 0) {
                logName = options.log;
            }
            this.loggers.file = new FileLogger(logName);
        }

        this.playerProcess = exec(options.file);

        this.playerProcess.on('close', (code: string) => {
            console.log(`client> child process exited with code ${code}`);
            this.onDisconnect();
        });

        this.playerProcess.stdout.on('data', (data: string) => {
            const lines = data.split('\n');
            const regex = new RegExp('^\d,\d;\d,\d$');
            const output = [];
            for (let line in lines) {
                if (regex.test(line)) {
                    this.log('player', line);
                    this.onPlayerData(line);
                } else {
                    output.push(line);
                }
            }
            if (output.length > 0) {
                console.log('---------- PLAYER OUTPUT ---------');
                console.log(output.join('\n'));
                console.log('----------------------------------');
            }
        });

        this.playerProcess.stderr.on('data', (message: string) => {
            console.log('---------- PLAYER OUTPUT ---------');
            console.log(message);
            console.log('----------------------------------');
        });
    }

    public sendData(data: string): void {
        this.log('server', data);
        this.playerProcess.stdin.write(data + os.EOL);
    }

    public log(writer: string, data: string) {
        if (this.loggers.console) {
            this.loggers.console.log(writer, data);
        }
        if (this.loggers.file) {
            this.loggers.file.log(writer, data);
        }
    }

    public abstract onPlayerData(data: string): void;

    public abstract onDisconnect(): void;
}

export default Client;