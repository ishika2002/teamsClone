const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const peer = new Peer(undefined, {
    secure: true,
    host: 'pj20.herokuapp.com',
    port: '443',
    key: 'peerjs'
})

const localVideo = document.createElement('video')
localVideo.muted = true
let myVideoStream
let count = 0
const peers = {}

let currentPeer = [];
let userlist = [];
let cUser;


//enter name
let myName = name;


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(localVideo, "Me", "admin", stream)

    peer.on('call', call => {
        socket.emit('seruI')
        socket.on('all_users_inRoom', userList => {
            userList.forEach(e => {
                call.answer(stream)
                let myId = call.peer;
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    if(e.userId == myId)
                    addVideoStream(video, e.name, e.userId, userVideoStream)
                    
                    socket.emit('participants')
                    socket.on('participant-list', users =>{
                        removeAll()
                        users.forEach(e => {
                            appendParticipant(e.name)
                        })
                        console.log(users)
                    })
                });
            });
        })
        currentPeer.push(call.peerConnection)
    })

    socket.on('user-connected', (userId, name) => {
        setTimeout(() => {
            connectToNewUser(userId, name, stream)
        }, 1000)
        
        console.log(name)
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
    socket.emit('participants')
    socket.on('participant-list', users =>{
        removeAll()
        users.forEach(e => {
            appendParticipant(e.name)
        })
        console.log(users)
    })
})

peer.on('open', id => {
    cUser = id; 
    console.log(cUser);
    socket.emit('join-room', room_id, id, myName)
})

function connectToNewUser(userId, name, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, name, userId, userVideoStream)
        socket.emit('participants')
        socket.on('participant-list', users =>{
            removeAll()
            users.forEach(e => {
                appendParticipant(e.name)
            })
            console.log(users)
        })
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
    currentPeer.push(call.peerConnection)
    console.log("sahi jaa rha hai!", call) 
}

