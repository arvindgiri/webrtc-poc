# About the Project

A basic html client for streaming video from one client to another client.
Reference: // https://ephemeral.cx/2014/09/a-dead-simple-webrtc-example/

# Notes
Objective of this POC is to understand the WebRTC APIs of HTML5. 
This POC uses node.js as backend for serving the html client page (port 3000) for streaming video and also creates a basic signalling server over websocket (port 3434)

# Setup and Running POC
1. Go to server-and-client folder
2. Install node/npm and install all required modules
3. Run ./start-server.bat
4. Open http://localhost:3000 in two different browser tab/windows (Of same browser application otherwise one of the browser window may have issues in capturing Mic/Camera stream)
5. Click on 'Start Video' button
6. Videos should get shared across browser instances

