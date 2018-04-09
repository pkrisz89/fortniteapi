const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;
const { ObjectId } = Schema;

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
    type: ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  friends: [{ type: ObjectId, ref: 'User', unique: true }],
  password: {
    type: String,
    required: true
  },
  registered_on: {
    type: Date,
    default: Date.now()
  }
});

const User = (module.exports = mongoose.model('User', UserSchema));
const RegisteredUser = (module.exports = mongoose.model(
  'RegisteredUser',
  RegisteredUserSchema
));

const getUserById = (id, callback) => {
  User.findById(id, callback);
};

const getUserByEmail = (email, callback) => {
  const query = { email };
  RegisteredUser.findOne(query, callback);
};

const comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

const confirmUser = (id, email, password, res) => {
  getUserById(id, (err, user) => {
    if (err) throw err;
    if (user) {
      bcrypt.genSalt(12, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          const newRegisteredUser = new RegisteredUser({
            id: user._id,
            email,
            password: hash
          });

          newRegisteredUser.save((err, succ) => {
            if (err) {
              res.json({
                success: false,
                msg: 'failed to register user'
              });
              throw err;
            } else {
              user.registered = true;
              user.save((err, success) => {
                if (err) {
                  throw err;
                } else {
                  res.json({
                    success: true,
                    msg: 'user registered'
                  });
                }
              });
            }
          });
        });
      });
    }
  });
};

const addUser = (req, res) => {
  const { email, password, username, platform } = req.body;
  const newUser = new User({ username, platform });
  newUser.save((err, user) => {
    if (err) throw err;

    getUserById(user._id, (err, addedUser) => {
      if (err) throw err;
      confirmUser(addedUser._id, email, password, res);
    });
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
