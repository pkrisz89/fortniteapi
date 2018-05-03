const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const { secret } = require('./config');

const { db } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.use(
  session({
    key: 'user_sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000
    }
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

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

app.use('/', require('./routes'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
