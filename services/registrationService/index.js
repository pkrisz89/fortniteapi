const bcrypt = require('bcrypt');
const { User, RegisteredUser } = require('../../models/User');
const { doesUserExist } = require('../authenticationService');

class RegistrationService {
  constructor() {
    this.confirmUser = this.confirmUser.bind(this);
  }

  confirmUser(user, email, password, res) {
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
              res.json({
                userId: user.id,
                success: true
              });
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
  }

  addUser(req, res) {
    const { email, password, username, platform } = req.body;
    const newUser = new User({ username, platform });

    doesUserExist(username)
      .then(user => {
        const isRegistered = Boolean(user && user.registered);
        const doesItExist = Boolean(user);

        if (doesItExist) {
          if (isRegistered) {
            res.json({
              msg: 'this user is already registered'
            });
          }
          this.confirmUser(user, email, password, res);
        }
        newUser.save().then(user => {
          this.confirmUser(user, email, password, res);
        });
      })
      .catch(err => {
        res.json({ msg: 'An error has occured' });
        throw err;
      });
  }
}

module.exports = new RegistrationService();
