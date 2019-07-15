import { EventName } from "@socialgorithm/model/dist/Events";
import Player from "./Player";

/**
 * Online Player mode
 * It will connect to the server and send all player commands over the socket
 */
export default class OnlinePlayer extends Player {
    constructor(private socket: SocketIOClient.Socket, onPlayerData: (data: string) => void) {
        super(onPlayerData);

        this.socket.on(EventName.Game__Player, this.onServerData);
    }

    public setSocket(socket: SocketIOClient.Socket) {
        this.socket = socket;
        this.socket.on(EventName.Game__Player, this.onServerData);
    }

    protected onReceiveData(data: string) {
        this.socket.emit(EventName.Game__Player, data);
    }

    private onServerData = (data: string) => {
        if (data && data.length > 0) {
            const parts = data.split(" ");
            if (parts[0] === "end") {
                console.log("Game ended! You " + parts[1]);
            } else {
                this.onPlayerData(data);
            }
        } else {
            console.log("uabc: invalid data format received, it should be a string", data);
        }
    }
}
