const mongoose = require('mongoose');
const { Schema } = mongoose;
const Promise = require('bluebird');

Promise.promisifyAll(mongoose);

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
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
  },
  registered: {
    type: Boolean,
    default: false
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const RegisteredUserSchema = new Schema({
  id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  registered_on: {
    type: Date,
    default: Date.now()
  }
});

const User = mongoose.model('User', UserSchema);
const RegisteredUser = mongoose.model('RegisteredUser', RegisteredUserSchema);

module.exports = {
  User,
  RegisteredUser
};
