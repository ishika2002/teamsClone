const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const localVideo = document.createElement('video')
localVideo.muted = true
let myVideoStream
let count = 1
const peers = {}

//test
let currentPeer = [];
let userlist = [];
let cUser;
//test

// //enter name
// let YourName = prompt('Type Your Name');
// // let bar = confirm('Confirm or deny');
// console.log(YourName);

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(localVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        currentPeer.push(call.peerConnection);
        console.log(call.peerConnection) //test
    })

    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
            count++
            console.log(count)
            adjust(count)
        }, 1000)
        console.log('user connected: ' + userId)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    console.log('user disconnected: ', userId)
    count--
    console.log(count)
    adjust(count)
})

peer.on('open', id => {
    cUser = id; //test
    socket.emit('join-room', room_id, id)
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
    currentPeer.push(call.peerConnection) //test
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    let videoContainer = document.createElement('div')
    videoContainer.classList.add("video-container")
    videoContainer.append(video)
    videoGrid.append(videoContainer)
}

const muteUnmute = document.getElementById('muteUnmute');
const playStop = document.getElementById('playStop');

playStop.onclick = async () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setOnButton();
    } else {
        setOffButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setOnButton = () => {
    const html = `
      <span>Video On</span>
    `
    document.getElementById('playStop').innerHTML = html;
}

const setOffButton = () => {
    const html = `
      <span>Video Off</span>
    `
    document.getElementById('playStop').innerHTML = html;
}

// mute and unmute

muteUnmute.onclick = async () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
      <span>Mute</span>
    `
    document.getElementById('muteUnmute').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
      <span>Unmute</span>
    `
    document.getElementById('muteUnmute').innerHTML = html;
}

//share room code
const copy = () => {
    var copy = document.getElementById('meetingId')
    copy.select();
    document.execCommand('copy');
    alert('Room Code Copied')
}

//share meeting link
const share = () => {
    var share = document.createElement('input'),
        text = window.location.href;

    console.log(text);
    document.body.appendChild(share);
    share.value = text;
    share.select();
    document.execCommand('copy');
    document.body.removeChild(share);
    alert('Meeting Link Copied');
}

//screen sharing
//   const shareScreen = document.getElementById('shareScreen')
//   const video = document.createElement('video');
//   video.setAttribute("id", "screenShare")

//   function handleSuccess(stream) {
//     startButton.disabled = true;
//     // const video = document.querySelector('video');
//     video.srcObject = stream
//     video.addEventListener('loadedmetadata', () => {
//         video.play()
//     })
//     shareScreen.append(video)

//     // demonstrates how to detect that the user has stopped
//     // sharing the screen via the browser UI.
//     stream.getVideoTracks()[0].addEventListener('ended', () => {
//         startButton.disabled = false;
//         video.remove()
//         video.srcObject = null;
//     });
//   }

//   function handleError(error) {
//     errorMsg(`getDisplayMedia error: ${error.name}`, error);
//   }

//   function errorMsg(msg, error) {
//     const errorElement = document.querySelector('#errorMsg');
//     errorElement.innerHTML += `<p>${msg}</p>`;
//     if (typeof error !== 'undefined') {
//       console.error(error);
//     }
//   }

//   const startButton = document.getElementById('startButton');
//   startButton.addEventListener('click', () => {
//     navigator.mediaDevices.getDisplayMedia({video: true})
//         .then(handleSuccess, handleError);
//   });

//   if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
//     startButton.disabled = false;
//   } else {
//     errorMsg('getDisplayMedia is not supported');
//   }

//   function addShareStream(video, stream){
//     video.srcObject = stream
//     video.addEventListener('loadedmetadata', () => {
//         video.play()
//     })
//     shareScreen.append(video)
// }

// function connectToNewScreen(userId, stream){
//     const call = peer.call(userId, stream)
//     const video = document.createElement('video')
//     call.on('stream', userVideoStream => {
//         addShareStream(video, userVideoStream)
//     })
//     call.on('close', () => {
//         video.remove()
//     })
// }

//leave meeting
const disconnect = document.getElementById('disconnect');

disconnect.onclick = async () => {
    window.location = "http://localhost:3000/";
}

//screen share
const screenshare = () => {
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: 'always'
        },
        audio: {
            echoCancellation: true,
            noiseSupprission: true
        }

    }).then(stream => {
        let videoTrack = stream.getVideoTracks()[0];
        localVideo.srcObject = stream;
        videoTrack.onended = function () {
            stopScreenShare();
        }
        for (let x = 0; x < currentPeer.length; x++) {

            let sender = currentPeer[x].getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            //    console.log(sender);
            //    console.log("current peer")
            //    console.log(currentPeer)
            sender.replaceTrack(videoTrack);
            //    localVideo.classList.add('fullScreen')
        }

    })
}

function stopScreenShare() {
    let videoTrack = myVideoStream.getVideoTracks()[0];
    localVideo.srcObject = myVideoStream;
    for (let x = 0; x < currentPeer.length; x++) {
        let sender = currentPeer[x].getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack);
    }
}

//remove user
function adjust(count) {
    const screens = document.getElementsByClassName('video-container').forEach(e => {
        if (count === 2) {
            e.className = 'video-container'
            e.classList.add("two")
        }

        if (count === 4) {
            e.className = 'video-container'
            e.classList.add("four")
        }

        if (count === 6) {
            e.className = 'video-container'
            e.classList.add("six")
        }

        if (count === 8) {
            e.className = 'video-container'
            e.classList.add("eight")
        }
    });
}
