const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const { ObjectId } = Schema;

const UserSchema = new Schema({
  id: ObjectId,
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  friends: [{ type: ObjectId, ref: 'Friend' }],
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
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

const User = (module.exports = mongoose.model('User', UserSchema));

const getUserById = (id, callback) => {
  User.findById(id, callback);
};

const getUserByEmail = (email, callback) => {
  const query = { email };
  User.findOne(query, callback);
};

const addUser = (newUser, callback) => {
  bcrypt.genSalt(12, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

const comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports = {
  User,
  getUserByEmail,
  getUserById,
  addUser,
  comparePassword
};
