const express = require('express');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)

const mongoose = require('mongoose');
const session = require('express-session')({
    secret: 'FA$alPrjid39 (112cookieNSessKey)',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 24 * 5 * 1000
    }
});

const MONGODB_URI = require('./mongoURI');

const Room = require('./models/room');

// const { v4: uuidV4 } = require('uuid')
const userS = [], userI = []
const msg = {}
const { PeerServer } = require('peer');

const peerServer = PeerServer({
    debug: true,
    path: "/myapp",
    port: 9000,
})

//Using ejs as View Engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

//Routes
const authRoutes = require('./routes/auth');
const webRoutes = require('./routes/web');

app.use(express.urlencoded({ extended: true }));
app.use(session);

//Using Routes
app.use(authRoutes);
app.use(webRoutes);

//Landing Page
app.get('/', (req, res) => {
    res.render('home');
});

//404 Handler
app.use((req, res) => {
    res.render('error', { pageTitle: 'Error : 404', errorCode: '404', errorDescription: 'Page Not Found' });
});

//sockets
const userIo = io.of('/')

userIo.on('connection', socket => {

    
    socket.on('join-room-chats', room => {
        console.log(socket.id)
        console.log(room)
        socket.join(room)
    })

    socket.on('join-room', (roomId, userId, name) => {

        //test
        userS.push(socket.id);
        userI.push({ userId, name });
        //test

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId, name)

        //disconnect
        socket.on('disconnect', () => {
            var i = userS.indexOf(socket.id);
            userS.splice(i, 1);
            socket.broadcast.to(roomId).emit('user-disconnected', { userId: userI[i].userId, name: userI[i].name });
            //update array
            userI.splice(i, 1);
        });

        socket.on('seruI', () => {
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

    socket.on('send-message', (isVC, message, room) => {

        console.log(room)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const d = new Date();
        const timeStamp = d.getDate() + " " + months[d.getMonth()] + "," + d.getHours() + ":" + d.getMinutes();
        message.ts = timeStamp;
        let newMessage = {
            message: message.message,
            name: message.name,
            ts: message.ts
        }
        console.log(newMessage)
        
        Room.findOne({roomId : room})
            .then(roomi => {
                roomi.chat.push(newMessage)
                roomi.save();
            })

        // socket.broadcast.emit('chat-message', { message: message, name: userI[i].name })
        socket.to(room).emit('receive-message', message)
    })

    socket.on('send-raise-hand', () => {
        console.log(msg[socket.id])
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('raise-hand', { userId: userI[i].userId, name: userI[i].name })
    })

    socket.on('send-glow-around', () => {
        console.log(msg[socket.id] + " glow")
        var i = userS.indexOf(socket.id);
        if (i != -1) {
            socket.broadcast.emit('glow-around', { userId: userI[i].userId, name: userI[i].name })
        }
    })

    socket.on('remove-glow-around', () => {
        console.log(msg[socket.id] + " no glow")
        var i = userS.indexOf(socket.id);
        if (i != -1) {
            socket.broadcast.emit('no-glow-around', { userId: userI[i].userId, name: userI[i].name })
        }
    })

    socket.on('send-share-screen', () => {
        console.log('screen shared')
        var i = userS.indexOf(socket.id);
        console.log(i)
        socket.broadcast.emit('share-screen', { userId: userI[i].userId, name: userI[i].name })
    })

    socket.on('remove-share-screen', () => {
        console.log("screen removed")
        var i = userS.indexOf(socket.id);
        socket.broadcast.emit('stop-share-screen', { userId: userI[i].userId, name: userI[i].name })
    })
})

const PORT = process.env.PORT || 3000;

//Server listening on port and mongoose connect
mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        server.listen(PORT);
    })
    .catch(err => {
        console.log(err);
    });