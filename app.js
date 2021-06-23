const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const userS = [], userI = []

app.set('view engine', 'ejs')
app.use(express.static('public'))

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
    socket.on('join-room', (roomId, userId) => {
        
        //test
        userS.push(socket.id);
		userI.push(userId);
        //test

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        //remove user
        socket.on('removeUser', (sUser, rUser)=>{
	    	var i = userS.indexOf(rUser);
	    	if(sUser == userI[0]){
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
            socket.broadcast.to(roomId).emit('user-disconnected', userI[i]);
            //update array
           
            userI.splice(i, 1);
	    });
	    socket.on('seruI', () =>{
	    	socket.emit('all_users_inRoom', userI);
			//console.log(userS);
		    console.log(userI);
	    });
        //disconnect
        // socket.on('disconnect', () => {
        //     socket.broadcast.to(roomId).emit('user-disconnected', userId)
        // })
    })
})
server.listen(3000)