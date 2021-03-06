import Logger from "./Logger";
export default class FileLogger extends Logger {
    private file;
    constructor(file?: string);
    log(writer: string, text: string): void;
}
