const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const userS = [], userI = []
const msg = {}
const { PeerServer } = require('peer');
// const fs = require('fs')

const peerServer = PeerServer({
    debug: true,
    path: "/myapp",
    port: 9000,
    // ssl:{
    //     key: fs.readFileSync('./config/cert.key', 'utf8'),
    //     cert: fs.readFileSync('./config/cert.csr', 'utf8')
    // }
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

        //message in room
        socket.on('message', (message,yourName) =>{
			io.to(roomId).emit('createMessage',message,yourName);
			
		})
        //mesaage in room

        //disconnect
        socket.on('disconnect', () =>{
	    	//userS.filter(item => item !== userId);
	    	var i = userS.indexOf(socket.id);
	    	userS.splice(i, 1);
            // socket.broadcast.to(roomId).emit('user-disconnected', userI[i].userId);
            socket.broadcast.to(roomId).emit('user-disconnected', {userId:userI[i].userId, name: userI[i].name});
            //update array
            userI.splice(i, 1);
	    });
        // socket.broadcast.to(roomId).emit('userList', userI);
	    socket.on('seruI', () =>{
            console.log(userI)
	    	socket.emit('all_users_inRoom', userI);
			//console.log(userS);
		    console.log(userI);
	    });
        //disconnect
        // socket.on('disconnect', () => {
        //     socket.broadcast.to(roomId).emit('user-disconnected', userId)
        // })

        // socket.on('new-user', name => {
        //     msg[socket.id] = name
        //     console.log(name)
        //     socket.broadcast.emit('user-joined', "hello")
        // })

        // socket.on('send-chat-message', message => {
        //     console.log(msg[socket.id])
        //     socket.broadcast.emit('chat-message', {message: message, name: msg[socket.id]})
        // })

        socket.on('participants', () => {
            socket.emit('participant-list', userI)
        })
    })

    socket.on('new-user', name => {
        msg[socket.id] = name
        console.log(name)
        // socket.broadcast.emit('user-joined', name)
    })

    socket.on('send-chat-message', message => {
        console.log(msg[socket.id])
        // socket.broadcast.emit('chat-message', {message: message, name: msg[socket.id]})
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('chat-message', {message: message, name: userI[i].name})
    })

    //test
    socket.on('send-raise-hand', () => {
        console.log(msg[socket.id])
        // socket.broadcast.emit('raise-hand', msg[socket.id])
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('raise-hand', {userId: userI[i].userId, name: userI[i].name})
    })
    //test

    //test
    socket.on('send-glow-around', () => {
        console.log(msg[socket.id]+" glow")
        // socket.broadcast.emit('raise-hand', msg[socket.id])
        var i = userS.indexOf(socket.id);
        if(i!=-1){
            socket.broadcast.emit('glow-around', {userId: userI[i].userId, name: userI[i].name})
        }
    })

    socket.on('remove-glow-around', () => {
        console.log(msg[socket.id]+" no glow")
        // socket.broadcast.emit('raise-hand', msg[socket.id])
        var i = userS.indexOf(socket.id);
        // console.log(i)
        if(i!=-1){
            socket.broadcast.emit('no-glow-around', {userId: userI[i].userId, name: userI[i].name})
        }
    })
    //test

    //test
    socket.on('send-share-screen', () => {
        console.log('screen shared')
        var i = userS.indexOf(socket.id);
        console.log(i)
        socket.broadcast.emit('share-screen', {userId: userI[i].userId, name: userI[i].name})
    })
    //test

    socket.on('remove-share-screen', () => {
        console.log("screen removed")
        var i = userS.indexOf(socket.id);
        // console.log(i)
        socket.broadcast.emit('stop-share-screen', {userId: userI[i].userId, name: userI[i].name})
    })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT)