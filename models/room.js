const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Chat = require('./chat.js');

const chat = new Schema({
    message: String,
    name: String,
    ts: String
});

const rooms = new Schema({
    roomName: String,
    roomId: {
        type: String,
        required: true
    },
    // chat: [Chat]
    chat: [chat]
});

module.exports = mongoose.model('Room', rooms);