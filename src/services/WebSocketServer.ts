import WebSocket from 'ws';

export class WebSocketServer {
    public wss: WebSocket.Server;
    public client: any;
    constructor(port: number) {
        this.wss = new WebSocket.Server({
            port,
            perMessageDeflate: false,
        });

        this.wss.on('connection', (ws, request, client) => {
            console.log('wss connected!');
            this.client = request.client;
            ws.on('message', (msg: any) => {
                console.log(`Received message ${msg} from user ${client}`);
            });
        });
    }
}
