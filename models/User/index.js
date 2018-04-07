const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  passwordHash: {
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

UserSchema.plugin(uniqueValidator);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

UserSchema.virtual('password').set(function(value) {
  this.passwordHash = bcrypt.hashSync(value, 12);
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
