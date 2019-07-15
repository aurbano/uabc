import * as io from "socket.io-client";
import * as ioProxy from "socket.io-proxy";

import { LegacyEvents, Messages } from "@socialgorithm/model";
import { EventName } from "@socialgorithm/model/dist/Events";
import { IOptions } from "../cli/options";
import OnlinePlayer from "../player/Online";
import Client from "./Client";

/**
 * Online Player mode
 * It will connect to the server and send all player commands over the socket
 */
export default class OnlineClient extends Client {
    protected playerB: OnlinePlayer;

    /**
     * Main socket for communication with the tournament server
     */
    private socket: SocketIOClient.Socket;

    /**
     * Support handing off to a game server
     */
    private gameServerSocket: SocketIOClient.Socket;
    private gameServerHost: string = null;

    constructor(options: IOptions) {
        super(options);

        console.log(`Starting Online Mode`);
        console.log(`Player A: ${this.options.file}`);

        console.log();
        console.log("Waiting for server...");
        console.log();

        // Spawn the opponent (server)
        try {
            let host = options.host || "localhost:3141";
            if (host.substr(0, 4) !== "http") {
                host = "http://" + host;
            }
            const socketOptions = {
                query: "token=" + options.token,
            };

            this.socket = this.connect(host, socketOptions);

            // this.playerB = new OnlinePlayer(this.socket, this.onPlayerBData.bind(this));

            this.socket.on("error", (data: any) => {
                console.error("Error in socket", data);
            });

            this.socket.on("connect", () => {
                console.log(`Connected! Joining Lobby "${options.lobby}"...`);
                this.socket.emit(LegacyEvents.EVENTS.LOBBY_JOIN, {
                    token: options.lobby,
                });
            });

            this.socket.on("lobby joined", () => {
                console.log("Lobby Joined! Waiting for match...");
            });

            this.socket.on("exception", (data: any) => {
                console.error(data.error);
                process.exit(-1);
            });

            this.socket.on(LegacyEvents.EVENTS.LOBBY_EXCEPTION, (data: any) => {
                console.error(data.error);
                process.exit(-1);
            });

            this.socket.on(EventName.GameServerHandoff, (data: Messages.GameServerHandoffMessage) => {
                console.log(`Initiating handoff to Game Server ${data.gameServerAddress}, token = ${data.token}`);

                // Initiate a handoff to the game server
                const socketOptions = {
                    query: "token=" + data.token,
                };

                if (this.gameServerHost !== data.gameServerAddress) {
                    this.gameServerSocket = this.connect(data.gameServerAddress, socketOptions);
                    this.gameServerHost = data.gameServerAddress;

                    this.gameServerSocket.on("error", (data: any) => {
                        console.error("Error in game server socket", data);
                    });
        
                    this.gameServerSocket.on("connect", () => {
                        console.log(`Connected to Game Server, waiting for next game to begin`);
                    });

                    if (!this.playerB) {
                        this.playerB = new OnlinePlayer(this.socket, this.onPlayerBData.bind(this));
                    } else {
                        this.playerB.setSocket(this.gameServerSocket);
                    }
                }
            });

            this.socket.on("disconnect", () => {
                console.log("Connection to Tournament Server lost!");
            });
        } catch (e) {
            console.error("uabc error:", e);
            process.exit(-1);
        }
    }

    public onPlayerAData(data: string) {
        this.log("A", data);
        if (this.gameServerSocket) {
            this.gameServerSocket.emit(EventName.Game__Player, data);
        }
    }

    public onPlayerBData(data: string) {
        this.log("B", data);
        this.playerA.sendData(data);
    }

    private connect(host: string, socketOptions?: any): SocketIOClient.Socket {
        if (this.options.proxy || process.env.http_proxy) {
            if (this.options.proxy) {
                ioProxy.init(this.options.proxy);
            }
            return ioProxy.connect(host, socketOptions);
        } else {
            return io.connect(host, socketOptions);
        }
    }
}
