const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const chat = new Schema({
    message: String,
    name: String,
    ts: String
});

module.exports = chat;
