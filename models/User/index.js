const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
  }
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
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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

const getUserById = id => User.findById(id);

const getUserByEmail = email => {
  const query = { email };
  return RegisteredUser.findOne(query);
};

const comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

const confirmUser = (user, email, password, res) => {
  bcrypt.genSalt(12, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const newRegisteredUser = new RegisteredUser({
        id: user._id,
        email,
        password: hash
      });

      newRegisteredUser
        .save()
        .then(() => {
          user.registered = true;
          user.save().then(() => {
            res.json({ success: true, msg: 'user registered' });
          });
        })
        .catch(err => {
          res.json({
            success: false,
            msg: 'failed to register user'
          });
          throw err;
        });
    });
  });
};

const addUser = (req, res) => {
  const { email, password, username, platform } = req.body;
  const newUser = new User({ username, platform });
  newUser
    .save()
    .then(user => {
      confirmUser(user, email, password, res);
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  User,
  RegisteredUser,
  getUserByEmail,
  confirmUser,
  getUserById,
  addUser,
  comparePassword
};
