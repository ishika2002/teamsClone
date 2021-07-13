const express = require('express');
const webController = require('../controllers/web');
const router = express.Router();
const isAuth = require('../middlewares/is-auth');
const roomController = require('../controllers/room');
const Room = require('../models/room');

// router.get('/dashboard', isAuth, webController.getDashboard);

// router.get('/create', (req, res) => {
//     // res.redirect(`/${uuidV4()}`)
// })

router.get('/chat', isAuth, (req, res) => {
    let msg = req.query.msg || '';
    let us = req.session.user;
    res.render('chat', {
        isRoom: false,
        user: {
            name: us.name,
            email: us.email,
            username: us.username
        },
        rooms: us.rooms,
        msg: msg
    })
})

router.get('/chat/:room', isAuth, (req, res) => {
    let us = req.session.user;
    let rid = req.params.room;
    Room.findOne({roomId: rid}).then((room) => {
        let dt = {
            isRoom: true,
            roomId: rid,
            user: {
                name: us.name,
                email: us.email,
                username: us.username
            },
            rooms: us.rooms,
            msg: ''
        };
        if(room.chat){
            dt.chats = room.chat;
        }
        res.render('chat', dt)
    });
})

router.get('/:room', isAuth, (req, res) => {
    let us = req.session.user;
    res.render('room', { roomId: req.params.room, 
        user: {
            name: us.name,
            email: us.email,
            username: us.username
        },
    })
})

router.post('/room-create', isAuth, roomController.addRoom);
router.post('/room-join', isAuth, roomController.joinRoom);
router.get('/room-join/:id', isAuth, roomController.joinRoom);
//test
router.post('/chat-join', isAuth, roomController.joinRoom);

module.exports = router;