const express = require('express');
const router = express.Router();
const axios = require('axios');
const { apikey } = require('../config');
const { loggedInOnly, loggedOutOnly } = require('../middlewares');
const User = require('../models/User');

function registerUser(req) {
  const { email, password, username, platform } = req.body;
  if (email && username && password && platform) {
    const userData = { email, username, password, platform };
    //use schema.create to insert data into the db
    User.create(userData)
      .then(user => {
        req.login(user);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

function getPlayerDetails(nickname) {
  const platform = 'pc' || 'xbl' || 'psn';
  const url = `https://api.fortnitetracker.com/v1/profile/${platform}/${nickname}`;

  return axios
    .get(url, { headers: { 'TRN-Api-Key': apikey } })
    .then(response => response.data)
    .catch(error => {
      console.log(error);
    });
}

function routes(passport) {
  router.post('/friends', loggedInOnly, (req, res) => {});
  router.get('/friends', loggedInOnly, (req, res) => {});
  router.delete('/friend/:id', loggedInOnly, (req, res) => {});
  router.post('/register', loggedOutOnly, (req, res) => {
    registerUser(req);
  });
  router.all('/logout', loggedInOnly, (req, res) => {
    req.logout();
  });
  router.post(
    '/login',
    loggedOutOnly,
    passport.authenticate('local'),
    (req, res) => {
      res.json({ id: req.user.id, username: req.user.username });
    }
  );

  return router;
}

module.exports = routes;
