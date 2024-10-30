// https://ephemeral.cx/2014/09/a-dead-simple-webrtc-example/
var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;


function pageReady() {
    console.log('pageReady called');
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
    serverConnection = new WebSocket('ws://localhost:3434');
    serverConnection.onmessage = gotMessageFromServer;
    serverConnection.onopen = () => {console.log("Server connection is ready");}
    var constraints = {
        video : true
        // video: {"label": "Integrated Camera (30c9:00ad)"}
        //, audio: true,
    };

    console.log('Step#1 Calling navigator.getUserMedia');
    if(navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, getUserMediaError);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    console.log("Step#1 getUserMediaSuccess called")
    localStream = stream;
    localVideo.srcObject = stream;
    console.log("Step#1 getUserMediaSuccess completed successfully") 
}

function getUserMediaError(error) {
    console.log("Step#1 getUserMediaError called")
    console.error(error);
}

function start(isCaller) {
    if(isCaller) {
        console.log("Video started by user");
        console.log("Step#2 Creating RTCPeerConnection")
    } else {
        console.log("Video started by peer");
    }
    
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    
    setInterval(() => {
            console.log('RTCPeerConnection status ' + getRTCPeerConnectionStatusString(peerConnection));
    }, 5000)

    // An RTCIceCandidate has been identified
    peerConnection.onicecandidate = gotIceCandidate;
    
    //  addstream event is sent to an RTCPeerConnection when new media, in the form of a MediaStream object, has been added to it.
    peerConnection.onaddstream = gotRemoteStream;
    console.log("Adding local stream to RTCPeerConnection");
    peerConnection.addStream(localStream);

    if(isCaller) {
        console.log("Step#3 Creating SDP offer through signalling server")
        peerConnection.createOffer(gotDescription, createOfferError);
    }
    console.log("Returning from start method");
}

function gotDescription(description) {
    console.log('gotDescription called');
    peerConnection.setLocalDescription(description, function () {
        console.log(`Step#3 Sending SDP msg (${description.type}) to peers via signalling server`)
        serverConnection.send(JSON.stringify({'sdp': description}));
    }, function() {console.log('set description error')});
}

function createAnswerError(e){
    console.log('createAnswerError called' + e);
}

function gotIceCandidate(event) {
    console.log('gotIceCandidate called');
    if(event.candidate != null) {
        console.log("Step#3 Sending ICE candidate details to peers via signalling server")
        serverConnection.send(JSON.stringify({'ice': event.candidate}));
    }
}

function gotRemoteStream(event) {
    console.log('Step#5: gotRemoteStream called');
    remoteVideo.srcObject = event.stream;
}

function createOfferError(error) {
    console.log('Step#3 createOfferError');
    console.log(error);
}

function gotMessageFromServer(message) {
    console.log('Received message from signalling server');
    if(!peerConnection) {
        console.log('Initializing peer connection');
        start(false);
    }

    var signal = JSON.parse(message.data);
    if(signal.sdp) {
        console.log(`Step#4 Received SDP message (${signal.sdp.type}) from signalling server [method:gotMessageFromServer]`);
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
            if(signal.sdp.type == 'offer') {
                console.log("Creating answer for SDP offer");
                peerConnection.createAnswer(gotDescription, createAnswerError);
            }
        });
    } else if(signal.ice) {
        console.log('Step#4 Received ICE message from signalling server. Creating new ICE candidate and adding to local peer connection');
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
}

function getRTCPeerConnectionStatusString(rtcPeerConnection) {
    var statusString = "Connection Status: " + rtcPeerConnection.connectionState;
    statusString += "\n ICEConnectionState Status: " + rtcPeerConnection.iceConnectionState;
    statusString += "\n localDescription: " + rtcPeerConnection.localDescription;
    statusString += "\n remoteDescription: " + rtcPeerConnection.remoteDescription;
    statusString += "\n signalingState: " + rtcPeerConnection.signalingState;
    statusString += "\n iceGatheringState: " + rtcPeerConnection.iceGatheringState;
    statusString += "\n getConfiguration(): " + rtcPeerConnection.getConfiguration();
    statusString += "\n getStats(): " + rtcPeerConnection.getStats();
    // statusString += "\n signalingState: " + rtcPeerConnection.signalingState;
    return statusString;
    
}