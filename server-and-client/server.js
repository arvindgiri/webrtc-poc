//Example taken from: https://ephemeral.cx/2014/09/a-dead-simple-webrtc-example/

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);

server.listen(3000, () => {
  console.log('Http server started on port 3000');
});

const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({port: 3434});

wss.on('connection', function(ws) {
    const sessionId = Math.random().toString(36).substring(2, 9);
    console.log(`Client connected with session ID: ${sessionId}`);
    ws.on('message', function(message) {
        console.log('session: %s, received: %s', sessionId, message);
        wss.clients.forEach(client => {
            console.log("Sending message to client: " + client);
            if (client !== ws) {
                if(client.readyState === WebSocket.OPEN) {
                console.log("Sending following message to client: " + message);
                client.send(""+message);
                } else {
                    console.log("Client not connected: " + client.readyState);
                }
            }else {
                console.log("Ignoring returning message to sender");
            }
          });
    });
});

console.log('Websocket server started on port 3434');

