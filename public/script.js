const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer = new Peer(undefined, {
    // secure: true,
    host: 'pj20.herokuapp.com',
    // path: '/myapp',
    // port: '443',
    key: 'peerjs'
})

const localVideo = document.createElement('video')
localVideo.muted = true
let myVideoStream
let count = 0
const peers = {}

//test
let currentPeer = [];
let userlist = [];
let cUser;
//test

// //enter name
let myName = prompt('Type Your Name');
// // let bar = confirm('Confirm or deny');
// console.log(YourName);

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(localVideo, "Me", "admin", stream)

    peer.on('call', call => {
        call.answer(stream)
        let myId = call.peer;
        const video = document.createElement('video')
        socket.emit('seruI')
        socket.on('all_users_inRoom', userList => {
            userList.forEach(e => {
                if(e.userId == myId){
                    call.on('stream', userVideoStream => {
                        addVideoStream(video, e.name, e.userId, userVideoStream)
                        //test
                        socket.emit('participants')
                        socket.on('participant-list', users =>{
                            removeAll()
                            users.forEach(e => {
                                appendParticipant(e.name)
                            })
                            console.log(users)
                        })
                        //test
                    })
                }
            });
        });
        currentPeer.push(call.peerConnection);
        console.log(call.peerConnection) //test
        //test2
    })
    
    //code for appending participants
    // socket.emit('participants')
    // socket.on('participant-list', users =>{
    //     removeAll()
    //     users.forEach(e => {
    //         appendParticipant(e.name)
    //     })
    //     console.log(users)
    // })

    socket.on('user-connected', (userId, name) => {
        setTimeout(() => {
            connectToNewUser(userId, name, stream)
        }, 1000)
        // count++
        console.log(name)
        // console.log(count)
        // adjust(count)
        console.log('user connected: ' + userId)
    })
})

socket.on('user-disconnected', user => {
    count--
    console.log(count)
    adjust(count)
    if (peers[user.userId]) peers[user.userId].close()
    console.log('user disconnected: ', user.userId)
    const left = document.getElementById(`${user.userId}`)
    left.parentNode.removeChild(left);
    // left.querySelectorAll('*').forEach(n => n.remove());
    // const user = document.getElementById(name)
    // user.remove()
    //test
    socket.emit('participants')
    socket.on('participant-list', users =>{
        removeAll()
        users.forEach(e => {
            appendParticipant(e.name)
        })
        console.log(users)
    })
    //test
})

peer.on('open', id => {
    cUser = id; //test
    console.log(cUser);
    socket.emit('join-room', room_id, id, myName)
})

function connectToNewUser(userId, name, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, name, userId, userVideoStream)
        //test
        socket.emit('participants')
        socket.on('participant-list', users =>{
            removeAll()
            users.forEach(e => {
                appendParticipant(e.name)
            })
            console.log(users)
        })
        //test
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
    currentPeer.push(call.peerConnection) //test
}

function addVideoStream(video, name, divId, stream) {
    if(document.getElementById(divId) == null){
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        let videoContainer = document.createElement('div')
        // videoContainer.setAttribute("id", name)
        videoContainer.setAttribute("id", divId)
        videoContainer.classList.add("video-container")
        videoContainer.append(video)
        let nameEl = document.createElement('div')
        // nameEl.setAttribute("id", name)
        nameEl.className = "userName"
        nameEl.innerHTML = name
        videoContainer.append(nameEl)
        videoGrid.append(videoContainer)
        count++
        console.log(count)
        adjust(count)
    }
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
    const html = `<i class="unmute fa fa-pause-circle"></i>
    <span class="unmute">Video On</span>`;
    document.getElementById("playStop").innerHTML = html;
}

