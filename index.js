const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

const { db } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

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