function addVideoStream(video, name, divId, stream) {
    if(document.getElementById(divId) == null){
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        let videoContainer = document.createElement('div')
        videoContainer.setAttribute("id", divId)
        videoContainer.classList.add("video-container")
        videoContainer.append(video)
        let nameEl = document.createElement('div')
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
    const html = `<i class="bi bi-camera-video-off-fill unmute"></i>
    <span class="unmute">Video On</span>`;
    document.getElementById("playStop").innerHTML = html;
}

const setOffButton = () => {
    const html = `<i class="bi bi-camera-video-fill"></i>
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
    const html = `<i class="bi bi-mic-fill"></i>
    <span>Mute</span>`;
    document.getElementById("muteUnmute").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i class="bi bi-mic-mute-fill unmute"></i>
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

//leave meeting
const disconnect = document.getElementById('disconnect');

disconnect.onclick = async () => {
    window.location = "/chat";
}

//screen share
const scShare = document.getElementById('screenShare')
socket.on('share-screen', user => {
    console.log('sharing started')
    const pscreen = document.getElementById(user.userId)
    const cscreen = pscreen.childNodes[0]
    const cl = cscreen.getAttribute("class")
    console.log(cl)
    cscreen.style.height = "auto"
    cscreen.style.width = "1000px"
})
scShare.addEventListener('click', e => {
    e.preventDefault()
    socket.emit('send-share-screen')
})

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
            sender.replaceTrack(videoTrack);
        }

    })
}

socket.on('stop-share-screen', user => {
    console.log('sharing stopped')
    const pscreen = document.getElementById(user.userId)
    const cscreen = pscreen.childNodes[0]
    const cl = cscreen.getAttribute("class")
    console.log(cl)
    cscreen.removeAttribute("style")    
})

function stopScreenShare() {
    socket.emit('remove-share-screen')
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
        if(count === 1 || count === 2){
            e.className = ''
            e.className = 'two'
        }
        if(count === 3 || count === 4 || count === 5 || count === 6){
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

socket.on('receive-message', data =>{
    appendMessage(`${data.name}: ${data.message}`)
})

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
    socket.emit('send-message', true, {message, name: myName}, room_id)
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
        border.style.border = "2px solid #F7FD04"
    }else{
        removeRaiseHand(user.name)
        border.style.border = "none"
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
    hand.setAttribute("class", "bi bi-hand-index-fill")
    hand.setAttribute("id", name+"-hand")
    hand.style.color = "#f1f1f1"
    position.append(hand)
}

function removeRaiseHand(name){
    check4 = true
    const raiseHand = document.getElementById(name+"-hand")
    raiseHand.remove()
}

const raiseHandUp = () => {
    const html = `<i class="bi bi-hand-index-fill"></i>
    <span>Raise Up</span>`;
    document.getElementById("raiseHandButton").innerHTML = html;
    const tag = document.getElementById("raiseHandButton")
    tag.style.color = "white"
    check5 = false
}

const raiseHandDown = () => {
    const html = `<i class="bi bi-hand-index-fill"></i>
    <span>Raise Down</span>`;
    document.getElementById("raiseHandButton").innerHTML = html;
    const tag = document.getElementById("raiseHandButton")
    tag.style.color = "red"
    check5 = true
}

//glow around speaking candidate
var recognizing = true;
const audioButton = document.getElementById('muteUnmute')

if(!('webkitSpeechRecognition' in window)){
    upgrade()
}else{
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = false;
        console.log(true)
    };

    recognition.onend = function() {
        recognizing = true;
        socket.emit('remove-glow-around')
        glowOff()
      };
    
      recognition.onresult = function(event) {
        console.log(event)
        console.log(true) 
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                socket.emit('remove-glow-around')
                glowOff()
            } else {
                socket.emit('send-glow-around')
                glowOn()
            }
        }
    };
}
socket.on('glow-around', user =>{
    const border = document.getElementById(user.userId)
    border.style.border = "2px solid #23049D"
})

socket.on('no-glow-around', user => {
    const border = document.getElementById(user.userId)
    if(border)
    border.style.border = "none"
})

audioButton.addEventListener('click', e => {
    if (recognizing == false) {
        recognition.stop();
        return;
    }else{
        recognition.start();
    }
})
if(recognizing){
    recognition.start();
}

function glowOff(){
    const admin = document.querySelector('#admin')
    admin.style.border = "none"
}

function glowOn(){
    const admin = document.querySelector('#admin')
    admin.style.border = "2px solid #23049D"
}

//record screen
let shouldStop = false;
let stopped = false;
const stopButton = document.getElementById('stop')
function startRecord() {
    console.log('recording started')
    const downloadLink = document.getElementsByClassName('header1')[0]
    const stopDiv = document.getElementsByClassName('header2')[0]
    const record = document.getElementById('record')
    record.disabled = true
    stopDiv.style.display = 'flex'
    downloadLink.style.display = 'none'
}
function stopRecord() {
    const downloadLink = document.getElementsByClassName('header1')[0]
    const stopDiv = document.getElementsByClassName('header2')[0]
    const record = document.getElementById('record')
    record.disabled = false
    stopDiv.style.display = 'none'
    downloadLink.style.display = 'flex'
}

const audioRecordConstraints = {
    echoCancellation: true
}

stopButton.addEventListener('click', function () {
    shouldStop = true;
});

const handleRecord = function ({stream, mimeType}) {
    startRecord()
    let recordedChunks = [];
    stopped = false;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }

        if (shouldStop === true && stopped === false) {
            mediaRecorder.stop();
            stopped = true;
        }
    };

    mediaRecorder.onstop = function () {
        const downButton = document.getElementById('download')
        const blob = new Blob(recordedChunks, {
            type: mimeType
        });
        recordedChunks = []
        const filename = window.prompt('Enter file name');
        downButton.href = URL.createObjectURL(blob);
        downButton.download = `${filename || 'recording'}.webm`;
        stopRecord();
    };

    mediaRecorder.start(200);
};

async function recordScreen() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
        video: {
            cursor: 'motion'
        }
    };
    if(!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
        return window.alert('Screen Record not supported!')
    }
    let stream = null;
    const displayStream = await navigator.mediaDevices.getDisplayMedia({video: {cursor: "motion"}, audio: {'echoCancellation': true}});
    if(window.confirm("Record audio with screen?")){
        const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: {'echoCancellation': true}, video: false });
        let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
        stream = new MediaStream(tracks);
        handleRecord({stream, mimeType})
    } else {
        stream = displayStream;
        handleRecord({stream, mimeType});
    };
}

const cross = document.getElementsByClassName('icons')[0]
cross.addEventListener('click', function(){
    const downloadLink = document.getElementsByClassName('header1')[0]
    downloadLink.style.display = 'none'
})
