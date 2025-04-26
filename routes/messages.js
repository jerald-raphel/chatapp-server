const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Import the Message model
const User = require('../models/User'); // Import the User model (assuming you have a User model)



router.post('/send', async (req, res) => {
  try {
    const { senderName, receiverName, message } = req.body;

    if (!senderName || !receiverName || !message) {
      return res.status(400).json({ message: 'Sender, receiver, and message are required' });
    }

    // Find users by their name
    const sender = await User.findOne({ name: senderName });
    const receiver = await User.findOne({ name: receiverName });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    // Create a new message
    const newMessage = new Message({
      senderName: sender.name,
      receiverName: receiver.name,
      message, 
      timestamp: new Date(),
    });

    // Save the new message to the Message collection
    await newMessage.save();

    // Add the message to the receiver's message array (sender's name)
    receiver.messages.push({
      senderName: sender.name, // receiver stores sender's name
      receiverName: receiver.name,
      message,
      timestamp: new Date(),
    });

    // Add the message to the sender's message array (receiver's name)
    sender.messages.push({
      senderName: sender.name,
      receiverName: receiver.name, // sender stores receiver's name
      message,
      timestamp: new Date(),
    });

    // Save the updated sender and receiver documents
    await sender.save();
    await receiver.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
});



router.get('/messages/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    const loggedInUser = await User.findOne({ name: userName }).populate({
      path: 'messages',
      populate: [
        { path: 'sender', select: 'name' }, // Populate sender's name
        { path: 'receiver', select: 'name' } // Populate receiver's name
      ]
    });

    if (!loggedInUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the messages with sender and receiver names
    const messages = loggedInUser.messages.map(message => {
      return {
        ...message.toObject(),
        senderName: message.sender.name, // Attach sender's name
        receiverName: message.receiver.name // Attach receiver's name
      };
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

router.get('/conversation/:senderName/:receiverName', async (req, res) => {
  const { senderName, receiverName } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderName, receiverName },
        { senderName: receiverName, receiverName: senderName },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp to get messages in order

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation.' });
  }
});


module.exports = router;
