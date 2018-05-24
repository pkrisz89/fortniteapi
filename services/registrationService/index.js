const bcrypt = require('bcrypt');
const {User, RegisteredUser} = require('../../models/User');
const {doesUserExist} = require('../authenticationService');

const confirmUser = (user, email, password, res, req) => {
  bcrypt.genSalt(12, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const newRegisteredUser = new RegisteredUser({id: user._id, email, password: hash});

      newRegisteredUser
        .save()
        .then(() => {
          user.registered = true;
          user
            .save()
            .then(() => {
              req.session.user = user;
              res.json({userId: user.id, success: true});
            });
        })
        .catch(err => {
          res.json({success: false, msg: 'failed to register user'});
          throw err;
        });
    });
  });
};

const addUser = (req, res) => {
  const {email, password, username, platform} = req.body;
  const newUser = new User({username, platform});

  doesUserExist(username).then(user => {
    const isRegistered = Boolean(user && user.registered);
    const doesItExist = Boolean(user);
    if (doesItExist) {
      if (isRegistered) {
        res.json({msg: 'this user is already registered'});
      }

      confirmUser(user, email, password, res, req);
    }
    newUser
      .save()
      .then(user => {
        confirmUser(user, email, password, res, req);
      });
  }).catch(err => {
    res.json({msg: 'An error has occured'});
    throw err;
  });
};

module.exports = {
  confirmUser,
  addUser
};
