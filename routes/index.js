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

router.post(
  '/friends',
  passport.authenticate('jwt', { session: false }),
  (req, res, done) => {
    console.log('blablahlasdsadasda');

    console.log('kris', req.user);
    const { username, platform } = req.body;
    doesUserExist(username).then(user => {
      if (user) {
        //grab my user id
        //check if user already exist in my friends list
        // if does not exist, then add it
        //catch the error
      } else {
        const newUser = new User({ username, platform });
        newUser
          .save()
          .then(user => {
            //grab my user id
            //check if user already exist in my friends list
            // if does not exist, then add it
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

module.exports = router;
