const Room = require('../models/room');
const User = require('../models/user');
const { v4: uuidV4 } = require('uuid');


exports.addRoom = (req, res) => {
    const roomId = uuidV4();
    const roomName = req.body.roomName;

    Room.findOne({ roomId: roomId })
        .then(room => {
            if (room) {
                return res.redirect('/chat?msg=Room Exist');
            }
            const newRoom = new Room({
                roomId: roomId,
                roomName: roomName
            });
            return newRoom.save();
        }).then(async result => {
            if (result) {
                // console.log(req.session.user);
                req.session.user.rooms[roomId] = roomName;
                await User.updateOne({_id: req.session.user._id}, {rooms: req.session.user.rooms});
                res.redirect('/chat?msg=Room Created');
            }
        }).catch(err => {
            res.redirect('/chat?msg=Something Went Wrong!');
            console.error(err);
        });
};

exports.joinRoom = (req, res) => {
    var roomId;
    if(req.body.roomId){
        roomId = req.body.roomId;
    }else if(req.params.id){
        roomId = req.params.id;
    }else{
        res.redirect('/chat?msg=No room id')
    }

    Room.findOne({ roomId: roomId })
        .then(async room => {
            if (!room) {
                return res.redirect('/chat?msg=Room Id Not Found !');
            }
            let uR = Object.keys(req.session.user.rooms);
            if(uR.includes(roomId)){
                return res.redirect('/chat?msg=Room already Joined');
            }
            req.session.user.rooms[room.roomId] = room.roomName;
            await User.updateOne({_id: req.session.user._id}, {rooms: req.session.user.rooms});
            return res.status(302).redirect('/chat?msg=Room Joined');
        }).catch(err => {
            res.redirect('/chat?msg=Something Went Wrong!');
            console.error(err);
        });
};

//test
exports.chatInput = (req, res) => {
    var roomId;
    if(req.body.roomId){
        roomId = req.body.roomId;
    }else if(req.params.id){
        roomId = req.params.id;
    }else{
        res.redirect('/chat?msg=No room id')
    }

    Room.findOne({ roomId: roomId })
        .then(async room => {
            if (!room) {
                return res.redirect('/chat?msg=Room Id Not Found !');
            }
            let uR = Object.keys(req.session.user.rooms);
            if(uR.includes(roomId)){
                return res.redirect('/chat?msg=Room already Joined');
            }
            req.session.user.rooms[room.roomId] = room.roomName;
            await User.updateOne({_id: req.session.user._id}, {rooms: req.session.user.rooms});
            return res.status(302).redirect('/chat?msg=Room Joined');
        }).catch(err => {
            res.redirect('/chat?msg=Something Went Wrong!');
            console.error(err);
        });
};