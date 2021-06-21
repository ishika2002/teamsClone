const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer =  new Peer(undefined, {
    host: '/',
    port: '3001'
})

const localVideo = document.createElement('video')
localVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
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