const setOffButton = () => {
    const html = `<i class=" fa fa-video-camera"></i>
    <span class="">Video Off</span>`;
    document.getElementById("playStop").innerHTML = html;
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
    const html = `<i class="fa fa-microphone"></i>
    <span>Mute</span>`;
    document.getElementById("muteUnmute").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i class="unmute fa fa-microphone-slash"></i>
    <span class="unmute">Unmute</span>`;
    document.getElementById("muteUnmute").innerHTML = html;
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
    window.location = "/";
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

//size adjustment
function adjust(count) {
    [...document.getElementsByTagName('video')].forEach(e=>{
        if(count === 1 || count === 2 || count === 3){
            e.className = ''
            e.className = 'two'
        }
        if(count === 4 || count === 5 || count === 6){
            e.className = ''
            e.className = 'four'
        }
        if(count === 7 || count === 8 || count === 9 || count === 10){
            e.className = ''
            e.className = 'six'
        }
        if(count === 11 || count === 12 || count === 13 || count === 14){
            e.className = ''
            e.className = 'eight'
        }
    });
}


//chat message
const messageSend = document.getElementById('sendMsg')
const messageContainer = document.getElementById('allMessages')
const messageInput = document.getElementById('chat')
const userContainer = document.getElementById('names')
socket.emit('new-user', myName)
// appendParticipant(myName)
socket.on('chat-message', data =>{
    appendMessage(`${data.name}: ${data.message}`)
})

// socket.on('user-joined', name =>{
//     console.log(name)
//     appendParticipant(name)
// })

messageInput.addEventListener('keyup', function(event){
    if(event.keyCode === 13){
        event.preventDefault()
        messageSend.click()
    }
})
messageSend.addEventListener('click', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', message)
    messageInput.value = ''
}) 

function appendMessage(message){
    const messageElement = document.createElement('li')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}

function appendParticipant(name){
    const userElement = document.createElement('div')
    userElement.setAttribute("id", name+"-new")
    userElement.style.width = "250px"
    userElement.style.height = "20px"
    userElement.style.display = "flex"
    userElement.style.justifyContent = "space-between"
    userElement.style.margin = "10px 10px 10px 10px"
    const userName  = document.createElement('h6')
    userName.innerText = name
    userElement.append(userName)
    userContainer.append(userElement)
}

function removeAll(){
    const userList = document.getElementById('names')
    userList.querySelectorAll('*').forEach(n => n.remove());
}

//chat window open and close
var check = false;
function showChat(){
    const left = document.getElementById('left')
    const right = document.getElementById('right')
    if(check){
        left.classList.add('showChatLeft')
        right.classList.add('showChatRight')
        left.classList.remove('left')
        right.classList.remove('right')
        check = false
    }else{
        left.classList.remove('showChatLeft')
        left.classList.add('left')
        right.classList.add('right')
        right.classList.remove('showChatRight')
        check = true
    }
}

//meeting info open close
var check2 = true;
function showInfo(){
    const dropdownContent = document.getElementById('dropdown-content')
    if(check2){
        dropdownContent.style.display = "block"
        check2 = false
    }else{
        dropdownContent.style.display = "none"
        check2 = true
    }
}

//participants list open close
var check3 = true;
function showList(){
    const participantsList = document.getElementById('participantsList')
    if(check3){
        participantsList.style.display = "block"
        check3 = false
    }else{
        participantsList.style.display = "none"
        check3 = true
    }
}

//raise hand
const raiseHand = document.getElementById('raiseHandButton')
var check4 = true
socket.on('raise-hand', user =>{
    const border = document.getElementById(user.userId)
    if(check4){
        appendRaiseHand(user.name)
        border.style.border = "2px solid yellow"
        // border.style.boxShadow = "0 0 10px 5px yellow"
    }else{
        removeRaiseHand(user.name)
        border.style.border = "none"
        // border.style.boxShadow = "none"
    }
})
var check5 = false
raiseHand.addEventListener('click', e => {
    console.log(check5)
    if(check5){
        raiseHandUp()
    }else{
        raiseHandDown()
    }
    e.preventDefault()
    socket.emit('send-raise-hand')
})

function appendRaiseHand(name){
    check4 = false
    const position = document.getElementById(name+"-new")
    const hand = document.createElement('i')
    hand.setAttribute("class", "fa fa-hand-paper-o")
    hand.setAttribute("id", name+"-hand")
    hand.style.color = "#f1f1f1"
    // hand.innerText = 'raised'
    position.append(hand)
}

function removeRaiseHand(name){
    check4 = true
    const raiseHand = document.getElementById(name+"-hand")
    raiseHand.remove()
}

const raiseHandUp = () => {
    const html = `<i class="fa fa-hand-paper-o"></i>
    <span>Raise Up</span>`;
    document.getElementById("raiseHandButton").innerHTML = html;
    const tag = document.getElementById("raiseHandButton")
    tag.style.color = "white"
    check5 = false
}

const raiseHandDown = () => {
    const html = `<i class="fa fa-hand-paper-o"></i>
    <span>Raise Down</span>`;
    document.getElementById("raiseHandButton").innerHTML = html;
    const tag = document.getElementById("raiseHandButton")
    tag.style.color = "red"
    check5 = true
}

//glow around speaking candidate
var recognizing = true;
const audioButton = document.getElementById('muteUnmute')
// const admin = document.querySelector('.video-container')
// var check4 = true
if(!('webkitSpeechRecognition' in window)){
    upgrade()
}else{
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = false;
        console.log(true)
        // change(true)
    };

    recognition.onend = function() {
        recognizing = true;
        // admin.className = ''
        // admin.className = 'video-container none'
        socket.emit('remove-glow-around')
        glowOff()
        // change(false)
      };
    
      recognition.onresult = function(event) {
        console.log(event)
        console.log(true) 
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                // admin.className = ''
                // admin.className = 'video-container none'
                socket.emit('remove-glow-around')
                glowOff()
            } else {
                // admin.className = ''
                // admin.className = 'video-container test'
                socket.emit('send-glow-around')
                glowOn()
            }
        }
        // change(true)
    };
}
socket.on('glow-around', user =>{
    const border = document.getElementById(user.userId)
    border.style.border = "2px solid blue"
    // border.style.boxShadow = "0 0 10px 5px green"
})

socket.on('no-glow-around', user => {
    const border = document.getElementById(user.userId)
    if(border)
    border.style.border = "none"
    // border.style.boxShadow = "none"
})

audioButton.addEventListener('click', e => {
    if (recognizing == false) {
        recognition.stop();
        return;
    }else{
        recognition.start();
    }
    // e.preventDefault()
    // socket.emit('send-glow-around')
})
if(recognizing){
    recognition.start();
}

function glowOff(){
    const admin = document.querySelector('#admin')
    admin.style.border = "none"
    // admin.style.boxShadow = "none"
}

function glowOn(){
    const admin = document.querySelector('#admin')
    admin.style.border = "2px solid blue"
    // admin.style.boxShadow = "0 0 10px 5px green"
}


