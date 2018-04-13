const express = require('express');
const router = express.Router();
const axios = require('axios');
const { apikey, secret } = require('../config');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {
  User,
  doesUserExist,
  getUserByEmail,
  addUser,
  comparePassword
} = require('../models/User');

require('../passport')(passport);

router.get(
  '/stats/:userid/',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    User.findById(req.params.userid)
      .then(user => {
        getPlayerStats(user.username, user.platform).then(response => {
          res.json({ response });
        });
      })
      .catch(err => {
        throw err;
      });
  }
);

router.delete(
  '/friend/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const authenticatedUser = req.user;
    const updatedFriends = authenticatedUser.friends.filter(
      friend => friend.toString() !== req.params.id
    );

    authenticatedUser
      .update({ friends: updatedFriends })
      .then(() => {
        res.json({ msg: 'friend deleted' });
      })
      .catch(err => {
        throw err;
      });
  }
);

router.get(
  '/friends',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const authenticatedUser = req.user;
    return Promise.all(
      authenticatedUser.friends.map(id =>
        User.findById(id).then(user => ({
          id: user._id,
          username: user.username,
          platform: user.platform
        }))
      )
    ).then(friends => {
      res.json({ friends });
    });
  }
);

router.get(
  '/someroute',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.json({ user: req.user });
  }
);

router.post(
  '/friends',
  passport.authenticate('jwt', { session: false }),
  (req, res, done) => {
    const { username, platform } = req.body;
    const authenticatedUser = req.user;

    if (username === authenticatedUser.username) {
      return res.json({ msg: 'You cannot add yourself.' });
    }

    doesUserExist(username).then(user => {
      if (user) {
        const alreadyFriends = authenticatedUser.friends.filter(
          friend => friend === user._id
        );

        if (alreadyFriends) {
          res.json({ msg: 'already friends' });
        } else {
          authenticatedUser
            .update({ $push: { friends: user._id } })
            .then(() => {
              res.json({ msg: 'friend added' });
            })
            .catch(err => {
              throw err;
            });
        }
      } else {
        const newUser = new User({ username, platform });
        newUser
          .save()
          .then(user => {
            authenticatedUser
              .update({ $push: { friends: user._id } })
              .then(() => {
                res.json({ msg: 'friend added' });
              })
              .catch(err => {
                throw err;
              });
          })
          .catch(err => {
            res.json({ msg: 'an error has occured' });
            throw err;
          });
      }
    });
  }
);

router.post('/register', (req, res) => {
  addUser(req, res);
});

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  getUserByEmail(email).then(user => {
    if (!user) {
      return res.json({
        success: false,
        msg: 'user not found'
      });
    } else {
      comparePassword(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          const token = jwt.sign(user.toObject(), secret, {
            expiresIn: 604800
          }); //1 week
          res.json({
            success: true,
            token: `JWT ${token}`
          });
        } else {
          res.json({
            success: false,
            msg: 'invalid credentials'
          });
        }
      });
    }
  });
});

function getPlayerStats(username, platform) {
  const url = `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`;

  return axios
    .get(url, { headers: { 'TRN-Api-Key': apikey } })
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}

module.exports = router;
