const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = Schema;

const FriendSchema = new Schema({
  id: ObjectId,
  username: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now()
  }
});

const Friend = mongoose.model('Friend', FriendSchema);

module.exports = Friend;
