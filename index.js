const express = require('express');
const bodyParser = require('body-parser');

const expressSession = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const mongoose = require('mongoose');

const { db } = require('./config');
const User = require('./models/User');

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser((userId, done) => {
  User.findById(userId, (err, user) => done(err, user));
});
app.use(
  expressSession({
    resave: false,
    saveUninitialized: true,
    secret:
      process.env.SESSION_SEC || 'You must generate a random session secret'
  })
);
app.use((req, res, next) => {
  if (mongoose.connection.readyState) next();
  else {
    const mongoUrl = process.env.MONGO_URL || db;
    mongoose
      .connect(mongoUrl)
      .then(() => {
        console.log('connected to database', mongoUrl);
        next();
      })
      .catch(err => console.error(`Mongoose Error: ${err.stack}`));
  }
});

const local = new Strategy((username, password, done) => {
  User.findOne({ username })
    .then(user => {
      if (!user || !user.validPassword(password)) {
        done(null, false, { message: 'Invalid username/password' });
      } else {
        done(null, user);
      }
    })
    .catch(e => done(e));
});
passport.use('local', local);

app.use('/', require('./routes')(passport));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
