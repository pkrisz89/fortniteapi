const express = require('express');
const router = express.Router();
const getPlayerStats = require('../services/getPlayerStats');

const {
  User,
  doesUserExist,
  getUserByEmail,
  addUser,
  comparePassword
} = require('../models/User');
const sessionChecker = require('../middlewares');

router.get('/stats/:userid/', sessionChecker, (req, res, next) => {
  User.findById(req.params.userid)
    .then(user => {
      getPlayerStats(user.username, user.platform).then(response => {
        res.json({ response });
      });
    })
    .catch(err => {
      res.status(500).send('error occured!');
    });
});

router.delete('/friend/:id', sessionChecker, (req, res, next) => {
  User.findById(req.session.user.id)
    .then(user =>
      user.friends.filter(friend => friend.toString() !== req.params.id)
    )
    .then(updatedFriends => User.update({ friends: updatedFriends }))
    .then(() => {
      res.json({ msg: 'friend deleted' });
    })
    .catch(err => {
      throw err;
    });
});

router.get('/friends', sessionChecker, (req, res, next) =>
  User.findById(req.session.user.id)
    .then(user =>
      Promise.all(
        user.friends.map(id =>
          User.findById(id).then(user => ({
            id: user._id,
            username: user.username,
            platform: user.platform
          }))
        )
      )
    )
    .then(friends => {
      res.json({ friends });
    })
    .catch(err => {
      throw err;
    })
);

router.post('/friends', sessionChecker, (req, res, done) => {
  const { username, platform } = req.body;

  const authenticatedUser = User.findById(req.session.user.id);

  if (username === req.session.user.username) {
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
});

router.post('/register', (req, res) => {
  addUser(req, res);
});

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  getUserByEmail(email).then(user => {
    if (!user) {
      res.status(500).send('Wrong username/password!');
    } else {
      comparePassword(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.user = user;
          res.json({ success: true });
        } else {
          res.status(500).send('Wrong username/password!');
        }
      });
    }
  });
});

module.exports = router;
