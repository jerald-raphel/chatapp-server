// Message model update

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  senderName: {
    type: String,
    required: true, // store sender's name
  },
  receiverName: {
    type: String,
    required: true, // store receiver's name
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
