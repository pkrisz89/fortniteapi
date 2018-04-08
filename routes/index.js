const express = require('express');
const router = express.Router();
const axios = require('axios');
const { apikey, secret } = require('../config');
const { loggedInOnly, loggedOutOnly } = require('../middlewares');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {
  User,
  getUserByEmail,
  addUser,
  comparePassword
} = require('../models/User');
const Friend = require('../models/Friend');

require('../passport')(passport);

function registerUser(req, res) {
  const { email, password, username, platform } = req.body;
  if (email && username && password && platform) {
    const newUser = new User({ email, username, password, platform });
    addUser(newUser, (err, user) => {
      if (err) {
        res.json({ success: false, msg: 'failed to register user' });
      } else {
        res.json({ success: true, msg: 'user registered' });
      }
    });
  }
}

// function addFriend(req, res) {
//   const { username, platform } = req.body;
//   console.log('0', username, platform);
//   if (username && platform) {
//     console.log('1');
//     const payload = { username, platform };
//     Friend.create(payload)
//       .then(friend => {
//         console.log('2');
//         console.log(friend);
//       })
//       .catch(error => console.log(error));
//   }
// }

// function getPlayerDetails(nickname, platform) {
//   //   const platform = 'pc' || 'xbl' || 'psn';
//   const url = `https://api.fortnitetracker.com/v1/profile/${platform}/${nickname}`;

//   return axios
//     .get(url, { headers: { 'TRN-Api-Key': apikey } })
//     .then(response => response.data)
//     .catch(error => {
//       console.log(error);
//     });
// }

//   router.post('/friends', loggedInOnly, (req, res) => {
//     addFriend(req, res);
//   });
//   router.get('/friends', loggedInOnly, (req, res) => {});
//   router.delete('/friend/:id', loggedInOnly, (req, res) => {});
//   router.all('/logout', loggedInOnly, (req, res) => {
//     req.logout();
//   });

router.get(
  '/someroute',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.json({ user: req.user });
  }
);

router.post('/register', loggedOutOnly, (req, res) => {
  registerUser(req, res);
});

router.post('/login', loggedOutOnly, (req, res, next) => {
  const { email, password } = req.body;

  getUserByEmail(email, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: 'user not found' });
    }
    comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user.toObject(), secret, {
          expiresIn: 604800
        }); //1 week
        res.json({ success: true, token: `JWT ${token}` });
      } else {
        res.json({ success: false, msg: 'invalid credentials' });
      }
    });
  });
});

module.exports = router;
