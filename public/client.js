function showRooms() {
    const roomContainer1 = document.getElementById('room-container1')
    roomContainer1.style.display = "block"
}

function joinRooms() {
    const roomContainer2 = document.getElementById('room-container2')
    const roomContainer1 = document.getElementById('room-container1')
    roomContainer1.style.display = "none"
    roomContainer2.style.display = "block"
}

function cross(){
    const roomContainer2 = document.getElementById('room-container2')
    roomContainer2.style.display = "none"
}

if (isRoom) {
    const socket = io('/')

    const joinRoom = document.getElementById('roomButton')
    const msgInput = document.getElementById('msgInput')
    const roomInput = document.getElementById('roomInput')
    const sendMsg = document.getElementById('sendMsg')


    socket.on('receive-message', message => {
        console.log(message)
        displayMessage(message, true)
    })

    sendMsg.addEventListener('click', e => {
        e.preventDefault()
        const message = msgInput.value
        const room = room_id;
        if (message === "") return
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const d = new Date();
        const timeStamp = d.getDate() + " " + months[d.getMonth()] + "," + d.getHours() + ":" + d.getMinutes();
        displayMessage({message, name, ts: timeStamp}, false)
        socket.emit('send-message', false, {message: message, name: name}, room)

        msgInput.value = ""
    })

    msgInput.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault()
            sendMsg.click()
        }
    })

    socket.emit('join-room-chats', room_id)

    function displayMessage(message, check) {
        const text = document.createElement('div')
        text.setAttribute('class', 'text')
        text.textContent = message.message

        const name = document.createElement('div')
        name.setAttribute('class', 'name')
        name.textContent = message.name


        const time = document.createElement('div')
        time.setAttribute('class', 'time')
        time.textContent = message.ts;

        const mainDiv = document.createElement('div')
        mainDiv.append(text, name, time);
        
        if(check){
            mainDiv.setAttribute('class', 'msg left')
        }else{
            mainDiv.setAttribute('class', 'msg right')
        }
        document.getElementById('chatMessage').prepend(mainDiv);
    }

    function joinMeet() {
        window.location = "/" + room_id;
    }

    function copyRoomId(){
        var share = document.createElement('input')
        document.body.appendChild(share);
        share.value = room_id;
        share.select();
        document.execCommand('copy');
        document.body.removeChild(share);
        alert('Room Id Copied');
    }
}