const express = require('express');
const router = express.Router();
const getPlayerStats = require('../services/getPlayerStats');
const {comparePassword, getUserByEmail, doesUserExist} = require('../services/authenticationService');
const {findAndDelete, getAllFriends, addFriend, addFriendAndRegister} = require('../services/friendsService');
const {addUser} = require('../services/registrationService');
const {User} = require('../models/User');
const sessionChecker = require('../middlewares');

router.get('/stats/:userid/', sessionChecker, (req, res, next) => {
  User
    .findById(req.params.userid)
    .then(user => {
      getPlayerStats(user.username, user.platform).then(response => {
        res.json({response});
      });
    })
    .catch(err => {
      res
        .status(500)
        .send('error occured!');
    });
});

router.get('/mystats', (req, res, next) => {
  User
    .findById(req.session.user.id)
    .then(user => {
      getPlayerStats(user.username, user.platform).then(response => {
        res.json({response});
      });
    })
    .catch(err => {
      res
        .status(500)
        .send('error occured!');
    });
});

router.delete('/friend/:id', sessionChecker, (req, res, next) => {
  findAndDelete(req).then(() => {
    res.json({msg: 'friend deleted'});
  }).catch(err => {
    throw err;
  });
});

router.get('/friends', sessionChecker, (req, res, next) => getAllFriends(req).then(friends => {
  res.json({friends});
}).catch(err => {
  throw err;
}));

router.post('/friends', sessionChecker, (req, res, done) => {
  const {username, platform} = req.body;

  return User
    .findById(req.session.user.id)
    .then(self => {
      doesUserExist(username).then(friend => {
        if (friend) {
          addFriend(self, friend, res);
        } else {
          addFriendAndRegister(self, username, platform, res);
        }
      });
    })
    .catch(err => {
      res.json({msg: 'an error has occured'});
      throw err;
    });
});

router.post('/register', (req, res) => {
  addUser(req, res);
});

router.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
  }
});

router.post('/login', (req, res, next) => {
  const {email, password} = req.body;

  getUserByEmail(email).then(user => {
    if (!user) {
      res
        .status(500)
        .send('Wrong username/password!');
    } else {
      comparePassword(password, user.password, (err, isMatch) => {
        if (err)
          throw err;
        if (isMatch) {
          req.session.user = user;
          res.json({success: true});
        } else {
          res
            .status(500)
            .send('Wrong username/password!');
        }
      });
    }
  });
});

module.exports = router;
