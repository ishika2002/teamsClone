const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer =  new Peer(undefined, {
    host: '/',
    port: '3001'
})

const localVideo = document.createElement('video')
localVideo.muted = true
let myVideoStream
const peers = {}

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
    })

    socket.on('user-connected', userId => {
        setTimeout(() => {
          connectToNewUser(userId, stream)
        }, 1000)
        console.log('user connected: '+userId)
      })
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
    console.log('user disconnected: ', userId)
})

peer.on('open', id => {
    socket.emit('join-room', room_id, id)
})

function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const muteUnmute = document.getElementById('muteUnmute');
const playStop = document.getElementById('playStop');

playStop.onclick = async() => {
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
  
  muteUnmute.onclick = async() => {
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

//leave meeting
const disconnect = document.getElementById('disconnect');

disconnect.onclick = async() => {
    window.location = "http://localhost:3000/";   
}

