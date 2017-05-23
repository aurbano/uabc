"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var fs = require("fs");
var os = require("os");
var Logger_1 = require("../model/Logger");
var FileLogger = (function (_super) {
    __extends(FileLogger, _super);
    function FileLogger(file) {
        var _this = _super.call(this) || this;
        _this.file = file;
        fs.writeFile(_this.file, '', { flag: 'w' }, function (err) {
            if (err)
                throw err;
            console.log("Logging to file: " + _this.file);
        });
        return _this;
    }
    FileLogger.prototype.log = function (writer, text) {
        var time = (new Date()).toTimeString().substr(0, 8);
        fs.appendFile(this.file, '[' + time + ' ' + writer + '] ' + text + os.EOL, function (err) {
            console.error('Error: Unable to write to log file', err);
        });
    };
    return FileLogger;
}(Logger_1["default"]));
exports["default"] = FileLogger;
//# sourceMappingURL=FileLogger.js.map