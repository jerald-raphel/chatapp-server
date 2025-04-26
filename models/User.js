const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  messages: [{
    senderName: { type: String },   // Store sender name
    receiverName: { type: String }, // Store receiver name
    message: { type: String },      // Store message content
    timestamp: { type: Date },      // Store timestamp
  }],
});

module.exports = mongoose.model('User', userSchema);

