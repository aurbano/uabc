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
var io = require("socket.io-client");
var ioProxy = require("socket.io-proxy");
var Client_1 = require("./model/Client");
var OnlineClient = (function (_super) {
    __extends(OnlineClient, _super);
    function OnlineClient(options) {
        var _this = _super.call(this, options) || this;
        console.log();
        console.log('Waiting for server...');
        console.log();
        try {
            var host = options.host || 'localhost:3141';
            if (host.substr(0, 4) !== 'http') {
                host = 'http://' + host;
            }
            var socketOptions = {
                query: "token=" + options.token
            };
            if (options.proxy || process.env.http_proxy) {
                if (options.proxy) {
                    ioProxy.init(options.proxy);
                }
                _this.socket = ioProxy.connect(host, socketOptions);
            }
            else {
                _this.socket = io.connect(host, socketOptions);
            }
            _this.socket.on('error', function (data) {
                console.error('Error in socket', data);
            });
            _this.socket.on('connect', function () {
                console.log('Connected! Joining Lobby...');
                _this.socket.emit('lobby join', {
                    token: options.lobby
                });
            });
            _this.socket.on('lobby joined', function () {
                console.log('Lobby Joined!');
            });
            _this.socket.on('lobby exception', function (data) {
                console.error(data.error);
            });
            _this.socket.on('game', function (data) {
                if (data.action && data.action.length > 0) {
                    var parts = data.action.split(' ');
                    if (parts[0] === 'end') {
                        console.log('Games ended! You ' + parts[1]);
                    }
                    else {
                        _this.sendData(data.action);
                    }
                }
            });
            _this.socket.on('disconnect', function () {
                console.log('Connection lost!');
            });
        }
        catch (e) {
            console.error('Error in UABC', e);
            process.exit(-1);
        }
        return _this;
    }
    OnlineClient.prototype.onPlayerData = function (data) {
        this.socket.emit('game', data);
    };
    OnlineClient.prototype.onDisconnect = function () {
        this.socket.disconnect();
    };
    return OnlineClient;
}(Client_1["default"]));
exports["default"] = OnlineClient;
