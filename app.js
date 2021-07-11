const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const userS = [], userI = []
const msg = {}
const { PeerServer } = require('peer');

const peerServer = PeerServer({
    debug: true,
    path: "/myapp",
    port: 9000,
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)

app.get('/create', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, name) => {

        //test
        userS.push(socket.id);
		userI.push({userId, name});
        //test

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId, name)

        //remove user
        socket.on('removeUser', (sUser, rUser)=>{
	    	var i = userS.indexOf(rUser);
	    	if(sUser == userI[0].userId){
	    	  console.log("SuperUser Removed"+rUser);
	    	  socket.broadcast.to(roomId).emit('remove-User', rUser);
	    	}
	    });
        //remove user

        //disconnect
        socket.on('disconnect', () =>{
	    	var i = userS.indexOf(socket.id);
	    	userS.splice(i, 1);
            socket.broadcast.to(roomId).emit('user-disconnected', {userId:userI[i].userId, name: userI[i].name});
            //update array
            userI.splice(i, 1);
	    });

	    socket.on('seruI', () =>{
            console.log(userI)
	    	socket.emit('all_users_inRoom', userI);
			//console.log(userS);
		    console.log(userI);
	    });
        //disconnect
        
        socket.on('participants', () => {
            socket.emit('participant-list', userI)
        })
    })

    socket.on('new-user', name => {
        msg[socket.id] = name
        console.log(name)
    })

    socket.on('send-chat-message', message => {
        console.log(msg[socket.id])
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('chat-message', {message: message, name: userI[i].name})
    })

    socket.on('send-raise-hand', () => {
        console.log(msg[socket.id])
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('raise-hand', {userId: userI[i].userId, name: userI[i].name})
    })
   
    socket.on('send-glow-around', () => {
        console.log(msg[socket.id]+" glow")
        var i = userS.indexOf(socket.id);
        if(i!=-1){
            socket.broadcast.emit('glow-around', {userId: userI[i].userId, name: userI[i].name})
        }
    })

    socket.on('remove-glow-around', () => {
        console.log(msg[socket.id]+" no glow")
        var i = userS.indexOf(socket.id);
        if(i!=-1){
            socket.broadcast.emit('no-glow-around', {userId: userI[i].userId, name: userI[i].name})
        }
    })

    socket.on('send-share-screen', () => {
        console.log('screen shared')
        var i = userS.indexOf(socket.id);
        console.log(i)
        socket.broadcast.emit('share-screen', {userId: userI[i].userId, name: userI[i].name})
    })

    socket.on('remove-share-screen', () => {
        console.log("screen removed")
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('stop-share-screen', {userId: userI[i].userId, name: userI[i].name})
    })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT)